/* Product of Array Except Self — LeetCode 238.
 *
 * Every answer splits the same way: everything to the left of i, times
 * everything to the right. The brute force recomputes both halves for every
 * index. The two-pass solution notices that the left half for i + 1 is the
 * left half for i times one more number, so a running product walks left to
 * right, then a second one walks right to left. No division, so zeros need no
 * special case.
 */
import { mountLesson } from '../../lib/stepper.js';
import { pick, onLangChange } from '../../lib/i18n.js';
import { cells, readout, stagePanel } from '../../lib/stage.js';
import { t, exampleTitle, LANGUAGES, k, c, stageRow, stageGap, intList, listText, presetChips, widgetLabel } from '../../lib/kit.js';

const MAX_LEN = 10;

// -0 is a real JavaScript value (−3 × 0) but not an answer anyone writes.
const clean = (v) => (Object.is(v, -0) ? 0 : v);

/* ---------------- step generators ---------------- */

function buildBrute({ nums }) {
  const n = nums.length;
  const steps = [];
  const answer = Array(n).fill(null);
  const snap = (extra) => ({ view: 'brute', answer: [...answer], i: null, j: null, left: null, right: null, side: null, ...extra });

  steps.push(snap({ line: 'init', tag: t(`${n} slots`, `slot ${n} ခု`),
    note: t(`${n} answers to fill. For each index, multiply everything on its left, then everything on its right.`,
            `ဖြည့်ရမည့် အဖြေ ${n} ခု။ index တစ်ခုစီအတွက် ၎င်း၏ ဘယ်ဘက်ရှိ အားလုံးကို မြှောက်ပြီး ညာဘက်ရှိ အားလုံးကို ဆက်မြှောက်သည်။`) }));

  for (let i = 0; i < n; i++) {
    let left = 1;
    let right = 1;
    steps.push(snap({ i, left, right, line: 'outer', tag: t(`i = ${i}`, `i = ${i}`),
      note: i === 0
        ? t(`<b>i = 0</b>. Nothing is to its left, so <code>left</code> stays 1.`,
            `<b>i = 0</b>။ ၎င်း၏ ဘယ်ဘက်တွင် ဘာမျှ မရှိသဖြင့် <code>left</code> သည် 1 အတိုင်း ရှိနေသည်။`)
        : t(`<b>i = ${i}</b>, value ${nums[i]} — the one number this answer leaves out.`,
            `<b>i = ${i}</b>၊ value ${nums[i]} — ဤအဖြေက ချန်ထားရမည့် ကိန်းတစ်လုံးတည်း။`) }));
    for (let j = 0; j < i; j++) {
      left *= nums[j];
      steps.push(snap({ i, j, left, right, side: 'left', line: 'left', tag: t('left', 'left'),
        note: t(`<code>left</code> × nums[${j}] (${nums[j]}) = <b>${clean(left)}</b>.`,
                `<code>left</code> × nums[${j}] (${nums[j]}) = <b>${clean(left)}</b>။`) }));
    }
    for (let j = n - 1; j > i; j--) {
      right *= nums[j];
      steps.push(snap({ i, j, left, right, side: 'right', line: 'right', tag: t('right', 'right'),
        note: t(`<code>right</code> × nums[${j}] (${nums[j]}) = <b>${clean(right)}</b>. Walking in from the end keeps every partial product a suffix, which the statement promises fits in 32 bits.`,
                `<code>right</code> × nums[${j}] (${nums[j]}) = <b>${clean(right)}</b>။ နောက်ဆုံးမှ ဝင်လာခြင်းကြောင့် ကြားဖြတ်မြှောက်လဒ်တိုင်းသည် suffix ဖြစ်ပြီး 32 bit ထဲ ဆံ့ကြောင်း မေးခွန်းက အာမခံထားသည်။`) }));
    }
    if (i === n - 1) {
      steps.push(snap({ i, left, right, line: 'right', tag: t('right', 'right'),
        note: t('Nothing is to the right of the last index, so <code>right</code> stays 1.',
                'နောက်ဆုံး index ၏ ညာဘက်တွင် ဘာမျှ မရှိသဖြင့် <code>right</code> သည် 1 အတိုင်း ရှိနေသည်။') }));
    }
    answer[i] = clean(left * right);
    steps.push(snap({ i, left, right, just: i, line: 'set', tag: t(`answer[${i}]`, `answer[${i}]`),
      note: t(`answer[${i}] = ${clean(left)} × ${clean(right)} = <b>${answer[i]}</b>. That took ${n - 1} multiplications, and the next index starts again from 1.`,
              `answer[${i}] = ${clean(left)} × ${clean(right)} = <b>${answer[i]}</b>။ မြှောက်ခြင်း ${n - 1} ကြိမ် ကုန်ပြီး နောက် index က 1 မှ ပြန်စသည်။`) }));
  }
  steps.push(snap({ line: 'ret', finished: true, result: [...answer], tag: t('return', 'return'),
    note: t(`Return <b>[${answer.join(', ')}]</b>: ${n} × ${n - 1} = ${n * (n - 1)} multiplications, most of them repeats of the ones before.`,
            `<b>[${answer.join(', ')}]</b> ကို ပြန်ပေးသည် — မြှောက်ခြင်း ${n} × ${n - 1} = ${n * (n - 1)} ကြိမ်၊ အများစုမှာ ယခင် မြှောက်ခဲ့ပြီးသားကို ထပ်မြှောက်ခြင်း ဖြစ်သည်။`) }));
  return steps;
}

