import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// Use global to persist across Next.js hot reloads and requests
declare global {
  var mcpTransports: Map<string, SSEServerTransport> | undefined;
  var mcpServers: Map<string, McpServer> | undefined;
}

export const mcpTransports = globalThis.mcpTransports ?? new Map<string, SSEServerTransport>();
export const mcpServers = globalThis.mcpServers ?? new Map<string, McpServer>();

if (!globalThis.mcpTransports) {
  globalThis.mcpTransports = mcpTransports;
}
if (!globalThis.mcpServers) {
  globalThis.mcpServers = mcpServers;
}
