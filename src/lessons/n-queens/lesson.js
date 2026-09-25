/* N-Queens — LeetCode 51.
 *
 * One queen per row, so the search is: for row r, try each column; if no
 * queen above attacks the square, place it and solve row r + 1; then lift it
 * and try the next column. Two queens attack along a column, or along a
 * diagonal — and every square on a ↘ diagonal shares r − c, every square on a
 * ↙ diagonal shares r + c. The first version checks a square by scanning the
 * queens above it; the second keeps three arrays of taken columns and
 * diagonals and checks in O(1).
 */
import { mountLesson } from '../../lib/stepper.js';
import { pick, onLangChange } from '../../lib/i18n.js';
import { cells, slots, stagePanel, readout } from '../../lib/stage.js';
import { t, LANGUAGES, k, c, labelledRows, stageGap, intValue, presetChips, widgetLabel } from '../../lib/kit.js';

const MAX_N = 5;
const SOLUTIONS = [1, 0, 0, 2, 10, 4, 40, 92, 352];
const sq = (r, cc) => `(${r},${cc})`;

/* Which placed queen attacks (r, c), and how — the first one in row order. */
function attacker(cols, r, cc) {
  for (let pr = 0; pr < cols.length; pr++) {
    const pc = cols[pr];
    if (pc === cc) return { pr, how: 'col' };
    if (pc - cc === r - pr) return { pr, how: 'diag' };
    if (cc - pc === r - pr) return { pr, how: 'anti' };
  }
  return null;
}
const HOW = {
  col: t('the same column', 'column တူ'),
  diag: t('the same ↘ diagonal, r − c', '↘ diagonal တူ၊ r − c'),
  anti: t('the same ↙ diagonal, r + c', '↙ diagonal တူ၊ r + c'),
};

/* ---------------- step generators ---------------- */

function build(view) {
  return ({ n }) => {
    const cols = [], out = [];
    const steps = [];
    let tries = 0, work = 0;
    const snap = (extra) => ({ view, n, cols: [...cols], out: out.map((x) => [...x]), r: null, c: null, hit: null, tries, work, just: -1, ...extra });
    if (view === 'sets') {
      steps.push(snap({ line: 'init', tag: t('all free', 'အားလုံး လွတ်'),
        note: t(`Three arrays of flags, all false: col (${n} columns), diag and anti (${2 * n - 1} diagonals each). A ↘ diagonal is named by r − c, shifted by n − 1 to start at 0; a ↙ diagonal by r + c.`,
                `flag array သုံးခု၊ အားလုံး false — col (column ${n})၊ diag နှင့် anti (diagonal ${2 * n - 1} စီ)။ ↘ diagonal ကို r − c ဖြင့် အမည်ပေးပြီး 0 မှ စရန် n − 1 ရွှေ့ထားသည် — ↙ diagonal ကို r + c ဖြင့်။`) }));
    }
    function place(r) {
      if (r === n) {
        out.push([...cols]);
        steps.push(snap({ line: 'full', r, just: out.length - 1, tag: t(`solution ${out.length}`, `အဖြေ ${out.length}`),
          note: t(`All ${n} rows have a queen and none attacks another: solution ${out.length}, columns ${cols.join(', ')}. Write it out as a board, then keep searching.`,
                  `row ${n} ခုလုံးတွင် queen ရှိပြီး တစ်ခုက တစ်ခုကို မတိုက်ပါ — အဖြေ ${out.length}၊ column ${cols.join(', ')}။ board အဖြစ် ရေးပြီး ဆက်ရှာသည်။`) }));
        return;
      }
      for (let cc = 0; cc < n; cc++) {
        tries++;
        const hit = attacker(cols, r, cc);
        work += view === 'scan' ? (hit ? hit.pr + 1 : cols.length) : 1;
        if (hit) {
          const how = HOW[hit.how];
          steps.push(snap({ line: 'clash', r, c: cc, hit, tag: t(`${sq(r, cc)} attacked`, `${sq(r, cc)} တိုက်ခံ`),
            note: view === 'scan'
              ? t(`Try ${sq(r, cc)}: scanning the queens above, the one at ${sq(hit.pr, cols[hit.pr])} shares ${how.en}. Next column.`,
                  `${sq(r, cc)} ကို စမ်း — အပေါ်ရှိ queen များကို scan ရာ ${sq(hit.pr, cols[hit.pr])} ရှိ queen သည် ${how.my} ဖြစ်သည်။ နောက် column။`)
              : t(`Try ${sq(r, cc)}: ${hit.how === 'col' ? `col[${cc}]` : hit.how === 'diag' ? `diag[${r - cc + n - 1}]` : `anti[${r + cc}]`} is already taken — by the queen at ${sq(hit.pr, cols[hit.pr])}. One lookup; next column.`,
                  `${sq(r, cc)} ကို စမ်း — ${hit.how === 'col' ? `col[${cc}]` : hit.how === 'diag' ? `diag[${r - cc + n - 1}]` : `anti[${r + cc}]`} ကို ${sq(hit.pr, cols[hit.pr])} ရှိ queen က ယူထားပြီး။ lookup တစ်ကြိမ် — နောက် column။`) }));
          continue;
        }
        if (view === 'scan') {
          steps.push(snap({ line: 'check', r, c: cc, tag: t(`${sq(r, cc)} safe`, `${sq(r, cc)} လုံခြုံ`),
            note: t(`Try ${sq(r, cc)}: checked ${cols.length ? `all ${cols.length} ${cols.length === 1 ? 'queen' : 'queens'} above` : 'nothing — it is the first row'}; none shares its column or a diagonal.`,
                    `${sq(r, cc)} ကို စမ်း — ${cols.length ? `အပေါ်ရှိ queen ${cols.length} ခုလုံးကို စစ်ပြီး` : 'ဘာမှ မစစ်ရ — ပထမ row'} — column သို့မဟုတ် diagonal မတူပါ။`) }));
        }
        cols.push(cc);
        steps.push(snap({ line: 'put', r, c: cc, tag: t(`queen ${sq(r, cc)}`, `queen ${sq(r, cc)}`),
          note: view === 'scan'
            ? t(`Place a queen at ${sq(r, cc)} and go on to row ${r + 1}.`, `${sq(r, cc)} တွင် queen ထားပြီး row ${r + 1} သို့ ဆက်သွားသည်။`)
            : t(`Place a queen at ${sq(r, cc)}: mark col[${cc}], diag[${r - cc + n - 1}] and anti[${r + cc}] taken, then go on to row ${r + 1}.`,
                `${sq(r, cc)} တွင် queen ထား — col[${cc}]၊ diag[${r - cc + n - 1}] နှင့် anti[${r + cc}] ကို ယူပြီးဟု မှတ်၊ ပြီးမှ row ${r + 1} သို့ ဆက်သွားသည်။`) }));
        place(r + 1);
        cols.pop();
        steps.push(snap({ line: 'lift', r, c: cc, tag: t(`lift ${sq(r, cc)}`, `${sq(r, cc)} ဖယ်`),
          note: t(`Every board with a queen at ${sq(r, cc)} has been tried. Lift it${view === 'sets' ? ' and clear its three flags' : ''}, and try the next column in row ${r}.`,
                  `${sq(r, cc)} တွင် queen ပါသော board တိုင်းကို စမ်းပြီး။ ၎င်းကို ဖယ်${view === 'sets' ? '၊ flag သုံးခုကို ရှင်း' : ''}ပြီး row ${r} ၏ နောက် column ကို စမ်းသည်။`) }));
      }
    }
    place(0);
    steps.push(snap({ line: 'ret', finished: true, tag: t(`${out.length} solutions`, `အဖြေ ${out.length}`),
      note: t(`Every square of the search tried: ${out.length} ${out.length === 1 ? 'solution' : 'solutions'} for n = ${n}, from ${tries} squares tried and ${work} ${view === 'scan' ? 'queen-against-queen comparisons' : 'O(1) flag checks'}.`,
              `ရှာဖွေမှု၏ နေရာတိုင်းကို စမ်းပြီး — n = ${n} အတွက် အဖြေ ${out.length}၊ နေရာ ${tries} ခု စမ်းပြီး ${view === 'scan' ? 'queen ချင်း နှိုင်းယှဉ်ခြင်း' : 'O(1) flag စစ်ခြင်း'} ${work}။`) }));
    return steps;
  };
}

