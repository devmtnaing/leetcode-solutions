/* Linked List Cycle — LeetCode 141.
 *
 * The contrast worth seeing is space, not time. Both approaches walk the list
 * once in O(n); the difference is that one of them writes down every node it
 * passes and the other writes down nothing at all. Watching the visited set
 * grow next to two pointers that never grow is the whole lesson.
 */
import { t, plural, exampleTitle, LANGUAGES, k, c, verdictAnswer, stageGap } from '../../lib/kit.js';
import { mountLesson } from '../../lib/stepper.js';
import { pick, onLangChange } from '../../lib/i18n.js';
import { cells, chain, kv, readout, stagePanel } from '../../lib/stage.js';


/* ---------------- the list, as indices ---------------- */

/* The judge builds the list from (values, pos): node i links to node i + 1,
 * and the tail links back to node `pos` unless pos is -1. Everything below
 * works in indices, so `null` here means the real null at the end. */
function nextOf(i, n, pos) {
  if (i + 1 < n) return i + 1;
  return pos >= 0 ? pos : null;
}

function validate({ values, pos }) {
  const n = values.length;
  if (pos === -1) return n;
  if (!Number.isInteger(pos) || pos < 0 || pos >= n) {
    throw new Error(n
      ? `pos must be -1 or an index from 0 to ${n - 1}`
      : 'an empty list can only take pos = -1');
  }
  return n;
}

/* How far fast still has to travel around the loop to land on slow. Only
 * meaningful once both pointers are inside the cycle; that distance is what
 * shrinks by exactly one per round, which is the proof the lesson is after. */
function gapOf(slow, fast, n, pos) {
  if (pos < 0 || slow == null || fast == null) return null;
  if (slow < pos || fast < pos) return null;
  const len = n - pos;
  return ((slow - fast) % len + len) % len;
}

/* ---------------- step generators ---------------- */

function buildSeen(input) {
  const { values, pos } = input;
  const n = validate(input);
  const steps = [];
  const seen = [];

  steps.push({ line: 'init', cur: null, seen: [],
    note: t('A set of <b>nodes</b>, not of values — two different nodes can hold the same number, and here it is the node that has to be recognised.',
            'value များ မဟုတ်ဘဲ <b>node</b> များ၏ set ဖြစ်သည် — node နှစ်ခုတွင် ကိန်းတူ ရှိနိုင်ပြီး ဤနေရာတွင် မှတ်မိရမည်မှာ node ကိုယ်တိုင် ဖြစ်သည်။') });

  let cur = n ? 0 : null;
  // A buggy walk round a cycle never ends. n + 3 visits is more than any
  // correct walk needs, so overrunning it is a bug worth throwing on rather
  // than a page that hangs.
  for (let guard = 0; guard <= n + 3; guard++) {
    if (cur === null) {
      steps.push({ line: 'none', cur: null, seen: seen.slice(), verdict: false, tag: t('false', 'false'),
        note: t(`The walk reached <b>null</b>, so the list has an end and cannot loop. Return false — at the cost of having held ${plural(seen.length, 'node reference')}.`,
                `လျှောက်ရင်း <b>null</b> သို့ ရောက်သဖြင့် list တွင် အဆုံး ရှိပြီး loop မဖြစ်နိုင်ပါ။ false ပြန်ပေးသည် — node reference ${seen.length} ခု ကိုင်ထားရသည့် ကုန်ကျမှုဖြင့်။`) });
      return steps;
    }

    steps.push({ line: 'loop', cur, seen: seen.slice(), tag: t('visit', 'ရောက်'),
      note: t(`Standing on index <b>${cur}</b>, value ${values[cur]}.`, `index <b>${cur}</b> (value ${values[cur]}) ပေါ်တွင် ရှိသည်။`) });
    steps.push({ line: 'check', cur, seen: seen.slice(), tag: t('lookup', 'ရှာ'),
      note: t('Is this node already in the set?', 'ဤ node သည် set ထဲတွင် ရှိပြီးသားလား။') });

    if (seen.includes(cur)) {
      steps.push({ line: 'hit', cur, seen: seen.slice(), repeat: cur, verdict: true, tag: t('true', 'true'),
        note: t(`It is — index <b>${cur}</b> was recorded earlier in this same walk. Arriving anywhere twice means the links loop, so return true.`,
                `ရှိသည် — index <b>${cur}</b> ကို ဤလျှောက်ခြင်းထဲတွင် အစောပိုင်းက မှတ်ခဲ့ပြီးဖြစ်သည်။ နေရာတစ်ခုသို့ နှစ်ကြိမ် ရောက်ခြင်းသည် link များ loop ဖြစ်နေကြောင်း ဆိုလိုသဖြင့် true ပြန်ပေးသည်။`) });
      return steps;
    }

    seen.push(cur);
    steps.push({ line: 'store', cur, seen: seen.slice(), added: cur, tag: t('record', 'မှတ်'),
      note: t(`Not seen before. Record it; the set is now holding <b>${plural(seen.length, 'node')}</b>.`,
              `အရင်က မတွေ့ဖူးပါ။ မှတ်ထားသည် — set ထဲတွင် ယခု node <b>${seen.length}</b> ခု ရှိသည်။`) });

    const nx = nextOf(cur, n, pos);
    steps.push({ line: 'adv', cur: nx, from: cur, seen: seen.slice(), tag: t('step', 'ရွှေ့'),
      note: nx === null
        ? t(`The next pointer of index ${cur} is null. Follow it anyway and the loop condition will end the walk.`,
            `index ${cur} ၏ next pointer သည် null ဖြစ်သည်။ ၎င်းကို လိုက်လိုက်သည်နှင့် loop အခြေအနေက လျှောက်ခြင်းကို ရပ်စေမည်။`)
        : t(`Follow the link from index ${cur} to index <b>${nx}</b>, value ${values[nx]}.`,
            `index ${cur} မှ index <b>${nx}</b> (value ${values[nx]}) သို့ link အတိုင်း သွားသည်။`) });
    cur = nx;
  }
  throw new Error('the walk did not terminate');
}

