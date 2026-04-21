import { useGitHubData } from './useGitHubData';
import { fmtDate, shortSha, firstLine } from './utils';
import type { PullRequest, Commit, Branch, Issue } from './types';
import { useState, useEffect } from 'react';

const REFRESH_MS = 60_000;

function LoadingOrError({ loading, error }: { loading: boolean; error: string | null }) {
  if (loading) return <div className="state-msg">Loading…</div>;
  if (error)   return <div className="state-msg error">⚠ {error}</div>;
  return null;
}

function PullsCard() {
  const { data, loading, error } = useGitHubData<PullRequest>('/pulls', REFRESH_MS);
  return (
    <section className="card">
      <div className="card-header">
        <h2>Open Pull Requests</h2>
        {data && <span className="badge">{data.length}</span>}
      </div>
      <div className="card-body">
        {(!data || data.length === 0) && <LoadingOrError loading={loading} error={error} />}
        {data?.length === 0 && !loading && <div className="state-msg">No open pull requests.</div>}
        {data?.map((pr) => (
          <div className="item" key={pr.id}>
            <a className="item-title" href={pr.html_url} target="_blank" rel="noreferrer" title={pr.title}>
              <span className="tag tag-green">PR #{pr.number}</span>{' '}
              {pr.title}
            </a>
            <div className="item-meta">
              <span>{pr.user.login}</span>
              <span>{fmtDate(pr.created_at)}</span>
            </div>
          </div>
        ))}
        {data && data.length > 0 && error && <LoadingOrError loading={false} error={error} />}
      </div>
    </section>
  );
}

function CommitsCard() {
  const { data, loading, error } = useGitHubData<Commit>('/commits', REFRESH_MS);
  return (
    <section className="card">
      <div className="card-header">
        <h2>Recent Commits</h2>
        {data && <span className="badge">{data.length}</span>}
      </div>
      <div className="card-body">
        {!data && <LoadingOrError loading={loading} error={error} />}
        {data?.map((c) => (
          <div className="item" key={c.sha}>
            <a className="item-title" href={c.html_url} target="_blank" rel="noreferrer" title={firstLine(c.commit.message)}>
              <span className="tag tag-blue">{shortSha(c.sha)}</span>{' '}
              {firstLine(c.commit.message)}
            </a>
            <div className="item-meta">
              <span>{c.commit.author.name}</span>
              <span>{fmtDate(c.commit.author.date)}</span>
            </div>
          </div>
        ))}
        {data && error && <LoadingOrError loading={false} error={error} />}
      </div>
    </section>
  );
}

function BranchesCard() {
  const { data, loading, error } = useGitHubData<Branch>('/branches', REFRESH_MS);
  return (
    <section className="card">
      <div className="card-header">
        <h2>Branches</h2>
        {data && <span className="badge">{data.length}</span>}
      </div>
      <div className="card-body">
        {!data && <LoadingOrError loading={loading} error={error} />}
        {data?.map((b) => (
          <div className="branch-name" key={b.name}>
            {b.name}
          </div>
        ))}
        {data && error && <LoadingOrError loading={false} error={error} />}
      </div>
    </section>
  );
}

function IssuesCard() {
  const { data, loading, error } = useGitHubData<Issue>('/issues', REFRESH_MS);
  return (
    <section className="card">
      <div className="card-header">
        <h2>Open Issues</h2>
        {data && <span className="badge">{data.length}</span>}
      </div>
      <div className="card-body">
        {!data && <LoadingOrError loading={loading} error={error} />}
        {data?.length === 0 && !loading && <div className="state-msg">No open issues.</div>}
        {data?.map((issue) => (
          <div className="item" key={issue.id}>
            <a className="item-title" href={issue.html_url} target="_blank" rel="noreferrer" title={issue.title}>
              <span className="tag tag-orange">#{issue.number}</span>{' '}
              {issue.title}
            </a>
            <div className="item-meta">
              <span>{issue.user.login}</span>
              <span>{fmtDate(issue.created_at)}</span>
              {issue.labels.map((l) => (
                <span
                  key={l.name}
                  className="tag"
                  style={{ background: `#${l.color}22`, color: `#${l.color}`, border: `1px solid #${l.color}55` }}
                >
                  {l.name}
                </span>
              ))}
            </div>
          </div>
        ))}
        {data && error && <LoadingOrError loading={false} error={error} />}
      </div>
    </section>
  );
}

export default function App() {
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Tick every time a refresh cycle completes (approximated by the interval)
  useEffect(() => {
    const id = setInterval(() => setLastUpdated(new Date()), REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <header>
        <h1>
          GitHub Stats <span>— spm-test-placeholder</span>
        </h1>
        <p className="meta">
          Auto-refresh every 60 s &nbsp;·&nbsp; Last updated:{' '}
          <strong>{lastUpdated.toLocaleTimeString()}</strong>
        </p>
      </header>
      <div className="grid">
        <PullsCard />
        <IssuesCard />
        <CommitsCard />
        <BranchesCard />
      </div>
    </>
  );
}
