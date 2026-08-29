import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "../../../../../mcp/auth";
import { mcpTransports } from "@/server/mcpTransports";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    await authenticateUser(authHeader); // Throws if unauthorized

    const sessionId = request.nextUrl.searchParams.get("sessionId");
    if (!sessionId) {
      return new NextResponse("Missing sessionId", { status: 400 });
    }

    const transport = mcpTransports.get(sessionId);
    if (!transport) {
      return new NextResponse("Session not found or expired", { status: 404 });
    }

    const body = await request.json();
    await transport.handleMessage(body);

    return new NextResponse("Accepted", { status: 202 });
  } catch (error: any) {
    if (error.message?.includes("Unauthorized")) {
      return new NextResponse(error.message, { status: 401 });
    }
    console.error("MCP POST Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
