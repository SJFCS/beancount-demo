import React, { useEffect, useMemo, useRef, useState } from "react";
import type {
  Account,
  Batch,
  CounterpartyAccount,
  CounterpartyDescriptionMatch,
  CounterpartyKind,
  PaymentAccount,
  Row,
} from "../types";
import {
  needsAccountMapping,
  needsReviewConfirmation,
  requiresStatusReview,
  hasReviewWarnings,
  matchesReviewWarning,
  type ReviewWarningType,
} from "../review";
import type {
  AccountPanel,
  Catalog,
  ClassificationProgress,
  Detail,
  Props,
} from "./types";
import { groupTransactions, type RefundMatchKind } from "./display";
import {
  classificationRunning,
  needsClassification,
  matchesAiResult,
} from "../classification";
import {
  counterpartyKind,
  descriptionMatches,
  matchValue,
  ruleMatches,
  sortCounterpartyRules,
} from "../account-scope";
import {
  emptyColumnFilters,
  matchesColumnFilters,
  matchesReview,
  columnFilterLabels,
  sortTransactionGroups,
  withoutColumnFilter,
} from "./transaction-filters";
import type {
  BulkSelectionUndo,
  ColumnFilters,
  FilterKey,
} from "./transaction-filters";
import { matchesUploadFormat, uploadFormats } from "./upload-formats";
import { createDialogState } from "./dialog-state";
const reviewFields = [
  "id",
  "amount",
  "sourceAccount",
  "targetAccount",
  "selected",
  "duplicateReviewed",
  "statusReviewed",
  "confidence",
  "reasoning",
  "aiFallback",
] as const;
function readClassificationView(ledgerId: string) {
  try {
    return JSON.parse(
      localStorage.getItem(`payments-ai:${ledgerId}`) ?? "null",
    ) as { batchId: string; minimized: boolean } | null;
  } catch {
    return null;
  }
}
function clearClassificationView(ledgerId: string, batchId: string) {
  if (readClassificationView(ledgerId)?.batchId !== batchId) return;
  try {
    localStorage.removeItem(`payments-ai:${ledgerId}`);
  } catch {}
}
export function usePayments({ ledgerId, canWrite, api }: Props) {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [savedRows, setSavedRows] = useState<Row[] | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [excludeCompletedPreference, setExcludeCompletedPreference] =
    useState(true);
  const completedView = filter === "committed" || filter === "notImported";
  // Completed views bypass the review preference without overwriting it.
  const excludeCompleted = excludeCompletedPreference && !completedView;
  const [warningTypes, setWarningTypes] = useState<ReviewWarningType[]>([]);
  const [bulkSelectionUndo, setBulkSelectionUndo] =
    useState<BulkSelectionUndo | null>(null);
  const [columnFilters, setColumnFilters] = useState(emptyColumnFilters);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState<number | null>(null);
  const [confirmCommit, setConfirmCommit] = useState(false);
  const [accountPanelState] = useState(() => createDialogState<AccountPanel>());
  const setAccountPanel = accountPanelState.setSnapshot;
  const [classificationState] = useState(() =>
    createDialogState<ClassificationProgress>(),
  );
  const setClassificationProgress = classificationState.setSnapshot;
  const [classificationDisplay] = useState(() =>
    createDialogState<{ minimized: boolean }>(),
  );
  const classifying = useRef(false);
  const epoch = useRef(0);
  const batch = detail?.batch;
  const aiFailureIds = useMemo(
    () =>
      new Set(
        batch?.classification?.failures.map((failure) => failure.id) ?? [],
      ),
    [batch?.classification],
  );
  const classificationViewIds = useMemo(() => {
    const progress = batch?.classification;
    if (!progress) return new Set<string>();
    const completed = new Set([
      ...progress.succeededIds,
      ...progress.failures.map((failure) => failure.id),
    ]);
    return new Set(
      filter === "aiSuccess"
        ? progress.succeededIds
        : filter === "aiFailed"
          ? progress.failures.map((failure) => failure.id)
          : progress.candidateIds.filter((id) => !completed.has(id)),
    );
  }, [batch?.classification, filter]);
  const dirty = useMemo(
    () =>
      !!batch &&
      !!savedRows &&
      (batch.rows.length !== savedRows.length ||
        batch.rows.some((row, index) => {
          const saved = savedRows[index];
          if (row === saved) return false;
          return (
            !saved ||
            reviewFields.some((field) => row[field] !== saved[field]) ||
            !!row.notImported !== !!saved.notImported ||
            row.duplicates.length !== saved.duplicates.length ||
            row.duplicates.some(
              (value, index) => value !== saved.duplicates[index],
            )
          );
        })),
    [batch, savedRows],
  );
  const classificationActive = classificationRunning(batch?.classification);
  const editable = canWrite && !busy && !batch?.locked && !classificationActive;

  async function request<T>(
    action = "",
    body?: Record<string, unknown>,
    signal?: AbortSignal,
  ): Promise<T> {
    const endpoint = `/api-gateway/local/plugins/payments/api${action ? `/${action}` : ""}`;
    const response = await api.fetchLocal(
      body === undefined
        ? `${endpoint}?ledgerId=${encodeURIComponent(ledgerId)}`
        : endpoint,
      body === undefined
        ? { signal }
        : {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ ...body, ledgerId }),
            signal,
          },
    );
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "请求失败");
    return payload as T;
  }
  useEffect(() => {
    const controller = new AbortController();
    epoch.current++;
    setCatalog(null);
    setDetail(null);
    setSavedRows(null);
    setBusy("");
    setError("");
    setNotice("");
    setAccountPanel(null);
    setClassificationProgress(null);
    classificationDisplay.setSnapshot(null);
    classifying.current = false;
    setColumnFilters(emptyColumnFilters);
    setWarningTypes([]);
    setExcludeCompletedPreference(true);
    void request<Catalog>("", undefined, controller.signal)
      .then((value) => {
        if (controller.signal.aborted) return;
        setCatalog(value);
        const view = readClassificationView(ledgerId);
        if (
          view &&
          !value.batches.some(
            (item) =>
              item.id === view.batchId &&
              classificationRunning(item.classification),
          )
        )
          clearClassificationView(ledgerId, view.batchId);
      })
      .catch((cause) => {
        if (!controller.signal.aborted)
          setError(String(cause instanceof Error ? cause.message : cause));
      });
    return () => {
      controller.abort();
      epoch.current++;
    };
  }, [ledgerId, api]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  async function run(label: string, work: () => Promise<void>) {
    const current = epoch.current;
    setBusy(label);
    setError("");
    setNotice("");
    setConfirmCommit(false);
    try {
      await work();
    } catch (cause) {
      if (current === epoch.current)
        setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      if (current === epoch.current) setBusy("");
    }
  }
  function accept(value: Detail) {
    if (value.batch.id !== batch?.id) {
      setFilter("all");
      setExcludeCompletedPreference(true);
      setWarningTypes([]);
      setSearch("");
      setBulkSelectionUndo(null);
      setColumnFilters(emptyColumnFilters);
      setAccountPanel(null);
      setClassificationProgress(null);
      classificationDisplay.setSnapshot(null);
    }
    setDetail(value);
    setSavedRows(value.batch.rows);
    const progress = value.batch.classification;
    if (progress && classificationRunning(progress)) {
      setClassificationProgress(progress);
      const view = readClassificationView(ledgerId);
      classificationDisplay.setSnapshot({
        minimized: view?.batchId === value.batch.id ? !!view.minimized : true,
      });
    } else {
      clearClassificationView(ledgerId, value.batch.id);
    }
    setPage(0);
  }
  function setClassificationMinimized(minimized: boolean) {
    const running = classificationRunning(classificationState.getSnapshot());
    classificationDisplay.setSnapshot({ minimized });
    if (batch && running) {
      try {
        localStorage.setItem(
          `payments-ai:${ledgerId}`,
          JSON.stringify({ batchId: batch.id, minimized }),
        );
      } catch {}
    }
  }
  useEffect(() => {
    if (!classificationActive || !batch) return;
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    const poll = async () => {
      try {
        const value = await request<{
          progress: ClassificationProgress | null;
          detail?: Detail;
        }>(
          "classification-status",
          {
            id: batch.id,
            processed: classificationState.getSnapshot()?.processed,
          },
          controller.signal,
        );
        if (controller.signal.aborted) return;
        setClassificationProgress(value.progress);
        if (value.detail) {
          setDetail(value.detail);
          setSavedRows(value.detail.batch.rows);
        }
        if (!classificationRunning(value.progress)) {
          clearClassificationView(ledgerId, batch.id);
          setError("");
          if (value.progress?.phase === "complete")
            setNotice(
              `已完成 ${value.progress.succeeded} 笔分类并保存。${value.progress.failed ? `${value.progress.failed} 笔无有效分类，请核对兜底账户与 AI 分析。` : ""}`,
            );
          return;
        }
        setError("");
      } catch (cause) {
        if (controller.signal.aborted) return;
        setError(
          `暂时无法更新 AI 进度，后台任务不会停止，正在重新连接：${cause instanceof Error ? cause.message : String(cause)}`,
        );
      }
      timer = setTimeout(() => void poll(), 1200);
    };
    void poll();
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [batch?.id, classificationActive, ledgerId, api]);
  async function open(id: string) {
    if (
      dirty &&
      !window.confirm("当前修改尚未保存，是否放弃修改并打开其他批次？")
    )
      return;
    await run("打开批次…", async () => {
      accept(await request<Detail>("open", { id }));
      setFilter("all");
      setExcludeCompletedPreference(true);
      setWarningTypes([]);
      setSearch("");
      setBulkSelectionUndo(null);
      setColumnFilters(emptyColumnFilters);
    });
  }
  async function importExisting(path: string) {
    if (dirty && !window.confirm("当前修改尚未保存，是否放弃并导入新账单？"))
      return;
    await run("解析账单…", async () => {
      accept(await request<Detail>("import", { path }));
      setBulkSelectionUndo(null);
      setCatalog(await request<Catalog>());
      setNotice("账单已存为审核草稿；尚未写入账本。相同文件会恢复原批次。");
    });
  }
  async function deleteDraft(draft: {
    id: string;
    filename: string;
    revision: string;
  }) {
    if (
      !canWrite ||
      busy ||
      !window.confirm(
        `删除待审草稿“${draft.filename}”？审核修改和 AI 结果将被移除，原始账单文件会保留。${detail?.batch.id === draft.id && dirty ? "当前未保存的修改也将丢弃。" : ""}`,
      )
    )
      return;
    await run("删除草稿…", async () => {
      await request("delete-draft", {
        id: draft.id,
        revision:
          detail?.batch.id === draft.id ? detail.revision : draft.revision,
      });
      if (detail?.batch.id === draft.id) {
        setDetail(null);
        setSavedRows(null);
        setAccountPanel(null);
        setPage(0);
      }
      setCatalog(await request<Catalog>());
      setNotice("待审草稿已删除，原始账单文件已保留。");
    });
  }
  async function upload(file: File, provider: Batch["provider"]) {
    if (!matchesUploadFormat(file.name, provider)) {
      const format = uploadFormats[provider];
      setError(
        `${format.name}账单仅支持 ${format.extension.slice(1).toUpperCase()} 文件，请选择 ${format.extension} 文件。`,
      );
      setNotice("");
      return;
    }
    if (dirty && !window.confirm("当前修改尚未保存，是否放弃并导入新账单？"))
      return;
    await run("上传并解析…", async () => {
      if (file.size > 20 * 1024 * 1024) throw new Error("文件不能超过 20 MB");
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error("读取文件失败"));
        reader.onload = () => resolve(String(reader.result).split(",")[1]);
        reader.readAsDataURL(file);
      });
      accept(
        await request<Detail>("import", {
          filename: file.name,
          base64,
          provider,
        }),
      );
      setCatalog(await request<Catalog>());
      setNotice("原始文件已归档，审核草稿已保存；请核对后入账。");
    });
  }
  function edit(id: string, patch: Partial<Row>) {
    if (!editable) return;
    if (patch.selected !== undefined) setBulkSelectionUndo(null);
    if (patch.selected === true) patch = { ...patch, notImported: false };
    if (patch.amount !== undefined)
      patch = {
        ...patch,
        confidence: undefined,
        reasoning: undefined,
        aiFallback: undefined,
        duplicateReviewed: false,
      };
    setDetail((current) =>
      current
        ? {
            ...current,
            batch: {
              ...current.batch,
              rows: current.batch.rows.map((r) =>
                r.id === id && !r.locked && !r.committedAt
                  ? { ...r, ...patch }
                  : r,
              ),
            },
          }
        : current,
    );
    setConfirmCommit(false);
  }
  function editMany(ids: Set<string>, patch: Partial<Row>) {
    if (!editable) return;
    setBulkSelectionUndo(null);
    if (patch.selected === true) patch = { ...patch, notImported: false };
    setDetail((current) =>
      current
        ? {
            ...current,
            batch: {
              ...current.batch,
              rows: current.batch.rows.map((r) =>
                ids.has(r.id) && !r.locked && !r.committedAt
                  ? { ...r, ...patch }
                  : r,
              ),
            },
          }
        : current,
    );
    setConfirmCommit(false);
  }
  function updateSearch(value: string) {
    setSearch(value);
    setPage(0);
  }
  function recordBulkSelectionUndo(undo: BulkSelectionUndo | null) {
    setBulkSelectionUndo(undo);
  }
  function undoBulkSelection() {
    if (!editable || !bulkSelectionUndo) return;
    const changes = new Map(
      bulkSelectionUndo.changes.map((change) => [change.id, change]),
    );
    setDetail((current) =>
      current
        ? {
            ...current,
            batch: {
              ...current.batch,
              rows: current.batch.rows.map((row) => {
                const change = changes.get(row.id);
                if (
                  row.locked ||
                  row.committedAt ||
                  !change ||
                  row.selected !== change.afterSelected ||
                  !!row.notImported !== change.afterNotImported ||
                  row.duplicateReviewed !== change.afterDuplicateReviewed
                )
                  return row;
                return {
                  ...row,
                  selected: change.beforeSelected,
                  notImported: change.beforeNotImported,
                  duplicateReviewed: change.beforeDuplicateReviewed,
                };
              }),
            },
          }
        : current,
    );
    setConfirmCommit(false);
    setNotice(
      `已撤销批量选中，恢复 ${bulkSelectionUndo.changes.length} 笔交易。`,
    );
    setBulkSelectionUndo(null);
  }
  async function save(commit = false) {
    if (!detail || (!commit && !dirty)) return;
    await run(commit ? "校验并写入账本…" : "保存草稿…", async () => {
      const value = await request<Detail>(commit ? "commit" : "save", {
        id: detail.batch.id,
        revision: detail.revision,
        rows: detail.batch.rows,
      });
      accept(value);
      setCatalog(await request<Catalog>());
      setNotice(
        commit
          ? `已入账：${value.batch.outputPath}`
          : "草稿已保存并提交 Git，去重选择、账户映射和 AI 建议可在下次继续使用。",
      );
    });
  }
  const rows = batch?.rows ?? [];
  const selected = useMemo(
    () =>
      rows.filter(
        (r) => r.selected && !r.notImported && !r.locked && !r.committedAt,
      ),
    [rows],
  );
  const selectedIds = useMemo(
    () => new Set(selected.map((row) => row.id)),
    [selected],
  );
  const aiCandidates = useMemo(
    () => selected.filter(needsClassification),
    [selected],
  );
  const reviewRows = useMemo(
    () =>
      excludeCompleted
        ? rows.filter((row) => !row.committedAt && !row.notImported)
        : rows,
    [rows, excludeCompleted],
  );
  function clearSelectedTransactions() {
    if (!editable || !selected.length) return;
    editMany(selectedIds, { selected: false });
    setBulkSelectionUndo({
      label: "清空所有勾选",
      changes: selected.map((row) => ({
        id: row.id,
        beforeSelected: row.selected,
        afterSelected: false,
        beforeNotImported: !!row.notImported,
        afterNotImported: !!row.notImported,
        beforeDuplicateReviewed: row.duplicateReviewed,
        afterDuplicateReviewed: row.duplicateReviewed,
      })),
    });
  }
  const pendingReviewIds = useMemo(
    () =>
      new Set(selected.filter(needsReviewConfirmation).map((row) => row.id)),
    [selected],
  );
  const selectedMissingIds = useMemo(
    () => new Set(selected.filter(needsAccountMapping).map((row) => row.id)),
    [selected],
  );
  const transactionGroups = useMemo(() => groupTransactions(rows), [rows]);
  const refundKinds = useMemo(() => {
    const kinds = new Map<string, RefundMatchKind>();
    for (const group of transactionGroups) {
      if (group.refundKind)
        for (const row of group.rows) kinds.set(row.id, group.refundKind);
    }
    return kinds;
  }, [transactionGroups]);
  const accounts = detail?.accounts ?? catalog?.accounts ?? [];
  const paymentAccounts =
    detail?.paymentAccounts ?? catalog?.paymentAccounts ?? [];
  function openAccountPanel(
    payment: string,
    currentAccount = "",
    rowId?: string,
  ) {
    if (!editable || !batch) return;
    const links = paymentAccounts.filter(
      (item) =>
        item.provider === batch.provider &&
        (item.match ?? "exact") === "exact" &&
        matchValue(item.payment) === matchValue(payment),
    );
    const link = links.find((item) => !item.description);
    setError("");
    setAccountPanel({
      mode: "payment",
      context: "row",
      match: "exact",
      pattern: "",
      kind: "payment",
      payments: [payment],
      counterparties: [],
      descriptionMatch: "contains",
      descriptionPattern: "",
      account: currentAccount || link?.account || "",
      date: rows.map((row) => row.date).sort()[0],
      rowId,
    });
  }
  function openAccountLinking(mode: AccountPanel["mode"] = "payment") {
    if (!editable || !batch) return;
    setError("");
    setAccountPanel({
      mode,
      descriptionScope: "all",
      context: "batch",
      match: "exact",
      pattern: "",
      kind: mode === "payment" ? "payment" : "expense",
      payments: [],
      counterparties: [],
      descriptionMatch: mode === "counterparty" ? "contains" : undefined,
      descriptionPattern: "",
      account: "",
      date: rows.map((row) => row.date).sort()[0],
    });
  }
  async function createAccount(account: string, date: string) {
    if (!account || !date) return false;
    let created = false;
    await run("创建账户…", async () => {
      const result = await request<{ accounts: Account[] }>("create-account", {
        account,
        date,
      });
      setDetail((current) =>
        current ? { ...current, accounts: result.accounts } : current,
      );
      setCatalog((current) =>
        current ? { ...current, accounts: result.accounts } : current,
      );
      setNotice(`已创建账户 ${account}，请选择后完成绑定。`);
      created = true;
    });
    return created;
  }
  async function linkAccount(panel = accountPanelState.getSnapshot()) {
    if (!detail || !panel) return false;
    const isDescription = panel.mode === "description";
    const descriptionScope = panel.descriptionScope ?? "all";
    const isPayment =
      panel.mode === "payment" ||
      (isDescription && descriptionScope === "payment");
    const hasSource = !isDescription || descriptionScope !== "all";
    const description: CounterpartyDescriptionMatch | undefined =
      isDescription && panel.descriptionPattern?.trim()
        ? {
            match: panel.descriptionMatch ?? "contains",
            pattern: panel.descriptionPattern.trim(),
          }
        : undefined;
    const selectedNames = new Set(
      panel.counterparties.map(matchValue).filter(Boolean),
    );
    if (
      !panel.account ||
      (isDescription && !description) ||
      (hasSource &&
        (isPayment
          ? panel.match === "regex"
            ? !panel.pattern.trim()
            : !panel.payments.length
          : panel.match === "regex"
            ? !panel.pattern.trim()
            : !selectedNames.size))
    )
      return false;
    let saved = false;
    await run("保存账户关联…", async () => {
      const exactRules = new Map<
        string,
        {
          kind: CounterpartyKind;
          match?: "exact";
          pattern?: string;
          description?: CounterpartyDescriptionMatch;
        }
      >();
      const addExactRule = (kind: CounterpartyKind, pattern?: string) => {
        const value = matchValue(pattern ?? "");
        if (!value && !description) return;
        exactRules.set(
          JSON.stringify([
            kind,
            value,
            description?.match ?? "",
            description?.pattern ?? "",
          ]),
          {
            kind,
            ...(value ? { match: "exact" as const, pattern: value } : {}),
            ...(description ? { description } : {}),
          },
        );
      };
      if (panel.kind === "all" && hasSource) {
        for (const row of detail.batch.rows) {
          if (selectedNames.has(matchValue(row.payee)))
            addExactRule(counterpartyKind(row), row.payee);
        }
        for (const rule of detail.counterpartyAccounts ??
          catalog?.counterpartyAccounts ??
          []) {
          if (
            rule.provider === detail.batch.provider &&
            rule.match === "exact" &&
            selectedNames.has(matchValue(rule.pattern ?? ""))
          )
            addExactRule(rule.kind, rule.pattern);
        }
      }
      if (panel.kind === "all" && !hasSource && description) {
        const kinds = new Set<CounterpartyKind>();
        for (const row of detail.batch.rows) {
          if (
            !row.locked &&
            !row.committedAt &&
            descriptionMatches(description, row.description)
          )
            kinds.add(counterpartyKind(row));
        }
        for (const kind of kinds) addExactRule(kind);
      }
      const counterpartyRules =
        panel.kind === "all"
          ? [...exactRules.values()]
          : hasSource && panel.match === "regex"
            ? [
                {
                  kind: panel.kind as CounterpartyKind,
                  match: "regex" as const,
                  pattern: panel.pattern.trim(),
                  ...(description ? { description } : {}),
                },
              ]
            : hasSource
              ? [...selectedNames].map((pattern) => ({
                  kind: panel.kind as CounterpartyKind,
                  match: "exact" as const,
                  pattern: matchValue(pattern),
                  ...(description ? { description } : {}),
                }))
              : [
                  {
                    kind: panel.kind as CounterpartyKind,
                    ...(description ? { description } : {}),
                  },
                ];
      const value = await request<Detail>(
        isPayment ? "link-account" : "link-counterparty",
        {
          id: detail.batch.id,
          revision: detail.revision,
          configRevision: detail.configRevision,
          rows: detail.batch.rows,
          account: panel.account,
          ...(isPayment
            ? panel.match === "regex"
              ? {
                  paymentRules: [
                    {
                      match: "regex" as const,
                      pattern: panel.pattern.trim(),
                      ...(description ? { description } : {}),
                    },
                  ],
                  ...(description ? { description } : {}),
                }
              : {
                  payments: panel.payments,
                  ...(description ? { description } : {}),
                }
            : {
                rules: counterpartyRules,
              }),
        },
      );
      setDetail(value);
      setSavedRows(value.batch.rows);
      setAccountPanel(null);
      setCatalog(await request<Catalog>());
      setNotice(
        isDescription
          ? `交易内容匹配规则已关联到 ${panel.account}，并保存到本地配置。`
          : isPayment
            ? panel.match === "regex"
              ? `支付方式自定义匹配规则已关联到 ${panel.account}，并保存到本地配置。`
              : `已将 ${panel.payments.length} 种收/付款方式关联到 ${panel.account}，当前批次和本地配置已保存。`
            : panel.match === "regex"
              ? `自定义匹配已关联到 ${panel.account}，并保存到本地配置。`
              : `已将 ${counterpartyRules.length} 个交易对方关联到 ${panel.account}，规则已保存并将用于后续导入。`,
      );
      saved = true;
    });
    return saved;
  }
  async function deleteMappings(group: {
    provider: string;
    account: string;
    paymentMappings: Array<
      Pick<PaymentAccount, "payment" | "match" | "description">
    >;
    rules: Array<
      Pick<CounterpartyAccount, "kind" | "match" | "pattern" | "description">
    >;
  }) {
    if (!canWrite) return false;
    let deleted = false;
    await run("删除账户关联…", async () => {
      const value = await request<{
        paymentAccounts: Detail["paymentAccounts"];
        counterpartyAccounts: NonNullable<Detail["counterpartyAccounts"]>;
        configRevision: string;
        removed: number;
      }>("delete-mapping-group", {
        ...group,
        configRevision: detail?.configRevision ?? catalog?.configRevision,
      });
      const settings = {
        paymentAccounts: value.paymentAccounts,
        counterpartyAccounts: value.counterpartyAccounts,
        configRevision: value.configRevision,
      };
      setDetail((current) => (current ? { ...current, ...settings } : current));
      setCatalog((current) =>
        current ? { ...current, ...settings } : current,
      );
      setNotice(
        `已删除 ${group.account} 的 ${value.removed} 条账户关联并提交 Git。`,
      );
      deleted = true;
    });
    return deleted;
  }
  async function reorderMappings(ruleIds: string[]) {
    if (!canWrite) return false;
    let reordered = false;
    await run("保存规则优先级…", async () => {
      const value = await request<{
        paymentAccounts: Detail["paymentAccounts"];
        counterpartyAccounts: NonNullable<Detail["counterpartyAccounts"]>;
        configRevision: string;
        detail?: Detail;
      }>("reorder-mappings", {
        ruleIds,
        configRevision: detail?.configRevision ?? catalog?.configRevision,
        ...(detail && editable
          ? {
              id: detail.batch.id,
              revision: detail.revision,
              rows: detail.batch.rows,
            }
          : {}),
      });
      const settings = {
        paymentAccounts: value.paymentAccounts,
        counterpartyAccounts: value.counterpartyAccounts,
        configRevision: value.configRevision,
      };
      if (value.detail) {
        setDetail(value.detail);
        setSavedRows(value.detail.batch.rows);
      } else {
        setDetail((current) =>
          current ? { ...current, ...settings } : current,
        );
      }
      setCatalog((current) =>
        current ? { ...current, ...settings } : current,
      );
      setNotice("规则优先级已保存；同一账户侧按从上到下首条命中生效。");
      reordered = true;
    });
    return reordered;
  }
  const filtered = useMemo(
    () =>
      reviewRows.filter(
        (r) =>
          matchesColumnFilters(r, columnFilters, refundKinds) &&
          `${r.payee} ${r.description} ${r.orderId} ${r.amount}`
            .toLowerCase()
            .includes(search.trim().toLowerCase()) &&
          (["aiSuccess", "aiFailed", "aiPending"].includes(filter)
            ? classificationViewIds.has(r.id)
            : [
                  "aiResults",
                  "aiClassified",
                  "aiUnclassified",
                  "aiUnprocessed",
                ].includes(filter)
              ? matchesAiResult(r, filter, aiFailureIds)
              : filter === "reviewRequired"
                ? pendingReviewIds.has(r.id)
                : filter === "pending"
                  ? !r.committedAt && !r.notImported
                  : filter === "committed"
                    ? !!r.committedAt
                    : filter === "notImported"
                      ? !!r.notImported && !r.committedAt
                      : filter === "locked"
                        ? !!r.locked
                        : filter === "duplicates"
                          ? r.duplicates.length > 0
                          : filter === "selected"
                            ? selectedIds.has(r.id)
                            : filter === "selectedUnmapped"
                              ? selectedMissingIds.has(r.id)
                              : filter === "unmapped"
                                ? needsAccountMapping(r)
                                : filter === "warnings"
                                  ? hasReviewWarnings(r) &&
                                    (!warningTypes.length ||
                                      warningTypes.some((type) =>
                                        matchesReviewWarning(r, type),
                                      ))
                                  : filter === "neutral"
                                    ? r.direction === "不计收支"
                                    : [
                                          "allRefunds",
                                          "fullRefunds",
                                          "refunds",
                                        ].includes(filter)
                                      ? matchesReview(r, filter, refundKinds)
                                      : true),
      ),
    [
      reviewRows,
      search,
      filter,
      columnFilters,
      refundKinds,
      warningTypes,
      pendingReviewIds,
      selectedMissingIds,
      selectedIds,
      classificationViewIds,
      batch?.classification,
      aiFailureIds,
    ],
  );
  function updateFilter(value: string) {
    setFilter(value);
    setPage(0);
  }
  function updateExcludeCompleted(value: boolean) {
    setExcludeCompletedPreference(value);
    if (value && completedView) setFilter("all");
    setPage(0);
  }
  function showReviewIssues(
    value: "reviewRequired" | "selectedUnmapped" | "selected",
  ) {
    setSearch("");
    setColumnFilters(emptyColumnFilters);
    setWarningTypes([]);
    setFilter(value);
    setPage(0);
  }
  function showClassificationRows(kind: "success" | "failed" | "pending") {
    if (!batch?.classification) return;
    setSearch("");
    setColumnFilters(emptyColumnFilters);
    setWarningTypes([]);
    setFilter(
      kind === "success"
        ? "aiSuccess"
        : kind === "failed"
          ? "aiFailed"
          : "aiPending",
    );
    setPage(0);
  }
  function filterWarnings(types: ReviewWarningType[]) {
    setWarningTypes(types);
    setFilter("warnings");
    setPage(0);
  }
  function updateColumnFilters(patch: Partial<ColumnFilters>) {
    setColumnFilters((current) => ({ ...current, ...patch }));
    setPage(0);
  }
  function setColumnFilterExcluded(key: FilterKey, excluded: boolean) {
    setColumnFilters((current) => ({
      ...current,
      excluded: excluded
        ? [...new Set([...current.excluded, key])]
        : current.excluded.filter((value) => value !== key),
    }));
    setPage(0);
  }
  function clearColumnFilters() {
    setColumnFilters(emptyColumnFilters);
    setPage(0);
  }
  function clearColumnFilter(key: FilterKey) {
    setColumnFilters((current) => withoutColumnFilter(current, key));
    setPage(0);
  }
  const filterLabels = columnFilterLabels(columnFilters);
  const hasColumnFilters = filterLabels.length > 0;
  const filteredGroups = useMemo(() => {
    const matchingIds = new Set(filtered.map((row) => row.id));
    const visibleIds = new Set(reviewRows.map((row) => row.id));
    return transactionGroups
      .filter((group) => group.rows.some((row) => matchingIds.has(row.id)))
      .map((group) => {
        const visibleRows = group.rows.filter((row) => visibleIds.has(row.id));
        return visibleRows.length === group.rows.length
          ? group
          : { ...group, rows: visibleRows, summaryRows: group.rows };
      });
  }, [transactionGroups, filtered, reviewRows]);
  const sortedFilteredGroups = useMemo(
    () => sortTransactionGroups(filteredGroups, columnFilters.collapsedSort),
    [filteredGroups, columnFilters.collapsedSort],
  );
  const notImportedCount = rows.filter(
    (r) => r.notImported && !r.committedAt,
  ).length;
  const pendingCount = rows.filter(
    (r) => !r.notImported && !r.committedAt,
  ).length;
  const missing = selectedMissingIds.size;
  const unmappedCount = reviewRows.filter(needsAccountMapping).length;
  function reviewPendingTransactions() {
    if (!editable || !pendingReviewIds.size) return;
    const duplicateIds = new Set(
      selected
        .filter((r) => r.duplicates.length && !r.duplicateReviewed)
        .map((r) => r.id),
    );
    const statusIds = new Set(
      selected
        .filter((row) => requiresStatusReview(row) && !row.statusReviewed)
        .map((row) => row.id),
    );
    if (duplicateIds.size) editMany(duplicateIds, { duplicateReviewed: true });
    if (statusIds.size) editMany(statusIds, { statusReviewed: true });
    setNotice(
      missing
        ? `已核对 ${pendingReviewIds.size} 笔交易；仍有 ${missing} 笔交易缺少账户，请补齐后再入账。`
        : `已核对 ${pendingReviewIds.size} 笔交易，可以确认入账。`,
    );
  }
  function changePageSize(value: number | null) {
    if (
      value === pageSize ||
      (value !== null && (!Number.isSafeInteger(value) || value < 1))
    )
      return;
    setPageSize(value);
    setPage(0);
  }
  const pageCount =
    pageSize === null
      ? 1
      : Math.max(1, Math.ceil(sortedFilteredGroups.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const pageGroups =
    pageSize === null
      ? sortedFilteredGroups
      : sortedFilteredGroups.slice(
          safePage * pageSize,
          (safePage + 1) * pageSize,
        );
  const pageRows = pageGroups.flatMap((group) => group.rows);
  const relatedCount =
    sortedFilteredGroups.reduce(
      (count, group) => count + group.rows.length,
      0,
    ) - filtered.length;

  function prepareClassification() {
    if (!batch || !canWrite || busy || batch.locked || classifying.current)
      return;
    setClassificationMinimized(false);
    if (classificationActive) {
      setClassificationProgress(batch.classification!);
      return;
    }
    setClassificationProgress({
      phase: "ready",
      total: aiCandidates.length,
      skipped: selected.length - aiCandidates.length,
      processed: 0,
      succeeded: 0,
      failed: 0,
      failures: [],
      candidateIds: aiCandidates.map((row) => row.id),
      succeededIds: [],
      batch: 0,
      batches: Math.ceil(aiCandidates.length / 50),
      batchSize: 50,
      error: "",
    });
  }
  async function classify() {
    if (
      !detail ||
      !editable ||
      classifying.current ||
      accountPanelState.getSnapshot() ||
      !classificationState.getSnapshot()
    )
      return;
    classifying.current = true;
    const current = epoch.current;
    const pending = classificationState.getSnapshot();
    let started = false;
    setClassificationProgress((progress) =>
      progress ? { ...progress, phase: "classifying", batch: 1 } : null,
    );
    try {
      await run("创建后台 AI 分类任务…", async () => {
        const value = await request<Detail>("start-classification", {
          id: detail.batch.id,
          revision: detail.revision,
          rows: detail.batch.rows,
        });
        if (current !== epoch.current) return;
        started = true;
        setDetail(value);
        setSavedRows(value.batch.rows);
        setClassificationProgress(value.batch.classification ?? null);
        if (!classificationRunning(value.batch.classification))
          clearClassificationView(ledgerId, value.batch.id);
      });
      if (current === epoch.current && !started)
        setClassificationProgress(pending);
    } finally {
      if (current === epoch.current) classifying.current = false;
    }
  }
  function closeClassificationProgress() {
    if (classificationRunning(classificationState.getSnapshot()))
      setClassificationMinimized(true);
    else {
      setClassificationProgress(null);
      classificationDisplay.setSnapshot(null);
      if (batch) clearClassificationView(ledgerId, batch.id);
    }
  }
  const counterpartyAccounts =
    detail?.counterpartyAccounts ?? catalog?.counterpartyAccounts ?? [];
  function openDescriptionPanel(row: Row) {
    if (
      !editable ||
      row.locked ||
      row.committedAt ||
      !row.description.trim() ||
      !batch
    )
      return;
    setError("");
    setAccountPanel({
      mode: "description",
      descriptionScope: "all",
      context: "row",
      rowId: row.id,
      payments: [],
      counterparties: [],
      kind: counterpartyKind(row),
      match: "exact",
      pattern: "",
      descriptionMatch: "contains",
      descriptionPattern: row.description.trim(),
      account: row.targetAccount,
      date: rows.map((item) => item.date).sort()[0],
    });
  }
  function openCounterpartyPanel(row: Row, currentAccount = "") {
    if (
      !editable ||
      row.locked ||
      row.committedAt ||
      (!row.payee && !row.description) ||
      !batch
    )
      return;
    const kind = counterpartyKind(row);
    const rule = sortCounterpartyRules(counterpartyAccounts).find(
      (item) =>
        item.provider === batch.provider &&
        !item.description &&
        ruleMatches(item, row),
    );
    setError("");
    setAccountPanel({
      mode: "counterparty",
      context: "row",
      payments: [],
      counterparties: [row.payee],
      rowId: row.id,
      kind,
      match: rule?.match ?? "exact",
      pattern: rule?.pattern ?? row.payee,
      descriptionMatch: "contains",
      descriptionPattern: "",
      account: currentAccount || rule?.account || row.targetAccount,
      date: rows.map((item) => item.date).sort()[0],
    });
  }
  async function setLock(locked: boolean) {
    if (!detail) return;
    await run(locked ? "锁定审核…" : "解锁审核…", async () => {
      const value = await request<Detail>("set-lock", {
        id: detail.batch.id,
        revision: detail.revision,
        rows: detail.batch.rows,
        locked,
      });
      setDetail(value);
      setSavedRows(value.batch.rows);
      setCatalog(await request<Catalog>());
      setNotice(
        locked
          ? "审核已锁定，解锁后可继续修改。"
          : "已解锁，可继续审核未入账交易。",
      );
    });
  }
  async function setImportStatus(notImported: boolean, rowIds: string[]) {
    if (!detail || !editable) return;
    const requestedIds = new Set(rowIds);
    const ids = new Set(
      detail.batch.rows
        .filter((row) => requestedIds.has(row.id) && !row.committedAt)
        .map((row) => row.id),
    );
    if (!ids.size) return;
    setBulkSelectionUndo(null);
    await run(
      notImported ? "标记不导入并锁定…" : "恢复可导入并解锁…",
      async () => {
        const value = await request<Detail>("set-import-status", {
          id: detail.batch.id,
          revision: detail.revision,
          notImported,
          rowIds: [...ids],
          rows: detail.batch.rows,
        });
        setDetail(value);
        setSavedRows(value.batch.rows);
        setCatalog(await request<Catalog>());
        setNotice(
          notImported
            ? `已将 ${ids.size} 笔交易标记为不导入并锁定。`
            : `已恢复 ${ids.size} 笔交易为可导入并解锁，请勾选需要入账的交易。`,
        );
      },
    );
  }
  async function markSelectedNotImported() {
    await setImportStatus(
      true,
      selected.map((row) => row.id),
    );
  }

  return {
    catalog,
    detail,
    batch,
    rows,
    reviewRows,
    refundKinds,
    busy,
    error,
    notice,
    dirty,
    search,
    setSearch: updateSearch,
    filter,
    setFilter: updateFilter,
    excludeCompleted,
    setExcludeCompleted: updateExcludeCompleted,
    warningTypes,
    setWarningTypes,
    filterWarnings,
    bulkSelectionUndo,
    recordBulkSelectionUndo,
    undoBulkSelection,
    columnFilters,
    updateColumnFilters,
    setColumnFilterExcluded,
    clearColumnFilters,
    clearColumnFilter,
    hasColumnFilters,
    filterLabels,
    page,
    setPage,
    pageSize,
    changePageSize,
    confirmCommit,
    setConfirmCommit,
    accountPanelState,
    setAccountPanel,
    editable,
    open,
    importExisting,
    upload,
    deleteDraft,
    edit,
    editMany,
    save,
    accounts,
    paymentAccounts,
    counterpartyAccounts,
    openAccountPanel,
    openAccountLinking,
    openCounterpartyPanel,
    openDescriptionPanel,
    createAccount,
    linkAccount,
    deleteMappings,
    reorderMappings,
    filtered,
    selected,
    clearSelectedTransactions,
    showSelectedTransactions: () => showReviewIssues("selected"),
    notImportedCount,
    pendingCount,
    missing,
    unmappedCount,
    pendingReviewCount: pendingReviewIds.size,
    setImportStatus,
    markSelectedNotImported,
    showPendingReview: () => showReviewIssues("reviewRequired"),
    showMissingSelectedAccounts: () => showReviewIssues("selectedUnmapped"),
    reviewPendingTransactions,
    pageCount,
    safePage,
    pageRows,
    relatedCount,
    pageGroups,
    selectedMissingFundingCount: selected.filter((row) => !row.sourceAccount)
      .length,
    classificationState,
    classificationDisplay,
    setClassificationMinimized,
    classificationActive,
    aiFailureIds,
    showClassificationRows,
    classificationCandidateCount: aiCandidates.length,
    prepareClassification,
    closeClassificationProgress,
    classify,
    setLock,
  };
}
export type PaymentsController = ReturnType<typeof usePayments>;
