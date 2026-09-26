/* Median of Two Sorted Arrays — LeetCode 4.
 *
 * The median splits the combined values into a left half and a right half.
 * Walking the merge up to the middle finds it in O(m + n). The statement asks
 * for O(log(m + n)): instead of merging, choose how many values the shorter
 * array gives to the left half — i — and the longer one must give the rest,
 * j = half − i. The split is right when everything on the left is ≤
 * everything on the right, which only needs the four values at the cut; if
 * nums1's left value is too big, give fewer (move left), if nums2's is too
 * big, give more. That is a binary search on i.
 */
import { mountLesson } from '../../lib/stepper.js';
import { pick, onLangChange } from '../../lib/i18n.js';
import { cells, slots, stagePanel, readout } from '../../lib/stage.js';
import { t, exampleTitle, LANGUAGES, k, c, labelledRows, stageGap, listText, presetChips, widgetLabel } from '../../lib/kit.js';

const MAX_EACH = 8;
const fmt = (x) => x.toFixed(5);
const INF = '∞';

function sortedList(text) {
  const s = String(text).trim().replace(/^\[|\]$/g, '').trim();
  if (!/^[-\d\s,]*$/.test(s)) throw new Error('whole numbers, separated by commas');
  const list = s ? s.split(/[\s,]+/).filter(Boolean).map(Number) : [];
  if (list.some((v) => !Number.isInteger(v))) throw new Error('whole numbers only');
  if (list.length > MAX_EACH) throw new Error(`at most ${MAX_EACH} values, so the stage stays readable`);
  if (list.some((v, i) => i && list[i - 1] > v)) throw new Error('sorted, smallest first');
  return list;
}
const show = (v) => (v === -Infinity ? `−${INF}` : v === Infinity ? INF : String(v));

/* ---------------- step generators ---------------- */

function need({ nums1, nums2 }) {
  if (!nums1.length && !nums2.length) throw new Error('at least one value between the two arrays');
}

function buildMerge(input) {
  need(input);
  const { nums1: a, nums2: b } = input;
  const total = a.length + b.length;
  let i = 0, j = 0, prev = 0, cur = 0;
  const steps = [];
  const taken = [];
  const snap = (extra) => ({ view: 'merge', i, j, prev, cur, taken: [...taken], ...extra });
  for (let step = 0; step <= Math.floor(total / 2); step++) {
    prev = cur;
    const fromA = j >= b.length || (i < a.length && a[i] <= b[j]);
    cur = fromA ? a[i++] : b[j++];
    taken.push(cur);
    steps.push(snap({ line: 'take', from: fromA ? 1 : 2, step, tag: t(`#${step} = ${cur}`, `#${step} = ${cur}`),
      note: t(`Merged value #${step}: ${fromA ? `nums1[${i - 1}]` : `nums2[${j - 1}]`} = ${cur}, the smaller of the two heads. prev = ${prev}, cur = ${cur}.`,
              `ပေါင်းပြီး value #${step} — ${fromA ? `nums1[${i - 1}]` : `nums2[${j - 1}]`} = ${cur}၊ ခေါင်းနှစ်ခုထဲမှ ငယ်သည်။ prev = ${prev}၊ cur = ${cur}။`) }));
  }
  const med = total % 2 ? cur : (prev + cur) / 2;
  steps.push(snap({ line: 'ret', finished: true, median: med, tag: t(fmt(med), fmt(med)),
    note: total % 2
      ? t(`${total} values, odd: the median is value #${Math.floor(total / 2)}, ${cur}. The merge stopped halfway — ${Math.floor(total / 2) + 1} of ${total} values taken.`,
          `value ${total} ခု၊ မ — median သည် value #${Math.floor(total / 2)}၊ ${cur}။ merge သည် တစ်ဝက်တွင် ရပ်သည် — ${total} အနက် ${Math.floor(total / 2) + 1} ခု ယူခဲ့သည်။`)
      : t(`${total} values, even: the median is the average of values #${total / 2 - 1} and #${total / 2}, (${prev} + ${cur}) / 2 = ${med}.`,
          `value ${total} ခု၊ စုံ — median သည် value #${total / 2 - 1} နှင့် #${total / 2} ၏ ပျမ်းမျှ၊ (${prev} + ${cur}) / 2 = ${med}။`) }));
  return steps;
}

