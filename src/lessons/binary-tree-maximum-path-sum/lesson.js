/* Binary Tree Maximum Path Sum — LeetCode 124.
 *
 * Every path has one highest node, where it bends: it comes up one side and
 * goes down the other. So the best path is, for some node, its value plus the
 * best path going down its left side plus the best going down its right —
 * where a side worth less than nothing is simply left out. Trying every node
 * as the top, and measuring those downward sums from scratch each time, is
 * O(n²). One post-order pass returns each node's best downward sum to its
 * parent and records the bend on the way back: O(n).
 */
import { mountLesson } from '../../lib/stepper.js';
import { pick, onLangChange } from '../../lib/i18n.js';
import { cells, tree, stack, readout, panels, slots, stagePanel } from '../../lib/stage.js';
import { t, exampleTitle, LANGUAGES, k, c, stageGap, presetChips, widgetLabel } from '../../lib/kit.js';
import { buildTree, levelOrder, asNested, preorderKeys, nameOf, treeInput, formatLevelOrder } from '../../lib/tree.js';

const MAX_NODES = 15;

/* The best sum of a path that starts at `key` and goes down (0 for none). */
const down = (key, T) => (key == null ? 0
  : T.val[key] + Math.max(0, down(T.kids[key][0], T), down(T.kids[key][1], T)));
/* The nodes of that path. */
function downPath(key, T) {
  const out = [];
  while (key != null) {
    out.push(key);
    const [l, r] = T.kids[key];
    const dl = down(l, T), dr = down(r, T);
    if (Math.max(dl, dr) <= 0) break;
    key = dl >= dr ? l : r;
  }
  return out;
}
const bendPath = (key, T) => {
  const [l, r] = T.kids[key];
  return [...(down(l, T) > 0 ? downPath(l, T).reverse() : []), key, ...(down(r, T) > 0 ? downPath(r, T) : [])];
};
function subtree(key, kids, out = []) {
  if (key == null) return out;
  out.push(key); subtree(kids[key][0], kids, out); subtree(kids[key][1], kids, out);
  return out;
}

/* ---------------- step generators ---------------- */

function buildEvery({ level }) {
  const T = buildTree(level);
  const { val, kids } = T;
  const steps = [];
  const frames = [];
  const bestOf = {};
  let calls = 0;
  const snap = (extra) => ({ view: 'every', frames: frames.map((f) => ({ ...f })), marks: { ...bestOf }, calls, measuring: [], ...extra });

  function best(key, from) {
    const frame = { key, dl: null, dr: null };
    frames.push(frame);
    if (key == null) {
      steps.push(snap({ line: 'base', cur: null, tag: t('null → −∞', 'null → −∞'),
        note: t(`${from.side ? 'Right' : 'Left'} of node ${val[from.key]}: no nodes, so no path — −∞, which never wins a max.`,
                `node ${val[from.key]} ၏ ${from.side ? 'ညာ' : 'ဘယ်'} — node မရှိ၊ လမ်းကြောင်း မရှိ — −∞၊ max တွင် ဘယ်တော့မှ မနိုင်။`) }));
      frames.pop();
      return -Infinity;
    }
    const [l, r] = kids[key];
    for (const side of [0, 1]) {
      const ch = kids[key][side];
      const nodes = subtree(ch, kids);
      const d = down(ch, T);
      calls += 2 * nodes.length + 1;
      frame[side ? 'dr' : 'dl'] = d;
      steps.push(snap({ line: 'down', cur: key, measuring: nodes, tag: t(`${side ? 'right' : 'left'} down = ${d}`, `${side ? 'ညာ' : 'ဘယ်'} down = ${d}`),
        note: nodes.length
          ? t(`<code>down</code> walks all ${nodes.length} nodes of the ${side ? 'right' : 'left'} subtree of ${val[key]} to find the best path starting there and going down: <b>${d}</b>. The walk is thrown away afterwards.`,
              `<code>down</code> သည် ${val[key]} ၏ ${side ? 'ညာ' : 'ဘယ်'} subtree ၏ node ${nodes.length} ခုလုံးကို လျှောက်၍ ထိုနေရာမှ စ၍ အောက်သို့ဆင်းသော အကောင်းဆုံး လမ်းကြောင်းကို ရှာသည် — <b>${d}</b>။ ထို့နောက် လျှောက်ခဲ့သမျှကို ပစ်သည်။`)
          : t(`The ${side ? 'right' : 'left'} side of ${val[key]} is empty: <code>down</code> gives 0.`, `${val[key]} ၏ ${side ? 'ညာ' : 'ဘယ်'}ဘက် ဗလာ — <code>down</code> သည် 0 ပေးသည်။`) }));
    }
    const top = val[key] + Math.max(0, frame.dl) + Math.max(0, frame.dr);
    frame.top = top;
    steps.push(snap({ line: 'top', cur: key, path: bendPath(key, T), tag: t(`top = ${top}`, `top = ${top}`),
      note: t(`The best path with ${val[key]} at its top: ${val[key]} + max(0, ${frame.dl}) + max(0, ${frame.dr}) = <b>${top}</b>. A side worth less than nothing is left out.`,
              `${val[key]} ကို ထိပ်တွင် ထားသော အကောင်းဆုံး လမ်းကြောင်း — ${val[key]} + max(0, ${frame.dl}) + max(0, ${frame.dr}) = <b>${top}</b>။ ဘာမှမရှိသည်ထက် နည်းသော ဘက်ကို ချန်သည်။`) }));
    const bl = best(l, { key, side: 0 });
    const br = best(r, { key, side: 1 });
    const res = Math.max(top, bl, br);
    bestOf[key] = res;
    steps.push(snap({ line: 'ret', cur: key, tag: t(`return ${res}`, `${res} ပြန်`),
      note: t(`max(top ${top}, left ${bl === -Infinity ? '−∞' : bl}, right ${br === -Infinity ? '−∞' : br}) = <b>${res}</b>: the best path anywhere under ${val[key]}.${frames.length === 1 ? ` That is the answer, after ${calls} calls to down.` : ''}`,
              `max(top ${top}, left ${bl === -Infinity ? '−∞' : bl}, right ${br === -Infinity ? '−∞' : br}) = <b>${res}</b> — ${val[key]} အောက် မည်သည့်နေရာမဆို အကောင်းဆုံး လမ်းကြောင်း။${frames.length === 1 ? ` down ကို call ${calls} ခု ခေါ်ပြီးနောက် ၎င်းသည် အဖြေ။` : ''}`) }));
    frames.pop();
    return res;
  }
  const ans = best(T.root, null);
  steps[steps.length - 1] = { ...steps.at(-1), finished: true, answer: ans };
  return steps;
}

