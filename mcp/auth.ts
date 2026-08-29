import * as crypto from "node:crypto";
import { db } from "../src/server/db/index";
import { apiKeys } from "../src/server/db/schema";
import { eq } from "drizzle-orm";

export async function authenticateUser(authHeader: string | null): Promise<string> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Unauthorized: Missing or invalid Bearer token");
  }

  const token = authHeader.replace("Bearer ", "").trim();

  // Support fallback for `.env` configured key if it matches
  if (
    process.env.MONEYMATE_MCP_API_KEY && 
    token === process.env.MONEYMATE_MCP_API_KEY
  ) {
    const keyHash = crypto.createHash("sha256").update(token).digest("hex");
    const records = await db
      .select({ id: apiKeys.id, userId: apiKeys.userId })
      .from(apiKeys)
      .where(eq(apiKeys.keyHash, keyHash))
      .limit(1);
    
    if (records[0]) {
      db.update(apiKeys)
        .set({ lastUsedAt: new Date() })
        .where(eq(apiKeys.id, records[0].id))
        .catch(() => {});
      return records[0].userId;
    }
  }

  const keyHash = crypto.createHash("sha256").update(token).digest("hex");

  const records = await db
    .select({
      id: apiKeys.id,
      userId: apiKeys.userId,
    })
    .from(apiKeys)
    .where(eq(apiKeys.keyHash, keyHash))
    .limit(1);

  const keyRecord = records[0];
  if (!keyRecord) {
    throw new Error("Unauthorized: Invalid or revoked API KEY");
  }

  await db.update(apiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiKeys.id, keyRecord.id))
    .catch((err: unknown) => {
      console.error("Failed to update last_used_at for API key:", err);
    });

  return keyRecord.userId;
}
