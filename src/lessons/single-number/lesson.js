/* Single Number — LeetCode 136.
 *
 * The contrast worth seeing is not time — both approaches read the array once.
 * It is space. The tally keeps a row per distinct value, so the memory it needs
 * grows with the input; the XOR fold keeps one integer no matter how long the
 * array is, which is the only thing that satisfies the constant-space clause in
 * the statement. Watch the bits and the cancellation is visible: a value's
 * 1-bits flip those columns of the accumulator, and the second copy of that
 * value flips them straight back.
 */
import { mountLesson } from '../../lib/stepper.js';
import { strip, kv, panels } from '../../lib/stage.js';

/* Eight columns is enough to see a pattern and small enough to read, so the
 * input control holds values to 0..255. The solutions below are not limited
 * that way — XOR on negatives works fine in two's complement — but a stage
 * showing 32 columns teaches nothing. */
const BITS = 8;
const MAXV = (1 << BITS) - 1;

const bitsOf = (v) => Array.from({ length: BITS }, (_, i) => String((v >> (BITS - 1 - i)) & 1));

/* Columns the incoming value will act on: the ones where it holds a 1. */
const onesTone = (v) => {
  const t = {};
  bitsOf(v).forEach((b, i) => { if (b === '1') t[i] = 'warn'; });
  return t;
};

/* Columns that actually changed between two accumulator states. */
const flipTone = (before, after) => {
  const a = bitsOf(before);
  const b = bitsOf(after);
  const t = {};
  b.forEach((bit, i) => { if (bit !== a[i]) t[i] = 'up'; });
  return t;
};

/* The premise is load-bearing: both approaches return nonsense on an array that
 * breaks it, so refuse the input instead. Returns the value that stands alone. */
function loneValue(nums) {
  if (!Array.isArray(nums) || !nums.length) throw new Error('nums needs at least one value');
  const counts = new Map();
  for (const v of nums) counts.set(v, (counts.get(v) ?? 0) + 1);

  const overcounted = [...counts].find(([, c]) => c > 2);
  if (overcounted) throw new Error(`${overcounted[0]} appears ${overcounted[1]} times — values may appear at most twice`);

  const alone = [...counts].filter(([, c]) => c === 1).map(([v]) => v);
  if (!alone.length) throw new Error('every value is paired — exactly one has to stand alone');
  if (alone.length > 1) throw new Error(`${alone.join(' and ')} each appear once — only one value may`);
  return alone[0];
}

/* ---------------- step generators ---------------- */

function buildCount({ nums }) {
  const answer = loneValue(nums);
  /* The premise forces an odd length, and exactly (n + 1) / 2 distinct values. */
  const distinct = (nums.length + 1) / 2;
  const steps = [];
  const counts = {};
  const firstSeen = new Map();

  steps.push({ line: 'init', i: null, counts: {}, answer: null,
    note: `A tally keyed by value. This is the version to reach for first — it is obvious, it is hard to get wrong, and it answers a whole family of questions, not just this one.` });

  for (let i = 0; i < nums.length; i++) {
    const v = nums[i];
    steps.push({ line: 'loop', i, counts: { ...counts }, answer: null, tag: 'read',
      note: `Index ${i} holds <b>${v}</b>.` });

    const seenBefore = firstSeen.has(v);
    counts[v] = (counts[v] ?? 0) + 1;
    if (!seenBefore) firstSeen.set(v, i);

    const rows = Object.keys(counts).length;
    steps.push({ line: 'tally', i, counts: { ...counts }, bump: String(v), answer: null, tag: 'tally',
      note: seenBefore
        ? `<b>${v}</b> was already recorded at index ${firstSeen.get(v)}, so its count goes to 2. The row stays either way — a pair proves nothing until every value has been read.`
        : i === 0
          ? `<b>${v}</b> is new, so the table grows a row. A valid input of ${nums.length} values holds ${distinct} distinct ones, so this table is heading for ${distinct} rows — that is the memory the statement will not let us spend.`
          : `<b>${v}</b> is new: row ${rows} of the ${distinct} this input will need.` });
  }

  const keys = Object.keys(counts);
  for (const [n, key] of keys.entries()) {
    const c = counts[key];
    steps.push({ line: 'scan', i: null, counts: { ...counts }, look: key, answer: null, tag: 'scan',
      note: n === 0
        ? `The array is read and nothing has been answered yet — a second pass over the ${keys.length} rows has to do it, starting at <b>${key}</b>. The order rows come back in is language-dependent (Go deliberately randomises it) and it does not matter here, since exactly one row holds a 1.`
        : `Next row: <b>${key}</b>.` });

    if (c !== 1) {
      steps.push({ line: 'check', i: null, counts: { ...counts }, look: key, reject: key, answer: null, tag: 'paired',
        note: `<b>${key}</b> was seen ${c} times, so its partner is in the array. Keep looking.` });
      continue;
    }
    steps.push({ line: 'check', i: null, counts: { ...counts }, look: key, answer: null, tag: 'alone',
      note: `<b>${key}</b> was read exactly once out of ${nums.length} values. That is the one.` });
    steps.push({ line: 'hit', i: null, counts: { ...counts }, look: key, hit: key, answer, done: true, tag: 'return',
      note: `Return <b>${answer}</b>. Linear in time and correct — and out of contention anyway: the table grew to ${keys.length} rows where the statement asks for constant extra space.` });
    return steps;
  }

  return steps;
}

