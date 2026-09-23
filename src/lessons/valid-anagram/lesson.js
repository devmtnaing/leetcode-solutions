/* Valid Anagram — LeetCode 242.
 *
 * The contrast worth seeing: sorting throws away the one thing that actually
 * matters — how many of each letter there are — and then reconstructs it by
 * putting every letter in order, which costs O(n log n). The tally keeps that
 * count directly, so each letter of t only has to ask "does the tally still
 * owe me one of these?", and a lookup answers that.
 *
 * Every string a reader sees here is a plain { en, my } pair, which the kit
 * resolves with pick(). Only the cost strings stay as they are: "O(n log n)
 * time" is notation, not prose.
 */
import { mountLesson, esc } from '../../lib/stepper.js';
import { strip, kv, panels } from '../../lib/stage.js';
import { pick, onLangChange } from '../../lib/i18n.js';

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

/* ---------------- step generators ---------------- */

function buildSort({ s, t }) {
  const steps = [];
  const sc = [...s];
  const tc = [...t];
  const snap = (extra) => ({ view: 'sort', a: sc, b: tc, aSorted: false, bSorted: false, ...extra });

  steps.push(snap({ line: 'len', tag: { en: 'length',
      my: 'အရှည်' },
    note: { en: `<b>s</b> has ${plural(sc.length, 'letter')}, <b>t</b> has ${plural(tc.length, 'letter')}.`,
      my: `<b>s</b> တွင် စာလုံး ${sc.length} လုံး၊ <b>t</b> တွင် ${tc.length} လုံး ရှိသည်။` } }));

  if (sc.length !== tc.length) {
    steps.push(snap({ line: 'len', verdict: false, tag: { en: 'no',
      my: 'မဟုတ်' },
      note: { en: 'Two strings of different lengths cannot be anagrams, and the check is free. Return <b>false</b>.',
      my: 'အရှည် မတူသော စာကြောင်းနှစ်ကြောင်းသည် anagram မဖြစ်နိုင်ပါ။ စစ်ဆေးရန်လည်း ဘာမှ မကုန်ပါ။ <b>false</b> ပြန်ပေးလိုက်သည်။' } }));
    return steps;
  }

  const a = [...sc].sort();
  const b = [...tc].sort();

  steps.push(snap({ line: 'sorts', a, aSorted: true, tag: { en: 'sort',
      my: 'sort လုပ်' },
    note: { en: `Sort a copy of <b>s</b>: <b>${a.join('')}</b>. The original order is gone, which is fine — order was never what the question asked about.`,
      my: `<b>s</b> ၏ မိတ္တူတစ်ခုကို sort လုပ်လိုက်သည် — <b>${a.join('')}</b>။ မူရင်းအစီအစဉ် ပျောက်သွားပြီ၊ သို့သော် ကိစ္စ မရှိပါ — မေးခွန်းက အစီအစဉ်ကို ဘယ်တုန်းကမှ မမေးခဲ့ပါ။` } }));
  steps.push(snap({ line: 'sortt', a, b, aSorted: true, bSorted: true, tag: { en: 'sort',
      my: 'sort လုပ်' },
    note: { en: `Sort <b>t</b> the same way: <b>${b.join('')}</b>. Two sorts is where the <b>O(n log n)</b> goes.`,
      my: `<b>t</b> ကိုလည်း အတူတူ sort လုပ်သည် — <b>${b.join('')}</b>။ <b>O(n log n)</b> ကုန်သွားသည်မှာ ဤ sort နှစ်ခုကြောင့် ဖြစ်သည်။` } }));

  for (let i = 0; i < a.length; i++) {
    const same = a[i] === b[i];
    if (!same) {
      steps.push(snap({ line: 'compare', a, b, aSorted: true, bSorted: true, i, bad: true,
        verdict: false, tag: { en: 'differ',
      my: 'ကွဲသွား' },
        note: { en: `Position ${i}: <b>${a[i]}</b> against <b>${b[i]}</b>. The sorted forms part ways here, so return <b>false</b>.`,
      my: `နေရာ ${i} — <b>${a[i]}</b> နှင့် <b>${b[i]}</b>။ sort လုပ်ထားသော ပုံစံနှစ်ခု ဤနေရာတွင် ကွဲသွားသဖြင့် <b>false</b> ပြန်ပေးသည်။` } }));
      return steps;
    }
    steps.push(snap({ line: 'compare', a, b, aSorted: true, bSorted: true, i, tag: { en: 'same',
      my: 'တူ' },
      note: { en: `Position ${i}: both <b>${a[i]}</b>. The equality check does this for every position; it stops at the first pair that differs.`,
      my: `နေရာ ${i} — နှစ်ခုလုံး <b>${a[i]}</b>။ တူညီမှု စစ်ဆေးချက်သည် နေရာတိုင်းအတွက် ဤအတိုင်း လုပ်ပြီး ပထမဆုံး မတူသည့် အတွဲတွင် ရပ်သည်။` } }));
  }

  steps.push(snap({ line: 'compare', a, b, aSorted: true, bSorted: true, verdict: true, tag: { en: 'yes',
      my: 'ဟုတ်' },
    note: { en: 'Every position matched, so the sorted forms are the same string. Return <b>true</b>.',
      my: 'နေရာတိုင်း ကိုက်ညီသဖြင့် sort လုပ်ထားသော ပုံစံနှစ်ခုမှာ တစ်ထပ်တည်း ဖြစ်နေသည်။ <b>true</b> ပြန်ပေးသည်။' } }));
  return steps;
}

