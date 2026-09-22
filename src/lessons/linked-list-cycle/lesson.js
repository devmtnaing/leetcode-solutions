/* Linked List Cycle — LeetCode 141.
 *
 * The contrast worth seeing is space, not time. Both approaches walk the list
 * once in O(n); the difference is that one of them writes down every node it
 * passes and the other writes down nothing at all. Watching the visited set
 * grow next to two pointers that never grow is the whole lesson.
 */
import { mountLesson } from '../../lib/stepper.js';
import { chain, kv, panels } from '../../lib/stage.js';

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
    note: 'A set of <b>nodes</b>, not of values — two different nodes can hold the same number, and here it is the node that has to be recognised.' });

  let cur = n ? 0 : null;
  // A buggy walk round a cycle never ends. n + 3 visits is more than any
  // correct walk needs, so overrunning it is a bug worth throwing on rather
  // than a page that hangs.
  for (let guard = 0; guard <= n + 3; guard++) {
    if (cur === null) {
      steps.push({ line: 'none', cur: null, seen: seen.slice(), verdict: false, tag: 'no cycle',
        note: `The walk reached <b>null</b>, so the list has an end and cannot loop. Return false — at the cost of having held ${seen.length} node reference${seen.length === 1 ? '' : 's'}.` });
      return steps;
    }

    steps.push({ line: 'loop', cur, seen: seen.slice(), tag: 'visit',
      note: `Standing on index <b>${cur}</b>, value ${values[cur]}.` });
    steps.push({ line: 'check', cur, seen: seen.slice(), tag: 'lookup',
      note: 'Is this node already in the set?' });

    if (seen.includes(cur)) {
      steps.push({ line: 'hit', cur, seen: seen.slice(), repeat: cur, verdict: true, tag: 'cycle',
        note: `It is — index <b>${cur}</b> was recorded earlier in this same walk. Arriving anywhere twice means the links loop, so return true.` });
      return steps;
    }

    seen.push(cur);
    steps.push({ line: 'store', cur, seen: seen.slice(), added: cur, tag: 'record',
      note: `Not seen before. Record it; the set is now holding <b>${seen.length}</b> node${seen.length === 1 ? '' : 's'}.` });

    const nx = nextOf(cur, n, pos);
    steps.push({ line: 'adv', cur: nx, from: cur, seen: seen.slice(), tag: 'step',
      note: nx === null
        ? `The next pointer of index ${cur} is null. Follow it anyway and the loop condition will end the walk.`
        : `Follow the link from index ${cur} to index <b>${nx}</b>, value ${values[nx]}.` });
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
      ? 'Both pointers start on the head. Nothing else is stored — these two references are the entire memory cost.'
      : 'The list is empty, so both pointers start at null.' });

  // Slow visits at most n + 1 distinct positions before the two pointers meet,
  // so a correct run cannot need more rounds than that. Anything beyond it is
  // a generator bug, and throwing beats spinning.
  for (let round = 0; round <= n + 2; round++) {
    const oneAhead = fast === null ? null : nextOf(fast, n, pos);
    steps.push({ line: 'loop', slow, fast, floyd: true, tag: 'guard',
      note: fast === null
        ? 'fast is at null, so there is nothing left to step onto.'
        : oneAhead === null
          ? `fast is at index ${fast} and its next pointer is null, so it cannot take two steps.`
          : `fast is at index ${fast} and has a node after it, so a two-step move is safe.` });

    if (fast === null || oneAhead === null) {
      steps.push({ line: 'none', slow, fast, floyd: true, verdict: false, tag: 'no cycle',
        note: n === 0
          ? 'There is no list to walk, so there is nothing to loop. Return false.'
          : `fast has run out of list — ${fast === null ? 'it is sitting on null' : `index ${fast} is the last node`}. Only a list with an end can stop it, so there is no cycle. Return false.` });
      return steps;
    }

    const slowFrom = slow;
    slow = nextOf(slow, n, pos);
    steps.push({ line: 'slow', slow, fast, floyd: true, tag: 'slow',
      note: `slow takes one step: index ${slowFrom} → <b>${slow}</b>, value ${values[slow]}.` });

    const fastFrom = fast;
    fast = nextOf(oneAhead, n, pos);
    const gap = gapOf(slow, fast, n, pos);
    steps.push({ line: 'fast', slow, fast, gap, floyd: true, tag: 'fast',
      note: `fast takes two steps: index ${fastFrom} → ${oneAhead} → <b>${fast === null ? 'null' : fast}</b>.`
        + (gap != null && gap > 0
          ? ` Both pointers are inside the loop now, and fast still has <b>${gap}</b> step${gap === 1 ? '' : 's'} to go to reach slow.`
          : '') });

    steps.push({ line: 'check', slow, fast, gap, floyd: true, tag: 'compare',
      note: slow === fast
        ? 'Same node?'
        : `Same node? Not yet — slow is at ${slow}, fast at ${fast === null ? 'null' : fast}.` });

    if (slow === fast) {
      steps.push({ line: 'hit', slow, fast, met: slow, gap, floyd: true, verdict: true, tag: 'cycle',
        note: `They have collided at index <b>${slow}</b>, value ${values[slow]}. Two pointers at different speeds can only land on the same node if the path loops back, so return true.` });
      return steps;
    }
  }
  throw new Error('the two pointers never terminated');
}

