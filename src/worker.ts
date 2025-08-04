import { MCPHandler } from "./core/mcp-handler.js";
import { VercelAdapter } from "./adapters/index.js";
import { generateBadgeData, generateErrorBadge } from "./server/badge.js";
import { Env } from "./types.js";
import { landingPageHTML } from "./landing-page.js";
import { handleWebhook } from "./server/webhook.js";

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

    // Badge endpoint - GET /badge/:user/:repo/:platform
    if (request.method === "GET" && url.pathname.startsWith("/badge/")) {
      try {
        const pathParts = url.pathname.split("/");
        if (pathParts.length !== 5) {
          const errorBadge = generateErrorBadge("deploy", "Invalid URL format");
          return new Response(JSON.stringify(errorBadge), {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "public, max-age=60",
              "Access-Control-Allow-Origin": "*",
            },
          });
        }

        const [, , user, repo, platform] = pathParts;

        // Generate badge data for shields.io
        const badgeData = await generateBadgeData(user, repo, platform, env);

        return new Response(JSON.stringify(badgeData), {
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "public, max-age=300", // Cache for 5 minutes
            "Access-Control-Allow-Origin": "*",
          },
        });
      } catch (error) {
        const errorBadge = generateErrorBadge(
          "deploy",
          error instanceof Error ? error.message : "Unknown error"
        );
        return new Response(JSON.stringify(errorBadge), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "public, max-age=60",
            "Access-Control-Allow-Origin": "*",
          },
        });
      }
    }

    // Webhook endpoint - POST /webhook/:user/:repo/:platform
    if (request.method === "POST" && url.pathname.startsWith("/webhook/")) {
      try {
        const pathParts = url.pathname.split("/");
        if (pathParts.length !== 5) {
          return new Response("Invalid webhook URL format", { status: 400 });
        }

        const [, , user, repo, platform] = pathParts;

        // Handle webhook and update deployment status
        const result = await handleWebhook(request, user, repo, platform, env);

        return new Response(JSON.stringify(result), {
          status: result.success ? 200 : 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      } catch (error) {
        console.error("Webhook error:", error);
        return new Response(
          JSON.stringify({
            success: false,
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
