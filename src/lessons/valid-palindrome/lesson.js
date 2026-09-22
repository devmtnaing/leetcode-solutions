/* Valid Palindrome — LeetCode 125.
 *
 * The contrast worth seeing: the clean-first version answers a yes/no question
 * by building two whole strings it then throws away. The two pointers answer the
 * same question by *skipping* the characters the filter would have removed —
 * same O(n) time, but the only state that survives a step is two integers.
 */
import { mountLesson } from '../../lib/stepper.js';
import { strip, panels } from '../../lib/stage.js';

/* ---------------- shared helpers ---------------- */

const isAlnum = (ch) => /[a-z0-9]/i.test(ch);

/* A space in a cell reads as an empty cell, which is the one character this
 * problem most needs the reader to actually see. */
const show = (ch) => (ch === ' ' ? '␣' : ch);

/* Narration is HTML, and `s` comes from a text box the reader controls. */
const e = (t) => String(t).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

const named = (ch) => (ch === ' ' ? 'a space' : `<b>'${e(ch)}'</b>`);

/* ---------------- step generators ---------------- */

/* Every snapshot carries its own copy of `cleaned`. One shared array would leave
 * all thirty frames showing the finished string, which is the one thing this
 * approach is here to make look expensive. */
function buildClean({ s }) {
  const chars = [...s];
  const n = chars.length;
  const steps = [];
  const cleaned = [];

  steps.push({ line: 'init', i: null, cleaned: [],
    note: `An empty buffer to accumulate into. Everything that survives the filter is appended here, so by the end it holds one character per letter or digit in <code>s</code> — that is the <b>O(n)</b> of extra space this approach spends.` });

  for (let i = 0; i < n; i++) {
    const ch = chars[i];

    if (i === 0) {
      steps.push({ line: 'loop', i: 0, cleaned: [], tag: 'pass',
        note: `One left-to-right pass over all ${n} characters, deciding for each one whether it belongs in <b>cleaned</b>.` });
    }

    if (!isAlnum(ch)) {
      steps.push({ line: 'skip', i, cleaned: cleaned.slice(), tag: 'drop',
        note: `<b>s[${i}]</b> is ${named(ch)} — neither a letter nor a digit, so nothing is appended and <b>cleaned</b> stays ${cleaned.length} long.` });
      continue;
    }

    cleaned.push(ch.toLowerCase());
    const pos = cleaned.length - 1;
    steps.push({ line: 'keep', i, cleaned: cleaned.slice(), keepAt: pos, tag: 'keep',
      note: pos === 0
        ? `<b>s[${i}] = '${e(ch)}'</b> is alphanumeric, so it is lowercased to <b>'${e(ch.toLowerCase())}'</b> and appended. Lowercasing here is what lets the comparison at the end be a plain equality.`
        : `<b>s[${i}] = '${e(ch)}'</b> survives, lowercased to <b>'${e(ch.toLowerCase())}'</b> at position ${pos} of <b>cleaned</b>.` });
  }

  const reversed = cleaned.slice().reverse();
  const len = cleaned.length;

  steps.push({ line: 'rev', i: null, cleaned: cleaned.slice(), reversed: reversed.slice(), tag: 'copy',
    note: len === 0
      ? `Nothing survived the filter, so <b>reversed</b> is empty too. Two empty strings now exist where two integers would have done.`
      : `<b>reversed</b> is a second copy of the same ${len} characters in the opposite order. Two full strings are now in memory to settle a question whose answer is one bit.` });

  let diff = -1;
  for (let k = 0; k < len; k++) {
    if (cleaned[k] !== reversed[k]) { diff = k; break; }
  }

  steps.push({ line: 'cmp', i: null, cleaned: cleaned.slice(), reversed: reversed.slice(), diff,
    verdict: diff === -1, done: true, tag: diff === -1 ? 'true' : 'false',
    note: diff === -1
      ? (len === 0
        ? `An empty string reads the same in either direction, so the answer is <b>true</b>.`
        : `Every position agrees, so the answer is <b>true</b>. Cost: ${n} characters read and ${2 * len} characters of scratch allocated.`)
      : `Position ${diff} differs — <b>'${e(cleaned[diff])}'</b> against <b>'${e(reversed[diff])}'</b> — so the answer is <b>false</b>. Both copies were built in full before a single comparison happened.` });

  return steps;
}

