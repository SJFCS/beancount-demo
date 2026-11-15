import { useRef, type CSSProperties, type KeyboardEvent } from "react";
import { useSearchMenu } from "@plugins/shared/frontend/use-search-menu";

export type SelectMenuOption = {
  value: string;
  label: string;
};

export function SelectMenu({
  value,
  options,
  onChange,
  ariaLabel,
  disabled = false,
  placeholder = "请选择",
  style,
}: {
  value: string;
  options: SelectMenuOption[];
  onChange(value: string): void;
  ariaLabel: string;
  disabled?: boolean;
  placeholder?: string;
  style?: CSSProperties;
}) {
  const menu = useSearchMenu({
    minWidth: 220,
    maxWidth: 360,
    maxHeight: 320,
    triggerSelector: ".fmp-select-trigger",
    menuSelector: ".fmp-select-menu",
  });
  const trigger = useRef<HTMLButtonElement>(null);
  const selectedIndex = options.findIndex((option) => option.value === value);
  const selected = options[selectedIndex];

  function close() {
    menu.setOpen(false);
  }

  function select(next: string) {
    onChange(next);
    close();
    trigger.current?.focus();
  }

  function moveOption(
    event: KeyboardEvent<HTMLButtonElement>,
    direction: "next" | "previous" | "first" | "last",
  ) {
    event.preventDefault();
    const items = [
      ...(event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>(
        '[role="option"]',
      ) ?? []),
    ];
    if (items.length === 0) return;
    const current = items.indexOf(event.currentTarget);
    const index =
      direction === "first"
        ? 0
        : direction === "last"
          ? items.length - 1
          : direction === "next"
            ? (current + 1) % items.length
            : (current - 1 + items.length) % items.length;
    items[index]?.focus();
  }

  return (
    <div className="fmp-select-menu-root" ref={menu.root} style={style}>
      <button
        ref={trigger}
        type="button"
        className="fmp-select-trigger"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={menu.open}
        disabled={disabled}
        onClick={() => menu.setOpen(!menu.open)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            menu.setOpen(true);
          } else if (event.key === "Escape" && menu.open) {
            event.preventDefault();
            close();
          }
        }}
      >
        <span className={selected ? "" : "is-placeholder"}>
          {selected?.label ?? placeholder}
        </span>
        <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
          <path d="m4 6 4 4 4-4" />
        </svg>
      </button>
      {menu.open ? (
        <div
          className="pm-search-select-menu fmp-select-menu"
          popover="manual"
          role="listbox"
          aria-label={ariaLabel}
          style={menu.position}
        >
          {options.map((option, index) => (
            <button
              type="button"
              role="option"
              aria-selected={option.value === value}
              className={`fmp-select-option${
                option.value === value ? " is-selected" : ""
              }`}
              data-menu-initial-focus={
                index === (selectedIndex >= 0 ? selectedIndex : 0)
                  ? true
                  : undefined
              }
              key={option.value}
              onClick={() => select(option.value)}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown") moveOption(event, "next");
                else if (event.key === "ArrowUp") moveOption(event, "previous");
                else if (event.key === "Home") moveOption(event, "first");
                else if (event.key === "End") moveOption(event, "last");
                else if (event.key === "Escape") {
                  event.preventDefault();
                  close();
                  trigger.current?.focus();
                }
              }}
            >
              <span>{option.label}</span>
              {option.value === value ? (
                <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                  <path d="m3.5 8.5 3 3 6-7" />
                </svg>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