function buildFloyd(input) {
  const { values, pos } = input;
  const n = validate(input);
  const steps = [];

  let slow = n ? 0 : null;
  let fast = n ? 0 : null;
  steps.push({ line: 'init', slow, fast, floyd: true,
    note: n
      ? t('Both pointers start on the head. Nothing else is stored — these two references are the entire memory cost.',
          'pointer နှစ်ခုလုံး head ပေါ်မှ စသည်။ အခြား ဘာမျှ မသိမ်းပါ — reference နှစ်ခုသည် memory ကုန်ကျမှု အားလုံး ဖြစ်သည်။')
      : t('The list is empty, so both pointers start at null.', 'list ဗလာ ဖြစ်သဖြင့် pointer နှစ်ခုလုံး null မှ စသည်။') });

  // Slow visits at most n + 1 distinct positions before the two pointers meet,
  // so a correct run cannot need more rounds than that. Anything beyond it is
  // a generator bug, and throwing beats spinning.
  for (let round = 0; round <= n + 2; round++) {
    const oneAhead = fast === null ? null : nextOf(fast, n, pos);
    steps.push({ line: 'loop', slow, fast, floyd: true, tag: t('guard', 'စစ်'),
      note: fast === null
        ? t('fast is at null, so there is nothing left to step onto.', 'fast သည် null တွင် ရှိသဖြင့် ရွှေ့စရာ မကျန်တော့ပါ။')
        : oneAhead === null
          ? t(`fast is at index ${fast} and its next pointer is null, so it cannot take two steps.`,
              `fast သည် index ${fast} တွင် ရှိပြီး ၎င်း၏ next pointer သည် null ဖြစ်သဖြင့် နှစ်လှမ်း မလှမ်းနိုင်ပါ။`)
          : t(`fast is at index ${fast} and has a node after it, so a two-step move is safe.`,
              `fast သည် index ${fast} တွင် ရှိပြီး နောက်တွင် node ရှိသဖြင့် နှစ်လှမ်း လှမ်းရန် ဘေးကင်းသည်။`) });

    if (fast === null || oneAhead === null) {
      steps.push({ line: 'none', slow, fast, floyd: true, verdict: false, tag: t('false', 'false'),
        note: n === 0
          ? t('There is no list to walk, so there is nothing to loop. Return false.',
              'လျှောက်စရာ list မရှိသဖြင့် loop ဖြစ်စရာလည်း မရှိပါ။ false ပြန်ပေးသည်။')
          : t(`fast has run out of list — ${fast === null ? 'it is sitting on null' : `index ${fast} is the last node`}. Only a list with an end can stop it, so there is no cycle. Return false.`,
              `fast သည် list ကုန်သွားပြီ — ${fast === null ? 'null ပေါ်တွင် ရှိနေသည်' : `index ${fast} သည် နောက်ဆုံး node ဖြစ်သည်`}။ အဆုံးရှိသော list တစ်ခုသာ ၎င်းကို ရပ်စေနိုင်သဖြင့် cycle မရှိပါ။ false ပြန်ပေးသည်။`) });
      return steps;
    }

    const slowFrom = slow;
    slow = nextOf(slow, n, pos);
    steps.push({ line: 'slow', slow, fast, floyd: true, tag: t('slow', 'slow'),
      note: t(`slow takes one step: index ${slowFrom} → <b>${slow}</b>, value ${values[slow]}.`,
              `slow တစ်လှမ်း လှမ်းသည် — index ${slowFrom} → <b>${slow}</b>၊ value ${values[slow]}။`) });

    const fastFrom = fast;
    fast = nextOf(oneAhead, n, pos);
    const gap = gapOf(slow, fast, n, pos);
    const inLoop = gap != null && gap > 0;
    steps.push({ line: 'fast', slow, fast, gap, floyd: true, tag: t('fast', 'fast'),
      note: t(`fast takes two steps: index ${fastFrom} → ${oneAhead} → <b>${fast === null ? 'null' : fast}</b>.`
              + (inLoop ? ` Both pointers are inside the loop now, and fast still has <b>${gap}</b> step${gap === 1 ? '' : 's'} to go to reach slow.` : ''),
              `fast နှစ်လှမ်း လှမ်းသည် — index ${fastFrom} → ${oneAhead} → <b>${fast === null ? 'null' : fast}</b>။`
              + (inLoop ? ` pointer နှစ်ခုလုံး loop အတွင်း ရောက်နေပြီ၊ fast သည် slow ကို မီရန် <b>${gap}</b> လှမ်း ကျန်သေးသည်။` : '')) });

    steps.push({ line: 'check', slow, fast, gap, floyd: true, tag: t('compare', 'နှိုင်းယှဉ်'),
      note: slow === fast
        ? t('Same node?', 'node တစ်ခုတည်းလား။')
        : t(`Same node? Not yet — slow is at ${slow}, fast at ${fast === null ? 'null' : fast}.`,
            `node တစ်ခုတည်းလား။ မဟုတ်သေးပါ — slow သည် ${slow} တွင်၊ fast သည် ${fast === null ? 'null' : fast} တွင် ရှိသည်။`) });

    if (slow === fast) {
      steps.push({ line: 'hit', slow, fast, met: slow, gap, floyd: true, verdict: true, tag: t('true', 'true'),
        note: t(`They have collided at index <b>${slow}</b>, value ${values[slow]}. Two pointers at different speeds can only land on the same node if the path loops back, so return true.`,
                `index <b>${slow}</b> (value ${values[slow]}) တွင် ဆုံသွားပြီ။ အမြန်နှုန်း မတူသော pointer နှစ်ခုသည် လမ်းကြောင်း ပြန်လှည့်လာမှသာ node တစ်ခုတည်းပေါ် ရောက်နိုင်သဖြင့် true ပြန်ပေးသည်။`) });
      return steps;
    }
  }
  throw new Error('the two pointers never terminated');
}

