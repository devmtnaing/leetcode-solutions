/* Coin Change — LeetCode 322.
 *
 * The fewest coins for an amount is one coin plus the fewest for what is
 * left, tried for every coin. Written as plain recursion, that asks for the
 * same smaller amounts again and again — example 1 makes 527 calls to answer
 * 12 different questions. The table asks each question once, smallest first,
 * so every answer it needs is already written down.
 */
import { mountLesson } from '../../lib/stepper.js';
import { pick, onLangChange } from '../../lib/i18n.js';
import { cells, kv, stack, readout, slots, stagePanel } from '../../lib/stage.js';
import { t, exampleTitle, LANGUAGES, k, c, stageRow, stageGap } from '../../lib/kit.js';

const MAX_AMOUNT = 11;

function parseCoins(text) {
  const s = text.trim().replace(/^\[|\]$/g, '').trim();
  const coins = s ? s.split(',').map((x) => {
    const v = x.trim();
    const n = Number(v);
    if (v === '' || !Number.isInteger(n) || n < 1) throw new Error('positive integers, separated by commas');
    return n;
  }) : [];
  if (!coins.length) throw new Error('at least one coin');
  if (coins.length > 5) throw new Error('at most 5 coins, so the stage stays readable');
  if (new Set(coins).size !== coins.length) throw new Error('each coin once');
  return coins;
}

function parseAmount(text) {
  const n = Number(text);
  if (!Number.isInteger(n) || n < 0) throw new Error('a whole number, 0 or more');
  if (n > MAX_AMOUNT) throw new Error(`at most ${MAX_AMOUNT}: the recursion makes hundreds of calls already`);
  return n;
}

/* ---------------- step generators ---------------- */

function buildRecurse({ coins, amount }) {
  const steps = [];
  const frames = [];           // the call stack: { left, best }
  const solved = {};           // amount → how many calls have asked about it
  let calls = 0;
  const snap = (extra) => ({ view: 'recurse', stack: frames.map((f) => ({ ...f })), solved: { ...solved }, calls, result: null, coin: null, ...extra });
  const show = (v) => (v >= Infinity ? '∞' : v);

  function fewest(left) {
    calls += 1;
    solved[left] = (solved[left] ?? 0) + 1;
    frames.push({ left, best: null });
    const top = frames.at(-1);
    if (left === 0) {
      steps.push(snap({ line: 'zero', tag: t('0 → 0', '0 → 0'),
        note: t('<code>left</code> is 0: no coins needed. Return 0.', '<code>left</code> သည် 0 — coin မလို။ 0 ကို ပြန်ပေးသည်။') }));
      frames.pop();
      return 0;
    }
    top.best = Infinity;
    steps.push(snap({ line: 'init', tag: t(`fewest(${left})`, `fewest(${left})`),
      note: solved[left] > 1
        ? t(`<code>fewest(${left})</code> — this amount has now been asked <b>${solved[left]}</b> times, and it is worked out again from nothing.`,
            `<code>fewest(${left})</code> — ဤ amount ကို <b>${solved[left]}</b> ကြိမ်မြောက် မေးခြင်း။ အစမှ ပြန်တွက်သည်။`)
        : t(`<code>fewest(${left})</code>: try every coin, keep the best. <code>best</code> starts at ∞ — not reachable yet.`,
            `<code>fewest(${left})</code> — coin တိုင်းကို စမ်း၊ အကောင်းဆုံးကို ထား။ <code>best</code> ကို ∞ — မရောက်နိုင်သေး — ဖြင့် စသည်။`) }));
    for (const coin of coins) {
      if (coin > left) {
        steps.push(snap({ coin, line: 'skip', tag: t(`${coin} &gt; ${left}`, `${coin} &gt; ${left}`),
          note: t(`Coin ${coin} is bigger than ${left}: skip it.`, `coin ${coin} သည် ${left} ထက် ကြီးသည် — ကျော်သည်။`) }));
        continue;
      }
      const r = fewest(left - coin);
      const was = top.best;
      top.best = Math.min(top.best, r + 1);
      steps.push(snap({ coin, line: 'take', tag: t(`${coin} + fewest(${left - coin})`, `${coin} + fewest(${left - coin})`),
        note: r >= Infinity
          ? t(`Back in <code>fewest(${left})</code>: after coin ${coin}, ${left - coin} cannot be made, so this coin does not help. <code>best</code> stays ${show(top.best)}.`,
              `<code>fewest(${left})</code> သို့ ပြန်ရောက် — coin ${coin} ပြီးနောက် ${left - coin} ကို မဖွဲ့နိုင်သဖြင့် ဤ coin မကူညီပါ။ <code>best</code> သည် ${show(top.best)} အတိုင်း။`)
          : t(`Back in <code>fewest(${left})</code>: coin ${coin} plus ${r} for the remaining ${left - coin} is ${r + 1}. <code>best</code> = min(${show(was)}, ${r + 1}) = <b>${show(top.best)}</b>.`,
              `<code>fewest(${left})</code> သို့ ပြန်ရောက် — coin ${coin} + ကျန် ${left - coin} အတွက် ${r} = ${r + 1}။ <code>best</code> = min(${show(was)}, ${r + 1}) = <b>${show(top.best)}</b>။`) }));
    }
    steps.push(snap({ line: 'back', tag: t(`return ${show(top.best)}`, `${show(top.best)} ပြန်`),
      note: t(`<code>fewest(${left})</code> returns <b>${show(top.best)}</b>.`, `<code>fewest(${left})</code> သည် <b>${show(top.best)}</b> ကို ပြန်ပေးသည်။`) }));
    frames.pop();
    return top.best;
  }

  steps.push(snap({ line: 'call', tag: t(`fewest(${amount})`, `fewest(${amount})`),
    note: t(`The fewest coins for ${amount} is one coin plus the fewest for what that coin leaves. Ask it directly, recursively.`,
            `${amount} အတွက် အနည်းဆုံး coin သည် coin တစ်ခု + ထို coin ချန်ထားသည့်အတွက် အနည်းဆုံး ဖြစ်သည်။ recursion ဖြင့် တိုက်ရိုက် မေးသည်။`) }));
  const best = fewest(amount);
  const result = best >= Infinity ? -1 : best;
  const distinct = Object.keys(solved).length;
  steps.push(snap({ result, finished: true, line: 'ret', tag: t(`return ${result}`, `${result} ပြန်`),
    note: t(`Return <b>${result}</b>${result === -1 ? ' — no mix of coins makes the amount' : ''}. That took ${calls} ${calls === 1 ? 'call' : 'calls'} to answer ${distinct} different ${distinct === 1 ? 'question' : 'questions'}.`,
            `<b>${result}</b> ကို ပြန်ပေးသည်${result === -1 ? ' — မည်သည့် coin ပေါင်းစပ်မှုမျှ amount ကို မဖွဲ့နိုင်ပါ' : ''}။ မတူသော မေးခွန်း ${distinct} ခုကို ဖြေရန် call ${calls} ကြိမ် ကုန်ခဲ့သည်။`) }));
  return steps;
}

