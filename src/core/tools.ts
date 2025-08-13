import { z } from "zod";

// Define supported platforms - ready for future expansion
const SUPPORTED_PLATFORMS = ["vercel"] as const;
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
  count: z
    .number()
    .default(2)
    .describe("Number of deployments to compare (default: 2)"),
  token: z
    .string()
    .optional()
    .describe("API token for authentication (optional if set in environment)"),
});

export const getDeploymentLogsSchema = z.object({
  platform: z.enum(SUPPORTED_PLATFORMS).describe("The deployment platform"),
  deploymentId: z.string().describe("The deployment ID"),
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
  {
    name: "watch_deployment",
    description:
      "Stream real-time deployment progress with detailed status updates and error information",
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
      "Compare recent deployments to identify changes, performance differences, and potential issues",
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
        count: {
          type: "number",
          default: 2,
          description: "Number of deployments to compare (default: 2)",
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
          enum: ["vercel"],
          description: "The deployment platform",
        },
        deploymentId: {
          type: "string",
          description: "The deployment ID",
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
