/* Invert Binary Tree — LeetCode 226.
 *
 * Both approaches do the same n swaps, one per node, and differ only in how
 * they remember which nodes are still waiting: the recursion keeps them on the
 * call stack (deep trees are expensive), the loop keeps them in a queue (wide
 * trees are expensive). Watching the tree turn inside out is the easy part;
 * the stack and the queue beside it are the lesson.
 */
import { mountLesson } from '../../lib/stepper.js';
import { pick, onLangChange } from '../../lib/i18n.js';
import { cells, tree, stack, panels, slots, stagePanel } from '../../lib/stage.js';
import { t, plural, exampleTitle, LANGUAGES, k, c, stageRow, stageGap, presetChips, widgetLabel, stageEmpty } from '../../lib/kit.js';
import { buildTree, levelOrder, asNested, treeDepth, copyKids as copy, nameOf, treeInput, formatLevelOrder } from '../../lib/tree.js';

/* The tree helpers — parsing LeetCode's level order, drawing, serializing —
 * live in lib/tree.js, shared with every tree lesson. */

const MAX_NODES = 15;

/* ---------------- step generators ---------------- */

function buildDfs({ level }) {
  const T = buildTree(level);
  const { val } = T;
  const kids = copy(T.kids);
  const n = Object.keys(val).length;
  const steps = [];
  const frames = [];          // keys (or null) of the calls still open, outermost first
  const done = new Set();     // subtrees fully inverted
  const snap = (extra) => ({ view: 'dfs', kids: copy(kids), frames: [...frames], done: [...done], ...extra });

  function visit(key, from) {
    frames.push(key);
    if (key == null) {
      steps.push(snap({ line: 'base', cur: null, tag: t('null', 'null'),
        note: from == null
          ? t('The tree is empty, so <code>root</code> is null. There is nothing to swap; return null.',
              'tree ဗလာ ဖြစ်သဖြင့် <code>root</code> သည် null ဖြစ်သည်။ လဲစရာ ဘာမျှ မရှိ၊ null ပြန်ပေးသည်။')
          : t(`${from.side === 0 ? 'Left' : 'Right'} of node ${val[from.key]}: nothing there. An empty subtree is already inverted — return straight away.`,
              `node ${val[from.key]} ၏ ${from.side === 0 ? 'ဘယ်' : 'ညာ'}ဘက် — ဘာမျှ မရှိပါ။ ဗလာ subtree သည် ပြောင်းပြန် ဖြစ်ပြီးသား — ချက်ချင်း ပြန်သည်။`) }));
      frames.pop();
      return;
    }
    const [l, r] = kids[key];
    steps.push(snap({ line: 'base', cur: key, tag: t('visit', 'ရောက်'),
      note: t(`Called on node <b>${val[key]}</b>. It is not null, so there is work to do. Depth ${frames.length}.`,
              `node <b>${val[key]}</b> ပေါ်တွင် call လုပ်သည်။ null မဟုတ်သဖြင့် လုပ်စရာ ရှိသည်။ အနက် ${frames.length}။`) }));

    kids[key] = [r, l];
    steps.push(snap({ line: 'swap', cur: key, swapped: key, tag: t('swap', 'လဲ'),
      note: l == null && r == null
        ? t(`Node ${val[key]} is a leaf: both children are null, so the swap changes nothing — but the line still runs.`,
            `node ${val[key]} သည် leaf ဖြစ်သည် — ကလေး နှစ်ခုလုံး null ဖြစ်၍ လဲလည်း ဘာမျှ မပြောင်းပါ၊ သို့သော် စာကြောင်း run ဆဲ။`)
        : t(`Swap node ${val[key]}'s children: left is now <b>${nameOf(r, val)}</b>, right is <b>${nameOf(l, val)}</b>. Only these two pointers moved — the subtrees hanging off them are still the wrong way round inside.`,
            `node ${val[key]} ၏ ကလေးများကို လဲသည် — ဘယ်ဘက်မှာ ယခု <b>${nameOf(r, val)}</b>၊ ညာဘက်မှာ <b>${nameOf(l, val)}</b>။ pointer နှစ်ခုသာ ရွှေ့သည် — ၎င်းတို့အောက်ရှိ subtree များ၏ အတွင်းပိုင်းမှာ မလှန်ရသေးပါ။`) }));

    steps.push(snap({ line: 'recl', cur: key, tag: t('go left', 'ဘယ်သို့'),
      note: t(`Invert the new left subtree (rooted at ${nameOf(r, val)}). Node ${val[key]} waits on the call stack until it comes back.`,
              `ဘယ်ဘက် subtree အသစ် (root ${nameOf(r, val)}) ကို ပြောင်းပြန်လှန်သည်။ ၎င်း ပြန်လာသည်အထိ node ${val[key]} သည် call stack ပေါ်တွင် စောင့်သည်။`) }));
    visit(r, { key, side: 0 });

    steps.push(snap({ line: 'recr', cur: key, tag: t('go right', 'ညာသို့'),
      note: t(`Back at node ${val[key]} with its left side finished. Now the right subtree (rooted at ${nameOf(l, val)}).`,
              `ဘယ်ဘက် ပြီးသွားပြီဖြစ်၍ node ${val[key]} သို့ ပြန်ရောက်သည်။ ယခု ညာဘက် subtree (root ${nameOf(l, val)})။`) }));
    visit(l, { key, side: 1 });

    done.add(key);
    steps.push(snap({ line: 'ret', cur: key, tag: t('return', 'return'),
      note: frames.length === 1
        ? t(`Every node below has been swapped, so the whole tree is inverted. Return the root, <b>${val[key]}</b> — the same node it always was.`,
            `အောက်ရှိ node တိုင်းကို လဲပြီးပြီဖြစ်၍ tree တစ်ခုလုံး ပြောင်းပြန် ဖြစ်သွားပြီ။ root <b>${val[key]}</b> ကို ပြန်ပေးသည် — အမြဲတမ်း ရှိခဲ့သည့် node ပင်။`)
        : t(`The subtree under ${val[key]} is fully inverted. Return it and pop back to the caller.`,
            `${val[key]} အောက်ရှိ subtree ပြောင်းပြန် ဖြစ်ပြီ။ ၎င်းကို ပြန်ပေးပြီး ခေါ်သူထံ ပြန်သွားသည်။`) }));
    frames.pop();
  }

  visit(T.root, null);
  const final = steps[steps.length - 1];
  final.done = n ? [...done] : [];
  final.finished = true;
  steps.forEach((s2) => { s2.n = n; });
  return steps;
}

