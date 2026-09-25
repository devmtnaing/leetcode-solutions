// A corpus line is the list, comma-separated; the stage takes up to 4 numbers.
// The walkthrough's out is sorted and printed the way every driver prints it.
export const input = (c) => { const nums = c.split(',').map(Number); return nums.length <= 4 ? { nums } : null; };
export const answer = (s) => {
  if (!s.finished) return 'NOT FINISHED';
  const r = s.out.map((p) => [...p]).sort((a, b) => { for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] - b[i]; return 0; });
  return `${r.length}|${r.map((p) => p.join(',')).join(';')}`;
};
