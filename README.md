# spm-test-placeholder — GitHub Stats Dashboard

A minimal Vite + React 18 + TypeScript frontend that displays **live GitHub repository stats** via a local
Express proxy. The GitHub token never touches the browser bundle.

## Architecture

```
browser (port 5173)  →  Express proxy (port 3001)  →  api.github.com
```

- **`server.js`** — Express proxy server; reads `GITHUB_TOKEN` from `.env` (server-side only).  
- **`src/`** — Vite React frontend; calls `http://localhost:3001/api/*`, never GitHub directly.

## Setup

### 1. Copy and fill the env template

```bash
cp .env.example .env
```

Open `.env` and fill in your values:

```
GITHUB_TOKEN=ghp_yourPersonalAccessTokenHere
GITHUB_OWNER=your-org-or-username
GITHUB_REPO=your-repo-name
```

> **Token scopes required:** `repo` (private repos) or `public_repo` (public repos).  
> Generate one at <https://github.com/settings/tokens>.

### 2. Install dependencies

```bash
npm install
```

### 3. Run locally

```bash
npm run dev
```

This starts both servers concurrently:
- Vite dev server → <http://localhost:5173>
- Express proxy   → <http://localhost:3001>

Open <http://localhost:5173> in your browser.

## Scripts

| Script        | Description                              |
|---------------|------------------------------------------|
| `npm run dev` | Start Vite + Express proxy concurrently  |
| `npm run build` | TypeScript check + Vite production build |

## Security checklist

- [x] `.env` is in `.gitignore` — never committed  
- [x] No token in any frontend file  
- [x] Owner/repo come from server `.env` only  
- [x] Proxy only forwards to `api.github.com` (validated in `server.js`)  
- [x] CORS on proxy restricted to `http://localhost:5173`

## What's displayed

| Section | Data |
|---------|------|
| **Open Pull Requests** | PR title, author, created date |
| **Recent Commits** | Message, author, date, SHA |
| **Branches** | Full list with total count |

Auto-refreshes every **60 seconds** without a page reload. Last-updated timestamp is always visible.