function buildBfs({ level }) {
  const T = buildTree(level);
  const { val, root } = T;
  const kids = copy(T.kids);
  const n = Object.keys(val).length;
  const steps = [];
  const queue = root == null ? [] : [root];
  const done = new Set();
  const snap = (extra) => ({ view: 'bfs', kids: copy(kids), queue: [...queue], done: [...done], n, ...extra });

  steps.push(snap({ line: 'init', cur: null, tag: t('start', 'စ'),
    note: root == null
      ? t('The tree is empty, so the queue starts empty too.', 'tree ဗလာ ဖြစ်သဖြင့် queue လည်း ဗလာဖြင့် စသည်။')
      : t(`The queue holds the nodes still waiting for their swap. It starts with the root, <b>${val[root]}</b>.`,
          `queue တွင် လဲရန် စောင့်နေဆဲ node များ ရှိသည်။ root <b>${val[root]}</b> ဖြင့် စသည်။`) }));

  while (queue.length) {
    steps.push(snap({ line: 'loop', cur: null, tag: t('loop', 'loop'),
      note: t(`${plural(queue.length, 'node')} waiting. Keep going.`, `node ${queue.length} ခု စောင့်နေသည်။ ဆက်သွားသည်။`) }));
    const key = queue.shift();
    steps.push(snap({ line: 'pop', cur: key, tag: t('take', 'ယူ'),
      note: t(`Take <b>${val[key]}</b> from the front — the queue hands out nodes level by level, top to bottom.`,
              `ရှေ့ဆုံးမှ <b>${val[key]}</b> ကို ယူသည် — queue သည် node များကို အဆင့်လိုက်၊ အပေါ်မှ အောက်သို့ ပေးသည်။`) }));
    const [l, r] = kids[key];
    kids[key] = [r, l];
    done.add(key);
    steps.push(snap({ line: 'swap', cur: key, swapped: key, tag: t('swap', 'လဲ'),
      note: l == null && r == null
        ? t(`Node ${val[key]} is a leaf, so the swap changes nothing.`, `node ${val[key]} သည် leaf ဖြစ်၍ လဲလည်း ဘာမျှ မပြောင်းပါ။`)
        : t(`Swap its children: left is now <b>${nameOf(r, val)}</b>, right is <b>${nameOf(l, val)}</b>. Node ${val[key]} is finished and never looked at again.`,
            `ကလေးများကို လဲသည် — ဘယ်ဘက်မှာ ယခု <b>${nameOf(r, val)}</b>၊ ညာဘက်မှာ <b>${nameOf(l, val)}</b>။ node ${val[key]} ပြီးသွားပြီ၊ ထပ်မကြည့်တော့ပါ။`) }));
    const [nl, nr] = kids[key];
    if (nl != null) queue.push(nl);
    steps.push(snap({ line: 'pushl', cur: key, pushed: nl, tag: t('queue left', 'ဘယ်ကို တန်းစီ'),
      note: nl == null
        ? t('No left child to queue.', 'တန်းစီစရာ ဘယ်ဘက် ကလေး မရှိပါ။')
        : t(`Queue the new left child, <b>${val[nl]}</b>. Its own children are still unswapped — it will get its turn.`,
            `ဘယ်ဘက် ကလေးအသစ် <b>${val[nl]}</b> ကို တန်းစီသည်။ ၎င်း၏ ကလေးများကို မလဲရသေးပါ — ၎င်း၏ အလှည့် ရောက်လာမည်။`) }));
    if (nr != null) queue.push(nr);
    steps.push(snap({ line: 'pushr', cur: key, pushed: nr, tag: t('queue right', 'ညာကို တန်းစီ'),
      note: nr == null
        ? t('No right child to queue.', 'တန်းစီစရာ ညာဘက် ကလေး မရှိပါ။')
        : t(`Queue the new right child, <b>${val[nr]}</b>. ${plural(queue.length, 'node')} now waiting.`,
            `ညာဘက် ကလေးအသစ် <b>${val[nr]}</b> ကို တန်းစီသည်။ ယခု node ${queue.length} ခု စောင့်နေသည်။`) }));
  }

  steps.push(snap({ line: 'loop', cur: null, tag: t('empty', 'ဗလာ'),
    note: n
      ? t('The queue is empty: every node has been taken out once and swapped once.', 'queue ဗလာ ဖြစ်သွားပြီ — node တိုင်းကို တစ်ကြိမ်စီ ထုတ်ပြီး တစ်ကြိမ်စီ လဲပြီးပြီ။')
      : t('The queue was empty from the start, so the loop never runs.', 'queue သည် အစကတည်းက ဗလာ ဖြစ်၍ loop လုံးဝ မပတ်ပါ။') }));
  steps.push(snap({ line: 'ret', cur: null, finished: true, tag: t('return', 'return'),
    note: n
      ? t(`Return the root, <b>${val[root]}</b>. The loop never needed to go back up the tree — nothing was waiting except what was in the queue.`,
          `root <b>${val[root]}</b> ကို ပြန်ပေးသည်။ loop သည် tree အပေါ်သို့ ပြန်တက်ရန် မလိုခဲ့ပါ — queue ထဲရှိသည့်အရာမှလွဲ၍ စောင့်နေသည့်အရာ မရှိခဲ့ပါ။`)
      : t('Return null — an empty tree inverted is an empty tree.', 'null ပြန်ပေးသည် — ဗလာ tree ကို ပြောင်းပြန်လှန်လည်း ဗလာ tree ပင်။') }));
  return steps;
}