/* The two-pointer pass mirrors the submitted code exactly, including the
 * redundant self-comparison when skipping lands both pointers on the same
 * character. A walkthrough that quietly tidies that up stops being a
 * walkthrough of the code on the right. */
function buildTwoPointer({ s }) {
  const chars = [...s];
  const n = chars.length;
  const steps = [];
  const cleared = [];
  const skipped = [];
  let left = 0;
  let right = n - 1;
  let compares = 0;
  let skipsL = 0;
  let skipsR = 0;
  const anyAlnum = chars.some(isAlnum);

  const snap = (extra) => ({ left, right, cleared: cleared.slice(), skipped: skipped.slice(), ...extra });

  steps.push(snap({ line: 'init',
    note: n === 0
      ? `<b>left</b> at 0 and <b>right</b> at -1: the string is empty, so the pointers have already crossed.`
      : `<b>left</b> at 0, <b>right</b> at ${n - 1}. No buffer and no copy — every answer this approach gives comes out of the original ${n} characters.` }));

  steps.push(snap({ line: 'loop', tag: 'loop',
    note: `The loop runs while <b>left</b> is still short of <b>right</b>. Each turn either steps over a character that cannot matter or settles one pair.` }));

  while (left < right) {
    while (left < right && !isAlnum(chars[left])) {
      const from = left;
      skipped.push(from);
      left += 1;
      skipsL += 1;
      steps.push(snap({ line: 'skipl', tag: 'skip', skipAt: from,
        note: skipsL === 1
          ? `<b>s[${from}]</b> is ${named(chars[from])}. The filter would have declined to copy it; here <b>left</b> just moves to ${left} and the character is behind us. Nothing was written anywhere.`
          : `<b>s[${from}]</b> is ${named(chars[from])}. <b>left</b> moves to ${left}.` }));
    }

    while (left < right && !isAlnum(chars[right])) {
      const from = right;
      skipped.push(from);
      right -= 1;
      skipsR += 1;
      steps.push(snap({ line: 'skipr', tag: 'skip', skipAt: from,
        note: skipsR === 1
          ? `<b>s[${from}]</b> is ${named(chars[from])}, so <b>right</b> retreats to ${right}. The second skip loop is the first one pointed the other way.`
          : `<b>s[${from}]</b> is ${named(chars[from])}, so <b>right</b> retreats to ${right}.` }));
    }

    const a = chars[left];
    const b = chars[right];
    const la = a.toLowerCase();
    const lb = b.toLowerCase();
    const match = la === lb;
    compares += 1;

    steps.push(snap({ line: 'check', tag: 'compare', cmpL: left, cmpR: right, match,
      note: left === right
        ? `Skipping has left <b>left</b> and <b>right</b> on the same character, index ${left}. The code still runs the comparison, and it is trivially true.`
        : match
          ? `<b>s[${left}] = '${e(a)}'</b> against <b>s[${right}] = '${e(b)}'</b>. Lowercased both read <b>'${e(la)}'</b>, so this pair holds.`
          : `<b>s[${left}] = '${e(a)}'</b> against <b>s[${right}] = '${e(b)}'</b>. Lowercased that is <b>'${e(la)}'</b> against <b>'${e(lb)}'</b>.` }));

    if (!match) {
      steps.push(snap({ line: 'no', tag: 'false', cmpL: left, cmpR: right, match: false,
        verdict: false, done: true,
        note: `The pair disagrees, so no amount of further reading can make <code>s</code> a palindrome. Return <b>false</b> after ${compares} comparison${compares === 1 ? '' : 's'}, with the ${right - left - 1} character${right - left - 1 === 1 ? '' : 's'} between the pointers never looked at.` }));
      return steps;
    }

    const selfPair = left === right;
    cleared.push(left);
    if (!selfPair) cleared.push(right);
    left += 1;
    right -= 1;

    steps.push(snap({ line: 'step', tag: 'cleared',
      note: selfPair
        ? `<b>left</b> moves to ${left} and <b>right</b> to ${right}, which crosses them and ends the loop.`
        : compares === 1
          ? `Pair settled, so both pointers step inward: <b>left</b> to ${left}, <b>right</b> to ${right}. The two characters fade out because nothing will read them again.`
          : `Pair settled. <b>left</b> to ${left}, <b>right</b> to ${right}.` }));
  }

  steps.push(snap({ line: 'loop', tag: 'met',
    note: n === 0
      ? `The loop condition was false from the start — there was never a pair to check.`
      : left === right
        ? `<b>left</b> and <b>right</b> have landed on index ${left} together. An odd-length palindrome has exactly one unpaired character in the middle, and a character is always its own mirror, so there is nothing left to do.`
        : !anyAlnum
          ? `<b>left</b> has passed <b>right</b>. Not one character was alphanumeric, so there was never anything to compare — and a string with nothing in it reads the same in both directions.`
          : `<b>left</b> has passed <b>right</b>: every character that mattered has been paired off.` }));

  const skips = skipped.length;
  steps.push(snap({ line: 'yes', tag: 'true', verdict: true, done: true,
    note: `Return <b>true</b>. ${compares} comparison${compares === 1 ? '' : 's'} and ${skips} skip${skips === 1 ? '' : 's'} over ${n} characters — and the only state that ever outlived a step was <b>left</b> and <b>right</b>, which is what makes this <b>O(1)</b> space.` }));

  return steps;
}

