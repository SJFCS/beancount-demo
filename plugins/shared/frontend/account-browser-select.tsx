import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSearchMenu } from "./use-search-menu";

export type AccountBrowserOption = {
  value: string;
};

export type AccountRootOption = {
  value: string;
  label: string;
  color?: string;
};

export type AccountCreateHandler = (
  parent: string,
  leaf: string,
  date: string,
) => void | boolean | Promise<void | boolean>;

export type AccountBrowserSelectProps = {
  label: string;
  searchLabel: string;
  value: string;
  valueDisplay?: React.ReactNode;
  appearance?: "field" | "link";
  roots: readonly AccountRootOption[];
  relevantRoots?: readonly string[];
  options: readonly AccountBrowserOption[];
  selectableValues: readonly string[];
  placeholder?: string;
  allowEmpty?: boolean;
  disabled?: boolean;
  onChange(value: string): void;
  createDate?: string;
  onCreateAccount?: AccountCreateHandler;
};

type AccountTreeNode = {
  value: string;
  label: string;
  root: string;
  depth: number;
  children: AccountTreeNode[];
};

const accountSegment = /^[\p{Lu}\p{Lo}\p{Nd}][\p{L}\p{Nd}-]*$/u;
const accountSegmentStart = /^[\p{Lu}\p{Lo}\p{Nd}]/u;

function accountTree(
  options: readonly AccountBrowserOption[],
  roots: readonly AccountRootOption[],
) {
  const nodes = new Map<string, AccountTreeNode>();
  const rootOrder = new Map(
    roots.map((root, index) => [root.value, index] as const),
  );
  for (const root of roots) {
    nodes.set(root.value, {
      value: root.value,
      label: root.label,
      root: root.value,
      depth: 0,
      children: [],
    });
  }
  for (const option of options) {
    const parts = option.value.split(":");
    if (!rootOrder.has(parts[0])) continue;
    for (let length = 1; length <= parts.length; length++) {
      const value = parts.slice(0, length).join(":");
      if (nodes.has(value)) continue;
      const node: AccountTreeNode = {
        value,
        label: parts[length - 1],
        root: parts[0],
        depth: length - 1,
        children: [],
      };
      nodes.set(value, node);
      if (length > 1)
        nodes.get(parts.slice(0, length - 1).join(":"))?.children.push(node);
    }
  }
  for (const node of nodes.values())
    node.children.sort((a, b) => a.label.localeCompare(b.label));
  const result = [...nodes.values()];
  result.sort(
    (a, b) =>
      a.depth - b.depth ||
      (rootOrder.get(a.root) ?? roots.length) -
        (rootOrder.get(b.root) ?? roots.length) ||
      a.value.localeCompare(b.value),
  );
  return { nodes, result };
}

function parentPath(value: string) {
  const separator = value.lastIndexOf(":");
  return separator < 0 ? "" : value.slice(0, separator);
}

type ExpandStrategy = "all" | "smart";

function collectExpandableAccounts(
  nodes: readonly AccountTreeNode[],
): Set<string> {
  const accounts = new Set<string>();
  const visit = (node: AccountTreeNode) => {
    if (node.children.length) accounts.add(node.value);
    node.children.forEach(visit);
  };
  nodes.forEach(visit);
  return accounts;
}

function collectSmartExpandedAccounts(
  nodes: readonly AccountTreeNode[],
): Set<string> {
  const accounts = new Set<string>();
  let level = nodes;
  while (level.length === 1) {
    const node = level[0];
    if (node.children.length) accounts.add(node.value);
    level = node.children;
  }
  return accounts;
}

function initialExpandedAccounts(
  nodes: readonly AccountTreeNode[],
  enabled: boolean,
  strategy: ExpandStrategy,
) {
  if (!enabled) return new Set<string>();
  return strategy === "all"
    ? collectExpandableAccounts(nodes)
    : collectSmartExpandedAccounts(nodes);
}

function addExpandedSubtree(accounts: Set<string>, node: AccountTreeNode) {
  if (node.children.length) accounts.add(node.value);
  node.children.forEach((child) => addExpandedSubtree(accounts, child));
}

