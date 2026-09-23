/* Single Number — LeetCode 136.
 *
 * The contrast worth seeing is not time — both approaches read the array once.
 * It is space. The tally keeps a row per distinct value, so the memory it needs
 * grows with the input; the XOR fold keeps one integer no matter how long the
 * array is, which is the only thing that satisfies the constant-space clause in
 * the statement. Watch the bits and the cancellation is visible: a value's
 * 1-bits flip those columns of the accumulator, and the second copy of that
 * value flips them straight back.
 */
import { mountLesson } from '../../lib/stepper.js';
import { pick, onLangChange } from '../../lib/i18n.js';
import { cells, kv, strip as bitRow, slots, stagePanel } from '../../lib/stage.js';

/* Every reader-facing sentence is a pair; `pick()` chooses the side. */
const t = (en, my) => ({ en, my });

/* Eight columns is enough to see a pattern and small enough to read, so the
 * input control holds values to 0..255. The solutions below are not limited
 * that way — XOR on negatives works fine in two's complement — but a stage
 * showing 32 columns teaches nothing. */
const BITS = 8;
const MAXV = (1 << BITS) - 1;

const bitsOf = (v) => Array.from({ length: BITS }, (_, i) => String((v >> (BITS - 1 - i)) & 1));

/* Columns the incoming value will act on: the ones where it holds a 1. */
const onesTone = (v) => {
  const o = {};
  bitsOf(v).forEach((b, i) => { if (b === '1') o[i] = 'warn'; });
  return o;
};

/* Columns that actually changed between two accumulator states. */
const flipTone = (before, after) => {
  const a = bitsOf(before);
  const o = {};
  bitsOf(after).forEach((bit, i) => { if (bit !== a[i]) o[i] = 'up'; });
  return o;
};

/* The premise is load-bearing: both approaches return nonsense on an array that
 * breaks it, so refuse the input instead. Returns the value that stands alone. */
function loneValue(nums) {
  if (!Array.isArray(nums) || !nums.length) throw new Error('nums needs at least one value');
  const counts = new Map();
  for (const v of nums) counts.set(v, (counts.get(v) ?? 0) + 1);

  const overcounted = [...counts].find(([, c]) => c > 2);
  if (overcounted) throw new Error(`${overcounted[0]} appears ${overcounted[1]} times — values may appear at most twice`);

  const alone = [...counts].filter(([, c]) => c === 1).map(([v]) => v);
  if (!alone.length) throw new Error('every value is paired — exactly one has to stand alone');
  if (alone.length > 1) throw new Error(`${alone.join(' and ')} each appear once — only one value may`);
  return alone[0];
}

/* ---------------- step generators ---------------- */

