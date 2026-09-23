/* Binary trees for lessons whose input is a LeetCode tree.
 *
 * A tree is { root, val, kids }: every node has a key (its position among the
 * non-null values of the input), `val` maps key → value, and `kids` maps
 * key → [left, right] keys, null for a missing child. Keeping shape separate
 * from values means a step generator can change the shape and snapshot it with
 * copyKids() — a snapshot that shared `kids` would draw the final tree on
 * every frame.
 */

/** "[4,2,7,null,3]" (brackets optional) → [4, 2, 7, null, 3]. */
export function parseLevelOrder(text) {
  const s = text.trim().replace(/^\[|\]$/g, '').trim();
  if (!s) return [];
  return s.split(',').map((x) => {
    const v = x.trim();
    if (v === 'null') return null;
    const n = Number(v);
    if (v === '' || !Number.isInteger(n)) throw new Error('integers or null, separated by commas');
    return n;
  });
}

/** A control's parse(): level order, capped so the tree still fits the stage. */
export const treeInput = (maxNodes) => (text) => {
  const level = parseLevelOrder(text);
  const n = level.filter((v) => v != null).length;
  if (n > maxNodes) throw new Error(`at most ${maxNodes} nodes, so the tree fits the stage`);
  if (level.length && level[0] == null && n) throw new Error('a tree cannot start with null');
  return level;
};

/** A control's format(): the level-order array back as text. */
export const formatLevelOrder = (level) => level.map((v) => (v == null ? 'null' : v)).join(', ');

/* LeetCode's level order: a node's children follow it, left then right; a
 * null has no children of its own. */
export function buildTree(level) {
  const val = {};
  const kids = {};
  if (!level.length || level[0] == null) return { root: null, val, kids };
  let key = 0;
  const make = (v) => { const id = key++; val[id] = v; kids[id] = [null, null]; return id; };
  const root = make(level[0]);
  const q = [root];
  let i = 1;
  while (q.length && i < level.length) {
    const p = q.shift();
    for (const side of [0, 1]) {
      if (i >= level.length) break;
      const v = level[i++];
      if (v != null) { const ch = make(v); kids[p][side] = ch; q.push(ch); }
    }
  }
  return { root, val, kids };
}

/** The tree back in LeetCode's format, trailing nulls trimmed — what the judge
 * prints. Each slot keeps its key, so a lesson can highlight it. */
export function levelOrder({ root, val }, kids) {
  const out = [];
  const q = [root];
  while (q.length) {
    const key = q.shift();
    if (key == null) { out.push({ key: null, v: null }); continue; }
    out.push({ key, v: val[key] });
    q.push(kids[key][0], kids[key][1]);
  }
  while (out.length && out[out.length - 1].key == null) out.pop();
  return out;
}

/** The nested { value, left, right } shape stage.tree() draws. */
export const asNested = (key, val, kids) => (key == null ? null
  : { key, value: val[key], left: asNested(kids[key][0], val, kids), right: asNested(kids[key][1], val, kids) });

/** stage.tree() numbers nodes in pre-order; this maps keys onto those ids. */
export function preorderKeys(key, kids, out = []) {
  if (key == null) return out;
  out.push(key);
  preorderKeys(kids[key][0], kids, out);
  preorderKeys(kids[key][1], kids, out);
  return out;
}

/** Number of levels below and including `key`; 0 for an empty tree. */
export const treeDepth = (key, kids) => (key == null ? 0
  : 1 + Math.max(treeDepth(kids[key][0], kids), treeDepth(kids[key][1], kids)));

export const copyKids = (kids) => Object.fromEntries(Object.entries(kids).map(([k, v]) => [k, [...v]]));

/** A node's value as text, or "null". */
export const nameOf = (key, val) => (key == null ? 'null' : String(val[key]));
