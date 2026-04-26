/** Format an ISO date string to a human-readable relative or absolute form */
export function fmtDate(iso: string): string {
  const date = new Date(iso);
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Shorten a commit SHA */
export function shortSha(sha: string): string {
  return sha.slice(0, 7);
}

/** First line of a commit message */
export function firstLine(msg: string): string {
  return msg.split('\n')[0].trim();
}

/** Truncate a string to a max length, appending an ellipsis when cut */
export function truncate(str: string, max = 72): string {
  return str.length <= max ? str : str.slice(0, max).trimEnd() + '…';
}

/** Format a large number to a compact human-readable string (e.g. 1 500 → 1.5k) */
export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}
