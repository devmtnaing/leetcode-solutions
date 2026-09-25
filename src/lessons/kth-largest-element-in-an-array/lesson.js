/* Kth Largest Element in an Array — LeetCode 215.
 *
 * Sorting answers it, and sorts all n values to learn about k of them. A
 * min-heap capped at k keeps only the k largest seen so far: a new value goes
 * in, and whenever there are k + 1 the smallest is thrown out. The smallest of
 * the k largest is the kth largest, and a min-heap keeps it at the root.
 */
import { mountLesson } from '../../lib/stepper.js';
import { pick, onLangChange } from '../../lib/i18n.js';
import { cells, tree, readout, slots, stagePanel } from '../../lib/stage.js';
import { t, exampleTitle, LANGUAGES, k, c, stageRow, stageGap, intList, intValue, listText, presetChips, widgetLabel } from '../../lib/kit.js';

const MAX_LEN = 10;

const ord = (n) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
};

/* ---------------- step generators ---------------- */

function checkK(nums, k) {
  if (k > nums.length) throw new Error(`k is at most the number of values, ${nums.length}`);
}

function buildSort({ nums, k }) {
  checkK(nums, k);
  const n = nums.length;
  const sorted = [...nums].sort((a, b) => a - b);
  const steps = [];
  const snap = (extra) => ({ view: 'sort', sorted, rank: 0, result: null, ...extra });
  steps.push(snap({ line: 'sort', tag: t('sort', 'sort'),
    note: t(`Sort all ${n} values: <b>[${sorted.join(', ')}]</b>. The largest is now at the end.`,
            `value ${n} ခုလုံးကို sort လုပ်သည် — <b>[${sorted.join(', ')}]</b>။ အကြီးဆုံးသည် ယခု အဆုံးတွင် ရှိသည်။`) }));
  for (let r = 1; r <= k; r++) {
    const last = r === k;
    steps.push(snap({ rank: r, line: 'pick', result: last ? sorted[n - r] : null, finished: last, tag: t(ord(r), `${r} ခုမြောက်`),
      note: last
        ? t(`Index ${n} − ${k} = ${n - k}: the ${ord(k)} from the end is <b>${sorted[n - k]}</b>. Duplicates each take their own place.`,
            `index ${n} − ${k} = ${n - k} — အဆုံးမှ ${k} ခုမြောက်မှာ <b>${sorted[n - k]}</b>။ ထပ်နေသော value တစ်ခုစီသည် ကိုယ်ပိုင်နေရာ ယူသည်။`)
        : t(`The ${ord(r)} largest is ${sorted[n - r]}.`, `${r} ခုမြောက် အကြီးဆုံးမှာ ${sorted[n - r]}။`) }));
  }
  return steps;
}

/* Heap moves are replayed here so the stage can show where the new value
 * settled; the listings' own helpers (or the library heaps) do the same. */
function push(h, x) {
  h.push(x);
  let i = h.length - 1;
  while (i > 0 && h[(i - 1) >> 1] > h[i]) { [h[(i - 1) >> 1], h[i]] = [h[i], h[(i - 1) >> 1]]; i = (i - 1) >> 1; }
  return i;
}
function pop(h) {
  const top = h[0];
  const last = h.pop();
  if (h.length) {
    h[0] = last;
    let i = 0;
    for (;;) {
      let small = i;
      for (const ch of [2 * i + 1, 2 * i + 2]) if (ch < h.length && h[ch] < h[small]) small = ch;
      if (small === i) break;
      [h[i], h[small]] = [h[small], h[i]];
      i = small;
    }
  }
  return top;
}

