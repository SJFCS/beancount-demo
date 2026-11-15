import { useLayoutEffect, useRef, type RefObject } from "react";

type EscapeLayer = {
  element: HTMLElement;
  dismiss(): void;
};

const layers: EscapeLayer[] = [];
let handledKeyDown = false;

function handleEscape(event: KeyboardEvent) {
  if (event.key !== "Escape" && event.code !== "Escape") return;
  const topLayer = layers.reduce<EscapeLayer | undefined>((current, layer) => {
    if (!layer.element.isConnected) return current;
    if (!current || current.element.contains(layer.element)) return layer;
    return layer.element.contains(current.element) ? current : layer;
  }, undefined);
  if (!topLayer) return;
  event.preventDefault();
  event.stopPropagation();
  if (event.type === "keyup") {
    const alreadyHandled = handledKeyDown;
    handledKeyDown = false;
    if (alreadyHandled) return;
  } else {
    if (event.repeat && handledKeyDown) return;
    handledKeyDown = true;
  }
  topLayer.dismiss();
}

function resetEscape() {
  handledKeyDown = false;
}

export function useEscapeDismiss(
  ref: RefObject<HTMLElement | null>,
  enabled: boolean,
  dismiss: () => void,
) {
  const latestDismiss = useRef(dismiss);
  useLayoutEffect(() => {
    latestDismiss.current = dismiss;
  });
  useLayoutEffect(() => {
    if (!enabled || !ref.current) return;
    const layer = {
      element: ref.current,
      dismiss: () => latestDismiss.current(),
    };
    if (!layers.length) {
      window.addEventListener("keydown", handleEscape, true);
      window.addEventListener("keyup", handleEscape, true);
      window.addEventListener("blur", resetEscape);
    }
    layers.push(layer);
    return () => {
      layers.splice(layers.indexOf(layer), 1);
      if (layers.length) return;
      window.removeEventListener("keydown", handleEscape, true);
      window.removeEventListener("keyup", handleEscape, true);
      window.removeEventListener("blur", resetEscape);
      resetEscape();
    };
  }, [enabled, ref]);
}