/* ---------------- drawing ----------------
 *
 * The strip card is `cols`, the one array both versions keep: row r's queen
 * sits in column cols[r]. The stage is the board it stands for — queens, the
 * square being tried, the queen that rules it out, and every square the
 * queens already attack, faded — with the flag arrays for the second version. */

function strip(s) {
  const row = Array.from({ length: s.n }, (_, r) => (r < s.cols.length ? s.cols[r] : '·'));
  const tone = {};
  if (s.r != null && s.r < s.n && !s.finished) tone[s.r] = s.line === 'clash' ? 'leaving' : 'inwin';
  return cells(row, { tone });
}

function board(s) {
  const n = s.n;
  const attacked = (r, cc) => s.cols.some((pc, pr) => pr !== r && (pc === cc || Math.abs(pc - cc) === Math.abs(r - pr)));
  return `<div class="nq">${labelledRows(Array.from({ length: n }, (_, r) => [`${r}`, cells(Array.from({ length: n }, (_, cc) => {
    if (s.cols[r] === cc) return 'Q';
    if (r === s.r && cc === s.c && s.line === 'clash') return '×';
    return '·';
  }), {
    tone: Object.fromEntries(Array.from({ length: n }, (_, cc) => {
      if (r === s.r && cc === s.c) return [cc, s.line === 'clash' ? 'leaving' : s.line === 'lift' ? 'done' : 'inwin'];
      if (s.hit && r === s.hit.pr && s.cols[r] === cc) return [cc, 'leaving'];
      if (s.cols[r] === cc) return [cc, 'entering'];
      if (r >= s.cols.length && attacked(r, cc)) return [cc, 'done'];
      return [cc, null];
    }).filter(([, x]) => x)),
  })]))}</div>`;
}

function draw(s) {
  const n = s.n;
  let flags = '';
  if (s.view === 'sets') {
    const taken = (f) => s.cols.map((pc, pr) => f(pr, pc)).sort((a, b) => a - b).join(', ') || '—';
    flags = stageGap + readout({ col: taken((pr, pc) => pc), diag: taken((pr, pc) => pr - pc + n - 1), anti: taken((pr, pc) => pr + pc) });
  }
  return stagePanel(pick(t('The board', 'Board')), pick(t(`${s.cols.length} of ${n} queens`, `queen ${n} ခုအနက် ${s.cols.length}`)), board(s))
    + flags + stageGap + readout({ [pick(t('squares tried', 'စမ်းပြီး နေရာ'))]: s.tries, [pick(s.view === 'scan' ? t('comparisons', 'နှိုင်းယှဉ်ခြင်း') : t('flag checks', 'flag စစ်ခြင်း'))]: s.work });
}