function buildTable({ coins, amount }) {
  const steps = [];
  const dp = Array(amount + 1).fill(amount + 1);
  const snap = (extra) => ({ view: 'table', dp: [...dp], a: null, coin: null, from: null, result: null, ...extra });

  steps.push(snap({ line: 'init', tag: t(`${amount + 1} cells`, `cell ${amount + 1} ခု`),
    note: t(`<code>dp[a]</code> will be the fewest coins for amount a. Fill every cell with ${amount + 1} — more coins than any real answer could use — to mean "not reached".`,
            `<code>dp[a]</code> သည် amount a အတွက် အနည်းဆုံး coin ဖြစ်မည်။ cell တိုင်းကို ${amount + 1} — မည်သည့် တကယ့်အဖြေထက်မဆို ပိုများသော coin — ဖြင့် ဖြည့်ပြီး "မရောက်သေး" ဟု အဓိပ္ပာယ်ယူသည်။`) }));
  dp[0] = 0;
  steps.push(snap({ a: 0, line: 'base', tag: t('dp[0] = 0', 'dp[0] = 0'),
    note: t('<code>dp[0]</code> = 0: nothing to pay, no coins.', '<code>dp[0]</code> = 0 — ပေးစရာ မရှိ၊ coin မလို။') }));
  for (let a = 1; a <= amount; a++) {
    steps.push(snap({ a, line: 'amt', tag: t(`a = ${a}`, `a = ${a}`),
      note: t(`Amount <b>${a}</b>. Every smaller amount is already final.`, `amount <b>${a}</b>။ ပိုငယ်သော amount တိုင်း ပြီးဆုံးပြီ။`) }));
    for (const coin of coins) {
      if (coin > a) {
        steps.push(snap({ a, coin, line: 'skip', tag: t(`${coin} &gt; ${a}`, `${coin} &gt; ${a}`),
          note: t(`Coin ${coin} is bigger than ${a}: skip it.`, `coin ${coin} သည် ${a} ထက် ကြီးသည် — ကျော်သည်။`) }));
        continue;
      }
      const was = dp[a];
      const via = dp[a - coin] + 1;
      dp[a] = Math.min(dp[a], via);
      const reached = dp[a - coin] <= amount;
      steps.push(snap({ a, coin, from: a - coin, improved: dp[a] < was, line: 'take', tag: t(`via ${coin}`, `${coin} ဖြင့်`),
        note: reached
          ? t(`Last coin ${coin}: <code>dp[${a - coin}]</code> + 1 = ${via}. <code>dp[${a}]</code> = min(${was > amount ? `${was} (not reached)` : was}, ${via}) = <b>${dp[a]}</b>.`,
              `နောက်ဆုံး coin ${coin} — <code>dp[${a - coin}]</code> + 1 = ${via}။ <code>dp[${a}]</code> = min(${was > amount ? `${was} (မရောက်သေး)` : was}, ${via}) = <b>${dp[a]}</b>။`)
          : t(`Last coin ${coin}: but ${a - coin} was never reached, so ${via} is still more than any real answer. <code>dp[${a}]</code> stays ${dp[a]}.`,
              `နောက်ဆုံး coin ${coin} — သို့သော် ${a - coin} ကို ဘယ်တော့မှ မရောက်ခဲ့သဖြင့် ${via} သည် တကယ့်အဖြေထက် ပိုများနေဆဲ။ <code>dp[${a}]</code> သည် ${dp[a]} အတိုင်း။`) }));
    }
  }
  const result = dp[amount] > amount ? -1 : dp[amount];
  steps.push(snap({ a: amount, result, finished: true, line: 'ret', tag: t(`return ${result}`, `${result} ပြန်`),
    note: result === -1
      ? t(`<code>dp[${amount}]</code> is still ${dp[amount]}, the "not reached" mark. Return <b>-1</b>.`,
          `<code>dp[${amount}]</code> သည် "မရောက်သေး" အမှတ် ${dp[amount]} အတိုင်း။ <b>-1</b> ကို ပြန်ပေးသည်။`)
      : t(`Return <code>dp[${amount}]</code> = <b>${result}</b>. Each amount was worked out once, from answers already in the table.`,
          `<code>dp[${amount}]</code> = <b>${result}</b> ကို ပြန်ပေးသည်။ amount တစ်ခုစီကို table ထဲ ရှိပြီးသား အဖြေများမှ တစ်ကြိမ်သာ တွက်ခဲ့သည်။`) }));
  return steps;
}

