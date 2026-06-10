import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z} from "zod";
import {
  convertToModelMessages,
  streamText,
  validateUIMessages,
  type InferUITools,
  type LanguageModelUsage,
  type UIMessage,
} from "ai";
import { db } from "@daycode/database/client";
import type { Prisma } from "@daycode/database";
import {
  getToolContracts,
  modeSchema,
  type ModeType,
  type ToolContracts,
} from "@daycode/shared";
import { buildSystemPrompts } from "../system-prompt";
import type { AuthenticatedEnv } from "../middleware/require-auth";
import { isSupportedChatModel, resolveChatModel } from "../lib/model";
import { error } from "console";

type ChatMessageMetadata = {
  mode?: ModeType;
  model?: string;
  duration?: number;
}

type DaycodeUIMessage = UIMessage<ChatMessageMetadata, never, InferUITools<ToolContracts>>;

const submitSchema = z.object({
  id: z.string(),
  messages: z
    .array(
      z.custom<DaycodeUIMessage>((value) => {
        return value !== null && typeof value === "object" && "id" in value && "parts" in value;
      })
    )
    .min(1),
    mode: modeSchema,
    model: z.string().refine(isSupportedChatModel, "unsupported model"),
})

const submitValidator = zValidator("json", submitSchema, (result,c) => {
  if(!result.success) {
    return c.json({ error: "invalid request body"}, 400);
  }
})

function hasPendingToolCalls(message: DaycodeUIMessage) {
  return message.parts.some((part) => {
    if (part.type === "dynamic-tool" || part.type.startsWith("tool-")) {
      const state =(part as { state?: string}).state;
      return state !== "output-available" && state !== "output-error";
    }
    return false;
  })
};

const app = new Hono<AuthenticatedEnv>()
    .post(
      "/",
      submitValidator,
      async (c)=> {
        const userId = c.get("userId");
        const { id, messages, mode, model} = c.req.valid("json");

        const session = await db.session.findUnique({
          where : { id, userId},
        });
        if(!session){
          return c.json({error: "session not found"}, 404);
        }

        const startTime = Date.now();
        const tools = getToolContracts(mode);
        const resolvedModel = resolveChatModel(model);
        const previousMessages = Array.isArray(session.messages)
          ? (session.messages as unknown as DaycodeUIMessage[])
          : []

        const mergedMessages = [...previousMessages];

        for(const message of messages) {
          const incomingMessage = {
            ...message,
            metadata: { ...message.metadata, mode, model},
          } satisfies DaycodeUIMessage;

          const exsistingMessageIndex = mergedMessages.findIndex((m) =>m.id === incomingMessage.id);
          if (exsistingMessageIndex === -1){
            mergedMessages.push(incomingMessage);
          }else {
            mergedMessages[exsistingMessageIndex] = incomingMessage;
          }
        }

        const nextMessages = await validateUIMessages<DaycodeUIMessage>({
          messages: mergedMessages,
          tools,       
        });

        const modelMessages =await convertToModelMessages(nextMessages, {tools});
        const result = streamText({
          model: resolvedModel.model,
          system: buildSystemPrompts({mode}),
          messages: modelMessages,
          tools,
          providerOptions: resolvedModel.providerOptions,
        })
        return result.toUIMessageStreamResponse<DaycodeUIMessage>({
          originalMessages: nextMessages,
          messageMetadata({part}) {
            if(part.type === "start"){
              return { mode, model}
            }
            if (part.type !== "finish") return undefined;

            return {
              mode,
              model,
              durationMs: Date.now()- startTime,
            }
          }
        })
      }
    )