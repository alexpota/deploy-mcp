import { BaseAdapter } from "../adapters/base";
import { VercelAdapter } from "../adapters/vercel";
import type {
  WatchDeploymentArgs,
  CompareDeploymentsArgs,
  GetDeploymentLogsArgs,
} from "./tools";
import {
  MAX_DEPLOYMENT_WATCH_ATTEMPTS,
  BUILD_TIME_SECONDS_DIVISOR,
  HIGH_RISK_THRESHOLD_PERCENT,
  MEDIUM_RISK_THRESHOLD_PERCENT,
  DEFAULT_COMPARISON_COUNT,
  SINGLE_DEPLOYMENT_FETCH,
  DEPLOYMENT_STATES,
  POLLING_INTERVALS_BY_STATE,
  MAX_WATCH_TIME_MS,
  LOG_FILTERS,
  ERROR_MESSAGES,
  STATUS_MESSAGES,
  DEFAULTS,
} from "./constants";

export interface DeploymentEvent {
  type: "progress" | "error" | "success" | "warning";
  message: string;
  timestamp: string;
  details?: {
    file?: string;
    line?: number;
    suggestion?: string;
    fullError?: string;
    url?: string;
    duration?: number;
    comparison?: any;
  };
}

export interface ErrorAnalysis {
  type: ErrorType;
  message: string;
  location?: string;
  suggestion?: string;
  quickFix?: string;
  rollbackAvailable?: boolean;
}

export type ErrorType =
  | "BUILD"
  | "TYPESCRIPT"
  | "MISSING_DEPENDENCY"
  | "ENV_VAR"
  | "TIMEOUT"
  | "UNKNOWN";

export interface DeploymentComparison {
  deployments: {
    current: {
      id: string;
      url?: string;
      timestamp: string;
      commit?: {
        sha: string;
        message: string;
        author: string;
      };
      buildTime: number;
      status: string;
      timeAgo: string;
    };
    previous: {
      id: string;
      url?: string;
      timestamp: string;
      commit?: {
        sha: string;
        message: string;
        author: string;
      };
      buildTime: number;
      status: string;
      timeAgo: string;
    };
  };
  performance: {
    buildTime: {
      current: number;
      previous: number;
      delta: number;
      percentage: number;
    };
    bundleSize?: {
      current: number;
      previous: number;
      delta: number;
      percentage: number;
    };
  };
  changes: {
    filesChanged?: number;
    dependencies?: {
      added: string[];
      removed: string[];
      updated: string[];
    };
    envVars?: {
      added: string[];
      removed: string[];
    };
  };
  risk: "HIGH" | "MEDIUM" | "LOW";
}

export class DeploymentIntelligence {
  private adapter: BaseAdapter;

  constructor(platform: string) {
    // Platform-agnostic adapter selection
    this.adapter = this.createAdapter(platform);
  }

  private getPollingInterval(state: string): number {
    // Dynamic polling intervals based on deployment state
    return (
      POLLING_INTERVALS_BY_STATE[
        state as keyof typeof POLLING_INTERVALS_BY_STATE
      ] || POLLING_INTERVALS_BY_STATE.UNKNOWN
    );
  }

  private getTimeAgo(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    return `${seconds} second${seconds > 1 ? "s" : ""} ago`;
  }

  private mapDeploymentState(state: string): string {
    switch (state) {
      case "READY":
        return "success";
      case "ERROR":
      case "CANCELED":
        return "failed";
      case "BUILDING":
      case "INITIALIZING":
      case "QUEUED":
        return "building";
      default:
        return "unknown";
    }
  }

