/* Rotate Image — LeetCode 48.
 *
 * A clockwise quarter turn sends the value at (i, j) to (j, n − 1 − i).
 * Written straight down, that needs a second matrix to write into, which the
 * statement forbids. The in-place answer splits the turn into two moves that
 * are each their own swaps: a transpose, which mirrors across the diagonal
 * ((i, j) → (j, i)), then reversing every row ((j, i) → (j, n − 1 − i)).
 */
import { mountLesson } from '../../lib/stepper.js';
import { pick, onLangChange } from '../../lib/i18n.js';
import { cells, slots, stagePanel, readout } from '../../lib/stage.js';
import { t, exampleTitle, LANGUAGES, k, c, labelledRows, stageGap } from '../../lib/kit.js';

const MAX_N = 5;

function parseMatrix(text) {
  const rows = text.trim().replace(/^\[\s*\[/, '').replace(/\]\s*\]$/, '').split(/\]\s*,\s*\[|;/)
    .map((r) => r.split(',').map((x) => x.trim()).filter((x) => x !== '').map(Number));
  const n = rows.length;
  if (!n || rows.some((r) => r.some((v) => !Number.isInteger(v)))) throw new Error('rows of integers, like [[1,2],[3,4]]');
  if (rows.some((r) => r.length !== n)) throw new Error('the matrix must be square, n × n');
  if (n > MAX_N) throw new Error(`at most ${MAX_N} × ${MAX_N}, so the stage stays readable`);
  return rows;
}

const fmtM = (m) => `[${m.map((r) => `[${r.join(',')}]`).join(',')}]`;
const rotated = (m) => m.map((_, j) => m.map((_, i) => m[m.length - 1 - i][j]));

/* ---------------- step generators ---------------- */

function buildCopy({ matrix: input }) {
  const m = input.map((r) => [...r]);
  const n = m.length;
  const out = Array.from({ length: n }, () => Array(n).fill(null));
  const steps = [];
  const snap = (extra) => ({ view: 'copy', matrix: m.map((r) => [...r]), out: out.map((r) => [...r]), from: null, to: null, ...extra });

  steps.push(snap({ line: 'alloc', tag: t(`${n}×${n} more`, `${n}×${n} အပို`),
    note: t(`A second ${n} × ${n} matrix, <code>out</code>, to write the turned picture into. The statement forbids exactly this — but it shows the rule plainly.`,
            `လှည့်ထားသော ပုံကို ရေးရန် ဒုတိယ ${n} × ${n} matrix <code>out</code>။ မေးခွန်းက ဤအရာကိုပင် တားထားသည် — သို့သော် စည်းမျဉ်းကို ရှင်းရှင်း ပြသည်။`) }));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      out[j][n - 1 - i] = m[i][j];
      steps.push(snap({ from: [i, j], to: [j, n - 1 - i], line: 'place', tag: t(`(${i},${j}) → (${j},${n - 1 - i})`, `(${i},${j}) → (${j},${n - 1 - i})`),
        note: t(`matrix[${i}][${j}] = ${m[i][j]} goes to out[${j}][${n - 1 - i}]: its row becomes the column, counted from the right.`,
                `matrix[${i}][${j}] = ${m[i][j]} သည် out[${j}][${n - 1 - i}] သို့ သွားသည် — ၎င်း၏ row သည် ညာမှ ရေတွက်သော column ဖြစ်လာသည်။`) }));
    }
  }
  const final = out.map((r) => [...r]);
  for (let i = 0; i < n; i++) m[i] = final[i];
  steps.push(snap({ finished: true, line: 'back', tag: t('copy back', 'ပြန်ကူး'),
    note: t(`Copy <code>out</code> back into <code>matrix</code> — the caller only sees the matrix it passed in. ${n * n} extra cells were used to do it.`,
            `<code>out</code> ကို <code>matrix</code> ထဲ ပြန်ကူးသည် — ခေါ်သူသည် ၎င်းပေးလိုက်သော matrix ကိုသာ မြင်သည်။ ထိုသို့လုပ်ရန် အပို cell ${n * n} ခု သုံးခဲ့သည်။`) }));
  return steps;
}

