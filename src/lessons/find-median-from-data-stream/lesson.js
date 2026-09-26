/* Find Median from Data Stream — LeetCode 295.
 *
 * The median is the middle of the sorted numbers. Keep them sorted as they
 * arrive — binary-search each one's place and shift the larger ones up — and
 * the middle is always an index away: O(n) per add, O(1) per find. Or notice
 * that only the middle matters: split the numbers into a smaller half and a
 * larger half, keep the smaller half in a max-heap and the larger in a
 * min-heap, sizes equal or the smaller half one ahead. Both tops sit at the
 * middle, and each add is O(log n).
 */
import { mountLesson } from '../../lib/stepper.js';
import { heapNested } from '../../lib/tree.js';
import { pick, onLangChange } from '../../lib/i18n.js';
import { cells, slots, stagePanel, tree, readout, panels } from '../../lib/stage.js';
import { t, exampleTitle, LANGUAGES, k, c, stageRow, stageGap, presetChips, widgetLabel, stageEmpty } from '../../lib/kit.js';

const MAX_OPS = 12;

function parseOps(text) {
  const s = String(text).replace(/\s+/g, '');
  const ops = [];
  let rest = s;
  while (rest) {
    const m = rest.match(/^(?:addNum\((-?\d{1,2})\)|findMedian\(\))(?:,|$)/);
    if (!m) throw new Error('calls like addNum(1), findMedian() — numbers from -99 to 99 here');
    ops.push(m[1] != null ? Number(m[1]) : 'f');
    rest = rest.slice(m[0].length);
  }
  if (!ops.length) throw new Error('at least one call');
  if (ops[0] === 'f') throw new Error('add a number before the first findMedian(), as the statement promises');
  if (ops.length > MAX_OPS) throw new Error(`at most ${MAX_OPS} calls, so the stage stays readable`);
  return ops;
}
const opText = (o) => (o === 'f' ? 'findMedian()' : `addNum(${o})`);
const fmtOps = (ops) => ops.map(opText).join(', ');
const fmt = (x) => (Number.isInteger(x) ? x.toFixed(1) : String(x));

/* The two heaps as the textbook array heap keeps them. Python's heapq pops
 * with a different sift, so its arrays can be ordered differently below the
 * root; the tops and sizes — all the algorithm reads — are the same. */
function hPush(h, x, less) {
  h.push(x);
  let i = h.length - 1;
  while (i > 0 && less(h[i], h[(i - 1) >> 1])) { [h[i], h[(i - 1) >> 1]] = [h[(i - 1) >> 1], h[i]]; i = (i - 1) >> 1; }
}
function hPop(h, less) {
  const top = h[0];
  const last = h.pop();
  if (!h.length) return top;
  h[0] = last;
  let i = 0;
  for (;;) {
    let best = i;
    for (const ch of [2 * i + 1, 2 * i + 2]) if (ch < h.length && less(h[ch], h[best])) best = ch;
    if (best === i) break;
    [h[i], h[best]] = [h[best], h[i]];
    i = best;
  }
  return top;
}
const maxFirst = (a, b) => a > b;
const minFirst = (a, b) => a < b;

/* ---------------- step generators ---------------- */

function buildSorted({ ops }) {
  const nums = [];
  const results = [];
  const steps = [];
  const snap = (extra) => ({ view: 'sorted', nums: [...nums], results: [...results], op: null, ...extra });
  steps.push(snap({ line: 'init', tag: t('nums = []', 'nums = []'),
    note: t('MedianFinder(): an empty array that will hold every number, always in sorted order.', 'MedianFinder() — ကိန်းတိုင်းကို အမြဲ စီထားသည့်အတိုင်း ကိုင်မည့် ဗလာ array။') }));
  ops.forEach((o, op) => {
    if (o === 'f') {
      const n = nums.length;
      const v = n % 2 ? nums[n >> 1] : (nums[n / 2 - 1] + nums[n / 2]) / 2;
      results.push(v);
      steps.push(snap({ op, line: n % 2 ? 'odd' : 'even', mid: n % 2 ? [n >> 1] : [n / 2 - 1, n / 2], just: op, tag: t(`median ${fmt(v)}`, `median ${fmt(v)}`),
        note: n % 2
          ? t(`${n} numbers, an odd count: the median is the middle one, nums[${n >> 1}] = <b>${fmt(v)}</b>.`, `ကိန်း ${n} ခု၊ မကိန်း — median သည် အလယ်ကိန်း nums[${n >> 1}] = <b>${fmt(v)}</b>။`)
          : t(`${n} numbers, an even count: no single middle, so average the two — (${nums[n / 2 - 1]} + ${nums[n / 2]}) / 2 = <b>${fmt(v)}</b>, a float.`, `ကိန်း ${n} ခု၊ စုံကိန်း — အလယ် တစ်ခုတည်း မရှိ၍ နှစ်ခုကို ပျမ်းမျှ — (${nums[n / 2 - 1]} + ${nums[n / 2]}) / 2 = <b>${fmt(v)}</b>၊ float။`) }));
      return;
    }
    let i = 0;
    while (i < nums.length && nums[i] < o) i++;
    results.push(null);
    steps.push(snap({ op, line: 'find', at: i, num: o, tag: t(`index ${i}`, `index ${i}`),
      note: t(`addNum(${o}): binary search for where ${o} belongs — index ${i}, before ${i < nums.length ? `${nums[i]}` : 'nothing'}. About log₂ n looks.`,
              `addNum(${o}) — ${o} ရှိသင့်သည့်နေရာကို binary search — index ${i}၊ ${i < nums.length ? `${nums[i]} ရှေ့` : 'အဆုံး'}။ log₂ n ခန့် ကြည့်သည်။`) }));
    const moved = nums.length - i;
    nums.splice(i, 0, o);
    steps.push(snap({ op, line: 'insert', at: i, num: o, shifted: moved, tag: t(`${moved} shifted`, `${moved} ရွှေ့`),
      note: t(`Insert ${o} at index ${i}: the ${moved} ${moved === 1 ? 'number' : 'numbers'} after it each shift up one place. Finding the spot was cheap; making room is O(n).`,
              `${o} ကို index ${i} တွင် ထည့်သည် — ၎င်းနောက်ရှိ ကိန်း ${moved} ခု တစ်နေရာစီ ရွှေ့သည်။ နေရာရှာခြင်း သက်သာ — နေရာလုပ်ခြင်းမှာ O(n)။`) }));
  });
  steps[steps.length - 1] = { ...steps.at(-1), finished: true };
  return steps;
}

