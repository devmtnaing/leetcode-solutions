/* Merge k Sorted Lists — LeetCode 23.
 *
 * Both approaches are built from one move: merge two sorted lists by
 * repeatedly taking the smaller head. What differs is the order of merges.
 * Folding the lists into one running result re-walks that result every time,
 * so early nodes are moved up to k times. Merging in pairs, round after round,
 * halves the number of lists each round: every node is moved once per round,
 * and there are about log₂ k rounds.
 */
import { mountLesson } from '../../lib/stepper.js';
import { pick, onLangChange } from '../../lib/i18n.js';
import { cells, slots, stagePanel, readout } from '../../lib/stage.js';
import { t, exampleTitle, LANGUAGES, k, c, labelledRows, stageRow, stageGap, presetChips, widgetLabel } from '../../lib/kit.js';

const MAX_K = 6, MAX_N = 14;

function parseLists(text) {
  const s = String(text).replace(/\s+/g, '');
  if (!/^\[.*\]$/.test(s) || !/^[\[\],\d-]*$/.test(s)) throw new Error('a list of sorted lists, like [[1,4,5],[1,3,4],[2,6]]');
  const inner = s.slice(1, -1);
  const lists = inner ? [...inner.matchAll(/\[([^[\]]*)\]/g)].map((m) => (m[1] ? m[1].split(',').map(Number) : [])) : [];
  if (inner && lists.length === 0) throw new Error('each list in its own brackets, like [[1,2],[3]]');
  if (lists.some((l) => l.some((v) => !Number.isInteger(v)))) throw new Error('whole numbers only');
  if (lists.some((l) => l.some((v, i) => i && l[i - 1] > v))) throw new Error('every list must be sorted, smallest first');
  if (lists.length > MAX_K) throw new Error(`at most ${MAX_K} lists, so the stage stays readable`);
  if (lists.flat().length > MAX_N) throw new Error(`at most ${MAX_N} values in all, so the stage stays readable`);
  return lists;
}
const fmtLists = (ls) => `[${ls.map((l) => `[${l.join(',')}]`).join(',')}]`;
const vals = (nodes) => nodes.map((n) => n.v);
const arr = (nodes) => `[${vals(nodes).join(',')}]`;

/* Nodes carry the (list, position) they started at, so the strip can show
 * which original node a merge is taking. */
const nodesOf = (lists) => lists.map((l, i) => l.map((v, j) => ({ id: `${i}.${j}`, v })));

/* One merge of a and b, as steps. `ctx` is added to every snapshot; `snap`
 * builds a snapshot from the live a, b, out. Returns the merged nodes. */
function mergeSteps(a0, b0, snap, steps, moves, label) {
  let a = [...a0], b = [...b0];
  const out = [];
  while (a.length && b.length) {
    const fromA = a[0].v <= b[0].v;
    const node = fromA ? a.shift() : b.shift();
    out.push(node);
    moves.n++;
    steps.push(snap({ line: 'take', a, b, out, took: node.id, tag: t(`take ${node.v}`, `${node.v} ယူ`),
      note: t(`${label}: heads ${node.v} and ${(fromA ? b[0] : a[0]).v} — take the smaller, ${node.v}${node.v === (fromA ? b[0] : a[0]).v ? ' (a tie goes to the first list)' : ''}. Nodes moved so far: ${moves.n}.`,
              `${label} — ခေါင်း ${node.v} နှင့် ${(fromA ? b[0] : a[0]).v} — ငယ်သော ${node.v} ကို ယူသည်${node.v === (fromA ? b[0] : a[0]).v ? ' (တူလျှင် ပထမ list က ရ)' : ''}။ ယခုထိ ရွှေ့ပြီး node — ${moves.n}။`) }));
  }
  const rest = a.length ? a : b;
  out.push(...rest);
  steps.push(snap({ line: 'rest', a: [], b: [], out, tag: t(rest.length ? `attach ${rest.length}` : 'nothing left', rest.length ? `${rest.length} ခု ချိတ်` : 'ဘာမှ မကျန်'),
    note: rest.length
      ? t(`One side is empty. Attach the other's remaining ${rest.length} ${rest.length === 1 ? 'node' : 'nodes'} in one step — they are already in order.`,
          `တစ်ဖက် ဗလာဖြစ်ပြီ။ ကျန်ဖက်၏ node ${rest.length} ခုကို တစ်ဆင့်တည်းဖြင့် ချိတ်သည် — စီပြီးသား ဖြစ်သည်။`)
      : t('Both sides are used up.', 'နှစ်ဖက်လုံး ကုန်ပြီ။') }));
  return out;
}

/* ---------------- step generators ---------------- */

