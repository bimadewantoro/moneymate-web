import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/server/db";
import { apiKeys } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "API Key ID is required" }, { status: 400 });
    }

    const deleted = await db
      .delete(apiKeys)
      .where(and(eq(apiKeys.id, id), eq(apiKeys.userId, session.user.id)))
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
