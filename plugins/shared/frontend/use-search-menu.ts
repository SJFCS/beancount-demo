import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { useEscapeDismiss } from "./use-escape-dismiss";

export function useSearchMenu({
  minWidth = 280,
  maxWidth = 420,
  maxHeight = 340,
  inline = false,
  triggerSelector = ".pm-search-select-trigger",
  menuSelector = ".pm-search-select-menu",
  onEscape,
}: {
  minWidth?: number;
  maxWidth?: number;
  maxHeight?: number;
  inline?: boolean;
  triggerSelector?: string;
  menuSelector?: string;
  onEscape?: () => boolean;
} = {}) {
  const root = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [position, setPosition] = useState<CSSProperties>({});
  const restoreFocusOnClose = useRef(false);
  const focusTrigger = useCallback(() => {
    const trigger = root.current?.querySelector<HTMLElement>(triggerSelector);
    const focusable =
      trigger &&
      (trigger.matches(
        "input,button,select,textarea,[tabindex]:not([tabindex='-1'])",
      )
        ? trigger
        : trigger.querySelector<HTMLElement>(
            "input,button,select,textarea,[tabindex]:not([tabindex='-1'])",
          ));
    focusable?.focus({ preventScroll: true });
  }, [triggerSelector]);
  useEscapeDismiss(root, open, () => {
    if (onEscape?.()) return;
    restoreFocusOnClose.current = true;
    setOpen(false);
  });
  const placeMenu = useCallback(() => {
    if (inline) return;
    const anchor =
      root.current?.querySelector<HTMLElement>(triggerSelector) ?? root.current;
    const trigger = anchor?.getBoundingClientRect();
    if (!trigger) return;
    const updatePosition = (next: CSSProperties) =>
      setPosition((current) =>
        Object.keys(current).length === Object.keys(next).length &&
        Object.entries(next).every(
          ([key, value]) => current[key as keyof CSSProperties] === value,
        )
          ? current
          : next,
      );
    const margin = 12;
    if (window.innerWidth <= 600) {
      updatePosition({
        position: "fixed",
        margin: 0,
        top: "auto",
        right: margin,
        bottom: margin,
        left: margin,
        width: "auto",
        maxWidth: "none",
        maxHeight: "65vh",
      });
      return;
    }
    const width = Math.min(
      Math.max(trigger.width, minWidth),
      maxWidth,
      window.innerWidth - margin * 2,
    );
    const left = Math.min(
      Math.max(margin, trigger.left),
      window.innerWidth - width - margin,
    );
    const gap = 8;
    const spaceBelow = Math.max(
      0,
      window.innerHeight - trigger.bottom - margin - gap,
    );
    const spaceAbove = Math.max(0, trigger.top - margin - gap);
    const menuHeight = root.current
      ?.querySelector<HTMLElement>(menuSelector)
      ?.getBoundingClientRect().height;
    const desiredHeight = Math.min(maxHeight, menuHeight || maxHeight);
    const openAbove = spaceBelow < desiredHeight && spaceAbove > spaceBelow;
    const availableHeight = Math.max(0, openAbove ? spaceAbove : spaceBelow);
    updatePosition({
      position: "fixed",
      margin: 0,
      right: "auto",
      left,
      width,
      maxWidth: `calc(100vw - ${margin * 2}px)`,
      maxHeight: Math.min(maxHeight, availableHeight),
      ...(openAbove
        ? { top: "auto", bottom: window.innerHeight - trigger.top + gap }
        : { top: trigger.bottom + gap, bottom: "auto" }),
    });
  }, [inline, maxHeight, maxWidth, minWidth, triggerSelector, menuSelector]);
  useLayoutEffect(() => {
    if (open || !restoreFocusOnClose.current) return;
    restoreFocusOnClose.current = false;
    focusTrigger();
  }, [focusTrigger, open]);
  useLayoutEffect(() => {
    if (!open) return;
    const popup = root.current?.querySelector<HTMLElement>(menuSelector);
    // A top-layer popup keeps viewport coordinates inside animated or clipped parents.
    if (popup?.hasAttribute("popover")) popup.showPopover?.();
    placeMenu();
    // Native autofocus can scroll the table before the popup is positioned.
    popup
      ?.querySelector<HTMLElement>("[data-menu-initial-focus]")
      ?.focus({ preventScroll: true });
    const close = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const onScroll = (event: Event) => {
      if (event.target instanceof Node && popup?.contains(event.target)) return;
      placeMenu();
    };
    const closeWithParent = (event: Event) => {
      if (
        (event as ToggleEvent).newState === "closed" &&
        event.target instanceof HTMLElement &&
        event.target.contains(root.current)
      )
        setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("beforetoggle", closeWithParent, true);
    if (!inline) {
      window.addEventListener("resize", placeMenu);
      window.addEventListener("scroll", onScroll, true);
    }
    const observer =
      !inline && typeof ResizeObserver === "function"
        ? new ResizeObserver(placeMenu)
        : undefined;
    if (root.current) {
      observer?.observe(root.current);
      if (popup) observer?.observe(popup);
    }
    return () => {
      observer?.disconnect();
      if (popup?.isConnected && popup.hasAttribute("popover"))
        popup.hidePopover?.();
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("beforetoggle", closeWithParent, true);
      window.removeEventListener("resize", placeMenu);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open, placeMenu, menuSelector, inline]);
  return {
    root,
    open,
    setOpen,
    query,
    setQuery,
    active,
    setActive,
    position,
    placeMenu,
  };
}
