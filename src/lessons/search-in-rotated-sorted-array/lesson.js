/* Search in Rotated Sorted Array — LeetCode 33.
 *
 * A rotated sorted array is two sorted runs, and the drop between them is in
 * exactly one place. Cut it anywhere and at least one side of the cut holds
 * no drop, so that side is plainly sorted: its first and last values bound
 * everything in it. Binary search asks which side that is, and whether the
 * target falls between its ends — a yes or no that halves the range either
 * way. The scan is here as the answer that ignores the order entirely.
 */
import { mountLesson } from '../../lib/stepper.js';
import { pick, onLangChange } from '../../lib/i18n.js';
import { cells, readout, slots, stagePanel } from '../../lib/stage.js';
import { t, exampleTitle, LANGUAGES, k, c, stageRow, stageGap, intList, intValue, widgetLabel } from '../../lib/kit.js';

const MAX_LEN = 12;

/* The statement's promise: a sorted array, rotated once. */
function rotatedOnce(nums) {
  const drops = nums.filter((v, i) => i > 0 && v < nums[i - 1]).length;
  if (drops > 1 || (drops === 1 && nums.at(-1) > nums[0])) throw new Error('a sorted array, rotated once — like 4, 5, 6, 7, 0, 1, 2');
}

const span = (nums, a, b) => `[${nums.slice(a, b + 1).join(', ')}]`;

/* ---------------- step generators ---------------- */

function buildScan({ nums, target }) {
  const steps = [];
  const snap = (extra) => ({ view: 'scan', i: null, result: null, ...extra });
  for (let i = 0; i < nums.length; i++) {
    steps.push(snap({ i, line: 'scan', tag: t(`i = ${i}`, `i = ${i}`),
      note: t(`nums[${i}] = ${nums[i]}.`, `nums[${i}] = ${nums[i]}။`) }));
    if (nums[i] === target) {
      steps.push(snap({ i, found: true, result: i, finished: true, line: 'hit', tag: t(`return ${i}`, `${i} ပြန်`),
        note: t(`That is the target. Return <b>${i}</b>, after looking at ${i + 1} of ${nums.length}.`,
                `ထိုသည် target ဖြစ်သည်။ ${nums.length} ခုအနက် ${i + 1} ခု ကြည့်ပြီးနောက် <b>${i}</b> ကို ပြန်ပေးသည်။`) }));
      return steps;
    }
  }
  steps.push(snap({ result: -1, finished: true, line: 'miss', tag: t('return -1', '-1 ပြန်'),
    note: t(`Every value checked; ${target} is not there. Return <b>-1</b>.`,
            `value တိုင်း စစ်ပြီး — ${target} မရှိပါ။ <b>-1</b> ကို ပြန်ပေးသည်။`) }));
  return steps;
}

