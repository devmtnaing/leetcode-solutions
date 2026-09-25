// A corpus line is calls "i word" / "s word" / "w prefix" split by ";"; the
// stage takes up to 8 calls of words up to 6 letters.
const KIND = { i: 'insert', s: 'search', w: 'startsWith' };
export const input = (c) => {
  const ops = c.split(';').map((o) => { const [k, w] = o.split(' '); return [KIND[k], w]; });
  return ops.length <= 8 && ops.every(([, w]) => w.length <= 6) ? { ops } : null;
};
export const answer = (s) => (s.finished ? s.results.map((r) => (r === null ? 'null' : String(r))).join(',') : 'NOT FINISHED');
