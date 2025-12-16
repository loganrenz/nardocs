# Production Setup Guide

This document explains the production setup for the MCP Project Docs package.

## 🎯 What We've Set Up

### Automated Release Pipeline

The project now uses **semantic-release** for fully automated versioning, changelog generation, and publishing to npm.

#### How It Works

1. **Push to `main`** → Triggers release workflow
2. **Analyze commits** → Determines version bump based on conventional commits
3. **Generate changelog** → Creates CHANGELOG.md entries automatically
4. **Publish to npm** → Publishes package with provenance
5. **Create GitHub release** → Creates tagged release with notes
6. **Update repository** → Commits changelog and version bump

### Commit Message Format

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types that trigger releases:**

- `feat:` → Minor version bump (1.0.0 → 1.1.0)
- `fix:` → Patch version bump (1.0.0 → 1.0.1)
- `perf:` → Patch version bump
- `BREAKING CHANGE:` → Major version bump (1.0.0 → 2.0.0)

**Other types** (no release):
- `docs:` → Documentation only
- `style:` → Code style/formatting
- `refactor:` → Code refactoring
- `test:` → Adding/updating tests
- `chore:` → Maintenance tasks
- `ci:` → CI/CD changes

### Example Commits

```bash
# Triggers v1.1.0 release
git commit -m "feat(nuxt): add support for Nuxt UI v4"

# Triggers v1.0.1 release
git commit -m "fix(parser): handle malformed HTML gracefully"

# Triggers v2.0.0 release
git commit -m "feat: new API for plugins

BREAKING CHANGE: Plugin interface has changed"

# No release
git commit -m "docs: update README installation instructions"
```

## 📋 Required Secrets

For the release workflow to work, you need to set up these secrets in GitHub:

### NPM_TOKEN

Required for publishing to npm.

1. Go to [npmjs.com](https://www.npmjs.com/) and sign in
2. Click your profile → **Access Tokens** → **Generate New Token**
3. Select **Automation** token type
4. Copy the token
5. Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions**
6. Click **New repository secret**
7. Name: `NPM_TOKEN`
8. Value: Paste your npm token
9. Click **Add secret**

### GITHUB_TOKEN (Automatic)

This is automatically provided by GitHub Actions. No setup required.

## 🚀 Release Workflow

### Automated Releases (Recommended)

Just push commits to `main` with conventional commit messages:

```bash
git add .
git commit -m "feat: add new feature"
git push origin main
```

The release workflow will:
1. Run CI (lint, typecheck, test, build)
2. Determine version based on commits since last release
3. Update CHANGELOG.md
4. Publish to npm
5. Create GitHub release
6. Commit version bump back to main

### Manual Release (If Needed)

If you need to trigger a release manually:

```bash
# Make sure you're on main and up to date
git checkout main
git pull

# Run semantic-release locally (requires NPM_TOKEN in environment)
npm run semantic-release
```

## 📊 Workflows

### CI Workflow (`ci.yml`)

Runs on every push and PR:
- ✅ Lint check
- ✅ Type check
- ✅ Tests with coverage (Node 20, 22)
- ✅ Build verification

### Release Workflow (`release.yml`)

Runs on push to `main`:
- Runs all CI checks
- Analyzes commits
- Bumps version
- Updates CHANGELOG.md
- Publishes to npm
- Creates GitHub release
- Commits changes back

## 📦 Package Configuration

### package.json

```json
{
  "publishConfig": {
    "access": "public",
    "registry": "https://registry.npmjs.org/"
  },
  "engines": {
    "node": ">=20.0.0"
  }
}
```

### .releaserc.json

Configures semantic-release behavior:
- Branch: `main`
- Plugins: commit-analyzer, release-notes-generator, changelog, npm, github, git
- Changelog file: `CHANGELOG.md`
- Commit message: `chore(release): ${nextRelease.version} [skip ci]`

## 🎨 Professional Touches

### Badges in README

```markdown
[![npm version](https://img.shields.io/npm/v/mcp-project-docs.svg)](...)
[![CI](https://github.com/.../actions/workflows/ci.yml/badge.svg)](...)
[![Release](https://github.com/.../actions/workflows/release.yml/badge.svg)](...)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](...)
```

### Community Files

- ✅ `CONTRIBUTING.md` - Contribution guidelines
- ✅ `CHANGELOG.md` - Automatically generated
- ✅ `.github/PULL_REQUEST_TEMPLATE.md` - PR template
- ✅ `.github/ISSUE_TEMPLATE/bug_report.md` - Bug report template
- ✅ `.github/ISSUE_TEMPLATE/feature_request.md` - Feature request template

## 🔒 Security

### Provenance

The package is published with provenance attestation, which:
- Links the package to the source repository
- Verifies the build process
- Increases trust and security

### Permissions

Workflows use minimal required permissions:
- `contents: write` - For creating releases and committing changelog
- `issues: write` - For commenting on issues
- `pull-requests: write` - For commenting on PRs
- `packages: write` - For GitHub Packages (if used)
- `id-token: write` - For provenance attestation

## 📈 Monitoring Releases

### Check Release Status

1. Go to **Actions** tab in GitHub
2. Look for "Release" workflow runs
3. Check if it succeeded

### View Published Versions

- npm: https://www.npmjs.com/package/mcp-project-docs
- GitHub: https://github.com/loganrenz/nardocs/releases

### Troubleshooting

**Release didn't trigger:**
- Check commit message follows conventional commits format
- Ensure NPM_TOKEN secret is set correctly
- Look at workflow run logs in Actions tab

**Build failed:**
- Check lint/test errors in CI
- Fix issues and push again
- Release will retry on next push

**npm publish failed:**
- Verify NPM_TOKEN is valid
- Check if version already exists on npm
- Ensure package name is available

## 🎓 Best Practices

1. **Always use conventional commits** for clarity and automation
2. **Keep commits focused** - one logical change per commit
3. **Write good commit bodies** - explain why, not what
4. **Test locally first** - `npm run lint && npm run test && npm run build`
5. **Review CHANGELOG** after release to ensure it makes sense
6. **Don't force push to main** - breaks release history

## 🔄 Version Strategy

- **Patch (x.x.X)**: Bug fixes, small improvements
- **Minor (x.X.0)**: New features, backward compatible
- **Major (X.0.0)**: Breaking changes

Breaking changes should be rare and well-documented.

## 📚 Resources

- [Semantic Release](https://semantic-release.gitbook.io/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [Semantic Versioning](https://semver.org/)

---

**Questions?** Open an issue or see CONTRIBUTING.md

