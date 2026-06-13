import { z } from "zod";
import { tool } from "ai";

export const Mode = {
  BUILD: "BUILD",
  PLAN: "PLAN",
} as const;

export const modeSchema = z.enum([Mode.BUILD, Mode.PLAN]);

export type ModeType = (typeof Mode)[keyof typeof Mode];

export const toolInputSchemas = {
  readFile: z.object({
    path: z.string().describe("Relative path to the file to read"),
  }),
  listDirectory: z.object({
    path: z
      .string()
      .describe("Relative path to directory to list (defaults to project root)")
      .default("."),
  }),
  glob: z.object({
    pattern: z
      .string()
      .describe("Glob pattern to match (e.g. '**/*.ts', 'arc/**/*.ts') "),
    path: z
      .string()
      .describe("Relative directory to search in (default to project root) ")
      .default("."),
  }),
  grep: z.object({
    pattern: z.string().describe("Regex pattern to search for "),
    path: z
      .string()
      .describe("Relative directory to search in (default to project root) ")
      .default("."),
    include: z
      .string()
      .describe("Glob pattern to filter files (e.g '*.ts', '*.tsx')")
      .optional(),
  }),
  writeFile: z.object({
    path: z.string().describe("Relative path to the file to write"),
    content: z.string().describe("The full content to write to the file "),
  }),
  editFile: z.object({
    path: z.string().describe("Relative path to the file to edit"),
    oldString: z
      .string()
      .describe(
        "The exact text to find and replace (must be unique in the file) ",
      ),
    newString: z.string().describe("The text to replace it with"),
  }),
  bash: z.object({
    command: z.string().describe("The shell command to execute"),
    timeout: z
      .number()
      .describe("Timeout in milliseconds (default:30000)")
      .optional(),
  }),
} as const;

export const readOnlyToolContracts = {
  readFile: tool({
    description: "Read a file from current project directory.",
    inputSchema: toolInputSchemas.readFile,
  }),
  listDirectory: tool({
    description:
      "List files and directories in a project directory. Returns name with type indicators.",
    inputSchema: toolInputSchemas.listDirectory,
  }),
  glob: tool({
    description:
      "Find files matching a glob pattern. Returns file paths relative to the project root. Skip node_modules and hidden directories.",
    inputSchema: toolInputSchemas.glob,
  }),
  grep: tool({
    description:
      "Search file contents using regex pattern. Returns matching lines with paths and line numbers. Skips hidden directories , node_modules and binary files.",
    inputSchema: toolInputSchemas.grep,
  }),
} as const;

export const buildToolContracts = {
  ...readOnlyToolContracts,
  writeFile: tool({
    description:
      " Create or overwrite a file in the project. Creates parent directories if they don't exist",
    inputSchema: toolInputSchemas.writeFile,
  }),
  editFile: tool({
    description:
      " Make a targeted edit to a file by replacing an exact string match. the oldString must appear exactly once in the file (for safety), Use this for surgical edits instead of rewriting entire files .",
    inputSchema: toolInputSchemas.editFile,
  }),
  bash: tool({
    description:
      " Execute a shell command in the project directory. Use this for running tests, build, git operations package installs, and any other shell commands",
    inputSchema: toolInputSchemas.bash,
  }),
} as const ;

export type ToolContracts = typeof buildToolContracts;

export function getToolContracts(mode: ModeType) {
  return mode === Mode.PLAN
    ? readOnlyToolContracts
    : buildToolContracts
};