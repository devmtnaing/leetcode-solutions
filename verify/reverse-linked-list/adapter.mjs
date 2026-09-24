// A corpus line is the list; the stage shows up to 12 nodes.
export const input = (c) => { const a = c ? c.split(',').map(Number) : []; return a.length <= 12 ? { nums: a } : null; };
export const answer = (s) => (s.result ? s.result.join(',') : 'NO RESULT');
