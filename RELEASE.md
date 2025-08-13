# Release Process

This document describes the release process for deploy-mcp.

## Automated Release (Recommended)

### Option 1: GitHub Actions (Manual Trigger)

1. Go to [Actions → Release workflow](https://github.com/alexpota/deploy-mcp/actions/workflows/release.yml)
2. Click "Run workflow"
3. Select version type:
   - `patch` - Bug fixes (0.2.0 → 0.2.1)
   - `minor` - New features (0.2.0 → 0.3.0)
   - `major` - Breaking changes (0.2.0 → 1.0.0)
4. Click "Run workflow"

The workflow will:
- Run tests
- Bump version in package.json
- Create git tag
- Push changes to main
- Publish to npm
- Create GitHub release with notes

### Option 2: npm Scripts (Local)

```bash
# For patch release (bug fixes)
npm run release

# For minor release (new features)
npm run release:minor

# For major release (breaking changes)
npm run release:major
```

These commands will:
1. Bump version in package.json
2. Create git tag
3. Push to GitHub (triggering release workflow)

## Manual Release

If you need to release manually:

```bash
# 1. Ensure you're on main branch
git checkout main
git pull origin main

# 2. Run tests
npm test

# 3. Bump version (choose one)
npm version patch   # 0.2.0 → 0.2.1
npm version minor   # 0.2.0 → 0.3.0
npm version major   # 0.2.0 → 1.0.0

# 4. Push to GitHub
git push origin main --tags

# 5. Publish to npm
npm publish
```

## Pre-release Checklist

Before releasing:

- [ ] All tests pass (`npm test`)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No lint errors (`npm run lint`)
- [ ] README is up to date
- [ ] CHANGELOG is updated (if applicable)
- [ ] Dependencies are up to date

## Post-release

After a successful release:

1. Verify npm package: https://www.npmjs.com/package/deploy-mcp
2. Check GitHub release: https://github.com/alexpota/deploy-mcp/releases
3. Test installation: `npx deploy-mcp@latest`
4. Update any related documentation

## NPM Token Setup

For automated releases to work, ensure the NPM_TOKEN secret is set in GitHub:

1. Generate npm token: https://www.npmjs.com/settings/~/tokens
2. Add to GitHub: Settings → Secrets → Actions → New repository secret
3. Name: `NPM_TOKEN`
4. Value: Your npm token

## Troubleshooting

### Release workflow fails

- Check GitHub Actions logs
- Ensure NPM_TOKEN is valid
- Verify all tests pass locally

### Version already exists

If a version was already published:
1. Delete the local tag: `git tag -d v0.3.0`
2. Delete remote tag: `git push origin :refs/tags/v0.3.0`
3. Bump to next version and retry

### npm publish fails

- Check npm authentication: `npm whoami`
- Verify package.json is valid
- Ensure dist/ folder exists (run `npm run build`)