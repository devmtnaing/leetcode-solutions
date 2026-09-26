/* Sliding Window Maximum — LeetCode 239.
 *
 * Looking at every value of every window is n · k work. The deque version
 * keeps only the values that could still become a window's maximum: a value
 * with a bigger (or equal) one to its right never can, because the bigger one
 * stays in every later window at least as long. What survives is falling from
 * front to back, so the front is the maximum — and it leaves once its index
 * slides out of the window.
 */
import { mountLesson } from '../../lib/stepper.js';
import { pick, onLangChange } from '../../lib/i18n.js';
import { cells, slots, stagePanel, readout } from '../../lib/stage.js';
import { t, exampleTitle, LANGUAGES, k, c, stageRow, stageGap, intList, intValue, presetChips, widgetLabel } from '../../lib/kit.js';

const MAX_N = 12;
const win = (arr) => `[${arr.join(', ')}]`;

/* ---------------- step generators ---------------- */

function checkK(nums, kk) {
  if (kk > nums.length) throw new Error(`k is at most the length of nums, ${nums.length}`);
}

function buildBrute({ nums, k: kk }) {
  checkK(nums, kk);
  const out = [];
  const steps = [];
  let cmps = 0;
  const snap = (extra) => ({ view: 'brute', out: [...out], i: null, j: null, best: null, cmps, just: -1, ...extra });
  for (let i = 0; i + kk <= nums.length; i++) {
    let best = nums[i];
    steps.push(snap({ line: 'start', i, j: i, best, tag: t(`window ${i}`, `window ${i}`),
      note: t(`Window ${i}: ${win(nums.slice(i, i + kk))}. Start with its first value, best = ${best}.`,
              `Window ${i} — ${win(nums.slice(i, i + kk))}။ ၎င်း၏ ပထမ value ဖြင့် စသည် — best = ${best}။`) }));
    for (let j = i + 1; j < i + kk; j++) {
      cmps++;
      const up = nums[j] > best;
      if (up) best = nums[j];
      steps.push(snap({ line: 'cmp', i, j, best, up, tag: t(up ? `best = ${best}` : `${nums[j]} ≤ ${best}`, up ? `best = ${best}` : `${nums[j]} ≤ ${best}`),
        note: up ? t(`nums[${j}] = ${nums[j]} is bigger: best = ${best}.`, `nums[${j}] = ${nums[j]} ပိုကြီးသည် — best = ${best}။`)
                 : t(`nums[${j}] = ${nums[j]} is not bigger than ${best}.`, `nums[${j}] = ${nums[j]} သည် ${best} ထက် မကြီးပါ။`) }));
    }
    out.push(best);
    steps.push(snap({ line: 'emit', i, best, just: out.length - 1, tag: t(`max ${best}`, `max ${best}`),
      note: t(`Window ${i} done after ${kk - 1} ${kk === 2 ? 'comparison' : 'comparisons'}: its maximum is ${best}. The next window shares ${kk - 1} of these values and looks at all of them again.`,
              `Window ${i} ကို နှိုင်းယှဉ်ခြင်း ${kk - 1} ကြိမ်ဖြင့် ပြီး — maximum သည် ${best}။ နောက် window သည် ဤ value ${kk - 1} ခုကို မျှသုံးပြီး အားလုံးကို ထပ်ကြည့်သည်။`) }));
  }
  steps.push(snap({ line: 'ret', finished: true, tag: t(`${out.length} windows`, `window ${out.length} ခု`),
    note: t(`${out.length} windows, ${out.length * (kk - 1)} comparisons in all.`, `window ${out.length} ခု၊ စုစုပေါင်း နှိုင်းယှဉ်ခြင်း ${out.length * (kk - 1)}။`) }));
  return steps;
}