function answer(s) {
  return {
    html: SOLUTIONS[s.n - 1] ? slots(s.out.map((x) => x.join('')), { total: SOLUTIONS[s.n - 1], just: s.just }) : '<span class="slot">[]</span>',
    note: t('each solution as its cols, row by row', 'အဖြေတစ်ခုစီကို row အလိုက် cols အဖြစ်'),
  };
}

function vars(s) {
  const n = s.n;
  const out = [['n', n], ['cols', `[${s.cols.join(', ')}]`], ['out', `${s.out.length} boards`]];
  if (s.r != null && s.r < n) out.push(['r', s.r]);
  if (s.c != null) out.push(['c', s.c]);
  if (s.hit) out.push(['pr', s.hit.pr], ['pc', s.cols[s.hit.pr]]);
  if (s.view === 'sets') {
    const flags = (len, f) => `[${Array.from({ length: len }, (_, x) => (s.cols.some((pc, pr) => f(pr, pc) === x) ? 'T' : 'F')).join(' ')}]`;
    out.push(['col', flags(n, (pr, pc) => pc)], ['diag', flags(2 * n - 1, (pr, pc) => pr - pc + n - 1)], ['anti', flags(2 * n - 1, (pr, pc) => pr + pc)]);
  }
  return out;
}

/* ---------------- the code, one key per line ----------------
 *
 * Generated from the verified solution files, so the listing a reader copies
 * is byte-identical to the one that ran. */

