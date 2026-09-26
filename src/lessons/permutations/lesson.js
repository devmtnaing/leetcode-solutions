/* Permutations — LeetCode 46.
 *
 * Fill the answer one position at a time. At each position try every number
 * not placed yet, recurse to fill the rest, then take it back and try the
 * next: that "take it back" is the backtracking. Two ways to know what is
 * still free: a `used` flag per number beside a growing `path`, or keeping the
 * free numbers in the tail of `nums` itself and swapping each into place.
 */
import { mountLesson } from '../../lib/stepper.js';
import { pick, onLangChange } from '../../lib/i18n.js';
import { cells, slots, stagePanel, stack, readout } from '../../lib/stage.js';
import { t, exampleTitle, LANGUAGES, k, c, stageRow, stageGap, intList, listText, presetChips, widgetLabel } from '../../lib/kit.js';

const MAX_N = 4;
const fact = (n) => (n <= 1 ? 1 : n * fact(n - 1));
const fmtP = (p) => `[${p.join(',')}]`;

/* ---------------- step generators ---------------- */

function buildUsed({ nums }) {
  const n = nums.length;
  const used = new Array(n).fill(false);
  const path = [], out = [], calls = [];
  const steps = [];
  const snap = (extra) => ({ view: 'used', used: [...used], path: [...path], out: out.map((p) => [...p]),
    calls: calls.map((f) => ({ ...f })), i: null, just: -1, ...extra });

  function build() {
    calls.push({ i: null });
    if (path.length === n) {
      out.push([...path]);
      steps.push(snap({ line: 'full', just: out.length - 1, tag: t(`#${out.length}`, `#${out.length}`),
        note: t(`path has all ${n} numbers: ${fmtP(path)} is permutation ${out.length} of ${fact(n)}. Copy it into out — path itself is about to change — and return.`,
                `path တွင် ဂဏန်း ${n} ခုလုံး ရှိပြီ — ${fmtP(path)} သည် ${fact(n)} ခုအနက် permutation ${out.length}။ ၎င်းကို out ထဲ copy ကူးပြီး return — path ကိုယ်တိုင် ပြောင်းတော့မည်။`) }));
      calls.pop();
      return;
    }
    for (let i = 0; i < n; i++) {
      calls.at(-1).i = i;
      if (used[i]) {
        steps.push(snap({ line: 'skip', i, tag: t(`skip ${nums[i]}`, `${nums[i]} ကျော်`),
          note: t(`nums[${i}] = ${nums[i]} is already in path. Skip it.`, `nums[${i}] = ${nums[i]} သည် path ထဲ ရှိပြီးသား။ ကျော်သည်။`) }));
        continue;
      }
      used[i] = true;
      path.push(nums[i]);
      steps.push(snap({ line: 'choose', i, tag: t(`place ${nums[i]}`, `${nums[i]} ထား`),
        note: t(`Position ${path.length}: place ${nums[i]}. path = ${fmtP(path)}; now fill the rest from what is left.`,
                `နေရာ ${path.length} — ${nums[i]} ကို ထားသည်။ path = ${fmtP(path)} — ယခု ကျန်သည်ဖြင့် ကျန်နေရာများကို ဖြည့်မည်။`) }));
      build();
      path.pop();
      used[i] = false;
      steps.push(snap({ line: 'undo', i, tag: t(`take ${nums[i]} back`, `${nums[i]} ပြန်ယူ`),
        note: t(`Every permutation starting ${fmtP([...path, nums[i]])} is in out. Take ${nums[i]} back out of position ${path.length + 1}, so the next number can go there.`,
                `${fmtP([...path, nums[i]])} ဖြင့် စသော permutation တိုင်း out ထဲ ရှိပြီ။ နောက်ဂဏန်း ထိုနေရာ ရောက်နိုင်ရန် နေရာ ${path.length + 1} မှ ${nums[i]} ကို ပြန်ထုတ်သည်။`) }));
    }
    calls.pop();
  }

  build();
  steps.push(snap({ line: 'ret', finished: true, tag: t(`${out.length} found`, `${out.length} ခု တွေ့`),
    note: t(`Every choice tried at every position: ${out.length} permutations, ${n}! = ${fact(n)}.`,
            `နေရာတိုင်းတွင် ရွေးချယ်မှု တိုင်းကို စမ်းပြီး — permutation ${out.length} ခု၊ ${n}! = ${fact(n)}။`) }));
  return steps;
}

