#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { MCPHandler } from "./core/mcp-handler.js";
import { VercelAdapter } from "./adapters/index.js";

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
    tools: [
      {
        name: "check_deployment_status",
        description:
          "Check the latest deployment status for a project on a platform",
        inputSchema: {
          type: "object",
          properties: {
            platform: {
              type: "string",
              enum: ["vercel"],
              description: "The deployment platform",
            },
            project: {
              type: "string",
              description: "The project name or ID",
            },
            token: {
              type: "string",
              description:
                "API token for authentication (optional if set in environment)",
            },
          },
          required: ["platform", "project"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
  try {
    const result = await handler.handleToolCall(
      request.params.name,
      request.params.arguments
    );

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
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
