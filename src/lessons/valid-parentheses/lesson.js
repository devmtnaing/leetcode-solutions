/* Valid Parentheses — LeetCode 20.
 *
 * The contrast worth seeing: stripping asks "is there a closed pair anywhere in
 * what is left?" and has to rescan the whole string every time it deletes one,
 * because deleting makes two characters adjacent that were not adjacent before.
 * The stack asks each closer one question instead — "what is the most recent
 * opener nobody has closed yet?" — and the top of a stack is exactly that, so
 * the answer is free and one pass is enough.
 */
import { mountLesson } from '../../lib/stepper.js';
import { strip, stack, panels } from '../../lib/stage.js';

const CLOSER_OF = { '(': ')', '[': ']', '{': '}' };
const OPENER_OF = { ')': '(', ']': '[', '}': '{' };

const show = (chars) => (chars.length ? `<b>${chars.join('')}</b>` : 'the empty string');
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

/* ---------------- step generators ---------------- */

function buildStrip({ s }) {
  const steps = [];
  const chars = [...s];
  let cuts = 0;
  // Every snapshot gets its own copy of `chars`. The algorithm deletes from it
  // in place, so sharing one reference would make every frame render the final
  // string instead of the string as it was at that step.
  const snap = (extra) => ({ view: 'strip', chars: [...chars], i: null, cuts, ...extra });

  steps.push(snap({ line: 'init', tag: 'idea',
    note: `A pair standing next to each other — <b>()</b>, <b>[]</b> or <b>{}</b> — is already closed, so cutting it out cannot change the answer. Keep cutting and see whether anything survives.` }));

  for (;;) {
    steps.push(snap({ line: 'pass', tag: 'pass',
      note: cuts === 0
        ? `Scan ${show(chars)} from the left for the first adjacent pair.`
        : chars.length === 0
          ? `Nothing is left. One more pass to confirm there is nothing to delete.`
          : cuts === 1
            ? `A deletion means the scan has to start over at the left end of ${show(chars)}. A pass per deletion is where the <b>O(n²)</b> comes from.`
            : `Start over at the left end of ${show(chars)}.` }));

    let hit = -1;
    for (let i = 0; i < chars.length - 1; i++) {
      if (CLOSER_OF[chars[i]] === chars[i + 1]) { hit = i; break; }
      steps.push(snap({ line: 'match', i, tag: 'no',
        note: `Positions ${i} and ${i + 1} hold <b>${chars[i]}${chars[i + 1]}</b>, which is not a closed pair. Slide right.` }));
    }

    if (hit < 0) {
      steps.push(snap({ line: 'stuck', tag: 'stuck',
        note: chars.length === 0
          ? `Nothing to scan and nothing to delete, so the loop ends here.`
          : chars.length === 1
            ? `One character on its own has no neighbour to pair with. The string has stopped changing.`
            : `A full pass over ${show(chars)} with nothing to delete. The string has stopped changing, so this is as far as stripping goes.` }));
      break;
    }

    const pair = `${chars[hit]}${chars[hit + 1]}`;
    steps.push(snap({ line: 'match', i: hit, pair: true, tag: 'pair',
      note: `Positions ${hit} and ${hit + 1} hold <b>${pair}</b> — a matching pair with nothing between them.` }));

    chars.splice(hit, 2);
    cuts++;
    steps.push(snap({ line: 'cut', tag: 'cut',
      note: chars.length === 0
        ? `Delete <b>${pair}</b> and nothing is left.`
        : `Delete <b>${pair}</b>. Whatever stood on either side of it is adjacent now — ${show(chars)} — which is how the next pass finds pairs this one could not see.` }));
  }

  const verdict = chars.length === 0;
  steps.push(snap({ line: 'done', verdict, tag: verdict ? 'yes' : 'no',
    note: verdict
      ? `Nothing left. Every character was cut out as half of a matching pair, so return <b>true</b>.`
      : `${plural(chars.length, 'character')} left that no cut could reach — ${show(chars)}. Return <b>false</b>.` }));
  return steps;
}

function buildStack({ s }) {
  const steps = [];
  const chars = [...s];
  const st = [];
  const snap = (extra) => ({ view: 'stack', chars, stack: [...st], i: null, seen: 0, ...extra });

  steps.push(snap({ line: 'init', tag: 'idea',
    note: `One empty stack. Openers go on it; a closer has to answer to whatever is on top, because the top is the most recent opener nobody has closed yet.` }));

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    steps.push(snap({ line: 'loop', i, seen: i, tag: 'read',
      note: `Character ${i} is <b>${ch}</b>.` }));

    if (OPENER_OF[ch]) {
      const want = OPENER_OF[ch];
      steps.push(snap({ line: 'closer', i, seen: i, peek: true, tag: 'closer',
        note: st.length
          ? `<b>${ch}</b> closes something. The only opener it may close is <b>${want}</b>, and it must be the one on top — anything else means an opener was left hanging inside it.`
          : `<b>${ch}</b> closes something, but the stack is empty: there is no unmatched opener for it to close.` }));

      const top = st.pop();
      steps.push(snap({ line: 'pop', i, seen: i, tag: 'pop',
        note: top === undefined
          ? `Nothing to take off an empty stack.`
          : `Take <b>${top}</b> off the top. ${plural(st.length, 'opener')} still waiting underneath.` }));

      if (top !== want) {
        steps.push(snap({ line: 'mismatch', i, seen: i, bad: true, verdict: false, tag: 'no',
          note: top === undefined
            ? `A closer with no opener behind it. Return <b>false</b> immediately — no later character can repair this.`
            : `<b>${ch}</b> needed <b>${want}</b> and found <b>${top}</b>. The brackets cross instead of nesting, so return <b>false</b>.` }));
        return steps;
      }
      steps.push(snap({ line: 'mismatch', i, seen: i + 1, hit: true, tag: 'match',
        note: `<b>${top}${ch}</b> — exactly what it needed. Both are accounted for and neither is ever looked at again.` }));
    } else {
      st.push(ch);
      steps.push(snap({ line: 'push', i, seen: i + 1, pushed: true, tag: 'push',
        note: `<b>${ch}</b> opens something, and nothing is known yet about what will close it. Push it and read on.` }));
    }
  }

  const verdict = st.length === 0;
  steps.push(snap({ line: 'done', seen: chars.length, verdict, tag: verdict ? 'yes' : 'no',
    note: verdict
      ? `The string ran out and so did the stack. Every opener was closed by the right closer in the right order, so return <b>true</b>.`
      : `The string ran out with ${plural(st.length, 'opener')} still on the stack — <b>${st.join('')}</b> was never closed. Return <b>false</b>.` }));
  return steps;
}

