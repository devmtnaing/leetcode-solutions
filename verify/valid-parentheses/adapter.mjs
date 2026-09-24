// A corpus line is the string; the page caps input at 14 characters.
export const input = (c) => (c.length <= 14 ? { s: c } : null);
export const answer = (s) => String(s.verdict);
