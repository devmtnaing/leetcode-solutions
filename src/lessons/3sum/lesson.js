/* 3Sum — LeetCode 15.
 *
 * Two things make this harder than Two Sum: there are three numbers, and the
 * answer is a set of value triplets, not index triples, so the same triplet
 * found twice must be reported once. Sorting settles both. Every triple of a
 * sorted array comes out in order, so the brute force can dedupe with a set;
 * and once the array is sorted, fixing the first number turns the rest into
 * a two-pointer squeeze, where equal neighbours can simply be stepped over.
 */
import { mountLesson } from '../../lib/stepper.js';
import { pick, onLangChange } from '../../lib/i18n.js';
import { cells, kv, readout, slots, stagePanel } from '../../lib/stage.js';
import { t, exampleTitle, LANGUAGES, k, c, stageGap, intList, presetChips, widgetLabel } from '../../lib/kit.js';

const MAX_LEN = 10;

const fmt = (tr) => `[${tr.join(',')}]`;

/* ---------------- step generators ---------------- */

function buildBrute({ nums: original }) {
  const nums = [...original].sort((a, b) => a - b);
  const n = nums.length;
  const steps = [];
  const found = {};          // "[a,b,c]" -> "i,j,k" where it was first found
  const order = [];          // triplets in the order found
  const snap = (extra) => ({ view: 'brute', arr: nums, found: { ...found }, result: order.map((x) => [...x]), i: null, j: null, k: null, ...extra });

  steps.push(snap({ line: 'sort', tag: t('sort', 'sort'),
    note: t(`Sort first: [${original.join(', ')}] becomes <b>[${nums.join(', ')}]</b>. Then every triple i &lt; j &lt; k reads in order, so a triplet found twice looks the same both times.`,
            `အရင် sort လုပ်သည် — [${original.join(', ')}] သည် <b>[${nums.join(', ')}]</b> ဖြစ်လာသည်။ ထို့နောက် i &lt; j &lt; k triple တိုင်းသည် အစဉ်လိုက် ဖြစ်သဖြင့် နှစ်ကြိမ်တွေ့သော triplet သည် နှစ်ကြိမ်စလုံး ပုံစံတူ ဖြစ်သည်။`) }));
  steps.push(snap({ line: 'init', tag: t('empty set', 'set ဗလာ'),
    note: t(`An empty set, <code>found</code>. There are ${n * (n - 1) * (n - 2) / 6} triples to try.`,
            `set ဗလာ <code>found</code>။ စမ်းရမည့် triple ${n * (n - 1) * (n - 2) / 6} ခု ရှိသည်။`) }));

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      for (let kk = j + 1; kk < n; kk++) {
        const sum = nums[i] + nums[j] + nums[kk];
        if (sum !== 0) {
          steps.push(snap({ i, j, k: kk, sum, miss: true, line: 'test', tag: t(`sum ${sum}`, `sum ${sum}`),
            note: t(`${nums[i]} + ${nums[j]} + ${nums[kk]} = ${sum}, not 0.`,
                    `${nums[i]} + ${nums[j]} + ${nums[kk]} = ${sum} — 0 မဟုတ်ပါ။`) }));
          continue;
        }
        const tr = [nums[i], nums[j], nums[kk]];
        const key = fmt(tr);
        steps.push(snap({ i, j, k: kk, sum, line: 'test', tag: t('sum 0', 'sum 0'),
          note: t(`${nums[i]} + ${nums[j]} + ${nums[kk]} = <b>0</b>.`, `${nums[i]} + ${nums[j]} + ${nums[kk]} = <b>0</b>။`) }));
        if (found[key]) {
          steps.push(snap({ i, j, k: kk, sum, dup: key, line: 'add', tag: t('already in', 'ရှိပြီးသား'),
            note: t(`But <b>${key}</b> is already in the set, found at indices ${found[key]}. Different positions, same values — the set keeps one.`,
                    `သို့သော် <b>${key}</b> သည် set ထဲ ရှိပြီးသား — index ${found[key]} တွင် တွေ့ခဲ့သည်။ နေရာမတူ၊ value တူ — set က တစ်ခုသာ ထားသည်။`) }));
        } else {
          found[key] = `${i},${j},${kk}`;
          order.push(tr);
          steps.push(snap({ i, j, k: kk, sum, added: key, line: 'add', tag: t('new', 'အသစ်'),
            note: t(`<b>${key}</b> is new: add it. ${order.length} so far.`,
                    `<b>${key}</b> သည် အသစ် — ထည့်သည်။ ယခုထိ ${order.length} ခု။`) }));
        }
      }
    }
  }
  steps.push(snap({ line: 'ret', finished: true, tag: t('return', 'return'),
    note: t(order.length
      ? `Every triple tried. Return the ${order.length} distinct ${order.length === 1 ? 'triplet' : 'triplets'} in the set.`
      : 'Every triple tried and none summed to 0. Return an empty list.',
      order.length
      ? `triple အားလုံး စမ်းပြီး။ set ထဲရှိ ကွဲပြားသော triplet ${order.length} ခုကို ပြန်ပေးသည်။`
      : 'triple အားလုံး စမ်းပြီး၊ 0 ရသည့် တစ်ခုမျှ မရှိ။ list ဗလာကို ပြန်ပေးသည်။') }));
  return steps;
}

