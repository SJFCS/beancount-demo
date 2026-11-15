# BeanTab plugin

The complete plugin lives here: `frontend.tsx`, `backend.ts`, and
`manifest.json`. Reconciliation and balance-file generation run in this
directory's backend through the host's generic authenticated API at
`/api-gateway/local/plugins/beantab/api`.

BeanTab is a spreadsheet-style reconciliation view for local ledgers. It
shows assertion history for every discovered account and currency, calculated
start-of-day balances, optional transaction-delta bars, and a transaction
inspector. Account filters and extra comparison dates can be added directly in
the page; view settings are kept in the URL so a view can be bookmarked.
Calculated balances are editable input values. Focusing a cell exposes its
full precision; changing it shows the exact difference from the ledger balance
until the edit is saved or reverted.
The write-type selector on each account/currency row overrides the type used by
new cells in that row; existing assertions keep their saved type.
All reconciliation dates are shown by default. Use the Dates dropdown to
uncheck or restore individual columns, or add a date using YYYY-MM-DD. Every
visible date column is editable. Dates with unsaved edits stay visible until
the edits are saved or reverted. The left account columns remain fixed when
the date columns overflow horizontally.
Saved cells also show their reconciliation difference, excluding the padding
generated for that assertion while retaining earlier reconciliations. History
uses dates inside directives; the page warns if a date-named source file contains
assertions dated differently.

Enter statement balances and choose the account that absorbs differences to
save. The page writes dated `balance` assertions and managed `pad` directives
into `balances/<date>.bean`, preserving existing source formatting and
comments. No index file is maintained; include the generated files with a glob
such as `include "balances/*"` in the ledger entry point.

The dashboard discovers this directory’s `manifest.json` and compiles
`frontend.tsx` when the page opens. The shared host supplies ledger context,
permissions, plugin settings, and authenticated API helpers. See
`../README.md` for the frontend contract.

Configure BeanTab in `benacount-local.yaml`:

```yaml
plugins:
  beantab:
    enabled: true
    entry_point: main.bean
    output_dir: balances
    filename: "{date}.bean"
    pad_account: Equity:BadDebts
    account_prefixes: Assets,Liabilities

navigation:
  routes:
    beantab:
      group: plugins
      position: last
      quick_menu: true
```

### JSON account defaults

BeanTab also reads optional defaults from `plugins/beantab/config.json`. This
file controls the initial account filters and the related account display
toggles; `benacount-local.yaml` still enables the plugin and owns output paths.

```json
{
  "version": 1,
  "accounts": ["Assets:Bank", "Liabilities:CreditCard:CMB-2035"],
  "account_prefixes": ["Assets:Investment", "Equity:Example"],
  "account_filters": ["^Expenses:(Food|Housing):"],
  "show_closed": false,
  "show_empty": false,
  "asserted_only": false,
  "group_accounts": true
}
```

- `accounts` matches exact account names.
- `account_prefixes` matches an account and its subaccounts.
- `account_filters` accepts regular expressions.
- All three selector arrays are combined with OR. When none are present,
  `plugins.beantab.account_prefixes` from `benacount-local.yaml` remains the
  fallback.
- `show_closed`, `show_empty` and `asserted_only` map to the corresponding
  account toggles. `group_accounts` controls multi-currency account row
  grouping.

An explicit URL view (`?bt=...`, including a bookmarked or previously edited
view) takes precedence over these defaults. Invalid JSON is reported in the
page and the YAML/page defaults remain active.

The account filter box filters rows as you type. Its expression is OR-ed with
the pinned filter chips. Press Enter to pin the expression as another filter
chip. The **Save defaults** toolbar button writes the current filters and
display toggles back to
`plugins/beantab/config.json`, creating the file when needed. Saving uses a
configuration revision check so an external edit is not silently overwritten.

Open BeanTab from the ledger sidebar at
`/ledger/$ledgerOwner/$ledgerName/plugins/beantab`. Editing requires write
permission; read-only users can still inspect history, calculated balances,
filters, and transaction details. Cell suffixes are `!` regular, `~` padded,
and `V` valuation. The difference-account picker
only lists accounts under `Equity:` and defaults to `Equity:BadDebts`. Empty
accounts are hidden by default.

`V` cells are written as `custom "valuation"` directives. Enable the
`valuation` plugin to turn those declarations into in-memory virtual-commodity
prices and unrealized P&L; BeanTab itself only records the declared value.
