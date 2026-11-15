import { useId } from "react";
import type { ReactNode } from "react";

export function Icon({
  name,
  size = 16,
}: {
  name:
    | "plus"
    | "save"
    | "sync"
    | "refresh"
    | "calendar"
    | "chart"
    | "ledger"
    | "warning"
    | "check"
    | "chevron";
  size?: number;
}) {
  const paths = {
    plus: <path d="M12 5v14M5 12h14" />,
    save: (
      <>
        <path d="M4 4h13l3 3v13H4Z" />
        <path d="M8 4v6h8V4M8 20v-7h8v7" />
      </>
    ),
    sync: (
      <>
        <path d="M20 7h-5V2" />
        <path d="M19 7a8 8 0 1 0 1 8" />
      </>
    ),
    refresh: (
      <>
        <path d="M20 7h-5V2" />
        <path d="M19 7a8 8 0 1 0 1 8" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18" />
      </>
    ),
    chart: (
      <>
        <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
      </>
    ),
    ledger: (
      <>
        <path d="M5 3h12a2 2 0 0 1 2 2v16H7a2 2 0 0 1-2-2Z" />
        <path d="M5 17h14M9 7h6M9 11h6" />
      </>
    ),
    warning: (
      <>
        <path d="m12 3 10 18H2Z" />
        <path d="M12 9v5M12 18v.1" />
      </>
    ),
    check: <path d="m4 12 5 5L20 6" />,
    chevron: <path d="m6 9 6 6 6-6" />,
  };
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
    >
      {paths[name]}
    </svg>
  );
}

export function StatCard({
  label,
  value,
  note,
  tone = "ink",
}: {
  label: string;
  value: string;
  note: string;
  tone?: "ink" | "teal" | "amber" | "ruby";
}) {
  return (
    <article className="pr-stat" data-tone={tone}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  );
}

export function PanelHeading({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  const id = useId();
  return (
    <header className="pr-panel-head">
      <div>
        <span className="pr-panel-eyebrow">{eyebrow}</span>
        <h2 id={id}>{title}</h2>
        <p>{description}</p>
      </div>
      {actions ? <div className="pr-panel-actions">{actions}</div> : null}
    </header>
  );
}

export function EmptyState({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="pr-empty">
      <span className="pr-empty-mark" aria-hidden="true">
        0%
      </span>
      <h3>{title}</h3>
      <p>{children}</p>
      {action}
    </div>
  );
}
