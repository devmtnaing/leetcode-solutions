/* Merge Intervals — LeetCode 56.
 *
 * Without sorting, a new interval could overlap any merged interval so far,
 * so each one is checked against all of them: the brute force below takes
 * the intervals in input order and lets each new one absorb every merged
 * interval it touches. Sorted by start, a new interval can only reach back to
 * the last merged one — anything earlier ended before the last one started —
 * so the sweep compares with one interval, not all of them.
 */
import { mountLesson, esc } from '../../lib/stepper.js';
import { pick, onLangChange } from '../../lib/i18n.js';
import { cells, readout, slots, stagePanel } from '../../lib/stage.js';
import { t, exampleTitle, LANGUAGES, k, c, stageGap, presetChips, widgetLabel } from '../../lib/kit.js';

const MAX_LEN = 8;
const TOP = 20;

function parseIntervals(text) {
  const nums = (text.match(/-?\d+/g) || []).map(Number);
  if (!nums.length || nums.length % 2) throw new Error('pairs like [1,3],[2,6]');
  const out = [];
  for (let x = 0; x < nums.length; x += 2) {
    const [a, b] = [nums[x], nums[x + 1]];
    if (a < 0 || b > TOP) throw new Error(`values from 0 to ${TOP}, so the timeline fits`);
    if (a > b) throw new Error(`[${a},${b}] ends before it starts`);
    out.push([a, b]);
  }
  if (out.length > MAX_LEN) throw new Error(`at most ${MAX_LEN} intervals, so the stage stays readable`);
  return out;
}

const fmt = ([a, b]) => `[${a},${b}]`;
const fmtAll = (list) => `[${list.map(fmt).join(',')}]`;

/* A row per interval on a doubled number line: cell 2x is the point x, cell
 * 2x + 1 the gap after it. Styled by this lesson's style.css. */
function timeline(rows, top = TOP) {
  const width = 2 * top + 1;
  const row = (r) => {
    const cellsHtml = Array.from({ length: width }, (_, x) => {
      const on = x >= 2 * r.lo && x <= 2 * r.hi;
      return `<i class="tl-c${on ? ' on' : ''}${x === 2 * r.lo ? ' s' : ''}${x === 2 * r.hi ? ' e' : ''}"></i>`;
    }).join('');
    return `<div class="tl-row${r.tone ? ` ${r.tone}` : ''}"><span class="tl-lab">${esc(r.label ?? fmt([r.lo, r.hi]))}</span><span class="tl-cells">${cellsHtml}</span></div>`;
  };
  const axis = Array.from({ length: width }, (_, x) => `<i class="tl-c">${x % 10 === 0 ? x / 2 : ''}</i>`).join('');
  return `<div class="tl">${rows.map((r) => (r === 'sep' ? '<div class="tl-sep"></div>' : row(r))).join('')}
    <div class="tl-row tl-axis"><span class="tl-lab"></span><span class="tl-cells">${axis}</span></div></div>`;
}

/* ---------------- step generators ---------------- */

