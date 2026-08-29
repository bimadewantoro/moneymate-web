import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// Keep track of active transports by session ID
export const mcpTransports = new Map<string, SSEServerTransport>();
export const mcpServers = new Map<string, McpServer>();
