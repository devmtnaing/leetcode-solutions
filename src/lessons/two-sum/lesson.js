/* Two Sum — LeetCode 1.
 *
 * The contrast worth seeing: the brute force asks "does this pair work?" once
 * per pair, while the hash map asks "have I already seen the number that would
 * complete this one?" once per element. Same answer, and the second question
 * can be answered without looking at anything else.
 */
import { mountLesson } from '../../lib/stepper.js';
import { pick, onLangChange } from '../../lib/i18n.js';
import { strip, kv, panels } from '../../lib/stage.js';

/* Every reader-facing sentence is a pair; `pick()` chooses the side. */
const t = (en, my) => ({ en, my });

/* ---------------- step generators ---------------- */

function buildBrute({ nums, target }) {
  const steps = [];
  const n = nums.length;
  const pairs = (n * (n - 1)) / 2;
  steps.push({ line: 'n', i: null, j: null,
    note: t(`Nothing clever here: try every pair. With ${n} numbers that is ${pairs} pairs.`,
            `ဉာဏ်သုံးစရာ မလိုပါ — အတွဲတိုင်းကို စမ်းကြည့်ရုံသာ။ ကိန်း ${n} လုံးဆိုလျှင် အတွဲ ${pairs} တွဲ ရှိသည်။`) });

  for (let i = 0; i < n; i++) {
    steps.push({ line: 'outer', i, j: null, tag: t('fix i', 'i ကို ချုပ်ကိုင်'),
      note: t(`Fix <b>i = ${i}</b> (value ${nums[i]}) and walk everything to its right.`,
              `<b>i = ${i}</b> (တန်ဖိုး ${nums[i]}) ကို ချုပ်ကိုင်ထားပြီး ၎င်း၏ ညာဘက်ရှိ အားလုံးကို လျှောက်ကြည့်သည်။`) });
    for (let j = i + 1; j < n; j++) {
      const sum = nums[i] + nums[j];
      steps.push({ line: 'inner', i, j, sum, tag: t('pair', 'အတွဲ'),
        note: t(`Pair up <b>nums[${i}] = ${nums[i]}</b> with <b>nums[${j}] = ${nums[j]}</b>.`,
                `<b>nums[${i}] = ${nums[i]}</b> နှင့် <b>nums[${j}] = ${nums[j]}</b> ကို တွဲကြည့်သည်။`) });
      if (sum === target) {
        steps.push({ line: 'hit', i, j, sum, found: [i, j], tag: t('found', 'တွေ့ပြီ'),
          note: t(`${nums[i]} + ${nums[j]} = <b>${sum}</b>, which is the target. Return <b>[${i}, ${j}]</b>.`,
                  `${nums[i]} + ${nums[j]} = <b>${sum}</b> — target နှင့် ကိုက်သည်။ <b>[${i}, ${j}]</b> ကို ပြန်ပေးလိုက်သည်။`) });
        return steps;
      }
      steps.push({ line: 'check', i, j, sum, miss: true, tag: t('no', 'မကိုက်'),
        note: t(`${nums[i]} + ${nums[j]} = ${sum}, not ${target}. Next j.`,
                `${nums[i]} + ${nums[j]} = ${sum} ဖြစ်နေသည်၊ ${target} မဟုတ်ပါ။ နောက် j သို့ ဆက်သွားသည်။`) });
    }
  }
  steps.push({ line: 'none', i: null, j: null,
    note: t('Every pair checked and none summed to the target.',
            'အတွဲအားလုံးကို စစ်ပြီးပြီ၊ target နှင့် ကိုက်ညီသည့် အတွဲ မရှိပါ။') });
  return steps;
}

