/* Longest Substring Without Repeating Characters — LeetCode 3.
 *
 * The brute force starts at every index and grows until a character repeats,
 * then throws the whole run away and starts again one index later — even
 * though everything after the repeat's first copy is still repeat-free. The
 * window keeps that part: it remembers where each character was last seen,
 * and on a repeat moves its left edge to just past the earlier copy. Each
 * character enters the window once and the left edge only moves forward.
 */
import { mountLesson } from '../../lib/stepper.js';
import { pick, onLangChange } from '../../lib/i18n.js';
import { cells, kv, readout, slots, stagePanel } from '../../lib/stage.js';
import { t, exampleTitle, LANGUAGES, k, c, stageRow, stageGap, presetChips, widgetLabel } from '../../lib/kit.js';

const MAX_LEN = 12;

function parseS(text) {
  // The field shows the string in quotes; take what is between them, spaces and all.
  const m = text.match(/^\s*"(.*)"\s*$/);
  const s = m ? m[1] : text;
  if (s.length > MAX_LEN) throw new Error(`at most ${MAX_LEN} characters, so the stage stays readable`);
  if ([...s].some((ch) => ch.charCodeAt(0) < 32 || ch.charCodeAt(0) > 126)) throw new Error('letters, digits, symbols and spaces only');
  return s;
}

// A space is a character like any other; draw it so it can be seen.
const vis = (ch) => (ch === ' ' ? '␣' : ch);
const quote = (str) => `"${str}"`;

/* ---------------- step generators ---------------- */

function buildBrute({ s }) {
  const n = s.length;
  const steps = [];
  let best = 0;
  const snap = (extra) => ({ view: 'brute', best, i: null, j: null, seen: [], ...extra });

  steps.push(snap({ line: 'init', tag: t('best = 0', 'best = 0'),
    note: n
      ? t(`<code>best</code> = 0. Try every start, and grow each one until a character repeats.`,
          `<code>best</code> = 0။ အစ တိုင်းကို စမ်းပြီး character တစ်ခု ထပ်သည်အထိ တစ်ခုစီကို ချဲ့သည်။`)
      : t('The string is empty, so there is nothing to start from.', 'string ဗလာ ဖြစ်သဖြင့် စရန် ဘာမျှ မရှိပါ။') }));

  for (let i = 0; i < n; i++) {
    const seen = [];
    steps.push(snap({ i, j: i, seen: [], line: 'start', tag: t(`start ${i}`, `start ${i}`),
      note: t(`Start at <b>i = ${i}</b> with an empty <code>seen</code>.${i > 0 ? ' Everything learned from the last start is thrown away.' : ''}`,
              `<b>i = ${i}</b> မှ <code>seen</code> ဗလာဖြင့် စသည်။${i > 0 ? ' ယခင် start မှ သိခဲ့သမျှ ပစ်လိုက်သည်။' : ''}`) }));
    let j = i;
    while (j < n && !seen.includes(s[j])) {
      seen.push(s[j]);
      steps.push(snap({ i, j, seen: [...seen], line: 'take', tag: t('new', 'အသစ်'),
        note: t(`'${vis(s[j])}' is not in <code>seen</code>: take it. The run is ${quote(s.slice(i, j + 1))}, length ${j - i + 1}.`,
                `'${vis(s[j])}' သည် <code>seen</code> ထဲ မရှိ — ယူသည်။ run သည် ${quote(s.slice(i, j + 1))}၊ အရှည် ${j - i + 1}။`) }));
      j += 1;
    }
    const stop = j < n;
    steps.push(snap({ i, j, seen: [...seen], repeat: stop ? s.indexOf(s[j], i) : null, line: 'test', tag: stop ? t('repeat', 'ထပ်') : t('end', 'အဆုံး'),
      note: stop
        ? t(`'${vis(s[j])}' at index ${j} is already in the run, at index ${s.indexOf(s[j], i)}. Stop.`,
            `index ${j} ရှိ '${vis(s[j])}' သည် run ထဲ index ${s.indexOf(s[j], i)} တွင် ရှိပြီးသား။ ရပ်သည်။`)
        : t('The end of the string. Stop.', 'string ၏ အဆုံး။ ရပ်သည်။') }));
    const was = best;
    best = Math.max(best, j - i);
    steps.push(snap({ i, j, seen: [...seen], improved: best > was, line: 'best', tag: t(`best ${best}`, `best ${best}`),
      note: best > was
        ? t(`${j - i} beats ${was}: <code>best</code> = <b>${best}</b>.`, `${j - i} သည် ${was} ထက် ကြီးသည် — <code>best</code> = <b>${best}</b>။`)
        : t(`${j - i} does not beat ${best}.`, `${j - i} သည် ${best} ထက် မကြီးပါ။`) }));
  }
  steps.push(snap({ line: 'ret', finished: true, tag: t(`return ${best}`, `${best} ပြန်`),
    note: t(`Return <b>${best}</b>.`, `<b>${best}</b> ကို ပြန်ပေးသည်။`) }));
  return steps;
}

