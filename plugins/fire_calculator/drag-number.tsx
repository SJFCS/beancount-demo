import React, {
  useEffect,
  useRef,
  useState,
  type InputHTMLAttributes,
} from "react";

type Props = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "onChange" | "min" | "max" | "step"
> & {
  value: number;
  min?: number;
  max?: number;
  step: number;
  scrub?: boolean;
  onChange(value: number): void;
};

export function DragNumber({
  value,
  min = 0,
  max,
  step,
  scrub = true,
  onChange,
  ...props
}: Props) {
  const gesture = useRef<{
    pointerId: number;
    x: number;
    y: number;
    value: number;
    dragging: boolean;
  } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [draft, setDraft] = useState<string | null>(null);
  const suppressClick = useRef(false);
  const previousValue = useRef(value);

  useEffect(() => {
    if (draft === null) {
      previousValue.current = value;
      return;
    }
    if (value !== previousValue.current) {
      const parsed = draft.trim() === "" ? null : Number(draft);
      if (parsed === null || !Number.isFinite(parsed) || parsed !== value) {
        setDraft(null);
      }
    }
    previousValue.current = value;
  }, [draft, value]);

  const displayValue =
    draft ?? (Number.isFinite(value) ? String(value) : "");

  return (
    <input
      {...props}
      type="number"
      className={`${scrub ? "fc-drag-number" : ""}${
        props.className ? ` ${props.className}` : ""
      }${dragging ? " is-dragging" : ""}`.trim()}
      value={displayValue}
      min={min}
      max={max}
      step={step}
      title={scrub ? "点击输入，按住左右拖动调整" : props.title}
      onChange={(event) => {
        const next = event.currentTarget.value;
        setDraft(next);
        if (next.trim() === "") return;
        const parsed = Number(next);
        if (Number.isFinite(parsed)) onChange(parsed);
      }}
      onBlur={(event) => {
        if (draft !== null) {
          const parsed = draft.trim() === "" ? null : Number(draft);
          if (parsed !== null && Number.isFinite(parsed)) onChange(parsed);
          setDraft(null);
        }
        props.onBlur?.(event);
      }}
      onPointerDown={(event) => {
        if (!scrub || event.button !== 0 || !event.isPrimary) return;
        setDraft(null);
        suppressClick.current = false;
        gesture.current = {
          pointerId: event.pointerId,
          x: event.clientX,
          y: event.clientY,
          value: Number.isFinite(value) ? value : min,
          dragging: false,
        };
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        const start = gesture.current;
        if (!start || start.pointerId !== event.pointerId) return;
        const dx = event.clientX - start.x;
        const dy = event.clientY - start.y;
        if (!start.dragging) {
          if (Math.abs(dx) < 6 || Math.abs(dx) <= Math.abs(dy)) return;
          start.dragging = true;
          suppressClick.current = true;
          setDragging(true);
        }
        event.preventDefault();
        const change = Math.trunc(dx / 8) * step;
        const next = Math.max(
          min,
          Math.min(max ?? Infinity, start.value + change),
        );
        onChange(Number(next.toFixed(8)));
      }}
      onPointerUp={(event) => {
        if (gesture.current?.pointerId !== event.pointerId) return;
        gesture.current = null;
        setDragging(false);
        if (event.currentTarget.hasPointerCapture(event.pointerId))
          event.currentTarget.releasePointerCapture(event.pointerId);
      }}
      onPointerCancel={() => {
        gesture.current = null;
        setDragging(false);
        suppressClick.current = false;
      }}
      onLostPointerCapture={() => {
        gesture.current = null;
        setDragging(false);
      }}
      onClick={(event) => {
        if (!suppressClick.current) return;
        event.preventDefault();
        suppressClick.current = false;
      }}
      onDragStart={(event) => event.preventDefault()}
    />
  );
}
