/** Common ISO currencies for campaign budget / fees / spend */
export const CAMPAIGN_CURRENCIES = [
  { code: "USD", label: "USD — US Dollar" },
  { code: "EUR", label: "EUR — Euro" },
  { code: "GBP", label: "GBP — British Pound" },
  { code: "INR", label: "INR — Indian Rupee" },
  { code: "CAD", label: "CAD — Canadian Dollar" },
  { code: "AUD", label: "AUD — Australian Dollar" },
  { code: "SGD", label: "SGD — Singapore Dollar" },
  { code: "JPY", label: "JPY — Japanese Yen" },
  { code: "AED", label: "AED — UAE Dirham" },
  { code: "BRL", label: "BRL — Brazilian Real" },
] as const;

export type CampaignCurrencyCode =
  (typeof CAMPAIGN_CURRENCIES)[number]["code"];

export function normalizeCurrency(code?: string | null): string {
  const c = (code || "USD").trim().toUpperCase();
  return c.length >= 3 ? c.slice(0, 10) : "USD";
}

/** Format a money amount with campaign currency (compact, UI-friendly). */
export function formatCampaignMoney(
  amount: number | null | undefined,
  currency?: string | null,
  options?: { compact?: boolean }
): string {
  const value = Number(amount) || 0;
  const code = normalizeCurrency(currency);
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: code,
      currencyDisplay: "narrowSymbol",
      maximumFractionDigits: options?.compact ? 0 : 2,
      minimumFractionDigits: options?.compact ? 0 : 2,
    }).format(value);
  } catch {
    return `${code} ${value.toFixed(2)}`;
  }
}