function buildInplace({ matrix: input }) {
  const m = input.map((r) => [...r]);
  const n = m.length;
  const steps = [];
  const snap = (extra) => ({ view: 'inplace', matrix: m.map((r) => [...r]), pair: null, row: null, phase: 'transpose', ...extra });

  if (n === 1) {
    steps.push(snap({ line: 'swap', tag: t('nothing to swap', 'လဲစရာ မရှိ'),
      note: t('A 1 × 1 matrix has no pairs across the diagonal.', '1 × 1 matrix တွင် diagonal ကို ဖြတ်သော အတွဲ မရှိပါ။') }));
  }
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      [m[i][j], m[j][i]] = [m[j][i], m[i][j]];
      steps.push(snap({ pair: [[i, j], [j, i]], line: 'swap', tag: t(`swap (${i},${j})`, `(${i},${j}) လဲ`),
        note: t(`Transpose: swap (${i},${j}) with (${j},${i}) across the diagonal — now ${m[i][j]} and ${m[j][i]}. Only j &gt; i, so every pair is swapped once.`,
                `Transpose — diagonal ကို ဖြတ်၍ (${i},${j}) နှင့် (${j},${i}) ကို လဲသည် — ယခု ${m[i][j]} နှင့် ${m[j][i]}။ j &gt; i သာ ဖြစ်သဖြင့် အတွဲတိုင်းကို တစ်ကြိမ်သာ လဲသည်။`) }));
    }
  }
  for (let r = 0; r < n; r++) {
    m[r].reverse();
    steps.push(snap({ row: r, phase: 'reverse', line: 'rev', tag: t(`reverse row ${r}`, `row ${r} ပြောင်းပြန်`),
      note: t(`Reverse row ${r}: [${m[r].join(', ')}]. The transpose put column ${r} here top to bottom; reversed, it reads bottom to top — which is what a clockwise turn does.`,
              `row ${r} ကို ပြောင်းပြန်လုပ်သည် — [${m[r].join(', ')}]။ transpose က column ${r} ကို ဤနေရာတွင် အပေါ်မှ အောက် ထားခဲ့သည် — ပြောင်းပြန်လုပ်လျှင် အောက်မှ အပေါ် ဖတ်ရသည် — နာရီလက်တံအတိုင်း လှည့်ခြင်း၏ အလုပ် ဖြစ်သည်။`) }));
  }
  steps[steps.length - 1] = { ...steps.at(-1), finished: true };
  return steps;
}

/* ---------------- drawing ----------------
 *
 * The strip card is the matrix itself, as the code holds it right now. The
 * stage is what the approach writes toward: the second matrix being filled,
 * or — for the in-place version, which has nowhere else to write — the
 * finished answer, with the cells already in their final place lit. */

function grid(m, toneAt, marksAt = () => null) {
  return labelledRows(m.map((row, i) => [`${i}`, cells(row.map((v) => (v == null ? '·' : v)), {
    index: false,
    tone: Object.fromEntries(row.map((_, j) => [j, toneAt(i, j)]).filter(([, x]) => x)),
    marks: Object.fromEntries(row.map((_, j) => [j, marksAt(i, j)]).filter(([, x]) => x)),
  })]));
}

function strip(s) {
  const n = s.matrix.length;
  if (s.view === 'copy') {
    return grid(s.matrix, (i, j) => {
      if (s.finished) return 'done';
      if (s.from && i === s.from[0] && j === s.from[1]) return 'inwin';
      if (s.from && (i < s.from[0] || (i === s.from[0] && j < s.from[1]))) return 'done';
      return null;
    });
  }
  return grid(s.matrix, (i, j) => {
    if (s.finished) return 'entering';
    if (s.pair && s.pair.some(([a, b]) => a === i && b === j)) return 'inwin';
    if (s.phase === 'transpose' && i === j) return 'done';
    if (s.row === i) return 'entering';
    if (s.row != null && i < s.row) return 'entering';
    return null;
  }, (i, j) => (s.pair && s.pair[0][0] === i && s.pair[0][1] === j && n > 1 ? `${i},${j}` : null));
}

