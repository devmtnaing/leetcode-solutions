/* Diameter of Binary Tree — LeetCode 543.
 *
 * Every path in a tree has one highest node, where it bends: it comes up one
 * side and goes down the other. So the longest path is, for some node, the
 * height of its left subtree plus the height of its right one. The brute force
 * asks that of every node and measures both heights from scratch each time —
 * re-walking the same subtrees over and over. The one-pass DFS notices that
 * the heights it needs are exactly the numbers Maximum Depth already returns
 * bottom-up, and records the bend on the way back.
 */
import { mountLesson } from '../../lib/stepper.js';
import { pick, onLangChange } from '../../lib/i18n.js';
import { cells, tree, stack, readout, panels, slots, stagePanel } from '../../lib/stage.js';
import { t, plural, exampleTitle, LANGUAGES, k, c, stageGap, presetChips, widgetLabel } from '../../lib/kit.js';
import { buildTree, levelOrder, asNested, preorderKeys, treeDepth, nameOf, treeInput, formatLevelOrder } from '../../lib/tree.js';

const MAX_NODES = 15;

/* Keys of every node in the subtree under `key`. */
function subtree(key, kids, out = []) {
  if (key == null) return out;
  out.push(key);
  subtree(kids[key][0], kids, out);
  subtree(kids[key][1], kids, out);
  return out;
}

/* The longest downward path from `key`, following the deeper child (left on a
 * tie) — how the page recovers which nodes a diameter runs through. */
function downPath(key, kids) {
  const out = [];
  while (key != null) {
    out.push(key);
    const [l, r] = kids[key];
    key = treeDepth(l, kids) >= treeDepth(r, kids) ? l : r;
  }
  return out;
}

/* The path that bends at `key`: down the left side reversed, the node, down the right. */
const bendPath = (key, kids) => [...downPath(kids[key][0], kids).reverse(), key, ...downPath(kids[key][1], kids)];

/* ---------------- step generators ---------------- */

function buildBrute({ level }) {
  const T = buildTree(level);
  const { val, kids } = T;
  const steps = [];
  const frames = [];        // { key, lh, rh, left, right } for every diameter call still open
  const diaOf = {};         // key → the diameter its call returned
  let calls = 0;            // height() calls so far, counting the ones on null
  const snap = (extra) => ({
    view: 'brute', frames: frames.map((f) => ({ ...f })), diaOf: { ...diaOf }, calls, measuring: [], ...extra,
  });

  function measure(frame, side) {
    const child = kids[frame.key][side];
    const nodes = subtree(child, kids);
    const h = treeDepth(child, kids);
    calls += 2 * nodes.length + 1;
    const name = side === 0 ? 'lh' : 'rh';
    frame[name] = h;
    const where = side === 0 ? t('left', 'ဘယ်') : t('right', 'ညာ');
    steps.push(snap({ line: side === 0 ? 'hl' : 'hr', cur: frame.key, measuring: nodes,
      tag: t(`${name} = ${h}`, `${name} = ${h}`),
      note: nodes.length
        ? t(`<code>height</code> walks all ${plural(nodes.length, 'node')} of the ${where.en} subtree (${2 * nodes.length + 1} calls, counting the nulls) and reports <b>${h}</b>. A path bending at ${val[frame.key]} can go ${h} ${h === 1 ? 'edge' : 'edges'} down that side. The walk is then thrown away.`,
            `<code>height</code> သည် ${where.my}ဘက် subtree ၏ node ${nodes.length} ခုလုံးကို လျှောက်ပြီး (null များပါ call ${2 * nodes.length + 1} ခု) <b>${h}</b> ဟု ပြန်ပြောသည်။ ${val[frame.key]} တွင် ကွေ့သော လမ်းကြောင်းသည် ထိုဘက်သို့ edge ${h} ခု ဆင်းနိုင်သည်။ ထို့နောက် လျှောက်ခဲ့သမျှကို ပစ်လိုက်သည်။`)
        : t(`The ${where.en} side is empty: <code>height(null)</code> is <b>0</b>, one call. Nothing to go down on that side.`,
            `${where.my}ဘက် ဗလာ ဖြစ်သည် — <code>height(null)</code> သည် <b>0</b>၊ call တစ်ခု။ ထိုဘက်သို့ ဆင်းစရာ မရှိပါ။`) }));
  }

  function visit(key, from) {
    const frame = { key, lh: null, rh: null, left: null, right: null };
    frames.push(frame);
    if (key == null) {
      steps.push(snap({ line: 'base', cur: null, tag: t('null → 0', 'null → 0'),
        note: t(`${from.side === 0 ? 'Left' : 'Right'} of node ${val[from.key]}: nothing there. An empty subtree holds no path, so <b>0</b>.`,
                `node ${val[from.key]} ၏ ${from.side === 0 ? 'ဘယ်' : 'ညာ'}ဘက် — ဘာမျှ မရှိပါ။ ဗလာ subtree တွင် လမ်းကြောင်း မရှိသဖြင့် <b>0</b>။`) }));
      frames.pop();
      return 0;
    }
    steps.push(snap({ line: 'base', cur: key, tag: t('visit', 'ရောက်'),
      note: t(`Diameter of the subtree at <b>${val[key]}</b>. The longest path in it either bends at ${val[key]} itself, or lies entirely inside one of its two subtrees.`,
              `<b>${val[key]}</b> ရှိ subtree ၏ diameter။ ၎င်းအတွင်းရှိ အရှည်ဆုံး လမ်းကြောင်းသည် ${val[key]} ကိုယ်တိုင်တွင် ကွေ့သည်၊ သို့မဟုတ် subtree နှစ်ခုအနက် တစ်ခုအတွင်း လုံးလုံး ရှိသည်။`) }));
    measure(frame, 0);
    measure(frame, 1);

    const [l, r] = kids[key];
    steps.push(snap({ line: 'recl', cur: key, tag: t('ask left', 'ဘယ်ကို မေး'),
      note: t(`Bending here gives ${frame.lh} + ${frame.rh} = ${frame.lh + frame.rh}. Now the paths that stay inside the left subtree (rooted at ${nameOf(l, val)}) — a whole new diameter call, which will measure heights all over again.`,
              `ဤနေရာတွင် ကွေ့လျှင် ${frame.lh} + ${frame.rh} = ${frame.lh + frame.rh}။ ယခု ဘယ်ဘက် subtree (root ${nameOf(l, val)}) အတွင်းသာ ရှိသော လမ်းကြောင်းများ — diameter call အသစ်တစ်ခု ဖြစ်ပြီး height များကို အစမှ ပြန်တိုင်းမည်။`) }));
    frame.left = visit(l, { key, side: 0 });
    steps.push(snap({ line: 'recr', cur: key, tag: t('ask right', 'ညာကို မေး'),
      note: t(`The left subtree's longest path is <b>${frame.left}</b>. Now the right subtree (rooted at ${nameOf(r, val)}).`,
              `ဘယ်ဘက် subtree ၏ အရှည်ဆုံး လမ်းကြောင်းမှာ <b>${frame.left}</b>။ ယခု ညာဘက် subtree (root ${nameOf(r, val)})။`) }));
    frame.right = visit(r, { key, side: 1 });

    const through = frame.lh + frame.rh;
    const d = Math.max(through, frame.left, frame.right);
    diaOf[key] = d;
    const winner = d === through
      ? t(`bending at ${val[key]} wins`, `${val[key]} တွင် ကွေ့ခြင်းက နိုင်သည်`)
      : t(`a path below ${val[key]} is longer than any that bends at it`, `${val[key]} အောက်ရှိ လမ်းကြောင်းက ၎င်းတွင် ကွေ့သမျှထက် ရှည်သည်`);
    steps.push(snap({ line: 'ret', cur: key, tag: t(`return ${d}`, `${d} ပြန်`),
      note: frames.length === 1
        ? t(`max(${through}, ${frame.left}, ${frame.right}) = <b>${d}</b> — ${winner.en}. This is the root, so that is the diameter. ${calls} height() calls to get here.`,
            `max(${through}, ${frame.left}, ${frame.right}) = <b>${d}</b> — ${winner.my}။ ဤသည်မှာ root ဖြစ်သဖြင့် ၎င်းသည် diameter ဖြစ်သည်။ ဤနေရာရောက်ရန် height() call ${calls} ခု။`)
        : t(`max(${through}, ${frame.left}, ${frame.right}) = <b>${d}</b> — ${winner.en}. Hand it back.`,
            `max(${through}, ${frame.left}, ${frame.right}) = <b>${d}</b> — ${winner.my}။ ခေါ်သူထံ ပြန်ပေးသည်။`) }));
    frames.pop();
    return d;
  }

  const answer = visit(T.root, null);
  const last = steps[steps.length - 1];
  last.finished = true;
  last.answer = answer;
  return steps;
}

