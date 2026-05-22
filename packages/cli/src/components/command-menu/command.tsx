import type { Command } from "./types";

export const COMMANDS: Command[] = [
    {
        name: "new",
        description: "Create a new project",
        value : "/new",
    },
    {
        name: "agents",
        description: "List available agents",
        value: "/agents",
    },
    {
        name: "models",
        description: "List available models",
        value: "/models",
    },
    {
        name: "session",
        description: "Restore previous session",
        value: "/session",
    },
    {
        name: "theme",
        description: "Change the theme of the application",
        value: "/theme",
    },
    {
        name: "login",
        description: "sign in to your account",
        value: "/login",
    },
    
    {
        name: "logout",
        description: "Logout from current account",
        value: "/logout",
    },
    {
        name: "uograde",
        description: "Buy more credits to continue using the service",
        value: "/upgrade",
    },
    {
        name: "usage",
        description: "open billing poprtal in your browser",
        value: "/usage",
    },
    {
        name: "exit",
        description: "Exit the application",
        value: "/exit",
        action: (ctx) =>{
            ctx.exit();
        },
    },
] 