const CODE = {
  scan: {
    ruby: [
      [null, `${k('def')} solve_n_queens(n)`],
      [null, `  out = []`],
      [null, `  place(n, [], out) ${c('# cols[r]: the column of row r\'s queen')}`],
      ['ret', `  out`],
      [null, `${k('end')}`],
      [null, ``],
      [null, `${k('def')} safe?(cols, r, c)`],
      ['check', `  cols.each_with_index ${k('do')} |pc, pr|`],
      ['clash', `    ${k('return')} false ${k('if')} pc == c || (pc - c).abs == r - pr`],
      [null, `  ${k('end')}`],
      ['check', `  true`],
      [null, `${k('end')}`],
      [null, ``],
      [null, `${k('def')} place(n, cols, out)`],
      [null, `  r = cols.length`],
      ['full', `  ${k('if')} r == n`],
      ['full', `    out &lt;&lt; cols.map { |c| '.' * c + 'Q' + '.' * (n - c - 1) }`],
      [null, `    ${k('return')}`],
      [null, `  ${k('end')}`],
      [null, `  (0...n).each ${k('do')} |c|`],
      [null, `    next ${k('unless')} safe?(cols, r, c)`],
      ['put', `    cols &lt;&lt; c`],
      [null, `    place(n, cols, out)`],
      ['lift', `    cols.pop`],
      [null, `  ${k('end')}`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} solveNQueens(self, n):`],
      [null, `        out, cols = [], []                ${c('# cols[r]: the column of row r\'s queen')}`],
      [null, ``],
      [null, `        ${k('def')} safe(r, c):`],
      ['check', `            ${k('for')} pr, pc ${k('in')} enumerate(cols):`],
      ['clash', `                ${k('if')} pc == c or abs(pc - c) == r - pr:`],
      ['clash', `                    ${k('return')} False`],
      ['check', `            ${k('return')} True`],
      [null, ``],
      [null, `        ${k('def')} place(r):`],
      ['full', `            ${k('if')} r == n:`],
      ['full', `                out.append(['.' * c + 'Q' + '.' * (n - c - 1) ${k('for')} c ${k('in')} cols])`],
      [null, `                ${k('return')}`],
      [null, `            ${k('for')} c ${k('in')} range(n):`],
      [null, `                ${k('if')} safe(r, c):`],
      ['put', `                    cols.append(c)`],
      [null, `                    place(r + 1)`],
      ['lift', `                    cols.pop()`],
      [null, ``],
      [null, `        place(0)`],
      ['ret', `        ${k('return')} out`],
    ],
    javascript: [
      [null, `${k('const')} solveNQueens = ${k('function')} (n) {`],
      [null, `  ${k('const')} out = [], cols = []; ${c('// cols[r]: the column of row r\'s queen')}`],
      [null, `  ${k('const')} safe = (r, c) =&gt; {`],
      ['check', `    ${k('for')} (${k('let')} pr = 0; pr &lt; cols.length; pr++) {`],
      ['clash', `      ${k('if')} (cols[pr] === c || Math.abs(cols[pr] - c) === r - pr) ${k('return')} false;`],
      [null, `    }`],
      ['check', `    ${k('return')} true;`],
      [null, `  };`],
      [null, `  ${k('const')} place = (r) =&gt; {`],
      ['full', `    ${k('if')} (r === n) {`],
      ['full', `      out.push(cols.map((c) =&gt; '.'.repeat(c) + 'Q' + '.'.repeat(n - c - 1)));`],
      [null, `      ${k('return')};`],
      [null, `    }`],
      [null, `    ${k('for')} (${k('let')} c = 0; c &lt; n; c++) {`],
      [null, `      ${k('if')} (!safe(r, c)) continue;`],
      ['put', `      cols.push(c);`],
      [null, `      place(r + 1);`],
      ['lift', `      cols.pop();`],
      [null, `    }`],
      [null, `  };`],
      [null, `  place(0);`],
      ['ret', `  ${k('return')} out;`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} solveNQueens(n int) [][]string {`],
      [null, `    out := [][]string{}`],
      [null, `    cols := []int{} ${c('// cols[r]: the column of row r\'s queen')}`],
      [null, `    safe := ${k('func')}(r, c int) bool {`],
      ['check', `        ${k('for')} pr, pc := ${k('range')} cols {`],
      ['clash', `            ${k('if')} pc == c || pc-c == r-pr || c-pc == r-pr {`],
      ['clash', `                ${k('return')} false`],
      [null, `            }`],
      [null, `        }`],
      ['check', `        ${k('return')} true`],
      [null, `    }`],
      [null, `    ${k('var')} place ${k('func')}(r int)`],
      [null, `    place = ${k('func')}(r int) {`],
      ['full', `        ${k('if')} r == n {`],
      [null, `            board := make([]string, n)`],
      [null, `            ${k('for')} i, c := ${k('range')} cols {`],
      ['full', `                board[i] = strings.Repeat(".", c) + "Q" + strings.Repeat(".", n-c-1)`],
      [null, `            }`],
      ['full', `            out = append(out, board)`],
      [null, `            ${k('return')}`],
      [null, `        }`],
      [null, `        ${k('for')} c := 0; c &lt; n; c++ {`],
      [null, `            ${k('if')} !safe(r, c) {`],
      [null, `                continue`],
      [null, `            }`],
      ['put', `            cols = append(cols, c)`],
      [null, `            place(r + 1)`],
      ['lift', `            cols = cols[:len(cols)-1]`],
      [null, `        }`],
      [null, `    }`],
      [null, `    place(0)`],
      ['ret', `    ${k('return')} out`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} solve_n_queens(n: i32) -&gt; Vec&lt;Vec&lt;String&gt;&gt; {`],
      [null, `        ${k('fn')} safe(cols: &amp;[i32], r: i32, c: i32) -&gt; bool {`],
      ['check', `            ${k('for')} (pr, &amp;pc) ${k('in')} cols.iter().enumerate() {`],
      ['clash', `                ${k('if')} pc == c || (pc - c).abs() == r - pr as i32 {`],
      ['clash', `                    ${k('return')} false;`],
      [null, `                }`],
      [null, `            }`],
      ['check', `            true`],
      [null, `        }`],
      [null, `        ${k('fn')} place(n: i32, cols: &amp;${k('mut')} Vec&lt;i32&gt;, out: &amp;${k('mut')} Vec&lt;Vec&lt;String&gt;&gt;) {`],
      [null, `            ${k('let')} r = cols.len() as i32;`],
      ['full', `            ${k('if')} r == n {`],
      ['full', `                out.push(cols.iter().map(|&amp;c| ".".repeat(c as usize) + "Q" + &amp;".".repeat((n - c - 1) as usize)).collect());`],
      [null, `                ${k('return')};`],
      [null, `            }`],
      [null, `            ${k('for')} c ${k('in')} 0..n {`],
      [null, `                ${k('if')} !safe(cols, r, c) {`],
      [null, `                    continue;`],
      [null, `                }`],
      ['put', `                cols.push(c);`],
      [null, `                place(n, cols, out);`],
      ['lift', `                cols.pop();`],
      [null, `            }`],
      [null, `        }`],
      [null, `        ${k('let')} ${k('mut')} out = Vec::new();`],
      [null, `        place(n, &amp;${k('mut')} Vec::new(), &amp;${k('mut')} out); ${c('// cols[r]: the column of row r\'s queen')}`],
      ['ret', `        out`],
      [null, `    }`],
      [null, `}`],
    ],
  },
  sets: {
    ruby: [
      [null, `${k('def')} solve_n_queens(n)`],
      [null, `  out = []`],
      ['init', `  col = Array.new(n, false) ${c('# taken columns')}`],
      ['init', `  diag = Array.new(2 * n - 1, false) ${c('# taken ↘ diagonals, by r - c + n - 1')}`],
      ['init', `  anti = Array.new(2 * n - 1, false) ${c('# taken ↙ diagonals, by r + c')}`],
      [null, `  place = lambda ${k('do')} |cols|`],
      [null, `    r = cols.length`],
      ['full', `    ${k('if')} r == n`],
      ['full', `      out &lt;&lt; cols.map { |c| '.' * c + 'Q' + '.' * (n - c - 1) }`],
      [null, `      next`],
      [null, `    ${k('end')}`],
      [null, `    (0...n).each ${k('do')} |c|`],
      ['clash', `      next ${k('if')} col[c] || diag[r - c + n - 1] || anti[r + c]`],
      ['put', `      cols &lt;&lt; c`],
      ['put', `      col[c] = diag[r - c + n - 1] = anti[r + c] = true`],
      [null, `      place.(cols)`],
      ['lift', `      cols.pop`],
      ['lift', `      col[c] = diag[r - c + n - 1] = anti[r + c] = false`],
      [null, `    ${k('end')}`],
      [null, `  ${k('end')}`],
      [null, `  place.([])`],
      ['ret', `  out`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} solveNQueens(self, n):`],
      [null, `        out, cols = [], []`],
      ['init', `        col = [False] * n                 ${c('# taken columns')}`],
      ['init', `        diag = [False] * (2 * n - 1)      ${c('# taken ↘ diagonals, by r - c + n - 1')}`],
      ['init', `        anti = [False] * (2 * n - 1)      ${c('# taken ↙ diagonals, by r + c')}`],
      [null, ``],
      [null, `        ${k('def')} place(r):`],
      ['full', `            ${k('if')} r == n:`],
      ['full', `                out.append(['.' * c + 'Q' + '.' * (n - c - 1) ${k('for')} c ${k('in')} cols])`],
      [null, `                ${k('return')}`],
      [null, `            ${k('for')} c ${k('in')} range(n):`],
      ['clash', `                ${k('if')} col[c] or diag[r - c + n - 1] or anti[r + c]:`],
      ['clash', `                    continue`],
      ['put', `                cols.append(c)`],
      ['put', `                col[c] = diag[r - c + n - 1] = anti[r + c] = True`],
      [null, `                place(r + 1)`],
      ['lift', `                cols.pop()`],
      ['lift', `                col[c] = diag[r - c + n - 1] = anti[r + c] = False`],
      [null, ``],
      [null, `        place(0)`],
      ['ret', `        ${k('return')} out`],
    ],
    javascript: [
      [null, `${k('const')} solveNQueens = ${k('function')} (n) {`],
      [null, `  ${k('const')} out = [], cols = [];`],
      ['init', `  ${k('const')} col = ${k('new')} Array(n).fill(false); ${c('// taken columns')}`],
      ['init', `  ${k('const')} diag = ${k('new')} Array(2 * n - 1).fill(false); ${c('// taken ↘ diagonals, by r - c + n - 1')}`],
      ['init', `  ${k('const')} anti = ${k('new')} Array(2 * n - 1).fill(false); ${c('// taken ↙ diagonals, by r + c')}`],
      [null, `  ${k('const')} place = (r) =&gt; {`],
      ['full', `    ${k('if')} (r === n) {`],
      ['full', `      out.push(cols.map((c) =&gt; '.'.repeat(c) + 'Q' + '.'.repeat(n - c - 1)));`],
      [null, `      ${k('return')};`],
      [null, `    }`],
      [null, `    ${k('for')} (${k('let')} c = 0; c &lt; n; c++) {`],
      ['clash', `      ${k('if')} (col[c] || diag[r - c + n - 1] || anti[r + c]) continue;`],
      ['put', `      cols.push(c);`],
      ['put', `      col[c] = diag[r - c + n - 1] = anti[r + c] = true;`],
      [null, `      place(r + 1);`],
      ['lift', `      cols.pop();`],
      ['lift', `      col[c] = diag[r - c + n - 1] = anti[r + c] = false;`],
      [null, `    }`],
      [null, `  };`],
      [null, `  place(0);`],
      ['ret', `  ${k('return')} out;`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} solveNQueens(n int) [][]string {`],
      [null, `    out := [][]string{}`],
      [null, `    cols := []int{}`],
      ['init', `    col := make([]bool, n)       ${c('// taken columns')}`],
      ['init', `    diag := make([]bool, 2*n-1)  ${c('// taken ↘ diagonals, by r - c + n - 1')}`],
      ['init', `    anti := make([]bool, 2*n-1)  ${c('// taken ↙ diagonals, by r + c')}`],
      [null, `    ${k('var')} place ${k('func')}(r int)`],
      [null, `    place = ${k('func')}(r int) {`],
      ['full', `        ${k('if')} r == n {`],
      [null, `            board := make([]string, n)`],
      [null, `            ${k('for')} i, c := ${k('range')} cols {`],
      ['full', `                board[i] = strings.Repeat(".", c) + "Q" + strings.Repeat(".", n-c-1)`],
      [null, `            }`],
      ['full', `            out = append(out, board)`],
      [null, `            ${k('return')}`],
      [null, `        }`],
      [null, `        ${k('for')} c := 0; c &lt; n; c++ {`],
      ['clash', `            ${k('if')} col[c] || diag[r-c+n-1] || anti[r+c] {`],
      ['clash', `                continue`],
      [null, `            }`],
      ['put', `            cols = append(cols, c)`],
      ['put', `            col[c], diag[r-c+n-1], anti[r+c] = true, true, true`],
      [null, `            place(r + 1)`],
      ['lift', `            cols = cols[:len(cols)-1]`],
      ['lift', `            col[c], diag[r-c+n-1], anti[r+c] = false, false, false`],
      [null, `        }`],
      [null, `    }`],
      [null, `    place(0)`],
      ['ret', `    ${k('return')} out`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} solve_n_queens(n: i32) -&gt; Vec&lt;Vec&lt;String&gt;&gt; {`],
      [null, `        struct Board {`],
      [null, `            n: usize,`],
      [null, `            cols: Vec&lt;usize&gt;,`],
      [null, `            col: Vec&lt;bool&gt;,  ${c('// taken columns')}`],
      [null, `            diag: Vec&lt;bool&gt;, ${c('// taken ↘ diagonals, by r - c + n - 1')}`],
      [null, `            anti: Vec&lt;bool&gt;, ${c('// taken ↙ diagonals, by r + c')}`],
      [null, `            out: Vec&lt;Vec&lt;String&gt;&gt;,`],
      [null, `        }`],
      [null, `        ${k('fn')} place(b: &amp;${k('mut')} Board, r: usize) {`],
      [null, `            ${k('let')} n = b.n;`],
      ['full', `            ${k('if')} r == n {`],
      ['full', `                ${k('let')} board = b.cols.iter().map(|&amp;c| ".".repeat(c) + "Q" + &amp;".".repeat(n - c - 1)).collect();`],
      ['full', `                b.out.push(board);`],
      [null, `                ${k('return')};`],
      [null, `            }`],
      [null, `            ${k('for')} c ${k('in')} 0..n {`],
      ['clash', `                ${k('if')} b.col[c] || b.diag[r + n - 1 - c] || b.anti[r + c] {`],
      ['clash', `                    continue;`],
      [null, `                }`],
      ['put', `                b.cols.push(c);`],
      ['put', `                (b.col[c], b.diag[r + n - 1 - c], b.anti[r + c]) = (true, true, true);`],
      [null, `                place(b, r + 1);`],
      ['lift', `                b.cols.pop();`],
      ['lift', `                (b.col[c], b.diag[r + n - 1 - c], b.anti[r + c]) = (false, false, false);`],
      [null, `            }`],
      [null, `        }`],
      [null, `        ${k('let')} n = n as usize;`],
      ['init', `        ${k('let')} ${k('mut')} b = Board { n, cols: vec![], col: vec![false; n], diag: vec![false; 2 * n - 1], anti: vec![false; 2 * n - 1], out: vec![] };`],
      [null, `        place(&amp;${k('mut')} b, 0);`],
      ['ret', `        b.out`],
      [null, `    }`],
      [null, `}`],
    ],
  },
};

