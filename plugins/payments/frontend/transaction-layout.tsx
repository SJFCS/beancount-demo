import React from "react";

export function TransactionColumns() {
  return (
    <colgroup>
      <col className="pm-col-state" />
      <col className="pm-col-mapping" />
      <col className="pm-col-review" />
    </colgroup>
  );
}

export function TransactionMappingHeading({
  sourceFilter,
}: {
  sourceFilter?: React.ReactNode;
}) {
  return (
    <div className="pm-mapping-heading">
      <div className="pm-column-heading">
        <span>原账单信息</span>
        {sourceFilter}
      </div>
    </div>
  );
}

export function AccountValue({ account }: { account: string }) {
  const segments = account.split(":");
  const name = segments.pop();
  return (
    <span className="pm-account-value" title={account}>
      <strong>{name}</strong>
      {segments.length > 0 && <small>{segments.join(":")}</small>}
    </span>
  );
}
