/* Climbing Stairs — LeetCode 70.
 *
 * Every climb to step n ends with a 1-step or a 2-step, so the climbs of n
 * are the climbs of n − 1 with a 1 added, plus the climbs of n − 2 with a 2
 * added: ways(n) = ways(n − 1) + ways(n − 2). Written straight down as
 * recursion that is correct and exponential, because ways(k) for small k is
 * worked out again inside every branch that needs it. A memo makes each k a
 * single computation; and since each value only needs the two below it, two
 * variables walking up the stairs are all the memory the problem needs.
 */
import { mountLesson } from '../../lib/stepper.js';
import { pick, onLangChange } from '../../lib/i18n.js';
import { cells, stack, bars, readout, panels, slots, stagePanel } from '../../lib/stage.js';
import { t, exampleTitle, LANGUAGES, k, c, stageGap } from '../../lib/kit.js';

/* ten steps is 177 calls in the plain recursion — 441 frames, which is as far
 * as stepping by hand stays worth it */
const MAX_N = 10;

function parseN(text) {
  const v = text.trim();
  const n = Number(v);
  if (v === '' || !Number.isInteger(n)) throw new Error('a whole number');
  if (n < 1) throw new Error('n is at least 1');
  if (n > MAX_N) throw new Error(`at most ${MAX_N} here, so the plain recursion stays steppable`);
  return n;
}

/* ---------------- step generators ---------------- */

/* The two recursive modes share one generator; the memo version checks its
 * table before recursing and stores into it on the way out. */
function buildRecursive(n, useMemo) {
  const view = useMemo ? 'memo' : 'naive';
  const steps = [];
  const frames = [];                               // { n, one, two } for every call still open
  const calls = Array(n + 1).fill(0);              // calls[k] = how many times ways(k) was entered
  const memo = {};
  let total = 0;
  const snap = (extra) => ({
    view, n, frames: frames.map((f) => ({ ...f })), calls: [...calls], total, memo: { ...memo }, ...extra,
  });

  function visit(m, from) {
    const frame = { n: m, one: null, two: null };
    frames.push(frame);
    calls[m] += 1;
    total += 1;
    const again = calls[m] > 1;
    if (m <= 1) {
      steps.push(snap({ line: 'base', cur: m, tag: t(`${m} → 1`, `${m} → 1`),
        note: m === 1
          ? t(`Step 1: one way to get there, a single step. Return <b>1</b>.`, `step 1 — ရောက်ရန် နည်း တစ်နည်းတည်း၊ step တစ်ခု။ <b>1</b> ကို ပြန်ပေးသည်။`)
          : t(`Step 0: already there — the empty climb is <b>1</b> way. That is what makes ways(2) = ways(1) + ways(0) = 2.`,
              `step 0 — ရောက်ပြီးသား — ဘာမျှ မတက်ခြင်းသည် နည်း <b>1</b> နည်း ဖြစ်သည်။ ထို့ကြောင့် ways(2) = ways(1) + ways(0) = 2 ဖြစ်သည်။`) }));
      frames.pop();
      return 1;
    }
    steps.push(snap({ line: 'base', cur: m, tag: t(`ways(${m})`, `ways(${m})`),
      note: again && !useMemo
        ? t(`ways(${m}) <b>again</b> — call number ${calls[m]} for this same step. Nothing remembers the last answer, so all of it is worked out from scratch.`,
            `ways(${m}) <b>ထပ်</b> — ဤ step အတွက် call အကြိမ် ${calls[m]}။ ယခင်အဖြေကို ဘာကမျှ မမှတ်ထားသဖြင့် အစမှ ပြန်တွက်ရသည်။`)
        : t(`ways(${m}): step ${m} is above 1, so its answer comes from the two steps below it.`,
            `ways(${m}) — step ${m} သည် 1 ထက် မြင့်သဖြင့် ၎င်း၏ အဖြေသည် အောက်ရှိ step နှစ်ခုမှ လာသည်။`) }));
    if (useMemo) {
      if (memo[m] != null) {
        steps.push(snap({ line: 'hit', cur: m, hit: m, tag: t(`memo ${memo[m]}`, `memo ${memo[m]}`),
          note: t(`ways(${m}) is already in the memo: <b>${memo[m]}</b>. Return it — the whole subtree of calls below ${m} is skipped.`,
                  `ways(${m}) သည် memo ထဲတွင် ရှိပြီးသား — <b>${memo[m]}</b>။ ၎င်းကို ပြန်ပေးသည် — ${m} အောက်ရှိ call အားလုံးကို ကျော်သွားသည်။`) }));
        frames.pop();
        return memo[m];
      }
      steps.push(snap({ line: 'hit', cur: m, tag: t('not yet', 'မရှိသေး'),
        note: t(`ways(${m}) is not in the memo yet — this is the first and only time it gets worked out.`,
                `ways(${m}) သည် memo ထဲတွင် မရှိသေးပါ — ၎င်းကို တွက်မည့် ပထမဆုံးနှင့် တစ်ခုတည်းသော အကြိမ် ဖြစ်သည်။`) }));
    }
    steps.push(snap({ line: 'recl', cur: m, tag: t(`ask ${m - 1}`, `${m - 1} ကို မေး`),
      note: t(`Climbs that end with a single step: every climb of ${m - 1}, plus one more step. Ask ways(${m - 1}).`,
              `step တစ်ခုဖြင့် အဆုံးသတ်သော climb များ — ${m - 1} ၏ climb တိုင်းတွင် step တစ်ခု ပေါင်းခြင်း။ ways(${m - 1}) ကို မေးသည်။`) }));
    frame.one = visit(m - 1, m);
    steps.push(snap({ line: 'recr', cur: m, tag: t(`ask ${m - 2}`, `${m - 2} ကို မေး`),
      note: t(`${frame.one} of those. Climbs that end with a double step: every climb of ${m - 2}, plus a 2. Ask ways(${m - 2}).`,
              `ထိုကဲ့သို့ ${frame.one} ခု။ step နှစ်ခုဖြင့် အဆုံးသတ်သော climb များ — ${m - 2} ၏ climb တိုင်းတွင် 2 ပေါင်းခြင်း။ ways(${m - 2}) ကို မေးသည်။`) }));
    frame.two = visit(m - 2, m);
    const w = frame.one + frame.two;
    if (useMemo) memo[m] = w;
    steps.push(snap({ line: 'ret', cur: m, done: m, tag: t(`return ${w}`, `${w} ပြန်`),
      note: frames.length === 1
        ? t(`${frame.one} + ${frame.two} = <b>${w}</b> ways to reach step ${m} — the answer, after ${total} calls${useMemo ? '' : ` for ${n + 1} different steps`}.`,
            `${frame.one} + ${frame.two} = step ${m} သို့ ရောက်ရန် နည်း <b>${w}</b> — call ${total} ခု${useMemo ? '' : ` (မတူသော step ${n + 1} ခုအတွက်)`} အပြီး အဖြေ ဖြစ်သည်။`)
        : useMemo
          ? t(`${frame.one} + ${frame.two} = <b>${w}</b>. Store it as memo[${m}], then hand it back to ways(${from}).`,
              `${frame.one} + ${frame.two} = <b>${w}</b>။ memo[${m}] အဖြစ် သိမ်းပြီး ways(${from}) ထံ ပြန်ပေးသည်။`)
          : t(`${frame.one} + ${frame.two} = <b>${w}</b>. Hand it back to ways(${from}) — and forget it.`,
              `${frame.one} + ${frame.two} = <b>${w}</b>။ ways(${from}) ထံ ပြန်ပေးသည် — ပြီးလျှင် မေ့သွားသည်။`) }));
    frames.pop();
    return w;
  }

  const answer = visit(n, null);
  const last = steps[steps.length - 1];
  last.finished = true;
  last.answer = answer;
  return steps;
}