/* ---------------- part 1: the "diagonal numbers" widget ----------------
 *
 * Click squares to place or lift queens on a 6 × 6 board. Every square a
 * queen attacks fades, and two queens that attack each other turn amber. The
 * ledger names the last square's column and both diagonals: every square on
 * a ↘ diagonal has the same r − c, every square on a ↙ diagonal the same r + c. */

const QW_N = 6;
const QW_SETS = [
  { label: t('empty board', 'board ဗလာ'), cols: [] },
  { label: t('a solution', 'အဖြေတစ်ခု'), cols: [1, 3, 5, 0, 2, 4] },
  { label: t('a clash', 'တိုက်ခြင်း'), cols: [0, null, 2, null, null, null] },
];

function mountDiagWidget(host) {
  const state = { set: 0, q: new Map(), last: [2, 3] };
  const load = (i) => { state.set = i; state.q = new Map(QW_SETS[i].cols.map((cc, r) => [r, cc]).filter(([, cc]) => cc != null)); };
  load(0);
  host.innerHTML = `
    <div class="nq-w" data-board></div>
    <div class="q-slider"><span class="q-presets" data-presets></span></div>
    <p class="q-tie" data-line></p>
    <div class="ledger">
      <span class="expr" data-expr></span>
      <span class="total" data-total></span>
    </div>`;
  const q = (sel) => host.querySelector(sel);
  const queens = () => [...state.q.entries()];
  const hits = (r1, c1, r2, c2) => c1 === c2 || r1 - c1 === r2 - c2 || r1 + c1 === r2 + c2;

  function render() {
    const qs = queens();
    const clash = new Set();
    qs.forEach(([r1, c1], i) => qs.forEach(([r2, c2], j) => { if (i !== j && hits(r1, c1, r2, c2)) clash.add(r1); }));
    const [lr, lc] = state.last;
    q('[data-board]').innerHTML = Array.from({ length: QW_N }, (_, r) => `<div class="q-arr">${Array.from({ length: QW_N }, (_, cc) => {
      const has = state.q.get(r) === cc;
      const under = !has && qs.some(([qr, qc]) => qr !== r && hits(qr, qc, r, cc));
      const onLast = !has && (r - cc === lr - lc || r + cc === lr + lc);
      const cls = has ? (clash.has(r) ? 'kept picked amber' : 'kept') : under ? 'cut' : '';
      return `<div class="cell ${cls}${onLast ? ' nq-diag' : ''}" role="button" tabindex="0" data-r="${r}" data-c="${cc}" aria-label="row ${r}, column ${cc}${has ? ', queen' : ''}"><span>${has ? 'Q' : '·'}</span><span class="idx">${r - cc},${r + cc}</span></div>`;
    }).join('')}</div>`).join('');
    q('[data-presets]').innerHTML = presetChips(QW_SETS, state.set);
    widgetLabel(pick(t('click to place or lift · corner: r − c, r + c', 'queen ထား/ဖယ်ရန် နှိပ် · ထောင့်: r − c, r + c')));
    const safe = qs.length - clash.size;
    q('[data-line]').innerHTML = pick(clash.size
      ? t(`${clash.size} queens attack each other (amber). Two queens clash when they share a column, the same r − c (↘) or the same r + c (↙).`,
          `queen ${clash.size} ခု အချင်းချင်း တိုက်သည် (ဝါ)။ queen နှစ်ခုသည် column တူလျှင်၊ r − c (↘) တူလျှင် သို့မဟုတ် r + c (↙) တူလျှင် တိုက်သည်။`)
      : qs.length === QW_N
        ? t(`${QW_N} queens and no two attack: a solution. It is one of 4 for a 6 × 6 board.`, `queen ${QW_N} ခု၊ တစ်ခုက တစ်ခုကို မတိုက် — အဖြေတစ်ခု။ 6 × 6 board အတွက် 4 ခုအနက် တစ်ခု။`)
        : t('No clashes. Faded squares are attacked; the outlined ones share a diagonal with the last square clicked — look at their corner numbers.',
            'တိုက်ခြင်း မရှိ။ မှိန်နေသော နေရာများ တိုက်ခံရသည် — ဘောင်ခတ်ထားသည်များသည် နောက်ဆုံးနှိပ်ခဲ့သော နေရာနှင့် diagonal တူသည် — ၎င်းတို့၏ ထောင့်ဂဏန်းကို ကြည့်ပါ။'));
    q('[data-expr]').innerHTML = `${sq(lr, lc)}: col ${lc} · ↘ r − c = ${lr - lc} · ↙ r + c = ${lr + lc}`;
    q('[data-total]').innerHTML = `${safe}<small>${pick(t(`of ${QW_N} queens safe`, `queen ${QW_N} အနက် လုံခြုံ`))}</small>`;
  }
  function toggle(el) {
    const r = Number(el.dataset.r), cc = Number(el.dataset.c);
    if (state.q.get(r) === cc) state.q.delete(r); else state.q.set(r, cc);
    state.last = [r, cc];
    render();
    host.querySelector(`[data-r="${r}"][data-c="${cc}"]`)?.focus();
  }
  host.addEventListener('click', (ev) => {
    const chip = ev.target.closest('[data-set]');
    if (chip) { load(Number(chip.dataset.set)); return render(); }
    const cell = ev.target.closest('[data-r]');
    if (cell) toggle(cell);
  });
  host.addEventListener('keydown', (ev) => {
    const cell = ev.target.closest('[data-r]');
    if (cell && (ev.key === 'Enter' || ev.key === ' ')) { ev.preventDefault(); toggle(cell); }
  });
  onLangChange(render);
  render();
}

