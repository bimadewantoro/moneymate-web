import { NextRequest, NextResponse } from "next/server";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { createMcpServer } from "../../../../mcp/server";
import { authenticateUser } from "../../../../mcp/auth";
import { mcpTransports, mcpServers } from "@/server/mcpTransports";
import { ServerResponse } from "node:http";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    const userId = await authenticateUser(authHeader);

    let responseStream: ReadableStreamDefaultController;
    const stream = new ReadableStream({
      start(controller) {
        responseStream = controller;
      },
      cancel() {
        // Clean up when client disconnects
      },
    });

    const encoder = new TextEncoder();

    const mockResponse = new ServerResponse({} as any);
    mockResponse.writeHead = (statusCode: number, headers?: any) => {
      return mockResponse;
    };
    mockResponse.write = (chunk: any) => {
      try {
        const payload = typeof chunk === "string" ? encoder.encode(chunk) : chunk;
        responseStream.enqueue(payload);
      } catch (e) {
        // Ignore enqueue errors if stream is closed
      }
      return true;
    };
    mockResponse.end = () => {
      try {
        responseStream.close();
      } catch (e) {}
      return mockResponse;
    };
    mockResponse.on = (event: string, callback: any) => {
      if (event === "close") {
        request.signal.addEventListener("abort", callback);
      }
      return mockResponse;
    };

    const transport = new SSEServerTransport("/api/mcp/message", mockResponse as any);
    const sessionId = transport.sessionId;
    
    mcpTransports.set(sessionId, transport);

    const server = createMcpServer(userId);
    mcpServers.set(sessionId, server);

    server.connect(transport).catch((err) => {
      console.error("MCP connection error:", err);
    });

    request.signal.addEventListener("abort", () => {
      mcpTransports.delete(sessionId);
      mcpServers.delete(sessionId);
      transport.close().catch(() => {});
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error: any) {
    if (error.message?.includes("Unauthorized")) {
      return new NextResponse(error.message, { status: 401 });
    }
    console.error("MCP SSE Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
