/* Merge Two Sorted Lists — LeetCode 21.
 *
 * The contrast worth seeing: both approaches make exactly the same sequence of
 * decisions — at every point, take whichever front node is smaller — and differ
 * only in who holds the half-built answer. The loop holds it in a `tail`
 * pointer hanging off a dummy node. The recursion holds it in the call stack,
 * and does not link anything until the calls start returning.
 */
import { t, plural, exampleTitle, LANGUAGES, k, labelledRows, intList, presetChips, widgetLabel, stageEmpty } from '../../lib/kit.js';
import { mountLesson } from '../../lib/stepper.js';
import { pick, onLangChange } from '../../lib/i18n.js';
import { cells, chain, stack, panels, slots, stagePanel } from '../../lib/stage.js';


/* The problem guarantees sorted inputs, and an unsorted one would produce a
 * merge that is quietly wrong rather than obviously wrong. Refuse it instead. */
function guard(list1, list2) {
  for (const [name, xs] of [['list1', list1], ['list2', list2]]) {
    for (let i = 1; i < xs.length; i++) {
      if (xs[i] < xs[i - 1]) throw new Error(`${name} is not sorted (${xs[i - 1]} sits before ${xs[i]})`);
    }
  }
}

/* ---------------- step generators ---------------- */

function buildIterative({ list1, list2 }) {
  guard(list1, list2);
  const steps = [];
  const out = [];
  let ai = 0;            // how much of list1 has been spliced on
  let bi = 0;            // ditto list2
  let tailAt = null;     // index in `out` that tail points at; null = the dummy

  // Every snapshot copies `out`. Sharing the live array would make all frames
  // render whatever the last one ended up holding.
  const snap = (extra) => ({ ai, bi, tailAt, out: out.slice(), dummy: true, ...extra });

  steps.push(snap({ line: 'dummy', tag: t('sentinel', 'sentinel'),
    note: t('Start with a node that holds nothing and will never be returned. Its only job is to give the result a <b>last node</b> before the result has any nodes.',
            'ဘာမျှ မကိုင်ထားသော၊ ဘယ်တော့မှ ပြန်မပေးမည့် node တစ်ခုဖြင့် စသည်။ ၎င်း၏ တစ်ခုတည်းသော တာဝန်မှာ ရလဒ်တွင် node တစ်ခုမျှ မရှိသေးခင်ကပင် <b>နောက်ဆုံး node</b> တစ်ခု ရှိစေရန် ဖြစ်သည်။') }));
  steps.push(snap({ line: 'tail',
    note: t('<b>tail</b> always points at the last node of the result. Right now that is the dummy, which is the point: there is no "is this the first node?" case to write.',
            '<b>tail</b> သည် ရလဒ်၏ နောက်ဆုံး node ကို အမြဲ ညွှန်သည်။ ယခု ၎င်းမှာ dummy ဖြစ်သည် — ထိုအချက်ပင် အဓိကဖြစ်သည်၊ "ဤသည် ပထမ node လား" ဆိုသော case ကို ရေးစရာ မလိုတော့ပါ။') }));

  while (ai < list1.length && bi < list2.length) {
    steps.push(snap({ line: 'loop', tag: t('both alive', 'နှစ်ခုလုံး ကျန်'),
      note: t('Both lists still have a node, so there is a real choice to make.',
              'list နှစ်ခုလုံးတွင် node ကျန်သေးသဖြင့် တကယ် ရွေးရမည့်အရာ ရှိသည်။') }));
    steps.push(snap({ line: 'cmp', cmp: true, tag: t('compare', 'နှိုင်းယှဉ်'),
      note: t(`Front of list1 is <b>${list1[ai]}</b>, front of list2 is <b>${list2[bi]}</b>. Only the two fronts matter — everything behind them is larger by assumption.`,
              `list1 ၏ ရှေ့ဆုံးမှာ <b>${list1[ai]}</b>၊ list2 ၏ ရှေ့ဆုံးမှာ <b>${list2[bi]}</b> ဖြစ်သည်။ ရှေ့ဆုံး နှစ်ခုသာ အရေးပါသည် — ၎င်းတို့နောက်ရှိ အားလုံးသည် sort လုပ်ထားသဖြင့် ပိုကြီးသည်။`) }));

    if (list1[ai] <= list2[bi]) {
      const note = t(`${list1[ai]} &le; ${list2[bi]}, so list1's node goes next. No node is created: <b>tail.next</b> is re-pointed at a node that already exists, and list1 steps forward.`,
                     `${list1[ai]} &le; ${list2[bi]} ဖြစ်သဖြင့် list1 ၏ node နောက်မှ လာသည်။ node အသစ် မဖန်တီးပါ — <b>tail.next</b> ကို ရှိပြီးသား node သို့ ပြန်ညွှန်ပြီး list1 တစ်လှမ်း ရှေ့တိုးသည်။`);
      out.push(list1[ai]);
      ai++;
      steps.push(snap({ line: 'take1', hot: out.length - 1, took: 1, tag: t('take list1', 'list1 မှ ယူ'), note }));
    } else {
      const note = t(`${list2[bi]} &lt; ${list1[ai]}, so list2's node goes next. Same splice, other side.`,
                     `${list2[bi]} &lt; ${list1[ai]} ဖြစ်သဖြင့် list2 ၏ node နောက်မှ လာသည်။ ချိတ်ပုံ အတူတူ၊ တစ်ဖက်တည်း ပြောင်းသွားသည်။`);
      out.push(list2[bi]);
      bi++;
      steps.push(snap({ line: 'take2', hot: out.length - 1, took: 2, tag: t('take list2', 'list2 မှ ယူ'), note }));
    }

    tailAt = out.length - 1;
    steps.push(snap({ line: 'advance', hot: out.length - 1,
      note: t('tail moves onto the node just appended, so the next append is again "write to tail.next".',
              'tail သည် ထည့်ပြီးခါစ node ပေါ်သို့ ရွှေ့သဖြင့် နောက်တစ်ကြိမ် ထည့်ခြင်းသည်လည်း "tail.next သို့ ရေးခြင်း" ပင် ဖြစ်သည်။') }));
  }

  const empty = ai >= list1.length ? 'list1' : 'list2';
  steps.push(snap({ line: 'loop', tag: t('one empty', 'တစ်ခု ကုန်'),
    note: t(`<b>${empty}</b> has no nodes left, so the loop condition fails and the comparing is over.`,
            `<b>${empty}</b> တွင် node မကျန်တော့သဖြင့် loop အခြေအနေ မမှန်တော့ဘဲ နှိုင်းယှဉ်ခြင်း ပြီးဆုံးသည်။`) }));

  let rest = [];
  let restFrom = null;
  if (ai < list1.length) { rest = list1.slice(ai); restFrom = 'list1'; ai = list1.length; }
  else if (bi < list2.length) { rest = list2.slice(bi); restFrom = 'list2'; bi = list2.length; }
  const hotFrom = out.length;
  out.push(...rest);
  if (rest.length) tailAt = out.length - 1;
  steps.push(snap({ line: 'rest', hotFrom, tag: t('splice the tail', 'ကျန်တာ ချိတ်'),
    note: rest.length
      ? t(`Everything left in <b>${restFrom}</b> is already sorted and is at least as large as everything merged so far, so the remaining ${rest.length === 1 ? 'node attaches' : `${rest.length} nodes attach`} with a single pointer write. No loop needed.`,
          `<b>${restFrom}</b> တွင် ကျန်သမျှသည် sort လုပ်ပြီးသားဖြစ်ပြီး ယခုထိ ပေါင်းပြီးသမျှထက် မငယ်သဖြင့် ကျန် node ${rest.length} ခုကို pointer တစ်ခါ ရေးရုံဖြင့် ချိတ်နိုင်သည်။ loop မလိုပါ။`)
      : t('Both lists are exhausted, so there is nothing to attach and tail.next stays null.',
          'list နှစ်ခုလုံး ကုန်သွားပြီဖြစ်၍ ချိတ်စရာ မရှိဘဲ tail.next သည် null အတိုင်း ရှိနေသည်။') }));

  steps.push(snap({ line: 'ret', hotFrom: 0, done: true, tag: t('return', 'return'),
    note: t(`Return <b>dummy.next</b>, not dummy — the sentinel was scaffolding. The merged list is [${out.join(', ')}].`,
            `dummy ကို မဟုတ်ဘဲ <b>dummy.next</b> ကို ပြန်ပေးသည် — sentinel သည် ယာယီ ငြမ်းသာ ဖြစ်သည်။ ပေါင်းပြီးသော list မှာ [${out.join(', ')}] ဖြစ်သည်။`) }));

  return steps;
}

