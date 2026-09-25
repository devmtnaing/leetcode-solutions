/* X-Sum — LeetCode 3318 and its hard twin 3321.
 *
 * Every length-k window has an x-sum: keep the x most frequent values
 * (bigger value wins a tie) and add up their occurrences. The brute force
 * recounts each window from scratch. The sliding window keeps two shelves —
 * TOP, the x strongest (count, value) entries, and REST, everything else —
 * with a running sum of TOP, and repairs them as one value enters and one
 * leaves. It appears twice, because the container is the lesson: sorted
 * arrays are the clear version and fine for 3318; lazy heaps are the same
 * algorithm with a container that passes 3321.
 *
 * This page was the reference design the kit reproduces; it now runs on the
 * kit itself. Its generators, stage and widget are ported from the original.
 */
import { mountLesson } from '../../lib/stepper.js';
import { pick, onLangChange } from '../../lib/i18n.js';
import { cells, slots } from '../../lib/stage.js';
import { t, exampleTitle, LANGUAGES, k, c, intList, intValue, listText, presetChips, widgetLabel } from '../../lib/kit.js';

const MAX_N = 12;

/* ---------------- ranking: [count, value] ascending ---------------- */

const cmp = (a, b) => (a.c - b.c) || (a.v - b.v);
const lower = (arr, e) => {
  let lo = 0, hi = arr.length;
  while (lo < hi) { const m = (lo + hi) >> 1; if (cmp(arr[m], e) < 0) lo = m + 1; else hi = m; }
  return lo;
};
const insert = (arr, e) => { arr.splice(lower(arr, e), 0, e); };
const remove = (arr, e) => {
  const i = lower(arr, e);
  if (i < arr.length && arr[i].v === e.v && arr[i].c === e.c) { arr.splice(i, 1); return true; }
  return false;
};
const face = (e) => `${e.v}×${e.c}`;
const same = (a, b) => a && b && a.v === b.v && a.c === b.c;

/* ---------------- narration, both languages ----------------
 * Each entry is [english, burmese]; say(key, ...args) returns a t() pair.
 * Code identifiers, TOP/REST, and terms Burmese developers write in English
 * (window, heap, array, count, value, stale, root) stay in Latin. */

const MSG = {
  bfWindow: [(i, win) => `Window ${i} = [${win}]. Everything learned about the last window is thrown away — this one starts from nothing.`,
             (i, win) => `Window ${i} = [${win}]။ ယခင် window မှ သိထားသမျှကို အကုန်စွန့်ပြီး ဤတစ်ခုကို အစမှ ပြန်စသည်။`],
  bfTally: [(k, list) => `<code>tally</code> walks all ${k} elements and counts them: ${list}.`,
            (k, list) => `<code>tally</code> သည် element ${k} ခုလုံးကို လျှောက်ပြီး ရေတွက်သည် — ${list}။`],
  bfRankHead: [(first) => `Sort by <code>[count, value]</code> descending${first ? `: <code>${first}</code> ranks first.` : '.'}`,
               (first) => `<code>[count, value]</code> ကို ကြီးစဉ်ငယ်လိုက် စီလိုက်သည်${first ? ` — <code>${first}</code> က ထိပ်ဆုံးရောက်သည်။` : '။'}`],
  bfTie: [(a, b, c, cut) => ` <b>${a}</b> and <b>${b}</b> both appear ${c} ${c === 1 ? 'time' : 'times'}, so ${a} ranks higher for being the bigger value${cut ? ' — which is what decides the cut here.' : '.'}`,
          (a, b, c, cut) => ` <b>${a}</b> နှင့် <b>${b}</b> နှစ်ခုလုံး ${c} ကြိမ်စီ ပေါ်သည်။ ထို့ကြောင့် တန်ဖိုးပိုကြီးသော ${a} က အဆင့်ပိုမြင့်သည်${cut ? ' — ဤနေရာတွင် ဖြတ်မျဉ်းကို ဆုံးဖြတ်ပေးသည်မှာ ဤအချက်ပင်။' : '။'}`],
  bfNoTie: [() => ' Nothing ties in this window, so the counts alone settle the order.',
            () => ' ဤ window တွင် သရေမရှိသဖြင့် အရေအတွက်ချည်းဖြင့်ပင် အစီအစဉ် ကျသည်။'],
  bfSum: [(keep, expr, sum) => `Keep the top ${keep}: ${expr} = <code>${sum}</code>. Then drop it all and do it again.`,
          (keep, expr, sum) => `ထိပ်ဆုံး ${keep} ခုကို ထားလိုက်သည် — ${expr} = <code>${sum}</code>။ ပြီးလျှင် အားလုံးကို စွန့်ပြီး နောက် window တွင် ပြန်လုပ်သည်။`],

  swDetach: [(v, f, inTop, gain) => `${v} is already on the board as <code>${f}</code>. Lift that card off <b>before</b> the count changes — its rank is its count.${inTop ? ` It was in TOP, so the running sum gives back ${gain}.` : ''}`,
             (v, f, inTop, gain) => `${v} သည် <code>${f}</code> အဖြစ် ရှိနှင့်ပြီးသား ဖြစ်သည်။ count မပြောင်းမီ ထိုကတ်ကို <b>အရင်ဆွဲထုတ်</b>ပါ — အဆင့်ဆိုသည်မှာ count ပင်ဖြစ်သည်။${inTop ? ` TOP ထဲတွင် ရှိခဲ့သဖြင့် စုစုပေါင်းမှ ${gain} ကို ပြန်နုတ်သည်။` : ''}`],
  swGone: [(v) => `<code>count[${v}] = 0</code> — ${v} is out of the window entirely, so the card is gone.`,
           (v) => `<code>count[${v}] = 0</code> — ${v} သည် window ထဲမှ လုံးဝထွက်သွားသဖြင့် ကတ်လည်း ပျောက်သွားသည်။`],
  swInsert: [(v, c) => `<code>count[${v}] = ${c}</code>. Re-enter at the bottom of REST — no thinking about where it belongs, <code>rebalance</code> decides.`,
             (v, c) => `<code>count[${v}] = ${c}</code>။ REST ၏ အောက်ဆုံးမှ ပြန်ထည့်လိုက်သည် — မည်သည့်နေရာသို့ သွားသင့်သည်ကို မစဉ်းစားဘဲ <code>rebalance</code> ကို ဆုံးဖြတ်စေသည်။`],
  swFill: [(n, x, f, add, sum) => `TOP still has room (${n}/${x}) — promote <code>${f}</code>. sum += ${add} → <code>${sum}</code>.`,
           (n, x, f, add, sum) => `TOP တွင် နေရာလွတ် ကျန်သေးသည် (${n}/${x}) — <code>${f}</code> ကို တင်လိုက်သည်။ sum += ${add} → <code>${sum}</code>။`],
  swViolation: [(up, down, uc, uv, dc, dv) => `Barrier broken. REST's best <code>${up}</code> outranks TOP's weakest <code>${down}</code> — <code>[${uc}, ${uv}] &gt; [${dc}, ${dv}]</code>. They trade places.`,
                (up, down, uc, uv, dc, dv) => `အကန့် ကျိုးသွားပြီ။ REST ၏ အကောင်းဆုံး <code>${up}</code> သည် TOP ၏ အားအနည်းဆုံး <code>${down}</code> ထက် အဆင့်မြင့်သည် — <code>[${uc}, ${uv}] &gt; [${dc}, ${dv}]</code>။ နေရာချင်း လဲလိုက်သည်။`],
  swDemote: [(f, sub, sum) => `Demote <code>${f}</code>. sum −= ${sub} → <code>${sum}</code>.`,
             (f, sub, sum) => `<code>${f}</code> ကို အောက်ချလိုက်သည်။ sum −= ${sub} → <code>${sum}</code>။`],
  swPromote: [(f, add, sum) => `Promote <code>${f}</code>. sum += ${add} → <code>${sum}</code>.`,
              (f, add, sum) => `<code>${f}</code> ကို အပေါ်တင်လိုက်သည်။ sum += ${add} → <code>${sum}</code>။`],
  swRecord: [(win, sum) => `Window [${win}] is complete → x-sum <code>${sum}</code>. Nothing was recounted; the total has been correct the whole way.`,
             (win, sum) => `Window [${win}] ပြီးပါပြီ → x-sum <code>${sum}</code>။ ဘာမှ ပြန်မရေတွက်ခဲ့ရဘဲ စုစုပေါင်းသည် အစကတည်းက မှန်နေခဲ့သည်။`],

  hpDetachTop: [(v, gain, f) => `${v} leaves the TOP set, so the sum gives back ${gain}. Its heap entry <code>${f}</code> is <b>left where it is</b> — removing from the middle of a heap is expensive, so it just goes stale.`,
                (v, gain, f) => `${v} သည် TOP အစုမှ ထွက်သွားသဖြင့် စုစုပေါင်းမှ ${gain} ကို ပြန်နုတ်သည်။ သူ၏ heap entry <code>${f}</code> ကိုမူ <b>မဖယ်ဘဲ ထားလိုက်သည်</b> — heap အလယ်မှ ဖယ်ထုတ်ရန် ကုန်ကျစရိတ်များသဖြင့် stale ဖြစ်သွားအောင် ပစ်ထားလိုက်ခြင်းဖြစ်သည်။`],
  hpDetachRest: [(v, f) => `${v} is in REST as <code>${f}</code>. Nothing is removed — that entry simply becomes stale the moment the count changes.`,
                 (v, f) => `${v} သည် REST ထဲတွင် <code>${f}</code> အဖြစ် ရှိသည်။ ဘာမှ မဖယ်ထုတ်ပါ — count ပြောင်းသည်နှင့် ထို entry သည် stale ဖြစ်သွားရုံသာ ဖြစ်သည်။`],
  hpGone: [(v) => `<code>count[${v}] = 0</code> — ${v} is out of the window. Every entry for it is now stale.`,
           (v) => `<code>count[${v}] = 0</code> — ${v} သည် window ထဲမှ ထွက်သွားပြီ။ သူနှင့်သက်ဆိုင်သော entry အားလုံး stale ဖြစ်ကုန်ပြီ။`],
  hpPush: [(v, c, f) => `<code>count[${v}] = ${c}</code>. Push a fresh <code>${f}</code> into the REST heap.`,
           (v, c, f) => `<code>count[${v}] = ${c}</code>။ အသစ်ဖြစ်သော <code>${f}</code> ကို REST heap ထဲသို့ ထည့်လိုက်သည်။`],
  hpDiscardRest: [(f, v, now) => `REST's root <code>${f}</code> is stale — ${v} ${now ? `now has ${now} occurrence${now === 1 ? '' : 's'}` : 'is gone from the window'}. Throw the entry away and look at the new root.`,
                  (f, v, now) => `REST ၏ root <code>${f}</code> သည် stale ဖြစ်နေပြီ — ${v} သည် ${now ? `ယခု ${now} ကြိမ် ရှိသည်` : 'window ထဲမှ ထွက်သွားပြီ'}။ ထို entry ကို ပစ်လိုက်ပြီး root အသစ်ကို ကြည့်သည်။`],
  hpDiscardTop: [(f) => `TOP's root <code>${f}</code> is stale — discard it and look again.`,
                 (f) => `TOP ၏ root <code>${f}</code> သည် stale ဖြစ်နေပြီ — ပစ်လိုက်ပြီး ပြန်ကြည့်သည်။`],
  hpFill: [(n, x, f, add, sum) => `TOP has room (${n}/${x}) — promote REST's live root <code>${f}</code>. sum += ${add} → <code>${sum}</code>.`,
           (n, x, f, add, sum) => `TOP တွင် နေရာလွတ် ရှိသည် (${n}/${x}) — REST ၏ live root <code>${f}</code> ကို တင်လိုက်သည်။ sum += ${add} → <code>${sum}</code>။`],
  hpPromote: [(f, add, sum) => `Promote <code>${f}</code> into TOP. sum += ${add} → <code>${sum}</code>.`,
              (f, add, sum) => `<code>${f}</code> ကို TOP ထဲသို့ တင်လိုက်သည်။ sum += ${add} → <code>${sum}</code>။`],
  hpDemote: [(f, sub, sum) => `Demote <code>${f}</code> into REST. sum −= ${sub} → <code>${sum}</code>.`,
             (f, sub, sum) => `<code>${f}</code> ကို REST ထဲသို့ ချလိုက်သည်။ sum −= ${sub} → <code>${sum}</code>။`],
  hpViolation: [(best, weakest) => `REST's live root <code>${best}</code> outranks TOP's live root <code>${weakest}</code>. Swap them.`,
                (best, weakest) => `REST ၏ live root <code>${best}</code> သည် TOP ၏ live root <code>${weakest}</code> ထက် အဆင့်မြင့်သည်။ နေရာချင်း လဲလိုက်သည်။`],
  hpRecord: [(win, sum) => `Window [${win}] → x-sum <code>${sum}</code>. Stale entries are still sitting in the heaps — they cost nothing until they reach a root.`,
             (win, sum) => `Window [${win}] → x-sum <code>${sum}</code>။ stale entry များ heap ထဲတွင် ကျန်နေသေးသည် — root အထိ မရောက်မချင်း ကုန်ကျမှု မရှိပါ။`],
};
const say = (key, ...a) => t(MSG[key][0](...a), MSG[key][1](...a));

/* Stage labels, picked at draw time. */
const L = {
  empty: t('empty', 'ဘာမှမရှိ'),
  shelves: t('Two shelves', 'စင်နှစ်ခု'),
  heaps: t('Two heaps', 'heap နှစ်ခု'),
  rankedBy: t('ranked by [count, value]', '[count, value] ဖြင့် အဆင့်သတ်မှတ်သည်'),
  topNote: (x, n) => t(`the ${x} that count · ${n}/${x}`, `အရေးပါသော ${x} ခု · ${n}/${x}`),
  restNote: t('in the window, out of the sum', 'window ထဲရှိသော်လည်း ပေါင်းလဒ်ထဲ မပါ'),
  barrier: t('barrier · every TOP card outranks every REST card', 'အကန့် · TOP ကတ်တိုင်းသည် REST ကတ်တိုင်းထက် အဆင့်မြင့်သည်'),
  barrierBroken: t('barrier broken — swap incoming', 'အကန့် ကျိုးသွားပြီ — နေရာလဲရတော့မည်'),
  nothingKept: t('nothing kept yet', 'ဘာမှ မကျန်သေး'),
  rootsOnly: t('only the roots are ever read', 'root များကိုသာ ဖတ်သည်'),
  topHeapNote: (live, total, size, x) => t(`root = weakest kept · ${live} of ${total} entries live · set is ${size}/${x}`,
                                         `root = ထားထားသည့်အထဲ အားအနည်းဆုံး · entry ${total} ခုအနက် ${live} ခု live · အစု ${size}/${x}`),
  restHeapNote: (live, total) => t(`root = strongest dropped · ${live} of ${total} entries live`, `root = ဖယ်ထားသည့်အထဲ အကောင်းဆုံး · entry ${total} ခုအနက် ${live} ခု live`),
  stale: (now) => (now ? t(`stale · now ${now}`, `stale · ယခု ${now}`) : t('stale · gone', 'stale · ထွက်သွားပြီ')),
  heapLedger: t('@sum tracks the TOP set, not the heap contents', '@sum က heap ထဲရှိအရာများကို မဟုတ်ဘဲ TOP အစုကိုသာ မှတ်သည်'),
  windowFromScratch: (i) => t(`Window ${i} from scratch`, `Window ${i} ကို အစမှ ပြန်စသည်`),
  tallyHead: (k) => t(`tally — one pass over all ${k} elements`, `tally — element ${k} ခုလုံးကို တစ်ခေါက် လျှောက်သည်`),
  notCounted: t('not counted yet', 'မရေတွက်ရသေး'),
  rankHead: (n) => t(`rank by [count, value], keep ${n}`, `[count, value] ဖြင့် အဆင့်ခွဲပြီး ${n} ခု ထားသည်`),
  notRanked: t('not ranked yet', 'အဆင့် မခွဲရသေး'),
  sumHead: t('sum the survivors', 'ကျန်ရစ်သူများကို ပေါင်းသည်'),
  cutKeep: (n) => t(`cut · keep ${n}`, `ဖြတ်မျဉ်း · ${n} ခု ထားသည်`),
  qNothing: t('nothing kept', 'ဘာမှ မကျန်'),
  qTie: (a, b, c, decides) => t(
    `Tie: ${a} and ${b} both appear ${c} ${c === 1 ? 'time' : 'times'}, so ${a} ranks higher for being the bigger value${decides ? ' — and that is exactly what decides which one survives here.' : '.'}`,
    `သရေ — ${a} နှင့် ${b} နှစ်ခုလုံး ${c} ကြိမ်စီ ပေါ်သည်။ ထို့ကြောင့် တန်ဖိုးပိုကြီးသော ${a} က အဆင့်ပိုမြင့်သည်${decides ? ' — ဤနေရာတွင် ဘယ်ဟာကျန်မည်ကို ဆုံးဖြတ်ပေးသည်မှာ ဤအချက်ပင်။' : '။'}`),
  valuesDistinct: (n, d) => t(`${n} values, ${d} distinct`, `တန်ဖိုး ${n} ခု၊ ကွဲပြားမှု ${d} မျိုး`),
  keepX: t('keep x =', 'ထားမည့် x ='),
};

