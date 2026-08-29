import { NextRequest, NextResponse } from "next/server";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { createMcpServer } from "../../../../mcp/server";
import { authenticateUser } from "../../../../mcp/auth";
import { mcpTransports, mcpServers } from "@/server/mcpTransports";
import * as crypto from "node:crypto";

async function handleMcpRequest(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    const userId = await authenticateUser(authHeader);

    // Look for existing session ID in headers or search params
    const sessionId =
      request.headers.get("mcp-session-id") ||
      request.nextUrl.searchParams.get("sessionId");

    let transport: WebStandardStreamableHTTPServerTransport | undefined;
    let activeSessionId = sessionId;

    if (activeSessionId && mcpTransports.has(activeSessionId)) {
      transport = mcpTransports.get(activeSessionId)!;
    } else {
      // Create a new transport session
      activeSessionId = crypto.randomUUID();
      transport = new WebStandardStreamableHTTPServerTransport({
        sessionIdGenerator: () => activeSessionId!,
      });

      mcpTransports.set(activeSessionId, transport);

      const server = createMcpServer(userId);
      mcpServers.set(activeSessionId, server);

      await server.connect(transport);
    }

    return await transport.handleRequest(request);
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    if (errMessage.includes("Unauthorized")) {
      return new NextResponse(errMessage, { status: 401 });
    }
    console.error("MCP Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return handleMcpRequest(request);
}

export async function POST(request: NextRequest) {
  return handleMcpRequest(request);
}

export async function DELETE(request: NextRequest) {
  return handleMcpRequest(request);
}