function buildSweep({ nums }) {
  const n = nums.length;
  const steps = [];
  const answer = Array(n).fill(null);
  const final = Array(n).fill(false);
  let prefix = null;
  let suffix = null;
  const snap = (extra) => ({ view: 'sweep', answer: [...answer], final: [...final], prefix, suffix, i: null, ...extra });

  steps.push(snap({ line: 'init', tag: t(`${n} slots`, `slot ${n} ခု`),
    note: t(`${n} slots in <code>answer</code>. Pass 1 writes each one with the product of everything to its left; pass 2 multiplies in everything to its right.`,
            `<code>answer</code> တွင် slot ${n} ခု။ pass 1 က slot တစ်ခုစီထဲ ၎င်း၏ ဘယ်ဘက်ရှိ အားလုံး၏ မြှောက်လဒ်ကို ရေးပြီး pass 2 က ညာဘက်ရှိ အားလုံးကို ဆက်မြှောက်ထည့်သည်။`) }));
  prefix = 1;
  steps.push(snap({ line: 'p0', tag: t('pass 1', 'pass 1'),
    note: t('<code>prefix</code> = 1: the product of nothing, which is what is to the left of index 0.',
            '<code>prefix</code> = 1 — ဘာမျှ မရှိသည်၏ မြှောက်လဒ်၊ index 0 ၏ ဘယ်ဘက်တွင် ရှိသည့်အရာ ဖြစ်သည်။') }));
  for (let i = 0; i < n; i++) {
    answer[i] = clean(prefix);
    steps.push(snap({ i, just: i, line: 'pset', tag: t('left of i', 'i ၏ ဘယ်ဘက်'),
      note: t(`answer[${i}] = <code>prefix</code> = <b>${clean(prefix)}</b>, the product of ${i === 0 ? 'nothing' : `nums[0..${i - 1}]`}.`,
              `answer[${i}] = <code>prefix</code> = <b>${clean(prefix)}</b> — ${i === 0 ? 'ဘာမျှ မရှိသည်' : `nums[0..${i - 1}]`} ၏ မြှောက်လဒ်။`) }));
    prefix = clean(prefix * nums[i]);
    steps.push(snap({ i, line: 'pmul', tag: t('grow prefix', 'prefix တိုး'),
      note: t(`<code>prefix</code> × ${nums[i]} = <b>${prefix}</b>, ready for index ${i + 1}${i === n - 1 ? ' — there is none, so this last product goes unused' : ''}. One multiplication, not ${i + 1}.`,
              `<code>prefix</code> × ${nums[i]} = <b>${prefix}</b> — index ${i + 1} အတွက် အသင့်${i === n - 1 ? ' (index မရှိတော့သဖြင့် ဤနောက်ဆုံး မြှောက်လဒ်ကို မသုံးပါ)' : ''}။ ${i + 1} ကြိမ် မဟုတ်ဘဲ တစ်ကြိမ်သာ မြှောက်သည်။`) }));
  }
  suffix = 1;
  steps.push(snap({ line: 's0', tag: t('pass 2', 'pass 2'),
    note: t('<code>suffix</code> = 1, and walk back from the end. Each slot already holds its left product; it only lacks its right one.',
            '<code>suffix</code> = 1 ဖြင့် နောက်ဆုံးမှ ပြန်လျှောက်သည်။ slot တစ်ခုစီတွင် ၎င်း၏ ဘယ်ဘက် မြှောက်လဒ် ရှိပြီးသား — ညာဘက် မြှောက်လဒ်သာ လိုသည်။') }));
  for (let i = n - 1; i >= 0; i--) {
    const was = answer[i];
    answer[i] = clean(answer[i] * suffix);
    final[i] = true;
    steps.push(snap({ i, just: i, line: 'sset', tag: t('done', 'ပြီး'),
      note: t(`answer[${i}] = ${was} × <code>suffix</code> (${suffix}) = <b>${answer[i]}</b>. Left times right: this slot is final.`,
              `answer[${i}] = ${was} × <code>suffix</code> (${suffix}) = <b>${answer[i]}</b>။ ဘယ် × ညာ — ဤ slot ပြီးပြီ။`) }));
    suffix = clean(suffix * nums[i]);
    steps.push(snap({ i, line: 'smul', tag: t('grow suffix', 'suffix တိုး'),
      note: t(`<code>suffix</code> × ${nums[i]} = <b>${suffix}</b>${i === 0 ? ', and nothing is left to use it on' : `, ready for index ${i - 1}`}.`,
              `<code>suffix</code> × ${nums[i]} = <b>${suffix}</b>${i === 0 ? ' — သုံးစရာ index မကျန်တော့ပါ' : ` — index ${i - 1} အတွက် အသင့်`}။`) }));
  }
  steps.push(snap({ line: 'ret', finished: true, result: [...answer], tag: t('return', 'return'),
    note: t(`Return <b>[${answer.join(', ')}]</b>: two passes, ${2 * n} multiplications into the running products, no division — so the zeros needed no special case.`,
            `<b>[${answer.join(', ')}]</b> ကို ပြန်ပေးသည် — pass နှစ်ခု၊ running product ထဲ မြှောက်ခြင်း ${2 * n} ကြိမ်၊ စားခြင်း မရှိ — ထို့ကြောင့် သုညများအတွက် သီးသန့် case မလိုပါ။`) }));
  return steps;
}