function buildBrute({ intervals }) {
  const steps = [];
  let result = [];
  const snap = (extra) => ({ view: 'brute', order: intervals, result: result.map((x) => [...x]), idx: null, cur: null, fate: [], at: null, ...extra });

  steps.push(snap({ line: 'init', tag: t('empty', 'ဗလာ'),
    note: t('No sorting. Take the intervals in the order given, and keep <code>result</code> free of overlaps as each one arrives.',
            'sort မလုပ်ပါ။ interval များကို ပေးထားသည့် အစီအစဉ်အတိုင်း ယူပြီး တစ်ခုစီ ရောက်လာတိုင်း <code>result</code> တွင် overlap မရှိအောင် ထိန်းသည်။') }));

  intervals.forEach(([a0, b0], idx) => {
    let lo = a0;
    let hi = b0;
    const fate = [];
    steps.push(snap({ idx, cur: [lo, hi], fate: [], line: 'take', tag: t(`take ${fmt([lo, hi])}`, `${fmt([lo, hi])} ယူ`),
      note: result.length
        ? t(`Place <b>${fmt([lo, hi])}</b>. The input is not sorted, so it could overlap any of the ${result.length} merged ${result.length === 1 ? 'interval' : 'intervals'}: check them all.`,
            `<b>${fmt([lo, hi])}</b> ကို နေရာချသည်။ input ကို sort မလုပ်ထားသဖြင့် ပေါင်းပြီးသား interval ${result.length} ခုထဲက မည်သည့်တစ်ခုနှင့်မဆို overlap ဖြစ်နိုင်သည် — အားလုံးကို စစ်သည်။`)
        : t(`Place <b>${fmt([lo, hi])}</b>. Nothing is merged yet.`, `<b>${fmt([lo, hi])}</b> ကို နေရာချသည်။ ပေါင်းပြီးသား မရှိသေးပါ။`) }));
    result.forEach(([a, b], at) => {
      const apart = b < lo || hi < a;
      steps.push(snap({ idx, cur: [lo, hi], fate: [...fate], at, line: 'test', tag: apart ? t('apart', 'ခွဲ') : t('overlap', 'overlap'),
        note: apart
          ? t(`${fmt([a, b])} and ${fmt([lo, hi])}: ${b < lo ? `${b} &lt; ${lo}` : `${hi} &lt; ${a}`}, so they share no point.`,
              `${fmt([a, b])} နှင့် ${fmt([lo, hi])} — ${b < lo ? `${b} &lt; ${lo}` : `${hi} &lt; ${a}`} ဖြစ်သဖြင့် တူသော point မရှိပါ။`)
          : t(`${fmt([a, b])} and ${fmt([lo, hi])} share ${Math.max(a, lo) === Math.min(b, hi) ? `the point ${Math.max(a, lo)}` : `${Math.max(a, lo)}..${Math.min(b, hi)}`}: they overlap.`,
              `${fmt([a, b])} နှင့် ${fmt([lo, hi])} တွင် ${Math.max(a, lo) === Math.min(b, hi) ? `point ${Math.max(a, lo)}` : `${Math.max(a, lo)}..${Math.min(b, hi)}`} တူသည် — overlap ဖြစ်သည်။`) }));
      if (apart) {
        fate[at] = 'clear';
        steps.push(snap({ idx, cur: [lo, hi], fate: [...fate], at, line: 'keep', tag: t('keep', 'ထား'),
          note: t(`Keep ${fmt([a, b])} as it is.`, `${fmt([a, b])} ကို ဒီအတိုင်း ထားသည်။`) }));
      } else {
        const was = [lo, hi];
        lo = Math.min(lo, a);
        hi = Math.max(hi, b);
        fate[at] = 'gone';
        steps.push(snap({ idx, cur: [lo, hi], fate: [...fate], at, line: 'absorb', tag: t('absorb', 'ပေါင်းယူ'),
          note: t(`Absorb it: ${fmt(was)} grows to <b>${fmt([lo, hi])}</b>, and ${fmt([a, b])} leaves the list.`,
                  `ပေါင်းယူသည် — ${fmt(was)} သည် <b>${fmt([lo, hi])}</b> အထိ ကြီးလာပြီး ${fmt([a, b])} သည် list မှ ထွက်သွားသည်။`) }));
      }
    });
    const absorbed = fate.filter((f) => f === 'gone').length;
    result = [...result.filter((_, at) => fate[at] !== 'gone'), [lo, hi]];
    steps.push(snap({ idx, added: [lo, hi], line: 'add', tag: t('add', 'ထည့်'),
      note: t(`Add <b>${fmt([lo, hi])}</b>${absorbed ? `, which replaces the ${absorbed} it absorbed` : ''}. <code>result</code> now holds ${result.length}.`,
              `<b>${fmt([lo, hi])}</b> ကို ထည့်သည်${absorbed ? ` — ၎င်းပေါင်းယူခဲ့သော ${absorbed} ခု၏ နေရာတွင်` : ''}။ <code>result</code> တွင် ယခု ${result.length} ခု။`) }));
  });
  steps.push(snap({ line: 'ret', finished: true, tag: t('return', 'return'),
    note: t(`Return ${fmtAll(result)}. Every new interval was checked against every merged one.`,
            `${fmtAll(result)} ကို ပြန်ပေးသည်။ interval အသစ်တိုင်းကို ပေါင်းပြီးသား တစ်ခုစီနှင့် စစ်ခဲ့သည်။`) }));
  return steps;
}

