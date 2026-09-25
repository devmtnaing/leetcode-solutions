/* Lowest Common Ancestor of a Binary Tree — LeetCode 236.
 *
 * Nodes do not know their parents, so the direct approach gives them one:
 * walk down until both p and q have been reached, noting each child's
 * parent, then climb from p marking every ancestor, and climb from q until
 * the first marked one. The recursion needs no map: each call reports
 * whether it found p or q below it, and the first node that hears "found"
 * from both sides is the answer.
 */
import { mountLesson } from '../../lib/stepper.js';
import { pick, onLangChange } from '../../lib/i18n.js';
import { cells, tree, stack, readout, slots, stagePanel, panels } from '../../lib/stage.js';
import { t, exampleTitle, LANGUAGES, k, c, stageGap } from '../../lib/kit.js';
import { buildTree, levelOrder, asNested, preorderKeys, nameOf, treeInput, formatLevelOrder } from '../../lib/tree.js';

const EX = [3, 5, 1, 6, 2, 0, 8, null, null, 7, 4];

/* The statement's promises, checked before building steps: unique values,
 * p ≠ q, and both in the tree. Returns the keys of p and q. */
function locate(T, p, q) {
  const vals = Object.values(T.val);
  if (!vals.length) throw new Error('the tree needs at least two nodes');
  if (new Set(vals).size !== vals.length) throw new Error('node values must be unique');
  if (p === q) throw new Error('p and q must be different nodes');
  const keyOf = (v) => Number(Object.keys(T.val).find((key) => T.val[key] === v));
  if (!vals.includes(p)) throw new Error(`p = ${p} is not in the tree`);
  if (!vals.includes(q)) throw new Error(`q = ${q} is not in the tree`);
  return [keyOf(p), keyOf(q)];
}

/* ---------------- step generators ---------------- */

function buildParents({ level, p, q }) {
  const T = buildTree(level);
  const [pk, qk] = locate(T, p, q);
  const name = (key) => nameOf(key, T.val);
  const steps = [];
  const parent = { [T.root]: null };
  const stackK = [T.root];
  let ancestors = [];
  const snap = (extra) => ({ view: 'parents', parent: { ...parent }, stack: [...stackK], ancestors: [...ancestors], cur: null, ...extra });

  steps.push(snap({ line: 'init', tag: t('root', 'root'),
    note: t(`Nodes do not know their parents, so record them. <code>parent</code> starts with the root (${name(T.root)}), which has none.`,
            `node များသည် ၎င်းတို့၏ parent ကို မသိသဖြင့် မှတ်ထားသည်။ <code>parent</code> ကို parent မရှိသော root (${name(T.root)}) ဖြင့် စသည်။`) }));
  for (;;) {
    const both = pk in parent && qk in parent;
    if (both) {
      steps.push(snap({ line: 'walk', tag: t('both reached', 'နှစ်ခုလုံး ရောက်'),
        note: t(`p (${p}) and q (${q}) both have a parent on record. Stop walking — the rest of the tree does not matter.`,
                `p (${p}) နှင့် q (${q}) နှစ်ခုလုံး parent မှတ်တမ်း ရှိပြီ။ လျှောက်ခြင်း ရပ်သည် — tree ၏ ကျန်အပိုင်း အရေးမကြီးပါ။`) }));
      break;
    }
    const node = stackK.pop();
    steps.push(snap({ cur: node, line: 'walk', tag: t(`visit ${name(node)}`, `${name(node)} သို့`),
      note: t(`Not both reached yet. Take ${name(node)} off the stack.`, `နှစ်ခုလုံး မရောက်သေး။ stack မှ ${name(node)} ကို ယူသည်။`) }));
    for (const child of T.kids[node]) {
      if (child == null) continue;
      parent[child] = node;
      stackK.push(child);
      steps.push(snap({ cur: child, line: 'link', tag: t(`${name(child)} → ${name(node)}`, `${name(child)} → ${name(node)}`),
        note: t(`The parent of ${name(child)} is ${name(node)}${child === pk ? ' — that is p' : child === qk ? ' — that is q' : ''}.`,
                `${name(child)} ၏ parent မှာ ${name(node)}${child === pk ? ' — ၎င်းသည် p' : child === qk ? ' — ၎င်းသည် q' : ''}။`) }));
    }
  }
  steps.push(snap({ line: 'mark', tag: t('ancestors of p', 'p ၏ ancestor'),
    note: t('Now climb from p to the root, marking every node on the way — p itself included, since a node counts as its own descendant.',
            'ယခု p မှ root အထိ တက်ပြီး လမ်းတစ်လျှောက် node တိုင်းကို မှတ်သည် — node တစ်ခုသည် ၎င်းကိုယ်တိုင်၏ descendant ဖြစ်သဖြင့် p ကိုယ်တိုင် ပါသည်။') }));
  for (let node = pk; node != null; node = parent[node]) {
    ancestors = [...ancestors, node];
    steps.push(snap({ cur: node, line: 'up', tag: t(`mark ${name(node)}`, `${name(node)} မှတ်`),
      note: t(`Mark ${name(node)}.`, `${name(node)} ကို မှတ်သည်။`) }));
  }
  let node = qk;
  const marked = new Set(ancestors);
  for (;;) {
    const hit = marked.has(node);
    steps.push(snap({ cur: node, hit, line: 'meet', tag: hit ? t('marked', 'မှတ်ပြီး') : t('not marked', 'မမှတ်ရ'),
      note: hit
        ? t(`${name(node)} is marked: it is an ancestor of both. The first one met climbing from q is the lowest.`,
            `${name(node)} ကို မှတ်ထားသည် — နှစ်ခုလုံး၏ ancestor ဖြစ်သည်။ q မှ တက်ရင်း ပထမဆုံး တွေ့သည့်တစ်ခုသည် အနိမ့်ဆုံး ဖြစ်သည်။`)
        : t(`${name(node)} is on q's path but not p's: climb to its parent, ${name(parent[node])}.`,
            `${name(node)} သည် q ၏ လမ်းကြောင်းပေါ်တွင် ရှိသော်လည်း p ၏ ပေါ်တွင် မရှိ — ၎င်း၏ parent ${name(parent[node])} သို့ တက်သည်။`) }));
    if (hit) break;
    node = parent[node];
  }
  steps.push(snap({ cur: node, finished: true, answer: T.val[node], answerKey: node, line: 'ret', tag: t(`return ${name(node)}`, `${name(node)} ပြန်`),
    note: t(`Return <b>${name(node)}</b>.`, `<b>${name(node)}</b> ကို ပြန်ပေးသည်။`) }));
  return steps;
}

