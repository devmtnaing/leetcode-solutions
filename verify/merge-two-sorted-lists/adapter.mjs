// A corpus line is "list1|list2"; the stage shows up to 8 nodes each.
const p = (s) => (s ? s.split(',').map(Number) : []);
export const input = (c) => { const [a, b] = c.split('|').map(p); return a.length <= 8 && b.length <= 8 ? { list1: a, list2: b } : null; };
export const answer = (s) => s.out.join(',');