function buildPointers({ nums: original }) {
  const nums = [...original].sort((a, b) => a - b);
  const n = nums.length;
  const steps = [];
  const result = [];
  const snap = (extra) => ({ view: 'pointers', arr: nums, result: result.map((x) => [...x]), i: null, lo: null, hi: null, ...extra });

  steps.push(snap({ line: 'sort', tag: t('sort', 'sort'),
    note: t(`Sort first: [${original.join(', ')}] becomes <b>[${nums.join(', ')}]</b>. In a sorted array, moving a pointer changes the sum in a known direction.`,
            `အရင် sort လုပ်သည် — [${original.join(', ')}] သည် <b>[${nums.join(', ')}]</b> ဖြစ်လာသည်။ sort ထားသော array တွင် pointer ရွှေ့လျှင် sum ပြောင်းမည့် ဦးတည်ချက်ကို သိသည်။`) }));
  steps.push(snap({ line: 'init', tag: t('empty', 'ဗလာ'),
    note: t('An empty <code>result</code>. Each index in turn will be the smallest number of a triplet.',
            '<code>result</code> ဗလာ။ index တစ်ခုစီသည် အလှည့်ကျ triplet ၏ အငယ်ဆုံး ကိန်း ဖြစ်မည်။') }));

  for (let i = 0; i < n - 2; i++) {
    steps.push(snap({ i, line: 'fix', tag: t(`i = ${i}`, `i = ${i}`),
      note: t(`Fix <b>nums[${i}] = ${nums[i]}</b>. The other two must sum to <b>${-nums[i]}</b>, and they are to its right.`,
              `<b>nums[${i}] = ${nums[i]}</b> ကို ချုပ်ကိုင်ထားသည်။ ကျန်နှစ်လုံး ပေါင်းလျှင် <b>${-nums[i]}</b> ရရမည်ဖြစ်ပြီး ၎င်းတို့သည် ညာဘက်တွင် ရှိသည်။`) }));
    if (i > 0 && nums[i] === nums[i - 1]) {
      steps.push(snap({ i, skippedI: true, line: 'dup', tag: t('same as before', 'အရင်နှင့်တူ'),
        note: t(`${nums[i]} again. Every triplet starting with ${nums[i]} was already found at index ${i - 1}, so skip it.`,
                `${nums[i]} ထပ်တွေ့သည်။ ${nums[i]} ဖြင့် စသော triplet အားလုံးကို index ${i - 1} တွင် တွေ့ခဲ့ပြီးဖြစ်သဖြင့် ကျော်သည်။`) }));
      continue;
    }
    let lo = i + 1;
    let hi = n - 1;
    steps.push(snap({ i, lo, hi, line: 'ptrs', tag: t('squeeze', 'ညှပ်'),
      note: t(`<code>lo</code> at the smallest of the rest, <code>hi</code> at the largest. Squeeze until they meet.`,
              `<code>lo</code> ကို ကျန်သည့်အထဲက အငယ်ဆုံးတွင်၊ <code>hi</code> ကို အကြီးဆုံးတွင် ထားသည်။ တွေ့ဆုံသည်အထိ ညှပ်သည်။`) }));
    while (lo < hi) {
      const sum = nums[i] + nums[lo] + nums[hi];
      steps.push(snap({ i, lo, hi, sum, line: 'sum', tag: t(`sum ${sum}`, `sum ${sum}`),
        note: t(`${nums[i]} + ${nums[lo]} + ${nums[hi]} = <b>${sum}</b>.`, `${nums[i]} + ${nums[lo]} + ${nums[hi]} = <b>${sum}</b>။`) }));
      if (sum < 0) {
        lo += 1;
        steps.push(snap({ i, lo, hi, sum, line: 'lo', tag: t('too small', 'ငယ်လွန်း'),
          note: t(`Too small, so move <code>lo</code> right. nums[${lo - 1}] is done: paired with nums[hi], the largest number still in range, it fell short, so it falls short with everything else too.`,
                  `ငယ်လွန်းသဖြင့် <code>lo</code> ကို ညာသို့ ရွှေ့သည်။ nums[${lo - 1}] ပြီးပြီ — ကျန်နေသည့်အထဲက အကြီးဆုံးဖြစ်သော nums[hi] နှင့် တွဲတောင် မလောက်ခဲ့သဖြင့် အခြားမည်သည့်ကိန်းနှင့်မျှ မလောက်ပါ။`) }));
      } else if (sum > 0) {
        hi -= 1;
        steps.push(snap({ i, lo, hi, sum, line: 'hi', tag: t('too big', 'ကြီးလွန်း'),
          note: t(`Too big, so move <code>hi</code> left. nums[${hi + 1}] is done: paired with nums[lo], the smallest number still in range, it overshot, so it overshoots with everything else too.`,
                  `ကြီးလွန်းသဖြင့် <code>hi</code> ကို ဘယ်သို့ ရွှေ့သည်။ nums[${hi + 1}] ပြီးပြီ — ကျန်နေသည့်အထဲက အငယ်ဆုံးဖြစ်သော nums[lo] နှင့် တွဲတောင် ကျော်သွားခဲ့သဖြင့် အခြားမည်သည့်ကိန်းနှင့်မဆို ကျော်မည်။`) }));
      } else {
        const tr = [nums[i], nums[lo], nums[hi]];
        result.push(tr);
        steps.push(snap({ i, lo, hi, sum, hit: true, line: 'add', tag: t('found', 'တွေ့ပြီ'),
          note: t(`Zero: record <b>${fmt(tr)}</b>.`, `သုည — <b>${fmt(tr)}</b> ကို မှတ်သည်။`) }));
        const from = lo;
        lo += 1;
        hi -= 1;
        while (lo < hi && nums[lo] === nums[lo - 1]) lo += 1;
        const skipped = lo - from - 1;
        steps.push(snap({ i, lo, hi, skipFrom: from + 1, skipTo: lo, line: 'skip', tag: t('step past', 'ကျော်'),
          note: skipped
            ? t(`Move both pointers in, and step <code>lo</code> past ${skipped} more ${nums[from]}${skipped === 1 ? '' : 's'}: with the same first two numbers, the third is forced, so they would only find ${fmt(tr)} again.`,
                `pointer နှစ်ခုလုံးကို အတွင်းသို့ ရွှေ့ပြီး <code>lo</code> ကို ${nums[from]} နောက်ထပ် ${skipped} ခု ကျော်စေသည် — ပထမ ကိန်းနှစ်လုံး တူလျှင် တတိယ ကိန်းသည် သတ်မှတ်ပြီးသား ဖြစ်သဖြင့် ${fmt(tr)} ကိုသာ ထပ်တွေ့မည်။`)
            : t('Move both pointers in. The next number at <code>lo</code> is different, so there is nothing to step past.',
                'pointer နှစ်ခုလုံးကို အတွင်းသို့ ရွှေ့သည်။ <code>lo</code> ရှိ နောက်ကိန်းသည် မတူသဖြင့် ကျော်စရာ မရှိပါ။') }));
      }
    }
  }
  steps.push(snap({ line: 'ret', finished: true, tag: t('return', 'return'),
    note: t(result.length
      ? `Return ${result.length === 1 ? 'the triplet' : `all ${result.length} triplets`}. No set was needed: skipping equal neighbours meant no triplet was found twice.`
      : 'No triplet sums to 0. Return an empty list.',
      result.length
      ? `triplet ${result.length} ခုကို ပြန်ပေးသည်။ set မလိုခဲ့ပါ — တူသော ကပ်လျက်ကိန်းများကို ကျော်ခဲ့သဖြင့် triplet တစ်ခုကိုမျှ နှစ်ကြိမ် မတွေ့ခဲ့ပါ။`
      : '0 ရသည့် triplet မရှိပါ။ list ဗလာကို ပြန်ပေးသည်။') }));
  return steps;
}

