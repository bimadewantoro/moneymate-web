import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { auth } from "@/auth";
import { db } from "@/server/db";
import { apiKeys } from "@/server/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const keys = await db
      .select({
        id: apiKeys.id,
        name: apiKeys.name,
        createdAt: apiKeys.createdAt,
        lastUsedAt: apiKeys.lastUsedAt,
      })
      .from(apiKeys)
      .where(eq(apiKeys.userId, session.user.id))
      .orderBy(desc(apiKeys.createdAt));

    return NextResponse.json({
      keys: keys.map((k) => ({
        id: k.id,
        name: k.name,
        created_at: k.createdAt,
        last_used_at: k.lastUsedAt,
      })),
    });
  } catch (error) {
    console.error("Failed to list API keys:", error);
    return NextResponse.json(
      { error: "Failed to list API keys" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let name = "MCP Agent";
    try {
      const body = await request.json();
      if (body?.name && typeof body.name === "string" && body.name.trim().length > 0) {
        name = body.name.trim();
      }
    } catch {
      // Body is optional, default to "MCP Agent"
    }

    const rawSecret = crypto.randomBytes(32).toString("hex");
    const rawToken = `mcp_sec_${rawSecret}`;
    const keyHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    const inserted = await db
      .insert(apiKeys)
      .values({
        userId: session.user.id,
        keyHash,
        name,
      })
      .returning({
        id: apiKeys.id,
        name: apiKeys.name,
        createdAt: apiKeys.createdAt,
      });

    const keyRecord = inserted[0];

    return NextResponse.json(
      {
        message: "API Key created successfully. Please copy it now; you will not be able to see it again.",
        key: rawToken,
        token: {
          id: keyRecord.id,
          name: keyRecord.name,
          created_at: keyRecord.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create API key:", error);
    return NextResponse.json(
      { error: "Failed to create API key" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    let keyId = searchParams.get("id");

    if (!keyId) {
      try {
        const body = await request.json();
        if (body?.id && typeof body.id === "string") {
          keyId = body.id;
        }
      } catch {
        // No body provided
      }
    }

    if (!keyId) {
      return NextResponse.json({ error: "API Key ID is required" }, { status: 400 });
    }

    const deleted = await db
      .delete(apiKeys)
      .where(and(eq(apiKeys.id, keyId), eq(apiKeys.userId, session.user.id)))
      .returning({ id: apiKeys.id });

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: "API key not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "API key revoked successfully" });
  } catch (error) {
    console.error("Failed to delete API key:", error);
    return NextResponse.json(
      { error: "Failed to delete API key" },
      { status: 500 }
    );
  }
}