/* The page's rules for an input, the same ones the statement sets. */
function checkInput({ nums, k, x }) {
  if (!nums.length) throw new Error('nums needs at least one number');
  if (!Number.isInteger(k) || k < 1 || k > nums.length) throw new Error(`k must be between 1 and n = ${nums.length}`);
  if (!Number.isInteger(x) || x < 1 || x > k) throw new Error(`x must be between 1 and k = ${k}`);
}

/* ---------------- brute force: rebuild every window ---------------- */

function buildBrute(input) {
  checkInput(input);
  const { nums, k, x } = input;
  const steps = [], answer = [];
  for (let i = 0; i + k <= nums.length; i++) {
    const win = nums.slice(i, i + k);
    const counts = new Map();
    win.forEach((v) => counts.set(v, (counts.get(v) || 0) + 1));
    const ranked = Array.from(counts, ([v, c]) => ({ v, c })).sort((a, b) => cmp(b, a));   // strongest first
    const kept = ranked.slice(0, x);
    const sum = kept.reduce((s, e) => s + e.v * e.c, 0);
    const base = { view: 'brute', lo: i, hi: i + k - 1, win, ranked, keep: kept.length, sum, answer: answer.slice(),
                   vars: { i, window: win, counts: ranked.slice().sort((a, b) => a.v - b.v), ranked, kept, sum } };
    steps.push({ ...base, stage: 0, tag: t(`window ${i}`, `window ${i}`), line: 'window', note: say('bfWindow', i, win.join(', ')) });
    steps.push({ ...base, stage: 1, tag: t('tally', 'tally'), line: 'tally', note: say('bfTally', k, ranked.map(face).join(', ')) });
    const keep = Math.min(x, ranked.length);
    let tie = null;
    for (let ti = 1; ti < ranked.length; ti++) {
      if (ranked[ti].c === ranked[ti - 1].c) { tie = say('bfTie', ranked[ti - 1].v, ranked[ti].v, ranked[ti].c, ti === keep); break; }
    }
    tie = tie ?? say('bfNoTie');
    const head = say('bfRankHead', ranked.length > 1 ? face(ranked[0]) : '');
    steps.push({ ...base, stage: 2, tag: t('rank', 'rank'), line: 'rank', note: t(head.en + tie.en, head.my + tie.my) });
    answer.push(sum);
    steps.push({ ...base, stage: 3, tag: t('sum', 'sum'), line: 'sum', answer: answer.slice(),
      note: say('bfSum', keep, kept.map((e) => `${e.v}×${e.c}`).join(' + '), sum) });
  }
  return steps;
}

/* ---------------- sliding window: two shelves, running sum ---------------- */

function buildSorted(input) {
  checkInput(input);
  const { nums, k, x } = input;
  const steps = [], answer = [], count = new Map();
  const top = [], rest = [];
  let sum = 0;
  const ctx = { lo: 0, hi: -1, op: '', enter: -1, leave: -1 };
  const cur = {};
  const clone = (a) => a.map((e) => ({ v: e.v, c: e.c }));

  function snap(note, tag, line, hl) {
    steps.push({ view: 'sorted', note, tag, line, hl: hl || {}, top: clone(top), rest: clone(rest), sum, keep: x,
      lo: ctx.lo, hi: ctx.hi, op: ctx.op, enter: ctx.enter, leave: ctx.leave, answer: answer.slice(),
      vars: { counts: Array.from(count, ([v, c]) => ({ v, c })), top: clone(top), rest: clone(rest), sum,
              value: cur.value, delta: cur.delta, count: cur.count, entry: cur.entry } });
  }

  function adjust(v, delta) {
    const c0 = count.get(v) || 0;
    Object.assign(cur, { value: v, delta, count: c0, entry: c0 > 0 ? { v, c: c0 } : null });
    if (c0 > 0) {
      const stale = { v, c: c0 };
      const inTop = remove(top, stale);
      if (inTop) sum -= v * c0; else remove(rest, stale);
      snap(say('swDetach', v, face(stale), inTop, v * c0), t('detach', 'detach'), 'detach', { ghost: stale, fromTop: inTop });
    }
    const c1 = c0 + delta;
    cur.count = c1;
    if (c1 === 0) {
      count.delete(v);
      snap(say('swGone', v), t('tally', 'tally'), 'insert', {});
    } else {
      count.set(v, c1);
      insert(rest, { v, c: c1 });
      snap(say('swInsert', v, c1), t('tally', 'tally'), 'insert', { fresh: { v, c: c1 } });
    }
    while (top.length < x && rest.length) {
      const e = rest.pop(); insert(top, e); sum += e.v * e.c;
      snap(say('swFill', top.length, x, face(e), e.v * e.c, sum), t('promote', 'promote'), 'fill', { up: e });
    }
    while (rest.length && top.length && cmp(rest[rest.length - 1], top[0]) > 0) {
      const up = rest[rest.length - 1], down = top[0];
      snap(say('swViolation', face(up), face(down), up.c, up.v, down.c, down.v), t('swap', 'swap'), 'violation', { cmpUp: up, cmpDown: down });
      const d = top.shift(); insert(rest, d); sum -= d.v * d.c;
      snap(say('swDemote', face(d), d.v * d.c, sum), t('demote', 'demote'), 'demote', { down: d });
      const u = rest.pop(); insert(top, u); sum += u.v * u.c;
      snap(say('swPromote', face(u), u.v * u.c, sum), t('promote', 'promote'), 'promote', { up: u });
    }
  }

  nums.forEach((v, i) => {
    Object.assign(ctx, { hi: i, lo: i < k ? 0 : i - k, op: `add ${v}`, enter: i, leave: -1 });
    adjust(v, +1);
    if (i >= k) {
      Object.assign(ctx, { op: `del ${nums[i - k]}`, enter: -1, leave: i - k });
      adjust(nums[i - k], -1);
      ctx.leave = -1;
    }
    Object.assign(ctx, { lo: Math.max(0, i - k + 1), enter: -1, leave: -1 });
    if (i >= k - 1) {
      answer.push(sum);
      snap(say('swRecord', nums.slice(ctx.lo, i + 1).join(', '), sum), t('record', 'record'), 'record', { done: true });
    }
  });
  return steps;
}

/* ---------------- sliding window, lazy heaps ---------------- */

function buildHeap(input) {
  checkInput(input);
  const { nums, k, x } = input;
  const steps = [], answer = [];
  const count = new Map(), inTop = new Set();
  let topSize = 0, sum = 0;
  const top = [], rest = [];                         // binary heaps of {v, c}
  const ctx = { lo: 0, hi: -1, op: '', enter: -1, leave: -1 };
  const cur = {};
  const minAtRoot = (a, b) => cmp(a, b);             // TOP: weakest kept on top
  const maxAtRoot = (a, b) => cmp(b, a);             // REST: strongest dropped on top

  function push(h, e, order) {
    h.push(e);
    let i = h.length - 1;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (order(h[parent], h[i]) <= 0) break;
      [h[parent], h[i]] = [h[i], h[parent]]; i = parent;
    }
  }
  function pop(h, order) {
    const root = h[0], last = h.pop();
    if (h.length) {
      h[0] = last;
      let i = 0;
      const n = h.length;
      for (;;) {
        let child = 2 * i + 1;
        if (child >= n) break;
        if (child + 1 < n && order(h[child + 1], h[child]) < 0) child++;
        if (order(h[child], h[i]) >= 0) break;
        [h[child], h[i]] = [h[i], h[child]]; i = child;
      }
    }
    return root;
  }
  const liveTop = (e) => inTop.has(e.v) && count.get(e.v) === e.c;
  const liveRest = (e) => !inTop.has(e.v) && count.get(e.v) === e.c;

  function snap(note, tag, line, hl) {
    steps.push({ view: 'heap', note, tag, line, hl: hl || {},
      vars: { counts: Array.from(count, ([v, c]) => ({ v, c })), top: top.map((e) => ({ v: e.v, c: e.c })),
              rest: rest.map((e) => ({ v: e.v, c: e.c })), sum, inTop: Array.from(inTop), topSize,
              value: cur.value, delta: cur.delta, count: cur.count, entry: cur.entry,
              best: hl?.cmpUp, weakest: hl?.cmpDown },
      top: top.map((e) => ({ v: e.v, c: e.c, live: liveTop(e), now: count.get(e.v) || 0 })),
      rest: rest.map((e) => ({ v: e.v, c: e.c, live: liveRest(e), now: count.get(e.v) || 0 })),
      sum, topSize, keep: x, lo: ctx.lo, hi: ctx.hi, op: ctx.op, enter: ctx.enter, leave: ctx.leave, answer: answer.slice() });
  }

  function restPeek() {
    while (rest.length) {
      const e = rest[0];
      if (liveRest(e)) return e;
      snap(say('hpDiscardRest', face(e), e.v, count.get(e.v) || 0), t('discard', 'discard'), 'discard', { discarded: { v: e.v, c: e.c } });
      pop(rest, maxAtRoot);
    }
    return null;
  }
  function topPeek() {
    while (top.length) {
      const e = top[0];
      if (liveTop(e)) return e;
      snap(say('hpDiscardTop', face(e)), t('discard', 'discard'), 'discard', { discarded: { v: e.v, c: e.c } });
      pop(top, minAtRoot);
    }
    return null;
  }
  function promote(e, filling) {
    inTop.add(e.v); topSize++; sum += e.v * e.c; push(top, e, minAtRoot);
    snap(filling ? say('hpFill', topSize, x, face(e), e.v * e.c, sum) : say('hpPromote', face(e), e.v * e.c, sum),
      t('promote', 'promote'), filling ? 'fill' : 'promote', { up: e });
  }
  function demote(e) {
    inTop.delete(e.v); topSize--; sum -= e.v * e.c; push(rest, e, maxAtRoot);
    snap(say('hpDemote', face(e), e.v * e.c, sum), t('demote', 'demote'), 'demote', { down: e });
  }

  function adjust(v, delta) {
    const c0 = count.get(v) || 0;
    Object.assign(cur, { value: v, delta, count: c0, entry: c0 > 0 ? { v, c: c0 } : null });
    if (c0 > 0 && inTop.has(v)) {
      sum -= c0 * v; inTop.delete(v); topSize--;
      snap(say('hpDetachTop', v, c0 * v, face({ v, c: c0 })), t('detach', 'detach'), 'detach', { stale: { v, c: c0 } });
    } else if (c0 > 0) {
      snap(say('hpDetachRest', v, face({ v, c: c0 })), t('detach', 'detach'), 'detach', { stale: { v, c: c0 } });
    }
    const c1 = c0 + delta;
    cur.count = c1;
    if (c1 === 0) {
      count.delete(v);
      snap(say('hpGone', v), t('tally', 'tally'), 'insert', {});
    } else {
      count.set(v, c1);
      push(rest, { v, c: c1 }, maxAtRoot);
      snap(say('hpPush', v, c1, face({ v, c: c1 })), t('tally', 'tally'), 'insert', { fresh: { v, c: c1 } });
    }
    while (topSize < x) {
      if (!restPeek()) break;
      promote(pop(rest, maxAtRoot), true);
    }
    for (;;) {
      const best = restPeek();
      if (!best) break;
      const weakest = topPeek();
      if (!weakest) break;
      if (cmp(best, weakest) <= 0) break;
      snap(say('hpViolation', face(best), face(weakest)), t('swap', 'swap'), 'violation', { cmpUp: best, cmpDown: weakest });
      demote(pop(top, minAtRoot));
      promote(pop(rest, maxAtRoot), false);
    }
  }

  nums.forEach((v, i) => {
    Object.assign(ctx, { hi: i, lo: i < k ? 0 : i - k, op: `add ${v}`, enter: i, leave: -1 });
    adjust(v, +1);
    if (i >= k) {
      Object.assign(ctx, { op: `del ${nums[i - k]}`, enter: -1, leave: i - k });
      adjust(nums[i - k], -1);
      ctx.leave = -1;
    }
    Object.assign(ctx, { lo: Math.max(0, i - k + 1), enter: -1, leave: -1 });
    if (i >= k - 1) {
      answer.push(sum);
      snap(say('hpRecord', nums.slice(ctx.lo, i + 1).join(', '), sum), t('record', 'record'), 'record', { done: true });
    }
  });
  return steps;
}

/* ---------------- drawing ----------------
 *
 * The strip is the array with the window banded; the element entering is
 * green, the one leaving red. The stage draws what each approach carries:
 * the brute force's tally → rank → sum for one window; the two shelves, with
 * the barrier between them and the running sum under them; or the two heaps
 * laid out by level, stale entries greyed and tagged with what made them stale.
 */

const cardHTML = (e, cls) =>
  `<div class="kard ${cls || ''}"><span class="face">${e.v}<span class="x">×</span>${e.c}</span><span class="key">[${e.c}, ${e.v}]</span></div>`;

function strip(s, { nums }) {
  const tone = {};
  nums.forEach((_, i) => {
    if (i >= s.lo && i <= s.hi) tone[i] = 'inwin';
    if (s.enter === i) tone[i] = 'entering';
    if (s.leave === i) tone[i] = 'leaving';
  });
  return cells(nums, { tone });
}

function drawShelves(s) {
  const top = s.top.slice().reverse(), rest = s.rest.slice().reverse();   // strongest first
  const hl = s.hl || {};
  const mark = (e) => (same(hl.up, e) ? 'hl-up' : same(hl.down, e) ? 'hl-down' : same(hl.fresh, e) ? 'hl-new'
    : (same(hl.cmpUp, e) || same(hl.cmpDown, e)) ? 'hl-cmp' : '');
  const cards = (list) => (list.length ? list.map((e) => cardHTML(e, mark(e))).join('') : `<span class="empty">${pick(L.empty)}</span>`);
  const broken = !!hl.cmpUp;
  const expr = s.top.length ? s.top.slice().reverse().map((e) => `${e.v}×${e.c}`).join('  +  ') : pick(L.nothingKept);
  return `<div class="panel-head"><h2>${pick(L.shelves)}</h2><span class="note">${pick(L.rankedBy)}</span></div>`
    + `<div class="shelf shelf-top"><div class="shelf-head"><span class="shelf-name">TOP</span>`
    + `<span class="shelf-note">${pick(L.topNote(s.keep, s.top.length))}</span></div><div class="cards">${cards(top)}</div></div>`
    + `<div class="barrier${broken ? ' broken' : ''}">${pick(broken ? L.barrierBroken : L.barrier)}</div>`
    + `<div class="shelf shelf-rest"><div class="shelf-head"><span class="shelf-name">REST</span>`
    + `<span class="shelf-note">${pick(L.restNote)}</span></div><div class="cards">${cards(rest)}</div></div>`
    + `<div class="ledger"><span class="expr">@sum &nbsp;=&nbsp; ${expr}</span><span class="total">${s.sum}<small>X-SUM</small></span></div>`;
}

function drawBrute(s, { k }) {
  const max = s.ranked.length ? s.ranked[0].c : 1;
  // bar widths in tenths, as classes — no inline styles
  const bars = s.ranked.slice().sort((a, b) => a.v - b.v).map((e) =>
    `<div class="bar-row"><span>${e.v}</span><span class="bar-track"><span class="bar-fill w${Math.round((e.c / max) * 10)}"></span></span><span>${e.c}</span></div>`).join('');
  const rankHTML = s.ranked.map((e, i) =>
    (i === s.keep && i > 0 ? `<span class="cutline">${pick(L.cutKeep(s.keep))}</span>` : '') + cardHTML(e, i < s.keep ? '' : 'dropped')).join('');
  const kept = s.ranked.slice(0, s.keep);
  const cls = (n) => (s.stage === n ? 'active' : s.stage < n ? 'pending' : '');
  return `<div class="panel-head"><h2>${pick(L.windowFromScratch(s.lo))}</h2><span class="note">[${s.win.join(', ')}]</span></div>`
    + '<div class="bf-steps">'
    + `<div class="bf-step ${cls(1)}"><h3><span class="n">1</span>${pick(L.tallyHead(k))}</h3>`
    + `<div class="bars">${s.stage >= 1 ? bars : `<span class="empty">${pick(L.notCounted)}</span>`}</div></div>`
    + `<div class="bf-step ${cls(2)}"><h3><span class="n">2</span>${pick(L.rankHead(s.keep))}</h3>`
    + `<div class="rank">${s.stage >= 2 ? rankHTML : `<span class="empty">${pick(L.notRanked)}</span>`}</div></div>`
    + `<div class="bf-step ${cls(3)}"><h3><span class="n">3</span>${pick(L.sumHead)}</h3>`
    + `<div class="ledger bare"><span class="expr">${s.stage >= 3 ? kept.map((e) => `${e.v}×${e.c}`).join('  +  ') : '—'}</span>`
    + `<span class="total">${s.stage >= 3 ? s.sum : '·'}<small>X-SUM</small></span></div></div>`
    + '</div>';
}

