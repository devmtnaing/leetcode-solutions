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
import { t, plural, exampleTitle, LANGUAGES, k, c, verdictAnswer, labelledRows } from '../../lib/kit.js';
import { mountLesson } from '../../lib/stepper.js';
import { cells, strip, kv, panels } from '../../lib/stage.js';
import { pick, onLangChange } from '../../lib/i18n.js';


/* ---------------- step generators ---------------- */

function buildSort({ s, t }) {
  const steps = [];
  const sc = [...s];
  const tc = [...t];
  const snap = (extra) => ({ view: 'sort', a: sc, b: tc, aSorted: false, bSorted: false, ...extra });

  steps.push(snap({ line: 'len', tag: { en: 'length', my: 'အရှည်' },
    note: { en: `<b>s</b> has ${plural(sc.length, 'letter')}, <b>t</b> has ${plural(tc.length, 'letter')}.`,
            my: `<b>s</b> တွင် စာလုံး ${sc.length} လုံး၊ <b>t</b> တွင် ${tc.length} လုံး ရှိသည်။` } }));

  if (sc.length !== tc.length) {
    steps.push(snap({ line: 'len', verdict: false, tag: { en: 'no', my: 'မဟုတ်' },
      note: { en: 'Two strings of different lengths cannot be anagrams, and the check is free. Return <b>false</b>.',
              my: 'အရှည် မတူသော စာကြောင်းနှစ်ကြောင်းသည် anagram မဖြစ်နိုင်ပါ။ စစ်ဆေးရန်လည်း ဘာမှ မကုန်ပါ။ <b>false</b> ပြန်ပေးလိုက်သည်။' } }));
    return steps;
  }

  const a = [...sc].sort();
  const b = [...tc].sort();

  steps.push(snap({ line: 'sorts', a, aSorted: true, tag: { en: 'sort', my: 'sort လုပ်' },
    note: { en: `Sort a copy of <b>s</b>: <b>${a.join('')}</b>. The original order is gone, which is fine — order was never what the question asked about.`,
            my: `<b>s</b> ၏ မိတ္တူတစ်ခုကို sort လုပ်လိုက်သည် — <b>${a.join('')}</b>။ မူရင်းအစီအစဉ် ပျောက်သွားပြီ၊ သို့သော် ကိစ္စ မရှိပါ — မေးခွန်းက အစီအစဉ်ကို ဘယ်တုန်းကမှ မမေးခဲ့ပါ။` } }));
  steps.push(snap({ line: 'sortt', a, b, aSorted: true, bSorted: true, tag: { en: 'sort', my: 'sort လုပ်' },
    note: { en: `Sort <b>t</b> the same way: <b>${b.join('')}</b>. Two sorts is where the <b>O(n log n)</b> goes.`,
            my: `<b>t</b> ကိုလည်း အတူတူ sort လုပ်သည် — <b>${b.join('')}</b>။ <b>O(n log n)</b> ကုန်သွားသည်မှာ ဤ sort နှစ်ခုကြောင့် ဖြစ်သည်။` } }));

  for (let i = 0; i < a.length; i++) {
    const same = a[i] === b[i];
    if (!same) {
      steps.push(snap({ line: 'compare', a, b, aSorted: true, bSorted: true, i, bad: true,
        verdict: false, tag: { en: 'differ', my: 'ကွဲသွား' },
        note: { en: `Position ${i}: <b>${a[i]}</b> against <b>${b[i]}</b>. The sorted forms part ways here, so return <b>false</b>.`,
                my: `နေရာ ${i} — <b>${a[i]}</b> နှင့် <b>${b[i]}</b>။ sort လုပ်ထားသော ပုံစံနှစ်ခု ဤနေရာတွင် ကွဲသွားသဖြင့် <b>false</b> ပြန်ပေးသည်။` } }));
      return steps;
    }
    steps.push(snap({ line: 'compare', a, b, aSorted: true, bSorted: true, i, tag: { en: 'same', my: 'တူ' },
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

  steps.push(snap({ line: 'len', tag: { en: 'length', my: 'အရှည်' },
    note: { en: `<b>s</b> has ${plural(s.length, 'letter')}, <b>t</b> has ${plural(t.length, 'letter')}.`,
            my: `<b>s</b> တွင် စာလုံး ${s.length} လုံး၊ <b>t</b> တွင် ${t.length} လုံး ရှိသည်။` } }));

  if (s.length !== t.length) {
    steps.push(snap({ line: 'len', verdict: false, tag: { en: 'no', my: 'မဟုတ်' },
      note: { en: 'Different lengths, so no tally can balance. Return <b>false</b> before touching a single letter.',
              my: 'အရှည် မတူသဖြင့် ဘယ်လို ရေတွက်ရေတွက် မျှမည် မဟုတ်ပါ။ စာလုံးတစ်လုံးမှ မထိရသေးဘဲ <b>false</b> ပြန်ပေးလိုက်သည်။' } }));
    return steps;
  }

  steps.push(snap({ line: 'init', tag: { en: 'tally', my: 'ရေတွက်' },
    note: { en: 'One table, letter to a number. Nothing in it yet, and it never grows past 26 rows.',
            my: 'ဇယားတစ်ခုတည်း — စာလုံးတစ်လုံးလျှင် ကိန်းတစ်လုံး။ ယခု ဘာမှ မရှိသေးဘဲ၊ အတန်း 26 ကြောင်းထက် ဘယ်တော့မှ မကျော်ပါ။' } }));
  steps.push(snap({ line: 'sloop', tag: { en: 'phase', my: 'အဆင့်' },
    note: { en: 'First pass: walk <b>s</b> and add one to the row for each letter. This is the demand t will have to meet.',
            my: 'ပထမ အကျော့ — <b>s</b> ကို လျှောက်ပြီး စာလုံးတစ်လုံးစီအတွက် သက်ဆိုင်ရာ အတန်းကို တစ်တိုးသည်။ ဤသည်မှာ t ဖြည့်ဆည်းပေးရမည့် လိုအပ်ချက် ဖြစ်သည်။' } }));

  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    const before = count[ch] || 0;
    count[ch] = before + 1;
    steps.push(snap({ line: 'up', si: i, sDone: i, key: ch, keyTone: 'warn',
      tag: { en: 'in s', my: 's ထဲ' },
      note: before === 0
        ? { en: `<b>s[${i}]</b> is <b>${ch}</b>, the first one. The row starts at <b>1</b>.`,
            my: `<b>s[${i}]</b> မှာ <b>${ch}</b> ဖြစ်ပြီး ပထမဆုံး တစ်လုံး ဖြစ်သည်။ ထိုအတန်းသည် <b>1</b> မှ စသည်။` }
        : { en: `<b>s[${i}]</b> is another <b>${ch}</b>. Its row goes ${before} → <b>${before + 1}</b>.`,
            my: `<b>s[${i}]</b> က နောက်ထပ် <b>${ch}</b> တစ်လုံး။ သူ့အတန်း ${before} → <b>${before + 1}</b> သို့ တက်သည်။` } }));
  }

  steps.push(snap({ line: 'loop', sDone: s.length, tag: { en: 'phase', my: 'အဆင့်' },
    note: { en: 'Second pass: walk <b>t</b> and subtract. Each letter of t spends one unit of what s put in.',
            my: 'ဒုတိယ အကျော့ — <b>t</b> ကို လျှောက်ပြီး နုတ်သည်။ t ၏ စာလုံးတစ်လုံးစီသည် s ထည့်ထားသည့်အထဲမှ တစ်ခုစီ သုံးသည်။' } }));

  for (let i = 0; i < t.length; i++) {
    const ch = t[i];
    const before = count[ch] || 0;
    count[ch] = before - 1;
    const now = count[ch];

    steps.push(snap({ line: 'down', ti: i, sDone: s.length, tDone: i, key: ch,
      keyTone: now < 0 ? 'down' : now === 0 ? 'up' : 'warn', bad: now < 0, tag: { en: 'in t', my: 't ထဲ' },
      note: now < 0
        ? { en: `<b>t[${i}]</b> is <b>${ch}</b>, but the row is already at 0 — s never supplied this one. Subtracting takes it to <b>-1</b>.`,
            my: `<b>t[${i}]</b> မှာ <b>${ch}</b> ဖြစ်သော်လည်း ထိုအတန်းသည် 0 ရောက်နေပြီ — s က ဤစာလုံးကို လုံးဝ မပေးခဲ့ပါ။ နုတ်လိုက်သဖြင့် <b>-1</b> သို့ ကျသွားသည်။` }
        : { en: `<b>t[${i}]</b> is <b>${ch}</b>. The row owed ${before}, so spend one: ${before} → <b>${now}</b>.`,
            my: `<b>t[${i}]</b> မှာ <b>${ch}</b>။ ထိုအတန်းတွင် ${before} ကျန်သေးသဖြင့် တစ်ခု သုံးလိုက်သည် — ${before} → <b>${now}</b>။` } }));

    if (now < 0) {
      steps.push(snap({ line: 'neg', ti: i, sDone: s.length, tDone: i, key: ch, keyTone: 'down',
        bad: true, verdict: false, tag: { en: 'no', my: 'မဟုတ်' },
        note: { en: `A negative row means t has more <b>${ch}</b>s than s does. Nothing later can fix that, so return <b>false</b> now.`,
                my: `အတန်းက အနုတ် ဖြစ်သွားသည်ဆိုသည်မှာ t တွင် <b>${ch}</b> အရေအတွက် s ထက် ပိုများနေသည် ဟု ဆိုလိုသည်။ နောက်ပိုင်းတွင် ဘာမှ ပြန်ပြင်၍ မရတော့သဖြင့် ယခုပင် <b>false</b> ပြန်ပေးလိုက်သည်။` } }));
      return steps;
    }
  }

  steps.push(snap({ line: 'yes', sDone: s.length, tDone: t.length, verdict: true, tag: { en: 'yes', my: 'ဟုတ်' },
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
  return [[{ en: 'pass', my: 'အကျော့' }, s.ti != null
              ? pick({ en: 'spending on t', my: 't ကို သုံးနေ' })
              : s.si != null ? pick({ en: 'tallying s', my: 's ကို ရေတွက်နေ' }) : '—'],
          ['letter', s.key ?? '—'],
          ['count[letter]', s.key != null ? s.count[s.key] : '—'],
          ['rows', Object.keys(s.count || {}).length],
          ['verdict', verdict]];
}

/* ---------------- the code, one key per line ---------------- */


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
      [null, `${k('import')} ${c('"sort"')}`],
      [null, ``],
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

/* ---------------- part 1: the "order or count" widget ----------------
 *
 * The one idea the statement hinges on is that an anagram is a multiset, not a
 * sequence. Rotate t with the slider, click a letter to swap it with the next
 * one, or shuffle it: t reads differently every time, the letter counts in the
 * ledger never move, and the verdict never budges. Then change one letter —
 * exactly one count moves, and the verdict flips. Order carries no
 * information; the counts carry all of it.
 *
 * Built from x-sum's widget vocabulary: .q-arr cells (kept / cut), the
 * .q-slider, the amber .q-tie line and the .ledger.
 */

const W = {
  start: { en: '<b>s</b> and <b>t</b> hold exactly the same letters, so <b>t</b> is an anagram of <b>s</b>. Now move the letters of <b>t</b> and watch what does — and does not — change.',
           my: '<b>s</b> နှင့် <b>t</b> တွင် စာလုံးများ အတိအကျ တူညီသဖြင့် <b>t</b> သည် <b>s</b> ၏ anagram ဖြစ်သည်။ ယခု <b>t</b> ၏ စာလုံးများကို ရွှေ့ကြည့်ပြီး ဘာပြောင်းသည်၊ ဘာ မပြောင်းသည်ကို ကြည့်ပါ။' },
  held: {
    en: (n) => `Rearranged ${n} time${n === 1 ? '' : 's'}. <b>t</b> reads differently every time and not one count has moved. Order carries no information here — the counts carry all of it.`,
    my: (n) => `${n} ကြိမ် ပြန်စီပြီးပြီ။ <b>t</b> သည် အကြိမ်တိုင်း ပုံစံ မတူတော့သော်လည်း အရေအတွက် တစ်ခုမှ မရွေ့ခဲ့ပါ။ ဤနေရာတွင် အစီအစဉ်က သတင်းအချက်အလက် ဘာမှ မသယ်ဆောင်ဘဲ အရေအတွက်များကသာ အကုန် သယ်ဆောင်ထားသည်။`,
  },
  broke: {
    en: (d) => `Not an anagram — and no amount of rearranging will fix it, because rearranging never changes a count. What differs is a count: ${d}.`,
    my: (d) => `anagram မဟုတ်ပါ — ဘယ်လောက် ပြန်စီစီ ပြန်မရနိုင်ပါ၊ အဘယ်ကြောင့်ဆိုသော် ပြန်စီခြင်းသည် အရေအတွက်ကို ဘယ်တော့မှ မပြောင်းလဲစေသောကြောင့် ဖြစ်သည်။ ကွာနေသည်မှာ အရေအတွက် ဖြစ်သည် — ${d}။`,
  },
  row: {
    en: (l, a, b) => `<b>${l}</b>: s has ${a}, t has ${b}`,
    my: (l, a, b) => `<b>${l}</b>: s တွင် ${a}၊ t တွင် ${b}`,
  },
  rotate: { en: 'rotate t', my: 't ကို လှည့်' },
  shuffle: { en: 'shuffle t', my: 't ကို shuffle' },
  mutate: { en: 'change one letter', my: 'စာလုံးတစ်လုံး လဲ' },
  isAna: { en: 'anagram', my: 'anagram ဖြစ်သည်' },
  notAna: { en: 'not an anagram', my: 'anagram မဟုတ်' },
  differ: { en: 'counts differ', my: 'ကွာသော အရေအတွက်' },
};

const QW_SETS = [
  { label: exampleTitle(1), s: 'anagram', t: 'nagaram' },
  { label: exampleTitle(2), s: 'rat', t: 'car' },
];

function tally(letters) {
  const out = {};
  for (const ch of letters) out[ch] = (out[ch] || 0) + 1;
  return out;
}

function mountWidget(host) {
  const state = { set: 0, t: [...QW_SETS[0].t], turn: 0, moves: 0 };
  const shown = () => [...state.t.slice(state.turn), ...state.t.slice(0, state.turn)];
  // swapping, shuffling or changing a letter acts on what is on screen
  const settle = (next) => { state.t = next; state.turn = 0; };

  host.innerHTML = `
    <div data-rows></div>
    <div class="q-slider">
      <label for="qw-turn" data-lbl></label>
      <input type="range" id="qw-turn" min="0" max="1" value="0">
      <output data-out>0</output>
      <span class="q-presets" data-presets></span>
    </div>
    <p class="q-tie" data-line></p>
    <div class="ledger">
      <span class="expr" data-expr></span>
      <span class="total" data-total></span>
    </div>`;

  const q = (sel) => host.querySelector(sel);

  function render(focus = null) {
    const sWord = [...QW_SETS[state.set].s];
    const tWord = shown();
    const cs = tally(sWord);
    const ct = tally(tWord);
    const letters = [...new Set([...sWord, ...tWord])].sort();
    const off = letters.filter((l) => (cs[l] || 0) !== (ct[l] || 0));
    const ok = off.length === 0;

    // cut = a letter the other word has fewer of; kept = accounted for
    const row = (word, mine, other, clickable) => {
      const spare = {};
      for (const l of off) if ((mine[l] || 0) > (other[l] || 0)) spare[l] = (mine[l] || 0) - (other[l] || 0);
      return word.map((ch, i) => {
        const cut = spare[ch] > 0 && (spare[ch] -= 1, true);
        return `<div class="cell ${cut ? 'cut' : 'kept'}"${clickable ? ` role="button" tabindex="0" data-i="${i}"` : ''}><span>${ch}</span><span class="idx">${i}</span></div>`;
      }).join('');
    };
    q('[data-rows]').innerHTML =
      `<div class="q-arr"><span class="q-row-label">s</span>${row(sWord, cs, ct, false)}</div>`
      + `<div class="q-arr"><span class="q-row-label">t</span>${row(tWord, ct, cs, true)}</div>`;
    if (focus != null) q(`[data-i="${focus}"]`)?.focus();

    q('[data-lbl]').textContent = pick(W.rotate);
    const slider = q('#qw-turn');
    slider.max = String(tWord.length - 1);
    slider.value = String(state.turn);
    q('[data-out]').textContent = String(state.turn);
    q('[data-presets]').innerHTML = QW_SETS.map((x, i) =>
      `<button class="chip" data-set="${i}"${i === state.set ? ' aria-pressed="true"' : ''}>${pick(x.label)}</button>`).join('')
      + `<button class="chip" data-act="shuffle">${pick(W.shuffle)}</button>`
      + `<button class="chip" data-act="mutate">${pick(W.mutate)}</button>`;

    const label = document.getElementById('q-label');
    if (label) label.textContent = pick(ok ? W.isAna : W.notAna);

    const detail = off.map((l) => pick(W.row)(l, cs[l] || 0, ct[l] || 0)).join(' · ');
    q('[data-line]').innerHTML = ok ? (state.moves ? pick(W.held)(state.moves) : pick(W.start)) : pick(W.broke)(detail);

    // the ledger is a formula, as on x-sum: the two multisets side by side
    const counts = (c) => Object.keys(c).sort().map((l) => `${l}${c[l]}`).join(' ');
    q('[data-expr]').innerHTML = `s: ${counts(cs)} &nbsp;·&nbsp; t: ${counts(ct)}`;
    q('[data-total]').innerHTML = `${off.length}<small>${pick(W.differ)}</small>`;
  }

  function rearranged(before) { if (shown().join('') !== before) state.moves += 1; }

  host.addEventListener('input', (ev) => {
    if (ev.target.id !== 'qw-turn') return;
    const before = shown().join('');
    state.turn = Number(ev.target.value);
    rearranged(before);
    render();
  });

  function swap(i, viaKey) {
    const word = shown();
    const j = (i + 1) % word.length;
    if (i === j) return;
    const before = word.join('');
    [word[i], word[j]] = [word[j], word[i]];
    settle(word);
    rearranged(before);
    render(viaKey ? j : null);
  }

  host.addEventListener('click', (ev) => {
    const cell = ev.target.closest('[data-i]');
    if (cell) return swap(Number(cell.dataset.i), false);
    const chip = ev.target.closest('[data-set], [data-act]');
    if (!chip) return;
    if (chip.dataset.set != null) {
      state.set = Number(chip.dataset.set);
      settle([...QW_SETS[state.set].t]);
      state.moves = 0;
    } else if (chip.dataset.act === 'shuffle') {
      const word = shown();
      const before = word.join('');
      for (let tries = 0; tries < 40 && word.join('') === before; tries++) {
        for (let i = word.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [word[i], word[j]] = [word[j], word[i]];
        }
      }
      settle(word);
      rearranged(before);
    } else {
      const word = shown();
      const i = Math.floor(Math.random() * word.length);
      let ch = word[i];
      while (ch === word[i]) ch = String.fromCharCode(97 + Math.floor(Math.random() * 26));
      word[i] = ch;
      settle(word);
    }
    render();
  });

  // Enter and space on a focused letter. The stepper listens for space on the
  // document to play/pause, so stop this one before it gets there.
  host.addEventListener('keydown', (ev) => {
    if (ev.key !== 'Enter' && ev.key !== ' ') return;
    const cell = ev.target.closest && ev.target.closest('[data-i]');
    if (!cell) return;
    ev.preventDefault();
    ev.stopPropagation();
    swap(Number(cell.dataset.i), true);
  });

  onLangChange(() => render());
  render();
}

/* ---------------- the approach, in brief ----------------
 *
 * Shown in part 2 under the approach tabs: the idea, the steps as the code
 * takes them (named after its identifiers), and the cost with its reason. */

const APPROACH = {
  sort: {
    idea: t("Two strings are anagrams exactly when they hold the same letters the same number of times, and sorting turns equal collections of letters into equal strings.",
        "string နှစ်ခုသည် စာလုံးတူကို အကြိမ်ရေ တူတူ ပါမှသာ anagram ဖြစ်ပြီး sort လုပ်ခြင်းက စာလုံး အစုတူများကို string တူများ ဖြစ်စေသည်။"),
    steps: [
      t("If the lengths differ, return <code>false</code>.",
        "အရှည် မတူလျှင် <code>false</code> ကို ပြန်ပေးသည်။"),
      t("Sort the characters of <code>s</code> into <code>a</code>, and of <code>t</code> into <code>b</code>.",
        "<code>s</code> ၏ စာလုံးများကို sort လုပ်၍ <code>a</code>၊ <code>t</code> ၏ စာလုံးများကို <code>b</code> ထဲ ထည့်သည်။"),
      t("Return whether <code>a</code> equals <code>b</code>.",
        "<code>a</code> နှင့် <code>b</code> တူမတူကို ပြန်ပေးသည်။"),
    ],
    cost: t("two sorts of up to 5 × 10⁴ characters, and a sorted copy of each string.",
        "စာလုံး 5 × 10⁴ အထိ sort နှစ်ကြိမ်နှင့် string တစ်ခုစီ၏ sort လုပ်ထားသော copy။"),
  },
  count: {
    idea: t("Count instead of sorting: add one for every letter of <code>s</code> and take one away for every letter of <code>t</code>. Anagrams bring every count back to zero.",
        "sort မလုပ်ဘဲ ရေတွက်သည် — <code>s</code> ၏ စာလုံးတိုင်းအတွက် တစ်ပေါင်းပြီး <code>t</code> ၏ စာလုံးတိုင်းအတွက် တစ်နုတ်သည်။ anagram ဖြစ်လျှင် count တိုင်း သုညသို့ ပြန်ရောက်သည်။"),
    steps: [
      t("If the lengths differ, return <code>false</code>.",
        "အရှည် မတူလျှင် <code>false</code> ကို ပြန်ပေးသည်။"),
      t("Walk <code>s</code>: <code>count[ch] += 1</code>.",
        "<code>s</code> ကို လျှောက်သည် — <code>count[ch] += 1</code>။"),
      t("Walk <code>t</code>: <code>count[ch] −= 1</code>, and return <code>false</code> the moment a count drops below zero.",
        "<code>t</code> ကို လျှောက်သည် — <code>count[ch] −= 1</code>၊ count တစ်ခု သုညအောက် ရောက်သည်နှင့် <code>false</code> ကို ပြန်ပေးသည်။"),
      t("If <code>t</code> finishes, return <code>true</code>: with equal lengths, nothing can be left over.",
        "<code>t</code> ဆုံးသွားလျှင် <code>true</code> ကို ပြန်ပေးသည် — အရှည် တူသဖြင့် ဘာမျှ ပိုမကျန်နိုင်ပါ။"),
    ],
    cost: t("each string is read once, and the table has at most 26 rows, one per lowercase letter.",
        "string တစ်ခုစီကို တစ်ကြိမ်သာ ဖတ်ပြီး table တွင် စာလုံးအသေး တစ်လုံးလျှင် row တစ်ခု၊ အများဆုံး row 26 ခုသာ ရှိသည်။"),
  },
};

/* ---------------- mount ---------------- */

const word = (v) => {
  const x = v.trim().toLowerCase();
  if (!/^[a-z]*$/.test(x)) throw new Error('lowercase letters only');
  return x.slice(0, 12);
};

const CONTROLS = [
  { key: 's', label: { en: 'word s', my: 'စကားလုံး s' }, size: 14, value: 'anagram', parse: word },
  { key: 't', label: { en: 'word t', my: 'စကားလုံး t' }, size: 14, value: 'nagaram', parse: word },
];

/* ---------------- strip card, answer card ---------------- */

function stripCard(s, input) {
  const sc = [...input.s];
  const tc = [...input.t];
  const toneS = {};
  const toneT = {};
  const marksS = {};
  const marksT = {};

  if (s.si != null) { toneS[s.si] = 'inwin'; marksS[s.si] = 'i'; }
  if (s.ti != null) { toneT[s.ti] = s.bad ? 'leaving' : 'inwin'; marksT[s.ti] = 'j'; }
  if (s.view === 'count') {
    for (let j = 0; j < (s.sDone || 0); j++) toneS[j] = 'done';
    for (let j = 0; j < (s.tDone || 0); j++) toneT[j] = 'done';
  }

  const sRow = cells(sc, { tone: toneS, marks: marksS });
  const tRow = cells(tc, { tone: toneT, marks: marksT });
  return labelledRows([['s', sRow], ['t', tRow]]);
}

function answer(s) {
  return verdictAnswer(s.verdict, {
    yes: t('is an anagram', 'anagram ဖြစ်သည်'),
    no: t('not an anagram', 'anagram မဟုတ်'),
    pending: t('true or false', 'true သို့မဟုတ် false'),
  });
}

/* ---------------- mount ---------------- */

mountLesson({
  input: { s: 'anagram', t: 'nagaram' },
  controls: CONTROLS,
  presets: [
    { label: exampleTitle(1), input: { s: 'anagram', t: 'nagaram' } },
    { label: exampleTitle(2), input: { s: 'rat', t: 'car' } },
    { label: t('Same letters, different order', 'စာလုံးတူ၊ အစီအစဉ် မတူ'), input: { s: 'listen', t: 'silent' } },
    { label: t('Full mismatch', 'လုံးဝ မတူ'), input: { s: 'hello', t: 'world' } },
  ],
  examples: [
    { title: exampleTitle(1),
      inputHtml: '<code>s = "anagram"</code>, <code>t = "nagaram"</code>', output: 'true',
      why: [t('<code>s</code> rearranged is exactly <code>t</code> — each letter appears the same number of times.',
              '<code>s</code> ကို ပြန်စီလိုက်လျှင် <code>t</code> အတိုင်း ဖြစ်သည် — စာလုံးတိုင်း၏ အရေအတွက် တူညီသည်။')],
      load: { s: 'anagram', t: 'nagaram' } },
    { title: exampleTitle(2),
      inputHtml: '<code>s = "rat"</code>, <code>t = "car"</code>', output: 'false',
      why: [t('<code>r</code> appears in both, but <code>a</code> and <code>t</code> are in <code>s</code> while <code>c</code> is in <code>t</code> — the counts do not match.',
              '<code>r</code> သည် နှစ်ခုလုံးတွင် ပါသော်လည်း <code>a</code> နှင့် <code>t</code> က <code>s</code> ထဲတွင် ရှိပြီး <code>c</code> က <code>t</code> ထဲတွင် ရှိသည် — အရေအတွက်များ မကိုက်ညီပါ။')],
      load: { s: 'rat', t: 'car' } },
  ],
  modes: [
    { id: 'sort',
      name: { en: 'Sort both', my: 'နှစ်ခုလုံးကို sort လုပ်ရန်' },
      desc: t('Same letters, same sorted string — two sorts, then walk both together.',
              'စာလုံးတူလျှင် sort လုပ်ထားသည့် စာကြောင်းလည်း တူသည် — sort နှစ်ခါ၊ ပြီးလျှင် အတူလျှောက်ကြည့်ရုံ။'),
      cost: 'O(n log n) time · O(n) space', build: buildSort },
    { id: 'count',
      name: { en: 'Count letters', my: 'စာလုံးများကို ရေတွက်ရန်' },
      desc: t('One tally, up on s and down on t. The first number below zero says no.',
              'ဇယားတစ်ခုတည်း — s တွင် တိုး၊ t တွင် နုတ်။ သုညအောက် ရောက်သည်နှင့် false ပြန်လိုက်သည်။'),
      cost: 'O(n) time · O(1) space', build: buildCount },
  ],
  languages: LANGUAGES,
  code: CODE,
  solutions: {
    sort: { approach: APPROACH.sort, desc: t('Sort a copy of each string, then compare. Three lines, hard to get wrong, and the only approach that handles Unicode without an edit.',
                    'စာကြောင်းနှစ်ခုစလုံး၏ မိတ္တူကို sort လုပ်ပြီး နှိုင်းယှဉ်သည်။ သုံးကြောင်းသာ ရှိပြီး မှားရန် ခက်သည်။ Unicode ကို ဘာမှ မပြင်ဘဲ ရင်ဆိုင်နိုင်သည့် တစ်ခုတည်းသော နည်းလည်း ဖြစ်သည်။') },
    count: { approach: APPROACH.count, desc: t('Walk s and add to a count table, walk t and subtract. The moment a row goes below zero, return false — no recovery possible.',
                    's ကို လျှောက်ပြီး ရေတွက်ဇယားတွင် တိုးသည်၊ t ကို လျှောက်ပြီး နုတ်သည်။ အတန်းတစ်ခု သုညအောက် ရောက်သည်နှင့် false ပြန်လိုက်သည် — ပြန်တက်လာနိုင်မည် မဟုတ်ပါ။') },
  },
  // How each language was actually checked, printed as the part 3 badges.
  // The corpus: 6 edges, 15,000 strings over "abc", 5,000 permutations (half with one letter changed), three at 5 × 10⁴ — against a Counter.
  // Go and Rust ran in Docker (golang:1.23-alpine, rust:1-slim).
  verification: {
    ruby: 'ran here · 20,009 cases',
    python: 'ran here · 20,009 cases',
    javascript: 'ran here · 20,009 cases',
    go: 'ran here · 20,009 cases · Go 1.23',
    rust: 'ran here · 20,009 cases · rustc 1.98',
  },
  strip: stripCard,
  stripLabel: t('The two strings', 'String နှစ်ခု'),
  draw,
  answer,
  vars,
  widget: mountWidget,
});
