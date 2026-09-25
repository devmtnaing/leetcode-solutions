// A corpus line is "k|nums"; the stage takes up to 12 values.
export const input = (c) => { const [k, a] = c.split('|'); const nums = a.split(',').map(Number); return nums.length <= 12 ? { nums, k: Number(k) } : null; };
export const answer = (s) => (s.finished ? s.out.join(',') : 'NOT FINISHED');