function drawHeaps(s) {
  const hl = s.hl || {};
  const mark = (e) => (same(hl.discarded, e) ? ' is-going' : same(hl.up, e) ? ' hl-up' : same(hl.down, e) ? ' hl-down'
    : same(hl.fresh, e) ? ' hl-new' : (same(hl.stale, e) || same(hl.cmpUp, e) || same(hl.cmpDown, e)) ? ' hl-cmp' : '');
  const card = (e, index) => `<div class="hcard${e.live ? '' : ' is-stale'}${index === 0 ? ' is-root' : ''}${mark(e)}">`
    + `<span class="face">${e.v}<span class="x">×</span>${e.c}</span><span class="key">[${e.c}, ${e.v}]</span>`
    + (e.live ? '' : `<span class="tag">${pick(L.stale(e.now))}</span>`) + '</div>';
  const levels = (list) => {
    let rows = '', i = 0, width = 1;
    while (i < list.length) {
      rows += `<div class="heap-row">${list.slice(i, i + width).map((e, j) => card(e, i + j)).join('')}</div>`;
      i += width; width *= 2;
    }
    return rows || `<span class="empty">${pick(L.empty)}</span>`;
  };
  const live = (list) => list.filter((e) => e.live).length;
  return `<div class="panel-head"><h2>${pick(L.heaps)}</h2><span class="note">${pick(L.rootsOnly)}</span></div>`
    + `<div class="heap-block is-top"><div class="shelf-head"><span class="shelf-name">TOP heap</span>`
    + `<span class="shelf-note">${pick(L.topHeapNote(s.topSize, s.top.length, s.topSize, s.keep))}</span></div>`
    + `<div class="heap-rows">${levels(s.top)}</div></div>`
    + `<div class="heap-block is-rest"><div class="shelf-head"><span class="shelf-name">REST heap</span>`
    + `<span class="shelf-note">${pick(L.restHeapNote(live(s.rest), s.rest.length))}</span></div>`
    + `<div class="heap-rows">${levels(s.rest)}</div></div>`
    + `<div class="ledger"><span class="expr">${pick(L.heapLedger)}</span><span class="total">${s.sum}<small>X-SUM</small></span></div>`;
}

function draw(s, input) {
  if (s.view === 'brute') return drawBrute(s, input);
  if (s.view === 'sorted') return drawShelves(s);
  return drawHeaps(s);
}

function answer(s, { nums, k }) {
  const total = Math.max(0, nums.length - k + 1);
  return {
    html: slots(s.answer, { total, just: s.line === 'record' || s.line === 'sum' ? s.answer.length - 1 : -1 }),
    note: t(`${s.answer.length} of ${total} windows`, `window ${total} ခုအနက် ${s.answer.length} ခု`),
  };
}

/* Hover values, named after the concept; hover aliases below map each
 * language's spelling (@sum, self.total, this.sum, w.sum) onto them. */
const pairs = (list) => `[${(list || []).map((e) => `[${e.c}, ${e.v}]`).join(', ')}]`;
function vars(s, { nums, k, x }) {
  const v = s.vars || {};
  const out = [['nums', `[${nums.join(', ')}]`], ['k', k], ['x', x], ['answer', `[${s.answer.join(', ')}]`], ['sum', v.sum ?? '—']];
  if (s.view === 'brute') {
    return [...out, ['i', v.i], ['window', `[${v.window.join(', ')}]`],
      ['counts', `{${v.counts.map((e) => `${e.v}: ${e.c}`).join(', ')}}`], ['ranked', pairs(v.ranked)], ['kept', pairs(v.kept)]];
  }
  const known = (a) => (a === undefined || a === null ? '—' : a);
  out.push(['counts', `{${v.counts.map((e) => `${e.v}: ${e.c}`).join(', ')}}`], ['top', pairs(v.top)], ['rest', pairs(v.rest)],
    ['value', known(v.value)], ['delta', v.delta === undefined ? '—' : (v.delta > 0 ? '+' : '') + v.delta],
    ['count', known(v.count)], ['entry', v.entry ? `[${v.entry.c}, ${v.entry.v}]` : '—']);
  if (s.view === 'heap') {
    out.push(['topSize', v.topSize], ['inTop', `{${v.inTop.join(', ')}}`],
      ['best', v.best ? `[${v.best.c}, ${v.best.v}]` : '—'], ['weakest', v.weakest ? `[${v.weakest.c}, ${v.weakest.v}]` : '—']);
  }
  return out;
}

const HOVER = {
  ruby: { '@count': 'counts', '@top': 'top', '@rest': 'rest', '@sum': 'sum', '@x': 'x', '@top_size': 'topSize', '@in_top': 'inTop' },
  python: { 'self.count': 'counts', 'self.top': 'top', 'self.rest': 'rest', 'self.total': 'sum', 'self.x': 'x',
            'self.top_size': 'topSize', 'self.in_top': 'inTop', 'window.total': 'sum' },
  javascript: { 'this.count': 'counts', 'this.top': 'top', 'this.rest': 'rest', 'this.sum': 'sum', 'this.x': 'x',
                'this.topSize': 'topSize', 'this.inTop': 'inTop', 'window.sum': 'sum' },
  go: { 'w.count': 'counts', 'w.top': 'top', 'w.rest': 'rest', 'w.sum': 'sum', 'w.x': 'x', 'w.topSize': 'topSize',
        'w.inTop': 'inTop', 'window.sum': 'sum' },
  rust: { 'self.count': 'counts', 'self.top': 'top', 'self.rest': 'rest', 'self.sum': 'sum', 'self.x': 'x',
          'self.top_size': 'topSize', 'self.in_top': 'inTop', 'window.sum': 'sum' },
};

/* ---------------- the code, one key per line ----------------
 *
 * Generated from the verified solution files, so the listing a reader copies
 * is byte-identical to the one that ran. */

