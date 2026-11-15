export const accountBrowserStyles = `
.pm-search-select{position:relative;flex:1 1 180px;min-width:0}
.pm-search-select-trigger{display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;min-width:0;min-height:36px;padding:0 8px;text-align:left;border:1px solid color-mix(in srgb,currentColor 20%,transparent);border-radius:6px;background:var(--background);cursor:pointer}
.pm-search-select-trigger:focus-within{outline:2px solid color-mix(in srgb,#2563eb 35%,transparent);outline-offset:1px}
.pm-search-select-trigger.is-disabled{cursor:not-allowed;opacity:.5}
.pm-search-select-trigger>input[type=text]{flex:1;min-width:0;width:auto;height:34px;padding:0;border:0;outline:0;background:transparent;color:inherit;font:inherit;font-size:14px;font-weight:500;line-height:1.35;cursor:pointer}
.pm-search-select-trigger>input[type=text]::placeholder{color:color-mix(in srgb,currentColor 60%,transparent)}
.pm-search-select-chevron{display:block;flex:0 0 16px;width:16px;height:16px;align-self:center;margin:0 1px 0 0;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round;transition:transform .16s ease;opacity:.72}
.pm-search-select-chevron.is-open{transform:rotate(180deg)}
.pm-search-select-trigger>span:first-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pm-search-select-menu{position:absolute;z-index:30;top:calc(100% + 5px);left:0;display:flex;flex-direction:column;width:max(100%,280px);max-width:min(420px,calc(100vw - 32px));padding:8px;border:1px solid color-mix(in srgb,currentColor 18%,transparent);border-radius:10px;background:var(--background);box-shadow:0 14px 34px #0003;overflow:hidden}
.pm-search-select-menu input[type=search]{flex:0 0 auto;width:100%;margin-bottom:8px}
.pm-search-select-options{display:flex;flex:1 1 auto;flex-direction:column;min-width:0;min-height:0;max-height:260px;overflow:auto;overscroll-behavior:contain}
.pm-search-select-options>button{display:flex;align-items:center;justify-content:space-between;width:100%;padding:8px 9px;text-align:left;border-color:transparent;background:transparent}
.pm-search-select-options>button:hover,.pm-search-select-options>button.is-active{background:color-mix(in srgb,currentColor 8%,var(--background))}
.pm-search-select-options>button[aria-selected=true]{font-weight:650;color:#2563eb}
.pm-search-select-options>label{display:flex;align-items:flex-start;justify-content:flex-start;gap:9px;width:100%;padding:8px 9px;border-radius:6px;text-align:left;cursor:pointer}
.pm-search-select-options>label:hover{background:color-mix(in srgb,currentColor 7%,var(--background))}
.pm-search-select-options>label:has(input:checked){background:color-mix(in srgb,#2563eb 7%,var(--background))}
.pm-search-select-options>label>input[type=checkbox]{flex:0 0 auto;width:16px;min-width:16px;max-width:16px;height:16px;margin:2px 0 0;padding:0;accent-color:#2563eb}
.pm-search-select-options>label>span{flex:1 1 auto;min-width:0;line-height:1.5;overflow-wrap:anywhere}
.pm-search-select-options p{padding:8px 9px;margin:0}
.pm-search-select-footer{display:flex;flex:0 0 auto;align-items:center;justify-content:flex-end;gap:8px;padding-top:8px;border-top:1px solid color-mix(in srgb,currentColor 10%,transparent)}
.pm-search-select-footer span{margin-right:auto;font-size:12px;opacity:.65}
.pm-search-select-footer button{font-size:12px}
.pm-account-browser-trigger{gap:4px;padding:0 0 0 8px;color:var(--foreground);border-color:color-mix(in srgb,currentColor 20%,transparent);background:var(--background)}
.pm-account-browser-trigger>input[type=text]{font-weight:500}
.pm-account-browser-trigger>.pm-account-browser-value{flex:1;min-width:0;white-space:normal}
.pm-account-browser.is-link .pm-account-browser-trigger{width:max-content;max-width:100%}
.pm-account-browser.is-link .pm-account-browser-trigger>.pm-account-browser-value{flex:0 1 auto;white-space:nowrap}
.pm-account-browser.is-link .pm-account-browser-placeholder{color:color-mix(in srgb,currentColor 58%,transparent)}
.pm-account-browser-trigger>input.pm-account-browser-value-input{position:absolute;width:1px!important;height:1px!important;margin:-1px;padding:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
.pm-account-browser-clear{display:grid!important;place-items:center;flex:0 0 24px;width:24px!important;height:24px!important;min-height:0!important;margin:0!important;padding:0!important;border:0!important;border-radius:50%!important;background:transparent!important;color:color-mix(in srgb,currentColor 58%,transparent);font-size:17px!important;font-weight:400!important;line-height:1!important}
.pm-account-browser-clear:hover{background:color-mix(in srgb,currentColor 7%,var(--background))!important;color:inherit}
.pm-account-browser-action{display:inline-flex;flex:0 0 auto;align-items:center;gap:2px;padding:0 3px;color:color-mix(in srgb,currentColor 58%,transparent);font-size:11px;font-weight:600;line-height:1;white-space:nowrap}
.pm-account-browser-action svg{display:block;width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
.pm-account-browser-create{display:grid!important;place-items:center;flex:0 0 34px;width:34px;height:30px;margin:2px!important;padding:0!important;border:0!important;border-left:1px solid color-mix(in srgb,currentColor 14%,transparent)!important;border-radius:0 6px 6px 0!important;background:transparent!important;color:inherit;font-size:23px!important;font-weight:450!important;line-height:1}
.pm-account-browser-create:hover:not(:disabled){background:color-mix(in srgb,currentColor 7%,var(--background))!important}
.pm-account-browser-menu{box-sizing:border-box;min-width:0;max-width:min(360px,calc(100vw - 24px));max-height:min(420px,calc(100dvh - 24px));margin:0;padding:0;border-color:color-mix(in srgb,currentColor 15%,transparent);border-radius:12px;background:var(--background);color:inherit;box-shadow:0 18px 46px -18px #0f172a40;overflow:hidden}
.pm-account-browser-menu .pm-account-browser-search{position:relative;display:block;flex:0 0 auto;margin:0;padding:12px;border:0;border-bottom:1px solid color-mix(in srgb,currentColor 8%,transparent);background:color-mix(in srgb,currentColor 2%,var(--background))}
.pm-account-browser-search-control{position:relative;display:block;min-width:0}
.pm-account-browser-search-control>svg{position:absolute;z-index:1;top:50%;left:12px;width:14px;height:14px;transform:translateY(-50%);fill:none;stroke:color-mix(in srgb,currentColor 52%,transparent);stroke-width:2;stroke-linecap:round;stroke-linejoin:round;pointer-events:none}
.pm-account-browser-search-control>input.pm-account-browser-search-input[type=search]{display:block;width:100%;min-width:0;height:36px;margin:0;padding:0 10px 0 36px;border:1px solid color-mix(in srgb,currentColor 16%,transparent);border-radius:8px;background:var(--background);font-size:12px;line-height:1.4;box-shadow:none;outline:0}
.pm-account-browser-search-control>input[type=search]:focus{border-color:color-mix(in srgb,#2563eb 55%,transparent);box-shadow:0 0 0 2px color-mix(in srgb,#2563eb 12%,transparent)}
.pm-account-browser-search-control>input[type=search]::-webkit-search-cancel-button{display:none}
.pm-account-browser-root-toolbar{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:7px 12px;border-bottom:1px solid color-mix(in srgb,currentColor 7%,transparent);background:color-mix(in srgb,currentColor 1.5%,var(--background));font-size:10px;color:color-mix(in srgb,currentColor 58%,transparent)}
.pm-account-browser-root-toolbar>button{padding:3px 7px!important;border-color:color-mix(in srgb,currentColor 13%,transparent)!important;border-radius:999px!important;background:var(--background)!important;font-size:10px!important;font-weight:550}
.pm-account-browser-root-view{display:flex;flex:1 1 auto;flex-direction:column;min-height:0;overflow:hidden}
.pm-account-browser-roots{display:flex;flex:1 1 auto;flex-direction:column;gap:1px;min-height:0;padding:6px;overflow:auto;overscroll-behavior:contain;scrollbar-gutter:stable}
.pm-account-browser-root-row{--pm-account-root-color:#64748b;position:relative;display:flex;align-items:center;min-width:0;min-height:40px;border-radius:9px;transition:background .12s ease}
.pm-account-browser-root-row:hover{background:color-mix(in srgb,currentColor 4%,var(--background))}
.pm-account-browser-root-row>button:first-child{position:relative;display:flex;flex:1 1 auto;align-items:center;gap:8px;min-width:0;padding:7px 30px 7px 7px!important;border:0!important;border-radius:9px!important;background:transparent!important;text-align:left}
.pm-account-browser-root-row>button:first-child:hover{background:transparent!important}
.pm-account-browser-root-row>button:first-child>.pm-account-browser-enter-chevron{position:absolute;right:8px}
.pm-account-browser-root-row>button,.pm-account-browser-expand-zone,.pm-account-browser-enter-zone,.pm-account-browser-pick{cursor:pointer}
.pm-account-browser-root-row>button:disabled,.pm-account-browser-enter-zone:disabled,.pm-account-browser-pick:disabled{cursor:not-allowed}
.pm-account-browser-root-dot{position:relative;flex:0 0 18px;width:18px;height:18px;border-radius:6px;background:color-mix(in srgb,var(--pm-account-root-color) 12%,transparent)}
.pm-account-browser-root-dot:after{content:"";position:absolute;inset:6px;border-radius:50%;background:var(--pm-account-root-color)}
.pm-account-browser-root-row strong{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px;font-weight:600;letter-spacing:-.01em;color:var(--foreground)}
.pm-account-browser-root-row small{flex:0 0 auto;min-width:20px;padding:2px 6px;border:1px solid color-mix(in srgb,currentColor 8%,transparent);border-radius:999px;background:color-mix(in srgb,currentColor 3%,var(--background));color:color-mix(in srgb,currentColor 55%,transparent);font-size:9px;font-weight:550;line-height:1.4;text-align:center}
.pm-account-browser-breadcrumb-create svg,.pm-account-browser-child-icon svg,.pm-account-browser-footer-create svg{display:block;width:13px;height:13px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
.pm-account-browser-pathbar{display:flex;align-items:center;gap:8px;min-width:0;padding:9px 12px;border-bottom:1px solid color-mix(in srgb,currentColor 8%,transparent);background:color-mix(in srgb,currentColor 1.5%,var(--background))}
.pm-account-browser-breadcrumb{display:flex;align-items:center;gap:2px;flex:1 1 auto;min-width:0;padding:0;overflow-x:auto;scrollbar-width:thin}
.pm-account-browser-breadcrumb>button{flex:0 0 auto;padding:4px 7px;border-color:transparent;background:transparent;color:inherit;font-size:12px;font-weight:600;white-space:nowrap}
.pm-account-browser-breadcrumb>button:hover{background:color-mix(in srgb,currentColor 4%,var(--background))}
.pm-account-browser-breadcrumb>button[aria-current=page]{font-weight:650}
.pm-account-browser-breadcrumb>span{flex:0 0 auto;opacity:.4;font-size:12px}
.pm-account-browser-search-summary{display:flex;align-items:baseline;justify-content:space-between;gap:12px;padding:8px 13px;border-bottom:1px solid color-mix(in srgb,currentColor 7%,transparent);background:color-mix(in srgb,currentColor 1.5%,var(--background));font-size:10px}
.pm-account-browser-search-summary>span{opacity:.65}
.pm-account-browser-search-summary>strong{font-size:11px;font-weight:550}
.pm-account-browser-expand-controls{display:flex;flex:0 0 auto;align-items:center;gap:5px}
.pm-account-browser-expand-label{font-size:11px;opacity:.65;white-space:nowrap}
.pm-account-browser-expand-switch{position:relative;flex:0 0 32px;width:32px!important;height:18px!important;min-height:18px;margin:0!important;padding:0!important;border:0!important;border-radius:999px!important;background:color-mix(in srgb,currentColor 19%,var(--background))!important}
.pm-account-browser-expand-switch>span{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;background:var(--background);box-shadow:0 1px 2px #0002;transition:transform .16s ease}
.pm-account-browser-expand-switch[aria-checked=true]{background:#16803c!important}
.pm-account-browser-expand-switch[aria-checked=true]>span{transform:translateX(14px)}
.pm-account-browser-expand-divider{width:1px;height:15px;background:color-mix(in srgb,currentColor 15%,transparent)}
.pm-account-browser-expand-modes{display:flex;align-items:center;gap:2px;padding:2px;border:1px solid color-mix(in srgb,currentColor 13%,transparent);border-radius:7px;background:color-mix(in srgb,currentColor 2%,var(--background))}
.pm-account-browser-expand-modes>button{min-width:38px;padding:2px 7px!important;border:0!important;border-radius:5px!important;background:transparent!important;font-size:10px!important;line-height:1.5}
.pm-account-browser-expand-modes>button[aria-pressed=true]{background:color-mix(in srgb,currentColor 8%,var(--background))!important;font-weight:650}
.pm-account-browser-options{display:flex;flex:1 1 auto;flex-direction:column;gap:1px;min-width:0;min-height:80px;max-height:300px;padding:5px 6px 7px;overflow:auto;overscroll-behavior:contain}
.pm-account-browser-row{position:relative;display:flex;align-items:center;gap:2px;min-width:0;min-height:40px;padding-left:calc(var(--pm-account-depth,0)*15px);border:0;border-radius:8px;background:transparent;transition:background .12s ease}
.pm-account-browser-row.has-children{cursor:pointer}
.pm-account-browser-row.is-search-result{padding-left:0;text-align:left}
.pm-account-browser-row:hover{background:color-mix(in srgb,currentColor 4%,var(--background))}
.pm-account-browser-row.is-active:not(.is-selected){border-radius:8px;background:color-mix(in srgb,currentColor 6%,var(--background))}
.pm-account-browser-row.is-selected{border-radius:8px;background:color-mix(in srgb,var(--pm-account-row-color,#2563eb) 7%,var(--background))}
.pm-account-browser-row.is-located:not(.is-selected){border-radius:8px;background:color-mix(in srgb,var(--pm-account-row-color,#2563eb) 4%,var(--background))}
.pm-account-browser-row.is-located:not(.is-selected) b{color:var(--pm-account-row-color,#2563eb)}
.pm-account-browser-selection-marker{flex:0 0 2px;width:2px;height:18px;margin-left:3px;border-radius:999px;background:var(--pm-account-row-color,#2563eb);visibility:hidden}
.pm-account-browser-row.is-selected .pm-account-browser-selection-marker{visibility:visible}
.pm-account-browser-row.is-selected:hover{background:color-mix(in srgb,var(--pm-account-row-color,#2563eb) 8%,var(--background))}
.pm-account-browser-row.is-selected .pm-account-browser-expand-zone b,.pm-account-browser-row.is-selected .pm-account-browser-enter-zone b{font-weight:650}
.pm-account-browser-expand-zone,.pm-account-browser-enter-zone{display:flex;align-items:center;min-width:0;padding:5px!important;border:0!important;border-radius:7px!important;background:transparent!important}
.pm-account-browser-expand-zone{flex:0 1 auto;justify-content:flex-start;gap:6px;text-align:left;cursor:pointer}
.pm-account-browser-expand-zone:hover{background:transparent!important}
.pm-account-browser-zone-label{display:flex;flex-direction:row;align-items:center;gap:6px;min-width:0}
.pm-account-browser-zone-label>b{flex:0 1 auto;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12.5px;font-weight:500}
.pm-account-browser-expand-zone small{flex:0 0 auto;padding:1px 5px;border-radius:999px;background:color-mix(in srgb,currentColor 5%,var(--background));color:color-mix(in srgb,currentColor 55%,transparent);font-size:9px;font-weight:500;line-height:1.5}
.pm-account-browser-chevron,.pm-account-browser-enter-chevron,.pm-account-browser-check{display:block;flex:0 0 auto;width:14px;height:14px;fill:none;stroke:color-mix(in srgb,currentColor 50%,transparent);stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
.pm-account-browser-chevron{transition:transform .16s ease}
.pm-account-browser-chevron.is-open{transform:rotate(90deg)}
.pm-account-browser-enter-zone{flex:1 1 auto;width:auto;height:34px;justify-content:flex-end;padding:5px 7px!important;color:color-mix(in srgb,currentColor 48%,transparent);font-size:10px!important;text-align:right;cursor:pointer}
.pm-account-browser-enter-zone:hover{background:transparent!important;color:inherit}
.pm-account-browser-enter-zone.is-leaf-option{height:auto;min-height:34px;justify-content:flex-start;gap:7px;padding:6px!important;color:inherit;font-size:12px!important;text-align:left}
.pm-account-browser-enter-zone.is-leaf-option>span:first-child{display:flex;flex:1 1 auto;align-items:baseline;gap:6px;min-width:0;padding-left:12px}
.pm-account-browser-enter-zone.is-leaf-option>span:first-child b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12.5px;font-weight:500}
.pm-account-browser-check{stroke:color-mix(in srgb,currentColor 48%,transparent)}
.pm-account-browser-enter-zone.is-leaf-option>.pm-account-browser-check{margin-right:4px;margin-left:auto}
.pm-account-browser-enter-zone.is-search-result{flex:1 1 auto;width:auto;height:auto;min-height:34px;justify-content:flex-start;gap:8px;padding:7px!important;color:inherit;font-size:12px!important;text-align:left}
.pm-account-browser-search-main{display:flex;flex:1 1 auto;align-items:center;gap:8px;min-width:0}
.pm-account-browser-search-main b{flex:0 1 auto;font-size:12px;font-weight:600}
.pm-account-browser-search-main small{flex:0 0 auto;padding:1px 5px;border-radius:999px;background:color-mix(in srgb,currentColor 5%,var(--background));font-size:10px;font-weight:500;line-height:1.4;opacity:.62}
.pm-account-browser-search-action{display:grid;place-items:center;flex:0 0 18px;width:18px;color:color-mix(in srgb,currentColor 48%,transparent);line-height:1;white-space:nowrap}
.pm-account-browser-search-action svg{display:block;width:13px;height:13px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
.pm-account-browser-row.is-selected .pm-account-browser-expand-zone:hover,.pm-account-browser-row.is-selected .pm-account-browser-enter-zone:hover{background:transparent!important}
.pm-account-browser-row.is-search-result.is-selected .pm-account-browser-search-action{color:var(--pm-account-row-color,#2563eb)}
.pm-account-browser-row.is-search-result.is-active .pm-account-browser-search-action{color:inherit}
.pm-account-browser-pick{display:grid;place-items:center;align-self:center;width:26px!important;height:26px!important;min-height:0!important;margin:0 1px!important;padding:0!important;border:0!important;border-radius:6px!important;background:transparent!important;line-height:1;white-space:nowrap}
.pm-account-browser-row.has-children.can-pick>.pm-account-browser-pick{position:absolute;z-index:2;top:50%;right:23px;transform:translateY(-50%)}
.pm-account-browser-pick:hover{border-color:color-mix(in srgb,currentColor 12%,transparent)!important;background:color-mix(in srgb,currentColor 4%,var(--background))!important}
.pm-account-browser-child-form{display:flex;flex:0 0 auto;flex-direction:column;margin:3px 0 7px;padding:0;border:1px solid color-mix(in srgb,currentColor 12%,transparent);border-radius:10px;background:var(--background);box-shadow:none;overflow:hidden}
.pm-account-browser-child-heading{display:flex;align-items:center;gap:9px;padding:9px 11px;border-bottom:1px solid color-mix(in srgb,currentColor 8%,transparent);background:color-mix(in srgb,currentColor 2%,var(--background))}
.pm-account-browser-child-icon{display:grid;place-items:center;flex:0 0 26px;width:26px;height:26px;border-radius:7px;background:color-mix(in srgb,#2563eb 9%,var(--background));color:#2563eb}
.pm-account-browser-child-heading>span:last-child{display:flex;flex-direction:column;gap:1px;min-width:0}
.pm-account-browser-child-heading strong{font-size:11px;font-weight:650;line-height:1.4}
.pm-account-browser-child-heading small{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:color-mix(in srgb,currentColor 58%,transparent);font-size:10px;line-height:1.4}
.pm-account-browser-child-heading code{padding:0;background:transparent;color:color-mix(in srgb,currentColor 78%,transparent);font-size:10px}
.pm-account-browser-child-fields{display:grid;grid-template-columns:minmax(0,1fr) 112px;gap:8px;padding:10px 11px 8px}
.pm-account-browser-child-fields>label{display:flex;flex-direction:column;gap:4px;min-width:0;color:color-mix(in srgb,currentColor 60%,transparent);font-size:10px;font-weight:550}
.pm-account-browser-child-fields input{width:100%;min-width:0;height:32px;margin:0;padding:0 8px;border:1px solid color-mix(in srgb,currentColor 15%,transparent);border-radius:7px;background:var(--background);color:var(--foreground);font-size:11px;box-shadow:none;outline:0}
.pm-account-browser-child-fields input:focus{border-color:color-mix(in srgb,#2563eb 55%,transparent);box-shadow:0 0 0 2px color-mix(in srgb,#2563eb 11%,transparent)}
.pm-account-browser-child-preview{display:flex;flex-wrap:wrap;gap:5px;min-width:0;margin:0!important;padding:0 11px 8px;color:color-mix(in srgb,currentColor 52%,transparent);font-size:10px}
.pm-account-browser-child-preview>code{min-width:0;padding:0;background:transparent;color:color-mix(in srgb,currentColor 78%,transparent);font-size:10px;overflow-wrap:anywhere}
.pm-account-browser-child-form>.pm-field-error{margin:0;padding:0 11px 8px}
.pm-account-browser-child-actions{display:flex;flex-wrap:wrap;align-items:center;justify-content:flex-end;gap:6px;padding:8px 11px 10px;border-top:1px solid color-mix(in srgb,currentColor 7%,transparent);background:color-mix(in srgb,currentColor 1.5%,var(--background))}
.pm-account-browser-child-actions>span{margin-right:auto;font-size:11px;color:#b45309}
.pm-account-browser-child-actions>button{height:28px;padding:0 10px;border-radius:6px;font-size:10px;font-weight:550}
.pm-account-browser-child-actions>.pm-account-browser-current{border-color:#2563eb;background:#2563eb;color:#fff;font-weight:600}
.pm-account-browser-child-actions>.pm-account-browser-current:disabled{border-color:color-mix(in srgb,currentColor 14%,transparent);background:color-mix(in srgb,currentColor 7%,var(--background));color:color-mix(in srgb,currentColor 48%,var(--background));opacity:1}
.pm-account-browser-empty{margin:0;padding:16px 8px;text-align:center;font-size:12px;opacity:.55}
.pm-account-browser-footer{display:flex;flex-wrap:wrap;align-items:center;justify-content:flex-end;gap:6px;flex:0 0 auto;padding:9px 12px;margin:0;border-top:1px solid color-mix(in srgb,currentColor 8%,transparent);background:color-mix(in srgb,currentColor 1.5%,var(--background))}
.pm-account-browser-footer>span{flex:1 1 150px;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px;opacity:.62}
.pm-account-browser-footer>button{height:28px;padding:0 9px;border-radius:6px;font-size:10px;font-weight:550}
.pm-account-browser-footer>.pm-account-browser-footer-create{display:inline-flex;align-items:center;gap:5px;border-color:color-mix(in srgb,currentColor 14%,transparent);background:var(--background);color:var(--foreground)}
.pm-account-browser-footer-create:hover{background:color-mix(in srgb,currentColor 5%,var(--background))}
.pm-account-browser-footer>.pm-account-browser-current{border-color:#2563eb;background:#2563eb;color:#fff;font-weight:600}
.pm-account-browser-footer>.pm-account-browser-current:disabled{border-color:color-mix(in srgb,currentColor 14%,transparent);background:color-mix(in srgb,currentColor 7%,var(--background));color:color-mix(in srgb,currentColor 48%,var(--background));opacity:1}
.pm-field-error{margin:6px 0;color:#b91c1c;font-size:12px}
@media(max-width:600px){.pm-search-select-menu{position:fixed;top:auto;bottom:12px;left:12px;width:calc(100vw - 24px);max-width:none;max-height:72vh}.pm-account-browser-menu{max-height:72vh}.pm-account-browser-pathbar{flex-wrap:wrap}.pm-account-browser-expand-controls{width:100%;justify-content:flex-end}.pm-account-browser-child-fields{grid-template-columns:1fr}.pm-account-browser-footer>span{flex-basis:100%}}
`;