function buildCount({ nums }) {
  const answer = loneValue(nums);
  /* The premise forces an odd length, and exactly (n + 1) / 2 distinct values. */
  const distinct = (nums.length + 1) / 2;
  const steps = [];
  const counts = {};
  const firstSeen = new Map();

  steps.push({ line: 'init', i: null, counts: {}, answer: null,
    note: t('A tally keyed by value. This is the version to reach for first — it is obvious, it is hard to get wrong, and it answers a whole family of questions, not just this one.',
            'value ကို key ထားသော စာရင်း (tally) တစ်ခု။ ပထမဆုံး စဉ်းစားသင့်သည့် ပုံစံ ဖြစ်သည် — ရှင်းလင်းသည်၊ မှားရန် ခက်သည်၊ ဤမေးခွန်းတစ်ခုတည်း မဟုတ်ဘဲ ဆင်တူ မေးခွန်းအများအပြားကို ဖြေနိုင်သည်။') });

  for (let i = 0; i < nums.length; i++) {
    const v = nums[i];
    steps.push({ line: 'loop', i, counts: { ...counts }, answer: null, tag: t('read', 'ဖတ်'),
      note: t(`Index ${i} holds <b>${v}</b>.`, `index ${i} တွင် <b>${v}</b> ရှိသည်။`) });

    const seenBefore = firstSeen.has(v);
    counts[v] = (counts[v] ?? 0) + 1;
    if (!seenBefore) firstSeen.set(v, i);

    const rows = Object.keys(counts).length;
    steps.push({ line: 'tally', i, counts: { ...counts }, bump: String(v), answer: null, tag: t('tally', 'မှတ်'),
      note: seenBefore
        ? t(`<b>${v}</b> was already recorded at index ${firstSeen.get(v)}, so its count goes to 2. The row stays either way — a pair proves nothing until every value has been read.`,
            `<b>${v}</b> ကို index ${firstSeen.get(v)} တွင် မှတ်ပြီးသား ဖြစ်သဖြင့် count သည် 2 ဖြစ်သွားသည်။ row ကို မဖျက်ပါ — value အားလုံး မဖတ်ရသေးမီ အတွဲတစ်တွဲက ဘာမျှ သက်သေမပြပါ။`)
        : i === 0
          ? t(`<b>${v}</b> is new, so the table grows a row. A valid input of ${nums.length} values holds ${distinct} distinct ones, so this table is heading for ${distinct} rows — that is the memory the statement will not let us spend.`,
              `<b>${v}</b> သည် အသစ် ဖြစ်သဖြင့် table တွင် row တစ်ခု တိုးသည်။ value ${nums.length} ခုပါသော မှန်ကန်သည့် input တွင် မတူသော value ${distinct} ခု ရှိသဖြင့် ဤ table သည် row ${distinct} ခုအထိ ကြီးလာမည် — မေးခွန်းက ခွင့်မပြုသော memory ပင် ဖြစ်သည်။`)
          : t(`<b>${v}</b> is new: row ${rows} of the ${distinct} this input will need.`,
              `<b>${v}</b> သည် အသစ် — ဤ input လိုအပ်မည့် row ${distinct} ခုအနက် ${rows} ခုမြောက်။`) });
  }

  const keys = Object.keys(counts);
  for (const [n, key] of keys.entries()) {
    const c = counts[key];
    steps.push({ line: 'scan', i: null, counts: { ...counts }, look: key, answer: null, tag: t('scan', 'ရှာ'),
      note: n === 0
        ? t(`The array is read and nothing has been answered yet — a second pass over the ${keys.length} rows has to do it, starting at <b>${key}</b>. The order rows come back in is language-dependent (Go deliberately randomises it) and it does not matter here, since exactly one row holds a 1.`,
            `array ကို ဖတ်ပြီးပြီ၊ သို့သော် အဖြေ မရသေးပါ — row ${keys.length} ခုကို ဒုတိယအကြိမ် ဖြတ်ရမည်ဖြစ်ပြီး <b>${key}</b> မှ စသည်။ row များ ပြန်ထွက်လာသည့် အစီအစဉ်မှာ ဘာသာစကားပေါ် မူတည်သည် (Go က ရည်ရွယ်ချက်ရှိရှိ ကျပန်း ပြုလုပ်သည်)၊ row တစ်ခုတည်းတွင်သာ 1 ရှိသဖြင့် ဤနေရာတွင် အရေးမကြီးပါ။`)
        : t(`Next row: <b>${key}</b>.`, `နောက် row — <b>${key}</b>။`) });

    if (c !== 1) {
      steps.push({ line: 'check', i: null, counts: { ...counts }, look: key, reject: key, answer: null, tag: t('paired', 'အတွဲ'),
        note: t(`<b>${key}</b> was seen ${c} times, so its partner is in the array. Keep looking.`,
                `<b>${key}</b> ကို ${c} ကြိမ် တွေ့ခဲ့သဖြင့် ၎င်း၏ အဖော် array ထဲတွင် ရှိသည်။ ဆက်ရှာသည်။`) });
      continue;
    }
    steps.push({ line: 'check', i: null, counts: { ...counts }, look: key, answer: null, tag: t('alone', 'တစ်ခုတည်း'),
      note: t(`<b>${key}</b> was read exactly once out of ${nums.length} values. That is the one.`,
              `value ${nums.length} ခုအနက် <b>${key}</b> ကို တစ်ကြိမ်တည်းသာ ဖတ်ခဲ့ရသည်။ ၎င်းပင် ဖြစ်သည်။`) });
    steps.push({ line: 'hit', i: null, counts: { ...counts }, look: key, hit: key, answer, done: true, tag: t('return', 'return'),
      note: t(`Return <b>${answer}</b>. Linear in time and correct — and out of contention anyway: the table grew to ${keys.length} rows where the statement asks for constant extra space.`,
              `<b>${answer}</b> ကို ပြန်ပေးသည်။ အချိန် linear ဖြစ်ပြီး မှန်သည် — သို့သော် မေးခွန်းက constant အပို memory ကို တောင်းထားရာ table သည် row ${keys.length} ခုအထိ ကြီးလာခဲ့သဖြင့် လက်မခံနိုင်ပါ။`) });
    return steps;
  }

  return steps;
}