const CODE = {
  brute: {
    ruby: [
      [null, `${c('# @param {Integer[]} nums')}`],
      [null, `${c('# @param {Integer} k')}`],
      [null, `${c('# @param {Integer} x')}`],
      [null, `${c('# @return {Integer[]}')}`],
      [null, `${k('def')} find_x_sum(nums, k, x)`],
      ['window', `  nums.each_cons(k).map ${k('do')} |window|`],
      ['tally', `    window.tally`],
      ['rank', `          .max_by(x) { |val, count| [count, val] }`],
      ['sum', `          .sum { |val, count| val * count }`],
      [null, `  ${k('end')}`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('from')} collections ${k('import')} Counter`],
      [null, `${k('from')} typing ${k('import')} List`],
      [null, ``],
      [null, ``],
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} findXSum(self, nums: List[int], k: int, x: int) -&gt; List[int]:`],
      [null, `        answer = []`],
      ['window', `        ${k('for')} i ${k('in')} range(len(nums) - k + 1):`],
      ['tally', `            counts = Counter(nums[i:i + k])`],
      [null, `            ${c('# (count, value) descending: more occurrences wins, bigger value breaks ties')}`],
      ['rank', `            kept = sorted(counts.items(), key=lambda p: (p[1], p[0]), reverse=True)[:x]`],
      ['sum', `            answer.append(sum(value * count ${k('for')} value, count ${k('in')} kept))`],
      [null, `        ${k('return')} answer`],
    ],
    javascript: [
      [null, `/**`],
      [null, ` * @param {number[]} nums`],
      [null, ` * @param {number} k`],
      [null, ` * @param {number} x`],
      [null, ` * @${k('return')} {number[]}`],
      [null, ` */`],
      [null, `${k('var')} findXSum = ${k('function')} (nums, k, x) {`],
      [null, `  ${k('const')} answer = [];`],
      ['window', `  ${k('for')} (${k('let')} i = 0; i + k &lt;= nums.length; i++) {`],
      ['tally', `    ${k('const')} counts = ${k('new')} Map();`],
      ['tally', `    ${k('for')} (${k('let')} j = i; j &lt; i + k; j++) counts.set(nums[j], (counts.get(nums[j]) || 0) + 1);`],
      [null, `    ${c('// (count, value) descending: more occurrences wins, bigger value breaks ties')}`],
      ['rank', `    ${k('const')} ranked = [...counts].sort((a, b) =&gt; b[1] - a[1] || b[0] - a[0]);`],
      ['sum', `    ${k('let')} sum = 0;`],
      ['sum', `    ${k('for')} (${k('let')} r = 0; r &lt; Math.min(x, ranked.length); r++) sum += ranked[r][0] * ranked[r][1];`],
      ['sum', `    answer.push(sum);`],
      [null, `  }`],
      [null, `  ${k('return')} answer;`],
      [null, `};`],
    ],
    go: [
      [null, `import "sort"`],
      [null, ``],
      [null, `${c('// 3318 returns []int. (3321\'s signature returns []int64 — see the heap version.)')}`],
      [null, `${k('func')} findXSum(nums []int, k int, x int) []int {`],
      [null, `	answer := make([]int, 0, len(nums)-k+1)`],
      [null, `	type entry struct{ value, count int }`],
      [null, ``],
      ['window', `	${k('for')} i := 0; i+k &lt;= len(nums); i++ {`],
      ['tally', `		counts := make(map[int]int)`],
      ['tally', `		${k('for')} _, v := ${k('range')} nums[i : i+k] {`],
      ['tally', `			counts[v]++`],
      [null, `		}`],
      [null, ``],
      [null, `		ranked := make([]entry, 0, len(counts))`],
      [null, `		${k('for')} value, count := ${k('range')} counts {`],
      [null, `			ranked = append(ranked, entry{value, count})`],
      [null, `		}`],
      [null, `		${c('// (count, value) descending: more occurrences wins, bigger value breaks ties')}`],
      ['rank', `		sort.Slice(ranked, ${k('func')}(a, b int) bool {`],
      [null, `			${k('if')} ranked[a].count != ranked[b].count {`],
      [null, `				${k('return')} ranked[a].count &gt; ranked[b].count`],
      [null, `			}`],
      [null, `			${k('return')} ranked[a].value &gt; ranked[b].value`],
      [null, `		})`],
      [null, ``],
      ['sum', `		sum := 0`],
      [null, `		${k('for')} r := 0; r &lt; x &amp;&amp; r &lt; len(ranked); r++ {`],
      ['sum', `			sum += ranked[r].value * ranked[r].count`],
      [null, `		}`],
      ['sum', `		answer = append(answer, sum)`],
      [null, `	}`],
      [null, `	${k('return')} answer`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('use')} std::collections::HashMap;`],
      [null, ``],
      [null, `${k('impl')} Solution {`],
      [null, `    ${c('// 3318 returns Vec&lt;i32&gt;, which is safe here: values and k are both &lt;= 50, so the')}`],
      [null, `    ${c('// biggest x-sum is 2500. For 3321-sized values, count * value overflows i32 —')}`],
      [null, `    ${c('// that problem\'s signature returns Vec&lt;i64&gt;. See the heap version.')}`],
      [null, `    ${k('pub')} ${k('fn')} find_x_sum(nums: Vec&lt;i32&gt;, k: i32, x: i32) -&gt; Vec&lt;i32&gt; {`],
      [null, `        ${k('let')} (k, x) = (k as usize, x as usize);`],
      ['window', `        nums.windows(k)`],
      ['window', `            .map(|window| {`],
      ['tally', `                ${k('let')} ${k('mut')} counts: HashMap&lt;i32, i32&gt; = HashMap::new();`],
      ['tally', `                ${k('for')} &amp;value ${k('in')} window {`],
      ['tally', `                    *counts.entry(value).or_insert(0) += 1;`],
      [null, `                }`],
      [null, `                ${c('// (count, value) descending — tuple Ord is the ranking rule itself')}`],
      ['rank', `                ${k('let')} ${k('mut')} ranked: Vec&lt;(i32, i32)&gt; =`],
      [null, `                    counts.into_iter().map(|(value, count)| (count, value)).collect();`],
      ['rank', `                ranked.sort_unstable_by(|a, b| b.cmp(a));`],
      ['sum', `                ranked.iter().take(x).map(|&amp;(count, value)| count * value).sum()`],
      [null, `            })`],
      [null, `            .collect()`],
      [null, `    }`],
      [null, `}`],
    ],
  },
  sorted: {
    ruby: [
      [null, `${c('# LeetCode 3318 - the version the stepper above animates.')}`],
      [null, `${c('#')}`],
      [null, `${c('# Right shape for 3321 too, but the sorted arrays memmove up to k pointers on')}`],
      [null, `${c('# every update, which TLEs on the judge - use the heap version for that.')}`],
      [null, `${c('# Sliding-window x-sum with an incrementally maintained top-x partition.')}`],
      [null, `${c('#')}`],
      [null, `${c('# Invariants after every mutation:')}`],
      [null, `${c('#   * @top holds the x strongest keys (fewer only if fewer distinct exist)')}`],
      [null, `${c('#   * every entry in @top outranks every entry in @rest')}`],
      [null, `${c('#   * @sum is the x-sum of the current window')}`],
      [null, `${c('#')}`],
      [null, `${c('# Entries are [count, value] pairs, so Array#&lt;=&gt; *is* the problem\'s ranking:')}`],
      [null, `${c('# more occurrences wins, bigger value breaks ties.')}`],
      [null, `class XSumWindow`],
      [null, `  attr_reader :sum`],
      [null, ``],
      [null, `  ${k('def')} initialize(x)`],
      [null, `    @x     = x`],
      [null, `    @count = Hash.new(0)`],
      [null, `    @top   = []   ${c('# ascending; @top.first is the weakest kept entry')}`],
      [null, `    @rest  = []   ${c('# ascending; @rest.last is the strongest dropped entry')}`],
      [null, `    @sum   = 0`],
      [null, `  ${k('end')}`],
      [null, ``],
      [null, `  ${k('def')} add(value)`],
      [null, `    adjust(value, +1)`],
      [null, `  ${k('end')}`],
      [null, ``],
      [null, `  ${k('def')} del(value)`],
      [null, `    adjust(value, -1)`],
      [null, `  ${k('end')}`],
      [null, ``],
      [null, `  private`],
      [null, ``],
      [null, `  ${k('def')} adjust(value, delta)`],
      [null, `    count = @count[value]`],
      ['detach', `    detach([count, value]) ${k('if')} count &gt; 0        ${c('# its old key is now stale')}`],
      [null, ``],
      ['insert', `    count += delta`],
      [null, `    ${k('if')} count.zero?`],
      ['insert', `      @count.delete(value)`],
      [null, `    ${k('else')}`],
      ['insert', `      @count[value] = count`],
      ['insert', `      insert(@rest, [count, value])            ${c('# re-enter low, let rebalance lift it')}`],
      [null, `    ${k('end')}`],
      [null, ``],
      [null, `    rebalance`],
      [null, `  ${k('end')}`],
      [null, ``],
      [null, `  ${c('# Pull an entry out of whichever side holds it, keeping @sum honest.')}`],
      [null, `  ${k('def')} detach(entry)`],
      ['detach', `    ${k('if')} remove(@top, entry)`],
      ['detach', `      @sum -= entry[0] * entry[1]`],
      [null, `    ${k('else')}`],
      [null, `      remove(@rest, entry)`],
      [null, `    ${k('end')}`],
      [null, `  ${k('end')}`],
      [null, ``],
      [null, `  ${k('def')} rebalance`],
      ['fill', `    promote ${k('while')} @top.size &lt; @x &amp;&amp; !@rest.empty?`],
      ['violation', `    ${k('while')} !@rest.empty? &amp;&amp; !@top.empty? &amp;&amp; (@rest.last &lt;=&gt; @top.first) &gt; 0`],
      ['demote', `      demote`],
      ['promote', `      promote`],
      [null, `    ${k('end')}`],
      [null, `  ${k('end')}`],
      [null, ``],
      [null, `  ${k('def')} promote`],
      ['promote', `    entry = @rest.pop`],
      ['promote', `    insert(@top, entry)`],
      ['promote', `    @sum += entry[0] * entry[1]`],
      [null, `  ${k('end')}`],
      [null, ``],
      [null, `  ${k('def')} demote`],
      ['demote', `    entry = @top.shift`],
      ['demote', `    insert(@rest, entry)`],
      ['demote', `    @sum -= entry[0] * entry[1]`],
      [null, `  ${k('end')}`],
      [null, ``],
      [null, `  ${k('def')} insert(sorted, entry)`],
      [null, `    i = sorted.bsearch_index { |e| (e &lt;=&gt; entry) &gt;= 0 } || sorted.size`],
      [null, `    sorted.insert(i, entry)`],
      [null, `  ${k('end')}`],
      [null, ``],
      [null, `  ${k('def')} remove(sorted, entry)`],
      [null, `    i = sorted.bsearch_index { |e| (e &lt;=&gt; entry) &gt;= 0 }`],
      [null, `    ${k('return')} false ${k('unless')} i &amp;&amp; sorted[i] == entry`],
      [null, `    sorted.delete_at(i)`],
      [null, `    true`],
      [null, `  ${k('end')}`],
      [null, `${k('end')}`],
      [null, ``],
      [null, `${k('def')} find_x_sum(nums, k, x)`],
      [null, `  window = XSumWindow.new(x)`],
      [null, `  answer = []`],
      [null, `  nums.each_with_index ${k('do')} |value, i|`],
      [null, `    window.add(value)`],
      [null, `    window.del(nums[i - k]) ${k('if')} i &gt;= k`],
      ['record', `    answer &lt;&lt; window.sum ${k('if')} i &gt;= k - 1`],
      [null, `  ${k('end')}`],
      [null, `  answer`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('from')} bisect ${k('import')} bisect_left, insort`],
      [null, `${k('from')} typing ${k('import')} List, Tuple`],
      [null, ``],
      [null, ``],
      [null, `${k('class')} XSumWindow:`],
      [null, `    """Two sorted lists. TOP holds the x strongest keys, REST holds everything`],
      [null, `    ${k('else')}, and every TOP entry outranks every REST entry.`],
      [null, ``],
      [null, `    Entries are (count, value) tuples, so tuple order ${k('is')} the ranking rule itself.`],
      [null, `    Clear, and fine ${k('for')} 3318 — but every update shifts up to k entries, which ${k('is')}`],
      [null, `    why 3321 needs the heap version.`],
      [null, `    """`],
      [null, ``],
      [null, `    __slots__ = ("x", "count", "top", "rest", "total")`],
      [null, ``],
      [null, `    ${k('def')} __init__(self, x: int) -&gt; ${k('None')}:`],
      [null, `        self.x = x`],
      [null, `        self.count = {}`],
      [null, `        self.top = []   ${c('# ascending; top[0] is the weakest kept entry')}`],
      [null, `        self.rest = []  ${c('# ascending; rest[-1] is the strongest dropped entry')}`],
      [null, `        self.total = 0`],
      [null, ``],
      [null, `    ${k('def')} add(self, value: int) -&gt; ${k('None')}:`],
      [null, `        self._adjust(value, 1)`],
      [null, ``],
      [null, `    ${k('def')} remove(self, value: int) -&gt; ${k('None')}:`],
      [null, `        self._adjust(value, -1)`],
      [null, ``],
      [null, `    ${k('def')} _adjust(self, value: int, delta: int) -&gt; ${k('None')}:`],
      [null, `        count = self.count.get(value, 0)`],
      [null, `        ${k('if')} count:`],
      ['detach', `            self._detach((count, value))        ${c('# its old key is now stale')}`],
      [null, ``],
      ['insert', `        count += delta`],
      [null, `        ${k('if')} count == 0:`],
      ['insert', `            self.count.pop(value, ${k('None')})`],
      [null, `        ${k('else')}:`],
      ['insert', `            self.count[value] = count`],
      ['insert', `            insort(self.rest, (count, value))   ${c('# re-enter low, let rebalance lift it')}`],
      [null, ``],
      [null, `        self._rebalance()`],
      [null, ``],
      [null, `    ${k('def')} _detach(self, entry: Tuple[int, int]) -&gt; ${k('None')}:`],
      [null, `        i = bisect_left(self.top, entry)`],
      ['detach', `        ${k('if')} i &lt; len(self.top) and self.top[i] == entry:`],
      ['detach', `            self.top.pop(i)`],
      ['detach', `            self.total -= entry[0] * entry[1]`],
      [null, `            ${k('return')}`],
      [null, `        j = bisect_left(self.rest, entry)`],
      [null, `        ${k('if')} j &lt; len(self.rest) and self.rest[j] == entry:`],
      [null, `            self.rest.pop(j)`],
      [null, ``],
      [null, `    ${k('def')} _rebalance(self) -&gt; ${k('None')}:`],
      ['fill', `        ${k('while')} len(self.top) &lt; self.x and self.rest:`],
      ['fill', `            self._promote()`],
      ['violation', `        ${k('while')} self.rest and self.top and self.rest[-1] &gt; self.top[0]:`],
      ['demote', `            self._demote()`],
      ['promote', `            self._promote()`],
      [null, ``],
      [null, `    ${k('def')} _promote(self) -&gt; ${k('None')}:`],
      ['promote', `        entry = self.rest.pop()`],
      ['promote', `        insort(self.top, entry)`],
      ['promote', `        self.total += entry[0] * entry[1]`],
      [null, ``],
      [null, `    ${k('def')} _demote(self) -&gt; ${k('None')}:`],
      ['demote', `        entry = self.top.pop(0)`],
      ['demote', `        insort(self.rest, entry)`],
      ['demote', `        self.total -= entry[0] * entry[1]`],
      [null, ``],
      [null, ``],
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} findXSum(self, nums: List[int], k: int, x: int) -&gt; List[int]:`],
      [null, `        window = XSumWindow(x)`],
      [null, `        answer = []`],
      [null, `        ${k('for')} i, value ${k('in')} enumerate(nums):`],
      [null, `            window.add(value)`],
      [null, `            ${k('if')} i &gt;= k:`],
      [null, `                window.remove(nums[i - k])`],
      ['record', `            ${k('if')} i &gt;= k - 1:`],
      ['record', `                answer.append(window.total)`],
      [null, `        ${k('return')} answer`],
    ],
    javascript: [
      [null, `${c('// Two sorted arrays. TOP holds the x strongest keys, REST holds everything else,')}`],
      [null, `${c('// and every TOP entry outranks every REST entry. Entries are [count, value], so')}`],
      [null, `${c('// comparison is lexicographic — the ranking rule itself.')}`],
      [null, `${c('//')}`],
      [null, `${c('// Clear, and fine for 3318. Every update splices up to k entries, which is why')}`],
      [null, `${c('// 3321 needs the heap version.')}`],
      [null, `${k('const')} rank = (a, b) =&gt; a[0] - b[0] || a[1] - b[1];`],
      [null, ``],
      [null, `class XSumWindow {`],
      [null, `  constructor(x) {`],
      [null, `    this.x = x;`],
      [null, `    this.count = ${k('new')} Map();`],
      [null, `    this.top = [];   ${c('// ascending; top[0] is the weakest kept entry')}`],
      [null, `    this.rest = [];  ${c('// ascending; rest[rest.length-1] is the strongest dropped')}`],
      [null, `    this.sum = 0;`],
      [null, `  }`],
      [null, ``],
      [null, `  add(value) {`],
      [null, `    this.adjust(value, 1);`],
      [null, `  }`],
      [null, ``],
      [null, `  remove(value) {`],
      [null, `    this.adjust(value, -1);`],
      [null, `  }`],
      [null, ``],
      [null, `  adjust(value, delta) {`],
      [null, `    ${k('let')} count = this.count.get(value) || 0;`],
      ['detach', `    ${k('if')} (count &gt; 0) this.detach([count, value]);   ${c('// its old key is now stale')}`],
      [null, ``],
      ['insert', `    count += delta;`],
      ['insert', `    ${k('if')} (count === 0) this.count.delete(value);`],
      [null, `    ${k('else')} {`],
      ['insert', `      this.count.set(value, count);`],
      ['insert', `      insert(this.rest, [count, value]);          ${c('// re-enter low; rebalance decides')}`],
      [null, `    }`],
      [null, ``],
      [null, `    this.rebalance();`],
      [null, `  }`],
      [null, ``],
      [null, `  detach(entry) {`],
      ['detach', `    ${k('if')} (remove(this.top, entry)) this.sum -= entry[0] * entry[1];`],
      [null, `    ${k('else')} remove(this.rest, entry);`],
      [null, `  }`],
      [null, ``],
      [null, `  rebalance() {`],
      ['fill', `    ${k('while')} (this.top.length &lt; this.x &amp;&amp; this.rest.length) this.promote();`],
      ['violation', `    ${k('while')} (this.rest.length &amp;&amp; this.top.length &amp;&amp;`],
      ['violation', `           rank(this.rest[this.rest.length - 1], this.top[0]) &gt; 0) {`],
      ['demote', `      this.demote();`],
      ['promote', `      this.promote();`],
      [null, `    }`],
      [null, `  }`],
      [null, ``],
      [null, `  promote() {`],
      ['promote', `    ${k('const')} entry = this.rest.pop();`],
      ['promote', `    insert(this.top, entry);`],
      ['promote', `    this.sum += entry[0] * entry[1];`],
      [null, `  }`],
      [null, ``],
      [null, `  demote() {`],
      ['demote', `    ${k('const')} entry = this.top.shift();`],
      ['demote', `    insert(this.rest, entry);`],
      ['demote', `    this.sum -= entry[0] * entry[1];`],
      [null, `  }`],
      [null, `}`],
      [null, ``],
      [null, `${k('function')} lowerBound(sorted, entry) {`],
      [null, `  ${k('let')} lo = 0, hi = sorted.length;`],
      [null, `  ${k('while')} (lo &lt; hi) {`],
      [null, `    ${k('const')} mid = (lo + hi) &gt;&gt; 1;`],
      [null, `    ${k('if')} (rank(sorted[mid], entry) &lt; 0) lo = mid + 1;`],
      [null, `    ${k('else')} hi = mid;`],
      [null, `  }`],
      [null, `  ${k('return')} lo;`],
      [null, `}`],
      [null, ``],
      [null, `${k('function')} insert(sorted, entry) {`],
      [null, `  sorted.splice(lowerBound(sorted, entry), 0, entry);`],
      [null, `}`],
      [null, ``],
      [null, `${k('function')} remove(sorted, entry) {`],
      [null, `  ${k('const')} i = lowerBound(sorted, entry);`],
      [null, `  ${k('if')} (i &lt; sorted.length &amp;&amp; sorted[i][0] === entry[0] &amp;&amp; sorted[i][1] === entry[1]) {`],
      [null, `    sorted.splice(i, 1);`],
      [null, `    ${k('return')} true;`],
      [null, `  }`],
      [null, `  ${k('return')} false;`],
      [null, `}`],
      [null, ``],
      [null, `/**`],
      [null, ` * @param {number[]} nums`],
      [null, ` * @param {number} k`],
      [null, ` * @param {number} x`],
      [null, ` * @${k('return')} {number[]}`],
      [null, ` */`],
      [null, `${k('var')} findXSum = ${k('function')} (nums, k, x) {`],
      [null, `  ${k('const')} window = ${k('new')} XSumWindow(x);`],
      [null, `  ${k('const')} answer = [];`],
      [null, `  ${k('for')} (${k('let')} i = 0; i &lt; nums.length; i++) {`],
      [null, `    window.add(nums[i]);`],
      [null, `    ${k('if')} (i &gt;= k) window.remove(nums[i - k]);`],
      ['record', `    ${k('if')} (i &gt;= k - 1) answer.push(window.sum);`],
      [null, `  }`],
      [null, `  ${k('return')} answer;`],
      [null, `};`],
    ],
    go: [
      [null, `import "sort"`],
      [null, ``],
      [null, `${c('// Two sorted slices. TOP holds the x strongest keys, REST holds everything else,')}`],
      [null, `${c('// and every TOP entry outranks every REST entry.')}`],
      [null, `${c('//')}`],
      [null, `${c('// Clear, and fine for 3318. Every update shifts up to k entries, which is why')}`],
      [null, `${c('// 3321 needs the heap version.')}`],
      [null, ``],
      [null, `type entry struct{ count, value int }`],
      [null, ``],
      [null, `${k('func')} less(a, b entry) bool {`],
      [null, `	${k('if')} a.count != b.count {`],
      [null, `		${k('return')} a.count &lt; b.count`],
      [null, `	}`],
      [null, `	${k('return')} a.value &lt; b.value`],
      [null, `}`],
      [null, ``],
      [null, `type xSumWindow struct {`],
      [null, `	x     int`],
      [null, `	count map[int]int`],
      [null, `	top   []entry ${c('// ascending; top[0] is the weakest kept entry')}`],
      [null, `	rest  []entry ${c('// ascending; last is the strongest dropped entry')}`],
      [null, `	sum   int`],
      [null, `}`],
      [null, ``],
      [null, `${k('func')} newXSumWindow(x int) *xSumWindow {`],
      [null, `	${k('return')} &amp;xSumWindow{x: x, count: make(map[int]int)}`],
      [null, `}`],
      [null, ``],
      [null, `${k('func')} (w *xSumWindow) add(value int)    { w.adjust(value, 1) }`],
      [null, `${k('func')} (w *xSumWindow) remove(value int) { w.adjust(value, -1) }`],
      [null, ``],
      [null, `${k('func')} (w *xSumWindow) adjust(value, delta int) {`],
      [null, `	count := w.count[value]`],
      ['detach', `	${k('if')} count &gt; 0 {`],
      ['detach', `		w.detach(entry{count, value}) ${c('// its old key is now stale')}`],
      [null, `	}`],
      [null, ``],
      ['insert', `	count += delta`],
      [null, `	${k('if')} count == 0 {`],
      ['insert', `		delete(w.count, value)`],
      [null, `	} ${k('else')} {`],
      ['insert', `		w.count[value] = count`],
      ['insert', `		w.rest = insert(w.rest, entry{count, value}) ${c('// re-enter low')}`],
      [null, `	}`],
      [null, ``],
      [null, `	w.rebalance()`],
      [null, `}`],
      [null, ``],
      [null, `${k('func')} (w *xSumWindow) detach(e entry) {`],
      [null, `	${k('var')} ok bool`],
      ['detach', `	${k('if')} w.top, ok = remove(w.top, e); ok {`],
      ['detach', `		w.sum -= e.count * e.value`],
      [null, `		${k('return')}`],
      [null, `	}`],
      [null, `	w.rest, _ = remove(w.rest, e)`],
      [null, `}`],
      [null, ``],
      [null, `${k('func')} (w *xSumWindow) rebalance() {`],
      ['fill', `	${k('for')} len(w.top) &lt; w.x &amp;&amp; len(w.rest) &gt; 0 {`],
      ['fill', `		w.promote()`],
      [null, `	}`],
      ['violation', `	${k('for')} len(w.rest) &gt; 0 &amp;&amp; len(w.top) &gt; 0 &amp;&amp; less(w.top[0], w.rest[len(w.rest)-1]) {`],
      ['demote', `		w.demote()`],
      ['promote', `		w.promote()`],
      [null, `	}`],
      [null, `}`],
      [null, ``],
      [null, `${k('func')} (w *xSumWindow) promote() {`],
      ['promote', `	e := w.rest[len(w.rest)-1]`],
      ['promote', `	w.rest = w.rest[:len(w.rest)-1]`],
      ['promote', `	w.top = insert(w.top, e)`],
      ['promote', `	w.sum += e.count * e.value`],
      [null, `}`],
      [null, ``],
      [null, `${k('func')} (w *xSumWindow) demote() {`],
      ['demote', `	e := w.top[0]`],
      ['demote', `	w.top = w.top[1:]`],
      ['demote', `	w.rest = insert(w.rest, e)`],
      ['demote', `	w.sum -= e.count * e.value`],
      [null, `}`],
      [null, ``],
      [null, `${k('func')} lowerBound(sorted []entry, e entry) int {`],
      [null, `	${k('return')} sort.Search(len(sorted), ${k('func')}(i int) bool { ${k('return')} !less(sorted[i], e) })`],
      [null, `}`],
      [null, ``],
      [null, `${k('func')} insert(sorted []entry, e entry) []entry {`],
      [null, `	i := lowerBound(sorted, e)`],
      [null, `	sorted = append(sorted, entry{})`],
      [null, `	copy(sorted[i+1:], sorted[i:])`],
      [null, `	sorted[i] = e`],
      [null, `	${k('return')} sorted`],
      [null, `}`],
      [null, ``],
      [null, `${k('func')} remove(sorted []entry, e entry) ([]entry, bool) {`],
      [null, `	i := lowerBound(sorted, e)`],
      [null, `	${k('if')} i &lt; len(sorted) &amp;&amp; sorted[i] == e {`],
      [null, `		${k('return')} append(sorted[:i], sorted[i+1:]...), true`],
      [null, `	}`],
      [null, `	${k('return')} sorted, false`],
      [null, `}`],
      [null, ``],
      [null, `${k('func')} findXSum(nums []int, k int, x int) []int {`],
      [null, `	window := newXSumWindow(x)`],
      [null, `	answer := make([]int, 0, len(nums)-k+1)`],
      [null, `	${k('for')} i, value := ${k('range')} nums {`],
      [null, `		window.add(value)`],
      [null, `		${k('if')} i &gt;= k {`],
      [null, `			window.remove(nums[i-k])`],
      [null, `		}`],
      ['record', `		${k('if')} i &gt;= k-1 {`],
      ['record', `			answer = append(answer, window.sum)`],
      [null, `		}`],
      [null, `	}`],
      [null, `	${k('return')} answer`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('use')} std::collections::HashMap;`],
      [null, ``],
      [null, `${c('// Two sorted Vecs. TOP holds the x strongest keys, REST holds everything else,')}`],
      [null, `${c('// and every TOP entry outranks every REST entry. Entries are (count, value), so')}`],
      [null, `${c('// tuple Ord is the ranking rule itself.')}`],
      [null, `${c('//')}`],
      [null, `${c('// Clear, and fine for 3318. Every update shifts up to k entries, which is why')}`],
      [null, `${c('// 3321 needs the heap version.')}`],
      [null, ``],
      [null, `struct XSumWindow {`],
      [null, `    x: usize,`],
      [null, `    count: HashMap&lt;i32, i32&gt;,`],
      [null, `    top: Vec&lt;(i32, i32)&gt;,  ${c('// ascending; top[0] is the weakest kept entry')}`],
      [null, `    rest: Vec&lt;(i32, i32)&gt;, ${c('// ascending; last is the strongest dropped entry')}`],
      [null, `    sum: i32,`],
      [null, `}`],
      [null, ``],
      [null, `${k('impl')} XSumWindow {`],
      [null, `    ${k('fn')} new(x: usize) -&gt; ${k('Self')} {`],
      [null, `        ${k('Self')} { x, count: HashMap::new(), top: Vec::new(), rest: Vec::new(), sum: 0 }`],
      [null, `    }`],
      [null, ``],
      [null, `    ${k('fn')} add(&amp;${k('mut')} self, value: i32) {`],
      [null, `        self.adjust(value, 1);`],
      [null, `    }`],
      [null, ``],
      [null, `    ${k('fn')} remove(&amp;${k('mut')} self, value: i32) {`],
      [null, `        self.adjust(value, -1);`],
      [null, `    }`],
      [null, ``],
      [null, `    ${k('fn')} adjust(&amp;${k('mut')} self, value: i32, delta: i32) {`],
      [null, `        ${k('let')} ${k('mut')} count = self.count.get(&amp;value).copied().unwrap_or(0);`],
      ['detach', `        ${k('if')} count &gt; 0 {`],
      ['detach', `            self.detach((count, value)); ${c('// its old key is now stale')}`],
      [null, `        }`],
      [null, ``],
      ['insert', `        count += delta;`],
      [null, `        ${k('if')} count == 0 {`],
      ['insert', `            self.count.remove(&amp;value);`],
      [null, `        } ${k('else')} {`],
      ['insert', `            self.count.insert(value, count);`],
      ['insert', `            insert(&amp;${k('mut')} self.rest, (count, value)); ${c('// re-enter low')}`],
      [null, `        }`],
      [null, ``],
      [null, `        self.rebalance();`],
      [null, `    }`],
      [null, ``],
      [null, `    ${k('fn')} detach(&amp;${k('mut')} self, entry: (i32, i32)) {`],
      ['detach', `        ${k('if')} remove(&amp;${k('mut')} self.top, entry) {`],
      ['detach', `            self.sum -= entry.0 * entry.1;`],
      [null, `        } ${k('else')} {`],
      [null, `            remove(&amp;${k('mut')} self.rest, entry);`],
      [null, `        }`],
      [null, `    }`],
      [null, ``],
      [null, `    ${k('fn')} rebalance(&amp;${k('mut')} self) {`],
      ['fill', `        ${k('while')} self.top.len() &lt; self.x &amp;&amp; !self.rest.is_empty() {`],
      ['fill', `            self.promote();`],
      [null, `        }`],
      ['violation', `        ${k('while')} !self.rest.is_empty() &amp;&amp; !self.top.is_empty()`],
      ['violation', `            &amp;&amp; *self.rest.last().unwrap() &gt; self.top[0]`],
      [null, `        {`],
      ['demote', `            self.demote();`],
      ['promote', `            self.promote();`],
      [null, `        }`],
      [null, `    }`],
      [null, ``],
      [null, `    ${k('fn')} promote(&amp;${k('mut')} self) {`],
      ['promote', `        ${k('let')} entry = self.rest.pop().unwrap();`],
      ['promote', `        insert(&amp;${k('mut')} self.top, entry);`],
      ['promote', `        self.sum += entry.0 * entry.1;`],
      [null, `    }`],
      [null, ``],
      [null, `    ${k('fn')} demote(&amp;${k('mut')} self) {`],
      ['demote', `        ${k('let')} entry = self.top.remove(0);`],
      ['demote', `        insert(&amp;${k('mut')} self.rest, entry);`],
      ['demote', `        self.sum -= entry.0 * entry.1;`],
      [null, `    }`],
      [null, `}`],
      [null, ``],
      [null, `${k('fn')} insert(sorted: &amp;${k('mut')} Vec&lt;(i32, i32)&gt;, entry: (i32, i32)) {`],
      [null, `    ${k('let')} at = sorted.binary_search(&amp;entry).unwrap_or_else(|at| at);`],
      [null, `    sorted.insert(at, entry);`],
      [null, `}`],
      [null, ``],
      [null, `${k('fn')} remove(sorted: &amp;${k('mut')} Vec&lt;(i32, i32)&gt;, entry: (i32, i32)) -&gt; bool {`],
      [null, `    ${k('match')} sorted.binary_search(&amp;entry) {`],
      [null, `        Ok(at) =&gt; {`],
      [null, `            sorted.remove(at);`],
      [null, `            true`],
      [null, `        }`],
      [null, `        Err(_) =&gt; false,`],
      [null, `    }`],
      [null, `}`],
      [null, ``],
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} find_x_sum(nums: Vec&lt;i32&gt;, k: i32, x: i32) -&gt; Vec&lt;i32&gt; {`],
      [null, `        ${k('let')} (k, x) = (k as usize, x as usize);`],
      [null, `        ${k('let')} ${k('mut')} window = XSumWindow::new(x);`],
      [null, `        ${k('let')} ${k('mut')} answer = Vec::with_capacity(nums.len() - k + 1);`],
      [null, `        ${k('for')} i ${k('in')} 0..nums.len() {`],
      [null, `            window.add(nums[i]);`],
      [null, `            ${k('if')} i &gt;= k {`],
      [null, `                window.remove(nums[i - k]);`],
      [null, `            }`],
      ['record', `            ${k('if')} i + 1 &gt;= k {`],
      ['record', `                answer.push(window.sum);`],
      [null, `            }`],
      [null, `        }`],
      [null, `        answer`],
      [null, `    }`],
      [null, `}`],
    ],
  },
  heap: {
    ruby: [
      [null, `${c('# 3321 version: two lazy-deletion heaps instead of two sorted arrays.')}`],
      [null, `${c('# Entries are packed into one Integer: (count &lt;&lt; 30) | value, so comparison is')}`],
      [null, `${c('# integer comparison and still means "more occurrences wins, bigger value breaks ties".')}`],
      [null, `class XSumWindow`],
      [null, `  attr_reader :sum`],
      [null, `  SHIFT = 30`],
      [null, `  MASK  = (1 &lt;&lt; 30) - 1`],
      [null, ``],
      [null, `  ${k('def')} initialize(x)`],
      [null, `    @x        = x`],
      [null, `    @count    = Hash.new(0)`],
      [null, `    @in_top   = {}`],
      [null, `    @top_size = 0`],
      [null, `    @sum      = 0`],
      [null, `    @top      = []   ${c('# min-heap of packed keys      -&gt; weakest kept entry on top')}`],
      [null, `    @rest     = []   ${c('# min-heap of NEGATED keys     -&gt; strongest dropped entry on top')}`],
      [null, `  ${k('end')}`],
      [null, ``],
      [null, `  ${k('def')} add(value)`],
      [null, `    adjust(value, +1)`],
      [null, `  ${k('end')}`],
      [null, ``],
      [null, `  ${k('def')} del(value)`],
      [null, `    adjust(value, -1)`],
      [null, `  ${k('end')}`],
      [null, ``],
      [null, `  private`],
      [null, ``],
      [null, `  ${k('def')} adjust(value, delta)`],
      [null, `    count = @count[value]`],
      ['detach', `    ${k('if')} count &gt; 0 &amp;&amp; @in_top[value]          ${c('# lift it out of TOP; the heap entry goes stale on its own')}`],
      ['detach', `      @sum -= count * value`],
      ['detach', `      @in_top.delete(value)`],
      ['detach', `      @top_size -= 1`],
      [null, `    ${k('end')}`],
      [null, ``],
      ['insert', `    count += delta`],
      [null, `    ${k('if')} count.zero?`],
      ['insert', `      @count.delete(value)`],
      [null, `    ${k('else')}`],
      ['insert', `      @count[value] = count`],
      ['insert', `      hpush(@rest, -((count &lt;&lt; SHIFT) | value))`],
      [null, `    ${k('end')}`],
      [null, ``],
      [null, `    rebalance`],
      [null, `  ${k('end')}`],
      [null, ``],
      [null, `  ${k('def')} rebalance`],
      ['fill', `    ${k('while')} @top_size &lt; @x &amp;&amp; (key = rest_peek)`],
      ['fill', `      hpop(@rest)`],
      ['fill', `      promote(key)`],
      [null, `    ${k('end')}`],
      ['violation', `    ${k('while')} (r = rest_peek) &amp;&amp; (t = top_peek) &amp;&amp; r &gt; t`],
      ['demote', `      hpop(@top);  demote(t)`],
      ['promote', `      hpop(@rest); promote(r)`],
      [null, `    ${k('end')}`],
      [null, `  ${k('end')}`],
      [null, ``],
      [null, `  ${k('def')} promote(key)`],
      ['promote', `    @in_top[key &amp; MASK] = true`],
      ['promote', `    @top_size += 1`],
      ['promote', `    @sum += (key &gt;&gt; SHIFT) * (key &amp; MASK)`],
      ['promote', `    hpush(@top, key)`],
      [null, `  ${k('end')}`],
      [null, ``],
      [null, `  ${k('def')} demote(key)`],
      ['demote', `    @in_top.delete(key &amp; MASK)`],
      ['demote', `    @top_size -= 1`],
      ['demote', `    @sum -= (key &gt;&gt; SHIFT) * (key &amp; MASK)`],
      ['demote', `    hpush(@rest, -key)`],
      [null, `  ${k('end')}`],
      [null, ``],
      [null, `  ${c('# A heap entry is live only if the tally still agrees with it.')}`],
      [null, `  ${k('def')} top_peek`],
      [null, `    ${k('while')} (key = @top[0])`],
      [null, `      v = key &amp; MASK`],
      [null, `      ${k('return')} key ${k('if')} @in_top[v] &amp;&amp; @count[v] == key &gt;&gt; SHIFT`],
      ['discard', `      hpop(@top)`],
      [null, `    ${k('end')}`],
      [null, `    ${k('nil')}`],
      [null, `  ${k('end')}`],
      [null, ``],
      [null, `  ${k('def')} rest_peek`],
      [null, `    ${k('while')} (neg = @rest[0])`],
      [null, `      key = -neg`],
      [null, `      v = key &amp; MASK`],
      [null, `      ${k('return')} key ${k('if')} !@in_top[v] &amp;&amp; @count[v] == key &gt;&gt; SHIFT`],
      ['discard', `      hpop(@rest)`],
      [null, `    ${k('end')}`],
      [null, `    ${k('nil')}`],
      [null, `  ${k('end')}`],
      [null, ``],
      [null, `  ${k('def')} hpush(heap, key)`],
      [null, `    i = heap.size`],
      [null, `    heap &lt;&lt; key`],
      [null, `    ${k('while')} i &gt; 0`],
      [null, `      parent = (i - 1) &gt;&gt; 1`],
      [null, `      break ${k('if')} heap[parent] &lt;= key`],
      [null, `      heap[i] = heap[parent]`],
      [null, `      i = parent`],
      [null, `    ${k('end')}`],
      [null, `    heap[i] = key`],
      [null, `  ${k('end')}`],
      [null, ``],
      [null, `  ${k('def')} hpop(heap)`],
      [null, `    root = heap[0]`],
      [null, `    last = heap.pop`],
      [null, `    ${k('unless')} heap.empty?`],
      [null, `      i = 0`],
      [null, `      n = heap.size`],
      [null, `      loop ${k('do')}`],
      [null, `        child = 2 * i + 1`],
      [null, `        break ${k('if')} child &gt;= n`],
      [null, `        child += 1 ${k('if')} child + 1 &lt; n &amp;&amp; heap[child + 1] &lt; heap[child]`],
      [null, `        break ${k('if')} heap[child] &gt;= last`],
      [null, `        heap[i] = heap[child]`],
      [null, `        i = child`],
      [null, `      ${k('end')}`],
      [null, `      heap[i] = last`],
      [null, `    ${k('end')}`],
      [null, `    root`],
      [null, `  ${k('end')}`],
      [null, `${k('end')}`],
      [null, ``],
      [null, `${k('def')} find_x_sum(nums, k, x)`],
      [null, `  window = XSumWindow.new(x)`],
      [null, `  answer = []`],
      [null, `  nums.each_with_index ${k('do')} |value, i|`],
      [null, `    window.add(value)`],
      [null, `    window.del(nums[i - k]) ${k('if')} i &gt;= k`],
      ['record', `    answer &lt;&lt; window.sum ${k('if')} i &gt;= k - 1`],
      [null, `  ${k('end')}`],
      [null, `  answer`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('import')} heapq`],
      [null, `${k('from')} typing ${k('import')} List, Optional`],
      [null, ``],
      [null, `SHIFT = 30`],
      [null, `MASK = (1 &lt;&lt; SHIFT) - 1`],
      [null, ``],
      [null, ``],
      [null, `${k('class')} XSumWindow:`],
      [null, `    """The x most frequent values of a sliding window, as a running total.`],
      [null, ``],
      [null, `    TOP holds the x strongest keys, REST holds the rest, and every TOP entry`],
      [null, `    outranks every REST entry. Entries are packed into one int,`],
      [null, `    (count &lt;&lt; 30) | value, so integer order ${k('is')} the ranking rule itself.`],
      [null, ``],
      [null, `    Nothing ${k('is')} ever removed ${k('from')} a heap on update: the entry goes stale, and ${k('is')}`],
      [null, `    dropped when it surfaces at the root and the tally no longer agrees with it.`],
      [null, `    """`],
      [null, ``],
      [null, `    __slots__ = ("x", "count", "in_top", "top_size", "total", "top", "rest")`],
      [null, ``],
      [null, `    ${k('def')} __init__(self, x: int) -&gt; ${k('None')}:`],
      [null, `        self.x = x`],
      [null, `        self.count = {}`],
      [null, `        self.in_top = set()`],
      [null, `        self.top_size = 0`],
      [null, `        self.total = 0`],
      [null, `        self.top = []   ${c('# min-heap of packed keys    -&gt; weakest kept entry on top')}`],
      [null, `        self.rest = []  ${c('# min-heap of negated keys   -&gt; strongest dropped entry on top')}`],
      [null, ``],
      [null, `    ${k('def')} add(self, value: int) -&gt; ${k('None')}:`],
      [null, `        self._adjust(value, 1)`],
      [null, ``],
      [null, `    ${k('def')} remove(self, value: int) -&gt; ${k('None')}:`],
      [null, `        self._adjust(value, -1)`],
      [null, ``],
      [null, `    ${k('def')} _adjust(self, value: int, delta: int) -&gt; ${k('None')}:`],
      [null, `        count = self.count.get(value, 0)`],
      ['detach', `        ${k('if')} count and value ${k('in')} self.in_top:      ${c('# lift it out of TOP; its entry goes stale')}`],
      ['detach', `            self.total -= count * value`],
      ['detach', `            self.in_top.discard(value)`],
      ['detach', `            self.top_size -= 1`],
      [null, ``],
      ['insert', `        count += delta`],
      [null, `        ${k('if')} count == 0:`],
      ['insert', `            self.count.pop(value, ${k('None')})`],
      [null, `        ${k('else')}:`],
      ['insert', `            self.count[value] = count`],
      ['insert', `            heapq.heappush(self.rest, -((count &lt;&lt; SHIFT) | value))`],
      [null, ``],
      [null, `        self._rebalance()`],
      [null, ``],
      [null, `    ${k('def')} _rebalance(self) -&gt; ${k('None')}:`],
      ['fill', `        ${k('while')} self.top_size &lt; self.x:`],
      [null, `            key = self._rest_peek()`],
      [null, `            ${k('if')} key ${k('is')} ${k('None')}:`],
      [null, `                break`],
      ['fill', `            heapq.heappop(self.rest)`],
      ['fill', `            self._promote(key)`],
      [null, ``],
      [null, `        ${k('while')} True:`],
      [null, `            best = self._rest_peek()`],
      [null, `            ${k('if')} best ${k('is')} ${k('None')}:`],
      [null, `                break`],
      [null, `            weakest = self._top_peek()`],
      ['violation', `            ${k('if')} weakest ${k('is')} ${k('None')} or best &lt;= weakest:`],
      [null, `                break`],
      ['demote', `            heapq.heappop(self.top)`],
      ['demote', `            self._demote(weakest)`],
      ['promote', `            heapq.heappop(self.rest)`],
      ['promote', `            self._promote(best)`],
      [null, ``],
      [null, `    ${k('def')} _promote(self, key: int) -&gt; ${k('None')}:`],
      ['promote', `        self.in_top.add(key &amp; MASK)`],
      ['promote', `        self.top_size += 1`],
      ['promote', `        self.total += (key &gt;&gt; SHIFT) * (key &amp; MASK)`],
      ['promote', `        heapq.heappush(self.top, key)`],
      [null, ``],
      [null, `    ${k('def')} _demote(self, key: int) -&gt; ${k('None')}:`],
      ['demote', `        self.in_top.discard(key &amp; MASK)`],
      ['demote', `        self.top_size -= 1`],
      ['demote', `        self.total -= (key &gt;&gt; SHIFT) * (key &amp; MASK)`],
      ['demote', `        heapq.heappush(self.rest, -key)`],
      [null, ``],
      [null, `    ${k('def')} _top_peek(self) -&gt; Optional[int]:`],
      [null, `        ${k('while')} self.top:`],
      [null, `            key = self.top[0]`],
      [null, `            value = key &amp; MASK`],
      [null, `            ${k('if')} value ${k('in')} self.in_top and self.count.get(value, 0) == key &gt;&gt; SHIFT:`],
      [null, `                ${k('return')} key`],
      ['discard', `            heapq.heappop(self.top)`],
      [null, `        ${k('return')} ${k('None')}`],
      [null, ``],
      [null, `    ${k('def')} _rest_peek(self) -&gt; Optional[int]:`],
      [null, `        ${k('while')} self.rest:`],
      [null, `            key = -self.rest[0]`],
      [null, `            value = key &amp; MASK`],
      [null, `            ${k('if')} value ${k('not')} ${k('in')} self.in_top and self.count.get(value, 0) == key &gt;&gt; SHIFT:`],
      [null, `                ${k('return')} key`],
      ['discard', `            heapq.heappop(self.rest)`],
      [null, `        ${k('return')} ${k('None')}`],
      [null, ``],
      [null, ``],
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} findXSum(self, nums: List[int], k: int, x: int) -&gt; List[int]:`],
      [null, `        window = XSumWindow(x)`],
      [null, `        answer = []`],
      [null, `        ${k('for')} i, value ${k('in')} enumerate(nums):`],
      [null, `            window.add(value)`],
      [null, `            ${k('if')} i &gt;= k:`],
      [null, `                window.remove(nums[i - k])`],
      ['record', `            ${k('if')} i &gt;= k - 1:`],
      ['record', `                answer.append(window.total)`],
      [null, `        ${k('return')} answer`],
    ],
    javascript: [
      [null, `${c('// Keys pack (count, value) into one number: count * 2^30 + value.')}`],
      [null, `${c('// JavaScript\'s &lt;&lt; is 32-bit, so this uses arithmetic, not bit shifts.')}`],
      [null, `${c('// Max key is 1e5 * 2^30 ~ 1.1e14, comfortably inside Number\'s exact range.')}`],
      [null, `${k('const')} SCALE = 2 ** 30;`],
      [null, ``],
      [null, `class MinHeap {`],
      [null, `  constructor() {`],
      [null, `    this.a = [];`],
      [null, `  }`],
      [null, `  get size() {`],
      [null, `    ${k('return')} this.a.length;`],
      [null, `  }`],
      [null, `  peek() {`],
      [null, `    ${k('return')} this.a.length ? this.a[0] : undefined;`],
      [null, `  }`],
      [null, `  push(key) {`],
      [null, `    ${k('const')} a = this.a;`],
      [null, `    ${k('let')} i = a.length;`],
      [null, `    a.push(key);`],
      [null, `    ${k('while')} (i &gt; 0) {`],
      [null, `      ${k('const')} parent = (i - 1) &gt;&gt; 1;`],
      [null, `      ${k('if')} (a[parent] &lt;= key) break;`],
      [null, `      a[i] = a[parent];`],
      [null, `      i = parent;`],
      [null, `    }`],
      [null, `    a[i] = key;`],
      [null, `  }`],
      [null, `  pop() {`],
      [null, `    ${k('const')} a = this.a;`],
      [null, `    ${k('const')} root = a[0];`],
      [null, `    ${k('const')} last = a.pop();`],
      [null, `    ${k('if')} (a.length) {`],
      [null, `      ${k('const')} n = a.length;`],
      [null, `      ${k('let')} i = 0;`],
      [null, `      ${k('for')} (;;) {`],
      [null, `        ${k('let')} child = 2 * i + 1;`],
      [null, `        ${k('if')} (child &gt;= n) break;`],
      [null, `        ${k('if')} (child + 1 &lt; n &amp;&amp; a[child + 1] &lt; a[child]) child++;`],
      [null, `        ${k('if')} (a[child] &gt;= last) break;`],
      [null, `        a[i] = a[child];`],
      [null, `        i = child;`],
      [null, `      }`],
      [null, `      a[i] = last;`],
      [null, `    }`],
      [null, `    ${k('return')} root;`],
      [null, `  }`],
      [null, `}`],
      [null, ``],
      [null, `class XSumWindow {`],
      [null, `  constructor(x) {`],
      [null, `    this.x = x;`],
      [null, `    this.count = ${k('new')} Map();`],
      [null, `    this.inTop = ${k('new')} Set();`],
      [null, `    this.topSize = 0;`],
      [null, `    this.sum = 0;`],
      [null, `    this.top = ${k('new')} MinHeap();   ${c('// packed keys          -&gt; weakest kept entry on top')}`],
      [null, `    this.rest = ${k('new')} MinHeap();  ${c('// negated packed keys  -&gt; strongest dropped entry on top')}`],
      [null, `  }`],
      [null, ``],
      [null, `  add(value) {`],
      [null, `    this.adjust(value, 1);`],
      [null, `  }`],
      [null, ``],
      [null, `  remove(value) {`],
      [null, `    this.adjust(value, -1);`],
      [null, `  }`],
      [null, ``],
      [null, `  adjust(value, delta) {`],
      [null, `    ${k('let')} count = this.count.get(value) || 0;`],
      ['detach', `    ${k('if')} (count &gt; 0 &amp;&amp; this.inTop.has(value)) {   ${c('// lift it out of TOP; its entry goes stale')}`],
      ['detach', `      this.sum -= count * value;`],
      ['detach', `      this.inTop.delete(value);`],
      ['detach', `      this.topSize--;`],
      [null, `    }`],
      [null, ``],
      ['insert', `    count += delta;`],
      ['insert', `    ${k('if')} (count === 0) this.count.delete(value);`],
      [null, `    ${k('else')} {`],
      ['insert', `      this.count.set(value, count);`],
      ['insert', `      this.rest.push(-(count * SCALE + value));`],
      [null, `    }`],
      [null, ``],
      [null, `    this.rebalance();`],
      [null, `  }`],
      [null, ``],
      [null, `  rebalance() {`],
      ['fill', `    ${k('while')} (this.topSize &lt; this.x) {`],
      [null, `      ${k('const')} key = this.restPeek();`],
      [null, `      ${k('if')} (key === undefined) break;`],
      ['fill', `      this.rest.pop();`],
      ['fill', `      this.promote(key);`],
      [null, `    }`],
      [null, `    ${k('for')} (;;) {`],
      [null, `      ${k('const')} best = this.restPeek();`],
      [null, `      ${k('if')} (best === undefined) break;`],
      [null, `      ${k('const')} weakest = this.topPeek();`],
      ['violation', `      ${k('if')} (weakest === undefined || best &lt;= weakest) break;`],
      ['demote', `      this.top.pop();`],
      ['demote', `      this.demote(weakest);`],
      ['promote', `      this.rest.pop();`],
      ['promote', `      this.promote(best);`],
      [null, `    }`],
      [null, `  }`],
      [null, ``],
      [null, `  promote(key) {`],
      ['promote', `    ${k('const')} value = key % SCALE;`],
      ['promote', `    this.inTop.add(value);`],
      ['promote', `    this.topSize++;`],
      ['promote', `    this.sum += Math.floor(key / SCALE) * value;`],
      ['promote', `    this.top.push(key);`],
      [null, `  }`],
      [null, ``],
      [null, `  demote(key) {`],
      ['demote', `    ${k('const')} value = key % SCALE;`],
      ['demote', `    this.inTop.delete(value);`],
      ['demote', `    this.topSize--;`],
      ['demote', `    this.sum -= Math.floor(key / SCALE) * value;`],
      ['demote', `    this.rest.push(-key);`],
      [null, `  }`],
      [null, ``],
      [null, `  ${c('// A heap entry is live only if the tally still agrees with it.')}`],
      [null, `  topPeek() {`],
      [null, `    ${k('for')} (;;) {`],
      [null, `      ${k('const')} key = this.top.peek();`],
      [null, `      ${k('if')} (key === undefined) ${k('return')} undefined;`],
      [null, `      ${k('const')} value = key % SCALE;`],
      [null, `      ${k('if')} (this.inTop.has(value) &amp;&amp; this.count.get(value) === Math.floor(key / SCALE)) ${k('return')} key;`],
      ['discard', `      this.top.pop();`],
      [null, `    }`],
      [null, `  }`],
      [null, ``],
      [null, `  restPeek() {`],
      [null, `    ${k('for')} (;;) {`],
      [null, `      ${k('const')} negated = this.rest.peek();`],
      [null, `      ${k('if')} (negated === undefined) ${k('return')} undefined;`],
      [null, `      ${k('const')} key = -negated;`],
      [null, `      ${k('const')} value = key % SCALE;`],
      [null, `      ${k('if')} (!this.inTop.has(value) &amp;&amp; this.count.get(value) === Math.floor(key / SCALE)) ${k('return')} key;`],
      ['discard', `      this.rest.pop();`],
      [null, `    }`],
      [null, `  }`],
      [null, `}`],
      [null, ``],
      [null, `/**`],
      [null, ` * @param {number[]} nums`],
      [null, ` * @param {number} k`],
      [null, ` * @param {number} x`],
      [null, ` * @${k('return')} {number[]}`],
      [null, ` */`],
      [null, `${k('var')} findXSum = ${k('function')} (nums, k, x) {`],
      [null, `  ${k('const')} window = ${k('new')} XSumWindow(x);`],
      [null, `  ${k('const')} answer = [];`],
      [null, `  ${k('for')} (${k('let')} i = 0; i &lt; nums.length; i++) {`],
      [null, `    window.add(nums[i]);`],
      [null, `    ${k('if')} (i &gt;= k) window.remove(nums[i - k]);`],
      ['record', `    ${k('if')} (i &gt;= k - 1) answer.push(window.sum);`],
      [null, `  }`],
      [null, `  ${k('return')} answer;`],
      [null, `};`],
    ],
    go: [
      [null, `${c('// 3321 returns []int64. For 3318, change the return type and w.sum to int.')}`],
      [null, `${c('//')}`],
      [null, `${c('// Entries pack (count, value) into one int64: (count &lt;&lt; 30) | value, so integer')}`],
      [null, `${c('// order is the ranking rule. Nothing is removed from a heap on update — the entry')}`],
      [null, `${c('// goes stale and is discarded when it surfaces at the root.')}`],
      [null, ``],
      [null, `const shift = 30`],
      [null, `const mask = (1 &lt;&lt; shift) - 1`],
      [null, ``],
      [null, `type minHeap struct{ a []int64 }`],
      [null, ``],
      [null, `${k('func')} (h *minHeap) len() int { ${k('return')} len(h.a) }`],
      [null, ``],
      [null, `${k('func')} (h *minHeap) push(key int64) {`],
      [null, `	h.a = append(h.a, key)`],
      [null, `	i := len(h.a) - 1`],
      [null, `	${k('for')} i &gt; 0 {`],
      [null, `		parent := (i - 1) / 2`],
      [null, `		${k('if')} h.a[parent] &lt;= key {`],
      [null, `			break`],
      [null, `		}`],
      [null, `		h.a[i] = h.a[parent]`],
      [null, `		i = parent`],
      [null, `	}`],
      [null, `	h.a[i] = key`],
      [null, `}`],
      [null, ``],
      [null, `${k('func')} (h *minHeap) pop() int64 {`],
      [null, `	root := h.a[0]`],
      [null, `	last := h.a[len(h.a)-1]`],
      [null, `	h.a = h.a[:len(h.a)-1]`],
      [null, `	${k('if')} n := len(h.a); n &gt; 0 {`],
      [null, `		i := 0`],
      [null, `		${k('for')} {`],
      [null, `			child := 2*i + 1`],
      [null, `			${k('if')} child &gt;= n {`],
      [null, `				break`],
      [null, `			}`],
      [null, `			${k('if')} child+1 &lt; n &amp;&amp; h.a[child+1] &lt; h.a[child] {`],
      [null, `				child++`],
      [null, `			}`],
      [null, `			${k('if')} h.a[child] &gt;= last {`],
      [null, `				break`],
      [null, `			}`],
      [null, `			h.a[i] = h.a[child]`],
      [null, `			i = child`],
      [null, `		}`],
      [null, `		h.a[i] = last`],
      [null, `	}`],
      [null, `	${k('return')} root`],
      [null, `}`],
      [null, ``],
      [null, `type xSumWindow struct {`],
      [null, `	x       int`],
      [null, `	count   map[int64]int64`],
      [null, `	inTop   map[int64]bool`],
      [null, `	topSize int`],
      [null, `	sum     int64`],
      [null, `	top     minHeap ${c('// packed keys         -&gt; weakest kept entry on top')}`],
      [null, `	rest    minHeap ${c('// negated packed keys -&gt; strongest dropped entry on top')}`],
      [null, `}`],
      [null, ``],
      [null, `${k('func')} newXSumWindow(x int) *xSumWindow {`],
      [null, `	${k('return')} &amp;xSumWindow{x: x, count: make(map[int64]int64), inTop: make(map[int64]bool)}`],
      [null, `}`],
      [null, ``],
      [null, `${k('func')} (w *xSumWindow) add(value int64)    { w.adjust(value, 1) }`],
      [null, `${k('func')} (w *xSumWindow) remove(value int64) { w.adjust(value, -1) }`],
      [null, ``],
      [null, `${k('func')} (w *xSumWindow) adjust(value, delta int64) {`],
      [null, `	count := w.count[value]`],
      ['detach', `	${k('if')} count &gt; 0 &amp;&amp; w.inTop[value] { ${c('// lift it out of TOP; its entry goes stale')}`],
      ['detach', `		w.sum -= count * value`],
      ['detach', `		delete(w.inTop, value)`],
      ['detach', `		w.topSize--`],
      [null, `	}`],
      [null, ``],
      ['insert', `	count += delta`],
      [null, `	${k('if')} count == 0 {`],
      ['insert', `		delete(w.count, value)`],
      [null, `	} ${k('else')} {`],
      ['insert', `		w.count[value] = count`],
      ['insert', `		w.rest.push(-((count &lt;&lt; shift) | value))`],
      [null, `	}`],
      [null, ``],
      [null, `	w.rebalance()`],
      [null, `}`],
      [null, ``],
      [null, `${k('func')} (w *xSumWindow) rebalance() {`],
      ['fill', `	${k('for')} w.topSize &lt; w.x {`],
      [null, `		key, ok := w.restPeek()`],
      [null, `		${k('if')} !ok {`],
      [null, `			break`],
      [null, `		}`],
      ['fill', `		w.rest.pop()`],
      ['fill', `		w.promote(key)`],
      [null, `	}`],
      [null, `	${k('for')} {`],
      [null, `		best, ok := w.restPeek()`],
      [null, `		${k('if')} !ok {`],
      [null, `			break`],
      [null, `		}`],
      [null, `		weakest, ok := w.topPeek()`],
      ['violation', `		${k('if')} !ok || best &lt;= weakest {`],
      [null, `			break`],
      [null, `		}`],
      ['demote', `		w.top.pop()`],
      ['demote', `		w.demote(weakest)`],
      ['promote', `		w.rest.pop()`],
      ['promote', `		w.promote(best)`],
      [null, `	}`],
      [null, `}`],
      [null, ``],
      [null, `${k('func')} (w *xSumWindow) promote(key int64) {`],
      ['promote', `	value := key &amp; mask`],
      ['promote', `	w.inTop[value] = true`],
      ['promote', `	w.topSize++`],
      ['promote', `	w.sum += (key &gt;&gt; shift) * value`],
      ['promote', `	w.top.push(key)`],
      [null, `}`],
      [null, ``],
      [null, `${k('func')} (w *xSumWindow) demote(key int64) {`],
      ['demote', `	value := key &amp; mask`],
      ['demote', `	delete(w.inTop, value)`],
      ['demote', `	w.topSize--`],
      ['demote', `	w.sum -= (key &gt;&gt; shift) * value`],
      ['demote', `	w.rest.push(-key)`],
      [null, `}`],
      [null, ``],
      [null, `${c('// A heap entry is live only if the tally still agrees with it.')}`],
      [null, `${k('func')} (w *xSumWindow) topPeek() (int64, bool) {`],
      [null, `	${k('for')} w.top.len() &gt; 0 {`],
      [null, `		key := w.top.a[0]`],
      [null, `		value := key &amp; mask`],
      [null, `		${k('if')} w.inTop[value] &amp;&amp; w.count[value] == key&gt;&gt;shift {`],
      [null, `			${k('return')} key, true`],
      [null, `		}`],
      ['discard', `		w.top.pop()`],
      [null, `	}`],
      [null, `	${k('return')} 0, false`],
      [null, `}`],
      [null, ``],
      [null, `${k('func')} (w *xSumWindow) restPeek() (int64, bool) {`],
      [null, `	${k('for')} w.rest.len() &gt; 0 {`],
      [null, `		key := -w.rest.a[0]`],
      [null, `		value := key &amp; mask`],
      [null, `		${k('if')} !w.inTop[value] &amp;&amp; w.count[value] == key&gt;&gt;shift {`],
      [null, `			${k('return')} key, true`],
      [null, `		}`],
      ['discard', `		w.rest.pop()`],
      [null, `	}`],
      [null, `	${k('return')} 0, false`],
      [null, `}`],
      [null, ``],
      [null, `${k('func')} findXSum(nums []int, k int, x int) []int64 {`],
      [null, `	window := newXSumWindow(x)`],
      [null, `	answer := make([]int64, 0, len(nums)-k+1)`],
      [null, `	${k('for')} i, value := ${k('range')} nums {`],
      [null, `		window.add(int64(value))`],
      [null, `		${k('if')} i &gt;= k {`],
      [null, `			window.remove(int64(nums[i-k]))`],
      [null, `		}`],
      ['record', `		${k('if')} i &gt;= k-1 {`],
      ['record', `			answer = append(answer, window.sum)`],
      [null, `		}`],
      [null, `	}`],
      [null, `	${k('return')} answer`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('use')} std::cmp::Reverse;`],
      [null, `${k('use')} std::collections::{BinaryHeap, HashMap, HashSet};`],
      [null, ``],
      [null, `${c('// Entries pack (count, value) into one i64: (count &lt;&lt; 30) | value, so integer')}`],
      [null, `${c('// order is the ranking rule. Nothing is removed from a heap on update — the entry')}`],
      [null, `${c('// goes stale and is discarded when it surfaces at the top.')}`],
      [null, ``],
      [null, `const SHIFT: i64 = 30;`],
      [null, `const MASK: i64 = (1 &lt;&lt; SHIFT) - 1;`],
      [null, ``],
      [null, `struct XSumWindow {`],
      [null, `    x: usize,`],
      [null, `    count: HashMap&lt;i64, i64&gt;,`],
      [null, `    in_top: HashSet&lt;i64&gt;,`],
      [null, `    top_size: usize,`],
      [null, `    sum: i64,`],
      [null, `    top: BinaryHeap&lt;Reverse&lt;i64&gt;&gt;, ${c('// min-heap: weakest kept entry on top')}`],
      [null, `    rest: BinaryHeap&lt;i64&gt;,         ${c('// max-heap: strongest dropped entry on top')}`],
      [null, `}`],
      [null, ``],
      [null, `${k('impl')} XSumWindow {`],
      [null, `    ${k('fn')} new(x: usize) -&gt; ${k('Self')} {`],
      [null, `        ${k('Self')} {`],
      [null, `            x,`],
      [null, `            count: HashMap::new(),`],
      [null, `            in_top: HashSet::new(),`],
      [null, `            top_size: 0,`],
      [null, `            sum: 0,`],
      [null, `            top: BinaryHeap::new(),`],
      [null, `            rest: BinaryHeap::new(),`],
      [null, `        }`],
      [null, `    }`],
      [null, ``],
      [null, `    ${k('fn')} add(&amp;${k('mut')} self, value: i64) {`],
      [null, `        self.adjust(value, 1);`],
      [null, `    }`],
      [null, ``],
      [null, `    ${k('fn')} remove(&amp;${k('mut')} self, value: i64) {`],
      [null, `        self.adjust(value, -1);`],
      [null, `    }`],
      [null, ``],
      [null, `    ${k('fn')} adjust(&amp;${k('mut')} self, value: i64, delta: i64) {`],
      [null, `        ${k('let')} ${k('mut')} count = self.count.get(&amp;value).copied().unwrap_or(0);`],
      ['detach', `        ${k('if')} count &gt; 0 &amp;&amp; self.in_top.contains(&amp;value) {`],
      ['detach', `            self.sum -= count * value;`],
      ['detach', `            self.in_top.remove(&amp;value);`],
      ['detach', `            self.top_size -= 1;`],
      [null, `        }`],
      [null, ``],
      ['insert', `        count += delta;`],
      [null, `        ${k('if')} count == 0 {`],
      ['insert', `            self.count.remove(&amp;value);`],
      [null, `        } ${k('else')} {`],
      ['insert', `            self.count.insert(value, count);`],
      ['insert', `            self.rest.push((count &lt;&lt; SHIFT) | value);`],
      [null, `        }`],
      [null, ``],
      [null, `        self.rebalance();`],
      [null, `    }`],
      [null, ``],
      [null, `    ${k('fn')} rebalance(&amp;${k('mut')} self) {`],
      ['fill', `        ${k('while')} self.top_size &lt; self.x {`],
      [null, `            ${k('match')} self.rest_peek() {`],
      [null, `                ${k('Some')}(key) =&gt; {`],
      ['fill', `                    self.rest.pop();`],
      ['fill', `                    self.promote(key);`],
      [null, `                }`],
      [null, `                ${k('None')} =&gt; break,`],
      [null, `            }`],
      [null, `        }`],
      [null, ``],
      [null, `        loop {`],
      [null, `            ${k('let')} best = ${k('match')} self.rest_peek() {`],
      [null, `                ${k('Some')}(key) =&gt; key,`],
      [null, `                ${k('None')} =&gt; break,`],
      [null, `            };`],
      [null, `            ${k('let')} weakest = ${k('match')} self.top_peek() {`],
      [null, `                ${k('Some')}(key) =&gt; key,`],
      [null, `                ${k('None')} =&gt; break,`],
      [null, `            };`],
      ['violation', `            ${k('if')} best &lt;= weakest {`],
      [null, `                break;`],
      [null, `            }`],
      ['demote', `            self.top.pop();`],
      ['demote', `            self.demote(weakest);`],
      ['promote', `            self.rest.pop();`],
      ['promote', `            self.promote(best);`],
      [null, `        }`],
      [null, `    }`],
      [null, ``],
      [null, `    ${k('fn')} promote(&amp;${k('mut')} self, key: i64) {`],
      ['promote', `        self.in_top.insert(key &amp; MASK);`],
      ['promote', `        self.top_size += 1;`],
      ['promote', `        self.sum += (key &gt;&gt; SHIFT) * (key &amp; MASK);`],
      ['promote', `        self.top.push(Reverse(key));`],
      [null, `    }`],
      [null, ``],
      [null, `    ${k('fn')} demote(&amp;${k('mut')} self, key: i64) {`],
      ['demote', `        self.in_top.remove(&amp;(key &amp; MASK));`],
      ['demote', `        self.top_size -= 1;`],
      ['demote', `        self.sum -= (key &gt;&gt; SHIFT) * (key &amp; MASK);`],
      ['demote', `        self.rest.push(key);`],
      [null, `    }`],
      [null, ``],
      [null, `    ${c('// A heap entry is live only if the tally still agrees with it.')}`],
      [null, `    ${k('fn')} top_peek(&amp;${k('mut')} self) -&gt; Option&lt;i64&gt; {`],
      [null, `        ${k('while')} ${k('let')} ${k('Some')}(&amp;Reverse(key)) = self.top.peek() {`],
      [null, `            ${k('let')} value = key &amp; MASK;`],
      [null, `            ${k('if')} self.in_top.contains(&amp;value) &amp;&amp; self.count.get(&amp;value).copied() == ${k('Some')}(key &gt;&gt; SHIFT)`],
      [null, `            {`],
      [null, `                ${k('return')} ${k('Some')}(key);`],
      [null, `            }`],
      ['discard', `            self.top.pop();`],
      [null, `        }`],
      [null, `        ${k('None')}`],
      [null, `    }`],
      [null, ``],
      [null, `    ${k('fn')} rest_peek(&amp;${k('mut')} self) -&gt; Option&lt;i64&gt; {`],
      [null, `        ${k('while')} ${k('let')} ${k('Some')}(&amp;key) = self.rest.peek() {`],
      [null, `            ${k('let')} value = key &amp; MASK;`],
      [null, `            ${k('if')} !self.in_top.contains(&amp;value) &amp;&amp; self.count.get(&amp;value).copied() == ${k('Some')}(key &gt;&gt; SHIFT)`],
      [null, `            {`],
      [null, `                ${k('return')} ${k('Some')}(key);`],
      [null, `            }`],
      ['discard', `            self.rest.pop();`],
      [null, `        }`],
      [null, `        ${k('None')}`],
      [null, `    }`],
      [null, `}`],
      [null, ``],
      [null, `${k('impl')} Solution {`],
      [null, `    ${c('// 3321 returns Vec&lt;i64&gt;. For 3318, change this to Vec&lt;i32&gt; and cast the sum.')}`],
      [null, `    ${k('pub')} ${k('fn')} find_x_sum(nums: Vec&lt;i32&gt;, k: i32, x: i32) -&gt; Vec&lt;i64&gt; {`],
      [null, `        ${k('let')} (k, x) = (k as usize, x as usize);`],
      [null, `        ${k('let')} ${k('mut')} window = XSumWindow::new(x);`],
      [null, `        ${k('let')} ${k('mut')} answer = Vec::with_capacity(nums.len() - k + 1);`],
      [null, `        ${k('for')} i ${k('in')} 0..nums.len() {`],
      [null, `            window.add(nums[i] as i64);`],
      [null, `            ${k('if')} i &gt;= k {`],
      [null, `                window.remove(nums[i - k] as i64);`],
      [null, `            }`],
      ['record', `            ${k('if')} i + 1 &gt;= k {`],
      ['record', `                answer.push(window.sum);`],
      [null, `            }`],
      [null, `        }`],
      [null, `        answer`],
      [null, `    }`],
      [null, `}`],
    ],
  },
};