/* ---------------- drawing ----------------
 *
 * The strip shows which numbers the running product has taken in (green) and
 * the index being answered (amber, or red dashed while it is left out). The
 * stage holds what the approach carries: the two partial products, and for
 * the two-pass solution the answer array itself, because pass 1 parks the
 * left products in it. */

function strip(s, { nums }) {
  const n = nums.length;
  const tone = {};
  const marks = {};
  if (s.view === 'brute') {
    if (s.i != null) {
      for (let j = 0; j < n; j++) {
        if (j === s.i) continue;
        const inLeft = j < s.i && (s.side === 'right' || s.line === 'set' || (s.side === 'left' && j <= s.j));
        const inRight = j > s.i && (s.line === 'set' || (s.side === 'right' && j >= s.j));
        if (inLeft || inRight) tone[j] = 'entering';
      }
      tone[s.i] = 'leaving';
      marks[s.i] = 'i';
      if (s.j != null) marks[s.j] = 'j';
    }
    if (s.finished) nums.forEach((_, j) => { tone[j] = 'done'; });
    return cells(nums, { tone, marks });
  }
  if (s.i != null) {
    const pass1 = s.line === 'pset' || s.line === 'pmul';
    for (let j = 0; j < n; j++) {
      const covered = pass1
        ? j < s.i || (s.line === 'pmul' && j === s.i)
        : j > s.i || (s.line === 'smul' && j === s.i);
      if (covered) tone[j] = 'entering';
    }
    if (tone[s.i] !== 'entering') tone[s.i] = 'inwin';
    marks[s.i] = 'i';
  }
  if (s.finished) nums.forEach((_, j) => { tone[j] = 'done'; });
  return cells(nums, { tone, marks });
}

const show = (v) => (v == null ? '·' : v);

function draw(s, { nums }) {
  if (s.view === 'brute') {
    const expr = s.i == null ? '—' : `${show(s.left == null ? null : clean(s.left))} × ${show(s.right == null ? null : clean(s.right))}`;
    return stagePanel(pick(t('left × right', 'left × right')),
      pick(s.i == null ? t('no index yet', 'index မရွေးရသေး') : t(`leaving out nums[${s.i}] = ${nums[s.i]}`, `nums[${s.i}] = ${nums[s.i]} ကို ချန်ထား`)),
      readout({ left: show(s.left == null ? null : clean(s.left)), right: show(s.right == null ? null : clean(s.right)), 'answer[i]': s.line === 'set' ? s.answer[s.i] : expr }));
  }
  const tone = {};
  s.answer.forEach((_, j) => { if (s.final[j]) tone[j] = 'entering'; });
  if (s.just != null) tone[s.just] = s.final[s.just] ? 'entering' : 'inwin';
  const marks = s.i != null ? { [s.i]: 'i' } : {};
  return stagePanel(pick(t('answer — left products, then left × right', 'answer — ဘယ် မြှောက်လဒ်၊ ပြီးမှ ဘယ် × ညာ')),
    pick(t(`${s.final.filter(Boolean).length} of ${nums.length} final`, `${nums.length} ခုအနက် ${s.final.filter(Boolean).length} ခု ပြီး`)),
    stageRow(cells(s.answer.map(show), { tone, marks }), '')
      + stageGap + readout({ prefix: show(s.prefix), suffix: show(s.suffix) }));
}

