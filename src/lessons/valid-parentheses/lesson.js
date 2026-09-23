/* Valid Parentheses — LeetCode 20.
 *
 * The contrast worth seeing: stripping asks "is there a closed pair anywhere in
 * what is left?" and has to rescan the whole string every time it deletes one,
 * because deleting makes two characters adjacent that were not adjacent before.
 * The stack asks each closer one question instead — "what is the most recent
 * opener nobody has closed yet?" — and the top of a stack is exactly that, so
 * the answer is free and one pass is enough.
 */
import { t, exampleTitle, LANGUAGES, k, c, verdictAnswer, stageRow } from '../../lib/kit.js';
import { mountLesson } from '../../lib/stepper.js';
import { pick, onLangChange } from '../../lib/i18n.js';
import { cells, stack, stagePanel } from '../../lib/stage.js';


const CLOSER_OF = { '(': ')', '[': ']', '{': '}' };
const OPENER_OF = { ')': '(', ']': '[', '}': '{' };

const show = (chars) => (chars.length ? `<b>${chars.join('')}</b>` : null);
const showT = (chars) => t(show(chars) ?? 'the empty string', show(chars) ?? 'string အလွတ်');

/* ---------------- step generators ---------------- */

function buildStrip({ s }) {
  const steps = [];
  const chars = [...s];
  const idx = chars.map((_, j) => j);          // where each surviving character sat in s
  let cuts = 0;
  // Every snapshot gets its own copy. The algorithm deletes in place, so a
  // shared reference would make every frame render the final string.
  const snap = (extra) => ({ view: 'strip', chars: [...chars], idx: [...idx], i: null, cuts, ...extra });

  steps.push(snap({ line: 'init', tag: t('idea', 'အယူအဆ'),
    note: t(`A pair standing next to each other — <b>()</b>, <b>[]</b> or <b>{}</b> — is already closed, so cutting it out cannot change the answer. Keep cutting and see whether anything survives.`,
            `ဘေးချင်းကပ်နေသော အတွဲ — <b>()</b>၊ <b>[]</b> သို့မဟုတ် <b>{}</b> — သည် ပိတ်ပြီးသား ဖြစ်သဖြင့် ဖြတ်ထုတ်လိုက်လည်း အဖြေ မပြောင်းပါ။ ဆက်ဖြတ်သွားပြီး ဘာကျန်သလဲ ကြည့်ပါ။`) }));

  for (;;) {
    const cur = showT(chars);
    steps.push(snap({ line: 'pass', tag: t('pass', 'pass'),
      note: cuts === 0
        ? t(`Scan ${cur.en} from the left for the first adjacent pair.`,
            `${cur.my} ကို ဘယ်ဘက်မှစ၍ ပထမဆုံး ဘေးချင်းကပ် အတွဲကို ရှာသည်။`)
        : chars.length === 0
          ? t('Nothing is left. One more pass to confirm there is nothing to delete.',
              'ဘာမျှ မကျန်တော့ပါ။ ဖျက်စရာ မရှိကြောင်း သေချာစေရန် နောက်တစ်ခေါက် စစ်သည်။')
          : cuts === 1
            ? t(`A deletion means the scan has to start over at the left end of ${cur.en}. A pass per deletion is where the <b>O(n²)</b> comes from.`,
                `တစ်ခု ဖျက်လိုက်တိုင်း ${cur.my} ၏ ဘယ်ဘက်အစွန်းမှ ပြန်စရှာရသည်။ ဖျက်တိုင်း တစ်ခေါက် ပြန်ရှာရခြင်းကြောင့် <b>O(n²)</b> ဖြစ်လာသည်။`)
            : t(`Start over at the left end of ${cur.en}.`, `${cur.my} ၏ ဘယ်ဘက်အစွန်းမှ ပြန်စသည်။`) }));

    let hit = -1;
    for (let i = 0; i < chars.length - 1; i++) {
      if (CLOSER_OF[chars[i]] === chars[i + 1]) { hit = i; break; }
      steps.push(snap({ line: 'match', i, tag: t('no', 'မဟုတ်'),
        note: t(`Positions ${i} and ${i + 1} hold <b>${chars[i]}${chars[i + 1]}</b>, which is not a closed pair. Slide right.`,
                `နေရာ ${i} နှင့် ${i + 1} တွင် <b>${chars[i]}${chars[i + 1]}</b> ရှိသည် — ပိတ်ပြီးသား အတွဲ မဟုတ်ပါ။ ညာဘက်သို့ ရွှေ့သည်။`) }));
    }

    if (hit < 0) {
      steps.push(snap({ line: 'stuck', tag: t('stuck', 'ရပ်'),
        note: chars.length === 0
          ? t('Nothing to scan and nothing to delete, so the loop ends here.',
              'ရှာစရာလည်း မရှိ၊ ဖျက်စရာလည်း မရှိသဖြင့် loop ဤနေရာတွင် ပြီးသည်။')
          : chars.length === 1
            ? t('One character on its own has no neighbour to pair with. The string has stopped changing.',
                'စာလုံး တစ်လုံးတည်းမှာ တွဲစရာ ဘေးချင်း မရှိပါ။ string မပြောင်းလဲတော့ပါ။')
            : t(`A full pass over ${cur.en} with nothing to delete. The string has stopped changing, so this is as far as stripping goes.`,
                `${cur.my} တစ်ခုလုံးကို ရှာပြီး ဖျက်စရာ မတွေ့ပါ။ string မပြောင်းလဲတော့သဖြင့် ဖြတ်ထုတ်ခြင်း ဤမျှသာ ရောက်နိုင်သည်။`) }));
      break;
    }

    const pair = `${chars[hit]}${chars[hit + 1]}`;
    steps.push(snap({ line: 'match', i: hit, pair: true, hit, tag: t('pair', 'အတွဲ'),
      note: t(`Positions ${hit} and ${hit + 1} hold <b>${pair}</b> — a matching pair with nothing between them.`,
              `နေရာ ${hit} နှင့် ${hit + 1} တွင် <b>${pair}</b> ရှိသည် — ကြားတွင် ဘာမျှမရှိသော ကိုက်ညီသည့် အတွဲ ဖြစ်သည်။`) }));

    const gone = [idx[hit], idx[hit + 1]];
    chars.splice(hit, 2);
    idx.splice(hit, 2);
    cuts++;
    const after = showT(chars);
    steps.push(snap({ line: 'cut', gone, hit, tag: t('cut', 'ဖြတ်'),
      note: chars.length === 0
        ? t(`Delete <b>${pair}</b> and nothing is left.`, `<b>${pair}</b> ကို ဖျက်လိုက်ရာ ဘာမျှ မကျန်တော့ပါ။`)
        : t(`Delete <b>${pair}</b>. Whatever stood on either side of it is adjacent now — ${after.en} — which is how the next pass finds pairs this one could not see.`,
            `<b>${pair}</b> ကို ဖျက်သည်။ ၎င်း၏ ဘယ်ညာ နှစ်ဖက်ရှိ စာလုံးများ ယခု ဘေးချင်းကပ်သွားပြီ — ${after.my} — ထို့ကြောင့် နောက် pass တွင် ယခု pass မမြင်ရသော အတွဲများကို တွေ့နိုင်သည်။`) }));
  }

  const verdict = chars.length === 0;
  const left = showT(chars);
  steps.push(snap({ line: 'done', verdict, tag: verdict ? t('true', 'true') : t('false', 'false'),
    note: verdict
      ? t('Nothing left. Every character was cut out as half of a matching pair, so return <b>true</b>.',
          'ဘာမျှ မကျန်ပါ။ စာလုံးတိုင်းကို ကိုက်ညီသော အတွဲ၏ တစ်ဝက်အဖြစ် ဖြတ်ထုတ်ခဲ့ပြီးဖြစ်၍ <b>true</b> ပြန်ပေးသည်။')
      : t(`${chars.length} character${chars.length === 1 ? '' : 's'} left that no cut could reach — ${left.en}. Return <b>false</b>.`,
          `မည်သည့် ဖြတ်ခြင်းမျှ မရောက်နိုင်သော စာလုံး ${chars.length} လုံး ကျန်နေသည် — ${left.my}။ <b>false</b> ပြန်ပေးသည်။`) }));
  return steps;
}

