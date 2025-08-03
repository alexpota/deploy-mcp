import { BaseAdapter } from "../adapters/index.js";
import { DeploymentStatus, ToolArguments } from "../types.js";
import { checkDeploymentStatusSchema } from "./tools.js";

export class MCPHandler {
  constructor(private adapters: Map<string, BaseAdapter>) {}

  async handleToolCall(tool: string, args: any): Promise<any> {
    switch (tool) {
      case "check_deployment_status":
        return this.checkDeploymentStatus(args);
      default:
        throw new Error(`Unknown tool: ${tool}`);
    }
  }

  async handleRequest(request: any): Promise<any> {
    if (request.method === "tools/call") {
      const { name, arguments: args } = request.params;
      const result = await this.handleToolCall(name, args);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }

    if (request.method === "tools/list") {
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
    }

    throw new Error(`Unknown method: ${request.method}`);
  }

  private async checkDeploymentStatus(
    args: ToolArguments
  ): Promise<DeploymentStatus> {
    const validated = checkDeploymentStatusSchema.parse(args);

    const adapter = this.adapters.get(validated.platform);
    if (!adapter) {
      throw new Error(`Unsupported platform: ${validated.platform}`);
    }

    try {
      const status = await adapter.getLatestDeployment(
        validated.project,
        validated.token
      );
      return this.formatResponse(status, validated.platform);
    } catch (error) {
      console.error(`Error checking deployment status: ${error}`);
      return {
        status: "error",
        platform: validated.platform,
        projectName: validated.project,
        timestamp: new Date().toISOString(),
      };
    }
  }

  private formatResponse(
    status: DeploymentStatus,
    platform: string
  ): DeploymentStatus {
    return {
      ...status,
      platform: platform,
      timestamp: status.timestamp || new Date().toISOString(),
    };
  }
}
