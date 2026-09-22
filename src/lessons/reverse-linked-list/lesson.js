/* Reverse Linked List — LeetCode 206.
 *
 * The contrast worth seeing: both approaches perform exactly the same n link
 * rewrites, and the only real question is where the "where I came from" pointer
 * is kept. The iterative version keeps it in a variable called `prev`. The
 * recursive version keeps it in the call stack — each frame still holds the
 * node it was called with, so on the way back up `head.next` is the tail of the
 * reversed run and the back-pointer is free. That is what the O(n) stack buys.
 *
 * The frame this lesson exists for is the one after `curr.next = prev`. At that
 * instant the list is two separate runs: a reversed prefix and an untouched
 * suffix, and the suffix is reachable only through the variable saved one line
 * earlier. Drawing it as one tidy list would hide the entire problem.
 */
import { mountLesson } from '../../lib/stepper.js';
import { chain, stack, panels } from '../../lib/stage.js';

const show = (v) => (v == null ? 'null' : String(v));

/* ---------------- step generators ---------------- */

/* Every snapshot carries its own copies of the two runs. The algorithm is
 * destructive by nature, so sharing one array between frames would make the
 * whole walkthrough render the finished list. */
function buildIterative({ nums }) {
  const a = nums;
  const n = a.length;
  const steps = [];

  // A snapshot is derived from one number: how many nodes have been rewired.
  // `left` is the reversed run, head-first from prev; `right` is everything
  // still linked the original way, head-first from curr.
  const snap = (i, extra) => ({
    left: a.slice(0, i).reverse(),
    right: a.slice(i),
    leftMarks: {},
    rightMarks: {},
    leftTone: {},
    rightTone: {},
    ...extra,
  });

  steps.push(snap(0, {
    line: 'prev0', prev: null, curr: null, next: null,
    note: `<b>prev</b> is where the reversed part of the list collects. It starts as <b>null</b>, which is not a placeholder — null is exactly what the original head's <code>next</code> has to end up being.`,
  }));

  steps.push(snap(0, {
    line: 'curr0', prev: null, curr: n ? a[0] : null, next: null,
    rightMarks: n ? { 0: 'curr' } : {},
    note: n
      ? `<b>curr</b> walks the original list. Nothing has been rewired yet, so the whole list is still one forward run.`
      : `The list is empty, so <b>curr</b> starts at null and the loop never runs.`,
  }));

  for (let i = 0; i < n; i++) {
    const v = a[i];
    const w = i + 1 < n ? a[i + 1] : null;
    const back = i > 0 ? a[i - 1] : null;

    steps.push(snap(i, {
      line: 'loop', prev: back, curr: v, next: null, tag: 'loop',
      leftMarks: i > 0 ? { 0: 'prev' } : {},
      rightMarks: { 0: 'curr' },
      note: i === 0
        ? `<b>curr</b> is node ${v} and the reversed run is still empty. One node per pass, and the pass has to end with the list in a state the next pass can start from.`
        : `<b>curr</b> is node ${v}. The run on the left is already reversed and ends in null; the run on the right is untouched. ${n - i} node${n - i === 1 ? '' : 's'} left.`,
    }));

    steps.push(snap(i, {
      line: 'save', prev: back, curr: v, next: w, tag: 'save',
      leftMarks: i > 0 ? { 0: 'prev' } : {},
      rightMarks: w != null ? { 0: 'curr', 1: 'next' } : { 0: 'curr' },
      rightTone: w != null ? { 1: 'up' } : {},
      note: w != null
        ? `<b>next = ${w}</b>. This line looks like bookkeeping and is not: <code>curr.next</code> is about to be overwritten, and once it is, node ${w} and everything behind it has no other reference anywhere in the program.`
        : `<b>next = null</b> — node ${v} is the tail, so there is nothing beyond it to save. The line still has to run, because the loop reads <b>next</b> unconditionally.`,
    }));

    // The frame this whole lesson is built around: one assignment moves node v
    // out of the forward run and into the reversed run, and the forward run is
    // now held up by `next` alone.
    steps.push(snap(i + 1, {
      line: 'rev', prev: back, curr: v, next: w, tag: 'rewire',
      leftMarks: i > 0 ? { 0: 'curr', 1: 'prev' } : { 0: 'curr' },
      leftTone: { 0: 'warn' },
      rightMarks: w != null ? { 0: 'next' } : {},
      note: i === 0
        ? `<b>curr.next = prev</b>. Node ${v} was the head of the list and now points at null — it has become the tail of the reversed run. Node ${show(w)} is no longer reachable from the head of anything; the only thing holding it is <b>next</b>.`
        : `<b>curr.next = prev</b>. Node ${v} just changed runs: it now points backwards at ${back}, so the left run grew by one and the right run lost its first node. ${w != null ? `Reaching node ${w} from ${v} is no longer possible — that link is gone.` : `There was nothing after ${v}, so nothing was stranded.`}`,
    }));

    steps.push(snap(i + 1, {
      line: 'advp', prev: v, curr: v, next: w, tag: 'advance',
      leftMarks: { 0: 'prev · curr' },
      rightMarks: w != null ? { 0: 'next' } : {},
      note: `<b>prev = curr</b>. Both name node ${v} for one line. <b>prev</b> has to end up here because the next node rewired will have to point at ${v}.`,
    }));

    steps.push(snap(i + 1, {
      line: 'advc', prev: v, curr: w, next: w, tag: 'advance',
      leftMarks: { 0: 'prev' },
      rightMarks: w != null ? { 0: 'curr · next' } : {},
      note: w != null
        ? `<b>curr = next</b>, the step that spends the value saved two lines ago. The list is now in the same shape the pass started in, one node further along.`
        : `<b>curr = next</b>, which is null. That ends the walk.`,
    }));
  }

  steps.push(snap(n, {
    line: 'loop', prev: n ? a[n - 1] : null, curr: null, next: null, tag: 'done',
    leftMarks: n ? { 0: 'prev' } : {},
    note: n
      ? `<b>curr</b> is null, so every node has been rewired exactly once. The right-hand run is empty because there is nothing left pointing the original way.`
      : `<b>curr</b> was null from the start, so the loop body never ran.`,
  }));

  steps.push(snap(n, {
    line: 'ret', prev: n ? a[n - 1] : null, curr: null, next: null, done: true,
    leftMarks: n ? { 0: 'prev' } : {},
    result: a.slice().reverse(),
    note: n
      ? `Return <b>prev</b>, not <b>curr</b>. <b>curr</b> ran off the end; <b>prev</b> is the last node that existed, which is the old tail and therefore the new head. ${n} link rewrites, three variables, nothing allocated.`
      : `Return <b>prev</b>, which is null — the correct answer for an empty list, and it falls out of the initialisation rather than needing a special case.`,
  }));

  return steps;
}