function buildSwap({ nums: input }) {
  const nums = [...input];
  const n = nums.length;
  const out = [], calls = [];
  const steps = [];
  const snap = (extra) => ({ view: 'swap', nums: [...nums], out: out.map((p) => [...p]),
    calls: calls.map((f) => ({ ...f })), just: -1, ...extra });

  function build(k) {
    calls.push({ k, i: null });
    if (k === n) {
      out.push([...nums]);
      steps.push(snap({ line: 'full', just: out.length - 1, tag: t(`#${out.length}`, `#${out.length}`),
        note: t(`k = ${n}: every position is fixed. nums is now ${fmtP(nums)}, permutation ${out.length} of ${fact(n)}. Copy it into out.`,
                `k = ${n} — နေရာတိုင်း သတ်မှတ်ပြီး။ nums သည် ယခု ${fmtP(nums)}၊ ${fact(n)} ခုအနက် permutation ${out.length}။ out ထဲ copy ကူးသည်။`) }));
      calls.pop();
      return;
    }
    for (let i = k; i < n; i++) {
      calls.at(-1).i = i;
      [nums[k], nums[i]] = [nums[i], nums[k]];
      steps.push(snap({ line: 'swap', k, i, tag: t(i === k ? `keep ${nums[k]}` : `swap ${k}, ${i}`, i === k ? `${nums[k]} ထား` : `${k}, ${i} လဲ`),
        note: i === k
          ? t(`Position ${k}: first try the number already there, ${nums[k]} (a swap with itself). Positions ${k + 1} onward hold the numbers still free.`,
              `နေရာ ${k} — ရှိပြီးသား ${nums[k]} ကို အရင် စမ်းသည် (သူ့ကိုယ်သူ လဲခြင်း)။ နေရာ ${k + 1} မှစ၍ လွတ်သေးသော ဂဏန်းများ ရှိသည်။`)
          : t(`Position ${k}: swap in nums[${i}] = ${nums[k]}. nums = ${fmtP(nums)} — positions below ${k + 1} are fixed, the rest are still free.`,
              `နေရာ ${k} — nums[${i}] = ${nums[k]} ကို လဲထည့်သည်။ nums = ${fmtP(nums)} — ${k + 1} အောက် နေရာများ သတ်မှတ်ပြီး၊ ကျန်သည် လွတ်သေးသည်။`) }));
      build(k + 1);
      [nums[k], nums[i]] = [nums[i], nums[k]];
      steps.push(snap({ line: 'undo', k, i, tag: t('swap back', 'ပြန်လဲ'),
        note: t(`Swap back: nums = ${fmtP(nums)}, exactly as it was before position ${k} tried this number — so the next swap starts from a known order.`,
                `ပြန်လဲသည် — nums = ${fmtP(nums)}၊ နေရာ ${k} က ဤဂဏန်းကို မစမ်းမီ အတိုင်း အတိအကျ — ထို့ကြောင့် နောက်လဲခြင်းသည် သိပြီးသား အစီအစဉ်မှ စသည်။`) }));
    }
    calls.pop();
  }

  build(0);
  steps.push(snap({ line: 'ret', finished: true, tag: t(`${out.length} found`, `${out.length} ခု တွေ့`),
    note: t(`Every number swapped into every position: ${out.length} permutations, and nums is back to ${fmtP(nums)}.`,
            `ဂဏန်းတိုင်းကို နေရာတိုင်းသို့ လဲပြီး — permutation ${out.length} ခု၊ nums သည် ${fmtP(nums)} သို့ ပြန်ရောက်သည်။`) }));
  return steps;
}

/* ---------------- drawing ----------------
 *
 * The strip card is nums, as the code holds it. The stage is what the
 * recursion carries: `path` and the call stack (one frame per position being
 * filled, with the index it is trying), for the swap version the stack alone,
 * since the path is nums' own prefix. */

