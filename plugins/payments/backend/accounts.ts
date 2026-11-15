import path from "node:path";
import { collectSourceFiles } from "@beancount/plugin";
import type { PluginRequest } from "@beancount/plugin";
import {
  counterpartyRuleKey,
  counterpartyKind,
  compareRulePriority,
  fundingAccountRoots,
  mappingRuleId,
  readCounterpartyRuleConditions,
  readDescriptionCondition,
  ruleMatches,
  sortCounterpartyRules,
  validatePattern,
} from "../account-scope";
import type {
  Account,
  PaymentConfig,
  CounterpartyAccount,
  PaymentAccount,
} from "../types";
import { CONFIG_PATH } from "../types";
import { accountFile, clean, ACCOUNT, hash, quote } from "./utils";
import { context, validateChange } from "./context";
import type { Context } from "./context";
import {
  accountAvailable,
  applyPaymentAccounts,
  findPaymentAccount,
  isPaymentMethodValue,
  isPaymentProvider,
  paymentRuleKey,
  paymentRuleMatches,
} from "./mappings";
import { loadBatch, applyEdits, present } from "./batches";
import { matchRefunds } from "./refunds";

type AccountFileChange = {
  path: string;
  content: string;
  expectedSha?: string;
};

function preservePriorities<
  T extends { provider: string; priority?: number; description?: unknown },
>(
  config: PaymentConfig,
  current: T[],
  requested: T[],
  key: (rule: T) => string,
) {
  const all = [
    ...config.paymentAccounts,
    ...(config.counterpartyAccounts ?? []),
  ];
  const priorities = all.flatMap((rule) =>
    rule.priority === undefined ? [] : [rule.priority],
  );
  let nextContentPriority = Math.min(0, ...priorities) - requested.length;
  let nextBasePriority = Math.max(-1, ...priorities) + 1;
  return requested.map((rule) => {
    const previous = current.find(
      (item) => item.provider === rule.provider && key(item) === key(rule),
    );
    const priority = previous
      ? previous.priority
      : priorities.length
        ? rule.description
          ? nextContentPriority++
          : nextBasePriority++
        : undefined;
    return { ...rule, ...(priority === undefined ? {} : { priority }) };
  });
}

function prepareAccountCreation(
  ctx: Context,
  proposed: Record<string, string>,
  changes: AccountFileChange[],
  accountsPath: string,
  requestedName: unknown,
  requestedDate: unknown,
): Account {
  const name = typeof requestedName === "string" ? clean(requestedName) : "";
  if (!ACCOUNT.test(name))
    throw new Error(
      "账户名称无效：每一级须以大写字母、汉字或数字开头，且仅支持字母、数字、汉字或短横线",
    );
  if (ctx.accounts.some((item) => item.name === name))
    throw new Error("该账户已存在，请选择关联已有账户");
  const date = typeof requestedDate === "string" ? requestedDate : "";
  if (
    !/^\d{4}-\d{2}-\d{2}$/u.test(date) ||
    !Number.isFinite(Date.parse(date)) ||
    new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) !== date
  )
    throw new Error("开户日期无效");
  if (accountsPath === ctx.entry) throw new Error("账户文件不能是账本入口文件");
  proposed[accountsPath] =
    (ctx.files[accountsPath] ?? "; 支付账单导入创建的资金账户\n") +
    `\n${date} open ${name} CNY\n`;
  changes.push({
    path: accountsPath,
    content: proposed[accountsPath],
    expectedSha:
      ctx.files[accountsPath] === undefined
        ? undefined
        : hash(ctx.files[accountsPath]),
  });
  if (!collectSourceFiles(proposed, ctx.entry).includes(accountsPath)) {
    proposed[ctx.entry] +=
      `\ninclude ${quote(path.posix.relative(path.posix.dirname(ctx.entry), accountsPath))}\n`;
    changes.push({
      path: ctx.entry,
      content: proposed[ctx.entry],
      expectedSha: hash(ctx.files[ctx.entry]),
    });
  }
  return { name, date, currencies: ["CNY"] };
}

export async function createAccount(request: PluginRequest) {
  const { repository, ledgerId, body } = request;
  const ctx = await context(repository, ledgerId);
  const accountsPath = accountFile(request.settings);
  const proposed = { ...ctx.files };
  const changes: AccountFileChange[] = [];
  const created = prepareAccountCreation(
    ctx,
    proposed,
    changes,
    accountsPath,
    body.account,
    body.date,
  );
  await validateChange(ctx, proposed);
  await repository.writeFiles(ledgerId, changes, {
    commitMessage: `Create account ${created.name}`,
  });
  const refreshed = await context(repository, ledgerId);
  return {
    account:
      refreshed.accounts.find((item) => item.name === created.name) ?? created,
    accounts: refreshed.accounts,
  };
}

