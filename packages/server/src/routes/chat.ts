import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { streamText as aiStreamText, stepCountIs } from "ai";
import { db } from "@daycode/database";
import { Mode, MessageStatus } from "@daycode/database";
import type { Prisma } from "@daycode/database";
import {
  type chatStreamEvent,
  type MessagePart,
  toolCallargsSchema,
  messagePartsSchema,
} from "@daycode/shared";
import { isSupportedChatModel, resolveChatModel } from "../lib/model";
import { classifyIntent } from "../lib/query-router";
import { evaluateTools, type ToolDecision } from "../lib/query-evaluator";
import { createTools } from "../tools";
import { buildSystemPrompts } from "../system-prompt";
import type { AuthenticatedEnv } from "../middleware/require-auth";


const submitSchema = z.object({
  content: z.string(),
  mode: z.enum(Mode),
  model: z.string().refine(isSupportedChatModel, "unsupported model"),
});

const submitValidator = zValidator("json", submitSchema, (result, c) => {
  if (!result.success) {
    return c.json({ error: "Invalid request body" }, 400);
  }
});

const activeSeesionResumeIds = new Set<string>();

// strip error message and empty assistant messages from the conversarion
function buildConversationHistory(
  messages: {
    role: "USER" | "ASSISTANT" | "ERROR";
    content: string;
    status: MessageStatus;
  }[],
) {
  return messages.flatMap((m) => {
    if (m.role === "ERROR") return [];
    if (m.role === "ASSISTANT" && m.content.length === 0) return [];
    return [
      {
        role: m.role === "USER" ? ("user" as const) : ("assistant" as const),
        content: m.content,
      },
    ];
  });
}

function getResumableUserMessage(
  messages: {
    role: "USER" | "ASSISTANT" | "ERROR";
    content: string;
    model: string;
    mode: Mode;
  }[],
) {
  const lastMessage = messages[messages.length - 1];
  if (!lastMessage || lastMessage.role !== "USER") return null;
  if (!isSupportedChatModel(lastMessage.model)) return null;
  return lastMessage;
}

type StreamParams = {
  sessionId: string;
  model: string;
  cwd: string | null;
  history: { role: "user" | "assistant"; content: string }[];
  mode: Mode;
  abortController: AbortController;
  tools: Parameters<typeof aiStreamText>[0]["tools"];
  hasTools: boolean;
};

async function streamAIResponse(
  stream: Parameters<Parameters<typeof streamSSE>[1]>[0],
  params: StreamParams,
) {
  const { sessionId, model, cwd, history, mode, abortController, tools, hasTools } = params;
  const startTime = Date.now();
  const parts: MessagePart[] = [];
  const resolvedModel = resolveChatModel(model);

  const persistInterruptedMessage = async () => {
    const fullText = parts
      .filter((p) => p.type === "text")
      .map((p) => p.text)
      .join("");

    if (fullText.length === 0 && parts.length === 0) return;

    const elapsedMs = Date.now() - startTime;

    const validatedParts: Prisma.InputJsonValue | undefined =
      parts.length > 0
        ? (messagePartsSchema.parse(parts) as Prisma.InputJsonValue)
        : undefined;

    await db.message.create({
      data: {
        sessionId,
        role: "ASSISTANT",
        status: MessageStatus.INTERRUPTED,
        model,
        content: fullText,
        parts: validatedParts,
        mode,
        duration: Math.round(elapsedMs / 1000),
      },
    });
  };

  try {
    const result = aiStreamText({
      model: resolvedModel.model,
      system: buildSystemPrompts({cwd, mode, hasTools}),
      messages: history,
      tools,
      stopWhen: tools ? stepCountIs(50) : undefined,
      abortSignal: abortController.signal,
      providerOptions: resolvedModel.providerOptions,
    });

    for await (const part of result.fullStream) {
      if (stream.aborted) break;

      if (part.type === "reasoning-delta") {
        const last = parts[parts.length - 1];
        if (last && last.type === "reasoning") {
          last.text += part.text;
        } else {
          parts.push({ type: "reasoning", text: part.text });
        }
        const event: chatStreamEvent = {
          type: "reasoning-delta",
          text: part.text,
        };
        await stream.writeSSE({
          event: "reasoning-delta",
          data: JSON.stringify(event),
        });
      }

      if (part.type === "text-delta") {
        const last = parts[parts.length - 1];
        if (last && last.type === "text") {
          last.text += part.text;
        } else {
          parts.push({ type: "text", text: part.text });
        }
        const event: chatStreamEvent = { type: "text-delta", text: part.text };
        await stream.writeSSE({
          event: "text-delta",
          data: JSON.stringify(event),
        });
      }

      if (part.type === "tool-call") {
        const args = toolCallargsSchema.parse(part.input);
        parts.push({
          type: "tool-call",
          id: part.toolCallId,
          name: part.toolName,
          args,
        });

        const event: chatStreamEvent = {
          type: "tool-call",
          toolCallId: part.toolCallId,
          toolName: part.toolName,
          args,
        };
        await stream.writeSSE({
          event: "tool-call",
          data: JSON.stringify(event),
        });
      }

      if (part.type === "tool-result") {
        const resultStr =
          typeof part.output === "string"
            ? part.output
            : (JSON.stringify(part.output) ?? "null");

          const tcPart = parts.find(
            (p):p is Extract<MessagePart, {type: "tool-call"}>=>
              p.type === "tool-call" && p.id === part.toolCallId
          )

          if (tcPart) {
            tcPart.result = resultStr
          }
          const event: chatStreamEvent = {
          type: "tool-result",
          toolCallId: part.toolCallId,
          result: resultStr,
        };

         await stream.writeSSE({
          event: "tool-result",
          data: JSON.stringify(event),
        });
      }

      if (part.type === "error") {
        throw part.error;
      }
    }

    if (stream.aborted || abortController.signal.aborted) {
      await persistInterruptedMessage();
      return;
    }

    const elapsedMs = Date.now() - startTime;

    const fullText = parts
      .filter((p) => p.type === "text")
      .map((p) => p.text)
      .join("");

    const validatedParts: Prisma.InputJsonValue | undefined =
      parts.length > 0
        ? (messagePartsSchema.parse(parts) as Prisma.InputJsonValue)
        : undefined;

    const assistantMessage = await db.message.create({
      data: {
        sessionId,
        role: "ASSISTANT",
        status: MessageStatus.COMPLETE,
        model,
        content: fullText,
        parts: validatedParts,
        mode,
        duration: Math.round(elapsedMs / 1000),
      },
    });

    const doneEvent: chatStreamEvent = {
      type: "done",
      toolCallId: assistantMessage.id,
      durationMs: elapsedMs,
    };

    await stream.writeSSE({ event: "done", data: JSON.stringify(doneEvent) });
  } catch (error) {
    if (abortController.signal.aborted) {
      await persistInterruptedMessage();
      return;
    }

    const message = error instanceof Error ? error.message : String(error);

    await db.message.create({
      data: {
        sessionId,
        role: "ERROR",
        status: MessageStatus.COMPLETE,
        model,
        content: message,
        mode,
      },
    });
    const errorEvent: chatStreamEvent = { type: "error", message };
    await stream.writeSSE({ event: "error", data: JSON.stringify(errorEvent) });
  }
}