function buildDfs({ level }) {
  const T = buildTree(level);
  const { val, kids } = T;
  const steps = [];
  const frames = [];        // { key, left, right } for every height call still open
  const hOf = {};           // key → the height its call returned
  let best = 0;
  let bestAt = null;        // the node the longest path so far bends at
  const snap = (extra) => ({
    view: 'dfs', frames: frames.map((f) => ({ ...f })), hOf: { ...hOf }, best, bestAt, ...extra,
  });

  steps.push(snap({ line: 'init', cur: null, tag: t('best = 0', 'best = 0'),
    note: t('<code>best</code> will hold the longest path found so far, in edges. The helper returns something else — a height — and updates <code>best</code> on the side.',
            '<code>best</code> သည် ယခုထိ တွေ့ခဲ့သော အရှည်ဆုံး လမ်းကြောင်းကို edge ဖြင့် ကိုင်ထားမည်။ helper က အခြားတစ်ခု — height — ကို ပြန်ပေးပြီး <code>best</code> ကို ဘေးမှ update လုပ်သည်။') }));
  steps.push(snap({ line: 'call', cur: null, tag: t('height(root)', 'height(root)'),
    note: t(`One walk from the root, <b>${val[T.root]}</b>. Its return value is thrown away — the answer is what it leaves in <code>best</code>.`,
            `root <b>${val[T.root]}</b> မှ တစ်ကြိမ်တည်း လျှောက်သည်။ ၎င်း၏ ပြန်ပေးတန်ဖိုးကို ပစ်လိုက်သည် — အဖြေမှာ <code>best</code> ထဲတွင် ချန်ထားခဲ့သည့်အရာ ဖြစ်သည်။`) }));

  function visit(key, from) {
    const frame = { key, left: null, right: null };
    frames.push(frame);
    if (key == null) {
      steps.push(snap({ line: 'base', cur: null, tag: t('null → 0', 'null → 0'),
        note: t(`${from.side === 0 ? 'Left' : 'Right'} of node ${val[from.key]}: nothing there, height <b>0</b>.`,
                `node ${val[from.key]} ၏ ${from.side === 0 ? 'ဘယ်' : 'ညာ'}ဘက် — ဘာမျှ မရှိပါ၊ height <b>0</b>။`) }));
      frames.pop();
      return 0;
    }
    const [l, r] = kids[key];
    steps.push(snap({ line: 'base', cur: key, tag: t('visit', 'ရောက်'),
      note: t(`Node <b>${val[key]}</b>. Its height needs both children's heights first.`,
              `node <b>${val[key]}</b>။ ၎င်း၏ height အတွက် ကလေးနှစ်ခု၏ height ကို အရင် လိုသည်။`) }));
    steps.push(snap({ line: 'recl', cur: key, tag: t('ask left', 'ဘယ်ကို မေး'),
      note: t(`Ask the left subtree (rooted at ${nameOf(l, val)}) for its height.`,
              `ဘယ်ဘက် subtree (root ${nameOf(l, val)}) ကို ၎င်း၏ height ကို မေးသည်။`) }));
    frame.left = visit(l, { key, side: 0 });
    steps.push(snap({ line: 'recr', cur: key, tag: t('ask right', 'ညာကို မေး'),
      note: t(`Left said <b>${frame.left}</b>. Now the right subtree (rooted at ${nameOf(r, val)}).`,
              `ဘယ်က <b>${frame.left}</b> ဟု ဆိုသည်။ ယခု ညာဘက် subtree (root ${nameOf(r, val)})။`) }));
    frame.right = visit(r, { key, side: 1 });

    const through = frame.left + frame.right;
    const improved = through > best;
    const was = best;
    if (improved) { best = through; bestAt = key; }
    steps.push(snap({ line: 'best', cur: key, path: bendPath(key, kids), tag: improved ? t(`best = ${best}`, `best = ${best}`) : t('no better', 'မပိုကောင်း'),
      note: improved
        ? t(`Both heights are in hand, which is exactly what a path bending at ${val[key]} needs: ${frame.left} edges down the left, ${frame.right} down the right, <b>${through}</b> in all. Longer than ${was}, so <code>best</code> becomes ${through}.`,
            `height နှစ်ခုလုံး ရပြီ — ${val[key]} တွင် ကွေ့သော လမ်းကြောင်းအတွက် လိုသည့်အရာ အတိအကျ ဖြစ်သည်။ ဘယ်သို့ edge ${frame.left} ခု၊ ညာသို့ ${frame.right} ခု၊ စုစုပေါင်း <b>${through}</b>။ ${was} ထက် ရှည်သဖြင့် <code>best</code> သည် ${through} ဖြစ်လာသည်။`)
        : t(`The path bending at ${val[key]} is ${frame.left} + ${frame.right} = ${through} edges — not longer than ${best}, so <code>best</code> stays.`,
            `${val[key]} တွင် ကွေ့သော လမ်းကြောင်းမှာ ${frame.left} + ${frame.right} = edge ${through} ခု — ${best} ထက် မရှည်သဖြင့် <code>best</code> မပြောင်းပါ။`) }));

    const h = 1 + Math.max(frame.left, frame.right);
    hOf[key] = h;
    steps.push(snap({ line: 'up', cur: key, tag: t(`return ${h}`, `${h} ပြန်`),
      note: t(`Return 1 + max(${frame.left}, ${frame.right}) = <b>${h}</b>. A path that continues up through the parent can only use one side of ${val[key]}, so the parent gets the deeper side, not the sum.`,
              `1 + max(${frame.left}, ${frame.right}) = <b>${h}</b> ကို ပြန်ပေးသည်။ parent ကိုဖြတ်၍ အပေါ်ဆက်တက်သော လမ်းကြောင်းသည် ${val[key]} ၏ ဘက်တစ်ဘက်ကိုသာ သုံးနိုင်သဖြင့် parent သည် ပေါင်းလဒ် မဟုတ်ဘဲ ပိုနက်သော ဘက်ကို ရသည်။`) }));
    frames.pop();
    return h;
  }

  visit(T.root, null);
  steps.push(snap({ line: 'ret', cur: null, finished: true, answer: best,
    path: bestAt == null ? [] : bendPath(bestAt, kids), tag: t(`return ${best}`, `${best} ပြန်`),
    note: bestAt == null
      ? t(`Return <b>${best}</b>: a single node has no edges.`, `<b>${best}</b> ကို ပြန်ပေးသည် — node တစ်ခုတည်းတွင် edge မရှိပါ။`)
      : t(`Return <b>${best}</b>. The longest path bends at ${val[bestAt]}${bestAt === T.root ? ', the root' : ' — not at the root'}. Every node was visited once, and each one's height was worked out exactly once.`,
          `<b>${best}</b> ကို ပြန်ပေးသည်။ အရှည်ဆုံး လမ်းကြောင်းသည် ${val[bestAt]} တွင် ကွေ့သည်${bestAt === T.root ? ' — root ဖြစ်သည်' : ' — root တွင် မဟုတ်ပါ'}။ node တိုင်းကို တစ်ကြိမ်သာ ရောက်ခဲ့ပြီး height တစ်ခုစီကို တစ်ကြိမ်သာ တွက်ခဲ့သည်။`) }));
  return steps;
}

