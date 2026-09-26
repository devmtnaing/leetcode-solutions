// A corpus line is calls "a num" / "f" joined by ";"; the stage takes up to 12
// calls with numbers from -99 to 99.
export const input = (c) => {
  const ops = c.split(';').map((o) => (o === 'f' ? 'f' : Number(o.slice(2))));
  return ops.length <= 12 && ops.every((o) => o === 'f' || Math.abs(o) <= 99) ? { ops } : null;
};
export const answer = (s) => (s.finished ? s.results.map((r) => (r === null ? 'null' : r.toFixed(5))).join(',') : 'NOT FINISHED');