/* ---------------- drawing ----------------
 *
 * The strip is the coins, with the one being tried lit. The stage holds what
 * each approach carries: the call stack and how often each amount has been
 * asked about, or the table, where each cell is written once. */

function strip(s, { coins }) {
  const tone = {};
  if (s.coin != null) tone[coins.indexOf(s.coin)] = s.line === 'skip' ? 'leaving' : 'inwin';
  return cells(coins, { tone });
}

function draw(s, { amount }) {
  if (s.view === 'recurse') {
    const frames = s.stack.map((f) => `fewest(${f.left})${f.best == null ? '' : ` · best ${f.best >= Infinity ? '∞' : f.best}`}`);
    const top = s.stack.at(-1);
    const tone = {};
    for (const [amt, n] of Object.entries(s.solved)) if (n > 1) tone[amt] = 'warn';
    return stagePanel(pick(t('The call stack', 'call stack')), pick(t(`${s.calls} calls so far`, `ယခုထိ call ${s.calls} ကြိမ်`)),
      stack(frames, { label: pick(t('deepest call on top', 'အနက်ဆုံး call က အပေါ်')) })
        + stageGap + kv(s.solved, { at: top ? String(top.left) : null, tone, keyName: 'amount', valName: 'times asked' }));
  }
  const tone = {};
  s.dp.forEach((v, x) => { if (v > amount) tone[x] = 'done'; });
  if (s.from != null) tone[s.from] = 'entering';
  if (s.a != null) tone[s.a] = s.improved || s.line === 'base' || s.finished ? 'entering' : 'inwin';
  const marks = {};
  if (s.a != null) marks[s.a] = 'a';
  if (s.from != null) marks[s.from] = s.from === s.a ? 'a' : 'a − coin';
  return stagePanel(pick(t('dp — fewest coins for each amount', 'dp — amount တစ်ခုစီအတွက် အနည်းဆုံး coin')),
    pick(t(`faded = ${amount + 1}, not reached`, `မှိန် = ${amount + 1}၊ မရောက်သေး`)),
    stageRow(cells(s.dp, { tone, marks }), ''));
}

function answer(s) {
  return {
    html: slots(s.finished ? [s.result] : [], { total: 1, just: s.finished ? 0 : -1 }),
    note: s.finished ? (s.result === -1 ? t('cannot be made', 'မဖွဲ့နိုင်') : t('fewest coins', 'အနည်းဆုံး coin')) : t('a count, or -1', 'အရေအတွက်၊ သို့မဟုတ် -1'),
  };
}