/* ---------------- drawing ----------------
 *
 * The strip card is the input in level order, with the nodes in play lit.
 * The stage draws the tree beside the call stack. In the brute force the
 * subtree height() is re-walking is amber and each finished call wears the
 * diameter it returned; in the DFS each finished node wears its height, and
 * the last frame lights the longest path.
 */

function strip(s, { level }) {
  const T = buildTree(level);
  const order = levelOrder(T, T.kids);
  if (!order.length) return '<span class="note mono">[]</span>';
  const tone = {};
  const waiting = new Set(s.frames.map((f) => f.key));
  const measuring = new Set(s.measuring ?? []);
  const path = new Set(s.path ?? []);
  const done = new Set(Object.keys(s.view === 'brute' ? s.diaOf : s.hOf).map(Number));
  order.forEach((x, i) => {
    if (x.key == null) tone[i] = 'done';
    else if (path.has(x.key) || x.key === s.cur) tone[i] = 'entering';
    else if (measuring.has(x.key) || waiting.has(x.key)) tone[i] = 'inwin';
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
  const shown = s.view === 'brute' ? s.diaOf : s.hOf;
  for (const [key, v] of Object.entries(shown)) { tone[id(Number(key))] = 'done'; badges[id(Number(key))] = v; }
  if (s.view === 'brute') for (const key of s.measuring) tone[id(key)] = 'warn';
  for (const key of s.path ?? []) tone[id(key)] = 'warn';
  return tree(asNested(T.root, T.val, T.kids), { at: s.cur != null ? id(s.cur) : null, tone, badges });
}

function draw(s, { level }) {
  const T = buildTree(level);
  const pic = treePicture(s, T);
  const top = s.frames[s.frames.length - 1];
  if (s.view === 'brute') {
    const frames = s.frames.map((f) => `diameter(${nameOf(f.key, T.val)})${f.lh != null ? ` · lh ${f.lh}` : ''}${f.rh != null ? ` rh ${f.rh}` : ''}`);
    const known = (v) => (v == null ? '—' : v);
    return stagePanel(pick(t('The tree — amber is what height() is re-walking; a badge is a finished diameter', 'tree — amber သည် height() ပြန်လျှောက်နေသည့်အရာ၊ badge သည် ပြီးသွားသော diameter')),
      pick(t(`${s.calls} height() calls`, `height() call ${s.calls} ခု`)),
      panels(pic, stack(frames, { label: 'call stack' }))
        + stageGap + readout({ lh: known(top?.lh), rh: known(top?.rh), 'height() calls': s.calls }));
  }
  const frames = s.frames.map((f) => `height(${nameOf(f.key, T.val)})${f.left != null ? ` · left ${f.left}` : ''}`);
  return stagePanel(pick(t('The tree — a badge is the height a node returned', 'tree — badge သည် node တစ်ခု ပြန်ပေးခဲ့သော height')),
    pick(t(`best ${s.best}${s.bestAt != null ? `, bending at ${T.val[s.bestAt]}` : ''}`, `best ${s.best}${s.bestAt != null ? ` — ${T.val[s.bestAt]} တွင် ကွေ့` : ''}`)),
    panels(pic, stack(frames, { label: 'call stack' }))
      + stageGap + readout({ best: s.best, 'bends at': s.bestAt == null ? '—' : T.val[s.bestAt] }));
}

function answer(s) {
  return {
    html: slots(s.finished ? [s.answer] : [], { total: 1, just: s.finished ? 0 : -1 }),
    note: s.finished ? t('edges on the longest path', 'အရှည်ဆုံး လမ်းကြောင်းပေါ်ရှိ edge') : t('one number', 'ကိန်း တစ်ခု'),
  };
}

function vars(s, { level }) {
  const T = buildTree(level);
  const f = s.frames[s.frames.length - 1];
  const known = (v) => (v == null ? '—' : v);
  if (s.view === 'brute') {
    return [['root', f ? nameOf(f.key, T.val) : '—'], ['lh', known(f?.lh)], ['rh', known(f?.rh)],
            ['left', known(f?.left)], ['right', known(f?.right)]];
  }
  return [['best', s.best], ['node', f ? nameOf(f.key, T.val) : '—'], ['left', known(f?.left)], ['right', known(f?.right)]];
}

/* ---------------- the code, one key per line ----------------
 *
 * Generated from the verified solution files, so the listing a reader copies
 * is byte-identical to the one that ran. */

const CODE = {
  brute: {
    ruby: [
      [null, `${k('def')} diameter_of_binary_tree(root)`],
      ['base', `  ${k('return')} 0 ${k('if')} root.nil?                      ${c('# an empty tree has no path')}`],
      ['hl', `  lh = height(root.left)                     ${c('# re-walks the whole left subtree')}`],
      ['hr', `  rh = height(root.right)                    ${c('# ...and the whole right one')}`],
      ['recl', `  left = diameter_of_binary_tree(root.left)`],
      ['recr', `  right = diameter_of_binary_tree(root.right)`],
      ['ret', `  [lh + rh, left, right].max                 ${c('# bend here, or somewhere below')}`],
      [null, `${k('end')}`],
      [null, ``],
      [null, `${k('def')} height(node)`],
      [null, `  ${k('return')} 0 ${k('if')} node.nil?`],
      [null, `  1 + [height(node.left), height(node.right)].max`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('import')} sys`],
      [null, `sys.setrecursionlimit(20_000)            ${c('# 10^4 levels deep; the default is 1,000')}`],
      [null, ``],
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} diameterOfBinaryTree(self, root):`],
      ['base', `        ${k('if')} root ${k('is')} ${k('None')}:                     ${c('# an empty tree has no path')}`],
      [null, `            ${k('return')} 0`],
      ['hl', `        lh = self.height(root.left)          ${c('# re-walks the whole left subtree')}`],
      ['hr', `        rh = self.height(root.right)         ${c('# ...and the whole right one')}`],
      ['recl', `        left = self.diameterOfBinaryTree(root.left)`],
      ['recr', `        right = self.diameterOfBinaryTree(root.right)`],
      ['ret', `        ${k('return')} max(lh + rh, left, right)     ${c('# bend here, or somewhere below')}`],
      [null, ``],
      [null, `    ${k('def')} height(self, node):`],
      [null, `        ${k('if')} node ${k('is')} ${k('None')}:`],
      [null, `            ${k('return')} 0`],
      [null, `        ${k('return')} 1 + max(self.height(node.left), self.height(node.right))`],
    ],
    javascript: [
      [null, `${k('var')} diameterOfBinaryTree = ${k('function')} (root) {`],
      ['base', `  ${k('if')} (root === ${k('null')}) ${k('return')} 0;               ${c('// an empty tree has no path')}`],
      ['hl', `  ${k('const')} lh = height(root.left);              ${c('// re-walks the whole left subtree')}`],
      ['hr', `  ${k('const')} rh = height(root.right);             ${c('// ...and the whole right one')}`],
      ['recl', `  ${k('const')} left = diameterOfBinaryTree(root.left);`],
      ['recr', `  ${k('const')} right = diameterOfBinaryTree(root.right);`],
      ['ret', `  ${k('return')} Math.max(lh + rh, left, right);     ${c('// bend here, or somewhere below')}`],
      [null, `};`],
      [null, ``],
      [null, `${k('function')} height(node) {`],
      [null, `  ${k('if')} (node === ${k('null')}) ${k('return')} 0;`],
      [null, `  ${k('return')} 1 + Math.max(height(node.left), height(node.right));`],
      [null, `}`],
    ],
    go: [
      [null, `${k('func')} diameterOfBinaryTree(root *TreeNode) int {`],
      ['base', `    ${k('if')} root == ${k('nil')} {                         ${c('// an empty tree has no path')}`],
      [null, `        ${k('return')} 0`],
      [null, `    }`],
      ['hl', `    lh := height(root.Left)                  ${c('// re-walks the whole left subtree')}`],
      ['hr', `    rh := height(root.Right)                 ${c('// ...and the whole right one')}`],
      ['recl', `    left := diameterOfBinaryTree(root.Left)`],
      ['recr', `    right := diameterOfBinaryTree(root.Right)`],
      ['ret', `    ${k('return')} max(lh+rh, left, right)           ${c('// bend here, or somewhere below')}`],
      [null, `}`],
      [null, ``],
      [null, `${k('func')} height(node *TreeNode) int {`],
      [null, `    ${k('if')} node == ${k('nil')} {`],
      [null, `        ${k('return')} 0`],
      [null, `    }`],
      [null, `    ${k('return')} 1 + max(height(node.Left), height(node.Right))`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('use')} std::cell::RefCell;`],
      [null, `${k('use')} std::rc::Rc;`],
      [null, ``],
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} diameter_of_binary_tree(root: Option&lt;Rc&lt;RefCell&lt;TreeNode&gt;&gt;&gt;) -&gt; i32 {`],
      [null, `        ${k('let')} node = ${k('match')} root {`],
      ['base', `            ${k('None')} =&gt; ${k('return')} 0,                ${c('// an empty tree has no path')}`],
      [null, `            ${k('Some')}(node) =&gt; node,`],
      [null, `        };`],
      [null, `        ${k('let')} node = node.borrow();`],
      ['hl', `        ${k('let')} lh = ${k('Self')}::height(&amp;node.left);   ${c('// re-walks the whole left subtree')}`],
      ['hr', `        ${k('let')} rh = ${k('Self')}::height(&amp;node.right);  ${c('// ...and the whole right one')}`],
      ['recl', `        ${k('let')} left = ${k('Self')}::diameter_of_binary_tree(node.left.clone());`],
      ['recr', `        ${k('let')} right = ${k('Self')}::diameter_of_binary_tree(node.right.clone());`],
      ['ret', `        (lh + rh).max(left).max(right)       ${c('// bend here, or somewhere below')}`],
      [null, `    }`],
      [null, ``],
      [null, `    ${k('fn')} height(node: &amp;Option&lt;Rc&lt;RefCell&lt;TreeNode&gt;&gt;&gt;) -&gt; i32 {`],
      [null, `        ${k('match')} node {`],
      [null, `            ${k('None')} =&gt; 0,`],
      [null, `            ${k('Some')}(node) =&gt; {`],
      [null, `                ${k('let')} node = node.borrow();`],
      [null, `                1 + ${k('Self')}::height(&amp;node.left).max(${k('Self')}::height(&amp;node.right))`],
      [null, `            }`],
      [null, `        }`],
      [null, `    }`],
      [null, `}`],
    ],
  },
  dfs: {
    ruby: [
      [null, `${k('def')} diameter_of_binary_tree(root)`],
      ['init', `  @best = 0                                  ${c('# the longest path seen so far, in edges')}`],
      ['call', `  height(root)`],
      ['ret', `  @best`],
      [null, `${k('end')}`],
      [null, ``],
      [null, `${k('def')} height(node)`],
      ['base', `  ${k('return')} 0 ${k('if')} node.nil?`],
      ['recl', `  left = height(node.left)`],
      ['recr', `  right = height(node.right)`],
      ['best', `  @best = [@best, left + right].max          ${c('# the path that bends at this node')}`],
      ['up', `  1 + [left, right].max                      ${c('# but only one side can go up')}`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('import')} sys`],
      [null, `sys.setrecursionlimit(20_000)            ${c('# 10^4 levels deep; the default is 1,000')}`],
      [null, ``],
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} diameterOfBinaryTree(self, root):`],
      ['init', `        best = 0                             ${c('# the longest path seen so far, in edges')}`],
      [null, ``],
      [null, `        ${k('def')} height(node):`],
      [null, `            ${k('nonlocal')} best`],
      ['base', `            ${k('if')} node ${k('is')} ${k('None')}:`],
      [null, `                ${k('return')} 0`],
      ['recl', `            left = height(node.left)`],
      ['recr', `            right = height(node.right)`],
      ['best', `            best = max(best, left + right)   ${c('# the path that bends at this node')}`],
      ['up', `            ${k('return')} 1 + max(left, right)      ${c('# but only one side can go up')}`],
      [null, ``],
      ['call', `        height(root)`],
      ['ret', `        ${k('return')} best`],
    ],
    javascript: [
      [null, `${k('var')} diameterOfBinaryTree = ${k('function')} (root) {`],
      ['init', `  ${k('let')} best = 0;                              ${c('// the longest path seen so far, in edges')}`],
      [null, `  ${k('const')} height = (node) =&gt; {`],
      ['base', `    ${k('if')} (node === ${k('null')}) ${k('return')} 0;`],
      ['recl', `    ${k('const')} left = height(node.left);`],
      ['recr', `    ${k('const')} right = height(node.right);`],
      ['best', `    best = Math.max(best, left + right);     ${c('// the path that bends at this node')}`],
      ['up', `    ${k('return')} 1 + Math.max(left, right);        ${c('// but only one side can go up')}`],
      [null, `  };`],
      ['call', `  height(root);`],
      ['ret', `  ${k('return')} best;`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} diameterOfBinaryTree(root *TreeNode) int {`],
      ['init', `    best := 0                                ${c('// the longest path seen so far, in edges')}`],
      [null, `    ${k('var')} height ${k('func')}(node *TreeNode) int`],
      [null, `    height = ${k('func')}(node *TreeNode) int {`],
      ['base', `        ${k('if')} node == ${k('nil')} {`],
      [null, `            ${k('return')} 0`],
      [null, `        }`],
      ['recl', `        left := height(node.Left)`],
      ['recr', `        right := height(node.Right)`],
      ['best', `        best = max(best, left+right)         ${c('// the path that bends at this node')}`],
      ['up', `        ${k('return')} 1 + max(left, right)          ${c('// but only one side can go up')}`],
      [null, `    }`],
      ['call', `    height(root)`],
      ['ret', `    ${k('return')} best`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('use')} std::cell::RefCell;`],
      [null, `${k('use')} std::rc::Rc;`],
      [null, ``],
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} diameter_of_binary_tree(root: Option&lt;Rc&lt;RefCell&lt;TreeNode&gt;&gt;&gt;) -&gt; i32 {`],
      ['init', `        ${k('let')} ${k('mut')} best = 0;                    ${c('// the longest path seen so far, in edges')}`],
      ['call', `        ${k('Self')}::height(&amp;root, &amp;${k('mut')} best);`],
      ['ret', `        best`],
      [null, `    }`],
      [null, ``],
      [null, `    ${k('fn')} height(node: &amp;Option&lt;Rc&lt;RefCell&lt;TreeNode&gt;&gt;&gt;, best: &amp;${k('mut')} i32) -&gt; i32 {`],
      [null, `        ${k('let')} node = ${k('match')} node {`],
      ['base', `            ${k('None')} =&gt; ${k('return')} 0,`],
      [null, `            ${k('Some')}(node) =&gt; node.borrow(),`],
      [null, `        };`],
      ['recl', `        ${k('let')} left = ${k('Self')}::height(&amp;node.left, best);`],
      ['recr', `        ${k('let')} right = ${k('Self')}::height(&amp;node.right, best);`],
      ['best', `        *best = (*best).max(left + right);   ${c('// the path that bends at this node')}`],
      ['up', `        1 + left.max(right)                  ${c('// but only one side can go up')}`],
      [null, `    }`],
      [null, `}`],
    ],
  },
};

/* ---------------- part 1: the "where does it bend" widget ----------------
 *
 * Two words in the statement carry the problem: length counts *edges*, and the
 * path "may or may not pass through the root". Every path has a highest node
 * where it bends, so drag the bend through every node and watch the longest
 * path that turns there — its length is left height + right height. The
 * third preset is a tree whose longest path never touches the root.
 *
 * Built from x-sum's widget vocabulary: .q-arr cells (kept / cut), the
 * .q-slider, the amber .q-tie line and the .ledger.
 */

const QW_SETS = [
  { label: t('example 1', 'ဥပမာ 1'), level: [1, 2, 3, 4, 5] },
  { label: t('example 2', 'ဥပမာ 2'), level: [1, 2] },
  { label: t('misses the root', 'root ကို မဖြတ်'), level: [1, 2, null, 3, 4, 5, null, null, 6] },
  { label: t('a chain', 'ကွင်းဆက်'), level: [1, 2, null, 3, null, 4] },
];

function mountBendWidget(host) {
  const state = { set: 2, b: 0 };

  host.innerHTML = `
    <div data-tree></div>
    <div class="q-arr" data-arr></div>
    <div class="q-slider">
      <label for="qw-b" data-lbl></label>
      <input type="range" id="qw-b" min="1" max="1" value="1">
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
    const { val, kids } = T;
    const order = preorderKeys(T.root, kids);
    const b = Math.min(state.b, order.length - 1);
    const bend = order[b];
    const lh = treeDepth(kids[bend][0], kids);
    const rh = treeDepth(kids[bend][1], kids);
    const len = lh + rh;
    const best = Math.max(...order.map((key) => treeDepth(kids[key][0], kids) + treeDepth(kids[key][1], kids)));
    const bestAt = order.find((key) => treeDepth(kids[key][0], kids) + treeDepth(kids[key][1], kids) === best);
    const path = bendPath(bend, kids);

    q('[data-lbl]').textContent = pick(t('bend at', 'ကွေ့ရာ'));
    const slider = q('#qw-b');
    slider.max = String(order.length);
    slider.value = String(b + 1);
    q('[data-out]').textContent = String(val[bend]);
    q('[data-presets]').innerHTML = presetChips(QW_SETS, state.set);

    const tone = {};
    path.forEach((key) => { tone[order.indexOf(key)] = 'warn'; });
    q('[data-tree]').innerHTML = tree(asNested(T.root, val, kids), { at: b, tone });
    // kept = a longest path · cut = a shorter one
    q('[data-arr]').innerHTML = path.map((key, i) =>
      `<div class="cell ${len === best ? 'kept' : 'cut'}"><span>${val[key]}</span><span class="idx">${i}</span></div>`).join('');

    widgetLabel(pick(t(`${plural(order.length, 'node')}, diameter ${best}`, `node ${order.length} ခု၊ diameter ${best}`)));

    const nodes = path.length;
    q('[data-line]').innerHTML = pick(len === 0
      ? t(`Nothing hangs below ${val[bend]}, so a path bending here is the single node: ${nodes} node, 0 edges.`,
          `${val[bend]} အောက်တွင် ဘာမျှ မရှိသဖြင့် ဤနေရာတွင် ကွေ့သော လမ်းကြောင်းမှာ node တစ်ခုတည်း — node ${nodes} ခု၊ edge 0။`)
      : len === best
        ? t(`${nodes} nodes, ${len} edges — a longest path. The answer is ${best}, the edges, not the ${nodes} nodes.${bend === T.root ? '' : ' And it never touches the root.'}`,
            `node ${nodes} ခု၊ edge ${len} ခု — အရှည်ဆုံး လမ်းကြောင်း။ အဖြေမှာ node ${nodes} ခု မဟုတ်ဘဲ edge ${best} ခု ဖြစ်သည်။${bend === T.root ? '' : ' ၎င်းသည် root ကို လုံးဝ မဖြတ်ပါ။'}`)
        : t(`${len} edges bending here${bend === T.root ? ', at the root' : ''}. The longest path bends at ${val[bestAt]} instead, with ${best}.`,
            `ဤနေရာတွင် ကွေ့လျှင် edge ${len} ခု${bend === T.root ? ' (root တွင်)' : ''}။ အရှည်ဆုံး လမ်းကြောင်းကမူ ${val[bestAt]} တွင် ကွေ့ပြီး ${best} ရှိသည်။`));

    // the ledger is a formula, as on x-sum
    q('[data-expr]').innerHTML = `left ${lh} + right ${rh} = ${len} edges`;
    q('[data-total]').innerHTML = `${best}<small>${pick(t('diameter', 'diameter'))}</small>`;
  }

  host.addEventListener('input', (ev) => {
    if (ev.target.id !== 'qw-b') return;
    state.b = Number(ev.target.value) - 1; render();
  });
  host.addEventListener('click', (ev) => {
    const chip = ev.target.closest('[data-set]');
    if (!chip) return;
    state.set = Number(chip.dataset.set);
    state.b = 0;
    render();
  });
  onLangChange(render);
  render();
}

