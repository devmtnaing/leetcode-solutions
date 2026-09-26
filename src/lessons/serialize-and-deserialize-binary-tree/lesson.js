/* Serialize and Deserialize Binary Tree — LeetCode 297.
 *
 * A list of values alone cannot pin down a tree's shape; a value list that
 * also marks every missing child can. Write "#" for each null, and a preorder
 * walk gives a string that a second preorder walk reads straight back: the
 * first token is the root, then its whole left subtree, then its right. Or
 * write the tree level by level, both children of every node including the
 * missing ones, and read it back with a queue — each parent takes the next
 * two tokens. The first recurses as deep as the tree; the second never does.
 */
import { mountLesson } from '../../lib/stepper.js';
import { pick, onLangChange } from '../../lib/i18n.js';
import { cells, slots, stagePanel, tree, stack, panels } from '../../lib/stage.js';
import { t, exampleTitle, LANGUAGES, k, c, stageRow, stageGap, presetChips, widgetLabel } from '../../lib/kit.js';
import { buildTree, levelOrder, asNested, preorderKeys, nameOf, treeInput, formatLevelOrder } from '../../lib/tree.js';

const MAX_NODES = 12;

/* ---------------- step generators ---------------- */

const fmtLevel = (T) => levelOrder(T, T.kids).map((x) => (x.v == null ? 'null' : x.v)).join(',');

function buildPreorder({ level }) {
  const T = buildTree(level);
  const { val, kids } = T;
  const steps = [];
  const out = [];
  const seen = new Set(), made = new Set(), linked = new Set();
  let frames = [];
  let phase = 'ser', read = -1;
  const snap = (extra) => ({ view: 'preorder', phase, out: [...out], seen: [...seen], made: [...made], linked: [...linked],
    frames: [...frames], read, cur: null, ...extra });

  function walk(key) {
    frames.push(`walk(${nameOf(key, val)})`);
    if (key == null) {
      out.push('#');
      steps.push(snap({ line: 'null', tag: t('#', '#'),
        note: t('A missing child: write "#". Without it, the reader could not tell where a subtree ends.', 'မရှိသော ကလေး — "#" ကို ရေးသည်။ ၎င်းမပါလျှင် ဖတ်သူက subtree ဘယ်မှာ ဆုံးသည်ကို မသိနိုင်။') }));
      frames.pop();
      return;
    }
    seen.add(key);
    out.push(String(val[key]));
    steps.push(snap({ line: 'val', cur: key, tag: t(`write ${val[key]}`, `${val[key]} ရေး`),
      note: t(`Preorder: write the node, ${val[key]}, before anything below it — then its left subtree, then its right.`, `Preorder — node ${val[key]} ကို ၎င်းအောက်ရှိ အရာအားလုံးမတိုင်မီ ရေးသည် — ပြီးမှ ဘယ် subtree၊ ပြီးမှ ညာ။`) }));
    walk(kids[key][0]);
    walk(kids[key][1]);
    frames.pop();
  }
  walk(T.root);
  const data = out.join(',');
  steps.push(snap({ line: 'join', tag: t(`${out.length} tokens`, `token ${out.length}`),
    note: t(`Join the tokens with commas: "${data}". ${seen.size} ${seen.size === 1 ? 'value' : 'values'} and ${out.length - seen.size} "#" — always one more "#" than values, since every node has two child slots.`,
            `token များကို comma ဖြင့် ဆက်သည် — "${data}"။ value ${seen.size} ခုနှင့် "#" ${out.length - seen.size} ခု — node တိုင်းတွင် ကလေးနေရာ နှစ်ခု ရှိသဖြင့် "#" သည် value ထက် အမြဲ တစ်ခု ပိုသည်။`) }));

  phase = 'de';
  frames = [];
  steps.push(snap({ line: 'split', tag: t('split', 'split'),
    note: t('deserialize: split the string back into tokens and read them in the same order they were written — preorder.', 'deserialize — string ကို token များအဖြစ် ပြန်ခွဲပြီး ရေးခဲ့သည့် အစဉ်အတိုင်း — preorder — ဖတ်သည်။') }));
  function readTree(key) {
    read++;
    frames.push('read()');
    if (key == null) {
      steps.push(snap({ line: 'read', tag: t('# → null', '# → null'),
        note: t(`Token ${read} is "#": this subtree is empty. Return null.`, `token ${read} သည် "#" — ဤ subtree ဗလာ။ null ပြန်ပေးသည်။`) }));
      frames.pop();
      return;
    }
    made.add(key);
    frames[frames.length - 1] = `read() · ${val[key]}`;
    steps.push(snap({ line: 'make', cur: key, tag: t(`node ${val[key]}`, `node ${val[key]}`),
      note: t(`Token ${read} is ${val[key]}: make a node. The tokens that follow are its left subtree, then its right — read them with two more calls.`, `token ${read} သည် ${val[key]} — node တစ်ခု ပြုလုပ်သည်။ နောက်လာသော token များသည် ၎င်း၏ ဘယ် subtree၊ ပြီးမှ ညာ — call နှစ်ခု ထပ်ခေါ်၍ ဖတ်သည်။`) }));
    readTree(kids[key][0]);
    readTree(kids[key][1]);
    linked.add(key);
    steps.push(snap({ line: 'link', cur: key, tag: t(`${val[key]} done`, `${val[key]} ပြီး`),
      note: t(`Both subtrees of ${val[key]} are read and attached. Return it to whoever asked.`, `${val[key]} ၏ subtree နှစ်ခုလုံး ဖတ်ပြီး ချိတ်ပြီး။ မေးသူထံ ပြန်ပေးသည်။`) }));
    frames.pop();
  }
  readTree(T.root);
  const ans = fmtLevel(T);
  steps.push(snap({ line: 'ret', finished: true, answer: ans, tag: t('same tree', 'tree တူ'),
    note: t(`Every token is used, and the tree is back: [${ans}] — the same shape and values as the input. Both walks recursed as deep as the tree.`,
            `token တိုင်း သုံးပြီး tree ပြန်ရောက်ပြီ — [${ans}] — input နှင့် ပုံသဏ္ဌာန်နှင့် value တူ။ walk နှစ်ခုလုံး tree ၏ အနက်အထိ recurse လုပ်ခဲ့သည်။`) }));
  return steps;
}

