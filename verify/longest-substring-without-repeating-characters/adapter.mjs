// A corpus line is the string itself; the stage shows up to 12 characters.
export const input = (c) => (c.length <= 12 ? { s: c } : null);
export const answer = (s) => (s.finished ? String(s.best) : 'NOT FINISHED');
