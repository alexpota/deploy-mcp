#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { MCPHandler } from "./core/mcp-handler.js";
import { VercelAdapter } from "./adapters/index.js";
import { tools } from "./core/tools.js";

const handler = new MCPHandler(
  new Map([
    ["vercel", new VercelAdapter()],
    // ['netlify', new NetlifyAdapter()] // To be implemented
  ])
);

const server = new Server(
  {
    name: "deploy-mcp",
    version: "0.1.0",
    description: "Universal deployment tracker for AI assistants",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: tools,
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
  try {
    const result = await handler.handleToolCall(
      request.params.name,
      request.params.arguments
    );

    // If result has a display field (MCPResponse), use that for formatted output
    const text = result.display
      ? result.display
      : JSON.stringify(result, null, 2);

    return {
      content: [
        {
          type: "text",
          text,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`,
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Deploy MCP server started");
}

main().catch(error => {
  console.error("Fatal error:", error);
  process.exit(1);
});