/* ---------------- drawing ---------------- */

function draw(st, input) {
  const chars = [...input.s].map(show);

  /* clean mode: the original on top, the buffer it is filling underneath, and
   * the reversed copy only once it actually exists. */
  if (st.cleaned !== undefined) {
    // Cells behind the cursor say what happened to them — faded if they were
    // copied into `cleaned`, amber if they were dropped. The cell under the
    // cursor is left to the `at` highlight so the two never fight.
    const orig = [...input.s];
    const tone = {};
    const settled = st.reversed ? orig.length : (st.i ?? 0);
    for (let i = 0; i < settled; i++) tone[i] = isAlnum(orig[i]) ? 'done' : 'warn';

    const cleanTone = {};
    if (st.keepAt != null) cleanTone[st.keepAt] = 'up';

    const revTone = {};
    if (st.diff != null && st.diff >= 0) {
      cleanTone[st.diff] = 'down';
      revTone[st.diff] = 'down';
    } else if (st.diff === -1) {
      for (let k = 0; k < st.cleaned.length; k++) { cleanTone[k] = 'up'; revTone[k] = 'up'; }
    }

    return panels(
      strip(chars, { at: st.i ?? null, tone, label: 's' }),
      strip(st.cleaned.map(show), { tone: cleanTone, label: 'cleaned' }),
      st.reversed ? strip(st.reversed.map(show), { tone: revTone, label: 'reversed' }) : '',
    );
  }

  /* two-pointer mode: one strip, and the whole story told in its decorations. */
  const marks = {};
  const tone = {};

  for (const i of st.cleared) tone[i] = 'done';
  for (const i of st.skipped) tone[i] = 'warn';

  if (st.cmpL != null) {
    tone[st.cmpL] = st.match ? 'up' : 'down';
    tone[st.cmpR] = st.match ? 'up' : 'down';
  }

  const inRange = (i) => i >= 0 && i < chars.length;
  if (st.left === st.right && inRange(st.left)) marks[st.left] = 'left right';
  else {
    if (inRange(st.left)) marks[st.left] = 'left';
    if (inRange(st.right)) marks[st.right] = 'right';
  }

  return strip(chars, { at: st.skipAt ?? null, marks, tone, label: 's' });
}