function buildRecursive({ list1, list2 }) {
  guard(list1, list2);
  const steps = [];
  const out = [];
  const frames = [];     // one per node chosen on the way down
  let ai = 0;
  let bi = 0;
  let depth = 0;

  // `open` is how many calls are live on the stack at this frame.
  const snap = (extra) => ({ ai, bi, depth, open: depth + 1, out: out.slice(), ...extra });

  for (;;) {
    if (ai >= list1.length) {
      const rest = list2.slice(bi);
      const hotFrom = out.length;
      out.push(...rest);
      bi = list2.length;
      steps.push(snap({ line: 'base1', hotFrom, tag: t('base case', 'base case'),
        note: rest.length
          ? t(`Depth ${depth}: list1 is empty. There is nothing left to compare, so the answer to this call is list2 exactly as it stands — ${plural(rest.length, 'node')}, returned without touching a single pointer.`,
              `အနက် ${depth} — list1 ဗလာ ဖြစ်သည်။ နှိုင်းယှဉ်စရာ မကျန်တော့သဖြင့် ဤ call ၏ အဖြေမှာ list2 ရှိသည့်အတိုင်း — node ${rest.length} ခု — pointer တစ်ခုမျှ မထိဘဲ ပြန်ပေးသည်။`)
          : t(`Depth ${depth}: both lists are empty. This call returns null, and that null becomes the end of the merged list.`,
              `အနက် ${depth} — list နှစ်ခုလုံး ဗလာ ဖြစ်သည်။ ဤ call က null ပြန်ပေးပြီး ထို null သည် ပေါင်းပြီး list ၏ အဆုံး ဖြစ်လာသည်။`) }));
      break;
    }
    steps.push(snap({ line: 'base1',
      note: t(`Depth ${depth}: list1 still has a node, so this is not the empty case.`,
              `အနက် ${depth} — list1 တွင် node ရှိသေးသဖြင့် ဗလာ case မဟုတ်ပါ။`) }));

    if (bi >= list2.length) {
      const rest = list1.slice(ai);
      const hotFrom = out.length;
      out.push(...rest);
      ai = list1.length;
      steps.push(snap({ line: 'base2', hotFrom, tag: t('base case', 'base case'),
        note: t(`Depth ${depth}: list2 is empty, so the rest of list1 is already the answer to this call — ${plural(rest.length, 'node')}, returned whole and untouched.`,
                `အနက် ${depth} — list2 ဗလာ ဖြစ်သဖြင့် list1 ၏ ကျန်အပိုင်းသည် ဤ call ၏ အဖြေ ဖြစ်ပြီးသား — node ${rest.length} ခု၊ မထိဘဲ တစ်ခုလုံး ပြန်ပေးသည်။`) }));
      break;
    }
    steps.push(snap({ line: 'base2',
      note: t(`Depth ${depth}: list2 still has a node too, so both base cases fall through.`,
              `အနက် ${depth} — list2 တွင်လည်း node ရှိသေးသဖြင့် base case နှစ်ခုလုံး ကျော်သွားသည်။`) }));

    steps.push(snap({ line: 'cmp', cmp: true, tag: t('compare', 'နှိုင်းယှဉ်'),
      note: t(`Comparing <b>${list1[ai]}</b> against <b>${list2[bi]}</b> — the same comparison the loop makes, just one stack frame deeper.`,
              `<b>${list1[ai]}</b> နှင့် <b>${list2[bi]}</b> ကို နှိုင်းယှဉ်သည် — loop လုပ်သည့် နှိုင်းယှဉ်မှု အတူတူ၊ stack frame တစ်ဆင့် ပိုနက်ရုံသာ။`) }));

    if (list1[ai] <= list2[bi]) {
      const note = t(`${list1[ai]} &le; ${list2[bi]}, so list1's node is the head of this call's answer. What follows it is "the merge of everything else", which is what the recursive call is asked for.`,
                     `${list1[ai]} &le; ${list2[bi]} ဖြစ်သဖြင့် list1 ၏ node သည် ဤ call ၏ အဖြေ၏ head ဖြစ်သည်။ ၎င်းနောက်မှ လာမည်မှာ "ကျန်သမျှကို ပေါင်းခြင်း" ဖြစ်ပြီး recursive call ကို တောင်းဆိုသည်မှာ ထိုအရာပင်။`);
      frames.push({ depth, from: 1, value: list1[ai], h1: list1[ai], h2: list2[bi] });
      out.push(list1[ai]);
      ai++;
      steps.push(snap({ line: 'rec1', hot: out.length - 1, took: 1, tag: t('head is list1', 'head = list1'), note }));
    } else {
      const note = t(`${list2[bi]} &lt; ${list1[ai]}, so list2's node is the head of this call's answer, and the call below is handed the remainder.`,
                     `${list2[bi]} &lt; ${list1[ai]} ဖြစ်သဖြင့် list2 ၏ node သည် ဤ call ၏ အဖြေ၏ head ဖြစ်ပြီး အောက်ရှိ call ကို ကျန်အပိုင်းကို လွှဲပေးသည်။`);
      frames.push({ depth, from: 2, value: list2[bi], h1: list1[ai], h2: list2[bi] });
      out.push(list2[bi]);
      bi++;
      steps.push(snap({ line: 'rec2', hot: out.length - 1, took: 2, tag: t('head is list2', 'head = list2'), note }));
    }
    depth++;
  }

  // Unwinding. Going down chose the order; coming back up is where the .next
  // assignments actually happen, one per frame, back to front.
  for (let d = frames.length - 1; d >= 0; d--) {
    const f = frames[d];
    depth = f.depth;
    const size = out.length - d;
    steps.push({ ai, bi, depth, open: d + 1, out: out.slice(), line: f.from === 1 ? 'ret1' : 'ret2',
      hotFrom: d, at: d, h1: f.h1, h2: f.h2, tag: t(`return depth ${f.depth}`, `အနက် ${f.depth} ပြန်`),
      note: t(`Depth ${f.depth} gets its answer back and writes it into <b>${f.from === 1 ? 'list1' : 'list2'}.next</b>, then returns <b>${f.value}</b> — now the head of a sorted run of ${plural(size, 'node')}.`,
              `အနက် ${f.depth} က ၎င်း၏ အဖြေကို ပြန်ရပြီး <b>${f.from === 1 ? 'list1' : 'list2'}.next</b> ထဲ ရေးကာ <b>${f.value}</b> ကို ပြန်ပေးသည် — ယခု node ${size} ခုပါ sort လုပ်ပြီး run ၏ head ဖြစ်သည်။`) });
  }

  steps.push({ ai, bi, depth: 0, open: 0, out: out.slice(), line: frames.length === 0 ? 'base1' : (frames[0].from === 1 ? 'ret1' : 'ret2'),
    hotFrom: 0, done: true, tag: t('done', 'ပြီး'),
    note: out.length === 0
      ? t('Both lists were empty, so the first call returned null and there was no recursion at all.',
          'list နှစ်ခုလုံး ဗလာ ဖြစ်ခဲ့သဖြင့် ပထမ call က null ပြန်ပေးပြီး recursion လုံးဝ မဖြစ်ခဲ့ပါ။')
      : t(`[${out.join(', ')}] — and not one node was allocated to build it. These are the original nodes with their <b>next</b> fields rewritten. What the loop kept in a dummy and a tail pointer, the recursion kept in the call stack instead.`,
          `[${out.join(', ')}] — ၎င်းကို တည်ဆောက်ရန် node တစ်ခုမျှ အသစ် မယူခဲ့ပါ။ မူလ node များ၏ <b>next</b> field များကို ပြန်ရေးထားခြင်းသာ ဖြစ်သည်။ loop က dummy နှင့် tail pointer ထဲ ထားခဲ့သည့်အရာကို recursion က call stack ထဲ ထားခဲ့သည်။`) });

  return steps;
}

