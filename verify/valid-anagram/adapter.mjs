// A corpus line is "s|t"; the page takes lowercase words up to 12 letters.
export const input = (c) => { const [s, t] = c.split('|'); return s.length <= 12 && t.length <= 12 ? { s, t } : null; };
export const answer = (s) => String(s.verdict);