function buildOnce({ level }) {
  const T = buildTree(level);
  const { val, kids } = T;
  const steps = [];
  const frames = [];
  const gainOf = {};
  let best = -Infinity, bestAt = null;
  const snap = (extra) => ({ view: 'once', frames: frames.map((f) => ({ ...f })), marks: { ...gainOf }, best, bestAt, ...extra });
  steps.push(snap({ line: 'init', cur: null, tag: t('best = −∞', 'best = −∞'),
    note: t('<code>best</code> starts at −∞, not 0: every node may be negative, and a path must hold at least one node.', '<code>best</code> သည် 0 မဟုတ်ဘဲ −∞ မှ စသည် — node တိုင်း အနုတ် ဖြစ်နိုင်ပြီး လမ်းကြောင်းတွင် node အနည်းဆုံး တစ်ခု ပါရမည်။') }));

  function gain(key, from) {
    const frame = { key, left: null, right: null };
    frames.push(frame);
    if (key == null) {
      steps.push(snap({ line: 'base', cur: null, tag: t('null → 0', 'null → 0'),
        note: t(`${from.side ? 'Right' : 'Left'} of node ${val[from.key]}: nothing there, gain 0.`, `node ${val[from.key]} ၏ ${from.side ? 'ညာ' : 'ဘယ်'} — ဘာမှမရှိ၊ gain 0။`) }));
      frames.pop();
      return 0;
    }
    const [l, r] = kids[key];
    steps.push(snap({ line: 'base', cur: key, tag: t('visit', 'ရောက်'),
      note: t(`Node <b>${val[key]}</b>. First ask each child for its best path going down.`, `node <b>${val[key]}</b>။ ကလေးတစ်ခုစီကို ၎င်း၏ အောက်သို့ဆင်းသော အကောင်းဆုံး လမ်းကြောင်းကို အရင် မေးသည်။`) }));
    const gl = gain(l, { key, side: 0 });
    frame.left = Math.max(0, gl);
    steps.push(snap({ line: 'left', cur: key, tag: t(`left = ${frame.left}`, `left = ${frame.left}`),
      note: gl < 0
        ? t(`The left side offers ${gl} — worse than nothing, so leave it out: left = 0.`, `ဘယ်ဘက်က ${gl} ပေးသည် — ဘာမှမရှိသည်ထက် ဆိုးသဖြင့် ချန်သည် — left = 0။`)
        : t(`The left side offers ${gl}: left = ${gl}.`, `ဘယ်ဘက်က ${gl} ပေးသည် — left = ${gl}။`) }));
    const gr = gain(r, { key, side: 1 });
    frame.right = Math.max(0, gr);
    steps.push(snap({ line: 'right', cur: key, tag: t(`right = ${frame.right}`, `right = ${frame.right}`),
      note: gr < 0
        ? t(`The right side offers ${gr} — leave it out: right = 0.`, `ညာဘက်က ${gr} ပေးသည် — ချန်သည် — right = 0။`)
        : t(`The right side offers ${gr}: right = ${gr}.`, `ညာဘက်က ${gr} ပေးသည် — right = ${gr}။`) }));
    const through = val[key] + frame.left + frame.right;
    const improved = through > best;
    const was = best;
    if (improved) { best = through; bestAt = key; }
    steps.push(snap({ line: 'bend', cur: key, path: bendPath(key, T), tag: improved ? t(`best = ${best}`, `best = ${best}`) : t('no better', 'မပိုကောင်း'),
      note: improved
        ? t(`The path bending at ${val[key]}: ${val[key]} + ${frame.left} + ${frame.right} = <b>${through}</b>, better than ${was === -Infinity ? '−∞' : was}. best = ${through}.`,
            `${val[key]} တွင် ကွေ့သော လမ်းကြောင်း — ${val[key]} + ${frame.left} + ${frame.right} = <b>${through}</b>၊ ${was === -Infinity ? '−∞' : was} ထက် ကောင်းသည်။ best = ${through}။`)
        : t(`The path bending at ${val[key]} sums to ${through}, not more than ${best}.`, `${val[key]} တွင် ကွေ့သော လမ်းကြောင်း၏ ပေါင်းလဒ် ${through}၊ ${best} ထက် မပို။`) }));
    const up = val[key] + Math.max(frame.left, frame.right);
    gainOf[key] = up;
    steps.push(snap({ line: 'up', cur: key, tag: t(`return ${up}`, `${up} ပြန်`),
      note: t(`Return ${val[key]} + max(${frame.left}, ${frame.right}) = <b>${up}</b>. A path that continues up through the parent can use only one side of ${val[key]}.`,
              `${val[key]} + max(${frame.left}, ${frame.right}) = <b>${up}</b> ကို ပြန်ပေးသည်။ parent ကိုဖြတ်၍ ဆက်တက်သော လမ်းကြောင်းသည် ${val[key]} ၏ ဘက်တစ်ဘက်ကိုသာ သုံးနိုင်သည်။`) }));
    frames.pop();
    return up;
  }
  gain(T.root, null);
  steps.push(snap({ line: 'ret', cur: null, finished: true, answer: best, path: bendPath(bestAt, T), tag: t(`return ${best}`, `${best} ပြန်`),
    note: t(`Return <b>${best}</b>. The best path bends at ${val[bestAt]}${bestAt === T.root ? ', the root' : ' — not at the root'}. Every node was visited once.`,
            `<b>${best}</b> ကို ပြန်ပေးသည်။ အကောင်းဆုံး လမ်းကြောင်းသည် ${val[bestAt]} တွင် ကွေ့သည်${bestAt === T.root ? ' — root' : ' — root တွင် မဟုတ်'}။ node တိုင်းကို တစ်ကြိမ်သာ ရောက်ခဲ့သည်။`) }));
  return steps;
}

