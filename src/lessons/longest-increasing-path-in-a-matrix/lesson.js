/* Longest Increasing Path in a Matrix — LeetCode 329.
 *
 * The longest increasing path starting at a cell is 1, plus the longest one
 * starting at whichever larger neighbour is best. That answer never changes,
 * so work it out once per cell and remember it: a DFS with a memo table,
 * O(m·n). Or go the other way round: the peaks — cells with no larger
 * neighbour — end every path. Peel them off, then whatever is newly left with
 * no larger neighbour, layer after layer; the number of layers is the answer,
 * with no recursion at all.
 */
import { mountLesson } from '../../lib/stepper.js';
import { pick, onLangChange } from '../../lib/i18n.js';
import { cells, slots, stagePanel, stack, readout, panels } from '../../lib/stage.js';
import { t, exampleTitle, LANGUAGES, k, c, labelledRows, stageRow, stageGap, presetChips, widgetLabel } from '../../lib/kit.js';

const MAX_R = 5, MAX_C = 5, MAX_V = 999;

function parseMatrix(text) {
  const s = String(text).trim();
  const rows = (s.startsWith('[') ? [...s.replace(/^\[/, '').replace(/\]$/, '').matchAll(/\[([^[\]]*)\]/g)].map((m) => m[1]) : s.split(/[;\n]/))
    .map((r) => r.trim()).filter((r) => r !== '')
    .map((r) => r.split(/[\s,]+/).filter((x) => x !== ''));
  if (!rows.length || rows.some((r) => !r.length || r.some((x) => !/^\d+$/.test(x)))) throw new Error('rows of whole numbers, like 9 9 4; 6 6 8');
  const m = rows.map((r) => r.map(Number));
  if (m.some((r) => r.length !== m[0].length)) throw new Error('every row the same length');
  if (m.length > MAX_R || m[0].length > MAX_C) throw new Error(`at most ${MAX_R} rows of ${MAX_C}, so the stage stays readable`);
  if (m.some((r) => r.some((v) => v > MAX_V))) throw new Error(`values up to ${MAX_V} here, so the cells stay readable`);
  return m;
}
const fmtMatrix = (m) => m.map((r) => r.join(' ')).join('; ');

// down, up, right, left: the order every listing looks in
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const inGrid = (m, r, c) => r >= 0 && r < m.length && c >= 0 && c < m[0].length;
const cell = (r, c) => `(${r},${c})`;

/* ---------------- step generators ---------------- */

function buildMemo({ matrix: g }) {
  const m = g.length, n = g[0].length;
  const memo = g.map((row) => row.map(() => 0));
  const frames = [];
  let best = 0, deepest = 0;
  const steps = [];
  const snap = (extra) => ({ view: 'memo', memo: memo.map((r) => [...r]), frames: frames.map((f) => ({ ...f })), best, deepest,
    at: frames.length ? [frames.at(-1).r, frames.at(-1).c] : null, look: null, ...extra });
  steps.push(snap({ line: 'init', tag: t('memo all 0', 'memo အားလုံး 0'),
    note: t('<code>memo</code> will hold, for each cell, the longest increasing path that starts there. 0 means not worked out yet — every real answer is at least 1.',
            '<code>memo</code> သည် cell တစ်ခုစီအတွက် ထိုနေရာမှ စသော အရှည်ဆုံး increasing path ကို သိမ်းမည်။ 0 ဆိုသည်မှာ မတွက်ရသေး — တကယ့်အဖြေတိုင်း အနည်းဆုံး 1။') }));

  function climb(r, c, from) {
    if (memo[r][c] > 0) {
      steps.push(snap({ line: 'hit', at: [r, c], tag: t(`memo ${memo[r][c]}`, `memo ${memo[r][c]}`),
        note: from
          ? t(`${cell(r, c)} was worked out before: the longest path from it is ${memo[r][c]}. Return that at once — nothing below it is walked again.`,
              `${cell(r, c)} ကို အရင်က တွက်ပြီးပြီ — ၎င်းမှ အရှည်ဆုံး path သည် ${memo[r][c]}။ ချက်ချင်း ပြန်ပေးသည် — ၎င်းအောက်ကို ထပ်မလျှောက်။`)
          : t(`${cell(r, c)} was already worked out while climbing from an earlier cell: ${memo[r][c]}. No work to do.`,
              `${cell(r, c)} ကို အစောပိုင်း cell မှ တက်စဉ် တွက်ပြီးပြီ — ${memo[r][c]}။ လုပ်စရာ မရှိ။`) }));
      return memo[r][c];
    }
    const f = { r, c, best: 1 };
    frames.push(f);
    deepest = Math.max(deepest, frames.length);
    steps.push(snap({ line: 'start', tag: t(`climb ${cell(r, c)}`, `${cell(r, c)} တက်`),
      note: t(`Climb from ${cell(r, c)}, value ${g[r][c]}. The cell alone is a path of 1; now look for a larger neighbour to go on to.`,
              `${cell(r, c)} (value ${g[r][c]}) မှ တက်သည်။ cell တစ်ခုတည်းပင် အရှည် 1 path — ယခု ဆက်သွားရန် ပိုကြီးသော အိမ်နီးကို ရှာသည်။`) }));
    for (const [dr, dc] of DIRS) {
      const x = r + dr, y = c + dc;
      if (!inGrid(g, x, y) || g[x][y] <= g[r][c]) {
        steps.push(snap({ line: 'look', look: inGrid(g, x, y) ? [x, y] : null, larger: false, x, y, tag: t('skip', 'ကျော်'),
          note: !inGrid(g, x, y)
            ? t(`${cell(x, y)} is off the grid.`, `${cell(x, y)} သည် grid အပြင်ဘက်။`)
            : t(`${cell(x, y)} is ${g[x][y]}, not larger than ${g[r][c]}: an increasing path cannot step there.`,
                `${cell(x, y)} သည် ${g[x][y]}၊ ${g[r][c]} ထက် မကြီး — increasing path သည် ထိုနေရာသို့ မသွားနိုင်။`) }));
        continue;
      }
      steps.push(snap({ line: 'look', look: [x, y], larger: true, x, y, tag: t(`${g[x][y]} > ${g[r][c]}`, `${g[x][y]} > ${g[r][c]}`),
        note: t(`${cell(x, y)} is ${g[x][y]}, larger than ${g[r][c]}: ask how long a path starting there can be.`,
                `${cell(x, y)} သည် ${g[x][y]}၊ ${g[r][c]} ထက် ကြီးသည် — ထိုနေရာမှ စသော path မည်မျှ ရှည်နိုင်သည်ကို မေးသည်။`) }));
      const sub = climb(x, y, true);
      const was = f.best;
      f.best = Math.max(f.best, 1 + sub);
      steps.push(snap({ line: 'step', look: [x, y], larger: true, x, y, tag: t(`best ${f.best}`, `best ${f.best}`),
        note: 1 + sub > was
          ? t(`Through ${cell(x, y)}: 1 + ${sub} = ${1 + sub}, longer than ${was}. best = ${f.best}.`, `${cell(x, y)} မှတစ်ဆင့် — 1 + ${sub} = ${1 + sub}၊ ${was} ထက် ရှည်သည်။ best = ${f.best}။`)
          : t(`Through ${cell(x, y)}: 1 + ${sub} = ${1 + sub}, no longer than ${was}.`, `${cell(x, y)} မှတစ်ဆင့် — 1 + ${sub} = ${1 + sub}၊ ${was} ထက် မရှည်။`) }));
    }
    memo[r][c] = f.best;
    steps.push(snap({ line: 'save', tag: t(`memo = ${f.best}`, `memo = ${f.best}`),
      note: t(`The longest path from ${cell(r, c)} is ${f.best}. Write it in <code>memo</code> — whoever asks about ${cell(r, c)} again gets it at once.`,
              `${cell(r, c)} မှ အရှည်ဆုံး path သည် ${f.best}။ <code>memo</code> ထဲ ရေးသည် — ${cell(r, c)} ကို နောက်ထပ် မေးသူ ချက်ချင်း ရမည်။`) }));
    frames.pop();
    return f.best;
  }

  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      const got = climb(r, c, false);
      const was = best;
      best = Math.max(best, got);
      steps.push(snap({ line: 'scan', scan: [r, c], tag: t(`best ${best}`, `best ${best}`),
        note: got > was
          ? t(`The longest path starting at ${cell(r, c)} is ${got}, the longest so far: best = ${best}.`, `${cell(r, c)} မှ စသော အရှည်ဆုံး path သည် ${got}၊ ယခုထိ အရှည်ဆုံး — best = ${best}။`)
          : t(`From ${cell(r, c)}: ${got}. best stays ${best}.`, `${cell(r, c)} မှ — ${got}။ best သည် ${best} အတိုင်း။`) }));
    }
  }
  steps.push(snap({ line: 'ret', finished: true, answer: best, tag: t(`return ${best}`, `${best} ပြန်`),
    note: t(`Return <b>${best}</b>. Each cell's path was worked out once; the calls went ${deepest} deep here — on a 200 × 200 grid they can go past 20,000.`,
            `<b>${best}</b> ကို ပြန်ပေးသည်။ cell တစ်ခုစီ၏ path ကို တစ်ကြိမ်သာ တွက်ခဲ့သည် — ဤနေရာတွင် call များ ${deepest} ဆင့် နက်ခဲ့သည် — 200 × 200 grid တွင် 20,000 ကျော်နိုင်သည်။`) }));
  return steps;
}

