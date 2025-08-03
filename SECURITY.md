# Security Policy

## Supported Versions

We take security seriously and provide security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability in deploy-mcp, please help us maintain the security of the project by reporting it responsibly.

### How to Report

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please send an email to: **alex.potapenko.dev@gmail.com**

Include the following information:
- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact assessment
- Any suggested fixes or mitigations

### Response Timeline

- **Initial Response**: Within 48 hours of receiving your report
- **Status Update**: Weekly updates on investigation progress
- **Resolution**: Security fixes are prioritized and typically released within 7-14 days

### Disclosure Policy

- We will acknowledge receipt of your vulnerability report within 2 business days
- We will provide regular updates on our investigation and remediation timeline
- We will notify you when the vulnerability has been fixed
- We will publicly disclose the vulnerability details after a fix has been released and deployed

### Security Best Practices

When using deploy-mcp in production:

1. **API Token Security**: Store tokens in environment variables, never in code or version control
2. **Token Permissions**: Use read-only API tokens when possible to minimize risk
3. **Token Rotation**: Regularly rotate API tokens for enhanced security
4. **Network Security**: Ensure secure connections when accessing deployment platforms
5. **Updates**: Keep deploy-mcp and its dependencies up to date

### Security Features

deploy-mcp includes several security-conscious design decisions:

- **Local-only token storage** - API tokens never leave your machine
- **No data collection** - Zero tracking or analytics of user data
- **Direct API calls** - All requests go directly to deployment platforms
- **Input validation** using Zod schemas to prevent injection attacks
- **Minimal dependencies** to reduce supply chain risks
- **Strict TypeScript** compilation to catch potential issues at build time

Thank you for helping keep deploy-mcp and the Node.js ecosystem secure.