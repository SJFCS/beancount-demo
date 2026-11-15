export const STYLES = `
.pr-shell {
  --pr-ink: #182720;
  --pr-muted: #6d776f;
  --pr-faint: #929b94;
  --pr-paper: #f2efe5;
  --pr-card: #fffdf8;
  --pr-soft: #f7f4eb;
  --pr-line: #d9ddd2;
  --pr-line-strong: #c5cdc0;
  --pr-teal: #246957;
  --pr-teal-deep: #143f34;
  --pr-teal-soft: #e7f0e9;
  --pr-coral: #c4614b;
  --pr-coral-soft: #fae9e3;
  --pr-amber: #ab762e;
  --pr-amber-soft: #f8efdf;
  --pr-glass: rgba(255,253,248,.88);
  --pr-glass-soft: rgba(255,255,252,.7);
  --pr-soft-glass: rgba(247,244,235,.62);
  --pr-chart-bg: rgba(248,246,238,.66);
  --pr-grid: rgba(24,39,32,.085);
  --pr-baseline: rgba(24,39,32,.18);
  --pr-code: #52685b;
  --pr-error-ink: #943f30;
  --pr-warning-ink: #7b531f;
  --pr-coral-border: rgba(196,97,75,.3);
  --pr-amber-border: rgba(171,118,46,.3);
  --pr-note-bg: #143f34;
  min-height: 100%;
  color: var(--pr-ink);
  font-family: "Avenir Next", "PingFang SC", "Hiragino Sans GB", sans-serif;
  background:
    radial-gradient(circle at 88% 3%, rgba(196, 97, 75, .08), transparent 28rem),
    radial-gradient(circle at 5% 28%, rgba(36, 105, 87, .075), transparent 31rem);
}
.pr-shell * { box-sizing: border-box; }
.pr-shell button, .pr-shell input, .pr-shell select, .pr-shell textarea { font: inherit; color: inherit; }
.pr-page { width: min(1460px, 100%); margin: 0 auto; padding: 34px clamp(18px, 3.2vw, 48px) 72px; }
.pr-sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
.pr-hero { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 30px; align-items: end; margin-bottom: 26px; }
.pr-eyebrow { display: inline-flex; align-items: center; gap: 10px; color: var(--pr-teal); font-size: 10px; font-weight: 800; letter-spacing: .2em; }
.pr-eyebrow i { width: 18px; height: 1px; background: currentColor; }
.pr-hero h1 { margin: 9px 0 12px; font-family: "Iowan Old Style", "Songti SC", "STSong", serif; font-size: clamp(48px, 7vw, 92px); font-weight: 600; line-height: .9; letter-spacing: -.065em; }
.pr-hero h1 span { display: inline-block; margin: 0 .08em; color: var(--pr-coral); font-weight: 400; transform: rotate(-5deg); }
.pr-hero-copy > p { max-width: 790px; margin: 0; color: var(--pr-muted); font-size: 15px; line-height: 1.8; }
.pr-hero-tags { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 17px; }
.pr-hero-tags span { border: 1px solid var(--pr-line); border-radius: 999px; background: var(--pr-glass); padding: 5px 10px; color: var(--pr-muted); font-size: 10px; font-weight: 700; }
.pr-hero-actions { display: flex; flex-direction: column; align-items: flex-end; gap: 11px; }
.pr-save-state { display: inline-flex; align-items: center; gap: 8px; color: var(--pr-muted); font-size: 11px; font-weight: 750; white-space: nowrap; }
.pr-save-state i { width: 7px; height: 7px; border-radius: 50%; background: var(--pr-teal); }
.pr-save-state[data-dirty="true"] { color: var(--pr-amber); }
.pr-save-state[data-dirty="true"] i { background: var(--pr-amber); box-shadow: 0 0 0 5px rgba(171,118,46,.1); }
.pr-action-row { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 7px; }
.pr-generation-control { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 14px 22px; margin-bottom: 14px; border: 1px solid var(--pr-line); border-radius: 15px; background: var(--pr-glass); padding: 13px 16px; box-shadow: 0 8px 22px rgba(37,50,42,.03); }
.pr-generation-copy { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.pr-generation-copy strong { font-family: "Iowan Old Style", "Songti SC", serif; font-size: 18px; font-weight: 600; }
.pr-generation-copy small { color: var(--pr-muted); font-size: 10px; line-height: 1.55; }
.pr-generation-copy code { color: var(--pr-teal-deep); font: 9px/1.45 "SFMono-Regular", "Cascadia Code", monospace; }
.pr-mode-options { display: inline-flex; flex-wrap: wrap; gap: 4px; border: 1px solid var(--pr-line-strong); border-radius: 11px; background: var(--pr-soft); padding: 3px; }
.pr-mode-options button { appearance: none; min-height: 32px; border: 0; border-radius: 8px; background: transparent; padding: 0 12px; color: var(--pr-muted); font-size: 10px; font-weight: 800; cursor: pointer; transition: background .16s, color .16s, box-shadow .16s; }
.pr-mode-options button:hover:not(:disabled) { color: var(--pr-ink); }
.pr-mode-options button[aria-pressed="true"] { background: var(--pr-card); color: var(--pr-teal-deep); box-shadow: 0 1px 4px rgba(30,43,35,.13); }
.pr-mode-options button:disabled { cursor: not-allowed; opacity: .5; }
.pr-mode-options button:focus-visible { outline: 3px solid rgba(36,105,87,.18); outline-offset: 1px; }
.pr-btn { appearance: none; display: inline-flex; align-items: center; justify-content: center; gap: 7px; min-height: 39px; border: 1px solid var(--pr-line-strong); border-radius: 10px; background: var(--pr-card); padding: 0 14px; color: var(--pr-ink); font-size: 12px; font-weight: 750; cursor: pointer; transition: transform .16s, background .16s, border-color .16s, box-shadow .16s; }
.pr-btn svg, .pr-message svg, .pr-sync-card svg { flex: 0 0 auto; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.pr-btn:hover:not(:disabled) { transform: translateY(-1px); border-color: var(--pr-line-strong); box-shadow: 0 7px 18px rgba(28,43,35,.07); }
.pr-btn:focus-visible, .pr-currency-select select:focus-visible { outline: 3px solid rgba(36,105,87,.18); outline-offset: 2px; }
.pr-btn:disabled { opacity: .43; cursor: not-allowed; }
.pr-btn.is-ghost { background: transparent; }
.pr-message { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 14px; border: 1px solid var(--pr-line); border-radius: 13px; background: var(--pr-card); padding: 11px 14px; color: var(--pr-muted); font-size: 12px; line-height: 1.65; }
.pr-message strong { display: block; margin-bottom: 2px; color: currentColor; font-size: 12px; }
.pr-message p { margin: 0; }
.pr-message small { display: block; margin-top: 4px; opacity: .75; }
.pr-message.is-error { border-color: var(--pr-coral-border); background: var(--pr-coral-soft); color: var(--pr-error-ink); }
.pr-message.is-warning { border-color: var(--pr-amber-border); background: var(--pr-amber-soft); color: var(--pr-warning-ink); }
.pr-message.is-ok { border-color: rgba(36,105,87,.25); background: var(--pr-teal-soft); color: var(--pr-teal-deep); }
.pr-message.is-loading { min-height: 120px; align-items: center; justify-content: center; }
.pr-stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 11px; margin-bottom: 17px; }
.pr-stat { min-height: 124px; border: 1px solid var(--pr-line); border-radius: 17px; background: var(--pr-glass); padding: 16px 17px 14px; box-shadow: 0 10px 28px rgba(36,49,41,.035); animation: pr-rise .45s both; }
.pr-stat:nth-child(2) { animation-delay: .04s; }
.pr-stat:nth-child(3) { animation-delay: .08s; }
.pr-stat:nth-child(4) { animation-delay: .12s; }
.pr-stat > span { color: var(--pr-muted); font-size: 9px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }
.pr-stat strong { display: block; margin: 15px 0 8px; font-family: "Iowan Old Style", "Songti SC", serif; font-size: clamp(22px, 2.2vw, 32px); font-weight: 600; line-height: 1; letter-spacing: -.035em; overflow-wrap: anywhere; }
.pr-stat small { color: var(--pr-muted); font-size: 10px; line-height: 1.45; }
.pr-stat[data-tone="teal"] { border-top: 3px solid var(--pr-teal); }
.pr-stat[data-tone="amber"] { border-top: 3px solid var(--pr-amber); }
.pr-stat[data-tone="ruby"] { border-top: 3px solid var(--pr-coral); }
.pr-stat[data-tone="ink"] { border-top: 3px solid var(--pr-ink); }
.pr-panel { min-width: 0; border: 1px solid var(--pr-line); border-radius: 19px; background: var(--pr-glass); box-shadow: 0 12px 34px rgba(37,50,42,.035); }
.pr-panel-head { display: flex; flex-wrap: wrap; align-items: flex-start; justify-content: space-between; gap: 16px; padding: 18px 20px 15px; border-bottom: 1px solid var(--pr-line); }
.pr-panel-head > div:first-child { flex: 1 1 340px; min-width: 0; }
.pr-panel-eyebrow { color: var(--pr-teal); font-size: 9px; font-weight: 850; letter-spacing: .16em; text-transform: uppercase; }
.pr-panel-head h2 { margin: 4px 0 5px; font-family: "Iowan Old Style", "Songti SC", serif; font-size: 24px; font-weight: 600; letter-spacing: -.025em; }
.pr-panel-head p { max-width: 850px; margin: 0; color: var(--pr-muted); font-size: 11px; line-height: 1.65; }
.pr-panel-actions { display: flex; flex: 0 0 auto; align-items: center; gap: 8px; }
.pr-chart-panel { margin-bottom: 17px; animation: pr-rise .5s .06s both; }
.pr-currency-select { display: inline-flex; align-items: center; gap: 8px; color: var(--pr-muted); font-size: 10px; font-weight: 700; }
.pr-currency-select select { height: 34px; border: 1px solid var(--pr-line-strong); border-radius: 9px; background: var(--pr-card); padding: 0 28px 0 10px; color: var(--pr-ink); font-size: 11px; font-weight: 700; }
.pr-unit-chip, .pr-table-count { display: inline-flex; align-items: center; min-height: 31px; border: 1px solid var(--pr-line); border-radius: 999px; background: var(--pr-soft); padding: 0 10px; color: var(--pr-muted); font-size: 10px; font-weight: 750; white-space: nowrap; }
.pr-chart-content { padding: 14px 18px 18px; transition: opacity .18s; }
.pr-chart-content.is-updating { opacity: .38; }
.pr-chart-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 7px 18px; margin-bottom: 12px; color: var(--pr-muted); font-size: 10px; }
.pr-chart-meta b { color: var(--pr-ink); font-weight: 750; }
.pr-chart-block { overflow: hidden; border: 1px solid var(--pr-line); border-radius: 14px; background: var(--pr-chart-bg); }
.pr-chart-block + .pr-chart-block { margin-top: 10px; }
.pr-chart-caption { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; padding: 10px 13px 0; }
.pr-chart-caption > span { font-family: "Iowan Old Style", "Songti SC", serif; font-size: 15px; font-weight: 600; }
.pr-chart-caption small { color: var(--pr-muted); font-size: 9px; }
.pr-chart-svg { display: block; width: 100%; height: auto; overflow: visible; }
.pr-chart-grid { stroke: var(--pr-grid); stroke-width: 1; stroke-dasharray: 3 5; }
.pr-chart-baseline { stroke: var(--pr-baseline); stroke-width: 1; }
.pr-chart-axis { fill: var(--pr-muted); font: 9px "Avenir Next", "PingFang SC", sans-serif; }
.pr-chart-axis.is-x { font-size: 8px; letter-spacing: -.01em; }
.pr-chart-line { fill: none; stroke: var(--pr-teal); stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; }
.pr-chart-line + circle, .pr-chart-svg circle { fill: var(--pr-card); stroke: var(--pr-teal); stroke-width: 2; }
.pr-chart-empty { display: grid; place-items: center; gap: 8px; min-height: 280px; padding: 35px; text-align: center; color: var(--pr-muted); }
.pr-chart-empty svg { color: var(--pr-teal); opacity: .55; }
.pr-chart-empty strong { color: var(--pr-ink); font-family: "Iowan Old Style", "Songti SC", serif; font-size: 19px; }
.pr-chart-empty p { margin: 0; font-size: 11px; }
.pr-main-grid { display: grid; grid-template-columns: minmax(0, 1.8fr) minmax(285px, .72fr); gap: 17px; align-items: start; }
.pr-rules-panel { animation: pr-rise .5s .1s both; }
.pr-rule-groups { display: grid; gap: 17px; padding: 12px; }
.pr-rule-group { display: grid; gap: 8px; min-width: 0; }
.pr-rule-group-head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; padding: 1px 2px; }
.pr-rule-group-head strong { font-family: "Iowan Old Style", "Songti SC", serif; font-size: 16px; font-weight: 600; }
.pr-rule-group-head span { color: var(--pr-muted); font-size: 9px; font-weight: 750; white-space: nowrap; }
.pr-rule-group-empty { margin: 0; border: 1px dashed var(--pr-line); border-radius: 11px; padding: 13px; color: var(--pr-faint); font-size: 10px; text-align: center; }
.pr-rule-list { display: grid; gap: 11px; }
.pr-rule { overflow: hidden; border: 1px solid var(--pr-line); border-radius: 15px; background: var(--pr-glass-soft); transition: border-color .17s, opacity .17s; }
.pr-rule:hover { border-color: var(--pr-line-strong); }
.pr-rule.is-expanded { border-color: rgba(36,105,87,.42); background: var(--pr-card); box-shadow: 0 10px 26px rgba(34,54,43,.045); }
.pr-rule.is-disabled { background: var(--pr-soft-glass); }
.pr-rule-head { display: flex; align-items: center; gap: 8px; padding: 11px 12px 11px 14px; }
.pr-rule-main { appearance: none; display: flex; flex: 1 1 auto; align-items: center; gap: 11px; min-width: 0; border: 0; background: transparent; padding: 2px 0; color: inherit; text-align: left; cursor: pointer; }
.pr-rule-main:hover { color: var(--pr-teal-deep); }
.pr-rule-main:focus-visible { outline: 3px solid rgba(36,105,87,.18); outline-offset: 2px; border-radius: 8px; }
.pr-rule.is-expanded .pr-rule-head { border-bottom: 1px solid var(--pr-line); }
.pr-rule-number { display: grid; place-items: center; flex: 0 0 30px; width: 30px; height: 30px; border-radius: 8px; background: var(--pr-ink); color: var(--pr-paper); font-family: "Iowan Old Style", serif; font-size: 13px; }
.pr-rule.is-disabled .pr-rule-number { background: var(--pr-faint); }
.pr-rule-title { flex: 1 1 190px; min-width: 0; }
.pr-rule-title strong { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-family: "Iowan Old Style", "Songti SC", serif; font-size: 18px; font-weight: 600; }
.pr-rule-title small { display: block; margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--pr-muted); font-size: 10px; }
.pr-rule.is-disabled .pr-rule-title strong { color: var(--pr-muted); }
.pr-rule-chevron { display: grid; place-items: center; flex: 0 0 24px; width: 24px; height: 24px; border-radius: 50%; background: var(--pr-soft); color: var(--pr-muted); transition: transform .16s, background .16s, color .16s; }
.pr-rule-chevron.is-open { transform: rotate(180deg); background: var(--pr-teal-soft); color: var(--pr-teal); }
.pr-status { display: inline-flex; align-items: center; border-radius: 999px; padding: 5px 8px; font-size: 9px; font-weight: 800; white-space: nowrap; }
.pr-status.is-ready { background: var(--pr-teal-soft); color: var(--pr-teal-deep); }
.pr-status.is-disabled { background: var(--pr-line); color: var(--pr-muted); }
.pr-rule-switch { position: relative; display: inline-flex; flex: 0 0 auto; align-items: center; gap: 6px; border-radius: 999px; padding: 4px 6px 4px 4px; color: var(--pr-muted); cursor: pointer; user-select: none; transition: background .16s, opacity .16s; }
.pr-rule-switch:hover { background: var(--pr-soft); }
.pr-rule-switch input { position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none; }
.pr-rule-switch-track { position: relative; width: 34px; height: 20px; border-radius: 999px; background: var(--pr-line-strong); box-shadow: inset 0 1px 2px rgba(20,35,28,.12); transition: background .16s; }
.pr-rule-switch-track::after { position: absolute; top: 3px; left: 3px; width: 14px; height: 14px; border-radius: 50%; background: var(--pr-card); box-shadow: 0 1px 3px rgba(20,35,28,.2); content: ""; transition: transform .16s; }
.pr-rule-switch.is-on { color: var(--pr-teal); }
.pr-rule-switch.is-on .pr-rule-switch-track { background: var(--pr-teal); }
.pr-rule-switch.is-on .pr-rule-switch-track::after { transform: translateX(14px); }
.pr-rule-switch input:focus-visible + .pr-rule-switch-track { outline: 3px solid rgba(36,105,87,.2); outline-offset: 2px; }
.pr-rule-switch:has(input:disabled) { cursor: not-allowed; opacity: .45; }
.pr-rule-switch-copy { min-width: 20px; font-size: 9px; font-weight: 800; }
.pr-rule-body { padding: 13px 14px 14px; }
.pr-side { display: grid; gap: 12px; min-width: 0; animation: pr-rise .5s .14s both; }
.pr-output-body { display: grid; gap: 10px; padding: 13px; }
.pr-output-file { border: 1px solid var(--pr-line); border-radius: 11px; background: var(--pr-soft); padding: 10px 11px; }
.pr-output-file > span { display: block; color: var(--pr-muted); font-size: 9px; font-weight: 750; }
.pr-output-file code { display: block; margin: 5px 0 7px; overflow: hidden; text-overflow: ellipsis; color: var(--pr-teal-deep); font: 11px "SFMono-Regular", "Cascadia Code", monospace; white-space: nowrap; }
.pr-output-state { display: flex; align-items: center; gap: 6px; color: var(--pr-muted); font-size: 9px; }
.pr-state-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--pr-faint); }
.pr-state-dot.is-on { background: var(--pr-teal); box-shadow: 0 0 0 3px rgba(36,105,87,.1); }
.pr-sync-card { display: flex; align-items: flex-start; gap: 9px; border: 1px solid var(--pr-amber-border); border-radius: 11px; background: var(--pr-amber-soft); padding: 11px; color: var(--pr-warning-ink); }
.pr-sync-card.in-sync { border-color: rgba(36,105,87,.24); background: var(--pr-teal-soft); color: var(--pr-teal-deep); }
.pr-sync-card strong { display: block; font-size: 11px; }
.pr-sync-card p { margin: 3px 0 0; font-size: 9px; line-height: 1.55; }
.pr-output-facts { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; margin: 0; }
.pr-output-facts > div { border: 1px solid var(--pr-line); border-radius: 9px; padding: 8px; text-align: center; }
.pr-output-facts dt { color: var(--pr-muted); font-size: 8px; }
.pr-output-facts dd { margin: 4px 0 0; font-family: "Iowan Old Style", serif; font-size: 16px; }
.pr-note-card { border-radius: 17px; background: var(--pr-note-bg); padding: 20px; color: #f8f5eb; }
.pr-note-card > span { color: rgba(255,255,255,.54); font-size: 9px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }
.pr-note-card h3 { margin: 12px 0 8px; font-family: "Iowan Old Style", "Songti SC", serif; font-size: 20px; font-weight: 500; line-height: 1.15; }
.pr-note-card p { margin: 0; color: rgba(255,255,255,.65); font-size: 10px; line-height: 1.7; }
.pr-schedule-panel { margin-top: 17px; animation: pr-rise .5s .18s both; }
.pr-table-scroll { overflow: auto; margin: 12px; border: 1px solid var(--pr-line); border-radius: 12px; background: var(--pr-card); }
.pr-schedule-panel table { width: 100%; min-width: 1040px; border-collapse: collapse; font-size: 11px; }
.pr-schedule-panel th { position: sticky; top: 0; z-index: 1; border-bottom: 1px solid var(--pr-line); background: var(--pr-soft); padding: 10px 11px; color: var(--pr-muted); font-size: 8px; font-weight: 850; letter-spacing: .09em; text-align: left; text-transform: uppercase; white-space: nowrap; }
.pr-schedule-panel td { border-bottom: 1px solid var(--pr-line); padding: 9px 11px; vertical-align: middle; }
.pr-schedule-panel tbody tr:last-child td { border-bottom: 0; }
.pr-schedule-panel tbody tr:hover { background: rgba(36,105,87,.025); }
.pr-schedule-panel th.is-number, .pr-schedule-panel td.is-number { text-align: right; }
.pr-schedule-panel td.is-strong { color: var(--pr-coral); font-weight: 750; }
.pr-schedule-panel code { color: var(--pr-code); font: 9px/1.45 "SFMono-Regular", "Cascadia Code", monospace; overflow-wrap: anywhere; }
.pr-date { display: inline-flex; align-items: center; gap: 6px; font-variant-numeric: tabular-nums; white-space: nowrap; }
.pr-date i { border-radius: 999px; background: var(--pr-amber-soft); padding: 2px 5px; color: var(--pr-amber); font-size: 7px; font-style: normal; font-weight: 800; }
.pr-date i.is-pending { background: var(--pr-coral-soft); color: var(--pr-coral); }
.pr-rule-cell { display: flex; flex-direction: column; gap: 2px; }
.pr-rule-cell b { font-weight: 700; }
.pr-rule-cell small { width: fit-content; border-radius: 999px; background: var(--pr-teal-soft); padding: 1px 5px; color: var(--pr-teal); font-size: 7px; font-weight: 750; }
.pr-rule-cell small[data-kind="depreciation"] { background: var(--pr-coral-soft); color: var(--pr-coral); }
.pr-load-more { display: flex; align-items: center; justify-content: center; gap: 12px; padding: 0 12px 13px; }
.pr-load-more span { color: var(--pr-muted); font-size: 9px; }
.pr-empty { display: grid; place-items: center; gap: 8px; padding: 40px 22px; text-align: center; }
.pr-empty-mark { display: grid; place-items: center; width: 58px; height: 58px; border: 1px solid var(--pr-line); border-radius: 50%; background: var(--pr-soft); color: var(--pr-teal); font-family: "Iowan Old Style", serif; font-size: 16px; }
.pr-empty h3 { margin: 2px 0 0; font-family: "Iowan Old Style", "Songti SC", serif; font-size: 20px; font-weight: 600; }
.pr-empty p { max-width: 540px; margin: 0 0 5px; color: var(--pr-muted); font-size: 11px; line-height: 1.65; }
.pr-empty-compact { display: flex; justify-content: center; padding: 25px; color: var(--pr-muted); }
.pr-empty-compact p { margin: 0; }
.pr-guide { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; margin-top: 17px; }
.pr-guide article { position: relative; overflow: hidden; min-height: 144px; border: 1px solid var(--pr-line); border-radius: 15px; background: var(--pr-glass); padding: 17px; }
.pr-guide article > b { position: absolute; top: 10px; right: 13px; color: rgba(36,105,87,.14); font-family: "Iowan Old Style", serif; font-size: 41px; font-weight: 400; line-height: 1; }
.pr-guide h3 { position: relative; margin: 15px 0 7px; font-family: "Iowan Old Style", "Songti SC", serif; font-size: 17px; font-weight: 600; }
.pr-guide p { position: relative; max-width: 320px; margin: 0; color: var(--pr-muted); font-size: 10px; line-height: 1.65; }
.pr-rule-facts { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.pr-rule-fact { display: flex; flex-direction: column; gap: 4px; min-width: 0; border: 1px solid var(--pr-line); border-radius: 10px; background: var(--pr-soft-glass); padding: 9px 10px; }
.pr-rule-fact.is-wide { grid-column: 1 / -1; }
.pr-rule-fact > span { display: flex; align-items: center; gap: 6px; color: var(--pr-muted); font-size: 8px; font-weight: 850; letter-spacing: .08em; text-transform: uppercase; }
.pr-rule-fact > strong { font-family: "Iowan Old Style", "Songti SC", serif; font-size: 17px; font-weight: 600; line-height: 1.15; }
.pr-rule-fact > code { overflow-wrap: anywhere; color: var(--pr-teal-deep); font: 10px/1.45 "SFMono-Regular", "Cascadia Code", monospace; }
.pr-rule-fact > small { color: var(--pr-muted); font-size: 9px; line-height: 1.45; }
.pr-tag { border-radius: 999px; background: var(--pr-teal-soft); padding: 1px 5px; color: var(--pr-teal); font-size: 7px; font-weight: 800; letter-spacing: 0; text-transform: none; }
.pr-rule-warnings { display: flex; align-items: flex-start; gap: 7px; margin-bottom: 10px; border-radius: 9px; background: var(--pr-amber-soft); padding: 8px 10px; color: var(--pr-warning-ink); font-size: 10px; line-height: 1.55; }
.pr-rule-warnings svg { flex: 0 0 auto; margin-top: 1px; }
.pr-rule-disabled-note { display: flex; align-items: flex-start; gap: 7px; margin-bottom: 10px; border-radius: 9px; background: var(--pr-line); padding: 8px 10px; color: var(--pr-muted); font-size: 10px; line-height: 1.55; }
.pr-rule-disabled-note svg { flex: 0 0 auto; margin-top: 1px; }
.pr-issue-list { display: grid; gap: 7px; }
.pr-issue { display: grid; gap: 3px; border: 1px solid var(--pr-coral-border); border-radius: 9px; background: var(--pr-coral-soft); padding: 9px 10px; color: var(--pr-error-ink); font-size: 10px; line-height: 1.5; }
.pr-issue strong { font-size: 10px; }
.pr-issue span { color: var(--pr-error-ink); }
.pr-issue code { overflow-wrap: anywhere; color: var(--pr-error-ink); font: 9px/1.45 "SFMono-Regular", "Cascadia Code", monospace; }
@keyframes pr-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
@media (max-width: 1050px) {
  .pr-main-grid { grid-template-columns: minmax(0, 1fr); }
  .pr-side { grid-template-columns: minmax(0, 1fr) minmax(260px, .72fr); }
}
@media (max-width: 820px) {
  .pr-page { padding-top: 24px; }
  .pr-hero { grid-template-columns: minmax(0, 1fr); align-items: start; }
  .pr-hero-actions { align-items: flex-start; }
  .pr-action-row { justify-content: flex-start; }
  .pr-generation-control { align-items: flex-start; }
  .pr-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .pr-side { grid-template-columns: minmax(0, 1fr); }
  .pr-rule-facts { grid-template-columns: minmax(0, 1fr); }
  .pr-rule-fact.is-wide { grid-column: auto; }
  .pr-guide { grid-template-columns: minmax(0, 1fr); }
}
@media (max-width: 560px) {
  .pr-page { padding-inline: 13px; }
  .pr-hero h1 { font-size: 52px; }
  .pr-action-row { width: 100%; }
  .pr-action-row .pr-btn { flex: 1 1 auto; }
  .pr-mode-options { display: grid; width: 100%; grid-template-columns: minmax(0, 1fr); }
  .pr-mode-options button { width: 100%; }
  .pr-stats { grid-template-columns: minmax(0, 1fr); }
  .pr-stat { min-height: 112px; }
  .pr-panel-head { padding: 15px 14px 13px; }
  .pr-panel-actions { width: 100%; }
  .pr-panel-actions .pr-btn { width: 100%; }
  .pr-rule-head { gap: 8px; }
  .pr-rule-title { flex-basis: 150px; }
  .pr-status { display: none; }
  .pr-rule-switch { padding-right: 4px; }
  .pr-rule-switch-copy { display: none; }
  .pr-chart-content { padding: 10px 8px 12px; }
  .pr-chart-caption { padding-inline: 8px; }
  .pr-chart-caption small { display: none; }
  .pr-chart-meta { gap: 6px 12px; }
  .pr-output-facts { grid-template-columns: minmax(0, 1fr); }
  .pr-load-more { flex-direction: column; }
}
@media (prefers-reduced-motion: reduce) {
  .pr-stat, .pr-chart-panel, .pr-rules-panel, .pr-side, .pr-schedule-panel { animation: none; }
  .pr-btn, .pr-rule-chevron, .pr-mode-options button { transition: none; }
}
html.dark .pr-shell {
  --pr-ink: #e9e7dc;
  --pr-muted: #a7aa9f;
  --pr-faint: #83877d;
  --pr-paper: #20251f;
  --pr-card: #222620;
  --pr-soft: #292d26;
  --pr-line: #3a3f37;
  --pr-line-strong: #4b5147;
  --pr-teal: #6fc7b6;
  --pr-teal-deep: #9fd8ca;
  --pr-teal-soft: #22332d;
  --pr-coral: #e0846d;
  --pr-coral-soft: #33241f;
  --pr-amber: #d9a35a;
  --pr-amber-soft: #2e281c;
  --pr-glass: rgba(34,38,32,.92);
  --pr-glass-soft: rgba(34,38,32,.78);
  --pr-soft-glass: rgba(41,45,38,.62);
  --pr-chart-bg: rgba(39,44,36,.72);
  --pr-grid: rgba(233,231,220,.09);
  --pr-baseline: rgba(233,231,220,.2);
  --pr-code: #9fc1ae;
  --pr-error-ink: #ef9a85;
  --pr-warning-ink: #d8ac6b;
  --pr-coral-border: rgba(224,132,109,.4);
  --pr-amber-border: rgba(217,163,90,.4);
  --pr-note-bg: #1a4a3e;
}
@media (prefers-color-scheme: dark) {
  html:not(.light) .pr-shell {
    --pr-ink: #e9e7dc;
    --pr-muted: #a7aa9f;
    --pr-faint: #83877d;
    --pr-paper: #20251f;
    --pr-card: #222620;
    --pr-soft: #292d26;
    --pr-line: #3a3f37;
    --pr-line-strong: #4b5147;
    --pr-teal: #6fc7b6;
    --pr-teal-deep: #9fd8ca;
    --pr-teal-soft: #22332d;
    --pr-coral: #e0846d;
    --pr-coral-soft: #33241f;
    --pr-amber: #d9a35a;
    --pr-amber-soft: #2e281c;
    --pr-glass: rgba(34,38,32,.92);
    --pr-glass-soft: rgba(34,38,32,.78);
    --pr-soft-glass: rgba(41,45,38,.62);
    --pr-chart-bg: rgba(39,44,36,.72);
    --pr-grid: rgba(233,231,220,.09);
    --pr-baseline: rgba(233,231,220,.2);
    --pr-code: #9fc1ae;
    --pr-error-ink: #ef9a85;
    --pr-warning-ink: #d8ac6b;
    --pr-coral-border: rgba(224,132,109,.4);
    --pr-amber-border: rgba(217,163,90,.4);
    --pr-note-bg: #1a4a3e;
  }
}
html.dark .pr-schedule-panel tbody tr:hover { background: rgba(111,199,182,.08); }
`;
