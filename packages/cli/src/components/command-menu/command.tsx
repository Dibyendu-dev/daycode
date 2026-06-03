import { SessionDialogContent } from "../dialogs/session.dialog";
import { ThemeDialogContent } from "../dialogs/theme.dialog";
import type { Command } from "./types";

export const COMMANDS: Command[] = [
    {
        name: "new",
        description: "Create a new project",
        value : "/new",
        action: async (ctx) => {
            ctx.toast.show({message: "Creating a new project...",variant: "info"});
        }
    },
    {
        name: "agents",
        description: "List available agents",
        value: "/agents",
        action: (ctx) => {
            ctx.dialog.openDialog({
                title: "select an agent",
                children: <text> Agent selection coming soon...</text>
            });
        }
    },
    {
        name: "models",
        description: "List available models",
        value: "/models",
        action: (ctx) => {
            ctx.dialog.openDialog({
                title: "select a model",
                children: <text> Model selection coming soon...</text>
            });
        }
    },
    {
        name: "session",
        description: "Restore previous session",
        value: "/session",
         action: (ctx) => {
            ctx.dialog.openDialog({
                title: "Sessions",
                children: <SessionDialogContent />
            })
        }
    },
    {
        name: "theme",
        description: "Change the theme of the application",
        value: "/theme",
        action: (ctx) => {
            ctx.dialog.openDialog({
                title: "Select Theme",
                children: <ThemeDialogContent />
            })
        }
    },
    {
        name: "login",
        description: "sign in to your account",
        value: "/login",
        action: async (ctx) => {
            ctx.toast.show({message: "Signing in...",variant: "info"});
        }
    },
    
    {
        name: "logout",
        description: "Logout from current account",
        value: "/logout",
        action: async (ctx) => {
            ctx.toast.show({message: "Logging out...",variant: "error"});
        }
    },
    {
        name: "upgrade",
        description: "Buy more credits to continue using the service",
        value: "/upgrade",
        action: async (ctx) => {
            ctx.toast.show({message: "Opening upgrade portal...",variant: "info"});
        }
    },
    {
        name: "usage",
        description: "open billing portal in your browser",
        value: "/usage",
        action: async (ctx) => {
            ctx.toast.show({message: "Opening billing portal...",variant: "info"});
        }
    },
    {
        name: "exit",
        description: "Exit the application",
        value: "/exit",
        action: (ctx) =>{
            ctx.exit();
            ctx.toast.show({message: "Exiting application...",variant: "error"});
        },
    },
] 