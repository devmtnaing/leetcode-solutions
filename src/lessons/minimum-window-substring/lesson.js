/* Minimum Window Substring — LeetCode 76.
 *
 * Keep one window [lo, hi] and one table, `need`: how many more of each
 * letter the window still owes t (below zero means it has spares). Push hi
 * right until nothing is missing; then pull lo right for as long as nothing
 * goes missing, recording each window on the way. Every letter enters once
 * and leaves once, so the whole scan is O(m + n). The brute force grows a
 * fresh window from every start instead.
 */
import { mountLesson } from '../../lib/stepper.js';
import { pick, onLangChange } from '../../lib/i18n.js';
import { cells, slots, stagePanel, kv, readout } from '../../lib/stage.js';
import { t, exampleTitle, LANGUAGES, k, c, stageGap, presetChips, widgetLabel } from '../../lib/kit.js';

const MAX_S = 16, MAX_T = 6;

const letters = (max, name) => (text) => {
  const v = String(text).trim().replace(/^"|"$/g, '');
  if (!/^[A-Za-z]+$/.test(v)) throw new Error('English letters only, upper or lower case');
  if (v.length > max) throw new Error(`at most ${max} letters for ${name}, so the stage stays readable`);
  return v;
};
const distinct = (str) => [...new Set(str)];
const q = (str) => `"${str}"`;

/* ---------------- step generators ---------------- */

function buildBrute({ s, t: tt }) {
  const need = {};
  for (const ch of tt) need[ch] = (need[ch] || 0) + 1;
  let best = '';
  const steps = [];
  let have = {}, missing = tt.length;
  const snap = (extra) => ({ view: 'brute', have: { ...have }, need, missing, best, i: null, j: null, ...extra });
  steps.push(snap({ line: 'init', tag: t('count t', 't ကို ရေ'),
    note: t(`Count what t = ${q(tt)} asks for: ${Object.entries(need).map(([ch, n]) => `${n} × '${ch}'`).join(', ')}.`,
            `t = ${q(tt)} တောင်းသည်ကို ရေတွက်သည် — ${Object.entries(need).map(([ch, n]) => `'${ch}' ${n} ခု`).join('၊ ')}။`) }));
  for (let i = 0; i < s.length; i++) {
    have = {}; missing = tt.length;
    steps.push(snap({ line: 'start', i, tag: t(`start ${i}`, `အစ ${i}`),
      note: t(`A fresh window starting at ${i}: nothing counted yet, ${missing} letters missing.`, `${i} မှ စသော window အသစ် — ဘာမှ မရေတွက်ရသေး၊ စာလုံး ${missing} လုံး လိုသည်။`) }));
    for (let j = i; j < s.length; j++) {
      const ch = s[j];
      const useful = (have[ch] || 0) < (need[ch] || 0);
      if (useful) missing--;
      have[ch] = (have[ch] || 0) + 1;
      steps.push(snap({ line: 'grow', i, j, useful, tag: t(useful ? `'${ch}' counts` : `'${ch}' spare`, useful ? `'${ch}' ရေတွက်` : `'${ch}' ပို`),
        note: useful ? t(`s[${j}] = '${ch}' is one t still needs: ${missing} missing.`, `s[${j}] = '${ch}' သည် t လိုနေသေးသော စာလုံး — ${missing} လုံး လိုသည်။`)
                     : t(`s[${j}] = '${ch}' ${need[ch] ? `is a spare — t needs only ${need[ch]}` : 'is not in t'}. Still ${missing} missing.`,
                         `s[${j}] = '${ch}' ${need[ch] ? `သည် ပို — t သည် ${need[ch]} လုံးသာ လိုသည်` : 'သည် t ထဲ မပါ'}။ ${missing} လုံး လိုဆဲ။`) }));
      if (missing === 0) {
        const win = s.slice(i, j + 1);
        const better = !best || win.length < best.length;
        if (better) best = win;
        steps.push(snap({ line: 'found', i, j, better, tag: t(better ? `best ${q(win)}` : 'not shorter', better ? `best ${q(win)}` : 'မတိုပါ'),
          note: better ? t(`${q(win)} covers t, the shortest so far. Stop growing: any longer window from ${i} is worse.`, `${q(win)} သည် t ကို ဖုံးသည်၊ ယခုထိ အတိုဆုံး။ ကြီးထွားခြင်း ရပ် — ${i} မှ ပိုရှည်သော window သည် ပိုဆိုးသည်။`)
                       : t(`${q(win)} covers t but is not shorter than ${q(best)}. Stop growing.`, `${q(win)} သည် t ကို ဖုံးသော်လည်း ${q(best)} ထက် မတိုပါ။ ကြီးထွားခြင်း ရပ်။`) }));
        break;
      }
    }
  }
  steps.push(snap({ line: 'ret', finished: true, tag: t(best ? q(best) : '""', best ? q(best) : '""'),
    note: best ? t(`Every start tried: the shortest window is ${q(best)}.`, `အစတိုင်း စမ်းပြီး — အတိုဆုံး window သည် ${q(best)}။`)
               : t('No window covers t: return "".', 't ကို ဖုံးသော window မရှိ — "" ပြန်သည်။') }));
  return steps;
}