function buildBinary({ nums, target }) {
  const steps = [];
  let lo = 0;
  let hi = nums.length - 1;
  const snap = (extra) => ({ view: 'binary', lo, hi, mid: null, half: null, result: null, ...extra });

  steps.push(snap({ line: 'init', tag: t('whole array', 'array တစ်ခုလုံး'),
    note: t(`The target is somewhere in nums[${lo}..${hi}], if anywhere.`, `target ရှိလျှင် nums[${lo}..${hi}] အတွင်း တစ်နေရာတွင် ရှိသည်။`) }));
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    steps.push(snap({ mid, line: 'mid', tag: t(`mid ${mid}`, `mid ${mid}`),
      note: t(`<code>mid</code> = (${lo} + ${hi}) / 2 = <b>${mid}</b>, holding ${nums[mid]}.`,
              `<code>mid</code> = (${lo} + ${hi}) / 2 = <b>${mid}</b>၊ ${nums[mid]} ရှိသည်။`) }));
    if (nums[mid] === target) {
      steps.push(snap({ mid, result: mid, finished: true, line: 'hit', tag: t(`return ${mid}`, `${mid} ပြန်`),
        note: t(`nums[${mid}] is the target. Return <b>${mid}</b>.`, `nums[${mid}] သည် target ဖြစ်သည်။ <b>${mid}</b> ကို ပြန်ပေးသည်။`) }));
      return steps;
    }
    const leftSorted = nums[lo] <= nums[mid];
    steps.push(snap({ mid, half: leftSorted ? 'left' : 'right', line: 'half', tag: leftSorted ? t('left sorted', 'ဘယ် စီပြီး') : t('right sorted', 'ညာ စီပြီး'),
      note: leftSorted
        ? t(`Not it. nums[${lo}] = ${nums[lo]} ≤ nums[${mid}] = ${nums[mid]}, so the drop is not between them: ${span(nums, lo, mid)} is sorted.`,
            `မဟုတ်ပါ။ nums[${lo}] = ${nums[lo]} ≤ nums[${mid}] = ${nums[mid]} ဖြစ်သဖြင့် ကျဆင်းရာ ၎င်းတို့ကြားတွင် မရှိ — ${span(nums, lo, mid)} သည် စီပြီးသား။`)
        : t(`Not it. nums[${lo}] = ${nums[lo]} &gt; nums[${mid}] = ${nums[mid]}, so the drop is on the left — and the right side ${span(nums, mid, hi)} is sorted.`,
            `မဟုတ်ပါ။ nums[${lo}] = ${nums[lo]} &gt; nums[${mid}] = ${nums[mid]} ဖြစ်သဖြင့် ကျဆင်းရာ ဘယ်ဘက်တွင် ရှိသည် — ညာဘက် ${span(nums, mid, hi)} သည် စီပြီးသား။`) }));
    const inside = leftSorted
      ? nums[lo] <= target && target < nums[mid]
      : nums[mid] < target && target <= nums[hi];
    const range = leftSorted ? `${nums[lo]} ≤ target &lt; ${nums[mid]}` : `${nums[mid]} &lt; target ≤ ${nums[hi]}`;
    steps.push(snap({ mid, half: leftSorted ? 'left' : 'right', inside, line: leftSorted ? 'inleft' : 'inright', tag: inside ? t('inside', 'အတွင်း') : t('outside', 'အပြင်'),
      note: inside
        ? t(`Is ${range}? Yes — a sorted run holds exactly the values between its ends, so ${target} can only be there.`,
            `${range} ဖြစ်သလား။ ဟုတ်သည် — စီထားသော run တွင် ၎င်း၏ အစွန်းနှစ်ဘက်ကြားရှိ value များသာ ပါသဖြင့် ${target} သည် ထိုနေရာတွင်သာ ရှိနိုင်သည်။`)
        : t(`Is ${range}? No — so ${target} is not in the sorted side, and can only be in the other one.`,
            `${range} ဖြစ်သလား။ မဟုတ်ပါ — ထို့ကြောင့် ${target} သည် စီထားသော ဘက်တွင် မရှိ၊ ကျန်ဘက်တွင်သာ ရှိနိုင်သည်။`) }));
    let line;
    if (leftSorted) { if (inside) { hi = mid - 1; line = 'keepl'; } else { lo = mid + 1; line = 'dropl'; } }
    else if (inside) { lo = mid + 1; line = 'keepr'; } else { hi = mid - 1; line = 'dropr'; }
    steps.push(snap({ line, tag: t(`${lo}..${hi}`, `${lo}..${hi}`),
      note: lo <= hi
        ? t(`Keep nums[${lo}..${hi}], the half the target must be in: ${hi - lo + 1} ${hi === lo ? 'value' : 'values'} left.`,
            `nums[${lo}..${hi}] ကို ထားသည် — target ရှိရမည့် တစ်ဝက်၊ value ${hi - lo + 1} ခု ကျန်သည်။`)
        : t('Nothing left to search.', 'ရှာစရာ မကျန်တော့ပါ။') }));
  }
  steps.push(snap({ result: -1, finished: true, line: 'miss', tag: t('return -1', '-1 ပြန်'),
    note: t(`<code>lo</code> passed <code>hi</code>: ${target} is not in the array. Return <b>-1</b>.`,
            `<code>lo</code> သည် <code>hi</code> ကို ကျော်သွားပြီ — ${target} သည် array ထဲ မရှိပါ။ <b>-1</b> ကို ပြန်ပေးသည်။`) }));
  return steps;
}