function buildLevel({ level }) {
  const T = buildTree(level);
  const { val, kids } = T;
  const steps = [];
  const out = [];
  const seen = new Set(), made = new Set();
  let queue = [T.root];
  let phase = 'ser', read = -1;
  const snap = (extra) => ({ view: 'level', phase, out: [...out], seen: [...seen], made: [...made], linked: [...made],
    queue: queue.map((x) => nameOf(x, val)), read, cur: null, ...extra });
  steps.push(snap({ line: 'init', tag: t('queue root', 'queue root'),
    note: t('serialize: a queue that starts with the root. Each node taken off it writes its value and queues both children — even missing ones, so they get a "#".', 'serialize — root ဖြင့် စသော queue။ ထုတ်သော node တစ်ခုစီက ၎င်း၏ value ကို ရေးပြီး ကလေး နှစ်ခုလုံးကို queue ထဲ ထည့်သည် — မရှိသော ကလေးများပါ၊ "#" ရစေရန်။') }));
  while (queue.length) {
    const key = queue.shift();
    if (key == null) {
      out.push('#');
      steps.push(snap({ line: 'null', tag: t('#', '#'), note: t('A missing child: write "#". It queues nothing.', 'မရှိသော ကလေး — "#" ရေးသည်။ ဘာမှ queue မလုပ်။') }));
      continue;
    }
    seen.add(key);
    out.push(String(val[key]));
    queue.push(kids[key][0], kids[key][1]);
    steps.push(snap({ line: 'val', cur: key, tag: t(`write ${val[key]}`, `${val[key]} ရေး`),
      note: t(`Write ${val[key]} and queue its two children, ${nameOf(kids[key][0], val)} and ${nameOf(kids[key][1], val)}.`, `${val[key]} ကို ရေးပြီး ၎င်း၏ ကလေး နှစ်ခု ${nameOf(kids[key][0], val)} နှင့် ${nameOf(kids[key][1], val)} ကို queue ထဲ ထည့်သည်။`) }));
  }
  const data = out.join(',');
  steps.push(snap({ line: 'join', tag: t(`${out.length} tokens`, `token ${out.length}`),
    note: t(`"${data}". The trailing "#"s stay: the reader counts on every node having two tokens after it.`, `"${data}"။ နောက်ဆုံးရှိ "#" များ ကျန်ရမည် — ဖတ်သူသည် node တိုင်းနောက်တွင် token နှစ်ခု ရှိမည်ဟု အားကိုးသည်။`) }));

  phase = 'de';
  queue = [];
  if (T.root == null) {
    read = 0;
    steps.push(snap({ line: 'split', finished: true, answer: '', tag: t('return null', 'null ပြန်'),
      note: t('The first token is "#": the tree was empty. Return null.', 'ပထမ token သည် "#" — tree ဗလာ ဖြစ်ခဲ့သည်။ null ပြန်ပေးသည်။') }));
    return steps;
  }
  steps.push(snap({ line: 'split', tag: t('split', 'split'), note: t('deserialize: split the string back into tokens.', 'deserialize — string ကို token များအဖြစ် ပြန်ခွဲသည်။') }));
  read = 0;
  made.add(T.root);
  queue = [T.root];
  steps.push(snap({ line: 'make', cur: T.root, tag: t(`root ${val[T.root]}`, `root ${val[T.root]}`),
    note: t(`Token 0 is the root, ${val[T.root]}. Queue it; the next two tokens are its children.`, `token 0 သည် root ${val[T.root]}။ queue ထဲ ထည့် — နောက် token နှစ်ခုသည် ၎င်း၏ ကလေးများ။`) }));
  while (queue.length) {
    const p = queue.shift();
    steps.push(snap({ line: 'parent', cur: p, tag: t(`parent ${val[p]}`, `parent ${val[p]}`),
      note: t(`Take ${val[p]} off the queue: tokens ${read + 1} and ${read + 2} are its left and right child.`, `${val[p]} ကို queue မှ ထုတ်သည် — token ${read + 1} နှင့် ${read + 2} သည် ၎င်း၏ ဘယ်နှင့် ညာ ကလေး။`) }));
    for (const side of [0, 1]) {
      read++;
      const ch = kids[p][side];
      if (ch != null) { made.add(ch); queue.push(ch); }
      steps.push(snap({ line: side ? 'right' : 'left', cur: p, tag: ch == null ? t('#', '#') : t(`${side ? 'right' : 'left'} ${val[ch]}`, `${side ? 'ညာ' : 'ဘယ်'} ${val[ch]}`),
        note: ch == null
          ? t(`Token ${read} is "#": ${val[p]} has no ${side ? 'right' : 'left'} child.`, `token ${read} သည် "#" — ${val[p]} တွင် ${side ? 'ညာ' : 'ဘယ်'} ကလေး မရှိ။`)
          : t(`Token ${read} is ${val[ch]}: make it ${val[p]}'s ${side ? 'right' : 'left'} child and queue it.`, `token ${read} သည် ${val[ch]} — ၎င်းကို ${val[p]} ၏ ${side ? 'ညာ' : 'ဘယ်'} ကလေး ပြုလုပ်ပြီး queue ထဲ ထည့်သည်။`) }));
    }
  }
  const ans = fmtLevel(T);
  steps.push(snap({ line: 'ret', finished: true, answer: ans, tag: t('same tree', 'tree တူ'),
    note: t(`The queue is empty and every token used: [${ans}], the input again. No recursion anywhere.`, `queue ဗလာ ဖြစ်ပြီး token တိုင်း သုံးပြီး — [${ans}]၊ input ပြန်ရသည်။ မည်သည့်နေရာတွင်မှ recursion မရှိ။`) }));
  return steps;
}

/* ---------------- drawing ----------------
 *
 * The strip card is the input tree in level order. While serializing, the
 * stage shows the tree with the nodes already written lit, beside the call
 * stack or the queue, and the tokens so far. While deserializing it shows
 * the same tokens with the one being read in amber, and the tree as far as
 * it has been rebuilt. */

function strip(s, { level }) {
  const T = buildTree(level);
  const order = levelOrder(T, T.kids);
  if (!order.length) return '<span class="note mono">[]</span>';
  const tone = {};
  order.forEach((x, i) => { if (x.key == null) tone[i] = 'done'; else if (x.key === s.cur) tone[i] = 'inwin'; });
  return cells(order.map((x) => (x.v == null ? '∅' : x.v)), { tone });
}

/* The tree drawn from `keys` only — every kept node's parent is kept too. */
function partial(T, keep) {
  const k = new Set(keep);
  const nest = (key) => (key == null || !k.has(key) ? null
    : { key, value: T.val[key], left: nest(T.kids[key][0]), right: nest(T.kids[key][1]) });
  return nest(T.root);
}

