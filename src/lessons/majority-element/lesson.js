/* Majority Element — LeetCode 169.
 *
 * A value that fills more than half the array survives any pairing-off
 * against the others: each other value can cancel at most one copy of it, and
 * there are not enough others to go round. The count map doesn't need that
 * idea; it tallies everything and stops once one tally passes half. The vote
 * is that idea as an algorithm: one candidate and one counter, where a vote
 * for the candidate stacks up and any other vote cancels one. The memory
 * difference is the whole contrast: up to n/2 rows against two integers.
 */
import { mountLesson } from '../../lib/stepper.js';
import { pick, onLangChange } from '../../lib/i18n.js';
import { cells, kv, stack, readout, slots, stagePanel } from '../../lib/stage.js';
import { t, exampleTitle, LANGUAGES, k, c, stageGap } from '../../lib/kit.js';

const MAX_LEN = 15;

/* The premise is load-bearing — the vote returns a wrong answer without it —
 * so refuse an input that has no majority. Returns the majority value. */
function majorityOf(nums) {
  if (!Array.isArray(nums) || !nums.length) throw new Error('nums needs at least one value');
  const counts = new Map();
  for (const v of nums) counts.set(v, (counts.get(v) ?? 0) + 1);
  const half = Math.floor(nums.length / 2);
  const m = [...counts].find(([, n]) => n > half);
  if (!m) throw new Error(`no value appears more than ⌊${nums.length}/2⌋ = ${half} times — the statement guarantees one does`);
  return m[0];
}

function parseNums(text) {
  const s = text.trim().replace(/^\[|\]$/g, '').trim();
  const nums = s ? s.split(',').map((x) => {
    const v = x.trim();
    const n = Number(v);
    if (v === '' || !Number.isInteger(n)) throw new Error('integers, separated by commas');
    return n;
  }) : [];
  if (nums.length > MAX_LEN) throw new Error(`at most ${MAX_LEN} values, so the stage stays readable`);
  majorityOf(nums);
  return nums;
}

/* ---------------- step generators ---------------- */

function buildCount({ nums }) {
  majorityOf(nums);
  const half = Math.floor(nums.length / 2);
  const steps = [];
  const counts = {};
  const snap = (extra) => ({ view: 'count', counts: { ...counts }, half, i: null, ...extra });

  steps.push(snap({ line: 'init', tag: t('empty map', 'map ဗလာ'),
    note: t(`A tally keyed by value. There are ${nums.length} values, so a majority needs more than ⌊${nums.length}/2⌋ = <b>${half}</b> of them.`,
            `value ကို key ထားသော tally တစ်ခု။ value ${nums.length} ခု ရှိသဖြင့် majority သည် ⌊${nums.length}/2⌋ = <b>${half}</b> ထက် ပိုရမည်။`) }));

  for (let i = 0; i < nums.length; i++) {
    const x = nums[i];
    steps.push(snap({ line: 'loop', i, tag: t('read', 'ဖတ်'),
      note: t(`Index ${i} holds <b>${x}</b>.`, `index ${i} တွင် <b>${x}</b> ရှိသည်။`) }));
    const isNew = counts[x] == null;
    counts[x] = (counts[x] ?? 0) + 1;
    steps.push(snap({ line: 'tally', i, bump: String(x), tag: t(`${x}: ${counts[x]}`, `${x}: ${counts[x]}`),
      note: isNew
        ? t(`<b>${x}</b> is new — the map grows to ${Object.keys(counts).length} ${Object.keys(counts).length === 1 ? 'row' : 'rows'}.`,
            `<b>${x}</b> သည် အသစ် — map သည် row ${Object.keys(counts).length} ခု ဖြစ်လာသည်။`)
        : t(`<b>${x}</b> again: its count goes to ${counts[x]}.`, `<b>${x}</b> ထပ်တွေ့သည် — count သည် ${counts[x]} ဖြစ်လာသည်။`) }));
    if (counts[x] > half) {
      steps.push(snap({ line: 'check', i, hit: String(x), finished: true, answer: x, tag: t(`return ${x}`, `${x} ပြန်`),
        note: t(`${counts[x]} &gt; ${half}: <b>${x}</b> fills more than half the array, and no other value can — there is not enough array left over. Return it${i < nums.length - 1 ? `, without reading the last ${nums.length - 1 - i}` : ''}.`,
                `${counts[x]} &gt; ${half} — <b>${x}</b> သည် array ၏ တစ်ဝက်ကျော်ကို ယူထားပြီး အခြား value တစ်ခုမျှ ထိုသို့ မဖြစ်နိုင်ပါ — ကျန်သော array မလောက်ပါ။ ${i < nums.length - 1 ? `နောက်ဆုံး ${nums.length - 1 - i} ခုကို မဖတ်ဘဲ ` : ''}၎င်းကို ပြန်ပေးသည်။`) }));
      return steps;
    }
    steps.push(snap({ line: 'check', i, miss: String(x), tag: t(`${counts[x]} ≤ ${half}`, `${counts[x]} ≤ ${half}`),
      note: t(`${counts[x]} is not more than ${half}, so <b>${x}</b> is not proven yet. Keep reading.`,
              `${counts[x]} သည် ${half} ထက် မပိုသဖြင့် <b>${x}</b> ကို မသက်သေပြရသေးပါ။ ဆက်ဖတ်သည်။`) }));
  }
  return steps;
}

