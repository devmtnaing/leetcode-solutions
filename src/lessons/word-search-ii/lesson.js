/* Word Search II — LeetCode 212.
 *
 * Searching the board once per word repeats the same walks: every word that
 * starts "oa" re-explores every "oa" path. Put the words in a trie instead
 * and walk the board once from each cell, following the trie as you go: a
 * path stops the moment no word continues it, a node with a word marks a
 * find, and a branch whose words are all found is cut off so it is never
 * walked again.
 */
import { mountLesson } from '../../lib/stepper.js';
import { pick, onLangChange } from '../../lib/i18n.js';
import { cells, slots, stagePanel, readout, trieOutline } from '../../lib/stage.js';
import { t, LANGUAGES, k, c, labelledRows, stageRow, stageGap, presetChips, widgetLabel } from '../../lib/kit.js';

const MAX_SIDE = 4, MAX_WORDS = 5, MAX_LEN = 6;
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

function parseBoard(text) {
  const rows = String(text).split(/[;\n,\s]+/).map((r) => r.trim()).filter(Boolean);
  if (!rows.length || rows.some((r) => !/^[a-z]+$/.test(r))) throw new Error('rows of lowercase letters, like oaan; etae');
  if (rows.some((r) => r.length !== rows[0].length)) throw new Error('every row the same length');
  if (rows.length > MAX_SIDE || rows[0].length > MAX_SIDE) throw new Error(`at most ${MAX_SIDE} × ${MAX_SIDE}, so the stage stays readable`);
  return rows;
}
function parseWords(text) {
  const ws = String(text).split(/[,\s]+/).map((w) => w.trim().replace(/^"|"$/g, '')).filter(Boolean);
  if (!ws.length || ws.some((w) => !/^[a-z]+$/.test(w))) throw new Error('lowercase words, like oath, eat');
  if (ws.length > MAX_WORDS) throw new Error(`at most ${MAX_WORDS} words, so the stage stays readable`);
  if (ws.some((w) => w.length > MAX_LEN)) throw new Error(`words up to ${MAX_LEN} letters`);
  if (new Set(ws).size !== ws.length) throw new Error('each word only once');
  return ws;
}
const fmtBoard = (b) => b.join('; ');
const fmtWords = (ws) => ws.join(', ');
const cell = (r, cc) => `(${r},${cc})`;
const inside = (b, r, cc) => r >= 0 && r < b.length && cc >= 0 && cc < b[0].length;

/* ---------------- step generators ---------------- */

function buildEach({ board: input, words }) {
  const b = input.map((r) => r.split(''));
  const found = [];
  const steps = [];
  const snap = (extra) => ({ view: 'each', board: b.map((r) => r.join('')), found: [...found], word: null, k: null, at: null, path: [], ...extra });

  function match(r, cc, w, k, path) {
    const here = [...path, [r, cc]];
    if (b[r][cc] !== w[k]) {
      steps.push(snap({ line: 'miss', word: w, k, at: [r, cc], path, miss: true, tag: t(`${cell(r, cc)} ≠ '${w[k]}'`, `${cell(r, cc)} ≠ '${w[k]}'`),
        note: t(`"${w}" needs '${w[k]}' next; ${cell(r, cc)} holds '${b[r][cc]}'${b[r][cc] === '#' ? ' — already used on this path' : ''}. Dead end.`,
                `"${w}" သည် နောက်တွင် '${w[k]}' လိုသည် — ${cell(r, cc)} တွင် '${b[r][cc]}' ရှိသည်${b[r][cc] === '#' ? ' — ဤလမ်းကြောင်းတွင် သုံးပြီးသား' : ''}။ လမ်းဆုံး။`) }));
      return false;
    }
    if (k === w.length - 1) {
      steps.push(snap({ line: 'hit', word: w, k, at: [r, cc], path: here, tag: t(`"${w}" found`, `"${w}" တွေ့`),
        note: t(`'${w[k]}' at ${cell(r, cc)} is the last letter: "${w}" is on the board.`, `${cell(r, cc)} ရှိ '${w[k]}' သည် နောက်ဆုံး စာလုံး — "${w}" သည် board ပေါ်တွင် ရှိသည်။`) }));
      return true;
    }
    b[r][cc] = '#';
    steps.push(snap({ line: 'mark', word: w, k, at: [r, cc], path: here, tag: t(`'${w[k]}' ✓`, `'${w[k]}' ✓`),
      note: t(`${cell(r, cc)} is '${w[k]}', letter ${k + 1} of "${w}". Mark it used and look for '${w[k + 1]}' next door.`,
              `${cell(r, cc)} သည် '${w[k]}'၊ "${w}" ၏ စာလုံး ${k + 1}။ သုံးပြီးဟု မှတ်ပြီး ဘေးတွင် '${w[k + 1]}' ကို ရှာသည်။`) }));
    let ok = false;
    for (const [dr, dc] of DIRS) {
      const x = r + dr, y = cc + dc;
      if (inside(b, x, y) && match(x, y, w, k + 1, here)) { ok = true; break; }
    }
    b[r][cc] = w[k];
    steps.push(snap({ line: 'unmark', word: w, k, at: [r, cc], path, tag: t(`free ${cell(r, cc)}`, `${cell(r, cc)} ပြန်ဖွင့်`),
      note: t(`Put '${w[k]}' back at ${cell(r, cc)}${ok ? '' : ': no neighbour continued the word'}.`, `${cell(r, cc)} တွင် '${w[k]}' ကို ပြန်ထားသည်${ok ? '' : ' — မည်သည့် ဘေးကမျှ word ကို မဆက်ပါ'}။`) }));
    return ok;
  }

  for (const w of words) {
    steps.push(snap({ line: 'start', word: w, tag: t(`search "${w}"`, `"${w}" ရှာ`),
      note: t(`Search the whole board for "${w}", trying every cell as its first letter.`, `"${w}" အတွက် board တစ်ခုလုံးကို ရှာသည် — cell တိုင်းကို ပထမ စာလုံးအဖြစ် စမ်းသည်။`) }));
    let on = false;
    for (let r = 0; r < b.length && !on; r++) for (let cc = 0; cc < b[0].length && !on; cc++) on = match(r, cc, w, 0, []);
    if (on) {
      found.push(w);
      steps.push(snap({ line: 'add', word: w, tag: t(`add "${w}"`, `"${w}" ထည့်`),
        note: t(`"${w}" goes in the answer. The next word starts a fresh search of the whole board.`, `"${w}" သည် အဖြေထဲ ဝင်သည်။ နောက် word သည် board တစ်ခုလုံးကို အသစ်ပြန်ရှာသည်။`) }));
    } else {
      steps.push(snap({ line: 'start', word: w, tag: t(`no "${w}"`, `"${w}" မရှိ`),
        note: t(`No start cell led to "${w}": it is not on the board.`, `မည်သည့် အစ cell ကမျှ "${w}" သို့ မရောက် — board ပေါ်တွင် မရှိ။`) }));
    }
  }
  steps.push(snap({ line: 'ret', finished: true, tag: t(`${found.length} found`, `${found.length} ခု တွေ့`),
    note: t(`${words.length} separate searches of the board: found ${found.length ? found.map((w) => `"${w}"`).join(', ') : 'nothing'}.`,
            `board ကို သီးခြား ရှာဖွေမှု ${words.length} ကြိမ် — ${found.length ? found.map((w) => `"${w}"`).join('၊ ') : 'ဘာမှ မ'}တွေ့သည်။`) }));
  return steps;
}

