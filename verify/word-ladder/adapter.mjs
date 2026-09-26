// A corpus line is "beginWord|endWord|w1,w2,…"; the stage takes up to 10 words of up to 5 letters.
export const input = (c) => {
  const [beginWord, endWord, w] = c.split('|');
  const wordList = w.split(',');
  return wordList.length <= 10 && beginWord.length <= 5 ? { beginWord, endWord, wordList } : null;
};
export const answer = (s) => (s.finished ? String(s.answer) : 'NOT FINISHED');
