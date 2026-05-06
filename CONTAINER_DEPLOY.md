# Containerized Deployment Guide

This project is fully containerized and ready for Google Cloud Run.

## 🐳 Local Development with Docker

To test the production container locally:

```bash
# 1. Build the image
npm run docker:build

# 2. Run the container (reads from your .env file)
npm run docker:run
```

Access the app at `http://localhost:8080`.

## ☁️ Deploying to Google Cloud Run

We use a simplified deployment script that builds your image in the cloud and deploys it to Cloud Run.

### Prerequisites
- `gcloud` CLI installed and authenticated.
- A Google Cloud Project created.

### Deployment Command

```bash
npm run deploy:gcp
```

This command will:
1. Enable necessary Google Cloud APIs.
2. Build your container image using **Cloud Build**.
3. Push the image to **Google Container Registry**.
4. Deploy the image to **Cloud Run** with your local `.env` variables.
5. Connect to your **Cloud SQL** instance (if configured).

---

## 🤖 CI/CD with GitHub Actions

The project includes a GitHub Actions workflow that automatically deploys your app whenever you push to the `main` branch.

### Setup

1.  **GCP Service Account**:
    - Create a service account in GCP with roles: `Cloud Run Admin`, `Storage Admin`, `Cloud Build Editor`, `Service Account User`.
    - Download the JSON key.

2.  **GitHub Secrets**:
    - Add the following secrets to your GitHub repository (**Settings > Secrets and variables > Actions**):
        - `GCP_PROJECT_ID`: Your GCP project ID.
        - `GCP_SA_KEY`: The content of your Service Account JSON key.
        - `OPENROUTER_API_KEY`, `LLM_BASE_URL`, `LLM_API_KEY`, `LLM_MODEL`, `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_DIALECT`, `TAVILY_API_KEY`.

### Automatic Deployment

Once the secrets are set up, simply push to `main`:

```bash
git add .
git commit -m "feat: updated styles"
git push origin main
```

GitHub will now automatically build your container and deploy it to Cloud Run.
