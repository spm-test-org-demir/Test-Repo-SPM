import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import https from 'https';

const app = express();
const PORT = 3001;

const { GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO } = process.env;

if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
  console.error('[proxy] ERROR: GITHUB_TOKEN, GITHUB_OWNER, and GITHUB_REPO must be set in .env');
  process.exit(1);
}

// CORS — only allow the Vite dev server
app.use(cors({ origin: 'http://localhost:5173' }));

// Validate that proxy only forwards requests to api.github.com
const ALLOWED_HOST = 'api.github.com';

function githubFetch(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: ALLOWED_HOST,
      path,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'spm-test-placeholder-proxy',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          reject(new Error('Failed to parse GitHub response'));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// GET /api/pulls  → open pull requests
app.get('/api/pulls', async (_req, res) => {
  try {
    const { status, body } = await githubFetch(
      `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/pulls?state=open&per_page=50`
    );
    res.status(status).json(body);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

// GET /api/commits → latest commits (default branch)
app.get('/api/commits', async (_req, res) => {
  try {
    const { status, body } = await githubFetch(
      `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/commits?per_page=5`
    );
    res.status(status).json(body);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

// GET /api/branches → all branches
app.get('/api/branches', async (_req, res) => {
  try {
    const { status, body } = await githubFetch(
      `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/branches?per_page=100`
    );
    res.status(status).json(body);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

// GET /api/issues → open issues (excludes pull requests)
app.get('/api/issues', async (_req, res) => {
  try {
    const { status, body } = await githubFetch(
      `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues?state=open&per_page=50`
    );
    // GitHub returns PRs in the issues list; filter them out
    const issues = Array.isArray(body) ? body.filter((i) => !i.pull_request) : body;
    res.status(status).json(issues);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`[proxy] Running on http://localhost:${PORT}`);
  console.log(`[proxy] Proxying: ${GITHUB_OWNER}/${GITHUB_REPO}`);
});