/* ---------------- drawing ----------------
 *
 * The strip card holds the two inputs as two rows, with what has been spliced
 * off faded and the two fronts lit. The stage holds what the approach carries:
 * the merged chain — with the dummy in front and the tail pointer on it for
 * the loop, and with the call stack beside it for the recursion.
 */

function row(name, xs, used, s, which) {
  const tone = {};
  const marks = {};
  for (let j = 0; j < Math.min(used, xs.length); j++) tone[j] = 'done';
  if (s.took === which) { tone[used - 1] = 'entering'; }
  if (used < xs.length && !s.done) {
    if (tone[used] == null) tone[used] = s.cmp ? 'inwin' : undefined;
    marks[used] = name;
  }
  return [name, xs.length ? cells(xs, { tone, marks }) : '<span class="note mono">[]</span>'];
}

function strip(s, { list1, list2 }) {
  // A node that was just taken is one step behind the front counter.
  return labelledRows([row('list1', list1, s.ai, s, 1), row('list2', list2, s.bi, s, 2)]);
}

function draw(s) {
  const off = s.dummy ? 1 : 0;
  const nodes = s.dummy ? ['·', ...s.out] : s.out;
  const tone = {};
  const marks = {};
  if (s.dummy) { tone[0] = 'done'; marks[0] = 'dummy'; }
  const from = s.hotFrom != null ? s.hotFrom : s.hot;
  if (from != null) for (let i = from; i < s.out.length; i++) tone[i + off] = 'up';
  if (s.tailAt !== undefined && !s.done) {
    const k = s.tailAt == null ? 0 : s.tailAt + off;
    marks[k] = marks[k] ? `${marks[k]} · tail` : 'tail';
  }
  const hot = s.hot != null ? s.hot : s.at;
  const merged = nodes.length
    ? chain(nodes, { at: hot != null ? hot + off : null, marks, tone })
    : stageEmpty('null');

  if (s.dummy) {
    return stagePanel(pick(t('merged — the dummy in front', 'merged — ရှေ့တွင် dummy')),
      pick(t(`${s.out.length} spliced`, `${s.out.length} ခု ချိတ်ပြီး`)), merged);
  }
  // One frame per live call: the ones that already chose a head, then the one
  // currently running.
  const frames = [];
  for (let k = 0; k < s.open; k++) {
    const chosen = s.at != null || k < s.depth || (s.took && k === s.depth);
    frames.push(chosen && k < s.out.length ? `${s.out[k]} → merge(…)` : 'merge(list1, list2)');
  }
  return stagePanel(pick(s.at != null || s.done
      ? t('merged, and the calls still waiting', 'merged နှင့် စောင့်နေဆဲ call များ')
      : t('the order chosen so far — linked on the way back up', 'ယခုထိ ရွေးထားသော အစီအစဉ် — ပြန်တက်လာမှ ချိတ်မည်')),
    pick(t(`${s.open} on the stack`, `stack ပေါ်တွင် ${s.open} ခု`)),
    panels(merged, stack(frames, { label: 'call stack' })));
}