/* The answer card: a slot per index, filled once that answer is final. */
function answer(s) {
  const done = s.view === 'brute' ? s.answer.map((v) => v != null) : s.final;
  const html = s.answer.map((v, i) => `<span class="slot${done[i] ? ' filled' : ''}${i === s.just && done[i] ? ' just' : ''}">${done[i] ? v : '·'}</span>`).join('');
  return { html, note: s.finished ? t('every product, no division', 'မြှောက်လဒ် အားလုံး၊ စားခြင်း မပါ') : t('one product per index', 'index တစ်ခုစီ မြှောက်လဒ် တစ်ခု') };
}

function vars(s, { nums }) {
  const arr = `[${s.answer.map(show).join(', ')}]`;
  if (s.view === 'brute') {
    return [['i', s.i ?? '—'], ['j', s.j ?? '—'], ['left', s.left == null ? '—' : clean(s.left)],
            ['right', s.right == null ? '—' : clean(s.right)], ['answer', arr], ['n', nums.length], ['nums', `[${nums.join(', ')}]`]];
  }
  return [['i', s.i ?? '—'], ['prefix', s.prefix ?? '—'], ['suffix', s.suffix ?? '—'],
          ['answer', arr], ['n', nums.length], ['nums', `[${nums.join(', ')}]`]];
}

/* ---------------- the code, one key per line ----------------
 *
 * Generated from the verified solution files, so the listing a reader copies
 * is byte-identical to the one that ran. */