/* The constraints start at one node, and a diameter needs somewhere to bend. */
function atLeastOne(text) {
  const level = treeInput(MAX_NODES)(text);
  if (!level.length) throw new Error('at least one node — the constraints start at 1');
  return level;
}

/* ---------------- the approach, in brief ----------------
 *
 * Shown in part 2 under the approach tabs: the idea, the steps as the code
 * takes them (named after its identifiers), and the cost with its reason. */

const APPROACH = {
  brute: {
    idea: t("Every path has a highest node where it bends, and the longest path bending at a node is its left height plus its right height. Try that at every node.",
        "လမ်းကြောင်းတိုင်းတွင် ကွေ့ရာ အမြင့်ဆုံး node တစ်ခု ရှိပြီး node တစ်ခုတွင် ကွေ့သော အရှည်ဆုံး လမ်းကြောင်းသည် ၎င်း၏ ဘယ် height နှင့် ညာ height ပေါင်းလဒ် ဖြစ်သည်။ node တိုင်းတွင် စမ်းသည်။"),
    steps: [
      t("An empty tree has no path: return 0.",
        "ဗလာ tree တွင် လမ်းကြောင်း မရှိ — 0 ကို ပြန်ပေးသည်။"),
      t("Measure <code>lh</code> and <code>rh</code>, the heights of the two subtrees, each with its own <code>height</code> walk.",
        "subtree နှစ်ခု၏ height <code>lh</code> နှင့် <code>rh</code> ကို <code>height</code> ဖြင့် သီးခြားစီ လျှောက်၍ တိုင်းသည်။"),
      t("Find <code>left</code> and <code>right</code>, the diameters inside each subtree.",
        "subtree တစ်ခုစီအတွင်းရှိ diameter <code>left</code> နှင့် <code>right</code> ကို ရှာသည်။"),
      t("Return the largest of <code>lh + rh</code>, <code>left</code> and <code>right</code>.",
        "<code>lh + rh</code>၊ <code>left</code> နှင့် <code>right</code> အနက် အကြီးဆုံးကို ပြန်ပေးသည်။"),
    ],
    cost: t("<code>height</code> re-walks each subtree once for every ancestor: 100,010,000 calls on a 10⁴-node chain.",
        "<code>height</code> သည် subtree တစ်ခုစီကို ancestor တစ်ခုလျှင် တစ်ကြိမ် ပြန်လျှောက်သည် — node 10⁴ ကွင်းဆက်တွင် call 100,010,000။"),
  },
  dfs: {
    idea: t("A height recursion already has both children's heights in hand at every node, and their sum is the path that bends there. Record the best sum while returning heights.",
        "height recursion တွင် node တိုင်း၌ ကလေးနှစ်ခု၏ height ရှိပြီးသား ဖြစ်ပြီး ၎င်းတို့၏ ပေါင်းလဒ်သည် ထိုနေရာတွင် ကွေ့သော လမ်းကြောင်း ဖြစ်သည်။ height များ ပြန်ပေးရင်း အကောင်းဆုံး ပေါင်းလဒ်ကို မှတ်သည်။"),
    steps: [
      t("Start with <code>best = 0</code> and call <code>height(root)</code>.",
        "<code>best = 0</code> ဖြင့် စပြီး <code>height(root)</code> ကို ခေါ်သည်။"),
      t("In <code>height</code>, an empty node has height 0.",
        "<code>height</code> ထဲတွင် ဗလာ node ၏ height မှာ 0။"),
      t("Get <code>left</code> and <code>right</code>, then set <code>best</code> to the larger of <code>best</code> and <code>left + right</code>.",
        "<code>left</code> နှင့် <code>right</code> ကို ရယူပြီး <code>best</code> ကို <code>best</code> နှင့် <code>left + right</code> အနက် ကြီးသည့်တစ်ခု ဖြစ်စေသည်။"),
      t("Return 1 plus the larger of <code>left</code> and <code>right</code>: only one side can continue up.",
        "<code>left</code> နှင့် <code>right</code> အနက် ကြီးသည့်တစ်ခုကို 1 ပေါင်း၍ ပြန်ပေးသည် — ဘက်တစ်ဘက်သာ အပေါ်ဆက်တက်နိုင်သည်။"),
      t("The answer is <code>best</code>.",
        "အဖြေမှာ <code>best</code> ဖြစ်သည်။"),
    ],
    cost: t("every node visited once: 20,001 calls on the same chain, counting the ones on null.",
        "node တိုင်းကို တစ်ကြိမ်သာ ရောက်သည် — ထိုကွင်းဆက်တွင်ပင် null ပေါ်ရှိ call များပါ call 20,001။"),
  },
};