/* ---------------- drawing ----------------
 *
 * The strip card is the tree in LeetCode's level-order format as it stands at
 * this step — at the last step it is the answer. The stage draws the tree
 * itself beside what the approach is holding: the call stack, or the queue.
 */

function strip(s, { level }) {
  const T = buildTree(level);
  const slotsNow = levelOrder(T, s.kids);
  if (!slotsNow.length) return '<span class="note mono">[]</span>';
  const tone = {};
  const done = new Set(s.done);
  const [a, b] = s.swapped != null ? s.kids[s.swapped] : [null, null];
  slotsNow.forEach((x, i) => {
    if (x.key == null) tone[i] = 'done';
    else if (x.key === s.cur) tone[i] = 'inwin';
    else if (x.key === a || x.key === b) tone[i] = 'entering';
    else if (done.has(x.key)) tone[i] = 'done';
  });
  return cells(slotsNow.map((x) => (x.v == null ? '∅' : x.v)), { tone });
}

function treePicture(s, T) {
  if (T.root == null) return stageEmpty('root = null');
  const tone = {};
  for (const key of s.done) tone[key] = 'done';
  if (s.swapped != null) for (const ch of s.kids[s.swapped]) if (ch != null) tone[ch] = 'warn';
  if (s.pushed != null) tone[s.pushed] = 'warn';
  return tree(asNested(T.root, T.val, s.kids), { at: s.cur, tone });
}

function draw(s, { level }) {
  const T = buildTree(level);
  const pic = treePicture(s, T);
  if (s.view === 'dfs') {
    const frames = s.frames.map((key) => `invert(${nameOf(key, T.val)})`);
    return stagePanel(pick(t('The tree, and the calls still open', 'tree နှင့် ပွင့်နေဆဲ call များ')),
      pick(t(`depth ${s.frames.length}`, `အနက် ${s.frames.length}`)),
      panels(pic, stack(frames, { label: 'call stack' })));
  }
  return stagePanel(pick(t('The tree, and the queue', 'tree နှင့် queue')),
    pick(t(`${plural(s.queue.length, 'node')} waiting`, `node ${s.queue.length} ခု စောင့်`)),
    pic + stageGap + `<div class="st-label">${pick(t('queue — front first', 'queue — ရှေ့ဆုံးမှ'))}</div>`
      + stageRow(cells(s.queue.map((key) => T.val[key]), { index: false, tone: s.pushed != null ? { [s.queue.length - 1]: 'entering' } : {} }),
        pick(t('empty', 'ဗလာ'))));
}