function buildXor({ nums }) {
  const answer = loneValue(nums);
  const steps = [];
  const firstSeen = new Map();
  let acc = 0;

  steps.push({ line: 'init', i: null, acc: 0, answer: null,
    note: t(`<b>acc</b> starts at 0, which is XOR's identity — <code>x ^ 0 == x</code> — so an empty fold changes nothing and every column below starts clear. One integer is the entire working memory.`,
            `<b>acc</b> ကို 0 ဖြင့် စသည် — XOR ၏ identity ဖြစ်သည် (<code>x ^ 0 == x</code>)။ ထို့ကြောင့် ဘာမျှ မ fold ရသေးလျှင် ဘာမျှ မပြောင်းပြီး အောက်ရှိ column တိုင်း 0 ဖြင့် စသည်။ integer တစ်ခုတည်းသည် အလုပ်လုပ်ရန် memory အားလုံး ဖြစ်သည်။`) });

  for (let i = 0; i < nums.length; i++) {
    const v = nums[i];
    const before = acc;
    const after = before ^ v;
    const marked = bitsOf(v).filter((b) => b === '1').length;

    const seenBefore = firstSeen.has(v);
    steps.push({ line: 'loop', i, acc: before, accBefore: before, value: v, folded: false, answer: null, tag: t('read', 'ဖတ်'),
      note: i === 0
        ? t(`Index 0 holds <b>${v}</b>. The columns where ${v} has a 1 are exactly the columns of <b>acc</b> that will flip; every other column is left alone.`,
            `index 0 တွင် <b>${v}</b> ရှိသည်။ ${v} တွင် 1 ရှိသော column များသည် <b>acc</b> ၏ ပြောင်းပြန်လှန်မည့် column များ အတိအကျ ဖြစ်သည်၊ ကျန် column များ မပြောင်းပါ။`)
        : seenBefore
          ? t(`Index ${i} holds <b>${v}</b> — its second copy.`, `index ${i} တွင် <b>${v}</b> ရှိသည် — ၎င်း၏ ဒုတိယ copy။`)
          : t(`Index ${i} holds <b>${v}</b>.`, `index ${i} တွင် <b>${v}</b> ရှိသည်။`) });
    steps.push({ line: 'fold', i, acc: after, accBefore: before, value: v, folded: true, answer: null, tag: t('xor', 'xor'),
      note: seenBefore
        ? t(`<b>${v}</b> went in at index ${firstSeen.get(v)}, and <code>x ^ x == 0</code>, so the columns it flipped then flip back now. <b>acc</b> is ${after}; no trace of ${v} is left in it.`,
            `<b>${v}</b> သည် index ${firstSeen.get(v)} တွင် ဝင်ခဲ့ပြီး <code>x ^ x == 0</code> ဖြစ်သဖြင့် ထိုစဉ်က လှန်ခဲ့သော column များ ယခု ပြန်လှန်သွားသည်။ <b>acc</b> သည် ${after} ဖြစ်ပြီး ${v} ၏ အရိပ်အယောင် မကျန်တော့ပါ။`)
        : i === 0
          ? t(`<b>acc</b> was 0, so it is now ${v} itself — that is <code>x ^ 0 == x</code>.`,
              `<b>acc</b> သည် 0 ဖြစ်ခဲ့သဖြင့် ယခု ${v} ကိုယ်တိုင် ဖြစ်သွားသည် — <code>x ^ 0 == x</code> ပင်။`)
          : t(`The first <b>${v}</b>, so nothing cancels: ${marked === 1 ? 'its one set column flips' : `its ${marked} set columns flip`}, and <b>acc</b> is ${after}.`,
              `ပထမဆုံး <b>${v}</b> ဖြစ်သဖြင့် ဘာမျှ မချေဖျက်ပါ — ၎င်း၏ 1 ရှိသော column ${marked} ခု လှန်သွားပြီး <b>acc</b> သည် ${after} ဖြစ်သည်။`) });

    if (!seenBefore) firstSeen.set(v, i);
    acc = after;
  }

  steps.push({ line: 'ret', i: null, acc, answer, done: true, tag: t('return', 'return'),
    note: t(`Return <b>${answer}</b>. Every column was flipped once per occurrence, so a column survives only if some value set it an odd number of times — and only <b>${answer}</b> occurred an odd number of times. Two locals, no table.`,
            `<b>${answer}</b> ကို ပြန်ပေးသည်။ column တိုင်းကို တွေ့ရသည့် အကြိမ်တိုင်း တစ်ခါ လှန်ခဲ့သဖြင့် မကိန်းအကြိမ် လှန်ခံရသော column သာ ကျန်သည် — မကိန်းအကြိမ် ပါဝင်သည်မှာ <b>${answer}</b> တစ်ခုတည်း ဖြစ်သည်။ local variable နှစ်ခု၊ table မရှိ။`) });

  return steps;
}

