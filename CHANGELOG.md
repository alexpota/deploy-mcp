# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.6.2] - 2025-11-21

### Fixed

- Updated test mock implementations for Vitest 4.0 compatibility
- Mock constructors now use `function` keyword instead of arrow functions as required by Vitest 4.0

### Changed

- Upgraded to Vitest 4.0.4 from 3.2.4
- Updated all development dependencies to latest versions

## [0.1.0] - 2025-01-15

### Added

- Initial release of deploy-mcp
- MCP server for deployment status tracking
- Vercel adapter with full API integration
- Professional landing page with AI tools configuration
- Support for multiple AI assistants:
  - Claude Desktop (official support)
  - VS Code with GitHub Copilot
  - Cursor AI
  - Windsurf IDE
  - Continue.dev
  - Cline
- Comprehensive configuration examples and documentation
- TypeScript with strict mode
- ESLint + Prettier with automated formatting
- Vitest testing framework
- Husky pre-commit hooks
- Cloudflare Workers deployment
- Feature-based adapter architecture
- Professional package.json scripts
- Security policy and community guidelines

### Technical Details

- Node.js 22+ requirement
- Updated MCP SDK to 1.11.2
- Zero runtime dependencies for core functionality
- Strict TypeScript compilation
- Automated code quality checks
- Professional open source project structure

[Unreleased]: https://github.com/alexpota/deploy-mcp/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/alexpota/deploy-mcp/releases/tag/v0.1.0