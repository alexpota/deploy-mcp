import { APIEndpoint } from "../base/api-client.js";

export const VercelEndpoints = {
  listDeployments: {
    path: "/v6/deployments",
    method: "GET",
    docsUrl:
      "https://vercel.com/docs/rest-api/endpoints/deployments#list-deployments",
    description: "List deployments for authenticated user or team",
  },
  getDeployment: {
    path: "/v13/deployments",
    method: "GET",
    docsUrl:
      "https://vercel.com/docs/rest-api/endpoints/deployments#get-a-deployment-by-id-or-url",
    description: "Get deployment by ID or URL",
  },
  getDeploymentEvents: {
    path: "/v2/deployments",
    method: "GET",
    docsUrl:
      "https://vercel.com/docs/rest-api/endpoints/deployments#get-deployment-events",
    description: "Get build logs and events for a deployment",
  },
  getUser: {
    path: "/v2/user",
    method: "GET",
    docsUrl:
      "https://vercel.com/docs/rest-api/endpoints/user#get-the-authenticated-user",
    description: "Get authenticated user information",
  },
} as const satisfies Record<string, APIEndpoint>;

export type VercelEndpointName = keyof typeof VercelEndpoints;
