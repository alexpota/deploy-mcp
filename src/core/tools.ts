import { z } from "zod";

export const checkDeploymentStatusSchema = z.object({
  platform: z
    .enum(["vercel"])
    .describe("The deployment platform (more platforms coming soon)"),
  project: z.string().describe("The project name or ID"),
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
    inputSchema: checkDeploymentStatusSchema,
  },
];

export type CheckDeploymentStatusArgs = z.infer<
  typeof checkDeploymentStatusSchema
>;
