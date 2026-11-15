# Local plugins

## Editor setup

Install dependencies in both `ledger` and `dashboard` with `yarn install`, then
open the repository root in VSCode. Run `TypeScript: Select TypeScript Version`
and choose `Use Workspace Version` using `ledger/node_modules/typescript/lib`
(TypeScript 6). If needed, set `typescript.tsdk` to that relative path in the
workspace settings. Run `TypeScript: Restart TS Server` after changing settings.

The plugins' `tsconfig.json` discovers separate frontend and backend projects.
Frontend files use React declarations from `dashboard/node_modules`; backend
files use Node and BigNumber declarations from `ledger/node_modules` and map
`@beancount/plugin` to `ledger/src/local/plugin-api.ts`. These mappings support
completion and Go to Definition without installing dependencies in each plugin.

From the repository root, check both projects with:

```sh
node ledger/node_modules/typescript/bin/tsc -p beancount/private/plugins/tsconfig.frontend.json
node ledger/node_modules/typescript/bin/tsc -p beancount/private/plugins/tsconfig.backend.json
```

The dashboard discovers pages from the selected ledger repository:

```text
plugins/<plugin-id>/
├── manifest.json
├── frontend.tsx
└── backend.ts
```

Declare the page in `manifest.json`:

```json
{
  "id": "example",
  "name": "Example plugin",
  "frontend": "frontend.tsx",
  "backend": "backend.ts"
}
```

The ID must match the directory name. The frontend exports a default React
component and can import React from `react`. Keep its code in the plugin
directory; no dashboard registry or plugin-specific route is required.
Both frontend and backend entries are optional. Entries can import relative
TypeScript and TSX modules within the plugin directory, including subdirectories.
The host loads the module graph and bundles frontend modules for the browser.
Frontend entries may also import reusable modules through the fixed
`@plugins/shared/` namespace, which maps to `plugins/shared/`. No other absolute
or package imports are available to frontend modules. Imports cannot otherwise
escape the plugin directory or use symlinked files or directories.

Recovery or control plugins that must remain reachable while disabled can set
`"alwaysAccessible": true`. This bypasses only the enabled gate for loading the
plugin's own frontend/backend modules and API. Disabled plugins still do not run
`initialize` or `tick`, and they are not added to navigation. An
always-accessible plugin also keeps its catalog entry available when the YAML
configuration cannot be parsed, so a control page can recover the raw file.

See `shared/README.md` for the reusable account browser and its styling API.

Enable the plugin and configure its settings in `benacount-local.yaml`:

```yaml
plugins:
  example:
    enabled: true
    setting: value

navigation:
  routes:
    example:
      group: plugins
      position: last
      quick_menu: true
```

`quick_menu` controls whether the plugin also appears as a first-level entry in
the header "+" menu. It defaults to `false`; `group` and `position` still
control the full ledger sidebar independently.

The host passes `ledgerId`, `pluginId`, `primaryCurrency`, `canWrite`,
`settings`, and `api`. Settings come directly from `plugins.<plugin-id>`.
`api.graphql(query, variables)` sends authenticated GraphQL requests;
`api.fetchLocal(path, init)` calls authenticated `/api-gateway/local/...` APIs.

## Backend modules

The local server loads the enabled ledger's `backend.ts` from its manifest.
Backend code is local Node.js code running in the ledger service process; only
enable backends from ledger repositories you trust. The import allowlist is an
API boundary, not a security sandbox.

The host provides `@beancount/plugin` with repository types and shared helpers:
`readLocalPluginConfig`, `parseLedgerFiles`, `collectSourceFiles`,
`splitIntoBlocks`, `validateManagedPriceText`, `readStatementTable`, and `logger`. Supported runtime
imports are `@beancount/plugin`, `node:crypto`, `node:path`, and `bignumber.js`.
Network access uses Node's `fetch`. Backend business logic can be split into
relative modules imported by `backend.ts`.

```typescript
import type { LocalPluginBackend } from "@beancount/plugin";

const backend: LocalPluginBackend = {
  async handle({ repository, ledgerId, method, action, body, settings }) {
    return { method, action, value: body.value ?? settings.value };
  },
  async initialize({ repository, ledgerId }) {
    await repository.listFiles(ledgerId);
  },
  async tick({ repository, ledgerId, now }) {
    return;
  },
};
export default backend;
```

Authenticated `GET` and `POST` calls go to
`/api-gateway/local/plugins/<plugin-id>/api` or `/api/<action>` beneath that
plugin URL. Supply `ledgerId` in the query for GET or JSON body for POST.
The host checks authentication, ledger selection, plugin enablement and safe
entry paths before dispatching. Each call receives the selected ledger's
repository and settings, and runs inside that ledger's shared write queue.
Use repository methods for files, revision checks and existing Git behavior.

The server calls `initialize` before accepting requests, then `tick` once per
minute, including a check on startup. Disabled plugins have no hooks. They also
have no backend calls unless their manifest declares `alwaysAccessible`.
Modules are read again on every call; editing or copying a plugin does not
require a plugin-specific host registration. The host prevents overlapping
scheduler passes and isolates plugin hook failures.

The ledger package's `yarn typecheck` also checks the bundled plugin backends
through `tsconfig.plugins.json` and the host's SDK type mapping.

Enabled pages with a `navigation.routes` entry appear in the sidebar and load at
`/ledger/$ledgerOwner/$ledgerName/plugins/<plugin-id>`. Sidebar groups are
`root`, `primary`, `reports`, `plugins`, `import`, and `footer`; `root` is an
alias for the outermost primary tree. `position` accepts `first`, `last`, or a
zero-based index. A page without a route remains available by URL but is not
added to the sidebar. `quick_menu` independently controls the header "+" menu.

The YAML reader supports nested mappings and scalar values. Use
comma-separated strings for simple lists. Discovery reads the selected
ledger repository each time; configuration and plugin code stay local.

See `beantab/README.md` for the reconciliation plugin.

See `payments/README.md` for WeChat / Alipay statement uploads, draft review,
manual duplicate selection, saved AI classification and separate Bean output.

See `prices/README.md` for automatic commodity prices, currency rates, source
selection, output paths, and daily scheduling.

See `ledger_canvas/README.md` for Ledger Canvas, the in-memory workspace for
transaction mapping, reusable presets, recurring queries, and inferred
subscription periods.

See `periodic/README.md` for metadata-driven amortization and depreciation
rules, schedule charts, and in-memory periodic entries.

See `valuation/README.md` for opaque fund valuation, virtual-price generation,
multi-currency conversion, and the in-memory valuation page.

See `portfolio_returns/README.md` for portfolio value, TWR, IRR, cash-flow,
dividend, drawdown, and volatility reports with configuration stored in
`plugins/portfolio_returns/config.json`.

See `life_calendar/README.md` for the one-cell-per-year life calendar and its
current-month view.

See `local_config/README.md` for graphical plugin registration management and
the root-level editor for `benacount-local.yaml`.
