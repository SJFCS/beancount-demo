import { counterpartyKind, matchValue } from "../account-scope";
import type {
  CounterpartyAccount,
  CounterpartyKind,
  PaymentAccount,
  Row,
} from "../types";

type CounterpartyDetails = {
  kinds: Set<CounterpartyKind>;
  applicableKinds: Set<CounterpartyKind>;
  links: Map<CounterpartyKind, CounterpartyAccount>;
  firstLink?: CounterpartyAccount;
};

export function buildAccountLinkingIndex(
  rows: Row[],
  paymentAccounts: PaymentAccount[],
  counterpartyAccounts: CounterpartyAccount[],
  provider: string,
) {
  const payments = new Set<string>();
  const paymentLinks = new Map<string, PaymentAccount>();
  const counterparties = new Map<string, CounterpartyDetails>();
  const allCounterparties = new Set<string>();
  const counterpartyOptions = new Map<CounterpartyKind, Set<string>>();
  function detailsFor(payee: string) {
    let details = counterparties.get(payee);
    if (!details) {
      details = {
        kinds: new Set(),
        applicableKinds: new Set(),
        links: new Map(),
      };
      counterparties.set(payee, details);
    }
    return details;
  }
  function addOption(payee: string, kind: CounterpartyKind) {
    if (!payee) return;
    allCounterparties.add(payee);
    let options = counterpartyOptions.get(kind);
    if (!options) {
      options = new Set();
      counterpartyOptions.set(kind, options);
    }
    options.add(payee);
  }
  const indexedRows = rows.map((row) => {
    const payee = matchValue(row.payee);
    const kind = counterpartyKind(row);
    payments.add(row.payment);
    if (payee) {
      const details = detailsFor(payee);
      details.kinds.add(kind);
      details.applicableKinds.add(kind);
      addOption(payee, kind);
    }
    return { row, payee, kind, payment: matchValue(row.payment) };
  });
  for (const rule of paymentAccounts) {
    if (rule.provider !== provider || (rule.match ?? "exact") !== "exact")
      continue;
    payments.add(rule.payment);
    if (rule.description) continue;
    if (!paymentLinks.has(rule.payment)) paymentLinks.set(rule.payment, rule);
  }
  for (const rule of counterpartyAccounts) {
    if (rule.provider !== provider) continue;
    const payee = matchValue(rule.pattern ?? "");
    if (!payee) continue;
    const details = detailsFor(payee);
    details.kinds.add(rule.kind);
    if (rule.match !== "exact" || rule.description) continue;
    details.applicableKinds.add(rule.kind);
    addOption(payee, rule.kind);
    details.firstLink ??= rule;
    if (!details.links.has(rule.kind)) details.links.set(rule.kind, rule);
  }
  return {
    rows: indexedRows,
    payments,
    paymentLinks,
    counterparties,
    allCounterparties,
    counterpartyOptions,
  };
}