function buildHeaps({ ops }) {
  const low = [], high = [];
  const results = [];
  const steps = [];
  const snap = (extra) => ({ view: 'heaps', low: [...low], high: [...high], results: [...results], op: null, ...extra });
  steps.push(snap({ line: 'init', tag: t('two empty heaps', 'heap ဗလာ နှစ်ခု'),
    note: t('MedianFinder(): low will hold the smaller half with its largest on top; high the larger half with its smallest on top.', 'MedianFinder() — low သည် အငယ်တစ်ဝက်ကို အကြီးဆုံး အပေါ်ထား၍ ကိုင်မည် — high သည် အကြီးတစ်ဝက်ကို အငယ်ဆုံး အပေါ်ထား၍ ကိုင်မည်။') }));
  ops.forEach((o, op) => {
    if (o === 'f') {
      const odd = low.length > high.length;
      const v = odd ? low[0] : (low[0] + high[0]) / 2;
      results.push(v);
      steps.push(snap({ op, line: odd ? 'odd' : 'even', just: op, top: odd ? ['low'] : ['low', 'high'], tag: t(`median ${fmt(v)}`, `median ${fmt(v)}`),
        note: odd
          ? t(`low holds one more than high, so its top is the middle number: <b>${fmt(v)}</b>. One look, O(1).`, `low တွင် high ထက် တစ်ခု ပိုရှိသဖြင့် ၎င်း၏ top သည် အလယ်ကိန်း — <b>${fmt(v)}</b>။ တစ်ကြိမ်ကြည့် O(1)။`)
          : t(`The halves are equal: the median is the average of the two tops, (${low[0]} + ${high[0]}) / 2 = <b>${fmt(v)}</b>.`, `တစ်ဝက်နှစ်ခု တူသည် — median သည် top နှစ်ခု၏ ပျမ်းမျှ၊ (${low[0]} + ${high[0]}) / 2 = <b>${fmt(v)}</b>။`) }));
      return;
    }
    results.push(null);
    hPush(low, o, maxFirst);
    steps.push(snap({ op, line: 'push', num: o, moved: ['low', o], tag: t(`low ← ${o}`, `low ← ${o}`),
      note: t(`addNum(${o}): push it onto low. It may not belong in the smaller half at all — the next line sorts that out.`, `addNum(${o}) — low ပေါ် push လုပ်သည်။ ၎င်းသည် အငယ်တစ်ဝက်တွင် မဟုတ်နိုင် — နောက်စာကြောင်းက ဖြေရှင်းသည်။`) }));
    const x = hPop(low, maxFirst);
    hPush(high, x, minFirst);
    steps.push(snap({ op, line: 'cross', num: o, moved: ['high', x], tag: t(`${x} → high`, `${x} → high`),
      note: t(`Move low's largest, ${x}, to high. Now everything in low is ≤ everything in high${x === o ? ` — ${o} was the largest, so it crossed straight over` : ''}.`,
              `low ၏ အကြီးဆုံး ${x} ကို high သို့ ရွှေ့သည်။ ယခု low ရှိ အရာအားလုံး ≤ high ရှိ အရာအားလုံး${x === o ? ` — ${o} သည် အကြီးဆုံး ဖြစ်၍ တိုက်ရိုက် ကူးသွားသည်` : ''}။`) }));
    if (high.length > low.length) {
      const y = hPop(high, minFirst);
      hPush(low, y, maxFirst);
      steps.push(snap({ op, line: 'balance', num: o, moved: ['low', y], tag: t(`${y} → low`, `${y} → low`),
        note: t(`high now has more than low. Move its smallest, ${y}, back: low keeps the extra number when the count is odd. Sizes ${low.length} and ${high.length}.`,
                `high တွင် low ထက် ပိုများသည်။ ၎င်း၏ အငယ်ဆုံး ${y} ကို ပြန်ရွှေ့သည် — အရေအတွက် မဖြစ်လျှင် low က အပိုကိန်းကို ထိန်းသည်။ size ${low.length} နှင့် ${high.length}။`) }));
    } else {
      steps.push(snap({ op, line: 'balance', num: o, tag: t('sizes fine', 'size ကိုက်'),
        note: t(`Sizes ${low.length} and ${high.length}: low is equal or one ahead, as it should be. Nothing to move.`, `size ${low.length} နှင့် ${high.length} — low သည် တူ သို့မဟုတ် တစ်ခု ပို၊ ဖြစ်သင့်သည့်အတိုင်း။ ရွှေ့စရာ မရှိ။`) }));
    }
  });
  steps[steps.length - 1] = { ...steps.at(-1), finished: true };
  return steps;
}

