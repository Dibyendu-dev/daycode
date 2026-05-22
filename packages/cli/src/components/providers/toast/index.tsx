import { createContext, useRef, useContext, useState, useCallback } from "react";
import type { ToastOptions, ToastVariant } from "./types";
import { DEFAULT_DURATION } from "./types";
import type { ReactNode } from "react";
import { useTerminalDimensions } from "@opentui/react";

export type ToastContextValue = {
    show: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
    const value = useContext(ToastContext);
    if (!value) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return value;
}

type ToastProviderProps = {
    children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
    const [currentToast, setCurrentToast] = useState<ToastOptions | null>(null);
    const timeoutIds = useRef<NodeJS.Timeout | null >(null);
   

    const clearCurrentTimeouts = useCallback(() => {
        if (timeoutIds.current ) {
            clearTimeout(timeoutIds.current);
            timeoutIds.current = null;
        }
    }, []);

    const show = useCallback((options: ToastOptions) => {
        const duration  = options.duration ?? DEFAULT_DURATION;

        clearCurrentTimeouts();

        setCurrentToast({
            variant: options.variant ?? "info",
            ...options,
            duration,
        });

        timeoutIds.current  = setTimeout(() => {
            setCurrentToast(null);
            timeoutIds.current  = null;
        }, duration).unref();
    }, [clearCurrentTimeouts]);

    const value: ToastContextValue = {
        show,
    };

    return (
        <ToastContext.Provider value={value}>
            {children}
            <Toast currentToast={currentToast}  />
        </ToastContext.Provider>
    );
}

type ToastProps = {
    currentToast: ToastOptions | null;  
}

function Toast({ currentToast }: ToastProps) {
    const { width } = useTerminalDimensions();
    if (!currentToast) {
        return null;
    }

    const { message, variant } = currentToast;

    const variantStyles: Record<ToastVariant, string> = {
        info: "#56D6C2",
        success: "#4CAF50",
        error: "#F44336",
    };

    const borderColor = currentToast.variant 
    ? variantStyles[currentToast.variant] 
    : variantStyles.info;

    return (
        <box
        position="absolute"
        justifyContent="center"
        alignItems="center"
        top={2}
        right={2}
        width={Math.max(1, Math.min(60, width- 6))}
        paddingLeft={2}
        paddingRight={2}
        paddingTop={1}
        paddingBottom={1}
        backgroundColor={"#333"}
        border = {["left", "right"]}
        borderColor={borderColor}
        >
            <box flexDirection="column" gap={1} width="100%">
                <text fg="#E1E1E1" wrapMode="word" width="100%"
                >{currentToast.message}</text>
            </box>
        </box>
    )
}