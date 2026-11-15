import { accountBrowserStyles } from "@plugins/shared/frontend/account-browser-styles";
import { reviewTableStyles } from "./review-table-styles";

export const styles = `${accountBrowserStyles}
.payments-plugin .pm-classification-dialog{--pm-ai-color:#2563eb;position:fixed;inset:0;box-sizing:border-box;width:min(500px,calc(100vw - 32px));max-width:none;max-height:85dvh;margin:auto;padding:0;overflow:auto;overscroll-behavior:contain;border:1px solid color-mix(in srgb,currentColor 14%,transparent);border-radius:16px;background:var(--background);color:var(--foreground);box-shadow:0 24px 80px #0003}
.payments-plugin .pm-classification-dialog:popover-open{display:block}
.payments-plugin .pm-classification-dialog[data-state=success]{--pm-ai-color:#16803c}
.payments-plugin .pm-classification-dialog[data-state=warning]{--pm-ai-color:#b45309}
.payments-plugin .pm-classification-dialog::backdrop{background:#0f172a66;pointer-events:none}
.payments-plugin .pm-classification-header{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:22px 24px 18px;background:linear-gradient(120deg,color-mix(in srgb,var(--pm-ai-color) 9%,var(--background)),var(--background));border-bottom:1px solid color-mix(in srgb,currentColor 9%,transparent)}
.payments-plugin .pm-classification-eyebrow{color:var(--pm-ai-color);font-size:10px;font-weight:650;letter-spacing:.12em}
.payments-plugin .pm-classification-header h2{margin:5px 0 0;font-size:19px;font-weight:650;line-height:1.4}
.payments-plugin .pm-classification-window-actions{display:flex;align-items:center;gap:6px}
.payments-plugin .pm-classification-window-actions>button{flex:0 0 30px;width:30px;height:30px;min-height:0;padding:0;border:0;border-radius:7px;background:color-mix(in srgb,currentColor 5%,transparent);color:inherit;font-size:23px;line-height:1}
.payments-plugin .pm-classification-mini{position:fixed;inset:auto 20px 155px auto;box-sizing:border-box;width:min(320px,calc(100vw - 32px));margin:0;padding:0;border:1px solid color-mix(in srgb,#2563eb 24%,transparent);border-radius:12px;background:var(--background);color:var(--foreground);box-shadow:0 12px 35px #0002}
.payments-plugin .pm-classification-mini:popover-open{display:block}
.payments-plugin .pm-classification-mini::backdrop{background:transparent;pointer-events:none}
.payments-plugin .pm-classification-mini>button{display:grid;gap:9px;width:100%;padding:14px 16px!important;border:0!important;border-radius:12px;background:linear-gradient(120deg,color-mix(in srgb,#2563eb 6%,var(--background)),var(--background));text-align:left}
.payments-plugin .pm-classification-mini-heading{display:flex;align-items:center;gap:8px;color:#2563eb}
.payments-plugin .pm-classification-mini-heading strong{flex:1;font-size:13px}
.payments-plugin .pm-classification-mini-count,.payments-plugin .pm-classification-mini small{font-size:11px;opacity:.7;font-variant-numeric:tabular-nums}
.payments-plugin .pm-classification-mini progress{display:block;width:100%;height:5px;accent-color:#2563eb}
.payments-plugin .pm-classification-body{padding:20px 24px}
.payments-plugin .pm-classification-body>p:first-child{margin:0 0 22px;font-size:12px;line-height:1.8;color:color-mix(in srgb,currentColor 65%,transparent)}
.payments-plugin .pm-classification-status{display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;gap:8px;margin-bottom:12px}
.payments-plugin .pm-classification-status strong{display:inline-flex;align-items:center;gap:8px;font-size:14px;font-weight:600;color:var(--pm-ai-color)}
.payments-plugin .pm-classification-spinner{box-sizing:border-box;display:inline-block;flex:0 0 16px;width:16px;height:16px;border:2px solid color-mix(in srgb,currentColor 20%,transparent);border-top-color:currentColor;border-radius:50%;animation:pm-classification-spin .8s linear infinite}
@keyframes pm-classification-spin{to{transform:rotate(360deg)}}
.payments-plugin .pm-classification-status>span{font-size:12px;font-variant-numeric:tabular-nums;color:color-mix(in srgb,currentColor 65%,transparent)}
.payments-plugin .pm-classification-dialog progress{display:block;width:100%;height:8px;overflow:hidden;border:0;border-radius:999px;appearance:none;background:color-mix(in srgb,currentColor 9%,transparent);accent-color:var(--pm-ai-color)}
.payments-plugin .pm-classification-dialog progress::-webkit-progress-bar{background:color-mix(in srgb,currentColor 9%,transparent);border-radius:999px}
.payments-plugin .pm-classification-dialog progress::-webkit-progress-value{background:var(--pm-ai-color);border-radius:999px;transition:width .2s ease}
.payments-plugin .pm-classification-dialog progress::-moz-progress-bar{background:var(--pm-ai-color);border-radius:999px}
.payments-plugin .pm-classification-progress-caption{display:flex;justify-content:space-between;gap:8px;margin-top:8px;font-size:11px;color:color-mix(in srgb,currentColor 55%,transparent);font-variant-numeric:tabular-nums}
.payments-plugin .pm-classification-results{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:22px 0 18px}
.payments-plugin .pm-classification-results>div{min-width:0;padding:12px 8px;border:1px solid color-mix(in srgb,currentColor 9%,transparent);border-radius:9px;background:color-mix(in srgb,currentColor 2%,var(--background));text-align:center}
.payments-plugin .pm-classification-results dt{font-size:11px;color:color-mix(in srgb,currentColor 60%,transparent)}
.payments-plugin .pm-classification-results dd{margin:6px 0 0;font-size:25px;font-weight:650;line-height:1.2;font-variant-numeric:tabular-nums}
.payments-plugin .pm-classification-results dd small{margin-left:4px;font-size:10px;font-weight:400;opacity:.6}
.payments-plugin .pm-classification-results [data-result=success] dd{color:#16803c}
.payments-plugin .pm-classification-results [data-result=failure] dd{color:#b45309}
.payments-plugin .pm-classification-details-toggle{display:block;margin:8px auto 0;padding:0!important;border:0!important;background:transparent!important;color:#b45309;font-size:11px!important;font-weight:500;line-height:1.5;text-decoration:underline;text-underline-offset:3px}
.payments-plugin .pm-classification-details-toggle:focus-visible{outline:2px solid currentColor;outline-offset:3px;border-radius:3px}
.payments-plugin .pm-classification-details-toggle.pm-classification-view{color:#2563eb}
.payments-plugin .pm-classification-details-toggle:disabled{opacity:.35;text-decoration:none;cursor:default}
.payments-plugin .pm-classification-failures{margin:0 0 18px;padding:12px;border:1px solid color-mix(in srgb,#b45309 20%,transparent);border-radius:10px;background:color-mix(in srgb,#f59e0b 4%,var(--background));font-size:12px;line-height:1.6}
.payments-plugin .pm-classification-failures>strong{color:#b45309;font-size:12px}
.payments-plugin .pm-classification-failures>p{margin:4px 0 10px;font-size:11px;color:color-mix(in srgb,currentColor 60%,transparent)}
.payments-plugin .pm-classification-failures ol{display:grid;gap:10px;max-height:300px;margin:0;padding:0;overflow:auto;overscroll-behavior:contain;list-style:none}
.payments-plugin .pm-classification-failures li{min-width:0;padding:10px;border:1px solid color-mix(in srgb,currentColor 9%,transparent);border-radius:7px;background:var(--background);overflow-wrap:anywhere}
.payments-plugin .pm-classification-failures li>strong{font-size:12px;font-weight:600}
.payments-plugin .pm-classification-failure-meta{display:flex;justify-content:space-between;flex-wrap:wrap;gap:3px 10px;margin-top:4px;font-size:10px;color:color-mix(in srgb,currentColor 58%,transparent)}
.payments-plugin .pm-classification-failure-meta b{font-weight:500;font-variant-numeric:tabular-nums;white-space:nowrap}
.payments-plugin .pm-classification-failure-reason{margin:7px 0;color:#b45309;font-size:11px}
.payments-plugin .pm-classification-failures dl{display:grid;gap:4px;margin:0;font-size:11px}
.payments-plugin .pm-classification-failures dl>div{display:grid;grid-template-columns:96px minmax(0,1fr);gap:6px}
.payments-plugin .pm-classification-failures dt{color:color-mix(in srgb,currentColor 55%,transparent)}
.payments-plugin .pm-classification-failures dd{min-width:0;margin:0}
.payments-plugin .pm-classification-error{margin:0 0 16px;padding:11px 13px;border:1px solid color-mix(in srgb,#b45309 22%,transparent);border-radius:8px;background:color-mix(in srgb,#f59e0b 6%,var(--background));font-size:12px;line-height:1.7}
.payments-plugin .pm-classification-error p{margin:0 0 4px;color:#b45309;overflow-wrap:anywhere}
.payments-plugin .pm-classification-error>span{color:color-mix(in srgb,currentColor 65%,transparent)}
.payments-plugin .pm-classification-note{margin:0;font-size:11px;line-height:1.8;color:color-mix(in srgb,currentColor 55%,transparent)}
.payments-plugin .pm-classification-footer{display:flex;justify-content:flex-end;gap:8px;padding:14px 24px;border-top:1px solid color-mix(in srgb,currentColor 9%,transparent)}
.payments-plugin .pm-classification-dialog[data-state=ready]{width:min(560px,calc(100vw - 32px))}
.payments-plugin .pm-classification-dialog .pm-linking-entry-compact{grid-template-columns:minmax(0,1fr);gap:12px;margin:0 0 18px;padding:14px;border-radius:10px}
.payments-plugin .pm-classification-dialog .pm-linking-entry-copy>strong{font-size:15px}
.payments-plugin .pm-classification-dialog .pm-linking-entry-copy>small{max-width:none;font-size:11px}
.payments-plugin .pm-classification-dialog .pm-linking-entry-actions>button{grid-template-columns:minmax(0,1fr);gap:5px;min-height:0;padding:12px}
.payments-plugin .pm-classification-dialog .pm-linking-entry-actions b{grid-column:1;grid-row:auto;justify-self:start;margin-top:3px}
.payments-plugin .pm-classification-plan{display:flex;flex-direction:column;gap:7px;margin-bottom:16px;padding:14px 16px;border:1px solid color-mix(in srgb,var(--pm-ai-color) 18%,transparent);border-radius:10px;background:color-mix(in srgb,var(--pm-ai-color) 4%,var(--background))}
.payments-plugin .pm-classification-plan>strong{font-size:15px;font-weight:650;color:var(--pm-ai-color)}
.payments-plugin .pm-classification-plan>p{margin:0;font-size:12px;line-height:1.7;color:color-mix(in srgb,currentColor 60%,transparent)}
.payments-plugin .pm-classification-funding-note{margin:0 0 14px;font-size:12px;line-height:1.7;color:#b45309}
@media(prefers-reduced-motion:reduce){.payments-plugin .pm-classification-dialog progress::-webkit-progress-value{transition:none}.payments-plugin .pm-classification-spinner{animation:none}}
.payments-plugin input[type=checkbox]{color-scheme:light;accent-color:#2563eb}
.dark .payments-plugin input[type=checkbox]{color-scheme:dark}
.payments-plugin .pm-category-action{--pm-action-color:#7c3aed}
.payments-plugin .pm-account-arrow{color:var(--pm-action-color);font-size:20px;padding:0 2px}
.payments-plugin .pm-search-select{position:relative;flex:1 1 180px;min-width:0}
.payments-plugin .pm-search-select-trigger{display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;min-width:0;min-height:36px;padding:0 8px;text-align:left;border:1px solid color-mix(in srgb,currentColor 20%,transparent);border-radius:6px;background:var(--background);cursor:pointer}
.payments-plugin .pm-search-select-trigger:focus-within{outline:2px solid color-mix(in srgb,#2563eb 35%,transparent);outline-offset:1px}
.payments-plugin .pm-search-select-trigger.is-disabled{cursor:not-allowed;opacity:.5}
.payments-plugin .pm-search-select-trigger>input[type=text]{flex:1;min-width:0;width:auto;height:34px;padding:0;border:0;outline:0;background:transparent;color:inherit;font:inherit;font-size:14px;font-weight:500;line-height:1.35;cursor:pointer}
.payments-plugin .pm-search-select-trigger>input[type=text]::placeholder{color:color-mix(in srgb,currentColor 60%,transparent)}
.payments-plugin .pm-search-select-chevron{display:block;flex:0 0 16px;width:16px;height:16px;align-self:center;margin:0 1px 0 0;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round;transition:transform .16s ease;opacity:.72}
.payments-plugin .pm-search-select-chevron.is-open{transform:rotate(180deg)}
.payments-plugin .pm-search-select-trigger>span:first-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.payments-plugin .pm-search-select-menu{position:absolute;z-index:30;top:calc(100% + 5px);left:0;display:flex;flex-direction:column;width:max(100%,280px);max-width:min(420px,calc(100vw - 32px));padding:8px;border:1px solid color-mix(in srgb,currentColor 18%,transparent);border-radius:10px;background:var(--background);box-shadow:0 14px 34px #0003;overflow:hidden}
.payments-plugin .pm-search-select-menu input[type=search]{flex:0 0 auto;width:100%;margin-bottom:8px}
.payments-plugin .pm-search-select-options{display:flex;flex:1 1 auto;flex-direction:column;min-width:0;min-height:0;max-height:260px;overflow:auto;overscroll-behavior:contain}
.payments-plugin .pm-search-select-options>button{display:flex;align-items:center;justify-content:space-between;width:100%;padding:8px 9px;text-align:left;border-color:transparent;background:transparent}
.payments-plugin .pm-search-select-options>button:hover,.payments-plugin .pm-search-select-options>button.is-active{background:color-mix(in srgb,currentColor 8%,var(--background))}
.payments-plugin .pm-search-select-options>button[aria-selected=true]{font-weight:650;color:#2563eb}
.payments-plugin .pm-search-select-options>label{display:flex;align-items:flex-start;justify-content:flex-start;gap:9px;width:100%;padding:8px 9px;border-radius:6px;text-align:left;cursor:pointer}
.payments-plugin .pm-search-select-options>label:hover{background:color-mix(in srgb,currentColor 7%,var(--background))}
.payments-plugin .pm-search-select-options>label:has(input:checked){background:color-mix(in srgb,#2563eb 7%,var(--background))}
.payments-plugin .pm-search-select-options>label>input[type=checkbox]{flex:0 0 auto;width:16px;min-width:16px;max-width:16px;height:16px;margin:2px 0 0;padding:0;accent-color:#2563eb}
.payments-plugin .pm-search-select-options>label>span{flex:1 1 auto;min-width:0;line-height:1.5;overflow-wrap:anywhere}
.payments-plugin .pm-search-select-options p{padding:8px 9px;margin:0}
.payments-plugin .pm-search-select-footer{display:flex;flex:0 0 auto;align-items:center;justify-content:flex-end;gap:8px;padding-top:8px;border-top:1px solid color-mix(in srgb,currentColor 10%,transparent)}
.payments-plugin .pm-search-select-footer span{margin-right:auto;font-size:12px;opacity:.65}
.payments-plugin .pm-search-select-footer button{font-size:12px}
.payments-plugin .pm-field>.pm-search-select{flex:0 0 auto;width:100%}
.payments-plugin .pm-account-browser-trigger{gap:4px;padding:0 0 0 8px;color:var(--foreground);border-color:color-mix(in srgb,currentColor 20%,transparent);background:var(--background)}
.payments-plugin .pm-account-browser-trigger>input[type=text]{font-weight:500}
.payments-plugin .pm-account-browser-clear{display:grid!important;place-items:center;flex:0 0 24px;width:24px!important;height:24px!important;min-height:0!important;margin:0!important;padding:0!important;border:0!important;border-radius:50%!important;background:transparent!important;color:color-mix(in srgb,currentColor 58%,transparent);font-size:17px!important;font-weight:400!important;line-height:1!important}
.payments-plugin .pm-account-browser-clear:hover{background:color-mix(in srgb,currentColor 7%,var(--background))!important;color:inherit}
.payments-plugin .pm-account-browser-action{display:inline-flex;flex:0 0 auto;align-items:center;gap:2px;padding:0 3px;color:color-mix(in srgb,currentColor 58%,transparent);font-size:11px;font-weight:600;line-height:1;white-space:nowrap}
.payments-plugin .pm-account-browser-action svg{display:block;width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
.payments-plugin .pm-account-browser-create{display:grid!important;place-items:center;flex:0 0 34px;width:34px;height:30px;margin:2px!important;padding:0!important;border:0!important;border-left:1px solid color-mix(in srgb,currentColor 14%,transparent)!important;border-radius:0 6px 6px 0!important;background:transparent!important;color:inherit;font-size:23px!important;font-weight:450!important;line-height:1}
.payments-plugin .pm-account-browser-create:hover:not(:disabled){background:color-mix(in srgb,currentColor 7%,var(--background))!important}
.payments-plugin .pm-account-browser-menu{box-sizing:border-box;min-width:0;max-width:min(360px,calc(100vw - 24px));max-height:min(420px,72vh);padding:0}
.payments-plugin .pm-account-browser-root-toolbar{display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:26px;margin-bottom:5px}
.payments-plugin .pm-account-browser-root-toolbar>span{font-size:11px;opacity:.58}
.payments-plugin .pm-account-browser-root-toolbar>button{flex:0 0 auto;padding:3px 8px;border:1px solid color-mix(in srgb,currentColor 16%,transparent);border-radius:5px;background:transparent;font-size:11px}
.payments-plugin .pm-account-browser-root-toolbar>button:hover{background:color-mix(in srgb,currentColor 6%,var(--background))}
.payments-plugin .pm-account-browser-root-toolbar>button[aria-pressed=true]{border-color:#2563eb;background:color-mix(in srgb,#2563eb 8%,var(--background));color:#2563eb}
.payments-plugin .pm-account-browser-roots{display:flex;flex:1 1 auto;flex-direction:column;flex-wrap:nowrap;gap:5px;min-height:0;padding:1px 0;overflow:auto;overscroll-behavior:contain;scrollbar-gutter:stable}
.payments-plugin .pm-account-browser-roots>button{--pm-account-root-color:#64748b;display:flex;align-items:baseline;gap:6px;min-height:32px;padding:5px 8px;color:var(--pm-account-root-color);border:1px solid color-mix(in srgb,var(--pm-account-root-color) 30%,transparent);border-radius:6px;background:color-mix(in srgb,var(--pm-account-root-color) 6%,var(--background));text-align:left}
.payments-plugin .pm-account-browser-roots>button[data-account-root=Income]{--pm-account-root-color:#15803d}
.payments-plugin .pm-account-browser-roots>button[data-account-root=Expenses]{--pm-account-root-color:#dc2626}
.payments-plugin .pm-account-browser-roots>button[data-account-root=Liabilities]{--pm-account-root-color:#b7791f}
.payments-plugin .pm-account-browser-roots>button[data-account-root=Assets]{--pm-account-root-color:#2563eb}
.payments-plugin .pm-account-browser-roots>button[data-account-root=Equity]{--pm-account-root-color:#7c3aed}
.payments-plugin .pm-account-browser-roots>button:hover{border-color:color-mix(in srgb,var(--pm-account-root-color) 62%,transparent);background:color-mix(in srgb,var(--pm-account-root-color) 11%,var(--background))}
.payments-plugin .pm-account-browser-roots>button>strong{font-size:13px;font-weight:550}
.payments-plugin .pm-account-browser-roots>button>small{font-size:10px;font-weight:400;opacity:.45}
.payments-plugin .pm-account-browser-pathbar{display:flex;align-items:center;gap:8px;min-width:0;padding:7px 10px}
.payments-plugin .pm-account-browser-breadcrumb{display:flex;align-items:center;gap:2px;flex:1 1 auto;min-width:0;padding:0;overflow-x:auto;scrollbar-width:thin}
.payments-plugin .pm-account-browser-breadcrumb>button{flex:0 0 auto;padding:4px 7px;border-color:transparent;background:transparent;color:inherit;font-size:12px;font-weight:600;white-space:nowrap}
.payments-plugin .pm-account-browser-breadcrumb>button:hover{background:color-mix(in srgb,currentColor 4%,var(--background))}
.payments-plugin .pm-account-browser-breadcrumb>button[aria-current=page]{font-weight:650}
.payments-plugin .pm-account-browser-breadcrumb>.pm-account-browser-breadcrumb-create{display:grid;place-items:center;width:22px;height:22px;min-height:0;margin-left:3px;padding:0;border:1px solid color-mix(in srgb,currentColor 12%,transparent);border-radius:5px;background:transparent;line-height:1;transition:background .12s ease}
.payments-plugin .pm-account-browser-breadcrumb>.pm-account-browser-breadcrumb-create>svg{display:block;width:13px;height:13px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round}
.payments-plugin .pm-account-browser-breadcrumb>.pm-account-browser-breadcrumb-create:hover:not(:disabled){border-color:color-mix(in srgb,currentColor 22%,transparent);background:color-mix(in srgb,currentColor 7%,var(--background))}
.payments-plugin .pm-account-browser-breadcrumb>span{flex:0 0 auto;opacity:.4;font-size:12px}
.payments-plugin .pm-account-browser-expand-controls{display:flex;flex:0 0 auto;align-items:center;gap:5px}
.payments-plugin .pm-account-browser-expand-label{font-size:11px;opacity:.65;white-space:nowrap}
.payments-plugin .pm-account-browser-expand-switch{position:relative;flex:0 0 32px;width:32px!important;height:18px!important;min-height:18px;margin:0!important;padding:0!important;border:0!important;border-radius:999px!important;background:color-mix(in srgb,currentColor 19%,var(--background))!important}
.payments-plugin .pm-account-browser-expand-switch>span{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;background:var(--background);box-shadow:0 1px 2px #0002;transition:transform .16s ease}
.payments-plugin .pm-account-browser-expand-switch[aria-checked=true]{background:#16803c!important}
.payments-plugin .pm-account-browser-expand-switch[aria-checked=true]>span{transform:translateX(14px)}
.payments-plugin .pm-account-browser-expand-divider{width:1px;height:15px;background:color-mix(in srgb,currentColor 15%,transparent)}
.payments-plugin .pm-account-browser-expand-modes{display:flex;align-items:center;gap:2px;padding:2px;border:1px solid color-mix(in srgb,currentColor 13%,transparent);border-radius:7px;background:color-mix(in srgb,currentColor 2%,var(--background))}
.payments-plugin .pm-account-browser-expand-modes>button{min-width:38px;padding:2px 7px!important;border:0!important;border-radius:5px!important;background:transparent!important;font-size:10px!important;line-height:1.5}
.payments-plugin .pm-account-browser-expand-modes>button[aria-pressed=true]{background:color-mix(in srgb,currentColor 8%,var(--background))!important;font-weight:650}
.payments-plugin .pm-account-browser-options{display:flex;flex:1 1 auto;flex-direction:column;min-width:0;min-height:0;max-height:240px;overflow:auto;overscroll-behavior:contain;border-top:1px solid color-mix(in srgb,currentColor 8%,transparent)}
.payments-plugin .pm-account-browser-row{display:grid;grid-template-columns:10px minmax(0,7fr) minmax(84px,3fr) auto auto;align-items:stretch;min-width:0;min-height:34px;padding-left:calc(var(--pm-account-depth,0)*14px);border:0;border-bottom:1px solid color-mix(in srgb,currentColor 7%,transparent);border-radius:0;background:transparent}
.payments-plugin .pm-account-browser-row.is-leaf{grid-template-columns:10px minmax(0,1fr) auto auto}
.payments-plugin .pm-account-browser-row.is-search-result{grid-template-columns:10px minmax(0,1fr) auto auto;padding-left:0;text-align:left}
.payments-plugin .pm-account-browser-row:hover{background:color-mix(in srgb,currentColor 3%,var(--background))}
.payments-plugin .pm-account-browser-row.is-active:not(.is-selected){border-bottom-color:transparent;border-radius:6px;background:color-mix(in srgb,currentColor 6%,var(--background))}
.payments-plugin .pm-account-browser-row.is-selected{border-bottom-color:transparent;border-radius:6px;background:color-mix(in srgb,var(--pm-account-row-color,#2563eb) 6%,var(--background))}
.payments-plugin .pm-account-browser-row.is-located:not(.is-selected){border-bottom-color:transparent;border-radius:6px;background:color-mix(in srgb,var(--pm-account-row-color,#2563eb) 3%,var(--background))}
.payments-plugin .pm-account-browser-row.is-located:not(.is-selected) b{color:var(--pm-account-row-color,#2563eb)}
.payments-plugin .pm-account-browser-selection-marker{justify-self:start;align-self:stretch;width:3px;min-height:16px;margin:6px 0 6px 4px;border-radius:999px;background:var(--pm-account-row-color,#2563eb);visibility:hidden}
.payments-plugin .pm-account-browser-row.is-selected .pm-account-browser-selection-marker{visibility:visible}
.payments-plugin .pm-account-browser-row.is-selected:hover{background:color-mix(in srgb,var(--pm-account-row-color,#2563eb) 8%,var(--background))}
.payments-plugin .pm-account-browser-row.is-selected .pm-account-browser-expand-zone b,.payments-plugin .pm-account-browser-row.is-selected .pm-account-browser-enter-zone b{font-weight:650}
.payments-plugin .pm-account-browser-expand-zone,.payments-plugin .pm-account-browser-enter-zone{display:flex;align-items:center;min-width:0;padding:4px!important;border:0!important;border-radius:0!important;background:transparent!important}
.payments-plugin .pm-account-browser-expand-zone{justify-content:flex-start;gap:8px;text-align:left}
.payments-plugin .pm-account-browser-expand-zone:hover{background:color-mix(in srgb,currentColor 4%,var(--background))!important}
.payments-plugin .pm-account-browser-zone-label{display:flex;flex-direction:row;align-items:baseline;gap:6px;min-width:0}
.payments-plugin .pm-account-browser-zone-label>span{flex:0 0 auto;color:color-mix(in srgb,currentColor 42%,transparent);font-size:16px;line-height:1}
.payments-plugin .pm-account-browser-expand-zone b,.payments-plugin .pm-account-browser-enter-zone b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;font-weight:500}
.payments-plugin .pm-account-browser-expand-zone small{font-size:9px;font-weight:400;opacity:.42}
.payments-plugin .pm-account-browser-enter-zone{justify-content:flex-end;gap:6px;border-left:1px solid color-mix(in srgb,currentColor 7%,transparent)!important;color:color-mix(in srgb,currentColor 55%,transparent);font-size:10px!important;text-align:right}
.payments-plugin .pm-account-browser-enter-zone:hover{background:color-mix(in srgb,currentColor 5%,var(--background))!important;color:inherit}
.payments-plugin .pm-account-browser-enter-zone>span:last-child{font-size:16px;opacity:.4}
.payments-plugin .pm-account-browser-enter-zone.is-leaf-option{justify-content:space-between;border-left:0!important;color:inherit;font-size:12px!important;text-align:left}
.payments-plugin .pm-account-browser-enter-zone.is-leaf-option>span:first-child{display:flex;align-items:baseline;gap:6px;min-width:0;padding-left:12px}
.payments-plugin .pm-account-browser-enter-zone.is-search-result{justify-content:space-between;gap:12px;padding:8px!important;border-left:0!important;color:inherit;font-size:12px!important;text-align:left}
.payments-plugin .pm-account-browser-search-main{display:flex;flex:1 1 auto;align-items:center;gap:8px;min-width:0}
.payments-plugin .pm-account-browser-search-main b{flex:0 1 auto;font-size:12px;font-weight:600}
.payments-plugin .pm-account-browser-search-main small{flex:0 0 auto;padding:1px 5px;border-radius:999px;background:color-mix(in srgb,currentColor 5%,var(--background));font-size:10px;font-weight:500;line-height:1.4;opacity:.62}
.payments-plugin .pm-account-browser-search-action{display:grid;place-items:center;flex:0 0 20px;width:20px;color:color-mix(in srgb,currentColor 48%,transparent);font-size:16px;line-height:1;white-space:nowrap}
.payments-plugin .pm-account-browser-row.is-selected .pm-account-browser-expand-zone:hover,.payments-plugin .pm-account-browser-row.is-selected .pm-account-browser-enter-zone:hover{background:transparent!important}
.payments-plugin .pm-account-browser-row.is-search-result.is-selected .pm-account-browser-search-action{color:var(--pm-account-row-color,#2563eb)}
.payments-plugin .pm-account-browser-row.is-search-result.is-active .pm-account-browser-search-action{color:inherit}
.payments-plugin .pm-account-browser-pick{display:grid;place-items:center;align-self:center;width:24px;height:24px;min-height:0;margin:0 2px!important;padding:0!important;border-color:transparent!important;background:transparent!important;font-size:14px!important;line-height:1;white-space:nowrap}
.payments-plugin .pm-account-browser-pick:hover{border-color:color-mix(in srgb,currentColor 12%,transparent)!important;background:color-mix(in srgb,currentColor 4%,var(--background))!important}
.payments-plugin .pm-account-browser-child-add{display:grid!important;place-items:center;align-self:center;width:24px!important;height:24px!important;min-height:0!important;max-height:24px!important;margin:0 3px 0 0!important;padding:0!important;border:0!important;border-radius:4px!important;background:transparent!important;color:inherit;font-size:16px!important;line-height:1!important;opacity:0;overflow:hidden;transition:opacity .12s ease,background .12s ease}
.payments-plugin .pm-account-browser-row:hover .pm-account-browser-child-add,.payments-plugin .pm-account-browser-row:focus-within .pm-account-browser-child-add,.payments-plugin .pm-account-browser-child-add:focus-visible{opacity:1}
.payments-plugin .pm-account-browser-child-add:hover{background:color-mix(in srgb,currentColor 9%,var(--background))!important}
.payments-plugin .pm-account-browser-child-form{display:flex;flex-direction:column;gap:8px;margin:0;padding:9px 8px 10px 20px;border-bottom:1px solid color-mix(in srgb,currentColor 9%,transparent);background:color-mix(in srgb,currentColor 2%,var(--background))}
.payments-plugin .pm-account-browser-child-parent{font-size:12px;opacity:.7;overflow-wrap:anywhere}
.payments-plugin .pm-account-browser-child-parent strong{opacity:1;color:inherit}
.payments-plugin .pm-account-browser-child-fields{display:grid;grid-template-columns:minmax(0,1fr) minmax(130px,.8fr);gap:8px}
.payments-plugin .pm-account-browser-child-fields>label{display:flex;flex-direction:column;gap:4px;min-width:0;font-size:11px;opacity:.72}
.payments-plugin .pm-account-browser-child-fields input{width:100%;min-width:0;margin:0}
.payments-plugin .pm-account-browser-child-form>p{display:flex;flex-wrap:wrap;gap:5px;margin:0;font-size:11px}
.payments-plugin .pm-account-browser-child-form>p>code{padding:0;background:transparent;font-size:11px;overflow-wrap:anywhere}
.payments-plugin .pm-account-browser-child-actions{display:flex;flex-wrap:wrap;align-items:center;justify-content:flex-end;gap:6px}
.payments-plugin .pm-account-browser-child-actions>span{margin-right:auto;font-size:11px;color:#b45309}
.payments-plugin .pm-account-browser-child-actions>button{padding:5px 8px;font-size:11px}
.payments-plugin .pm-account-browser-child-actions>.pm-account-browser-current{border-color:#2563eb;background:#2563eb;color:#fff;font-weight:600}
.payments-plugin .pm-account-browser-child-actions>.pm-account-browser-current:disabled{border-color:color-mix(in srgb,currentColor 14%,transparent);background:color-mix(in srgb,currentColor 7%,var(--background));color:color-mix(in srgb,currentColor 48%,var(--background));opacity:1}
.payments-plugin .pm-account-browser-empty{margin:0;padding:16px 8px;text-align:center;font-size:12px;opacity:.55}
.payments-plugin .pm-account-browser-footer{display:flex;flex-wrap:wrap;align-items:center;justify-content:flex-end;gap:6px;flex:0 0 auto;padding:8px 10px;margin:0;border-top:1px solid color-mix(in srgb,currentColor 10%,transparent)}
.payments-plugin .pm-account-browser-footer>span{flex:1 1 100%;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:10px;opacity:.62}
.payments-plugin .pm-account-browser-footer>button{padding:5px 8px;font-size:11px}
.payments-plugin .pm-account-browser-footer>.pm-account-browser-current{border-color:#2563eb;background:#2563eb;color:#fff;font-weight:600}
.payments-plugin .pm-account-browser-footer>.pm-account-browser-current:disabled{border-color:color-mix(in srgb,currentColor 14%,transparent);background:color-mix(in srgb,currentColor 7%,var(--background));color:color-mix(in srgb,currentColor 48%,var(--background));opacity:1}
.payments-plugin .pm-field-error{margin:6px 0;color:#b91c1c;font-size:12px}
.payments-plugin td>.pm-search-select{width:230px;max-width:250px}
.payments-plugin td>.pm-search-select>.pm-search-select-trigger>input[type=text]{width:100%}
.payments-plugin .pm-multi-chips{display:flex;gap:5px;flex-wrap:wrap;margin-top:7px}
.payments-plugin .pm-multi-chips>span{display:inline-flex;align-items:center;gap:4px;max-width:100%;padding:3px 4px 3px 8px;border-radius:999px;background:color-mix(in srgb,currentColor 8%,var(--background));font-size:12px}
.payments-plugin .pm-multi-chips>span>button{padding:0;border:0;background:transparent;line-height:1.2}
.payments-plugin .pm-search-multi.is-compact.has-selection>.pm-search-select-trigger{padding-right:44px}
.payments-plugin .pm-search-multi.is-compact .pm-search-select-trigger>span{min-width:0}
.payments-plugin .pm-multi-compact-clear{position:absolute;z-index:2;top:50%;right:23px;display:grid;place-items:center;width:22px!important;height:22px!important;min-height:0!important;margin:0!important;padding:0!important;border:0!important;border-radius:50%!important;background:transparent!important;color:color-mix(in srgb,currentColor 55%,transparent)!important;font-size:16px!important;line-height:1!important;transform:translateY(-50%)}
.payments-plugin .pm-multi-compact-clear:hover:not(:disabled){background:color-mix(in srgb,currentColor 7%,var(--background))!important;color:inherit!important}
.payments-plugin .pm-mapping-manager>summary{display:flex;align-items:center;justify-content:space-between;gap:18px;list-style:none;cursor:pointer}
.payments-plugin .pm-mapping-manager>summary::-webkit-details-marker{display:none}
.payments-plugin .pm-mapping-manager>summary span:first-child{display:flex;flex-direction:column;gap:4px}
.payments-plugin .pm-mapping-manager>summary small{font-size:12px;font-weight:400;opacity:.65}
.payments-plugin .pm-mapping-summary-action{padding:6px 10px;border-radius:6px;background:color-mix(in srgb,#2563eb 9%,var(--background));color:#2563eb;font-size:12px;font-weight:650;white-space:nowrap}
.payments-plugin .pm-mapping-manager[open] .pm-mapping-summary-action{color:#6b7280;background:color-mix(in srgb,currentColor 6%,var(--background))}
.payments-plugin .pm-mapping-manager-body{margin-top:16px;padding-top:16px;border-top:1px solid color-mix(in srgb,currentColor 12%,transparent)}
.payments-plugin .pm-mapping-overview{display:grid;grid-template-columns:minmax(150px,auto) minmax(240px,1fr);gap:10px 18px;align-items:center;margin-bottom:16px}
.payments-plugin .pm-mapping-overview>div:first-child{display:flex;gap:8px;align-items:baseline}
.payments-plugin .pm-mapping-overview>div:first-child span{font-size:12px;opacity:.65}
.payments-plugin .pm-mapping-overview>input{width:100%}
.payments-plugin .pm-saved-mappings{grid-column:1/-1;display:grid;gap:14px;max-height:520px;overflow:auto;padding:2px}
.payments-plugin .pm-saved-provider{display:grid;gap:8px}
.payments-plugin .pm-saved-provider-heading{display:flex;align-items:baseline;justify-content:space-between;gap:12px;padding:0 2px;border-bottom:1px solid color-mix(in srgb,currentColor 10%,transparent);padding-bottom:7px}
.payments-plugin .pm-saved-provider-heading strong{font-size:13px}
.payments-plugin .pm-saved-provider-heading span{font-size:11px;opacity:.62}
.payments-plugin .pm-saved-groups{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));align-items:start;align-content:start;gap:9px}
.payments-plugin .pm-saved-group{display:grid;align-content:start;gap:11px;min-width:0;padding:11px;border:1px solid color-mix(in srgb,currentColor 10%,transparent);border-radius:8px;background:color-mix(in srgb,currentColor 2.5%,var(--background))}
.payments-plugin .pm-saved-group-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
.payments-plugin .pm-saved-group-heading>div{display:grid;gap:2px;min-width:0}
.payments-plugin .pm-saved-group-heading small,.payments-plugin .pm-saved-rule-group>span{font-size:10px;font-weight:650;letter-spacing:.04em;opacity:.55}
.payments-plugin .pm-saved-group-heading strong{font-size:12px;overflow-wrap:anywhere}
.payments-plugin .pm-saved-delete{flex:0 0 auto;padding:4px 8px!important;font-size:11px!important}
.payments-plugin .pm-saved-rule-groups{display:grid;gap:9px}
.payments-plugin .pm-saved-rule-group{display:grid;gap:5px}
.payments-plugin .pm-saved-rule-group>div{display:flex;flex-wrap:wrap;gap:5px}
.payments-plugin .pm-saved-rule-chip{display:inline-flex;align-items:baseline;gap:5px;max-width:100%;padding:4px 7px;border:1px solid color-mix(in srgb,currentColor 11%,transparent);border-radius:5px;background:color-mix(in srgb,currentColor 3%,var(--background));font-size:11px;overflow-wrap:anywhere}
.payments-plugin .pm-saved-rule-chip small{font-size:9px;opacity:.55;white-space:nowrap}
.payments-plugin .pm-saved-mappings>p{grid-column:1/-1}
.payments-plugin .pm-mapping-editors{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
.payments-plugin .pm-mapping-editor{--pm-action-color:#2563eb;min-width:0;padding:5px;border:1px solid color-mix(in srgb,var(--pm-action-color) 30%,transparent);border-radius:10px;background:color-mix(in srgb,var(--pm-action-color) 6%,var(--background))}
.payments-plugin .pm-mapping-editor.pm-category-action{--pm-action-color:#7c3aed}
.payments-plugin .pm-mapping-editor:focus-within{border-color:var(--pm-action-color)}
.payments-plugin .pm-mapping-editor-form{display:flex;align-items:center;gap:4px;min-width:0}
.payments-plugin .pm-mapping-editor-form>.pm-search-select{flex:1 1 0;min-width:120px}
.payments-plugin .pm-mapping-editor-form>.pm-search-select>.pm-search-select-trigger{border-color:transparent;background:transparent}
.payments-plugin .pm-mapping-editor-form>.pm-account-arrow{flex:0 0 auto}
.payments-plugin .pm-mapping-save{display:inline-flex;flex:0 0 auto;align-items:center;justify-content:center;gap:6px;min-height:36px;padding:0 10px!important;white-space:nowrap;background:var(--pm-action-color)!important;border-color:var(--pm-action-color)!important}
.payments-plugin .pm-mapping-save>small{display:grid;place-items:center;min-width:17px;height:17px;padding:0 4px;border-radius:999px;background:#ffffff2b;font-size:10px;font-weight:650;line-height:1}
.payments-plugin .pm-toolbar-mapping-editors{margin:14px 0}
.payments-plugin .pm-search-select-tag-group{flex:0 0 auto;padding:1px 1px 8px;margin-bottom:8px;border-bottom:1px solid color-mix(in srgb,currentColor 8%,transparent)}
.payments-plugin .pm-search-select-tag-group>div{display:flex;flex-direction:column;gap:5px;min-width:0}
.payments-plugin .pm-search-select-tag-row{display:flex;flex-wrap:wrap;gap:5px;min-width:0}
.payments-plugin .pm-search-select-tag-group button{flex:0 0 auto;padding:3px 8px!important;border:1px solid color-mix(in srgb,var(--pm-select-tag-color) 22%,transparent)!important;border-radius:999px!important;background:color-mix(in srgb,var(--pm-select-tag-color) 6%,var(--background))!important;color:color-mix(in srgb,var(--pm-select-tag-color) 84%,var(--foreground))!important;font-size:11px!important;line-height:1.4;white-space:nowrap}
.payments-plugin .pm-search-select-tag-group button[aria-pressed=true]{color:white!important;background:var(--pm-select-tag-color)!important;border-color:var(--pm-select-tag-color)!important}
@media(max-width:900px){.payments-plugin .pm-mapping-editors{grid-template-columns:1fr}.payments-plugin .pm-mapping-overview{grid-template-columns:1fr}.payments-plugin .pm-saved-mappings{grid-column:auto}}
@media(max-width:1500px){.payments-plugin .pm-toolbar-mapping-editors{grid-template-columns:1fr}}
@media(max-width:700px){.payments-plugin .pm-mapping-editor-form{flex-wrap:wrap}.payments-plugin .pm-mapping-editor-form>.pm-search-select{flex-basis:calc(50% - 24px);font-size:12px}.payments-plugin .pm-mapping-editor-form>.pm-account-arrow{display:none}.payments-plugin .pm-mapping-save{width:100%}}
@media(max-width:600px){.payments-plugin .pm-mapping-manager{padding:14px}.payments-plugin .pm-mapping-manager>summary{align-items:flex-start}.payments-plugin .pm-mapping-editor{padding:5px}.payments-plugin .pm-search-select-menu{position:fixed;top:auto;bottom:12px;left:12px;width:calc(100vw - 24px);max-width:none;max-height:65vh}.payments-plugin .pm-account-browser-pathbar{flex-wrap:wrap}.payments-plugin .pm-account-browser-expand-controls{width:100%;justify-content:flex-end}.payments-plugin .pm-account-browser-child-add{opacity:1}.payments-plugin .pm-account-browser-child-fields{grid-template-columns:1fr}}
.payments-plugin .pm-upload-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin:18px 0 24px}.payments-plugin .pm-upload-card{display:flex;align-items:center;gap:14px;width:100%;padding:20px;text-align:left;border-radius:12px;background:color-mix(in srgb,var(--pm-upload-color) 5%,var(--background));border:1px solid color-mix(in srgb,var(--pm-upload-color) 25%,transparent)}.payments-plugin .pm-upload-alipay{--pm-upload-color:#1677ff}.payments-plugin .pm-upload-wechat{--pm-upload-color:#16a34a}.payments-plugin .pm-upload-card:hover:not(:disabled){border-color:var(--pm-upload-color);background:color-mix(in srgb,var(--pm-upload-color) 9%,var(--background))}.payments-plugin .pm-upload-icon{display:grid;place-items:center;flex-shrink:0;width:40px;height:40px;border-radius:10px;background:var(--pm-upload-color);color:white;font-size:22px;font-weight:700}.payments-plugin .pm-upload-card strong{display:block;font-size:15px}.payments-plugin .pm-upload-card small{display:block;margin-top:5px;font-weight:400;opacity:.65}.payments-plugin .pm-upload-arrow{margin-left:auto;font-size:22px;color:var(--pm-upload-color)}.payments-plugin .pm-draft-actions{display:flex;gap:8px;flex-shrink:0}.payments-plugin button.pm-danger{color:#dc2626;border-color:color-mix(in srgb,#dc2626 25%,transparent)}.payments-plugin button.pm-danger:hover:not(:disabled){background:color-mix(in srgb,#dc2626 7%,var(--background))}@media(max-width:600px){.payments-plugin .pm-upload-grid{grid-template-columns:1fr}.payments-plugin .pm-file{flex-wrap:wrap}.payments-plugin .pm-upload-card{padding:16px}}

      .payments-plugin{font-size:14px;color:var(--foreground);padding:24px;max-width:1800px;margin:auto}
      .payments-plugin *{box-sizing:border-box}.payments-plugin h1{font-size:24px;font-weight:650;margin:0 0 8px}.payments-plugin h2{font-size:16px;font-weight:600;margin:0 0 12px}
      .payments-plugin p{margin:6px 0;line-height:1.65}.payments-plugin .pm-muted{opacity:.65;font-size:12px}.payments-plugin .pm-bar{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin:14px 0}
      .payments-plugin button,.payments-plugin select,.payments-plugin input:not([type=checkbox]){border:1px solid color-mix(in srgb,currentColor 20%,transparent);border-radius:6px;padding:7px 10px;background:var(--background);color:inherit;font:inherit}
      .payments-plugin button{cursor:pointer}.payments-plugin button:disabled{opacity:.4;cursor:not-allowed}.payments-plugin .pm-primary{background:#176b50;color:white;border-color:#176b50}
      .payments-plugin .pm-card{border:1px solid color-mix(in srgb,currentColor 14%,transparent);border-radius:10px;padding:18px;margin:18px 0}.payments-plugin .pm-error{background:#fef2f2;color:#991b1b;padding:12px;border-radius:6px;margin:12px 0}.payments-plugin .pm-notice{background:#ecfdf5;color:#065f46;padding:12px;border-radius:6px;margin:12px 0}
      .payments-plugin .pm-scroll{overflow:auto;max-height:65vh}.payments-plugin table{border-collapse:collapse;width:100%;font-size:13px}.payments-plugin th,.payments-plugin td{text-align:left;border-bottom:1px solid color-mix(in srgb,currentColor 12%,transparent);padding:10px;vertical-align:top}.payments-plugin th{position:sticky;top:0;background:var(--background);z-index:1;white-space:nowrap}
      .payments-plugin td select{max-width:250px;width:230px}.payments-plugin td input[type=text]{width:110px}.payments-plugin .pm-payee{min-width:180px;max-width:310px;overflow-wrap:anywhere}.payments-plugin .pm-warning{color:#b45309;font-size:12px;max-width:320px}.payments-plugin .pm-warning-review{display:inline-flex;align-items:center;gap:8px;flex-wrap:wrap;max-width:none}.payments-plugin .pm-review-button{padding:3px 9px!important;border-color:color-mix(in srgb,#d97706 32%,transparent)!important;background:color-mix(in srgb,#f59e0b 8%,var(--background))!important;color:#92400e;font-size:12px!important;font-weight:600;white-space:nowrap}.payments-plugin .pm-review-button:hover:not(:disabled){border-color:#d97706!important;background:color-mix(in srgb,#f59e0b 14%,var(--background))!important}.payments-plugin .pm-duplicate{background:color-mix(in srgb,#f59e0b 8%,transparent)}.payments-plugin .pm-row-not-imported{background:color-mix(in srgb,#64748b 6%,transparent)}.payments-plugin .pm-not-imported{border:1px solid color-mix(in srgb,#64748b 22%,transparent);border-left:5px solid #64748b;border-radius:6px;padding:7px 9px;margin:8px 0;background:color-mix(in srgb,#64748b 7%,var(--background));color:var(--foreground);font-size:12px}.payments-plugin .pm-not-imported strong{color:#475569}.payments-plugin .pm-not-imported p{margin:2px 0 6px}.payments-plugin .pm-not-imported button{padding:3px 8px!important;font-size:11px!important}.payments-plugin .pm-not-import-button{border-color:color-mix(in srgb,#64748b 28%,transparent)!important;background:color-mix(in srgb,#64748b 7%,var(--background))!important;color:#475569!important}.payments-plugin .pm-not-import-button:hover:not(:disabled){border-color:#64748b!important;background:color-mix(in srgb,#64748b 12%,var(--background))!important}.payments-plugin summary{cursor:pointer}.payments-plugin .pm-file{display:flex;justify-content:space-between;gap:15px;align-items:center;padding:8px 0;border-bottom:1px solid color-mix(in srgb,currentColor 10%,transparent)}.payments-plugin .pm-file span{overflow-wrap:anywhere}.payments-plugin label{display:inline-flex;gap:6px;align-items:center}.payments-plugin .pm-view-switcher{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:8px 0 2px}.payments-plugin .pm-view-switcher-label{font-size:11px;font-weight:650;letter-spacing:.08em;color:color-mix(in srgb,currentColor 55%,transparent)}.payments-plugin .pm-view-switcher-note{font-size:11px;color:color-mix(in srgb,currentColor 48%,transparent)}.payments-plugin .pm-stats{display:flex;gap:6px;flex-wrap:wrap;align-items:baseline}.payments-plugin .pm-stats strong{font-size:22px}.payments-plugin .pm-confirm{border:1px solid #b45309;border-radius:8px;padding:16px;margin:16px 0}.payments-plugin .pm-ai{color:#176b50;font-size:12px}
      .payments-plugin .pm-review-view{border-color:color-mix(in srgb,#2563eb 28%,transparent)!important;background:color-mix(in srgb,#2563eb 8%,var(--background))!important;color:#1d4ed8!important}
      .payments-plugin .pm-review-view:hover:not(:disabled){border-color:#2563eb!important;background:color-mix(in srgb,#2563eb 14%,var(--background))!important}
      .payments-plugin .pm-review-view[aria-pressed=true]{border-color:#2563eb!important;background:color-mix(in srgb,#2563eb 20%,var(--background))!important;font-weight:700}
      .dark .payments-plugin .pm-review-view{color:#93c5fd!important}
      .payments-plugin table{border-collapse:separate;border-spacing:0 8px}.payments-plugin .pm-income{--pm-flow:#15803d;background:color-mix(in srgb,#22c55e 9%,var(--background))}.payments-plugin .pm-expense{--pm-flow:#dc2626;background:color-mix(in srgb,#ef4444 7%,var(--background))}.payments-plugin .pm-transfer{--pm-flow:#2563eb;background:color-mix(in srgb,#3b82f6 7%,var(--background))}
      .payments-plugin tbody td:first-child{border-left:4px solid var(--pm-flow);border-radius:8px 0 0 8px}.payments-plugin tbody td:last-child{border-radius:0 8px 8px 0}.payments-plugin .pm-duplicate td:last-child{box-shadow:inset -3px 0 #d97706}.payments-plugin .pm-direction{color:var(--pm-flow);font-weight:650}.payments-plugin .pm-flow{display:flex;align-items:center;gap:10px;color:var(--pm-flow);margin:5px 0;font-size:12px}.payments-plugin .pm-arrow{font-size:27px;font-weight:700;line-height:1}.payments-plugin .pm-refund{border:1px solid var(--pm-refund);border-left:5px solid var(--pm-refund);background:color-mix(in srgb,var(--pm-refund) 10%,var(--background));border-radius:6px;padding:7px 9px;margin:8px 0;color:var(--foreground);font-size:12px}.payments-plugin .pm-refund strong{color:var(--pm-refund)}.payments-plugin .pm-legend{display:flex;gap:16px;flex-wrap:wrap;font-size:12px}
      .payments-plugin .pm-payment{font-size:12px;padding:3px 7px;color:#2563eb}.payments-plugin .pm-account-dialog{background:var(--background);color:var(--foreground);border:1px solid color-mix(in srgb,currentColor 20%,transparent);border-radius:14px;padding:24px;width:min(600px,calc(100vw - 32px));max-height:85vh;overflow:auto}.payments-plugin .pm-account-dialog::backdrop{background:#0008}.payments-plugin .pm-account-dialog h2{font-size:20px}.payments-plugin .pm-field{display:flex;flex-direction:column;align-items:stretch;gap:6px;margin:14px 0}.payments-plugin .pm-field>input,.payments-plugin .pm-field>select{width:100%}
      .payments-plugin .pm-refund-group>td{padding:0;border:0;border-radius:10px}.payments-plugin .pm-refund-drawer{border:1px solid color-mix(in srgb,#6b7280 28%,var(--background));border-radius:10px;background:color-mix(in srgb,#6b7280 12%,var(--background));overflow:hidden}.payments-plugin .pm-refund-drawer>summary{display:flex;align-items:center;gap:14px;padding:16px;list-style:none}.payments-plugin .pm-refund-drawer>summary::-webkit-details-marker{display:none}.payments-plugin .pm-refund-drawer>summary:focus-visible{outline:2px solid var(--foreground);outline-offset:-3px}.payments-plugin .pm-refund-chevron{font-size:26px;line-height:1;transition:transform .15s}.payments-plugin .pm-refund-drawer[open]>summary .pm-refund-chevron{transform:rotate(90deg)}.payments-plugin .pm-refund-overview{flex:1;min-width:0}.payments-plugin .pm-refund-heading{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:10px}.payments-plugin .pm-refund-facts{display:grid;grid-template-columns:minmax(190px,1fr) minmax(180px,1.4fr) minmax(210px,1fr);gap:12px 24px}.payments-plugin .pm-refund-facts small{display:block;opacity:.65;font-size:12px;margin-top:4px;line-height:1.5}.payments-plugin .pm-refund-facts>span:first-child>strong{font-size:18px;font-variant-numeric:tabular-nums}.payments-plugin .pm-refund-party{overflow-wrap:anywhere}.payments-plugin .pm-refund-action{font-size:12px;white-space:nowrap;opacity:.65}.payments-plugin .pm-refund-collapse,.payments-plugin .pm-refund-drawer[open] .pm-refund-expand{display:none}.payments-plugin .pm-refund-drawer[open] .pm-refund-collapse{display:inline}.payments-plugin .pm-refund-content{padding:0 14px 6px;border-top:1px solid color-mix(in srgb,#6b7280 20%,transparent);overflow:auto}.payments-plugin .pm-refund-content th{position:static;background:transparent}.payments-plugin .pm-refund-content table{min-width:1000px}@media(max-width:1000px){.payments-plugin .pm-refund-facts{grid-template-columns:repeat(2,minmax(180px,1fr))}.payments-plugin .pm-refund-facts>span:last-child{grid-column:1/-1}}@media(prefers-reduced-motion:reduce){.payments-plugin .pm-refund-chevron{transition:none}}
      .payments-plugin .pm-table-tools{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:10px 0}.payments-plugin .pm-table-search{position:relative;display:flex;flex:0 1 360px;min-width:min(100%,240px)}.payments-plugin .pm-table-search input[type=search]{width:100%;min-width:0;padding:7px 30px 7px 31px;border-color:color-mix(in srgb,currentColor 18%,transparent);background:color-mix(in srgb,currentColor 2%,var(--background))}.payments-plugin .pm-table-search input[type=search]:focus{outline:2px solid color-mix(in srgb,#2563eb 28%,transparent);outline-offset:1px;border-color:color-mix(in srgb,#2563eb 42%,transparent)}.payments-plugin .pm-table-search-icon{position:absolute;left:10px;top:50%;transform:translateY(-50%);color:color-mix(in srgb,currentColor 48%,transparent);font-size:16px;line-height:1;pointer-events:none}.payments-plugin .pm-table-tools-copy{display:flex;flex:1 1 auto;align-items:center;justify-content:flex-end;gap:8px;flex-wrap:wrap;min-width:0;margin-left:auto}
      .payments-plugin .pm-column-heading{display:flex;align-items:center;justify-content:space-between;gap:14px;min-width:125px}.payments-plugin .pm-selection-heading{display:flex;align-items:center;gap:4px;min-width:0}.payments-plugin .pm-selection-heading>label{gap:4px}.payments-plugin .pm-bulk-trigger{display:inline-flex;align-items:center;gap:3px;padding:4px 5px!important;border-color:transparent!important;background:transparent!important;font-size:11px!important;font-weight:400;color:color-mix(in srgb,var(--foreground) 58%,transparent);white-space:nowrap}.payments-plugin .pm-bulk-trigger:hover:not(:disabled),.payments-plugin .pm-bulk-trigger-open{background:color-mix(in srgb,#6b7280 10%,var(--background))!important}.payments-plugin .pm-filter-trigger{display:inline-flex;align-items:center;gap:5px;padding:4px 6px;border-color:transparent;background:transparent;font-size:12px;font-weight:400;color:color-mix(in srgb,var(--foreground) 60%,transparent);white-space:nowrap}.payments-plugin .pm-filter-trigger:hover,.payments-plugin .pm-filter-trigger[aria-expanded=true]{background:color-mix(in srgb,#6b7280 10%,var(--background))}.payments-plugin .pm-filter-trigger.pm-filter-active{color:#2563eb;background:color-mix(in srgb,#2563eb 8%,var(--background))}.payments-plugin .pm-filter-count{font-size:11px;font-weight:650}.payments-plugin .pm-filter-popover{position:fixed;inset:auto;margin:0;padding:16px;width:min(320px,calc(100vw - 24px));max-height:min(560px,calc(100dvh - 24px));overflow:auto;background:var(--background);color:var(--foreground);border:1px solid color-mix(in srgb,currentColor 15%,transparent);border-radius:12px;box-shadow:0 12px 40px #0002;font-size:13px;font-weight:400;white-space:normal}.payments-plugin .pm-bulk-popover{width:min(300px,calc(100vw - 24px))}.payments-plugin .pm-bulk-popover:popover-open{display:grid;gap:10px}.payments-plugin .pm-bulk-popover>p{margin:0}.payments-plugin .pm-filter-title{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px}.payments-plugin .pm-filter-field{display:flex;flex-direction:column;align-items:stretch;gap:6px;margin:12px 0;font-size:12px}.payments-plugin .pm-filter-field input{width:100%;min-width:0;font-size:13px}.payments-plugin .pm-filter-choices{padding:0;margin:10px 0 0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.payments-plugin .pm-filter-choices legend{font-size:12px;padding:0 8px 0 0}.payments-plugin .pm-filter-choices label{padding:6px 0;white-space:normal;align-items:flex-start;font-size:13px}.payments-plugin .pm-filter-choices input{accent-color:#2563eb;margin-top:2px;flex-shrink:0}.payments-plugin .pm-filter-footer{display:flex;justify-content:space-between;gap:12px;padding-top:14px;margin-top:14px;border-top:1px solid color-mix(in srgb,currentColor 10%,transparent)}.payments-plugin .pm-filter-footer button{font-size:12px}.payments-plugin .pm-filter-chips{display:flex;align-items:flex-start;gap:8px;flex-wrap:wrap;margin:10px 0 12px}.payments-plugin .pm-filter-chip{display:inline-flex;align-items:center;gap:2px;max-width:100%;padding:2px 3px 2px 2px;border:1px solid color-mix(in srgb,#2563eb 18%,transparent);border-radius:7px;background:color-mix(in srgb,#2563eb 7%,var(--background));color:#2563eb}.payments-plugin .pm-filter-chip[data-excluded=true]{border-color:color-mix(in srgb,#d97706 25%,transparent);background:color-mix(in srgb,#d97706 8%,var(--background));color:#b45309}.payments-plugin .pm-filter-chip-toggle{min-width:0;min-height:28px;padding:3px 6px!important;border:0!important;border-radius:4px!important;background:transparent!important;color:inherit;font-size:12px!important;text-align:left;overflow-wrap:anywhere}.payments-plugin .pm-filter-chip-remove{display:grid;place-items:center;flex:0 0 24px;width:24px!important;min-height:24px;height:24px;margin:0;padding:0!important;border:0!important;border-radius:4px!important;background:transparent!important;color:inherit;line-height:1;opacity:.65;box-shadow:none}.payments-plugin .pm-filter-chip-remove:hover{opacity:1;background:color-mix(in srgb,currentColor 10%,transparent)!important}.payments-plugin .pm-filter-chip-remove:focus-visible{opacity:1;outline:2px solid currentColor;outline-offset:-2px}.payments-plugin .pm-filter-chip-remove:not(:disabled):active{transform:none}.payments-plugin .pm-filter-clear-all{margin-left:auto;align-self:center;font-size:12px!important}
      .payments-plugin .pm-bulk-rule-types .pm-search-select{width:100%}
      .payments-plugin .pm-selection-undo{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:7px 10px;margin-bottom:8px;border:1px solid color-mix(in srgb,#176b50 22%,transparent);border-radius:7px;background:color-mix(in srgb,#176b50 7%,var(--background));color:#176b50;font-size:12px}
      .payments-plugin .pm-selection-undo button{padding:2px 8px!important;border-color:color-mix(in srgb,#176b50 25%,transparent)!important;color:#176b50;font-size:12px!important;font-weight:650}
      .payments-plugin .pm-review-actions{align-items:center}
      .payments-plugin .pm-commit-dock .pm-bulk-trigger{padding:7px 10px!important;border-color:color-mix(in srgb,currentColor 20%,transparent)!important;background:var(--background)!important;font-size:13px!important;font-weight:500;color:var(--foreground)}
      @media(max-width:900px){.payments-plugin .pm-table-search{flex-basis:100%}.payments-plugin .pm-table-tools-copy{justify-content:flex-start;margin-left:0}}

      .payments-plugin .pm-page-size{width:85px}
      @media(max-width:1000px){.payments-plugin .pm-filter-clear-all{margin-left:0}}

      .payments-plugin .pm-filter-group{--pm-range-color:#2563eb;--pm-range-muted:color-mix(in srgb,currentColor 15%,var(--background));border:0;border-top:1px solid color-mix(in srgb,currentColor 10%,transparent);padding:12px 0 0;margin:16px 0}.payments-plugin .pm-filter-group-header{position:sticky;top:-16px;z-index:1;display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px 0;background:var(--background)}.payments-plugin .pm-filter-group-header>strong{font-size:12px}.payments-plugin .pm-filter-group[data-excluded=true]{--pm-range-color:#b45309}.payments-plugin .pm-filter-polarity{display:flex;gap:3px;width:fit-content;background:color-mix(in srgb,currentColor 5%,var(--background));border-radius:6px;padding:3px;margin:0}.payments-plugin .pm-filter-polarity button{font-size:12px;padding:4px 14px;background:transparent;border-color:transparent}.payments-plugin .pm-filter-polarity button[aria-pressed=true]{color:#2563eb;background:color-mix(in srgb,#2563eb 10%,var(--background));border-color:color-mix(in srgb,#2563eb 20%,transparent)}.payments-plugin .pm-filter-polarity .pm-exclude-toggle[aria-pressed=true]{color:#b45309;background:color-mix(in srgb,#d97706 12%,var(--background));border-color:color-mix(in srgb,#d97706 25%,transparent)}.payments-plugin .pm-filter-chips>button.pm-filter-include{color:#2563eb}.payments-plugin .pm-filter-chips>button.pm-filter-exclude{color:#b45309;background:color-mix(in srgb,#d97706 9%,var(--background));border-color:color-mix(in srgb,#d97706 25%,transparent)}

      .payments-plugin .pm-range-slider{position:relative;height:28px;margin-top:16px}.payments-plugin .pm-range-track{position:absolute;top:11px;left:9px;right:9px;height:6px;border-radius:6px}.payments-plugin .pm-range-slider input[type=range]{position:absolute;inset:0;width:100%;height:28px;margin:0;padding:0;border:0;background:transparent;appearance:none;pointer-events:none;z-index:2;border-radius:0;outline:none}.payments-plugin .pm-range-slider input[type=range]::-webkit-slider-thumb{appearance:none;width:18px;height:18px;border:2px solid var(--pm-range-color);border-radius:50%;background:var(--background);pointer-events:auto;cursor:ew-resize;box-shadow:0 1px 3px #0002}.payments-plugin .pm-range-slider input[type=range]::-moz-range-thumb{width:14px;height:14px;border:2px solid var(--pm-range-color);border-radius:50%;background:var(--background);pointer-events:auto;cursor:ew-resize}.payments-plugin .pm-range-slider input[type=range]:focus-visible::-webkit-slider-thumb{outline:3px solid color-mix(in srgb,var(--pm-range-color) 30%,transparent);outline-offset:2px}.payments-plugin .pm-range-slider input[type=range]:focus-visible::-moz-range-thumb{outline:3px solid color-mix(in srgb,var(--pm-range-color) 30%,transparent);outline-offset:2px}.payments-plugin .pm-range-bounds{display:flex;justify-content:space-between;font-size:11px;opacity:.65;font-variant-numeric:tabular-nums}
.payments-plugin .pm-delete-control{display:inline-flex}.payments-plugin .pm-delete-control[title]{cursor:not-allowed}.payments-plugin .pm-delete-control[title]>button:disabled{pointer-events:none}.payments-plugin button.pm-danger:disabled{color:#6b7280;border-color:color-mix(in srgb,#6b7280 25%,transparent);background:color-mix(in srgb,#6b7280 7%,var(--background));opacity:.65}

.payments-plugin .pm-statements-card{padding:0;overflow:hidden;border-radius:14px;background:linear-gradient(180deg,color-mix(in srgb,currentColor 2%,var(--background)),var(--background) 90px)}
.payments-plugin .pm-statements-head{display:flex;justify-content:space-between;gap:24px;align-items:flex-start;padding:20px 22px 18px;border-bottom:1px solid color-mix(in srgb,currentColor 10%,transparent)}
.payments-plugin .pm-statements-head>div:first-child{min-width:0}
.payments-plugin .pm-statements-head>div:first-child>p{max-width:680px;margin-top:7px}
.payments-plugin .pm-statements-title{display:flex;align-items:center;gap:9px}
.payments-plugin .pm-statements-title h2{margin:0;font-size:18px;letter-spacing:-.01em}
.payments-plugin .pm-statement-count{padding:2px 8px;border:1px solid color-mix(in srgb,currentColor 11%,transparent);border-radius:999px;background:color-mix(in srgb,currentColor 3%,var(--background));font-size:11px;font-weight:550;opacity:.7}
.payments-plugin .pm-upload-actions{display:flex;flex-direction:column;align-items:flex-end;gap:7px;flex:0 0 auto}
.payments-plugin .pm-upload-actions .pm-upload-grid{display:flex;gap:8px;margin:0}
.payments-plugin .pm-upload-actions .pm-upload-card{width:auto;min-height:42px;padding:7px 11px 7px 8px;gap:8px;border-radius:9px;box-shadow:0 1px 0 color-mix(in srgb,var(--pm-upload-color) 10%,transparent)}
.payments-plugin .pm-upload-actions .pm-upload-icon{width:28px;height:28px;border-radius:7px;font-size:15px}
.payments-plugin .pm-upload-actions .pm-upload-card strong{font-size:12px;line-height:1.35}
.payments-plugin .pm-upload-actions .pm-upload-card small{margin-top:1px;font-size:10px;line-height:1.3;opacity:.58}
.payments-plugin .pm-upload-actions .pm-upload-arrow{display:none}
.payments-plugin .pm-statement-list{display:flex;flex-direction:column}
.payments-plugin .pm-statement{display:grid;grid-template-columns:38px minmax(0,1fr) auto;gap:13px;align-items:center;padding:15px 22px;border-bottom:1px solid color-mix(in srgb,currentColor 8%,transparent);transition:background .14s ease}
.payments-plugin .pm-statement:last-child{border-bottom:0}
.payments-plugin .pm-statement:hover{background:color-mix(in srgb,currentColor 2.5%,var(--background))}
.payments-plugin .pm-statement-provider{--pm-provider-color:#64748b;display:grid;place-items:center;width:38px;height:38px;border:1px solid color-mix(in srgb,var(--pm-provider-color) 24%,transparent);border-radius:10px;background:color-mix(in srgb,var(--pm-provider-color) 7%,var(--background));color:var(--pm-provider-color);font-size:16px;font-weight:700}
.payments-plugin .pm-statement-provider[data-provider=alipay]{--pm-provider-color:#1677ff}
.payments-plugin .pm-statement-provider[data-provider=wechat]{--pm-provider-color:#16a34a}
.payments-plugin .pm-statement-main{min-width:0}
.payments-plugin .pm-statement-heading{display:flex;align-items:center;gap:8px;min-width:0;flex-wrap:wrap}
.payments-plugin .pm-statement-name{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px;font-weight:650}
.payments-plugin .pm-statement-status{padding:2px 7px;border:1px solid color-mix(in srgb,currentColor 12%,transparent);border-radius:999px;font-size:10px;font-weight:650;line-height:1.5;white-space:nowrap}
.payments-plugin .pm-statement-status[data-tone=pending]{border-color:color-mix(in srgb,#d97706 24%,transparent);background:color-mix(in srgb,#f59e0b 8%,var(--background));color:#b45309}
.payments-plugin .pm-statement-status[data-tone=partial]{border-color:color-mix(in srgb,#2563eb 24%,transparent);background:color-mix(in srgb,#3b82f6 7%,var(--background));color:#2563eb}
.payments-plugin .pm-statement-status[data-tone=posted]{border-color:color-mix(in srgb,#15803d 24%,transparent);background:color-mix(in srgb,#22c55e 7%,var(--background));color:#15803d}
.payments-plugin .pm-statement-status[data-tone=locked]{border-color:color-mix(in srgb,#6b7280 24%,transparent);background:color-mix(in srgb,#6b7280 7%,var(--background));color:color-mix(in srgb,currentColor 68%,transparent)}
.payments-plugin .pm-statement-status[data-tone=missing]{border-color:color-mix(in srgb,#dc2626 20%,transparent);background:color-mix(in srgb,#ef4444 6%,var(--background));color:#b91c1c}
.payments-plugin .pm-statement-path{margin:3px 0 0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:color-mix(in srgb,currentColor 48%,transparent);font-size:11px}
.payments-plugin .pm-statement-counts{display:flex;flex-wrap:wrap;align-items:center;gap:5px 14px;margin-top:8px;font-size:11px;color:color-mix(in srgb,currentColor 62%,transparent)}
.payments-plugin .pm-statement-counts span{position:relative}
.payments-plugin .pm-statement-counts span+span:before{position:absolute;left:-8px;content:"";width:2px;height:2px;border-radius:50%;background:currentColor;top:50%;opacity:.45}
.payments-plugin .pm-statement-counts b{font-size:12px;font-weight:700;color:var(--foreground);font-variant-numeric:tabular-nums}
.payments-plugin .pm-statement-empty{margin:5px 0 0;color:color-mix(in srgb,currentColor 52%,transparent);font-size:11px}
.payments-plugin .pm-statement-actions{display:flex;align-items:center;gap:5px}
.payments-plugin .pm-statement-actions>button{min-height:34px;padding:6px 12px;font-size:12px;font-weight:600;white-space:nowrap}
.payments-plugin .pm-statement-primary{border-color:#176b50;background:#176b50;color:#fff}
.payments-plugin .pm-statement-primary:hover:not(:disabled){background:#145c45;border-color:#145c45}
.payments-plugin button.pm-statement-delete{padding:6px 7px;border-color:transparent;background:transparent;font-size:11px;font-weight:500}
.payments-plugin button.pm-statement-delete:hover:not(:disabled){border-color:color-mix(in srgb,#dc2626 18%,transparent)}
.payments-plugin .pm-statements-empty{margin:0;padding:28px 22px;text-align:center;color:color-mix(in srgb,currentColor 55%,transparent)}
.payments-plugin .pm-statements-footer{margin:0;padding:9px 22px 11px;border-top:1px solid color-mix(in srgb,currentColor 7%,transparent);color:color-mix(in srgb,currentColor 42%,transparent);font-size:10px;line-height:1.5}
@media(max-width:680px){.payments-plugin .pm-statements-head{align-items:stretch;flex-direction:column;gap:14px;padding:17px}.payments-plugin .pm-upload-actions{align-items:flex-start}.payments-plugin .pm-upload-actions .pm-upload-grid{width:100%}.payments-plugin .pm-upload-actions .pm-upload-card{flex:1 1 0}.payments-plugin .pm-statement{grid-template-columns:34px minmax(0,1fr);gap:11px;padding:15px 17px}.payments-plugin .pm-statement-provider{width:34px;height:34px}.payments-plugin .pm-statement-actions{grid-column:1/-1;justify-content:flex-end}.payments-plugin .pm-statement-name{white-space:normal;overflow-wrap:anywhere}.payments-plugin .pm-statement-path{white-space:normal;overflow-wrap:anywhere}.payments-plugin .pm-statements-footer{padding-inline:17px}}
.payments-plugin .pm-bulk-popover{width:min(360px,calc(100vw - 24px))}
.payments-plugin .pm-bulk-rule-builder{display:flex;align-items:center;gap:7px}
.payments-plugin .pm-bulk-rule-mode{display:flex;gap:2px;padding:2px;border-radius:7px;background:color-mix(in srgb,currentColor 6%,var(--background))}
.payments-plugin .pm-bulk-rule-mode button{padding:5px 9px!important;border-color:transparent!important;background:transparent!important;font-size:11px!important}
.payments-plugin .pm-bulk-rule-mode .pm-bulk-include[aria-pressed=true]{border-color:color-mix(in srgb,#2563eb 22%,transparent)!important;background:color-mix(in srgb,#2563eb 12%,var(--background))!important;color:#2563eb}
.payments-plugin .pm-bulk-rule-mode .pm-bulk-exclude[aria-pressed=true]{border-color:color-mix(in srgb,#d97706 28%,transparent)!important;background:color-mix(in srgb,#d97706 12%,var(--background))!important;color:#b45309}
.payments-plugin .pm-bulk-rules{display:grid;gap:6px}
.payments-plugin .pm-bulk-rule{display:grid;grid-template-columns:auto minmax(0,1fr) auto 18px;align-items:center;gap:7px;padding:7px 8px;border:1px solid color-mix(in srgb,currentColor 12%,transparent);border-radius:7px;font-size:12px}
.payments-plugin .pm-bulk-rule[data-mode=include]{border-color:color-mix(in srgb,#2563eb 20%,transparent);background:color-mix(in srgb,#2563eb 5%,var(--background))}
.payments-plugin .pm-bulk-rule[data-mode=exclude]{border-color:color-mix(in srgb,#d97706 25%,transparent);background:color-mix(in srgb,#d97706 6%,var(--background))}
.payments-plugin .pm-bulk-rule strong{font-size:11px;white-space:nowrap}
.payments-plugin .pm-bulk-rule[data-mode=include] strong{color:#2563eb}
.payments-plugin .pm-bulk-rule[data-mode=exclude] strong{color:#b45309}
.payments-plugin .pm-bulk-rule>span{min-width:0;overflow-wrap:anywhere}
.payments-plugin .pm-bulk-rule small{display:grid;place-items:center;min-width:20px;height:20px;padding:0 5px;border-radius:999px;background:color-mix(in srgb,currentColor 8%,var(--background));font-size:10px;font-weight:650}
.payments-plugin .pm-bulk-rule>button{display:grid;place-items:center;width:18px!important;height:18px;padding:0!important;border:0!important;border-radius:999px!important;background:transparent!important;color:color-mix(in srgb,var(--foreground) 55%,transparent);font-size:13px!important;line-height:1}
.payments-plugin .pm-bulk-rule>button:hover{color:#b91c1c;background:color-mix(in srgb,#dc2626 9%,var(--background))!important}
.payments-plugin .pm-bulk-rule-apply{display:flex;align-items:center;justify-content:space-between;gap:10px;padding-top:12px;border-top:1px solid color-mix(in srgb,currentColor 10%,transparent)}
.payments-plugin .pm-bulk-rule-apply>span{min-width:0;line-height:1.45}
.payments-plugin .pm-bulk-rule-apply button{flex:0 0 auto;font-size:12px!important}
.payments-plugin .pm-bulk-rule-hint{margin:6px 0 0!important;font-size:11px}
@media(max-width:520px){.payments-plugin .pm-bulk-rule-apply{align-items:stretch;flex-direction:column}.payments-plugin .pm-bulk-rule-apply button{align-self:flex-end}}

/* Payments workspace: clearer hierarchy for library, review and commit. */
.payments-plugin{
  --pm-accent:#176b50;
  --pm-accent-deep:#0f4f3b;
  --pm-accent-soft:color-mix(in srgb,#176b50 7%,var(--background));
  --pm-border:color-mix(in srgb,currentColor 11%,transparent);
  --pm-border-strong:color-mix(in srgb,currentColor 19%,transparent);
  --pm-surface:color-mix(in srgb,#ffffff 38%,var(--background));
  --pm-surface-soft:color-mix(in srgb,#176b50 2.5%,var(--background));
  --pm-shadow:0 16px 42px color-mix(in srgb,#0f172a 7%,transparent);
  width:100%;
  min-width:0;
  max-width:1560px;
  padding:28px clamp(16px,3vw,34px) 110px;
  font-family:"Avenir Next","PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif;
  font-variant-numeric:tabular-nums;
}
.payments-plugin[data-reviewing=true]{padding-bottom:24px}
.dark .payments-plugin{
  --pm-accent:#86efac;
  --pm-accent-deep:#166534;
  --pm-accent-soft:color-mix(in srgb,#22c55e 8%,var(--background));
  --pm-shadow:0 18px 46px #0003;
}
.payments-plugin .pm-eyebrow,.payments-plugin .pm-section-label{
  display:block;
  color:color-mix(in srgb,var(--pm-accent) 88%,var(--foreground));
  font-size:10px;
  font-weight:750;
  letter-spacing:.13em;
  line-height:1.4;
  text-transform:uppercase;
}
.payments-plugin .pm-page-head{
  display:grid;
  grid-template-columns:minmax(0,1fr) auto;
  gap:18px 32px;
  align-items:start;
  margin:0 0 22px;
  animation:pm-rise .38s ease both;
}
.payments-plugin .pm-page-copy{max-width:720px}
.payments-plugin .pm-page-copy h1{
  margin:7px 0 8px;
  font-size:clamp(30px,3vw,42px);
  font-weight:680;
  letter-spacing:-.045em;
  line-height:1.06;
}
.payments-plugin .pm-page-copy p{
  max-width:640px;
  margin:0;
  color:color-mix(in srgb,currentColor 65%,transparent);
  font-size:14px;
  line-height:1.75;
}
.payments-plugin .pm-local-badge{
  display:inline-flex;
  align-items:center;
  gap:8px;
  justify-self:end;
  grid-column:2;
  grid-row:1;
  margin-top:8px;
  padding:8px 11px;
  border:1px solid var(--pm-border);
  border-radius:999px;
  background:color-mix(in srgb,var(--background) 84%,transparent);
  color:color-mix(in srgb,currentColor 65%,transparent);
  font-size:11px;
  font-weight:560;
}
.payments-plugin .pm-local-badge i{
  width:7px;
  height:7px;
  border-radius:50%;
  background:#22c55e;
  box-shadow:0 0 0 4px color-mix(in srgb,#22c55e 13%,transparent);
}
.payments-plugin .pm-workflow{
  grid-column:1/-1;
  display:grid;
  grid-template-columns:repeat(3,minmax(0,1fr));
  gap:1px;
  margin:4px 0 0;
  padding:1px;
  overflow:hidden;
  border:1px solid var(--pm-border);
  border-radius:13px;
  background:var(--pm-border);
  list-style:none;
}
.payments-plugin .pm-workflow li{
  display:flex;
  align-items:center;
  gap:11px;
  min-width:0;
  padding:11px 14px;
  background:color-mix(in srgb,var(--background) 97%,transparent);
}
.payments-plugin .pm-workflow li>span{
  display:grid;
  place-items:center;
  flex:0 0 30px;
  width:30px;
  height:30px;
  border:1px solid var(--pm-border-strong);
  border-radius:9px;
  color:color-mix(in srgb,currentColor 48%,transparent);
  font-family:"SFMono-Regular",Consolas,monospace;
  font-size:10px;
  font-weight:700;
}
.payments-plugin .pm-workflow li>div{display:grid;gap:1px;min-width:0}
.payments-plugin .pm-workflow strong{font-size:12px;font-weight:680}
.payments-plugin .pm-workflow small{
  overflow:hidden;
  color:color-mix(in srgb,currentColor 53%,transparent);
  font-size:10px;
  text-overflow:ellipsis;
  white-space:nowrap;
}
.payments-plugin .pm-workflow li[data-state=active]{
  background:linear-gradient(135deg,var(--pm-accent-soft),var(--background) 76%);
}
.payments-plugin .pm-workflow li[data-state=active]>span{
  border-color:color-mix(in srgb,var(--pm-accent) 35%,transparent);
  background:var(--pm-accent-deep);
  color:#fff;
}
.payments-plugin .pm-workflow li[data-state=done]>span{
  border-color:color-mix(in srgb,var(--pm-accent) 24%,transparent);
  background:var(--pm-accent-soft);
  color:var(--pm-accent);
}
.payments-plugin .pm-readonly{
  padding:11px 13px;
  border:1px solid color-mix(in srgb,#d97706 25%,transparent);
  border-radius:10px;
  background:color-mix(in srgb,#f59e0b 7%,var(--background));
  color:#92400e;
}
.payments-plugin .pm-error,.payments-plugin .pm-notice{
  margin:12px 0;
  padding:11px 13px;
  border-radius:10px;
  font-size:12px;
  font-weight:540;
}
.payments-plugin .pm-notice{
  border:1px solid color-mix(in srgb,#059669 22%,transparent);
  background:color-mix(in srgb,#10b981 7%,var(--background));
  color:#047857;
}
.dark .payments-plugin .pm-notice{color:#6ee7b7}
.payments-plugin .pm-activity{
  display:flex;
  align-items:center;
  gap:9px;
  width:fit-content;
  margin:12px 0;
  padding:8px 11px;
  border:1px solid var(--pm-border);
  border-radius:999px;
  background:var(--background);
  color:color-mix(in srgb,currentColor 70%,transparent);
  font-size:12px;
}
.payments-plugin .pm-activity-dot{
  width:7px;
  height:7px;
  border-radius:50%;
  background:var(--pm-accent);
  animation:pm-pulse 1.3s ease-in-out infinite;
}
.payments-plugin .pm-card{
  margin:16px 0;
  border:1px solid var(--pm-border);
  border-radius:16px;
  background:var(--pm-surface);
  box-shadow:0 1px 0 color-mix(in srgb,#fff 60%,transparent);
}
.payments-plugin button{
  min-height:36px;
  border-radius:9px;
  font-size:12px;
  font-weight:580;
  transition:border-color .15s ease,background .15s ease,color .15s ease,transform .12s ease;
}
.payments-plugin button:not(:disabled):active{transform:translateY(1px)}
.payments-plugin button:focus-visible,.payments-plugin summary:focus-visible{
  outline:2px solid color-mix(in srgb,var(--pm-accent) 38%,transparent);
  outline-offset:2px;
}
.payments-plugin .pm-primary{
  border-color:var(--pm-accent-deep);
  background:var(--pm-accent-deep);
  color:#fff;
}
.payments-plugin .pm-primary:hover:not(:disabled){
  border-color:#0a3f2e;
  background:#0a3f2e;
}
.payments-plugin .pm-text-button{
  min-height:30px;
  padding:4px 8px;
  border-color:transparent;
  background:transparent;
  color:color-mix(in srgb,currentColor 60%,transparent);
}
.payments-plugin .pm-text-button:hover{background:color-mix(in srgb,currentColor 6%,var(--background))}
.payments-plugin .pm-statements-card{
  border-radius:16px;
  background:
    radial-gradient(circle at 100% 0,color-mix(in srgb,var(--pm-accent) 5%,transparent),transparent 34%),
    var(--pm-surface);
  box-shadow:var(--pm-shadow);
  animation:pm-rise .46s .04s ease both;
}
.payments-plugin .pm-statements-head{
  align-items:center;
  padding:19px 21px 17px;
}
.payments-plugin .pm-statements-title{
  display:flex;
  flex-wrap:wrap;
  align-items:center;
  gap:8px;
}
.payments-plugin .pm-statements-title .pm-eyebrow{
  flex-basis:100%;
  margin-bottom:2px;
}
.payments-plugin .pm-statements-title h2{
  margin:0;
  font-size:20px;
  font-weight:680;
  letter-spacing:-.025em;
}
.payments-plugin .pm-statements-head>div:first-child>p{
  max-width:660px;
  margin:6px 0 0;
  color:color-mix(in srgb,currentColor 60%,transparent);
  font-size:12px;
  line-height:1.55;
}
.payments-plugin .pm-statement-count{
  border:0;
  background:color-mix(in srgb,currentColor 6%,var(--background));
  color:color-mix(in srgb,currentColor 64%,transparent);
}
.payments-plugin .pm-upload-actions{gap:6px}
.payments-plugin .pm-upload-actions>.pm-section-label{justify-self:end}
.payments-plugin .pm-upload-actions .pm-upload-card{
  min-height:46px;
  border-radius:10px;
}
.payments-plugin .pm-statement{
  position:relative;
  grid-template-columns:42px minmax(0,1fr) auto;
  gap:15px;
  padding:15px 21px;
}
.payments-plugin .pm-statement.is-active{
  background:linear-gradient(90deg,var(--pm-accent-soft),transparent 55%);
}
.payments-plugin .pm-statement.is-active:before{
  position:absolute;
  inset:13px auto 13px 0;
  width:3px;
  border-radius:0 3px 3px 0;
  background:var(--pm-accent);
  content:"";
}
.payments-plugin .pm-statement-provider{
  width:42px;
  height:42px;
  border-radius:12px;
}
.payments-plugin .pm-statement-name{
  font-size:12px;
  font-weight:680;
}
.payments-plugin .pm-statement-path{margin-top:2px}
.payments-plugin .pm-statement-counts{
  gap:6px;
  margin-top:7px;
}
.payments-plugin .pm-statement-counts span{
  padding:2px 7px;
  border-radius:999px;
  background:color-mix(in srgb,currentColor 3.5%,var(--background));
}
.payments-plugin .pm-statement-counts span+span:before{display:none}
.payments-plugin .pm-statement-status{
  padding:3px 8px;
  font-size:10px;
}
.payments-plugin .pm-statement-actions{gap:7px}
.payments-plugin .pm-statement-actions>button{min-height:34px}
.payments-plugin .pm-statement-primary{
  border-color:var(--pm-accent-deep);
  border-radius:8px;
  background:var(--pm-accent-deep);
}
.payments-plugin button.pm-statement-delete{
  border-color:transparent;
  background:transparent;
  color:color-mix(in srgb,currentColor 50%,transparent);
}
.payments-plugin button.pm-statement-delete:hover:not(:disabled){
  color:#b91c1c;
  background:color-mix(in srgb,#dc2626 7%,var(--background));
}
.payments-plugin .pm-statements-footer{
  display:flex;
  gap:8px 20px;
  flex-wrap:wrap;
  padding:9px 21px;
  background:color-mix(in srgb,currentColor 1.5%,var(--background));
}
.payments-plugin .pm-statements-footer span+span:before{
  margin-right:20px;
  color:color-mix(in srgb,currentColor 30%,transparent);
  content:"·";
}
.payments-plugin .pm-mapping-manager{
  border-radius:13px;
  background:color-mix(in srgb,var(--background) 98%,transparent);
}
.payments-plugin .pm-mapping-manager>summary{padding:1px 3px}
.payments-plugin .pm-mapping-manager>summary strong{font-size:13px}
.payments-plugin .pm-review-workspace{
  margin:16px 0 24px;
  overflow:hidden;
  border:1px solid var(--pm-border);
  border-radius:18px;
  background:var(--pm-surface);
  box-shadow:var(--pm-shadow);
  animation:pm-rise .46s .08s ease both;
}
.payments-plugin .pm-workspace-head{
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap:20px;
  padding:19px 21px 15px;
  border-bottom:1px solid var(--pm-border);
  background:
    linear-gradient(110deg,var(--pm-accent-soft),transparent 44%),
    var(--pm-surface);
}
.payments-plugin .pm-batch-identity{
  display:flex;
  align-items:flex-start;
  gap:13px;
  min-width:0;
}
.payments-plugin .pm-batch-provider{
  --pm-provider:#64748b;
  display:grid;
  place-items:center;
  flex:0 0 44px;
  width:44px;
  height:44px;
  margin-top:2px;
  border:1px solid color-mix(in srgb,var(--pm-provider) 25%,transparent);
  border-radius:12px;
  background:color-mix(in srgb,var(--pm-provider) 8%,var(--background));
  color:var(--pm-provider);
  font-size:17px;
  font-weight:750;
}
.payments-plugin .pm-batch-provider[data-provider=alipay]{--pm-provider:#1677ff}
.payments-plugin .pm-batch-provider[data-provider=wechat]{--pm-provider:#14934a}
.payments-plugin .pm-batch-identity>div{min-width:0}
.payments-plugin .pm-batch-kicker{
  color:color-mix(in srgb,currentColor 54%,transparent);
  font-size:10px;
  font-weight:650;
  letter-spacing:.04em;
}
.payments-plugin .pm-batch-identity h2{
  margin:2px 0 1px;
  overflow:hidden;
  font-size:17px;
  font-weight:690;
  letter-spacing:-.025em;
  text-overflow:ellipsis;
  white-space:nowrap;
}
.payments-plugin .pm-batch-utility-actions{
  display:flex;
  flex:0 0 auto;
  align-items:center;
  gap:7px;
}
.payments-plugin .pm-save-state{
  display:inline-flex;
  align-items:center;
  gap:6px;
  padding:5px 8px;
  border-radius:999px;
  color:color-mix(in srgb,currentColor 62%,transparent);
  font-size:10px;
  white-space:nowrap;
}
.payments-plugin .pm-save-state i{
  width:6px;
  height:6px;
  border-radius:50%;
  background:#22c55e;
}
.payments-plugin .pm-save-state[data-state=dirty] i{background:#f59e0b}
.payments-plugin .pm-save-state[data-state=locked] i{background:#94a3b8}
.payments-plugin .pm-quiet-button{
  min-height:32px;
  padding:5px 9px;
  border-color:transparent;
  background:transparent;
  color:color-mix(in srgb,currentColor 58%,transparent);
  font-size:11px;
}
.payments-plugin .pm-quiet-button:hover:not(:disabled){background:color-mix(in srgb,currentColor 6%,var(--background))}
.payments-plugin .pm-progress-block{
  min-width:0;
  margin-bottom:12px;
  padding:2px 2px 12px;
  border-bottom:1px solid var(--pm-border);
}
.payments-plugin .pm-progress-heading{
  display:flex;
  align-items:flex-end;
  justify-content:space-between;
  gap:14px;
  margin-bottom:10px;
}
.payments-plugin .pm-progress-heading>div{display:grid;gap:2px}
.payments-plugin .pm-progress-heading strong{
  font-size:20px;
  font-weight:680;
  letter-spacing:-.025em;
}
.payments-plugin .pm-progress-heading>span{
  color:color-mix(in srgb,currentColor 52%,transparent);
  font-size:10px;
}
.payments-plugin .pm-progress-track{
  display:flex;
  width:100%;
  height:9px;
  overflow:hidden;
  border-radius:999px;
  background:color-mix(in srgb,currentColor 7%,var(--background));
}
.payments-plugin .pm-progress-track>span{display:block;height:100%}
.payments-plugin .pm-progress-committed{background:#15803d}
.payments-plugin .pm-progress-skipped{background:#94a3b8}
.payments-plugin .pm-progress-pending{background:#f59e0b}
.payments-plugin .pm-progress-caption{
  display:flex;
  flex-wrap:wrap;
  align-items:center;
  gap:6px 14px;
  margin:8px 0 0;
  color:color-mix(in srgb,currentColor 55%,transparent);
  font-size:10px;
}
.payments-plugin .pm-progress-caption span{display:inline-flex;align-items:center;gap:5px}
.payments-plugin .pm-progress-caption i{width:6px;height:6px;border-radius:50%}
.payments-plugin .pm-progress-caption i.is-committed{background:#15803d}
.payments-plugin .pm-progress-caption i.is-skipped{background:#94a3b8}
.payments-plugin .pm-progress-caption i.is-pending{background:#f59e0b}
.payments-plugin .pm-progress-caption em{
  margin-left:auto;
  color:color-mix(in srgb,currentColor 60%,transparent);
  font-style:normal;
}
.payments-plugin .pm-batch-meta{
  display:flex;
  flex-wrap:wrap;
  gap:5px 12px;
  margin-top:9px;
}
.payments-plugin .pm-batch-meta>span{
  display:inline-flex;
  align-items:baseline;
  gap:6px;
  max-width:100%;
  min-width:0;
  overflow:hidden;
  color:color-mix(in srgb,currentColor 50%,transparent);
  font-family:"SFMono-Regular",Consolas,monospace;
  font-size:9px;
  text-overflow:ellipsis;
  white-space:nowrap;
}
.payments-plugin .pm-batch-meta>span>span{
  min-width:0;
  overflow:hidden;
  text-overflow:ellipsis;
}
.payments-plugin .pm-batch-meta b{
  flex:0 0 auto;
  color:color-mix(in srgb,currentColor 72%,transparent);
  font-family:"Avenir Next","PingFang SC",sans-serif;
  font-weight:650;
}
.payments-plugin .pm-filter-board{
  margin:14px 21px;
  padding:11px 12px 10px;
  border:1px solid var(--pm-border);
  border-radius:12px;
  background:color-mix(in srgb,currentColor 1.3%,var(--background));
}
.payments-plugin .pm-filter-board-head{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:8px;
  padding:0 2px 5px;
}
.payments-plugin .pm-filter-board-head>div{display:flex;align-items:baseline;flex-wrap:wrap;gap:3px 8px}
.payments-plugin .pm-filter-board-head strong{font-size:10px;font-weight:400;color:color-mix(in srgb,currentColor 54%,transparent)}
.payments-plugin .pm-filter-board-head .pm-text-button{min-height:24px;padding:2px 6px;font-size:10px;white-space:nowrap}
.payments-plugin .pm-filter-groups{
  display:grid;
  grid-template-columns:minmax(0,2.6fr) minmax(0,6.4fr) minmax(0,1.8fr);
  align-items:start;
  gap:6px;
}
.payments-plugin .pm-filter-cluster{
  min-width:0;
  padding:5px;
  border:1px solid var(--pm-border);
  border-radius:7px;
  background:var(--background);
}
.payments-plugin .pm-filter-cluster-label{
  display:block;
  padding:0 4px 3px;
  color:color-mix(in srgb,currentColor 42%,transparent);
  font-size:9px;
  font-weight:700;
  letter-spacing:.08em;
}
.payments-plugin .pm-filter-cluster-heading{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:3px 6px;padding-bottom:3px}
.payments-plugin .pm-filter-cluster-heading .pm-filter-cluster-label{padding-bottom:0}
.payments-plugin .pm-completed-toggle{display:inline-flex;align-items:center;gap:4px;padding:0 3px;color:color-mix(in srgb,currentColor 62%,transparent);font-size:9px;white-space:nowrap;cursor:pointer}
.payments-plugin .pm-completed-toggle input{appearance:none;position:relative;box-sizing:border-box;flex:none;width:24px;height:14px;margin:0;border:1px solid var(--pm-border-strong);border-radius:8px;background:color-mix(in srgb,currentColor 12%,var(--background));cursor:pointer}
.payments-plugin .pm-completed-toggle input::before{content:"";position:absolute;top:2px;left:2px;width:8px;height:8px;border-radius:50%;background:var(--background);box-shadow:0 1px 2px color-mix(in srgb,#0f172a 20%,transparent)}
.payments-plugin .pm-completed-toggle input:checked{border-color:var(--pm-accent);background:var(--pm-accent)}
.payments-plugin .pm-completed-toggle input:checked::before{transform:translateX(10px);background:white}
.payments-plugin .pm-completed-toggle input:focus-visible{outline:2px solid var(--pm-accent);outline-offset:2px}
.payments-plugin .pm-stats{
  display:grid;
  grid-auto-flow:column;
  grid-auto-columns:minmax(0,1fr);
  align-items:stretch;
  gap:2px;
}
.payments-plugin .pm-filter-cluster[data-review-group=main] .pm-stats{grid-auto-flow:row;grid-template-columns:repeat(3,minmax(0,1fr))}
.payments-plugin .pm-filter-cluster[data-review-group=focus] .pm-stats{grid-auto-flow:row;grid-template-columns:repeat(auto-fit,minmax(64px,1fr))}
.payments-plugin .pm-filter-cluster[data-review-group=focus] .pm-stat{padding-inline:3px!important}
.payments-plugin .pm-filter-cluster[data-review-group=complete] .pm-stats{grid-auto-flow:row;grid-template-columns:repeat(2,minmax(0,1fr))}
.payments-plugin .pm-stat{
  display:grid;
  justify-items:center;
  gap:0;
  min-width:0;
  min-height:36px;
  padding:4px 5px!important;
  border:1px solid transparent!important;
  border-radius:5px!important;
  background:transparent!important;
  color:color-mix(in srgb,currentColor 62%,transparent);
  font-size:9px;
  line-height:1.35;
  text-align:center;
  white-space:nowrap;
}
.payments-plugin .pm-stat strong{
  color:var(--foreground);
  font-size:15px;
  font-weight:680;
  line-height:1.15;
}
.payments-plugin .pm-stat:hover{
  border-color:var(--pm-border)!important;
  background:color-mix(in srgb,currentColor 4%,var(--background))!important;
}
.payments-plugin .pm-stat[aria-pressed=true]{
  border-color:color-mix(in srgb,var(--pm-accent) 24%,transparent)!important;
  background:var(--pm-accent-soft)!important;
  color:var(--pm-accent);
  box-shadow:none;
}
.payments-plugin .pm-stat.pm-stat-posted{
  padding-left:5px!important;
  border-left:1px solid transparent!important;
}
.payments-plugin .pm-warning-filter{min-width:0}
.payments-plugin .pm-warning-filter-trigger{width:100%}
.payments-plugin .pm-warning-filter-trigger>span{display:inline-flex;align-items:center;gap:3px}
.payments-plugin .pm-warning-filter-trigger svg{width:10px;height:10px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round;transition:transform .15s ease}
.payments-plugin .pm-warning-filter-trigger[aria-expanded=true] svg{transform:rotate(180deg)}
.payments-plugin .pm-warning-filter-menu{box-sizing:border-box;display:flex;flex-direction:column;margin:0;padding:0;overflow:hidden;border:1px solid var(--pm-border-strong);border-radius:12px;background:var(--background);color:var(--foreground);box-shadow:0 18px 50px #0003;font-size:12px}
.payments-plugin .pm-warning-filter-menu>header{display:flex;flex:0 0 auto;align-items:baseline;justify-content:space-between;gap:10px;padding:13px 14px;border-bottom:1px solid var(--pm-border)}
.payments-plugin .pm-warning-filter-menu>header strong{font-size:12px;font-weight:650}
.payments-plugin .pm-warning-filter-menu>header>span,.payments-plugin .pm-warning-filter-menu>footer>span{font-size:10px;color:color-mix(in srgb,currentColor 55%,transparent)}
.payments-plugin .pm-warning-filter-options{display:grid;gap:3px;min-height:0;padding:6px;overflow:auto;overscroll-behavior:contain}
.payments-plugin .pm-warning-filter-options>label,.payments-plugin .pm-warning-filter-options>button{display:flex;align-items:center;gap:9px;width:100%;min-height:34px;padding:7px 9px;border:0;border-radius:7px;background:transparent;text-align:left;font-size:12px;font-weight:500;cursor:pointer}
.payments-plugin .pm-warning-filter-options>button{margin-bottom:3px;padding-left:32px;border-bottom:1px solid var(--pm-border);border-radius:7px 7px 0 0}
.payments-plugin .pm-warning-filter-options>label:hover,.payments-plugin .pm-warning-filter-options>button:hover{background:color-mix(in srgb,currentColor 4%,var(--background))}
.payments-plugin .pm-warning-filter-options>[data-selected=true],.payments-plugin .pm-warning-filter-options>[aria-pressed=true]{background:var(--pm-accent-soft);color:var(--pm-accent)}
.payments-plugin .pm-warning-filter-options>label[data-disabled=true]{opacity:.4;cursor:default}
.payments-plugin .pm-warning-filter-options input{flex:0 0 auto;width:14px;height:14px;margin:0;accent-color:var(--pm-accent)}
.payments-plugin .pm-warning-filter-options small{margin-left:auto;white-space:nowrap;font-size:10px;font-variant-numeric:tabular-nums;opacity:.6}
.payments-plugin .pm-warning-filter-menu>footer{display:flex;flex:0 0 auto;align-items:center;justify-content:space-between;gap:10px;padding:9px 14px;border-top:1px solid var(--pm-border);background:color-mix(in srgb,currentColor 1.5%,var(--background))}
.payments-plugin .pm-warning-filter-menu>footer>button{min-height:28px;padding:4px 10px;font-size:11px}
.payments-plugin .pm-view-switcher-note{
  display:block;
  padding:3px 2px 0;
  text-align:right;
  font-size:9px;
}
.payments-plugin .pm-review-guide{
  min-width:0;
  margin:0;
}
.payments-plugin .pm-review-guide>summary{
  display:grid;
  place-items:center;
  width:20px;
  height:20px;
  padding:0;
  color:var(--foreground);
  opacity:.58;
  list-style:none;
}
.payments-plugin .pm-review-guide>summary:hover,
.payments-plugin .pm-review-guide>summary:focus-visible,
.payments-plugin .pm-review-guide[open]>summary{opacity:1}
.payments-plugin .pm-review-guide>summary::-webkit-details-marker{display:none}
.payments-plugin .pm-review-guide>summary>svg{
  width:18px;
  height:18px;
  fill:none;
  stroke:currentColor;
  stroke-width:1.6;
  stroke-linecap:round;
  stroke-linejoin:round;
  color:inherit;
}
.payments-plugin .pm-review-guide>summary:focus-visible{outline:2px solid var(--pm-accent);outline-offset:3px;border-radius:4px}
.payments-plugin .pm-review-guide-body{
  position:absolute;
  inset:auto -1px calc(100% + 10px);
  max-height:min(360px,calc(100dvh - var(--pm-dock-height,180px) - 40px));
  padding:16px 18px;
  overflow:auto;
  overscroll-behavior:contain;
  border:1px solid var(--pm-border-strong);
  border-radius:12px;
  background:var(--background);
  box-shadow:0 -10px 36px #0002;
  color:color-mix(in srgb,currentColor 62%,transparent);
  font-size:11px;
  line-height:1.7;
}
.payments-plugin .pm-review-guide-body p{margin:3px 0}
.payments-plugin .pm-legend{
  display:flex;
  flex-wrap:wrap;
  gap:7px 15px;
  margin:8px 0;
  font-size:10px;
}
.payments-plugin .pm-legend span{font-weight:600}
.payments-plugin .pm-legend [data-tone=expense]{color:#dc2626}
.payments-plugin .pm-legend [data-tone=income]{color:#15803d}
.payments-plugin .pm-legend [data-tone=transfer]{color:#2563eb}
.payments-plugin .pm-legend [data-tone=refund]{color:#64748b}
.payments-plugin .pm-mapping-tray{
  margin:0 21px 16px;
  overflow:hidden;
  border:1px solid var(--pm-border);
  border-radius:12px;
  background:color-mix(in srgb,currentColor 1.5%,var(--background));
}
.payments-plugin .pm-mapping-tray>summary{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:16px;
  padding:12px 13px;
  list-style:none;
}
.payments-plugin .pm-mapping-tray>summary::-webkit-details-marker{display:none}
.payments-plugin .pm-mapping-tray>summary span:first-child{display:grid;gap:2px}
.payments-plugin .pm-mapping-tray>summary strong{font-size:12px}
.payments-plugin .pm-mapping-tray>summary small{
  color:color-mix(in srgb,currentColor 53%,transparent);
  font-size:10px;
}
.payments-plugin .pm-tray-action{
  flex:0 0 auto;
  color:var(--pm-accent);
  font-size:10px;
  font-weight:650;
}
.payments-plugin .pm-tray-open-label{display:none}
.payments-plugin .pm-mapping-tray[open] .pm-tray-open-label{display:inline}
.payments-plugin .pm-mapping-tray[open] .pm-tray-closed-label{display:none}
.payments-plugin .pm-mapping-tray[open]>summary{border-bottom:1px solid var(--pm-border)}
.payments-plugin .pm-mapping-tray .pm-mapping-editors{
  grid-template-columns:1fr;
  gap:8px;
  padding:10px;
}
.payments-plugin .pm-mapping-tray .pm-mapping-editor{
  --pm-action-color:var(--pm-accent);
  padding:4px;
  border-radius:9px;
  background:color-mix(in srgb,var(--pm-accent) 3.5%,var(--background));
}
.payments-plugin .pm-mapping-tray .pm-mapping-editor:before{
  display:inline-block;
  margin:0 0 3px 7px;
  color:var(--pm-action-color);
  font-size:9px;
  font-weight:700;
  letter-spacing:.06em;
  content:"资金规则";
}
.payments-plugin .pm-mapping-tray .pm-category-action:before{
  color:var(--pm-accent);
  content:"分类规则";
}
.payments-plugin .pm-queue-card{
  margin:0 21px;
  overflow:hidden;
  border:1px solid var(--pm-border);
  border-radius:14px;
  background:var(--background);
}
.payments-plugin .pm-queue-heading{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:18px;
  padding:13px 14px 11px;
  border-bottom:1px solid var(--pm-border);
}
.payments-plugin .pm-queue-heading>div:first-child{display:grid;gap:1px}
.payments-plugin .pm-queue-heading strong{font-size:15px;font-weight:680}
.payments-plugin .pm-queue-heading small{font-size:10px;opacity:.55}
.payments-plugin .pm-queue-card>.pm-filter-board{
  container:pm-review / inline-size;
  margin:0;
  padding:8px 12px 6px;
  border:0;
  border-bottom:1px solid var(--pm-border);
  border-radius:0;
  background:var(--pm-accent-soft);
}
.payments-plugin .pm-table-search{flex:0 1 390px}
.payments-plugin .pm-table-search input[type=search]{
  min-height:36px;
  border-color:var(--pm-border);
  border-radius:8px;
  background:color-mix(in srgb,currentColor 2%,var(--background));
}
.payments-plugin .pm-table-tools{
  margin:0;
  padding:8px 14px;
  border-bottom:1px solid var(--pm-border);
}
.payments-plugin .pm-table-tools-copy{justify-content:flex-start}
.payments-plugin .pm-queue-pill{
  display:inline-flex;
  align-items:baseline;
  gap:3px;
  padding:3px 7px;
  border-radius:999px;
  background:color-mix(in srgb,currentColor 5%,var(--background));
  color:color-mix(in srgb,currentColor 56%,transparent);
  font-size:10px;
}
.payments-plugin .pm-queue-pill strong{color:var(--foreground);font-size:11px}
.payments-plugin .pm-filter-chips{padding:0 14px}
.payments-plugin .pm-scroll{
  max-height:72vh;
  padding:0 9px 8px;
  scrollbar-gutter:stable;
}
.payments-plugin .pm-scroll>table{min-width:1120px}
.payments-plugin .pm-scroll thead th{
  padding:11px 10px 9px;
  border-bottom:1px solid var(--pm-border);
  background:var(--background);
  color:color-mix(in srgb,currentColor 56%,transparent);
  font-size:10px;
  font-weight:650;
  letter-spacing:.02em;
}
.payments-plugin .pm-scroll tbody td{
  padding:12px 10px;
  border-bottom:1px solid color-mix(in srgb,currentColor 7%,transparent);
  background:transparent;
  font-size:11px;
}
.payments-plugin .pm-scroll tbody tr{
  transition:filter .14s ease;
}
.payments-plugin .pm-scroll tbody tr:hover{filter:saturate(1.08) brightness(.995)}
.payments-plugin .pm-scroll tbody td:first-child{
  width:80px;
  border-left-width:3px;
}
.payments-plugin .pm-scroll tbody td:last-child{padding-right:12px}
.payments-plugin .pm-row-state{
  align-items:flex-start;
}
.payments-plugin .pm-row-state>input[type=checkbox]{
  width:16px;
  height:16px;
  margin:1px 0 7px;
}
.payments-plugin .pm-row-index{
  margin-bottom:5px;
  color:color-mix(in srgb,currentColor 40%,transparent);
  font-family:"SFMono-Regular",Consolas,monospace;
  font-size:9px;
}
.payments-plugin .pm-row-lock-state{
  min-height:22px!important;
  padding:2px 4px!important;
  border-color:transparent!important;
  background:transparent!important;
  color:color-mix(in srgb,currentColor 45%,transparent);
  font-size:9px!important;
  font-weight:550!important;
}
button.payments-plugin .pm-row-lock-state:hover:not(:disabled),
.payments-plugin button.pm-row-lock-state:hover:not(:disabled){
  border-color:var(--pm-border)!important;
  background:color-mix(in srgb,currentColor 4%,var(--background))!important;
}
.payments-plugin .pm-row-date{
  display:block;
  color:color-mix(in srgb,currentColor 58%,transparent);
  font-family:"SFMono-Regular",Consolas,monospace;
  font-size:9px;
}
.payments-plugin .pm-amount-control{margin:3px 0 2px}
.payments-plugin td input[type=text].pm-amount-control>input,
.payments-plugin .pm-amount-control input[type=text]{
  width:108px;
  padding:4px 6px;
  border-color:transparent;
  background:transparent;
  font-size:13px;
  font-weight:690;
  letter-spacing:-.01em;
}
.payments-plugin .pm-amount-control input[type=text]:hover:not(:disabled){
  border-color:var(--pm-border);
  background:color-mix(in srgb,currentColor 2%,var(--background));
}
.payments-plugin .pm-payee{min-width:210px;max-width:330px}
.payments-plugin .pm-payee>p{margin:5px 0 7px;line-height:1.5}
.payments-plugin .pm-payment{
  min-height:24px;
  padding:2px 5px;
  border-color:transparent;
  border-radius:5px;
  background:transparent;
  color:#2563eb;
  font-size:10px;
  text-align:left;
}
.payments-plugin .pm-payment:hover:not(:disabled){background:color-mix(in srgb,#2563eb 7%,var(--background))}
.payments-plugin .pm-account-control{display:grid;gap:3px}
.payments-plugin .pm-account-label{
  color:color-mix(in srgb,currentColor 42%,transparent);
  font-size:9px;
  font-weight:650;
  letter-spacing:.04em;
}
.payments-plugin td>.pm-search-select,
.payments-plugin .pm-account-control>.pm-search-select{
  width:238px;
  max-width:245px;
}
.payments-plugin .pm-account-control .pm-search-select-trigger{
  min-height:32px;
  border-radius:7px;
  background:color-mix(in srgb,currentColor 1.5%,var(--background));
}
.payments-plugin .pm-flow{
  gap:7px;
  margin:4px 0 4px 7px;
  font-size:9px;
  opacity:.82;
}
.payments-plugin .pm-arrow{
  display:grid;
  place-items:center;
  width:17px;
  height:17px;
  border-radius:50%;
  background:color-mix(in srgb,var(--pm-flow) 10%,var(--background));
  font-size:12px;
}
.payments-plugin .pm-ai{
  margin:5px 0 0;
  color:var(--pm-accent);
  font-size:9px;
}
.payments-plugin .pm-row-review{
  width:260px;
  max-width:280px;
}
.payments-plugin .pm-scroll>table{min-width:1200px;border-spacing:0}
.payments-plugin .pm-scroll tbody td{
  padding:14px 11px;
  border-bottom-color:color-mix(in srgb,currentColor 9%,transparent);
}
.payments-plugin .pm-scroll tbody tr:not(.pm-refund-group){
  outline:1px solid transparent;
  outline-offset:-1px;
}
.payments-plugin .pm-scroll tbody tr:not(.pm-refund-group):hover{
  filter:none;
  outline-color:color-mix(in srgb,var(--pm-accent) 16%,transparent);
}
.payments-plugin .pm-row-state{
  width:66px;
  text-align:center!important;
}
.payments-plugin .pm-row-checkbox{
  display:block;
  width:18px!important;
  height:18px;
  margin:1px auto 7px!important;
  accent-color:var(--pm-accent);
}
.payments-plugin .pm-row-index{
  display:block;
  margin-bottom:4px;
  font-size:8px;
  letter-spacing:.03em;
}
.payments-plugin .pm-row-lock-state{
  display:block;
  width:100%;
  min-height:20px!important;
  margin:auto;
  white-space:nowrap;
}
.payments-plugin .pm-row-date{
  margin-bottom:4px;
  font-size:9px;
  letter-spacing:.01em;
}
.payments-plugin .pm-amount-control{
  display:flex;
  align-items:baseline;
  gap:3px;
  margin:2px 0 5px;
}
.payments-plugin .pm-currency{
  color:color-mix(in srgb,currentColor 38%,transparent);
  font-family:"SFMono-Regular",Consolas,monospace;
  font-size:8px;
  font-weight:650;
}
.payments-plugin .pm-amount-control input[type=text]{
  width:78px;
  padding:0;
  border-color:transparent;
  background:transparent;
  box-shadow:none;
  font-size:16px;
  font-weight:720;
  font-variant-numeric:tabular-nums;
  letter-spacing:-.035em;
}
.payments-plugin .pm-amount-control input[type=text]:focus{
  outline:0;
  border-color:color-mix(in srgb,var(--pm-accent) 34%,transparent);
  background:var(--background);
}
.payments-plugin .pm-direction-chip{
  display:inline-flex;
  align-items:center;
  gap:5px;
  padding:3px 7px;
  border:1px solid color-mix(in srgb,var(--pm-flow) 20%,transparent);
  border-radius:999px;
  background:color-mix(in srgb,var(--pm-flow) 7%,var(--background));
  color:var(--pm-flow);
  font-size:9px;
  font-weight:650;
}
.payments-plugin .pm-direction-chip i{
  width:5px;
  height:5px;
  border-radius:50%;
  background:currentColor;
}
.payments-plugin .pm-original-direction{
  display:block;
  margin-top:5px;
  color:color-mix(in srgb,currentColor 48%,transparent);
  font-size:8px;
  line-height:1.45;
}
.payments-plugin .pm-payee{
  min-width:270px;
  max-width:340px;
}
.payments-plugin .pm-payee-title{
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap:8px;
}
.payments-plugin .pm-payee-button{
  display:flex;
  align-items:flex-start;
  gap:5px;
  max-width:100%;
  min-height:0!important;
  padding:0!important;
  border:0!important;
  background:transparent!important;
  color:var(--foreground)!important;
  text-align:left;
}
.payments-plugin .pm-payee-button strong{
  overflow-wrap:anywhere;
  font-size:12px;
  font-weight:700;
  line-height:1.4;
}
.payments-plugin .pm-payee-button>span{
  flex:0 0 auto;
  color:var(--pm-accent);
  font-size:10px;
  opacity:.65;
}
.payments-plugin .pm-payee-button:hover:not(:disabled) strong{
  color:var(--pm-accent);
  text-decoration:underline;
  text-underline-offset:2px;
}
.payments-plugin .pm-trade-status{
  flex:0 0 auto;
  max-width:104px;
  padding:2px 6px;
  overflow:hidden;
  border:1px solid var(--pm-border);
  border-radius:999px;
  color:color-mix(in srgb,currentColor 52%,transparent);
  font-size:8px;
  font-weight:600;
  text-overflow:ellipsis;
  white-space:nowrap;
}
.payments-plugin .pm-trade-description{
  display:-webkit-box;
  margin:6px 0 8px!important;
  overflow:hidden;
  color:color-mix(in srgb,currentColor 66%,transparent);
  font-size:10px;
  line-height:1.55!important;
  -webkit-box-orient:vertical;
  -webkit-line-clamp:2;
}
.payments-plugin .pm-trade-meta{
  display:flex;
  flex-wrap:wrap;
  align-items:center;
  gap:5px;
}
.payments-plugin .pm-trade-meta>span{
  padding:2px 6px;
  border-radius:999px;
  background:color-mix(in srgb,currentColor 5%,var(--background));
  color:color-mix(in srgb,currentColor 54%,transparent);
  font-size:8px;
  font-weight:600;
}
.payments-plugin .pm-payment-method{
  min-height:20px!important;
  padding:2px 5px!important;
  border-color:transparent!important;
  border-radius:999px!important;
  background:transparent!important;
  color:var(--pm-accent)!important;
  font-size:8px!important;
  font-weight:600!important;
}
.payments-plugin .pm-payment-method:hover:not(:disabled){
  background:var(--pm-accent-soft)!important;
}
.payments-plugin .pm-row-accounts{
  min-width:450px;
}
.payments-plugin .pm-route-heading{
  display:flex;
  align-items:baseline;
  justify-content:space-between;
  gap:8px;
  margin-bottom:8px;
}
.payments-plugin .pm-cell-label{
  color:color-mix(in srgb,currentColor 58%,transparent);
  font-size:8px;
  font-weight:750;
  letter-spacing:.08em;
  text-transform:uppercase;
}
.payments-plugin .pm-route-caption{
  color:color-mix(in srgb,currentColor 38%,transparent);
  font-size:8px;
}
.payments-plugin .pm-account-route{
  display:grid;
  grid-template-columns:minmax(168px,1fr) 28px minmax(168px,1fr);
  align-items:end;
  gap:5px;
}
.payments-plugin .pm-account-control{
  display:grid;
  gap:4px;
  min-width:0;
}
.payments-plugin .pm-account-label{
  display:flex;
  align-items:center;
  gap:4px;
  font-size:8px;
  letter-spacing:.04em;
}
.payments-plugin .pm-account-control[data-missing=true] .pm-account-label{
  color:#b45309;
}
.payments-plugin .pm-account-control[data-missing=true] .pm-account-label:after{
  padding:1px 4px;
  border-radius:3px;
  background:color-mix(in srgb,#f59e0b 12%,var(--background));
  content:"待补";
  font-size:7px;
  font-weight:700;
}
.payments-plugin .pm-account-control>.pm-search-select,
.payments-plugin .pm-account-route .pm-search-select{
  width:100%;
  max-width:none;
}
.payments-plugin .pm-account-control .pm-search-select-trigger{
  min-height:34px;
  border-color:color-mix(in srgb,currentColor 13%,transparent);
  background:var(--background);
}
.payments-plugin .pm-account-control[data-missing=true] .pm-search-select-trigger{
  border-color:color-mix(in srgb,#d97706 32%,transparent);
  background:color-mix(in srgb,#f59e0b 4%,var(--background));
}
.payments-plugin .pm-account-route .pm-flow{
  display:grid;
  place-items:center;
  align-self:center;
  margin:18px 0 0;
  opacity:1;
}
.payments-plugin .pm-account-route .pm-arrow{
  width:24px;
  height:24px;
  border:1px solid color-mix(in srgb,var(--pm-flow) 20%,transparent);
  background:color-mix(in srgb,var(--pm-flow) 7%,var(--background));
  font-size:13px;
}
.payments-plugin .pm-account-route .pm-ai{
  grid-column:1/-1;
}
.payments-plugin .pm-ai{
  display:flex;
  align-items:flex-start;
  gap:6px;
  margin-top:7px;
  padding:6px 8px;
  border-radius:6px;
  background:var(--pm-accent-soft);
  line-height:1.45;
}
.payments-plugin .pm-ai strong{
  flex:0 0 auto;
  font-size:8px;
  font-weight:750;
}
.payments-plugin .pm-ai span{
  color:color-mix(in srgb,currentColor 56%,transparent);
  font-size:8px;
}
.payments-plugin .pm-row-review{
  width:240px;
  max-width:250px;
}
.payments-plugin .pm-review-alert{
  margin-top:7px;
  padding:7px 8px;
  border-left:3px solid #d97706;
  border-radius:4px 7px 7px 4px;
  background:color-mix(in srgb,#f59e0b 7%,var(--background));
  color:color-mix(in srgb,currentColor 72%,transparent);
}
.payments-plugin .pm-review-alert>strong{
  display:block;
  margin-bottom:2px;
  color:#92400e;
  font-size:9px;
}
.payments-plugin .pm-review-alert p{
  margin:1px 0;
  font-size:8px;
  line-height:1.5;
}
.payments-plugin .pm-review-alert label{
  align-items:flex-start;
  margin-top:5px;
  font-size:8px;
  line-height:1.45;
}
.payments-plugin .pm-not-imported{
  margin-top:7px;
  padding:6px 8px;
}
.payments-plugin .pm-refund,
.payments-plugin .pm-not-imported{
  padding:7px 8px;
  border-radius:7px;
  font-size:10px;
}
.payments-plugin .pm-warning p{line-height:1.5}
.payments-plugin .pm-empty-state{
  padding:32px 20px;
  color:color-mix(in srgb,currentColor 52%,transparent);
  text-align:center;
}
.payments-plugin .pm-pagination{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  padding:10px 21px;
  border-top:1px solid var(--pm-border);
  background:color-mix(in srgb,currentColor 1%,var(--background));
}
.payments-plugin .pm-pagination-caption{
  color:color-mix(in srgb,currentColor 50%,transparent);
  font-size:10px;
}
.payments-plugin .pm-pagination-caption strong{color:var(--foreground)}
.payments-plugin .pm-pagination-controls{
  display:flex;
  align-items:center;
  gap:7px;
}
.payments-plugin .pm-pagination-controls button{
  min-height:31px;
  padding:4px 9px;
  font-size:10px;
}
.payments-plugin .pm-pagination-controls label{
  display:inline-flex;
  align-items:center;
  gap:5px;
  margin-left:3px;
  color:color-mix(in srgb,currentColor 50%,transparent);
  font-size:10px;
}
.payments-plugin .pm-page-size{
  width:66px;
  min-height:31px;
  padding:4px 6px!important;
  font-size:10px;
}
.payments-plugin .pm-commit-reserve{
  height:calc(var(--pm-dock-height,180px) + env(safe-area-inset-bottom,0px) + 24px);
}
.payments-plugin .pm-commit-dock{
  position:fixed;
  z-index:12;
  left:12px;
  bottom:max(10px,env(safe-area-inset-bottom,0px));
  display:grid;
  grid-template-columns:205px minmax(150px,1fr) minmax(0,620px);
  gap:9px 12px;
  align-items:center;
  box-sizing:border-box;
  width:calc(100% - 24px);
  margin:0;
  padding:10px 12px 8px;
  border:1px solid var(--pm-border-strong);
  border-radius:14px;
  background:
    linear-gradient(115deg,var(--pm-accent-soft),transparent 48%),
    color-mix(in srgb,var(--background) 96%,transparent);
  box-shadow:0 14px 44px color-mix(in srgb,#0f172a 15%,transparent);
  backdrop-filter:blur(18px) saturate(1.2);
}
.payments-plugin .pm-dock-summary{
  display:grid;
  gap:2px;
  padding:4px 8px;
  border-right:1px solid var(--pm-border);
}
.payments-plugin .pm-dock-heading{display:flex;align-items:center;gap:4px}
.payments-plugin .pm-dock-summary strong{
  font-size:14px;
  font-weight:680;
}
.payments-plugin .pm-dock-selection{display:flex;align-items:center;gap:6px;flex-wrap:wrap;min-width:0}
.payments-plugin .pm-dock-selection>strong{white-space:nowrap;font-variant-numeric:tabular-nums}
.payments-plugin .pm-dock-selection-actions{display:flex;align-items:center;gap:3px}
.payments-plugin .pm-dock-selection-actions button{min-height:24px;padding:2px 5px!important;border:1px solid transparent!important;border-radius:4px;background:transparent!important;color:color-mix(in srgb,currentColor 60%,transparent);font-size:10px!important;white-space:nowrap}
.payments-plugin .pm-dock-selection-actions button:hover:not(:disabled),.payments-plugin .pm-dock-selection-actions button[aria-pressed=true]{border-color:var(--pm-border)!important;background:var(--pm-accent-soft)!important;color:var(--pm-accent)}
.payments-plugin .pm-dock-selection-actions button:focus-visible{outline:2px solid var(--pm-accent);outline-offset:2px}
.payments-plugin .pm-dock-progress{
  justify-self:stretch;
  box-sizing:border-box;
  min-width:0;
  width:100%;
  margin:0;
  padding:0 8px;
  border:0;
}
.payments-plugin .pm-dock-progress .pm-progress-heading{
  align-items:center;
  flex-wrap:wrap;
  gap:3px 8px;
  margin-bottom:7px;
}
.payments-plugin .pm-dock-progress .pm-progress-heading strong{font-size:11px;white-space:nowrap}
.payments-plugin .pm-dock-progress .pm-progress-track{height:6px}
.payments-plugin .pm-dock-progress .pm-progress-caption{gap:3px 10px;margin-top:6px;font-size:9px}
.payments-plugin .pm-dock-progress .pm-progress-caption span{gap:4px;white-space:nowrap}
.payments-plugin .pm-dock-actions{display:grid;gap:7px;min-width:0}
.payments-plugin .pm-review-actions{
  display:flex;
  flex-wrap:wrap;
  align-items:center;
  justify-content:flex-end;
  gap:6px;
  margin:0;
}
.payments-plugin .pm-review-actions>button{
  min-height:34px;
  padding:6px 10px;
  border-color:var(--pm-border);
  background:var(--background);
  font-size:11px;
}
.payments-plugin .pm-review-actions>.pm-draft-save[data-saved=true]{
  border-color:var(--pm-border);
  background:color-mix(in srgb,#64748b 7%,var(--background));
  color:color-mix(in srgb,var(--foreground) 48%,var(--background));
  opacity:1;
  cursor:default;
}
.payments-plugin .pm-review-actions>.pm-commit-primary{
  min-width:134px;
  margin-left:3px;
  border-color:var(--pm-accent-deep);
  background:var(--pm-accent-deep);
  color:#fff;
  font-weight:680;
}
.payments-plugin .pm-review-actions>.pm-commit-primary:hover:not(:disabled){
  border-color:#0a3f2e;
  background:#0a3f2e;
}
.payments-plugin .pm-commit-dock .pm-bulk-trigger{
  min-height:34px!important;
  padding:6px 9px!important;
  border-color:var(--pm-border)!important;
  background:var(--background)!important;
  font-size:11px!important;
}
.payments-plugin .pm-selection-undo{
  margin:0;
  padding:6px 8px;
  border-radius:7px;
  font-size:10px;
}
.payments-plugin .pm-warning-review{
  display:flex;
  justify-content:flex-end;
  gap:5px;
  margin:0;
  padding:0 2px;
  font-size:9px;
  line-height:1.45;
}
.payments-plugin .pm-review-notices{
  display:flex;
  align-items:center;
  justify-self:end;
  justify-content:flex-start;
  flex-wrap:nowrap;
  gap:12px;
  box-sizing:border-box;
  width:max-content;
  min-width:0;
  max-width:100%;
  overflow-x:auto;
  white-space:nowrap;
}
.payments-plugin .pm-review-notices>.pm-warning-review{flex-shrink:0;flex-wrap:nowrap}
.payments-plugin .pm-review-button{
  min-height:24px!important;
  padding:2px 7px!important;
  border-radius:5px!important;
  font-size:9px!important;
}
.payments-plugin .pm-commit-confirm{
  grid-column:1/-1;
  display:grid;
  grid-template-columns:minmax(0,1fr) auto;
  gap:15px 22px;
  max-height:45dvh;
  margin:0 0 3px;
  padding:13px;
  overflow:auto;
  overscroll-behavior:contain;
  border:1px solid color-mix(in srgb,#d97706 34%,transparent);
  border-radius:13px;
  background:
    linear-gradient(120deg,color-mix(in srgb,#f59e0b 7%,var(--background)),transparent 70%),
    var(--background);
}
.payments-plugin .pm-commit-confirm h3{
  margin:3px 0 5px;
  font-size:17px;
  font-weight:690;
}
.payments-plugin .pm-commit-confirm p{
  max-width:720px;
  margin:0;
  color:color-mix(in srgb,currentColor 58%,transparent);
  font-size:11px;
}
.payments-plugin .pm-confirm-facts{
  display:flex;
  gap:7px;
}
.payments-plugin .pm-confirm-facts>span{
  display:grid;
  place-items:center;
  min-width:74px;
  padding:7px 9px;
  border:1px solid var(--pm-border);
  border-radius:8px;
  background:var(--background);
  color:color-mix(in srgb,currentColor 52%,transparent);
  font-size:9px;
}
.payments-plugin .pm-confirm-facts strong{
  color:var(--foreground);
  font-size:17px;
  line-height:1.2;
}
.payments-plugin .pm-commit-confirm>.pm-bar{
  grid-column:1/-1;
  justify-content:flex-end;
  margin:0;
}
.payments-plugin .pm-account-dialog{
  position:fixed;
  inset:0;
  width:min(920px,calc(100vw - 32px));
  height:fit-content;
  max-width:calc(100vw - 32px);
  max-height:min(90dvh,860px);
  margin:auto;
  padding:0;
  overflow:hidden;
  border:1px solid color-mix(in srgb,currentColor 18%,transparent);
  border-radius:18px;
  background:var(--background);
  box-shadow:0 28px 90px #0006;
}
.payments-plugin .pm-account-dialog::backdrop{
  background:#0f172a66;
}
.payments-plugin .pm-visually-hidden{
  position:absolute!important;
  width:1px!important;
  height:1px!important;
  padding:0!important;
  overflow:hidden!important;
  clip:rect(0,0,0,0)!important;
  white-space:nowrap!important;
  border:0!important;
}
.payments-plugin .pm-account-form{
  display:flex;
  max-height:inherit;
  flex-direction:column;
  margin:0;
}
.payments-plugin .pm-account-dialog-head{
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap:22px;
  padding:23px 24px 18px;
  background:
    radial-gradient(circle at 96% 0%,var(--pm-accent-soft),transparent 33%),
    linear-gradient(120deg,color-mix(in srgb,var(--pm-accent) 4%,var(--background)),var(--background) 62%);
}
.payments-plugin .pm-account-dialog-head>div{
  min-width:0;
}
.payments-plugin .pm-dialog-eyebrow{
  color:var(--pm-accent);
  font-size:9px;
  font-weight:750;
  letter-spacing:.15em;
}
.payments-plugin .pm-account-dialog h2{
  margin:4px 0 5px;
  font-size:24px;
  font-weight:720;
  letter-spacing:-.035em;
  line-height:1.15;
}
.payments-plugin .pm-account-dialog-head p{
  max-width:650px;
  margin:0;
  color:color-mix(in srgb,currentColor 58%,transparent);
  font-size:13px;
  line-height:1.6;
}
.payments-plugin .pm-dialog-close{
  display:grid;
  place-items:center;
  flex:0 0 34px;
  width:34px;
  min-width:34px;
  height:34px;
  min-height:34px;
  padding:0!important;
  border-color:var(--pm-border)!important;
  border-radius:9px!important;
  background:color-mix(in srgb,#ffffff 72%,var(--background))!important;
  color:color-mix(in srgb,currentColor 52%,transparent)!important;
  font-size:21px!important;
  font-weight:400!important;
  line-height:1;
}
.payments-plugin .pm-dialog-close:hover:not(:disabled){
  border-color:color-mix(in srgb,currentColor 24%,transparent)!important;
  color:var(--foreground)!important;
}
.payments-plugin .pm-account-dialog-context{
  display:flex;
  align-items:center;
  gap:9px;
  min-height:40px;
  padding:8px 24px;
  border-top:1px solid var(--pm-border);
  border-bottom:1px solid var(--pm-border);
  background:color-mix(in srgb,currentColor 2%,var(--background));
  color:color-mix(in srgb,currentColor 54%,transparent);
  font-size:11.5px;
}
.payments-plugin .pm-provider-chip{
  --pm-provider:#64748b;
  display:inline-flex;
  align-items:center;
  min-height:22px;
  padding:2px 8px;
  border:1px solid color-mix(in srgb,var(--pm-provider) 24%,transparent);
  border-radius:999px;
  background:color-mix(in srgb,var(--pm-provider) 7%,var(--background));
  color:var(--pm-provider);
  font-size:10px;
  font-weight:680;
  white-space:nowrap;
}
.payments-plugin .pm-provider-chip[data-provider=alipay]{--pm-provider:#1677ff}
.payments-plugin .pm-provider-chip[data-provider=wechat]{--pm-provider:#14934a}
.payments-plugin .pm-account-dialog-steps{
  display:grid;
  flex:1 1 auto;
  grid-template-columns:minmax(0,1.08fr) minmax(0,.92fr);
  grid-auto-rows:max-content;
  align-content:start;
  gap:14px;
  min-height:0;
  padding:18px 24px;
  overflow:auto;
  overscroll-behavior:contain;
  scrollbar-gutter:stable;
  background:
    linear-gradient(90deg,transparent 50%,color-mix(in srgb,var(--pm-accent) 2%,transparent)),
    color-mix(in srgb,currentColor 1.2%,var(--background));
}
.payments-plugin .pm-account-dialog-section{
  min-width:0;
  overflow:hidden;
  border:1px solid var(--pm-border);
  border-radius:13px;
  background:var(--background);
}
.payments-plugin .pm-form-step{
  display:grid;
  grid-template-columns:28px minmax(0,1fr) auto;
  align-items:start;
  gap:10px;
  padding:13px 14px 11px;
  border-bottom:1px solid var(--pm-border);
}
.payments-plugin .pm-form-step-index{
  display:grid;
  place-items:center;
  width:27px;
  height:27px;
  border:1px solid color-mix(in srgb,var(--pm-accent) 24%,transparent);
  border-radius:8px;
  background:var(--pm-accent-soft);
  color:var(--pm-accent);
  font-size:9px;
  font-weight:750;
  letter-spacing:.04em;
}
.payments-plugin .pm-form-step>div{
  display:grid;
  gap:2px;
  min-width:0;
}
.payments-plugin .pm-form-step strong{
  font-size:13.5px;
  font-weight:690;
  line-height:1.35;
}
.payments-plugin .pm-form-step small{
  color:color-mix(in srgb,currentColor 50%,transparent);
  font-size:11px;
  line-height:1.45;
}
.payments-plugin .pm-form-step>b{
  align-self:center;
  padding:3px 7px;
  border-radius:999px;
  background:color-mix(in srgb,currentColor 5%,var(--background));
  color:color-mix(in srgb,currentColor 52%,transparent);
  font-size:10px;
  font-weight:650;
  white-space:nowrap;
}
.payments-plugin .pm-form-step>b.is-ready{
  background:var(--pm-accent-soft);
  color:var(--pm-accent);
}
.payments-plugin .pm-account-option-list{
  display:grid;
  grid-auto-rows:max-content;
  align-content:start;
  gap:5px;
  min-width:0;
  width:100%;
  height:184px;
  max-height:184px;
  margin:0;
  padding:8px;
  overflow-x:hidden;
  overflow-y:auto;
  overscroll-behavior:contain;
  scroll-padding-block:8px;
  scrollbar-gutter:stable;
  overflow-anchor:none;
  contain:layout paint;
  border:0;
  background:transparent;
}
.payments-plugin .pm-account-option-list label{
  display:grid;
  grid-template-columns:18px minmax(0,1fr) auto;
  align-items:center;
  gap:9px;
  min-width:0;
  margin:0;
  padding:9px 9px;
  border:1px solid transparent;
  border-radius:9px;
  background:color-mix(in srgb,currentColor 2%,var(--background));
  cursor:pointer;
}
.payments-plugin .pm-account-option-list label:hover{
  border-color:var(--pm-border);
  background:color-mix(in srgb,currentColor 4%,var(--background));
}
.payments-plugin .pm-account-option-list label.is-selected{
  border-color:color-mix(in srgb,var(--pm-accent) 28%,transparent);
  background:color-mix(in srgb,var(--pm-accent) 5%,var(--background));
}
.payments-plugin .pm-account-option-list input[type=checkbox]{
  width:17px;
  height:17px;
  margin:0;
  accent-color:var(--pm-accent);
}
.payments-plugin .pm-option-copy{
  display:grid;
  min-width:0;
  gap:2px;
}
.payments-plugin .pm-option-copy strong{
  overflow:hidden;
  color:var(--foreground);
  font-size:12.5px;
  font-weight:650;
  line-height:1.4;
  text-overflow:ellipsis;
  white-space:nowrap;
}
.payments-plugin .pm-option-copy small{
  overflow:hidden;
  color:color-mix(in srgb,currentColor 48%,transparent);
  font-family:"SFMono-Regular",Consolas,monospace;
  font-size:10.5px;
  line-height:1.4;
  text-overflow:ellipsis;
  white-space:nowrap;
}
.payments-plugin .pm-option-state{
  padding:2px 6px;
  border-radius:999px;
  background:color-mix(in srgb,currentColor 5%,var(--background));
  color:color-mix(in srgb,currentColor 46%,transparent);
  font-size:9.5px;
  font-weight:650;
  white-space:nowrap;
}
.payments-plugin .pm-option-state[data-linked=true]{
  background:color-mix(in srgb,var(--pm-accent) 6%,var(--background));
  color:var(--pm-accent);
}
.payments-plugin .pm-rule-editor{
  display:grid;
  min-height:276px;
  align-content:start;
  gap:10px;
  padding:12px;
}
.payments-plugin .pm-rule-input{
  display:grid;
  gap:7px;
}
.payments-plugin .pm-rule-input>span{
  display:flex;
  align-items:baseline;
  justify-content:space-between;
  gap:12px;
  color:color-mix(in srgb,currentColor 62%,transparent);
  font-size:11px;
  font-weight:650;
}
.payments-plugin .pm-rule-input>span small{
  color:color-mix(in srgb,currentColor 44%,transparent);
  font-size:10px;
  font-weight:500;
}
.payments-plugin .pm-rule-input input[type=text]{
  width:100%;
  min-height:40px;
  border-radius:9px;
  font-family:"SFMono-Regular",Consolas,monospace;
  font-size:12px;
}
.payments-plugin .pm-rule-example{
  display:flex;
  align-items:baseline;
  gap:8px;
  padding:0 2px;
}
.payments-plugin .pm-rule-example>span{
  flex:0 0 auto;
  color:color-mix(in srgb,currentColor 44%,transparent);
  font-size:9.5px;
  font-weight:650;
}
.payments-plugin .pm-rule-example>p{
  margin:0;
  color:color-mix(in srgb,currentColor 54%,transparent);
  font-size:10.5px;
  line-height:1.5;
}
.payments-plugin .pm-regex-preview{
  display:grid;
  gap:8px;
  min-height:118px;
  padding:10px;
  border:1px solid color-mix(in srgb,var(--pm-accent) 16%,transparent);
  border-radius:10px;
  background:var(--pm-accent-soft);
}
.payments-plugin .pm-regex-preview>header{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
}
.payments-plugin .pm-regex-preview>header strong{
  color:var(--pm-accent);
  font-size:11.5px;
  font-weight:700;
}
.payments-plugin .pm-regex-preview>header span{
  color:color-mix(in srgb,currentColor 50%,transparent);
  font-size:9.5px;
  font-variant-numeric:tabular-nums;
}
.payments-plugin .pm-regex-preview>ul{
  display:grid;
  gap:4px;
  max-height:150px;
  margin:0;
  padding:0 2px 0 0;
  overflow:auto;
  overscroll-behavior:contain;
  list-style:none;
}
.payments-plugin .pm-regex-preview>ul>li{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:10px;
  min-width:0;
  padding:6px 8px;
  border:1px solid color-mix(in srgb,currentColor 7%,transparent);
  border-radius:7px;
  background:color-mix(in srgb,#fff 62%,var(--background));
}
.payments-plugin .pm-regex-preview>ul>li>strong{
  overflow:hidden;
  color:var(--foreground);
  font-size:11.5px;
  font-weight:620;
  text-overflow:ellipsis;
  white-space:nowrap;
}
.payments-plugin .pm-regex-preview>ul>li>span{
  flex:0 0 auto;
  color:color-mix(in srgb,currentColor 54%,transparent);
  font-size:9.5px;
  font-variant-numeric:tabular-nums;
}
.payments-plugin .pm-regex-empty{
  align-self:center;
  margin:0;
  color:color-mix(in srgb,currentColor 48%,transparent);
  font-size:11px;
  line-height:1.55;
  text-align:center;
}
.payments-plugin .pm-regex-preview.is-error{
  border-color:color-mix(in srgb,#dc2626 24%,transparent);
  background:color-mix(in srgb,#dc2626 5%,var(--background));
}
.payments-plugin .pm-regex-preview.is-error>header strong,
.payments-plugin .pm-regex-preview.is-error .pm-regex-empty{
  color:#b91c1c;
}
.payments-plugin .pm-account-target-picker{
  display:grid;
  gap:7px;
  padding:17px 15px 9px;
}
.payments-plugin .pm-account-target-picker>span{
  color:color-mix(in srgb,currentColor 58%,transparent);
  font-size:11px;
  font-weight:650;
}
.payments-plugin .pm-account-target-picker .pm-search-select-trigger{
  min-height:44px;
  border-color:color-mix(in srgb,var(--pm-accent) 26%,var(--pm-border));
  border-radius:10px;
  background:color-mix(in srgb,var(--pm-accent) 2.5%,var(--background));
  box-shadow:0 2px 8px color-mix(in srgb,var(--pm-accent) 5%,transparent);
}
.payments-plugin .pm-account-target-picker input[type=text]{
  font-size:13px;
  font-weight:650;
}
.payments-plugin .pm-account-target-note{
  margin:0;
  padding:0 15px 16px;
  color:color-mix(in srgb,currentColor 48%,transparent);
  font-size:10.5px;
  line-height:1.55;
}
.payments-plugin .pm-account-root-warning{
  margin:0 15px 12px;
  padding:8px 10px;
  border:1px solid color-mix(in srgb,#b45309 24%,transparent);
  border-radius:8px;
  background:color-mix(in srgb,#f59e0b 6%,var(--background));
  color:#b45309;
  font-size:10.5px;
  line-height:1.55;
}
.payments-plugin .pm-account-route-preview{
  display:grid;
  grid-template-columns:minmax(0,1fr) 24px minmax(0,1fr);
  align-items:center;
  gap:8px;
  margin:4px 15px 10px;
  padding:10px;
  border:1px solid var(--pm-border);
  border-radius:11px;
  background:
    linear-gradient(135deg,var(--pm-accent-soft),transparent 72%),
    color-mix(in srgb,currentColor 1%,var(--background));
}
.payments-plugin .pm-account-route-preview>div{
  display:grid;
  min-width:0;
  gap:2px;
}
.payments-plugin .pm-account-route-preview>div:last-child{
  text-align:right;
}
.payments-plugin .pm-account-route-preview span{
  color:color-mix(in srgb,currentColor 48%,transparent);
  font-size:9.5px;
  font-weight:650;
}
.payments-plugin .pm-account-route-preview strong{
  overflow:hidden;
  color:var(--foreground);
  font-size:11.5px;
  font-weight:680;
  line-height:1.45;
  text-overflow:ellipsis;
  white-space:nowrap;
}
.payments-plugin .pm-account-route-preview small{
  color:color-mix(in srgb,currentColor 52%,transparent);
  font-size:10px;
}
.payments-plugin .pm-account-route-preview>i{
  display:grid;
  place-items:center;
  width:24px;
  height:24px;
  border-radius:50%;
  background:var(--background);
  color:var(--pm-accent);
  font-size:12px;
  font-style:normal;
  font-weight:750;
  box-shadow:0 0 0 1px var(--pm-border);
}
.payments-plugin .pm-account-scope-note{
  display:flex;
  align-items:baseline;
  gap:8px;
  margin:0 15px 15px;
  padding-top:9px;
  border-top:1px dashed var(--pm-border);
}
.payments-plugin .pm-account-scope-note>span{
  flex:0 0 auto;
  color:color-mix(in srgb,currentColor 45%,transparent);
  font-size:9.5px;
  font-weight:650;
}
.payments-plugin .pm-account-scope-note>p{
  margin:0;
  color:color-mix(in srgb,currentColor 56%,transparent);
  font-size:10px;
  line-height:1.5;
}
.payments-plugin .pm-account-form>.pm-error{
  margin:10px 24px 0;
}
.payments-plugin .pm-account-dialog-footer{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:18px;
  padding:14px 24px;
  border-top:1px solid var(--pm-border);
  background:color-mix(in srgb,#ffffff 36%,var(--background));
}
.payments-plugin .pm-account-save-preview{
  display:grid;
  min-width:0;
  gap:2px;
}
.payments-plugin .pm-account-save-preview>span{
  color:color-mix(in srgb,currentColor 44%,transparent);
  font-size:10px;
}
.payments-plugin .pm-account-save-preview>strong{
  display:flex;
  align-items:center;
  gap:7px;
  overflow:hidden;
  color:color-mix(in srgb,currentColor 74%,transparent);
  font-size:11.5px;
  font-weight:650;
  text-overflow:ellipsis;
  white-space:nowrap;
}
.payments-plugin .pm-account-save-preview i{
  color:var(--pm-accent);
  font-style:normal;
}
.payments-plugin .pm-account-dialog-actions{
  display:flex;
  flex:0 0 auto;
  align-items:center;
  gap:8px;
}
.payments-plugin .pm-account-dialog-actions>button{
  min-height:38px;
  border-radius:9px;
}
.payments-plugin .pm-account-dialog-actions>.pm-primary{
  display:inline-flex;
  min-width:128px;
  align-items:center;
  justify-content:center;
  gap:8px;
}
.payments-plugin .pm-account-dialog-actions>.pm-primary small{
  padding:1px 5px;
  border-radius:999px;
  background:#ffffff26;
  font-size:9.5px;
  font-weight:650;
}
@media(max-width:760px){
  .payments-plugin .pm-account-dialog{
    width:calc(100vw - 16px);
    max-width:calc(100vw - 16px);
    max-height:calc(100dvh - 16px);
  }
  .payments-plugin .pm-account-dialog-head{
    padding:18px 17px 15px;
  }
  .payments-plugin .pm-account-dialog h2{font-size:21px}
  .payments-plugin .pm-account-dialog-context{
    padding-inline:17px;
    line-height:1.5;
  }
  .payments-plugin .pm-account-dialog-steps{
    grid-template-columns:1fr;
    padding:14px 17px 16px;
  }
  .payments-plugin .pm-account-option-list{
    height:184px;
    max-height:184px;
  }
  .payments-plugin .pm-account-route-preview{
    grid-template-columns:1fr;
  }
  .payments-plugin .pm-account-route-preview>div:last-child{
    text-align:left;
  }
  .payments-plugin .pm-account-route-preview>i{
    justify-self:center;
    transform:rotate(90deg);
  }
  .payments-plugin .pm-account-dialog-footer{
    align-items:stretch;
    flex-direction:column;
    padding:12px 17px 15px;
  }
  .payments-plugin .pm-account-dialog-actions{
    justify-content:flex-end;
  }
}
@media(max-width:480px){
  .payments-plugin .pm-account-option-list label{
    grid-template-columns:18px minmax(0,1fr);
  }
  .payments-plugin .pm-option-state{
    display:none;
  }
  .payments-plugin .pm-account-dialog-actions{
    display:grid;
    grid-template-columns:1fr 1.35fr;
  }
  .payments-plugin .pm-account-dialog-actions>button{
    width:100%;
  }
}
.payments-plugin .pm-search-select-menu{
  border-color:var(--pm-border-strong);
  border-radius:12px;
  box-shadow:0 18px 50px #0003;
}

/* Transaction review cards: one calm surface, one semantic flow, one decision. */
.payments-plugin .pm-queue-card{
  border-radius:16px;
  background:color-mix(in srgb,currentColor 1.2%,var(--background));
  box-shadow:0 12px 34px color-mix(in srgb,#0f172a 5%,transparent);
}
.payments-plugin .pm-queue-heading{
  padding:16px 18px 13px;
  background:color-mix(in srgb,var(--background) 86%,transparent);
}
.payments-plugin .pm-queue-heading strong{font-size:16px}
.payments-plugin .pm-queue-heading small{font-size:11px;opacity:.62}
.payments-plugin .pm-table-tools{
  padding:9px 18px;
  background:color-mix(in srgb,var(--background) 74%,transparent);
}
.payments-plugin .pm-scroll{
  padding:0 12px 12px;
}
.payments-plugin .pm-scroll>table{
  min-width:1200px;
  border-collapse:separate;
  border-spacing:0 10px;
}
.payments-plugin .pm-scroll thead th{
  position:sticky;
  top:0;
  z-index:8;
  padding:11px 14px 10px;
  border-top:1px solid var(--pm-border);
  border-bottom:1px solid var(--pm-border);
  background:color-mix(in srgb,var(--background) 97%,transparent);
  color:color-mix(in srgb,currentColor 52%,transparent);
  font-size:10px;
  font-weight:650;
  letter-spacing:.025em;
}
.payments-plugin .pm-scroll thead th:first-child{
  border-left:1px solid var(--pm-border);
  border-radius:9px 0 0 9px;
}
.payments-plugin .pm-scroll thead th:last-child{
  border-right:1px solid var(--pm-border);
  border-radius:0 9px 9px 0;
}
.payments-plugin .pm-scroll tbody td{
  padding:16px 14px;
  border-top:1px solid var(--pm-border);
  border-bottom:1px solid var(--pm-border);
  background:var(--background);
  vertical-align:top;
}
.payments-plugin .pm-scroll tbody td:first-child{
  border-left:3px solid var(--pm-flow);
  border-radius:12px 0 0 12px;
}
.payments-plugin .pm-scroll tbody td:last-child{
  border-right:1px solid var(--pm-border);
  border-radius:0 12px 12px 0;
}
.payments-plugin .pm-scroll tbody tr:not(.pm-refund-group):hover{
  outline-color:transparent;
}
.payments-plugin .pm-scroll tbody tr:not(.pm-refund-group):hover td{
  border-top-color:color-mix(in srgb,currentColor 20%,transparent);
  border-bottom-color:color-mix(in srgb,currentColor 20%,transparent);
  background:color-mix(in srgb,currentColor 1.8%,var(--background));
}
.payments-plugin .pm-row-state{
  width:64px;
  padding-inline:8px!important;
}
.payments-plugin .pm-row-checkbox{
  width:18px!important;
  height:18px;
  margin:1px auto 8px!important;
}
.payments-plugin .pm-row-index{
  margin-bottom:5px;
  color:color-mix(in srgb,currentColor 44%,transparent);
  font-size:9px;
}
.payments-plugin .pm-row-lock-state{
  min-height:22px!important;
  font-size:9px!important;
}
.payments-plugin .pm-row-date{
  margin-bottom:7px;
  font-size:10px;
  letter-spacing:.015em;
}
.payments-plugin .pm-amount-control{
  gap:4px;
  margin:0 0 8px;
}
.payments-plugin .pm-currency{
  font-size:9px;
}
.payments-plugin .pm-amount-control input[type=text]{
  width:90px;
  color:var(--pm-flow);
  font-size:19px;
  font-weight:720;
}
.payments-plugin .pm-direction-chip{
  padding:3px 7px;
  font-size:9.5px;
}
.payments-plugin .pm-original-direction{
  margin-top:6px;
  font-size:9px;
  line-height:1.5;
}
.payments-plugin .pm-payee{
  min-width:255px;
  max-width:340px;
  padding-inline:17px!important;
}
.payments-plugin .pm-payee-title{
  align-items:flex-start;
  gap:10px;
}
.payments-plugin .pm-payee-button strong{
  font-size:13.5px;
  font-weight:680;
  line-height:1.42;
}
.payments-plugin .pm-payee-button>span{
  padding-top:2px;
  font-size:11px;
}
.payments-plugin .pm-trade-status{
  max-width:94px;
  padding:2px 7px;
  font-size:9px;
}
.payments-plugin .pm-trade-description{
  margin:7px 0 9px!important;
  color:color-mix(in srgb,currentColor 70%,transparent);
  font-size:10.5px;
  line-height:1.58!important;
}
.payments-plugin .pm-trade-meta{
  gap:7px;
}
.payments-plugin .pm-trade-meta>span{
  padding:2px 7px;
  background:transparent;
  box-shadow:inset 0 0 0 1px var(--pm-border);
  color:color-mix(in srgb,currentColor 58%,transparent);
  font-size:9px;
}
.payments-plugin .pm-payment-method{
  font-size:9.5px!important;
}
.payments-plugin .pm-row-accounts{
  min-width:430px;
  padding-inline:17px!important;
  box-shadow:inset 1px 0 color-mix(in srgb,currentColor 6%,transparent);
}
.payments-plugin .pm-route-heading{
  margin-bottom:9px;
}
.payments-plugin .pm-cell-label{
  font-size:9px;
  letter-spacing:.075em;
}
.payments-plugin .pm-route-caption{
  font-size:9px;
}
.payments-plugin .pm-account-route{
  grid-template-columns:minmax(155px,1fr) 28px minmax(155px,1fr);
  align-items:end;
  gap:7px;
}
.payments-plugin .pm-account-control{
  gap:5px;
}
.payments-plugin .pm-account-label{
  font-size:9px;
}
.payments-plugin .pm-account-control .pm-search-select-trigger{
  min-height:38px;
  padding-inline:10px;
  border-radius:9px;
  background:color-mix(in srgb,currentColor 1.5%,var(--background));
}
.payments-plugin .pm-account-route .pm-search-select-trigger>input[type=text]{
  font-size:11px;
  font-weight:600;
}
.payments-plugin .pm-account-route .pm-flow{
  margin-top:19px;
}
.payments-plugin .pm-account-route .pm-arrow{
  width:25px;
  height:25px;
  font-size:13px;
}
.payments-plugin .pm-ai{
  margin-top:8px;
  padding:7px 9px;
  border:1px solid color-mix(in srgb,var(--pm-accent) 11%,transparent);
  border-radius:8px;
  background:color-mix(in srgb,var(--pm-accent) 3.5%,var(--background));
  font-size:9.5px;
}
.payments-plugin .pm-ai strong{font-size:9px}
.payments-plugin .pm-ai span{font-size:9.5px}
.payments-plugin .pm-skipped-accounts{
  display:grid;
  gap:5px;
  min-height:76px;
  align-content:center;
  padding:11px 13px;
  border:1px dashed color-mix(in srgb,currentColor 14%,transparent);
  border-radius:10px;
  background:color-mix(in srgb,currentColor 1.5%,var(--background));
}
.payments-plugin .pm-skipped-accounts p{
  display:flex;
  flex-wrap:wrap;
  align-items:center;
  gap:7px;
  margin:0;
  color:color-mix(in srgb,currentColor 66%,transparent);
  font-family:"SFMono-Regular",Consolas,monospace;
  font-size:9.5px;
  line-height:1.5;
}
.payments-plugin .pm-skipped-accounts p strong{
  overflow-wrap:anywhere;
  font-weight:600;
}
.payments-plugin .pm-skipped-accounts p span{color:#94a3b8}
.payments-plugin .pm-skipped-accounts small{
  color:color-mix(in srgb,currentColor 44%,transparent);
  font-size:9px;
}
.payments-plugin .pm-row-review{
  width:238px;
  max-width:250px;
  padding-inline:15px!important;
  box-shadow:inset 1px 0 color-mix(in srgb,currentColor 6%,transparent);
}
.payments-plugin .pm-review-alert{
  margin-top:8px;
  padding:7px 9px;
  border-radius:5px 8px 8px 5px;
}
.payments-plugin .pm-review-alert>strong{
  margin-bottom:3px;
  font-size:9.5px;
}
.payments-plugin .pm-review-alert p,
.payments-plugin .pm-review-alert label{
  font-size:9px;
  line-height:1.5;
}
.payments-plugin .pm-refund{
  font-size:9.5px;
  line-height:1.5;
}
/* Final review-card polish: stable columns, readable type, one decision block. */
.payments-plugin .pm-scroll>table{
  width:100%;
  min-width:1420px;
  table-layout:fixed;
}
.payments-plugin .pm-col-state{width:56px}
.payments-plugin .pm-col-category{width:230px}
.payments-plugin .pm-col-payment{width:135px}
.payments-plugin .pm-col-funding{width:250px}
.payments-plugin .pm-col-review{width:210px}
.payments-plugin .pm-scroll thead th{
  height:42px;
  padding:9px 14px;
  font-size:11.5px;
  letter-spacing:.02em;
}
.payments-plugin .pm-column-heading{
  min-width:0;
}
.payments-plugin .pm-column-heading>span{
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}
.payments-plugin .pm-scroll tbody td{
  padding:16px 16px 15px;
  border-top-color:var(--pm-border);
  border-bottom-color:var(--pm-border);
  background:linear-gradient(
    180deg,
    color-mix(in srgb,#ffffff 24%,var(--background)),
    var(--background)
  );
  vertical-align:middle;
}
.payments-plugin .pm-scroll tbody td:first-child{
  border-left-width:4px;
  background:linear-gradient(
    90deg,
    color-mix(in srgb,var(--pm-flow) 7%,var(--background)),
    var(--background) 82%
  );
}
.payments-plugin .pm-scroll tbody tr:not(.pm-refund-group):hover td{
  border-top-color:color-mix(in srgb,currentColor 18%,transparent);
  border-bottom-color:color-mix(in srgb,currentColor 18%,transparent);
  background:color-mix(in srgb,currentColor 2%,var(--background));
}
.payments-plugin .pm-row-state{
  width:58px;
  padding-inline:7px!important;
}
.payments-plugin .pm-row-checkbox{
  width:19px!important;
  height:19px;
  margin:0 auto 7px!important;
}
.payments-plugin .pm-row-index{
  margin-bottom:3px;
  font-size:10.5px;
}
.payments-plugin .pm-row-lock-state{
  min-height:22px!important;
  padding:2px 3px!important;
  font-size:10px!important;
}
.payments-plugin .pm-row-date{
  margin-bottom:6px;
  font-size:12px;
  font-weight:560;
}
.payments-plugin .pm-amount-control{
  gap:5px;
  margin:0 0 7px;
}
.payments-plugin .pm-currency{
  font-size:9.5px;
  letter-spacing:.02em;
}
.payments-plugin .pm-amount-control input[type=text]{
  width:92px;
  font-size:21px;
  font-weight:740;
  letter-spacing:-.045em;
}
.payments-plugin .pm-direction-chip{
  padding:3px 8px;
  font-size:11px;
  font-weight:680;
}
.payments-plugin .pm-direction-chip i{
  width:6px;
  height:6px;
}
.payments-plugin .pm-original-direction{
  margin-top:6px;
  font-size:10.5px;
}
.payments-plugin .pm-payee{
  min-width:0;
  max-width:none;
  padding-inline:18px!important;
}
.payments-plugin .pm-payee-title{
  display:block;
}
.payments-plugin .pm-payee-button{
  width:100%;
  align-items:center;
  gap:6px;
}
.payments-plugin .pm-payee-button strong{
  overflow-wrap:normal;
  word-break:normal;
  font-size:15.5px;
  font-weight:680;
  line-height:1.4;
}
.payments-plugin .pm-payee-button>span{
  padding-top:0;
  font-size:11px;
}
.payments-plugin .pm-trade-description{
  margin:6px 0 8px!important;
  color:color-mix(in srgb,currentColor 68%,transparent);
  font-size:12.5px;
  line-height:1.55!important;
}
.payments-plugin .pm-trade-meta{
  gap:6px;
}
.payments-plugin .pm-trade-meta>span{
  padding:2px 7px;
  font-size:10.5px;
  line-height:1.5;
}
.payments-plugin .pm-trade-status{
  display:inline-flex;
  align-items:center;
  max-width:120px;
  padding:2px 0;
  border:0;
  border-radius:0;
  color:color-mix(in srgb,currentColor 47%,transparent);
  font-size:10.5px;
}
.payments-plugin .pm-trade-status:before{
  width:5px;
  height:5px;
  margin-right:5px;
  border-radius:50%;
  background:color-mix(in srgb,var(--pm-flow) 58%,currentColor);
  content:"";
}
.payments-plugin .pm-payment-method{
  min-height:22px!important;
  padding:2px 6px!important;
  font-size:11px!important;
}
.payments-plugin .pm-row-accounts{
  min-width:0;
  padding-inline:17px!important;
}
.payments-plugin .pm-row-merchant,
.payments-plugin .pm-row-category,
.payments-plugin .pm-row-payment,
.payments-plugin .pm-row-funding{
  min-width:0;
  vertical-align:top!important;
}
.payments-plugin .pm-row-merchant .pm-payee-button{
  min-height:40px!important;
}
.payments-plugin .pm-row-merchant .pm-payee-title:has(>strong){
  display:flex;
  align-items:center;
  min-height:40px;
}
.payments-plugin .pm-row-merchant .pm-payee-button strong{
  display:-webkit-box;
  overflow:hidden;
  overflow-wrap:anywhere;
  -webkit-box-orient:vertical;
  -webkit-line-clamp:2;
}
.payments-plugin .pm-row-payment .pm-payment-method{
  min-height:40px!important;
  padding:0!important;
  font-size:12px!important;
  text-align:left;
  overflow-wrap:anywhere;
}
.payments-plugin .pm-funding-route{
  display:grid;
  grid-template-columns:26px minmax(0,1fr);
  align-items:center;
  gap:8px;
  min-width:0;
}
.payments-plugin .pm-account-direction{
  display:grid;
  place-items:center;
  width:26px;
  height:34px;
  border:1px solid color-mix(in srgb,var(--pm-flow) 25%,transparent);
  border-radius:8px;
  background:color-mix(in srgb,var(--pm-flow) 7%,var(--background));
  color:var(--pm-flow);
  font-size:23px;
  font-weight:650;
  line-height:1;
}
.payments-plugin .pm-row-category .pm-account-control,
.payments-plugin .pm-row-funding .pm-account-control{
  min-width:0;
}
.payments-plugin .pm-row-category .pm-search-select-trigger>input[type=text],
.payments-plugin .pm-row-funding .pm-search-select-trigger>input[type=text]{
  font-size:12px;
  font-weight:600;
}
.payments-plugin .pm-row-category .pm-account-browser-action,
.payments-plugin .pm-row-funding .pm-account-browser-action{
  display:none;
}
.payments-plugin .pm-preserved-account{
  display:flex;
  align-items:center;
  min-width:0;
  min-height:40px;
  font-size:12px;
  overflow-wrap:anywhere;
}
.payments-plugin .pm-original-caption{
  margin:0 0 9px;
  color:color-mix(in srgb,currentColor 54%,transparent);
  font-size:10.5px;
  line-height:1.6;
}
.payments-plugin .pm-original-content dl{
  margin:0;
}
.payments-plugin .pm-original-content dl>div{
  display:grid;
  grid-template-columns:minmax(0,1fr);
  gap:3px;
  padding:7px 0;
  border-top:1px solid var(--pm-border);
}
.payments-plugin .pm-original-content dt,
.payments-plugin .pm-original-content dd{
  min-width:0;
  margin:0;
  line-height:1.6;
  white-space:pre-wrap;
  overflow-wrap:anywhere;
}
.payments-plugin .pm-original-content dt{
  color:color-mix(in srgb,currentColor 58%,transparent);
  font-size:11px;
}
.payments-plugin .pm-original-content dd{
  font-variant-numeric:tabular-nums;
}
.payments-plugin .pm-original-content dd[data-empty=true]{
  color:color-mix(in srgb,currentColor 38%,transparent);
}
.payments-plugin .pm-route-heading{
  margin-bottom:8px;
}
.payments-plugin .pm-cell-label{
  color:color-mix(in srgb,currentColor 62%,transparent);
  font-size:10.5px;
}
.payments-plugin .pm-route-caption{
  overflow:hidden;
  color:color-mix(in srgb,currentColor 42%,transparent);
  font-size:10.5px;
  text-overflow:ellipsis;
  white-space:nowrap;
}
.payments-plugin .pm-account-route{
  grid-template-columns:minmax(0,1fr) 30px minmax(0,1fr);
  gap:8px;
}
.payments-plugin .pm-account-label{
  font-size:10.5px;
  font-weight:650;
}
.payments-plugin .pm-account-control{
  gap:5px;
}
.payments-plugin .pm-account-control .pm-search-select-trigger{
  min-height:40px;
  padding-inline:11px;
  border-color:color-mix(in srgb,currentColor 16%,transparent);
  border-radius:9px;
  background:var(--background);
  box-shadow:0 1px 2px color-mix(in srgb,#0f172a 3%,transparent);
}
.payments-plugin .pm-account-control[data-missing=true] .pm-search-select-trigger{
  border-color:color-mix(in srgb,#d97706 40%,transparent);
  background:color-mix(in srgb,#f59e0b 4%,var(--background));
}
.payments-plugin .pm-account-route .pm-search-select-trigger>input[type=text]{
  font-size:12px;
  font-weight:600;
}
.payments-plugin .pm-account-route .pm-account-browser-action{
  display:none;
}
.payments-plugin .pm-account-route .pm-flow{
  margin-top:20px;
}
.payments-plugin .pm-account-route .pm-arrow{
  width:28px;
  height:28px;
  border-color:color-mix(in srgb,var(--pm-flow) 25%,transparent);
  background:color-mix(in srgb,var(--pm-flow) 8%,var(--background));
  color:var(--pm-flow);
  font-size:14px;
  font-weight:700;
}
.payments-plugin .pm-ai{
  margin-top:8px;
  padding:7px 9px;
}
.payments-plugin .pm-ai strong,
.payments-plugin .pm-ai span{
  font-size:11px;
}
.payments-plugin .pm-skipped-accounts{
  min-height:84px;
  padding:12px 14px;
  border-color:color-mix(in srgb,currentColor 19%,transparent);
}
.payments-plugin .pm-skipped-accounts p{
  font-size:11px;
}
.payments-plugin .pm-skipped-accounts small{
  font-size:10.5px;
  line-height:1.5;
}
.payments-plugin .pm-row-review{
  width:210px;
  max-width:none;
  padding-inline:15px!important;
  vertical-align:top!important;
}
.payments-plugin .pm-scroll tbody .pm-row-state{
  vertical-align:top!important;
}
.payments-plugin .pm-review-alert{
  margin-top:8px;
  padding:8px 10px;
  border-left-width:3px;
}
.payments-plugin .pm-review-alert>strong{
  margin-bottom:3px;
  font-size:11px;
}
.payments-plugin .pm-review-alert p,
.payments-plugin .pm-review-alert label{
  font-size:10.5px;
  line-height:1.5;
}
.payments-plugin .pm-refund{
  padding:9px 10px;
  font-size:11px;
}
.payments-plugin .pm-refund-group>td{
  padding:0;
}
.payments-plugin .pm-refund-drawer{
  overflow:hidden;
  border:1px solid color-mix(in srgb,#64748b 22%,var(--pm-border));
  border-left:4px solid color-mix(in srgb,#64748b 72%,currentColor);
  border-radius:12px;
  background:
    linear-gradient(105deg,color-mix(in srgb,#64748b 6%,var(--background)),transparent 68%),
    var(--background);
}
.payments-plugin .pm-refund-drawer>summary{
  align-items:flex-start;
  gap:13px;
  padding:15px 16px;
}
.payments-plugin .pm-refund-chevron{
  display:grid;
  place-items:center;
  flex:0 0 28px;
  width:28px;
  height:28px;
  margin-top:1px;
  border:1px solid color-mix(in srgb,currentColor 16%,transparent);
  border-radius:8px;
  background:var(--background);
  color:color-mix(in srgb,currentColor 62%,transparent);
  font-size:19px;
  font-weight:500;
}
.payments-plugin .pm-refund-overview{
  display:grid;
  gap:12px;
}
.payments-plugin .pm-refund-heading{
  gap:6px 8px;
  margin:0;
}
.payments-plugin .pm-refund-heading>strong{
  margin-right:3px;
  color:var(--foreground);
  font-size:13px;
  font-weight:680;
}
.payments-plugin .pm-refund-heading>.pm-muted{
  display:inline-flex;
  align-items:center;
  gap:4px;
  min-height:22px;
  padding:2px 7px;
  border:1px solid var(--pm-border);
  border-radius:999px;
  background:color-mix(in srgb,#ffffff 22%,var(--background));
  color:color-mix(in srgb,currentColor 52%,transparent);
  font-size:10px;
  line-height:1.4;
}
.payments-plugin .pm-refund-facts{
  grid-template-columns:180px minmax(260px,1fr) 185px;
  gap:12px 20px;
  align-items:start;
}
.payments-plugin .pm-refund-facts>span{
  min-width:0;
}
.payments-plugin .pm-refund-facts>span:first-child{
  padding-right:18px;
  border-right:1px solid var(--pm-border);
}
.payments-plugin .pm-refund-facts>span:first-child>strong{
  color:var(--foreground);
  font-size:20px;
  font-weight:700;
  letter-spacing:-.025em;
}
.payments-plugin .pm-refund-facts small{
  margin-top:5px;
  color:color-mix(in srgb,currentColor 52%,transparent);
  font-size:10.5px;
  line-height:1.5;
}
.payments-plugin .pm-refund-party>strong{
  display:block;
  color:var(--foreground);
  font-size:12px;
  font-weight:680;
  line-height:1.45;
}
.payments-plugin .pm-refund-party>small:nth-of-type(1){
  display:-webkit-box;
  margin-top:4px;
  overflow:hidden;
  color:color-mix(in srgb,currentColor 64%,transparent);
  -webkit-box-orient:vertical;
  -webkit-line-clamp:2;
}
.payments-plugin .pm-refund-party>small:last-child{
  color:var(--pm-accent);
  font-weight:600;
}
.payments-plugin .pm-refund-action{
  align-self:center;
  padding:6px 9px;
  border:1px solid var(--pm-border);
  border-radius:8px;
  background:var(--background);
  color:color-mix(in srgb,currentColor 64%,transparent);
  font-size:10.5px;
  font-weight:600;
}
.payments-plugin .pm-refund-content{
  padding:4px 12px 8px;
  border-top-color:var(--pm-border);
}
.payments-plugin .pm-refund-content table{
  min-width:1420px;
  table-layout:fixed;
}
@keyframes pm-rise{
  from{opacity:0;transform:translateY(8px)}
  to{opacity:1;transform:none}
}
@keyframes pm-pulse{
  0%,100%{opacity:.45;transform:scale(.8)}
  50%{opacity:1;transform:scale(1)}
}
@media(max-width:900px){
  .payments-plugin{padding:20px 14px 100px}
  .payments-plugin .pm-page-head{grid-template-columns:1fr;gap:13px}
  .payments-plugin .pm-local-badge{justify-self:start;margin:0}
  .payments-plugin .pm-workspace-head{flex-direction:column}
  .payments-plugin .pm-batch-utility-actions{width:100%;justify-content:flex-end}
  .payments-plugin .pm-review-actions{justify-content:flex-end}
  .payments-plugin .pm-warning-review{justify-content:flex-start}
  .payments-plugin .pm-pagination{align-items:flex-start;flex-direction:column}
  .payments-plugin .pm-pagination-controls{width:100%;flex-wrap:wrap}
  .payments-plugin .pm-scroll>table{min-width:1060px}
  .payments-plugin .pm-payee{min-width:240px;max-width:300px}
  .payments-plugin .pm-row-accounts{min-width:380px}
  .payments-plugin .pm-row-review{width:220px;max-width:230px}
  .payments-plugin .pm-account-route{
    grid-template-columns:minmax(145px,1fr) 24px minmax(145px,1fr);
  }
  .payments-plugin .pm-scroll thead th:first-child{
    position:sticky;
    left:0;
    z-index:4;
    background:var(--background);
    box-shadow:1px 0 0 var(--pm-border);
  }
  .payments-plugin .pm-scroll tbody .pm-row-state{
    position:sticky;
    left:0;
    z-index:3;
    background:inherit;
    box-shadow:1px 0 0 var(--pm-border);
  }
}
@media(max-width:680px){
  .payments-plugin .pm-queue-card>.pm-filter-board{padding-inline:10px}
  .payments-plugin .pm-workflow{grid-template-columns:1fr}
  .payments-plugin .pm-workflow small{white-space:normal}
  .payments-plugin .pm-statements-head{align-items:stretch;flex-direction:column;gap:12px}
  .payments-plugin .pm-upload-actions{align-items:stretch}
  .payments-plugin .pm-upload-actions>.pm-section-label{justify-self:start}
  .payments-plugin .pm-upload-actions .pm-upload-grid{width:100%}
  .payments-plugin .pm-statement{grid-template-columns:38px minmax(0,1fr);gap:10px;padding:14px}
  .payments-plugin .pm-statement-actions{grid-column:1/-1;justify-content:flex-end}
  .payments-plugin .pm-statement-name,.payments-plugin .pm-statement-path{white-space:normal;overflow-wrap:anywhere}
  .payments-plugin .pm-statements-footer span+span:before{display:none}
  .payments-plugin .pm-filter-board,.payments-plugin .pm-mapping-tray,.payments-plugin .pm-queue-card{margin-inline:14px}
  .payments-plugin .pm-filter-board-head{align-items:flex-start}
  .payments-plugin .pm-stats{grid-auto-flow:row;grid-template-columns:repeat(2,minmax(0,1fr))}
  .payments-plugin .pm-queue-heading{align-items:stretch;flex-direction:column}
  .payments-plugin .pm-table-search{flex-basis:auto;width:100%}
  .payments-plugin .pm-queue-card .pm-scroll{max-height:none}
  .payments-plugin .pm-mapping-tray>summary small{display:none}
  .payments-plugin .pm-commit-confirm{grid-template-columns:1fr;gap:10px}
  .payments-plugin .pm-confirm-facts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr))}
  .payments-plugin .pm-scroll>table{min-width:930px}
  .payments-plugin .pm-scroll tbody td{padding:12px 9px}
  .payments-plugin .pm-payee{min-width:220px;max-width:260px}
  .payments-plugin .pm-row-accounts{min-width:300px}
  .payments-plugin .pm-row-review{width:205px;max-width:220px}
  .payments-plugin .pm-account-route{
    grid-template-columns:minmax(0,1fr) 20px minmax(0,1fr);
    gap:3px;
  }
  .payments-plugin .pm-account-control .pm-search-select-trigger{min-height:40px}
  .payments-plugin .pm-account-route .pm-arrow{width:20px;height:20px}
  .payments-plugin .pm-payee-title{flex-wrap:wrap}
  .payments-plugin .pm-trade-status{max-width:100%}
}
@media(max-width:480px){
  .payments-plugin .pm-page-copy h1{font-size:31px}
  .payments-plugin .pm-upload-actions .pm-upload-grid{grid-template-columns:1fr}
  .payments-plugin .pm-filter-groups{gap:6px}
  .payments-plugin .pm-batch-utility-actions{flex-wrap:wrap;justify-content:flex-start}
  .payments-plugin .pm-save-state{flex-basis:100%}
  .payments-plugin .pm-mapping-tray .pm-mapping-editor-form{display:grid;grid-template-columns:1fr;gap:5px}
  .payments-plugin .pm-mapping-tray .pm-account-arrow{display:none}
  .payments-plugin .pm-mapping-tray .pm-mapping-save{width:100%}
  .payments-plugin .pm-pagination-controls label{width:100%;margin:3px 0 0}
  .payments-plugin .pm-review-actions>button{flex:1 1 calc(50% - 6px)}
  .payments-plugin .pm-review-actions>.pm-commit-primary{flex-basis:100%;margin-left:0}
}
@container pm-review (max-width:1000px){
  .payments-plugin .pm-filter-groups{grid-template-columns:minmax(0,3fr) minmax(0,5fr) minmax(0,2fr)}
}
@container pm-review (max-width:780px){
  .payments-plugin .pm-filter-groups{grid-template-columns:minmax(0,1fr)}
}
.payments-plugin .pm-commit-dock[data-layout=compact]{grid-template-columns:200px minmax(0,1fr);gap:9px 16px}
.payments-plugin .pm-commit-dock[data-layout=compact] .pm-dock-summary{border-right:0;padding:0 2px}
.payments-plugin .pm-commit-dock[data-layout=compact] .pm-dock-actions{grid-column:1/-1}
.payments-plugin .pm-commit-dock[data-layout=small]{grid-template-columns:minmax(0,1fr);gap:8px}
.payments-plugin .pm-commit-dock[data-layout=small] .pm-dock-summary{display:flex;align-items:baseline;flex-wrap:wrap;gap:4px 10px;border-right:0;padding:0 2px}
.payments-plugin .pm-commit-dock[data-layout=small] .pm-dock-progress{padding:0 2px}
@media(max-width:1180px){
  .payments-plugin .pm-scroll>table,
  .payments-plugin .pm-refund-content table{min-width:1320px}
  .payments-plugin .pm-col-category{width:210px}
  .payments-plugin .pm-col-funding{width:230px}
  .payments-plugin .pm-col-review{width:190px}
}
@media(max-width:900px){
  .payments-plugin .pm-row-review{width:190px}
}
@media(max-width:680px){
  .payments-plugin .pm-row-review{width:190px}
}
.payments-plugin .pm-linking-entry{
  display:grid;
  grid-template-columns:minmax(210px,.72fr) minmax(0,1.28fr);
  align-items:stretch;
  gap:14px;
  margin:14px 18px 0;
  padding:15px;
  border:1px solid color-mix(in srgb,var(--pm-accent) 17%,var(--pm-border));
  border-radius:14px;
  background:
    radial-gradient(circle at 5% 0%,var(--pm-accent-soft),transparent 38%),
    color-mix(in srgb,var(--background) 96%,var(--pm-accent));
}
.payments-plugin .pm-linking-entry-copy{
  display:flex;
  min-width:0;
  flex-direction:column;
  justify-content:center;
  gap:4px;
  padding:2px 4px;
}
.payments-plugin .pm-linking-entry-copy>strong{
  color:var(--foreground);
  font-size:17px;
  font-weight:710;
  letter-spacing:-.025em;
}
.payments-plugin .pm-linking-entry-copy>small{
  max-width:330px;
  color:color-mix(in srgb,currentColor 53%,transparent);
  font-size:10.5px;
  line-height:1.55;
}
.payments-plugin .pm-linking-entry-actions{
  display:grid;
  grid-template-columns:repeat(2,minmax(0,1fr));
  gap:9px;
}
.payments-plugin .pm-linking-entry-actions>button{
  display:grid;
  grid-template-columns:minmax(0,1fr) auto;
  align-content:center;
  gap:2px 10px;
  min-height:64px;
  padding:10px 12px;
  border:1px solid var(--pm-border);
  border-radius:10px;
  background:color-mix(in srgb,#ffffff 48%,var(--background));
  color:var(--foreground);
  text-align:left;
  box-shadow:0 1px 0 color-mix(in srgb,#ffffff 65%,transparent);
}
.payments-plugin .pm-linking-entry-actions>button:hover:not(:disabled){
  border-color:color-mix(in srgb,var(--pm-accent) 34%,var(--pm-border));
  background:color-mix(in srgb,var(--pm-accent) 4%,var(--background));
}
.payments-plugin .pm-linking-entry-actions span{
  font-size:13px;
  font-weight:690;
}
.payments-plugin .pm-linking-entry-actions small{
  grid-column:1;
  color:color-mix(in srgb,currentColor 49%,transparent);
  font-size:10px;
  line-height:1.4;
}
.payments-plugin .pm-linking-entry-actions b{
  grid-column:2;
  grid-row:1/3;
  align-self:center;
  padding:4px 7px;
  border-radius:6px;
  background:var(--pm-accent-soft);
  color:var(--pm-accent);
  font-size:9.5px;
  font-weight:680;
  white-space:nowrap;
}
.payments-plugin .pm-link-dimensions{
  display:grid;
  grid-template-columns:repeat(3,minmax(0,1fr));
  gap:6px;
  padding:12px;
  border-bottom:1px solid var(--pm-border);
  background:color-mix(in srgb,currentColor 1.2%,var(--background));
}
.payments-plugin .pm-link-dimensions>button{
  --pm-rule-color:#7c3aed;
  display:flex;
  flex-direction:column;
  align-items:flex-start;
  justify-content:center;
  gap:5px;
  min-width:0;
  min-height:66px;
  padding:10px;
  border:1px solid var(--pm-border);
  border-radius:8px;
  background:var(--background);
  color:color-mix(in srgb,currentColor 68%,transparent);
  text-align:left;
}
.payments-plugin .pm-link-dimensions>button[data-rule-type=payment]{--pm-rule-color:#2563eb}
.payments-plugin .pm-link-dimensions>button[data-rule-type=description]{--pm-rule-color:#b45309}
.payments-plugin .pm-link-dimensions>button:hover:not(:disabled){
  border-color:color-mix(in srgb,var(--pm-rule-color) 38%,var(--pm-border));
  background:color-mix(in srgb,var(--pm-rule-color) 3%,var(--background));
}
.payments-plugin .pm-link-dimensions>button[aria-pressed=true]{
  border-color:color-mix(in srgb,var(--pm-rule-color) 48%,var(--pm-border));
  background:color-mix(in srgb,var(--pm-rule-color) 7%,var(--background));
  color:var(--pm-rule-color);
  box-shadow:inset 0 -2px var(--pm-rule-color);
}
.payments-plugin .pm-link-dimensions>button:focus-visible{
  outline:2px solid var(--pm-rule-color);
  outline-offset:2px;
}
.payments-plugin .pm-link-dimensions>button strong{
  font-size:12px;
  font-weight:680;
  line-height:1.4;
  white-space:nowrap;
}
.payments-plugin .pm-link-dimensions>button small{
  color:color-mix(in srgb,var(--foreground) 55%,transparent);
  font-size:9.5px;
  line-height:1.5;
  white-space:normal;
}
.payments-plugin .pm-link-selector{
  display:grid;
  min-width:0;
}
.payments-plugin .pm-link-control{
  display:grid;
  grid-template-columns:58px minmax(0,1fr);
  align-items:center;
  gap:8px;
  padding:9px 12px 0;
}
.payments-plugin .pm-link-control+.pm-link-control{
  padding-top:7px;
}
.payments-plugin .pm-link-control-label{
  color:color-mix(in srgb,currentColor 45%,transparent);
  font-size:9.5px;
  font-weight:680;
  letter-spacing:.03em;
}
.payments-plugin .pm-link-search{
  display:grid;
  grid-template-columns:auto minmax(0,1fr);
  align-items:center;
  gap:9px;
  padding:10px 12px 3px;
  color:color-mix(in srgb,currentColor 54%,transparent);
  font-size:10px;
  font-weight:650;
}
.payments-plugin .pm-link-search input{
  width:100%;
  min-width:0;
  height:32px;
  padding:0 9px;
  border-radius:7px;
  font-size:11px;
}
.payments-plugin .pm-description-condition{
  margin-top:8px;
  border-top:1px solid var(--pm-border);
  background:color-mix(in srgb,var(--pm-accent) 1.8%,var(--background));
}
.payments-plugin .pm-description-condition .pm-description-step{
  padding-bottom:7px;
  border-bottom:0;
}
.payments-plugin .pm-description-hint{
  display:grid;
  gap:7px;
  margin:0;
  padding:6px 12px 10px;
  color:color-mix(in srgb,currentColor 50%,transparent);
  font-size:10.5px;
  line-height:1.5;
}
.payments-plugin .pm-description-hint>p{
  margin:0;
}
.payments-plugin .pm-description-hint.is-error{
  color:#b91c1c;
  font-weight:650;
}
.payments-plugin .pm-description-options{
  box-sizing:border-box;
  display:grid;
  grid-auto-rows:max-content;
  align-content:start;
  gap:4px;
  width:100%;
  height:184px;
  max-height:184px;
  margin:0;
  padding:6px 8px 8px;
  overflow-x:hidden;
  overflow-y:auto;
  overscroll-behavior:contain;
  scrollbar-gutter:stable;
  border:0;
  border-top:1px solid color-mix(in srgb,currentColor 8%,transparent);
  background:transparent;
}
.payments-plugin .pm-description-options>legend{
  display:flex;
  width:100%;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  padding:4px 4px 5px;
  color:color-mix(in srgb,currentColor 52%,transparent);
  font-size:10px;
  font-weight:680;
}
.payments-plugin .pm-description-options>legend small{
  color:color-mix(in srgb,currentColor 40%,transparent);
  font-size:9.5px;
  font-weight:550;
}
.payments-plugin .pm-description-options>button{
  display:grid;
  grid-template-columns:minmax(0,1fr) auto;
  align-items:center;
  gap:10px;
  width:100%;
  min-height:42px;
  padding:7px 9px;
  overflow:hidden;
  border:1px solid transparent;
  border-radius:8px;
  background:color-mix(in srgb,currentColor 2%,var(--background));
  color:var(--foreground);
  font:inherit;
  text-align:left;
  cursor:pointer;
}
.payments-plugin .pm-description-options>button>span{
  min-width:0;
  overflow:hidden;
  font-size:11px;
  line-height:1.45;
  text-overflow:ellipsis;
  white-space:nowrap;
}
.payments-plugin .pm-description-options>button>small{
  padding:2px 6px;
  border-radius:999px;
  background:color-mix(in srgb,currentColor 5%,var(--background));
  color:color-mix(in srgb,currentColor 46%,transparent);
  font-size:9px;
  font-weight:650;
  white-space:nowrap;
}
.payments-plugin .pm-description-options>button:hover{
  border-color:var(--pm-border);
  background:color-mix(in srgb,currentColor 4%,var(--background));
}
.payments-plugin .pm-description-options>button[data-match=true]{
  border-color:color-mix(in srgb,var(--pm-accent) 18%,transparent);
  background:color-mix(in srgb,var(--pm-accent) 4%,var(--background));
}
.payments-plugin .pm-description-options>button[data-selected=true]{
  border-color:color-mix(in srgb,var(--pm-accent) 32%,transparent);
  background:color-mix(in srgb,var(--pm-accent) 7%,var(--background));
}
.payments-plugin .pm-description-options>p{
  margin:10px 4px;
  color:color-mix(in srgb,currentColor 48%,transparent);
  font-size:10.5px;
  text-align:center;
}
.payments-plugin .pm-link-selector .pm-account-option-list>p{
  margin:8px;
  color:color-mix(in srgb,currentColor 50%,transparent);
  font-size:11px;
  text-align:center;
}
.payments-plugin .pm-link-kind-tabs{
  display:flex;
  gap:4px;
  min-width:0;
  padding:0;
  overflow-x:auto;
  scrollbar-width:thin;
}
.payments-plugin .pm-link-kind-tabs>button{
  flex:0 0 auto;
  min-height:28px;
  padding:3px 9px;
  border-color:transparent;
  background:transparent;
  color:color-mix(in srgb,currentColor 54%,transparent);
  font-size:10px;
}
.payments-plugin .pm-link-kind-tabs>button:hover{
  background:color-mix(in srgb,currentColor 5%,var(--background));
}
.payments-plugin .pm-link-kind-tabs>button[aria-pressed=true]{
  border-color:color-mix(in srgb,var(--pm-accent) 24%,transparent);
  background:var(--pm-accent-soft);
  color:var(--pm-accent);
}
.payments-plugin .pm-link-rule-tabs{
  display:inline-flex;
  justify-self:start;
  gap:2px;
  padding:2px;
  border:1px solid var(--pm-border);
  border-radius:8px;
  background:color-mix(in srgb,currentColor 3%,var(--background));
}
.payments-plugin .pm-link-rule-tabs>button{
  min-height:26px;
  padding:2px 9px;
  border-color:transparent;
  border-radius:6px;
  background:transparent;
  color:color-mix(in srgb,currentColor 52%,transparent);
  font-size:10px;
}
.payments-plugin .pm-link-rule-tabs>button:hover:not(:disabled){
  background:color-mix(in srgb,currentColor 5%,var(--background));
}
.payments-plugin .pm-link-rule-tabs>button[aria-pressed=true]{
  border-color:color-mix(in srgb,var(--pm-accent) 20%,transparent);
  background:var(--background);
  color:var(--pm-accent);
  box-shadow:0 1px 4px color-mix(in srgb,currentColor 7%,transparent);
}
@media(max-width:820px){
  .payments-plugin .pm-linking-entry{
    grid-template-columns:1fr;
  }
  .payments-plugin .pm-linking-entry-copy>small{max-width:none}
}
@media(max-width:760px){
  .payments-plugin .pm-linking-entry{
    margin-inline:14px;
  }
}
@media(max-width:520px){
  .payments-plugin .pm-linking-entry-actions{
    grid-template-columns:1fr;
  }
  .payments-plugin .pm-linking-entry-actions>button{
    min-height:58px;
  }
}
${reviewTableStyles}
.payments-plugin .pm-linking-entry-actions{grid-template-columns:repeat(3,minmax(0,1fr))}
.payments-plugin .pm-description-primary{margin:0;padding-bottom:8px;border:0;border-bottom:1px solid var(--pm-border)}
.payments-plugin .pm-description-scope{grid-template-columns:58px minmax(0,1fr)}
.payments-plugin .pm-description-scope .pm-link-rule-tabs{max-width:100%;flex-wrap:wrap}
.payments-plugin .pm-rule-selection-hint{margin:0;padding:10px 12px;color:color-mix(in srgb,currentColor 55%,transparent);font-size:10.5px;line-height:1.6}
.payments-plugin .pm-review-table .pm-trade-content{display:flex;align-items:center;flex-wrap:wrap;gap:4px 10px;min-width:0;max-width:100%}
.payments-plugin .pm-review-table .pm-trade-content .pm-trade-title{flex:0 1 auto;min-width:0}
.payments-plugin .pm-review-table .pm-original-info-button{display:inline-flex;flex:0 0 auto;align-items:center;justify-content:center;gap:4px;min-height:26px;margin:0;padding:3px 7px;border:1px solid var(--pm-border);border-radius:6px;background:color-mix(in srgb,var(--foreground) 2%,var(--background));color:color-mix(in srgb,var(--foreground) 65%,transparent);font-size:11px;font-weight:500;line-height:1.5;white-space:nowrap;cursor:pointer}
.payments-plugin .pm-review-table .pm-original-info-button>svg{flex:0 0 13px;opacity:.8}
.payments-plugin .pm-review-table .pm-original-info-button:hover{color:var(--pm-accent);border-color:color-mix(in srgb,var(--pm-accent) 32%,var(--pm-border));background:var(--pm-accent-soft)}
.payments-plugin .pm-review-table .pm-original-info-button:focus-visible{outline:2px solid var(--pm-accent);outline-offset:2px}
.payments-plugin .pm-review-table .pm-trade-title[aria-disabled=true]{color:var(--foreground);cursor:text}
@media(max-width:680px){.payments-plugin .pm-linking-entry-actions{grid-template-columns:1fr}}
@media(max-width:480px){.payments-plugin .pm-link-dimensions{grid-template-columns:1fr}.payments-plugin .pm-link-dimensions>button{flex-direction:row;justify-content:space-between;align-items:center;min-height:42px;gap:10px}.payments-plugin .pm-link-dimensions>button small{text-align:right}}
@media(prefers-reduced-motion:reduce){
  .payments-plugin .pm-page-head,
  .payments-plugin .pm-statements-card,
  .payments-plugin .pm-review-workspace{animation:none}
  .payments-plugin .pm-activity-dot{animation:none}
}
`;
