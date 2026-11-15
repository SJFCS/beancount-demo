export const LOCAL_CONFIG_STYLES = `
.lc-shell {
  min-height: 100%;
  overflow-y: auto;
  container: local-config / inline-size;
  color: var(--foreground);
  background:
    radial-gradient(circle at 12% 0%, color-mix(in srgb, var(--primary) 10%, transparent), transparent 34rem),
    var(--background);
}

.lc-page {
  width: min(1320px, calc(100% - 40px));
  margin: 0 auto;
  padding: 34px 0 52px;
}

.lc-hero {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 32px;
  margin-bottom: 24px;
}

.lc-eyebrow {
  color: var(--muted-foreground);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .16em;
  text-transform: uppercase;
}

.lc-title {
  margin: 8px 0 10px;
  font-size: clamp(32px, 5vw, 54px);
  font-weight: 650;
  letter-spacing: -.045em;
  line-height: 1;
}

.lc-title em {
  color: var(--primary);
  font-family: ui-serif, Georgia, serif;
  font-weight: 500;
}

.lc-lede {
  max-width: 680px;
  margin: 0;
  color: var(--muted-foreground);
  font-size: 14px;
  line-height: 1.75;
}

.lc-file-badge {
  display: grid;
  min-width: 240px;
  gap: 4px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: color-mix(in srgb, var(--card) 90%, transparent);
  padding: 14px 16px;
  box-shadow: 0 14px 40px color-mix(in srgb, black 8%, transparent);
}

.lc-file-badge span {
  color: var(--muted-foreground);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .12em;
  text-transform: uppercase;
}

.lc-file-badge code {
  overflow-wrap: anywhere;
  font-size: 13px;
  font-weight: 650;
}

.lc-message {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin: 12px 0;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px 14px;
  font-size: 13px;
  line-height: 1.55;
}

.lc-message strong {
  flex: 0 0 auto;
}

.lc-message.is-error {
  border-color: color-mix(in srgb, var(--destructive) 45%, var(--border));
  background: color-mix(in srgb, var(--destructive) 9%, var(--background));
  color: var(--destructive);
}

.lc-message.is-warning {
  border-color: color-mix(in srgb, #d89216 45%, var(--border));
  background: color-mix(in srgb, #d89216 9%, var(--background));
}

.lc-message.is-success {
  border-color: color-mix(in srgb, #218c62 45%, var(--border));
  background: color-mix(in srgb, #218c62 9%, var(--background));
  color: color-mix(in srgb, #218c62 76%, var(--foreground));
}

.lc-toast {
  position: fixed;
  right: max(24px, env(safe-area-inset-right));
  bottom: max(24px, env(safe-area-inset-bottom));
  z-index: 80;
  width: min(360px, calc(100vw - 32px));
  align-items: center;
  margin: 0;
  background: color-mix(in srgb, var(--card) 94%, #218c62 6%);
  box-shadow:
    0 18px 48px color-mix(in srgb, black 18%, transparent),
    0 2px 8px color-mix(in srgb, black 8%, transparent);
  animation: lc-toast-in .18s ease-out;
  pointer-events: none;
}

@keyframes lc-toast-in {
  from {
    opacity: 0;
    transform: translateY(8px) scale(.985);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.lc-tabs {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 14px 0 18px;
  border-bottom: 1px solid var(--border);
  padding-bottom: 10px;
}

.lc-tabs > button[role="tab"] {
  position: relative;
  min-height: 38px;
  border: 1px solid transparent;
  border-radius: 9px;
  background: transparent;
  padding: 0 14px;
  color: var(--muted-foreground);
  font: inherit;
  font-size: 13px;
  font-weight: 650;
  cursor: pointer;
}

.lc-tabs > button[role="tab"][aria-selected="true"] {
  border-color: var(--border);
  background: var(--card);
  color: var(--foreground);
  box-shadow: 0 6px 18px color-mix(in srgb, black 6%, transparent);
}

.lc-tabs > button[role="tab"] i {
  position: absolute;
  top: 7px;
  right: 7px;
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: #d89216;
}

.lc-tabs > span {
  flex: 1;
}

.lc-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.lc-summary span {
  display: inline-flex;
  align-items: baseline;
  gap: 5px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: color-mix(in srgb, var(--card) 80%, transparent);
  padding: 5px 11px;
  color: var(--muted-foreground);
  font-size: 11px;
}

.lc-summary strong {
  color: var(--foreground);
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}

.lc-management {
  display: grid;
  grid-template-columns: minmax(320px, 390px) minmax(0, 1fr);
  gap: 16px;
  align-items: start;
}

.lc-plugin-list,
.lc-plugin-detail {
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 16px;
  background: var(--card);
  box-shadow: 0 18px 55px color-mix(in srgb, black 7%, transparent);
}

.lc-plugin-list > header,
.lc-detail-head,
.lc-detail-settings > header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  border-bottom: 1px solid var(--border);
  padding: 16px;
}

.lc-plugin-list > header span,
.lc-detail-head > div > span,
.lc-detail-settings > header span {
  color: var(--muted-foreground);
  font-size: 9px;
  font-weight: 750;
  letter-spacing: .14em;
  text-transform: uppercase;
}

.lc-plugin-list h2,
.lc-detail-head h2,
.lc-detail-settings h3 {
  margin: 3px 0 0;
  font-size: 18px;
  font-weight: 680;
  letter-spacing: -.025em;
}

.lc-plugin-list > header small {
  max-width: 150px;
  color: var(--muted-foreground);
  font-size: 10px;
  line-height: 1.5;
  text-align: right;
}

.lc-plugin-scroll {
  display: grid;
  grid-auto-rows: max-content;
  max-height: min(70vh, 760px);
  overflow-y: auto;
  padding: 8px;
}

.lc-plugin-item {
  position: relative;
  border: 1px solid transparent;
  border-radius: 12px;
  padding: 4px;
  transition:
    border-color .16s ease,
    background .16s ease,
    box-shadow .16s ease,
    opacity .16s ease,
    transform .16s ease;
}

.lc-plugin-item + .lc-plugin-item {
  margin-top: 3px;
}

.lc-plugin-item:hover {
  background: color-mix(in srgb, var(--primary) 4%, transparent);
}

.lc-plugin-item[data-selected="true"] {
  border-color: color-mix(in srgb, var(--primary) 35%, var(--border));
  background: color-mix(in srgb, var(--primary) 8%, var(--card));
}

.lc-plugin-item[data-draggable="true"] {
  cursor: grab;
}

.lc-plugin-item[data-draggable="true"]:active {
  cursor: grabbing;
}

.lc-plugin-item[data-dragging="true"] {
  opacity: .48;
  transform: scale(.985);
}

.lc-plugin-item::before,
.lc-plugin-item::after {
  position: absolute;
  right: 10px;
  left: 10px;
  z-index: 2;
  height: 3px;
  border-radius: 999px;
  background: var(--primary);
  box-shadow:
    0 0 0 2px color-mix(in srgb, var(--background) 88%, transparent),
    0 2px 8px color-mix(in srgb, var(--primary) 38%, transparent);
  content: "";
  opacity: 0;
  pointer-events: none;
}

.lc-plugin-item[data-drop-position="before"]::before {
  top: -5px;
  opacity: 1;
}

.lc-plugin-item[data-drop-position="after"]::after {
  bottom: -5px;
  opacity: 1;
}

.lc-plugin-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 7px;
  min-width: 0;
}

.lc-plugin-select {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr);
  align-items: center;
  gap: 10px;
  width: 100%;
  border: 0;
  border-radius: 9px;
  background: transparent;
  padding: 8px;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.lc-plugin-item[data-draggable="true"] .lc-plugin-select {
  cursor: grab;
}

.lc-plugin-select:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 1px;
}

.lc-plugin-mark {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--primary) 25%, var(--border));
  border-radius: 10px;
  background: color-mix(in srgb, var(--primary) 9%, var(--background));
  color: var(--primary);
  font: 600 14px/1 ui-serif, Georgia, serif;
}

.lc-plugin-copy {
  display: grid;
  min-width: 0;
  gap: 2px;
}

.lc-plugin-copy strong {
  overflow: hidden;
  font-size: 13px;
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lc-plugin-copy small {
  overflow: hidden;
  color: var(--muted-foreground);
  font: 10px/1.4 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lc-plugin-statuses {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 6px;
  max-width: 190px;
  padding-right: 5px;
}

.lc-status-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 28px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--background);
  padding: 0 10px;
  color: var(--muted-foreground);
  font: inherit;
  font-size: 9px;
  font-weight: 650;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  transition:
    border-color .16s ease,
    background .16s ease,
    color .16s ease,
    box-shadow .16s ease;
}

.lc-status-toggle[data-on="true"] {
  border-color: color-mix(in srgb, #218c62 42%, var(--border));
  background: color-mix(in srgb, #218c62 9%, var(--background));
  color: color-mix(in srgb, #218c62 78%, var(--foreground));
  box-shadow: inset 0 0 0 1px color-mix(in srgb, #218c62 6%, transparent);
}

.lc-status-toggle[data-on="false"]:hover:not(:disabled) {
  border-color: color-mix(in srgb, var(--primary) 48%, var(--border));
  background: color-mix(in srgb, var(--primary) 8%, var(--background));
  color: var(--primary);
}

.lc-status-toggle[data-on="true"]:hover:not(:disabled) {
  border-color: color-mix(in srgb, #218c62 62%, var(--border));
  background: color-mix(in srgb, #218c62 14%, var(--background));
  color: color-mix(in srgb, #218c62 84%, var(--foreground));
}

.lc-status-toggle:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}

.lc-status-toggle:disabled {
  cursor: not-allowed;
  opacity: .45;
}

.lc-plugin-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 22px;
  padding: 1px 8px 4px 52px;
  color: var(--muted-foreground);
  font-size: 9px;
  line-height: 1.4;
}

.lc-plugin-footer em {
  flex: 0 0 auto;
  color: #d89216;
  font-style: normal;
}

.lc-detail-head p {
  max-width: 620px;
  margin: 6px 0 0;
  color: var(--muted-foreground);
  font-size: 12px;
  line-height: 1.65;
}

.lc-detail-state {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 5px;
}

.lc-detail-basics {
  display: grid;
  gap: 8px;
  padding: 14px 16px;
}

.lc-field-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  min-height: 48px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: color-mix(in srgb, var(--background) 55%, transparent);
  padding: 8px 11px;
}

.lc-field-row > span:first-child {
  display: grid;
  min-width: 0;
  gap: 2px;
}

.lc-field-row strong {
  font-size: 12px;
  font-weight: 650;
}

.lc-field-row small {
  overflow-wrap: anywhere;
  color: var(--muted-foreground);
  font: 9px/1.45 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}

.lc-field-row > code {
  overflow-wrap: anywhere;
  color: var(--muted-foreground);
  font-size: 10px;
}

.lc-field-input {
  min-width: 150px;
  min-height: 32px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--background);
  padding: 5px 9px;
  color: var(--foreground);
  font: 11px/1.45 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}

.lc-field-input.is-number {
  width: 96px;
  min-width: 0;
}

.lc-position-control {
  display: flex;
  align-items: center;
  gap: 6px;
}

.lc-switch {
  position: relative;
  display: inline-flex;
  flex: 0 0 auto;
  width: 34px;
  height: 20px;
}

.lc-switch input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
}

.lc-switch i {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: color-mix(in srgb, var(--muted-foreground) 15%, var(--background));
  transition: background .16s ease, border-color .16s ease;
}

.lc-switch i::after {
  display: block;
  width: 14px;
  height: 14px;
  margin: 2px;
  border-radius: 999px;
  background: var(--foreground);
  content: "";
  transition: transform .16s ease;
}

.lc-switch input:checked + i {
  border-color: var(--primary);
  background: var(--primary);
}

.lc-switch input:checked + i::after {
  background: var(--primary-foreground);
  transform: translateX(14px);
}

.lc-switch input:focus-visible + i {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}

.lc-switch input:disabled + i {
  opacity: .45;
}

.lc-detail-settings {
  border-top: 1px solid var(--border);
}

.lc-detail-settings > header {
  align-items: center;
}

.lc-detail-settings > header code {
  color: var(--muted-foreground);
  font-size: 10px;
}

.lc-setting-grid {
  display: grid;
  gap: 8px;
  padding: 14px 16px 18px;
}

.lc-setting-section {
  display: grid;
  gap: 8px;
  margin: 0;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 10px;
}

.lc-setting-section legend {
  padding: 0 5px;
  color: var(--muted-foreground);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.lc-setting-section .lc-setting-grid {
  padding: 0;
}

.lc-empty-settings,
.lc-detail-empty {
  margin: 0;
  padding: 28px 16px;
  color: var(--muted-foreground);
  font-size: 12px;
  text-align: center;
}

.lc-workspace {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 260px;
  gap: 18px;
  align-items: start;
}

.lc-editor-card {
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 16px;
  background: var(--card);
  box-shadow: 0 18px 55px color-mix(in srgb, black 8%, transparent);
}

.lc-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 52px;
  border-bottom: 1px solid var(--border);
  padding: 8px 10px 8px 16px;
}

.lc-state {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: var(--muted-foreground);
  font-size: 12px;
  font-weight: 600;
}

.lc-state::before {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: #218c62;
  content: "";
  box-shadow: 0 0 0 3px color-mix(in srgb, #218c62 16%, transparent);
}

.lc-state[data-dirty="true"]::before {
  background: #d89216;
  box-shadow: 0 0 0 3px color-mix(in srgb, #d89216 16%, transparent);
}

.lc-toolbar-spacer {
  flex: 1;
}

.lc-search {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-height: 32px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--background);
  padding: 0 4px 0 9px;
}

.lc-search input {
  width: min(230px, 27vw);
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--foreground);
  font: 11px/1.4 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}

.lc-search-count {
  min-width: 42px;
  color: var(--muted-foreground);
  font-size: 9px;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.lc-search button {
  display: grid;
  width: 24px;
  height: 24px;
  place-items: center;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--muted-foreground);
  font: 700 12px/1 inherit;
  cursor: pointer;
}

.lc-search button:hover:not(:disabled) {
  background: color-mix(in srgb, var(--primary) 9%, transparent);
  color: var(--primary);
}

.lc-search button:disabled {
  cursor: not-allowed;
  opacity: .35;
}

.lc-toolbar-note {
  color: var(--muted-foreground);
  font-size: 10px;
}

.lc-button {
  min-height: 34px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--background);
  padding: 0 14px;
  color: var(--foreground);
  font: inherit;
  font-size: 12px;
  font-weight: 650;
  cursor: pointer;
}

.lc-button:hover:not(:disabled) {
  border-color: color-mix(in srgb, var(--primary) 50%, var(--border));
  background: color-mix(in srgb, var(--primary) 7%, var(--background));
}

.lc-button.is-primary {
  border-color: var(--primary);
  background: var(--primary);
  color: var(--primary-foreground);
}

.lc-button.is-primary:hover:not(:disabled) {
  border-color: color-mix(in srgb, var(--primary) 86%, #000);
  background: color-mix(in srgb, var(--primary) 88%, #000);
  color: var(--primary-foreground);
}

.lc-button:focus-visible,
.lc-editor-input:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}

.lc-button:disabled {
  cursor: not-allowed;
  opacity: .48;
}

.lc-button.is-primary:disabled {
  border-color: color-mix(in srgb, var(--primary) 38%, var(--border));
  background: color-mix(in srgb, var(--primary) 12%, var(--background));
  color: color-mix(in srgb, var(--primary) 72%, var(--foreground));
  opacity: 1;
}

.lc-editor {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  height: min(64vh, 720px);
  min-height: 440px;
  background: color-mix(in srgb, #0d1117 96%, var(--card));
}

.lc-lines {
  overflow: hidden;
  border-right: 1px solid #ffffff12;
  padding: 18px 12px;
  color: #7d8590;
  font: 13px/1.7 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  text-align: right;
  user-select: none;
}

.lc-lines-inner {
  display: flex;
  flex-direction: column;
}

.lc-editor-input {
  width: 100%;
  height: 100%;
  resize: none;
  border: 0;
  outline: 0;
  background: transparent;
  padding: 18px 20px;
  color: #e6edf3;
  caret-color: #7ee787;
  font: 13px/1.7 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  tab-size: 2;
  white-space: pre;
}

.lc-editor-input::selection {
  background: #264f78;
}

.lc-side {
  display: grid;
  gap: 12px;
}

.lc-card {
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--card);
  padding: 16px;
}

.lc-card h2 {
  margin: 0 0 10px;
  font-size: 13px;
  font-weight: 700;
}

.lc-card p {
  margin: 0;
  color: var(--muted-foreground);
  font-size: 12px;
  line-height: 1.7;
}

.lc-card ul {
  display: grid;
  gap: 9px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.lc-card li {
  position: relative;
  padding-left: 16px;
  color: var(--muted-foreground);
  font-size: 12px;
  line-height: 1.55;
}

.lc-card li::before {
  position: absolute;
  top: .62em;
  left: 2px;
  width: 5px;
  height: 5px;
  border-radius: 999px;
  background: var(--primary);
  content: "";
}

.lc-kbd {
  display: inline-flex;
  min-width: 22px;
  justify-content: center;
  border: 1px solid var(--border);
  border-bottom-width: 2px;
  border-radius: 5px;
  background: var(--background);
  padding: 1px 5px;
  color: var(--foreground);
  font: 11px/1.5 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}

.lc-loading {
  display: grid;
  min-height: 360px;
  place-items: center;
  border: 1px solid var(--border);
  border-radius: 16px;
  background: var(--card);
  color: var(--muted-foreground);
  font-size: 13px;
}

@media (max-width: 900px) {
  .lc-management {
    grid-template-columns: 1fr;
  }

  .lc-plugin-scroll {
    max-height: 390px;
  }

  .lc-workspace {
    grid-template-columns: 1fr;
  }

  .lc-side {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .lc-page {
    width: min(100% - 24px, 1180px);
    padding-top: 22px;
  }

  .lc-toast {
    right: 12px;
    bottom: 12px;
    left: 12px;
    width: auto;
  }

  .lc-hero {
    align-items: flex-start;
    flex-direction: column;
    gap: 18px;
  }

  .lc-file-badge {
    width: 100%;
  }

  .lc-toolbar {
    align-items: stretch;
    flex-wrap: wrap;
  }

  .lc-toolbar-spacer {
    display: none;
  }

  .lc-button {
    flex: 1;
  }

  .lc-tabs {
    align-items: stretch;
    flex-wrap: wrap;
  }

  .lc-tabs > span {
    display: none;
  }

  .lc-tabs > button {
    flex: 1;
  }

  .lc-plugin-row {
    grid-template-columns: minmax(0, 1fr) auto;
  }

  .lc-plugin-statuses {
    max-width: 150px;
  }

  .lc-field-row {
    align-items: flex-start;
    flex-direction: column;
  }

  .lc-field-row > .lc-switch,
  .lc-field-row > .lc-field-input,
  .lc-field-row > .lc-position-control {
    align-self: stretch;
  }

  .lc-field-input,
  .lc-field-input.is-number {
    width: 100%;
  }

  .lc-editor {
    height: 62vh;
    min-height: 380px;
  }

  .lc-lines {
    padding-inline: 8px;
  }

  .lc-side {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .lc-toast {
    animation: none;
  }
}
`;