function vars(s, { coins, amount }) {
  const base = [['amount', amount], ['coins', `[${coins.join(', ')}]`], ['coin', s.coin ?? '—']];
  if (s.view === 'recurse') {
    const top = s.stack.at(-1);
    return [...base, ['left', top ? top.left : '—'], ['best', !top || top.best == null ? '—' : top.best >= Infinity ? '∞' : top.best]];
  }
  return [...base, ['a', s.a ?? '—'], ['dp', `[${s.dp.join(', ')}]`], ['n', amount]];
}

/* ---------------- the code, one key per line ----------------
 *
 * Generated from the verified solution files, so the listing a reader copies
 * is byte-identical to the one that ran. */

const CODE = {
  recurse: {
    ruby: [
      [null, `${k('def')} coin_change(coins, amount)`],
      ['call', `  best = fewest(coins, amount)`],
      ['ret', `  best == Float::INFINITY ? -1 : best`],
      [null, `${k('end')}`],
      [null, ``],
      [null, `${k('def')} fewest(coins, left)`],
      ['zero', `  ${k('return')} 0 ${k('if')} left == 0`],
      ['init', `  best = Float::INFINITY`],
      [null, `  coins.each ${k('do')} |coin|`],
      ['skip', `    next ${k('if')} coin &gt; left`],
      ['take', `    best = [best, fewest(coins, left - coin) + 1].min`],
      [null, `  ${k('end')}`],
      ['back', `  best`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} coinChange(self, coins, amount):`],
      [null, `        ${k('def')} fewest(left):`],
      ['zero', `            ${k('if')} left == 0:`],
      [null, `                ${k('return')} 0`],
      ['init', `            best = float('inf')`],
      [null, `            ${k('for')} coin ${k('in')} coins:`],
      ['skip', `                ${k('if')} coin &gt; left:`],
      [null, `                    continue`],
      ['take', `                best = min(best, fewest(left - coin) + 1)`],
      ['back', `            ${k('return')} best`],
      [null, ``],
      ['call', `        best = fewest(amount)`],
      ['ret', `        ${k('return')} -1 ${k('if')} best == float('inf') ${k('else')} best`],
    ],
    javascript: [
      [null, `${k('const')} coinChange = ${k('function')} (coins, amount) {`],
      [null, `  ${k('const')} fewest = (left) =&gt; {`],
      ['zero', `    ${k('if')} (left === 0) ${k('return')} 0;`],
      ['init', `    ${k('let')} best = Infinity;`],
      [null, `    ${k('for')} (${k('const')} coin ${k('of')} coins) {`],
      ['skip', `      ${k('if')} (coin &gt; left) continue;`],
      ['take', `      best = Math.min(best, fewest(left - coin) + 1);`],
      [null, `    }`],
      ['back', `    ${k('return')} best;`],
      [null, `  };`],
      ['call', `  ${k('const')} best = fewest(amount);`],
      ['ret', `  ${k('return')} best === Infinity ? -1 : best;`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} coinChange(coins []int, amount int) int {`],
      [null, `    const inf = 1 &lt;&lt; 30`],
      [null, `    ${k('var')} fewest ${k('func')}(left int) int`],
      [null, `    fewest = ${k('func')}(left int) int {`],
      ['zero', `        ${k('if')} left == 0 {`],
      [null, `            ${k('return')} 0`],
      [null, `        }`],
      ['init', `        best := inf`],
      [null, `        ${k('for')} _, coin := ${k('range')} coins {`],
      ['skip', `            ${k('if')} coin &gt; left {`],
      [null, `                continue`],
      [null, `            }`],
      ['take', `            best = min(best, fewest(left-coin)+1)`],
      [null, `        }`],
      ['back', `        ${k('return')} best`],
      [null, `    }`],
      ['call', `    best := fewest(amount)`],
      ['ret', `    ${k('if')} best &gt;= inf {`],
      [null, `        ${k('return')} -1`],
      [null, `    }`],
      [null, `    ${k('return')} best`],
      [null, `}`],
    ],
    rust: [
      [null, `const INF: i32 = 1 &lt;&lt; 30;`],
      [null, ``],
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} coin_change(coins: Vec&lt;i32&gt;, amount: i32) -&gt; i32 {`],
      ['call', `        ${k('let')} best = ${k('Self')}::fewest(&amp;coins, amount);`],
      ['ret', `        ${k('if')} best &gt;= INF { -1 } ${k('else')} { best }`],
      [null, `    }`],
      [null, ``],
      [null, `    ${k('fn')} fewest(coins: &amp;[i32], left: i32) -&gt; i32 {`],
      ['zero', `        ${k('if')} left == 0 {`],
      [null, `            ${k('return')} 0;`],
      [null, `        }`],
      ['init', `        ${k('let')} ${k('mut')} best = INF;`],
      [null, `        ${k('for')} &amp;coin ${k('in')} coins {`],
      ['skip', `            ${k('if')} coin &gt; left {`],
      [null, `                continue;`],
      [null, `            }`],
      ['take', `            best = best.min(${k('Self')}::fewest(coins, left - coin) + 1);`],
      [null, `        }`],
      ['back', `        best`],
      [null, `    }`],
      [null, `}`],
    ],
  },
  table: {
    ruby: [
      [null, `${k('def')} coin_change(coins, amount)`],
      ['init', `  dp = Array.new(amount + 1, amount + 1)`],
      ['base', `  dp[0] = 0`],
      ['amt', `  (1..amount).each ${k('do')} |a|`],
      [null, `    coins.each ${k('do')} |coin|`],
      ['skip', `      next ${k('if')} coin &gt; a`],
      ['take', `      dp[a] = [dp[a], dp[a - coin] + 1].min`],
      [null, `    ${k('end')}`],
      [null, `  ${k('end')}`],
      ['ret', `  dp[amount] &gt; amount ? -1 : dp[amount]`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} coinChange(self, coins, amount):`],
      ['init', `        dp = [amount + 1] * (amount + 1)`],
      ['base', `        dp[0] = 0`],
      ['amt', `        ${k('for')} a ${k('in')} range(1, amount + 1):`],
      [null, `            ${k('for')} coin ${k('in')} coins:`],
      ['skip', `                ${k('if')} coin &gt; a:`],
      [null, `                    continue`],
      ['take', `                dp[a] = min(dp[a], dp[a - coin] + 1)`],
      ['ret', `        ${k('return')} -1 ${k('if')} dp[amount] &gt; amount ${k('else')} dp[amount]`],
    ],
    javascript: [
      [null, `${k('const')} coinChange = ${k('function')} (coins, amount) {`],
      ['init', `  ${k('const')} dp = ${k('new')} Array(amount + 1).fill(amount + 1);`],
      ['base', `  dp[0] = 0;`],
      ['amt', `  ${k('for')} (${k('let')} a = 1; a &lt;= amount; a++) {`],
      [null, `    ${k('for')} (${k('const')} coin ${k('of')} coins) {`],
      ['skip', `      ${k('if')} (coin &gt; a) continue;`],
      ['take', `      dp[a] = Math.min(dp[a], dp[a - coin] + 1);`],
      [null, `    }`],
      [null, `  }`],
      ['ret', `  ${k('return')} dp[amount] &gt; amount ? -1 : dp[amount];`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} coinChange(coins []int, amount int) int {`],
      ['init', `    dp := make([]int, amount+1)`],
      [null, `    ${k('for')} a := 1; a &lt;= amount; a++ {`],
      [null, `        dp[a] = amount + 1`],
      [null, `    }`],
      ['base', `    dp[0] = 0`],
      ['amt', `    ${k('for')} a := 1; a &lt;= amount; a++ {`],
      [null, `        ${k('for')} _, coin := ${k('range')} coins {`],
      ['skip', `            ${k('if')} coin &gt; a {`],
      [null, `                continue`],
      [null, `            }`],
      ['take', `            dp[a] = min(dp[a], dp[a-coin]+1)`],
      [null, `        }`],
      [null, `    }`],
      ['ret', `    ${k('if')} dp[amount] &gt; amount {`],
      [null, `        ${k('return')} -1`],
      [null, `    }`],
      [null, `    ${k('return')} dp[amount]`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} coin_change(coins: Vec&lt;i32&gt;, amount: i32) -&gt; i32 {`],
      [null, `        ${k('let')} n = amount as usize;`],
      ['init', `        ${k('let')} ${k('mut')} dp = vec![amount + 1; n + 1];`],
      ['base', `        dp[0] = 0;`],
      ['amt', `        ${k('for')} a ${k('in')} 1..=n {`],
      [null, `            ${k('for')} &amp;coin ${k('in')} &amp;coins {`],
      [null, `                ${k('let')} coin = coin as usize;`],
      ['skip', `                ${k('if')} coin &gt; a {`],
      [null, `                    continue;`],
      [null, `                }`],
      ['take', `                dp[a] = dp[a].min(dp[a - coin] + 1);`],
      [null, `            }`],
      [null, `        }`],
      ['ret', `        ${k('if')} dp[n] &gt; amount { -1 } ${k('else')} { dp[n] }`],
      [null, `    }`],
      [null, `}`],
    ],
  },
};

