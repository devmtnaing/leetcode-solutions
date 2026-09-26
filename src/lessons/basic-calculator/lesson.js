/* Basic Calculator — LeetCode 224.
 *
 * With only + and −, an expression is a sum of signed numbers; brackets only
 * matter because a minus in front of one flips every sign inside it. So read
 * left to right keeping three things: the total so far, the sign of the next
 * term, and the number being read. At "(" the outer total and sign must wait
 * while the bracket is summed from scratch; at ")" the bracket's value is
 * handed back as if it were a number. The call stack can do the waiting (a
 * recursive parser), or an explicit stack of (total, sign) pairs can.
 */
import { mountLesson } from '../../lib/stepper.js';
import { pick, onLangChange } from '../../lib/i18n.js';
import { cells, slots, stagePanel, stack, readout } from '../../lib/stage.js';
import { t, exampleTitle, LANGUAGES, k, c, stageGap, presetChips, widgetLabel } from '../../lib/kit.js';

const MAX_LEN = 24;

/* A valid expression by the statement's rules: digits, + - ( ) and spaces;
 * unary minus only at the start or just after "("; no unary plus; no two
 * operators in a row; brackets balanced and never empty. */
function parseExpr(text) {
  const s = String(text).replace(/^"|"$/g, '');
  if (!s.trim()) throw new Error('an expression, like 1 + (2 - 3)');
  if (!/^[\d+\-() ]+$/.test(s)) throw new Error('digits, + - ( ) and spaces only');
  if (s.length > MAX_LEN) throw new Error(`at most ${MAX_LEN} characters here, so the stage stays readable`);
  const toks = s.replace(/ /g, '').match(/\d+|[+\-()]/g);
  let depth = 0, prev = 'start';
  for (const x of toks) {
    const kind = /\d/.test(x) ? 'num' : x;
    if (kind === 'num' && (prev === 'num' || prev === ')')) throw new Error('an operator between numbers');
    if (kind === '(' && (prev === 'num' || prev === ')')) throw new Error('an operator before "("');
    if (kind === '+' && (prev === 'start' || prev === '(')) throw new Error('"+" cannot be unary');
    if ((kind === '+' || kind === '-') && (prev === '+' || prev === '-')) throw new Error('no two operators in a row');
    if (kind === ')' && (prev === '(' || prev === '+' || prev === '-' || prev === 'start')) throw new Error('nothing to close there');
    if (kind === 'num' && Number(x) > 2 ** 31 - 1) throw new Error('numbers fit in 32 bits');
    depth += kind === '(' ? 1 : kind === ')' ? -1 : 0;
    if (depth < 0) throw new Error('a ")" with no "(" before it');
    prev = kind;
  }
  if (depth) throw new Error('every "(" needs its ")"');
  if (prev === '+' || prev === '-') throw new Error('it cannot end on an operator');
  return s;
}

const sgn = (x) => (x > 0 ? '+' : '−');

/* ---------------- step generators ---------------- */

function charStep(ch, st, i, extra) {
  // one step for a digit or an operator, shared by both approaches
  if (ch >= '0' && ch <= '9') {
    const was = st.num;
    st.num = st.num * 10 + Number(ch);
    return { line: 'digit', tag: t(`num = ${st.num}`, `num = ${st.num}`),
      note: was
        ? t(`Another digit: num = ${was} × 10 + ${ch} = ${st.num}. A number can run over several characters.`, `နောက်ထပ် digit — num = ${was} × 10 + ${ch} = ${st.num}။ ကိန်းတစ်ခုသည် စာလုံး အများအပြား ရှည်နိုင်သည်။`)
        : t(`A digit starts a number: num = ${st.num}.`, `digit က ကိန်းတစ်ခုကို စသည် — num = ${st.num}။`), ...extra };
  }
  const add = st.sign * st.num;
  const term = `${st.sign > 0 ? '' : '−'}${st.num}`;
  st.total += add;
  st.sign = ch === '+' ? 1 : -1;
  st.num = 0;
  return { line: 'op', tag: t(`total ${st.total}, sign ${sgn(st.sign)}`, `total ${st.total}, sign ${sgn(st.sign)}`),
    note: t(`"${ch}" ends the term before it: total += ${term} → ${st.total}. The next term will be ${ch === '+' ? 'added' : 'taken away'}.${i === st.first ? ' Nothing came before it, so it is a unary minus: total starts at 0, and 0 − x is −x.' : ''}`,
            `"${ch}" သည် ၎င်းရှေ့ရှိ term ကို အဆုံးသတ်သည် — total += ${term} → ${st.total}။ နောက် term ကို ${ch === '+' ? 'ပေါင်း' : 'နုတ်'}မည်။${i === st.first ? ' ရှေ့တွင် ဘာမှမရှိသဖြင့် unary minus — total သည် 0 မှ စပြီး 0 − x သည် −x။' : ''}`), ...extra };
}

