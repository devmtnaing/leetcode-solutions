// A corpus line is the array; the bit view needs up to 13 values in 0..255.
export const input = (c) => { const a = c.split(',').map(Number); return a.length <= 13 && a.every((x) => x >= 0 && x <= 255) ? { nums: a } : null; };
export const answer = (s) => String(s.answer);
