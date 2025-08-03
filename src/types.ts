export interface DeploymentStatus {
  id?: string;
  status: "success" | "failed" | "building" | "error" | "unknown";
  url?: string;
  projectName?: string;
  platform?: string;
  timestamp?: string;
  duration?: number;
  environment?: string;
  commit?: {
    sha?: string;
    message?: string;
    author?: string;
  };
}

export interface PlatformConfig {
  token?: string;
  baseUrl?: string;
}

export interface ToolArguments {
  platform: string;
  project: string;
  token?: string;
}

export interface Env {
  VERCEL_TOKEN?: string;
  NETLIFY_TOKEN?: string;
  RAILWAY_TOKEN?: string;
  RENDER_TOKEN?: string;
}
