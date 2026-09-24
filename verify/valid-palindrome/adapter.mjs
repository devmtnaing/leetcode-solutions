// A corpus line is the string; the stage shows up to 48 characters.
export const input = (c) => (c.length <= 48 ? { s: c } : null);
export const answer = (s) => String(s.verdict);
