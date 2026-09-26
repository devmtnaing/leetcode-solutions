/* Course Schedule — LeetCode 207.
 *
 * Draw each pair [a, b] as an arrow b → a: take b, then a. Every course can be
 * taken exactly when the arrows never loop back on themselves, so the
 * question is "does this directed graph have a cycle?". Two classic ways to
 * answer it: a DFS that marks the courses on its current path (reaching one
 * again closes a loop), and Kahn's algorithm, which keeps taking courses with
 * nothing left to wait for and checks whether it ran out early.
 */
import { mountLesson } from '../../lib/stepper.js';
import { pick, onLangChange } from '../../lib/i18n.js';
import { cells, stagePanel, stack, readout } from '../../lib/stage.js';
import { t, exampleTitle, LANGUAGES, k, c, labelledRows, stageRow, stageGap, verdictAnswer, intValue, widgetLabel, presetChips } from '../../lib/kit.js';

const MAX_N = 8, MAX_PAIRS = 12;

function parsePairs(text) {
  const s = String(text).trim();
  if (!/^[\[\]\d\s,;]*$/.test(s)) throw new Error('pairs of course numbers, like [[1,0],[2,1]]');
  const nums = s.match(/\d+/g)?.map(Number) ?? [];
  if (nums.length % 2) throw new Error('every pair needs two courses');
  const pairs = [];
  for (let i = 0; i < nums.length; i += 2) pairs.push([nums[i], nums[i + 1]]);
  if (pairs.length > MAX_PAIRS) throw new Error(`at most ${MAX_PAIRS} pairs, so the stage stays readable`);
  if (new Set(pairs.map((p) => p.join())).size !== pairs.length) throw new Error('each pair only once');
  return pairs;
}
const fmtPairs = (ps) => `[${ps.map(([a, b]) => `[${a},${b}]`).join(',')}]`;

function checked({ numCourses: n, prerequisites: ps }) {
  const out = ps.find(([a, b]) => a >= n || b >= n);
  if (out) throw new Error(`[${out}] names a course that does not exist: courses run 0 to ${n - 1}`);
  const after = Array.from({ length: n }, () => []);
  for (const [a, b] of ps) after[b].push(a);
  return after;
}
const fmtAfter = (after) => `[${after.map((l) => `[${l.join(',')}]`).join(',')}]`;

/* ---------------- step generators ---------------- */

function buildDfs(input) {
  const after = checked(input);
  const n = input.numCourses;
  const state = new Array(n).fill(0);
  const calls = [];
  const steps = [];
  const snap = (extra) => ({ view: 'dfs', after, state: [...state], calls: [...calls], hot: null, loop: null, verdict: null, ...extra });

  steps.push(snap({ line: 'graph', tag: t('build after', 'after တည်ဆောက်'),
    note: t('Turn every pair [a, b] into an arrow b → a: <code>after[b]</code> lists the courses that wait on b.',
            'pair [a, b] တိုင်းကို b → a မြှား ပြောင်းသည် — <code>after[b]</code> သည် b ကို စောင့်သော course များကို စာရင်းပြုသည်။') }));
  steps.push(snap({ line: 'colour', tag: t('all 0', 'အားလုံး 0'),
    note: t('<code>state</code> starts at 0 for every course: 0 = not reached, 1 = on the path being followed right now, 2 = done — nothing after it loops.',
            '<code>state</code> သည် course တိုင်းအတွက် 0 မှ စသည် — 0 = မရောက်ရသေး၊ 1 = ယခု လိုက်နေသော လမ်းကြောင်းပေါ်တွင်၊ 2 = ပြီး — ၎င်းနောက်မှ ဘာမှ မလည်ပတ်။') }));

  function cycle(u, from) {
    calls.push(u);
    if (state[u] === 1) {
      const loop = calls.slice(calls.indexOf(u), -1);
      steps.push(snap({ line: 'grey', hot: [from, u], loop, tag: t('cycle', 'cycle'),
        note: t(`${u} is already on the path — ${loop.join(' → ')} → ${u}. The arrows lead back to where they started: none of these courses can ever be taken first.`,
                `${u} သည် လမ်းကြောင်းပေါ်တွင် ရှိပြီးသား — ${loop.join(' → ')} → ${u}။ မြှားများက စတင်ရာသို့ ပြန်ရောက်သည် — ဤ course များထဲမှ မည်သည်ကိုမျှ အရင် မယူနိုင်ပါ။`) }));
      calls.pop();
      return loop;
    }
    if (state[u] === 2) {
      steps.push(snap({ line: 'black', hot: from == null ? null : [from, u], tag: t('already done', 'ပြီးပြီ'),
        note: t(`${u} is done: every course after it was checked already and none loops. Return false — no cycle this way.`,
                `${u} ပြီးပြီ — ၎င်းနောက်ရှိ course တိုင်းကို စစ်ပြီးသား ဖြစ်ပြီး ဘာမှ မလည်ပတ်ပါ။ false ပြန်သည် — ဤလမ်းတွင် cycle မရှိ။`) }));
      calls.pop();
      return null;
    }
    state[u] = 1;
    steps.push(snap({ line: 'enter', tag: t(`${u} on the path`, `${u} လမ်းပေါ်`),
      note: t(`Mark ${u} as on the path (1), then follow each arrow out of it: ${after[u].length ? after[u].join(', ') : 'there are none'}.`,
              `${u} ကို လမ်းပေါ်တွင် (1) ဟု မှတ်ပြီး ၎င်းမှ ထွက်သော မြှားတိုင်းကို လိုက်သည် — ${after[u].length ? after[u].join(', ') : 'မရှိပါ'}။`) }));
    for (const v of after[u]) {
      steps.push(snap({ line: 'edge', hot: [u, v], tag: t(`${u} → ${v}`, `${u} → ${v}`),
        note: t(`${v} waits on ${u}. Follow the arrow: cycle(${v}).`, `${v} သည် ${u} ကို စောင့်သည်။ မြှားကို လိုက်သည် — cycle(${v})။`) }));
      const loop = cycle(v, u);
      if (loop) {
        steps.push(snap({ line: 'edge', loop, tag: t('return true', 'return true'),
          note: t(`The call for ${v} found a cycle, so cycle(${u}) returns true straight away — the answer travels back up the stack.`,
                  `${v} အတွက် call က cycle တွေ့သဖြင့် cycle(${u}) သည် ချက်ချင်း true ပြန်သည် — အဖြေသည် stack တစ်လျှောက် ပြန်တက်သွားသည်။`) }));
        calls.pop();
        return loop;
      }
    }
    state[u] = 2;
    steps.push(snap({ line: 'leave', tag: t(`${u} done`, `${u} ပြီး`),
      note: t(`Nothing after ${u} loops. Mark it done (2) and leave the path: a later search that reaches ${u} can stop there.`,
              `${u} နောက်မှ ဘာမှ မလည်ပတ်ပါ။ ပြီး (2) ဟု မှတ်ပြီး လမ်းကြောင်းမှ ထွက်သည် — နောက်ပိုင်း ${u} ကို ရောက်သော ရှာဖွေမှုက ထိုနေရာတွင် ရပ်နိုင်သည်။`) }));
    calls.pop();
    return null;
  }

  for (let u = 0; u < n; u++) {
    if (state[u] === 0) {
      steps.push(snap({ line: 'start', tag: t(`cycle(${u})`, `cycle(${u})`),
        note: t(`No search has reached course ${u} yet: start one from it.`, `course ${u} ကို မည်သည့် ရှာဖွေမှုကမျှ မရောက်သေးပါ — ၎င်းမှ စသည်။`) }));
    }
    const loop = cycle(u, null);
    if (loop) {
      steps.push(snap({ line: 'start', loop, verdict: false, finished: true, tag: t('false', 'false'),
        note: t(`A cycle, ${loop.join(' → ')} → ${loop[0]}: return false. Checking the other courses cannot help.`,
                `cycle တစ်ခု — ${loop.join(' → ')} → ${loop[0]} — false ပြန်သည်။ ကျန် course များကို စစ်လည်း အကျိုးမရှိ။`) }));
      return steps;
    }
  }
  steps.push(snap({ line: 'ret', verdict: true, finished: true, tag: t('true', 'true'),
    note: t('Every course is done and no search ever met its own path: there is no cycle, so every course can be taken. Return true.',
            'course တိုင်း ပြီးပြီး မည်သည့် ရှာဖွေမှုကမျှ ၎င်း၏ လမ်းကြောင်းကို ပြန်မတွေ့ခဲ့ — cycle မရှိသဖြင့် course တိုင်း ယူနိုင်သည်။ true ပြန်သည်။') }));
  return steps;
}