function buildWindow({ s, t: tt }) {
  const need = {};
  for (const ch of tt) need[ch] = (need[ch] || 0) + 1;
  let missing = tt.length, lo = 0, bestLo = 0, bestLen = s.length + 1;
  const steps = [];
  const snap = (extra) => ({ view: 'window', need: { ...need }, missing, lo, hi: null, bestLo, bestLen, gone: null, ...extra });
  steps.push(snap({ line: 'init', tag: t('need = t', 'need = t'),
    note: t(`need starts as t's counts, missing = ${missing}. need[c] is how many more c the window owes; below zero, it has spares.`,
            `need သည် t ၏ အရေအတွက်ဖြင့် စသည်၊ missing = ${missing}။ need[c] သည် window က c ကို ထပ်ပေးရမည့် အရေအတွက် — သုညအောက်ဆိုလျှင် ပိုနေသည်။`) }));
  for (let hi = 0; hi < s.length; hi++) {
    const ch = s[hi];
    const useful = (need[ch] || 0) > 0;
    if (useful) missing--;
    need[ch] = (need[ch] || 0) - 1;
    steps.push(snap({ line: 'grow', hi, useful, tag: t(useful ? `'${ch}' counts` : `'${ch}' spare`, useful ? `'${ch}' ရေတွက်` : `'${ch}' ပို`),
      note: useful ? t(`Take s[${hi}] = '${ch}': the window needed it. missing = ${missing}.`, `s[${hi}] = '${ch}' ကို ယူသည် — window က လိုခဲ့သည်။ missing = ${missing}။`)
                   : t(`Take s[${hi}] = '${ch}': ${tt.includes(ch) ? 'a spare' : 'not in t'} — need['${ch}'] = ${need[ch]}. missing stays ${missing}.`,
                       `s[${hi}] = '${ch}' ကို ယူသည် — ${tt.includes(ch) ? 'ပို' : 't ထဲ မပါ'} — need['${ch}'] = ${need[ch]}။ missing သည် ${missing} အတိုင်း။`) }));
    while (missing === 0) {
      const len = hi - lo + 1;
      const better = len < bestLen;
      if (better) { bestLo = lo; bestLen = len; }
      steps.push(snap({ line: better ? 'best' : 'shrink', hi, better, tag: t(better ? `best ${q(s.slice(lo, hi + 1))}` : 'covers, longer', better ? `best ${q(s.slice(lo, hi + 1))}` : 'ဖုံး၊ ပိုရှည်'),
        note: better ? t(`Nothing missing: ${q(s.slice(lo, hi + 1))} covers t and is the shortest yet (${len}). Now try to shrink it from the left.`,
                         `ဘာမှ မလို — ${q(s.slice(lo, hi + 1))} သည် t ကို ဖုံးပြီး ယခုထိ အတိုဆုံး (${len})။ ယခု ဘယ်ဘက်မှ ချုံ့ကြည့်မည်။`)
                     : t(`Nothing missing, but ${q(s.slice(lo, hi + 1))} (${len}) is not shorter than the best (${bestLen}). Shrink from the left.`,
                         `ဘာမှ မလိုသော်လည်း ${q(s.slice(lo, hi + 1))} (${len}) သည် best (${bestLen}) ထက် မတိုပါ။ ဘယ်ဘက်မှ ချုံ့သည်။`) }));
      const out = s[lo];
      need[out] = (need[out] || 0) + 1;
      const lost = need[out] > 0;
      if (lost) missing++;
      lo++;
      steps.push(snap({ line: 'shrink', hi, gone: lo - 1, lost, tag: t(lost ? `lost '${out}'` : `drop '${out}'`, lost ? `'${out}' ဆုံး` : `'${out}' ဖယ်`),
        note: lost ? t(`Drop s[${lo - 1}] = '${out}': that was one t needed, so missing = ${missing}. Stop shrinking; grow again.`,
                       `s[${lo - 1}] = '${out}' ကို ဖယ်သည် — ၎င်းသည် t လိုသော စာလုံး ဖြစ်သဖြင့် missing = ${missing}။ ချုံ့ခြင်း ရပ်၊ ပြန်ကြီးထွား။`)
                   : t(`Drop s[${lo - 1}] = '${out}': ${tt.includes(out) ? 'a spare' : 'not in t'}, so nothing goes missing. Keep shrinking.`,
                       `s[${lo - 1}] = '${out}' ကို ဖယ်သည် — ${tt.includes(out) ? 'ပို' : 't ထဲ မပါ'} ဖြစ်သဖြင့် ဘာမှ မလိုလာ။ ဆက်ချုံ့။`) }));
    }
  }
  const ans = bestLen <= s.length ? s.slice(bestLo, bestLo + bestLen) : '';
  steps.push(snap({ line: 'ret', finished: true, tag: t(q(ans), q(ans)),
    note: ans ? t(`hi reached the end. The shortest window seen is ${q(ans)}, starting at ${bestLo}.`, `hi အဆုံးသို့ ရောက်ပြီ။ တွေ့ခဲ့သော အတိုဆုံး window သည် ${bestLo} မှ စသော ${q(ans)}။`)
              : t('The window never covered t: return "".', 'window သည် t ကို ဘယ်တော့မှ မဖုံးခဲ့ — "" ပြန်သည်။') }));
  return steps;
}

