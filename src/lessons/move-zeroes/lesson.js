/* Move Zeroes — LeetCode 283.
 *
 * The contrast worth seeing: the copy builds the answer somewhere else and then
 * pastes it back, so the array is wrong right up until the final pass. The two
 * pointers keep one invariant true the whole way through — everything left of
 * `slow` is already where it belongs — so the array is partially correct at
 * every single step, and no second array is ever allocated.
 */
import { mountLesson } from '../../lib/stepper.js';
import { strip, panels } from '../../lib/stage.js';

/* ---------------- step generators ---------------- */

/* Each snapshot carries its own copy of the array. Sharing one mutable array
 * across snapshots would leave every frame showing the finished state, which is
 * exactly the thing this lesson is trying to show happening. */
function buildCopy({ nums }) {
  const steps = [];
  const n = nums.length;
  const arr = nums.slice();
  const kept = [];

  steps.push({ line: 'init', arr: arr.slice(), kept: [], fast: null, write: null,
    note: `A second array to collect the non-zero values in the order they appear. That array is the <b>O(n)</b> of extra space this approach spends, and the reason it does not really answer the question asked.` });

  for (let fast = 0; fast < n; fast++) {
    const value = arr[fast];
    steps.push({ line: 'loop', arr: arr.slice(), kept: kept.slice(), fast, tag: 'read',
      note: fast === 0
        ? `Reading <b>nums[0] = ${value}</b>. Note that <code>nums</code> stays untouched through this whole pass — the answer is being assembled elsewhere.`
        : `Reading <b>nums[${fast}] = ${value}</b>.` });

    if (value !== 0) {
      kept.push(value);
      steps.push({ line: 'keep', arr: arr.slice(), kept: kept.slice(), fast, keepAt: kept.length - 1, tag: 'keep',
        note: kept.length === 1
          ? `Non-zero, so it is appended to <b>kept</b>. Appending in scan order is the only thing keeping the relative order intact.`
          : `Non-zero: <b>${value}</b> takes position ${kept.length - 1} in <b>kept</b>, behind everything found before it.` });
    } else {
      steps.push({ line: 'keep', arr: arr.slice(), kept: kept.slice(), fast, skip: true, tag: 'drop',
        note: `A zero, so nothing is recorded. Zeroes are interchangeable, so there is no order to preserve among them — only a count, and the length of <b>kept</b> already implies it.` });
    }
  }

  while (kept.length < n) {
    kept.push(0);
    steps.push({ line: 'pad', arr: arr.slice(), kept: kept.slice(), padAt: kept.length - 1, tag: 'pad',
      note: `<b>kept</b> is ${n - kept.length + 1} short of the ${n} cells it has to fill, so pad the tail with a zero.` });
  }

  for (let i = 0; i < n; i++) {
    arr[i] = kept[i];
    steps.push({ line: 'write', arr: arr.slice(), kept: kept.slice(), write: i, tag: 'write',
      note: i === 0
        ? `<b>nums[0] = ${kept[0]}</b>. Writing back over the original is the only reason this counts as mutating the caller's array rather than handing back a new one.`
        : `<b>nums[${i}] = ${kept[i]}</b>.` });
  }

  steps.push({ line: 'done', arr: arr.slice(), kept: kept.slice(), write: n, done: true,
    note: `Correct, at a cost of <b>${n} writes</b> into <code>nums</code> plus a whole second array — and <code>nums</code> was wrong until the last few steps.` });
  return steps;
}

