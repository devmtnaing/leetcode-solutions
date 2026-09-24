/* Two Sum — LeetCode 1.
 *
 * The contrast worth seeing: the brute force asks "does this pair work?" once
 * per pair, while the hash map asks "have I already seen the number that would
 * complete this one?" once per element. Same answer, and the second question
 * can be answered without looking at anything else.
 */
import { t, exampleTitle, LANGUAGES, k, c } from '../../lib/kit.js';
import { mountLesson } from '../../lib/stepper.js';
import { pick, onLangChange } from '../../lib/i18n.js';
import { cells, kv, readout, slots, stagePanel } from '../../lib/stage.js';


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

/* ---------------- drawing ----------------
 *
 * The array lives in the strip card, as on x-sum. The stage holds only what
 * the approach carries between steps: for brute force, the pair under test and
 * its sum; for the hash map, the map itself — which is the whole idea.
 */

function strip(s, { nums }) {
  const tone = {};
  const marks = {};
  if (s.i != null) { tone[s.i] = 'inwin'; marks[s.i] = 'i'; }
  if (s.j != null) { tone[s.j] = s.miss ? 'leaving' : 'inwin'; marks[s.j] = 'j'; }
  if (s.found) { tone[s.found[0]] = 'entering'; tone[s.found[1]] = 'entering'; }
  return cells(nums, { tone, marks });
}

function draw(s, input) {
  if (s.seen !== undefined) {
    const tone = {};
    if (s.hitKey) tone[s.hitKey] = 'up';
    else if (s.storeKey) tone[s.storeKey] = 'warn';
    return stagePanel(
      pick(t('seen — value → index', 'seen — value → index')),
      pick(t(`${Object.keys(s.seen).length} stored`, `${Object.keys(s.seen).length} ခု သိမ်းပြီး`)),
      kv(s.seen, { at: s.hitKey ?? null, tone, keyName: 'value', valName: 'index' })
        + (s.want != null ? readout({ needs: s.want }) : ''),
    );
  }
  const pair = s.i != null && s.j != null ? `nums[${s.i}] + nums[${s.j}]` : '—';
  return stagePanel(
    pick(t('The pair under test', 'စစ်နေသော အတွဲ')),
    pick(t(`target ${input.target}`, `target ${input.target}`)),
    readout({ pair, sum: s.sum ?? '—', target: input.target }),
  );
}

function answer(s) {
  return {
    html: slots(s.found ?? [], { total: 2, just: s.found ? 1 : -1 }),
    note: s.found ? t('found — return it', 'တွေ့ပြီ — ပြန်ပေးပါ') : t('two indices', 'index နှစ်ခု'),
  };
}

function vars(s, input) {
  if (s.seen !== undefined) {
    return [['i', s.i ?? '—'], ['want', s.want ?? '—'], ['target', input.target],
            ['seen', `{${Object.entries(s.seen).map(([k, v]) => `${k}: ${v}`).join(', ')}}`],
            ['nums', `[${input.nums.join(', ')}]`]];
  }
  return [['i', s.i ?? '—'], ['j', s.j ?? '—'], ['sum', s.sum ?? '—'],
          ['target', input.target], ['n', input.nums.length], ['nums', `[${input.nums.join(', ')}]`]];
}

/* ---------------- the code, one key per line ---------------- */


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

/* ---------------- part 1: the complement widget ----------------
 *
 * The statement hinges on one fact that is easy to read past: an element has
 * no range of partners it could work with, it has exactly one — `target -
 * value`, computable without looking at the array. Everything after that is
 * only "is it there?".
 *
 * Built from x-sum's widget vocabulary: the .q-arr cells (kept / cut), the
 * .q-slider, the amber .q-tie line and the .ledger — so it reads as the same
 * kind of object as x-sum's "Drag x, watch what survives".
 */

const QW_SETS = [
  { label: t('example 1', 'ဥပမာ 1'), nums: [2, 7, 11, 15], target: 9 },
  { label: t('example 2', 'ဥပမာ 2'), nums: [3, 2, 4], target: 6 },
  { label: t('example 3', 'ဥပမာ 3'), nums: [3, 3], target: 6 },
  { label: t('no pair yet', 'အတွဲ မရှိသေး'), nums: [1, 4, 6, 10], target: 3 },
];

