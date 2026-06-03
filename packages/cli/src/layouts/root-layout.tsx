import { Outlet} from "react-router"
import { ToastProvider } from "../components/providers/toast"
import { DialogProvider } from "../components/providers/dialog"
import { KeyboardLayerProvider } from "../components/providers/keyboard-layer"
import { ThemeProvider } from "../components/providers/theme"
import { ThemedRoot } from "./theme-root"
import { PromptConfigProvider } from "../components/providers/prompt-config"

export function Rootlayout(){
    return(
        <ThemeProvider>
              <KeyboardLayerProvider>
                <ToastProvider>
                  <DialogProvider>
                    <PromptConfigProvider>
                    <ThemedRoot>
                        <Outlet/>
                    </ThemedRoot>
                    </PromptConfigProvider>
                  </DialogProvider>
                </ToastProvider>
              </KeyboardLayerProvider>
            </ThemeProvider>
    )
}