/* ---------------- drawing ----------------
 *
 * The strip shows the sorted array, which is what both approaches walk. The
 * stage holds what each carries: the set of distinct triplets (and where each
 * was first found), or the fixed number, the pair the pointers must make, and
 * the triplets so far. */

function strip(s) {
  const tone = {};
  const marks = {};
  const a = s.arr;
  if (s.view === 'brute') {
    for (const [x, name] of [[s.i, 'i'], [s.j, 'j'], [s.k, 'k']]) {
      if (x == null) continue;
      marks[x] = name;
      tone[x] = s.miss ? 'leaving' : s.dup ? 'inwin' : 'entering';
    }
    if (s.finished) a.forEach((_, x) => { tone[x] = 'done'; });
    return cells(a, { tone, marks });
  }
  if (s.i != null) {
    for (let x = 0; x < s.i; x++) tone[x] = 'done';
    if (s.lo != null) {
      for (let x = s.i + 1; x < a.length; x++) if (x < s.lo || x > s.hi) tone[x] = 'done';
      if (s.skipFrom != null) for (let x = s.skipFrom; x < s.skipTo; x++) tone[x] = 'leaving';
      if (s.lo < a.length) marks[s.lo] = s.lo === s.hi ? 'lo=hi' : 'lo';
      if (s.hi > s.lo) marks[s.hi] = 'hi';
      if (s.hit) { tone[s.lo] = 'entering'; tone[s.hi] = 'entering'; }
    }
    tone[s.i] = s.skippedI ? 'leaving' : s.hit ? 'entering' : 'inwin';
    marks[s.i] = 'i';
  }
  if (s.finished) a.forEach((_, x) => { tone[x] = 'done'; });
  return cells(a, { tone, marks });
}

function draw(s) {
  if (s.view === 'brute') {
    const tone = {};
    if (s.dup) tone[s.dup] = 'warn';
    if (s.added) tone[s.added] = 'up';
    const size = Object.keys(s.found).length;
    const triple = s.i == null ? '—' : `${s.arr[s.i]} + ${s.arr[s.j]} + ${s.arr[s.k]}`;
    return stagePanel(pick(t('found — distinct triplets', 'found — ကွဲပြားသော triplet များ')),
      pick(t(`${size} in the set`, `set ထဲ ${size} ခု`)),
      kv(s.found, { at: s.dup ?? s.added ?? null, tone, keyName: 'triplet', valName: 'first at i,j,k' })
        + stageGap + readout({ triple, sum: s.sum ?? '—' }));
  }
  const need = s.i == null ? '—' : -s.arr[s.i];
  const pair = s.lo == null || s.lo >= s.hi ? '—' : `${s.arr[s.lo]} + ${s.arr[s.hi]} = ${s.arr[s.lo] + s.arr[s.hi]}`;
  const got = Object.fromEntries(s.result.map((tr, x) => [fmt(tr), `#${x + 1}`]));
  return stagePanel(pick(t('The pair the pointers must make', 'pointer များ ဖွဲ့ရမည့် အတွဲ')),
    pick(s.i == null ? t('nothing fixed yet', 'ဘာမျှ မချုပ်ကိုင်ရသေး') : t(`nums[i] = ${s.arr[s.i]}`, `nums[i] = ${s.arr[s.i]}`)),
    readout({ 'need lo + hi': need, 'lo + hi': pair, sum: s.sum ?? '—' })
      + stageGap + kv(got, { at: s.hit ? fmt(s.result.at(-1)) : null, tone: s.hit ? { [fmt(s.result.at(-1))]: 'up' } : {}, keyName: 'result', valName: 'order' }));
}

