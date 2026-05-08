# Tldraw License Key Setup

## Local Development

### Option 1: Direct npm Development (Recommended for Active Development)

The Tldraw license key is already configured in `.env` file:

```bash
# In the client directory
cd client
npm run dev      # Development with hot reload on http://localhost:5173

# In another terminal, run the server
npm run dev      # Runs with nodemon on http://localhost:3005
```

### Option 2: Docker Compose Local Deployment

For a containerized local environment that mirrors production:

```bash
./deploy.sh      # or npm run deploy:local
```

The script will:
- Load the license key from `.env`
- Build the Docker image with the license key embedded
- Start the container on http://localhost:3005

**What happens internally:**
1. Docker reads `VITE_TLDRAW_LICENSE_KEY` from `.env`
2. Passes it as a build argument to the Dockerfile
3. Frontend build includes the license key in the bundle
4. Container starts with the app ready to use

### Building for Production (Local)

```bash
cd client
VITE_TLDRAW_LICENSE_KEY=tldraw-2026-08-15/WyJtY3ptSGdNXyIsWyIqIl0sMTYsIjIwMjYtMDgtMTUiXQ.rx1FVvQajYQUQfU8Dk/Ugef6kB9vBVI2z/HyKOwkDb/ZESWJOSvaUiGTl+l9SU/HpIGlv5Q/Uv8+2eeczy1L+w npm run build
```

## Production Deployment (Google Cloud)

### Recommended: Using deploy_gcp.sh Script

The easiest way to deploy to Google Cloud is using the existing `deploy_gcp.sh` script:

```bash
npm run deploy:gcp
```

**IMPORTANT:** The script requires `.env` to be present with `VITE_TLDRAW_LICENSE_KEY` defined.

This script will:
1. Load environment variables from `.env` (including `VITE_TLDRAW_LICENSE_KEY`)
2. Enable necessary Google Cloud APIs
3. Build Docker image with the license key passed as a **build argument** (this embeds it in the frontend bundle)
4. Push the image to Google Container Registry
5. Deploy to Cloud Run with environment variables from `.env.cloud-run`

**Why the license key must be a build arg:**
- Vite needs the `VITE_*` prefixed variables at **build time** to embed them in the JavaScript bundle
- At runtime, Vite checks `import.meta.env.VITE_TLDRAW_LICENSE_KEY` which must be available in the built code
- Just setting environment variables won't work — they're only available to the Node server, not the frontend

### Alternative: Using Cloud Build Configuration

For CI/CD integration or more control, use the `cloudbuild.yaml` configuration:

```bash
gcloud builds submit --config=cloudbuild.yaml \
  --substitutions=_VITE_TLDRAW_LICENSE_KEY="$(grep VITE_TLDRAW_LICENSE_KEY .env | cut -d= -f2)"
```

This is useful for:
- GitHub Actions or GitLab CI integration
- Cloud Source Repository triggers
- Setting secrets securely via Cloud Console

### Alternative: Manual Google Cloud Deployment

If you prefer to deploy manually without the script:

```bash
# Set the license key as an environment variable
export VITE_TLDRAW_LICENSE_KEY="tldraw-2026-08-15/WyJtY3ptSGdNXyIsWyIqIl0sMTYsIjIwMjYtMDgtMTUiXQ.rx1FVvQajYQUQfU8Dk/Ugef6kB9vBVI2z/HyKOwkDb/ZESWJOSvaUiGTl+l9SU/HpIGlv5Q/Uv8+2eeczy1L+w"

# Deploy using gcloud
gcloud run deploy ai-interview-platform \
  --image gcr.io/YOUR_PROJECT_ID/ai-interview-platform \
  --region us-central1 \
  --set-env-vars VITE_TLDRAW_LICENSE_KEY=$VITE_TLDRAW_LICENSE_KEY
```

### Optional: Google Cloud Secret Manager (For Enhanced Security)

For additional security in production, store the license key in Google Cloud Secret Manager:

1. **Create the secret:**
   ```bash
   echo -n "tldraw-2026-08-15/WyJtY3ptSGdNXyIsWyIqIl0sMTYsIjIwMjYtMDgtMTUiXQ.rx1FVvQajYQUQfU8Dk/Ugef6kB9vBVI2z/HyKOwkDb/ZESWJOSvaUiGTl+l9SU/HpIGlv5Q/Uv8+2eeczy1L+w" | gcloud secrets create tldraw-license-key --data-file=-
   ```

2. **Grant Cloud Run service account access:**
   ```bash
   gcloud secrets add-iam-policy-binding tldraw-license-key \
     --member=serviceAccount:YOUR_CLOUD_RUN_SERVICE_ACCOUNT@appspot.gserviceaccount.com \
     --role=roles/secretmanager.secretAccessor
   ```

3. **Reference the secret in Cloud Run:**
   ```bash
   gcloud run deploy ai-interview-platform \
     --set-secrets VITE_TLDRAW_LICENSE_KEY=tldraw-license-key:latest
   ```

## Deployment Checklist

- [x] License key added to `.env` (development)
- [x] License key added to `.env.cloud-run` (production)
- [x] Vite config updated to expose `VITE_TLDRAW_LICENSE_KEY`
- [ ] Build and test locally: `npm run build`
- [ ] Deploy to Cloud Run and verify whiteboard functionality

## License Expiration

⚠️ **Important:** The license expires on **2026-08-15**. Plan to renew before this date.

## Troubleshooting

If you get the error "Whiteboard is unavailable in production without a Tldraw license key":

1. Verify the env var is set: `echo $VITE_TLDRAW_LICENSE_KEY`
2. Check that vite build includes it: `npm run build && grep -r "tldraw" dist/`
3. Verify it's being used in your Tldraw component initialization