/* ---------------- drawing ----------------
 *
 * The strip is the calls, the one running in amber. The stage is what the
 * finder keeps: the sorted array with the middle marked and the shifted
 * numbers flagged, or the two heaps drawn as the trees their arrays encode,
 * low's largest and high's smallest on top. */

function strip(s, { ops }) {
  return `<div class="strip wraps">${cells(ops.map((o) => (o === 'f' ? 'find' : `add ${o}`)), {
    wide: true,
    tone: Object.fromEntries(ops.map((_, j) => [j, j === s.op ? 'inwin' : (s.op != null && j < s.op) || s.finished ? 'done' : null]).filter(([, x]) => x)),
  })}</div>`;
}

function heapPanel(h, name, s) {
  if (!h.length) return `<div class="st-box"><span class="st-label">${name}</span>${stageEmpty(pick(t('empty', 'ဗလာ')))}</div>`;
  const tone = {};
  if (s.top && s.top.includes(name)) tone[0] = 'warn';
  if (s.moved && s.moved[0] === name) { const i = h.indexOf(s.moved[1]); if (i >= 0) tone[i] = 'done'; }
  return tree(heapNested(h), { tone, label: name });
}

function draw(s) {
  if (s.view === 'sorted') {
    const tone = {};
    if (s.shifted) for (let j = s.at + 1; j < s.nums.length; j++) tone[j] = 'leaving';
    if (s.at != null && s.shifted != null) tone[s.at] = 'entering';
    for (const m of s.mid ?? []) tone[m] = 'inwin';
    const marks = s.line === 'find' ? { [s.at]: '↓' } : {};
    return stagePanel(pick(t('nums — every number, sorted', 'nums — ကိန်းတိုင်း၊ စီထား')),
      s.shifted != null ? pick(t(`${s.shifted} shifted`, `${s.shifted} ရွှေ့`)) : pick(t(`${s.nums.length} numbers`, `ကိန်း ${s.nums.length} ခု`)),
      stageRow(s.nums.length ? cells(s.nums, { tone, marks }) : '', pick(t('empty', 'ဗလာ'))));
  }
  return stagePanel(pick(t('low — the smaller half, largest on top · high — the larger half, smallest on top', 'low — အငယ်တစ်ဝက်၊ အကြီးဆုံး အပေါ် · high — အကြီးတစ်ဝက်၊ အငယ်ဆုံး အပေါ်')),
    `${s.low.length} · ${s.high.length}`,
    panels(heapPanel(s.low, 'low', s), heapPanel(s.high, 'high', s)))
    + stageGap + readout({ 'low top': s.low.length ? s.low[0] : '—', 'high top': s.high.length ? s.high[0] : '—', sizes: `${s.low.length} · ${s.high.length}` });
}

function answer(s, { ops }) {
  return {
    html: slots(s.results.map((r) => (r === null ? 'null' : fmt(r))), { total: ops.length, just: s.just ?? -1 }),
    note: t('what each call returns', 'call တစ်ခုစီ ပြန်ပေးသည့်အရာ'),
  };
}

function vars(s, { ops }) {
  const out = [];
  const o = s.op != null ? ops[s.op] : null;
  if (o != null && o !== 'f') out.push(['num', o]);
  if (s.view === 'sorted') {
    out.push(['nums', `[${s.nums.join(', ')}]`], ['n', s.nums.length]);
    if (s.at != null) out.push(['i', s.at], ['lo', s.at]);
  } else {
    // the values each half holds, largest (low) or smallest (high) first; most listings store low negated
    out.push(['low', `{${[...s.low].sort((x, y) => y - x).join(', ')}}`], ['high', `{${[...s.high].sort((x, y) => x - y).join(', ')}}`]);
  }
  return out;
}

/* ---------------- the code, one key per line ----------------
 *
 * Generated from the verified solution files, so the listing a reader copies
 * is byte-identical to the one that ran. */