function buildCut(input) {
  need(input);
  let a = input.nums1, b = input.nums2;
  const steps = [];
  let swapped = false;
  if (a.length > b.length) { [a, b] = [b, a]; swapped = true; }
  const m = a.length, n = b.length, half = Math.floor((m + n + 1) / 2);
  let lo = 0, hi = m;
  const snap = (extra) => ({ view: 'cut', a, b, swapped, lo, hi, half, i: null, j: null, ...extra });
  steps.push(snap({ line: 'swap', tag: t(swapped ? 'swapped' : 'nums1 is shorter', swapped ? 'လဲပြီး' : 'nums1 တိုသည်'),
    note: swapped
      ? t(`nums1 is the longer one, so swap them: search the cut in the shorter array (${m} values), so the other cut j = half − i can never fall off its array.`,
          `nums1 ပိုရှည်သဖြင့် လဲသည် — ပိုတိုသော array (value ${m}) ထဲတွင် ဖြတ်ရာကို ရှာသည်၊ ထို့ကြောင့် အခြား ဖြတ်ရာ j = half − i သည် ၎င်း၏ array မှ ဘယ်တော့မှ မပြုတ်ကျ။`)
      : t(`nums1 (${m}) is not longer than nums2 (${n}): search the cut in nums1, so j = half − i always lands inside nums2. The left half holds half = ${half} values.`,
          `nums1 (${m}) သည် nums2 (${n}) ထက် မရှည်ပါ — nums1 ထဲတွင် ဖြတ်ရာကို ရှာသဖြင့် j = half − i သည် nums2 အတွင်း အမြဲ ကျသည်။ ဘယ်တစ်ဝက်တွင် half = ${half} ခု ရှိသည်။`) }));
  while (lo <= hi) {
    const i = (lo + hi) >> 1, j = half - i;
    const l1 = i > 0 ? a[i - 1] : -Infinity, r1 = i < m ? a[i] : Infinity;
    const l2 = j > 0 ? b[j - 1] : -Infinity, r2 = j < n ? b[j] : Infinity;
    const cut = { i, j, l1, r1, l2, r2 };
    steps.push(snap({ line: 'cut', ...cut, tag: t(`i = ${i}, j = ${j}`, `i = ${i}, j = ${j}`),
      note: t(`Try i = (${lo} + ${hi}) / 2 = ${i} values from the shorter array and j = ${half} − ${i} = ${j} from the other. At the cut: left ${show(l1)} | ${show(r1)} right, and left ${show(l2)} | ${show(r2)} right.`,
              `ပိုတိုသော array မှ i = (${lo} + ${hi}) / 2 = ${i} ခု နှင့် အခြားမှ j = ${half} − ${i} = ${j} ခု စမ်းသည်။ ဖြတ်ရာတွင် — ဘယ် ${show(l1)} | ${show(r1)} ညာ၊ နှင့် ဘယ် ${show(l2)} | ${show(r2)} ညာ။`) }));
    if (l1 > r2) {
      hi = i - 1;
      steps.push(snap({ line: 'left', ...cut, bad: 1, tag: t(`${show(l1)} > ${show(r2)}: fewer`, `${show(l1)} > ${show(r2)}: လျော့`),
        note: t(`${show(l1)} on the left is bigger than ${show(r2)} on the right: the shorter array gives too many. hi = ${hi}.`,
                `ဘယ်ရှိ ${show(l1)} သည် ညာရှိ ${show(r2)} ထက် ကြီးသည် — ပိုတိုသော array က အများကြီး ပေးနေသည်။ hi = ${hi}။`) }));
    } else if (l2 > r1) {
      lo = i + 1;
      steps.push(snap({ line: 'right', ...cut, bad: 2, tag: t(`${show(l2)} > ${show(r1)}: more`, `${show(l2)} > ${show(r1)}: တိုး`),
        note: t(`${show(l2)} on the left is bigger than ${show(r1)} on the right: the shorter array gives too few. lo = ${lo}.`,
                `ဘယ်ရှိ ${show(l2)} သည် ညာရှိ ${show(r1)} ထက် ကြီးသည် — ပိုတိုသော array က နည်းနည်း ပေးနေသည်။ lo = ${lo}။`) }));
    } else {
      const med = (m + n) % 2 ? Math.max(l1, l2) : (Math.max(l1, l2) + Math.min(r1, r2)) / 2;
      steps.push(snap({ line: 'done', ...cut, finished: true, median: med, tag: t(fmt(med), fmt(med)),
        note: (m + n) % 2
          ? t(`Both left values are ≤ both right values: the split is right. ${m + n} values, odd, so the median is the larger left value, ${med}.`,
              `ဘယ် value နှစ်ခုလုံး ≤ ညာ value နှစ်ခုလုံး — ခွဲခြမ်းမှု မှန်သည်။ value ${m + n}၊ မ ဖြစ်သဖြင့် median သည် ပိုကြီးသော ဘယ် value ${med}။`)
          : t(`Both left values are ≤ both right values: the split is right. ${m + n} values, even: (max left ${Math.max(l1, l2)} + min right ${Math.min(r1, r2)}) / 2 = ${med}.`,
              `ဘယ် value နှစ်ခုလုံး ≤ ညာ value နှစ်ခုလုံး — ခွဲခြမ်းမှု မှန်သည်။ value ${m + n}၊ စုံ — (max left ${Math.max(l1, l2)} + min right ${Math.min(r1, r2)}) / 2 = ${med}။`) }));
      return steps;
    }
  }
  return steps;
}

/* ---------------- drawing ----------------
 *
 * The strip card is the two arrays as given. The stage is what each approach
 * holds: the merge taken so far with prev and cur, or the two arrays with the
 * cut drawn — the values that go to the left half lit, and the four values
 * the check compares marked. */