function answer(s) {
  const list = s.result.map(fmt);
  const justNow = (s.view === 'brute' && s.added) || (s.view === 'pointers' && s.hit);
  return {
    html: list.length ? slots(list, { total: list.length, just: justNow ? list.length - 1 : -1 }) : '<span class="slot">[]</span>',
    note: s.finished
      ? t(list.length ? 'distinct triplets' : 'none sums to 0', list.length ? 'ကွဲပြားသော triplet များ' : '0 ရသည့် တစ်ခုမျှ မရှိ')
      : t('triplets so far', 'ယခုထိ triplet များ'),
  };
}

function vars(s) {
  const a = `[${s.arr.join(', ')}]`;
  if (s.view === 'brute') {
    return [['i', s.i ?? '—'], ['j', s.j ?? '—'], ['k', s.k ?? '—'], ['nums', a],
            ['found', `{${Object.keys(s.found).join(', ')}}`], ['n', s.arr.length]];
  }
  return [['i', s.i ?? '—'], ['lo', s.lo ?? '—'], ['hi', s.hi ?? '—'], ['sum', s.sum ?? '—'],
          ['nums', a], ['result', `[${s.result.map(fmt).join(', ')}]`], ['n', s.arr.length]];
}

/* ---------------- the code, one key per line ----------------
 *
 * Generated from the verified solution files, so the listing a reader copies
 * is byte-identical to the one that ran. */