/* ---------------- drawing ----------------
 *
 * The strip card is the input in level order. The stage draws the tree beside
 * the call stack: a finished node wears what its call returned — the best
 * path under it, or its best downward gain — the subtree `down` is
 * re-walking is amber, and the path being scored is lit. */

function strip(s, { level }) {
  const T = buildTree(level);
  const order = levelOrder(T, T.kids);
  const path = new Set(s.path ?? []);
  const waiting = new Set(s.frames.map((f) => f.key));
  return cells(order.map((x) => (x.v == null ? '∅' : x.v)), {
    tone: Object.fromEntries(order.map((x, i) => [i, x.key == null ? 'done' : path.has(x.key) || x.key === s.cur ? 'entering' : waiting.has(x.key) ? 'inwin' : s.marks[x.key] != null ? 'done' : null]).filter(([, v]) => v)),
  });
}

function draw(s, { level }) {
  const T = buildTree(level);
  const ids = preorderKeys(T.root, T.kids);
  const id = (key) => ids.indexOf(key);
  const tone = {}, badges = {};
  for (const [key, v] of Object.entries(s.marks)) { tone[id(Number(key))] = 'done'; badges[id(Number(key))] = v; }
  for (const key of s.measuring ?? []) tone[id(key)] = 'warn';
  for (const key of s.path ?? []) tone[id(key)] = 'warn';
  const pic = tree(asNested(T.root, T.val, T.kids), { at: s.cur != null ? id(s.cur) : null, tone, badges });
  if (s.view === 'every') {
    const frames = s.frames.map((f) => `best(${nameOf(f.key, T.val)})${f.top != null ? ` · top ${f.top}` : ''}`);
    return stagePanel(pick(t('The tree — a badge is the best path under that node', 'tree — badge သည် ထို node အောက်ရှိ အကောင်းဆုံး လမ်းကြောင်း')), pick(t(`${s.calls} down() calls`, `down() call ${s.calls}`)),
      panels(pic, stack(frames, { label: 'call stack' })));
  }
  const frames = s.frames.map((f) => `gain(${nameOf(f.key, T.val)})${f.left != null ? ` · left ${f.left}` : ''}`);
  return stagePanel(pick(t('The tree — a badge is the gain a node returned', 'tree — badge သည် node ပြန်ပေးခဲ့သော gain')),
    pick(t(`best ${s.best === -Infinity ? '−∞' : s.best}`, `best ${s.best === -Infinity ? '−∞' : s.best}`)),
    panels(pic, stack(frames, { label: 'call stack' }))
      + stageGap + readout({ best: s.best === -Infinity ? '−∞' : s.best, 'bends at': s.bestAt == null ? '—' : T.val[s.bestAt] }));
}

function answer(s) {
  return { html: slots(s.finished ? [s.answer] : [], { total: 1, just: s.finished ? 0 : -1 }), note: s.finished ? t('the best path sum', 'အကောင်းဆုံး လမ်းကြောင်း ပေါင်းလဒ်') : t('one number', 'ကိန်း တစ်ခု') };
}

function vars(s, { level }) {
  const T = buildTree(level);
  const f = s.frames.at(-1);
  const known = (v) => (v == null ? '—' : v);
  if (s.view === 'every') return [['node', f ? nameOf(f.key, T.val) : '—'], ['top', known(f?.top)]];
  return [['best', s.best === -Infinity ? '−∞' : s.best], ['node', f ? nameOf(f.key, T.val) : '—'], ['left', known(f?.left)], ['right', known(f?.right)]];
}

