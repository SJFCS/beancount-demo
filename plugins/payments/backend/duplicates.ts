import BigNumber from "bignumber.js";
import type { Batch, Existing } from "../types";
import { normalize } from "./utils";
export function findDuplicates(batch: Batch, existing: Existing[]) {
  const seen = new Map<string, string>();
  const fingerprints = new Map<string, string>();
  return batch.rows.map((row) => {
    const duplicates: string[] = [];
    if (row.orderId) {
      const key = `${batch.provider}:${row.orderId}:${row.direction}`;
      if (seen.has(key))
        duplicates.push(`本批次第 ${seen.get(key)} 行：相同交易单号`);
      else seen.set(key, String(row.line));
    }
    const fingerprint = JSON.stringify([
      row.date,
      row.amount,
      normalize(row.payee),
      normalize(row.description),
    ]);
    if (fingerprints.has(fingerprint) && !duplicates.length)
      duplicates.push(
        `本批次第 ${fingerprints.get(fingerprint)} 行：同日、同金额且交易对方和描述相同`,
      );
    else if (!fingerprints.has(fingerprint))
      fingerprints.set(fingerprint, String(row.line));
    for (const old of existing) {
      if (old.importBatch === batch.id && old.importLine === row.line) continue;
      if (
        row.orderId &&
        old.orderId === row.orderId &&
        old.provider === batch.provider
      )
        duplicates.push(`${old.label}：相同交易单号`);
      else if (
        old.date === row.date &&
        old.postings.some(
          (p) =>
            /^(Assets|Liabilities):/u.test(p.account) &&
            p.currency === "CNY" &&
            p.amount === new BigNumber(row.amount).toFixed(),
        ) &&
        ((normalize(old.payee) === normalize(row.payee) &&
          !!normalize(row.payee)) ||
          (normalize(old.description) === normalize(row.description) &&
            !!normalize(row.description)))
      )
        duplicates.push(`${old.label}：同日、同金额且交易对方或描述相同`);
    }
    return {
      ...row,
      duplicates: [...new Set(duplicates)],
      duplicateReviewed:
        row.duplicateReviewed &&
        duplicates.every((candidate) => row.duplicates.includes(candidate)),
    };
  });
}
