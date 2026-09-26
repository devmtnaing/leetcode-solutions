import { parseLevelOrder as parse } from '../../src/lib/tree.js';

// A corpus line is a level-order tree; the stage draws up to 15 nodes.
export const input = (c) => { const level = parse(c); return level.filter((v) => v != null).length <= 15 ? { level } : null; };
// Rebuild the keyed tree the way the judge reads level order, then print the
// final step's shape back in the same format.
export const answer = (s, { level }) => {
  if (!s.finished) return 'NOT FINISHED';
  const val = {}; let key = 0; const q = []; let root = null;
  if (level.length && level[0] != null) { root = key++; val[root] = level[0]; q.push(root); }
  let i = 1;
  while (q.length && i < level.length) { q.shift(); for (let side = 0; side < 2 && i < level.length; side++) { const v = level[i++]; if (v != null) { val[key] = v; q.push(key++); } } }
  const out = []; const bq = [root];
  while (bq.length) { const k = bq.shift(); if (k == null) { out.push('null'); continue; } out.push(String(val[k])); bq.push(...s.kids[k]); }
  while (out.length && out[out.length - 1] === 'null') out.pop();
  return out.join(',');
};
