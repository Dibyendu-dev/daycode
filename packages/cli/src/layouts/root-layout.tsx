import { Outlet} from "react-router"
import { ToastProvider } from "../components/providers/toast"
import { DialogProvider } from "../components/providers/dialog"
import { KeyboardLayerProvider } from "../components/providers/keyboard-layer"
import { ThemeProvider } from "../components/providers/theme"
import { ThemedRoot } from "./theme-root"

export function Rootlayout(){
    return(
        <ThemeProvider>
              <KeyboardLayerProvider>
                <DialogProvider>
                  <ToastProvider>
                    <ThemedRoot>
                        <Outlet/>
                    </ThemedRoot>
                  </ToastProvider>
                </DialogProvider>
              </KeyboardLayerProvider>
            </ThemeProvider>
    )
}