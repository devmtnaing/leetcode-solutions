/* Trapping Rain Water — LeetCode 42.
 *
 * The water above bar i rises to the lower of two walls: the tallest bar at
 * or left of i, and the tallest at or right of i. Precompute both walls for
 * every bar and the answer is a sum. Or walk in from both ends: whichever
 * side's wall is lower, that side's next bar is settled — its water depends
 * only on that lower wall, because the far side is known to be at least as
 * tall — so one pass with two pointers and two running maxima does it.
 */
import { mountLesson } from '../../lib/stepper.js';
import { pick, onLangChange } from '../../lib/i18n.js';
import { cells, stagePanel, readout, slots } from '../../lib/stage.js';
import { t, exampleTitle, LANGUAGES, k, c, labelledRows, stageGap, intList, listText, presetChips, widgetLabel } from '../../lib/kit.js';

const MAX_N = 14, MAX_H = 8;

/* ---------------- step generators ---------------- */

function buildLevels({ height: h }) {
  const n = h.length;
  const left = new Array(n).fill(null), right = new Array(n).fill(null);
  const fill = new Array(n).fill(null);
  let water = 0;
  const steps = [];
  const snap = (extra) => ({ view: 'levels', left: [...left], right: [...right], fill: [...fill], water, i: null, ...extra });
  for (let i = 0; i < n; i++) {
    left[i] = Math.max(h[i], i ? left[i - 1] : 0);
    steps.push(snap({ line: 'left', i, tag: t(`left[${i}] = ${left[i]}`, `left[${i}] = ${left[i]}`),
      note: t(`left[${i}] = max(height[${i}] = ${h[i]}, ${i ? `left[${i - 1}] = ${left[i - 1]}` : 'nothing yet'}) = ${left[i]}: the tallest bar from the start up to here.`,
              `left[${i}] = max(height[${i}] = ${h[i]}, ${i ? `left[${i - 1}] = ${left[i - 1]}` : 'ဘာမှ မရှိသေး'}) = ${left[i]} — အစမှ ဤနေရာအထိ အမြင့်ဆုံး bar။`) }));
  }
  for (let i = n - 1; i >= 0; i--) {
    right[i] = Math.max(h[i], i < n - 1 ? right[i + 1] : 0);
    steps.push(snap({ line: 'right', i, tag: t(`right[${i}] = ${right[i]}`, `right[${i}] = ${right[i]}`),
      note: t(`right[${i}] = max(height[${i}] = ${h[i]}, ${i < n - 1 ? `right[${i + 1}] = ${right[i + 1]}` : 'nothing yet'}) = ${right[i]}: the tallest bar from here to the end.`,
              `right[${i}] = max(height[${i}] = ${h[i]}, ${i < n - 1 ? `right[${i + 1}] = ${right[i + 1]}` : 'ဘာမှ မရှိသေး'}) = ${right[i]} — ဤနေရာမှ အဆုံးအထိ အမြင့်ဆုံး bar။`) }));
  }
  for (let i = 0; i < n; i++) {
    fill[i] = Math.min(left[i], right[i]) - h[i];
    water += fill[i];
    steps.push(snap({ line: 'fill', i, tag: t(`+${fill[i]}`, `+${fill[i]}`),
      note: t(`Bar ${i}: the water rises to min(left ${left[i]}, right ${right[i]}) = ${Math.min(left[i], right[i])}, over a bar of ${h[i]}, so ${fill[i]} ${fill[i] === 1 ? 'unit' : 'units'}. water = ${water}.`,
              `bar ${i} — ရေသည် min(left ${left[i]}, right ${right[i]}) = ${Math.min(left[i], right[i])} အထိ တက်ပြီး bar ${h[i]} အပေါ်တွင် ${fill[i]} unit။ water = ${water}။`) }));
  }
  steps.push(snap({ line: 'ret', finished: true, tag: t(`${water} units`, `${water} unit`),
    note: t(`Three passes, each O(n): ${water} units of water, using two extra arrays.`, `pass သုံးခု၊ တစ်ခုစီ O(n) — ရေ ${water} unit၊ အပို array နှစ်ခု သုံးသည်။`) }));
  return steps;
}