/* ---------------- drawing ----------------
 *
 * The strip card is s with the current window lit. The stage is the table the
 * approach keeps for t's letters — the brute force's have / need, or the
 * window's single `need`, where a negative is a spare — with missing and the
 * best window so far. */

function strip(s, { s: str }) {
  const lo = s.view === 'brute' ? s.i : s.lo;
  const hi = s.view === 'brute' ? s.j : s.hi;
  const tone = {};
  const marks = {};
  [...str].forEach((_, x) => {
    if (s.finished) return;
    if (x === s.gone) tone[x] = 'leaving';
    else if (x === hi && (s.line === 'grow')) tone[x] = 'entering';
    else if (lo != null && hi != null && x >= lo && x <= hi) tone[x] = 'inwin';
    else if (lo != null && x < lo) tone[x] = 'done';
  });
  if (s.finished && s.view === 'window' && s.bestLen <= str.length) for (let x = s.bestLo; x < s.bestLo + s.bestLen; x++) tone[x] = 'entering';
  if (s.finished && s.view === 'brute' && s.best) { const at = str.indexOf(s.best); for (let x = at; x < at + s.best.length; x++) tone[x] = 'entering'; }
  if (!s.finished) {
    if (lo != null) marks[lo] = s.view === 'brute' ? 'i' : 'lo';
    if (hi != null) marks[hi] = hi === lo ? `${marks[hi]}, ${s.view === 'brute' ? 'j' : 'hi'}` : s.view === 'brute' ? 'j' : 'hi';
  }
  return cells([...str], { tone, marks });
}

function draw(s, { s: str, t: tt }) {
  const chars = distinct(tt);
  const cur = s.view === 'brute' ? (s.j != null ? str[s.j] : null) : s.gone != null ? str[s.gone] : s.hi != null ? str[s.hi] : null;
  const tone = cur && chars.includes(cur) ? { [cur]: 'warn' } : {};
  const best = s.view === 'brute' ? s.best : s.bestLen <= str.length ? str.slice(s.bestLo, s.bestLo + s.bestLen) : '';
  if (s.view === 'brute') {
    const table = Object.fromEntries(chars.map((ch) => [ch, `${s.have[ch] || 0} of ${s.need[ch]}`]));
    return stagePanel(pick(t('have, of what t needs', 'ရှိပြီး — t လိုသည့်အနက်')), '', kv(table, { keyName: 'letter', valName: 'have', tone }))
      + stageGap + readout({ missing: s.missing, best: best ? q(best) : '—' });
  }
  const table = Object.fromEntries(chars.map((ch) => [ch, s.need[ch]]));
  return stagePanel(pick(t('need — still owed; below 0 is a spare', 'need — ပေးရန်ကျန်၊ 0 အောက်သည် ပို')), '', kv(table, { keyName: 'letter', valName: 'need', tone }))
    + stageGap + readout({ missing: s.missing, best: best ? q(best) : '—' });
}

function answer(s, { s: str }) {
  const best = s.view === 'brute' ? s.best : s.bestLen <= str.length ? str.slice(s.bestLo, s.bestLo + s.bestLen) : '';
  return {
    html: slots([q(best || '')], { total: 1, just: s.finished ? 0 : -1 }),
    note: s.finished ? t('the minimum window', 'အနည်းဆုံး window') : t('best so far', 'ယခုထိ အကောင်းဆုံး'),
  };
}

function vars(s, { s: str, t: tt }) {
  const out = [['s', q(str)], ['t', q(tt)], ['missing', s.missing]];
  if (s.view === 'brute') {
    out.push(['best', q(s.best)], ['need', JSON.stringify(s.need)], ['have', JSON.stringify(s.have)]);
    if (s.i != null) out.push(['i', s.i]);
    if (s.j != null) out.push(['j', s.j]);
  } else {
    out.push(['need', `{${distinct(tt).map((ch) => `${ch}: ${s.need[ch]}`).join(', ')}}`], ['lo', s.lo], ['best_lo', s.bestLo], ['bestLo', s.bestLo],
      ['best_len', s.bestLen > str.length ? 'm + 1 (none yet)' : s.bestLen], ['bestLen', s.bestLen > str.length ? 'm + 1 (none yet)' : s.bestLen]);
    if (s.hi != null) out.push(['hi', s.hi], ['ch', `'${str[s.hi]}'`]);
  }
  return out;
}

/* ---------------- the code, one key per line ----------------
 *
 * Generated from the verified solution files, so the listing a reader copies
 * is byte-identical to the one that ran. */

