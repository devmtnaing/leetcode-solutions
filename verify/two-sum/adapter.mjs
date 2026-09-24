// A corpus line is "nums|target"; the page takes up to 12 values.
export const input = (c) => { const [a, t] = c.split('|'); const nums = a.split(',').map(Number); return nums.length <= 12 ? { nums, target: Number(t) } : null; };
export const answer = (s) => (s.found ? [...s.found].sort((x, y) => x - y).join(',') : 'NOT FOUND');