const CODE = {
  brute: {
    ruby: [
      [null, `${k('def')} product_except_self(nums)`],
      [null, `  n = nums.length`],
      ['init', `  answer = Array.new(n, 0)`],
      ['outer', `  (0...n).each ${k('do')} |i|`],
      [null, `    left = 1`],
      ['left', `    (0...i).each { |j| left *= nums[j] }`],
      [null, `    right = 1`],
      ['right', `    (n - 1).downto(i + 1) { |j| right *= nums[j] }`],
      ['set', `    answer[i] = left * right`],
      [null, `  ${k('end')}`],
      ['ret', `  answer`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} productExceptSelf(self, nums):`],
      [null, `        n = len(nums)`],
      ['init', `        answer = [0] * n`],
      ['outer', `        ${k('for')} i ${k('in')} range(n):`],
      [null, `            left = 1`],
      [null, `            ${k('for')} j ${k('in')} range(i):`],
      ['left', `                left *= nums[j]`],
      [null, `            right = 1`],
      [null, `            ${k('for')} j ${k('in')} range(n - 1, i, -1):`],
      ['right', `                right *= nums[j]`],
      ['set', `            answer[i] = left * right`],
      ['ret', `        ${k('return')} answer`],
    ],
    javascript: [
      [null, `${k('const')} productExceptSelf = ${k('function')} (nums) {`],
      [null, `  ${k('const')} n = nums.length;`],
      ['init', `  ${k('const')} answer = ${k('new')} Array(n).fill(0);`],
      ['outer', `  ${k('for')} (${k('let')} i = 0; i &lt; n; i++) {`],
      [null, `    ${k('let')} left = 1;`],
      ['left', `    ${k('for')} (${k('let')} j = 0; j &lt; i; j++) left *= nums[j];`],
      [null, `    ${k('let')} right = 1;`],
      ['right', `    ${k('for')} (${k('let')} j = n - 1; j &gt; i; j--) right *= nums[j];`],
      ['set', `    answer[i] = left * right;`],
      [null, `  }`],
      ['ret', `  ${k('return')} answer;`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} productExceptSelf(nums []int) []int {`],
      [null, `    n := len(nums)`],
      ['init', `    answer := make([]int, n)`],
      ['outer', `    ${k('for')} i := 0; i &lt; n; i++ {`],
      [null, `        left, right := 1, 1`],
      [null, `        ${k('for')} j := 0; j &lt; i; j++ {`],
      ['left', `            left *= nums[j]`],
      [null, `        }`],
      [null, `        ${k('for')} j := n - 1; j &gt; i; j-- {`],
      ['right', `            right *= nums[j]`],
      [null, `        }`],
      ['set', `        answer[i] = left * right`],
      [null, `    }`],
      ['ret', `    ${k('return')} answer`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} product_except_self(nums: Vec&lt;i32&gt;) -&gt; Vec&lt;i32&gt; {`],
      [null, `        ${k('let')} n = nums.len();`],
      ['init', `        ${k('let')} ${k('mut')} answer = vec![0; n];`],
      ['outer', `        ${k('for')} i ${k('in')} 0..n {`],
      [null, `            ${k('let')} ${k('mut')} left = 1;`],
      [null, `            ${k('for')} j ${k('in')} 0..i {`],
      ['left', `                left *= nums[j];`],
      [null, `            }`],
      [null, `            ${k('let')} ${k('mut')} right = 1;`],
      [null, `            ${k('for')} j ${k('in')} (i + 1..n).rev() {`],
      ['right', `                right *= nums[j];`],
      [null, `            }`],
      ['set', `            answer[i] = left * right;`],
      [null, `        }`],
      ['ret', `        answer`],
      [null, `    }`],
      [null, `}`],
    ],
  },
  sweep: {
    ruby: [
      [null, `${k('def')} product_except_self(nums)`],
      [null, `  n = nums.length`],
      ['init', `  answer = Array.new(n, 1)`],
      ['p0', `  prefix = 1`],
      [null, `  (0...n).each ${k('do')} |i|`],
      ['pset', `    answer[i] = prefix`],
      ['pmul', `    prefix *= nums[i]`],
      [null, `  ${k('end')}`],
      ['s0', `  suffix = 1`],
      [null, `  (n - 1).downto(0) ${k('do')} |i|`],
      ['sset', `    answer[i] *= suffix`],
      ['smul', `    suffix *= nums[i]`],
      [null, `  ${k('end')}`],
      ['ret', `  answer`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} productExceptSelf(self, nums):`],
      [null, `        n = len(nums)`],
      ['init', `        answer = [1] * n`],
      ['p0', `        prefix = 1`],
      [null, `        ${k('for')} i ${k('in')} range(n):`],
      ['pset', `            answer[i] = prefix`],
      ['pmul', `            prefix *= nums[i]`],
      ['s0', `        suffix = 1`],
      [null, `        ${k('for')} i ${k('in')} range(n - 1, -1, -1):`],
      ['sset', `            answer[i] *= suffix`],
      ['smul', `            suffix *= nums[i]`],
      ['ret', `        ${k('return')} answer`],
    ],
    javascript: [
      [null, `${k('const')} productExceptSelf = ${k('function')} (nums) {`],
      [null, `  ${k('const')} n = nums.length;`],
      ['init', `  ${k('const')} answer = ${k('new')} Array(n).fill(1);`],
      ['p0', `  ${k('let')} prefix = 1;`],
      [null, `  ${k('for')} (${k('let')} i = 0; i &lt; n; i++) {`],
      ['pset', `    answer[i] = prefix;`],
      ['pmul', `    prefix *= nums[i];`],
      [null, `  }`],
      ['s0', `  ${k('let')} suffix = 1;`],
      [null, `  ${k('for')} (${k('let')} i = n - 1; i &gt;= 0; i--) {`],
      ['sset', `    answer[i] *= suffix;`],
      ['smul', `    suffix *= nums[i];`],
      [null, `  }`],
      ['ret', `  ${k('return')} answer;`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} productExceptSelf(nums []int) []int {`],
      [null, `    n := len(nums)`],
      ['init', `    answer := make([]int, n)`],
      ['p0', `    prefix := 1`],
      [null, `    ${k('for')} i := 0; i &lt; n; i++ {`],
      ['pset', `        answer[i] = prefix`],
      ['pmul', `        prefix *= nums[i]`],
      [null, `    }`],
      ['s0', `    suffix := 1`],
      [null, `    ${k('for')} i := n - 1; i &gt;= 0; i-- {`],
      ['sset', `        answer[i] *= suffix`],
      ['smul', `        suffix *= nums[i]`],
      [null, `    }`],
      ['ret', `    ${k('return')} answer`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} product_except_self(nums: Vec&lt;i32&gt;) -&gt; Vec&lt;i32&gt; {`],
      [null, `        ${k('let')} n = nums.len();`],
      ['init', `        ${k('let')} ${k('mut')} answer = vec![1; n];`],
      ['p0', `        ${k('let')} ${k('mut')} prefix = 1;`],
      [null, `        ${k('for')} i ${k('in')} 0..n {`],
      ['pset', `            answer[i] = prefix;`],
      ['pmul', `            prefix *= nums[i];`],
      [null, `        }`],
      ['s0', `        ${k('let')} ${k('mut')} suffix = 1;`],
      [null, `        ${k('for')} i ${k('in')} (0..n).rev() {`],
      ['sset', `            answer[i] *= suffix;`],
      ['smul', `            suffix *= nums[i];`],
      [null, `        }`],
      ['ret', `        answer`],
      [null, `    }`],
      [null, `}`],
    ],
  },
};