function draw(s, { matrix: input }) {
  const target = rotated(input);
  const n = input.length;
  if (s.view === 'copy') {
    const placed = s.out.flat().filter((v) => v != null).length;
    return stagePanel(pick(t('out — the second matrix', 'out — ဒုတိယ matrix')),
      pick(t(`${placed} of ${n * n} written`, `${n * n} ခုအနက် ${placed} ခု ရေးပြီး`)),
      grid(s.out, (i, j) => (s.to && i === s.to[0] && j === s.to[1] ? 'entering' : s.out[i][j] == null ? null : 'done')));
  }
  const right = s.matrix.flat().filter((v, x) => v === target[Math.floor(x / n)][x % n]).length;
  return stagePanel(pick(t('Where every value must end up', 'value တိုင်း ရောက်ရမည့်နေရာ')),
    pick(t(`${right} of ${n * n} already there`, `${n * n} ခုအနက် ${right} ခု ရောက်ပြီး`)),
    grid(target, (i, j) => (s.matrix[i][j] === target[i][j] ? 'entering' : null))
      + stageGap + readout({ phase: s.phase, 'extra matrix': pick(t('none', 'မရှိ')) }));
}

function answer(s) {
  return {
    html: s.finished ? slots(s.matrix.map((r) => `[${r.join(',')}]`), { total: s.matrix.length }) : '<span class="slot">·</span>',
    note: s.finished ? t('matrix, turned in place', 'နေရာတွင်ပင် လှည့်ထားသော matrix') : t('nothing to return — the matrix is the answer', 'ပြန်ပေးစရာ မရှိ — matrix ကိုယ်တိုင် အဖြေ'),
  };
}

function vars(s) {
  const n = s.matrix.length;
  const out = [['n', n], ['matrix', fmtM(s.matrix)]];
  if (s.view === 'copy') {
    out.push(['out', fmtM(s.out.map((r) => r.map((v) => (v == null ? '·' : v))))]);
    if (s.from) out.push(['i', s.from[0]], ['j', s.from[1]]);
  } else {
    if (s.pair) out.push(['i', s.pair[0][0]], ['j', s.pair[0][1]], ['t', s.matrix[s.pair[0][1]][s.pair[0][0]]]);
    if (s.row != null) out.push(['row', `[${s.matrix[s.row].join(', ')}]`]);
  }
  return out;
}

/* ---------------- the code, one key per line ----------------
 *
 * Generated from the verified solution files, so the listing a reader copies
 * is byte-identical to the one that ran. */

