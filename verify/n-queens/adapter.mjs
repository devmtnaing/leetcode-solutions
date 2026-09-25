// A corpus line is n; the stage takes n up to 5. The walkthrough's solutions
// are turned into boards and printed the way every driver prints them.
export const input = (c) => (Number(c) <= 5 ? { n: Number(c) } : null);
export const answer = (s) => {
  if (!s.finished) return 'NOT FINISHED';
  const boards = s.out.map((cols) => cols.map((c) => '.'.repeat(c) + 'Q' + '.'.repeat(s.n - c - 1)).join(',')).sort();
  return `${boards.length}|${boards.join(';')}`;
};