const buildNaive = ({ n }) => buildRecursive(n, false);
const buildMemo = ({ n }) => buildRecursive(n, true);

function buildDp({ n }) {
  const steps = [];
  let a = 1;
  let b = 1;
  let at = 1;                                      // b holds ways(at), a holds ways(at - 1)
  const known = { 0: 1, 1: 1 };
  const snap = (extra) => ({ view: 'dp', n, a, b, at, known: { ...known }, ...extra });

  steps.push(snap({ line: 'init', i: null, tag: t('a = b = 1', 'a = b = 1'),
    note: t('<code>a</code> is the number of ways to reach step 0, <code>b</code> the ways to reach step 1. Both are 1. Each pass of the loop moves the pair one step up.',
            '<code>a</code> သည် step 0 သို့ ရောက်ရန် နည်းအရေအတွက်၊ <code>b</code> သည် step 1 သို့ ရောက်ရန် နည်းအရေအတွက်။ နှစ်ခုလုံး 1 ဖြစ်သည်။ loop တစ်ပတ်လျှင် အတွဲကို step တစ်ဆင့် တက်စေသည်။') }));
  for (let i = 1; i < n; i++) {
    steps.push(snap({ line: 'loop', i, tag: t(`pass ${i}`, `အပတ် ${i}`),
      note: t(`Pass ${i} of ${n - 1}: <code>b</code> is ways(${at}), and the target is step ${n}, so go up one more.`,
              `${n - 1} ပတ်အနက် ${i} ပတ်မြောက် — <code>b</code> သည် ways(${at}) ဖြစ်ပြီး ပန်းတိုင်မှာ step ${n} ဖြစ်သဖြင့် နောက်တစ်ဆင့် တက်သည်။`) }));
    const was = [a, b];
    [a, b] = [b, a + b];
    at += 1;
    known[at] = b;
    steps.push(snap({ line: 'step', i, tag: t(`ways(${at}) = ${b}`, `ways(${at}) = ${b}`),
      note: t(`ways(${at}) = ways(${at - 1}) + ways(${at - 2}) = ${was[1]} + ${was[0]} = <b>${b}</b>. The pair slides up: <code>a</code> takes the old <code>b</code>, and ways(${at - 2}) is dropped — nothing will ask for it again.`,
              `ways(${at}) = ways(${at - 1}) + ways(${at - 2}) = ${was[1]} + ${was[0]} = <b>${b}</b>။ အတွဲ အပေါ်သို့ ရွှေ့သည် — <code>a</code> က <code>b</code> အဟောင်းကို ယူပြီး ways(${at - 2}) ကို ပစ်လိုက်သည် — ၎င်းကို ဘယ်သူမျှ ထပ်မမေးတော့ပါ။`) }));
  }
  steps.push(snap({ line: 'loop', i: n, tag: t('done', 'ပြီး'),
    note: n === 1
      ? t('n is 1: the loop runs zero times. <code>b</code> already holds ways(1).', 'n သည် 1 — loop လုံးဝ မလည်ပါ။ <code>b</code> တွင် ways(1) ရှိပြီးသား ဖြစ်သည်။')
      : t(`${n - 1} passes done: <code>b</code> is ways(${n}).`, `${n - 1} ပတ် ပြီးပြီ — <code>b</code> သည် ways(${n}) ဖြစ်သည်။`) }));
  steps.push(snap({ line: 'ret', i: n, finished: true, answer: b, tag: t(`return ${b}`, `${b} ပြန်`),
    note: t(`Return <b>${b}</b>. ${n - 1} additions and two integers — the same answer as the recursion, without a single call.`,
            `<b>${b}</b> ကို ပြန်ပေးသည်။ ပေါင်းခြင်း ${n - 1} ကြိမ်နှင့် integer နှစ်ခု — recursion နှင့် အဖြေတူ၊ call တစ်ခုမျှ မရှိ။`) }));
  return steps;
}

