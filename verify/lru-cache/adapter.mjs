// A corpus line is "capacity|call;call" with calls "p key value" / "g key";
// the stage takes capacity up to 4 and up to 12 calls, keys under 100 and
// values under 1,000.
export const input = (c) => {
  const [cap, calls] = c.split('|');
  const ops = calls.split(';').map((o) => { const a = o.split(' ').map((x, i) => (i ? Number(x) : x)); return a[0] === 'p' ? ['put', a[1], a[2]] : ['get', a[1]]; });
  const fits = Number(cap) <= 4 && ops.length <= 12 && ops.every((o) => o[1] < 100 && (o[2] ?? 0) < 1000);
  return fits ? { capacity: Number(cap), ops } : null;
};
export const answer = (s) => (s.finished ? s.results.map((r) => (r === null ? 'null' : String(r))).join(',') : 'NOT FINISHED');