function buildDeque({ nums, k: kk }) {
  checkK(nums, kk);
  const dq = [], out = [];
  const steps = [];
  const snap = (extra) => ({ view: 'deque', dq: [...dq], out: [...out], i: null, gone: null, why: null, just: -1, ...extra });
  nums.forEach((x, i) => {
    while (dq.length && nums[dq.at(-1)] <= x) {
      const j = dq.pop();
      steps.push(snap({ line: 'pop', i, gone: j, why: 'beaten', tag: t(`drop ${nums[j]}`, `${nums[j]} ဖယ်`),
        note: t(`nums[${j}] = ${nums[j]} ≤ ${x}, and ${x} arrived later: every window that still holds ${nums[j]} also holds ${x}. ${nums[j]} can never be a maximum again — drop it from the back.`,
                `nums[${j}] = ${nums[j]} ≤ ${x}၊ ${x} က နောက်မှ ရောက်သည် — ${nums[j]} ရှိသေးသော window တိုင်းတွင် ${x} လည်း ရှိသည်။ ${nums[j]} သည် maximum ဘယ်တော့မှ ပြန်မဖြစ်နိုင် — နောက်ဘက်မှ ဖယ်သည်။`) }));
    }
    if (dq.length) {
      steps.push(snap({ line: 'pop', i, tag: t(`${nums[dq.at(-1)]} > ${x}`, `${nums[dq.at(-1)]} > ${x}`),
        note: t(`The back is ${nums[dq.at(-1)]}, bigger than ${x}: it stays. ${x} may still be a maximum later, once ${nums[dq.at(-1)]} has slid out.`,
                `နောက်ဆုံးသည် ${x} ထက်ကြီးသော ${nums[dq.at(-1)]} — ၎င်း ကျန်သည်။ ${nums[dq.at(-1)]} ထွက်သွားပြီးနောက် ${x} သည် maximum ဖြစ်နိုင်သေးသည်။`) }));
    }
    dq.push(i);
    steps.push(snap({ line: 'push', i, tag: t(`push ${x}`, `${x} ထည့်`),
      note: t(`Append index ${i} (value ${x}) at the back. The deque's values still fall from front to back.`,
              `index ${i} (value ${x}) ကို နောက်တွင် ထည့်သည်။ deque ၏ value များ ရှေ့မှ နောက်သို့ ကျဆင်းနေဆဲ။`) }));
    if (dq[0] <= i - kk) {
      const j = dq.shift();
      steps.push(snap({ line: 'expire', i, gone: j, why: 'old', tag: t(`expire ${nums[j]}`, `${nums[j]} သက်တမ်းကုန်`),
        note: t(`The front, index ${j}, is outside the window ${i - kk + 1}..${i}: drop it from the front. Only one can leave per step, since the window moves by one.`,
                `ရှေ့ဆုံး index ${j} သည် window ${i - kk + 1}..${i} အပြင်ဘက်တွင် — ရှေ့မှ ဖယ်သည်။ window သည် တစ်ခုစီ ရွေ့သဖြင့် အဆင့်တစ်ခုလျှင် တစ်ခုသာ ထွက်နိုင်သည်။`) }));
    }
    if (i >= kk - 1) {
      out.push(nums[dq[0]]);
      steps.push(snap({ line: 'emit', i, just: out.length - 1, tag: t(`max ${nums[dq[0]]}`, `max ${nums[dq[0]]}`),
        note: t(`The window ${i - kk + 1}..${i} is full: its maximum is the front of the deque, ${nums[dq[0]]}. No scan.`,
                `window ${i - kk + 1}..${i} ပြည့်ပြီ — ၎င်း၏ maximum သည် deque ၏ ရှေ့ဆုံး ${nums[dq[0]]}။ scan မလို။`) }));
    }
  });
  steps.push(snap({ line: 'ret', finished: true, i: nums.length - 1, tag: t(`${out.length} windows`, `window ${out.length} ခု`),
    note: t(`Every index was pushed once and popped at most once: at most ${2 * nums.length} deque moves for ${out.length} windows.`,
            `index တိုင်းကို တစ်ကြိမ် ထည့်ပြီး အများဆုံး တစ်ကြိမ် ထုတ်သည် — window ${out.length} ခုအတွက် deque လှုပ်ရှားမှု အများဆုံး ${2 * nums.length}။`) }));
  return steps;
}

