export const paymentMethodField = "收付款方式";

export function metadataFieldName(name: string) {
  const value = name.replace(/^\uFEFF/u, "").trim();
  return ["支付方式", "收/付款方式", "收付款方式"].includes(value)
    ? paymentMethodField
    : value;
}
