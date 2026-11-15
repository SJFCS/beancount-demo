import type { FirePathSummary } from "./model";

export type SpendingCutBin = {
  key: string;
  label: string;
  lower: number;
  upper: number | null;
  count: number;
  share: number;
};

const BIN_DEFINITIONS = [
  { key: "none", label: "未下调", lower: 0, upper: 0 },
  { key: "to-10", label: "≤10%", lower: 0, upper: 10 },
  { key: "to-20", label: ">10–20%", lower: 10, upper: 20 },
  { key: "to-30", label: ">20–30%", lower: 20, upper: 30 },
  { key: "to-40", label: ">30–40%", lower: 30, upper: 40 },
  { key: "over-40", label: ">40%", lower: 40, upper: null },
] as const;

export function buildSpendingCutBins(
  paths: readonly FirePathSummary[],
): SpendingCutBin[] {
  const total = paths.length;
  return BIN_DEFINITIONS.map((definition) => {
    const count = paths.filter((path) => {
      const cut = path.maxSpendingCut;
      if (definition.key === "none") return cut <= 1e-8;
      if (definition.upper === null) return cut > definition.lower + 1e-8;
      return cut > definition.lower + 1e-8 && cut <= definition.upper + 1e-8;
    }).length;
    return {
      ...definition,
      count,
      share: total > 0 ? count / total : 0,
    };
  });
}