/* ---------------- part 1: the "left × right" widget ----------------
 *
 * The statement hinges on "except nums[i]": every answer is the product of
 * two runs of the array — everything left of i, everything right of it. Drag
 * i and the split moves; on an array with a zero the tie line shows why
 * dividing the whole product cannot get there.
 *
 * Built from x-sum's widget vocabulary: .q-arr cells (kept / cut), the
 * .q-slider, the amber .q-tie line and the .ledger. */

const QW_SETS = [
  { label: t('example 1', 'ဥပမာ 1'), nums: [1, 2, 3, 4] },
  { label: t('example 2', 'ဥပမာ 2'), nums: [-1, 1, 0, -3, 3] },
  { label: t('two zeros', 'သုည နှစ်လုံး'), nums: [4, 0, 2, 0, 5] },
  { label: t('signs', 'အပေါင်း/အနုတ်'), nums: [-2, 3, -1, 4, -5] },
];

function mountSplitWidget(host) {
  const state = { set: 0, i: 1 };

  host.innerHTML = `
    <div class="q-arr" data-arr></div>
    <div class="q-slider">
      <label for="qw-i" data-lbl></label>
      <input type="range" id="qw-i" min="0" max="3" value="1">
      <output data-out>1</output>
      <span class="q-presets" data-presets></span>
    </div>
    <p class="q-tie" data-line></p>
    <div class="ledger">
      <span class="expr" data-expr></span>
      <span class="total" data-total></span>
    </div>`;

  const q = (sel) => host.querySelector(sel);
  const prod = (a) => clean(a.reduce((p, x) => p * x, 1));

  function render() {
    const { nums } = QW_SETS[state.set];
    const n = nums.length;
    const i = Math.min(state.i, n - 1);
    const L = nums.slice(0, i);
    const R = nums.slice(i + 1);
    const left = prod(L);
    const right = prod(R);
    const whole = prod(nums);
    const zeros = nums.filter((x) => x === 0).length;

    q('[data-lbl]').textContent = pick(t('leave out', 'ချန်ထား'));
    const slider = q('#qw-i');
    slider.max = String(n - 1);
    slider.value = String(i);
    q('[data-out]').textContent = String(i);
    q('[data-presets]').innerHTML = presetChips(QW_SETS, state.set);

    q('[data-arr]').innerHTML = nums.map((v, j) =>
      `<div class="cell ${j === i ? 'cut' : 'kept'}"><span>${v}</span><span class="idx">${j}</span></div>`).join('');

    widgetLabel(pick(t(`${n} values · product ${whole}`, `value ${n} ခု · မြှောက်လဒ် ${whole}`)));

    q('[data-line]').innerHTML = pick(zeros && nums[i] === 0
      ? t(`nums[${i}] is 0. The whole product is ${whole}, and ${whole} ÷ 0 has no answer — yet left × right is ${clean(left * right)}. That is why the statement bans division.`,
          `nums[${i}] သည် 0။ မြှောက်လဒ် တစ်ခုလုံးမှာ ${whole} ဖြစ်ပြီး ${whole} ÷ 0 ကို ဖြေ၍ မရပါ — သို့သော် left × right သည် ${clean(left * right)}။ ထို့ကြောင့် မေးခွန်းက စားခြင်းကို တားထားသည်။`)
      : zeros
        ? t(`A 0 sits on the ${nums.indexOf(0) < i ? 'left' : 'right'}${zeros > 1 ? ' (and there is another)' : ''}, so answer[${i}] is 0 however big the rest is.`,
            `0 တစ်လုံးသည် ${nums.indexOf(0) < i ? 'ဘယ်' : 'ညာ'}ဘက်တွင် ရှိသည်${zeros > 1 ? ' (နောက်တစ်လုံးလည်း ရှိသည်)' : ''} — ကျန်သည် မည်မျှကြီးကြီး answer[${i}] သည် 0 ဖြစ်သည်။`)
        : t(`Everything except index ${i} is two runs: the ${L.length} ${L.length === 1 ? 'number' : 'numbers'} before it and the ${R.length} after it.`,
            `index ${i} မှလွဲ၍ အားလုံးသည် အပိုင်းနှစ်ပိုင်း — ၎င်းမတိုင်မီ ကိန်း ${L.length} လုံးနှင့် ၎င်းနောက်ရှိ ${R.length} လုံး။`));

    const fmt = (a) => (a.length ? `(${a.join(' × ')})` : '(1)');
    q('[data-expr]').innerHTML = `${fmt(L)} × ${fmt(R)} = ${left} × ${right}`;
    q('[data-total]').innerHTML = `${clean(left * right)}<small>answer[${i}]</small>`;
  }

  host.addEventListener('input', (ev) => {
    if (ev.target.id !== 'qw-i') return;
    state.i = Number(ev.target.value); render();
  });
  host.addEventListener('click', (ev) => {
    const chip = ev.target.closest('[data-set]');
    if (!chip) return;
    state.set = Number(chip.dataset.set);
    render();
  });
  onLangChange(render);
  render();
}