const CODE = {
  brute: {
    ruby: [
      [null, `${k('def')} min_window(s, t)`],
      [null, `  need = Hash.new(0)`],
      ['init', `  t.each_char { |ch| need[ch] += 1 }`],
      ['init', `  best = ''`],
      [null, `  (0...s.length).each ${k('do')} |i|`],
      ['start', `    have = Hash.new(0)`],
      ['start', `    missing = t.length`],
      [null, `    (i...s.length).each ${k('do')} |j|`],
      ['grow', `      missing -= 1 ${k('if')} have[s[j]] &lt; need[s[j]]`],
      ['grow', `      have[s[j]] += 1`],
      ['found', `      next ${k('unless')} missing.zero?`],
      ['found', `      best = s[i..j] ${k('if')} best.empty? || j - i + 1 &lt; best.length`],
      [null, `      break`],
      [null, `    ${k('end')}`],
      [null, `  ${k('end')}`],
      ['ret', `  best`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('from')} collections ${k('import')} Counter`],
      [null, ``],
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} minWindow(self, s, t):`],
      ['init', `        need = Counter(t)`],
      ['init', `        best = ''`],
      [null, `        ${k('for')} i ${k('in')} range(len(s)):`],
      ['start', `            have = Counter()`],
      ['start', `            missing = len(t)`],
      [null, `            ${k('for')} j ${k('in')} range(i, len(s)):`],
      ['grow', `                ${k('if')} have[s[j]] &lt; need[s[j]]:`],
      ['grow', `                    missing -= 1`],
      ['grow', `                have[s[j]] += 1`],
      ['found', `                ${k('if')} missing == 0:`],
      ['found', `                    ${k('if')} ${k('not')} best or j - i + 1 &lt; len(best):`],
      ['found', `                        best = s[i:j + 1]`],
      [null, `                    break`],
      ['ret', `        ${k('return')} best`],
    ],
    javascript: [
      [null, `${k('const')} minWindow = ${k('function')} (s, t) {`],
      [null, `  ${k('const')} need = ${k('new')} Array(128).fill(0);`],
      ['init', `  ${k('for')} (${k('const')} ch ${k('of')} t) need[ch.charCodeAt(0)]++;`],
      ['init', `  ${k('let')} best = '';`],
      [null, `  ${k('for')} (${k('let')} i = 0; i &lt; s.length; i++) {`],
      ['start', `    ${k('const')} have = ${k('new')} Array(128).fill(0);`],
      ['start', `    ${k('let')} missing = t.length;`],
      [null, `    ${k('for')} (${k('let')} j = i; j &lt; s.length; j++) {`],
      [null, `      ${k('const')} ch = s.charCodeAt(j);`],
      ['grow', `      ${k('if')} (have[ch] &lt; need[ch]) missing--;`],
      ['grow', `      have[ch]++;`],
      ['found', `      ${k('if')} (missing === 0) {`],
      ['found', `        ${k('if')} (!best || j - i + 1 &lt; best.length) best = s.slice(i, j + 1);`],
      [null, `        break;`],
      [null, `      }`],
      [null, `    }`],
      [null, `  }`],
      ['ret', `  ${k('return')} best;`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} minWindow(s string, t string) string {`],
      [null, `    ${k('var')} need [128]int`],
      [null, `    ${k('for')} i := 0; i &lt; len(t); i++ {`],
      ['init', `        need[t[i]]++`],
      [null, `    }`],
      ['init', `    best := ""`],
      [null, `    ${k('for')} i := 0; i &lt; len(s); i++ {`],
      ['start', `        ${k('var')} have [128]int`],
      ['start', `        missing := len(t)`],
      [null, `        ${k('for')} j := i; j &lt; len(s); j++ {`],
      ['grow', `            ${k('if')} have[s[j]] &lt; need[s[j]] {`],
      ['grow', `                missing--`],
      [null, `            }`],
      ['grow', `            have[s[j]]++`],
      ['found', `            ${k('if')} missing == 0 {`],
      ['found', `                ${k('if')} best == "" || j-i+1 &lt; len(best) {`],
      ['found', `                    best = s[i : j+1]`],
      [null, `                }`],
      [null, `                break`],
      [null, `            }`],
      [null, `        }`],
      [null, `    }`],
      ['ret', `    ${k('return')} best`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} min_window(s: String, t: String) -&gt; String {`],
      [null, `        ${k('let')} s = s.as_bytes();`],
      [null, `        ${k('let')} ${k('mut')} need = [0usize; 128];`],
      [null, `        ${k('for')} &amp;b ${k('in')} t.as_bytes() {`],
      ['init', `            need[b as usize] += 1;`],
      [null, `        }`],
      ['init', `        ${k('let')} ${k('mut')} best: &amp;[u8] = &amp;[];`],
      [null, `        ${k('for')} i ${k('in')} 0..s.len() {`],
      ['start', `            ${k('let')} ${k('mut')} have = [0usize; 128];`],
      ['start', `            ${k('let')} ${k('mut')} missing = t.len();`],
      [null, `            ${k('for')} j ${k('in')} i..s.len() {`],
      [null, `                ${k('let')} ch = s[j] as usize;`],
      ['grow', `                ${k('if')} have[ch] &lt; need[ch] {`],
      ['grow', `                    missing -= 1;`],
      [null, `                }`],
      ['grow', `                have[ch] += 1;`],
      ['found', `                ${k('if')} missing == 0 {`],
      ['found', `                    ${k('if')} best.is_empty() || j - i + 1 &lt; best.len() {`],
      ['found', `                        best = &amp;s[i..=j];`],
      [null, `                    }`],
      [null, `                    break;`],
      [null, `                }`],
      [null, `            }`],
      [null, `        }`],
      ['ret', `        String::from_utf8(best.to_vec()).unwrap()`],
      [null, `    }`],
      [null, `}`],
    ],
  },
  window: {
    ruby: [
      [null, `${k('def')} min_window(s, t)`],
      [null, `  need = Hash.new(0) ${c('# below zero: the window has spares')}`],
      ['init', `  t.each_char { |ch| need[ch] += 1 }`],
      ['init', `  missing = t.length`],
      [null, `  lo = best_lo = 0`],
      [null, `  best_len = s.length + 1`],
      [null, `  s.each_char.with_index ${k('do')} |ch, hi|`],
      ['grow', `    missing -= 1 ${k('if')} need[ch] &gt; 0`],
      ['grow', `    need[ch] -= 1`],
      ['shrink', `    ${k('while')} missing.zero?`],
      ['best', `      ${k('if')} hi - lo + 1 &lt; best_len`],
      ['best', `        best_lo, best_len = lo, hi - lo + 1`],
      [null, `      ${k('end')}`],
      ['shrink', `      need[s[lo]] += 1`],
      ['shrink', `      missing += 1 ${k('if')} need[s[lo]] &gt; 0`],
      ['shrink', `      lo += 1`],
      [null, `    ${k('end')}`],
      [null, `  ${k('end')}`],
      ['ret', `  best_len &lt;= s.length ? s[best_lo, best_len] : ''`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('from')} collections ${k('import')} Counter`],
      [null, ``],
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} minWindow(self, s, t):`],
      ['init', `        need = Counter(t)                 ${c('# below zero: the window has spares')}`],
      ['init', `        missing = len(t)`],
      [null, `        lo, best_lo, best_len = 0, 0, len(s) + 1`],
      [null, `        ${k('for')} hi, ch ${k('in')} enumerate(s):`],
      ['grow', `            ${k('if')} need[ch] &gt; 0:`],
      ['grow', `                missing -= 1`],
      ['grow', `            need[ch] -= 1`],
      ['shrink', `            ${k('while')} missing == 0:`],
      ['best', `                ${k('if')} hi - lo + 1 &lt; best_len:`],
      ['best', `                    best_lo, best_len = lo, hi - lo + 1`],
      ['shrink', `                need[s[lo]] += 1`],
      ['shrink', `                ${k('if')} need[s[lo]] &gt; 0:`],
      ['shrink', `                    missing += 1`],
      ['shrink', `                lo += 1`],
      ['ret', `        ${k('return')} s[best_lo:best_lo + best_len] ${k('if')} best_len &lt;= len(s) ${k('else')} ''`],
    ],
    javascript: [
      [null, `${k('const')} minWindow = ${k('function')} (s, t) {`],
      [null, `  ${k('const')} need = ${k('new')} Array(128).fill(0); ${c('// below zero: the window has spares')}`],
      ['init', `  ${k('for')} (${k('const')} ch ${k('of')} t) need[ch.charCodeAt(0)]++;`],
      ['init', `  ${k('let')} missing = t.length;`],
      [null, `  ${k('let')} lo = 0, bestLo = 0, bestLen = s.length + 1;`],
      [null, `  ${k('for')} (${k('let')} hi = 0; hi &lt; s.length; hi++) {`],
      [null, `    ${k('const')} ch = s.charCodeAt(hi);`],
      ['grow', `    ${k('if')} (need[ch] &gt; 0) missing--;`],
      ['grow', `    need[ch]--;`],
      ['shrink', `    ${k('while')} (missing === 0) {`],
      ['best', `      ${k('if')} (hi - lo + 1 &lt; bestLen) {`],
      ['best', `        bestLo = lo;`],
      ['best', `        bestLen = hi - lo + 1;`],
      [null, `      }`],
      ['shrink', `      ${k('const')} out = s.charCodeAt(lo);`],
      ['shrink', `      need[out]++;`],
      ['shrink', `      ${k('if')} (need[out] &gt; 0) missing++;`],
      ['shrink', `      lo++;`],
      [null, `    }`],
      [null, `  }`],
      ['ret', `  ${k('return')} bestLen &lt;= s.length ? s.slice(bestLo, bestLo + bestLen) : '';`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} minWindow(s string, t string) string {`],
      [null, `    ${k('var')} need [128]int ${c('// below zero: the window has spares')}`],
      [null, `    ${k('for')} i := 0; i &lt; len(t); i++ {`],
      ['init', `        need[t[i]]++`],
      [null, `    }`],
      ['init', `    missing := len(t)`],
      [null, `    lo, bestLo, bestLen := 0, 0, len(s)+1`],
      [null, `    ${k('for')} hi := 0; hi &lt; len(s); hi++ {`],
      ['grow', `        ${k('if')} need[s[hi]] &gt; 0 {`],
      ['grow', `            missing--`],
      [null, `        }`],
      ['grow', `        need[s[hi]]--`],
      ['shrink', `        ${k('for')} missing == 0 {`],
      ['best', `            ${k('if')} hi-lo+1 &lt; bestLen {`],
      ['best', `                bestLo, bestLen = lo, hi-lo+1`],
      [null, `            }`],
      ['shrink', `            need[s[lo]]++`],
      ['shrink', `            ${k('if')} need[s[lo]] &gt; 0 {`],
      ['shrink', `                missing++`],
      [null, `            }`],
      ['shrink', `            lo++`],
      [null, `        }`],
      [null, `    }`],
      ['ret', `    ${k('if')} bestLen &gt; len(s) {`],
      ['ret', `        ${k('return')} ""`],
      [null, `    }`],
      ['ret', `    ${k('return')} s[bestLo : bestLo+bestLen]`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} min_window(s: String, t: String) -&gt; String {`],
      [null, `        ${k('let')} s = s.as_bytes();`],
      [null, `        ${k('let')} ${k('mut')} need = [0i32; 128]; ${c('// below zero: the window has spares')}`],
      [null, `        ${k('for')} &amp;b ${k('in')} t.as_bytes() {`],
      ['init', `            need[b as usize] += 1;`],
      [null, `        }`],
      ['init', `        ${k('let')} ${k('mut')} missing = t.len();`],
      [null, `        ${k('let')} (${k('mut')} lo, ${k('mut')} best_lo, ${k('mut')} best_len) = (0, 0, s.len() + 1);`],
      [null, `        ${k('for')} hi ${k('in')} 0..s.len() {`],
      [null, `            ${k('let')} ch = s[hi] as usize;`],
      ['grow', `            ${k('if')} need[ch] &gt; 0 {`],
      ['grow', `                missing -= 1;`],
      [null, `            }`],
      ['grow', `            need[ch] -= 1;`],
      ['shrink', `            ${k('while')} missing == 0 {`],
      ['best', `                ${k('if')} hi - lo + 1 &lt; best_len {`],
      ['best', `                    best_lo = lo;`],
      ['best', `                    best_len = hi - lo + 1;`],
      [null, `                }`],
      ['shrink', `                ${k('let')} out = s[lo] as usize;`],
      ['shrink', `                need[out] += 1;`],
      ['shrink', `                ${k('if')} need[out] &gt; 0 {`],
      ['shrink', `                    missing += 1;`],
      [null, `                }`],
      ['shrink', `                lo += 1;`],
      [null, `            }`],
      [null, `        }`],
      ['ret', `        ${k('if')} best_len &gt; s.len() {`],
      ['ret', `            ${k('return')} String::new();`],
      [null, `        }`],
      ['ret', `        String::from_utf8(s[best_lo..best_lo + best_len].to_vec()).unwrap()`],
      [null, `    }`],
      [null, `}`],
    ],
  },
};

