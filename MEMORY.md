# Project Memory

### 2026-05-06 - Tool Calling Fix & Secure GCP Deployment

#### 🧠 Key Learnings
- **Tool Calling Robustness**: Some models (like Gemini 1.5 Flash via OpenRouter) may intermittently fail or report lack of tool support for specific tools (like `search`). It's safer to have a toggle to disable tool-calling logic entirely.
- **WIF Benefits**: Workload Identity Federation (WIF) is much more secure than static service account keys as it uses short-lived tokens and removes the need to store secrets in GitHub.

#### 🛠️ Technical Decisions
- **`LLM_ENABLE_TOOLS` Variable**: Introduced this environment variable to control the `InterviewerAgent`'s use of the ReAct loop. It defaults to `false`.
- **Secret Manager Integration**: Transitioned all application secrets from `.env`/GitHub Secrets to GCP Secret Manager. Cloud Run now mounts these as secrets rather than environment variables, which is more secure.
- **Service-Based Identity**: Configured Cloud Run to use `adveralabs-sa` as its identity, granting it `secretmanager.secretAccessor` permissions.

#### 🐞 Troubleshooting & Gotchas
- **GitHub OIDC Permissions**: Using WIF requires the `permissions: id-token: write` block in the GitHub Actions workflow, otherwise the token request fails.
- **Attribute Conditions in WIF**: Creating a Workload Identity Provider for GitHub often requires an `--attribute-condition` (like `assertion.repository == 'owner/repo'`) to satisfy GCP validation rules.
- **Missing Build Files**: Build failures in CI/CD are often due to missing untracked files. Always check `git status` for untracked utilities (e.g., `client/src/utils/formatLeetcodeHTML.js`) before pushing.

#### 🚀 Deployment & Infrastructure
- **GCP Project**: `adveralabs`
- **Cloud Run Service**: `ai-interview-platform`
- **WIF Pool**: `github-pool`
- **WIF Provider**: `projects/1078980357394/locations/global/workloadIdentityPools/github-pool/providers/github-provider`
- **Deploy Script**: `deploy_gcp.sh` has been updated to include the new tool-calling toggle.
