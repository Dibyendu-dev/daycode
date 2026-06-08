import type { Mode } from "@daycode/database/enums";
import type { QueryIntent } from "./query-router";

export type ToolDecision = "none" | "read-only" | "full";

export function evaluateTools(
  intent: QueryIntent["intent"],
  mode: Mode,
): ToolDecision {
  switch (intent) {
    case "general":
      return "none";
    case "read":
      return "read-only";
    case "write":
    case "update":
      return mode === "PLAN" ? "read-only" : "full";
  }
}
