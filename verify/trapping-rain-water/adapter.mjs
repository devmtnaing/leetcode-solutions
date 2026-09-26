// A corpus line is the heights; the stage takes up to 14 bars no taller than 8.
export const input = (c) => { const height = c.split(',').map(Number); return height.length <= 14 && Math.max(...height) <= 8 ? { height } : null; };
export const answer = (s) => (s.finished ? String(s.water) : 'NOT FINISHED');