function buildHeap({ nums, k }) {
  checkK(nums, k);
  const steps = [];
  const heap = [];
  const snap = (extra) => ({ view: 'heap', heap: [...heap], i: null, at: null, dropped: null, result: null, ...extra });
  steps.push(snap({ line: 'init', tag: t('empty heap', 'heap ဗလာ'),
    note: t(`A min-heap that will hold at most ${k} ${k === 1 ? 'value' : 'values'} — the ${k} largest seen so far, smallest at the root.`,
            `value ${k} ခုအထိသာ ထားမည့် min-heap — ယခုထိ တွေ့သမျှထဲက အကြီးဆုံး ${k} ခု၊ အငယ်ဆုံးက root တွင်။`) }));
  nums.forEach((x, i) => {
    steps.push(snap({ i, line: 'read', tag: t(`read ${x}`, `${x} ဖတ်`),
      note: t(`Index ${i}: <b>${x}</b>.`, `index ${i} — <b>${x}</b>။`) }));
    const at = push(heap, x);
    steps.push(snap({ i, at, line: 'push', tag: t('push', 'push'),
      note: t(`Push ${x}. It rises past any bigger parent, so the smallest stays on top: the root is ${heap[0]}.`,
              `${x} ကို push လုပ်သည်။ ၎င်းသည် ပိုကြီးသော parent ကို ကျော်တက်သဖြင့် အငယ်ဆုံးက အပေါ်တွင် ရှိနေသည် — root မှာ ${heap[0]}။`) }));
    if (heap.length > k) {
      const gone = pop(heap);
      steps.push(snap({ i, dropped: gone, line: 'pop', tag: t(`drop ${gone}`, `${gone} ဖယ်`),
        note: t(`${k + 1} values, one too many. Pop the root, <b>${gone}</b>: it is smaller than ${k} others, so it cannot be the ${ord(k)} largest. The new root is ${heap[0]}.`,
                `value ${k + 1} ခု — တစ်ခု ပိုနေသည်။ root <b>${gone}</b> ကို pop လုပ်သည် — ၎င်းသည် အခြား ${k} ခုထက် ငယ်သဖြင့် ${k} ခုမြောက် အကြီးဆုံး မဖြစ်နိုင်ပါ။ root အသစ်မှာ ${heap[0]}။`) }));
    } else {
      steps.push(snap({ i, line: 'pop', tag: t(`${heap.length} of ${k}`, `${k} အနက် ${heap.length}`),
        note: t(`${heap.length} ${heap.length === 1 ? 'value' : 'values'}, not more than ${k}: keep them all.`, `value ${heap.length} ခု၊ ${k} ထက် မပို — အားလုံး ထားသည်။`) }));
    }
  });
  steps.push(snap({ result: heap[0], finished: true, line: 'ret', tag: t(`return ${heap[0]}`, `${heap[0]} ပြန်`),
    note: t(`The heap holds the ${k} largest: [${[...heap].sort((a, b) => b - a).join(', ')}]. The smallest of them — the root — is the ${ord(k)} largest: <b>${heap[0]}</b>.`,
            `heap ထဲတွင် အကြီးဆုံး ${k} ခု ရှိသည် — [${[...heap].sort((a, b) => b - a).join(', ')}]။ ၎င်းတို့ထဲက အငယ်ဆုံး — root — သည် ${k} ခုမြောက် အကြီးဆုံး — <b>${heap[0]}</b>။`) }));
  return steps;
}

/* ---------------- drawing ----------------
 *
 * The strip is the input. The stage holds what each approach keeps: the
 * whole array, sorted, counted from the right; or the heap, drawn as the tree
 * its array encodes, with the root — the answer so far — on top. */

function heapTree(h) {
  const build = (i) => (i < h.length ? { value: h[i], left: build(2 * i + 1), right: build(2 * i + 2) } : null);
  const root = build(0);
  // tree() identifies nodes by their order in treeNodes(); map heap indices onto it
  const ids = {};
  let next = 0;
  (function walk(i) { if (i >= h.length) return; ids[i] = next++; walk(2 * i + 1); walk(2 * i + 2); })(0);
  return { root, ids };
}

