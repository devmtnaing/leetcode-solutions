// A corpus line is the array; the page takes up to 12 values.
export const input = (c) => { const nums = c.split(',').map(Number); return nums.length <= 12 ? { nums } : null; };
export const answer = (s) => (s.done ? s.arr.join(',') : 'NOT DONE');