function strip(s, { nums1, nums2 }) {
  const row = (arr, name) => [name, arr.length ? cells(arr, {
    tone: s.view === 'merge' ? Object.fromEntries(arr.map((_, x) => [x, x < (name === 'nums1' ? s.i : s.j) ? 'done' : null]).filter(([, v]) => v)) : {},
    marks: s.view === 'merge' && !s.finished ? { [name === 'nums1' ? s.i : s.j]: name === 'nums1' ? 'i' : 'j' } : {},
  }) : `<span class="note mono">${pick(t('empty', 'ဗလာ'))}</span>`];
  return labelledRows([row(nums1, 'nums1'), row(nums2, 'nums2')]);
}

function draw(s) {
  if (s.view === 'merge') {
    return stagePanel(pick(t('The merge, up to the middle', 'merge — အလယ်အထိ')), '', cells(s.taken, { index: true, tone: s.taken.length ? { [s.taken.length - 1]: 'entering' } : {} }))
      + stageGap + readout({ prev: s.prev, cur: s.cur });
  }
  const row = (arr, cut, name, lBad, rBad) => [name, arr.length ? cells(arr, {
    tone: Object.fromEntries(arr.map((_, x) => [x, cut == null ? null : x < cut ? 'entering' : null]).filter(([, v]) => v)),
    marks: cut == null ? {} : Object.fromEntries([[cut - 1, lBad ? 'left ✗' : 'left'], [cut, rBad ? 'right ✗' : 'right']].filter(([x]) => x >= 0 && x < arr.length)),
  }) : `<span class="note mono">${pick(t('empty', 'ဗလာ'))}</span>`];
  const names = s.swapped ? ['nums2', 'nums1'] : ['nums1', 'nums2'];
  return stagePanel(pick(t('The cut — lit values go to the left half', 'ဖြတ်ရာ — လင်းသော value များ ဘယ်တစ်ဝက်သို့')), s.i != null ? `i = ${s.i} · j = ${s.j}` : '',
    labelledRows([row(s.a, s.i, `${names[0]} (a)`, s.bad === 1, s.bad === 2), row(s.b, s.j, `${names[1]} (b)`, s.bad === 2, s.bad === 1)]))
    + stageGap + readout({ lo: s.lo, hi: s.hi, half: s.half });
}

function answer(s) {
  return { html: slots(s.finished ? [fmt(s.median)] : [], { total: 1, just: s.finished ? 0 : -1 }), note: t('the median', 'median') };
}

function vars(s, { nums1, nums2 }) {
  const out = [['nums1', `[${listText(nums1)}]`], ['nums2', `[${listText(nums2)}]`]];
  if (s.view === 'merge') {
    out.push(['i', s.i], ['j', s.j], ['prev', s.prev], ['cur', s.cur], ['total', nums1.length + nums2.length]);
  } else {
    out.push(['m', s.a.length], ['n', s.b.length], ['half', s.half], ['lo', s.lo], ['hi', s.hi]);
    if (s.i != null) out.push(['i', s.i], ['j', s.j], ['left1', show(s.l1)], ['right1', show(s.r1)], ['left2', show(s.l2)], ['right2', show(s.r2)]);
  }
  return out;
}

/* ---------------- the code, one key per line ----------------
 *
 * Generated from the verified solution files, so the listing a reader copies
 * is byte-identical to the one that ran. */