function strip(s, { nums }) {
  const tone = {};
  const marks = {};
  if (s.view === 'heap') {
    if (s.i != null) {
      for (let x = 0; x < s.i; x++) tone[x] = 'done';
      tone[s.i] = 'inwin';
      marks[s.i] = 'x';
    }
    if (s.finished) nums.forEach((_, x) => { tone[x] = 'done'; });
  } else {
    nums.forEach((_, x) => { tone[x] = 'done'; });
  }
  return cells(nums, { tone, marks });
}

function draw(s, { nums, k }) {
  if (s.view === 'sort') {
    const n = s.sorted.length;
    const tone = {};
    const marks = {};
    for (let r = 1; r <= s.rank; r++) tone[n - r] = r === k && s.finished ? 'entering' : 'inwin';
    if (s.rank) marks[n - s.rank] = ord(s.rank);
    return stagePanel(pick(t('All of it, sorted', 'အားလုံး — sort ပြီး')), pick(t(`${n} values sorted to find one`, `တစ်ခုကို ရှာရန် value ${n} ခု sort`)),
      stageRow(cells(s.sorted, { tone, marks }), ''));
  }
  const { root, ids } = heapTree(s.heap);
  const tone = {};
  if (s.at != null) tone[ids[s.at]] = 'warn';
  if (s.heap.length && (s.finished || s.dropped != null)) tone[ids[0]] = 'done';
  return stagePanel(pick(t(`min-heap — at most ${k}`, `min-heap — ${k} အထိ`)),
    pick(t(`${s.heap.length} held`, `${s.heap.length} ခု ထား`)),
    (s.heap.length ? tree(root, { tone }) : `<p class="note mono stage-empty">${pick(t('empty', 'ဗလာ'))}</p>`)
      + stageGap + readout({ root: s.heap.length ? s.heap[0] : '—', size: `${s.heap.length} / ${k}`, dropped: s.dropped ?? '—' }));
}

function answer(s) {
  return {
    html: slots(s.finished ? [s.result] : [], { total: 1, just: s.finished ? 0 : -1 }),
    note: s.finished ? t('the kth largest', 'k ခုမြောက် အကြီးဆုံး') : t('one value', 'value တစ်ခု'),
  };
}

function vars(s, { nums, k }) {
  const base = [['k', k], ['nums', `[${nums.join(', ')}]`]];
  if (s.view === 'sort') return [...base, ['sorted', `[${s.sorted.join(', ')}]`], ['ordered', `[${s.sorted.join(', ')}]`]];
  return [...base, ['heap', `[${s.heap.join(', ')}]`], ['h', `[${s.heap.join(', ')}]`], ['x', s.i == null ? '—' : nums[s.i]]];
}

/* ---------------- the code, one key per line ----------------
 *
 * Generated from the verified solution files, so the listing a reader copies
 * is byte-identical to the one that ran. */