function buildXor({ nums }) {
  const answer = loneValue(nums);
  const steps = [];
  const firstSeen = new Map();
  let acc = 0;

  steps.push({ line: 'init', i: null, acc: 0, answer: null,
    note: `<b>acc</b> starts at 0, which is XOR's identity — <code>x ^ 0 == x</code> — so an empty fold changes nothing and every column below starts clear. One integer is the entire working memory.` });

  for (let i = 0; i < nums.length; i++) {
    const v = nums[i];
    const before = acc;
    const after = before ^ v;
    const marked = bitsOf(v).filter((b) => b === '1').length;

    const seenBefore = firstSeen.has(v);
    steps.push({ line: 'loop', i, acc: before, accBefore: before, value: v, folded: false, answer: null, tag: 'read',
      note: i === 0
        ? `Index 0 holds <b>${v}</b>. The columns where ${v} has a 1 are exactly the columns of <b>acc</b> that will flip; every other column is left alone.`
        : seenBefore
          ? `Index ${i} holds <b>${v}</b> — its second copy.`
          : `Index ${i} holds <b>${v}</b>.` });
    steps.push({ line: 'fold', i, acc: after, accBefore: before, value: v, folded: true, answer: null, tag: 'xor',
      note: seenBefore
        ? `<b>${v}</b> went in at index ${firstSeen.get(v)}, and <code>x ^ x == 0</code>, so the columns it flipped then flip back now. <b>acc</b> is ${after}; no trace of ${v} is left in it.`
        : i === 0
          ? `<b>acc</b> was 0, so it is now ${v} itself — that is <code>x ^ 0 == x</code>.`
          : `The first <b>${v}</b>, so nothing cancels: ${marked === 1 ? 'its one set column flips' : `its ${marked} set columns flip`}, and <b>acc</b> is ${after}.` });

    if (!seenBefore) firstSeen.set(v, i);
    acc = after;
  }

  steps.push({ line: 'ret', i: null, acc, answer, done: true, tag: 'return',
    note: `Return <b>${answer}</b>. Every column was flipped once per occurrence, so a column survives only if some value set it an odd number of times — and only <b>${answer}</b> occurred an odd number of times. Two locals, no table.` });

  return steps;
}

/* ---------------- drawing ---------------- */

/* Three bit rows stacked rather than side by side: the point is that column 3
 * of one row lines up with column 3 of the next, which is where the reader can
 * see a pair cancel. */
function bitStack(s) {
  if (s.value == null) {
    return `<div class="st-box">${strip(bitsOf(s.acc), {
      index: false, tone: s.done ? onesTone(s.acc) : {}, label: `acc = ${s.acc}`,
    })}</div>`;
  }
  const pending = strip(Array(BITS).fill('·'), { index: false, label: 'acc ^ nums[i] = ?' });
  const result = strip(bitsOf(s.acc), {
    index: false, tone: flipTone(s.accBefore, s.acc), label: `acc ^ nums[${s.i}] = ${s.acc}`,
  });
  return `<div class="st-box">
    ${strip(bitsOf(s.accBefore), { index: false, label: `acc = ${s.accBefore}` })}
    ${strip(bitsOf(s.value), { index: false, tone: onesTone(s.value), label: `nums[${s.i}] = ${s.value}` })}
    ${s.folded ? result : pending}
  </div>`;
}