function addSmartExpandedBranch(accounts: Set<string>, node: AccountTreeNode) {
  if (node.children.length) accounts.add(node.value);
  let level = node.children;
  while (level.length === 1) {
    const child = level[0];
    if (child.children.length) accounts.add(child.value);
    level = child.children;
  }
}

function removeExpandedSubtree(accounts: Set<string>, node: AccountTreeNode) {
  accounts.delete(node.value);
  node.children.forEach((child) => removeExpandedSubtree(accounts, child));
}

export function createdAccountName(parent: string, leaf: string) {
  return `${parent}:${leaf.trim()}`;
}

export function accountLeafError(
  parent: string,
  leaf: string,
  options: readonly AccountBrowserOption[],
) {
  const value = leaf.trim();
  if (!value) return "";
  if (value !== leaf) return "子账户名首尾不能包含空格。";
  const parts = value.split(":");
  if (parts.some((part) => !part)) return "每一级账户名称不能为空。";
  if (parts.some((part) => !accountSegmentStart.test(part)))
    return "每一级账户须以大写字母、汉字或数字开头，不能使用小写字母或符号开头。";
  if (parts.some((part) => !accountSegment.test(part)))
    return "每一级账户仅支持字母、数字、汉字或短横线。";
  if (
    options.some((option) => option.value === createdAccountName(parent, value))
  )
    return "该账户已存在，请直接选择。";
  return "";
}

function validDate(value: string) {
  return (
    /^\d{4}-\d{2}-\d{2}$/u.test(value) &&
    Number.isFinite(Date.parse(value)) &&
    new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value
  );
}

