import { accountBrowserStyles } from "@plugins/shared/frontend/account-browser-styles";

const GRID_STYLE = `
.fmp-shell {
  --fmp-ink: var(--foreground);
  --fmp-muted: var(--muted-foreground);
  --fmp-paper: var(--background);
  --fmp-card: var(--card);
  --fmp-line: var(--border);
  --fmp-teal: var(--primary);
  --fmp-teal-dark: var(--foreground);
  --fmp-coral: var(--destructive);
  --fmp-gold: var(--chart-3);
  min-height: 100%;
  color: var(--fmp-ink);
  background: transparent;
  font-family: "Avenir Next", "PingFang SC", "Hiragino Sans GB", sans-serif;
}
.fmp-page { width: min(1480px, 100%); margin: 0 auto; padding: 34px clamp(18px, 3vw, 46px) 64px; }
.fmp-hero { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 28px; align-items: end; margin-bottom: 24px; }
.fmp-kicker { color: var(--fmp-teal); font-size: 11px; font-weight: 800; letter-spacing: .2em; text-transform: uppercase; }
.fmp-hero h1 { margin: 8px 0 8px; font-family: "Iowan Old Style", "Songti SC", serif; font-size: clamp(34px, 5vw, 62px); line-height: .96; letter-spacing: -.045em; font-weight: 700; }
.fmp-hero h1 span { color: var(--fmp-coral); font-style: italic; }
.fmp-subtitle { max-width: 780px; margin: 0; color: var(--fmp-muted); font-size: 15px; line-height: 1.75; }
.fmp-hero-actions { display: flex; flex-direction: column; align-items: flex-end; gap: 9px; }
.fmp-memory-badge { display: inline-flex; align-items: center; gap: 9px; border: 1px solid var(--fmp-line); background: var(--fmp-card); color: var(--fmp-teal-dark); border-radius: 999px; padding: 9px 14px; font-size: 12px; font-weight: 750; white-space: nowrap; }
.fmp-memory-badge::before { content: ""; width: 8px; height: 8px; border-radius: 50%; background: var(--fmp-teal); box-shadow: 0 0 0 5px color-mix(in srgb, var(--primary) 12%, transparent); }
.fmp-stats { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px; margin-bottom: 18px; }
.fmp-stat { min-height: 104px; padding: 17px 18px; border: 1px solid var(--fmp-line); border-radius: 18px; background: var(--fmp-card); animation: fmp-rise .45s both; }
.fmp-stat:nth-child(2) { animation-delay: .05s; } .fmp-stat:nth-child(3) { animation-delay: .1s; } .fmp-stat:nth-child(4) { animation-delay: .15s; } .fmp-stat:nth-child(5) { animation-delay: .2s; }
.fmp-stat strong { display: block; margin-top: 10px; font-family: "Iowan Old Style", "Songti SC", serif; font-size: 31px; line-height: 1; }
.fmp-stat span { color: var(--fmp-muted); font-size: 11px; font-weight: 750; letter-spacing: .08em; text-transform: uppercase; }
.fmp-stat em { color: var(--fmp-coral); font-size: 11px; font-style: normal; font-weight: 700; }
.fmp-btn { appearance: none; border: 1px solid transparent; border-radius: 11px; padding: 9px 14px; background: transparent; color: var(--fmp-ink); font: inherit; font-size: 13px; font-weight: 750; cursor: pointer; transition: transform .16s ease, background .16s ease, border-color .16s ease; }
.fmp-btn:hover:not(:disabled) { transform: translateY(-1px); }
.fmp-btn:focus-visible, .fmp-input:focus-visible, .fmp-textarea:focus-visible, .fmp-icon-btn:focus-visible, .fmp-picker-trigger:focus-visible, .fmp-select-trigger:focus-visible, .fmp-select-option:focus-visible { outline: 2px solid var(--fmp-teal); outline-offset: 2px; }
.fmp-btn-primary { background: var(--fmp-teal); border-color: var(--fmp-teal); color: var(--primary-foreground); }
.fmp-btn-primary:hover:not(:disabled) { background: color-mix(in srgb, var(--primary) 84%, var(--foreground)); }
.fmp-btn-ghost { border-color: var(--fmp-line); background: transparent; }
.fmp-btn-danger { color: var(--destructive); }
.fmp-btn:disabled { opacity: .42; cursor: not-allowed; }
.fmp-enable-toggle { appearance: none; display: inline-flex; align-items: center; gap: 7px; min-height: 34px; padding: 6px 10px 6px 8px; border: 1px solid var(--fmp-line); border-radius: 10px; background: var(--fmp-paper); color: var(--fmp-muted); font: inherit; font-size: 10px; font-weight: 800; cursor: pointer; transition: border-color .16s, background .16s, color .16s, box-shadow .16s; }
.fmp-enable-toggle:hover:not(:disabled) { border-color: color-mix(in srgb, var(--primary) 34%, var(--fmp-line)); background: color-mix(in srgb, var(--primary) 4%, var(--fmp-paper)); color: var(--fmp-ink); }
.fmp-enable-toggle.is-on { border-color: color-mix(in srgb, var(--primary) 38%, var(--fmp-line)); background: color-mix(in srgb, var(--primary) 7%, var(--fmp-paper)); color: var(--fmp-teal-dark); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--primary) 5%, transparent); }
.fmp-enable-toggle:focus-visible { outline: 2px solid var(--fmp-teal); outline-offset: 2px; }
.fmp-enable-toggle:disabled { cursor: not-allowed; opacity: .45; }
.fmp-enable-track { position: relative; flex: 0 0 30px; width: 30px; height: 17px; border-radius: 999px; background: color-mix(in srgb, var(--fmp-muted) 24%, var(--fmp-line)); transition: background .18s ease; }
.fmp-enable-thumb { position: absolute; top: 2px; left: 2px; width: 13px; height: 13px; border-radius: 50%; background: var(--fmp-paper); box-shadow: 0 1px 3px color-mix(in srgb, var(--fmp-ink) 22%, transparent); transition: transform .18s ease; }
.fmp-enable-toggle.is-on .fmp-enable-track { background: var(--fmp-teal); }
.fmp-enable-toggle.is-on .fmp-enable-thumb { transform: translateX(13px); }
.fmp-message { display: flex; gap: 10px; align-items: flex-start; border-radius: 12px; padding: 11px 14px; margin-bottom: 14px; font-size: 13px; line-height: 1.55; }
.fmp-message.is-error { border: 1px solid color-mix(in srgb, var(--destructive) 30%, transparent); background: color-mix(in srgb, var(--destructive) 7%, transparent); color: var(--destructive); }
.fmp-message.is-warning { border: 1px solid color-mix(in srgb, var(--chart-3) 32%, transparent); background: color-mix(in srgb, var(--chart-3) 7%, transparent); color: var(--fmp-gold); }
.fmp-message.is-ok { border: 1px solid color-mix(in srgb, var(--primary) 28%, transparent); background: color-mix(in srgb, var(--primary) 7%, transparent); color: var(--fmp-teal-dark); }
.fmp-layout { display: grid; grid-template-columns: minmax(320px, 410px) minmax(0, 1fr); gap: 18px; align-items: start; min-width: 0; }
.fmp-panel { min-width: 0; border: 1px solid var(--fmp-line); border-radius: 20px; background: var(--fmp-card); }
.fmp-panel-head { display: flex; flex-wrap: wrap; align-items: flex-start; justify-content: space-between; gap: 14px; padding: 18px 18px 14px; border-bottom: 1px solid var(--fmp-line); }
.fmp-panel-heading { flex: 1 1 240px; min-width: 0; }
.fmp-section-kicker { display: block; margin-bottom: 5px; color: var(--fmp-teal); font-size: 9px; font-weight: 850; letter-spacing: .15em; line-height: 1.2; text-transform: uppercase; }
.fmp-section-kicker.is-query { color: var(--fmp-gold); }
.fmp-panel-title-line { display: flex; flex-wrap: wrap; align-items: center; gap: 9px; }
.fmp-panel-head h2 { margin: 0 0 4px; font-family: "Iowan Old Style", "Songti SC", serif; font-size: 23px; letter-spacing: -.02em; }
.fmp-panel-head p { margin: 0; color: var(--fmp-muted); font-size: 12px; line-height: 1.55; }
.fmp-panel-head-actions { display: flex; flex: 0 0 auto; align-items: center; gap: 7px; }
.fmp-panel-head .fmp-add, .fmp-save-btn { box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center; min-width: 104px; height: 38px; border-radius: 11px; padding: 0 13px; font-size: 12px; line-height: 1; white-space: nowrap; }
.fmp-panel-head .fmp-add { flex: none; align-self: center; }
.fmp-tabs { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 2px; padding: 0 12px; border-bottom: 1px solid var(--fmp-line); background: color-mix(in srgb, var(--muted) 20%, transparent); }
.fmp-tab { appearance: none; position: relative; display: inline-flex; align-items: center; justify-content: center; gap: 7px; min-width: 0; border: 0; background: transparent; color: var(--fmp-muted); padding: 12px 9px 11px; font: inherit; font-size: 11px; font-weight: 800; line-height: 1.2; white-space: nowrap; cursor: pointer; transition: color .16s, background .16s; }
.fmp-tab::after { content: ""; position: absolute; right: 10px; bottom: -1px; left: 10px; height: 2px; border-radius: 999px 999px 0 0; background: var(--fmp-teal); transform: scaleX(0); transform-origin: center; transition: transform .18s ease; }
.fmp-tab:hover { color: var(--fmp-ink); background: color-mix(in srgb, var(--primary) 4%, transparent); }
.fmp-tab.is-active { color: var(--fmp-ink); background: color-mix(in srgb, var(--primary) 6%, transparent); }
.fmp-tab.is-active::after { transform: scaleX(1); }
.fmp-tab:focus-visible { outline: 2px solid var(--fmp-teal); outline-offset: -3px; }
.fmp-tab-count { display: inline-grid; place-items: center; min-width: 22px; height: 20px; padding: 0 6px; border-radius: 999px; background: var(--muted); color: var(--fmp-muted); font-size: 9px; font-weight: 850; }
.fmp-tab.is-query::after { background: var(--fmp-gold); }
.fmp-tab.is-query:hover { background: color-mix(in srgb, var(--chart-3) 6%, transparent); }
.fmp-tab.is-query.is-active { background: color-mix(in srgb, var(--chart-3) 7%, transparent); }
.fmp-tab.is-query .fmp-tab-count { background: color-mix(in srgb, var(--chart-3) 14%, transparent); color: var(--fmp-gold); }
.fmp-save-state { display: inline-flex; align-items: center; gap: 5px; color: var(--fmp-gold); font-size: 10px; font-weight: 800; white-space: nowrap; }
.fmp-save-state::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.fmp-save-state.is-saved { color: var(--fmp-muted); }
.fmp-panel-tools { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; padding: 10px 13px; border-bottom: 1px solid var(--fmp-line); background: color-mix(in srgb, var(--muted) 22%, transparent); }
.fmp-panel-tools .fmp-input { flex: 1 1 220px; width: auto; min-width: 160px; }
.fmp-save-guard { color: var(--fmp-gold); font-size: 10px; font-weight: 750; white-space: nowrap; }
.fmp-save-guard.is-ready { color: var(--fmp-muted); }
.fmp-drag-hint { margin-left: auto; color: var(--fmp-muted); font-size: 10px; line-height: 1.4; white-space: nowrap; }
.fmp-preset-list { display: grid; gap: 10px; padding: 12px; }
.fmp-preset { border: 1px solid var(--fmp-line); border-radius: 15px; background: transparent; overflow: visible; }
.fmp-preset[open] { border-color: color-mix(in srgb, var(--primary) 45%, var(--fmp-line)); }
.fmp-preset summary { list-style: none; cursor: pointer; display: grid; grid-template-columns: minmax(0,1fr) auto auto auto auto; gap: 8px; align-items: center; padding: 13px 14px; }
.fmp-preset summary::-webkit-details-marker { display: none; }
.fmp-preset-title { min-width: 0; }
.fmp-preset-name { appearance: none; display: inline-flex; align-items: center; gap: 6px; max-width: 100%; border: 0; background: transparent; color: var(--fmp-ink); padding: 0; font: inherit; font-weight: 800; font-size: 13px; text-align: left; cursor: pointer; }
.fmp-preset-name > span { min-width: 0; overflow-wrap: anywhere; }
.fmp-preset-name:hover .fmp-name-edit-icon, .fmp-rule-name:hover .fmp-name-edit-icon { opacity: 1; color: var(--fmp-teal-dark); }
.fmp-preset-name-input { width: 100%; min-width: 0; border: 0; border-bottom: 1px dashed color-mix(in srgb, var(--primary) 45%, var(--fmp-line)); background: transparent; color: var(--fmp-ink); padding: 1px 0 3px; font: inherit; font-weight: 800; font-size: 13px; outline: none; }
.fmp-preset-name-input:focus { border-bottom-style: solid; border-bottom-color: var(--fmp-teal); }
.fmp-name-edit-icon { flex: 0 0 13px; width: 13px; height: 13px; fill: none; stroke: currentColor; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; color: var(--fmp-muted); opacity: .58; pointer-events: none; transition: color .15s, opacity .15s; }
.fmp-name-error { display: block; margin-top: 3px; color: var(--destructive); font-size: 9px; line-height: 1.4; }
.fmp-preset-summary { display: block; margin-top: 4px; color: var(--fmp-muted); font-size: 11px; line-height: 1.45; }
.fmp-count { min-width: 25px; height: 25px; padding: 0 7px; display: inline-grid; place-items: center; border-radius: 999px; background: var(--muted); color: var(--fmp-teal-dark); font-size: 11px; font-weight: 800; }
.fmp-count.is-hit { background: color-mix(in srgb, var(--primary) 12%, transparent); }
.fmp-preset-move { appearance: none; display: grid; place-items: center; flex: 0 0 27px; width: 27px; height: 27px; border: 1px solid var(--fmp-line); border-radius: 8px; background: var(--fmp-paper); color: var(--fmp-teal-dark); padding: 0; cursor: pointer; transition: border-color .16s, background .16s, color .16s; }
.fmp-preset-move:hover:not(:disabled) { border-color: color-mix(in srgb, var(--primary) 45%, var(--fmp-line)); background: color-mix(in srgb, var(--primary) 8%, transparent); }
.fmp-preset-move.is-query { border-color: color-mix(in srgb, var(--chart-3) 35%, var(--fmp-line)); color: var(--fmp-gold); }
.fmp-preset-move.is-query:hover:not(:disabled) { background: color-mix(in srgb, var(--chart-3) 10%, transparent); }
.fmp-preset-move:focus-visible { outline: 2px solid var(--fmp-teal); outline-offset: 2px; }
.fmp-preset-move:disabled { cursor: not-allowed; opacity: .4; }
.fmp-preset-move svg { width: 15px; height: 15px; fill: none; stroke: currentColor; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }
.fmp-preset-delete { appearance: none; border: 1px solid transparent; border-radius: 8px; background: transparent; color: var(--fmp-muted); padding: 5px 7px; font: inherit; font-size: 10px; font-weight: 750; cursor: pointer; }
.fmp-preset-delete:hover:not(:disabled) { border-color: color-mix(in srgb, var(--destructive) 30%, var(--fmp-line)); background: color-mix(in srgb, var(--destructive) 7%, transparent); color: var(--destructive); }
.fmp-preset-delete:focus-visible { outline: 2px solid var(--fmp-teal); outline-offset: 2px; }
.fmp-preset-delete:disabled { cursor: not-allowed; opacity: .4; }
.fmp-preset-body { padding: 10px 14px 14px; border-top: 1px dashed var(--fmp-line); }
.fmp-preset-data-view { display: grid; gap: 10px; margin-bottom: 9px; border: 1px solid color-mix(in srgb, var(--primary) 22%, var(--fmp-line)); border-radius: 13px; background: color-mix(in srgb, var(--primary) 3%, var(--fmp-paper)); padding: 11px 12px; }
.fmp-preset-data-view-head { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 9px 12px; }
.fmp-preset-data-view-head > div:first-child { flex: 1 1 250px; min-width: 0; }
.fmp-preset-data-view-head strong { display: block; font-size: 11px; }
.fmp-preset-data-view-head small { display: block; margin-top: 3px; color: var(--fmp-muted); font-size: 9px; line-height: 1.45; }
.fmp-preset-data-view-mode { display: inline-grid; grid-template-columns: repeat(2, minmax(78px, 1fr)); gap: 3px; padding: 3px; border: 1px solid var(--fmp-line); border-radius: 9px; background: var(--fmp-card); }
.fmp-preset-data-view-mode button { appearance: none; border: 0; border-radius: 6px; background: transparent; color: var(--fmp-muted); padding: 6px 9px; font: inherit; font-size: 9px; font-weight: 800; white-space: nowrap; cursor: pointer; }
.fmp-preset-data-view-mode button.is-active { background: var(--fmp-teal); color: var(--primary-foreground); }
.fmp-preset-data-view-mode button:disabled { cursor: not-allowed; opacity: .45; }
.fmp-preset-rule-view { display: grid; gap: 7px; border-top: 1px dashed var(--fmp-line); padding-top: 9px; }
.fmp-preset-rule-view-head { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 7px 10px; color: var(--fmp-muted); font-size: 9px; }
.fmp-preset-rule-view-head b { color: var(--fmp-ink); }
.fmp-preset-rule-view-head > div { display: flex; gap: 5px; }
.fmp-preset-rule-view-head button { appearance: none; border: 1px solid var(--fmp-line); border-radius: 7px; background: var(--fmp-paper); color: var(--fmp-muted); padding: 4px 7px; font: inherit; font-size: 8px; font-weight: 750; cursor: pointer; }
.fmp-preset-rule-view-head button:disabled { cursor: not-allowed; opacity: .4; }
.fmp-preset-rule-view-list { display: grid; gap: 4px; }
.fmp-preset-rule-view-item { display: grid; grid-template-columns: auto auto minmax(0,1fr); align-items: center; gap: 7px; border: 1px solid var(--fmp-line); border-radius: 9px; background: var(--fmp-paper); padding: 7px 8px; cursor: pointer; opacity: .62; }
.fmp-preset-rule-view-item.is-applied { border-color: color-mix(in srgb, var(--primary) 25%, var(--fmp-line)); background: color-mix(in srgb, var(--primary) 3%, var(--fmp-paper)); opacity: 1; }
.fmp-preset-rule-view-item input { width: 15px; height: 15px; margin: 0; accent-color: var(--fmp-teal); }
.fmp-preset-rule-view-index { color: var(--fmp-muted); font-family: "SFMono-Regular", "Cascadia Code", monospace; font-size: 8px; font-weight: 800; }
.fmp-preset-rule-view-item > span:last-child { min-width: 0; }
.fmp-preset-rule-view-item strong { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 10px; }
.fmp-preset-rule-view-item small { display: block; margin-top: 2px; color: var(--fmp-muted); font-size: 8px; line-height: 1.35; }
.fmp-preset-rule-view-empty { border: 1px dashed var(--fmp-line); border-radius: 8px; color: var(--fmp-muted); padding: 9px; font-size: 9px; line-height: 1.45; }
.fmp-condition { border: 1px solid var(--fmp-line); border-radius: 10px; background: color-mix(in srgb, var(--muted) 18%, transparent); overflow: hidden; }
.fmp-condition.is-configured { border-color: color-mix(in srgb, var(--primary) 28%, var(--fmp-line)); }
.fmp-condition.is-excluded { border-color: color-mix(in srgb, var(--destructive) 28%, var(--fmp-line)); }
.fmp-condition[open] { background: transparent; }
.fmp-condition summary { display: flex; align-items: center; gap: 8px; list-style: none; padding: 10px 11px; color: var(--fmp-ink); font-size: 11px; font-weight: 800; cursor: pointer; }
.fmp-condition summary::-webkit-details-marker { display: none; }
.fmp-condition summary:hover { background: color-mix(in srgb, var(--primary) 4%, transparent); }
.fmp-condition summary:focus-visible { outline: 2px solid var(--fmp-teal); outline-offset: -2px; }
.fmp-condition summary::after { content: ""; flex: 0 0 auto; width: 6px; height: 6px; margin-left: 2px; border-right: 1.5px solid var(--fmp-muted); border-bottom: 1.5px solid var(--fmp-muted); transform: rotate(45deg) translateY(-2px); transition: transform .15s; }
.fmp-condition[open] summary::after { transform: rotate(225deg) translate(-1px, -1px); }
.fmp-condition-title { min-width: 0; }
.fmp-condition-logic-label { margin-left: auto; border-radius: 999px; background: color-mix(in srgb, var(--primary) 8%, transparent); color: var(--fmp-teal-dark); padding: 2px 6px; font-size: 8px; font-weight: 800; letter-spacing: .04em; white-space: nowrap; }
.fmp-condition.is-excluded .fmp-condition-logic-label { background: color-mix(in srgb, var(--destructive) 10%, transparent); color: var(--destructive); }
.fmp-condition-state { margin-left: auto; border-radius: 999px; background: var(--muted); color: var(--fmp-muted); padding: 2px 7px; font-size: 9px; font-weight: 750; white-space: nowrap; }
.fmp-condition-logic-label + .fmp-condition-state { margin-left: 0; }
.fmp-condition-state.is-set { background: color-mix(in srgb, var(--primary) 11%, transparent); color: var(--fmp-teal-dark); }
.fmp-condition-body { padding: 10px 11px 12px; border-top: 1px solid var(--fmp-line); }
.fmp-condition-logic-row { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin: -1px 0 10px; padding-bottom: 9px; border-bottom: 1px dashed var(--fmp-line); color: var(--fmp-muted); font-size: 9px; font-weight: 700; }
.fmp-condition-join { display: inline-flex; gap: 2px; padding: 2px; border: 1px solid var(--fmp-line); border-radius: 8px; background: var(--fmp-card); }
.fmp-condition-join button { appearance: none; min-width: 42px; border: 0; border-radius: 6px; background: transparent; color: var(--fmp-muted); padding: 4px 7px; font: inherit; font-size: 8px; font-weight: 800; cursor: pointer; }
.fmp-condition-join button.is-active { background: var(--fmp-teal); color: var(--primary-foreground); }
.fmp-condition-join button:disabled { opacity: .55; cursor: default; }
.fmp-condition-logic-spacer { flex: 1 1 100px; }
.fmp-condition-exclude { appearance: none; margin-left: auto; border: 1px solid var(--fmp-line); border-radius: 999px; background: transparent; color: var(--fmp-muted); padding: 4px 8px; font: inherit; font-size: 9px; font-weight: 750; cursor: pointer; }
.fmp-condition-exclude:hover:not(:disabled) { border-color: color-mix(in srgb, var(--destructive) 32%, var(--fmp-line)); color: var(--destructive); }
.fmp-condition-exclude.is-active { border-color: color-mix(in srgb, var(--destructive) 38%, var(--fmp-line)); background: color-mix(in srgb, var(--destructive) 10%, transparent); color: var(--destructive); }
.fmp-condition-formula { border: 1px solid color-mix(in srgb, var(--primary) 24%, var(--fmp-line)); border-radius: 13px; background: color-mix(in srgb, var(--primary) 4%, var(--fmp-paper)); padding: 12px 13px; }
.fmp-condition-formula strong { font-family: "SFMono-Regular", "Cascadia Code", monospace; font-size: 11px; line-height: 1.6; overflow-wrap: anywhere; }
.fmp-catalog-source { display: flex; flex-wrap: wrap; align-items: center; gap: 5px 8px; margin-top: 9px; border-top: 1px dashed color-mix(in srgb, var(--primary) 20%, var(--fmp-line)); padding-top: 8px; color: var(--fmp-muted); font-size: 9px; line-height: 1.4; }
.fmp-catalog-source-dot { flex: 0 0 7px; width: 7px; height: 7px; border-radius: 999px; background: var(--fmp-gold); box-shadow: 0 0 0 3px color-mix(in srgb, var(--fmp-gold) 12%, transparent); }
.fmp-catalog-source.is-mapped .fmp-catalog-source-dot { background: var(--fmp-teal); box-shadow: 0 0 0 3px color-mix(in srgb, var(--fmp-teal) 12%, transparent); }
.fmp-catalog-source.is-pending .fmp-catalog-source-dot { animation: fmp-catalog-pulse 1s ease-in-out infinite; }
.fmp-catalog-source strong { color: var(--fmp-ink); font-family: inherit; font-size: 9px; line-height: 1.4; white-space: nowrap; }
.fmp-catalog-source > span:not(.fmp-catalog-source-dot) { flex: 1 1 220px; min-width: 0; }
.fmp-catalog-source small { color: var(--fmp-muted); font-size: 9px; white-space: nowrap; }
.fmp-catalog-source.is-pending small { color: var(--fmp-gold); font-weight: 750; }
@keyframes fmp-catalog-pulse { 50% { opacity: .35; transform: scale(.8); } }
.fmp-condition-tools { display: flex; justify-content: flex-end; }
.fmp-empty { padding: 30px 18px; text-align: center; color: var(--fmp-muted); font-size: 13px; }
.fmp-rules { display: grid; gap: 13px; padding: 13px; }
.fmp-rule { position: relative; border: 1px solid var(--fmp-line); border-radius: 18px; background: transparent; overflow: visible; transition: border-color .18s, opacity .18s, box-shadow .18s; animation: fmp-rise .4s both; }
.fmp-rule:hover { border-color: color-mix(in srgb, var(--primary) 35%, var(--fmp-line)); }
.fmp-rule.is-disabled { opacity: .64; }
.fmp-rule.is-dragging { opacity: .38; border-style: dashed; box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--primary) 20%, transparent); }
.fmp-rule.is-drop-before::before, .fmp-rule.is-drop-after::after { content: ""; position: absolute; z-index: 4; left: 10px; right: 10px; height: 3px; border-radius: 999px; background: var(--fmp-teal); box-shadow: 0 0 0 4px color-mix(in srgb, var(--primary) 12%, transparent); pointer-events: none; }
.fmp-rule.is-drop-before::before { top: -8px; }
.fmp-rule.is-drop-after::after { bottom: -8px; }
.fmp-rule-head { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; padding: 14px 15px; border-bottom: 0; background: transparent; border-radius: 18px; transition: background .16s; }
.fmp-rule-head.is-clickable { cursor: pointer; }
.fmp-rule-head.is-clickable:hover { background: color-mix(in srgb, var(--muted) 30%, transparent); }
.fmp-rule.is-expanded .fmp-rule-head { border-bottom: 1px solid var(--fmp-line); border-radius: 18px 18px 0 0; }
.fmp-rule-head-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 9px; margin-left: auto; }
.fmp-rule-drag { appearance: none; flex: 0 0 26px; width: 26px; height: 32px; display: inline-grid; place-items: center; border: 1px solid transparent; border-radius: 8px; background: transparent; color: var(--fmp-muted); padding: 0; cursor: grab; touch-action: none; }
.fmp-rule-drag:hover:not(:disabled) { border-color: var(--fmp-line); background: var(--fmp-paper); color: var(--fmp-ink); }
.fmp-rule-drag:active:not(:disabled) { cursor: grabbing; }
.fmp-rule-drag:disabled { cursor: not-allowed; opacity: .3; }
.fmp-rule-drag:focus-visible { outline: 2px solid var(--fmp-teal); outline-offset: 2px; }
.fmp-rule-drag svg { width: 15px; height: 15px; fill: currentColor; }
.fmp-rule-index { width: 30px; height: 30px; display: grid; place-items: center; border-radius: 9px; background: var(--fmp-ink); color: var(--fmp-paper); font-family: "Iowan Old Style", serif; font-size: 14px; }
.fmp-rule-title { flex: 1 1 250px; min-width: 180px; }
.fmp-rule-name-shell { min-width: 0; }
.fmp-rule-name { appearance: none; display: inline-flex; align-items: center; gap: 7px; max-width: 100%; border: 0; background: transparent; color: var(--fmp-ink); padding: 2px 0; font: inherit; font-family: "Iowan Old Style", "Songti SC", serif; font-size: 18px; font-weight: 700; text-align: left; cursor: pointer; }
.fmp-rule-name > span { min-width: 0; overflow-wrap: anywhere; }
.fmp-rule-name-editor { display: flex; align-items: center; gap: 7px; min-width: 0; }
.fmp-rule-name-editor .fmp-input { flex: 1 1 auto; min-width: 0; }
.fmp-rule-title .fmp-input { border: 0; background: transparent; padding: 2px 0; font-family: "Iowan Old Style", "Songti SC", serif; font-size: 18px; font-weight: 700; }
.fmp-rule-title small { display: block; color: var(--fmp-muted); margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 10px; }
.fmp-status { display: inline-flex; align-items: center; gap: 7px; border-radius: 999px; padding: 6px 10px; font-size: 11px; font-weight: 800; white-space: nowrap; }
.fmp-status.is-hit { background: color-mix(in srgb, var(--primary) 11%, transparent); color: var(--fmp-teal-dark); }
.fmp-status.is-zero { background: var(--muted); color: var(--fmp-muted); }
.fmp-status.is-off { background: color-mix(in srgb, var(--destructive) 10%, transparent); color: var(--destructive); }
.fmp-status.is-warn { background: color-mix(in srgb, var(--chart-3) 14%, transparent); color: var(--fmp-gold); }
.fmp-rule-body { min-width: 0; padding: 14px 15px 15px; }
.fmp-form-grid { display: grid; grid-template-columns: repeat(12, minmax(0,1fr)); gap: 11px; min-width: 0; }
.fmp-form-grid > .fmp-message { grid-column: 1 / -1; }
.fmp-field { grid-column: span 4; min-width: 0; }
.fmp-field.is-six { grid-column: span 6; }
.fmp-field.is-eight { grid-column: span 8; }
.fmp-field.is-twelve { grid-column: 1 / -1; }
.fmp-combine-field { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px 18px; border: 1px solid color-mix(in srgb, var(--primary) 24%, var(--fmp-line)); border-radius: 13px; background: color-mix(in srgb, var(--primary) 4%, var(--fmp-paper)); padding: 12px 13px; }
.fmp-combine-copy { flex: 1 1 360px; min-width: 0; }
.fmp-combine-copy .fmp-label { margin-bottom: 3px; }
.fmp-combine-copy strong { display: block; color: var(--fmp-ink); font-size: 13px; line-height: 1.4; }
.fmp-combine-copy small { display: block; margin-top: 4px; color: var(--fmp-muted); font-size: 10px; line-height: 1.5; }
.fmp-combine-options { flex: 0 0 auto; display: inline-grid; grid-template-columns: repeat(2, minmax(94px, 1fr)); gap: 3px; padding: 3px; border: 1px solid var(--fmp-line); border-radius: 11px; background: var(--fmp-card); }
.fmp-combine-options button { appearance: none; display: grid; gap: 1px; border: 0; border-radius: 8px; background: transparent; color: var(--fmp-muted); padding: 7px 11px; font: inherit; text-align: left; cursor: pointer; }
.fmp-combine-options button:hover:not(:disabled) { background: color-mix(in srgb, var(--primary) 6%, transparent); color: var(--fmp-ink); }
.fmp-combine-options button.is-active { background: var(--fmp-teal); color: var(--primary-foreground); }
.fmp-combine-options button:disabled { cursor: not-allowed; opacity: .45; }
.fmp-combine-options button:focus-visible { outline: 2px solid var(--fmp-teal); outline-offset: 2px; }
.fmp-combine-options b { font-family: "SFMono-Regular", "Cascadia Code", monospace; font-size: 10px; letter-spacing: .08em; }
.fmp-combine-options span { font-size: 10px; font-weight: 750; white-space: nowrap; }
.fmp-preset-expr { display: grid; gap: 10px; min-width: 0; border: 1px solid color-mix(in srgb, var(--primary) 24%, var(--fmp-line)); border-radius: 14px; background: color-mix(in srgb, var(--primary) 3%, var(--fmp-paper)); padding: 12px; }
.fmp-preset-expr.is-nested { margin: 1px 0; border-color: var(--fmp-line); border-left: 3px solid color-mix(in srgb, var(--primary) 45%, var(--fmp-line)); background: color-mix(in srgb, var(--muted) 18%, var(--fmp-paper)); }
.fmp-preset-expr-head { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 9px 14px; }
.fmp-preset-expr-head > div:first-child { flex: 1 1 220px; min-width: 0; }
.fmp-preset-expr-head strong { display: block; font-size: 12px; }
.fmp-preset-expr-head small { display: block; margin-top: 3px; color: var(--fmp-muted); font-size: 10px; line-height: 1.45; }
.fmp-preset-expr-formula { overflow-wrap: anywhere; border: 1px dashed color-mix(in srgb, var(--primary) 26%, var(--fmp-line)); border-radius: 9px; background: var(--fmp-paper); color: var(--fmp-teal-dark); padding: 8px 10px; font-family: "SFMono-Regular", "Cascadia Code", monospace; font-size: 11px; line-height: 1.55; }
.fmp-preset-expr-empty { border: 1px dashed var(--fmp-line); border-radius: 9px; color: var(--fmp-muted); padding: 10px; font-size: 10px; line-height: 1.5; }
.fmp-preset-expr-children { display: grid; gap: 7px; }
.fmp-preset-ref { display: flex; align-items: center; gap: 8px; min-width: 0; border: 1px solid var(--fmp-line); border-radius: 10px; background: var(--fmp-paper); padding: 8px 9px; }
.fmp-preset-ref-kind { flex: 0 0 auto; border-radius: 999px; background: color-mix(in srgb, var(--primary) 11%, transparent); color: var(--fmp-teal-dark); padding: 3px 7px; font-size: 8px; font-weight: 800; letter-spacing: .07em; text-transform: uppercase; }
.fmp-preset-ref strong { flex: 1 1 auto; min-width: 0; overflow-wrap: anywhere; font-size: 12px; }
.fmp-preset-ref-remove { appearance: none; flex: 0 0 25px; width: 25px; height: 25px; border: 1px solid transparent; border-radius: 7px; background: transparent; color: var(--fmp-muted); padding: 0; font: inherit; font-size: 17px; line-height: 1; cursor: pointer; }
.fmp-preset-ref-remove:hover:not(:disabled) { border-color: color-mix(in srgb, var(--destructive) 34%, var(--fmp-line)); color: var(--destructive); }
.fmp-preset-expr-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 7px; padding-top: 2px; }
.fmp-preset-add-select { flex: 0 1 230px; min-width: 180px; }
.fmp-preset-add-select .fmp-select-trigger { min-height: 34px; padding-block: 6px; font-size: 11px; }
.fmp-preset-add-group, .fmp-preset-remove-group { min-height: 34px; padding: 6px 10px; font-size: 10px; }
.fmp-preset-remove-group { margin-left: auto; }
.fmp-preset-refs { display: grid; gap: 9px; border: 1px solid color-mix(in srgb, var(--primary) 22%, var(--fmp-line)); border-radius: 13px; background: color-mix(in srgb, var(--primary) 3%, var(--fmp-paper)); padding: 11px 12px; }
.fmp-preset-refs-head { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px 12px; }
.fmp-preset-refs-head > div:first-child { flex: 1 1 260px; min-width: 0; }
.fmp-preset-refs-head strong { display: block; font-size: 11px; }
.fmp-preset-refs-head small { display: block; margin-top: 3px; color: var(--fmp-muted); font-size: 9px; line-height: 1.45; }
.fmp-preset-refs-formula { overflow-wrap: anywhere; border: 1px dashed color-mix(in srgb, var(--primary) 26%, var(--fmp-line)); border-radius: 8px; background: var(--fmp-paper); color: var(--fmp-teal-dark); padding: 7px 9px; font-family: "SFMono-Regular", "Cascadia Code", monospace; font-size: 10px; line-height: 1.5; }
.fmp-preset-refs-list { display: flex; flex-wrap: wrap; gap: 6px; }
.fmp-preset-refs-list .fmp-preset-ref { flex: 0 1 auto; min-width: 145px; }
.fmp-preset-refs-legacy { border-radius: 8px; background: color-mix(in srgb, var(--chart-3) 9%, transparent); color: var(--fmp-gold); padding: 7px 9px; font-size: 9px; line-height: 1.45; }
.fmp-label { display: block; margin-bottom: 5px; color: var(--fmp-muted); font-size: 10px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
.fmp-input, .fmp-textarea { box-sizing: border-box; width: 100%; border: 1px solid var(--fmp-line); border-radius: 10px; background: var(--fmp-paper); color: var(--fmp-ink); padding: 9px 10px; font: inherit; font-size: 13px; transition: border-color .15s, box-shadow .15s; }
.fmp-textarea { min-height: 68px; resize: vertical; line-height: 1.55; font-family: "SFMono-Regular", "Cascadia Code", monospace; font-size: 12px; }
.fmp-input:hover:not(:disabled), .fmp-textarea:hover:not(:disabled) { border-color: color-mix(in srgb, var(--primary) 50%, var(--fmp-line)); }
.fmp-input:disabled, .fmp-textarea:disabled { background: color-mix(in srgb, var(--muted) 45%, transparent); color: var(--fmp-muted); }
.fmp-select-menu-root { position: relative; width: 100%; min-width: 0; }
.fmp-select-trigger { box-sizing: border-box; display: flex; align-items: center; justify-content: space-between; gap: 10px; width: 100%; min-height: 38px; border: 1px solid var(--fmp-line); border-radius: 10px; background: var(--fmp-paper); color: var(--fmp-ink); padding: 8px 10px; font: inherit; font-size: 13px; text-align: left; cursor: pointer; transition: border-color .15s, background .15s; }
.fmp-select-trigger:hover:not(:disabled), .fmp-select-trigger[aria-expanded="true"] { border-color: color-mix(in srgb, var(--primary) 50%, var(--fmp-line)); background: color-mix(in srgb, var(--primary) 4%, var(--fmp-paper)); }
.fmp-select-trigger:disabled { opacity: .48; cursor: not-allowed; }
.fmp-select-trigger span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fmp-select-trigger span.is-placeholder { color: var(--fmp-muted); }
.fmp-select-trigger > svg { flex: 0 0 14px; width: 14px; height: 14px; fill: none; stroke: var(--fmp-muted); stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; transition: transform .15s; }
.fmp-select-trigger[aria-expanded="true"] > svg { transform: rotate(180deg); }
.fmp-select-menu { box-sizing: border-box; min-width: 0; overflow: auto; padding: 5px; border: 1px solid var(--fmp-line); border-radius: 12px; background: var(--fmp-paper); color: var(--fmp-ink); box-shadow: 0 14px 38px color-mix(in srgb, var(--foreground) 18%, transparent); }
.fmp-select-option { appearance: none; display: flex; align-items: center; justify-content: space-between; gap: 12px; width: 100%; border: 0; border-radius: 8px; background: transparent; color: var(--fmp-ink); padding: 9px 10px; font: inherit; font-size: 12px; text-align: left; cursor: pointer; }
.fmp-select-option:hover, .fmp-select-option:focus-visible { background: color-mix(in srgb, var(--primary) 7%, transparent); }
.fmp-select-option.is-selected { background: color-mix(in srgb, var(--primary) 11%, transparent); color: var(--fmp-teal-dark); font-weight: 750; }
.fmp-select-option > span { min-width: 0; overflow-wrap: anywhere; }
.fmp-select-option > svg { flex: 0 0 14px; width: 14px; height: 14px; fill: none; stroke: var(--fmp-teal); stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.fmp-hint { margin-top: 5px; color: var(--fmp-muted); font-size: 10px; line-height: 1.45; }
.fmp-section-label { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin: 15px 0 7px; padding-top: 13px; border-top: 1px dashed var(--fmp-line); color: var(--fmp-ink); font-size: 12px; font-weight: 800; }
.fmp-tags, .fmp-matcher-chips { display: flex; flex-wrap: wrap; gap: 5px; min-width: 0; max-width: 100%; margin-top: 7px; }
.fmp-tag { display: inline-flex; align-items: center; gap: 3px; min-width: 0; max-width: 100%; border-radius: 999px; background: var(--muted); color: var(--fmp-teal-dark); padding: 3px 7px; font-size: 10px; font-weight: 750; }
.fmp-tag-text { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fmp-tag button { appearance: none; flex: 0 0 auto; border: 0; padding: 0; background: transparent; color: inherit; font: inherit; cursor: pointer; opacity: .62; }
.fmp-tag button:hover { opacity: 1; }
.fmp-tag.is-added { background: color-mix(in srgb, var(--primary) 15%, transparent); }
.fmp-tag.is-removed { background: color-mix(in srgb, var(--destructive) 10%, transparent); color: var(--destructive); text-decoration: line-through; }
.fmp-tag.is-removed button { text-decoration: none; }
.fmp-mode-tabs { display: inline-flex; flex-wrap: wrap; gap: 3px; margin-bottom: 9px; padding: 3px; border: 1px solid var(--fmp-line); border-radius: 9px; }
.fmp-mode-btn { border: 0; border-radius: 6px; background: transparent; color: var(--fmp-muted); padding: 5px 10px; font: inherit; font-size: 10px; font-weight: 750; cursor: pointer; }
.fmp-mode-btn.is-active { background: var(--muted); color: var(--fmp-ink); }
.fmp-mode-btn:disabled { opacity: .45; cursor: not-allowed; }
.fmp-conversion-note { margin: 0 0 8px; color: var(--fmp-gold); font-size: 10px; line-height: 1.45; }
.fmp-dsl-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 9px; margin-bottom: 6px; color: var(--fmp-muted); font-size: 10px; font-weight: 700; }
.fmp-dsl-toolbar .fmp-btn { min-height: 30px; padding: 5px 10px; font-size: 10px; }
.fmp-meta-list, .fmp-meta-fields { display: grid; gap: 6px; min-width: 0; }
.fmp-meta-row { display: grid; grid-template-columns: minmax(0,.8fr) minmax(0,1.4fr) auto; gap: 7px; min-width: 0; }
.fmp-add { border: 1px dashed color-mix(in srgb, var(--primary) 50%, var(--fmp-line)); border-radius: 8px; background: transparent; color: var(--fmp-teal-dark); padding: 5px 9px; font: inherit; font-size: 10px; font-weight: 750; cursor: pointer; }
.fmp-remove { border: 0; background: transparent; color: var(--destructive); font: inherit; font-size: 11px; font-weight: 750; cursor: pointer; padding: 5px; border-radius: 7px; }
.fmp-remove:hover { background: color-mix(in srgb, var(--destructive) 8%, transparent); }
.fmp-rule-section-head { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 7px 12px; margin: 2px 0 9px; font-size: 12px; font-weight: 800; }
.fmp-rule-section-head:not(:first-child) { margin-top: 17px; padding-top: 14px; border-top: 1px dashed var(--fmp-line); }
.fmp-rule-section-head span { display: inline-flex; align-items: center; gap: 7px; }
.fmp-rule-section-head b { display: inline-grid; place-items: center; min-width: 24px; height: 21px; border-radius: 6px; background: var(--muted); color: var(--fmp-muted); font-size: 9px; letter-spacing: .08em; }
.fmp-rule-section-head small { color: var(--fmp-muted); font-size: 10px; font-weight: 600; }
.fmp-help { margin-top: 18px; display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 10px; }
.fmp-help article { border: 1px solid var(--fmp-line); border-radius: 15px; padding: 14px 15px; background: transparent; }
.fmp-help h3 { margin: 0 0 6px; font-family: "Iowan Old Style", "Songti SC", serif; font-size: 16px; }
.fmp-help p { margin: 0; color: var(--fmp-muted); font-size: 11px; line-height: 1.65; }
.fmp-code { font-family: "SFMono-Regular", "Cascadia Code", monospace; color: var(--fmp-teal-dark); background: var(--muted); padding: 1px 4px; border-radius: 4px; }
.fmp-config-details { margin-top: 9px; }
.fmp-config-details summary { cursor: pointer; font-size: 11px; font-weight: 750; }
.fmp-config-details > strong { display: block; margin-top: 10px; font-size: 10px; }
.fmp-config-source { max-height: 220px; overflow: auto; margin: 10px 0 0; padding: 12px; border-radius: 10px; background: var(--muted); color: var(--foreground); font: 11px/1.55 "SFMono-Regular", monospace; white-space: pre-wrap; }
.fmp-matcher-picker { display: grid; gap: 7px; }
.fmp-matcher-toolbar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 7px; min-height: 38px; }
.fmp-matcher-type { display: inline-flex; align-items: center; gap: 7px; min-width: 0; }
.fmp-matcher-name { color: var(--fmp-muted); font-size: 10px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
.fmp-pattern-kind { display: inline-flex; align-items: center; border-radius: 999px; background: var(--muted); color: var(--fmp-muted); padding: 3px 7px; font-size: 9px; font-weight: 750; white-space: nowrap; }
.fmp-pattern-kind.is-wildcard { background: color-mix(in srgb, var(--chart-3) 14%, transparent); color: var(--fmp-gold); }
.fmp-matcher-actions { display: flex; flex-wrap: wrap; align-items: center; justify-content: flex-end; gap: 7px; margin-left: auto; }
.fmp-matcher-toolbar > .pm-search-select { flex: 0 0 auto; width: max-content; margin-left: auto; }
.fmp-tag-mode { display: flex; align-items: center; justify-content: flex-end; gap: 7px; }
.fmp-tag-mode > span { color: var(--fmp-muted); font-size: 9px; font-weight: 750; }
.fmp-matcher-readout { display: grid; gap: 7px; border: 1px solid var(--fmp-line); border-radius: 10px; background: color-mix(in srgb, var(--muted) 20%, transparent); padding: 9px 10px; }
.fmp-match-statement { display: grid; grid-template-columns: 74px minmax(0, 1fr); gap: 8px; align-items: start; }
.fmp-match-content { display: grid; grid-template-columns: 74px minmax(0, 1fr) auto; gap: 8px; align-items: start; border-radius: 7px; }
.fmp-match-statement > span, .fmp-match-content > span { color: var(--fmp-muted); font-size: 9px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; }
.fmp-match-content.is-expandable { cursor: pointer; margin: -3px -4px; padding: 3px 4px; }
.fmp-match-content.is-expandable:hover, .fmp-match-content.is-expandable:focus-visible { background: color-mix(in srgb, var(--primary) 5%, transparent); outline: none; }
.fmp-match-statement code { color: var(--fmp-teal-dark); font: 10px/1.55 "SFMono-Regular", "Cascadia Code", monospace; overflow-wrap: anywhere; }
.fmp-match-statement-lines { display: grid; gap: 4px; min-width: 0; }
.fmp-match-statement-lines code { display: flex; flex-wrap: nowrap; align-items: flex-start; gap: 4px; }
.fmp-match-statement-lines code > span:not(.fmp-logic-token) { min-width: 0; overflow-wrap: anywhere; }
.fmp-logic-token { display: inline-grid; place-items: center; min-width: 20px; border-radius: 5px; padding: 1px 5px; font-family: "Avenir Next", "PingFang SC", sans-serif; font-size: 8px; font-weight: 850; letter-spacing: .04em; line-height: 1.5; white-space: nowrap; }
.fmp-logic-token.is-and { background: color-mix(in srgb, var(--primary) 13%, transparent); color: var(--fmp-teal-dark); }
.fmp-logic-token.is-or { background: color-mix(in srgb, var(--chart-3) 16%, transparent); color: var(--fmp-gold); }
.fmp-logic-token.is-start { background: var(--muted); color: var(--fmp-muted); }
.fmp-logic-token.is-exclude { background: color-mix(in srgb, var(--destructive) 12%, transparent); color: var(--destructive); }
.fmp-match-content em { color: var(--fmp-muted); font-size: 10px; font-style: normal; }
.fmp-match-values { display: flex; flex-wrap: wrap; gap: 4px; min-width: 0; }
.fmp-match-content.is-expanded .fmp-match-values { max-height: 260px; overflow: auto; align-content: start; padding-right: 3px; }
.fmp-match-value { display: inline-flex; align-items: center; gap: 5px; max-width: 100%; border-radius: 5px; background: var(--fmp-paper); padding: 3px 6px; color: var(--fmp-ink); font-size: 9px; overflow-wrap: anywhere; }
.fmp-match-value small { color: var(--fmp-muted); font-size: 8px; }
.fmp-match-toggle { flex: 0 0 auto; color: var(--fmp-teal-dark); font-size: 9px; font-weight: 750; white-space: nowrap; }
.fmp-account-picker { position: relative; flex: 0 0 auto; width: max-content; min-width: 0; margin-left: auto; }
.fmp-account-picker .pm-search-select { flex: 0 0 auto; width: max-content; }
.fmp-account-picker > svg { position: absolute; z-index: 1; top: 50%; left: 8px; width: 13px; height: 13px; transform: translateY(-50%); fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; color: var(--fmp-muted); pointer-events: none; }
.fmp-account-picker .pm-account-browser-trigger { width: max-content; min-height: 30px; border-color: transparent; border-radius: 8px; background: transparent; color: var(--fmp-muted); padding: 0 2px 0 27px; transition: background .15s, border-color .15s, color .15s; }
.fmp-account-picker .pm-account-browser-trigger:hover, .fmp-account-picker .pm-account-browser-trigger:focus-within { border-color: color-mix(in srgb, var(--fmp-line) 68%, transparent); background: color-mix(in srgb, var(--fmp-ink) 3%, transparent); color: var(--fmp-ink); }
.fmp-account-picker .pm-account-browser-trigger > input[type=text] { flex: 0 0 2.4em; width: 2.4em; height: 28px; color: inherit; font-size: 11px; font-weight: 650; }
.fmp-account-picker .pm-account-browser-trigger > input[type=text]::placeholder { color: currentColor; opacity: .88; }
.fmp-account-picker .pm-account-browser-action { display: none; }
.fmp-kv { display: grid; gap: 6px; margin-top: 7px; }
.fmp-kv-head, .fmp-kv-row { display: grid; grid-template-columns: auto minmax(0,.8fr) minmax(0,1.3fr) auto; gap: 7px; align-items: center; min-width: 0; }
.fmp-kv.is-value-only .fmp-kv-head, .fmp-kv.is-value-only .fmp-kv-row { grid-template-columns: auto minmax(0,1fr) auto; }
.fmp-kv-head { padding: 0 2px; color: var(--fmp-muted); font-size: 9px; font-weight: 750; min-width: 0; }
.fmp-kv-head span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fmp-kv-row > .fmp-input, .fmp-meta-row > .fmp-input { min-width: 0; }
.fmp-kv-row.is-excluded { border-radius: 9px; background: color-mix(in srgb, var(--destructive) 4%, transparent); padding: 3px; margin: -3px; }
.fmp-kv-logic { display: inline-flex; align-items: center; gap: 3px; }
.fmp-kv-join, .fmp-kv-exclude { appearance: none; min-width: 42px; border: 1px solid var(--fmp-line); border-radius: 7px; background: var(--fmp-paper); color: var(--fmp-muted); padding: 6px 6px; font: inherit; font-size: 8px; font-weight: 800; cursor: pointer; }
.fmp-kv-join:hover:not(:disabled), .fmp-kv-exclude:hover:not(:disabled) { border-color: color-mix(in srgb, var(--primary) 42%, var(--fmp-line)); color: var(--fmp-ink); }
.fmp-kv-join:disabled { opacity: .55; cursor: default; }
.fmp-kv-exclude.is-active { border-color: color-mix(in srgb, var(--destructive) 34%, var(--fmp-line)); background: color-mix(in srgb, var(--destructive) 10%, transparent); color: var(--destructive); }
.fmp-picker-line { display: flex; gap: 7px; align-items: stretch; min-width: 0; }
.fmp-picker-line .fmp-input { flex: 1 1 auto; min-width: 0; }
.fmp-picker-trigger { display: inline-flex; align-items: center; justify-content: center; gap: 5px; flex: 0 0 auto; width: max-content; min-height: 30px; border: 1px solid transparent; border-radius: 8px; background: transparent; color: var(--fmp-muted); padding: 4px 7px; font: inherit; font-size: 10px; font-weight: 750; cursor: pointer; white-space: nowrap; transition: background .15s, border-color .15s, color .15s; }
.fmp-picker-trigger:hover:not(:disabled), .fmp-picker-trigger[aria-expanded="true"] { border-color: color-mix(in srgb, var(--fmp-line) 68%, transparent); background: color-mix(in srgb, var(--fmp-ink) 3%, transparent); color: var(--fmp-ink); }
.fmp-picker-trigger:disabled { opacity: .42; cursor: not-allowed; }
.fmp-picker-trigger svg, .fmp-icon-btn svg { width: 15px; height: 15px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.fmp-picker-trigger > svg { width: 13px; height: 13px; opacity: .78; }
.fmp-picker-trigger .fmp-count { min-width: 19px; height: 19px; padding: 0 5px; background: color-mix(in srgb, var(--fmp-ink) 6%, transparent); color: var(--fmp-muted); font-size: 9px; }
.fmp-picker-menu { box-sizing: border-box; min-height: 0; overflow: hidden !important; padding: 0; border-color: color-mix(in srgb, var(--fmp-ink) 13%, transparent); border-radius: 15px; background: var(--fmp-paper); color: var(--fmp-ink); box-shadow: 0 22px 52px color-mix(in srgb, var(--fmp-ink) 15%, transparent), 0 3px 10px color-mix(in srgb, var(--fmp-ink) 6%, transparent); }
.fmp-picker-search { flex: 0 0 auto; padding: 10px 11px; border-bottom: 1px solid var(--fmp-line); background: color-mix(in srgb, var(--muted) 24%, var(--fmp-paper)); }
.fmp-picker-search input { appearance: none; width: 100%; box-sizing: border-box; height: 36px; border: 1px solid color-mix(in srgb, var(--fmp-ink) 12%, transparent); border-radius: 9px; outline: 0; background: var(--fmp-paper); color: var(--fmp-ink); padding: 0 11px 0 34px; font: inherit; font-size: 12px; transition: border-color .15s, box-shadow .15s; }
.fmp-picker-search input::placeholder { color: color-mix(in srgb, var(--fmp-muted) 82%, transparent); }
.fmp-picker-search input:focus { border-color: color-mix(in srgb, var(--primary) 58%, var(--fmp-line)); box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 10%, transparent); }
.fmp-picker-search input::-webkit-search-cancel-button { appearance: none; }
.fmp-picker-search label { position: relative; display: block; }
.fmp-picker-search label > svg { position: absolute; top: 50%; left: 11px; width: 14px; height: 14px; transform: translateY(-50%); fill: none; stroke: var(--fmp-muted); stroke-width: 2; pointer-events: none; }
.fmp-picker-add-search { appearance: none; display: flex; align-items: center; gap: 6px; width: 100%; min-width: 0; margin-top: 7px; border: 1px dashed color-mix(in srgb, var(--primary) 38%, var(--fmp-line)); border-radius: 8px; background: color-mix(in srgb, var(--primary) 4%, transparent); color: var(--fmp-muted); padding: 6px 8px; font: inherit; font-size: 10px; font-weight: 700; text-align: left; cursor: pointer; }
.fmp-picker-add-search:hover { border-color: color-mix(in srgb, var(--primary) 62%, var(--fmp-line)); background: color-mix(in srgb, var(--primary) 8%, transparent); color: var(--fmp-ink); }
.fmp-picker-add-search svg { flex: 0 0 13px; width: 13px; height: 13px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.fmp-picker-add-search span { flex: 0 0 auto; }
.fmp-picker-add-search code { min-width: 0; overflow: hidden; color: var(--fmp-teal-dark); font: 10px/1.4 "SFMono-Regular", "Cascadia Code", monospace; text-overflow: ellipsis; white-space: nowrap; }
.fmp-facet-tabs { display: flex; flex: 0 0 auto; flex-wrap: nowrap; gap: 4px; padding: 7px 10px; border-bottom: 1px solid var(--fmp-line); background: color-mix(in srgb, var(--muted) 42%, var(--fmp-paper)); overflow-x: auto; scrollbar-width: none; }
.fmp-facet-tabs::-webkit-scrollbar { display: none; }
.fmp-facet-tab { display: inline-flex; flex: 0 0 auto; align-items: center; gap: 6px; border: 1px solid transparent; border-radius: 8px; background: transparent; color: var(--fmp-muted); padding: 7px 9px; font: inherit; font-size: 11px; font-weight: 750; cursor: pointer; transition: background .15s, border-color .15s, color .15s; }
.fmp-facet-tab:hover { background: color-mix(in srgb, var(--fmp-ink) 4%, transparent); color: var(--fmp-ink); }
.fmp-facet-tab.is-active { border-color: var(--fmp-line); background: var(--fmp-paper); color: var(--fmp-ink); box-shadow: 0 1px 4px color-mix(in srgb, var(--fmp-ink) 8%, transparent); }
.fmp-facet-tab small { color: var(--fmp-muted); font-size: 9px; font-weight: 700; }
.fmp-facet-tab svg { width: 14px; height: 14px; fill: none; stroke: currentColor; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }
.fmp-facet-list { display: grid; flex: 1 1 auto; align-content: start; gap: 3px; min-height: 0; overflow: auto; overscroll-behavior: contain; padding: 6px; scrollbar-color: color-mix(in srgb, var(--fmp-muted) 38%, transparent) transparent; scrollbar-width: thin; }
.fmp-facet-list-item { appearance: none; display: flex; align-items: center; gap: 9px; width: 100%; min-width: 0; border: 1px solid transparent; border-radius: 9px; background: transparent; color: var(--fmp-ink); padding: 8px; font: inherit; text-align: left; cursor: pointer; transition: background .12s, border-color .12s; }
.fmp-facet-list-item:hover { border-color: color-mix(in srgb, var(--fmp-line) 65%, transparent); background: color-mix(in srgb, var(--fmp-ink) 3.5%, transparent); }
.fmp-facet-list-item:focus-visible { outline: 2px solid var(--fmp-primary, var(--primary)); outline-offset: -2px; }
.fmp-facet-list-icon { display: grid; place-items: center; flex: 0 0 27px; width: 27px; height: 27px; border-radius: 7px; background: var(--muted); color: var(--fmp-muted); }
.fmp-facet-list-icon svg { width: 14px; height: 14px; fill: none; stroke: currentColor; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }
.fmp-facet-list-copy { display: grid; flex: 1 1 auto; gap: 2px; min-width: 0; }
.fmp-facet-list-copy strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12px; font-weight: 750; }
.fmp-facet-list-copy small { color: var(--fmp-muted); font-size: 9px; font-weight: 650; }
.fmp-facet-list-chevron { flex: 0 0 auto; color: var(--fmp-muted); font-size: 18px; line-height: 1; }
.fmp-facet-breadcrumb { display: flex; flex: 0 0 auto; align-items: center; gap: 8px; min-width: 0; padding: 7px 9px; border-bottom: 1px solid var(--fmp-line); background: color-mix(in srgb, var(--muted) 24%, var(--fmp-paper)); }
.fmp-facet-breadcrumb > button { appearance: none; display: inline-flex; align-items: center; gap: 3px; border: 0; border-radius: 6px; background: transparent; color: var(--fmp-muted); padding: 3px 5px; font: inherit; font-size: 10px; font-weight: 700; cursor: pointer; }
.fmp-facet-breadcrumb > button:hover { background: color-mix(in srgb, var(--fmp-ink) 5%, transparent); color: var(--fmp-ink); }
.fmp-facet-breadcrumb > button span { font-size: 14px; line-height: 1; }
.fmp-facet-breadcrumb > span { display: inline-flex; flex: 1 1 auto; align-items: center; gap: 5px; min-width: 0; color: var(--fmp-ink); }
.fmp-facet-breadcrumb svg { flex: 0 0 13px; width: 13px; height: 13px; fill: none; stroke: var(--fmp-muted); stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }
.fmp-facet-breadcrumb strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 11px; }
.fmp-facet-breadcrumb small { flex: 0 0 auto; color: var(--fmp-muted); font-size: 9px; font-weight: 650; }
.fmp-picker-options { flex: 1 1 auto; min-height: 0; max-height: none; overflow-x: hidden; overflow-y: auto; overscroll-behavior: contain; padding: 6px; scrollbar-color: color-mix(in srgb, var(--fmp-muted) 38%, transparent) transparent; scrollbar-width: thin; }
.fmp-picker-options::-webkit-scrollbar { width: 7px; }
.fmp-picker-options::-webkit-scrollbar-track { background: transparent; }
.fmp-picker-options::-webkit-scrollbar-thumb { border: 2px solid transparent; border-radius: 999px; background: color-mix(in srgb, var(--fmp-muted) 38%, transparent); background-clip: padding-box; }
.fmp-picker-options::-webkit-scrollbar-thumb:hover { background: color-mix(in srgb, var(--fmp-muted) 60%, transparent); background-clip: padding-box; }
.fmp-picker-group-title { padding: 8px 9px 5px; color: var(--fmp-muted); font-size: 9px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; }
.fmp-picker-option { display: flex; align-items: flex-start; gap: 9px; padding: 8px 9px; border-radius: 8px; cursor: pointer; transition: background .12s; }
.fmp-picker-option:hover { background: color-mix(in srgb, var(--fmp-ink) 4%, transparent); }
.fmp-picker-option:has(input:checked) { background: color-mix(in srgb, var(--primary) 7%, transparent); }
.fmp-picker-option.is-all-values { flex: 0 0 auto; margin: 6px 6px 0; border: 1px solid color-mix(in srgb, var(--primary) 20%, var(--fmp-line)); border-radius: 8px; background: color-mix(in srgb, var(--primary) 4%, var(--fmp-paper)); padding: 7px 9px; }
.fmp-picker-option.is-all-values span { font-weight: 800; }
.fmp-picker-option input { appearance: none; position: relative; flex: 0 0 auto; width: 16px; height: 16px; box-sizing: border-box; margin: 1px 0 0; border: 1px solid color-mix(in srgb, var(--fmp-ink) 24%, transparent); border-radius: 5px; background: var(--fmp-paper); cursor: pointer; transition: border-color .12s, background .12s, box-shadow .12s; }
.fmp-picker-option:hover input { border-color: color-mix(in srgb, var(--primary) 55%, var(--fmp-line)); }
.fmp-picker-option input:checked { border-color: var(--fmp-teal); background: var(--fmp-teal); }
.fmp-picker-option input:checked::after { content: ""; position: absolute; top: 2px; left: 5px; width: 4px; height: 8px; border: solid var(--primary-foreground); border-width: 0 2px 2px 0; transform: rotate(45deg); }
.fmp-picker-option input:focus-visible { outline: 2px solid color-mix(in srgb, var(--primary) 55%, transparent); outline-offset: 2px; }
.fmp-picker-option span { display: block; flex: 1 1 auto; min-width: 0; color: var(--fmp-ink); font-size: 12px; line-height: 1.45; overflow-wrap: anywhere; }
.fmp-picker-option small { flex: 0 0 auto; min-width: 20px; border-radius: 999px; background: var(--muted); color: var(--fmp-muted); padding: 2px 6px; font-size: 9px; font-weight: 700; text-align: center; }
.fmp-picker-empty { padding: 26px 12px; color: var(--fmp-muted); font-size: 12px; text-align: center; }
.fmp-picker-footer { display: flex; flex: 0 0 auto; align-items: center; gap: 8px; padding: 8px 10px; border-top: 1px solid var(--fmp-line); background: color-mix(in srgb, var(--muted) 24%, var(--fmp-paper)); }
.fmp-picker-footer span { flex: 1 1 auto; color: var(--fmp-muted); font-size: 10px; }
.fmp-picker-footer button { border: 1px solid var(--fmp-line); border-radius: 8px; background: var(--fmp-paper); color: var(--fmp-ink); padding: 6px 12px; font: inherit; font-size: 11px; font-weight: 750; cursor: pointer; transition: background .12s, border-color .12s; }
.fmp-picker-footer button:hover { border-color: color-mix(in srgb, var(--primary) 42%, var(--fmp-line)); background: color-mix(in srgb, var(--primary) 5%, var(--fmp-paper)); }
.fmp-account-browser-wrap { margin-top: 7px; }
.fmp-account-browser-wrap .pm-account-browser-trigger { min-height: 36px; border-color: var(--fmp-line); border-radius: 9px; background: var(--fmp-paper); }
.fmp-account-browser-wrap .pm-account-browser-trigger > input[type=text] { font-size: 12px; }
.fmp-time-field { display: grid; gap: 7px; }
.fmp-time-row { display: flex; gap: 7px; }
.fmp-time-row .fmp-input { flex: 1 1 auto; min-width: 0; }
.fmp-icon-btn { display: grid; place-items: center; flex: 0 0 38px; width: 38px; height: 38px; border: 1px solid var(--fmp-line); border-radius: 9px; background: var(--fmp-paper); color: var(--fmp-ink); cursor: pointer; }
.fmp-icon-btn:hover:not(:disabled) { border-color: color-mix(in srgb, var(--primary) 52%, var(--fmp-line)); background: color-mix(in srgb, var(--primary) 5%, transparent); }
.fmp-date-menu { box-sizing: border-box; padding: 0; border-radius: 13px; background: var(--fmp-paper); color: var(--fmp-ink); }
.fmp-date-head { padding: 13px 14px 10px; border-bottom: 1px solid var(--fmp-line); }
.fmp-date-head strong { display: block; font-family: "Iowan Old Style", "Songti SC", serif; font-size: 17px; }
.fmp-date-head span { display: block; margin-top: 3px; color: var(--fmp-muted); font-size: 10px; line-height: 1.45; }
.fmp-date-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; padding: 12px 14px; }
.fmp-date-fields label { color: var(--fmp-muted); font-size: 10px; font-weight: 750; }
.fmp-date-fields input { display: block; width: 100%; box-sizing: border-box; height: 36px; margin-top: 4px; border: 1px solid var(--fmp-line); border-radius: 8px; background: var(--fmp-paper); color: var(--fmp-ink); padding: 0 8px; font: inherit; font-size: 12px; }
.fmp-date-quick { display: flex; flex-wrap: wrap; gap: 6px; padding: 0 14px 12px; }
.fmp-date-quick button { border: 1px solid var(--fmp-line); border-radius: 999px; background: transparent; color: var(--fmp-ink); padding: 5px 9px; font: inherit; font-size: 10px; font-weight: 700; cursor: pointer; }
.fmp-date-quick button:hover { background: var(--muted); }
.fmp-date-quick button.is-selected { border-color: color-mix(in srgb, var(--primary) 45%, var(--fmp-line)); background: color-mix(in srgb, var(--primary) 10%, transparent); color: var(--fmp-teal-dark); }
.fmp-date-footer { display: flex; align-items: center; gap: 8px; padding: 10px 14px; border-top: 1px solid var(--fmp-line); }
.fmp-date-footer span { flex: 1 1 auto; color: var(--fmp-muted); font-size: 9px; line-height: 1.4; }
.fmp-date-footer button { border: 1px solid var(--fmp-line); border-radius: 8px; background: var(--fmp-paper); color: var(--fmp-ink); padding: 6px 11px; font: inherit; font-size: 11px; font-weight: 750; cursor: pointer; }
.fmp-date-footer button.is-primary { border-color: var(--fmp-teal); background: var(--fmp-teal); color: var(--primary-foreground); }
.fmp-preset-preview { margin-top: 7px; border: 1px solid var(--fmp-line); border-radius: 10px; background: color-mix(in srgb, var(--muted) 28%, transparent); overflow: hidden; }
.fmp-preset-preview summary { display: flex; align-items: center; gap: 8px; padding: 8px 10px; cursor: pointer; color: var(--fmp-muted); font-size: 10px; font-weight: 700; list-style: none; }
.fmp-preset-preview summary::-webkit-details-marker { display: none; }
.fmp-preset-preview summary strong { color: var(--fmp-ink); font-size: 11px; }
.fmp-preset-preview summary > svg { flex: 0 0 15px; width: 15px; height: 15px; fill: none; stroke: currentColor; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }
.fmp-preset-preview summary > span { min-width: 0; }
.fmp-preset-preview summary::after { content: "查看"; margin-left: auto; color: var(--fmp-teal-dark); }
.fmp-preset-preview[open] summary::after { content: "收起"; }
.fmp-preview-list { display: grid; gap: 1px; max-height: 260px; overflow: auto; border-top: 1px solid var(--fmp-line); }
.fmp-preview-row { display: grid; grid-template-columns: 78px minmax(0,1fr) auto; gap: 9px; align-items: start; padding: 8px 10px; background: var(--fmp-paper); font-size: 10px; }
.fmp-preview-row time { color: var(--fmp-muted); font-variant-numeric: tabular-nums; }
.fmp-preview-row strong { display: block; font-size: 11px; font-weight: 800; }
.fmp-preview-row span { display: block; margin-top: 2px; color: var(--fmp-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fmp-preview-row small { color: var(--fmp-muted); text-align: right; overflow-wrap: anywhere; }
.fmp-preview-meta-inline { grid-column: 1 / -1; display: flex; flex-wrap: wrap; gap: 4px 10px; padding-top: 4px; border-top: 1px dashed var(--fmp-line); color: var(--fmp-muted); font-size: 9px; line-height: 1.5; }
.fmp-preview-meta-inline b { color: var(--fmp-ink); font-weight: 750; }
.fmp-preview-empty { padding: 13px 10px; background: var(--fmp-paper); color: var(--fmp-muted); font-size: 10px; }
.fmp-preview-section { margin-top: 18px; border: 1px solid var(--fmp-line); border-radius: 20px; background: var(--fmp-card); overflow: hidden; }
.fmp-preview-section-head { display: flex; flex-wrap: wrap; align-items: flex-start; justify-content: space-between; gap: 15px; padding: 18px; border-bottom: 1px solid var(--fmp-line); }
.fmp-preview-section-head h2 { margin: 5px 0 4px; font-family: "Iowan Old Style", "Songti SC", serif; font-size: 23px; letter-spacing: -.02em; }
.fmp-preview-section-head p { margin: 0; color: var(--fmp-muted); font-size: 12px; line-height: 1.55; }
.fmp-preview-tools { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }
.fmp-preview-mode { display: inline-flex; gap: 3px; padding: 3px; border: 1px solid var(--fmp-line); border-radius: 10px; background: color-mix(in srgb, var(--muted) 34%, transparent); }
.fmp-preview-mode button { appearance: none; border: 0; border-radius: 7px; background: transparent; color: var(--fmp-muted); padding: 6px 10px; font: inherit; font-size: 10px; font-weight: 750; cursor: pointer; }
.fmp-preview-mode button:hover { color: var(--fmp-ink); }
.fmp-preview-mode button.is-active { background: var(--fmp-card); color: var(--fmp-ink); box-shadow: 0 1px 5px color-mix(in srgb, var(--foreground) 12%, transparent); }
.fmp-preview-rule-list { display: grid; gap: 10px; padding: 13px; }
.fmp-preview-rule { border: 1px solid var(--fmp-line); border-radius: 15px; background: transparent; overflow: hidden; }
.fmp-preview-rule[open] { border-color: color-mix(in srgb, var(--primary) 38%, var(--fmp-line)); }
.fmp-preview-rule.is-disabled { opacity: .65; }
.fmp-preview-rule summary { display: grid; grid-template-columns: 28px minmax(0,1fr) auto auto auto; align-items: center; gap: 10px; padding: 12px 13px; list-style: none; cursor: pointer; }
.fmp-preview-rule summary::-webkit-details-marker { display: none; }
.fmp-preview-rule summary::after { content: "展开"; color: var(--fmp-muted); font-size: 10px; font-weight: 750; }
.fmp-preview-rule[open] summary::after { content: "收起"; }
.fmp-preview-rule-index { display: grid; place-items: center; width: 28px; height: 28px; border-radius: 8px; background: var(--muted); color: var(--fmp-muted); font-size: 10px; font-weight: 800; }
.fmp-preview-rule-title { min-width: 0; }
.fmp-preview-rule-title strong { display: block; overflow-wrap: anywhere; font-size: 13px; }
.fmp-preview-rule-title small { display: block; margin-top: 3px; color: var(--fmp-muted); font-size: 10px; }
.fmp-preview-rule-count { min-width: 47px; border-radius: 999px; background: var(--muted); color: var(--fmp-muted); padding: 5px 8px; font-size: 10px; font-weight: 800; text-align: center; white-space: nowrap; }
.fmp-preview-rule-count.is-hit { background: color-mix(in srgb, var(--primary) 12%, transparent); color: var(--fmp-teal-dark); }
.fmp-preview-rule-tools { display: flex; align-items: center; justify-content: flex-end; }
.fmp-preview-rule-tools .fmp-preview-mode { padding: 2px; border-radius: 9px; }
.fmp-preview-rule-tools .fmp-preview-mode button { padding: 4px 7px; font-size: 9px; }
.fmp-preview-rule-body { border-top: 1px solid var(--fmp-line); }
.fmp-diff-list { display: grid; gap: 10px; max-height: 660px; overflow: auto; padding: 10px; background: color-mix(in srgb, var(--muted) 18%, transparent); }
.fmp-diff-record { --fmp-flow-color: var(--fmp-muted); --fmp-flow-tint: var(--muted); border: 1px solid var(--fmp-line); border-left: 3px solid var(--fmp-flow-color); border-radius: 12px; background: linear-gradient(90deg, color-mix(in srgb, var(--fmp-flow-tint) 9%, var(--fmp-paper)), var(--fmp-paper) 34%); overflow: hidden; }
.fmp-diff-record.is-payment { --fmp-flow-color: var(--destructive); --fmp-flow-tint: var(--destructive); }
.fmp-diff-record.is-receipt { --fmp-flow-color: var(--primary); --fmp-flow-tint: var(--primary); }
.fmp-diff-record.is-transfer { --fmp-flow-color: #2f6fed; --fmp-flow-tint: #2f6fed; }
.fmp-diff-record.is-mixed { --fmp-flow-color: var(--chart-3); --fmp-flow-tint: var(--chart-3); }
.fmp-diff-record-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; padding: 10px 11px; border-bottom: 1px solid var(--fmp-line); }
.fmp-diff-record-head > div { flex: 1 1 auto; min-width: 0; }
.fmp-diff-record-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 3px 7px; }
.fmp-diff-record-head time { display: block; color: var(--fmp-muted); font-size: 9px; font-variant-numeric: tabular-nums; }
.fmp-diff-record-head strong { display: block; margin-top: 2px; overflow-wrap: anywhere; font-size: 12px; }
.fmp-diff-record-head > div > span { display: block; margin-top: 3px; color: var(--fmp-muted); font-size: 9px; }
.fmp-flow-badge { border-radius: 999px; background: color-mix(in srgb, var(--fmp-flow-color) 10%, transparent); color: var(--fmp-flow-color); padding: 2px 6px; font-size: 8px; font-weight: 800; line-height: 1.4; white-space: nowrap; }
.fmp-diff-amounts { display: flex; flex-wrap: wrap; justify-content: flex-start; gap: 3px 8px; color: var(--fmp-flow-color); }
.fmp-diff-amount { display: inline-flex; align-items: baseline; gap: 3px; font-variant-numeric: tabular-nums; white-space: nowrap; }
.fmp-diff-amount strong { margin: 0; color: inherit; font-family: "Iowan Old Style", "Songti SC", serif; font-size: 14px; font-weight: 800; line-height: 1; }
.fmp-diff-amount small { color: var(--fmp-muted); font-size: 8px; font-weight: 800; }
.fmp-diff-amounts.is-empty { color: var(--fmp-muted); font-size: 9px; }
.fmp-diff-count { flex: 0 0 auto; border-radius: 999px; background: color-mix(in srgb, var(--primary) 11%, transparent); color: var(--fmp-teal-dark); padding: 4px 7px; font-size: 9px; font-weight: 800; }
.fmp-diff-count.is-zero { background: var(--muted); color: var(--fmp-muted); }
.fmp-diff-table { font-size: 10px; }
.fmp-diff-head, .fmp-diff-row { display: grid; grid-template-columns: minmax(92px,.55fr) minmax(0,1fr) minmax(0,1fr); }
.fmp-diff-head { background: var(--muted); color: var(--fmp-muted); font-size: 8px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
.fmp-diff-head span { padding: 6px 9px; }
.fmp-diff-head span + span, .fmp-diff-cell + .fmp-diff-cell { border-left: 1px solid var(--fmp-line); }
.fmp-diff-row + .fmp-diff-row { border-top: 1px solid var(--fmp-line); }
.fmp-diff-row.is-changed { background: color-mix(in srgb, var(--primary) 2%, transparent); }
.fmp-diff-field { display: flex; flex-wrap: wrap; align-content: center; gap: 4px; padding: 7px 9px; color: var(--fmp-muted); font-weight: 750; }
.fmp-diff-field code { font: inherit; color: var(--fmp-ink); overflow-wrap: anywhere; }
.fmp-diff-field em { border-radius: 999px; background: color-mix(in srgb, var(--chart-3) 14%, transparent); color: var(--fmp-gold); padding: 1px 5px; font-size: 8px; font-style: normal; font-weight: 800; }
.fmp-diff-cell { min-width: 0; padding: 7px 9px; color: var(--fmp-muted); line-height: 1.5; overflow-wrap: anywhere; }
.fmp-diff-cell.is-removed { background: color-mix(in srgb, var(--destructive) 9%, transparent); color: var(--destructive); box-shadow: inset 2px 0 color-mix(in srgb, var(--destructive) 62%, transparent); }
.fmp-diff-cell.is-added { background: color-mix(in srgb, var(--primary) 10%, transparent); color: var(--fmp-teal-dark); box-shadow: inset 2px 0 color-mix(in srgb, var(--primary) 70%, transparent); }
.fmp-diff-empty { color: var(--fmp-muted); font-style: italic; }
.fmp-diff-tags, .fmp-diff-accounts { display: flex; flex-wrap: wrap; gap: 4px; }
.fmp-diff-tag, .fmp-diff-account { display: inline-flex; border-radius: 5px; background: var(--muted); padding: 2px 5px; font-size: 9px; font-weight: 700; }
.fmp-diff-tag.is-removed { background: color-mix(in srgb, var(--destructive) 13%, transparent); color: var(--destructive); text-decoration: line-through; }
.fmp-diff-tag.is-added { background: color-mix(in srgb, var(--primary) 16%, transparent); color: var(--fmp-teal-dark); }
.fmp-diff-account { font-family: "SFMono-Regular", "Cascadia Code", monospace; overflow-wrap: anywhere; }
.fmp-diff-account.is-removed { background: color-mix(in srgb, var(--destructive) 13%, transparent); color: var(--destructive); text-decoration: line-through; }
.fmp-diff-account.is-added { background: color-mix(in srgb, var(--primary) 16%, transparent); color: var(--fmp-teal-dark); }
.fmp-diff-none { padding: 13px 11px; color: var(--fmp-muted); font-size: 10px; }
.fmp-preview-more { padding: 8px 11px; border-top: 1px solid var(--fmp-line); background: var(--muted); color: var(--fmp-muted); font-size: 9px; }
.fmp-select-native { appearance: auto; cursor: pointer; }
.fmp-query-index { background: var(--fmp-gold); color: var(--background); font-family: "SFMono-Regular", "Cascadia Code", monospace; font-size: 10px; }
.fmp-query-rule { border-left: 3px solid color-mix(in srgb, var(--chart-3) 55%, var(--fmp-line)); }
.fmp-query-preview-section { min-width: 0; background: color-mix(in srgb, var(--chart-3) 2%, transparent); }
.fmp-query-preview-empty { margin: 13px; padding: 22px 16px; border: 1px dashed var(--fmp-line); border-radius: 13px; background: var(--fmp-paper); color: var(--fmp-muted); font-size: 11px; text-align: center; }
.fmp-query-preview-list { display: grid; gap: 10px; padding: 13px; }
.fmp-query-preview-rule { border: 1px solid var(--fmp-line); border-left: 3px solid color-mix(in srgb, var(--chart-3) 48%, var(--fmp-line)); border-radius: 14px; background: var(--fmp-paper); overflow: hidden; }
.fmp-query-preview-rule.is-expanded { border-color: color-mix(in srgb, var(--chart-3) 38%, var(--fmp-line)); border-left-color: var(--fmp-gold); }
.fmp-query-preview-rule.is-disabled { opacity: .65; }
.fmp-query-preview-toggle { appearance: none; display: grid; grid-template-columns: 34px minmax(0,1fr) minmax(240px,auto) auto; align-items: center; gap: 11px; width: 100%; border: 0; background: transparent; color: inherit; padding: 12px 13px; font: inherit; text-align: left; cursor: pointer; }
.fmp-query-preview-toggle::after { content: "展开"; color: var(--fmp-muted); font-size: 9px; font-weight: 800; }
.fmp-query-preview-rule.is-expanded .fmp-query-preview-toggle::after { content: "收起"; }
.fmp-query-preview-toggle:focus-visible { outline: 2px solid var(--fmp-teal); outline-offset: -3px; }
.fmp-query-preview-total { display: flex; flex-wrap: wrap; align-items: flex-start; justify-content: flex-end; gap: 8px 14px; min-width: 0; text-align: right; }
.fmp-query-preview-metric { min-width: 0; }
.fmp-query-preview-total small { display: block; color: var(--fmp-muted); font-size: 8px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; }
.fmp-query-preview-total strong { display: block; margin-top: 2px; color: var(--fmp-gold); font-size: 12px; font-variant-numeric: tabular-nums; white-space: pre-line; overflow-wrap: anywhere; }
.fmp-query-preview-metric + .fmp-query-preview-metric { padding-left: 14px; border-left: 1px solid color-mix(in srgb, var(--fmp-line) 76%, transparent); }
.fmp-query-preview-metric.is-spending strong { color: var(--fmp-ink); font-size: 10px; }
.fmp-rule-title small.fmp-query-rule-summary { white-space: pre-line; }
.fmp-query-preview-body { background: var(--fmp-paper); }
.fmp-query-groups { display: grid; gap: 8px; padding: 10px; }
.fmp-query-group { border: 1px solid var(--fmp-line); border-radius: 11px; background: var(--fmp-paper); overflow: hidden; }
.fmp-query-group[open] { border-color: color-mix(in srgb, var(--chart-3) 38%, var(--fmp-line)); }
.fmp-query-group > summary { display: grid; grid-template-columns: minmax(150px,1fr) minmax(130px,auto) minmax(135px,auto); align-items: center; gap: 9px 16px; padding: 11px 12px; list-style: none; cursor: pointer; }
.fmp-query-group > summary::-webkit-details-marker { display: none; }
.fmp-query-group > summary::after { content: "明细"; grid-column: 1 / -1; justify-self: end; color: var(--fmp-muted); font-size: 8px; font-weight: 800; }
.fmp-query-group[open] > summary::after { content: "收起明细"; }
.fmp-query-group-main, .fmp-query-frequency, .fmp-query-group-annual { min-width: 0; }
.fmp-query-group-main strong { display: block; overflow-wrap: anywhere; font-size: 12px; }
.fmp-query-group-main small, .fmp-query-frequency small, .fmp-query-group-annual small { display: block; margin-top: 3px; color: var(--fmp-muted); font-size: 8px; line-height: 1.4; }
.fmp-query-frequency { border-left: 1px solid var(--fmp-line); padding-left: 14px; }
.fmp-query-frequency b { display: block; color: var(--fmp-teal-dark); font-size: 10px; line-height: 1.4; }
.fmp-query-group-annual { border-left: 1px solid var(--fmp-line); padding-left: 14px; text-align: right; }
.fmp-query-group-annual small { margin: 0; }
.fmp-query-group-annual strong { display: block; margin-top: 3px; color: var(--fmp-gold); font-size: 10px; font-variant-numeric: tabular-nums; white-space: pre-line; overflow-wrap: anywhere; }
.fmp-query-group-body { border-top: 1px solid var(--fmp-line); background: color-mix(in srgb, var(--muted) 12%, var(--fmp-paper)); }
.fmp-query-amounts { display: grid; grid-template-columns: repeat(auto-fit, minmax(165px,1fr)); gap: 7px; padding: 10px 10px 0; }
.fmp-query-amount { border: 1px solid var(--fmp-line); border-radius: 9px; background: var(--fmp-card); padding: 9px 10px; }
.fmp-query-amount > span { display: inline-grid; place-items: center; min-width: 28px; border-radius: 999px; background: color-mix(in srgb, var(--chart-3) 13%, transparent); color: var(--fmp-gold); padding: 2px 6px; font-size: 8px; font-weight: 850; }
.fmp-query-amount strong { display: block; margin-top: 6px; font-size: 11px; font-variant-numeric: tabular-nums; }
.fmp-query-amount small { display: block; margin-top: 3px; color: var(--fmp-muted); font-size: 8px; line-height: 1.45; }
.fmp-query-note, .fmp-query-warning { margin: 10px 10px 0; border-radius: 8px; padding: 8px 10px; font-size: 9px; line-height: 1.5; }
.fmp-query-note { background: var(--muted); color: var(--fmp-muted); }
.fmp-query-warning { background: color-mix(in srgb, var(--chart-3) 10%, transparent); color: var(--fmp-gold); }
.fmp-query-occurrence-head { display: flex; justify-content: space-between; gap: 12px; padding: 12px 11px 7px; color: var(--fmp-muted); font-size: 8px; font-weight: 850; letter-spacing: .08em; text-transform: uppercase; }
.fmp-query-occurrences { display: grid; margin: 0 10px 10px; border: 1px solid var(--fmp-line); border-radius: 9px; background: var(--fmp-card); overflow: hidden; }
.fmp-query-occurrence { --fmp-flow-color: var(--fmp-muted); --fmp-flow-tint: var(--fmp-muted); position: relative; background: linear-gradient(90deg, color-mix(in srgb, var(--fmp-flow-tint) 7%, transparent), transparent 26%); }
.fmp-query-occurrence::before { content: ""; position: absolute; inset: 0 auto 0 0; width: 3px; background: var(--fmp-flow-color); opacity: .78; }
.fmp-query-occurrence.is-payment { --fmp-flow-color: var(--destructive); --fmp-flow-tint: var(--destructive); }
.fmp-query-occurrence.is-receipt { --fmp-flow-color: var(--primary); --fmp-flow-tint: var(--primary); }
.fmp-query-occurrence.is-transfer { --fmp-flow-color: #2f6fed; --fmp-flow-tint: #2f6fed; }
.fmp-query-occurrence.is-mixed { --fmp-flow-color: var(--chart-3); --fmp-flow-tint: var(--chart-3); }
.fmp-query-occurrence + .fmp-query-occurrence { border-top: 1px solid var(--fmp-line); }
.fmp-query-occurrence-toggle { appearance: none; display: grid; grid-template-columns: 82px minmax(0,1fr) auto 14px; align-items: start; gap: 9px; width: 100%; border: 0; background: transparent; color: inherit; padding: 8px 9px 8px 12px; font: inherit; text-align: left; cursor: pointer; transition: background .16s; }
.fmp-query-occurrence-toggle:hover { background: color-mix(in srgb, var(--fmp-flow-tint) 6%, transparent); }
.fmp-query-occurrence-toggle:focus-visible { outline: 2px solid var(--fmp-flow-color); outline-offset: -3px; }
.fmp-query-occurrence time { color: var(--fmp-muted); font-size: 9px; font-variant-numeric: tabular-nums; }
.fmp-query-occurrence-copy { min-width: 0; }
.fmp-query-occurrence-title { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 6px; }
.fmp-query-occurrence-copy strong { min-width: 0; overflow-wrap: anywhere; font-size: 10px; }
.fmp-query-occurrence-copy small { display: block; margin-top: 2px; color: var(--fmp-muted); font-size: 9px; line-height: 1.4; }
.fmp-query-flow-badge { flex: none; border-radius: 999px; background: color-mix(in srgb, var(--fmp-flow-color) 10%, transparent); color: var(--fmp-flow-color); padding: 1px 5px; font-size: 7px; font-weight: 850; line-height: 1.45; white-space: nowrap; }
.fmp-query-occurrence-chevron { align-self: center; width: 14px; height: 14px; fill: none; stroke: currentColor; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; color: var(--fmp-muted); transition: transform .16s, color .16s; }
.fmp-query-occurrence-toggle:hover .fmp-query-occurrence-chevron { color: var(--fmp-flow-color); }
.fmp-query-occurrence.is-expanded .fmp-query-occurrence-chevron { color: var(--fmp-flow-color); transform: rotate(180deg); }
.fmp-query-tags { display: flex; flex-wrap: wrap; gap: 3px; margin-top: 4px; }
.fmp-query-tags em { border-radius: 4px; background: color-mix(in srgb, var(--primary) 9%, transparent); color: var(--fmp-teal-dark); padding: 1px 4px; font-size: 7px; font-style: normal; font-weight: 750; }
.fmp-query-occurrence-amount { min-width: 78px; color: var(--fmp-flow-color); font-size: 10px; font-weight: 800; font-variant-numeric: tabular-nums; text-align: right; overflow-wrap: anywhere; }
.fmp-query-occurrence-amount > span { display: block; }
.fmp-query-occurrence-amount > span + span { margin-top: 2px; }
.fmp-query-occurrence-amount small { color: var(--fmp-muted); font-size: 8px; }
.fmp-query-occurrence-detail { display: grid; gap: 9px; margin: 0 9px 9px 12px; border-top: 1px dashed color-mix(in srgb, var(--fmp-flow-color) 28%, var(--fmp-line)); padding: 9px 0 2px; }
.fmp-query-occurrence-detail-head { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; }
.fmp-query-occurrence-detail-head strong { color: var(--fmp-flow-color); font-size: 9px; letter-spacing: .04em; }
.fmp-query-occurrence-detail-head small { color: var(--fmp-muted); font-size: 8px; font-variant-numeric: tabular-nums; }
.fmp-query-detail-section { display: grid; gap: 5px; min-width: 0; }
.fmp-query-detail-label { color: var(--fmp-muted); font-size: 8px; font-weight: 800; letter-spacing: .06em; }
.fmp-query-detail-table-wrap { max-width: 100%; overflow-x: auto; border: 1px solid color-mix(in srgb, var(--fmp-flow-color) 18%, var(--fmp-line)); border-radius: 7px; background: var(--fmp-card); }
.fmp-query-detail-table, .fmp-query-detail-meta-table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 8px; text-align: left; }
.fmp-query-detail-table { min-width: 500px; }
.fmp-query-detail-table thead { background: color-mix(in srgb, var(--fmp-flow-color) 6%, var(--muted)); }
.fmp-query-detail-table th, .fmp-query-detail-table td { padding: 6px 7px; border-bottom: 1px solid var(--fmp-line); vertical-align: top; }
.fmp-query-detail-table thead th { color: var(--fmp-muted); font-size: 7px; font-weight: 850; letter-spacing: .05em; text-transform: uppercase; white-space: nowrap; }
.fmp-query-detail-table tbody tr:last-child > * { border-bottom: 0; }
.fmp-query-detail-table tbody th { min-width: 145px; color: var(--fmp-ink); font-family: "SFMono-Regular", "Cascadia Code", monospace; font-size: 8px; font-weight: 700; line-height: 1.45; overflow-wrap: anywhere; }
.fmp-query-detail-posting-amount { min-width: 95px; color: var(--fmp-ink); font-variant-numeric: tabular-nums; white-space: nowrap; }
.fmp-query-detail-posting-amount strong { font-size: 9px; }
.fmp-query-detail-posting-amount small { color: var(--fmp-muted); font-size: 7px; font-weight: 750; }
.fmp-query-detail-quote { min-width: 170px; }
.fmp-query-detail-quote-line { display: flex; flex-wrap: wrap; align-items: baseline; gap: 2px 5px; line-height: 1.45; }
.fmp-query-detail-quote-line + .fmp-query-detail-quote-line { margin-top: 4px; padding-top: 4px; border-top: 1px dashed var(--fmp-line); }
.fmp-query-detail-quote-line em { border-radius: 999px; background: color-mix(in srgb, var(--fmp-flow-color) 10%, transparent); color: var(--fmp-flow-color); padding: 1px 4px; font-size: 7px; font-style: normal; font-weight: 850; line-height: 1.35; }
.fmp-query-detail-quote-line span { color: var(--fmp-ink); white-space: nowrap; }
.fmp-query-detail-quote-line strong { font-size: 9px; font-variant-numeric: tabular-nums; }
.fmp-query-detail-quote-line small { flex-basis: 100%; color: var(--fmp-muted); font-size: 7px; }
.fmp-query-detail-meta-table { border: 1px solid var(--fmp-line); border-radius: 7px; background: color-mix(in srgb, var(--muted) 22%, var(--fmp-card)); overflow: hidden; }
.fmp-query-detail-meta-table th, .fmp-query-detail-meta-table td { padding: 5px 7px; border-bottom: 1px solid var(--fmp-line); vertical-align: top; }
.fmp-query-detail-meta-table tr:last-child > * { border-bottom: 0; }
.fmp-query-detail-meta-table th { width: 30%; color: var(--fmp-muted); font-size: 7px; font-weight: 750; letter-spacing: .04em; overflow-wrap: anywhere; }
.fmp-query-detail-meta-table td { color: var(--fmp-ink); font-size: 8px; line-height: 1.45; overflow-wrap: anywhere; }
.fmp-query-detail-empty { color: var(--fmp-muted); font-size: 8px; }
.fmp-query-more { border-top: 1px solid var(--fmp-line); padding: 8px 10px; color: var(--fmp-muted); font-size: 8px; line-height: 1.5; }
.fmp-sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
.fmp-query-column-list { display: grid; gap: 7px; }
.fmp-query-column-head, .fmp-query-column { display: grid; grid-template-columns: 38px minmax(110px,.7fr) 130px minmax(130px,1fr) 106px auto; gap: 8px; align-items: center; min-width: 0; }
.fmp-query-column-head { padding: 0 4px; color: var(--fmp-muted); font-size: 8px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; }
.fmp-query-column { border: 1px solid var(--fmp-line); border-radius: 11px; background: color-mix(in srgb, var(--muted) 16%, var(--fmp-paper)); padding: 7px; }
.fmp-query-column:focus-within { border-color: color-mix(in srgb, var(--chart-3) 45%, var(--fmp-line)); }
.fmp-query-column-index { display: grid; place-items: center; width: 28px; height: 28px; border-radius: 8px; background: color-mix(in srgb, var(--chart-3) 13%, transparent); color: var(--fmp-gold); font-family: "SFMono-Regular", "Cascadia Code", monospace; font-size: 9px; font-weight: 850; }
.fmp-query-column-field { display: grid; gap: 3px; min-width: 0; }
.fmp-query-column-field > span { display: none; color: var(--fmp-muted); font-size: 8px; font-weight: 750; }
.fmp-query-column .fmp-input { min-width: 0; padding: 7px 8px; font-size: 11px; }
.fmp-query-column-group { display: flex; align-items: center; gap: 6px; min-height: 32px; border: 1px solid var(--fmp-line); border-radius: 8px; background: var(--fmp-paper); color: var(--fmp-muted); padding: 5px 7px; font-size: 9px; font-weight: 750; white-space: nowrap; cursor: pointer; }
.fmp-query-column-group:has(input:checked) { border-color: color-mix(in srgb, var(--chart-3) 45%, var(--fmp-line)); background: color-mix(in srgb, var(--chart-3) 8%, var(--fmp-paper)); color: var(--fmp-gold); }
.fmp-query-column-group input { width: 14px; height: 14px; margin: 0; accent-color: var(--fmp-teal); }
.fmp-query-column-actions { display: flex; align-items: center; justify-content: flex-end; gap: 3px; }
.fmp-query-column-actions .fmp-icon-btn { flex-basis: 27px; width: 27px; height: 27px; padding: 0; font-size: 11px; }
.fmp-query-column-actions .fmp-remove { padding: 4px; font-size: 9px; }
.fmp-query-column-add { justify-self: start; margin-top: 2px; }
.fmp-query-group-summary { display: grid; gap: 3px; margin-top: 10px; border: 1px dashed color-mix(in srgb, var(--chart-3) 38%, var(--fmp-line)); border-radius: 9px; background: color-mix(in srgb, var(--chart-3) 5%, transparent); padding: 8px 10px; }
.fmp-query-group-summary strong { color: var(--fmp-gold); font-size: 10px; }
.fmp-query-group-summary span { color: var(--fmp-muted); font-size: 9px; line-height: 1.5; }
.fmp-query-table-wrap { overflow-x: auto; padding: 10px; }
.fmp-query-table { width: 100%; min-width: 680px; border-collapse: separate; border-spacing: 0; border: 1px solid var(--fmp-line); border-radius: 10px; background: var(--fmp-paper); font-size: 10px; }
.fmp-query-table thead { background: var(--muted); }
.fmp-query-table th, .fmp-query-table td { padding: 8px 9px; border-bottom: 1px solid var(--fmp-line); text-align: left; vertical-align: top; }
.fmp-query-table thead th { color: var(--fmp-muted); font-size: 8px; font-weight: 850; letter-spacing: .06em; text-transform: uppercase; white-space: nowrap; }
.fmp-query-table thead th > span { display: inline; }
.fmp-query-table thead th > small { margin-left: 5px; border-radius: 999px; background: color-mix(in srgb, var(--chart-3) 13%, transparent); color: var(--fmp-gold); padding: 1px 5px; font-size: 7px; }
.fmp-query-table tbody tr:last-child > * { border-bottom: 0; }
.fmp-query-table tbody tr.is-expanded > * { background: color-mix(in srgb, var(--chart-3) 4%, transparent); }
.fmp-query-table tbody th { color: var(--fmp-ink); font-weight: 800; text-align: left; }
.fmp-query-table-values { display: flex; flex-wrap: wrap; gap: 3px; min-width: 80px; }
.fmp-query-table-values > span { border-radius: 5px; background: color-mix(in srgb, var(--ink, var(--foreground)) 5%, transparent); padding: 2px 5px; color: var(--fmp-ink); overflow-wrap: anywhere; }
.fmp-query-table-values > .fmp-query-table-more { background: color-mix(in srgb, var(--chart-3) 12%, transparent); color: var(--fmp-gold); font-weight: 800; }
.fmp-query-table-empty { color: var(--fmp-muted); }
.fmp-query-table-count { color: var(--fmp-teal-dark); font-weight: 800; white-space: nowrap; }
.fmp-query-table-amount { color: var(--fmp-gold); font-weight: 800; font-variant-numeric: tabular-nums; white-space: pre-line; }
.fmp-query-table-cycle strong, .fmp-query-table-cycle small { display: block; }
.fmp-query-table-cycle strong { color: var(--fmp-teal-dark); font-size: 9px; white-space: nowrap; }
.fmp-query-table-cycle small { margin-top: 2px; color: var(--fmp-muted); font-size: 8px; white-space: nowrap; }
.fmp-query-table-toggle { appearance: none; border: 1px solid var(--fmp-line); border-radius: 7px; background: var(--fmp-card); color: var(--fmp-teal-dark); padding: 4px 7px; font: inherit; font-size: 8px; font-weight: 800; white-space: nowrap; cursor: pointer; }
.fmp-query-table-toggle:hover { border-color: color-mix(in srgb, var(--chart-3) 45%, var(--fmp-line)); color: var(--fmp-gold); }
.fmp-query-table-toggle:focus-visible { outline: 2px solid var(--fmp-teal); outline-offset: 2px; }
.fmp-query-table-detail > td { padding: 0; background: color-mix(in srgb, var(--muted) 14%, var(--fmp-paper)); }
.fmp-query-table-detail .fmp-query-occurrence-head { padding-top: 10px; }
.fmp-query-table-detail .fmp-query-occurrences { margin-bottom: 10px; }
@media (max-width: 1050px) {
  .fmp-layout { grid-template-columns: 1fr; }
  .fmp-preset-list { grid-template-columns: repeat(2, minmax(0,1fr)); }
  .fmp-stats { grid-template-columns: repeat(3, minmax(0,1fr)); }
}
@media (max-width: 900px) {
  .fmp-field.is-six { grid-column: 1 / -1; }
}
.fmp-preset-body .fmp-field.is-six { grid-column: 1 / -1; }
@media (max-width: 720px) {
  .fmp-page { padding-top: 22px; }
  .fmp-hero { grid-template-columns: 1fr; gap: 15px; align-items: start; }
  .fmp-hero-actions { align-items: flex-start; }
  .fmp-memory-badge { justify-self: start; }
  .fmp-stats { grid-template-columns: repeat(2, minmax(0,1fr)); }
  .fmp-preset-list { grid-template-columns: 1fr; }
  .fmp-field, .fmp-field.is-six, .fmp-field.is-eight { grid-column: 1 / -1; }
  .fmp-combine-field { align-items: stretch; }
  .fmp-combine-options { width: 100%; }
  .fmp-preset-expr-head .fmp-combine-options { width: 100%; }
  .fmp-preset-add-select { flex: 1 1 100%; }
  .fmp-preset-data-view-mode { width: 100%; }
  .fmp-preset-remove-group { margin-left: 0; }
  .fmp-help { grid-template-columns: 1fr; }
  .fmp-meta-row { grid-template-columns: 1fr; }
  .fmp-meta-row > .fmp-remove { justify-self: start; }
  .fmp-kv-head { display: none; }
  .fmp-kv-row { grid-template-columns: 1fr; }
  .fmp-kv-logic { width: 100%; }
  .fmp-match-statement, .fmp-match-content { grid-template-columns: 1fr; }
  .fmp-match-toggle { justify-self: start; }
  .fmp-account-picker { flex: 0 0 auto; width: max-content; }
  .fmp-date-fields { grid-template-columns: 1fr; }
  .fmp-panel-head-actions { width: 100%; justify-content: space-between; }
  .fmp-panel-tools .fmp-enable-toggle { flex: 0 0 auto; }
  .fmp-drag-hint { flex: 1 1 100%; margin-left: 0; white-space: normal; }
  .fmp-rule-head-actions { width: 100%; margin-left: 0; }
  .fmp-preview-row { grid-template-columns: 72px minmax(0,1fr); }
  .fmp-preview-row small { display: none; }
  .fmp-preview-section-head { padding: 15px; }
  .fmp-preview-tools { width: 100%; justify-content: space-between; }
  .fmp-preview-rule summary { grid-template-columns: 28px minmax(0,1fr) auto; }
  .fmp-preview-rule summary::after { display: none; }
  .fmp-preview-rule-tools { grid-column: 2 / -1; justify-self: start; }
  .fmp-query-preview-toggle { grid-template-columns: 34px minmax(0,1fr) auto; }
  .fmp-query-preview-toggle::after { display: none; }
  .fmp-query-preview-total { grid-column: 2 / -1; text-align: left; }
  .fmp-query-column-head { display: none; }
  .fmp-query-column { grid-template-columns: 32px minmax(0,1fr); align-items: start; }
  .fmp-query-column-field, .fmp-query-column-group, .fmp-query-column-actions { grid-column: 2; }
  .fmp-query-column-field > span { display: block; }
  .fmp-query-column-group { justify-self: start; }
  .fmp-query-column-actions { justify-content: flex-start; }
  .fmp-query-table-wrap { padding: 7px; }
  .fmp-query-group > summary { grid-template-columns: minmax(0,1fr) auto; }
  .fmp-query-frequency { border-left: 0; padding-left: 0; text-align: right; }
  .fmp-query-group-annual { grid-column: 1 / -1; border-top: 1px dashed var(--fmp-line); border-left: 0; padding: 7px 0 0; text-align: left; }
  .fmp-query-group-annual small { display: inline; margin-right: 7px; }
  .fmp-query-group-annual strong { display: inline; }
  .fmp-query-occurrence-toggle { grid-template-columns: 72px minmax(0,1fr) 14px; }
  .fmp-query-occurrence time { grid-column: 1; grid-row: 1; }
  .fmp-query-occurrence-copy { grid-column: 2; grid-row: 1; }
  .fmp-query-occurrence-amount { grid-column: 2; grid-row: 2; text-align: left; }
  .fmp-query-occurrence-chevron { grid-column: 3; grid-row: 1; }
  .fmp-diff-head, .fmp-diff-row { grid-template-columns: minmax(0,1fr) minmax(0,1fr); }
  .fmp-diff-record-head { flex-wrap: wrap; }
  .fmp-diff-head span:first-child { display: none; }
  .fmp-diff-field { grid-column: 1 / -1; border-bottom: 1px solid var(--fmp-line); background: var(--muted); }
}
@media (prefers-reduced-motion: reduce) {
  .fmp-stat, .fmp-rule { animation: none; }
}
@keyframes fmp-rise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
`;
export const STYLES = `${accountBrowserStyles}\n${GRID_STYLE}`;