function buildStack({ s }) {
  const steps = [];
  const chars = [...s];
  const st = [];
  const snap = (extra) => ({ view: 'stack', chars, stack: [...st], i: null, seen: 0, ...extra });

  steps.push(snap({ line: 'init', tag: t('idea', 'အယူအဆ'),
    note: t('One empty stack. Openers go on it; a closer has to answer to whatever is on top, because the top is the most recent opener nobody has closed yet.',
            'stack အလွတ် တစ်ခု။ ဖွင့်ကွင်းများကို ၎င်းပေါ် တင်သည်။ ပိတ်ကွင်း ရောက်လာလျှင် top ပေါ်ရှိသည့်အရာနှင့် ကိုက်ရမည် — top သည် မပိတ်ရသေးသော နောက်ဆုံး ဖွင့်ကွင်း ဖြစ်သောကြောင့်ပင်။') }));

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    steps.push(snap({ line: 'loop', i, ch, seen: i, tag: t('read', 'ဖတ်'),
      note: t(`Character ${i} is <b>${ch}</b>.`, `စာလုံး ${i} မှာ <b>${ch}</b> ဖြစ်သည်။`) }));

    if (OPENER_OF[ch]) {
      const want = OPENER_OF[ch];
      steps.push(snap({ line: 'closer', i, ch, seen: i, peek: true, tag: t('closer', 'ပိတ်ကွင်း'),
        note: st.length
          ? t(`<b>${ch}</b> closes something. The only opener it may close is <b>${want}</b>, and it must be the one on top — anything else means an opener was left hanging inside it.`,
              `<b>${ch}</b> သည် တစ်ခုခုကို ပိတ်သည်။ ၎င်းပိတ်ခွင့်ရှိသည့် ဖွင့်ကွင်းမှာ <b>${want}</b> တစ်မျိုးတည်းဖြစ်ပြီး top ပေါ်တွင် ရှိနေရမည် — မဟုတ်လျှင် ၎င်းအတွင်း၌ မပိတ်ရသေးသော ဖွင့်ကွင်း ကျန်နေခဲ့သည်ဟု ဆိုလိုသည်။`)
          : t(`<b>${ch}</b> closes something, but the stack is empty: there is no unmatched opener for it to close.`,
              `<b>${ch}</b> သည် တစ်ခုခုကို ပိတ်သည်၊ သို့သော် stack ဗလာ ဖြစ်နေသည် — ၎င်းပိတ်စရာ ဖွင့်ကွင်း မရှိပါ။`) }));

      const top = st.pop();
      const topV = top ?? 'null';
      steps.push(snap({ line: 'pop', i, ch, top: topV, seen: i, tag: t('pop', 'pop'),
        note: top === undefined
          ? t('Nothing to take off an empty stack.', 'stack ဗလာမှ ယူစရာ မရှိပါ။')
          : t(`Take <b>${top}</b> off the top. ${st.length} opener${st.length === 1 ? '' : 's'} still waiting underneath.`,
              `top မှ <b>${top}</b> ကို ယူသည်။ အောက်တွင် ဖွင့်ကွင်း ${st.length} ခု စောင့်နေဆဲ။`) }));

      if (top !== want) {
        steps.push(snap({ line: 'mismatch', i, ch, top: topV, seen: i, bad: true, verdict: false, tag: t('false', 'false'),
          note: top === undefined
            ? t('A closer with no opener behind it. Return <b>false</b> immediately — no later character can repair this.',
                'နောက်တွင် ဖွင့်ကွင်း မရှိသော ပိတ်ကွင်း။ ချက်ချင်း <b>false</b> ပြန်ပေးသည် — နောက်လာမည့် မည်သည့်စာလုံးကမျှ ၎င်းကို ပြင်၍ မရပါ။')
            : t(`<b>${ch}</b> needed <b>${want}</b> and found <b>${top}</b>. The brackets cross instead of nesting, so return <b>false</b>.`,
                `<b>${ch}</b> လိုအပ်သည်မှာ <b>${want}</b> ဖြစ်သော်လည်း <b>${top}</b> ကို တွေ့သည်။ ကွင်းများ အထပ်လိုက် မဟုတ်ဘဲ ဖြတ်ကျော်နေသဖြင့် <b>false</b> ပြန်ပေးသည်။`) }));
        return steps;
      }
      steps.push(snap({ line: 'mismatch', i, ch, top: topV, seen: i + 1, hit: true, tag: t('match', 'ကိုက်'),
        note: t(`<b>${top}${ch}</b> — exactly what it needed. Both are accounted for and neither is ever looked at again.`,
                `<b>${top}${ch}</b> — လိုအပ်သည့်အတိုင်း အတိအကျ။ နှစ်ခုစလုံး ပြီးသွားပြီဖြစ်၍ နောက်ထပ် ပြန်မကြည့်တော့ပါ။`) }));
    } else {
      st.push(ch);
      steps.push(snap({ line: 'push', i, ch, seen: i + 1, pushed: true, tag: t('push', 'push'),
        note: t(`<b>${ch}</b> opens something, and nothing is known yet about what will close it. Push it and read on.`,
                `<b>${ch}</b> သည် တစ်ခုခုကို ဖွင့်သည်။ ၎င်းကို ဘာက ပိတ်မည်ကို မသိရသေးပါ။ push လုပ်ပြီး ဆက်ဖတ်သည်။`) }));
    }
  }

  const verdict = st.length === 0;
  steps.push(snap({ line: 'done', seen: chars.length, verdict, tag: verdict ? t('true', 'true') : t('false', 'false'),
    note: verdict
      ? t('The string ran out and so did the stack. Every opener was closed by the right closer in the right order, so return <b>true</b>.',
          'string ကုန်သွားသလို stack လည်း ဗလာ ဖြစ်သွားသည်။ ဖွင့်ကွင်းတိုင်းကို မှန်ကန်သော ပိတ်ကွင်းဖြင့် မှန်ကန်သော အစီအစဉ်အတိုင်း ပိတ်ခဲ့ပြီဖြစ်၍ <b>true</b> ပြန်ပေးသည်။')
      : t(`The string ran out with ${st.length} opener${st.length === 1 ? '' : 's'} still on the stack — <b>${st.join('')}</b> was never closed. Return <b>false</b>.`,
          `string ကုန်သွားသော်လည်း stack ပေါ်တွင် ဖွင့်ကွင်း ${st.length} ခု ကျန်နေသည် — <b>${st.join('')}</b> ကို ဘယ်တော့မှ မပိတ်ခဲ့ပါ။ <b>false</b> ပြန်ပေးသည်။`) }));
  return steps;
}

