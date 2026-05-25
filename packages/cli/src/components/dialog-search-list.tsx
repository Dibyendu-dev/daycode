import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ScrollBox,
  TextAttributes,
  type InputRenderable,
  type ScrollBoxRenderable,
} from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { useKeyboardLayer } from "./providers/keyboard-layer";

const MAX_VISIBLE_ITEMS = 5;

type DialogSearchListProps<T> = {
  items: T[];
  onSelect: (item: T) => void;
  onHighlight?: (item: T) => void;
  filterFn: (item: T, query: string) => boolean;
  renderItem: (item: T, is_selected: boolean) => ReactNode;
  placeholder?: string;
  getKey?: (item: T) => string;
  emptyText?: string;
};

export function DialogSearchList<T>({
  items,
  onSelect,
  onHighlight,
  filterFn,
  renderItem,
  placeholder = "Search",
  getKey,
  emptyText = "No results",
}: DialogSearchListProps<T>) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const inputRef = useRef<InputRenderable>(null);
  const scrollRef = useRef<ScrollBoxRenderable>(null);
  const { isTopLayer } = useKeyboardLayer();

  const filteredItems = useMemo(() => {
    return searchValue
      ? items.filter((item) => filterFn(item, searchValue))
      : items;
  }, [items, searchValue, filterFn]);

  const visibleHeight = Math.min(filteredItems.length, MAX_VISIBLE_ITEMS);

  const handleContentChange = useCallback(() => {
    const text = inputRef.current?.value ?? "";
    setSearchValue(text);
    setSelectedIndex(0);

    const scrollBox = scrollRef.current;
    if (scrollBox) {
      scrollBox.scrollTo(0);
    }
  }, []);

  useKeyboard((key) => {
    if (!isTopLayer("dialog")) return;

    if (key.name === "return" || key.name === "enter") {
      const item = filteredItems[selectedIndex];
      if (item) {
        onSelect(item);
      }
    } else if (key.name === "up") {
      key.preventDefault?.();
      setSelectedIndex((index) => {
        const newIndex = Math.max(0, index - 1);
        const scrollBox = scrollRef.current;
        if (scrollBox && newIndex < scrollBox.scrollTop) {
          scrollBox.scrollTo(newIndex);
        }
        const item = filteredItems[newIndex];
        if (item && onHighlight) {
          onHighlight(item);
        }
        return newIndex;
      });
    } else if (key.name === "down") {
      key.preventDefault?.();
      setSelectedIndex((index) => {
        const newIndex = Math.min(filteredItems.length - 1, index + 1);
        const scrollBox = scrollRef.current;
        if (scrollBox) {
          const viewportHeight = scrollBox.height;
          const visibleEnd = scrollBox.scrollTop + viewportHeight - 1;
          if (newIndex > visibleEnd) {
            scrollBox.scrollTo(newIndex - viewportHeight + 1);
          }
        }
        const item = filteredItems[newIndex];
        if (item && onHighlight) {
          onHighlight(item);
        }
        return newIndex;
      });
    }
  });

  return (
    <box flexDirection="column" gap={1}>
      <input
        ref={inputRef}
        placeholder={placeholder}
        onChange={handleContentChange}
        focused
      />

      {filteredItems.length === 0 ? (
        <text attributes={TextAttributes.DIM}>{emptyText}</text>
      ) : (
        <scrollbox ref={scrollRef} height={visibleHeight}>
          {filteredItems.map((item, i) => {
            const isSelected = i === selectedIndex;
            return (
              <box
                key={getKey ? getKey(item) : String(i)}
                flexDirection="row"
                height={1}
                overflow="hidden"
                backgroundColor={isSelected ? "#89B4FA" : undefined}
                onMouseMove={() => {
                  setSelectedIndex(i);
                  if (onHighlight) onHighlight(item);
                }}
                onMouseDown={() => onSelect(item)}
              >
                {renderItem(item, isSelected)}
              </box>
            );
          })}
        </scrollbox>
      )}
    </box>
  );
}