function buildOne({ lists }) {
  const L = nodesOf(lists);
  let merged = [];
  const moves = { n: 0 };
  const steps = [];
  const snap = (extra) => ({ view: 'one', merged: [...merged], waiting: [], a: null, b: null, out: null, took: null, j: null, moves: moves.n, ...extra,
    ...(extra.a ? { a: [...extra.a], b: [...extra.b], out: [...extra.out] } : {}) });
  steps.push(snap({ line: 'init', waiting: L.map((_, i) => i), tag: t('merged = empty', 'merged = ဗလာ'),
    note: t(`Start with an empty result and fold the ${L.length} ${L.length === 1 ? 'list' : 'lists'} into it, one at a time.`,
            `ရလဒ် ဗလာဖြင့် စပြီး list ${L.length} ခုကို တစ်ခုချင်း ၎င်းထဲ ပေါင်းထည့်သည်။`) }));
  L.forEach((head, j) => {
    const waiting = L.map((_, i) => i).filter((i) => i > j);
    steps.push(snap({ line: 'fold', j, waiting, a: merged, b: head, out: [], tag: t(`fold lists[${j}]`, `lists[${j}] ပေါင်း`),
      note: t(`merge(merged, lists[${j}]): the ${merged.length} ${merged.length === 1 ? 'node' : 'nodes'} merged so far against ${head.length} new. Every node already in merged will be walked again.`,
              `merge(merged, lists[${j}]) — ယခုထိ ပေါင်းပြီး node ${merged.length} ခုကို အသစ် ${head.length} ခုနှင့်။ merged ထဲ ရှိပြီးသား node တိုင်းကို ထပ်လျှောက်မည်။`) }));
    merged = mergeSteps(merged, head, (e) => snap({ ...e, j, waiting }), steps, moves, `merge(merged, lists[${j}])`);
  });
  steps.push(snap({ line: 'ret', finished: true, tag: t(`${moves.n} moves`, `ရွှေ့ ${moves.n}`),
    note: t(`All ${L.length} lists folded in: ${merged.length} nodes, moved ${moves.n} times by comparisons along the way.`,
            `list ${L.length} ခုလုံး ပေါင်းပြီး — node ${merged.length} ခု၊ လမ်းတစ်လျှောက် နှိုင်းယှဉ်ခြင်းဖြင့် ${moves.n} ကြိမ် ရွှေ့ခဲ့သည်။`) }));
  return steps;
}

function buildHalves({ lists }) {
  let cur = nodesOf(lists);
  const moves = { n: 0 };
  const steps = [];
  let round = 0, paired = [];
  const snap = (extra) => ({ view: 'halves', cur: cur.map((l) => [...l]), paired: paired.map((l) => [...l]), round, a: null, b: null, out: null, took: null, i: null, moves: moves.n,
    merged: [], ...extra, ...(extra.a ? { a: [...extra.a], b: [...extra.b], out: [...extra.out] } : {}) });
  if (!cur.length) {
    steps.push(snap({ line: 'empty', finished: true, tag: t('no lists', 'list မရှိ'),
      note: t('No lists at all: return an empty list. Without this check, lists[0] at the end would fail.', 'list လုံးဝ မရှိ — list ဗလာ ပြန်သည်။ ဤစစ်ချက် မပါလျှင် အဆုံးရှိ lists[0] ပျက်မည်။') }));
    return steps;
  }
  steps.push(snap({ line: 'empty', tag: t(`${cur.length} lists`, `list ${cur.length} ခု`),
    note: t(`${cur.length} ${cur.length === 1 ? 'list' : 'lists'}, so there is something to merge.`, `list ${cur.length} ခု ရှိသဖြင့် ပေါင်းစရာ ရှိသည်။`) }));
  while (cur.length > 1) {
    round++;
    paired = [];
    steps.push(snap({ line: 'round', tag: t(`round ${round}`, `အကြိမ် ${round}`),
      note: t(`Round ${round}: pair the ${cur.length} lists up — 0 with 1, 2 with 3, … — so ${Math.ceil(cur.length / 2)} will be left.${cur.length % 2 ? ' The odd one out is paired with an empty list and passes through.' : ''}`,
              `အကြိမ် ${round} — list ${cur.length} ခုကို အတွဲလိုက် — 0 နှင့် 1၊ 2 နှင့် 3 … — ${Math.ceil(cur.length / 2)} ခု ကျန်မည်။${cur.length % 2 ? ' အပိုတစ်ခုကို list ဗလာနှင့် တွဲပြီး ဖြတ်သွားသည်။' : ''}`) }));
    for (let i = 0; i < cur.length; i += 2) {
      const a = cur[i], b = cur[i + 1] ?? [];
      steps.push(snap({ line: 'pair', i, a, b, out: [], tag: t(`merge ${i}, ${i + 1 < cur.length ? i + 1 : '∅'}`, `${i}, ${i + 1 < cur.length ? i + 1 : '∅'} ပေါင်း`),
        note: t(i + 1 < cur.length ? `Merge lists[${i}] and lists[${i + 1}]: ${a.length} and ${b.length} nodes.` : `lists[${i}] has no partner: merging it with nothing passes it through.`,
                i + 1 < cur.length ? `lists[${i}] နှင့် lists[${i + 1}] ကို ပေါင်းသည် — node ${a.length} နှင့် ${b.length}။` : `lists[${i}] တွင် အတွဲ မရှိ — ဘာမှမပါသည်နှင့် ပေါင်းလျှင် ဖြတ်သွားသည်။`) }));
      const out = mergeSteps(a, b, (e) => snap({ ...e, i }), steps, moves, `merge(lists[${i}], ${i + 1 < cur.length ? `lists[${i + 1}]` : 'None'})`);
      paired.push(out);
    }
    cur = paired;
    paired = [];
    steps.push(snap({ line: 'round', tag: t(`${cur.length} left`, `${cur.length} ခု ကျန်`),
      note: t(`Round ${round} done: ${cur.length} ${cur.length === 1 ? 'list' : 'lists'} left. Every node was moved at most once this round.`,
              `အကြိမ် ${round} ပြီး — list ${cur.length} ခု ကျန်သည်။ ဤအကြိမ်တွင် node တိုင်းကို အများဆုံး တစ်ကြိမ်သာ ရွှေ့ခဲ့သည်။`) }));
  }
  steps.push(snap({ line: 'ret', finished: true, merged: cur[0], tag: t(`${moves.n} moves`, `ရွှေ့ ${moves.n}`),
    note: t(`One list left after ${round} ${round === 1 ? 'round' : 'rounds'}: ${cur[0].length} nodes, moved ${moves.n} times by comparisons.`,
            `အကြိမ် ${round} အပြီး list တစ်ခု ကျန် — node ${cur[0].length} ခု၊ နှိုင်းယှဉ်ခြင်းဖြင့် ${moves.n} ကြိမ် ရွှေ့ခဲ့သည်။`) }));
  return steps;
}

