/**
 * Multi-currency formatting utilities using Intl.NumberFormat.
 * All functions accept ISO 4217 currency codes (e.g., "IDR", "USD", "EUR").
 */

/** Map of ISO 4217 currency codes to their most common locale */
const CURRENCY_LOCALE_MAP: Record<string, string> = {
  IDR: "id-ID",
  USD: "en-US",
  EUR: "de-DE",
  GBP: "en-GB",
  JPY: "ja-JP",
  SGD: "en-SG",
  MYR: "ms-MY",
  AUD: "en-AU",
  CAD: "en-CA",
  CHF: "de-CH",
  CNY: "zh-CN",
  KRW: "ko-KR",
  THB: "th-TH",
  PHP: "en-PH",
  INR: "en-IN",
  HKD: "en-HK",
  TWD: "zh-TW",
  NZD: "en-NZ",
  AED: "ar-AE",
  SAR: "ar-SA",
};

/** Currencies that conventionally display 0 decimal places */
const ZERO_DECIMAL_CURRENCIES = new Set([
  "IDR",
  "JPY",
  "KRW",
  "VND",
  "CLP",
  "ISK",
  "UGX",
  "BIF",
  "GNF",
  "PYG",
  "RWF",
  "XOF",
  "XAF",
  "XPF",
]);

/**
 * Format a numeric amount as a currency string.
 *
 * @param amount - The raw numeric amount (e.g., 50000)
 * @param currencyCode - ISO 4217 currency code (e.g., "IDR", "USD")
 * @returns Formatted string (e.g., "Rp 50.000", "$1,234.56")
 *
 * @example
 * formatCurrency(50000, "IDR")  // "Rp 50.000"
 * formatCurrency(1234.56, "USD") // "$1,234.56"
 * formatCurrency(1500, "JPY")   // "￥1,500"
 */
export function formatCurrency(amount: number, currencyCode: string): string {
  const code = currencyCode.toUpperCase();
  const locale = CURRENCY_LOCALE_MAP[code] ?? "en-US";
  const minimumFractionDigits = ZERO_DECIMAL_CURRENCIES.has(code) ? 0 : 2;
  const maximumFractionDigits = minimumFractionDigits;

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: code,
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(amount);
  } catch {
    // Fallback for unknown/invalid currency codes
    return `${code} ${amount.toLocaleString(locale, {
      minimumFractionDigits,
      maximumFractionDigits,
    })}`;
  }
}

/**
 * Get the currency symbol for a given ISO 4217 code.
 * Useful for input field prefixes (e.g., showing "$" or "Rp" in an amount input).
 *
 * @param currencyCode - ISO 4217 currency code
 * @returns The currency symbol (e.g., "Rp", "$", "€", "¥")
 *
 * @example
 * getCurrencySymbol("IDR") // "Rp"
 * getCurrencySymbol("USD") // "$"
 * getCurrencySymbol("EUR") // "€"
 */
export function getCurrencySymbol(currencyCode: string): string {
  const code = currencyCode.toUpperCase();
  const locale = CURRENCY_LOCALE_MAP[code] ?? "en-US";

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: code,
      currencyDisplay: "narrowSymbol",
    })
      .formatToParts(0)
      .find((part) => part.type === "currency")?.value ?? code;
  } catch {
    return code;
  }
}

/**
 * Format a compact currency amount (e.g., "Rp 1.5jt" for IDR, "$1.5M" for USD).
 * Useful for dashboard summaries where space is tight.
 *
 * @param amount - The raw numeric amount
 * @param currencyCode - ISO 4217 currency code
 * @returns Compact formatted string
 */
export function formatCurrencyCompact(
  amount: number,
  currencyCode: string
): string {
  const code = currencyCode.toUpperCase();
  const locale = CURRENCY_LOCALE_MAP[code] ?? "en-US";

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: code,
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(amount);
  } catch {
    return `${code} ${amount.toLocaleString()}`;
  }
}