function buildTrie({ board: input, words }) {
  const b = input.map((r) => r.split(''));
  const nodes = new Set(['']);
  const wordAt = new Map();            // prefix → the word ending there, until found
  const found = [];
  const steps = [];
  const snap = (extra) => ({ view: 'trie', board: b.map((r) => r.join('')), nodes: [...nodes], ends: [...wordAt.keys()], found: [...found],
    at: null, pre: null, miss: null, path: [], ...extra });

  for (const w of words) {
    for (let i = 1; i <= w.length; i++) nodes.add(w.slice(0, i));
    wordAt.set(w, w);
    steps.push(snap({ line: 'build', pre: w, tag: t(`insert "${w}"`, `"${w}" ထည့်`),
      note: t(`Insert "${w}" into the trie and store the word on its last node.`, `"${w}" ကို trie ထဲ ထည့်ပြီး word ကို ၎င်း၏ နောက်ဆုံး node တွင် သိမ်းသည်။`) }));
  }

  function dfs(r, cc, parent, path) {
    const ch = b[r][cc];
    const pre = parent + ch;
    if (!nodes.has(pre)) {
      steps.push(snap({ line: 'miss', at: [r, cc], pre: parent, miss: ch === '#' ? null : pre, path, tag: t(`no "${pre}"`, `"${pre}" မရှိ`),
        note: t(`${cell(r, cc)} is '${ch}': no word starts "${pre}", so this path stops here — every word at once.`,
                `${cell(r, cc)} သည် '${ch}' — "${pre}" ဖြင့် စသော word မရှိသဖြင့် ဤလမ်းကြောင်း ဤနေရာတွင် ရပ်သည် — word အားလုံးအတွက် တစ်ပြိုင်နက်။`) }));
      return;
    }
    const here = [...path, [r, cc]];
    steps.push(snap({ line: 'step', at: [r, cc], pre, path: here, tag: t(`→ "${pre}"`, `→ "${pre}"`),
      note: t(`${cell(r, cc)} is '${ch}': the trie has a node for "${pre}", so some word continues this path.`,
              `${cell(r, cc)} သည် '${ch}' — trie တွင် "${pre}" အတွက် node ရှိသဖြင့် word တစ်ခုခုသည် ဤလမ်းကြောင်းကို ဆက်သည်။`) }));
    if (wordAt.has(pre)) {
      found.push(wordAt.get(pre));
      wordAt.delete(pre);
      steps.push(snap({ line: 'hit', at: [r, cc], pre, path: here, tag: t(`"${pre}" found`, `"${pre}" တွေ့`),
        note: t(`This node holds "${pre}": add it to the answer and clear it, so another path spelling it is not counted twice. Keep going — a longer word may continue.`,
                `ဤ node တွင် "${pre}" ရှိသည် — အဖြေထဲ ထည့်ပြီး ရှင်းသည်၊ ထို့ကြောင့် ၎င်းကို စာလုံးပေါင်းသော အခြားလမ်းကြောင်းကို နှစ်ကြိမ် မရေတွက်။ ဆက်သွား — ပိုရှည်သော word ဆက်နိုင်သည်။`) }));
    }
    b[r][cc] = '#';
    steps.push(snap({ line: 'mark', at: [r, cc], pre, path: here, tag: t(`mark ${cell(r, cc)}`, `${cell(r, cc)} မှတ်`),
      note: t(`Mark ${cell(r, cc)} used on this path and try its neighbours.`, `${cell(r, cc)} ကို ဤလမ်းကြောင်းတွင် သုံးပြီးဟု မှတ်ပြီး ဘေးများကို စမ်းသည်။`) }));
    for (const [dr, dc] of DIRS) {
      const x = r + dr, y = cc + dc;
      if (inside(b, x, y) && b[x][y] !== '#') dfs(x, y, pre, here);
    }
    b[r][cc] = ch;
    steps.push(snap({ line: 'unmark', at: [r, cc], pre, path: here, tag: t(`free ${cell(r, cc)}`, `${cell(r, cc)} ပြန်ဖွင့်`),
      note: t(`Every path through ${cell(r, cc)} as "${pre}" is explored. Put '${ch}' back.`, `"${pre}" အဖြစ် ${cell(r, cc)} ကို ဖြတ်သော လမ်းကြောင်းတိုင်း ရှာပြီး။ '${ch}' ကို ပြန်ထားသည်။`) }));
    const hasKids = [...nodes].some((p) => p.length === pre.length + 1 && p.startsWith(pre));
    if (!hasKids && !wordAt.has(pre)) {
      nodes.delete(pre);
      steps.push(snap({ line: 'prune', at: [r, cc], pre: parent, path, tag: t(`prune "${pre}"`, `"${pre}" ဖြတ်`),
        note: t(`The node for "${pre}" has no children left and no unfound word: cut it off, so no later path walks into it again.`,
                `"${pre}" ၏ node တွင် child မကျန်၊ မတွေ့ရသေးသော word မရှိ — ဖြတ်ပစ်သည်၊ ထို့ကြောင့် နောက်ပိုင်း လမ်းကြောင်း ၎င်းထဲ ပြန်မဝင်။`) }));
    }
  }

  for (let r = 0; r < b.length; r++) for (let cc = 0; cc < b[0].length; cc++) dfs(r, cc, '', []);
  steps.push(snap({ line: 'ret', finished: true, tag: t(`${found.length} found`, `${found.length} ခု တွေ့`),
    note: t(`One walk from each cell, all words at once: found ${found.length ? found.map((w) => `"${w}"`).join(', ') : 'nothing'}.`,
            `cell တစ်ခုစီမှ လျှောက်ခြင်း တစ်ကြိမ်၊ word အားလုံး တစ်ပြိုင်နက် — ${found.length ? found.map((w) => `"${w}"`).join('၊ ') : 'ဘာမှ မ'}တွေ့သည်။`) }));
  return steps;
}