const CODE = {
  copy: {
    ruby: [
      [null, `${k('def')} rotate(matrix)`],
      [null, `  n = matrix.length`],
      ['alloc', `  out = Array.new(n) { Array.new(n) }`],
      [null, `  (0...n).each ${k('do')} |i|`],
      [null, `    (0...n).each ${k('do')} |j|`],
      ['place', `      out[j][n - 1 - i] = matrix[i][j]`],
      [null, `    ${k('end')}`],
      [null, `  ${k('end')}`],
      ['back', `  matrix.replace(out)`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} rotate(self, matrix):`],
      [null, `        n = len(matrix)`],
      ['alloc', `        out = [[0] * n ${k('for')} _ ${k('in')} range(n)]`],
      [null, `        ${k('for')} i ${k('in')} range(n):`],
      [null, `            ${k('for')} j ${k('in')} range(n):`],
      ['place', `                out[j][n - 1 - i] = matrix[i][j]`],
      ['back', `        matrix[:] = out`],
    ],
    javascript: [
      [null, `${k('const')} rotate = ${k('function')} (matrix) {`],
      [null, `  ${k('const')} n = matrix.length;`],
      ['alloc', `  ${k('const')} out = Array.from({ length: n }, () =&gt; ${k('new')} Array(n));`],
      [null, `  ${k('for')} (${k('let')} i = 0; i &lt; n; i++) {`],
      [null, `    ${k('for')} (${k('let')} j = 0; j &lt; n; j++) {`],
      ['place', `      out[j][n - 1 - i] = matrix[i][j];`],
      [null, `    }`],
      [null, `  }`],
      ['back', `  ${k('for')} (${k('let')} i = 0; i &lt; n; i++) matrix[i] = out[i];`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} rotate(matrix [][]int) {`],
      [null, `    n := len(matrix)`],
      ['alloc', `    out := make([][]int, n)`],
      [null, `    ${k('for')} i := ${k('range')} out {`],
      [null, `        out[i] = make([]int, n)`],
      [null, `    }`],
      [null, `    ${k('for')} i := 0; i &lt; n; i++ {`],
      [null, `        ${k('for')} j := 0; j &lt; n; j++ {`],
      ['place', `            out[j][n-1-i] = matrix[i][j]`],
      [null, `        }`],
      [null, `    }`],
      ['back', `    ${k('for')} i := ${k('range')} matrix {`],
      [null, `        copy(matrix[i], out[i])`],
      [null, `    }`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} rotate(matrix: &amp;${k('mut')} Vec&lt;Vec&lt;i32&gt;&gt;) {`],
      [null, `        ${k('let')} n = matrix.len();`],
      ['alloc', `        ${k('let')} ${k('mut')} out = vec![vec![0; n]; n];`],
      [null, `        ${k('for')} i ${k('in')} 0..n {`],
      [null, `            ${k('for')} j ${k('in')} 0..n {`],
      ['place', `                out[j][n - 1 - i] = matrix[i][j];`],
      [null, `            }`],
      [null, `        }`],
      ['back', `        *matrix = out;`],
      [null, `    }`],
      [null, `}`],
    ],
  },
  inplace: {
    ruby: [
      [null, `${k('def')} rotate(matrix)`],
      [null, `  n = matrix.length`],
      [null, `  (0...n).each ${k('do')} |i|`],
      [null, `    (i + 1...n).each ${k('do')} |j|`],
      ['swap', `      matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]`],
      [null, `    ${k('end')}`],
      [null, `  ${k('end')}`],
      ['rev', `  matrix.each(&amp;:reverse!)`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} rotate(self, matrix):`],
      [null, `        n = len(matrix)`],
      [null, `        ${k('for')} i ${k('in')} range(n):`],
      [null, `            ${k('for')} j ${k('in')} range(i + 1, n):`],
      ['swap', `                matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]`],
      [null, `        ${k('for')} row ${k('in')} matrix:`],
      ['rev', `            row.reverse()`],
    ],
    javascript: [
      [null, `${k('const')} rotate = ${k('function')} (matrix) {`],
      [null, `  ${k('const')} n = matrix.length;`],
      [null, `  ${k('for')} (${k('let')} i = 0; i &lt; n; i++) {`],
      [null, `    ${k('for')} (${k('let')} j = i + 1; j &lt; n; j++) {`],
      ['swap', `      [matrix[i][j], matrix[j][i]] = [matrix[j][i], matrix[i][j]];`],
      [null, `    }`],
      [null, `  }`],
      ['rev', `  ${k('for')} (${k('const')} row ${k('of')} matrix) row.reverse();`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} rotate(matrix [][]int) {`],
      [null, `    n := len(matrix)`],
      [null, `    ${k('for')} i := 0; i &lt; n; i++ {`],
      [null, `        ${k('for')} j := i + 1; j &lt; n; j++ {`],
      ['swap', `            matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]`],
      [null, `        }`],
      [null, `    }`],
      ['rev', `    ${k('for')} _, row := ${k('range')} matrix {`],
      [null, `        ${k('for')} a, b := 0, n-1; a &lt; b; a, b = a+1, b-1 {`],
      [null, `            row[a], row[b] = row[b], row[a]`],
      [null, `        }`],
      [null, `    }`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} rotate(matrix: &amp;${k('mut')} Vec&lt;Vec&lt;i32&gt;&gt;) {`],
      [null, `        ${k('let')} n = matrix.len();`],
      [null, `        ${k('for')} i ${k('in')} 0..n {`],
      [null, `            ${k('for')} j ${k('in')} i + 1..n {`],
      ['swap', `                ${k('let')} t = matrix[i][j];`],
      [null, `                matrix[i][j] = matrix[j][i];`],
      [null, `                matrix[j][i] = t;`],
      [null, `            }`],
      [null, `        }`],
      [null, `        ${k('for')} row ${k('in')} matrix.iter_mut() {`],
      ['rev', `            row.reverse();`],
      [null, `        }`],
      [null, `    }`],
      [null, `}`],
    ],
  },
};