function draw(s, input) {
  const { nums } = input;
  const marks = {};
  const tone = {};
  if (s.i != null) marks[s.i] = '↑ i';
  if (s.done) {
    const at = nums.indexOf(s.answer);
    tone[at] = 'up';
    marks[at] = 'alone';
  }

  const arr = strip(nums, { at: s.i, marks, tone, label: 'nums' });

  if (s.counts !== undefined) {
    const kvTone = {};
    if (s.hit) kvTone[s.hit] = 'up';
    else if (s.reject) kvTone[s.reject] = 'warn';
    else if (s.bump) kvTone[s.bump] = 'warn';
    return panels(
      arr,
      kv(s.counts, { at: s.look ?? null, tone: kvTone, label: 'counts', keyName: 'value', valName: 'seen' }),
    );
  }

  return panels(arr) + bitStack(s);
}

function vars(s, input) {
  if (s.counts !== undefined) {
    return [['i', s.i ?? '—'], ['nums[i]', s.i == null ? '—' : input.nums[s.i]],
            ['rows', Object.keys(s.counts).length], ['answer', s.answer ?? '—']];
  }
  return [['i', s.i ?? '—'], ['nums[i]', s.value ?? '—'],
          ['acc', s.acc], ['acc (binary)', bitsOf(s.acc).join('')], ['answer', s.answer ?? '—']];
}

/* ---------------- the code, one key per line ---------------- */

const c = (t) => `<span class="c">${t}</span>`;
const k = (t) => `<span class="k">${t}</span>`;

