export type BalanceDistributionBin = {
  start: number;
  end: number;
  count: number;
  share: number;
};

export type BalanceDistribution = {
  totalCount: number;
  zeroCount: number;
  zeroShare: number;
  domainEnd: number;
  binWidth: number;
  bins: BalanceDistributionBin[];
};

function niceStep(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const normalized = value / magnitude;
  const factor =
    normalized <= 1
      ? 1
      : normalized <= 2
        ? 2
        : normalized <= 2.5
          ? 2.5
          : normalized <= 5
            ? 5
            : 10;
  return factor * magnitude;
}

/**
 * Summarize the non-negative balances of all paths at one age. A fixed number
 * of equal-width bins keeps the histogram smooth while the shared year slider
 * moves; the value scale may contract or expand for that selected age.
 */
export function buildBalanceDistribution(
  values: readonly number[],
  binCount = 20,
): BalanceDistribution {
  const balances = values.filter(
    (value) => Number.isFinite(value) && value >= 0,
  );
  const count = Math.max(1, Math.floor(binCount));
  const totalCount = balances.length;
  if (!totalCount) {
    return {
      totalCount: 0,
      zeroCount: 0,
      zeroShare: 0,
      domainEnd: 1,
      binWidth: 1 / count,
      bins: Array.from({ length: count }, (_, index) => ({
        start: index / count,
        end: (index + 1) / count,
        count: 0,
        share: 0,
      })),
    };
  }

  const maximum = Math.max(...balances);
  const binWidth = niceStep(Math.max(Number.EPSILON, maximum / count));
  const domainEnd = binWidth * count;
  const counts = Array.from({ length: count }, () => 0);
  let zeroCount = 0;
  for (const balance of balances) {
    if (balance === 0) zeroCount += 1;
    const index = Math.min(count - 1, Math.floor(balance / binWidth));
    counts[index] += 1;
  }

  return {
    totalCount,
    zeroCount,
    zeroShare: zeroCount / totalCount,
    domainEnd,
    binWidth,
    bins: counts.map((binCountValue, index) => ({
      start: index * binWidth,
      end: Math.min(domainEnd, (index + 1) * binWidth),
      count: binCountValue,
      share: binCountValue / totalCount,
    })),
  };
}