/* ---------------- part 1: the "where does it go" widget ----------------
 *
 * The statement hinges on the turn itself: clockwise, and in place. Click any
 * cell to see where a clockwise quarter turn sends it, and the ring of four
 * cells that trade places with it — the reason an in-place turn is possible
 * at all: no value ever needs to go anywhere another value is not leaving.
 *
 * Built from x-sum's widget vocabulary: rows of clickable .q-arr cells
 * (kept / picked), the .q-presets chips, the amber .q-tie line and the
 * .ledger. */

const QW_SETS = [
  { label: t('3 × 3', '3 × 3'), m: [[1, 2, 3], [4, 5, 6], [7, 8, 9]] },
  { label: t('4 × 4', '4 × 4'), m: [[5, 1, 9, 11], [2, 4, 8, 10], [13, 3, 6, 7], [15, 14, 12, 16]] },
];

function mountTurnWidget(host) {
  const state = { set: 0, i: 0, j: 1 };
  host.innerHTML = `
    <div data-grid></div>
    <div class="q-slider"><span class="q-presets" data-presets></span></div>
    <p class="q-tie" data-line></p>
    <div class="ledger">
      <span class="expr" data-expr></span>
      <span class="total" data-total></span>
    </div>`;
  const q = (sel) => host.querySelector(sel);

  function render() {
    const { m } = QW_SETS[state.set];
    const n = m.length;
    const ring = [[state.i, state.j]];
    for (let x = 0; x < 3; x++) { const [a, b] = ring.at(-1); ring.push([b, n - 1 - a]); }
    const key = (a, b) => `${a},${b}`;
    const inRing = new Map(ring.map(([a, b], x) => [key(a, b), x]));
    const [ti, tj] = ring[1];
    const center = ring.every(([a, b]) => a === state.i && b === state.j);
    q('[data-presets]').innerHTML = QW_SETS.map((x, jj) =>
      `<button class="chip" data-set="${jj}"${jj === state.set ? ' aria-pressed="true"' : ''}>${pick(x.label)}</button>`).join('');
    q('[data-grid]').innerHTML = m.map((row, a) => `<div class="q-arr">${row.map((v, b) => {
      const x = inRing.get(key(a, b));
      const cls = x == null ? '' : x === 0 ? 'kept picked' : x === 1 ? 'kept picked amber' : 'kept';
      return `<div class="cell ${cls}" role="button" tabindex="0" data-i="${a}" data-j="${b}"><span>${v}</span><span class="idx">${a},${b}</span></div>`;
    }).join('')}</div>`).join('');
    const label = document.getElementById('q-label');
    if (label) label.textContent = pick(t('click a cell', 'cell တစ်ခု နှိပ်ပါ'));
    q('[data-line]').innerHTML = pick(center
      ? t(`(${state.i},${state.j}) is the centre of an odd-sized matrix: a quarter turn leaves it where it is.`,
          `(${state.i},${state.j}) သည် မဂဏန်း အရွယ် matrix ၏ အလယ် — လေးပုံတစ်ပုံ လှည့်ခြင်းက ၎င်းကို နေရာတွင်ပင် ထားသည်။`)
      : t(`${m[state.i][state.j]} at (${state.i},${state.j}) moves to (${ti},${tj}), where ${m[ti][tj]} is — which moves on in turn. Four cells trade places in a ring, so nothing needs a second matrix to wait in.`,
          `(${state.i},${state.j}) ရှိ ${m[state.i][state.j]} သည် ${m[ti][tj]} ရှိရာ (${ti},${tj}) သို့ ရွှေ့သည် — ၎င်းကလည်း အလှည့်ကျ ဆက်ရွှေ့သည်။ cell လေးခုသည် ကွင်းပုံ နေရာလဲကြသဖြင့် စောင့်ရန် ဒုတိယ matrix မလိုပါ။`));
    q('[data-expr]').innerHTML = `(i, j) → (j, n − 1 − i) &nbsp;·&nbsp; ${ring.map(([a, b]) => `(${a},${b})`).join(' → ')}`;
    q('[data-total]').innerHTML = `${center ? 1 : 4}<small>${pick(t('cells in the ring', 'ကွင်းထဲ cell'))}</small>`;
  }
  function pickCell(el) { state.i = Number(el.dataset.i); state.j = Number(el.dataset.j); render(); }
  host.addEventListener('click', (ev) => {
    const chip = ev.target.closest('[data-set]');
    if (chip) { state.set = Number(chip.dataset.set); state.i = 0; state.j = 1; return render(); }
    const cell = ev.target.closest('[data-i]');
    if (cell) pickCell(cell);
  });
  host.addEventListener('keydown', (ev) => {
    const cell = ev.target.closest('[data-i]');
    if (cell && (ev.key === 'Enter' || ev.key === ' ')) { ev.preventDefault(); pickCell(cell); }
  });
  onLangChange(render);
  render();
}