/* ---------------- part 1: the "biggest coin first" widget ----------------
 *
 * The statement asks for the fewest coins, and the tempting reading is
 * greedy: take the biggest coin that fits, repeat. It works for [1,2,5] and
 * fails for [1,3,4], where 6 is 3 + 3, not 4 + 1 + 1. Drag the amount and
 * watch where greedy and the true answer part company.
 *
 * Built from x-sum's widget vocabulary: two rows of .q-arr cells (kept /
 * cut), the .q-slider, the amber .q-tie line and the .ledger. */

const QW_SETS = [
  { label: t('[1,3,4]', '[1,3,4]'), coins: [1, 3, 4], amount: 6 },
  { label: t('[1,2,5]', '[1,2,5]'), coins: [1, 2, 5], amount: 11 },
  { label: t('[2,5]', '[2,5]'), coins: [2, 5], amount: 8 },
];

function greedyPick(coins, amount) {
  const out = [];
  let left = amount;
  for (const c0 of [...coins].sort((a, b) => b - a)) while (left >= c0) { out.push(c0); left -= c0; }
  return left === 0 ? out : null;
}

function fewestPick(coins, amount) {
  const dp = Array(amount + 1).fill(Infinity);
  const via = Array(amount + 1).fill(0);
  dp[0] = 0;
  for (let a = 1; a <= amount; a++) for (const c0 of coins) if (c0 <= a && dp[a - c0] + 1 < dp[a]) { dp[a] = dp[a - c0] + 1; via[a] = c0; }
  if (dp[amount] === Infinity) return null;
  const out = [];
  for (let a = amount; a > 0; a -= via[a]) out.push(via[a]);
  return out.sort((a, b) => b - a);
}