/* ---------------- drawing ----------------
 *
 * The strip card is the staircase, steps 0 … n, each showing ways(k) once
 * something knows it. The plain recursion never keeps an answer, so its
 * staircase stays blank: the calls waiting on it are amber and the running
 * one green. The stage draws the call stack beside a bar per step counting
 * how many times ways(k) was entered — tall bars are repeated work — or, for
 * the loop, the two variables that are its entire memory.
 */

function strip(s) {
  const tone = {};
  const marks = {};
  const vals = [];
  for (let kk = 0; kk <= s.n; kk++) {
    if (s.view === 'dp') vals.push(s.known[kk] ?? '·');
    else if (s.view === 'memo') vals.push(kk <= 1 ? 1 : s.memo[kk] ?? '·');
    else vals.push('·');
  }
  if (s.view === 'dp') {
    for (let kk = 0; kk < s.at - 1; kk++) tone[kk] = 'done';
    tone[s.at - 1] = 'inwin'; marks[s.at - 1] = 'a';
    tone[s.at] = s.finished ? 'entering' : 'inwin'; marks[s.at] = 'b';
  } else {
    for (const f of s.frames) tone[f.n] = 'inwin';
    if (s.cur != null) tone[s.cur] = 'entering';
  }
  return cells(vals, { tone, marks });
}

function draw(s) {
  if (s.view === 'dp') {
    return stagePanel(pick(t('The only memory: two integers', 'တစ်ခုတည်းသော memory — integer နှစ်ခု')),
      pick(t(`at step ${s.at}`, `step ${s.at} တွင်`)),
      readout({ a: `${s.a}  = ways(${s.at - 1})`, b: `${s.b}  = ways(${s.at})` })
        + stageGap + `<p class="note">${pick(t(`Everything below step ${Math.max(0, s.at - 1)} has been forgotten. Only the two values the next step needs are kept.`,
          `step ${Math.max(0, s.at - 1)} အောက်ရှိ အရာအားလုံးကို မေ့ပြီးပြီ။ နောက် step လိုသည့် value နှစ်ခုကိုသာ သိမ်းထားသည်။`))}</p>`);
  }
  const frames = s.frames.map((f) => `ways(${f.n})${f.one != null ? ` · one ${f.one}` : ''}`);
  const tone = {};
  s.calls.forEach((cnt, kk) => { if (cnt > 1) tone[kk] = s.view === 'naive' ? 'warn' : 'up'; });
  return stagePanel(pick(s.view === 'naive'
    ? t('Calls waiting, and how often each step has been worked out', 'စောင့်နေသော call များနှင့် step တစ်ခုစီကို တွက်ခဲ့သည့် အကြိမ်')
    : t('Calls waiting, and how often each step has been asked', 'စောင့်နေသော call များနှင့် step တစ်ခုစီကို မေးခဲ့သည့် အကြိမ်')),
    pick(t(`${s.total} calls`, `call ${s.total} ခု`)),
    panels(stack(frames, { label: 'call stack' }),
      bars(s.calls, { at: s.cur, tone, label: s.view === 'naive' ? 'times ways(k) ran' : 'times ways(k) was called', height: 110 })));
}

function answer(s) {
  return {
    html: slots(s.finished ? [s.answer] : [], { total: 1, just: s.finished ? 0 : -1 }),
    note: s.finished ? t('distinct ways to the top', 'ထိပ်သို့ ရောက်ရန် မတူသော နည်း') : t('one number', 'ကိန်း တစ်ခု'),
  };
}

