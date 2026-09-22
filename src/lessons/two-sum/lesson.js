/* Two Sum — LeetCode 1.
 *
 * The contrast worth seeing: the brute force asks "does this pair work?" once
 * per pair, while the hash map asks "have I already seen the number that would
 * complete this one?" once per element. Same answer, and the second question
 * can be answered without looking at anything else.
 */
import { mountLesson } from '../../lib/stepper.js';
import { strip, kv, panels } from '../../lib/stage.js';

/* ---------------- step generators ---------------- */

function buildBrute({ nums, target }) {
  const steps = [];
  const n = nums.length;
  steps.push({ line: 'n', i: null, j: null,
    note: `Nothing clever here: try every pair. With ${n} numbers that is ${(n * (n - 1)) / 2} pairs.` });

  for (let i = 0; i < n; i++) {
    steps.push({ line: 'outer', i, j: null, tag: 'fix i',
      note: `Fix <b>i = ${i}</b> (value ${nums[i]}) and walk everything to its right.` });
    for (let j = i + 1; j < n; j++) {
      const sum = nums[i] + nums[j];
      steps.push({ line: 'inner', i, j, sum, tag: 'pair',
        note: `Pair up <b>nums[${i}] = ${nums[i]}</b> with <b>nums[${j}] = ${nums[j]}</b>.` });
      if (sum === target) {
        steps.push({ line: 'hit', i, j, sum, found: [i, j], tag: 'found',
          note: `${nums[i]} + ${nums[j]} = <b>${sum}</b>, which is the target. Return <b>[${i}, ${j}]</b>.` });
        return steps;
      }
      steps.push({ line: 'check', i, j, sum, miss: true, tag: 'no',
        note: `${nums[i]} + ${nums[j]} = ${sum}, not ${target}. Next j.` });
    }
  }
  steps.push({ line: 'none', i: null, j: null,
    note: 'Every pair checked and none summed to the target.' });
  return steps;
}

function buildHash({ nums, target }) {
  const steps = [];
  const seen = {};
  steps.push({ line: 'init', i: null, seen: {},
    note: 'One pass, and a note of every value already walked past — keyed by the value, holding its index.' });

  for (let i = 0; i < nums.length; i++) {
    const value = nums[i];
    const want = target - value;
    steps.push({ line: 'loop', i, seen: { ...seen }, tag: 'read',
      note: `At index ${i}, value <b>${value}</b>.` });
    steps.push({ line: 'want', i, want, seen: { ...seen }, tag: 'want',
      note: `To reach ${target} this needs a partner of <b>${want}</b>. Have I seen one?` });

    if (Object.prototype.hasOwnProperty.call(seen, want)) {
      steps.push({ line: 'hit', i, want, seen: { ...seen }, hitKey: String(want),
        found: [seen[want], i], tag: 'found',
        note: `Yes — <b>${want}</b> was at index ${seen[want]}. Return <b>[${seen[want]}, ${i}]</b>.` });
      return steps;
    }
    steps.push({ line: 'check', i, want, seen: { ...seen }, tag: 'no',
      note: `No <b>${want}</b> on record. So this value might be somebody else's partner later.` });
    seen[value] = i;
    steps.push({ line: 'store', i, want, seen: { ...seen }, storeKey: String(value), tag: 'store',
      note: `Write down <b>${value} → ${i}</b> and move on.` });
  }
  steps.push({ line: 'none', i: null, seen: { ...seen },
    note: 'Walked the whole array without finding a partner.' });
  return steps;
}

/* ---------------- drawing ---------------- */

function draw(s, input) {
  const { nums, target } = input;
  const marks = {};
  const tone = {};

  if (s.i != null) marks[s.i] = s.j != null ? 'i' : '↑ i';
  if (s.j != null) marks[s.j] = 'j';
  if (s.found) { tone[s.found[0]] = 'up'; tone[s.found[1]] = 'up'; }
  else if (s.miss) { tone[s.i] = 'warn'; tone[s.j] = 'warn'; }

  const arr = strip(nums, { at: s.j != null ? s.j : s.i, marks, tone, label: 'nums' });

  if (s.seen !== undefined) {
    const kvTone = {};
    if (s.hitKey) kvTone[s.hitKey] = 'up';
    else if (s.storeKey) kvTone[s.storeKey] = 'warn';
    // No readout panel here: the variable row under the stage already carries
    // target, want and i, and showing them twice just splits the reader's eye.
    return panels(
      arr,
      kv(s.seen, { at: s.hitKey ?? null, tone: kvTone, label: 'seen', keyName: 'value', valName: 'index' }),
    );
  }

  return arr;
}

