/* Maximum Depth of Binary Tree — LeetCode 104.
 *
 * The recursion asks every node one question — how deep is the tree under
 * you? — and answers it from its children's answers, so the numbers are
 * worked out bottom-up and only arrive at the root last. The breadth-first
 * version never asks a node anything: it counts levels from the top until
 * there are none left. Same answer; the recursion carries the current path on
 * the call stack, the loop carries the current level.
 */
import { mountLesson } from '../../lib/stepper.js';
import { pick, onLangChange } from '../../lib/i18n.js';
import { cells, tree, stack, readout, panels, slots, stagePanel } from '../../lib/stage.js';
import { t, plural, exampleTitle, LANGUAGES, k, c, stageRow, stageGap } from '../../lib/kit.js';
import { buildTree, levelOrder, asNested, preorderKeys, treeDepth, nameOf, treeInput, formatLevelOrder } from '../../lib/tree.js';

const MAX_NODES = 15;

/* ---------------- step generators ---------------- */

function buildDfs({ level }) {
  const T = buildTree(level);
  const { val, kids } = T;
  const steps = [];
  const frames = [];        // { key, left, right } for every call still open, outermost first
  const depthOf = {};       // key → the depth its call returned, once it has
  const snap = (extra) => ({
    view: 'dfs', frames: frames.map((f) => ({ ...f })), depthOf: { ...depthOf }, ...extra,
  });

  function visit(key, from) {
    const frame = { key, left: null, right: null };
    frames.push(frame);
    if (key == null) {
      steps.push(snap({ line: 'base', cur: null, tag: t('null → 0', 'null → 0'),
        note: from == null
          ? t('The tree is empty. No nodes, no levels: return <b>0</b>.', 'tree ဗလာ ဖြစ်သည်။ node မရှိ၊ အဆင့် မရှိ — <b>0</b> ပြန်ပေးသည်။')
          : t(`${from.side === 0 ? 'Left' : 'Right'} of node ${val[from.key]}: nothing there. An empty subtree has depth <b>0</b>.`,
              `node ${val[from.key]} ၏ ${from.side === 0 ? 'ဘယ်' : 'ညာ'}ဘက် — ဘာမျှ မရှိပါ။ ဗလာ subtree ၏ depth မှာ <b>0</b>။`) }));
      frames.pop();
      return 0;
    }
    const [l, r] = kids[key];
    steps.push(snap({ line: 'base', cur: key, tag: t('visit', 'ရောက်'),
      note: t(`Called on node <b>${val[key]}</b>, depth ${frames.length} of the call stack. It is not null, so its answer depends on its children — and they have not been asked yet.`,
              `node <b>${val[key]}</b> ပေါ်တွင် call လုပ်သည် — call stack ၏ အနက် ${frames.length}။ null မဟုတ်သဖြင့် ၎င်း၏ အဖြေသည် ကလေးများပေါ် မူတည်သည် — ၎င်းတို့ကို မမေးရသေးပါ။`) }));

    steps.push(snap({ line: 'recl', cur: key, tag: t('ask left', 'ဘယ်ကို မေး'),
      note: t(`Ask the left subtree (rooted at ${nameOf(l, val)}) how deep it is. Node ${val[key]} waits on the stack for the answer.`,
              `ဘယ်ဘက် subtree (root ${nameOf(l, val)}) ကို မည်မျှ နက်သလဲ မေးသည်။ node ${val[key]} သည် အဖြေအတွက် stack ပေါ်တွင် စောင့်သည်။`) }));
    frame.left = visit(l, { key, side: 0 });

    steps.push(snap({ line: 'recr', cur: key, tag: t('ask right', 'ညာကို မေး'),
      note: t(`The left side said <b>${frame.left}</b>. Now ask the right subtree (rooted at ${nameOf(r, val)}).`,
              `ဘယ်ဘက်က <b>${frame.left}</b> ဟု ဖြေသည်။ ယခု ညာဘက် subtree (root ${nameOf(r, val)}) ကို မေးသည်။`) }));
    frame.right = visit(r, { key, side: 1 });

    const d = 1 + Math.max(frame.left, frame.right);
    depthOf[key] = d;
    steps.push(snap({ line: 'ret', cur: key, answered: key, tag: t(`return ${d}`, `${d} ပြန်`),
      note: frames.length === 1
        ? t(`1 + max(${frame.left}, ${frame.right}) = <b>${d}</b>. This is the root, so that is the whole tree's maximum depth.`,
            `1 + max(${frame.left}, ${frame.right}) = <b>${d}</b>။ ဤသည်မှာ root ဖြစ်သဖြင့် tree တစ်ခုလုံး၏ maximum depth ဖြစ်သည်။`)
        : t(`1 + max(${frame.left}, ${frame.right}) = <b>${d}</b>: node ${val[key]} itself, plus its deeper side. Hand it back to the caller.`,
            `1 + max(${frame.left}, ${frame.right}) = <b>${d}</b> — node ${val[key]} ကိုယ်တိုင်နှင့် ၎င်း၏ ပိုနက်သော ဘက်။ ခေါ်သူထံ ပြန်ပေးသည်။`) }));
    frames.pop();
    return d;
  }

  const answer = visit(T.root, null);
  const last = steps[steps.length - 1];
  last.finished = true;
  last.answer = answer;
  return steps;
}

