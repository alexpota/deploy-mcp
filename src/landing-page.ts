export const landingPageHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>deploy-mcp - Universal Deployment Tracker</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='%23ff6b6b'/><stop offset='1' stop-color='%23ff8e53'/></linearGradient></defs><rect width='32' height='32' rx='6' fill='%23000'/><circle cx='16' cy='16' r='10' fill='url(%23g)'/><path d='M12 13h8v2h-8zm0 4h6v2h-6z' fill='white'/></svg>">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-primary: #0a0a0f;
      --bg-secondary: #12121a;
      --bg-card: #1a1a24;
      --bg-card-hover: #1f1f2e;
      --border-primary: #2a2a3a;
      --border-accent: #ff6b6b;
      --text-primary: #ffffff;
      --text-secondary: #b8b8c8;
      --text-muted: #8a8a9a;
      --accent-red: #ff6b6b;
      --accent-orange: #ff8e53;
      --accent-green: #51cf66;
      --accent-blue: #339af0;
      --accent-purple: #845ef7;
      --code-bg: #16161f;
      --code-border: #ff6b6b40;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: var(--bg-primary);
      color: var(--text-primary);
      line-height: 1.6;
      overflow-x: hidden;
      min-height: 100vh;
      position: relative;
    }

    body::before {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: 
        radial-gradient(800px circle at 15% 25%, rgba(255, 107, 107, 0.08) 0%, transparent 60%),
        radial-gradient(600px circle at 85% 75%, rgba(255, 142, 83, 0.06) 0%, transparent 50%);
      pointer-events: none;
      z-index: -1;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1.5rem;
      position: relative;
    }

    /* Hero Section */
    .hero {
      text-align: center;
      padding: 6rem 0 4rem;
      margin-bottom: 4rem;
      position: relative;
      background: linear-gradient(135deg, rgba(255, 107, 107, 0.05) 0%, rgba(255, 142, 83, 0.03) 100%);
      border-radius: 20px;
      overflow: hidden;
    }

    .hero::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ff6b6b' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
      animation: float 20s ease-in-out infinite;
      z-index: -1;
    }

    .hero-links {
      position: fixed;
      top: 1.5rem;
      right: 1.5rem;
      display: flex;
      gap: 0.75rem;
      z-index: 100;
    }

    .hero-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.6rem 0.9rem;
      background: rgba(26, 26, 36, 0.8);
      border: 1px solid var(--border-primary);
      border-radius: 8px;
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 0.8rem;
      font-weight: 500;
      transition: all 0.3s ease;
      backdrop-filter: blur(12px);
    }

    .hero-link:hover {
      border-color: var(--border-accent);
      color: var(--text-primary);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .hero-link svg {
      flex-shrink: 0;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-20px) rotate(180deg); }
    }

    .hero h1 {
      font-size: clamp(3rem, 8vw, 5.5rem);
      font-weight: 900;
      color: var(--text-primary);
      margin-bottom: 1.5rem;
      letter-spacing: -0.04em;
      line-height: 0.95;
      position: relative;
      background: linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%);
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      text-shadow: 0 0 30px rgba(255, 255, 255, 0.1);
    }

    .hero .subtitle {
      font-size: 1.25rem;
      color: var(--accent-red);
      font-weight: 600;
      margin-bottom: 1rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      opacity: 0.9;
    }

    .hero .tagline {
      font-size: 1.125rem;
      color: var(--text-secondary);
      max-width: 600px;
      margin: 2rem auto 3rem;
      font-weight: 400;
      line-height: 1.5;
    }

    .hero .quick-start {
      background: var(--bg-card);
      border: 2px solid var(--border-primary);
      border-radius: 12px;
      padding: 2rem;
      max-width: 520px;
      margin: 0 auto;
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .hero .quick-start:hover {
      border-color: var(--border-accent);
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
    }

    .hero .quick-start::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, var(--accent-red), var(--accent-orange));
    }

    .hero .quick-start h3 {
      color: var(--text-primary);
      margin-bottom: 1rem;
      font-size: 1.1rem;
      font-weight: 600;
    }

    /* Cards */
    .card {
      background: var(--bg-card);
      border: 2px solid var(--border-primary);
      border-radius: 16px;
      padding: 2.5rem;
      margin-bottom: 2.5rem;
      transition: all 0.3s ease;
      position: relative;
    }

    .card:hover {
      border-color: var(--border-accent);
      transform: translateY(-3px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
    }

    .card:hover h2::after {
      width: 60px;
      transition: width 0.3s ease;
    }

    .card h2 {
      font-size: 1.75rem;
      font-weight: 700;
      margin-bottom: 1rem;
      color: var(--text-primary);
      position: relative;
      display: inline-block;
    }

    .card h2::after {
      content: '';
      position: absolute;
      bottom: -5px;
      left: 0;
      width: 30px;
      height: 2px;
      background: var(--accent-red);
      transition: width 0.3s ease;
    }

    .card p {
      color: var(--text-secondary);
      margin-bottom: 1.5rem;
      font-size: 1rem;
      line-height: 1.6;
    }

    /* Code Blocks - Simple and Reliable */
    .code-wrapper {
      background: var(--code-bg);
      border: 1px solid var(--code-border);
      border-radius: 8px;
      margin: 1.5rem 0;
      overflow: hidden;
    }

    .code-header {
      display: flex;
      justify-content: flex-end;
      padding: 0.5rem;
      background: rgba(0, 0, 0, 0.2);
      border-bottom: 1px solid var(--code-border);
    }

    .copy-btn {
      background: var(--bg-secondary);
      border: 1px solid var(--border-primary);
      color: var(--text-secondary);
      padding: 0.4rem 0.8rem;
      border-radius: 4px;
      font-size: 0.75rem;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: 'Inter', sans-serif;
      font-weight: 500;
    }

    .copy-btn:hover {
      background: var(--accent-red);
      border-color: var(--accent-red);
      color: white;
    }

    .copy-btn.copied {
      background: var(--accent-green);
      border-color: var(--accent-green);
      color: white;
    }

    .code-content {
      padding: 1rem;
      overflow-x: auto;
      font-family: 'JetBrains Mono', 'Fira Code', 'SF Mono', monospace;
      font-size: 0.875rem;
      line-height: 1.5;
      color: #e2e8f0;
      white-space: pre;
      position: relative;
    }

    /* Custom Syntax Highlighting */
    .code-content .token-string { color: #ffb366; }
    .code-content .token-number { color: #ffd93d; }
    .code-content .token-boolean { color: #ff8c94; }
    .code-content .token-keyword { color: #c7ceea; }
    .code-content .token-property { color: #88d8c0; }
    .code-content .token-punctuation { color: #e2e8f0; }
    .code-content .token-comment { color: #6b7280; font-style: italic; }

    .code-wrapper.inline {
      display: inline-block;
      margin: 0.5rem 0;
      min-width: 200px;
    }

    .code-wrapper.inline .code-content {
      padding: 0.75rem;
      white-space: nowrap;
    }

    .code-wrapper.multiline .code-content {
      white-space: pre-wrap;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }

    /* Installation Steps */
    .steps {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      margin: 3rem 0;
    }

    .step {
      background: var(--bg-card);
      border: 2px solid var(--border-primary);
      border-radius: 12px;
      padding: 2rem;
      position: relative;
      transition: all 0.3s ease;
      border-left: 4px solid var(--accent-red);
    }

    .step:nth-child(2) {
      border-left-color: var(--accent-orange);
    }

    .step:nth-child(3) {
      border-left-color: var(--accent-green);
    }

    .step .step-content {
      position: relative;
      z-index: 1;
    }

    .step p {
      margin-bottom: 1.5rem;
      font-size: 0.95rem;
      line-height: 1.5;
      color: var(--text-secondary);
    }

    .step:hover {
      border-color: var(--border-accent);
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    }

    .step-number {
      position: absolute;
      top: -12px;
      left: 1.5rem;
      background: var(--accent-red);
      color: white;
      width: 24px;
      height: 24px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 700;
      z-index: 2;
    }

    .step:nth-child(2) .step-number {
      background: var(--accent-orange);
    }

    .step:nth-child(3) .step-number {
      background: var(--accent-green);
    }

    .step h3 {
      font-size: 1.125rem;
      font-weight: 600;
      margin-bottom: 1rem;
      color: var(--text-primary);
    }

    /* Badge Example */
    .badge-showcase {
      background: var(--bg-card);
      border: 2px solid var(--border-primary);
      border-radius: 12px;
      padding: 2rem;
      margin: 2rem 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
    }

    .badge-preview {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-wrap: wrap;
      gap: 1rem;
      padding: 2rem;
      background: rgba(255, 255, 255, 0.02);
      border-radius: 8px;
      border: 1px solid var(--border-primary);
      min-height: 80px;
    }

    .badge-example {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 20px;
      border: 1px solid var(--border-primary);
      font-size: 0.75rem;
      color: var(--text-secondary);
    }

    .badge-status {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .badge-status.success { background: var(--accent-green); }
    .badge-status.building { background: var(--accent-orange); }
    .badge-status.error { background: var(--accent-red); }

    .badge-showcase .code-wrapper {
      width: 100%;
      max-width: 600px;
      margin: 0;
    }

    /* AI Tools Section */
    .ai-tools {
      display: grid;
      gap: 1rem;
      margin-top: 1.5rem;
    }

    .ai-tool {
      background: var(--bg-secondary);
      border: 1px solid var(--border-primary);
      border-radius: 12px;
      overflow: hidden;
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .ai-tool:hover {
      border-color: var(--border-accent);
      transform: translateY(-1px);
    }

    .ai-tool-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem;
    }

    .ai-tool-icon {
      width: 48px;
      height: 48px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      font-weight: bold;
      background: linear-gradient(135deg, var(--accent-red), var(--accent-orange));
      color: white;
    }

    .ai-tool-info {
      flex: 1;
    }

    .ai-tool-info h4 {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 0.25rem;
    }

    .ai-tool-status {
      font-size: 0.875rem;
      color: var(--accent-green);
    }

    .ai-tool-toggle {
      font-size: 1.5rem;
      color: var(--text-secondary);
      font-weight: 300;
      transition: transform 0.3s ease;
    }

    .ai-tool-toggle.open {
      transform: rotate(45deg);
    }

    .ai-tool-config {
      padding: 0 1.25rem 1.25rem;
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .config-path {
      font-size: 0.875rem;
      color: var(--text-muted);
      margin-bottom: 1rem;
      font-family: 'SF Mono', Monaco, monospace;
    }

    .ai-tool-config .code-wrapper {
      margin: 0;
    }

    .ai-tool-config .code-content {
      font-size: 0.75rem;
      max-height: 200px;
      overflow-y: auto;
    }

    /* Platform Grid */
    .platforms {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.25rem;
      margin: 2rem 0;
    }

    .platform {
      background: var(--bg-card);
      border: 2px solid var(--border-primary);
      border-radius: 10px;
      padding: 1.5rem;
      text-align: center;
      transition: all 0.3s ease;
      position: relative;
    }

    .platform:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .platform.supported {
      border-color: var(--accent-green);
    }

    .platform-icon {
      width: 48px;
      height: 48px;
      margin: 0 auto 1rem;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      background: linear-gradient(135deg, var(--accent-red), var(--accent-orange));
      color: white;
      font-weight: bold;
    }

    .platform.supported .platform-icon {
      background: rgba(255, 255, 255, 0.1);
      border: 2px solid var(--accent-green);
    }

    .platform.coming-soon {
      opacity: 0.65;
      border-color: var(--text-muted);
    }

    .platform.coming-soon .platform-icon {
      background: linear-gradient(135deg, var(--text-muted), #6b7280);
    }

    .platform-status {
      position: absolute;
      top: 0.75rem;
      right: 0.75rem;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--accent-green);
    }

    .platform.coming-soon .platform-status {
      background: var(--text-muted);
    }

    .platform h3 {
      font-size: 1.125rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: var(--text-primary);
    }

    .platform p {
      color: var(--text-secondary);
      font-size: 0.875rem;
    }

    /* CTA Button */
    .cta-button {
      background: var(--accent-primary);
      border: none;
      border-radius: 8px;
      padding: 0.75rem 2rem;
      font-size: 1rem;
      font-weight: 600;
      color: white;
      text-decoration: none;
      display: inline-block;
      transition: all 0.2s ease;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    }

    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
    }

    /* Simple Footer */
    .footer {
      border-top: 1px solid var(--border-primary);
      margin-top: 4rem;
      padding: 2rem 0;
    }

    .footer-content {
      text-align: center;
    }

    .footer-links {
      display: flex;
      justify-content: center;
      gap: 2rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }

    .footer-links a {
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 0.9rem;
      transition: color 0.2s ease;
    }

    .footer-links a:hover {
      color: var(--accent-red);
    }

    .footer-content p {
      color: var(--text-muted);
      font-size: 0.875rem;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .container {
        padding: 1rem;
      }

      .hero {
        padding: 4rem 0 2rem;
      }

      .hero-links {
        position: fixed;
        top: 1rem;
        right: 1rem;
        gap: 0.5rem;
      }

      .hero-link {
        padding: 0.5rem 0.7rem;
        font-size: 0.75rem;
      }

      .hero h1 {
        font-size: 2.5rem;
      }

      .hero .tagline {
        font-size: 1.1rem;
        padding: 0 1rem;
      }

      .card, .step {
        padding: 1.5rem;
      }

      .steps {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .platforms {
        grid-template-columns: 1fr;
      }

      .code-wrapper.inline {
        width: 100%;
        max-width: 100%;
      }

      .code-content {
        font-size: 0.75rem;
        padding: 0.75rem;
      }

      .code-wrapper.inline .code-content {
        padding: 0.5rem;
      }

      .copy-btn {
        padding: 0.3rem 0.6rem;
        font-size: 0.7rem;
      }

      .step {
        height: auto;
      }

      .steps {
        grid-template-columns: 1fr;
        align-items: stretch;
      }
    }

    @media (max-width: 480px) {
      .hero h1 {
        font-size: 2rem;
      }

      .hero .tagline {
        font-size: 1rem;
      }

      .card h2 {
        font-size: 1.5rem;
      }

      .step h3 {
        font-size: 1.1rem;
      }
    }

    /* Simple fade-in animation */
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .hero, .card, .step {
      animation: fadeIn 0.6s ease;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-links">
        <a href="https://github.com/alexpota/deploy-mcp" target="_blank" class="hero-link">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          GitHub
        </a>
        <a href="https://www.npmjs.com/package/deploy-mcp" target="_blank" class="hero-link">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M1.763 0C.786 0 0 .786 0 1.763v20.474C0 23.214.786 24 1.763 24h20.474c.977 0 1.763-.786 1.763-1.763V1.763C24 .786 23.214 0 22.237 0H1.763zM5.13 5.323l13.837.019-.009 13.836h-3.464l.01-10.382h-3.456L12.04 19.17H5.113z"/>
          </svg>
          NPM
        </a>
      </div>
      <div class="subtitle">Universal Deployment Tracker</div>
      <h1>deploy-mcp</h1>
      <p class="tagline">Track deployments across all platforms directly in your AI assistant. Never context-switch to check deployment status again.</p>
      
      <div class="quick-start">
        <h3>Get Started in Seconds</h3>
        <div class="code-wrapper inline">
          <div class="code-header">
            <button class="copy-btn" onclick="copyToClipboard('npx deploy-mcp', event)">Copy</button>
          </div>
          <div class="code-content">npx deploy-mcp</div>
        </div>
      </div>
    </section>

    <!-- Installation Steps -->
    <div class="steps">
      <div class="step">
        <div class="step-number">1</div>
        <div class="step-content">
          <h3>Install & Run</h3>
          <p>Get started instantly with npx - no installation required.</p>
          <div class="code-wrapper inline">
            <div class="code-header">
              <button class="copy-btn" onclick="copyToClipboard('npx deploy-mcp', event)">Copy</button>
            </div>
            <div class="code-content">npx deploy-mcp</div>
          </div>
        </div>
      </div>

      <div class="step">
        <div class="step-number">2</div>
        <div class="step-content">
          <h3>Configure Claude</h3>
          <p>Add to your Claude Desktop configuration file.</p>
          <div class="code-wrapper multiline">
            <div class="code-header">
              <button class="copy-btn" onclick="copyClaudeConfig(event)">Copy</button>
            </div>
            <div class="code-content">{
  <span class="token-property">"mcpServers"</span>: {
    <span class="token-property">"deploy-mcp"</span>: {
      <span class="token-property">"command"</span>: <span class="token-string">"npx"</span>,
      <span class="token-property">"args"</span>: [<span class="token-string">"-y"</span>, <span class="token-string">"deploy-mcp"</span>],
      <span class="token-property">"env"</span>: {
        <span class="token-property">"VERCEL_TOKEN"</span>: <span class="token-string">"your-token"</span>
      }
    }
  }
}</div>
          </div>
        </div>
      </div>

      <div class="step">
        <div class="step-number">3</div>
        <div class="step-content">
          <h3>Start Tracking</h3>
          <p>Ask Claude about your deployments directly in conversation.</p>
          <div class="code-wrapper inline">
            <div class="code-header">
              <button class="copy-btn" onclick="copyToClipboard('Check my latest Vercel deployment', event)">Copy</button>
            </div>
            <div class="code-content">"Check my latest Vercel deployment"</div>
          </div>
          <div style="margin-top: 1rem; padding: 1rem; background: rgba(255, 255, 255, 0.03); border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.1);">
            <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Claude responds:</p>
            <div style="font-family: 'SF Mono', Monaco, monospace; font-size: 0.875rem; line-height: 1.5; color: #e2e8f0;">
              ✅ <strong>Status</strong>: Success<br>
              🌐 <strong>Live URL</strong>: https://my-app.vercel.app<br>
              ⏱️ <strong>Deployment Time</strong>: 45 seconds<br>
              📅 <strong>Last Deployed</strong>: 2 minutes ago<br>
              🔄 <strong>Commit</strong>: "Update homepage hero section"
            </div>
          </div>
        </div>
      </div>
    </div>


    <!-- Live Status Badges -->
    <div class="card">
      <h2>Live Status Badges</h2>
      <p>Embed deployment status in your README with beautiful, real-time badges.</p>
      
      <div class="badge-showcase">
        <div class="badge-preview">
          <h3 style="margin-bottom: 1rem; color: var(--text-primary); font-size: 1.1rem;">Live Examples:</h3>
          <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.5rem;">
            <div style="display: flex; align-items: center;">
              <img src="https://img.shields.io/endpoint?url=https://deploy-mcp.io/badge/microsoft/vscode/vercel" alt="Vercel Deploy Status" style="margin-right: 0.75rem;" />
              <span style="color: var(--text-secondary); font-size: 0.9rem;">microsoft/vscode on Vercel</span>
            </div>
            <div style="display: flex; align-items: center;">
              <img src="https://img.shields.io/endpoint?url=https://deploy-mcp.io/badge/facebook/react/vercel" alt="Netlify Deploy Status" style="margin-right: 0.75rem;" />
              <span style="color: var(--text-secondary); font-size: 0.9rem;">facebook/react on Netlify</span>
            </div>
            <div style="display: flex; align-items: center;">
              <img src="https://img.shields.io/endpoint?url=https://deploy-mcp.io/badge/angular/angular/vercel" alt="Railway Deploy Status" style="margin-right: 0.75rem;" />
              <span style="color: var(--text-secondary); font-size: 0.9rem;">angular/angular on Railway</span>
            </div>
          </div>
        </div>
        <div class="code-wrapper multiline">
          <div class="code-header">
            <button class="copy-btn" onclick="copyToClipboard('[![Deploy Status](https://img.shields.io/endpoint?url=https://deploy-mcp.io/badge/user/repo/vercel)](https://deploy-mcp.io)', event)">Copy</button>
          </div>
          <div class="code-content">[![Deploy Status](https://img.shields.io/endpoint?url=https://deploy-mcp.io/badge/user/repo/vercel)](https://deploy-mcp.io)</div>
        </div>
      </div>
      <div style="text-align: center; margin-top: 1.5rem;">
        <p style="color: var(--accent-green); font-size: 1rem; font-weight: 600;">✅ Now Available</p>
        <p style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 0.5rem;">
          Supports Vercel • Netlify and Railway coming soon
        </p>
      </div>
      
      <div style="margin-top: 2rem; padding: 1.5rem; background: var(--bg-secondary); border-radius: 8px; border-left: 3px solid var(--accent-blue);">
        <h4 style="margin: 0 0 1rem 0; color: var(--text-primary); font-size: 1rem;">Quick Setup:</h4>
        <ol style="margin: 0; padding-left: 1.5rem; color: var(--text-secondary); line-height: 1.6;">
          <li>Add badge to your README (replace user/repo in URL above)</li>
          <li>Configure webhook in your deployment platform</li>
          <li>Badge updates automatically on each deployment</li>
        </ol>
        <p style="margin: 1rem 0 0 0; color: var(--text-secondary); font-size: 0.9rem;">
          📖 <strong>Detailed setup instructions:</strong> <a href="https://github.com/alexpota/deploy-mcp#deployment-status-badges" style="color: var(--accent-blue); text-decoration: none;">View README</a>
        </p>
      </div>
    </div>

    <!-- Supported Platforms -->
    <div class="card">
      <h2>Supported Platforms</h2>
      <p>Universal support for all major deployment platforms, with more coming soon.</p>
      
      <div class="platforms">
        <div class="platform supported">
          <div class="platform-status"></div>
          <div class="platform-icon">
            <img src="https://vercel.com/favicon.ico" alt="Vercel" style="width: 24px; height: 24px;">
          </div>
          <h3>Vercel</h3>
          <p>Full deployment tracking with real-time status updates</p>
        </div>
        <div class="platform coming-soon">
          <div class="platform-status"></div>
          <div class="platform-icon">
            <img src="https://www.netlify.com/favicon.ico" alt="Netlify" style="width: 24px; height: 24px;">
          </div>
          <h3>Netlify</h3>
          <p>Coming in next release</p>
        </div>
        <div class="platform coming-soon">
          <div class="platform-status"></div>
          <div class="platform-icon">
            <img src="https://railway.app/favicon.ico" alt="Railway" style="width: 24px; height: 24px;">
          </div>
          <h3>Railway</h3>
          <p>On the roadmap</p>
        </div>
        <div class="platform coming-soon">
          <div class="platform-status"></div>
          <div class="platform-icon">
            <img src="https://us1.discourse-cdn.com/flex016/uploads/render/original/2X/a/ad2cd49c57c27455f695b61f3f8a01571697b336.svg" alt="Render" style="width: 24px; height: 24px;">
          </div>
          <h3>Render</h3>
          <p>On the roadmap</p>
        </div>
      </div>
    </div>

    <!-- Works with Your AI Tools -->
    <div class="card">
      <h2>Works with Your AI Tools</h2>
      <p>Compatible with all major AI assistants that support Model Context Protocol.</p>
      
      <div class="ai-tools">
        <div class="ai-tool" onclick="toggleConfig('claude')">
          <div class="ai-tool-header">
            <div class="ai-tool-icon" style="background: linear-gradient(135deg, #2a2a3a, #1a1a24);">
              <img src="https://claude.ai/favicon.ico" alt="Claude" style="width: 28px; height: 28px;">
            </div>
            <div class="ai-tool-info">
              <h4>Claude Desktop</h4>
              <span class="ai-tool-status">✓ Official Support</span>
            </div>
            <div class="ai-tool-toggle" id="claude-toggle">+</div>
          </div>
          <div class="ai-tool-config" id="claude-config" style="display: none;">
            <p class="config-path">Config: ~/Library/Application Support/Claude/claude_desktop_config.json</p>
            <p style="font-size: 0.875rem; color: var(--text-secondary); margin: 0.5rem 0;">Use the configuration below ↓</p>
          </div>
        </div>

        <div class="ai-tool" onclick="toggleConfig('cursor')">
          <div class="ai-tool-header">
            <div class="ai-tool-icon" style="background: linear-gradient(135deg, #2a2a3a, #1a1a24);">
              <img src="https://www.cursor.com/favicon.ico" alt="Cursor" style="width: 28px; height: 28px;">
            </div>
            <div class="ai-tool-info">
              <h4>Cursor AI</h4>
              <span class="ai-tool-status">✓ One-click Install</span>
            </div>
            <div class="ai-tool-toggle" id="cursor-toggle">+</div>
          </div>
          <div class="ai-tool-config" id="cursor-config" style="display: none;">
            <p class="config-path">Settings → MCP or ~/.cursor/mcp.json</p>
            <p style="font-size: 0.875rem; color: var(--text-secondary); margin: 0.5rem 0;">Use the configuration below ↓</p>
          </div>
        </div>

        <div class="ai-tool" onclick="toggleConfig('windsurf')">
          <div class="ai-tool-header">
            <div class="ai-tool-icon" style="background: linear-gradient(135deg, #2a2a3a, #1a1a24);">
              <img src="https://codeium.com/favicon.ico" alt="Windsurf" style="width: 28px; height: 28px;">
            </div>
            <div class="ai-tool-info">
              <h4>Windsurf IDE</h4>
              <span class="ai-tool-status">✓ Native Support</span>
            </div>
            <div class="ai-tool-toggle" id="windsurf-toggle">+</div>
          </div>
          <div class="ai-tool-config" id="windsurf-config" style="display: none;">
            <p class="config-path">Settings → Advanced → Cascade or ~/.codeium/windsurf/mcp_config.json</p>
            <p style="font-size: 0.875rem; color: var(--text-secondary); margin: 0.5rem 0;">Use the configuration below ↓</p>
          </div>
        </div>

        <div class="ai-tool" onclick="toggleConfig('vscode')">
          <div class="ai-tool-header">
            <div class="ai-tool-icon" style="background: linear-gradient(135deg, #2a2a3a, #1a1a24);">
              <img src="https://code.visualstudio.com/assets/favicon.ico" alt="VS Code" style="width: 28px; height: 28px;">
            </div>
            <div class="ai-tool-info">
              <h4>VS Code</h4>
              <span class="ai-tool-status">✓ GitHub Copilot</span>
            </div>
            <div class="ai-tool-toggle" id="vscode-toggle">+</div>
          </div>
          <div class="ai-tool-config" id="vscode-config" style="display: none;">
            <p class="config-path">Workspace .vscode/mcp.json or global ~/.vscode/mcp.json</p>
            <p style="font-size: 0.875rem; color: var(--text-secondary); margin: 0.5rem 0;">Requires GitHub Copilot subscription. Use the shared configuration below ↓</p>
          </div>
        </div>
        
        <div style="margin-top: 1.5rem; padding: 1rem; background: rgba(255, 255, 255, 0.02); border-radius: 8px; border-left: 3px solid var(--accent-blue); text-align: center;">
          <p style="color: var(--text-secondary); font-size: 0.9rem; margin: 0;">
            <strong style="color: var(--accent-blue);">+ Any MCP-compatible tool</strong><br>
            Works with all AI assistants that support <a href="https://modelcontextprotocol.io" target="_blank" style="color: var(--accent-blue); text-decoration: none;">Model Context Protocol</a>
          </p>
        </div>
      </div>
      
      <!-- Shared Configuration -->
      <div class="shared-config-section" style="margin-top: 2rem; padding: 2rem; background: var(--bg-secondary); border: 2px solid var(--border-primary); border-radius: 16px;">
        <h3 style="color: var(--text-primary); font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem; text-align: center;">MCP Configuration</h3>
        <p style="color: var(--text-secondary); text-align: center; margin-bottom: 1.5rem; font-size: 0.95rem;">All AI tools use the same configuration. Copy this JSON and paste it into your tool's MCP settings:</p>
        <div class="code-wrapper multiline">
          <div class="code-header">
            <button class="copy-btn" onclick="copyToClipboard(JSON.stringify({mcpServers:{'deploy-mcp':{command:'npx',args:['-y','deploy-mcp'],env:{VERCEL_TOKEN:'your-vercel-token'}}}},null,2), event)">Copy Configuration</button>
          </div>
          <div class="code-content">{
  <span class="token-property">"mcpServers"</span>: {
    <span class="token-property">"deploy-mcp"</span>: {
      <span class="token-property">"command"</span>: <span class="token-string">"npx"</span>,
      <span class="token-property">"args"</span>: [<span class="token-string">"-y"</span>, <span class="token-string">"deploy-mcp"</span>],
      <span class="token-property">"env"</span>: {
        <span class="token-property">"VERCEL_TOKEN"</span>: <span class="token-string">"your-vercel-token"</span>
      }
    }
  }
}</div>
        </div>
        <p style="color: var(--text-muted); font-size: 0.875rem; text-align: center; margin-top: 1rem;">💡 Replace <code style="background: rgba(255,255,255,0.1); padding: 0.2rem 0.4rem; border-radius: 4px;">your-vercel-token</code> with your actual Vercel API token from <a href="https://vercel.com/account/tokens" target="_blank" style="color: var(--accent-red); text-decoration: none;">vercel.com/account/tokens</a></p>
      </div>
    </div>

    <!-- Why Choose deploy-mcp -->
    <div class="card">
      <h2>Why deploy-mcp?</h2>
      <div class="steps">
        <div class="step">
          <h3>Zero Context Switching</h3>
          <p>Check deployment status without leaving your AI conversation. No more alt-tabbing to dashboards.</p>
        </div>
        <div class="step">
          <h3>Secure & Private</h3>
          <p>Your API tokens stay local. Never sent to third parties or logged anywhere.</p>
        </div>
        <div class="step">
          <h3>Lightning Fast</h3>
          <p>Get deployment status in under 2 seconds. Optimized for developer productivity.</p>
        </div>
      </div>
    </div>

    <!-- Simple Footer -->
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-links">
            <a href="https://github.com/alexpota/deploy-mcp" target="_blank">GitHub</a>
            <a href="https://github.com/alexpota/deploy-mcp/issues" target="_blank">Issues</a>
            <a href="https://www.npmjs.com/package/deploy-mcp" target="_blank">NPM</a>
            <a href="https://github.com/alexpota/deploy-mcp/blob/main/README.md" target="_blank">Docs</a>
          </div>
          <p>&copy; 2025 deploy-mcp. Open source under Apache 2.0 license.</p>
        </div>
      </div>
    </footer>
  </div>

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
      }).catch(err => {
        console.error('Failed to copy: ', err);
        btn.textContent = 'Failed';
        setTimeout(() => {
          btn.textContent = 'Copy';
        }, 2000);
      });
    }


    function copyClaudeConfig(event) {
      const config = '{"mcpServers":{"deploy-mcp":{"command":"npx","args":["-y","deploy-mcp"],"env":{"VERCEL_TOKEN":"your-vercel-token"}}}}';
      copyToClipboard(config, event);
    }

    function toggleConfig(tool) {
      const config = document.getElementById(tool + '-config');
      const toggle = document.getElementById(tool + '-toggle');
      
      if (config.style.display === 'none') {
        config.style.display = 'block';
        toggle.classList.add('open');
        toggle.textContent = '×';
      } else {
        config.style.display = 'none';
        toggle.classList.remove('open');
        toggle.textContent = '+';
      }
      
      // Prevent event bubbling
      event.stopPropagation();
    }

    // Add smooth scrolling for any anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
          behavior: 'smooth'
        });
      });
    });

  </script>
</body>
</html>`;
