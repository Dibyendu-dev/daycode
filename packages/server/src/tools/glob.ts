import { tool } from "ai";
import { z } from "zod";
import { resolve, relative } from "path";

const MAX_Results = 200;


export function createGlobTool(cwd: string) {
  return tool({
    description: ` Find files matching a glob pattern. Returns file paths relative to the project
    root. Skip node_modules and hidden directories.  `,
    inputSchema: z.object({
      pattern: z.string().describe("Glob pattern to match (e.g. '**/*.ts', 'arc/**/*.ts') " ),
      path: z
        .string()
        .describe("Relative directory to search in (default to project root) ")
        .default("."),
    }),
    execute: async ({ pattern, path}) => {
      const resolved = resolve(cwd, path);

      if (!resolved.startsWith(cwd)) {
        return { error: "Path is outside the project directory" };
      }
      try {
        const glob = new Bun.Glob(pattern);
        const files: string[] = [];
        let truncate = false;

        for await (const match of glob.scan({
          cwd: resolved,
          dot: false,
          onlyFiles: true,
        })){
          // skip node-modules matches
          if (match.includes("node_modules")) continue;

          if (files.length >= MAX_Results) {
            truncate = true;
            break;
          }
          // return paths relative to project root
          const absoluteMatch = resolve(resolved, match);
          files.push(relative(cwd,absoluteMatch))

        }

        files.sort();

        return {
          files,
          ...(truncate ? { truncate : true}: {})
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { error: `Failed to execute command: ${message}` };
      }
    },
  });
}