function buildTwoPointer({ nums }) {
  const steps = [];
  const n = nums.length;
  const arr = nums.slice();
  let slow = 0;
  let swaps = 0;

  steps.push({ line: 'init', arr: arr.slice(), slow: 0, fast: null, swaps,
    note: `<b>slow = 0</b>. Read it as a boundary rather than an index: everything to the left of <b>slow</b> is finished and will not be touched again.` });

  for (let fast = 0; fast < n; fast++) {
    const value = arr[fast];
    steps.push({ line: 'loop', arr: arr.slice(), slow, fast, swaps, tag: 'read',
      note: fast === 0
        ? `<b>fast = 0</b>, value ${value}. <b>fast</b> is the scan: it visits every cell exactly once and never goes back.`
        : `<b>fast = ${fast}</b>, value ${value}.` });

    if (value === 0) {
      steps.push({ line: 'test', arr: arr.slice(), slow, fast, skip: true, swaps, tag: 'zero',
        note: slow === fast
          ? `A zero, so the boundary stays at ${slow}. <b>fast</b> moves on alone, and from here the two pointers are apart — the gap between them is the zeroes seen so far.`
          : `A zero, so the boundary stays at ${slow} and the gap widens to ${fast - slow + 1} cells. Those cells are all zeroes, parked where the next non-zero can swap one away.` });
      continue;
    }

    const target = slow;
    const displaced = arr[slow];
    [arr[slow], arr[fast]] = [arr[fast], arr[slow]];
    swaps++;
    steps.push({ line: 'swap', arr: arr.slice(), slow, fast, swapped: [target, fast], swaps, tag: 'swap',
      note: target === fast
        ? `<b>slow</b> and <b>fast</b> are the same cell, so the swap writes ${value} over itself — no zeroes have been passed yet, so it is already home. The wasted write is what the follow-up asks about.`
        : `${value} belongs at index ${target}, so swap it with the ${displaced} sitting there. The displaced zero lands at index ${fast}, inside the gap, which is where zeroes are allowed to be.` });

    slow++;
    steps.push({ line: 'bump', arr: arr.slice(), slow, fast, justPlaced: target, swaps, tag: 'advance',
      note: `<b>slow = ${slow}</b>. Index ${target} is settled, so the invariant holds again: <code>nums[0..${slow - 1}]</code> is the non-zero values in their original order, and nothing will touch them again.` });
  }

  steps.push({ line: 'done', arr: arr.slice(), slow, fast: n - 1, done: true, swaps,
    note: `<b>fast</b> ran off the end, so the settled prefix is the whole set of non-zero values and everything after <b>slow</b> is a zero. <b>${swaps}</b> swap${swaps === 1 ? '' : 's'}, no extra array.` });
  return steps;
}

/* ---------------- drawing ---------------- */

/* `slow` is the settled boundary, `fast` (or the write head, in the copy) is the
 * scan. Shading those three regions differently is the whole picture: correct,
 * in play, not yet looked at. */
function draw(s) {
  const arr = s.arr;
  const marks = {};
  const tone = {};

  const boundary = s.slow != null ? s.slow : s.write != null ? s.write : 0;
  const head = s.fast != null ? s.fast : s.write != null ? s.write : null;

  for (let i = 0; i < arr.length; i++) {
    if (i < boundary) tone[i] = 'up';                           // settled: never touched again
    else if (head != null && i > head && !s.done) tone[i] = 'done'; // not yet scanned
  }

  if (s.slow != null) {
    marks[s.slow] = s.slow === s.fast ? 'slow fast' : 'slow';
    if (s.fast != null && s.fast !== s.slow) marks[s.fast] = 'fast';
  } else if (s.write != null && s.write < arr.length) {
    marks[s.write] = 'write';
  } else if (s.fast != null) {
    marks[s.fast] = 'read';
  }

  if (s.swapped) { tone[s.swapped[0]] = 'up'; tone[s.swapped[1]] = 'warn'; }
  else if (s.skip && s.fast != null) tone[s.fast] = 'warn';

  const at = s.write != null && s.write < arr.length ? s.write : s.fast;
  const row = strip(arr, { at: s.done ? null : at, marks, tone, label: 'nums' });

  if (s.kept === undefined) return row;

  const keptTone = {};
  if (s.keepAt != null) keptTone[s.keepAt] = 'up';
  if (s.padAt != null) keptTone[s.padAt] = 'warn';
  return panels(row, strip(s.kept, {
    at: s.keepAt ?? s.padAt ?? null, tone: keptTone, label: 'kept (the extra array)',
  }));
}