/* ---------------- drawing ----------------
 *
 * The strip is the array. For the binary search, what is left of the range
 * stays bright and everything ruled out fades; on the step that finds the
 * sorted side, that side turns green. The stage holds the three pointers and
 * the one question asked of the sorted side. */

function strip(s, { nums }) {
  const tone = {};
  const marks = {};
  if (s.view === 'scan') {
    if (s.i != null) {
      for (let x = 0; x < s.i; x++) tone[x] = 'done';
      tone[s.i] = s.found ? 'entering' : 'inwin';
      marks[s.i] = 'i';
    }
    if (s.finished && s.result === -1) nums.forEach((_, x) => { tone[x] = 'done'; });
    return cells(nums, { tone, marks });
  }
  nums.forEach((_, x) => { if (x < s.lo || x > s.hi) tone[x] = 'done'; });
  if (s.half && s.mid != null) {
    const [a, b] = s.half === 'left' ? [s.lo, s.mid] : [s.mid, s.hi];
    for (let x = a; x <= b; x++) tone[x] = 'entering';
  }
  if (s.mid != null) tone[s.mid] = s.result === s.mid ? 'entering' : 'inwin';
  const put = (x, name) => { if (x >= 0 && x < nums.length) marks[x] = marks[x] ? `${marks[x]},${name}` : name; };
  if (!s.finished || s.result === -1) { put(s.lo, 'lo'); put(s.hi, 'hi'); }
  if (s.mid != null) put(s.mid, 'mid');
  return cells(nums, { tone, marks });
}

function draw(s, { nums, target }) {
  if (s.view === 'scan') {
    return stagePanel(pick(t('One value at a time', 'တစ်ကြိမ်လျှင် value တစ်ခု')),
      pick(t(`target ${target}`, `target ${target}`)),
      readout({ i: s.i ?? '—', 'nums[i]': s.i == null ? '—' : nums[s.i], target, looked: s.i == null ? 0 : s.i + 1 }));
  }
  const parts = [readout({ lo: s.lo, mid: s.mid ?? '—', hi: s.hi, target })];
  if (s.half && s.mid != null) {
    const [a, b] = s.half === 'left' ? [s.lo, s.mid] : [s.mid, s.hi];
    parts.push(stageGap + stagePanel(pick(s.half === 'left' ? t('the sorted side — left', 'စီထားသော ဘက် — ဘယ်') : t('the sorted side — right', 'စီထားသော ဘက် — ညာ')),
      `${nums[a]} … ${nums[b]}`, stageRow(cells(nums.slice(a, b + 1), { index: false }), '')));
    if (s.inside != null) {
      parts.push(readout({ [pick(t('target inside?', 'target အတွင်းမှာလား'))]: pick(s.inside ? t('yes', 'ဟုတ်') : t('no', 'မဟုတ်')) }));
    }
  }
  return stagePanel(pick(t('The range still in play', 'ရှာနေဆဲ အပိုင်း')),
    pick(s.lo <= s.hi ? t(`${s.hi - s.lo + 1} of ${nums.length} left`, `${nums.length} ခုအနက် ${s.hi - s.lo + 1} ခု ကျန်`) : t('empty', 'ဗလာ')),
    parts.join(''));
}

function answer(s) {
  return {
    html: slots(s.finished ? [s.result] : [], { total: 1, just: s.finished ? 0 : -1 }),
    note: s.finished ? (s.result === -1 ? t('not in the array', 'array ထဲ မရှိ') : t('the index of target', 'target ၏ index')) : t('an index, or -1', 'index တစ်ခု၊ သို့မဟုတ် -1'),
  };
}