const CODE = {
  brute: {
    ruby: [
      [null, `${k('def')} three_sum(nums)`],
      ['sort', `  nums = nums.sort`],
      [null, `  n = nums.length`],
      ['init', `  found = {}`],
      [null, `  (0...n).each ${k('do')} |i|`],
      [null, `    (i + 1...n).each ${k('do')} |j|`],
      [null, `      (j + 1...n).each ${k('do')} |k|`],
      ['test', `        next ${k('unless')} nums[i] + nums[j] + nums[k] == 0`],
      ['add', `        found[[nums[i], nums[j], nums[k]]] = true`],
      [null, `      ${k('end')}`],
      [null, `    ${k('end')}`],
      [null, `  ${k('end')}`],
      ['ret', `  found.keys`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} threeSum(self, nums):`],
      ['sort', `        nums = sorted(nums)`],
      [null, `        n = len(nums)`],
      ['init', `        found = set()`],
      [null, `        ${k('for')} i ${k('in')} range(n):`],
      [null, `            ${k('for')} j ${k('in')} range(i + 1, n):`],
      [null, `                ${k('for')} k ${k('in')} range(j + 1, n):`],
      ['test', `                    ${k('if')} nums[i] + nums[j] + nums[k] != 0:`],
      [null, `                        continue`],
      ['add', `                    found.add((nums[i], nums[j], nums[k]))`],
      ['ret', `        ${k('return')} [list(t) ${k('for')} t ${k('in')} found]`],
    ],
    javascript: [
      [null, `${k('const')} threeSum = ${k('function')} (nums) {`],
      ['sort', `  nums = [...nums].sort((a, b) =&gt; a - b);`],
      [null, `  ${k('const')} n = nums.length;`],
      ['init', `  ${k('const')} found = ${k('new')} Map();`],
      [null, `  ${k('for')} (${k('let')} i = 0; i &lt; n; i++) {`],
      [null, `    ${k('for')} (${k('let')} j = i + 1; j &lt; n; j++) {`],
      [null, `      ${k('for')} (${k('let')} k = j + 1; k &lt; n; k++) {`],
      ['test', `        ${k('if')} (nums[i] + nums[j] + nums[k] !== 0) continue;`],
      ['add', `        found.set(\`\${nums[i]},\${nums[j]},\${nums[k]}\`, [nums[i], nums[j], nums[k]]);`],
      [null, `      }`],
      [null, `    }`],
      [null, `  }`],
      ['ret', `  ${k('return')} [...found.values()];`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} threeSum(nums []int) [][]int {`],
      ['sort', `    sort.Ints(nums)`],
      [null, `    n := len(nums)`],
      ['init', `    found := map[[3]int]bool{}`],
      [null, `    ${k('for')} i := 0; i &lt; n; i++ {`],
      [null, `        ${k('for')} j := i + 1; j &lt; n; j++ {`],
      [null, `            ${k('for')} k := j + 1; k &lt; n; k++ {`],
      ['test', `                ${k('if')} nums[i]+nums[j]+nums[k] != 0 {`],
      [null, `                    continue`],
      [null, `                }`],
      ['add', `                found[[3]int{nums[i], nums[j], nums[k]}] = true`],
      [null, `            }`],
      [null, `        }`],
      [null, `    }`],
      [null, `    result := [][]int{}`],
      [null, `    ${k('for')} t := ${k('range')} found {`],
      [null, `        result = append(result, []int{t[0], t[1], t[2]})`],
      [null, `    }`],
      ['ret', `    ${k('return')} result`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('use')} std::collections::HashSet;`],
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} three_sum(${k('mut')} nums: Vec&lt;i32&gt;) -&gt; Vec&lt;Vec&lt;i32&gt;&gt; {`],
      ['sort', `        nums.sort();`],
      [null, `        ${k('let')} n = nums.len();`],
      ['init', `        ${k('let')} ${k('mut')} found = HashSet::new();`],
      [null, `        ${k('for')} i ${k('in')} 0..n {`],
      [null, `            ${k('for')} j ${k('in')} i + 1..n {`],
      [null, `                ${k('for')} k ${k('in')} j + 1..n {`],
      ['test', `                    ${k('if')} nums[i] + nums[j] + nums[k] != 0 {`],
      [null, `                        continue;`],
      [null, `                    }`],
      ['add', `                    found.insert(vec![nums[i], nums[j], nums[k]]);`],
      [null, `                }`],
      [null, `            }`],
      [null, `        }`],
      ['ret', `        found.into_iter().collect()`],
      [null, `    }`],
      [null, `}`],
    ],
  },
  pointers: {
    ruby: [
      [null, `${k('def')} three_sum(nums)`],
      ['sort', `  nums = nums.sort`],
      [null, `  n = nums.length`],
      ['init', `  result = []`],
      ['fix', `  (0...n - 2).each ${k('do')} |i|`],
      ['dup', `    next ${k('if')} i &gt; 0 &amp;&amp; nums[i] == nums[i - 1]`],
      ['ptrs', `    lo, hi = i + 1, n - 1`],
      [null, `    ${k('while')} lo &lt; hi`],
      ['sum', `      sum = nums[i] + nums[lo] + nums[hi]`],
      [null, `      ${k('if')} sum &lt; 0`],
      ['lo', `        lo += 1`],
      [null, `      elsif sum &gt; 0`],
      ['hi', `        hi -= 1`],
      [null, `      ${k('else')}`],
      ['add', `        result &lt;&lt; [nums[i], nums[lo], nums[hi]]`],
      [null, `        lo += 1`],
      [null, `        hi -= 1`],
      ['skip', `        lo += 1 ${k('while')} lo &lt; hi &amp;&amp; nums[lo] == nums[lo - 1]`],
      [null, `      ${k('end')}`],
      [null, `    ${k('end')}`],
      [null, `  ${k('end')}`],
      ['ret', `  result`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} threeSum(self, nums):`],
      ['sort', `        nums = sorted(nums)`],
      [null, `        n = len(nums)`],
      ['init', `        result = []`],
      ['fix', `        ${k('for')} i ${k('in')} range(n - 2):`],
      ['dup', `            ${k('if')} i &gt; 0 and nums[i] == nums[i - 1]:`],
      [null, `                continue`],
      ['ptrs', `            lo, hi = i + 1, n - 1`],
      [null, `            ${k('while')} lo &lt; hi:`],
      ['sum', `                total = nums[i] + nums[lo] + nums[hi]`],
      [null, `                ${k('if')} total &lt; 0:`],
      ['lo', `                    lo += 1`],
      [null, `                elif total &gt; 0:`],
      ['hi', `                    hi -= 1`],
      [null, `                ${k('else')}:`],
      ['add', `                    result.append([nums[i], nums[lo], nums[hi]])`],
      [null, `                    lo += 1`],
      [null, `                    hi -= 1`],
      ['skip', `                    ${k('while')} lo &lt; hi and nums[lo] == nums[lo - 1]:`],
      [null, `                        lo += 1`],
      ['ret', `        ${k('return')} result`],
    ],
    javascript: [
      [null, `${k('const')} threeSum = ${k('function')} (nums) {`],
      ['sort', `  nums = [...nums].sort((a, b) =&gt; a - b);`],
      [null, `  ${k('const')} n = nums.length;`],
      ['init', `  ${k('const')} result = [];`],
      ['fix', `  ${k('for')} (${k('let')} i = 0; i &lt; n - 2; i++) {`],
      ['dup', `    ${k('if')} (i &gt; 0 &amp;&amp; nums[i] === nums[i - 1]) continue;`],
      ['ptrs', `    ${k('let')} lo = i + 1, hi = n - 1;`],
      [null, `    ${k('while')} (lo &lt; hi) {`],
      ['sum', `      ${k('const')} sum = nums[i] + nums[lo] + nums[hi];`],
      [null, `      ${k('if')} (sum &lt; 0) {`],
      ['lo', `        lo++;`],
      [null, `      } ${k('else')} ${k('if')} (sum &gt; 0) {`],
      ['hi', `        hi--;`],
      [null, `      } ${k('else')} {`],
      ['add', `        result.push([nums[i], nums[lo], nums[hi]]);`],
      [null, `        lo++;`],
      [null, `        hi--;`],
      ['skip', `        ${k('while')} (lo &lt; hi &amp;&amp; nums[lo] === nums[lo - 1]) lo++;`],
      [null, `      }`],
      [null, `    }`],
      [null, `  }`],
      ['ret', `  ${k('return')} result;`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} threeSum(nums []int) [][]int {`],
      ['sort', `    sort.Ints(nums)`],
      [null, `    n := len(nums)`],
      ['init', `    result := [][]int{}`],
      ['fix', `    ${k('for')} i := 0; i &lt; n-2; i++ {`],
      ['dup', `        ${k('if')} i &gt; 0 &amp;&amp; nums[i] == nums[i-1] {`],
      [null, `            continue`],
      [null, `        }`],
      ['ptrs', `        lo, hi := i+1, n-1`],
      [null, `        ${k('for')} lo &lt; hi {`],
      ['sum', `            sum := nums[i] + nums[lo] + nums[hi]`],
      [null, `            ${k('if')} sum &lt; 0 {`],
      ['lo', `                lo++`],
      [null, `            } ${k('else')} ${k('if')} sum &gt; 0 {`],
      ['hi', `                hi--`],
      [null, `            } ${k('else')} {`],
      ['add', `                result = append(result, []int{nums[i], nums[lo], nums[hi]})`],
      [null, `                lo++`],
      [null, `                hi--`],
      ['skip', `                ${k('for')} lo &lt; hi &amp;&amp; nums[lo] == nums[lo-1] {`],
      [null, `                    lo++`],
      [null, `                }`],
      [null, `            }`],
      [null, `        }`],
      [null, `    }`],
      ['ret', `    ${k('return')} result`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} three_sum(${k('mut')} nums: Vec&lt;i32&gt;) -&gt; Vec&lt;Vec&lt;i32&gt;&gt; {`],
      ['sort', `        nums.sort();`],
      [null, `        ${k('let')} n = nums.len();`],
      ['init', `        ${k('let')} ${k('mut')} result = Vec::new();`],
      ['fix', `        ${k('for')} i ${k('in')} 0..n - 2 {`],
      ['dup', `            ${k('if')} i &gt; 0 &amp;&amp; nums[i] == nums[i - 1] {`],
      [null, `                continue;`],
      [null, `            }`],
      ['ptrs', `            ${k('let')} (${k('mut')} lo, ${k('mut')} hi) = (i + 1, n - 1);`],
      [null, `            ${k('while')} lo &lt; hi {`],
      ['sum', `                ${k('let')} sum = nums[i] + nums[lo] + nums[hi];`],
      [null, `                ${k('if')} sum &lt; 0 {`],
      ['lo', `                    lo += 1;`],
      [null, `                } ${k('else')} ${k('if')} sum &gt; 0 {`],
      ['hi', `                    hi -= 1;`],
      [null, `                } ${k('else')} {`],
      ['add', `                    result.push(vec![nums[i], nums[lo], nums[hi]]);`],
      [null, `                    lo += 1;`],
      [null, `                    hi -= 1;`],
      ['skip', `                    ${k('while')} lo &lt; hi &amp;&amp; nums[lo] == nums[lo - 1] {`],
      [null, `                        lo += 1;`],
      [null, `                    }`],
      [null, `                }`],
      [null, `            }`],
      [null, `        }`],
      ['ret', `        result`],
      [null, `    }`],
      [null, `}`],
    ],
  },
};

/* ---------------- part 1: the "same triplet twice" widget ----------------
 *
 * The statement hinges on "must not contain duplicate triplets": the answer
 * is about values, not positions. Example 1 has three index triples that sum
 * to 0 but only two triplets. Pick any three cells and the widget says
 * whether they sum to 0 and whether that triplet is new.
 *
 * Built from x-sum's widget vocabulary: clickable .q-arr cells (picked),
 * the amber .q-tie line and the .ledger. */

const QW_SETS = [
  { label: t('example 1', 'ဥပမာ 1'), nums: [-1, 0, 1, 2, -1, -4] },
  { label: t('example 3', 'ဥပမာ 3'), nums: [0, 0, 0] },
  { label: t('four zeros', 'သုည လေးလုံး'), nums: [0, 0, 0, 0] },
  { label: t('two ways', 'နည်း နှစ်မျိုး'), nums: [-2, 0, 1, 1, 2] },
];

function zeroTriples(nums) {
  const out = [];
  for (let i = 0; i < nums.length; i++)
    for (let j = i + 1; j < nums.length; j++)
      for (let kk = j + 1; kk < nums.length; kk++)
        if (nums[i] + nums[j] + nums[kk] === 0) out.push([i, j, kk]);
  return out;
}

function mountTripletWidget(host) {
  const state = { set: 0, sel: [0, 1, 2] };

  host.innerHTML = `
    <div class="q-arr" data-arr></div>
    <div class="q-slider"><span class="q-presets" data-presets></span></div>
    <p class="q-tie" data-line></p>
    <div class="ledger">
      <span class="expr" data-expr></span>
      <span class="total" data-total></span>
    </div>`;

  const q = (sel) => host.querySelector(sel);

  function render() {
    const { nums } = QW_SETS[state.set];
    const sel = [...state.sel].sort((a, b) => a - b);
    const idx = zeroTriples(nums);
    const distinct = [...new Set(idx.map((tr) => fmt(tr.map((x) => nums[x]).sort((a, b) => a - b))))];
    const sum = sel.reduce((p, x) => p + nums[x], 0);
    const mine = fmt(sel.map((x) => nums[x]).sort((a, b) => a - b));
    const sameAs = idx.filter((tr) => fmt(tr.map((x) => nums[x]).sort((a, b) => a - b)) === mine && tr.join() !== sel.join());

    q('[data-presets]').innerHTML = presetChips(QW_SETS, state.set);
    q('[data-arr]').innerHTML = nums.map((v, x) => {
      const on = sel.includes(x);
      return `<div class="cell kept${on ? ' picked' : ''}" role="button" tabindex="0" aria-pressed="${on}" data-i="${x}"><span>${v}</span><span class="idx">${x}</span></div>`;
    }).join('');

    widgetLabel(pick(t('click three cells', 'cell သုံးခု နှိပ်ပါ')));

    q('[data-line]').innerHTML = pick(sel.length < 3
      ? t(`Pick ${3 - sel.length} more.`, `နောက်ထပ် ${3 - sel.length} ခု ရွေးပါ။`)
      : sum !== 0
        ? t(`Indices ${sel.join(', ')} sum to ${sum}, not 0.`, `index ${sel.join(', ')} ပေါင်းလဒ် ${sum} — 0 မဟုတ်ပါ။`)
        : sameAs.length
          ? t(`Indices ${sel.join(', ')} make ${mine} — and so ${sameAs.length === 1 ? 'does' : 'do'} ${sameAs.map((tr) => tr.join(',')).join(' and ')}. Different positions, one triplet: it is listed once.`,
              `index ${sel.join(', ')} က ${mine} ဖြစ်စေသည် — ${sameAs.map((tr) => tr.join(',')).join(' နှင့် ')} ကလည်း ထိုနည်းတူ။ နေရာမတူ၊ triplet တစ်ခုတည်း — တစ်ကြိမ်သာ ဖော်ပြသည်။`)
          : t(`Indices ${sel.join(', ')} make ${mine}, and no other three positions do.`,
              `index ${sel.join(', ')} က ${mine} ဖြစ်စေပြီး အခြား နေရာသုံးခု မည်သည့်တွဲကမျှ ထိုသို့ မဖြစ်စေပါ။`));

    q('[data-expr]').innerHTML = sel.length === 3
      ? `${sel.map((x) => nums[x]).join(' + ')} = ${sum} &nbsp;·&nbsp; ${idx.length} index ${idx.length === 1 ? 'triple' : 'triples'} → ${distinct.length}`
      : `${idx.length} index ${idx.length === 1 ? 'triple' : 'triples'} → ${distinct.length}`;
    q('[data-total]').innerHTML = `${distinct.length}<small>${pick(t('triplets', 'triplet'))}</small>`;
  }

  function toggle(x) {
    if (state.sel.includes(x)) state.sel = state.sel.filter((y) => y !== x);
    else state.sel = [...state.sel, x].slice(-3);
    render();
  }
  host.addEventListener('click', (ev) => {
    const chip = ev.target.closest('[data-set]');
    if (chip) { state.set = Number(chip.dataset.set); state.sel = [0, 1, 2]; return render(); }
    const cell = ev.target.closest('[data-i]');
    if (cell) toggle(Number(cell.dataset.i));
  });
  host.addEventListener('keydown', (ev) => {
    const cell = ev.target.closest('[data-i]');
    if (cell && (ev.key === 'Enter' || ev.key === ' ')) { ev.preventDefault(); toggle(Number(cell.dataset.i)); }
  });
  onLangChange(render);
  render();
}

/* ---------------- the approach, in brief ---------------- */

const APPROACH = {
  brute: {
    idea: t('Try every three positions. Sorting first means each triple reads smallest to largest, so a set can throw out the repeats.',
            'နေရာသုံးခု တွဲတိုင်းကို စမ်းသည်။ အရင် sort လုပ်ထားသဖြင့် triple တိုင်း အငယ်မှ အကြီးသို့ ဖတ်ရပြီး set က ထပ်နေသည်များကို ပယ်နိုင်သည်။'),
    steps: [
      t('Sort <code>nums</code>.', '<code>nums</code> ကို sort လုပ်သည်။'),
      t('For every <code>i &lt; j &lt; k</code>, test whether the three sum to 0.',
        '<code>i &lt; j &lt; k</code> တိုင်းအတွက် သုံးလုံးပေါင်း 0 ဖြစ်သလား စစ်သည်။'),
      t('Put each one that does into <code>found</code>, a set; a triplet already there is dropped.',
        'ဖြစ်သည့် တစ်ခုစီကို set ဖြစ်သော <code>found</code> ထဲ ထည့်သည် — ရှိပြီးသား triplet ကို ပယ်သည်။'),
    ],
    cost: t('n(n − 1)(n − 2)/6 triples: about 4.5 × 10⁹ at n = 3000.',
            'triple n(n − 1)(n − 2)/6 ခု — n = 3000 တွင် 4.5 × 10⁹ ခန့်။'),
  },
  pointers: {
    idea: t('Sort, then fix the smallest number of the triplet. The other two must sum to its negative, and in a sorted array two pointers find every such pair in one squeeze.',
            'sort လုပ်ပြီး triplet ၏ အငယ်ဆုံး ကိန်းကို ချုပ်ကိုင်သည်။ ကျန်နှစ်လုံး ပေါင်းလျှင် ၎င်း၏ အနုတ်တန်ဖိုး ရရမည်ဖြစ်ပြီး sort ထားသော array တွင် pointer နှစ်ခုက ထိုအတွဲအားလုံးကို တစ်ကြိမ် ညှပ်ရုံဖြင့် ရှာတွေ့သည်။'),
    steps: [
      t('Sort <code>nums</code>. For each <code>i</code>, skip it if it equals <code>nums[i - 1]</code>.',
        '<code>nums</code> ကို sort လုပ်သည်။ <code>i</code> တစ်ခုစီ <code>nums[i - 1]</code> နှင့် တူလျှင် ကျော်သည်။'),
      t('Start <code>lo = i + 1</code> and <code>hi</code> at the end.', '<code>lo = i + 1</code> နှင့် <code>hi</code> ကို အဆုံးတွင် စသည်။'),
      t('Sum too small: <code>lo</code> right. Too big: <code>hi</code> left.', 'sum ငယ်လွန်းလျှင် <code>lo</code> ညာသို့၊ ကြီးလွန်းလျှင် <code>hi</code> ဘယ်သို့။'),
      t('Zero: record it, move both, and step <code>lo</code> past equal values.',
        'သုည ဆိုလျှင် မှတ်ပြီး နှစ်ခုလုံး ရွှေ့ကာ <code>lo</code> ကို တူသော value များ ကျော်စေသည်။'),
    ],
    cost: t('the sort, then one squeeze of at most n steps for each i: about 4.5 × 10⁶ pointer moves at n = 3000. No set: skipping equal values keeps the answer distinct.',
            'sort၊ ပြီးမှ i တစ်ခုစီအတွက် အဆင့် n အထိ ညှပ်ခြင်း တစ်ကြိမ် — n = 3000 တွင် pointer ရွှေ့ခြင်း 4.5 × 10⁶ ခန့်။ set မလို — တူသော value များ ကျော်ခြင်းက အဖြေကို ကွဲပြားစေသည်။'),
  },
};

/* ---------------- mount ----------------
 *
 * Last in the file on purpose: mountLesson runs the widget immediately, so
 * every const the widget reads must already be initialised. */

mountLesson({
  input: { nums: [-1, 0, 1, 2, -1, -4] },
  controls: [
    { key: 'nums', label: 'nums', parse: intList({ min: 3, max: MAX_LEN }) },
  ],
  presets: [
    { label: exampleTitle(1), input: { nums: [-1, 0, 1, 2, -1, -4] } },
    { label: exampleTitle(2), input: { nums: [0, 1, 1] } },
    { label: exampleTitle(3), input: { nums: [0, 0, 0] } },
    { label: t('Many repeats', 'ထပ်နေသည် များ'), input: { nums: [-2, 0, 0, 2, 2, -2, 1, 1] } },
  ],
  examples: [
    { title: exampleTitle(1), inputHtml: '<code>nums = [-1,0,1,2,-1,-4]</code>', output: '[[-1,-1,2],[-1,0,1]]',
      why: [t('Three index triples sum to 0: (0,1,2), (1,2,4) and (0,3,4).', 'index triple သုံးခု ပေါင်းလျှင် 0 ရသည် — (0,1,2)၊ (1,2,4) နှင့် (0,3,4)။'),
            t('(0,1,2) and (1,2,4) are both the triplet [-1,0,1], so it is listed once.', '(0,1,2) နှင့် (1,2,4) နှစ်ခုစလုံးသည် triplet [-1,0,1] ဖြစ်သဖြင့် တစ်ကြိမ်သာ ဖော်ပြသည်။')],
      load: { nums: [-1, 0, 1, 2, -1, -4] } },
    { title: exampleTitle(2), inputHtml: '<code>nums = [0,1,1]</code>', output: '[]',
      why: [t('The only triple is 0 + 1 + 1 = 2.', 'triple တစ်ခုတည်းမှာ 0 + 1 + 1 = 2။')],
      load: { nums: [0, 1, 1] } },
    { title: exampleTitle(3), inputHtml: '<code>nums = [0,0,0]</code>', output: '[[0,0,0]]',
      why: [t('The only triple sums to 0. The same value three times is fine — the positions differ.', 'triple တစ်ခုတည်း ပေါင်းလျှင် 0 ရသည်။ value တူ သုံးကြိမ် ဖြစ်လည်း ရသည် — နေရာ မတူပါ။')],
      load: { nums: [0, 0, 0] } },
  ],
  modes: [
    { id: 'brute', name: 'Brute force',
      desc: t('Every triple, then a set to drop repeats.', 'triple တိုင်း၊ ပြီးမှ ထပ်နေသည်ကို set ဖြင့် ပယ်။'),
      cost: 'O(n³) time · O(answer) space', build: buildBrute },
    { id: 'pointers', name: 'Sort + two pointers',
      desc: t('Fix one number, squeeze the other two from both ends.', 'ကိန်းတစ်လုံး ချုပ်ကိုင်၊ ကျန်နှစ်လုံးကို အစွန်းနှစ်ဘက်မှ ညှပ်။'),
      cost: 'O(n²) time · O(1) extra', build: buildPointers },
  ],
  languages: LANGUAGES,
  code: CODE,
  solutions: {
    brute: { approach: APPROACH.brute,
      desc: t('Sort, try every triple, keep the zero-sum ones in a set. Correct, and cubic: too slow for n = 3000.',
              'sort လုပ်၊ triple တိုင်း စမ်း၊ 0 ရသည်များကို set ထဲ ထည့်။ မှန်သည်၊ သို့သော် cubic ဖြစ်၍ n = 3000 အတွက် နှေးလွန်းသည်။') },
    pointers: { approach: APPROACH.pointers,
      desc: t('The submission worth writing. Sorted, each fixed number becomes a two-pointer squeeze, and skipping equal neighbours makes the answer distinct without a set.',
              'ရေးသင့်သည့် submission။ sort ထားလျှင် ချုပ်ကိုင်ထားသော ကိန်းတစ်ခုစီသည် pointer နှစ်ခု ညှပ်ခြင်း ဖြစ်လာပြီး တူသော ကပ်လျက်ကိန်းများ ကျော်ခြင်းက set မပါဘဲ အဖြေကို ကွဲပြားစေသည်။') },
  },
  // How each language was actually checked, printed as the part 3 badges.
  // The corpus: the 3 examples, 5 edges, 15,000 random arrays of 3–9 values
  // from -3..3, 5,000 of 3–30 from -10..10, and five at n = 3000 — against an
  // oracle that counts values and checks pairs of distinct values. Triplets
  // are compared in sorted order. The brute force skips the five at n = 3000.
  // Go and Rust ran in Docker (golang:1.23-alpine, rust:1-slim).
  verification: {
    ruby: { brute: 'ran here · 20,008 cases, not the five at n = 3000', pointers: 'ran here · 20,013 cases' },
    python: { brute: 'ran here · 20,008 cases, not the five at n = 3000', pointers: 'ran here · 20,013 cases' },
    javascript: { brute: 'ran here · 20,008 cases, not the five at n = 3000', pointers: 'ran here · 20,013 cases' },
    go: { brute: 'ran here · 20,008 cases, not the five at n = 3000 · Go 1.23', pointers: 'ran here · 20,013 cases · Go 1.23' },
    rust: { brute: 'ran here · 20,008 cases, not the five at n = 3000 · rustc 1.98', pointers: 'ran here · 20,013 cases · rustc 1.98' },
  },
  strip,
  draw,
  answer,
  vars,
  hover: { python: { total: 'sum' } },
  widget: mountTripletWidget,
});