/* ---------------- drawing ----------------
 *
 * The strip card is the list in index order, with the pointers on it. The
 * stage draws what the approach carries: for the set, the set itself, next to
 * the list's real shape — the back-link the strip cannot show; for Floyd, two
 * references and the gap between them, next to the same shape.
 */

function strip(s, { values }) {
  const tone = {};
  const marks = {};
  if (Array.isArray(s.seen)) {
    for (const i of s.seen) tone[i] = 'done';
    if (s.added != null) tone[s.added] = 'entering';
    if (s.cur != null) { marks[s.cur] = 'node'; if (s.added == null) tone[s.cur] = 'inwin'; }
    if (s.repeat != null) tone[s.repeat] = 'leaving';
  } else {
    if (s.slow != null) { marks[s.slow] = 'slow'; tone[s.slow] = 'inwin'; }
    if (s.fast != null) { marks[s.fast] = marks[s.fast] ? 'slow·fast' : 'fast'; if (s.fast !== s.slow) tone[s.fast] = 'entering'; }
    if (s.met != null) tone[s.met] = 'leaving';
  }
  return values.length ? cells(values, { tone, marks }) : '<span class="note mono">head = null</span>';
}

function shape(s, { values, pos }) {
  if (!values.length) return '<p class="note mono stage-empty">head = null</p>';
  const tone = {};
  const marks = {};
  if (Array.isArray(s.seen)) {
    for (const i of s.seen) tone[i] = 'done';
    if (s.repeat != null) tone[s.repeat] = 'up';
    if (s.cur != null) marks[s.cur] = 'node';
  } else {
    if (s.slow != null) marks[s.slow] = 'slow';
    if (s.fast != null) marks[s.fast] = marks[s.fast] ? 'slow·fast' : 'fast';
    if (s.met != null) tone[s.met] = 'up';
  }
  return chain(values.map((v) => ({ value: v })), { marks, tone, cycleTo: pos >= 0 ? pos : null });
}

