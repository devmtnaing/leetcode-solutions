// A corpus line is n; the plain recursion stays steppable up to 10.
export const input = (c) => { const n = Number(c); return n <= 10 ? { n } : null; };
export const answer = (s) => (s.finished ? String(s.answer) : 'NOT FINISHED');