function answer(s) {
  if (!s.done) return { html: '', note: t('head of the merged list', 'ပေါင်းပြီး list ၏ head') };
  return {
    html: s.out.length ? slots(s.out, { total: s.out.length }) : '<span class="note mono">[]</span>',
    note: t('the merged list', 'ပေါင်းပြီး list'),
  };
}

function vars(s, input) {
  const h1 = s.ai < input.list1.length ? input.list1[s.ai] : 'null';
  const h2 = s.bi < input.list2.length ? input.list2[s.bi] : 'null';
  if (s.tailAt !== undefined) {
    return [['list1', h1], ['list2', h2], ['tail', s.tailAt == null ? 'dummy' : s.out[s.tailAt]],
            ['dummy', '0 (never returned)']];
  }
  // On the way back up, each frame still holds the two heads it was called with.
  if (s.h1 !== undefined) return [['list1', s.h1], ['list2', s.h2]];
  return [['list1', h1], ['list2', h2]];
}

/* ---------------- the code, one key per line ---------------- */


const CODE = {
  iterative: {
    ruby: [
      [null, `${k('def')} merge_two_lists(list1, list2)`],
      ['dummy', `  dummy = ListNode.new(0)`],
      ['tail', `  tail = dummy`],
      ['loop', `  ${k('while')} list1 &amp;&amp; list2`],
      ['cmp', `    ${k('if')} list1.val &lt;= list2.val`],
      ['take1', `      tail.next = list1`],
      ['take1', `      list1 = list1.next`],
      [null, `    ${k('else')}`],
      ['take2', `      tail.next = list2`],
      ['take2', `      list2 = list2.next`],
      [null, `    ${k('end')}`],
      ['advance', `    tail = tail.next`],
      [null, `  ${k('end')}`],
      ['rest', `  tail.next = list1 || list2`],
      ['ret', `  dummy.next`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} mergeTwoLists(self, list1, list2):`],
      ['dummy', `        dummy = ListNode(0)`],
      ['tail', `        tail = dummy`],
      ['loop', `        ${k('while')} list1 ${k('and')} list2:`],
      ['cmp', `            ${k('if')} list1.val &lt;= list2.val:`],
      ['take1', `                tail.next = list1`],
      ['take1', `                list1 = list1.next`],
      [null, `            ${k('else')}:`],
      ['take2', `                tail.next = list2`],
      ['take2', `                list2 = list2.next`],
      ['advance', `            tail = tail.next`],
      ['rest', `        tail.next = list1 ${k('or')} list2`],
      ['ret', `        ${k('return')} dummy.next`],
    ],
    javascript: [
      [null, `${k('var')} mergeTwoLists = ${k('function')} (list1, list2) {`],
      ['dummy', `  ${k('const')} dummy = ${k('new')} ListNode(0);`],
      ['tail', `  ${k('let')} tail = dummy;`],
      ['loop', `  ${k('while')} (list1 !== ${k('null')} &amp;&amp; list2 !== ${k('null')}) {`],
      ['cmp', `    ${k('if')} (list1.val &lt;= list2.val) {`],
      ['take1', `      tail.next = list1;`],
      ['take1', `      list1 = list1.next;`],
      [null, `    } ${k('else')} {`],
      ['take2', `      tail.next = list2;`],
      ['take2', `      list2 = list2.next;`],
      [null, `    }`],
      ['advance', `    tail = tail.next;`],
      [null, `  }`],
      ['rest', `  tail.next = list1 !== ${k('null')} ? list1 : list2;`],
      ['ret', `  ${k('return')} dummy.next;`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} mergeTwoLists(list1 *ListNode, list2 *ListNode) *ListNode {`],
      ['dummy', `    dummy := &amp;ListNode{}`],
      ['tail', `    tail := dummy`],
      ['loop', `    ${k('for')} list1 != ${k('nil')} &amp;&amp; list2 != ${k('nil')} {`],
      ['cmp', `        ${k('if')} list1.Val &lt;= list2.Val {`],
      ['take1', `            tail.Next = list1`],
      ['take1', `            list1 = list1.Next`],
      [null, `        } ${k('else')} {`],
      ['take2', `            tail.Next = list2`],
      ['take2', `            list2 = list2.Next`],
      [null, `        }`],
      ['advance', `        tail = tail.Next`],
      [null, `    }`],
      ['rest', `    ${k('if')} list1 != ${k('nil')} {`],
      [null, `        tail.Next = list1`],
      [null, `    } ${k('else')} {`],
      [null, `        tail.Next = list2`],
      [null, `    }`],
      ['ret', `    ${k('return')} dummy.Next`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} merge_two_lists(`],
      [null, `        ${k('mut')} list1: Option&lt;Box&lt;ListNode&gt;&gt;,`],
      [null, `        ${k('mut')} list2: Option&lt;Box&lt;ListNode&gt;&gt;,`],
      [null, `    ) -&gt; Option&lt;Box&lt;ListNode&gt;&gt; {`],
      ['dummy', `        ${k('let')} ${k('mut')} dummy = Box::new(ListNode::new(0));`],
      ['tail', `        ${k('let')} ${k('mut')} tail = &amp;${k('mut')} dummy;`],
      ['loop', `        ${k('while')} list1.is_some() &amp;&amp; list2.is_some() {`],
      ['cmp', `            ${k('let')} take_first = list1.as_ref().unwrap().val &lt;= list2.as_ref().unwrap().val;`],
      [null, `            ${k('let')} node = ${k('if')} take_first {`],
      ['take1', `                ${k('let')} ${k('mut')} n = list1.take().unwrap();`],
      ['take1', `                list1 = n.next.take();`],
      [null, `                n`],
      [null, `            } ${k('else')} {`],
      ['take2', `                ${k('let')} ${k('mut')} n = list2.take().unwrap();`],
      ['take2', `                list2 = n.next.take();`],
      [null, `                n`],
      [null, `            };`],
      ['advance', `            tail.next = Some(node);`],
      ['advance', `            tail = tail.next.as_mut().unwrap();`],
      [null, `        }`],
      ['rest', `        tail.next = ${k('if')} list1.is_some() { list1 } ${k('else')} { list2 };`],
      ['ret', `        dummy.next`],
      [null, `    }`],
      [null, `}`],
    ],
  },
  recursive: {
    ruby: [
      [null, `${k('def')} merge_two_lists(list1, list2)`],
      ['base1', `  ${k('return')} list2 ${k('if')} list1.nil?`],
      ['base2', `  ${k('return')} list1 ${k('if')} list2.nil?`],
      ['cmp', `  ${k('if')} list1.val &lt;= list2.val`],
      ['rec1', `    list1.next = merge_two_lists(list1.next, list2)`],
      ['ret1', `    list1`],
      [null, `  ${k('else')}`],
      ['rec2', `    list2.next = merge_two_lists(list1, list2.next)`],
      ['ret2', `    list2`],
      [null, `  ${k('end')}`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} mergeTwoLists(self, list1, list2):`],
      ['base1', `        ${k('if')} list1 ${k('is')} ${k('None')}:`],
      ['base1', `            ${k('return')} list2`],
      ['base2', `        ${k('if')} list2 ${k('is')} ${k('None')}:`],
      ['base2', `            ${k('return')} list1`],
      ['cmp', `        ${k('if')} list1.val &lt;= list2.val:`],
      ['rec1', `            list1.next = self.mergeTwoLists(list1.next, list2)`],
      ['ret1', `            ${k('return')} list1`],
      ['rec2', `        list2.next = self.mergeTwoLists(list1, list2.next)`],
      ['ret2', `        ${k('return')} list2`],
    ],
    javascript: [
      [null, `${k('var')} mergeTwoLists = ${k('function')} (list1, list2) {`],
      ['base1', `  ${k('if')} (list1 === ${k('null')}) ${k('return')} list2;`],
      ['base2', `  ${k('if')} (list2 === ${k('null')}) ${k('return')} list1;`],
      ['cmp', `  ${k('if')} (list1.val &lt;= list2.val) {`],
      ['rec1', `    list1.next = mergeTwoLists(list1.next, list2);`],
      ['ret1', `    ${k('return')} list1;`],
      [null, `  }`],
      ['rec2', `  list2.next = mergeTwoLists(list1, list2.next);`],
      ['ret2', `  ${k('return')} list2;`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} mergeTwoLists(list1 *ListNode, list2 *ListNode) *ListNode {`],
      ['base1', `    ${k('if')} list1 == ${k('nil')} {`],
      ['base1', `        ${k('return')} list2`],
      [null, `    }`],
      ['base2', `    ${k('if')} list2 == ${k('nil')} {`],
      ['base2', `        ${k('return')} list1`],
      [null, `    }`],
      ['cmp', `    ${k('if')} list1.Val &lt;= list2.Val {`],
      ['rec1', `        list1.Next = mergeTwoLists(list1.Next, list2)`],
      ['ret1', `        ${k('return')} list1`],
      [null, `    }`],
      ['rec2', `    list2.Next = mergeTwoLists(list1, list2.Next)`],
      ['ret2', `    ${k('return')} list2`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} merge_two_lists(`],
      [null, `        list1: Option&lt;Box&lt;ListNode&gt;&gt;,`],
      [null, `        list2: Option&lt;Box&lt;ListNode&gt;&gt;,`],
      [null, `    ) -&gt; Option&lt;Box&lt;ListNode&gt;&gt; {`],
      [null, `        ${k('match')} (list1, list2) {`],
      ['base1', `            (${k('None')}, l2) =&gt; l2,`],
      ['base2', `            (l1, ${k('None')}) =&gt; l1,`],
      [null, `            (Some(${k('mut')} a), Some(${k('mut')} b)) =&gt; {`],
      ['cmp', `                ${k('if')} a.val &lt;= b.val {`],
      ['rec1', `                    a.next = Solution::merge_two_lists(a.next.take(), Some(b));`],
      ['ret1', `                    Some(a)`],
      [null, `                } ${k('else')} {`],
      ['rec2', `                    b.next = Solution::merge_two_lists(Some(a), b.next.take());`],
      ['ret2', `                    Some(b)`],
      [null, `                }`],
      [null, `            }`],
      [null, `        }`],
      [null, `    }`],
      [null, `}`],
    ],
  },
};