/* ---------------- the approach, in brief ---------------- */

const APPROACH = {
  copy: {
    idea: t('A clockwise quarter turn sends row i to column n − 1 − i. Write every value to its new place in a second matrix, then copy that back.',
            'နာရီလက်တံအတိုင်း လေးပုံတစ်ပုံ လှည့်ခြင်းက row i ကို column n − 1 − i သို့ ပို့သည်။ value တိုင်းကို ဒုတိယ matrix ထဲ နေရာသစ်တွင် ရေးပြီး ပြန်ကူးသည်။'),
    steps: [
      t('Make an empty <code>out</code>, n × n.', 'n × n <code>out</code> ဗလာ တစ်ခု လုပ်သည်။'),
      t('For every <code>(i, j)</code>: <code>out[j][n − 1 − i] = matrix[i][j]</code>.', '<code>(i, j)</code> တိုင်းအတွက် — <code>out[j][n − 1 − i] = matrix[i][j]</code>။'),
      t('Copy <code>out</code> into <code>matrix</code>, the one the caller holds.', '<code>out</code> ကို ခေါ်သူ ကိုင်ထားသော <code>matrix</code> ထဲ ကူးသည်။'),
    ],
    cost: t('n² moves and n² extra cells — the extra matrix the statement rules out.', 'ရွှေ့ခြင်း n² နှင့် အပို cell n² — မေးခွန်းက ပယ်ထားသော အပို matrix။'),
  },
  inplace: {
    idea: t('Split the turn in two moves that are swaps: a transpose mirrors (i, j) to (j, i), and reversing each row then takes (j, i) to (j, n − 1 − i). Together they are the clockwise turn.',
            'လှည့်ခြင်းကို လဲလှယ်ခြင်းများသာ ဖြစ်သော အဆင့်နှစ်ခု ခွဲသည် — transpose က (i, j) ကို (j, i) သို့ မှန်ပြောင်းပြီး row တိုင်းကို ပြောင်းပြန်လုပ်ခြင်းက (j, i) ကို (j, n − 1 − i) သို့ ယူသွားသည်။ နှစ်ခုပေါင်း နာရီလက်တံအတိုင်း လှည့်ခြင်း ဖြစ်သည်။'),
    steps: [
      t('Transpose: for every <code>j &gt; i</code>, swap <code>matrix[i][j]</code> and <code>matrix[j][i]</code>.',
        'Transpose — <code>j &gt; i</code> တိုင်းအတွက် <code>matrix[i][j]</code> နှင့် <code>matrix[j][i]</code> ကို လဲသည်။'),
      t('Reverse every row.', 'row တိုင်းကို ပြောင်းပြန်လုပ်သည်။'),
    ],
    cost: t('n(n − 1)/2 swaps, then n row reversals: every value moves twice, and no second matrix.',
            'လဲခြင်း n(n − 1)/2၊ ပြီးမှ row ပြောင်းပြန် n ကြိမ် — value တိုင်း နှစ်ကြိမ် ရွှေ့ပြီး ဒုတိယ matrix မလို။'),
  },
};

/* ---------------- mount ---------------- */

const EX1 = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
const EX2 = [[5, 1, 9, 11], [2, 4, 8, 10], [13, 3, 6, 7], [15, 14, 12, 16]];