function buildHash({ nums, target }) {
  const steps = [];
  const seen = {};
  steps.push({ line: 'init', i: null, seen: {},
    note: t('One pass, and a note of every value already walked past — keyed by the value, holding its index.',
            'တစ်ခေါက်တည်း ဖြတ်လျှောက်ရင်း ဖြတ်ခဲ့ပြီးသော တန်ဖိုးတိုင်းကို မှတ်ထားသည် — တန်ဖိုးကို key ထား၍ ၎င်း၏ index ကို သိမ်းသည်။') });

  for (let i = 0; i < nums.length; i++) {
    const value = nums[i];
    const want = target - value;
    steps.push({ line: 'loop', i, seen: { ...seen }, tag: t('read', 'ဖတ်သည်'),
      note: t(`At index ${i}, value <b>${value}</b>.`,
              `index ${i} တွင် တန်ဖိုးမှာ <b>${value}</b> ဖြစ်သည်။`) });
    steps.push({ line: 'want', i, want, seen: { ...seen }, tag: t('want', 'want ရှာ'),
      note: t(`To reach ${target} this needs a partner of <b>${want}</b>. Have I seen one?`,
              `${target} ရောက်ရန် ဤတန်ဖိုးအတွက် partner မှာ <b>${want}</b> ဖြစ်ရမည်။ ၎င်းကို ယခင်က ဖြတ်ခဲ့ဖူးသလား။`) });

    if (Object.prototype.hasOwnProperty.call(seen, want)) {
      steps.push({ line: 'hit', i, want, seen: { ...seen }, hitKey: String(want),
        found: [seen[want], i], tag: t('found', 'တွေ့ပြီ'),
        note: t(`Yes — <b>${want}</b> was at index ${seen[want]}. Return <b>[${seen[want]}, ${i}]</b>.`,
                `ဖြတ်ခဲ့ဖူးသည် — <b>${want}</b> သည် index ${seen[want]} တွင် ရှိခဲ့သည်။ <b>[${seen[want]}, ${i}]</b> ကို ပြန်ပေးလိုက်သည်။`) });
      return steps;
    }
    steps.push({ line: 'check', i, want, seen: { ...seen }, tag: t('no', 'မှတ်ထားခြင်း မရှိ'),
      note: t(`No <b>${want}</b> on record. So this value might be somebody else's partner later.`,
              `မှတ်ထားသည့်ထဲတွင် <b>${want}</b> မရှိပါ။ ဤတန်ဖိုးကမူ နောင်တွင် အခြားတစ်ခု၏ partner ဖြစ်လာနိုင်သည်။`) });
    seen[value] = i;
    steps.push({ line: 'store', i, want, seen: { ...seen }, storeKey: String(value), tag: t('store', 'မှတ်ထားသည်'),
      note: t(`Write down <b>${value} → ${i}</b> and move on.`,
              `<b>${value} → ${i}</b> ကို မှတ်ထားပြီး ရှေ့ဆက်သည်။`) });
  }
  steps.push({ line: 'none', i: null, seen: { ...seen },
    note: t('Walked the whole array without finding a partner.',
            'array တစ်ခုလုံးကို လျှောက်ပြီးသော်လည်း partner မတွေ့ပါ။') });
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

const CONTROLS = [
  { key: 'nums', label: t('nums', 'nums တန်ဖိုးများ'), size: 22, value: '2, 7, 11, 15',
    parse: (v) => {
      const a = v.split(',').map((x) => Number(x.trim()));
      if (a.length < 2 || a.some(Number.isNaN)) throw new Error('need at least two numbers');
      return a.slice(0, 12);
    } },
  { key: 'target', label: t('target', 'target တန်ဖိုး'), type: 'number', value: 9, parse: Number },
];


mountLesson({
  root: document.getElementById('lesson'),
  input: { nums: [2, 7, 11, 15], target: 9 },
  controls: CONTROLS,
  modes: [
    { id: 'brute', name: t('Brute force', 'Brute force နည်း'),
      blurb: t('Try every pair', 'အတွဲတိုင်းကို စမ်းကြည့်သည်'),
      cost: 'O(n²) time · O(1) space', build: buildBrute },
    { id: 'hash', name: t('Hash map', 'Hash map နည်း'),
      blurb: t('One pass, remember what you passed', 'တစ်ခေါက်သာ ဖြတ်လျှောက်ပြီး ဖြတ်ခဲ့သမျှကို မှတ်ထားသည်'),
      cost: 'O(n) time · O(n) space', build: buildHash },
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

/* ---------------- part 1: the complement widget ----------------
 *
 * The statement hinges on one fact that is easy to read past: an element does
 * not have a range of partners it could work with, it has exactly one — and
 * that partner's value is `target - value`, computable without looking at the
 * array at all. Everything after that is only "is it there?".
 *
 * So the widget lets the reader drag the target and click an element, and
 * shows, for every element at once, the single number that would complete it
 * and whether the array is holding one. Searching for the pair turns into
 * looking up a number you already know.
 */

const QW_NUMS = [2, 7, 11, 15];

function mountComplementWidget(host) {
  if (!host) return;

  const state = { target: 9, sel: 0 };

  host.innerHTML = `
    <div class="qw">
      <h3 data-qw-title></h3>
      <p class="qw-sub" data-qw-sub></p>
      <div class="kit-controls">
        <label class="kit-field qw-slider">
          <span>target <b data-qw-target>${state.target}</b></span>
          <input type="range" min="2" max="30" value="${state.target}" data-qw-range aria-label="target">
        </label>
      </div>
      <div class="kit-stage" data-qw-stage></div>
      <p class="kit-note" data-qw-note></p>
    </div>`;

  const el = {
    title: host.querySelector('[data-qw-title]'),
    sub: host.querySelector('[data-qw-sub]'),
    target: host.querySelector('[data-qw-target]'),
    range: host.querySelector('[data-qw-range]'),
    stage: host.querySelector('[data-qw-stage]'),
    note: host.querySelector('[data-qw-note]'),
  };

  const partnerOf = (i) =>
    QW_NUMS.findIndex((v, j) => j !== i && v === state.target - QW_NUMS[i]);

  function render() {
    const { target, sel } = state;
    const tone = {};
    const marks = {};
    const rows = {};
    const rowTone = {};

    QW_NUMS.forEach((v, i) => {
      const j = partnerOf(i);
      if (j >= 0) tone[i] = 'up';
      const key = `nums[${i}] = ${v}`;
      rows[key] = `${target - v}  ${j >= 0 ? '✓' : '✗'}`;
      if (j >= 0) rowTone[key] = 'up';
    });

    const mate = partnerOf(sel);
    if (mate >= 0) marks[mate] = 'partner';

    el.target.textContent = String(target);
    el.stage.innerHTML = panels(
      strip(QW_NUMS, { at: sel, marks, tone, label: 'nums' }),
      kv(rows, {
        at: `nums[${sel}] = ${QW_NUMS[sel]}`,
        tone: rowTone,
        label: pick(t('what each element needs', 'element တစ်ခုချင်းစီ လိုအပ်သည့် partner')),
        keyName: 'element',
        valName: pick(t('target − value', 'target − value')),
      }),
    );

    const v = QW_NUMS[sel];
    const want = target - v;
    const line = mate >= 0
      ? t(`<b>nums[${sel}] = ${v}</b> needs ${target} − ${v} = <b>${want}</b>, and there is a ${want} sitting at index ${mate}. That pair is the answer.`,
          `<b>nums[${sel}] = ${v}</b> အတွက် လိုအပ်သည်မှာ ${target} − ${v} = <b>${want}</b>။ index ${mate} တွင် ${want} ရှိနေသည် — ဤအတွဲပင် အဖြေဖြစ်သည်။`)
      : t(`<b>nums[${sel}] = ${v}</b> needs ${target} − ${v} = <b>${want}</b>. There is no ${want} in nums, so ${v} is in no pair at all.`,
          `<b>nums[${sel}] = ${v}</b> အတွက် လိုအပ်သည်မှာ ${target} − ${v} = <b>${want}</b>။ nums ထဲတွင် ${want} မရှိသဖြင့် ${v} သည် မည်သည့်အတွဲတွင်မျှ မပါဝင်နိုင်ပါ။`);
    const tag = mate >= 0 ? t('match', 'ကိုက်ညီသည်') : t('no partner', 'partner မရှိ');

    el.title.textContent = pick(t('Every element wants exactly one number',
                                  'element တိုင်းတွင် လိုချင်သည့် ကိန်း တစ်ခုတည်းသာ ရှိသည်'));
    el.sub.textContent = pick(t(
      'Drag the target, or click an element. Nothing here searches: the number an element needs is target − value, and the only question left is whether the array is holding one.',
      'target ကို ရွှေ့ကြည့်ပါ၊ သို့မဟုတ် element တစ်ခုကို နှိပ်ကြည့်ပါ။ ဤနေရာတွင် ရှာဖွေစရာ မလိုပါ — element တစ်ခု လိုအပ်သည့် ကိန်းမှာ target − value ဖြစ်ပြီး၊ ကျန်သည့် မေးခွန်းမှာ ထိုကိန်း array ထဲတွင် ရှိမရှိ ဟူသည် တစ်ခုတည်းသာ ဖြစ်သည်။'));
    el.note.innerHTML =
      `<span class="kit-tag">${pick(tag)}</span><span>${pick(line)}</span>`;

    // The cells come from strip(), which draws plain divs — make them a real
    // control here rather than teaching the shared primitive about clicks.
    el.stage.querySelectorAll('.st-strip .st-cell').forEach((cell, i) => {
      cell.tabIndex = 0;
      cell.setAttribute('role', 'button');
      cell.setAttribute('aria-pressed', String(i === sel));
    });
  }

  function select(i) {
    if (i < 0 || i >= QW_NUMS.length || i === state.sel) return;
    state.sel = i;
    render();
  }

  el.range.addEventListener('input', () => {
    state.target = Number(el.range.value);
    render();
  });

  host.addEventListener('click', (e) => {
    const cell = e.target.closest('.st-strip .st-cell');
    if (!cell) return;
    select([...cell.parentElement.children].indexOf(cell));
  });

  host.addEventListener('keydown', (e) => {
    const cell = e.target.closest && e.target.closest('.st-strip .st-cell');
    if (cell && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      select([...cell.parentElement.children].indexOf(cell));
    }
    // The walkthrough listens for arrows and space on the document; a reader
    // nudging this slider should not also scrub part 2.
    e.stopPropagation();
  });

  onLangChange(render);
  render();
}

mountComplementWidget(document.getElementById('question-widget'));
