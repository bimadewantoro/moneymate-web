import crypto from "node:crypto";
import { db } from "../db/index";
import { apiKeys } from "../db/schema";
import { eq } from "drizzle-orm";

export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export async function authenticateUser(authHeader: string | null): Promise<string> {
  if (!authHeader) {
    throw new UnauthorizedError("Missing Authorization header");
  }

  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    throw new UnauthorizedError("Invalid Authorization header format. Expected: Bearer <token>");
  }

  const apiKey = match[1].trim();
  if (!apiKey) {
    throw new UnauthorizedError("Empty API key");
  }

  const keyHash = crypto.createHash("sha256").update(apiKey).digest("hex");

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
    throw new UnauthorizedError("Invalid or revoked API key");
  }

  db.update(apiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiKeys.id, keyRecord.id))
    .catch((err: unknown) => {
      console.error("Failed to update last_used_at for API key:", err);
    });

  return keyRecord.userId;
}

export async function getAuthenticatedUser(): Promise<string> {
  const apiKey = process.env.MONEYMATE_MCP_API_KEY || process.env.FINANCE_MCP_API_KEY;

  if (!apiKey || apiKey.trim().length === 0) {
    console.error("Fatal: MONEYMATE_MCP_API_KEY environment variable is not set.");
    process.exit(1);
  }

  const keyHash = crypto.createHash("sha256").update(apiKey.trim()).digest("hex");

  try {
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
      console.error("Fatal: Invalid or revoked MONEYMATE_MCP_API_KEY.");
      process.exit(1);
    }

    db.update(apiKeys)
      .set({ lastUsedAt: new Date() })
      .where(eq(apiKeys.id, keyRecord.id))
      .catch((err: unknown) => {
        console.error("Failed to update last_used_at for API key:", err);
      });

    return keyRecord.userId;
  } catch (error) {
    console.error("Fatal: Database authentication failed:", error);
    process.exit(1);
  }
}