function buildWindow({ s }) {
  const n = s.length;
  const steps = [];
  const last = {};
  let best = 0;
  let left = 0;
  const snap = (extra) => ({ view: 'window', best, left, right: null, last: { ...last }, ...extra });

  steps.push(snap({ line: 'init', tag: t('empty map', 'map ဗလာ'),
    note: n
      ? t('<code>last</code> maps each character to the index where it was last seen. The window is <code>s[left..right]</code>, and it never holds a repeat.',
          '<code>last</code> သည် character တစ်ခုစီကို နောက်ဆုံး တွေ့ခဲ့သည့် index နှင့် တွဲထားသည်။ window သည် <code>s[left..right]</code> ဖြစ်ပြီး ထပ်နေသော character ကို ဘယ်တော့မှ မပါစေပါ။')
      : t('The string is empty, so the loop never runs.', 'string ဗလာ ဖြစ်သဖြင့် loop မ run ပါ။') }));

  for (let right = 0; right < n; right++) {
    const ch = s[right];
    steps.push(snap({ right, line: 'read', tag: t(`'${vis(ch)}'`, `'${vis(ch)}'`),
      note: t(`<code>right</code> = ${right}: '${vis(ch)}' comes in.`, `<code>right</code> = ${right} — '${vis(ch)}' ဝင်လာသည်။`) }));
    if (ch in last) {
      const prev = last[ch];
      if (prev >= left) {
        const was = left;
        left = prev + 1;
        steps.push(snap({ right, prev, jumped: [was, left], line: 'jump', tag: t('jump', 'ခုန်'),
          note: t(`'${vis(ch)}' is already in the window, at index ${prev}. Move <code>left</code> from ${was} to <b>${left}</b>, just past it — in one move, not one at a time.`,
                  `'${vis(ch)}' သည် window ထဲ index ${prev} တွင် ရှိပြီးသား။ <code>left</code> ကို ${was} မှ <b>${left}</b> သို့ — ၎င်း၏ နောက်သို့ — တစ်ကြိမ်တည်း ရွှေ့သည်၊ တစ်ခုချင်း မဟုတ်ပါ။`) }));
      } else {
        steps.push(snap({ right, prev, stale: true, line: 'jump', tag: t('stale', 'ဟောင်း'),
          note: t(`'${vis(ch)}' was last seen at index ${prev}, but that is left of <code>left</code> (${left}) — outside the window. Ignore it; moving <code>left</code> back would let a repeat in.`,
                  `'${vis(ch)}' ကို နောက်ဆုံး index ${prev} တွင် တွေ့ခဲ့သော်လည်း ၎င်းသည် <code>left</code> (${left}) ၏ ဘယ်ဘက် — window အပြင်ဘက်။ လျစ်လျူရှုသည် — <code>left</code> ကို နောက်ပြန်ရွှေ့လျှင် ထပ်နေသော character ဝင်လာမည်။`) }));
      }
    }
    last[ch] = right;
    steps.push(snap({ right, stored: ch, line: 'store', tag: t('remember', 'မှတ်'),
      note: t(`Remember '${vis(ch)}' → ${right}.`, `'${vis(ch)}' → ${right} ကို မှတ်သည်။`) }));
    const was = best;
    best = Math.max(best, right - left + 1);
    steps.push(snap({ right, improved: best > was, line: 'best', tag: t(`best ${best}`, `best ${best}`),
      note: t(`The window ${quote(s.slice(left, right + 1))} has length ${right - left + 1}${best > was ? `: <code>best</code> = <b>${best}</b>` : `, not more than ${best}`}.`,
              `window ${quote(s.slice(left, right + 1))} ၏ အရှည် ${right - left + 1}${best > was ? ` — <code>best</code> = <b>${best}</b>` : ` — ${best} ထက် မပို`}။`) }));
  }
  steps.push(snap({ line: 'ret', finished: true, tag: t(`return ${best}`, `${best} ပြန်`),
    note: t(`Return <b>${best}</b>. Each character came in once, and <code>left</code> only ever moved forward.`,
            `<b>${best}</b> ကို ပြန်ပေးသည်။ character တစ်ခုစီ တစ်ကြိမ်သာ ဝင်ခဲ့ပြီး <code>left</code> သည် ရှေ့သို့သာ ရွှေ့ခဲ့သည်။`) }));
  return steps;
}