/* ---------------- drawing ----------------
 *
 * The array lives in the strip card, as on x-sum. The stage holds what the
 * approach carries between steps: for counting, the table itself; for XOR,
 * one integer — drawn as its bits, three rows stacked so column 3 of one row
 * lines up with column 3 of the next, which is where a pair visibly cancels.
 */

function strip(s, { nums }) {
  const tone = {};
  const marks = {};
  if (s.i != null) {
    for (let j = 0; j < s.i; j++) tone[j] = 'done';
    tone[s.i] = 'inwin';
    marks[s.i] = 'v';
  } else if (s.counts !== undefined && s.look != null) {
    nums.forEach((v, j) => { if (String(v) === s.look) tone[j] = s.reject ? 'leaving' : 'inwin'; });
  }
  if (s.done) {
    nums.forEach((_, j) => { tone[j] = 'done'; });
    tone[nums.indexOf(s.answer)] = 'entering';
  }
  return cells(nums, { tone, marks });
}

function draw(s) {
  if (s.counts !== undefined) {
    const kvTone = {};
    if (s.hit) kvTone[s.hit] = 'up';
    else if (s.reject) kvTone[s.reject] = 'warn';
    else if (s.bump) kvTone[s.bump] = 'warn';
    const rows = Object.keys(s.counts).length;
    return stagePanel(
      pick(t('counts — value → times seen', 'counts — value → တွေ့သည့် အကြိမ်')),
      pick(t(`${rows} row${rows === 1 ? '' : 's'}`, `row ${rows} ခု`)),
      kv(s.counts, { at: s.look ?? null, tone: kvTone, keyName: 'value', valName: 'seen' }),
    );
  }
  const title = pick(t('acc — one integer, drawn as its bits', 'acc — integer တစ်ခု၊ bit များအဖြစ် ပြထားသည်'));
  if (s.value == null) {
    return stagePanel(title, `acc = ${s.acc}`,
      bitRow(bitsOf(s.acc), { index: false, tone: s.done ? onesTone(s.acc) : {}, label: `acc = ${s.acc}` }));
  }
  const pending = bitRow(Array(BITS).fill('·'), { index: false, label: 'acc ^ v = ?' });
  const result = bitRow(bitsOf(s.acc), { index: false, tone: flipTone(s.accBefore, s.acc), label: `acc ^ ${s.value} = ${s.acc}` });
  return stagePanel(title, `acc = ${s.folded ? s.acc : s.accBefore}`,
    bitRow(bitsOf(s.accBefore), { index: false, label: `acc = ${s.accBefore}` })
    + bitRow(bitsOf(s.value), { index: false, tone: onesTone(s.value), label: `v = nums[${s.i}] = ${s.value}` })
    + (s.folded ? result : pending));
}

function answer(s) {
  return {
    html: slots(s.done ? [s.answer] : [], { total: 1, just: s.done ? 0 : -1 }),
    note: s.done ? t('the single one', 'တစ်ခုတည်းသော value') : t('one value', 'value တစ်ခု'),
  };
}

function vars(s, input) {
  const v = s.i != null ? input.nums[s.i] : '—';
  if (s.counts !== undefined) {
    const map = `{${Object.entries(s.counts).map(([k, c]) => `${k}: ${c}`).join(', ')}}`;
    return [['v', v], ['counts', map],
            ['value', s.look ?? '—'], ['seen', s.look != null ? s.counts[s.look] : '—']];
  }
  return [['v', v], ['acc', `${s.acc} (${bitsOf(s.acc).join('')})`]];
}

