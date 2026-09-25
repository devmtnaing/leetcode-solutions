// A corpus line is "k|list;list"; the stage takes up to 6 lists and 14 values.
export const input = (c) => {
  const [k, rest] = c.split('|');
  const lists = k === '0' ? [] : rest.split(';').map((x) => (x ? x.split(',').map(Number) : []));
  return lists.length <= 6 && lists.flat().length <= 14 ? { lists } : null;
};
export const answer = (s) => (s.finished ? s.merged.map((n) => n.v).join(',') : 'NOT FINISHED');