/* ---------------- the approach, in brief ---------------- */

const APPROACH = {
  brute: {
    idea: t('answer[i] is everything left of i times everything right of it. Work both out from scratch for every index.',
            'answer[i] သည် i ၏ ဘယ်ဘက်ရှိ အားလုံး × ညာဘက်ရှိ အားလုံး ဖြစ်သည်။ index တိုင်းအတွက် နှစ်ခုစလုံးကို အစမှ တွက်သည်။'),
    steps: [
      t('For each index <code>i</code>, start <code>left</code> and <code>right</code> at 1.',
        'index <code>i</code> တစ်ခုစီအတွက် <code>left</code> နှင့် <code>right</code> ကို 1 ဖြင့် စသည်။'),
      t('Multiply every <code>nums[j]</code> with <code>j &lt; i</code> into <code>left</code>.',
        '<code>j &lt; i</code> ဖြစ်သော <code>nums[j]</code> တိုင်းကို <code>left</code> ထဲ မြှောက်ထည့်သည်။'),
      t('Multiply every <code>nums[j]</code> with <code>j &gt; i</code> into <code>right</code>, walking in from the end so each partial product is a suffix.',
        '<code>j &gt; i</code> ဖြစ်သော <code>nums[j]</code> တိုင်းကို <code>right</code> ထဲ မြှောက်ထည့်သည် — ကြားဖြတ် မြှောက်လဒ်တိုင်း suffix ဖြစ်စေရန် နောက်ဆုံးမှ ဝင်လာသည်။'),
      t('<code>answer[i] = left * right</code>.', '<code>answer[i] = left * right</code>။'),
    ],
    cost: t('n − 1 multiplications per index, so n(n − 1) in all: about 10¹⁰ at n = 10⁵, which the statement rules out by asking for O(n).',
            'index တစ်ခုလျှင် မြှောက်ခြင်း n − 1 ကြိမ်၊ စုစုပေါင်း n(n − 1) — n = 10⁵ တွင် 10¹⁰ ခန့်၊ O(n) တောင်းထားသဖြင့် မေးခွန်းက ခွင့်မပြုပါ။'),
  },
  sweep: {
    idea: t("The left product for index i + 1 is the left product for i times nums[i]. Keep it running instead of starting over — once left to right, then once right to left for the other side.",
            'index i + 1 ၏ ဘယ် မြှောက်လဒ်သည် i ၏ ဘယ် မြှောက်လဒ် × nums[i] ဖြစ်သည်။ အစမှ ပြန်မစဘဲ ဆက်ထိန်းထားသည် — ဘယ်မှ ညာ တစ်ကြိမ်၊ ပြီးမှ ကျန်ဘက်အတွက် ညာမှ ဘယ် တစ်ကြိမ်။'),
    steps: [
      t('Pass 1, left to right: <code>answer[i] = prefix</code>, then <code>prefix *= nums[i]</code>.',
        'Pass 1၊ ဘယ်မှ ညာ — <code>answer[i] = prefix</code>၊ ပြီးမှ <code>prefix *= nums[i]</code>။'),
      t('Now every slot holds the product of everything to its left.',
        'ယခု slot တိုင်းတွင် ၎င်း၏ ဘယ်ဘက်ရှိ အားလုံး၏ မြှောက်လဒ် ရှိသည်။'),
      t('Pass 2, right to left: <code>answer[i] *= suffix</code>, then <code>suffix *= nums[i]</code>.',
        'Pass 2၊ ညာမှ ဘယ် — <code>answer[i] *= suffix</code>၊ ပြီးမှ <code>suffix *= nums[i]</code>။'),
    ],
    cost: t('two passes of n, one multiplication into each running product per index; the answer array is the only array, and the statement does not count it.',
            'n ၏ pass နှစ်ခု၊ index တစ်ခုလျှင် running product တစ်ခုစီထဲ မြှောက်ခြင်း တစ်ကြိမ် — array တစ်ခုတည်းမှာ answer ဖြစ်ပြီး မေးခွန်းက ၎င်းကို မရေတွက်ပါ။'),
  },
};

/* ---------------- mount ----------------
 *
 * Last in the file on purpose: mountLesson runs the widget immediately, so
 * every const the widget reads must already be initialised. */