function draw(s, { level }) {
  const T = buildTree(level);
  const building = s.phase === 'de';
  const shown = building ? partial(T, s.made) : asNested(T.root, T.val, T.kids);
  const order = [];
  (function walk(n) { if (!n) return; order.push(n.key); walk(n.left); walk(n.right); })(shown);
  const tone = {};
  order.forEach((key, i) => {
    if (building) tone[i] = s.linked.includes(key) ? 'done' : 'warn';
    else if (s.seen.includes(key)) tone[i] = 'done';
  });
  const at = s.cur != null ? order.indexOf(s.cur) : null;
  const pic = shown ? tree(shown, { at: at >= 0 ? at : null, tone })
    : `<p class="note mono stage-empty">${building ? 'null' : 'root = null'}</p>`;
  const side = s.view === 'preorder'
    ? stack(s.frames, { label: 'call stack' })
    : `<div class="st-box"><span class="st-label">queue</span>${stageRow(s.queue.length ? cells(s.queue.map((x) => (x === 'null' ? '∅' : x)), { index: false }) : '', pick(t('empty', 'ဗလာ')))}</div>`;
  const toks = s.out.map((x) => x);
  const ttone = {};
  if (building) toks.forEach((_, i) => { ttone[i] = i < s.read ? 'past' : i === s.read ? 'inwin' : null; });
  else if (toks.length) ttone[toks.length - 1] = 'entering';
  const title = building
    ? pick(t('deserialize — the tree rebuilt so far', 'deserialize — ယခုထိ ပြန်တည်ဆောက်ထားသော tree'))
    : pick(t('serialize — the tree, written nodes lit', 'serialize — tree၊ ရေးပြီးသော node များ လင်း'));
  return stagePanel(title, s.view === 'preorder' ? pick(t(`${s.frames.length} deep`, `${s.frames.length} ဆင့်`)) : '', panels(pic, side))
    + stageGap + stagePanel('data', pick(t(`${s.out.length} tokens`, `token ${s.out.length}`)),
      `<div class="strip wraps sd">${cells(toks, { tone: Object.fromEntries(Object.entries(ttone).filter(([, v]) => v)) })}</div>`);
}

function answer(s) {
  return {
    html: slots(s.finished ? [`[${s.answer}]`] : [], { total: 1, just: s.finished ? 0 : -1 }),
    note: s.finished ? t('the rebuilt tree, in level order', 'ပြန်တည်ဆောက်ထားသော tree — level order') : t('a tree', 'tree တစ်ခု'),
  };
}

function vars(s, { level }) {
  const T = buildTree(level);
  const out = [['out', `[${s.out.map((x) => `'${x}'`).join(', ')}]`]];
  if (s.cur != null) out.push(['node', nameOf(s.cur, T.val)]);
  if (s.phase === 'de') {
    out.push(['tokens', `[${s.out.map((x) => `'${x}'`).join(', ')}]`], ['i', s.read]);
    if (s.read >= 0 && s.out[s.read] != null) out.push(['tok', `'${s.out[s.read]}'`]);
  }
  if (s.view === 'level') out.push(['queue', `[${s.queue.join(', ')}]`]);
  return out;
}

/* ---------------- the code, one key per line ----------------
 *
 * Generated from the verified solution files, so the listing a reader copies
 * is byte-identical to the one that ran. */

