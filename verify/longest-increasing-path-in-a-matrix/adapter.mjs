// A corpus line is the matrix, rows split by ";" and values by ","; the stage takes up to 5 × 5 of values up to 999.
export const input = (c) => {
  const matrix = c.split(';').map((r) => r.split(',').map(Number));
  return matrix.length <= 5 && matrix[0].length <= 5 && matrix.every((r) => r.every((v) => v <= 999)) ? { matrix } : null;
};
export const answer = (s) => (s.finished ? String(s.answer) : 'NOT FINISHED');