/* ---------------- mount ----------------
 *
 * Last in the file on purpose: mountLesson runs the widget immediately, so
 * every const the widget reads must already be initialised. */

mountLesson({
  input: { level: [1, 2, 3, 4, 5] },
  controls: [
    { key: 'level', label: 'root', value: '1, 2, 3, 4, 5', parse: atLeastOne, format: formatLevelOrder },
  ],
  presets: [
    { label: exampleTitle(1), input: { level: [1, 2, 3, 4, 5] } },
    { label: exampleTitle(2), input: { level: [1, 2] } },
    { label: t('Misses the root', 'root ကို မဖြတ်'), input: { level: [1, 2, null, 3, 4, 5, null, null, 6] } },
    { label: t('One node', 'node တစ်ခု'), input: { level: [7] } },
    { label: t('A chain', 'ကွင်းဆက်'), input: { level: [1, 2, null, 3, null, 4, null, 5] } },
  ],
  examples: [
    { title: exampleTitle(1), inputHtml: '<code>root = [1,2,3,4,5]</code>', output: '3',
      why: [t('The paths 4 → 2 → 1 → 3 and 5 → 2 → 1 → 3 each have 3 edges. Both bend at the root: 2 edges down the left, 1 down the right.',
              '4 → 2 → 1 → 3 နှင့် 5 → 2 → 1 → 3 လမ်းကြောင်းများတွင် edge 3 ခုစီ ရှိသည်။ နှစ်ခုလုံး root တွင် ကွေ့သည် — ဘယ်သို့ edge 2 ခု၊ ညာသို့ 1 ခု။'),
            t('Length counts edges, so a 4-node path is 3 long.',
              'အရှည်သည် edge များကို ရေတွက်သဖြင့် node 4 ခုပါ လမ်းကြောင်း၏ အရှည်မှာ 3 ဖြစ်သည်။')],
      load: { level: [1, 2, 3, 4, 5] } },
    { title: exampleTitle(2), inputHtml: '<code>root = [1,2]</code>', output: '1',
      why: [t('Two nodes, one edge between them. That single edge is the longest path.',
              'node နှစ်ခု၊ ၎င်းတို့ကြားတွင် edge တစ်ခု။ ထို edge တစ်ခုတည်းသည် အရှည်ဆုံး လမ်းကြောင်း ဖြစ်သည်။')],
      load: { level: [1, 2] } },
  ],
  modes: [
    { id: 'brute', name: 'Height at every node',
      desc: t('At each node, measure both heights from scratch.', 'node တိုင်းတွင် height နှစ်ခုကို အစမှ တိုင်းသည်။'),
      cost: 'O(n²) time · O(h) stack', build: buildBrute },
    { id: 'dfs', name: 'One DFS returning height',
      desc: t('Return the height, record the bend on the way.', 'height ကို ပြန်ပေးပြီး ကွေ့ရာကို လမ်းတွင် မှတ်သည်။'),
      cost: 'O(n) time · O(h) stack', build: buildDfs },
  ],
  languages: LANGUAGES,
  code: CODE,
  solutions: {
    brute: { approach: APPROACH.brute, desc: t('The definition, checked at every node: the longest path bends here or lies below. Correct, but height() re-walks each subtree once for every ancestor — about 10⁸ calls on a 10⁴-node chain.',
                     'အဓိပ္ပာယ်ကို node တိုင်းတွင် စစ်ခြင်း — အရှည်ဆုံး လမ်းကြောင်းသည် ဤနေရာတွင် ကွေ့သည် သို့မဟုတ် အောက်တွင် ရှိသည်။ မှန်သည်၊ သို့သော် height() သည် subtree တစ်ခုစီကို ၎င်း၏ ancestor တစ်ခုလျှင် တစ်ကြိမ် ပြန်လျှောက်သည် — node 10⁴ ကွင်းဆက်တွင် call 10⁸ ခန့်။') },
    dfs: { approach: APPROACH.dfs, desc: t('Maximum Depth\'s recursion with one extra line: a node already has both children\'s heights when it returns, and their sum is the path that bends there. Each node is visited once.',
                   'Maximum Depth ၏ recursion ကို စာကြောင်း တစ်ကြောင်း ထပ်ထည့်ထားခြင်း — node တစ်ခု ပြန်ပေးချိန်တွင် ကလေးနှစ်ခု၏ height ရှိပြီးသား ဖြစ်ပြီး ၎င်းတို့၏ ပေါင်းလဒ်သည် ထိုနေရာတွင် ကွေ့သော လမ်းကြောင်း ဖြစ်သည်။ node တစ်ခုစီကို တစ်ကြိမ်သာ ရောက်သည်။') },
  },
  // How each language was actually checked, printed as the part 3 badges.
  // The corpus: the 2 examples, a single node, 15,000 random trees of up to 9
  // nodes, 5,000 of up to 300, and six at the 10⁴-node constraint (all-left,
  // all-right and zigzag chains, a random tree, a complete tree, a deep chain
  // that forks) — against an oracle that treats the tree as a graph and finds
  // the longest shortest path (all pairs, or double BFS when big). Go and Rust
  // ran in Docker (golang:1.23-alpine, rust:1-slim).
  // Measured cold, one 10⁴ chain per process: Ruby 3.1's default stack
  // overflows past 7,705 nodes (brute) and 8,732 (DFS); Node 24's past 6,219
  // and 7,773. Both pass all 20,009 cases with a larger stack
  // (RUBY_THREAD_VM_STACK_SIZE, node --stack-size).
  verification: {
    ruby: 'ran here · overflows Ruby 3.1\'s default stack at 10⁴ deep',
    python: 'ran here · 20,009 cases',
    javascript: 'ran here · overflows Node 24\'s default stack at 10⁴ deep',
    go: 'ran here · 20,009 cases · Go 1.23',
    rust: 'ran here · 20,009 cases · rustc 1.98',
  },
  caveats: {
    brute: {
      ruby: t('Correct on all 20,009 cases with a larger stack, but on Ruby 3.1\'s default stack this overflows (<code>SystemStackError</code>) on a chain longer than 7,705 nodes — measured here — and the constraints allow 10⁴.',
              'stack ပိုကြီးလျှင် case 20,009 ခုလုံးတွင် မှန်သည်၊ သို့သော် Ruby 3.1 ၏ default stack ပေါ်တွင် node 7,705 ထက် ရှည်သော ကွင်းဆက်တွင် overflow (<code>SystemStackError</code>) ဖြစ်သည် — ဤနေရာတွင် တိုင်းတာထားသည် — ကန့်သတ်ချက်က 10⁴ ကို ခွင့်ပြုသည်။'),
      python: t('Python stops at 1,000 levels by default, so the listing raises the limit first. On the 10⁴-node chain this version took 4.3 s here (Apple M5 Pro) — about 10⁸ calls to <code>height</code>.',
                'Python သည် default အားဖြင့် အဆင့် 1,000 တွင် ရပ်သဖြင့် listing က limit ကို အရင် မြှင့်ထားသည်။ node 10⁴ ကွင်းဆက်တွင် ဤပုံစံသည် ဤနေရာ (Apple M5 Pro) တွင် 4.3 စက္ကန့် ကြာသည် — <code>height</code> ကို call 10⁸ ခန့်။'),
      javascript: t('Correct on all 20,009 cases with a larger stack, but on Node 24\'s default stack, run cold, it overflows (<code>RangeError</code>) on a chain longer than 6,219 nodes — measured here. Whether LeetCode\'s runner gives more stack is not something this page could check.',
                    'stack ပိုကြီးလျှင် case 20,009 ခုလုံးတွင် မှန်သည်၊ သို့သော် Node 24 ၏ default stack ပေါ်တွင် cold run လုပ်လျှင် node 6,219 ထက် ရှည်သော ကွင်းဆက်တွင် overflow (<code>RangeError</code>) ဖြစ်သည် — ဤနေရာတွင် တိုင်းတာထားသည်။ LeetCode ၏ runner က stack ပိုပေးမပေး ဤစာမျက်နှာက မစစ်နိုင်ပါ။'),
    },
    dfs: {
      ruby: t('Correct on all 20,009 cases with a larger stack, but on Ruby 3.1\'s default stack this overflows (<code>SystemStackError</code>) on a chain longer than 8,732 nodes — measured here — and the constraints allow 10⁴.',
              'stack ပိုကြီးလျှင် case 20,009 ခုလုံးတွင် မှန်သည်၊ သို့သော် Ruby 3.1 ၏ default stack ပေါ်တွင် node 8,732 ထက် ရှည်သော ကွင်းဆက်တွင် overflow (<code>SystemStackError</code>) ဖြစ်သည် — ဤနေရာတွင် တိုင်းတာထားသည် — ကန့်သတ်ချက်က 10⁴ ကို ခွင့်ပြုသည်။'),
      python: t('Python stops at 1,000 levels by default, and the constraints allow 10⁴, so the listing raises the limit first.',
                'Python သည် default အားဖြင့် အဆင့် 1,000 တွင် ရပ်ပြီး ကန့်သတ်ချက်က 10⁴ ကို ခွင့်ပြုသဖြင့် listing က limit ကို အရင် မြှင့်ထားသည်။'),
      javascript: t('Correct on all 20,009 cases with a larger stack, but on Node 24\'s default stack, run cold, it overflows (<code>RangeError</code>) on a chain longer than 7,773 nodes — measured here. Whether LeetCode\'s runner gives more stack is not something this page could check.',
                    'stack ပိုကြီးလျှင် case 20,009 ခုလုံးတွင် မှန်သည်၊ သို့သော် Node 24 ၏ default stack ပေါ်တွင် cold run လုပ်လျှင် node 7,773 ထက် ရှည်သော ကွင်းဆက်တွင် overflow (<code>RangeError</code>) ဖြစ်သည် — ဤနေရာတွင် တိုင်းတာထားသည်။ LeetCode ၏ runner က stack ပိုပေးမပေး ဤစာမျက်နှာက မစစ်နိုင်ပါ။'),
    },
  },
  strip,
  stripLabel: t('The tree in level order (∅ = null)', 'Tree — level order (∅ = null)'),
  draw,
  answer,
  vars,
  hover: { ruby: { '@best': 'best' } },
  widget: mountBendWidget,
});