/* ---------------- drawing ----------------
 *
 * The strip card is nums with the current window lit. The stage is what each
 * approach carries: the brute force's running best, or the deque — values
 * falling from front to back, each labelled with the index it stores. */

function strip(s, { nums, k: kk }) {
  const lo = s.view === 'brute' ? s.i : s.i == null ? null : Math.max(0, s.i - kk + 1);
  const hi = s.view === 'brute' ? (s.i == null ? null : s.i + kk - 1) : s.i;
  const tone = {};
  nums.forEach((_, x) => {
    if (s.finished) return;
    if (x === s.gone) tone[x] = 'leaving';
    else if (s.view === 'brute' && x === s.j) tone[x] = 'entering';
    else if (s.view === 'deque' && x === s.i) tone[x] = 'entering';
    else if (lo != null && x >= lo && x <= hi) tone[x] = 'inwin';
    else if (lo != null && x < lo) tone[x] = 'done';
  });
  const marks = {};
  if (s.view === 'brute' && s.j != null) marks[s.j] = 'j';
  if (s.i != null && !s.finished) marks[s.i] = s.view === 'brute' && s.j === s.i ? 'i, j' : 'i';
  return cells(nums, { tone, marks });
}

function draw(s, { nums }) {
  if (s.view === 'brute') {
    return readout({ best: s.best ?? '—', [pick(t('comparisons so far', 'ယခုထိ နှိုင်းယှဉ်ခြင်း'))]: s.cmps });
  }
  const vals = s.dq.map((j) => nums[j]);
  const tone = {};
  if (s.line === 'push' && s.dq.length) tone[s.dq.length - 1] = 'entering';
  if (s.line === 'emit' && s.dq.length) tone[0] = 'inwin';
  const gone = s.gone != null ? stageGap + readout({ [pick(s.why === 'old' ? t('expired', 'သက်တမ်းကုန်') : t('dropped', 'ဖယ်ပြီး'))]: `${nums[s.gone]} @ ${s.gone}` }) : '';
  return stagePanel(pick(t('The deque, front first', 'Deque — ရှေ့ဆုံးမှ')), pick(t('values fall front to back', 'value များ ရှေ့မှ နောက်သို့ ကျ')),
    stageRow(cells(vals, { index: false, tone, marks: Object.fromEntries(s.dq.map((j, p) => [p, `@${j}`])) }), pick(t('empty', 'ဗလာ'))))
    + gone
    + stageGap + readout({ front: vals.length ? vals[0] : '—' });
}

function answer(s, { nums, k: kk }) {
  return {
    html: slots(s.out, { total: nums.length - kk + 1, just: s.just }),
    note: t('one maximum per window', 'window တစ်ခုလျှင် maximum တစ်ခု'),
  };
}

function vars(s, { nums, k: kk }) {
  const out = [['nums', win(nums)], ['k', kk], ['out', win(s.out)]];
  if (s.view === 'brute') {
    if (s.i != null) out.push(['i', s.i]);
    if (s.j != null) out.push(['j', s.j]);
    if (s.best != null) out.push(['best', s.best]);
  } else {
    out.push(['dq', `[${s.dq.join(', ')}]`]);
    if (s.i != null) out.push(['i', s.i], ['x', nums[s.i]]);
  }
  return out;
}

/* ---------------- the code, one key per line ----------------
 *
 * Generated from the verified solution files, so the listing a reader copies
 * is byte-identical to the one that ran. */

