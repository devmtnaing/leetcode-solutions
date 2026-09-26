// A corpus line is "k|values"; the stage takes up to 10 nodes.
export const input = (c) => { const [k, v] = c.split('|'); const values = v.split(',').map(Number); return values.length <= 10 ? { values, k: Number(k) } : null; };
export const answer = (s) => (s.finished ? s.result.map((id) => s.vals[id]).join(',') : 'NOT FINISHED');
