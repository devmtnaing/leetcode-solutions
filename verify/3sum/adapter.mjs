// A corpus line is the array; the stage shows up to 10 values.
export const input = (c) => { const nums = c.split(',').map(Number); return nums.length <= 10 ? { nums } : null; };
const cmp = (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
export const answer = (s) => (s.finished
  ? `[${s.result.map((t) => [...t].sort((a, b) => a - b)).sort(cmp).map((t) => `[${t.join(',')}]`).join(',')}]`
  : 'NOT FINISHED');