/* ---------------- part 1: "drag x, watch what survives" ----------------
 *
 * The statement hinges on its ranking rule: count first, and a bigger value
 * wins a tie. One window, a slider for x, the ranked cards with the cut
 * drawn where x falls, and the tie the ranking had to settle named out loud.
 */

const QW_SETS = [
  { label: t('example 1, window 0', 'ဥပမာ 1၊ window 0'), win: [1, 1, 2, 2, 3, 4] },
  { label: t('example 1, window 1', 'ဥပမာ 1၊ window 1'), win: [1, 2, 2, 3, 4, 2] },
  { label: t('example 2', 'ဥပမာ 2'), win: [3, 8] },
  { label: t('every value ties', 'တန်ဖိုးအားလုံး သရေကျ'), win: [5, 5, 4, 4, 3, 3] },
  { label: t('one value dominates', 'တစ်ခုတည်းက လွှမ်းမိုး'), win: [9, 9, 9, 9, 2, 7] },
];

function mountRankWidget(host) {
  const state = { set: 0, x: 2 };

  host.innerHTML = `
    <div class="q-arr" data-arr></div>
    <div class="q-slider">
      <label for="qw-x" data-lbl></label>
      <input type="range" id="qw-x" min="1" max="4" value="2">
      <output data-out>2</output>
      <span class="q-presets" data-presets></span>
    </div>
    <div class="rank" data-rank></div>
    <p class="q-tie" data-line></p>
    <div class="ledger">
      <span class="expr" data-expr></span>
      <span class="total" data-total></span>
    </div>`;
  const q = (sel) => host.querySelector(sel);

  function render() {
    const { win } = QW_SETS[state.set];
    const counts = new Map();
    win.forEach((v) => counts.set(v, (counts.get(v) || 0) + 1));
    const ranked = Array.from(counts, ([v, c]) => ({ v, c })).sort((a, b) => cmp(b, a));
    const x = Math.min(state.x, ranked.length);
    const kept = ranked.slice(0, x);
    const keptValues = new Set(kept.map((e) => e.v));
    const sum = kept.reduce((s, e) => s + e.v * e.c, 0);

    // kept = counted in the x-sum · cut = dropped
    q('[data-arr]').innerHTML = win.map((v) => `<div class="cell ${keptValues.has(v) ? 'kept' : 'cut'}"><span>${v}</span></div>`).join('');
    q('[data-rank]').innerHTML = ranked.map((e, i) =>
      (i === x && i > 0 ? `<span class="cutline">${pick(L.cutKeep(x))}</span>` : '') + cardHTML(e, i < x ? '' : 'dropped')).join('');

    // name the first tie the ranking had to settle
    let tie = '';
    for (let i = 1; i < ranked.length; i++) {
      if (ranked[i].c === ranked[i - 1].c) { tie = pick(L.qTie(ranked[i - 1].v, ranked[i].v, ranked[i].c, i === x)); break; }
    }
    q('[data-line]').innerHTML = tie;
    // the ledger is a formula, as it always was
    q('[data-expr]').innerHTML = kept.length ? kept.map((e) => `${e.v}×${e.c}`).join('  +  ') : pick(L.qNothing);
    q('[data-total]').innerHTML = `${sum}<small>X-SUM</small>`;

    q('[data-lbl]').textContent = pick(L.keepX);
    const slider = q('#qw-x');
    slider.max = String(Math.max(1, counts.size));
    slider.value = String(x);
    q('[data-out]').textContent = String(x);
    q('[data-presets]').innerHTML = presetChips(QW_SETS, state.set);
    widgetLabel(pick(L.valuesDistinct(win.length, counts.size)));
  }

  host.addEventListener('input', (ev) => {
    if (ev.target.id !== 'qw-x') return;
    state.x = Number(ev.target.value); render();
  });
  host.addEventListener('click', (ev) => {
    const chip = ev.target.closest('[data-set]');
    if (!chip) return;
    state.set = Number(chip.dataset.set);
    state.x = Math.min(2, new Set(QW_SETS[state.set].win).size);
    render();
  });
  onLangChange(render);
  render();
}

