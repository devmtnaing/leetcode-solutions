/* Valid Anagram — LeetCode 242.
 *
 * The contrast worth seeing: sorting throws away the one thing that actually
 * matters — how many of each letter there are — and then reconstructs it by
 * putting every letter in order, which costs O(n log n). The tally keeps that
 * count directly, so each letter of t only has to ask "does the tally still
 * owe me one of these?", and a lookup answers that.
 */
import { mountLesson } from '../../lib/stepper.js';
import { strip, kv, panels } from '../../lib/stage.js';

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

/* ---------------- step generators ---------------- */

function buildSort({ s, t }) {
  const steps = [];
  const sc = [...s];
  const tc = [...t];
  const snap = (extra) => ({ view: 'sort', a: sc, b: tc, aSorted: false, bSorted: false, ...extra });

  steps.push(snap({ line: 'len', tag: 'length',
    note: `<b>s</b> has ${plural(sc.length, 'letter')}, <b>t</b> has ${plural(tc.length, 'letter')}.` }));

  if (sc.length !== tc.length) {
    steps.push(snap({ line: 'len', verdict: false, tag: 'no',
      note: 'Two strings of different lengths cannot be anagrams, and the check is free. Return <b>false</b>.' }));
    return steps;
  }

  const a = [...sc].sort();
  const b = [...tc].sort();

  steps.push(snap({ line: 'sorts', a, aSorted: true, tag: 'sort',
    note: `Sort a copy of <b>s</b>: <b>${a.join('')}</b>. The original order is gone, which is fine — order was never what the question asked about.` }));
  steps.push(snap({ line: 'sortt', a, b, aSorted: true, bSorted: true, tag: 'sort',
    note: `Sort <b>t</b> the same way: <b>${b.join('')}</b>. Two sorts is where the <b>O(n log n)</b> goes.` }));

  for (let i = 0; i < a.length; i++) {
    const same = a[i] === b[i];
    if (!same) {
      steps.push(snap({ line: 'compare', a, b, aSorted: true, bSorted: true, i, bad: true,
        verdict: false, tag: 'differ',
        note: `Position ${i}: <b>${a[i]}</b> against <b>${b[i]}</b>. The sorted forms part ways here, so return <b>false</b>.` }));
      return steps;
    }
    steps.push(snap({ line: 'compare', a, b, aSorted: true, bSorted: true, i, tag: 'same',
      note: `Position ${i}: both <b>${a[i]}</b>. The equality check does this for every position; it stops at the first pair that differs.` }));
  }

  steps.push(snap({ line: 'compare', a, b, aSorted: true, bSorted: true, verdict: true, tag: 'yes',
    note: `Every position matched, so the sorted forms are the same string. Return <b>true</b>.` }));
  return steps;
}

function buildCount({ s, t }) {
  const steps = [];
  const count = {};
  const snap = (extra) => ({ view: 'count', count: { ...count }, si: null, ti: null,
    sDone: 0, tDone: 0, ...extra });

  steps.push(snap({ line: 'len', tag: 'length',
    note: `<b>s</b> has ${plural(s.length, 'letter')}, <b>t</b> has ${plural(t.length, 'letter')}.` }));

  if (s.length !== t.length) {
    steps.push(snap({ line: 'len', verdict: false, tag: 'no',
      note: 'Different lengths, so no tally can balance. Return <b>false</b> before touching a single letter.' }));
    return steps;
  }

  steps.push(snap({ line: 'init', tag: 'tally',
    note: 'One table, letter to a number. Nothing in it yet, and it never grows past 26 rows.' }));
  steps.push(snap({ line: 'sloop', tag: 'phase',
    note: 'First pass: walk <b>s</b> and add one to the row for each letter. This is the demand t will have to meet.' }));

  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    const before = count[ch] || 0;
    count[ch] = before + 1;
    steps.push(snap({ line: 'up', si: i, sDone: i, key: ch, keyTone: 'warn',
      tag: 's', note: before === 0
        ? `<b>s[${i}]</b> is <b>${ch}</b>, the first one. The row starts at <b>1</b>.`
        : `<b>s[${i}]</b> is another <b>${ch}</b>. Its row goes ${before} → <b>${before + 1}</b>.` }));
  }

  steps.push(snap({ line: 'loop', sDone: s.length, tag: 'phase',
    note: 'Second pass: walk <b>t</b> and subtract. Each letter of t spends one unit of what s put in.' }));

  for (let i = 0; i < t.length; i++) {
    const ch = t[i];
    const before = count[ch] || 0;
    count[ch] = before - 1;
    const now = count[ch];

    steps.push(snap({ line: 'down', ti: i, sDone: s.length, tDone: i, key: ch,
      keyTone: now < 0 ? 'down' : now === 0 ? 'up' : 'warn', bad: now < 0, tag: 't',
      note: now < 0
        ? `<b>t[${i}]</b> is <b>${ch}</b>, but the row is already at 0 — s never supplied this one. Subtracting takes it to <b>-1</b>.`
        : `<b>t[${i}]</b> is <b>${ch}</b>. The row owed ${before}, so spend one: ${before} → <b>${now}</b>.` }));

    if (now < 0) {
      steps.push(snap({ line: 'neg', ti: i, sDone: s.length, tDone: i, key: ch, keyTone: 'down',
        bad: true, verdict: false, tag: 'no',
        note: `A negative row means t has more <b>${ch}</b>s than s does. Nothing later can fix that, so return <b>false</b> now.` }));
      return steps;
    }
  }

  steps.push(snap({ line: 'yes', sDone: s.length, tDone: t.length, verdict: true, tag: 'yes',
    note: 'Every row is back at zero: t spent exactly what s supplied. Return <b>true</b>. Equal lengths are what make "no row went negative" sufficient — with equal totals, no row can be left positive either.' }));
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
  return [['pass', s.ti != null ? 'spending on t' : s.si != null ? 'tallying s' : '—'],
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

/* ---------------- mount ---------------- */

const word = (v) => {
  const x = v.trim().toLowerCase();
  if (!/^[a-z]*$/.test(x)) throw new Error('lowercase letters only');
  return x.slice(0, 12);
};

mountLesson({
  root: document.getElementById('lesson'),
  input: { s: 'anagram', t: 'nagaram' },
  controls: [
    { key: 's', label: 's', size: 14, value: 'anagram', parse: word },
    { key: 't', label: 't', size: 14, value: 'nagaram', parse: word },
  ],
  modes: [
    { id: 'sort', name: 'Sort both', blurb: 'Same letters, same sorted string',
      cost: 'O(n log n) time · O(n) space', build: buildSort },
    { id: 'count', name: 'Count letters', blurb: 'One tally, up on s and down on t',
      cost: 'O(n) time · O(1) space', build: buildCount },
  ],
  languages: [
    { id: 'ruby', name: 'Ruby' }, { id: 'python', name: 'Python' },
    { id: 'javascript', name: 'JavaScript' }, { id: 'go', name: 'Go' }, { id: 'rust', name: 'Rust' },
  ],
  code: CODE,
  draw,
  vars,
});
