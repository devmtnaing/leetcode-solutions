/* Maximum Subarray — LeetCode 53.
 *
 * The brute force sums every subarray, reusing the running sum across ends
 * but starting over for every start. Kadane's algorithm asks one question per
 * index: what is the best sum of a subarray that ends exactly here? Either
 * the element alone, or the element added to the best subarray ending just
 * before it — and the second is only worse when that best is negative. A
 * negative run can only drag a sum down, so it is dropped the moment it
 * appears.
 */
import { mountLesson } from '../../lib/stepper.js';
import { pick, onLangChange } from '../../lib/i18n.js';
import { cells, readout, slots, stagePanel } from '../../lib/stage.js';
import { t, exampleTitle, LANGUAGES, k, c, stageRow, stageGap, intList, listText, presetChips, widgetLabel } from '../../lib/kit.js';

const MAX_LEN = 12;

const span = (nums, a, b) => `[${nums.slice(a, b + 1).join(', ')}]`;

/* ---------------- step generators ---------------- */

function buildBrute({ nums }) {
  const n = nums.length;
  const steps = [];
  let best = nums[0];
  let bestAt = [0, 0];
  const snap = (extra) => ({ view: 'brute', best, bestAt: [...bestAt], i: null, j: null, sum: null, ...extra });

  steps.push(snap({ line: 'init', tag: t(`best ${best}`, `best ${best}`),
    note: t(`<code>best</code> starts as nums[0] = <b>${best}</b>, a real subarray, rather than 0 — the answer may be negative.`,
            `<code>best</code> ကို 0 မဟုတ်ဘဲ တကယ့် subarray ဖြစ်သော nums[0] = <b>${best}</b> ဖြင့် စသည် — အဖြေသည် အနုတ် ဖြစ်နိုင်သည်။`) }));
  for (let i = 0; i < n; i++) {
    let sum = 0;
    steps.push(snap({ i, sum, line: 'start', tag: t(`start ${i}`, `start ${i}`),
      note: t(`Every subarray starting at <b>${i}</b>: the running <code>sum</code> starts again at 0.`,
              `<b>${i}</b> တွင် စသော subarray တိုင်း — running <code>sum</code> သည် 0 မှ ပြန်စသည်။`) }));
    for (let j = i; j < n; j++) {
      sum += nums[j];
      steps.push(snap({ i, j, sum, line: 'add', tag: t(`sum ${sum}`, `sum ${sum}`),
        note: t(`Add nums[${j}] = ${nums[j]}: ${span(nums, i, j)} sums to <b>${sum}</b>.`,
                `nums[${j}] = ${nums[j]} ကို ပေါင်းသည် — ${span(nums, i, j)} ၏ ပေါင်းလဒ် <b>${sum}</b>။`) }));
      if (sum > best) {
        best = sum;
        bestAt = [i, j];
        steps.push(snap({ i, j, sum, improved: true, line: 'best', tag: t(`best ${best}`, `best ${best}`),
          note: t(`${sum} beats the best so far: <code>best</code> = <b>${best}</b>.`,
                  `${sum} သည် ယခုထိ အကောင်းဆုံးထက် ကြီးသည် — <code>best</code> = <b>${best}</b>။`) }));
      }
    }
  }
  steps.push(snap({ line: 'ret', finished: true, tag: t(`return ${best}`, `${best} ပြန်`),
    note: t(`All ${n * (n + 1) / 2} subarrays summed. Return <b>${best}</b>, from ${span(nums, bestAt[0], bestAt[1])}.`,
            `subarray ${n * (n + 1) / 2} ခုလုံး ပေါင်းပြီး။ ${span(nums, bestAt[0], bestAt[1])} မှ <b>${best}</b> ကို ပြန်ပေးသည်။`) }));
  return steps;
}