/* ---------------- drawing ----------------
 *
 * The strip is the string. Green is the run or window being held; red dashed
 * is the repeat that stopped it; faded is what the window has left behind.
 * The stage holds the approach's memory: a set that is rebuilt for every
 * start, or a map from character to last index that is never cleared. */

function strip(s, { s: str }) {
  const chars = [...str].map(vis);
  const tone = {};
  const marks = {};
  if (!chars.length) return '';
  if (s.view === 'brute') {
    if (s.i != null) {
      const end = s.line === 'take' ? s.j + 1 : s.j;
      for (let x = s.i; x < end; x++) tone[x] = 'entering';
      marks[s.i] = 'i';
      if (s.j < chars.length) {
        if (s.line === 'test') tone[s.j] = 'leaving';
        if (s.repeat != null) tone[s.repeat] = 'inwin';
        marks[s.j] = s.j === s.i ? 'i,j' : 'j';
      }
    }
    if (s.finished) chars.forEach((_, x) => { tone[x] = 'done'; });
    return cells(chars, { tone, marks });
  }
  if (s.right != null) {
    for (let x = 0; x < s.left; x++) tone[x] = 'done';
    for (let x = s.left; x <= s.right; x++) tone[x] = 'entering';
    if (s.line === 'read') tone[s.right] = 'inwin';
    if (s.jumped) tone[s.prev] = 'leaving';
    marks[s.left] = 'left';
    marks[s.right] = s.left === s.right ? 'left,right' : 'right';
  }
  if (s.finished) chars.forEach((_, x) => { tone[x] = 'done'; });
  return cells(chars, { tone, marks });
}

function draw(s, { s: str }) {
  if (s.view === 'brute') {
    return stagePanel(pick(t('seen — this start only', 'seen — ဤ start အတွက်သာ')),
      pick(s.i == null ? t('no start yet', 'start မရှိသေး') : t(`start ${s.i}`, `start ${s.i}`)),
      stageRow(s.seen.length ? cells(s.seen.map(vis), { index: false }) : '', pick(t('empty', 'ဗလာ')))
        + stageGap + readout({ i: s.i ?? '—', j: s.j ?? '—', 'j - i': s.i == null ? '—' : s.j - s.i + (s.line === 'take' ? 1 : 0), best: s.best }));
  }
  const rows = Object.fromEntries(Object.entries(s.last).map(([ch, x]) => [vis(ch), x]));
  const tone = {};
  for (const [ch, x] of Object.entries(s.last)) if (x < s.left) tone[vis(ch)] = 'done';
  const at = s.right == null ? null : vis(str[s.right]);
  if (at && s.jumped) tone[at] = 'warn';
  if (at && s.stale) tone[at] = 'done';
  if (at && s.stored) tone[at] = 'up';
  return stagePanel(pick(t('last — character → last index', 'last — character → နောက်ဆုံး index')),
    pick(t('faded rows are left of the window', 'မှိန်နေသော row များသည် window ၏ ဘယ်ဘက်')),
    kv(rows, { at, tone, keyName: 'char', valName: 'last seen' })
      + stageGap + readout({ left: s.left, right: s.right ?? '—', length: s.right == null ? '—' : s.right - s.left + 1, best: s.best }));
}

function answer(s) {
  return {
    html: slots([s.best], { total: 1, just: s.improved || s.finished ? 0 : -1 }),
    note: s.finished ? t('the longest length', 'အရှည်ဆုံး') : t('longest so far', 'ယခုထိ အရှည်ဆုံး'),
  };
}