function buildCount({ s, t }) {
  const steps = [];
  const count = {};
  const snap = (extra) => ({ view: 'count', count: { ...count }, si: null, ti: null,
    sDone: 0, tDone: 0, ...extra });

  steps.push(snap({ line: 'len', tag: { en: 'length',
      my: 'အရှည်' },
    note: { en: `<b>s</b> has ${plural(s.length, 'letter')}, <b>t</b> has ${plural(t.length, 'letter')}.`,
      my: `<b>s</b> တွင် စာလုံး ${s.length} လုံး၊ <b>t</b> တွင် ${t.length} လုံး ရှိသည်။` } }));

  if (s.length !== t.length) {
    steps.push(snap({ line: 'len', verdict: false, tag: { en: 'no',
      my: 'မဟုတ်' },
      note: { en: 'Different lengths, so no tally can balance. Return <b>false</b> before touching a single letter.',
      my: 'အရှည် မတူသဖြင့် ဘယ်လို ရေတွက်ရေတွက် မျှမည် မဟုတ်ပါ။ စာလုံးတစ်လုံးမှ မထိရသေးဘဲ <b>false</b> ပြန်ပေးလိုက်သည်။' } }));
    return steps;
  }

  steps.push(snap({ line: 'init', tag: { en: 'tally',
      my: 'ရေတွက်' },
    note: { en: 'One table, letter to a number. Nothing in it yet, and it never grows past 26 rows.',
      my: 'ဇယားတစ်ခုတည်း — စာလုံးတစ်လုံးလျှင် ကိန်းတစ်လုံး။ ယခု ဘာမှ မရှိသေးဘဲ၊ အတန်း 26 ကြောင်းထက် ဘယ်တော့မှ မကျော်ပါ။' } }));
  steps.push(snap({ line: 'sloop', tag: { en: 'phase',
      my: 'အဆင့်' },
    note: { en: 'First pass: walk <b>s</b> and add one to the row for each letter. This is the demand t will have to meet.',
      my: 'ပထမ အကျော့ — <b>s</b> ကို လျှောက်ပြီး စာလုံးတစ်လုံးစီအတွက် သက်ဆိုင်ရာ အတန်းကို တစ်တိုးသည်။ ဤသည်မှာ t ဖြည့်ဆည်းပေးရမည့် လိုအပ်ချက် ဖြစ်သည်။' } }));

  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    const before = count[ch] || 0;
    count[ch] = before + 1;
    steps.push(snap({ line: 'up', si: i, sDone: i, key: ch, keyTone: 'warn',
      tag: { en: 'in s',
      my: 's ထဲ' },
      note: before === 0
        ? { en: `<b>s[${i}]</b> is <b>${ch}</b>, the first one. The row starts at <b>1</b>.`,
      my: `<b>s[${i}]</b> မှာ <b>${ch}</b> ဖြစ်ပြီး ပထမဆုံး တစ်လုံး ဖြစ်သည်။ ထိုအတန်းသည် <b>1</b> မှ စသည်။` }
        : { en: `<b>s[${i}]</b> is another <b>${ch}</b>. Its row goes ${before} → <b>${before + 1}</b>.`,
      my: `<b>s[${i}]</b> က နောက်ထပ် <b>${ch}</b> တစ်လုံး။ သူ့အတန်း ${before} → <b>${before + 1}</b> သို့ တက်သည်။` } }));
  }

  steps.push(snap({ line: 'loop', sDone: s.length, tag: { en: 'phase',
      my: 'အဆင့်' },
    note: { en: 'Second pass: walk <b>t</b> and subtract. Each letter of t spends one unit of what s put in.',
      my: 'ဒုတိယ အကျော့ — <b>t</b> ကို လျှောက်ပြီး နုတ်သည်။ t ၏ စာလုံးတစ်လုံးစီသည် s ထည့်ထားသည့်အထဲမှ တစ်ခုစီ သုံးသည်။' } }));

  for (let i = 0; i < t.length; i++) {
    const ch = t[i];
    const before = count[ch] || 0;
    count[ch] = before - 1;
    const now = count[ch];

    steps.push(snap({ line: 'down', ti: i, sDone: s.length, tDone: i, key: ch,
      keyTone: now < 0 ? 'down' : now === 0 ? 'up' : 'warn', bad: now < 0, tag: { en: 'in t',
      my: 't ထဲ' },
      note: now < 0
        ? { en: `<b>t[${i}]</b> is <b>${ch}</b>, but the row is already at 0 — s never supplied this one. Subtracting takes it to <b>-1</b>.`,
      my: `<b>t[${i}]</b> မှာ <b>${ch}</b> ဖြစ်သော်လည်း ထိုအတန်းသည် 0 ရောက်နေပြီ — s က ဤစာလုံးကို လုံးဝ မပေးခဲ့ပါ။ နုတ်လိုက်သဖြင့် <b>-1</b> သို့ ကျသွားသည်။` }
        : { en: `<b>t[${i}]</b> is <b>${ch}</b>. The row owed ${before}, so spend one: ${before} → <b>${now}</b>.`,
      my: `<b>t[${i}]</b> မှာ <b>${ch}</b>။ ထိုအတန်းတွင် ${before} ကျန်သေးသဖြင့် တစ်ခု သုံးလိုက်သည် — ${before} → <b>${now}</b>။` } }));

    if (now < 0) {
      steps.push(snap({ line: 'neg', ti: i, sDone: s.length, tDone: i, key: ch, keyTone: 'down',
        bad: true, verdict: false, tag: { en: 'no',
      my: 'မဟုတ်' },
        note: { en: `A negative row means t has more <b>${ch}</b>s than s does. Nothing later can fix that, so return <b>false</b> now.`,
      my: `အတန်းက အနုတ် ဖြစ်သွားသည်ဆိုသည်မှာ t တွင် <b>${ch}</b> အရေအတွက် s ထက် ပိုများနေသည် ဟု ဆိုလိုသည်။ နောက်ပိုင်းတွင် ဘာမှ ပြန်ပြင်၍ မရတော့သဖြင့် ယခုပင် <b>false</b> ပြန်ပေးလိုက်သည်။` } }));
      return steps;
    }
  }

  steps.push(snap({ line: 'yes', sDone: s.length, tDone: t.length, verdict: true, tag: { en: 'yes',
      my: 'ဟုတ်' },
    note: { en: 'Every row is back at zero: t spent exactly what s supplied. Return <b>true</b>. Equal lengths are what make "no row went negative" sufficient — with equal totals, no row can be left positive either.',
      my: 'အတန်းတိုင်း သုညသို့ ပြန်ရောက်သွားပြီ — s ပေးထားသမျှအတိုင်း t က အတိအကျ သုံးသွားသည်။ <b>true</b> ပြန်ပေးသည်။ အရှည် တူညီခြင်းကြောင့်သာ “အတန်းတစ်ခုမှ အနုတ် မဖြစ်ခဲ့” ဆိုသည်က လုံလောက်သည် — စုစုပေါင်း တူညီနေလျှင် အတန်းတစ်ခုမှ အပေါင်းဘက်တွင်လည်း ကျန်နေနိုင်မည် မဟုတ်ပါ။' } }));
  return steps;
}