function buildKadane({ nums }) {
  const n = nums.length;
  const steps = [];
  let best = nums[0];
  let cur = nums[0];
  let curFrom = 0;
  let bestAt = [0, 0];
  const snap = (extra) => ({ view: 'kadane', best, cur, curFrom, bestAt: [...bestAt], i: null, ...extra });

  steps.push(snap({ i: 0, line: 'init', tag: t(`cur ${cur}`, `cur ${cur}`),
    note: t(`<code>cur</code> is the best sum of a subarray that <em>ends</em> at the current index. At index 0 there is only [${nums[0]}], so <code>cur</code> = <code>best</code> = <b>${cur}</b>.`,
            `<code>cur</code> သည် လက်ရှိ index တွင် <em>ဆုံးသော</em> subarray ၏ အကောင်းဆုံး ပေါင်းလဒ် ဖြစ်သည်။ index 0 တွင် [${nums[0]}] တစ်ခုတည်းသာ ရှိသဖြင့် <code>cur</code> = <code>best</code> = <b>${cur}</b>။`) }));
  for (let i = 1; i < n; i++) {
    steps.push(snap({ i, line: 'read', tag: t(`read ${nums[i]}`, `${nums[i]} ဖတ်`),
      note: t(`Index ${i} holds <b>${nums[i]}</b>. The best subarray ending here either starts here, or is this value added to the best ending at ${i - 1}.`,
              `index ${i} တွင် <b>${nums[i]}</b> ရှိသည်။ ဤနေရာတွင် ဆုံးသော အကောင်းဆုံး subarray သည် ဤနေရာမှ စသည်၊ သို့မဟုတ် ${i - 1} တွင် ဆုံးသော အကောင်းဆုံးထဲ ဤ value ကို ပေါင်းထည့်ခြင်း ဖြစ်သည်။`) }));
    const extend = cur + nums[i];
    const was = cur;
    if (was < 0) {
      cur = nums[i];
      curFrom = i;
      steps.push(snap({ i, restarted: true, alone: nums[i], extend, line: 'extend', tag: t('start over', 'ပြန်စ'),
        note: t(`Carrying on gives ${was} + ${nums[i]} = ${extend}; starting over gives ${nums[i]}. The run behind is negative — it can only drag a sum down — so drop it: <code>cur</code> = <b>${cur}</b>.`,
                `ဆက်သွားလျှင် ${was} + ${nums[i]} = ${extend}၊ ပြန်စလျှင် ${nums[i]}။ နောက်က run သည် အနုတ် — ပေါင်းလဒ်ကို ဆွဲချနိုင်ရုံသာ — ထို့ကြောင့် ပယ်သည် — <code>cur</code> = <b>${cur}</b>။`) }));
    } else {
      cur = extend;
      steps.push(snap({ i, alone: nums[i], extend, line: 'extend', tag: t('carry on', 'ဆက်'),
        note: t(`Carrying on gives ${was} + ${nums[i]} = ${extend}; starting over gives ${nums[i]}. The run behind is not negative, so keep it: <code>cur</code> = <b>${cur}</b>.`,
                `ဆက်သွားလျှင် ${was} + ${nums[i]} = ${extend}၊ ပြန်စလျှင် ${nums[i]}။ နောက်က run သည် အနုတ် မဟုတ်သဖြင့် ထားသည် — <code>cur</code> = <b>${cur}</b>။`) }));
    }
    const before = best;
    if (cur > best) { best = cur; bestAt = [curFrom, i]; }
    steps.push(snap({ i, improved: best > before, line: 'best', tag: t(`best ${best}`, `best ${best}`),
      note: best > before
        ? t(`${cur} beats ${before}: <code>best</code> = <b>${best}</b>, from ${span(nums, curFrom, i)}.`,
            `${cur} သည် ${before} ထက် ကြီးသည် — ${span(nums, curFrom, i)} မှ <code>best</code> = <b>${best}</b>။`)
        : t(`${cur} does not beat ${best}.`, `${cur} သည် ${best} ထက် မကြီးပါ။`) }));
  }
  steps.push(snap({ line: 'ret', finished: true, tag: t(`return ${best}`, `${best} ပြန်`),
    note: t(`Return <b>${best}</b>, from ${span(nums, bestAt[0], bestAt[1])} — one pass, one decision per index.`,
            `${span(nums, bestAt[0], bestAt[1])} မှ <b>${best}</b> ကို ပြန်ပေးသည် — တစ်ကြိမ်တည်း ဖြတ်ခြင်း၊ index တစ်ခုလျှင် ဆုံးဖြတ်ချက် တစ်ခု။`) }));
  return steps;
}