function strip(s, { nums }) {
  if (s.view === 'used') {
    return cells(nums, {
      tone: Object.fromEntries(nums.map((_, i) => [i, i === s.i ? (s.line === 'skip' ? 'leaving' : 'inwin') : s.used[i] ? 'done' : null]).filter(([, x]) => x)),
      marks: s.i == null ? {} : { [s.i]: 'i' },
    });
  }
  const top = s.calls.at(-1);
  const kNow = s.k ?? top?.k ?? 0;
  const marks = {};
  if (s.i != null) { marks[s.i] = 'i'; if (s.k !== s.i) marks[s.k] = 'k'; else marks[s.k] = 'k, i'; }
  return cells(s.nums, {
    tone: Object.fromEntries(s.nums.map((_, x) => [x, s.finished ? null : x === s.k || x === s.i ? 'inwin' : x < kNow ? 'entering' : null]).filter(([, v]) => v)),
    marks,
  });
}

function draw(s, { nums }) {
  const n = nums.length;
  if (s.view === 'used') {
    const frames = s.calls.map((f, d) => `build() · depth ${d}${f.i == null ? '' : ` · i = ${f.i}`}`);
    return stagePanel(pick(t('path', 'path')), pick(t(`${s.path.length} of ${n} placed`, `${n} ခုအနက် ${s.path.length} ခု ထားပြီး`)),
      stageRow(cells(s.path, { tone: s.line === 'choose' ? { [s.path.length - 1]: 'entering' } : {} }), pick(t('empty', 'ဗလာ'))))
      + stageGap + stagePanel(pick(t('The call stack', 'Call stack')), pick(t(`${s.calls.length} deep`, `${s.calls.length} ဆင့်`)), stack(frames))
      + stageGap + readout({ out: `${s.out.length} / ${fact(n)}` });
  }
  const frames = s.calls.map((f) => `build(${f.k})${f.i == null ? '' : ` · i = ${f.i}`}`);
  return stagePanel(pick(t('The call stack', 'Call stack')), pick(t(`${s.calls.length} deep`, `${s.calls.length} ဆင့်`)), stack(frames))
    + stageGap + readout({ out: `${s.out.length} / ${fact(n)}` });
}

function answer(s, { nums }) {
  return {
    html: slots(s.out.map((p) => p.join(',')), { total: fact(nums.length), just: s.just }),
    note: s.finished ? t('every permutation', 'permutation အားလုံး') : t('out, as it fills', 'out — ဖြည့်နေဆဲ'),
  };
}

function vars(s, { nums }) {
  const out = [['out', `${s.out.length} lists`]];
  if (s.view === 'used') {
    out.push(['nums', `[${listText(nums)}]`], ['used', `[${s.used.join(', ')}]`], ['path', fmtP(s.path)]);
    if (s.i != null) out.push(['i', s.i]);
  } else {
    out.push(['nums', `[${listText(s.nums)}]`]);
    const top = s.calls.at(-1);
    if (top) out.push(['k', top.k]);
    if (top && top.i != null) out.push(['i', top.i]);
  }
  return out;
}

/* ---------------- the code, one key per line ----------------
 *
 * Generated from the verified solution files, so the listing a reader copies
 * is byte-identical to the one that ran. */

