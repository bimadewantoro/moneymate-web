/**
 * Exchange Rate Engine
 *
 * Fetches, stores, and queries exchange rates for multi-currency dashboard totals.
 * Uses the free open.er-api.com API (no API key required).
 */

import { db } from "@/server/db";
import { exchangeRates } from "@/server/db/schema";
import { eq, and, desc } from "drizzle-orm";

/**
 * Fetch latest exchange rates from the API and store them in the database.
 * Uses open.er-api.com which is free and requires no API key.
 */
export async function fetchAndStoreRates(baseCurrency: string): Promise<void> {
  const response = await fetch(
    `https://open.er-api.com/v6/latest/${baseCurrency}`,
    { next: { revalidate: 0 } } // No caching
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch rates for ${baseCurrency}: ${response.status}`);
  }

  const data = await response.json();

  if (data.result !== "success") {
    throw new Error(`API returned error for ${baseCurrency}: ${data["error-type"]}`);
  }

  const now = new Date();
  const rates = data.rates as Record<string, number>;

  // Upsert rates into the database
  const upsertPromises = Object.entries(rates).map(async ([targetCurrency, rate]) => {
    // Skip self-reference
    if (targetCurrency === baseCurrency) return;

    // Check if rate already exists for today
    const existing = await db
      .select()
      .from(exchangeRates)
      .where(
        and(
          eq(exchangeRates.baseCurrency, baseCurrency),
          eq(exchangeRates.targetCurrency, targetCurrency)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Update existing rate
      await db
        .update(exchangeRates)
        .set({
          rate: rate.toString(),
          date: now,
        })
        .where(eq(exchangeRates.id, existing[0].id));
    } else {
      // Insert new rate
      await db.insert(exchangeRates).values({
        baseCurrency,
        targetCurrency,
        rate: rate.toString(),
        date: now,
      });
    }
  });

  await Promise.all(upsertPromises);
}

/**
 * Get the exchange rate between two currencies.
 * Returns the rate to multiply `from` currency amount by to get `to` currency amount.
 * Returns 1 if currencies are the same, or null if rate not found.
 */
export async function getExchangeRate(
  fromCurrency: string,
  toCurrency: string
): Promise<number | null> {
  if (fromCurrency === toCurrency) return 1;

  // Try direct lookup: fromCurrency -> toCurrency
  const direct = await db
    .select({ rate: exchangeRates.rate })
    .from(exchangeRates)
    .where(
      and(
        eq(exchangeRates.baseCurrency, fromCurrency),
        eq(exchangeRates.targetCurrency, toCurrency)
      )
    )
    .orderBy(desc(exchangeRates.date))
    .limit(1);

  if (direct.length > 0) {
    return parseFloat(direct[0].rate);
  }

  // Try inverse lookup: toCurrency -> fromCurrency, then invert
  const inverse = await db
    .select({ rate: exchangeRates.rate })
    .from(exchangeRates)
    .where(
      and(
        eq(exchangeRates.baseCurrency, toCurrency),
        eq(exchangeRates.targetCurrency, fromCurrency)
      )
    )
    .orderBy(desc(exchangeRates.date))
    .limit(1);

  if (inverse.length > 0) {
    return 1 / parseFloat(inverse[0].rate);
  }

  return null;
}

/**
 * Convert an amount from one currency to another.
 * Returns the original amount if rate is not found (graceful fallback).
 */
export async function convertAmount(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<number> {
  const rate = await getExchangeRate(fromCurrency, toCurrency);
  if (rate === null) return amount; // Fallback: return unconverted
  return Math.round(amount * rate);
}
