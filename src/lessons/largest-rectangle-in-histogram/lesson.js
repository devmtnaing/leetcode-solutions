/* Largest Rectangle in Histogram — LeetCode 84.
 *
 * Every candidate rectangle is as tall as its shortest bar. So try each bar as
 * the shortest: stretch left and right while the neighbours are at least as
 * tall, and the rectangle is height × width. Growing each one step by step is
 * O(n²). A stack of bars with rising heights finds every bar's two limits in
 * one pass: a bar leaves the stack exactly when a lower bar arrives on its
 * right, and the bar under it in the stack is the nearest lower one on its
 * left — so its widest rectangle is known the moment it is popped.
 */
import { mountLesson } from '../../lib/stepper.js';
import { pick, onLangChange } from '../../lib/i18n.js';
import { bars, cells, slots, stagePanel, readout } from '../../lib/stage.js';
import { t, exampleTitle, LANGUAGES, k, c, stageRow, stageGap, intList, listText, presetChips, widgetLabel } from '../../lib/kit.js';

const MAX_N = 12;

/* ---------------- step generators ---------------- */

function buildExtend({ heights: h }) {
  const n = h.length;
  let best = 0, steps_ = 0;
  const steps = [];
  const snap = (extra) => ({ view: 'extend', best, i: null, lo: null, hi: null, area: null, work: steps_, ...extra });
  for (let i = 0; i < n; i++) {
    let lo = i, hi = i;
    while (lo > 0 && h[lo - 1] >= h[i]) { lo--; steps_++; }
    while (hi < n - 1 && h[hi + 1] >= h[i]) { hi++; steps_++; }
    steps.push(snap({ line: 'grow', i, lo, hi, tag: t(`bar ${i}: ${lo}..${hi}`, `bar ${i}: ${lo}..${hi}`),
      note: t(`Bar ${i} (height ${h[i]}) as the shortest: its neighbours are at least ${h[i]} from ${lo} to ${hi}${lo > 0 ? `; bar ${lo - 1} (${h[lo - 1]}) stops it on the left` : ''}${hi < n - 1 ? `; bar ${hi + 1} (${h[hi + 1]}) on the right` : ''}.`,
              `bar ${i} (အမြင့် ${h[i]}) ကို အတိုဆုံးအဖြစ် — ${lo} မှ ${hi} အထိ အိမ်နီးများ အနည်းဆုံး ${h[i]}${lo > 0 ? `၊ ဘယ်တွင် bar ${lo - 1} (${h[lo - 1]}) က ရပ်စေ` : ''}${hi < n - 1 ? `၊ ညာတွင် bar ${hi + 1} (${h[hi + 1]})` : ''}။`) }));
    const area = h[i] * (hi - lo + 1);
    const better = area > best;
    best = Math.max(best, area);
    steps.push(snap({ line: 'area', i, lo, hi, area, better, tag: t(`${h[i]} × ${hi - lo + 1} = ${area}`, `${h[i]} × ${hi - lo + 1} = ${area}`),
      note: t(`Area ${h[i]} × ${hi - lo + 1} = ${area}${better ? ' — the best so far' : `, not more than ${best}`}.`,
              `ဧရိယာ ${h[i]} × ${hi - lo + 1} = ${area}${better ? ' — ယခုထိ အကောင်းဆုံး' : `၊ ${best} ထက် မပို`}။`) }));
  }
  steps.push(snap({ line: 'ret', finished: true, tag: t(`best ${best}`, `best ${best}`),
    note: t(`Every bar tried as the shortest: the largest area is ${best}, after ${steps_} steps of growing.`, `bar တိုင်းကို အတိုဆုံးအဖြစ် စမ်းပြီး — အကြီးဆုံး ဧရိယာ ${best}၊ ကြီးထွားခြင်း ${steps_} လှမ်းအပြီး။`) }));
  return steps;
}