function vars(s) {
  if (s.kept !== undefined) {
    return [['read', s.fast ?? '—'], ['write', s.write != null && s.write < s.arr.length ? s.write : '—'],
            ['kept', `[${s.kept}]`], ['extra cells', s.kept.length]];
  }
  return [['slow', s.slow ?? '—'], ['fast', s.fast ?? '—'],
          ['settled', s.slow ? `nums[0..${s.slow - 1}]` : 'nothing yet'],
          ['swaps', s.swaps ?? 0]];
}

/* ---------------- the code, one key per line ---------------- */

const c = (t) => `<span class="c">${t}</span>`;
const k = (t) => `<span class="k">${t}</span>`;

const CODE = {
  copy: {
    ruby: [
      [null, `${k('def')} move_zeroes(nums)`],
      ['init', `  kept = []                          ${c('# the extra O(n)')}`],
      ['loop', `  nums.each ${k('do')} |value|`],
      ['keep', `    kept &lt;&lt; value ${k('unless')} value.zero?`],
      [null, `  ${k('end')}`],
      ['pad', `  kept &lt;&lt; 0 ${k('while')} kept.length &lt; nums.length`],
      ['write', `  nums.each_index { |i| nums[i] = kept[i] }`],
      ['done', `  ${k('nil')}                               ${c('# mutated in place, returns nothing')}`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} moveZeroes(self, nums: List[int]) -&gt; ${k('None')}:`],
      ['init', `        kept = []                      ${c('# the extra O(n)')}`],
      ['loop', `        ${k('for')} value ${k('in')} nums:`],
      ['keep', `            ${k('if')} value != 0: kept.append(value)`],
      ['pad', `        ${k('while')} len(kept) &lt; len(nums): kept.append(0)`],
      ['write', `        ${k('for')} i ${k('in')} range(len(nums)): nums[i] = kept[i]`],
      ['done', `        ${k('return')}                       ${c('# mutated in place')}`],
    ],
    javascript: [
      [null, `${k('const')} moveZeroes = ${k('function')} (nums) {`],
      ['init', `  ${k('const')} kept = [];                     ${c('// the extra O(n)')}`],
      ['loop', `  ${k('for')} (${k('const')} value ${k('of')} nums) {`],
      ['keep', `    ${k('if')} (value !== 0) kept.push(value);`],
      [null, `  }`],
      ['pad', `  ${k('while')} (kept.length &lt; nums.length) kept.push(0);`],
      ['write', `  ${k('for')} (${k('let')} i = 0; i &lt; nums.length; i++) nums[i] = kept[i];`],
      ['done', `  ${k('return')};                            ${c('// mutated in place')}`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} moveZeroes(nums []${k('int')}) {`],
      ['init', `    kept := []${k('int')}{}                     ${c('// the extra O(n)')}`],
      ['loop', `    ${k('for')} _, value := ${k('range')} nums {`],
      ['keep', `        ${k('if')} value != 0 { kept = ${k('append')}(kept, value) }`],
      [null, `    }`],
      ['pad', `    ${k('for')} ${k('len')}(kept) &lt; ${k('len')}(nums) { kept = ${k('append')}(kept, 0) }`],
      ['write', `    ${k('for')} i := ${k('range')} nums { nums[i] = kept[i] }`],
      ['done', `    ${k('return')}                            ${c('// the slice header is shared, so this sticks')}`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} move_zeroes(nums: &amp;${k('mut')} Vec&lt;i32&gt;) {`],
      ['init', `        ${k('let')} ${k('mut')} kept: Vec&lt;i32&gt; = Vec::new();  ${c('// the extra O(n)')}`],
      ['loop', `        ${k('for')} &amp;value ${k('in')} nums.iter() {`],
      ['keep', `            ${k('if')} value != 0 { kept.push(value); }`],
      [null, `        }`],
      ['pad', `        ${k('while')} kept.len() &lt; nums.len() { kept.push(0); }`],
      ['write', `        ${k('for')} i ${k('in')} 0..nums.len() { nums[i] = kept[i]; }`],
      ['done', `    }                                  ${c('// mutated through the &amp;mut')}`],
      [null, `}`],
    ],
  },
  twopointer: {
    ruby: [
      [null, `${k('def')} move_zeroes(nums)`],
      ['init', `  slow = 0                           ${c('# nums[0...slow] is finished')}`],
      ['loop', `  (0...nums.length).each ${k('do')} |fast|`],
      ['test', `    ${k('next')} ${k('if')} nums[fast].zero?`],
      ['swap', `    nums[slow], nums[fast] = nums[fast], nums[slow]`],
      ['bump', `    slow += 1`],
      [null, `  ${k('end')}`],
      ['done', `  ${k('nil')}`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} moveZeroes(self, nums: List[int]) -&gt; ${k('None')}:`],
      ['init', `        slow = 0                       ${c('# nums[:slow] is finished')}`],
      ['loop', `        ${k('for')} fast ${k('in')} range(len(nums)):`],
      ['test', `            ${k('if')} nums[fast] == 0: ${k('continue')}`],
      ['swap', `            nums[slow], nums[fast] = nums[fast], nums[slow]`],
      ['bump', `            slow += 1`],
      ['done', `        ${k('return')}`],
    ],
    javascript: [
      [null, `${k('const')} moveZeroes = ${k('function')} (nums) {`],
      ['init', `  ${k('let')} slow = 0;                       ${c('// nums[0..slow-1] is finished')}`],
      ['loop', `  ${k('for')} (${k('let')} fast = 0; fast &lt; nums.length; fast++) {`],
      ['test', `    ${k('if')} (nums[fast] === 0) ${k('continue')};`],
      ['swap', `    [nums[slow], nums[fast]] = [nums[fast], nums[slow]];`],
      ['bump', `    slow++;`],
      [null, `  }`],
      ['done', `  ${k('return')};`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} moveZeroes(nums []${k('int')}) {`],
      ['init', `    slow := 0                          ${c('// nums[:slow] is finished')}`],
      ['loop', `    ${k('for')} fast := 0; fast &lt; ${k('len')}(nums); fast++ {`],
      ['test', `        ${k('if')} nums[fast] == 0 { ${k('continue')} }`],
      ['swap', `        nums[slow], nums[fast] = nums[fast], nums[slow]`],
      ['bump', `        slow++`],
      [null, `    }`],
      ['done', `    ${k('return')}`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} move_zeroes(nums: &amp;${k('mut')} Vec&lt;i32&gt;) {`],
      ['init', `        ${k('let')} ${k('mut')} slow = 0;               ${c('// nums[..slow] is finished')}`],
      ['loop', `        ${k('for')} fast ${k('in')} 0..nums.len() {`],
      ['test', `            ${k('if')} nums[fast] == 0 { ${k('continue')}; }`],
      ['swap', `            nums.swap(slow, fast);`],
      ['bump', `            slow += 1;`],
      [null, `        }`],
      ['done', `    }`],
      [null, `}`],
    ],
  },
};

/* ---------------- mount ---------------- */

mountLesson({
  root: document.getElementById('lesson'),
  input: { nums: [0, 1, 0, 3, 12] },
  controls: [
    { key: 'nums', label: 'nums', size: 24, value: '0, 1, 0, 3, 12',
      parse: (v) => {
        const a = v.split(',').map((x) => Number(x.trim()));
        if (!a.length || a.some(Number.isNaN)) throw new Error('need at least one number');
        return a.slice(0, 12);
      } },
  ],
  modes: [
    { id: 'copy', name: 'Copy out and back', blurb: 'Collect, pad, paste', cost: 'O(n) time · O(n) space', build: buildCopy },
    { id: 'twopointer', name: 'Two pointers', blurb: 'Swap across a moving boundary', cost: 'O(n) time · O(1) space', build: buildTwoPointer },
  ],
  languages: [
    { id: 'ruby', name: 'Ruby' }, { id: 'python', name: 'Python' },
    { id: 'javascript', name: 'JavaScript' }, { id: 'go', name: 'Go' }, { id: 'rust', name: 'Rust' },
  ],
  code: CODE,
  draw,
  vars,
});
