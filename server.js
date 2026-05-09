import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import https from 'https';

const app = express();
const PROXY_PORT = 3001;

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
    res.status(502).json({ error: err.message, status: err.statusCode ?? 502 });
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
    res.status(502).json({ error: err.message, status: err.statusCode ?? 502 });
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
    res.status(502).json({ error: err.message, status: err.statusCode ?? 502 });
  }
});

// GET /api/repo → repository metadata (stars, forks, watchers, language)
app.get('/api/repo', async (_req, res) => {
  try {
    const { status, body } = await githubFetch(
      `/repos/${GITHUB_OWNER}/${GITHUB_REPO}`
    );
    res.status(status).json(body);
  } catch (err) {
    res.status(502).json({ error: err.message, status: err.statusCode ?? 502 });
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
    res.status(502).json({ error: err.message, status: err.statusCode ?? 502 });
  }
});

// GET /api/contributors → top contributors
app.get('/api/contributors', async (_req, res) => {
  try {
    const { status, body } = await githubFetch(
      `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contributors?per_page=10`
    );
    res.status(status).json(body);
  } catch (err) {
    res.status(502).json({ error: err.message, status: err.statusCode ?? 502 });
  }
});

// GET /api/git-graph → branch + commit data for graph rendering
app.get('/api/git-graph', async (_req, res) => {
  try {
    const { body: rawBranches } = await githubFetch(
      `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/branches?per_page=20`
    );
    if (!Array.isArray(rawBranches)) {
      return res.status(502).json({ error: 'Unexpected branches response' });
    }

    const commitMap = new Map(); // sha → commit
    const shaToB    = new Map(); // sha → string[] branch names
    const branchData = [];

    for (const branch of rawBranches) {
      branchData.push({ name: branch.name, headSha: branch.commit.sha });
      const { body: commits } = await githubFetch(
        `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/commits?sha=${encodeURIComponent(branch.name)}&per_page=20`
      );
      if (!Array.isArray(commits)) continue;
      for (const c of commits) {
        if (!commitMap.has(c.sha)) {
          commitMap.set(c.sha, {
            sha: c.sha,
            message: c.commit.message,
            author: c.commit.author.name,
            date: c.commit.author.date,
            parents: c.parents.map((p) => p.sha),
          });
        }
        if (!shaToB.has(c.sha)) shaToB.set(c.sha, []);
        shaToB.get(c.sha).push(branch.name);
      }
    }

    const commits = Array.from(commitMap.values())
      .map((c) => ({ ...c, branches: shaToB.get(c.sha) || [] }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({ branches: branchData, commits });
  } catch (err) {
    res.status(502).json({ error: err.message, status: err.statusCode ?? 502 });
  }
});

app.listen(PROXY_PORT, () => {
  console.log(`[proxy] Running on http://localhost:${PROXY_PORT}`);
  console.log(`[proxy] Proxying: ${GITHUB_OWNER}/${GITHUB_REPO}`);
});