function buildKahn(input) {
  const after = checked(input);
  const n = input.numCourses;
  const need = new Array(n).fill(0);
  for (const [a] of input.prerequisites) need[a]++;
  const queue = [];
  let head = 0, taken = 0;
  const took = new Array(n).fill(false);
  const steps = [];
  const snap = (extra) => ({ view: 'kahn', after, need: [...need], queue: queue.slice(head), took: [...took], taken,
    u: null, v: null, hot: null, verdict: null, ...extra });

  steps.push(snap({ line: 'graph', tag: t('after + need', 'after + need'),
    note: t('For every pair [a, b]: add a to <code>after[b]</code>, and count one more course a is waiting for in <code>need[a]</code>.',
            'pair [a, b] တိုင်းအတွက် — a ကို <code>after[b]</code> ထဲ ထည့်ပြီး a စောင့်နေသော course တစ်ခု ထပ်ရှိကြောင်း <code>need[a]</code> တွင် ရေတွက်သည်။') }));
  for (let u = 0; u < n; u++) if (need[u] === 0) queue.push(u);
  steps.push(snap({ line: 'free', tag: t(`${queue.length} free`, `${queue.length} ခု လွတ်`),
    note: queue.length
      ? t(`Courses with <code>need</code> 0 can be taken now: ${queue.join(', ')}. Queue them.`, `<code>need</code> 0 ရှိသော course များကို ယခု ယူနိုင်သည် — ${queue.join(', ')}။ queue ထဲ ထည့်သည်။`)
      : t('Every course waits on something, so nothing can be taken first. The queue starts empty.', 'course တိုင်းသည် တစ်ခုခုကို စောင့်နေသဖြင့် ဘာကိုမျှ အရင် မယူနိုင်ပါ။ queue သည် ဗလာဖြင့် စသည်။') }));
  while (head < queue.length) {
    const u = queue[head++];
    took[u] = true;
    taken++;
    steps.push(snap({ line: 'take', u, tag: t(`take ${u}`, `${u} ယူ`),
      note: t(`Take course ${u}: taken = ${taken}. Every course waiting on it now waits on one fewer.`,
              `course ${u} ကို ယူသည် — taken = ${taken}။ ၎င်းကို စောင့်နေသော course တိုင်း တစ်ခု လျော့စောင့်ရတော့သည်။`) }));
    for (const v of after[u]) {
      need[v]--;
      if (need[v] === 0) {
        queue.push(v);
        steps.push(snap({ line: 'ready', u, v, hot: [u, v], tag: t(`${v} free`, `${v} လွတ်`),
          note: t(`need[${v}] drops to 0: ${v} was waiting only on courses already taken. Queue it.`,
                  `need[${v}] သည် 0 သို့ ကျသည် — ${v} သည် ယူပြီးသား course များကိုသာ စောင့်နေခဲ့သည်။ queue ထဲ ထည့်သည်။`) }));
      } else {
        steps.push(snap({ line: 'unlock', u, v, hot: [u, v], tag: t(`need[${v}] = ${need[v]}`, `need[${v}] = ${need[v]}`),
          note: t(`need[${v}] drops to ${need[v]}: ${v} still waits on ${need[v] === 1 ? 'one more course' : `${need[v]} more courses`}.`,
                  `need[${v}] သည် ${need[v]} သို့ ကျသည် — ${v} သည် course ${need[v]} ခု ထပ်စောင့်ရဆဲ။`) }));
      }
    }
  }
  const ok = taken === n;
  steps.push(snap({ line: 'ret', verdict: ok, finished: true, tag: t(ok ? 'true' : 'false', ok ? 'true' : 'false'),
    note: ok
      ? t(`The queue ran dry after taking all ${n} courses: true. The order they were taken in is a valid schedule.`,
          `course ${n} ခုလုံး ယူပြီးမှ queue ကုန်သည် — true။ ယူခဲ့သော အစီအစဉ်သည် မှန်ကန်သော အချိန်ဇယား ဖြစ်သည်။`)
      : t(`The queue ran dry with ${taken} of ${n} taken. The rest — ${need.map((x, u) => (x > 0 ? u : null)).filter((u) => u != null).join(', ')} — each still wait on another of them: a cycle. False.`,
          `${n} ခုအနက် ${taken} ခုသာ ယူပြီး queue ကုန်သည်။ ကျန်သည်များ — ${need.map((x, u) => (x > 0 ? u : null)).filter((u) => u != null).join(', ')} — သည် ၎င်းတို့ထဲမှ တစ်ခုခုကို စောင့်နေဆဲ — cycle တစ်ခု။ false။`) }));
  return steps;
}

