# Quick Start Guide

## 🚀 Two Simple Steps to Complete Setup

### Step 1: Add DOPPLER_TOKEN to GitHub

The token is already in your clipboard!

1. Go to: https://github.com/loganrenz/nardocs/settings/secrets/actions/new
2. Name: `DOPPLER_TOKEN`
3. Value: Paste from clipboard (Cmd+V)
4. Click **Add secret**

### Step 2: Add NPM_TOKEN to Doppler

1. Go to: https://dashboard.doppler.com/workplace/74c8ebb899783189e505/projects/nardocs/configs/prd_ci
2. Click **Add Secret**
3. Name: `NPM_TOKEN`
4. Value: Your npm automation token (get from https://www.npmjs.com/settings/narduk/tokens)
5. Click **Save**

## 🎉 That's it!

Once both secrets are added, your next commit will trigger an automated release to npm!

## 📋 Summary of What We Built

### ✅ CI/CD Pipeline
- **Semantic versioning** - Automated version bumps based on commits
- **Automated testing** - Runs on Node 20 & 22
- **Auto-generated CHANGELOG** - Never manually update again
- **npm publishing** - With provenance attestation
- **GitHub releases** - Automatically created

### ✅ Secrets Management
- **Doppler integration** - Centralized, secure secrets
- **No more .env files** - Everything in Doppler
- **Team collaboration** - Easy secret sharing
- **Audit logs** - Track all access
- **Version history** - Rollback if needed

### ✅ Professional Polish
- **Badges** - npm version, CI status, license
- **Templates** - Bug reports, feature requests, PRs
- **Documentation** - CONTRIBUTING.md, setup guides
- **Code quality** - Linting, formatting, type checking

## 🔄 Development Workflow

```bash
# Clone and setup
git clone https://github.com/loganrenz/nardocs.git
cd nardocs
npm install

# Setup Doppler (one-time)
doppler login
doppler setup --project nardocs --config dev

# Development
doppler run -- npm run dev

# Testing
doppler run -- npm test

# Make changes and commit
git add .
git commit -m "feat: add awesome feature"
git push

# 🎉 Automatic release triggers!
```

## 📦 Release Process

Just push conventional commits:

```bash
# Patch release (1.0.0 → 1.0.1)
git commit -m "fix: resolve bug"

# Minor release (1.0.0 → 1.1.0)
git commit -m "feat: add new feature"

# Major release (1.0.0 → 2.0.0)
git commit -m "feat: breaking change

BREAKING CHANGE: API has changed"
```

## 📚 Documentation

- [CONTRIBUTING.md](../CONTRIBUTING.md) - How to contribute
- [DOPPLER_SETUP.md](DOPPLER_SETUP.md) - Complete Doppler guide
- [NPM_SETUP.md](NPM_SETUP.md) - npm publishing guide
- [SETUP.md](SETUP.md) - Production setup details

## 🆘 Need Help?

- **Doppler Dashboard**: https://dashboard.doppler.com/workplace/74c8ebb899783189e505/projects/nardocs
- **GitHub Actions**: https://github.com/loganrenz/nardocs/actions
- **npm Package**: https://www.npmjs.com/package/mcp-project-docs
- **Issues**: https://github.com/loganrenz/nardocs/issues

---

**Ready to ship?** Just add those two secrets and push your next commit! 🚀