function buildStack({ heights: h }) {
  const n = h.length;
  const stack = [];
  let best = 0;
  const steps = [];
  const snap = (extra) => ({ view: 'stack', stack: [...stack], best, i: null, top: null, lo: null, hi: null, area: null, ...extra });
  for (let i = 0; i <= n; i++) {
    const x = i < n ? h[i] : 0;
    while (stack.length && h[stack.at(-1)] >= x) {
      const top = stack.pop();
      const left = stack.length ? stack.at(-1) : -1;
      const area = h[top] * (i - left - 1);
      const better = area > best;
      best = Math.max(best, area);
      steps.push(snap({ line: 'area', i, top, lo: left + 1, hi: i - 1, area, better, tag: t(`${h[top]} × ${i - left - 1} = ${area}`, `${h[top]} × ${i - left - 1} = ${area}`),
        note: t(`${i < n ? `height[${i}] = ${x}` : 'The closing 0'} is not taller than bar ${top} (${h[top]}), so bar ${top} can stretch no further right. ${left >= 0 ? `The bar under it on the stack, ${left}, is the nearest lower one on its left` : 'Nothing under it on the stack: it stretches to the left edge'}: width ${i - left - 1}, area ${area}${better ? ' — the best so far' : ''}.`,
                `${i < n ? `height[${i}] = ${x}` : 'အဆုံးရှိ 0'} သည် bar ${top} (${h[top]}) ထက် မမြင့်သဖြင့် bar ${top} သည် ညာသို့ ထပ်မဆန့်နိုင်။ ${left >= 0 ? `stack ပေါ်ရှိ ၎င်းအောက်မှ bar ${left} သည် ၎င်း၏ ဘယ်ဘက် အနီးဆုံး နိမ့်သည့် bar` : 'stack ပေါ်တွင် ၎င်းအောက် ဘာမှ မရှိ — ဘယ်အစွန်အထိ ဆန့်သည်'} — အကျယ် ${i - left - 1}၊ ဧရိယာ ${area}${better ? ' — ယခုထိ အကောင်းဆုံး' : ''}။`) }));
    }
    if (stack.length) {
      steps.push(snap({ line: 'pop', i, tag: t(`${h[stack.at(-1)]} < ${x}`, `${h[stack.at(-1)]} < ${x}`),
        note: t(`The top, bar ${stack.at(-1)} (${h[stack.at(-1)]}), is lower than ${x}: it can still stretch right, so it stays.`,
                `ထိပ်ရှိ bar ${stack.at(-1)} (${h[stack.at(-1)]}) သည် ${x} ထက် နိမ့်သည် — ညာသို့ ဆန့်နိုင်သေးသဖြင့် ကျန်သည်။`) }));
    }
    if (i < n) {
      stack.push(i);
      steps.push(snap({ line: 'push', i, tag: t(`push ${i}`, `${i} push`),
        note: t(`Push bar ${i} (${x}). The heights on the stack still rise from bottom to top.`, `bar ${i} (${x}) ကို push သည်။ stack ပေါ်ရှိ အမြင့်များ အောက်မှ အပေါ်သို့ မြင့်တက်နေဆဲ။`) }));
    }
  }
  steps.push(snap({ line: 'ret', finished: true, i: n, tag: t(`best ${best}`, `best ${best}`),
    note: t(`The closing 0 emptied the stack: every bar was pushed once and popped once, and the largest area is ${best}.`, `အဆုံးရှိ 0 က stack ကို ရှင်းသည် — bar တိုင်းကို တစ်ကြိမ် push ပြီး တစ်ကြိမ် pop သည်၊ အကြီးဆုံး ဧရိယာ ${best}။`) }));
  return steps;
}

/* ---------------- drawing ----------------
 *
 * The strip card is `heights`, with the bar being worked on lit. The stage is
 * the histogram with the rectangle being measured, and — for the second
 * version — the stack itself, bottom to top. */

