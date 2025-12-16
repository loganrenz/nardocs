# NPM Publishing Setup Guide

This guide will help you set up npm publishing with provenance for secure, automated releases.

## Step 1: Login to npm

### Option A: Using Terminal (Recommended)

```bash
# Login to npm
npm login

# You'll be prompted for:
# - Username
# - Password  
# - Email (this IS public)
# - One-time password (if 2FA is enabled)
```

### Option B: Using Browser

Go to [npmjs.com](https://www.npmjs.com/) and sign up or login.

## Step 2: Verify Your Account

```bash
# Check if you're logged in
npm whoami

# Should display your npm username
```

## Step 3: Check Package Name Availability

```bash
# Check if 'mcp-project-docs' is available
npm view mcp-project-docs

# If it shows "404", the name is available ✅
# If it shows package info, the name is taken ❌
```

If the name is taken, you'll need to:
1. Choose a different name, OR
2. Use a scoped package: `@yourusername/mcp-project-docs`

To use a scoped package, update `package.json`:
```json
{
  "name": "@yourusername/mcp-project-docs",
  "publishConfig": {
    "access": "public"
  }
}
```

## Step 4: Create Automation Token

### For GitHub Actions (Granular Access Token - Recommended)

1. Go to [npmjs.com](https://www.npmjs.com/) and login
2. Click your profile picture → **Access Tokens**
3. Click **Generate New Token** → **Granular Access Token**
4. Configure the token:
   - **Token name**: `github-actions-nardocs` (or similar)
   - **Expiration**: Choose duration (1 year recommended for automation)
   - **Packages and scopes**:
     - Select **Read and write**
     - Choose **Only select packages and scopes**
     - Add your package: `mcp-project-docs`
   - **IP allowlist**: Leave empty (GitHub Actions IPs vary)
   - **Organizations**: None needed for personal packages
5. Click **Generate Token**
6. **Copy the token immediately** (you won't see it again!)

### Alternative: Classic Token (Simpler but less secure)

1. Go to [npmjs.com](https://www.npmjs.com/) → Profile → **Access Tokens**
2. Click **Generate New Token** → **Classic Token**
3. Select **Automation** type
4. Copy the token

## Step 5: Add Token to GitHub Secrets

1. Go to your GitHub repository: https://github.com/loganrenz/nardocs
2. Click **Settings** (top menu)
3. In left sidebar: **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Name: `NPM_TOKEN`
6. Value: Paste your token from Step 4
7. Click **Add secret**

## Step 6: Verify Setup

### Test Locally (Optional)

You can test publishing manually first:

```bash
# Build the package
npm run build

# Do a dry run (won't actually publish)
npm publish --dry-run

# If successful, you'll see what would be published
```

### Trigger First Release

Just push a commit with a conventional commit message:

```bash
git commit -m "feat: initial npm release"
git push
```

The GitHub Actions workflow will:
1. ✅ Run all tests
2. ✅ Build the package
3. ✅ Determine version (likely 2.0.0)
4. ✅ Publish to npm with provenance
5. ✅ Create GitHub release

## Step 7: Verify Publication

After the workflow completes:

1. **Check npm**: https://www.npmjs.com/package/mcp-project-docs
2. **Verify provenance badge**: Should show a verified badge
3. **Check GitHub releases**: https://github.com/loganrenz/nardocs/releases

## Provenance Benefits

Your package is now published with **provenance attestation**, which:

✅ **Links package to source code** - Users can verify the source  
✅ **Verifies build environment** - Proves it was built in GitHub Actions  
✅ **Increases trust** - Shows verified badge on npm  
✅ **Prevents tampering** - Cryptographically signed  
✅ **Supply chain security** - Part of npm's security initiative  

## Troubleshooting

### "You must be logged in to publish packages"

**Solution**: Make sure `NPM_TOKEN` secret is set in GitHub repo settings.

### "You do not have permission to publish"

**Solution**: 
- Verify the token has write permissions
- Check if you own the package name
- For scoped packages, ensure `"access": "public"` in publishConfig

### "Package name already exists"

**Solution**: 
- Choose a different name, OR
- Use scoped package: `@yourusername/package-name`

### "Cannot verify provenance"

**Solution**: 
- Ensure `id-token: write` permission is in workflow
- Check `NPM_CONFIG_PROVENANCE: true` is set
- Verify running in GitHub Actions (not local)

### "402 Payment Required"

**Solution**: This happens if trying to publish a scoped package without npm Pro. Either:
- Use an unscoped name: `mcp-project-docs`
- Add `"access": "public"` to publishConfig in package.json

## Current Configuration

Your workflow is configured with:

- ✅ **Provenance enabled** (`NPM_CONFIG_PROVENANCE: true`)
- ✅ **ID token permission** (`id-token: write`)
- ✅ **Public access** (in package.json publishConfig)
- ✅ **Semantic versioning** (automated via semantic-release)
- ✅ **Automated changelog** (CHANGELOG.md)

## Security Best Practices

1. ✅ **Use Granular Access Tokens** - Limit scope to specific packages
2. ✅ **Enable 2FA** - Protect your npm account
3. ✅ **Rotate tokens** - Refresh tokens periodically
4. ✅ **Use provenance** - Already configured!
5. ✅ **Limit token permissions** - Only what's needed
6. ⚠️ **Never commit tokens** - Always use GitHub Secrets

## Next Steps

1. ✅ Login to npm (`npm login`)
2. ✅ Verify package name availability
3. ✅ Generate automation token (Granular Access Token recommended)
4. ✅ Add `NPM_TOKEN` to GitHub Secrets
5. ✅ Push a commit to trigger release
6. ✅ Verify package on npm
7. 🎉 Celebrate your published package!

---

**Questions?** See [npm documentation](https://docs.npmjs.com/creating-and-publishing-scoped-public-packages) or open an issue.

