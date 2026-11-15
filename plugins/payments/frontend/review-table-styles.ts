export const reviewTableStyles = `
.payments-plugin .pm-visually-hidden{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
.payments-plugin .pm-queue-card .pm-scroll{padding:0;max-height:68vh}
.payments-plugin .pm-scroll .pm-review-table{--pm-state-width:72px;--pm-review-min-width:196px;--pm-cell-inset:24px;--pm-account-width:300px;--pm-mapping-width:720px;--pm-mapping-columns:minmax(0,1fr) minmax(0,300px);--pm-mapping-gap:24px;width:100%;max-width:none;min-width:800px;table-layout:fixed;border-collapse:separate;border-spacing:0;font-size:12px}
.payments-plugin .pm-review-table .pm-col-state{width:var(--pm-state-width)}
.payments-plugin .pm-review-table .pm-col-mapping{width:min(calc(var(--pm-mapping-width) + var(--pm-cell-inset)),calc(100% - var(--pm-state-width) - var(--pm-review-min-width)))}
.payments-plugin .pm-review-table .pm-col-review{width:auto}
.payments-plugin .pm-review-table .pm-col-review .pm-column-heading{justify-content:flex-start;flex-wrap:wrap}
.payments-plugin .pm-review-table .pm-table-search{flex:1 1 120px;width:auto;min-width:min(100%,120px);max-width:390px;margin-left:auto}
.payments-plugin .pm-review-table .pm-table-search input[type=search]{box-sizing:border-box;min-height:28px;padding:5px 22px 5px 25px;border-radius:6px;font-size:11px;font-weight:400;line-height:1.5}
.payments-plugin .pm-review-table .pm-table-search-icon{left:8px;font-size:14px}
.payments-plugin .pm-scroll .pm-review-table thead th{height:46px;min-width:0;padding:8px 12px;border:0;border-bottom:1px solid var(--pm-border);border-radius:0;background:var(--background);color:color-mix(in srgb,currentColor 68%,transparent);font-size:11px;font-weight:550;letter-spacing:0;white-space:nowrap;box-shadow:none}
.payments-plugin .pm-scroll .pm-review-table thead th:first-child{padding-inline:8px}
.payments-plugin .pm-scroll .pm-review-table .pm-header-fields th{position:sticky;top:0;z-index:8}
.payments-plugin .pm-scroll .pm-review-table .pm-header-fields th:first-child{left:0;z-index:10}
.payments-plugin .pm-review-table .pm-column-heading{display:flex;align-items:center;justify-content:space-between;gap:6px;width:100%;min-width:0}
.payments-plugin .pm-review-table .pm-column-heading>span{flex:0 0 auto;overflow:visible;white-space:nowrap;text-overflow:clip}
.payments-plugin .pm-review-table .pm-col-state .pm-column-heading{justify-content:center;gap:3px}
.payments-plugin .pm-review-table .pm-selection-heading label{gap:0}
.payments-plugin .pm-review-table .pm-filter-trigger{display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;width:24px;height:26px;min-height:26px;padding:3px!important;border:0;border-radius:5px;background:transparent;color:color-mix(in srgb,currentColor 45%,transparent);font-size:10px}
.payments-plugin .pm-review-table .pm-filter-trigger:hover,
.payments-plugin .pm-review-table .pm-filter-trigger[aria-expanded=true]{background:color-mix(in srgb,currentColor 6%,transparent);color:var(--foreground)}
.payments-plugin .pm-review-table .pm-filter-trigger.pm-filter-active{width:auto;min-width:24px;color:var(--pm-accent);background:var(--pm-accent-soft)}
.payments-plugin .pm-review-table .pm-filter-count{min-width:13px;margin-left:2px;padding:0 2px;font-size:9px}
.payments-plugin .pm-filter-popover .pm-search-select-trigger:focus-within{outline:0}
.payments-plugin .pm-filter-popover .pm-search-select-trigger:focus-visible{border-color:color-mix(in srgb,currentColor 45%,transparent)}
.payments-plugin .pm-filter-popover .pm-search-select-menu-inline{position:static;inset:auto;width:100%;max-width:none;max-height:320px;margin-top:7px;border-radius:8px;box-shadow:none}
.payments-plugin .pm-filter-popover .pm-search-select-menu-inline .pm-search-select-footer{flex-wrap:wrap;gap:5px}
.payments-plugin .pm-filter-popover .pm-search-select-menu-inline .pm-search-select-footer button{padding:4px 6px;font-size:11px}
.payments-plugin .pm-source-filter-popover{overflow:hidden}
.payments-plugin .pm-source-filter-popover:popover-open{display:flex;flex-direction:column}
.payments-plugin .pm-source-filter-popover>.pm-filter-title,.payments-plugin .pm-source-filter-popover>.pm-filter-footer{flex:0 0 auto}
.payments-plugin .pm-source-filter-tabs{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));flex:0 0 auto;gap:3px;padding:3px;margin-bottom:10px;border-radius:8px;background:color-mix(in srgb,currentColor 5%,transparent)}
.payments-plugin .pm-source-filter-tabs button{display:flex;align-items:center;justify-content:center;gap:4px;min-height:30px;padding:5px 3px!important;border:0!important;border-radius:6px;background:transparent;color:color-mix(in srgb,currentColor 60%,transparent);font-size:11px!important;white-space:nowrap}
.payments-plugin .pm-source-filter-tabs button[aria-pressed=true]{background:var(--background);color:var(--pm-accent);box-shadow:0 1px 4px #0001;font-weight:600}
.payments-plugin .pm-source-filter-tabs button>span{display:inline-grid;place-items:center;min-width:14px;height:14px;padding-inline:2px;border-radius:4px;background:var(--pm-accent-soft);color:var(--pm-accent);font-size:9px;font-variant-numeric:tabular-nums}
.payments-plugin .pm-source-filter-body{flex:1 1 auto;min-height:0;overflow-y:auto;overscroll-behavior:contain;scrollbar-gutter:stable;padding:3px 4px 3px 3px}
.payments-plugin .pm-source-filter-body .pm-filter-group{min-inline-size:0}
.payments-plugin .pm-source-filter-body .pm-filter-group:first-child{margin-top:0}
.payments-plugin .pm-source-filter-fixed-section{padding-top:2px;margin-top:4px}
.payments-plugin .pm-source-filter-section-heading{display:flex;align-items:center;gap:6px;padding:8px 0 2px;border-top:1px solid color-mix(in srgb,currentColor 10%,transparent);color:color-mix(in srgb,currentColor 68%,transparent);font-size:11px}
.payments-plugin .pm-source-filter-section-heading>strong{font-weight:650}
.payments-plugin .pm-source-filter-section-heading>span{display:inline-grid;place-items:center;min-width:15px;height:15px;padding-inline:3px;border-radius:4px;background:var(--pm-accent-soft);color:var(--pm-accent);font-size:9px;font-variant-numeric:tabular-nums}
.payments-plugin .pm-source-filter-popover .pm-search-select-trigger:focus-visible,.payments-plugin .pm-source-filter-popover input[type=search]:focus-visible{outline:2px solid color-mix(in srgb,var(--pm-accent) 55%,transparent);outline-offset:-2px}
.payments-plugin .pm-range-control{margin:14px 0}
.payments-plugin .pm-range-control[data-kind=expense]{--pm-range-color:#dc2626}
.payments-plugin .pm-range-control[data-kind=income]{--pm-range-color:#15803d}
.payments-plugin .pm-range-control[data-enabled=false]{--pm-range-color:#9ca3af;color:color-mix(in srgb,var(--foreground) 45%,transparent)}
.payments-plugin .pm-range-heading{display:flex;align-items:baseline;justify-content:space-between;flex-wrap:wrap;gap:5px 10px}
.payments-plugin .pm-range-heading strong{font-size:11px;font-weight:550}
.payments-plugin .pm-range-toggle{display:inline-flex;align-items:center;gap:7px;min-height:24px;padding:0!important;border:0!important;background:transparent!important;color:var(--pm-range-color);font-size:11px!important;font-weight:550;white-space:nowrap}
.payments-plugin .pm-range-switch{position:relative;display:block;flex:0 0 26px;width:26px;height:15px;border-radius:999px;background:var(--pm-range-color)}
.payments-plugin .pm-range-switch i{position:absolute;top:2px;left:2px;width:11px;height:11px;border-radius:50%;background:#fff}
.payments-plugin .pm-range-toggle[aria-checked=true] .pm-range-switch i{transform:translateX(11px)}
.payments-plugin .pm-range-selection{color:var(--pm-range-color);font-size:11px;font-variant-numeric:tabular-nums;white-space:nowrap}
.payments-plugin .pm-range-selection:has(.pm-range-number){display:inline-flex;align-items:center;gap:5px;max-width:100%}
.payments-plugin .pm-range-number{display:inline-flex;align-items:center;gap:1px;min-width:0}
.payments-plugin .pm-range-number input[type=number]{box-sizing:border-box;min-width:5ch;max-width:12ch;padding:3px 2px;border:1px solid transparent;border-bottom-color:color-mix(in srgb,var(--pm-range-color) 30%,transparent);border-radius:4px;background:transparent;color:inherit;font:inherit;text-align:right;appearance:textfield;transition:background .15s,border-color .15s}
.payments-plugin .pm-range-number input[type=number]::-webkit-inner-spin-button,.payments-plugin .pm-range-number input[type=number]::-webkit-outer-spin-button{appearance:none;margin:0}
.payments-plugin .pm-range-number input[type=number]:hover:not(:disabled){border-color:color-mix(in srgb,var(--pm-range-color) 25%,transparent);background:color-mix(in srgb,var(--pm-range-color) 5%,var(--background))}
.payments-plugin .pm-range-number input[type=number]:focus-visible{border-color:var(--pm-range-color);outline:2px solid color-mix(in srgb,var(--pm-range-color) 20%,transparent);outline-offset:1px;background:var(--background)}
.payments-plugin .pm-range-control .pm-range-slider{margin-top:6px}
.payments-plugin .pm-range-control[data-disabled=true] .pm-range-slider{opacity:.45}
.payments-plugin .pm-range-slider input:disabled::-webkit-slider-thumb{pointer-events:none;cursor:default}
.payments-plugin .pm-range-slider input:disabled::-moz-range-thumb{pointer-events:none;cursor:default}
.payments-plugin .pm-filter-description{margin:2px 0 10px;color:color-mix(in srgb,currentColor 58%,transparent);font-size:11px;line-height:1.6}
.payments-plugin .pm-review-table .pm-col-state .pm-filter-trigger.pm-filter-active{position:relative;width:24px}
.payments-plugin .pm-review-table .pm-col-state .pm-filter-count{position:absolute;top:-4px;right:-4px;margin:0;border-radius:4px;background:var(--pm-accent-soft)}
.payments-plugin .pm-scroll .pm-review-table tbody tr>td{height:auto;padding:14px 12px!important;border:0;border-bottom:1px solid color-mix(in srgb,var(--pm-flow,var(--pm-accent)) 12%,var(--pm-border));border-radius:0!important;background:color-mix(in srgb,var(--pm-flow,var(--pm-accent)) 4%,var(--background));font-size:12px;vertical-align:top!important;box-shadow:none}
.payments-plugin .pm-scroll .pm-review-table tbody tr:not(.pm-refund-group)>td:first-child{border-left:2px solid color-mix(in srgb,var(--pm-flow) 58%,var(--background))}
.payments-plugin .pm-scroll .pm-review-table tbody tr{background:transparent;outline:0;filter:none}
.payments-plugin .pm-review-table tbody tr[data-collapsed=false]{cursor:pointer}
.payments-plugin .pm-scroll .pm-review-table tbody tr[data-selected=true]>td{background:color-mix(in srgb,var(--pm-flow) 6%,var(--background))}
.payments-plugin .pm-scroll .pm-review-table tbody tr:not(.pm-refund-group):hover>td{background:color-mix(in srgb,var(--pm-flow) 7%,var(--background));border-bottom-color:var(--pm-border)}
.payments-plugin .pm-review-table .pm-row-state{position:sticky;left:0;z-index:3;width:auto;text-align:center!important}
.payments-plugin .pm-scroll .pm-review-table tbody tr>.pm-row-state{padding-inline:8px!important}
.payments-plugin .pm-review-table .pm-row-checkbox{width:16px!important;height:16px;margin:2px auto 6px!important}
.payments-plugin .pm-review-table .pm-row-index{font-size:10px}
.payments-plugin .pm-review-table .pm-row-lock-state{min-height:22px;padding:1px;font-size:9px!important;white-space:normal;line-height:1.5;opacity:.55}
.payments-plugin .pm-review-table .pm-row-actions{display:grid;gap:4px;width:52px;max-width:100%;margin:6px auto 0}
.payments-plugin .pm-review-table .pm-row-action{display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;width:100%;min-height:24px!important;margin:0;padding:3px!important;border:1px solid color-mix(in srgb,currentColor 16%,transparent)!important;border-radius:5px;background:transparent!important;color:color-mix(in srgb,currentColor 58%,transparent);font-size:10px!important;font-weight:500!important;line-height:1.4;white-space:nowrap}
.payments-plugin .pm-review-table .pm-row-action:hover:not(:disabled){border-color:color-mix(in srgb,currentColor 30%,transparent)!important;background:color-mix(in srgb,currentColor 4%,transparent)!important;color:var(--foreground)}
.payments-plugin .pm-review-table .pm-row-action:focus-visible{outline:2px solid var(--pm-accent);outline-offset:2px}
.payments-plugin .pm-review-table .pm-row-action[data-active=true]{border-color:color-mix(in srgb,var(--pm-accent) 25%,transparent)!important;background:var(--pm-accent-soft)!important;color:var(--pm-accent)}
.payments-plugin .pm-review-table .pm-trade-facts{display:flex;align-items:center;flex-wrap:wrap;gap:5px 12px;margin:0 0 12px;min-width:0;font-size:11px;line-height:1.6}
.payments-plugin .pm-review-table .pm-row-date{display:inline;margin:0;color:color-mix(in srgb,currentColor 52%,transparent);font-size:11px;font-variant-numeric:tabular-nums;white-space:nowrap}
.payments-plugin .pm-review-table .pm-amount-control{display:flex;flex-direction:column;align-items:flex-end;flex:0 1 auto;gap:1px;max-width:48%;min-width:0;margin:1px 0 0;color:var(--pm-flow);white-space:nowrap}
.payments-plugin .pm-review-table .pm-amount-line{display:flex;align-items:baseline;justify-content:flex-end;min-width:0}
.payments-plugin .pm-review-table .pm-amount-date{color:var(--muted-foreground,#6b7280);font-size:9px;font-variant-numeric:tabular-nums;line-height:1.2}
.payments-plugin .pm-review-table .pm-amount-control input[type=text]{flex:0 1 auto;width:var(--pm-amount-width);max-width:15ch;min-width:0;padding:0;border:0;border-radius:3px;background:transparent;color:var(--pm-flow);font-size:18px;font-weight:650;letter-spacing:-.025em;line-height:1.35;font-variant-numeric:tabular-nums;text-align:right}
.payments-plugin .pm-review-table .pm-amount-control input[type=text]:focus-visible{outline:2px solid color-mix(in srgb,var(--pm-flow) 35%,transparent);outline-offset:3px;background:var(--background)}
.payments-plugin .pm-review-table .pm-amount-sign{flex:0 0 auto;font-size:18px;font-weight:650;letter-spacing:-.025em;line-height:1.35}
.payments-plugin .pm-review-table .pm-currency{flex:0 0 auto;margin-left:5px;color:color-mix(in srgb,var(--pm-flow) 65%,var(--foreground));white-space:nowrap;word-break:normal;font-size:9px;font-weight:500;letter-spacing:.02em}
.payments-plugin .pm-review-table .pm-direction-chip{gap:4px;padding:0;border:0;border-radius:0;background:transparent;font-size:10.5px;font-weight:550}
.payments-plugin .pm-review-table .pm-direction-chip i{width:4px;height:4px}
.payments-plugin .pm-review-table .pm-trade-status{display:inline-flex;align-items:center;max-width:100%;padding:1px 6px;border:1px solid color-mix(in srgb,#16a34a 14%,transparent);border-radius:5px;background:color-mix(in srgb,#16a34a 5%,transparent);color:color-mix(in srgb,#15803d 65%,var(--foreground));font-size:10px;font-weight:500;line-height:1.5;overflow-wrap:anywhere}
.payments-plugin .pm-review-table .pm-trade-status[data-review=true]{border-color:color-mix(in srgb,#d97706 24%,transparent);background:color-mix(in srgb,#d97706 8%,transparent);color:color-mix(in srgb,#b45309 80%,var(--foreground))}
.payments-plugin .pm-review-table .pm-original-direction{display:inline;margin:0;color:color-mix(in srgb,currentColor 45%,transparent);font-size:10.5px}
.payments-plugin .pm-review-table .pm-mapping-pair{display:grid;grid-template-columns:var(--pm-mapping-columns);column-gap:var(--pm-mapping-gap);min-width:0;align-items:start}
.payments-plugin .pm-review-table .pm-mapping-heading{box-sizing:border-box;width:100%;max-width:var(--pm-mapping-width);padding-inline:13px}
.payments-plugin .pm-review-table .pm-trade-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:4px;min-width:0}
.payments-plugin .pm-review-table .pm-trade-summary{display:flex;align-items:baseline;flex-wrap:wrap;gap:4px 8px;flex:1;min-width:0}
.payments-plugin .pm-review-table .pm-trade-title{display:inline-flex;align-items:baseline;gap:5px;min-width:0;max-width:100%;min-height:24px;margin:0;padding:0!important;border:0!important;border-radius:3px;background:transparent!important;font-size:15px!important;font-weight:650;line-height:1.6;text-align:left;color:var(--foreground);box-shadow:none;cursor:pointer;-webkit-user-select:text;user-select:text}
.payments-plugin .pm-review-table .pm-trade-title:hover{color:var(--pm-accent)}
.payments-plugin .pm-review-table .pm-trade-title:focus-visible{outline:2px solid var(--pm-accent);outline-offset:3px}
.payments-plugin .pm-review-table .pm-trade-title-text{min-width:0;display:-webkit-box;overflow:hidden;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow-wrap:anywhere}
.payments-plugin .pm-review-table .pm-trade-title-arrow{flex:0 0 auto;font-size:11px;font-weight:450;opacity:.5;-webkit-user-select:none;user-select:none}
.payments-plugin .pm-review-table .pm-trade-title:hover .pm-trade-title-arrow{opacity:1}
.payments-plugin .pm-review-table .pm-trade-category{display:inline-block;max-width:100%;box-sizing:border-box;padding:1px 6px;border:1px solid color-mix(in srgb,var(--pm-flow) 16%,transparent);border-radius:5px;background:color-mix(in srgb,var(--pm-flow) 6%,var(--background));color:color-mix(in srgb,var(--pm-flow) 75%,var(--foreground));font-size:10px;font-weight:500;line-height:1.7;overflow-wrap:anywhere}
.payments-plugin .pm-review-table .pm-mapping-grid{--pm-mapping-line:color-mix(in srgb,var(--pm-flow) 18%,var(--pm-border));--pm-mapping-surface:color-mix(in srgb,var(--pm-flow) 2%,var(--background));position:relative;box-sizing:border-box;display:grid;grid-template-columns:var(--pm-mapping-columns);column-gap:var(--pm-mapping-gap);width:100%;max-width:var(--pm-mapping-width);min-width:0;padding:10px 12px;border:1px solid var(--pm-mapping-line);border-radius:10px;background:var(--pm-mapping-surface)}
.payments-plugin .pm-review-table .pm-mapping-grid::after{content:"";grid-column:1/-1;grid-row:2;align-self:center;height:1px;background:var(--pm-mapping-line);pointer-events:none}
.payments-plugin .pm-review-table .pm-mapping-pair{grid-column:1/-1;align-items:center}
.payments-plugin .pm-review-table .pm-mapping-pair:first-child{grid-row:1}
.payments-plugin .pm-review-table .pm-mapping-pair:last-child{grid-row:3}
.payments-plugin .pm-review-table .pm-mapping-source,.payments-plugin .pm-review-table .pm-mapping-target{min-width:0}
.payments-plugin .pm-review-table .pm-mapping-target,.payments-plugin .pm-review-table .pm-account-connector{justify-self:start;width:100%;max-width:var(--pm-account-width)}
.payments-plugin .pm-review-table .pm-mapping-label{display:block;min-height:16px;margin-bottom:2px;color:color-mix(in srgb,currentColor 52%,transparent);font-size:10.5px;line-height:16px}
.payments-plugin .pm-review-table .pm-payee-button{align-items:center;min-height:24px!important;color:var(--foreground)!important}
.payments-plugin .pm-review-table .pm-payee-button strong{min-width:0;font-size:12px;font-weight:550;line-height:1.6;overflow-wrap:anywhere}
.payments-plugin .pm-review-table .pm-payee-button>span{flex:0 0 auto;font-size:10px;opacity:.45}
.payments-plugin .pm-review-table .pm-mapping-payment .pm-payment-method{min-height:24px!important;padding:0!important;border:0!important;background:transparent!important;color:color-mix(in srgb,currentColor 80%,transparent)!important;font-size:12px!important;font-weight:550!important;text-align:left;line-height:1.6;overflow-wrap:anywhere}
.payments-plugin .pm-review-table .pm-mapping-payment .pm-payment-method:hover:not(:disabled){color:var(--pm-accent)!important;text-decoration:underline;text-underline-offset:3px}
.payments-plugin .pm-review-table .pm-account-control{width:100%;max-width:var(--pm-account-width)}
.payments-plugin .pm-review-table .pm-account-control-link{width:fit-content;max-width:100%}
.payments-plugin .pm-review-table .pm-account-control-link>.pm-search-select,.payments-plugin .pm-review-table .pm-account-control-link>.pm-search-select-trigger{flex:0 1 auto;width:fit-content;max-width:100%}
.payments-plugin .pm-review-table .pm-account-control-link>.pm-account-value{box-sizing:border-box;min-height:24px;padding:0;border:0!important;background:transparent!important}
.payments-plugin .pm-review-table .pm-account-control-link .pm-search-select-trigger{min-height:24px;padding:0!important;border:0!important;border-radius:3px!important;background:transparent!important;box-shadow:none!important}
.payments-plugin .pm-review-table .pm-account-control-link[data-missing=true] .pm-search-select-trigger{border:0!important;background:transparent!important}
.payments-plugin .pm-review-table .pm-account-control-link .pm-account-browser-value{flex:0 1 auto;min-width:0;overflow:hidden;white-space:nowrap}
.payments-plugin .pm-review-table .pm-account-control-link .pm-account-value{min-height:24px;padding:0}
.payments-plugin .pm-review-table .pm-account-control-link .pm-account-value>strong{transition:color .15s ease}
.payments-plugin .pm-review-table .pm-account-control-link .pm-search-select-trigger:hover:not(.is-disabled) .pm-account-value>strong,.payments-plugin .pm-review-table .pm-account-control-link .pm-search-select-trigger:focus-within .pm-account-value>strong{color:var(--pm-flow);text-decoration:underline;text-underline-offset:3px}
.payments-plugin .pm-review-table .pm-account-control-link .pm-search-select-trigger:hover:not(.is-disabled) .pm-account-browser-action,.payments-plugin .pm-review-table .pm-account-control-link .pm-search-select-trigger:focus-within .pm-account-browser-action{color:var(--pm-flow);opacity:1}
.payments-plugin .pm-review-table .pm-account-control-link .pm-account-browser-action{padding:0 1px 0 3px;color:inherit;font-size:9px;font-weight:500;opacity:.45}
.payments-plugin .pm-review-table .pm-account-control-link[data-missing=true] .pm-account-browser-placeholder{color:#b45309;opacity:.9}
.payments-plugin .pm-review-table .pm-account-control-link .pm-search-select-trigger:hover:not(.is-disabled) .pm-account-browser-placeholder{text-decoration:underline;text-underline-offset:2px}
.payments-plugin .pm-review-table .pm-account-value{display:flex;flex-direction:column;align-items:flex-start;justify-content:center;gap:1px;min-width:0;min-height:30px;padding-block:3px;font-weight:400}
.payments-plugin .pm-review-table .pm-account-control>.pm-account-value{box-sizing:border-box;min-height:40px;padding:0 10px;border:1px solid color-mix(in srgb,currentColor 13%,transparent);border-radius:7px;background:var(--background)}
.payments-plugin .pm-review-table .pm-account-value>strong{display:block;max-width:100%;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-size:12px;font-weight:600;line-height:1.5}
.payments-plugin .pm-review-table .pm-account-value>small{display:block;max-width:100%;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-size:10px;line-height:1.4;color:color-mix(in srgb,currentColor 55%,transparent)}
.payments-plugin .pm-review-table .pm-account-control .pm-search-select-trigger{min-height:40px;padding:0 5px 0 10px;gap:2px;border-color:color-mix(in srgb,currentColor 13%,transparent);border-radius:7px;box-shadow:none;transition:border-color .15s ease}
.payments-plugin .pm-review-table .pm-account-control .pm-search-select-trigger:hover:not(.is-disabled){border-color:color-mix(in srgb,currentColor 28%,transparent)}
.payments-plugin .pm-review-table .pm-account-control .pm-search-select-trigger>input[type=text]{font-size:12px;font-weight:500}
.payments-plugin .pm-review-table .pm-account-control .pm-account-browser-clear{flex-basis:24px;width:24px!important;height:24px!important;color:color-mix(in srgb,currentColor 38%,transparent);font-size:15px!important}
.payments-plugin .pm-review-table .pm-account-control .pm-account-browser-action{font-size:0;padding-inline:2px;opacity:.65}
.payments-plugin .pm-review-table .pm-account-control .pm-account-browser-create{flex-basis:28px;width:28px;height:26px;margin:0!important;border-left:0!important;border-radius:5px!important;color:color-mix(in srgb,currentColor 58%,transparent);font-size:19px!important}
.payments-plugin .pm-review-table .pm-account-connector{grid-column:2;grid-row:2;display:flex;align-items:center;justify-content:flex-start;height:40px;padding-left:10px;box-sizing:border-box;pointer-events:none}
.payments-plugin .pm-review-table .pm-account-direction{position:relative;z-index:1;display:inline-grid;place-items:center;width:16px;height:22px;padding:0;border:0;border-radius:4px;background:var(--pm-mapping-surface);box-shadow:0 0 0 3px var(--pm-mapping-surface);line-height:1}
.payments-plugin .pm-review-table .pm-account-direction svg{display:block}
.payments-plugin .pm-review-table .pm-row-notices{margin:6px 0;color:#a16207;font-size:11px}
.payments-plugin .pm-review-table .pm-row-notices>summary{width:fit-content;cursor:pointer;font-weight:550}
.payments-plugin .pm-review-table .pm-row-notices>summary>span{margin-left:3px;font-variant-numeric:tabular-nums}
.payments-plugin .pm-review-table .pm-row-notices p{margin:6px 0 0;padding:0 0 0 8px;border-left:2px solid color-mix(in srgb,#d97706 25%,transparent);font-size:11px;line-height:1.6}
.payments-plugin .pm-review-table .pm-row-review .pm-ai{display:flex;flex-direction:column;gap:3px;margin:9px 0;padding:0;border:0;background:transparent;line-height:1.5}
.payments-plugin .pm-review-table .pm-row-review .pm-ai strong{font-size:11px}
.payments-plugin .pm-review-table .pm-row-review .pm-ai span{font-size:11px;color:color-mix(in srgb,currentColor 60%,transparent)}
.payments-plugin .pm-review-table .pm-review-alert{padding:8px;margin:7px 0;border-radius:5px}
.payments-plugin .pm-review-table .pm-row-review{width:auto;max-width:none;color:var(--foreground)}
.payments-plugin .pm-review-table .pm-row-review>*{box-sizing:border-box;max-width:360px}
.payments-plugin .pm-original-dialog{width:min(720px,calc(100vw - 32px));max-width:none;max-height:85dvh;margin:auto;padding:0;border:1px solid var(--pm-border);border-radius:14px;background:var(--background);color:var(--foreground);box-shadow:0 24px 80px #0003;overflow:auto}
.payments-plugin .pm-original-dialog::backdrop{background:#0f172a66}
.payments-plugin .pm-original-dialog-header{position:sticky;top:0;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:18px 22px;border-bottom:1px solid var(--pm-border);background:var(--background)}
.payments-plugin .pm-original-dialog-header h3{margin:0;font-size:16px;font-weight:650}
.payments-plugin .pm-original-dialog-header p{margin:5px 0 0;color:color-mix(in srgb,currentColor 50%,transparent);font-size:11px}
.payments-plugin .pm-original-dialog-header>button{width:30px;height:30px;min-height:0;padding:0;border:1px solid var(--pm-border);border-radius:7px;background:transparent;font-size:22px;line-height:1}
.payments-plugin .pm-original-dialog .pm-original-content{padding:18px 22px}
.payments-plugin .pm-original-dialog .pm-original-content dd{font-size:13px}
.payments-plugin .pm-original-dialog .pm-original-content dl>div{grid-template-columns:minmax(100px,.32fr) minmax(0,1fr);gap:18px;padding:10px 0}
.payments-plugin .pm-scroll .pm-review-table .pm-refund-group>td{padding:10px 12px!important;border:0;background:transparent}
.payments-plugin .pm-refund-drawer[data-refund-kind=incomplete]{border-color:color-mix(in srgb,#d97706 28%,var(--background));background:color-mix(in srgb,#d97706 5%,var(--background))}
.payments-plugin .pm-refund-drawer[data-refund-kind=incomplete] .pm-refund-heading>strong{color:#b45309}
.payments-plugin .pm-refund-content .pm-review-table{min-width:0}
.payments-plugin .pm-refund-content .pm-review-table .pm-header-fields th{position:static}
.payments-plugin .pm-collapse-all{display:inline-flex;align-items:center;gap:5px;min-height:24px;margin-left:auto;padding:3px 8px!important;border:1px solid color-mix(in srgb,currentColor 15%,transparent)!important;border-radius:6px;background:transparent!important;color:color-mix(in srgb,currentColor 64%,transparent);font-size:10px!important;font-weight:550;line-height:1.5;white-space:nowrap;box-shadow:none}
.payments-plugin .pm-collapse-all:hover:not(:disabled){border-color:color-mix(in srgb,var(--pm-accent) 30%,transparent)!important;background:var(--pm-accent-soft)!important;color:var(--pm-accent)}
.payments-plugin .pm-collapse-all:focus-visible{outline:2px solid var(--pm-accent);outline-offset:2px}
.payments-plugin .pm-collapse-all:disabled{opacity:.45;cursor:default}
.payments-plugin .pm-collapsed-funding-toggle{display:inline-flex;align-items:center;gap:7px;min-height:24px;padding:3px 8px;border:1px solid color-mix(in srgb,currentColor 15%,transparent);border-radius:6px;color:color-mix(in srgb,currentColor 64%,transparent);font-size:10px;font-weight:550;line-height:1.5;white-space:nowrap;cursor:pointer}
.payments-plugin .pm-collapsed-funding-toggle:hover{border-color:color-mix(in srgb,var(--pm-accent) 30%,transparent);background:var(--pm-accent-soft);color:var(--pm-accent)}
.payments-plugin .pm-collapsed-funding-toggle input{position:relative;flex:0 0 24px;width:24px;height:14px;margin:0;padding:0;border:1px solid color-mix(in srgb,currentColor 24%,transparent);border-radius:999px;background:color-mix(in srgb,currentColor 8%,var(--background));appearance:none;cursor:pointer}
.payments-plugin .pm-collapsed-funding-toggle input:after{content:"";position:absolute;top:2px;left:2px;width:8px;height:8px;border-radius:50%;background:color-mix(in srgb,currentColor 58%,transparent);transition:transform .15s ease,background .15s ease}
.payments-plugin .pm-collapsed-funding-toggle input:checked{border-color:color-mix(in srgb,var(--pm-accent) 40%,transparent);background:var(--pm-accent-soft)}
.payments-plugin .pm-collapsed-funding-toggle input:checked:after{transform:translateX(10px);background:var(--pm-accent)}
.payments-plugin .pm-collapsed-funding-toggle input:focus-visible{outline:2px solid var(--pm-accent);outline-offset:2px}
.payments-plugin .pm-review-table .pm-row-collapse-toggle{display:inline-grid;place-items:center;flex:0 0 22px;align-self:center;width:22px;height:22px;min-height:22px;margin:0 0 1px;padding:0!important;border:0!important;border-radius:5px;background:transparent!important;color:color-mix(in srgb,currentColor 48%,transparent);line-height:1;box-shadow:none}
.payments-plugin .pm-review-table .pm-row-collapse-toggle:hover{background:color-mix(in srgb,var(--pm-accent) 8%,transparent)!important;color:var(--pm-accent)}
.payments-plugin .pm-review-table .pm-row-collapse-toggle:focus-visible{outline:2px solid var(--pm-accent);outline-offset:1px}
.payments-plugin .pm-review-table .pm-row-collapse-toggle svg{transition:transform .15s ease}
.payments-plugin .pm-review-table .pm-row-collapse-toggle[aria-expanded=false] svg{transform:rotate(-90deg)}
.payments-plugin .pm-review-table .pm-row-collapsed>td.pm-row-collapsed-cell{padding:8px 12px!important;border-left:2px solid color-mix(in srgb,var(--pm-flow) 58%,var(--background))}
.payments-plugin .pm-review-table tbody,.payments-plugin .pm-review-table tbody button{-webkit-user-select:text;user-select:text}
.payments-plugin .pm-review-table .pm-collapsed-header>th{height:auto;padding:0!important;border-bottom:1px solid var(--pm-border);background:var(--background);color:color-mix(in srgb,currentColor 52%,transparent);font-size:9.5px;font-weight:550;vertical-align:middle!important}
.payments-plugin .pm-scroll .pm-review-table .pm-collapsed-header>th{position:sticky;top:0;z-index:8}
.payments-plugin .pm-review-table .pm-collapsed-header-row{min-height:40px;padding:4px 12px 4px 14px}
.payments-plugin .pm-review-table .pm-collapsed-select-all{display:flex;align-items:center;gap:2px;min-width:0}
.payments-plugin .pm-review-table .pm-collapsed-header-tools{display:flex;align-items:center;gap:8px;min-width:0}
.payments-plugin .pm-review-table .pm-collapsed-header-tools>.pm-collapsed-header-label{flex:0 0 auto}
.payments-plugin .pm-review-table .pm-collapsed-header-tools .pm-table-search{flex:1 1 120px;max-width:390px;margin-left:auto}
.payments-plugin .pm-review-table .pm-collapsed-header-tools .pm-filter-trigger{width:22px;height:22px;min-height:22px}
.payments-plugin .pm-review-table .pm-collapsed-header-label{min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.payments-plugin .pm-review-table .pm-collapsed-header-field{display:flex;align-items:center;justify-content:space-between;gap:3px;min-width:0}
.payments-plugin .pm-review-table .pm-collapsed-header-field>span{min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.payments-plugin .pm-review-table .pm-collapsed-header-account{display:flex;flex-direction:column;gap:2px;min-width:0;padding-left:7px;border-left:1px solid color-mix(in srgb,currentColor 10%,transparent)}
.payments-plugin .pm-review-table .pm-collapsed-header-line{display:flex;align-items:center;justify-content:space-between;gap:3px;min-width:0}
.payments-plugin .pm-review-table .pm-collapsed-header-line>span{min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.payments-plugin .pm-review-table .pm-collapsed-header-actions{display:flex;align-items:center;gap:1px;min-width:0}
.payments-plugin .pm-review-table .pm-collapsed-header-field .pm-filter-trigger{width:22px;height:22px;min-height:22px}
.payments-plugin .pm-review-table .pm-collapsed-sort{display:inline-grid;place-items:center;flex:0 0 22px;width:22px;height:22px;min-height:22px;padding:0!important;border:0!important;border-radius:4px!important;background:transparent!important;color:color-mix(in srgb,currentColor 42%,transparent);line-height:1;box-shadow:none}
.payments-plugin .pm-review-table .pm-collapsed-sort:hover,.payments-plugin .pm-review-table .pm-collapsed-sort[data-active=true]{background:var(--pm-accent-soft)!important;color:var(--pm-accent)}
.payments-plugin .pm-review-table .pm-collapsed-sort:focus-visible{outline:2px solid var(--pm-accent);outline-offset:1px}
.payments-plugin .pm-review-table .pm-collapsed-header-actions .pm-filter-trigger{width:22px;height:22px;min-height:22px}
.payments-plugin .pm-refund-content .pm-review-table .pm-collapsed-header>th{position:static}
.payments-plugin .pm-review-table .pm-collapsed-row{position:relative;display:grid;grid-template-columns:40px clamp(100px,8vw,124px) clamp(135px,14vw,190px) clamp(180px,21vw,280px) minmax(220px,1fr);align-items:center;gap:clamp(6px,.8vw,9px);min-width:0;cursor:pointer}
.payments-plugin .pm-review-table .pm-collapsed-row-with-payment{grid-template-columns:40px clamp(96px,7.5vw,116px) clamp(125px,12vw,175px) clamp(170px,19vw,255px) clamp(150px,17vw,230px) minmax(180px,1fr)}
.payments-plugin .pm-review-table .pm-collapsed-expand-action{position:absolute;inset:-4px -8px;z-index:0;padding:0!important;border:0!important;border-radius:8px!important;background:transparent!important;color:transparent!important;font-size:0!important;box-shadow:none!important;cursor:pointer;pointer-events:none}
.payments-plugin .pm-review-table .pm-collapsed-expand-action:focus-visible{outline:2px solid var(--pm-accent);outline-offset:-2px}
.payments-plugin .pm-review-table .pm-collapsed-row>*:not(.pm-collapsed-expand-action){position:relative;z-index:1}
.payments-plugin .pm-review-table .pm-collapsed-row .pm-row-checkbox{justify-self:center;margin:0!important}
.payments-plugin .pm-review-table .pm-collapsed-row .pm-trade-title{width:fit-content;min-width:0;min-height:22px;max-width:100%}
.payments-plugin .pm-review-table .pm-collapsed-row .pm-trade-title-text{-webkit-line-clamp:1;white-space:nowrap}
.payments-plugin .pm-review-table .pm-collapsed-row .pm-collapsed-tags{display:flex;align-items:center;flex-wrap:wrap;gap:3px 5px;min-width:0}
.payments-plugin .pm-review-table .pm-collapsed-row .pm-collapsed-status{justify-self:start;max-width:100%;white-space:nowrap}
.payments-plugin .pm-review-table .pm-collapsed-row .pm-collapsed-amount{display:flex;flex-direction:column;justify-self:stretch;align-items:flex-end;justify-content:center;gap:1px;width:100%;color:var(--pm-flow);font-family:"SFMono-Regular",Consolas,monospace;font-size:16px;font-weight:720;font-variant-numeric:tabular-nums;letter-spacing:-.025em;white-space:nowrap}
.payments-plugin .pm-review-table .pm-collapsed-row .pm-collapsed-amount-line{display:flex;align-items:baseline;justify-content:flex-end;gap:4px;min-width:0}
.payments-plugin .pm-review-table .pm-collapsed-row .pm-collapsed-amount-line small{color:color-mix(in srgb,currentColor 42%,transparent);font-size:9px;font-weight:650;letter-spacing:.02em}
.payments-plugin .pm-review-table .pm-collapsed-row .pm-collapsed-date{font-family:inherit;color:var(--muted-foreground,#6b7280);font-size:8.5px;font-weight:500;letter-spacing:0;line-height:1.1}
.payments-plugin .pm-review-table .pm-collapsed-row .pm-collapsed-pair{display:flex;flex-direction:column;justify-content:center;gap:2px;width:fit-content;max-width:100%;min-width:0;padding:2px 7px;border-left:1px solid color-mix(in srgb,currentColor 10%,transparent)}
.payments-plugin .pm-review-table .pm-collapsed-row .pm-collapsed-pair-line{display:flex;align-items:baseline;gap:5px;min-width:0;line-height:1.35}
.payments-plugin .pm-review-table .pm-collapsed-row .pm-collapsed-pair-line small{flex:0 0 auto;color:color-mix(in srgb,currentColor 40%,transparent);font-size:8.5px;font-weight:500}
.payments-plugin .pm-review-table .pm-collapsed-row .pm-collapsed-pair-line strong,.payments-plugin .pm-review-table .pm-collapsed-row .pm-collapsed-pair-line>span{min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;color:color-mix(in srgb,currentColor 76%,transparent);font-size:10px;font-weight:500}
.payments-plugin .pm-review-table .pm-collapsed-row .pm-collapsed-pair-line strong{font-weight:650}
.payments-plugin .pm-review-table .pm-collapsed-row .pm-collapsed-party-button{display:flex;align-items:baseline;gap:3px;flex:1 1 auto;min-width:0;min-height:18px;margin:0;padding:0!important;border:0!important;border-radius:0!important;background:transparent!important;color:color-mix(in srgb,currentColor 76%,transparent);font:inherit;text-align:left;line-height:1.35;box-shadow:none}
.payments-plugin .pm-review-table .pm-collapsed-row .pm-collapsed-party-button strong{min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-size:10px;font-weight:650}
.payments-plugin .pm-review-table .pm-collapsed-row .pm-collapsed-party-button>span{flex:0 0 auto;font-size:8px;opacity:.45}
.payments-plugin .pm-review-table .pm-collapsed-row .pm-collapsed-party-button:hover:not(:disabled){color:var(--pm-flow);text-decoration:underline;text-underline-offset:2px}
.payments-plugin .pm-review-table .pm-collapsed-row .pm-collapsed-party-button:focus-visible{outline:2px solid var(--pm-flow);outline-offset:1px}
.payments-plugin .pm-review-table .pm-collapsed-row .pm-collapsed-pair-line>.pm-account-control{flex:1 1 auto;width:auto;max-width:none;min-width:0}
.payments-plugin .pm-review-table .pm-collapsed-row .pm-collapsed-pair-line>.pm-account-control-link{flex:0 1 auto;width:fit-content;max-width:100%}
.payments-plugin .pm-review-table .pm-collapsed-row .pm-account-control>.pm-search-select{flex:1 1 auto;width:100%;min-width:0}
.payments-plugin .pm-review-table .pm-collapsed-row .pm-account-control-link>.pm-search-select{flex:0 1 auto;width:fit-content;max-width:100%}
.payments-plugin .pm-review-table .pm-collapsed-row .pm-account-control .pm-search-select-trigger{min-height:18px;height:18px;padding:0!important;gap:2px;border:0!important;background:transparent!important;box-shadow:none}
.payments-plugin .pm-review-table .pm-collapsed-row .pm-account-control .pm-search-select-trigger>input[type=text]{height:18px;font-size:10px;font-weight:500}
.payments-plugin .pm-review-table .pm-collapsed-row .pm-account-control .pm-search-select-chevron{flex-basis:11px;width:11px;height:11px;opacity:.45}
.payments-plugin .pm-review-table .pm-collapsed-row .pm-account-control .pm-account-browser-value{display:block;overflow:hidden;white-space:nowrap}
.payments-plugin .pm-review-table .pm-collapsed-row .pm-account-control .pm-account-value{display:block;min-height:0;padding:0;font-size:10px}
.payments-plugin .pm-review-table .pm-collapsed-row .pm-account-control .pm-account-value>strong{display:inline;font-size:10px;font-weight:650}
.payments-plugin .pm-review-table .pm-collapsed-row .pm-account-control .pm-account-value>small{display:none}
.payments-plugin .pm-review-table .pm-collapsed-row .pm-account-control .pm-account-browser-clear{flex-basis:16px;width:16px!important;height:16px!important;font-size:12px!important}
.payments-plugin .pm-review-table .pm-collapsed-row .pm-account-control .pm-account-browser-action{display:none}
.payments-plugin .pm-review-table .pm-collapsed-row .pm-account-control-link .pm-account-browser-action{display:inline-flex;flex:0 0 auto;font-size:8px;line-height:1;opacity:.45}
.payments-plugin .pm-review-table .pm-collapsed-row .pm-account-control .pm-account-browser-create{flex-basis:18px;width:18px;height:16px;min-height:16px;margin:0!important;font-size:14px!important}
@media(max-width:680px){
  .payments-plugin .pm-queue-card .pm-scroll{max-height:none}
  .payments-plugin .pm-original-dialog .pm-original-content dl>div{grid-template-columns:1fr;gap:4px}
  .payments-plugin .pm-original-dialog-header,.payments-plugin .pm-original-dialog .pm-original-content{padding:16px}
}
@media(prefers-reduced-motion:reduce){
  .payments-plugin .pm-review-table .pm-row-collapse-toggle svg{transition:none}
  .payments-plugin .pm-collapsed-funding-toggle input:after{transition:none}
}
`;