/* ---------------- the approach, in brief ---------------- */

const APPROACH = {
  brute: {
    idea: t('Each window stands alone: count its values, rank them by (count, value), keep the top x and add up their occurrences.',
            'window တစ်ခုစီကို သီးခြားစီ ဆောင်ရွက်သည် — ၎င်း၏ value များကို ရေတွက်၊ (count, value) ဖြင့် အဆင့်ခွဲ၊ ထိပ်ဆုံး x ခုကို ထားပြီး ၎င်းတို့ ပေါ်သည့် အကြိမ်များကို ပေါင်းသည်။'),
    steps: [
      t('Take each window of <code>k</code> elements in turn.', 'element <code>k</code> ခုပါ window တစ်ခုစီကို အစဉ်လိုက် ယူသည်။'),
      t('Tally it: how many times each value appears.', 'tally လုပ်သည် — value တစ်ခုစီ ပေါ်သည့် အကြိမ်ကို ရေတွက်သည်။'),
      t('Rank by <code>[count, value]</code>, highest first — a bigger value wins a tie — and keep the first <code>x</code>.', '<code>[count, value]</code> ဖြင့် အမြင့်ဆုံးမှ စီသည် — သရေဖြစ်လျှင် value ကြီးသည့်ဘက် နိုင်သည် — ပထမ <code>x</code> ခုကို ထားသည်။'),
      t('Add up <code>value × count</code> over the kept ones; then throw it all away for the next window.', 'ထားသည့်အရာများ၏ <code>value × count</code> ကို ပေါင်းပြီး နောက် window အတွက် အားလုံးကို စွန့်သည်။'),
    ],
    cost: t('every window is recounted from scratch: about 5 × 10⁹ element visits at 3321\'s n = 10⁵, k = 5 × 10⁴ — computed, not timed.',
            'window တိုင်းကို အစမှ ပြန်ရေတွက်သည် — 3321 ၏ n = 10⁵၊ k = 5 × 10⁴ တွင် element ကြည့်ခြင်း 5 × 10⁹ ခန့် — တွက်ချက်ထားခြင်း၊ အချိန်မတိုင်းထားပါ။'),
  },
  sorted: {
    idea: t('Consecutive windows share all but two elements, so keep the answer instead of recomputing it: TOP holds the x strongest (count, value) entries, REST the rest, and a running sum tracks TOP.',
            'ဆက်တိုက် window များသည် element နှစ်ခုမှလွဲ၍ အားလုံး တူသဖြင့် အဖြေကို ပြန်မတွက်ဘဲ ထိန်းထားသည် — TOP တွင် အားအကောင်းဆုံး (count, value) entry x ခု၊ REST တွင် ကျန်အရာများ ထားပြီး running sum က TOP ကို မှတ်ထားသည်။'),
    steps: [
      t('When a value enters or leaves, lift its old <code>[count, value]</code> card off its shelf first — its position is its count.', 'value တစ်ခု ဝင်သည် သို့မဟုတ် ထွက်သည့်အခါ ၎င်း၏ <code>[count, value]</code> ကတ်ဟောင်းကို စင်ပေါ်မှ အရင် ဆွဲထုတ်သည် — ၎င်း၏ နေရာသည် count ပင် ဖြစ်သည်။'),
      t('Update the count and put the new card at the bottom of REST.', 'count ကို ပြင်ပြီး ကတ်အသစ်ကို REST ၏ အောက်ဆုံးတွင် ထည့်သည်။'),
      t('<code>rebalance</code>: fill TOP up to <code>x</code>, then swap while REST\'s best outranks TOP\'s weakest, adjusting the sum.', '<code>rebalance</code> — TOP ကို <code>x</code> အထိ ဖြည့်ပြီး REST ၏ အကောင်းဆုံးက TOP ၏ အားအနည်းဆုံးထက် မြင့်နေသမျှ နေရာလဲ၍ sum ကို ပြင်သည်။'),
      t('Once the window is full, record the sum.', 'window ပြည့်သည်နှင့် sum ကို မှတ်သည်။'),
    ],
    cost: t('finding a card\'s slot is O(log k), but inserting into a sorted array shifts up to k entries — fine for 3318, the trap on 3321.',
            'ကတ်တစ်ခု၏ နေရာရှာခြင်းမှာ O(log k) ဖြစ်သော်လည်း sorted array ထဲ ထည့်ခြင်းက entry k ခုအထိ ရွှေ့ရသည် — 3318 အတွက် လုံလောက်ပြီး 3321 တွင် ထောင်ချောက် ဖြစ်သည်။'),
  },
  heap: {
    idea: t('The same two shelves and the same running sum, held in heaps. Only a root is ever read, so nothing is removed on update: an entry that no longer matches its count goes stale and is thrown away when it surfaces.',
            'စင်နှစ်ခု အတူတူနှင့် running sum အတူတူကို heap ထဲတွင် ထားသည်။ root ကိုသာ ဖတ်သဖြင့် update လုပ်ချိန် ဘာမျှ မဖယ်ပါ — count နှင့် မကိုက်တော့သော entry သည် stale ဖြစ်ပြီး အပေါ်ရောက်လာမှ ပစ်သည်။'),
    steps: [
      t('When a value\'s count changes, take it out of the TOP set and the sum — but leave its heap entry where it is.', 'value ၏ count ပြောင်းသည့်အခါ TOP အစုနှင့် sum ထဲမှ ထုတ်သည် — သို့သော် ၎င်း၏ heap entry ကို ရှိရာတွင် ထားခဲ့သည်။'),
      t('Push a fresh <code>(count, value)</code> entry into REST.', 'entry <code>(count, value)</code> အသစ်ကို REST ထဲ push လုပ်သည်။'),
      t('Before reading a root, discard it while it is stale — its count moved on, or it changed sides.', 'root ကို မဖတ်မီ stale ဖြစ်နေသမျှ ပစ်သည် — count ပြောင်းသွားပြီ၊ သို့မဟုတ် ဘက်ပြောင်းသွားပြီ။'),
      t('Fill TOP to <code>x</code>, then swap the two live roots while REST\'s beats TOP\'s; record the sum once the window is full.', 'TOP ကို <code>x</code> အထိ ဖြည့်ပြီး REST ၏ live root က TOP ၏ ထက် သာနေသမျှ နေရာလဲသည် — window ပြည့်သည်နှင့် sum ကို မှတ်သည်။'),
    ],
    cost: t('O(log n) per update and nothing shifted: at 3321\'s size it ran in 0.05–0.12 s here against 0.22–1.86 s for the sorted arrays.',
            'update တစ်ခုလျှင် O(log n) နှင့် ဘာမျှ မရွှေ့ရ — 3321 ၏ အရွယ်တွင် ဤနေရာ၌ 0.05–0.12 s ကြာပြီး sorted array ဖြင့် 0.22–1.86 s ကြာသည်။'),
  },
};