const CODE = {
  sorted: {
    ruby: [
      [null, `class MedianFinder`],
      [null, `  ${k('def')} initialize`],
      ['init', `    @nums = [] ${c('# every number so far, kept sorted')}`],
      [null, `  ${k('end')}`],
      [null, ``],
      [null, `  ${k('def')} add_num(num)`],
      ['find', `    i = @nums.bsearch_index { |x| x &gt;= num } || @nums.length ${c('# where num belongs')}`],
      ['insert', `    @nums.insert(i, num) ${c('# everything after i shifts up one')}`],
      [null, `  ${k('end')}`],
      [null, ``],
      [null, `  ${k('def')} find_median`],
      [null, `    n = @nums.length`],
      ['odd', `    ${k('return')} @nums[n / 2].to_f ${k('if')} n.odd?`],
      ['even', `    (@nums[n / 2 - 1] + @nums[n / 2]) / 2.0`],
      [null, `  ${k('end')}`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('import')} bisect`],
      [null, ``],
      [null, `${k('class')} MedianFinder:`],
      [null, `    ${k('def')} __init__(self):`],
      ['init', `        self.nums = []                          ${c('# every number so far, kept sorted')}`],
      [null, ``],
      [null, `    ${k('def')} addNum(self, num):`],
      ['find', `        i = bisect.bisect_left(self.nums, num)  ${c('# where num belongs')}`],
      ['insert', `        self.nums.insert(i, num)                ${c('# everything after i shifts up one')}`],
      [null, ``],
      [null, `    ${k('def')} findMedian(self):`],
      [null, `        n = len(self.nums)`],
      ['odd', `        ${k('if')} n % 2:`],
      ['odd', `            ${k('return')} float(self.nums[n // 2])`],
      ['even', `        ${k('return')} (self.nums[n // 2 - 1] + self.nums[n // 2]) / 2`],
    ],
    javascript: [
      [null, `class MedianFinder {`],
      [null, `  constructor() {`],
      ['init', `    this.nums = []; ${c('// every number so far, kept sorted')}`],
      [null, `  }`],
      [null, ``],
      [null, `  addNum(num) {`],
      ['find', `    ${k('let')} lo = 0, hi = this.nums.length; ${c('// where num belongs')}`],
      ['find', `    ${k('while')} (lo &lt; hi) {`],
      ['find', `      ${k('const')} mid = (lo + hi) &gt;&gt; 1;`],
      ['find', `      ${k('if')} (this.nums[mid] &lt; num) lo = mid + 1;`],
      ['find', `      ${k('else')} hi = mid;`],
      ['find', `    }`],
      ['insert', `    this.nums.splice(lo, 0, num); ${c('// everything after lo shifts up one')}`],
      [null, `  }`],
      [null, ``],
      [null, `  findMedian() {`],
      [null, `    ${k('const')} n = this.nums.length;`],
      ['odd', `    ${k('if')} (n % 2) ${k('return')} this.nums[n &gt;&gt; 1];`],
      ['even', `    ${k('return')} (this.nums[n / 2 - 1] + this.nums[n / 2]) / 2;`],
      [null, `  }`],
      [null, `}`],
    ],
    go: [
      [null, `type MedianFinder struct {`],
      [null, `    nums []int                               ${c('// every number so far, kept sorted')}`],
      [null, `}`],
      [null, ``],
      [null, `${k('func')} Constructor() MedianFinder {`],
      ['init', `    ${k('return')} MedianFinder{}`],
      [null, `}`],
      [null, ``],
      [null, `${k('func')} (this *MedianFinder) AddNum(num int) {`],
      ['find', `    i := sort.SearchInts(this.nums, num)     ${c('// where num belongs')}`],
      ['insert', `    this.nums = append(this.nums, 0)`],
      ['insert', `    copy(this.nums[i+1:], this.nums[i:])     ${c('// everything after i shifts up one')}`],
      ['insert', `    this.nums[i] = num`],
      [null, `}`],
      [null, ``],
      [null, `${k('func')} (this *MedianFinder) FindMedian() float64 {`],
      [null, `    n := len(this.nums)`],
      ['odd', `    ${k('if')} n%2 == 1 {`],
      ['odd', `        ${k('return')} float64(this.nums[n/2])`],
      [null, `    }`],
      ['even', `    ${k('return')} float64(this.nums[n/2-1]+this.nums[n/2]) / 2`],
      [null, `}`],
    ],
    rust: [
      [null, `struct MedianFinder {`],
      [null, `    nums: Vec&lt;i32&gt;, ${c('// every number so far, kept sorted')}`],
      [null, `}`],
      [null, ``],
      [null, `${k('impl')} MedianFinder {`],
      [null, `    ${k('fn')} new() -&gt; ${k('Self')} {`],
      ['init', `        MedianFinder { nums: vec![] }`],
      [null, `    }`],
      [null, ``],
      [null, `    ${k('fn')} add_num(&amp;${k('mut')} self, num: i32) {`],
      ['find', `        ${k('let')} i = self.nums.partition_point(|&amp;x| x &lt; num); ${c('// where num belongs')}`],
      ['insert', `        self.nums.insert(i, num); ${c('// everything after i shifts up one')}`],
      [null, `    }`],
      [null, ``],
      [null, `    ${k('fn')} find_median(&amp;self) -&gt; f64 {`],
      [null, `        ${k('let')} n = self.nums.len();`],
      ['odd', `        ${k('if')} n % 2 == 1 {`],
      ['odd', `            ${k('return')} self.nums[n / 2] as f64;`],
      [null, `        }`],
      ['even', `        (self.nums[n / 2 - 1] as f64 + self.nums[n / 2] as f64) / 2.0`],
      [null, `    }`],
      [null, `}`],
    ],
  },
  heaps: {
    ruby: [
      [null, `class MedianFinder`],
      [null, `  ${k('def')} initialize`],
      ['init', `    @low = [] ${c('# the smaller half, negated so a min-heap keeps its largest on top')}`],
      ['init', `    @high = [] ${c('# the larger half, smallest on top')}`],
      [null, `  ${k('end')}`],
      [null, ``],
      [null, `  ${k('def')} add_num(num)`],
      ['push', `    heap_push(@low, -num)`],
      ['cross', `    heap_push(@high, -heap_pop(@low)) ${c('# low\'s largest crosses over')}`],
      ['balance', `    heap_push(@low, -heap_pop(@high)) ${k('if')} @high.size &gt; @low.size ${c('# low keeps the extra one')}`],
      [null, `  ${k('end')}`],
      [null, ``],
      [null, `  ${k('def')} find_median`],
      ['odd', `    ${k('return')} (-@low[0]).to_f ${k('if')} @low.size &gt; @high.size`],
      ['even', `    (-@low[0] + @high[0]) / 2.0`],
      [null, `  ${k('end')}`],
      [null, ``],
      [null, `  private`],
      [null, ``],
      [null, `  ${c('# a min-heap in an array: the parent of i is (i - 1) / 2')}`],
      [null, `  ${k('def')} heap_push(h, x)`],
      [null, `    h &lt;&lt; x`],
      [null, `    i = h.size - 1`],
      [null, `    ${k('while')} i &gt; 0 &amp;&amp; h[(i - 1) / 2] &gt; h[i]`],
      [null, `      h[(i - 1) / 2], h[i] = h[i], h[(i - 1) / 2]`],
      [null, `      i = (i - 1) / 2`],
      [null, `    ${k('end')}`],
      [null, `  ${k('end')}`],
      [null, ``],
      [null, `  ${k('def')} heap_pop(h)`],
      [null, `    top = h[0]`],
      [null, `    last = h.pop`],
      [null, `    ${k('return')} top ${k('if')} h.empty?`],
      [null, `    h[0] = last`],
      [null, `    i = 0`],
      [null, `    loop ${k('do')}`],
      [null, `      small = i`],
      [null, `      [2 * i + 1, 2 * i + 2].each { |c| small = c ${k('if')} c &lt; h.size &amp;&amp; h[c] &lt; h[small] }`],
      [null, `      break ${k('if')} small == i`],
      [null, `      h[i], h[small] = h[small], h[i]`],
      [null, `      i = small`],
      [null, `    ${k('end')}`],
      [null, `    top`],
      [null, `  ${k('end')}`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('import')} heapq`],
      [null, ``],
      [null, `${k('class')} MedianFinder:`],
      [null, `    ${k('def')} __init__(self):`],
      ['init', `        self.low = []                           ${c('# the smaller half, negated: a max-heap')}`],
      ['init', `        self.high = []                          ${c('# the larger half, smallest on top')}`],
      [null, ``],
      [null, `    ${k('def')} addNum(self, num):`],
      ['push', `        heapq.heappush(self.low, -num)`],
      ['cross', `        heapq.heappush(self.high, -heapq.heappop(self.low))     ${c('# low\'s largest crosses over')}`],
      ['balance', `        ${k('if')} len(self.high) &gt; len(self.low):                      ${c('# low keeps the extra one')}`],
      ['balance', `            heapq.heappush(self.low, -heapq.heappop(self.high))`],
      [null, ``],
      [null, `    ${k('def')} findMedian(self):`],
      ['odd', `        ${k('if')} len(self.low) &gt; len(self.high):`],
      ['odd', `            ${k('return')} float(-self.low[0])`],
      ['even', `        ${k('return')} (-self.low[0] + self.high[0]) / 2`],
    ],
    javascript: [
      [null, `class MedianFinder {`],
      [null, `  constructor() {`],
      ['init', `    this.low = []; ${c('// the smaller half, negated so a min-heap keeps its largest on top')}`],
      ['init', `    this.high = []; ${c('// the larger half, smallest on top')}`],
      [null, `  }`],
      [null, ``],
      [null, `  addNum(num) {`],
      ['push', `    heapPush(this.low, -num);`],
      ['cross', `    heapPush(this.high, -heapPop(this.low)); ${c('// low\'s largest crosses over')}`],
      ['balance', `    ${k('if')} (this.high.length &gt; this.low.length) heapPush(this.low, -heapPop(this.high)); ${c('// low keeps the extra one')}`],
      [null, `  }`],
      [null, ``],
      [null, `  findMedian() {`],
      ['odd', `    ${k('if')} (this.low.length &gt; this.high.length) ${k('return')} -this.low[0];`],
      ['even', `    ${k('return')} (-this.low[0] + this.high[0]) / 2;`],
      [null, `  }`],
      [null, `}`],
      [null, ``],
      [null, `${c('// a min-heap in an array: the parent of i is (i - 1) &gt;&gt; 1')}`],
      [null, `${k('function')} heapPush(h, x) {`],
      [null, `  h.push(x);`],
      [null, `  ${k('let')} i = h.length - 1;`],
      [null, `  ${k('while')} (i &gt; 0 &amp;&amp; h[(i - 1) &gt;&gt; 1] &gt; h[i]) {`],
      [null, `    [h[(i - 1) &gt;&gt; 1], h[i]] = [h[i], h[(i - 1) &gt;&gt; 1]];`],
      [null, `    i = (i - 1) &gt;&gt; 1;`],
      [null, `  }`],
      [null, `}`],
      [null, ``],
      [null, `${k('function')} heapPop(h) {`],
      [null, `  ${k('const')} top = h[0];`],
      [null, `  ${k('const')} last = h.pop();`],
      [null, `  ${k('if')} (h.length === 0) ${k('return')} top;`],
      [null, `  h[0] = last;`],
      [null, `  ${k('let')} i = 0;`],
      [null, `  ${k('for')} (;;) {`],
      [null, `    ${k('let')} small = i;`],
      [null, `    ${k('for')} (${k('const')} c ${k('of')} [2 * i + 1, 2 * i + 2]) ${k('if')} (c &lt; h.length &amp;&amp; h[c] &lt; h[small]) small = c;`],
      [null, `    ${k('if')} (small === i) break;`],
      [null, `    [h[i], h[small]] = [h[small], h[i]];`],
      [null, `    i = small;`],
      [null, `  }`],
      [null, `  ${k('return')} top;`],
      [null, `}`],
    ],
    go: [
      [null, `type minHeap []int`],
      [null, ``],
      [null, `${k('func')} (h minHeap) Len() int           { ${k('return')} len(h) }`],
      [null, `${k('func')} (h minHeap) Less(i, j int) bool { ${k('return')} h[i] &lt; h[j] }`],
      [null, `${k('func')} (h minHeap) Swap(i, j int)      { h[i], h[j] = h[j], h[i] }`],
      [null, `${k('func')} (h *minHeap) Push(x any)        { *h = append(*h, x.(int)) }`],
      [null, `${k('func')} (h *minHeap) Pop() any {`],
      [null, `    old := *h`],
      [null, `    x := old[len(old)-1]`],
      [null, `    *h = old[:len(old)-1]`],
      [null, `    ${k('return')} x`],
      [null, `}`],
      [null, ``],
      [null, `type MedianFinder struct {`],
      [null, `    low  *minHeap                            ${c('// the smaller half, negated so its largest is on top')}`],
      [null, `    high *minHeap                            ${c('// the larger half, smallest on top')}`],
      [null, `}`],
      [null, ``],
      [null, `${k('func')} Constructor() MedianFinder {`],
      ['init', `    ${k('return')} MedianFinder{&amp;minHeap{}, &amp;minHeap{}}`],
      [null, `}`],
      [null, ``],
      [null, `${k('func')} (this *MedianFinder) AddNum(num int) {`],
      ['push', `    heap.Push(this.low, -num)`],
      ['cross', `    heap.Push(this.high, -heap.Pop(this.low).(int)) ${c('// low\'s largest crosses over')}`],
      ['balance', `    ${k('if')} this.high.Len() &gt; this.low.Len() {    ${c('// low keeps the extra one')}`],
      ['balance', `        heap.Push(this.low, -heap.Pop(this.high).(int))`],
      [null, `    }`],
      [null, `}`],
      [null, ``],
      [null, `${k('func')} (this *MedianFinder) FindMedian() float64 {`],
      ['odd', `    ${k('if')} this.low.Len() &gt; this.high.Len() {`],
      ['odd', `        ${k('return')} float64(-(*this.low)[0])`],
      [null, `    }`],
      ['even', `    ${k('return')} float64(-(*this.low)[0]+(*this.high)[0]) / 2`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('use')} std::cmp::Reverse;`],
      [null, `${k('use')} std::collections::BinaryHeap;`],
      [null, ``],
      [null, `struct MedianFinder {`],
      [null, `    low: BinaryHeap&lt;i32&gt;,           ${c('// the smaller half, largest on top')}`],
      [null, `    high: BinaryHeap&lt;Reverse&lt;i32&gt;&gt;, ${c('// the larger half, smallest on top')}`],
      [null, `}`],
      [null, ``],
      [null, `${k('impl')} MedianFinder {`],
      [null, `    ${k('fn')} new() -&gt; ${k('Self')} {`],
      ['init', `        MedianFinder { low: BinaryHeap::new(), high: BinaryHeap::new() }`],
      [null, `    }`],
      [null, ``],
      [null, `    ${k('fn')} add_num(&amp;${k('mut')} self, num: i32) {`],
      ['push', `        self.low.push(num);`],
      ['cross', `        self.high.push(Reverse(self.low.pop().unwrap())); ${c('// low\'s largest crosses over')}`],
      ['balance', `        ${k('if')} self.high.len() &gt; self.low.len() { ${c('// low keeps the extra one')}`],
      ['balance', `            self.low.push(self.high.pop().unwrap().0);`],
      [null, `        }`],
      [null, `    }`],
      [null, ``],
      [null, `    ${k('fn')} find_median(&amp;self) -&gt; f64 {`],
      ['odd', `        ${k('if')} self.low.len() &gt; self.high.len() {`],
      ['odd', `            ${k('return')} *self.low.peek().unwrap() as f64;`],
      [null, `        }`],
      ['even', `        (*self.low.peek().unwrap() as f64 + self.high.peek().unwrap().0 as f64) / 2.0`],
      [null, `    }`],
      [null, `}`],
    ],
  },
};


/* ---------------- part 1: the "two halves" widget ----------------
 *
 * The median only ever needs the middle: the largest of the smaller half and
 * the smallest of the larger half. Drag through a stream and watch the sorted
 * numbers split into two halves, the smaller half one ahead when the count is
 * odd. */

const QW_SETS = [
  { label: exampleTitle(1), nums: [1, 2, 3] },
  { label: t('a mixed stream', 'ရောနှော stream'), nums: [5, 15, 1, 3, 8, 7, 9, 10, 20, 6] },
  { label: t('repeats', 'ထပ်ကိန်း'), nums: [4, 4, 1, 4, 9, 4] },
];

function mountHalvesWidget(host) {
  const state = { set: 1, n: 5 };
  host.innerHTML = `
    <div class="mf-w" data-halves></div>
    <div class="q-slider"><label for="mf-n" data-lbl></label><input type="range" id="mf-n" min="1" max="1" value="1"><output data-out></output>
      <span class="q-presets" data-presets></span></div>
    <p class="q-tie" data-line></p>
    <div class="ledger">
      <span class="expr" data-expr></span>
      <span class="total" data-total></span>
    </div>`;
  const q = (sel) => host.querySelector(sel);

  function render() {
    const all = QW_SETS[state.set].nums;
    const n = Math.min(state.n, all.length);
    const seen = all.slice(0, n);
    const sorted = [...seen].sort((a, b) => a - b);
    const lowN = Math.ceil(n / 2);
    const low = sorted.slice(0, lowN), high = sorted.slice(lowN);
    const med = n % 2 ? low.at(-1) : (low.at(-1) + high[0]) / 2;
    q('[data-halves]').innerHTML = `
      <div class="q-arr mf-stream">${all.map((v, i) => `<div class="cell ${i < n ? (i === n - 1 ? 'picked' : 'kept') : 'cut'}"><span>${v}</span><span class="idx">${i + 1}</span></div>`).join('')}</div>
      <div class="mf-halves"><div class="q-arr">${low.map((v, i) => `<div class="cell ${i === low.length - 1 ? 'picked' : 'kept'}"><span>${v}</span></div>`).join('')}</div>
      <span class="mf-bar" aria-hidden="true"></span>
      <div class="q-arr">${high.map((v, i) => `<div class="cell ${i === 0 && n % 2 === 0 ? 'picked' : 'kept'}"><span>${v}</span></div>`).join('') || '<span class="note mono">—</span>'}</div></div>`;
    q('[data-lbl]').textContent = pick(t('added', 'ထည့်ပြီး'));
    const el = q('#mf-n'); el.max = String(all.length); el.value = String(n);
    q('[data-out]').textContent = String(n);
    q('[data-presets]').innerHTML = presetChips(QW_SETS, state.set);
    widgetLabel(pick(t(`median ${fmt(med)}`, `median ${fmt(med)}`)));
    q('[data-line]').innerHTML = pick(n % 2
      ? t(`${n} numbers, odd: the smaller half keeps the extra one, and its largest, ${low.at(-1)}, is the median.`,
          `ကိန်း ${n} ခု၊ မကိန်း — အငယ်တစ်ဝက်က အပိုကိန်းကို ထိန်းပြီး ၎င်း၏ အကြီးဆုံး ${low.at(-1)} သည် median။`)
      : t(`${n} numbers, even: the median is halfway between the smaller half's largest, ${low.at(-1)}, and the larger half's smallest, ${high[0]} — it can be a .5.`,
          `ကိန်း ${n} ခု၊ စုံ — median သည် အငယ်တစ်ဝက်၏ အကြီးဆုံး ${low.at(-1)} နှင့် အကြီးတစ်ဝက်၏ အငယ်ဆုံး ${high[0]} ၏ အလယ် — .5 ဖြစ်နိုင်သည်။`));
    q('[data-expr]').innerHTML = n % 2 ? `max(low) = ${low.at(-1)}` : `(${low.at(-1)} + ${high[0]}) / 2`;
    q('[data-total]').innerHTML = `${fmt(med)}<small>${pick(t('median', 'median'))}</small>`;
  }
  host.addEventListener('input', (ev) => { if (ev.target.id === 'mf-n') { state.n = Number(ev.target.value); render(); } });
  host.addEventListener('click', (ev) => {
    const chip = ev.target.closest('[data-set]');
    if (chip) { state.set = Number(chip.dataset.set); state.n = QW_SETS[state.set].nums.length; render(); }
  });
  onLangChange(render);
  render();
}

/* ---------------- the approach, in brief ---------------- */

const APPROACH = {
  sorted: {
    idea: t('Keep every number in one sorted array. Each add binary-searches its place and inserts it there; the median is then one or two indexes away.',
            'ကိန်းတိုင်းကို စီထားသော array တစ်ခုထဲ ထားသည်။ ထည့်တိုင်း ၎င်း၏နေရာကို binary search ပြီး ထိုနေရာတွင် ထည့်သည် — median သည် index တစ်ခု သို့မဟုတ် နှစ်ခု အကွာတွင် ရှိသည်။'),
    steps: [
      t('<code>addNum</code>: binary-search the first number ≥ num, insert num there.', '<code>addNum</code> — num ထက် ≥ ပထမကိန်းကို binary search ပြီး ထိုနေရာတွင် num ကို ထည့်။'),
      t('<code>findMedian</code>: the middle element if the count is odd, else the average of the middle two.', '<code>findMedian</code> — အရေအတွက် မဖြစ်လျှင် အလယ် element၊ မဟုတ်လျှင် အလယ်နှစ်ခု၏ ပျမ်းမျှ။'),
    ],
    cost: t('O(log n) to find the place but O(n) to insert, since everything after it moves; findMedian is O(1). 5 × 10⁴ adds took 148 ms in Python here — the shift is one fast memory move.',
            'နေရာရှာရန် O(log n) သို့သော် ထည့်ရန် O(n) — နောက်ရှိ အရာအားလုံး ရွှေ့သောကြောင့်၊ findMedian သည် O(1)။ ဤနေရာတွင် Python ဖြင့် ထည့်ခြင်း 5 × 10⁴ သည် 148 ms ကြာသည် — ရွှေ့ခြင်းသည် မြန်သော memory move တစ်ခု။'),
  },
  heaps: {
    idea: t('Keep the smaller half in a max-heap and the larger half in a min-heap, the smaller half equal in size or one ahead. The two tops are the middle.',
            'အငယ်တစ်ဝက်ကို max-heap ထဲ၊ အကြီးတစ်ဝက်ကို min-heap ထဲ ထားပြီး အငယ်တစ်ဝက်သည် size တူ သို့မဟုတ် တစ်ခု ပို။ top နှစ်ခုသည် အလယ်။'),
    steps: [
      t('<code>addNum</code>: push onto low, then move low\'s largest to high.', '<code>addNum</code> — low ပေါ် push ပြီး low ၏ အကြီးဆုံးကို high သို့ ရွှေ့။'),
      t('If high is now bigger, move its smallest back to low.', 'high ပိုကြီးသွားလျှင် ၎င်း၏ အငယ်ဆုံးကို low သို့ ပြန်ရွှေ့။'),
      t('<code>findMedian</code>: low\'s top if low is bigger, else the average of both tops.', '<code>findMedian</code> — low ပိုကြီးလျှင် low ၏ top၊ မဟုတ်လျှင် top နှစ်ခု၏ ပျမ်းမျှ။'),
    ],
    cost: t('At most three heap operations per add, O(log n); findMedian is O(1). 5 × 10⁴ adds took 16 ms in Python here.',
            'ထည့်တစ်ကြိမ်လျှင် heap operation အများဆုံး သုံးခု၊ O(log n) — findMedian သည် O(1)။ ဤနေရာတွင် Python ဖြင့် ထည့်ခြင်း 5 × 10⁴ သည် 16 ms ကြာသည်။'),
  },
};

/* ---------------- mount ---------------- */

const EX1 = [1, 2, 'f', 3, 'f'];

mountLesson({
  input: { ops: EX1 },
  controls: [
    { key: 'ops', label: t('calls', 'call များ'), parse: parseOps, format: fmtOps },
  ],
  presets: [
    { label: exampleTitle(1), input: { ops: EX1 } },
    { label: t('descending', 'ကြီးမှ ငယ်'), input: { ops: [9, 7, 'f', 5, 'f', 3, 'f', 1, 'f'] } },
    { label: t('negatives and repeats', 'အနုတ်နှင့် ထပ်ကိန်း'), input: { ops: [-4, 6, 'f', 6, -1, 'f', 0, 'f'] } },
  ],
  examples: [
    { title: exampleTitle(1),
      inputHtml: '<code>["MedianFinder", "addNum", "addNum", "findMedian", "addNum", "findMedian"]<br>[[], [1], [2], [], [3], []]</code>',
      output: '[null, null, null, 1.5, null, 2.0]',
      why: [
        t('After addNum(1) and addNum(2), arr = [1, 2]: findMedian returns 1.5, i.e. (1 + 2) / 2.', 'addNum(1) နှင့် addNum(2) ပြီးနောက် arr = [1, 2] — findMedian သည် 1.5 ပြန်ပေးသည်၊ ဆိုလိုသည်မှာ (1 + 2) / 2။'),
        t('After addNum(3), arr = [1, 2, 3]: findMedian returns 2.0.', 'addNum(3) ပြီးနောက် arr = [1, 2, 3] — findMedian သည် 2.0 ပြန်ပေးသည်။'),
      ],
      load: { ops: EX1 } },
  ],
  modes: [
    { id: 'sorted', name: 'Sorted array',
      sub: t('insert in place', 'နေရာတွင် ထည့်'),
      desc: t('Binary-search each number\'s place and insert it; read the middle.', 'ကိန်းတစ်ခုစီ၏ နေရာကို binary search ပြီး ထည့် — အလယ်ကို ဖတ်။'),
      cost: 'O(n) add · O(1) find', build: buildSorted },
    { id: 'heaps', name: 'Two heaps',
      sub: t('two halves', 'တစ်ဝက် နှစ်ခု'),
      desc: t('A max-heap for the smaller half, a min-heap for the larger.', 'အငယ်တစ်ဝက်အတွက် max-heap၊ အကြီးတစ်ဝက်အတွက် min-heap။'),
      cost: 'O(log n) add · O(1) find', build: buildHeaps },
  ],
  languages: LANGUAGES,
  code: CODE,
  hover: { ruby: { '@nums': 'nums', '@low': 'low', '@high': 'high' } },
  solutions: {
    sorted: { approach: APPROACH.sorted,
      desc: t('Simple and, at this problem\'s size, fast: the insert is O(n), but it is one block memory move, and 5 × 10⁴ of them finish in well under a second. It is the stream growing much past that which makes it quadratic in practice.',
              'ရိုးရှင်းပြီး ဤပြဿနာ၏ size တွင် မြန်သည် — ထည့်ခြင်းသည် O(n) ဖြစ်သော်လည်း memory move တစ်ခုတည်း ဖြစ်ပြီး 5 × 10⁴ ခု တစ်စက္ကန့်အောက် ပြီးသည်။ stream သည် ထိုထက် အများကြီး ကြီးလာမှ လက်တွေ့တွင် quadratic ဖြစ်သည်။') },
    heaps: { approach: APPROACH.heaps,
      desc: t('The answer the problem is built around. Python and Go have a min-heap only, so low stores negated numbers; Ruby and JavaScript have no heap at all, so the listings carry a small one.',
              'ပြဿနာကို ဒီဇိုင်းထားသော အဖြေ။ Python နှင့် Go တွင် min-heap သာ ရှိသဖြင့် low သည် အနုတ်ပြောင်းထားသော ကိန်းများကို သိမ်းသည် — Ruby နှင့် JavaScript တွင် heap လုံးဝ မရှိသဖြင့် listing များတွင် heap သေးသေးလေး ပါသည်။') },
  },
  // How each language was actually checked, printed as the part 3 badges.
  // The corpus: the example, 6 edges, 15,000 random runs of up to 20 calls
  // over -5..5, 5,000 of up to 500 over ±10⁵, and six of 5 × 10⁴ calls —
  // against a Fenwick tree over every value. Go and Rust ran in Docker
  // (golang:1.23-alpine, rust:1-slim).
  verification: {
    ruby: 'ran here · 20,013 cases',
    python: 'ran here · 20,013 cases',
    javascript: 'ran here · 20,013 cases',
    go: 'ran here · 20,013 cases · Go 1.23',
    rust: 'ran here · 20,013 cases · rustc 1.98',
  },
  stripLabel: t('The calls, in order', 'call များ — အစဉ်အတိုင်း'),
  strip,
  draw,
  answer,
  vars,
  widget: mountHalvesWidget,
});