function buildRecurse({ level, p, q }) {
  const T = buildTree(level);
  const [pk, qk] = locate(T, p, q);
  const name = (key) => nameOf(key, T.val);
  const steps = [];
  const frames = [];
  const reported = {};        // key → what that call returned (a key, or null)
  const snap = (extra) => ({ view: 'recurse', frames: frames.map((f) => ({ ...f })), reported: { ...reported }, cur: null, ...extra });
  const said = (r) => (r == null ? 'null' : name(r));

  function lca(key) {
    frames.push({ key });
    if (key == null || key === pk || key === qk) {
      steps.push(snap({ cur: key, line: 'base', tag: key == null ? t('null', 'null') : t(`found ${name(key)}`, `${name(key)} တွေ့`),
        note: key == null
          ? t('An empty subtree: neither p nor q is here. Return null.', 'subtree ဗလာ — p ရော q ရော မရှိ။ null ကို ပြန်ပေးသည်။')
          : t(`This is ${key === pk ? 'p' : 'q'} (${name(key)}). Return it without looking below — if the other one is underneath, this node is their ancestor anyway.`,
              `ဤသည် ${key === pk ? 'p' : 'q'} (${name(key)}) ဖြစ်သည်။ အောက်ကို မကြည့်ဘဲ ပြန်ပေးသည် — ကျန်တစ်ခု အောက်တွင် ရှိလျှင်လည်း ဤ node သည် ၎င်းတို့၏ ancestor ဖြစ်နေသည်။`) }));
      frames.pop();
      if (key != null) reported[key] = key;
      return key;
    }
    steps.push(snap({ cur: key, line: 'base', tag: t(`at ${name(key)}`, `${name(key)} တွင်`),
      note: t(`${name(key)} is neither p nor q. Ask both subtrees.`, `${name(key)} သည် p လည်း မဟုတ်၊ q လည်း မဟုတ်။ subtree နှစ်ခုလုံးကို မေးသည်။`) }));
    const [lk, rk] = T.kids[key];
    const left = lca(lk);
    frames.at(-1).left = left;
    steps.push(snap({ cur: key, line: 'recl', tag: t(`left: ${said(left)}`, `ဘယ်: ${said(left)}`),
      note: t(`Back at ${name(key)}: the left subtree answered ${said(left)}.`, `${name(key)} သို့ ပြန်ရောက် — ဘယ် subtree က ${said(left)} ဟု ဖြေသည်။`) }));
    const right = lca(rk);
    frames.at(-1).right = right;
    steps.push(snap({ cur: key, line: 'recr', tag: t(`right: ${said(right)}`, `ညာ: ${said(right)}`),
      note: t(`And the right subtree answered ${said(right)}.`, `ညာ subtree က ${said(right)} ဟု ဖြေသည်။`) }));
    if (left != null && right != null) {
      reported[key] = key;
      steps.push(snap({ cur: key, split: true, line: 'split', tag: t('both sides', 'နှစ်ဘက်လုံး'),
        note: t(`One of p, q is on each side, so ${name(key)} is where their paths split — the lowest common ancestor. Return it.`,
                `p၊ q တစ်ခုစီသည် တစ်ဘက်စီတွင် ရှိသဖြင့် ${name(key)} သည် ၎င်းတို့၏ လမ်းကြောင်း ခွဲရာ — lowest common ancestor ဖြစ်သည်။ ၎င်းကို ပြန်ပေးသည်။`) }));
      frames.pop();
      return key;
    }
    const up = left ?? right;
    if (up != null) reported[key] = up;
    steps.push(snap({ cur: key, line: 'pass', tag: t(`pass up ${said(up)}`, `${said(up)} အပေါ်ပို့`),
      note: up == null
        ? t(`Nothing below ${name(key)}. Return null.`, `${name(key)} အောက်တွင် ဘာမျှ မရှိ။ null ကို ပြန်ပေးသည်။`)
        : t(`Only one side found something: pass ${said(up)} up unchanged.`, `တစ်ဘက်တည်းက တစ်ခုခု တွေ့သည် — ${said(up)} ကို မပြောင်းဘဲ အပေါ်သို့ ပို့သည်။`) }));
    frames.pop();
    return up;
  }
  const ans = lca(T.root);
  steps.push(snap({ cur: ans, finished: true, answer: T.val[ans], answerKey: ans, line: 'pass', tag: t(`answer ${name(ans)}`, `အဖြေ ${name(ans)}`),
    note: t(`The root's call returned <b>${name(ans)}</b>: the lowest common ancestor.`, `root ၏ call က <b>${name(ans)}</b> ကို ပြန်ပေးသည် — lowest common ancestor။`) }));
  return steps;
}

