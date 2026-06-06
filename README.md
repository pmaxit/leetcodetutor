---
title: Leetcode Tutor & AI Interviewer
emoji: 🤖
colorFrom: indigo
colorTo: violet
sdk: docker
app_port: 8080
pinned: true
license: mit
---

# 🤖 Leetcode Tutor & AI Interviewer

An AI-powered preparation platform for Software Engineering Interviews (DSA and System Design). It integrates an interactive coding editor, an active whiteboarding suite, and a Socratic AI interviewer that nudges you toward optimal solutions instead of spoiling them.

---

## 🔗 Quick Links

*   🚀 **Live Web App**: [app-production-e0a6.up.railway.app](https://app-production-e0a6.up.railway.app)
*   🛤️ **Railway Project Dashboard**: [puneet's Projects / ai-interview-platform](https://railway.com/project/1788c341-250a-4451-b45d-89cf435b602d)
*   📦 **GitHub Repository**: [github.com/pmaxit/leetcodetutor](https://github.com/pmaxit/leetcodetutor)
*   📊 **AST Code Graph**: [graphify-out/GRAPH_REPORT.md](file:///home/puneet/Projects/interviews/machine-learning/graphify-out/GRAPH_REPORT.md)

---

## ✨ Features

- **Socratic Coding Interviewer**: Simulates a real interviewer with state tracking (`currentHintIndex`, progressive hints, and final evaluation reports).
- **Interactive Whiteboard**: Integration with Tldraw for drawing and architecting system designs.
- **Spaced Repetition Scheduler**: Dynamically generates custom practice plans based on problem difficulty and category, tracked in the database.
- **Auto-Enriched Problemset**: Synced database containing `1,209` curated problems (scraped and enriched with solutions, boilerplate, sample test cases, and video references).
- **Daily Digest Emails**: Automation scripts to compile and send daily practice summaries and solutions.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, Vite 8, Monaco Editor, Tldraw |
| **Backend** | Node.js, Express, Sequelize ORM |
| **Databases** | SQLite (local), PostgreSQL (Railway production), GCP Cloud SQL MySQL (dev/legacy) |
| **LLM Provider** | OpenRouter (Gemini, Gemma, DeepSeek, etc.) |
| **Search Engine** | Tavily Search API |
| **Deployment** | Docker, Railway App Service, GitHub Actions CI/CD |

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v20+)
- Docker & Docker Compose (optional, for containerized run)
- OpenRouter API key

### Local Setup

1. **Clone the repository**:
   ```bash
   git clone git@github.com:pmaxit/leetcodetutor.git
   cd leetcodetutor
   ```

2. **Configure Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   # LLM Configuration
   OPENROUTER_API_KEY=your-key-here
   OPENROUTER_URL=https://openrouter.ai/api/v1
   OPENROUTER_FALLBACKS=google/gemini-3.1-flash-lite

   # Search
   TAVILY_API_KEY=your-tavily-key

   # Database (Local SQLite)
   DB_DIALECT=sqlite

   # SMTP (Email Dispatch)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-smtp-app-password
   ```

3. **Install Dependencies**:
   ```bash
   npm install
   cd client && npm install && cd ..
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```
   *   Backend runs on: `http://localhost:3005`
   *   Vite frontend runs on: `http://localhost:5173`

---

## 🐳 Containerized Run (Recommended)

You can launch the entire stack using Docker Compose. The server automatically serves the compiled frontend.

```bash
./deploy.sh
```
This handles preflight dependency checks, builds the images, and starts the containerized service locally on port `8080`.

---

## 🛤️ Production Deployment (Railway)

The application is deployed on **Railway** via a multi-stage Docker build.

### Production Environment Variables (on Railway App)
- `DB_DIALECT=postgres`
- `APP_DB_URL=${{Postgres.DATABASE_URL}}` *(Points to Railway-managed Postgres)*
- `LLM_PROVIDER_STRATEGY=openrouter-only`
- `OPENROUTER_API_KEY` & `OPENROUTER_URL`
- `VITE_TLDRAW_LICENSE_KEY` *(Required for the whiteboard interface)*

### Automated CI/CD
Deployments are fully automated via GitHub Actions on push to `main` branch. 
*   **Workflow Config**: [.github/workflows/deploy.yml](file:///home/puneet/Projects/interviews/machine-learning/.github/workflows/deploy.yml)
*   **Requirement**: You must add your Railway project token to GitHub Secrets as **`RAILWAY_TOKEN`**.

---

## 📈 AST Code Graph & Structure

This project uses `graphify` to maintain a visual representation of AST dependencies. 
*   **Static Audit Report**: See [graphify-out/GRAPH_REPORT.md](file:///home/puneet/Projects/interviews/machine-learning/graphify-out/GRAPH_REPORT.md) for community modules and main hubs.
*   **To Update Code Graph**:
    ```bash
    graphify update .
    ```

---

## 📝 License

This project is licensed under the MIT License.