function buildSweep({ intervals }) {
  const sorted = intervals.map((x, i) => [x, i]).sort((p, q) => p[0][0] - q[0][0] || p[1] - q[1]).map(([x]) => x);
  const steps = [];
  const result = [];
  const snap = (extra) => ({ view: 'sweep', order: sorted, result: result.map((x) => [...x]), idx: null, cur: null, ...extra });

  steps.push(snap({ line: 'sort', tag: t('sort', 'sort'),
    note: t(`Sort by start: ${fmtAll(intervals)} becomes <b>${fmtAll(sorted)}</b>. Now an interval can only overlap the one merged just before it.`,
            `start ဖြင့် sort လုပ်သည် — ${fmtAll(intervals)} သည် <b>${fmtAll(sorted)}</b> ဖြစ်လာသည်။ ယခု interval တစ်ခုသည် ၎င်းမတိုင်မီ ပေါင်းခဲ့သည့် တစ်ခုနှင့်သာ overlap ဖြစ်နိုင်သည်။`) }));
  steps.push(snap({ line: 'init', tag: t('empty', 'ဗလာ'),
    note: t('An empty <code>result</code>.', '<code>result</code> ဗလာ။') }));

  sorted.forEach(([lo, hi], idx) => {
    steps.push(snap({ idx, cur: [lo, hi], line: 'take', tag: t(`take ${fmt([lo, hi])}`, `${fmt([lo, hi])} ယူ`),
      note: t(`Next by start: <b>${fmt([lo, hi])}</b>.`, `start အလိုက် နောက်တစ်ခု — <b>${fmt([lo, hi])}</b>။`) }));
    const last = result.at(-1);
    const joins = !!last && lo <= last[1];
    steps.push(snap({ idx, cur: [lo, hi], compare: !!last, joins, line: 'test', tag: joins ? t('overlap', 'overlap') : t('apart', 'ခွဲ'),
      note: !last
        ? t('Nothing merged yet, so nothing to compare with.', 'ပေါင်းပြီးသား မရှိသေးသဖြင့် နှိုင်းယှဉ်စရာ မရှိပါ။')
        : joins
          ? t(`${lo} ≤ ${last[1]}: it starts before the last merged interval ${fmt(last)} ends${lo === last[1] ? ' — touching counts' : ''}.`,
              `${lo} ≤ ${last[1]} — နောက်ဆုံး ပေါင်းထားသော ${fmt(last)} မဆုံးမီ စသည်${lo === last[1] ? ' — ထိရုံလည်း ရေတွက်သည်' : ''}။`)
          : t(`${lo} &gt; ${last[1]}: it starts after ${fmt(last)} ends, and every later interval starts later still — ${fmt(last)} is final.`,
              `${lo} &gt; ${last[1]} — ${fmt(last)} ဆုံးပြီးမှ စသည်၊ နောက်ထပ် interval တိုင်းက ပိုနောက်ကျမှ စသည် — ${fmt(last)} ပြီးပြီ။`) }));
    if (joins) {
      const was = last[1];
      last[1] = Math.max(last[1], hi);
      steps.push(snap({ idx, cur: [lo, hi], grew: true, line: 'extend', tag: t('extend', 'ချဲ့'),
        note: last[1] > was
          ? t(`Extend the last interval's end to max(${was}, ${hi}) = <b>${last[1]}</b>: ${fmt(last)}.`,
              `နောက်ဆုံး interval ၏ အဆုံးကို max(${was}, ${hi}) = <b>${last[1]}</b> အထိ ချဲ့သည် — ${fmt(last)}။`)
          : t(`max(${was}, ${hi}) = ${was}: ${fmt([lo, hi])} sits inside ${fmt(last)}, so its end does not move. Writing ${hi} instead would shrink it.`,
              `max(${was}, ${hi}) = ${was} — ${fmt([lo, hi])} သည် ${fmt(last)} အတွင်း ရှိသဖြင့် အဆုံး မရွှေ့ပါ။ ${hi} ဟု ရေးလိုက်လျှင် ကျုံ့သွားမည်။`) }));
    } else {
      result.push([lo, hi]);
      steps.push(snap({ idx, added: true, line: 'add', tag: t('add', 'ထည့်'),
        note: t(`Start a new merged interval: <b>${fmt([lo, hi])}</b>.`, `ပေါင်းထားသော interval အသစ် စသည် — <b>${fmt([lo, hi])}</b>။`) }));
    }
  });
  steps.push(snap({ line: 'ret', finished: true, tag: t('return', 'return'),
    note: t(`Return ${fmtAll(result)}. After the sort, each interval was compared with one other, not all of them.`,
            `${fmtAll(result)} ကို ပြန်ပေးသည်။ sort ပြီးနောက် interval တစ်ခုစီကို အားလုံးနှင့် မဟုတ်ဘဲ တစ်ခုနှင့်သာ နှိုင်းယှဉ်ခဲ့သည်။`) }));
  return steps;
}

/* ---------------- drawing ----------------
 *
 * The strip lists the intervals in the order the approach takes them — as
 * given, or sorted. The stage is the timeline: the interval being placed in
 * amber above the merged ones, which light up as they are compared,
 * absorbed or cleared. */

function strip(s) {
  const tone = {};
  const marks = {};
  s.order.forEach((_, x) => {
    if (s.idx != null && x < s.idx) tone[x] = 'done';
  });
  if (s.idx != null) { tone[s.idx] = s.added || s.grew ? 'entering' : 'inwin'; marks[s.idx] = 'next'; }
  if (s.finished) s.order.forEach((_, x) => { tone[x] = 'done'; });
  return cells(s.order.map(fmt), { tone, marks });
}

function draw(s) {
  const rows = [];
  if (s.view === 'brute') {
    if (s.cur) rows.push({ lo: s.cur[0], hi: s.cur[1], tone: 'cur', label: fmt(s.cur) }, 'sep');
    s.result.forEach(([a, b], at) => {
      const tone = s.fate[at] ?? (at === s.at ? 'hit' : 'res');
      rows.push({ lo: a, hi: b, tone: at === s.at && s.line === 'test' ? 'hit' : tone });
    });
    if (s.added) rows.forEach((r) => { if (r !== 'sep' && r.lo === s.added[0] && r.hi === s.added[1]) r.tone = 'hit'; });
  } else {
    if (s.cur) rows.push({ lo: s.cur[0], hi: s.cur[1], tone: 'cur', label: fmt(s.cur) }, 'sep');
    s.result.forEach(([a, b], at) => {
      const isLast = at === s.result.length - 1;
      rows.push({ lo: a, hi: b, tone: isLast && (s.compare || s.grew || s.added) ? 'hit' : 'res' });
    });
  }
  const merged = s.result.length;
  return stagePanel(pick(t('Merged so far, with the interval being placed', 'ယခုထိ ပေါင်းပြီး — နေရာချနေသော interval နှင့်')),
    pick(t(`${merged} merged`, `${merged} ခု ပေါင်းပြီး`)),
    (rows.length ? timeline(rows) : `<p class="note mono stage-empty">${esc(pick(t('nothing yet', 'ဘာမျှ မရှိသေး')))}</p>`)
      + stageGap + readout(s.cur ? { lo: s.cur[0], hi: s.cur[1] } : { lo: '—', hi: '—' }));
}