function mountGreedyWidget(host) {
  const state = { set: 0, amount: 6 };
  host.innerHTML = `
    <div class="q-arr" data-greedy></div>
    <div class="q-arr" data-best></div>
    <div class="q-slider">
      <label for="qw-amt">amount</label>
      <input type="range" id="qw-amt" min="0" max="15" value="6">
      <output data-out>6</output>
      <span class="q-presets" data-presets></span>
    </div>
    <p class="q-tie" data-line></p>
    <div class="ledger">
      <span class="expr" data-expr></span>
      <span class="total" data-total></span>
    </div>`;
  const q = (sel) => host.querySelector(sel);
  const row = (label, list, cls) => `<span class="q-row-label">${label}</span>${list == null
    ? `<span class="q-empty">${pick(t('cannot', 'မရ'))}</span>`
    : list.length ? list.map((v) => `<div class="cell ${cls}"><span>${v}</span></div>`).join('') : '<span class="q-empty">0</span>'}`;

  function render() {
    const { coins } = QW_SETS[state.set];
    const amount = state.amount;
    const g = greedyPick(coins, amount);
    const b = fewestPick(coins, amount);
    const worse = g == null ? b != null : b != null && g.length > b.length;
    q('#qw-amt').value = String(amount);
    q('[data-out]').textContent = String(amount);
    q('[data-presets]').innerHTML = QW_SETS.map((x, j) =>
      `<button class="chip" data-set="${j}"${j === state.set ? ' aria-pressed="true"' : ''}>${pick(x.label)}</button>`).join('');
    q('[data-greedy]').innerHTML = row('greedy', g, worse ? 'cut' : 'kept');
    q('[data-best]').innerHTML = row('fewest', b, 'kept');
    const label = document.getElementById('q-label');
    if (label) label.textContent = `coins = [${coins.join(', ')}]`;
    q('[data-line]').innerHTML = pick(b == null
      ? t(`No mix of [${coins.join(', ')}] makes ${amount}: the answer is -1.`, `[${coins.join(', ')}] ၏ မည်သည့် ပေါင်းစပ်မှုမျှ ${amount} ကို မဖွဲ့နိုင်ပါ — အဖြေ -1။`)
      : g == null
        ? t(`Greedy gets stuck and would report -1 — but ${b.join(' + ')} makes ${amount}.`, `greedy ပိတ်မိပြီး -1 ဟု ပြောမည် — သို့သော် ${b.join(' + ')} က ${amount} ကို ဖွဲ့သည်။`)
        : worse
          ? t(`Greedy takes the biggest coin first and uses ${g.length}; ${b.join(' + ')} uses ${b.length}. The biggest coin is not always part of the best answer.`,
              `greedy သည် အကြီးဆုံး coin ကို အရင်ယူပြီး ${g.length} ခု သုံးသည် — ${b.join(' + ')} သည် ${b.length} ခုသာ သုံးသည်။ အကြီးဆုံး coin သည် အကောင်းဆုံး အဖြေ၏ အစိတ်အပိုင်း အမြဲ မဟုတ်ပါ။`)
          : t(`Here greedy happens to find the fewest. Try another amount or the [1,3,4] coins.`, `ဤနေရာတွင် greedy က အနည်းဆုံးကို တိုက်ဆိုင်စွာ ရှာတွေ့သည်။ အခြား amount သို့မဟုတ် [1,3,4] coin ကို စမ်းကြည့်ပါ။`));
    q('[data-expr]').innerHTML = `greedy ${g == null ? '−' : g.length} · fewest ${b == null ? '−' : b.length}`;
    q('[data-total]').innerHTML = `${b == null ? -1 : b.length}<small>${pick(t('answer', 'အဖြေ'))}</small>`;
  }
  host.addEventListener('input', (ev) => {
    if (ev.target.id !== 'qw-amt') return;
    state.amount = Number(ev.target.value); render();
  });
  host.addEventListener('click', (ev) => {
    const chip = ev.target.closest('[data-set]');
    if (!chip) return;
    const set = QW_SETS[Number(chip.dataset.set)];
    Object.assign(state, { set: Number(chip.dataset.set), amount: set.amount });
    render();
  });
  onLangChange(render);
  render();
}

