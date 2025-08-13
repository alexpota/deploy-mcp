import {
  DeploymentComparison,
  ErrorAnalysis,
} from "./deployment-intelligence.js";

export interface MCPResponse {
  // Metadata for consistency
  version: "1.0";
  tool: string;
  timestamp: string;

  // Primary display (what user sees)
  display: string;

  // Structured data (for AI processing)
  data: any;

  // Quick access fields
  highlights?: {
    url?: string;
    status?: string;
    duration?: string;
    error?: string;
  };
}

export class ResponseFormatter {
  static formatComparison(data: DeploymentComparison): MCPResponse {
    const current = data.deployments.current;
    const previous = data.deployments.previous;
    const perf = data.performance.buildTime;

    const display = `## Deployment Comparison

### Current Deployment
**Status:** ${current.status === "success" ? "✅ Success" : "❌ Failed"}  
**URL:** ${current.url || "N/A"}  
**Time:** ${current.timeAgo}  
**Build Duration:** ${current.buildTime}s  

**Commit:** \`${current.commit?.sha?.slice(0, 7) || "N/A"}\` ${current.commit?.message || "No message"}  
**Author:** ${current.commit?.author || "Unknown"}  

### Previous Deployment
**Status:** ${previous.status === "success" ? "✅ Success" : "❌ Failed"}  
**URL:** ${previous.url || "N/A"}  
**Time:** ${previous.timeAgo}  
**Build Duration:** ${previous.buildTime}s  

**Commit:** \`${previous.commit?.sha?.slice(0, 7) || "N/A"}\` ${previous.commit?.message || "No message"}  
**Author:** ${previous.commit?.author || "Unknown"}  

### Performance Analysis
**Build Time Change:** ${Math.abs(perf.delta)}s ${perf.delta < 0 ? "faster" : "slower"} (${perf.percentage}% ${perf.delta < 0 ? "improvement" : "increase"})  
**Risk Level:** ${data.risk === "LOW" ? "🟢 Low" : data.risk === "MEDIUM" ? "🟡 Medium" : "🔴 High"}  
`;

    return {
      version: "1.0",
      tool: "compare_deployments",
      timestamp: new Date().toISOString(),
      display,
      data,
      highlights: {
        url: current.url,
        status: current.status,
        duration: `${perf.delta}s ${perf.delta < 0 ? "faster" : "slower"}`,
      },
    };
  }

  static formatLogs(
    logs: string,
    analysis: ErrorAnalysis,
    summary: any
  ): MCPResponse {
    const truncatedLogs = logs.split("\n").slice(0, 30).join("\n");
    const isTruncated = logs.split("\n").length > 30;

    const display = `## Deployment Logs

### Summary
**Errors:** ${summary.errorCount === 0 ? "✅" : "❌"} ${summary.errorCount} error${summary.errorCount !== 1 ? "s" : ""}  
**Warnings:** ${summary.warningCount === 0 ? "✅" : "⚠️"} ${summary.warningCount} warning${summary.warningCount !== 1 ? "s" : ""}  
**URL:** ${summary.deploymentUrl || "Not available"}  

${
  analysis.type !== "UNKNOWN"
    ? `### Error Analysis
**Type:** ${analysis.type}  
**Message:** ${analysis.message}  
**Location:** ${analysis.location ? `\`${analysis.location}\`` : "Unknown"}  
**Suggested Fix:** ${analysis.suggestion || "Check the logs below for details"}  

`
    : ""
}
### Logs
\`\`\`
${truncatedLogs}
${isTruncated ? "\n... (truncated - showing first 30 lines)" : ""}
\`\`\`
`;

    return {
      version: "1.0",
      tool: "get_deployment_logs",
      timestamp: new Date().toISOString(),
      display,
      data: { logs, analysis, summary },
      highlights: {
        url: summary.deploymentUrl,
        error: analysis.message,
        status: summary.hasErrors ? "error" : "success",
      },
    };
  }

  static formatStatus(status: any): MCPResponse {
    const statusIcon =
      status.status === "success"
        ? "✅ Success"
        : status.status === "building"
          ? "🔄 Building"
          : status.status === "error"
            ? "❌ Failed"
            : status.status;

    const display = `## Deployment Status

### Current Status
**Project:** ${status.projectName}  
**Platform:** ${status.platform}  
**Status:** ${statusIcon}  
**Environment:** ${status.environment || "production"}  
**URL:** ${status.url || "Not available"}  
**Duration:** ${status.duration ? `${status.duration}s` : "N/A"}  
**Deployed:** ${status.timestamp}  

${
  status.commit
    ? `### Commit Info
**SHA:** \`${status.commit.sha}\`  
**Message:** ${status.commit.message}  
**Author:** ${status.commit.author}  
`
    : ""
}`;

    return {
      version: "1.0",
      tool: "check_deployment_status",
      timestamp: new Date().toISOString(),
      display,
      data: status,
      highlights: {
        url: status.url,
        status: status.status,
        duration: status.duration ? `${status.duration}s` : undefined,
      },
    };
  }

  static formatWatchEvent(event: any): string {
    const icons: Record<string, string> = {
      progress: "🔄",
      success: "✅",
      error: "❌",
      warning: "⚠️",
    };

    let formatted = `${icons[event.type as string] || ""} **${event.message}**`;

    if (event.details) {
      if (event.details.url) {
        formatted += `  \n   URL: ${event.details.url}`;
      }
      if (event.details.duration) {
        formatted += `  \n   Duration: ${event.details.duration}s`;
      }
      if (event.details.suggestion) {
        formatted += `  \n   💡 ${event.details.suggestion}`;
      }
      if (event.details.file) {
        formatted += `  \n   File: \`${event.details.file}\``;
      }
    }

    return formatted;
  }
}