const CODE = {
  preorder: {
    ruby: [
      [null, `${k('def')} serialize(root)`],
      [null, `  out = []`],
      [null, `  walk(root, out)`],
      ['join', `  out.join(',')`],
      [null, `${k('end')}`],
      [null, ``],
      [null, `${k('def')} walk(node, out) ${c('# preorder, "#" where a child is missing')}`],
      ['null', `  ${k('return')} out &lt;&lt; '${c('#\' if node.nil?')}`],
      ['val', `  out &lt;&lt; node.val.to_s`],
      [null, `  walk(node.left, out)`],
      [null, `  walk(node.right, out)`],
      [null, `${k('end')}`],
      [null, ``],
      [null, `${k('def')} deserialize(data)`],
      ['split', `  tokens = data.split(',')`],
      [null, `  @i = 0`],
      ['ret', `  read_tree(tokens)`],
      [null, `${k('end')}`],
      [null, ``],
      [null, `${k('def')} read_tree(tokens) ${c('# read one subtree, in the same preorder')}`],
      ['read', `  tok = tokens[@i]`],
      ['read', `  @i += 1`],
      ['read', `  ${k('return')} ${k('nil')} ${k('if')} tok == '${c('#\'')}`],
      ['make', `  node = TreeNode.new(tok.to_i)`],
      [null, `  node.left = read_tree(tokens)`],
      [null, `  node.right = read_tree(tokens)`],
      ['link', `  node`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('import')} sys`],
      [null, `sys.setrecursionlimit(30_000)                   ${c('# a chain of 10^4 nodes is that deep')}`],
      [null, ``],
      [null, `${k('class')} Codec:`],
      [null, `    ${k('def')} serialize(self, root):`],
      [null, `        out = []`],
      [null, ``],
      [null, `        ${k('def')} walk(node):                         ${c('# preorder, "#" where a child is missing')}`],
      [null, `            ${k('if')} node ${k('is')} ${k('None')}:`],
      ['null', `                out.append('${c('#\')')}`],
      [null, `                ${k('return')}`],
      ['val', `            out.append(str(node.val))`],
      [null, `            walk(node.left)`],
      [null, `            walk(node.right)`],
      [null, ``],
      [null, `        walk(root)`],
      ['join', `        ${k('return')} ','.join(out)`],
      [null, ``],
      [null, `    ${k('def')} deserialize(self, data):`],
      ['split', `        tokens = iter(data.split(','))`],
      [null, ``],
      [null, `        ${k('def')} read():                             ${c('# read one subtree, in the same preorder')}`],
      ['read', `            tok = next(tokens)`],
      ['read', `            ${k('if')} tok == '${c('#\':')}`],
      ['read', `                ${k('return')} ${k('None')}`],
      ['make', `            node = TreeNode(int(tok))`],
      [null, `            node.left = read()`],
      [null, `            node.right = read()`],
      ['link', `            ${k('return')} node`],
      [null, ``],
      ['ret', `        ${k('return')} read()`],
    ],
    javascript: [
      [null, `${k('var')} serialize = ${k('function')} (root) {`],
      [null, `  ${k('const')} out = [];`],
      [null, `  ${k('const')} walk = (node) =&gt; { ${c('// preorder, "#" where a child is missing')}`],
      ['null', `    ${k('if')} (node === ${k('null')}) { out.push('#'); ${k('return')}; }`],
      ['val', `    out.push(String(node.val));`],
      [null, `    walk(node.left);`],
      [null, `    walk(node.right);`],
      [null, `  };`],
      [null, `  walk(root);`],
      ['join', `  ${k('return')} out.join(',');`],
      [null, `};`],
      [null, ``],
      [null, `${k('var')} deserialize = ${k('function')} (data) {`],
      ['split', `  ${k('const')} tokens = data.split(',');`],
      [null, `  ${k('let')} i = 0;`],
      [null, `  ${k('const')} read = () =&gt; { ${c('// read one subtree, in the same preorder')}`],
      ['read', `    ${k('const')} tok = tokens[i++];`],
      ['read', `    ${k('if')} (tok === '#') ${k('return')} ${k('null')};`],
      ['make', `    ${k('const')} node = ${k('new')} TreeNode(Number(tok));`],
      [null, `    node.left = read();`],
      [null, `    node.right = read();`],
      ['link', `    ${k('return')} node;`],
      [null, `  };`],
      ['ret', `  ${k('return')} read();`],
      [null, `};`],
    ],
    go: [
      [null, `type Codec struct{}`],
      [null, ``],
      [null, `${k('func')} Constructor() Codec {`],
      [null, `    ${k('return')} Codec{}`],
      [null, `}`],
      [null, ``],
      [null, `${k('func')} (this *Codec) serialize(root *TreeNode) string {`],
      [null, `    out := []string{}`],
      [null, `    ${k('var')} walk ${k('func')}(node *TreeNode)            ${c('// preorder, "#" where a child is missing')}`],
      [null, `    walk = ${k('func')}(node *TreeNode) {`],
      [null, `        ${k('if')} node == ${k('nil')} {`],
      ['null', `            out = append(out, "#")`],
      [null, `            ${k('return')}`],
      [null, `        }`],
      ['val', `        out = append(out, strconv.Itoa(node.Val))`],
      [null, `        walk(node.Left)`],
      [null, `        walk(node.Right)`],
      [null, `    }`],
      [null, `    walk(root)`],
      ['join', `    ${k('return')} strings.Join(out, ",")`],
      [null, `}`],
      [null, ``],
      [null, `${k('func')} (this *Codec) deserialize(data string) *TreeNode {`],
      ['split', `    tokens := strings.Split(data, ",")`],
      [null, `    i := 0`],
      [null, `    ${k('var')} read ${k('func')}() *TreeNode                ${c('// read one subtree, in the same preorder')}`],
      [null, `    read = ${k('func')}() *TreeNode {`],
      ['read', `        tok := tokens[i]`],
      ['read', `        i++`],
      ['read', `        ${k('if')} tok == "#" {`],
      ['read', `            ${k('return')} ${k('nil')}`],
      [null, `        }`],
      [null, `        v, _ := strconv.Atoi(tok)`],
      ['make', `        node := &amp;TreeNode{Val: v}`],
      [null, `        node.Left = read()`],
      [null, `        node.Right = read()`],
      ['link', `        ${k('return')} node`],
      [null, `    }`],
      ['ret', `    ${k('return')} read()`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('use')} std::cell::RefCell;`],
      [null, `${k('use')} std::rc::Rc;`],
      [null, ``],
      [null, `struct Codec {}`],
      [null, ``],
      [null, `${k('impl')} Codec {`],
      [null, `    ${k('fn')} new() -&gt; ${k('Self')} {`],
      [null, `        Codec {}`],
      [null, `    }`],
      [null, ``],
      [null, `    ${k('fn')} serialize(&amp;self, root: Option&lt;Rc&lt;RefCell&lt;TreeNode&gt;&gt;&gt;) -&gt; String {`],
      [null, `        ${k('let')} ${k('mut')} out = vec![];`],
      [null, `        ${k('Self')}::walk(&amp;root, &amp;${k('mut')} out);`],
      ['join', `        out.join(",")`],
      [null, `    }`],
      [null, ``],
      [null, `    ${c('// preorder, "#" where a child is missing')}`],
      [null, `    ${k('fn')} walk(node: &amp;Option&lt;Rc&lt;RefCell&lt;TreeNode&gt;&gt;&gt;, out: &amp;${k('mut')} Vec&lt;String&gt;) {`],
      [null, `        ${k('match')} node {`],
      ['null', `            ${k('None')} =&gt; out.push("#".to_string()),`],
      [null, `            ${k('Some')}(n) =&gt; {`],
      [null, `                ${k('let')} n = n.borrow();`],
      ['val', `                out.push(n.val.to_string());`],
      [null, `                ${k('Self')}::walk(&amp;n.left, out);`],
      [null, `                ${k('Self')}::walk(&amp;n.right, out);`],
      [null, `            }`],
      [null, `        }`],
      [null, `    }`],
      [null, ``],
      [null, `    ${k('fn')} deserialize(&amp;self, data: String) -&gt; Option&lt;Rc&lt;RefCell&lt;TreeNode&gt;&gt;&gt; {`],
      ['split', `        ${k('let')} ${k('mut')} tokens = data.split(',');`],
      ['ret', `        ${k('Self')}::read(&amp;${k('mut')} tokens)`],
      [null, `    }`],
      [null, ``],
      [null, `    ${c('// read one subtree, in the same preorder')}`],
      [null, `    ${k('fn')} read(tokens: &amp;${k('mut')} std::str::Split&lt;'_, char&gt;) -&gt; Option&lt;Rc&lt;RefCell&lt;TreeNode&gt;&gt;&gt; {`],
      ['read', `        ${k('let')} tok = tokens.next()?;`],
      ['read', `        ${k('if')} tok == "#" {`],
      ['read', `            ${k('return')} ${k('None')};`],
      [null, `        }`],
      ['make', `        ${k('let')} node = Rc::new(RefCell::new(TreeNode::new(tok.parse().unwrap())));`],
      [null, `        ${k('let')} left = ${k('Self')}::read(tokens);`],
      [null, `        ${k('let')} right = ${k('Self')}::read(tokens);`],
      [null, `        node.borrow_mut().left = left;`],
      [null, `        node.borrow_mut().right = right;`],
      ['link', `        ${k('Some')}(node)`],
      [null, `    }`],
      [null, `}`],
    ],
  },
  level: {
    ruby: [
      [null, `${k('def')} serialize(root)`],
      ['init', `  out, queue = [], [root]`],
      [null, `  ${k('until')} queue.empty?`],
      ['pop', `    node = queue.shift`],
      [null, `    ${k('if')} node.nil?`],
      ['null', `      out &lt;&lt; '${c('#\'')}`],
      [null, `    ${k('else')}`],
      ['val', `      out &lt;&lt; node.val.to_s`],
      ['val', `      queue &lt;&lt; node.left &lt;&lt; node.right ${c('# both children, even missing ones')}`],
      [null, `    ${k('end')}`],
      [null, `  ${k('end')}`],
      ['join', `  out.join(',')`],
      [null, `${k('end')}`],
      [null, ``],
      [null, `${k('def')} deserialize(data)`],
      ['split', `  tokens = data.split(',')`],
      ['split', `  ${k('return')} ${k('nil')} ${k('if')} tokens[0] == '${c('#\'')}`],
      ['make', `  root = TreeNode.new(tokens[0].to_i)`],
      ['make', `  queue, i = [root], 1`],
      [null, `  ${k('until')} queue.empty?`],
      ['parent', `    node = queue.shift ${c('# its two children are the next two tokens')}`],
      ['left', `    ${k('if')} tokens[i] != '${c('#\'')}`],
      ['left', `      node.left = TreeNode.new(tokens[i].to_i)`],
      ['left', `      queue &lt;&lt; node.left`],
      [null, `    ${k('end')}`],
      ['right', `    ${k('if')} tokens[i + 1] != '${c('#\'')}`],
      ['right', `      node.right = TreeNode.new(tokens[i + 1].to_i)`],
      ['right', `      queue &lt;&lt; node.right`],
      [null, `    ${k('end')}`],
      [null, `    i += 2`],
      [null, `  ${k('end')}`],
      ['ret', `  root`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('from')} collections ${k('import')} deque`],
      [null, ``],
      [null, `${k('class')} Codec:`],
      [null, `    ${k('def')} serialize(self, root):`],
      ['init', `        out, queue = [], deque([root])`],
      [null, `        ${k('while')} queue:`],
      ['pop', `            node = queue.popleft()`],
      [null, `            ${k('if')} node ${k('is')} ${k('None')}:`],
      ['null', `                out.append('${c('#\')')}`],
      [null, `            ${k('else')}:`],
      ['val', `                out.append(str(node.val))`],
      ['val', `                queue.extend((node.left, node.right))   ${c('# both children, even missing ones')}`],
      ['join', `        ${k('return')} ','.join(out)`],
      [null, ``],
      [null, `    ${k('def')} deserialize(self, data):`],
      ['split', `        tokens = data.split(',')`],
      ['split', `        ${k('if')} tokens[0] == '${c('#\':')}`],
      ['split', `            ${k('return')} ${k('None')}`],
      ['make', `        root = TreeNode(int(tokens[0]))`],
      ['make', `        queue, i = deque([root]), 1`],
      [null, `        ${k('while')} queue:`],
      ['parent', `            node = queue.popleft()              ${c('# its two children are the next two tokens')}`],
      ['left', `            ${k('if')} tokens[i] != '${c('#\':')}`],
      ['left', `                node.left = TreeNode(int(tokens[i]))`],
      ['left', `                queue.append(node.left)`],
      ['right', `            ${k('if')} tokens[i + 1] != '${c('#\':')}`],
      ['right', `                node.right = TreeNode(int(tokens[i + 1]))`],
      ['right', `                queue.append(node.right)`],
      [null, `            i += 2`],
      ['ret', `        ${k('return')} root`],
    ],
    javascript: [
      [null, `${k('var')} serialize = ${k('function')} (root) {`],
      ['init', `  ${k('const')} out = [], queue = [root];`],
      [null, `  ${k('for')} (${k('let')} h = 0; h &lt; queue.length; h++) {`],
      ['pop', `    ${k('const')} node = queue[h];`],
      [null, `    ${k('if')} (node === ${k('null')}) {`],
      ['null', `      out.push('#');`],
      [null, `    } ${k('else')} {`],
      ['val', `      out.push(String(node.val));`],
      ['val', `      queue.push(node.left, node.right); ${c('// both children, even missing ones')}`],
      [null, `    }`],
      [null, `  }`],
      ['join', `  ${k('return')} out.join(',');`],
      [null, `};`],
      [null, ``],
      [null, `${k('var')} deserialize = ${k('function')} (data) {`],
      ['split', `  ${k('const')} tokens = data.split(',');`],
      ['split', `  ${k('if')} (tokens[0] === '#') ${k('return')} ${k('null')};`],
      ['make', `  ${k('const')} root = ${k('new')} TreeNode(Number(tokens[0]));`],
      ['make', `  ${k('const')} queue = [root];`],
      ['make', `  ${k('let')} i = 1;`],
      [null, `  ${k('for')} (${k('let')} h = 0; h &lt; queue.length; h++) {`],
      ['parent', `    ${k('const')} node = queue[h]; ${c('// its two children are the next two tokens')}`],
      ['left', `    ${k('if')} (tokens[i] !== '#') {`],
      ['left', `      node.left = ${k('new')} TreeNode(Number(tokens[i]));`],
      ['left', `      queue.push(node.left);`],
      [null, `    }`],
      ['right', `    ${k('if')} (tokens[i + 1] !== '#') {`],
      ['right', `      node.right = ${k('new')} TreeNode(Number(tokens[i + 1]));`],
      ['right', `      queue.push(node.right);`],
      [null, `    }`],
      [null, `    i += 2;`],
      [null, `  }`],
      ['ret', `  ${k('return')} root;`],
      [null, `};`],
    ],
    go: [
      [null, `type Codec struct{}`],
      [null, ``],
      [null, `${k('func')} Constructor() Codec {`],
      [null, `    ${k('return')} Codec{}`],
      [null, `}`],
      [null, ``],
      [null, `${k('func')} (this *Codec) serialize(root *TreeNode) string {`],
      ['init', `    out, queue := []string{}, []*TreeNode{root}`],
      [null, `    ${k('for')} len(queue) &gt; 0 {`],
      ['pop', `        node := queue[0]`],
      ['pop', `        queue = queue[1:]`],
      [null, `        ${k('if')} node == ${k('nil')} {`],
      ['null', `            out = append(out, "#")`],
      [null, `        } ${k('else')} {`],
      ['val', `            out = append(out, strconv.Itoa(node.Val))`],
      ['val', `            queue = append(queue, node.Left, node.Right) ${c('// both children, even missing ones')}`],
      [null, `        }`],
      [null, `    }`],
      ['join', `    ${k('return')} strings.Join(out, ",")`],
      [null, `}`],
      [null, ``],
      [null, `${k('func')} (this *Codec) deserialize(data string) *TreeNode {`],
      ['split', `    tokens := strings.Split(data, ",")`],
      ['split', `    ${k('if')} tokens[0] == "#" {`],
      ['split', `        ${k('return')} ${k('nil')}`],
      [null, `    }`],
      [null, `    v, _ := strconv.Atoi(tokens[0])`],
      ['make', `    root := &amp;TreeNode{Val: v}`],
      ['make', `    queue, i := []*TreeNode{root}, 1`],
      [null, `    ${k('for')} len(queue) &gt; 0 {`],
      ['parent', `        node := queue[0]                     ${c('// its two children are the next two tokens')}`],
      ['parent', `        queue = queue[1:]`],
      ['left', `        ${k('if')} tokens[i] != "#" {`],
      ['left', `            v, _ := strconv.Atoi(tokens[i])`],
      ['left', `            node.Left = &amp;TreeNode{Val: v}`],
      ['left', `            queue = append(queue, node.Left)`],
      [null, `        }`],
      ['right', `        ${k('if')} tokens[i+1] != "#" {`],
      ['right', `            v, _ := strconv.Atoi(tokens[i+1])`],
      ['right', `            node.Right = &amp;TreeNode{Val: v}`],
      ['right', `            queue = append(queue, node.Right)`],
      [null, `        }`],
      [null, `        i += 2`],
      [null, `    }`],
      ['ret', `    ${k('return')} root`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('use')} std::cell::RefCell;`],
      [null, `${k('use')} std::collections::VecDeque;`],
      [null, `${k('use')} std::rc::Rc;`],
      [null, ``],
      [null, `struct Codec {}`],
      [null, ``],
      [null, `${k('impl')} Codec {`],
      [null, `    ${k('fn')} new() -&gt; ${k('Self')} {`],
      [null, `        Codec {}`],
      [null, `    }`],
      [null, ``],
      [null, `    ${k('fn')} serialize(&amp;self, root: Option&lt;Rc&lt;RefCell&lt;TreeNode&gt;&gt;&gt;) -&gt; String {`],
      ['init', `        ${k('let')} (${k('mut')} out, ${k('mut')} queue) = (vec![], VecDeque::from([root]));`],
      ['pop', `        ${k('while')} ${k('let')} ${k('Some')}(node) = queue.pop_front() {`],
      [null, `            ${k('match')} node {`],
      ['null', `                ${k('None')} =&gt; out.push("#".to_string()),`],
      [null, `                ${k('Some')}(n) =&gt; {`],
      [null, `                    ${k('let')} n = n.borrow();`],
      ['val', `                    out.push(n.val.to_string());`],
      ['val', `                    queue.push_back(n.left.clone()); ${c('// both children, even missing ones')}`],
      ['val', `                    queue.push_back(n.right.clone());`],
      [null, `                }`],
      [null, `            }`],
      [null, `        }`],
      ['join', `        out.join(",")`],
      [null, `    }`],
      [null, ``],
      [null, `    ${k('fn')} deserialize(&amp;self, data: String) -&gt; Option&lt;Rc&lt;RefCell&lt;TreeNode&gt;&gt;&gt; {`],
      ['split', `        ${k('let')} tokens: Vec&lt;&amp;str&gt; = data.split(',').collect();`],
      ['split', `        ${k('if')} tokens[0] == "#" {`],
      ['split', `            ${k('return')} ${k('None')};`],
      [null, `        }`],
      [null, `        ${k('let')} node = |t: &amp;str| ${k('Some')}(Rc::new(RefCell::new(TreeNode::new(t.parse().unwrap()))));`],
      ['make', `        ${k('let')} root = node(tokens[0]);`],
      ['make', `        ${k('let')} (${k('mut')} queue, ${k('mut')} i) = (VecDeque::from([root.clone().unwrap()]), 1);`],
      ['parent', `        ${k('while')} ${k('let')} ${k('Some')}(parent) = queue.pop_front() { ${c('// its two children are the next two tokens')}`],
      ['left', `            ${k('if')} tokens[i] != "#" {`],
      ['left', `                ${k('let')} left = node(tokens[i]);`],
      ['left', `                queue.push_back(left.clone().unwrap());`],
      ['left', `                parent.borrow_mut().left = left;`],
      [null, `            }`],
      ['right', `            ${k('if')} tokens[i + 1] != "#" {`],
      ['right', `                ${k('let')} right = node(tokens[i + 1]);`],
      ['right', `                queue.push_back(right.clone().unwrap());`],
      ['right', `                parent.borrow_mut().right = right;`],
      [null, `            }`],
      [null, `            i += 2;`],
      [null, `        }`],
      ['ret', `        root`],
      [null, `    }`],
      [null, `}`],
    ],
  },
};


/* ---------------- part 1: the "why the #s" widget ----------------
 *
 * The statement leaves the format open, and the one thing a format must do
 * is tell different trees apart. Pick two trees; see their preorder values
 * with the "#"s and without. Without them, different trees can write the
 * same string — and then no reader can know which to rebuild. */

const QW_SETS = [
  { label: t('left or right child', 'ဘယ် သို့မဟုတ် ညာ ကလေး'), a: [1, 2], b: [1, null, 2] },
  { label: t('a chain or a V', 'ကွင်းဆက် သို့မဟုတ် V'), a: [1, 2, null, 3], b: [1, 2, 3] },
  { label: exampleTitle(1), a: [1, 2, 3, null, null, 4, 5], b: [1, 2, null, 3, null, 4, null, 5] },
];

function preorderTokens(level, marks) {
  const T = buildTree(level);
  const out = [];
  (function w(key) {
    if (key == null) { if (marks) out.push('#'); return; }
    out.push(String(T.val[key])); w(T.kids[key][0]); w(T.kids[key][1]);
  })(T.root);
  return out;
}

function mountMarksWidget(host) {
  const state = { set: 0, marks: false };
  host.innerHTML = `
    <div class="sd-w" data-pair></div>
    <div class="q-slider"><span class="q-presets" data-presets></span></div>
    <div class="q-slider"><span class="q-presets" data-mode></span></div>
    <p class="q-tie" data-line></p>
    <div class="ledger">
      <span class="expr" data-expr></span>
      <span class="total" data-total></span>
    </div>`;
  const q = (sel) => host.querySelector(sel);

  function render() {
    const { a, b } = QW_SETS[state.set];
    const ta = preorderTokens(a, state.marks), tb = preorderTokens(b, state.marks);
    const same = ta.join(',') === tb.join(',');
    const one = (level, toks) => {
      const T = buildTree(level);
      return `<div class="sd-one">${tree(asNested(T.root, T.val, T.kids))}<div class="q-arr">${toks.map((x) =>
        `<div class="cell ${x === '#' ? 'cut' : same ? 'picked' : 'kept'}"><span>${x}</span></div>`).join('')}</div></div>`;
    };
    q('[data-pair]').innerHTML = one(a, ta) + one(b, tb);
    q('[data-presets]').innerHTML = presetChips(QW_SETS, state.set);
    q('[data-mode]').innerHTML = [[false, t('values only', 'value များသာ')], [true, t('values and #', 'value နှင့် #')]]
      .map(([v, text]) => `<button class="chip" data-marks="${v}"${v === state.marks ? ' aria-pressed="true"' : ''}>${pick(text)}</button>`).join('');
    widgetLabel(pick(t('two trees, one string?', 'tree နှစ်ခု၊ string တစ်ခု?')));
    q('[data-line]').innerHTML = pick(same
      ? t('Two different trees, one string: a reader given it cannot know which tree to rebuild. The values alone do not record the shape.',
          'မတူသော tree နှစ်ခု၊ string တစ်ခု — ၎င်းကို ရသူက မည်သည့် tree ကို ပြန်တည်ဆောက်ရမည်ကို မသိနိုင်။ value များတစ်ခုတည်းက ပုံသဏ္ဌာန်ကို မမှတ်ပါ။')
      : state.marks
        ? t('With a "#" for every missing child the strings differ — and they always will: a preorder with every null marked has exactly one tree.',
            'မရှိသော ကလေးတိုင်းအတွက် "#" ပါလျှင် string များ ကွာသည် — အမြဲ ကွာမည် — null တိုင်း မှတ်ထားသော preorder တွင် tree တစ်ခုတည်းသာ ရှိသည်။')
        : t('These two happen to differ even without "#" — but other pairs collide. Try the other presets.',
            'ဤနှစ်ခုသည် "#" မပါဘဲပင် ကွာနေသည် — သို့သော် အခြား အတွဲများ တိုက်သည်။ အခြား preset များကို စမ်းပါ။'));
    q('[data-expr]').innerHTML = `"${ta.join(',')}" ${same ? '=' : '≠'} "${tb.join(',')}"`;
    q('[data-total]').innerHTML = `${same ? '✗' : '✓'}<small>${pick(same ? t('ambiguous', 'မရှင်း') : t('distinct', 'ကွဲပြား'))}</small>`;
  }
  host.addEventListener('click', (ev) => {
    const chip = ev.target.closest('[data-set]');
    if (chip) { state.set = Number(chip.dataset.set); return render(); }
    const m = ev.target.closest('[data-marks]');
    if (m) { state.marks = m.dataset.marks === 'true'; render(); }
  });
  onLangChange(render);
  render();
}

/* ---------------- the approach, in brief ---------------- */

const APPROACH = {
  preorder: {
    idea: t('Write the tree in preorder with "#" for every missing child. Reading it back is the same walk: take a token; "#" is an empty subtree, anything else is a node whose left and right subtrees follow.',
            'tree ကို preorder ဖြင့် ရေးပြီး မရှိသော ကလေးတိုင်းအတွက် "#"။ ပြန်ဖတ်ခြင်းသည် walk တူတူ — token တစ်ခုယူ — "#" သည် ဗလာ subtree၊ အခြားအရာသည် ၎င်း၏ ဘယ်နှင့် ညာ subtree များ နောက်မှ လိုက်သော node။'),
    steps: [
      t('<code>serialize</code>: null → "#"; otherwise the value, then the left subtree, then the right. Join with commas.', '<code>serialize</code> — null → "#" — မဟုတ်လျှင် value၊ ပြီးမှ ဘယ် subtree၊ ပြီးမှ ညာ။ comma ဖြင့် ဆက်။'),
      t('<code>deserialize</code>: split, then <code>read()</code> takes the next token — "#" returns null, a number makes a node and reads its left and right.', '<code>deserialize</code> — split ပြီး <code>read()</code> က နောက် token ကို ယူ — "#" က null ပြန်ပေး၊ ကိန်းက node ပြုလုပ်ပြီး ၎င်း၏ ဘယ်နှင့် ညာကို ဖတ်။'),
    ],
    cost: t('O(n) time and 2n + 1 tokens each way; both walks recurse as deep as the tree — 10⁴ on a chain.', 'O(n) အချိန်၊ ဘက်တစ်ခုစီ token 2n + 1 — walk နှစ်ခုလုံး tree ၏ အနက်အထိ recurse — ကွင်းဆက်တွင် 10⁴။'),
  },
  level: {
    idea: t('Write the tree level by level with a queue, both children of every node including the missing ones. To read it back, each node taken off a queue claims the next two tokens as its children.',
            'queue ဖြင့် tree ကို level အလိုက် ရေး — node တိုင်း၏ ကလေး နှစ်ခုလုံး၊ မရှိသည်များပါ။ ပြန်ဖတ်ရန် queue မှ ထုတ်သော node တစ်ခုစီက နောက် token နှစ်ခုကို ၎င်း၏ ကလေးများအဖြစ် ယူသည်။'),
    steps: [
      t('<code>serialize</code>: pop a node; null → "#", else its value, and queue both children.', '<code>serialize</code> — node တစ်ခု pop — null → "#"၊ မဟုတ်လျှင် ၎င်း၏ value ပြီး ကလေး နှစ်ခုလုံး queue။'),
      t('<code>deserialize</code>: the first token is the root. Pop a parent; tokens <code>i</code> and <code>i + 1</code> are its children — make and queue any that are not "#".', '<code>deserialize</code> — ပထမ token သည် root။ parent တစ်ခု pop — token <code>i</code> နှင့် <code>i + 1</code> သည် ၎င်း၏ ကလေးများ — "#" မဟုတ်သည်ကို ပြုလုပ်ပြီး queue။'),
    ],
    cost: t('O(n) time and 2n + 1 tokens; the queue holds at most one level plus its children, and nothing recurses.', 'O(n) အချိန်နှင့် token 2n + 1 — queue သည် level တစ်ခုနှင့် ၎င်း၏ ကလေးများ အများဆုံး ကိုင်ပြီး ဘာမှ recurse မလုပ်။'),
  },
};

/* ---------------- mount ---------------- */

function upTo12(text) {
  return treeInput(MAX_NODES)(text);
}

mountLesson({
  input: { level: [1, 2, 3, null, null, 4, 5] },
  controls: [
    { key: 'level', label: 'root', value: '1, 2, 3, null, null, 4, 5', parse: upTo12, format: formatLevelOrder },
  ],
  presets: [
    { label: exampleTitle(1), input: { level: [1, 2, 3, null, null, 4, 5] } },
    { label: exampleTitle(2), input: { level: [] } },
    { label: t('a chain', 'ကွင်းဆက်'), input: { level: [1, null, 2, null, 3, null, 4] } },
    { label: t('negatives and repeats', 'အနုတ်နှင့် ထပ်'), input: { level: [-1, 5, 5, null, -1000] } },
  ],
  examples: [
    { title: exampleTitle(1), inputHtml: '<code>root = [1,2,3,null,null,4,5]</code>', output: '[1,2,3,null,null,4,5]', why: [], load: { level: [1, 2, 3, null, null, 4, 5] } },
    { title: exampleTitle(2), inputHtml: '<code>root = []</code>', output: '[]', why: [], load: { level: [] } },
  ],
  modes: [
    { id: 'preorder', name: 'Preorder with # markers',
      sub: t('recursive', 'recursive'),
      desc: t('Write and read the tree depth-first, "#" for every missing child.', 'tree ကို depth-first ဖြင့် ရေးပြီး ဖတ် — မရှိသော ကလေးတိုင်းအတွက် "#"။'),
      cost: 'O(n) time · O(h) stack', build: buildPreorder },
    { id: 'level', name: 'Level order with a queue',
      sub: t('no recursion', 'recursion မပါ'),
      desc: t('Write and read the tree level by level; each parent takes the next two tokens.', 'tree ကို level အလိုက် ရေးပြီး ဖတ် — parent တစ်ခုစီက နောက် token နှစ်ခုကို ယူ။'),
      cost: 'O(n) time · O(width) queue', build: buildLevel },
  ],
  languages: LANGUAGES,
  code: CODE,
  solutions: {
    preorder: { approach: APPROACH.preorder,
      desc: t('The shortest codec to write, and each half mirrors the other. Its depth is the catch: a 10⁴-node chain takes both walks 10⁴ calls deep, past the default stacks of Ruby and Node.',
              'ရေးရန် အတိုဆုံး codec ဖြစ်ပြီး တစ်ဝက်စီသည် အခြားတစ်ဝက်၏ ပုံရိပ်။ ပြဿနာမှာ အနက် — node 10⁴ ကွင်းဆက်က walk နှစ်ခုလုံးကို call 10⁴ ဆင့် နက်စေပြီး Ruby နှင့် Node ၏ default stack ကို ကျော်သည်။') },
    level: { approach: APPROACH.level,
      desc: t('The format LeetCode itself uses, with the trailing "#"s kept so every node has two tokens. A queue each way and no recursion, so no stack to run out of.',
              'LeetCode ကိုယ်တိုင် သုံးသော format — node တိုင်းတွင် token နှစ်ခု ရှိစေရန် နောက်ဆုံး "#" များကို ထားထားသည်။ ဘက်တစ်ခုစီ queue တစ်ခု၊ recursion မပါ၊ ထို့ကြောင့် ကုန်သွားမည့် stack မရှိ။') },
  },
  // How each language was actually checked, printed as the part 3 badges.
  // The corpus: the 2 examples, 6 edges, 15,000 random trees of up to 9
  // nodes over -3..3, 5,000 of up to 300, and six at 10⁴ nodes (three chains,
  // a random tree, a complete tree, a chain of -1000s). Each driver
  // serializes with one codec, deserializes with another, and checks the
  // rebuilt tree prints as the input. Go and Rust ran in Docker
  // (golang:1.23-alpine, rust:1-slim) on their default stacks. The preorder
  // limits were measured cold, one left chain per process.
  verification: {
    ruby: { preorder: 'ran here · overflows Ruby 3.1\'s default stack past an 8,185-node chain', level: 'ran here · 20,014 round trips' },
    python: { preorder: 'ran here · 20,014 round trips, 10⁴ calls deep', level: 'ran here · 20,014 round trips' },
    javascript: { preorder: 'ran here · overflows Node 24\'s default stack past an 8,881-node chain', level: 'ran here · 20,014 round trips' },
    go: 'ran here · 20,014 round trips · Go 1.23',
    rust: 'ran here · 20,014 round trips · rustc 1.98',
  },
  caveats: {
    preorder: {
      ruby: t('Correct on all 20,014 round trips with a larger stack, but on Ruby 3.1\'s default stack a chain of more than 8,185 nodes overflows it (<code>SystemStackError</code>) — measured here — and the constraint allows 10⁴. Use the level-order codec.',
              'stack ပိုကြီးလျှင် round trip 20,014 ခုလုံးတွင် မှန်သည်၊ သို့သော် Ruby 3.1 ၏ default stack ပေါ်တွင် node 8,185 ထက် ရှည်သော ကွင်းဆက်က overflow (<code>SystemStackError</code>) ဖြစ်စေသည် — ဤနေရာတွင် တိုင်းတာထားသည် — ကန့်သတ်ချက်က 10⁴ ကို ခွင့်ပြုသည်။ level-order codec ကို သုံးပါ။'),
      javascript: t('Correct on all 20,014 round trips with a larger stack, but on Node 24\'s default stack, run cold, a chain of more than 8,881 nodes overflows it (<code>RangeError</code>) — measured here — and the constraint allows 10⁴. Use the level-order codec.',
                    'stack ပိုကြီးလျှင် round trip 20,014 ခုလုံးတွင် မှန်သည်၊ သို့သော် Node 24 ၏ default stack ပေါ်တွင် cold run လုပ်လျှင် node 8,881 ထက် ရှည်သော ကွင်းဆက်က overflow (<code>RangeError</code>) ဖြစ်စေသည် — ဤနေရာတွင် တိုင်းတာထားသည် — ကန့်သတ်ချက်က 10⁴ ကို ခွင့်ပြုသည်။ level-order codec ကို သုံးပါ။'),
      python: t('The <code>setrecursionlimit</code> line is part of the answer: Python\'s default of 1,000 is far below the 10⁴-node chain the constraint allows.',
                '<code>setrecursionlimit</code> စာကြောင်းသည် အဖြေ၏ အစိတ်အပိုင်း — Python ၏ default 1,000 သည် ကန့်သတ်ချက် ခွင့်ပြုသော node 10⁴ ကွင်းဆက်ထက် အများကြီး နိမ့်သည်။'),
    },
  },
  stripLabel: t('root, in level order (∅ = null)', 'root — level order (∅ = null)'),
  strip,
  draw,
  answer,
  vars,
  widget: mountMarksWidget,
});
