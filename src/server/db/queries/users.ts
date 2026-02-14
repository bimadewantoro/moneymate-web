/**
 * User Queries (Data Access Layer)
 *
 * Read operations for user data.
 */

import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";

/**
 * Get a user's base currency preference
 */
export async function getUserBaseCurrency(userId: string): Promise<string> {
  const result = await db
    .select({ baseCurrency: users.baseCurrency })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return result[0]?.baseCurrency || "IDR";
}