export function AccountBrowserSelect({
  label,
  searchLabel,
  value,
  valueDisplay,
  appearance = "field",
  roots: rootOptions,
  relevantRoots,
  options,
  selectableValues,
  placeholder = "请选择分类账户",
  allowEmpty = false,
  disabled,
  onChange,
  createDate = new Date().toISOString().slice(0, 10),
  onCreateAccount,
}: AccountBrowserSelectProps) {
  const [creating, setCreating] = useState<{
    parent: string;
    leaf: string;
    date: string;
  } | null>(null);
  const [createError, setCreateError] = useState("");
  const menu = useSearchMenu({
    minWidth: 320,
    maxWidth: 360,
    maxHeight: 420,
    onEscape: () => {
      if (!creating) return false;
      setCreating(null);
      setCreateError("");
      return true;
    },
  });
  const tree = useMemo(
    () => accountTree(options, rootOptions),
    [options, rootOptions],
  );
  const rootsByValue = useMemo(
    () => new Map(rootOptions.map((root) => [root.value, root])),
    [rootOptions],
  );
  const linkFallback =
    appearance === "link" && !(value && valueDisplay)
      ? value || placeholder
      : "";
  const selectable = useMemo(
    () => new Set(selectableValues),
    [selectableValues],
  );
  const [path, setPath] = useState("");
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [locatedAccount, setLocatedAccount] = useState("");
  const [expandEnabled, setExpandEnabled] = useState(true);
  const [expandStrategy, setExpandStrategy] = useState<ExpandStrategy>("smart");
  const [showAllRoots, setShowAllRoots] = useState(false);
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(
    () => new Set(),
  );
  const triggerInput = useRef<HTMLInputElement>(null);
  const breadcrumbNav = useRef<HTMLElement>(null);
  const accountRows = useRef(new Map<string, HTMLDivElement>());
  const roots = tree.result.filter((node) => node.depth === 0);
  const rootCounts = useMemo(() => {
    const counts = new Map(rootOptions.map((root) => [root.value, 0]));
    for (const option of options) {
      const root = option.value.split(":")[0];
      if (counts.has(root)) counts.set(root, (counts.get(root) ?? 0) + 1);
    }
    return counts;
  }, [options, rootOptions]);
  const currentNode = path ? tree.nodes.get(path) : undefined;
  const query = menu.query.trim().toLocaleLowerCase();
  const searching = !!query;
  const matchesQuery = (node: AccountTreeNode) =>
    `${node.value} ${rootsByValue.get(node.root)?.label ?? ""}`
      .toLocaleLowerCase()
      .includes(query);
  const searchResults = searching ? tree.result.filter(matchesQuery) : [];
  const visibleNodes = path ? (currentNode?.children ?? []) : [];
  const relevantRootSet = useMemo(
    () => new Set(relevantRoots ?? []),
    [relevantRoots],
  );
  const hasHiddenRoots =
    !!relevantRootSet.size &&
    roots.some((root) => !relevantRootSet.has(root.value));
  const visibleRoots = path
    ? []
    : showAllRoots || !relevantRootSet.size
      ? roots
      : roots.filter((root) => relevantRootSet.has(root.value));
  const relevantRootKey = relevantRoots?.join("\u0000") ?? "";
  useEffect(() => {
    setShowAllRoots(false);
  }, [relevantRootKey]);
  useEffect(() => {
    const levelNodes = path ? (tree.nodes.get(path)?.children ?? []) : [];
    setExpandedAccounts(
      initialExpandedAccounts(levelNodes, expandEnabled, expandStrategy),
    );
  }, [path, tree, expandEnabled, expandStrategy]);
  useEffect(() => {
    if (!locatedAccount || searching) return;
    const row = accountRows.current.get(locatedAccount);
    const list = row?.closest<HTMLElement>(".pm-account-browser-options");
    if (!row || !list) return;
    const rowBounds = row.getBoundingClientRect();
    const listBounds = list.getBoundingClientRect();
    if (rowBounds.top < listBounds.top)
      list.scrollTop += rowBounds.top - listBounds.top;
    else if (rowBounds.bottom > listBounds.bottom)
      list.scrollTop += rowBounds.bottom - listBounds.bottom;
  }, [locatedAccount, searching, tree]);
  const creatingParent = creating?.parent;
  useLayoutEffect(() => {
    if (!menu.open || !creatingParent) return;
    menu.root.current
      ?.querySelector<HTMLInputElement>(".pm-account-browser-child-form input")
      ?.focus({ preventScroll: true });
  }, [menu.open, menu.root, creatingParent]);
  useLayoutEffect(() => {
    const nav = breadcrumbNav.current;
    if (!menu.open || !nav) return;
    const revealCurrent = () => {
      nav.scrollLeft = nav.scrollWidth;
    };
    revealCurrent();
    const observer =
      typeof ResizeObserver === "function"
        ? new ResizeObserver(revealCurrent)
        : undefined;
    observer?.observe(nav);
    return () => observer?.disconnect();
  }, [menu.open, path, searching]);
  const breadcrumb = path
    ? path.split(":").map((part, index, parts) => ({
        label: part,
        value: parts.slice(0, index + 1).join(":"),
      }))
    : [];
  const currentSelectable = !!path && selectable.has(path);
  const childNameError = creating
    ? accountLeafError(creating.parent, creating.leaf, options)
    : "";
  const childDateValid = creating ? validDate(creating.date) : false;
  const childReady =
    !!creating &&
    !!creating.leaf.trim() &&
    !childNameError &&
    childDateValid &&
    !creatingAccount &&
    !disabled &&
    !!onCreateAccount;
  function close() {
    menu.setOpen(false);
    triggerInput.current?.focus({ preventScroll: true });
  }
  function choose(next: string, keepTriggerFocus = false) {
    onChange(next);
    setCreating(null);
    setCreateError("");
    setLocatedAccount("");
    menu.setQuery("");
    menu.setOpen(false);
    if (keepTriggerFocus) triggerInput.current?.focus({ preventScroll: true });
  }
  function beginCreating(parent: string) {
    if (!parent) return;
    if (!path || parentPath(parent) !== path) setPath(parent);
    setShowAllRoots(false);
    setCreateError("");
    menu.setQuery("");
    setCreating({ parent, leaf: "", date: createDate });
  }
  function open(createParent?: string) {
    setPath(createParent ?? parentPath(value));
    setShowAllRoots(false);
    menu.setQuery("");
    menu.setActive(0);
    menu.placeMenu();
    menu.setOpen(true);
    if (createParent) beginCreating(createParent);
  }
  function moveActiveSearchResult(delta: number) {
    if (!searchResults.length) return;
    menu.setActive((current) => {
      const index = Math.min(
        Math.max(current, 0),
        Math.max(searchResults.length - 1, 0),
      );
      return (index + delta + searchResults.length) % searchResults.length;
    });
  }
  function commitActiveSearchResult() {
    if (!searching || !searchResults.length) return false;
    const index = Math.min(
      Math.max(menu.active, 0),
      Math.max(searchResults.length - 1, 0),
    );
    const node = searchResults[index];
    if (!node || !selectable.has(node.value)) return false;
    choose(node.value, true);
    return true;
  }
  function enter(node: AccountTreeNode) {
    if (node.children.length) {
      setPath(node.value);
      setCreating(null);
      setLocatedAccount("");
      menu.setQuery("");
      return;
    }
    if (selectable.has(node.value)) choose(node.value);
  }
  function toggleExpanded(node: AccountTreeNode) {
    setExpandedAccounts((current) => {
      const next = new Set(current);
      if (next.has(node.value)) {
        removeExpandedSubtree(next, node);
      } else if (!expandEnabled) {
        next.add(node.value);
      } else if (expandStrategy === "smart") {
        addSmartExpandedBranch(next, node);
      } else {
        addExpandedSubtree(next, node);
      }
      return next;
    });
  }
  async function saveChild() {
    if (!childReady || !creating || !onCreateAccount || creatingAccount) return;
    const account = createdAccountName(creating.parent, creating.leaf);
    setCreatingAccount(true);
    setCreateError("");
    try {
      const saved = await onCreateAccount(
        creating.parent,
        creating.leaf,
        creating.date,
      );
      if (saved === false) {
        setCreateError("创建账户失败，请重试。");
        return;
      }
      setCreating(null);
      setPath(parentPath(account));
      setLocatedAccount(account);
      menu.setQuery("");
      menu.setOpen(true);
    } catch (error) {
      setCreateError(
        error instanceof Error && error.message
          ? error.message
          : "创建账户失败，请重试。",
      );
    } finally {
      setCreatingAccount(false);
    }
  }
  function renderCreateForm(parent: string) {
    if (!creating || creating.parent !== parent) return null;
    return (
      <div
        className="pm-account-browser-child-form"
        role="form"
        aria-label={`在 ${parent} 下创建子账户`}
      >
        <div className="pm-account-browser-child-heading">
          <span className="pm-account-browser-child-icon" aria-hidden="true">
            <svg viewBox="0 0 16 16" focusable="false">
              <path d="M8 3v10M3 8h10" />
            </svg>
          </span>
          <span>
            <strong>新建子账户</strong>
            <small>
              在 <code>{parent}</code> 下
            </small>
          </span>
        </div>
        <div className="pm-account-browser-child-fields">
          <label>
            <span>子账户名称</span>
            <input
              aria-label={`${parent} 的子账户名称`}
              placeholder="例如：外卖:午餐"
              maxLength={100}
              disabled={disabled}
              value={creating.leaf}
              onChange={(event) => {
                setCreating({
                  ...creating,
                  leaf: event.target.value,
                });
                setCreateError("");
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void saveChild();
                }
              }}
            />
          </label>
          <label>
            <span>开户日期</span>
            <input
              aria-label={`${parent} 的子账户开户日期`}
              type="date"
              disabled={disabled}
              value={creating.date}
              onChange={(event) => {
                setCreating({
                  ...creating,
                  date: event.target.value,
                });
                setCreateError("");
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void saveChild();
                }
              }}
            />
          </label>
        </div>
        <p className="pm-account-browser-child-preview">
          <span>新账户</span>
          <code>{createdAccountName(parent, creating.leaf)}</code>
        </p>
        {(createError || childNameError || !childDateValid) && (
          <p className="pm-field-error" role="alert">
            {createError || childNameError || "请输入有效的开户日期。"}
          </p>
        )}
        <div className="pm-account-browser-child-actions">
          <button
            type="button"
            disabled={creatingAccount}
            onClick={() => {
              setCreating(null);
              setCreateError("");
            }}
          >
            取消
          </button>
          <button
            className="pm-account-browser-current"
            type="button"
            disabled={!childReady || creatingAccount}
            aria-busy={creatingAccount}
            onClick={() => void saveChild()}
          >
            确定
          </button>
        </div>
      </div>
    );
  }
  function renderAccountNode(node: AccountTreeNode, depth = 0) {
    const canChoose = selectable.has(node.value);
    const hasChildren = node.children.length > 0;
    const isExpanded = expandedAccounts.has(node.value);
    return (
      <React.Fragment key={node.value}>
        <div
          ref={(element) => {
            if (element) accountRows.current.set(node.value, element);
            else accountRows.current.delete(node.value);
          }}
          className={`pm-account-browser-row ${hasChildren ? "has-children" : "is-leaf"}${hasChildren && canChoose ? " can-pick" : ""}${node.value === value ? " is-selected" : ""}${node.value === locatedAccount ? " is-located" : ""}`}
          style={
            {
              "--pm-account-depth": depth,
              "--pm-account-row-color":
                rootsByValue.get(node.root)?.color ?? "#2563eb",
            } as React.CSSProperties
          }
        >
          <span
            className="pm-account-browser-selection-marker"
            aria-hidden="true"
          />
          {hasChildren ? (
            <>
              <button
                className="pm-account-browser-expand-zone"
                type="button"
                aria-label={`${isExpanded ? "折叠" : "展开"} ${node.value} 的子账户`}
                aria-expanded={isExpanded}
                onClick={() => toggleExpanded(node)}
              >
                <span className="pm-account-browser-zone-label">
                  <svg
                    className={`pm-account-browser-chevron${isExpanded ? " is-open" : ""}`}
                    viewBox="0 0 16 16"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <path d="m6 3.5 4.5 4.5L6 12.5" />
                  </svg>
                  <b>{node.label}</b>
                  <small>{node.children.length}</small>
                </span>
              </button>
              {hasChildren && canChoose && (
                <button
                  className="pm-account-browser-pick"
                  type="button"
                  aria-label={`选择当前层账户 ${node.value}`}
                  onClick={() => choose(node.value)}
                >
                  <svg
                    className="pm-account-browser-check"
                    viewBox="0 0 16 16"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <path d="m3.5 8 3 3 6-6" />
                  </svg>
                </button>
              )}
            </>
          ) : (
            <button
              className="pm-account-browser-enter-zone is-leaf-option"
              type="button"
              role="option"
              aria-selected={node.value === value}
              aria-label={
                canChoose ? `选择账户 ${node.value}` : `${node.value} 暂不可选`
              }
              disabled={!canChoose}
              onClick={() => enter(node)}
            >
              <span>
                <b>{node.label}</b>
              </span>
              {canChoose && (
                <svg
                  className="pm-account-browser-check"
                  viewBox="0 0 16 16"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path d="m3.5 8 3 3 6-6" />
                </svg>
              )}
            </button>
          )}
          {hasChildren && (
            <button
              className="pm-account-browser-enter-zone"
              type="button"
              role="option"
              aria-selected={node.value === value}
              aria-label={`进入 ${node.value}`}
              onClick={() => enter(node)}
            >
              <svg
                className="pm-account-browser-enter-chevron"
                viewBox="0 0 16 16"
                aria-hidden="true"
                focusable="false"
              >
                <path d="m6 3.5 4.5 4.5L6 12.5" />
              </svg>
            </button>
          )}
        </div>
        {renderCreateForm(node.value)}
        {isExpanded &&
          !query &&
          node.children.map((child) => renderAccountNode(child, depth + 1))}
      </React.Fragment>
    );
  }
  function renderSearchResult(node: AccountTreeNode, index: number) {
    const canChoose = selectable.has(node.value);
    const hasChildren = node.children.length > 0;
    return (
      <React.Fragment key={`search:${node.value}`}>
        <div
          ref={(element) => {
            if (element) accountRows.current.set(node.value, element);
            else accountRows.current.delete(node.value);
          }}
          className={`pm-account-browser-row is-search-result${menu.active === index ? " is-active" : ""}${node.value === value ? " is-selected" : ""}${node.value === locatedAccount ? " is-located" : ""}`}
          style={
            {
              "--pm-account-row-color":
                rootsByValue.get(node.root)?.color ?? "#2563eb",
            } as React.CSSProperties
          }
          onMouseEnter={() => menu.setActive(index)}
        >
          <span
            className="pm-account-browser-selection-marker"
            aria-hidden="true"
          />
          <button
            className="pm-account-browser-enter-zone is-search-result"
            type="button"
            role="option"
            aria-selected={node.value === value}
            aria-label={
              hasChildren
                ? `进入 ${node.value}`
                : canChoose
                  ? `选择账户 ${node.value}`
                  : `${node.value} 暂不可选`
            }
            disabled={!hasChildren && !canChoose}
            onClick={() => enter(node)}
          >
            <span className="pm-account-browser-search-main">
              <b>{node.value}</b>
              <small>{rootsByValue.get(node.root)?.label ?? node.root}</small>
            </span>
            <span
              className="pm-account-browser-search-action"
              aria-hidden="true"
            >
              {hasChildren ? (
                <svg viewBox="0 0 16 16" focusable="false">
                  <path d="m6 3.5 4.5 4.5L6 12.5" />
                </svg>
              ) : canChoose ? (
                <svg viewBox="0 0 16 16" focusable="false">
                  <path d="m3.5 8 3 3 6-6" />
                </svg>
              ) : null}
            </span>
          </button>
          {hasChildren && canChoose && (
            <button
              className="pm-account-browser-pick"
              type="button"
              aria-label={`选择当前层账户 ${node.value}`}
              onClick={() => choose(node.value)}
            >
              <svg
                className="pm-account-browser-check"
                viewBox="0 0 16 16"
                aria-hidden="true"
                focusable="false"
              >
                <path d="m3.5 8 3 3 6-6" />
              </svg>
            </button>
          )}
        </div>
        {renderCreateForm(node.value)}
      </React.Fragment>
    );
  }
  return (
    <div
      className={`pm-search-select pm-account-browser${appearance === "link" ? " is-link" : ""}`}
      data-appearance={appearance}
      ref={menu.root}
    >
      <div
        className={`pm-search-select-trigger pm-account-browser-trigger${disabled ? " is-disabled" : ""}`}
        onClick={() => {
          if (!disabled && !menu.open) open();
        }}
      >
        <input
          ref={triggerInput}
          className={
            (value && valueDisplay) || appearance === "link"
              ? "pm-account-browser-value-input"
              : undefined
          }
          type="text"
          readOnly
          role="combobox"
          aria-label={label}
          aria-haspopup="dialog"
          aria-expanded={menu.open}
          disabled={disabled}
          placeholder={placeholder}
          value={value}
          onChange={(event) => {
            const next = event.target.value;
            if ((allowEmpty && !next) || selectable.has(next)) choose(next);
          }}
          onKeyDown={(event) => {
            if (
              !disabled &&
              ["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)
            ) {
              event.preventDefault();
              if (!menu.open) open();
            }
          }}
        />
        {value && valueDisplay && (
          <span className="pm-account-browser-value" aria-hidden="true">
            {valueDisplay}
          </span>
        )}
        {linkFallback && (
          <span
            className="pm-account-browser-value pm-account-browser-placeholder"
            aria-hidden="true"
          >
            {linkFallback}
          </span>
        )}
        {value && !disabled && appearance !== "link" && (
          <button
            className="pm-account-browser-clear"
            type="button"
            aria-label={`清空${label}`}
            title="清空选择"
            onClick={(event) => {
              event.stopPropagation();
              choose("");
            }}
          >
            ×
          </button>
        )}
        <span className="pm-account-browser-action" aria-hidden="true">
          {appearance === "link" ? (
            "↗"
          ) : (
            <>
              分类
              <svg viewBox="0 0 16 16" focusable="false">
                <path d="m6 3.5 4.5 4.5L6 12.5" />
              </svg>
            </>
          )}
        </span>
        {onCreateAccount && appearance !== "link" && (
          <button
            className="pm-account-browser-create"
            type="button"
            aria-label="在当前分类创建子账户"
            title="在当前分类下创建子账户"
            disabled={disabled}
            onClick={(event) => {
              event.stopPropagation();
              const parent =
                value ||
                path ||
                (roots.length === 1 ? roots[0]?.value : "") ||
                "";
              if (menu.open) {
                if (parent) beginCreating(parent);
              } else {
                open(parent);
              }
            }}
          >
            +
          </button>
        )}
      </div>
      {menu.open && (
        <div
          className="pm-search-select-menu pm-account-browser-menu"
          popover="manual"
          role="dialog"
          aria-label={`${label}分类浏览`}
          aria-keyshortcuts="Escape"
          style={menu.position}
        >
          <label className="pm-account-browser-search">
            <span className="pm-account-browser-search-control">
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                data-menu-initial-focus
                className="pm-account-browser-search-input"
                type="search"
                aria-label={searchLabel}
                placeholder="输入关键字搜索所有层级"
                value={menu.query}
                onChange={(event) => {
                  menu.setQuery(event.target.value);
                  menu.setActive(0);
                }}
                onKeyDown={(event) => {
                  if (
                    (event.key === "Tab" || event.key === "Enter") &&
                    commitActiveSearchResult()
                  ) {
                    event.preventDefault();
                    return;
                  }
                  if (event.key === "ArrowDown") {
                    event.preventDefault();
                    moveActiveSearchResult(1);
                  } else if (event.key === "ArrowUp") {
                    event.preventDefault();
                    moveActiveSearchResult(-1);
                  }
                }}
              />
            </span>
          </label>
          {searching ? (
            <>
              <div className="pm-account-browser-search-summary">
                <span>全层级搜索</span>
                <strong>{searchResults.length} 个匹配账户</strong>
              </div>
              <div
                className="pm-account-browser-options"
                role="listbox"
                aria-label="全层级账户搜索结果"
              >
                {searchResults.map(renderSearchResult)}
                {!searchResults.length && (
                  <p className="pm-account-browser-empty">没有匹配的账户</p>
                )}
              </div>
            </>
          ) : path ? (
            <>
              <div className="pm-account-browser-pathbar">
                <nav
                  ref={breadcrumbNav}
                  className="pm-account-browser-breadcrumb"
                  aria-label="账户层级"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setPath("");
                      setShowAllRoots(false);
                      setCreating(null);
                      menu.setQuery("");
                    }}
                  >
                    根账户
                  </button>
                  {breadcrumb.map((crumb) => (
                    <React.Fragment key={crumb.value}>
                      <span aria-hidden="true">/</span>
                      <button
                        type="button"
                        aria-current={crumb.value === path ? "page" : undefined}
                        onClick={() => {
                          setPath(crumb.value);
                          setCreating(null);
                          menu.setQuery("");
                        }}
                      >
                        {crumb.label}
                      </button>
                    </React.Fragment>
                  ))}
                  {onCreateAccount && (
                    <button
                      className="pm-account-browser-breadcrumb-create"
                      type="button"
                      aria-label={`在 ${path} 下添加子账户`}
                      title={`在 ${path} 下添加子账户`}
                      disabled={disabled}
                      onClick={() => {
                        if (creating?.parent === path) {
                          setCreating(null);
                          setCreateError("");
                        } else {
                          beginCreating(path);
                        }
                      }}
                    >
                      <svg
                        viewBox="0 0 16 16"
                        aria-hidden="true"
                        focusable="false"
                      >
                        <path d="M8 3v10M3 8h10" />
                      </svg>
                    </button>
                  )}
                </nav>
                <div
                  className="pm-account-browser-expand-controls"
                  role="group"
                  aria-label="展开选项"
                >
                  <span className="pm-account-browser-expand-label">展开</span>
                  <button
                    className="pm-account-browser-expand-switch"
                    type="button"
                    role="switch"
                    aria-label="展开"
                    aria-checked={expandEnabled}
                    onClick={() => setExpandEnabled((current) => !current)}
                  >
                    <span aria-hidden="true" />
                  </button>
                  <span
                    className="pm-account-browser-expand-divider"
                    aria-hidden="true"
                  />
                  <div
                    className="pm-account-browser-expand-modes"
                    role="group"
                    aria-label="展开方式"
                  >
                    {(["all", "smart"] as const).map((strategy) => {
                      const active =
                        expandEnabled && expandStrategy === strategy;
                      return (
                        <button
                          type="button"
                          key={strategy}
                          aria-pressed={active}
                          onClick={() => {
                            setExpandStrategy(strategy);
                            setExpandEnabled(true);
                          }}
                        >
                          {strategy === "all" ? "全部" : "智能"}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div
                className="pm-account-browser-options"
                role="listbox"
                aria-label={`${path} 的子账户`}
              >
                {renderCreateForm(path)}
                {visibleNodes.map((node) => renderAccountNode(node))}
                {!visibleNodes.length && (
                  <p className="pm-account-browser-empty">此分类下没有子账户</p>
                )}
              </div>
            </>
          ) : (
            <div className="pm-account-browser-root-view">
              {hasHiddenRoots && (
                <div className="pm-account-browser-root-toolbar">
                  <span>
                    {showAllRoots ? "已显示全部账户类别" : "已按当前选项筛选"}
                  </span>
                  <button
                    type="button"
                    aria-pressed={showAllRoots}
                    onClick={() => setShowAllRoots((current) => !current)}
                  >
                    {showAllRoots ? "仅显示相关" : "显示全部"}
                  </button>
                </div>
              )}
              <div
                className="pm-account-browser-roots"
                role="group"
                aria-label="根账户类别"
              >
                {visibleRoots.map((root) => (
                  <div key={root.value} className="pm-account-browser-root-row">
                    <button
                      type="button"
                      aria-label={`进入 ${root.value}`}
                      data-account-root={root.value}
                      style={
                        {
                          "--pm-account-root-color":
                            rootsByValue.get(root.value)?.color ?? "#64748b",
                        } as React.CSSProperties
                      }
                      onClick={() => {
                        setPath(root.value);
                        setCreating(null);
                        setCreateError("");
                        menu.setQuery("");
                      }}
                    >
                      <span className="pm-account-browser-root-dot" />
                      <strong>
                        {rootsByValue.get(root.value)?.value ?? root.value}
                      </strong>
                      <small aria-hidden="true">
                        {rootCounts.get(root.value) ?? 0}
                      </small>
                      <svg
                        className="pm-account-browser-enter-chevron"
                        viewBox="0 0 16 16"
                        aria-hidden="true"
                        focusable="false"
                      >
                        <path d="m6 3.5 4.5 4.5L6 12.5" />
                      </svg>
                    </button>
                  </div>
                ))}
                {!visibleRoots.length && (
                  <p className="pm-account-browser-empty">
                    没有可用的根账户类别
                  </p>
                )}
              </div>
            </div>
          )}
          <div className="pm-account-browser-footer">
            <span>
              {searching
                ? `已搜索全部层级${path ? ` · 当前分类 ${path}` : ""}`
                : path
                  ? `当前位置：${path}`
                  : "选择根账户类别后继续"}
            </span>
            {allowEmpty && value && (
              <button type="button" onClick={() => choose("")}>
                清除选择
              </button>
            )}
            {onCreateAccount && path && !creating && (
              <button
                className="pm-account-browser-footer-create"
                type="button"
                aria-label={`在 ${
                  value && parentPath(value) === path ? value : path
                } 下添加子账户`}
                onClick={() =>
                  beginCreating(
                    value && parentPath(value) === path ? value : path,
                  )
                }
              >
                <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                  <path d="M8 3v10M3 8h10" />
                </svg>
                {value && parentPath(value) === path
                  ? "新建子账户"
                  : "新建账户"}
              </button>
            )}
            <button
              type="button"
              title="关闭（Esc）"
              aria-keyshortcuts="Escape"
              onClick={close}
            >
              关闭
            </button>
            {currentSelectable && (
              <button
                className="pm-account-browser-current"
                type="button"
                onClick={() => choose(path)}
              >
                选择此分类
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
