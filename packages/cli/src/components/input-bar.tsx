import type { KeyBinding } from "@opentui/core";
import { StatusBar } from "./status-bar";
import { CommandMenu } from "./command-menu";

type Props = {
    onSubmit: (text: string)=> void,
    disabled: boolean;
}

export const TEXT_AREA_KEY_BINDINGS:KeyBinding[] = [
    { name: "return" , action: "submit" },
    { name: "enter" , action: "submit" },
    { name: "return", shift: true, action: "newline" },
    { name: "enter", shift: true, action: "newline" },
];

export function InputBar({onSubmit, disabled= false}: Props){
    return(
        <box width="100%" alignItems="center">
            <box
            border={[ "left"]}
            borderColor="cyan"
           
            >
                 {/* Todo = add left border */}
           
           <box
                position="relative"
                justifyContent="center"
                paddingX={2}
                paddingY={1}
                backgroundColor="#1A1A20"
                width="100%"
                gap={1}
           >
            {true && (
                <box
                position="absolute"
                bottom="100%"
                left={0}
                width="100%"
                backgroundColor="#1A1A20"
                zIndex={10}
                >
                <CommandMenu query="" selectedIndex={0} scrollRef={null} onSelect={() => {}} onExecute={() => {}}/>
                 </box>   
            )}
            <textarea
            focused={!disabled}
            keyBindings={TEXT_AREA_KEY_BINDINGS}
            placeholder={`Ask me anything...   Fix the bug in my code`}
            />
            <StatusBar />
            </box>
           </box>

        </box>
        
    )
}