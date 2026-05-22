import type { RefObject } from "react";
import {
  ScrollBox,
  TextAttributes,
  type ScrollBoxRenderable,
} from "@opentui/core";
import { getFilteredCommands } from "./filter-commands";
import { COMMANDS } from "./command";

const MAX_VISIBLE_COMMANDS = 8;

const COMMANDS_COL_WIDTH =
  Math.max(0, ...COMMANDS.map((cmd) => cmd.name.length)) + 4;

type CommandMenuProps = {
  query: string;
  selectedIndex: number;
  scrollRef: RefObject<ScrollBoxRenderable> | null;
  onSelect: (index: number) => void;
  onExecute: (index: number) => void;
};

export function CommandMenu({
  query,
  selectedIndex,
  scrollRef,
  onSelect,
  onExecute,
}: CommandMenuProps) {
  const filteredCommands = getFilteredCommands(query);
  const visibleHeight =
    Math.min(filteredCommands.length, MAX_VISIBLE_COMMANDS) * 2 + 1;
  if (filteredCommands.length === 0) {
    return (
      <box paddingX={1}>
        <text attributes={TextAttributes.DIM}>No commands found</text>
      </box>
    );
  }

  return (
    <scrollbox ref={scrollRef} height={visibleHeight} width="100%">
      {filteredCommands.map((cmd, index) => {
        const isSelected = index === selectedIndex;
        return (
          <box
            key={cmd.value}
            width="100%"
            flexDirection="row"
            paddingX={1}
            overflow="hidden"
            backgroundColor={isSelected ? "blue" : undefined}
            onMouseMove={() => onSelect(index)}
            onMouseDown={() => onExecute(index)}
          >
            <box width={COMMANDS_COL_WIDTH} flexShrink={0}>
              <text selectable={false} fg={isSelected ? "black" : "white"}>
                /{cmd.name}
              </text>
            </box>
            <box flexGrow={1} flexShrink={1} overflow="hidden">
              <text selectable={false} fg={isSelected ? "black" : "gray"}>
                {cmd.description}
              </text>
            </box>
          </box>
        );
      })}
    </scrollbox>
  );
}