function answer(s) {
  const list = s.result.map(fmt);
  return {
    html: list.length ? slots(list, { total: list.length, just: s.added ? list.length - 1 : -1 }) : '<span class="slot">[]</span>',
    note: s.finished ? t('merged intervals', 'ပေါင်းထားသော interval များ') : t('merged so far', 'ယခုထိ ပေါင်းပြီး'),
  };
}

function vars(s, { intervals }) {
  const out = [['lo', s.cur ? s.cur[0] : '—'], ['hi', s.cur ? s.cur[1] : '—'],
               ['result', fmtAll(s.result)], ['intervals', fmtAll(s.view === 'sweep' && s.line !== 'sort' ? s.order : intervals)]];
  if (s.view === 'brute' && s.at != null) {
    const [a, b] = s.result[s.at];
    out.push(['a', a], ['b', b], ['r', fmt([a, b])]);
  }
  if (s.view === 'sweep') {
    const last = s.result.at(-1);
    out.push(['last', last ? fmt(last) : '—'], ['sorted', fmtAll(s.order)], ['n', s.result.length]);
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
      [null, `${k('def')} merge(intervals)`],
      ['init', `  result = []`],
      ['take', `  intervals.each ${k('do')} |lo, hi|`],
      [null, `    keep = []`],
      [null, `    result.each ${k('do')} |a, b|`],
      ['test', `      ${k('if')} b &lt; lo || hi &lt; a`],
      ['keep', `        keep &lt;&lt; [a, b]`],
      [null, `      ${k('else')}`],
      ['absorb', `        lo, hi = [lo, a].min, [hi, b].max`],
      [null, `      ${k('end')}`],
      [null, `    ${k('end')}`],
      ['add', `    result = keep &lt;&lt; [lo, hi]`],
      [null, `  ${k('end')}`],
      ['ret', `  result`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} merge(self, intervals):`],
      ['init', `        result = []`],
      ['take', `        ${k('for')} lo, hi ${k('in')} intervals:`],
      [null, `            keep = []`],
      [null, `            ${k('for')} a, b ${k('in')} result:`],
      ['test', `                ${k('if')} b &lt; lo or hi &lt; a:`],
      ['keep', `                    keep.append([a, b])`],
      [null, `                ${k('else')}:`],
      ['absorb', `                    lo, hi = min(lo, a), max(hi, b)`],
      ['add', `            keep.append([lo, hi])`],
      [null, `            result = keep`],
      ['ret', `        ${k('return')} result`],
    ],
    javascript: [
      [null, `${k('const')} merge = ${k('function')} (intervals) {`],
      ['init', `  ${k('let')} result = [];`],
      ['take', `  ${k('for')} (${k('let')} [lo, hi] ${k('of')} intervals) {`],
      [null, `    ${k('const')} keep = [];`],
      [null, `    ${k('for')} (${k('const')} [a, b] ${k('of')} result) {`],
      ['test', `      ${k('if')} (b &lt; lo || hi &lt; a) {`],
      ['keep', `        keep.push([a, b]);`],
      [null, `      } ${k('else')} {`],
      ['absorb', `        lo = Math.min(lo, a);`],
      [null, `        hi = Math.max(hi, b);`],
      [null, `      }`],
      [null, `    }`],
      ['add', `    keep.push([lo, hi]);`],
      [null, `    result = keep;`],
      [null, `  }`],
      ['ret', `  ${k('return')} result;`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} merge(intervals [][]int) [][]int {`],
      ['init', `    result := [][]int{}`],
      ['take', `    ${k('for')} _, iv := ${k('range')} intervals {`],
      [null, `        lo, hi := iv[0], iv[1]`],
      [null, `        keep := [][]int{}`],
      [null, `        ${k('for')} _, r := ${k('range')} result {`],
      ['test', `            ${k('if')} r[1] &lt; lo || hi &lt; r[0] {`],
      ['keep', `                keep = append(keep, r)`],
      [null, `            } ${k('else')} {`],
      ['absorb', `                lo, hi = min(lo, r[0]), max(hi, r[1])`],
      [null, `            }`],
      [null, `        }`],
      ['add', `        result = append(keep, []int{lo, hi})`],
      [null, `    }`],
      ['ret', `    ${k('return')} result`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} merge(intervals: Vec&lt;Vec&lt;i32&gt;&gt;) -&gt; Vec&lt;Vec&lt;i32&gt;&gt; {`],
      ['init', `        ${k('let')} ${k('mut')} result: Vec&lt;Vec&lt;i32&gt;&gt; = Vec::new();`],
      ['take', `        ${k('for')} iv ${k('in')} intervals {`],
      [null, `            ${k('let')} (${k('mut')} lo, ${k('mut')} hi) = (iv[0], iv[1]);`],
      [null, `            ${k('let')} ${k('mut')} keep = Vec::new();`],
      [null, `            ${k('for')} r ${k('in')} result {`],
      ['test', `                ${k('if')} r[1] &lt; lo || hi &lt; r[0] {`],
      ['keep', `                    keep.push(r);`],
      [null, `                } ${k('else')} {`],
      ['absorb', `                    lo = lo.min(r[0]);`],
      [null, `                    hi = hi.max(r[1]);`],
      [null, `                }`],
      [null, `            }`],
      ['add', `            keep.push(vec![lo, hi]);`],
      [null, `            result = keep;`],
      [null, `        }`],
      ['ret', `        result`],
      [null, `    }`],
      [null, `}`],
    ],
  },
  sweep: {
    ruby: [
      [null, `${k('def')} merge(intervals)`],
      ['sort', `  sorted = intervals.sort_by(&amp;:first)`],
      ['init', `  result = []`],
      ['take', `  sorted.each ${k('do')} |lo, hi|`],
      ['test', `    ${k('if')} !result.empty? &amp;&amp; lo &lt;= result[-1][1]`],
      ['extend', `      result[-1][1] = [result[-1][1], hi].max`],
      [null, `    ${k('else')}`],
      ['add', `      result &lt;&lt; [lo, hi]`],
      [null, `    ${k('end')}`],
      [null, `  ${k('end')}`],
      ['ret', `  result`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} merge(self, intervals):`],
      ['sort', `        intervals = sorted(intervals, key=lambda iv: iv[0])`],
      ['init', `        result = []`],
      ['take', `        ${k('for')} lo, hi ${k('in')} intervals:`],
      ['test', `            ${k('if')} result and lo &lt;= result[-1][1]:`],
      ['extend', `                result[-1][1] = max(result[-1][1], hi)`],
      [null, `            ${k('else')}:`],
      ['add', `                result.append([lo, hi])`],
      ['ret', `        ${k('return')} result`],
    ],
    javascript: [
      [null, `${k('const')} merge = ${k('function')} (intervals) {`],
      ['sort', `  ${k('const')} sorted = [...intervals].sort((x, y) =&gt; x[0] - y[0]);`],
      ['init', `  ${k('const')} result = [];`],
      ['take', `  ${k('for')} (${k('const')} [lo, hi] ${k('of')} sorted) {`],
      [null, `    ${k('const')} last = result[result.length - 1];`],
      ['test', `    ${k('if')} (last &amp;&amp; lo &lt;= last[1]) {`],
      ['extend', `      last[1] = Math.max(last[1], hi);`],
      [null, `    } ${k('else')} {`],
      ['add', `      result.push([lo, hi]);`],
      [null, `    }`],
      [null, `  }`],
      ['ret', `  ${k('return')} result;`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} merge(intervals [][]int) [][]int {`],
      ['sort', `    sort.Slice(intervals, ${k('func')}(i, j int) bool { ${k('return')} intervals[i][0] &lt; intervals[j][0] })`],
      ['init', `    result := [][]int{}`],
      ['take', `    ${k('for')} _, iv := ${k('range')} intervals {`],
      [null, `        lo, hi := iv[0], iv[1]`],
      ['test', `        ${k('if')} n := len(result); n &gt; 0 &amp;&amp; lo &lt;= result[n-1][1] {`],
      ['extend', `            result[n-1][1] = max(result[n-1][1], hi)`],
      [null, `        } ${k('else')} {`],
      ['add', `            result = append(result, []int{lo, hi})`],
      [null, `        }`],
      [null, `    }`],
      ['ret', `    ${k('return')} result`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} merge(${k('mut')} intervals: Vec&lt;Vec&lt;i32&gt;&gt;) -&gt; Vec&lt;Vec&lt;i32&gt;&gt; {`],
      ['sort', `        intervals.sort_by_key(|iv| iv[0]);`],
      ['init', `        ${k('let')} ${k('mut')} result: Vec&lt;Vec&lt;i32&gt;&gt; = Vec::new();`],
      ['take', `        ${k('for')} iv ${k('in')} intervals {`],
      [null, `            ${k('let')} (lo, hi) = (iv[0], iv[1]);`],
      [null, `            ${k('let')} n = result.len();`],
      ['test', `            ${k('if')} n &gt; 0 &amp;&amp; lo &lt;= result[n - 1][1] {`],
      ['extend', `                result[n - 1][1] = result[n - 1][1].max(hi);`],
      [null, `            } ${k('else')} {`],
      ['add', `                result.push(vec![lo, hi]);`],
      [null, `            }`],
      [null, `        }`],
      ['ret', `        result`],
      [null, `    }`],
      [null, `}`],
    ],
  },
};

