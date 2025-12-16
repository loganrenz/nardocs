# Doppler Secrets Management Setup

This project uses [Doppler](https://doppler.com) for secure secrets management across all environments.

## 🎯 Why Doppler?

✅ **Centralized secrets** - All secrets in one place  
✅ **Environment management** - dev, staging, production  
✅ **GitHub integration** - Seamless CI/CD  
✅ **Audit logs** - Track all secret access  
✅ **Team collaboration** - Share secrets securely  
✅ **Version history** - Rollback secrets if needed  
✅ **No .env files** - Never commit secrets  

## 📋 Project Structure

### Environments

- **dev** - Local development
- **stg** - Staging/testing
- **prd** - Production

### Configs

- **dev** - Default local config
- **dev_personal** - Personal overrides
- **prd_ci** - GitHub Actions CI/CD
- **prd** - Production deployment

## 🚀 Setup for Development

### 1. Install Doppler CLI

**macOS:**
```bash
brew install dopplerhq/cli/doppler
```

**Linux:**
```bash
curl -Ls https://cli.doppler.com/install.sh | sh
```

**Windows:**
```powershell
scoop install doppler
```

### 2. Login to Doppler

```bash
doppler login
```

This will open your browser for authentication.

### 3. Navigate to Project

```bash
cd /path/to/nardocs-1
```

### 4. Verify Configuration

```bash
doppler setup
```

Should show:
- Project: `nardocs`
- Config: `dev`

If not configured, run:
```bash
doppler setup --project nardocs --config dev
```

### 5. View Secrets

```bash
# List all secrets
doppler secrets

# Get specific secret
doppler secrets get NPM_TOKEN
```

### 6. Run Commands with Secrets

```bash
# Run any command with secrets injected
doppler run -- npm run build

# Run development server
doppler run -- npm run dev

# Run tests
doppler run -- npm test
```

## 🔐 Adding Secrets

### Via CLI

```bash
# Set a secret
doppler secrets set NPM_TOKEN="npm_xxxxx..."

# Set multiple secrets
doppler secrets set KEY1=value1 KEY2=value2

# Set from file
doppler secrets upload secrets.json
```

### Via Dashboard

1. Go to [Doppler Dashboard](https://dashboard.doppler.com)
2. Select project: **nardocs**
3. Select config: **prd_ci** (for CI/CD) or **dev** (for local)
4. Click **Add Secret**
5. Enter name and value
6. Click **Save**

## 🤖 GitHub Actions Setup

### Current Configuration

The release workflow uses Doppler to inject secrets:

```yaml
- name: Install Doppler CLI
  uses: dopplerhq/cli-action@v3

- name: Release
  env:
    DOPPLER_TOKEN: ${{ secrets.DOPPLER_TOKEN }}
  run: doppler run -- npx semantic-release
```

### Required Secrets in Doppler (prd_ci config)

Add these secrets to the `prd_ci` config in Doppler:

1. **NPM_TOKEN** - npm automation token for publishing
   - Get from: https://www.npmjs.com/settings/narduk/tokens
   - Type: Automation or Granular Access Token
   - Permissions: Read and write to `mcp-project-docs`

### Service Token Setup

A service token needs to be created for GitHub Actions:

**Create the token:**

```bash
doppler configs tokens create github-actions-ci --project nardocs --config prd_ci --plain
```

This will output a token like: `dp.st.prd_ci.xxxxxxxxxxxxx`

**Add to GitHub Secrets:**

1. Copy the token from the command above
2. Go to: https://github.com/loganrenz/nardocs/settings/secrets/actions
3. Click **New repository secret**
4. Name: `DOPPLER_TOKEN`
5. Value: Paste the token
6. Click **Add secret**

## 📝 Managing Secrets

### Add NPM_TOKEN to Doppler

```bash
# For CI/CD (production)
doppler secrets set NPM_TOKEN="npm_xxxxx..." --project nardocs --config prd_ci

# For local dev (if needed)
doppler secrets set NPM_TOKEN="npm_xxxxx..." --project nardocs --config dev
```

### Other Useful Secrets

You might want to add:

- **GITHUB_TOKEN** - For GitHub API access (auto-provided in Actions)
- **SLACK_WEBHOOK** - For release notifications
- **SENTRY_DSN** - For error tracking
- **DATABASE_URL** - If you add a backend

## 🔄 Environment-Specific Configs

### Switch Between Environments

```bash
# Use staging config
doppler setup --config stg

# Use production config (careful!)
doppler setup --config prd

# Back to development
doppler setup --config dev
```

### Personal Overrides

Create personal config for your own overrides:

```bash
# Clone dev config
doppler configs create dev_yourname --project nardocs --environment dev

# Switch to it
doppler setup --config dev_yourname

# Set personal overrides
doppler secrets set MY_CUSTOM_VAR=value
```

## 🛡️ Security Best Practices

✅ **Never commit secrets** - Use Doppler instead of .env files  
✅ **Use service tokens** - Not personal tokens for CI/CD  
✅ **Rotate tokens regularly** - Especially if compromised  
✅ **Limit token scope** - Only grant necessary permissions  
✅ **Enable audit logs** - Track who accessed what  
✅ **Use environment configs** - Separate dev/staging/prod  

## 📊 Monitoring & Auditing

### View Access Logs

Go to [Doppler Dashboard](https://dashboard.doppler.com) → Project → Activity Log

### Rotate Service Token

If token is compromised:

```bash
# Revoke old token
doppler configs tokens revoke github-actions-ci --project nardocs --config prd_ci

# Create new token
doppler configs tokens create github-actions-ci-new --project nardocs --config prd_ci --plain

# Update GitHub secret with new token
```

## 🔧 Troubleshooting

### "Project not found"

**Solution**: Run `doppler setup --project nardocs --config dev`

### "Unauthorized"

**Solution**: 
- Ensure you're logged in: `doppler login`
- Check you have access to the project
- Verify token is valid: `doppler me`

### "Secret not found in Doppler"

**Solution**: Add the secret via CLI or dashboard:
```bash
doppler secrets set SECRET_NAME=value --project nardocs --config prd_ci
```

### CI/CD fails with "Authentication failed"

**Solution**:
- Verify `DOPPLER_TOKEN` secret exists in GitHub
- Check token has access to `prd_ci` config
- Regenerate token if expired

## 📚 Resources

- [Doppler Dashboard](https://dashboard.doppler.com)
- [Doppler CLI Docs](https://docs.doppler.com/docs/cli)
- [GitHub Integration](https://docs.doppler.com/docs/github-actions)
- [Best Practices](https://docs.doppler.com/docs/best-practices)

## 🎓 Quick Reference

```bash
# View secrets
doppler secrets

# Set secret
doppler secrets set KEY=value

# Run with secrets
doppler run -- npm run build

# Switch environment
doppler setup --config prd_ci

# View current config
doppler configure get

# Download secrets (careful!)
doppler secrets download --no-file --format env

# Open dashboard
open https://dashboard.doppler.com/workplace/74c8ebb899783189e505/projects/nardocs
```

---

**Questions?** Check the [Doppler documentation](https://docs.doppler.com) or open an issue.