function buildVote({ nums }) {
  majorityOf(nums);
  const steps = [];
  let candidate = null;
  let count = 0;
  const standing = [];      // indices of the votes still uncancelled
  const pairs = [];         // [earlier index, later index] of each cancelled pair
  const snap = (extra) => ({
    view: 'vote', candidate, count, standing: [...standing], pairs: pairs.map((p) => [...p]), i: null, ...extra,
  });

  steps.push(snap({ line: 'init', tag: t('count = 0', 'count = 0'),
    note: t('No candidate, and a count of 0. The count is how many votes for the candidate are still standing — uncancelled by a vote for something else.',
            'candidate မရှိ၊ count 0။ count သည် candidate အတွက် မဖျက်ရသေးသော မဲ — အခြားတစ်ခုအတွက် မဲက မချေဖျက်ရသေးသော မဲ — အရေအတွက် ဖြစ်သည်။') }));

  for (let i = 0; i < nums.length; i++) {
    const x = nums[i];
    steps.push(snap({ line: 'loop', i, tag: t('read', 'ဖတ်'),
      note: t(`Index ${i} holds <b>${x}</b>.`, `index ${i} တွင် <b>${x}</b> ရှိသည်။`) }));
    if (count === 0) {
      const was = candidate;
      candidate = x;
      steps.push(snap({ line: 'pick', i, picked: true, tag: t(`candidate ${x}`, `candidate ${x}`),
        note: i === 0
          ? t(`The count is 0, so <b>${x}</b> becomes the candidate.`, `count သည် 0 ဖြစ်သဖြင့် <b>${x}</b> သည် candidate ဖြစ်လာသည်။`)
          : t(`The count is 0: everything before index ${i} has cancelled out in pairs of different values. Throwing away pairs like that cannot remove a majority, so start over with <b>${x}</b>${was === x ? ' — the same value as before' : ''}.`,
              `count သည် 0 — index ${i} မတိုင်မီ အရာအားလုံးသည် မတူသော value အတွဲများဖြင့် ချေဖျက်ပြီး ဖြစ်သည်။ ထိုသို့ အတွဲများ ပစ်ခြင်းက majority ကို မဖယ်ရှားနိုင်သဖြင့် <b>${x}</b> ဖြင့် အသစ် စသည်${was === x ? ' — ယခင် value တူတူ' : ''}။`) }));
    } else {
      steps.push(snap({ line: 'pick', i, tag: t('keep', 'ဆက်ထား'),
        note: t(`The count is ${count}, not 0, so <b>${candidate}</b> stays the candidate.`,
                `count သည် 0 မဟုတ်ဘဲ ${count} ဖြစ်သဖြင့် <b>${candidate}</b> သည် candidate အဖြစ် ဆက်ရှိသည်။`) }));
    }
    if (x === candidate) {
      count += 1;
      standing.push(i);
      steps.push(snap({ line: 'vote', i, voted: 'for', tag: t('+1', '+1'),
        note: t(`<b>${x}</b> votes for the candidate: count ${count}.`, `<b>${x}</b> သည် candidate ကို မဲပေးသည် — count ${count}။`) }));
    } else {
      count -= 1;
      const j = standing.pop();
      pairs.push([j, i]);
      steps.push(snap({ line: 'vote', i, voted: 'against', tag: t('−1', '−1'),
        note: t(`<b>${x}</b> is not ${candidate}, so it cancels one of ${candidate}'s votes — the one from index ${j}. Both leave play: count ${count}.`,
                `<b>${x}</b> သည် ${candidate} မဟုတ်သဖြင့် ${candidate} ၏ မဲတစ်ခု — index ${j} မှ မဲ — ကို ချေဖျက်သည်။ နှစ်ခုလုံး ထွက်သွားသည် — count ${count}။`) }));
    }
  }
  steps.push(snap({ line: 'ret', finished: true, answer: candidate, tag: t(`return ${candidate}`, `${candidate} ပြန်`),
    note: t(`Return <b>${candidate}</b>. ${pairs.length} ${pairs.length === 1 ? 'pair' : 'pairs'} of different values cancelled; what is left standing is ${count} ${count === 1 ? 'vote' : 'votes'} for ${candidate}. Only a majority can be sure to survive — which is why the guarantee in the statement matters.`,
            `<b>${candidate}</b> ကို ပြန်ပေးသည်။ မတူသော value အတွဲ ${pairs.length} တွဲ ချေဖျက်ခဲ့ပြီး ကျန်နေသည်မှာ ${candidate} အတွက် မဲ ${count} ခု ဖြစ်သည်။ majority တစ်ခုသာ သေချာပေါက် ကျန်ရစ်နိုင်သည် — ထို့ကြောင့် မေးခွန်းပါ အာမခံချက်က အရေးကြီးသည်။`) }));
  return steps;
}

