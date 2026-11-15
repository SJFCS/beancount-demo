import {
  parseValuationConfig,
  valuationConfigDocument,
  VALUATION_CONFIG_FILE,
} from "@beancount/plugin";
import type { LocalPluginBackend } from "@beancount/plugin";
import { hash, readView } from "./backend/view";

const backend: LocalPluginBackend = {
  async handle({ repository, ledgerId, method, action, body, settings }) {
    if (method === "GET" && !action) {
      return readView(repository, ledgerId, settings);
    }
    if (method === "POST" && action === "save") {
      if (settings.enabled !== true) throw new Error("估值插件尚未启用");
      const files = await repository.readFileMap(ledgerId);
      const source = files[VALUATION_CONFIG_FILE];
      const revision = typeof body.revision === "string" ? body.revision : "";
      if (revision !== hash(source ?? "")) {
        throw new Error(`${VALUATION_CONFIG_FILE} 已变化，请重新读取后再保存`);
      }
      const config = parseValuationConfig(body.config);
      await repository.writeFiles(ledgerId, [
        {
          path: VALUATION_CONFIG_FILE,
          content: valuationConfigDocument(config),
          expectedSha: source === undefined ? undefined : hash(source),
        },
      ]);
      return readView(repository, ledgerId, settings);
    }
    throw new Error("未知的估值操作");
  },
};

export default backend;
