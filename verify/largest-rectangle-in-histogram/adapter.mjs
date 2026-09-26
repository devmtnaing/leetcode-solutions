// A corpus line is the heights; the stage takes up to 12 bars no taller than 20.
export const input = (c) => { const heights = c.split(',').map(Number); return heights.length <= 12 && Math.max(...heights) <= 20 ? { heights } : null; };
export const answer = (s) => (s.finished ? String(s.best) : 'NOT FINISHED');
