// A corpus line is the prices; the page takes up to 12.
export const input = (c) => { const prices = c.split(',').map(Number); return prices.length <= 12 ? { prices } : null; };
export const answer = (s) => String(s.best);
