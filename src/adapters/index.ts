// Base adapter exports
export { BaseAdapter } from "./base/index.js";
export type {
  PlatformAdapter,
  AdapterConfig,
  AdapterError,
} from "./base/index.js";
export { AdapterException } from "./base/index.js";

// Platform adapters
export { VercelAdapter } from "./vercel/index.js";
export type { VercelDeployment, VercelConfig } from "./vercel/index.js";

export { NetlifyAdapter } from "./netlify/index.js";
export type { NetlifyDeploy, NetlifyConfig } from "./netlify/types.js";

export { CloudflarePagesAdapter } from "./cloudflare-pages/index.js";
export type {
  CloudflarePagesDeployment,
  CloudflarePagesProject,
} from "./cloudflare-pages/types.js";

// Future adapters will be exported here:
// export { GitHubPagesAdapter } from './github-pages/index.js';