/* ---------------- drawing ----------------
 *
 * The strip shows the subarray being summed (green), with the value just
 * read in amber. The stage holds what each approach carries: the running sum
 * of one start, or Kadane's two numbers — the best sum ending here and the
 * best anywhere — with the choice between carrying on and starting over. */

function strip(s, { nums }) {
  const tone = {};
  const marks = {};
  if (s.view === 'brute') {
    if (s.j != null) {
      for (let x = s.i; x <= s.j; x++) tone[x] = 'entering';
      marks[s.j] = s.i === s.j ? 'i,j' : 'j';
      if (s.i !== s.j) marks[s.i] = 'i';
    } else if (s.i != null) { marks[s.i] = 'i'; tone[s.i] = 'inwin'; }
  } else if (s.i != null) {
    for (let x = s.curFrom; x <= s.i; x++) tone[x] = 'entering';
    if (s.line === 'read') tone[s.i] = 'inwin';
    if (s.restarted && s.i > 0) for (let x = 0; x < s.i; x++) if (!tone[x]) tone[x] = 'done';
    marks[s.i] = 'i';
  }
  if (s.finished) {
    nums.forEach((_, x) => { tone[x] = 'done'; });
    for (let x = s.bestAt[0]; x <= s.bestAt[1]; x++) tone[x] = 'entering';
  }
  return cells(nums, { tone, marks });
}

function draw(s, { nums }) {
  const bestRow = stageRow(cells(nums.slice(s.bestAt[0], s.bestAt[1] + 1), { index: false }), '');
  if (s.view === 'brute') {
    return stagePanel(pick(t('The running sum of one start', 'start တစ်ခု၏ running sum')),
      pick(s.i == null ? t('no start yet', 'start မရှိသေး') : t(`start ${s.i}`, `start ${s.i}`)),
      readout({ i: s.i ?? '—', j: s.j ?? '—', sum: s.sum ?? '—', best: s.best })
        + stageGap + stagePanel(pick(t('best so far', 'ယခုထိ အကောင်းဆုံး')), `= ${s.best}`, bestRow));
  }
  const choice = s.extend == null
    ? {}
    : { 'cur + nums[i]': s.extend, 'nums[i] alone': s.alone };
  return stagePanel(pick(t('cur — best sum ending here', 'cur — ဤနေရာတွင် ဆုံးသော အကောင်းဆုံး')),
    pick(s.i == null ? t('done', 'ပြီး') : t(`ending at ${s.i}`, `${s.i} တွင် ဆုံး`)),
    readout({ ...choice, cur: s.cur, best: s.best })
      + stageGap + stagePanel(pick(t('best so far', 'ယခုထိ အကောင်းဆုံး')), `= ${s.best}`, bestRow));
}

function answer(s) {
  return {
    html: slots([s.best], { total: 1, just: s.improved || s.finished ? 0 : -1 }),
    note: s.finished ? t('the largest sum', 'အကြီးဆုံး ပေါင်းလဒ်') : t('best so far', 'ယခုထိ အကောင်းဆုံး'),
  };
}

function vars(s, { nums }) {
  const a = `[${nums.join(', ')}]`;
  if (s.view === 'brute') {
    return [['best', s.best], ['i', s.i ?? '—'], ['j', s.j ?? '—'], ['sum', s.sum ?? '—'], ['nums', a]];
  }
  return [['best', s.best], ['cur', s.cur], ['i', s.i ?? '—'], ['nums', a]];
}