/* ---------------- the code, one key per line ----------------
 *
 * Generated from the verified solution files, so the listing a reader copies
 * is byte-identical to the one that ran. */

const CODE = {
  every: {
    ruby: [
      [null, `${k('def')} max_path_sum(root)`],
      [null, `  best(root)`],
      [null, `${k('end')}`],
      [null, ``],
      [null, `${k('def')} down(node) ${c('# the best path that starts at node and goes down')}`],
      ['down', `  ${k('return')} 0 ${k('if')} node.nil?`],
      ['down', `  node.val + [0, down(node.left), down(node.right)].max`],
      [null, `${k('end')}`],
      [null, ``],
      [null, `${k('def')} best(node) ${c('# the best path anywhere under node')}`],
      ['base', `  ${k('return')} -Float::INFINITY ${k('if')} node.nil?`],
      ['top', `  top = node.val + [0, down(node.left)].max + [0, down(node.right)].max`],
      ['ret', `  [top, best(node.left), best(node.right)].max`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('import')} sys`],
      [null, `sys.setrecursionlimit(100_000)            ${c('# a chain of 3 x 10^4 nodes is that deep')}`],
      [null, ``],
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} maxPathSum(self, root):`],
      [null, `        ${k('def')} down(node):                   ${c('# the best path that starts at node and goes down')}`],
      ['down', `            ${k('if')} node ${k('is')} ${k('None')}:`],
      ['down', `                ${k('return')} 0`],
      ['down', `            ${k('return')} node.val + max(0, down(node.left), down(node.right))`],
      [null, ``],
      [null, `        ${k('def')} best(node):                   ${c('# the best path anywhere under node')}`],
      ['base', `            ${k('if')} node ${k('is')} ${k('None')}:`],
      ['base', `                ${k('return')} float('-inf')`],
      ['top', `            top = node.val + max(0, down(node.left)) + max(0, down(node.right))`],
      ['ret', `            ${k('return')} max(top, best(node.left), best(node.right))`],
      [null, ``],
      [null, `        ${k('return')} best(root)`],
    ],
    javascript: [
      [null, `${k('var')} maxPathSum = ${k('function')} (root) {`],
      [null, `  ${k('const')} down = (node) =&gt; { ${c('// the best path that starts at node and goes down')}`],
      ['down', `    ${k('if')} (node === ${k('null')}) ${k('return')} 0;`],
      ['down', `    ${k('return')} node.val + Math.max(0, down(node.left), down(node.right));`],
      [null, `  };`],
      [null, `  ${k('const')} best = (node) =&gt; { ${c('// the best path anywhere under node')}`],
      ['base', `    ${k('if')} (node === ${k('null')}) ${k('return')} -Infinity;`],
      ['top', `    ${k('const')} top = node.val + Math.max(0, down(node.left)) + Math.max(0, down(node.right));`],
      ['ret', `    ${k('return')} Math.max(top, best(node.left), best(node.right));`],
      [null, `  };`],
      [null, `  ${k('return')} best(root);`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} maxPathSum(root *TreeNode) int {`],
      [null, `    ${k('var')} down ${k('func')}(node *TreeNode) int ${c('// the best path that starts at node and goes down')}`],
      [null, `    down = ${k('func')}(node *TreeNode) int {`],
      ['down', `        ${k('if')} node == ${k('nil')} {`],
      ['down', `            ${k('return')} 0`],
      [null, `        }`],
      ['down', `        ${k('return')} node.Val + max(0, down(node.Left), down(node.Right))`],
      [null, `    }`],
      [null, `    ${k('var')} best ${k('func')}(node *TreeNode) int ${c('// the best path anywhere under node')}`],
      [null, `    best = ${k('func')}(node *TreeNode) int {`],
      ['base', `        ${k('if')} node == ${k('nil')} {`],
      ['base', `            ${k('return')} -1 &lt;&lt; 31`],
      [null, `        }`],
      ['top', `        top := node.Val + max(0, down(node.Left)) + max(0, down(node.Right))`],
      ['ret', `        ${k('return')} max(top, best(node.Left), best(node.Right))`],
      [null, `    }`],
      [null, `    ${k('return')} best(root)`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('use')} std::cell::RefCell;`],
      [null, `${k('use')} std::rc::Rc;`],
      [null, ``],
      [null, `type Node = Option&lt;Rc&lt;RefCell&lt;TreeNode&gt;&gt;&gt;;`],
      [null, ``],
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} max_path_sum(root: Node) -&gt; i32 {`],
      [null, `        ${k('Self')}::best(&amp;root)`],
      [null, `    }`],
      [null, ``],
      [null, `    ${k('fn')} down(node: &amp;Node) -&gt; i32 { ${c('// the best path that starts at node and goes down')}`],
      ['down', `        ${k('let')} ${k('Some')}(node) = node ${k('else')} { ${k('return')} 0 };`],
      [null, `        ${k('let')} node = node.borrow();`],
      ['down', `        node.val + 0i32.max(${k('Self')}::down(&amp;node.left)).max(${k('Self')}::down(&amp;node.right))`],
      [null, `    }`],
      [null, ``],
      [null, `    ${k('fn')} best(node: &amp;Node) -&gt; i32 { ${c('// the best path anywhere under node')}`],
      ['base', `        ${k('let')} ${k('Some')}(node) = node ${k('else')} { ${k('return')} i32::MIN };`],
      [null, `        ${k('let')} node = node.borrow();`],
      ['top', `        ${k('let')} top = node.val + 0i32.max(${k('Self')}::down(&amp;node.left)) + 0i32.max(${k('Self')}::down(&amp;node.right));`],
      ['ret', `        top.max(${k('Self')}::best(&amp;node.left)).max(${k('Self')}::best(&amp;node.right))`],
      [null, `    }`],
      [null, `}`],
    ],
  },
  once: {
    ruby: [
      [null, `${k('def')} max_path_sum(root)`],
      ['init', `  @best = -Float::INFINITY ${c('# the best path seen so far')}`],
      [null, `  gain(root)`],
      ['ret', `  @best`],
      [null, `${k('end')}`],
      [null, ``],
      [null, `${k('def')} gain(node) ${c('# the best path that starts at node and goes down')}`],
      ['base', `  ${k('return')} 0 ${k('if')} node.nil?`],
      ['left', `  left = [0, gain(node.left)].max ${c('# a negative side is left out')}`],
      ['right', `  right = [0, gain(node.right)].max`],
      ['bend', `  @best = [@best, node.val + left + right].max ${c('# the path that bends here')}`],
      ['up', `  node.val + [left, right].max ${c('# only one side can go up')}`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('import')} sys`],
      [null, `sys.setrecursionlimit(100_000)            ${c('# a chain of 3 x 10^4 nodes is that deep')}`],
      [null, ``],
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} maxPathSum(self, root):`],
      ['init', `        best = float('-inf')              ${c('# the best path seen so far')}`],
      [null, ``],
      [null, `        ${k('def')} gain(node):                   ${c('# the best path that starts at node and goes down')}`],
      [null, `            ${k('nonlocal')} best`],
      ['base', `            ${k('if')} node ${k('is')} ${k('None')}:`],
      ['base', `                ${k('return')} 0`],
      ['left', `            left = max(0, gain(node.left))    ${c('# a negative side is left out')}`],
      ['right', `            right = max(0, gain(node.right))`],
      ['bend', `            best = max(best, node.val + left + right)   ${c('# the path that bends here')}`],
      ['up', `            ${k('return')} node.val + max(left, right)          ${c('# only one side can go up')}`],
      [null, ``],
      [null, `        gain(root)`],
      ['ret', `        ${k('return')} best`],
    ],
    javascript: [
      [null, `${k('var')} maxPathSum = ${k('function')} (root) {`],
      ['init', `  ${k('let')} best = -Infinity; ${c('// the best path seen so far')}`],
      [null, `  ${k('const')} gain = (node) =&gt; { ${c('// the best path that starts at node and goes down')}`],
      ['base', `    ${k('if')} (node === ${k('null')}) ${k('return')} 0;`],
      ['left', `    ${k('const')} left = Math.max(0, gain(node.left)); ${c('// a negative side is left out')}`],
      ['right', `    ${k('const')} right = Math.max(0, gain(node.right));`],
      ['bend', `    best = Math.max(best, node.val + left + right); ${c('// the path that bends here')}`],
      ['up', `    ${k('return')} node.val + Math.max(left, right); ${c('// only one side can go up')}`],
      [null, `  };`],
      [null, `  gain(root);`],
      ['ret', `  ${k('return')} best;`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} maxPathSum(root *TreeNode) int {`],
      ['init', `    best := -1 &lt;&lt; 31 ${c('// the best path seen so far')}`],
      [null, `    ${k('var')} gain ${k('func')}(node *TreeNode) int ${c('// the best path that starts at node and goes down')}`],
      [null, `    gain = ${k('func')}(node *TreeNode) int {`],
      ['base', `        ${k('if')} node == ${k('nil')} {`],
      ['base', `            ${k('return')} 0`],
      [null, `        }`],
      ['left', `        left := max(0, gain(node.Left)) ${c('// a negative side is left out')}`],
      ['right', `        right := max(0, gain(node.Right))`],
      ['bend', `        best = max(best, node.Val+left+right) ${c('// the path that bends here')}`],
      ['up', `        ${k('return')} node.Val + max(left, right) ${c('// only one side can go up')}`],
      [null, `    }`],
      [null, `    gain(root)`],
      ['ret', `    ${k('return')} best`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('use')} std::cell::RefCell;`],
      [null, `${k('use')} std::rc::Rc;`],
      [null, ``],
      [null, `type Node = Option&lt;Rc&lt;RefCell&lt;TreeNode&gt;&gt;&gt;;`],
      [null, ``],
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} max_path_sum(root: Node) -&gt; i32 {`],
      ['init', `        ${k('let')} ${k('mut')} best = i32::MIN; ${c('// the best path seen so far')}`],
      [null, `        ${k('Self')}::gain(&amp;root, &amp;${k('mut')} best);`],
      ['ret', `        best`],
      [null, `    }`],
      [null, ``],
      [null, `    ${k('fn')} gain(node: &amp;Node, best: &amp;${k('mut')} i32) -&gt; i32 { ${c('// the best path that starts at node and goes down')}`],
      ['base', `        ${k('let')} ${k('Some')}(node) = node ${k('else')} { ${k('return')} 0 };`],
      [null, `        ${k('let')} node = node.borrow();`],
      ['left', `        ${k('let')} left = 0i32.max(${k('Self')}::gain(&amp;node.left, best)); ${c('// a negative side is left out')}`],
      ['right', `        ${k('let')} right = 0i32.max(${k('Self')}::gain(&amp;node.right, best));`],
      ['bend', `        *best = (*best).max(node.val + left + right); ${c('// the path that bends here')}`],
      ['up', `        node.val + left.max(right) ${c('// only one side can go up')}`],
      [null, `    }`],
      [null, `}`],
    ],
  },
};