/* ---------------- drawing ----------------
 *
 * The strip card is the input: one row per list, with the node a merge has
 * just taken lit. The stage is the merge in progress — its two inputs and
 * the output being built — above what the approach is holding: the running
 * result and the lists still to fold, or this round's lists and results. */

function strip(s, { lists }) {
  const heads = new Set([s.a?.[0]?.id, s.b?.[0]?.id].filter(Boolean));
  const inOut = new Set((s.out ?? []).map((n) => n.id));
  return labelledRows(lists.map((l, i) => [`lists[${i}]`, l.length ? cells(l, {
    tone: Object.fromEntries(l.map((_, j) => {
      const id = `${i}.${j}`;
      return [j, id === s.took ? 'entering' : heads.has(id) ? 'inwin' : inOut.has(id) ? 'done' : null];
    }).filter(([, x]) => x)),
  }) : `<span class="note mono">${pick(t('empty', 'ဗလာ'))}</span>`]));
}

const rowOf = (label, nodes, tone = {}) => [label, nodes.length ? cells(vals(nodes), { index: false, tone }) : `<span class="note mono">${pick(t('empty', 'ဗလာ'))}</span>`];

function draw(s, { lists }) {
  let merge = '';
  if (s.a) {
    const aName = s.view === 'one' ? 'merged' : `lists[${s.i}]`;
    const bName = s.view === 'one' ? `lists[${s.j}]` : `lists[${s.i + 1}]`;
    merge = stagePanel(pick(t('The merge in progress', 'လုပ်ဆောင်နေသော merge')), '',
      labelledRows([rowOf(aName, s.a, s.a.length ? { 0: 'inwin' } : {}), rowOf(bName, s.b, s.b.length ? { 0: 'inwin' } : {}),
        rowOf('out', s.out, s.out.length && s.line === 'take' ? { [s.out.length - 1]: 'entering' } : {})])) + stageGap;
  }
  let held;
  if (s.view === 'one') {
    const rows = [rowOf('merged', s.merged)];
    const waiting = s.waiting ?? [];
    for (const i of waiting) rows.push(rowOf(`lists[${i}]`, nodesOf(lists)[i]));
    held = stagePanel(pick(t('merged, and the lists still to fold in', 'merged နှင့် ပေါင်းရန်ကျန် list များ')), '', labelledRows(rows));
  } else {
    const rows = s.cur.map((l, i) => rowOf(`lists[${i}]`, l));
    s.paired.forEach((l, i) => rows.push(rowOf(`paired[${i}]`, l)));
    held = stagePanel(pick(t(`lists${s.round ? ` — round ${s.round}` : ''}`, `lists${s.round ? ` — အကြိမ် ${s.round}` : ''}`)), '', labelledRows(rows));
  }
  return merge + held + stageGap + readout({ [pick(t('nodes moved', 'ရွှေ့ပြီး node'))]: s.moves });
}

function answer(s, { lists }) {
  const total = lists.flat().length;
  const done = s.finished ? (s.view === 'one' ? s.merged : s.merged ?? []) : [];
  return {
    html: total ? slots(vals(done), { total }) : `<span class="slot">[]</span>`,
    note: s.finished ? t('the merged list', 'ပေါင်းပြီး list') : t('filled at the end', 'အဆုံးတွင် ဖြည့်'),
  };
}

function vars(s, { lists }) {
  const out = [['lists', fmtLists(lists)]];
  if (s.a) out.push(['a', arr(s.a)], ['b', arr(s.b)], ['dummy', `→ ${arr(s.out)}`], ['tail', s.out.length ? String(s.out.at(-1).v) : 'dummy']);
  if (s.view === 'one') {
    out.push(['merged', arr(s.merged)]);
    if (s.j != null) out.push(['head', arr(nodesOf(lists)[s.j])]);
  } else {
    if (s.i != null) out.push(['i', s.i], ['partner', s.i + 1 < s.cur.length ? arr(s.cur[s.i + 1]) : 'None']);
    out.push(['paired', `[${s.paired.map(arr).join(', ')}]`]);
  }
  return out;
}