function buildPointers({ height: h }) {
  const n = h.length;
  let lo = 0, hi = n - 1, leftMax = 0, rightMax = 0, water = 0;
  const fill = new Array(n).fill(null);
  const steps = [];
  const snap = (extra) => ({ view: 'pointers', fill: [...fill], water, lo, hi, leftMax, rightMax, i: null, ...extra });
  if (n < 2) {
    steps.push(snap({ line: 'ret', finished: true, tag: t('0 units', '0 unit'),
      note: t('One bar holds no water: lo and hi start on the same bar, and the loop never runs.', 'bar တစ်ခုတွင် ရေ မရှိ — lo နှင့် hi သည် bar တစ်ခုတည်းပေါ်တွင် စပြီး loop ဘယ်တော့မှ မ run ပါ။') }));
    return steps;
  }
  while (lo < hi) {
    if (h[lo] < h[hi]) {
      leftMax = Math.max(leftMax, h[lo]);
      fill[lo] = leftMax - h[lo];
      water += fill[lo];
      steps.push(snap({ line: 'left', i: lo, tag: t(`lo: +${fill[lo]}`, `lo: +${fill[lo]}`),
        note: t(`height[lo] = ${h[lo]} < height[hi] = ${h[hi]}: the right side is sure to have a wall at least ${h[hi]}, so bar ${lo}'s water is set by the left wall alone. left_max = ${leftMax}; ${fill[lo]} ${fill[lo] === 1 ? 'unit' : 'units'} here; move lo right.`,
                `height[lo] = ${h[lo]} < height[hi] = ${h[hi]} — ညာဘက်တွင် အနည်းဆုံး ${h[hi]} မြင့်သော နံရံ သေချာ ရှိသဖြင့် bar ${lo} ၏ ရေကို ဘယ်နံရံကသာ သတ်မှတ်သည်။ left_max = ${leftMax} — ဤနေရာတွင် ${fill[lo]} unit — lo ကို ညာသို့ ရွှေ့။`) }));
      lo++;
    } else {
      rightMax = Math.max(rightMax, h[hi]);
      fill[hi] = rightMax - h[hi];
      water += fill[hi];
      steps.push(snap({ line: 'right', i: hi, tag: t(`hi: +${fill[hi]}`, `hi: +${fill[hi]}`),
        note: t(`height[lo] = ${h[lo]} ≥ height[hi] = ${h[hi]}: the left side has a wall at least ${h[lo]}, so bar ${hi}'s water is set by the right wall. right_max = ${rightMax}; ${fill[hi]} ${fill[hi] === 1 ? 'unit' : 'units'} here; move hi left.`,
                `height[lo] = ${h[lo]} ≥ height[hi] = ${h[hi]} — ဘယ်ဘက်တွင် အနည်းဆုံး ${h[lo]} မြင့်သော နံရံ ရှိသဖြင့် bar ${hi} ၏ ရေကို ညာနံရံက သတ်မှတ်သည်။ right_max = ${rightMax} — ဤနေရာတွင် ${fill[hi]} unit — hi ကို ဘယ်သို့ ရွှေ့။`) }));
      hi--;
    }
  }
  steps.push(snap({ line: 'ret', finished: true, tag: t(`${water} units`, `${water} unit`),
    note: t(`lo and hi met at bar ${lo}, the tallest — it holds no water. One pass, O(1) extra: ${water} units.`, `lo နှင့် hi သည် အမြင့်ဆုံး bar ${lo} တွင် ဆုံသည် — ၎င်းတွင် ရေ မရှိ။ pass တစ်ခု၊ O(1) အပို — ${water} unit။`) }));
  return steps;
}

/* ---------------- drawing ----------------
 *
 * The strip card is `height`, with the bar being worked on lit. The stage is
 * the landscape: rock, and the water settled so far — for the first version
 * under the two wall arrays it is built from. */

function landscape(h, fill, cur) {
  const top = Math.max(1, ...h.map((x, i) => x + (fill[i] ?? 0)));
  return `<div class="land" role="img" aria-label="bars ${h.join(', ')}">${h.map((x, i) => {
    const w = fill[i] ?? 0;
    const units = Array.from({ length: top }, (_, l) => {
      const level = top - l;
      return `<span class="u ${level <= x ? 'rock' : level <= x + w ? 'water' : 'air'}"></span>`;
    }).join('');
    return `<span class="col${i === cur ? ' cur' : ''}">${units}<span class="lab">${i}</span></span>`;
  }).join('')}</div>`;
}