function answer(s, { level }) {
  if (!s.finished) return { html: '', note: t('the inverted tree, in level order', 'ပြောင်းပြန် tree — level order ဖြင့်') };
  const out = levelOrder(buildTree(level), s.kids).map((x) => (x.v == null ? 'null' : x.v));
  return {
    html: out.length ? slots(out, { total: out.length }) : '<span class="note mono">[]</span>',
    note: t('return root — printed in level order', 'root ကို ပြန်ပေး — level order ဖြင့်'),
  };
}

function vars(s, { level }) {
  const T = buildTree(level);
  const name = (key) => nameOf(key, T.val);
  if (s.view === 'dfs') {
    const top = s.frames.length ? s.frames[s.frames.length - 1] : undefined;
    const v = top === undefined ? '—' : name(top);
    // Rust names the same node `node` and `n`; they are this call's root.
    return [['root', v], ['node', v], ['n', v]];
  }
  const v = s.cur != null ? name(s.cur) : '—';
  return [['root', name(T.root)], ['node', v], ['n', v], ['queue', `[${s.queue.map(name).join(', ')}]`]];
}

/* ---------------- the code, one key per line ----------------
 *
 * Generated from the verified solution files, so the listing a reader copies
 * is byte-identical to the one that ran. */

const CODE = {
  dfs: {
    ruby: [
      [null, `${k('def')} invert_tree(root)`],
      ['base', `  ${k('return')} ${k('nil')} ${k('if')} root.nil?                    ${c('# an empty subtree is already inverted')}`],
      ['swap', `  root.left, root.right = root.right, root.left`],
      ['recl', `  invert_tree(root.left)`],
      ['recr', `  invert_tree(root.right)`],
      ['ret', `  root`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} invertTree(self, root):`],
      ['base', `        ${k('if')} root ${k('is')} ${k('None')}:                     ${c('# an empty subtree is already inverted')}`],
      [null, `            ${k('return')} ${k('None')}`],
      ['swap', `        root.left, root.right = root.right, root.left`],
      ['recl', `        self.invertTree(root.left)`],
      ['recr', `        self.invertTree(root.right)`],
      ['ret', `        ${k('return')} root`],
    ],
    javascript: [
      [null, `${k('var')} invertTree = ${k('function')} (root) {`],
      ['base', `  ${k('if')} (root === ${k('null')}) ${k('return')} ${k('null')};            ${c('// an empty subtree is already inverted')}`],
      ['swap', `  [root.left, root.right] = [root.right, root.left];`],
      ['recl', `  invertTree(root.left);`],
      ['recr', `  invertTree(root.right);`],
      ['ret', `  ${k('return')} root;`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} invertTree(root *TreeNode) *TreeNode {`],
      ['base', `    ${k('if')} root == ${k('nil')} {                         ${c('// an empty subtree is already inverted')}`],
      [null, `        ${k('return')} ${k('nil')}`],
      [null, `    }`],
      ['swap', `    root.Left, root.Right = root.Right, root.Left`],
      ['recl', `    invertTree(root.Left)`],
      ['recr', `    invertTree(root.Right)`],
      ['ret', `    ${k('return')} root`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('use')} std::cell::RefCell;`],
      [null, `${k('use')} std::rc::Rc;`],
      [null, ``],
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} invert_tree(root: Option&lt;Rc&lt;RefCell&lt;TreeNode&gt;&gt;&gt;) -&gt; Option&lt;Rc&lt;RefCell&lt;TreeNode&gt;&gt;&gt; {`],
      [null, `        ${k('let')} node = ${k('match')} &amp;root {`],
      ['base', `            ${k('None')} =&gt; ${k('return')} ${k('None')},             ${c('// an empty subtree is already inverted')}`],
      [null, `            ${k('Some')}(node) =&gt; node.clone(),`],
      [null, `        };`],
      [null, `        ${k('let')} ${k('mut')} guard = node.borrow_mut();`],
      [null, `        ${k('let')} n = &amp;${k('mut')} *guard;                 ${c('// one &amp;mut, so both fields can be borrowed at once')}`],
      ['swap', `        std::mem::swap(&amp;${k('mut')} n.left, &amp;${k('mut')} n.right);`],
      ['recl', `        ${k('Self')}::invert_tree(n.left.clone());`],
      ['recr', `        ${k('Self')}::invert_tree(n.right.clone());`],
      ['ret', `        root`],
      [null, `    }`],
      [null, `}`],
    ],
  },
  bfs: {
    ruby: [
      [null, `${k('def')} invert_tree(root)`],
      ['init', `  queue = root.nil? ? [] : [root]            ${c('# nodes waiting to be swapped')}`],
      ['loop', `  ${k('until')} queue.empty?`],
      ['pop', `    node = queue.shift`],
      ['swap', `    node.left, node.right = node.right, node.left`],
      ['pushl', `    queue.push(node.left) ${k('if')} node.left`],
      ['pushr', `    queue.push(node.right) ${k('if')} node.right`],
      [null, `  ${k('end')}`],
      ['ret', `  root`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('from')} collections ${k('import')} deque`],
      [null, ``],
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} invertTree(self, root):`],
      ['init', `        queue = deque([root] ${k('if')} root else [])    ${c('# nodes waiting to be swapped')}`],
      ['loop', `        ${k('while')} queue:`],
      ['pop', `            node = queue.popleft()`],
      ['swap', `            node.left, node.right = node.right, node.left`],
      ['pushl', `            ${k('if')} node.left: queue.append(node.left)`],
      ['pushr', `            ${k('if')} node.right: queue.append(node.right)`],
      ['ret', `        ${k('return')} root`],
    ],
    javascript: [
      [null, `${k('var')} invertTree = ${k('function')} (root) {`],
      ['init', `  ${k('const')} queue = root === ${k('null')} ? [] : [root]; ${c('// nodes waiting to be swapped')}`],
      ['loop', `  ${k('for')} (${k('let')} head = 0; head &lt; queue.length; ) {`],
      ['pop', `    ${k('const')} node = queue[head++];              ${c('// a moving head, not shift(): O(1)')}`],
      ['swap', `    [node.left, node.right] = [node.right, node.left];`],
      ['pushl', `    ${k('if')} (node.left) queue.push(node.left);`],
      ['pushr', `    ${k('if')} (node.right) queue.push(node.right);`],
      [null, `  }`],
      ['ret', `  ${k('return')} root;`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} invertTree(root *TreeNode) *TreeNode {`],
      ['init', `    queue := []*TreeNode{}                   ${c('// nodes waiting to be swapped')}`],
      [null, `    ${k('if')} root != ${k('nil')} {`],
      [null, `        queue = append(queue, root)`],
      [null, `    }`],
      ['loop', `    ${k('for')} len(queue) &gt; 0 {`],
      ['pop', `        node := queue[0]`],
      [null, `        queue = queue[1:]`],
      ['swap', `        node.Left, node.Right = node.Right, node.Left`],
      ['pushl', `        ${k('if')} node.Left != ${k('nil')} {`],
      [null, `            queue = append(queue, node.Left)`],
      [null, `        }`],
      ['pushr', `        ${k('if')} node.Right != ${k('nil')} {`],
      [null, `            queue = append(queue, node.Right)`],
      [null, `        }`],
      [null, `    }`],
      ['ret', `    ${k('return')} root`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('use')} std::cell::RefCell;`],
      [null, `${k('use')} std::collections::VecDeque;`],
      [null, `${k('use')} std::rc::Rc;`],
      [null, ``],
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} invert_tree(root: Option&lt;Rc&lt;RefCell&lt;TreeNode&gt;&gt;&gt;) -&gt; Option&lt;Rc&lt;RefCell&lt;TreeNode&gt;&gt;&gt; {`],
      ['init', `        ${k('let')} ${k('mut')} queue: VecDeque&lt;Rc&lt;RefCell&lt;TreeNode&gt;&gt;&gt; = root.iter().cloned().collect(); ${c('// nodes waiting to be swapped')}`],
      ['loop', `        ${k('while')} !queue.is_empty() {`],
      ['pop', `            ${k('let')} node = queue.pop_front().unwrap();`],
      [null, `            ${k('let')} ${k('mut')} guard = node.borrow_mut();`],
      [null, `            ${k('let')} n = &amp;${k('mut')} *guard;             ${c('// one &amp;mut, so both fields can be borrowed at once')}`],
      ['swap', `            std::mem::swap(&amp;${k('mut')} n.left, &amp;${k('mut')} n.right);`],
      ['pushl', `            ${k('if')} ${k('let')} ${k('Some')}(left) = &amp;n.left { queue.push_back(left.clone()); }`],
      ['pushr', `            ${k('if')} ${k('let')} ${k('Some')}(right) = &amp;n.right { queue.push_back(right.clone()); }`],
      [null, `        }`],
      ['ret', `        root`],
      [null, `    }`],
      [null, `}`],
    ],
  },
};

/* ---------------- part 1: the "every node, not just the root" widget ----------------
 *
 * "Invert" is one word in the statement and the examples are the only
 * definition: the mirror image, which means swapping the children of every
 * node, at every depth. The natural first guess — swap the root's two
 * subtrees — gets the top level right and nothing below it. Drag how many
 * levels have been swapped and watch the output line up with LeetCode's.
 *
 * Built from x-sum's widget vocabulary: .q-arr cells (kept / cut), the
 * .q-slider, the amber .q-tie line and the .ledger.
 */

const QW_SETS = [
  { label: t('example 1', 'ဥပမာ 1'), level: [4, 2, 7, 1, 3, 6, 9] },
  { label: t('example 2', 'ဥပမာ 2'), level: [2, 1, 3] },
  { label: t('lopsided', 'တစ်ဖက်စောင်း'), level: [1, 2, null, 3, 4, null, null, 5] },
  { label: t('deeper', 'ပိုနက်'), level: [8, 4, 12, 2, 6, 10, 14, 1, 3, 5, 7] },
];

function mountMirrorWidget(host) {
  const state = { set: 0, k: 0 };

  host.innerHTML = `
    <div data-tree></div>
    <div class="q-arr" data-arr></div>
    <div class="q-slider">
      <label for="qw-k" data-lbl></label>
      <input type="range" id="qw-k" min="0" max="3" value="0">
      <output data-out>0</output>
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
    const levels = treeDepth(T.root, T.kids);
    const k = Math.min(state.k, levels);

    // swap the children of every node shallower than k
    const kids = copy(T.kids);
    (function walk(key, d) {
      if (key == null) return;
      if (d < k) kids[key] = [kids[key][1], kids[key][0]];
      walk(kids[key][0], d + 1);
      walk(kids[key][1], d + 1);
    })(T.root, 0);
    const full = copy(T.kids);
    (function mirror(key) {
      if (key == null) return;
      full[key] = [full[key][1], full[key][0]];
      mirror(full[key][0]); mirror(full[key][1]);
    })(T.root);

    const now = levelOrder(T, kids);
    const want = levelOrder(T, full);
    const same = now.filter((x, i) => want[i] && x.v === want[i].v).length;

    q('[data-lbl]').textContent = pick(t('levels swapped', 'လဲပြီး အဆင့်'));
    const slider = q('#qw-k');
    slider.max = String(levels);
    slider.value = String(k);
    q('[data-out]').textContent = String(k);
    q('[data-presets]').innerHTML = presetChips(QW_SETS, state.set);

    q('[data-tree]').innerHTML = tree(asNested(T.root, T.val, kids));
    // kept = already where the mirror puts it · cut = not yet
    q('[data-arr]').innerHTML = now.map((x, i) => {
      const ok = want[i] && x.v === want[i].v;
      return `<div class="cell ${ok ? 'kept' : 'cut'}"><span>${x.v == null ? '∅' : x.v}</span><span class="idx">${i}</span></div>`;
    }).join('');

    widgetLabel(pick(t(`${Object.keys(T.val).length} nodes, ${levels} levels`, `node ${Object.keys(T.val).length} ခု၊ အဆင့် ${levels} ဆင့်`)));

    let line;
    if (k === 0) {
      line = t('Nothing swapped yet: this is the input, read level by level.', 'ဘာမျှ မလဲရသေးပါ — ဤသည်မှာ input ကို အဆင့်လိုက် ဖတ်ထားခြင်း ဖြစ်သည်။');
    } else if (k === levels || same === want.length && now.length === want.length) {
      line = t('Every node has swapped its children. Read level by level, this is the mirror image — and exactly LeetCode\'s output.',
               'node တိုင်းက ၎င်း၏ ကလေးများကို လဲပြီးပြီ။ အဆင့်လိုက် ဖတ်လျှင် ၎င်းသည် ကြေးမုံပုံ ဖြစ်ပြီး LeetCode ၏ output အတိအကျ ဖြစ်သည်။');
    } else if (k === 1) {
      line = t('Only the root swapped its children. The top level is right, but every subtree below is still the wrong way round inside — this is not an inverted tree yet.',
               'root တစ်ခုတည်းသာ ၎င်း၏ ကလေးများကို လဲခဲ့သည်။ ထိပ်ဆုံး အဆင့် မှန်သော်လည်း အောက်ရှိ subtree တိုင်း၏ အတွင်းပိုင်းမှာ ပြောင်းပြန် မဖြစ်သေးပါ — ပြောင်းပြန် tree မဟုတ်သေးပါ။');
    } else {
      line = t(`Nodes in the top ${k} levels have swapped. ${levels - k} more level${levels - k === 1 ? '' : 's'} to go before it is the mirror.`,
               `အပေါ် အဆင့် ${k} ဆင့်ရှိ node များ လဲပြီးပြီ။ ကြေးမုံပုံ မဖြစ်မီ နောက်ထပ် ${levels - k} ဆင့် ကျန်သည်။`);
    }
    q('[data-line]').innerHTML = pick(line);

    // the ledger is a formula, as on x-sum
    q('[data-expr]').innerHTML = `[${now.map((x) => (x.v == null ? 'null' : x.v)).join(',')}]${same === want.length && now.length === want.length ? ' = mirror' : ''}`;
    q('[data-total]').innerHTML = `${same}/${want.length}<small>${pick(t('in place', 'နေရာမှန်'))}</small>`;
  }

  host.addEventListener('input', (ev) => {
    if (ev.target.id !== 'qw-k') return;
    state.k = Number(ev.target.value); render();
  });
  host.addEventListener('click', (ev) => {
    const chip = ev.target.closest('[data-set]');
    if (!chip) return;
    state.set = Number(chip.dataset.set);
    state.k = 0;
    render();
  });
  onLangChange(render);
  render();
}