/* ---------------- drawing ---------------- */

function drawSort(s) {
  const toneA = {};
  const toneB = {};
  if (s.i != null) {
    for (let j = 0; j < s.i; j++) { toneA[j] = 'done'; toneB[j] = 'done'; }
    if (s.bad) { toneA[s.i] = 'warn'; toneB[s.i] = 'down'; }
  }
  if (s.verdict === true) {
    s.a.forEach((_, j) => { toneA[j] = 'up'; toneB[j] = 'up'; });
  }
  return panels(
    strip(s.a, { at: s.i ?? null, tone: toneA, label: s.aSorted ? 's sorted' : 's' }),
    strip(s.b, { at: s.i ?? null, tone: toneB, label: s.bSorted ? 't sorted' : 't' }),
  );
}

function drawCount(s, input) {
  const sc = [...input.s];
  const tc = [...input.t];
  const toneS = {};
  const toneT = {};
  for (let j = 0; j < s.sDone; j++) toneS[j] = 'done';
  for (let j = 0; j < s.tDone; j++) toneT[j] = 'done';
  if (s.bad && s.ti != null) toneT[s.ti] = 'down';

  const kvTone = {};
  if (s.key) kvTone[s.key] = s.keyTone || 'warn';
  if (s.verdict === true) Object.keys(s.count).forEach((key) => { kvTone[key] = 'up'; });

  return panels(
    strip(sc, { at: s.si ?? null, tone: toneS, label: 's' }),
    strip(tc, { at: s.ti ?? null, tone: toneT, label: 't' }),
    kv(s.count, { at: s.key ?? null, tone: kvTone, label: 'count', keyName: 'letter', valName: 'owed' }),
  );
}

