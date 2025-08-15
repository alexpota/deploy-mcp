import { BaseAdapter } from "../adapters/index.js";
import { DeploymentStatus, ToolArguments } from "../types.js";
import {
  checkDeploymentStatusSchema,
  watchDeploymentSchema,
  compareDeploymentsSchema,
  getDeploymentLogsSchema,
  tools,
} from "./tools.js";
import { DeploymentIntelligence } from "./deployment-intelligence.js";
import { DEFAULTS } from "./constants.js";
import { ResponseFormatter, MCPResponse } from "./response-formatter.js";

export class MCPHandler {
  private deploymentIntelligenceCache: Map<string, DeploymentIntelligence> =
    new Map();
  private cacheTimestamps: Map<string, number> = new Map();
  private readonly maxCacheAge = DEFAULTS.CACHE_TTL_MS;
  private cleanupTimer?: ReturnType<typeof setInterval>;

  constructor(private adapters: Map<string, BaseAdapter>) {
    this.startCacheCleanup();
  }

  private getDeploymentIntelligence(platform: string): DeploymentIntelligence {
    const now = Date.now();
    const cached = this.deploymentIntelligenceCache.get(platform);
    const timestamp = this.cacheTimestamps.get(platform);

    if (cached && timestamp && now - timestamp < this.maxCacheAge) {
      this.cacheTimestamps.set(platform, now);
      return cached;
    }

    if (cached) {
      this.deploymentIntelligenceCache.delete(platform);
      this.cacheTimestamps.delete(platform);
    }

    const instance = new DeploymentIntelligence(platform);
    this.deploymentIntelligenceCache.set(platform, instance);
    this.cacheTimestamps.set(platform, now);

    if (this.deploymentIntelligenceCache.size > DEFAULTS.MAX_CACHE_SIZE) {
      this.evictOldestEntry();
    }

    return instance;
  }

  private evictOldestEntry(): void {
    let oldestPlatform: string | undefined;
    let oldestTime = Date.now();

    for (const [platform, timestamp] of this.cacheTimestamps.entries()) {
      if (timestamp < oldestTime) {
        oldestTime = timestamp;
        oldestPlatform = platform;
      }
    }

    if (oldestPlatform) {
      this.deploymentIntelligenceCache.delete(oldestPlatform);
      this.cacheTimestamps.delete(oldestPlatform);
    }
  }

  private startCacheCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      const now = Date.now();
      const platformsToDelete: string[] = [];

      for (const [platform, timestamp] of this.cacheTimestamps.entries()) {
        if (now - timestamp > this.maxCacheAge) {
          platformsToDelete.push(platform);
        }
      }

      for (const platform of platformsToDelete) {
        this.deploymentIntelligenceCache.delete(platform);
        this.cacheTimestamps.delete(platform);
      }
    }, DEFAULTS.CACHE_CLEANUP_INTERVAL_MS); // Run cleanup periodically
  }

  public dispose(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.deploymentIntelligenceCache.clear();
    this.cacheTimestamps.clear();
  }

  async handleToolCall(tool: string, args: any): Promise<MCPResponse | any> {
    switch (tool) {
      case "check_deployment_status":
        return this.checkDeploymentStatus(args);
      case "watch_deployment":
        return this.watchDeployment(args);
      case "compare_deployments":
        return this.compareDeployments(args);
      case "get_deployment_logs":
        return this.getDeploymentLogs(args);
      default:
        throw new Error(`Unknown tool: ${tool}`);
    }
  }

  async handleRequest(request: any): Promise<any> {
    if (request.method === "tools/call") {
      const { name, arguments: args } = request.params;
      const result = await this.handleToolCall(name, args);

      // If result is MCPResponse, use the display field for pretty output
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
    }

    if (request.method === "tools/list") {
      return {
        tools: tools.map(tool => ({
          ...tool,
          inputSchema: this.schemaToJsonSchema(tool.inputSchema),
        })),
      };
    }

    throw new Error(`Unknown method: ${request.method}`);
  }

  private async checkDeploymentStatus(
    args: ToolArguments
  ): Promise<MCPResponse> {
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
      const formattedStatus = this.formatResponse(status, validated.platform);
      return ResponseFormatter.formatStatus(formattedStatus);
    } catch (error) {
      console.error(`Error checking deployment status:`, error);
      // Return the actual error message instead of a fake failed status
      throw new Error(
        `Failed to get deployment status: ${error instanceof Error ? error.message : String(error)}`
      );
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

  private async watchDeployment(args: ToolArguments): Promise<MCPResponse> {
    const validated = watchDeploymentSchema.parse(args);
    const intelligence = this.getDeploymentIntelligence(validated.platform);

    const messages: string[] = [];
    const events: any[] = [];
    const generator = intelligence.watchDeployment(validated);

    for await (const event of generator) {
      const formatted = ResponseFormatter.formatWatchEvent(event);
      messages.push(formatted);
      events.push(event);
    }

    const display = `## Deployment Watch

### Real-time Updates
${messages.join("\n\n")}
`;

    const finalEvent = events[events.length - 1];
    const status =
      finalEvent?.type === "success"
        ? "success"
        : finalEvent?.type === "error"
          ? "error"
          : "in_progress";

    return {
      version: "1.0",
      tool: "watch_deployment",
      timestamp: new Date().toISOString(),
      display,
      data: { events },
      highlights: {
        status,
        url: finalEvent?.details?.url,
        duration: finalEvent?.details?.duration
          ? `${finalEvent.details.duration}s`
          : undefined,
      },
    };
  }

  private async compareDeployments(args: ToolArguments): Promise<MCPResponse> {
    const validated = compareDeploymentsSchema.parse(args);
    const intelligence = this.getDeploymentIntelligence(validated.platform);

    const comparison = await intelligence.compareDeployments(validated);

    if (!comparison) {
      return {
        version: "1.0",
        tool: "compare_deployments",
        timestamp: new Date().toISOString(),
        display: "Not enough deployments to compare",
        data: { message: "Not enough deployments to compare" },
        highlights: { status: "error" },
      };
    }

    return ResponseFormatter.formatComparison(comparison);
  }

  private async getDeploymentLogs(args: ToolArguments): Promise<MCPResponse> {
    const validated = getDeploymentLogsSchema.parse(args);
    const intelligence = this.getDeploymentIntelligence(validated.platform);

    const result = await intelligence.getDeploymentLogs(validated);

    const summary = {
      errorCount: (result.logs.match(/error/gi) || []).length,
      warningCount: (result.logs.match(/warning/gi) || []).length,
      deploymentUrl: null,
      hasErrors: result.analysis?.type !== "UNKNOWN",
    };

    return ResponseFormatter.formatLogs(
      result.logs,
      result.analysis || { type: "UNKNOWN", message: "No errors detected" },
      summary
    );
  }

  private schemaToJsonSchema(zodSchema: any): any {
    return JSON.parse(JSON.stringify(zodSchema));
  }
}