function buildPeel({ matrix: g }) {
  const m = g.length, n = g[0].length;
  const higher = g.map((row) => row.map(() => null));
  const peeled = g.map((row) => row.map(() => 0));   // the layer that peeled each cell, 0 = not yet
  let layer = [], below = [], layers = 0;
  const steps = [];
  const snap = (extra) => ({ view: 'peel', higher: higher.map((r) => [...r]), peeled: peeled.map((r) => [...r]),
    layer: layer.map((p) => [...p]), below: below.map((p) => [...p]), layers, at: null, look: null, ...extra });

  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      higher[r][c] = DIRS.filter(([dr, dc]) => inGrid(g, r + dr, c + dc) && g[r + dr][c + dc] > g[r][c]).length;
      steps.push(snap({ line: 'count', at: [r, c], tag: t(`higher ${higher[r][c]}`, `higher ${higher[r][c]}`),
        note: higher[r][c]
          ? t(`${cell(r, c)} = ${g[r][c]} has ${higher[r][c]} larger ${higher[r][c] === 1 ? 'neighbour' : 'neighbours'}: a path through it can still go on.`,
              `${cell(r, c)} = ${g[r][c]} တွင် ပိုကြီးသော အိမ်နီး ${higher[r][c]} ခု — ၎င်းကိုဖြတ်သော path သည် ဆက်သွားနိုင်သေးသည်။`)
          : t(`${cell(r, c)} = ${g[r][c]} has no larger neighbour: a peak. Any path that reaches it ends there.`,
              `${cell(r, c)} = ${g[r][c]} တွင် ပိုကြီးသော အိမ်နီး မရှိ — peak။ ၎င်းသို့ ရောက်သော path တိုင်း ထိုနေရာတွင် ဆုံးသည်။`) }));
    }
  }
  for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) if (higher[r][c] === 0) layer.push([r, c]);
  steps.push(snap({ line: 'peaks', tag: t(`${layer.length} peaks`, `peak ${layer.length} ခု`),
    note: t(`The first layer is every peak: ${layer.map(([r, c]) => cell(r, c)).join(', ')}. Every increasing path ends on one of them.`,
            `ပထမ layer သည် peak အားလုံး — ${layer.map(([r, c]) => cell(r, c)).join(', ')}။ increasing path တိုင်း ၎င်းတို့ထဲမှ တစ်ခုပေါ်တွင် ဆုံးသည်။`) }));
  while (layer.length) {
    layers++;
    for (const [r, c] of layer) peeled[r][c] = layers;
    below = [];
    steps.push(snap({ line: 'layer', tag: t(`layer ${layers}`, `layer ${layers}`),
      note: t(`Peel layer ${layers}: ${layer.map(([r, c]) => cell(r, c)).join(', ')}. A cell in layer ${layers} starts a path of exactly ${layers} cells — ${layers === 1 ? 'itself' : `one step up into layer ${layers - 1}, and on from there`}.`,
              `layer ${layers} ကို ခွာသည် — ${layer.map(([r, c]) => cell(r, c)).join(', ')}။ layer ${layers} ရှိ cell သည် cell ${layers} ခု အတိအကျ ရှိသော path ကို စသည် — ${layers === 1 ? 'သူ့ကိုယ်သူ' : `layer ${layers - 1} သို့ တစ်ဆင့်တက်ပြီး ထိုမှ ဆက်`}။`) }));
    for (const [r, c] of layer) {
      const smaller = DIRS.map(([dr, dc]) => [r + dr, c + dc]).filter(([x, y]) => inGrid(g, x, y) && g[x][y] < g[r][c]);
      steps.push(snap({ line: 'look', at: [r, c], tag: t(`${smaller.length} smaller`, `ပိုငယ် ${smaller.length}`),
        note: smaller.length
          ? t(`Around ${cell(r, c)} = ${g[r][c]}, the smaller neighbours are ${smaller.map(([x, y]) => cell(x, y)).join(', ')}: each has one larger neighbour fewer left.`,
              `${cell(r, c)} = ${g[r][c]} ပတ်လည်ရှိ ပိုငယ်သော အိမ်နီးများ — ${smaller.map(([x, y]) => cell(x, y)).join(', ')} — တစ်ခုစီတွင် ကျန်သော ပိုကြီးသည့် အိမ်နီး တစ်ခု လျော့သည်။`)
          : t(`${cell(r, c)} = ${g[r][c]} has no smaller neighbour: nothing leads up to it.`, `${cell(r, c)} = ${g[r][c]} တွင် ပိုငယ်သော အိမ်နီး မရှိ — ၎င်းဆီသို့ တက်လာသည့်အရာ မရှိ။`) }));
      for (const [x, y] of smaller) {
        higher[x][y]--;
        steps.push(snap({ line: 'drop', at: [r, c], look: [x, y], x, y, tag: t(`higher ${higher[x][y]}`, `higher ${higher[x][y]}`),
          note: t(`${cell(x, y)} has ${higher[x][y]} larger ${higher[x][y] === 1 ? 'neighbour' : 'neighbours'} left unpeeled.`,
                  `${cell(x, y)} တွင် မခွာရသေးသော ပိုကြီးသည့် အိမ်နီး ${higher[x][y]} ခု ကျန်သည်။`) }));
        if (higher[x][y] === 0) {
          below.push([x, y]);
          steps.push(snap({ line: 'ready', at: [r, c], look: [x, y], x, y, tag: t(`${cell(x, y)} next`, `${cell(x, y)} နောက်`),
            note: t(`Every larger neighbour of ${cell(x, y)} is peeled, so it goes in the next layer: its longest path steps up into this one.`,
                    `${cell(x, y)} ၏ ပိုကြီးသော အိမ်နီးအားလုံး ခွာပြီးပြီ — ထို့ကြောင့် နောက် layer ထဲ ဝင်သည် — ၎င်း၏ အရှည်ဆုံး path သည် ဤ layer သို့ တက်သည်။`) }));
        }
      }
    }
    layer = below;
    below = [];
    steps.push(snap({ line: 'next', tag: layer.length ? t(`${layer.length} next`, `နောက် ${layer.length}`) : t('none left', 'မကျန်'),
      note: layer.length
        ? t(`The next layer: ${layer.map(([r, c]) => cell(r, c)).join(', ')}.`, `နောက် layer — ${layer.map(([r, c]) => cell(r, c)).join(', ')}။`)
        : t('Nothing was freed: every cell is peeled.', 'ဘာမှ မလွတ်တော့ — cell တိုင်း ခွာပြီးပြီ။') }));
  }
  steps.push(snap({ line: 'ret', finished: true, answer: layers, tag: t(`return ${layers}`, `${layers} ပြန်`),
    note: t(`Return <b>${layers}</b>, the number of layers. A cell in the last layer starts a path that climbs one layer at a time to a peak, and no path can be longer. No recursion was needed.`,
            `layer အရေအတွက် <b>${layers}</b> ကို ပြန်ပေးသည်။ နောက်ဆုံး layer ရှိ cell သည် layer တစ်ခုစီ တက်၍ peak ရောက်သော path ကို စပြီး ၎င်းထက် ရှည်သော path မရှိ။ recursion မလိုခဲ့ပါ။`) }));
  return steps;
}

