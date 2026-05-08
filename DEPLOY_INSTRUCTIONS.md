# Deployment Instructions for Tldraw License Key

## Quick Start

### 1. Ensure `.env` has the Tldraw license key:
```bash
# Check if set
grep VITE_TLDRAW_LICENSE_KEY .env
```

### 2. Deploy to Google Cloud Run:
```bash
npm run deploy:gcp
```

The script will automatically:
- Load your `.env` file
- Pass the license key as a Docker build argument
- Embed it in the frontend bundle during build
- Deploy to Cloud Run with all environment variables

---

## How It Works (Build-Time vs Runtime)

### ❌ WRONG: Environment variable only at runtime
```dockerfile
ENV VITE_TLDRAW_LICENSE_KEY=$LICENSE_KEY  # This doesn't work for frontend
```
**Why it fails:** Vite needs to read `VITE_*` variables **during the npm build step**, before the Node server starts. Environment variables set in Docker only affect runtime (the Node.js server).

### ✅ CORRECT: Build argument + environment variable
```dockerfile
ARG VITE_TLDRAW_LICENSE_KEY
ENV VITE_TLDRAW_LICENSE_KEY=$VITE_TLDRAW_LICENSE_KEY
RUN npm run build  # Vite reads ENV during this step
```

**Why it works:** 
1. `ARG` accepts the value from `docker build --build-arg`
2. `ENV` makes it available during `npm run build`
3. Vite embeds the value in the JavaScript bundle at build time
4. Frontend code can now access `import.meta.env.VITE_TLDRAW_LICENSE_KEY`

---

## File Changes Made

### Updated Files:
- **deploy_gcp.sh** — Now loads `.env` early and passes `--build-arg` to `gcloud builds submit`
- **Dockerfile** — Already accepts `ARG VITE_TLDRAW_LICENSE_KEY` in Stage 1
- **docker-compose.yml** — Already passes the arg to Docker during local builds
- **cloudbuild.yaml** — Cloud Build configuration with substitution support
- **TLDRAW_SETUP.md** — Comprehensive setup and troubleshooting guide

### Environment Files:
- **.env** — Contains `VITE_TLDRAW_LICENSE_KEY` (local dev)
- **.env.cloud-run** — Contains `VITE_TLDRAW_LICENSE_KEY` (Cloud Run runtime)

---

## Deployment Methods

### Method 1: Using deploy_gcp.sh (Recommended)
```bash
npm run deploy:gcp
```
Simplest method. Requires `.env` file in project root.

### Method 2: Using Cloud Build configuration
```bash
gcloud builds submit --config=cloudbuild.yaml \
  --substitutions=_VITE_TLDRAW_LICENSE_KEY="$(grep VITE_TLDRAW_LICENSE_KEY .env | cut -d= -f2)"
```
Better for CI/CD pipelines and automated deployments.

### Method 3: Manual gcloud command
```bash
# Build and push to GCR
gcloud builds submit --tag gcr.io/YOUR_PROJECT/ai-interview-platform \
  --build-arg VITE_TLDRAW_LICENSE_KEY="$(grep VITE_TLDRAW_LICENSE_KEY .env | cut -d= -f2)"

# Deploy to Cloud Run
gcloud run deploy ai-interview-platform \
  --image gcr.io/YOUR_PROJECT/ai-interview-platform \
  --region us-central1 \
  --allow-unauthenticated \
  --env-vars-file .env.cloud-run
```

---

## Troubleshooting

### Error: "Whiteboard is unavailable in production without a Tldraw license key"

**Cause:** License key wasn't embedded in the frontend bundle.

**Check:**
1. Is `.env` present? `ls -la .env`
2. Does `.env` have the license key? `grep VITE_TLDRAW_LICENSE_KEY .env`
3. Was the image rebuilt after adding the key? (You need to re-run `npm run deploy:gcp`)
4. Check the build log: `gcloud builds log [BUILD_ID]`

**Fix:**
1. Ensure `.env` has `VITE_TLDRAW_LICENSE_KEY=tldraw-2026-08-15/...`
2. Re-run deployment: `npm run deploy:gcp`

### Error: ".env file not found"
Run `npm run deploy:gcp` from the project root directory where `.env` exists.

### License key expires August 15, 2026
Set a reminder to renew before this date.

---

## License Key Security

### Current Setup (Simple):
- License key stored in `.env` (local, git-ignored)
- Embedded in Docker image during build
- Visible in deployed frontend code (not a security risk — it's a public license key)

### Optional: Google Cloud Secret Manager
For additional security, store the key in Secret Manager and reference it:

```bash
# Create secret
gcloud secrets create tldraw-license-key --data-file=- <<< "tldraw-2026-08-15/..."

# Grant Cloud Run access
gcloud secrets add-iam-policy-binding tldraw-license-key \
  --member=serviceAccount:YOUR_CLOUD_RUN_SA@appspot.gserviceaccount.com \
  --role=roles/secretmanager.secretAccessor

# Reference in cloudbuild.yaml or deploy script
gcloud secrets versions access latest --secret="tldraw-license-key"
```

---

## Verify Deployment

After deploying, test the whiteboard:

1. Visit your Cloud Run URL: `gcloud run services describe ai-interview-platform --format='value(status.url)'`
2. Navigate to a DSA problem
3. Click the "Whiteboard" tab
4. Should see the tldraw canvas, not an error message

If you still see the error, the build didn't include the license key. Rebuild and redeploy.