const CODE = {
  count: {
    ruby: [
      [null, `${k('def')} single_number(nums)`],
      ['init', `  counts = Hash.new(0)              ${c('# value => times seen')}`],
      ['loop', `  nums.each ${k('do')} |v|`],
      ['tally', `    counts[v] += 1`],
      [null, `  ${k('end')}`],
      ['scan', `  counts.each ${k('do')} |value, seen|`],
      ['check', `    ${k('next')} ${k('unless')} seen == 1`],
      ['hit', `    ${k('return')} value`],
      [null, `  ${k('end')}`],
      [null, `  0                                 ${c('# unreachable: the premise guarantees one')}`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} singleNumber(self, nums):`],
      ['init', `        counts = {}                   ${c('# value -> times seen')}`],
      ['loop', `        ${k('for')} v ${k('in')} nums:`],
      ['tally', `            counts[v] = counts.get(v, 0) + 1`],
      ['scan', `        ${k('for')} value, seen ${k('in')} counts.items():`],
      ['check', `            ${k('if')} seen != 1:`],
      [null, `                ${k('continue')}`],
      ['hit', `            ${k('return')} value`],
      [null, `        ${k('return')} 0                  ${c('# unreachable')}`],
    ],
    javascript: [
      [null, `${k('const')} singleNumber = ${k('function')} (nums) {`],
      ['init', `  ${k('const')} counts = ${k('new')} Map();         ${c('// value -> times seen')}`],
      ['loop', `  ${k('for')} (${k('const')} v ${k('of')} nums) {`],
      ['tally', `    counts.set(v, (counts.get(v) ?? 0) + 1);`],
      [null, `  }`],
      ['scan', `  ${k('for')} (${k('const')} [value, seen] ${k('of')} counts) {`],
      ['check', `    ${k('if')} (seen !== 1) ${k('continue')};`],
      ['hit', `    ${k('return')} value;`],
      [null, `  }`],
      [null, `  ${k('return')} 0;                        ${c('// unreachable')}`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} singleNumber(nums []${k('int')}) ${k('int')} {`],
      ['init', `    counts := ${k('make')}(${k('map')}[${k('int')}]${k('int')})       ${c('// value -> times seen')}`],
      ['loop', `    ${k('for')} _, v := ${k('range')} nums {`],
      ['tally', `        counts[v]++`],
      [null, `    }`],
      ['scan', `    ${k('for')} value, seen := ${k('range')} counts {`],
      ['check', `        ${k('if')} seen != 1 {`],
      [null, `            ${k('continue')}`],
      [null, `        }`],
      ['hit', `        ${k('return')} value`],
      [null, `    }`],
      [null, `    ${k('return')} 0                       ${c('// unreachable')}`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('use')} std::collections::HashMap;`],
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} single_number(nums: Vec&lt;i32&gt;) -&gt; i32 {`],
      ['init', `        ${k('let')} ${k('mut')} counts: HashMap&lt;i32, i32&gt; = HashMap::new();`],
      ['loop', `        ${k('for')} &amp;v ${k('in')} nums.iter() {`],
      ['tally', `            *counts.entry(v).or_insert(0) += 1;`],
      [null, `        }`],
      ['scan', `        ${k('for')} (&amp;value, &amp;seen) ${k('in')} counts.iter() {`],
      ['check', `            ${k('if')} seen != 1 { ${k('continue')}; }`],
      ['hit', `            ${k('return')} value;`],
      [null, `        }`],
      [null, `        0                             ${c('// unreachable')}`],
      [null, `    }`],
      [null, `}`],
    ],
  },
  xor: {
    ruby: [
      [null, `${k('def')} single_number(nums)`],
      ['init', `  acc = 0                           ${c('# 0 is the identity: x ^ 0 == x')}`],
      ['loop', `  nums.each ${k('do')} |v|`],
      ['fold', `    acc ^= v`],
      [null, `  ${k('end')}`],
      ['ret', `  acc`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} singleNumber(self, nums):`],
      ['init', `        acc = 0                       ${c('# 0 is the identity: x ^ 0 == x')}`],
      ['loop', `        ${k('for')} v ${k('in')} nums:`],
      ['fold', `            acc ^= v`],
      ['ret', `        ${k('return')} acc`],
    ],
    javascript: [
      [null, `${k('const')} singleNumber = ${k('function')} (nums) {`],
      ['init', `  ${k('let')} acc = 0;                    ${c('// 0 is the identity: x ^ 0 === x')}`],
      ['loop', `  ${k('for')} (${k('const')} v ${k('of')} nums) {`],
      ['fold', `    acc ^= v;`],
      [null, `  }`],
      ['ret', `  ${k('return')} acc;`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} singleNumber(nums []${k('int')}) ${k('int')} {`],
      ['init', `    acc := 0                          ${c('// 0 is the identity: x ^ 0 == x')}`],
      ['loop', `    ${k('for')} _, v := ${k('range')} nums {`],
      ['fold', `        acc ^= v`],
      [null, `    }`],
      ['ret', `    ${k('return')} acc`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} single_number(nums: Vec&lt;i32&gt;) -&gt; i32 {`],
      ['init', `        ${k('let')} ${k('mut')} acc = 0;             ${c('// 0 is the identity: x ^ 0 == x')}`],
      ['loop', `        ${k('for')} &amp;v ${k('in')} nums.iter() {`],
      ['fold', `            acc ^= v;`],
      [null, `        }`],
      ['ret', `        acc`],
      [null, `    }`],
      [null, `}`],
    ],
  },
};

/* ---------------- mount ---------------- */

mountLesson({
  root: document.getElementById('lesson'),
  input: { nums: [4, 1, 2, 1, 2] },
  controls: [
    { key: 'nums', label: 'nums', size: 26, value: '4, 1, 2, 1, 2',
      parse: (v) => {
        const parts = v.split(',').map((x) => x.trim());
        if (parts.some((p) => p === '')) throw new Error('a value is missing');
        const nums = parts.map(Number);
        if (!nums.every(Number.isInteger)) throw new Error('whole numbers only');
        if (nums.some((x) => x < 0 || x > MAXV)) throw new Error(`keep values 0..${MAXV} so ${BITS} bits stay readable`);
        if (nums.length > 13) throw new Error('at most 13 values — trimming one would break the pairing');
        loneValue(nums);
        return nums;
      } },
  ],
  modes: [
    { id: 'count', name: 'Count them', blurb: 'Tally, then find the 1', cost: 'O(n) time · O(n) space', build: buildCount },
    { id: 'xor', name: 'XOR fold', blurb: 'Pairs cancel, the loner stays', cost: 'O(n) time · O(1) space', build: buildXor },
  ],
  languages: [
    { id: 'ruby', name: 'Ruby' }, { id: 'python', name: 'Python' },
    { id: 'javascript', name: 'JavaScript' }, { id: 'go', name: 'Go' }, { id: 'rust', name: 'Rust' },
  ],
  code: CODE,
  // How each language was actually checked. Printed as a badge on every
  // listing in part 3, so a language nothing ran says so on the page.
  verification: {
    ruby: 'run here · 10,007-case shared corpus',
    python: 'run here · 10,007-case shared corpus',
    javascript: 'run here · 10,007-case shared corpus',
    go: 'not compiled — no Go/Rust toolchain, Docker down',
    rust: 'not compiled — no Go/Rust toolchain, Docker down',
  },
  draw,
  vars,
});
