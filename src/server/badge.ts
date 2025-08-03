import { DeploymentStatus } from "../types.js";

interface BadgeConfig {
  label?: string;
  style?: "flat" | "flat-square" | "plastic";
  labelColor?: string;
}

export function generateBadge(
  deployment: DeploymentStatus,
  config: BadgeConfig = {}
): string {
  const { label = "deploy", style = "flat", labelColor = "#555" } = config;

  const statusColors = {
    success: "#00C851",
    failed: "#ff4444",
    building: "#ffbb33",
    error: "#666666",
    unknown: "#666666",
  };

  const status = deployment.status || "unknown";
  const color = statusColors[status] || "#666666";

  const labelWidth = 50;
  const statusWidth = 70;
  const totalWidth = labelWidth + statusWidth;
  const height = 20;
  const borderRadius = style === "flat-square" ? 0 : 3;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${height}" viewBox="0 0 ${totalWidth} ${height}">
  <defs>
    <linearGradient id="smooth" x2="0" y2="100%">
      <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
      <stop offset="1" stop-opacity=".1"/>
    </linearGradient>
    <mask id="round">
      <rect width="${totalWidth}" height="${height}" rx="${borderRadius}" fill="#fff"/>
    </mask>
  </defs>
  <g mask="url(#round)">
    <rect width="${labelWidth}" height="${height}" fill="${labelColor}"/>
    <rect x="${labelWidth}" width="${statusWidth}" height="${height}" fill="${color}"/>
    ${style !== "flat" ? `<rect width="${totalWidth}" height="${height}" fill="url(#smooth)"/>` : ""}
  </g>
  <g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11">
    <text x="${labelWidth / 2}" y="14" fill="#010101" fill-opacity=".3">${label}</text>
    <text x="${labelWidth / 2}" y="13">${label}</text>
    <text x="${labelWidth + statusWidth / 2}" y="14" fill="#010101" fill-opacity=".3">${status}</text>
    <text x="${labelWidth + statusWidth / 2}" y="13">${status}</text>
  </g>
</svg>`;
}

export function generateErrorBadge(
  _message: string = "error",
  config: BadgeConfig = {}
): string {
  return generateBadge({ status: "error" }, config);
}

// generateBrandedBadge removed - will be replaced with real webhook-based badges in v0.2.0