/* ---------------- drawing ----------------
 *
 * The strip card always shows s as it was given. The stage holds only what the
 * approach carries between steps: for stripping, what is left of the string
 * after the cuts; for the stack, the openers still waiting to be closed.
 */

function strip(s, { s: str }) {
  const tone = {};
  const marks = {};
  if (s.view === 'strip') {
    const alive = new Set(s.idx);
    [...str].forEach((_, j) => { if (!alive.has(j)) tone[j] = 'done'; });
    if (s.gone) s.gone.forEach((j) => { tone[j] = 'leaving'; });
    if (s.i != null) {
      const a = s.idx[s.i], b = s.idx[s.i + 1];
      tone[a] = tone[b] = s.pair ? 'entering' : 'inwin';
      marks[a] = 'i'; marks[b] = 'i+1';
    }
    if (s.verdict === false) s.idx.forEach((j) => { tone[j] = 'leaving'; });
    return cells([...str], { tone, marks });
  }
  for (let j = 0; j < s.seen; j++) tone[j] = 'done';
  if (s.i != null) {
    tone[s.i] = s.bad ? 'leaving' : s.hit || s.pushed ? 'entering' : 'inwin';
    marks[s.i] = 'i';
  }
  return cells([...str], { tone, marks });
}

function draw(s) {
  if (s.view === 'strip') {
    const tone = {};
    if (s.i != null && s.pair) { tone[s.i] = tone[s.i + 1] = 'entering'; }
    else if (s.i != null) { tone[s.i] = tone[s.i + 1] = 'inwin'; }
    if (s.verdict === false) s.chars.forEach((_, j) => { tone[j] = 'leaving'; });
    return stagePanel(
      pick(t('chars — what is left of s', 'chars — s မှ ကျန်သည့်အရာ')),
      pick(t(`${s.cuts} cut${s.cuts === 1 ? '' : 's'} · ${s.chars.length} left`, `${s.cuts} ကြိမ် ဖြတ်ပြီး · ${s.chars.length} လုံး ကျန်`)),
      stageRow(cells(s.chars, { tone }), pick(t('empty — every character was cut', 'ဗလာ — စာလုံးအားလုံး ဖြတ်ပြီး'))),
    );
  }
  const stackTone = {};
  if (s.peek && s.stack.length) stackTone[s.stack.length - 1] = 'warn';
  if (s.pushed && s.stack.length) stackTone[s.stack.length - 1] = 'up';
  if (s.verdict === false) s.stack.forEach((_, j) => { stackTone[j] = 'down'; });
  return stagePanel(
    pick(t('stack — openers still waiting', 'stack — ပိတ်ရန် စောင့်နေသော ဖွင့်ကွင်းများ')),
    pick(t(`depth ${s.stack.length}`, `အနက် ${s.stack.length}`)),
    stack(s.stack, { tone: stackTone }),
  );
}

