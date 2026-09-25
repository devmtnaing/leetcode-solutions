// A corpus line is the matrix, rows split by ";"; the stage takes up to 5 × 5.
export const input = (c) => { const matrix = c.split(';').map((r) => r.split(',').map(Number)); return matrix.length <= 5 ? { matrix } : null; };
export const answer = (s) => (s.finished ? s.matrix.map((r) => r.join(',')).join(';') : 'NOT FINISHED');