/* ---------------- drawing ---------------- */

function drawStrip(s) {
  const tone = {};
  if (s.pair) { tone[s.i] = 'up'; tone[s.i + 1] = 'up'; }
  else if (s.i != null) { tone[s.i] = 'warn'; tone[s.i + 1] = 'warn'; }
  if (s.verdict === false) s.chars.forEach((_, j) => { tone[j] = 'down'; });

  const marks = {};
  if (s.i != null) { marks[s.i] = 'i'; marks[s.i + 1] = 'i+1'; }

  return strip(s.chars, { at: s.i ?? null, marks, tone, label: 's, what is left of it' });
}

function drawStack(s) {
  const tone = {};
  // Characters already accounted for fade to 'done'; the one that broke the
  // string is the only red cell, so the failure reads at a glance.
  for (let j = 0; j < s.seen; j++) tone[j] = 'done';
  if (s.bad) tone[s.i] = 'down';
  else if (s.hit) tone[s.i] = 'up';
  if (s.verdict === true) s.chars.forEach((_, j) => { tone[j] = 'up'; });

  const stackTone = {};
  if (s.peek && s.stack.length) stackTone[s.stack.length - 1] = 'warn';
  if (s.pushed && s.stack.length) stackTone[s.stack.length - 1] = 'up';
  if (s.verdict === false && s.stack.length) {
    s.stack.forEach((_, j) => { stackTone[j] = 'down'; });
  }

  return panels(
    strip(s.chars, { at: s.i ?? null, tone, label: 's' }),
    stack(s.stack, { tone: stackTone, label: 'stack — openers still unclosed' }),
  );
}

function draw(s) {
  return s.view === 'strip' ? drawStrip(s) : drawStack(s);
}

function vars(s) {
  const verdict = s.verdict == null ? '—' : String(s.verdict);
  if (s.view === 'strip') {
    return [['left', s.chars.length ? s.chars.join('') : '(empty)'],
            ['length', s.chars.length],
            ['i', s.i ?? '—'],
            ['cuts', s.cuts],
            ['verdict', verdict]];
  }
  const top = s.stack.length ? s.stack[s.stack.length - 1] : '—';
  return [['i', s.i ?? '—'],
          ['s[i]', s.i != null ? s.chars[s.i] : '—'],
          ['top', top],
          ['depth', s.stack.length],
          ['verdict', verdict]];
}

/* ---------------- the code, one key per line ---------------- */

const c = (t) => `<span class="c">${t}</span>`;
const k = (t) => `<span class="k">${t}</span>`;

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

/* ---------------- mount ---------------- */

// Brackets only, and short enough that the strip still fits the stage. The cap
// is generous next to LeetCode's 10^4 — stripping a string that long is exactly
// the case the stack exists to handle.
const brackets = (v) => {
  const x = v.replace(/\s+/g, '');
  if (!/^[()[\]{}]*$/.test(x)) throw new Error('only ( ) [ ] { } here');
  if (!x.length) throw new Error('needs at least one bracket');
  return x.slice(0, 14);
};

mountLesson({
  root: document.getElementById('lesson'),
  input: { s: '{[]}' },
  controls: [
    { key: 's', label: 's', size: 16, value: '{[]}', parse: brackets },
  ],
  modes: [
    { id: 'strip', name: 'Strip pairs', blurb: 'Delete closed pairs until nothing changes',
      cost: 'O(n²) time · O(n) space', build: buildStrip },
    { id: 'stack', name: 'Stack', blurb: 'Match each closer against the most recent opener',
      cost: 'O(n) time · O(n) space', build: buildStack },
  ],
  languages: [
    { id: 'ruby', name: 'Ruby' }, { id: 'python', name: 'Python' },
    { id: 'javascript', name: 'JavaScript' }, { id: 'go', name: 'Go' }, { id: 'rust', name: 'Rust' },
  ],
  code: CODE,
  // How each language was actually checked. Printed as a badge on every
  // listing in part 3, so a language nothing ran says so on the page.
  verification: {
    ruby: 'run here · 12,000 cases, identical SHA-256 digest',
    python: 'run here · 12,000 cases, identical SHA-256 digest',
    javascript: 'run here · 12,000 cases, identical SHA-256 digest',
    go: 'not compiled — no Go/Rust toolchain, Docker down',
    rust: 'not compiled — no Go/Rust toolchain, Docker down',
  },
  draw,
  vars,
});