function buildBfs({ level: input }) {
  const T = buildTree(input);
  const { val, kids, root } = T;
  const steps = [];
  let level = root == null ? [] : [root];
  let depth = 0;
  const seen = [];          // levels already counted
  const snap = (extra) => ({ view: 'bfs', level: [...level], depth, seen: seen.map((l) => [...l]), ...extra });

  steps.push(snap({ line: 'init', tag: t('start', 'စ'),
    note: root == null
      ? t('The tree is empty, so the first level is empty too.', 'tree ဗလာ ဖြစ်သဖြင့် ပထမ အဆင့်လည်း ဗလာ ဖြစ်သည်။')
      : t(`The first level is just the root, <b>${val[root]}</b>. <code>depth</code> counts the levels seen so far: none yet.`,
          `ပထမ အဆင့်တွင် root <b>${val[root]}</b> တစ်ခုတည်း ရှိသည်။ <code>depth</code> သည် ယခုထိ တွေ့ခဲ့သော အဆင့်များကို ရေတွက်သည် — မရှိသေးပါ။`) }));

  while (level.length) {
    steps.push(snap({ line: 'loop', tag: t('a level', 'အဆင့်'),
      note: t(`This level has ${plural(level.length, 'node')}: ${level.map((x) => val[x]).join(', ')}. It is not empty, so the tree goes at least one level deeper than we have counted.`,
              `ဤအဆင့်တွင် node ${level.length} ခု ရှိသည် — ${level.map((x) => val[x]).join(', ')}။ ဗလာ မဟုတ်သဖြင့် tree သည် ရေတွက်ပြီးသမျှထက် အနည်းဆုံး တစ်ဆင့် ပိုနက်သည်။`) }));
    depth += 1;
    steps.push(snap({ line: 'count', tag: t(`depth ${depth}`, `depth ${depth}`),
      note: t(`Count it: <code>depth</code> is now <b>${depth}</b>. Which node is deepest does not matter — only that this level exists.`,
              `ရေတွက်သည် — <code>depth</code> သည် ယခု <b>${depth}</b>။ မည်သည့် node က အနက်ဆုံးလဲ အရေးမကြီးပါ — ဤအဆင့် ရှိကြောင်းသာ အရေးကြီးသည်။`) }));
    const next = level.flatMap((x) => kids[x]).filter((x) => x != null);
    seen.push([...level]);
    const from = level;
    level = next;
    steps.push(snap({ line: 'next', from, tag: t('next level', 'နောက်အဆင့်'),
      note: next.length
        ? t(`Replace the level with all its children, left to right: ${next.map((x) => val[x]).join(', ')}. The old level is dropped — nothing about it is needed again.`,
            `အဆင့်ကို ၎င်း၏ ကလေးအားလုံးဖြင့် ဘယ်မှညာ အစားထိုးသည် — ${next.map((x) => val[x]).join(', ')}။ အဆင့်ဟောင်းကို ပစ်လိုက်သည် — ၎င်းအကြောင်း ထပ်မလိုတော့ပါ။`)
        : t('None of these nodes has a child, so the next level is empty. That was the bottom of the tree.',
            'ဤ node များအနက် မည်သည့်တစ်ခုမျှ ကလေး မရှိသဖြင့် နောက်အဆင့် ဗလာ ဖြစ်သည်။ ၎င်းသည် tree ၏ အောက်ဆုံး ဖြစ်ခဲ့သည်။') }));
  }

  steps.push(snap({ line: 'loop', tag: t('empty', 'ဗလာ'),
    note: t('The level is empty, so the loop stops.', 'အဆင့် ဗလာ ဖြစ်သဖြင့် loop ရပ်သည်။') }));
  steps.push(snap({ line: 'ret', finished: true, answer: depth, tag: t(`return ${depth}`, `${depth} ပြန်`),
    note: depth
      ? t(`Return <b>${depth}</b> — one per level counted. The loop never measured a single path; it only noticed when the levels ran out.`,
          `<b>${depth}</b> ကို ပြန်ပေးသည် — ရေတွက်ခဲ့သော အဆင့်တစ်ခုလျှင် တစ်ခု။ loop သည် လမ်းကြောင်း တစ်ခုမျှ မတိုင်းခဲ့ပါ — အဆင့်များ ကုန်သွားသည်ကိုသာ သတိပြုမိသည်။`)
      : t('Return <b>0</b>: no levels at all.', '<b>0</b> ကို ပြန်ပေးသည် — အဆင့် လုံးဝ မရှိပါ။') }));
  return steps;
}