/* ---------------- part 1: the "does it cover t" widget ----------------
 *
 * Drag both ends of a window over s and see, letter by letter, whether it
 * holds everything t asks for — duplicates included, upper and lower case
 * apart. The shortest window that covers is the answer. */

const QW_SETS = [
  { label: exampleTitle(1), s: 'ADOBECODEBANC', t: 'ABC', lo: 0, hi: 5 },
  { label: t('duplicates count', 'ထပ်နေသည်ကို ရေ'), s: 'AXBXAXC', t: 'AAC', lo: 0, hi: 4 },
  { label: t('case matters', 'အကြီး/အသေး ကွဲ'), s: 'aAbBa', t: 'Ab', lo: 0, hi: 2 },
];

function mountCoverWidget(host) {
  const state = { set: 0, lo: 0, hi: 5 };
  host.innerHTML = `
    <div class="q-arr" data-arr></div>
    <div class="q-slider"><label for="mws-lo" data-l1></label><input id="mws-lo" type="range" min="0" data-lo><output data-o1></output></div>
    <div class="q-slider"><label for="mws-hi" data-l2></label><input id="mws-hi" type="range" min="0" data-hi><output data-o2></output>
      <span class="q-presets" data-presets></span></div>
    <p class="q-tie" data-line></p>
    <div class="ledger">
      <span class="expr" data-expr></span>
      <span class="total" data-total></span>
    </div>`;
  const qq = (sel) => host.querySelector(sel);

  function render() {
    const { s, t: tt } = QW_SETS[state.set];
    if (state.hi < state.lo) state.hi = state.lo;
    const win = s.slice(state.lo, state.hi + 1);
    const need = {}; for (const ch of tt) need[ch] = (need[ch] || 0) + 1;
    const have = {}; for (const ch of win) have[ch] = (have[ch] || 0) + 1;
    const short = Object.entries(need).filter(([ch, n]) => (have[ch] || 0) < n).map(([ch, n]) => `${n - (have[ch] || 0)} × '${ch}'`);
    qq('[data-l1]').textContent = pick(t('start', 'အစ'));
    qq('[data-l2]').textContent = pick(t('end', 'အဆုံး'));
    for (const [sel, v] of [['[data-lo]', state.lo], ['[data-hi]', state.hi]]) { const el = qq(sel); el.max = String(s.length - 1); el.value = String(v); }
    qq('[data-o1]').textContent = String(state.lo);
    qq('[data-o2]').textContent = String(state.hi);
    qq('[data-arr]').innerHTML = [...s].map((ch, x) => {
      const inside = x >= state.lo && x <= state.hi;
      return `<div class="cell ${inside ? (need[ch] ? 'kept picked' : 'kept') : 'cut'}"><span>${ch}</span><span class="idx">${x}</span></div>`;
    }).join('');
    qq('[data-presets]').innerHTML = presetChips(QW_SETS, state.set);
    widgetLabel(pick(t(`t = "${tt}"`, `t = "${tt}"`)));
    qq('[data-line]').innerHTML = pick(short.length
      ? t(`"${win}" is still missing ${short.join(' and ')}. t's letters count with their duplicates, and 'a' is not 'A'.`,
          `"${win}" တွင် ${short.join(' နှင့် ')} လိုနေသေးသည်။ t ၏ စာလုံးများကို ထပ်နေသည်အတိုင်း ရေတွက်ပြီး 'a' သည် 'A' မဟုတ်ပါ။`)
      : t(`"${win}" covers t = "${tt}". Can you make it shorter and still cover it?`, `"${win}" သည် t = "${tt}" ကို ဖုံးသည်။ ဖုံးဆဲဖြင့် ပိုတိုအောင် လုပ်နိုင်သလား။`));
    qq('[data-expr]').innerHTML = Object.keys(need).map((ch) => `'${ch}' ${have[ch] || 0}/${need[ch]}`).join(' &nbsp;·&nbsp; ');
    qq('[data-total]').innerHTML = short.length ? `—<small>${pick(t('not covered', 'မဖုံး'))}</small>` : `${win.length}<small>${pick(t('letters, covers', 'စာလုံး၊ ဖုံး'))}</small>`;
  }
  qq('[data-lo]').addEventListener('input', (ev) => { state.lo = Number(ev.target.value); if (state.hi < state.lo) state.hi = state.lo; render(); });
  qq('[data-hi]').addEventListener('input', (ev) => { state.hi = Number(ev.target.value); if (state.lo > state.hi) state.lo = state.hi; render(); });
  host.addEventListener('click', (ev) => {
    const chip = ev.target.closest('[data-set]');
    if (chip) { state.set = Number(chip.dataset.set); state.lo = QW_SETS[state.set].lo; state.hi = QW_SETS[state.set].hi; render(); }
  });
  onLangChange(render);
  render();
}

