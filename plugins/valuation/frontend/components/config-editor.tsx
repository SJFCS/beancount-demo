import React from "react";
import type { ConfigDraft, UpdateDraft } from "../types";
import { AccountEditor } from "./account-editor";

export function ConfigEditor({
  draft,
  issues,
  primaryCurrency,
  knownAccounts,
  canWrite,
  saving,
  configDirty,
  configPath,
  exists,
  onSave,
  onReset,
  updateDraft,
}: {
  draft: ConfigDraft | null;
  issues: Map<string, string>;
  primaryCurrency: string;
  knownAccounts: string[];
  canWrite: boolean;
  saving: boolean;
  configDirty: boolean;
  configPath: string;
  exists: boolean;
  onSave: () => void;
  onReset: () => void;
  updateDraft: UpdateDraft;
}) {
  return (
    <section className="ve-config">
      <div className="ve-config-head">
        <div>
          <h2>插件配置</h2>
          <p>
            保存后写入 <code>{configPath}</code>
            ；页面与运行时使用同一份内存转换结果。
          </p>
        </div>
        <div className="ve-actions">
          <button
            type="button"
            className="ve-button"
            disabled={!draft || saving || !configDirty}
            onClick={onReset}
          >
            撤销修改
          </button>
          <button
            type="button"
            className="ve-button primary"
            disabled={
              !draft || saving || !canWrite || !configDirty || issues.size > 0
            }
            onClick={onSave}
          >
            {saving ? "保存中…" : "保存配置"}
          </button>
        </div>
      </div>

      {!draft ? (
        <div className="ve-empty-line">正在读取配置…</div>
      ) : (
        <>
          <div className="ve-config-body">
            {issues.size > 0 ? (
              <div className="ve-alert error">
                配置中有 {issues.size} 处需要修正，修正后才能保存。
              </div>
            ) : null}
            <AccountEditor
              accounts={draft.accounts}
              updateDraft={updateDraft}
              issues={issues}
              primaryCurrency={primaryCurrency}
              knownAccounts={knownAccounts}
            />
          </div>
          <div className="ve-config-foot">
            <span className="ve-muted">
              {exists
                ? "配置已存在；保存会写入账本仓库。"
                : "配置尚不存在；保存后会创建该文件。"}
              {!canWrite ? " 当前账本只读。" : ""}
            </span>
            <span className="ve-muted">
              {issues.size > 0
                ? `${issues.size} 处需要修正`
                : configDirty
                  ? "有未保存修改"
                  : "配置已同步"}
            </span>
          </div>
          <details className="ve-advanced">
            <summary>高级：查看将写入的 JSON</summary>
            <pre>{JSON.stringify(draft, null, 2)}</pre>
          </details>
        </>
      )}
    </section>
  );
}