/* ---------------- drawing ----------------
 *
 * The array lives in the strip card. The stage holds what each approach
 * carries: the whole tally, or one candidate whose uncancelled votes are drawn
 * as a stack — a vote for it pushes, any other vote pops one off.
 */

function strip(s, { nums }) {
  const tone = {};
  const marks = {};
  if (s.view === 'count') {
    const upto = s.i ?? -1;
    for (let j = 0; j < upto; j++) tone[j] = 'done';
    if (s.i != null) { tone[s.i] = s.finished ? 'entering' : 'inwin'; marks[s.i] = 'x'; }
    if (s.finished) nums.forEach((v, j) => { if (v === s.answer && j <= s.i) tone[j] = 'entering'; });
    return cells(nums, { tone, marks });
  }
  for (const [a, b] of s.pairs) { tone[a] = 'leaving'; tone[b] = 'leaving'; }
  for (const j of s.standing) tone[j] = 'entering';
  if (s.i != null && s.line === 'loop') tone[s.i] = 'inwin';
  if (s.i != null) marks[s.i] = 'x';
  return cells(nums, { tone, marks });
}

function draw(s) {
  if (s.view === 'count') {
    const tone = {};
    if (s.hit) tone[s.hit] = 'up';
    else if (s.miss) tone[s.miss] = 'warn';
    else if (s.bump) tone[s.bump] = 'warn';
    const rows = Object.keys(s.counts).length;
    return stagePanel(pick(t('counts — value → times seen', 'counts — value → တွေ့သည့် အကြိမ်')),
      pick(t(`${rows} row${rows === 1 ? '' : 's'}`, `row ${rows} ခု`)),
      kv(s.counts, { at: s.bump ?? s.hit ?? s.miss ?? null, tone, keyName: 'value', valName: 'seen' })
        + stageGap + readout({ 'needs more than': s.half }));
  }
  const votes = Array.from({ length: s.count }, () => s.candidate);
  return stagePanel(pick(t('The candidate\'s standing votes', 'candidate ၏ ကျန်နေသော မဲများ')),
    pick(t(`${s.pairs.length} pair${s.pairs.length === 1 ? '' : 's'} cancelled`, `အတွဲ ${s.pairs.length} တွဲ ချေဖျက်ပြီး`)),
    stack(votes, { label: 'votes for the candidate' })
      + stageGap + readout({ candidate: s.candidate ?? '—', count: s.count }));
}

