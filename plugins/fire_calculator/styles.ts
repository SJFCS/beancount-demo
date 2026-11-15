export const FIRE_STYLES = `
.fc-shell {
  --fc-bg: #f6f7f4;
  --fc-card: #fff;
  --fc-card-soft: #fbfcf9;
  --fc-ink: #22362d;
  --fc-muted: #738078;
  --fc-faint: #98a08f;
  --fc-label: #68776b;
  --fc-soft-ink: #536f5c;
  --fc-line: #e2e8e1;
  --fc-line-strong: #dbe3d9;
  --fc-input-line: #e0e6dd;
  --fc-input-bg: #fff;
  --fc-hover-bg: #f5f9f2;
  --fc-hover-line: #8cab95;
  --fc-focus: #8eaf94;
  --fc-focus-ring: #85ad88;
  --fc-green: #347a56;
  --fc-green-dark: #235e3e;
  --fc-green-ink: #456742;
  --fc-green-soft: #edf4e8;
  --fc-green-line: #dce8d3;
  --fc-pale: #edf4e9;
  --fc-amber: #ad7431;
  --fc-amber-ink: #96602c;
  --fc-amber-soft: #fdf9f4;
  --fc-amber-line: #ead9c4;
  --fc-error-line: #f1d6cf;
  --fc-error-ink: #a54735;
  --fc-error-bg: #fff6f2;
  --fc-chip-bg: #f0f4ed;
  --fc-chip-ink: #7a8c70;
  --fc-income-ink: #3c6b48;
  --fc-income-bg: #f7fbf4;
  --fc-income-line: #d1e1cb;
  --fc-income-bar: #8caf85;
  --fc-expense-bar: #d2a064;
  --fc-toggle-bg: #f6f8f3;
  --fc-tooltip-bg: #fffffff5;
  --fc-flow-investment: #576ba8;
  --fc-flow-withdrawal: #9a4f88;
  width: 100%; height: 100%; overflow-y: auto; overflow-x: hidden;
  color: var(--fc-ink); background: var(--fc-bg);
  font-family: "Avenir Next", "PingFang SC", "Microsoft YaHei", sans-serif;
  font-size: 13px; line-height: 1.6; scrollbar-gutter: stable;
}
.fc-shell *, .fc-shell *::before, .fc-shell *::after { box-sizing: border-box; }
@keyframes fc-fade-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes fc-config-pop { from { opacity: 0; transform: translateY(12px) scale(.985); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { .fc-config-overlay, .fc-config { animation: none; } }
.fc-shell button, .fc-shell input, .fc-shell select, .fc-shell textarea { font: inherit; }
.fc-shell button, .fc-shell select, .fc-shell input[type="range"], .fc-shell input[type="checkbox"] { cursor: pointer; }
.fc-shell button { transition: background .16s, border-color .16s, opacity .16s; }
.fc-shell button:disabled { cursor: not-allowed; opacity: .5; }
.fc-shell :focus-visible { outline: 3px solid var(--fc-focus-ring); outline-offset: 3px; }
.fc-page { max-width: 1540px; margin: 0 auto; padding: 30px clamp(16px, 2.6vw, 38px) 26px; }
.fc-header { display: flex; justify-content: space-between; align-items: center; gap: 24px; margin-bottom: 27px; }
.fc-eyebrow { display: flex; align-items: center; gap: 8px; color: var(--fc-green); font-size: 10px; font-weight: 700; letter-spacing: .16em; }
.fc-brand-mark { display: inline-grid; width: 21px; height: 21px; place-items: center; border-radius: 6px; background: var(--fc-green); color: white; }
.fc-header h1 { margin: 6px 0 5px; font-size: clamp(24px, 2.1vw, 32px); font-weight: 650; line-height: 1.3; letter-spacing: -.04em; }
.fc-header h1 span { margin-left: 8px; font-weight: 450; color: var(--fc-soft-ink); }
.fc-header p { margin: 0; color: var(--fc-muted); font-size: 12px; }
.fc-title-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.fc-settings-toggle { min-height: 31px; padding: 5px 10px; color: var(--fc-muted); background: transparent; }
.fc-settings-toggle.is-active { color: var(--fc-green-ink); border-color: var(--fc-green-line); background: var(--fc-pale); }
.fc-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.fc-plan-toolbar { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.fc-plan-menu { position: relative; }
.fc-plan-menu-button { display: inline-flex; min-height: 31px; align-items: center; gap: 7px; padding: 4px 9px; border: 1px solid var(--fc-line-strong); border-radius: 6px; background: var(--fc-card); color: var(--fc-ink); font-size: 12px; font-weight: 550; }
.fc-plan-menu-button:hover { border-color: var(--fc-hover-line); background: var(--fc-hover-bg); }
.fc-plan-menu-button svg { color: var(--fc-muted); transition: transform .16s; }
.fc-plan-menu-button[aria-expanded="true"] svg { transform: rotate(180deg); }
.fc-plan-menu-popover { position: absolute; z-index: 40; top: calc(100% + 6px); left: 0; display: grid; min-width: 210px; max-height: min(70vh, 520px); gap: 2px; overflow-y: auto; overscroll-behavior: contain; padding: 6px; border: 1px solid var(--fc-line-strong); border-radius: 9px; background: var(--fc-card); box-shadow: 0 12px 32px rgb(15 25 18 / .16), 0 2px 8px rgb(15 25 18 / .08); }
.fc-plan-menu-item { display: flex; min-width: 0; align-items: center; gap: 2px; }
.fc-plan-menu-option { display: flex; min-width: 0; flex: 1; align-items: center; justify-content: space-between; gap: 8px; padding: 7px 8px; border: 1px solid transparent; border-radius: 6px; background: transparent; color: var(--fc-ink); font-size: 12px; text-align: left; }
.fc-plan-menu-option:hover { background: var(--fc-hover-bg); }
.fc-plan-menu-option.is-active { background: var(--fc-pale); color: var(--fc-green-ink); font-weight: 600; }
.fc-plan-menu-rename { display: inline-grid; flex: 0 0 auto; width: 24px; height: 24px; place-items: center; padding: 0; border: 1px solid transparent; border-radius: 6px; background: transparent; color: var(--fc-faint); }
.fc-plan-menu-rename:hover { border-color: var(--fc-line); background: var(--fc-input-bg); color: var(--fc-soft-ink); }
.fc-plan-menu-delete { display: inline-grid; flex: 0 0 auto; width: 24px; height: 24px; place-items: center; padding: 0; border: 1px solid transparent; border-radius: 6px; background: transparent; color: var(--fc-faint); }
.fc-plan-menu-delete:hover { border-color: var(--fc-error-line); background: var(--fc-error-bg); color: var(--fc-error-ink); }
.fc-plan-menu-rename-input { min-width: 0; flex: 1; min-height: 29px; padding: 4px 8px; border: 1px solid var(--fc-focus); border-radius: 6px; background: var(--fc-input-bg); color: var(--fc-ink); font-size: 12px; }
.fc-plan-menu-create { display: flex; align-items: center; gap: 6px; margin-top: 2px; padding: 7px 8px; border: 1px dashed var(--fc-line-strong); border-radius: 6px; background: transparent; color: var(--fc-muted); font-size: 12px; text-align: left; }
.fc-plan-menu-create:hover { border-color: var(--fc-hover-line); background: var(--fc-hover-bg); color: var(--fc-green-ink); }
.fc-plan-menu-empty { padding: 7px 8px; color: var(--fc-faint); font-size: 12px; }
.fc-btn { display: inline-flex; min-height: 35px; align-items: center; justify-content: center; gap: 7px; padding: 7px 13px; color: var(--fc-ink); background: var(--fc-card); border: 1px solid var(--fc-line-strong); border-radius: 7px; font-size: 12px; font-weight: 550; }
.fc-btn:hover { border-color: var(--fc-hover-line); background: var(--fc-hover-bg); }
.fc-btn.primary { color: white; border-color: var(--fc-green); background: var(--fc-green); }
.fc-btn.primary:hover { background: var(--fc-green-dark); border-color: var(--fc-green-dark); }
.fc-btn.ghost { background: transparent; border-color: transparent; color: var(--fc-muted); }
.fc-btn.small { min-height: 29px; padding: 3px 9px; font-size: 11px; }
.fc-message { display: flex; align-items: center; gap: 10px; padding: 11px 14px; margin: 0 0 16px; border: 1px solid var(--fc-green-line); border-radius: 7px; background: var(--fc-pale); color: var(--fc-green-ink); font-size: 12px; }
.fc-error { border-color: var(--fc-error-line); color: var(--fc-error-ink); background: var(--fc-error-bg); }
.fc-confirm-overlay { position: fixed; inset: 0; z-index: 120; display: grid; place-items: center; padding: 20px; background: rgb(14 20 16 / .62); backdrop-filter: blur(3px); animation: fc-fade-in .16s ease-out; }
.fc-confirm-dialog { display: grid; width: min(430px, 100%); grid-template-columns: auto minmax(0, 1fr); gap: 0 13px; padding: 20px; border: 1px solid var(--fc-line-strong); border-radius: 14px; background: var(--fc-card); box-shadow: 0 24px 70px rgb(15 25 18 / .34), 0 3px 14px rgb(15 25 18 / .14); animation: fc-config-pop .2s cubic-bezier(.22, .9, .35, 1); }
.fc-confirm-dialog:focus { outline: none; }
.fc-confirm-icon { display: inline-grid; width: 34px; height: 34px; place-items: center; border-radius: 9px; background: var(--fc-pale); color: var(--fc-green); }
.fc-confirm-dialog.is-danger .fc-confirm-icon { background: var(--fc-error-bg); color: var(--fc-error-ink); }
.fc-confirm-copy h2 { margin: 3px 0 5px; color: var(--fc-ink); font-size: 15px; font-weight: 650; line-height: 1.45; }
.fc-confirm-copy p { margin: 0; color: var(--fc-muted); font-size: 11px; line-height: 1.75; }
.fc-confirm-actions { display: flex; grid-column: 1 / -1; justify-content: flex-end; gap: 8px; margin-top: 18px; padding-top: 14px; border-top: 1px solid var(--fc-line); }
.fc-confirm-actions .fc-btn { min-width: 82px; }
.fc-btn.danger { border-color: var(--fc-error-line); background: var(--fc-error-bg); color: var(--fc-error-ink); }
.fc-btn.danger:hover { border-color: var(--fc-error-ink); background: color-mix(in srgb, var(--fc-error-bg) 72%, var(--fc-card)); }
.fc-workspace { display: block; }
.fc-config-overlay { position: fixed; inset: 0; z-index: 90; display: flex; align-items: center; justify-content: center; padding: 24px; background: rgb(14 20 16 / .55); animation: fc-fade-in .16s ease-out; }
.fc-config { display: flex; min-width: 0; width: min(960px, 100%); height: min(700px, calc(100vh - 48px)); flex-direction: column; background: var(--fc-card); border: 0; border-radius: 16px; box-shadow: 0 24px 70px rgb(15 25 18 / .34), 0 3px 14px rgb(15 25 18 / .14); animation: fc-config-pop .22s cubic-bezier(.22, .9, .35, 1); }
.fc-config-header { display: flex; align-items: center; justify-content: space-between; padding: 18px 22px 15px; border-bottom: 1px solid var(--fc-line); }
.fc-config-header h2 { display: flex; align-items: center; gap: 9px; margin: 0; font-size: 15px; font-weight: 650; }
.fc-config-header h2 svg { color: var(--fc-green); }
.fc-config-header h2 .fc-config-plan-tag { color: var(--fc-muted); font-size: 12px; font-weight: 500; }
.fc-config-header-right { display: flex; align-items: center; gap: 12px; }
.fc-config-header-right > span { font-size: 10px; color: var(--fc-muted); }
.fc-config-close { display: inline-grid; width: 28px; height: 28px; place-items: center; padding: 0; border: 1px solid transparent; border-radius: 7px; background: transparent; color: var(--fc-muted); font-size: 18px; line-height: 1; transition: border-color .16s, background .16s, color .16s; }
.fc-config-close:hover { border-color: var(--fc-line); background: var(--fc-hover-bg); color: var(--fc-soft-ink); }
.fc-config-body { flex: 1; min-height: 0; padding: 0 22px 8px; overflow-y: auto; overscroll-behavior: contain; scrollbar-width: thin; scrollbar-color: var(--fc-line-strong) transparent; }
.fc-config-body::-webkit-scrollbar { width: 9px; }
.fc-config-body::-webkit-scrollbar-thumb { border: 2px solid transparent; border-radius: 8px; background: var(--fc-line-strong); background-clip: content-box; }
.fc-config-body::-webkit-scrollbar-thumb:hover { background-color: var(--fc-hover-line); }
.fc-config-layout { display: flex; flex: 1; min-height: 0; align-items: stretch; }
.fc-config-nav { display: grid; flex: 0 0 218px; align-content: start; gap: 4px; padding: 16px 12px; border-right: 1px solid var(--fc-line); border-radius: 0 0 0 16px; background: var(--fc-card-soft); }
.fc-config-nav-item { display: flex; align-items: center; gap: 10px; width: 100%; padding: 9px 12px; border: 1px solid transparent; border-radius: 9px; background: transparent; color: var(--fc-soft-ink); font-size: 12px; font-weight: 550; text-align: left; transition: border-color .16s, background .16s, color .16s; }
.fc-config-nav-item svg { flex: 0 0 auto; color: var(--fc-faint); transition: color .16s; }
.fc-config-nav-item:hover { border-color: var(--fc-line); background: var(--fc-hover-bg); color: var(--fc-ink); }
.fc-config-nav-item:hover svg { color: var(--fc-muted); }
.fc-config-nav-item.is-active { border-color: var(--fc-green-line); background: var(--fc-pale); color: var(--fc-green-ink); font-weight: 650; box-shadow: inset 0 0 0 1px #ffffff55; }
.fc-config-nav-item.is-active svg { color: var(--fc-green); }
.fc-config-panel { display: flex; flex: 1; min-width: 0; flex-direction: column; }
.fc-config-section-pane { min-height: 0; }
.fc-section { border: 0; border-bottom: 1px solid var(--fc-line); }
.fc-section:last-child { border-bottom: 0; }
.fc-section-title { display: flex; align-items: center; gap: 9px; padding: 14px 0 11px; font-size: 12px; font-weight: 650; }
.fc-section-title > svg { color: var(--fc-green); }
.fc-section-number { display: inline-grid; flex: 0 0 auto; width: 19px; height: 19px; place-items: center; border-radius: 5px; background: var(--fc-chip-bg); color: var(--fc-chip-ink); font-size: 10px; font-variant-numeric: tabular-nums; }
.fc-section-content { display: grid; grid-template-columns: repeat(var(--fc-cols, 3), minmax(0, 1fr)); gap: 10px 12px; align-items: start; padding: 0 0 18px; }
.fc-section-content > .fc-note,
.fc-section-content > .fc-subheading,
.fc-section-content > .fc-cashflow-columns,
.fc-section-content > .fc-event-columns,
.fc-section-content > .fc-allocation-slider { grid-column: 1 / -1; }
.fc-field-row { display: grid; grid-column: 1 / -1; min-width: 0; }
.fc-inline-field { display: flex; grid-column: 1 / -1; min-width: 0; align-items: center; gap: 10px; }
.fc-inline-field > span { flex: 0 0 auto; color: var(--fc-label); font-size: 11px; white-space: nowrap; }
.fc-inline-field > select { width: 150px; min-height: 32px; padding: 4px 8px; border: 1px solid var(--fc-input-line); border-radius: 6px; background: var(--fc-input-bg); color: var(--fc-ink); font-size: 12px; }
.fc-inline-field > select:focus { border-color: var(--fc-focus); }
.fc-field-stack { display: grid; min-width: 0; align-content: start; gap: 8px; }
.fc-field-stack.fc-span-2 { grid-column: span 2; }
.fc-field-stack.fc-span-3 { grid-column: span 3; }
.fc-field-stack-title { display: flex; align-items: center; gap: 6px; margin: 0; color: var(--fc-faint); font-size: 10px; font-weight: 600; }
.fc-field-stack-title::before { content: ""; flex: 0 0 auto; width: 6px; height: 6px; border-radius: 2px; background: var(--fc-line-strong); }
.fc-field-stack-title.is-stocks::before { background: #58835d; }
.fc-field-stack-title.is-bonds::before { background: #b2c49b; }
.fc-field-stack-title.is-fees::before { background: #c89b6a; }
.fc-field-stack-title.is-inflation::before { background: #e0d8b2; }
.fc-life-bar { display: grid; grid-column: 1 / -1; gap: 7px; padding: 10px 12px 9px; border: 1px solid var(--fc-line); border-radius: 8px; background: var(--fc-card-soft); }
.fc-life-bar-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; color: var(--fc-green-ink); font-size: 11px; font-weight: 600; font-variant-numeric: tabular-nums; }
.fc-life-bar-head > span:last-child { color: var(--fc-amber-ink); }
.fc-life-bar-track { display: flex; gap: 2px; height: 9px; overflow: hidden; border-radius: 999px; background: var(--fc-line); }
.fc-life-bar-track .is-work { flex: 0 0 auto; background: var(--fc-green); border-radius: 999px 0 0 999px; }
.fc-life-bar-track .is-retired { flex: 0 0 auto; background: var(--fc-amber); opacity: .8; border-radius: 0 999px 999px 0; }
.fc-life-bar-labels { position: relative; height: 13px; color: var(--fc-faint); font-size: 9px; font-variant-numeric: tabular-nums; }
.fc-life-bar-labels > span { position: absolute; top: 0; transform: translateX(-50%); white-space: nowrap; }
.fc-life-bar-labels > span:first-child { transform: none; }
.fc-life-bar-labels > span:last-child { transform: none; }
.fc-field { display: grid; min-width: 0; gap: 5px; }
.fc-field > span, .fc-field-label { display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 11px; color: var(--fc-label); }
.fc-field small { color: var(--fc-faint); font-size: 10px; }
.fc-input, .fc-field input:not([type="range"]):not([type="checkbox"]), .fc-field select, .fc-field textarea { width: 100%; min-width: 0; min-height: 34px; border: 1px solid var(--fc-input-line); border-radius: 6px; padding: 6px 9px; background: var(--fc-input-bg); color: var(--fc-ink); outline-offset: 2px; font-size: 12px; font-variant-numeric: tabular-nums; }
.fc-field input:not([type="range"]):not([type="checkbox"]):focus, .fc-field select:focus { border-color: var(--fc-focus); }
.fc-value-input { display: flex; align-items: center; position: relative; }
.fc-value-input > input { padding-right: 35px !important; }
.fc-value-input > b { position: absolute; right: 10px; font-weight: 450; color: var(--fc-muted); font-size: 10px; pointer-events: none; }
.fc-value-input > .fc-unit-toggle { position: absolute; right: 10px; padding: 2px 3px; border: 1px solid transparent; border-radius: 4px; background: transparent; color: var(--fc-muted); font-size: 10px; font-weight: 500; line-height: 1.3; }
.fc-value-input > .fc-unit-toggle:hover { border-color: var(--fc-line-strong); background: var(--fc-hover-bg); color: var(--fc-green-ink); }
.fc-scrub-input > input.fc-drag-number { padding-right: 57px !important; cursor: ew-resize; touch-action: pan-y; appearance: textfield; }
.fc-scrub-input > input.fc-drag-number::-webkit-inner-spin-button, .fc-scrub-input > input.fc-drag-number::-webkit-outer-spin-button { appearance: none; margin: 0; }
.fc-scrub-input > input.fc-drag-number:focus { cursor: text; }
.fc-scrub-input > input.fc-drag-number.is-dragging { cursor: ew-resize; user-select: none; background: var(--fc-hover-bg); border-color: var(--fc-focus); }
.fc-scrub-input > b { right: 29px; }
.fc-scrub-input > .fc-unit-toggle { right: 29px; }
.fc-input-grip { position: absolute; right: 9px; color: var(--fc-muted); pointer-events: none; font-size: 14px; }
.fc-sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0; }
.fc-amount-hint { display: flex; flex-wrap: wrap; gap: 0 3px; margin: 0; color: var(--fc-muted); font-size: 11px; line-height: 1.6; font-variant-numeric: tabular-nums; overflow-wrap: anywhere; }
.fc-amount-hint > span { white-space: nowrap; }
.fc-note { margin: 0; color: var(--fc-muted); font-size: 10px; line-height: 1.75; }
.fc-subheading { display: flex; align-items: center; gap: 7px; margin: 2px 0 -5px; color: var(--fc-soft-ink); font-size: 11px; font-weight: 650; }
.fc-subheading::after { content: ""; flex: 1; height: 1px; background: var(--fc-line); }
.fc-allocation-slider { min-width: 0; padding: 0 14px; margin-bottom: -6px; }
.fc-allocation-track { position: relative; height: 56px; }
.fc-portfolio-bar { position: absolute; top: 24px; left: 0; right: 0; display: flex; height: 8px; overflow: hidden; border-radius: 10px; background: var(--fc-line); }
.fc-allocation-handle { position: absolute; top: 14px; z-index: 1; width: 28px; height: 28px; padding: 0; transform: translateX(-50%); border: 0; border-radius: 50%; background: transparent; cursor: ew-resize !important; touch-action: none; user-select: none; }
.fc-allocation-handle > span { position: absolute; inset: 7px; border: 2px solid #fff; border-radius: 50%; background: var(--fc-green); box-shadow: 0 0 0 1px var(--fc-green-line); }
.fc-allocation-handle:hover > span, .fc-allocation-handle.is-dragging > span { background: var(--fc-green-dark); box-shadow: 0 0 0 1px var(--fc-green-line), 0 0 0 4px #347a5618; }
.fc-allocation-handle:focus-visible { z-index: 3; }
.fc-allocation-handle.is-dragging { z-index: 2; }
.fc-allocation-slider.is-crowded .fc-allocation-handle.stocks { top: 0; }
.fc-allocation-slider.is-crowded .fc-allocation-handle.cash { top: 28px; }
.fc-allocation-slider.is-crowded .fc-allocation-handle::before { content: ""; position: absolute; left: 13px; width: 2px; height: 7px; background: var(--fc-green); }
.fc-allocation-slider.is-crowded .fc-allocation-handle.stocks::before { top: 21px; }
.fc-allocation-slider.is-crowded .fc-allocation-handle.cash::before { top: 0; }
.fc-asset-field { display: grid; gap: 5px; }
.fc-asset-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.fc-asset-name { display: flex; align-items: center; gap: 7px; font-size: 11px; color: var(--fc-label); }
.fc-dot { display: inline-block; flex: 0 0 auto; width: 7px; height: 7px; border-radius: 2px; background: currentColor; }
.fc-asset-input { display: flex; align-items: center; color: var(--fc-muted); gap: 4px; font-size: 10px; }
.fc-asset-input input { width: 49px; min-height: 27px; padding: 3px 5px; text-align: right; border: 1px solid var(--fc-line-strong); border-radius: 5px; color: var(--fc-ink); background: var(--fc-card-soft); font-size: 11px; font-variant-numeric: tabular-nums; }
.fc-asset-input input.fc-drag-number { cursor: ew-resize; touch-action: pan-y; }
.fc-asset-input input.fc-drag-number:focus { cursor: text; }
.fc-event { padding: 12px; border: 1px solid var(--fc-line); border-radius: 7px; background: var(--fc-card-soft); }
.fc-cashflow-income { border-color: var(--fc-income-line); background: var(--fc-income-bg); box-shadow: inset 3px 0 0 var(--fc-income-bar); }
.fc-cashflow-expense { border-color: var(--fc-amber-line); background: var(--fc-amber-soft); box-shadow: inset 3px 0 0 var(--fc-expense-bar); }
.fc-cashflow-list .fc-event.is-collapsed { padding: 10px 10px 9px 8px; }
.fc-cashflow-income .fc-event-head strong, .fc-cashflow-income .fc-event-title-input { color: var(--fc-income-ink); }
.fc-cashflow-expense .fc-event-head strong, .fc-cashflow-expense .fc-event-title-input { color: var(--fc-amber-ink); }
.fc-event-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 9px; }
.fc-cashflow-list .fc-event-head { align-items: flex-start; justify-content: flex-start; gap: 2px; margin-bottom: 0; }
.fc-event-list .fc-event-head { align-items: flex-start; justify-content: flex-start; gap: 2px; margin-bottom: 0; }
.fc-event-summary { display: grid; min-width: 0; flex: 1; gap: 6px; }
.fc-event-title-row { display: flex; min-width: 0; align-items: center; gap: 5px; }
.fc-event-actions { display: flex; flex: 0 0 auto; align-items: center; gap: 1px; }
.fc-event-amount { display: inline-flex; flex: 0 0 auto; align-items: baseline; gap: 3px; color: var(--fc-ink); font-variant-numeric: tabular-nums; line-height: 1.2; white-space: nowrap; }
.fc-event-head .fc-event-amount strong { font-size: 10px; font-weight: 650; letter-spacing: -.01em; }
.fc-event-amount small { color: var(--fc-muted); font-size: 8px; font-weight: 500; }
.fc-event-amount-input { width: 74px; min-width: 0; padding: 2px 4px; border: 1px solid transparent; border-radius: 4px; background: transparent; color: var(--fc-ink); font-size: 11px; font-weight: 650; font-variant-numeric: tabular-nums; text-align: right; appearance: textfield; touch-action: pan-y; }
.fc-event-amount-input::-webkit-inner-spin-button, .fc-event-amount-input::-webkit-outer-spin-button { appearance: none; margin: 0; }
.fc-event-amount-input:hover { border-color: var(--fc-line); background: var(--fc-input-bg); }
.fc-event-amount-input:focus { outline: none; border-color: var(--fc-focus); background: var(--fc-input-bg); box-shadow: 0 0 0 2px #347a5614; }
.fc-event-amount-input.is-dragging { cursor: ew-resize; user-select: none; background: var(--fc-hover-bg); border-color: var(--fc-focus); }
.fc-cashflow-income .fc-event-amount-input { color: var(--fc-income-ink); }
.fc-cashflow-expense .fc-event-amount-input { color: var(--fc-amber-ink); }
.fc-event-meta { display: flex; min-width: 0; flex-wrap: wrap; align-items: center; gap: 5px; }
.fc-event-age-tag, .fc-event-inflation-tag { display: inline-flex; min-height: 20px; align-items: center; gap: 4px; padding: 2px 7px; border: 1px solid var(--fc-green-line); border-radius: 999px; background: var(--fc-pale); color: var(--fc-green-ink); font-size: 9px; font-weight: 550; font-variant-numeric: tabular-nums; line-height: 1.2; white-space: nowrap; }
.fc-event-age-tag { cursor: pointer; }
.fc-event-age-tag.fc-event-age-input-wrap { cursor: text; }
.fc-event-age-input { width: 3ch; min-width: 0; padding: 0 1px; border: 0; border-radius: 3px; background: transparent; color: inherit; font: inherit; font-size: 9px; font-weight: 550; text-align: right; appearance: textfield; touch-action: pan-y; }
.fc-event-age-input::-webkit-inner-spin-button, .fc-event-age-input::-webkit-outer-spin-button { appearance: none; margin: 0; }
.fc-event-age-input:hover { background: var(--fc-input-bg); }
.fc-event-age-input:focus { outline: none; background: var(--fc-input-bg); box-shadow: 0 0 0 2px #347a5614; }
.fc-event-age-input.is-dragging { cursor: ew-resize; user-select: none; background: var(--fc-hover-bg); }
.fc-event-inflation-tag { border-color: var(--fc-line); background: var(--fc-card); color: var(--fc-soft-ink); }
.fc-event-inflation-tag.is-fixed { border-style: dashed; background: var(--fc-input-bg); color: var(--fc-muted); }
.fc-event-inflation-tag.is-fixed svg { opacity: .55; }
.fc-event-head strong { font-size: 11px; font-weight: 550; }
.fc-event-title-input { min-width: 2.5em; flex: 1; padding: 2px 4px; border: 1px solid transparent; border-radius: 4px; color: var(--fc-ink); background: transparent; font-size: 11px; font-weight: 550; }
.fc-event-title-input:hover { border-color: var(--fc-line); background: var(--fc-input-bg); }
.fc-event-title-input:focus { outline: none; border-color: var(--fc-focus); background: var(--fc-input-bg); box-shadow: 0 0 0 2px #347a5614; }
.fc-event-head .fc-event-title-input { cursor: text; }
.fc-event-head button { border: 0; background: none; padding: 1px 3px; color: var(--fc-muted); font-size: 18px; line-height: 1; }
.fc-event-head .fc-drag-handle { flex: 0 0 auto; padding: 1px 6px; color: var(--fc-faint); font-size: 13px; cursor: grab; touch-action: none; }
.fc-event-head .fc-drag-handle:hover { color: var(--fc-muted); background: var(--fc-pale); border-radius: 4px; }
.fc-event-head button.fc-event-inflation-tag { padding: 2px 7px; border: 1px solid var(--fc-line); border-radius: 999px; background: var(--fc-card); color: var(--fc-soft-ink); font-size: 9px; line-height: 1.2; }
.fc-event-head button.fc-event-inflation-tag.is-fixed { border-style: dashed; background: var(--fc-input-bg); color: var(--fc-muted); }
.fc-event-head button.fc-event-inflation-tag:hover { border-color: var(--fc-hover-line); background: var(--fc-pale); color: var(--fc-green-ink); }
.fc-event-head .fc-card-toggle { flex: 0 0 auto; padding: 2px 6px; border: 1px solid var(--fc-input-line) !important; border-radius: 5px; color: var(--fc-label); background: var(--fc-input-bg) !important; font-size: 9px; line-height: 1.3; }
.fc-event-head .fc-card-toggle:hover { color: var(--fc-soft-ink); border-color: var(--fc-hover-line) !important; }
.fc-event-head .fc-card-toggle.off { color: var(--fc-amber-ink); border-color: var(--fc-amber-line) !important; background: var(--fc-amber-soft) !important; }
.fc-event-body { margin-top: 9px; }
.fc-event-body[hidden] { display: none; }
.fc-event.is-disabled { opacity: 0.55; }
.fc-event.is-disabled .fc-event-title-input { text-decoration: line-through; }
.fc-event-head .fc-drag-handle:active { cursor: grabbing; }
.fc-event.is-dragging { opacity: 0.65; }
.fc-shell.is-reordering, .fc-shell.is-reordering * { user-select: none; }
.fc-event .fc-field input, .fc-event .fc-field select { font-size: 11px; }
.fc-event + .fc-event { margin-top: -6px; }
.fc-cashflow-columns { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; align-items: start; }
.fc-cashflow-column { display: grid; min-width: 0; gap: 8px; padding: 10px; border: 1px dashed var(--fc-line-strong); border-radius: 8px; background: var(--fc-card-soft); }
.fc-cashflow-column-title { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin: 0; color: var(--fc-soft-ink); font-size: 10px; font-weight: 650; }
.fc-cashflow-column-title > span { color: var(--fc-faint); font-size: 9px; font-weight: 500; }
.fc-cashflow-column-income .fc-cashflow-column-title { color: var(--fc-income-ink); }
.fc-cashflow-column-expense .fc-cashflow-column-title { color: var(--fc-amber-ink); }
.fc-cashflow-column .fc-cashflow-list { margin-top: 0; }
.fc-cashflow-column .fc-button-row { margin-top: 0; }
.fc-cashflow-column .fc-btn.small { width: 100%; }
.fc-cashflow-list { display: grid; gap: 8px; margin-top: 10px; }
.fc-cashflow-list .fc-event + .fc-event { margin-top: 0; }
.fc-cashflow-previous-note { margin: -6px 0 0; padding: 5px 8px; border: 1px dashed var(--fc-line); border-radius: 5px; background: var(--fc-card-soft); }
.fc-event-columns { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; align-items: start; margin-top: 10px; }
.fc-event-column { display: grid; min-width: 0; gap: 8px; padding: 10px; border: 1px dashed var(--fc-line-strong); border-radius: 8px; background: var(--fc-card-soft); }
.fc-event-list { display: grid; gap: 8px; }
.fc-event-column .fc-button-row { margin-top: 0; }
.fc-event-column .fc-btn.small { width: 100%; }
.fc-button-row { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
.fc-end-age-control { display: flex; align-items: center; gap: 8px; min-height: 35px; padding: 4px 8px; border: 1px solid var(--fc-input-line); border-radius: 6px; background: var(--fc-input-bg); }
.fc-end-age-check { display: flex; align-items: center; gap: 5px; flex: 0 0 auto; color: var(--fc-label); font-size: 10px; white-space: nowrap; }
.fc-end-age-check input { accent-color: var(--fc-green); }
.fc-age-side.is-end .fc-end-age-check input { accent-color: var(--fc-amber); }
.fc-age-controls { display: grid; gap: 10px; margin-top: 12px; }
.fc-age-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.fc-age-side { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.fc-age-side.is-end { align-items: flex-end; }
.fc-age-label { color: var(--fc-label); font-size: 11px; }
.fc-age-end-checks { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 10px; }
.fc-age-range { display: grid; gap: 8px; }
.fc-age-track { position: relative; height: 20px; margin: 0 9px; }
.fc-age-track::before { content: ""; position: absolute; top: 8px; left: 0; right: 0; height: 4px; border-radius: 4px; background: var(--fc-line); }
.fc-age-fill { position: absolute; top: 8px; height: 4px; border-radius: 4px; background: var(--fc-green-line); }
.fc-age-thumb { position: absolute; top: 0; z-index: 1; width: 18px; height: 18px; padding: 0; transform: translateX(-50%); border: 2px solid var(--fc-card); border-radius: 50%; background: var(--fc-green); box-shadow: 0 0 0 1px var(--fc-green-line); cursor: ew-resize; touch-action: none; }
.fc-age-thumb:hover:not(:disabled), .fc-age-thumb:focus-visible { background: var(--fc-green-dark); }
.fc-age-thumb.is-end { background: var(--fc-amber); box-shadow: 0 0 0 1px var(--fc-amber-line); }
.fc-age-thumb.is-end:hover:not(:disabled), .fc-age-thumb.is-end:focus-visible { background: var(--fc-amber-ink); }
.fc-age-thumb:disabled { opacity: 0.45; cursor: default; }
.fc-age-values { display: flex; align-items: center; gap: 7px; }
.fc-age-values input.fc-drag-number { width: 46px; min-height: 27px; padding: 3px 5px; border: 1px solid var(--fc-line-strong); border-radius: 5px; color: var(--fc-ink); background: var(--fc-card-soft); font-size: 11px; font-variant-numeric: tabular-nums; cursor: ew-resize; touch-action: pan-y; appearance: textfield; text-align: center; }
.fc-age-values input.fc-drag-number::-webkit-inner-spin-button, .fc-age-values input.fc-drag-number::-webkit-outer-spin-button { appearance: none; margin: 0; }
.fc-age-values input.fc-drag-number:focus { cursor: text; }
.fc-age-values input.fc-drag-number:disabled { color: var(--fc-faint); opacity: 1; cursor: default; }
.fc-age-values > span, .fc-age-values > b { color: var(--fc-muted); font-size: 10px; }
.fc-age-values > b { font-weight: 450; }
.fc-event .fc-end-age-control > input[type="number"] { min-width: 0; width: auto; min-height: 0; flex: 1; padding: 0; border: 0; border-radius: 0; background: transparent; text-align: right; }
.fc-event .fc-end-age-control > input[type="number"]:focus { border: 0; }
.fc-event .fc-end-age-control > input[type="number"]:disabled { color: var(--fc-faint); opacity: 1; }
.fc-event .fc-end-age-control > input.fc-drag-number { cursor: ew-resize; touch-action: pan-y; }
.fc-event .fc-end-age-control > input.fc-drag-number:focus { cursor: text; }
.fc-end-age-control > b { flex: 0 0 auto; color: var(--fc-muted); font-size: 10px; font-weight: 450; }
.fc-config-footer { display: grid; flex: 0 0 auto; gap: 10px; padding: 16px 22px; background: var(--fc-card-soft); border-top: 1px solid var(--fc-line); border-radius: 0 0 16px 16px; }
.fc-config-actions { display: flex; gap: 8px; align-items: stretch; }
.fc-config-actions .fc-btn { width: auto; min-height: 41px; white-space: nowrap; }
.fc-config-actions .fc-btn.primary { flex: 1; }
.fc-config-footnote { text-align: center; font-size: 9px; color: var(--fc-faint); }
.fc-config-progress { height: 3px; border-radius: 4px; background: var(--fc-line); overflow: hidden; }
.fc-config-progress i { display: block; height: 100%; background: var(--fc-green); }
.fc-issues { margin: 0; padding-left: 15px; color: var(--fc-amber-ink); font-size: 10px; }
.fc-results { display: grid; min-width: 0; gap: 19px; padding-bottom: 104px; }
.fc-results[data-controls-compact="true"] { padding-bottom: 174px; }
.fc-result-label { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 1px 0; }
.fc-result-label h2 { display: flex; align-items: center; gap: 8px; margin: 0; font-size: 13px; font-weight: 600; }
.fc-live-dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: var(--fc-green); }
.fc-badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 8px; border: 1px solid var(--fc-green-line); border-radius: 5px; font-size: 9px; color: var(--fc-soft-ink); background: var(--fc-pale); white-space: nowrap; }
.fc-badge.stale { color: var(--fc-amber-ink); border-color: var(--fc-amber-line); background: var(--fc-amber-soft); }
.fc-summary { display: grid; grid-template-columns: 1.1fr 1fr 1fr 1fr; gap: 12px; }
.fc-stat { min-width: 0; padding: 18px 16px 16px; border: 1px solid var(--fc-line); border-radius: 9px; background: var(--fc-card); }
.fc-stat.highlight { background: var(--fc-green-soft); border-color: var(--fc-green-line); }
.fc-stat-label { display: flex; align-items: center; gap: 5px; color: var(--fc-label); font-size: 10px; }
.fc-stat-value { display: flex; align-items: baseline; gap: 4px; margin: 9px 0 5px; font-size: clamp(20px, 2.1vw, 29px); font-weight: 600; letter-spacing: -.045em; line-height: 1.2; font-variant-numeric: tabular-nums; white-space: nowrap; }
.fc-stat-value small { font-size: 12px; font-weight: 450; color: var(--fc-muted); letter-spacing: 0; }
.fc-stat.highlight .fc-stat-value { color: var(--fc-green-ink); }
.fc-stat-rate-body { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 14px; min-width: 0; margin: 8px 0 6px; }
.fc-stat-rate-body .fc-stat-value { margin: 0; }
.fc-stat-percentiles { display: grid; flex: 1 1 210px; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 4px 10px; min-width: 0; margin: 0; }
.fc-stat-percentiles > div { display: flex; align-items: baseline; gap: 3px; min-width: 0; }
.fc-stat-percentiles dt { overflow: hidden; color: var(--fc-faint); font-size: 8px; text-overflow: ellipsis; white-space: nowrap; }
.fc-stat-percentiles dd { margin: 0; color: var(--fc-soft-ink); font-size: 9px; font-weight: 600; font-variant-numeric: tabular-nums; white-space: nowrap; }
.fc-stat-percentiles > div.is-primary dd { color: var(--fc-green-ink); }
.fc-stat-caption { color: var(--fc-faint); font-size: 9px; line-height: 1.55; }
.fc-dynamic-note { margin-top: -4px; overflow: hidden; border: 1px solid var(--fc-amber-line); border-radius: 8px; background: var(--fc-amber-soft); color: var(--fc-amber-ink); font-size: 10px; line-height: 1.8; }
.fc-dynamic-note-line { display: flex; width: 100%; flex-wrap: wrap; align-items: flex-start; gap: 8px; padding: 11px 14px; border: 0; background: transparent; color: inherit; font: inherit; line-height: inherit; text-align: left; cursor: pointer; }
.fc-dynamic-note-line:hover { background: color-mix(in srgb, var(--fc-amber-line) 28%, transparent); }
.fc-dynamic-note-line > svg { flex: 0 0 auto; margin-top: 3px; }
.fc-dynamic-note-copy { flex: 1 1 230px; min-width: 0; }
.fc-dynamic-note-action { display: inline-flex; flex: 0 0 auto; align-items: center; gap: 4px; min-height: 25px; margin: 1px 0 0 auto; padding: 2px 8px; border: 1px solid var(--fc-amber-line); border-radius: 5px; background: var(--fc-card); color: var(--fc-amber-ink); font-size: 9px; font-weight: 600; white-space: nowrap; transition: border-color .16s, background .16s; }
.fc-dynamic-note-line:hover .fc-dynamic-note-action { border-color: var(--fc-amber); background: var(--fc-amber-soft); }
.fc-dynamic-note-action .fc-disclosure-chevron { width: 10px; height: 10px; }
.fc-dynamic-note.is-open .fc-dynamic-note-action .fc-disclosure-chevron { transform: rotate(180deg); }
.fc-dynamic-note-body { padding: 0 10px 10px; }
.fc-dynamic-note .fc-spending-cut-card { color: var(--fc-ink); border-color: var(--fc-amber-line); }
.fc-card { min-width: 0; border: 1px solid var(--fc-line); border-radius: 10px; background: var(--fc-card); }
.fc-card-header { display: flex; align-items: start; justify-content: space-between; gap: 16px; padding: 21px 22px 0; }
.fc-card-title { display: flex; align-items: center; gap: 8px; margin: 0; font-size: 13px; font-weight: 650; }
.fc-card-header p { margin: 4px 0 0; font-size: 10px; color: var(--fc-faint); }
.fc-card-header-actions { display: flex; flex-wrap: wrap; align-items: center; justify-content: end; gap: 8px; }
.fc-toggle { display: inline-flex; padding: 3px; border: 1px solid var(--fc-line); border-radius: 6px; background: var(--fc-toggle-bg); white-space: nowrap; }
.fc-toggle button { padding: 4px 9px; border: 0; border-radius: 4px; font-size: 9px; color: var(--fc-muted); background: transparent; }
.fc-toggle button[aria-pressed="true"] { background: var(--fc-card); color: var(--fc-soft-ink); box-shadow: 0 1px 3px #26371b12; }
.fc-chart-wrap { position: relative; margin: 12px 16px 4px; }
.fc-chart { display: block; width: 100%; height: auto; overflow: visible; aspect-ratio: 900 / 345; touch-action: pan-y; }
.fc-chart text { font-family: inherit; font-size: 10px; fill: var(--fc-faint); font-variant-numeric: tabular-nums; }
.fc-chart .fc-grid-line { stroke: var(--fc-line); stroke-width: 1; stroke-dasharray: 3 4; }
.fc-chart .fc-axis-line { stroke: var(--fc-line); stroke-width: 1; }
.fc-balance-selected-marker { transition: transform .28s cubic-bezier(.2,.8,.2,1); }
.fc-chart-legend { display: flex; justify-content: center; align-items: center; flex-wrap: wrap; gap: 19px; padding: 1px 15px 16px; color: var(--fc-muted); font-size: 9px; }
.fc-chart-legend > span, .fc-chart-legend > button { display: flex; align-items: center; gap: 6px; }
.fc-chart-legend > button { padding: 0; border: 0; color: inherit; font: inherit; background: transparent; }
.fc-line-swatch { width: 16px; border-top: 2px solid currentColor; }
.fc-band-swatch { width: 15px; height: 8px; border-radius: 2px; background: currentColor; }
.fc-chart-bottom { display: flex; justify-content: space-between; gap: 10px; padding: 10px 22px 12px; border-top: 1px solid var(--fc-line); color: var(--fc-faint); font-size: 9px; }
.fc-chart-tooltip { position: absolute; z-index: 2; top: 18px; min-width: 154px; max-width: calc(100% - 30px); padding: 11px 12px; border: 1px solid var(--fc-line-strong); border-radius: 7px; background: var(--fc-tooltip-bg); color: var(--fc-soft-ink); box-shadow: 0 4px 20px #3d582015; pointer-events: none; font-size: 10px; }
.fc-chart-tooltip--cursor { position: fixed; z-index: 50; width: min(250px, calc(100vw - 32px)); max-width: none; box-shadow: 0 8px 24px #2134292b; transform: translate(14px, 14px); }
.fc-chart-tooltip--cursor.is-left { transform: translate(calc(-100% - 14px), 14px); }
.fc-chart-tooltip--cursor.is-above { transform: translate(14px, calc(-100% - 14px)); }
.fc-chart-tooltip--cursor.is-left.is-above { transform: translate(calc(-100% - 14px), calc(-100% - 14px)); }
.fc-chart-tooltip strong { display: block; margin-bottom: 6px; color: var(--fc-green-ink); font-size: 11px; }
.fc-chart-tooltip > small { display: block; margin: -2px 0 6px; color: var(--fc-faint); font-size: 8px; }
.fc-chart-tooltip > span { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.fc-chart-tooltip b { font-size: 11px; font-weight: 550; font-variant-numeric: tabular-nums; }
.fc-result-chart-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); grid-template-rows: auto auto auto auto auto 18px auto auto auto auto auto auto auto 18px auto; column-gap: 18px; row-gap: 0; align-items: stretch; }
.fc-result-chart-grid > .fc-balance-chart { grid-area: 1 / 1 / 6 / 2; }
.fc-result-chart-grid > .fc-balance-distribution { grid-area: 1 / 2 / 6 / 3; }
.fc-result-chart-grid > .fc-flow-trend { grid-area: 7 / 1 / 14 / 2; }
.fc-result-chart-grid > .fc-flow-waterfall-card { grid-area: 7 / 2 / 14 / 3; }
.fc-result-chart-grid > .fc-flow-table-card { grid-area: 15 / 1 / 16 / 3; }
.fc-result-chart-grid > .fc-balance-chart, .fc-result-chart-grid > .fc-balance-distribution, .fc-result-chart-grid > .fc-flow-trend, .fc-result-chart-grid > .fc-flow-waterfall-card { display: grid; grid-template-rows: subgrid; min-width: 0; min-height: 0; }
.fc-result-chart-grid > .fc-card .fc-card-header { flex-wrap: wrap; }
.fc-result-chart-grid > .fc-card .fc-card-header > div:first-child { min-width: 0; flex: 1; }
.fc-result-chart-grid > .fc-balance-chart .fc-chart-wrap, .fc-result-chart-grid > .fc-balance-distribution .fc-chart-wrap { display: flex; min-height: 0; align-items: flex-end; }
.fc-result-chart-grid > .fc-balance-chart .fc-chart, .fc-result-chart-grid > .fc-balance-distribution .fc-chart { min-height: 280px; flex: 0 0 auto; }
.fc-result-chart-grid > .fc-flow-trend .fc-flow-chart-stage, .fc-result-chart-grid > .fc-flow-trend .fc-flow-chart-scroll { min-width: 0; max-width: 100%; }
.fc-result-chart-grid > .fc-flow-trend .fc-flow-chart-scroll { flex: 1 1 auto; height: auto; min-height: 0; overflow: hidden; margin-right: 8px; margin-left: 8px; }
.fc-result-chart-grid > .fc-flow-trend .fc-flow-chart { width: 100%; height: 100%; min-width: 0; }
.fc-result-chart-grid > .fc-flow-trend .fc-flow-chart-stage { display: flex; min-height: 0; flex-direction: column; overflow: hidden; }
.fc-flow-waterfall-bottom { align-items: center; }
.fc-shared-chart-controls { position: fixed; z-index: 30; right: 12px; bottom: max(12px, env(safe-area-inset-bottom, 12px)); left: 12px; display: grid; grid-template-columns: minmax(190px, 240px) minmax(0, 1fr); align-items: center; gap: 8px 14px; padding: 10px 14px; border: 1px solid var(--fc-line-strong); border-radius: 9px; background: var(--fc-card-soft); box-shadow: 0 14px 38px #1d2b202b; }
.fc-shared-chart-controls[data-compact="true"] { grid-template-columns: 1fr; align-items: stretch; gap: 7px; padding: 10px 14px; }
.fc-shared-chart-controls > .fc-field { min-width: 0; }
.fc-selected-path-dock { display: grid; width: 100%; min-width: 0; grid-template-columns: minmax(62px, .42fr) minmax(0, 1.58fr); grid-template-areas: "head assets"; align-items: start; gap: 0 12px; padding: 7px 9px; border: 1px solid var(--fc-line); border-radius: 6px; background: var(--fc-card); text-align: left; cursor: pointer; }
.fc-selected-path-dock:hover { border-color: var(--fc-hover-line); background: var(--fc-hover-bg); }
.fc-selected-path-dock:focus-visible { outline: 2px solid var(--fc-green-line); outline-offset: 2px; }
.fc-selected-path-dock-head { display: grid; grid-area: head; min-width: 0; gap: 1px; }
.fc-selected-path-dock-head > span { color: var(--fc-faint); font-size: 8px; }
.fc-selected-path-dock-head > strong { overflow: hidden; color: var(--fc-soft-ink); font-size: 11px; font-weight: 620; text-overflow: ellipsis; white-space: nowrap; }
.fc-selected-path-dock-assets { display: grid; grid-area: assets; min-width: 0; gap: 2px; }
.fc-selected-path-dock-assets > span { display: flex; min-width: 0; align-items: baseline; justify-content: space-between; gap: 8px; }
.fc-selected-path-dock-assets em { flex: 0 0 auto; color: var(--fc-faint); font-size: 8px; font-style: normal; }
.fc-selected-path-dock-assets b { overflow: hidden; color: var(--fc-soft-ink); font-size: 9px; font-weight: 600; font-variant-numeric: tabular-nums; text-overflow: ellipsis; white-space: nowrap; }
.fc-selected-path-dock-assets > .is-rate b { color: var(--fc-green-ink); font-weight: 650; }
.fc-selected-path-dock-assets > .is-failure em, .fc-selected-path-dock-assets > .is-failure b { color: var(--fc-amber-ink); }
.fc-shared-year-field { display: grid; grid-template-columns: minmax(0, max-content) minmax(0, 1fr); align-items: center; gap: 8px; }
.fc-shared-year-meta { display: grid; min-width: 0; gap: 1px; }
.fc-shared-year-value { display: flex; min-width: 0; align-items: baseline; gap: 9px; }
.fc-shared-year-value > label { color: var(--fc-label); font-size: 11px; white-space: nowrap; }
.fc-shared-year-field output { color: var(--fc-soft-ink); font-size: 11px; font-variant-numeric: tabular-nums; white-space: nowrap; }
.fc-shared-year-range { display: grid; min-width: 0; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 9px; }
.fc-shared-year-range input[type="range"] { width: 100%; margin: 0; accent-color: var(--fc-green); }
.fc-shared-year-summary { overflow: hidden; margin: 0; color: var(--fc-muted); font-size: 9px; font-variant-numeric: tabular-nums; line-height: 1.45; text-overflow: ellipsis; white-space: nowrap; }
.fc-flow-note { margin: 14px 22px; color: var(--fc-muted); font-size: 11px; }
.fc-path-explorer-chart-stage { position: relative; }
.fc-path-explorer-chart-wrap { overflow-x: auto; overscroll-behavior-x: contain; }
.fc-path-explorer-chart { min-width: 650px; aspect-ratio: 900 / 320; cursor: crosshair; touch-action: pan-x pan-y; }
.fc-path-explorer-chart.is-brushing { cursor: crosshair; user-select: none; }
.fc-path-reset-zoom { position: absolute; z-index: 4; top: 31px; right: 25px; min-height: 27px; padding: 3px 10px; border-color: var(--fc-line-strong); background: var(--fc-card); box-shadow: 0 5px 16px #1d2b2026; color: var(--fc-muted); }
.fc-path-point { fill: var(--fc-green); opacity: .46; transition: opacity .14s ease; }
.fc-path-point.is-failure { fill: var(--fc-amber); }
.fc-path-point:hover { opacity: 1; }
.fc-path-brush { fill: transparent; stroke: var(--fc-green); stroke-width: 1; stroke-dasharray: 3 3; pointer-events: none; }
.fc-path-selected circle:first-child { fill: var(--fc-card); stroke: var(--fc-green); stroke-width: 2; }
.fc-path-selected circle:last-child { fill: var(--fc-green); }
.fc-path-explorer-percentiles { display: grid; gap: 7px; margin: 0 22px 6px; padding: 10px 12px 11px; border: 1px solid var(--fc-line); border-radius: 8px; background: var(--fc-card-soft); }
.fc-path-explorer-percentiles-heading { display: flex; align-items: baseline; justify-content: space-between; gap: 4px 14px; flex-wrap: wrap; }
.fc-path-explorer-percentiles-heading > span { color: var(--fc-soft-ink); font-size: 10px; font-weight: 650; }
.fc-path-explorer-percentiles-heading > small { color: var(--fc-faint); font-size: 9px; }
.fc-path-explorer-percentiles-items { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 6px; }
.fc-path-percentile-chip { display: grid; grid-template-columns: 3px minmax(0, 1fr) auto; align-items: center; gap: 5px; min-width: 0; padding: 4px 6px; border: 1px solid var(--fc-line); border-radius: 5px; background: var(--fc-card); }
.fc-path-percentile-chip > i { display: block; width: 2px; height: 11px; border-radius: 2px; background: var(--fc-green); opacity: .5; }
.fc-path-percentile-chip.is-inner > i { opacity: .72; }
.fc-path-percentile-chip.is-median { border-color: var(--fc-green-line); background: var(--fc-pale); }
.fc-path-percentile-chip.is-median > i { width: 3px; opacity: 1; }
.fc-path-percentile-chip em { color: var(--fc-faint); font-size: 8px; font-style: normal; font-weight: 650; letter-spacing: .03em; }
.fc-path-percentile-chip strong { color: var(--fc-soft-ink); font-size: 10px; font-weight: 650; font-variant-numeric: tabular-nums; white-space: nowrap; }
.fc-path-percentile-chip.is-median em, .fc-path-percentile-chip.is-median strong { color: var(--fc-green-ink); }
.fc-path-percentile { stroke: var(--fc-green); stroke-width: .8; stroke-dasharray: 3 3; opacity: .4; pointer-events: none; vector-effect: non-scaling-stroke; }
.fc-path-percentile.is-inner { stroke-width: 1; opacity: .58; }
.fc-path-percentile.is-median { stroke-width: 1.4; stroke-dasharray: none; opacity: .86; }
.fc-path-percentile-label { fill: var(--fc-faint) !important; font-size: 8.5px !important; font-weight: 550; paint-order: stroke; stroke: var(--fc-card); stroke-width: 3px; stroke-linejoin: round; }
.fc-path-percentile-label.is-inner { fill: var(--fc-soft-ink) !important; }
.fc-path-percentile-label.is-median { fill: var(--fc-green-ink) !important; font-size: 9px !important; font-weight: 700; }
.fc-path-explorer-slider { display: grid; gap: 5px; margin: 5px 22px 15px; padding: 10px 12px 8px; border: 1px solid var(--fc-line); border-radius: 8px; background: var(--fc-card-soft); }
.fc-path-explorer-slider-head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
.fc-path-explorer-slider-head label { color: var(--fc-soft-ink); font-size: 10px; font-weight: 600; }
.fc-path-explorer-slider-head output { color: var(--fc-faint); font-size: 9px; font-variant-numeric: tabular-nums; }
.fc-path-explorer-slider input[type="range"] { width: 100%; margin: 0; accent-color: var(--fc-green); cursor: ew-resize; }
.fc-path-explorer-legend { justify-content: flex-start; padding-right: 22px; padding-left: 22px; }
.fc-path-explorer-legend > span.is-failure { color: var(--fc-amber-ink); }
.fc-path-success-swatch, .fc-path-failure-swatch, .fc-path-selected-swatch { display: inline-block; flex: 0 0 auto; width: 7px; height: 7px; border-radius: 50%; background: var(--fc-green); opacity: .52; }
.fc-path-failure-swatch { background: var(--fc-amber); }
.fc-path-selected-swatch { width: 10px; height: 10px; border: 2px solid var(--fc-green); background: var(--fc-card); opacity: 1; }
.fc-path-percentile-swatch { display: inline-block; flex: 0 0 auto; width: 16px; border-top: 1px dashed var(--fc-green); opacity: .58; }
.fc-path-explorer-close { min-width: 28px; padding-right: 7px; padding-left: 7px; font-size: 15px; line-height: 1; }
.fc-path-explorer-dialog-overlay { position: fixed; inset: 0; z-index: 80; display: grid; place-items: center; padding: 16px; background: #07130b99; backdrop-filter: blur(3px); animation: fc-fade-in .16s ease-out; }
.fc-path-explorer-dialog-panel { width: min(1120px, calc(100vw - 32px)); max-height: calc(100dvh - 32px); overflow-y: auto; overscroll-behavior: contain; border-radius: 11px; outline: none; box-shadow: 0 28px 80px #00000073; animation: fc-popover-in .18s ease-out; }
.fc-path-explorer-dialog-panel > .fc-path-explorer { border-color: var(--fc-line-strong); }
.fc-flow .fc-field { min-width: 155px; }
.fc-flow-chart-stage { position: relative; }
.fc-flow-chart-scroll { overflow-x: auto; margin: 0 12px; }
.fc-flow-chart { display: block; width: 100%; min-width: 560px; }
.fc-flow-chart text { font-size: 12px; fill: var(--fc-label); font-variant-numeric: tabular-nums; }
.fc-flow-chart .fc-grid-line, .fc-flow-chart .fc-axis-line { stroke: var(--fc-line-strong); }
.fc-flow .fc-chart-legend { font-size: 11px; }
.fc-flow .fc-chart-legend > span, .fc-flow .fc-chart-legend > button { transition: opacity .16s ease, color .16s ease; cursor: default; }
.fc-flow .fc-chart-legend > button { cursor: pointer; }
.fc-flow .fc-chart-legend > button:hover, .fc-flow .fc-chart-legend > button:focus-visible { color: var(--fc-soft-ink); }
.fc-flow .fc-chart-legend > .is-dimmed { opacity: .36; }
.fc-flow .fc-chart-legend > .is-hidden { opacity: .45; text-decoration: line-through; }
.fc-flow-series-line, .fc-flow-series-point { transition: opacity .16s ease; }
.fc-flow-selected-marker { transition: transform .28s cubic-bezier(.2,.8,.2,1); }
.fc-flow-series-point, .fc-flow-year-marker { transition: opacity .16s ease, cy .24s ease; }
.fc-flow-range-end { color: var(--fc-faint); font-size: 10px; }
.fc-flow-summary { display: flex; align-items: stretch; gap: 8px; margin: 0 22px 12px; padding: 12px; border: 1px solid var(--fc-line); border-radius: 8px; background: var(--fc-card-soft); }
.fc-flow-summary > div { display: grid; flex: 1; min-width: 120px; align-content: center; gap: 2px; padding: 5px 7px; }
.fc-flow-waterfall-card .fc-flow-summary { flex-wrap: wrap; gap: 5px 8px; }
.fc-flow-waterfall-card .fc-flow-summary > div { min-width: 0; flex: 1 1 108px; }
.fc-flow-waterfall-card .fc-flow-summary > i { flex: 0 0 auto; }
.fc-flow-summary > div.is-total { border-left: 3px solid var(--fc-green); background: var(--fc-pale); }
.fc-flow-summary span { color: var(--fc-muted); font-size: 9px; }
.fc-flow-summary strong { color: var(--fc-soft-ink); font-size: 15px; font-weight: 600; font-variant-numeric: tabular-nums; }
.fc-flow-summary small { color: var(--fc-faint); font-size: 8px; }
.fc-flow-summary > i { align-self: center; color: var(--fc-muted); font-size: 14px; font-style: normal; }
.fc-flow-trend-summary { display: flex; flex-wrap: wrap; align-items: stretch; gap: 5px 8px; margin: 0 22px 12px; padding: 12px; border: 1px solid var(--fc-line); border-radius: 8px; background: var(--fc-card-soft); }
.fc-flow-trend-summary > div { display: grid; flex: 1 1 108px; min-width: 0; align-content: center; gap: 2px; padding: 5px 7px; }
.fc-flow-trend-summary span { color: var(--fc-muted); font-size: 9px; }
.fc-flow-trend-summary strong { color: var(--fc-soft-ink); font-size: 15px; font-weight: 600; font-variant-numeric: tabular-nums; }
.fc-flow-trend-summary strong.is-negative { color: var(--fc-amber-ink); }
.fc-flow-trend-summary small { color: var(--fc-faint); font-size: 8px; }
.fc-flow-waterfall-help { margin: 0 22px 10px; color: var(--fc-muted); font-size: 10px; line-height: 1.75; }
.fc-flow-waterfall { display: grid; gap: 10px; padding: 0 22px; }
.fc-flow h4 { margin: 0 0 5px; font-size: 12px; font-weight: 600; }
.fc-flow-waterfall-heading { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px 12px; }
.fc-flow-waterfall-heading h4 { margin: 0; }
.fc-flow-waterfall-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 7px; }
.fc-row-settings > summary { min-height: 28px; }
.fc-row-menu { width: min(360px, calc(100vw - 44px)); }
.fc-flow-waterfall-row { position: relative; display: grid; grid-template-columns: minmax(150px, 180px) minmax(0, 1fr) minmax(90px, auto); gap: 10px; align-items: center; font-size: 11px; line-height: 1.45; }
.fc-flow-waterfall-row > span { min-width: 0; }
.fc-flow-waterfall-row > span small { display: block; color: var(--fc-faint); font-size: 9px; line-height: 1.45; white-space: nowrap; }
.fc-flow-waterfall-track { position: relative; height: 18px; background: transparent; }
.fc-flow-waterfall-track::before { content: ""; position: absolute; top: 50%; right: 0; left: 0; border-top: 1px solid var(--fc-line); }
.fc-flow-waterfall-track.has-bar { cursor: help; }
.fc-flow-waterfall-track.has-bar:hover, .fc-flow-waterfall-track.is-active { z-index: 6; }
.fc-flow-waterfall-track.has-bar:focus-visible { z-index: 6; outline: none; }
.fc-flow-waterfall-guide { position: absolute; z-index: 0; top: -12px; bottom: -12px; width: 0; border-left: 1px dashed var(--fc-faint); opacity: .8; pointer-events: none; }
.fc-flow-waterfall-track .fc-flow-waterfall-bar { position: absolute; z-index: 1; top: 2px; min-width: 1px; height: 14px; border-radius: 3px; transition: filter .16s ease, box-shadow .16s ease, opacity .16s ease; }
.fc-flow-waterfall-track.has-bar:hover .fc-flow-waterfall-bar, .fc-flow-waterfall-track.has-bar:focus-visible .fc-flow-waterfall-bar, .fc-flow-waterfall-track.is-active .fc-flow-waterfall-bar { filter: saturate(1.15) brightness(1.04); box-shadow: 0 2px 8px #21342940, 0 0 0 1px currentColor; }
.fc-flow-waterfall-tooltip { position: fixed; z-index: 50; width: max-content; max-width: min(420px, 70vw); padding: 9px 11px; border: 1px solid var(--fc-line-strong); border-radius: 7px; background: var(--fc-tooltip-bg); color: var(--fc-muted); box-shadow: 0 8px 24px #2134292b; font-size: 10px; font-variant-numeric: tabular-nums; line-height: 1.65; transform: translate(12px, 12px); pointer-events: none; }
.fc-flow-waterfall-tooltip.is-left { transform: translate(calc(-100% - 12px), 12px); }
.fc-flow-waterfall-tooltip.is-above { transform: translate(12px, calc(-100% - 12px)); }
.fc-flow-waterfall-tooltip.is-left.is-above { transform: translate(calc(-100% - 12px), calc(-100% - 12px)); }
.fc-flow-waterfall-tooltip strong { display: block; margin-bottom: 2px; color: var(--fc-soft-ink); font-size: 11px; font-weight: 650; }
.fc-flow-waterfall-tooltip span { display: block; white-space: nowrap; }
.fc-flow-trend-tooltip { position: fixed; z-index: 50; width: min(330px, calc(100vw - 32px)); padding: 10px 12px; border: 1px solid var(--fc-line-strong); border-radius: 7px; background: var(--fc-tooltip-bg); color: var(--fc-muted); box-shadow: 0 8px 24px #2134292b; font-size: 10px; font-variant-numeric: tabular-nums; line-height: 1.55; transform: translate(14px, 14px); pointer-events: none; }
.fc-flow-trend-tooltip.is-left { transform: translate(calc(-100% - 14px), 14px); }
.fc-flow-trend-tooltip.is-above { transform: translate(14px, calc(-100% - 14px)); }
.fc-flow-trend-tooltip.is-left.is-above { transform: translate(calc(-100% - 14px), calc(-100% - 14px)); }
.fc-flow-trend-tooltip--anchored { position: absolute; z-index: 4; top: 18px; right: auto; left: 14%; transform: none; }
.fc-flow-trend-tooltip--anchored.is-left { right: 10%; left: auto; transform: none; }
.fc-flow-trend-tooltip strong { display: block; margin-bottom: 6px; color: var(--fc-soft-ink); font-size: 11px; font-weight: 650; }
.fc-flow-trend-tooltip > span { display: grid; grid-template-columns: 18px minmax(0, 1fr) auto; gap: 7px; align-items: center; }
.fc-flow-trend-tooltip > span > i { width: 17px; border-top-width: 2px; }
.fc-flow-trend-tooltip > span > em { overflow: hidden; color: var(--fc-label); font-style: normal; text-overflow: ellipsis; white-space: nowrap; }
.fc-flow-trend-tooltip > span > b { color: var(--fc-soft-ink); font-weight: 550; }
.fc-flow-waterfall-row b { text-align: right; font-weight: 500; font-variant-numeric: tabular-nums; }
.fc-flow-table-actions { display: flex; flex-wrap: wrap; align-items: center; justify-content: end; gap: 8px; }
.fc-asset-summary { margin: 14px 22px 0; overflow: hidden; border: 1px solid var(--fc-line); border-radius: 8px; background: var(--fc-card-soft); }
.fc-asset-summary-head { display: flex; align-items: start; justify-content: space-between; gap: 18px; padding: 11px 14px 10px; }
.fc-asset-summary-head h4 { margin: 0; color: var(--fc-soft-ink); font-size: 11px; font-weight: 650; }
.fc-asset-summary-head p { margin: 2px 0 0; color: var(--fc-faint); font-size: 8px; line-height: 1.55; }
.fc-asset-summary-total { display: grid; flex: 0 0 auto; justify-items: end; gap: 1px; }
.fc-asset-summary-total > span { color: var(--fc-faint); font-size: 8px; }
.fc-asset-summary-total > strong { color: var(--fc-soft-ink); font-size: 15px; font-weight: 650; font-variant-numeric: tabular-nums; letter-spacing: -.015em; white-space: nowrap; }
.fc-asset-summary-total small { color: var(--fc-muted); font-size: 8px; font-weight: 500; letter-spacing: 0; }
.fc-asset-table { width: 100%; border-collapse: collapse; table-layout: fixed; background: var(--fc-card); font-size: 10px; font-variant-numeric: tabular-nums; }
.fc-asset-table th, .fc-asset-table td { padding: 8px 14px; border-top: 1px solid var(--fc-line); text-align: right; }
.fc-asset-table th:first-child { width: 20%; text-align: left; }
.fc-asset-table th:nth-child(2) { width: 20%; }
.fc-asset-table th:nth-child(3) { width: 38%; }
.fc-asset-table th:nth-child(4) { width: 22%; }
.fc-asset-table thead th { padding-top: 6px; padding-bottom: 6px; color: var(--fc-faint); background: var(--fc-card-soft); font-size: 8px; font-weight: 550; }
.fc-asset-table tbody th { color: var(--fc-label); font-weight: 550; }
.fc-asset-name { display: inline-flex; align-items: center; gap: 7px; }
.fc-asset-name > i { width: 7px; height: 7px; flex: 0 0 auto; border-radius: 50%; background: var(--fc-asset-color); box-shadow: 0 0 0 2px color-mix(in srgb, var(--fc-asset-color) 16%, transparent); }
.fc-asset-row.is-stocks { --fc-asset-color: var(--fc-green); }
.fc-asset-row.is-bonds { --fc-asset-color: var(--fc-amber); }
.fc-asset-row.is-cash { --fc-asset-color: var(--fc-flow-investment); }
.fc-asset-row.is-total { --fc-asset-color: var(--fc-soft-ink); }
.fc-asset-amount { color: var(--fc-ink); font-weight: 600; }
.fc-asset-allocation { display: grid; grid-template-columns: minmax(62px, 1fr) 42px; align-items: center; gap: 8px; }
.fc-asset-allocation-track { height: 6px; overflow: hidden; border-radius: 999px; background: var(--fc-line); box-shadow: inset 0 0 0 1px #00000008; }
.fc-asset-allocation-track > i { display: block; height: 100%; border-radius: inherit; background: var(--fc-asset-color); transition: width .24s cubic-bezier(.2,.8,.2,1); }
.fc-asset-allocation > b { color: var(--fc-muted); font-size: 9px; font-weight: 550; text-align: right; }
.fc-asset-return { color: var(--fc-soft-ink); font-weight: 600; }
.fc-asset-return.is-positive { color: var(--fc-green-ink); }
.fc-asset-return.is-negative { color: var(--fc-error-ink); }
.fc-asset-return.is-empty { color: var(--fc-faint); }
.fc-asset-total-share { color: var(--fc-muted); font-size: 9px; font-weight: 550; }
.fc-asset-row.is-total th, .fc-asset-row.is-total td { border-top-color: var(--fc-line-strong); background: var(--fc-pale); }
.fc-asset-row.is-total th { color: var(--fc-soft-ink); font-weight: 650; }
.fc-column-settings { position: relative; }
.fc-column-settings > summary { display: inline-flex; align-items: center; gap: 6px; list-style: none; white-space: nowrap; }
.fc-column-settings > summary::-webkit-details-marker { display: none; }
.fc-disclosure-chevron { width: 12px; height: 12px; flex: 0 0 auto; transition: transform .16s; }
.fc-column-settings[open] > summary .fc-disclosure-chevron { transform: rotate(180deg); }
.fc-column-settings > summary > span { color: var(--fc-faint); font-size: 9px; font-variant-numeric: tabular-nums; }
.fc-column-menu { position: absolute; z-index: 4; top: calc(100% + 7px); right: 0; width: min(430px, calc(100vw - 64px)); padding: 13px; border: 1px solid var(--fc-line-strong); border-radius: 8px; background: var(--fc-card); box-shadow: 0 10px 30px #2134291f; }
.fc-column-menu-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 10px; }
.fc-column-menu-head > strong { color: var(--fc-soft-ink); font-size: 11px; }
.fc-column-menu fieldset { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 3px 12px; margin: 0; padding: 0; border: 0; }
.fc-column-menu legend { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.fc-column-menu label { display: flex; align-items: center; gap: 7px; min-width: 0; padding: 5px 6px; border-radius: 5px; color: var(--fc-label); font-size: 10px; cursor: pointer; }
.fc-column-menu label:hover { background: var(--fc-hover-bg); }
.fc-column-menu input { flex: 0 0 auto; accent-color: var(--fc-green); }
.fc-flow-table-scroll { max-height: min(68vh, 720px); margin: 0 22px; overflow: auto; overscroll-behavior: contain; scrollbar-gutter: stable; }
.fc-flow-table { width: 100%; border-collapse: collapse; white-space: nowrap; font-size: 11px; font-variant-numeric: tabular-nums; }
.fc-flow-table th, .fc-flow-table td { padding: 9px 12px; text-align: right; border-bottom: 1px solid var(--fc-line); }
.fc-flow-table thead th { position: sticky; z-index: 2; top: 0; color: var(--fc-label); background: var(--fc-card); box-shadow: inset 0 -1px 0 var(--fc-line); font-weight: 550; }
.fc-flow-table th:first-child { position: sticky; left: 0; z-index: 1; background: var(--fc-card); text-align: left; }
.fc-flow-table thead th:first-child { z-index: 3; }
.fc-column-help { position: relative; display: inline-grid; width: 15px; height: 15px; margin-left: 5px; padding: 0; place-items: center; border: 1px solid var(--fc-line-strong); border-radius: 50%; background: var(--fc-card-soft); color: var(--fc-faint); font: inherit; font-size: 9px; line-height: 1; cursor: help; vertical-align: 1px; }
.fc-column-help:hover, .fc-column-help:focus { border-color: var(--fc-hover-line); color: var(--fc-green-ink); outline: none; }
.fc-column-help::after { position: absolute; z-index: 10; top: calc(100% + 8px); right: 0; width: 290px; padding: 9px 11px; border: 1px solid var(--fc-line-strong); border-radius: 7px; background: var(--fc-tooltip-bg); box-shadow: 0 8px 24px #2134292b; color: var(--fc-muted); content: attr(data-tooltip); font-size: 9px; font-weight: 450; line-height: 1.7; text-align: left; white-space: pre-line; opacity: 0; visibility: hidden; pointer-events: none; }
.fc-column-help:hover::after, .fc-column-help:focus::after { opacity: 1; visibility: visible; }
.fc-flow-table-value { display: inline-grid; justify-items: end; gap: 1px; line-height: 1.35; }
.fc-flow-table-value > small { color: var(--fc-faint); font-size: 8px; font-weight: 450; white-space: nowrap; }
.fc-flow-table-value > small.is-increase { color: var(--fc-green-ink); }
.fc-flow-table-value > small.is-decrease { color: var(--fc-error-ink); }
.fc-flow-table-value > small.is-neutral { color: var(--fc-faint); }
.fc-spending-adjustment { display: inline-grid; justify-items: end; gap: 1px; line-height: 1.35; color: var(--fc-faint); }
.fc-spending-adjustment-main { display: inline-flex; align-items: center; gap: 3px; }
.fc-spending-adjustment-main svg { width: 10px; height: 14px; fill: none; stroke: currentColor; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
.fc-spending-adjustment-main strong { font-weight: 650; }
.fc-spending-adjustment > small { color: currentColor; font-size: 8px; font-weight: 450; white-space: nowrap; }
.fc-spending-adjustment.is-up { color: var(--fc-green-ink); }
.fc-spending-adjustment.is-down { color: var(--fc-error-ink); }
.fc-spending-adjustment.is-none { color: var(--fc-faint); }
.fc-spending-adjustment.is-hold { color: var(--fc-muted); }
.fc-guardrail-rate { display: inline-grid; justify-items: end; gap: 1px; line-height: 1.35; color: var(--fc-muted); }
.fc-guardrail-rate strong { font-weight: 650; }
.fc-guardrail-rate > small { color: currentColor; font-size: 8px; font-weight: 450; white-space: nowrap; }
.fc-guardrail-rate.is-initial, .fc-guardrail-rate.is-consistent { color: var(--fc-green-ink); }
.fc-guardrail-rate.is-mismatch { color: var(--fc-amber-ink); }
.fc-guardrail-rate-note { margin: 0 22px 12px; padding: 9px 12px; border: 1px solid var(--fc-line); border-radius: 7px; background: var(--fc-card-soft); color: var(--fc-muted); font-size: 10px; line-height: 1.7; }
.fc-guardrail-rate-note strong { font-weight: 650; }
.fc-guardrail-rate-formula { display: block; margin-top: 3px; color: var(--fc-muted); }
.fc-guardrail-rate-note.is-consistent { border-color: var(--fc-green-line); background: var(--fc-green-soft); color: var(--fc-green-ink); }
.fc-guardrail-rate-note.is-mismatch { border-color: var(--fc-amber-line); background: var(--fc-amber-soft); color: var(--fc-amber-ink); }
.fc-flow-table tr.is-selected, .fc-flow-table tr.is-selected th { background: var(--fc-pale); }
.fc-flow-table tr.is-failed > * { color: var(--fc-error-ink); background: var(--fc-error-bg); border-bottom-color: var(--fc-error-line); }
.fc-flow-table tr.is-failed th button { color: var(--fc-error-ink); }
.fc-flow-table tr.is-failed .fc-flow-table-value > small { color: var(--fc-error-ink); opacity: .72; }
.fc-flow-pagination { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 10px; align-items: center; padding: 15px 22px; color: var(--fc-muted); font-size: 11px; }
@media (max-width: 800px) { .fc-result-chart-grid { grid-template-columns: 1fr; grid-template-rows: none; column-gap: 0; row-gap: 18px; } .fc-result-chart-grid > .fc-balance-chart, .fc-result-chart-grid > .fc-balance-distribution, .fc-result-chart-grid > .fc-flow-trend, .fc-result-chart-grid > .fc-flow-waterfall-card { display: flex; flex-direction: column; grid-template-rows: none; } .fc-result-chart-grid > .fc-balance-chart { order: 1; grid-area: auto; } .fc-result-chart-grid > .fc-balance-distribution { order: 2; grid-area: auto; } .fc-result-chart-grid > .fc-flow-trend { order: 3; grid-area: auto; } .fc-result-chart-grid > .fc-flow-waterfall-card { order: 4; grid-area: auto; } .fc-result-chart-grid > .fc-flow-table-card { order: 5; grid-area: auto; } .fc-result-chart-grid > .fc-flow-trend .fc-flow-chart-scroll { flex: none; height: auto; overflow-x: auto; } .fc-result-chart-grid > .fc-flow-trend .fc-flow-chart { height: auto; min-width: 560px; } .fc-flow-legend-spacer { display: none; } .fc-flow-summary { flex-wrap: wrap; } .fc-flow-summary > div { flex-basis: 145px; } .fc-path-explorer-dialog-overlay { padding: 8px; } .fc-path-explorer-dialog-panel { width: calc(100vw - 16px); max-height: calc(100dvh - 16px); } }
@media (max-width: 480px) { .fc-flow-waterfall-row { grid-template-columns: 112px minmax(0, 1fr) minmax(65px, auto); gap: 6px; } .fc-flow-waterfall-tooltip { max-width: calc(100vw - 42px); } .fc-flow-waterfall { padding-left: 14px; padding-right: 14px; } .fc-flow-note, .fc-flow-waterfall-help, .fc-guardrail-rate-note { margin-left: 14px; margin-right: 14px; } .fc-flow-summary, .fc-flow-trend-summary { margin-right: 14px; margin-left: 14px; } .fc-flow-summary > div { min-width: calc(50% - 20px); } .fc-asset-summary { margin-right: 14px; margin-left: 14px; } .fc-asset-summary-head { align-items: flex-start; gap: 10px; padding-right: 10px; padding-left: 10px; } .fc-asset-table th, .fc-asset-table td { padding-right: 7px; padding-left: 7px; } .fc-asset-table thead th:first-child, .fc-asset-table tbody th { width: 17%; } .fc-asset-table th:nth-child(2) { width: 21%; } .fc-asset-table th:nth-child(3) { width: 39%; } .fc-asset-table th:nth-child(4) { width: 23%; } .fc-asset-allocation { grid-template-columns: minmax(34px, 1fr) 37px; gap: 5px; } .fc-asset-allocation > b { font-size: 8px; } .fc-shared-chart-controls { grid-template-columns: 1fr; padding-right: 14px; padding-left: 14px; } .fc-shared-year-field { grid-template-columns: 1fr; gap: 8px; } .fc-column-menu { width: min(360px, calc(100vw - 44px)); } .fc-column-menu fieldset { grid-template-columns: 1fr; } .fc-balance-distribution-legend { padding-right: 14px; padding-left: 14px; } .fc-path-explorer-slider { margin-right: 14px; margin-left: 14px; } .fc-path-explorer-legend { padding-right: 14px; padding-left: 14px; } }
@media (prefers-reduced-motion: reduce) { .fc-flow-series-line, .fc-flow-series-point, .fc-flow-year-marker, .fc-flow .fc-chart-legend > span, .fc-flow .fc-chart-legend > button, .fc-balance-distribution-zero-segment { transition: none; } }
.fc-lower { display: block; }
.fc-strategy { display: flex; align-items: start; gap: 10px; padding: 18px 20px 15px; }
.fc-strategy-icon { display: grid; flex: 0 0 auto; width: 31px; height: 31px; place-items: center; border: 1px solid var(--fc-green-line); border-radius: 8px; color: var(--fc-soft-ink); background: var(--fc-pale); }
.fc-strategy h3 { margin: 0 0 5px; font-size: 11px; font-weight: 650; }
.fc-strategy p { margin: 0; font-size: 10px; color: var(--fc-muted); line-height: 1.9; }
.fc-strategy-metrics { display: grid; grid-template-columns: 1fr 1fr; margin: 0 20px 17px; padding-top: 12px; border-top: 1px solid var(--fc-line); gap: 12px; }
.fc-strategy-metrics span { display: block; font-size: 9px; color: var(--fc-faint); }
.fc-strategy-metrics strong { display: block; margin-top: 3px; font-size: 16px; font-weight: 550; color: var(--fc-soft-ink); font-variant-numeric: tabular-nums; }
.fc-strategy-distribution-stats { margin: 0 20px 18px; padding-top: 12px; border-top: 1px solid var(--fc-line); }
.fc-balance-distribution { display: flex; flex-direction: column; }
.fc-balance-distribution-summary { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin: 14px 20px 0; padding: 11px 12px; border-radius: 8px; background: var(--fc-card-soft); }
.fc-balance-distribution-summary > span { display: grid; gap: 3px; min-width: 0; color: var(--fc-muted); font-size: 9px; }
.fc-balance-distribution-summary strong { overflow: hidden; color: var(--fc-soft-ink); font-size: 14px; font-weight: 600; font-variant-numeric: tabular-nums; text-overflow: ellipsis; white-space: nowrap; }
.fc-balance-distribution-summary small { color: var(--fc-faint); font-size: 8px; font-variant-numeric: tabular-nums; }
.fc-balance-distribution-summary > span.is-failure { color: var(--fc-amber-ink); }
.fc-balance-distribution-summary > span.is-failure strong, .fc-balance-distribution-summary > span.is-failure small { color: var(--fc-amber-ink); }
.fc-balance-snapshot { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin: 14px 20px 0; padding: 11px 12px; border-radius: 8px; background: var(--fc-card-soft); }
.fc-balance-snapshot > span { display: grid; gap: 3px; min-width: 0; color: var(--fc-muted); font-size: 9px; }
.fc-balance-snapshot strong { overflow: hidden; color: var(--fc-soft-ink); font-size: 14px; font-weight: 600; font-variant-numeric: tabular-nums; text-overflow: ellipsis; white-space: nowrap; }
.fc-balance-snapshot small { color: var(--fc-faint); font-size: 8px; font-variant-numeric: tabular-nums; }
.fc-balance-distribution-wrap { flex: 1; }
.fc-balance-distribution-chart { min-height: 280px; }
.fc-balance-distribution-chart text { font-size: 10px; }
.fc-balance-distribution-bar { opacity: .94; pointer-events: none; transition: transform .3s cubic-bezier(.2,.8,.2,1), opacity .16s ease, filter .16s ease; }
.fc-balance-distribution-bar.is-active { opacity: 1; filter: saturate(1.12) brightness(1.04); }
.fc-balance-distribution-zero-segment { opacity: .9; pointer-events: none; transition: transform .3s cubic-bezier(.2,.8,.2,1), opacity .16s ease, filter .16s ease; }
.fc-balance-distribution-zero-segment.is-active { opacity: 1; filter: saturate(1.12) brightness(1.04); }
.fc-balance-percentile-marker { pointer-events: none; transition: transform .3s cubic-bezier(.2,.8,.2,1); }
.fc-balance-percentile-line { stroke: var(--fc-soft-ink); stroke-width: 1; stroke-dasharray: 3 4; opacity: .55; }
.fc-balance-percentile-line.is-median { stroke: var(--fc-green); stroke-width: 1.5; opacity: .9; }
.fc-balance-percentile-label { fill: var(--fc-label) !important; font-size: 9px !important; font-weight: 550; }
.fc-balance-distribution-legend { justify-content: flex-start; padding: 3px 20px 14px; }
.fc-balance-bar-swatch { width: 15px; height: 9px; border-radius: 2px; background: var(--fc-green-line); }
.fc-balance-zero-swatch { width: 15px; height: 9px; border-radius: 2px; background: var(--fc-amber); }
.fc-balance-line-swatch { width: 0; height: 13px; border-left: 1px dashed var(--fc-soft-ink); }
.fc-balance-distribution-legend > span.is-failure { color: var(--fc-amber-ink); }
.fc-balance-distribution .fc-flow-trend-tooltip > span > i { border-top: 2px solid var(--fc-green); }
.fc-balance-distribution .fc-flow-trend-tooltip > span.is-failure > i { border-top-color: var(--fc-amber); }
.fc-balance-distribution .fc-flow-trend-tooltip > span.is-failure > b { color: var(--fc-amber-ink); }
.fc-spending-cut-card { overflow: hidden; }
.fc-spending-cut-summary { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; margin: 14px 20px 0; padding: 12px; border: 1px solid var(--fc-line); border-radius: 8px; background: var(--fc-card-soft); }
.fc-spending-cut-summary > div { display: grid; min-width: 0; gap: 2px; padding: 4px 7px; }
.fc-spending-cut-summary > div + div { border-left: 1px solid var(--fc-line); }
.fc-spending-cut-summary span { color: var(--fc-muted); font-size: 9px; }
.fc-spending-cut-summary strong { overflow: hidden; color: var(--fc-soft-ink); font-size: 17px; font-weight: 600; font-variant-numeric: tabular-nums; line-height: 1.35; text-overflow: ellipsis; white-space: nowrap; }
.fc-spending-cut-summary > div:first-child strong { color: var(--fc-green-ink); }
.fc-spending-cut-summary small { color: var(--fc-faint); font-size: 8px; font-variant-numeric: tabular-nums; }
.fc-spending-cut-layout { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(430px, .9fr); gap: 16px; align-items: stretch; padding: 14px 20px 18px; }
.fc-spending-cut-chart-wrap { min-width: 0; padding: 10px 12px 9px; border: 1px solid var(--fc-line); border-radius: 8px; background: var(--fc-card-soft); }
.fc-spending-cut-chart { width: 100%; aspect-ratio: 900 / 270; }
.fc-spending-cut-chart text { font-size: 9px; }
.fc-spending-cut-bin rect { fill: var(--fc-green-line); opacity: .94; transition: filter .16s ease, opacity .16s ease; }
.fc-spending-cut-bin.is-none rect { fill: var(--fc-line-strong); }
.fc-spending-cut-bin.is-to-10 rect { fill: #c7d9c3; }
.fc-spending-cut-bin.is-to-20 rect { fill: #a9c5a4; }
.fc-spending-cut-bin.is-to-30 rect { fill: #d8c9a9; }
.fc-spending-cut-bin.is-to-40 rect { fill: #d4a775; }
.fc-spending-cut-bin.is-over-40 rect { fill: var(--fc-amber); }
.fc-spending-cut-bin:hover rect { filter: saturate(1.12) brightness(1.03); opacity: 1; }
.fc-spending-cut-chart .fc-spending-cut-count { fill: var(--fc-soft-ink); font-size: 9px; font-weight: 650; }
.fc-spending-cut-chart .fc-spending-cut-bin-label { fill: var(--fc-label); font-size: 9px; font-weight: 600; }
.fc-spending-cut-chart .fc-spending-cut-bin-share { fill: var(--fc-faint); font-size: 8px; }
.fc-spending-cut-chart-note { margin: 2px 0 0; color: var(--fc-faint); font-size: 8px; line-height: 1.65; }
.fc-spending-cut-ledger { display: flex; min-width: 0; flex-direction: column; padding: 11px 12px; border: 1px solid var(--fc-line); border-radius: 8px; }
.fc-spending-cut-ledger-head { display: flex; align-items: start; justify-content: space-between; gap: 12px; padding: 0 1px 8px; }
.fc-spending-cut-ledger-head h4 { margin: 0; color: var(--fc-soft-ink); font-size: 11px; font-weight: 650; }
.fc-spending-cut-ledger-head p { margin: 2px 0 0; color: var(--fc-faint); font-size: 8px; line-height: 1.55; }
.fc-spending-cut-ledger-head > span { flex: 0 0 auto; color: var(--fc-faint); font-size: 8px; font-variant-numeric: tabular-nums; }
.fc-spending-cut-table-wrap { min-width: 0; max-height: min(52vh, 440px); overflow: auto; overscroll-behavior: contain; scrollbar-gutter: stable; border-top: 1px solid var(--fc-line); }
.fc-spending-cut-table { width: 100%; min-width: 410px; border-collapse: collapse; font-size: 9px; font-variant-numeric: tabular-nums; }
.fc-spending-cut-table th, .fc-spending-cut-table td { padding: 6px 5px; border-bottom: 1px solid var(--fc-line); text-align: right; white-space: nowrap; }
.fc-spending-cut-table thead th { position: sticky; z-index: 1; top: 0; color: var(--fc-faint); background: var(--fc-card); box-shadow: inset 0 -1px 0 var(--fc-line); font-size: 8px; font-weight: 550; }
.fc-spending-cut-table thead th:first-child, .fc-spending-cut-table tbody th { text-align: left; }
.fc-spending-cut-table tbody th { width: 48px; font-weight: 550; }
.fc-spending-cut-table tbody tr { transition: background .14s ease; }
.fc-spending-cut-table tbody tr:hover { background: var(--fc-hover-bg); }
.fc-spending-cut-table tbody tr.is-selected { background: var(--fc-pale); }
.fc-spending-cut-table tbody th button { padding: 2px 4px; border: 1px solid transparent; border-radius: 4px; background: transparent; color: var(--fc-green-ink); font: inherit; font-weight: 650; }
.fc-spending-cut-table tbody th button:hover { border-color: var(--fc-green-line); background: var(--fc-card); }
.fc-spending-cut-table td { color: var(--fc-soft-ink); }
.fc-spending-cut-table td:nth-child(2) { color: var(--fc-amber-ink); font-weight: 600; }
.fc-spending-cut-empty { margin: 16px 0; color: var(--fc-muted); font-size: 10px; text-align: center; }
.fc-strategy-distribution-stats dl { display: grid; grid-template-columns: repeat(auto-fit, minmax(76px, 1fr)); gap: 7px; margin: 0; }
.fc-strategy-distribution-stats dl > div { padding: 7px 8px; border-radius: 5px; background: var(--fc-card); }
.fc-strategy-distribution-stats dl > div.is-primary { border: 1px solid var(--fc-green-line); background: var(--fc-pale); }
.fc-strategy-distribution-stats dl > div.is-failure dd { color: var(--fc-amber-ink); }
.fc-strategy-distribution-stats dt { color: var(--fc-faint); font-size: 8px; }
.fc-strategy-distribution-stats dd { margin: 3px 0 0; color: var(--fc-soft-ink); font-size: 12px; font-weight: 550; font-variant-numeric: tabular-nums; white-space: nowrap; }
.fc-strategy-distribution-stats dd small { margin-left: 2px; color: var(--fc-muted); font-size: 8px; font-weight: 450; }
.fc-explanation { padding: 15px 20px; }
.fc-explanation summary { display: flex; align-items: center; gap: 7px; cursor: pointer; list-style: none; color: var(--fc-soft-ink); font-size: 11px; }
.fc-explanation summary::-webkit-details-marker { display: none; }
.fc-explanation summary::after { content: "+"; margin-left: auto; color: var(--fc-muted); }
.fc-explanation[open] summary::after { content: "−"; }
.fc-calculation-flow { margin-top: 14px; padding: 16px; border: 1px solid var(--fc-green-line); border-radius: 8px; background: var(--fc-pale); }
.fc-calculation-flow-header { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; margin-bottom: 13px; }
.fc-calculation-flow-header strong { color: var(--fc-soft-ink); font-size: 11px; font-weight: 650; }
.fc-calculation-flow-header span { color: var(--fc-muted); font-size: 9px; }
.fc-calculation-flow-body { display: grid; justify-items: center; min-width: 0; }
.fc-calculation-flow-node { display: grid; grid-template-columns: 35px minmax(0, 1fr); align-items: center; width: min(100%, 440px); min-height: 38px; overflow: hidden; border: 1px solid var(--fc-green-line); border-radius: 7px; background: var(--fc-card); color: var(--fc-soft-ink); font-size: 10px; line-height: 1.55; box-shadow: 0 1px 2px #26371b08; }
.fc-calculation-flow-node > :last-child { padding: 8px 11px; }
.fc-calculation-flow-node.is-decision { border-style: dashed; background: var(--fc-card); text-align: center; }
.fc-calculation-flow-node.is-result { border-color: var(--fc-green); background: var(--fc-green-soft); }
.fc-calculation-flow-step { display: grid; align-self: stretch; place-items: center; padding: 0 5px; border-right: 1px solid var(--fc-green-line); background: var(--fc-pale); color: var(--fc-label); font-size: 8px; font-variant-numeric: tabular-nums; }
.fc-calculation-flow-arrow { display: block; width: 18px; height: 22px; color: var(--fc-soft-ink); }
.fc-calculation-flow-arrow path, .fc-calculation-flow-branch-arrows path { fill: none; stroke: currentColor; stroke-width: 1.25; stroke-linecap: round; stroke-linejoin: round; vector-effect: non-scaling-stroke; }
.fc-calculation-flow-branch-arrows { display: block; width: min(100%, 640px); height: 42px; color: var(--fc-soft-ink); }
.fc-calculation-flow-branches { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); align-items: stretch; gap: 18px; width: min(100%, 680px); }
.fc-calculation-flow-branch { display: grid; gap: 3px; min-width: 0; padding: 10px 12px; border: 1px solid var(--fc-green-line); border-radius: 7px; background: var(--fc-card); color: var(--fc-soft-ink); font-size: 10px; line-height: 1.55; }
.fc-calculation-flow-branch > span { color: var(--fc-muted); font-size: 8px; }
.fc-calculation-flow-branch > strong { font-weight: 550; }
.fc-calculation-flow-branch.is-positive { border-color: var(--fc-green-line); }
.fc-calculation-flow-branch.is-negative { border-color: var(--fc-amber-line); background: var(--fc-amber-soft); }
.fc-calculation-flow-branch.is-negative > span { color: var(--fc-amber-ink); }
.fc-explanation ul { margin: 12px 0 1px; padding-left: 16px; display: grid; gap: 7px; color: var(--fc-muted); font-size: 10px; line-height: 1.9; }
.fc-loading { display: grid; min-height: 430px; place-content: center; justify-items: center; gap: 13px; border: 1px solid var(--fc-line); border-radius: 10px; background: var(--fc-card); color: var(--fc-muted); text-align: center; }
.fc-loading strong { color: var(--fc-soft-ink); font-weight: 550; }
.fc-loading p { margin: 0; font-size: 11px; }
.fc-spinner { width: 25px; height: 25px; border: 2px solid var(--fc-line); border-top-color: var(--fc-green); border-radius: 50%; animation: fc-spin 1s linear infinite; }
.fc-footer { display: flex; justify-content: space-between; gap: 14px; margin-top: 23px; color: var(--fc-faint); font-size: 9px; }
.fc-footer > span { display: flex; align-items: center; gap: 5px; }
@keyframes fc-spin { to { transform: rotate(360deg); } }
@keyframes fc-popover-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
@media (max-width: 1150px) { .fc-summary { grid-template-columns: repeat(2, 1fr); } .fc-card-header { padding: 18px 17px 0; } .fc-chart { aspect-ratio: 900 / 410; } }
@media (max-width: 1050px) { .fc-spending-cut-layout { grid-template-columns: 1fr; } .fc-spending-cut-chart { aspect-ratio: 900 / 300; } }
@media (max-width: 800px) { .fc-page { padding: 22px 16px; } .fc-header { align-items: start; gap: 12px; } .fc-header h1 { font-size: 24px; } .fc-header h1 span { display: block; margin: 2px 0 0; font-size: 21px; } .fc-section-content { grid-template-columns: repeat(2, minmax(0, 1fr)); } .fc-field-stack.fc-span-2, .fc-field-stack.fc-span-3 { grid-column: auto; } .fc-config-actions, .fc-config-footnote { width: 100%; max-width: 460px; margin-right: auto; margin-left: auto; } .fc-chart { aspect-ratio: 900 / 370; } .fc-path-explorer-percentiles { margin-right: 16px; margin-left: 16px; } }
@media (max-width: 480px) { .fc-results, .fc-results[data-controls-compact="true"] { padding-bottom: 196px; } .fc-shared-year-summary { white-space: normal; } .fc-header { flex-wrap: wrap; } .fc-header h1 span { display: inline; margin-left: 7px; font-size: 24px; } .fc-header p { font-size: 10px; } .fc-config-overlay { padding: 0; } .fc-config { width: 100vw; height: 100vh; border-radius: 0; } .fc-config-layout { flex-direction: column; } .fc-config-nav { display: flex; flex-basis: auto; overflow-x: auto; padding: 8px 10px; border-right: 0; border-bottom: 1px solid var(--fc-line); } .fc-config-nav-item { width: auto; white-space: nowrap; } .fc-section-content { grid-template-columns: 1fr; } .fc-config-header-right > span { font-size: 9px; } .fc-config-actions { display: grid; grid-template-columns: 1fr 1fr; } .fc-config-actions .fc-btn.primary { grid-column: 1 / -1; } .fc-cashflow-columns, .fc-event-columns { grid-template-columns: 1fr; } .fc-summary { gap: 9px; } .fc-stat { padding: 14px 13px; } .fc-stat-value { font-size: 25px; } .fc-stat-percentiles { grid-template-columns: repeat(2, minmax(0, 1fr)); } .fc-card-header { flex-wrap: wrap; gap: 10px; } .fc-chart { aspect-ratio: 900 / 500; } .fc-chart-legend { gap: 12px; } .fc-chart-bottom, .fc-footer { flex-wrap: wrap; } .fc-balance-distribution-summary, .fc-balance-snapshot { grid-template-columns: 1fr; margin-right: 14px; margin-left: 14px; } .fc-path-explorer-percentiles { margin-right: 12px; margin-left: 12px; padding: 9px 10px 10px; } .fc-path-explorer-percentiles-heading { display: grid; gap: 2px; } .fc-path-explorer-percentiles-items { grid-template-columns: repeat(2, minmax(0, 1fr)); } .fc-path-percentile-chip:last-child { grid-column: 1 / -1; } .fc-spending-cut-summary { grid-template-columns: 1fr; margin-right: 14px; margin-left: 14px; padding: 9px; } .fc-spending-cut-summary > div + div { border-top: 1px solid var(--fc-line); border-left: 0; } .fc-spending-cut-layout { padding-right: 14px; padding-left: 14px; } .fc-spending-cut-chart-wrap { padding-right: 7px; padding-left: 7px; } .fc-spending-cut-chart { aspect-ratio: 900 / 380; } .fc-spending-cut-chart text { font-size: 11px; } .fc-spending-cut-chart .fc-spending-cut-count { font-size: 11px; } .fc-spending-cut-chart .fc-spending-cut-bin-share { font-size: 10px; } }
@media (prefers-reduced-motion: reduce) { .fc-shell *, .fc-shell *::before, .fc-shell *::after { animation: none !important; transition: none !important; } }
html.dark .fc-shell {
  --fc-flow-investment: #a4b5f0;
  --fc-flow-withdrawal: #d88bc2;
  --fc-bg: #141816;
  --fc-card: #1b211d;
  --fc-card-soft: #202722;
  --fc-ink: #dde6dd;
  --fc-muted: #98a49a;
  --fc-faint: #77837a;
  --fc-label: #a4b0a5;
  --fc-soft-ink: #a9c3ac;
  --fc-line: #2a332c;
  --fc-line-strong: #38443a;
  --fc-input-line: #343f36;
  --fc-input-bg: #141a16;
  --fc-hover-bg: #242e27;
  --fc-hover-line: #5f866c;
  --fc-focus: #71b081;
  --fc-focus-ring: #5f9c6f;
  --fc-green: #4f9a6c;
  --fc-green-dark: #3f7f59;
  --fc-green-ink: #a8d0b0;
  --fc-green-soft: #1f2c22;
  --fc-green-line: #2c4030;
  --fc-pale: #202b23;
  --fc-amber: #d3a05f;
  --fc-amber-ink: #d9a26b;
  --fc-amber-soft: #2a231b;
  --fc-amber-line: #4b3a26;
  --fc-error-line: #5c3630;
  --fc-error-ink: #e08b78;
  --fc-error-bg: #2b1d1a;
  --fc-chip-bg: #232c25;
  --fc-chip-ink: #a9b8a7;
  --fc-income-ink: #9fcaa8;
  --fc-income-bg: #1c2a1f;
  --fc-income-line: #2c4b33;
  --fc-income-bar: #6fa37a;
  --fc-expense-bar: #c98e52;
  --fc-toggle-bg: #202822;
  --fc-tooltip-bg: #222a25f2;
}
@media (prefers-color-scheme: dark) {
  html:not(.light) .fc-shell {
    --fc-flow-investment: #a4b5f0;
    --fc-flow-withdrawal: #d88bc2;
    --fc-bg: #141816;
    --fc-card: #1b211d;
    --fc-card-soft: #202722;
    --fc-ink: #dde6dd;
    --fc-muted: #98a49a;
    --fc-faint: #77837a;
    --fc-label: #a4b0a5;
    --fc-soft-ink: #a9c3ac;
    --fc-line: #2a332c;
    --fc-line-strong: #38443a;
    --fc-input-line: #343f36;
    --fc-input-bg: #141a16;
    --fc-hover-bg: #242e27;
    --fc-hover-line: #5f866c;
    --fc-focus: #71b081;
    --fc-focus-ring: #5f9c6f;
    --fc-green: #4f9a6c;
    --fc-green-dark: #3f7f59;
    --fc-green-ink: #a8d0b0;
    --fc-green-soft: #1f2c22;
    --fc-green-line: #2c4030;
    --fc-pale: #202b23;
    --fc-amber: #d3a05f;
    --fc-amber-ink: #d9a26b;
    --fc-amber-soft: #2a231b;
    --fc-amber-line: #4b3a26;
    --fc-error-line: #5c3630;
    --fc-error-ink: #e08b78;
    --fc-error-bg: #2b1d1a;
    --fc-chip-bg: #232c25;
    --fc-chip-ink: #a9b8a7;
    --fc-income-ink: #9fcaa8;
    --fc-income-bg: #1c2a1f;
    --fc-income-line: #2c4b33;
    --fc-income-bar: #6fa37a;
    --fc-expense-bar: #c98e52;
    --fc-toggle-bg: #202822;
    --fc-tooltip-bg: #222a25f2;
  }
}
html.dark .fc-chart [stop-color="#c6d8a8"] { stop-color: #2c4433; }
html.dark .fc-chart [stop-color="#e6eed7"] { stop-color: #253527; }
html.dark .fc-chart path[fill="#b2c995"] { fill: #3a5240; }
html.dark .fc-chart path[stroke="#bbce9f"] { stroke: #4a664f; }
html.dark .fc-chart path[stroke="#628348"] { stroke: #7fb18b; }
html.dark .fc-chart path[stroke="#95a985"] { stroke: #77886f; }
`;
