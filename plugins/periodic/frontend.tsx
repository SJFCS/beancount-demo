import { useMemo, useState } from "react";
import {
  EmptyState,
  Icon,
  PanelHeading,
  StatCard,
} from "./frontend/components";
import {
  GENERATION_MODE_OPTIONS,
  KIND_LABELS,
  formatMoney,
  formatNumber,
  frequencyLabel,
  generationModeOption,
} from "./frontend/model";
import { ScheduleChart } from "./frontend/schedule-chart";
import { ScheduleTable } from "./frontend/schedule-table";
import { STYLES } from "./frontend/styles";
import { usePeriodic } from "./frontend/use-periodic";
import type { PeriodicRule, Props, ScheduleRow } from "./frontend/types";

function currencyRows(rows: ScheduleRow[], currency: string): ScheduleRow[] {
  return rows.filter((row) => row.currency === currency);
}

function RuleCard({
  rule,
  index,
  busy,
  canWrite,
  onToggle,
}: {
  rule: PeriodicRule;
  index: number;
  busy: boolean;
  canWrite: boolean;
  onToggle(ruleKey: string, enabled: boolean): void;
}) {
  const [expanded, setExpanded] = useState(false);
  const derivedAccount = (derived: boolean) =>
    derived ? (
      <span
        className="pr-tag"
        title="元数据没有显式指定该账户，由插件按账户命名规则自动推导"
      >
        按命名推导
      </span>
    ) : null;
  return (
    <article
      className={`pr-rule${expanded ? " is-expanded" : ""}${
        rule.enabled ? "" : " is-disabled"
      }`}
    >
      <div className="pr-rule-head">
        <button
          type="button"
          className="pr-rule-main"
          aria-expanded={expanded}
          aria-controls={`${rule.id}-details`}
          onClick={() => setExpanded((value) => !value)}
        >
          <span className="pr-rule-number">{index + 1}</span>
          <span className="pr-rule-title">
            <strong>{rule.name}</strong>
            <small>{rule.meta}</small>
          </span>
          <span
            className={`pr-status ${rule.enabled ? "is-ready" : "is-disabled"}`}
          >
            {rule.enabled ? KIND_LABELS[rule.kind] : "已停用"}
          </span>
          <span className={`pr-rule-chevron${expanded ? " is-open" : ""}`}>
            <Icon name="chevron" size={14} />
          </span>
        </button>
        <label
          className={`pr-rule-switch${rule.enabled ? " is-on" : ""}`}
          title={
            canWrite
              ? `${rule.enabled ? "停用" : "启用"}规则“${rule.name}”`
              : "只读账本不能修改规则开关"
          }
        >
          <input
            type="checkbox"
            role="switch"
            checked={rule.enabled}
            disabled={busy || !canWrite}
            aria-label={`${rule.name} 规则开关`}
            onChange={(event) => onToggle(rule.ruleKey, event.target.checked)}
          />
          <span className="pr-rule-switch-track" aria-hidden="true" />
          <span className="pr-rule-switch-copy" aria-hidden="true">
            {rule.enabled ? "启用" : "停用"}
          </span>
        </label>
      </div>
      {expanded ? (
        <div className="pr-rule-body" id={`${rule.id}-details`}>
          {!rule.enabled ? (
            <div className="pr-rule-disabled-note">
              <Icon name="warning" />
              <span>
                规则已停用：原交易保持不动，不生成分期，也不参与图表和统计。
              </span>
            </div>
          ) : null}
          {rule.warnings.length > 0 ? (
            <div className="pr-rule-warnings">
              <Icon name="warning" />
              <span>{rule.warnings.join("；")}</span>
            </div>
          ) : null}
          <div className="pr-rule-facts">
            <div className="pr-rule-fact">
              <span>周期</span>
              <strong>
                {frequencyLabel(rule.frequency, rule.stepCount)} ·{" "}
                {rule.periods} 期
              </strong>
              <small>
                {rule.startDate} → {rule.endDate}
              </small>
            </div>
            <div className="pr-rule-fact">
              <span>计划总额</span>
              <strong>{formatMoney(rule.amount, rule.currency)}</strong>
              <small>
                原 posting {formatMoney(rule.postingAmount, rule.currency)}
                {rule.splitOriginalPosting
                  ? ` · 未分摊 ${formatMoney(
                      Number(rule.postingAmount) - Number(rule.amount),
                      rule.currency,
                    )}`
                  : ""}
                {" · "}残值 {formatMoney(rule.residualValue, rule.currency)}
              </small>
            </div>
            <div className="pr-rule-fact">
              <span>来源账户 {derivedAccount(rule.derivedSource)}</span>
              <code>{rule.sourceAccount}</code>
              <small>
                {rule.splitOriginalPosting
                  ? "原 posting 会拆分，仅分摊总额转入此账户"
                  : rule.replaceOriginalPosting
                    ? "原交易 posting 会转入此账户"
                    : "原交易保持原账户"}
              </small>
            </div>
            <div className="pr-rule-fact">
              <span>目标账户 {derivedAccount(rule.derivedExpense)}</span>
              <code>{rule.expenseAccount}</code>
              <small>每期从来源转入此费用或收入账户</small>
            </div>
            <div className="pr-rule-fact is-wide">
              <span>元数据位置</span>
              <code>
                {rule.transactionDate} · {rule.postingAccount}
              </code>
              <small>
                {rule.dayWeighted ? "按实际天数分摊" : "等额分摊"}
                {rule.note ? ` · ${rule.note}` : ""}
              </small>
            </div>
            <div className="pr-rule-fact is-wide">
              <span>配置键</span>
              <code>{rule.ruleKey}</code>
              <small>停用状态保存在 plugins.periodic.disabled_rules</small>
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
}

export default function PeriodicPlugin({
  ledgerId,
  primaryCurrency,
  canWrite,
  api,
}: Props) {
  const controller = usePeriodic({ ledgerId, api });
  const {
    view,
    plan,
    issues,
    busy,
    error,
    notice,
    reload,
    setMode,
    setRuleEnabled,
  } = controller;
  const rows = plan?.rows ?? [];
  const currencies = plan?.currencies ?? [];
  const chartCurrency = useMemo(() => {
    return currencies.includes(primaryCurrency)
      ? primaryCurrency
      : (currencies[0] ?? primaryCurrency);
  }, [currencies, primaryCurrency]);
  const chartRows = currencyRows(rows, chartCurrency);
  const rules = view?.rules ?? [];
  const disabledRules = rules.filter((rule) => !rule.enabled).length;
  const ruleGroups = (["amortization", "depreciation"] as const).map(
    (kind) => ({
      kind,
      rules: rules.filter((rule) => rule.kind === kind),
    }),
  );
  const rulesForCurrency = (plan?.rules ?? []).filter(
    (rule) => rule.currency === chartCurrency,
  );
  const totalOpening = rulesForCurrency.reduce(
    (total, rule) =>
      total +
      Math.max(Number(rule.totalAmount) - Number(rule.residualValue), 0),
    0,
  );
  const residual = rulesForCurrency.reduce(
    (total, rule) => total + Number(rule.residualValue || 0),
    0,
  );
  const next = view?.next ?? null;
  const readOnly = !canWrite;

  if (!view) {
    return (
      <section className="pr-shell">
        <style>{STYLES}</style>
        <div className="pr-page">
          <div className={`pr-message ${error ? "is-error" : "is-loading"}`}>
            {error ? (
              <>
                <Icon name="warning" />
                {error}
              </>
            ) : (
              "正在读取账本元数据并计算内存计划…"
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="pr-shell">
      <style>{STYLES}</style>
      <div className="pr-page">
        <header className="pr-hero">
          <div className="pr-hero-copy">
            <span className="pr-eyebrow">
              <i aria-hidden="true" />
              METADATA LEDGER
            </span>
            <h1>
              摊销<span>/</span>折旧
            </h1>
            <p>
              规则直接来自交易或 posting 上的 <code>amortize</code> /{" "}
              <code>depreciate</code>{" "}
              元数据。插件只读取账本并在内存中计算计划，不再维护 JSON
              配置，也不再生成 Bean 文件。
            </p>
            <div className="pr-hero-tags">
              <span>元数据驱动</span>
              <span>不写账本</span>
              <span>内存分录</span>
              <span>精确尾差</span>
              <span>全局生成策略</span>
            </div>
          </div>
          <div className="pr-hero-actions">
            <div className="pr-save-state" data-dirty={busy}>
              <i aria-hidden="true" />
              {busy ? "正在读取…" : "元数据已同步"}
            </div>
            <div className="pr-action-row">
              <button
                type="button"
                className="pr-btn is-ghost"
                disabled={busy}
                onClick={() => void reload()}
              >
                <Icon name="refresh" />
                重新读取
              </button>
            </div>
          </div>
        </header>

        <section className="pr-generation-control" aria-label="生成策略">
          <div className="pr-generation-copy">
            <span className="pr-panel-eyebrow">Global generation</span>
            <strong>生成策略</strong>
            <small>
              {generationModeOption(view.mode).description} 选择后立即保存到{" "}
              <code>benacount-local.yaml</code> 的{" "}
              <code>plugins.periodic.generation_mode</code>。
            </small>
          </div>
          <div
            className="pr-mode-options"
            role="group"
            aria-label="内存分录生成范围"
          >
            {GENERATION_MODE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={view.mode === option.value}
                disabled={busy || !canWrite}
                title={option.description}
                onClick={() => void setMode(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>

        {readOnly ? (
          <div className="pr-message is-warning" role="status">
            <Icon name="warning" />
            当前账本为只读。此页面不会写入账本，也无法修改全局生成策略，
            但仍可查看元数据规则和内存计划。
          </div>
        ) : null}
        {view.ledgerError ? (
          <div className="pr-message is-error" role="alert">
            <Icon name="warning" />
            <div>
              <strong>账本解析存在错误</strong>
              <p>{view.ledgerError}</p>
              <small>
                规则仍在可解析的部分中读取；修复账本后点击“重新读取”。
              </small>
            </div>
          </div>
        ) : null}
        {error && !view.ledgerError ? (
          <div className="pr-message is-error" role="alert">
            <Icon name="warning" />
            {error}
          </div>
        ) : null}
        {notice ? (
          <div className="pr-message is-ok" role="status">
            <Icon name="check" />
            {notice}
          </div>
        ) : null}
        {issues.length > 0 ? (
          <div className="pr-message is-warning" role="status">
            <Icon name="warning" />
            <div>
              <strong>{issues.length} 条元数据未能生成计划</strong>
              <p>
                {issues
                  .slice(0, 3)
                  .map((issue) =>
                    issue.name
                      ? `${issue.name}：${issue.message}`
                      : issue.message,
                  )
                  .join("；")}
              </p>
            </div>
          </div>
        ) : null}

        <div className="pr-stats">
          <StatCard
            label="识别到的规则"
            value={String(view.summary.rules)}
            note={`${chartCurrency} · ${disabledRules} 条停用 · 当前策略 ${formatNumber(
              chartRows.length,
              0,
            )} 期`}
            tone="teal"
          />
          <StatCard
            label="可分摊金额"
            value={formatMoney(totalOpening, chartCurrency)}
            note="原始金额减预计残值"
            tone="amber"
          />
          <StatCard
            label="期末残值"
            value={formatMoney(residual, chartCurrency)}
            note="折旧为预计回收；摊销通常为 0"
            tone="ruby"
          />
          <StatCard
            label="下一期"
            value={next ? next.date : "已完成"}
            note={
              next
                ? `${next.ruleName} · ${formatMoney(next.amount, next.currency)}${
                    view.mode === "pending"
                      ? " · 未入账"
                      : view.mode === "through_today"
                        ? " · 未来待生成"
                        : ""
                  }`
                : "当前没有未来分期"
            }
            tone="ink"
          />
        </div>

        <ScheduleChart
          rules={plan?.rules ?? []}
          rows={plan?.rows ?? []}
          currencies={currencies}
          primaryCurrency={primaryCurrency}
          updating={busy}
        />

        <div className="pr-main-grid">
          <section className="pr-panel pr-rules-panel">
            <PanelHeading
              eyebrow="Metadata rules"
              title="识别到的规则"
              description="摊销与折旧规则分组同时展示，每条规则可独立启用或停用；默认折叠，点击规则标题查看账户与计划明细。开关保存在本地插件配置中。"
            />
            {rules.length === 0 ? (
              <EmptyState title="还没有识别到周期规则">
                在交易的 posting 上添加 <code>amortize: "1 Year /Monthly"</code>{" "}
                或 <code>depreciate: "5 Year /Monthly =200"</code>
                ，然后重新读取。
              </EmptyState>
            ) : (
              <div className="pr-rule-groups">
                {ruleGroups.map((group) => (
                  <section className="pr-rule-group" key={group.kind}>
                    <div className="pr-rule-group-head">
                      <strong>{KIND_LABELS[group.kind]}规则</strong>
                      <span>
                        {group.rules.length} 条 ·{" "}
                        {group.rules.filter((rule) => rule.enabled).length} 启用
                      </span>
                    </div>
                    {group.rules.length === 0 ? (
                      <p className="pr-rule-group-empty">
                        暂无{KIND_LABELS[group.kind]}规则
                      </p>
                    ) : (
                      <div className="pr-rule-list">
                        {group.rules.map((rule, index) => (
                          <RuleCard
                            key={rule.id}
                            rule={rule}
                            index={index}
                            busy={busy}
                            canWrite={canWrite}
                            onToggle={(ruleKey, enabled) =>
                              void setRuleEnabled(ruleKey, enabled)
                            }
                          />
                        ))}
                      </div>
                    )}
                  </section>
                ))}
              </div>
            )}
          </section>

          <aside className="pr-side">
            <section className="pr-panel pr-output-panel">
              <PanelHeading
                eyebrow="In memory"
                title="解析状态"
                description="账本文件不被改写；运行时插件把分期交易物化到解析后的内存指令流。"
              />
              <div className="pr-output-body">
                <div className="pr-sync-card in-sync">
                  <Icon name="check" size={20} />
                  <div>
                    <strong>只读预览</strong>
                    <p>
                      不生成 <code>periodic/entries.bean</code>
                      ，也不修改入口文件的 include。
                    </p>
                  </div>
                </div>
                <dl className="pr-output-facts">
                  <div>
                    <dt>规则交易</dt>
                    <dd>{view.summary.transactionsWithRules}</dd>
                  </div>
                  <div>
                    <dt>当前策略分录</dt>
                    <dd>{view.summary.periods}</dd>
                  </div>
                  <div>
                    <dt>账本交易</dt>
                    <dd>{view.summary.transactions}</dd>
                  </div>
                </dl>
                {view.autoOpened.length > 0 ? (
                  <div className="pr-output-file">
                    <span>内存补开账户</span>
                    <code>{view.autoOpened.join(" · ")}</code>
                    <div className="pr-output-state">
                      <span className="pr-state-dot is-on" />
                      仅在解析流中补开，不会写入账户文件
                    </div>
                  </div>
                ) : null}
                {issues.length > 0 ? (
                  <div className="pr-issue-list">
                    {issues.map((issue, index) => (
                      <div className="pr-issue" key={`${issue.date}-${index}`}>
                        <strong>{issue.name ?? "元数据错误"}</strong>
                        <span>{issue.message}</span>
                        {issue.meta ? <code>{issue.meta}</code> : null}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </section>

            <section className="pr-note-card">
              <span>Residual value</span>
              <h3>残值不是现金流。</h3>
              <p>
                折旧的 <code>=200</code> 表示预计转卖或回收价值，折旧总额是“成本
                − 残值”。摊销通常把残值留为
                0；如果预付租金含可退押金，押金应单独记成资产，
                不要把押金当作摊销残值。
              </p>
            </section>
          </aside>
        </div>

        <ScheduleTable rows={plan?.rows ?? []} currency={chartCurrency} />

        <section className="pr-guide">
          <article>
            <b>01</b>
            <h3>写元数据</h3>
            <p>
              把 <code>amortize</code> 或 <code>depreciate</code> 写在对应的
              posting（或交易）上，金额、开始日期和残值都可选。
            </p>
          </article>
          <article>
            <b>02</b>
            <h3>内存计算</h3>
            <p>
              插件读取整本账本，按元数据计算分期；不保存 JSON，不生成 Bean，
              也不再追加 include。
            </p>
          </article>
          <article>
            <b>03</b>
            <h3>尾差与残值</h3>
            <p>
              每期金额按精度四舍五入，最后一期吸收尾差；计划余额期末等于残值，
              显式 total 未纳入计划的部分留在原 posting。
            </p>
          </article>
        </section>
      </div>
    </section>
  );
}
