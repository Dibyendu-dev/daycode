import { SUPPORTED_CHAT_MODELS } from "@daycode/shared";
import { ModelDialogContent } from "../dialogs";
import { AgentDialogContent } from "../dialogs/agent.dialog";
import { SessionDialogContent } from "../dialogs/session.dialog";
import { ThemeDialogContent } from "../dialogs/theme.dialog";
import type { Command } from "./types";
import { ModelName } from "../../../../database/generated/prisma/internal/prismaNamespace";
import { performLogin } from "../../lib/oauth";
import { clearAuth } from "../../lib/auth";

export const COMMANDS: Command[] = [
    {
        name: "new",
        description: "Create a new project",
        value : "/new",
        action:  (ctx) => {
            ctx.navigate("/");
        }
    },
    {
        name: "agents",
        description: "List available agents",
        value: "/agents",
       action: (ctx) => {
            ctx.dialog.openDialog({
                title: "select agent",
                children: <AgentDialogContent currentMode={ctx.mode} onSelectMode={ctx.setMode} />
            })
        }
    },
    {
        name: "models",
        description: "List available models",
        value: "/models",
        action: (ctx) => {
            ctx.dialog.openDialog({
                title: "select model",
                children: <ModelDialogContent models={SUPPORTED_CHAT_MODELS.map((model) => model.id)}
                 onSelectModel={ctx.setModel} />
            })
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
            try {
                await performLogin();
                ctx.toast.show({message: "Signed in",variant: "success"});
            } catch (error) {
                const message = error instanceof Error
                ? error.message : "Signed in failed or timed out!"
                ctx.toast.show({message,variant: "error"});

            }
        }
    },
    
    {
        name: "logout",
        description: "Logout from current account",
        value: "/logout",
        action: async (ctx) => {
            clearAuth();
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