/* ---------------- the code, one key per line ----------------
 *
 * Generated from the verified solution files, so the listing a reader copies
 * is byte-identical to the one that ran. */

const CODE = {
  brute: {
    ruby: [
      [null, `${k('def')} max_sub_array(nums)`],
      ['init', `  best = nums[0]`],
      ['start', `  (0...nums.length).each ${k('do')} |i|`],
      [null, `    sum = 0`],
      [null, `    (i...nums.length).each ${k('do')} |j|`],
      ['add', `      sum += nums[j]`],
      ['best', `      best = sum ${k('if')} sum &gt; best`],
      [null, `    ${k('end')}`],
      [null, `  ${k('end')}`],
      ['ret', `  best`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} maxSubArray(self, nums):`],
      ['init', `        best = nums[0]`],
      ['start', `        ${k('for')} i ${k('in')} range(len(nums)):`],
      [null, `            total = 0`],
      [null, `            ${k('for')} j ${k('in')} range(i, len(nums)):`],
      ['add', `                total += nums[j]`],
      ['best', `                ${k('if')} total &gt; best:`],
      [null, `                    best = total`],
      ['ret', `        ${k('return')} best`],
    ],
    javascript: [
      [null, `${k('const')} maxSubArray = ${k('function')} (nums) {`],
      ['init', `  ${k('let')} best = nums[0];`],
      ['start', `  ${k('for')} (${k('let')} i = 0; i &lt; nums.length; i++) {`],
      [null, `    ${k('let')} sum = 0;`],
      [null, `    ${k('for')} (${k('let')} j = i; j &lt; nums.length; j++) {`],
      ['add', `      sum += nums[j];`],
      ['best', `      ${k('if')} (sum &gt; best) best = sum;`],
      [null, `    }`],
      [null, `  }`],
      ['ret', `  ${k('return')} best;`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} maxSubArray(nums []int) int {`],
      ['init', `    best := nums[0]`],
      ['start', `    ${k('for')} i := 0; i &lt; len(nums); i++ {`],
      [null, `        sum := 0`],
      [null, `        ${k('for')} j := i; j &lt; len(nums); j++ {`],
      ['add', `            sum += nums[j]`],
      ['best', `            ${k('if')} sum &gt; best {`],
      [null, `                best = sum`],
      [null, `            }`],
      [null, `        }`],
      [null, `    }`],
      ['ret', `    ${k('return')} best`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} max_sub_array(nums: Vec&lt;i32&gt;) -&gt; i32 {`],
      ['init', `        ${k('let')} ${k('mut')} best = nums[0];`],
      ['start', `        ${k('for')} i ${k('in')} 0..nums.len() {`],
      [null, `            ${k('let')} ${k('mut')} sum = 0;`],
      [null, `            ${k('for')} j ${k('in')} i..nums.len() {`],
      ['add', `                sum += nums[j];`],
      ['best', `                ${k('if')} sum &gt; best {`],
      [null, `                    best = sum;`],
      [null, `                }`],
      [null, `            }`],
      [null, `        }`],
      ['ret', `        best`],
      [null, `    }`],
      [null, `}`],
    ],
  },
  kadane: {
    ruby: [
      [null, `${k('def')} max_sub_array(nums)`],
      ['init', `  best = cur = nums[0]`],
      ['read', `  (1...nums.length).each ${k('do')} |i|`],
      ['extend', `    cur = [nums[i], cur + nums[i]].max`],
      ['best', `    best = [best, cur].max`],
      [null, `  ${k('end')}`],
      ['ret', `  best`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} maxSubArray(self, nums):`],
      ['init', `        best = cur = nums[0]`],
      ['read', `        ${k('for')} i ${k('in')} range(1, len(nums)):`],
      ['extend', `            cur = max(nums[i], cur + nums[i])`],
      ['best', `            best = max(best, cur)`],
      ['ret', `        ${k('return')} best`],
    ],
    javascript: [
      [null, `${k('const')} maxSubArray = ${k('function')} (nums) {`],
      ['init', `  ${k('let')} best = nums[0], cur = nums[0];`],
      ['read', `  ${k('for')} (${k('let')} i = 1; i &lt; nums.length; i++) {`],
      ['extend', `    cur = Math.max(nums[i], cur + nums[i]);`],
      ['best', `    best = Math.max(best, cur);`],
      [null, `  }`],
      ['ret', `  ${k('return')} best;`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} maxSubArray(nums []int) int {`],
      ['init', `    best, cur := nums[0], nums[0]`],
      ['read', `    ${k('for')} i := 1; i &lt; len(nums); i++ {`],
      ['extend', `        cur = max(nums[i], cur+nums[i])`],
      ['best', `        best = max(best, cur)`],
      [null, `    }`],
      ['ret', `    ${k('return')} best`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} max_sub_array(nums: Vec&lt;i32&gt;) -&gt; i32 {`],
      ['init', `        ${k('let')} (${k('mut')} best, ${k('mut')} cur) = (nums[0], nums[0]);`],
      ['read', `        ${k('for')} i ${k('in')} 1..nums.len() {`],
      ['extend', `            cur = nums[i].max(cur + nums[i]);`],
      ['best', `            best = best.max(cur);`],
      [null, `        }`],
      ['ret', `        best`],
      [null, `    }`],
      [null, `}`],
    ],
  },
};

