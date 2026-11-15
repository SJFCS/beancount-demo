import { createHash } from "node:crypto";
import type { LocalPluginBackend } from "@beancount/plugin";
import {
  LOCAL_PLUGIN_CONFIG_PATH,
  parseLocalPluginConfig,
} from "@beancount/plugin";
import {
  flattenMapping,
  isMapping,
  leafMap,
  mappingAt,
  removeYamlPath,
  reorderYamlMappingEntries,
  setYamlPath,
} from "./backend/yaml";

type Mapping = Record<string, unknown>;
type NavigationGroup =
  | "root"
  | "primary"
  | "reports"
  | "plugins"
  | "import"
  | "footer";
type NavigationPosition = "first" | "last" | number;

type PluginNavigation = {
  quickMenu: boolean;
  group: NavigationGroup;
  position: NavigationPosition;
};

type PluginNavigationView = PluginNavigation & {
  registered: boolean;
};

type PluginItem = {
  id: string;
  name: string;
  description: string;
  available: boolean;
  configured: boolean;
  enabled: boolean;
  settings: Mapping;
  navigation: PluginNavigationView;
};

type View = {
  revision: string;
  source: string;
  configPath: string;
  exists: boolean;
  valid: boolean;
  error: string | null;
  plugins: PluginItem[];
};

const MAX_CONFIG_BYTES = 1_000_000;
const PLUGIN_ID = /^[a-z][a-z0-9_-]{0,63}$/u;
const LOCAL_CONFIG_ID = "local_config";
const LOCAL_CONFIG_GROUP: NavigationGroup = "root";
const LOCAL_CONFIG_POSITION: NavigationPosition = "last";
const GROUPS: NavigationGroup[] = [
  "root",
  "primary",
  "reports",
  "plugins",
  "import",
  "footer",
];
const GROUP_ORDER = new Map(GROUPS.map((group, index) => [group, index]));