function buildStack({ s }) {
  const st = { total: 0, sign: 1, num: 0, first: 0 };
  const stk = [];
  const steps = [];
  const snap = (extra) => ({ view: 'stack', total: st.total, sign: st.sign, num: st.num, stack: stk.map((x) => [...x]), i: null, ...extra });
  steps.push(snap({ line: 'init', tag: t('total 0, sign +', 'total 0, sign +'),
    note: t('total is the sum so far inside the current brackets, sign the sign of the next term, num the number being read. The stack is empty: no bracket is open.',
            'total သည် လက်ရှိ ကွင်းအတွင်း ယခုထိ ပေါင်းလဒ်၊ sign သည် နောက် term ၏ sign၊ num သည် ဖတ်နေသော ကိန်း။ stack ဗလာ — ကွင်း မဖွင့်ရသေး။') }));
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === ' ') continue;
    st.first = s.slice(0, i).trim() === '' || s.slice(0, i).trimEnd().endsWith('(') ? i : -1;
    if (ch === '(') {
      stk.push([st.total, st.sign]);
      const [ot, os] = stk.at(-1);
      st.total = 0; st.sign = 1; st.num = 0;
      steps.push(snap({ i, line: 'open', tag: t(`push (${ot}, ${sgn(os)})`, `push (${ot}, ${sgn(os)})`),
        note: t(`"(": the bracket must be summed on its own first. Push what is waiting outside — total ${ot}, and the sign ${sgn(os)} in front of the bracket — then start afresh inside.`,
                `"(" — ကွင်းကို သီးခြား အရင် ပေါင်းရမည်။ အပြင်တွင် စောင့်နေသည့်အရာ — total ${ot} နှင့် ကွင်းရှေ့ရှိ sign ${sgn(os)} — ကို push ပြီး အတွင်းတွင် အသစ်စသည်။`) }));
    } else if (ch === ')') {
      const val = st.total + st.sign * st.num;
      const [ot, os] = stk.pop();
      st.num = val; st.total = ot; st.sign = os;
      steps.push(snap({ i, line: 'close', tag: t(`bracket = ${val}`, `ကွင်း = ${val}`),
        note: t(`")": the bracket is worth ${val}. Pop what was waiting — total ${ot}, sign ${sgn(os)} — and treat ${val} as the number just read, so the next operator (or the end) adds it with that sign.`,
                `")" — ကွင်း၏ တန်ဖိုး ${val}။ စောင့်နေသည့်အရာ — total ${ot}၊ sign ${sgn(os)} — ကို pop ပြီး ${val} ကို ယခုဖတ်ခဲ့သော ကိန်းအဖြစ် သဘောထားသည် — နောက် operator (သို့မဟုတ် အဆုံး) က ထို sign ဖြင့် ပေါင်းမည်။`) }));
    } else {
      steps.push(snap({ i, ...charStep(ch, st, i) }));
    }
  }
  const ans = st.total + st.sign * st.num;
  steps.push(snap({ line: 'ret', finished: true, answer: ans, tag: t(`return ${ans}`, `${ans} ပြန်`),
    note: t(`The end: add the last term. ${st.total} ${st.sign > 0 ? '+' : '−'} ${st.num} = <b>${ans}</b>.`, `အဆုံး — နောက်ဆုံး term ကို ပေါင်းသည်။ ${st.total} ${st.sign > 0 ? '+' : '−'} ${st.num} = <b>${ans}</b>။`) }));
  return steps;
}

function buildRecurse({ s }) {
  const frames = [];
  const steps = [];
  let i = 0, deepest = 0;
  const snap = (extra) => ({ view: 'recurse', frames: frames.map((f) => ({ ...f })), deepest, i: null, ...extra,
    ...(frames.length ? { total: frames.at(-1).total, sign: frames.at(-1).sign, num: frames.at(-1).num } : {}) });

  function expr() {
    const st = { total: 0, sign: 1, num: 0, first: 0 };
    frames.push(st);
    deepest = Math.max(deepest, frames.length);
    steps.push(snap({ i: frames.length > 1 ? i - 1 : null, line: 'start', tag: t(`expr #${frames.length}`, `expr #${frames.length}`),
      note: frames.length === 1
        ? t('Call expr() for the whole string: total 0, sign +, num 0. It reads until a ")" or the end.', 'string တစ်ခုလုံးအတွက် expr() ကို ခေါ်သည် — total 0၊ sign +၊ num 0။ ")" သို့မဟုတ် အဆုံးအထိ ဖတ်သည်။')
        : t(`A fresh call for the bracket, ${frames.length} deep: its own total, sign and num, while the caller's wait on the call stack.`, `ကွင်းအတွက် call အသစ်၊ ${frames.length} ဆင့် နက် — ကိုယ်ပိုင် total၊ sign နှင့် num — ခေါ်သူ၏ဟာများ call stack ပေါ်တွင် စောင့်သည်။`) }));
    while (i < s.length && s[i] !== ')') {
      const ch = s[i++];
      if (ch === ' ') continue;
      st.first = s.slice(0, i - 1).trim() === '' || s.slice(0, i - 1).trimEnd().endsWith('(') ? i - 1 : -1;
      if (ch === '(') {
        steps.push(snap({ i: i - 1, line: 'open', tag: t('call expr()', 'expr() ခေါ်'),
          note: t(`"(": call expr() to work out the bracket. This call's total ${st.total} and sign ${sgn(st.sign)} stay where they are, in its frame.`,
                  `"(" — ကွင်းကို တွက်ရန် expr() ကို ခေါ်သည်။ ဤ call ၏ total ${st.total} နှင့် sign ${sgn(st.sign)} သည် ၎င်း၏ frame ထဲတွင် ရှိနေသည်။`) }));
        const v = expr();
        st.num = v;
        i++;
        steps.push(snap({ i: i - 1, line: 'close', tag: t(`num = ${v}`, `num = ${v}`),
          note: t(`Back from the bracket with ${v}: num = ${v}, as if it were a number just read. Step past its ")".`,
                  `ကွင်းမှ ${v} ဖြင့် ပြန်လာသည် — num = ${v}၊ ယခုဖတ်ခဲ့သော ကိန်းကဲ့သို့။ ၎င်း၏ ")" ကို ကျော်သည်။`) }));
      } else {
        steps.push(snap({ i: i - 1, ...charStep(ch, st, i - 1) }));
      }
    }
    const val = st.total + st.sign * st.num;
    steps.push(snap({ i: i < s.length ? i : null, line: 'done', returning: val, tag: t(`return ${val}`, `${val} ပြန်`),
      note: i < s.length
        ? t(`")" ends this call: return ${st.total} ${st.sign > 0 ? '+' : '−'} ${st.num} = ${val} to the caller.`, `")" သည် ဤ call ကို အဆုံးသတ်သည် — ${st.total} ${st.sign > 0 ? '+' : '−'} ${st.num} = ${val} ကို ခေါ်သူထံ ပြန်ပေးသည်။`)
        : t(`The end of the string: return ${st.total} ${st.sign > 0 ? '+' : '−'} ${st.num} = ${val}.`, `string ၏ အဆုံး — ${st.total} ${st.sign > 0 ? '+' : '−'} ${st.num} = ${val} ကို ပြန်ပေးသည်။`) }));
    frames.pop();
    return val;
  }
  const ans = expr();
  steps.push(snap({ line: 'ret', finished: true, answer: ans, tag: t(`return ${ans}`, `${ans} ပြန်`),
    note: t(`The outer call's value is the answer: <b>${ans}</b>. The calls went ${deepest} deep — one per level of brackets, plus one.`,
            `အပြင်ဆုံး call ၏ တန်ဖိုးသည် အဖြေ — <b>${ans}</b>။ call များ ${deepest} ဆင့် နက်ခဲ့သည် — ကွင်း အဆင့်တစ်ခုလျှင် တစ်ခု၊ အပေါင်း တစ်ခု။`) }));
  return steps;
}

