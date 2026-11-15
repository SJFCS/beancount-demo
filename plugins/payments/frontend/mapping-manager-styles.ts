export const mappingManagerStyles = `
.payments-plugin .pm-saved-group[data-account-root]{border-top:3px solid var(--pm-account-color)}
.payments-plugin .pm-saved-group-heading>div>.pm-saved-account-kind{display:inline-flex;width:fit-content;margin-bottom:5px;padding:2px 6px;border-radius:4px;background:color-mix(in srgb,var(--pm-account-color) 9%,var(--background));color:var(--pm-account-color);font-size:10px;font-weight:650}
.payments-plugin .pm-account-category-tags{display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin:0 0 16px}
.payments-plugin .pm-account-category-tags>button{--pm-account-color:var(--pm-accent);display:inline-flex;align-items:center;gap:6px;min-height:30px;margin:0;padding:4px 10px;border:1px solid var(--pm-border);border-radius:999px;background:var(--background);color:color-mix(in srgb,var(--foreground) 65%,transparent);font-size:11px;white-space:nowrap}
.payments-plugin .pm-account-category-tags>button:hover:not(:disabled),.payments-plugin .pm-account-category-tags>button[aria-pressed=true]{border-color:color-mix(in srgb,var(--pm-account-color) 42%,var(--pm-border));background:color-mix(in srgb,var(--pm-account-color) 9%,var(--background));color:var(--pm-account-color)}
.payments-plugin .pm-account-category-tags>button:focus-visible{outline:2px solid var(--pm-account-color);outline-offset:2px}
.payments-plugin .pm-account-category-tags>button>span:last-child{font-size:10px;font-variant-numeric:tabular-nums;opacity:.7}
.payments-plugin .pm-account-category-tags .pm-category-tag-check{display:grid;place-items:center;width:12px;height:12px;border:1px solid color-mix(in srgb,var(--pm-account-color) 45%,var(--pm-border));border-radius:3px;color:var(--pm-account-color);font-size:10px;line-height:1}
.payments-plugin .pm-account-category-tags>button[aria-pressed=true] .pm-category-tag-check{border-color:var(--pm-account-color);background:var(--pm-account-color);color:var(--background)}
.payments-plugin .pm-account-category-tags>small{color:color-mix(in srgb,var(--foreground) 45%,transparent);font-size:10px}
.payments-plugin .pm-mapping-management-toolbar{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
.payments-plugin .pm-rule-type-legend{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.payments-plugin [data-rule-type=counterparty]{--pm-rule-color:#7c3aed}
.payments-plugin [data-rule-type=payment]{--pm-rule-color:#2563eb}
.payments-plugin [data-rule-type=content]{--pm-rule-color:#b45309}
.payments-plugin .pm-rule-type-legend>span,.payments-plugin .pm-rule-type-label{display:inline-flex;align-items:center;gap:5px;width:fit-content;color:var(--pm-rule-color);font-size:10px;font-weight:650}
.payments-plugin .pm-rule-type-legend>span:before{content:"";width:7px;height:7px;border-radius:50%;background:var(--pm-rule-color)}
.payments-plugin .pm-rule-order-note{margin:12px 0 15px;font-size:11px;line-height:1.7;color:color-mix(in srgb,currentColor 65%,transparent)}
.payments-plugin .pm-saved-rule-group>div{display:grid;gap:6px}
.payments-plugin .pm-saved-rule-chip.pm-managed-rule{display:grid;grid-template-columns:22px minmax(0,1fr) auto;gap:8px;align-items:center;width:100%;padding:9px 8px;border-color:color-mix(in srgb,var(--pm-rule-color) 23%,transparent);border-left:3px solid var(--pm-rule-color);border-radius:7px;background:color-mix(in srgb,var(--pm-rule-color) 4%,var(--background));font-size:12px}
.payments-plugin .pm-managed-rule .pm-rule-priority{display:flex;flex-direction:column;align-items:center;gap:2px;align-self:start;padding-top:1px;font-variant-numeric:tabular-nums;font-size:11px;color:color-mix(in srgb,currentColor 55%,transparent)}
.payments-plugin .pm-managed-rule-copy{display:grid;gap:4px;min-width:0}
.payments-plugin .pm-managed-rule-copy>strong{font-size:12px;font-weight:600;overflow-wrap:anywhere}
.payments-plugin .pm-managed-rule-copy>small{font-size:10px;line-height:1.5;white-space:normal;opacity:.7;overflow-wrap:anywhere}
.payments-plugin .pm-managed-rule-actions{display:flex;align-items:center;justify-content:flex-end;gap:3px;flex-wrap:wrap}
.payments-plugin .pm-managed-rule-actions>button{min-width:28px;min-height:28px;padding:3px 6px;font-size:10px;border-color:transparent;background:transparent}
.payments-plugin .pm-managed-rule-actions>button:focus-visible{outline:2px solid var(--pm-rule-color);outline-offset:2px}
.payments-plugin .pm-managed-rule-target{font-size:11px;line-height:1.5;color:color-mix(in srgb,currentColor 68%,transparent);overflow-wrap:anywhere}
.payments-plugin .pm-rule-priority-list{display:grid;gap:8px;max-width:100%;margin-top:10px}
.payments-plugin .pm-managed-rule.is-sortable{grid-template-columns:30px minmax(0,1fr) auto;cursor:grab;padding:12px}
.payments-plugin .pm-managed-rule.is-sortable .pm-rule-priority>span{font-size:17px;line-height:1}
.payments-plugin .pm-managed-rule.is-sortable.is-dragging{opacity:.45;cursor:grabbing}
.payments-plugin .pm-managed-rule.is-drop-target{outline:2px solid var(--pm-rule-color);outline-offset:2px}
@media(max-width:600px){.payments-plugin .pm-managed-rule.is-sortable{grid-template-columns:22px minmax(0,1fr)}.payments-plugin .pm-managed-rule.is-sortable .pm-managed-rule-actions{grid-column:2;justify-content:flex-start}.payments-plugin .pm-rule-type-legend{gap:10px}}
`;