function mountComplementWidget(host) {
  const state = { set: 0, target: QW_SETS[0].target, sel: 0 };
  const nums = () => QW_SETS[state.set].nums;

  host.innerHTML = `
    <div class="q-arr" data-arr></div>
    <div class="q-slider">
      <label for="qw-target">target =</label>
      <input type="range" id="qw-target" min="2" max="30" value="${state.target}">
      <output data-out>${state.target}</output>
      <span class="q-presets" data-presets></span>
    </div>
    <p class="q-tie" data-line></p>
    <div class="ledger">
      <span class="expr" data-expr></span>
      <span class="total" data-total></span>
    </div>`;

  const q = (s) => host.querySelector(s);
  const partnerOf = (i) => nums().findIndex((v, j) => j !== i && v === state.target - nums()[i]);

  function render() {
    const { target, sel } = state;
    const a = nums();
    q('#qw-target').value = String(target);
    q('[data-out]').textContent = String(target);
    q('[data-presets]').innerHTML = QW_SETS.map((s, i) =>
      `<button class="chip" data-set="${i}"${i === state.set ? ' aria-pressed="true"' : ''}>${pick(s.label)}</button>`).join('');

    q('[data-arr]').innerHTML = a.map((v, i) => {
      const has = partnerOf(i) >= 0;
      return `<div class="cell ${has ? 'kept' : 'cut'}${i === sel ? ' picked' : ''}" role="button" tabindex="0" aria-pressed="${i === sel}"
                   data-i="${i}">
        <span>${v}</span></div>`;
    }).join('');

    const v = a[sel], want = target - v, mate = partnerOf(sel);
    const found = a.map((_, i) => partnerOf(i)).filter((j) => j >= 0).length;

    const label = document.getElementById('q-label');
    if (label) label.textContent = pick(t(`${a.length} values, target ${target}`, `တန်ဖိုး ${a.length} ခု၊ target ${target}`));

    q('[data-line]').innerHTML = pick(mate >= 0
      ? t(`nums[${sel}] = ${v} needs ${target} − ${v} = ${want}, and a ${want} sits at index ${mate}. That pair is the answer.`,
          `nums[${sel}] = ${v} အတွက် လိုအပ်သည်မှာ ${target} − ${v} = ${want}။ index ${mate} တွင် ${want} ရှိနေသည် — ဤအတွဲပင် အဖြေ ဖြစ်သည်။`)
      : t(`nums[${sel}] = ${v} needs ${target} − ${v} = ${want}. There is no ${want} here, so ${v} is in no pair.`,
          `nums[${sel}] = ${v} အတွက် လိုအပ်သည်မှာ ${target} − ${v} = ${want}။ ဤနေရာတွင် ${want} မရှိသဖြင့် ${v} သည် မည်သည့်အတွဲတွင်မျှ မပါနိုင်ပါ။`));

    // the ledger is a formula, as on x-sum: what every element needs, and whether it is there
    q('[data-expr]').innerHTML = a.map((x, i) =>
      `${target} − ${x} = ${target - x} ${partnerOf(i) >= 0 ? '✓' : '✗'}`).join(' &nbsp;·&nbsp; ');
    q('[data-total]').innerHTML = `${found}<small>${pick(t('with a partner', 'partner ရှိ'))}</small>`;
  }

  host.addEventListener('input', (e) => {
    if (e.target.id !== 'qw-target') return;
    state.target = Number(e.target.value); render();
  });
  host.addEventListener('click', (e) => {
    const chip = e.target.closest('[data-set]');
    if (chip) {
      state.set = Number(chip.dataset.set);
      state.target = QW_SETS[state.set].target;
      state.sel = 0;
      return render();
    }
    const c = e.target.closest('[data-i]');
    if (c) { state.sel = Number(c.dataset.i); render(); }
  });
  host.addEventListener('keydown', (e) => {
    const c = e.target.closest('[data-i]');
    if (c && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); state.sel = Number(c.dataset.i); render(); }
  });
  onLangChange(render);
  render();
}

/* ---------------- mount ----------------
 *
 * Last in the file on purpose: mountLesson runs the widget immediately, so
 * every const the widget reads must already be initialised. */

const parseNums = (v) => {
  const a = v.split(',').map((x) => Number(x.trim()));
  if (a.length < 2 || a.some(Number.isNaN)) throw new Error('need at least two numbers');
  return a.slice(0, 12);
};

