import { useTheme } from "../providers/theme";

type props = {
    message: string;
}

export function UserMessage({message}:props) {
    const {colors} = useTheme();

    return(
        <box width="100%" alignItems="center">
            <box
            border={["left"]}
            backgroundColor={colors.primary}
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