function answer(s) {
  return verdictAnswer(s.verdict, {
    yes: t('valid', 'valid ဖြစ်သည်'),
    no: t('not valid', 'valid မဖြစ်'),
    pending: t('true or false', 'true သို့မဟုတ် false'),
  });
}

function vars(s) {
  if (s.view === 'strip') {
    return [['chars', s.chars.length ? `"${s.chars.join('')}"` : '""'],
            ['hit', s.hit ?? '—'],
            ['i', s.i ?? '—'],
            ['cuts', s.cuts]];
  }
  return [['i', s.i ?? '—'],
          ['ch', s.ch ?? '—'],
          ['top', s.top ?? '—'],
          ['stack', `[${s.stack.join(', ')}]`]];
}

/* ---------------- the code, one key per line ---------------- */


const CODE = {
  strip: {
    ruby: [
      [null, `PAIRS = { ${"'('"} =&gt; ${"')'"}, ${"'['"} =&gt; ${"']'"}, ${"'{'"} =&gt; ${"'}'"} }`],
      [null, `${k('def')} is_valid(s)`],
      ['init', `  chars = s.chars`],
      ['pass', `  ${k('loop')} ${k('do')}`],
      ['match', `    hit = (0...chars.length - 1).find { |i| PAIRS[chars[i]] == chars[i + 1] }`],
      ['stuck', `    ${k('break')} ${k('if')} hit.nil?`],
      ['cut', `    chars.slice!(hit, 2)              ${c('# delete the pair in place')}`],
      [null, `  ${k('end')}`],
      ['done', `  chars.empty?`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `PAIRS = {${"'('"}: ${"')'"}, ${"'['"}: ${"']'"}, ${"'{'"}: ${"'}'"}}`],
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} isValid(self, s):`],
      ['init', `        chars = list(s)`],
      ['pass', `        ${k('while')} ${k('True')}:`],
      ['match', `            hit = next((i ${k('for')} i ${k('in')} range(len(chars) - 1)`],
      [null, `                        ${k('if')} PAIRS.get(chars[i]) == chars[i + 1]), -1)`],
      ['stuck', `            ${k('if')} hit &lt; 0:`],
      [null, `                ${k('break')}`],
      ['cut', `            ${k('del')} chars[hit:hit + 2]      ${c('# delete the pair in place')}`],
      ['done', `        ${k('return')} ${k('not')} chars`],
    ],
    javascript: [
      [null, `${k('const')} PAIRS = { ${"'('"}: ${"')'"}, ${"'['"}: ${"']'"}, ${"'{'"}: ${"'}'"} };`],
      [null, `${k('const')} isValid = ${k('function')} (s) {`],
      ['init', `  ${k('const')} chars = [...s];`],
      ['pass', `  ${k('for')} (;;) {`],
      ['match', `    ${k('const')} hit = chars.findIndex((ch, i) =&gt; i &lt; chars.length - 1 &amp;&amp; PAIRS[ch] === chars[i + 1]);`],
      ['stuck', `    ${k('if')} (hit &lt; 0) ${k('break')};`],
      ['cut', `    chars.splice(hit, 2);              ${c('// delete the pair in place')}`],
      [null, `  }`],
      ['done', `  ${k('return')} chars.length === 0;`],
      [null, `};`],
    ],
    go: [
      [null, `${k('var')} pairs = ${k('map')}[${k('byte')}]${k('byte')}{${"'('"}: ${"')'"}, ${"'['"}: ${"']'"}, ${"'{'"}: ${"'}'"}}`],
      [null, `${k('func')} isValid(s ${k('string')}) ${k('bool')} {`],
      ['init', `    chars := []${k('byte')}(s)`],
      ['pass', `    ${k('for')} {`],
      [null, `        hit := -1`],
      [null, `        ${k('for')} i := 0; i &lt; len(chars)-1; i++ {`],
      ['match', `            ${k('if')} pairs[chars[i]] == chars[i+1] {`],
      [null, `                hit = i`],
      [null, `                ${k('break')}`],
      [null, `            }`],
      [null, `        }`],
      ['stuck', `        ${k('if')} hit &lt; 0 {`],
      [null, `            ${k('break')}`],
      [null, `        }`],
      ['cut', `        chars = append(chars[:hit], chars[hit+2:]...)  ${c('// delete the pair')}`],
      [null, `    }`],
      ['done', `    ${k('return')} len(chars) == 0`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('const')} PAIRS: [(${k('char')}, ${k('char')}); 3] = [(${"'('"}, ${"')'"}), (${"'['"}, ${"']'"}), (${"'{'"}, ${"'}'"})];`],
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} is_valid(s: String) -&gt; ${k('bool')} {`],
      ['init', `        ${k('let')} ${k('mut')} chars: Vec&lt;${k('char')}&gt; = s.chars().collect();`],
      ['pass', `        ${k('loop')} {`],
      ['match', `            ${k('let')} hit = chars.windows(2).position(|w| PAIRS.contains(&amp;(w[0], w[1])));`],
      ['stuck', `            ${k('if')} hit.is_none() { ${k('break')}; }`],
      ['cut', `            chars.drain(hit.unwrap()..hit.unwrap() + 2);  ${c('// delete the pair')}`],
      [null, `        }`],
      ['done', `        chars.is_empty()`],
      [null, `    }`],
      [null, `}`],
    ],
  },
  stack: {
    ruby: [
      [null, `CLOSERS = { ${"')'"} =&gt; ${"'('"}, ${"']'"} =&gt; ${"'['"}, ${"'}'"} =&gt; ${"'{'"} }`],
      [null, `${k('def')} is_valid(s)`],
      ['init', `  stack = []`],
      ['loop', `  s.each_char ${k('do')} |ch|`],
      ['closer', `    ${k('if')} CLOSERS.key?(ch)`],
      ['pop', `      top = stack.pop`],
      ['mismatch', `      ${k('return')} ${k('false')} ${k('if')} top != CLOSERS[ch]`],
      [null, `    ${k('else')}`],
      ['push', `      stack.push(ch)`],
      [null, `    ${k('end')}`],
      [null, `  ${k('end')}`],
      ['done', `  stack.empty?`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `CLOSERS = {${"')'"}: ${"'('"}, ${"']'"}: ${"'['"}, ${"'}'"}: ${"'{'"}}`],
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} isValid(self, s):`],
      ['init', `        stack = []`],
      ['loop', `        ${k('for')} ch ${k('in')} s:`],
      ['closer', `            ${k('if')} ch ${k('in')} CLOSERS:`],
      ['pop', `                top = stack.pop() ${k('if')} stack ${k('else')} ${k('None')}`],
      ['mismatch', `                ${k('if')} top != CLOSERS[ch]:`],
      [null, `                    ${k('return')} ${k('False')}`],
      [null, `            ${k('else')}:`],
      ['push', `                stack.append(ch)`],
      ['done', `        ${k('return')} ${k('not')} stack`],
    ],
    javascript: [
      [null, `${k('const')} CLOSERS = { ${"')'"}: ${"'('"}, ${"']'"}: ${"'['"}, ${"'}'"}: ${"'{'"} };`],
      [null, `${k('const')} isValid = ${k('function')} (s) {`],
      ['init', `  ${k('const')} stack = [];`],
      ['loop', `  ${k('for')} (${k('const')} ch ${k('of')} s) {`],
      ['closer', `    ${k('if')} (CLOSERS[ch]) {`],
      ['pop', `      ${k('const')} top = stack.pop();`],
      ['mismatch', `      ${k('if')} (top !== CLOSERS[ch]) ${k('return')} ${k('false')};`],
      [null, `    } ${k('else')} {`],
      ['push', `      stack.push(ch);`],
      [null, `    }`],
      [null, `  }`],
      ['done', `  ${k('return')} stack.length === 0;`],
      [null, `};`],
    ],
    go: [
      [null, `${k('var')} closers = ${k('map')}[${k('byte')}]${k('byte')}{${"')'"}: ${"'('"}, ${"']'"}: ${"'['"}, ${"'}'"}: ${"'{'"}}`],
      [null, `${k('func')} isValid(s ${k('string')}) ${k('bool')} {`],
      ['init', `    stack := []${k('byte')}{}`],
      ['loop', `    ${k('for')} i := 0; i &lt; len(s); i++ {`],
      ['closer', `        ${k('if')} open, isCloser := closers[s[i]]; isCloser {`],
      [null, `            top := ${k('byte')}(0)`],
      [null, `            ${k('if')} n := len(stack); n &gt; 0 {`],
      ['pop', `                top, stack = stack[n-1], stack[:n-1]`],
      [null, `            }`],
      ['mismatch', `            ${k('if')} top != open {`],
      [null, `                ${k('return')} ${k('false')}`],
      [null, `            }`],
      [null, `        } ${k('else')} {`],
      ['push', `            stack = append(stack, s[i])`],
      [null, `        }`],
      [null, `    }`],
      ['done', `    ${k('return')} len(stack) == 0`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('const')} CLOSERS: [(${k('char')}, ${k('char')}); 3] = [(${"')'"}, ${"'('"}), (${"']'"}, ${"'['"}), (${"'}'"}, ${"'{'"})];`],
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} is_valid(s: String) -&gt; ${k('bool')} {`],
      ['init', `        ${k('let')} ${k('mut')} stack: Vec&lt;${k('char')}&gt; = Vec::new();`],
      ['loop', `        ${k('for')} ch ${k('in')} s.chars() {`],
      ['closer', `            ${k('match')} CLOSERS.iter().find(|&amp;&amp;(cl, _)| cl == ch) {`],
      [null, `                Some(&amp;(_, open)) =&gt; {`],
      ['pop', `                    ${k('let')} top = stack.pop();`],
      ['mismatch', `                    ${k('if')} top != Some(open) { ${k('return')} ${k('false')}; }`],
      [null, `                }`],
      ['push', `                None =&gt; stack.push(ch),`],
      [null, `            }`],
      [null, `        }`],
      ['done', `        stack.is_empty()`],
      [null, `    }`],
      [null, `}`],
    ],
  },
};