/* ---------------- the approach, in brief ---------------- */

const APPROACH = {
  brute: {
    idea: t('From every start, grow a window one letter at a time until it covers t, and keep the shortest such window.', 'အစတိုင်းမှ window ကို t ကို ဖုံးသည်အထိ စာလုံးတစ်လုံးစီ ကြီးထွားစေပြီး အတိုဆုံးကို ထိန်းသည်။'),
    steps: [
      t('Count <code>need</code> from t.', 't မှ <code>need</code> ကို ရေတွက်သည်။'),
      t('For each start <code>i</code>: an empty <code>have</code>, <code>missing = len(t)</code>.', 'အစ <code>i</code> တစ်ခုစီအတွက် — <code>have</code> ဗလာ၊ <code>missing = len(t)</code>။'),
      t('Add <code>s[j]</code>; if it was still needed, <code>missing</code> drops. At zero, compare with <code>best</code> and stop.', '<code>s[j]</code> ထည့် — လိုနေသေးလျှင် <code>missing</code> ကျသည်။ သုညရောက်လျှင် <code>best</code> နှင့် နှိုင်းယှဉ်ပြီး ရပ်သည်။'),
    ],
    cost: t('Up to m windows of up to m letters: O(m²). On 10⁴ letters that took the Python listing 4.05 s here; the constraint allows 10⁵.',
            'စာလုံး m လုံးအထိ window m ခုအထိ — O(m²)။ စာလုံး 10⁴ တွင် ဤနေရာ၌ Python listing ကို 4.05 s ကြာစေသည် — ကန့်သတ်ချက်က 10⁵ ကို ခွင့်ပြုသည်။'),
  },
  window: {
    idea: t('One window for the whole string. Grow it on the right until nothing is missing, then shrink it on the left for as long as nothing goes missing, recording the window each time.',
            'string တစ်ခုလုံးအတွက် window တစ်ခု။ ဘာမှ မလိုတော့သည်အထိ ညာဘက်တွင် ကြီးထွားစေ၊ ပြီးမှ ဘာမှ မလိုလာသမျှ ဘယ်ဘက်တွင် ချုံ့ပြီး အကြိမ်တိုင်း window ကို မှတ်သည်။'),
    steps: [
      t('<code>need</code> = counts of t; <code>missing = len(t)</code>.', '<code>need</code> = t ၏ အရေအတွက်၊ <code>missing = len(t)</code>။'),
      t('Take <code>s[hi]</code>: if <code>need</code> was positive, <code>missing</code> drops; either way <code>need</code> drops.', '<code>s[hi]</code> ယူ — <code>need</code> အပေါင်းဖြစ်ခဲ့လျှင် <code>missing</code> ကျ — မည်သို့ပင်ဖြစ်စေ <code>need</code> ကျ။'),
      t('While <code>missing == 0</code>: record the window, give <code>s[lo]</code> back to <code>need</code>, and if that made it positive, <code>missing</code> rises; <code>lo += 1</code>.',
        '<code>missing == 0</code> ဖြစ်နေသမျှ — window ကို မှတ်၊ <code>s[lo]</code> ကို <code>need</code> သို့ ပြန်ပေး၊ ၎င်းကြောင့် အပေါင်းဖြစ်လာလျှင် <code>missing</code> တက်၊ <code>lo += 1</code>။'),
    ],
    cost: t('hi and lo each move right at most m times, and each move is O(1): O(m + n), the follow-up\'s target.',
            'hi နှင့် lo တစ်ခုစီသည် ညာဘက်သို့ အများဆုံး m ကြိမ် ရွေ့ပြီး ရွေ့ခြင်းတိုင်း O(1) — O(m + n)၊ follow-up ၏ ပန်းတိုင်။'),
  },
};