/* ---------------- part 1: the "do these overlap?" widget ----------------
 *
 * The statement hinges on what "overlapping" means, and example 2 settles it:
 * [1,4] and [4,5] share only the point 4, and that counts. The other side of
 * the same line is [1,3] and [4,6], which cover every integer from 1 to 6
 * but share no point, so they stay apart. Drag where A ends and where B
 * starts.
 *
 * Built from x-sum's widget vocabulary: two .q-slider rows, the .q-presets
 * chips, the amber .q-tie line and the .ledger, with the stage's timeline in
 * place of the .q-arr cells. */

const QW_SETS = [
  { label: t('example 2', 'ဥပမာ 2'), aEnd: 4, bStart: 4 },
  { label: t('a gap of one', 'တစ်ခု ကွာ'), aEnd: 3, bStart: 4 },
  { label: t('deep overlap', 'အများကြီး ထပ်'), aEnd: 7, bStart: 3 },
];
const QW_TOP = 10;

function mountOverlapWidget(host) {
  const state = { set: 0, aEnd: 4, bStart: 4 };

  host.innerHTML = `
    <div data-tl></div>
    <div class="q-slider">
      <label for="qw-a" data-lbl-a></label>
      <input type="range" id="qw-a" min="1" max="9" value="4">
      <output data-out-a>4</output>
    </div>
    <div class="q-slider">
      <label for="qw-b" data-lbl-b></label>
      <input type="range" id="qw-b" min="1" max="9" value="4">
      <output data-out-b>4</output>
      <span class="q-presets" data-presets></span>
    </div>
    <p class="q-tie" data-line></p>
    <div class="ledger">
      <span class="expr" data-expr></span>
      <span class="total" data-total></span>
    </div>`;

  const q = (sel) => host.querySelector(sel);

  function render() {
    const A = [1, state.aEnd];
    const B = [state.bStart, 9];
    const overlap = B[0] <= A[1];
    q('[data-lbl-a]').textContent = pick(t('A ends at', 'A ဆုံးရာ'));
    q('[data-lbl-b]').textContent = pick(t('B starts at', 'B စရာ'));
    q('#qw-a').value = String(A[1]);
    q('#qw-b').value = String(B[0]);
    q('[data-out-a]').textContent = String(A[1]);
    q('[data-out-b]').textContent = String(B[0]);
    q('[data-presets]').innerHTML = presetChips(QW_SETS, state.set);

    const rows = [{ lo: A[0], hi: A[1], tone: 'res', label: `A ${fmt(A)}` }, { lo: B[0], hi: B[1], tone: 'res', label: `B ${fmt(B)}` }, 'sep'];
    if (overlap) rows.push({ lo: 1, hi: 9, tone: 'hit', label: fmt([1, 9]) });
    else rows.push({ lo: A[0], hi: A[1], tone: 'clear', label: fmt(A) }, { lo: B[0], hi: B[1], tone: 'clear', label: fmt(B) });
    q('[data-tl]').innerHTML = timeline(rows, QW_TOP);

    widgetLabel(pick(overlap ? t('they merge', 'ပေါင်းသည်') : t('they stay apart', 'ခွဲနေသည်')));

    q('[data-line]').innerHTML = pick(B[0] === A[1]
      ? t(`A and B share exactly one point, ${A[1]}. That counts as overlapping — example 2 says so — and they merge into [1,9].`,
          `A နှင့် B တွင် point တစ်ခုတည်း ${A[1]} တူသည်။ ၎င်းကို overlap ဟု ရေတွက်သည် — ဥပမာ 2 က ဆိုထားသည် — [1,9] အဖြစ် ပေါင်းသည်။`)
      : B[0] === A[1] + 1
        ? t(`Together they cover every integer from 1 to 9, but share no point: A stops at ${A[1]}, B starts at ${B[0]}. Not overlapping — they stay two intervals.`,
            `နှစ်ခုပေါင်း 1 မှ 9 အထိ ကိန်းပြည့်တိုင်းကို ဖုံးသော်လည်း တူသော point မရှိ — A သည် ${A[1]} တွင် ရပ်ပြီး B သည် ${B[0]} တွင် စသည်။ overlap မဟုတ် — interval နှစ်ခု အဖြစ် ရှိနေသည်။`)
        : overlap
          ? t(`They share ${B[0]}..${A[1]}, so they merge into [1,9].`, `${B[0]}..${A[1]} တူသဖြင့် [1,9] အဖြစ် ပေါင်းသည်။`)
          : t(`A ends at ${A[1]} before B starts at ${B[0]}: nothing in common.`, `A သည် ${A[1]} တွင် ဆုံးပြီးမှ B သည် ${B[0]} တွင် စသည် — ဘာမျှ မတူပါ။`));

    q('[data-expr]').innerHTML = `${B[0]} ≤ ${A[1]} ? ${overlap ? 'yes' : 'no'} &nbsp;·&nbsp; ${fmt(A)} ∪ ${fmt(B)}`;
    q('[data-total]').innerHTML = `${overlap ? 1 : 2}<small>${pick(overlap ? t('interval', 'interval') : t('intervals', 'interval'))}</small>`;
  }

  host.addEventListener('input', (ev) => {
    if (ev.target.id === 'qw-a') state.aEnd = Number(ev.target.value);
    else if (ev.target.id === 'qw-b') state.bStart = Number(ev.target.value);
    else return;
    render();
  });
  host.addEventListener('click', (ev) => {
    const chip = ev.target.closest('[data-set]');
    if (!chip) return;
    const set = QW_SETS[Number(chip.dataset.set)];
    Object.assign(state, { set: Number(chip.dataset.set), aEnd: set.aEnd, bStart: set.bStart });
    render();
  });
  onLangChange(render);
  render();
}