function strip(s, { height: h }) {
  const tone = {}, marks = {};
  if (s.view === 'pointers' && !s.finished) {
    h.forEach((_, x) => { if (x < s.lo || x > s.hi) tone[x] = 'done'; });
    if (s.i != null) tone[s.i] = 'inwin';
    marks[s.lo] = s.lo === s.hi ? 'lo, hi' : 'lo';
    if (s.hi !== s.lo) marks[s.hi] = 'hi';
  } else if (s.i != null && !s.finished) {
    tone[s.i] = 'inwin';
    marks[s.i] = 'i';
  }
  return cells(h, { tone, marks });
}

function draw(s, { height: h }) {
  const land = stagePanel(pick(t('The water so far', 'ယခုထိ ရေ')), '', landscape(h, s.fill, s.i));
  if (s.view === 'levels') {
    const row = (arr) => cells(arr.map((x) => (x == null ? '·' : x)), { index: false, tone: s.i != null ? { [s.i]: 'inwin' } : {} });
    return stagePanel(pick(t('The two walls, per bar', 'bar တစ်ခုစီ၏ နံရံ နှစ်ခု')), '', labelledRows([['left', row(s.left)], ['right', row(s.right)]]))
      + stageGap + land + stageGap + readout({ water: s.water });
  }
  return land + stageGap + readout({ left_max: s.leftMax, right_max: s.rightMax, water: s.water });
}

function answer(s) {
  return { html: slots([s.water], { total: 1, just: s.finished ? 0 : -1 }), note: s.finished ? t('units of water', 'ရေ unit') : t('water so far', 'ယခုထိ ရေ') };
}

function vars(s, { height: h }) {
  const out = [['height', `[${listText(h)}]`], ['water', s.water], ['n', h.length]];
  if (s.view === 'levels') {
    out.push(['left', `[${s.left.map((x) => x ?? '·').join(', ')}]`], ['right', `[${s.right.map((x) => x ?? '·').join(', ')}]`]);
    if (s.i != null) out.push(['i', s.i]);
  } else {
    out.push(['lo', s.lo], ['hi', s.hi], ['left_max', s.leftMax], ['leftMax', s.leftMax], ['right_max', s.rightMax], ['rightMax', s.rightMax]);
  }
  return out;
}

/* ---------------- the code, one key per line ----------------
 *
 * Generated from the verified solution files, so the listing a reader copies
 * is byte-identical to the one that ran. */