/* ---------------- drawing ----------------
 *
 * The strip card is the matrix, with the cell being worked on in amber and a
 * neighbour it looks at green (larger — a step up) or red (not). The stage is
 * what the approach fills in: the memo table beside the call stack, or the
 * count of larger neighbours still standing, with each peeled cell showing
 * its layer. */

const same = (p, r, c) => p && p[0] === r && p[1] === c;

function strip(s, { matrix: g }) {
  return `<div class="lip">${labelledRows(g.map((row, r) => [`${r}`, cells(row, {
    tone: Object.fromEntries(row.map((_, c) => [c,
      same(s.at, r, c) || same(s.scan, r, c) ? 'inwin'
        : same(s.look, r, c) ? (s.view === 'peel' || s.larger ? 'entering' : 'leaving')
          : (s.view === 'memo' ? s.memo[r][c] : s.peeled[r][c]) ? 'set' : null]).filter(([, x]) => x)),
  })]), { grid: true })}</div>`;
}

function grid(values, tone) {
  return `<div class="lip">${labelledRows(values.map((row, r) => [`${r}`, cells(row, {
    tone: Object.fromEntries(row.map((_, c) => [c, tone(r, c)]).filter(([, x]) => x)) })]), { grid: true })}</div>`;
}

const SHOWN = 7;
function draw(s) {
  if (s.view === 'memo') {
    const names = s.frames.map((f) => `climb(${f.r},${f.c}) · best ${f.best}`);
    const hidden = names.length - SHOWN;
    const shown = hidden > 0 ? [pick(t(`⋯ ${hidden} more`, `⋯ နောက်ထပ် ${hidden}`)), ...names.slice(-SHOWN)] : names;
    const table = grid(s.memo.map((row) => row.map((v) => (v ? v : '·'))),
      (r, c) => (same(s.at, r, c) || same(s.scan, r, c) ? 'inwin' : same(s.look, r, c) && s.larger ? 'entering' : s.memo[r][c] ? 'set' : null));
    return stagePanel(pick(t('memo — the longest path starting at each cell', 'memo — cell တစ်ခုစီမှ စသော အရှည်ဆုံး path')),
      pick(t(`${s.frames.length} deep`, `${s.frames.length} ဆင့်`)),
      panels(table, stack(shown, { label: 'call stack' })))
      + stageGap + readout({ best: s.best, [pick(t('deepest so far', 'ယခုထိ အနက်ဆုံး'))]: s.deepest });
  }
  const table = grid(s.higher.map((row, r) => row.map((v, c) => (s.peeled[r][c] ? `L${s.peeled[r][c]}` : v == null ? '·' : v))),
    (r, c) => (same(s.at, r, c) ? 'inwin' : same(s.look, r, c) ? 'entering' : s.peeled[r][c] ? 'set' : null));
  const list = (ps) => cells(ps.map(([r, c]) => `${r},${c}`), { index: false });
  return stagePanel(pick(t('higher — larger neighbours not yet peeled (Lk = peeled in layer k)', 'higher — မခွာရသေးသော ပိုကြီးသည့် အိမ်နီး (Lk = layer k တွင် ခွာ)')),
    `layers = ${s.layers}`, table)
    + stageGap + stagePanel('layer', '', stageRow(list(s.layer), pick(t('empty', 'ဗလာ'))))
    + stageGap + stagePanel('below', pick(t('the next layer, being gathered', 'စုနေသော နောက် layer')), stageRow(list(s.below), pick(t('empty', 'ဗလာ'))));
}

function answer(s) {
  const v = s.view === 'memo' ? s.best : s.layers;
  return {
    html: slots([v], { total: 1, just: s.finished ? 0 : -1 }),
    note: s.finished ? t('the longest increasing path', 'အရှည်ဆုံး increasing path') : s.view === 'memo' ? t('best so far', 'ယခုထိ best') : t('layers so far', 'ယခုထိ layer'),
  };
}

function vars(s) {
  const out = [];
  if (s.view === 'memo') {
    const f = s.frames.at(-1);
    const p = f ? [f.r, f.c] : s.scan || s.at;
    if (p) out.push(['r', p[0]], ['c', p[1]]);
    if (s.x != null) out.push(['x', s.x], ['y', s.y]);
    out.push(['best', f ? f.best : s.best]);
    return out;
  }
  if (s.at) out.push(['r', s.at[0]], ['c', s.at[1]]);
  if (s.x != null) out.push(['x', s.x], ['y', s.y]);
  out.push(['layers', s.layers], ['layer', `[${s.layer.map(([r, c]) => `(${r},${c})`).join(', ')}]`],
    ['below', `[${s.below.map(([r, c]) => `(${r},${c})`).join(', ')}]`]);
  return out;
}

/* ---------------- the code, one key per line ----------------
 *
 * Generated from the verified solution files, so the listing a reader copies
 * is byte-identical to the one that ran. */