const CODE = {
  used: {
    ruby: [
      [null, `${k('def')} permute(nums)`],
      [null, `  out = []`],
      [null, `  build(nums, Array.new(nums.length, false), [], out)`],
      ['ret', `  out`],
      [null, `${k('end')}`],
      [null, ``],
      [null, `${k('def')} build(nums, used, path, out)`],
      ['full', `  ${k('if')} path.length == nums.length`],
      ['full', `    out &lt;&lt; path.dup`],
      [null, `    ${k('return')}`],
      [null, `  ${k('end')}`],
      [null, `  nums.each_index ${k('do')} |i|`],
      ['skip', `    next ${k('if')} used[i]`],
      ['choose', `    used[i] = true`],
      ['choose', `    path &lt;&lt; nums[i]`],
      [null, `    build(nums, used, path, out)`],
      ['undo', `    path.pop`],
      ['undo', `    used[i] = false`],
      [null, `  ${k('end')}`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} permute(self, nums):`],
      [null, `        out, path = [], []`],
      [null, `        used = [False] * len(nums)`],
      [null, ``],
      [null, `        ${k('def')} build():`],
      ['full', `            ${k('if')} len(path) == len(nums):`],
      ['full', `                out.append(path[:])`],
      [null, `                ${k('return')}`],
      [null, `            ${k('for')} i ${k('in')} range(len(nums)):`],
      ['skip', `                ${k('if')} used[i]:`],
      [null, `                    continue`],
      ['choose', `                used[i] = True`],
      ['choose', `                path.append(nums[i])`],
      [null, `                build()`],
      ['undo', `                path.pop()`],
      ['undo', `                used[i] = False`],
      [null, ``],
      [null, `        build()`],
      ['ret', `        ${k('return')} out`],
    ],
    javascript: [
      [null, `${k('const')} permute = ${k('function')} (nums) {`],
      [null, `  ${k('const')} out = [], path = [];`],
      [null, `  ${k('const')} used = ${k('new')} Array(nums.length).fill(false);`],
      [null, `  ${k('const')} build = () =&gt; {`],
      ['full', `    ${k('if')} (path.length === nums.length) {`],
      ['full', `      out.push([...path]);`],
      [null, `      ${k('return')};`],
      [null, `    }`],
      [null, `    ${k('for')} (${k('let')} i = 0; i &lt; nums.length; i++) {`],
      ['skip', `      ${k('if')} (used[i]) continue;`],
      ['choose', `      used[i] = true;`],
      ['choose', `      path.push(nums[i]);`],
      [null, `      build();`],
      ['undo', `      path.pop();`],
      ['undo', `      used[i] = false;`],
      [null, `    }`],
      [null, `  };`],
      [null, `  build();`],
      ['ret', `  ${k('return')} out;`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} permute(nums []int) [][]int {`],
      [null, `    out := [][]int{}`],
      [null, `    path := []int{}`],
      [null, `    used := make([]bool, len(nums))`],
      [null, `    ${k('var')} build ${k('func')}()`],
      [null, `    build = ${k('func')}() {`],
      ['full', `        ${k('if')} len(path) == len(nums) {`],
      ['full', `            out = append(out, append([]int(${k('nil')}), path...))`],
      [null, `            ${k('return')}`],
      [null, `        }`],
      [null, `        ${k('for')} i := ${k('range')} nums {`],
      ['skip', `            ${k('if')} used[i] {`],
      [null, `                continue`],
      [null, `            }`],
      ['choose', `            used[i] = true`],
      ['choose', `            path = append(path, nums[i])`],
      [null, `            build()`],
      ['undo', `            path = path[:len(path)-1]`],
      ['undo', `            used[i] = false`],
      [null, `        }`],
      [null, `    }`],
      [null, `    build()`],
      ['ret', `    ${k('return')} out`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} permute(nums: Vec&lt;i32&gt;) -&gt; Vec&lt;Vec&lt;i32&gt;&gt; {`],
      [null, `        ${k('fn')} build(nums: &amp;[i32], used: &amp;${k('mut')} Vec&lt;bool&gt;, path: &amp;${k('mut')} Vec&lt;i32&gt;, out: &amp;${k('mut')} Vec&lt;Vec&lt;i32&gt;&gt;) {`],
      ['full', `            ${k('if')} path.len() == nums.len() {`],
      ['full', `                out.push(path.clone());`],
      [null, `                ${k('return')};`],
      [null, `            }`],
      [null, `            ${k('for')} i ${k('in')} 0..nums.len() {`],
      ['skip', `                ${k('if')} used[i] {`],
      [null, `                    continue;`],
      [null, `                }`],
      ['choose', `                used[i] = true;`],
      ['choose', `                path.push(nums[i]);`],
      [null, `                build(nums, used, path, out);`],
      ['undo', `                path.pop();`],
      ['undo', `                used[i] = false;`],
      [null, `            }`],
      [null, `        }`],
      [null, `        ${k('let')} ${k('mut')} out = Vec::new();`],
      [null, `        build(&amp;nums, &amp;${k('mut')} vec![false; nums.len()], &amp;${k('mut')} Vec::new(), &amp;${k('mut')} out);`],
      ['ret', `        out`],
      [null, `    }`],
      [null, `}`],
    ],
  },
  swap: {
    ruby: [
      [null, `${k('def')} permute(nums)`],
      [null, `  out = []`],
      [null, `  build(nums, 0, out)`],
      ['ret', `  out`],
      [null, `${k('end')}`],
      [null, ``],
      [null, `${k('def')} build(nums, k, out)`],
      ['full', `  ${k('if')} k == nums.length`],
      ['full', `    out &lt;&lt; nums.dup`],
      [null, `    ${k('return')}`],
      [null, `  ${k('end')}`],
      [null, `  (k...nums.length).each ${k('do')} |i|`],
      ['swap', `    nums[k], nums[i] = nums[i], nums[k]`],
      [null, `    build(nums, k + 1, out)`],
      ['undo', `    nums[k], nums[i] = nums[i], nums[k]`],
      [null, `  ${k('end')}`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} permute(self, nums):`],
      [null, `        out = []`],
      [null, ``],
      [null, `        ${k('def')} build(k):`],
      ['full', `            ${k('if')} k == len(nums):`],
      ['full', `                out.append(nums[:])`],
      [null, `                ${k('return')}`],
      [null, `            ${k('for')} i ${k('in')} range(k, len(nums)):`],
      ['swap', `                nums[k], nums[i] = nums[i], nums[k]`],
      [null, `                build(k + 1)`],
      ['undo', `                nums[k], nums[i] = nums[i], nums[k]`],
      [null, ``],
      [null, `        build(0)`],
      ['ret', `        ${k('return')} out`],
    ],
    javascript: [
      [null, `${k('const')} permute = ${k('function')} (nums) {`],
      [null, `  ${k('const')} out = [];`],
      [null, `  ${k('const')} build = (k) =&gt; {`],
      ['full', `    ${k('if')} (k === nums.length) {`],
      ['full', `      out.push([...nums]);`],
      [null, `      ${k('return')};`],
      [null, `    }`],
      [null, `    ${k('for')} (${k('let')} i = k; i &lt; nums.length; i++) {`],
      ['swap', `      [nums[k], nums[i]] = [nums[i], nums[k]];`],
      [null, `      build(k + 1);`],
      ['undo', `      [nums[k], nums[i]] = [nums[i], nums[k]];`],
      [null, `    }`],
      [null, `  };`],
      [null, `  build(0);`],
      ['ret', `  ${k('return')} out;`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} permute(nums []int) [][]int {`],
      [null, `    out := [][]int{}`],
      [null, `    ${k('var')} build ${k('func')}(k int)`],
      [null, `    build = ${k('func')}(k int) {`],
      ['full', `        ${k('if')} k == len(nums) {`],
      ['full', `            out = append(out, append([]int(${k('nil')}), nums...))`],
      [null, `            ${k('return')}`],
      [null, `        }`],
      [null, `        ${k('for')} i := k; i &lt; len(nums); i++ {`],
      ['swap', `            nums[k], nums[i] = nums[i], nums[k]`],
      [null, `            build(k + 1)`],
      ['undo', `            nums[k], nums[i] = nums[i], nums[k]`],
      [null, `        }`],
      [null, `    }`],
      [null, `    build(0)`],
      ['ret', `    ${k('return')} out`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} permute(${k('mut')} nums: Vec&lt;i32&gt;) -&gt; Vec&lt;Vec&lt;i32&gt;&gt; {`],
      [null, `        ${k('fn')} build(k: usize, nums: &amp;${k('mut')} Vec&lt;i32&gt;, out: &amp;${k('mut')} Vec&lt;Vec&lt;i32&gt;&gt;) {`],
      ['full', `            ${k('if')} k == nums.len() {`],
      ['full', `                out.push(nums.clone());`],
      [null, `                ${k('return')};`],
      [null, `            }`],
      [null, `            ${k('for')} i ${k('in')} k..nums.len() {`],
      ['swap', `                nums.swap(k, i);`],
      [null, `                build(k + 1, nums, out);`],
      ['undo', `                nums.swap(k, i);`],
      [null, `            }`],
      [null, `        }`],
      [null, `        ${k('let')} ${k('mut')} out = Vec::new();`],
      [null, `        build(0, &amp;${k('mut')} nums, &amp;${k('mut')} out);`],
      ['ret', `        out`],
      [null, `    }`],
      [null, `}`],
    ],
  },
};