/* ---------------- the approach, in brief ----------------
 *
 * Shown in part 2 under the approach tabs: the idea, the steps as the code
 * takes them (named after its identifiers), and the cost with its reason. */

const APPROACH = {
  dfs: {
    idea: t("Inverting a tree means swapping every node's children. Swap at the root, then invert each subtree the same way.",
        "tree ကို invert လုပ်ခြင်းဆိုသည်မှာ node တိုင်း၏ ကလေးများကို swap လုပ်ခြင်း ဖြစ်သည်။ root တွင် swap လုပ်ပြီး subtree တစ်ခုစီကို အလားတူ invert လုပ်သည်။"),
    steps: [
      t("An empty subtree is already inverted: return <code>nil</code>.",
        "ဗလာ subtree သည် invert ပြီးသား ဖြစ်သည် — <code>nil</code> ကို ပြန်ပေးသည်။"),
      t("Swap <code>root.left</code> and <code>root.right</code>.",
        "<code>root.left</code> နှင့် <code>root.right</code> ကို swap လုပ်သည်။"),
      t("Invert the left subtree, then the right.",
        "ဘယ် subtree ကို invert လုပ်ပြီးမှ ညာကို လုပ်သည်။"),
      t("Return <code>root</code>.",
        "<code>root</code> ကို ပြန်ပေးသည်။"),
    ],
    cost: t("one visit per node; the stack grows with the height — 101 frames for the 100-node chain the constraints allow.",
        "node တစ်ခုလျှင် တစ်ကြိမ် ရောက်သည် — stack သည် အမြင့်နှင့်အမျှ ကြီးသည်၊ ကန့်သတ်ချက်က ခွင့်ပြုသော node 100 ကွင်းဆက်အတွက် frame 101။"),
  },
  bfs: {
    idea: t("The same swaps without recursion: keep a queue of nodes still to swap, and work through it level by level.",
        "recursion မပါဘဲ swap အတူတူ — swap လုပ်ရန် ကျန်သော node များ၏ queue ကို ထားပြီး အဆင့်လိုက် ဆောင်ရွက်သည်။"),
    steps: [
      t("Start with a <code>queue</code> holding the root, or nothing for an empty tree.",
        "root ပါသော <code>queue</code> ဖြင့် စသည် — ဗလာ tree ဆိုလျှင် ဘာမျှ မပါ။"),
      t("Take the front <code>node</code> and swap its children.",
        "ရှေ့ဆုံး <code>node</code> ကို ယူပြီး ၎င်း၏ ကလေးများကို swap လုပ်သည်။"),
      t("Put its children, if any, at the back of the queue.",
        "ကလေးများ ရှိလျှင် queue ၏ နောက်ဆုံးတွင် ထည့်သည်။"),
      t("When the queue is empty, return <code>root</code>.",
        "queue ဗလာ ဖြစ်သည့်အခါ <code>root</code> ကို ပြန်ပေးသည်။"),
    ],
    cost: t("one visit per node; the queue grows with the widest level instead of the height.",
        "node တစ်ခုလျှင် တစ်ကြိမ် ရောက်သည် — queue သည် အမြင့်အစား အကျယ်ဆုံး အဆင့်နှင့်အမျှ ကြီးသည်။"),
  },
};