/* ---------------- part 1: the "only the fronts matter" widget ----------------
 *
 * The statement hinges on the word "sorted": because both inputs are sorted,
 * the next node of the answer is always one of exactly two nodes — the two
 * fronts — and nothing behind them ever needs looking at. Drag to merge one
 * node at a time; the two lit cells are the whole decision.
 *
 * Built from x-sum's widget vocabulary: .q-arr cells (kept / cut), the
 * .q-slider, the amber .q-tie line and the .ledger.
 */

const QW_SETS = [
  { label: t('example 1', 'ဥပမာ 1'), a: [1, 2, 4], b: [1, 3, 4] },
  { label: t('one runs out', 'တစ်ခု အရင်ကုန်'), a: [1, 2, 3], b: [7, 8, 9] },
  { label: t('interleaved', 'အလှည့်ကျ'), a: [1, 3, 5, 7], b: [2, 4, 6] },
  { label: t('example 3', 'ဥပမာ 3'), a: [], b: [0] },
];

function mountFrontsWidget(host) {
  const state = { set: 0, k: 0 };

  host.innerHTML = `
    <div class="q-arr" data-a></div>
    <div class="q-arr" data-b></div>
    <div class="q-slider">
      <label for="qw-k" data-lbl></label>
      <input type="range" id="qw-k" min="0" max="6" value="0">
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
    const { a, b } = QW_SETS[state.set];
    const total = a.length + b.length;
    const k = Math.min(state.k, total);
    // Replay k decisions of the merge.
    let i = 0, j = 0;
    const out = [];
    while (out.length < k) {
      if (j >= b.length || (i < a.length && a[i] <= b[j])) out.push(a[i++]);
      else out.push(b[j++]);
    }

    q('[data-lbl]').textContent = pick(t('merged', 'ပေါင်းပြီး'));
    const slider = q('#qw-k');
    slider.max = String(total);
    slider.value = String(k);
    q('[data-out]').textContent = String(k);
    q('[data-presets]').innerHTML = presetChips(QW_SETS, state.set);

    // cut = already spliced into the answer · kept = a front, one of the only
    // two candidates · plain = behind a front, never looked at yet
    const rowHtml = (name, xs, used) => `<span class="q-row-label">${name}</span>`
      + (xs.length ? xs.map((v, n) => {
        const cls = n < used ? 'cut' : n === used ? 'kept' : '';
        return `<div class="cell ${cls}"><span>${v}</span><span class="idx">${n === used ? 'front' : n}</span></div>`;
      }).join('') : '<span class="q-empty">[]</span>');
    q('[data-a]').innerHTML = rowHtml('list1', a, i);
    q('[data-b]').innerHTML = rowHtml('list2', b, j);

    widgetLabel(pick(t(`${a.length} + ${b.length} nodes`, `node ${a.length} + ${b.length} ခု`)));

    let line;
    if (k === total) {
      line = t('Both lists are used up. Every node was chosen by comparing two fronts — nothing further back was ever read.',
               'list နှစ်ခုလုံး ကုန်ပြီ။ node တိုင်းကို ရှေ့ဆုံး နှစ်ခုကို နှိုင်းယှဉ်၍ ရွေးခဲ့သည် — ၎င်းတို့နောက်ရှိ ဘာကိုမျှ မဖတ်ခဲ့ရပါ။');
    } else if (i >= a.length || j >= b.length) {
      const [name, xs, used] = i >= a.length ? ['list2', b, j] : ['list1', a, i];
      line = t(`One list is empty, so there is no choice left: the rest of ${name} — ${xs.slice(used).join(', ')} — is already sorted and attaches as it is.`,
               `list တစ်ခု ကုန်သွားပြီဖြစ်၍ ရွေးစရာ မကျန်တော့ပါ — ${name} ၏ ကျန်အပိုင်း ${xs.slice(used).join(', ')} သည် sort ဖြစ်ပြီးသားဖြစ်၍ ဒီအတိုင်း ချိတ်သည်။`);
    } else {
      const pickA = a[i] <= b[j];
      line = t(`Next is min(${a[i]}, ${b[j]}) = ${pickA ? a[i] : b[j]}, from ${pickA ? 'list1' : 'list2'}${a[i] === b[j] ? ' (a tie — take list1 to keep the merge stable)' : ''}. Nothing behind either front can be smaller, because both lists are sorted.`,
               `နောက်တစ်ခုမှာ min(${a[i]}, ${b[j]}) = ${pickA ? a[i] : b[j]}၊ ${pickA ? 'list1' : 'list2'} မှ${a[i] === b[j] ? ' (တူနေသည် — merge ကို stable ဖြစ်စေရန် list1 မှ ယူပါ)' : ''}။ list နှစ်ခုလုံး sort ဖြစ်သဖြင့် ရှေ့ဆုံးများနောက်ရှိ မည်သည့်အရာမျှ ပိုမငယ်နိုင်ပါ။`);
    }
    q('[data-line]').innerHTML = pick(line);

    // the ledger is a formula, as on x-sum
    q('[data-expr]').innerHTML = `merged = [${out.join(', ')}]${k < total && i < a.length && j < b.length ? ` &nbsp;·&nbsp; next = min(${a[i]}, ${b[j]})` : ''}`;
    q('[data-total]').innerHTML = `${k}/${total}<small>${pick(t('spliced', 'ချိတ်ပြီး'))}</small>`;
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
  iterative: {
    idea: t("Both lists are sorted, so the next node of the answer is always the smaller of the two heads. Splice it on and move that list forward.",
        "list နှစ်ခုလုံး sort လုပ်ထားပြီးဖြစ်သဖြင့် အဖြေ၏ နောက် node သည် head နှစ်ခုအနက် ငယ်သည့်တစ်ခု အမြဲ ဖြစ်သည်။ ၎င်းကို ဆက်ပြီး ထို list ကို ရှေ့တိုးသည်။"),
    steps: [
      t("Start with a <code>dummy</code> node and <code>tail = dummy</code>, so the first splice needs no special case.",
        "<code>dummy</code> node နှင့် <code>tail = dummy</code> ဖြင့် စသဖြင့် ပထမဆုံး ဆက်ခြင်းအတွက် သီးသန့် မစစ်ရပါ။"),
      t("While both lists have nodes, splice the smaller head after <code>tail</code> — <code>list1</code> on a tie — and advance that list.",
        "list နှစ်ခုလုံးတွင် node ရှိနေသမျှ ငယ်သော head ကို <code>tail</code> နောက်တွင် ဆက်ပြီး (တူလျှင် <code>list1</code>) ထို list ကို ရှေ့တိုးသည်။"),
      t("Move <code>tail</code> forward.",
        "<code>tail</code> ကို ရှေ့တိုးသည်။"),
      t("Attach whatever is left of either list, and return <code>dummy.next</code>.",
        "list တစ်ခုခုတွင် ကျန်သည့်အရာကို တပ်ပြီး <code>dummy.next</code> ကို ပြန်ပေးသည်။"),
    ],
    cost: t("one step per node and a single dummy; no node is copied.",
        "node တစ်ခုလျှင် အဆင့်တစ်ဆင့်နှင့် dummy တစ်ခုတည်း — node တစ်ခုမျှ မကူးပါ။"),
  },
  recursive: {
    idea: t("The merged list is the smaller head followed by the merge of everything else — the same problem, one node smaller.",
        "ပေါင်းထားသော list သည် ငယ်သော head နောက်တွင် ကျန်အရာအားလုံးကို ပေါင်းထားခြင်း ဖြစ်သည် — node တစ်ခု လျော့သော ပြဿနာ အတူတူပင်။"),
    steps: [
      t("If either list is empty, the answer is the other one.",
        "list တစ်ခုခု ဗလာဖြစ်လျှင် အဖြေမှာ ကျန်တစ်ခု ဖြစ်သည်။"),
      t("If <code>list1.val &lt;= list2.val</code>, set <code>list1.next</code> to the merge of <code>list1.next</code> and <code>list2</code>, and return <code>list1</code>.",
        "<code>list1.val &lt;= list2.val</code> ဖြစ်လျှင် <code>list1.next</code> ကို <code>list1.next</code> နှင့် <code>list2</code> ပေါင်းထားခြင်းအဖြစ် သတ်မှတ်ပြီး <code>list1</code> ကို ပြန်ပေးသည်။"),
      t("Otherwise do the same with <code>list2</code>.",
        "မဟုတ်လျှင် <code>list2</code> ဖြင့် အလားတူ လုပ်သည်။"),
    ],
    cost: t("the same steps, plus one stack frame per node — at most 100 here, from two 50-node lists.",
        "အဆင့်များ အတူတူ၊ node တစ်ခုလျှင် stack frame တစ်ခု ထပ်လိုသည် — ဤနေရာတွင် node 50 ပါ list နှစ်ခုမှ အများဆုံး 100။"),
  },
};

/* ---------------- mount ----------------
 *
 * Last in the file on purpose: mountLesson runs the widget immediately, so
 * every const the widget reads must already be initialised. */

const parseList = (name) => intList({ min: 0, max: 8, why: 'as many as the stage can show', check: (xs) => {
  for (let i = 1; i < xs.length; i++) if (xs[i] < xs[i - 1]) throw new Error(`${name} must be sorted`);
} });

mountLesson({
  input: { list1: [1, 2, 4], list2: [1, 3, 4] },
  controls: [
    { key: 'list1', label: 'list1', parse: parseList('list1') },
    { key: 'list2', label: 'list2', parse: parseList('list2') },
  ],
  presets: [
    { label: exampleTitle(1), input: { list1: [1, 2, 4], list2: [1, 3, 4] } },
    { label: exampleTitle(2), input: { list1: [], list2: [] } },
    { label: exampleTitle(3), input: { list1: [], list2: [0] } },
    { label: t('One runs out', 'တစ်ခု အရင်ကုန်'), input: { list1: [1, 2, 3], list2: [7, 8, 9] } },
  ],
  examples: [
    { title: exampleTitle(1), inputHtml: '<code>list1 = [1,2,4]</code>, <code>list2 = [1,3,4]</code>', output: '[1,1,2,3,4,4]',
      why: [t('Each step takes the smaller of the two fronts. On the ties (<code>1</code> and <code>4</code>) list1 goes first, which keeps the merge stable.',
              'အဆင့်တိုင်းတွင် ရှေ့ဆုံး နှစ်ခုအနက် ငယ်သည့်တစ်ခုကို ယူသည်။ တူနေသည့်အခါ (<code>1</code> နှင့် <code>4</code>) list1 ကို အရင်ယူခြင်းက merge ကို stable ဖြစ်စေသည်။')],
      load: { list1: [1, 2, 4], list2: [1, 3, 4] } },
    { title: exampleTitle(2), inputHtml: '<code>list1 = []</code>, <code>list2 = []</code>', output: '[]',
      why: [t('Nothing to merge. The answer is <code>null</code> — which is what <code>dummy.next</code> already holds.',
              'ပေါင်းစရာ မရှိပါ။ အဖြေမှာ <code>null</code> — <code>dummy.next</code> ထဲ ရှိပြီးသားအရာပင်။')],
      load: { list1: [], list2: [] } },
    { title: exampleTitle(3), inputHtml: '<code>list1 = []</code>, <code>list2 = [0]</code>', output: '[0]',
      why: [t('One list is empty from the start, so the loop never compares anything — the other list is the answer as it stands.',
              'list တစ်ခုသည် အစကတည်းက ဗလာ ဖြစ်သဖြင့် loop သည် ဘာကိုမျှ မနှိုင်းယှဉ်ပါ — ကျန် list သည် ရှိသည့်အတိုင်း အဖြေ ဖြစ်သည်။')],
      load: { list1: [], list2: [0] } },
  ],
  modes: [
    { id: 'iterative', name: 'Iterative',
      desc: t('A dummy head and a tail pointer; splice as you go.', 'dummy head နှင့် tail pointer — သွားရင်း ချိတ်သည်။'),
      cost: 'O(n+m) time · O(1) space', build: buildIterative },
    { id: 'recursive', name: 'Recursive',
      desc: t('Pick the smaller head, recurse for the rest.', 'ငယ်သည့် head ကို ရွေးပြီး ကျန်တာကို recurse လုပ်သည်။'),
      cost: 'O(n+m) time · O(n+m) stack', build: buildRecursive },
  ],
  languages: LANGUAGES,
  code: CODE,
  solutions: {
    iterative: { approach: APPROACH.iterative, desc: t('The submission worth writing. The dummy removes the first-node special case, and no node is ever created — every node in the answer was already in an input.',
                         'ရေးသင့်သည့် submission ဖြစ်သည်။ dummy က ပထမ node အတွက် သီးခြား case ကို ဖယ်ရှားပေးပြီး node အသစ် တစ်ခုမျှ မဖန်တီးပါ — အဖြေထဲရှိ node တိုင်းသည် input ထဲတွင် ရှိပြီးသား ဖြစ်သည်။') },
    recursive: { approach: APPROACH.recursive, desc: t('The same decisions, written as "the smaller head, followed by the merge of the rest". It reads better and costs a stack frame per node — free at 50 nodes, a stack overflow at 10⁵.',
                         'ဆုံးဖြတ်ချက် အတူတူကို "ငယ်သည့် head၊ နောက်တွင် ကျန်တာကို ပေါင်းခြင်း" ဟု ရေးထားသည်။ ဖတ်ရ ပိုကောင်းပြီး node တစ်ခုလျှင် stack frame တစ်ခု ကုန်သည် — node 50 တွင် အခမဲ့၊ 10⁵ တွင် stack overflow။') },
  },
  // How each language was actually checked. Printed as a badge on every
  // listing in part 3. The corpus: the 3 examples, 3 edges, 15,000 pairs of
  // lists up to 6 long over -3..3 (so ties are everywhere), 5,000 pairs up to
  // the 50-node constraint over -100..100, and two disjoint 50-node pairs —
  // checked against concatenate-and-sort. Go and Rust ran in Docker
  // (golang:1.23-alpine, rust:1-slim).
  verification: {
    ruby: 'ran here · 20,008 cases vs sort',
    python: 'ran here · 20,008 cases vs sort',
    javascript: 'ran here · 20,008 cases vs sort',
    go: 'ran here · 20,008 cases · Go 1.23',
    rust: 'ran here · 20,008 cases · rustc 1.98',
  },
  strip,
  stripLabel: t('The two lists', 'List နှစ်ခု'),
  draw,
  answer,
  vars,
  widget: mountFrontsWidget,
});
