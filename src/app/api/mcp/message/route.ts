import { NextRequest, NextResponse } from "next/server";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { authenticateUser, UnauthorizedError } from "@/server/mcp/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const activeSessions = new Map<
  string,
  {
    transport: InstanceType<typeof SSEServerTransport>;
  }
>();

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    await authenticateUser(authHeader);

    const sessionId = request.nextUrl.searchParams.get("sessionId");
    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing sessionId parameter" },
        { status: 400 }
      );
    }

    const session = activeSessions.get(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: "Session not found or expired" },
        { status: 404 }
      );
    }

    const body = await request.json();

    const nodeRequest = {
      headers: Object.fromEntries(request.headers.entries()),
      url: request.url,
      socket: { remoteAddress: request.headers.get("x-forwarded-for") },
    } as any;

    const nodeResponse = {
      writeHead: (statusCode: number, headers?: Record<string, string>) => {},
      write: (data: string) => {},
      end: (data?: string) => {},
    } as any;

    let responseData = "";
    nodeResponse.write = (data: string) => {
      responseData += data;
    };

    await session.transport.handlePostMessage(nodeRequest, nodeResponse, body);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    console.error("MCP POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export function registerSession(
  sessionId: string,
  transport: InstanceType<typeof SSEServerTransport>
) {
  activeSessions.set(sessionId, { transport });
}

export function unregisterSession(sessionId: string) {
  activeSessions.delete(sessionId);
}
