// A corpus line is the array; the stage shows up to 10 values.
export const input = (c) => { const nums = c.split(',').map(Number); return nums.length <= 10 ? { nums } : null; };
export const answer = (s) => (s.finished ? s.answer.map((v) => (Object.is(v, -0) ? 0 : v)).join(',') : 'NOT FINISHED');
