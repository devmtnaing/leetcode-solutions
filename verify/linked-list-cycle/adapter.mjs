// A corpus line is "values|pos"; the stage shows up to 12 nodes.
export const input = (c) => { const [v, p] = c.split('|'); const a = v ? v.split(',').map(Number) : []; return a.length <= 12 ? { values: a, pos: Number(p) } : null; };
export const answer = (s) => String(s.verdict);