function draw(s, input) {
  if (!s.view) return '';
  return s.view === 'sort' ? drawSort(s) : drawCount(s, input);
}

function vars(s) {
  const verdict = s.verdict == null ? '—' : String(s.verdict);
  if (s.view === 'sort') {
    return [['i', s.i ?? '—'],
            ['a[i]', s.i != null ? s.a[s.i] : '—'],
            ['b[i]', s.i != null && s.bSorted ? s.b[s.i] : '—'],
            ['verdict', verdict]];
  }
  return [[{ en: 'pass',
      my: 'အကျော့' }, s.ti != null
              ? pick({ en: 'spending on t',
      my: 't ကို သုံးနေ' })
              : s.si != null ? pick({ en: 'tallying s',
      my: 's ကို ရေတွက်နေ' }) : '—'],
          ['letter', s.key ?? '—'],
          ['count[letter]', s.key != null ? s.count[s.key] : '—'],
          ['rows', Object.keys(s.count || {}).length],
          ['verdict', verdict]];
}

/* ---------------- the code, one key per line ---------------- */

const c = (t) => `<span class="c">${t}</span>`;
const k = (t) => `<span class="k">${t}</span>`;

const CODE = {
  sort: {
    ruby: [
      [null, `${k('def')} is_anagram(s, t)`],
      ['len', `  ${k('return')} ${k('false')} ${k('unless')} s.length == t.length`],
      ['sorts', `  a = s.chars.sort`],
      ['sortt', `  b = t.chars.sort`],
      ['compare', `  a == b`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} isAnagram(self, s: str, t: str) -&gt; bool:`],
      ['len', `        ${k('if')} len(s) != len(t):`],
      [null, `            ${k('return')} ${k('False')}`],
      ['sorts', `        a = sorted(s)`],
      ['sortt', `        b = sorted(t)`],
      ['compare', `        ${k('return')} a == b`],
    ],
    javascript: [
      [null, `${k('const')} isAnagram = ${k('function')} (s, t) {`],
      ['len', `  ${k('if')} (s.length !== t.length) ${k('return')} ${k('false')};`],
      ['sorts', `  ${k('const')} a = [...s].sort();`],
      ['sortt', `  ${k('const')} b = [...t].sort();`],
      ['compare', `  ${k('return')} a.join('') === b.join('');`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} isAnagram(s ${k('string')}, t ${k('string')}) ${k('bool')} {`],
      ['len', `    ${k('if')} len(s) != len(t) {`],
      [null, `        ${k('return')} ${k('false')}`],
      [null, `    }`],
      [null, `    a, b := []${k('byte')}(s), []${k('byte')}(t)`],
      ['sorts', `    sort.Slice(a, ${k('func')}(i, j ${k('int')}) ${k('bool')} { ${k('return')} a[i] &lt; a[j] })`],
      ['sortt', `    sort.Slice(b, ${k('func')}(i, j ${k('int')}) ${k('bool')} { ${k('return')} b[i] &lt; b[j] })`],
      ['compare', `    ${k('return')} ${k('string')}(a) == ${k('string')}(b)`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} is_anagram(s: String, t: String) -&gt; bool {`],
      ['len', `        ${k('if')} s.len() != t.len() { ${k('return')} ${k('false')}; }`],
      [null, `        ${k('let')} ${k('mut')} a: Vec&lt;char&gt; = s.chars().collect();`],
      ['sorts', `        a.sort_unstable();`],
      [null, `        ${k('let')} ${k('mut')} b: Vec&lt;char&gt; = t.chars().collect();`],
      ['sortt', `        b.sort_unstable();`],
      ['compare', `        a == b`],
      [null, `    }`],
      [null, `}`],
    ],
  },
  count: {
    ruby: [
      [null, `${k('def')} is_anagram(s, t)`],
      ['len', `  ${k('return')} ${k('false')} ${k('unless')} s.length == t.length`],
      ['init', `  count = Hash.new(0)              ${c('# letter => how many s owes')}`],
      ['sloop', `  s.each_char ${k('do')} |ch|`],
      ['up', `    count[ch] += 1`],
      [null, `  ${k('end')}`],
      ['loop', `  t.each_char ${k('do')} |ch|`],
      ['down', `    count[ch] -= 1`],
      ['neg', `    ${k('return')} ${k('false')} ${k('if')} count[ch] &lt; 0`],
      [null, `  ${k('end')}`],
      ['yes', `  ${k('true')}`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} isAnagram(self, s: str, t: str) -&gt; bool:`],
      ['len', `        ${k('if')} len(s) != len(t):`],
      [null, `            ${k('return')} ${k('False')}`],
      ['init', `        count = {}                   ${c('# letter -> how many s owes')}`],
      ['sloop', `        ${k('for')} ch ${k('in')} s:`],
      ['up', `            count[ch] = count.get(ch, 0) + 1`],
      ['loop', `        ${k('for')} ch ${k('in')} t:`],
      ['down', `            count[ch] = count.get(ch, 0) - 1`],
      ['neg', `            ${k('if')} count[ch] &lt; 0:`],
      [null, `                ${k('return')} ${k('False')}`],
      ['yes', `        ${k('return')} ${k('True')}`],
    ],
    javascript: [
      [null, `${k('const')} isAnagram = ${k('function')} (s, t) {`],
      ['len', `  ${k('if')} (s.length !== t.length) ${k('return')} ${k('false')};`],
      ['init', `  ${k('const')} count = ${k('new')} Map();        ${c('// letter -> how many s owes')}`],
      ['sloop', `  ${k('for')} (${k('const')} ch ${k('of')} s) {`],
      ['up', `    count.set(ch, (count.get(ch) ?? 0) + 1);`],
      [null, `  }`],
      ['loop', `  ${k('for')} (${k('const')} ch ${k('of')} t) {`],
      ['down', `    count.set(ch, (count.get(ch) ?? 0) - 1);`],
      ['neg', `    ${k('if')} (count.get(ch) &lt; 0) ${k('return')} ${k('false')};`],
      [null, `  }`],
      ['yes', `  ${k('return')} ${k('true')};`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} isAnagram(s ${k('string')}, t ${k('string')}) ${k('bool')} {`],
      ['len', `    ${k('if')} len(s) != len(t) {`],
      [null, `        ${k('return')} ${k('false')}`],
      [null, `    }`],
      ['init', `    ${k('var')} count [26]${k('int')}                 ${c('// a-z only, per the constraints')}`],
      ['sloop', `    ${k('for')} i := 0; i &lt; len(s); i++ {`],
      ['up', `        count[s[i]-'a']++`],
      [null, `    }`],
      ['loop', `    ${k('for')} i := 0; i &lt; len(t); i++ {`],
      ['down', `        count[t[i]-'a']--`],
      ['neg', `        ${k('if')} count[t[i]-'a'] &lt; 0 {`],
      [null, `            ${k('return')} ${k('false')}`],
      [null, `        }`],
      [null, `    }`],
      ['yes', `    ${k('return')} ${k('true')}`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} is_anagram(s: String, t: String) -&gt; bool {`],
      ['len', `        ${k('if')} s.len() != t.len() { ${k('return')} ${k('false')}; }`],
      ['init', `        ${k('let')} ${k('mut')} count = [0i32; 26];   ${c('// a-z only, per the constraints')}`],
      ['sloop', `        ${k('for')} b ${k('in')} s.bytes() {`],
      ['up', `            count[(b - b'a') ${k('as')} usize] += 1;`],
      [null, `        }`],
      ['loop', `        ${k('for')} b ${k('in')} t.bytes() {`],
      ['down', `            count[(b - b'a') ${k('as')} usize] -= 1;`],
      ['neg', `            ${k('if')} count[(b - b'a') ${k('as')} usize] &lt; 0 { ${k('return')} ${k('false')}; }`],
      [null, `        }`],
      ['yes', `        ${k('true')}`],
      [null, `    }`],
      [null, `}`],
    ],
  },
};