/* ---------------- drawing ----------------
 *
 * The strip is the tree in LeetCode's level order. The stage draws the tree:
 * p and q carry badges; for the parent map, recorded nodes turn green and
 * p's marked ancestors amber; for the recursion, a badge shows what each
 * call reported back up. */

function strip(s, { level, p, q }) {
  const T = buildTree(level);
  const order = levelOrder(T, T.kids);
  const tone = {};
  const marks = {};
  order.forEach((x, i) => {
    if (x.key == null) { tone[i] = 'done'; return; }
    if (x.key === s.cur) tone[i] = 'inwin';
    else if (s.finished && x.key === s.answerKey) tone[i] = 'entering';
    if (x.v === p) marks[i] = 'p';
    if (x.v === q) marks[i] = 'q';
  });
  return cells(order.map((x) => (x.key == null ? 'null' : x.v)), { tone, marks, index: false });
}

function picture(s, T, p, q) {
  const ids = preorderKeys(T.root, T.kids);
  const id = (key) => ids.indexOf(key);
  const tone = {};
  const badges = {};
  for (const [key, v] of Object.entries(T.val)) {
    if (v === p) badges[id(Number(key))] = 'p';
    if (v === q) badges[id(Number(key))] = badges[id(Number(key))] ? `${badges[id(Number(key))]} q` : 'q';
  }
  if (s.view === 'parents') {
    for (const key of Object.keys(s.parent)) tone[id(Number(key))] = 'done';
    for (const key of s.ancestors) tone[id(key)] = 'warn';
  } else {
    for (const [key, r] of Object.entries(s.reported)) {
      tone[id(Number(key))] = 'done';
      if (r !== Number(key)) badges[id(Number(key))] = `→${T.val[r]}`;
    }
    for (const f of s.frames) if (f.key != null && !(f.key in s.reported)) tone[id(f.key)] = 'warn';
  }
  if (s.finished) tone[id(s.answerKey)] = 'done';
  return tree(asNested(T.root, T.val, T.kids), { at: s.cur != null ? id(s.cur) : null, tone, badges });
}

function draw(s, { level, p, q }) {
  const T = buildTree(level);
  const name = (key) => nameOf(key, T.val);
  if (s.view === 'parents') {
    const known = Object.keys(s.parent).length;
    return stagePanel(pick(t(`The tree — ${known} of ${Object.keys(T.val).length} parents recorded`, `tree — parent ${Object.keys(T.val).length} ခုအနက် ${known} ခု မှတ်ပြီး`)),
      pick(t('green: recorded · amber: ancestor of p', 'အစိမ်း: မှတ်ပြီး · ဝါ: p ၏ ancestor')),
      panels(picture(s, T, p, q), stack(s.stack.map(name), { label: 'stack' }))
        + stageGap + readout({ ancestors: s.ancestors.length ? s.ancestors.map(name).join(' → ') : '—' }));
  }
  const frames = s.frames.map((f) => `lca(${name(f.key)})${f.left !== undefined ? ` · left ${f.left == null ? 'null' : name(f.left)}` : ''}`);
  return stagePanel(pick(t(`The tree — ${s.frames.length} calls deep`, `tree — call ${s.frames.length} ဆင့် နက်`)),
    pick(t('amber: waiting · badge: what it reported', 'ဝါ: စောင့်နေ · badge: ပြန်ပို့ခဲ့သည့်အရာ')),
    panels(picture(s, T, p, q), stack(frames, { label: 'call stack' })));
}

function answer(s) {
  return {
    html: slots(s.finished ? [s.answer] : [], { total: 1, just: s.finished ? 0 : -1 }),
    note: s.finished ? t('the lowest common ancestor', 'lowest common ancestor') : t('one node', 'node တစ်ခု'),
  };
}

function vars(s, { level, p, q }) {
  const T = buildTree(level);
  const name = (key) => nameOf(key, T.val);
  const base = [['p', p], ['q', q]];
  if (s.view === 'parents') {
    return [...base, ['root', name(T.root)], ['node', s.cur == null ? '—' : name(s.cur)],
            ['parent', `{${Object.entries(s.parent).map(([key, v]) => `${name(Number(key))}: ${v == null ? 'null' : name(v)}`).join(', ')}}`],
            ['stack', `[${s.stack.map(name).join(', ')}]`], ['ancestors', `{${s.ancestors.map(name).join(', ')}}`]];
  }
  const top = s.frames.at(-1);
  return [...base, ['root', s.cur == null ? 'null' : name(s.cur)],
          ['left', top?.left === undefined ? '—' : top.left == null ? 'null' : name(top.left)],
          ['right', top?.right === undefined ? '—' : top.right == null ? 'null' : name(top.right)]];
}

/* ---------------- the code, one key per line ----------------
 *
 * Generated from the verified solution files, so the listing a reader copies
 * is byte-identical to the one that ran. */