/* ---------------- mount ---------------- */

mountLesson({
  input: { s: 'ADOBECODEBANC', t: 'ABC' },
  controls: [
    { key: 's', label: 's', parse: letters(MAX_S, 's') },
    { key: 't', label: 't', parse: letters(MAX_T, 't') },
  ],
  presets: [
    { label: exampleTitle(1), input: { s: 'ADOBECODEBANC', t: 'ABC' } },
    { label: exampleTitle(2), input: { s: 'a', t: 'a' } },
    { label: exampleTitle(3), input: { s: 'a', t: 'aa' } },
    { label: t('a letter twice', 'စာလုံး နှစ်ကြိမ်'), input: { s: 'AXBXAXC', t: 'AAC' } },
  ],
  examples: [
    { title: exampleTitle(1), inputHtml: '<code>s = "ADOBECODEBANC", t = "ABC"</code>', output: '"BANC"',
      why: [t('"BANC" holds an A, a B and a C, and no shorter piece of s does.', '"BANC" တွင် A၊ B နှင့် C တစ်လုံးစီ ပါပြီး s ၏ ပိုတိုသော အပိုင်း မရှိပါ။')],
      load: { s: 'ADOBECODEBANC', t: 'ABC' } },
    { title: exampleTitle(2), inputHtml: '<code>s = "a", t = "a"</code>', output: '"a"',
      why: [t('The whole of s is the window.', 's တစ်ခုလုံးသည် window ဖြစ်သည်။')], load: { s: 'a', t: 'a' } },
    { title: exampleTitle(3), inputHtml: '<code>s = "a", t = "aa"</code>', output: '""',
      why: [t('t needs two a\'s and s has one, so nothing covers it.', 't သည် a နှစ်လုံး လိုပြီး s တွင် တစ်လုံးသာ ရှိသဖြင့် ဘာမှ မဖုံးနိုင်။')], load: { s: 'a', t: 'aa' } },
  ],
  modes: [
    { id: 'brute', name: 'Grow from every start',
      desc: t('A fresh window from each start, grown until it covers t.', 'အစတစ်ခုစီမှ window အသစ်၊ t ကို ဖုံးသည်အထိ ကြီးထွား။'),
      cost: 'O(m²) time · O(1) extra', build: buildBrute },
    { id: 'window', name: 'Grow and shrink',
      sub: t('sliding window', 'sliding window'),
      desc: t('One window: grow right until covered, shrink left while covered.', 'window တစ်ခု — ဖုံးသည်အထိ ညာတွင် ကြီး၊ ဖုံးနေသမျှ ဘယ်တွင် ချုံ့။'),
      cost: 'O(m + n) time · O(1) extra', build: buildWindow },
  ],
  languages: LANGUAGES,
  code: CODE,
  hover: { javascript: { out: 'ch' }, rust: { out: 'ch' } },
  solutions: {
    brute: { approach: APPROACH.brute,
      desc: t('Correct and easy to trust, but each start rebuilds the counts from nothing, so it is quadratic in s.', 'မှန်ပြီး ယုံရလွယ်သည်၊ သို့သော် အစတိုင်းက အရေအတွက်ကို အစမှ ပြန်တည်ဆောက်သဖြင့် s ၌ quadratic ဖြစ်သည်။') },
    window: { approach: APPROACH.window,
      desc: t('The O(m + n) answer. One table does double duty: positive entries are owed, negative ones are spares, and <code>missing</code> counts only what is owed.',
              'O(m + n) အဖြေ။ table တစ်ခုက တာဝန်နှစ်ခု ထမ်းသည် — အပေါင်းသည် ပေးရန်ကျန်၊ အနုတ်သည် ပို၊ <code>missing</code> သည် ပေးရန်ကျန်ကိုသာ ရေတွက်သည်။') },
  },
  // How each language was actually checked, printed as the part 3 badges.
  // The corpus: the 3 examples, 7 edges, 15,000 random pairs over two or three
  // letters, 5,000 over ten letters of both cases up to 300 long, and five
  // with 10⁵-letter strings — against an oracle that binary-searches the
  // window's length. The brute force skips the five at 10⁵. Go and Rust ran
  // in Docker (golang:1.23-alpine, rust:1-slim).
  verification: {
    ruby: { brute: 'ran here · 20,010 cases, not the five at m = 10⁵', window: 'ran here · 20,015 cases' },
    python: { brute: 'ran here · 20,010 cases, not the five at m = 10⁵', window: 'ran here · 20,015 cases' },
    javascript: { brute: 'ran here · 20,010 cases, not the five at m = 10⁵', window: 'ran here · 20,015 cases' },
    go: { brute: 'ran here · 20,010 cases, not the five at m = 10⁵ · Go 1.23', window: 'ran here · 20,015 cases · Go 1.23' },
    rust: { brute: 'ran here · 20,010 cases, not the five at m = 10⁵ · rustc 1.98', window: 'ran here · 20,015 cases · rustc 1.98' },
  },
  stripLabel: t('s, the window lit', 's — window ကို လင်းပြ'),
  strip,
  draw,
  answer,
  vars,
  widget: mountCoverWidget,
});
