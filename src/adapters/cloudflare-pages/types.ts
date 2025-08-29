// Source: https://developers.cloudflare.com/api/resources/pages/
// OpenAPI: https://github.com/cloudflare/api-schemas/blob/main/openapi.yaml

export interface CloudflarePagesProject {
  id: string;
  name: string;
  subdomain: string;
  domains: string[];
  created_on: string;
  modified_on: string;
  production_branch: string;
  build_config?: {
    build_command?: string;
    destination_dir?: string;
    root_dir?: string;
    web_analytics_token?: string;
    web_analytics_tag?: string;
  };
  source?: {
    type: "github" | "gitlab";
    config?: {
      owner: string;
      repo: string;
      production_branch: string;
      pr_comments_enabled: boolean;
      deployments_enabled: boolean;
      production_deployments_enabled: boolean;
      preview_deployment_setting?: "all" | "none" | "custom";
      preview_branch_includes?: string[];
      preview_branch_excludes?: string[];
    };
  };
  deployment_configs?: {
    preview?: DeploymentConfig;
    production?: DeploymentConfig;
  };
  latest_deployment?: CloudflarePagesDeployment;
}

export interface DeploymentConfig {
  env_vars?: Record<string, EnvironmentVariable>;
  compatibility_date?: string;
  compatibility_flags?: string[];
  d1_databases?: Record<string, { id: string }>;
  kv_namespaces?: Record<string, { namespace_id: string }>;
  r2_buckets?: Record<string, { name: string }>;
  durable_object_namespaces?: Record<string, { namespace_id: string }>;
}

export interface EnvironmentVariable {
  value: string;
  type?: "plain_text" | "secret_text";
}

// Based on API examples and community discussions
export type CloudflarePagesDeploymentStageStatus =
  | "active" // Stage is currently in progress
  | "success" // Stage completed successfully
  | "failed" // Stage failed with an error
  | "canceled" // Stage was canceled
  | "skipped"; // Stage was skipped

export interface CloudflarePagesDeploymentStage {
  name: string;
  started_on: string | null;
  ended_on: string | null;
  status: CloudflarePagesDeploymentStageStatus;
}

export interface CloudflarePagesDeployment {
  id: string;
  project_id: string;
  project_name: string;
  environment: "production" | "preview";
  url: string;
  created_on: string;
  modified_on: string;
  aliases?: string[];
  latest_stage?: CloudflarePagesDeploymentStage;
  stages?: CloudflarePagesDeploymentStage[];
  build_config?: {
    build_command?: string;
    destination_dir?: string;
    root_dir?: string;
    web_analytics_token?: string;
    web_analytics_tag?: string;
  };
  source?: {
    type: "github" | "gitlab" | "upload";
    config?: {
      owner?: string;
      repo?: string;
      commit_hash?: string;
      commit_message?: string;
      commit_ref?: string;
      pr_id?: string;
      pr_title?: string;
    };
  };
  env_vars?: Record<string, string>;
  deployment_trigger?: {
    type: "ad_hoc" | "schedule" | "webhook";
    metadata?: {
      branch?: string;
      commit_hash?: string;
      commit_message?: string;
    };
  };
  build_image_major_version?: number;
  build_image_minor_version?: number;
  is_skipped?: boolean;
  production_branch?: string;
}

export interface CloudflarePagesDeploymentLog {
  id: string;
  timestamp: string;
  level: "info" | "warning" | "error";
  message: string;
  line?: number;
}

export interface CloudflarePagesLogsResponse {
  data: CloudflarePagesDeploymentLog[];
  includes_container_logs: boolean;
  total: number;
}

export interface CloudflarePagesListProjectsResponse {
  result: CloudflarePagesProject[];
  result_info: {
    page: number;
    per_page: number;
    total_pages: number;
    count: number;
    total_count: number;
  };
  success: boolean;
  errors: Array<{ code: number; message: string }>;
  messages: string[];
}

export interface CloudflarePagesListDeploymentsResponse {
  result: CloudflarePagesDeployment[];
  result_info: {
    page: number;
    per_page: number;
    total_pages: number;
    count: number;
    total_count: number;
  };
  success: boolean;
  errors: Array<{ code: number; message: string }>;
  messages: string[];
}

export interface CloudflarePagesGetProjectResponse {
  result: CloudflarePagesProject;
  success: boolean;
  errors: Array<{ code: number; message: string }>;
  messages: string[];
}

export interface CloudflarePagesGetDeploymentResponse {
  result: CloudflarePagesDeployment;
  success: boolean;
  errors: Array<{ code: number; message: string }>;
  messages: string[];
}

export interface CloudflarePagesGetLogsResponse {
  result: CloudflarePagesLogsResponse;
  success: boolean;
  errors: Array<{ code: number; message: string }>;
  messages: string[];
}
