import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { authenticateUser, UnauthorizedError } from "@/server/mcp/auth";
import { createMcpServer } from "@/server/mcp/server";
import { JSONRPCMessage } from "@modelcontextprotocol/sdk/types.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface MCPSession {
  userId: string;
  server: ReturnType<typeof createMcpServer>;
  messageQueue: JSONRPCMessage[];
  controller: ReadableStreamDefaultController<Uint8Array> | null;
  isActive: boolean;
}

const sessions = new Map<string, MCPSession>();

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const userId = await authenticateUser(authHeader);

    const sessionId = randomUUID();
    const server = createMcpServer(userId);

    let controller: ReadableStreamDefaultController<Uint8Array> | null = null;

    const stream = new ReadableStream({
      async start(ctrl) {
        controller = ctrl;

        const session: MCPSession = {
          userId,
          server,
          messageQueue: [],
          controller: ctrl,
          isActive: true,
        };

        sessions.set(sessionId, session);

        const encoder = new TextEncoder();

        ctrl.enqueue(
          encoder.encode(
            `event: endpoint\ndata: /api/mcp/message?sessionId=${sessionId}\n\n`
          )
        );
      },

      cancel() {
        const session = sessions.get(sessionId);
        if (session) {
          session.isActive = false;
          sessions.delete(sessionId);
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "X-Session-Id": sessionId,
      },
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    console.error("MCP SSE connection error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
