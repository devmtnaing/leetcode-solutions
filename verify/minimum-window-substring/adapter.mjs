// A corpus line is "s|t"; the stage takes s up to 16 letters and t up to 6.
export const input = (c) => { const [s, t] = c.split('|'); return s.length <= 16 && t.length <= 6 ? { s, t } : null; };
export const answer = (st, { s }) => {
  if (!st.finished) return 'NOT FINISHED';
  if (st.view === 'brute') return st.best;
  return st.bestLen <= s.length ? s.slice(st.bestLo, st.bestLo + st.bestLen) : '';
};
