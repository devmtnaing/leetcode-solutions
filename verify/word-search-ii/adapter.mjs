// A corpus line is "board|words"; the stage takes boards up to 4 × 4 and up
// to 5 words of up to 6 letters. Found words are sorted, as every driver does.
export const input = (c) => {
  const [b, w] = c.split('|');
  const board = b.split(';'), words = w.split(',');
  const fits = board.length <= 4 && board[0].length <= 4 && words.length <= 5 && words.every((x) => x.length <= 6);
  return fits ? { board, words } : null;
};
export const answer = (s) => (s.finished ? [...s.found].sort().join(',') : 'NOT FINISHED');