/* ---------------- drawing ----------------
 *
 * The strip card is the input in LeetCode's level order, with the nodes in
 * play lit. The stage draws the tree beside what the approach holds: the call
 * stack (each finished node wears the depth it returned), or the current
 * level and the count so far.
 */

function strip(s, { level }) {
  const T = buildTree(level);
  const order = levelOrder(T, T.kids);
  if (!order.length) return '<span class="note mono">[]</span>';
  const tone = {};
  const lit = s.view === 'dfs' ? new Set(s.frames.map((f) => f.key)) : new Set(s.level);
  const done = s.view === 'dfs' ? new Set(Object.keys(s.depthOf).map(Number)) : new Set(s.seen.flat());
  order.forEach((x, i) => {
    if (x.key == null) tone[i] = 'done';
    // match the tree: waiting on the stack / in the level = amber, the call running now = outlined
    else if (s.view === 'dfs' && x.key === s.cur) tone[i] = 'entering';
    else if (lit.has(x.key)) tone[i] = 'inwin';
    else if (done.has(x.key)) tone[i] = 'done';
  });
  return cells(order.map((x) => (x.v == null ? '∅' : x.v)), { tone });
}

function treePicture(s, T) {
  if (T.root == null) return '<p class="note mono stage-empty">root = null</p>';
  const ids = preorderKeys(T.root, T.kids);
  const id = (key) => ids.indexOf(key);
  const tone = {};
  const badges = {};
  if (s.view === 'dfs') {
    for (const [key, d] of Object.entries(s.depthOf)) { tone[id(Number(key))] = 'done'; badges[id(Number(key))] = d; }
    for (const f of s.frames) if (f.key != null && f.key !== s.cur) tone[id(f.key)] = 'warn';
    return tree(asNested(T.root, T.val, T.kids), { at: s.cur != null ? id(s.cur) : null, tone, badges });
  }
  s.seen.forEach((lvl, d) => lvl.forEach((key) => { tone[id(key)] = 'done'; badges[id(key)] = d + 1; }));
  for (const key of s.level) tone[id(key)] = 'warn';
  return tree(asNested(T.root, T.val, T.kids), { tone, badges });
}

function draw(s, { level }) {
  const T = buildTree(level);
  const pic = treePicture(s, T);
  if (s.view === 'dfs') {
    const frames = s.frames.map((f) => `max_depth(${nameOf(f.key, T.val)})${f.left != null ? ` · left ${f.left}` : ''}`);
    return stagePanel(pick(t('The tree, and the calls waiting for an answer', 'tree နှင့် အဖြေ စောင့်နေသော call များ')),
      pick(t(`stack ${s.frames.length} deep`, `stack အနက် ${s.frames.length}`)),
      panels(pic, stack(frames, { label: 'call stack' })));
  }
  return stagePanel(pick(t('The tree, one level at a time', 'tree — တစ်ကြိမ်လျှင် အဆင့်တစ်ဆင့်')),
    pick(t(`depth ${s.depth}`, `depth ${s.depth}`)),
    pic + stageGap + readout({ depth: s.depth })
      + `<div class="st-label">${pick(t('level — the nodes at this depth', 'level — ဤအနက်ရှိ node များ'))}</div>`
      + stageRow(cells(s.level.map((key) => T.val[key]), { index: false }), pick(t('empty', 'ဗလာ'))));
}

