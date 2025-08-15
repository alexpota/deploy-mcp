import { z } from "zod";

// Define supported platforms - ready for future expansion
const SUPPORTED_PLATFORMS = ["vercel", "netlify"] as const;
// Future platforms ready to be added when implemented
// const ALL_PLATFORMS = ["vercel", "netlify", "railway", "render"] as const;

export const checkDeploymentStatusSchema = z.object({
  platform: z.enum(SUPPORTED_PLATFORMS).describe("The deployment platform"),
  project: z.string().describe("The project name or ID"),
  token: z
    .string()
    .optional()
    .describe("API token for authentication (optional if set in environment)"),
});

export const watchDeploymentSchema = z.object({
  platform: z.enum(SUPPORTED_PLATFORMS).describe("The deployment platform"),
  project: z.string().describe("The project name or ID"),
  deploymentId: z
    .string()
    .optional()
    .describe("Specific deployment ID to watch (optional, defaults to latest)"),
  token: z
    .string()
    .optional()
    .describe("API token for authentication (optional if set in environment)"),
});

export const compareDeploymentsSchema = z.object({
  platform: z.enum(SUPPORTED_PLATFORMS).describe("The deployment platform"),
  project: z.string().describe("The project name or ID"),
  mode: z
    .enum([
      "last_vs_previous", // Default: current vs previous
      "current_vs_success", // Compare to last successful deploy
      "current_vs_production", // Compare to what's in production
      "between_dates", // Compare deployments from specific dates
      "by_ids", // Compare two specific deployment IDs
    ])
    .default("last_vs_previous")
    .describe("Comparison mode to use"),
  deploymentA: z
    .string()
    .optional()
    .describe("First deployment ID (for by_ids mode)"),
  deploymentB: z
    .string()
    .optional()
    .describe("Second deployment ID (for by_ids mode)"),
  dateFrom: z
    .string()
    .optional()
    .describe("Start date (for between_dates mode, ISO format)"),
  dateTo: z
    .string()
    .optional()
    .describe("End date (for between_dates mode, ISO format)"),
  token: z
    .string()
    .optional()
    .describe("API token for authentication (optional if set in environment)"),
});

export const getDeploymentLogsSchema = z.object({
  platform: z.enum(SUPPORTED_PLATFORMS).describe("The deployment platform"),
  deploymentId: z
    .string()
    .describe("The deployment ID or 'latest' for most recent"),
  project: z
    .string()
    .optional()
    .describe(
      "Project/site name (required when using 'latest' as deploymentId)"
    ),
  filter: z
    .enum(["error", "warning", "all"])
    .default("error")
    .describe("Filter logs by type (default: error)"),
  token: z
    .string()
    .optional()
    .describe("API token for authentication (optional if set in environment)"),
});

export const tools = [
  {
    name: "check_deployment_status",
    description:
      "Check the latest deployment status for a project on a platform",
    inputSchema: {
      type: "object",
      properties: {
        platform: {
          type: "string",
          enum: ["vercel", "netlify"],
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
  {
    name: "watch_deployment",
    description:
      "Stream real-time deployment progress with detailed status updates and error information",
    inputSchema: {
      type: "object",
      properties: {
        platform: {
          type: "string",
          enum: ["vercel", "netlify"],
          description: "The deployment platform",
        },
        project: {
          type: "string",
          description: "The project name or ID",
        },
        deploymentId: {
          type: "string",
          description:
            "Specific deployment ID to watch (optional, defaults to latest)",
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
  {
    name: "compare_deployments",
    description:
      "Compare deployments using smart comparison modes to identify changes, performance differences, and potential issues",
    inputSchema: {
      type: "object",
      properties: {
        platform: {
          type: "string",
          enum: ["vercel", "netlify"],
          description: "The deployment platform",
        },
        project: {
          type: "string",
          description: "The project name or ID",
        },
        mode: {
          type: "string",
          enum: [
            "last_vs_previous",
            "current_vs_success",
            "current_vs_production",
            "between_dates",
            "by_ids",
          ],
          default: "last_vs_previous",
          description:
            "Comparison mode: last_vs_previous (default), current_vs_success, current_vs_production, between_dates, or by_ids",
        },
        deploymentA: {
          type: "string",
          description: "First deployment ID (required for by_ids mode)",
        },
        deploymentB: {
          type: "string",
          description: "Second deployment ID (required for by_ids mode)",
        },
        dateFrom: {
          type: "string",
          description:
            "Start date in ISO format (required for between_dates mode)",
        },
        dateTo: {
          type: "string",
          description:
            "End date in ISO format (required for between_dates mode)",
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
  {
    name: "get_deployment_logs",
    description:
      "Fetch detailed logs for a specific deployment, useful for debugging failed deployments",
    inputSchema: {
      type: "object",
      properties: {
        platform: {
          type: "string",
          enum: ["vercel", "netlify"],
          description: "The deployment platform",
        },
        deploymentId: {
          type: "string",
          description: "The deployment ID or 'latest' for most recent",
        },
        project: {
          type: "string",
          description:
            "Project/site name (required when using 'latest' as deploymentId)",
        },
        filter: {
          type: "string",
          enum: ["error", "warning", "all"],
          default: "error",
          description: "Filter logs by type (default: error)",
        },
        token: {
          type: "string",
          description:
            "API token for authentication (optional if set in environment)",
        },
      },
      required: ["platform", "deploymentId"],
    },
  },
];

export type CheckDeploymentStatusArgs = z.infer<
  typeof checkDeploymentStatusSchema
>;

export type WatchDeploymentArgs = z.infer<typeof watchDeploymentSchema>;

export type CompareDeploymentsArgs = z.infer<typeof compareDeploymentsSchema>;

export type GetDeploymentLogsArgs = z.infer<typeof getDeploymentLogsSchema>;