const CODE = {
  levels: {
    ruby: [
      [null, `${k('def')} trap(height)`],
      [null, `  n = height.length`],
      [null, `  left = Array.new(n, 0) ${c('# tallest bar at or left of i')}`],
      [null, `  right = Array.new(n, 0) ${c('# tallest bar at or right of i')}`],
      [null, `  (0...n).each ${k('do')} |i|`],
      ['left', `    left[i] = [height[i], i &gt; 0 ? left[i - 1] : 0].max`],
      [null, `  ${k('end')}`],
      [null, `  (n - 1).downto(0) ${k('do')} |i|`],
      ['right', `    right[i] = [height[i], i &lt; n - 1 ? right[i + 1] : 0].max`],
      [null, `  ${k('end')}`],
      [null, `  water = 0`],
      [null, `  (0...n).each ${k('do')} |i|`],
      ['fill', `    water += [left[i], right[i]].min - height[i]`],
      [null, `  ${k('end')}`],
      ['ret', `  water`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} trap(self, height):`],
      [null, `        n = len(height)`],
      [null, `        left, right = [0] * n, [0] * n    ${c('# tallest bar at or left of i; at or right of i')}`],
      [null, `        ${k('for')} i ${k('in')} range(n):`],
      ['left', `            left[i] = max(height[i], left[i - 1] ${k('if')} i ${k('else')} 0)`],
      [null, `        ${k('for')} i ${k('in')} range(n - 1, -1, -1):`],
      ['right', `            right[i] = max(height[i], right[i + 1] ${k('if')} i &lt; n - 1 ${k('else')} 0)`],
      [null, `        water = 0`],
      [null, `        ${k('for')} i ${k('in')} range(n):`],
      ['fill', `            water += min(left[i], right[i]) - height[i]`],
      ['ret', `        ${k('return')} water`],
    ],
    javascript: [
      [null, `${k('const')} trap = ${k('function')} (height) {`],
      [null, `  ${k('const')} n = height.length;`],
      [null, `  ${k('const')} left = ${k('new')} Array(n).fill(0); ${c('// tallest bar at or left of i')}`],
      [null, `  ${k('const')} right = ${k('new')} Array(n).fill(0); ${c('// tallest bar at or right of i')}`],
      [null, `  ${k('for')} (${k('let')} i = 0; i &lt; n; i++) {`],
      ['left', `    left[i] = Math.max(height[i], i &gt; 0 ? left[i - 1] : 0);`],
      [null, `  }`],
      [null, `  ${k('for')} (${k('let')} i = n - 1; i &gt;= 0; i--) {`],
      ['right', `    right[i] = Math.max(height[i], i &lt; n - 1 ? right[i + 1] : 0);`],
      [null, `  }`],
      [null, `  ${k('let')} water = 0;`],
      [null, `  ${k('for')} (${k('let')} i = 0; i &lt; n; i++) {`],
      ['fill', `    water += Math.min(left[i], right[i]) - height[i];`],
      [null, `  }`],
      ['ret', `  ${k('return')} water;`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} trap(height []int) int {`],
      [null, `    n := len(height)`],
      [null, `    left := make([]int, n)  ${c('// tallest bar at or left of i')}`],
      [null, `    right := make([]int, n) ${c('// tallest bar at or right of i')}`],
      [null, `    ${k('for')} i := 0; i &lt; n; i++ {`],
      ['left', `        left[i] = height[i]`],
      ['left', `        ${k('if')} i &gt; 0 &amp;&amp; left[i-1] &gt; left[i] {`],
      ['left', `            left[i] = left[i-1]`],
      [null, `        }`],
      [null, `    }`],
      [null, `    ${k('for')} i := n - 1; i &gt;= 0; i-- {`],
      ['right', `        right[i] = height[i]`],
      ['right', `        ${k('if')} i &lt; n-1 &amp;&amp; right[i+1] &gt; right[i] {`],
      ['right', `            right[i] = right[i+1]`],
      [null, `        }`],
      [null, `    }`],
      [null, `    water := 0`],
      [null, `    ${k('for')} i := 0; i &lt; n; i++ {`],
      ['fill', `        water += min(left[i], right[i]) - height[i]`],
      [null, `    }`],
      ['ret', `    ${k('return')} water`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} trap(height: Vec&lt;i32&gt;) -&gt; i32 {`],
      [null, `        ${k('let')} n = height.len();`],
      [null, `        ${k('let')} ${k('mut')} left = vec![0; n]; ${c('// tallest bar at or left of i')}`],
      [null, `        ${k('let')} ${k('mut')} right = vec![0; n]; ${c('// tallest bar at or right of i')}`],
      [null, `        ${k('for')} i ${k('in')} 0..n {`],
      ['left', `            left[i] = height[i].max(${k('if')} i &gt; 0 { left[i - 1] } ${k('else')} { 0 });`],
      [null, `        }`],
      [null, `        ${k('for')} i ${k('in')} (0..n).rev() {`],
      ['right', `            right[i] = height[i].max(${k('if')} i + 1 &lt; n { right[i + 1] } ${k('else')} { 0 });`],
      [null, `        }`],
      [null, `        ${k('let')} ${k('mut')} water = 0;`],
      [null, `        ${k('for')} i ${k('in')} 0..n {`],
      ['fill', `            water += left[i].min(right[i]) - height[i];`],
      [null, `        }`],
      ['ret', `        water`],
      [null, `    }`],
      [null, `}`],
    ],
  },
  pointers: {
    ruby: [
      [null, `${k('def')} trap(height)`],
      [null, `  lo, hi = 0, height.length - 1`],
      [null, `  left_max = right_max = water = 0`],
      [null, `  ${k('while')} lo &lt; hi`],
      [null, `    ${k('if')} height[lo] &lt; height[hi] ${c('# the left wall is the lower one')}`],
      ['left', `      left_max = [left_max, height[lo]].max`],
      ['left', `      water += left_max - height[lo]`],
      ['left', `      lo += 1`],
      [null, `    ${k('else')}`],
      ['right', `      right_max = [right_max, height[hi]].max`],
      ['right', `      water += right_max - height[hi]`],
      ['right', `      hi -= 1`],
      [null, `    ${k('end')}`],
      [null, `  ${k('end')}`],
      ['ret', `  water`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} trap(self, height):`],
      [null, `        lo, hi = 0, len(height) - 1`],
      [null, `        left_max = right_max = water = 0`],
      [null, `        ${k('while')} lo &lt; hi:`],
      [null, `            ${k('if')} height[lo] &lt; height[hi]:       ${c('# the left wall is the lower one')}`],
      ['left', `                left_max = max(left_max, height[lo])`],
      ['left', `                water += left_max - height[lo]`],
      ['left', `                lo += 1`],
      [null, `            ${k('else')}:`],
      ['right', `                right_max = max(right_max, height[hi])`],
      ['right', `                water += right_max - height[hi]`],
      ['right', `                hi -= 1`],
      ['ret', `        ${k('return')} water`],
    ],
    javascript: [
      [null, `${k('const')} trap = ${k('function')} (height) {`],
      [null, `  ${k('let')} lo = 0, hi = height.length - 1;`],
      [null, `  ${k('let')} leftMax = 0, rightMax = 0, water = 0;`],
      [null, `  ${k('while')} (lo &lt; hi) {`],
      [null, `    ${k('if')} (height[lo] &lt; height[hi]) { ${c('// the left wall is the lower one')}`],
      ['left', `      leftMax = Math.max(leftMax, height[lo]);`],
      ['left', `      water += leftMax - height[lo];`],
      ['left', `      lo++;`],
      [null, `    } ${k('else')} {`],
      ['right', `      rightMax = Math.max(rightMax, height[hi]);`],
      ['right', `      water += rightMax - height[hi];`],
      ['right', `      hi--;`],
      [null, `    }`],
      [null, `  }`],
      ['ret', `  ${k('return')} water;`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} trap(height []int) int {`],
      [null, `    lo, hi := 0, len(height)-1`],
      [null, `    leftMax, rightMax, water := 0, 0, 0`],
      [null, `    ${k('for')} lo &lt; hi {`],
      [null, `        ${k('if')} height[lo] &lt; height[hi] { ${c('// the left wall is the lower one')}`],
      ['left', `            leftMax = max(leftMax, height[lo])`],
      ['left', `            water += leftMax - height[lo]`],
      ['left', `            lo++`],
      [null, `        } ${k('else')} {`],
      ['right', `            rightMax = max(rightMax, height[hi])`],
      ['right', `            water += rightMax - height[hi]`],
      ['right', `            hi--`],
      [null, `        }`],
      [null, `    }`],
      ['ret', `    ${k('return')} water`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} trap(height: Vec&lt;i32&gt;) -&gt; i32 {`],
      [null, `        ${k('let')} (${k('mut')} lo, ${k('mut')} hi) = (0, height.len() - 1);`],
      [null, `        ${k('let')} (${k('mut')} left_max, ${k('mut')} right_max, ${k('mut')} water) = (0, 0, 0);`],
      [null, `        ${k('while')} lo &lt; hi {`],
      [null, `            ${k('if')} height[lo] &lt; height[hi] { ${c('// the left wall is the lower one')}`],
      ['left', `                left_max = left_max.max(height[lo]);`],
      ['left', `                water += left_max - height[lo];`],
      ['left', `                lo += 1;`],
      [null, `            } ${k('else')} {`],
      ['right', `                right_max = right_max.max(height[hi]);`],
      ['right', `                water += right_max - height[hi];`],
      ['right', `                hi -= 1;`],
      [null, `            }`],
      [null, `        }`],
      ['ret', `        water`],
      [null, `    }`],
      [null, `}`],
    ],
  },
};