/* ---------------- the approach, in brief ---------------- */

const APPROACH = {
  brute: {
    idea: t('Take the intervals as given. Each new one absorbs every merged interval it overlaps — and since the input is not sorted, that could be any of them.',
            'interval များကို ပေးထားသည့်အတိုင်း ယူသည်။ အသစ်တစ်ခုစီသည် ၎င်း overlap ဖြစ်သော ပေါင်းပြီးသား interval တိုင်းကို ပေါင်းယူသည် — input ကို sort မလုပ်ထားသဖြင့် မည်သည့်တစ်ခုမဆို ဖြစ်နိုင်သည်။'),
    steps: [
      t('For each <code>[lo, hi]</code>, walk every interval already in <code>result</code>.',
        '<code>[lo, hi]</code> တစ်ခုစီအတွက် <code>result</code> ထဲရှိ interval တိုင်းကို လျှောက်သည်။'),
      t('Apart (<code>b &lt; lo</code> or <code>hi &lt; a</code>): keep it. Otherwise absorb it: <code>lo = min(lo, a)</code>, <code>hi = max(hi, b)</code>.',
        'ခွဲနေလျှင် (<code>b &lt; lo</code> သို့မဟုတ် <code>hi &lt; a</code>) ထားသည်။ မဟုတ်လျှင် ပေါင်းယူသည် — <code>lo = min(lo, a)</code>၊ <code>hi = max(hi, b)</code>။'),
      t('Add the grown <code>[lo, hi]</code> to what was kept.', 'ကြီးလာသော <code>[lo, hi]</code> ကို ထားခဲ့သည့်အထဲ ထည့်သည်။'),
    ],
    cost: t('each interval checks every merged one: up to n(n − 1)/2 comparisons, about 5 × 10⁷ at n = 10⁴ when nothing merges.',
            'interval တစ်ခုစီက ပေါင်းပြီးသား တစ်ခုစီကို စစ်သည် — နှိုင်းယှဉ်ခြင်း n(n − 1)/2 အထိ၊ ဘာမျှ မပေါင်းသည့်အခါ n = 10⁴ တွင် 5 × 10⁷ ခန့်။'),
  },
  sweep: {
    idea: t('Sort by start. Then a new interval can only overlap the last merged one: every earlier one ended before the last one started, and the new one starts later still.',
            'start ဖြင့် sort လုပ်သည်။ ထို့နောက် interval အသစ်သည် နောက်ဆုံး ပေါင်းထားသည့် တစ်ခုနှင့်သာ overlap ဖြစ်နိုင်သည် — ယခင် တစ်ခုစီသည် နောက်ဆုံးတစ်ခု မစမီ ဆုံးပြီးဖြစ်ပြီး အသစ်သည် ပိုနောက်ကျမှ စသည်။'),
    steps: [
      t('Sort the intervals by start.', 'interval များကို start ဖြင့် sort လုပ်သည်။'),
      t('For each <code>[lo, hi]</code>: if <code>lo &lt;= last end</code>, extend the last end to <code>max(last end, hi)</code>.',
        '<code>[lo, hi]</code> တစ်ခုစီအတွက် — <code>lo &lt;= last end</code> ဖြစ်လျှင် last end ကို <code>max(last end, hi)</code> အထိ ချဲ့သည်။'),
      t('Otherwise append <code>[lo, hi]</code> as a new merged interval.', 'မဟုတ်လျှင် <code>[lo, hi]</code> ကို ပေါင်းထားသော interval အသစ်အဖြစ် ထည့်သည်။'),
    ],
    cost: t('the sort is O(n log n); after it, each interval is compared once, with the last merged one.',
            'sort သည် O(n log n) — ထို့နောက် interval တစ်ခုစီကို နောက်ဆုံး ပေါင်းထားသည့် တစ်ခုနှင့် တစ်ကြိမ်သာ နှိုင်းယှဉ်သည်။'),
  },
};

