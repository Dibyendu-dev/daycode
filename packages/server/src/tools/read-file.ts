import { resolve, relative} from "path";
import { readFile} from "fs/promises";
import { tool} from "ai";
import  { z} from "zod";
import { sep } from "path";

const MAX_FILE_SIZE= 10_000;


export function createReadFileTool(cwd: string) {
  const normalizedCwd = cwd.endsWith(sep) ? cwd : cwd + sep;
  return tool({
    description: ` Read the contents of a file in the project. Returns the file text,
     truncated if very large.`,
    inputSchema: z.object({
      path: z.string().describe("Relative path to the file to read" ),    
    }),
    execute: async ({ path}) => {
      const resolved = resolve(cwd, path);
      const rel = relative(cwd, resolved)

      if (rel.startsWith("..") || (resolve(resolved) !== resolved && rel.startsWith(".."))){
        return { error: "Path is outside the project directory"}
      }

      // ensure resolved path is still within cwd
       if (rel.startsWith("..") || !resolved.startsWith(normalizedCwd)) {
        return { error: "Path is outside the project directory"}
      }
      try {
        const content = await readFile(resolved, "utf-8");
        if (content.length > MAX_FILE_SIZE){
          return {
            content: content.slice(0, MAX_FILE_SIZE),
            truncated: true,
            totalLength: content.length,
          }
        }
        return { content};
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { error: `Failed to read file: ${message}` };
      }
    },
  });
}