function vars(s, { nums, target }) {
  const a = `[${nums.join(', ')}]`;
  if (s.view === 'scan') return [['i', s.i ?? '—'], ['x', s.i == null ? '—' : nums[s.i]], ['target', target], ['nums', a]];
  return [['lo', s.lo], ['hi', s.hi], ['mid', s.mid ?? '—'], ['target', target], ['nums', a],
          ['a', s.lo < nums.length && s.lo <= s.hi ? nums[s.lo] : '—'], ['m', s.mid == null ? '—' : nums[s.mid]],
          ['b', s.hi >= 0 && s.lo <= s.hi ? nums[s.hi] : '—']];
}

/* ---------------- the code, one key per line ----------------
 *
 * Generated from the verified solution files, so the listing a reader copies
 * is byte-identical to the one that ran. */

const CODE = {
  scan: {
    ruby: [
      [null, `${k('def')} search(nums, target)`],
      ['scan', `  nums.each_with_index ${k('do')} |x, i|`],
      ['hit', `    ${k('return')} i ${k('if')} x == target`],
      [null, `  ${k('end')}`],
      ['miss', `  -1`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} search(self, nums, target):`],
      ['scan', `        ${k('for')} i, x ${k('in')} enumerate(nums):`],
      ['hit', `            ${k('if')} x == target:`],
      [null, `                ${k('return')} i`],
      ['miss', `        ${k('return')} -1`],
    ],
    javascript: [
      [null, `${k('const')} search = ${k('function')} (nums, target) {`],
      ['scan', `  ${k('for')} (${k('let')} i = 0; i &lt; nums.length; i++) {`],
      ['hit', `    ${k('if')} (nums[i] === target) ${k('return')} i;`],
      [null, `  }`],
      ['miss', `  ${k('return')} -1;`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} search(nums []int, target int) int {`],
      ['scan', `    ${k('for')} i, x := ${k('range')} nums {`],
      ['hit', `        ${k('if')} x == target {`],
      [null, `            ${k('return')} i`],
      [null, `        }`],
      [null, `    }`],
      ['miss', `    ${k('return')} -1`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} search(nums: Vec&lt;i32&gt;, target: i32) -&gt; i32 {`],
      ['scan', `        ${k('for')} (i, &amp;x) ${k('in')} nums.iter().enumerate() {`],
      ['hit', `            ${k('if')} x == target {`],
      [null, `                ${k('return')} i as i32;`],
      [null, `            }`],
      [null, `        }`],
      ['miss', `        -1`],
      [null, `    }`],
      [null, `}`],
    ],
  },
  binary: {
    ruby: [
      [null, `${k('def')} search(nums, target)`],
      ['init', `  lo, hi = 0, nums.length - 1`],
      [null, `  ${k('while')} lo &lt;= hi`],
      ['mid', `    mid = (lo + hi) / 2`],
      ['hit', `    ${k('return')} mid ${k('if')} nums[mid] == target`],
      ['half', `    ${k('if')} nums[lo] &lt;= nums[mid]`],
      ['inleft', `      ${k('if')} nums[lo] &lt;= target &amp;&amp; target &lt; nums[mid]`],
      ['keepl', `        hi = mid - 1`],
      [null, `      ${k('else')}`],
      ['dropl', `        lo = mid + 1`],
      [null, `      ${k('end')}`],
      [null, `    ${k('else')}`],
      ['inright', `      ${k('if')} nums[mid] &lt; target &amp;&amp; target &lt;= nums[hi]`],
      ['keepr', `        lo = mid + 1`],
      [null, `      ${k('else')}`],
      ['dropr', `        hi = mid - 1`],
      [null, `      ${k('end')}`],
      [null, `    ${k('end')}`],
      [null, `  ${k('end')}`],
      ['miss', `  -1`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} search(self, nums, target):`],
      ['init', `        lo, hi = 0, len(nums) - 1`],
      [null, `        ${k('while')} lo &lt;= hi:`],
      ['mid', `            mid = (lo + hi) // 2`],
      ['hit', `            ${k('if')} nums[mid] == target:`],
      [null, `                ${k('return')} mid`],
      ['half', `            ${k('if')} nums[lo] &lt;= nums[mid]:`],
      ['inleft', `                ${k('if')} nums[lo] &lt;= target &lt; nums[mid]:`],
      ['keepl', `                    hi = mid - 1`],
      [null, `                ${k('else')}:`],
      ['dropl', `                    lo = mid + 1`],
      [null, `            ${k('else')}:`],
      ['inright', `                ${k('if')} nums[mid] &lt; target &lt;= nums[hi]:`],
      ['keepr', `                    lo = mid + 1`],
      [null, `                ${k('else')}:`],
      ['dropr', `                    hi = mid - 1`],
      ['miss', `        ${k('return')} -1`],
    ],
    javascript: [
      [null, `${k('const')} search = ${k('function')} (nums, target) {`],
      ['init', `  ${k('let')} lo = 0, hi = nums.length - 1;`],
      [null, `  ${k('while')} (lo &lt;= hi) {`],
      ['mid', `    ${k('const')} mid = (lo + hi) &gt;&gt; 1;`],
      ['hit', `    ${k('if')} (nums[mid] === target) ${k('return')} mid;`],
      ['half', `    ${k('if')} (nums[lo] &lt;= nums[mid]) {`],
      ['inleft', `      ${k('if')} (nums[lo] &lt;= target &amp;&amp; target &lt; nums[mid]) {`],
      ['keepl', `        hi = mid - 1;`],
      [null, `      } ${k('else')} {`],
      ['dropl', `        lo = mid + 1;`],
      [null, `      }`],
      [null, `    } ${k('else')} {`],
      ['inright', `      ${k('if')} (nums[mid] &lt; target &amp;&amp; target &lt;= nums[hi]) {`],
      ['keepr', `        lo = mid + 1;`],
      [null, `      } ${k('else')} {`],
      ['dropr', `        hi = mid - 1;`],
      [null, `      }`],
      [null, `    }`],
      [null, `  }`],
      ['miss', `  ${k('return')} -1;`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} search(nums []int, target int) int {`],
      ['init', `    lo, hi := 0, len(nums)-1`],
      [null, `    ${k('for')} lo &lt;= hi {`],
      ['mid', `        mid := (lo + hi) / 2`],
      ['hit', `        ${k('if')} nums[mid] == target {`],
      [null, `            ${k('return')} mid`],
      [null, `        }`],
      ['half', `        ${k('if')} nums[lo] &lt;= nums[mid] {`],
      ['inleft', `            ${k('if')} nums[lo] &lt;= target &amp;&amp; target &lt; nums[mid] {`],
      ['keepl', `                hi = mid - 1`],
      [null, `            } ${k('else')} {`],
      ['dropl', `                lo = mid + 1`],
      [null, `            }`],
      [null, `        } ${k('else')} {`],
      ['inright', `            ${k('if')} nums[mid] &lt; target &amp;&amp; target &lt;= nums[hi] {`],
      ['keepr', `                lo = mid + 1`],
      [null, `            } ${k('else')} {`],
      ['dropr', `                hi = mid - 1`],
      [null, `            }`],
      [null, `        }`],
      [null, `    }`],
      ['miss', `    ${k('return')} -1`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} search(nums: Vec&lt;i32&gt;, target: i32) -&gt; i32 {`],
      ['init', `        ${k('let')} (${k('mut')} lo, ${k('mut')} hi) = (0i32, nums.len() as i32 - 1);`],
      [null, `        ${k('while')} lo &lt;= hi {`],
      ['mid', `            ${k('let')} mid = (lo + hi) / 2;`],
      [null, `            ${k('let')} (a, m, b) = (nums[lo as usize], nums[mid as usize], nums[hi as usize]);`],
      ['hit', `            ${k('if')} m == target {`],
      [null, `                ${k('return')} mid;`],
      [null, `            }`],
      ['half', `            ${k('if')} a &lt;= m {`],
      ['inleft', `                ${k('if')} a &lt;= target &amp;&amp; target &lt; m {`],
      ['keepl', `                    hi = mid - 1;`],
      [null, `                } ${k('else')} {`],
      ['dropl', `                    lo = mid + 1;`],
      [null, `                }`],
      [null, `            } ${k('else')} {`],
      ['inright', `                ${k('if')} m &lt; target &amp;&amp; target &lt;= b {`],
      ['keepr', `                    lo = mid + 1;`],
      [null, `                } ${k('else')} {`],
      ['dropr', `                    hi = mid - 1;`],
      [null, `                }`],
      [null, `            }`],
      [null, `        }`],
      ['miss', `        -1`],
      [null, `    }`],
      [null, `}`],
    ],
  },
};