/* ---------------- the code, one key per line ----------------
 *
 * Generated from the verified solution files, so the listing a reader copies
 * is byte-identical to the one that ran. */

const CODE = {
  one: {
    ruby: [
      [null, `${k('def')} merge_k_lists(lists)`],
      ['init', `  merged = ${k('nil')}`],
      [null, `  lists.each ${k('do')} |head|`],
      ['fold', `    merged = merge(merged, head)`],
      [null, `  ${k('end')}`],
      ['ret', `  merged`],
      [null, `${k('end')}`],
      [null, ``],
      [null, `${k('def')} merge(a, b)`],
      [null, `  dummy = tail = ListNode.new`],
      [null, `  ${k('while')} a &amp;&amp; b`],
      ['take', `    ${k('if')} a.val &lt;= b.val`],
      ['take', `      tail.next, a = a, a.next`],
      [null, `    ${k('else')}`],
      ['take', `      tail.next, b = b, b.next`],
      [null, `    ${k('end')}`],
      ['take', `    tail = tail.next`],
      [null, `  ${k('end')}`],
      ['rest', `  tail.next = a || b`],
      [null, `  dummy.next`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} mergeKLists(self, lists):`],
      ['init', `        merged = ${k('None')}`],
      [null, `        ${k('for')} head ${k('in')} lists:`],
      ['fold', `            merged = self.merge(merged, head)`],
      ['ret', `        ${k('return')} merged`],
      [null, ``],
      [null, `    ${k('def')} merge(self, a, b):`],
      [null, `        dummy = tail = ListNode()`],
      [null, `        ${k('while')} a and b:`],
      ['take', `            ${k('if')} a.val &lt;= b.val:`],
      ['take', `                tail.next, a = a, a.next`],
      [null, `            ${k('else')}:`],
      ['take', `                tail.next, b = b, b.next`],
      ['take', `            tail = tail.next`],
      ['rest', `        tail.next = a or b`],
      [null, `        ${k('return')} dummy.next`],
    ],
    javascript: [
      [null, `${k('const')} mergeKLists = ${k('function')} (lists) {`],
      ['init', `  ${k('let')} merged = ${k('null')};`],
      [null, `  ${k('for')} (${k('const')} head ${k('of')} lists) {`],
      ['fold', `    merged = merge(merged, head);`],
      [null, `  }`],
      ['ret', `  ${k('return')} merged;`],
      [null, `};`],
      [null, ``],
      [null, `${k('const')} merge = (a, b) =&gt; {`],
      [null, `  ${k('const')} dummy = ${k('new')} ListNode(0);`],
      [null, `  ${k('let')} tail = dummy;`],
      [null, `  ${k('while')} (a &amp;&amp; b) {`],
      ['take', `    ${k('if')} (a.val &lt;= b.val) { tail.next = a; a = a.next; }`],
      ['take', `    ${k('else')} { tail.next = b; b = b.next; }`],
      ['take', `    tail = tail.next;`],
      [null, `  }`],
      ['rest', `  tail.next = a || b;`],
      [null, `  ${k('return')} dummy.next;`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} mergeKLists(lists []*ListNode) *ListNode {`],
      ['init', `    ${k('var')} merged *ListNode`],
      [null, `    ${k('for')} _, head := ${k('range')} lists {`],
      ['fold', `        merged = merge(merged, head)`],
      [null, `    }`],
      ['ret', `    ${k('return')} merged`],
      [null, `}`],
      [null, ``],
      [null, `${k('func')} merge(a, b *ListNode) *ListNode {`],
      [null, `    dummy := &amp;ListNode{}`],
      [null, `    tail := dummy`],
      [null, `    ${k('for')} a != ${k('nil')} &amp;&amp; b != ${k('nil')} {`],
      ['take', `        ${k('if')} a.Val &lt;= b.Val {`],
      ['take', `            tail.Next, a = a, a.Next`],
      [null, `        } ${k('else')} {`],
      ['take', `            tail.Next, b = b, b.Next`],
      [null, `        }`],
      ['take', `        tail = tail.Next`],
      [null, `    }`],
      ['rest', `    ${k('if')} a != ${k('nil')} {`],
      ['rest', `        tail.Next = a`],
      [null, `    } ${k('else')} {`],
      ['rest', `        tail.Next = b`],
      [null, `    }`],
      [null, `    ${k('return')} dummy.Next`],
      [null, `}`],
    ],
    rust: [
      [null, `type List = Option&lt;Box&lt;ListNode&gt;&gt;;`],
      [null, ``],
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} merge_k_lists(lists: Vec&lt;List&gt;) -&gt; List {`],
      ['init', `        ${k('let')} ${k('mut')} merged = ${k('None')};`],
      [null, `        ${k('for')} head ${k('in')} lists {`],
      ['fold', `            merged = ${k('Self')}::merge(merged, head);`],
      [null, `        }`],
      ['ret', `        merged`],
      [null, `    }`],
      [null, ``],
      [null, `    ${k('fn')} merge(${k('mut')} a: List, ${k('mut')} b: List) -&gt; List {`],
      [null, `        ${k('let')} ${k('mut')} dummy = Box::new(ListNode::new(0));`],
      [null, `        ${k('let')} ${k('mut')} tail = &amp;${k('mut')} dummy;`],
      [null, `        ${k('while')} ${k('let')} (${k('Some')}(x), ${k('Some')}(y)) = (&amp;a, &amp;b) {`],
      ['take', `            ${k('let')} from = ${k('if')} x.val &lt;= y.val { &amp;${k('mut')} a } ${k('else')} { &amp;${k('mut')} b };`],
      ['take', `            ${k('let')} ${k('mut')} node = from.take().unwrap();`],
      ['take', `            *from = node.next.take();`],
      ['take', `            tail.next = ${k('Some')}(node);`],
      ['take', `            tail = tail.next.as_mut().unwrap();`],
      [null, `        }`],
      ['rest', `        tail.next = a.or(b);`],
      [null, `        dummy.next`],
      [null, `    }`],
      [null, `}`],
    ],
  },
  halves: {
    ruby: [
      [null, `${k('def')} merge_k_lists(lists)`],
      ['empty', `  ${k('return')} ${k('nil')} ${k('if')} lists.empty?`],
      ['round', `  ${k('while')} lists.length &gt; 1`],
      ['pair', `    lists = lists.each_slice(2).map { |a, b| merge(a, b) }`],
      [null, `  ${k('end')}`],
      ['ret', `  lists[0]`],
      [null, `${k('end')}`],
      [null, ``],
      [null, `${k('def')} merge(a, b)`],
      [null, `  dummy = tail = ListNode.new`],
      [null, `  ${k('while')} a &amp;&amp; b`],
      ['take', `    ${k('if')} a.val &lt;= b.val`],
      ['take', `      tail.next, a = a, a.next`],
      [null, `    ${k('else')}`],
      ['take', `      tail.next, b = b, b.next`],
      [null, `    ${k('end')}`],
      ['take', `    tail = tail.next`],
      [null, `  ${k('end')}`],
      ['rest', `  tail.next = a || b`],
      [null, `  dummy.next`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} mergeKLists(self, lists):`],
      ['empty', `        ${k('if')} ${k('not')} lists:`],
      ['empty', `            ${k('return')} ${k('None')}`],
      ['round', `        ${k('while')} len(lists) &gt; 1:`],
      [null, `            paired = []`],
      [null, `            ${k('for')} i ${k('in')} range(0, len(lists), 2):`],
      [null, `                partner = lists[i + 1] ${k('if')} i + 1 &lt; len(lists) ${k('else')} ${k('None')}`],
      ['pair', `                paired.append(self.merge(lists[i], partner))`],
      ['round', `            lists = paired`],
      ['ret', `        ${k('return')} lists[0]`],
      [null, ``],
      [null, `    ${k('def')} merge(self, a, b):`],
      [null, `        dummy = tail = ListNode()`],
      [null, `        ${k('while')} a and b:`],
      ['take', `            ${k('if')} a.val &lt;= b.val:`],
      ['take', `                tail.next, a = a, a.next`],
      [null, `            ${k('else')}:`],
      ['take', `                tail.next, b = b, b.next`],
      ['take', `            tail = tail.next`],
      ['rest', `        tail.next = a or b`],
      [null, `        ${k('return')} dummy.next`],
    ],
    javascript: [
      [null, `${k('const')} mergeKLists = ${k('function')} (lists) {`],
      ['empty', `  ${k('if')} (lists.length === 0) ${k('return')} ${k('null')};`],
      ['round', `  ${k('while')} (lists.length &gt; 1) {`],
      [null, `    ${k('const')} paired = [];`],
      ['pair', `    ${k('for')} (${k('let')} i = 0; i &lt; lists.length; i += 2) paired.push(merge(lists[i], lists[i + 1] ?? ${k('null')}));`],
      ['round', `    lists = paired;`],
      [null, `  }`],
      ['ret', `  ${k('return')} lists[0];`],
      [null, `};`],
      [null, ``],
      [null, `${k('const')} merge = (a, b) =&gt; {`],
      [null, `  ${k('const')} dummy = ${k('new')} ListNode(0);`],
      [null, `  ${k('let')} tail = dummy;`],
      [null, `  ${k('while')} (a &amp;&amp; b) {`],
      ['take', `    ${k('if')} (a.val &lt;= b.val) { tail.next = a; a = a.next; }`],
      ['take', `    ${k('else')} { tail.next = b; b = b.next; }`],
      ['take', `    tail = tail.next;`],
      [null, `  }`],
      ['rest', `  tail.next = a || b;`],
      [null, `  ${k('return')} dummy.next;`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} mergeKLists(lists []*ListNode) *ListNode {`],
      ['empty', `    ${k('if')} len(lists) == 0 {`],
      ['empty', `        ${k('return')} ${k('nil')}`],
      [null, `    }`],
      ['round', `    ${k('for')} len(lists) &gt; 1 {`],
      [null, `        paired := []*ListNode{}`],
      [null, `        ${k('for')} i := 0; i &lt; len(lists); i += 2 {`],
      [null, `            ${k('var')} partner *ListNode`],
      [null, `            ${k('if')} i+1 &lt; len(lists) {`],
      [null, `                partner = lists[i+1]`],
      [null, `            }`],
      ['pair', `            paired = append(paired, merge(lists[i], partner))`],
      [null, `        }`],
      ['round', `        lists = paired`],
      [null, `    }`],
      ['ret', `    ${k('return')} lists[0]`],
      [null, `}`],
      [null, ``],
      [null, `${k('func')} merge(a, b *ListNode) *ListNode {`],
      [null, `    dummy := &amp;ListNode{}`],
      [null, `    tail := dummy`],
      [null, `    ${k('for')} a != ${k('nil')} &amp;&amp; b != ${k('nil')} {`],
      ['take', `        ${k('if')} a.Val &lt;= b.Val {`],
      ['take', `            tail.Next, a = a, a.Next`],
      [null, `        } ${k('else')} {`],
      ['take', `            tail.Next, b = b, b.Next`],
      [null, `        }`],
      ['take', `        tail = tail.Next`],
      [null, `    }`],
      ['rest', `    ${k('if')} a != ${k('nil')} {`],
      ['rest', `        tail.Next = a`],
      [null, `    } ${k('else')} {`],
      ['rest', `        tail.Next = b`],
      [null, `    }`],
      [null, `    ${k('return')} dummy.Next`],
      [null, `}`],
    ],
    rust: [
      [null, `type List = Option&lt;Box&lt;ListNode&gt;&gt;;`],
      [null, ``],
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} merge_k_lists(${k('mut')} lists: Vec&lt;List&gt;) -&gt; List {`],
      ['empty', `        ${k('if')} lists.is_empty() {`],
      ['empty', `            ${k('return')} ${k('None')};`],
      [null, `        }`],
      ['round', `        ${k('while')} lists.len() &gt; 1 {`],
      [null, `            ${k('let')} ${k('mut')} paired = Vec::new();`],
      [null, `            ${k('let')} ${k('mut')} it = lists.into_iter();`],
      [null, `            ${k('while')} ${k('let')} ${k('Some')}(a) = it.next() {`],
      ['pair', `                paired.push(${k('Self')}::merge(a, it.next().flatten()));`],
      [null, `            }`],
      ['round', `            lists = paired;`],
      [null, `        }`],
      ['ret', `        lists.pop().unwrap()`],
      [null, `    }`],
      [null, ``],
      [null, `    ${k('fn')} merge(${k('mut')} a: List, ${k('mut')} b: List) -&gt; List {`],
      [null, `        ${k('let')} ${k('mut')} dummy = Box::new(ListNode::new(0));`],
      [null, `        ${k('let')} ${k('mut')} tail = &amp;${k('mut')} dummy;`],
      [null, `        ${k('while')} ${k('let')} (${k('Some')}(x), ${k('Some')}(y)) = (&amp;a, &amp;b) {`],
      ['take', `            ${k('let')} from = ${k('if')} x.val &lt;= y.val { &amp;${k('mut')} a } ${k('else')} { &amp;${k('mut')} b };`],
      ['take', `            ${k('let')} ${k('mut')} node = from.take().unwrap();`],
      ['take', `            *from = node.next.take();`],
      ['take', `            tail.next = ${k('Some')}(node);`],
      ['take', `            tail = tail.next.as_mut().unwrap();`],
      [null, `        }`],
      ['rest', `        tail.next = a.or(b);`],
      [null, `        dummy.next`],
      [null, `    }`],
      [null, `}`],
    ],
  },
};