/* ---------------- part 1: the "most recent opener" widget ----------------
 *
 * Rules 1 and 2 of the statement hinge on one fact that is easy to read past:
 * a closer is not matched against *any* opener of its type, only against the
 * most recent one still open. Drag through a string and watch which openers
 * are still waiting — and what happens when a closer finds the wrong one on top.
 *
 * Built from x-sum's widget vocabulary: .q-arr cells, the .q-slider, the amber
 * .q-tie line and the .ledger.
 */

const QW_SETS = [
  { label: t('example 4', 'ဥပမာ ၄'), s: '([])' },
  { label: t('example 5', 'ဥပမာ ၅'), s: '([)]' },
  { label: t('deep', 'အထပ်များ'), s: '{[()()]}' },
  { label: t('never closed', 'မပိတ်'), s: '(()' },
  { label: t('extra closer', 'ပိတ်ကွင်း ပို'), s: '())(' },
];

/* Read s up to (not including) position k. Returns the open stack as indices,
 * which positions were matched, and where it broke, if it did. */
function readTo(s, k) {
  const open = [];
  const matched = new Set();
  for (let j = 0; j < k; j++) {
    const ch = s[j];
    if (!OPENER_OF[ch]) { open.push(j); continue; }
    const top = open.length ? open[open.length - 1] : -1;
    if (top < 0 || s[top] !== OPENER_OF[ch]) return { open, matched, broke: j, top };
    open.pop();
    matched.add(top); matched.add(j);
  }
  return { open, matched, broke: -1 };
}