function vars(s, { s: str }) {
  const q = quote(str);
  if (s.view === 'brute') {
    return [['best', s.best], ['i', s.i ?? '—'], ['j', s.j ?? '—'],
            ['seen', `{${s.seen.map((ch) => `'${vis(ch)}'`).join(', ')}}`], ['s', q]];
  }
  return [['best', s.best], ['left', s.left], ['right', s.right ?? '—'],
          ['ch', s.right == null ? '—' : `'${vis(str[s.right])}'`],
          ['last', `{${Object.entries(s.last).map(([ch, x]) => `'${vis(ch)}': ${x}`).join(', ')}}`], ['s', q]];
}

/* ---------------- the code, one key per line ----------------
 *
 * Generated from the verified solution files, so the listing a reader copies
 * is byte-identical to the one that ran. */

const CODE = {
  brute: {
    ruby: [
      [null, `${k('def')} length_of_longest_substring(s)`],
      ['init', `  best = 0`],
      ['start', `  (0...s.length).each ${k('do')} |i|`],
      [null, `    seen = {}`],
      [null, `    j = i`],
      ['test', `    ${k('while')} j &lt; s.length &amp;&amp; !seen[s[j]]`],
      ['take', `      seen[s[j]] = true`],
      [null, `      j += 1`],
      [null, `    ${k('end')}`],
      ['best', `    best = [best, j - i].max`],
      [null, `  ${k('end')}`],
      ['ret', `  best`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} lengthOfLongestSubstring(self, s):`],
      ['init', `        best = 0`],
      ['start', `        ${k('for')} i ${k('in')} range(len(s)):`],
      [null, `            seen = set()`],
      [null, `            j = i`],
      ['test', `            ${k('while')} j &lt; len(s) and s[j] ${k('not')} ${k('in')} seen:`],
      ['take', `                seen.add(s[j])`],
      [null, `                j += 1`],
      ['best', `            best = max(best, j - i)`],
      ['ret', `        ${k('return')} best`],
    ],
    javascript: [
      [null, `${k('const')} lengthOfLongestSubstring = ${k('function')} (s) {`],
      ['init', `  ${k('let')} best = 0;`],
      ['start', `  ${k('for')} (${k('let')} i = 0; i &lt; s.length; i++) {`],
      [null, `    ${k('const')} seen = ${k('new')} Set();`],
      [null, `    ${k('let')} j = i;`],
      ['test', `    ${k('while')} (j &lt; s.length &amp;&amp; !seen.has(s[j])) {`],
      ['take', `      seen.add(s[j]);`],
      [null, `      j++;`],
      [null, `    }`],
      ['best', `    best = Math.max(best, j - i);`],
      [null, `  }`],
      ['ret', `  ${k('return')} best;`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} lengthOfLongestSubstring(s string) int {`],
      ['init', `    best := 0`],
      ['start', `    ${k('for')} i := 0; i &lt; len(s); i++ {`],
      [null, `        seen := map[byte]bool{}`],
      [null, `        j := i`],
      ['test', `        ${k('for')} j &lt; len(s) &amp;&amp; !seen[s[j]] {`],
      ['take', `            seen[s[j]] = true`],
      [null, `            j++`],
      [null, `        }`],
      ['best', `        ${k('if')} j-i &gt; best {`],
      [null, `            best = j - i`],
      [null, `        }`],
      [null, `    }`],
      ['ret', `    ${k('return')} best`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('use')} std::collections::HashSet;`],
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} length_of_longest_substring(s: String) -&gt; i32 {`],
      [null, `        ${k('let')} b = s.as_bytes();`],
      ['init', `        ${k('let')} ${k('mut')} best = 0;`],
      ['start', `        ${k('for')} i ${k('in')} 0..b.len() {`],
      [null, `            ${k('let')} ${k('mut')} seen = HashSet::new();`],
      [null, `            ${k('let')} ${k('mut')} j = i;`],
      ['test', `            ${k('while')} j &lt; b.len() &amp;&amp; !seen.contains(&amp;b[j]) {`],
      ['take', `                seen.insert(b[j]);`],
      [null, `                j += 1;`],
      [null, `            }`],
      ['best', `            best = best.max(j - i);`],
      [null, `        }`],
      ['ret', `        best as i32`],
      [null, `    }`],
      [null, `}`],
    ],
  },
  window: {
    ruby: [
      [null, `${k('def')} length_of_longest_substring(s)`],
      ['init', `  last = {}`],
      [null, `  best = 0`],
      [null, `  left = 0`],
      ['read', `  s.each_char.with_index ${k('do')} |ch, right|`],
      ['jump', `    left = last[ch] + 1 ${k('if')} last.key?(ch) &amp;&amp; last[ch] &gt;= left`],
      ['store', `    last[ch] = right`],
      ['best', `    best = [best, right - left + 1].max`],
      [null, `  ${k('end')}`],
      ['ret', `  best`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} lengthOfLongestSubstring(self, s):`],
      ['init', `        last = {}`],
      [null, `        best = 0`],
      [null, `        left = 0`],
      ['read', `        ${k('for')} right, ch ${k('in')} enumerate(s):`],
      ['jump', `            ${k('if')} ch ${k('in')} last and last[ch] &gt;= left:`],
      [null, `                left = last[ch] + 1`],
      ['store', `            last[ch] = right`],
      ['best', `            best = max(best, right - left + 1)`],
      ['ret', `        ${k('return')} best`],
    ],
    javascript: [
      [null, `${k('const')} lengthOfLongestSubstring = ${k('function')} (s) {`],
      ['init', `  ${k('const')} last = ${k('new')} Map();`],
      [null, `  ${k('let')} best = 0;`],
      [null, `  ${k('let')} left = 0;`],
      ['read', `  ${k('for')} (${k('let')} right = 0; right &lt; s.length; right++) {`],
      [null, `    ${k('const')} ch = s[right];`],
      ['jump', `    ${k('if')} (last.has(ch) &amp;&amp; last.get(ch) &gt;= left) left = last.get(ch) + 1;`],
      ['store', `    last.set(ch, right);`],
      ['best', `    best = Math.max(best, right - left + 1);`],
      [null, `  }`],
      ['ret', `  ${k('return')} best;`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} lengthOfLongestSubstring(s string) int {`],
      ['init', `    last := map[byte]int{}`],
      [null, `    best, left := 0, 0`],
      ['read', `    ${k('for')} right := 0; right &lt; len(s); right++ {`],
      ['jump', `        ${k('if')} i, ok := last[s[right]]; ok &amp;&amp; i &gt;= left {`],
      [null, `            left = i + 1`],
      [null, `        }`],
      ['store', `        last[s[right]] = right`],
      ['best', `        ${k('if')} right-left+1 &gt; best {`],
      [null, `            best = right - left + 1`],
      [null, `        }`],
      [null, `    }`],
      ['ret', `    ${k('return')} best`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('use')} std::collections::HashMap;`],
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} length_of_longest_substring(s: String) -&gt; i32 {`],
      ['init', `        ${k('let')} ${k('mut')} last = HashMap::new();`],
      [null, `        ${k('let')} (${k('mut')} best, ${k('mut')} left) = (0, 0);`],
      ['read', `        ${k('for')} (right, ch) ${k('in')} s.bytes().enumerate() {`],
      ['jump', `            ${k('if')} ${k('let')} ${k('Some')}(&amp;i) = last.get(&amp;ch) {`],
      [null, `                ${k('if')} i &gt;= left {`],
      [null, `                    left = i + 1;`],
      [null, `                }`],
      [null, `            }`],
      ['store', `            last.insert(ch, right);`],
      ['best', `            best = best.max(right - left + 1);`],
      [null, `        }`],
      ['ret', `        best as i32`],
      [null, `    }`],
      [null, `}`],
    ],
  },
};

