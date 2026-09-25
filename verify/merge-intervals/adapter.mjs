// A corpus line is "s,e;s,e;…"; the stage takes up to 8 intervals inside 0..20.
export const input = (c) => {
  const intervals = c.split(';').map((p) => p.split(',').map(Number));
  return intervals.length <= 8 && intervals.every(([, e]) => e <= 20) ? { intervals } : null;
};
export const answer = (s) => (s.finished
  ? `[${[...s.result].sort((x, y) => x[0] - y[0] || x[1] - y[1]).map(([a, b]) => `[${a},${b}]`).join(',')}]`
  : 'NOT FINISHED');
