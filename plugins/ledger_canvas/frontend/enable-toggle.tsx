export function EnableToggle({
  checked,
  disabled,
  ariaLabel,
  onChange,
}: {
  checked: boolean;
  disabled: boolean;
  ariaLabel: string;
  onChange(checked: boolean): void;
}) {
  const action = checked ? "停用" : "启用";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={`${action}${ariaLabel}`}
      title={`${action}${ariaLabel}`}
      className={`fmp-enable-toggle${checked ? " is-on" : ""}`}
      disabled={disabled}
      onClick={() => onChange(!checked)}
    >
      <span className="fmp-enable-track" aria-hidden="true">
        <span className="fmp-enable-thumb" />
      </span>
      <span>启用</span>
    </button>
  );
}