const CODE = {
  sort: {
    ruby: [
      [null, `${k('def')} find_kth_largest(nums, k)`],
      ['sort', `  sorted = nums.sort`],
      ['pick', `  sorted[sorted.length - k]`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} findKthLargest(self, nums, k):`],
      ['sort', `        ordered = sorted(nums)`],
      ['pick', `        ${k('return')} ordered[len(ordered) - k]`],
    ],
    javascript: [
      [null, `${k('const')} findKthLargest = ${k('function')} (nums, k) {`],
      ['sort', `  ${k('const')} sorted = [...nums].sort((a, b) =&gt; a - b);`],
      ['pick', `  ${k('return')} sorted[sorted.length - k];`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} findKthLargest(nums []int, k int) int {`],
      ['sort', `    sort.Ints(nums)`],
      ['pick', `    ${k('return')} nums[len(nums)-k]`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} find_kth_largest(${k('mut')} nums: Vec&lt;i32&gt;, k: i32) -&gt; i32 {`],
      ['sort', `        nums.sort();`],
      ['pick', `        nums[nums.len() - k as usize]`],
      [null, `    }`],
      [null, `}`],
    ],
  },
  heap: {
    ruby: [
      [null, `${k('def')} find_kth_largest(nums, k)`],
      ['init', `  heap = []`],
      ['read', `  nums.each ${k('do')} |x|`],
      ['push', `    heap_push(heap, x)`],
      ['pop', `    heap_pop(heap) ${k('if')} heap.size &gt; k`],
      [null, `  ${k('end')}`],
      ['ret', `  heap[0]`],
      [null, `${k('end')}`],
      [null, ``],
      [null, `${c('# a min-heap in an array: the parent of i is (i - 1) / 2')}`],
      [null, `${k('def')} heap_push(h, x)`],
      [null, `  h &lt;&lt; x`],
      [null, `  i = h.size - 1`],
      [null, `  ${k('while')} i &gt; 0 &amp;&amp; h[(i - 1) / 2] &gt; h[i]`],
      [null, `    h[(i - 1) / 2], h[i] = h[i], h[(i - 1) / 2]`],
      [null, `    i = (i - 1) / 2`],
      [null, `  ${k('end')}`],
      [null, `${k('end')}`],
      [null, ``],
      [null, `${k('def')} heap_pop(h)`],
      [null, `  last = h.pop`],
      [null, `  ${k('return')} ${k('if')} h.empty?`],
      [null, `  h[0] = last`],
      [null, `  i = 0`],
      [null, `  loop ${k('do')}`],
      [null, `    small = i`],
      [null, `    [2 * i + 1, 2 * i + 2].each { |c| small = c ${k('if')} c &lt; h.size &amp;&amp; h[c] &lt; h[small] }`],
      [null, `    break ${k('if')} small == i`],
      [null, `    h[i], h[small] = h[small], h[i]`],
      [null, `    i = small`],
      [null, `  ${k('end')}`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('import')} heapq`],
      [null, ``],
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} findKthLargest(self, nums, k):`],
      ['init', `        heap = []`],
      ['read', `        ${k('for')} x ${k('in')} nums:`],
      ['push', `            heapq.heappush(heap, x)`],
      ['pop', `            ${k('if')} len(heap) &gt; k:`],
      [null, `                heapq.heappop(heap)`],
      ['ret', `        ${k('return')} heap[0]`],
    ],
    javascript: [
      [null, `${k('const')} findKthLargest = ${k('function')} (nums, k) {`],
      ['init', `  ${k('const')} heap = [];`],
      ['read', `  ${k('for')} (${k('const')} x ${k('of')} nums) {`],
      ['push', `    heapPush(heap, x);`],
      ['pop', `    ${k('if')} (heap.length &gt; k) heapPop(heap);`],
      [null, `  }`],
      ['ret', `  ${k('return')} heap[0];`],
      [null, `};`],
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
      [null, `  ${k('const')} last = h.pop();`],
      [null, `  ${k('if')} (h.length === 0) ${k('return')};`],
      [null, `  h[0] = last;`],
      [null, `  ${k('let')} i = 0;`],
      [null, `  ${k('for')} (;;) {`],
      [null, `    ${k('let')} small = i;`],
      [null, `    ${k('for')} (${k('const')} c ${k('of')} [2 * i + 1, 2 * i + 2]) ${k('if')} (c &lt; h.length &amp;&amp; h[c] &lt; h[small]) small = c;`],
      [null, `    ${k('if')} (small === i) break;`],
      [null, `    [h[i], h[small]] = [h[small], h[i]];`],
      [null, `    i = small;`],
      [null, `  }`],
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
      [null, `${k('func')} findKthLargest(nums []int, k int) int {`],
      ['init', `    h := &amp;minHeap{}`],
      ['read', `    ${k('for')} _, x := ${k('range')} nums {`],
      ['push', `        heap.Push(h, x)`],
      ['pop', `        ${k('if')} h.Len() &gt; k {`],
      [null, `            heap.Pop(h)`],
      [null, `        }`],
      [null, `    }`],
      ['ret', `    ${k('return')} (*h)[0]`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('use')} std::cmp::Reverse;`],
      [null, `${k('use')} std::collections::BinaryHeap;`],
      [null, ``],
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} find_kth_largest(nums: Vec&lt;i32&gt;, k: i32) -&gt; i32 {`],
      ['init', `        ${k('let')} ${k('mut')} heap = BinaryHeap::new();`],
      ['read', `        ${k('for')} x ${k('in')} nums {`],
      ['push', `            heap.push(Reverse(x));`],
      ['pop', `            ${k('if')} heap.len() &gt; k as usize {`],
      [null, `                heap.pop();`],
      [null, `            }`],
      [null, `        }`],
      ['ret', `        heap.peek().unwrap().0`],
      [null, `    }`],
      [null, `}`],
    ],
  },
};

/* ---------------- part 1: the "duplicates count" widget ----------------
 *
 * The statement hinges on "not the kth distinct element": each copy of a
 * value takes its own rank. Example 2 has two 5s, so the 2nd and 3rd largest
 * are both 5 and the 4th is 4 — the 4th distinct value would be 3. Drag k
 * and see the two readings part.
 *
 * Built from x-sum's widget vocabulary: .q-arr cells (kept / cut / picked),
 * the .q-slider, the amber .q-tie line and the .ledger. */

const QW_SETS = [
  { label: t('example 2', 'ဥပမာ 2'), nums: [3, 2, 3, 1, 2, 4, 5, 5, 6], k: 4 },
  { label: t('example 1', 'ဥပမာ 1'), nums: [3, 2, 1, 5, 6, 4], k: 2 },
  { label: t('all equal', 'အားလုံး တူ'), nums: [7, 7, 7, 7], k: 3 },
];

function mountRankWidget(host) {
  const state = { set: 0, k: 4 };
  host.innerHTML = `
    <div class="q-arr" data-arr></div>
    <div class="q-slider">
      <label for="qw-k">k =</label>
      <input type="range" id="qw-k" min="1" max="9" value="4">
      <output data-out>4</output>
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
    const kk = Math.min(state.k, nums.length);
    const desc = [...nums].sort((a, b) => b - a);
    const distinct = [...new Set(desc)];
    const answer = desc[kk - 1];
    const wrong = distinct[kk - 1];
    q('#qw-k').max = String(nums.length);
    q('#qw-k').value = String(kk);
    q('[data-out]').textContent = String(kk);
    q('[data-presets]').innerHTML = presetChips(QW_SETS, state.set);
    q('[data-arr]').innerHTML = desc.map((v, x) =>
      `<div class="cell ${x < kk ? 'kept' : 'cut'}${x === kk - 1 ? ' picked' : ''}"><span>${v}</span><span class="idx">${ord(x + 1)}</span></div>`).join('');
    widgetLabel(pick(t('sorted largest first', 'အကြီးဆုံးမှ စ၍ sort')));
    q('[data-line]').innerHTML = pick(wrong === undefined
      ? t(`There are only ${distinct.length} distinct ${distinct.length === 1 ? 'value' : 'values'}, so a "${ord(kk)} distinct" does not even exist — but the ${ord(kk)} largest is ${answer}.`,
          `ကွဲပြားသော value ${distinct.length} ခုသာ ရှိသဖြင့် "${kk} ခုမြောက် ကွဲပြား" မရှိပါ — သို့သော် ${kk} ခုမြောက် အကြီးဆုံးမှာ ${answer}။`)
      : wrong !== answer
        ? t(`Counting copies, the ${ord(kk)} largest is ${answer}. Counting distinct values it would be ${wrong} — the answer the statement warns against.`,
            `copy များကို ရေတွက်လျှင် ${kk} ခုမြောက် အကြီးဆုံးမှာ ${answer}။ ကွဲပြားသော value များကို ရေတွက်လျှင် ${wrong} ဖြစ်မည် — မေးခွန်း သတိပေးထားသော အဖြေ။`)
        : t(`Here both readings agree on ${answer} — move k past a repeated value to see them split.`,
            `ဤနေရာတွင် နှစ်မျိုးလုံး ${answer} ဟု သဘောတူသည် — ထပ်နေသော value ကို ကျော်အောင် k ကို ရွှေ့ကြည့်ပါ။`));
    q('[data-expr]').innerHTML = `${ord(kk)} of [${desc.join(', ')}]`;
    q('[data-total]').innerHTML = `${answer}<small>${pick(t(`${ord(kk)} largest`, `${kk} ခုမြောက်`))}</small>`;
  }
  host.addEventListener('input', (ev) => {
    if (ev.target.id !== 'qw-k') return;
    state.k = Number(ev.target.value); render();
  });
  host.addEventListener('click', (ev) => {
    const chip = ev.target.closest('[data-set]');
    if (!chip) return;
    const set = QW_SETS[Number(chip.dataset.set)];
    Object.assign(state, { set: Number(chip.dataset.set), k: set.k });
    render();
  });
  onLangChange(render);
  render();
}