/* ---------------- drawing ----------------
 *
 * The strip card is the string, one cell per character (· for a space), the
 * character being read in amber and those already read hollow. The stage is
 * where the waiting happens: the explicit stack of (total, sign) pairs, or
 * the call stack of expr() frames, each holding its own three numbers. */

function strip(s, { s: str }) {
  const chars = [...str].map((ch) => (ch === ' ' ? '·' : ch));
  const tone = {};
  const upto = s.finished ? str.length : s.i ?? -1;
  for (let j = 0; j < chars.length; j++) if (j < upto) tone[j] = 'past';
  if (s.i != null && !s.finished) tone[s.i] = 'inwin';
  return `<div class="strip wraps bc">${cells(chars, { tone })}</div>`;
}

function draw(s) {
  const now = readout({ total: s.total ?? 0, sign: sgn(s.sign ?? 1), num: s.num ?? 0 });
  if (s.view === 'stack') {
    const items = s.stack.map(([tt, sg]) => `total ${tt} · sign ${sgn(sg)}`);
    return stagePanel(pick(t('The stack — what waits outside each open bracket', 'stack — ဖွင့်ထားသော ကွင်းတစ်ခုစီ အပြင်တွင် စောင့်နေသည့်အရာ')),
      pick(t(`${s.stack.length} open`, `${s.stack.length} ဖွင့်`)), stack(items))
      + stageGap + stagePanel(pick(t('Inside the current brackets', 'လက်ရှိ ကွင်းအတွင်း')), '', now);
  }
  const items = s.frames.map((f) => `expr() · total ${f.total} · sign ${sgn(f.sign)} · num ${f.num}`);
  return stagePanel(pick(t('The call stack — one expr() per open bracket', 'call stack — ဖွင့်ထားသော ကွင်းတစ်ခုလျှင် expr() တစ်ခု')),
    pick(t(`${s.frames.length} deep`, `${s.frames.length} ဆင့်`)), stack(items))
    + stageGap + stagePanel(pick(t('The running call', 'run နေသော call')), '', s.frames.length ? now : `<p class="note mono stage-empty">—</p>`);
}

function answer(s) {
  return {
    html: slots(s.finished ? [s.answer] : [], { total: 1, just: s.finished ? 0 : -1 }),
    note: s.finished ? t('the value', 'တန်ဖိုး') : t('one number', 'ကိန်း တစ်ခု'),
  };
}

function vars(s, { s: str }) {
  const out = [];
  if (s.total != null) out.push(['total', s.total], ['sign', s.sign], ['num', s.num]);
  if (s.i != null && str[s.i]) out.push(['ch', `'${str[s.i]}'`]);
  if (s.view === 'stack') out.push(['stack', `[${s.stack.map(([tt, sg]) => `(${tt}, ${sg})`).join(', ')}]`]);
  else if (s.i != null) out.push(['i', s.i]);
  return out;
}

/* ---------------- the code, one key per line ----------------
 *
 * Generated from the verified solution files, so the listing a reader copies
 * is byte-identical to the one that ran. */

