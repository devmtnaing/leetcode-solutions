// A corpus line is the expression; the stage takes up to 24 characters.
export const input = (c) => (c.length <= 24 ? { s: c } : null);
export const answer = (s) => (s.finished ? String(s.answer) : 'NOT FINISHED');