/* ---------------- part 1: the question widget ----------------
 *
 * The one idea the statement hinges on is that an anagram is a multiset, not a
 * sequence. So: let the reader move the letters of t around as much as they
 * like — click a tile to swap it with its neighbour, or shuffle the whole word
 * — and keep the two count tables on screen while they do it. The string in t
 * changes every single time; not one row of the counts ever moves, and the
 * verdict never budges. Then "Change one letter" moves exactly one row, and
 * the verdict flips instantly. Order carries no information; the counts carry
 * all of it.
 */

const W = {
  title: { en: 'Order or count — which one decides?',
      my: 'အစီအစဉ်လား၊ အရေအတွက်လား — ဘယ်ဟာက ဆုံးဖြတ်သလဲ။' },
  sub: { en: 'Rearrange <b>t</b> as much as you like — click a tile to swap it with the one after it, or shuffle the whole word. Watch the two count tables while you do. Then change a single letter.',
      my: '<b>t</b> ကို ကြိုက်သလောက် ပြန်စီကြည့်ပါ — tile တစ်ခုကို နှိပ်လျှင် သူ့နောက်က တစ်ခုနှင့် နေရာလဲသည်၊ သို့မဟုတ် စကားလုံးတစ်ခုလုံးကို shuffle လုပ်နိုင်သည်။ လုပ်ရင်း အရေအတွက်ဇယား နှစ်ခုကို စောင့်ကြည့်ပါ။ ပြီးမှ စာလုံးတစ်လုံးကို လဲကြည့်ပါ။' },
  labS: { en: 's — fixed',
      my: 's — မပြောင်း' },
  labT: { en: 't — click to swap',
      my: 't — နေရာလဲရန် နှိပ်ပါ' },
  cntS: { en: 'counts in s',
      my: 's ထဲက အရေအတွက်' },
  cntT: { en: 'counts in t',
      my: 't ထဲက အရေအတွက်' },
  letter: { en: 'letter',
      my: 'စာလုံး' },
  isAna: { en: 'anagram',
      my: 'anagram ဖြစ်သည်' },
  notAna: { en: 'not an anagram',
      my: 'anagram မဟုတ်' },
  start: { en: '<b>s</b> and <b>t</b> hold exactly the same letters, so <b>t</b> is an anagram of <b>s</b>. Now move the letters of <b>t</b> and watch what does — and does not — change.',
      my: '<b>s</b> နှင့် <b>t</b> တွင် စာလုံးများ အတိအကျ တူညီသဖြင့် <b>t</b> သည် <b>s</b> ၏ anagram ဖြစ်သည်။ ယခု <b>t</b> ၏ စာလုံးများကို ရွှေ့ကြည့်ပြီး ဘာပြောင်းသည်၊ ဘာ မပြောင်းသည်ကို ကြည့်ပါ။' },
  held: {
    en: (n) => `Rearranged ${n} time${n === 1 ? '' : 's'}. <b>t</b> reads differently every time and not one row of the counts has moved. Order carries no information here — the counts carry all of it.`,
    my: (n) => `${n} ကြိမ် ပြန်စီပြီးပြီ။ <b>t</b> သည် အကြိမ်တိုင်း ပုံစံ မတူတော့သော်လည်း အရေအတွက်ဇယားမှ အတန်းတစ်ကြောင်းမှ မရွေ့ခဲ့ပါ။ ဤနေရာတွင် အစီအစဉ်က သတင်းအချက်အလက် ဘာမှ မသယ်ဆောင်ဘဲ အရေအတွက်များကသာ အကုန် သယ်ဆောင်ထားသည်။`,
  },
  broke: {
    en: (d) => `Not an anagram any more — and no amount of shuffling will bring it back, because rearranging never changes a count. What changed is a count: ${d}.`,
    my: (d) => `anagram မဟုတ်တော့ပါ — shuffle ဘယ်လောက် လုပ်လုပ် ပြန်မရတော့ပါ၊ အဘယ်ကြောင့်ဆိုသော် ပြန်စီခြင်းသည် အရေအတွက်ကို ဘယ်တော့မှ မပြောင်းလဲစေသောကြောင့် ဖြစ်သည်။ ပြောင်းသွားသည်မှာ အရေအတွက် ဖြစ်သည် — ${d}။`,
  },
  row: {
    en: (l, a, b) => `<b>${l}</b>: s has ${a}, t has ${b}`,
    my: (l, a, b) => `<b>${l}</b>: s တွင် ${a}၊ t တွင် ${b}`,
  },
  bShuffle: { en: 'Shuffle t',
      my: 't ကို shuffle လုပ်' },
  bMutate: { en: 'Change one letter',
      my: 'စာလုံးတစ်လုံး လဲကြည့်' },
  bReset: { en: 'Reset',
      my: 'အစသို့ ပြန်' },
};