/* ---------------- drawing ----------------
 *
 * The strip card is the board as the code holds it: '#' where the current
 * path has used a cell, the cell being looked at lit, a dead end red. The
 * stage is what guides the walk: the word being matched, or the trie — its
 * rows shrink as found branches are pruned. */

function strip(s) {
  const on = new Set(s.path.map(([r, cc]) => `${r},${cc}`));
  return `<div class="ws">${labelledRows(s.board.map((row, r) => [`${r}`, cells(row.split(''), {
    tone: Object.fromEntries(row.split('').map((_, cc) => [cc,
      s.at && s.at[0] === r && s.at[1] === cc ? (s.line === 'miss' ? 'leaving' : s.line === 'hit' ? 'entering' : 'inwin')
        : on.has(`${r},${cc}`) ? 'entering' : null]).filter(([, x]) => x)),
  })]))}</div>`;
}

function draw(s) {
  if (s.view === 'each') {
    const w = s.word ?? '';
    return (w ? stagePanel(pick(t('The word being searched', 'ရှာနေသော word')), '', stageRow(cells(w.split(''), {
      tone: s.k == null ? {} : Object.fromEntries(w.split('').map((_, i) => [i, i < s.k ? 'entering' : i === s.k ? (s.line === 'miss' ? 'leaving' : 'inwin') : null]).filter(([, x]) => x)),
    }), '')) + stageGap : '') + readout({ found: s.found.length ? s.found.join(', ') : '—' });
  }
  return stagePanel(pick(t('The trie', 'Trie')), pick(t(`${s.nodes.length} nodes · ${s.ends.length} words to find`, `node ${s.nodes.length} · ရှာရန် word ${s.ends.length}`)),
    trieOutline({ nodes: s.nodes, ends: s.ends, at: s.pre, miss: s.miss, endLabel: pick(t('word', 'word')) }))
    + stageGap + readout({ found: s.found.length ? s.found.join(', ') : '—' });
}

function answer(s, { words }) {
  return {
    html: slots(s.found.map((w) => `"${w}"`), { total: words.length }),
    note: s.finished ? t('the words on the board', 'board ပေါ်ရှိ word များ') : t('found so far', 'ယခုထိ တွေ့'),
  };
}

function vars(s, { words }) {
  const out = [['board', `[${s.board.map((r) => `"${r}"`).join(', ')}]`], ['words', `[${words.map((w) => `"${w}"`).join(', ')}]`], ['found', `[${s.found.join(', ')}]`]];
  if (s.at) out.push(['r', s.at[0]], ['c', s.at[1]], ['ch', `'${s.board[s.at[0]][s.at[1]]}'`]);
  if (s.view === 'each') {
    if (s.word) out.push(['w', `"${s.word}"`]);
    if (s.k != null) out.push(['k', s.k]);
  } else {
    if (s.pre != null) out.push(['node', `node for "${s.pre}"`], ['parent', `node for "${s.pre.slice(0, -1)}"`]);
    out.push(['root', `node for "" · ${s.nodes.length - 1} below`]);
  }
  return out;
}

/* ---------------- the code, one key per line ----------------
 *
 * Generated from the verified solution files, so the listing a reader copies
 * is byte-identical to the one that ran. */

