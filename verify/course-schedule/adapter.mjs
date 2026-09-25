// A corpus line is "numCourses|a,b;a,b"; the stage takes up to 8 courses and 12 pairs.
export const input = (c) => {
  const [n, e] = c.split('|');
  const prerequisites = e ? e.split(';').map((p) => p.split(',').map(Number)) : [];
  return Number(n) <= 8 && prerequisites.length <= 12 ? { numCourses: Number(n), prerequisites } : null;
};
export const answer = (s) => (s.finished ? String(s.verdict) : 'NOT FINISHED');
