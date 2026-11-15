import type { LocalPluginBackend } from "@beancount/plugin";
import { readReport, readView, saveConfig } from "./backend/view";

const backend: LocalPluginBackend = {
  async handle({ repository, ledgerId, method, action, body, settings }) {
    if (method === "GET" && !action)
      return readView(repository, ledgerId, settings);
    if (method === "POST" && action === "report")
      return readReport(repository, ledgerId, body);
    if (method === "POST" && action === "save")
      return saveConfig(repository, ledgerId, body);
    throw new Error("未知的投资组合收益操作");
  },
};

export default backend;
