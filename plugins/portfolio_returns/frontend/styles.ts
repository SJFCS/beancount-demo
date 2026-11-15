export const STYLES = `
.pf-shell {
  --pf-ink: #19221d;
  --pf-muted: #6a746d;
  --pf-faint: #97a099;
  --pf-paper: #f4f1e9;
  --pf-card: #fffdf8;
  --pf-soft: #f7f4ec;
  --pf-line: #dce0d7;
  --pf-line-strong: #c7cec4;
  --pf-teal: #1f6f5c;
  --pf-teal-deep: #123f34;
  --pf-teal-soft: #e8f1eb;
  --pf-green: #2e7d4f;
  --pf-red: #b44a3d;
  --pf-green-soft: #e8f4ec;
  --pf-red-soft: #faeae6;
  --pf-amber: #a8712a;
  --pf-amber-soft: #f8eedc;
  --pf-surface: rgba(255,253,248,.9);
  --pf-surface-chart: rgba(249,247,240,.58);
  --pf-surface-table: #fffefb;
  --pf-surface-table-head: #f6f4ed;
  --pf-surface-code: #f7f4ec;
  --pf-code: #3c5145;
  --pf-on-accent: #fffdf8;
  --pf-row-hover: rgba(31,111,92,.025);
  --pf-grid-line: rgba(24,39,32,.085);
  --pf-grid-line-strong: rgba(24,39,32,.19);
  --pf-cursor-line: rgba(18,63,52,.42);
  --pf-chart-1: #d97706;
  --pf-chart-2: #0f766e;
  --pf-chart-3: #2563eb;
  --pf-chart-4: #be123c;
  --pf-chart-5: #7c3aed;
  --pf-chart-6: #0891b2;
  --pf-chart-7: #65a30d;
  --pf-chart-8: #c2410c;
  --pf-chart-9: #4f46e5;
  --pf-chart-10: #db2777;
  min-height: 100%;
  color: var(--pf-ink);
  font-family: "Avenir Next", "PingFang SC", "Hiragino Sans GB", sans-serif;
  background:
    radial-gradient(circle at 91% 1%, rgba(31,111,92,.08), transparent 29rem),
    radial-gradient(circle at 3% 34%, rgba(168,113,42,.055), transparent 28rem);
}
.pf-shell * { box-sizing: border-box; }
.pf-shell button, .pf-shell input, .pf-shell select, .pf-shell textarea { font: inherit; color: inherit; }
.pf-page { width: min(1480px, 100%); margin: 0 auto; padding: 32px clamp(16px, 3vw, 46px) 72px; }
.pf-hero { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 28px; align-items: end; margin-bottom: 23px; }
.pf-eyebrow { display: inline-flex; align-items: center; gap: 9px; color: var(--pf-teal); font-size: 9px; font-weight: 850; letter-spacing: .19em; }
.pf-eyebrow i { width: 19px; height: 1px; background: currentColor; }
.pf-hero h1 { margin: 8px 0 11px; font-family: "Iowan Old Style", "Songti SC", "STSong", serif; font-size: clamp(47px, 6.8vw, 88px); font-weight: 600; line-height: .91; letter-spacing: -.065em; }
.pf-hero h1 span { display: inline-block; margin: 0 .07em; color: var(--pf-red); font-weight: 400; transform: rotate(-5deg); }
.pf-hero p { max-width: 820px; margin: 0; color: var(--pf-muted); font-size: 14px; line-height: 1.75; }
.pf-hero-actions { display: flex; flex-direction: column; align-items: flex-end; gap: 10px; }
.pf-sync { display: inline-flex; align-items: center; gap: 7px; color: var(--pf-muted); font-size: 10px; font-weight: 750; }
.pf-sync i { width: 7px; height: 7px; border-radius: 50%; background: var(--pf-teal); }
.pf-sync[data-busy="true"] i { background: var(--pf-amber); box-shadow: 0 0 0 5px rgba(168,113,42,.1); }
.pf-actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 7px; }
.pf-btn { appearance: none; display: inline-flex; align-items: center; justify-content: center; gap: 7px; min-height: 38px; border: 1px solid var(--pf-line-strong); border-radius: 10px; background: var(--pf-card); padding: 0 14px; color: var(--pf-ink); font-size: 11px; font-weight: 800; cursor: pointer; transition: transform .16s, background .16s, border-color .16s, box-shadow .16s; }
.pf-btn:hover:not(:disabled) { transform: translateY(-1px); border-color: #aab6ab; box-shadow: 0 7px 18px rgba(28,43,35,.07); }
.pf-btn:focus-visible { outline: 3px solid rgba(31,111,92,.18); outline-offset: 2px; }
.pf-btn:disabled { opacity: .43; cursor: not-allowed; }
.pf-btn.primary { border-color: var(--pf-teal); background: var(--pf-teal); color: var(--pf-on-accent); }
.pf-btn.ghost { background: transparent; }
.pf-btn.small { min-height: 31px; padding: 0 10px; font-size: 10px; }
.pf-btn.danger { border-color: rgba(180,74,61,.3); color: var(--pf-red); }
.pf-message { display: flex; align-items: flex-start; gap: 9px; margin-bottom: 13px; border: 1px solid var(--pf-line); border-radius: 12px; background: var(--pf-card); padding: 11px 13px; color: var(--pf-muted); font-size: 11px; line-height: 1.6; }
.pf-message.error { border-color: rgba(180,74,61,.28); background: var(--pf-red-soft); color: var(--pf-red); }
.pf-message.notice { border-color: rgba(31,111,92,.24); background: var(--pf-teal-soft); color: var(--pf-teal-deep); }
.pf-tabs { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 14px; border: 1px solid var(--pf-line); border-radius: 13px; background: var(--pf-surface); padding: 4px; }
.pf-tab { appearance: none; display: inline-flex; align-items: center; gap: 7px; min-height: 34px; border: 0; border-radius: 9px; background: transparent; padding: 0 13px; color: var(--pf-muted); font-size: 11px; font-weight: 800; cursor: pointer; }
.pf-tab:hover { color: var(--pf-ink); background: var(--pf-soft); }
.pf-tab[aria-selected="true"] { background: var(--pf-card); color: var(--pf-teal-deep); box-shadow: 0 1px 4px rgba(30,43,35,.13); }
.pf-tab-badge { display: inline-grid; place-items: center; min-width: 17px; height: 17px; border-radius: 999px; background: var(--pf-red-soft); padding: 0 5px; color: var(--pf-red); font-size: 8px; }
.pf-toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 13px; margin-bottom: 14px; border: 1px solid var(--pf-line); border-radius: 14px; background: var(--pf-surface); padding: 10px 12px; box-shadow: 0 8px 24px rgba(37,50,42,.025); }
.pf-field { display: inline-flex; align-items: center; gap: 6px; color: var(--pf-muted); font-size: 9px; font-weight: 800; }
.pf-field select, .pf-field input { height: 32px; border: 1px solid var(--pf-line-strong); border-radius: 8px; background: var(--pf-card); padding: 0 9px; color: var(--pf-ink); font-size: 10px; font-weight: 700; }
.pf-field input:focus, .pf-field select:focus { outline: 3px solid rgba(31,111,92,.15); outline-offset: 1px; }
.pf-selection { position: relative; margin-left: auto; }
.pf-selection summary { list-style: none; display: inline-flex; align-items: center; gap: 6px; min-height: 32px; border: 1px solid var(--pf-line-strong); border-radius: 8px; background: var(--pf-card); padding: 0 10px; color: var(--pf-ink); font-size: 10px; font-weight: 750; cursor: pointer; }
.pf-selection summary::-webkit-details-marker { display: none; }
.pf-selection[open] summary { border-color: var(--pf-teal); }
.pf-selection-menu { position: absolute; z-index: 20; top: calc(100% + 6px); right: 0; width: min(360px, 80vw); max-height: 360px; overflow: auto; border: 1px solid var(--pf-line-strong); border-radius: 12px; background: var(--pf-card); padding: 7px; box-shadow: 0 18px 50px rgba(24,37,29,.16); }
.pf-check { display: flex; align-items: center; gap: 8px; border-radius: 7px; padding: 7px 8px; color: var(--pf-ink); font-size: 10px; cursor: pointer; }
.pf-check:hover { background: var(--pf-soft); }
.pf-check input { accent-color: var(--pf-teal); }
.pf-check small { margin-left: auto; color: var(--pf-muted); font-size: 8px; }
.pf-kpis { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 10px; margin-bottom: 14px; }
.pf-kpi { min-height: 112px; border: 1px solid var(--pf-line); border-radius: 15px; background: var(--pf-surface); padding: 14px 15px 12px; box-shadow: 0 10px 25px rgba(36,49,41,.03); }
.pf-kpi > span { color: var(--pf-muted); font-size: 8px; font-weight: 850; letter-spacing: .11em; text-transform: uppercase; }
.pf-kpi strong { display: block; margin: 13px 0 7px; font-family: "Iowan Old Style", "Songti SC", serif; font-size: clamp(20px, 1.8vw, 28px); font-weight: 600; line-height: 1; letter-spacing: -.035em; overflow-wrap: anywhere; }
.pf-kpi small { color: var(--pf-muted); font-size: 9px; line-height: 1.45; }
.pf-kpi[data-tone="profit"] { border-top: 3px solid var(--pf-green); }
.pf-kpi[data-tone="loss"] { border-top: 3px solid var(--pf-red); }
.pf-kpi[data-tone="teal"] { border-top: 3px solid var(--pf-teal); }
.pf-kpi[data-tone="amber"] { border-top: 3px solid var(--pf-amber); }
.pf-profit { color: var(--pf-green) !important; }
.pf-loss { color: var(--pf-red) !important; }
.pf-layout { display: grid; grid-template-columns: minmax(0, 1.75fr) minmax(280px, .68fr); gap: 14px; align-items: start; }
.pf-stack { display: grid; gap: 14px; min-width: 0; }
.pf-panel { min-width: 0; border: 1px solid var(--pf-line); border-radius: 17px; background: var(--pf-surface); box-shadow: 0 12px 32px rgba(37,50,42,.032); }
.pf-panel-head { display: flex; flex-wrap: wrap; align-items: flex-start; justify-content: space-between; gap: 12px; padding: 16px 18px 12px; border-bottom: 1px solid var(--pf-line); }
.pf-panel-head h2 { margin: 0; font-family: "Iowan Old Style", "Songti SC", serif; font-size: 22px; font-weight: 600; letter-spacing: -.025em; }
.pf-panel-head p { max-width: 760px; margin: 4px 0 0; color: var(--pf-muted); font-size: 10px; line-height: 1.6; }
.pf-panel-body { padding: 13px 17px 17px; }
.pf-panel-body.flush { padding: 0; }
.pf-segment { display: inline-flex; gap: 3px; border: 1px solid var(--pf-line-strong); border-radius: 9px; background: var(--pf-soft); padding: 3px; }
.pf-segment button { appearance: none; min-height: 27px; border: 0; border-radius: 6px; background: transparent; padding: 0 9px; color: var(--pf-muted); font-size: 9px; font-weight: 800; cursor: pointer; }
.pf-segment button[aria-pressed="true"] { background: var(--pf-card); color: var(--pf-teal-deep); box-shadow: 0 1px 4px rgba(30,43,35,.13); }
.pf-chart { position: relative; width: 100%; overflow: hidden; border: 1px solid var(--pf-line); border-radius: 12px; background: var(--pf-surface-chart); }
.pf-chart svg { display: block; width: 100%; height: auto; overflow: visible; }
.pf-grid-line { stroke: var(--pf-grid-line); stroke-width: 1; stroke-dasharray: 3 5; }
.pf-grid-line.strong { stroke: var(--pf-grid-line-strong); stroke-dasharray: none; }
.pf-axis-label { fill: var(--pf-muted); font-size: 9px; }
.pf-area { opacity: .18; }
.pf-cursor-line { stroke: var(--pf-cursor-line); stroke-width: 1; stroke-dasharray: 4 4; }
.pf-chart-tooltip { position: absolute; z-index: 5; top: 9px; transform: translateX(-50%); display: grid; gap: 4px; min-width: 130px; border: 1px solid var(--pf-line-strong); border-radius: 9px; background: var(--pf-card); padding: 8px 9px; box-shadow: 0 8px 25px rgba(24,37,29,.13); pointer-events: none; }
.pf-chart-tooltip > strong { color: var(--pf-muted); font-size: 8px; }
.pf-chart-tooltip > span { display: grid; grid-template-columns: 7px minmax(0,1fr) auto; align-items: center; gap: 5px; font-size: 9px; }
.pf-chart-tooltip i { width: 7px; height: 7px; border-radius: 50%; }
.pf-chart-tooltip b { font-weight: 750; font-variant-numeric: tabular-nums; }
.pf-legend { display: flex; flex-wrap: wrap; gap: 7px 13px; padding: 8px 10px 2px; color: var(--pf-muted); font-size: 9px; }
.pf-legend span { display: inline-flex; align-items: center; gap: 5px; }
.pf-legend i { width: 8px; height: 8px; border-radius: 50%; }
.pf-empty-chart { display: grid; place-items: center; min-height: 180px; color: var(--pf-muted); font-size: 11px; }
.pf-bar-positive { fill: var(--pf-green); }
.pf-bar-negative { fill: var(--pf-red); }
.pf-bar-chart { overflow-x: auto; }
.pf-meta-row { display: flex; flex-wrap: wrap; gap: 6px 16px; margin: 0 0 10px; color: var(--pf-muted); font-size: 9px; }
.pf-meta-row b { color: var(--pf-ink); }
.pf-allocation { display: grid; gap: 5px; }
.pf-allocation-row { appearance: none; display: grid; gap: 5px; width: 100%; border: 1px solid transparent; border-radius: 9px; background: transparent; padding: 6px 7px; color: inherit; font: inherit; text-align: left; cursor: pointer; }
.pf-allocation-row:hover { border-color: var(--pf-line); background: var(--pf-soft); }
.pf-allocation-row[aria-pressed="true"] { border-color: rgba(31,111,92,.28); background: var(--pf-teal-soft); }
.pf-allocation-all { margin-bottom: 3px; border-color: var(--pf-line); background: var(--pf-card); }
.pf-allocation-group { border-left: 3px solid var(--pf-teal); background: linear-gradient(90deg, rgba(31,111,92,.09), transparent 72%); }
.pf-allocation-label { display: flex; justify-content: space-between; gap: 8px; font-size: 10px; }
.pf-allocation-name { display: flex; align-items: center; gap: 6px; min-width: 0; }
.pf-allocation-name > span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pf-allocation-badge { flex: none; border-radius: 999px; background: var(--pf-teal); padding: 1px 5px; color: var(--pf-on-accent); font-size: 8px; font-style: normal; font-weight: 800; }
.pf-allocation-label b { font-weight: 750; white-space: nowrap; }
.pf-allocation-track { height: 7px; overflow: hidden; border-radius: 999px; background: var(--pf-soft); }
.pf-allocation-track i { display: block; height: 100%; border-radius: inherit; background: var(--pf-teal); }
.pf-table-wrap { overflow: auto; border: 1px solid var(--pf-line); border-radius: 12px; background: var(--pf-surface-table); }
.pf-table { width: 100%; border-collapse: collapse; font-size: 10px; font-variant-numeric: tabular-nums; }
.pf-table th { position: sticky; top: 0; z-index: 1; border-bottom: 1px solid var(--pf-line); background: var(--pf-surface-table-head); padding: 9px 10px; color: var(--pf-muted); font-size: 8px; font-weight: 850; letter-spacing: .07em; text-align: left; text-transform: uppercase; white-space: nowrap; }
.pf-table td { border-bottom: 1px solid var(--pf-line); padding: 8px 10px; vertical-align: middle; }
.pf-table tbody tr:last-child td { border-bottom: 0; }
.pf-table tbody tr:hover { background: var(--pf-row-hover); }
.pf-table tfoot td { border-top: 2px solid var(--pf-line-strong); border-bottom: 0; background: var(--pf-surface-table-head); font-weight: 720; }
.pf-table tfoot strong { font-size: 11px; }
.pf-table .number { text-align: right; white-space: nowrap; }
.pf-table code, .pf-mono { color: var(--pf-code); font: 9px/1.45 "SFMono-Regular", "Cascadia Code", monospace; overflow-wrap: anywhere; }
.pf-tag { display: inline-flex; border-radius: 999px; background: var(--pf-teal-soft); padding: 2px 6px; color: var(--pf-teal); font-size: 8px; font-weight: 800; white-space: nowrap; }
.pf-tag.dividend { background: var(--pf-amber-soft); color: var(--pf-amber); }
.pf-heatmap { overflow: auto; }
.pf-heatmap-grid { display: grid; grid-template-columns: 62px repeat(12, minmax(45px, 1fr)) 72px; gap: 3px; min-width: 740px; }
.pf-heatmap-cell { display: grid; place-items: center; min-height: 31px; border-radius: 5px; padding: 3px 4px; font-size: 8px; font-variant-numeric: tabular-nums; white-space: nowrap; }
.pf-heatmap-cell.header { color: var(--pf-muted); font-weight: 800; }
.pf-heatmap-cell.year { background: var(--pf-soft); color: var(--pf-ink); font-weight: 850; }
.pf-heatmap-cell.year-total { background: var(--pf-teal-deep); color: var(--pf-on-accent); font-weight: 850; }
.pf-heatmap-cell.empty { color: var(--pf-faint); }
.pf-progress { display: grid; place-items: center; min-height: 260px; color: var(--pf-muted); font-size: 11px; }
.pf-empty { display: grid; place-items: center; gap: 7px; padding: 36px 20px; text-align: center; }
.pf-empty strong { font-family: "Iowan Old Style", "Songti SC", serif; font-size: 20px; font-weight: 600; }
.pf-empty p { max-width: 540px; margin: 0; color: var(--pf-muted); font-size: 10px; line-height: 1.65; }
.pf-warning-list { display: grid; gap: 6px; margin-top: 10px; }
.pf-warning { border: 1px solid rgba(168,113,42,.24); border-radius: 9px; background: var(--pf-amber-soft); padding: 8px 10px; color: var(--pf-amber); font-size: 9px; line-height: 1.5; }
.pf-config-grid { display: grid; grid-template-columns: minmax(0, 1.45fr) minmax(300px, .75fr); gap: 14px; align-items: start; }
.pf-form-section { border: 1px solid var(--pf-line); border-radius: 14px; background: var(--pf-surface); padding: 14px; }
.pf-form-section + .pf-form-section { margin-top: 12px; }
.pf-form-head { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 11px; }
.pf-form-head h3 { margin: 0; font-family: "Iowan Old Style", "Songti SC", serif; font-size: 18px; font-weight: 600; }
.pf-form-head p { margin: 3px 0 0; color: var(--pf-muted); font-size: 9px; line-height: 1.5; }
.pf-grid-2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 9px; }
.pf-grid-3 { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 9px; }
.pf-input { display: grid; gap: 4px; min-width: 0; color: var(--pf-muted); font-size: 8px; font-weight: 850; letter-spacing: .06em; text-transform: uppercase; }
.pf-input input, .pf-input select, .pf-input textarea { width: 100%; min-height: 34px; border: 1px solid var(--pf-line-strong); border-radius: 8px; background: var(--pf-card); padding: 6px 9px; color: var(--pf-ink); font-size: 10px; font-weight: 500; letter-spacing: 0; text-transform: none; }
.pf-input textarea { min-height: 80px; resize: vertical; font-family: "SFMono-Regular", "Cascadia Code", monospace; }
.pf-input input:focus, .pf-input select:focus, .pf-input textarea:focus { outline: 3px solid rgba(31,111,92,.15); outline-offset: 1px; }
.pf-input small { color: var(--pf-red); font-size: 8px; font-weight: 600; letter-spacing: 0; text-transform: none; }
.pf-card-list { display: grid; gap: 10px; }
.pf-edit-card { border: 1px solid var(--pf-line); border-radius: 12px; background: var(--pf-card); padding: 11px; }
.pf-edit-card-head { display: flex; align-items: center; gap: 8px; margin-bottom: 9px; }
.pf-edit-card-head strong { flex: 1 1 auto; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-family: "Iowan Old Style", "Songti SC", serif; font-size: 16px; font-weight: 600; }
.pf-check-row { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
.pf-suggestion { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; border-bottom: 1px solid var(--pf-line); padding: 8px 0; }
.pf-suggestion:last-child { border-bottom: 0; }
.pf-suggestion > div { flex: 1 1 220px; min-width: 0; }
.pf-suggestion strong { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 10px; }
.pf-suggestion small { display: block; margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--pf-muted); font-size: 8px; }
.pf-config-code { max-height: 310px; overflow: auto; margin: 0; border: 1px solid var(--pf-line); border-radius: 10px; background: var(--pf-surface-code); padding: 11px; color: var(--pf-code); font: 9px/1.55 "SFMono-Regular", "Cascadia Code", monospace; white-space: pre; }
.pf-issue-list { display: grid; gap: 6px; margin-top: 10px; }
.pf-issue { border: 1px solid rgba(180,74,61,.22); border-radius: 8px; background: var(--pf-red-soft); padding: 8px 9px; color: var(--pf-red); font-size: 9px; line-height: 1.5; }
.pf-guide { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 9px; margin-top: 13px; }
.pf-guide article { border: 1px solid var(--pf-line); border-radius: 12px; background: var(--pf-surface); padding: 13px; }
.pf-guide h3 { margin: 0 0 6px; font-family: "Iowan Old Style", "Songti SC", serif; font-size: 16px; font-weight: 600; }
.pf-guide p { margin: 0; color: var(--pf-muted); font-size: 9px; line-height: 1.65; }
:root.dark .pf-shell {
  --pf-ink: #e9ede8;
  --pf-muted: #a6b0a8;
  --pf-faint: #768279;
  --pf-paper: #131915;
  --pf-card: #1b231e;
  --pf-soft: #202a24;
  --pf-line: #344038;
  --pf-line-strong: #46534a;
  --pf-teal: #64bda4;
  --pf-teal-deep: #b5e6d6;
  --pf-teal-soft: #1d352d;
  --pf-green: #6bc98a;
  --pf-red: #e17a6d;
  --pf-green-soft: #1d3426;
  --pf-red-soft: #39221f;
  --pf-amber: #d7aa62;
  --pf-amber-soft: #382c1c;
  --pf-surface: rgba(27,35,30,.9);
  --pf-surface-chart: #161d18;
  --pf-surface-table: #161d18;
  --pf-surface-table-head: #202a24;
  --pf-surface-code: #161d18;
  --pf-code: #c9d4cb;
  --pf-on-accent: #13231d;
  --pf-row-hover: rgba(100,189,164,.07);
  --pf-grid-line: rgba(233,237,232,.11);
  --pf-grid-line-strong: rgba(233,237,232,.24);
  --pf-cursor-line: rgba(181,230,214,.5);
  --pf-chart-1: #f0a74a;
  --pf-chart-2: #5fc8b2;
  --pf-chart-3: #78a4ff;
  --pf-chart-4: #ff8799;
  --pf-chart-5: #b69bff;
  --pf-chart-6: #4fc7de;
  --pf-chart-7: #a3d95b;
  --pf-chart-8: #ff9d66;
  --pf-chart-9: #9aa8ff;
  --pf-chart-10: #ff8fc4;
  background:
    radial-gradient(circle at 91% 1%, rgba(100,189,164,.08), transparent 29rem),
    radial-gradient(circle at 3% 34%, rgba(215,170,98,.05), transparent 28rem);
}
:root.dark .pf-shell h1, :root.dark .pf-shell h2, :root.dark .pf-shell h3 { color: var(--pf-ink); }
@media (max-width: 1120px) {
  .pf-kpis { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .pf-layout, .pf-config-grid { grid-template-columns: minmax(0, 1fr); }
}
@media (max-width: 760px) {
  .pf-page { padding-top: 23px; }
  .pf-hero { grid-template-columns: minmax(0, 1fr); align-items: start; }
  .pf-hero-actions { align-items: flex-start; }
  .pf-actions { justify-content: flex-start; }
  .pf-kpis { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .pf-selection { margin-left: 0; }
  .pf-grid-2, .pf-grid-3, .pf-guide { grid-template-columns: minmax(0, 1fr); }
}
@media (max-width: 520px) {
  .pf-page { padding-inline: 12px; }
  .pf-hero h1 { font-size: 51px; }
  .pf-kpis { grid-template-columns: minmax(0, 1fr); }
  .pf-tabs { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .pf-tab { justify-content: center; }
  .pf-toolbar { align-items: stretch; }
  .pf-field { justify-content: space-between; }
  .pf-field select, .pf-field input { flex: 1 1 auto; }
}
@media (prefers-reduced-motion: reduce) {
  .pf-btn { transition: none; }
}
`;