const app = new Hono<AuthenticatedEnv>()
  .post("/:sessionId/resume", async (c) => {
    const sessionId = c.req.param("sessionId");
    const userId = c.get("userId");
    if (!sessionId) {
      return c.json({ error: "session id missing" }, 400);
    }
    const session = await db.session.findUnique({
      where: { id: sessionId, userId },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });
    if (!session) {
      return c.json({ error: "session is missing" }, 400);
    }

    const resumableMessage = getResumableUserMessage(session.messages);
    if (!resumableMessage) {
      return c.json(
        { error: "session is no pending user message to resume" },
        409,
      );
    }

    if (!isSupportedChatModel(resumableMessage.model)) {
      return c.json(
        { error: `session uses unsupported model ${resumableMessage.model}` },
        409,
      );
    }

    if (activeSeesionResumeIds.has(sessionId)) {
      return c.json({ error: "session is already being resumed" }, 409);
    }
    activeSeesionResumeIds.add(sessionId);

    let toolDecision: ToolDecision;
    try {
      const intent = await classifyIntent(resumableMessage.content);
      toolDecision = evaluateTools(intent.intent, resumableMessage.mode);
    } catch {
      toolDecision = "full";
    }

    const tools =
      session.cwd && toolDecision !== "none"
        ? createTools(session.cwd, toolDecision)
        : undefined;

    const history = buildConversationHistory(session.messages);
    const abortController = new AbortController();

    try {
      return streamSSE(
        c,
        async (stream) => {
          stream.onAbort(() => {
            abortController.abort();
          });

          try {
            await streamAIResponse(stream, {
              sessionId,
              model: resumableMessage.model,
              cwd: session.cwd,
              history,
              mode: resumableMessage.mode,
              abortController,
              tools,
              hasTools: !!tools,
            });
          } finally {
            activeSeesionResumeIds.delete(sessionId);
          }
        },
        async (err, stream) => {
          const message = err instanceof Error ? err.message : String(err);
          const errorEvent: chatStreamEvent = { type: "error", message };
          await stream.writeSSE({
            event: "error",
            data: JSON.stringify(errorEvent),
          });
        },
      );
    } catch (error) {
      activeSeesionResumeIds.delete(sessionId);
      const message = error instanceof Error ? error.message : String(error);
      return c.json({ error: message }, 500);
    }
  })
  .post("/:sessionId", submitValidator, async (c) => {
    const sessionId = c.req.param("sessionId");
    const userId = c.get("userId");

    if (!sessionId) {
      return c.json({ error: "session id missing" }, 400);
    }

    const session = await db.session.findUnique({
      where: { id: sessionId, userId },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });
    if (!session) {
      return c.json({ error: "session not found" }, 404);
    }

    const data = c.req.valid("json");

    await db.message.create({
      data: {
        sessionId,
        role: "USER",
        status: MessageStatus.COMPLETE,
        model: data.model,
        content: data.content,
        mode: data.mode,
      },
    });

    let toolDecision: ToolDecision;
    try {
      const intent = await classifyIntent(data.content);
      toolDecision = evaluateTools(intent.intent, data.mode);
    } catch {
      toolDecision = "full";
    }

    const tools =
      session.cwd && toolDecision !== "none"
        ? createTools(session.cwd, toolDecision)
        : undefined;

    const history = buildConversationHistory([
      ...session.messages,
      {
        role: "USER" as const,
        content: data.content,
        status: MessageStatus.COMPLETE,
      },
    ]);

    const abortController = new AbortController();

    return streamSSE(
      c,
      async (stream) => {
        stream.onAbort(() => {
          abortController.abort();
        });

        await streamAIResponse(stream, {
          sessionId,
          model: data.model,
          cwd: session.cwd,
          history,
          mode: data.mode,
          abortController,
          tools,
          hasTools: !!tools,
        });
      },
      async (err, stream) => {
        const message = err instanceof Error ? err.message : String(err);
        const errorEvent: chatStreamEvent = { type: "error", message };
        await stream.writeSSE({
          event: "error",
          data: JSON.stringify(errorEvent),
        });
      },
    );
  });

export default app;