function vars(s) {
  if (s.view === 'dp') return [['a', s.a], ['b', s.b], ['n', s.n], ['i', s.i ?? '—']];
  const f = s.frames[s.frames.length - 1];
  const known = (v) => (v == null ? '—' : v);
  const out = [['n', f ? f.n : '—'], ['one', known(f?.one)], ['two', known(f?.two)]];
  if (s.view === 'memo') out.push(['memo', `{${Object.entries(s.memo).map(([kk, v]) => `${kk}: ${v}`).join(', ')}}`]);
  return out;
}

/* ---------------- the code, one key per line ----------------
 *
 * Generated from the verified solution files, so the listing a reader copies
 * is byte-identical to the one that ran. */

const CODE = {
  naive: {
    ruby: [
      [null, `${k('def')} climb_stairs(n)`],
      ['base', `  ${k('return')} 1 ${k('if')} n &lt;= 1                         ${c('# step 0 or 1: one way, stay or take it')}`],
      ['recl', `  one = climb_stairs(n - 1)                  ${c('# the last move was a single step')}`],
      ['recr', `  two = climb_stairs(n - 2)                  ${c('# the last move was a double step')}`],
      ['ret', `  one + two`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} climbStairs(self, n):`],
      ['base', `        ${k('if')} n &lt;= 1:                           ${c('# step 0 or 1: one way, stay or take it')}`],
      [null, `            ${k('return')} 1`],
      ['recl', `        one = self.climbStairs(n - 1)        ${c('# the last move was a single step')}`],
      ['recr', `        two = self.climbStairs(n - 2)        ${c('# the last move was a double step')}`],
      ['ret', `        ${k('return')} one + two`],
    ],
    javascript: [
      [null, `${k('var')} climbStairs = ${k('function')} (n) {`],
      ['base', `  ${k('if')} (n &lt;= 1) ${k('return')} 1;                      ${c('// step 0 or 1: one way, stay or take it')}`],
      ['recl', `  ${k('const')} one = climbStairs(n - 1);            ${c('// the last move was a single step')}`],
      ['recr', `  ${k('const')} two = climbStairs(n - 2);            ${c('// the last move was a double step')}`],
      ['ret', `  ${k('return')} one + two;`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} climbStairs(n int) int {`],
      ['base', `    ${k('if')} n &lt;= 1 {                              ${c('// step 0 or 1: one way, stay or take it')}`],
      [null, `        ${k('return')} 1`],
      [null, `    }`],
      ['recl', `    one := climbStairs(n - 1)                ${c('// the last move was a single step')}`],
      ['recr', `    two := climbStairs(n - 2)                ${c('// the last move was a double step')}`],
      ['ret', `    ${k('return')} one + two`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} climb_stairs(n: i32) -&gt; i32 {`],
      ['base', `        ${k('if')} n &lt;= 1 {                          ${c('// step 0 or 1: one way, stay or take it')}`],
      [null, `            ${k('return')} 1;`],
      [null, `        }`],
      ['recl', `        ${k('let')} one = ${k('Self')}::climb_stairs(n - 1); ${c('// the last move was a single step')}`],
      ['recr', `        ${k('let')} two = ${k('Self')}::climb_stairs(n - 2); ${c('// the last move was a double step')}`],
      ['ret', `        one + two`],
      [null, `    }`],
      [null, `}`],
    ],
  },
  memo: {
    ruby: [
      [null, `${k('def')} climb_stairs(n, memo = {})`],
      ['base', `  ${k('return')} 1 ${k('if')} n &lt;= 1`],
      ['hit', `  ${k('return')} memo[n] ${k('if')} memo.key?(n)             ${c('# worked out before: no second visit')}`],
      ['recl', `  one = climb_stairs(n - 1, memo)`],
      ['recr', `  two = climb_stairs(n - 2, memo)`],
      ['ret', `  memo[n] = one + two`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} climbStairs(self, n):`],
      [null, `        memo = {}`],
      [null, ``],
      [null, `        ${k('def')} ways(n):`],
      ['base', `            ${k('if')} n &lt;= 1:`],
      [null, `                ${k('return')} 1`],
      ['hit', `            ${k('if')} n ${k('in')} memo:                    ${c('# worked out before: no second visit')}`],
      [null, `                ${k('return')} memo[n]`],
      ['recl', `            one = ways(n - 1)`],
      ['recr', `            two = ways(n - 2)`],
      ['ret', `            memo[n] = one + two`],
      [null, `            ${k('return')} memo[n]`],
      [null, ``],
      [null, `        ${k('return')} ways(n)`],
    ],
    javascript: [
      [null, `${k('var')} climbStairs = ${k('function')} (n, memo = ${k('new')} Map()) {`],
      ['base', `  ${k('if')} (n &lt;= 1) ${k('return')} 1;`],
      ['hit', `  ${k('if')} (memo.has(n)) ${k('return')} memo.get(n);       ${c('// worked out before: no second visit')}`],
      ['recl', `  ${k('const')} one = climbStairs(n - 1, memo);`],
      ['recr', `  ${k('const')} two = climbStairs(n - 2, memo);`],
      ['ret', `  memo.set(n, one + two);`],
      [null, `  ${k('return')} memo.get(n);`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} climbStairs(n int) int {`],
      [null, `    memo := map[int]int{}`],
      [null, `    ${k('var')} ways ${k('func')}(n int) int`],
      [null, `    ways = ${k('func')}(n int) int {`],
      ['base', `        ${k('if')} n &lt;= 1 {`],
      [null, `            ${k('return')} 1`],
      [null, `        }`],
      ['hit', `        ${k('if')} v, ok := memo[n]; ok {            ${c('// worked out before: no second visit')}`],
      [null, `            ${k('return')} v`],
      [null, `        }`],
      ['recl', `        one := ways(n - 1)`],
      ['recr', `        two := ways(n - 2)`],
      ['ret', `        memo[n] = one + two`],
      [null, `        ${k('return')} memo[n]`],
      [null, `    }`],
      [null, `    ${k('return')} ways(n)`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('use')} std::collections::HashMap;`],
      [null, ``],
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} climb_stairs(n: i32) -&gt; i32 {`],
      [null, `        ${k('Self')}::ways(n, &amp;${k('mut')} HashMap::new())`],
      [null, `    }`],
      [null, ``],
      [null, `    ${k('fn')} ways(n: i32, memo: &amp;${k('mut')} HashMap&lt;i32, i32&gt;) -&gt; i32 {`],
      ['base', `        ${k('if')} n &lt;= 1 {`],
      [null, `            ${k('return')} 1;`],
      [null, `        }`],
      ['hit', `        ${k('if')} ${k('let')} ${k('Some')}(&amp;v) = memo.get(&amp;n) {     ${c('// worked out before: no second visit')}`],
      [null, `            ${k('return')} v;`],
      [null, `        }`],
      ['recl', `        ${k('let')} one = ${k('Self')}::ways(n - 1, memo);`],
      ['recr', `        ${k('let')} two = ${k('Self')}::ways(n - 2, memo);`],
      ['ret', `        memo.insert(n, one + two);`],
      [null, `        one + two`],
      [null, `    }`],
      [null, `}`],
    ],
  },
  dp: {
    ruby: [
      [null, `${k('def')} climb_stairs(n)`],
      ['init', `  a, b = 1, 1                                ${c('# ways to reach step 0 and step 1')}`],
      ['loop', `  (n - 1).times ${k('do')}`],
      ['step', `    a, b = b, a + b                          ${c('# slide up one step')}`],
      [null, `  ${k('end')}`],
      ['ret', `  b`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} climbStairs(self, n):`],
      ['init', `        a, b = 1, 1                          ${c('# ways to reach step 0 and step 1')}`],
      ['loop', `        ${k('for')} _ ${k('in')} range(n - 1):`],
      ['step', `            a, b = b, a + b                  ${c('# slide up one step')}`],
      ['ret', `        ${k('return')} b`],
    ],
    javascript: [
      [null, `${k('var')} climbStairs = ${k('function')} (n) {`],
      ['init', `  ${k('let')} a = 1, b = 1;                          ${c('// ways to reach step 0 and step 1')}`],
      ['loop', `  ${k('for')} (${k('let')} i = 1; i &lt; n; i++) {`],
      ['step', `    [a, b] = [b, a + b];                     ${c('// slide up one step')}`],
      [null, `  }`],
      ['ret', `  ${k('return')} b;`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} climbStairs(n int) int {`],
      ['init', `    a, b := 1, 1                             ${c('// ways to reach step 0 and step 1')}`],
      ['loop', `    ${k('for')} i := 1; i &lt; n; i++ {`],
      ['step', `        a, b = b, a+b                        ${c('// slide up one step')}`],
      [null, `    }`],
      ['ret', `    ${k('return')} b`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} climb_stairs(n: i32) -&gt; i32 {`],
      ['init', `        ${k('let')} (${k('mut')} a, ${k('mut')} b) = (1, 1);         ${c('// ways to reach step 0 and step 1')}`],
      ['loop', `        ${k('for')} _ ${k('in')} 1..n {`],
      ['step', `            (a, b) = (b, a + b);             ${c('// slide up one step')}`],
      [null, `        }`],
      ['ret', `        b`],
      [null, `    }`],
      [null, `}`],
    ],
  },
};