/* ---------------- part 1: the "lower wall" widget ----------------
 *
 * Click a column to see its water: the tallest bar on its left, the tallest
 * on its right, and the lower of the two. Raise or lower that bar and watch
 * the whole pool change. */

const QW_SETS = [
  { label: exampleTitle(1), h: [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1] },
  { label: exampleTitle(2), h: [4, 2, 0, 3, 2, 5] },
  { label: t('a lopsided valley', 'မညီသော ချိုင့်'), h: [5, 1, 0, 1, 2, 3, 1, 2] },
];

function mountWallWidget(host) {
  const state = { set: 0, h: [...QW_SETS[0].h], at: 5 };
  host.innerHTML = `
    <div class="tw-land" data-land></div>
    <div class="q-slider"><span class="q-presets" data-presets></span>
      <span class="q-presets" data-edit></span></div>
    <p class="q-tie" data-line></p>
    <div class="ledger">
      <span class="expr" data-expr></span>
      <span class="total" data-total></span>
    </div>`;
  const q = (sel) => host.querySelector(sel);

  function render() {
    const h = state.h, n = h.length, i = Math.min(state.at, n - 1);
    const L = h.map((_, x) => Math.max(...h.slice(0, x + 1))), R = h.map((_, x) => Math.max(...h.slice(x)));
    const fill = h.map((x, j) => Math.min(L[j], R[j]) - x);
    const total = fill.reduce((a, b) => a + b, 0);
    q('[data-land]').innerHTML = `<div class="land">${h.map((x, j) => {
      const top = Math.max(1, ...h);
      const units = Array.from({ length: top }, (_, l) => { const lv = top - l; return `<span class="u ${lv <= x ? 'rock' : lv <= x + fill[j] ? 'water' : 'air'}"></span>`; }).join('');
      return `<span class="col${j === i ? ' cur' : ''}" role="button" tabindex="0" data-col="${j}" aria-label="bar ${j}, height ${x}">${units}<span class="lab">${j}</span></span>`;
    }).join('')}</div>`;
    q('[data-presets]').innerHTML = presetChips(QW_SETS, state.set);
    q('[data-edit]').innerHTML = `<button class="chip" data-d="-1" aria-label="lower bar ${i}">bar ${i} −1</button><button class="chip" data-d="1" aria-label="raise bar ${i}">bar ${i} +1</button>`;
    widgetLabel(pick(t('click a bar', 'bar ကို နှိပ်ပါ')));
    const lower = Math.min(L[i], R[i]);
    q('[data-line]').innerHTML = pick(t(`Bar ${i}: the tallest bar on its left is ${L[i]}, on its right ${R[i]}. Water can only rise to the lower, ${lower} — above that it spills — so bar ${i} holds ${lower} − ${h[i]} = ${fill[i]}.`,
      `bar ${i} — ၎င်း၏ ဘယ်ဘက်ရှိ အမြင့်ဆုံးသည် ${L[i]}၊ ညာဘက်တွင် ${R[i]}။ ရေသည် နိမ့်သည့် ${lower} အထိသာ တက်နိုင်သည် — ထို့ထက်မြင့်လျှင် ဖိတ်သည် — ထို့ကြောင့် bar ${i} တွင် ${lower} − ${h[i]} = ${fill[i]}။`));
    q('[data-expr]').innerHTML = `min(${L[i]}, ${R[i]}) − ${h[i]} = ${fill[i]}`;
    q('[data-total]').innerHTML = `${total}<small>${pick(t('units in all', 'unit စုစုပေါင်း'))}</small>`;
  }
  const pickCol = (el) => { state.at = Number(el.dataset.col); render(); host.querySelector(`[data-col="${state.at}"]`)?.focus(); };
  host.addEventListener('click', (ev) => {
    const chip = ev.target.closest('[data-set]');
    if (chip) { state.set = Number(chip.dataset.set); state.h = [...QW_SETS[state.set].h]; state.at = Math.floor(state.h.length / 2); return render(); }
    const d = ev.target.closest('[data-d]');
    if (d) { const i = Math.min(state.at, state.h.length - 1); state.h[i] = Math.max(0, Math.min(MAX_H, state.h[i] + Number(d.dataset.d))); return render(); }
    const col = ev.target.closest('[data-col]');
    if (col) pickCol(col);
  });
  host.addEventListener('keydown', (ev) => {
    const col = ev.target.closest('[data-col]');
    if (col && (ev.key === 'Enter' || ev.key === ' ')) { ev.preventDefault(); pickCol(col); }
  });
  onLangChange(render);
  render();
}

