/* Merge Two Sorted Lists — LeetCode 21.
 *
 * The contrast worth seeing: both approaches make exactly the same sequence of
 * decisions — at every point, take whichever front node is smaller — and differ
 * only in who holds the half-built answer. The loop holds it in a `tail`
 * pointer hanging off a dummy node. The recursion holds it in the call stack,
 * and does not link anything until the calls start returning.
 */
import { mountLesson } from '../../lib/stepper.js';
import { chain, panels } from '../../lib/stage.js';

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

  steps.push(snap({ line: 'dummy', tag: 'sentinel',
    note: 'Start with a node that holds nothing and will never be returned. Its only job is to give the result a <b>last node</b> before the result has any nodes.' }));
  steps.push(snap({ line: 'tail',
    note: '<b>tail</b> always points at the last node of the result. Right now that is the dummy, which is the point: there is no "is this the first node?" case to write.' }));

  while (ai < list1.length && bi < list2.length) {
    steps.push(snap({ line: 'loop', tag: 'both alive',
      note: 'Both lists still have a node, so there is a real choice to make.' }));
    steps.push(snap({ line: 'cmp', tag: 'compare',
      note: `Front of list1 is <b>${list1[ai]}</b>, front of list2 is <b>${list2[bi]}</b>. Only the two fronts matter — everything behind them is larger by assumption.` }));

    if (list1[ai] <= list2[bi]) {
      const note = `${list1[ai]} &le; ${list2[bi]}, so list1's node goes next. No node is created: <b>tail.next</b> is re-pointed at a node that already exists, and list1 steps forward.`;
      out.push(list1[ai]);
      ai++;
      steps.push(snap({ line: 'take1', hot: out.length - 1, tag: 'take list1', note }));
    } else {
      const note = `${list2[bi]} &lt; ${list1[ai]}, so list2's node goes next. Same splice, other side.`;
      out.push(list2[bi]);
      bi++;
      steps.push(snap({ line: 'take2', hot: out.length - 1, tag: 'take list2', note }));
    }

    tailAt = out.length - 1;
    steps.push(snap({ line: 'advance', hot: out.length - 1,
      note: 'tail moves onto the node just appended, so the next append is again "write to tail.next".' }));
  }

  const empty = ai >= list1.length ? 'list1' : 'list2';
  steps.push(snap({ line: 'loop', tag: 'one empty',
    note: `<b>${empty}</b> has no nodes left, so the loop condition fails and the comparing is over.` }));

  let rest = [];
  let restFrom = null;
  if (ai < list1.length) { rest = list1.slice(ai); restFrom = 'list1'; ai = list1.length; }
  else if (bi < list2.length) { rest = list2.slice(bi); restFrom = 'list2'; bi = list2.length; }
  const hotFrom = out.length;
  out.push(...rest);
  steps.push(snap({ line: 'rest', hotFrom, tag: 'splice the tail',
    note: rest.length
      ? `Everything left in <b>${restFrom}</b> is already sorted and is at least as large as everything merged so far, so the remaining ${rest.length === 1 ? 'node attaches' : `${rest.length} nodes attach`} with a single pointer write. No loop needed.`
      : 'Both lists are exhausted, so there is nothing to attach and tail.next stays null.' }));

  steps.push(snap({ line: 'ret', hotFrom: 0, tag: 'return',
    note: `Return <b>dummy.next</b>, not dummy — the sentinel was scaffolding. The merged list is [${out.join(', ')}].` }));

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

  const snap = (extra) => ({ ai, bi, depth, out: out.slice(), ...extra });

  for (;;) {
    if (ai >= list1.length) {
      const rest = list2.slice(bi);
      const hotFrom = out.length;
      out.push(...rest);
      bi = list2.length;
      steps.push(snap({ line: 'base1', hotFrom, tag: 'base case',
        note: rest.length
          ? `Depth ${depth}: list1 is empty. There is nothing left to compare, so the answer to this call is list2 exactly as it stands — ${rest.length} node${rest.length === 1 ? '' : 's'}, returned without touching a single pointer.`
          : `Depth ${depth}: both lists are empty. This call returns null, and that null becomes the end of the merged list.` }));
      break;
    }
    steps.push(snap({ line: 'base1',
      note: `Depth ${depth}: list1 still has a node, so this is not the empty case.` }));

    if (bi >= list2.length) {
      const rest = list1.slice(ai);
      const hotFrom = out.length;
      out.push(...rest);
      ai = list1.length;
      steps.push(snap({ line: 'base2', hotFrom, tag: 'base case',
        note: `Depth ${depth}: list2 is empty, so the rest of list1 is already the answer to this call — ${rest.length} node${rest.length === 1 ? '' : 's'}, returned whole and untouched.` }));
      break;
    }
    steps.push(snap({ line: 'base2',
      note: `Depth ${depth}: list2 still has a node too, so both base cases fall through.` }));

    steps.push(snap({ line: 'cmp', tag: 'compare',
      note: `Comparing <b>${list1[ai]}</b> against <b>${list2[bi]}</b> — the same comparison the loop makes, just one stack frame deeper.` }));

    if (list1[ai] <= list2[bi]) {
      const note = `${list1[ai]} &le; ${list2[bi]}, so list1's node is the head of this call's answer. What follows it is "the merge of everything else", which is what the recursive call is asked for.`;
      frames.push({ depth, from: 1, value: list1[ai] });
      out.push(list1[ai]);
      ai++;
      steps.push(snap({ line: 'rec1', hot: out.length - 1, tag: 'head is list1', note }));
    } else {
      const note = `${list2[bi]} &lt; ${list1[ai]}, so list2's node is the head of this call's answer, and the call below is handed the remainder.`;
      frames.push({ depth, from: 2, value: list2[bi] });
      out.push(list2[bi]);
      bi++;
      steps.push(snap({ line: 'rec2', hot: out.length - 1, tag: 'head is list2', note }));
    }
    depth++;
  }

  // Unwinding. Going down chose the order; coming back up is where the .next
  // assignments actually happen, one per frame, back to front.
  for (let d = frames.length - 1; d >= 0; d--) {
    const f = frames[d];
    depth = f.depth;
    steps.push({ ai, bi, depth, out: out.slice(), line: f.from === 1 ? 'ret1' : 'ret2',
      hotFrom: d, at: d, tag: `return depth ${f.depth}`,
      note: `Depth ${f.depth} gets its answer back and writes it into <b>${f.from === 1 ? 'list1' : 'list2'}.next</b>, then returns <b>${f.value}</b> — now the head of a sorted run of ${out.length - d} node${out.length - d === 1 ? '' : 's'}.` });
  }

  steps.push({ ai, bi, depth: 0, out: out.slice(), line: frames.length === 0 ? 'base1' : (frames[0].from === 1 ? 'ret1' : 'ret2'),
    hotFrom: 0, tag: 'done',
    note: out.length === 0
      ? 'Both lists were empty, so the first call returned null and there was no recursion at all.'
      : `[${out.join(', ')}] — and not one node was allocated to build it. These are the original nodes with their <b>next</b> fields rewritten. What the loop kept in a dummy and a tail pointer, the recursion kept in the call stack instead.` });

  return steps;
}