/* ---------------- part 1: the "one side is always sorted" widget ----------------
 *
 * The statement hinges on the rotation: however far [0,1,2,4,5,6,7] is
 * rotated, the drop sits in one place, so a cut at the middle always leaves
 * one side in order. Drag the rotation and watch which side it is.
 *
 * Built from x-sum's widget vocabulary: .q-arr cells (kept / cut), the
 * .q-slider, the amber .q-tie line and the .ledger. */

const QW_BASE = [0, 1, 2, 4, 5, 6, 7];

function mountRotationWidget(host) {
  const state = { k: 4 };
  host.innerHTML = `
    <div class="q-arr" data-arr></div>
    <div class="q-slider">
      <label for="qw-k" data-lbl></label>
      <input type="range" id="qw-k" min="0" max="${QW_BASE.length - 1}" value="4">
      <output data-out>4</output>
    </div>
    <p class="q-tie" data-line></p>
    <div class="ledger">
      <span class="expr" data-expr></span>
      <span class="total" data-total></span>
    </div>`;
  const q = (sel) => host.querySelector(sel);

  function render() {
    const n = QW_BASE.length;
    const k = state.k;
    const nums = [...QW_BASE.slice(k), ...QW_BASE.slice(0, k)];
    const mid = Math.floor((n - 1) / 2);
    const leftSorted = nums[0] <= nums[mid];
    const drop = nums.findIndex((v, i) => i > 0 && v < nums[i - 1]);
    q('[data-lbl]').textContent = pick(t('rotate by', 'လှည့်'));
    q('#qw-k').value = String(k);
    q('[data-out]').textContent = String(k);
    q('[data-arr]').innerHTML = nums.map((v, i) => {
      const inSorted = leftSorted ? i <= mid : i >= mid;
      return `<div class="cell ${inSorted ? 'kept' : 'cut'}${i === mid ? ' picked' : ''}"><span>${v}</span><span class="idx">${i}</span></div>`;
    }).join('');
    widgetLabel(pick(t(`mid = index ${mid}`, `mid = index ${mid}`)));
    q('[data-line]').innerHTML = pick(drop < 0
      ? t('Not rotated at all: both sides are sorted, and the left one is found first.', 'လုံးဝ မလှည့်ထားပါ — ဘေးနှစ်ဘက်လုံး စီထားပြီး ဘယ်ဘက်ကို အရင်တွေ့သည်။')
      : t(`The drop is from ${nums[drop - 1]} to ${nums[drop]}, between index ${drop - 1} and ${drop} — inside the ${leftSorted ? 'right' : 'left'} side of mid. So the ${leftSorted ? 'left' : 'right'} side has no drop and is sorted.`,
          `ကျဆင်းရာမှာ ${nums[drop - 1]} မှ ${nums[drop]} သို့၊ index ${drop - 1} နှင့် ${drop} ကြား — mid ၏ ${leftSorted ? 'ညာ' : 'ဘယ်'}ဘက်အတွင်း။ ထို့ကြောင့် ${leftSorted ? 'ဘယ်' : 'ညာ'}ဘက်တွင် ကျဆင်းရာ မရှိ၍ စီထားသည်။`));
    q('[data-expr]').innerHTML = `nums[0] = ${nums[0]} ${leftSorted ? '≤' : '&gt;'} nums[${mid}] = ${nums[mid]}`;
    q('[data-total]').innerHTML = `${pick(leftSorted ? t('left', 'ဘယ်') : t('right', 'ညာ'))}<small>${pick(t('sorted side', 'စီထားသော ဘက်'))}</small>`;
  }
  host.addEventListener('input', (ev) => {
    if (ev.target.id !== 'qw-k') return;
    state.k = Number(ev.target.value); render();
  });
  onLangChange(render);
  render();
}