/* ---------------- the approach, in brief ---------------- */

const APPROACH = {
  sort: {
    idea: t('Sort everything; the kth largest is k places from the end.', 'အားလုံးကို sort လုပ်သည် — k ခုမြောက် အကြီးဆုံးသည် အဆုံးမှ နေရာ k တွင် ရှိသည်။'),
    steps: [
      t('Sort <code>nums</code> ascending.', '<code>nums</code> ကို ငယ်စဉ်ကြီးလိုက် sort လုပ်သည်။'),
      t('Return the value at index <code>n − k</code>.', 'index <code>n − k</code> ရှိ value ကို ပြန်ပေးသည်။'),
    ],
    cost: t('the sort orders all n values — about 1.7 × 10⁶ comparisons at n = 10⁵ — to use one of them.',
            'sort သည် value n ခုလုံးကို စီသည် — n = 10⁵ တွင် နှိုင်းယှဉ်ခြင်း 1.7 × 10⁶ ခန့် — တစ်ခုကို သုံးရန်။'),
  },
  heap: {
    idea: t('Keep only the k largest seen so far, in a min-heap. The smallest of them sits at the root, so it is the one to throw out when a new value arrives — and at the end it is the answer.',
            'ယခုထိ တွေ့သမျှထဲက အကြီးဆုံး k ခုကိုသာ min-heap တွင် ထားသည်။ ၎င်းတို့ထဲက အငယ်ဆုံးသည် root တွင် ရှိသဖြင့် value အသစ် ရောက်လာသည့်အခါ ပစ်ရမည့်တစ်ခု ဖြစ်ပြီး အဆုံးတွင် အဖြေ ဖြစ်သည်။'),
    steps: [
      t('For each <code>x</code>, push it onto the min-heap.', '<code>x</code> တစ်ခုစီကို min-heap ပေါ် push လုပ်သည်။'),
      t('If the heap holds more than <code>k</code>, pop the smallest.', 'heap တွင် <code>k</code> ထက် ပိုရှိလျှင် အငယ်ဆုံးကို pop လုပ်သည်။'),
      t('Return the root.', 'root ကို ပြန်ပေးသည်။'),
    ],
    cost: t('each value costs one push and at most one pop on a heap of k + 1: O(n log k), and only k values held.',
            'value တစ်ခုစီသည် k + 1 heap ပေါ်တွင် push တစ်ကြိမ်နှင့် pop အများဆုံး တစ်ကြိမ် ကုန်သည် — O(n log k)၊ value k ခုသာ ထားသည်။'),
  },
};

