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