const WIDGET_CSS = `
#question-widget{margin-top:16px}
.vaw{
  background:var(--surface);border:1px solid var(--line);border-radius:var(--radius);
  padding:18px 20px;max-width:74ch;display:flex;flex-direction:column;gap:14px;
}
.vaw-h{font-size:14.5px;color:var(--ink);margin:0}
.vaw-sub{font-size:13.5px;color:var(--ink-2);line-height:1.65;margin:5px 0 0}
.vaw-words{
  font-family:"IBM Plex Mono",ui-monospace,monospace;font-size:13px;color:var(--ink-2);
  background:var(--sunk);border:1px solid var(--line);border-radius:7px;padding:7px 11px;
  overflow-x:auto;white-space:nowrap;
}
.vaw-words b{color:var(--ink)}
.vaw-rows{display:flex;flex-wrap:wrap;gap:18px 26px;align-items:flex-start}
.vaw-t .st-cell{cursor:pointer}
.vaw-t .st-cell:hover{border-color:var(--accent)}
.vaw-t .st-cell:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.vaw-verdict{
  display:flex;flex-wrap:wrap;gap:9px;align-items:baseline;font-size:13.5px;line-height:1.6;
  color:var(--ink-2);background:var(--up-soft);border-left:3px solid var(--up);
  border-radius:0 7px 7px 0;padding:10px 13px;margin:0;
}
.vaw-verdict.bad{background:var(--down-soft);border-left-color:var(--down)}
.vaw-verdict > span:last-child{flex:1;min-width:190px}
.vaw-chip{
  font-family:"IBM Plex Mono",monospace;font-size:10.5px;letter-spacing:.07em;text-transform:uppercase;
  font-weight:600;background:var(--surface);color:var(--up);padding:2px 8px;border-radius:999px;white-space:nowrap;
}
.vaw-verdict.bad .vaw-chip{color:var(--down)}
.vaw-acts{display:flex;flex-wrap:wrap;gap:8px}
.vaw-btn{
  background:var(--sunk);border:1px solid var(--line);border-radius:7px;color:var(--ink-2);
  font:inherit;font-size:12.5px;padding:6px 12px;cursor:pointer;
}
.vaw-btn:hover{border-color:var(--line-2);color:var(--ink)}
.vaw-btn.primary{background:var(--accent-soft);border-color:var(--accent);color:var(--accent);font-weight:600}
:root[data-ui="my"] .vaw-sub,:root[data-ui="my"] .vaw-verdict,:root[data-ui="my"] .vaw-h{
  overflow-wrap:break-word;word-break:break-word;line-height:1.75;
}
`;