/* ---------------- drawing ----------------
 *
 * The strip card is the array the code keeps per course: `state` for the DFS,
 * `need` for Kahn. The stage draws `after` as what it is — a directed graph,
 * one arrow b → a per pair — with the courses coloured by that array, and
 * beside it the DFS's call stack or Kahn's queue. */

function graphSvg(n, pairs, { tone = {}, hot = null, loop = null, prefix = 'g', clickable = false, picked = null } = {}) {
  const W = 230, H = 214, cx = W / 2, cy = H / 2, R = n === 1 ? 0 : 80, r = 16;
  const pos = (u) => [cx + R * Math.sin((2 * Math.PI * u) / n), cy - R * Math.cos((2 * Math.PI * u) / n)];
  const has = new Set(pairs.map(([a, b]) => `${b}>${a}`));
  const onLoop = (b, a) => loop && loop.length && loop.some((x, i) => x === b && loop[(i + 1) % loop.length] === a);
  const edges = pairs.map(([a, b]) => {
    const cls = hot && hot[0] === b && hot[1] === a ? 'hot' : onLoop(b, a) ? 'bad' : '';
    const [x1, y1] = pos(b), [x2, y2] = pos(a);
    if (a === b) {
      const ox = R ? (x1 - cx) / R : 0, oy = R ? (y1 - cy) / R : -1;
      const sx = x1 + ox * r, sy = y1 + oy * r;
      return `<path class="g-edge ${cls}" d="M ${(sx - 7 * oy).toFixed(1)} ${(sy + 7 * ox).toFixed(1)} C ${(sx + 30 * ox - 16 * oy).toFixed(1)} ${(sy + 30 * oy + 16 * ox).toFixed(1)} ${(sx + 30 * ox + 16 * oy).toFixed(1)} ${(sy + 30 * oy - 16 * ox).toFixed(1)} ${(sx + 7 * oy).toFixed(1)} ${(sy - 7 * ox).toFixed(1)}" marker-end="url(#${prefix}-${cls || 'h'})"/>`;
    }
    const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy);
    const bend = has.has(`${a}>${b}`) ? 16 : 0;
    const qx = (x1 + x2) / 2 - (dy / len) * bend, qy = (y1 + y2) / 2 + (dx / len) * bend;
    const trim = (px, py, tx, ty, d) => { const l = Math.hypot(tx - px, ty - py); return [px + ((tx - px) / l) * d, py + ((ty - py) / l) * d]; };
    const [sx, sy] = trim(x1, y1, qx, qy, r);
    const [ex, ey] = trim(x2, y2, qx, qy, r + 2);
    return `<path class="g-edge ${cls}" d="M ${sx.toFixed(1)} ${sy.toFixed(1)} Q ${qx.toFixed(1)} ${qy.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}" marker-end="url(#${prefix}-${cls || 'h'})"/>`;
  }).join('');
  const nodes = Array.from({ length: n }, (_, u) => {
    const [x, y] = pos(u);
    const act = clickable ? ` role="button" tabindex="0" data-u="${u}" aria-label="course ${u}${picked === u ? ', picked' : ''}"` : '';
    return `<g class="g-node ${tone[u] || ''}${picked === u ? ' picked' : ''}"${act}><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}"/><text x="${x.toFixed(1)}" y="${(y + 4.5).toFixed(1)}" text-anchor="middle">${u}</text></g>`;
  }).join('');
  const marker = (id, cls) => `<marker id="${prefix}-${id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="g-head ${cls}" d="M0,0 L10,5 L0,10 z"/></marker>`;
  return `<div class="cs-graph"><svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="${clickable ? 'group' : 'img'}" aria-label="the prerequisite graph: ${pairs.map(([a, b]) => `${b} before ${a}`).join(', ') || 'no arrows'}">
    <defs>${marker('h', '')}${marker('hot', 'hot')}${marker('bad', 'bad')}</defs>${edges}${nodes}</svg></div>`;
}

function strip(s) {
  if (s.view === 'dfs') {
    const top = s.calls.at(-1);
    return labelledRows([['state', cells(s.state, {
      tone: Object.fromEntries(s.state.map((x, u) => [u, s.loop && s.loop.includes(u) ? 'leaving' : x === 2 ? 'done' : x === 1 ? 'inwin' : null]).filter(([, x]) => x)),
      marks: top == null ? {} : { [top]: 'u' },
    })]]);
  }
  const marks = {};
  if (s.u != null) marks[s.u] = 'u';
  if (s.v != null) marks[s.v] = 'v';
  return labelledRows([['need', cells(s.need, { marks, tone: Object.fromEntries(s.need.map((x, u) => [u,
    u === s.v ? 'entering' : u === s.u ? 'inwin' : s.took[u] ? 'done' : s.finished && x > 0 ? 'leaving' : null]).filter(([, x]) => x)) })]]);
}

