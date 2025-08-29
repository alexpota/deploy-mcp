// Cloudflare Workers types
/// <reference types="@cloudflare/workers-types" />

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

// Use the generated Env interface from worker-configuration.d.ts
// which includes BADGE_KV: KVNamespace
// and add our additional tokens
export interface Env {
  BADGE_KV: KVNamespace;
  VERCEL_TOKEN?: string;
  NETLIFY_TOKEN?: string;
  CLOUDFLARE_TOKEN?: string;
  // Optional webhook secret for enhanced security (not required for public repos)
  VERCEL_WEBHOOK_SECRET?: string;
}