function buildRecursive({ nums }) {
  const a = nums;
  const n = a.length;
  const steps = [];
  const frames = [];

  const snap = (extra) => ({
    frames: frames.slice(),
    fwd: [],
    rev: [],
    fwdMarks: {},
    revMarks: {},
    fwdTone: {},
    revTone: {},
    fwdNull: true,
    cycleTo: null,
    newHead: null,
    ...extra,
  });

  if (n === 0) {
    frames.push('reverse_list(null)');
    steps.push(snap({
      line: 'base', head: null, headNext: null, tag: 'descend',
      note: `One call, and <b>head</b> is null. The guard catches it before anything dereferences a null pointer.`,
    }));
    steps.push(snap({
      line: 'baseret', head: null, headNext: null, result: [],
      note: `Return <b>head</b>, which is null. An empty list reversed is an empty list, and no frame ever had to do any work.`,
    }));
    return steps;
  }

  /* ---- descent: nothing is modified, the stack just gets deeper ---- */
  for (let i = 0; i < n; i++) {
    frames.push(`reverse_list(${a[i]})`);
    const atTail = i === n - 1;

    steps.push(snap({
      line: 'base', head: a[i], headNext: atTail ? null : a[i + 1], tag: 'descend',
      fwd: a.slice(), fwdMarks: { [i]: 'head' },
      note: atTail
        ? `Depth ${i + 1}. Node ${a[i]} has no <code>next</code>, so this is the tail and the recursion stops here.`
        : `Depth ${i + 1}. Node ${a[i]} still has a <code>next</code>, so this frame cannot answer anything yet.`,
    }));

    if (atTail) {
      // The tail is the first node of the reversed run, so from here on the
      // picture is two runs. With a one-node list those two runs are the same
      // single node, and this frame is already the answer.
      const lone = n === 1;
      steps.push(snap({
        line: 'baseret', head: a[i], headNext: null, newHead: a[i], tag: 'base case',
        fwd: lone ? a.slice() : a.slice(0, n - 1),
        fwdNull: lone,
        fwdMarks: lone ? { 0: 'head' } : {},
        rev: [a[n - 1]], revMarks: { 0: 'new_head · head' }, revTone: { 0: 'up' },
        result: lone ? a.slice() : undefined,
        done: lone,
        note: lone
          ? `The list has one node, so the guard fires on the first call and node ${a[0]} is returned as it is. A one-node list is already its own reversal, and no link is ever written.`
          : `Return node ${a[i]} unchanged. It is a reversed list of one, and it is <b>new_head</b> — every frame below will hand this same node back without touching it again.`,
      }));
      break;
    }

    steps.push(snap({
      line: 'recurse', head: a[i], headNext: a[i + 1], tag: 'descend',
      fwd: a.slice(), fwdMarks: { [i]: 'head' },
      note: `Call into node ${a[i + 1]} and wait. The list is still completely untouched — head recursion does all of its work on the way back up, so the descent is ${n - 1 - i} more call${n - 1 - i === 1 ? '' : 's'} of pure stack.`,
    }));
  }

  /* ---- unwind: each frame rewires one link, deepest first ---- */
  for (let i = n - 2; i >= 0; i--) {
    frames.pop();
    const v = a[i];
    const child = a[i + 1];
    const reversedSoFar = a.slice(i + 1).reverse();      // head-first from new_head
    const withV = [...reversedSoFar, v];

    steps.push(snap({
      line: 'recurse', head: v, headNext: child, newHead: a[n - 1], tag: 'returns',
      fwd: a.slice(0, i + 1), fwdMarks: { [i]: 'head' }, fwdNull: false,
      rev: reversedSoFar,
      revMarks: { 0: 'new_head', [reversedSoFar.length - 1]: 'tail' },
      revTone: { [reversedSoFar.length - 1]: 'up' },
      note: `The call returned ${a[n - 1]} and everything after node ${v} is now reversed. Nothing in that returned run points at node ${v}, but <b>head.next</b> is still node ${child} — and node ${child} is that run's <em>tail</em>. That coincidence is the whole algorithm.`,
    }));

    steps.push(snap({
      line: 'point', head: v, headNext: child, newHead: a[n - 1], tag: 'rewire',
      fwd: a.slice(0, i + 1), fwdMarks: { [i]: 'head' }, fwdTone: { [i]: 'warn' }, fwdNull: false,
      rev: withV, revMarks: { 0: 'new_head', [withV.length - 1]: 'head' },
      revTone: { [withV.length - 1]: 'warn' },
      cycleTo: withV.length - 2,
      note: `<b>head.next.next = head</b> — node ${child} now points at node ${v}. For this one instant the list is genuinely broken: ${v} still points at ${child} and ${child} now points back at ${v}, a two-node loop. Walking the result here would never terminate.`,
    }));

    steps.push(snap({
      line: 'cut', head: v, headNext: null, newHead: a[n - 1], tag: 'rewire',
      fwd: a.slice(0, i + 1), fwdMarks: { [i]: 'head' }, fwdNull: true,
      rev: withV, revMarks: { 0: 'new_head', [withV.length - 1]: 'tail' },
      revTone: { [withV.length - 1]: 'up' },
      note: `<b>head.next = null</b> breaks the loop. Node ${v} is now the tail of the reversed run, exactly the state node ${child} was in when this frame started. ${i > 0 ? `Node ${a[i - 1]} still points forward at ${v}, which is what the frame below will use.` : `Nothing points at ${v} any more except the reversed run.`}`,
    }));

    steps.push(snap({
      line: 'ret', head: v, headNext: null, newHead: a[n - 1], tag: 'return',
      fwd: a.slice(0, i + 1), fwdMarks: { [i]: 'head' }, fwdNull: true,
      rev: withV, revMarks: { 0: 'new_head', [withV.length - 1]: 'tail' },
      result: i === 0 ? a.slice().reverse() : undefined,
      done: i === 0,
      note: i === 0
        ? `Return <b>new_head</b> one last time. Node ${a[n - 1]} was decided at the deepest frame and passed back unchanged through all ${n} of them; every frame rewired exactly one link on its way out.`
        : `Return <b>new_head</b> — still node ${a[n - 1]}, unchanged since the base case. Pop back to depth ${i}.`,
    }));
  }

  return steps;
}