function draw(s, { numCourses: n, prerequisites: ps }) {
  const title = pick(t('The graph: b → a for each [a, b]', 'Graph — [a, b] တစ်ခုစီအတွက် b → a'));
  if (s.view === 'dfs') {
    const top = s.calls.at(-1);
    const tone = Object.fromEntries(s.state.map((x, u) => [u, s.loop && s.loop.includes(u) ? 'bad' : x === 2 ? 'done' : x === 1 ? 'on' : '']));
    if (top != null && !(s.loop && s.loop.includes(top))) tone[top] = `${tone[top] || 'on'} cur`;
    return stagePanel(title, pick(t('amber: on the path · green: done', 'ဝါ — လမ်းပေါ် · စိမ်း — ပြီး')),
      graphSvg(n, ps, { tone, hot: s.hot, loop: s.loop, prefix: 'st' }))
      + stageGap + stagePanel(pick(t('The call stack', 'Call stack')), pick(t(`${s.calls.length} deep`, `${s.calls.length} ဆင့်`)),
        stack(s.calls.map((u) => `cycle(${u})`)));
  }
  const tone = Object.fromEntries(s.need.map((x, u) => [u, u === s.u ? 'on cur' : s.took[u] ? 'done' : s.queue.includes(u) ? 'queued' : s.finished && x > 0 ? 'bad' : '']));
  return stagePanel(title, pick(t('green: taken · blue: queued', 'စိမ်း — ယူပြီး · ပြာ — queue ထဲ')),
    graphSvg(n, ps, { tone, hot: s.hot, prefix: 'st' }))
    + stageGap + stagePanel(pick(t('The queue, front first', 'Queue — ရှေ့ဆုံးမှ')), pick(t(`${s.queue.length} waiting`, `${s.queue.length} ခု စောင့်`)),
      stageRow(cells(s.queue, { index: false, tone: s.v != null && s.queue.at(-1) === s.v && s.line === 'ready' ? { [s.queue.length - 1]: 'entering' } : {} }), pick(t('empty', 'ဗလာ'))))
    + stageGap + readout({ taken: `${s.taken} / ${n}` });
}

function answer(s) {
  return verdictAnswer(s.verdict, {
    yes: t('every course can be taken', 'course တိုင်း ယူနိုင်သည်'),
    no: t('a cycle: some courses never free up', 'cycle — course အချို့ ဘယ်တော့မှ မလွတ်'),
    pending: t('true or false', 'true သို့မဟုတ် false'),
  });
}