const START_S = 'anagram';
const START_T = 'nagaram';

function tally(letters) {
  const out = {};
  for (const ch of letters) out[ch] = (out[ch] || 0) + 1;
  return out;
}

function mountWidget(host) {
  const style = document.createElement('style');
  style.textContent = WIDGET_CSS;
  document.head.appendChild(style);

  const sArr = [...START_S];
  let t = [...START_T];
  let moves = 0;
  let at = null;
  let refocus = false;

  const cells = () => host.querySelectorAll('[data-vaw-t] .st-cell');

  function render() {
    const cs = tally(sArr);
    const ct = tally(t);
    // One shared, sorted row order so the two tables line up cell for cell —
    // seeing them stay identical is the entire point of the widget.
    const letters = [...new Set([...sArr, ...t])].sort();
    const rowsS = {};
    const rowsT = {};
    for (const l of letters) { rowsS[l] = cs[l] || 0; rowsT[l] = ct[l] || 0; }

    const off = letters.filter((l) => rowsS[l] !== rowsT[l]);
    const ok = off.length === 0;
    const tone = {};
    for (const l of off) tone[l] = 'down';

    // Mark the letters of t that are in surplus, left to right.
    const spare = {};
    for (const l of off) if (rowsT[l] > rowsS[l]) spare[l] = rowsT[l] - rowsS[l];
    const tTone = {};
    t.forEach((ch, i) => { if (spare[ch] > 0) { tTone[i] = 'down'; spare[ch] -= 1; } });

    const detail = off.map((l) => pick(W.row)(l, rowsS[l], rowsT[l])).join(' · ');
    const body = ok
      ? (moves === 0 ? pick(W.start) : pick(W.held)(moves))
      : pick(W.broke)(detail);

    host.innerHTML = `
      <div class="vaw">
        <div>
          <h3 class="vaw-h">${esc(pick(W.title))}</h3>
          <p class="vaw-sub">${pick(W.sub)}</p>
        </div>
        <div class="vaw-words">s = <b>${esc(sArr.join(''))}</b> &nbsp;·&nbsp; t = <b>${esc(t.join(''))}</b></div>
        <div class="vaw-rows">
          ${strip(sArr, { label: pick(W.labS) })}
          <div class="vaw-t" data-vaw-t>${strip(t, { at, tone: tTone, label: pick(W.labT) })}</div>
        </div>
        <div class="vaw-rows">
          ${kv(rowsS, { tone, label: pick(W.cntS), keyName: pick(W.letter), valName: 'count' })}
          ${kv(rowsT, { tone, label: pick(W.cntT), keyName: pick(W.letter), valName: 'count' })}
        </div>
        <p class="vaw-verdict${ok ? '' : ' bad'}">
          <span class="vaw-chip">${esc(pick(ok ? W.isAna : W.notAna))}</span>
          <span>${body}</span>
        </p>
        <div class="vaw-acts">
          <button class="vaw-btn primary" type="button" data-vaw="shuffle">${esc(pick(W.bShuffle))}</button>
          <button class="vaw-btn" type="button" data-vaw="mutate">${esc(pick(W.bMutate))}</button>
          <button class="vaw-btn" type="button" data-vaw="reset">${esc(pick(W.bReset))}</button>
        </div>
      </div>`;

    cells().forEach((cell, i) => {
      cell.tabIndex = 0;
      cell.setAttribute('role', 'button');
      if (refocus && i === at) cell.focus();
    });
    refocus = false;
  }

  /* swap position i with the one after it, wrapping at the end */
  function swap(i, viaKey) {
    const j = (i + 1) % t.length;
    if (i === j) return;
    const before = t.join('');
    [t[i], t[j]] = [t[j], t[i]];
    if (t.join('') !== before) moves += 1;
    at = j;
    refocus = viaKey;
    render();
  }

  function shuffle() {
    const before = t.join('');
    for (let tries = 0; tries < 40 && t.join('') === before; tries++) {
      for (let i = t.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [t[i], t[j]] = [t[j], t[i]];
      }
    }
    if (t.join('') !== before) moves += 1;
    at = null;
    render();
  }

  function mutate() {
    const i = Math.floor(Math.random() * t.length);
    let ch = t[i];
    while (ch === t[i]) ch = String.fromCharCode(97 + Math.floor(Math.random() * 26));
    t[i] = ch;
    at = i;
    render();
  }

  function reset() {
    t = [...START_T];
    moves = 0;
    at = null;
    render();
  }

  const indexOf = (cell) => [...cell.parentElement.children].indexOf(cell);

  host.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-vaw]');
    if (btn) {
      if (btn.dataset.vaw === 'shuffle') shuffle();
      else if (btn.dataset.vaw === 'mutate') mutate();
      else reset();
      return;
    }
    const cell = e.target.closest('[data-vaw-t] .st-cell');
    if (cell) swap(indexOf(cell), false);
  });

  // Enter and space on a focused tile. The stepper listens for space on the
  // document to play/pause, so stop this one before it gets there.
  host.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const cell = e.target.closest && e.target.closest('[data-vaw-t] .st-cell');
    if (!cell) return;
    e.preventDefault();
    e.stopPropagation();
    swap(indexOf(cell), true);
  });

  render();
  onLangChange(render);
}

