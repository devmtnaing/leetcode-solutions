// A corpus line is the grid, rows split by ";"; the stage takes up to 6 × 7.
export const input = (c) => { const grid = c.split(';'); return grid.length <= 6 && grid[0].length <= 7 ? { grid } : null; };
export const answer = (s) => (s.finished ? String(s.count) : 'NOT FINISHED');