function answer(s) {
  return {
    html: slots(s.finished ? [s.answer] : [], { total: 1, just: s.finished ? 0 : -1 }),
    note: s.finished ? t('the majority element', 'majority element') : t('one value', 'value တစ်ခု'),
  };
}

function vars(s, { nums }) {
  const x = s.i == null ? '—' : nums[s.i];
  if (s.view === 'count') {
    return [['x', x], ['counts', `{${Object.entries(s.counts).map(([key, v]) => `${key}: ${v}`).join(', ')}}`], ['seen', s.i == null ? '—' : s.counts[nums[s.i]] ?? '—']];
  }
  return [['x', x], ['candidate', s.candidate ?? '—'], ['count', s.count]];
}

/* ---------------- the code, one key per line ----------------
 *
 * Generated from the verified solution files, so the listing a reader copies
 * is byte-identical to the one that ran. */

const CODE = {
  count: {
    ruby: [
      [null, `${k('def')} majority_element(nums)`],
      ['init', `  counts = Hash.new(0)                      ${c('# value -&gt; times seen')}`],
      ['loop', `  nums.each ${k('do')} |x|`],
      ['tally', `    counts[x] += 1`],
      ['check', `    ${k('return')} x ${k('if')} counts[x] &gt; nums.size / 2   ${c('# past half: nothing can catch it')}`],
      [null, `  ${k('end')}`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} majorityElement(self, nums):`],
      ['init', `        counts = {}                          ${c('# value -&gt; times seen')}`],
      ['loop', `        ${k('for')} x ${k('in')} nums:`],
      ['tally', `            counts[x] = counts.get(x, 0) + 1`],
      ['check', `            ${k('if')} counts[x] &gt; len(nums) // 2:   ${c('# past half: nothing can catch it')}`],
      [null, `                ${k('return')} x`],
    ],
    javascript: [
      [null, `${k('var')} majorityElement = ${k('function')} (nums) {`],
      ['init', `  ${k('const')} counts = ${k('new')} Map();                  ${c('// value -&gt; times seen')}`],
      ['loop', `  ${k('for')} (${k('const')} x ${k('of')} nums) {`],
      ['tally', `    counts.set(x, (counts.get(x) ?? 0) + 1);`],
      ['check', `    ${k('if')} (counts.get(x) &gt; Math.floor(nums.length / 2)) ${k('return')} x; ${c('// past half')}`],
      [null, `  }`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} majorityElement(nums []int) int {`],
      ['init', `    counts := map[int]int{}                  ${c('// value -&gt; times seen')}`],
      ['loop', `    ${k('for')} _, x := ${k('range')} nums {`],
      ['tally', `        counts[x]++`],
      ['check', `        ${k('if')} counts[x] &gt; len(nums)/2 {         ${c('// past half: nothing can catch it')}`],
      [null, `            ${k('return')} x`],
      [null, `        }`],
      [null, `    }`],
      [null, `    panic("the input always has a majority")`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('use')} std::collections::HashMap;`],
      [null, ``],
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} majority_element(nums: Vec&lt;i32&gt;) -&gt; i32 {`],
      ['init', `        ${k('let')} ${k('mut')} counts: HashMap&lt;i32, usize&gt; = HashMap::new(); ${c('// value -&gt; times seen')}`],
      ['loop', `        ${k('for')} &amp;x ${k('in')} &amp;nums {`],
      ['tally', `            ${k('let')} seen = counts.entry(x).or_insert(0);`],
      [null, `            *seen += 1;`],
      ['check', `            ${k('if')} *seen &gt; nums.len() / 2 {      ${c('// past half: nothing can catch it')}`],
      [null, `                ${k('return')} x;`],
      [null, `            }`],
      [null, `        }`],
      [null, `        unreachable!("the input always has a majority")`],
      [null, `    }`],
      [null, `}`],
    ],
  },
  vote: {
    ruby: [
      [null, `${k('def')} majority_element(nums)`],
      ['init', `  candidate, count = ${k('nil')}, 0`],
      ['loop', `  nums.each ${k('do')} |x|`],
      ['pick', `    candidate = x ${k('if')} count.zero?             ${c('# everything so far cancelled out')}`],
      ['vote', `    count += x == candidate ? 1 : -1         ${c('# a vote for, or one that cancels')}`],
      [null, `  ${k('end')}`],
      ['ret', `  candidate`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} majorityElement(self, nums):`],
      ['init', `        candidate, count = ${k('None')}, 0`],
      ['loop', `        ${k('for')} x ${k('in')} nums:`],
      ['pick', `            ${k('if')} count == 0:                   ${c('# everything so far cancelled out')}`],
      [null, `                candidate = x`],
      ['vote', `            count += 1 ${k('if')} x == candidate ${k('else')} -1  ${c('# a vote for, or one that cancels')}`],
      ['ret', `        ${k('return')} candidate`],
    ],
    javascript: [
      [null, `${k('var')} majorityElement = ${k('function')} (nums) {`],
      ['init', `  ${k('let')} candidate = ${k('null')}, count = 0;`],
      ['loop', `  ${k('for')} (${k('const')} x ${k('of')} nums) {`],
      ['pick', `    ${k('if')} (count === 0) candidate = x;          ${c('// everything so far cancelled out')}`],
      ['vote', `    count += x === candidate ? 1 : -1;       ${c('// a vote for, or one that cancels')}`],
      [null, `  }`],
      ['ret', `  ${k('return')} candidate;`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} majorityElement(nums []int) int {`],
      ['init', `    candidate, count := 0, 0`],
      ['loop', `    ${k('for')} _, x := ${k('range')} nums {`],
      ['pick', `        ${k('if')} count == 0 {                      ${c('// everything so far cancelled out')}`],
      [null, `            candidate = x`],
      [null, `        }`],
      ['vote', `        ${k('if')} x == candidate {                  ${c('// a vote for, or one that cancels')}`],
      [null, `            count++`],
      [null, `        } ${k('else')} {`],
      [null, `            count--`],
      [null, `        }`],
      [null, `    }`],
      ['ret', `    ${k('return')} candidate`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} majority_element(nums: Vec&lt;i32&gt;) -&gt; i32 {`],
      ['init', `        ${k('let')} (${k('mut')} candidate, ${k('mut')} count) = (0, 0);`],
      ['loop', `        ${k('for')} x ${k('in')} nums {`],
      ['pick', `            ${k('if')} count == 0 {                  ${c('// everything so far cancelled out')}`],
      [null, `                candidate = x;`],
      [null, `            }`],
      ['vote', `            count += ${k('if')} x == candidate { 1 } ${k('else')} { -1 }; ${c('// a vote for, or one that cancels')}`],
      [null, `        }`],
      ['ret', `        candidate`],
      [null, `    }`],
      [null, `}`],
    ],
  },
};