/* ---------------- part 1: the "substring, not subsequence" widget ----------------
 *
 * The statement hinges on "substring": the characters must be next to each
 * other. Example 3 says it outright — "pwke" has four different characters
 * but skips the second w, so it is a subsequence. Click a start and an end;
 * the widget reports the run, and whether a character repeats inside it.
 *
 * Built from x-sum's widget vocabulary: clickable .q-arr cells (kept / cut),
 * the amber .q-tie line and the .ledger. */

const QW_SETS = [
  { label: t('example 1', 'ဥပမာ 1'), s: 'abcabcbb', from: 0, to: 2 },
  { label: t('example 2', 'ဥပမာ 2'), s: 'bbbbb', from: 0, to: 1 },
  { label: t('example 3', 'ဥပမာ 3'), s: 'pwwkew', from: 2, to: 4 },
  { label: t('with spaces', 'space ပါ'), s: 'ab ba c', from: 0, to: 3 },
];

function longestIn(str) {
  let best = 0;
  for (let i = 0; i < str.length; i++) {
    const seen = new Set();
    let j = i;
    while (j < str.length && !seen.has(str[j])) seen.add(str[j++]);
    best = Math.max(best, j - i);
  }
  return best;
}

function mountRunWidget(host) {
  const state = { set: 2, from: 2, to: 4, next: 'from' };

  host.innerHTML = `
    <div class="q-arr" data-arr></div>
    <div class="q-slider"><span class="q-presets" data-presets></span></div>
    <p class="q-tie" data-line></p>
    <div class="ledger">
      <span class="expr" data-expr></span>
      <span class="total" data-total></span>
    </div>`;

  const q = (sel) => host.querySelector(sel);

  function render() {
    const str = QW_SETS[state.set].s;
    const from = Math.min(state.from, state.to);
    const to = Math.max(state.from, state.to);
    const run = str.slice(from, to + 1);
    // the first index inside the run whose character already appeared in it
    let dupAt = -1;
    for (let x = from; x <= to && dupAt < 0; x++) if (str.indexOf(str[x], from) < x) dupAt = x;
    const firstAt = dupAt >= 0 ? str.indexOf(str[dupAt], from) : -1;

    q('[data-presets]').innerHTML = presetChips(QW_SETS, state.set);
    q('[data-arr]').innerHTML = [...str].map((ch, x) => {
      const inRun = x >= from && x <= to;
      const cls = x === dupAt || x === firstAt ? 'cut' : inRun ? 'kept' : '';
      const ends = x === from || x === to;
      return `<div class="cell ${cls}${ends ? ' picked' : ''}" role="button" tabindex="0" aria-pressed="${ends}" data-i="${x}"><span>${vis(ch)}</span><span class="idx">${x}</span></div>`;
    }).join('');

    widgetLabel(pick(t(`click the ${state.next === 'from' ? 'start' : 'end'}`, `${state.next === 'from' ? 'အစ' : 'အဆုံး'} ကို နှိပ်ပါ`)));

    q('[data-line]').innerHTML = pick(dupAt >= 0
      ? t(`${quote(run)} repeats '${vis(str[dupAt])}' (indices ${firstAt} and ${dupAt}), so it does not count. A substring cannot skip the second copy — skipping makes a subsequence.`,
          `${quote(run)} တွင် '${vis(str[dupAt])}' ထပ်သည် (index ${firstAt} နှင့် ${dupAt}) — မရေတွက်ပါ။ substring သည် ဒုတိယ copy ကို ကျော်၍ မရ — ကျော်လျှင် subsequence ဖြစ်သွားသည်။`)
      : t(`${quote(run)} is ${run.length} characters in a row, none repeated. The longest in this string is ${longestIn(str)}.`,
          `${quote(run)} သည် ဆက်တိုက် character ${run.length} လုံး၊ တစ်လုံးမျှ မထပ်ပါ။ ဤ string ၏ အရှည်ဆုံးမှာ ${longestIn(str)}။`));

    q('[data-expr]').innerHTML = `s[${from}..${to}] = ${quote([...run].map(vis).join(''))} · ${new Set(run).size} distinct of ${run.length}`;
    q('[data-total]').innerHTML = dupAt >= 0
      ? `✗<small>${pick(t('repeats', 'ထပ်နေ'))}</small>`
      : `${run.length}<small>${pick(t('length', 'အရှည်'))}</small>`;
  }

  function pickCell(x) {
    if (state.next === 'from') { state.from = x; state.to = x; state.next = 'to'; }
    else { state.to = x; state.next = 'from'; }
    render();
  }
  host.addEventListener('click', (ev) => {
    const chip = ev.target.closest('[data-set]');
    if (chip) {
      const set = QW_SETS[Number(chip.dataset.set)];
      Object.assign(state, { set: Number(chip.dataset.set), from: set.from, to: set.to, next: 'from' });
      return render();
    }
    const cell = ev.target.closest('[data-i]');
    if (cell) pickCell(Number(cell.dataset.i));
  });
  host.addEventListener('keydown', (ev) => {
    const cell = ev.target.closest('[data-i]');
    if (cell && (ev.key === 'Enter' || ev.key === ' ')) { ev.preventDefault(); pickCell(Number(cell.dataset.i)); }
  });
  onLangChange(render);
  render();
}