/* ---------------- drawing ---------------- */

function drawIterative(s) {
  const reversed = chain(s.left, {
    label: 'reversed · prev',
    marks: s.leftMarks, tone: s.leftTone, nullTail: s.left.length > 0,
  });
  const rest = chain(s.right, {
    label: 'still pointing forward · curr',
    marks: s.rightMarks, tone: s.rightTone, nullTail: s.right.length > 0,
  });
  return panels(reversed, rest);
}

function drawRecursive(s) {
  const forward = chain(s.fwd, {
    label: 'from the original head',
    marks: s.fwdMarks, tone: s.fwdTone, nullTail: s.fwdNull && s.fwd.length > 0,
  });
  const reversed = s.rev.length
    ? chain(s.rev, {
        label: 'reversed · new_head',
        marks: s.revMarks, tone: s.revTone, cycleTo: s.cycleTo, nullTail: true,
      })
    : '';
  const calls = stack(s.frames, { label: 'call stack' });
  return panels(forward, reversed, calls);
}

function draw(s) {
  return s.frames ? drawRecursive(s) : drawIterative(s);
}

function vars(s) {
  if (s.frames) {
    return [['depth', String(s.frames.length)], ['head', show(s.head)],
            ['head.next', show(s.headNext)], ['new_head', show(s.newHead)]];
  }
  return [['prev', show(s.prev)], ['curr', show(s.curr)], ['next', show(s.next)],
          ['rewired', String(s.left.length)]];
}