function answer(s) {
  return {
    html: slots(s.finished ? [s.answer] : [], { total: 1, just: s.finished ? 0 : -1 }),
    note: s.finished ? t('the maximum depth', 'maximum depth') : t('one number', 'ကိန်း တစ်ခု'),
  };
}

function vars(s, { level }) {
  const T = buildTree(level);
  if (s.view === 'dfs') {
    const f = s.frames[s.frames.length - 1];
    const known = (v) => (v == null ? '—' : v);
    return [['root', f ? nameOf(f.key, T.val) : '—'], ['node', f ? nameOf(f.key, T.val) : '—'],
            ['left', known(f?.left)], ['right', known(f?.right)]];
  }
  return [['level', `[${s.level.map((key) => T.val[key]).join(', ')}]`], ['depth', s.depth]];
}

/* ---------------- the code, one key per line ----------------
 *
 * Generated from the verified solution files, so the listing a reader copies
 * is byte-identical to the one that ran. */

const CODE = {
  dfs: {
    ruby: [
      [null, `${k('def')} max_depth(root)`],
      ['base', `  ${k('return')} 0 ${k('if')} root.nil?                      ${c('# an empty tree has no levels')}`],
      ['recl', `  left = max_depth(root.left)`],
      ['recr', `  right = max_depth(root.right)`],
      ['ret', `  1 + [left, right].max`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('import')} sys`],
      [null, `sys.setrecursionlimit(20_000)            ${c('# 10^4 levels deep; the default is 1,000')}`],
      [null, ``],
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} maxDepth(self, root):`],
      ['base', `        ${k('if')} root ${k('is')} ${k('None')}:                     ${c('# an empty tree has no levels')}`],
      [null, `            ${k('return')} 0`],
      ['recl', `        left = self.maxDepth(root.left)`],
      ['recr', `        right = self.maxDepth(root.right)`],
      ['ret', `        ${k('return')} 1 + max(left, right)`],
    ],
    javascript: [
      [null, `${k('var')} maxDepth = ${k('function')} (root) {`],
      ['base', `  ${k('if')} (root === ${k('null')}) ${k('return')} 0;               ${c('// an empty tree has no levels')}`],
      ['recl', `  ${k('const')} left = maxDepth(root.left);`],
      ['recr', `  ${k('const')} right = maxDepth(root.right);`],
      ['ret', `  ${k('return')} 1 + Math.max(left, right);`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} maxDepth(root *TreeNode) int {`],
      ['base', `    ${k('if')} root == ${k('nil')} {                         ${c('// an empty tree has no levels')}`],
      [null, `        ${k('return')} 0`],
      [null, `    }`],
      ['recl', `    left := maxDepth(root.Left)`],
      ['recr', `    right := maxDepth(root.Right)`],
      ['ret', `    ${k('return')} 1 + max(left, right)`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('use')} std::cell::RefCell;`],
      [null, `${k('use')} std::rc::Rc;`],
      [null, ``],
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} max_depth(root: Option&lt;Rc&lt;RefCell&lt;TreeNode&gt;&gt;&gt;) -&gt; i32 {`],
      [null, `        ${k('let')} node = ${k('match')} root {`],
      ['base', `            ${k('None')} =&gt; ${k('return')} 0,                ${c('// an empty tree has no levels')}`],
      [null, `            ${k('Some')}(node) =&gt; node,`],
      [null, `        };`],
      [null, `        ${k('let')} node = node.borrow();`],
      ['recl', `        ${k('let')} left = ${k('Self')}::max_depth(node.left.clone());`],
      ['recr', `        ${k('let')} right = ${k('Self')}::max_depth(node.right.clone());`],
      ['ret', `        1 + left.max(right)`],
      [null, `    }`],
      [null, `}`],
    ],
  },
  bfs: {
    ruby: [
      [null, `${k('def')} max_depth(root)`],
      ['init', `  level = root.nil? ? [] : [root]            ${c('# every node at the current depth')}`],
      [null, `  depth = 0`],
      ['loop', `  ${k('until')} level.empty?`],
      ['count', `    depth += 1`],
      ['next', `    level = level.flat_map { |n| [n.left, n.right] }.compact`],
      [null, `  ${k('end')}`],
      ['ret', `  depth`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} maxDepth(self, root):`],
      ['init', `        level = [root] ${k('if')} root else []       ${c('# every node at the current depth')}`],
      [null, `        depth = 0`],
      ['loop', `        ${k('while')} level:`],
      ['count', `            depth += 1`],
      ['next', `            level = [c ${k('for')} n ${k('in')} level ${k('for')} c ${k('in')} (n.left, n.right) ${k('if')} c]`],
      ['ret', `        ${k('return')} depth`],
    ],
    javascript: [
      [null, `${k('var')} maxDepth = ${k('function')} (root) {`],
      ['init', `  ${k('let')} level = root === ${k('null')} ? [] : [root];   ${c('// every node at the current depth')}`],
      [null, `  ${k('let')} depth = 0;`],
      ['loop', `  while (level.length &gt; 0) {`],
      ['count', `    depth++;`],
      ['next', `    level = level.flatMap((n) =&gt; [n.left, n.right]).filter((c) =&gt; c !== ${k('null')});`],
      [null, `  }`],
      ['ret', `  ${k('return')} depth;`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} maxDepth(root *TreeNode) int {`],
      ['init', `    level := []*TreeNode{}                   ${c('// every node at the current depth')}`],
      [null, `    ${k('if')} root != ${k('nil')} {`],
      [null, `        level = append(level, root)`],
      [null, `    }`],
      [null, `    depth := 0`],
      ['loop', `    ${k('for')} len(level) &gt; 0 {`],
      ['count', `        depth++`],
      ['next', `        next := []*TreeNode{}`],
      [null, `        ${k('for')} _, n := range level {`],
      [null, `            ${k('if')} n.Left != ${k('nil')} {`],
      [null, `                next = append(next, n.Left)`],
      [null, `            }`],
      [null, `            ${k('if')} n.Right != ${k('nil')} {`],
      [null, `                next = append(next, n.Right)`],
      [null, `            }`],
      [null, `        }`],
      [null, `        level = next`],
      [null, `    }`],
      ['ret', `    ${k('return')} depth`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('use')} std::cell::RefCell;`],
      [null, `${k('use')} std::rc::Rc;`],
      [null, ``],
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} max_depth(root: Option&lt;Rc&lt;RefCell&lt;TreeNode&gt;&gt;&gt;) -&gt; i32 {`],
      ['init', `        ${k('let')} ${k('mut')} level: Vec&lt;Rc&lt;RefCell&lt;TreeNode&gt;&gt;&gt; = root.into_iter().collect(); ${c('// every node at the current depth')}`],
      [null, `        ${k('let')} ${k('mut')} depth = 0;`],
      ['loop', `        ${k('while')} !level.is_empty() {`],
      ['count', `            depth += 1;`],
      ['next', `            level = level`],
      [null, `                .iter()`],
      [null, `                .flat_map(|n| {`],
      [null, `                    ${k('let')} n = n.borrow();`],
      [null, `                    [n.left.clone(), n.right.clone()]`],
      [null, `                })`],
      [null, `                .flatten()`],
      [null, `                .collect();`],
      [null, `        }`],
      ['ret', `        depth`],
      [null, `    }`],
      [null, `}`],
    ],
  },
};

/* ---------------- part 1: the "count nodes, not edges" widget ----------------
 *
 * The statement defines depth precisely, and the definition is the trap: it
 * is the number of *nodes* on the longest root-to-leaf path, not the number
 * of edges (which is what "height" often means elsewhere). Drag through every
 * root-to-leaf path and watch both counts; the answer is the longest path's
 * node count.
 *
 * Built from x-sum's widget vocabulary: .q-arr cells (kept / cut), the
 * .q-slider, the amber .q-tie line and the .ledger.
 */

const QW_SETS = [
  { label: t('example 1', 'ဥပမာ 1'), level: [3, 9, 20, null, null, 15, 7] },
  { label: t('example 2', 'ဥပမာ 2'), level: [1, null, 2] },
  { label: t('one node', 'node တစ်ခု'), level: [5] },
  { label: t('lopsided', 'တစ်ဖက်စောင်း'), level: [1, 2, 3, 4, null, null, null, 5] },
];

/* Every root-to-leaf path, as lists of keys, left to right. */
function leafPaths(key, kids, path = [], out = []) {
  if (key == null) return out;
  const here = [...path, key];
  const [l, r] = kids[key];
  if (l == null && r == null) out.push(here);
  leafPaths(l, kids, here, out);
  leafPaths(r, kids, here, out);
  return out;
}

function mountPathWidget(host) {
  const state = { set: 0, p: 0 };

  host.innerHTML = `
    <div data-tree></div>
    <div class="q-arr" data-arr></div>
    <div class="q-slider">
      <label for="qw-p" data-lbl></label>
      <input type="range" id="qw-p" min="1" max="1" value="1">
      <output data-out>1</output>
      <span class="q-presets" data-presets></span>
    </div>
    <p class="q-tie" data-line></p>
    <div class="ledger">
      <span class="expr" data-expr></span>
      <span class="total" data-total></span>
    </div>`;

  const q = (sel) => host.querySelector(sel);

  function render() {
    const T = buildTree(QW_SETS[state.set].level);
    const paths = leafPaths(T.root, T.kids);
    const p = Math.min(state.p, paths.length - 1);
    const path = paths[p];
    const best = treeDepth(T.root, T.kids);
    const ids = preorderKeys(T.root, T.kids);

    q('[data-lbl]').textContent = pick(t('leaf', 'leaf'));
    const slider = q('#qw-p');
    slider.min = '1';
    slider.max = String(paths.length);
    slider.value = String(p + 1);
    q('[data-out]').textContent = `${p + 1}/${paths.length}`;
    q('[data-presets]').innerHTML = QW_SETS.map((x, i) =>
      `<button class="chip" data-set="${i}"${i === state.set ? ' aria-pressed="true"' : ''}>${pick(x.label)}</button>`).join('');

    const tone = {};
    path.forEach((key) => { tone[ids.indexOf(key)] = 'warn'; });
    tone[ids.indexOf(path[path.length - 1])] = 'done';
    q('[data-tree]').innerHTML = tree(asNested(T.root, T.val, T.kids), { tone });
    // kept = on a longest path · cut = on a shorter one
    q('[data-arr]').innerHTML = path.map((key, i) =>
      `<div class="cell ${path.length === best ? 'kept' : 'cut'}"><span>${T.val[key]}</span><span class="idx">${i + 1}</span></div>`).join('');

    const label = document.getElementById('q-label');
    if (label) label.textContent = pick(t(`${plural(paths.length, 'leaf')}, depth ${best}`, `leaf ${paths.length} ခု၊ depth ${best}`));

    const nodes = path.length;
    const edges = nodes - 1;
    q('[data-line]').innerHTML = pick(nodes === 1
      ? t('The root is also a leaf. One node, zero edges — and the depth is 1, because depth counts nodes.',
          'root သည် leaf လည်း ဖြစ်သည်။ node တစ်ခု၊ edge သုည — depth မှာ 1 ဖြစ်သည်၊ depth သည် node များကို ရေတွက်သောကြောင့်။')
      : nodes === best
        ? t(`This path has ${nodes} nodes and ${edges} edges. It is a longest one, so the answer is ${best} — the node count, not the ${edges} edges.`,
            `ဤလမ်းကြောင်းတွင် node ${nodes} ခုနှင့် edge ${edges} ခု ရှိသည်။ အရှည်ဆုံးထဲက တစ်ခု ဖြစ်သဖြင့် အဖြေမှာ ${best} — edge ${edges} ခု မဟုတ်ဘဲ node အရေအတွက် ဖြစ်သည်။`)
        : t(`This path has ${nodes} nodes. Another path reaches ${best}, so this leaf is not the farthest one.`,
            `ဤလမ်းကြောင်းတွင် node ${nodes} ခု ရှိသည်။ အခြား လမ်းကြောင်းတစ်ခုက ${best} အထိ ရောက်သဖြင့် ဤ leaf သည် အဝေးဆုံး မဟုတ်ပါ။`));

    // the ledger is a formula, as on x-sum
    q('[data-expr]').innerHTML = `${path.map((key) => T.val[key]).join(' → ')} &nbsp;·&nbsp; ${nodes} nodes, ${edges} edges`;
    q('[data-total]').innerHTML = `${best}<small>${pick(t('max depth', 'max depth'))}</small>`;
  }

  host.addEventListener('input', (ev) => {
    if (ev.target.id !== 'qw-p') return;
    state.p = Number(ev.target.value) - 1; render();
  });
  host.addEventListener('click', (ev) => {
    const chip = ev.target.closest('[data-set]');
    if (!chip) return;
    state.set = Number(chip.dataset.set);
    state.p = 0;
    render();
  });
  onLangChange(render);
  render();
}

/* ---------------- mount ----------------
 *
 * Last in the file on purpose: mountLesson runs the widget immediately, so
 * every const the widget reads must already be initialised. */

mountLesson({
  input: { level: [3, 9, 20, null, null, 15, 7] },
  controls: [
    { key: 'level', label: 'root', value: '3, 9, 20, null, null, 15, 7', parse: treeInput(MAX_NODES), format: formatLevelOrder },
  ],
  presets: [
    { label: exampleTitle(1), input: { level: [3, 9, 20, null, null, 15, 7] } },
    { label: exampleTitle(2), input: { level: [1, null, 2] } },
    { label: t('Empty', 'ဗလာ'), input: { level: [] } },
    { label: t('Balanced', 'ညီမျှ'), input: { level: [1, 2, 3, 4, 5, 6, 7] } },
    { label: t('A chain', 'ကွင်းဆက်'), input: { level: [1, 2, null, 3, null, 4, null, 5] } },
  ],
  examples: [
    { title: exampleTitle(1), inputHtml: '<code>root = [3,9,20,null,null,15,7]</code>', output: '3',
      why: [t('The longest paths are 3 → 20 → 15 and 3 → 20 → 7: three nodes each. The path to 9 has only two.',
              'အရှည်ဆုံး လမ်းကြောင်းများမှာ 3 → 20 → 15 နှင့် 3 → 20 → 7 — node သုံးခုစီ။ 9 သို့ သွားသော လမ်းကြောင်းတွင် node နှစ်ခုသာ ရှိသည်။'),
            t('Depth counts nodes, so the answer is 3, not the 2 edges on those paths.',
              'depth သည် node များကို ရေတွက်သဖြင့် အဖြေမှာ 3 ဖြစ်ပြီး ထိုလမ်းကြောင်းများပေါ်ရှိ edge 2 ခု မဟုတ်ပါ။')],
      load: { level: [3, 9, 20, null, null, 15, 7] } },
    { title: exampleTitle(2), inputHtml: '<code>root = [1,null,2]</code>', output: '2',
      why: [t('The root has only a right child. The one path, 1 → 2, has two nodes. The missing left side does not count as a level.',
              'root တွင် ညာဘက် ကလေး တစ်ခုတည်း ရှိသည်။ လမ်းကြောင်း တစ်ခုတည်း ဖြစ်သော 1 → 2 တွင် node နှစ်ခု ရှိသည်။ ပျောက်နေသော ဘယ်ဘက်ကို အဆင့်အဖြစ် မရေတွက်ပါ။')],
      load: { level: [1, null, 2] } },
  ],
  modes: [
    { id: 'dfs', name: 'Recursive DFS',
      desc: t('A node\'s depth is one more than its deeper child\'s.', 'node တစ်ခု၏ depth သည် ၎င်း၏ ပိုနက်သော ကလေးထက် တစ် ပိုသည်။'),
      cost: 'O(n) time · O(h) stack', build: buildDfs },
    { id: 'bfs', name: 'Level-by-level BFS',
      desc: t('Count levels from the top until none are left.', 'အပေါ်မှ စ၍ အဆင့်များ ကုန်သည်အထိ ရေတွက်သည်။'),
      cost: 'O(n) time · O(w) level', build: buildBfs },
  ],
  languages: LANGUAGES,
  code: CODE,
  solutions: {
    dfs: { desc: t('The definition, written as code: an empty tree is 0 deep, and anything else is 1 plus its deeper side. The stack grows with the height — up to 10⁴ frames here, which is where some languages run out.',
                   'အဓိပ္ပာယ်ကို code အဖြစ် ရေးထားခြင်း — ဗလာ tree သည် 0 နက်ပြီး အခြား မည်သည့်အရာမဆို ၎င်း၏ ပိုနက်သော ဘက်ကို 1 ပေါင်းခြင်း ဖြစ်သည်။ stack သည် အမြင့်နှင့်အမျှ ကြီးသည် — ဤနေရာတွင် frame 10⁴ အထိ၊ ဘာသာစကားအချို့ ကုန်သွားသည့်နေရာ ဖြစ်သည်။') },
    bfs: { desc: t('No recursion, so no stack to run out of: hold one level, count it, replace it with its children. Memory grows with the widest level instead.',
                   'recursion မရှိသဖြင့် ကုန်သွားစရာ stack မရှိပါ — အဆင့်တစ်ဆင့် ကိုင်၊ ရေတွက်၊ ၎င်း၏ ကလေးများဖြင့် အစားထိုး။ memory သည် အကျယ်ဆုံး အဆင့်နှင့်အမျှ ကြီးသည်။') },
  },
  // How each language was actually checked, printed as the part 3 badges.
  // The corpus: the 2 examples, 4 edges, 15,000 random trees of up to 9 nodes,
  // 5,000 of up to 300, and four at the 10⁴-node constraint (all-left,
  // all-right, zigzag chains and one random tree) — against an iterative
  // reference with an explicit stack. Go and Rust ran in Docker
  // (golang:1.23-alpine, rust:1-slim). Recursive Ruby is correct on all of
  // them with a larger VM stack (RUBY_THREAD_VM_STACK_SIZE=8MB), but on Ruby
  // 3.1's default stack it overflows on the three 10⁴-deep chains; measured,
  // it survives chains up to 8,733 nodes. Recursive JavaScript passed the
  // corpus only because 20,000 small cases warmed the JIT first: run cold, one
  // chain per process, Node 24's default stack overflows past 7,774 nodes.
  verification: {
    ruby: { dfs: 'ran here · stack overflows at 10⁴ deep', bfs: 'ran here · 20,010 cases' },
    python: 'ran here · 20,010 cases',
    javascript: { dfs: 'ran here · stack overflows at 10⁴ deep', bfs: 'ran here · 20,010 cases' },
    go: 'ran here · 20,010 cases · Go 1.23',
    rust: 'ran here · 20,010 cases · rustc 1.98',
  },
  caveats: {
    dfs: {
      ruby: t('Correct, but on Ruby 3.1\'s default stack this recursion overflows (<code>SystemStackError</code>) past about 8,700 levels — measured here — and the constraints allow a 10⁴-node chain. It passed all 20,010 cases with a larger stack; the BFS version needs no stack at all.',
              'မှန်ကန်သည်၊ သို့သော် Ruby 3.1 ၏ default stack ပေါ်တွင် ဤ recursion သည် အဆင့် 8,700 ခန့်ကျော်လျှင် overflow (<code>SystemStackError</code>) ဖြစ်သည် — ဤနေရာတွင် တိုင်းတာထားသည် — ကန့်သတ်ချက်က node 10⁴ ကွင်းဆက်ကို ခွင့်ပြုသည်။ stack ပိုကြီးလျှင် case 20,010 ခုလုံး အောင်သည် — BFS ပုံစံကမူ stack လုံးဝ မလိုပါ။'),
      python: t('Python stops at 1,000 levels by default, and the constraints allow 10⁴, so the listing raises the limit first. Without that line it raises <code>RecursionError</code> on a deep chain.',
                'Python သည် default အားဖြင့် အဆင့် 1,000 တွင် ရပ်ပြီး ကန့်သတ်ချက်က 10⁴ ကို ခွင့်ပြုသဖြင့် listing က limit ကို အရင် မြှင့်ထားသည်။ ထိုစာကြောင်း မပါလျှင် နက်သော ကွင်းဆက်တွင် <code>RecursionError</code> ဖြစ်မည်။'),
      javascript: t('Correct on all 20,010 cases, but only because the small ones ran first and warmed the JIT. Run cold on Node 24\'s default stack it overflows (<code>RangeError</code>) on a chain longer than 7,774 nodes — measured here. Whether LeetCode\'s runner gives more stack is not something this page could check; the BFS version needs none.',
                    'case 20,010 ခုလုံးတွင် မှန်သည်၊ သို့သော် case ငယ်များက အရင် run ပြီး JIT ကို နွှေးပေးခဲ့သောကြောင့်သာ ဖြစ်သည်။ Node 24 ၏ default stack ပေါ်တွင် cold run လုပ်လျှင် node 7,774 ထက် ရှည်သော ကွင်းဆက်တွင် overflow (<code>RangeError</code>) ဖြစ်သည် — ဤနေရာတွင် တိုင်းတာထားသည်။ LeetCode ၏ runner က stack ပိုပေးမပေး ဤစာမျက်နှာက မစစ်နိုင်ပါ — BFS ပုံစံကမူ stack မလိုပါ။'),
    },
  },
  strip,
  stripLabel: t('The tree in level order (∅ = null)', 'Tree — level order (∅ = null)'),
  draw,
  answer,
  vars,
  widget: mountPathWidget,
});