/* ---------------- the code, one key per line ---------------- */

const c = (t) => `<span class="c">${t}</span>`;
const k = (t) => `<span class="k">${t}</span>`;

const CODE = {
  count: {
    ruby: [
      [null, `${k('def')} single_number(nums)`],
      ['init', `  counts = Hash.new(0)              ${c('# value => times seen')}`],
      ['loop', `  nums.each ${k('do')} |v|`],
      ['tally', `    counts[v] += 1`],
      [null, `  ${k('end')}`],
      ['scan', `  counts.each ${k('do')} |value, seen|`],
      ['check', `    ${k('next')} ${k('unless')} seen == 1`],
      ['hit', `    ${k('return')} value`],
      [null, `  ${k('end')}`],
      [null, `  0                                 ${c('# unreachable: the premise guarantees one')}`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} singleNumber(self, nums):`],
      ['init', `        counts = {}                   ${c('# value -> times seen')}`],
      ['loop', `        ${k('for')} v ${k('in')} nums:`],
      ['tally', `            counts[v] = counts.get(v, 0) + 1`],
      ['scan', `        ${k('for')} value, seen ${k('in')} counts.items():`],
      ['check', `            ${k('if')} seen != 1:`],
      [null, `                ${k('continue')}`],
      ['hit', `            ${k('return')} value`],
      [null, `        ${k('return')} 0                  ${c('# unreachable')}`],
    ],
    javascript: [
      [null, `${k('const')} singleNumber = ${k('function')} (nums) {`],
      ['init', `  ${k('const')} counts = ${k('new')} Map();         ${c('// value -> times seen')}`],
      ['loop', `  ${k('for')} (${k('const')} v ${k('of')} nums) {`],
      ['tally', `    counts.set(v, (counts.get(v) ?? 0) + 1);`],
      [null, `  }`],
      ['scan', `  ${k('for')} (${k('const')} [value, seen] ${k('of')} counts) {`],
      ['check', `    ${k('if')} (seen !== 1) ${k('continue')};`],
      ['hit', `    ${k('return')} value;`],
      [null, `  }`],
      [null, `  ${k('return')} 0;                        ${c('// unreachable')}`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} singleNumber(nums []${k('int')}) ${k('int')} {`],
      ['init', `    counts := ${k('make')}(${k('map')}[${k('int')}]${k('int')})       ${c('// value -> times seen')}`],
      ['loop', `    ${k('for')} _, v := ${k('range')} nums {`],
      ['tally', `        counts[v]++`],
      [null, `    }`],
      ['scan', `    ${k('for')} value, seen := ${k('range')} counts {`],
      ['check', `        ${k('if')} seen != 1 {`],
      [null, `            ${k('continue')}`],
      [null, `        }`],
      ['hit', `        ${k('return')} value`],
      [null, `    }`],
      [null, `    ${k('return')} 0                       ${c('// unreachable')}`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('use')} std::collections::HashMap;`],
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} single_number(nums: Vec&lt;i32&gt;) -&gt; i32 {`],
      ['init', `        ${k('let')} ${k('mut')} counts: HashMap&lt;i32, i32&gt; = HashMap::new();`],
      ['loop', `        ${k('for')} &amp;v ${k('in')} nums.iter() {`],
      ['tally', `            *counts.entry(v).or_insert(0) += 1;`],
      [null, `        }`],
      ['scan', `        ${k('for')} (&amp;value, &amp;seen) ${k('in')} counts.iter() {`],
      ['check', `            ${k('if')} seen != 1 { ${k('continue')}; }`],
      ['hit', `            ${k('return')} value;`],
      [null, `        }`],
      [null, `        0                             ${c('// unreachable')}`],
      [null, `    }`],
      [null, `}`],
    ],
  },
  xor: {
    ruby: [
      [null, `${k('def')} single_number(nums)`],
      ['init', `  acc = 0                           ${c('# 0 is the identity: x ^ 0 == x')}`],
      ['loop', `  nums.each ${k('do')} |v|`],
      ['fold', `    acc ^= v`],
      [null, `  ${k('end')}`],
      ['ret', `  acc`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} singleNumber(self, nums):`],
      ['init', `        acc = 0                       ${c('# 0 is the identity: x ^ 0 == x')}`],
      ['loop', `        ${k('for')} v ${k('in')} nums:`],
      ['fold', `            acc ^= v`],
      ['ret', `        ${k('return')} acc`],
    ],
    javascript: [
      [null, `${k('const')} singleNumber = ${k('function')} (nums) {`],
      ['init', `  ${k('let')} acc = 0;                    ${c('// 0 is the identity: x ^ 0 === x')}`],
      ['loop', `  ${k('for')} (${k('const')} v ${k('of')} nums) {`],
      ['fold', `    acc ^= v;`],
      [null, `  }`],
      ['ret', `  ${k('return')} acc;`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} singleNumber(nums []${k('int')}) ${k('int')} {`],
      ['init', `    acc := 0                          ${c('// 0 is the identity: x ^ 0 == x')}`],
      ['loop', `    ${k('for')} _, v := ${k('range')} nums {`],
      ['fold', `        acc ^= v`],
      [null, `    }`],
      ['ret', `    ${k('return')} acc`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} single_number(nums: Vec&lt;i32&gt;) -&gt; i32 {`],
      ['init', `        ${k('let')} ${k('mut')} acc = 0;             ${c('// 0 is the identity: x ^ 0 == x')}`],
      ['loop', `        ${k('for')} &amp;v ${k('in')} nums.iter() {`],
      ['fold', `            acc ^= v;`],
      [null, `        }`],
      ['ret', `        acc`],
      [null, `    }`],
      [null, `}`],
    ],
  },
};

/* ---------------- part 1: the "pairs erase themselves" widget ----------------
 *
 * The statement hinges on its premise — every value but one comes in a pair —
 * and on what that premise lets you throw away: the order. Drag through the
 * array and XOR as you go; a value's second copy wipes out its first no matter
 * how far apart they sit, so what is left at the end is the loner.
 *
 * Built from x-sum's widget vocabulary: .q-arr cells (kept / cut), the
 * .q-slider, the amber .q-tie line and the .ledger.
 */

const QW_SETS = [
  { label: t('example 2', 'ဥပမာ ၂'), nums: [4, 1, 2, 1, 2] },
  { label: t('example 1', 'ဥပမာ ၁'), nums: [2, 2, 1] },
  { label: t('far apart', 'ဝေးဝေး'), nums: [5, 9, 3, 7, 3, 9, 5] },
  { label: t('shared bits', 'bit တူ'), nums: [6, 3, 5, 6, 3] },
];

function mountFoldWidget(host) {
  const state = { set: 0, k: 0 };
  const nums = () => QW_SETS[state.set].nums;

  host.innerHTML = `
    <div class="q-arr" data-arr></div>
    <div class="q-slider">
      <label for="qw-k" data-lbl></label>
      <input type="range" id="qw-k" min="0" max="5" value="0">
      <output data-out>0</output>
      <span class="q-presets" data-presets></span>
    </div>
    <p class="q-tie" data-line></p>
    <div class="ledger">
      <span class="expr" data-expr></span>
      <span class="total" data-total></span>
    </div>`;

  const q = (sel) => host.querySelector(sel);

  function render() {
    const a = nums();
    const k = Math.min(state.k, a.length);
    const seen = new Map();
    a.slice(0, k).forEach((v) => seen.set(v, (seen.get(v) ?? 0) + 1));
    const acc = a.slice(0, k).reduce((x, v) => x ^ v, 0);

    q('[data-lbl]').textContent = pick(t('folded', 'fold ပြီး'));
    const slider = q('#qw-k');
    slider.max = String(a.length);
    slider.value = String(k);
    q('[data-out]').textContent = String(k);
    q('[data-presets]').innerHTML = QW_SETS.map((x, i) =>
      `<button class="chip" data-set="${i}"${i === state.set ? ' aria-pressed="true"' : ''}>${pick(x.label)}</button>`).join('');

    // kept = folded in and still in acc · cut = folded in twice, so erased ·
    // plain = not folded yet
    q('[data-arr]').innerHTML = a.map((v, j) => {
      const cls = j >= k ? '' : seen.get(v) === 2 ? 'cut' : 'kept';
      return `<div class="cell ${cls}"><span>${v}</span><span class="idx">${j}</span></div>`;
    }).join('');

    const label = document.getElementById('q-label');
    if (label) label.textContent = pick(t(`${a.length} values`, `value ${a.length} ခု`));

    const live = [...seen].filter(([, c]) => c === 1).map(([v]) => v);
    let line;
    if (k === 0) {
      line = t('acc = 0. Drag right to fold values in with ^.', 'acc = 0။ ညာဘက်သို့ ဆွဲပြီး value များကို ^ ဖြင့် fold လုပ်ပါ။');
    } else {
      const v = a[k - 1];
      const again = seen.get(v) === 2;
      const tail = k === a.length
        ? t(` Every pair has erased itself, so acc is the single one: ${acc}.`, ` အတွဲတိုင်း ကိုယ့်ကိုယ်ကို ဖျက်ပြီးပြီ၊ ထို့ကြောင့် acc သည် တစ်ခုတည်းသော value ${acc} ဖြစ်သည်။`)
        : t(` acc = ${acc} holds {${live.join(', ')}} — whatever is still unpaired.`, ` acc = ${acc} တွင် {${live.join(', ')}} ရှိသည် — အတွဲ မရသေးသမျှ။`);
      line = again
        ? t(`${v} ^ ${v} = 0: the second ${v} cancels the first, however far back it was.${tail.en}`,
            `${v} ^ ${v} = 0 — ဒုတိယ ${v} က ပထမ ${v} ကို ချေဖျက်သည်၊ မည်မျှ ဝေးဝေး။${tail.my}`)
        : t(`${v} goes in for the first time.${tail.en}`, `${v} ပထမဆုံး ဝင်သည်။${tail.my}`);
    }
    q('[data-line]').innerHTML = pick(line);

    // the ledger is a formula, as on x-sum
    q('[data-expr]').innerHTML = k ? `${a.slice(0, k).join(' ^ ')} = ${acc} &nbsp;·&nbsp; ${bitsOf(acc).join('')}` : 'acc = 0';
    q('[data-total]').innerHTML = `${acc}<small>acc</small>`;
  }

  host.addEventListener('input', (ev) => {
    if (ev.target.id !== 'qw-k') return;
    state.k = Number(ev.target.value); render();
  });
  host.addEventListener('click', (ev) => {
    const chip = ev.target.closest('[data-set]');
    if (!chip) return;
    state.set = Number(chip.dataset.set);
    state.k = 0;
    render();
  });
  onLangChange(render);
  render();
}

/* ---------------- mount ----------------
 *
 * Last in the file on purpose: mountLesson runs the widget immediately, so
 * every const the widget reads must already be initialised. */

const ex = (n) => t(`Example ${n}`, `ဥပမာ ${n}`);

mountLesson({
  input: { nums: [4, 1, 2, 1, 2] },
  controls: [
    { key: 'nums', label: 'nums', value: '4, 1, 2, 1, 2',
      parse: (v) => {
        const parts = v.split(',').map((x) => x.trim());
        if (parts.some((p) => p === '')) throw new Error('a value is missing');
        const nums = parts.map(Number);
        if (!nums.every(Number.isInteger)) throw new Error('whole numbers only');
        if (nums.some((x) => x < 0 || x > MAXV)) throw new Error(`keep values 0..${MAXV} so ${BITS} bits stay readable`);
        if (nums.length > 13) throw new Error('at most 13 values — trimming one would break the pairing');
        loneValue(nums);
        return nums;
      } },
  ],
  presets: [
    { label: ex(1), input: { nums: [2, 2, 1] } },
    { label: ex(2), input: { nums: [4, 1, 2, 1, 2] } },
    { label: ex(3), input: { nums: [1] } },
    { label: t('Loner last', 'နောက်ဆုံးမှ တစ်ခုတည်း'), input: { nums: [7, 12, 7, 200, 12, 200, 9] } },
  ],
  examples: [
    { title: ex(1), inputHtml: '<code>nums = [2,2,1]</code>', output: '1',
      why: [t('<code>2</code> appears twice, <code>1</code> once. As XOR: <code>2 ^ 2 ^ 1 = 0 ^ 1 = 1</code>.',
              '<code>2</code> နှစ်ကြိမ်၊ <code>1</code> တစ်ကြိမ် ပါသည်။ XOR ဖြင့် — <code>2 ^ 2 ^ 1 = 0 ^ 1 = 1</code>။')],
      load: { nums: [2, 2, 1] } },
    { title: ex(2), inputHtml: '<code>nums = [4,1,2,1,2]</code>', output: '4',
      why: [t('The pairs are not next to each other, and it does not matter: XOR is order-free, so <code>4 ^ 1 ^ 2 ^ 1 ^ 2 = 4 ^ (1 ^ 1) ^ (2 ^ 2) = 4</code>.',
              'အတွဲများ ဘေးချင်းကပ် မဟုတ်ပါ၊ သို့သော် အရေးမကြီးပါ — XOR သည် အစီအစဉ်ပေါ် မမူတည်သဖြင့် <code>4 ^ 1 ^ 2 ^ 1 ^ 2 = 4 ^ (1 ^ 1) ^ (2 ^ 2) = 4</code>။')],
      load: { nums: [4, 1, 2, 1, 2] } },
    { title: ex(3), inputHtml: '<code>nums = [1]</code>', output: '1',
      why: [t('No pairs at all. The only value is the single one — and <code>0 ^ 1 = 1</code>, so a fold starting at 0 returns it unchanged.',
              'အတွဲ လုံးဝ မရှိပါ။ တစ်ခုတည်းသော value ပင် အဖြေ ဖြစ်သည် — <code>0 ^ 1 = 1</code> ဖြစ်သဖြင့် 0 မှ စသော fold က ၎င်းကို မပြောင်းဘဲ ပြန်ပေးသည်။')],
      load: { nums: [1] } },
  ],
  modes: [
    { id: 'count', name: 'Count them',
      desc: t('Tally every value, then find the one seen once.', 'value တိုင်းကို ရေတွက်ပြီး တစ်ကြိမ်သာ တွေ့သည့်တစ်ခုကို ရှာသည်။'),
      cost: 'O(n) time · O(n) space', build: buildCount },
    { id: 'xor', name: 'XOR fold',
      desc: t('Pairs cancel; the single one is what is left.', 'အတွဲများ ချေဖျက်သွားပြီး တစ်ခုတည်းသော value ကျန်ရစ်သည်။'),
      cost: 'O(n) time · O(1) space', build: buildXor },
  ],
  languages: [
    { id: 'ruby', name: 'Ruby' }, { id: 'python', name: 'Python' },
    { id: 'javascript', name: 'JavaScript' }, { id: 'go', name: 'Go' }, { id: 'rust', name: 'Rust' },
  ],
  code: CODE,
  solutions: {
    count: { desc: t('What to write first: obvious, hard to get wrong, and it survives a change to the premise. It fails only the constant-space clause — the table grows to about <code>n/2</code> rows.',
                     'ပထမဆုံး ရေးသင့်သည်မှာ ဤပုံစံ — ရှင်းလင်းသည်၊ မှားရန်ခက်သည်၊ premise ပြောင်းသွားလည်း အလုပ်လုပ်ဆဲ။ constant-space စည်းကမ်းတစ်ခုတည်းကိုသာ မကိုက်ပါ — table သည် row <code>n/2</code> ခုခန့်အထိ ကြီးလာသည်။') },
    xor: { desc: t('The submission the statement asks for: one integer, one pass. It never counts anything — only whether each bit was set an odd number of times.',
                   'မေးခွန်း တောင်းထားသည့် submission — integer တစ်ခု၊ တစ်ခေါက်တည်း။ ဘာမျှ မရေတွက်ပါ — bit တစ်ခုစီကို မကိန်းအကြိမ် set လုပ်ခဲ့သလား ဆိုသည်ကိုသာ သိသည်။') },
  },
  // How each language was actually checked. Printed as a badge on every
  // listing in part 3. The corpus: the 3 examples, 4 edges, 15,000 arrays of
  // up to 13 values drawn from -4..4, 5,000 of up to 41 values over the full
  // ±3 × 10⁴ range, and three at n = 29,999 — checked against a Counter in
  // Python. Go and Rust ran in Docker (golang:1.23-alpine, rust:1-slim).
  verification: {
    ruby: 'ran here · 20,010 cases vs a Counter',
    python: 'ran here · 20,010 cases vs a Counter',
    javascript: 'ran here · 20,010 cases vs a Counter',
    go: 'ran here · 20,010 cases · Go 1.23',
    rust: 'ran here · 20,010 cases · rustc 1.98',
  },
  strip,
  draw,
  answer,
  vars,
  widget: mountFoldWidget,
});