const CODE = {
  brute: {
    ruby: [
      [null, `${k('def')} max_sliding_window(nums, k)`],
      [null, `  out = []`],
      [null, `  (0..nums.length - k).each ${k('do')} |i|`],
      ['start', `    best = nums[i]`],
      [null, `    (i + 1...i + k).each ${k('do')} |j|`],
      ['cmp', `      best = nums[j] ${k('if')} nums[j] &gt; best`],
      [null, `    ${k('end')}`],
      ['emit', `    out &lt;&lt; best`],
      [null, `  ${k('end')}`],
      ['ret', `  out`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} maxSlidingWindow(self, nums, k):`],
      [null, `        out = []`],
      [null, `        ${k('for')} i ${k('in')} range(len(nums) - k + 1):`],
      ['start', `            best = nums[i]`],
      [null, `            ${k('for')} j ${k('in')} range(i + 1, i + k):`],
      ['cmp', `                ${k('if')} nums[j] &gt; best:`],
      ['cmp', `                    best = nums[j]`],
      ['emit', `            out.append(best)`],
      ['ret', `        ${k('return')} out`],
    ],
    javascript: [
      [null, `${k('const')} maxSlidingWindow = ${k('function')} (nums, k) {`],
      [null, `  ${k('const')} out = [];`],
      [null, `  ${k('for')} (${k('let')} i = 0; i + k &lt;= nums.length; i++) {`],
      ['start', `    ${k('let')} best = nums[i];`],
      [null, `    ${k('for')} (${k('let')} j = i + 1; j &lt; i + k; j++) {`],
      ['cmp', `      ${k('if')} (nums[j] &gt; best) best = nums[j];`],
      [null, `    }`],
      ['emit', `    out.push(best);`],
      [null, `  }`],
      ['ret', `  ${k('return')} out;`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} maxSlidingWindow(nums []int, k int) []int {`],
      [null, `    out := []int{}`],
      [null, `    ${k('for')} i := 0; i+k &lt;= len(nums); i++ {`],
      ['start', `        best := nums[i]`],
      [null, `        ${k('for')} j := i + 1; j &lt; i+k; j++ {`],
      ['cmp', `            ${k('if')} nums[j] &gt; best {`],
      ['cmp', `                best = nums[j]`],
      [null, `            }`],
      [null, `        }`],
      ['emit', `        out = append(out, best)`],
      [null, `    }`],
      ['ret', `    ${k('return')} out`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} max_sliding_window(nums: Vec&lt;i32&gt;, k: i32) -&gt; Vec&lt;i32&gt; {`],
      [null, `        ${k('let')} k = k as usize;`],
      [null, `        ${k('let')} ${k('mut')} out = Vec::new();`],
      [null, `        ${k('for')} i ${k('in')} 0..=nums.len() - k {`],
      ['start', `            ${k('let')} ${k('mut')} best = nums[i];`],
      [null, `            ${k('for')} j ${k('in')} i + 1..i + k {`],
      ['cmp', `                ${k('if')} nums[j] &gt; best {`],
      ['cmp', `                    best = nums[j];`],
      [null, `                }`],
      [null, `            }`],
      ['emit', `            out.push(best);`],
      [null, `        }`],
      ['ret', `        out`],
      [null, `    }`],
      [null, `}`],
    ],
  },
  deque: {
    ruby: [
      [null, `${k('def')} max_sliding_window(nums, k)`],
      [null, `  dq = [] ${c('# indices; their values fall from front to back')}`],
      [null, `  out = []`],
      [null, `  nums.each_with_index ${k('do')} |x, i|`],
      ['pop', `    dq.pop ${k('while')} !dq.empty? &amp;&amp; nums[dq[-1]] &lt;= x`],
      ['push', `    dq &lt;&lt; i`],
      ['expire', `    dq.shift ${k('if')} dq[0] &lt;= i - k`],
      ['emit', `    out &lt;&lt; nums[dq[0]] ${k('if')} i &gt;= k - 1`],
      [null, `  ${k('end')}`],
      ['ret', `  out`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('from')} collections ${k('import')} deque`],
      [null, ``],
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} maxSlidingWindow(self, nums, k):`],
      [null, `        dq, out = deque(), []             ${c('# indices; their values fall from front to back')}`],
      [null, `        ${k('for')} i, x ${k('in')} enumerate(nums):`],
      ['pop', `            ${k('while')} dq and nums[dq[-1]] &lt;= x:`],
      ['pop', `                dq.pop()`],
      ['push', `            dq.append(i)`],
      ['expire', `            ${k('if')} dq[0] &lt;= i - k:`],
      ['expire', `                dq.popleft()`],
      ['emit', `            ${k('if')} i &gt;= k - 1:`],
      ['emit', `                out.append(nums[dq[0]])`],
      ['ret', `        ${k('return')} out`],
    ],
    javascript: [
      [null, `${k('const')} maxSlidingWindow = ${k('function')} (nums, k) {`],
      [null, `  ${k('const')} dq = ${k('new')} Array(nums.length); ${c('// indices; their values fall from front to back')}`],
      [null, `  ${k('let')} head = 0, tail = 0;`],
      [null, `  ${k('const')} out = [];`],
      [null, `  ${k('for')} (${k('let')} i = 0; i &lt; nums.length; i++) {`],
      ['pop', `    ${k('while')} (tail &gt; head &amp;&amp; nums[dq[tail - 1]] &lt;= nums[i]) tail--;`],
      ['push', `    dq[tail++] = i;`],
      ['expire', `    ${k('if')} (dq[head] &lt;= i - k) head++;`],
      ['emit', `    ${k('if')} (i &gt;= k - 1) out.push(nums[dq[head]]);`],
      [null, `  }`],
      ['ret', `  ${k('return')} out;`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} maxSlidingWindow(nums []int, k int) []int {`],
      [null, `    dq := []int{} ${c('// indices; their values fall from front to back')}`],
      [null, `    out := []int{}`],
      [null, `    ${k('for')} i, x := ${k('range')} nums {`],
      ['pop', `        ${k('for')} len(dq) &gt; 0 &amp;&amp; nums[dq[len(dq)-1]] &lt;= x {`],
      ['pop', `            dq = dq[:len(dq)-1]`],
      [null, `        }`],
      ['push', `        dq = append(dq, i)`],
      ['expire', `        ${k('if')} dq[0] &lt;= i-k {`],
      ['expire', `            dq = dq[1:]`],
      [null, `        }`],
      ['emit', `        ${k('if')} i &gt;= k-1 {`],
      ['emit', `            out = append(out, nums[dq[0]])`],
      [null, `        }`],
      [null, `    }`],
      ['ret', `    ${k('return')} out`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('use')} std::collections::VecDeque;`],
      [null, ``],
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} max_sliding_window(nums: Vec&lt;i32&gt;, k: i32) -&gt; Vec&lt;i32&gt; {`],
      [null, `        ${k('let')} k = k as usize;`],
      [null, `        ${k('let')} ${k('mut')} dq: VecDeque&lt;usize&gt; = VecDeque::new(); ${c('// indices; values fall front to back')}`],
      [null, `        ${k('let')} ${k('mut')} out = Vec::new();`],
      [null, `        ${k('for')} i ${k('in')} 0..nums.len() {`],
      ['pop', `            ${k('while')} dq.back().map_or(false, |&amp;j| nums[j] &lt;= nums[i]) {`],
      ['pop', `                dq.pop_back();`],
      [null, `            }`],
      ['push', `            dq.push_back(i);`],
      ['expire', `            ${k('if')} dq[0] + k &lt;= i {`],
      ['expire', `                dq.pop_front();`],
      [null, `            }`],
      ['emit', `            ${k('if')} i + 1 &gt;= k {`],
      ['emit', `                out.push(nums[dq[0]]);`],
      [null, `            }`],
      [null, `        }`],
      ['ret', `        out`],
      [null, `    }`],
      [null, `}`],
    ],
  },
};