/* ---------------- the code, one key per line ---------------- */

const c = (t) => `<span class="c">${t}</span>`;
const k = (t) => `<span class="k">${t}</span>`;

const CODE = {
  iterative: {
    ruby: [
      [null, `${k('def')} reverse_list(head)`],
      ['prev0', `  prev = ${k('nil')}`],
      ['curr0', `  curr = head`],
      ['loop', `  ${k('while')} curr`],
      ['save', `    nxt = curr.next           ${c('# save the way forward')}`],
      ['rev', `    curr.next = prev          ${c('# the destructive step')}`],
      ['advp', `    prev = curr`],
      ['advc', `    curr = nxt`],
      [null, `  ${k('end')}`],
      ['ret', `  prev`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} reverseList(self, head):`],
      ['prev0', `        prev = ${k('None')}`],
      ['curr0', `        curr = head`],
      ['loop', `        ${k('while')} curr:`],
      ['save', `            nxt = curr.next       ${c('# save the way forward')}`],
      ['rev', `            curr.next = prev      ${c('# the destructive step')}`],
      ['advp', `            prev = curr`],
      ['advc', `            curr = nxt`],
      ['ret', `        ${k('return')} prev`],
    ],
    javascript: [
      [null, `${k('var')} reverseList = ${k('function')} (head) {`],
      ['prev0', `  ${k('let')} prev = ${k('null')};`],
      ['curr0', `  ${k('let')} curr = head;`],
      ['loop', `  ${k('while')} (curr !== ${k('null')}) {`],
      ['save', `    ${k('const')} next = curr.next;     ${c('// save the way forward')}`],
      ['rev', `    curr.next = prev;           ${c('// the destructive step')}`],
      ['advp', `    prev = curr;`],
      ['advc', `    curr = next;`],
      [null, `  }`],
      ['ret', `  ${k('return')} prev;`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} reverseList(head *ListNode) *ListNode {`],
      ['prev0', `    ${k('var')} prev *ListNode`],
      ['curr0', `    curr := head`],
      ['loop', `    ${k('for')} curr != ${k('nil')} {`],
      ['save', `        next := curr.Next       ${c('// save the way forward')}`],
      ['rev', `        curr.Next = prev        ${c('// the destructive step')}`],
      ['advp', `        prev = curr`],
      ['advc', `        curr = next`],
      [null, `    }`],
      ['ret', `    ${k('return')} prev`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} reverse_list(head: Option&lt;Box&lt;ListNode&gt;&gt;) -&gt; Option&lt;Box&lt;ListNode&gt;&gt; {`],
      ['prev0', `        ${k('let')} ${k('mut')} prev: Option&lt;Box&lt;ListNode&gt;&gt; = ${k('None')};`],
      ['curr0', `        ${k('let')} ${k('mut')} curr = head;`],
      ['loop', `        ${k('while')} ${k('let')} Some(${k('mut')} node) = curr {`],
      ['save', `            ${k('let')} next = node.next.take();   ${c('// save the way forward')}`],
      ['rev', `            node.next = prev;              ${c('// the destructive step')}`],
      ['advp', `            prev = Some(node);`],
      ['advc', `            curr = next;`],
      [null, `        }`],
      ['ret', `        prev`],
      [null, `    }`],
      [null, `}`],
    ],
  },
  recursive: {
    ruby: [
      [null, `${k('def')} reverse_list(head)`],
      ['base', `  ${k('if')} head.${k('nil?')} || head.next.${k('nil?')}`],
      ['baseret', `    ${k('return')} head`],
      [null, `  ${k('end')}`],
      ['recurse', `  new_head = reverse_list(head.next)`],
      ['point', `  head.next.next = head`],
      ['cut', `  head.next = ${k('nil')}`],
      ['ret', `  new_head`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} reverseList(self, head):`],
      ['base', `        ${k('if')} head ${k('is')} ${k('None')} ${k('or')} head.next ${k('is')} ${k('None')}:`],
      ['baseret', `            ${k('return')} head`],
      ['recurse', `        new_head = self.reverseList(head.next)`],
      ['point', `        head.next.next = head`],
      ['cut', `        head.next = ${k('None')}`],
      ['ret', `        ${k('return')} new_head`],
    ],
    javascript: [
      [null, `${k('var')} reverseList = ${k('function')} (head) {`],
      ['base', `  ${k('if')} (head === ${k('null')} || head.next === ${k('null')}) {`],
      ['baseret', `    ${k('return')} head;`],
      [null, `  }`],
      ['recurse', `  ${k('const')} newHead = reverseList(head.next);`],
      ['point', `  head.next.next = head;`],
      ['cut', `  head.next = ${k('null')};`],
      ['ret', `  ${k('return')} newHead;`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} reverseList(head *ListNode) *ListNode {`],
      ['base', `    ${k('if')} head == ${k('nil')} || head.Next == ${k('nil')} {`],
      ['baseret', `        ${k('return')} head`],
      [null, `    }`],
      ['recurse', `    newHead := reverseList(head.Next)`],
      ['point', `    head.Next.Next = head`],
      ['cut', `    head.Next = ${k('nil')}`],
      ['ret', `    ${k('return')} newHead`],
      [null, `}`],
    ],
    // Safe Rust owns each node through its predecessor's Box, so a frame cannot
    // keep a usable back-pointer into a list it has already handed downward.
    // The recursion carries `prev` as an argument instead; the rewiring happens
    // on the way down, and the base case returns the finished list.
    rust: [
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} reverse_list(head: Option&lt;Box&lt;ListNode&gt;&gt;) -&gt; Option&lt;Box&lt;ListNode&gt;&gt; {`],
      ['ret', `        Self::rev(head, ${k('None')})`],
      [null, `    }`],
      [null, ``],
      [null, `    ${k('fn')} rev(curr: Option&lt;Box&lt;ListNode&gt;&gt;, prev: Option&lt;Box&lt;ListNode&gt;&gt;) -&gt; Option&lt;Box&lt;ListNode&gt;&gt; {`],
      ['base', `        ${k('let')} ${k('mut')} node = ${k('match')} curr {`],
      ['baseret', `            ${k('None')} =&gt; ${k('return')} prev,`],
      [null, `            Some(n) =&gt; n,`],
      [null, `        };`],
      ['cut', `        ${k('let')} next = node.next.take();`],
      ['point', `        node.next = prev;`],
      ['recurse', `        Self::rev(next, Some(node))`],
      [null, `    }`],
      [null, `}`],
    ],
  },
};