function hash(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function asMapping(value: unknown, label: string): Mapping {
  if (!isMapping(value)) throw new Error(`${label}必须是对象`);
  return value;
}

function parseNavigationPlacement(
  pluginId: string,
  value: unknown,
): PluginNavigationView {
  const placement = asMapping(value, `navigation.routes.${pluginId}`);
  if (
    typeof placement.group !== "string" ||
    !GROUPS.includes(placement.group as NavigationGroup)
  ) {
    throw new Error(`navigation.routes.${pluginId}.group 无效`);
  }
  const position = placement.position ?? "last";
  if (
    position !== "first" &&
    position !== "last" &&
    !(
      typeof position === "number" &&
      Number.isSafeInteger(position) &&
      position >= 0
    )
  ) {
    throw new Error(`navigation.routes.${pluginId}.position 无效`);
  }
  const quickMenu = placement.quick_menu ?? false;
  if (typeof quickMenu !== "boolean") {
    throw new Error(`navigation.routes.${pluginId}.quick_menu 必须是布尔值`);
  }
  return {
    quickMenu,
    group: placement.group as NavigationGroup,
    position,
    registered: true,
  };
}

function validateConfigShape(config: Mapping): void {
  if (config.plugins !== undefined) {
    const plugins = asMapping(config.plugins, "plugins");
    for (const [pluginId, settings] of Object.entries(plugins)) {
      if (!PLUGIN_ID.test(pluginId)) {
        throw new Error(`plugins 中的插件 ID 无效：${pluginId}`);
      }
      asMapping(settings, `plugins.${pluginId}`);
    }
  }
  if (config.navigation === undefined) return;
  const navigation = asMapping(config.navigation, "navigation");
  const routes =
    navigation.routes === undefined
      ? {}
      : asMapping(navigation.routes, "navigation.routes");
  for (const [pluginId, placement] of Object.entries(routes)) {
    if (!PLUGIN_ID.test(pluginId)) {
      throw new Error(`navigation.routes 中的插件 ID 无效：${pluginId}`);
    }
    parseNavigationPlacement(pluginId, placement);
  }
}

function validationError(source: string): string | null {
  if (Buffer.byteLength(source, "utf8") > MAX_CONFIG_BYTES) {
    return "配置文件不能超过 1 MB";
  }
  try {
    validateConfigShape(parseLocalPluginConfig(source));
    return null;
  } catch (cause) {
    return cause instanceof Error ? cause.message : String(cause);
  }
}

function assertValidConfig(source: string): void {
  const error = validationError(source);
  if (error) throw new Error(`YAML 配置无效：${error}`);
}

function readManifests(
  files: Readonly<Record<string, string>>,
): Map<string, { name: string; description: string }> {
  const manifests = new Map<string, { name: string; description: string }>();
  for (const [filePath, source] of Object.entries(files)) {
    const match = /^plugins\/([a-z][a-z0-9_-]{0,63})\/manifest\.json$/u.exec(
      filePath,
    );
    if (!match) continue;
    try {
      const value = JSON.parse(source) as unknown;
      if (!isMapping(value) || value.id !== match[1]) continue;
      manifests.set(match[1]!, {
        name:
          typeof value.name === "string" && value.name.trim()
            ? value.name.trim()
            : match[1]!,
        description:
          typeof value.description === "string" ? value.description : "",
      });
    } catch {
      continue;
    }
  }
  return manifests;
}

function navigationFor(
  pluginId: string,
  routes: Mapping,
): PluginNavigationView {
  const placement = routes[pluginId];
  if (!isMapping(placement)) {
    return {
      quickMenu: false,
      group: "plugins",
      position: "last",
      registered: false,
    };
  }
  return parseNavigationPlacement(pluginId, placement);
}

function positionRank(position: NavigationPosition): number {
  if (position === "first") return Number.NEGATIVE_INFINITY;
  if (position === "last") return Number.POSITIVE_INFINITY;
  return position;
}

function pluginsFor(
  config: Mapping,
  files: Readonly<Record<string, string>>,
): PluginItem[] {
  const configured = mappingAt(config, ["plugins"]) ?? {};
  const navigation = mappingAt(config, ["navigation"]);
  const routes =
    navigation && isMapping(navigation.routes) ? navigation.routes : {};
  const manifests = readManifests(files);
  const ids = new Set([
    ...Object.keys(configured),
    ...manifests.keys(),
    ...Object.keys(routes),
  ]);
  const configuredOrder = new Map(
    Object.keys(configured).map((id, index) => [id, index]),
  );
  const plugins = [...ids]
    .filter((id) => PLUGIN_ID.test(id))
    .map((id): PluginItem => {
      const rawSettings = configured[id];
      const settings = isMapping(rawSettings) ? rawSettings : {};
      const manifest = manifests.get(id);
      return {
        id,
        name: manifest?.name ?? id,
        description: manifest?.description ?? "插件清单尚未安装",
        available: manifest !== undefined,
        configured: Object.hasOwn(configured, id),
        enabled: settings.enabled === true,
        settings: Object.fromEntries(
          Object.entries(settings).filter(([key]) => key !== "enabled"),
        ),
        navigation: navigationFor(id, routes),
      };
    });

  return plugins.sort((left, right) => {
    if (left.configured !== right.configured) {
      return left.configured ? -1 : 1;
    }
    if (left.configured && right.configured) {
      return configuredOrder.get(left.id)! - configuredOrder.get(right.id)!;
    }
    const leftRegistered = isMapping(routes[left.id]);
    const rightRegistered = isMapping(routes[right.id]);
    const leftGroup = leftRegistered
      ? GROUP_ORDER.get(left.navigation.group)!
      : GROUPS.length;
    const rightGroup = rightRegistered
      ? GROUP_ORDER.get(right.navigation.group)!
      : GROUPS.length;
    if (leftGroup !== rightGroup) return leftGroup - rightGroup;
    const leftPosition = positionRank(left.navigation.position);
    const rightPosition = positionRank(right.navigation.position);
    if (leftPosition !== rightPosition) {
      return leftPosition < rightPosition ? -1 : 1;
    }
    return left.name.localeCompare(right.name);
  });
}

async function readView(
  repository: Parameters<LocalPluginBackend["handle"]>[0]["repository"],
  ledgerId: string,
): Promise<View> {
  const files = await repository.readFileMap(ledgerId);
  const stored = files[LOCAL_PLUGIN_CONFIG_PATH];
  const source = stored ?? "";
  const error = stored === undefined ? null : validationError(source);
  let plugins: PluginItem[] = [];
  if (error === null) {
    plugins = pluginsFor(parseLocalPluginConfig(source), files);
  }
  return {
    revision: hash(source),
    source,
    configPath: LOCAL_PLUGIN_CONFIG_PATH,
    exists: stored !== undefined,
    valid: error === null,
    error,
    plugins,
  };
}

function requireRevision(
  files: Readonly<Record<string, string>>,
  revision: unknown,
): { source: string; expectedSha?: string } {
  const stored = files[LOCAL_PLUGIN_CONFIG_PATH];
  const source = stored ?? "";
  if (typeof revision !== "string" || revision !== hash(source)) {
    throw new Error("benacount-local.yaml 已变化，请重新读取后再保存");
  }
  return {
    source,
    ...(stored === undefined ? {} : { expectedSha: hash(stored) }),
  };
}

function updatePluginSettings(
  source: string,
  pluginId: string,
  current: Mapping,
  next: Mapping,
): string {
  const currentLeaves = leafMap(current);
  const nextLeaves = leafMap(next);
  let result = source;
  for (const path of currentLeaves.keys()) {
    if (!nextLeaves.has(path)) {
      result = removeYamlPath(result, [
        "plugins",
        pluginId,
        ...path.split("\u0000"),
      ]);
    }
  }
  for (const entry of flattenMapping(next)) {
    const path = entry.path.join("\u0000");
    if (!Object.is(currentLeaves.get(path), entry.value)) {
      result = setYamlPath(
        result,
        ["plugins", pluginId, ...entry.path],
        entry.value,
      );
    }
  }
  return result;
}

function updateNavigation(
  source: string,
  pluginId: string,
  value: PluginNavigation,
): string {
  if (!GROUPS.includes(value.group)) throw new Error("未知的导航分组");
  const current = mappingAt(parseLocalPluginConfig(source), [
    "navigation",
    "routes",
    pluginId,
  ]);
  let result = source;
  if (current?.group !== value.group) {
    result = setYamlPath(
      result,
      ["navigation", "routes", pluginId, "group"],
      value.group,
    );
  }
  if (current?.position !== value.position) {
    result = setYamlPath(
      result,
      ["navigation", "routes", pluginId, "position"],
      value.position,
    );
  }
  if (current?.quick_menu !== value.quickMenu) {
    result = setYamlPath(
      result,
      ["navigation", "routes", pluginId, "quick_menu"],
      value.quickMenu,
    );
  }
  return result;
}

function parseNavigation(value: unknown): PluginNavigation {
  const mapping = asMapping(value, "navigation");
  if (typeof mapping.quickMenu !== "boolean") {
    throw new Error("navigation.quickMenu 必须是布尔值");
  }
  if (
    typeof mapping.group !== "string" ||
    !GROUPS.includes(mapping.group as NavigationGroup)
  ) {
    throw new Error("navigation.group 无效");
  }
  if (
    mapping.position !== "first" &&
    mapping.position !== "last" &&
    !(
      typeof mapping.position === "number" &&
      Number.isSafeInteger(mapping.position) &&
      mapping.position >= 0
    )
  ) {
    throw new Error("navigation.position 无效");
  }
  return {
    quickMenu: mapping.quickMenu,
    group: mapping.group as NavigationGroup,
    position: mapping.position,
  };
}

async function savePlugin(
  repository: Parameters<LocalPluginBackend["handle"]>[0]["repository"],
  ledgerId: string,
  body: Mapping,
): Promise<View> {
  const files = await repository.readFileMap(ledgerId);
  const snapshot = requireRevision(files, body.revision);
  const stored = snapshot.source;
  const pluginId = body.pluginId;
  if (typeof pluginId !== "string" || !PLUGIN_ID.test(pluginId)) {
    throw new Error("插件 ID 无效");
  }
  const settings = asMapping(body.settings, "settings");
  if (typeof body.enabled !== "boolean")
    throw new Error("enabled 必须是布尔值");
  const requestedNavigation =
    body.navigation === undefined ? null : parseNavigation(body.navigation);
  const enabled = body.enabled;

  const config = parseLocalPluginConfig(stored);
  const currentLocalConfigNavigation = mappingAt(config, [
    "navigation",
    "routes",
    LOCAL_CONFIG_ID,
  ]);
  const navigation =
    pluginId === LOCAL_CONFIG_ID
      ? {
          quickMenu:
            requestedNavigation?.quickMenu ??
            currentLocalConfigNavigation?.quick_menu === true,
          group: LOCAL_CONFIG_GROUP,
          position: LOCAL_CONFIG_POSITION,
        }
      : requestedNavigation;
  const plugins = mappingAt(config, ["plugins"]) ?? {};
  const rawCurrent = plugins[pluginId];
  const rawCurrentEnabled = isMapping(rawCurrent)
    ? rawCurrent.enabled
    : undefined;
  const current = isMapping(rawCurrent)
    ? Object.fromEntries(
        Object.entries(rawCurrent).filter(([key]) => key !== "enabled"),
      )
    : {};
  let next = updatePluginSettings(stored, pluginId, current, settings);
  if (rawCurrentEnabled !== enabled) {
    next = setYamlPath(next, ["plugins", pluginId, "enabled"], enabled);
  }
  if (navigation !== null) {
    next = updateNavigation(next, pluginId, navigation);
  }
  assertValidConfig(next);
  if (next !== stored) {
    await repository.writeFile(
      ledgerId,
      LOCAL_PLUGIN_CONFIG_PATH,
      next,
      snapshot.expectedSha,
    );
  }
  return readView(repository, ledgerId);
}

async function reorder(
  repository: Parameters<LocalPluginBackend["handle"]>[0]["repository"],
  ledgerId: string,
  body: Mapping,
): Promise<View> {
  const files = await repository.readFileMap(ledgerId);
  const snapshot = requireRevision(files, body.revision);
  if (files[LOCAL_PLUGIN_CONFIG_PATH] === undefined) {
    throw new Error("benacount-local.yaml 不存在，无法排序");
  }
  let source = snapshot.source;
  assertValidConfig(source);
  if (body.group !== "all") {
    throw new Error("插件排序范围无效");
  }
  if (
    !Array.isArray(body.pluginIds) ||
    !body.pluginIds.every(
      (pluginId) => typeof pluginId === "string" && PLUGIN_ID.test(pluginId),
    )
  ) {
    throw new Error("pluginIds 必须是插件 ID 数组");
  }
  const pluginIds = body.pluginIds as string[];
  if (new Set(pluginIds).size !== pluginIds.length) {
    throw new Error("pluginIds 不能重复");
  }
  const config = parseLocalPluginConfig(source);
  const routes = mappingAt(config, ["navigation", "routes"]) ?? {};
  const configured = mappingAt(config, ["plugins"]) ?? {};
  const expected = Object.keys(configured)
    .filter((pluginId) => PLUGIN_ID.test(pluginId))
    .sort();
  const sortedPluginIds = [...pluginIds].sort();
  if (
    expected.length !== pluginIds.length ||
    expected.some((pluginId, index) => pluginId !== sortedPluginIds[index])
  ) {
    throw new Error("插件排序列表不完整");
  }

  source = reorderYamlMappingEntries(source, ["plugins"], pluginIds);
  for (const navigationGroup of GROUPS) {
    const registered = pluginIds.filter(
      (pluginId) =>
        pluginId !== LOCAL_CONFIG_ID &&
        isMapping(routes[pluginId]) &&
        navigationFor(pluginId, routes).group === navigationGroup,
    );
    for (const [position, pluginId] of registered.entries()) {
      source = setYamlPath(
        source,
        ["navigation", "routes", pluginId, "position"],
        position,
      );
    }
  }
  if (expected.includes(LOCAL_CONFIG_ID)) {
    const currentNavigation = isMapping(routes[LOCAL_CONFIG_ID])
      ? navigationFor(LOCAL_CONFIG_ID, routes)
      : { quickMenu: false };
    source = updateNavigation(source, LOCAL_CONFIG_ID, {
      ...currentNavigation,
      group: LOCAL_CONFIG_GROUP,
      position: LOCAL_CONFIG_POSITION,
    });
  }
  assertValidConfig(source);
  await repository.writeFile(
    ledgerId,
    LOCAL_PLUGIN_CONFIG_PATH,
    source,
    hash(files[LOCAL_PLUGIN_CONFIG_PATH]!),
  );
  return readView(repository, ledgerId);
}

const backend: LocalPluginBackend = {
  async handle({ repository, ledgerId, method, action, body }) {
    if (method === "GET" && !action) {
      return readView(repository, ledgerId);
    }
    if (method === "POST" && action === "save") {
      const source = body.source;
      if (typeof source !== "string") {
        throw new Error("配置内容必须是字符串");
      }
      const error = validationError(source);
      if (error) throw new Error(`YAML 配置无效：${error}`);
      const files = await repository.readFileMap(ledgerId);
      const snapshot = requireRevision(files, body.revision);
      const stored = snapshot.source;
      if (stored !== source) {
        await repository.writeFile(
          ledgerId,
          LOCAL_PLUGIN_CONFIG_PATH,
          source,
          snapshot.expectedSha,
        );
      }
      return readView(repository, ledgerId);
    }
    if (method === "POST" && action === "plugin") {
      return savePlugin(repository, ledgerId, body);
    }
    if (method === "POST" && action === "reorder") {
      return reorder(repository, ledgerId, body);
    }
    throw new Error("未知的插件配置操作");
  },
};

export default backend;
