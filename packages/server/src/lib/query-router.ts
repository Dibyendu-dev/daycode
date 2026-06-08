import { generateObject } from "ai";
import { z } from "zod";
import { resolveChatModel } from "./model";

const intentSchema = z.object({
  intent: z.enum(["general", "read", "write", "update"]),
  reasoning: z.string(),
});

export type QueryIntent = z.infer<typeof intentSchema>;

const ROUTER_MODEL_ID = "gpt-5.4-nano";

export async function classifyIntent(message: string): Promise<QueryIntent> {
  const resolved = resolveChatModel(ROUTER_MODEL_ID);
  const { object } = await generateObject({
    model: resolved.model,
    schema: intentSchema,
    system: `You are a query classifier for a coding assistant.
Classify the user's query into one of these intents:
- "general": General knowledge, conversation, greetings, creative writing, explanations that don't need code context
- "read": Needs to read, analyze, or search the project's codebase
- "write": Needs to create new files or implement new features
- "update": Needs to modify, fix bugs, refactor, or edit existing code

Respond with JSON matching the schema.`,
    messages: [{ role: "user", content: message }],
  });

  return object;
}