/* ---------------- the approach, in brief ---------------- */

const APPROACH = {
  recurse: {
    idea: t('The last coin is one of the coins. Try each: the fewest for the amount is one plus the fewest for what that coin leaves. Ask that as a function call, all the way down to 0.',
            'နောက်ဆုံး coin သည် coin များထဲက တစ်ခု ဖြစ်သည်။ တစ်ခုစီကို စမ်းသည် — amount အတွက် အနည်းဆုံးသည် 1 + ထို coin ချန်ထားသည့်အတွက် အနည်းဆုံး။ ၎င်းကို 0 အထိ function call အဖြစ် မေးသည်။'),
    steps: [
      t('<code>fewest(0)</code> is 0.', '<code>fewest(0)</code> သည် 0။'),
      t('For each <code>coin &lt;= left</code>: <code>best = min(best, fewest(left − coin) + 1)</code>.',
        '<code>coin &lt;= left</code> တစ်ခုစီအတွက် — <code>best = min(best, fewest(left − coin) + 1)</code>။'),
      t('A <code>best</code> still at ∞ means the amount cannot be made: return -1.', '<code>best</code> သည် ∞ အတိုင်း ရှိနေလျှင် amount ကို မဖွဲ့နိုင် — -1 ကို ပြန်ပေးသည်။'),
    ],
    cost: t('the same amounts are asked again and again: 527 calls for example 1, 64,207 for amount 20, 924,876 for 25 — exponential in the amount.',
            'amount တူတူကို ထပ်ခါထပ်ခါ မေးသည် — ဥပမာ 1 အတွက် call 527၊ amount 20 အတွက် 64,207၊ 25 အတွက် 924,876 — amount အလိုက် exponential။'),
  },
  table: {
    idea: t('Answer the same question for every amount from 0 up, and write each answer down. When amount a needs the answer for a − coin, it is already in the table.',
            'မေးခွန်းတူကို 0 မှ အထက် amount တိုင်းအတွက် ဖြေပြီး အဖြေတိုင်းကို ချရေးထားသည်။ amount a သည် a − coin ၏ အဖြေကို လိုသည့်အခါ table ထဲ ရှိပြီးသား ဖြစ်သည်။'),
    steps: [
      t('Fill <code>dp</code> with <code>amount + 1</code> — "not reached" — and set <code>dp[0] = 0</code>.',
        '<code>dp</code> ကို <code>amount + 1</code> — "မရောက်သေး" — ဖြင့် ဖြည့်ပြီး <code>dp[0] = 0</code> ထားသည်။'),
      t('For each <code>a</code> from 1, for each <code>coin &lt;= a</code>: <code>dp[a] = min(dp[a], dp[a − coin] + 1)</code>.',
        '1 မှ <code>a</code> တစ်ခုစီ၊ <code>coin &lt;= a</code> တစ်ခုစီအတွက် — <code>dp[a] = min(dp[a], dp[a − coin] + 1)</code>။'),
      t('Return -1 if <code>dp[amount]</code> is still more than <code>amount</code>.', '<code>dp[amount]</code> သည် <code>amount</code> ထက် ပိုနေဆဲ ဖြစ်လျှင် -1 ကို ပြန်ပေးသည်။'),
    ],
    cost: t('amount × coins steps: at most 12 × 10⁴ = 1.2 × 10⁵, and one array of amount + 1.',
            'amount × coins အဆင့် — အများဆုံး 12 × 10⁴ = 1.2 × 10⁵၊ amount + 1 array တစ်ခု။'),
  },
};

/* ---------------- mount ---------------- */