/* ---------------- part 1: the "choose the top" widget ----------------
 *
 * Every path has a highest node. Drag that top through the tree and see the
 * best path that bends there: its value, plus each side's best downward sum
 * when that sum is positive. A negative side is left out. */

const QW_SETS = [
  { label: exampleTitle(2), level: [-10, 9, 20, null, null, 15, 7] },
  { label: t('a negative child', 'အနုတ် ကလေး'), level: [2, -1, 3] },
  { label: t('all negative', 'အားလုံး အနုတ်'), level: [-3, -1, -2] },
];

function mountTopWidget(host) {
  const state = { set: 0, b: 0 };
  host.innerHTML = `
    <div data-tree></div>
    <div class="q-slider"><label for="mps-b" data-lbl></label><input type="range" id="mps-b" min="1" max="1" value="1"><output data-out></output>
      <span class="q-presets" data-presets></span></div>
    <p class="q-tie" data-line></p>
    <div class="ledger">
      <span class="expr" data-expr></span>
      <span class="total" data-total></span>
    </div>`;
  const q = (sel) => host.querySelector(sel);

  function render() {
    const T = buildTree(QW_SETS[state.set].level);
    const order = preorderKeys(T.root, T.kids);
    const b = Math.min(state.b, order.length - 1);
    const top = order[b];
    const [l, r] = T.kids[top];
    const dl = down(l, T), dr = down(r, T);
    const sum = T.val[top] + Math.max(0, dl) + Math.max(0, dr);
    const all = order.map((key) => T.val[key] + Math.max(0, down(T.kids[key][0], T)) + Math.max(0, down(T.kids[key][1], T)));
    const best = Math.max(...all);
    const tone = {};
    bendPath(top, T).forEach((key) => { tone[order.indexOf(key)] = 'warn'; });
    q('[data-tree]').innerHTML = tree(asNested(T.root, T.val, T.kids), { at: b, tone });
    q('[data-lbl]').textContent = pick(t('top', 'ထိပ်'));
    const el = q('#mps-b'); el.max = String(order.length); el.value = String(b + 1);
    q('[data-out]').textContent = String(T.val[top]);
    q('[data-presets]').innerHTML = presetChips(QW_SETS, state.set);
    widgetLabel(pick(t(`best path ${best}`, `အကောင်းဆုံး ${best}`)));
    const dropped = [[dl, 'left'], [dr, 'right']].filter(([d, _]) => d < 0).map(([, s]) => s);
    q('[data-line]').innerHTML = pick(t(`With ${T.val[top]} at the top, the best path adds each side's best downward sum if it helps${dropped.length ? ` — the ${dropped.join(' and ')} ${dropped.length === 1 ? 'side is' : 'sides are'} negative and left out` : ''}. ${sum === best ? 'That is the best there is.' : `Another top does better: ${best}.`}`,
      `${T.val[top]} ကို ထိပ်တွင် ထားလျှင် အကောင်းဆုံး လမ်းကြောင်းသည် ဘက်တစ်ခုစီ၏ အောက်ဆင်း အကောင်းဆုံး ပေါင်းလဒ်ကို အကျိုးရှိမှသာ ပေါင်းသည်${dropped.length ? ` — ${dropped.map((x) => (x === 'left' ? 'ဘယ်' : 'ညာ')).join(' နှင့် ')}ဘက် အနုတ်ဖြစ်၍ ချန်သည်` : ''}။ ${sum === best ? 'ထိုအရာ အကောင်းဆုံး။' : `အခြား ထိပ်က ပိုကောင်းသည် — ${best}။`}`));
    q('[data-expr]').innerHTML = `${T.val[top]} + max(0, ${dl}) + max(0, ${dr}) = ${sum}`;
    q('[data-total]').innerHTML = `${best}<small>${pick(t('best path', 'အကောင်းဆုံး'))}</small>`;
  }
  host.addEventListener('input', (ev) => { if (ev.target.id === 'mps-b') { state.b = Number(ev.target.value) - 1; render(); } });
  host.addEventListener('click', (ev) => {
    const chip = ev.target.closest('[data-set]');
    if (chip) { state.set = Number(chip.dataset.set); state.b = 0; render(); }
  });
  onLangChange(render);
  render();
}