/* ---------------- part 1: the "drop the negative start" widget ----------------
 *
 * The statement hinges on "subarray": one contiguous run, not a pick of the
 * good values. Drag the two ends; the ledger sums the run, and the tie line
 * points out when its opening values add up to something negative — they
 * only drag it down, which is the whole of Kadane's idea.
 *
 * Built from x-sum's widget vocabulary: .q-arr cells (kept / cut), two
 * .q-slider rows, the amber .q-tie line and the .ledger. */

const QW_SETS = [
  { label: t('example 1', 'ဥပမာ 1'), nums: [-2, 1, -3, 4, -1, 2, 1, -5, 4], from: 0, to: 6 },
  { label: t('example 3', 'ဥပမာ 3'), nums: [5, 4, -1, 7, 8], from: 0, to: 4 },
  { label: t('all negative', 'အားလုံး အနုတ်'), nums: [-3, -1, -2], from: 0, to: 2 },
];

function bestOf(nums) {
  let best = nums[0];
  for (let i = 0; i < nums.length; i++) {
    let sum = 0;
    for (let j = i; j < nums.length; j++) { sum += nums[j]; best = Math.max(best, sum); }
  }
  return best;
}

function mountRunWidget(host) {
  const state = { set: 0, from: 0, to: 6 };

  host.innerHTML = `
    <div class="q-arr" data-arr></div>
    <div class="q-slider">
      <label for="qw-from">from</label>
      <input type="range" id="qw-from" min="0" max="8" value="0">
      <output data-out-from>0</output>
    </div>
    <div class="q-slider">
      <label for="qw-to">to</label>
      <input type="range" id="qw-to" min="0" max="8" value="6">
      <output data-out-to>6</output>
      <span class="q-presets" data-presets></span>
    </div>
    <p class="q-tie" data-line></p>
    <div class="ledger">
      <span class="expr" data-expr></span>
      <span class="total" data-total></span>
    </div>`;

  const q = (sel) => host.querySelector(sel);

  function render() {
    const { nums } = QW_SETS[state.set];
    const n = nums.length;
    const from = Math.min(state.from, n - 1);
    const to = Math.max(Math.min(state.to, n - 1), from);
    const run = nums.slice(from, to + 1);
    const sum = run.reduce((a, b) => a + b, 0);
    // the most negative opening stretch of the run, if any
    let prefix = 0, worst = 0, cut = -1;
    for (let x = from; x < to; x++) { prefix += nums[x]; if (prefix < worst) { worst = prefix; cut = x; } }

    for (const [id, v] of [['#qw-from', from], ['#qw-to', to]]) { q(id).max = String(n - 1); q(id).value = String(v); }
    q('[data-out-from]').textContent = String(from);
    q('[data-out-to]').textContent = String(to);
    q('[data-presets]').innerHTML = presetChips(QW_SETS, state.set);
    q('[data-arr]').innerHTML = nums.map((v, x) => {
      const inRun = x >= from && x <= to;
      const cls = inRun && cut >= 0 && x <= cut ? 'cut' : inRun ? 'kept' : '';
      return `<div class="cell ${cls}"><span>${v}</span><span class="idx">${x}</span></div>`;
    }).join('');

    widgetLabel(pick(t(`largest here: ${bestOf(nums)}`, `ဤနေရာ အကြီးဆုံး — ${bestOf(nums)}`)));

    q('[data-line]').innerHTML = pick(cut >= 0
      ? t(`The run opens with ${span(nums, from, cut)}, which sums to ${worst}. A negative start only drags the total down: drop it and the sum is ${sum - worst}.`,
          `run သည် ${span(nums, from, cut)} ဖြင့် စပြီး ၎င်း၏ ပေါင်းလဒ် ${worst}။ အနုတ် အစသည် စုစုပေါင်းကို ဆွဲချရုံသာ — ပယ်လိုက်လျှင် ပေါင်းလဒ် ${sum - worst}။`)
      : sum === bestOf(nums)
        ? t(`No negative start to drop, and ${sum} is the largest any subarray reaches.`, `ပယ်စရာ အနုတ် အစ မရှိ၊ ${sum} သည် subarray တစ်ခု ရနိုင်သည့် အကြီးဆုံး ဖြစ်သည်။`)
        : t(`No negative start to drop. Try moving the other end — the largest any subarray reaches is ${bestOf(nums)}.`,
            `ပယ်စရာ အနုတ် အစ မရှိ။ ကျန်အစွန်းကို ရွှေ့ကြည့်ပါ — subarray တစ်ခု ရနိုင်သည့် အကြီးဆုံးမှာ ${bestOf(nums)}။`));

    q('[data-expr]').innerHTML = run.map((v) => (v < 0 ? `(${v})` : v)).join(' + ');
    q('[data-total]').innerHTML = `${sum}<small>${pick(t('sum', 'ပေါင်းလဒ်'))}</small>`;
  }

  host.addEventListener('input', (ev) => {
    if (ev.target.id === 'qw-from') { state.from = Number(ev.target.value); state.to = Math.max(state.to, state.from); }
    else if (ev.target.id === 'qw-to') { state.to = Number(ev.target.value); state.from = Math.min(state.from, state.to); }
    else return;
    render();
  });
  host.addEventListener('click', (ev) => {
    const chip = ev.target.closest('[data-set]');
    if (!chip) return;
    const set = QW_SETS[Number(chip.dataset.set)];
    Object.assign(state, { set: Number(chip.dataset.set), from: set.from, to: set.to });
    render();
  });
  onLangChange(render);
  render();
}

