import { useTheme } from "../providers/theme";
import { Mode } from "@daycode/database/enums";
type props = {
    message: string;
    mode: Mode;
}

export function UserMessage({message,mode}:props) {
    const {colors} = useTheme();

    return(
        <box width="100%" alignItems="center">
            <box
            border={["left"]}
            backgroundColor={mode === Mode.PLAN ? colors.planMode : colors.primary}
            width="100%"
            >
                <box
                justifyContent="center"
                paddingX={2}
                paddingY={1}
                backgroundColor={colors.surface}
                width="100%"
                >
                 <text>{message}</text>
                </box>
            </box>
        </box>
    )
}