function atLeastOne(text) {
  const level = treeInput(MAX_NODES)(text);
  if (!level.length) throw new Error('at least one node — the constraints start at 1');
  return level;
}

/* ---------------- the approach, in brief ---------------- */

const APPROACH = {
  every: {
    idea: t('Every path has a top node. For each node as the top, add its value to the best path going down each side — or nothing, if a side is negative — and keep the best.',
            'လမ်းကြောင်းတိုင်းတွင် ထိပ် node ရှိသည်။ node တစ်ခုစီကို ထိပ်အဖြစ်ထား၍ ၎င်း၏ value ကို ဘက်တစ်ခုစီ၏ အောက်ဆင်း အကောင်းဆုံး လမ်းကြောင်းနှင့် ပေါင်း — ဘက်တစ်ခု အနုတ်ဖြစ်လျှင် ဘာမှမပေါင်း — အကောင်းဆုံးကို ထိန်းသည်။'),
    steps: [
      t('<code>down(node)</code>: the best path starting at node and going down, from scratch.', '<code>down(node)</code> — node မှ စ၍ အောက်ဆင်းသော အကောင်းဆုံး လမ်းကြောင်း၊ အစမှ။'),
      t('<code>top = val + max(0, down(left)) + max(0, down(right))</code>.', '<code>top = val + max(0, down(left)) + max(0, down(right))</code>။'),
      t('Return the largest of <code>top</code>, <code>best(left)</code> and <code>best(right)</code>; an empty subtree gives −∞.', '<code>top</code>၊ <code>best(left)</code> နှင့် <code>best(right)</code> အနက် အကြီးဆုံးကို ပြန် — ဗလာ subtree က −∞။'),
    ],
    cost: t('Each subtree is re-walked by <code>down</code> once for every ancestor: O(n²) — about 9 × 10⁸ calls to <code>down</code> on a 3 × 10⁴-node chain (computed).', 'subtree တစ်ခုစီကို ancestor တစ်ခုလျှင် <code>down</code> က တစ်ကြိမ် ပြန်လျှောက်သည် — O(n²) — node 3 × 10⁴ ကွင်းဆက်တွင် <code>down</code> call 9 × 10⁸ ခန့် (တွက်ထားသည်)။'),
  },
  once: {
    idea: t('Compute each node\'s best downward sum bottom-up, once. At every node both children\'s sums are already in hand, which is exactly what the path bending there needs: record it on the way back.',
            'node တစ်ခုစီ၏ အောက်ဆင်း အကောင်းဆုံး ပေါင်းလဒ်ကို အောက်မှ အပေါ်သို့ တစ်ကြိမ် တွက်သည်။ node တိုင်းတွင် ကလေးနှစ်ခု၏ ပေါင်းလဒ် ရှိပြီးသား ဖြစ်ပြီး ထိုနေရာတွင် ကွေ့သော လမ်းကြောင်း လိုသည့်အရာ အတိအကျ ဖြစ်သည် — ပြန်လာစဉ် မှတ်သည်။'),
    steps: [
      t('<code>best</code> starts at −∞.', '<code>best</code> သည် −∞ မှ စသည်။'),
      t('<code>gain(node)</code>: <code>left</code> and <code>right</code> are the children\'s gains, with anything below 0 counted as 0.', '<code>gain(node)</code> — <code>left</code> နှင့် <code>right</code> သည် ကလေးများ၏ gain၊ 0 အောက်ကို 0 ဟု ရေတွက်။'),
      t('<code>best = max(best, val + left + right)</code> — the path bending here.', '<code>best = max(best, val + left + right)</code> — ဤနေရာတွင် ကွေ့သော လမ်းကြောင်း။'),
      t('Return <code>val + max(left, right)</code>: only one side can go on up.', '<code>val + max(left, right)</code> ကို ပြန် — ဘက်တစ်ဘက်သာ ဆက်တက်နိုင်သည်။'),
    ],
    cost: t('Every node is visited once: O(n) time, and O(h) stack — 3 × 10⁴ deep on a chain.', 'node တိုင်းကို တစ်ကြိမ် ရောက်သည် — O(n) အချိန်၊ O(h) stack — ကွင်းဆက်တွင် 3 × 10⁴ ဆင့်။'),
  },
};