const CODE = {
  each: {
    ruby: [
      [null, `${k('def')} find_words(board, words)`],
      [null, `  m, n = board.length, board[0].length`],
      [null, `  match = lambda ${k('do')} |r, c, w, k|`],
      ['miss', `    ${k('return')} false ${k('if')} board[r][c] != w[k]`],
      ['hit', `    ${k('return')} true ${k('if')} k == w.length - 1`],
      ['mark', `    board[r][c] = '${c('#\' # used in this path')}`],
      [null, `    ok = [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]].any? ${k('do')} |x, y|`],
      [null, `      x &gt;= 0 &amp;&amp; x &lt; m &amp;&amp; y &gt;= 0 &amp;&amp; y &lt; n &amp;&amp; match.(x, y, w, k + 1)`],
      [null, `    ${k('end')}`],
      ['unmark', `    board[r][c] = w[k]`],
      [null, `    ok`],
      [null, `  ${k('end')}`],
      [null, `  found = []`],
      [null, `  words.each ${k('do')} |w|`],
      ['start', `    next ${k('unless')} (0...m).any? { |r| (0...n).any? { |c| match.(r, c, w, 0) } }`],
      ['add', `    found &lt;&lt; w`],
      [null, `  ${k('end')}`],
      ['ret', `  found`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} findWords(self, board, words):`],
      [null, `        m, n = len(board), len(board[0])`],
      [null, ``],
      [null, `        ${k('def')} match(r, c, w, k):`],
      ['miss', `            ${k('if')} board[r][c] != w[k]:`],
      ['miss', `                ${k('return')} False`],
      ['hit', `            ${k('if')} k == len(w) - 1:`],
      ['hit', `                ${k('return')} True`],
      ['mark', `            board[r][c] = '${c('#\'                 # used in this path')}`],
      [null, `            ok = False`],
      [null, `            ${k('for')} x, y ${k('in')} ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):`],
      [null, `                ${k('if')} 0 &lt;= x &lt; m and 0 &lt;= y &lt; n and match(x, y, w, k + 1):`],
      [null, `                    ok = True`],
      [null, `                    break`],
      ['unmark', `            board[r][c] = w[k]`],
      [null, `            ${k('return')} ok`],
      [null, ``],
      [null, `        found = []`],
      [null, `        ${k('for')} w ${k('in')} words:`],
      ['start', `            ${k('if')} any(match(r, c, w, 0) ${k('for')} r ${k('in')} range(m) ${k('for')} c ${k('in')} range(n)):`],
      ['add', `                found.append(w)`],
      ['ret', `        ${k('return')} found`],
    ],
    javascript: [
      [null, `${k('const')} findWords = ${k('function')} (board, words) {`],
      [null, `  ${k('const')} m = board.length, n = board[0].length;`],
      [null, `  ${k('const')} match = (r, c, w, k) =&gt; {`],
      ['miss', `    ${k('if')} (board[r][c] !== w[k]) ${k('return')} false;`],
      ['hit', `    ${k('if')} (k === w.length - 1) ${k('return')} true;`],
      ['mark', `    board[r][c] = '#'; ${c('// used in this path')}`],
      [null, `    ${k('let')} ok = false;`],
      [null, `    ${k('for')} (${k('const')} [x, y] ${k('of')} [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]) {`],
      [null, `      ${k('if')} (x &gt;= 0 &amp;&amp; x &lt; m &amp;&amp; y &gt;= 0 &amp;&amp; y &lt; n &amp;&amp; match(x, y, w, k + 1)) { ok = true; break; }`],
      [null, `    }`],
      ['unmark', `    board[r][c] = w[k];`],
      [null, `    ${k('return')} ok;`],
      [null, `  };`],
      [null, `  ${k('const')} found = [];`],
      [null, `  ${k('for')} (${k('const')} w ${k('of')} words) {`],
      [null, `    ${k('let')} on = false;`],
      ['start', `    ${k('for')} (${k('let')} r = 0; r &lt; m &amp;&amp; !on; r++) ${k('for')} (${k('let')} c = 0; c &lt; n &amp;&amp; !on; c++) on = match(r, c, w, 0);`],
      ['add', `    ${k('if')} (on) found.push(w);`],
      [null, `  }`],
      ['ret', `  ${k('return')} found;`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} findWords(board [][]byte, words []string) []string {`],
      [null, `    m, n := len(board), len(board[0])`],
      [null, `    ${k('var')} match ${k('func')}(r, c int, w string, k int) bool`],
      [null, `    match = ${k('func')}(r, c int, w string, k int) bool {`],
      ['miss', `        ${k('if')} board[r][c] != w[k] {`],
      ['miss', `            ${k('return')} false`],
      [null, `        }`],
      ['hit', `        ${k('if')} k == len(w)-1 {`],
      ['hit', `            ${k('return')} true`],
      [null, `        }`],
      ['mark', `        board[r][c] = '#' ${c('// used in this path')}`],
      [null, `        ok := false`],
      [null, `        ${k('for')} _, d := ${k('range')} [4][2]int{{r + 1, c}, {r - 1, c}, {r, c + 1}, {r, c - 1}} {`],
      [null, `            x, y := d[0], d[1]`],
      [null, `            ${k('if')} x &gt;= 0 &amp;&amp; x &lt; m &amp;&amp; y &gt;= 0 &amp;&amp; y &lt; n &amp;&amp; match(x, y, w, k+1) {`],
      [null, `                ok = true`],
      [null, `                break`],
      [null, `            }`],
      [null, `        }`],
      ['unmark', `        board[r][c] = w[k]`],
      [null, `        ${k('return')} ok`],
      [null, `    }`],
      [null, `    found := []string{}`],
      [null, `    ${k('for')} _, w := ${k('range')} words {`],
      [null, `        on := false`],
      [null, `        ${k('for')} r := 0; r &lt; m &amp;&amp; !on; r++ {`],
      [null, `            ${k('for')} c := 0; c &lt; n &amp;&amp; !on; c++ {`],
      ['start', `                on = match(r, c, w, 0)`],
      [null, `            }`],
      [null, `        }`],
      [null, `        ${k('if')} on {`],
      ['add', `            found = append(found, w)`],
      [null, `        }`],
      [null, `    }`],
      ['ret', `    ${k('return')} found`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} find_words(${k('mut')} board: Vec&lt;Vec&lt;char&gt;&gt;, words: Vec&lt;String&gt;) -&gt; Vec&lt;String&gt; {`],
      [null, `        ${k('fn')} matches(board: &amp;${k('mut')} Vec&lt;Vec&lt;char&gt;&gt;, r: usize, c: usize, w: &amp;[char], k: usize) -&gt; bool {`],
      ['miss', `            ${k('if')} board[r][c] != w[k] {`],
      ['miss', `                ${k('return')} false;`],
      [null, `            }`],
      ['hit', `            ${k('if')} k == w.len() - 1 {`],
      ['hit', `                ${k('return')} true;`],
      [null, `            }`],
      ['mark', `            board[r][c] = '#'; ${c('// used in this path')}`],
      [null, `            ${k('let')} (m, n) = (board.len(), board[0].len());`],
      [null, `            ${k('let')} ${k('mut')} ok = false;`],
      [null, `            ${k('for')} (x, y) ${k('in')} [(r + 1, c), (r.wrapping_sub(1), c), (r, c + 1), (r, c.wrapping_sub(1))] {`],
      [null, `                ${k('if')} x &lt; m &amp;&amp; y &lt; n &amp;&amp; matches(board, x, y, w, k + 1) {`],
      [null, `                    ok = true;`],
      [null, `                    break;`],
      [null, `                }`],
      [null, `            }`],
      ['unmark', `            board[r][c] = w[k];`],
      [null, `            ok`],
      [null, `        }`],
      [null, `        ${k('let')} (m, n) = (board.len(), board[0].len());`],
      [null, `        ${k('let')} ${k('mut')} found = Vec::new();`],
      [null, `        ${k('for')} word ${k('in')} words {`],
      [null, `            ${k('let')} w: Vec&lt;char&gt; = word.chars().collect();`],
      ['start', `            ${k('let')} on = (0..m).any(|r| (0..n).any(|c| matches(&amp;${k('mut')} board, r, c, &amp;w, 0)));`],
      [null, `            ${k('if')} on {`],
      ['add', `                found.push(word);`],
      [null, `            }`],
      [null, `        }`],
      ['ret', `        found`],
      [null, `    }`],
      [null, `}`],
    ],
  },
  trie: {
    ruby: [
      [null, `Node = Struct.new(:children, :word) ${c('# word: the word that ends here, until it is found')}`],
      [null, ``],
      [null, `${k('def')} find_words(board, words)`],
      [null, `  root = Node.new({}, ${k('nil')})`],
      [null, `  words.each ${k('do')} |w|`],
      ['build', `    node = root`],
      ['build', `    w.each_char { |ch| node = (node.children[ch] ||= Node.new({}, ${k('nil')})) }`],
      ['build', `    node.word = w`],
      [null, `  ${k('end')}`],
      [null, `  m, n, found = board.length, board[0].length, []`],
      [null, `  dfs = lambda ${k('do')} |r, c, parent|`],
      [null, `    ch = board[r][c]`],
      ['step', `    node = parent.children[ch]`],
      ['miss', `    ${k('return')} ${k('if')} node.nil?`],
      ['hit', `    ${k('if')} node.word`],
      ['hit', `      found &lt;&lt; node.word`],
      ['hit', `      node.word = ${k('nil')}`],
      [null, `    ${k('end')}`],
      ['mark', `    board[r][c] = '${c('#\' # used in this path')}`],
      [null, `    [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]].each ${k('do')} |x, y|`],
      [null, `      dfs.(x, y, node) ${k('if')} x &gt;= 0 &amp;&amp; x &lt; m &amp;&amp; y &gt;= 0 &amp;&amp; y &lt; n &amp;&amp; board[x][y] != '${c('#\'')}`],
      [null, `    ${k('end')}`],
      ['unmark', `    board[r][c] = ch`],
      ['prune', `    parent.children.delete(ch) ${k('if')} node.children.empty? &amp;&amp; node.word.nil?`],
      [null, `  ${k('end')}`],
      [null, `  (0...m).each { |r| (0...n).each { |c| dfs.(r, c, root) } }`],
      ['ret', `  found`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('class')} Node:`],
      [null, `    ${k('def')} __init__(self):`],
      [null, `        self.children = {}`],
      [null, `        self.word = ${k('None')}                  ${c('# the word that ends here, until it is found')}`],
      [null, ``],
      [null, ``],
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} findWords(self, board, words):`],
      [null, `        root = Node()`],
      [null, `        ${k('for')} w ${k('in')} words:`],
      ['build', `            node = root`],
      [null, `            ${k('for')} ch ${k('in')} w:`],
      ['build', `                node = node.children.setdefault(ch, Node())`],
      ['build', `            node.word = w`],
      [null, `        m, n, found = len(board), len(board[0]), []`],
      [null, ``],
      [null, `        ${k('def')} dfs(r, c, parent):`],
      [null, `            ch = board[r][c]`],
      ['step', `            node = parent.children.get(ch)`],
      ['miss', `            ${k('if')} node ${k('is')} ${k('None')}:`],
      ['miss', `                ${k('return')}`],
      ['hit', `            ${k('if')} node.word:`],
      ['hit', `                found.append(node.word)`],
      ['hit', `                node.word = ${k('None')}`],
      ['mark', `            board[r][c] = '${c('#\'                 # used in this path')}`],
      [null, `            ${k('for')} x, y ${k('in')} ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):`],
      [null, `                ${k('if')} 0 &lt;= x &lt; m and 0 &lt;= y &lt; n and board[x][y] != '${c('#\':')}`],
      [null, `                    dfs(x, y, node)`],
      ['unmark', `            board[r][c] = ch`],
      ['prune', `            ${k('if')} ${k('not')} node.children and ${k('not')} node.word:`],
      ['prune', `                del parent.children[ch]`],
      [null, ``],
      [null, `        ${k('for')} r ${k('in')} range(m):`],
      [null, `            ${k('for')} c ${k('in')} range(n):`],
      [null, `                dfs(r, c, root)`],
      ['ret', `        ${k('return')} found`],
    ],
    javascript: [
      [null, `${k('const')} findWords = ${k('function')} (board, words) {`],
      [null, `  ${k('const')} root = { children: ${k('new')} Map(), word: ${k('null')} }; ${c('// word: the word that ends here, until it is found')}`],
      [null, `  ${k('for')} (${k('const')} w ${k('of')} words) {`],
      ['build', `    ${k('let')} node = root;`],
      [null, `    ${k('for')} (${k('const')} ch ${k('of')} w) {`],
      ['build', `      ${k('if')} (!node.children.has(ch)) node.children.set(ch, { children: ${k('new')} Map(), word: ${k('null')} });`],
      ['build', `      node = node.children.get(ch);`],
      [null, `    }`],
      ['build', `    node.word = w;`],
      [null, `  }`],
      [null, `  ${k('const')} m = board.length, n = board[0].length, found = [];`],
      [null, `  ${k('const')} dfs = (r, c, parent) =&gt; {`],
      [null, `    ${k('const')} ch = board[r][c];`],
      ['step', `    ${k('const')} node = parent.children.get(ch);`],
      ['miss', `    ${k('if')} (!node) ${k('return')};`],
      ['hit', `    ${k('if')} (node.word) {`],
      ['hit', `      found.push(node.word);`],
      ['hit', `      node.word = ${k('null')};`],
      [null, `    }`],
      ['mark', `    board[r][c] = '#'; ${c('// used in this path')}`],
      [null, `    ${k('for')} (${k('const')} [x, y] ${k('of')} [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]) {`],
      [null, `      ${k('if')} (x &gt;= 0 &amp;&amp; x &lt; m &amp;&amp; y &gt;= 0 &amp;&amp; y &lt; n &amp;&amp; board[x][y] !== '#') dfs(x, y, node);`],
      [null, `    }`],
      ['unmark', `    board[r][c] = ch;`],
      ['prune', `    ${k('if')} (node.children.size === 0 &amp;&amp; !node.word) parent.children.delete(ch);`],
      [null, `  };`],
      [null, `  ${k('for')} (${k('let')} r = 0; r &lt; m; r++) ${k('for')} (${k('let')} c = 0; c &lt; n; c++) dfs(r, c, root);`],
      ['ret', `  ${k('return')} found;`],
      [null, `};`],
    ],
    go: [
      [null, `type trieNode struct {`],
      [null, `    children map[byte]*trieNode`],
      [null, `    word     string ${c('// the word that ends here, until it is found')}`],
      [null, `}`],
      [null, ``],
      [null, `${k('func')} findWords(board [][]byte, words []string) []string {`],
      [null, `    root := &amp;trieNode{children: map[byte]*trieNode{}}`],
      [null, `    ${k('for')} _, w := ${k('range')} words {`],
      ['build', `        node := root`],
      [null, `        ${k('for')} i := 0; i &lt; len(w); i++ {`],
      ['build', `            ${k('if')} node.children[w[i]] == ${k('nil')} {`],
      ['build', `                node.children[w[i]] = &amp;trieNode{children: map[byte]*trieNode{}}`],
      [null, `            }`],
      ['build', `            node = node.children[w[i]]`],
      [null, `        }`],
      ['build', `        node.word = w`],
      [null, `    }`],
      [null, `    m, n, found := len(board), len(board[0]), []string{}`],
      [null, `    ${k('var')} dfs ${k('func')}(r, c int, parent *trieNode)`],
      [null, `    dfs = ${k('func')}(r, c int, parent *trieNode) {`],
      [null, `        ch := board[r][c]`],
      ['step', `        node := parent.children[ch]`],
      ['miss', `        ${k('if')} node == ${k('nil')} {`],
      ['miss', `            ${k('return')}`],
      [null, `        }`],
      ['hit', `        ${k('if')} node.word != "" {`],
      ['hit', `            found = append(found, node.word)`],
      ['hit', `            node.word = ""`],
      [null, `        }`],
      ['mark', `        board[r][c] = '#' ${c('// used in this path')}`],
      [null, `        ${k('for')} _, d := ${k('range')} [4][2]int{{r + 1, c}, {r - 1, c}, {r, c + 1}, {r, c - 1}} {`],
      [null, `            x, y := d[0], d[1]`],
      [null, `            ${k('if')} x &gt;= 0 &amp;&amp; x &lt; m &amp;&amp; y &gt;= 0 &amp;&amp; y &lt; n &amp;&amp; board[x][y] != '#' {`],
      [null, `                dfs(x, y, node)`],
      [null, `            }`],
      [null, `        }`],
      ['unmark', `        board[r][c] = ch`],
      ['prune', `        ${k('if')} len(node.children) == 0 &amp;&amp; node.word == "" {`],
      ['prune', `            delete(parent.children, ch)`],
      [null, `        }`],
      [null, `    }`],
      [null, `    ${k('for')} r := 0; r &lt; m; r++ {`],
      [null, `        ${k('for')} c := 0; c &lt; n; c++ {`],
      [null, `            dfs(r, c, root)`],
      [null, `        }`],
      [null, `    }`],
      ['ret', `    ${k('return')} found`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('use')} std::collections::HashMap;`],
      [null, ``],
      [null, `#[derive(Default)]`],
      [null, `struct Node {`],
      [null, `    children: HashMap&lt;char, Node&gt;,`],
      [null, `    word: Option&lt;String&gt;, ${c('// the word that ends here, until it is found')}`],
      [null, `}`],
      [null, ``],
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} find_words(${k('mut')} board: Vec&lt;Vec&lt;char&gt;&gt;, words: Vec&lt;String&gt;) -&gt; Vec&lt;String&gt; {`],
      [null, `        ${k('let')} ${k('mut')} root = Node::default();`],
      [null, `        ${k('for')} w ${k('in')} words {`],
      ['build', `            ${k('let')} ${k('mut')} node = &amp;${k('mut')} root;`],
      [null, `            ${k('for')} ch ${k('in')} w.chars() {`],
      ['build', `                node = node.children.entry(ch).or_default();`],
      [null, `            }`],
      ['build', `            node.word = ${k('Some')}(w);`],
      [null, `        }`],
      [null, `        ${k('fn')} dfs(board: &amp;${k('mut')} Vec&lt;Vec&lt;char&gt;&gt;, r: usize, c: usize, parent: &amp;${k('mut')} Node, found: &amp;${k('mut')} Vec&lt;String&gt;) {`],
      [null, `            ${k('let')} ch = board[r][c];`],
      ['step', `            ${k('let')} ${k('Some')}(node) = parent.children.get_mut(&amp;ch) ${k('else')} {`],
      ['miss', `                ${k('return')};`],
      [null, `            };`],
      ['hit', `            ${k('if')} ${k('let')} ${k('Some')}(w) = node.word.take() {`],
      ['hit', `                found.push(w);`],
      [null, `            }`],
      ['mark', `            board[r][c] = '#'; ${c('// used in this path')}`],
      [null, `            ${k('let')} (m, n) = (board.len(), board[0].len());`],
      [null, `            ${k('for')} (x, y) ${k('in')} [(r + 1, c), (r.wrapping_sub(1), c), (r, c + 1), (r, c.wrapping_sub(1))] {`],
      [null, `                ${k('if')} x &lt; m &amp;&amp; y &lt; n &amp;&amp; board[x][y] != '#' {`],
      [null, `                    dfs(board, x, y, node, found);`],
      [null, `                }`],
      [null, `            }`],
      ['unmark', `            board[r][c] = ch;`],
      ['prune', `            ${k('if')} node.children.is_empty() &amp;&amp; node.word.is_none() {`],
      ['prune', `                parent.children.remove(&amp;ch);`],
      [null, `            }`],
      [null, `        }`],
      [null, `        ${k('let')} ${k('mut')} found = Vec::new();`],
      [null, `        ${k('for')} r ${k('in')} 0..board.len() {`],
      [null, `            ${k('for')} c ${k('in')} 0..board[0].len() {`],
      [null, `                dfs(&amp;${k('mut')} board, r, c, &amp;${k('mut')} root, &amp;${k('mut')} found);`],
      [null, `            }`],
      [null, `        }`],
      ['ret', `        found`],
      [null, `    }`],
      [null, `}`],
    ],
  },
};

/* ---------------- part 1: the "spell a path" widget ----------------
 *
 * Click adjacent cells to spell a path on the board — the rule the statement
 * sets: neighbours across or down, no cell twice. After each letter the
 * widget asks the trie's question: does any word still start this way? */

const QW_SETS = [
  { label: t('Example 1', 'ဥပမာ 1'), board: ['oaan', 'etae', 'ihkr', 'iflv'], words: ['oath', 'pea', 'eat', 'rain'] },
  { label: t('Example 2', 'ဥပမာ 2'), board: ['ab', 'cd'], words: ['abcb'] },
];

function mountPathWidget(host) {
  const state = { set: 0, path: [] };
  host.innerHTML = `
    <div class="ws-w" data-board></div>
    <div class="q-slider"><span class="q-presets" data-presets></span></div>
    <p class="q-tie" data-line></p>
    <div class="ledger">
      <span class="expr" data-expr></span>
      <span class="total" data-total></span>
    </div>`;
  const q = (sel) => host.querySelector(sel);

  function render() {
    const { board, words } = QW_SETS[state.set];
    const spelled = state.path.map(([r, cc]) => board[r][cc]).join('');
    const live = words.filter((w) => w.startsWith(spelled));
    const whole = words.includes(spelled);
    const last = state.path.at(-1);
    const onPath = new Map(state.path.map(([r, cc], i) => [`${r},${cc}`, i]));
    q('[data-board]').innerHTML = board.map((row, r) => `<div class="q-arr">${[...row].map((ch, cc) => {
      const i = onPath.get(`${r},${cc}`);
      const next = last && Math.abs(last[0] - r) + Math.abs(last[1] - cc) === 1 && i == null;
      const cls = i != null ? (i === state.path.length - 1 ? 'kept picked' : 'kept') : next ? '' : state.path.length ? 'cut' : '';
      return `<div class="cell ${cls}" role="button" tabindex="0" data-r="${r}" data-c="${cc}" aria-label="${ch} at row ${r}, column ${cc}"><span>${ch}</span><span class="idx">${i != null ? i + 1 : ''}</span></div>`;
    }).join('')}</div>`).join('');
    q('[data-presets]').innerHTML = presetChips(QW_SETS, state.set);
    widgetLabel(pick(t('click neighbouring cells to spell', 'ဘေးချင်း cell များကို နှိပ်၍ စာလုံးပေါင်းပါ')));
    q('[data-line]').innerHTML = pick(!spelled
      ? t(`Pick any cell to start. Words: ${words.join(', ')}.`, `မည်သည့် cell မဆို ရွေး၍ စပါ။ word များ — ${words.join(', ')}။`)
      : whole
        ? t(`"${spelled}" is one of the words — found.${live.length > 1 ? ' A longer word still continues it, so a search would keep going.' : ''}`,
            `"${spelled}" သည် word တစ်ခု — တွေ့ပြီ။${live.length > 1 ? ' ပိုရှည်သော word က ဆက်နေသေးသဖြင့် ရှာဖွေမှု ဆက်သွားမည်။' : ''}`)
        : live.length
          ? t(`"${spelled}" is the start of ${live.map((w) => `"${w}"`).join(', ')}: worth extending.`, `"${spelled}" သည် ${live.map((w) => `"${w}"`).join('၊ ')} ၏ အစ — ဆက်ချဲ့ထိုက်သည်။`)
          : t(`No word starts "${spelled}". A trie knows that after this one letter and stops, for every word at once; click any cell to start over.`,
              `"${spelled}" ဖြင့် စသော word မရှိ။ trie သည် ဤစာလုံး တစ်လုံးအပြီး ၎င်းကို သိပြီး word အားလုံးအတွက် တစ်ပြိုင်နက် ရပ်သည် — ပြန်စရန် မည်သည့် cell ကိုမဆို နှိပ်ပါ။`));
    q('[data-expr]').innerHTML = `"${spelled}" · ${state.path.map(([r, cc]) => cell(r, cc)).join(' → ') || '—'}`;
    q('[data-total]').innerHTML = `${live.length}<small>${pick(t('words still possible', 'ဖြစ်နိုင်သေးသော word'))}</small>`;
  }
  function tap(el) {
    const r = Number(el.dataset.r), cc = Number(el.dataset.c);
    const last = state.path.at(-1);
    const used = state.path.some(([a, b]) => a === r && b === cc);
    const adjacent = last && Math.abs(last[0] - r) + Math.abs(last[1] - cc) === 1;
    if (adjacent && !used) state.path.push([r, cc]); else state.path = [[r, cc]];
    render();
    host.querySelector(`[data-r="${r}"][data-c="${cc}"]`)?.focus();
  }
  host.addEventListener('click', (ev) => {
    const chip = ev.target.closest('[data-set]');
    if (chip) { state.set = Number(chip.dataset.set); state.path = []; return render(); }
    const el = ev.target.closest('[data-r]');
    if (el) tap(el);
  });
  host.addEventListener('keydown', (ev) => {
    const el = ev.target.closest('[data-r]');
    if (el && (ev.key === 'Enter' || ev.key === ' ')) { ev.preventDefault(); tap(el); }
  });
  onLangChange(render);
  render();
}

/* ---------------- the approach, in brief ---------------- */

const APPROACH = {
  each: {
    idea: t('Word Search I, once per word: for every word, try every cell as its start and backtrack through neighbours, marking cells used on the current path.',
            'Word Search I ကို word တစ်ခုလျှင် တစ်ကြိမ် — word တိုင်းအတွက် cell တိုင်းကို အစအဖြစ် စမ်းပြီး ဘေးများမှတစ်ဆင့် backtrack လုပ်ကာ လက်ရှိ လမ်းကြောင်းတွင် သုံးပြီး cell များကို မှတ်သည်။'),
    steps: [
      t('<code>match(r, c, w, k)</code>: the cell must hold <code>w[k]</code>; the last letter means found.', '<code>match(r, c, w, k)</code> — cell တွင် <code>w[k]</code> ရှိရမည် — နောက်ဆုံး စာလုံးဆိုလျှင် တွေ့ပြီ။'),
      t('Otherwise mark it <code>\'#\'</code>, try the four neighbours for <code>k + 1</code>, and restore the letter.', 'မဟုတ်လျှင် <code>\'#\'</code> မှတ်၊ ဘေး လေးခုတွင် <code>k + 1</code> ကို စမ်း၊ စာလုံးကို ပြန်ထားသည်။'),
      t('A word goes in <code>found</code> if any start cell matches it.', 'မည်သည့် အစ cell ကမဆို ကိုက်လျှင် word ကို <code>found</code> ထဲ ထည့်သည်။'),
    ],
    cost: t('Up to W × m·n × 4·3^(L−1) steps for W words of length L: every word pays for its own search, even when words share a beginning.',
            'အရှည် L ရှိ word W ခုအတွက် W × m·n × 4·3^(L−1) အဆင့်အထိ — word များ အစ တူသည့်အခါပင် word တိုင်း ကိုယ်ပိုင် ရှာဖွေမှုကို ပေးရသည်။'),
  },
  trie: {
    idea: t('Put every word in a trie, then walk the board once from each cell, stepping down the trie with each letter. A missing child ends the path for all words at once; a node with a word is a find.',
            'word တိုင်းကို trie ထဲ ထည့်ပြီး cell တစ်ခုစီမှ board ကို တစ်ကြိမ် လျှောက်ကာ စာလုံးတိုင်းဖြင့် trie အောက်သို့ ဆင်းသည်။ child မရှိလျှင် word အားလုံးအတွက် လမ်းကြောင်း တစ်ပြိုင်နက် ပြီးဆုံးသည် — word ပါသော node သည် တွေ့ရှိမှု ဖြစ်သည်။'),
    steps: [
      t('Build the trie, storing each word on its last node.', 'trie ကို တည်ဆောက်ပြီး word တစ်ခုစီကို ၎င်း၏ နောက်ဆုံး node တွင် သိမ်းသည်။'),
      t('<code>dfs(r, c, parent)</code>: no child for the cell\'s letter → return; a word on the child → add it and clear it.', '<code>dfs(r, c, parent)</code> — cell ၏ စာလုံးအတွက် child မရှိလျှင် return — child တွင် word ရှိလျှင် ထည့်ပြီး ရှင်းသည်။'),
      t('Mark the cell, recurse into unused neighbours, restore it; if the child is now empty, delete it from <code>parent</code>.', 'cell ကို မှတ်၊ မသုံးရသေးသော ဘေးများထဲ recurse၊ ပြန်ထား — child ယခု ဗလာဖြစ်လျှင် <code>parent</code> မှ ဖျက်သည်။'),
    ],
    cost: t('One search from each of the m·n cells, bounded by the trie: shared beginnings are walked once, and pruning stops found branches being walked again.',
            'm·n cell တစ်ခုစီမှ ရှာဖွေမှု တစ်ကြိမ်၊ trie က ကန့်သတ်သည် — တူသော အစများကို တစ်ကြိမ်သာ လျှောက်ပြီး ဖြတ်ခြင်းက တွေ့ပြီး အကိုင်းများကို ထပ်မလျှောက်စေ။'),
  },
};

/* ---------------- mount ---------------- */

const EX1 = { board: ['oaan', 'etae', 'ihkr', 'iflv'], words: ['oath', 'pea', 'eat', 'rain'] };

mountLesson({
  input: EX1,
  controls: [
    { key: 'board', label: t('board (rows split by ;)', 'board (row များကို ; ဖြင့် ခွဲ)'), value: fmtBoard(EX1.board), parse: parseBoard, format: fmtBoard },
    { key: 'words', label: 'words', value: fmtWords(EX1.words), parse: parseWords, format: fmtWords },
  ],
  presets: [
    { label: t('Example 1', 'ဥပမာ 1'), input: EX1 },
    { label: t('Example 2', 'ဥပမာ 2'), input: { board: ['ab', 'cd'], words: ['abcb'] } },
    { label: t('a word inside a word', 'word ထဲရှိ word'), input: { board: ['ab', 'cd'], words: ['ab', 'abd', 'abdc'] } },
  ],
  examples: [
    { title: t('Example 1', 'ဥပမာ 1'), inputHtml: '<code>board = [["o","a","a","n"],["e","t","a","e"],["i","h","k","r"],["i","f","l","v"]],<br>words = ["oath","pea","eat","rain"]</code>', output: '["eat","oath"]',
      why: [t('"oath" runs o → a → t → h down from the top-left corner; "eat" runs e → a → t in the middle.', '"oath" သည် ဘယ်ဘက်အပေါ်ထောင့်မှ o → a → t → h ဆင်းသွားသည် — "eat" သည် အလယ်တွင် e → a → t သွားသည်။'),
        t('There is no p for "pea", and "rain" has no path.', '"pea" အတွက် p မရှိ၊ "rain" တွင် လမ်းကြောင်း မရှိ။')],
      load: EX1 },
    { title: t('Example 2', 'ဥပမာ 2'), inputHtml: '<code>board = [["a","b"],["c","d"]], words = ["abcb"]</code>', output: '[]',
      why: [t('The only b has a and d as neighbours, never c, and it cannot be used twice anyway.', 'b တစ်လုံးတည်း၏ ဘေးတွင် a နှင့် d သာ ရှိပြီး c မရှိ — နှစ်ကြိမ်လည်း မသုံးရ။')],
      load: { board: ['ab', 'cd'], words: ['abcb'] } },
  ],
  modes: [
    { id: 'each', name: 'One search per word',
      sub: t('backtracking', 'backtracking'),
      desc: t('Run the Word Search I backtracking for every word.', 'word တိုင်းအတွက် Word Search I backtracking ကို run။'),
      cost: 'O(W · m·n · 3^L) time', build: buildEach },
    { id: 'trie', name: 'Trie + one walk',
      sub: t('backtracking', 'backtracking'),
      desc: t('All words at once: follow a trie as you walk the board.', 'word အားလုံး တစ်ပြိုင်နက် — board ကို လျှောက်စဉ် trie ကို လိုက်။'),
      cost: 'O(m·n · 3^L) time · O(total letters) trie', build: buildTrie },
  ],
  languages: LANGUAGES,
  code: CODE,
  solutions: {
    each: { approach: APPROACH.each,
      desc: t('Correct, and fine for a few words — but with thousands that share beginnings, it repeats the same walks for each one.', 'မှန်ပြီး word အနည်းငယ်အတွက် အဆင်ပြေသည် — သို့သော် အစ တူသော ထောင်ချီအတွက် တစ်ခုစီအတွက် လျှောက်ခြင်း အတူတူကို ထပ်လုပ်သည်။') },
    trie: { approach: APPROACH.trie,
      desc: t('The answer the problem is built for. Clearing a found word stops duplicates; pruning an emptied branch stops the walk from re-entering it.',
              'ပြဿနာ ရည်ရွယ်ထားသော အဖြေ။ တွေ့ပြီး word ကို ရှင်းခြင်းက ထပ်နေခြင်းကို တားသည် — ဗလာဖြစ်သော အကိုင်းကို ဖြတ်ခြင်းက ၎င်းထဲ ပြန်မဝင်စေ။') },
  },
  // How each language was actually checked, printed as the part 3 badges.
  // The corpus: the 2 examples, 6 edges, 15,000 random boards up to 4 × 4
  // over two or three letters, 5,000 up to 8 × 8, and five at 12 × 12 — against
  // a bitmask search per word. One search per word skips the two inputs with
  // thousands of words. Go and Rust ran in Docker (golang:1.23-alpine,
  // rust:1-slim).
  verification: {
    ruby: { each: 'ran here · 20,011 cases, not the two with thousands of words', trie: 'ran here · 20,013 cases' },
    python: { each: 'ran here · 20,011 cases, not the two with thousands of words', trie: 'ran here · 20,013 cases' },
    javascript: { each: 'ran here · 20,011 cases, not the two with thousands of words', trie: 'ran here · 20,013 cases' },
    go: { each: 'ran here · 20,011 cases, not the two with thousands of words · Go 1.23', trie: 'ran here · 20,013 cases · Go 1.23' },
    rust: { each: 'ran here · 20,011 cases, not the two with thousands of words · rustc 1.98', trie: 'ran here · 20,013 cases · rustc 1.98' },
  },
  stripLabel: t('board, as the code holds it', 'board — code ကိုင်ထားသည့်အတိုင်း'),
  strip,
  draw,
  answer,
  vars,
  widget: mountPathWidget,
});