/* ---------------- part 1: the "build one yourself" widget ----------------
 *
 * The count is the idea: n choices for the first place, n − 1 for the next,
 * down to 1, so n! in all. Click numbers to fill the positions — each click
 * leaves one fewer to pick from — and click a placed number to take it and
 * everything after it back, which is exactly what the backtracking does. */

const QW_SETS = [
  { label: exampleTitle(1), nums: [1, 2, 3] },
  { label: t('four numbers', 'ဂဏန်း လေးခု'), nums: [5, 6, 7, 8] },
  { label: t('six numbers', 'ဂဏန်း ခြောက်ခု'), nums: [1, 2, 3, 4, 5, 6] },
];

/* Where a permutation of positions comes in the order build() finds them. */
function rankOf(idx) {
  const left = idx.map((_, j) => j);
  let r = 0;
  for (let p = 0; p < idx.length; p++) {
    const at = left.indexOf(idx[p]);
    r += at * fact(left.length - 1);
    left.splice(at, 1);
  }
  return r;
}

function mountBuildWidget(host) {
  const state = { set: 0, picked: [] };
  host.innerHTML = `
    <div class="q-arr" data-nums></div>
    <div class="q-arr" data-path></div>
    <div class="q-slider"><span class="q-presets" data-presets></span></div>
    <p class="q-tie" data-line></p>
    <div class="ledger">
      <span class="expr" data-expr></span>
      <span class="total" data-total></span>
    </div>`;
  const q = (sel) => host.querySelector(sel);

  function render() {
    const { nums } = QW_SETS[state.set];
    const n = nums.length, placed = state.picked.length;
    q('[data-presets]').innerHTML = presetChips(QW_SETS, state.set);
    q('[data-nums]').innerHTML = `<span class="q-row-label">nums</span>${nums.map((v, i) => {
      const used = state.picked.includes(i);
      return used
        ? `<div class="cell cut"><span>${v}</span><span class="idx">${i}</span></div>`
        : `<div class="cell kept" role="button" tabindex="0" data-pick="${i}" aria-label="place ${v}"><span>${v}</span><span class="idx">${i}</span></div>`;
    }).join('')}`;
    q('[data-path]').innerHTML = `<span class="q-row-label">path</span>${placed
      ? state.picked.map((i, p) => `<div class="cell kept picked" role="button" tabindex="0" data-back="${p}" aria-label="take back ${nums[i]} and everything after it"><span>${nums[i]}</span><span class="idx">${p + 1}</span></div>`).join('')
      : `<span class="q-empty">${pick(t('empty', 'ဗလာ'))}</span>`}`;
    widgetLabel(pick(placed === n ? t('click a placed number to take it back', 'ထားပြီး ဂဏန်းကို နှိပ်၍ ပြန်ယူပါ') : t('click the numbers in any order', 'ဂဏန်းများကို မည်သည့်အစီအစဉ်ဖြင့်မဆို နှိပ်ပါ')));
    const factors = Array.from({ length: n }, (_, p) => (p === placed ? `<b>${n - p}</b>` : `${n - p}`));
    q('[data-expr]').innerHTML = `${factors.join(' × ')} = ${n}!`;
    q('[data-total]').innerHTML = `${fact(n)}<small>${pick(t('permutations', 'permutation'))}</small>`;
    q('[data-line]').innerHTML = pick(placed === n
      ? t(`${fmtP(state.picked.map((i) => nums[i]))} is permutation ${rankOf(state.picked) + 1} of ${fact(n)} in the order the backtracking finds them. Click a placed number to take it — and everything after it — back, as the backtracking does.`,
          `${fmtP(state.picked.map((i) => nums[i]))} သည် backtracking တွေ့သည့် အစီအစဉ်အရ ${fact(n)} ခုအနက် permutation ${rankOf(state.picked) + 1}။ ထားပြီးသော ဂဏန်းကို နှိပ်၍ ၎င်းနှင့် နောက်ရှိ အားလုံးကို backtracking ကဲ့သို့ ပြန်ယူပါ။`)
      : t(`Position ${placed + 1} of ${n}: ${n - placed} ${n - placed === 1 ? 'number is' : 'numbers are'} still free to go here. Every position has one fewer choice than the one before it.`,
          `နေရာ ${n} ခုအနက် ${placed + 1} — ဤနေရာသို့ ဂဏန်း ${n - placed} ခု လွတ်သေးသည်။ နေရာတိုင်းတွင် ရှေ့နေရာထက် ရွေးချယ်စရာ တစ်ခု လျော့သည်။`));
  }
  function act(el) {
    if (el.dataset.pick != null) state.picked.push(Number(el.dataset.pick));
    else if (el.dataset.back != null) state.picked = state.picked.slice(0, Number(el.dataset.back));
    render();
    (host.querySelector('[data-pick]') || host.querySelector('[data-back]'))?.focus();
  }
  host.addEventListener('click', (ev) => {
    const chip = ev.target.closest('[data-set]');
    if (chip) { state.set = Number(chip.dataset.set); state.picked = []; return render(); }
    const cell = ev.target.closest('[data-pick], [data-back]');
    if (cell) act(cell);
  });
  host.addEventListener('keydown', (ev) => {
    const cell = ev.target.closest('[data-pick], [data-back]');
    if (cell && (ev.key === 'Enter' || ev.key === ' ')) { ev.preventDefault(); act(cell); }
  });
  onLangChange(render);
  render();
}