/* ---------------- drawing ---------------- */

const shade = (n) => Object.fromEntries(Array.from({ length: n }, (_, i) => [i, 'done']));

function draw(s, input) {
  const { list1, list2 } = input;

  const p1 = chain(list1, {
    at: s.ai < list1.length ? s.ai : null,
    marks: s.ai < list1.length ? { [s.ai]: 'list1' } : {},
    tone: shade(s.ai),
    label: 'list1',
  });
  const p2 = chain(list2, {
    at: s.bi < list2.length ? s.bi : null,
    marks: s.bi < list2.length ? { [s.bi]: 'list2' } : {},
    tone: shade(s.bi),
    label: 'list2',
  });

  // The iterative merged chain carries the sentinel at the front so the reader
  // can see that tail always has somewhere to point.
  const off = s.dummy ? 1 : 0;
  const cells = s.dummy ? ['·', ...s.out] : s.out;
  const tone = {};
  const marks = {};
  if (s.dummy) { tone[0] = 'done'; marks[0] = 'dummy'; }

  const from = s.hotFrom != null ? s.hotFrom : s.hot;
  if (from != null) for (let i = from; i < s.out.length; i++) tone[i + off] = 'up';

  if (s.tailAt !== undefined) {
    const t = s.tailAt == null ? 0 : s.tailAt + off;
    marks[t] = marks[t] ? `${marks[t]} · tail` : 'tail';
  }

  const hot = s.hot != null ? s.hot : s.at;
  const p3 = chain(cells, {
    at: hot != null ? hot + off : null,
    marks,
    tone,
    label: s.dummy ? 'merged (dummy in front)' : 'merged',
  });

  return panels(p1, p2) + panels(p3);
}