/* ---------------- part 1: the "last move" widget ----------------
 *
 * The whole problem is one observation: every climb ends with a 1-step or a
 * 2-step. Drag n and list every climb, split by its last move — the first
 * group, last move removed, is exactly the climbs of n − 1, and the second
 * the climbs of n − 2. The ledger is the recurrence with numbers in it.
 *
 * Built from x-sum's widget vocabulary: .q-arr cells (kept), the .q-slider,
 * the amber .q-tie line and the .ledger.
 */

const QW_MAX = 5;

/* every climb of n, as arrays of 1s and 2s, in lexicographic order */
function climbs(n) {
  if (n === 0) return [[]];
  const out = climbs(n - 1).map((c) => [...c, 1]);
  if (n >= 2) out.push(...climbs(n - 2).map((c) => [...c, 2]));
  return out;
}

function mountLastMoveWidget(host) {
  const state = { n: 4 };

  host.innerHTML = `
    <div class="climbs" data-rows></div>
    <div class="q-slider">
      <label for="qw-n" data-lbl></label>
      <input type="range" id="qw-n" min="1" max="${QW_MAX}" value="4">
      <output data-out>4</output>
      <span class="q-presets" data-presets></span>
    </div>
    <p class="q-tie" data-line></p>
    <div class="ledger">
      <span class="expr" data-expr></span>
      <span class="total" data-total></span>
    </div>`;

  const q = (sel) => host.querySelector(sel);

  function row(c) {
    // the last move is the one that is lit; what precedes it is a climb of n − 1 or n − 2
    return `<div class="q-arr">${c.map((s, i) =>
      `<div class="cell${i === c.length - 1 ? ' kept' : ''}"><span>${s}</span></div>`).join('')}</div>`;
  }

  function render() {
    const n = state.n;
    const all = climbs(n);
    const ones = all.filter((c) => c[c.length - 1] === 1);
    const twos = all.filter((c) => c[c.length - 1] === 2);

    q('[data-lbl]').textContent = 'n';
    q('#qw-n').value = String(n);
    q('[data-out]').textContent = String(n);
    q('[data-presets]').innerHTML = [2, 3, 5].map((v) =>
      `<button class="chip" data-n="${v}"${v === n ? ' aria-pressed="true"' : ''}>${v === 2 ? pick(t('example 1', 'ဥပမာ 1')) : v === 3 ? pick(t('example 2', 'ဥပမာ 2')) : `n = ${v}`}</button>`).join('');

    q('[data-rows]').innerHTML =
      `<p class="q-row-label">${pick(t(`ends in 1 — ${ones.length}`, `1 ဖြင့် ဆုံး — ${ones.length}`))}</p>${ones.map(row).join('')}`
      + (twos.length ? `<p class="q-row-label">${pick(t(`ends in 2 — ${twos.length}`, `2 ဖြင့် ဆုံး — ${twos.length}`))}</p>${twos.map(row).join('')}` : '');

    const label = document.getElementById('q-label');
    if (label) label.textContent = pick(t(`${all.length} ${all.length === 1 ? 'climb' : 'climbs'} of ${n}`, `${n} ၏ climb ${all.length} ခု`));

    q('[data-line]').innerHTML = pick(n === 1
      ? t('One step, one climb. A 2-step would overshoot, so nothing ends in 2.', 'step တစ်ခု၊ climb တစ်ခု။ 2-step သည် ကျော်သွားမည်ဖြစ်၍ 2 ဖြင့် ဆုံးသည့်အရာ မရှိပါ။')
      : t(`Cover the lit last move. The ${ones.length} climbs above it are every climb of ${n - 1}; the ${twos.length} below are every climb of ${n - 2}${n === 2 ? ' — the empty climb, which is why ways(0) = 1' : ''}.`,
          `အလင်းပြထားသော နောက်ဆုံး အလှမ်းကို ဖုံးကြည့်ပါ။ အပေါ်ရှိ climb ${ones.length} ခုသည် ${n - 1} ၏ climb အားလုံး ဖြစ်ပြီး အောက်ရှိ ${twos.length} ခုသည် ${n - 2} ၏ climb အားလုံး ဖြစ်သည်${n === 2 ? ' — ဘာမျှ မတက်ခြင်း၊ ways(0) = 1 ဖြစ်ရခြင်း အကြောင်းရင်း' : ''}။`));

    // the ledger is a formula, as on x-sum
    q('[data-expr]').innerHTML = n === 1 ? 'ways(1) = 1' : `ways(${n - 1}) + ways(${n - 2}) = ${ones.length} + ${twos.length}`;
    q('[data-total]').innerHTML = `${all.length}<small>${pick(t('ways', 'နည်း'))}</small>`;
  }

  host.addEventListener('input', (ev) => {
    if (ev.target.id !== 'qw-n') return;
    state.n = Number(ev.target.value); render();
  });
  host.addEventListener('click', (ev) => {
    const chip = ev.target.closest('[data-n]');
    if (!chip) return;
    state.n = Number(chip.dataset.n);
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
  naive: {
    idea: t("Every climb ends with a 1-step or a 2-step, so the ways to reach step n are the ways to reach n − 1 plus the ways to reach n − 2.",
        "climb တိုင်းသည် 1-step သို့မဟုတ် 2-step ဖြင့် ဆုံးသဖြင့် step n သို့ ရောက်ရန် နည်းများမှာ n − 1 သို့ ရောက်ရန် နည်းများနှင့် n − 2 သို့ ရောက်ရန် နည်းများ ပေါင်းလဒ် ဖြစ်သည်။"),
    steps: [
      t("Steps 0 and 1 have one way each: return 1.",
        "step 0 နှင့် 1 တွင် နည်း တစ်နည်းစီ ရှိသည် — 1 ကို ပြန်ပေးသည်။"),
      t("<code>one</code> = the ways to reach n − 1.",
        "<code>one</code> = n − 1 သို့ ရောက်ရန် နည်းများ။"),
      t("<code>two</code> = the ways to reach n − 2.",
        "<code>two</code> = n − 2 သို့ ရောက်ရန် နည်းများ။"),
      t("Return <code>one + two</code>.",
        "<code>one + two</code> ကို ပြန်ပေးသည်။"),
    ],
    cost: t("small steps are worked out again in every branch: 3,672,623,805 calls at n = 45.",
        "step ငယ်များကို branch တိုင်းတွင် ပြန်တွက်သည် — n = 45 တွင် call 3,672,623,805။"),
  },
  memo: {
    idea: t("The same recurrence, but each answer is remembered the first time it is worked out, so no step is computed twice.",
        "recurrence အတူတူ၊ သို့သော် အဖြေတစ်ခုစီကို ပထမဆုံး တွက်သည့်အခါ မှတ်ထားသဖြင့် step တစ်ခုကို နှစ်ခါ မတွက်ရပါ။"),
    steps: [
      t("Steps 0 and 1 have one way each.",
        "step 0 နှင့် 1 တွင် နည်း တစ်နည်းစီ ရှိသည်။"),
      t("If <code>memo</code> already has n, return it.",
        "<code>memo</code> တွင် n ရှိပြီးသားဆိုလျှင် ၎င်းကို ပြန်ပေးသည်။"),
      t("Otherwise work out <code>one</code> and <code>two</code> as before.",
        "မရှိလျှင် ယခင်အတိုင်း <code>one</code> နှင့် <code>two</code> ကို တွက်သည်။"),
      t("Store <code>one + two</code> in <code>memo[n]</code> and return it.",
        "<code>one + two</code> ကို <code>memo[n]</code> တွင် သိမ်းပြီး ပြန်ပေးသည်။"),
    ],
    cost: t("each step is worked out once: 89 calls at n = 45, and a table of 44 entries.",
        "step တစ်ခုစီကို တစ်ကြိမ်သာ တွက်သည် — n = 45 တွင် call 89 နှင့် entry 44 ခုရှိ table။"),
  },
  dp: {
    idea: t("Each step needs only the two below it, so climb from the bottom holding just those two numbers.",
        "step တစ်ခုစီသည် ၎င်းအောက်ရှိ နှစ်ခုကိုသာ လိုသဖြင့် ထိုကိန်းနှစ်ခုကိုသာ ကိုင်၍ အောက်ခြေမှ တက်သည်။"),
    steps: [
      t("Start with <code>a = 1</code> and <code>b = 1</code>: the ways to reach steps 0 and 1.",
        "<code>a = 1</code> နှင့် <code>b = 1</code> ဖြင့် စသည် — step 0 နှင့် 1 သို့ ရောက်ရန် နည်းများ။"),
      t("Repeat n − 1 times: <code>a, b = b, a + b</code>.",
        "n − 1 ကြိမ် ထပ်လုပ်သည် — <code>a, b = b, a + b</code>။"),
      t("Return <code>b</code>.",
        "<code>b</code> ကို ပြန်ပေးသည်။"),
    ],
    cost: t("n − 1 additions and two integers: 44 additions at n = 45.",
        "ပေါင်းခြင်း n − 1 ကြိမ်နှင့် integer နှစ်ခု — n = 45 တွင် ပေါင်းခြင်း 44 ကြိမ်။"),
  },
};

/* ---------------- mount ----------------
 *
 * Last in the file on purpose: mountLesson runs the widget immediately, so
 * every const the widget reads must already be initialised. */

mountLesson({
  input: { n: 5 },
  controls: [
    { key: 'n', label: 'n', value: '5', parse: parseN, format: String },
  ],
  presets: [
    { label: exampleTitle(1), input: { n: 2 } },
    { label: exampleTitle(2), input: { n: 3 } },
    { label: t('n = 1', 'n = 1'), input: { n: 1 } },
    { label: t('n = 5', 'n = 5'), input: { n: 5 } },
    { label: t('n = 8', 'n = 8'), input: { n: 8 } },
  ],
  examples: [
    { title: exampleTitle(1), inputHtml: '<code>n = 2</code>', output: '2',
      why: [t('1 step + 1 step, or one 2-step.', 'step 1 + step 1၊ သို့မဟုတ် 2-step တစ်ခု။'),
            t('In the recurrence: ways(1) + ways(0) = 1 + 1 — the empty climb of step 0 counts as one way.',
              'recurrence အရ — ways(1) + ways(0) = 1 + 1 — step 0 ၏ ဘာမျှ မတက်ခြင်းကို နည်း တစ်နည်းဟု ရေတွက်သည်။')],
      load: { n: 2 } },
    { title: exampleTitle(2), inputHtml: '<code>n = 3</code>', output: '3',
      why: [t('1 + 1 + 1, 1 + 2, and 2 + 1 — order matters, so 1 + 2 and 2 + 1 are different climbs.',
              '1 + 1 + 1၊ 1 + 2 နှင့် 2 + 1 — အစီအစဉ် အရေးကြီးသဖြင့် 1 + 2 နှင့် 2 + 1 သည် မတူသော climb များ ဖြစ်သည်။'),
            t('Two of them end in 1 (the climbs of 2) and one ends in 2 (the climb of 1): 2 + 1 = 3.',
              'နှစ်ခုသည် 1 ဖြင့် ဆုံးပြီး (2 ၏ climb များ) တစ်ခုသည် 2 ဖြင့် ဆုံးသည် (1 ၏ climb) — 2 + 1 = 3။')],
      load: { n: 3 } },
  ],
  modes: [
    { id: 'naive', name: 'Plain recursion',
      desc: t('ways(n) = ways(n−1) + ways(n−2), recomputed every time.', 'ways(n) = ways(n−1) + ways(n−2) ကို အကြိမ်တိုင်း ပြန်တွက်သည်။'),
      cost: 'O(φⁿ) time · O(n) stack', build: buildNaive },
    { id: 'memo', name: 'Recursion + memo',
      desc: t('The same recursion, but each step is worked out once.', 'recursion အတူတူ၊ သို့သော် step တစ်ခုစီကို တစ်ကြိမ်သာ တွက်သည်။'),
      cost: 'O(n) time · O(n) memo', build: buildMemo },
    { id: 'dp', name: 'Two variables',
      desc: t('Walk up from the bottom, keeping only the last two.', 'အောက်ခြေမှ တက်၊ နောက်ဆုံး နှစ်ခုကိုသာ ထားသည်။'),
      cost: 'O(n) time · O(1) space', build: buildDp },
  ],
  languages: LANGUAGES,
  code: CODE,
  solutions: {
    naive: { approach: APPROACH.naive, desc: t('The recurrence, written straight down. Correct for every n, and exponential: n = 45 makes 3,672,623,805 calls because the small steps are recomputed inside every branch.',
                     'recurrence ကို တိုက်ရိုက် ချရေးခြင်း။ n တိုင်းအတွက် မှန်ပြီး exponential ဖြစ်သည် — step ငယ်များကို branch တိုင်းအတွင်း ပြန်တွက်သဖြင့် n = 45 သည် call 3,672,623,805 ခု ဖြစ်စေသည်။') },
    memo: { approach: APPROACH.memo, desc: t('The same recursion with a table in front of it: each step is worked out once and looked up after that — 89 calls for n = 45.',
                    'ရှေ့တွင် table တစ်ခုပါသော recursion အတူတူ — step တစ်ခုစီကို တစ်ကြိမ် တွက်ပြီး နောက်ပိုင်း ရှာဖတ်သည် — n = 45 အတွက် call 89 ခု။') },
    dp: { approach: APPROACH.dp, desc: t('Each step only needs the two below it, so walk up from step 1 carrying just those two. No recursion, no table: 44 additions for n = 45.',
                  'step တစ်ခုစီသည် ၎င်းအောက်ရှိ နှစ်ခုကိုသာ လိုသဖြင့် step 1 မှ ထိုနှစ်ခုကိုသာ သယ်၍ တက်သည်။ recursion မရှိ၊ table မရှိ — n = 45 အတွက် ပေါင်းခြင်း 44 ကြိမ်။') },
  },
  // How each language was actually checked, printed as the part 3 badges.
  // The input is a single n in 1..45, so memo and two-variable ran on every
  // one of them, against an oracle that counts arrangements of 1s and 2s
  // with binomials (itself checked by enumerating every climb up to 20).
  // Plain recursion ran on n = 1..35 in every language, and on n = 45, timed
  // on an Apple M5 Pro — right answer each time, and the time is the point.
  // Go and Rust ran in Docker (golang:1.23-alpine, rust:1-slim).
  verification: {
    ruby: { naive: 'ran here · n = 1–35, and 45 in 63 s', memo: 'ran here · every n, 1–45', dp: 'ran here · every n, 1–45' },
    python: { naive: 'ran here · n = 1–35, and 45 in 72 s', memo: 'ran here · every n, 1–45', dp: 'ran here · every n, 1–45' },
    javascript: { naive: 'ran here · n = 1–35, and 45 in 5.5 s', memo: 'ran here · every n, 1–45', dp: 'ran here · every n, 1–45' },
    go: { naive: 'ran here · n = 1–35, and 45 in 2.7 s · Go 1.23', memo: 'ran here · every n, 1–45 · Go 1.23', dp: 'ran here · every n, 1–45 · Go 1.23' },
    rust: { naive: 'ran here · n = 1–35, and 45 in 1.6 s · rustc 1.98', memo: 'ran here · every n, 1–45 · rustc 1.98', dp: 'ran here · every n, 1–45 · rustc 1.98' },
  },
  strip,
  stripLabel: t('The staircase — ways to reach each step, once something knows it', 'လှေကား — step တစ်ခုစီသို့ ရောက်ရန် နည်း (သိပြီးသည့်အခါ)'),
  draw,
  answer,
  vars,
  widget: mountLastMoveWidget,
});