const CODE = {
  parents: {
    ruby: [
      [null, `${k('def')} lowest_common_ancestor(root, p, q)`],
      ['init', `  parent = { root =&gt; ${k('nil')} }`],
      [null, `  stack = [root]`],
      ['walk', `  ${k('until')} parent.key?(p) &amp;&amp; parent.key?(q)`],
      [null, `    node = stack.pop`],
      [null, `    [node.left, node.right].compact.each ${k('do')} |child|`],
      ['link', `      parent[child] = node`],
      [null, `      stack &lt;&lt; child`],
      [null, `    ${k('end')}`],
      [null, `  ${k('end')}`],
      ['mark', `  ancestors = {}`],
      [null, `  node = p`],
      [null, `  ${k('while')} node`],
      ['up', `    ancestors[node] = true`],
      [null, `    node = parent[node]`],
      [null, `  ${k('end')}`],
      [null, `  node = q`],
      ['meet', `  node = parent[node] ${k('until')} ancestors.key?(node)`],
      ['ret', `  node`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} lowestCommonAncestor(self, root, p, q):`],
      ['init', `        parent = {root: ${k('None')}}`],
      [null, `        stack = [root]`],
      ['walk', `        ${k('while')} p ${k('not')} ${k('in')} parent or q ${k('not')} ${k('in')} parent:`],
      [null, `            node = stack.pop()`],
      [null, `            ${k('for')} child ${k('in')} (node.left, node.right):`],
      [null, `                ${k('if')} child:`],
      ['link', `                    parent[child] = node`],
      [null, `                    stack.append(child)`],
      ['mark', `        ancestors = set()`],
      [null, `        node = p`],
      [null, `        ${k('while')} node:`],
      ['up', `            ancestors.add(node)`],
      [null, `            node = parent[node]`],
      [null, `        node = q`],
      ['meet', `        ${k('while')} node ${k('not')} ${k('in')} ancestors:`],
      [null, `            node = parent[node]`],
      ['ret', `        ${k('return')} node`],
    ],
    javascript: [
      [null, `${k('const')} lowestCommonAncestor = ${k('function')} (root, p, q) {`],
      ['init', `  ${k('const')} parent = ${k('new')} Map([[root, ${k('null')}]]);`],
      [null, `  ${k('const')} stack = [root];`],
      ['walk', `  ${k('while')} (!parent.has(p) || !parent.has(q)) {`],
      [null, `    ${k('const')} node = stack.pop();`],
      [null, `    ${k('for')} (${k('const')} child ${k('of')} [node.left, node.right]) {`],
      [null, `      ${k('if')} (!child) continue;`],
      ['link', `      parent.set(child, node);`],
      [null, `      stack.push(child);`],
      [null, `    }`],
      [null, `  }`],
      ['mark', `  ${k('const')} ancestors = ${k('new')} Set();`],
      [null, `  ${k('for')} (${k('let')} node = p; node; node = parent.get(node)) {`],
      ['up', `    ancestors.add(node);`],
      [null, `  }`],
      [null, `  ${k('let')} node = q;`],
      ['meet', `  ${k('while')} (!ancestors.has(node)) node = parent.get(node);`],
      ['ret', `  ${k('return')} node;`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} lowestCommonAncestor(root, p, q *TreeNode) *TreeNode {`],
      ['init', `    parent := map[*TreeNode]*TreeNode{root: ${k('nil')}}`],
      [null, `    stack := []*TreeNode{root}`],
      ['walk', `    ${k('for')} {`],
      [null, `        _, hasP := parent[p]`],
      [null, `        _, hasQ := parent[q]`],
      [null, `        ${k('if')} hasP &amp;&amp; hasQ {`],
      [null, `            break`],
      [null, `        }`],
      [null, `        node := stack[len(stack)-1]`],
      [null, `        stack = stack[:len(stack)-1]`],
      [null, `        ${k('for')} _, child := ${k('range')} []*TreeNode{node.Left, node.Right} {`],
      [null, `            ${k('if')} child != ${k('nil')} {`],
      ['link', `                parent[child] = node`],
      [null, `                stack = append(stack, child)`],
      [null, `            }`],
      [null, `        }`],
      [null, `    }`],
      ['mark', `    ancestors := map[*TreeNode]bool{}`],
      [null, `    ${k('for')} node := p; node != ${k('nil')}; node = parent[node] {`],
      ['up', `        ancestors[node] = true`],
      [null, `    }`],
      [null, `    node := q`],
      ['meet', `    ${k('for')} !ancestors[node] {`],
      [null, `        node = parent[node]`],
      [null, `    }`],
      ['ret', `    ${k('return')} node`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('use')} std::cell::RefCell;`],
      [null, `${k('use')} std::collections::{HashMap, HashSet};`],
      [null, `${k('use')} std::rc::Rc;`],
      [null, ``],
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} lowest_common_ancestor(`],
      [null, `        root: Option&lt;Rc&lt;RefCell&lt;TreeNode&gt;&gt;&gt;,`],
      [null, `        p: Option&lt;Rc&lt;RefCell&lt;TreeNode&gt;&gt;&gt;,`],
      [null, `        q: Option&lt;Rc&lt;RefCell&lt;TreeNode&gt;&gt;&gt;,`],
      [null, `    ) -&gt; Option&lt;Rc&lt;RefCell&lt;TreeNode&gt;&gt;&gt; {`],
      [null, `        ${c('// values are unique, so a value can stand in for its node')}`],
      [null, `        ${k('let')} (root, p, q) = (root?, p?.borrow().val, q?.borrow().val);`],
      ['init', `        ${k('let')} ${k('mut')} parent: HashMap&lt;i32, Option&lt;i32&gt;&gt; = HashMap::new();`],
      [null, `        ${k('let')} ${k('mut')} nodes = HashMap::new();`],
      [null, `        parent.insert(root.borrow().val, ${k('None')});`],
      [null, `        nodes.insert(root.borrow().val, root.clone());`],
      [null, `        ${k('let')} ${k('mut')} stack = vec![root];`],
      ['walk', `        ${k('while')} !parent.contains_key(&amp;p) || !parent.contains_key(&amp;q) {`],
      [null, `            ${k('let')} node = stack.pop().unwrap();`],
      [null, `            ${k('let')} node = node.borrow();`],
      [null, `            ${k('for')} child ${k('in')} [node.left.clone(), node.right.clone()].iter().flatten() {`],
      ['link', `                parent.insert(child.borrow().val, ${k('Some')}(node.val));`],
      [null, `                nodes.insert(child.borrow().val, child.clone());`],
      [null, `                stack.push(child.clone());`],
      [null, `            }`],
      [null, `        }`],
      ['mark', `        ${k('let')} ${k('mut')} ancestors = HashSet::new();`],
      [null, `        ${k('let')} ${k('mut')} node = ${k('Some')}(p);`],
      [null, `        ${k('while')} ${k('let')} ${k('Some')}(v) = node {`],
      ['up', `            ancestors.insert(v);`],
      [null, `            node = parent[&amp;v];`],
      [null, `        }`],
      [null, `        ${k('let')} ${k('mut')} v = q;`],
      ['meet', `        ${k('while')} !ancestors.contains(&amp;v) {`],
      [null, `            v = parent[&amp;v].unwrap();`],
      [null, `        }`],
      ['ret', `        ${k('Some')}(nodes[&amp;v].clone())`],
      [null, `    }`],
      [null, `}`],
    ],
  },
  recurse: {
    ruby: [
      [null, `${k('def')} lowest_common_ancestor(root, p, q)`],
      ['base', `  ${k('return')} root ${k('if')} root.nil? || root == p || root == q`],
      ['recl', `  left = lowest_common_ancestor(root.left, p, q)`],
      ['recr', `  right = lowest_common_ancestor(root.right, p, q)`],
      ['split', `  ${k('return')} root ${k('if')} left &amp;&amp; right`],
      ['pass', `  left || right`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('import')} sys`],
      [null, `sys.setrecursionlimit(200_000)            ${c('# 10^5 levels deep; the default is 1,000')}`],
      [null, ``],
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} lowestCommonAncestor(self, root, p, q):`],
      ['base', `        ${k('if')} root ${k('is')} ${k('None')} or root ${k('is')} p or root ${k('is')} q:`],
      [null, `            ${k('return')} root`],
      ['recl', `        left = self.lowestCommonAncestor(root.left, p, q)`],
      ['recr', `        right = self.lowestCommonAncestor(root.right, p, q)`],
      ['split', `        ${k('if')} left and right:`],
      [null, `            ${k('return')} root`],
      ['pass', `        ${k('return')} left or right`],
    ],
    javascript: [
      [null, `${k('const')} lowestCommonAncestor = ${k('function')} (root, p, q) {`],
      ['base', `  ${k('if')} (root === ${k('null')} || root === p || root === q) ${k('return')} root;`],
      ['recl', `  ${k('const')} left = lowestCommonAncestor(root.left, p, q);`],
      ['recr', `  ${k('const')} right = lowestCommonAncestor(root.right, p, q);`],
      ['split', `  ${k('if')} (left &amp;&amp; right) ${k('return')} root;`],
      ['pass', `  ${k('return')} left || right;`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} lowestCommonAncestor(root, p, q *TreeNode) *TreeNode {`],
      ['base', `    ${k('if')} root == ${k('nil')} || root == p || root == q {`],
      [null, `        ${k('return')} root`],
      [null, `    }`],
      ['recl', `    left := lowestCommonAncestor(root.Left, p, q)`],
      ['recr', `    right := lowestCommonAncestor(root.Right, p, q)`],
      ['split', `    ${k('if')} left != ${k('nil')} &amp;&amp; right != ${k('nil')} {`],
      [null, `        ${k('return')} root`],
      [null, `    }`],
      ['pass', `    ${k('if')} left != ${k('nil')} {`],
      [null, `        ${k('return')} left`],
      [null, `    }`],
      [null, `    ${k('return')} right`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('use')} std::cell::RefCell;`],
      [null, `${k('use')} std::rc::Rc;`],
      [null, ``],
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} lowest_common_ancestor(`],
      [null, `        root: Option&lt;Rc&lt;RefCell&lt;TreeNode&gt;&gt;&gt;,`],
      [null, `        p: Option&lt;Rc&lt;RefCell&lt;TreeNode&gt;&gt;&gt;,`],
      [null, `        q: Option&lt;Rc&lt;RefCell&lt;TreeNode&gt;&gt;&gt;,`],
      [null, `    ) -&gt; Option&lt;Rc&lt;RefCell&lt;TreeNode&gt;&gt;&gt; {`],
      [null, `        ${k('let')} node = root?;`],
      [null, `        ${k('let')} v = node.borrow().val;`],
      ['base', `        ${k('if')} ${k('Some')}(v) == p.as_ref().map(|n| n.borrow().val) || ${k('Some')}(v) == q.as_ref().map(|n| n.borrow().val) {`],
      [null, `            ${k('return')} ${k('Some')}(node);`],
      [null, `        }`],
      ['recl', `        ${k('let')} left = ${k('Self')}::lowest_common_ancestor(node.borrow().left.clone(), p.clone(), q.clone());`],
      ['recr', `        ${k('let')} right = ${k('Self')}::lowest_common_ancestor(node.borrow().right.clone(), p, q);`],
      ['split', `        ${k('if')} left.is_some() &amp;&amp; right.is_some() {`],
      [null, `            ${k('return')} ${k('Some')}(node);`],
      [null, `        }`],
      ['pass', `        left.or(right)`],
      [null, `    }`],
      [null, `}`],
    ],
  },
};

/* ---------------- part 1: the "paths from the root" widget ----------------
 *
 * The statement hinges on "the lowest node that has both p and q as
 * descendants, where a node is a descendant of itself". Every node has one
 * path down from the root; the LCA is the last node two paths share. Pick p
 * and q and watch the shared part — including the case where p itself is on
 * q's path, as in example 2.
 *
 * Built from x-sum's widget vocabulary: two rows of clickable .q-arr cells
 * (picked), the stage's tree picture, the amber .q-tie line and the .ledger. */

function mountPathsWidget(host) {
  const T = buildTree(EX);
  const keys = Object.keys(T.val).map(Number);
  const keyOf = (v) => keys.find((key) => T.val[key] === v);
  const parentOf = {};
  for (const key of keys) for (const ch of T.kids[key]) if (ch != null) parentOf[ch] = key;
  const pathTo = (key) => { const out = []; for (let x = key; x != null; x = parentOf[x]) out.unshift(x); return out; };
  const state = { p: 5, q: 4, next: 'p' };
  host.innerHTML = `
    <div data-pic></div>
    <div class="q-arr" data-pick-p></div>
    <div class="q-arr" data-pick-q></div>
    <p class="q-tie" data-line></p>
    <div class="ledger">
      <span class="expr" data-expr></span>
      <span class="total" data-total></span>
    </div>`;
  const q = (sel) => host.querySelector(sel);
  function render() {
    const pp = pathTo(keyOf(state.p));
    const qp = pathTo(keyOf(state.q));
    let shared = 0;
    while (shared < pp.length && shared < qp.length && pp[shared] === qp[shared]) shared++;
    const lcaKey = pp[shared - 1];
    const ids = preorderKeys(T.root, T.kids);
    const tone = {};
    const badges = {};
    for (const key of [...pp, ...qp]) tone[ids.indexOf(key)] = 'warn';
    tone[ids.indexOf(lcaKey)] = 'done';
    badges[ids.indexOf(keyOf(state.p))] = 'p';
    badges[ids.indexOf(keyOf(state.q))] = state.p === state.q ? 'p q' : 'q';
    q('[data-pic]').innerHTML = tree(asNested(T.root, T.val, T.kids), { tone, badges });
    const row = (which) => `<span class="q-row-label">${which}</span>${keys.map((key) => {
      const on = T.val[key] === state[which];
      return `<div class="cell${on ? ' picked kept' : ''}" role="button" tabindex="0" data-which="${which}" data-v="${T.val[key]}"><span>${T.val[key]}</span></div>`;
    }).join('')}`;
    q('[data-pick-p]').innerHTML = row('p');
    q('[data-pick-q]').innerHTML = row('q');
    const label = document.getElementById('q-label');
    if (label) label.textContent = pick(t('pick p and q', 'p နှင့် q ကို ရွေးပါ'));
    const name = (key) => T.val[key];
    q('[data-line]').innerHTML = pick(state.p === state.q
      ? t('p and q must be different nodes — pick another.', 'p နှင့် q သည် မတူသော node ဖြစ်ရမည် — နောက်တစ်ခု ရွေးပါ။')
      : lcaKey === keyOf(state.p) || lcaKey === keyOf(state.q)
        ? t(`${name(lcaKey)} is on the other one's path, so it is the answer itself — a node counts as its own descendant.`,
            `${name(lcaKey)} သည် ကျန်တစ်ခု၏ လမ်းကြောင်းပေါ်တွင် ရှိသဖြင့် ၎င်းကိုယ်တိုင် အဖြေ ဖြစ်သည် — node တစ်ခုသည် ၎င်းကိုယ်တိုင်၏ descendant အဖြစ် ရေတွက်သည်။`)
        : t(`The paths share ${pp.slice(0, shared).map(name).join(' → ')} and then split. The last shared node, ${name(lcaKey)}, is the lowest common ancestor.`,
            `လမ်းကြောင်းများသည် ${pp.slice(0, shared).map(name).join(' → ')} ကို မျှပြီး ခွဲသွားသည်။ နောက်ဆုံး မျှသော node ${name(lcaKey)} သည် lowest common ancestor ဖြစ်သည်။`));
    q('[data-expr]').innerHTML = `p: ${pp.map(name).join(' → ')} &nbsp;·&nbsp; q: ${qp.map(name).join(' → ')}`;
    q('[data-total]').innerHTML = `${name(lcaKey)}<small>LCA</small>`;
  }
  function choose(el) { state[el.dataset.which] = Number(el.dataset.v); render(); }
  host.addEventListener('click', (ev) => { const el = ev.target.closest('[data-which]'); if (el) choose(el); });
  host.addEventListener('keydown', (ev) => {
    const el = ev.target.closest('[data-which]');
    if (el && (ev.key === 'Enter' || ev.key === ' ')) { ev.preventDefault(); choose(el); }
  });
  onLangChange(render);
  render();
}

