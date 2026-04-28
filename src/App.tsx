import { useGitHubData } from './useGitHubData';
import { fmtDate, shortSha, firstLine } from './utils';
import type { PullRequest, Commit, Branch, Issue, RepoInfo } from './types';
import { useGitHubSingle } from './useGitHubData';
import { useState, useEffect } from 'react';

const REFRESH_MS = 60_000;
const OWNER = 'spm-test-org-demir';
const REPO  = 'Test-Repo-SPM';

/* ── Skeleton ───────────────────────────────────────────────────────── */
function Skeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="skeleton-list">
      {Array.from({ length: rows }).map((_, i) => (
        <div className="skeleton-item" key={i}>
          <div className="skel skel-title" />
          <div className="skel skel-meta" />
        </div>
      ))}
    </div>
  );
}

/* ── Error Message ──────────────────────────────────────────────────── */
function ErrMsg({ msg }: { msg: string }) {
  return <div className="state-msg error">⚠ {msg}</div>;
}

/* ── Open Pull Requests ─────────────────────────────────────────────── */
function PullsCard() {
  const { data, loading, error } = useGitHubData<PullRequest>('/pulls', REFRESH_MS);
  return (
    <section className="card">
      <div className="card-header">
        <span className="card-icon green">⟳</span>
        <h2>Open Pull Requests</h2>
        {data && <span className="badge">{data.length}</span>}
      </div>
      <div className="card-body">
        {loading && !data && <Skeleton />}
        {error && <ErrMsg msg={error} />}
        {data?.length === 0 && !loading && (
          <div className="state-msg">No open pull requests.</div>
        )}
        {data?.map((pr) => (
          <div className="item" key={pr.id}>
            <a className="item-title" href={pr.html_url} target="_blank" rel="noreferrer">
              <span className="tag tag-green">PR #{pr.number}</span>{' '}
              {truncate(pr.title)}
            </a>
            <div className="item-meta">
              <span>{pr.user.login}</span>
              <span className="dot-sep">{fmtDate(pr.created_at)}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Open Issues ───────────────────────────────────────────────────── */
function IssuesCard() {
  const { data, loading, error } = useGitHubData<Issue>('/issues', REFRESH_MS);
  return (
    <section className="card">
      <div className="card-header">
        <span className="card-icon orange">!</span>
        <h2>Open Issues</h2>
        {data && <span className="badge">{data.length}</span>}
      </div>
      <div className="card-body">
        {loading && !data && <Skeleton />}
        {error && <ErrMsg msg={error} />}
        {data?.length === 0 && !loading && (
          <div className="state-msg">No open issues.</div>
        )}
        {data?.map((issue) => (
          <div className="item" key={issue.id}>
            <a className="item-title" href={issue.html_url} target="_blank" rel="noreferrer">
              <span className="tag tag-orange">#{issue.number}</span>{' '}
              {truncate(issue.title)}
            </a>
            <div className="item-meta">
              <span>{issue.user.login}</span>
              <span className="dot-sep">{fmtDate(issue.created_at)}</span>
              {issue.labels.map((l) => (
                <span
                  key={l.name}
                  className="tag"
                  style={{
                    background: `#${l.color}18`,
                    color: `#${l.color}`,
                    border: `1px solid #${l.color}44`,
                  }}
                >
                  {l.name}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Recent Commits ─────────────────────────────────────────────────── */
function CommitsCard() {
  const { data, loading, error } = useGitHubData<Commit>('/commits', REFRESH_MS);
  return (
    <section className="card">
      <div className="card-header">
        <span className="card-icon blue">✦</span>
        <h2>Recent Commits</h2>
        {data && <span className="badge">{data.length}</span>}
      </div>
      <div className="card-body">
        {loading && !data && <Skeleton />}
        {error && <ErrMsg msg={error} />}
        {data?.map((c) => (
          <div className="item" key={c.sha}>
            <a className="item-title" href={c.html_url} target="_blank" rel="noreferrer">
              <span className="tag tag-blue">{shortSha(c.sha)}</span>{' '}
              {firstLine(c.commit.message)}
            </a>
            <div className="item-meta">
              <span>{c.commit.author.name}</span>
              <span className="dot-sep">{fmtDate(c.commit.author.date)}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Branches ───────────────────────────────────────────────────────── */
const DEFAULT_BRANCHES = ['main', 'master'];

function BranchesCard() {
  const { data, loading, error } = useGitHubData<Branch>('/branches', REFRESH_MS);
  return (
    <section className="card">
      <div className="card-header">
        <span className="card-icon purple">⎇</span>
        <h2>Branches</h2>
        {data && <span className="badge">{data.length}</span>}
      </div>
      <div className="card-body">
        {loading && !data && <Skeleton rows={4} />}
        {error && <ErrMsg msg={error} />}
        {data?.map((b) => {
          const isDefault = DEFAULT_BRANCHES.includes(b.name);
          return (
            <div className={`branch-item ${isDefault ? 'branch-default' : ''}`} key={b.name}>
              <span className="branch-icon">⎇</span>
              <span className="branch-name-text">{b.name}</span>
              {isDefault && <span className="branch-default-pill">DEFAULT</span>}
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ── Repository Stats ───────────────────────────────────────────────────── */
function RepoStatsCard() {
  const { data, loading, error } = useGitHubSingle<RepoInfo>('/repo', REFRESH_MS);
  return (
    <section className="card">
      <div className="card-header">
        <h2>Repository Stats</h2>
      </div>
      <div className="card-body">
        {loading && !data && <div className="state-msg">Loading…</div>}
        {error && <div className="state-msg error">⚠ {error}</div>}
        {data && (
          <>
            {data.description && (
              <p className="repo-description">{data.description}</p>
            )}
            <div className="repo-stats-grid">
              <div className="repo-stat">
                <span className="repo-stat-icon">⭐</span>
                <span className="repo-stat-value">{data.stargazers_count.toLocaleString()}</span>
                <span className="repo-stat-label">Stars</span>
              </div>
              <div className="repo-stat">
                <span className="repo-stat-icon">🍴</span>
                <span className="repo-stat-value">{data.forks_count.toLocaleString()}</span>
                <span className="repo-stat-label">Forks</span>
              </div>
              <div className="repo-stat">
                <span className="repo-stat-icon">👁</span>
                <span className="repo-stat-value">{data.watchers_count.toLocaleString()}</span>
                <span className="repo-stat-label">Watchers</span>
              </div>
              <div className="repo-stat">
                <span className="repo-stat-icon">⚠</span>
                <span className="repo-stat-value">{data.open_issues_count.toLocaleString()}</span>
                <span className="repo-stat-label">Open Issues</span>
              </div>
            </div>
            <div className="item-meta" style={{ marginTop: '0.75rem' }}>
              {data.language && (
                <span className="tag tag-blue">{data.language}</span>
              )}
              <span className="tag">default: {data.default_branch}</span>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default function App() {
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    const id = setInterval(() => setLastUpdated(new Date()), REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  const repoUrl = `https://github.com/${OWNER}/${REPO}`;

  return (
    <div className="app">
      {/* Top bar */}
      <div className="topbar">
        <div className="topbar-left">
          <div className="topbar-logo">⬡</div>
          <h1>GitHub Stats <span>/ dashboard</span></h1>
        </div>
        <div className="topbar-right">
          <div className="refresh-badge">
            <span className="refresh-dot" />
            live · 60s refresh
          </div>
          <span className="timestamp">
            updated <strong>{lastUpdated.toLocaleTimeString()}</strong>
          </span>
        </div>
      </div>

      {/* Repo info bar */}
      <div className="repo-bar">
        <span>⬡</span>
        <a href={repoUrl} target="_blank" rel="noreferrer">{OWNER}</a>
        <span className="repo-bar-sep">/</span>
        <a href={repoUrl} target="_blank" rel="noreferrer"><strong>{REPO}</strong></a>
      </div>

      {/* Cards */}
      <div className="grid">
        <RepoStatsCard />
        <PullsCard />
        <IssuesCard />
        <CommitsCard />
        <BranchesCard />
      </div>
    </div>
  );
}