/* ---------------- mount ---------------- */

mountLesson({
  input: { nums: [3, 2, 1, 5, 6, 4], k: 2 },
  controls: [
    { key: 'nums', label: 'nums', value: '3, 2, 1, 5, 6, 4', parse: intList({ max: MAX_LEN }), format: listText },
    { key: 'k', label: 'k', type: 'number', value: 2, parse: intValue({ lo: 1 }) },
  ],
  presets: [
    { label: exampleTitle(1), input: { nums: [3, 2, 1, 5, 6, 4], k: 2 } },
    { label: exampleTitle(2), input: { nums: [3, 2, 3, 1, 2, 4, 5, 5, 6], k: 4 } },
    { label: t('k = 1', 'k = 1'), input: { nums: [4, 9, 1, 7], k: 1 } },
    { label: t('k = n', 'k = n'), input: { nums: [4, 9, 1, 7], k: 4 } },
  ],
  examples: [
    { title: exampleTitle(1), inputHtml: '<code>nums = [3,2,1,5,6,4]</code>, <code>k = 2</code>', output: '5',
      why: [t('Largest first: 6, 5, … — the 2nd is 5.', 'အကြီးဆုံးမှ စ၍ — 6, 5, … — ဒုတိယမှာ 5။')],
      load: { nums: [3, 2, 1, 5, 6, 4], k: 2 } },
    { title: exampleTitle(2), inputHtml: '<code>nums = [3,2,3,1,2,4,5,5,6]</code>, <code>k = 4</code>', output: '4',
      why: [t('Largest first: 6, 5, 5, 4 — both 5s count, so the 4th is 4, not 3.', 'အကြီးဆုံးမှ စ၍ — 6, 5, 5, 4 — 5 နှစ်ခုလုံး ရေတွက်သဖြင့် စတုတ္ထမှာ 4၊ 3 မဟုတ်ပါ။')],
      load: { nums: [3, 2, 3, 1, 2, 4, 5, 5, 6], k: 4 } },
  ],
  modes: [
    { id: 'sort', name: 'Sort',
      desc: t('Sort it all; count k from the end.', 'အားလုံး sort၊ အဆုံးမှ k ရေတွက်။'),
      cost: 'O(n log n) time · O(n) or O(1) space', build: buildSort },
    { id: 'heap', name: 'Min-heap of size k',
      desc: t('Keep the k largest; the root is the answer.', 'အကြီးဆုံး k ခုကို ထား — root က အဖြေ။'),
      cost: 'O(n log k) time · O(k) space', build: buildHeap },
  ],
  languages: LANGUAGES,
  code: CODE,
  solutions: {
    sort: { approach: APPROACH.sort,
      desc: t('One line of real work. It passes, but the statement asks whether you can do it without sorting.',
              'တကယ့်အလုပ် တစ်ကြောင်းတည်း။ အောင်သော်လည်း မေးခွန်းက sort မလုပ်ဘဲ လုပ်နိုင်သလား မေးထားသည်။') },
    heap: { approach: APPROACH.heap,
      desc: t('The submission worth writing: a min-heap capped at k. Ruby and JavaScript have no heap built in, so theirs is written out — the push and pop are the same few lines everywhere.',
              'ရေးသင့်သည့် submission — k ဖြင့် ကန့်သတ်ထားသော min-heap။ Ruby နှင့် JavaScript တွင် heap built-in မပါသဖြင့် ရေးထားသည် — push နှင့် pop သည် နေရာတိုင်းတွင် စာကြောင်း အနည်းငယ်သာ ဖြစ်သည်။') },
  },
  // How each language was actually checked, printed as the part 3 badges.
  // The corpus: the 2 examples, 5 edges, 15,000 random arrays of 1–9 values
  // from -3..3 with any valid k, 5,000 of up to 300 across ±10⁴, and five at
  // n = 10⁵ — against an oracle that counts values and walks down from the
  // largest. Go and Rust ran in Docker (golang:1.23-alpine, rust:1-slim).
  verification: {
    ruby: 'ran here · 20,012 cases',
    python: 'ran here · 20,012 cases',
    javascript: 'ran here · 20,012 cases',
    go: 'ran here · 20,012 cases · Go 1.23',
    rust: 'ran here · 20,012 cases · rustc 1.98',
  },
  strip,
  draw,
  answer,
  vars,
  widget: mountRankWidget,
});
