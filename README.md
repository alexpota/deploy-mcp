<div align="center">

# deploy-mcp

**Universal Deployment Tracker for AI Assistants**

Track deployments across all platforms directly in your AI conversation.  
No more context-switching. No more dashboard hunting.

[![npm version](https://img.shields.io/npm/v/deploy-mcp.svg?style=for-the-badge&color=ff6b6b)](https://www.npmjs.com/package/deploy-mcp)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg?style=for-the-badge)](https://github.com/alexpota/deploy-mcp/blob/main/LICENSE)
[![Website](https://img.shields.io/badge/website-deploy--mcp.io-ff8e53?style=for-the-badge)](https://deploy-mcp.io)

</div>

---

## Demo

```
// In your AI conversation:
"Check my latest Vercel deployment"

// Claude's Response:
✅ **Status**: Success  
🌐 **Live URL**: https://my-app.vercel.app  
⏱️ **Deployment Time**: 45 seconds  
📅 **Last Deployed**: January 15, 2025 at 10:30 UTC  
🌍 **Environment**: Production  

**Latest Commit**:
- SHA: `abc123ef`
- Message: "Update homepage hero section"
- Author: John Doe

Everything looks good - your deployment is live and running successfully!
```

**Just ask your AI**: *"What's the status of my latest deployment?"*  
Get instant answers without leaving your conversation.

## Features

<table>
<tr>
<td width="50%">

**Universal AI Support**  
Built for the Model Context Protocol. Works seamlessly with Claude Desktop, VS Code, Cursor, Windsurf, Continue.dev, Cline, and any MCP-compatible AI assistant.

**Secure & Private**  
Your API tokens stay local on your machine. Never sent to third parties or logged anywhere.

**Lightning Fast**  
Get deployment status in under 2 seconds. Optimized for developer productivity.

</td>
<td width="50%">

**Zero Context Switching**  
Check deployment status without leaving your AI conversation.

**Universal Platform Support**  
Currently supports Vercel, with Netlify, Railway, and Render coming soon.

**Real-time Status**  
Get instant deployment status through AI conversation.

**Open Source**  
Fully transparent, community-driven development.

</td>
</tr>
</table>

## Why deploy-mcp?

**The Problem**: Developers context-switch 10-20 times per day to check deployment status, losing 23 minutes of focus each time.

**The Solution**: deploy-mcp brings deployment status directly into your AI conversation. No more alt-tabbing, no more dashboard hunting, no more broken flow state.

Built for the modern developer who uses AI assistants as part of their daily workflow.

## Quick Start

**Get started in under 30 seconds:**

```bash
npx deploy-mcp
```

That's it! The server is now running and ready to be configured in your AI assistant.

## Configuration

### AI Assistants

<details>
<summary><strong>Claude Desktop</strong> ✅</summary>

**Official MCP support** - Ready to use today

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`  
**Linux**: `~/.config/Claude/claude_desktop_config.json`

</details>

<details>
<summary><strong>VS Code</strong> ✅</summary>

**Official MCP support** - Generally available in VS Code 1.102+

Add to workspace `.vscode/mcp.json` or global `~/.vscode/mcp.json`

Requires GitHub Copilot subscription and MCP policy enabled by organization.
</details>

<details>
<summary><strong>Cursor AI</strong> ✅</summary>

**Official MCP support** - Available with one-click installation

Navigate to Cursor Settings → MCP or create `~/.cursor/mcp.json`

</details>

<details>
<summary><strong>Windsurf IDE</strong> ✅</summary>

**Official MCP support** - Native integration with Cascade

Navigate to Windsurf Settings → Advanced Settings → Cascade or edit `~/.codeium/windsurf/mcp_config.json`

</details>

<details>
<summary><strong>Continue.dev</strong> ✅</summary>

**Official MCP support** - Available in agent mode

Add to your `config.json` with different structure:

```json
{
  "experimental": {
    "modelContextProtocolServer": {
      "transport": {
        "type": "stdio",
        "command": "npx",
        "args": ["-y", "deploy-mcp"]
      },
      "env": {
        "VERCEL_TOKEN": "your-vercel-token"
      }
    }
  }
}
```

Or create `.continue/mcpServers/` folder in your workspace.
</details>

<details>
<summary><strong>Cline (VS Code)</strong> ✅</summary>

**Official MCP support** - Can create and install tools automatically

Cline can install deploy-mcp through natural language:
- Ask: *"Add the deploy-mcp tool to check Vercel deployments"*
- Or manually configure via MCP Servers icon → Advanced MCP Settings

</details>

**+ Any MCP-compatible tool**  
Works with all AI assistants that support [Model Context Protocol](https://modelcontextprotocol.io)

### MCP Configuration

All AI tools (except Continue.dev) use the same configuration:

```json
{
  "mcpServers": {
    "deploy-mcp": {
      "command": "npx",
      "args": ["-y", "deploy-mcp"],
      "env": {
        "VERCEL_TOKEN": "your-vercel-token"
      }
    }
  }
}
```

💡 Replace `your-vercel-token` with your actual Vercel API token from [vercel.com/account/tokens](https://vercel.com/account/tokens)

## Deployment Status Badges

Get live deployment status badges for your repositories that update in real-time via webhooks.

### Badge URLs

Add these badges to your README to show live deployment status:

```markdown
![Vercel Deployment](https://deploy-mcp.io/badge/username/repository/vercel)
```

**Examples:**
- `https://deploy-mcp.io/badge/john/my-app/vercel`
- `https://deploy-mcp.io/badge/youruser/yourrepo/vercel`

**⚠️ Requirements:**
- **Public repositories only** - Private repos not supported for security reasons
- **Vercel Pro/Enterprise plan** - Webhooks required for real-time badge updates

**For free tier users:** The MCP server works perfectly for checking deployment status in your AI conversations. Badges are a premium feature requiring paid Vercel plans.

### Setting Up Webhooks

For badges to show real-time status, configure webhooks in your deployment platform:

#### Vercel Setup

**Note:** Vercel webhooks require a Pro or Enterprise plan.

1. **Go to your Vercel team settings**
2. **Navigate to "Webhooks" section**
3. **Click "Create Webhook"**
4. **Configure the webhook:**
   - **URL**: `https://deploy-mcp.io/webhook/yourusername/yourrepo/vercel`
   - **Events**: Select "Deployment Created", "Deployment Ready", and "Deployment Error"
   - **Projects**: Choose your specific project or leave empty for all projects
   - **Secret**: Leave empty (not required for public repositories)
5. **Save the webhook**

**Important:** Replace `yourusername` and `yourrepo` with your actual GitHub username and repository name.

**Note:** Vercel's free tier doesn't support webhooks, so badges won't work. Use the MCP server instead for deployment status in your AI conversations.

#### Supported Events

The webhook will trigger on:
- ✅ Deployment started (badge shows "building")
- ✅ Deployment succeeded (badge shows "success")
- ❌ Deployment failed (badge shows "failed")
- ⚠️ Deployment errored (badge shows "error")

#### Badge Status Colors

- 🟢 **Success** - Green badge when deployment is live
- 🔴 **Failed** - Red badge when deployment failed
- 🟡 **Building** - Yellow badge during deployment
- ⚫ **Unknown** - Grey badge when no status available
- 🔴 **Error** - Red badge when deployment errored

### Testing Your Setup

1. **Add the badge** to your repository README
2. **Configure the webhook** as described above
3. **Make a commit** and push to trigger a deployment
4. **Watch the badge** update in real-time during deployment

**Initial badge status will show "unknown" until the first webhook is received.**


### Getting API Tokens

<details>
<summary><strong>Vercel</strong></summary>

1. Go to [Vercel Dashboard](https://vercel.com/account/tokens)
2. Click **"Create Token"**
3. Give it a descriptive name (e.g., "deploy-mcp")
4. Select appropriate scope (read-only is sufficient)
5. Copy the token and add it to your configuration

</details>

<details>
<summary><strong>Netlify</strong> (Coming Soon)</summary>

1. Go to [Netlify User Settings](https://app.netlify.com/user/applications#personal-access-tokens)
2. Click **"New access token"**
3. Give it a descriptive name
4. Copy the token
</details>

<details>
<summary><strong>Railway</strong> (Coming Soon)</summary>

Railway integration is on our roadmap. [Star the repo](https://github.com/alexpota/deploy-mcp) to get notified!
</details>

<details>
<summary><strong>Render</strong> (Coming Soon)</summary>

Render integration is on our roadmap. [Star the repo](https://github.com/alexpota/deploy-mcp) to get notified!
</details>

## Usage Examples

### MCP Server Usage

Once configured with your AI assistant, simply ask:

```
You: Check my latest Vercel deployment

Assistant: I'll check your latest Vercel deployment for you.

✅ **Status**: Success
🌐 **Live URL**: https://my-app.vercel.app
⏱️ **Deployment Time**: 45 seconds
📅 **Last Deployed**: January 15, 2025 at 10:30 UTC
🌍 **Environment**: Production

**Latest Commit**:
- SHA: `abc123ef`
- Message: "Update homepage hero section"
- Author: John Doe

Everything looks good - your deployment is live and running successfully!
```

**More examples:**
- `"Is my website deployment finished?"`
- `"Show me the deployment status for project-xyz"`
- `"Check if the production deployment succeeded"`
- `"What's the status of my latest deploy?"`

### Badge Usage

Add live deployment status badges to your README:

```markdown
# My Project

![Vercel](https://deploy-mcp.io/badge/yourusername/yourrepo/vercel)

<!-- Other content -->
```

**Multiple platforms:**
```markdown
[![Vercel](https://deploy-mcp.io/badge/user/repo/vercel)](https://deploy-mcp.io)
[![Netlify](https://deploy-mcp.io/badge/user/repo/netlify)](https://deploy-mcp.io)
```


## MCP Tools Reference
Retrieve the latest deployment status for a project.

<details>
<summary><strong>Parameters</strong></summary>

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `platform` | string | ✓ | Deployment platform (`vercel`, `netlify`, etc.) |
| `project` | string | ✓ | Project name or ID |
| `token` | string | ✗ | API token (uses env variable if not provided) |

</details>

<details>
<summary><strong>Response Format</strong></summary>

```typescript
{
  status: "success" | "failed" | "building" | "error",
  url: string,
  projectName: string,
  platform: string,
  timestamp: string,
  duration: number,
  environment: "production" | "preview" | "development",
  commit: {
    sha: string,
    message: string,
    author: string
  }
}
```

</details>

## Development

For contributors who want to help develop deploy-mcp.

### Prerequisites

- Node.js 22 or higher
- npm, yarn, or pnpm

### Local Development

```bash
# Clone the repository
git clone https://github.com/alexpota/deploy-mcp.git
cd deploy-mcp

# Install dependencies
npm install

# Run in development mode  
npm run dev
```

### Testing

```bash
# Run tests
npm test

# Type checking
npm run lint
```

### Building & Deployment

```bash
# Build TypeScript
npm run build

# Deploy worker to Cloudflare
npm run deploy

# Development worker server
npm run dev:worker
```

## Project Structure

```
deploy-mcp/
├── src/
│   ├── index.ts              # MCP server entry point
│   ├── worker.ts             # Cloudflare Worker for website
│   ├── adapters/             # Platform adapters (new structure)
│   │   ├── base/             # Base adapter framework
│   │   │   ├── adapter.ts    # Abstract base class
│   │   │   ├── types.ts      # Common interfaces
│   │   │   └── index.ts      # Base exports
│   │   ├── vercel/           # Vercel platform support
│   │   │   ├── index.ts      # Main adapter class
│   │   │   ├── types.ts      # Vercel-specific types
│   │   │   ├── api.ts        # API client
│   │   │   └── __tests__/    # Vercel tests
│   │   └── index.ts          # All adapter exports
│   ├── core/
│   │   ├── mcp-handler.ts    # MCP protocol implementation
│   │   └── tools.ts          # MCP tool definitions
│   ├── server/
│   │   └── badge.ts          # SVG badge generation (v0.2.0)
│   └── types.ts              # TypeScript definitions
├── tests/                    # Integration tests
├── dist/                     # Compiled output
├── wrangler.toml            # Cloudflare config
├── tsconfig.json            # TypeScript config
└── package.json             # Project metadata
```

## Security

### Our Security Commitments

- **Local-Only Tokens** - Your API tokens never leave your machine
- **No Data Collection** - We don't track, log, or store any user data
- **Direct API Calls** - All platform APIs are called directly from your local MCP server
- **Open Source** - Full transparency with auditable code
- **Badge Service** - Coming in v0.2.0 with webhook-based live deployment badges

### Best Practices

1. **Use Read-Only Tokens** - When possible, create tokens with minimal permissions
2. **Rotate Tokens Regularly** - Update your tokens periodically
3. **Environment Variables** - Store tokens in environment variables, not in code
4. **Git Ignore** - Never commit configuration files with tokens

## Platform Support

<table>
  <thead>
    <tr>
      <th>Platform</th>
      <th>Status</th>
      <th>Features</th>
      <th>Documentation</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Vercel</strong></td>
      <td><strong>✓ Supported</strong></td>
      <td>Full deployment tracking with real-time status updates</td>
      <td><a href="https://deploy-mcp.io/docs/vercel">View Guide</a></td>
    </tr>
    <tr>
      <td><strong>Netlify</strong></td>
      <td><strong>Coming Soon</strong></td>
      <td>In active development</td>
      <td>Coming soon</td>
    </tr>
    <tr>
      <td><strong>Railway</strong></td>
      <td><strong>Planned</strong></td>
      <td>On the roadmap</td>
      <td>-</td>
    </tr>
    <tr>
      <td><strong>Render</strong></td>
      <td><strong>Planned</strong></td>
      <td>On the roadmap</td>
      <td>-</td>
    </tr>
  </tbody>
</table>

Want support for another platform? [Open an issue](https://github.com/alexpota/deploy-mcp/issues/new) or submit a PR\!

## Contributing

We love contributions\! Whether it's a bug fix, new feature, or platform support, we'd love to have you.

### Quick Start

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Adding Platform Support

Want to add support for a new platform? Here's how:

1. **Create an adapter folder** in `src/adapters/your-platform/`
2. **Implement the interface**:
   ```typescript
   export class YourPlatformAdapter extends BaseAdapter {
     async getDeploymentStatus(project: string, token: string) {
       // Your implementation
     }
   }
   ```
3. **Add tests** in `src/adapters/your-platform/__tests__/`
4. **Update docs** with setup instructions
5. **Submit a PR** and we'll review it\!

See our [Contributing Guide](CONTRIBUTING.md) for more details.

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Model Context Protocol SDK](https://github.com/modelcontextprotocol/sdk) by Anthropic
- Hosted on [Cloudflare Workers](https://workers.cloudflare.com) for global edge performance
- Icons from [Feather Icons](https://feathericons.com) and [Heroicons](https://heroicons.com)

## Community & Support

<div align="center">
  <a href="https://github.com/alexpota/deploy-mcp/discussions">
    <img src="https://img.shields.io/badge/GitHub-Discussions-181717?style=for-the-badge&logo=github" alt="GitHub Discussions" />
  </a>
  <a href="https://github.com/alexpota/deploy-mcp/issues">
    <img src="https://img.shields.io/badge/Report-Issues-ff6b6b?style=for-the-badge&logo=github" alt="Report Issues" />
  </a>
  <a href="mailto:alex.potapenko.dev@gmail.com">
    <img src="https://img.shields.io/badge/Email-alex.potapenko.dev@gmail.com-ff6b6b?style=for-the-badge&logo=gmail" alt="Email" />
  </a>
</div>

---

<div align="center">
  <p>Made with ❤️ by <a href="https://github.com/alexpota">Alex Potapenko</a> and contributors</p>
  <p><a href="https://deploy-mcp.io">deploy-mcp.io</a> • <a href="https://github.com/alexpota/deploy-mcp">GitHub</a> • <a href="https://www.npmjs.com/package/deploy-mcp">NPM</a></p>
</div>

