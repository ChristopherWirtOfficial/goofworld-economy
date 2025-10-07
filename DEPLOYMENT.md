# Deployment Guide

This guide covers deploying Goof World to production with automatic CI/CD.

## Architecture Overview

Goof World consists of two parts:
1. **Frontend**: Next.js app (static + API routes)
2. **Backend**: Node.js WebSocket server (Express + Socket.io)

We recommend:
- **Frontend** → Vercel (seamless Next.js integration)
- **Backend** → Railway (easy WebSocket support)

## Step 1: Deploy Backend to Railway

### Initial Setup

1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your `goof-world` repository
4. Railway will automatically detect the `railway.json` configuration

### Configure Environment Variables

In Railway project settings, add:

```
PORT=3001
NODE_ENV=production
```

### Get Backend URL

1. Once deployed, go to Settings → Networking
2. Click "Generate Domain"
3. Copy the URL (e.g., `https://goof-world-production.up.railway.app`)
4. Save this for the next step

### Test Backend

Visit `https://your-backend-url.railway.app/api/health` - you should see:
```json
{"status":"ok","timestamp":1234567890}
```

## Step 2: Deploy Frontend to Vercel

### Initial Setup

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "Add New..." → "Project"
3. Import your `goof-world` repository
4. Vercel will auto-detect Next.js settings

### Configure Environment Variables

In Vercel project settings → Environment Variables, add:

```
NEXT_PUBLIC_SOCKET_URL=https://your-backend-url.railway.app
```

Make sure to add this for:
- ✅ Production
- ✅ Preview
- ✅ Development

### Deploy

Click "Deploy" - Vercel will build and deploy your frontend.

## Step 3: Enable GitHub Integration

### Vercel

Vercel automatically sets up GitHub integration:
- ✅ Push to `main` → Production deployment
- ✅ Open PR → Preview deployment with unique URL
- ✅ Comments on PR with preview link

### Railway

Railway automatically redeploys backend when you push to `main`:
- ✅ Push to `main` → Backend redeployment
- Monitor builds in Railway dashboard

### GitHub Actions

The CI workflow (`.github/workflows/ci.yml`) runs automatically:
- ✅ On every PR: Lint, type check, build verification
- ✅ On push to `main`: Same checks
- Status checks appear in PR before merging

## Testing the Deployment

1. **Visit your Vercel URL**: `https://goof-world.vercel.app`
2. **Open browser console**: Check for WebSocket connection
3. **Look for**: `Connected to server` log
4. **Verify**: Time remaining and cooldown status display

## Troubleshooting

### Frontend can't connect to backend

**Issue**: Browser console shows WebSocket connection error

**Fix**: Check environment variable in Vercel
```bash
# Should be set to your Railway URL
NEXT_PUBLIC_SOCKET_URL=https://your-backend.railway.app
```

Redeploy after changing environment variables.

### CORS errors

**Issue**: Browser console shows CORS policy error

**Fix**: The backend is configured to accept `.vercel.app` and `.railway.app` domains. If using a custom domain, update `server/index.ts`:

```typescript
origin: process.env.NODE_ENV === 'production' 
  ? [/\.vercel\.app$/, /\.railway\.app$/, 'https://your-custom-domain.com'] 
  : ['http://localhost:3000'],
```

### Backend health check failing

**Issue**: Railway shows "unhealthy" status

**Fix**: Check Railway logs for errors. Common issues:
- Missing environment variables
- Port binding issue (make sure `PORT` is set)
- Build failures (check `yarn start:server` works locally)

### PR preview deployments not working

**Issue**: Vercel preview exists but shows blank/error page

**Fix**: Preview deployments need the same environment variables. Go to Vercel → Settings → Environment Variables and ensure `NEXT_PUBLIC_SOCKET_URL` is checked for "Preview" environments.

## Custom Domains

### Vercel (Frontend)

1. Go to Vercel project → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed by Vercel
4. SSL is automatically provisioned

### Railway (Backend)

1. Go to Railway project → Settings → Networking
2. Click "Custom Domain"
3. Add your domain (e.g., `api.goofworld.com`)
4. Update DNS records as instructed
5. Update `NEXT_PUBLIC_SOCKET_URL` in Vercel to use new domain

## Monitoring

### Railway Dashboard
- View backend logs in real-time
- Monitor memory/CPU usage
- Check deployment history

### Vercel Dashboard
- View build logs
- Monitor page performance
- Check analytics (if enabled)

### GitHub Actions
- View CI run history in "Actions" tab
- Failed checks block PR merging
- Logs available for debugging

## Environment Variables Reference

### Frontend (Vercel)
| Variable | Example | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_SOCKET_URL` | `https://api.railway.app` | Backend WebSocket server URL |

### Backend (Railway)
| Variable | Example | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Port for backend server |
| `NODE_ENV` | `production` | Environment mode |

## Rollback Procedure

### Rollback Frontend
1. Go to Vercel → Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"

### Rollback Backend
1. Go to Railway → Deployments
2. Find previous working deployment
3. Click "Redeploy"

Or use Git:
```bash
git revert <commit-hash>
git push origin main
```

Both services will auto-deploy the reverted code.