const CODE = {
  merge: {
    ruby: [
      [null, `${k('def')} find_median_sorted_arrays(nums1, nums2)`],
      [null, `  total = nums1.length + nums2.length`],
      [null, `  i = j = 0`],
      [null, `  prev = cur = 0`],
      [null, `  (total / 2 + 1).times ${k('do')} ${c('# walk the merge only up to the middle')}`],
      ['take', `    prev = cur`],
      ['take', `    ${k('if')} j &gt;= nums2.length || (i &lt; nums1.length &amp;&amp; nums1[i] &lt;= nums2[j])`],
      ['take', `      cur = nums1[i]`],
      ['take', `      i += 1`],
      [null, `    ${k('else')}`],
      ['take', `      cur = nums2[j]`],
      ['take', `      j += 1`],
      [null, `    ${k('end')}`],
      [null, `  ${k('end')}`],
      ['ret', `  total.odd? ? cur.to_f : (prev + cur) / 2.0`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} findMedianSortedArrays(self, nums1, nums2):`],
      [null, `        total = len(nums1) + len(nums2)`],
      [null, `        i = j = 0`],
      [null, `        prev = cur = 0`],
      [null, `        ${k('for')} _ ${k('in')} range(total // 2 + 1):     ${c('# walk the merge only up to the middle')}`],
      ['take', `            prev = cur`],
      ['take', `            ${k('if')} j &gt;= len(nums2) or (i &lt; len(nums1) and nums1[i] &lt;= nums2[j]):`],
      ['take', `                cur = nums1[i]`],
      ['take', `                i += 1`],
      [null, `            ${k('else')}:`],
      ['take', `                cur = nums2[j]`],
      ['take', `                j += 1`],
      ['ret', `        ${k('return')} cur ${k('if')} total % 2 ${k('else')} (prev + cur) / 2`],
    ],
    javascript: [
      [null, `${k('const')} findMedianSortedArrays = ${k('function')} (nums1, nums2) {`],
      [null, `  ${k('const')} total = nums1.length + nums2.length;`],
      [null, `  ${k('let')} i = 0, j = 0, prev = 0, cur = 0;`],
      [null, `  ${k('for')} (${k('let')} step = 0; step &lt;= Math.floor(total / 2); step++) { ${c('// walk the merge only up to the middle')}`],
      ['take', `    prev = cur;`],
      ['take', `    ${k('if')} (j &gt;= nums2.length || (i &lt; nums1.length &amp;&amp; nums1[i] &lt;= nums2[j])) cur = nums1[i++];`],
      ['take', `    ${k('else')} cur = nums2[j++];`],
      [null, `  }`],
      ['ret', `  ${k('return')} total % 2 ? cur : (prev + cur) / 2;`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} findMedianSortedArrays(nums1 []int, nums2 []int) float64 {`],
      [null, `    total := len(nums1) + len(nums2)`],
      [null, `    i, j, prev, cur := 0, 0, 0, 0`],
      [null, `    ${k('for')} step := 0; step &lt;= total/2; step++ { ${c('// walk the merge only up to the middle')}`],
      ['take', `        prev = cur`],
      ['take', `        ${k('if')} j &gt;= len(nums2) || (i &lt; len(nums1) &amp;&amp; nums1[i] &lt;= nums2[j]) {`],
      ['take', `            cur = nums1[i]`],
      ['take', `            i++`],
      [null, `        } ${k('else')} {`],
      ['take', `            cur = nums2[j]`],
      ['take', `            j++`],
      [null, `        }`],
      [null, `    }`],
      ['ret', `    ${k('if')} total%2 == 1 {`],
      ['ret', `        ${k('return')} float64(cur)`],
      [null, `    }`],
      ['ret', `    ${k('return')} float64(prev+cur) / 2`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} find_median_sorted_arrays(nums1: Vec&lt;i32&gt;, nums2: Vec&lt;i32&gt;) -&gt; f64 {`],
      [null, `        ${k('let')} total = nums1.len() + nums2.len();`],
      [null, `        ${k('let')} (${k('mut')} i, ${k('mut')} j, ${k('mut')} prev, ${k('mut')} cur) = (0, 0, 0, 0);`],
      [null, `        ${k('for')} _ ${k('in')} 0..=total / 2 { ${c('// walk the merge only up to the middle')}`],
      ['take', `            prev = cur;`],
      ['take', `            ${k('if')} j &gt;= nums2.len() || (i &lt; nums1.len() &amp;&amp; nums1[i] &lt;= nums2[j]) {`],
      ['take', `                cur = nums1[i];`],
      ['take', `                i += 1;`],
      [null, `            } ${k('else')} {`],
      ['take', `                cur = nums2[j];`],
      ['take', `                j += 1;`],
      [null, `            }`],
      [null, `        }`],
      ['ret', `        ${k('if')} total % 2 == 1 { cur as f64 } ${k('else')} { (prev + cur) as f64 / 2.0 }`],
      [null, `    }`],
      [null, `}`],
    ],
  },
  cut: {
    ruby: [
      [null, `${k('def')} find_median_sorted_arrays(nums1, nums2)`],
      ['swap', `  nums1, nums2 = nums2, nums1 ${k('if')} nums1.length &gt; nums2.length`],
      [null, `  m, n = nums1.length, nums2.length`],
      [null, `  half = (m + n + 1) / 2 ${c('# how many values the left half holds')}`],
      [null, `  lo, hi = 0, m`],
      [null, `  loop ${k('do')}`],
      ['cut', `    i = (lo + hi) / 2`],
      ['cut', `    j = half - i`],
      ['cut', `    left1 = i &gt; 0 ? nums1[i - 1] : -Float::INFINITY`],
      ['cut', `    right1 = i &lt; m ? nums1[i] : Float::INFINITY`],
      ['cut', `    left2 = j &gt; 0 ? nums2[j - 1] : -Float::INFINITY`],
      ['cut', `    right2 = j &lt; n ? nums2[j] : Float::INFINITY`],
      ['left', `    ${k('if')} left1 &gt; right2`],
      ['left', `      hi = i - 1`],
      ['right', `    elsif left2 &gt; right1`],
      ['right', `      lo = i + 1`],
      ['done', `    elsif (m + n).odd?`],
      ['done', `      ${k('return')} [left1, left2].max.to_f`],
      [null, `    ${k('else')}`],
      ['done', `      ${k('return')} ([left1, left2].max + [right1, right2].min) / 2.0`],
      [null, `    ${k('end')}`],
      [null, `  ${k('end')}`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} findMedianSortedArrays(self, nums1, nums2):`],
      ['swap', `        ${k('if')} len(nums1) &gt; len(nums2):`],
      ['swap', `            nums1, nums2 = nums2, nums1`],
      [null, `        m, n = len(nums1), len(nums2)`],
      [null, `        half = (m + n + 1) // 2               ${c('# how many values the left half holds')}`],
      [null, `        lo, hi = 0, m`],
      [null, `        ${k('while')} lo &lt;= hi:`],
      ['cut', `            i = (lo + hi) // 2               ${c('# nums1 gives i values to the left half')}`],
      ['cut', `            j = half - i                     ${c('# nums2 gives the rest')}`],
      ['cut', `            left1 = nums1[i - 1] ${k('if')} i &gt; 0 ${k('else')} float('-inf')`],
      ['cut', `            right1 = nums1[i] ${k('if')} i &lt; m ${k('else')} float('inf')`],
      ['cut', `            left2 = nums2[j - 1] ${k('if')} j &gt; 0 ${k('else')} float('-inf')`],
      ['cut', `            right2 = nums2[j] ${k('if')} j &lt; n ${k('else')} float('inf')`],
      ['left', `            ${k('if')} left1 &gt; right2:`],
      ['left', `                hi = i - 1`],
      ['right', `            elif left2 &gt; right1:`],
      ['right', `                lo = i + 1`],
      ['done', `            elif (m + n) % 2:`],
      ['done', `                ${k('return')} max(left1, left2)`],
      [null, `            ${k('else')}:`],
      ['done', `                ${k('return')} (max(left1, left2) + min(right1, right2)) / 2`],
    ],
    javascript: [
      [null, `${k('const')} findMedianSortedArrays = ${k('function')} (nums1, nums2) {`],
      ['swap', `  ${k('if')} (nums1.length &gt; nums2.length) [nums1, nums2] = [nums2, nums1];`],
      [null, `  ${k('const')} m = nums1.length, n = nums2.length;`],
      [null, `  ${k('const')} half = Math.floor((m + n + 1) / 2); ${c('// how many values the left half holds')}`],
      [null, `  ${k('let')} lo = 0, hi = m;`],
      [null, `  ${k('while')} (lo &lt;= hi) {`],
      ['cut', `    ${k('const')} i = (lo + hi) &gt;&gt; 1;`],
      ['cut', `    ${k('const')} j = half - i;`],
      ['cut', `    ${k('const')} left1 = i &gt; 0 ? nums1[i - 1] : -Infinity;`],
      ['cut', `    ${k('const')} right1 = i &lt; m ? nums1[i] : Infinity;`],
      ['cut', `    ${k('const')} left2 = j &gt; 0 ? nums2[j - 1] : -Infinity;`],
      ['cut', `    ${k('const')} right2 = j &lt; n ? nums2[j] : Infinity;`],
      ['left', `    ${k('if')} (left1 &gt; right2) hi = i - 1;`],
      ['right', `    ${k('else')} ${k('if')} (left2 &gt; right1) lo = i + 1;`],
      ['done', `    ${k('else')} ${k('if')} ((m + n) % 2) ${k('return')} Math.max(left1, left2);`],
      ['done', `    ${k('else')} ${k('return')} (Math.max(left1, left2) + Math.min(right1, right2)) / 2;`],
      [null, `  }`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} findMedianSortedArrays(nums1 []int, nums2 []int) float64 {`],
      ['swap', `    ${k('if')} len(nums1) &gt; len(nums2) {`],
      ['swap', `        nums1, nums2 = nums2, nums1`],
      [null, `    }`],
      [null, `    m, n := len(nums1), len(nums2)`],
      [null, `    half := (m + n + 1) / 2 ${c('// how many values the left half holds')}`],
      [null, `    lo, hi := 0, m`],
      [null, `    at := ${k('func')}(a []int, k int) int { ${c('// a[k], with the ends as ±infinity')}`],
      [null, `        ${k('if')} k &lt; 0 {`],
      [null, `            ${k('return')} -1 &lt;&lt; 62`],
      [null, `        }`],
      [null, `        ${k('if')} k &gt;= len(a) {`],
      [null, `            ${k('return')} 1 &lt;&lt; 62`],
      [null, `        }`],
      [null, `        ${k('return')} a[k]`],
      [null, `    }`],
      [null, `    ${k('for')} lo &lt;= hi {`],
      ['cut', `        i := (lo + hi) / 2`],
      ['cut', `        j := half - i`],
      ['cut', `        left1, right1 := at(nums1, i-1), at(nums1, i)`],
      ['cut', `        left2, right2 := at(nums2, j-1), at(nums2, j)`],
      ['left', `        ${k('if')} left1 &gt; right2 {`],
      ['left', `            hi = i - 1`],
      ['right', `        } ${k('else')} ${k('if')} left2 &gt; right1 {`],
      ['right', `            lo = i + 1`],
      ['done', `        } ${k('else')} ${k('if')} (m+n)%2 == 1 {`],
      ['done', `            ${k('return')} float64(max(left1, left2))`],
      [null, `        } ${k('else')} {`],
      ['done', `            ${k('return')} float64(max(left1, left2)+min(right1, right2)) / 2`],
      [null, `        }`],
      [null, `    }`],
      [null, `    ${k('return')} 0`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} find_median_sorted_arrays(nums1: Vec&lt;i32&gt;, nums2: Vec&lt;i32&gt;) -&gt; f64 {`],
      ['swap', `        ${k('let')} (a, b) = ${k('if')} nums1.len() &gt; nums2.len() { (nums2, nums1) } ${k('else')} { (nums1, nums2) };`],
      [null, `        ${k('let')} (m, n) = (a.len(), b.len());`],
      [null, `        ${k('let')} half = (m + n + 1) / 2; ${c('// how many values the left half holds')}`],
      [null, `        ${k('let')} at = |v: &amp;Vec&lt;i32&gt;, k: isize| -&gt; i64 { ${c('// v[k], with the ends as ±infinity')}`],
      [null, `            ${k('if')} k &lt; 0 { i64::MIN } ${k('else')} ${k('if')} k as usize &gt;= v.len() { i64::MAX } ${k('else')} { v[k as usize] as i64 }`],
      [null, `        };`],
      [null, `        ${k('let')} (${k('mut')} lo, ${k('mut')} hi) = (0isize, m as isize);`],
      [null, `        ${k('while')} lo &lt;= hi {`],
      ['cut', `            ${k('let')} i = (lo + hi) / 2;`],
      ['cut', `            ${k('let')} j = half as isize - i;`],
      ['cut', `            ${k('let')} (left1, right1) = (at(&amp;a, i - 1), at(&amp;a, i));`],
      ['cut', `            ${k('let')} (left2, right2) = (at(&amp;b, j - 1), at(&amp;b, j));`],
      ['left', `            ${k('if')} left1 &gt; right2 {`],
      ['left', `                hi = i - 1;`],
      ['right', `            } ${k('else')} ${k('if')} left2 &gt; right1 {`],
      ['right', `                lo = i + 1;`],
      ['done', `            } ${k('else')} ${k('if')} (m + n) % 2 == 1 {`],
      ['done', `                ${k('return')} left1.max(left2) as f64;`],
      [null, `            } ${k('else')} {`],
      ['done', `                ${k('return')} (left1.max(left2) + right1.min(right2)) as f64 / 2.0;`],
      [null, `            }`],
      [null, `        }`],
      [null, `        0.0`],
      [null, `    }`],
      [null, `}`],
    ],
  },
};

/* ---------------- part 1: the "move the cut" widget ----------------
 *
 * Drag i, the number of values the first array gives to the left half; the
 * second gives the rest. The split is the median's split exactly when both
 * left values are ≤ both right values — and when it is not, the widget says
 * which way to move, which is the whole binary search. */

const QW_SETS = [
  { label: exampleTitle(2), a: [1, 2], b: [3, 4] },
  { label: t('interleaved', 'ရောယှက်'), a: [1, 3, 5, 7, 9], b: [2, 4, 6, 8, 10, 12] },
  { label: t('one side low', 'တစ်ဖက် နိမ့်'), a: [1, 2, 3], b: [10, 11, 12, 13] },
];

function mountCutWidget(host) {
  const state = { set: 1, i: 0 };
  host.innerHTML = `
    <div data-rows></div>
    <div class="q-slider"><label for="med-i" data-lab></label><input id="med-i" type="range" min="0" data-i><output data-out></output>
      <span class="q-presets" data-presets></span></div>
    <p class="q-tie" data-line></p>
    <div class="ledger">
      <span class="expr" data-expr></span>
      <span class="total" data-total></span>
    </div>`;
  const q = (sel) => host.querySelector(sel);

  function render() {
    const { a, b } = QW_SETS[state.set];
    const m = a.length, n = b.length, half = Math.floor((m + n + 1) / 2);
    const i = Math.min(state.i, m), j = half - i;
    const l1 = i > 0 ? a[i - 1] : -Infinity, r1 = i < m ? a[i] : Infinity, l2 = j > 0 ? b[j - 1] : -Infinity, r2 = j < n ? b[j] : Infinity;
    const row = (arr, cut, name) => `<div class="q-arr"><span class="q-row-label">${name}</span>${arr.map((v, x) =>
      `<div class="cell ${x < cut ? 'kept' : 'cut'}${x === cut - 1 || x === cut ? ' picked' : ''}"><span>${v}</span><span class="idx">${x < cut ? 'L' : 'R'}</span></div>`).join('')}</div>`;
    q('[data-rows]').innerHTML = row(a, i, 'nums1') + row(b, j, 'nums2');
    q('[data-lab]').textContent = 'i';
    const el = q('[data-i]'); el.max = String(m); el.value = String(i);
    q('[data-out]').textContent = `${i} · j = ${j}`;
    q('[data-presets]').innerHTML = presetChips(QW_SETS, state.set);
    widgetLabel(pick(t(`left half: ${half} values`, `ဘယ်တစ်ဝက် — value ${half}`)));
    const ok = l1 <= r2 && l2 <= r1;
    q('[data-line]').innerHTML = pick(ok
      ? t(`Every value on the left is ≤ every value on the right: this is the median's split. You only need to check ${show(l1)} ≤ ${show(r2)} and ${show(l2)} ≤ ${show(r1)} — each array is sorted already.`,
          `ဘယ်ရှိ value တိုင်း ≤ ညာရှိ value တိုင်း — ဤသည် median ၏ ခွဲခြမ်းမှု။ ${show(l1)} ≤ ${show(r2)} နှင့် ${show(l2)} ≤ ${show(r1)} ကိုသာ စစ်ရန် လိုသည် — array တစ်ခုစီ စီပြီးသား။`)
      : l1 > r2
        ? t(`${show(l1)} from nums1 is on the left but bigger than ${show(r2)} on the right: nums1 gives too many — move i left.`,
            `nums1 မှ ${show(l1)} သည် ဘယ်တွင် ရှိသော်လည်း ညာရှိ ${show(r2)} ထက် ကြီးသည် — nums1 က အများကြီး ပေးနေသည် — i ကို ဘယ်သို့ ရွှေ့ပါ။`)
        : t(`${show(l2)} from nums2 is on the left but bigger than ${show(r1)} on the right: nums1 gives too few — move i right.`,
            `nums2 မှ ${show(l2)} သည် ဘယ်တွင် ရှိသော်လည်း ညာရှိ ${show(r1)} ထက် ကြီးသည် — nums1 က နည်းနည်း ပေးနေသည် — i ကို ညာသို့ ရွှေ့ပါ။`));
    q('[data-expr]').innerHTML = `${show(l1)} ≤ ${show(r2)} ${l1 <= r2 ? '✓' : '✗'} &nbsp;·&nbsp; ${show(l2)} ≤ ${show(r1)} ${l2 <= r1 ? '✓' : '✗'}`;
    const med = (m + n) % 2 ? Math.max(l1, l2) : (Math.max(l1, l2) + Math.min(r1, r2)) / 2;
    q('[data-total]').innerHTML = ok ? `${med}<small>${pick(t('median', 'median'))}</small>` : `—<small>${pick(t('not the split yet', 'ခွဲခြမ်းမှု မဟုတ်သေး'))}</small>`;
  }
  q('[data-i]').addEventListener('input', (ev) => { state.i = Number(ev.target.value); render(); });
  host.addEventListener('click', (ev) => {
    const chip = ev.target.closest('[data-set]');
    if (chip) { state.set = Number(chip.dataset.set); state.i = 0; render(); }
  });
  onLangChange(render);
  render();
}

/* ---------------- the approach, in brief ---------------- */

const APPROACH = {
  merge: {
    idea: t('Merge the two arrays the way Merge Sorted Array does, but stop at the middle: the last one or two values taken are the median.', 'array နှစ်ခုကို Merge Sorted Array ကဲ့သို့ ပေါင်းသော်လည်း အလယ်တွင် ရပ်သည် — နောက်ဆုံး ယူခဲ့သော value တစ်ခု သို့မဟုတ် နှစ်ခုသည် median ဖြစ်သည်။'),
    steps: [
      t('Take the smaller head <code>total / 2 + 1</code> times, keeping the last two as <code>prev</code> and <code>cur</code>.', 'ငယ်သော ခေါင်းကို <code>total / 2 + 1</code> ကြိမ် ယူပြီး နောက်ဆုံး နှစ်ခုကို <code>prev</code> နှင့် <code>cur</code> အဖြစ် ထိန်းသည်။'),
      t('An odd total: <code>cur</code>. Even: <code>(prev + cur) / 2</code>, as a float.', 'စုစုပေါင်း မ — <code>cur</code>။ စုံ — float အဖြစ် <code>(prev + cur) / 2</code>။'),
    ],
    cost: t('Up to 1,001 steps at the constraint: O(m + n). Correct, but it is not the O(log(m + n)) the statement asks for.', 'ကန့်သတ်ချက်တွင် အဆင့် 1,001 အထိ — O(m + n)။ မှန်သော်လည်း မေးခွန်း တောင်းသော O(log(m + n)) မဟုတ်ပါ။'),
  },
  cut: {
    idea: t('Don\'t merge — choose the split. If the shorter array gives i values to the left half, the other gives half − i. The split is right when both left values are ≤ both right values, and a wrong one says which way to move: binary search on i.',
            'မပေါင်းပါနှင့် — ခွဲခြမ်းမှုကို ရွေးပါ။ ပိုတိုသော array က ဘယ်တစ်ဝက်သို့ i ခု ပေးလျှင် အခြားက half − i ခု ပေးသည်။ ဘယ် value နှစ်ခုလုံး ≤ ညာ value နှစ်ခုလုံး ဖြစ်မှ ခွဲခြမ်းမှု မှန်ပြီး မှားလျှင် ဘယ်ဘက် ရွှေ့ရမလဲ ပြောသည် — i ပေါ်တွင် binary search။'),
    steps: [
      t('Make <code>nums1</code> the shorter; <code>half = (m + n + 1) / 2</code>.', '<code>nums1</code> ကို ပိုတိုစေ — <code>half = (m + n + 1) / 2</code>။'),
      t('<code>i</code> in the middle of <code>lo..hi</code>, <code>j = half − i</code>; read the four values at the cut, ±∞ past the ends.', '<code>lo..hi</code> အလယ်တွင် <code>i</code>၊ <code>j = half − i</code> — ဖြတ်ရာရှိ value လေးခုကို ဖတ်၊ အစွန်ကျော်လျှင် ±∞။'),
      t('<code>left1 > right2</code>: <code>hi = i − 1</code>. <code>left2 > right1</code>: <code>lo = i + 1</code>. Otherwise it is the median\'s split.', '<code>left1 > right2</code> — <code>hi = i − 1</code>။ <code>left2 > right1</code> — <code>lo = i + 1</code>။ မဟုတ်လျှင် median ၏ ခွဲခြမ်းမှု။'),
    ],
    cost: t('A binary search over at most 1,001 cuts in the shorter array: about 10 steps, O(log min(m, n)).', 'ပိုတိုသော array ရှိ ဖြတ်ရာ 1,001 အထိပေါ်တွင် binary search — အဆင့် 10 ခန့်၊ O(log min(m, n))။'),
  },
};

/* ---------------- mount ---------------- */

mountLesson({
  input: { nums1: [1, 3], nums2: [2] },
  controls: [
    { key: 'nums1', label: 'nums1', parse: sortedList },
    { key: 'nums2', label: 'nums2', parse: sortedList },
  ],
  presets: [
    { label: exampleTitle(1), input: { nums1: [1, 3], nums2: [2] } },
    { label: exampleTitle(2), input: { nums1: [1, 2], nums2: [3, 4] } },
    { label: t('interleaved', 'ရောယှက်'), input: { nums1: [1, 3, 5, 7], nums2: [2, 4, 6, 8] } },
    { label: t('one empty', 'တစ်ခု ဗလာ'), input: { nums1: [], nums2: [4, 5, 6] } },
  ],
  examples: [
    { title: exampleTitle(1), inputHtml: '<code>nums1 = [1,3], nums2 = [2]</code>', output: '2.00000',
      why: [t('Merged: [1,2,3]. Three values, so the middle one, 2.', 'ပေါင်းပြီး — [1,2,3]။ value သုံးခု၊ ထို့ကြောင့် အလယ်ရှိ 2။')], load: { nums1: [1, 3], nums2: [2] } },
    { title: exampleTitle(2), inputHtml: '<code>nums1 = [1,2], nums2 = [3,4]</code>', output: '2.50000',
      why: [t('Merged: [1,2,3,4]. Four values, so the average of the middle two, (2 + 3) / 2 = 2.5.', 'ပေါင်းပြီး — [1,2,3,4]။ value လေးခု၊ ထို့ကြောင့် အလယ် နှစ်ခု၏ ပျမ်းမျှ၊ (2 + 3) / 2 = 2.5။')], load: { nums1: [1, 2], nums2: [3, 4] } },
  ],
  modes: [
    { id: 'merge', name: 'Merge to the middle',
      desc: t('Walk the merge until the middle value.', 'အလယ် value အထိ merge ကို လျှောက်။'),
      cost: 'O(m + n) time · O(1) extra', build: buildMerge },
    { id: 'cut', name: 'Binary search the cut',
      desc: t('Search for the split of the shorter array directly.', 'ပိုတိုသော array ၏ ခွဲခြမ်းမှုကို တိုက်ရိုက် ရှာ။'),
      cost: 'O(log min(m, n)) time · O(1) extra', build: buildCut },
  ],
  languages: LANGUAGES,
  code: CODE,
  solutions: {
    merge: { approach: APPROACH.merge,
      desc: t('Correct and simple, and fast enough at this size — but linear, where the statement asks for logarithmic.', 'မှန်ပြီး ရိုးရှင်းကာ ဤအရွယ်တွင် လုံလောက်အောင် မြန်သည် — သို့သော် မေးခွန်းက logarithmic တောင်းရာတွင် linear ဖြစ်သည်။') },
    cut: { approach: APPROACH.cut,
      desc: t('The answer the statement asks for. Search the shorter array, and treat the ends as ±infinity — 0 is not a safe stand-in when values can be negative.',
              'မေးခွန်း တောင်းသော အဖြေ။ ပိုတိုသော array ကို ရှာပြီး အစွန်များကို ±infinity အဖြစ် သဘောထားပါ — value များ အနုတ်ဖြစ်နိုင်သဖြင့် 0 သည် ဘေးကင်းသော အစားထိုး မဟုတ်ပါ။') },
  },
  // How each language was actually checked, printed as the part 3 badges.
  // The corpus: the 2 examples, 8 edges, 15,000 random pairs of up to 6
  // values from -5..5, 5,000 of up to 1,000 each, and four at the limits —
  // against sort-and-read-the-middle. Each driver prints five decimals. Go
  // and Rust ran in Docker (golang:1.23-alpine, rust:1-slim).
  verification: {
    ruby: 'ran here · 20,014 cases',
    python: 'ran here · 20,014 cases',
    javascript: 'ran here · 20,014 cases',
    go: 'ran here · 20,014 cases · Go 1.23',
    rust: 'ran here · 20,014 cases · rustc 1.98',
  },
  stripLabel: t('The two arrays', 'array နှစ်ခု'),
  strip,
  draw,
  answer,
  vars,
  widget: mountCutWidget,
});