/* ---------------- the approach, in brief ---------------- */

const APPROACH = {
  scan: {
    idea: t('Place one queen per row. For each column in row r, scan the queens already placed; if none shares the column or a diagonal, place it, solve the next row, then lift it.',
            'row တစ်ခုလျှင် queen တစ်ခု ထားသည်။ row r ရှိ column တစ်ခုစီအတွက် ထားပြီးသော queen များကို scan — column သို့မဟုတ် diagonal မတူလျှင် ထား၊ နောက် row ကို ဖြေရှင်း၊ ပြီးမှ ဖယ်သည်။'),
    steps: [
      t('<code>r == n</code>: every row has a queen — write the board from <code>cols</code>.', '<code>r == n</code> — row တိုင်းတွင် queen ရှိ — <code>cols</code> မှ board ကို ရေးသည်။'),
      t('<code>safe(r, c)</code>: for each earlier queen <code>(pr, pc)</code>, same column or <code>|pc − c| == r − pr</code> means attacked.', '<code>safe(r, c)</code> — အရင် queen <code>(pr, pc)</code> တစ်ခုစီအတွက် column တူ သို့မဟုတ် <code>|pc − c| == r − pr</code> ဆိုလျှင် တိုက်ခံရသည်။'),
      t('Safe: push <code>c</code>, recurse on <code>r + 1</code>, pop.', 'လုံခြုံလျှင် — <code>c</code> push၊ <code>r + 1</code> ပေါ် recurse၊ pop။'),
    ],
    cost: t('Each square tried costs a scan of up to n − 1 queens. At n = 9 the search tries 72,378 squares and makes 243,009 comparisons (counted).',
            'စမ်းသော နေရာတိုင်းသည် queen n − 1 အထိ scan ကုန်ကျသည်။ n = 9 တွင် ရှာဖွေမှုသည် နေရာ 72,378 ခု စမ်းပြီး နှိုင်းယှဉ်ခြင်း 243,009 လုပ်သည် (ရေတွက်ထားသည်)။'),
  },
  sets: {
    idea: t('The same search, but remember which columns and diagonals are taken. Squares on one ↘ diagonal share r − c, on one ↙ diagonal share r + c, so three arrays of flags answer "is this square attacked?" at once.',
            'ရှာဖွေမှု အတူတူ၊ သို့သော် မည်သည့် column နှင့် diagonal များ ယူထားပြီးလဲ မှတ်သည်။ ↘ diagonal တစ်ခုပေါ်ရှိ နေရာများသည် r − c တူ၊ ↙ diagonal တစ်ခုပေါ်ရှိသည်များ r + c တူသဖြင့် flag array သုံးခုက "ဤနေရာ တိုက်ခံရသလား" ကို ချက်ချင်း ဖြေသည်။'),
    steps: [
      t('<code>col</code>, <code>diag</code>, <code>anti</code> start all false.', '<code>col</code>၊ <code>diag</code>၊ <code>anti</code> အားလုံး false ဖြင့် စသည်။'),
      t('Square <code>(r, c)</code> is attacked if <code>col[c]</code>, <code>diag[r − c + n − 1]</code> or <code>anti[r + c]</code> is set.', '<code>col[c]</code>၊ <code>diag[r − c + n − 1]</code> သို့မဟုတ် <code>anti[r + c]</code> သတ်မှတ်ထားလျှင် နေရာ <code>(r, c)</code> တိုက်ခံရသည်။'),
      t('Place: set all three, recurse, then clear all three.', 'ထား — သုံးခုလုံး သတ်မှတ်၊ recurse၊ ပြီးမှ သုံးခုလုံး ရှင်း။'),
    ],
    cost: t('Every try is one O(1) check: 72,378 at n = 9 instead of 243,009 comparisons. The search itself is the same size — this makes each step cheaper, not the search smaller.',
            'စမ်းခြင်းတိုင်းသည် O(1) စစ်ခြင်း တစ်ကြိမ် — n = 9 တွင် နှိုင်းယှဉ်ခြင်း 243,009 အစား 72,378။ ရှာဖွေမှု အရွယ်အစား အတူတူ — ၎င်းက အဆင့်တစ်ခုစီကို သက်သာစေသည်၊ ရှာဖွေမှုကို မသေးစေပါ။'),
  },
};

