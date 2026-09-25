// A corpus line is "tree|p|q"; the stage draws up to 15 nodes.
const parse = (c) => (c ? c.split(',').map((x) => (x === 'null' ? null : Number(x))) : []);
export const input = (c) => { const [tr, p, q] = c.split('|'); const level = parse(tr); return level.filter((v) => v != null).length <= 15 ? { level, p: Number(p), q: Number(q) } : null; };
export const answer = (s) => (s.finished ? String(s.answer) : 'NOT FINISHED');