/* ---------------- mount ---------------- */

mountLesson({
  root: document.getElementById('lesson'),
  input: { nums: [1, 2, 3, 4, 5] },
  controls: [
    { key: 'nums', label: 'list', size: 24, value: '1, 2, 3, 4, 5',
      parse: (v) => {
        const t = v.trim();
        if (!t) return [];
        // Number('') is 0, so a blank segment would quietly become a node.
        const parts = t.split(',').map((x) => x.trim());
        if (parts.some((x) => x === '')) throw new Error('numbers separated by commas');
        const a = parts.map(Number);
        if (a.some((x) => !Number.isFinite(x))) throw new Error('numbers separated by commas');
        return a.slice(0, 12);
      } },
  ],
  modes: [
    { id: 'iterative', name: 'Iterative', blurb: 'Three pointers, one link per step',
      cost: 'O(n) time · O(1) space', build: buildIterative },
    { id: 'recursive', name: 'Recursive', blurb: 'Descend to the tail, rewire on the way back',
      cost: 'O(n) time · O(n) stack', build: buildRecursive },
  ],
  languages: [
    { id: 'ruby', name: 'Ruby' }, { id: 'python', name: 'Python' },
    { id: 'javascript', name: 'JavaScript' }, { id: 'go', name: 'Go' }, { id: 'rust', name: 'Rust' },
  ],
  code: CODE,
  // How each language was actually checked. Printed as a badge on every
  // listing in part 3, so a language nothing ran says so on the page.
  verification: {
    ruby: 'run here · 5 examples + 10,000 random cases',
    python: 'run here · 5 examples + 10,000 random cases',
    javascript: 'run here · 5 examples + 10,000 random cases',
    go: 'not compiled — no Go/Rust toolchain, Docker down',
    rust: 'not compiled — no Go/Rust toolchain, Docker down',
  },
  caveats: {
    recursive: {
      rust: 'Safe Rust owns each node through its predecessor&rsquo;s <code>Box</code>, so a frame cannot hold a usable back-pointer into a list it has already handed to the recursive call. The head-recursive relink-on-unwind form the narration describes is not expressible in safe <code>O(n)</code> Rust, so this listing carries <code>prev</code> down as an argument instead. It is a correct reversal, but its lines run in a different order than the steps describe.',
    },
  },
  draw,
  vars,
});
