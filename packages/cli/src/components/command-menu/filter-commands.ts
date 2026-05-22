import type { Command } from "./types";
import { COMMANDS } from "./command";

export const getFilteredCommands = ( query: string): Command[] => {
    if(!query) return COMMANDS; 
    return COMMANDS.filter(cmd => cmd.name.toLowerCase().startsWith(query.toLowerCase()));
}