/* ---------------- the approach, in brief ---------------- */

const APPROACH = {
  used: {
    idea: t('Fill the answer one position at a time. At each position try every number not placed yet, fill the rest recursively, then take the number back so the next one can try that position.',
            'အဖြေကို နေရာ တစ်ခုချင်း ဖြည့်သည်။ နေရာတိုင်းတွင် မထားရသေးသော ဂဏန်းတိုင်းကို စမ်း၊ ကျန်သည်ကို recursive ဖြည့်၊ ပြီးမှ နောက်ဂဏန်း ထိုနေရာကို စမ်းနိုင်ရန် ဂဏန်းကို ပြန်ယူသည်။'),
    steps: [
      t('<code>path</code> full: append a <em>copy</em> to <code>out</code> and return.', '<code>path</code> ပြည့်လျှင် — <code>out</code> ထဲ <em>copy</em> တစ်ခု ထည့်ပြီး return။'),
      t('Otherwise, for each <code>i</code> with <code>used[i]</code> false: set it, push <code>nums[i]</code>, call <code>build()</code>.',
        'မဟုတ်လျှင် <code>used[i]</code> false ဖြစ်သော <code>i</code> တစ်ခုစီအတွက် — သတ်မှတ်၊ <code>nums[i]</code> ကို push၊ <code>build()</code> ခေါ်သည်။'),
      t('After it returns, pop and clear <code>used[i]</code> — the backtrack.', 'ပြန်လာပြီးနောက် pop လုပ်ပြီး <code>used[i]</code> ကို ရှင်းသည် — backtrack။'),
    ],
    cost: t('n! permutations, each copied in O(n): O(n · n!). At n = 6 that is 720 lists from 1,957 calls (computed).',
            'permutation n! ခု၊ တစ်ခုစီကို O(n) ဖြင့် copy ကူး — O(n · n!)။ n = 6 တွင် call 1,957 မှ list 720 (တွက်ထားသည်)။'),
  },
  swap: {
    idea: t('Keep the numbers still free in the tail of nums itself. Position k tries each of nums[k..] by swapping it into place, recurses on k + 1, and swaps it back.',
            'လွတ်သေးသော ဂဏန်းများကို nums ကိုယ်တိုင်၏ အမြီးတွင် ထားသည်။ နေရာ k သည် nums[k..] တစ်ခုစီကို နေရာသို့ လဲထည့်၍ စမ်း၊ k + 1 ပေါ် recurse ပြီး ပြန်လဲသည်။'),
    steps: [
      t('<code>k == len(nums)</code>: append a copy of <code>nums</code>.', '<code>k == len(nums)</code> — <code>nums</code> ၏ copy ကို ထည့်သည်။'),
      t('For each <code>i</code> from <code>k</code>: swap <code>nums[k]</code> and <code>nums[i]</code>, call <code>build(k + 1)</code>.', '<code>k</code> မှ <code>i</code> တစ်ခုစီအတွက် — <code>nums[k]</code> နှင့် <code>nums[i]</code> ကို လဲ၊ <code>build(k + 1)</code> ခေါ်သည်။'),
      t('Swap them back before the next <code>i</code>.', 'နောက် <code>i</code> မတိုင်မီ ပြန်လဲသည်။'),
    ],
    cost: t('The same O(n · n!), with no <code>used</code> array and no <code>path</code>: the prefix of nums is the path.',
            'O(n · n!) အတူတူ၊ <code>used</code> array နှင့် <code>path</code> မလို — nums ၏ ရှေ့ပိုင်းသည်ပင် path။'),
  },
};

