import { createHash } from "node:crypto";
import type { LocalPluginBackend } from "@beancount/plugin";
import {
  upgradeFireConfig,
  validateFireConfig,
  type FireConfig,
} from "./model";

export const FIRE_PLAN_FILE = "plugins/fire_calculator/plan.json";

/** One named scenario. `config` is a complete FireConfig snapshot. */
export type FirePlan = {
  id: string;
  name: string;
  config: FireConfig;
};

type PlansView = {
  revision: string;
  activeId: string | null;
  plans: FirePlan[];
  exists: boolean;
  error: string | null;
};

const FILE_VERSION = 2;

function hash(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function parseConfig(raw: unknown): FireConfig {
  if (!isRecord(raw)) throw new Error("方案必须是对象");
  const plan = upgradeFireConfig(raw as FireConfig);
  const issues = validateFireConfig(plan);
  if (issues.length > 0) throw new Error(issues.join("；"));
  return plan;
}

function normalizeName(value: unknown): string {
  if (typeof value !== "string") throw new Error("方案名称必须是字符串");
  const name = value.trim();
  if (name.length === 0) throw new Error("方案名称不能为空");
  if (name.length > 60) throw new Error("方案名称过长");
  return name;
}

/**
 * Reads either the multi-plan file format (`{version, activeId, plans}`) or a
 * legacy bare FireConfig and normalizes it into a plan list.
 */
function parseFile(source: string): {
  activeId: string | null;
  plans: FirePlan[];
} {
  const raw = JSON.parse(source) as unknown;
  if (!isRecord(raw)) throw new Error("plan.json 内容必须是 JSON 对象");
  if (Array.isArray(raw.plans)) {
    const seen = new Set<string>();
    const plans = raw.plans.map((entry, index) => {
      if (!isRecord(entry)) throw new Error(`第 ${index + 1} 套方案格式无效`);
      if (typeof entry.id !== "string" || entry.id.trim().length === 0)
        throw new Error(`第 ${index + 1} 套方案缺少编号`);
      if (seen.has(entry.id)) throw new Error("方案编号重复");
      seen.add(entry.id);
      return {
        id: entry.id,
        name: normalizeName(entry.name),
        config: parseConfig(entry.config),
      };
    });
    const activeId =
      typeof raw.activeId === "string" &&
      raw.activeId.length > 0 &&
      seen.has(raw.activeId)
        ? raw.activeId
        : (plans[0]?.id ?? null);
    return { activeId, plans };
  }
  // Legacy format: the file itself is a single FireConfig.
  const config = parseConfig(raw);
  return {
    activeId: "plan-1",
    plans: [{ id: "plan-1", name: "方案 1", config }],
  };
}

async function readView(
  repository: Parameters<LocalPluginBackend["handle"]>[0]["repository"],
  ledgerId: string,
  settings: Record<string, unknown>,
): Promise<PlansView> {
  if (settings.enabled !== true) throw new Error("FIRE 模拟器插件尚未启用");
  const files = await repository.readFileMap(ledgerId);
  const source = files[FIRE_PLAN_FILE];
  if (source === undefined) {
    return {
      revision: hash(""),
      activeId: null,
      plans: [],
      exists: false,
      error: null,
    };
  }
  try {
    const { activeId, plans } = parseFile(source);
    return {
      revision: hash(source),
      activeId,
      plans,
      exists: true,
      error: null,
    };
  } catch (cause) {
    return {
      revision: hash(source),
      activeId: null,
      plans: [],
      exists: true,
      error: cause instanceof Error ? cause.message : String(cause),
    };
  }
}

const backend: LocalPluginBackend = {
  async handle({ repository, ledgerId, method, action, body, settings }) {
    if (method === "GET" && !action) {
      return readView(repository, ledgerId, settings);
    }
    if (method === "POST" && action === "save") {
      if (settings.enabled !== true) throw new Error("FIRE 模拟器插件尚未启用");
      if (!isRecord(body) || !Array.isArray(body.plans))
        throw new Error("方案列表必须是数组");
      if (body.plans.length > 50) throw new Error("方案数量过多");
      const seen = new Set<string>();
      const plans: FirePlan[] = body.plans.map((entry, index) => {
        if (!isRecord(entry)) throw new Error(`第 ${index + 1} 套方案格式无效`);
        if (typeof entry.id !== "string" || entry.id.trim().length === 0)
          throw new Error(`第 ${index + 1} 套方案缺少编号`);
        if (seen.has(entry.id)) throw new Error("方案编号重复");
        seen.add(entry.id);
        return {
          id: entry.id,
          name: normalizeName(entry.name),
          config: parseConfig(entry.config),
        };
      });
      const activeId =
        typeof body.activeId === "string" && seen.has(body.activeId)
          ? body.activeId
          : (plans[0]?.id ?? null);
      const files = await repository.readFileMap(ledgerId);
      const source = files[FIRE_PLAN_FILE];
      const revision = typeof body.revision === "string" ? body.revision : "";
      if (revision !== hash(source ?? "")) {
        throw new Error(
          "plugins/fire_calculator/plan.json 已变化，请重新载入后再保存",
        );
      }
      const content = `${JSON.stringify(
        { version: FILE_VERSION, activeId, plans },
        null,
        2,
      )}\n`;
      await repository.writeFiles(ledgerId, [
        {
          path: FIRE_PLAN_FILE,
          content,
          expectedSha: source === undefined ? undefined : hash(source),
        },
      ]);
      return readView(repository, ledgerId, settings);
    }
    if (method === "POST" && action === "rename") {
      if (settings.enabled !== true) throw new Error("FIRE 模拟器插件尚未启用");
      if (!isRecord(body)) throw new Error("方案名称请求格式无效");
      if (typeof body.id !== "string" || body.id.trim().length === 0)
        throw new Error("方案编号无效");
      const name = normalizeName(body.name);
      const files = await repository.readFileMap(ledgerId);
      const source = files[FIRE_PLAN_FILE];
      if (source === undefined) throw new Error("尚无可重命名的已保存方案");
      const revision = typeof body.revision === "string" ? body.revision : "";
      if (revision !== hash(source)) {
        throw new Error(
          "plugins/fire_calculator/plan.json 已变化，请重新载入后再保存",
        );
      }
      const { activeId, plans } = parseFile(source);
      let found = false;
      const renamedPlans = plans.map((plan) => {
        if (plan.id !== body.id) return plan;
        found = true;
        return { ...plan, name };
      });
      if (!found) throw new Error("方案不存在，请重新载入后再试");
      const content = `${JSON.stringify(
        { version: FILE_VERSION, activeId, plans: renamedPlans },
        null,
        2,
      )}\n`;
      await repository.writeFiles(ledgerId, [
        {
          path: FIRE_PLAN_FILE,
          content,
          expectedSha: hash(source),
        },
      ]);
      return readView(repository, ledgerId, settings);
    }
    if (method === "POST" && action === "delete") {
      if (settings.enabled !== true) throw new Error("FIRE 模拟器插件尚未启用");
      if (!isRecord(body)) throw new Error("删除方案请求格式无效");
      if (typeof body.id !== "string" || body.id.trim().length === 0)
        throw new Error("方案编号无效");
      const files = await repository.readFileMap(ledgerId);
      const source = files[FIRE_PLAN_FILE];
      if (source === undefined) throw new Error("尚无可删除的已保存方案");
      const revision = typeof body.revision === "string" ? body.revision : "";
      if (revision !== hash(source)) {
        throw new Error(
          "plugins/fire_calculator/plan.json 已变化，请重新载入后再保存",
        );
      }
      const { activeId, plans } = parseFile(source);
      if (!plans.some((plan) => plan.id === body.id))
        throw new Error("方案不存在，请重新载入后再试");
      const nextPlans = plans.filter((plan) => plan.id !== body.id);
      const nextActiveId =
        activeId === body.id ? (nextPlans[0]?.id ?? null) : activeId;
      const content = `${JSON.stringify(
        {
          version: FILE_VERSION,
          activeId: nextActiveId,
          plans: nextPlans,
        },
        null,
        2,
      )}\n`;
      await repository.writeFiles(ledgerId, [
        {
          path: FIRE_PLAN_FILE,
          content,
          expectedSha: hash(source),
        },
      ]);
      return readView(repository, ledgerId, settings);
    }
    throw new Error("未知的 FIRE 模拟器操作");
  },
};

export default backend;
