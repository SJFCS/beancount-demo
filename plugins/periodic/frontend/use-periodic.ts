import { useEffect, useState } from "react";
import type { Api, PeriodicGenerationMode, View } from "./types";

export function usePeriodic({ ledgerId, api }: { ledgerId: string; api: Api }) {
  const [view, setView] = useState<View | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function request(signal?: AbortSignal): Promise<View> {
    const response = await api.fetchLocal(
      `/api-gateway/local/plugins/periodic/api?ledgerId=${encodeURIComponent(ledgerId)}`,
      signal === undefined ? undefined : { signal },
    );
    const payload = (await response.json()) as View & { error?: string };
    if (!response.ok) throw new Error(payload.error || "请求失败");
    return payload;
  }

  useEffect(() => {
    const controller = new AbortController();
    setView(null);
    setError("");
    setNotice("");
    void request(controller.signal)
      .then((value) => {
        if (!controller.signal.aborted) setView(value);
      })
      .catch((cause) => {
        if (!controller.signal.aborted) {
          setError(cause instanceof Error ? cause.message : String(cause));
        }
      });
    return () => controller.abort();
  }, [ledgerId, api]);

  async function reload() {
    if (busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const value = await request();
      setView(value);
      setNotice("已重新读取账本元数据与内存计划。");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  }

  async function setMode(mode: PeriodicGenerationMode) {
    if (busy || view?.mode === mode) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const response = await api.fetchLocal(
        "/api-gateway/local/plugins/periodic/api/mode",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            ledgerId,
            revision: view?.revision ?? "",
            mode,
          }),
        },
      );
      const payload = (await response.json()) as View & { error?: string };
      if (!response.ok) throw new Error(payload.error || "保存生成策略失败");
      setView(payload);
      setNotice("生成策略已保存到本地插件配置，内存分录已按新模式重算。");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  }

  async function setRuleEnabled(ruleKey: string, enabled: boolean) {
    if (busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const response = await api.fetchLocal(
        "/api-gateway/local/plugins/periodic/api/rule",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            ledgerId,
            revision: view?.revision ?? "",
            ruleKey,
            enabled,
          }),
        },
      );
      const payload = (await response.json()) as View & { error?: string };
      if (!response.ok) throw new Error(payload.error || "保存规则开关失败");
      setView(payload);
      setNotice(
        enabled
          ? "规则已启用，内存计划已重新计算。"
          : "规则已停用，将从内存计划中排除。",
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  }

  return {
    view,
    plan: view?.plan ?? null,
    issues: view?.issues ?? [],
    busy,
    error,
    notice,
    reload,
    setMode,
    setRuleEnabled,
  };
}