/* ---------------- mount ----------------
 *
 * Last in the file on purpose: mountLesson runs the widget immediately, so
 * every const the widget reads must already be initialised. */

mountLesson({
  input: { nums: [1, 1, 2, 2, 3, 4, 2, 3], k: 6, x: 2 },
  controls: [
    { key: 'nums', label: 'nums', value: '1, 1, 2, 2, 3, 4, 2, 3', parse: intList({ max: MAX_N, lo: 1 }), format: listText },
    { key: 'k', label: t('k — window', 'k — window အရွယ်'), type: 'number', value: 6, min: 1, parse: intValue({ lo: 1 }) },
    { key: 'x', label: t('x — keep', 'x — ထားမည့်အရေအတွက်'), type: 'number', value: 2, min: 1, parse: intValue({ lo: 1 }) },
  ],
  presets: [
    { label: exampleTitle(1), input: { nums: [1, 1, 2, 2, 3, 4, 2, 3], k: 6, x: 2 } },
    { label: exampleTitle(2), input: { nums: [3, 8, 7, 8, 7, 5], k: 2, x: 2 } },
    { label: t('Tie storm', 'သရေ များသော ဥပမာ'), input: { nums: [5, 5, 4, 4, 3, 3, 5, 4, 3], k: 5, x: 2 } },
    { label: t('Single keeper', 'တစ်ခုတည်းသာ ထားမည်'), input: { nums: [6, 2, 2, 9, 9, 9, 6, 2, 6, 9], k: 4, x: 1 } },
  ],
  examples: [
    { title: exampleTitle(1), inputHtml: '<code>nums = [1,1,2,2,3,4,2,3]</code>, <code>k = 6</code>, <code>x = 2</code>', output: '[6,10,12]',
      why: [t('<code>[1,1,2,2,3,4]</code> keeps 1 and 2 → 1+1+2+2 = <b>6</b>', '<code>[1,1,2,2,3,4]</code> တွင် 1 နှင့် 2 ကျန်သည် → 1+1+2+2 = <b>6</b>'),
            t('<code>[1,2,2,3,4,2]</code> keeps 2 and 4 → 2+2+2+4 = <b>10</b>. 4 survives because it beats 3 and 1, which occur the same number of times.',
              '<code>[1,2,2,3,4,2]</code> တွင် 2 နှင့် 4 ကျန်သည် → 2+2+2+4 = <b>10</b>။ 3 နှင့် 1 တို့သည် အကြိမ်ရေတူညီသောကြောင့် တန်ဖိုးပိုကြီးသည့် 4 က ကျန်ရစ်သည်။'),
            t('<code>[2,2,3,4,2,3]</code> keeps 2 and 3 → 2+2+2+3+3 = <b>12</b>', '<code>[2,2,3,4,2,3]</code> တွင် 2 နှင့် 3 ကျန်သည် → 2+2+2+3+3 = <b>12</b>')],
      load: { nums: [1, 1, 2, 2, 3, 4, 2, 3], k: 6, x: 2 } },
    { title: exampleTitle(2), inputHtml: '<code>nums = [3,8,7,8,7,5]</code>, <code>k = 2</code>, <code>x = 2</code>', output: '[11,15,15,15,12]',
      why: [t('Here <code>k == x</code>, so a window can never hold more than <code>x</code> distinct values and nothing is ever dropped.',
              'ဤတွင် <code>k == x</code> ဖြစ်သောကြောင့် window တစ်ခုတွင် ကွဲပြားသောတန်ဖိုး <code>x</code> ခုထက် ဘယ်တော့မှ မပိုနိုင်ဘဲ ဘာမှလည်း မဖယ်ရပါ။'),
            t('Every answer is just the sum of the window: 3+8, 8+7, 7+8, 8+7, 7+5.', 'အဖြေတိုင်းသည် window ၏ ပေါင်းလဒ်သာ ဖြစ်သည် — 3+8, 8+7, 7+8, 8+7, 7+5။'),
            t('A good sanity check — if your code disagrees here, the "fewer than x distinct" rule is wrong.',
              'စစ်ဆေးရန် ကောင်းသော ဥပမာ — ဤနေရာတွင် သင့် code မကိုက်ပါက "x ထက်နည်းသော ကွဲပြားတန်ဖိုး" စည်းမျဉ်းကို မှားနေခြင်းဖြစ်သည်။')],
      load: { nums: [3, 8, 7, 8, 7, 5], k: 2, x: 2 } },
  ],
  modes: [
    { id: 'brute', name: 'Brute force',
      desc: t('Recount every window from scratch.', 'window တိုင်းကို အစမှ ပြန်ရေတွက်သည်။'),
      cost: 'O(k + d log d) per window', build: buildBrute },
    { id: 'sorted', name: 'Sliding window', sub: t('sorted arrays', 'sorted array'),
      desc: t('Shelves kept in order. The clear version, fine for 3318.', 'စင်များကို အစဉ်လိုက် စီထားသည်။ နားလည်ရလွယ်ပြီး 3318 အတွက် လုံလောက်သည်။'),
      cost: 'O(log k) find + O(k) shift per update', build: buildSorted },
    { id: 'heap', name: 'Sliding window', sub: t('lazy heaps', 'lazy heap'),
      desc: t('The version that passes 3321. Watch stale entries pile up.', '3321 ကို အောင်မြင်စေသော ပုံစံ။ stale entry များ စုပုံလာပုံကို ကြည့်ပါ။'),
      cost: 'O(log n) per update', build: buildHeap },
  ],
  languages: LANGUAGES,
  code: CODE,
  solutions: {
    brute: { approach: APPROACH.brute, tag: '3318',
      desc: t('The whole Easy answer: tally, rank, sum, for every window. Too slow for 3321, where every window is up to 5 × 10⁴ long.',
              'Easy ၏ အဖြေ အပြည့်အစုံ — window တိုင်းအတွက် tally၊ အဆင့်ခွဲ၊ ပေါင်း။ window တစ်ခု 5 × 10⁴ အထိ ရှည်နိုင်သော 3321 အတွက် နှေးလွန်းသည်။') },
    sorted: { approach: APPROACH.sorted, tag: '3318',
      desc: t('The two shelves as sorted arrays — exactly what the stage draws. Readable, and fast enough for n ≤ 50.',
              'စင်နှစ်ခုကို sorted array ဖြင့် — stage က ပုံဖော်ထားသည့်အတိုင်း အတိအကျ။ ဖတ်ရလွယ်ပြီး n ≤ 50 အတွက် လုံလောက်စွာ မြန်သည်။') },
    heap: { approach: APPROACH.heap, tag: '3321',
      desc: t('The submission for 3321: the same invariants, with heaps that never shift anything.',
              '3321 အတွက် submission — invariant အတူတူ၊ ဘာမျှ မရွှေ့ရသော heap များဖြင့်။') },
  },
  // How each language was actually checked, printed as the part 3 badges.
  // verify/x-sum/spec.py: 20,006 cases at 3318's limits for every approach,
  // plus 3,002 beyond them (values to 10⁹, two at n = 10⁵) for the heaps —
  // against a separate count-and-sort oracle. Go and Rust ran in Docker.
  verification: {
    ruby: { brute: 'ran here · 20,006 cases', sorted: 'ran here · 20,006 cases', heap: 'ran here · 23,008 cases to n = 10⁵' },
    python: { brute: 'ran here · 20,006 cases', sorted: 'ran here · 20,006 cases', heap: 'ran here · 23,008 cases to n = 10⁵' },
    javascript: { brute: 'ran here · 20,006 cases', sorted: 'ran here · 20,006 cases', heap: 'ran here · 23,008 cases to n = 10⁵' },
    go: { brute: 'ran here · 20,006 cases · Go 1.23', sorted: 'ran here · 20,006 cases · Go 1.23', heap: 'ran here · 23,008 cases · Go 1.23' },
    rust: { brute: 'ran here · 20,006 cases · rustc 1.98', sorted: 'ran here · 20,006 cases · rustc 1.98', heap: 'ran here · 23,008 cases · rustc 1.98' },
  },
  // Per-language notes, shown under the live code.
  caveats: {
    brute: {
      ruby: t('<code>max_by(x)</code> takes the top x directly, and returns everything when there are fewer than x distinct values. <code>Array#&lt;=&gt;</code> compares <code>[count, value]</code> element by element, so the tiebreak costs no code.',
              '<code>max_by(x)</code> က ထိပ်ဆုံး x ခုကို တိုက်ရိုက်ယူပြီး ကွဲပြားတန်ဖိုး x ထက်နည်းပါက အားလုံးကို ပြန်ပေးသည်။ <code>Array#&lt;=&gt;</code> သည် <code>[count, value]</code> ကို တစ်ခုချင်း နှိုင်းယှဉ်သဖြင့် သရေဖြေရှင်းရန် code ပိုမလိုပါ။'),
      python: t('<code>Counter</code> plus a sort keyed on <code>(count, value)</code> with <code>reverse=True</code> — the tuple carries the tiebreak.',
                '<code>Counter</code> နှင့်အတူ <code>(count, value)</code> ကို key ထားပြီး <code>reverse=True</code> ဖြင့် စီသည် — tuple ကိုယ်တိုင်က သရေကို ဖြေရှင်းသည်။'),
      javascript: t('A <code>Map</code> tally, then a two-level comparator written out: JavaScript has no tuple ordering, and <code>sort</code> would compare as strings.',
                    '<code>Map</code> ဖြင့် ရေတွက်ပြီး နှစ်ဆင့် comparator ကို ရေးထားသည် — JavaScript တွင် tuple ordering မရှိဘဲ <code>sort</code> က string အဖြစ် နှိုင်းယှဉ်မည်။'),
      go: t('<code>sort.Slice</code> with the two-level comparison written out — Go has no tuple ordering for structs.',
            '<code>sort.Slice</code> ဖြင့် နှစ်ဆင့် နှိုင်းယှဉ်မှုကို ရေးထားသည် — Go တွင် struct အတွက် tuple ordering မရှိပါ။'),
      rust: t('<code>windows(k)</code> plus tuple <code>Ord</code>: <code>(count, value)</code> sorted descending is the ranking rule with no comparator. Returns <code>Vec&lt;i32&gt;</code>, right for 3318 and an overflow on 3321.',
              '<code>windows(k)</code> နှင့် tuple <code>Ord</code> — <code>(count, value)</code> ကို ကြီးစဉ်ငယ်လိုက် စီရုံဖြင့် comparator မလိုပါ။ <code>Vec&lt;i32&gt;</code> ပြန်ပေးပြီး 3318 အတွက် မှန်သော်လည်း 3321 တွင် ကျော်လွန်မည်။'),
    },
    sorted: {
      ruby: t('<code>bsearch_index</code> finds the slot and <code>Array#insert</code> opens it — that insert is the shift that sinks 3321.',
              '<code>bsearch_index</code> က နေရာကို ရှာပြီး <code>Array#insert</code> က နေရာဖွင့်ပေးသည် — ထို insert သည် 3321 ကို ကျရှုံးစေသော ရွှေ့ခြင်း ဖြစ်သည်။'),
      python: t('<code>bisect.insort</code> keeps both shelves ordered; <code>bisect_left</code> finds the stale entry to lift out.',
                '<code>bisect.insort</code> က စင်နှစ်ခုလုံးကို အစဉ်လိုက် ထိန်းထားသည်။ ဆွဲထုတ်ရမည့် stale entry ကို <code>bisect_left</code> ဖြင့် ရှာသည်။'),
      javascript: t('Binary search plus <code>splice</code> — JavaScript has no sorted container, so the shelves are plain arrays.',
                    'binary search နှင့် <code>splice</code> — JavaScript တွင် sorted container မရှိသဖြင့် စင်များမှာ array သက်သက် ဖြစ်သည်။'),
      go: t('<code>sort.Search</code> finds the slot, <code>copy</code> opens the gap. Returns <code>[]int</code> for 3318.',
            '<code>sort.Search</code> က နေရာကို ရှာပြီး <code>copy</code> က နေရာလွတ် ဖန်တီးပေးသည်။ 3318 အတွက် <code>[]int</code> ပြန်ပေးသည်။'),
      rust: t('<code>Vec::binary_search</code> returns <code>Err(at)</code> on a miss — exactly the insertion index.',
              '<code>Vec::binary_search</code> က မတွေ့ပါက <code>Err(at)</code> ပြန်ပေးသည် — ထည့်သွင်းရမည့် index အတိအကျပင်။'),
    },
    heap: {
      ruby: t('Keys pack <code>(count &lt;&lt; 30) | value</code> into one Integer, so integer order is the ranking rule; REST stores them negated to act as a max-heap.',
              'key များကို <code>(count &lt;&lt; 30) | value</code> အဖြစ် Integer တစ်ခုတည်းထဲ ထုပ်သဖြင့် integer အစီအစဉ်သည် အဆင့်သတ်မှတ်ချက် ဖြစ်သည် — REST က max-heap အဖြစ် သုံးရန် အနုတ်ဖြင့် သိမ်းသည်။'),
      python: t('<code>heapq</code> is a min-heap, so REST stores negated keys.', '<code>heapq</code> သည် min-heap ဖြစ်သဖြင့် REST တွင် key များကို အနုတ်လက္ခဏာဖြင့် သိမ်းသည်။'),
      javascript: t('A small binary heap is included — JavaScript has none built in. The packing multiplies: <code>&lt;&lt;</code> is 32-bit and would overflow.',
                    'JavaScript တွင် heap ပါမလာသဖြင့် binary heap လေးတစ်ခု ထည့်ထားသည်။ key ပေါင်းစည်းရာတွင် မြှောက်ခြင်းကို သုံးသည် — <code>&lt;&lt;</code> သည် 32-bit ဖြစ်၍ ကျော်လွန်သွားမည်။'),
      go: t('A hand-rolled <code>int64</code> min-heap rather than <code>container/heap</code>, to stay parallel with the other languages. Returns <code>[]int64</code>, as 3321 requires.',
            'အခြားဘာသာစကားများနှင့် တစ်ပုံစံတည်း ဖြစ်စေရန် <code>container/heap</code> အစား <code>int64</code> min-heap ကို ကိုယ်တိုင် ရေးထားသည်။ 3321 လိုအပ်သည့်အတိုင်း <code>[]int64</code> ပြန်ပေးသည်။'),
      rust: t('<code>BinaryHeap</code> is a max-heap, so TOP wraps its keys in <code>Reverse</code> and REST stores them bare. Returns <code>Vec&lt;i64&gt;</code>: 3321\'s sums need 64 bits.',
              '<code>BinaryHeap</code> သည် max-heap ဖြစ်သဖြင့် TOP က key များကို <code>Reverse</code> ဖြင့် ထုပ်ပြီး REST က အတိုင်းသိမ်းသည်။ <code>Vec&lt;i64&gt;</code> ပြန်ပေးသည် — 3321 ၏ ပေါင်းလဒ်များ 64 bit လိုသည်။'),
    },
  },
  strip,
  draw,
  answer,
  vars,
  hover: HOVER,
  widget: mountRankWidget,
});