/* ---------------- mount ---------------- */

mountLesson({
  input: { n: 4 },
  controls: [
    { key: 'n', label: 'n', type: 'number', min: 1, max: MAX_N, value: 4, parse: intValue({ lo: 1, hi: MAX_N, why: 'n = 6 already takes hundreds of steps' }) },
  ],
  presets: [
    { label: t('Example 1: n = 4', 'ဥပမာ 1 — n = 4'), input: { n: 4 } },
    { label: t('Example 2: n = 1', 'ဥပမာ 2 — n = 1'), input: { n: 1 } },
    { label: t('n = 3: none', 'n = 3 — မရှိ'), input: { n: 3 } },
    { label: t('n = 5', 'n = 5'), input: { n: 5 } },
  ],
  examples: [
    { title: t('Example 1', 'ဥပမာ 1'), inputHtml: '<code>n = 4</code>', output: '[[".Q..","...Q","Q...","..Q."],["..Q.","Q...","...Q",".Q.."]]',
      why: [t('Two boards: queens in columns 1, 3, 0, 2 row by row, and its mirror image 2, 0, 3, 1.', 'board နှစ်ခု — row အလိုက် column 1, 3, 0, 2 တွင် queen များ၊ နှင့် ၎င်း၏ မှန်ပြောင်း 2, 0, 3, 1။')],
      load: { n: 4 } },
    { title: t('Example 2', 'ဥပမာ 2'), inputHtml: '<code>n = 1</code>', output: '[["Q"]]',
      why: [t('One square, one queen.', 'နေရာ တစ်ခု၊ queen တစ်ခု။')], load: { n: 1 } },
  ],
  modes: [
    { id: 'scan', name: 'Scan the queens above',
      sub: t('backtracking', 'backtracking'),
      desc: t('Check each square against every queen already placed.', 'နေရာတစ်ခုစီကို ထားပြီးသော queen တိုင်းနှင့် စစ်။'),
      cost: 'O(n!) search · O(n) per try', build: build('scan') },
    { id: 'sets', name: 'Column and diagonal flags',
      sub: t('backtracking', 'backtracking'),
      desc: t('Three arrays say which columns and diagonals are taken.', 'array သုံးခုက မည်သည့် column နှင့် diagonal များ ယူထားပြီးလဲ ပြောသည်။'),
      cost: 'O(n!) search · O(1) per try', build: build('sets') },
  ],
  languages: LANGUAGES,
  code: CODE,
  solutions: {
    scan: { approach: APPROACH.scan,
      desc: t('The search written plainly: one queen per row, each square checked against the queens above it.', 'ရှာဖွေမှုကို ရိုးရိုး ရေးထားခြင်း — row တစ်ခုလျှင် queen တစ်ခု၊ နေရာတစ်ခုစီကို အပေါ်ရှိ queen များနှင့် စစ်သည်။') },
    sets: { approach: APPROACH.sets,
      desc: t('The version worth writing: r − c and r + c name the diagonals, so a square is checked in three lookups. Clear the flags when you lift the queen.',
              'ရေးသင့်သည့် version — r − c နှင့် r + c က diagonal များကို အမည်ပေးသဖြင့် နေရာတစ်ခုကို lookup သုံးကြိမ်ဖြင့် စစ်သည်။ queen ကို ဖယ်သည့်အခါ flag များကို ရှင်းပါ။') },
  },
  // How each language was actually checked, printed as the part 3 badges.
  // The constraint allows n = 1 to 9, so the corpus is all nine, checked
  // against an oracle that filters every permutation of the columns. Each
  // driver sorts the boards, since any order is accepted. Go and Rust ran in
  // Docker (golang:1.23-alpine, rust:1-slim).
  verification: {
    ruby: 'ran here · every n from 1 to 9',
    python: 'ran here · every n from 1 to 9',
    javascript: 'ran here · every n from 1 to 9',
    go: 'ran here · every n from 1 to 9 · Go 1.23',
    rust: 'ran here · every n from 1 to 9 · rustc 1.98',
  },
  stripLabel: t('cols — the column of each row\'s queen', 'cols — row တစ်ခုစီ၏ queen ရှိ column'),
  strip,
  draw,
  answer,
  vars,
  widget: mountDiagWidget,
});
