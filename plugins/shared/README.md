# Shared plugin frontend

Enabled frontend plugins may import reusable browser code from the controlled
`@plugins/shared/` namespace:

```tsx
import {
  AccountBrowserSelect,
  type AccountBrowserSelectProps,
  type AccountCreateHandler,
  type AccountRootOption,
} from "@plugins/shared/frontend/account-browser-select";
import { accountBrowserStyles } from "@plugins/shared/frontend/account-browser-styles";
```

`AccountBrowserSelect` owns hierarchical browsing, all-level search, breadcrumb
navigation, smart/all expansion, selection, and the child-account creation form.
Search returns matching nodes from every level and shows each account's complete
path. Callers provide the available account values, selectable account values,
root labels and colors, and the creation callback. `onCreateAccount` is an
adapter for account persistence only. The component does not know what the
selected account will later be used for, so callers keep binding, category
rules, and transaction edits in their own modules and run them only after an
explicit save action. The component has no dependency on the payments plugin's
account types, persistence, or mapping logic.

Render `accountBrowserStyles` once in the plugin page, alongside the host's
existing form styles. The styles only use the component's `pm-*` class names.

Only files beneath this directory are included through the shared alias.
Relative imports inside a shared module must remain inside `shared/`; imports
from a plugin still cannot otherwise escape its own directory, and symlinks are
rejected.