/* ---------------- the approach, in brief ---------------- */

const APPROACH = {
  parents: {
    idea: t('Give every node a way back up. Then p\'s ancestors are a set you can build, and the LCA is the first node on q\'s way up that is in it.',
            'node တိုင်းကို အပေါ်သို့ ပြန်တက်နိုင်သော လမ်း ပေးသည်။ ထို့နောက် p ၏ ancestor များကို set တစ်ခု အဖြစ် တည်ဆောက်နိုင်ပြီး LCA သည် q ၏ အပေါ်တက်လမ်းတွင် ထို set ထဲ ရှိသော ပထမ node ဖြစ်သည်။'),
    steps: [
      t('Walk down with a stack, recording <code>parent[child] = node</code>, until p and q both have a parent recorded.',
        'stack ဖြင့် အောက်သို့ လျှောက်ပြီး p နှင့် q နှစ်ခုလုံး parent မှတ်တမ်း ရှိသည်အထိ <code>parent[child] = node</code> ကို မှတ်သည်။'),
      t('Climb from p to the root, adding each node — p included — to <code>ancestors</code>.',
        'p မှ root အထိ တက်ပြီး node တစ်ခုစီ — p အပါအဝင် — ကို <code>ancestors</code> ထဲ ထည့်သည်။'),
      t('Climb from q until a node is in <code>ancestors</code>; return it.', 'q မှ node တစ်ခု <code>ancestors</code> ထဲ ရှိသည်အထိ တက်ပြီး ၎င်းကို ပြန်ပေးသည်။'),
    ],
    cost: t('every node visited at most once, and a map of up to n parents — but no recursion, so a 10⁵-deep chain is no problem.',
            'node တိုင်းကို အများဆုံး တစ်ကြိမ် ဝင်ပြီး parent n ခုအထိ map တစ်ခု — သို့သော် recursion မပါသဖြင့် 10⁵ ဆင့် နက်သော ကွင်းဆက်လည်း ပြဿနာ မရှိပါ။'),
  },
  recurse: {
    idea: t('Ask each subtree: did you find p or q? A node that hears yes from both sides is where the paths split. A node that is p or q answers yes at once, which also covers p being an ancestor of q.',
            'subtree တစ်ခုစီကို မေးသည် — p သို့မဟုတ် q တွေ့သလား။ နှစ်ဘက်လုံးမှ ဟုတ်ကဲ့ ကြားရသော node သည် လမ်းကြောင်းများ ခွဲရာ ဖြစ်သည်။ p သို့မဟုတ် q ဖြစ်သော node သည် ချက်ချင်း ဟုတ်ကဲ့ ဖြေပြီး p သည် q ၏ ancestor ဖြစ်သည့် case ကိုလည်း ပါဝင်စေသည်။'),
    steps: [
      t('If <code>root</code> is null, p or q, return it.', '<code>root</code> သည် null၊ p သို့မဟုတ် q ဖြစ်လျှင် ၎င်းကို ပြန်ပေးသည်။'),
      t('Recurse into <code>left</code> and <code>right</code>.', '<code>left</code> နှင့် <code>right</code> ထဲ recurse လုပ်သည်။'),
      t('If both are non-null, return <code>root</code>; otherwise return whichever is non-null.', 'နှစ်ခုလုံး null မဟုတ်လျှင် <code>root</code> ကို ပြန်ပေး — မဟုတ်လျှင် null မဟုတ်သည့်တစ်ခုကို ပြန်ပေးသည်။'),
    ],
    cost: t('each node visited once, no map — but the recursion is as deep as the tree, and a chain of 10⁵ nodes overflows the default stack in Ruby, JavaScript and Rust (measured).',
            'node တစ်ခုစီကို တစ်ကြိမ် ဝင်၊ map မလို — သို့သော် recursion သည် tree အနက်အတိုင်း နက်ပြီး node 10⁵ ကွင်းဆက်သည် Ruby၊ JavaScript နှင့် Rust ၏ default stack ကို overflow ဖြစ်စေသည် (တိုင်းတာထားသည်)။'),
  },
};

