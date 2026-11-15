import type { Batch } from "../types";

export const uploadFormats = {
  alipay: {
    name: "支付宝",
    extension: ".csv",
    accept: ".csv,text/csv",
  },
  wechat: {
    name: "微信",
    extension: ".xlsx",
    accept:
      ".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  },
} as const satisfies Record<
  Batch["provider"],
  { name: string; extension: string; accept: string }
>;

export function matchesUploadFormat(
  filename: string,
  provider: Batch["provider"],
) {
  return filename
    .toLowerCase()
    .endsWith(uploadFormats[provider].extension.toLowerCase());
}
