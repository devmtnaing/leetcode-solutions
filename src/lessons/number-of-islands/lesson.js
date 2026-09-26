/* Number of Islands — LeetCode 200.
 *
 * Scan the grid; every '1' the scan meets is land no earlier island reached,
 * so it starts a new island. Before moving on, sink that whole island to '0'
 * — by recursing into the four neighbours (DFS) or by working through a queue
 * (BFS) — so the scan never counts any of it again. The grid itself is the
 * visited set.
 */
import { mountLesson } from '../../lib/stepper.js';
import { pick, onLangChange } from '../../lib/i18n.js';
import { cells, slots, stagePanel, stack, readout } from '../../lib/stage.js';
import { t, exampleTitle, LANGUAGES, k, c, labelledRows, stageRow, stageGap, presetChips, widgetLabel } from '../../lib/kit.js';

const MAX_R = 6, MAX_C = 7;

function parseGrid(text) {
  const s = String(text).trim();
  let rows = s.includes('[')
    ? [...s.replace(/^\[/, '').replace(/\]$/, '').matchAll(/\[([^[\]]*)\]/g)].map((m) => m[1].replace(/["'\s,]/g, ''))
    : s.split(/[;\n]/).map((r) => r.replace(/[\s,"']/g, '')).filter((r) => r !== '');
  if (!rows.length || rows.some((r) => !/^[01]+$/.test(r))) throw new Error('rows of 0s and 1s, like 110; 011');
  if (rows.some((r) => r.length !== rows[0].length)) throw new Error('every row the same length');
  if (rows.length > MAX_R || rows[0].length > MAX_C) throw new Error(`at most ${MAX_R} rows of ${MAX_C}, so the stage stays readable`);
  return rows;
}
const fmtGrid = (g) => g.join('; ');

// down, up, right, left: the order every listing calls them in
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

/* Why a cell stops a call or a look: off the grid, water, or land already sunk. */
function missWhy(grid, g, r, c) {
  if (r < 0 || r >= g.length || c < 0 || c >= g[0].length) return t(`(${r},${c}) is off the grid`, `(${r},${c}) သည် grid အပြင်ဘက်`);
  if (grid[r][c] === '1') return t(`(${r},${c}) is land already sunk`, `(${r},${c}) သည် နှစ်ပြီးသား ကုန်း`);
  return t(`(${r},${c}) is water`, `(${r},${c}) သည် ရေ`);
}
const inGrid = (g, r, c) => r >= 0 && r < g.length && c >= 0 && c < g[0].length;

/* ---------------- step generators ---------------- */

function scanStep(grid, r, c) {
  return grid[r][c] === '1'
    ? t(`(${r},${c}) is '0' now: land sunk by an island already counted. Skip it.`,
        `(${r},${c}) သည် ယခု '0' — ရေတွက်ပြီးသား ကျွန်းက နှစ်ထားသော ကုန်း။ ကျော်သည်။`)
    : t(`(${r},${c}) is water. Skip it.`, `(${r},${c}) သည် ရေ။ ကျော်သည်။`);
}

function buildDfs({ grid }) {
  const g = grid.map((r) => r.split(''));
  const m = g.length, n = g[0].length;
  const steps = [];
  const calls = [];
  let count = 0, deepest = 0;
  const snap = (extra) => ({ view: 'dfs', grid: g.map((r) => r.join('')), calls: calls.map((x) => [...x]),
    count, deepest, at: null, miss: null, scan: null, ...extra });

  function sink(r, c) {
    calls.push([r, c]);
    deepest = Math.max(deepest, calls.length);
    if (!inGrid(g, r, c) || g[r][c] !== '1') {
      const why = missWhy(grid, g, r, c);
      steps.push(snap({ line: 'bound', miss: inGrid(g, r, c) ? [r, c] : null, tag: t('return', 'return'),
        note: t(`${why.en}: return at once. This call sinks nothing.`, `${why.my} — ချက်ချင်း return။ ဤ call က ဘာမှ မနှစ်ပါ။`) }));
      calls.pop();
      return;
    }
    g[r][c] = '0';
    steps.push(snap({ line: 'sink', at: [r, c], tag: t(`sink (${r},${c})`, `(${r},${c}) နှစ်`),
      note: t(`(${r},${c}) is land: set it to '0' before anything else, so no call — and no later scan — can count it again.`,
              `(${r},${c}) သည် ကုန်း — အရင်ဆုံး '0' ပြောင်းသည်၊ ထို့ကြောင့် မည်သည့် call — နောက်ပိုင်း scan — ကမှ ၎င်းကို ထပ်မရေတွက်နိုင်။`) }));
    steps.push(snap({ line: 'spread', at: [r, c], tag: t('4 neighbours', 'အိမ်နီး 4 ခု'),
      note: t(`Call sink on each neighbour in turn — down (${r + 1},${c}), up (${r - 1},${c}), right (${r},${c + 1}), left (${r},${c - 1}). Each call returns only once everything it reaches is sunk.`,
              `အိမ်နီးတစ်ခုစီကို အလှည့်ကျ sink ခေါ်သည် — အောက် (${r + 1},${c})၊ အပေါ် (${r - 1},${c})၊ ညာ (${r},${c + 1})၊ ဘယ် (${r},${c - 1})။ call တစ်ခုစီသည် ၎င်းရောက်နိုင်သမျှ နှစ်ပြီးမှ return ပြန်သည်။`) }));
    for (const [dr, dc] of DIRS) sink(r + dr, c + dc);
    calls.pop();
  }

  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      if (g[r][c] !== '1') {
        steps.push(snap({ line: 'scan', scan: [r, c], tag: t(`scan (${r},${c})`, `(${r},${c}) scan`), note: scanStep(grid, r, c) }));
        continue;
      }
      count++;
      steps.push(snap({ line: 'count', at: [r, c], counted: true, tag: t(`island ${count}`, `ကျွန်း ${count}`),
        note: t(`(${r},${c}) is land nothing has sunk yet, so it belongs to an island not yet counted: count = ${count}. Now sink all of it.`,
                `(${r},${c}) သည် မနှစ်ရသေးသော ကုန်း — ထို့ကြောင့် မရေတွက်ရသေးသော ကျွန်းတစ်ခု၏ အပိုင်း — count = ${count}။ ယခု ၎င်းအားလုံးကို နှစ်မည်။`) }));
      sink(r, c);
    }
  }
  steps.push(snap({ line: 'ret', finished: true, tag: t(`${count} islands`, `ကျွန်း ${count} ခု`),
    note: t(`Every cell scanned, and every island sunk as it was found: ${count}. The deepest the calls went was ${deepest} — on a 300 × 300 grid of land it is 90,000.`,
            `cell တိုင်း scan ပြီး ကျွန်းတိုင်းကို တွေ့ချိန်တွင် နှစ်ခဲ့သည် — ${count}။ call များ အနက်ဆုံး ${deepest} ဆင့် ရောက်ခဲ့သည် — ကုန်းချည်း 300 × 300 grid တွင် 90,000 ဖြစ်သည်။`) }));
  return steps;
}

function buildBfs({ grid }) {
  const g = grid.map((r) => r.split(''));
  const m = g.length, n = g[0].length;
  const steps = [];
  let queue = [], head = 0, count = 0;
  const snap = (extra) => ({ view: 'bfs', grid: g.map((r) => r.join('')), queue: queue.slice(head).map((x) => [...x]),
    count, at: null, miss: null, scan: null, pushed: null, ...extra });

  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      if (g[r][c] !== '1') {
        steps.push(snap({ line: 'scan', scan: [r, c], tag: t(`scan (${r},${c})`, `(${r},${c}) scan`), note: scanStep(grid, r, c) }));
        continue;
      }
      count++;
      steps.push(snap({ line: 'count', at: [r, c], counted: true, tag: t(`island ${count}`, `ကျွန်း ${count}`),
        note: t(`(${r},${c}) is land nothing has sunk yet: a new island, count = ${count}.`,
                `(${r},${c}) သည် မနှစ်ရသေးသော ကုန်း — ကျွန်းအသစ်၊ count = ${count}။`) }));
      g[r][c] = '0';
      queue = [[r, c]]; head = 0;
      steps.push(snap({ line: 'seed', at: [r, c], pushed: [r, c], tag: t('sink + queue', 'နှစ် + queue'),
        note: t(`Sink (${r},${c}) and put it in the queue. A cell is sunk the moment it is queued, so it can never be queued twice.`,
                `(${r},${c}) ကို နှစ်ပြီး queue ထဲ ထည့်သည်။ cell တစ်ခုကို queue ထဲ ထည့်သည့် ခဏမှာပင် နှစ်သဖြင့် နှစ်ကြိမ် မထည့်မိနိုင်။`) }));
      while (head < queue.length) {
        const [i, j] = queue[head++];
        steps.push(snap({ line: 'pop', at: [i, j], i, j, tag: t(`pop (${i},${j})`, `(${i},${j}) ထုတ်`),
          note: t(`Take (${i},${j}) from the front of the queue and look at its four neighbours.`,
                  `queue ရှေ့မှ (${i},${j}) ကို ထုတ်ပြီး ၎င်း၏ အိမ်နီး လေးခုကို ကြည့်သည်။`) }));
        for (const [dr, dc] of DIRS) {
          const x = i + dr, y = j + dc;
          if (!inGrid(g, x, y) || g[x][y] !== '1') {
            const why = missWhy(grid, g, x, y);
            steps.push(snap({ line: 'look', at: [i, j], i, j, x, y, miss: inGrid(g, x, y) ? [x, y] : null, tag: t('skip', 'ကျော်'),
              note: t(`${why.en}: nothing to queue.`, `${why.my} — queue ထဲ ထည့်စရာ မရှိ။`) }));
            continue;
          }
          g[x][y] = '0';
          queue.push([x, y]);
          steps.push(snap({ line: 'push', at: [i, j], i, j, x, y, pushed: [x, y], tag: t(`queue (${x},${y})`, `(${x},${y}) queue`),
            note: t(`(${x},${y}) is land: sink it and queue it — ${queue.length - head} waiting.`,
                    `(${x},${y}) သည် ကုန်း — နှစ်ပြီး queue ထဲ ထည့်သည် — ${queue.length - head} ခု စောင့်နေသည်။`) }));
        }
      }
    }
  }
  steps.push(snap({ line: 'ret', finished: true, tag: t(`${count} islands`, `ကျွန်း ${count} ခု`),
    note: t(`Every cell scanned, every island emptied through the queue: ${count}. No call ever went deeper than this one.`,
            `cell တိုင်း scan ပြီး ကျွန်းတိုင်းကို queue မှတစ်ဆင့် ရှင်းခဲ့သည် — ${count}။ call တစ်ခုမှ ဤ call ထက် မနက်ခဲ့ပါ။`) }));
  return steps;
}

/* ---------------- drawing ----------------
 *
 * The strip card is the grid as the code holds it: land still standing,
 * land already sunk to '0' (green rim), the cell being worked on (amber) and a
 * neighbour just turned away (red). The stage is what the approach carries
 * between steps: the call stack for DFS, the queue for BFS. */

const same = (p, r, c) => p && p[0] === r && p[1] === c;

function strip(s, { grid }) {
  return `<div class="isl">${labelledRows(s.grid.map((row, r) => [`${r}`, cells(row.split(''), {
    tone: Object.fromEntries(row.split('').map((v, c) => [c,
      same(s.at, r, c) || same(s.scan, r, c) ? 'inwin'
        : same(s.miss, r, c) ? 'leaving'
          : grid[r][c] === '1' && v === '0' ? 'entering'
            : v === '1' ? 'land' : null]).filter(([, x]) => x)),
  })]), { grid: true })}</div>`;
}

const SHOWN = 8;
function draw(s) {
  if (s.view === 'dfs') {
    const names = s.calls.map(([r, c]) => `sink(${r},${c})`);
    const hidden = names.length - SHOWN;
    const shown = hidden > 0 ? [pick(t(`⋯ ${hidden} more`, `⋯ နောက်ထပ် ${hidden}`)), ...names.slice(-SHOWN)] : names;
    return stagePanel(pick(t('The call stack', 'Call stack')),
      pick(t(`${s.calls.length} deep`, `${s.calls.length} ဆင့်`)),
      stack(shown))
      + stageGap + readout({ count: s.count, [pick(t('deepest so far', 'ယခုထိ အနက်ဆုံး'))]: s.deepest });
  }
  const last = s.pushed ? s.queue.findIndex(([a, b]) => same(s.pushed, a, b)) : -1;
  return stagePanel(pick(t('The queue, front first', 'Queue — ရှေ့ဆုံးမှ')),
    pick(t(`${s.queue.length} waiting`, `${s.queue.length} ခု စောင့်`)),
    stageRow(cells(s.queue.map(([a, b]) => `${a},${b}`), { index: false, tone: last >= 0 ? { [last]: 'entering' } : {} }),
      pick(t('empty', 'ဗလာ'))))
    + stageGap + readout({ count: s.count });
}

function answer(s) {
  return {
    html: slots([s.count], { total: 1, just: s.counted || s.finished ? 0 : -1 }),
    note: s.finished ? t('islands', 'ကျွန်း အရေအတွက်') : t('islands so far', 'ယခုထိ ကျွန်း'),
  };
}

function vars(s) {
  const out = [['grid', `[${s.grid.map((r) => `"${r}"`).join(', ')}]`], ['m', s.grid.length], ['n', s.grid[0].length], ['count', s.count]];
  const cell = s.at || s.scan || s.miss;
  if (s.view === 'dfs') {
    const top = s.calls.at(-1) || s.scan || s.at;
    if (top) out.push(['r', top[0]], ['c', top[1]]);
  } else {
    if (cell && s.i == null) out.push(['r', cell[0]], ['c', cell[1]]);
    if (s.i != null) out.push(['i', s.i], ['j', s.j]);
    if (s.x != null) out.push(['x', s.x], ['y', s.y]);
    out.push(['queue', `[${s.queue.map(([a, b]) => `(${a},${b})`).join(', ')}]`]);
  }
  return out;
}

/* ---------------- the code, one key per line ----------------
 *
 * Generated from the verified solution files, so the listing a reader copies
 * is byte-identical to the one that ran. */

const CODE = {
  dfs: {
    ruby: [
      [null, `${k('def')} num_islands(grid)`],
      [null, `  count = 0`],
      [null, `  grid.each_index ${k('do')} |r|`],
      [null, `    grid[r].each_index ${k('do')} |c|`],
      ['scan', `      next ${k('unless')} grid[r][c] == '1'`],
      ['count', `      count += 1`],
      [null, `      sink(grid, r, c)`],
      [null, `    ${k('end')}`],
      [null, `  ${k('end')}`],
      ['ret', `  count`],
      [null, `${k('end')}`],
      [null, ``],
      [null, `${k('def')} sink(grid, r, c)`],
      ['bound', `  ${k('return')} ${k('if')} r &lt; 0 || r &gt;= grid.length || c &lt; 0 || c &gt;= grid[0].length || grid[r][c] != '1'`],
      ['sink', `  grid[r][c] = '0'`],
      ['spread', `  sink(grid, r + 1, c)`],
      ['spread', `  sink(grid, r - 1, c)`],
      ['spread', `  sink(grid, r, c + 1)`],
      ['spread', `  sink(grid, r, c - 1)`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('import')} sys`],
      [null, `sys.setrecursionlimit(200_000)            ${c('# 300 × 300 land is 90,000 calls deep')}`],
      [null, ``],
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} numIslands(self, grid):`],
      [null, `        m, n = len(grid), len(grid[0])`],
      [null, ``],
      [null, `        ${k('def')} sink(r, c):`],
      ['bound', `            ${k('if')} r &lt; 0 or r &gt;= m or c &lt; 0 or c &gt;= n or grid[r][c] != '1':`],
      [null, `                ${k('return')}`],
      ['sink', `            grid[r][c] = '0'`],
      ['spread', `            sink(r + 1, c)`],
      ['spread', `            sink(r - 1, c)`],
      ['spread', `            sink(r, c + 1)`],
      ['spread', `            sink(r, c - 1)`],
      [null, ``],
      [null, `        count = 0`],
      [null, `        ${k('for')} r ${k('in')} range(m):`],
      [null, `            ${k('for')} c ${k('in')} range(n):`],
      ['scan', `                ${k('if')} grid[r][c] == '1':`],
      ['count', `                    count += 1`],
      [null, `                    sink(r, c)`],
      ['ret', `        ${k('return')} count`],
    ],
    javascript: [
      [null, `${k('const')} numIslands = ${k('function')} (grid) {`],
      [null, `  ${k('const')} m = grid.length, n = grid[0].length;`],
      [null, `  ${k('const')} sink = (r, c) =&gt; {`],
      ['bound', `    ${k('if')} (r &lt; 0 || r &gt;= m || c &lt; 0 || c &gt;= n || grid[r][c] !== '1') ${k('return')};`],
      ['sink', `    grid[r][c] = '0';`],
      ['spread', `    sink(r + 1, c);`],
      ['spread', `    sink(r - 1, c);`],
      ['spread', `    sink(r, c + 1);`],
      ['spread', `    sink(r, c - 1);`],
      [null, `  };`],
      [null, `  ${k('let')} count = 0;`],
      [null, `  ${k('for')} (${k('let')} r = 0; r &lt; m; r++) {`],
      [null, `    ${k('for')} (${k('let')} c = 0; c &lt; n; c++) {`],
      ['scan', `      ${k('if')} (grid[r][c] === '1') {`],
      ['count', `        count++;`],
      [null, `        sink(r, c);`],
      [null, `      }`],
      [null, `    }`],
      [null, `  }`],
      ['ret', `  ${k('return')} count;`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} numIslands(grid [][]byte) int {`],
      [null, `    m, n := len(grid), len(grid[0])`],
      [null, `    ${k('var')} sink ${k('func')}(r, c int)`],
      [null, `    sink = ${k('func')}(r, c int) {`],
      ['bound', `        ${k('if')} r &lt; 0 || r &gt;= m || c &lt; 0 || c &gt;= n || grid[r][c] != '1' {`],
      [null, `            ${k('return')}`],
      [null, `        }`],
      ['sink', `        grid[r][c] = '0'`],
      ['spread', `        sink(r+1, c)`],
      ['spread', `        sink(r-1, c)`],
      ['spread', `        sink(r, c+1)`],
      ['spread', `        sink(r, c-1)`],
      [null, `    }`],
      [null, `    count := 0`],
      [null, `    ${k('for')} r := 0; r &lt; m; r++ {`],
      [null, `        ${k('for')} c := 0; c &lt; n; c++ {`],
      ['scan', `            ${k('if')} grid[r][c] == '1' {`],
      ['count', `                count++`],
      [null, `                sink(r, c)`],
      [null, `            }`],
      [null, `        }`],
      [null, `    }`],
      ['ret', `    ${k('return')} count`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} num_islands(${k('mut')} grid: Vec&lt;Vec&lt;char&gt;&gt;) -&gt; i32 {`],
      [null, `        ${k('fn')} sink(grid: &amp;${k('mut')} Vec&lt;Vec&lt;char&gt;&gt;, r: i32, c: i32) {`],
      ['bound', `            ${k('if')} r &lt; 0 || r &gt;= grid.len() as i32 || c &lt; 0 || c &gt;= grid[0].len() as i32 || grid[r as usize][c as usize] != '1' {`],
      [null, `                ${k('return')};`],
      [null, `            }`],
      ['sink', `            grid[r as usize][c as usize] = '0';`],
      ['spread', `            sink(grid, r + 1, c);`],
      ['spread', `            sink(grid, r - 1, c);`],
      ['spread', `            sink(grid, r, c + 1);`],
      ['spread', `            sink(grid, r, c - 1);`],
      [null, `        }`],
      [null, `        ${k('let')} ${k('mut')} count = 0;`],
      [null, `        ${k('for')} r ${k('in')} 0..grid.len() {`],
      [null, `            ${k('for')} c ${k('in')} 0..grid[0].len() {`],
      ['scan', `                ${k('if')} grid[r][c] == '1' {`],
      ['count', `                    count += 1;`],
      [null, `                    sink(&amp;${k('mut')} grid, r as i32, c as i32);`],
      [null, `                }`],
      [null, `            }`],
      [null, `        }`],
      ['ret', `        count`],
      [null, `    }`],
      [null, `}`],
    ],
  },
  bfs: {
    ruby: [
      [null, `${k('def')} num_islands(grid)`],
      [null, `  m, n = grid.length, grid[0].length`],
      [null, `  count = 0`],
      [null, `  (0...m).each ${k('do')} |r|`],
      [null, `    (0...n).each ${k('do')} |c|`],
      ['scan', `      next ${k('unless')} grid[r][c] == '1'`],
      ['count', `      count += 1`],
      ['seed', `      grid[r][c] = '0'`],
      ['seed', `      queue = [[r, c]]`],
      [null, `      ${k('until')} queue.empty?`],
      ['pop', `        i, j = queue.shift`],
      [null, `        [[i + 1, j], [i - 1, j], [i, j + 1], [i, j - 1]].each ${k('do')} |x, y|`],
      ['look', `          next ${k('unless')} x &gt;= 0 &amp;&amp; x &lt; m &amp;&amp; y &gt;= 0 &amp;&amp; y &lt; n &amp;&amp; grid[x][y] == '1'`],
      ['push', `          grid[x][y] = '0'`],
      ['push', `          queue &lt;&lt; [x, y]`],
      [null, `        ${k('end')}`],
      [null, `      ${k('end')}`],
      [null, `    ${k('end')}`],
      [null, `  ${k('end')}`],
      ['ret', `  count`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('from')} collections ${k('import')} deque`],
      [null, ``],
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} numIslands(self, grid):`],
      [null, `        m, n = len(grid), len(grid[0])`],
      [null, `        count = 0`],
      [null, `        ${k('for')} r ${k('in')} range(m):`],
      [null, `            ${k('for')} c ${k('in')} range(n):`],
      ['scan', `                ${k('if')} grid[r][c] != '1':`],
      [null, `                    continue`],
      ['count', `                count += 1`],
      ['seed', `                grid[r][c] = '0'`],
      ['seed', `                queue = deque([(r, c)])`],
      [null, `                ${k('while')} queue:`],
      ['pop', `                    i, j = queue.popleft()`],
      [null, `                    ${k('for')} x, y ${k('in')} ((i + 1, j), (i - 1, j), (i, j + 1), (i, j - 1)):`],
      ['look', `                        ${k('if')} 0 &lt;= x &lt; m and 0 &lt;= y &lt; n and grid[x][y] == '1':`],
      ['push', `                            grid[x][y] = '0'`],
      ['push', `                            queue.append((x, y))`],
      ['ret', `        ${k('return')} count`],
    ],
    javascript: [
      [null, `${k('const')} numIslands = ${k('function')} (grid) {`],
      [null, `  ${k('const')} m = grid.length, n = grid[0].length;`],
      [null, `  ${k('let')} count = 0;`],
      [null, `  ${k('for')} (${k('let')} r = 0; r &lt; m; r++) {`],
      [null, `    ${k('for')} (${k('let')} c = 0; c &lt; n; c++) {`],
      ['scan', `      ${k('if')} (grid[r][c] !== '1') continue;`],
      ['count', `      count++;`],
      ['seed', `      grid[r][c] = '0';`],
      ['seed', `      ${k('const')} queue = [[r, c]];`],
      [null, `      ${k('for')} (${k('let')} head = 0; head &lt; queue.length; head++) {`],
      ['pop', `        ${k('const')} [i, j] = queue[head];`],
      [null, `        ${k('for')} (${k('const')} [x, y] ${k('of')} [[i + 1, j], [i - 1, j], [i, j + 1], [i, j - 1]]) {`],
      ['look', `          ${k('if')} (x &lt; 0 || x &gt;= m || y &lt; 0 || y &gt;= n || grid[x][y] !== '1') continue;`],
      ['push', `          grid[x][y] = '0';`],
      ['push', `          queue.push([x, y]);`],
      [null, `        }`],
      [null, `      }`],
      [null, `    }`],
      [null, `  }`],
      ['ret', `  ${k('return')} count;`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} numIslands(grid [][]byte) int {`],
      [null, `    m, n := len(grid), len(grid[0])`],
      [null, `    count := 0`],
      [null, `    ${k('for')} r := 0; r &lt; m; r++ {`],
      [null, `        ${k('for')} c := 0; c &lt; n; c++ {`],
      ['scan', `            ${k('if')} grid[r][c] != '1' {`],
      [null, `                continue`],
      [null, `            }`],
      ['count', `            count++`],
      ['seed', `            grid[r][c] = '0'`],
      ['seed', `            queue := [][2]int{{r, c}}`],
      [null, `            ${k('for')} len(queue) &gt; 0 {`],
      ['pop', `                i, j := queue[0][0], queue[0][1]`],
      [null, `                queue = queue[1:]`],
      [null, `                ${k('for')} _, d := ${k('range')} [4][2]int{{i + 1, j}, {i - 1, j}, {i, j + 1}, {i, j - 1}} {`],
      [null, `                    x, y := d[0], d[1]`],
      ['look', `                    ${k('if')} x &lt; 0 || x &gt;= m || y &lt; 0 || y &gt;= n || grid[x][y] != '1' {`],
      [null, `                        continue`],
      [null, `                    }`],
      ['push', `                    grid[x][y] = '0'`],
      ['push', `                    queue = append(queue, [2]int{x, y})`],
      [null, `                }`],
      [null, `            }`],
      [null, `        }`],
      [null, `    }`],
      ['ret', `    ${k('return')} count`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('use')} std::collections::VecDeque;`],
      [null, ``],
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} num_islands(${k('mut')} grid: Vec&lt;Vec&lt;char&gt;&gt;) -&gt; i32 {`],
      [null, `        ${k('let')} (m, n) = (grid.len() as i32, grid[0].len() as i32);`],
      [null, `        ${k('let')} ${k('mut')} count = 0;`],
      [null, `        ${k('for')} r ${k('in')} 0..m {`],
      [null, `            ${k('for')} c ${k('in')} 0..n {`],
      ['scan', `                ${k('if')} grid[r as usize][c as usize] != '1' {`],
      [null, `                    continue;`],
      [null, `                }`],
      ['count', `                count += 1;`],
      ['seed', `                grid[r as usize][c as usize] = '0';`],
      ['seed', `                ${k('let')} ${k('mut')} queue = VecDeque::from([(r, c)]);`],
      ['pop', `                ${k('while')} ${k('let')} ${k('Some')}((i, j)) = queue.pop_front() {`],
      [null, `                    ${k('for')} (x, y) ${k('in')} [(i + 1, j), (i - 1, j), (i, j + 1), (i, j - 1)] {`],
      ['look', `                        ${k('if')} x &lt; 0 || x &gt;= m || y &lt; 0 || y &gt;= n || grid[x as usize][y as usize] != '1' {`],
      [null, `                            continue;`],
      [null, `                        }`],
      ['push', `                        grid[x as usize][y as usize] = '0';`],
      ['push', `                        queue.push_back((x, y));`],
      [null, `                    }`],
      [null, `                }`],
      [null, `            }`],
      [null, `        }`],
      ['ret', `        count`],
      [null, `    }`],
      [null, `}`],
    ],
  },
};

/* ---------------- part 1: the "which cells join" widget ----------------
 *
 * The statement hinges on one word: land joins horizontally or vertically.
 * Click cells to raise or flood them; every island gets a letter. Switch to
 * "diagonals too" to see the count people get when they read it as eight
 * neighbours. */

const QW_SETS = [
  { label: exampleTitle(2), g: ['11000', '11000', '00100', '00011'] },
  { label: t('a diagonal', 'ထောင့်ဖြတ်'), g: ['10000', '01000', '00100', '00010'] },
  { label: t('a ring', 'ကွင်း'), g: ['11111', '10001', '10101', '11111'] },
];
const EIGHT = [...DIRS, [1, 1], [1, -1], [-1, 1], [-1, -1]];

function label(g, dirs) {
  const id = g.map((r) => r.map(() => null));
  let n = 0;
  for (let r = 0; r < g.length; r++) {
    for (let c = 0; c < g[0].length; c++) {
      if (g[r][c] !== '1' || id[r][c] != null) continue;
      const todo = [[r, c]];
      id[r][c] = n;
      while (todo.length) {
        const [a, b] = todo.pop();
        for (const [dr, dc] of dirs) {
          const x = a + dr, y = b + dc;
          if (inGrid(g, x, y) && g[x][y] === '1' && id[x][y] == null) { id[x][y] = n; todo.push([x, y]); }
        }
      }
      n++;
    }
  }
  return { id, n };
}

function mountIslandWidget(host) {
  const state = { set: 0, eight: false, g: QW_SETS[0].g.map((r) => r.split('')) };
  host.innerHTML = `
    <div class="isl-w q-grid" data-grid></div>
    <div class="q-slider"><span class="q-presets" data-presets></span></div>
    <div class="q-slider"><span class="q-presets" data-conn></span></div>
    <p class="q-tie" data-line></p>
    <div class="ledger">
      <span class="expr" data-expr></span>
      <span class="total" data-total></span>
    </div>`;
  const q = (sel) => host.querySelector(sel);

  function render() {
    const four = label(state.g, DIRS), eight = label(state.g, EIGHT);
    const shown = state.eight ? eight : four;
    q('[data-presets]').innerHTML = presetChips(QW_SETS, state.set);
    q('[data-conn]').innerHTML = [
      [false, t('up, down, left, right', 'အပေါ်၊ အောက်၊ ဘယ်၊ ညာ')], [true, t('diagonals too (a misreading)', 'ထောင့်ဖြတ်ပါ (အလွဲဖတ်ခြင်း)')],
    ].map(([v, text]) => `<button class="chip" data-eight="${v}"${v === state.eight ? ' aria-pressed="true"' : ''}>${pick(text)}</button>`).join('');
    q('[data-grid]').innerHTML = state.g.map((row, r) => `<div class="q-arr">${row.map((v, c) => {
      const land = v === '1';
      const name = land ? String.fromCharCode(65 + shown.id[r][c]) : '0';
      return `<div class="cell ${land ? 'kept' : 'cut'}" role="button" tabindex="0" data-r="${r}" data-c="${c}" aria-label="${r},${c} ${land ? 'land' : 'water'}"><span>${name}</span><span class="idx">${r},${c}</span></div>`;
    }).join('')}</div>`).join('');
    widgetLabel(pick(t('click to raise or flood', 'ကုန်း/ရေ ပြောင်းရန် နှိပ်ပါ')));
    q('[data-line]').innerHTML = pick(four.n === eight.n
      ? t(`Here diagonals change nothing: both readings count ${four.n}. Try the diagonal, or click a cell that touches another only at a corner.`,
          `ဤနေရာတွင် ထောင့်ဖြတ်က ဘာမှ မပြောင်းပါ — နှစ်မျိုးလုံး ${four.n} ရေတွက်သည်။ ထောင့်ဖြတ် preset ကို စမ်းပါ၊ သို့မဟုတ် ထောင့်ချင်းသာ ထိသော cell ကို နှိပ်ပါ။`)
      : t(`Counting diagonals gives ${eight.n}; the statement joins land only horizontally or vertically, so the answer is ${four.n}. Cells that touch only at a corner are separate islands.`,
          `ထောင့်ဖြတ်ပါ ရေတွက်လျှင် ${eight.n} ရသည် — မေးခွန်းက ကုန်းကို အလျားလိုက် သို့မဟုတ် ဒေါင်လိုက်သာ ဆက်သဖြင့် အဖြေမှာ ${four.n}။ ထောင့်ချင်းသာ ထိသော cell များသည် သီးခြား ကျွန်းများ ဖြစ်သည်။`));
    q('[data-expr]').innerHTML = state.eight ? '(r ± 1, c) · (r, c ± 1) · (r ± 1, c ± 1)' : '(r ± 1, c) · (r, c ± 1)';
    q('[data-total]').innerHTML = `${shown.n}<small>${pick(t('islands', 'ကျွန်း'))}</small>`;
  }
  function toggle(el) {
    const r = Number(el.dataset.r), c = Number(el.dataset.c);
    state.g[r][c] = state.g[r][c] === '1' ? '0' : '1';
    render();
    host.querySelector(`[data-r="${r}"][data-c="${c}"]`)?.focus();
  }
  host.addEventListener('click', (ev) => {
    const chip = ev.target.closest('[data-set]');
    if (chip) { state.set = Number(chip.dataset.set); state.g = QW_SETS[state.set].g.map((r) => r.split('')); return render(); }
    const conn = ev.target.closest('[data-eight]');
    if (conn) { state.eight = conn.dataset.eight === 'true'; return render(); }
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
  dfs: {
    idea: t('Scan every cell. The first land cell of an island starts a count; a recursive sink then turns that whole island to water, so the scan can never count it again.',
            'cell တိုင်းကို scan လုပ်သည်။ ကျွန်းတစ်ခု၏ ပထမဆုံး ကုန်း cell က count ကို တိုးစေပြီး recursive sink က ထိုကျွန်းတစ်ခုလုံးကို ရေ ပြောင်းသဖြင့် scan က ထပ်မရေတွက်နိုင်တော့။'),
    steps: [
      t('Scan <code>grid</code> row by row for a <code>\'1\'</code>.', '<code>grid</code> ကို row အလိုက် <code>\'1\'</code> ရှာ scan လုပ်သည်။'),
      t('Found one: <code>count += 1</code>, then <code>sink(r, c)</code>.', 'တွေ့လျှင် <code>count += 1</code>၊ ပြီးမှ <code>sink(r, c)</code>။'),
      t('<code>sink</code> returns on anything off the grid or not <code>\'1\'</code>; otherwise it sets the cell to <code>\'0\'</code> first, then calls itself on the four neighbours.',
        '<code>sink</code> သည် grid အပြင် သို့မဟုတ် <code>\'1\'</code> မဟုတ်လျှင် return ပြန်သည် — မဟုတ်လျှင် cell ကို <code>\'0\'</code> အရင်ပြောင်းပြီး အိမ်နီး လေးခုပေါ် သူ့ကိုယ်သူ ခေါ်သည်။'),
    ],
    cost: t('Every cell is scanned once and sunk at most once; each sunk cell makes four calls. The stack grows as deep as the longest path the calls take — up to every cell, 90,000 at the constraint.',
            'cell တိုင်းကို တစ်ကြိမ် scan ပြီး အများဆုံး တစ်ကြိမ် နှစ်သည် — နှစ်သော cell တစ်ခုစီက call လေးခု လုပ်သည်။ stack သည် call များ သွားသော အရှည်ဆုံး လမ်းကြောင်းအထိ နက်သည် — cell အားလုံးအထိ၊ ကန့်သတ်ချက်တွင် 90,000။'),
  },
  bfs: {
    idea: t('The same scan, but an island is emptied through a queue instead of the call stack. A cell is sunk the moment it is queued, so it is queued once.',
            'scan အတူတူ၊ သို့သော် ကျွန်းကို call stack အစား queue မှတစ်ဆင့် ရှင်းသည်။ cell ကို queue ထဲ ထည့်သည့် ခဏမှာပင် နှစ်သဖြင့် တစ်ကြိမ်သာ ထည့်သည်။'),
    steps: [
      t('Scan for a <code>\'1\'</code>; found one: <code>count += 1</code>, sink it, and start <code>queue</code> with it.',
        '<code>\'1\'</code> ရှာ scan လုပ်သည် — တွေ့လျှင် <code>count += 1</code>၊ နှစ်ပြီး <code>queue</code> ကို ၎င်းဖြင့် စသည်။'),
      t('Pop <code>(i, j)</code> from the front.', 'ရှေ့ဆုံးမှ <code>(i, j)</code> ကို ထုတ်သည်။'),
      t('Each neighbour <code>(x, y)</code> that is on the grid and <code>\'1\'</code>: set it to <code>\'0\'</code>, then queue it.',
        'grid ပေါ်ရှိပြီး <code>\'1\'</code> ဖြစ်သော အိမ်နီး <code>(x, y)</code> တိုင်း — <code>\'0\'</code> ပြောင်းပြီးမှ queue ထဲ ထည့်သည်။'),
    ],
    cost: t('The same O(m·n) work, with no recursion: the queue holds one island\'s frontier at a time — at most 300 cells on a 300 × 300 grid of land, counted here — and never the call stack\'s 90,000.',
            'O(m·n) အလုပ် အတူတူ၊ recursion မပါ — queue သည် ကျွန်းတစ်ခု၏ အစွန်းကိုသာ ကိုင်သည် (ကုန်းချည်း 300 × 300 grid တွင် cell 300၊ ဤနေရာတွင် ရေတွက်ထားသည်)။'),
  },
};

/* ---------------- mount ---------------- */

const EX1 = ['11110', '11010', '11000', '00000'];
const EX2 = ['11000', '11000', '00100', '00011'];
const exHtml = (g) => `<code>grid = [${g.map((r) => `[${r.split('').map((v) => `"${v}"`).join(',')}]`).join(',<br>')}]</code>`;

mountLesson({
  input: { grid: EX2 },
  controls: [
    { key: 'grid', label: t('grid (rows split by ;)', 'grid (row များကို ; ဖြင့် ခွဲ)'), parse: parseGrid, format: fmtGrid },
  ],
  presets: [
    { label: exampleTitle(1), input: { grid: EX1 } },
    { label: exampleTitle(2), input: { grid: EX2 } },
    { label: t('a ring', 'ကွင်း'), input: { grid: ['1111', '1001', '1111'] } },
    { label: t('all water', 'ရေချည်း'), input: { grid: ['000', '000'] } },
  ],
  examples: [
    { title: exampleTitle(1), inputHtml: exHtml(EX1), output: '1',
      why: [t('Every 1 touches another 1 above, below or beside it, so all nine form one island.', '1 တိုင်းသည် အပေါ်၊ အောက် သို့မဟုတ် ဘေးက 1 တစ်ခုခုကို ထိသဖြင့် ကိုးခုလုံး ကျွန်းတစ်ခု ဖြစ်သည်။')],
      load: { grid: EX1 } },
    { title: exampleTitle(2), inputHtml: exHtml(EX2), output: '3',
      why: [t('The 2 × 2 block at the top left, the single cell in the middle, and the pair at the bottom right.', 'ဘယ်ဘက်အပေါ်ရှိ 2 × 2 အတုံး၊ အလယ်ရှိ cell တစ်ခု၊ ညာဘက်အောက်ရှိ အတွဲ။'),
        t('The middle cell touches the others only at corners, and corners do not join.', 'အလယ် cell သည် အခြားများကို ထောင့်ချင်းသာ ထိပြီး ထောင့်သည် မဆက်ပါ။')],
      load: { grid: EX2 } },
  ],
  modes: [
    { id: 'dfs', name: 'Sink with DFS',
      sub: t('recursive', 'recursive'),
      desc: t('Count a new island, then sink it by recursing into the neighbours.', 'ကျွန်းအသစ်ကို ရေတွက်ပြီး အိမ်နီးများထဲ recurse ဝင်၍ နှစ်သည်။'),
      cost: 'O(m·n) time · O(m·n) stack', build: buildDfs },
    { id: 'bfs', name: 'Sink with BFS',
      sub: t('a queue', 'queue'),
      desc: t('Count a new island, then sink it through a queue — no recursion.', 'ကျွန်းအသစ်ကို ရေတွက်ပြီး queue မှတစ်ဆင့် နှစ်သည် — recursion မပါ။'),
      cost: 'O(m·n) time · O(m·n) space, no recursion', build: buildBfs },
  ],
  languages: LANGUAGES,
  code: CODE,
  solutions: {
    dfs: { approach: APPROACH.dfs,
      desc: t('The one most people write: short and correct. Its depth is the catch — a grid of land takes the calls up to 90,000 deep, past the default stack of Ruby and Node.',
              'လူအများစု ရေးသော version — တိုပြီး မှန်သည်။ ပြဿနာမှာ အနက် — ကုန်းချည်း grid က call များကို 90,000 ဆင့်အထိ နက်စေပြီး Ruby နှင့် Node ၏ default stack ကို ကျော်သည်။') },
    bfs: { approach: APPROACH.bfs,
      desc: t('The same count with a queue in place of the call stack. No depth to worry about, in any language; sink a cell when it is queued, not when it is popped.',
              'call stack နေရာတွင် queue ဖြင့် ရေတွက်ခြင်း အတူတူ။ မည်သည့် ဘာသာစကားတွင်မဆို အနက် စိုးရိမ်စရာ မရှိ — cell ကို ထုတ်ချိန်မဟုတ်ဘဲ queue ထဲ ထည့်ချိန်တွင် နှစ်ပါ။') },
  },
  // How each language was actually checked, printed as the part 3 badges.
  // The corpus: the 2 examples, 6 edges, 15,000 random grids up to 6 × 8,
  // 5,000 up to 40 × 40, and five at 300 × 300 (all land, a checkerboard,
  // three random densities) — against a union-find oracle. Go and Rust ran in
  // Docker (golang:1.23-alpine, rust:1-slim). The DFS stack limits were
  // measured cold, one snake-shaped island per process, on each default stack.
  verification: {
    ruby: { dfs: 'ran here · overflows Ruby 3.1\'s default stack past 8,729 cells deep', bfs: 'ran here · 20,013 cases' },
    python: { dfs: 'ran here · 20,013 cases, 90,000 calls deep', bfs: 'ran here · 20,013 cases' },
    javascript: { dfs: 'ran here · overflows Node 24\'s default stack past 9,813 cells deep', bfs: 'ran here · 20,013 cases' },
    go: 'ran here · 20,013 cases · Go 1.23',
    rust: 'ran here · 20,013 cases · rustc 1.98',
  },
  caveats: {
    dfs: {
      ruby: t('Correct on all 20,013 cases with a larger stack, but on Ruby 3.1\'s default stack a single island more than 8,729 cells long overflows it (<code>SystemStackError</code>) — measured here — and a 300 × 300 grid of land is 90,000.',
              'stack ပိုကြီးလျှင် case 20,013 ခုလုံးတွင် မှန်သည်၊ သို့သော် Ruby 3.1 ၏ default stack ပေါ်တွင် cell 8,729 ထက် ရှည်သော ကျွန်းတစ်ခုက overflow (<code>SystemStackError</code>) ဖြစ်စေသည် — ဤနေရာတွင် တိုင်းတာထားသည် — ကုန်းချည်း 300 × 300 grid သည် 90,000 ဖြစ်သည်။'),
      javascript: t('Correct on all 20,013 cases with a larger stack, but on Node 24\'s default stack a single island more than 9,813 cells long overflows it (<code>RangeError</code>) — measured here, cold — and a 300 × 300 grid of land is 90,000. Use the BFS version.',
                    'stack ပိုကြီးလျှင် case 20,013 ခုလုံးတွင် မှန်သည်၊ သို့သော် Node 24 ၏ default stack ပေါ်တွင် cell 9,813 ထက် ရှည်သော ကျွန်းတစ်ခုက overflow (<code>RangeError</code>) ဖြစ်စေသည် — ဤနေရာတွင် တိုင်းတာထားသည် — ကုန်းချည်း 300 × 300 grid သည် 90,000 ဖြစ်သည်။ BFS version ကို သုံးပါ။'),
      python: t('The <code>setrecursionlimit</code> line is part of the answer: at Python\'s default of 1,000, a 32 × 32 grid of land already fails with <code>RecursionError</code> (checked here).',
                '<code>setrecursionlimit</code> စာကြောင်းသည် အဖြေ၏ အစိတ်အပိုင်း — Python ၏ default 1,000 တွင် ကုန်းချည်း 32 × 32 grid ပင် <code>RecursionError</code> ဖြင့် ကျရှုံးသည် (ဤနေရာတွင် စစ်ထားသည်)။'),
    },
  },
  stripLabel: t('grid, as the code holds it', 'grid — code ကိုင်ထားသည့်အတိုင်း'),
  strip,
  draw,
  answer,
  vars,
  widget: mountIslandWidget,
});
