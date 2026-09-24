// A corpus line is the array; the stage shows up to 15 values.
export const input = (c) => { const nums = c.split(',').map(Number); return nums.length <= 15 ? { nums } : null; };
export const answer = (s) => (s.finished ? String(s.answer) : 'NOT FINISHED');
