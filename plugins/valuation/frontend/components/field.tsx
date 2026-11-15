import React from "react";

export function Field({
  label,
  hint,
  error,
  wide,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={`ve-field${wide ? " is-wide" : ""}`}>
      <span className="ve-field-label">{label}</span>
      {children}
      {error ? (
        <small className="ve-field-error">{error}</small>
      ) : hint ? (
        <small className="ve-field-hint">{hint}</small>
      ) : null}
    </label>
  );
}
