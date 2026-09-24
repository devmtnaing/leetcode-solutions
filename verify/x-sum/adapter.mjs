// A corpus line is "nums|k|x"; the stage shows up to 12 values.
export const input = (c) => { const [a, k, x] = c.split('|'); const nums = a.split(',').map(Number); return nums.length <= 12 ? { nums, k: Number(k), x: Number(x) } : null; };
export const answer = (s) => (s.answer ?? []).join(',');