mountLesson({
  input: { nums: [2, 7, 11, 15], target: 9 },
  controls: [
    { key: 'nums', label: 'nums', value: '2, 7, 11, 15', parse: parseNums },
    { key: 'target', label: 'target', type: 'number', value: 9, parse: Number },
  ],
  presets: [
    { label: exampleTitle(1), input: { nums: [2, 7, 11, 15], target: 9 } },
    { label: exampleTitle(2), input: { nums: [3, 2, 4], target: 6 } },
    { label: exampleTitle(3), input: { nums: [3, 3], target: 6 } },
    { label: t('Pair at the end', 'နောက်ဆုံးမှ အတွဲ'), input: { nums: [1, 5, 8, 3, 9, 4], target: 13 } },
  ],
  examples: [
    { title: exampleTitle(1),
      inputHtml: '<code>nums = [2,7,11,15]</code>, <code>target = 9</code>', output: '[0,1]',
      why: [t('<code>nums[0] + nums[1] = 2 + 7 = 9</code> — the first pair tried is already the answer.',
              '<code>nums[0] + nums[1] = 2 + 7 = 9</code> — ပထမဆုံး စမ်းသည့် အတွဲကပင် အဖြေ ဖြစ်နေသည်။')],
      load: { nums: [2, 7, 11, 15], target: 9 } },
    { title: exampleTitle(2),
      inputHtml: '<code>nums = [3,2,4]</code>, <code>target = 6</code>', output: '[1,2]',
      why: [t('<code>3 + 3</code> would be 6, but there is only one 3 — an element cannot pair with itself. <code>2 + 4</code> is the answer.',
              '<code>3 + 3</code> ဆိုလျှင် 6 ရမည်၊ သို့သော် 3 တစ်လုံးတည်းသာ ရှိသည် — element တစ်ခုသည် သူ့ကိုယ်သူ အတွဲ မဖြစ်နိုင်ပါ။ <code>2 + 4</code> သည် အဖြေ ဖြစ်သည်။')],
      load: { nums: [3, 2, 4], target: 6 } },
    { title: exampleTitle(3),
      inputHtml: '<code>nums = [3,3]</code>, <code>target = 6</code>', output: '[0,1]',
      why: [t('Two <em>different</em> elements that hold the same value. Allowed — the rule is about positions, not values.',
              'တန်ဖိုးတူသော်လည်း <em>ကွဲပြားသော</em> element နှစ်ခု ဖြစ်သည်။ ခွင့်ပြုသည် — စည်းမျဉ်းမှာ နေရာ (index) အတွက်ဖြစ်ပြီး တန်ဖိုးအတွက် မဟုတ်ပါ။')],
      load: { nums: [3, 3], target: 6 } },
  ],
  modes: [
    { id: 'brute', name: 'Brute force',
      desc: t('Try every pair until one adds up.', 'ပေါင်းလျှင် ကိုက်သည့် အတွဲ တွေ့သည်အထိ အတွဲတိုင်းကို စမ်းသည်။'),
      cost: 'O(n²) time · O(1) space', build: buildBrute },
    { id: 'hash', name: 'Hash map',
      desc: t('One pass. Remember every value you walked past.', 'တစ်ခေါက်တည်း ဖြတ်သည်။ ဖြတ်ခဲ့သမျှ တန်ဖိုးကို မှတ်ထားသည်။'),
      cost: 'O(n) time · O(n) space', build: buildHash },
  ],
  languages: LANGUAGES,
  code: CODE,
  solutions: {
    brute: {
      desc: t('Two nested loops, <code>j</code> starting after <code>i</code> so no element pairs with itself. Correct, and quadratic.',
              'Loop နှစ်ထပ်၊ element တစ်ခု သူ့ကိုယ်သူ အတွဲမဖြစ်စေရန် <code>j</code> ကို <code>i</code> ၏ နောက်မှ စသည်။ မှန်သည်၊ သို့သော် quadratic ဖြစ်သည်။'),
      approach: {
        idea: t('The answer is a pair of indices, so try every pair until one adds up to <code>target</code>.',
                'အဖြေသည် index အတွဲတစ်တွဲ ဖြစ်သဖြင့် ပေါင်းလျှင် <code>target</code> ရသည့် အတွဲ တွေ့သည်အထိ အတွဲတိုင်းကို စမ်းသည်။'),
        steps: [
          t('Take each index <code>i</code>, from the first.', 'ပထမမှ စ၍ index <code>i</code> တစ်ခုစီကို ယူသည်။'),
          t('Pair it with each <code>j</code> after it. Starting past <code>i</code> means no element pairs with itself and no pair is tried twice.',
            '၎င်းနောက်ရှိ <code>j</code> တစ်ခုစီနှင့် တွဲသည်။ <code>i</code> ကျော်မှ စသဖြင့် element တစ်ခု သူ့ကိုယ်သူ မတွဲမိ၊ အတွဲတစ်တွဲကို နှစ်ခါ မစမ်းမိပါ။'),
          t('If <code>nums[i] + nums[j] == target</code>, return <code>[i, j]</code>.', '<code>nums[i] + nums[j] == target</code> ဖြစ်လျှင် <code>[i, j]</code> ကို ပြန်ပေးသည်။'),
        ],
        cost: t('up to n(n − 1)/2 pairs, which is 49,995,000 at n = 10⁴; nothing is stored.',
                'အတွဲ n(n − 1)/2 အထိ — n = 10⁴ တွင် 49,995,000။ ဘာမျှ မသိမ်းပါ။'),
      },
    },
    hash: {
      desc: t('The submission worth writing. Check for the partner first, then store — the order is what keeps <code>[3,3]</code> correct.',
              'ရေးသင့်သည့် submission ဖြစ်သည်။ Partner ကို အရင်စစ်ပြီးမှ သိမ်းပါ — ထိုအစီအစဉ်ကြောင့် <code>[3,3]</code> မှန်နေသည်။'),
      approach: {
        idea: t('Each number already knows the partner it needs: <code>target − value</code>. Remember every value you pass, with its index, and finding the partner becomes one lookup instead of a second loop.',
                'ဂဏန်းတစ်ခုစီသည် ၎င်းလိုအပ်သည့် partner ကို သိပြီးသား ဖြစ်သည် — <code>target − value</code>။ ဖြတ်ခဲ့သမျှ value ကို ၎င်း၏ index နှင့်အတူ မှတ်ထားလျှင် partner ရှာခြင်းသည် ဒုတိယ loop အစား lookup တစ်ခုသာ ဖြစ်လာသည်။'),
        steps: [
          t('Start with an empty map, <code>seen</code>: value → index.', 'map ဗလာ <code>seen</code> — value → index ဖြင့် စသည်။'),
          t('For each <code>value</code> at index <code>i</code>, work out <code>want = target − value</code>.',
            'index <code>i</code> ရှိ <code>value</code> တစ်ခုစီအတွက် <code>want = target − value</code> ကို တွက်သည်။'),
          t('If <code>want</code> is in <code>seen</code>, return <code>[seen[want], i]</code>.', '<code>want</code> သည် <code>seen</code> ထဲတွင် ရှိလျှင် <code>[seen[want], i]</code> ကို ပြန်ပေးသည်။'),
          t('Otherwise store <code>seen[value] = i</code> and move on. Check before storing: the other order returns <code>[0,0]</code> on <code>[3,2,4]</code>, pairing the 3 with itself.',
            'မဟုတ်လျှင် <code>seen[value] = i</code> ကို သိမ်းပြီး ဆက်သွားသည်။ မသိမ်းမီ စစ်ပါ — အစီအစဉ် ပြောင်းပြန်ဆိုလျှင် <code>[3,2,4]</code> တွင် 3 ကို သူ့ကိုယ်သူ တွဲ၍ <code>[0,0]</code> ကို ပြန်ပေးသည်။'),
        ],
        cost: t('each element is looked up once and stored once; the map can hold up to n − 1 values.',
                'element တစ်ခုစီကို တစ်ကြိမ် ရှာပြီး တစ်ကြိမ် သိမ်းသည် — map တွင် value n − 1 ခုအထိ ရှိနိုင်သည်။'),
      },
    },
  },
  // How each language was actually checked, printed as the part 3 badges.
  // The corpus: 3 examples, 15,000 small arrays with one pair, 5,000 up to ±10⁹, and one at n = 10⁴ — each against all-pairs search.
  // Go and Rust ran in Docker (golang:1.23-alpine, rust:1-slim).
  verification: {
    ruby: 'ran here · 20,004 cases',
    python: 'ran here · 20,004 cases',
    javascript: 'ran here · 20,004 cases',
    go: 'ran here · 20,004 cases · Go 1.23',
    rust: 'ran here · 20,004 cases · rustc 1.98',
  },
  strip,
  draw,
  answer,
  vars,
  widget: mountComplementWidget,
});