/* ---------------- the approach, in brief ---------------- */

const APPROACH = {
  levels: {
    idea: t('The water over bar i reaches the lower of the tallest bar on its left and the tallest on its right. Compute both for every bar, then add up the gaps.',
            'bar i အပေါ်ရှိ ရေသည် ၎င်း၏ ဘယ်ဘက် အမြင့်ဆုံးနှင့် ညာဘက် အမြင့်ဆုံးထဲမှ နိမ့်သည့်အထိ ရောက်သည်။ bar တိုင်းအတွက် နှစ်ခုလုံးကို တွက်ပြီး ကွာဟချက်များကို ပေါင်းသည်။'),
    steps: [
      t('<code>left[i]</code>: a running maximum from the left.', '<code>left[i]</code> — ဘယ်မှ running maximum။'),
      t('<code>right[i]</code>: a running maximum from the right.', '<code>right[i]</code> — ညာမှ running maximum။'),
      t('<code>water += min(left[i], right[i]) − height[i]</code> for every bar.', 'bar တိုင်းအတွက် <code>water += min(left[i], right[i]) − height[i]</code>။'),
    ],
    cost: t('Three passes: O(n) time, and O(n) for the two arrays.', 'pass သုံးခု — O(n) အချိန်၊ array နှစ်ခုအတွက် O(n)။'),
  },
  pointers: {
    idea: t('Walk in from both ends. If the left bar is lower than the right one, the right side is sure to hold a wall at least that tall, so the left bar\'s water depends only on the tallest bar to its left — settle it and step in. Symmetrically on the right.',
            'အစွန်နှစ်ဖက်မှ အတွင်းသို့ လျှောက်သည်။ ဘယ် bar သည် ညာ bar ထက် နိမ့်လျှင် ညာဘက်တွင် အနည်းဆုံး ထိုမျှ မြင့်သော နံရံ သေချာ ရှိသဖြင့် ဘယ် bar ၏ ရေသည် ၎င်း၏ ဘယ်ဘက် အမြင့်ဆုံးပေါ်တွင်သာ မူတည်သည် — သတ်မှတ်ပြီး အတွင်းသို့ တစ်လှမ်း။ ညာဘက်တွင်လည်း ထိုနည်းတူ။'),
    steps: [
      t('<code>lo</code> and <code>hi</code> at the ends; <code>left_max</code>, <code>right_max</code> and <code>water</code> at 0.', '<code>lo</code> နှင့် <code>hi</code> အစွန်တွင် — <code>left_max</code>၊ <code>right_max</code> နှင့် <code>water</code> 0။'),
      t('The lower side moves: update its max, add <code>max − height</code>, step in.', 'နိမ့်သည့်ဘက် ရွေ့သည် — ၎င်း၏ max ကို update၊ <code>max − height</code> ပေါင်း၊ အတွင်းသို့ တစ်လှမ်း။'),
      t('Stop when they meet — at the tallest bar, which holds nothing.', 'ဆုံသည့်အခါ ရပ် — အမြင့်ဆုံး bar တွင်၊ ၎င်းတွင် ဘာမှ မရှိ။'),
    ],
    cost: t('Each step settles one bar: n − 1 steps, O(n) time and O(1) extra.', 'အဆင့်တိုင်း bar တစ်ခုကို သတ်မှတ်သည် — အဆင့် n − 1၊ O(n) အချိန်နှင့် O(1) အပို။'),
  },
};

