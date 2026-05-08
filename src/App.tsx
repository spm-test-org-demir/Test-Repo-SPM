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

  const commitLane = new Map<string, number>();
  data.commits.forEach((c) => {
    commitLane.set(c.sha, assignLane(c, branchLane, mainName, data.branches));
  });

  // Oldest → newest: time flows left → right
  const sorted = [...data.commits].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const commitRank = new Map<string, number>();
  sorted.forEach((c, i) => commitRank.set(c.sha, i));

  const LABEL_W = 132;
  const COL_W   = 90;
  const H_ROW   = 46;
  const BOTTOM  = 16;
  const C_R     = 5;

  const laneY = (l: number) => 10 + l * H_ROW + H_ROW / 2;
  const colX  = (rank: number) => LABEL_W + rank * COL_W + COL_W / 2;

  const svgW = LABEL_W + sorted.length * COL_W + 20;
  const svgH = ordered.length * H_ROW + 20 + BOTTOM;

  return (
    <div className="git-graph-scroll">
      <svg width={svgW} height={svgH}>

        {/* Horizontal lane guide lines */}
        {ordered.map((b, i) => (
          <line key={b.name}
            x1={LABEL_W} y1={laneY(i)} x2={svgW} y2={laneY(i)}
            stroke={LANE_COLORS[i % LANE_COLORS.length]}
            strokeWidth={1.5} strokeOpacity={0.2}
          />
        ))}

        {/* Vertical separator between labels and graph */}
        <line x1={LABEL_W - 4} y1={0} x2={LABEL_W - 4} y2={svgH}
          stroke="#30363d" strokeWidth={1} />

        {/* Branch labels (left column) */}
        {ordered.map((b, i) => {
          const color = LANE_COLORS[i % LANE_COLORS.length];
          const short = b.name.replace(/^(feature|feat|fix|chore)\//i, '');
          const display = short.length > 17 ? short.slice(0, 17) + '…' : short;
          return (
            <g key={`lbl-${b.name}`}>
              <rect x={4} y={laneY(i) - 11} width={LABEL_W - 12} height={22}
                rx={4} fill={color} fillOpacity={0.13} />
              <text x={10} y={laneY(i) + 4} fontSize={10} fill={color}
                fontFamily="monospace" fontWeight={600}>{display}</text>
            </g>
          );
        })}

        {/* Parent → child connections (horizontal bezier) */}
        {data.commits.flatMap((c) => {
          const cLane = commitLane.get(c.sha) ?? 0;
          const cRank = commitRank.get(c.sha) ?? 0;
          const cx = colX(cRank);
          const cy = laneY(cLane);
          return c.parents.map((pSha, pi) => {
            const pRank = commitRank.get(pSha);
            if (pRank === undefined) return null;
            const pLane = commitLane.get(pSha) ?? 0;
            const px = colX(pRank);
            const py = laneY(pLane);
            const color = LANE_COLORS[cLane % LANE_COLORS.length];
            if (cy === py) {
              return <line key={`${c.sha}-${pi}`}
                x1={px} y1={py} x2={cx} y2={cy} stroke={color} strokeWidth={1.5} />;
            }
            const mx = (px + cx) / 2;
            return (
              <path key={`${c.sha}-${pi}`}
                d={`M ${px} ${py} C ${mx} ${py}, ${mx} ${cy}, ${cx} ${cy}`}
                stroke={color} strokeWidth={1.5} fill="none" />
            );
          });
        })}

        {/* Commit circles + SHA only (hover for full message) */}
        {data.commits.map((c) => {
          const lane   = commitLane.get(c.sha) ?? 0;
          const rank   = commitRank.get(c.sha) ?? 0;
          const cx     = colX(rank);
          const cy     = laneY(lane);
          const color  = LANE_COLORS[lane % LANE_COLORS.length];
          const isHead = data.branches.some((b) => b.headSha === c.sha);
          return (
            <g key={c.sha}>
              <title>{firstLine(c.message)}{'\n'}{c.author} · {fmtDate(c.date)}</title>
              {isHead && (
                <circle cx={cx} cy={cy} r={C_R + 4}
                  fill="none" stroke={color} strokeWidth={1} strokeOpacity={0.45} />
              )}
              <circle cx={cx} cy={cy} r={C_R + 1} fill="#161b22" />
              <circle cx={cx} cy={cy} r={C_R} fill={color} />
              <text x={cx} y={cy + C_R + 11} fontSize={9} fill="#8b949e"
                fontFamily="monospace" textAnchor="middle">{shortSha(c.sha)}</text>
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
