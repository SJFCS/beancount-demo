export const styles = `
.ve-page{width:100%;max-width:1180px;margin:0 auto;padding:22px;color:var(--foreground,#20231f);font:inherit;--ve-line:var(--border,#ddd);--ve-card:var(--card,#fff);--ve-subtle:var(--muted,#f4f4f1);--ve-muted:var(--muted-foreground,#777);--ve-green:var(--gain,#327b45);--ve-red:var(--loss,var(--destructive,#c54));--ve-blue:var(--chart-7,#5e86c4);display:flex;flex-direction:column;gap:16px}
.ve-page *{box-sizing:border-box}
.ve-header{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap}
.ve-title h1{margin:0;font-size:26px;line-height:1.2;letter-spacing:-.02em}
.ve-title p{margin:6px 0 0;color:var(--ve-muted);font-size:13px;line-height:1.5}
.ve-actions{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.ve-button{height:36px;padding:0 13px;border:1px solid var(--ve-line);border-radius:9px;background:var(--ve-card);color:inherit;font:inherit;font-size:13px;cursor:pointer;white-space:nowrap}
.ve-button:hover:not(:disabled):not(.primary){background:var(--ve-subtle)}
.ve-button.primary{background:var(--primary,#2b7e00);border-color:transparent;color:#fff}
.ve-button.danger{color:var(--ve-red)}
.ve-button.small{height:30px;padding:0 9px;font-size:12px}
.ve-button:disabled{opacity:.5;cursor:not-allowed}
.ve-alert{padding:11px 13px;border-radius:10px;font-size:13px;line-height:1.5;white-space:pre-wrap}
.ve-alert.error{background:color-mix(in srgb,var(--ve-red) 10%,var(--ve-card));color:var(--ve-red);border:1px solid color-mix(in srgb,var(--ve-red) 24%,var(--ve-line))}
.ve-alert.notice{background:color-mix(in srgb,var(--ve-green) 10%,var(--ve-card));color:var(--ve-green);border:1px solid color-mix(in srgb,var(--ve-green) 22%,var(--ve-line))}
.ve-tabs{display:flex;gap:4px;padding:4px;border:1px solid var(--ve-line);border-radius:11px;background:var(--ve-subtle);width:max-content;max-width:100%}
.ve-tab{height:32px;padding:0 14px;border:0;border-radius:8px;background:transparent;color:var(--ve-muted);font:inherit;font-size:12px;cursor:pointer}
.ve-tab.is-active{background:var(--ve-card);color:inherit;box-shadow:0 1px 2px #0001;font-weight:600}
.ve-tab-badge{margin-left:5px;padding:1px 5px;border-radius:999px;background:color-mix(in srgb,var(--ve-red) 15%,var(--ve-card));color:var(--ve-red);font-size:10px}
.ve-summary{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px}
.ve-summary-card{padding:15px;border:1px solid var(--ve-line);border-radius:13px;background:var(--ve-card)}
.ve-summary-card span{display:block;color:var(--ve-muted);font-size:11px;letter-spacing:.04em;text-transform:uppercase}
.ve-summary-card strong{display:block;margin-top:7px;font-size:22px;line-height:1.15;font-variant-numeric:tabular-nums}
.ve-summary-card small{display:block;margin-top:5px;color:var(--ve-muted);font-size:11px}
.ve-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:10px}
.ve-stat{padding:11px 13px;border:1px solid var(--ve-line);border-radius:11px;background:var(--ve-card)}
.ve-stat span{display:block;color:var(--ve-muted);font-size:11px}
.ve-stat strong{display:block;margin-top:4px;font-size:18px;font-variant-numeric:tabular-nums}
.ve-section{display:flex;flex-direction:column;gap:10px}
.ve-section-head{display:flex;justify-content:space-between;align-items:baseline;gap:12px}
.ve-section-head h2{margin:0;font-size:16px}
.ve-section-head small{color:var(--ve-muted);font-size:12px}
.ve-account{border:1px solid var(--ve-line);border-radius:14px;background:var(--ve-card);overflow:hidden}
.ve-account-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;padding:15px 16px;border-bottom:1px solid var(--ve-line)}
.ve-account-name{font-size:15px;font-weight:700;overflow-wrap:anywhere}
.ve-account-sub{margin-top:4px;color:var(--ve-muted);font:11px ui-monospace,SFMono-Regular,Menlo,monospace}
.ve-badges{display:flex;gap:5px;flex-wrap:wrap;justify-content:flex-end}
.ve-badge{padding:3px 7px;border-radius:999px;background:color-mix(in srgb,var(--ve-blue) 12%,var(--ve-card));color:var(--ve-blue);font-size:10px;white-space:nowrap}
.ve-badge.is-muted{background:var(--ve-subtle);color:var(--ve-muted)}
.ve-facts{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:0;border-bottom:1px solid var(--ve-line)}
.ve-fact{padding:12px 16px;border-right:1px solid var(--ve-line);border-bottom:1px solid var(--ve-line);min-width:0}
.ve-fact:nth-child(even){border-right:0}
.ve-fact span{display:block;color:var(--ve-muted);font-size:11px}
.ve-fact strong{display:block;margin-top:5px;font-size:15px;font-variant-numeric:tabular-nums;overflow-wrap:anywhere}
.ve-fact small{display:block;margin-top:4px;color:var(--ve-muted);font-size:10px;overflow-wrap:anywhere}
.ve-pnl.is-positive{color:var(--ve-green)}
.ve-pnl.is-negative{color:var(--ve-red)}
.ve-inline-warning{margin:12px 16px 0;padding:9px 11px;border-radius:9px;background:color-mix(in srgb,var(--chart-3,#b88425) 12%,var(--ve-card));color:var(--chart-3,#b88425);font-size:12px;line-height:1.5}
.ve-samples{padding:13px 16px 16px}
.ve-section-label{margin-bottom:7px;color:var(--ve-muted);font-size:11px;letter-spacing:.04em;text-transform:uppercase}
.ve-table-wrap{overflow:auto;border:1px solid var(--ve-line);border-radius:9px}
.ve-table-wrap table{width:100%;border-collapse:collapse;font-size:12px}
.ve-table-wrap th,.ve-table-wrap td{padding:8px 10px;border-bottom:1px solid var(--ve-line);text-align:right;white-space:nowrap}
.ve-table-wrap th:first-child,.ve-table-wrap td:first-child{text-align:left}
.ve-table-wrap th{background:var(--ve-subtle);font-size:10px;color:var(--ve-muted);font-weight:600}
.ve-table-wrap tr:last-child td{border-bottom:0}
.ve-conversion{display:block;margin-top:2px;color:var(--ve-muted);font-size:10px}
.ve-empty-line{padding:14px 16px;color:var(--ve-muted);font-size:12px;line-height:1.6}
.ve-empty{padding:28px 18px;border:1px dashed var(--ve-line);border-radius:13px;background:var(--ve-subtle);color:var(--ve-muted);font-size:13px;line-height:1.7}
.ve-empty code,.ve-empty-line code{font:11px ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--foreground,#20231f)}
.ve-errors{display:flex;flex-direction:column;gap:6px}
.ve-error{border:1px solid color-mix(in srgb,var(--ve-red) 22%,var(--ve-line));background:color-mix(in srgb,var(--ve-red) 7%,var(--ve-card));border-radius:9px;padding:9px 11px;font-size:12px;line-height:1.5}
.ve-error small{display:block;margin-top:3px;color:var(--ve-muted)}
.ve-config{border:1px solid var(--ve-line);border-radius:14px;background:var(--ve-card);overflow:hidden}
.ve-config-head{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:13px 16px;border-bottom:1px solid var(--ve-line);flex-wrap:wrap}
.ve-config-head h2{margin:0;font-size:16px}
.ve-config-head p{margin:4px 0 0;color:var(--ve-muted);font-size:12px;line-height:1.5}
.ve-config-head code{font:11px ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--ve-muted)}
.ve-config-body{display:flex;flex-direction:column;gap:18px;padding:16px}
.ve-form-section{display:flex;flex-direction:column;gap:10px}
.ve-form-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap}
.ve-form-head h3{margin:0;font-size:14px}
.ve-form-head p{margin:4px 0 0;color:var(--ve-muted);font-size:12px;line-height:1.5}
.ve-form-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px}
.ve-field{display:flex;flex-direction:column;gap:5px;min-width:0}
.ve-field.is-wide{grid-column:1/-1}
.ve-field-label{color:var(--ve-muted);font-size:11px}
.ve-field input,.ve-field select{width:100%;height:34px;padding:0 9px;border:1px solid var(--ve-line);border-radius:8px;background:var(--ve-card);color:inherit;font:inherit;font-size:12px}
.ve-field input:focus,.ve-field select:focus{outline:2px solid color-mix(in srgb,var(--ve-blue) 25%,transparent);outline-offset:0;border-color:var(--ve-blue)}
.ve-field-hint{color:var(--ve-muted);font-size:10px;line-height:1.45}
.ve-field-error{color:var(--ve-red);font-size:10px;line-height:1.45}
.ve-card-row{border:1px solid var(--ve-line);border-radius:11px;padding:11px;background:color-mix(in srgb,var(--ve-subtle) 55%,var(--ve-card))}
.ve-card-row-head{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:9px}
.ve-card-row-head strong{font-size:12px}
.ve-card-row-head small{color:var(--ve-muted);font-size:11px}
.ve-account-row{display:grid;grid-template-columns:minmax(190px,1.5fr) repeat(3,minmax(120px,.8fr));gap:8px;align-items:end}
.ve-inline{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.ve-check{display:inline-flex;gap:7px;align-items:center;font-size:12px;color:var(--ve-muted);cursor:pointer;user-select:none}
.ve-check input{width:15px;height:15px;accent-color:var(--primary,#2b7e00)}
.ve-config-foot{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:11px 16px;border-top:1px solid var(--ve-line);flex-wrap:wrap}
.ve-muted{color:var(--ve-muted);font-size:11px}
.ve-advanced{border-top:1px solid var(--ve-line);padding:0 16px 14px;margin-top:2px}
.ve-advanced summary{padding:12px 0;color:var(--ve-muted);font-size:12px;cursor:pointer}
.ve-advanced pre{margin:0;padding:12px;border:1px solid var(--ve-line);border-radius:9px;background:var(--ve-subtle);color:inherit;font:11px/1.6 ui-monospace,SFMono-Regular,Menlo,monospace;overflow:auto;max-height:360px}
@media (max-width:860px){.ve-account-row{grid-template-columns:1fr 1fr}.ve-account-row .ve-field:first-child{grid-column:1/-1}}
@media (max-width:620px){.ve-page{padding:14px}.ve-title h1{font-size:22px}.ve-facts{grid-template-columns:1fr 1fr}.ve-fact:nth-child(even){border-right:0}.ve-fact:nth-child(odd){border-right:1px solid var(--ve-line)}.ve-account-row{grid-template-columns:1fr}}
`;
