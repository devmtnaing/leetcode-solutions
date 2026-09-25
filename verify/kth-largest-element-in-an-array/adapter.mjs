// A corpus line is "nums|k"; the stage shows up to 10 values.
export const input = (c) => { const [a, k] = c.split('|'); const nums = a.split(',').map(Number); return nums.length <= 10 ? { nums, k: Number(k) } : null; };
export const answer = (s) => (s.finished ? String(s.result) : 'NOT FINISHED');
