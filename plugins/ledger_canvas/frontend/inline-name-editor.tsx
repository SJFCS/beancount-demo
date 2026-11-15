import { useEffect, useState } from "react";
import { presetNameError } from "./model";

export function EditIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      aria-hidden="true"
      focusable="false"
    >
      <path d="m3.2 12.8.8-3.2 7.3-7.3a1.3 1.3 0 0 1 1.9 0l.5.5a1.3 1.3 0 0 1 0 1.9L6.4 12l-3.2.8Z" />
      <path d="m10.2 3.3 2.5 2.5" />
    </svg>
  );
}

export function PresetNameEditor({
  name,
  disabled,
  onRename,
}: {
  name: string;
  disabled: boolean;
  onRename(name: string): boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editing) return;
    setDraft(name);
    setError("");
  }, [editing, name]);

  useEffect(() => {
    if (disabled) setEditing(false);
  }, [disabled]);

  function commit() {
    const next = draft.trim();
    if (next === name) {
      setEditing(false);
      setError("");
      return;
    }
    const validationError = presetNameError(next);
    if (validationError) {
      setError(validationError);
      return;
    }
    if (!onRename(next)) return;
    setEditing(false);
    setError("");
  }

  return (
    <div className="fmp-preset-title">
      {editing ? (
        <input
          className="fmp-preset-name-input"
          aria-label="编辑 Preset 名称"
          maxLength={64}
          spellCheck={false}
          autoFocus
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value);
            setError("");
          }}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            event.currentTarget.focus();
          }}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commit();
            } else if (event.key === "Escape") {
              setDraft(name);
              setError("");
              setEditing(false);
            }
          }}
        />
      ) : (
        <button
          type="button"
          className="fmp-preset-name"
          disabled={disabled}
          title="编辑 Preset 名称"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setEditing(true);
          }}
        >
          <span>{name}</span>
          <EditIcon className="fmp-name-edit-icon" />
        </button>
      )}
      {error ? (
        <small className="fmp-name-error" role="status">
          {error}
        </small>
      ) : null}
    </div>
  );
}

export function RuleNameEditor({
  name,
  placeholder,
  ariaLabel,
  disabled,
  onChange,
}: {
  name?: string;
  placeholder: string;
  ariaLabel: string;
  disabled: boolean;
  onChange(name: string | undefined): void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name ?? "");

  useEffect(() => {
    if (!editing) setDraft(name ?? "");
  }, [editing, name]);

  useEffect(() => {
    if (disabled) setEditing(false);
  }, [disabled]);

  function commit() {
    const next = draft.trim();
    onChange(next || undefined);
    setEditing(false);
  }

  return (
    <div className="fmp-rule-name-shell">
      {editing ? (
        <div
          className="fmp-rule-name-editor"
          onClick={(event) => event.stopPropagation()}
        >
          <input
            className="fmp-input"
            aria-label={ariaLabel}
            autoFocus
            value={draft}
            disabled={disabled}
            placeholder="规则名称"
            onChange={(event) => setDraft(event.target.value)}
            onBlur={commit}
            onClick={(event) => {
              event.stopPropagation();
              event.currentTarget.focus();
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                event.currentTarget.blur();
              } else if (event.key === "Escape") {
                setDraft(name ?? "");
                setEditing(false);
              }
            }}
          />
          <EditIcon className="fmp-name-edit-icon" />
        </div>
      ) : (
        <button
          type="button"
          className="fmp-rule-name"
          disabled={disabled}
          title="编辑名称"
          onClick={(event) => {
            event.stopPropagation();
            setDraft(name ?? "");
            setEditing(true);
          }}
        >
          <span>{name?.trim() || placeholder}</span>
          <EditIcon className="fmp-name-edit-icon" />
        </button>
      )}
    </div>
  );
}