/* ---------------- the approach, in brief ---------------- */

const APPROACH = {
  brute: {
    idea: t('Every repeat-free substring starts somewhere. From each start, take characters until one repeats, and keep the longest run.',
            'ထပ်မနေသော substring တိုင်း တစ်နေရာမှ စသည်။ start တစ်ခုစီမှ character တစ်ခု ထပ်သည်အထိ ယူပြီး အရှည်ဆုံး run ကို ထားသည်။'),
    steps: [
      t('For each start <code>i</code>, begin an empty <code>seen</code> set.', 'start <code>i</code> တစ်ခုစီအတွက် <code>seen</code> set ဗလာ တစ်ခု စသည်။'),
      t('Move <code>j</code> right while <code>s[j]</code> is not in <code>seen</code>, adding each one.',
        '<code>s[j]</code> သည် <code>seen</code> ထဲ မရှိသမျှ <code>j</code> ကို ညာသို့ ရွှေ့ပြီး တစ်ခုစီ ထည့်သည်။'),
      t('The run is <code>j − i</code> long; keep the largest in <code>best</code>.', 'run ၏ အရှည်မှာ <code>j − i</code> — အကြီးဆုံးကို <code>best</code> တွင် ထားသည်။'),
    ],
    cost: t('a run can never be longer than the number of different characters — at most 95 printable ones — so this is about 95 × n checks, not n²; but every start still rescans what the last one saw.',
            'run တစ်ခုသည် ကွဲပြားသော character အရေအတွက် — printable 95 လုံးအထိ — ထက် မရှည်နိုင်သဖြင့် n² မဟုတ်ဘဲ 95 × n ခန့် စစ်ရသည်၊ သို့သော် start တိုင်းက ယခင် start မြင်ခဲ့သမျှကို ပြန်ဖတ်သည်။'),
  },
  window: {
    idea: t('When a character repeats, everything after its first copy is still repeat-free. So keep the window, and move its left edge to just past the first copy — found in one lookup, because you remember where every character was last seen.',
            'character တစ်ခု ထပ်သည့်အခါ ၎င်း၏ ပထမ copy နောက်ရှိ အားလုံးသည် မထပ်သေးပါ။ ထို့ကြောင့် window ကို ဆက်ထားပြီး ဘယ်အစွန်းကို ပထမ copy ၏ နောက်သို့ ရွှေ့သည် — character တိုင်း နောက်ဆုံး ဘယ်မှာ တွေ့ခဲ့သလဲ မှတ်ထားသဖြင့် lookup တစ်ခုဖြင့် ရှာတွေ့သည်။'),
    steps: [
      t('Walk <code>right</code> across the string with a map <code>last</code>: character → last index.',
        'map <code>last</code> (character → နောက်ဆုံး index) ဖြင့် <code>right</code> ကို string တစ်လျှောက် လျှောက်သည်။'),
      t('If <code>last[ch] &gt;= left</code>, the repeat is inside the window: <code>left = last[ch] + 1</code>. An older entry is outside it and is ignored.',
        '<code>last[ch] &gt;= left</code> ဖြစ်လျှင် ထပ်ခြင်းသည် window အတွင်း — <code>left = last[ch] + 1</code>။ ပိုဟောင်းသော entry သည် အပြင်ဘက် ဖြစ်၍ လျစ်လျူရှုသည်။'),
      t('Store <code>last[ch] = right</code>, and keep the largest <code>right − left + 1</code>.',
        '<code>last[ch] = right</code> ကို သိမ်းပြီး အကြီးဆုံး <code>right − left + 1</code> ကို ထားသည်။'),
    ],
    cost: t('each character is read once and <code>left</code> only moves forward, so n steps; the map holds at most 95 characters.',
            'character တစ်ခုစီကို တစ်ကြိမ်သာ ဖတ်ပြီး <code>left</code> သည် ရှေ့သို့သာ ရွှေ့သဖြင့် အဆင့် n ခု — map တွင် character 95 လုံးအထိသာ ရှိသည်။'),
  },
};

