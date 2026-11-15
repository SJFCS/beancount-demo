import { createHash } from "node:crypto";
import type { LocalPluginBackend } from "@beancount/plugin";
import {
  DEFAULT_LIFE_CALENDAR_CONFIG,
  LIFE_CALENDAR_CONFIG_FILE,
  lifeCalendarConfigDocument,
  parseLifeCalendarConfig,
  type LifeCalendarConfig,
} from "./life-calendar";

type View = {
  revision: string;
  config: LifeCalendarConfig;
  configError: string | null;
  configPath: string;
  exists: boolean;
};

function hash(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function configuration(value: unknown): LifeCalendarConfig {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("配置必须是对象");
  }
  const body = value as Record<string, unknown>;
  return parseLifeCalendarConfig(body.config);
}

async function readView(
  repository: Parameters<LocalPluginBackend["handle"]>[0]["repository"],
  ledgerId: string,
  settings: Record<string, unknown>,
): Promise<View> {
  if (settings.enabled !== true) throw new Error("人生日历插件尚未启用");
  const files = await repository.readFileMap(ledgerId);
  const source = files[LIFE_CALENDAR_CONFIG_FILE];
  if (source === undefined) {
    return {
      revision: hash(""),
      config: { ...DEFAULT_LIFE_CALENDAR_CONFIG },
      configError: null,
      configPath: LIFE_CALENDAR_CONFIG_FILE,
      exists: false,
    };
  }
  try {
    return {
      revision: hash(source),
      config: parseLifeCalendarConfig(JSON.parse(source)),
      configError: null,
      configPath: LIFE_CALENDAR_CONFIG_FILE,
      exists: true,
    };
  } catch (cause) {
    return {
      revision: hash(source),
      config: { ...DEFAULT_LIFE_CALENDAR_CONFIG },
      configError: cause instanceof Error ? cause.message : String(cause),
      configPath: LIFE_CALENDAR_CONFIG_FILE,
      exists: true,
    };
  }
}

const backend: LocalPluginBackend = {
  async handle({ repository, ledgerId, method, action, body, settings }) {
    if (method === "GET" && !action) {
      return readView(repository, ledgerId, settings);
    }
    if (method === "POST" && action === "save") {
      if (settings.enabled !== true) throw new Error("人生日历插件尚未启用");
      const files = await repository.readFileMap(ledgerId);
      const source = files[LIFE_CALENDAR_CONFIG_FILE];
      const revision = typeof body.revision === "string" ? body.revision : "";
      if (revision !== hash(source ?? "")) {
        throw new Error(
          "plugins/life_calendar/config.json 已变化，请重新读取后再保存",
        );
      }
      const config = configuration(body);
      await repository.writeFiles(ledgerId, [
        {
          path: LIFE_CALENDAR_CONFIG_FILE,
          content: lifeCalendarConfigDocument(config),
          expectedSha: source === undefined ? undefined : hash(source),
        },
      ]);
      return readView(repository, ledgerId, settings);
    }
    throw new Error("未知的人生日历操作");
  },
};

export default backend;
