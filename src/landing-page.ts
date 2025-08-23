export const landingPageHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>deploy-mcp - Universal Deployment Tracker</title>
  <meta name="description" content="Track deployments across all platforms directly in your AI conversation. No context switching. No dashboard hunting.">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='6' fill='%23000'/><path d='M16 8v8M12 12l4 4 4-4M10 20h12' stroke='%23ff6b6b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/></svg>">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    :root {
      --bg: #0a0a0a;
      --bg-card: #111111;
      --border: #1a1a1a;
      --text: #ffffff;
      --text-dim: #a0a0a0;
      --text-muted: #606060;
      --accent: #ff6b6b;
      --accent-dim: #ff6b6b20;
      --success: #22c55e;
      --code-bg: #0d0d0d;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
      min-height: 100vh;
    }

    .container {
      max-width: 1100px;
      margin: 0 auto;
      padding: 0 24px;
    }

    /* Header */
    header {
      padding: 24px 0;
      border-bottom: 1px solid var(--border);
    }

    nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .logo {
      font-size: 20px;
      font-weight: 700;
      color: var(--text);
      text-decoration: none;
    }

    .nav-links {
      display: flex;
      gap: 32px;
      align-items: center;
    }

    .nav-links a {
      color: var(--text-dim);
      text-decoration: none;
      font-size: 14px;
      transition: color 0.2s;
    }

    .nav-links a:hover {
      color: var(--text);
    }

    /* Hero */
    .hero {
      padding: 120px 0 80px;
      text-align: center;
    }

    .hero h1 {
      font-size: clamp(48px, 8vw, 72px);
      font-weight: 900;
      letter-spacing: -0.04em;
      line-height: 1;
      margin-bottom: 24px;
    }

    .hero .subtitle {
      font-size: 20px;
      color: var(--text-dim);
      margin-bottom: 48px;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }

    .quick-start {
      display: inline-flex;
      align-items: center;
      gap: 16px;
      padding: 20px 32px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 8px;
      margin-bottom: 16px;
    }

    .quick-start code {
      font-family: 'SF Mono', Monaco, monospace;
      font-size: 16px;
      color: var(--text);
    }

    .copy-btn {
      padding: 8px 16px;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 6px;
      color: var(--text-dim);
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .copy-btn:hover {
      color: var(--text);
      border-color: var(--text-dim);
    }

    .copy-btn.copied {
      background: var(--success);
      border-color: var(--success);
      color: white;
    }

    .hero-note {
      font-size: 14px;
      color: var(--text-muted);
    }

    /* Platforms Section */
    .section {
      padding: 80px 0;
      border-top: 1px solid var(--border);
    }

    .section-header {
      text-align: center;
      margin-bottom: 56px;
    }

    .section-title {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 16px;
    }

    .section-subtitle {
      font-size: 16px;
      color: var(--text-dim);
    }

    .platforms {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
    }

    .platform {
      padding: 24px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 8px;
      transition: all 0.2s;
    }

    .platform.active {
      border-color: var(--accent);
      background: var(--accent-dim);
    }

    .platform-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }

    .platform-name {
      font-size: 18px;
      font-weight: 600;
    }

    .platform-status {
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 500;
      background: var(--success);
      color: white;
    }

    .platform-status.soon {
      background: var(--text-muted);
    }

    .platform-desc {
      font-size: 14px;
      color: var(--text-dim);
      line-height: 1.5;
    }

    .multi-platform-note {
      padding: 24px;
      background: var(--bg-card);
      border: 1px solid var(--accent);
      border-radius: 8px;
      text-align: center;
    }

    .multi-platform-note h3 {
      font-size: 16px;
      margin-bottom: 12px;
      color: var(--accent);
    }

    .multi-platform-note p {
      font-size: 14px;
      color: var(--text-dim);
      margin-bottom: 16px;
    }

    .config-example {
      background: var(--code-bg);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 16px;
      font-family: 'SF Mono', Monaco, monospace;
      font-size: 12px;
      text-align: left;
      overflow-x: auto;
    }

    /* Features */
    .features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 32px;
    }

    .feature {
      padding: 32px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 8px;
    }

    .feature h3 {
      font-size: 20px;
      margin-bottom: 12px;
    }

    .feature p {
      font-size: 14px;
      color: var(--text-dim);
      line-height: 1.6;
    }

    /* Configuration */
    .config-grid {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 48px;
      align-items: start;
    }

    .config-steps {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .step {
      display: flex;
      gap: 16px;
    }

    .step-number {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 600;
      flex-shrink: 0;
    }

    .step-content h4 {
      font-size: 16px;
      margin-bottom: 4px;
    }

    .step-content p {
      font-size: 14px;
      color: var(--text-dim);
    }

    .config-code {
      background: var(--code-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 24px;
      position: relative;
    }

    .config-code pre {
      font-family: 'SF Mono', Monaco, monospace;
      font-size: 13px;
      line-height: 1.6;
      overflow-x: auto;
    }

    .config-code .copy-btn {
      position: absolute;
      top: 16px;
      right: 16px;
    }

    /* Tools */
    .tools-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
    }

    .tool {
      padding: 20px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 8px;
    }

    .tool-name {
      font-family: 'SF Mono', Monaco, monospace;
      font-size: 13px;
      color: var(--accent);
      margin-bottom: 8px;
    }

    .tool-desc {
      font-size: 14px;
      color: var(--text-dim);
    }

    /* Badges */
    .badge-demo {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 32px;
      text-align: center;
    }

    .badge-examples {
      display: flex;
      justify-content: center;
      gap: 24px;
      margin: 32px 0;
      flex-wrap: wrap;
    }

    .badge-code {
      background: var(--code-bg);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 16px;
      font-family: 'SF Mono', Monaco, monospace;
      font-size: 12px;
      margin-top: 24px;
    }

    /* Footer */
    footer {
      padding: 48px 0;
      border-top: 1px solid var(--border);
      margin-top: 120px;
    }

    .footer-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .footer-links {
      display: flex;
      gap: 32px;
    }

    .footer-links a {
      color: var(--text-dim);
      text-decoration: none;
      font-size: 14px;
      transition: color 0.2s;
    }

    .footer-links a:hover {
      color: var(--text);
    }

    .footer-copy {
      font-size: 14px;
      color: var(--text-muted);
    }

    /* Responsive */
    @media (max-width: 768px) {
      .hero {
        padding: 80px 0 60px;
      }

      .hero h1 {
        font-size: 40px;
      }

      .nav-links {
        gap: 16px;
      }

      .config-grid {
        grid-template-columns: 1fr;
        gap: 32px;
      }

      .platforms {
        grid-template-columns: 1fr;
      }

      .features {
        grid-template-columns: 1fr;
      }

      .footer-content {
        flex-direction: column;
        gap: 24px;
      }

      .badge-examples {
        flex-direction: column;
        align-items: center;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <header>
      <nav>
        <a href="/" class="logo">deploy-mcp</a>
        <div class="nav-links">
          <a href="https://github.com/alexpota/deploy-mcp" target="_blank">GitHub</a>
          <a href="https://www.npmjs.com/package/deploy-mcp" target="_blank">npm</a>
          <a href="https://github.com/alexpota/deploy-mcp#readme" target="_blank">Docs</a>
        </div>
      </nav>
    </header>

    <!-- Hero -->
    <section class="hero">
      <h1>Universal Deployment Tracker</h1>
      <p class="subtitle">
        Track deployments across all platforms directly in your AI conversation.<br>
        No context switching. No dashboard hunting.
      </p>
      
      <div class="quick-start">
        <code>npx deploy-mcp</code>
        <button class="copy-btn" onclick="copyToClipboard('npx deploy-mcp', event)">Copy</button>
      </div>
      
      <p class="hero-note">Works with Claude, Cursor, VS Code, and any MCP-compatible AI assistant</p>
    </section>

    <!-- Platforms -->
    <section class="section">
      <div class="section-header">
        <h2 class="section-title">Supported Platforms</h2>
        <p class="section-subtitle">Monitor all your deployments from a single interface</p>
      </div>

      <div class="platforms">
        <div class="platform active">
          <div class="platform-header">
            <span class="platform-name">Vercel</span>
            <span class="platform-status">Ready</span>
          </div>
          <p class="platform-desc">
            Full deployment tracking with real-time status, logs, and build comparisons.
          </p>
        </div>

        <div class="platform active">
          <div class="platform-header">
            <span class="platform-name">Netlify</span>
            <span class="platform-status">Ready</span>
          </div>
          <p class="platform-desc">
            Complete Netlify support with 15 deployment states and log streaming.
          </p>
        </div>

        <div class="platform">
          <div class="platform-header">
            <span class="platform-name">Railway</span>
            <span class="platform-status soon">Soon</span>
          </div>
          <p class="platform-desc">
            Railway integration with service monitoring coming next.
          </p>
        </div>

        <div class="platform">
          <div class="platform-header">
            <span class="platform-name">Render</span>
            <span class="platform-status soon">Soon</span>
          </div>
          <p class="platform-desc">
            Render support with service and database monitoring planned.
          </p>
        </div>
      </div>

      <div class="multi-platform-note">
        <h3>✓ Use Multiple Platforms Simultaneously</h3>
        <p>Configure all your platforms at once. The AI automatically detects which platform to query based on your project.</p>
        <div class="config-code" style="margin-top: 16px; background: var(--code-bg); border: 1px solid var(--border); position: relative;">
          <button class="copy-btn" onclick="copyMultiPlatform(event)">Copy</button>
          <pre style="margin: 0;">{
  "env": {
    "VERCEL_TOKEN": "your-vercel-token",
    "NETLIFY_TOKEN": "your-netlify-token"
  }
}</pre>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="section">
      <div class="section-header">
        <h2 class="section-title">Key Features</h2>
        <p class="section-subtitle">Everything you need for complete deployment visibility</p>
      </div>

      <div class="features">
        <div class="feature">
          <h3>Real-time Monitoring</h3>
          <p>
            Watch deployments as they happen with streaming updates. 
            See state changes, build progress, and errors instantly.
            Never refresh a dashboard again.
          </p>
        </div>

        <div class="feature">
          <h3>Intelligent Analysis</h3>
          <p>
            Compare deployments to identify performance regressions.
            Get smart error detection with suggested fixes.
            Track build times and deployment metrics over time.
          </p>
        </div>

        <div class="feature">
          <h3>Zero Context Switching</h3>
          <p>
            Stay in your AI conversation while checking deployments.
            No browser tabs, no dashboard hunting, no interruptions.
            Everything happens in your development flow.
          </p>
        </div>
      </div>
    </section>

    <!-- Configuration -->
    <section class="section">
      <div class="section-header">
        <h2 class="section-title">Simple Configuration</h2>
        <p class="section-subtitle">Get started in under 60 seconds</p>
      </div>

      <div class="config-grid">
        <div class="config-steps">
          <div class="step">
            <div class="step-number">1</div>
            <div class="step-content">
              <h4>Run the server</h4>
              <p>Start with npx - no installation needed</p>
            </div>
          </div>

          <div class="step">
            <div class="step-number">2</div>
            <div class="step-content">
              <h4>Add your tokens</h4>
              <p>Get API tokens from your platform dashboards</p>
            </div>
          </div>

          <div class="step">
            <div class="step-number">3</div>
            <div class="step-content">
              <h4>Configure your AI</h4>
              <p>Add the configuration to your AI assistant</p>
            </div>
          </div>
        </div>

        <div class="config-code">
          <button class="copy-btn" onclick="copyConfig(event)">Copy</button>
          <pre>{
  "mcpServers": {
    "deploy-mcp": {
      "command": "npx",
      "args": ["-y", "deploy-mcp"],
      "env": {
        "VERCEL_TOKEN": "your-vercel-token",
        "NETLIFY_TOKEN": "your-netlify-token"
      }
    }
  }
}</pre>
        </div>
      </div>
    </section>

    <!-- Tools -->
    <section class="section">
      <div class="section-header">
        <h2 class="section-title">Available Tools</h2>
        <p class="section-subtitle">Powerful commands at your fingertips</p>
      </div>

      <div class="tools-grid">
        <div class="tool">
          <div class="tool-name">check_deployment_status</div>
          <div class="tool-desc">Get latest deployment status or view deployment history</div>
        </div>

        <div class="tool">
          <div class="tool-name">watch_deployment</div>
          <div class="tool-desc">Stream real-time deployment progress with live updates</div>
        </div>

        <div class="tool">
          <div class="tool-name">compare_deployments</div>
          <div class="tool-desc">Compare deployments to track changes and performance</div>
        </div>

        <div class="tool">
          <div class="tool-name">get_deployment_logs</div>
          <div class="tool-desc">Fetch and analyze deployment logs with error detection</div>
        </div>

        <div class="tool">
          <div class="tool-name">list_projects</div>
          <div class="tool-desc">Discover all your projects and sites across platforms</div>
        </div>
      </div>
    </section>

    <!-- Badges -->
    <section class="section">
      <div class="section-header">
        <h2 class="section-title">Deployment Badges</h2>
        <p class="section-subtitle">Show live deployment status in your README</p>
      </div>

      <div class="badge-demo">
        <div class="badge-examples">
          <img src="https://img.shields.io/badge/vercel-success-22c55e" alt="Vercel Status">
          <img src="https://img.shields.io/badge/netlify-building-FCD34D" alt="Netlify Status">
          <img src="https://img.shields.io/badge/railway-coming%20soon-gray" alt="Railway Status">
        </div>

        <div class="badge-code">
          <code>![Deploy Status](https://img.shields.io/endpoint?url=https://deploy-mcp.io/badge/{user}/{repo}/{platform})</code>
        </div>

        <p style="margin-top: 24px; font-size: 14px; color: var(--text-dim);">
          Configure webhooks in your platform for real-time updates
        </p>
      </div>
    </section>
  </div>

  <!-- Footer -->
  <footer>
    <div class="container">
      <div class="footer-content">
        <div class="footer-links">
          <a href="https://github.com/alexpota/deploy-mcp" target="_blank">GitHub</a>
          <a href="https://www.npmjs.com/package/deploy-mcp" target="_blank">npm</a>
          <a href="https://github.com/alexpota/deploy-mcp/issues" target="_blank">Issues</a>
          <a href="https://github.com/alexpota/deploy-mcp#readme" target="_blank">Documentation</a>
        </div>
        <div class="footer-copy">
          © 2025 deploy-mcp · Apache 2.0 License
        </div>
      </div>
    </div>
  </footer>

  <script>
    function copyToClipboard(text, event) {
      const btn = event.target;
      navigator.clipboard.writeText(text).then(() => {
        const originalText = btn.textContent;
        btn.classList.add('copied');
        btn.textContent = 'Copied!';
        setTimeout(() => {
          btn.classList.remove('copied');
          btn.textContent = originalText;
        }, 2000);
      });
    }

    function copyConfig(event) {
      const config = JSON.stringify({
        mcpServers: {
          'deploy-mcp': {
            command: 'npx',
            args: ['-y', 'deploy-mcp'],
            env: {
              VERCEL_TOKEN: 'your-vercel-token',
              NETLIFY_TOKEN: 'your-netlify-token'
            }
          }
        }
      }, null, 2);
      copyToClipboard(config, event);
    }

    function copyMultiPlatform(event) {
      const config = JSON.stringify({
        env: {
          VERCEL_TOKEN: 'your-vercel-token',
          NETLIFY_TOKEN: 'your-netlify-token'
        }
      }, null, 2);
      copyToClipboard(config, event);
    }
  </script>
</body>
</html>`;