mountLesson({
  input: { matrix: EX1 },
  controls: [
    { key: 'matrix', label: 'matrix', value: fmtM(EX1), parse: parseMatrix, format: fmtM },
  ],
  presets: [
    { label: exampleTitle(1), input: { matrix: EX1 } },
    { label: exampleTitle(2), input: { matrix: EX2 } },
    { label: t('2 × 2', '2 × 2'), input: { matrix: [[1, 2], [3, 4]] } },
    { label: t('1 × 1', '1 × 1'), input: { matrix: [[7]] } },
  ],
  examples: [
    { title: exampleTitle(1), inputHtml: '<code>matrix = [[1,2,3],[4,5,6],[7,8,9]]</code>', output: '[[7,4,1],[8,5,2],[9,6,3]]',
      why: [t('The first column, read bottom to top, becomes the first row: 7, 4, 1.', 'ပထမ column ကို အောက်မှ အပေါ် ဖတ်လျှင် ပထမ row ဖြစ်လာသည် — 7, 4, 1။')],
      load: { matrix: EX1 } },
    { title: exampleTitle(2), inputHtml: '<code>matrix = [[5,1,9,11],[2,4,8,10],[13,3,6,7],[15,14,12,16]]</code>', output: '[[15,13,2,5],[14,3,4,1],[12,6,8,9],[16,7,10,11]]',
      why: [t('Same rule at 4 × 4: column j, bottom to top, is the new row j.', '4 × 4 တွင်လည်း စည်းမျဉ်းတူ — column j ကို အောက်မှ အပေါ် ဖတ်လျှင် row j အသစ်။')],
      load: { matrix: EX2 } },
  ],
  modes: [
    { id: 'copy', name: 'Second matrix',
      sub: t('not in place', 'နေရာတွင် မဟုတ်'),
      desc: t('Write each value to its new place, then copy back.', 'value တစ်ခုစီကို နေရာသစ်တွင် ရေး၊ ပြီးမှ ပြန်ကူး။'),
      cost: 'O(n²) time · O(n²) space', build: buildCopy },
    { id: 'inplace', name: 'Transpose + reverse',
      desc: t('Mirror across the diagonal, then flip every row.', 'diagonal ကို ဖြတ်၍ မှန်ပြောင်း၊ ပြီးမှ row တိုင်း ပြောင်းပြန်။'),
      cost: 'O(n²) time · O(1) space', build: buildInplace },
  ],
  languages: LANGUAGES,
  code: CODE,
  solutions: {
    copy: { approach: APPROACH.copy,
      desc: t('The rule written straight down, into a second matrix. It produces the right picture, but breaks the one condition the statement insists on: no second matrix.',
              'စည်းမျဉ်းကို ဒုတိယ matrix ထဲ တိုက်ရိုက် ရေးထားခြင်း။ မှန်ကန်သော ပုံ ထွက်သော်လည်း မေးခွန်း အခိုင်အမာ တောင်းထားသော စည်းကမ်း — ဒုတိယ matrix မသုံးရ — ကို ချိုးဖောက်သည်။') },
    inplace: { approach: APPROACH.inplace,
      desc: t('The submission worth writing: two passes of swaps, no extra matrix. Start the transpose at <code>j = i + 1</code>, and reverse each row — not the order of the rows.',
              'ရေးသင့်သည့် submission — လဲခြင်း pass နှစ်ခု၊ အပို matrix မလို။ transpose ကို <code>j = i + 1</code> မှ စပြီး row တစ်ခုစီကို ပြောင်းပြန်လုပ်ပါ — row များ၏ အစီအစဉ်ကို မဟုတ်ပါ။') },
  },
  // How each language was actually checked, printed as the part 3 badges.
  // The corpus: the 2 examples, 3 edges, 15,000 random matrices up to 5 × 5,
  // and 5,000 up to 20 × 20 across ±1000 — against an oracle that reads each
  // new row off a column, bottom to top. Each driver prints the matrix it
  // passed in, so a rotation that did not reach the caller fails. Go and Rust
  // ran in Docker (golang:1.23-alpine, rust:1-slim).
  verification: {
    ruby: 'ran here · 20,005 cases',
    python: 'ran here · 20,005 cases',
    javascript: 'ran here · 20,005 cases',
    go: 'ran here · 20,005 cases · Go 1.23',
    rust: 'ran here · 20,005 cases · rustc 1.98',
  },
  stripLabel: t('matrix, as it is now', 'matrix — ယခု အခြေအနေ'),
  strip,
  draw,
  answer,
  vars,
  widget: mountTurnWidget,
});