/* ---------------- part 1: the "who can still win" widget ----------------
 *
 * Slide the window. Inside it, a value with a bigger-or-equal one somewhere
 * to its right is out of the running for good: that value will be in every
 * window it is in, and longer. What is left — falling from left to right —
 * is exactly what the deque holds, and its first value is the maximum. */

const QW_SETS = [
  { label: exampleTitle(1), nums: [1, 3, -1, -3, 5, 3, 6, 7], k: 3 },
  { label: t('a falling run', 'ကျဆင်းသော အတန်း'), nums: [9, 7, 5, 3, 8, 2, 1, 4], k: 4 },
  { label: t('one tall value', 'မြင့်သော value တစ်ခု'), nums: [2, 1, 9, 1, 3, 2, 1, 1], k: 4 },
];

function mountDequeWidget(host) {
  const state = { set: 0, lo: 0 };
  host.innerHTML = `
    <div class="q-arr" data-arr></div>
    <div class="q-slider">
      <label for="swm-lo" data-lab></label>
      <input id="swm-lo" type="range" min="0" value="0" data-lo>
      <output data-out></output>
      <span class="q-presets" data-presets></span>
    </div>
    <p class="q-tie" data-line></p>
    <div class="ledger">
      <span class="expr" data-expr></span>
      <span class="total" data-total></span>
    </div>`;
  const q = (sel) => host.querySelector(sel);

  function render() {
    const { nums, k: kk } = QW_SETS[state.set];
    const lo = state.lo, hi = lo + kk - 1;
    const alive = [];
    for (let x = lo; x <= hi; x++) if (!nums.slice(x + 1, hi + 1).some((y) => y >= nums[x])) alive.push(x);
    q('[data-lab]').textContent = pick(t('window start', 'window အစ'));
    q('[data-lo]').max = String(nums.length - kk);
    q('[data-lo]').value = String(lo);
    q('[data-out]').textContent = `${lo}..${hi}`;
    q('[data-arr]').innerHTML = nums.map((v, x) => {
      const cls = x < lo || x > hi ? '' : alive[0] === x ? 'kept picked' : alive.includes(x) ? 'kept' : 'cut';
      return `<div class="cell ${cls}"><span>${v}</span><span class="idx">${x}</span></div>`;
    }).join('');
    q('[data-presets]').innerHTML = presetChips(QW_SETS, state.set);
    widgetLabel(pick(t(`k = ${kk} · drag the window`, `k = ${kk} · window ကို ဆွဲပါ`)));
    const dead = hi - lo + 1 - alive.length;
    q('[data-line]').innerHTML = pick(dead
      ? t(`${dead} of the ${kk} values here (dashed) have a bigger-or-equal value to their right. That value stays in every window they are in, so they can never be a maximum again. The rest fall from left to right: ${alive.map((x) => nums[x]).join(' > ')}.`,
          `ဤနေရာရှိ value ${kk} ခုအနက် ${dead} ခု (အစက်ချ) တွင် ၎င်းတို့၏ ညာဘက်၌ ပိုကြီး သို့မဟုတ် တူသော value ရှိသည်။ ထို value သည် ၎င်းတို့ ရှိသော window တိုင်းတွင် ရှိနေမည် ဖြစ်သဖြင့် ၎င်းတို့ maximum ဘယ်တော့မှ ပြန်မဖြစ်နိုင်။ ကျန်သည် ဘယ်မှ ညာသို့ ကျဆင်းသည် — ${alive.map((x) => nums[x]).join(' > ')}။`)
      : t(`Every value here can still be a maximum later: they fall from left to right, ${alive.map((x) => nums[x]).join(' > ')}.`,
          `ဤနေရာရှိ value တိုင်းသည် နောက်ပိုင်း maximum ဖြစ်နိုင်သေးသည် — ဘယ်မှ ညာသို့ ကျဆင်းသည်၊ ${alive.map((x) => nums[x]).join(' > ')}။`));
    q('[data-expr]').innerHTML = `dq = [${alive.join(', ')}] &nbsp;·&nbsp; ${pick(t('values', 'value'))} [${alive.map((x) => nums[x]).join(', ')}]`;
    q('[data-total]').innerHTML = `${nums[alive[0]]}<small>${pick(t('window max', 'window max'))}</small>`;
  }
  q('[data-lo]').addEventListener('input', (ev) => { state.lo = Number(ev.target.value); render(); });
  host.addEventListener('click', (ev) => {
    const chip = ev.target.closest('[data-set]');
    if (chip) { state.set = Number(chip.dataset.set); state.lo = 0; render(); }
  });
  onLangChange(render);
  render();
}

