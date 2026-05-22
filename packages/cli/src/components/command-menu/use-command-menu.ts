import { useRef, useState, useMemo, type RefObject } from "react";
import type { ScrollBoxRenderable } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { getFilteredCommands } from "./filter-commands";
import type { Command } from "./types";
import { useKeyboardLayer } from "../providers/keyboard-layer";


type UseCommandMenuReturns = {
  showCommandMenu: boolean;
  commandQuery: string;
  selectedIndex: number;
  scrollRef: RefObject<ScrollBoxRenderable>;
  handleContentChange: (text: string) => void;
  resolveCommand: (index: number) => Command | undefined;
  setSelectedIndex: (index: number) => void;
};

export function useCommandMenu(): UseCommandMenuReturns {
  const [textValue, setTextValue] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showCommandMenu, setShowCommandMenu] = useState(false);
  const scrollRef = useRef<ScrollBoxRenderable>(null);
  const { push, pop, isTopLayer } = useKeyboardLayer();

  const commandQuery =
    showCommandMenu && textValue.startsWith("/") ? textValue.slice(1) : "";

  const filteredCommands = useMemo(() => {
    return getFilteredCommands(commandQuery);
  }, [commandQuery]);

  const handleContentChange = (text: string) => {
    setTextValue(text);
    setSelectedIndex(0);
    // jump back to top of the list when user type new chracter
    const scrollbox = scrollRef.current;
    if (scrollbox) {
      scrollbox.scrollTo(0);
    }
    const hasCommandPrefix = text.startsWith("/");
    const commandText = hasCommandPrefix ? text.slice(1) : "";
    if (hasCommandPrefix && !commandText.includes(" ")) {
      setShowCommandMenu(true);
      push("command", () => {
        setShowCommandMenu(false);
        pop("command");
        return true;
      });
    } else {
      setShowCommandMenu(false);
      pop("command");
    }
  };

  const resolveCommand = (index: number): Command | undefined => {
    const command = filteredCommands[index];
    if (command) {
      setShowCommandMenu(false);
      pop("command");
    }
    return command;
  };

  // arrow key move selection
  useKeyboard((key) => {
    if (!showCommandMenu || !isTopLayer("command")) return;
    if (key.name === "escape") {
      setShowCommandMenu(false);
      pop("command");
    } else if (key.name === "up") {
      key.preventDefault();
      setSelectedIndex((i: number) => {
        const newIndex = Math.max(0, i - 1);
        const scrollbox = scrollRef.current;
        if (scrollbox && newIndex < scrollbox.scrollTop) {
          scrollbox.scrollTo(newIndex);
        }
        return newIndex;
      });
    } else if (key.name === "down") {
      key.preventDefault();
      setSelectedIndex((i: number) => {
        if (filteredCommands.length === 0) return 0;
        const newIndex = Math.min(filteredCommands.length - 1, i + 1);
        const scrollbox = scrollRef.current;
        if (scrollbox) {
          const viewportHeight = scrollbox.height;
          const visibleEnd = scrollbox.scrollTop + viewportHeight - 1;
          if (newIndex > visibleEnd) {
            scrollbox.scrollTo(newIndex - viewportHeight + 1);
          }
        }
        return newIndex;
      });
    }
  });

  return {
    showCommandMenu,
    commandQuery,
    selectedIndex,
    scrollRef,
    handleContentChange,
    resolveCommand,
    setSelectedIndex,
  };
}