const CODE = {
  memo: {
    ruby: [
      [null, `${k('def')} longest_increasing_path(matrix)`],
      ['init', `  memo = matrix.map { |row| Array.new(row.length, 0) } ${c('# 0 = not worked out yet')}`],
      [null, `  best = 0`],
      [null, `  matrix.each_index ${k('do')} |r|`],
      [null, `    matrix[0].each_index ${k('do')} |c|`],
      ['scan', `      best = [best, climb(matrix, memo, r, c)].max`],
      [null, `    ${k('end')}`],
      [null, `  ${k('end')}`],
      ['ret', `  best`],
      [null, `${k('end')}`],
      [null, ``],
      [null, `${k('def')} climb(matrix, memo, r, c) ${c('# the longest increasing path starting at (r, c)')}`],
      ['hit', `  ${k('return')} memo[r][c] ${k('if')} memo[r][c] &gt; 0`],
      ['start', `  best = 1`],
      [null, `  [[1, 0], [-1, 0], [0, 1], [0, -1]].each ${k('do')} |dr, dc|`],
      ['look', `    x, y = r + dr, c + dc`],
      ['look', `    next ${k('unless')} x.between?(0, matrix.length - 1) &amp;&amp; y.between?(0, matrix[0].length - 1) &amp;&amp; matrix[x][y] &gt; matrix[r][c]`],
      ['step', `    best = [best, 1 + climb(matrix, memo, x, y)].max`],
      [null, `  ${k('end')}`],
      ['save', `  memo[r][c] = best`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('import')} sys`],
      [null, `sys.setrecursionlimit(100_000)                  ${c('# a path can wind through all 40,000 cells')}`],
      [null, ``],
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} longestIncreasingPath(self, matrix):`],
      [null, `        m, n = len(matrix), len(matrix[0])`],
      ['init', `        memo = [[0] * n ${k('for')} _ ${k('in')} range(m)]      ${c('# 0 = not worked out yet')}`],
      [null, ``],
      [null, `        ${k('def')} climb(r, c):                        ${c('# the longest increasing path starting at (r, c)')}`],
      ['hit', `            ${k('if')} memo[r][c]:`],
      ['hit', `                ${k('return')} memo[r][c]`],
      ['start', `            best = 1`],
      [null, `            ${k('for')} dr, dc ${k('in')} ((1, 0), (-1, 0), (0, 1), (0, -1)):`],
      ['look', `                x, y = r + dr, c + dc`],
      ['look', `                ${k('if')} 0 &lt;= x &lt; m and 0 &lt;= y &lt; n and matrix[x][y] &gt; matrix[r][c]:`],
      ['step', `                    best = max(best, 1 + climb(x, y))`],
      ['save', `            memo[r][c] = best`],
      ['save', `            ${k('return')} best`],
      [null, ``],
      [null, `        best = 0`],
      [null, `        ${k('for')} r ${k('in')} range(m):`],
      [null, `            ${k('for')} c ${k('in')} range(n):`],
      ['scan', `                best = max(best, climb(r, c))`],
      ['ret', `        ${k('return')} best`],
    ],
    javascript: [
      [null, `${k('var')} longestIncreasingPath = ${k('function')} (matrix) {`],
      [null, `  ${k('const')} m = matrix.length, n = matrix[0].length;`],
      ['init', `  ${k('const')} memo = Array.from({ length: m }, () =&gt; ${k('new')} Array(n).fill(0)); ${c('// 0 = not worked out yet')}`],
      [null, `  ${k('const')} climb = (r, c) =&gt; { ${c('// the longest increasing path starting at (r, c)')}`],
      ['hit', `    ${k('if')} (memo[r][c] &gt; 0) ${k('return')} memo[r][c];`],
      ['start', `    ${k('let')} best = 1;`],
      [null, `    ${k('for')} (${k('const')} [dr, dc] ${k('of')} [[1, 0], [-1, 0], [0, 1], [0, -1]]) {`],
      ['look', `      ${k('const')} x = r + dr, y = c + dc;`],
      ['look', `      ${k('if')} (x &lt; 0 || x &gt;= m || y &lt; 0 || y &gt;= n || matrix[x][y] &lt;= matrix[r][c]) continue;`],
      ['step', `      best = Math.max(best, 1 + climb(x, y));`],
      [null, `    }`],
      ['save', `    ${k('return')} (memo[r][c] = best);`],
      [null, `  };`],
      [null, `  ${k('let')} best = 0;`],
      [null, `  ${k('for')} (${k('let')} r = 0; r &lt; m; r++) {`],
      ['scan', `    ${k('for')} (${k('let')} c = 0; c &lt; n; c++) best = Math.max(best, climb(r, c));`],
      [null, `  }`],
      ['ret', `  ${k('return')} best;`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} longestIncreasingPath(matrix [][]int) int {`],
      [null, `    m, n := len(matrix), len(matrix[0])`],
      ['init', `    memo := make([][]int, m)                 ${c('// 0 = not worked out yet')}`],
      ['init', `    ${k('for')} i := ${k('range')} memo {`],
      ['init', `        memo[i] = make([]int, n)`],
      ['init', `    }`],
      [null, `    ${k('var')} climb ${k('func')}(r, c int) int             ${c('// the longest increasing path starting at (r, c)')}`],
      [null, `    climb = ${k('func')}(r, c int) int {`],
      ['hit', `        ${k('if')} memo[r][c] &gt; 0 {`],
      ['hit', `            ${k('return')} memo[r][c]`],
      [null, `        }`],
      ['start', `        best := 1`],
      [null, `        ${k('for')} _, d := ${k('range')} [][2]int{{1, 0}, {-1, 0}, {0, 1}, {0, -1}} {`],
      ['look', `            x, y := r+d[0], c+d[1]`],
      ['look', `            ${k('if')} x &gt;= 0 &amp;&amp; x &lt; m &amp;&amp; y &gt;= 0 &amp;&amp; y &lt; n &amp;&amp; matrix[x][y] &gt; matrix[r][c] {`],
      ['step', `                best = max(best, 1+climb(x, y))`],
      [null, `            }`],
      [null, `        }`],
      ['save', `        memo[r][c] = best`],
      ['save', `        ${k('return')} best`],
      [null, `    }`],
      [null, `    best := 0`],
      [null, `    ${k('for')} r := 0; r &lt; m; r++ {`],
      [null, `        ${k('for')} c := 0; c &lt; n; c++ {`],
      ['scan', `            best = max(best, climb(r, c))`],
      [null, `        }`],
      [null, `    }`],
      ['ret', `    ${k('return')} best`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} longest_increasing_path(matrix: Vec&lt;Vec&lt;i32&gt;&gt;) -&gt; i32 {`],
      ['init', `        ${k('let')} ${k('mut')} memo = vec![vec![0; matrix[0].len()]; matrix.len()]; ${c('// 0 = not worked out yet')}`],
      [null, `        ${k('let')} ${k('mut')} best = 0;`],
      [null, `        ${k('for')} r ${k('in')} 0..matrix.len() {`],
      [null, `            ${k('for')} c ${k('in')} 0..matrix[0].len() {`],
      ['scan', `                best = best.max(${k('Self')}::climb(&amp;matrix, &amp;${k('mut')} memo, r, c));`],
      [null, `            }`],
      [null, `        }`],
      ['ret', `        best`],
      [null, `    }`],
      [null, ``],
      [null, `    ${c('// the longest increasing path starting at (r, c)')}`],
      [null, `    ${k('fn')} climb(matrix: &amp;Vec&lt;Vec&lt;i32&gt;&gt;, memo: &amp;${k('mut')} Vec&lt;Vec&lt;i32&gt;&gt;, r: usize, c: usize) -&gt; i32 {`],
      ['hit', `        ${k('if')} memo[r][c] &gt; 0 {`],
      ['hit', `            ${k('return')} memo[r][c];`],
      [null, `        }`],
      ['start', `        ${k('let')} ${k('mut')} best = 1;`],
      [null, `        ${k('for')} (dr, dc) ${k('in')} [(1, 0), (-1, 0), (0, 1), (0, -1)] {`],
      ['look', `            ${k('let')} (x, y) = (r as i32 + dr, c as i32 + dc);`],
      ['look', `            ${k('if')} x &lt; 0 || y &lt; 0 || x as usize &gt;= matrix.len() || y as usize &gt;= matrix[0].len() {`],
      ['look', `                continue;`],
      [null, `            }`],
      [null, `            ${k('let')} (x, y) = (x as usize, y as usize);`],
      ['look', `            ${k('if')} matrix[x][y] &gt; matrix[r][c] {`],
      ['step', `                best = best.max(1 + ${k('Self')}::climb(matrix, memo, x, y));`],
      [null, `            }`],
      [null, `        }`],
      ['save', `        memo[r][c] = best;`],
      ['save', `        best`],
      [null, `    }`],
      [null, `}`],
    ],
  },
  peel: {
    ruby: [
      [null, `${k('def')} longest_increasing_path(matrix)`],
      [null, `  m, n = matrix.length, matrix[0].length`],
      [null, `  dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]]`],
      ['count', `  higher = Array.new(m) { Array.new(n, 0) } ${c('# how many neighbours are larger')}`],
      [null, `  m.times ${k('do')} |r|`],
      [null, `    n.times ${k('do')} |c|`],
      [null, `      dirs.each ${k('do')} |dr, dc|`],
      [null, `        x, y = r + dr, c + dc`],
      ['count', `        higher[r][c] += 1 ${k('if')} x.between?(0, m - 1) &amp;&amp; y.between?(0, n - 1) &amp;&amp; matrix[x][y] &gt; matrix[r][c]`],
      [null, `      ${k('end')}`],
      [null, `    ${k('end')}`],
      [null, `  ${k('end')}`],
      [null, `  layer = []`],
      ['peaks', `  m.times { |r| n.times { |c| layer &lt;&lt; [r, c] ${k('if')} higher[r][c].zero? } } ${c('# the peaks')}`],
      [null, `  layers = 0`],
      [null, `  ${k('until')} layer.empty?`],
      ['layer', `    layers += 1`],
      [null, `    below = []`],
      [null, `    layer.each ${k('do')} |r, c|`],
      [null, `      dirs.each ${k('do')} |dr, dc|`],
      [null, `        x, y = r + dr, c + dc`],
      ['look', `        next ${k('unless')} x.between?(0, m - 1) &amp;&amp; y.between?(0, n - 1) &amp;&amp; matrix[x][y] &lt; matrix[r][c]`],
      ['drop', `        higher[x][y] -= 1`],
      ['ready', `        below &lt;&lt; [x, y] ${k('if')} higher[x][y].zero? ${c('# every larger neighbour is peeled')}`],
      [null, `      ${k('end')}`],
      [null, `    ${k('end')}`],
      ['next', `    layer = below`],
      [null, `  ${k('end')}`],
      ['ret', `  layers`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} longestIncreasingPath(self, matrix):`],
      [null, `        m, n = len(matrix), len(matrix[0])`],
      [null, `        dirs = ((1, 0), (-1, 0), (0, 1), (0, -1))`],
      ['count', `        higher = [[0] * n ${k('for')} _ ${k('in')} range(m)]    ${c('# how many neighbours are larger')}`],
      [null, `        ${k('for')} r ${k('in')} range(m):`],
      [null, `            ${k('for')} c ${k('in')} range(n):`],
      [null, `                ${k('for')} dr, dc ${k('in')} dirs:`],
      [null, `                    x, y = r + dr, c + dc`],
      ['count', `                    ${k('if')} 0 &lt;= x &lt; m and 0 &lt;= y &lt; n and matrix[x][y] &gt; matrix[r][c]:`],
      ['count', `                        higher[r][c] += 1`],
      ['peaks', `        layer = [(r, c) ${k('for')} r ${k('in')} range(m) ${k('for')} c ${k('in')} range(n) ${k('if')} higher[r][c] == 0]   ${c('# the peaks')}`],
      [null, `        layers = 0`],
      [null, `        ${k('while')} layer:`],
      ['layer', `            layers += 1`],
      [null, `            below = []`],
      [null, `            ${k('for')} r, c ${k('in')} layer:`],
      [null, `                ${k('for')} dr, dc ${k('in')} dirs:`],
      [null, `                    x, y = r + dr, c + dc`],
      ['look', `                    ${k('if')} 0 &lt;= x &lt; m and 0 &lt;= y &lt; n and matrix[x][y] &lt; matrix[r][c]:`],
      ['drop', `                        higher[x][y] -= 1`],
      ['ready', `                        ${k('if')} higher[x][y] == 0:           ${c('# every larger neighbour is peeled')}`],
      ['ready', `                            below.append((x, y))`],
      ['next', `            layer = below`],
      ['ret', `        ${k('return')} layers`],
    ],
    javascript: [
      [null, `${k('var')} longestIncreasingPath = ${k('function')} (matrix) {`],
      [null, `  ${k('const')} m = matrix.length, n = matrix[0].length;`],
      [null, `  ${k('const')} dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];`],
      [null, `  ${k('const')} inside = (x, y) =&gt; x &gt;= 0 &amp;&amp; x &lt; m &amp;&amp; y &gt;= 0 &amp;&amp; y &lt; n;`],
      ['count', `  ${k('const')} higher = Array.from({ length: m }, () =&gt; ${k('new')} Array(n).fill(0)); ${c('// how many neighbours are larger')}`],
      [null, `  ${k('for')} (${k('let')} r = 0; r &lt; m; r++) {`],
      [null, `    ${k('for')} (${k('let')} c = 0; c &lt; n; c++) {`],
      [null, `      ${k('for')} (${k('const')} [dr, dc] ${k('of')} dirs) {`],
      ['count', `        ${k('if')} (inside(r + dr, c + dc) &amp;&amp; matrix[r + dr][c + dc] &gt; matrix[r][c]) higher[r][c]++;`],
      [null, `      }`],
      [null, `    }`],
      [null, `  }`],
      [null, `  ${k('let')} layer = [];`],
      [null, `  ${k('for')} (${k('let')} r = 0; r &lt; m; r++) {`],
      ['peaks', `    ${k('for')} (${k('let')} c = 0; c &lt; n; c++) ${k('if')} (higher[r][c] === 0) layer.push([r, c]); ${c('// the peaks')}`],
      [null, `  }`],
      [null, `  ${k('let')} layers = 0;`],
      [null, `  ${k('while')} (layer.length) {`],
      ['layer', `    layers++;`],
      [null, `    ${k('const')} below = [];`],
      [null, `    ${k('for')} (${k('const')} [r, c] ${k('of')} layer) {`],
      [null, `      ${k('for')} (${k('const')} [dr, dc] ${k('of')} dirs) {`],
      [null, `        ${k('const')} x = r + dr, y = c + dc;`],
      ['look', `        ${k('if')} (!inside(x, y) || matrix[x][y] &gt;= matrix[r][c]) continue;`],
      ['drop', `        higher[x][y]--;`],
      ['ready', `        ${k('if')} (higher[x][y] === 0) below.push([x, y]); ${c('// every larger neighbour is peeled')}`],
      [null, `      }`],
      [null, `    }`],
      ['next', `    layer = below;`],
      [null, `  }`],
      ['ret', `  ${k('return')} layers;`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} longestIncreasingPath(matrix [][]int) int {`],
      [null, `    m, n := len(matrix), len(matrix[0])`],
      [null, `    dirs := [][2]int{{1, 0}, {-1, 0}, {0, 1}, {0, -1}}`],
      [null, `    inside := ${k('func')}(x, y int) bool { ${k('return')} x &gt;= 0 &amp;&amp; x &lt; m &amp;&amp; y &gt;= 0 &amp;&amp; y &lt; n }`],
      ['count', `    higher := make([][]int, m)               ${c('// how many neighbours are larger')}`],
      [null, `    layer := [][2]int{}`],
      [null, `    ${k('for')} r := 0; r &lt; m; r++ {`],
      ['count', `        higher[r] = make([]int, n)`],
      [null, `        ${k('for')} c := 0; c &lt; n; c++ {`],
      [null, `            ${k('for')} _, d := ${k('range')} dirs {`],
      ['count', `                ${k('if')} x, y := r+d[0], c+d[1]; inside(x, y) &amp;&amp; matrix[x][y] &gt; matrix[r][c] {`],
      ['count', `                    higher[r][c]++`],
      [null, `                }`],
      [null, `            }`],
      [null, `        }`],
      [null, `    }`],
      [null, `    ${k('for')} r := 0; r &lt; m; r++ {`],
      [null, `        ${k('for')} c := 0; c &lt; n; c++ {`],
      ['peaks', `            ${k('if')} higher[r][c] == 0 {               ${c('// the peaks')}`],
      ['peaks', `                layer = append(layer, [2]int{r, c})`],
      [null, `            }`],
      [null, `        }`],
      [null, `    }`],
      [null, `    layers := 0`],
      [null, `    ${k('for')} len(layer) &gt; 0 {`],
      ['layer', `        layers++`],
      [null, `        below := [][2]int{}`],
      [null, `        ${k('for')} _, p := ${k('range')} layer {`],
      [null, `            ${k('for')} _, d := ${k('range')} dirs {`],
      [null, `                x, y := p[0]+d[0], p[1]+d[1]`],
      ['look', `                ${k('if')} !inside(x, y) || matrix[x][y] &gt;= matrix[p[0]][p[1]] {`],
      ['look', `                    continue`],
      [null, `                }`],
      ['drop', `                higher[x][y]--`],
      ['ready', `                ${k('if')} higher[x][y] == 0 {           ${c('// every larger neighbour is peeled')}`],
      ['ready', `                    below = append(below, [2]int{x, y})`],
      [null, `                }`],
      [null, `            }`],
      [null, `        }`],
      ['next', `        layer = below`],
      [null, `    }`],
      ['ret', `    ${k('return')} layers`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} longest_increasing_path(matrix: Vec&lt;Vec&lt;i32&gt;&gt;) -&gt; i32 {`],
      [null, `        ${k('let')} (m, n) = (matrix.len() as i32, matrix[0].len() as i32);`],
      [null, `        ${k('let')} dirs = [(1, 0), (-1, 0), (0, 1), (0, -1)];`],
      [null, `        ${k('let')} inside = |x: i32, y: i32| x &gt;= 0 &amp;&amp; x &lt; m &amp;&amp; y &gt;= 0 &amp;&amp; y &lt; n;`],
      [null, `        ${k('let')} at = |x: i32, y: i32| matrix[x as usize][y as usize];`],
      ['count', `        ${k('let')} ${k('mut')} higher = vec![vec![0; n as usize]; m as usize]; ${c('// how many neighbours are larger')}`],
      [null, `        ${k('let')} ${k('mut')} layer = vec![];`],
      [null, `        ${k('for')} r ${k('in')} 0..m {`],
      [null, `            ${k('for')} c ${k('in')} 0..n {`],
      [null, `                ${k('for')} (dr, dc) ${k('in')} dirs {`],
      ['count', `                    ${k('if')} inside(r + dr, c + dc) &amp;&amp; at(r + dr, c + dc) &gt; at(r, c) {`],
      ['count', `                        higher[r as usize][c as usize] += 1;`],
      [null, `                    }`],
      [null, `                }`],
      [null, `            }`],
      [null, `        }`],
      [null, `        ${k('for')} r ${k('in')} 0..m {`],
      [null, `            ${k('for')} c ${k('in')} 0..n {`],
      ['peaks', `                ${k('if')} higher[r as usize][c as usize] == 0 { ${c('// the peaks')}`],
      ['peaks', `                    layer.push((r, c));`],
      [null, `                }`],
      [null, `            }`],
      [null, `        }`],
      [null, `        ${k('let')} ${k('mut')} layers = 0;`],
      [null, `        ${k('while')} !layer.is_empty() {`],
      ['layer', `            layers += 1;`],
      [null, `            ${k('let')} ${k('mut')} below = vec![];`],
      [null, `            ${k('for')} &amp;(r, c) ${k('in')} &amp;layer {`],
      [null, `                ${k('for')} (dr, dc) ${k('in')} dirs {`],
      [null, `                    ${k('let')} (x, y) = (r + dr, c + dc);`],
      ['look', `                    ${k('if')} !inside(x, y) || at(x, y) &gt;= at(r, c) {`],
      ['look', `                        continue;`],
      [null, `                    }`],
      ['drop', `                    higher[x as usize][y as usize] -= 1;`],
      ['ready', `                    ${k('if')} higher[x as usize][y as usize] == 0 { ${c('// every larger neighbour is peeled')}`],
      ['ready', `                        below.push((x, y));`],
      [null, `                    }`],
      [null, `                }`],
      [null, `            }`],
      ['next', `            layer = below;`],
      [null, `        }`],
      ['ret', `        layers`],
      [null, `    }`],
      [null, `}`],
    ],
  },
};


/* ---------------- part 1: the "climb from here" widget ----------------
 *
 * Two words carry the statement: "increasing", which means strictly, and the
 * four directions. Click any cell to see the longest increasing path that
 * starts there; switch on diagonals to see the answer people get when they
 * misread the moves. */

const QW_SETS = [
  { label: exampleTitle(1), g: [[9, 9, 4], [6, 6, 8], [2, 1, 1]] },
  { label: exampleTitle(2), g: [[3, 4, 5], [3, 2, 6], [2, 2, 1]] },
  { label: t('equal steps', 'တူညီသော အဆင့်'), g: [[1, 2, 3], [2, 2, 4], [3, 4, 5]] },
];
const EIGHT = [...DIRS, [1, 1], [1, -1], [-1, 1], [-1, -1]];

function longestFrom(g, dirs) {
  const memo = g.map((row) => row.map(() => null));
  const go = (r, c) => {
    if (memo[r][c]) return memo[r][c];
    let best = { len: 1, next: null };
    for (const [dr, dc] of dirs) {
      const x = r + dr, y = c + dc;
      if (inGrid(g, x, y) && g[x][y] > g[r][c] && go(x, y).len + 1 > best.len) best = { len: go(x, y).len + 1, next: [x, y] };
    }
    return (memo[r][c] = best);
  };
  return go;
}

function mountClimbWidget(host) {
  const state = { set: 0, eight: false, r: 2, c: 1 };
  host.innerHTML = `
    <div class="lip-w q-grid" data-grid></div>
    <div class="q-slider"><span class="q-presets" data-presets></span></div>
    <div class="q-slider"><span class="q-presets" data-conn></span></div>
    <p class="q-tie" data-line></p>
    <div class="ledger">
      <span class="expr" data-expr></span>
      <span class="total" data-total></span>
    </div>`;
  const q = (sel) => host.querySelector(sel);

  function render() {
    const g = QW_SETS[state.set].g;
    const go = longestFrom(g, state.eight ? EIGHT : DIRS);
    const four = longestFrom(g, DIRS);
    const path = [];
    for (let p = [state.r, state.c]; p; p = go(p[0], p[1]).next) path.push(p);
    let best = 0;
    for (let r = 0; r < g.length; r++) for (let c = 0; c < g[0].length; c++) best = Math.max(best, go(r, c).len);
    let best4 = 0;
    for (let r = 0; r < g.length; r++) for (let c = 0; c < g[0].length; c++) best4 = Math.max(best4, four(r, c).len);
    const on = new Set(path.map(([r, c]) => `${r},${c}`));
    q('[data-presets]').innerHTML = presetChips(QW_SETS, state.set);
    q('[data-conn]').innerHTML = [
      [false, t('up, down, left, right', 'အပေါ်၊ အောက်၊ ဘယ်၊ ညာ')], [true, t('diagonals too (a misreading)', 'ထောင့်ဖြတ်ပါ (အလွဲဖတ်ခြင်း)')],
    ].map(([v, text]) => `<button class="chip" data-eight="${v}"${v === state.eight ? ' aria-pressed="true"' : ''}>${pick(text)}</button>`).join('');
    q('[data-grid]').innerHTML = g.map((row, r) => `<div class="q-arr">${row.map((v, c) =>
      `<div class="cell ${on.has(`${r},${c}`) ? 'kept' : 'cut'}${r === state.r && c === state.c ? ' start' : ''}" role="button" tabindex="0" data-r="${r}" data-c="${c}" aria-label="start at ${r},${c}"><span>${v}</span><span class="idx">${r},${c}</span></div>`).join('')}</div>`).join('');
    widgetLabel(pick(t('click a cell to start there', 'စမည့် cell ကို နှိပ်ပါ')));
    const len = path.length;
    q('[data-line]').innerHTML = pick(state.eight && best !== best4
      ? t(`With diagonals the longest path is ${best} — but the statement allows only up, down, left and right, so the answer is ${best4}.`,
          `ထောင့်ဖြတ်ပါလျှင် အရှည်ဆုံး path သည် ${best} — သို့သော် မေးခွန်းက အပေါ်၊ အောက်၊ ဘယ်၊ ညာ သာ ခွင့်ပြုသဖြင့် အဖြေမှာ ${best4}။`)
      : len === best
        ? t(`From ${cell(state.r, state.c)} the path climbs ${len} cells — as long as any path here. Each step goes to a strictly larger neighbour; equal values do not count.`,
            `${cell(state.r, state.c)} မှ path သည် cell ${len} ခု တက်သည် — ဤနေရာရှိ မည်သည့် path ကဲ့သို့မဆို ရှည်သည်။ အဆင့်တိုင်း တင်းကျပ်စွာ ပိုကြီးသော အိမ်နီးသို့ သွားသည် — တူညီသော value များ မရေတွက်ပါ။`)
        : t(`From ${cell(state.r, state.c)} the longest path is ${len} ${len === 1 ? 'cell' : 'cells'}. Another start does better: ${best}.`,
            `${cell(state.r, state.c)} မှ အရှည်ဆုံး path သည် cell ${len} ခု။ အခြား အစက ပိုကောင်းသည် — ${best}။`));
    q('[data-expr]').innerHTML = path.map(([r, c]) => g[r][c]).join(' → ');
    q('[data-total]').innerHTML = `${best}<small>${pick(t('longest', 'အရှည်ဆုံး'))}</small>`;
  }
  function choose(el) {
    state.r = Number(el.dataset.r); state.c = Number(el.dataset.c);
    render();
    host.querySelector(`[data-r="${state.r}"][data-c="${state.c}"]`)?.focus();
  }
  host.addEventListener('click', (ev) => {
    const chip = ev.target.closest('[data-set]');
    if (chip) { state.set = Number(chip.dataset.set); state.r = 0; state.c = 0; return render(); }
    const conn = ev.target.closest('[data-eight]');
    if (conn) { state.eight = conn.dataset.eight === 'true'; return render(); }
    const el = ev.target.closest('[data-r]');
    if (el) choose(el);
  });
  host.addEventListener('keydown', (ev) => {
    const el = ev.target.closest('[data-r]');
    if (el && (ev.key === 'Enter' || ev.key === ' ')) { ev.preventDefault(); choose(el); }
  });
  onLangChange(render);
  render();
}

/* ---------------- the approach, in brief ---------------- */

const APPROACH = {
  memo: {
    idea: t('The longest path starting at a cell is 1 plus the longest starting at its best larger neighbour. That never changes, so work it out once per cell with a DFS and keep it in a memo table.',
            'cell တစ်ခုမှ စသော အရှည်ဆုံး path သည် 1 နှင့် ၎င်း၏ အကောင်းဆုံး ပိုကြီးသော အိမ်နီးမှ စသော အရှည်ဆုံး ပေါင်းလဒ်။ ၎င်း ဘယ်တော့မှ မပြောင်းသဖြင့် DFS ဖြင့် cell တစ်ခုလျှင် တစ်ကြိမ် တွက်ပြီး memo table ထဲ ထားသည်။'),
    steps: [
      t('<code>climb(r, c)</code>: if <code>memo[r][c]</code> is set, return it.', '<code>climb(r, c)</code> — <code>memo[r][c]</code> ရှိပြီးလျှင် ၎င်းကို ပြန်ပေး။'),
      t('Otherwise <code>best = 1</code>, and for each neighbour strictly larger, <code>best = max(best, 1 + climb(x, y))</code>.', 'မဟုတ်လျှင် <code>best = 1</code>၊ တင်းကျပ်စွာ ပိုကြီးသော အိမ်နီးတိုင်းအတွက် <code>best = max(best, 1 + climb(x, y))</code>။'),
      t('Save <code>best</code> in <code>memo[r][c]</code>; the answer is the largest <code>climb</code> over every cell.', '<code>best</code> ကို <code>memo[r][c]</code> ထဲ သိမ်း — အဖြေမှာ cell တိုင်းပေါ်ရှိ အကြီးဆုံး <code>climb</code>။'),
    ],
    cost: t('Each cell is worked out once and looks at four neighbours: O(m·n). The calls go as deep as the longest path they follow — 20,099 on a 200 × 200 grid built for it.',
            'cell တစ်ခုစီကို တစ်ကြိမ် တွက်ပြီး အိမ်နီး လေးခုကို ကြည့်သည် — O(m·n)။ call များသည် လိုက်သော အရှည်ဆုံး path အထိ နက်သည် — ထိုအတွက် တည်ဆောက်ထားသော 200 × 200 grid တွင် 20,099။'),
  },
  peel: {
    idea: t('Peaks — cells with no larger neighbour — end every path. Peel them off, then every cell left with no larger neighbour, layer by layer. The number of layers is the answer.',
            'peak များ — ပိုကြီးသော အိမ်နီး မရှိသော cell များ — သည် path တိုင်းကို အဆုံးသတ်သည်။ ၎င်းတို့ကို ခွာပြီး ပိုကြီးသော အိမ်နီး မကျန်တော့သော cell တိုင်းကို layer အလိုက် ခွာသည်။ layer အရေအတွက်သည် အဖြေ။'),
    steps: [
      t('<code>higher[r][c]</code> = how many neighbours are larger; the cells at 0 are the first layer.', '<code>higher[r][c]</code> = ပိုကြီးသော အိမ်နီး အရေအတွက် — 0 ရှိသော cell များသည် ပထမ layer။'),
      t('For each cell in the layer, every smaller neighbour loses one from <code>higher</code>; one that reaches 0 joins the next layer.', 'layer ထဲရှိ cell တစ်ခုစီအတွက် ပိုငယ်သော အိမ်နီးတိုင်း၏ <code>higher</code> တစ်ခု လျော့သည် — 0 ရောက်သည့်အရာ နောက် layer ထဲ ဝင်သည်။'),
      t('Count the layers until none is left.', 'layer မကျန်တော့သည်အထိ ရေတွက်သည်။'),
    ],
    cost: t('Every cell is peeled once and its four neighbours touched: O(m·n) time, O(m·n) space, and no recursion.', 'cell တိုင်းကို တစ်ကြိမ် ခွာပြီး အိမ်နီး လေးခုကို ထိသည် — O(m·n) အချိန်၊ O(m·n) memory၊ recursion မပါ။'),
  },
};

/* ---------------- mount ---------------- */

const EX1 = [[9, 9, 4], [6, 6, 8], [2, 1, 1]];
const EX2 = [[3, 4, 5], [3, 2, 6], [2, 2, 1]];
const exHtml = (g) => `<code>matrix = [${g.map((r) => `[${r.join(',')}]`).join(',')}]</code>`;

mountLesson({
  input: { matrix: EX1 },
  controls: [
    { key: 'matrix', label: t('matrix (rows split by ;)', 'matrix (row များကို ; ဖြင့် ခွဲ)'), parse: parseMatrix, format: fmtMatrix },
  ],
  presets: [
    { label: exampleTitle(1), input: { matrix: EX1 } },
    { label: exampleTitle(2), input: { matrix: EX2 } },
    { label: exampleTitle(3), input: { matrix: [[1]] } },
    { label: t('a winding path', 'ကွေ့ကောက်သော path'), input: { matrix: [[1, 2, 3], [0, 0, 4], [7, 6, 5]] } },
  ],
  examples: [
    { title: exampleTitle(1), inputHtml: exHtml(EX1), output: '4',
      why: [t('The longest increasing path is [1, 2, 6, 9].', 'အရှည်ဆုံး increasing path သည် [1, 2, 6, 9]။')], load: { matrix: EX1 } },
    { title: exampleTitle(2), inputHtml: exHtml(EX2), output: '4',
      why: [t('The longest increasing path is [3, 4, 5, 6]. Moving diagonally is not allowed.', 'အရှည်ဆုံး increasing path သည် [3, 4, 5, 6]။ ထောင့်ဖြတ် ရွှေ့ခွင့် မရှိ။')], load: { matrix: EX2 } },
    { title: exampleTitle(3), inputHtml: '<code>matrix = [[1]]</code>', output: '1', why: [], load: { matrix: [[1]] } },
  ],
  modes: [
    { id: 'memo', name: 'DFS with a memo',
      sub: t('recursive', 'recursive'),
      desc: t('Work out each cell\'s longest path once, recursing into larger neighbours.', 'cell တစ်ခုစီ၏ အရှည်ဆုံး path ကို တစ်ကြိမ် တွက်သည် — ပိုကြီးသော အိမ်နီးများထဲ recurse ဝင်သည်။'),
      cost: 'O(m·n) time · O(m·n) memo and stack', build: buildMemo },
    { id: 'peel', name: 'Peel the peaks',
      sub: t('layer by layer', 'layer အလိုက်'),
      desc: t('Peel cells with no larger neighbour left, one layer at a time, and count the layers.', 'ပိုကြီးသော အိမ်နီး မကျန်သော cell များကို layer တစ်ခုစီ ခွာပြီး layer များကို ရေတွက်သည်။'),
      cost: 'O(m·n) time · O(m·n) space, no recursion', build: buildPeel },
  ],
  languages: LANGUAGES,
  code: CODE,
  solutions: {
    memo: { approach: APPROACH.memo,
      desc: t('The answer most people write: short, and fast once the memo is there. Its depth is the catch — a grid built as one long winding path takes the calls past 20,000 deep, beyond the default stack of Ruby and Node.',
              'လူအများစု ရေးသော အဖြေ — တိုပြီး memo ရှိလျှင် မြန်သည်။ ပြဿနာမှာ အနက် — ရှည်လျားကွေ့ကောက်သော path တစ်ခုအဖြစ် တည်ဆောက်ထားသော grid က call များကို 20,000 ဆင့်ကျော် နက်စေပြီး Ruby နှင့် Node ၏ default stack ကို ကျော်သည်။') },
    peel: { approach: APPROACH.peel,
      desc: t('The same O(m·n) with no recursion: a topological sort of the cells, from the peaks down. Nothing to worry about on any stack.',
              'recursion မပါသော O(m·n) အတူတူ — cell များကို peak မှ အောက်သို့ topological sort လုပ်ခြင်း။ မည်သည့် stack တွင်မဆို စိုးရိမ်စရာ မရှိ။') },
  },
  // How each language was actually checked, printed as the part 3 badges.
  // The corpus: the 3 examples, 6 edges, 15,000 random grids up to 5 × 6 over
  // 0..4, 5,000 up to 30 × 30, and seven at 200 × 200 (a snake, the snake
  // reversed, a walled snake 20,099 calls deep, r + c, all equal, a
  // checkerboard, random values to 2³¹ − 1) — against an oracle that sorts
  // the cells by value. Go and Rust ran in Docker (golang:1.23-alpine,
  // rust:1-slim) on their default stacks. The memo DFS limits were measured
  // cold, one walled snake per process, on each default stack.
  verification: {
    ruby: { memo: 'ran here · overflows Ruby 3.1\'s default stack past 2,846 calls deep', peel: 'ran here · 20,016 cases' },
    python: { memo: 'ran here · 20,016 cases, 20,099 calls deep', peel: 'ran here · 20,016 cases' },
    javascript: { memo: 'ran here · overflows Node 24\'s default stack past 4,609 calls deep', peel: 'ran here · 20,016 cases' },
    go: 'ran here · 20,016 cases · Go 1.23',
    rust: 'ran here · 20,016 cases · rustc 1.98',
  },
  caveats: {
    memo: {
      ruby: t('Correct on all 20,016 cases with a larger stack, but on Ruby 3.1\'s default stack a path that forces more than 2,846 nested calls overflows it (<code>SystemStackError</code>) — measured here — and a 200 × 200 grid can force 20,099. Use the peeling version.',
              'stack ပိုကြီးလျှင် case 20,016 ခုလုံးတွင် မှန်သည်၊ သို့သော် Ruby 3.1 ၏ default stack ပေါ်တွင် nested call 2,846 ထက် များစေသော path က overflow (<code>SystemStackError</code>) ဖြစ်စေသည် — ဤနေရာတွင် တိုင်းတာထားသည် — 200 × 200 grid က 20,099 အထိ ဖြစ်စေနိုင်သည်။ ခွာသည့် version ကို သုံးပါ။'),
      javascript: t('Correct on all 20,016 cases with a larger stack, but on Node 24\'s default stack, run cold, more than 4,609 nested calls overflow it (<code>RangeError</code>) — measured here — and a 200 × 200 grid can force 20,099. Use the peeling version.',
                    'stack ပိုကြီးလျှင် case 20,016 ခုလုံးတွင် မှန်သည်၊ သို့သော် Node 24 ၏ default stack ပေါ်တွင် cold run လုပ်လျှင် nested call 4,609 ထက် များလျှင် overflow (<code>RangeError</code>) ဖြစ်သည် — ဤနေရာတွင် တိုင်းတာထားသည် — 200 × 200 grid က 20,099 အထိ ဖြစ်စေနိုင်သည်။ ခွာသည့် version ကို သုံးပါ။'),
      python: t('The <code>setrecursionlimit</code> line is part of the answer: Python\'s default of 1,000 is far below the 20,099 calls a 200 × 200 grid can force.',
                '<code>setrecursionlimit</code> စာကြောင်းသည် အဖြေ၏ အစိတ်အပိုင်း — Python ၏ default 1,000 သည် 200 × 200 grid ဖြစ်စေနိုင်သော call 20,099 ထက် အများကြီး နိမ့်သည်။'),
    },
  },
  stripLabel: t('matrix', 'matrix'),
  strip,
  draw,
  answer,
  vars,
  widget: mountClimbWidget,
});