function vars(s, input) {
  if (s.seen !== undefined) {
    return [['i', s.i ?? '—'], ['want', s.want ?? '—'], ['target', input.target],
            ['answer', s.found ? `[${s.found}]` : '—']];
  }
  return [['i', s.i ?? '—'], ['j', s.j ?? '—'], ['sum', s.sum ?? '—'],
          ['target', input.target], ['answer', s.found ? `[${s.found}]` : '—']];
}

/* ---------------- the code, one key per line ---------------- */

const c = (t) => `<span class="c">${t}</span>`;
const k = (t) => `<span class="k">${t}</span>`;

const CODE = {
  brute: {
    ruby: [
      [null, `${k('def')} two_sum(nums, target)`],
      ['n', `  n = nums.length`],
      ['outer', `  (${0}...n).each ${k('do')} |i|`],
      ['inner', `    (i + 1...n).each ${k('do')} |j|`],
      ['check', `      ${k('next')} ${k('unless')} nums[i] + nums[j] == target`],
      ['hit', `      ${k('return')} [i, j]`],
      [null, `    ${k('end')}`],
      [null, `  ${k('end')}`],
      ['none', `  []`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} twoSum(self, nums, target):`],
      ['n', `        n = len(nums)`],
      ['outer', `        ${k('for')} i ${k('in')} range(n):`],
      ['inner', `            ${k('for')} j ${k('in')} range(i + 1, n):`],
      ['check', `                ${k('if')} nums[i] + nums[j] != target:`],
      [null, `                    ${k('continue')}`],
      ['hit', `                ${k('return')} [i, j]`],
      ['none', `        ${k('return')} []`],
    ],
    javascript: [
      [null, `${k('const')} twoSum = ${k('function')} (nums, target) {`],
      ['n', `  ${k('const')} n = nums.length;`],
      ['outer', `  ${k('for')} (${k('let')} i = 0; i &lt; n; i++) {`],
      ['inner', `    ${k('for')} (${k('let')} j = i + 1; j &lt; n; j++) {`],
      ['check', `      ${k('if')} (nums[i] + nums[j] !== target) ${k('continue')};`],
      ['hit', `      ${k('return')} [i, j];`],
      [null, `    }`],
      [null, `  }`],
      ['none', `  ${k('return')} [];`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} twoSum(nums []${k('int')}, target ${k('int')}) []${k('int')} {`],
      ['n', `    n := len(nums)`],
      ['outer', `    ${k('for')} i := 0; i &lt; n; i++ {`],
      ['inner', `        ${k('for')} j := i + 1; j &lt; n; j++ {`],
      ['check', `            ${k('if')} nums[i]+nums[j] != target {`],
      [null, `                ${k('continue')}`],
      [null, `            }`],
      ['hit', `            ${k('return')} []${k('int')}{i, j}`],
      [null, `        }`],
      [null, `    }`],
      ['none', `    ${k('return')} []${k('int')}{}`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} two_sum(nums: Vec&lt;i32&gt;, target: i32) -&gt; Vec&lt;i32&gt; {`],
      ['n', `        ${k('let')} n = nums.len();`],
      ['outer', `        ${k('for')} i ${k('in')} 0..n {`],
      ['inner', `            ${k('for')} j ${k('in')} i + 1..n {`],
      ['check', `                ${k('if')} nums[i] + nums[j] != target { ${k('continue')}; }`],
      ['hit', `                ${k('return')} ${k('vec!')}[i ${k('as')} i32, j ${k('as')} i32];`],
      [null, `            }`],
      [null, `        }`],
      ['none', `        ${k('vec!')}[]`],
      [null, `    }`],
      [null, `}`],
    ],
  },
  hash: {
    ruby: [
      [null, `${k('def')} two_sum(nums, target)`],
      ['init', `  seen = {}                           ${c('# value => index')}`],
      ['loop', `  nums.each_with_index ${k('do')} |value, i|`],
      ['want', `    want = target - value`],
      ['check', `    ${k('if')} seen.key?(want)`],
      ['hit', `      ${k('return')} [seen[want], i]`],
      [null, `    ${k('end')}`],
      ['store', `    seen[value] = i`],
      [null, `  ${k('end')}`],
      ['none', `  []`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} twoSum(self, nums, target):`],
      ['init', `        seen = {}                       ${c('# value -> index')}`],
      ['loop', `        ${k('for')} i, value ${k('in')} enumerate(nums):`],
      ['want', `            want = target - value`],
      ['check', `            ${k('if')} want ${k('in')} seen:`],
      ['hit', `                ${k('return')} [seen[want], i]`],
      ['store', `            seen[value] = i`],
      ['none', `        ${k('return')} []`],
    ],
    javascript: [
      [null, `${k('const')} twoSum = ${k('function')} (nums, target) {`],
      ['init', `  ${k('const')} seen = ${k('new')} Map();            ${c('// value -> index')}`],
      ['loop', `  ${k('for')} (${k('let')} i = 0; i &lt; nums.length; i++) {`],
      ['want', `    ${k('const')} want = target - nums[i];`],
      ['check', `    ${k('if')} (seen.has(want)) {`],
      ['hit', `      ${k('return')} [seen.get(want), i];`],
      [null, `    }`],
      ['store', `    seen.set(nums[i], i);`],
      [null, `  }`],
      ['none', `  ${k('return')} [];`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} twoSum(nums []${k('int')}, target ${k('int')}) []${k('int')} {`],
      ['init', `    seen := ${k('make')}(${k('map')}[${k('int')}]${k('int')})        ${c('// value -> index')}`],
      ['loop', `    ${k('for')} i, value := ${k('range')} nums {`],
      ['want', `        want := target - value`],
      ['check', `        ${k('if')} j, ok := seen[want]; ok {`],
      ['hit', `            ${k('return')} []${k('int')}{j, i}`],
      [null, `        }`],
      ['store', `        seen[value] = i`],
      [null, `    }`],
      ['none', `    ${k('return')} []${k('int')}{}`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('use')} std::collections::HashMap;`],
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} two_sum(nums: Vec&lt;i32&gt;, target: i32) -&gt; Vec&lt;i32&gt; {`],
      ['init', `        ${k('let')} ${k('mut')} seen = HashMap::new();   ${c('// value -> index')}`],
      ['loop', `        ${k('for')} (i, &amp;value) ${k('in')} nums.iter().enumerate() {`],
      ['want', `            ${k('let')} want = target - value;`],
      ['check', `            ${k('if')} ${k('let')} Some(&amp;j) = seen.get(&amp;want) {`],
      ['hit', `                ${k('return')} ${k('vec!')}[j ${k('as')} i32, i ${k('as')} i32];`],
      [null, `            }`],
      ['store', `            seen.insert(value, i);`],
      [null, `        }`],
      ['none', `        ${k('vec!')}[]`],
      [null, `    }`],
      [null, `}`],
    ],
  },
};

/* ---------------- mount ---------------- */

mountLesson({
  root: document.getElementById('lesson'),
  input: { nums: [2, 7, 11, 15], target: 9 },
  controls: [
    { key: 'nums', label: 'nums', size: 22, value: '2, 7, 11, 15',
      parse: (v) => {
        const a = v.split(',').map((x) => Number(x.trim()));
        if (a.length < 2 || a.some(Number.isNaN)) throw new Error('need at least two numbers');
        return a.slice(0, 12);
      } },
    { key: 'target', label: 'target', type: 'number', value: 9, parse: Number },
  ],
  modes: [
    { id: 'brute', name: 'Brute force', blurb: 'Try every pair', cost: 'O(n²) time · O(1) space', build: buildBrute },
    { id: 'hash', name: 'Hash map', blurb: 'One pass, remember what you passed', cost: 'O(n) time · O(n) space', build: buildHash },
  ],
  languages: [
    { id: 'ruby', name: 'Ruby' }, { id: 'python', name: 'Python' },
    { id: 'javascript', name: 'JavaScript' }, { id: 'go', name: 'Go' }, { id: 'rust', name: 'Rust' },
  ],
  code: CODE,
  // How each language was actually checked. Printed as a badge on every
  // listing in part 3, so a language nothing ran says so on the page.
  verification: {
    ruby: 'run here · 3 examples + 20,000 random cases',
    python: 'run here · 3 examples + 20,000 random cases',
    javascript: 'run here · 3 examples + 20,000 random cases',
    go: 'not compiled — no Go/Rust toolchain, Docker down',
    rust: 'not compiled — no Go/Rust toolchain, Docker down',
  },
  draw,
  vars,
});