/* ---------------- mount ---------------- */

mountLesson({
  input: { level: [-10, 9, 20, null, null, 15, 7] },
  controls: [
    { key: 'level', label: 'root', value: '-10, 9, 20, null, null, 15, 7', parse: atLeastOne, format: formatLevelOrder },
  ],
  presets: [
    { label: exampleTitle(1), input: { level: [1, 2, 3] } },
    { label: exampleTitle(2), input: { level: [-10, 9, 20, null, null, 15, 7] } },
    { label: t('a negative child', 'အနုတ် ကလေး'), input: { level: [2, -1, 3, 4, -5] } },
    { label: t('all negative', 'အားလုံး အနုတ်'), input: { level: [-3, -1, -2] } },
  ],
  examples: [
    { title: exampleTitle(1), inputHtml: '<code>root = [1,2,3]</code>', output: '6',
      why: [t('The path 2 → 1 → 3 bends at the root: 2 + 1 + 3 = 6.', '2 → 1 → 3 လမ်းကြောင်းသည် root တွင် ကွေ့သည် — 2 + 1 + 3 = 6။')], load: { level: [1, 2, 3] } },
    { title: exampleTitle(2), inputHtml: '<code>root = [-10,9,20,null,null,15,7]</code>', output: '42',
      why: [t('The path 15 → 20 → 7 bends at 20 and never touches the root, whose −10 would only lower it: 42.', '15 → 20 → 7 လမ်းကြောင်းသည် 20 တွင် ကွေ့ပြီး root ကို မထိပါ — ၎င်း၏ −10 က လျော့စေရုံသာ — 42။')],
      load: { level: [-10, 9, 20, null, null, 15, 7] } },
  ],
  modes: [
    { id: 'every', name: 'Every node as the top',
      desc: t('Score each node as the bend, measuring both sides from scratch.', 'node တစ်ခုစီကို ကွေ့ရာအဖြစ် အမှတ်ပေး၊ ဘက်နှစ်ဖက်ကို အစမှ တိုင်း။'),
      cost: 'O(n²) time · O(h) stack', build: buildEvery },
    { id: 'once', name: 'One pass returning gain',
      desc: t('Return each node\'s best downward sum; record the bend on the way.', 'node တစ်ခုစီ၏ အောက်ဆင်း အကောင်းဆုံးကို ပြန် — ကွေ့ရာကို လမ်းတွင် မှတ်။'),
      cost: 'O(n) time · O(h) stack', build: buildOnce },
  ],
  languages: LANGUAGES,
  code: CODE,
  hover: { ruby: { '@best': 'best' } },
  solutions: {
    every: { approach: APPROACH.every,
      desc: t('The definition written down: every node tried as the top. Correct, but it walks each subtree again for every ancestor.', 'အဓိပ္ပာယ်ကို ချရေးထားခြင်း — node တိုင်းကို ထိပ်အဖြစ် စမ်းသည်။ မှန်သော်လည်း ancestor တိုင်းအတွက် subtree တစ်ခုစီကို ထပ်လျှောက်သည်။') },
    once: { approach: APPROACH.once,
      desc: t('The answer to write: Diameter of Binary Tree\'s one pass, with values instead of edges and a negative side dropped. Start best at −∞, not 0.',
              'ရေးသင့်သည့် အဖြေ — Diameter of Binary Tree ၏ pass တစ်ခုတည်း၊ edge အစား value များဖြင့်၊ အနုတ်ဘက်ကို ချန်သည်။ best ကို 0 မဟုတ်ဘဲ −∞ မှ စပါ။') },
  },
  // How each language was actually checked, printed as the part 3 badges.
  // The corpus: the 2 examples, 5 edges, 15,000 random trees of up to 9
  // nodes over -5..5, 5,000 of up to 300, and six of 3 × 10⁴ nodes — against a
  // non-recursive oracle. Trying every node as the top skips those six. Ruby
  // and Node ran with a larger stack (BIG_STACK); their default-stack limits
  // were measured cold, one chain per process. Go and Rust ran in Docker
  // (golang:1.23-alpine, rust:1-slim) on their default stacks.
  verification: {
    ruby: { every: 'ran here · 20,007 cases, not the six at 3 × 10⁴; overflows Ruby 3.1\'s default stack past 8,731 deep', once: 'ran here · overflows Ruby 3.1\'s default stack past 8,186 deep' },
    python: { every: 'ran here · 20,007 cases, not the six at 3 × 10⁴', once: 'ran here · 20,013 cases, 3 × 10⁴ calls deep' },
    javascript: { every: 'ran here · 20,007 cases, not the six at 3 × 10⁴; overflows Node 24\'s default stack past 6,911 deep', once: 'ran here · overflows Node 24\'s default stack past 6,911 deep' },
    go: { every: 'ran here · 20,007 cases, not the six at 3 × 10⁴ · Go 1.23', once: 'ran here · 20,013 cases · Go 1.23' },
    rust: { every: 'ran here · 20,007 cases, not the six at 3 × 10⁴ · rustc 1.98', once: 'ran here · 20,013 cases, 3 × 10⁴ deep · rustc 1.98' },
  },
  caveats: {
    once: {
      ruby: t('Correct on all 20,013 cases with a larger stack, but on Ruby 3.1\'s default stack a chain deeper than 8,186 nodes overflows it (<code>SystemStackError</code>) — measured here — and the constraint allows 3 × 10⁴.',
              'stack ပိုကြီးလျှင် case 20,013 ခုလုံးတွင် မှန်သည်၊ သို့သော် Ruby 3.1 ၏ default stack ပေါ်တွင် node 8,186 ထက် နက်သော ကွင်းဆက်က overflow (<code>SystemStackError</code>) ဖြစ်စေသည် — ဤနေရာတွင် တိုင်းတာထားသည် — ကန့်သတ်ချက်က 3 × 10⁴ ကို ခွင့်ပြုသည်။'),
      javascript: t('Correct on all 20,013 cases with a larger stack, but on Node 24\'s default stack a chain deeper than 6,911 nodes overflows it (<code>RangeError</code>) — measured here, cold — and the constraint allows 3 × 10⁴.',
                    'stack ပိုကြီးလျှင် case 20,013 ခုလုံးတွင် မှန်သည်၊ သို့သော် Node 24 ၏ default stack ပေါ်တွင် node 6,911 ထက် နက်သော ကွင်းဆက်က overflow (<code>RangeError</code>) ဖြစ်စေသည် — ဤနေရာတွင် တိုင်းတာထားသည် — ကန့်သတ်ချက်က 3 × 10⁴ ကို ခွင့်ပြုသည်။'),
      python: t('The <code>setrecursionlimit</code> line is part of the answer: the default of 1,000 is far below the 3 × 10⁴-node chain the constraint allows.', '<code>setrecursionlimit</code> စာကြောင်းသည် အဖြေ၏ အစိတ်အပိုင်း — default 1,000 သည် ကန့်သတ်ချက် ခွင့်ပြုသော node 3 × 10⁴ ကွင်းဆက်ထက် အများကြီး နိမ့်သည်။'),
    },
  },
  stripLabel: t('root, in level order', 'root — level order'),
  strip,
  draw,
  answer,
  vars,
  widget: mountTopWidget,
});