function draw(s, input) {
  const { values } = input;
  if (Array.isArray(s.seen)) {
    const table = {};
    for (const i of s.seen) table[i] = values[i];
    return stagePanel(pick(t('seen — every node walked past', 'seen — ဖြတ်ခဲ့သမျှ node')),
      pick(t(`${s.seen.length} held`, `${s.seen.length} ခု ကိုင်ထား`)),
      shape(s, input) + stageGap + kv(table, {
        at: s.repeat != null ? String(s.repeat) : null,
        tone: s.repeat != null ? { [s.repeat]: 'up' } : s.added != null ? { [s.added]: 'warn' } : {},
        keyName: 'node (index)', valName: 'value',
      }));
  }
  const at = (i) => (i == null ? 'null' : `index ${i}`);
  return stagePanel(pick(t('slow and fast — two references, nothing else', 'slow နှင့် fast — reference နှစ်ခု၊ အခြား ဘာမျှ မရှိ')),
    pick(t('O(1) memory', 'O(1) memory')),
    shape(s, input) + stageGap + readout({ slow: at(s.slow), fast: at(s.fast), ...(s.gap != null ? { 'gap to close': s.gap } : {}) }));
}

function answer(s) {
  return verdictAnswer(s.verdict, {
    yes: t('has a cycle', 'cycle ရှိသည်'),
    no: t('no cycle', 'cycle မရှိ'),
    pending: t('true or false', 'true သို့မဟုတ် false'),
  });
}

function vars(s) {
  if (Array.isArray(s.seen)) {
    return [['node', s.cur == null ? 'null' : `index ${s.cur}`], ['seen', `{${s.seen.join(', ')}}`]];
  }
  return [['slow', s.slow == null ? 'null' : `index ${s.slow}`], ['fast', s.fast == null ? 'null' : `index ${s.fast}`]];
}

/* ---------------- the code, one key per line ---------------- */