function vars(st, input) {
  const chars = [...input.s];
  const verdict = st.verdict === undefined ? '—' : String(st.verdict);

  if (st.cleaned !== undefined) {
    return [
      ['i', st.i ?? '—'],
      ['char', st.i != null && chars[st.i] != null ? show(chars[st.i]) : '—'],
      ['cleaned.length', st.cleaned.length],
      ['extra space', (() => {
        const held = st.cleaned.length + (st.reversed ? st.reversed.length : 0);
        return `${held} char${held === 1 ? '' : 's'}`;
      })()],
      ['answer', verdict],
    ];
  }

  const cell = (i) => (i >= 0 && i < chars.length ? show(chars[i]) : '—');
  return [
    ['left', st.left],
    ['right', st.right],
    ['s[left]', cell(st.left)],
    ['s[right]', cell(st.right)],
    ['extra space', '2 ints'],
    ['answer', verdict],
  ];
}

/* ---------------- the code, one key per line ---------------- */

const c = (t) => `<span class="c">${t}</span>`;
const k = (t) => `<span class="k">${t}</span>`;

const CODE = {
  clean: {
    ruby: [
      [null, `${k('def')} is_palindrome(s)`],
      ['init', `  cleaned = ''`],
      ['loop', `  s.each_char ${k('do')} |ch|`],
      ['skip', `    ${k('next')} ${k('unless')} ch =~ /[a-zA-Z0-9]/`],
      ['keep', `    cleaned &lt;&lt; ch.downcase`],
      [null, `  ${k('end')}`],
      ['rev', `  reversed = cleaned.reverse     ${c('# a second full copy')}`],
      ['cmp', `  cleaned == reversed`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} isPalindrome(self, s: str) -&gt; bool:`],
      ['init', `        cleaned = ''`],
      ['loop', `        ${k('for')} ch ${k('in')} s:`],
      ['skip', `            ${k('if')} ${k('not')} ch.isalnum():`],
      [null, `                ${k('continue')}`],
      ['keep', `            cleaned += ch.lower()`],
      ['rev', `        reversed_ = cleaned[::-1]   ${c('# a second full copy')}`],
      ['cmp', `        ${k('return')} cleaned == reversed_`],
    ],
    javascript: [
      [null, `${k('var')} isPalindrome = ${k('function')} (s) {`],
      ['init', `  ${k('let')} cleaned = '';`],
      ['loop', `  ${k('for')} (${k('const')} ch ${k('of')} s) {`],
      ['skip', `    ${k('if')} (!/[a-z0-9]/i.test(ch)) ${k('continue')};`],
      ['keep', `    cleaned += ch.toLowerCase();`],
      [null, `  }`],
      ['rev', `  ${k('const')} reversed = [...cleaned].reverse().join(''); ${c('// a second full copy')}`],
      ['cmp', `  ${k('return')} cleaned === reversed;`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} isPalindrome(s ${k('string')}) ${k('bool')} {`],
      ['init', `    cleaned := []${k('byte')}{}`],
      ['loop', `    ${k('for')} i := 0; i &lt; ${k('len')}(s); i++ {`],
      [null, `        c := s[i]`],
      ['skip', `        ${k('if')} !('a' &lt;= c &amp;&amp; c &lt;= 'z' || 'A' &lt;= c &amp;&amp; c &lt;= 'Z' || '0' &lt;= c &amp;&amp; c &lt;= '9') {`],
      [null, `            ${k('continue')}`],
      [null, `        }`],
      [null, `        ${k('if')} 'A' &lt;= c &amp;&amp; c &lt;= 'Z' {`],
      [null, `            c += 32`],
      [null, `        }`],
      ['keep', `        cleaned = ${k('append')}(cleaned, c)`],
      [null, `    }`],
      ['rev', `    reversed := ${k('make')}([]${k('byte')}, ${k('len')}(cleaned)) ${c('// a second full copy')}`],
      [null, `    ${k('for')} i := ${k('range')} cleaned {`],
      [null, `        reversed[i] = cleaned[${k('len')}(cleaned)-1-i]`],
      [null, `    }`],
      ['cmp', `    ${k('return')} ${k('string')}(cleaned) == ${k('string')}(reversed)`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} is_palindrome(s: String) -&gt; bool {`],
      ['init', `        ${k('let')} ${k('mut')} cleaned: Vec&lt;char&gt; = Vec::new();`],
      ['loop', `        ${k('for')} ch ${k('in')} s.chars() {`],
      ['skip', `            ${k('if')} !ch.is_ascii_alphanumeric() {`],
      [null, `                ${k('continue')};`],
      [null, `            }`],
      ['keep', `            cleaned.push(ch.to_ascii_lowercase());`],
      [null, `        }`],
      ['rev', `        ${k('let')} reversed: Vec&lt;char&gt; = cleaned.iter().rev().copied().collect();`],
      ['cmp', `        cleaned == reversed`],
      [null, `    }`],
      [null, `}`],
    ],
  },
  twopointer: {
    ruby: [
      [null, `${k('def')} is_palindrome(s)`],
      ['init', `  left, right = 0, s.length - 1`],
      ['loop', `  ${k('while')} left &lt; right`],
      ['skipl', `    left += 1 ${k('while')} left &lt; right &amp;&amp; s[left] !~ /[a-zA-Z0-9]/`],
      ['skipr', `    right -= 1 ${k('while')} left &lt; right &amp;&amp; s[right] !~ /[a-zA-Z0-9]/`],
      ['check', `    ${k('if')} s[left].downcase != s[right].downcase`],
      ['no', `      ${k('return')} ${k('false')}`],
      [null, `    ${k('end')}`],
      ['step', `    left += 1`],
      [null, `    right -= 1`],
      [null, `  ${k('end')}`],
      ['yes', `  ${k('true')}`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} isPalindrome(self, s: str) -&gt; bool:`],
      ['init', `        left, right = 0, len(s) - 1`],
      ['loop', `        ${k('while')} left &lt; right:`],
      ['skipl', `            ${k('while')} left &lt; right ${k('and')} ${k('not')} s[left].isalnum():`],
      [null, `                left += 1`],
      ['skipr', `            ${k('while')} left &lt; right ${k('and')} ${k('not')} s[right].isalnum():`],
      [null, `                right -= 1`],
      ['check', `            ${k('if')} s[left].lower() != s[right].lower():`],
      ['no', `                ${k('return')} ${k('False')}`],
      ['step', `            left += 1`],
      [null, `            right -= 1`],
      ['yes', `        ${k('return')} ${k('True')}`],
    ],
    javascript: [
      [null, `${k('var')} isPalindrome = ${k('function')} (s) {`],
      [null, `  ${k('const')} alnum = (c) =&gt; /[a-z0-9]/i.test(c);`],
      ['init', `  ${k('let')} left = 0, right = s.length - 1;`],
      ['loop', `  ${k('while')} (left &lt; right) {`],
      ['skipl', `    ${k('while')} (left &lt; right &amp;&amp; !alnum(s[left])) left++;`],
      ['skipr', `    ${k('while')} (left &lt; right &amp;&amp; !alnum(s[right])) right--;`],
      ['check', `    ${k('if')} (s[left].toLowerCase() !== s[right].toLowerCase()) {`],
      ['no', `      ${k('return')} ${k('false')};`],
      [null, `    }`],
      ['step', `    left++;`],
      [null, `    right--;`],
      [null, `  }`],
      ['yes', `  ${k('return')} ${k('true')};`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} isPalindrome(s ${k('string')}) ${k('bool')} {`],
      [null, `    alnum := ${k('func')}(c ${k('byte')}) ${k('bool')} {`],
      [null, `        ${k('return')} 'a' &lt;= c &amp;&amp; c &lt;= 'z' || 'A' &lt;= c &amp;&amp; c &lt;= 'Z' || '0' &lt;= c &amp;&amp; c &lt;= '9'`],
      [null, `    }`],
      [null, `    lower := ${k('func')}(c ${k('byte')}) ${k('byte')} {`],
      [null, `        ${k('if')} 'A' &lt;= c &amp;&amp; c &lt;= 'Z' {`],
      [null, `            ${k('return')} c + 32`],
      [null, `        }`],
      [null, `        ${k('return')} c`],
      [null, `    }`],
      ['init', `    left, right := 0, ${k('len')}(s)-1`],
      ['loop', `    ${k('for')} left &lt; right {`],
      ['skipl', `        ${k('for')} left &lt; right &amp;&amp; !alnum(s[left]) {`],
      [null, `            left++`],
      [null, `        }`],
      ['skipr', `        ${k('for')} left &lt; right &amp;&amp; !alnum(s[right]) {`],
      [null, `            right--`],
      [null, `        }`],
      ['check', `        ${k('if')} lower(s[left]) != lower(s[right]) {`],
      ['no', `            ${k('return')} ${k('false')}`],
      [null, `        }`],
      ['step', `        left++`],
      [null, `        right--`],
      [null, `    }`],
      ['yes', `    ${k('return')} ${k('true')}`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} is_palindrome(s: String) -&gt; bool {`],
      [null, `        ${k('let')} b = s.as_bytes();`],
      ['init', `        ${k('let')} (${k('mut')} left, ${k('mut')} right) = (0i64, b.len() ${k('as')} i64 - 1);`],
      ['loop', `        ${k('while')} left &lt; right {`],
      ['skipl', `            ${k('while')} left &lt; right &amp;&amp; !b[left ${k('as')} usize].is_ascii_alphanumeric() {`],
      [null, `                left += 1;`],
      [null, `            }`],
      ['skipr', `            ${k('while')} left &lt; right &amp;&amp; !b[right ${k('as')} usize].is_ascii_alphanumeric() {`],
      [null, `                right -= 1;`],
      [null, `            }`],
      ['check', `            ${k('if')} b[left ${k('as')} usize].to_ascii_lowercase() != b[right ${k('as')} usize].to_ascii_lowercase() {`],
      ['no', `                ${k('return')} ${k('false')};`],
      [null, `            }`],
      ['step', `            left += 1;`],
      [null, `            right -= 1;`],
      [null, `        }`],
      ['yes', `        ${k('true')}`],
      [null, `    }`],
      [null, `}`],
    ],
  },
};

/* ---------------- mount ---------------- */

mountLesson({
  root: document.getElementById('lesson'),
  input: { s: 'A man, a plan, a canal: Panama' },
  controls: [
    { key: 's', label: 's', size: 34, value: 'A man, a plan, a canal: Panama',
      // Capped only so the strip stays readable; the algorithms have no such limit.
      parse: (v) => v.slice(0, 48) },
  ],
  modes: [
    { id: 'clean', name: 'Clean, then reverse', blurb: 'Filter to a new string and compare',
      cost: 'O(n) time · O(n) space', build: buildClean },
    { id: 'twopointer', name: 'Two pointers', blurb: 'Converge from both ends, skipping in place',
      cost: 'O(n) time · O(1) space', build: buildTwoPointer },
  ],
  languages: [
    { id: 'ruby', name: 'Ruby' }, { id: 'python', name: 'Python' },
    { id: 'javascript', name: 'JavaScript' }, { id: 'go', name: 'Go' }, { id: 'rust', name: 'Rust' },
  ],
  code: CODE,
  draw,
  vars,
});