function vars(s, { numCourses: n }) {
  const out = [['numCourses', n], ['after', fmtAfter(s.after)]];
  if (s.view === 'dfs') {
    out.push(['state', `[${s.state.join(', ')}]`]);
    if (s.calls.length) out.push(['u', s.calls.at(-1)]);
    if (s.hot) out.push(['v', s.hot[1]]);
  } else {
    out.push(['need', `[${s.need.join(', ')}]`], ['queue', `[${s.queue.join(', ')}]`], ['taken', s.taken]);
    if (s.u != null) out.push(['u', s.u]);
    if (s.v != null) out.push(['v', s.v]);
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
      [null, `${k('def')} can_finish(num_courses, prerequisites)`],
      [null, `  after = Array.new(num_courses) { [] }`],
      ['graph', `  prerequisites.each { |a, b| after[b] &lt;&lt; a }`],
      ['colour', `  state = Array.new(num_courses, 0) ${c('# 0 new · 1 on the path · 2 done')}`],
      [null, `  (0...num_courses).each ${k('do')} |u|`],
      ['start', `    ${k('return')} false ${k('if')} cycle?(u, after, state)`],
      [null, `  ${k('end')}`],
      ['ret', `  true`],
      [null, `${k('end')}`],
      [null, ``],
      [null, `${k('def')} cycle?(u, after, state)`],
      ['grey', `  ${k('return')} true ${k('if')} state[u] == 1`],
      ['black', `  ${k('return')} false ${k('if')} state[u] == 2`],
      ['enter', `  state[u] = 1`],
      [null, `  after[u].each ${k('do')} |v|`],
      ['edge', `    ${k('return')} true ${k('if')} cycle?(v, after, state)`],
      [null, `  ${k('end')}`],
      ['leave', `  state[u] = 2`],
      [null, `  false`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('import')} sys`],
      [null, `sys.setrecursionlimit(10_000)             ${c('# a chain of 2,000 courses is 2,000 calls deep')}`],
      [null, ``],
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} canFinish(self, numCourses, prerequisites):`],
      [null, `        after = [[] ${k('for')} _ ${k('in')} range(numCourses)]`],
      [null, `        ${k('for')} a, b ${k('in')} prerequisites:`],
      ['graph', `            after[b].append(a)`],
      ['colour', `        state = [0] * numCourses          ${c('# 0 new · 1 on the path · 2 done')}`],
      [null, ``],
      [null, `        ${k('def')} cycle(u):`],
      ['grey', `            ${k('if')} state[u] == 1:`],
      [null, `                ${k('return')} True`],
      ['black', `            ${k('if')} state[u] == 2:`],
      [null, `                ${k('return')} False`],
      ['enter', `            state[u] = 1`],
      [null, `            ${k('for')} v ${k('in')} after[u]:`],
      ['edge', `                ${k('if')} cycle(v):`],
      [null, `                    ${k('return')} True`],
      ['leave', `            state[u] = 2`],
      [null, `            ${k('return')} False`],
      [null, ``],
      [null, `        ${k('for')} u ${k('in')} range(numCourses):`],
      ['start', `            ${k('if')} cycle(u):`],
      [null, `                ${k('return')} False`],
      ['ret', `        ${k('return')} True`],
    ],
    javascript: [
      [null, `${k('const')} canFinish = ${k('function')} (numCourses, prerequisites) {`],
      [null, `  ${k('const')} after = Array.from({ length: numCourses }, () =&gt; []);`],
      ['graph', `  ${k('for')} (${k('const')} [a, b] ${k('of')} prerequisites) after[b].push(a);`],
      ['colour', `  ${k('const')} state = ${k('new')} Array(numCourses).fill(0); ${c('// 0 new · 1 on the path · 2 done')}`],
      [null, `  ${k('const')} cycle = (u) =&gt; {`],
      ['grey', `    ${k('if')} (state[u] === 1) ${k('return')} true;`],
      ['black', `    ${k('if')} (state[u] === 2) ${k('return')} false;`],
      ['enter', `    state[u] = 1;`],
      [null, `    ${k('for')} (${k('const')} v ${k('of')} after[u]) {`],
      ['edge', `      ${k('if')} (cycle(v)) ${k('return')} true;`],
      [null, `    }`],
      ['leave', `    state[u] = 2;`],
      [null, `    ${k('return')} false;`],
      [null, `  };`],
      [null, `  ${k('for')} (${k('let')} u = 0; u &lt; numCourses; u++) {`],
      ['start', `    ${k('if')} (cycle(u)) ${k('return')} false;`],
      [null, `  }`],
      ['ret', `  ${k('return')} true;`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} canFinish(numCourses int, prerequisites [][]int) bool {`],
      [null, `    after := make([][]int, numCourses)`],
      [null, `    ${k('for')} _, p := ${k('range')} prerequisites {`],
      ['graph', `        after[p[1]] = append(after[p[1]], p[0])`],
      [null, `    }`],
      ['colour', `    state := make([]int, numCourses) ${c('// 0 new · 1 on the path · 2 done')}`],
      [null, `    ${k('var')} cycle ${k('func')}(u int) bool`],
      [null, `    cycle = ${k('func')}(u int) bool {`],
      ['grey', `        ${k('if')} state[u] == 1 {`],
      [null, `            ${k('return')} true`],
      [null, `        }`],
      ['black', `        ${k('if')} state[u] == 2 {`],
      [null, `            ${k('return')} false`],
      [null, `        }`],
      ['enter', `        state[u] = 1`],
      [null, `        ${k('for')} _, v := ${k('range')} after[u] {`],
      ['edge', `            ${k('if')} cycle(v) {`],
      [null, `                ${k('return')} true`],
      [null, `            }`],
      [null, `        }`],
      ['leave', `        state[u] = 2`],
      [null, `        ${k('return')} false`],
      [null, `    }`],
      [null, `    ${k('for')} u := 0; u &lt; numCourses; u++ {`],
      ['start', `        ${k('if')} cycle(u) {`],
      [null, `            ${k('return')} false`],
      [null, `        }`],
      [null, `    }`],
      ['ret', `    ${k('return')} true`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} can_finish(num_courses: i32, prerequisites: Vec&lt;Vec&lt;i32&gt;&gt;) -&gt; bool {`],
      [null, `        ${k('let')} n = num_courses as usize;`],
      [null, `        ${k('let')} ${k('mut')} after = vec![vec![]; n];`],
      [null, `        ${k('for')} p ${k('in')} &amp;prerequisites {`],
      ['graph', `            after[p[1] as usize].push(p[0] as usize);`],
      [null, `        }`],
      ['colour', `        ${k('let')} ${k('mut')} state = vec![0u8; n]; ${c('// 0 new · 1 on the path · 2 done')}`],
      [null, `        ${k('fn')} cycle(u: usize, after: &amp;Vec&lt;Vec&lt;usize&gt;&gt;, state: &amp;${k('mut')} Vec&lt;u8&gt;) -&gt; bool {`],
      ['grey', `            ${k('if')} state[u] == 1 {`],
      [null, `                ${k('return')} true;`],
      [null, `            }`],
      ['black', `            ${k('if')} state[u] == 2 {`],
      [null, `                ${k('return')} false;`],
      [null, `            }`],
      ['enter', `            state[u] = 1;`],
      [null, `            ${k('for')} &amp;v ${k('in')} &amp;after[u] {`],
      ['edge', `                ${k('if')} cycle(v, after, state) {`],
      [null, `                    ${k('return')} true;`],
      [null, `                }`],
      [null, `            }`],
      ['leave', `            state[u] = 2;`],
      [null, `            false`],
      [null, `        }`],
      [null, `        ${k('for')} u ${k('in')} 0..n {`],
      ['start', `            ${k('if')} cycle(u, &amp;after, &amp;${k('mut')} state) {`],
      [null, `                ${k('return')} false;`],
      [null, `            }`],
      [null, `        }`],
      ['ret', `        true`],
      [null, `    }`],
      [null, `}`],
    ],
  },
  kahn: {
    ruby: [
      [null, `${k('def')} can_finish(num_courses, prerequisites)`],
      [null, `  after = Array.new(num_courses) { [] }`],
      [null, `  need = Array.new(num_courses, 0)`],
      [null, `  prerequisites.each ${k('do')} |a, b|`],
      ['graph', `    after[b] &lt;&lt; a`],
      ['graph', `    need[a] += 1`],
      [null, `  ${k('end')}`],
      ['free', `  queue = (0...num_courses).select { |u| need[u].zero? }`],
      [null, `  taken = 0`],
      [null, `  ${k('until')} queue.empty?`],
      ['take', `    u = queue.shift`],
      ['take', `    taken += 1`],
      [null, `    after[u].each ${k('do')} |v|`],
      ['unlock', `      need[v] -= 1`],
      ['ready', `      queue &lt;&lt; v ${k('if')} need[v].zero?`],
      [null, `    ${k('end')}`],
      [null, `  ${k('end')}`],
      ['ret', `  taken == num_courses`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('from')} collections ${k('import')} deque`],
      [null, ``],
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} canFinish(self, numCourses, prerequisites):`],
      [null, `        after = [[] ${k('for')} _ ${k('in')} range(numCourses)]`],
      [null, `        need = [0] * numCourses`],
      [null, `        ${k('for')} a, b ${k('in')} prerequisites:`],
      ['graph', `            after[b].append(a)`],
      ['graph', `            need[a] += 1`],
      ['free', `        queue = deque(u ${k('for')} u ${k('in')} range(numCourses) ${k('if')} need[u] == 0)`],
      [null, `        taken = 0`],
      [null, `        ${k('while')} queue:`],
      ['take', `            u = queue.popleft()`],
      ['take', `            taken += 1`],
      [null, `            ${k('for')} v ${k('in')} after[u]:`],
      ['unlock', `                need[v] -= 1`],
      ['unlock', `                ${k('if')} need[v] == 0:`],
      ['ready', `                    queue.append(v)`],
      ['ret', `        ${k('return')} taken == numCourses`],
    ],
    javascript: [
      [null, `${k('const')} canFinish = ${k('function')} (numCourses, prerequisites) {`],
      [null, `  ${k('const')} after = Array.from({ length: numCourses }, () =&gt; []);`],
      [null, `  ${k('const')} need = ${k('new')} Array(numCourses).fill(0);`],
      [null, `  ${k('for')} (${k('const')} [a, b] ${k('of')} prerequisites) {`],
      ['graph', `    after[b].push(a);`],
      ['graph', `    need[a]++;`],
      [null, `  }`],
      ['free', `  ${k('const')} queue = [];`],
      ['free', `  ${k('for')} (${k('let')} u = 0; u &lt; numCourses; u++) ${k('if')} (need[u] === 0) queue.push(u);`],
      [null, `  ${k('let')} taken = 0;`],
      [null, `  ${k('for')} (${k('let')} head = 0; head &lt; queue.length; head++) {`],
      ['take', `    ${k('const')} u = queue[head];`],
      ['take', `    taken++;`],
      [null, `    ${k('for')} (${k('const')} v ${k('of')} after[u]) {`],
      ['unlock', `      need[v]--;`],
      ['ready', `      ${k('if')} (need[v] === 0) queue.push(v);`],
      [null, `    }`],
      [null, `  }`],
      ['ret', `  ${k('return')} taken === numCourses;`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} canFinish(numCourses int, prerequisites [][]int) bool {`],
      [null, `    after := make([][]int, numCourses)`],
      [null, `    need := make([]int, numCourses)`],
      [null, `    ${k('for')} _, p := ${k('range')} prerequisites {`],
      ['graph', `        after[p[1]] = append(after[p[1]], p[0])`],
      ['graph', `        need[p[0]]++`],
      [null, `    }`],
      ['free', `    queue := []int{}`],
      [null, `    ${k('for')} u := 0; u &lt; numCourses; u++ {`],
      [null, `        ${k('if')} need[u] == 0 {`],
      ['free', `            queue = append(queue, u)`],
      [null, `        }`],
      [null, `    }`],
      [null, `    taken := 0`],
      [null, `    ${k('for')} len(queue) &gt; 0 {`],
      ['take', `        u := queue[0]`],
      [null, `        queue = queue[1:]`],
      ['take', `        taken++`],
      [null, `        ${k('for')} _, v := ${k('range')} after[u] {`],
      ['unlock', `            need[v]--`],
      [null, `            ${k('if')} need[v] == 0 {`],
      ['ready', `                queue = append(queue, v)`],
      [null, `            }`],
      [null, `        }`],
      [null, `    }`],
      ['ret', `    ${k('return')} taken == numCourses`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('use')} std::collections::VecDeque;`],
      [null, ``],
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} can_finish(num_courses: i32, prerequisites: Vec&lt;Vec&lt;i32&gt;&gt;) -&gt; bool {`],
      [null, `        ${k('let')} n = num_courses as usize;`],
      [null, `        ${k('let')} ${k('mut')} after = vec![vec![]; n];`],
      [null, `        ${k('let')} ${k('mut')} need = vec![0; n];`],
      [null, `        ${k('for')} p ${k('in')} &amp;prerequisites {`],
      ['graph', `            after[p[1] as usize].push(p[0] as usize);`],
      ['graph', `            need[p[0] as usize] += 1;`],
      [null, `        }`],
      ['free', `        ${k('let')} ${k('mut')} queue: VecDeque&lt;usize&gt; = (0..n).filter(|&amp;u| need[u] == 0).collect();`],
      [null, `        ${k('let')} ${k('mut')} taken = 0;`],
      ['take', `        ${k('while')} ${k('let')} ${k('Some')}(u) = queue.pop_front() {`],
      ['take', `            taken += 1;`],
      [null, `            ${k('for')} &amp;v ${k('in')} &amp;after[u] {`],
      ['unlock', `                need[v] -= 1;`],
      [null, `                ${k('if')} need[v] == 0 {`],
      ['ready', `                    queue.push_back(v);`],
      [null, `                }`],
      [null, `            }`],
      [null, `        }`],
      ['ret', `        taken == n`],
      [null, `    }`],
      [null, `}`],
    ],
  },
};

/* ---------------- part 1: the "draw the arrows" widget ----------------
 *
 * The whole question is whether the arrows loop. Click one course, then
 * another, to add (or remove) "the second waits on the first"; the widget
 * shows an order that works, or the loop that makes one impossible. */

const QW_SETS = [
  { label: exampleTitle(2), n: 2, ps: [[1, 0], [0, 1]] },
  { label: t('a diamond', 'စိန်ပုံ'), n: 4, ps: [[1, 0], [2, 0], [3, 1], [3, 2]] },
  { label: t('a loop of three', 'သုံးခု ကွင်း'), n: 5, ps: [[1, 0], [2, 1], [0, 2], [3, 4]] },
  { label: t('5, no pairs', '5 ခု၊ pair မရှိ'), n: 5, ps: [] },
];

/* An order that works (Kahn), or one loop (DFS) when there is none. */
function solve(n, ps) {
  const after = Array.from({ length: n }, () => []);
  const need = new Array(n).fill(0);
  for (const [a, b] of ps) { after[b].push(a); need[a]++; }
  const order = [];
  const q = [...Array(n).keys()].filter((u) => need[u] === 0);
  while (q.length) { const u = q.shift(); order.push(u); for (const v of after[u]) if (--need[v] === 0) q.push(v); }
  if (order.length === n) return { order };
  const st = new Array(n).fill(0), path = [];
  const dfs = (u) => {
    if (st[u] === 1) return path.slice(path.indexOf(u));
    if (st[u] === 2) return null;
    st[u] = 1; path.push(u);
    for (const v of after[u]) { const l = dfs(v); if (l) return l; }
    st[u] = 2; path.pop();
    return null;
  };
  for (let u = 0; u < n; u++) { const l = dfs(u); if (l) return { loop: l }; }
  return { loop: [] };
}

function mountArrowWidget(host) {
  const state = { set: 1, n: 0, ps: [], picked: null };
  const load = (i) => { state.set = i; state.n = QW_SETS[i].n; state.ps = QW_SETS[i].ps.map((p) => [...p]); state.picked = null; };
  load(1);
  host.innerHTML = `
    <div data-graph></div>
    <div class="q-slider"><span class="q-presets" data-presets></span></div>
    <p class="q-tie" data-line></p>
    <div class="ledger">
      <span class="expr" data-expr></span>
      <span class="total" data-total></span>
    </div>`;
  const q = (sel) => host.querySelector(sel);

  function render() {
    const res = solve(state.n, state.ps);
    const tone = {};
    if (res.loop) for (const u of res.loop) tone[u] = 'bad';
    q('[data-graph]').innerHTML = graphSvg(state.n, state.ps, { tone, loop: res.loop, prefix: 'qw', clickable: true, picked: state.picked });
    q('[data-presets]').innerHTML = presetChips(QW_SETS, state.set);
    widgetLabel(pick(state.picked == null ? t('click a course, then another', 'course တစ်ခု၊ ပြီးမှ နောက်တစ်ခု နှိပ်ပါ')
      : t(`now the course that waits on ${state.picked}`, `ယခု ${state.picked} ကို စောင့်မည့် course`)));
    q('[data-line]').innerHTML = pick(res.order
      ? t(`No loop, so there is an order: take ${res.order.join(', then ')}. Every arrow points forward in it.`,
          `ကွင်း မရှိသဖြင့် အစီအစဉ် ရှိသည် — ${res.order.join('၊ ပြီးမှ ')} ကို ယူပါ။ မြှားတိုင်း ရှေ့သို့ ညွှန်သည်။`)
      : t(`${res.loop.join(' → ')} → ${res.loop[0]} is a loop: each of those courses waits, in the end, on itself, so none of them can be taken first.`,
          `${res.loop.join(' → ')} → ${res.loop[0]} သည် ကွင်း — ထို course တစ်ခုစီသည် နောက်ဆုံးတွင် သူ့ကိုယ်သူ စောင့်နေသဖြင့် မည်သည်ကိုမျှ အရင် မယူနိုင်ပါ။`));
    q('[data-expr]').innerHTML = `prerequisites = ${fmtPairs(state.ps)}`;
    q('[data-total]').innerHTML = `${res.order ? 'true' : 'false'}<small>${pick(t('can finish', 'ပြီးနိုင်'))}</small>`;
  }
  function tap(u) {
    if (state.picked == null) { state.picked = u; return render(); }
    const b = state.picked, a = u;
    const i = state.ps.findIndex(([x, y]) => x === a && y === b);
    if (i >= 0) state.ps.splice(i, 1); else state.ps.push([a, b]);
    state.picked = null;
    render();
  }
  host.addEventListener('click', (ev) => {
    const chip = ev.target.closest('[data-set]');
    if (chip) { load(Number(chip.dataset.set)); return render(); }
    const node = ev.target.closest('[data-u]');
    if (node) tap(Number(node.dataset.u));
  });
  host.addEventListener('keydown', (ev) => {
    const node = ev.target.closest('[data-u]');
    if (node && (ev.key === 'Enter' || ev.key === ' ')) {
      ev.preventDefault();
      const u = Number(node.dataset.u);
      tap(u);
      host.querySelector(`[data-u="${u}"]`)?.focus();
    }
  });
  onLangChange(render);
  render();
}

/* ---------------- the approach, in brief ---------------- */

const APPROACH = {
  dfs: {
    idea: t('Follow the arrows depth-first, remembering which courses are on the path you are following right now. Reaching one of them again means the arrows loop; reaching a course already finished means nothing.',
            'မြှားများကို depth-first လိုက်ပြီး ယခု လိုက်နေသော လမ်းကြောင်းပေါ်ရှိ course များကို မှတ်ထားသည်။ ၎င်းတို့ထဲမှ တစ်ခုကို ပြန်ရောက်လျှင် မြှားများ ကွင်းပတ်သည် — ပြီးပြီးသား course ကို ရောက်လျှင် ဘာမှ မဆိုလိုပါ။'),
    steps: [
      t('Build <code>after[b]</code> from every pair [a, b]; set every <code>state</code> to 0.', 'pair [a, b] တိုင်းမှ <code>after[b]</code> ကို တည်ဆောက်ပြီး <code>state</code> တိုင်းကို 0 ထားသည်။'),
      t('<code>cycle(u)</code>: 1 means a loop, 2 means already cleared; otherwise mark it 1 and try every <code>v</code> in <code>after[u]</code>.',
        '<code>cycle(u)</code> — 1 ဆိုလျှင် ကွင်း၊ 2 ဆိုလျှင် ရှင်းပြီးသား — မဟုတ်လျှင် 1 မှတ်ပြီး <code>after[u]</code> ထဲရှိ <code>v</code> တိုင်းကို စမ်းသည်။'),
      t('No loop below it: mark <code>u</code> 2 on the way out.', 'အောက်တွင် ကွင်းမရှိ — ထွက်ချိန်တွင် <code>u</code> ကို 2 မှတ်သည်။'),
      t('Run <code>cycle</code> from every course; any loop means false.', 'course တိုင်းမှ <code>cycle</code> run သည် — ကွင်း တစ်ခုခုရှိလျှင် false။'),
    ],
    cost: t('Each course is entered once and each arrow followed once: O(V + E). The recursion can be as deep as the longest chain — 2,000 courses at the constraint.',
            'course တစ်ခုစီကို တစ်ကြိမ် ဝင်ပြီး မြှားတစ်ခုစီကို တစ်ကြိမ် လိုက်သည် — O(V + E)။ recursion သည် အရှည်ဆုံး ကွင်းဆက်အထိ နက်နိုင်သည် — ကန့်သတ်ချက်တွင် course 2,000။'),
  },
  kahn: {
    idea: t('Keep taking courses that wait on nothing. Taking one frees up whatever was waiting only on it. If the free courses run out before all are taken, the rest wait on each other: a loop.',
            'ဘာကိုမျှ မစောင့်သော course များကို ဆက်ယူသည်။ တစ်ခုယူလျှင် ၎င်းကိုသာ စောင့်နေသော course များ လွတ်သည်။ အားလုံး မယူမီ လွတ်သော course ကုန်သွားလျှင် ကျန်သည်များ အချင်းချင်း စောင့်နေသည် — ကွင်း။'),
    steps: [
      t('Build <code>after</code>, and count in <code>need[a]</code> how many courses a waits on.', '<code>after</code> တည်ဆောက်ပြီး a စောင့်နေသော course အရေအတွက်ကို <code>need[a]</code> တွင် ရေတွက်သည်။'),
      t('Queue every course with <code>need</code> 0.', '<code>need</code> 0 ရှိသော course တိုင်းကို queue ထဲ ထည့်သည်။'),
      t('Pop <code>u</code>, <code>taken += 1</code>; for each <code>v</code> in <code>after[u]</code>, lower <code>need[v]</code> and queue it at 0.',
        '<code>u</code> ထုတ်၊ <code>taken += 1</code> — <code>after[u]</code> ထဲရှိ <code>v</code> တစ်ခုစီအတွက် <code>need[v]</code> လျှော့ပြီး 0 ရောက်လျှင် queue ထဲ ထည့်သည်။'),
      t('Return <code>taken == numCourses</code>.', '<code>taken == numCourses</code> ကို ပြန်ပေးသည်။'),
    ],
    cost: t('Each course is queued at most once and each arrow lowers one count once: O(V + E), with no recursion at all.',
            'course တစ်ခုစီကို အများဆုံး တစ်ကြိမ် queue ထဲ ထည့်ပြီး မြှားတစ်ခုစီက count တစ်ခုကို တစ်ကြိမ် လျှော့သည် — O(V + E)၊ recursion လုံးဝ မပါ။'),
  },
};

/* ---------------- mount ---------------- */

mountLesson({
  input: { numCourses: 4, prerequisites: [[1, 0], [2, 0], [3, 1], [3, 2]] },
  controls: [
    { key: 'numCourses', label: 'numCourses', type: 'number', min: 1, max: MAX_N, parse: intValue({ lo: 1, hi: MAX_N, why: 'so the graph stays readable' }) },
    { key: 'prerequisites', label: 'prerequisites', parse: parsePairs, format: fmtPairs },
  ],
  presets: [
    { label: exampleTitle(1), input: { numCourses: 2, prerequisites: [[1, 0]] } },
    { label: exampleTitle(2), input: { numCourses: 2, prerequisites: [[1, 0], [0, 1]] } },
    { label: t('a diamond', 'စိန်ပုံ'), input: { numCourses: 4, prerequisites: [[1, 0], [2, 0], [3, 1], [3, 2]] } },
    { label: t('a loop off to one side', 'ဘေးတွင် ကွင်း'), input: { numCourses: 5, prerequisites: [[1, 0], [2, 1], [3, 4], [4, 3]] } },
  ],
  examples: [
    { title: exampleTitle(1), inputHtml: '<code>numCourses = 2, prerequisites = [[1,0]]</code>', output: 'true',
      why: [t('To take course 1 you must have finished course 0: take 0, then 1.', 'course 1 ကို ယူရန် course 0 ကို ပြီးထားရမည် — 0 ကို ယူ၊ ပြီးမှ 1။')],
      load: { numCourses: 2, prerequisites: [[1, 0]] } },
    { title: exampleTitle(2), inputHtml: '<code>numCourses = 2, prerequisites = [[1,0],[0,1]]</code>', output: 'false',
      why: [t('1 needs 0 and 0 needs 1: each waits on the other, so neither can go first.', '1 သည် 0 ကို လိုပြီး 0 သည် 1 ကို လိုသည် — တစ်ခုက တစ်ခုကို စောင့်နေသဖြင့် မည်သည့်တစ်ခုမျှ အရင် မသွားနိုင်။')],
      load: { numCourses: 2, prerequisites: [[1, 0], [0, 1]] } },
  ],
  modes: [
    { id: 'dfs', name: 'Three-colour DFS',
      sub: t('recursive', 'recursive'),
      desc: t('Follow the arrows; meeting the current path again is a cycle.', 'မြှားများကို လိုက် — လက်ရှိ လမ်းကြောင်းကို ပြန်တွေ့လျှင် cycle။'),
      cost: 'O(V + E) time · O(V) stack', build: buildDfs },
    { id: 'kahn', name: "Kahn's algorithm",
      sub: t('a queue', 'queue'),
      desc: t('Keep taking courses that wait on nothing; see if you run out.', 'ဘာမှ မစောင့်သော course များကို ဆက်ယူ — ကုန်သွားသလား ကြည့်။'),
      cost: 'O(V + E) time · O(V) space', build: buildKahn },
  ],
  languages: LANGUAGES,
  code: CODE,
  hover: { ruby: { num_courses: 'numCourses' }, rust: { num_courses: 'numCourses' } },
  solutions: {
    dfs: { approach: APPROACH.dfs,
      desc: t('Three states, not two: "on the path" is what makes a loop, "done" is what makes a course safe to skip. Python needs its recursion limit raised for a 2,000-course chain.',
              'state နှစ်ခုမဟုတ်၊ သုံးခု — "လမ်းပေါ်" က ကွင်းကို ဖြစ်စေပြီး "ပြီး" က course ကို ကျော်ရန် ဘေးကင်းစေသည်။ course 2,000 ကွင်းဆက်အတွက် Python ၏ recursion ကန့်သတ်ချက်ကို မြှင့်ရမည်။') },
    kahn: { approach: APPROACH.kahn,
      desc: t('The one worth writing: no recursion, one count per course, and the order it takes courses in is a real schedule if you ever need one (Course Schedule II).',
              'ရေးသင့်သည့် version — recursion မပါ၊ course တစ်ခုလျှင် count တစ်ခု၊ ယူသော အစီအစဉ်သည် လိုအပ်လျှင် တကယ့် အချိန်ဇယား ဖြစ်သည် (Course Schedule II)။') },
  },
  // How each language was actually checked, printed as the part 3 badges.
  // The corpus: the 2 examples, 8 edges, 15,000 random graphs up to 8
  // courses, 5,000 up to 60, and six at 2,000 courses (a 2,000-long chain, the
  // chain closed into a cycle, random DAG and random graph with 5,000 pairs,
  // a 2,000-cycle, one course needed by all) — against an oracle that peels
  // off free courses until none are left. Go and Rust ran in Docker
  // (golang:1.23-alpine, rust:1-slim), every language on its default stack.
  verification: {
    ruby: 'ran here · 20,016 cases',
    python: 'ran here · 20,016 cases',
    javascript: 'ran here · 20,016 cases',
    go: 'ran here · 20,016 cases · Go 1.23',
    rust: 'ran here · 20,016 cases · rustc 1.98',
  },
  caveats: {
    dfs: {
      python: t('The <code>setrecursionlimit</code> line is part of the answer: at Python\'s default of 1,000, a chain of 1,000 courses already fails with <code>RecursionError</code> (checked here), and the constraints allow 2,000.',
                '<code>setrecursionlimit</code> စာကြောင်းသည် အဖြေ၏ အစိတ်အပိုင်း — Python ၏ default 1,000 တွင် course 1,000 ကွင်းဆက်ပင် <code>RecursionError</code> ဖြင့် ကျရှုံးသည် (ဤနေရာတွင် စစ်ထားသည်)၊ ကန့်သတ်ချက်က 2,000 ကို ခွင့်ပြုသည်။'),
    },
  },
  stripLabel: t('One number per course', 'course တစ်ခုလျှင် ဂဏန်းတစ်ခု'),
  strip,
  draw,
  answer,
  vars,
  widget: mountArrowWidget,
});
