export const LIFE_CALENDAR_STYLES = `
.lc-shell {
  --lc-ink: #20272a;
  --lc-muted: #697273;
  --lc-faint: #969d9c;
  --lc-peach: #fde6d8;
  --lc-peach-deep: #f5c9b2;
  --lc-paper: #fffdfb;
  --lc-warm: #fbf6f0;
  --lc-line: #e8ded6;
  --lc-teal: #45bcc1;
  --lc-teal-deep: #279ca2;
  --lc-amber: #f3b529;
  --lc-amber-deep: #d8950b;
  --lc-future: #f0f0f3;
  --lc-retire: #b7e49b;
  --lc-retire-deep: #78b958;
  --lc-sleep: #8e79b8;
  --lc-work: #5d84a8;
  --lc-free-before: #9bc97d;
  --lc-free-stripe: #3f715d;
  --lc-shadow: 0 28px 80px rgba(104, 65, 43, .12);
  position: relative;
  isolation: isolate;
  width: 100%;
  height: 100%;
  min-height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
  -webkit-overflow-scrolling: touch;
  color: var(--lc-ink);
  background:
    radial-gradient(ellipse 52% 45% at 0% 0%, var(--lc-peach) 0 62%, transparent 100%),
    radial-gradient(ellipse 38% 42% at 100% 100%, #feeadf 0 64%, transparent 100%),
    linear-gradient(145deg, #fffaf6, #fdf4ec 55%, #fffaf7);
  font-family: "Avenir Next", "PingFang SC", "Hiragino Sans GB", sans-serif;
}
.lc-shell::before,
.lc-shell::after {
  content: "";
  position: absolute;
  z-index: -1;
  pointer-events: none;
  border-radius: 50%;
}
.lc-shell::before {
  top: -15rem;
  left: -10rem;
  width: 33rem;
  height: 32rem;
  background: rgba(247, 194, 167, .46);
  filter: blur(2px);
}
.lc-shell::after {
  right: -9rem;
  bottom: -15rem;
  width: 29rem;
  height: 29rem;
  background: rgba(249, 208, 186, .34);
}
.lc-shell *,
.lc-shell *::before,
.lc-shell *::after { box-sizing: border-box; }
.lc-page {
  width: min(1320px, 100%);
  min-height: 100%;
  margin: 0 auto;
  padding: 22px clamp(14px, 2.5vw, 36px) 18px;
}
.lc-workspace {
  min-width: 0;
}
.lc-settings-overlay {
  position: fixed;
  z-index: 80;
  inset: 0;
  display: grid;
  place-items: center;
  overflow-y: auto;
  padding: 24px;
  background: rgba(62, 44, 33, .24);
  backdrop-filter: blur(7px);
  animation: lc-modal-fade .2s ease both;
}
.lc-settings {
  width: min(820px, 100%);
  max-height: calc(100dvh - 48px);
  margin: 0;
  overflow-x: hidden;
  overflow-y: auto;
  border: 1px solid rgba(126, 93, 72, .16);
  border-radius: 20px;
  background: rgba(255, 252, 248, .98);
  box-shadow: 0 28px 90px rgba(70, 43, 28, .2);
  animation: lc-dialog-in .34s cubic-bezier(.2, .76, .24, 1) both;
}
.lc-settings-head {
  padding: 20px 24px 18px;
  border-bottom: 1px solid var(--lc-line);
}
.lc-settings-kickerline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.lc-settings-close {
  display: grid;
  width: 28px;
  height: 28px;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid var(--lc-line);
  border-radius: 50%;
  background: var(--lc-paper);
  color: var(--lc-muted);
  padding: 0;
  font: inherit;
  font-size: 19px;
  line-height: 1;
  cursor: pointer;
}
.lc-settings-close:hover {
  border-color: #cebcb0;
  color: var(--lc-ink);
}
.lc-settings-close:focus-visible {
  outline: 2px solid var(--lc-teal-deep);
  outline-offset: 2px;
}
.lc-settings-title-row {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 24px;
}
.lc-settings-head span {
  color: #a1644c;
  font-size: 8px;
  font-weight: 850;
  letter-spacing: .18em;
  text-transform: uppercase;
}
.lc-settings-head h2 {
  margin: 4px 0 0;
  font-family: "Iowan Old Style", "Songti SC", serif;
  font-size: clamp(27px, 3vw, 38px);
  letter-spacing: -.025em;
}
.lc-settings-head p {
  max-width: 540px;
  margin: 6px 0 0;
  color: var(--lc-muted);
  font-size: 10px;
  line-height: 1.55;
}
.lc-settings-summary {
  display: flex;
  flex: 0 0 auto;
  gap: 18px;
  padding: 10px 0 2px;
}
.lc-settings-summary div {
  display: grid;
  gap: 2px;
  min-width: 62px;
  border-left: 1px solid var(--lc-line);
  padding-left: 14px;
}
.lc-settings-summary span {
  color: var(--lc-faint);
  font-size: 7.5px;
  font-weight: 750;
  letter-spacing: .05em;
}
.lc-settings-summary strong {
  color: var(--lc-ink);
  font-family: "Iowan Old Style", "Songti SC", serif;
  font-size: 18px;
  line-height: 1.05;
  font-variant-numeric: tabular-nums;
}
.lc-settings-form {
  display: grid;
  gap: 18px;
  padding: 20px 24px 22px;
}
.lc-settings-section {
  display: grid;
  gap: 12px;
}
.lc-settings-section-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
}
.lc-settings-section-head h3 {
  margin: 0;
  color: var(--lc-ink);
  font-size: 11px;
  font-weight: 850;
  letter-spacing: .04em;
}
.lc-settings-section-head span {
  color: var(--lc-faint);
  font-size: 8px;
  font-weight: 650;
}
.lc-settings-fields {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: end;
  gap: 12px;
}
.lc-field {
  display: grid;
  gap: 5px;
}
.lc-field-label {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  color: var(--lc-muted);
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: .07em;
}
.lc-field-label small {
  color: var(--lc-faint);
  font-size: 8px;
  font-weight: 650;
  letter-spacing: 0;
}
.lc-input {
  width: 100%;
  height: 36px;
  border: 1px solid var(--lc-line);
  border-radius: 9px;
  outline: none;
  background: var(--lc-paper);
  color: var(--lc-ink);
  padding: 0 10px;
  font: inherit;
  font-size: 12px;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
  transition: border-color .16s ease, box-shadow .16s ease;
}
.lc-input:hover { border-color: #cebcb0; }
.lc-input:focus {
  border-color: var(--lc-teal-deep);
  box-shadow: 0 0 0 3px rgba(69, 188, 193, .14);
}
.lc-input:disabled { opacity: .58; cursor: not-allowed; }
.lc-save {
  height: 36px;
  border: 0;
  border-radius: 9px;
  background: var(--lc-ink);
  color: #fff;
  padding: 0 13px;
  font: inherit;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: .04em;
  cursor: pointer;
  transition: transform .16s ease, background .16s ease, opacity .16s ease;
}
.lc-save:hover:not(:disabled) { transform: translateY(-1px); background: #323d40; }
.lc-save:disabled { opacity: .34; cursor: not-allowed; }
.lc-settings-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  border-top: 1px solid var(--lc-line);
  padding-top: 16px;
}
.lc-settings-actions .lc-form-note {
  max-width: 480px;
  margin: 0;
}
.lc-settings-actions .lc-save {
  flex: 0 0 auto;
  min-width: 142px;
}
.lc-form-note {
  margin: -2px 0 0;
  color: var(--lc-faint);
  font-size: 8px;
  line-height: 1.5;
}
.lc-age-mode {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 34px;
  grid-column: 1 / -1;
  align-items: center;
  gap: 10px;
  min-height: 34px;
  padding: 6px 9px;
  border: 1px solid var(--lc-line);
  border-radius: 9px;
  background: rgba(255, 253, 250, .72);
  cursor: pointer;
}
.lc-settings-fields .lc-age-mode {
  grid-column: auto;
  max-width: none;
}
.lc-age-mode > span {
  display: grid;
  gap: 1px;
}
.lc-age-mode strong {
  color: var(--lc-ink);
  font-size: 9.5px;
  font-weight: 800;
}
.lc-age-mode small {
  color: var(--lc-faint);
  font-size: 8px;
  font-weight: 650;
}
.lc-age-mode input {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  opacity: 0;
}
.lc-age-mode i {
  position: relative;
  width: 32px;
  height: 18px;
  border-radius: 999px;
  background: #ddd7cf;
  transition: background .18s ease;
}
.lc-age-mode i::after {
  content: "";
  position: absolute;
  top: 3px;
  left: 3px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 4px rgba(56, 44, 32, .24);
  transition: transform .18s ease;
}
.lc-age-mode input:checked + i { background: var(--lc-teal); }
.lc-age-mode input:checked + i::after { transform: translateX(14px); }
.lc-age-mode input:focus-visible + i {
  outline: 2px solid var(--lc-teal-deep);
  outline-offset: 3px;
}
.lc-age-mode:has(input:disabled) {
  opacity: .58;
  cursor: not-allowed;
}
.lc-custom-types {
  display: grid;
  gap: 7px;
  padding-top: 10px;
  border-top: 1px solid #eee7dc;
}
.lc-settings-dialog .lc-custom-types {
  gap: 10px;
  border: 1px solid var(--lc-line);
  border-radius: 14px;
  background: rgba(255, 253, 250, .68);
  padding: 14px;
}
.lc-custom-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.lc-custom-title {
  display: grid;
  gap: 2px;
}
.lc-custom-title > span {
  color: var(--lc-muted);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: .06em;
}
.lc-custom-title small {
  color: var(--lc-faint);
  font-size: 7.5px;
  font-weight: 650;
  letter-spacing: 0;
}
.lc-add-type,
.lc-remove-type {
  border: 0;
  background: transparent;
  color: var(--lc-teal-deep);
  font: inherit;
  cursor: pointer;
}
.lc-add-type {
  padding: 2px 0;
  font-size: 9px;
  font-weight: 800;
}
.lc-add-type:disabled,
.lc-remove-type:disabled { opacity: .35; cursor: not-allowed; }
.lc-add-type:focus-visible,
.lc-remove-type:focus-visible {
  outline: 2px solid var(--lc-teal-deep);
  outline-offset: 2px;
  border-radius: 3px;
}
.lc-custom-empty {
  margin: 0;
  color: var(--lc-faint);
  font-size: 8px;
  line-height: 1.5;
}
.lc-custom-list {
  display: grid;
  gap: 5px;
}
.lc-custom-row {
  position: relative;
  display: grid;
  grid-template-columns: 16px 18px minmax(0, 1fr) 76px 124px 9px 124px 18px;
  align-items: center;
  gap: 4px;
  transition: opacity .16s ease;
}
.lc-custom-row.is-dragging { opacity: .38; }
.lc-custom-row.is-drop-target::after {
  content: "";
  position: absolute;
  z-index: 2;
  inset: -3px;
  border: 1px dashed var(--lc-teal-deep);
  border-radius: 9px;
  background: rgba(69, 188, 193, .04);
  pointer-events: none;
}
.lc-drag-handle {
  display: grid;
  width: 16px;
  height: 28px;
  place-items: center;
  border: 0;
  border-radius: 5px;
  background: transparent;
  color: #b1aaa3;
  padding: 0;
  cursor: grab;
  transition:
    color .16s ease,
    background-color .16s ease;
}
.lc-drag-handle:hover:not(:disabled) {
  background: rgba(69, 188, 193, .08);
  color: var(--lc-teal-deep);
}
.lc-drag-handle:active:not(:disabled) { cursor: grabbing; }
.lc-drag-handle:focus-visible {
  outline: 2px solid var(--lc-teal-deep);
  outline-offset: 1px;
}
.lc-drag-handle:disabled {
  opacity: .38;
  cursor: not-allowed;
}
.lc-drag-handle svg {
  width: 10px;
  height: 16px;
}
.lc-color-input {
  width: 18px;
  height: 18px;
  padding: 0;
  overflow: hidden;
  border: 0;
  border-radius: 5px;
  background: transparent;
  cursor: pointer;
}
.lc-color-input::-webkit-color-swatch-wrapper { padding: 0; }
.lc-color-input::-webkit-color-swatch {
  border: 0;
  border-radius: 5px;
}
.lc-mini-input {
  width: 100%;
  min-width: 0;
  height: 28px;
  border: 1px solid var(--lc-line);
  border-radius: 7px;
  outline: none;
  background: var(--lc-paper);
  color: var(--lc-ink);
  padding: 0 6px;
  font: inherit;
  font-size: 10px;
  font-variant-numeric: tabular-nums;
}
.lc-mini-select {
  width: 100%;
  min-width: 0;
  height: 28px;
  border: 1px solid var(--lc-line);
  border-radius: 7px;
  outline: none;
  background: var(--lc-paper);
  color: var(--lc-ink);
  padding: 0 5px;
  font: inherit;
  font-size: 9px;
  font-weight: 700;
  cursor: pointer;
}
.lc-mini-input:focus {
  border-color: var(--lc-teal-deep);
  box-shadow: 0 0 0 2px rgba(69, 188, 193, .12);
}
.lc-boundary-field {
  position: relative;
  display: block;
  min-width: 0;
}
.lc-boundary-field .lc-mini-input {
  padding-right: 28px;
}
.lc-boundary-field small {
  position: absolute;
  top: 50%;
  right: 6px;
  color: var(--lc-faint);
  font-size: 7.5px;
  font-weight: 750;
  pointer-events: none;
  transform: translateY(-50%);
  white-space: nowrap;
}
.lc-boundary-field:not(:has(small)) .lc-mini-input {
  padding-right: 6px;
}
.lc-mini-select:focus {
  border-color: var(--lc-teal-deep);
  box-shadow: 0 0 0 2px rgba(69, 188, 193, .12);
}
.lc-mini-input:disabled,
.lc-mini-select:disabled,
.lc-color-input:disabled { opacity: .55; cursor: not-allowed; }
.lc-range-dash {
  color: var(--lc-faint);
  font-size: 9px;
  text-align: center;
}
.lc-remove-type {
  display: grid;
  width: 18px;
  height: 22px;
  padding: 0;
  place-items: center;
  color: var(--lc-faint);
  font-size: 15px;
  line-height: 1;
}
.lc-remove-type:hover:not(:disabled) { color: #a14e40; }
.lc-error,
.lc-warning,
.lc-success {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  margin-bottom: 12px;
  border-radius: 13px;
  padding: 9px 11px;
  font-size: 10px;
  line-height: 1.6;
}
.lc-error {
  border: 1px solid rgba(177, 66, 49, .2);
  background: #fff2ee;
  color: #924536;
}
.lc-warning {
  border: 1px solid rgba(194, 133, 25, .22);
  background: #fff8e8;
  color: #805b18;
}
.lc-success {
  border: 1px solid rgba(80, 145, 82, .2);
  background: #f1faef;
  color: #3d7140;
}
.lc-stage {
  display: grid;
  min-width: 0;
  animation: lc-rise .55s .09s ease both;
}
.lc-view-layer {
  grid-area: 1 / 1;
  min-width: 0;
  align-self: start;
}
.lc-view-layer[hidden] { display: none; }
.lc-calendar-card,
.lc-month-card {
  overflow: hidden;
  border: 1px solid rgba(126, 93, 72, .13);
  border-radius: 22px;
  background: rgba(255, 253, 251, .96);
  box-shadow: var(--lc-shadow);
}
.lc-card-head {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 20px;
  padding: clamp(15px, 1.8vw, 22px) clamp(16px, 2vw, 26px) 11px;
}
.lc-card-intro { min-width: 0; }
.lc-card-titleline {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 9px;
}
.lc-card-kicker {
  color: #9a785f;
  font-size: 8px;
  font-weight: 850;
  letter-spacing: .2em;
  text-transform: uppercase;
}
.lc-card-count {
  border: 1px solid var(--lc-line);
  border-radius: 999px;
  padding: 2px 7px;
  color: var(--lc-muted);
  background: rgba(251, 246, 240, .7);
  font-size: 8px;
  font-weight: 750;
}
.lc-settings-open {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 24px;
  border: 1px solid var(--lc-line);
  border-radius: 999px;
  background: rgba(255, 253, 250, .78);
  color: var(--lc-muted);
  padding: 0 8px;
  font: inherit;
  font-size: 8px;
  font-weight: 750;
  cursor: pointer;
  transition:
    border-color .16s ease,
    color .16s ease,
    background .16s ease;
}
.lc-settings-open:hover {
  border-color: #cebcb0;
  background: var(--lc-paper);
  color: var(--lc-ink);
}
.lc-settings-open:focus-visible {
  outline: 2px solid var(--lc-teal-deep);
  outline-offset: 2px;
}
.lc-settings-open svg {
  width: 11px;
  height: 11px;
}
.lc-card-head h2,
.lc-month-heading h2 {
  margin: 4px 0 5px;
  font-family: "Iowan Old Style", "Songti SC", serif;
  font-size: clamp(22px, 2.4vw, 31px);
  line-height: 1.08;
  letter-spacing: -.04em;
}
.lc-card-head h2 em {
  color: var(--lc-teal-deep);
  font-style: normal;
  font-weight: 500;
}
.lc-card-head p,
.lc-month-heading p {
  max-width: 620px;
  margin: 0;
  color: var(--lc-muted);
  font-size: 10px;
  line-height: 1.5;
}
.lc-card-stats {
  display: flex;
  flex: 0 0 auto;
  align-items: baseline;
  justify-content: flex-end;
  gap: 10px;
  text-align: right;
}
.lc-card-stats > strong {
  display: block;
  font-family: "Iowan Old Style", "Songti SC", serif;
  font-size: 30px;
  line-height: .9;
  letter-spacing: -.045em;
}
.lc-card-stats > b {
  color: var(--lc-ink);
  font-family: "Iowan Old Style", "Songti SC", serif;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: -.025em;
  line-height: 1;
  white-space: nowrap;
}
.lc-card-stats > b small {
  margin-left: 1px;
  color: var(--lc-muted);
  font-family: "Avenir Next", "PingFang SC", sans-serif;
  font-size: 8px;
  font-weight: 750;
  letter-spacing: 0;
}
.lc-life-budget {
  position: relative;
  display: flex;
  height: 18px;
  margin: 0 clamp(16px, 2vw, 26px);
  overflow: hidden;
  border: 3px solid var(--lc-paper);
  border-radius: 999px;
  background: var(--lc-future);
  box-shadow:
    0 0 0 1px var(--lc-line),
    inset 0 1px 0 rgba(255, 255, 255, .34);
}
.lc-life-budget > span {
  flex: 0 0 auto;
  height: 100%;
  min-width: 0;
  transition:
    width .4s cubic-bezier(.2, .7, .2, 1),
    opacity .18s ease,
    filter .18s ease,
    box-shadow .18s ease;
}
.lc-life-budget > .is-lived { background: var(--lc-teal); }
.lc-life-budget > .is-free-before { background: var(--lc-free-before); }
.lc-life-budget > .is-free-after {
  background:
    repeating-linear-gradient(
      135deg,
      color-mix(in srgb, var(--lc-free-stripe) 58%, transparent) 0 1px,
      transparent 1px 6px
    ),
    var(--lc-free-before);
}
.lc-life-budget > .is-work { background: var(--lc-work); }
.lc-life-budget > .is-sleep { background: var(--lc-sleep); }
.lc-life-budget > span.is-muted {
  opacity: .3;
  filter: saturate(.55) brightness(1.04);
}
.lc-life-budget > span.is-active {
  filter: saturate(1.12) brightness(1.08);
  box-shadow: inset 0 0 0 2px rgba(255, 255, 255, .42);
}
.lc-life-budget-key {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 5px 13px;
  margin: 7px clamp(16px, 2vw, 26px) 12px;
  color: var(--lc-muted);
  font-size: 8px;
  font-weight: 700;
  line-height: 1.45;
}
.lc-life-budget-key > button {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  padding: 1px 3px;
  color: inherit;
  font: inherit;
  font-weight: inherit;
  white-space: nowrap;
  cursor: pointer;
  transition:
    color .16s ease,
    background .16s ease;
}
.lc-life-budget-key > button:hover,
.lc-life-budget-key > button.is-active {
  background: rgba(69, 188, 193, .09);
  color: var(--lc-ink);
}
.lc-life-budget-key > button.is-active i {
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, .82),
    0 0 0 3px rgba(32, 39, 42, .12);
}
.lc-life-budget-key > button:focus-visible {
  outline: 2px solid var(--lc-teal-deep);
  outline-offset: 1px;
}
.lc-life-budget-key i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  box-shadow: inset 0 0 0 1px rgba(32, 39, 42, .08);
}
.lc-life-budget-key i.is-lived { background: var(--lc-teal); }
.lc-life-budget-key i.is-free-before { background: var(--lc-free-before); }
.lc-life-budget-key i.is-free-after {
  background:
    repeating-linear-gradient(
      135deg,
      color-mix(in srgb, var(--lc-free-stripe) 64%, transparent) 0 1px,
      transparent 1px 3px
    ),
    var(--lc-free-before);
}
.lc-life-budget-key i.is-work { background: var(--lc-work); }
.lc-life-budget-key i.is-sleep { background: var(--lc-sleep); }
.lc-life-budget-key b {
  color: var(--lc-ink);
  font-size: 8.5px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}
.lc-life-budget-key em {
  color: var(--lc-faint);
  font-style: normal;
}
.lc-grid {
  display: grid;
  grid-template-columns: repeat(10, minmax(0, 1fr));
  gap: 6px;
  min-width: 0;
  margin: 0;
  padding: 0 clamp(16px, 2vw, 26px);
  list-style: none;
}
.lc-calendar-body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 196px;
  align-items: start;
}
.lc-calendar-main { min-width: 0; }
.lc-cell {
  position: relative;
  display: grid;
  isolation: isolate;
  min-width: 0;
  height: clamp(
    30px,
    calc((100dvh - 360px) / var(--lc-rows, 8)),
    60px
  );
  place-content: center;
  gap: 2px;
  overflow: hidden;
  border: 0;
  border-radius: clamp(7px, .8vw, 10px);
  background: var(--lc-future);
  color: #292a2e;
  text-align: center;
  font-variant-numeric: tabular-nums;
  transition:
    background-color .24s ease,
    filter .28s ease,
    opacity .24s ease,
    transform .24s cubic-bezier(.2, .76, .24, 1),
    box-shadow .28s ease;
}
.lc-cell::after {
  content: "";
  position: absolute;
  z-index: 10;
  inset: 0;
  border: 1px solid color-mix(
    in srgb,
    var(--lc-cell-border-base) 84%,
    var(--lc-ink)
  );
  border-radius: inherit;
  pointer-events: none;
}
.lc-cell-canvas {
  position: absolute;
  z-index: 0;
  inset: 0;
  overflow: hidden;
  border-radius: inherit;
  background: var(--lc-cell-base-color);
  pointer-events: none;
  transition:
    opacity .24s ease,
    filter .28s ease;
}
.lc-cell-canvas.is-muted {
  opacity: .42;
  filter: saturate(.48) brightness(1.03);
}
.lc-cell-fills {
  position: absolute;
  inset: 0;
}
.lc-fill-segment {
  position: absolute;
  top: 0;
  bottom: 0;
  display: block;
}
.lc-active-fill-layer {
  position: absolute;
  z-index: 1;
  inset: 0;
  overflow: hidden;
  border-radius: inherit;
  pointer-events: none;
}
.lc-active-fill {
  position: absolute;
  top: 0;
  bottom: 0;
  display: block;
}
.lc-current-style-overlay {
  position: absolute;
  z-index: 1;
  inset: 0;
  border-radius: inherit;
  background: var(--lc-amber);
  opacity: .68;
  pointer-events: none;
}
.lc-cell.is-past { background: var(--lc-teal); }
.lc-cell.is-current { background: var(--lc-amber); }
.lc-cell.is-retirement { background: var(--lc-retire); }
.lc-cell.has-custom-fill {
  background-color: transparent;
}
.lc-cell.has-custom-fill .lc-cell-year {
  color: rgba(25, 32, 33, .72);
}
.lc-cell.is-stage-highlighted {
  z-index: 2;
  filter: saturate(1.04) brightness(1.015);
}
.lc-cell.is-stage-highlighted::after {
  border: 3px solid color-mix(
    in srgb,
    var(--lc-cell-border-base) 68%,
    var(--lc-ink)
  );
}
.lc-cell.lc-current-button.is-stage-highlighted {
  outline: 2px solid var(--lc-stage-highlight-color);
  outline-offset: 3px;
}
.lc-grid.is-inspecting-stage .lc-cell:not(.is-stage-highlighted) {
  opacity: .42;
  filter: saturate(.48) brightness(1.03);
}
.lc-grid.is-inspecting-stage .lc-cell.is-stage-highlighted {
  opacity: 1;
  filter: saturate(1.08) brightness(1.06);
}
.lc-grid.is-inspecting-stage .lc-cell.is-stage-fill-highlighted {
  filter: none;
}
.lc-cell-number {
  position: relative;
  z-index: 2;
  font-family: "Avenir Next", "PingFang SC", sans-serif;
  font-size: clamp(14px, 1.35vw, 20px);
  font-weight: 800;
  line-height: 1;
  letter-spacing: -.035em;
}
.lc-cell-year {
  position: relative;
  z-index: 2;
  color: rgba(38, 42, 44, .67);
  font-size: clamp(8px, .75vw, 11px);
  font-weight: 650;
  line-height: 1.1;
}
.lc-cell-year.is-range {
  font-size: clamp(7px, .62vw, 9px);
  letter-spacing: -.035em;
  white-space: nowrap;
}
.lc-cell.is-past .lc-cell-number,
.lc-cell.is-current .lc-cell-number { color: #142e30; }
.lc-cell.is-past .lc-cell-year,
.lc-cell.is-current .lc-cell-year { color: rgba(20, 46, 48, .69); }
.lc-cell-customs {
  position: absolute;
  z-index: 2;
  bottom: 5px;
  left: 50%;
  display: flex;
  gap: 2px;
  max-width: 72%;
  transform: translateX(-50%);
}
.lc-cell-customs i {
  width: 14px;
  height: 3px;
  flex: 0 0 auto;
  border-radius: 999px;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, .56),
    0 1px 2px rgba(37, 38, 35, .16);
  transition:
    height .16s ease,
    width .16s ease,
    box-shadow .16s ease;
}
.lc-cell-customs i.is-active {
  width: 19px;
  height: 4px;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, .72),
    0 2px 4px rgba(37, 38, 35, .24);
}
.lc-current-button {
  z-index: 1;
  width: 100%;
  padding: 0;
  overflow: visible;
  isolation: isolate;
  cursor: pointer;
}
.lc-current-button.has-custom-fill {
  --lc-breathe-color: var(--lc-stage-color);
}
.lc-current-button:hover {
  filter: saturate(1.07) brightness(1.02);
}
.lc-current-button:focus-visible {
  outline: 3px solid var(--lc-amber-deep);
  outline-offset: 4px;
}
.lc-retirement-marker {
  z-index: 1;
}
.lc-stage-panel {
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  align-self: stretch;
  border-left: 1px solid var(--lc-line);
  padding: 0 14px 14px;
}
.lc-stage-panel-head {
  display: grid;
  gap: 4px;
  padding: 3px 2px 11px;
}
.lc-stage-panel-head span {
  color: #9a785f;
  font-size: 7px;
  font-weight: 850;
  letter-spacing: .18em;
  text-transform: uppercase;
}
.lc-stage-panel-head strong {
  font-family: "Iowan Old Style", "Songti SC", serif;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -.02em;
}
.lc-stage-subhead {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 6px;
  padding: 0 2px 5px;
  color: var(--lc-muted);
  font-size: 7px;
  font-weight: 850;
  letter-spacing: .08em;
}
.lc-stage-subhead small {
  color: var(--lc-faint);
  font-size: 6.5px;
  font-weight: 650;
  letter-spacing: 0;
}
.lc-custom-stage-section {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 0;
}
.lc-base-stage-list {
  display: grid;
  gap: 4px;
  margin: 0;
  padding: 0 7px 0 2px;
  list-style: none;
}
.lc-base-stage-list li {
  display: grid;
  grid-template-columns: 8px minmax(0, 1fr) auto;
  align-items: center;
  gap: 7px;
  min-height: 28px;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--lc-stage-color) 24%, var(--lc-line));
  border-radius: 8px;
  background: color-mix(in srgb, var(--lc-stage-color) 9%, var(--lc-paper));
  padding: 4px 7px;
}
.lc-base-stage-list li > i {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: var(--lc-stage-color);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--lc-stage-color) 16%, transparent);
}
.lc-base-stage-list li > span {
  display: grid;
  min-width: 0;
  gap: 1px;
}
.lc-base-stage-list strong {
  overflow: hidden;
  font-size: 8.5px;
  font-weight: 800;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.lc-base-stage-list small,
.lc-base-stage-list em {
  color: var(--lc-faint);
  font-size: 7px;
  font-style: normal;
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
  white-space: nowrap;
}
.lc-base-stage-list em {
  color: var(--lc-muted);
  font-weight: 750;
}
.lc-base-stage-list.is-settings {
  grid-template-columns: repeat(4, minmax(0, 1fr));
  padding: 0;
}
.lc-stage-list {
  display: grid;
  flex: 1 1 auto;
  align-content: start;
  grid-auto-rows: max-content;
  gap: 4px;
  min-height: 0;
  margin: 0;
  padding: 2px 7px 6px 2px;
  overflow-y: auto;
  list-style: none;
  scrollbar-gutter: stable;
  scrollbar-width: thin;
}
.lc-stage-item {
  display: grid;
  grid-template-columns: 9px minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-height: 42px;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--lc-stage-color) 22%, var(--lc-line));
  border-radius: 10px;
  background: color-mix(in srgb, var(--lc-stage-color) 8%, var(--lc-paper));
  color: var(--lc-ink);
  padding: 7px 8px;
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition:
    border-color .18s ease,
    background-color .18s ease,
    box-shadow .18s ease,
    transform .18s ease;
}
.lc-stage-item:hover,
.lc-stage-item.is-active {
  border-color: var(--lc-stage-color);
  background: color-mix(in srgb, var(--lc-stage-color) 18%, var(--lc-paper));
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--lc-stage-color) 28%, transparent);
  transform: translateX(-2px);
}
.lc-stage-item:focus-visible {
  outline: none;
  box-shadow: inset 0 0 0 2px var(--lc-stage-color);
}
.lc-stage-item > i {
  width: 9px;
  height: 9px;
  border-radius: 999px;
  background: var(--lc-stage-color);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--lc-stage-color) 16%, transparent);
}
.lc-stage-item > i.is-underline {
  width: 14px;
  height: 4px;
  border-radius: 999px;
}
.lc-stage-item > span {
  display: grid;
  min-width: 0;
  gap: 2px;
}
.lc-stage-item strong {
  overflow: hidden;
  font-size: 10px;
  font-weight: 800;
  line-height: 1.25;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.lc-stage-item small {
  overflow: hidden;
  color: var(--lc-muted);
  font-size: 8px;
  font-variant-numeric: tabular-nums;
  line-height: 1.35;
  white-space: normal;
}
.lc-stage-range {
  display: grid;
  gap: 1px;
  min-width: 0;
}
.lc-stage-range > span {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.lc-stage-item em {
  color: var(--lc-faint);
  font-size: 7px;
  font-style: normal;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.lc-stage-empty {
  margin: 2px;
  border: 1px dashed var(--lc-line);
  border-radius: 10px;
  color: var(--lc-faint);
  padding: 12px 10px;
  font-size: 8px;
  line-height: 1.6;
}
.lc-default-types {
  display: grid;
  gap: 9px;
  border: 1px solid var(--lc-line);
  border-radius: 14px;
  background: rgba(255, 253, 250, .68);
  padding: 13px 14px;
}
.lc-grid-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 14px clamp(16px, 2vw, 26px) 17px;
}
.lc-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 7px 12px;
}
.lc-legend-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-height: 22px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--lc-muted);
  padding: 2px 4px;
  font: inherit;
  font-size: 8.5px;
  font-weight: 720;
  cursor: pointer;
  transition:
    color .16s ease,
    background-color .16s ease;
}
.lc-legend-item:hover,
.lc-legend-item.is-active {
  background: color-mix(in srgb, var(--lc-legend-color) 13%, transparent);
  color: var(--lc-ink);
}
.lc-legend-item:focus-visible {
  outline: 2px solid var(--lc-legend-color);
  outline-offset: 1px;
}
.lc-legend-item i {
  width: 9px;
  height: 9px;
  border-radius: 3px;
  background: var(--lc-legend-color);
}
.lc-legend-item.is-custom i { border-radius: 999px; }
.lc-legend-item b {
  color: var(--lc-faint);
  font-size: 7.5px;
  font-weight: 650;
}
.lc-current-hint {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  flex: 0 0 auto;
  margin: 0;
  color: #8c6414;
  font-size: 8px;
  font-weight: 750;
}
.lc-current-hint::before {
  content: "";
  width: 17px;
  height: 1px;
  background: currentColor;
}
.lc-empty {
  margin: 0 clamp(20px, 2.8vw, 36px) 28px;
  border: 1px dashed #dccdc2;
  border-radius: 18px;
  background: #fffaf6;
  padding: 34px 24px;
  text-align: center;
}
.lc-empty strong {
  display: block;
  font-family: "Iowan Old Style", "Songti SC", serif;
  font-size: 22px;
}
.lc-empty span {
  display: block;
  margin-top: 7px;
  color: var(--lc-muted);
  font-size: 11px;
}
.lc-empty-settings {
  height: 32px;
  margin-top: 16px;
  border: 0;
  border-radius: 9px;
  background: var(--lc-ink);
  color: #fff;
  padding: 0 14px;
  font: inherit;
  font-size: 10px;
  font-weight: 800;
  cursor: pointer;
}
.lc-empty-settings:hover { background: #323d40; }
.lc-empty-settings:focus-visible {
  outline: 2px solid var(--lc-teal-deep);
  outline-offset: 3px;
}
.lc-loading {
  display: grid;
  min-height: 340px;
  place-items: center;
  border: 1px solid rgba(126, 93, 72, .13);
  border-radius: 28px;
  background: rgba(255, 253, 251, .86);
  color: var(--lc-muted);
  font-size: 12px;
}
.lc-back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 0;
  background: transparent;
  color: var(--lc-muted);
  padding: 0;
  font: inherit;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: .04em;
  cursor: pointer;
}
.lc-back:hover { color: var(--lc-ink); }
.lc-back:focus-visible {
  outline: 2px solid var(--lc-teal-deep);
  outline-offset: 4px;
  border-radius: 3px;
}
.lc-back span {
  font-size: 16px;
  line-height: 1;
  transform: translateY(-1px);
}
.lc-month-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 24px;
  padding: 20px clamp(20px, 2.8vw, 36px) 19px;
}
.lc-month-heading h2 {
  margin-top: 8px;
  font-size: clamp(35px, 4.6vw, 59px);
}
.lc-month-stamp {
  display: grid;
  min-width: 142px;
  justify-items: end;
  gap: 6px;
}
.lc-month-stamp strong {
  color: var(--lc-amber-deep);
  font-family: "Iowan Old Style", "Songti SC", serif;
  font-size: 42px;
  line-height: .92;
}
.lc-month-stamp span {
  color: var(--lc-muted);
  font-size: 9px;
  font-weight: 750;
  letter-spacing: .06em;
}
.lc-month-body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 220px;
  gap: 27px;
  padding: 7px clamp(20px, 2.8vw, 36px) 32px;
}
.lc-month-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 6px;
  table-layout: fixed;
}
.lc-month-table caption {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}
.lc-month-table th {
  padding: 4px 2px 8px;
  color: var(--lc-faint);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: .08em;
}
.lc-month-table td {
  padding: 0;
  vertical-align: top;
}
.lc-day {
  display: grid;
  min-height: clamp(42px, 5vw, 64px);
  place-items: center;
  border-radius: 12px;
  background: #f7f7f8;
  color: #6d7275;
  font-size: clamp(11px, 1.1vw, 14px);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  transition: filter .28s ease, box-shadow .28s ease;
}
.lc-day.is-past {
  background: rgba(69, 188, 193, .12);
  color: #267c80;
}
.lc-day.is-weekend {
  background: #fbfbdc;
}
.lc-day.is-today {
  background: var(--lc-amber);
  color: #342609;
}
.lc-day-current {
  position: relative;
  z-index: 1;
  width: 100%;
  overflow: visible;
  isolation: isolate;
  border: 0;
  padding: 0;
  font: inherit;
  cursor: pointer;
}

.lc-current-button,
.lc-retirement-marker,
.lc-day-current {
  --lc-breathe-color: var(--lc-amber);
  animation: lc-breathe-glow 3.2s cubic-bezier(.45, .05, .25, 1) infinite;
}
.lc-retirement-marker {
  --lc-breathe-color: var(--lc-retire-deep);
}
.lc-current-button::before,
.lc-retirement-marker::before,
.lc-day-current::before {
  content: "";
  position: absolute;
  z-index: -1;
  inset: -10px;
  border-radius: inherit;
  background: color-mix(in srgb, var(--lc-breathe-color) 38%, transparent);
  filter: blur(12px);
  pointer-events: none;
  animation: lc-breathe-halo 3.2s cubic-bezier(.45, .05, .25, 1) infinite;
}
.lc-day-current:hover {
  filter: saturate(1.07) brightness(1.02);
}
.lc-day-current:focus-visible {
  outline: 3px solid var(--lc-amber-deep);
  outline-offset: 3px;
}
.lc-month-panel {
  align-self: stretch;
  display: flex;
  flex-direction: column;
  border-left: 1px solid var(--lc-line);
  padding-left: 27px;
}
.lc-month-panel-label {
  color: #9a785f;
  font-size: 9px;
  font-weight: 850;
  letter-spacing: .16em;
  text-transform: uppercase;
}
.lc-month-fraction {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin: 14px 0 4px;
}
.lc-month-fraction strong {
  font-family: "Iowan Old Style", "Songti SC", serif;
  font-size: 64px;
  line-height: .86;
  letter-spacing: -.06em;
}
.lc-month-fraction span {
  color: var(--lc-muted);
  font-size: 13px;
  font-weight: 700;
}
.lc-month-panel p {
  margin: 5px 0 16px;
  color: var(--lc-muted);
  font-size: 10px;
  line-height: 1.65;
}
.lc-month-progress {
  height: 5px;
  overflow: hidden;
  border-radius: 999px;
  background: #ebe9e6;
}
.lc-month-progress i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--lc-amber);
}
.lc-month-details {
  display: grid;
  gap: 10px;
  margin: 24px 0 0;
  padding: 18px 0 0;
  border-top: 1px solid var(--lc-line);
}
.lc-month-details div {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}
.lc-month-details dt {
  color: var(--lc-faint);
  font-size: 9px;
  font-weight: 700;
}
.lc-month-details dd {
  margin: 0;
  color: var(--lc-ink);
  font-size: 10px;
  font-weight: 800;
}
.lc-footnote {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin: 10px 4px 0;
  color: var(--lc-faint);
  font-size: 7px;
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
}
@keyframes lc-modal-fade {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes lc-dialog-in {
  from {
    opacity: 0;
    transform: translateY(14px) scale(.985);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
@keyframes lc-rise {
  from { opacity: 0; transform: translateY(13px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes lc-breathe-glow {
  0%, 100% {
    box-shadow:
      0 0 0 1px color-mix(in srgb, var(--lc-breathe-color) 52%, var(--lc-paper)),
      0 0 0 3px color-mix(in srgb, var(--lc-breathe-color) 32%, transparent),
      0 4px 15px color-mix(in srgb, var(--lc-breathe-color) 12%, transparent),
      0 0 9px color-mix(in srgb, var(--lc-breathe-color) 9%, transparent);
  }
  50% {
    box-shadow:
      0 0 0 1px color-mix(in srgb, var(--lc-breathe-color) 68%, var(--lc-paper)),
      0 0 0 5px color-mix(in srgb, var(--lc-breathe-color) 48%, transparent),
      0 9px 28px color-mix(in srgb, var(--lc-breathe-color) 32%, transparent),
      0 0 18px color-mix(in srgb, var(--lc-breathe-color) 22%, transparent);
  }
}
@keyframes lc-breathe-halo {
  0%, 100% {
    opacity: .2;
    transform: scale(.98);
  }
  50% {
    opacity: .64;
    transform: scale(1.045);
  }
}
@media (max-width: 1080px) {
  .lc-settings-fields { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .lc-grid { grid-template-columns: repeat(8, minmax(0, 1fr)); }
  .lc-calendar-body { grid-template-columns: minmax(0, 1fr) 176px; }
  .lc-month-body { grid-template-columns: minmax(0, 1fr) 190px; }
}
@media (max-width: 760px) {
  .lc-page { padding-top: 26px; }
  .lc-settings-overlay { padding: 14px; }
  .lc-settings { max-height: calc(100dvh - 28px); }
  .lc-settings-title-row { display: block; }
  .lc-settings-summary { flex-wrap: wrap; margin-top: 14px; }
  .lc-settings-fields { grid-template-columns: 1fr; }
  .lc-settings-fields .lc-age-mode { max-width: none; }
  .lc-base-stage-list.is-settings { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .lc-custom-row {
    grid-template-columns:
      16px 18px minmax(0, 1fr) 76px 9px
      minmax(0, 1fr) 18px;
    grid-template-areas:
      "handle color name display . . remove"
      ". . start start dash end end";
    row-gap: 6px;
  }
  .lc-custom-row .lc-drag-handle { grid-area: handle; }
  .lc-custom-row .lc-color-input { grid-area: color; }
  .lc-custom-row .is-name { grid-area: name; }
  .lc-custom-row .is-display { grid-area: display; }
  .lc-custom-row .is-start-month { grid-area: start; }
  .lc-custom-row .lc-range-dash { grid-area: dash; }
  .lc-custom-row .is-end-month { grid-area: end; }
  .lc-custom-row .lc-remove-type { grid-area: remove; }
  .lc-settings-actions {
    align-items: stretch;
    flex-direction: column;
  }
  .lc-settings-actions .lc-save { width: 100%; }
  .lc-calendar-body { grid-template-columns: 1fr; }
  .lc-stage-panel {
    border-top: 1px solid var(--lc-line);
    border-left: 0;
    padding: 13px 14px 14px;
  }
  .lc-stage-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    max-height: none;
  }
  .lc-grid { grid-template-columns: repeat(5, minmax(0, 1fr)); }
  .lc-card-head { display: block; }
  .lc-card-stats {
    justify-content: flex-start;
    margin-top: 14px;
    text-align: left;
  }
  .lc-life-budget-key {
    gap: 5px 10px;
  }
  .lc-grid-footer { align-items: flex-start; flex-direction: column; }
  .lc-month-heading { display: block; }
  .lc-month-stamp {
    display: flex;
    align-items: baseline;
    justify-items: start;
    gap: 8px;
    margin-top: 15px;
  }
  .lc-month-stamp strong { font-size: 31px; }
  .lc-month-body { grid-template-columns: 1fr; }
  .lc-month-panel {
    border-top: 1px solid var(--lc-line);
    border-left: 0;
    padding-top: 20px;
    padding-left: 0;
  }
  .lc-month-details { grid-template-columns: 1fr 1fr; gap: 14px; }
  .lc-footnote { display: none; }
}
@media (max-width: 430px) {
  .lc-shell::before { width: 23rem; height: 22rem; }
  .lc-page { padding-inline: 13px; }
  .lc-life-budget { margin-inline: 14px; }
  .lc-life-budget-key {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    margin-inline: 14px;
  }
  .lc-life-budget-key > button { min-width: 0; }
  .lc-settings-head,
  .lc-settings-form { padding-inline: 16px; }
  .lc-settings-dialog .lc-custom-types { padding: 12px; }
  .lc-grid { gap: 7px; padding-inline: 14px; }
  .lc-cell-number { font-size: 16px; }
  .lc-cell-year { font-size: 9px; }
  .lc-grid-footer { padding-inline: 16px; }
  .lc-stage-list { grid-template-columns: 1fr; }
  .lc-month-body { padding-inline: 14px; }
  .lc-month-table { border-spacing: 4px; }
  .lc-day { border-radius: 9px; }
}
@media (prefers-reduced-motion: reduce) {
  .lc-settings-overlay,
  .lc-settings,
  .lc-stage,
  .lc-current-button,
  .lc-current-button::before,
  .lc-day-current,
  .lc-day-current::before,
  .lc-retirement-marker,
  .lc-retirement-marker::before { animation: none; }
  .lc-cell,
  .lc-save,
  .lc-life-budget > span { transition: none; }
}
html.dark .lc-shell {
  --lc-ink: #e7e2d7;
  --lc-muted: #a29b8e;
  --lc-faint: #7d776c;
  --lc-peach: #3a2c26;
  --lc-peach-deep: #4a352c;
  --lc-paper: #221e1a;
  --lc-warm: #292420;
  --lc-line: #3a332b;
  --lc-teal: #4fc3c8;
  --lc-teal-deep: #6fd0d4;
  --lc-amber: #e9b53f;
  --lc-amber-deep: #f0c05a;
  --lc-future: #2b2925;
  --lc-retire: #a5d18b;
  --lc-retire-deep: #86c46a;
  --lc-sleep: #a892d8;
  --lc-work: #7ba2c8;
  --lc-free-before: #a8d68a;
  --lc-free-stripe: #79a879;
  --lc-shadow: 0 28px 80px rgba(0, 0, 0, .45);
  background:
    radial-gradient(ellipse 52% 45% at 0% 0%, rgba(92, 64, 51, .42) 0 62%, transparent 100%),
    radial-gradient(ellipse 38% 42% at 100% 100%, rgba(92, 64, 51, .3) 0 64%, transparent 100%),
    linear-gradient(145deg, #221e1a, #262019 55%, #23201c);
}
@media (prefers-color-scheme: dark) {
  html:not(.light) .lc-shell {
    --lc-ink: #e7e2d7;
    --lc-muted: #a29b8e;
    --lc-faint: #7d776c;
    --lc-peach: #3a2c26;
    --lc-peach-deep: #4a352c;
    --lc-paper: #221e1a;
    --lc-warm: #292420;
    --lc-line: #3a332b;
    --lc-teal: #4fc3c8;
    --lc-teal-deep: #6fd0d4;
    --lc-amber: #e9b53f;
    --lc-amber-deep: #f0c05a;
    --lc-future: #2b2925;
    --lc-retire: #a5d18b;
    --lc-retire-deep: #86c46a;
    --lc-sleep: #a892d8;
    --lc-work: #7ba2c8;
    --lc-free-before: #a8d68a;
    --lc-free-stripe: #79a879;
    --lc-shadow: 0 28px 80px rgba(0, 0, 0, .45);
    background:
      radial-gradient(ellipse 52% 45% at 0% 0%, rgba(92, 64, 51, .42) 0 62%, transparent 100%),
      radial-gradient(ellipse 38% 42% at 100% 100%, rgba(92, 64, 51, .3) 0 64%, transparent 100%),
      linear-gradient(145deg, #221e1a, #262019 55%, #23201c);
  }
}
html.dark .lc-shell::before { background: rgba(126, 84, 64, .22); }
html.dark .lc-shell::after { background: rgba(126, 84, 64, .16); }
html.dark .lc-settings-overlay { background: rgba(8, 6, 5, .55); }
html.dark .lc-settings { border-color: rgba(231, 226, 215, .1); background: rgba(34, 30, 26, .98); box-shadow: 0 28px 90px rgba(0, 0, 0, .55); }
html.dark .lc-settings-close:hover, html.dark .lc-input:hover, html.dark .lc-settings-open:hover { border-color: #6b5d4e; }
html.dark .lc-settings-head span { color: #cf9b79; }
html.dark .lc-save, html.dark .lc-empty-settings { background: #e7e2d7; color: #20272a; }
html.dark .lc-save:hover:not(:disabled), html.dark .lc-empty-settings:hover { background: #d8d3c6; }
html.dark .lc-age-mode { background: rgba(255, 253, 250, .08); }
html.dark .lc-age-mode i { background: #5a5147; }
html.dark .lc-age-mode i::after { background: #e7e2d7; box-shadow: 0 1px 4px rgba(0, 0, 0, .45); }
html.dark .lc-custom-types { border-top-color: #3a332b; }
html.dark .lc-settings-dialog .lc-custom-types, html.dark .lc-default-types { background: rgba(255, 253, 250, .05); }
html.dark .lc-drag-handle { color: #8a8378; }
html.dark .lc-remove-type:hover:not(:disabled) { color: #e08a75; }
html.dark .lc-error { border-color: rgba(224, 138, 117, .35); background: #33201c; color: #e8a08d; }
html.dark .lc-warning { border-color: rgba(224, 175, 84, .35); background: #2e2717; color: #dfb566; }
html.dark .lc-success { border-color: rgba(130, 196, 132, .35); background: #1c291c; color: #9bcb9d; }
html.dark .lc-calendar-card, html.dark .lc-month-card { border-color: rgba(231, 226, 215, .08); background: rgba(30, 27, 23, .96); }
html.dark .lc-card-kicker, html.dark .lc-stage-panel-head span, html.dark .lc-month-panel-label { color: #cf9b79; }
html.dark .lc-card-count { background: rgba(255, 253, 250, .06); }
html.dark .lc-settings-open { background: rgba(255, 253, 250, .08); }
html.dark .lc-life-budget { box-shadow: 0 0 0 1px #3a332b, inset 0 1px 0 rgba(255, 255, 255, .12); }
html.dark .lc-cell { color: #e6e2d8; }
html.dark .lc-cell-year { color: rgba(235, 231, 220, .72); }
html.dark .lc-current-hint { color: #dfb566; }
html.dark .lc-empty { border-color: #4a3f33; background: #292420; }
html.dark .lc-loading { border-color: rgba(231, 226, 215, .08); background: rgba(30, 27, 23, .86); }
html.dark .lc-day { background: #2b2925; color: #a29b8e; }
html.dark .lc-day.is-past { background: rgba(79, 195, 200, .16); color: #6fd0d4; }
html.dark .lc-day.is-weekend { background: #312c1d; }
html.dark .lc-month-progress { background: #3a332b; }
`;
