import { TextAttributes } from "@opentui/core";
import { useTheme } from "../providers/theme";

type props = {
    message: string;
}

export function ErrorMessage({message}:props) {
    const {colors} = useTheme();

    return(
        <box width="100%" alignItems="center">
            <box
            border={["left"]}
            backgroundColor={colors.error}
            width="100%"
            >
                <box
                justifyContent="center"
                paddingX={2}
                paddingY={1}
                backgroundColor={colors.surface}
                width="100%"
                >
                 <text attributes={TextAttributes.DIM}>{message}</text>
                </box>
            </box>
        </box>
    )
}