/* ---------------- mount ---------------- */

mountLesson({
  input: { nums: [1, 2, 3] },
  controls: [
    { key: 'nums', label: 'nums', parse: intList({ max: MAX_N, lo: -10, hi: 10, distinct: true, why: `${fact(MAX_N)} permutations is plenty to watch` }) },
  ],
  presets: [
    { label: exampleTitle(1), input: { nums: [1, 2, 3] } },
    { label: exampleTitle(2), input: { nums: [0, 1] } },
    { label: exampleTitle(3), input: { nums: [1] } },
    { label: t('four numbers', 'ဂဏန်း လေးခု'), input: { nums: [4, 3, 2, 1] } },
  ],
  examples: [
    { title: exampleTitle(1), inputHtml: '<code>nums = [1,2,3]</code>', output: '[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]',
      why: [t('3 choices for the first place, 2 for the second, 1 for the last: 6 lists.', 'ပထမနေရာအတွက် ရွေးချယ်စရာ 3၊ ဒုတိယ 2၊ နောက်ဆုံး 1 — list 6 ခု။')],
      load: { nums: [1, 2, 3] } },
    { title: exampleTitle(2), inputHtml: '<code>nums = [0,1]</code>', output: '[[0,1],[1,0]]',
      why: [t('Two numbers, two orders.', 'ဂဏန်း နှစ်ခု၊ အစီအစဉ် နှစ်မျိုး။')], load: { nums: [0, 1] } },
    { title: exampleTitle(3), inputHtml: '<code>nums = [1]</code>', output: '[[1]]',
      why: [t('One number has one order — a list holding one list.', 'ဂဏန်း တစ်ခုတွင် အစီအစဉ် တစ်မျိုးသာ — list တစ်ခုပါသော list။')], load: { nums: [1] } },
  ],
  modes: [
    { id: 'used', name: 'Path + used',
      sub: t('backtracking', 'backtracking'),
      desc: t('Grow a path; a flag per number says whether it is placed.', 'path ကို ကြီးစေ — ဂဏန်းတစ်ခုလျှင် flag တစ်ခုက ထားပြီးမထားပြီး ပြောသည်။'),
      cost: 'O(n · n!) time · O(n) extra', build: buildUsed },
    { id: 'swap', name: 'Swap in place',
      sub: t('backtracking', 'backtracking'),
      desc: t('Swap each free number into position k, recurse, swap back.', 'လွတ်သော ဂဏန်းတစ်ခုစီကို နေရာ k သို့ လဲ၊ recurse၊ ပြန်လဲ။'),
      cost: 'O(n · n!) time · O(n) stack', build: buildSwap },
  ],
  languages: LANGUAGES,
  code: CODE,
  solutions: {
    used: { approach: APPROACH.used,
      desc: t('The pattern to learn: choose, recurse, un-choose. It carries over unchanged to combinations, subsets and N-Queens — only the rule for what may be chosen differs.',
              'သင်ယူရမည့် ပုံစံ — ရွေး၊ recurse၊ ရွေးခြင်းကို ပြန်ဖျက်။ combination၊ subset နှင့် N-Queens သို့ မပြောင်းဘဲ သယ်သွားနိုင်သည် — ရွေးနိုင်သည့် စည်းမျဉ်းသာ ကွဲသည်။') },
    swap: { approach: APPROACH.swap,
      desc: t('The same search with less bookkeeping: the order of nums is the state. It lists the permutations in a different order — which LeetCode accepts.',
              'bookkeeping နည်းသော ရှာဖွေမှု အတူတူ — nums ၏ အစီအစဉ်သည်ပင် state။ permutation များကို အစီအစဉ် ကွဲပြားစွာ ထုတ်သည် — LeetCode လက်ခံသည်။') },
  },
  // How each language was actually checked, printed as the part 3 badges.
  // The corpus: the 3 examples, 2 edges, and 20,000 random lists of distinct
  // values from -10..10, weighted toward length 6 — against
  // itertools.permutations. Each driver sorts the answer and prints its
  // length first, since any order is accepted. Go and Rust ran in Docker
  // (golang:1.23-alpine, rust:1-slim).
  verification: {
    ruby: 'ran here · 20,005 cases',
    python: 'ran here · 20,005 cases',
    javascript: 'ran here · 20,005 cases',
    go: 'ran here · 20,005 cases · Go 1.23',
    rust: 'ran here · 20,005 cases · rustc 1.98',
  },
  stripLabel: t('nums, as the code holds it', 'nums — code ကိုင်ထားသည့်အတိုင်း'),
  strip,
  draw,
  answer,
  vars,
  widget: mountBuildWidget,
});
