import { createReadFileTool } from "./read-file";
import { createListDirectoryTool } from "./list-directory";
import { createWriteFileTool } from "./write-file";
import { createEditFileTool } from "./edit-file";
import { createGrepTool } from "./grep";
import { createGlobTool } from "./glob";
import { createBashTool } from "./bash";
import type { ToolDecision } from "../lib/query-evaluator";


export function createTools(cwd: string, decision: ToolDecision) {
    const readOnlyTools = {
        readFile : createReadFileTool(cwd),
        listDirectory: createListDirectoryTool(cwd),
        grep: createGrepTool(cwd),
        glob: createGlobTool(cwd),
    }

    if (decision === "read-only") {
        return readOnlyTools;
    }

    return {
        ...readOnlyTools,
        writeFile: createWriteFileTool(cwd),
        editFile: createEditFileTool(cwd),
        bash: createBashTool(cwd),
    }
}