function strip(s, { heights: h }) {
  const tone = {}, marks = {};
  if (!s.finished) {
    if (s.view === 'extend' && s.i != null) { tone[s.i] = 'inwin'; marks[s.i] = 'i'; }
    if (s.view === 'stack') {
      for (const j of s.stack) tone[j] = 'entering';
      if (s.top != null) tone[s.top] = 'leaving';
      if (s.i != null && s.i < h.length) { tone[s.i] = 'inwin'; marks[s.i] = 'i'; }
    }
  }
  return cells(h, { tone, marks });
}

function draw(s, { heights: h }) {
  const tone = {};
  if (s.lo != null) for (let x = s.lo; x <= s.hi; x++) tone[x] = 'up';
  if (s.view === 'extend' && s.i != null) tone[s.i] = 'warn';
  if (s.view === 'stack' && s.top != null) tone[s.top] = 'warn';
  const chart = stagePanel(pick(t('The histogram', 'Histogram')), s.area != null ? pick(t(`rectangle ${s.lo}..${s.hi}, area ${s.area}`, `rectangle ${s.lo}..${s.hi}၊ ဧရိယာ ${s.area}`)) : '', bars(h, { tone, height: 110 }));
  if (s.view === 'extend') return chart + stageGap + readout({ best: s.best, [pick(t('growing steps', 'ကြီးထွားလှမ်း'))]: s.work });
  return chart + stageGap + stagePanel(pick(t('The stack, bottom first', 'Stack — အောက်ဆုံးမှ')), pick(t('heights rise', 'အမြင့်များ တက်')),
    stageRow(cells(s.stack.map((j) => h[j]), { index: false, marks: Object.fromEntries(s.stack.map((j, p) => [p, `@${j}`])) }), pick(t('empty', 'ဗလာ'))))
    + stageGap + readout({ best: s.best });
}

function answer(s) {
  return { html: slots([s.best], { total: 1, just: s.finished ? 0 : -1 }), note: s.finished ? t('the largest area', 'အကြီးဆုံး ဧရိယာ') : t('best so far', 'ယခုထိ အကောင်းဆုံး') };
}

function vars(s, { heights: h }) {
  const out = [['heights', `[${listText(h)}]`], ['best', s.best], ['n', h.length]];
  if (s.i != null) out.push(['i', s.i]);
  if (s.view === 'extend') {
    if (s.lo != null) out.push(['lo', s.lo], ['hi', s.hi]);
  } else {
    out.push(['stack', `[${s.stack.join(', ')}]`]);
    if (s.i != null) out.push(['h', s.i < h.length ? h[s.i] : 0]);
    if (s.top != null) out.push(['top', s.top], ['left', s.lo - 1], ['width', s.hi - s.lo + 1]);
  }
  return out;
}

/* ---------------- the code, one key per line ----------------
 *
 * Generated from the verified solution files, so the listing a reader copies
 * is byte-identical to the one that ran. */