/* ---------------- mount ---------------- */

const word = (v) => {
  const x = v.trim().toLowerCase();
  if (!/^[a-z]*$/.test(x)) throw new Error('lowercase letters only');
  return x.slice(0, 12);
};

const CONTROLS = [
  { key: 's', label: { en: 'word s',
      my: 'စကားလုံး s' }, size: 14, value: 'anagram', parse: word },
  { key: 't', label: { en: 'word t',
      my: 'စကားလုံး t' }, size: 14, value: 'nagaram', parse: word },
];

mountLesson({
  root: document.getElementById('lesson'),
  input: { s: 'anagram', t: 'nagaram' },
  controls: CONTROLS,
  modes: [
    { id: 'sort',
      name: { en: 'Sort both',
      my: 'နှစ်ခုလုံးကို sort လုပ်ရန်' },
      blurb: { en: 'Same letters, same sorted string',
      my: 'စာလုံးတူလျှင် sort လုပ်ထားသည့် စာကြောင်းလည်း တူသည်' },
      cost: 'O(n log n) time · O(n) space', build: buildSort },
    { id: 'count',
      name: { en: 'Count letters',
      my: 'စာလုံးများကို ရေတွက်ရန်' },
      blurb: { en: 'One tally, up on s and down on t',
      my: 'ဇယားတစ်ခုတည်း — s တွင် တိုး၊ t တွင် နုတ်' },
      cost: 'O(n) time · O(1) space', build: buildCount },
  ],
  languages: [
    { id: 'ruby', name: 'Ruby' }, { id: 'python', name: 'Python' },
    { id: 'javascript', name: 'JavaScript' }, { id: 'go', name: 'Go' }, { id: 'rust', name: 'Rust' },
  ],
  code: CODE,
  // How each language was actually checked. Printed as a badge on every
  // listing in part 3, so a language nothing ran says so on the page.
  verification: {
    ruby: 'run here · 4 examples + 10,000 random cases',
    python: 'run here · 4 examples + 10,000 random cases',
    javascript: 'run here · 4 examples + 10,000 random cases',
    go: 'not compiled — no Go/Rust toolchain, Docker down',
    rust: 'not compiled — no Go/Rust toolchain, Docker down',
  },
  draw,
  vars,
});

/* Exported so the verification script can assert every widget string has a
   Burmese side; nothing on the page imports it. */
export { W as WIDGET_STRINGS };

const widgetHost = document.getElementById('question-widget');
if (widgetHost) mountWidget(widgetHost);