/* ---------------- part 1: the "how often is a node moved" widget ----------------
 *
 * k lists of equal length, merged two ways. Folding them into one running
 * result moves the first list's nodes k − 1 times; merging in pairs moves
 * every node once per round, log₂ k rounds. The bars count the moves each
 * list's nodes make; drag k and watch one grow linearly and the other barely. */

const QW_SETS = [
  { label: t('k = 4', 'k = 4'), k: 4 },
  { label: t('k = 8', 'k = 8'), k: 8 },
  { label: t('k = 16', 'k = 16'), k: 16 },
];

function mountMovesWidget(host) {
  const state = { set: 1, k: 8 };
  const PER = 10;                  // nodes per list, in the widget's picture
  host.innerHTML = `
    <div class="mk-bars" data-bars></div>
    <div class="q-slider"><label for="mk-k">k</label><input id="mk-k" type="range" min="2" max="16" data-k><output data-out></output>
      <span class="q-presets" data-presets></span></div>
    <p class="q-tie" data-line></p>
    <div class="ledger">
      <span class="expr" data-expr></span>
      <span class="total" data-total></span>
    </div>`;
  const q = (sel) => host.querySelector(sel);

  function render() {
    const kk = state.k;
    // times list i's nodes are moved: folding — list 0 and 1 in every fold, list i from fold i on
    const fold = Array.from({ length: kk }, (_, i) => (i === 0 ? kk - 1 : kk - i));
    const rounds = Math.ceil(Math.log2(kk));
    const pairs = Array.from({ length: kk }, () => rounds);
    const total = (a) => a.reduce((x, y) => x + y, 0) * PER;
    const bar = (n, cls) => `<span class="mk-bar ${cls}"><span class="mk-fill mk-w${Math.min(n, 16)}"></span><span class="mk-n">${n}</span></span>`;
    q('[data-bars]').innerHTML = `<div class="mk-head"><span></span><span>${pick(t('one at a time', 'တစ်ခုချင်း'))}</span><span>${pick(t('in pairs', 'အတွဲလိုက်'))}</span></div>`
      + fold.map((n, i) => `<div class="mk-row"><span class="q-row-label">${i}</span>${bar(n, 'one')}${bar(pairs[i], 'two')}</div>`).join('');
    q('[data-k]').value = String(kk);
    q('[data-out]').textContent = String(kk);
    q('[data-presets]').innerHTML = presetChips(QW_SETS, QW_SETS.findIndex((x) => x.k === kk));
    widgetLabel(pick(t(`${PER} nodes per list`, `list တစ်ခုလျှင် node ${PER}`)));
    q('[data-line]').innerHTML = pick(t(`Folding moves list 0's nodes ${kk - 1} times — once per later list — and the newest list's once. In pairs, every node moves once per round, ${rounds} ${rounds === 1 ? 'round' : 'rounds'} for ${kk} lists.`,
      `တစ်ခုချင်း ပေါင်းခြင်းသည် list 0 ၏ node များကို ${kk - 1} ကြိမ် — နောက် list တစ်ခုလျှင် တစ်ကြိမ် — ရွှေ့ပြီး နောက်ဆုံး list ကို တစ်ကြိမ်သာ ရွှေ့သည်။ အတွဲလိုက်တွင် node တိုင်းသည် အကြိမ်တစ်ခုလျှင် တစ်ကြိမ် ရွေ့သည် — list ${kk} ခုအတွက် ${rounds} ကြိမ်။`));
    q('[data-expr]').innerHTML = `${pick(t('one at a time', 'တစ်ခုချင်း'))} ${total(fold)} &nbsp;·&nbsp; ${pick(t('in pairs', 'အတွဲလိုက်'))} ${total(pairs)}`;
    q('[data-total]').innerHTML = `${(total(fold) / total(pairs)).toFixed(1)}×<small>${pick(t('more moves', 'ရွှေ့ခြင်း ပိုများ'))}</small>`;
  }
  q('[data-k]').addEventListener('input', (ev) => { state.k = Number(ev.target.value); render(); });
  host.addEventListener('click', (ev) => {
    const chip = ev.target.closest('[data-set]');
    if (chip) { state.k = QW_SETS[Number(chip.dataset.set)].k; render(); }
  });
  onLangChange(render);
  render();
}

