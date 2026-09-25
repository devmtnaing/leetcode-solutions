// A corpus line is "coins|amount"; the stage takes amounts up to 11.
export const input = (c) => { const [a, b] = c.split('|'); const amount = Number(b); return amount <= 11 ? { coins: a.split(',').map(Number), amount } : null; };
export const answer = (s) => (s.finished ? String(s.result) : 'NOT FINISHED');