/* ---------------- part 1: the "cancel in pairs" widget ----------------
 *
 * The statement hinges on "more than ⌊n / 2⌋". Pair each copy of the majority
 * against a different value and cross both out: every other value can take
 * down at most one copy, and there are fewer of them than there are copies, so
 * at least one copy is left standing. The last preset is exactly half — not a
 * majority — and there nothing survives.
 *
 * Built from x-sum's widget vocabulary: .q-arr cells (kept / cut), the
 * .q-slider, the amber .q-tie line and the .ledger.
 */

const QW_SETS = [
  { label: t('example 1', 'ဥပမာ 1'), nums: [3, 2, 3] },
  { label: t('example 2', 'ဥပမာ 2'), nums: [2, 2, 1, 1, 1, 2, 2] },
  { label: t('a bare majority', 'အနိုင်ရရုံ'), nums: [5, 1, 5, 2, 5] },
  { label: t('exactly half', 'တစ်ဝက်တိတိ'), nums: [1, 2, 1, 2] },
];

function mountPairWidget(host) {
  const state = { set: 1, k: 0 };

  host.innerHTML = `
    <div class="q-arr" data-arr></div>
    <div class="q-slider">
      <label for="qw-k" data-lbl></label>
      <input type="range" id="qw-k" min="0" max="1" value="0">
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
    const { nums } = QW_SETS[state.set];
    const n = nums.length;
    const half = Math.floor(n / 2);
    // the most frequent value (first on a tie) stands in for "the majority"
    const tally = new Map();
    for (const v of nums) tally.set(v, (tally.get(v) ?? 0) + 1);
    const [m, copies] = [...tally].reduce((a, b) => (b[1] > a[1] ? b : a));
    const isMajority = copies > half;
    const mine = nums.map((v, i) => (v === m ? i : -1)).filter((i) => i >= 0);
    const others = nums.map((v, i) => (v !== m ? i : -1)).filter((i) => i >= 0);
    const kmax = Math.min(mine.length, others.length);
    const kk = Math.min(state.k, kmax);
    const cut = new Set([...mine.slice(0, kk), ...others.slice(0, kk)]);
    const left = copies - kk;

    q('[data-lbl]').textContent = pick(t('pairs', 'အတွဲ'));
    const slider = q('#qw-k');
    slider.max = String(kmax);
    slider.value = String(kk);
    q('[data-out]').textContent = `${kk}/${kmax}`;
    q('[data-presets]').innerHTML = QW_SETS.map((x, i) =>
      `<button class="chip" data-set="${i}"${i === state.set ? ' aria-pressed="true"' : ''}>${pick(x.label)}</button>`).join('');

    // cut = crossed out in a pair · kept = a copy of m still standing
    q('[data-arr]').innerHTML = nums.map((v, i) =>
      `<div class="cell${cut.has(i) ? ' cut' : v === m ? ' kept' : ''}"><span>${v}</span><span class="idx">${i}</span></div>`).join('');

    const label = document.getElementById('q-label');
    if (label) label.textContent = `n = ${n} · ⌊n/2⌋ = ${half}`;

    q('[data-line]').innerHTML = pick(!isMajority
      ? (kk === kmax
        ? t(`Every ${m} has been paired off and nothing is left. ${copies} of ${n} is exactly half — not more than ⌊${n}/2⌋ = ${half} — so this array has no majority, and the statement rules it out.`,
            `${m} တိုင်းကို အတွဲချပြီး ဘာမျှ မကျန်ပါ။ ${n} ခုအနက် ${copies} ခုသည် တစ်ဝက်တိတိ — ⌊${n}/2⌋ = ${half} ထက် မပိုပါ — ထို့ကြောင့် ဤ array တွင် majority မရှိ၊ မေးခွန်းက ခွင့်မပြုပါ။`)
        : t(`${m} appears ${copies} times, and there are ${others.length} other values to pair against it. Keep pairing.`,
            `${m} သည် ${copies} ကြိမ် ပါပြီး ၎င်းနှင့် အတွဲချရန် အခြား value ${others.length} ခု ရှိသည်။ ဆက်၍ အတွဲချပါ။`))
      : kk === kmax
        ? t(`The other values have run out, and ${left} ${left === 1 ? 'copy' : 'copies'} of ${m} still ${left === 1 ? 'stands' : 'stand'}. Each other value could cancel only one copy, and ${copies} &gt; ⌊${n}/2⌋ = ${half} means there were too few of them.`,
            `အခြား value များ ကုန်သွားပြီး ${m} ၏ copy ${left} ခု ကျန်နေဆဲ ဖြစ်သည်။ အခြား value တစ်ခုစီက copy တစ်ခုကိုသာ ချေဖျက်နိုင်ပြီး ${copies} &gt; ⌊${n}/2⌋ = ${half} ဆိုသည်မှာ ၎င်းတို့ မလောက်ခဲ့ခြင်း ဖြစ်သည်။`)
        : t(`Each pair crosses out one ${m} and one other value. ${others.length - kk} other ${others.length - kk === 1 ? 'value is' : 'values are'} left to pair with.`,
            `အတွဲတစ်ခုစီက ${m} တစ်ခုနှင့် အခြား value တစ်ခုကို ဖျက်သည်။ အတွဲချရန် အခြား value ${others.length - kk} ခု ကျန်သည်။`));

    // the ledger is a formula, as on x-sum
    q('[data-expr]').innerHTML = `${copies} × ${m} − ${kk} cancelled = ${left} left`;
    q('[data-total]').innerHTML = isMajority
      ? `${m}<small>${pick(t('majority', 'majority'))}</small>`
      : `—<small>${pick(t('no majority', 'majority မရှိ'))}</small>`;
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

/* ---------------- the approach, in brief ----------------
 *
 * Shown in part 2 under the approach tabs: the idea, the steps as the code
 * takes them (named after its identifiers), and the cost with its reason. */

const APPROACH = {
  count: {
    idea: t("Count every value. The first one whose count passes half the array is the majority, and nothing can overtake it after that.",
        "value တိုင်းကို ရေတွက်သည်။ count က array ၏ တစ်ဝက်ကို ပထမဆုံး ကျော်သောတစ်ခုသည် majority ဖြစ်ပြီး ထို့နောက် မည်သည့်အရာကမျှ ၎င်းကို မကျော်နိုင်ပါ။"),
    steps: [
      t("Start with an empty map, <code>counts</code>.",
        "map ဗလာ <code>counts</code> ဖြင့် စသည်။"),
      t("For each <code>x</code>, add one to <code>counts[x]</code>.",
        "<code>x</code> တစ်ခုစီအတွက် <code>counts[x]</code> ကို တစ်ပေါင်းသည်။"),
      t("Return <code>x</code> as soon as <code>counts[x]</code> passes ⌊n/2⌋.",
        "<code>counts[x]</code> က ⌊n/2⌋ ကို ကျော်သည်နှင့် <code>x</code> ကို ပြန်ပေးသည်။"),
    ],
    cost: t("one pass at most, but up to 25,000 rows at n = 5 × 10⁴.",
        "အများဆုံး တစ်ကြိမ် ဖြတ်ခြင်း၊ သို့သော် n = 5 × 10⁴ တွင် row 25,000 အထိ။"),
  },
  vote: {
    idea: t("Pair each vote with a vote for something else and cross both out. A majority has more copies than every other value put together, so some of it always survives.",
        "မဲတစ်ခုစီကို အခြားတစ်ခုအတွက် မဲနှင့် အတွဲချပြီး နှစ်ခုလုံး ဖျက်သည်။ majority တွင် အခြား value အားလုံး ပေါင်းထက် copy ပိုများသဖြင့် ၎င်း၏ တစ်စိတ်တစ်ပိုင်း အမြဲ ကျန်ရစ်သည်။"),
    steps: [
      t("Start with no <code>candidate</code> and <code>count = 0</code>.",
        "<code>candidate</code> မရှိဘဲ <code>count = 0</code> ဖြင့် စသည်။"),
      t("For each <code>x</code>: if <code>count</code> is 0, <code>x</code> becomes the <code>candidate</code>.",
        "<code>x</code> တစ်ခုစီအတွက် — <code>count</code> သည် 0 ဖြစ်လျှင် <code>x</code> သည် <code>candidate</code> ဖြစ်လာသည်။"),
      t("Add one to <code>count</code> if <code>x</code> is the candidate; subtract one otherwise.",
        "<code>x</code> သည် candidate ဖြစ်လျှင် <code>count</code> ကို တစ်ပေါင်း၊ မဟုတ်လျှင် တစ်နုတ်သည်။"),
      t("Return <code>candidate</code>.",
        "<code>candidate</code> ကို ပြန်ပေးသည်။"),
    ],
    cost: t("one pass and two variables — correct only because the statement guarantees a majority.",
        "တစ်ကြိမ် ဖြတ်ခြင်းနှင့် variable နှစ်ခု — မေးခွန်းက majority ရှိကြောင်း အာမခံထားသောကြောင့်သာ မှန်သည်။"),
  },
};

/* ---------------- mount ----------------
 *
 * Last in the file on purpose: mountLesson runs the widget immediately, so
 * every const the widget reads must already be initialised. */

mountLesson({
  input: { nums: [2, 2, 1, 1, 1, 2, 2] },
  controls: [
    { key: 'nums', label: 'nums', value: '2, 2, 1, 1, 1, 2, 2', parse: parseNums, format: (a) => a.join(', ') },
  ],
  presets: [
    { label: exampleTitle(1), input: { nums: [3, 2, 3] } },
    { label: exampleTitle(2), input: { nums: [2, 2, 1, 1, 1, 2, 2] } },
    { label: t('Majority last', 'majority နောက်ဆုံး'), input: { nums: [4, 7, 9, 5, 5, 5, 5] } },
    { label: t('One value', 'value တစ်ခု'), input: { nums: [8] } },
    { label: t('Candidate changes', 'candidate ပြောင်း'), input: { nums: [1, 1, 2, 2, 2, 3, 3, 3, 3, 3, 3] } },
  ],
  examples: [
    { title: exampleTitle(1), inputHtml: '<code>nums = [3,2,3]</code>', output: '3',
      why: [t('n = 3, so the majority must appear more than ⌊3/2⌋ = 1 time. 3 appears twice.',
              'n = 3 ဖြစ်သဖြင့် majority သည် ⌊3/2⌋ = 1 ကြိမ်ထက် ပိုပါရမည်။ 3 သည် နှစ်ကြိမ် ပါသည်။')],
      load: { nums: [3, 2, 3] } },
    { title: exampleTitle(2), inputHtml: '<code>nums = [2,2,1,1,1,2,2]</code>', output: '2',
      why: [t('n = 7, so the majority needs more than ⌊7/2⌋ = 3. 2 appears 4 times; 1 appears 3 times, which is not enough.',
              'n = 7 ဖြစ်သဖြင့် majority သည် ⌊7/2⌋ = 3 ထက် ပိုရမည်။ 2 သည် 4 ကြိမ် ပါသည် — 1 သည် 3 ကြိမ်သာ ပါပြီး မလောက်ပါ။')],
      load: { nums: [2, 2, 1, 1, 1, 2, 2] } },
  ],
  modes: [
    { id: 'count', name: 'Count map',
      desc: t('Tally every value; stop when one passes half.', 'value တိုင်းကို ရေတွက်၊ တစ်ခုက တစ်ဝက်ကျော်လျှင် ရပ်။'),
      cost: 'O(n) time · O(n) space', build: buildCount },
    { id: 'vote', name: 'Boyer–Moore vote',
      desc: t('One candidate; other values cancel its votes.', 'candidate တစ်ခု — အခြား value များက ၎င်း၏ မဲကို ချေဖျက်သည်။'),
      cost: 'O(n) time · O(1) space', build: buildVote },
  ],
  languages: LANGUAGES,
  code: CODE,
  solutions: {
    count: { approach: APPROACH.count, desc: t('The direct reading of the statement: count, and return the first value whose count passes ⌊n/2⌋. Linear, but the map can grow to 25,000 rows at the constraint — the follow-up asks for O(1) space.',
                     'မေးခွန်းကို တိုက်ရိုက် ဖတ်ခြင်း — ရေတွက်ပြီး count က ⌊n/2⌋ ကျော်သော ပထမ value ကို ပြန်ပေးသည်။ linear ဖြစ်သော်လည်း ကန့်သတ်ချက်အထိ map သည် row 25,000 အထိ ကြီးနိုင်သည် — follow-up က O(1) space ကို တောင်းသည်။') },
    vote: { approach: APPROACH.vote, desc: t('Pairs of different values cancel, and a majority cannot be cancelled away. Two variables, one pass — and only correct because the statement guarantees a majority exists.',
                    'မတူသော value အတွဲများ ချေဖျက်ကြပြီး majority ကို ချေဖျက်၍ မကုန်နိုင်ပါ။ variable နှစ်ခု၊ တစ်ကြိမ်တည်း ဖြတ်သည် — မေးခွန်းက majority ရှိကြောင်း အာမခံထားသောကြောင့်သာ မှန်သည်။') },
  },
  // How each language was actually checked, printed as the part 3 badges.
  // The corpus: the 2 examples, 4 edges, 15,000 random arrays of up to 9
  // values drawn from -2..2, 5,000 of up to 500 across ±10⁹, and five at
  // n = 5×10⁴ (random, few distinct values, all equal, and two with the
  // tightest majority, ⌊n/2⌋ + 1 copies) — every array built to have a
  // majority, against an oracle that sorts and takes the middle. Go and Rust
  // ran in Docker (golang:1.23-alpine, rust:1-slim).
  verification: {
    ruby: 'ran here · 20,011 cases',
    python: 'ran here · 20,011 cases',
    javascript: 'ran here · 20,011 cases',
    go: 'ran here · 20,011 cases · Go 1.23',
    rust: 'ran here · 20,011 cases · rustc 1.98',
  },
  strip,
  draw,
  answer,
  vars,
  widget: mountPairWidget,
});