/* ---------------- the approach, in brief ---------------- */

const APPROACH = {
  brute: {
    idea: t('Sum every subarray and keep the largest. For one start, each end is the previous sum plus one more value, so a running sum does it.',
            'subarray တိုင်းကို ပေါင်းပြီး အကြီးဆုံးကို ထားသည်။ start တစ်ခုအတွက် end တစ်ခုစီသည် ယခင် ပေါင်းလဒ် + value တစ်ခု ဖြစ်သဖြင့် running sum ဖြင့် ရသည်။'),
    steps: [
      t('Start <code>best</code> at <code>nums[0]</code>, not 0.', '<code>best</code> ကို 0 မဟုတ်ဘဲ <code>nums[0]</code> ဖြင့် စသည်။'),
      t('For each start <code>i</code>, reset <code>sum</code> to 0 and add <code>nums[j]</code> for each end <code>j</code>.',
        'start <code>i</code> တစ်ခုစီအတွက် <code>sum</code> ကို 0 ပြန်ထားပြီး end <code>j</code> တစ်ခုစီအတွက် <code>nums[j]</code> ကို ပေါင်းသည်။'),
      t('Keep the largest <code>sum</code> seen in <code>best</code>.', 'တွေ့ခဲ့သမျှ အကြီးဆုံး <code>sum</code> ကို <code>best</code> တွင် ထားသည်။'),
    ],
    cost: t('n(n + 1)/2 subarrays: about 5 × 10⁹ additions at n = 10⁵.', 'subarray n(n + 1)/2 ခု — n = 10⁵ တွင် ပေါင်းခြင်း 5 × 10⁹ ခန့်။'),
  },
  kadane: {
    idea: t('The best subarray ending at i is either nums[i] alone or nums[i] added to the best ending at i − 1 — and adding is only worse when that best is negative. Carry that one number forward.',
            'i တွင် ဆုံးသော အကောင်းဆုံး subarray သည် nums[i] တစ်ခုတည်း သို့မဟုတ် i − 1 တွင် ဆုံးသော အကောင်းဆုံးထဲ nums[i] ပေါင်းထည့်ခြင်း ဖြစ်သည် — ထိုအကောင်းဆုံးသည် အနုတ် ဖြစ်မှသာ ပေါင်းခြင်းက ပိုဆိုးသည်။ ထိုကိန်းတစ်လုံးကို ရှေ့သို့ သယ်သွားသည်။'),
    steps: [
      t('Start <code>cur</code> and <code>best</code> at <code>nums[0]</code>.', '<code>cur</code> နှင့် <code>best</code> ကို <code>nums[0]</code> ဖြင့် စသည်။'),
      t('For each later <code>i</code>: <code>cur = max(nums[i], cur + nums[i])</code> — start over if the run behind is negative.',
        'နောက်ထပ် <code>i</code> တစ်ခုစီအတွက် <code>cur = max(nums[i], cur + nums[i])</code> — နောက်က run အနုတ် ဖြစ်လျှင် ပြန်စသည်။'),
      t('<code>best = max(best, cur)</code>.', '<code>best = max(best, cur)</code>။'),
    ],
    cost: t('one pass and two numbers: n − 1 decisions.', 'တစ်ကြိမ်တည်း ဖြတ်ခြင်းနှင့် ကိန်းနှစ်လုံး — ဆုံးဖြတ်ချက် n − 1 ခု။'),
  },
};