/* ---------------- mount ---------------- */

const EX1 = [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1];
const EX2 = [4, 2, 0, 3, 2, 5];

mountLesson({
  input: { height: EX1 },
  controls: [
    { key: 'height', label: 'height', value: listText(EX1), parse: intList({ max: MAX_N, lo: 0, hi: MAX_H, why: 'so the landscape fits' }), format: listText },
  ],
  presets: [
    { label: exampleTitle(1), input: { height: EX1 } },
    { label: exampleTitle(2), input: { height: EX2 } },
    { label: t('a single well', 'တွင်း တစ်ခု'), input: { height: [5, 0, 0, 0, 5] } },
    { label: t('rising', 'မြင့်တက်'), input: { height: [1, 2, 3, 4, 5] } },
  ],
  examples: [
    { title: exampleTitle(1), inputHtml: '<code>height = [0,1,0,2,1,0,1,3,2,1,2,1]</code>', output: '6',
      why: [t('1 unit over bar 2, 4 in the dip from bar 4 to bar 6, and 1 over bar 9.', 'bar 2 အပေါ်တွင် 1 unit၊ bar 4 မှ bar 6 အထိ ချိုင့်တွင် 4၊ bar 9 အပေါ်တွင် 1။')],
      load: { height: EX1 } },
    { title: exampleTitle(2), inputHtml: '<code>height = [4,2,0,3,2,5]</code>', output: '9',
      why: [t('The walls are 4 and 5, so the water level between them is 4: 2 + 4 + 1 + 2 = 9.', 'နံရံများ 4 နှင့် 5 ဖြစ်သဖြင့် ၎င်းတို့ကြား ရေအမြင့် 4 — 2 + 4 + 1 + 2 = 9။')],
      load: { height: EX2 } },
  ],
  modes: [
    { id: 'levels', name: 'Wall arrays',
      sub: t('prefix and suffix maxima', 'prefix နှင့် suffix maxima'),
      desc: t('Tallest bar to the left and right of every bar, then sum.', 'bar တိုင်း၏ ဘယ်နှင့် ညာ အမြင့်ဆုံး bar၊ ပြီးမှ ပေါင်း။'),
      cost: 'O(n) time · O(n) extra', build: buildLevels },
    { id: 'pointers', name: 'Two pointers',
      desc: t('Walk in from both ends; the lower side is always settled.', 'အစွန်နှစ်ဖက်မှ အတွင်းသို့ — နိမ့်သည့်ဘက်ကို အမြဲ သတ်မှတ်နိုင်။'),
      cost: 'O(n) time · O(1) extra', build: buildPointers },
  ],
  languages: LANGUAGES,
  code: CODE,
  solutions: {
    levels: { approach: APPROACH.levels,
      desc: t('The formula written out: the two walls for every bar, then the sum. Easy to trust, and it shows exactly where each unit of water comes from.',
              'ပုံသေနည်းကို ချရေးထားခြင်း — bar တိုင်းအတွက် နံရံနှစ်ခု၊ ပြီးမှ ပေါင်းလဒ်။ ယုံရလွယ်ပြီး ရေ unit တစ်ခုစီ ဘယ်ကလာသလဲ အတိအကျ ပြသည်။') },
    pointers: { approach: APPROACH.pointers,
      desc: t('The same answer in one pass and no arrays. Move the lower side — moving the taller one is the classic slip.',
              'pass တစ်ခုတည်းဖြင့်၊ array မလိုဘဲ အဖြေ အတူတူ။ နိမ့်သည့်ဘက်ကို ရွှေ့ပါ — မြင့်သည့်ဘက်ကို ရွှေ့ခြင်းသည် ဂန္တဝင် အမှား။') },
  },
  // How each language was actually checked, printed as the part 3 badges.
  // The corpus: the 2 examples, 6 edges, 15,000 random landscapes of up to 12
  // bars from 0..5, 5,000 of up to 300 across the full range, and four of
  // 2 × 10⁴ bars — the largest answer 1,999,800,000 — against a stack
  // oracle. Go and Rust ran in Docker (golang:1.23-alpine, rust:1-slim).
  verification: {
    ruby: 'ran here · 20,012 cases',
    python: 'ran here · 20,012 cases',
    javascript: 'ran here · 20,012 cases',
    go: 'ran here · 20,012 cases · Go 1.23',
    rust: 'ran here · 20,012 cases · rustc 1.98',
  },
  stripLabel: t('height', 'height'),
  strip,
  draw,
  answer,
  vars,
  widget: mountWallWidget,
});
