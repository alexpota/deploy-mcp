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

// Future adapters will be exported here:
// export { RailwayAdapter } from './railway/index.js';
// export { RenderAdapter } from './render/index.js';