/* ---------------- mount ----------------
 *
 * Last in the file on purpose: mountLesson runs the widget immediately, so
 * every const the widget reads must already be initialised. */

mountLesson({
  input: { nums: [-2, 1, -3, 4, -1, 2, 1, -5, 4] },
  controls: [
    { key: 'nums', label: 'nums', value: '-2, 1, -3, 4, -1, 2, 1, -5, 4', parse: intList({ max: MAX_LEN, lo: -10000, hi: 10000 }), format: listText },
  ],
  presets: [
    { label: exampleTitle(1), input: { nums: [-2, 1, -3, 4, -1, 2, 1, -5, 4] } },
    { label: exampleTitle(2), input: { nums: [1] } },
    { label: exampleTitle(3), input: { nums: [5, 4, -1, 7, 8] } },
    { label: t('All negative', 'အားလုံး အနုတ်'), input: { nums: [-3, -1, -2] } },
  ],
  examples: [
    { title: exampleTitle(1), inputHtml: '<code>nums = [-2,1,-3,4,-1,2,1,-5,4]</code>', output: '6',
      why: [t('[4,-1,2,1] sums to 6. The −1 inside it is worth keeping: dropping it would split the run.',
              '[4,-1,2,1] ၏ ပေါင်းလဒ် 6။ ၎င်းအတွင်းရှိ −1 ကို ထားသင့်သည် — ပယ်လျှင် run ကွဲသွားမည်။')],
      load: { nums: [-2, 1, -3, 4, -1, 2, 1, -5, 4] } },
    { title: exampleTitle(2), inputHtml: '<code>nums = [1]</code>', output: '1',
      why: [t('One value, one subarray.', 'value တစ်ခု၊ subarray တစ်ခု။')],
      load: { nums: [1] } },
    { title: exampleTitle(3), inputHtml: '<code>nums = [5,4,-1,7,8]</code>', output: '23',
      why: [t('The whole array: the −1 costs less than the 7 and 8 after it are worth.',
              'array တစ်ခုလုံး — −1 ၏ ကုန်ကျမှုသည် ၎င်းနောက်ရှိ 7 နှင့် 8 ၏ တန်ဖိုးထက် နည်းသည်။')],
      load: { nums: [5, 4, -1, 7, 8] } },
  ],
  modes: [
    { id: 'brute', name: 'Brute force',
      desc: t('Every start, a running sum over every end.', 'start တိုင်း၊ end တိုင်းအပေါ် running sum။'),
      cost: 'O(n²) time · O(1) space', build: buildBrute },
    { id: 'kadane', name: "Kadane's algorithm",
      desc: t('Carry on, or start over when the run behind is negative.', 'ဆက်သွား၊ သို့မဟုတ် နောက်က run အနုတ်ဖြစ်လျှင် ပြန်စ။'),
      cost: 'O(n) time · O(1) space', build: buildKadane },
  ],
  languages: LANGUAGES,
  code: CODE,
  solutions: {
    brute: { approach: APPROACH.brute,
      desc: t('Every start, with a running sum across the ends. Correct, and quadratic — too slow for n = 10⁵.',
              'start တိုင်း၊ end များအပေါ် running sum ဖြင့်။ မှန်သည်၊ သို့သော် quadratic ဖြစ်၍ n = 10⁵ အတွက် နှေးလွန်းသည်။') },
    kadane: { approach: APPROACH.kadane,
      desc: t('The submission worth writing: the best sum ending at each index, carried in one variable. Starting both at <code>nums[0]</code> is what keeps an all-negative array right.',
              'ရေးသင့်သည့် submission — index တစ်ခုစီတွင် ဆုံးသော အကောင်းဆုံး ပေါင်းလဒ်ကို variable တစ်ခုဖြင့် သယ်သည်။ နှစ်ခုလုံးကို <code>nums[0]</code> ဖြင့် စခြင်းက အားလုံး အနုတ် array ကို မှန်စေသည်။') },
  },
  // How each language was actually checked, printed as the part 3 badges.
  // The corpus: the 3 examples, 5 edges, 15,000 random arrays of 1–9 values
  // from -5..5, 5,000 of 1–60 across ±10⁴, and five at n = 10⁵ — against an
  // oracle taking the best difference of prefix sums. The brute force skips
  // the five at n = 10⁵. Go and Rust ran in Docker (golang:1.23-alpine,
  // rust:1-slim).
  verification: {
    ruby: { brute: 'ran here · 20,008 cases, not the five at n = 10⁵', kadane: 'ran here · 20,013 cases' },
    python: { brute: 'ran here · 20,008 cases, not the five at n = 10⁵', kadane: 'ran here · 20,013 cases' },
    javascript: { brute: 'ran here · 20,008 cases, not the five at n = 10⁵', kadane: 'ran here · 20,013 cases' },
    go: { brute: 'ran here · 20,008 cases, not the five at n = 10⁵ · Go 1.23', kadane: 'ran here · 20,013 cases · Go 1.23' },
    rust: { brute: 'ran here · 20,008 cases, not the five at n = 10⁵ · rustc 1.98', kadane: 'ran here · 20,013 cases · rustc 1.98' },
  },
  strip,
  draw,
  answer,
  vars,
  hover: { python: { total: 'sum' } },
  widget: mountRunWidget,
});
