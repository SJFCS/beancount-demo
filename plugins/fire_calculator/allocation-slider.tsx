import React, {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import type { FireConfig } from "./model";

type Allocation = FireConfig["allocation"];
type Boundary = "stocks" | "cash";
type Props = {
  allocation: Allocation;
  colors: Record<keyof Allocation, string>;
  onChange(allocation: Allocation): void;
};

export function AllocationSlider({ allocation, colors, onChange }: Props) {
  const track = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    pointerId: number;
    boundary: Boundary;
    startX: number;
    startValue: number;
    width: number;
  } | null>(null);
  const [width, setWidth] = useState(280);
  const [active, setActive] = useState<Boundary | null>(null);
  const first = allocation.stocks;
  const second = allocation.stocks + allocation.bonds;
  const crowded = ((second - first) * width) / 100 < 28;
  const summary = `股票 ${allocation.stocks}%，债券 ${allocation.bonds}%，现金 ${allocation.cash}%`;

  useEffect(() => {
    const element = track.current;
    if (!element) return;
    const measure = () => setWidth(element.getBoundingClientRect().width);
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  function move(boundary: Boundary, value: number) {
    const next = Math.max(
      boundary === "stocks" ? 0 : first,
      Math.min(boundary === "stocks" ? second : 100, Math.round(value)),
    );
    onChange(
      boundary === "stocks"
        ? { stocks: next, bonds: second - next, cash: allocation.cash }
        : { stocks: first, bonds: next - first, cash: 100 - next },
    );
  }

  function start(event: PointerEvent<HTMLButtonElement>, boundary: Boundary) {
    if (event.button !== 0 || drag.current) return;
    const bounds = track.current?.getBoundingClientRect();
    if (!bounds?.width) return;
    event.preventDefault();
    event.currentTarget.focus();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      pointerId: event.pointerId,
      boundary,
      startX: event.clientX,
      startValue: boundary === "stocks" ? first : second,
      width: bounds.width,
    };
    setActive(boundary);
  }

  function pointerMove(event: PointerEvent<HTMLButtonElement>) {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    move(
      current.boundary,
      current.startValue +
        ((event.clientX - current.startX) / current.width) * 100,
    );
  }

  function stop(event: PointerEvent<HTMLButtonElement>) {
    if (drag.current?.pointerId !== event.pointerId) return;
    drag.current = null;
    setActive(null);
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  }

  function keyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    boundary: Boundary,
  ) {
    const current = boundary === "stocks" ? first : second;
    const steps: Record<string, number> = {
      ArrowLeft: -1,
      ArrowDown: -1,
      ArrowRight: 1,
      ArrowUp: 1,
      PageDown: -10,
      PageUp: 10,
    };
    let next: number;
    if (event.key === "Home") next = boundary === "stocks" ? 0 : first;
    else if (event.key === "End") next = boundary === "stocks" ? second : 100;
    else if (steps[event.key] !== undefined) next = current + steps[event.key];
    else return;
    event.preventDefault();
    move(boundary, next);
  }

  return (
    <div
      className={`fc-allocation-slider${crowded ? " is-crowded" : ""}`}
      role="group"
      aria-label={`投资组合配置条：${summary}`}
    >
      <div className="fc-allocation-track" ref={track}>
        <div className="fc-portfolio-bar" aria-hidden="true">
          {(["stocks", "bonds", "cash"] as const).map((asset) => (
            <span
              key={asset}
              style={{
                width: `${allocation[asset]}%`,
                background: colors[asset],
              }}
            />
          ))}
        </div>
        {(["stocks", "cash"] as const).map((boundary) => (
          <button
            key={boundary}
            type="button"
            role="slider"
            className={`fc-allocation-handle ${boundary}${active === boundary ? " is-dragging" : ""}`}
            style={{ left: `${boundary === "stocks" ? first : second}%` }}
            aria-label={
              boundary === "stocks" ? "股票与债券分界" : "债券与现金分界"
            }
            aria-orientation="horizontal"
            aria-valuemin={boundary === "stocks" ? 0 : first}
            aria-valuemax={boundary === "stocks" ? second : 100}
            aria-valuenow={boundary === "stocks" ? first : second}
            aria-valuetext={summary}
            title={
              boundary === "stocks"
                ? "拖动调整股票与债券"
                : "拖动调整债券与现金"
            }
            onPointerDown={(event) => start(event, boundary)}
            onPointerMove={pointerMove}
            onPointerUp={stop}
            onPointerCancel={stop}
            onLostPointerCapture={stop}
            onKeyDown={(event) => keyDown(event, boundary)}
          >
            <span />
          </button>
        ))}
      </div>
    </div>
  );
}