  private createAdapter(platform: string): BaseAdapter {
    switch (platform) {
      case "vercel":
        return new VercelAdapter();
      // Ready for future platforms
      // case "netlify":
      //   return new NetlifyAdapter();
      // case "railway":
      //   return new RailwayAdapter();
      // case "render":
      //   return new RenderAdapter();
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  async *watchDeployment(
    args: WatchDeploymentArgs
  ): AsyncGenerator<DeploymentEvent> {
    const token = args.token || process.env.VERCEL_TOKEN;
    if (!token) {
      yield {
        type: "error",
        message: ERROR_MESSAGES.NO_TOKEN,
        timestamp: new Date().toISOString(),
      };
      return;
    }

    try {
      let deploymentId = args.deploymentId;

      if (!deploymentId) {
        const deployments = await this.adapter.getRecentDeployments(
          args.project,
          token,
          SINGLE_DEPLOYMENT_FETCH
        );

        if (deployments.length > 0) {
          deploymentId = deployments[0].uid || deployments[0].id;
        }
      }

      if (!deploymentId) {
        yield {
          type: "error",
          message: ERROR_MESSAGES.NO_DEPLOYMENT_FOUND,
          timestamp: new Date().toISOString(),
        };
        return;
      }

      yield {
        type: "progress",
        message: STATUS_MESSAGES.STARTING_WATCH(
          deploymentId.slice(0, DEFAULTS.DEPLOYMENT_ID_SLICE_LENGTH)
        ),
        timestamp: new Date().toISOString(),
      };

      let lastState = "";
      let attempts = 0;
      const maxAttempts = MAX_DEPLOYMENT_WATCH_ATTEMPTS;
      const startTime = Date.now();
      const maxWatchTime = MAX_WATCH_TIME_MS;

      while (attempts < maxAttempts && Date.now() - startTime < maxWatchTime) {
        try {
          const deployment = await this.adapter.getDeploymentById(
            deploymentId,
            token
          );

          if (deployment.readyState !== lastState) {
            lastState = deployment.readyState;

            switch (deployment.readyState) {
              case DEPLOYMENT_STATES.INITIALIZING:
                yield {
                  type: "progress",
                  message: STATUS_MESSAGES.INITIALIZING,
                  timestamp: new Date().toISOString(),
                };
                break;

              case DEPLOYMENT_STATES.BUILDING:
                yield {
                  type: "progress",
                  message: STATUS_MESSAGES.BUILDING,
                  timestamp: new Date().toISOString(),
                };
                break;

              case DEPLOYMENT_STATES.UPLOADING:
                yield {
                  type: "progress",
                  message: STATUS_MESSAGES.UPLOADING,
                  timestamp: new Date().toISOString(),
                };
                break;

              case DEPLOYMENT_STATES.DEPLOYING:
                yield {
                  type: "progress",
                  message: STATUS_MESSAGES.DEPLOYING,
                  timestamp: new Date().toISOString(),
                };
                break;

              case DEPLOYMENT_STATES.READY: {
                const duration =
                  deployment.buildingAt && deployment.ready
                    ? deployment.ready - deployment.buildingAt
                    : undefined;

                yield {
                  type: "success",
                  message: STATUS_MESSAGES.DEPLOYMENT_SUCCESS,
                  timestamp: new Date().toISOString(),
                  details: {
                    url: deployment.url,
                    duration: duration
                      ? Math.round(duration / BUILD_TIME_SECONDS_DIVISOR)
                      : undefined,
                  },
                };

                try {
                  const comparison = await this.compareWithPrevious(
                    args.project,
                    deploymentId,
                    token
                  );

                  if (comparison) {
                    yield {
                      type: "progress",
                      message: this.formatComparison(comparison),
                      timestamp: new Date().toISOString(),
                    };
                  }
                } catch (e) {
                  console.error("Failed to compare deployments:", e);
                }

                return;
              }

              case DEPLOYMENT_STATES.ERROR:
              case DEPLOYMENT_STATES.CANCELED: {
                const errorDetails = await this.analyzeError(
                  deploymentId,
                  token
                );

                yield {
                  type: "error",
                  message: STATUS_MESSAGES.DEPLOYMENT_FAILED(
                    errorDetails.message
                  ),
                  timestamp: new Date().toISOString(),
                  details: {
                    suggestion: errorDetails.suggestion,
                    file: errorDetails.location,
                  },
                };
                return;
              }
            }
          }

          if (
            deployment.readyState === DEPLOYMENT_STATES.READY ||
            deployment.readyState === DEPLOYMENT_STATES.ERROR ||
            deployment.readyState === DEPLOYMENT_STATES.CANCELED
          ) {
            break;
          }

          // Use dynamic polling interval based on current state
          const pollInterval = this.getPollingInterval(lastState || "UNKNOWN");
          if (pollInterval === 0) {
            break; // Terminal state reached
          }
          await new Promise(resolve => setTimeout(resolve, pollInterval));
          attempts++;
        } catch (error) {
          console.error("Error checking deployment status:", error);
          attempts++;
          // Use dynamic polling interval based on current state
          const pollInterval = this.getPollingInterval(lastState || "UNKNOWN");
          if (pollInterval === 0) {
            break; // Terminal state reached
          }
          await new Promise(resolve => setTimeout(resolve, pollInterval));
        }
      }

      if (
        attempts >= maxAttempts ||
        Date.now() - startTime >= MAX_WATCH_TIME_MS
      ) {
        const timeoutSeconds = Math.round((Date.now() - startTime) / 1000);
        yield {
          type: "warning",
          message: `Deployment watch timed out after ${timeoutSeconds} seconds. The deployment may still be running.`,
          timestamp: new Date().toISOString(),
          details: {
            suggestion: "Check the platform dashboard for the latest status",
          },
        };
      }
    } catch (error) {
      yield {
        type: "error",
        message: `Error watching deployment: ${error instanceof Error ? error.message : "Unknown error"}`,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async compareDeployments(
    args: CompareDeploymentsArgs
  ): Promise<DeploymentComparison | null> {
    const token = args.token || process.env.VERCEL_TOKEN;
    if (!token) {
      throw new Error("No Vercel token provided");
    }

    try {
      const deployments = await this.adapter.getRecentDeployments(
        args.project,
        token,
        args.count
      );

      if (deployments.length < 2) {
        return null;
      }

      const [current, previous] = deployments;

      const currentBuildTime =
        current.buildingAt && current.ready
          ? Math.round(
              (current.ready - current.buildingAt) / BUILD_TIME_SECONDS_DIVISOR
            )
          : 0;

      const previousBuildTime =
        previous.buildingAt && previous.ready
          ? Math.round(
              (previous.ready - previous.buildingAt) /
                BUILD_TIME_SECONDS_DIVISOR
            )
          : 0;

      const comparison: DeploymentComparison = {
        deployments: {
          current: {
            id: current.uid || current.id,
            url: current.url ? `https://${current.url}` : undefined,
            timestamp: new Date(current.createdAt).toISOString(),
            commit: current.meta
              ? {
                  sha: current.meta.githubCommitSha,
                  message: current.meta.githubCommitMessage,
                  author: current.meta.githubCommitAuthorName,
                }
              : undefined,
            buildTime: currentBuildTime,
            status: this.mapDeploymentState(
              current.state || current.readyState
            ),
            timeAgo: this.getTimeAgo(current.createdAt),
          },
          previous: {
            id: previous.uid || previous.id,
            url: previous.url ? `https://${previous.url}` : undefined,
            timestamp: new Date(previous.createdAt).toISOString(),
            commit: previous.meta
              ? {
                  sha: previous.meta.githubCommitSha,
                  message: previous.meta.githubCommitMessage,
                  author: previous.meta.githubCommitAuthorName,
                }
              : undefined,
            buildTime: previousBuildTime,
            status: this.mapDeploymentState(
              previous.state || previous.readyState
            ),
            timeAgo: this.getTimeAgo(previous.createdAt),
          },
        },
        performance: {
          buildTime: {
            current: currentBuildTime,
            previous: previousBuildTime,
            delta: 0,
            percentage: 0,
          },
        },
        changes: {
          filesChanged: 0,
        },
        risk: "LOW",
      };

      comparison.performance.buildTime.delta =
        comparison.performance.buildTime.current -
        comparison.performance.buildTime.previous;

      comparison.performance.buildTime.percentage =
        comparison.performance.buildTime.previous > 0
          ? Math.round(
              (comparison.performance.buildTime.delta /
                comparison.performance.buildTime.previous) *
                DEFAULTS.PERCENTAGE_MULTIPLIER
            )
          : 0;

      if (
        Math.abs(comparison.performance.buildTime.percentage) >
        HIGH_RISK_THRESHOLD_PERCENT
      ) {
        comparison.risk = "HIGH";
      } else if (
        Math.abs(comparison.performance.buildTime.percentage) >
        MEDIUM_RISK_THRESHOLD_PERCENT
      ) {
        comparison.risk = "MEDIUM";
      }

      return comparison;
    } catch (error) {
      console.error("Error comparing deployments:", error);
      return null;
    }
  }

  async getDeploymentLogs(
    args: GetDeploymentLogsArgs
  ): Promise<{ logs: string; analysis?: ErrorAnalysis }> {
    const token = args.token || process.env.VERCEL_TOKEN;
    if (!token) {
      throw new Error("No Vercel token provided");
    }

    try {
      const logs = await this.adapter.getDeploymentLogs(
        args.deploymentId,
        token
      );

      let filteredLogs = logs;

      if (args.filter === "error") {
        const lines = logs.split("\n");
        filteredLogs = lines
          .filter(line => LOG_FILTERS.ERROR.test(line))
          .join("\n");
      } else if (args.filter === "warning") {
        const lines = logs.split("\n");
        filteredLogs = lines
          .filter(line => LOG_FILTERS.WARNING.test(line))
          .join("\n");
      }

      const analysis = this.analyzeLogs(filteredLogs);

      return {
        logs: filteredLogs || ERROR_MESSAGES.NO_LOGS_MATCHING_FILTER,
        analysis,
      };
    } catch (error) {
      throw new Error(
        `Failed to get deployment logs: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  private async analyzeError(
    deploymentId: string,
    token: string
  ): Promise<ErrorAnalysis> {
    try {
      const logs = await this.adapter.getDeploymentLogs(deploymentId, token);
      return this.analyzeLogs(logs);
    } catch {
      return {
        type: "UNKNOWN",
        message: "Deployment failed - unable to fetch logs",
        suggestion: "Check deployment platform dashboard",
      };
    }
  }

  private analyzeLogs(logs: string): ErrorAnalysis {
    const lowerLogs = logs.toLowerCase();
    const lines = logs.split("\n");

    // Simple categorization for context - AI will do the real analysis
    let type: ErrorType = "UNKNOWN";
    let quickContext = "";
    let location: string | undefined;
    let errorLine: string | undefined;

    // Extract file location and line numbers
    for (const line of lines) {
      // Match TypeScript/JavaScript error patterns like "file.tsx:10:5"
      const fileMatch = line.match(/([^\s:]+\.(tsx?|jsx?|js|ts)):(\d+):(\d+)/);
      if (fileMatch && line.toLowerCase().includes("error")) {
        location = `${fileMatch[1]}:${fileMatch[3]}:${fileMatch[4]}`;
        errorLine = line.trim();
        break;
      }
    }

    // If no specific file location found, look for general error lines
    if (!errorLine) {
      errorLine =
        lines.find(line => line.toLowerCase().includes("error"))?.trim() ||
        "Check logs for details";
    }

    // Just identify the general category
    if (
      lowerLogs.includes("cannot find module") ||
      lowerLogs.includes("modulenotfounderror")
    ) {
      type = "MISSING_DEPENDENCY";
      quickContext = "Missing package/dependency";
    } else if (
      lowerLogs.includes("environment variable") ||
      lowerLogs.includes("env var")
    ) {
      type = "ENV_VAR";
      quickContext = "Environment variable issue";
    } else if (
      lowerLogs.includes("timeout") ||
      lowerLogs.includes("time limit")
    ) {
      type = "TIMEOUT";
      quickContext = "Build timeout exceeded";
    } else if (lowerLogs.includes("error") || lowerLogs.includes("failed")) {
      type = "BUILD";
      quickContext = "Build failed";
    }

    return {
      type,
      message: quickContext || errorLine,
      location,
      suggestion: location
        ? `Error at ${location} - check the file for issues`
        : "See full logs below for detailed analysis",
    };
  }

  private async compareWithPrevious(
    project: string,
    currentDeploymentId: string,
    token: string
  ): Promise<DeploymentComparison | null> {
    try {
      const deployments = await this.adapter.getRecentDeployments(
        project,
        token,
        DEFAULT_COMPARISON_COUNT
      );

      if (deployments.length < 2) {
        return null;
      }

      const current =
        deployments.find(d => d.id === currentDeploymentId) || deployments[0];
      const previous =
        deployments.find(d => d.id !== currentDeploymentId) || deployments[1];

      const currentBuildTime =
        current.buildingAt && current.ready
          ? Math.round(
              (current.ready - current.buildingAt) / BUILD_TIME_SECONDS_DIVISOR
            )
          : 0;

      const previousBuildTime =
        previous.buildingAt && previous.ready
          ? Math.round(
              (previous.ready - previous.buildingAt) /
                BUILD_TIME_SECONDS_DIVISOR
            )
          : 0;

      const delta = currentBuildTime - previousBuildTime;
      const percentage =
        previousBuildTime > 0
          ? Math.round(
              (delta / previousBuildTime) * DEFAULTS.PERCENTAGE_MULTIPLIER
            )
          : 0;

      return {
        deployments: {
          current: {
            id: current.uid || current.id || "",
            url: current.url,
            timestamp: current.createdAt || new Date().toISOString(),
            status: current.state || "unknown",
            buildTime: currentBuildTime,
            timeAgo: this.getTimeAgo(new Date(current.createdAt).getTime()),
          },
          previous: {
            id: previous.uid || previous.id || "",
            url: previous.url,
            timestamp: previous.createdAt || new Date().toISOString(),
            status: previous.state || "unknown",
            buildTime: previousBuildTime,
            timeAgo: this.getTimeAgo(new Date(previous.createdAt).getTime()),
          },
        },
        performance: {
          buildTime: {
            current: currentBuildTime,
            previous: previousBuildTime,
            delta,
            percentage,
          },
        },
        changes: {},
        risk:
          Math.abs(percentage) > HIGH_RISK_THRESHOLD_PERCENT
            ? "HIGH"
            : Math.abs(percentage) > MEDIUM_RISK_THRESHOLD_PERCENT
              ? "MEDIUM"
              : "LOW",
      };
    } catch (error) {
      console.error("Error comparing with previous deployment:", error);
      return null;
    }
  }

  private formatComparison(comparison: DeploymentComparison): string {
    const { buildTime } = comparison.performance;

    if (buildTime.delta === 0) {
      return STATUS_MESSAGES.BUILD_TIME_SAME(buildTime.current);
    }

    const faster = buildTime.delta < 0;
    return STATUS_MESSAGES.BUILD_TIME_CHANGE(
      buildTime.current,
      buildTime.delta,
      faster
    );
  }
}