function mountStackWidget(host) {
  const state = { set: 0, k: 2 };
  const str = () => QW_SETS[state.set].s;

  host.innerHTML = `
    <div class="q-arr" data-arr></div>
    <div class="q-slider">
      <label for="qw-k" data-read></label>
      <input type="range" id="qw-k" min="0" max="${str().length}" value="${state.k}">
      <output data-out>${state.k}</output>
      <span class="q-presets" data-presets></span>
    </div>
    <p class="q-tie" data-line></p>
    <div class="ledger">
      <span class="expr" data-expr></span>
      <span class="total" data-total></span>
    </div>`;

  const q = (sel) => host.querySelector(sel);

  function render() {
    const s = str();
    const k = Math.min(state.k, s.length);
    const r = readTo(s, k);
    const openSet = new Set(r.open);
    const upTo = r.broke >= 0 ? r.broke + 1 : k;

    q('[data-read]').textContent = pick(t('read', 'ဖတ်ပြီး'));
    const slider = q('#qw-k');
    slider.max = String(s.length);
    slider.value = String(k);
    q('[data-out]').textContent = String(k);
    q('[data-presets]').innerHTML = QW_SETS.map((x, i) =>
      `<button class="chip" data-set="${i}"${i === state.set ? ' aria-pressed="true"' : ''}>${pick(x.label)}</button>`).join('');

    // kept = closed by its partner · inwin = open, still waiting · leaving = the
    // closer that found the wrong opener on top · cut = not read yet
    q('[data-arr]').innerHTML = [...s].map((ch, j) => {
      let cls = 'cut';
      if (j === r.broke) cls = 'leaving';
      else if (j < upTo && r.matched.has(j)) cls = 'kept';
      else if (j < upTo && openSet.has(j)) cls = 'inwin';
      const top = r.open.length && j === r.open[r.open.length - 1] && r.broke < 0;
      return `<div class="cell ${cls}"><span>${ch}</span><span class="idx">${top ? 'top' : j}</span></div>`;
    }).join('');

    const label = document.getElementById('q-label');
    if (label) label.textContent = pick(t(`s = "${s}"`, `s = "${s}"`));

    let line;
    if (r.broke >= 0) {
      const ch = s[r.broke];
      line = r.top < 0
        ? t(`${ch} at position ${r.broke} arrives with nothing open. Invalid — rule 3.`,
            `နေရာ ${r.broke} ရှိ ${ch} ရောက်လာချိန်တွင် ဖွင့်ထားသည့်အရာ မရှိပါ။ Invalid — စည်းမျဉ်း ၃။`)
        : t(`${ch} at position ${r.broke} needs ${OPENER_OF[ch]}, but the most recent open one is ${s[r.top]}. A ${OPENER_OF[ch]} further back does not count. Invalid — rule 2.`,
            `နေရာ ${r.broke} ရှိ ${ch} သည် ${OPENER_OF[ch]} ကို လိုသည်၊ သို့သော် နောက်ဆုံး ဖွင့်ထားသည်မှာ ${s[r.top]} ဖြစ်သည်။ နောက်ပိုင်းတွင် ${OPENER_OF[ch]} ရှိနေသော်လည်း မရေတွက်ပါ။ Invalid — စည်းမျဉ်း ၂။`);
    } else if (k === 0) {
      line = t('Nothing read yet. Drag right.', 'ဘာမျှ မဖတ်ရသေးပါ။ ညာဘက်သို့ ဆွဲပါ။');
    } else if (k === s.length) {
      line = r.open.length
        ? t(`The string is over and ${r.open.length} opener${r.open.length === 1 ? ' is' : 's are'} still waiting. Invalid — rule 1.`,
            `string ပြီးသွားသော်လည်း ဖွင့်ကွင်း ${r.open.length} ခု စောင့်နေဆဲ။ Invalid — စည်းမျဉ်း ၁။`)
        : t('Every opener was closed by the most recent matching closer. Valid.',
            'ဖွင့်ကွင်းတိုင်းကို ကိုက်ညီသော နောက်ဆုံး ပိတ်ကွင်းဖြင့် ပိတ်ခဲ့သည်။ Valid ဖြစ်သည်။');
    } else {
      const next = s[k];
      const top = r.open.length ? s[r.open[r.open.length - 1]] : null;
      line = OPENER_OF[next]
        ? top
          ? t(`Next is ${next}. It may only close the amber cell marked top — ${top}. ${top === OPENER_OF[next] ? 'It matches.' : 'It does not.'}`,
              `နောက်တစ်လုံးမှာ ${next}။ ၎င်းသည် top ဟု မှတ်ထားသော အဝါရောင် cell — ${top} — ကိုသာ ပိတ်ခွင့်ရှိသည်။ ${top === OPENER_OF[next] ? 'ကိုက်သည်။' : 'မကိုက်ပါ။'}`)
          : t(`Next is ${next}, and nothing is open for it to close.`, `နောက်တစ်လုံးမှာ ${next} ဖြစ်ပြီး ၎င်းပိတ်စရာ ဖွင့်ထားသည့်အရာ မရှိပါ။`)
        : t(`Next is ${next}, an opener. It goes on top of the ones already waiting.`,
            `နောက်တစ်လုံးမှာ ဖွင့်ကွင်း ${next} ဖြစ်သည်။ စောင့်နေသူများ၏ အပေါ်ဆုံးသို့ ရောက်မည်။`);
    }
    q('[data-line]').innerHTML = pick(line);

    // the ledger is a formula, as on x-sum: the open stack, bottom to top
    q('[data-expr]').innerHTML = `stack = "${r.open.map((j) => s[j]).join('')}"${r.broke >= 0 ? ` &nbsp;·&nbsp; "${s[r.broke]}" ✗` : ''}`;
    q('[data-total]').innerHTML = `${r.open.length}<small>${pick(t('still open', 'ဖွင့်ထားဆဲ'))}</small>`;
  }

  host.addEventListener('input', (e) => {
    if (e.target.id !== 'qw-k') return;
    state.k = Number(e.target.value); render();
  });
  host.addEventListener('click', (e) => {
    const chip = e.target.closest('[data-set]');
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

// Brackets only, and short enough that the strip still fits the stage. The cap
// is generous next to what stripping can show — a 10^4 string is exactly the
// case the stack exists to handle.
const brackets = (v) => {
  const x = v.replace(/\s+/g, '');
  if (!/^[()[\]{}]*$/.test(x)) throw new Error('only ( ) [ ] { } here');
  if (!x.length) throw new Error('needs at least one bracket');
  return x.slice(0, 14);
};

mountLesson({
  input: { s: '([])' },
  controls: [
    { key: 's', label: 's', value: '([])', parse: brackets },
  ],
  presets: [
    { label: exampleTitle(2), input: { s: '()[]{}' } },
    { label: exampleTitle(3), input: { s: '(]' } },
    { label: exampleTitle(4), input: { s: '([])' } },
    { label: exampleTitle(5), input: { s: '([)]' } },
    { label: t('Never closed', 'မပိတ်'), input: { s: '{[()](' } },
    { label: t('Closer first', 'ပိတ်ကွင်း အရင်'), input: { s: ']()' } },
  ],
  examples: [
    { title: exampleTitle(1), inputHtml: '<code>s = "()"</code>', output: 'true',
      why: [t('One pair, closed by the right type straight away.',
              'အတွဲ တစ်တွဲ — အမျိုးအစား မှန်သော ပိတ်ကွင်းဖြင့် ချက်ချင်း ပိတ်သည်။')],
      load: { s: '()' } },
    { title: exampleTitle(2), inputHtml: '<code>s = "()[]{}"</code>', output: 'true',
      why: [t('Three pairs side by side. Each closes before the next opens, so nothing is ever waiting for long.',
              'အတွဲ သုံးတွဲ ဘေးချင်းကပ်လျက်။ တစ်တွဲ ပိတ်ပြီးမှ နောက်တစ်တွဲ ဖွင့်သဖြင့် ကြာကြာ စောင့်နေရသည့်အရာ မရှိပါ။')],
      load: { s: '()[]{}' } },
    { title: exampleTitle(3), inputHtml: '<code>s = "(]"</code>', output: 'false',
      why: [t('<code>]</code> can only close a <code>[</code>. The one thing open is a <code>(</code> — rule 1.',
              '<code>]</code> သည် <code>[</code> ကိုသာ ပိတ်နိုင်သည်။ ဖွင့်ထားသည်မှာ <code>(</code> တစ်ခုတည်း — စည်းမျဉ်း ၁။')],
      load: { s: '(]' } },
    { title: exampleTitle(4), inputHtml: '<code>s = "([])"</code>', output: 'true',
      why: [t('Nested: <code>[]</code> closes inside <code>()</code>. The inner pair has to close first, and it does.',
              'အထပ်လိုက်: <code>[]</code> သည် <code>()</code> အတွင်း၌ ပိတ်သည်။ အတွင်းအတွဲ အရင်ပိတ်ရမည်ဖြစ်ပြီး ထိုအတိုင်း ပိတ်သည်။')],
      load: { s: '([])' } },
    { title: exampleTitle(5), inputHtml: '<code>s = "([)]"</code>', output: 'false',
      why: [t('Every bracket has a partner of the right type and the counts balance — and it is still invalid. <code>)</code> arrives while <code>[</code> is the most recent opener: the pairs cross instead of nesting. Rule 2.',
              'ကွင်းတိုင်းတွင် အမျိုးအစားမှန်သော အဖော် ရှိပြီး အရေအတွက်လည်း ညီသည် — သို့သော် invalid ဖြစ်နေဆဲ။ <code>)</code> ရောက်လာချိန်တွင် နောက်ဆုံး ဖွင့်ကွင်းမှာ <code>[</code> ဖြစ်နေသည် — အတွဲများ အထပ်လိုက် မဟုတ်ဘဲ ဖြတ်ကျော်နေသည်။ စည်းမျဉ်း ၂။')],
      load: { s: '([)]' } },
  ],
  modes: [
    { id: 'strip', name: 'Strip pairs',
      desc: t('Delete adjacent closed pairs until nothing changes.', 'ဘေးချင်းကပ် ပိတ်ပြီးသား အတွဲများကို မပြောင်းလဲတော့သည်အထိ ဖျက်သည်။'),
      cost: 'O(n²) time · O(n) space', build: buildStrip },
    { id: 'stack', name: 'Stack',
      desc: t('One pass. Match each closer against the most recent opener.', 'တစ်ခေါက်တည်း။ ပိတ်ကွင်းတိုင်းကို နောက်ဆုံး ဖွင့်ကွင်းနှင့် တိုက်စစ်သည်။'),
      cost: 'O(n) time · O(n) space', build: buildStack },
  ],
  languages: LANGUAGES,
  code: CODE,
  solutions: {
    strip: { desc: t('Correct, and worth seeing work — but every deletion restarts the scan from the left, a pass per cut. Quadratic, and it passes LeetCode only because <code>n ≤ 10⁴</code>.',
                     'မှန်သည်၊ အလုပ်လုပ်ပုံကိုလည်း မြင်ထိုက်သည် — သို့သော် ဖျက်လိုက်တိုင်း ဘယ်ဘက်မှ ပြန်စရှာရသဖြင့် ဖြတ်တိုင်း တစ်ခေါက်။ Quadratic ဖြစ်ပြီး <code>n ≤ 10⁴</code> ဖြစ်၍သာ LeetCode တွင် အောင်သည်။') },
    stack: { desc: t('The submission worth writing. Pop before comparing, and count an empty pop as a mismatch — that one line handles a closer with nothing open.',
                     'ရေးသင့်သည့် submission ဖြစ်သည်။ နှိုင်းယှဉ်ခြင်းမပြုမီ pop လုပ်ပါ၊ ဗလာ pop ကို မကိုက်ဟု သတ်မှတ်ပါ — ထိုတစ်ကြောင်းက ဖွင့်ထားခြင်းမရှိဘဲ ရောက်လာသော ပိတ်ကွင်းကို ကိုင်တွယ်ပေးသည်။') },
  },
  // How each language was actually checked. Printed as a badge on every
  // listing in part 3. The case corpus: the 5 examples, 12,000 random strings
  // of length 1–10, 8,000 valid strings (half with one character flipped), and
  // six at n = 10⁴ — checked against a separate recursive-descent parser.
  // Go and Rust ran in Docker (golang:1.23-alpine, rust:1-slim).
  verification: {
    ruby: 'ran here · 20,020 cases vs a parser',
    python: 'ran here · 20,020 cases vs a parser',
    javascript: 'ran here · 20,020 cases vs a parser',
    go: 'ran here · 20,020 cases · Go 1.23',
    rust: 'ran here · 20,020 cases · rustc 1.98',
  },
  strip,
  stripLabel: t('The string s', 'String s'),
  draw,
  answer,
  vars,
  widget: mountStackWidget,
});