/* ---------------- the approach, in brief ---------------- */

const APPROACH = {
  one: {
    idea: t('Merge the lists into one running result, one at a time, with the two-list merge.', 'two-list merge ဖြင့် list များကို တစ်ခုချင်း ရလဒ်တစ်ခုထဲ ပေါင်းသည်။'),
    steps: [
      t('<code>merged</code> starts empty.', '<code>merged</code> သည် ဗလာဖြင့် စသည်။'),
      t('For each <code>head</code>: <code>merged = merge(merged, head)</code>.', '<code>head</code> တစ်ခုစီအတွက် — <code>merged = merge(merged, head)</code>။'),
      t('<code>merge</code> takes the smaller head until one side is empty, then attaches the rest.', '<code>merge</code> သည် တစ်ဖက် ဗလာ ဖြစ်သည်အထိ ငယ်သော ခေါင်းကို ယူပြီး ကျန်သည်ကို ချိတ်သည်။'),
    ],
    cost: t('The first list is walked again in every one of the k − 1 merges after it: O(k · N) for N nodes in all.', 'ပထမ list ကို ၎င်းနောက်ရှိ merge k − 1 ခုတိုင်းတွင် ထပ်လျှောက်သည် — node စုစုပေါင်း N ခုအတွက် O(k · N)။'),
  },
  halves: {
    idea: t('Merge the lists in pairs, then the results in pairs, until one is left — like the rounds of a knockout tournament.', 'list များကို အတွဲလိုက် ပေါင်း၊ ပြီးမှ ရလဒ်များကို အတွဲလိုက် — တစ်ခုကျန်သည်အထိ — knockout ပြိုင်ပွဲ အကြိမ်များကဲ့သို့။'),
    steps: [
      t('No lists: return an empty list.', 'list မရှိလျှင် — list ဗလာ ပြန်သည်။'),
      t('While more than one list is left: merge <code>lists[0]</code> with <code>lists[1]</code>, <code>lists[2]</code> with <code>lists[3]</code>, …; an odd one out merges with nothing.',
        'list တစ်ခုထက် ပိုကျန်နေသမျှ — <code>lists[0]</code> ကို <code>lists[1]</code> နှင့်၊ <code>lists[2]</code> ကို <code>lists[3]</code> နှင့် … ပေါင်း — အပိုတစ်ခုသည် ဘာမှမပါသည်နှင့် ပေါင်းသည်။'),
      t('Return the one list left.', 'ကျန်သော list တစ်ခုကို ပြန်ပေးသည်။'),
    ],
    cost: t('Each round moves every node at most once and halves the number of lists: O(N log k).', 'အကြိမ်တိုင်း node တိုင်းကို အများဆုံး တစ်ကြိမ် ရွှေ့ပြီး list အရေအတွက်ကို ထက်ဝက် လျှော့သည် — O(N log k)။'),
  },
};