export async function linkAccount(request: PluginRequest) {
  const { repository, ledgerId, body } = request;
  const { batch, file, ctx } = await loadBatch(request);
  applyEdits(batch, body.rows);
  if (body.configRevision !== ctx.configRevision)
    throw new Error("缴费方式配置已变化，请重新打开批次后关联");
  const isCounterparty = request.action === "link-counterparty";
  let payments: string[] = [];
  let paymentRules: string[] = [];
  let paymentLinks: Array<
    Pick<PaymentAccount, "payment" | "match" | "description">
  > = [];
  let rules: CounterpartyAccount[] = [];
  const name = typeof body.account === "string" ? clean(body.account) : "";
  const description = readDescriptionCondition(body.description);
  if (isCounterparty) {
    const requested =
      Array.isArray(body.rules) && body.rules.length
        ? body.rules
        : [
            {
              kind: (() => {
                const anchor = batch.rows.find((row) => row.id === body.rowId);
                if (
                  !anchor ||
                  !anchor.payee ||
                  anchor.committedAt ||
                  anchor.locked
                )
                  throw new Error("请选择未锁定且有名字的交易对方");
                return counterpartyKind(anchor);
              })(),
              match: body.match,
              pattern: body.pattern,
              description: body.description,
            },
          ];
    if (requested.length > 100) throw new Error("一次最多关联 100 个交易对方");
    rules = requested.map((item) => {
      if (
        !item ||
        typeof item !== "object" ||
        typeof item.kind !== "string" ||
        ![
          "transfer-income",
          "transfer-expense",
          "income",
          "expense",
          "movement",
        ].includes(item.kind)
      )
        throw new Error("交易对方类型无效");
      const conditions = readCounterpartyRuleConditions(
        item.match,
        item.pattern,
        item.description,
      );
      return {
        provider: batch.provider,
        kind: item.kind as CounterpartyAccount["kind"],
        ...conditions,
        account: name,
      };
    });
    const ruleKeys = new Set<string>();
    for (const rule of rules) {
      const key = counterpartyRuleKey(rule);
      if (ruleKeys.has(key)) throw new Error("交易对方关联规则重复");
      ruleKeys.add(key);
    }
    if (!Array.isArray(body.rules) || !body.rules.length) {
      const anchor = batch.rows.find((row) => row.id === body.rowId);
      if (!anchor || !rules[0] || !ruleMatches(rules[0], anchor))
        throw new Error("匹配规则未命中当前交易对方");
    }
  } else {
    const requestedRules = Array.isArray(body.paymentRules)
      ? body.paymentRules
      : [];
    let requestedPaymentRules: Array<{
      pattern: string;
      description?: PaymentAccount["description"];
    }> = [];
    if (requestedRules.length) {
      if (requestedRules.length > 100)
        throw new Error("一次最多关联 100 条支付方式规则");
      requestedPaymentRules = requestedRules
        .map((item) => {
          if (
            !item ||
            typeof item !== "object" ||
            item.match !== "regex" ||
            typeof item.pattern !== "string"
          )
            throw new Error("支付方式自定义匹配规则无效");
          validatePattern("regex", item.pattern);
          return {
            pattern: item.pattern.trim(),
            description:
              readDescriptionCondition(item.description) ?? description,
          };
        })
        .filter(
          (item, index, items) =>
            items.findIndex(
              (candidate) =>
                candidate.pattern === item.pattern &&
                JSON.stringify(candidate.description ?? null) ===
                  JSON.stringify(item.description ?? null),
            ) === index,
        );
      paymentRules = requestedPaymentRules.map((item) => item.pattern);
    } else {
      if (
        !Array.isArray(body.payments) ||
        !body.payments.length ||
        body.payments.length > 100 ||
        body.payments.some((value) => !isPaymentMethodValue(value))
      )
        throw new Error("请至少选择一种有效的缴费方式");
      payments = [...new Set((body.payments as string[]).map(clean))];
    }
    paymentLinks = [
      ...payments.map((payment) => ({
        payment,
        ...(description ? { description } : {}),
      })),
      ...requestedPaymentRules.map((rule) => ({
        payment: rule.pattern,
        match: "regex" as const,
        ...(rule.description ? { description: rule.description } : {}),
      })),
    ];
    const keys = new Set<string>();
    for (const link of paymentLinks) {
      const key = paymentRuleKey(link);
      if (keys.has(key)) throw new Error("支付方式关联规则重复");
      keys.add(key);
    }
  }
  if (!ACCOUNT.test(name))
    throw new Error(
      `${isCounterparty ? "分类账户" : "资金账户"}必须是有效的 Beancount 账户`,
    );
  if (
    !isCounterparty &&
    !fundingAccountRoots.some((root) => root === name.split(":")[0])
  )
    throw new Error(
      `资金账户必须是有效的 ${fundingAccountRoots.join(" 或 ")} 账户`,
    );
  const matches = (row: (typeof batch.rows)[number]) =>
    !row.committedAt &&
    !row.locked &&
    (rules.length
      ? rules.some((rule) => ruleMatches(rule, row))
      : paymentLinks.some((rule) =>
          paymentRuleMatches(rule, row.payment, row.description),
        ));
  const affected = batch.rows.filter(matches);
  const account = ctx.accounts.find((item) => item.name === name);
  const changes: AccountFileChange[] = [];
  if (!account) throw new Error("账户不存在，请选择已有账户或创建新账户");
  if (
    account.closed ||
    (account.currencies.length && !account.currencies.includes("CNY")) ||
    affected.some((row) => !accountAvailable(account!, row.date))
  )
    throw new Error(
      "该账户已关闭、未在交易日开户或不支持 CNY，请调整账户和开户日期",
    );
  rules = preservePriorities(
    ctx.paymentConfig,
    ctx.paymentConfig.counterpartyAccounts ?? [],
    rules,
    counterpartyRuleKey,
  );
  const requestedPaymentAccounts = preservePriorities(
    ctx.paymentConfig,
    ctx.paymentConfig.paymentAccounts,
    paymentLinks.map(
      (link): PaymentAccount => ({
        provider: batch.provider,
        ...link,
        account: name,
      }),
    ),
    paymentRuleKey,
  );
  const paymentConfig: PaymentConfig = rules.length
    ? {
        ...ctx.paymentConfig,
        counterpartyAccounts: sortCounterpartyRules([
          ...(ctx.paymentConfig.counterpartyAccounts ?? []).filter(
            (item) =>
              item.provider !== batch.provider ||
              !rules.some(
                (rule) =>
                  counterpartyRuleKey(rule) === counterpartyRuleKey(item),
              ),
          ),
          ...rules,
        ]),
      }
    : {
        ...ctx.paymentConfig,
        paymentAccounts: [
          ...ctx.paymentConfig.paymentAccounts.filter(
            (link) =>
              link.provider !== batch.provider ||
              !paymentLinks.some(
                (rule) => paymentRuleKey(rule) === paymentRuleKey(link),
              ),
          ),
          ...requestedPaymentAccounts,
        ].sort(
          (a, b) =>
            compareRulePriority(a, b) ||
            a.provider.localeCompare(b.provider) ||
            (a.match ?? "exact").localeCompare(b.match ?? "exact") ||
            a.payment.localeCompare(b.payment) ||
            paymentRuleKey(a).localeCompare(paymentRuleKey(b)),
        ),
      };
  const priorityRules = sortCounterpartyRules(
    paymentConfig.counterpartyAccounts ?? [],
  );
  batch.rows = batch.rows.map((row) => {
    if (!matches(row)) return row;
    if (rules.length) {
      const winner = priorityRules.find(
        (item) => item.provider === batch.provider && ruleMatches(item, row),
      );
      if (
        !winner ||
        !rules.some(
          (rule) => counterpartyRuleKey(rule) === counterpartyRuleKey(winner),
        )
      )
        return row;
    } else {
      const winner = findPaymentAccount(
        paymentConfig,
        batch.provider,
        clean(row.payment),
        row.description,
      );
      if (
        !winner ||
        !paymentLinks.some(
          (link) => paymentRuleKey(link) === paymentRuleKey(winner),
        )
      )
        return row;
    }
    return {
      ...row,
      ...(rules.length
        ? {
            targetAccount: name,
            confidence: undefined,
            reasoning: undefined,
            aiFallback: undefined,
          }
        : { sourceAccount: name }),
      warnings: row.warnings.filter(
        (warning) =>
          rules.length > 0 || warning !== "请按支付方式选择实际资金账户",
      ),
    };
  });
  batch.rows = matchRefunds(batch).rows;
  changes.push(
    {
      path: CONFIG_PATH,
      content: JSON.stringify(paymentConfig, null, 2) + "\n",
      expectedSha:
        ctx.files[CONFIG_PATH] === undefined ? undefined : ctx.configRevision,
    },
    {
      path: file.path,
      content: JSON.stringify(batch, null, 2) + "\n",
      expectedSha: file.sha256,
    },
  );
  await repository.writeFiles(ledgerId, changes, {
    commitMessage: rules.length
      ? `Create ${rules.length} ${batch.provider} counterparty account mappings to ${name}`
      : paymentRules.length
        ? `Create ${paymentRules.length} ${batch.provider} payment regex account mappings to ${name}`
        : `Create ${payments.length} ${batch.provider} payment account mappings to ${name}`,
  });
  return present(batch, await context(repository, ledgerId));
}

