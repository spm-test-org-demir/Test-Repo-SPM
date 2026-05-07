import { useGitHubData, useGitHubSingle } from './useGitHubData';
import { fmtDate, shortSha, firstLine } from './utils';
import type { PullRequest, Commit, Branch, Issue, RepoInfo, Contributor, GitGraphData, GraphCommit, GraphBranch } from './types';
import { useState, useEffect } from 'react';

const REFRESH_MS = 300_000; // 5 minutes
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
            <div className="repo-tags">
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
/* ── Contributors ───────────────────────────────────────────────────────────── */
function ContributorsCard() {
  const { data, loading, error } = useGitHubData<Contributor>('/contributors', REFRESH_MS);
  return (
    <section className="card">
      <div className="card-header">
        <h2>Top Contributors</h2>
        {data && <span className="badge">{data.length}</span>}
      </div>
      <div className="card-body">
        {!data && <LoadingOrError loading={loading} error={error} />}
        {data?.length === 0 && !loading && (
          <div className="state-msg">No contributors found.</div>
        )}
        {data?.map((c) => (
          <div className="contributor-item" key={c.id}>
            <a
              href={c.html_url}
              target="_blank"
              rel="noreferrer"
              className="contributor-link"
              title={c.login}
            >
              <img
                className="contributor-avatar"
                src={c.avatar_url}
                alt={c.login}
                width={32}
                height={32}
              />
              <span className="contributor-login">{c.login}</span>
            </a>
            <span className="tag tag-green" title="Commits">
              {c.contributions} commits
            </span>
          </div>
        ))}
        {data && error && <LoadingOrError loading={false} error={error} />}
      </div>
    </section>
  );
}

/* ── Git Graph ──────────────────────────────────────────────────────────── */
const LANE_COLORS = ['#58a6ff','#3fb950','#d29922','#f778ba','#a371f7','#fd8c73','#39d353'];
const LANE_W = 22;
const ROW_H  = 40;
const CR     = 5;
const PL     = 10;

function laneX(l: number) { return PL + l * LANE_W + LANE_W / 2; }
function rowY(r: number)  { return 12 + r * ROW_H; }

function assignLane(
  commit: GraphCommit,
  branchLane: Map<string, number>,
  mainName: string,
  branches: GraphBranch[]
): number {
  const isHeadOfFeature = branches.some(
    (b) => b.name !== mainName && b.headSha === commit.sha
  );
  let lane = 0;
  for (const bn of commit.branches) {
    const l = branchLane.get(bn) ?? 0;
    if (l > lane) lane = l;
  }
  const onMain = commit.branches.includes(mainName);
  if (onMain && !isHeadOfFeature && commit.branches.length > 1) lane = 0;
  return lane;
}

function GitGraph({ data }: { data: GitGraphData }) {
  const mainName = (data.branches.find((b) => b.name === 'main' || b.name === 'master') ?? data.branches[0])?.name ?? 'main';
  const ordered: GraphBranch[] = [
    ...data.branches.filter((b) => b.name === mainName),
    ...data.branches.filter((b) => b.name !== mainName),
  ];
  const branchLane = new Map<string, number>();
  ordered.forEach((b, i) => branchLane.set(b.name, i));
  const numLanes = ordered.length;

  const commitLane = new Map<string, number>();
  const commitRow  = new Map<string, number>();
  data.commits.forEach((c, i) => {
    commitRow.set(c.sha, i);
    commitLane.set(c.sha, assignLane(c, branchLane, mainName, data.branches));
  });

  const textStart = PL + numLanes * LANE_W + 14;
  const svgW = textStart + 460;
  const svgH = data.commits.length * ROW_H + 24;

  return (
    <div className="git-graph-scroll">
      <svg width={svgW} height={svgH}>
        {/* Lane guide lines */}
        {ordered.map((b, i) => (
          <line key={b.name}
            x1={laneX(i)} y1={0} x2={laneX(i)} y2={svgH}
            stroke={LANE_COLORS[i % LANE_COLORS.length]}
            strokeWidth={1.5} strokeOpacity={0.18}
          />
        ))}

        {/* Branch head labels */}
        {ordered.map((b, i) => {
          const row = commitRow.get(b.headSha);
          if (row === undefined) return null;
          const x = laneX(i);
          const y = rowY(row);
          const shortName = b.name.replace(/^(feature|feat|fix|chore)\//i, '');
          return (
            <g key={`label-${b.name}`}>
              <rect
                x={x + CR + 4} y={y - 9}
                width={shortName.length * 6.2 + 10} height={17}
                rx={4} fill={LANE_COLORS[i % LANE_COLORS.length]} fillOpacity={0.18}
              />
              <text
                x={x + CR + 9} y={y + 3}
                fontSize={10} fill={LANE_COLORS[i % LANE_COLORS.length]}
                fontFamily="monospace" fontWeight={600}
              >{shortName}</text>
            </g>
          );
        })}

        {/* Parent → child connections */}
        {data.commits.flatMap((c) => {
          const cLane = commitLane.get(c.sha) ?? 0;
          const cRow  = commitRow.get(c.sha)  ?? 0;
          const cx = laneX(cLane);
          const cy = rowY(cRow);
          return c.parents.map((pSha, pi) => {
            const pRow = commitRow.get(pSha);
            if (pRow === undefined) return null;
            const pLane = commitLane.get(pSha) ?? 0;
            const px = laneX(pLane);
            const py = rowY(pRow);
            const color = LANE_COLORS[cLane % LANE_COLORS.length];
            if (cx === px) {
              return <line key={`${c.sha}-${pi}`} x1={cx} y1={cy} x2={px} y2={py} stroke={color} strokeWidth={1.5} />;
            }
            const my = (cy + py) / 2;
            return (
              <path key={`${c.sha}-${pi}`}
                d={`M ${cx} ${cy} C ${cx} ${my}, ${px} ${my}, ${px} ${py}`}
                stroke={color} strokeWidth={1.5} fill="none"
              />
            );
          });
        })}

        {/* Commit circles + text */}
        {data.commits.map((c, i) => {
          const lane  = commitLane.get(c.sha) ?? 0;
          const cx    = laneX(lane);
          const cy    = rowY(i);
          const color = LANE_COLORS[lane % LANE_COLORS.length];
          const msg   = firstLine(c.message);
          return (
            <g key={c.sha}>
              <circle cx={cx} cy={cy} r={CR + 1} fill="#161b22" />
              <circle cx={cx} cy={cy} r={CR} fill={color} />
              <text x={textStart} y={cy - 5} fontSize={11.5}
                fill="#e6edf3" fontFamily="monospace"
                style={{ dominantBaseline: 'auto' }}>
                {msg.length > 52 ? msg.slice(0, 52) + '…' : msg}
              </text>
              <text x={textStart} y={cy + 8} fontSize={10}
                fill="#8b949e" fontFamily="monospace"
                style={{ dominantBaseline: 'auto' }}>
                {shortSha(c.sha)} · {c.author} · {fmtDate(c.date)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function GitGraphCard() {
  const { data, loading, error } = useGitHubSingle<GitGraphData>('/git-graph', REFRESH_MS);
  return (
    <section className="card card--full">
      <div className="card-header">
        <h2>Commit Graph</h2>
        {data && <span className="badge">{data.commits.length} commits · {data.branches.length} branches</span>}
      </div>
      <div className="card-body">
        {!data && <LoadingOrError loading={loading} error={error} />}
        {data && <GitGraph data={data} />}
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
            live · 5m refresh
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
        <ContributorsCard />
      </div>
      <GitGraphCard />
    </div>
  );
}