const CODE = {
  extend: {
    ruby: [
      [null, `${k('def')} largest_rectangle_area(heights)`],
      [null, `  n, best = heights.length, 0`],
      [null, `  (0...n).each ${k('do')} |i| ${c('# bar i as the shortest in the rectangle')}`],
      [null, `    lo = hi = i`],
      ['grow', `    lo -= 1 ${k('while')} lo &gt; 0 &amp;&amp; heights[lo - 1] &gt;= heights[i]`],
      ['grow', `    hi += 1 ${k('while')} hi &lt; n - 1 &amp;&amp; heights[hi + 1] &gt;= heights[i]`],
      ['area', `    best = [best, heights[i] * (hi - lo + 1)].max`],
      [null, `  ${k('end')}`],
      ['ret', `  best`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} largestRectangleArea(self, heights):`],
      [null, `        n, best = len(heights), 0`],
      [null, `        ${k('for')} i ${k('in')} range(n):                    ${c('# bar i as the shortest in the rectangle')}`],
      [null, `            lo = hi = i`],
      ['grow', `            ${k('while')} lo &gt; 0 and heights[lo - 1] &gt;= heights[i]:`],
      ['grow', `                lo -= 1`],
      ['grow', `            ${k('while')} hi &lt; n - 1 and heights[hi + 1] &gt;= heights[i]:`],
      ['grow', `                hi += 1`],
      ['area', `            best = max(best, heights[i] * (hi - lo + 1))`],
      ['ret', `        ${k('return')} best`],
    ],
    javascript: [
      [null, `${k('const')} largestRectangleArea = ${k('function')} (heights) {`],
      [null, `  ${k('const')} n = heights.length;`],
      [null, `  ${k('let')} best = 0;`],
      [null, `  ${k('for')} (${k('let')} i = 0; i &lt; n; i++) { ${c('// bar i as the shortest in the rectangle')}`],
      [null, `    ${k('let')} lo = i, hi = i;`],
      ['grow', `    ${k('while')} (lo &gt; 0 &amp;&amp; heights[lo - 1] &gt;= heights[i]) lo--;`],
      ['grow', `    ${k('while')} (hi &lt; n - 1 &amp;&amp; heights[hi + 1] &gt;= heights[i]) hi++;`],
      ['area', `    best = Math.max(best, heights[i] * (hi - lo + 1));`],
      [null, `  }`],
      ['ret', `  ${k('return')} best;`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} largestRectangleArea(heights []int) int {`],
      [null, `    n, best := len(heights), 0`],
      [null, `    ${k('for')} i := 0; i &lt; n; i++ { ${c('// bar i as the shortest in the rectangle')}`],
      [null, `        lo, hi := i, i`],
      ['grow', `        ${k('for')} lo &gt; 0 &amp;&amp; heights[lo-1] &gt;= heights[i] {`],
      ['grow', `            lo--`],
      [null, `        }`],
      ['grow', `        ${k('for')} hi &lt; n-1 &amp;&amp; heights[hi+1] &gt;= heights[i] {`],
      ['grow', `            hi++`],
      [null, `        }`],
      ['area', `        best = max(best, heights[i]*(hi-lo+1))`],
      [null, `    }`],
      ['ret', `    ${k('return')} best`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} largest_rectangle_area(heights: Vec&lt;i32&gt;) -&gt; i32 {`],
      [null, `        ${k('let')} n = heights.len();`],
      [null, `        ${k('let')} ${k('mut')} best = 0;`],
      [null, `        ${k('for')} i ${k('in')} 0..n { ${c('// bar i as the shortest in the rectangle')}`],
      [null, `            ${k('let')} (${k('mut')} lo, ${k('mut')} hi) = (i, i);`],
      ['grow', `            ${k('while')} lo &gt; 0 &amp;&amp; heights[lo - 1] &gt;= heights[i] {`],
      ['grow', `                lo -= 1;`],
      [null, `            }`],
      ['grow', `            ${k('while')} hi + 1 &lt; n &amp;&amp; heights[hi + 1] &gt;= heights[i] {`],
      ['grow', `                hi += 1;`],
      [null, `            }`],
      ['area', `            best = best.max(heights[i] * (hi - lo + 1) as i32);`],
      [null, `        }`],
      ['ret', `        best`],
      [null, `    }`],
      [null, `}`],
    ],
  },
  stack: {
    ruby: [
      [null, `${k('def')} largest_rectangle_area(heights)`],
      [null, `  stack = [] ${c('# indices; heights rise from bottom to top')}`],
      [null, `  best = 0`],
      [null, `  (0..heights.length).each ${k('do')} |i|`],
      [null, `    h = i &lt; heights.length ? heights[i] : 0 ${c('# a 0 at the end empties the stack')}`],
      ['pop', `    ${k('while')} !stack.empty? &amp;&amp; heights[stack[-1]] &gt;= h`],
      ['pop', `      top = stack.pop`],
      ['area', `      left = stack.empty? ? -1 : stack[-1]`],
      ['area', `      best = [best, heights[top] * (i - left - 1)].max`],
      [null, `    ${k('end')}`],
      ['push', `    stack &lt;&lt; i`],
      [null, `  ${k('end')}`],
      ['ret', `  best`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} largestRectangleArea(self, heights):`],
      [null, `        stack, best = [], 0                   ${c('# indices; heights rise from bottom to top')}`],
      [null, `        ${k('for')} i, h ${k('in')} enumerate(heights + [0]): ${c('# a 0 at the end empties the stack')}`],
      ['pop', `            ${k('while')} stack and heights[stack[-1]] &gt;= h:`],
      ['pop', `                top = stack.pop()`],
      ['area', `                left = stack[-1] ${k('if')} stack ${k('else')} -1`],
      ['area', `                best = max(best, heights[top] * (i - left - 1))`],
      ['push', `            stack.append(i)`],
      ['ret', `        ${k('return')} best`],
    ],
    javascript: [
      [null, `${k('const')} largestRectangleArea = ${k('function')} (heights) {`],
      [null, `  ${k('const')} stack = []; ${c('// indices; heights rise from bottom to top')}`],
      [null, `  ${k('let')} best = 0;`],
      [null, `  ${k('for')} (${k('let')} i = 0; i &lt;= heights.length; i++) {`],
      [null, `    ${k('const')} h = i &lt; heights.length ? heights[i] : 0; ${c('// a 0 at the end empties the stack')}`],
      ['pop', `    ${k('while')} (stack.length &amp;&amp; heights[stack[stack.length - 1]] &gt;= h) {`],
      ['pop', `      ${k('const')} top = stack.pop();`],
      ['area', `      ${k('const')} left = stack.length ? stack[stack.length - 1] : -1;`],
      ['area', `      best = Math.max(best, heights[top] * (i - left - 1));`],
      [null, `    }`],
      ['push', `    stack.push(i);`],
      [null, `  }`],
      ['ret', `  ${k('return')} best;`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} largestRectangleArea(heights []int) int {`],
      [null, `    stack, best := []int{}, 0 ${c('// indices; heights rise from bottom to top')}`],
      [null, `    ${k('for')} i := 0; i &lt;= len(heights); i++ {`],
      [null, `        h := 0 ${c('// a 0 at the end empties the stack')}`],
      [null, `        ${k('if')} i &lt; len(heights) {`],
      [null, `            h = heights[i]`],
      [null, `        }`],
      ['pop', `        ${k('for')} len(stack) &gt; 0 &amp;&amp; heights[stack[len(stack)-1]] &gt;= h {`],
      ['pop', `            top := stack[len(stack)-1]`],
      ['pop', `            stack = stack[:len(stack)-1]`],
      ['area', `            left := -1`],
      ['area', `            ${k('if')} len(stack) &gt; 0 {`],
      ['area', `                left = stack[len(stack)-1]`],
      [null, `            }`],
      ['area', `            best = max(best, heights[top]*(i-left-1))`],
      [null, `        }`],
      ['push', `        stack = append(stack, i)`],
      [null, `    }`],
      ['ret', `    ${k('return')} best`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} largest_rectangle_area(heights: Vec&lt;i32&gt;) -&gt; i32 {`],
      [null, `        ${k('let')} ${k('mut')} stack: Vec&lt;usize&gt; = Vec::new(); ${c('// indices; heights rise from bottom to top')}`],
      [null, `        ${k('let')} ${k('mut')} best = 0;`],
      [null, `        ${k('for')} i ${k('in')} 0..=heights.len() {`],
      [null, `            ${k('let')} h = ${k('if')} i &lt; heights.len() { heights[i] } ${k('else')} { 0 }; ${c('// a 0 at the end empties the stack')}`],
      ['pop', `            ${k('while')} ${k('let')} ${k('Some')}(&amp;top) = stack.last() {`],
      ['pop', `                ${k('if')} heights[top] &lt; h {`],
      [null, `                    break;`],
      [null, `                }`],
      ['pop', `                stack.pop();`],
      ['area', `                ${k('let')} width = ${k('match')} stack.last() { ${k('Some')}(&amp;left) =&gt; i - left - 1, ${k('None')} =&gt; i };`],
      ['area', `                best = best.max(heights[top] * width as i32);`],
      [null, `            }`],
      ['push', `            stack.push(i);`],
      [null, `        }`],
      ['ret', `        best`],
      [null, `    }`],
      [null, `}`],
    ],
  },
};