/* ---------------- the approach, in brief ---------------- */

const APPROACH = {
  brute: {
    idea: t('Every window gets its own scan: start from its first value and keep the biggest.', 'window တိုင်းကို ကိုယ်ပိုင် scan တစ်ခုစီ ပေးသည် — ပထမ value မှ စ၍ အကြီးဆုံးကို ထိန်းသည်။'),
    steps: [
      t('For each start <code>i</code>, set <code>best = nums[i]</code>.', 'အစ <code>i</code> တစ်ခုစီအတွက် <code>best = nums[i]</code> ထားသည်။'),
      t('Compare the other <code>k − 1</code> values against <code>best</code>.', 'ကျန် value <code>k − 1</code> ခုကို <code>best</code> နှင့် နှိုင်းယှဉ်သည်။'),
      t('Append <code>best</code> to <code>out</code>.', '<code>best</code> ကို <code>out</code> ထဲ ထည့်သည်။'),
    ],
    cost: t('(n − k + 1) windows × (k − 1) comparisons: O(n · k). At n = 10⁵ and k = 5 × 10⁴ that is 2.5 × 10⁹ (computed).',
            'window (n − k + 1) ခု × နှိုင်းယှဉ်ခြင်း (k − 1) — O(n · k)။ n = 10⁵၊ k = 5 × 10⁴ တွင် 2.5 × 10⁹ (တွက်ထားသည်)။'),
  },
  deque: {
    idea: t('Keep only the indices whose values could still be a window\'s maximum. A new value evicts every smaller-or-equal one at the back — they can never win while it is around — so the deque falls from front to back and its front is the answer.',
            'window ၏ maximum ဖြစ်နိုင်သေးသော value ရှိ index များကိုသာ ထိန်းသည်။ value အသစ်က နောက်ဘက်ရှိ ငယ် သို့မဟုတ် တူသော value တိုင်းကို ဖယ်သည် — ၎င်း ရှိနေသမျှ ၎င်းတို့ မနိုင်နိုင် — ထို့ကြောင့် deque သည် ရှေ့မှ နောက်သို့ ကျဆင်းပြီး ရှေ့ဆုံးသည် အဖြေ ဖြစ်သည်။'),
    steps: [
      t('Pop from the back while its value is <code>≤ x</code>; push <code>i</code>.', 'နောက်ဆုံး၏ value <code>≤ x</code> ဖြစ်နေသမျှ pop လုပ်ပြီး <code>i</code> ကို push သည်။'),
      t('If the front index is <code>≤ i − k</code>, it has left the window: pop it from the front.', 'ရှေ့ဆုံး index <code>≤ i − k</code> ဖြစ်လျှင် window မှ ထွက်သွားပြီ — ရှေ့မှ pop သည်။'),
      t('Once <code>i ≥ k − 1</code>, the front\'s value is this window\'s maximum.', '<code>i ≥ k − 1</code> ဖြစ်သည်နှင့် ရှေ့ဆုံး၏ value သည် ဤ window ၏ maximum။'),
    ],
    cost: t('Each index enters the deque once and leaves at most once, so the pops cost O(n) in total, whatever k is.', 'index တစ်ခုစီသည် deque ထဲ တစ်ကြိမ် ဝင်ပြီး အများဆုံး တစ်ကြိမ် ထွက်သဖြင့် k မည်မျှပင်ဖြစ်စေ pop များ၏ ကုန်ကျမှု စုစုပေါင်း O(n)။'),
  },
};