/* ---------------- mount ---------------- */

const EX1 = [[1, 4, 5], [1, 3, 4], [2, 6]];

mountLesson({
  input: { lists: EX1 },
  controls: [
    { key: 'lists', label: 'lists', value: fmtLists(EX1), parse: parseLists, format: fmtLists },
  ],
  presets: [
    { label: exampleTitle(1), input: { lists: EX1 } },
    { label: exampleTitle(2), input: { lists: [] } },
    { label: exampleTitle(3), input: { lists: [[]] } },
    { label: t('five short lists', 'တိုသော list ငါးခု'), input: { lists: [[1, 9], [2, 8], [3, 7], [4, 6], [5]] } },
  ],
  examples: [
    { title: exampleTitle(1), inputHtml: '<code>lists = [[1,4,5],[1,3,4],[2,6]]</code>', output: '[1,1,2,3,4,4,5,6]',
      why: [t('All eight values, in one sorted list.', 'value ရှစ်ခုလုံး၊ စီထားသော list တစ်ခုတည်းတွင်။')], load: { lists: EX1 } },
    { title: exampleTitle(2), inputHtml: '<code>lists = []</code>', output: '[]',
      why: [t('No lists: nothing to merge.', 'list မရှိ — ပေါင်းစရာ မရှိ။')], load: { lists: [] } },
    { title: exampleTitle(3), inputHtml: '<code>lists = [[]]</code>', output: '[]',
      why: [t('One list, and it is empty.', 'list တစ်ခု၊ ၎င်းလည်း ဗလာ။')], load: { lists: [[]] } },
  ],
  modes: [
    { id: 'one', name: 'One at a time',
      desc: t('Fold every list into one running result.', 'list တိုင်းကို ရလဒ်တစ်ခုထဲ ပေါင်းထည့်။'),
      cost: 'O(k · N) time · O(1) extra', build: buildOne },
    { id: 'halves', name: 'Merge in pairs',
      sub: t('divide and conquer', 'divide and conquer'),
      desc: t('Pair the lists up, round after round, until one is left.', 'list များကို အကြိမ်ကြိမ် အတွဲလိုက် ပေါင်း — တစ်ခုကျန်သည်အထိ။'),
      cost: 'O(N log k) time · O(k) extra', build: buildHalves },
  ],
  languages: LANGUAGES,
  code: CODE,
  solutions: {
    one: { approach: APPROACH.one,
      desc: t('Correct and short, reusing Merge Two Sorted Lists — but the running result is walked again for every list, so its cost grows with k.', 'မှန်ပြီး တိုသည်၊ Merge Two Sorted Lists ကို ပြန်သုံးသည် — သို့သော် ရလဒ်ကို list တိုင်းအတွက် ထပ်လျှောက်သဖြင့် ကုန်ကျမှုသည် k နှင့်အတူ ကြီးလာသည်။') },
    halves: { approach: APPROACH.halves,
      desc: t('The same merge, in a better order: log₂ k rounds instead of k merges into one growing list. A min-heap of the k heads gets the same O(N log k) — see the notes.',
              'merge အတူတူ၊ ပိုကောင်းသော အစီအစဉ်ဖြင့် — ကြီးလာသော list တစ်ခုထဲ merge k ကြိမ်အစား log₂ k အကြိမ်။ ခေါင်း k ခု၏ min-heap သည်လည်း O(N log k) ရသည် — မှတ်ချက်များကို ကြည့်ပါ။') },
  },
  // How each language was actually checked, printed as the part 3 badges.
  // The corpus: the 3 examples, 6 edges, 15,000 random inputs of up to 6
  // short lists, 5,000 of up to 60 lists up to 20 long, and five of 10⁴
  // nodes — against concatenate-and-sort. Merging one at a time skips the
  // three with 10⁴ lists. Go and Rust ran in Docker (golang:1.23-alpine,
  // rust:1-slim).
  verification: {
    ruby: { one: 'ran here · 20,011 cases, not the three with 10⁴ lists', halves: 'ran here · 20,014 cases' },
    python: { one: 'ran here · 20,011 cases, not the three with 10⁴ lists', halves: 'ran here · 20,014 cases' },
    javascript: { one: 'ran here · 20,011 cases, not the three with 10⁴ lists', halves: 'ran here · 20,014 cases' },
    go: { one: 'ran here · 20,011 cases, not the three with 10⁴ lists · Go 1.23', halves: 'ran here · 20,014 cases · Go 1.23' },
    rust: { one: 'ran here · 20,011 cases, not the three with 10⁴ lists · rustc 1.98', halves: 'ran here · 20,014 cases · rustc 1.98' },
  },
  stripLabel: t('The lists, as given', 'ပေးထားသော list များ'),
  strip,
  draw,
  answer,
  vars,
  widget: mountMovesWidget,
});