/* ---------------- drawing ---------------- */

function draw(s, input) {
  const { values, pos } = input;
  const nodes = values.map((v) => ({ value: v }));
  const marks = {};
  const tone = {};
  const label = pos >= 0
    ? `list — index 0 on the left, tail links back to index ${pos}`
    : 'list — index 0 on the left';

  if (Array.isArray(s.seen)) {
    for (const i of s.seen) tone[i] = 'done';
    if (s.added != null) tone[s.added] = 'warn';
    if (s.repeat != null) tone[s.repeat] = 'up';
    if (s.cur != null) marks[s.cur] = '↑ node';

    const table = {};
    for (const i of s.seen) table[i] = values[i];

    return panels(
      chain(nodes, { at: s.repeat != null ? null : s.cur, marks, tone, cycleTo: pos >= 0 ? pos : null, label }),
      kv(table, {
        at: s.repeat != null ? String(s.repeat) : null,
        tone: s.repeat != null ? { [s.repeat]: 'up' } : s.added != null ? { [s.added]: 'warn' } : {},
        label: 'seen', keyName: 'index', valName: 'value',
      }),
    );
  }

  // Floyd: both pointers get a flag on every frame, so the gap between them is
  // readable without scrubbing back a step.
  if (s.slow != null) marks[s.slow] = 'slow';
  if (s.fast != null) marks[s.fast] = marks[s.fast] ? 'slow·fast' : 'fast';
  if (s.fast != null && s.fast !== s.slow) tone[s.fast] = 'warn';
  if (s.met != null) tone[s.met] = 'up';

  return chain(nodes, {
    at: s.met != null ? null : s.slow,
    marks, tone, cycleTo: pos >= 0 ? pos : null, label,
  });
}

function vars(s) {
  const answer = s.verdict === undefined ? '—' : String(s.verdict);
  if (Array.isArray(s.seen)) {
    return [['node', s.cur == null ? 'null' : s.cur], ['nodes stored', s.seen.length],
            ['extra space', `${s.seen.length} refs`], ['answer', answer]];
  }
  if (!s.floyd) return [['answer', answer]];
  return [['slow', s.slow == null ? 'null' : s.slow], ['fast', s.fast == null ? 'null' : s.fast],
          ['gap to close', s.gap == null ? '—' : s.gap], ['extra space', '2 refs'],
          ['answer', answer]];
}

/* ---------------- the code, one key per line ---------------- */

const c = (t) => `<span class="c">${t}</span>`;
const k = (t) => `<span class="k">${t}</span>`;

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

/* ---------------- mount ---------------- */

mountLesson({
  root: document.getElementById('lesson'),
  input: { values: [3, 2, 0, -4], pos: 1 },
  controls: [
    { key: 'values', label: 'values', size: 18, value: '3, 2, 0, -4',
      parse: (v) => {
        if (!v.trim()) return [];             // an empty list is a legal input
        const parts = v.split(',').map((x) => x.trim());
        if (parts.some((x) => x === '')) throw new Error('a value is missing');
        const a = parts.map(Number);
        if (a.some(Number.isNaN)) throw new Error('numbers only');
        return a.slice(0, 12);
      } },
    { key: 'pos', label: 'pos (-1 for no cycle)', type: 'number', value: 1, min: -1,
      parse: (v) => {
        const p = Number(v);
        if (!v.trim() || !Number.isInteger(p)) throw new Error('whole number');
        return p;
      } },
  ],
  modes: [
    { id: 'seen', name: 'Remember every node', blurb: 'A repeat means a loop',
      cost: 'O(n) time · O(n) space', build: buildSeen },
    { id: 'floyd', name: "Floyd's two pointers", blurb: 'One step against two',
      cost: 'O(n) time · O(1) space', build: buildFloyd },
  ],
  languages: [
    { id: 'ruby', name: 'Ruby' }, { id: 'python', name: 'Python' },
    { id: 'javascript', name: 'JavaScript' }, { id: 'go', name: 'Go' }, { id: 'rust', name: 'Rust' },
  ],
  code: CODE,
  caveats: {
    seen: {
      rust: 'LeetCode does not offer Rust on this problem, and its own <code>Option&lt;Box&lt;ListNode&gt;&gt;</code> cannot represent a cycle at all &mdash; a <code>Box</code> owns its successor uniquely. This listing uses <code>Option&lt;Rc&lt;RefCell&lt;ListNode&gt;&gt;&gt;</code>, which a reader can follow without <code>unsafe</code>.',
    },
    floyd: {
      rust: 'LeetCode does not offer Rust on this problem, and its own <code>Option&lt;Box&lt;ListNode&gt;&gt;</code> cannot represent a cycle at all &mdash; a <code>Box</code> owns its successor uniquely. This listing uses <code>Option&lt;Rc&lt;RefCell&lt;ListNode&gt;&gt;&gt;</code> with <code>Rc::ptr_eq</code> for the meeting test.',
    },
  },
  draw,
  vars,
});
