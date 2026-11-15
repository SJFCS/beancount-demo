import React, { useLayoutEffect, useRef } from "react";

export function FloatingReviewDock({
  anchorRef,
  children,
}: {
  anchorRef: React.RefObject<HTMLElement | null>;
  children: React.ReactNode;
}) {
  const reserveRef = useRef<HTMLDivElement>(null);
  const dockRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const anchor = anchorRef.current;
    const dock = dockRef.current;
    const reserve = reserveRef.current;
    if (!anchor || !dock || !reserve) return;

    const update = () => {
      const bounds = anchor.getBoundingClientRect();
      const left = Math.max(12, bounds.left);
      const right = Math.min(window.innerWidth - 12, bounds.right);
      const width = Math.max(0, right - left);
      dock.style.left = `${left}px`;
      dock.style.width = `${width}px`;
      dock.dataset.layout =
        width <= 480 ? "small" : width <= 1050 ? "compact" : "wide";
      // Keep the final rows reachable as actions wrap or confirmation opens.
      reserve.style.setProperty(
        "--pm-dock-height",
        `${dock.getBoundingClientRect().height}px`,
      );
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(anchor);
    observer.observe(dock);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [anchorRef]);

  return (
    <div className="pm-commit-reserve" ref={reserveRef}>
      <section className="pm-commit-dock" aria-label="本次入账" ref={dockRef}>
        {children}
      </section>
    </div>
  );
}