const CODE = {
  recurse: {
    ruby: [
      [null, `${k('def')} calculate(s)`],
      [null, `  @s, @i = s, 0`],
      ['ret', `  expr`],
      [null, `${k('end')}`],
      [null, ``],
      [null, `${k('def')} expr ${c('# the value up to the matching \')\' or the end')}`],
      ['start', `  total, sign, num = 0, 1, 0`],
      [null, `  ${k('while')} @i &lt; @s.length &amp;&amp; @s[@i] != ')'`],
      [null, `    ch = @s[@i]`],
      [null, `    @i += 1`],
      [null, `    ${k('if')} ch &gt;= '0' &amp;&amp; ch &lt;= '9'`],
      ['digit', `      num = num * 10 + ch.to_i`],
      [null, `    elsif ch == '+' || ch == '-'`],
      ['op', `      total += sign * num`],
      ['op', `      sign, num = (ch == '+' ? 1 : -1), 0`],
      [null, `    elsif ch == '('`],
      ['open', `      num = expr ${c('# the bracket\'s value, used like a number')}`],
      ['close', `      @i += 1 ${c('# step past its \')\'')}`],
      [null, `    ${k('end')}`],
      [null, `  ${k('end')}`],
      ['done', `  total + sign * num`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('import')} sys`],
      [null, `sys.setrecursionlimit(400_000)                  ${c('# brackets can nest 150,000 deep')}`],
      [null, ``],
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} calculate(self, s):`],
      [null, `        i = 0`],
      [null, ``],
      [null, `        ${k('def')} expr():                             ${c('# the value up to the matching \')\' or the end')}`],
      [null, `            ${k('nonlocal')} i`],
      ['start', `            total, sign, num = 0, 1, 0`],
      [null, `            ${k('while')} i &lt; len(s) and s[i] != ')':`],
      [null, `                ch = s[i]`],
      [null, `                i += 1`],
      [null, `                ${k('if')} ch.isdigit():`],
      ['digit', `                    num = num * 10 + int(ch)`],
      [null, `                elif ch ${k('in')} '+-':`],
      ['op', `                    total += sign * num`],
      ['op', `                    sign, num = (1 ${k('if')} ch == '+' ${k('else')} -1), 0`],
      [null, `                elif ch == '(':`],
      ['open', `                    num = expr()                ${c('# the bracket\'s value, used like a number')}`],
      ['close', `                    i += 1                      ${c('# step past its \')\'')}`],
      ['done', `            ${k('return')} total + sign * num`],
      [null, ``],
      ['ret', `        ${k('return')} expr()`],
    ],
    javascript: [
      [null, `${k('var')} calculate = ${k('function')} (s) {`],
      [null, `  ${k('let')} i = 0;`],
      [null, `  ${k('const')} expr = () =&gt; { ${c('// the value up to the matching \')\' or the end')}`],
      ['start', `    ${k('let')} total = 0, sign = 1, num = 0;`],
      [null, `    ${k('while')} (i &lt; s.length &amp;&amp; s[i] !== ')') {`],
      [null, `      ${k('const')} ch = s[i++];`],
      [null, `      ${k('if')} (ch &gt;= '0' &amp;&amp; ch &lt;= '9') {`],
      ['digit', `        num = num * 10 + (ch.charCodeAt(0) - 48);`],
      [null, `      } ${k('else')} ${k('if')} (ch === '+' || ch === '-') {`],
      ['op', `        total += sign * num;`],
      ['op', `        sign = ch === '+' ? 1 : -1;`],
      ['op', `        num = 0;`],
      [null, `      } ${k('else')} ${k('if')} (ch === '(') {`],
      ['open', `        num = expr(); ${c('// the bracket\'s value, used like a number')}`],
      ['close', `        i++; ${c('// step past its \')\'')}`],
      [null, `      }`],
      [null, `    }`],
      ['done', `    ${k('return')} total + sign * num;`],
      [null, `  };`],
      ['ret', `  ${k('return')} expr();`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} calculate(s string) int {`],
      [null, `    i := 0`],
      [null, `    ${k('var')} expr ${k('func')}() int                      ${c('// the value up to the matching \')\' or the end')}`],
      [null, `    expr = ${k('func')}() int {`],
      ['start', `        total, sign, num := 0, 1, 0`],
      [null, `        ${k('for')} i &lt; len(s) &amp;&amp; s[i] != ')' {`],
      [null, `            ch := s[i]`],
      [null, `            i++`],
      [null, `            switch {`],
      [null, `            case ch &gt;= '0' &amp;&amp; ch &lt;= '9':`],
      ['digit', `                num = num*10 + int(ch-'0')`],
      [null, `            case ch == '+' || ch == '-':`],
      ['op', `                total += sign * num`],
      ['op', `                sign, num = 1, 0`],
      ['op', `                ${k('if')} ch == '-' {`],
      ['op', `                    sign = -1`],
      [null, `                }`],
      [null, `            case ch == '(':`],
      ['open', `                num = expr()                 ${c('// the bracket\'s value, used like a number')}`],
      ['close', `                i++                          ${c('// step past its \')\'')}`],
      [null, `            }`],
      [null, `        }`],
      ['done', `        ${k('return')} total + sign*num`],
      [null, `    }`],
      ['ret', `    ${k('return')} expr()`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} calculate(s: String) -&gt; i32 {`],
      [null, `        ${k('let')} ${k('mut')} i = 0;`],
      ['ret', `        ${k('Self')}::expr(s.as_bytes(), &amp;${k('mut')} i)`],
      [null, `    }`],
      [null, ``],
      [null, `    ${c('// the value up to the matching \')\' or the end')}`],
      [null, `    ${k('fn')} expr(s: &amp;[u8], i: &amp;${k('mut')} usize) -&gt; i32 {`],
      ['start', `        ${k('let')} (${k('mut')} total, ${k('mut')} sign, ${k('mut')} num) = (0, 1, 0);`],
      [null, `        ${k('while')} *i &lt; s.len() &amp;&amp; s[*i] != b')' {`],
      [null, `            ${k('let')} ch = s[*i];`],
      [null, `            *i += 1;`],
      [null, `            ${k('match')} ch {`],
      ['digit', `                b'0'..=b'9' =&gt; num = num * 10 + (ch - b'0') as i32,`],
      [null, `                b'+' | b'-' =&gt; {`],
      ['op', `                    total += sign * num;`],
      ['op', `                    sign = ${k('if')} ch == b'+' { 1 } ${k('else')} { -1 };`],
      ['op', `                    num = 0;`],
      [null, `                }`],
      [null, `                b'(' =&gt; {`],
      ['open', `                    num = ${k('Self')}::expr(s, i); ${c('// the bracket\'s value, used like a number')}`],
      ['close', `                    *i += 1; ${c('// step past its \')\'')}`],
      [null, `                }`],
      [null, `                _ =&gt; {}`],
      [null, `            }`],
      [null, `        }`],
      ['done', `        total + sign * num`],
      [null, `    }`],
      [null, `}`],
    ],
  },
  stack: {
    ruby: [
      [null, `${k('def')} calculate(s)`],
      ['init', `  total, sign, num = 0, 1, 0 ${c('# the sum so far inside the current brackets')}`],
      [null, `  stack = [] ${c('# what was waiting outside each open bracket')}`],
      [null, `  s.each_char ${k('do')} |ch|`],
      [null, `    ${k('if')} ch &gt;= '0' &amp;&amp; ch &lt;= '9'`],
      ['digit', `      num = num * 10 + ch.to_i`],
      [null, `    elsif ch == '+' || ch == '-'`],
      ['op', `      total += sign * num`],
      ['op', `      sign, num = (ch == '+' ? 1 : -1), 0`],
      [null, `    elsif ch == '('`],
      ['open', `      stack.push([total, sign])`],
      ['open', `      total, sign, num = 0, 1, 0`],
      [null, `    elsif ch == ')'`],
      ['close', `      num = total + sign * num ${c('# the bracket\'s value, used like a number')}`],
      ['close', `      total, sign = stack.pop`],
      [null, `    ${k('end')}`],
      [null, `  ${k('end')}`],
      ['ret', `  total + sign * num`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} calculate(self, s):`],
      ['init', `        total, sign, num = 0, 1, 0              ${c('# the sum so far inside the current brackets')}`],
      [null, `        stack = []                              ${c('# what was waiting outside each open bracket')}`],
      [null, `        ${k('for')} ch ${k('in')} s:`],
      [null, `            ${k('if')} ch.isdigit():`],
      ['digit', `                num = num * 10 + int(ch)`],
      [null, `            elif ch ${k('in')} '+-':`],
      ['op', `                total += sign * num`],
      ['op', `                sign, num = (1 ${k('if')} ch == '+' ${k('else')} -1), 0`],
      [null, `            elif ch == '(':`],
      ['open', `                stack.append((total, sign))`],
      ['open', `                total, sign, num = 0, 1, 0`],
      [null, `            elif ch == ')':`],
      ['close', `                num = total + sign * num        ${c('# the bracket\'s value, used like a number')}`],
      ['close', `                total, sign = stack.pop()`],
      ['ret', `        ${k('return')} total + sign * num`],
    ],
    javascript: [
      [null, `${k('var')} calculate = ${k('function')} (s) {`],
      ['init', `  ${k('let')} total = 0, sign = 1, num = 0; ${c('// the sum so far inside the current brackets')}`],
      [null, `  ${k('const')} stack = []; ${c('// what was waiting outside each open bracket')}`],
      [null, `  ${k('for')} (${k('const')} ch ${k('of')} s) {`],
      [null, `    ${k('if')} (ch &gt;= '0' &amp;&amp; ch &lt;= '9') {`],
      ['digit', `      num = num * 10 + (ch.charCodeAt(0) - 48);`],
      [null, `    } ${k('else')} ${k('if')} (ch === '+' || ch === '-') {`],
      ['op', `      total += sign * num;`],
      ['op', `      sign = ch === '+' ? 1 : -1;`],
      ['op', `      num = 0;`],
      [null, `    } ${k('else')} ${k('if')} (ch === '(') {`],
      ['open', `      stack.push([total, sign]);`],
      ['open', `      total = 0; sign = 1; num = 0;`],
      [null, `    } ${k('else')} ${k('if')} (ch === ')') {`],
      ['close', `      num = total + sign * num; ${c('// the bracket\'s value, used like a number')}`],
      ['close', `      [total, sign] = stack.pop();`],
      [null, `    }`],
      [null, `  }`],
      ['ret', `  ${k('return')} total + sign * num;`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} calculate(s string) int {`],
      ['init', `    total, sign, num := 0, 1, 0              ${c('// the sum so far inside the current brackets')}`],
      [null, `    stack := [][2]int{}                      ${c('// what was waiting outside each open bracket')}`],
      [null, `    ${k('for')} i := 0; i &lt; len(s); i++ {`],
      [null, `        switch ch := s[i]; {`],
      [null, `        case ch &gt;= '0' &amp;&amp; ch &lt;= '9':`],
      ['digit', `            num = num*10 + int(ch-'0')`],
      [null, `        case ch == '+' || ch == '-':`],
      ['op', `            total += sign * num`],
      ['op', `            sign, num = 1, 0`],
      ['op', `            ${k('if')} ch == '-' {`],
      ['op', `                sign = -1`],
      [null, `            }`],
      [null, `        case ch == '(':`],
      ['open', `            stack = append(stack, [2]int{total, sign})`],
      ['open', `            total, sign, num = 0, 1, 0`],
      [null, `        case ch == ')':`],
      ['close', `            num = total + sign*num           ${c('// the bracket\'s value, used like a number')}`],
      ['close', `            top := stack[len(stack)-1]`],
      ['close', `            stack = stack[:len(stack)-1]`],
      ['close', `            total, sign = top[0], top[1]`],
      [null, `        }`],
      [null, `    }`],
      ['ret', `    ${k('return')} total + sign*num`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} calculate(s: String) -&gt; i32 {`],
      ['init', `        ${k('let')} (${k('mut')} total, ${k('mut')} sign, ${k('mut')} num) = (0, 1, 0); ${c('// the sum so far inside the current brackets')}`],
      [null, `        ${k('let')} ${k('mut')} stack = vec![]; ${c('// what was waiting outside each open bracket')}`],
      [null, `        ${k('for')} ch ${k('in')} s.bytes() {`],
      [null, `            ${k('match')} ch {`],
      ['digit', `                b'0'..=b'9' =&gt; num = num * 10 + (ch - b'0') as i32,`],
      [null, `                b'+' | b'-' =&gt; {`],
      ['op', `                    total += sign * num;`],
      ['op', `                    sign = ${k('if')} ch == b'+' { 1 } ${k('else')} { -1 };`],
      ['op', `                    num = 0;`],
      [null, `                }`],
      [null, `                b'(' =&gt; {`],
      ['open', `                    stack.push((total, sign));`],
      ['open', `                    (total, sign, num) = (0, 1, 0);`],
      [null, `                }`],
      [null, `                b')' =&gt; {`],
      ['close', `                    num = total + sign * num; ${c('// the bracket\'s value, used like a number')}`],
      ['close', `                    (total, sign) = stack.pop().unwrap();`],
      [null, `                }`],
      [null, `                _ =&gt; {}`],
      [null, `            }`],
      [null, `        }`],
      ['ret', `        total + sign * num`],
      [null, `    }`],
      [null, `}`],
    ],
  },
};


/* ---------------- part 1: the "signs through brackets" widget ----------------
 *
 * With only + and −, any expression is a sum of numbers, each with a sign —
 * and a minus in front of a bracket flips every sign inside it. Click an
 * operator to flip it and watch which numbers change sign. */

const QW_SETS = [
  { label: exampleTitle(3), s: '(1+(4+5+2)-3)+(6+8)' },
  { label: t('minus before a bracket', 'ကွင်းရှေ့ minus'), s: '10-(2+3-(4-1))' },
  { label: t('unary minus', 'unary minus'), s: '-(3-(-2))' },
];

function signed(s) {
  // each number with the sign it ends up carrying
  const out = [];
  const signs = [1];
  let pending = 1;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (/\d/.test(ch)) {
      let j = i;
      while (j < s.length && /\d/.test(s[j])) j++;
      out.push({ at: i, v: Number(s.slice(i, j)), sign: signs.at(-1) * pending });
      i = j - 1;
    } else if (ch === '+' || ch === '-') pending = ch === '+' ? 1 : -1;
    else if (ch === '(') { signs.push(signs.at(-1) * pending); pending = 1; }
    else if (ch === ')') signs.pop();
  }
  return out;
}

function mountSignWidget(host) {
  const state = { set: 0, s: QW_SETS[0].s };
  host.innerHTML = `
    <div class="bc-w q-arr" data-expr-cells></div>
    <div class="q-slider"><span class="q-presets" data-presets></span></div>
    <p class="q-tie" data-line></p>
    <div class="ledger">
      <span class="expr" data-expr></span>
      <span class="total" data-total></span>
    </div>`;
  const q = (sel) => host.querySelector(sel);

  function render() {
    const s = state.s;
    const nums = signed(s);
    const byAt = new Map(nums.map((n) => [n.at, n]));
    let html = '';
    for (let i = 0; i < s.length; i++) {
      const ch = s[i];
      const n = byAt.get(i);
      if (n) {
        const len = String(n.v).length;
        html += `<div class="cell ${n.sign > 0 ? 'kept' : 'neg'}"><span>${n.v}</span><span class="idx">${n.sign > 0 ? '+' : '−'}</span></div>`;
        i += len - 1;
      } else if (ch === '+' || ch === '-') {
        html += `<button class="cell op" data-flip="${i}" aria-label="flip ${ch}"><span>${ch === '-' ? '−' : '+'}</span><span class="idx">flip</span></button>`;
      } else html += `<div class="cell cut"><span>${ch}</span></div>`;
    }
    q('[data-expr-cells]').innerHTML = html;
    q('[data-presets]').innerHTML = presetChips(QW_SETS, state.set);
    widgetLabel(pick(t('click + or − to flip it', '+ သို့မဟုတ် − ကို နှိပ်၍ ပြောင်းပါ')));
    const total = nums.reduce((a, n) => a + n.sign * n.v, 0);
    const flipped = nums.filter((n) => n.sign < 0).length;
    q('[data-line]').innerHTML = pick(t(`Take the brackets away and this is just ${nums.length} signed numbers — ${flipped} of them negative. A minus in front of a bracket flips the sign of everything inside it, however deep.`,
      `ကွင်းများ ဖယ်လိုက်လျှင် ၎င်းသည် sign ပါသော ကိန်း ${nums.length} ခုသာ — ${flipped} ခု အနုတ်။ ကွင်းရှေ့ရှိ minus သည် အတွင်းရှိ အရာအားလုံး၏ sign ကို မည်မျှ နက်နက် ပြောင်းသည်။`));
    q('[data-expr]').innerHTML = nums.map((n, j) => `${n.sign > 0 ? (j ? '+ ' : '') : '− '}${n.v}`).join(' ');
    q('[data-total]').innerHTML = `${total}<small>${pick(t('value', 'တန်ဖိုး'))}</small>`;
  }
  host.addEventListener('click', (ev) => {
    const chip = ev.target.closest('[data-set]');
    if (chip) { state.set = Number(chip.dataset.set); state.s = QW_SETS[state.set].s; return render(); }
    const op = ev.target.closest('[data-flip]');
    if (op) {
      const i = Number(op.dataset.flip);
      const prev = state.s.slice(0, i).trimEnd().slice(-1);
      // a unary minus (at the start or after "(") cannot become "+", which the statement forbids
      if (state.s[i] === '-' && (prev === '' || prev === '(')) return;
      state.s = state.s.slice(0, i) + (state.s[i] === '+' ? '-' : '+') + state.s.slice(i + 1);
      render();
      host.querySelector(`[data-flip="${i}"]`)?.focus();
    }
  });
  onLangChange(render);
  render();
}

/* ---------------- the approach, in brief ---------------- */

const APPROACH = {
  recurse: {
    idea: t('A recursive parser: expr() sums terms until it meets ")" or the end. A "(" calls expr() for the bracket, and its value comes back to be used like a number.',
            'recursive parser — expr() သည် ")" သို့မဟုတ် အဆုံး မတွေ့မချင်း term များကို ပေါင်းသည်။ "(" က ကွင်းအတွက် expr() ကို ခေါ်ပြီး ၎င်း၏ တန်ဖိုး ပြန်လာကာ ကိန်းကဲ့သို့ သုံးသည်။'),
    steps: [
      t('Keep <code>total</code>, <code>sign</code> and <code>num</code>; a digit extends <code>num</code>.', '<code>total</code>၊ <code>sign</code> နှင့် <code>num</code> ကို ထိန်း — digit က <code>num</code> ကို ဆက်ရှည်စေသည်။'),
      t('An operator adds <code>sign × num</code> to <code>total</code> and sets the next sign.', 'operator က <code>sign × num</code> ကို <code>total</code> ထဲ ပေါင်းပြီး နောက် sign ကို သတ်မှတ်သည်။'),
      t('"(" sets <code>num = expr()</code> and skips the ")"; at ")" or the end, return <code>total + sign × num</code>.', '"(" က <code>num = expr()</code> သတ်မှတ်ပြီး ")" ကို ကျော်သည် — ")" သို့မဟုတ် အဆုံးတွင် <code>total + sign × num</code> ကို ပြန်ပေး။'),
    ],
    cost: t('Each character is read once: O(n). The calls nest as deep as the brackets — up to 149,999 at the constraint, past the default stack of Ruby, Node and Rust.',
            'စာလုံးတစ်ခုစီကို တစ်ကြိမ် ဖတ်သည် — O(n)။ call များသည် ကွင်းများလောက် နက်သည် — ကန့်သတ်ချက်တွင် 149,999 အထိ၊ Ruby၊ Node နှင့် Rust ၏ default stack ကို ကျော်သည်။'),
  },
  stack: {
    idea: t('The same reading, one loop. At "(" push the outer total and sign and start afresh; at ")" the bracket\'s value becomes num, and the outer total and sign come back off the stack.',
            'ဖတ်ပုံ အတူတူ၊ loop တစ်ခုတည်း။ "(" တွင် အပြင် total နှင့် sign ကို push ပြီး အသစ်စ — ")" တွင် ကွင်း၏ တန်ဖိုးသည် num ဖြစ်လာပြီး အပြင် total နှင့် sign ကို stack မှ ပြန်ယူသည်။'),
    steps: [
      t('A digit extends <code>num</code>; an operator adds <code>sign × num</code> to <code>total</code> and sets the next sign.', 'digit က <code>num</code> ကို ဆက်ရှည်စေ — operator က <code>sign × num</code> ကို <code>total</code> ထဲ ပေါင်းပြီး နောက် sign ကို သတ်မှတ်။'),
      t('"(": push <code>(total, sign)</code>; reset all three.', '"(" — <code>(total, sign)</code> ကို push — သုံးခုလုံး reset။'),
      t('")": <code>num = total + sign × num</code>, then pop <code>total, sign</code>. At the end return <code>total + sign × num</code>.', '")" — <code>num = total + sign × num</code>၊ ပြီးမှ <code>total, sign</code> ကို pop။ အဆုံးတွင် <code>total + sign × num</code> ကို ပြန်ပေး။'),
    ],
    cost: t('O(n) time; the stack holds one pair per open bracket, up to 149,999 — on the heap, where any language has room.', 'O(n) အချိန် — stack သည် ဖွင့်ထားသော ကွင်းတစ်ခုလျှင် အတွဲ တစ်ခု ကိုင်သည်၊ 149,999 အထိ — heap ပေါ်တွင်၊ မည်သည့် ဘာသာစကားမဆို နေရာရှိသည်။'),
  },
};

/* ---------------- mount ---------------- */

mountLesson({
  input: { s: '(1+(4+5+2)-3)+(6+8)' },
  controls: [
    { key: 's', label: 's', value: '(1+(4+5+2)-3)+(6+8)', parse: parseExpr },
  ],
  presets: [
    { label: exampleTitle(1), input: { s: '1 + 1' } },
    { label: exampleTitle(2), input: { s: ' 2-1 + 2 ' } },
    { label: exampleTitle(3), input: { s: '(1+(4+5+2)-3)+(6+8)' } },
    { label: t('minus before a bracket', 'ကွင်းရှေ့ minus'), input: { s: '10 - (2 + 3)' } },
    { label: t('unary minus', 'unary minus'), input: { s: '-(12-(-3))' } },
  ],
  examples: [
    { title: exampleTitle(1), inputHtml: '<code>s = "1 + 1"</code>', output: '2', why: [], load: { s: '1 + 1' } },
    { title: exampleTitle(2), inputHtml: '<code>s = " 2-1 + 2 "</code>', output: '3', why: [], load: { s: ' 2-1 + 2 ' } },
    { title: exampleTitle(3), inputHtml: '<code>s = "(1+(4+5+2)-3)+(6+8)"</code>', output: '23', why: [], load: { s: '(1+(4+5+2)-3)+(6+8)' } },
  ],
  modes: [
    { id: 'recurse', name: 'Recursive parser',
      sub: t('the call stack waits', 'call stack က စောင့်'),
      desc: t('Call expr() for each bracket; its value comes back as a number.', 'ကွင်းတစ်ခုစီအတွက် expr() ခေါ် — ၎င်း၏ တန်ဖိုး ကိန်းအဖြစ် ပြန်လာသည်။'),
      cost: 'O(n) time · O(depth) call stack', build: buildRecurse },
    { id: 'stack', name: 'One pass with a stack',
      sub: t('(total, sign) pairs', '(total, sign) အတွဲ'),
      desc: t('Push the outer total and sign at "(", pop them at ")".', '"(" တွင် အပြင် total နှင့် sign ကို push၊ ")" တွင် pop။'),
      cost: 'O(n) time · O(depth) heap stack', build: buildStack },
  ],
  languages: LANGUAGES,
  code: CODE,
  solutions: {
    recurse: { approach: APPROACH.recurse,
      desc: t('The grammar written as code: short and easy to extend with * and / later. The catch is depth — 149,999 nested brackets are 150,000 calls, past the default stack of Ruby, Node and Rust.',
              'grammar ကို code အဖြစ် ရေးခြင်း — တိုပြီး နောင်တွင် * နှင့် / ထည့်ရန် လွယ်သည်။ ပြဿနာမှာ အနက် — nested ကွင်း 149,999 သည် call 150,000 ဖြစ်ပြီး Ruby၊ Node နှင့် Rust ၏ default stack ကို ကျော်သည်။') },
    stack: { approach: APPROACH.stack,
      desc: t('The answer to write: the same arithmetic, with the waiting totals kept in a list instead of in call frames. No depth limit to worry about in any language.',
              'ရေးသင့်သည့် အဖြေ — ဂဏန်းတွက်ပုံ အတူတူ၊ စောင့်နေသော total များကို call frame အစား list ထဲ ထားသည်။ မည်သည့် ဘာသာစကားတွင်မဆို အနက် ကန့်သတ်ချက် စိုးရိမ်စရာ မရှိ။') },
  },
  // How each language was actually checked, printed as the part 3 badges.
  // The corpus: the 3 examples, 10 edges, 15,000 random expressions up to
  // 185 characters, 5,000 up to 1,200, and six near 3 × 10⁵ characters
  // (149,999 nested brackets, nested unary minus, 50,000 numbers, a random
  // expression, numbers near 2³¹ − 1, 75,000 "(1)") — against an oracle that
  // keeps a stack of bracket signs. Go and Rust ran in Docker
  // (golang:1.23-alpine, rust:1-slim); the recursive listing ran with a
  // larger stack in Ruby, Node and Rust. Default-stack limits were measured
  // cold, one nested expression per process (Rust: a release build, 8 MB main
  // thread).
  verification: {
    ruby: { recurse: 'ran here · overflows Ruby 3.1\'s default stack past 8,185 nested brackets', stack: 'ran here · 20,019 cases' },
    python: { recurse: 'ran here · 20,019 cases, 150,000 calls deep', stack: 'ran here · 20,019 cases' },
    javascript: { recurse: 'ran here · overflows Node 24\'s default stack past 6,912 nested brackets', stack: 'ran here · 20,019 cases' },
    go: 'ran here · 20,019 cases · Go 1.23',
    rust: { recurse: 'ran here · overflows the 8 MB main thread past 104,797 nested brackets · rustc 1.98', stack: 'ran here · 20,019 cases · rustc 1.98' },
  },
  caveats: {
    recurse: {
      ruby: t('Correct on all 20,019 cases with a larger stack, but on Ruby 3.1\'s default stack more than 8,185 nested brackets overflow it (<code>SystemStackError</code>) — measured here — and the constraint allows 149,999. Use the stack version.',
              'stack ပိုကြီးလျှင် case 20,019 ခုလုံးတွင် မှန်သည်၊ သို့သော် Ruby 3.1 ၏ default stack ပေါ်တွင် nested ကွင်း 8,185 ထက် များလျှင် overflow (<code>SystemStackError</code>) ဖြစ်သည် — ဤနေရာတွင် တိုင်းတာထားသည် — ကန့်သတ်ချက်က 149,999 ကို ခွင့်ပြုသည်။ stack version ကို သုံးပါ။'),
      javascript: t('Correct on all 20,019 cases with a larger stack, but on Node 24\'s default stack, run cold, more than 6,912 nested brackets overflow it (<code>RangeError</code>) — measured here — and the constraint allows 149,999. Use the stack version.',
                    'stack ပိုကြီးလျှင် case 20,019 ခုလုံးတွင် မှန်သည်၊ သို့သော် Node 24 ၏ default stack ပေါ်တွင် cold run လုပ်လျှင် nested ကွင်း 6,912 ထက် များလျှင် overflow (<code>RangeError</code>) ဖြစ်သည် — ဤနေရာတွင် တိုင်းတာထားသည် — ကန့်သတ်ချက်က 149,999 ကို ခွင့်ပြုသည်။ stack version ကို သုံးပါ။'),
      rust: t('Correct on all 20,019 cases on a larger thread, but a release build on the 8 MB main thread overflows past 104,797 nested brackets — measured here — and the constraint allows 149,999. Use the stack version.',
              'thread ပိုကြီးလျှင် case 20,019 ခုလုံးတွင် မှန်သည်၊ သို့သော် 8 MB main thread ပေါ်ရှိ release build သည် nested ကွင်း 104,797 ကျော်လျှင် overflow ဖြစ်သည် — ဤနေရာတွင် တိုင်းတာထားသည် — ကန့်သတ်ချက်က 149,999 ကို ခွင့်ပြုသည်။ stack version ကို သုံးပါ။'),
      python: t('The <code>setrecursionlimit</code> line is part of the answer: Python\'s default of 1,000 is far below the 150,000 calls 149,999 nested brackets need.',
                '<code>setrecursionlimit</code> စာကြောင်းသည် အဖြေ၏ အစိတ်အပိုင်း — Python ၏ default 1,000 သည် nested ကွင်း 149,999 လိုအပ်သော call 150,000 ထက် အများကြီး နိမ့်သည်။'),
    },
  },
  stripLabel: t('s, one character per cell (· = space)', 's — cell တစ်ခုလျှင် စာလုံး တစ်လုံး (· = space)'),
  strip,
  draw,
  answer,
  vars,
  widget: mountSignWidget,
});