/* ---------------- mount ----------------
 *
 * Last in the file on purpose: mountLesson runs the widget immediately, so
 * every const the widget reads must already be initialised. */

mountLesson({
  input: { s: 'abcabcbb' },
  controls: [
    { key: 's', label: 's', parse: parseS, format: quote },
  ],
  presets: [
    { label: exampleTitle(1), input: { s: 'abcabcbb' } },
    { label: exampleTitle(2), input: { s: 'bbbbb' } },
    { label: exampleTitle(3), input: { s: 'pwwkew' } },
    { label: t('A stale entry', 'entry ဟောင်း'), input: { s: 'abba' } },
    { label: t('Spaces', 'space များ'), input: { s: 'a b c a' } },
  ],
  examples: [
    { title: exampleTitle(1), inputHtml: '<code>s = "abcabcbb"</code>', output: '3',
      why: [t('"abc" is the longest run without a repeat. "bca" and "cab" are just as long.', '"abc" သည် မထပ်သော အရှည်ဆုံး run ဖြစ်သည်။ "bca" နှင့် "cab" လည်း အရှည်တူသည်။')],
      load: { s: 'abcabcbb' } },
    { title: exampleTitle(2), inputHtml: '<code>s = "bbbbb"</code>', output: '1',
      why: [t('Any two neighbours are both "b", so the longest run is a single "b".', 'ကပ်လျက် နှစ်လုံးတိုင်း "b" ဖြစ်သဖြင့် အရှည်ဆုံး run သည် "b" တစ်လုံးတည်း။')],
      load: { s: 'bbbbb' } },
    { title: exampleTitle(3), inputHtml: '<code>s = "pwwkew"</code>', output: '3',
      why: [t('"wke" has length 3. "pwke" has four different letters, but it skips the second "w" — a subsequence, not a substring.',
              '"wke" ၏ အရှည် 3။ "pwke" တွင် မတူသော စာလုံး လေးလုံး ပါသော်လည်း ဒုတိယ "w" ကို ကျော်ထားသည် — substring မဟုတ်ဘဲ subsequence ဖြစ်သည်။')],
      load: { s: 'pwwkew' } },
  ],
  modes: [
    { id: 'brute', name: 'Brute force',
      desc: t('Grow from every start until a repeat.', 'start တိုင်းမှ ထပ်သည်အထိ ချဲ့သည်။'),
      cost: 'O(n · k) time · O(k) space', build: buildBrute },
    { id: 'window', name: 'Sliding window',
      sub: t('last-seen map', 'last-seen map'),
      desc: t('Keep the window; jump its left edge past a repeat.', 'window ကို ထား၊ ထပ်လျှင် ဘယ်အစွန်းကို ကျော်ခုန်။'),
      cost: 'O(n) time · O(k) space', build: buildWindow },
  ],
  languages: LANGUAGES,
  code: CODE,
  solutions: {
    brute: { approach: APPROACH.brute,
      desc: t('From every start, grow a set until a character repeats. It passes — a run cannot outgrow the 95 printable characters — but it rescans each stretch up to 95 times.',
              'start တိုင်းမှ character တစ်ခု ထပ်သည်အထိ set ကို ချဲ့သည်။ အောင်သည် — run သည် printable character 95 လုံးထက် မရှည်နိုင်သဖြင့် — သို့သော် အပိုင်းတစ်ခုစီကို 95 ကြိမ်အထိ ပြန်ဖတ်သည်။') },
    window: { approach: APPROACH.window,
      desc: t('The submission worth writing: one pass, a map of last positions, and a left edge that only moves forward. The <code>&gt;= left</code> check is what keeps <code>"abba"</code> right.',
              'ရေးသင့်သည့် submission — တစ်ကြိမ်တည်း ဖြတ်ခြင်း၊ နောက်ဆုံးနေရာ map တစ်ခုနှင့် ရှေ့သို့သာ ရွှေ့သော ဘယ်အစွန်း။ <code>&gt;= left</code> စစ်ခြင်းကြောင့် <code>"abba"</code> မှန်နေသည်။') },
  },
  // How each language was actually checked, printed as the part 3 badges.
  // The corpus: the 3 examples, 7 edges, 15,000 random strings of up to 10
  // characters from "abc", 5,000 of up to 40 from a dozen characters with a
  // space, and five at n = 5 × 10⁴ — against an oracle that shrinks a counted
  // window. Both approaches ran on every case. Go and Rust ran in Docker
  // (golang:1.23-alpine, rust:1-slim).
  verification: {
    ruby: 'ran here · 20,015 cases',
    python: 'ran here · 20,015 cases',
    javascript: 'ran here · 20,015 cases',
    go: 'ran here · 20,015 cases · Go 1.23',
    rust: 'ran here · 20,015 cases · rustc 1.98',
  },
  stripLabel: t('s', 's'),
  strip,
  draw,
  answer,
  vars,
  hover: { rust: { b: 's' } },
  widget: mountRunWidget,
});