/* ---------------- the approach, in brief ---------------- */

const APPROACH = {
  scan: {
    idea: t('Look at every value until one is the target. The rotation does not matter, because nothing about the order is used.',
            'target တွေ့သည်အထိ value တိုင်းကို ကြည့်သည်။ အစီအစဉ်ကို မသုံးသဖြင့် လှည့်ထားခြင်း အရေးမကြီးပါ။'),
    steps: [
      t('Walk <code>i</code> from 0.', '<code>i</code> ကို 0 မှ လျှောက်သည်။'),
      t('Return <code>i</code> when <code>nums[i] == target</code>; return -1 at the end.', '<code>nums[i] == target</code> ဖြစ်လျှင် <code>i</code> ကို ပြန်ပေးသည် — အဆုံးတွင် -1။'),
    ],
    cost: t('up to n comparisons — 5000 at the limit. It passes the judge, but the statement asks for O(log n).',
            'နှိုင်းယှဉ်ခြင်း n အထိ — ကန့်သတ်ချက်တွင် 5000။ judge ကို အောင်သော်လည်း မေးခွန်းက O(log n) တောင်းသည်။'),
  },
  binary: {
    idea: t('Cut the range at mid. The rotation\'s one drop is on at most one side, so the other side is sorted — and a sorted run holds exactly the values between its ends. Check whether the target is one of them, and keep that half or the other.',
            'range ကို mid တွင် ဖြတ်သည်။ လှည့်ခြင်း၏ ကျဆင်းရာ တစ်ခုသည် တစ်ဘက်တွင်သာ ရှိနိုင်သဖြင့် ကျန်ဘက်သည် စီထားသည် — စီထားသော run တွင် ၎င်း၏ အစွန်းနှစ်ဘက်ကြားရှိ value များသာ ပါသည်။ target သည် ၎င်းတို့ထဲ ပါသလား စစ်ပြီး ထိုတစ်ဝက် သို့မဟုတ် ကျန်တစ်ဝက်ကို ထားသည်။'),
    steps: [
      t('<code>mid = (lo + hi) / 2</code>; return it if it holds the target.', '<code>mid = (lo + hi) / 2</code> — target ရှိလျှင် ပြန်ပေးသည်။'),
      t('If <code>nums[lo] &lt;= nums[mid]</code>, the left side is sorted; otherwise the right side is.',
        '<code>nums[lo] &lt;= nums[mid]</code> ဖြစ်လျှင် ဘယ်ဘက် စီထားသည် — မဟုတ်လျှင် ညာဘက်။'),
      t('If the target lies between that side\'s ends, search there; otherwise search the other side.',
        'target သည် ထိုဘက်၏ အစွန်းများကြားတွင် ရှိလျှင် ထိုနေရာတွင် ရှာသည် — မဟုတ်လျှင် ကျန်ဘက်တွင်။'),
    ],
    cost: t('each step halves the range: at most 13 steps at n = 5000.', 'အဆင့်တိုင်း range ကို တစ်ဝက်ချသည် — n = 5000 တွင် အဆင့် 13 အထိ။'),
  },
};

