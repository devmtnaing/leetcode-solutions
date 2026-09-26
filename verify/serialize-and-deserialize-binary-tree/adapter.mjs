// A corpus line is a level-order tree ("" when empty); the stage draws up to 12 nodes.
const parse = (c) => (c ? c.split(',').map((x) => (x === 'null' ? null : Number(x))) : []);
export const input = (c) => { const level = parse(c); return level.filter((v) => v != null).length <= 12 ? { level } : null; };
export const answer = (s) => (s.finished ? String(s.answer) : 'NOT FINISHED');
