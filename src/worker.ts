import { MCPHandler } from "./core/mcp-handler.js";
import { VercelAdapter } from "./adapters/index.js";
// Badge imports will be re-added in v0.2.0 when implementing webhook-based badges
// import { generateBadge, generateErrorBadge } from './server/badge.js';
import { Env } from "./types.js";
import { landingPageHTML } from "./landing-page.js";

function getAdapters(_env: Env): Map<string, any> {
  const adapters = new Map();

  // Set up adapters with environment tokens
  const vercelAdapter = new VercelAdapter();
  adapters.set("vercel", vercelAdapter);

  // Future adapters can be added here
  // adapters.set('netlify', new NetlifyAdapter());

  return adapters;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // MCP endpoint for potential future remote connections
    if (request.method === "POST" && url.pathname === "/mcp") {
      try {
        const handler = new MCPHandler(getAdapters(env));
        const body = await request.json();
        const response = await handler.handleRequest(body);

        return new Response(JSON.stringify(response), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      } catch (error) {
        return new Response(
          JSON.stringify({
            error: error instanceof Error ? error.message : "Unknown error",
          }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
      }
    }

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    // Landing page
    return new Response(landingPageHTML, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    });
  },
};