/* ---------------- mount ----------------
 *
 * Last in the file on purpose: mountLesson runs the widget immediately, so
 * every const the widget reads must already be initialised. */

mountLesson({
  input: { level: [4, 2, 7, 1, 3, 6, 9] },
  controls: [
    { key: 'level', label: 'root', parse: treeInput(MAX_NODES), format: formatLevelOrder },
  ],
  presets: [
    { label: exampleTitle(1), input: { level: [4, 2, 7, 1, 3, 6, 9] } },
    { label: exampleTitle(2), input: { level: [2, 1, 3] } },
    { label: exampleTitle(3), input: { level: [] } },
    { label: t('Leaning left', 'ဘယ်စောင်း'), input: { level: [1, 2, null, 3, null, 4] } },
    { label: t('Uneven', 'မညီ'), input: { level: [5, 3, 8, null, 4, 7] } },
  ],
  examples: [
    { title: exampleTitle(1), inputHtml: '<code>root = [4,2,7,1,3,6,9]</code>', output: '[4,7,2,9,6,3,1]',
      why: [t('Every node swaps its two children — 2 and 7 under the root, and below them 1 and 3, 6 and 9. Read level by level, each level comes out reversed.',
              'node တိုင်းက ၎င်း၏ ကလေး နှစ်ခုကို လဲသည် — root အောက်ရှိ 2 နှင့် 7၊ ၎င်းတို့အောက်ရှိ 1 နှင့် 3၊ 6 နှင့် 9။ အဆင့်လိုက် ဖတ်လျှင် အဆင့်တိုင်း ပြောင်းပြန် ထွက်လာသည်။')],
      load: { level: [4, 2, 7, 1, 3, 6, 9] } },
    { title: exampleTitle(2), inputHtml: '<code>root = [2,1,3]</code>', output: '[2,3,1]',
      why: [t('One swap, at the root. The root itself never moves — inverting changes where the children hang, not which node is on top.',
              'root တွင် တစ်ကြိမ်တည်း လဲသည်။ root ကိုယ်တိုင် မရွှေ့ပါ — ပြောင်းပြန်လှန်ခြင်းသည် ကလေးများ ချိတ်ရာနေရာကို ပြောင်းခြင်းဖြစ်ပြီး ထိပ်ဆုံး node ကို မပြောင်းပါ။')],
      load: { level: [2, 1, 3] } },
    { title: exampleTitle(3), inputHtml: '<code>root = []</code>', output: '[]',
      why: [t('An empty tree. Both approaches must return null without touching anything — the recursion stops at its base case, the queue starts empty.',
              'ဗလာ tree။ နည်းနှစ်ခုလုံး ဘာမျှ မထိဘဲ null ပြန်ပေးရမည် — recursion က base case တွင် ရပ်ပြီး queue က ဗလာဖြင့် စသည်။')],
      load: { level: [] } },
  ],
  modes: [
    { id: 'dfs', name: 'Recursive DFS',
      desc: t('Swap, then invert each subtree. The call stack remembers the way back.', 'လဲပြီးမှ subtree တစ်ခုစီကို ပြောင်းပြန်လှန်သည်။ ပြန်လမ်းကို call stack က မှတ်ထားသည်။'),
      cost: 'O(n) time · O(h) stack', build: buildDfs },
    { id: 'bfs', name: 'Iterative BFS',
      desc: t('A queue of nodes still to swap, taken level by level.', 'လဲရန် ကျန်သော node များ၏ queue — အဆင့်လိုက် ယူသည်။'),
      cost: 'O(n) time · O(w) queue', build: buildBfs },
  ],
  languages: LANGUAGES,
  code: CODE,
  solutions: {
    dfs: { approach: APPROACH.dfs, desc: t('Three lines of real work: swap, recurse left, recurse right. Its stack grows with the height of the tree — 101 frames for the 100-node chain the constraints allow, counting the final call on null.',
                   'တကယ် အလုပ်လုပ်သည့် စာကြောင်း သုံးကြောင်း — လဲ၊ ဘယ်သို့ recurse၊ ညာသို့ recurse။ stack သည် tree ၏ အမြင့်နှင့်အမျှ ကြီးသည် — ကန့်သတ်ချက်က ခွင့်ပြုသော node 100 ကွင်းဆက်အတွက် frame 101 (null ပေါ်ရှိ နောက်ဆုံး call ပါ)။') },
    bfs: { approach: APPROACH.bfs, desc: t('The same swaps with no recursion. Its queue grows with the widest level instead — the right trade when the tree is deep rather than wide.',
                   'recursion မပါဘဲ လဲခြင်း အတူတူ။ ၎င်း၏ queue သည် အကျယ်ဆုံး အဆင့်နှင့်အမျှ ကြီးသည် — tree သည် ကျယ်ခြင်းထက် နက်သည့်အခါ မှန်ကန်သော ရွေးချယ်မှု။') },
  },
  // How each language was actually checked, printed as the part 3 badges.
  // The corpus: the 3 examples, 4 edges, 15,000 random trees of up to 9 nodes
  // over -3..3, 5,000 of up to 100 nodes over -100..100, and three 100-node
  // chains (all-left, all-right, zigzag) — against a reference that builds a
  // new mirrored tree rather than swapping in place. Go and Rust ran in Docker
  // (golang:1.23-alpine, rust:1-slim).
  verification: {
    ruby: 'ran here · 20,010 cases',
    python: 'ran here · 20,010 cases',
    javascript: 'ran here · 20,010 cases',
    go: 'ran here · 20,010 cases · Go 1.23',
    rust: 'ran here · 20,010 cases · rustc 1.98',
  },
  strip,
  stripLabel: t('The tree in level order (∅ = null)', 'Tree — level order (∅ = null)'),
  draw,
  answer,
  vars,
  widget: mountMirrorWidget,
});