function vars(s, input) {
  const h1 = s.ai < input.list1.length ? input.list1[s.ai] : 'null';
  const h2 = s.bi < input.list2.length ? input.list2[s.bi] : 'null';
  const merged = s.out.length ? `[${s.out.join(', ')}]` : '[]';
  if (s.tailAt !== undefined) {
    return [['list1', h1], ['list2', h2], ['tail', s.tailAt == null ? 'dummy' : s.out[s.tailAt]], ['merged', merged]];
  }
  return [['list1', h1], ['list2', h2], ['depth', s.depth], ['merged', merged]];
}

/* ---------------- the code, one key per line ---------------- */

const k = (t) => `<span class="k">${t}</span>`;

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

/* ---------------- mount ---------------- */

const parseList = (name) => (v) => {
  const t = v.trim();
  const xs = t === '' ? [] : t.split(',').map((x) => {
    const n = Number(x.trim());
    if (!Number.isInteger(n)) throw new Error('integers only');
    return n;
  });
  if (xs.length > 8) throw new Error('eight nodes is as many as the stage can show');
  for (let i = 1; i < xs.length; i++) {
    if (xs[i] < xs[i - 1]) throw new Error(`${name} must be sorted`);
  }
  return xs;
};

mountLesson({
  root: document.getElementById('lesson'),
  input: { list1: [1, 2, 4], list2: [1, 3, 4] },
  controls: [
    { key: 'list1', label: 'list1 (sorted)', size: 16, value: '1, 2, 4', parse: parseList('list1') },
    { key: 'list2', label: 'list2 (sorted)', size: 16, value: '1, 3, 4', parse: parseList('list2') },
  ],
  modes: [
    { id: 'iterative', name: 'Iterative', blurb: 'Dummy head, splice as you go',
      cost: 'O(n+m) time · O(1) space', build: buildIterative },
    { id: 'recursive', name: 'Recursive', blurb: 'Pick a head, recurse for the rest',
      cost: 'O(n+m) time · O(n+m) stack', build: buildRecursive },
  ],
  languages: [
    { id: 'ruby', name: 'Ruby' }, { id: 'python', name: 'Python' },
    { id: 'javascript', name: 'JavaScript' }, { id: 'go', name: 'Go' }, { id: 'rust', name: 'Rust' },
  ],
  code: CODE,
  // How each language was actually checked. Printed as a badge on every
  // listing in part 3, so a language nothing ran says so on the page.
  verification: {
    ruby: 'run here · 10 fixed + 10,000 random cases',
    python: 'run here · 10 fixed + 10,000 random cases',
    javascript: 'run here · 10 fixed + 10,000 random cases',
    go: 'not compiled — no Go/Rust toolchain, Docker down',
    rust: 'not compiled — no Go/Rust toolchain, Docker down',
  },
  draw,
  vars,
});