export async function deleteMappingGroup(request: PluginRequest) {
  const { repository, ledgerId, body } = request;
  const ctx = await context(repository, ledgerId);
  if (body.configRevision !== ctx.configRevision)
    throw new Error("账户关联配置已变化，请刷新后重试");

  const provider = body.provider;
  const account = typeof body.account === "string" ? clean(body.account) : "";
  if (!isPaymentProvider(provider) || !ACCOUNT.test(account))
    throw new Error("待删除的账户关联无效");

  const payments = Array.isArray(body.payments) ? body.payments : [];
  if (
    payments.length > 100 ||
    payments.some((value) => !isPaymentMethodValue(value))
  )
    throw new Error("待删除的支付方式关联无效");
  const paymentKeys = new Set(
    (payments as string[]).map((value) => clean(value)),
  );
  const paymentRules = Array.isArray(body.paymentRules)
    ? body.paymentRules
    : [];
  if (
    paymentRules.length > 100 ||
    paymentRules.some(
      (value) =>
        !isPaymentMethodValue(value) || !value.trim() || value !== value.trim(),
    )
  )
    throw new Error("待删除的支付方式自定义规则无效");
  const paymentRuleKeys = new Set(
    (paymentRules as string[]).map((value) => clean(value)),
  );
  const paymentMappings = Array.isArray(body.paymentMappings)
    ? body.paymentMappings
    : [];
  if (paymentMappings.length > 100) throw new Error("待删除的支付方式关联无效");
  const paymentMappingKeys = new Set<string>();
  for (const value of paymentMappings) {
    if (!value || typeof value !== "object")
      throw new Error("待删除的支付方式关联无效");
    const rule = value as Pick<
      PaymentAccount,
      "payment" | "match" | "description"
    >;
    if (
      !isPaymentMethodValue(rule.payment) ||
      (rule.match !== undefined &&
        !["exact", "regex"].includes(String(rule.match)))
    )
      throw new Error("待删除的支付方式关联无效");
    if (rule.match === "regex") validatePattern("regex", rule.payment);
    const description = readDescriptionCondition(rule.description);
    paymentMappingKeys.add(
      paymentRuleKey({
        payment: clean(rule.payment),
        match: rule.match,
        description,
      }),
    );
  }

  const requestedRules = Array.isArray(body.rules) ? body.rules : [];
  if (requestedRules.length > 100)
    throw new Error("一次最多删除 100 条交易对方关联");
  const ruleKeys = new Set<string>();
  for (const value of requestedRules) {
    if (!value || typeof value !== "object")
      throw new Error("待删除的交易对方关联无效");
    const rule = value as Partial<CounterpartyAccount>;
    if (
      ![
        "transfer-income",
        "transfer-expense",
        "income",
        "expense",
        "movement",
      ].includes(String(rule.kind))
    )
      throw new Error("待删除的交易对方类型无效");
    const conditions = readCounterpartyRuleConditions(
      rule.match,
      rule.pattern,
      rule.description,
    );
    ruleKeys.add(
      counterpartyRuleKey({
        kind: rule.kind as CounterpartyAccount["kind"],
        ...conditions,
      }),
    );
  }
  if (
    !paymentKeys.size &&
    !paymentRuleKeys.size &&
    !paymentMappingKeys.size &&
    !ruleKeys.size
  )
    throw new Error("请选择要删除的账户关联");

  const paymentAccounts = ctx.paymentConfig.paymentAccounts.filter(
    (item) =>
      !(
        item.provider === provider &&
        item.account === account &&
        (paymentMappingKeys.size
          ? paymentMappingKeys.has(paymentRuleKey(item))
          : ((item.match ?? "exact") === "exact" &&
              paymentKeys.has(item.payment)) ||
            (item.match === "regex" && paymentRuleKeys.has(item.payment)))
      ),
  );
  const counterpartyAccounts = (
    ctx.paymentConfig.counterpartyAccounts ?? []
  ).filter(
    (item) =>
      !(
        item.provider === provider &&
        item.account === account &&
        ruleKeys.has(counterpartyRuleKey(item))
      ),
  );
  const removed =
    ctx.paymentConfig.paymentAccounts.length -
    paymentAccounts.length +
    (ctx.paymentConfig.counterpartyAccounts?.length ?? 0) -
    counterpartyAccounts.length;
  if (!removed) throw new Error("账户关联已变化，请刷新后重试");

  const next: PaymentConfig = {
    ...ctx.paymentConfig,
    paymentAccounts,
    counterpartyAccounts,
  };
  const content = JSON.stringify(next, null, 2) + "\n";
  await repository.writeFile(
    ledgerId,
    CONFIG_PATH,
    content,
    ctx.configRevision,
    {
      commitMessage: `Delete ${removed} ${provider} account mappings from ${account}`,
    },
  );
  return {
    paymentAccounts,
    counterpartyAccounts,
    configRevision: hash(content),
    removed,
  };
}