/* ---------------- part 1: the "shortest bar decides" widget ----------------
 *
 * Click a bar to make it the shortest in a rectangle: it stretches left and
 * right across every neighbour at least as tall, and the area is its height
 * times that width. The best of these, over every bar, is the answer. */

const QW_SETS = [
  { label: exampleTitle(1), h: [2, 1, 5, 6, 2, 3] },
  { label: t('a low bar wins', 'နိမ့်သော bar နိုင်'), h: [3, 2, 3, 2, 3, 2, 3] },
  { label: t('a tower', 'မျှော်စင်'), h: [1, 1, 8, 1, 1] },
];

function mountShortestWidget(host) {
  const state = { set: 0, at: 2 };
  host.innerHTML = `
    <div class="hg" data-hg></div>
    <div class="q-slider"><span class="q-presets" data-presets></span></div>
    <p class="q-tie" data-line></p>
    <div class="ledger">
      <span class="expr" data-expr></span>
      <span class="total" data-total></span>
    </div>`;
  const q = (sel) => host.querySelector(sel);
  const span = (h, i) => { let lo = i, hi = i; while (lo > 0 && h[lo - 1] >= h[i]) lo--; while (hi < h.length - 1 && h[hi + 1] >= h[i]) hi++; return [lo, hi]; };

  function render() {
    const { h } = QW_SETS[state.set];
    const i = Math.min(state.at, h.length - 1);
    const [lo, hi] = span(h, i);
    const areas = h.map((x, j) => { const [a, b] = span(h, j); return x * (b - a + 1); });
    const best = Math.max(...areas);
    q('[data-hg]').innerHTML = h.map((x, j) => `<span class="hg-col" role="button" tabindex="0" data-col="${j}" aria-label="bar ${j}, height ${x}">${Array.from({ length: Math.max(...h) }, (_, l) => {
      const level = Math.max(...h) - l;
      const inRect = j >= lo && j <= hi && level <= h[i];
      return `<span class="hg-u ${level <= x ? (inRect ? 'in' : 'bar') : 'air'}${j === i && level <= x ? ' me' : ''}"></span>`;
    }).join('')}<span class="hg-lab">${j}</span></span>`).join('');
    q('[data-presets]').innerHTML = presetChips(QW_SETS, state.set);
    widgetLabel(pick(t('click a bar', 'bar ကို နှိပ်ပါ')));
    q('[data-line]').innerHTML = pick(t(`With bar ${i} (${h[i]}) as the shortest, the rectangle spreads over bars ${lo} to ${hi} — every one at least ${h[i]} tall — for ${h[i]} × ${hi - lo + 1} = ${areas[i]}. ${areas[i] === best ? 'That is the largest there is.' : `The best bar gives ${best}.`}`,
      `bar ${i} (${h[i]}) ကို အတိုဆုံးအဖြစ် ထားလျှင် rectangle သည် bar ${lo} မှ ${hi} အထိ — တစ်ခုစီ အနည်းဆုံး ${h[i]} မြင့် — ပျံ့နှံ့ပြီး ${h[i]} × ${hi - lo + 1} = ${areas[i]}။ ${areas[i] === best ? 'ထိုအရာ အကြီးဆုံး ဖြစ်သည်။' : `အကောင်းဆုံး bar က ${best} ပေးသည်။`}`));
    q('[data-expr]').innerHTML = `areas: ${areas.join(' · ')}`;
    q('[data-total]').innerHTML = `${best}<small>${pick(t('largest', 'အကြီးဆုံး'))}</small>`;
  }
  const pickCol = (el) => { state.at = Number(el.dataset.col); render(); host.querySelector(`[data-col="${state.at}"]`)?.focus(); };
  host.addEventListener('click', (ev) => {
    const chip = ev.target.closest('[data-set]');
    if (chip) { state.set = Number(chip.dataset.set); state.at = 0; return render(); }
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
  extend: {
    idea: t('The best rectangle is as tall as its shortest bar. Try every bar as that shortest bar and stretch it as wide as its neighbours allow.', 'အကောင်းဆုံး rectangle သည် ၎င်း၏ အတိုဆုံး bar အမြင့် ဖြစ်သည်။ bar တိုင်းကို ထိုအတိုဆုံးအဖြစ် စမ်းပြီး အိမ်နီးများ ခွင့်ပြုသမျှ ကျယ်အောင် ဆန့်သည်။'),
    steps: [
      t('For each <code>i</code>, move <code>lo</code> left while the bar before it is at least <code>heights[i]</code>.', '<code>i</code> တစ်ခုစီအတွက် ရှေ့ bar သည် အနည်းဆုံး <code>heights[i]</code> ဖြစ်နေသမျှ <code>lo</code> ကို ဘယ်သို့ ရွှေ့သည်။'),
      t('Move <code>hi</code> right the same way.', '<code>hi</code> ကို ထိုနည်းတူ ညာသို့ ရွှေ့သည်။'),
      t('<code>best = max(best, heights[i] × (hi − lo + 1))</code>.', '<code>best = max(best, heights[i] × (hi − lo + 1))</code>။'),
    ],
    cost: t('Each bar can grow across the whole array: O(n²) — 10¹⁰ steps on 10⁵ equal bars (computed).', 'bar တစ်ခုစီသည် array တစ်ခုလုံးကို ဖြတ်၍ ကြီးထွားနိုင်သည် — O(n²) — တူညီသော bar 10⁵ တွင် 10¹⁰ လှမ်း (တွက်ထားသည်)။'),
  },
  stack: {
    idea: t('Keep a stack of bars whose heights rise. When a bar arrives that is not taller than the top, the top has found its right limit, and the bar under it is its left limit — measure it and pop.',
            'အမြင့်များ တက်သော bar များ၏ stack ကို ထိန်းသည်။ ထိပ်ထက် မမြင့်သော bar ရောက်လာလျှင် ထိပ်သည် ၎င်း၏ ညာကန့်သတ်ကို တွေ့ပြီ ဖြစ်ပြီး ၎င်းအောက်ရှိ bar သည် ဘယ်ကန့်သတ် — တိုင်းပြီး pop သည်။'),
    steps: [
      t('Walk <code>i</code> over the bars and one extra 0 at the end.', 'bar များနှင့် အဆုံးရှိ အပို 0 တစ်ခုကို <code>i</code> ဖြင့် လျှောက်သည်။'),
      t('While the top is <code>≥ h</code>: pop it; its width runs from the new top + 1 to <code>i − 1</code>.', 'ထိပ်သည် <code>≥ h</code> ဖြစ်နေသမျှ — pop — ၎င်း၏ အကျယ်သည် ထိပ်အသစ် + 1 မှ <code>i − 1</code> အထိ။'),
      t('Push <code>i</code>.', '<code>i</code> ကို push သည်။'),
    ],
    cost: t('Every bar is pushed once and popped once: O(n) time and O(n) for the stack.', 'bar တိုင်းကို တစ်ကြိမ် push ပြီး တစ်ကြိမ် pop သည် — O(n) အချိန်နှင့် stack အတွက် O(n)။'),
  },
};

/* ---------------- mount ---------------- */

const EX1 = [2, 1, 5, 6, 2, 3];

mountLesson({
  input: { heights: EX1 },
  controls: [
    { key: 'heights', label: 'heights', value: listText(EX1), parse: intList({ max: MAX_N, lo: 0, hi: 20 }), format: listText },
  ],
  presets: [
    { label: exampleTitle(1), input: { heights: EX1 } },
    { label: exampleTitle(2), input: { heights: [2, 4] } },
    { label: t('all equal', 'အားလုံး တူ'), input: { heights: [3, 3, 3, 3] } },
    { label: t('a valley', 'ချိုင့်'), input: { heights: [4, 2, 0, 3, 2, 5] } },
  ],
  examples: [
    { title: exampleTitle(1), inputHtml: '<code>heights = [2,1,5,6,2,3]</code>', output: '10',
      why: [t('Bars 2 and 3 (heights 5 and 6) make a rectangle 5 tall and 2 wide.', 'bar 2 နှင့် 3 (အမြင့် 5 နှင့် 6) သည် 5 မြင့်ပြီး 2 ကျယ်သော rectangle ဖြစ်စေသည်။')], load: { heights: EX1 } },
    { title: exampleTitle(2), inputHtml: '<code>heights = [2,4]</code>', output: '4',
      why: [t('Either 2 × 2 across both bars or 4 × 1 on the taller one: 4.', 'bar နှစ်ခုလုံးကို ဖြတ်၍ 2 × 2 သို့မဟုတ် မြင့်သည့်ပေါ်တွင် 4 × 1 — 4။')], load: { heights: [2, 4] } },
  ],
  modes: [
    { id: 'extend', name: 'Grow around each bar',
      desc: t('Each bar as the shortest: stretch it as wide as it goes.', 'bar တစ်ခုစီကို အတိုဆုံးအဖြစ် — ဆန့်နိုင်သမျှ ကျယ်အောင်။'),
      cost: 'O(n²) time · O(1) extra', build: buildExtend },
    { id: 'stack', name: 'Monotonic stack',
      desc: t('A stack of rising bars finds both limits of each bar in one pass.', 'တက်သော bar များ၏ stack က bar တစ်ခုစီ၏ ကန့်သတ် နှစ်ဖက်လုံးကို pass တစ်ခုဖြင့် ရှာသည်။'),
      cost: 'O(n) time · O(n) extra', build: buildStack },
  ],
  languages: LANGUAGES,
  code: CODE,
  solutions: {
    extend: { approach: APPROACH.extend,
      desc: t('Correct and direct, but a row of equal bars makes every bar grow across all of them.', 'မှန်ပြီး တိုက်ရိုက်၊ သို့သော် တူညီသော bar တန်းက bar တိုင်းကို အားလုံးကို ဖြတ်၍ ကြီးထွားစေသည်။') },
    stack: { approach: APPROACH.stack,
      desc: t('The O(n) answer. The extra 0 at the end is what measures the bars still on the stack; leave it out and they are never counted.',
              'O(n) အဖြေ။ အဆုံးရှိ အပို 0 သည် stack ပေါ်တွင် ကျန်နေသေးသော bar များကို တိုင်းပေးသည် — ချန်ခဲ့လျှင် ၎င်းတို့ကို ဘယ်တော့မှ မရေတွက်။') },
  },
  // How each language was actually checked, printed as the part 3 badges.
  // The corpus: the 2 examples, 6 edges, 15,000 random histograms of up to
  // 12 bars from 0..5, 5,000 of up to 300 across the full range, and five of
  // 10⁵ bars — against a nearest-lower-by-jumping oracle. Growing around each
  // bar skips the five at 10⁵. Go and Rust ran in Docker (golang:1.23-alpine,
  // rust:1-slim).
  verification: {
    ruby: { extend: 'ran here · 20,008 cases, not the five at n = 10⁵', stack: 'ran here · 20,013 cases' },
    python: { extend: 'ran here · 20,008 cases, not the five at n = 10⁵', stack: 'ran here · 20,013 cases' },
    javascript: { extend: 'ran here · 20,008 cases, not the five at n = 10⁵', stack: 'ran here · 20,013 cases' },
    go: { extend: 'ran here · 20,008 cases, not the five at n = 10⁵ · Go 1.23', stack: 'ran here · 20,013 cases · Go 1.23' },
    rust: { extend: 'ran here · 20,008 cases, not the five at n = 10⁵ · rustc 1.98', stack: 'ran here · 20,013 cases · rustc 1.98' },
  },
  stripLabel: t('heights', 'heights'),
  strip,
  draw,
  answer,
  vars,
  widget: mountShortestWidget,
});