mountLesson({
  input: { coins: [1, 2, 5], amount: 7 },
  controls: [
    { key: 'coins', label: 'coins', value: '1, 2, 5', parse: parseCoins, format: (a) => a.join(', ') },
    { key: 'amount', label: 'amount', type: 'number', value: 7, parse: parseAmount },
  ],
  presets: [
    { label: exampleTitle(1), input: { coins: [1, 2, 5], amount: 11 } },
    { label: exampleTitle(2), input: { coins: [2], amount: 3 } },
    { label: exampleTitle(3), input: { coins: [1], amount: 0 } },
    { label: t('Greedy fails', 'greedy ကျ'), input: { coins: [1, 3, 4], amount: 6 } },
    { label: t('Small', 'အသေး'), input: { coins: [1, 2, 5], amount: 7 } },
  ],
  examples: [
    { title: exampleTitle(1), inputHtml: '<code>coins = [1,2,5]</code>, <code>amount = 11</code>', output: '3',
      why: [t('11 = 5 + 5 + 1. No two coins reach 11.', '11 = 5 + 5 + 1။ coin နှစ်ခုဖြင့် 11 မရောက်ပါ။')],
      load: { coins: [1, 2, 5], amount: 11 } },
    { title: exampleTitle(2), inputHtml: '<code>coins = [2]</code>, <code>amount = 3</code>', output: '-1',
      why: [t('Only 2s: every total is even, and 3 is odd.', '2 များသာ — ပေါင်းလဒ်တိုင်း စုံဂဏန်း ဖြစ်ပြီး 3 သည် မဂဏန်း။')],
      load: { coins: [2], amount: 3 } },
    { title: exampleTitle(3), inputHtml: '<code>coins = [1]</code>, <code>amount = 0</code>', output: '0',
      why: [t('Nothing to pay takes no coins — 0, not -1.', 'ပေးစရာ မရှိလျှင် coin မလို — 0၊ -1 မဟုတ်ပါ။')],
      load: { coins: [1], amount: 0 } },
  ],
  modes: [
    { id: 'recurse', name: 'Plain recursion',
      desc: t('Try every last coin; ask the rest recursively.', 'နောက်ဆုံး coin တိုင်းကို စမ်း၊ ကျန်ကို recursion ဖြင့် မေး။'),
      cost: 'exponential time · O(amount) stack', build: buildRecurse },
    { id: 'table', name: 'Bottom-up table',
      sub: t('dynamic programming', 'dynamic programming'),
      desc: t('Every amount from 0 up, each answered once.', '0 မှ အထက် amount တိုင်း၊ တစ်ခုစီ တစ်ကြိမ်သာ ဖြေ။'),
      cost: 'O(amount · coins) time · O(amount) space', build: buildTable },
  ],
  languages: LANGUAGES,
  code: CODE,
  solutions: {
    recurse: { approach: APPROACH.recurse,
      desc: t('The recurrence written straight down. Correct, and exponential: it solves the same smaller amounts over and over, and times out long before amount = 10⁴.',
              'recurrence ကို တိုက်ရိုက် ရေးထားခြင်း။ မှန်သည်၊ သို့သော် exponential — amount ငယ်များကို ထပ်ခါထပ်ခါ ဖြေပြီး amount = 10⁴ မရောက်မီ ကြာလွန်းသည်။') },
    table: { approach: APPROACH.table,
      desc: t('The submission worth writing: the same recurrence, filled in from 0 upward so each amount is solved once. <code>amount + 1</code> marks "not reached" without the overflow an <code>INT_MAX</code> sentinel invites.',
              'ရေးသင့်သည့် submission — recurrence တူတူကို 0 မှ အထက်သို့ ဖြည့်သဖြင့် amount တစ်ခုစီကို တစ်ကြိမ်သာ ဖြေသည်။ <code>amount + 1</code> သည် <code>INT_MAX</code> sentinel ဖြစ်စေတတ်သော overflow မပါဘဲ "မရောက်သေး" ကို မှတ်သည်။') },
  },
  // How each language was actually checked, printed as the part 3 badges.
  // The corpus: the 3 examples, 6 edges, 15,000 random cases of 1–4 coins
  // from 1..10 with amounts 0..12, 5,000 of up to 12 coins with amounts up to
  // 500, and five at amount = 10⁴ — against a breadth-first search over the
  // amounts. The plain recursion runs only the 15,131 cases with amount ≤ 12.
  // Go and Rust ran in Docker (golang:1.23-alpine, rust:1-slim).
  verification: {
    ruby: { recurse: 'ran here · 15,131 cases, amount ≤ 12 only', table: 'ran here · 20,014 cases' },
    python: { recurse: 'ran here · 15,131 cases, amount ≤ 12 only', table: 'ran here · 20,014 cases' },
    javascript: { recurse: 'ran here · 15,131 cases, amount ≤ 12 only', table: 'ran here · 20,014 cases' },
    go: { recurse: 'ran here · 15,131 cases, amount ≤ 12 only · Go 1.23', table: 'ran here · 20,014 cases · Go 1.23' },
    rust: { recurse: 'ran here · 15,131 cases, amount ≤ 12 only · rustc 1.98', table: 'ran here · 20,014 cases · rustc 1.98' },
  },
  stripLabel: t('coins', 'coins'),
  strip,
  draw,
  answer,
  vars,
  widget: mountGreedyWidget,
});
