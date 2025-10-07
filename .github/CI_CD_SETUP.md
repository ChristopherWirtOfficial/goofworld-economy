# CI/CD Setup Documentation

This document explains the CI/CD setup for Goof World.

## GitHub Actions

### Workflow: `.github/workflows/ci.yml`

**Triggers:**
- Every pull request to any branch
- Every push to `main` branch

**Jobs:**

1. **Install Dependencies**
   - Uses Yarn with lockfile for reproducible builds
   - Caches `node_modules` for faster runs

2. **Lint Check**
   - Runs ESLint via `yarn lint`
   - Set to `continue-on-error: true` (won't block, but shows warnings)

3. **Build Next.js Frontend**
   - Full production build via `yarn build`
   - Tests that frontend compiles successfully

4. **TypeScript Type Checking**
   - Frontend: `yarn tsc --noEmit`
   - Backend: `yarn tsc -p tsconfig.server.json --noEmit`
   - Ensures no type errors

**Status:**
- ✅ Pass = PR can be merged
- ❌ Fail = Changes need fixing

### Local Verification

Before pushing, contributors can run:

```bash
yarn verify-ci
```

This runs all the same checks locally (see `scripts/verify-ci.sh`).

## Vercel Deployment (Frontend)

### Setup Steps:

1. **Connect Repository**
   - Sign in to [vercel.com](https://vercel.com) with GitHub
   - Import `goof-world` repository
   - Vercel auto-detects Next.js configuration

2. **Configure Environment Variables**
   ```
   NEXT_PUBLIC_SOCKET_URL=<backend-url>
   ```
   Set for all environments: Production, Preview, Development

3. **Automatic Deployments**
   - **Production**: Push to `main` → Auto-deploy to production URL
   - **Preview**: Open PR → Auto-deploy to unique preview URL
   - **Comments**: Vercel bot comments on PRs with preview link

### Configuration Files:

- `vercel.json` - Vercel-specific settings
- `next.config.js` - Next.js configuration

## Railway Deployment (Backend)

### Setup Steps:

1. **Connect Repository**
   - Sign in to [railway.app](https://railway.app) with GitHub
   - Create new project from `goof-world` repository
   - Railway detects `railway.json` configuration

2. **Configure Environment Variables**
   ```
   PORT=3001
   NODE_ENV=production
   ```

3. **Automatic Deployments**
   - Push to `main` → Auto-redeploy backend
   - Health checks on `/api/health`

### Configuration Files:

- `railway.json` - Railway-specific settings
- Health check endpoint: `/api/health`

## Environment Variables

### Frontend (Vercel)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_SOCKET_URL` | Yes | Backend WebSocket URL | `https://api.railway.app` |

### Backend (Railway)

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `PORT` | No | Server port | `3001` |
| `NODE_ENV` | No | Environment mode | `development` |

## Pull Request Workflow

1. **Developer opens PR**
   - GitHub Actions CI runs automatically
   - Vercel creates preview deployment
   - Railway may create preview (if configured)

2. **Automated checks run**
   - Lint
   - Type checking
   - Build verification

3. **Status checks appear on PR**
   - ✅ All checks passed → Safe to merge
   - ❌ Some checks failed → Review errors

4. **Review and merge**
   - Team reviews code
   - Merge to `main` when approved and checks pass

5. **Automatic deployment**
   - Vercel deploys to production
   - Railway redeploys backend

## Rollback Procedures

### Frontend (Vercel)
1. Go to Vercel dashboard → Deployments
2. Find last working deployment
3. Click "..." → "Promote to Production"

### Backend (Railway)
1. Go to Railway dashboard → Deployments
2. Find last working deployment
3. Click "Redeploy"

### Via Git
```bash
git revert <bad-commit-hash>
git push origin main
```

Both services auto-deploy the reverted code.

## Monitoring

### CI Status
- GitHub Actions tab shows all workflow runs
- Failed runs can be debugged via logs
- Can re-run failed checks

### Deployments
- **Vercel**: Dashboard shows build logs, performance metrics
- **Railway**: Dashboard shows server logs, resource usage

### Health Checks
- Backend: `GET /api/health` returns `{"status":"ok","timestamp":...}`
- Frontend: Load homepage, check console for WebSocket connection

## Troubleshooting

### CI Fails but works locally
- Check Node version (CI uses Node 20)
- Run `yarn verify-ci` to replicate CI checks
- Check for uncommitted files affecting build

### Vercel deployment fails
- Check build logs in Vercel dashboard
- Verify environment variables are set
- Ensure `yarn build` works locally

### Railway deployment fails
- Check server logs in Railway dashboard
- Verify `yarn start:server` works locally
- Check health endpoint is responding

### Preview deployments not working
- Ensure environment variables are set for "Preview" in Vercel
- Check Railway has preview deployments enabled
- Verify CORS settings allow preview URLs

## Adding New Checks

To add new CI checks, edit `.github/workflows/ci.yml`:

```yaml
- name: Your new check
  run: your-command-here
```

## Security Notes

- Never commit `.env` files
- Use Vercel/Railway dashboards for secrets
- Environment variables prefixed with `NEXT_PUBLIC_` are exposed to browser
- Backend environment variables remain private

## Performance

**CI Runtime:**
- Typical run: 2-3 minutes
- With cache: 1-2 minutes

**Deploy Times:**
- Vercel (Frontend): ~30-60 seconds
- Railway (Backend): ~1-2 minutes

## Cost

- **GitHub Actions**: Free for public repos
- **Vercel**: Free tier includes unlimited preview deployments
- **Railway**: Free tier includes $5/month credit (usually sufficient for dev)
