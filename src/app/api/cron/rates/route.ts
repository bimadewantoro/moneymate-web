/**
 * Cron Route: Exchange Rate Refresh
 *
 * Fetches latest exchange rates for common base currencies and stores them.
 * Protected by a CRON_SECRET environment variable.
 *
 * Usage: GET /api/cron/rates?secret=YOUR_CRON_SECRET
 * Or via Vercel Cron with CRON_SECRET header.
 */

import { NextResponse } from "next/server";
import { fetchAndStoreRates } from "@/lib/exchange-rates";

// Common base currencies to fetch rates for
const BASE_CURRENCIES = ["USD", "EUR", "IDR", "GBP", "SGD", "AUD", "JPY", "MYR"];

export async function GET(request: Request) {
  // Verify authorization
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const headerSecret = request.headers.get("authorization")?.replace("Bearer ", "");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && secret !== cronSecret && headerSecret !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const results: { currency: string; status: string }[] = [];

    for (const currency of BASE_CURRENCIES) {
      try {
        await fetchAndStoreRates(currency);
        results.push({ currency, status: "success" });
      } catch (error) {
        console.error(`Failed to fetch rates for ${currency}:`, error);
        results.push({ currency, status: "failed" });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Exchange rates refreshed",
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Exchange rate cron failed:", error);
    return NextResponse.json(
      { error: "Failed to refresh exchange rates" },
      { status: 500 }
    );
  }
}