export async function reorderMappings(request: PluginRequest) {
  const { repository, ledgerId, body } = request;
  const loaded =
    typeof body.id === "string" ? await loadBatch(request) : undefined;
  const ctx = loaded?.ctx ?? (await context(repository, ledgerId));
  if (body.configRevision !== ctx.configRevision)
    throw new Error("账户关联配置已变化，请刷新后重试");
  const all = [
    ...ctx.paymentConfig.paymentAccounts.map((rule) =>
      mappingRuleId("payment", rule),
    ),
    ...(ctx.paymentConfig.counterpartyAccounts ?? []).map((rule) =>
      mappingRuleId("counterparty", rule),
    ),
  ];
  const requested = body.ruleIds;
  if (
    !Array.isArray(requested) ||
    requested.length !== all.length ||
    requested.some((value) => typeof value !== "string") ||
    new Set(requested).size !== all.length ||
    all.some((id) => !requested.includes(id))
  )
    throw new Error("排序必须包含全部已保存账户关联，且每条规则仅出现一次");
  const priorities = new Map<string, number>(
    (requested as string[]).map((id, index) => [id, index]),
  );
  const paymentAccounts = ctx.paymentConfig.paymentAccounts
    .map((rule) => ({
      ...rule,
      priority: priorities.get(mappingRuleId("payment", rule))!,
    }))
    .sort(compareRulePriority);
  const counterpartyAccounts = (ctx.paymentConfig.counterpartyAccounts ?? [])
    .map((rule) => ({
      ...rule,
      priority: priorities.get(mappingRuleId("counterparty", rule))!,
    }))
    .sort(compareRulePriority);
  const paymentConfig: PaymentConfig = {
    ...ctx.paymentConfig,
    paymentAccounts,
    counterpartyAccounts,
  };
  const content = JSON.stringify(paymentConfig, null, 2) + "\n";
  const configRevision = hash(content);
  const nextContext = {
    ...ctx,
    paymentConfig,
    configRevision,
    files: { ...ctx.files, [CONFIG_PATH]: content },
  };
  const changes: AccountFileChange[] = [
    {
      path: CONFIG_PATH,
      content,
      expectedSha:
        ctx.files[CONFIG_PATH] === undefined ? undefined : ctx.configRevision,
    },
  ];
  let batch = loaded?.batch;
  if (loaded && batch) {
    applyEdits(batch, body.rows);
    const previousRows = batch.rows;
    batch = applyPaymentAccounts(batch, nextContext, true);
    batch.rows = batch.rows.map((row, index) =>
      row.targetAccount === previousRows[index].targetAccount
        ? row
        : {
            ...row,
            confidence: undefined,
            reasoning: undefined,
            aiFallback: undefined,
          },
    );
    batch.rows = matchRefunds(batch).rows;
    changes.push({
      path: loaded.file.path,
      content: JSON.stringify(batch, null, 2) + "\n",
      expectedSha: loaded.file.sha256,
    });
  }
  await repository.writeFiles(ledgerId, changes, {
    commitMessage: "Reorder payment account mapping rules",
  });
  return {
    paymentAccounts,
    counterpartyAccounts,
    configRevision,
    ...(batch ? { detail: await present(batch, nextContext) } : {}),
  };
}
