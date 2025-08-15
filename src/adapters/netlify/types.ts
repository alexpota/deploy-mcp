/**
 * Netlify API types based on official documentation
 * Source: https://github.com/netlify/open-api/blob/master/swagger.yml
 * Docs: https://docs.netlify.com/api/get-started/
 */

/**
 * Netlify deploy state values from official API
 * Source: https://github.com/netlify/open-api/blob/master/swagger.yml
 */
export type NetlifyDeployState =
  | "new"
  | "pending_review"
  | "accepted"
  | "rejected"
  | "enqueued"
  | "building"
  | "uploading"
  | "uploaded"
  | "preparing"
  | "prepared"
  | "processing"
  | "processed"
  | "ready"
  | "error"
  | "retrying";

/**
 * Netlify deploy object from API response
 * Source: https://docs.netlify.com/api/get-started/#deployments
 */
export interface NetlifyDeploy {
  id: string;
  site_id: string;
  build_id?: string;
  state: NetlifyDeployState;
  name?: string;
  url?: string;
  ssl_url?: string;
  admin_url?: string;
  deploy_url?: string;
  deploy_ssl_url?: string;
  created_at: string;
  updated_at?: string;
  published_at?: string;
  title?: string;
  branch?: string;
  commit_ref?: string;
  commit_url?: string;
  context?: string;
  deploy_time?: number;
  error_message?: string;
  log_access_attributes?: {
    type: string;
    url: string;
    endpoint: string;
    path: string;
    token: string;
  };
  review_id?: string | null;
  draft?: boolean;
  locked?: boolean;
  skipped?: boolean;
  summary?: {
    status: string;
    messages?: Array<{
      type: string;
      title: string;
      description: string;
    }>;
  };
}

/**
 * Netlify site object from API response
 * Source: https://docs.netlify.com/api/get-started/#sites
 */
export interface NetlifySite {
  id: string;
  name: string;
  custom_domain?: string;
  url: string;
  ssl_url?: string;
  admin_url: string;
  created_at?: string;
  updated_at?: string;
  state?: string;
  published_deploy?: {
    id: string;
    site_id: string;
    state: string;
  };
}

/**
 * Netlify user object from API response
 * Source: https://docs.netlify.com/api/get-started/#user
 */
export interface NetlifyUser {
  id: string;
  uid?: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at?: string;
}

/**
 * Netlify API response for listing deploys
 */
export interface NetlifyDeploysResponse {
  // Netlify returns array directly, not wrapped in object
  deploys?: NetlifyDeploy[];
}

/**
 * Netlify adapter configuration
 */
export interface NetlifyConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
}