const CODE = {
  seen: {
    ruby: [
      [null, `${k('def')} hasCycle(head)`],
      ['init', `  seen = {}                             ${c('# every node already walked past')}`],
      [null, `  node = head`],
      ['loop', `  ${k('while')} node`],
      ['check', `    ${k('if')} seen.key?(node)`],
      ['hit', `      ${k('return')} true`],
      [null, `    ${k('end')}`],
      ['store', `    seen[node] = true`],
      ['adv', `    node = node.next`],
      [null, `  ${k('end')}`],
      ['none', `  false`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} hasCycle(self, head):`],
      ['init', `        seen = set()                    ${c('# every node already walked past')}`],
      [null, `        node = head`],
      ['loop', `        ${k('while')} node:`],
      ['check', `            ${k('if')} node ${k('in')} seen:`],
      ['hit', `                ${k('return')} True`],
      ['store', `            seen.add(node)`],
      ['adv', `            node = node.next`],
      ['none', `        ${k('return')} False`],
    ],
    javascript: [
      [null, `${k('var')} hasCycle = ${k('function')} (head) {`],
      ['init', `  ${k('const')} seen = ${k('new')} Set();               ${c('// every node already walked past')}`],
      [null, `  ${k('let')} node = head;`],
      ['loop', `  ${k('while')} (node !== ${k('null')}) {`],
      ['check', `    ${k('if')} (seen.has(node)) {`],
      ['hit', `      ${k('return')} true;`],
      [null, `    }`],
      ['store', `    seen.add(node);`],
      ['adv', `    node = node.next;`],
      [null, `  }`],
      ['none', `  ${k('return')} false;`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} hasCycle(head *ListNode) ${k('bool')} {`],
      ['init', `    seen := ${k('make')}(${k('map')}[*ListNode]${k('bool')})    ${c('// every node already walked past')}`],
      [null, `    node := head`],
      ['loop', `    ${k('for')} node != ${k('nil')} {`],
      ['check', `        ${k('if')} seen[node] {`],
      ['hit', `            ${k('return')} true`],
      [null, `        }`],
      ['store', `        seen[node] = true`],
      ['adv', `        node = node.Next`],
      [null, `    }`],
      ['none', `    ${k('return')} false`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('use')} std::cell::RefCell;`],
      [null, `${k('use')} std::collections::HashSet;`],
      [null, `${k('use')} std::rc::Rc;`],
      [null, ` `],
      [null, `${k('type')} Link = Option&lt;Rc&lt;RefCell&lt;ListNode&gt;&gt;&gt;;`],
      [null, ` `],
      [null, `${k('fn')} addr(node: &amp;Rc&lt;RefCell&lt;ListNode&gt;&gt;) -&gt; usize {`],
      [null, `    Rc::as_ptr(node) ${k('as')} usize`],
      [null, `}`],
      [null, ` `],
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} has_cycle(head: Link) -&gt; ${k('bool')} {`],
      ['init', `        ${k('let')} ${k('mut')} seen: HashSet&lt;usize&gt; = HashSet::new();`],
      [null, `        ${k('let')} ${k('mut')} node = head;`],
      ['loop', `        ${k('while')} ${k('let')} Some(n) = node.clone() {`],
      ['check', `            ${k('if')} seen.contains(&amp;addr(&amp;n)) {`],
      ['hit', `                ${k('return')} true;`],
      [null, `            }`],
      ['store', `            seen.insert(addr(&amp;n));`],
      ['adv', `            node = n.borrow().next.clone();`],
      [null, `        }`],
      ['none', `        false`],
      [null, `    }`],
      [null, `}`],
    ],
  },
  floyd: {
    ruby: [
      [null, `${k('def')} hasCycle(head)`],
      ['init', `  slow = head                           ${c('# one step per round')}`],
      [null, `  fast = head                           ${c('# two steps per round')}`],
      ['loop', `  ${k('while')} fast &amp;&amp; fast.next`],
      ['slow', `    slow = slow.next`],
      ['fast', `    fast = fast.next.next`],
      ['check', `    ${k('if')} slow.equal?(fast)`],
      ['hit', `      ${k('return')} true`],
      [null, `    ${k('end')}`],
      [null, `  ${k('end')}`],
      ['none', `  false`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} hasCycle(self, head):`],
      ['init', `        slow = head                     ${c('# one step per round')}`],
      [null, `        fast = head                     ${c('# two steps per round')}`],
      ['loop', `        ${k('while')} fast ${k('and')} fast.next:`],
      ['slow', `            slow = slow.next`],
      ['fast', `            fast = fast.next.next`],
      ['check', `            ${k('if')} slow ${k('is')} fast:`],
      ['hit', `                ${k('return')} True`],
      ['none', `        ${k('return')} False`],
    ],
    javascript: [
      [null, `${k('var')} hasCycle = ${k('function')} (head) {`],
      ['init', `  ${k('let')} slow = head;                      ${c('// one step per round')}`],
      [null, `  ${k('let')} fast = head;                      ${c('// two steps per round')}`],
      ['loop', `  ${k('while')} (fast !== ${k('null')} &amp;&amp; fast.next !== ${k('null')}) {`],
      ['slow', `    slow = slow.next;`],
      ['fast', `    fast = fast.next.next;`],
      ['check', `    ${k('if')} (slow === fast) {`],
      ['hit', `      ${k('return')} true;`],
      [null, `    }`],
      [null, `  }`],
      ['none', `  ${k('return')} false;`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} hasCycle(head *ListNode) ${k('bool')} {`],
      ['init', `    slow := head                        ${c('// one step per round')}`],
      [null, `    fast := head                        ${c('// two steps per round')}`],
      ['loop', `    ${k('for')} fast != ${k('nil')} &amp;&amp; fast.Next != ${k('nil')} {`],
      ['slow', `        slow = slow.Next`],
      ['fast', `        fast = fast.Next.Next`],
      ['check', `        ${k('if')} slow == fast {`],
      ['hit', `            ${k('return')} true`],
      [null, `        }`],
      [null, `    }`],
      ['none', `    ${k('return')} false`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('use')} std::cell::RefCell;`],
      [null, `${k('use')} std::rc::Rc;`],
      [null, ` `],
      [null, `${k('type')} Link = Option&lt;Rc&lt;RefCell&lt;ListNode&gt;&gt;&gt;;`],
      [null, ` `],
      [null, `${k('fn')} step(node: &amp;Link) -&gt; Link {`],
      [null, `    node.as_ref().and_then(|n| n.borrow().next.clone())`],
      [null, `}`],
      [null, ` `],
      [null, `${k('fn')} same(a: &amp;Link, b: &amp;Link) -&gt; ${k('bool')} {`],
      [null, `    ${k('matches!')}((a, b), (Some(x), Some(y)) ${k('if')} Rc::ptr_eq(x, y))`],
      [null, `}`],
      [null, ` `],
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} has_cycle(head: Link) -&gt; ${k('bool')} {`],
      ['init', `        ${k('let')} ${k('mut')} slow = head.clone();`],
      [null, `        ${k('let')} ${k('mut')} fast = head;`],
      ['loop', `        ${k('while')} step(&amp;fast).is_some() {`],
      ['slow', `            slow = step(&amp;slow);`],
      ['fast', `            fast = step(&amp;step(&amp;fast));`],
      ['check', `            ${k('if')} same(&amp;slow, &amp;fast) {`],
      ['hit', `                ${k('return')} true;`],
      [null, `            }`],
      [null, `        }`],
      ['none', `        false`],
      [null, `    }`],
      [null, `}`],
    ],
  },
};