/* ---------------- mount ---------------- */

const EX1 = [1, 3, -1, -3, 5, 3, 6, 7];

mountLesson({
  input: { nums: EX1, k: 3 },
  controls: [
    { key: 'nums', label: 'nums', parse: intList({ max: MAX_N, lo: -10000, hi: 10000 }) },
    { key: 'k', label: 'k', type: 'number', min: 1, max: MAX_N, parse: intValue({ lo: 1, hi: MAX_N }) },
  ],
  presets: [
    { label: exampleTitle(1), input: { nums: EX1, k: 3 } },
    { label: exampleTitle(2), input: { nums: [1], k: 1 } },
    { label: t('falling', 'ကျဆင်း'), input: { nums: [9, 8, 7, 6, 5, 4], k: 3 } },
    { label: t('rising', 'မြင့်တက်'), input: { nums: [1, 2, 3, 4, 5, 6], k: 3 } },
  ],
  examples: [
    { title: exampleTitle(1), inputHtml: '<code>nums = [1,3,-1,-3,5,3,6,7], k = 3</code>', output: '[3,3,5,5,6,7]',
      why: [t('Six windows of three: [1,3,−1] → 3, [3,−1,−3] → 3, [−1,−3,5] → 5, [−3,5,3] → 5, [5,3,6] → 6, [3,6,7] → 7.',
              'သုံးခုစီပါ window ခြောက်ခု — [1,3,−1] → 3၊ [3,−1,−3] → 3၊ [−1,−3,5] → 5၊ [−3,5,3] → 5၊ [5,3,6] → 6၊ [3,6,7] → 7။')],
      load: { nums: EX1, k: 3 } },
    { title: exampleTitle(2), inputHtml: '<code>nums = [1], k = 1</code>', output: '[1]',
      why: [t('One window holding one value.', 'value တစ်ခုပါသော window တစ်ခု။')], load: { nums: [1], k: 1 } },
  ],
  modes: [
    { id: 'brute', name: 'Scan every window',
      desc: t('Look at all k values of each window.', 'window တစ်ခုစီ၏ value k ခုလုံးကို ကြည့်။'),
      cost: 'O(n · k) time · O(1) extra', build: buildBrute },
    { id: 'deque', name: 'Monotonic deque',
      desc: t('Keep only values that can still win, falling front to back.', 'နိုင်နိုင်သေးသော value များကိုသာ ထိန်း — ရှေ့မှ နောက်သို့ ကျဆင်း။'),
      cost: 'O(n) time · O(k) extra', build: buildDeque },
  ],
  languages: LANGUAGES,
  code: CODE,
  solutions: {
    brute: { approach: APPROACH.brute,
      desc: t('Correct, and the definition written down — but the windows overlap in k − 1 values and it compares them all again every time.',
              'မှန်ပြီး အဓိပ္ပာယ်ကို ချရေးထားခြင်း — သို့သော် window များသည် value k − 1 ခု ထပ်နေပြီး အကြိမ်တိုင်း အားလုံးကို ထပ်နှိုင်းယှဉ်သည်။') },
    deque: { approach: APPROACH.deque,
      desc: t('The O(n) answer. Store indices, not values: an index tells you when its value has left the window.',
              'O(n) အဖြေ။ value မဟုတ်ဘဲ index ကို သိမ်းပါ — index က ၎င်း၏ value window မှ ထွက်သွားချိန်ကို ပြောပြသည်။') },
  },
  // How each language was actually checked, printed as the part 3 badges.
  // The corpus: the 2 examples, 6 edges, 15,000 random arrays of up to 12
  // values from -3..3, 5,000 of up to 300 across the full range, and five of
  // 10⁵ values — against a block prefix/suffix-maximum oracle. The brute force
  // skips the five at 10⁵. Go and Rust ran in Docker (golang:1.23-alpine,
  // rust:1-slim).
  verification: {
    ruby: { brute: 'ran here · 20,008 cases, not the five at n = 10⁵', deque: 'ran here · 20,013 cases' },
    python: { brute: 'ran here · 20,008 cases, not the five at n = 10⁵', deque: 'ran here · 20,013 cases' },
    javascript: { brute: 'ran here · 20,008 cases, not the five at n = 10⁵', deque: 'ran here · 20,013 cases' },
    go: { brute: 'ran here · 20,008 cases, not the five at n = 10⁵ · Go 1.23', deque: 'ran here · 20,013 cases · Go 1.23' },
    rust: { brute: 'ran here · 20,008 cases, not the five at n = 10⁵ · rustc 1.98', deque: 'ran here · 20,013 cases · rustc 1.98' },
  },
  stripLabel: t('nums, the window lit', 'nums — window ကို လင်းပြ'),
  strip,
  draw,
  answer,
  vars,
  widget: mountDequeWidget,
});