/* ---------------- mount ---------------- */

const EX = [4, 5, 6, 7, 0, 1, 2];

mountLesson({
  input: { nums: EX, target: 0 },
  controls: [
    { key: 'nums', label: 'nums', parse: intList({ max: MAX_LEN, distinct: true, check: rotatedOnce }) },
    { key: 'target', label: 'target', type: 'number', parse: intValue() },
  ],
  presets: [
    { label: exampleTitle(1), input: { nums: EX, target: 0 } },
    { label: exampleTitle(2), input: { nums: EX, target: 3 } },
    { label: exampleTitle(3), input: { nums: [1], target: 0 } },
    { label: t('Target at lo', 'lo တွင် target'), input: { nums: EX, target: 4 } },
    { label: t('Not rotated', 'မလှည့်'), input: { nums: [1, 3, 5, 7, 9, 11, 13], target: 11 } },
  ],
  examples: [
    { title: exampleTitle(1), inputHtml: '<code>nums = [4,5,6,7,0,1,2]</code>, <code>target = 0</code>', output: '4',
      why: [t('0 sits at index 4, just after the drop from 7.', '0 သည် 7 မှ ကျဆင်းရာ၏ နောက်တွင် index 4 ၌ ရှိသည်။')],
      load: { nums: EX, target: 0 } },
    { title: exampleTitle(2), inputHtml: '<code>nums = [4,5,6,7,0,1,2]</code>, <code>target = 3</code>', output: '-1',
      why: [t('3 is not in the array.', '3 သည် array ထဲ မရှိပါ။')],
      load: { nums: EX, target: 3 } },
    { title: exampleTitle(3), inputHtml: '<code>nums = [1]</code>, <code>target = 0</code>', output: '-1',
      why: [t('One value, and it is not 0.', 'value တစ်ခုတည်း၊ ၎င်းသည် 0 မဟုတ်ပါ။')],
      load: { nums: [1], target: 0 } },
  ],
  modes: [
    { id: 'scan', name: 'Linear scan',
      desc: t('Check every value; ignore the order.', 'value တိုင်းကို စစ်သည် — အစီအစဉ်ကို လျစ်လျူရှုသည်။'),
      cost: 'O(n) time · O(1) space', build: buildScan },
    { id: 'binary', name: 'Binary search',
      sub: t('find the sorted side', 'စီထားသော ဘက်ကို ရှာ'),
      desc: t('One side of mid is sorted; is the target in it?', 'mid ၏ တစ်ဘက်သည် စီထားသည် — target ၎င်းထဲ ရှိသလား။'),
      cost: 'O(log n) time · O(1) space', build: buildBinary },
  ],
  languages: LANGUAGES,
  code: CODE,
  solutions: {
    scan: { approach: APPROACH.scan,
      desc: t('A loop over every value. Correct, and fast enough at n = 5000 — but linear, where the statement asks for O(log n).',
              'value တိုင်းအပေါ် loop တစ်ခု။ မှန်ပြီး n = 5000 တွင် လုံလောက်အောင် မြန်သည် — သို့သော် မေးခွန်းက O(log n) တောင်းသည့်နေရာတွင် linear ဖြစ်သည်။') },
    binary: { approach: APPROACH.binary,
      desc: t('The submission worth writing: find the sorted side of mid, test the target against its ends, keep one half. The <code>&lt;=</code> in the side test and in <code>nums[lo] &lt;= target</code> are the two that go wrong.',
              'ရေးသင့်သည့် submission — mid ၏ စီထားသော ဘက်ကို ရှာ၊ target ကို ၎င်း၏ အစွန်းများနှင့် စစ်၊ တစ်ဝက်ကို ထား။ ဘက်စစ်ခြင်းနှင့် <code>nums[lo] &lt;= target</code> ရှိ <code>&lt;=</code> နှစ်ခုသည် မှားလွယ်သည်။') },
  },
  // How each language was actually checked, printed as the part 3 badges.
  // The corpus: the 3 examples, 6 edges, 15,000 random rotated arrays of 1–9
  // distinct values with targets often absent, 5,000 of up to 200 across
  // ±10⁴, and five at n = 5000 — against a value → index dictionary. Go and
  // Rust ran in Docker (golang:1.23-alpine, rust:1-slim).
  verification: {
    ruby: 'ran here · 20,014 cases',
    python: 'ran here · 20,014 cases',
    javascript: 'ran here · 20,014 cases',
    go: 'ran here · 20,014 cases · Go 1.23',
    rust: 'ran here · 20,014 cases · rustc 1.98',
  },
  strip,
  draw,
  answer,
  vars,
  widget: mountRotationWidget,
});