/* ---------------- part 1: the "pos is hidden" widget ----------------
 *
 * The statement hinges on one bolded sentence: pos is not passed as a
 * parameter. The examples print it, so it is easy to read past — but the
 * function only ever gets `head`, and a list that loops looks exactly like a
 * very long list until you notice you are standing somewhere you have been.
 * Drag pos and watch what a walk from the head actually sees.
 *
 * Built from x-sum's widget vocabulary: .q-arr cells (kept / cut), the
 * .q-slider, the amber .q-tie line and the .ledger.
 */

const QW_SETS = [
  { label: t('example 1', 'ဥပမာ 1'), values: [3, 2, 0, -4], pos: 1 },
  { label: t('example 2', 'ဥပမာ 2'), values: [1, 2], pos: 0 },
  { label: t('example 3', 'ဥပမာ 3'), values: [1], pos: -1 },
  { label: t('long tail, small loop', 'tail ရှည်၊ loop သေး'), values: [5, 8, 1, 9, 4, 7, 6], pos: 5 },
];

function mountHiddenPosWidget(host) {
  const state = { set: 0, pos: QW_SETS[0].pos };

  host.innerHTML = `
    <div class="q-arr" data-arr></div>
    <div class="q-slider">
      <label for="qw-pos">pos =</label>
      <input type="range" id="qw-pos" min="-1" max="3" value="1">
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
    const { values } = QW_SETS[state.set];
    const n = values.length;
    const pos = Math.max(-1, Math.min(state.pos, n - 1));

    q('#qw-pos').max = String(n - 1);
    q('#qw-pos').value = String(pos);
    q('[data-out]').textContent = String(pos);
    q('[data-presets]').innerHTML = QW_SETS.map((x, i) =>
      `<button class="chip" data-set="${i}"${i === state.set ? ' aria-pressed="true"' : ''}>${pick(x.label)}</button>`).join('');

    // kept = on the loop, visited forever · cut = the run-in before the loop,
    // walked once · plain = every node, when nothing loops
    q('[data-arr]').innerHTML = values.map((v, i) => {
      const cls = pos < 0 ? '' : i >= pos ? 'kept' : 'cut';
      const tag = i === n - 1 ? (pos < 0 ? '→null' : `→${pos}`) : i;
      return `<div class="cell ${cls}"><span>${v}</span><span class="idx">${tag}</span></div>`;
    }).join('');

    const label = document.getElementById('q-label');
    if (label) label.textContent = pick(t('hasCycle(head) — pos is not passed', 'hasCycle(head) — pos ကို မပေးပါ'));

    // what a walk from the head sees: indices, until a repeat or null
    const walk = [];
    const seen = new Set();
    for (let i = 0; i !== null && walk.length < 2 * n + 2;) {
      walk.push(i);
      if (seen.has(i)) break;
      seen.add(i);
      i = nextOf(i, n, pos);
      if (i === null) { walk.push('null'); break; }
    }
    const loopLen = pos < 0 ? 0 : n - pos;

    q('[data-line]').innerHTML = pick(pos < 0
      ? t(`The tail points at null. A walk from the head hits null after ${plural(n, 'node')} — that is how it learns there is no cycle.`,
          `tail သည် null ကို ညွှန်သည်။ head မှ လျှောက်လျှင် node ${n} ခုအပြီးတွင် null နှင့် တွေ့သည် — cycle မရှိကြောင်း ထိုနည်းဖြင့် သိရသည်။`)
      : t(`The tail links back to index ${pos}. Your function never sees that number — only that after ${plural(n, 'step')} it is standing on index ${pos} again.`,
          `tail သည် index ${pos} သို့ ပြန်ချိတ်သည်။ သင့် function သည် ထိုကိန်းကို ဘယ်တော့မှ မမြင်ရပါ — အလှမ်း ${n} လှမ်းအပြီး index ${pos} ပေါ် ပြန်ရောက်နေသည်ကိုသာ သိရသည်။`));

    // the ledger is a formula, as on x-sum: the walk, as the function sees it
    q('[data-expr]').innerHTML = walk.join(' → ') + (pos >= 0 ? ' ↺' : '');
    q('[data-total]').innerHTML = `${loopLen}<small>${pick(t('loop length', 'loop အရှည်'))}</small>`;
  }

  host.addEventListener('input', (ev) => {
    if (ev.target.id !== 'qw-pos') return;
    state.pos = Number(ev.target.value); render();
  });
  host.addEventListener('click', (ev) => {
    const chip = ev.target.closest('[data-set]');
    if (!chip) return;
    state.set = Number(chip.dataset.set);
    state.pos = QW_SETS[state.set].pos;
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
  input: { values: [3, 2, 0, -4], pos: 1 },
  controls: [
    { key: 'values', label: 'head', value: '3, 2, 0, -4',
      parse: (v) => {
        const s = v.trim().replace(/^\[|\]$/g, '').trim();
        if (!s) return [];             // an empty list is a legal input
        const parts = s.split(',').map((x) => x.trim());
        if (parts.some((x) => x === '')) throw new Error('a value is missing');
        const a = parts.map(Number);
        if (a.some(Number.isNaN)) throw new Error('numbers only');
        return a.slice(0, 12);
      } },
    { key: 'pos', label: 'pos', type: 'number', value: 1, min: -1,
      parse: (v) => {
        const p = Number(v);
        if (!v.trim() || !Number.isInteger(p)) throw new Error('whole number, -1 for no cycle');
        return p;
      } },
  ],
  presets: [
    { label: exampleTitle(1), input: { values: [3, 2, 0, -4], pos: 1 } },
    { label: exampleTitle(2), input: { values: [1, 2], pos: 0 } },
    { label: exampleTitle(3), input: { values: [1], pos: -1 } },
    { label: t('Long tail, small loop', 'tail ရှည်၊ loop သေး'), input: { values: [5, 8, 1, 9, 4, 7, 6], pos: 5 } },
    { label: t('Same values, no loop', 'value တူ၊ loop မရှိ'), input: { values: [1, 1, 1, 1], pos: -1 } },
  ],
  examples: [
    { title: exampleTitle(1), inputHtml: '<code>head = [3,2,0,-4]</code>, <code>pos = 1</code>', output: 'true',
      why: [t('There is a cycle in the linked list, where the tail connects to the 1st node (0-indexed).',
              'linked list တွင် cycle ရှိပြီး tail သည် 1 ခုမြောက် node (0 မှ ရေတွက်) သို့ ချိတ်ထားသည်။')],
      load: { values: [3, 2, 0, -4], pos: 1 } },
    { title: exampleTitle(2), inputHtml: '<code>head = [1,2]</code>, <code>pos = 0</code>', output: 'true',
      why: [t('There is a cycle in the linked list, where the tail connects to the 0th node.',
              'linked list တွင် cycle ရှိပြီး tail သည် 0 ခုမြောက် node သို့ ချိတ်ထားသည်။')],
      load: { values: [1, 2], pos: 0 } },
    { title: exampleTitle(3), inputHtml: '<code>head = [1]</code>, <code>pos = -1</code>', output: 'false',
      why: [t('There is no cycle in the linked list.', 'linked list တွင် cycle မရှိပါ။')],
      load: { values: [1], pos: -1 } },
  ],
  modes: [
    { id: 'seen', name: 'Remember every node',
      desc: t('Record each node; arriving at one twice means a loop.', 'node တိုင်းကို မှတ်သည် — တစ်ခုကို နှစ်ကြိမ် ရောက်လျှင် loop ဖြစ်သည်။'),
      cost: 'O(n) time · O(n) space', build: buildSeen },
    { id: 'floyd', name: "Floyd's two pointers",
      desc: t('One step against two. In a loop, fast catches slow.', 'တစ်လှမ်းနှင့် နှစ်လှမ်း။ loop ထဲတွင် fast က slow ကို မီသည်။'),
      cost: 'O(n) time · O(1) space', build: buildFloyd },
  ],
  languages: LANGUAGES,
  code: CODE,
  solutions: {
    seen: { desc: t('Obvious and correct: a set of node references, not values. It holds up to n references, which is what the follow-up asks you to give up.',
                    'ရှင်းလင်းပြီး မှန်သည် — value များ မဟုတ်ဘဲ node reference များ၏ set။ reference n ခုအထိ ကိုင်ထားရပြီး follow-up က စွန့်လွှတ်ခိုင်းသည်မှာ ထိုအရာပင်။') },
    floyd: { desc: t('The submission the follow-up asks for. Check <code>fast</code> and <code>fast.next</code> before the two-step move, and compare nodes by identity.',
                     'follow-up တောင်းသည့် submission။ နှစ်လှမ်း မလှမ်းမီ <code>fast</code> နှင့် <code>fast.next</code> ကို စစ်ပါ၊ node များကို identity ဖြင့် နှိုင်းယှဉ်ပါ။') },
  },
  // How each language was actually checked. Printed as a badge on every
  // listing in part 3. The corpus: the 3 examples, 4 edges (including an
  // empty list and repeated values), 15,000 lists up to 8 nodes with every pos,
  // 4,990 up to 200 nodes over the full value range, and four at the 10⁴-node
  // constraint — each checked against the pos it was built from. Go and Rust
  // ran in Docker (golang:1.23-alpine, rust:1-slim); the Rust harness builds
  // the Rc<RefCell> list the caveat describes.
  verification: {
    ruby: 'ran here · 20,001 cases up to n = 10⁴',
    python: 'ran here · 20,001 cases up to n = 10⁴',
    javascript: 'ran here · 20,001 cases up to n = 10⁴',
    go: 'ran here · 20,001 cases · Go 1.23',
    rust: 'ran here · 20,001 cases · rustc 1.98',
  },
  caveats: {
    seen: {
      rust: t('LeetCode does not offer Rust on this problem, and its own <code>Option&lt;Box&lt;ListNode&gt;&gt;</code> cannot represent a cycle at all &mdash; a <code>Box</code> owns its successor uniquely. This listing uses <code>Option&lt;Rc&lt;RefCell&lt;ListNode&gt;&gt;&gt;</code>, which a reader can follow without <code>unsafe</code>.',
              'LeetCode တွင် ဤပုစ္ဆာအတွက် Rust မရှိပါ၊ ၎င်း၏ <code>Option&lt;Box&lt;ListNode&gt;&gt;</code> သည် cycle ကို လုံးဝ မဖော်ပြနိုင်ပါ — <code>Box</code> တစ်ခုသည် ၎င်း၏ နောက် node ကို တစ်ဦးတည်း ပိုင်ဆိုင်သည်။ ဤ listing သည် <code>unsafe</code> မပါဘဲ လိုက်ဖတ်နိုင်သော <code>Option&lt;Rc&lt;RefCell&lt;ListNode&gt;&gt;&gt;</code> ကို သုံးသည်။'),
    },
    floyd: {
      rust: t('LeetCode does not offer Rust on this problem, and its own <code>Option&lt;Box&lt;ListNode&gt;&gt;</code> cannot represent a cycle at all &mdash; a <code>Box</code> owns its successor uniquely. This listing uses <code>Option&lt;Rc&lt;RefCell&lt;ListNode&gt;&gt;&gt;</code> with <code>Rc::ptr_eq</code> for the meeting test.',
              'LeetCode တွင် ဤပုစ္ဆာအတွက် Rust မရှိပါ၊ ၎င်း၏ <code>Option&lt;Box&lt;ListNode&gt;&gt;</code> သည် cycle ကို လုံးဝ မဖော်ပြနိုင်ပါ — <code>Box</code> တစ်ခုသည် ၎င်း၏ နောက် node ကို တစ်ဦးတည်း ပိုင်ဆိုင်သည်။ ဤ listing သည် <code>Option&lt;Rc&lt;RefCell&lt;ListNode&gt;&gt;&gt;</code> နှင့် ဆုံမှု စစ်ရန် <code>Rc::ptr_eq</code> ကို သုံးသည်။'),
    },
  },
  strip,
  stripLabel: t('The list, in index order', 'List — index အစဉ်အတိုင်း'),
  draw,
  answer,
  vars,
  widget: mountHiddenPosWidget,
});