/* ---------------- mount ----------------
 *
 * Last in the file on purpose: mountLesson runs the widget immediately, so
 * every const the widget reads must already be initialised. */

const EX1 = [[1, 3], [2, 6], [8, 10], [15, 18]];

mountLesson({
  input: { intervals: EX1 },
  controls: [
    { key: 'intervals', label: 'intervals', value: fmtAll(EX1), parse: parseIntervals, format: fmtAll },
  ],
  presets: [
    { label: exampleTitle(1), input: { intervals: EX1 } },
    { label: exampleTitle(2), input: { intervals: [[1, 4], [4, 5]] } },
    { label: exampleTitle(3), input: { intervals: [[4, 7], [1, 4]] } },
    { label: t('Nested', 'အတွင်းထဲ'), input: { intervals: [[1, 10], [2, 3], [4, 5], [12, 14]] } },
    { label: t('A bridge', 'တံတား'), input: { intervals: [[1, 3], [8, 10], [5, 6], [2, 9]] } },
  ],
  examples: [
    { title: exampleTitle(1), inputHtml: '<code>intervals = [[1,3],[2,6],[8,10],[15,18]]</code>', output: '[[1,6],[8,10],[15,18]]',
      why: [t('[1,3] and [2,6] share 2..3, so they merge into [1,6]. The others touch nothing.', '[1,3] နှင့် [2,6] တွင် 2..3 တူသဖြင့် [1,6] အဖြစ် ပေါင်းသည်။ ကျန်တို့ ဘာနှင့်မျှ မထိပါ။')],
      load: { intervals: EX1 } },
    { title: exampleTitle(2), inputHtml: '<code>intervals = [[1,4],[4,5]]</code>', output: '[[1,5]]',
      why: [t('They share only the point 4 — and that counts as overlapping.', 'point 4 တစ်ခုတည်းသာ တူသည် — ၎င်းကို overlap ဟု ရေတွက်သည်။')],
      load: { intervals: [[1, 4], [4, 5]] } },
    { title: exampleTitle(3), inputHtml: '<code>intervals = [[4,7],[1,4]]</code>', output: '[[1,7]]',
      why: [t('The input is not sorted: [1,4] comes second, but it merges with [4,7] all the same.', 'input ကို sort မလုပ်ထားပါ — [1,4] သည် ဒုတိယ ဖြစ်သော်လည်း [4,7] နှင့် ပေါင်းသည်။')],
      load: { intervals: [[4, 7], [1, 4]] } },
  ],
  modes: [
    { id: 'brute', name: 'Brute force',
      sub: t('no sorting', 'sort မလုပ်'),
      desc: t('Each new interval absorbs every merged one it overlaps.', 'interval အသစ်တစ်ခုစီက ၎င်း overlap ဖြစ်သော ပေါင်းပြီးသား တိုင်းကို ပေါင်းယူသည်။'),
      cost: 'O(n²) time · O(n) space', build: buildBrute },
    { id: 'sweep', name: 'Sort + sweep',
      desc: t('Sorted by start, compare only with the last merged interval.', 'start ဖြင့် sort ပြီး နောက်ဆုံး ပေါင်းထားသည့် တစ်ခုနှင့်သာ နှိုင်းယှဉ်သည်။'),
      cost: 'O(n log n) time · O(n) space', build: buildSweep },
  ],
  languages: LANGUAGES,
  code: CODE,
  solutions: {
    brute: { approach: APPROACH.brute,
      desc: t('Unsorted, every new interval checks every merged one and absorbs those it overlaps. Correct, and quadratic when little merges.',
              'sort မလုပ်ဘဲ interval အသစ်တိုင်းက ပေါင်းပြီးသား တိုင်းကို စစ်ပြီး overlap ဖြစ်သည်များကို ပေါင်းယူသည်။ မှန်သည်၊ သို့သော် ပေါင်းစရာ နည်းလျှင် quadratic ဖြစ်သည်။') },
    sweep: { approach: APPROACH.sweep,
      desc: t('The submission worth writing: sort by start, then one pass that only ever looks at the last merged interval. The <code>max</code> is what keeps a nested interval from shrinking it.',
              'ရေးသင့်သည့် submission — start ဖြင့် sort လုပ်ပြီး နောက်ဆုံး ပေါင်းထားသည့် interval ကိုသာ ကြည့်သော တစ်ကြိမ် ဖြတ်ခြင်း။ <code>max</code> က အတွင်းထဲရှိ interval ကြောင့် ကျုံ့မသွားအောင် ကာကွယ်သည်။') },
  },
  // How each language was actually checked, printed as the part 3 badges.
  // The corpus: the 3 examples, 7 edges, 15,000 random lists of 1–8
  // intervals inside 0..10, 5,000 of 1–40 inside 0..100, and five at
  // n = 10⁴ — against an oracle that paints a doubled number line. Merged
  // intervals are compared in sorted order. The brute force skips the five at
  // n = 10⁴. Go and Rust ran in Docker (golang:1.23-alpine, rust:1-slim).
  verification: {
    ruby: { brute: 'ran here · 20,010 cases, not the five at n = 10⁴', sweep: 'ran here · 20,015 cases' },
    python: { brute: 'ran here · 20,010 cases, not the five at n = 10⁴', sweep: 'ran here · 20,015 cases' },
    javascript: { brute: 'ran here · 20,010 cases, not the five at n = 10⁴', sweep: 'ran here · 20,015 cases' },
    go: { brute: 'ran here · 20,010 cases, not the five at n = 10⁴ · Go 1.23', sweep: 'ran here · 20,015 cases · Go 1.23' },
    rust: { brute: 'ran here · 20,010 cases, not the five at n = 10⁴ · rustc 1.98', sweep: 'ran here · 20,015 cases · rustc 1.98' },
  },
  stripLabel: t('intervals, in the order taken', 'interval များ — ယူသည့် အစီအစဉ်'),
  strip,
  draw,
  answer,
  vars,
  widget: mountOverlapWidget,
});
