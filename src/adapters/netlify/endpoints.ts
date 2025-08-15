/**
 * Netlify API endpoints configuration
 * Source: https://docs.netlify.com/api/get-started/
 * OpenAPI: https://github.com/netlify/open-api/blob/master/swagger.yml
 */

import { APIEndpoint } from "../base/api-client.js";

export const NetlifyEndpoints = {
  listSites: {
    path: "/sites",
    method: "GET" as const,
    docsUrl: "https://docs.netlify.com/api/get-started/#sites",
    description: "List all sites for the current user",
  },
  getSite: {
    path: "/sites/{site_id}",
    method: "GET" as const,
    docsUrl: "https://docs.netlify.com/api/get-started/#get-site",
    description: "Get a specific site by ID",
  },
  listDeploys: {
    path: "/sites/{site_id}/deploys",
    method: "GET" as const,
    docsUrl: "https://docs.netlify.com/api/get-started/#list-site-deploys",
    description: "List all deploys for a site",
  },
  getDeploy: {
    path: "/deploys/{deploy_id}",
    method: "GET" as const,
    docsUrl: "https://docs.netlify.com/api/get-started/#get-deploy",
    description: "Get a specific deploy by ID",
  },
  getUser: {
    path: "/user",
    method: "GET" as const,
    docsUrl: "https://docs.netlify.com/api/get-started/#get-current-user",
    description: "Get the current user",
  },
} as const satisfies Record<string, APIEndpoint>;