/* ---------------- mount ---------------- */

const numberInput = (name) => (v) => { const n = Number(v); if (!Number.isInteger(n)) throw new Error(`${name} is a node value`); return n; };

mountLesson({
  input: { level: EX, p: 5, q: 1 },
  controls: [
    { key: 'level', label: 'root', value: formatLevelOrder(EX), parse: treeInput(15), format: formatLevelOrder },
    { key: 'p', label: 'p', type: 'number', value: 5, parse: numberInput('p') },
    { key: 'q', label: 'q', type: 'number', value: 1, parse: numberInput('q') },
  ],
  presets: [
    { label: exampleTitle(1), input: { level: EX, p: 5, q: 1 } },
    { label: exampleTitle(2), input: { level: EX, p: 5, q: 4 } },
    { label: exampleTitle(3), input: { level: [1, 2], p: 1, q: 2 } },
    { label: t('Deep cousins', 'ဝေးသော ဝမ်းကွဲ'), input: { level: EX, p: 7, q: 6 } },
  ],
  examples: [
    { title: exampleTitle(1), inputHtml: '<code>root = [3,5,1,6,2,0,8,null,null,7,4]</code>, <code>p = 5</code>, <code>q = 1</code>', output: '3',
      why: [t('5 and 1 are the root\'s two children, so their paths split at the root.', '5 နှင့် 1 သည် root ၏ ကလေးနှစ်ခု ဖြစ်သဖြင့် ၎င်းတို့၏ လမ်းကြောင်းများ root တွင် ခွဲသည်။')],
      load: { level: EX, p: 5, q: 1 } },
    { title: exampleTitle(2), inputHtml: '<code>root = [3,5,1,6,2,0,8,null,null,7,4]</code>, <code>p = 5</code>, <code>q = 4</code>', output: '5',
      why: [t('4 is below 5, and a node counts as its own descendant, so 5 is the answer.', '4 သည် 5 ၏ အောက်တွင် ရှိပြီး node တစ်ခုသည် ၎င်းကိုယ်တိုင်၏ descendant ဖြစ်သဖြင့် 5 သည် အဖြေ ဖြစ်သည်။')],
      load: { level: EX, p: 5, q: 4 } },
    { title: exampleTitle(3), inputHtml: '<code>root = [1,2]</code>, <code>p = 1</code>, <code>q = 2</code>', output: '1',
      why: [t('The root is p, and q hangs under it.', 'root သည် p ဖြစ်ပြီး q သည် ၎င်းအောက်တွင် ရှိသည်။')],
      load: { level: [1, 2], p: 1, q: 2 } },
  ],
  modes: [
    { id: 'parents', name: 'Parent pointers',
      sub: t('no recursion', 'recursion မပါ'),
      desc: t('Record parents, mark p\'s ancestors, climb from q.', 'parent များ မှတ်၊ p ၏ ancestor များ မှတ်၊ q မှ တက်။'),
      cost: 'O(n) time · O(n) space', build: buildParents },
    { id: 'recurse', name: 'Recursion',
      desc: t('Each subtree reports p or q; both sides at once means here.', 'subtree တစ်ခုစီက p သို့မဟုတ် q ကို ပြန်ပို့ — နှစ်ဘက်လုံးဆိုလျှင် ဤနေရာ။'),
      cost: 'O(n) time · O(h) stack', build: buildRecurse },
  ],
  languages: LANGUAGES,
  code: CODE,
  solutions: {
    parents: { approach: APPROACH.parents,
      desc: t('A parent map built with an explicit stack, then two climbs. More memory than the recursion, and no stack to overflow at any depth.',
              'explicit stack ဖြင့် တည်ဆောက်ထားသော parent map၊ ပြီးမှ တက်ခြင်း နှစ်ကြိမ်။ recursion ထက် memory ပိုသုံးပြီး မည်သည့်အနက်တွင်မဆို overflow ဖြစ်စရာ stack မရှိပါ။') },
    recurse: { approach: APPROACH.recurse,
      desc: t('The classic answer: a handful of lines, no map. Its depth is the tree\'s height, which the constraints allow to reach 10⁵ — see the badges.',
              'ဂန္ထဝင် အဖြေ — စာကြောင်း အနည်းငယ်၊ map မလို။ ၎င်း၏ အနက်သည် tree ၏ အမြင့် ဖြစ်ပြီး ကန့်သတ်ချက်က 10⁵ အထိ ခွင့်ပြုသည် — badge များကို ကြည့်ပါ။') },
  },
  // How each language was actually checked, printed as the part 3 badges.
  // The corpus: the 3 examples, 4 edges, 15,000 random trees of 2–12 nodes,
  // 5,000 of up to 400, a random and a complete tree of 10⁵ nodes, chains of
  // 10⁴ (left and zigzag), and chains of 10⁵ (left and right) — against an
  // oracle that compares root-to-node paths. The recursion ran on all but the
  // two 10⁵ chains, with Ruby and Node given larger stacks; on default stacks,
  // measured cold here, Ruby 3.1 overflows past 7,687 levels, Node 24 past
  // 6,906, and Rust's 8 MB main thread aborts at 10⁵ (fine at 5 × 10⁴).
  // Python (recursion limit raised in the listing) and Go ran a 10⁵ chain.
  // Go and Rust ran in Docker (golang:1.23-alpine, rust:1-slim).
  verification: {
    ruby: { parents: 'ran here · 20,013 cases', recurse: 'ran here · overflows Ruby 3.1\'s default stack past 7,687 deep' },
    python: { parents: 'ran here · 20,013 cases', recurse: 'ran here · 20,011 cases, and a 10⁵-deep chain' },
    javascript: { parents: 'ran here · 20,013 cases', recurse: 'ran here · overflows Node 24\'s default stack past 6,906 deep' },
    go: { parents: 'ran here · 20,013 cases · Go 1.23', recurse: 'ran here · 20,011 cases, and a 10⁵-deep chain · Go 1.23' },
    rust: { parents: 'ran here · 20,013 cases · rustc 1.98', recurse: 'ran here · overflows the default 8 MB stack at 10⁵ deep · rustc 1.98' },
  },
  caveats: {
    recurse: {
      ruby: t('Correct on all 20,011 cases with a larger stack, but on Ruby 3.1\'s default stack it overflows (<code>SystemStackError</code>) on a chain deeper than 7,687 nodes — measured here — and the constraints allow 10⁵.',
              'stack ပိုကြီးလျှင် case 20,011 ခုလုံးတွင် မှန်သည်၊ သို့သော် Ruby 3.1 ၏ default stack ပေါ်တွင် node 7,687 ထက် နက်သော ကွင်းဆက်တွင် overflow (<code>SystemStackError</code>) ဖြစ်သည် — ဤနေရာတွင် တိုင်းတာထားသည် — ကန့်သတ်ချက်က 10⁵ ကို ခွင့်ပြုသည်။'),
      javascript: t('Correct on all 20,011 cases with a larger stack, but on Node 24\'s default stack it overflows (<code>RangeError</code>) on a chain deeper than 6,906 nodes — measured here, cold — and the constraints allow 10⁵.',
                    'stack ပိုကြီးလျှင် case 20,011 ခုလုံးတွင် မှန်သည်၊ သို့သော် Node 24 ၏ default stack ပေါ်တွင် node 6,906 ထက် နက်သော ကွင်းဆက်တွင် overflow (<code>RangeError</code>) ဖြစ်သည် — ဤနေရာတွင် တိုင်းတာထားသည် — ကန့်သတ်ချက်က 10⁵ ကို ခွင့်ပြုသည်။'),
      rust: t('Correct on all 20,011 cases and on a 5 × 10⁴-deep chain, but a 10⁵-deep chain aborts with a stack overflow on the default 8 MB main thread — measured here.',
              'case 20,011 ခုလုံးနှင့် 5 × 10⁴ ဆင့် နက်သော ကွင်းဆက်တွင် မှန်သည်၊ သို့သော် 10⁵ ဆင့် နက်သော ကွင်းဆက်သည် default 8 MB main thread ပေါ်တွင် stack overflow ဖြင့် abort ဖြစ်သည် — ဤနေရာတွင် တိုင်းတာထားသည်။'),
    },
  },
  stripLabel: t('root, in level order', 'root — level order'),
  strip,
  draw,
  answer,
  vars,
  widget: mountPathsWidget,
});