mountLesson({
  input: { nums: [1, 2, 3, 4] },
  controls: [
    { key: 'nums', label: 'nums', value: '1, 2, 3, 4', parse: intList({ min: 2, max: MAX_LEN, lo: -30, hi: 30 }), format: listText },
  ],
  presets: [
    { label: exampleTitle(1), input: { nums: [1, 2, 3, 4] } },
    { label: exampleTitle(2), input: { nums: [-1, 1, 0, -3, 3] } },
    { label: t('Two zeros', 'သုည နှစ်လုံး'), input: { nums: [4, 0, 2, 0, 5] } },
    { label: t('Signs', 'အပေါင်း/အနုတ်'), input: { nums: [-2, 3, -1, 4, -5] } },
  ],
  examples: [
    { title: exampleTitle(1), inputHtml: '<code>nums = [1,2,3,4]</code>', output: '[24,12,8,6]',
      why: [t('answer[0] = 2 × 3 × 4 = 24, answer[1] = 1 × 3 × 4 = 12, and so on — each leaves out its own number.',
              'answer[0] = 2 × 3 × 4 = 24၊ answer[1] = 1 × 3 × 4 = 12၊ စသဖြင့် — တစ်ခုစီက ၎င်း၏ ကိန်းကိုယ်တိုင်ကို ချန်ထားသည်။')],
      load: { nums: [1, 2, 3, 4] } },
    { title: exampleTitle(2), inputHtml: '<code>nums = [-1,1,0,-3,3]</code>', output: '[0,0,9,0,0]',
      why: [t('Every answer but one includes the 0. The one that leaves the 0 out is −1 × 1 × −3 × 3 = 9.',
              'အဖြေတစ်ခုမှလွဲ၍ အားလုံးတွင် 0 ပါသည်။ 0 ကို ချန်ထားသည့် တစ်ခုမှာ −1 × 1 × −3 × 3 = 9။')],
      load: { nums: [-1, 1, 0, -3, 3] } },
  ],
  modes: [
    { id: 'brute', name: 'Brute force',
      desc: t('Multiply both sides again for every index.', 'index တိုင်းအတွက် ဘေးနှစ်ဘက်ကို ထပ်မြှောက်သည်။'),
      cost: 'O(n²) time · O(1) space', build: buildBrute },
    { id: 'sweep', name: 'Prefix × suffix',
      sub: t('two passes', 'pass နှစ်ခု'),
      desc: t('Carry the left product forward, then the right one back.', 'ဘယ် မြှောက်လဒ်ကို ရှေ့သို့၊ ညာ မြှောက်လဒ်ကို နောက်သို့ သယ်သည်။'),
      cost: 'O(n) time · O(1) extra', build: buildSweep },
  ],
  languages: LANGUAGES,
  code: CODE,
  solutions: {
    brute: { approach: APPROACH.brute,
      desc: t('Left times right, recomputed for every index. Correct and division-free, but quadratic — too slow for n = 10⁵.',
              'ဘယ် × ညာ ကို index တိုင်းအတွက် ပြန်တွက်သည်။ မှန်ပြီး စားခြင်း မပါ၊ သို့သော် quadratic ဖြစ်၍ n = 10⁵ အတွက် နှေးလွန်းသည်။') },
    sweep: { approach: APPROACH.sweep,
      desc: t('The submission worth writing: the answer array holds the left products, and one running variable supplies the right ones. O(n) time, and no extra array.',
              'ရေးသင့်သည့် submission — answer array က ဘယ် မြှောက်လဒ်များကို သိမ်းပြီး running variable တစ်ခုက ညာ မြှောက်လဒ်များကို ပေးသည်။ O(n) အချိန်၊ အပို array မလို။') },
  },
  // How each language was actually checked, printed as the part 3 badges.
  // The corpus: the 2 examples, 6 edges, 15,000 random arrays of up to 8
  // values from -3..3, 5,000 of up to 12 from -30..30, and five at n = 10⁵ —
  // every one with each prefix and suffix product inside 32 bits — against an
  // oracle multiplying Python integers. The brute force skips the five at
  // n = 10⁵ (10¹⁰ multiplications each). Go and Rust ran in Docker
  // (golang:1.23-alpine, rust:1-slim).
  verification: {
    ruby: { brute: 'ran here · 20,008 cases, not the five at n = 10⁵', sweep: 'ran here · 20,013 cases' },
    python: { brute: 'ran here · 20,008 cases, not the five at n = 10⁵', sweep: 'ran here · 20,013 cases' },
    javascript: { brute: 'ran here · 20,008 cases, not the five at n = 10⁵', sweep: 'ran here · 20,013 cases' },
    go: { brute: 'ran here · 20,008 cases, not the five at n = 10⁵ · Go 1.23', sweep: 'ran here · 20,013 cases · Go 1.23' },
    rust: { brute: 'ran here · 20,008 cases, not the five at n = 10⁵ · rustc 1.98', sweep: 'ran here · 20,013 cases · rustc 1.98' },
  },
  strip,
  draw,
  answer,
  vars,
  widget: mountSplitWidget,
});
