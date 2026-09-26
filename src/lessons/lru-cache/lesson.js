/* LRU Cache — LeetCode 146.
 *
 * A cache of at most `capacity` keys that, when full, drops the key used
 * longest ago — and a get counts as a use. The data needs two things at once:
 * find a key's value by key, and know the order keys were last used in. A
 * hash map alone has no order; a list alone has no fast lookup. The O(1)
 * answer keeps both and links them: the map holds each key's node, and the
 * nodes form a doubly linked list from newest to oldest, so any node can be
 * cut out and moved to the front in a few pointer writes.
 */
import { mountLesson } from '../../lib/stepper.js';
import { pick, onLangChange } from '../../lib/i18n.js';
import { cells, slots, stagePanel, kv, chain, readout } from '../../lib/stage.js';
import { t, exampleTitle, LANGUAGES, k, c, stageRow, stageGap, intValue, presetChips, widgetLabel } from '../../lib/kit.js';

const MAX_OPS = 12;

function parseOps(text) {
  const s = String(text).replace(/\s+/g, '');
  const ops = [];
  let rest = s;
  while (rest) {
    const m = rest.match(/^(?:put\((\d{1,2}),(\d{1,3})\)|get\((\d{1,2})\))(?:,|$)/);
    if (!m) throw new Error('calls like put(1,1), get(1) — keys up to 99, values up to 999');
    ops.push(m[3] != null ? ['get', Number(m[3])] : ['put', Number(m[1]), Number(m[2])]);
    rest = rest.slice(m[0].length);
  }
  if (!ops.length) throw new Error('at least one call');
  if (ops.length > MAX_OPS) throw new Error(`at most ${MAX_OPS} calls, so the stage stays readable`);
  return ops;
}
const opText = (o) => (o[0] === 'put' ? `put(${o[1]},${o[2]})` : `get(${o[1]})`);
const fmtOps = (ops) => ops.map(opText).join(', ');
const shown = (r) => (r === null ? 'null' : String(r));

/* ---------------- step generators ---------------- */

function buildList({ capacity, ops }) {
  const vals = new Map();
  const order = [];
  const results = [];
  const steps = [];
  const snap = (extra) => ({ view: 'list', vals: [...vals], order: [...order], results: [...results], op: null, key: null,
    found: null, gone: null, just: -1, ...extra });
  steps.push(snap({ line: 'init', tag: t('empty', 'ဗလာ'),
    note: t(`An empty cache of capacity ${capacity}: <code>vals</code> maps key → value, and <code>order</code> lists the keys from least to most recently used.`,
            `capacity ${capacity} ရှိ cache ဗလာ — <code>vals</code> သည် key → value ချိတ်ပြီး <code>order</code> သည် key များကို အသုံးပြုချိန် အဟောင်းဆုံးမှ အသစ်ဆုံးသို့ စာရင်းပြုသည်။`) }));

  const touch = (j, key) => {
    const at = order.indexOf(key);
    order.splice(at, 1);
    order.push(key);
    steps.push(snap({ line: 'touch', op: j, key, found: at, tag: t(`scan ${at + 1}`, `${at + 1} ခု scan`),
      note: t(`Find ${key} in order — a scan that looked at ${at + 1} ${at ? 'keys' : 'key'} — cut it out and append it: ${key} is now the most recently used.`,
              `order ထဲ ${key} ကို ရှာသည် — key ${at + 1} ခု ကြည့်ခဲ့သော scan — ဖြတ်ထုတ်ပြီး နောက်ဆုံးတွင် ထည့်သည် — ${key} သည် ယခု အသစ်ဆုံး အသုံးပြုထားသည်။`) }));
  };

  ops.forEach((o, j) => {
    const [kind, key, value] = o;
    const has = vals.has(key);
    steps.push(snap({ line: 'look', op: j, key, tag: t(opText(o), opText(o)),
      note: t(`${opText(o)}: is ${key} in vals? ${has ? 'Yes.' : 'No.'}`, `${opText(o)} — ${key} သည် vals ထဲ ရှိသလား။ ${has ? 'ရှိသည်။' : 'မရှိပါ။'}`) }));
    if (kind === 'get') {
      if (!has) {
        results.push(-1);
        steps.push(snap({ line: 'miss', op: j, key, just: results.length - 1, tag: t('-1', '-1'),
          note: t(`${key} is not cached: return -1. A miss changes nothing.`, `${key} ကို cache မထားပါ — -1 ပြန်သည်။ miss က ဘာမှ မပြောင်းပါ။`) }));
        return;
      }
      touch(j, key);
      results.push(vals.get(key));
      steps.push(snap({ line: 'hit', op: j, key, just: results.length - 1, tag: t(`${vals.get(key)}`, `${vals.get(key)}`),
        note: t(`Return ${vals.get(key)}. Reading ${key} counted as using it, which is why it moved to the end.`,
                `${vals.get(key)} ပြန်သည်။ ${key} ကို ဖတ်ခြင်းသည် အသုံးပြုခြင်းဟု တွက်သဖြင့် နောက်ဆုံးသို့ ရွှေ့ခဲ့သည်။`) }));
      return;
    }
    if (has) touch(j, key);
    else {
      order.push(key);
      steps.push(snap({ line: 'add', op: j, key, tag: t(`new ${key}`, `${key} အသစ်`),
        note: t(`${key} is new: append it to order as the most recently used.`, `${key} သည် အသစ် — အသစ်ဆုံး အသုံးပြုထားသည့်အဖြစ် order ၏ နောက်ဆုံးတွင် ထည့်သည်။`) }));
    }
    vals.set(key, value);
    steps.push(snap({ line: 'set', op: j, key, tag: t(`${key} = ${value}`, `${key} = ${value}`),
      note: t(`vals[${key}] = ${value}.`, `vals[${key}] = ${value}။`) }));
    if (order.length > capacity) {
      const old = order[0];
      steps.push(snap({ line: 'full', op: j, key, found: 0, tag: t('over capacity', 'capacity ကျော်'),
        note: t(`${order.length} keys, capacity ${capacity}: one too many. The least recently used is the first in order, ${old}.`,
                `key ${order.length} ခု၊ capacity ${capacity} — တစ်ခု ပိုနေသည်။ အဟောင်းဆုံး အသုံးပြုထားသည်မှာ order ၏ ပထမ ${old}။`) }));
      order.shift();
      vals.delete(old);
      results.push(null);
      steps.push(snap({ line: 'evict', op: j, key, gone: old, just: results.length - 1, tag: t(`evict ${old}`, `${old} ဖယ်`),
        note: t(`Evict ${old}: drop it from the front of order and from vals.`, `${old} ကို ဖယ်သည် — order ၏ ရှေ့မှနှင့် vals မှ ဖယ်ထုတ်သည်။`) }));
    } else {
      results.push(null);
      steps.push(snap({ line: 'full', op: j, key, just: results.length - 1, tag: t('fits', 'ဆံ့'),
        note: t(`${order.length} of ${capacity} keys: nothing to evict.`, `key ${capacity} ခုအနက် ${order.length} — ဖယ်စရာ မရှိ။`) }));
    }
  });
  steps[steps.length - 1] = { ...steps.at(-1), finished: true };
  return steps;
}

function buildLinked({ capacity, ops }) {
  const vals = new Map();       // key → the value in its node
  let list = [];                // keys, from head (newest) to tail (oldest)
  const results = [];
  const steps = [];
  const snap = (extra) => ({ view: 'linked', vals: [...vals], list: [...list], results: [...results], op: null, key: null,
    loose: null, lru: null, just: -1, ...extra });
  steps.push(snap({ line: 'init', tag: t('empty', 'ဗလာ'),
    note: t(`An empty cache of capacity ${capacity}: <code>nodes</code> maps key → node, and two sentinel nodes, head and tail, start the list. The newest node will sit just after head, the oldest just before tail.`,
            `capacity ${capacity} ရှိ cache ဗလာ — <code>nodes</code> သည် key → node ချိတ်ပြီး sentinel node နှစ်ခု head နှင့် tail က list ကို စသည်။ အသစ်ဆုံး node သည် head နောက်တွင်၊ အဟောင်းဆုံးသည် tail ရှေ့တွင် ရှိမည်။`) }));

  const unlink = (j, key, extra = {}) => {
    list = list.filter((x) => x !== key);
    steps.push(snap({ line: 'unlink', op: j, key, loose: key, tag: t(`cut ${key} out`, `${key} ဖြတ်ထုတ်`),
      note: t(`Unlink node ${key}: its neighbours now point at each other. Two pointer writes, wherever in the list it was.`,
              `node ${key} ကို unlink — ၎င်း၏ အိမ်နီးများ ယခု တစ်ခုကို တစ်ခု ညွှန်သည်။ list ထဲ ဘယ်နေရာမှာပဲ ရှိရှိ pointer ရေးခြင်း နှစ်ကြိမ်။`), ...extra }));
  };
  const front = (j, key) => {
    list = [key, ...list];
    steps.push(snap({ line: 'front', op: j, key, tag: t(`${key} to front`, `${key} ရှေ့ဆုံးသို့`),
      note: t(`Splice node ${key} in just after head: it is now the most recently used. Four pointer writes.`,
              `node ${key} ကို head နောက်တွင် ထည့်သည် — ယခု အသစ်ဆုံး အသုံးပြုထားသည်။ pointer ရေးခြင်း လေးကြိမ်။`) }));
  };

  ops.forEach((o, j) => {
    const [kind, key, value] = o;
    const has = vals.has(key);
    steps.push(snap({ line: 'look', op: j, key, tag: t(opText(o), opText(o)),
      note: t(`${opText(o)}: look ${key} up in nodes — one hash lookup. ${has ? `Found its node.` : 'No node.'}`,
              `${opText(o)} — nodes ထဲ ${key} ကို ရှာသည် — hash lookup တစ်ကြိမ်။ ${has ? 'node တွေ့သည်။' : 'node မရှိ။'}`) }));
    if (kind === 'get') {
      if (!has) {
        results.push(-1);
        steps.push(snap({ line: 'miss', op: j, key, just: results.length - 1, tag: t('-1', '-1'),
          note: t(`${key} is not cached: return -1.`, `${key} ကို cache မထားပါ — -1 ပြန်သည်။`) }));
        return;
      }
      unlink(j, key);
      front(j, key);
      results.push(vals.get(key));
      steps.push(snap({ line: 'hit', op: j, key, just: results.length - 1, tag: t(`${vals.get(key)}`, `${vals.get(key)}`),
        note: t(`Return node.val, ${vals.get(key)}.`, `node.val — ${vals.get(key)} — ကို ပြန်သည်။`) }));
      return;
    }
    if (has) {
      vals.set(key, value);
      steps.push(snap({ line: 'update', op: j, key, tag: t(`${key} = ${value}`, `${key} = ${value}`),
        note: t(`${key} is cached: overwrite its value with ${value}. Writing it is a use too, so it moves to the front.`,
                `${key} ကို cache ထားပြီး — value ကို ${value} ဖြင့် အစားထိုးသည်။ ရေးခြင်းလည်း အသုံးပြုခြင်း ဖြစ်သဖြင့် ရှေ့ဆုံးသို့ ရွှေ့သည်။`) }));
      unlink(j, key);
    } else {
      vals.set(key, value);
      steps.push(snap({ line: 'add', op: j, key, loose: key, tag: t(`new ${key}`, `${key} အသစ်`),
        note: t(`${key} is new: make a node ${key}:${value} and record it in nodes.`, `${key} သည် အသစ် — node ${key}:${value} လုပ်ပြီး nodes ထဲ မှတ်သည်။`) }));
    }
    front(j, key);
    if (vals.size > capacity) {
      const lru = list.at(-1);
      steps.push(snap({ line: 'full', op: j, key, lru, tag: t('over capacity', 'capacity ကျော်'),
        note: t(`${vals.size} nodes, capacity ${capacity}: one too many.`, `node ${vals.size} ခု၊ capacity ${capacity} — တစ်ခု ပိုနေသည်။`) }));
      steps.push(snap({ line: 'evict', op: j, key, lru, tag: t(`lru = ${lru}`, `lru = ${lru}`),
        note: t(`The least recently used node is the one just before tail: ${lru}. No search — it is always there.`,
                `အဟောင်းဆုံး အသုံးပြုထားသော node သည် tail ရှေ့ရှိ node — ${lru}။ ရှာစရာ မလို — အမြဲ ထိုနေရာတွင် ရှိသည်။`) }));
      unlink(j, lru, { key: lru });
      vals.delete(lru);
      results.push(null);
      steps.push(snap({ line: 'evict', op: j, key, just: results.length - 1, gone: lru, tag: t(`evict ${lru}`, `${lru} ဖယ်`),
        note: t(`Delete ${lru} from nodes too. The node carries its own key for exactly this moment.`,
                `${lru} ကို nodes မှလည်း ဖျက်သည်။ node သည် ဤအချိန်အတွက်ပင် ၎င်း၏ key ကို သယ်ထားသည်။`) }));
    } else {
      results.push(null);
      steps.push(snap({ line: 'full', op: j, key, just: results.length - 1, tag: t('fits', 'ဆံ့'),
        note: t(`${vals.size} of ${capacity} nodes: nothing to evict.`, `node ${capacity} ခုအနက် ${vals.size} — ဖယ်စရာ မရှိ။`) }));
    }
  });
  steps[steps.length - 1] = { ...steps.at(-1), finished: true };
  return steps;
}

/* ---------------- drawing ----------------
 *
 * The strip card is the sequence of calls, the one in progress lit. The stage
 * is the cache's two structures side by side: for the list version the map
 * and the recency list it scans; for the O(1) version the map of nodes and
 * the linked list itself, head to tail, with a node that is cut out drawn
 * loose until it is spliced back in. */

function strip(s, { ops }) {
  return cells(ops.map((o) => (o[0] === 'put' ? `put ${o[1]},${o[2]}` : `get ${o[1]}`)), {
    wide: true,
    tone: Object.fromEntries(ops.map((_, j) => [j, j === s.op ? 'inwin' : s.op != null && j < s.op ? 'done' : s.finished ? 'done' : null]).filter(([, x]) => x)),
  });
}

function draw(s, { capacity }) {
  const map = Object.fromEntries(s.vals.map(([k, v]) => [k, s.view === 'list' ? v : `node ${k}:${v}`]));
  const tone = {};
  if (s.key != null && map[s.key] != null) tone[s.key] = 'warn';
  if (s.view === 'list') {
    const order = cells(s.order, {
      index: false,
      tone: Object.fromEntries(s.order.map((k, i) => [i, s.line === 'touch' && i === s.order.length - 1 ? 'entering' : s.line === 'full' && i === 0 ? 'leaving' : s.line === 'add' && i === s.order.length - 1 ? 'entering' : null]).filter(([, x]) => x)),
    });
    return stagePanel(pick(t('vals', 'vals')), pick(t(`${s.vals.length} of ${capacity}`, `${capacity} အနက် ${s.vals.length}`)),
      kv(map, { keyName: 'key', valName: 'value', tone, at: s.key != null ? String(s.key) : undefined }))
      + stageGap + stagePanel(pick(t('order — least recently used first', 'order — အဟောင်းဆုံး အရင်')),
        s.found != null && s.line === 'touch' ? pick(t(`scanned ${s.found + 1}`, `${s.found + 1} ခု scan`)) : '',
        stageRow(order, pick(t('empty', 'ဗလာ'))))
      + (s.gone != null ? stageGap + readout({ [pick(t('evicted', 'ဖယ်ပြီး'))]: s.gone }) : '');
  }
  const val = Object.fromEntries(s.vals);
  const nodes = [{ value: 'head' }, ...s.list.map((k) => ({ value: `${k}:${val[k] ?? ''}` })), { value: 'tail' }];
  const ctone = {};
  s.list.forEach((k, i) => {
    if (k === s.lru) ctone[i + 1] = 'down';
    else if (k === s.key && s.line === 'front') ctone[i + 1] = 'up';
    else if (k === s.key) ctone[i + 1] = 'warn';
  });
  const loose = s.loose != null && !s.list.includes(s.loose)
    ? stageGap + readout({ [pick(t('cut out, waiting', 'ဖြတ်ထုတ်ထား၊ စောင့်'))]: `node ${s.loose}:${val[s.loose] ?? ''}` }) : '';
  return stagePanel(pick(t('nodes', 'nodes')), pick(t(`${s.vals.length} of ${capacity}`, `${capacity} အနက် ${s.vals.length}`)),
    kv(map, { keyName: 'key', valName: 'node', tone, at: s.key != null ? String(s.key) : undefined }))
    + stageGap + stagePanel(pick(t('The list — newest after head', 'List — head နောက်တွင် အသစ်ဆုံး')), '',
      chain(nodes, { tone: ctone, nullTail: false }))
    + loose
    + (s.gone != null ? stageGap + readout({ [pick(t('evicted', 'ဖယ်ပြီး'))]: s.gone }) : '');
}

function answer(s, { ops }) {
  return {
    html: slots(s.results.map(shown), { total: ops.length, just: s.just }),
    note: t('what each call returns', 'call တစ်ခုစီ ပြန်ပေးသည့်အရာ'),
  };
}

function vars(s, { capacity, ops }) {
  const out = [['capacity', capacity], ['cap', capacity]];
  const o = s.op != null ? ops[s.op] : null;
  if (o) { out.push(['key', o[1]]); if (o[0] === 'put') out.push(['value', o[2]]); }
  const vmap = `{${s.vals.map(([k, v]) => `${k}: ${v}`).join(', ')}}`;
  if (s.view === 'list') {
    out.push(['vals', vmap], ['order', `[${s.order.join(', ')}]`]);
  } else {
    out.push(['nodes', vmap], ['head', s.list.length ? `→ ${s.list[0]}` : '→ tail'], ['tail', s.list.length ? `← ${s.list.at(-1)}` : '← head']);
    if (s.key != null && s.vals.some(([k]) => k === s.key)) out.push(['node', `${s.key}:${Object.fromEntries(s.vals)[s.key]}`]);
    if (s.lru != null) out.push(['lru', s.lru]);
  }
  return out;
}

/* ---------------- the code, one key per line ----------------
 *
 * Generated from the verified solution files, so the listing a reader copies
 * is byte-identical to the one that ran. */

const CODE = {
  list: {
    ruby: [
      [null, `class LRUCache`],
      [null, `  ${k('def')} initialize(capacity)`],
      [null, `    @cap = capacity`],
      ['init', `    @vals = {}`],
      ['init', `    @order = [] ${c('# keys, least recently used first')}`],
      [null, `  ${k('end')}`],
      [null, ``],
      [null, `  ${k('def')} get(key)`],
      ['look', `    ${k('unless')} @vals.key?(key)`],
      ['miss', `      ${k('return')} -1`],
      [null, `    ${k('end')}`],
      [null, `    touch(key)`],
      ['hit', `    @vals[key]`],
      [null, `  ${k('end')}`],
      [null, ``],
      [null, `  ${k('def')} put(key, value)`],
      ['look', `    ${k('if')} @vals.key?(key)`],
      [null, `      touch(key)`],
      [null, `    ${k('else')}`],
      ['add', `      @order &lt;&lt; key`],
      [null, `    ${k('end')}`],
      ['set', `    @vals[key] = value`],
      ['full', `    ${k('return')} ${k('unless')} @order.size &gt; @cap`],
      ['evict', `    @vals.delete(@order.shift)`],
      [null, `  ${k('end')}`],
      [null, ``],
      [null, `  private`],
      [null, ``],
      [null, `  ${k('def')} touch(key)`],
      ['touch', `    @order.delete(key) ${c('# a scan of up to capacity keys')}`],
      ['touch', `    @order &lt;&lt; key`],
      [null, `  ${k('end')}`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('class')} LRUCache:`],
      [null, `    ${k('def')} __init__(self, capacity):`],
      [null, `        self.cap = capacity`],
      ['init', `        self.vals = {}`],
      ['init', `        self.order = []                   ${c('# keys, least recently used first')}`],
      [null, ``],
      [null, `    ${k('def')} touch(self, key):`],
      ['touch', `        self.order.remove(key)            ${c('# a scan of up to capacity keys')}`],
      ['touch', `        self.order.append(key)`],
      [null, ``],
      [null, `    ${k('def')} get(self, key):`],
      ['look', `        ${k('if')} key ${k('not')} ${k('in')} self.vals:`],
      ['miss', `            ${k('return')} -1`],
      [null, `        self.touch(key)`],
      ['hit', `        ${k('return')} self.vals[key]`],
      [null, ``],
      [null, `    ${k('def')} put(self, key, value):`],
      ['look', `        ${k('if')} key ${k('in')} self.vals:`],
      [null, `            self.touch(key)`],
      [null, `        ${k('else')}:`],
      ['add', `            self.order.append(key)`],
      ['set', `        self.vals[key] = value`],
      ['full', `        ${k('if')} len(self.order) &gt; self.cap:`],
      ['evict', `            del self.vals[self.order.pop(0)]`],
    ],
    javascript: [
      [null, `class LRUCache {`],
      [null, `  constructor(capacity) {`],
      [null, `    this.cap = capacity;`],
      ['init', `    this.vals = ${k('new')} Map();`],
      ['init', `    this.order = []; ${c('// keys, least recently used first')}`],
      [null, `  }`],
      [null, ``],
      [null, `  touch(key) {`],
      ['touch', `    this.order.splice(this.order.indexOf(key), 1); ${c('// a scan of up to capacity keys')}`],
      ['touch', `    this.order.push(key);`],
      [null, `  }`],
      [null, ``],
      [null, `  get(key) {`],
      ['look', `    ${k('if')} (!this.vals.has(key)) {`],
      ['miss', `      ${k('return')} -1;`],
      [null, `    }`],
      [null, `    this.touch(key);`],
      ['hit', `    ${k('return')} this.vals.get(key);`],
      [null, `  }`],
      [null, ``],
      [null, `  put(key, value) {`],
      ['look', `    ${k('if')} (this.vals.has(key)) {`],
      [null, `      this.touch(key);`],
      [null, `    } ${k('else')} {`],
      ['add', `      this.order.push(key);`],
      [null, `    }`],
      ['set', `    this.vals.set(key, value);`],
      ['full', `    ${k('if')} (this.order.length &gt; this.cap) {`],
      ['evict', `      this.vals.delete(this.order.shift());`],
      [null, `    }`],
      [null, `  }`],
      [null, `}`],
    ],
    go: [
      [null, `type LRUCache struct {`],
      [null, `    cap   int`],
      [null, `    vals  map[int]int`],
      [null, `    order []int ${c('// keys, least recently used first')}`],
      [null, `}`],
      [null, ``],
      [null, `${k('func')} Constructor(capacity int) LRUCache {`],
      ['init', `    ${k('return')} LRUCache{cap: capacity, vals: map[int]int{}, order: []int{}}`],
      [null, `}`],
      [null, ``],
      [null, `${k('func')} (c *LRUCache) touch(key int) {`],
      [null, `    ${k('for')} i, k := ${k('range')} c.order { ${c('// a scan of up to capacity keys')}`],
      ['touch', `        ${k('if')} k == key {`],
      ['touch', `            c.order = append(c.order[:i], c.order[i+1:]...)`],
      [null, `            break`],
      [null, `        }`],
      [null, `    }`],
      ['touch', `    c.order = append(c.order, key)`],
      [null, `}`],
      [null, ``],
      [null, `${k('func')} (c *LRUCache) Get(key int) int {`],
      ['look', `    v, ok := c.vals[key]`],
      [null, `    ${k('if')} !ok {`],
      ['miss', `        ${k('return')} -1`],
      [null, `    }`],
      [null, `    c.touch(key)`],
      ['hit', `    ${k('return')} v`],
      [null, `}`],
      [null, ``],
      [null, `${k('func')} (c *LRUCache) Put(key int, value int) {`],
      ['look', `    ${k('if')} _, ok := c.vals[key]; ok {`],
      [null, `        c.touch(key)`],
      [null, `    } ${k('else')} {`],
      ['add', `        c.order = append(c.order, key)`],
      [null, `    }`],
      ['set', `    c.vals[key] = value`],
      ['full', `    ${k('if')} len(c.order) &gt; c.cap {`],
      ['evict', `        delete(c.vals, c.order[0])`],
      ['evict', `        c.order = c.order[1:]`],
      [null, `    }`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('use')} std::collections::HashMap;`],
      [null, ``],
      [null, `struct LRUCache {`],
      [null, `    cap: usize,`],
      [null, `    vals: HashMap&lt;i32, i32&gt;,`],
      [null, `    order: Vec&lt;i32&gt;, ${c('// keys, least recently used first')}`],
      [null, `}`],
      [null, ``],
      [null, `${k('impl')} LRUCache {`],
      [null, `    ${k('fn')} new(capacity: i32) -&gt; ${k('Self')} {`],
      ['init', `        LRUCache { cap: capacity as usize, vals: HashMap::new(), order: Vec::new() }`],
      [null, `    }`],
      [null, ``],
      [null, `    ${k('fn')} touch(&amp;${k('mut')} self, key: i32) {`],
      ['touch', `        ${k('let')} i = self.order.iter().position(|&amp;k| k == key).unwrap(); ${c('// a scan')}`],
      ['touch', `        self.order.remove(i);`],
      ['touch', `        self.order.push(key);`],
      [null, `    }`],
      [null, ``],
      [null, `    ${k('fn')} get(&amp;${k('mut')} self, key: i32) -&gt; i32 {`],
      ['look', `        ${k('match')} self.vals.get(&amp;key).copied() {`],
      ['miss', `            ${k('None')} =&gt; -1,`],
      [null, `            ${k('Some')}(v) =&gt; {`],
      [null, `                self.touch(key);`],
      ['hit', `                v`],
      [null, `            }`],
      [null, `        }`],
      [null, `    }`],
      [null, ``],
      [null, `    ${k('fn')} put(&amp;${k('mut')} self, key: i32, value: i32) {`],
      ['look', `        ${k('if')} self.vals.contains_key(&amp;key) {`],
      [null, `            self.touch(key);`],
      [null, `        } ${k('else')} {`],
      ['add', `            self.order.push(key);`],
      [null, `        }`],
      ['set', `        self.vals.insert(key, value);`],
      ['full', `        ${k('if')} self.order.len() &gt; self.cap {`],
      ['evict', `            ${k('let')} old = self.order.remove(0);`],
      ['evict', `            self.vals.remove(&amp;old);`],
      [null, `        }`],
      [null, `    }`],
      [null, `}`],
    ],
  },
  linked: {
    ruby: [
      [null, `class LRUCache`],
      [null, `  Node = Struct.new(:key, :val, :prev, :next)`],
      [null, ``],
      [null, `  ${k('def')} initialize(capacity)`],
      [null, `    @cap = capacity`],
      ['init', `    @nodes = {}`],
      ['init', `    @head, @tail = Node.new, Node.new ${c('# newest after head, oldest before tail')}`],
      ['init', `    @head.next, @tail.prev = @tail, @head`],
      [null, `  ${k('end')}`],
      [null, ``],
      [null, `  ${k('def')} get(key)`],
      ['look', `    node = @nodes[key]`],
      ['miss', `    ${k('return')} -1 ${k('unless')} node`],
      [null, `    unlink(node)`],
      [null, `    to_front(node)`],
      ['hit', `    node.val`],
      [null, `  ${k('end')}`],
      [null, ``],
      [null, `  ${k('def')} put(key, value)`],
      ['look', `    node = @nodes[key]`],
      [null, `    ${k('if')} node`],
      ['update', `      node.val = value`],
      [null, `      unlink(node)`],
      [null, `    ${k('else')}`],
      ['add', `      node = @nodes[key] = Node.new(key, value)`],
      [null, `    ${k('end')}`],
      [null, `    to_front(node)`],
      ['full', `    ${k('return')} ${k('unless')} @nodes.size &gt; @cap`],
      ['evict', `    lru = @tail.prev`],
      [null, `    unlink(lru)`],
      ['evict', `    @nodes.delete(lru.key)`],
      [null, `  ${k('end')}`],
      [null, ``],
      [null, `  private`],
      [null, ``],
      [null, `  ${k('def')} unlink(node)`],
      ['unlink', `    node.prev.next, node.next.prev = node.next, node.prev`],
      [null, `  ${k('end')}`],
      [null, ``],
      [null, `  ${k('def')} to_front(node)`],
      ['front', `    node.prev, node.next = @head, @head.next`],
      ['front', `    @head.next.prev = node`],
      ['front', `    @head.next = node`],
      [null, `  ${k('end')}`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('class')} Node:`],
      [null, `    ${k('def')} __init__(self, key=0, val=0):`],
      [null, `        self.key, self.val = key, val`],
      [null, `        self.prev = self.next = ${k('None')}`],
      [null, ``],
      [null, ``],
      [null, `${k('class')} LRUCache:`],
      [null, `    ${k('def')} __init__(self, capacity):`],
      [null, `        self.cap = capacity`],
      ['init', `        self.nodes = {}`],
      ['init', `        self.head, self.tail = Node(), Node()   ${c('# newest after head, oldest before tail')}`],
      ['init', `        self.head.next, self.tail.prev = self.tail, self.head`],
      [null, ``],
      [null, `    ${k('def')} unlink(self, node):`],
      ['unlink', `        node.prev.next, node.next.prev = node.next, node.prev`],
      [null, ``],
      [null, `    ${k('def')} to_front(self, node):`],
      ['front', `        node.prev, node.next = self.head, self.head.next`],
      ['front', `        self.head.next.prev = node`],
      ['front', `        self.head.next = node`],
      [null, ``],
      [null, `    ${k('def')} get(self, key):`],
      ['look', `        node = self.nodes.get(key)`],
      ['miss', `        ${k('if')} node ${k('is')} ${k('None')}:`],
      ['miss', `            ${k('return')} -1`],
      [null, `        self.unlink(node)`],
      [null, `        self.to_front(node)`],
      ['hit', `        ${k('return')} node.val`],
      [null, ``],
      [null, `    ${k('def')} put(self, key, value):`],
      ['look', `        node = self.nodes.get(key)`],
      [null, `        ${k('if')} node:`],
      ['update', `            node.val = value`],
      [null, `            self.unlink(node)`],
      [null, `        ${k('else')}:`],
      ['add', `            node = self.nodes[key] = Node(key, value)`],
      [null, `        self.to_front(node)`],
      ['full', `        ${k('if')} len(self.nodes) &gt; self.cap:`],
      ['evict', `            lru = self.tail.prev`],
      [null, `            self.unlink(lru)`],
      ['evict', `            del self.nodes[lru.key]`],
    ],
    javascript: [
      [null, `class LRUCache {`],
      [null, `  constructor(capacity) {`],
      [null, `    this.cap = capacity;`],
      ['init', `    this.nodes = ${k('new')} Map();`],
      ['init', `    this.head = { prev: ${k('null')}, next: ${k('null')} }; ${c('// newest after head, oldest before tail')}`],
      ['init', `    this.tail = { prev: this.head, next: ${k('null')} };`],
      ['init', `    this.head.next = this.tail;`],
      [null, `  }`],
      [null, ``],
      [null, `  unlink(node) {`],
      ['unlink', `    node.prev.next = node.next;`],
      ['unlink', `    node.next.prev = node.prev;`],
      [null, `  }`],
      [null, ``],
      [null, `  toFront(node) {`],
      ['front', `    node.prev = this.head;`],
      ['front', `    node.next = this.head.next;`],
      ['front', `    this.head.next.prev = node;`],
      ['front', `    this.head.next = node;`],
      [null, `  }`],
      [null, ``],
      [null, `  get(key) {`],
      ['look', `    ${k('const')} node = this.nodes.get(key);`],
      ['miss', `    ${k('if')} (!node) ${k('return')} -1;`],
      [null, `    this.unlink(node);`],
      [null, `    this.toFront(node);`],
      ['hit', `    ${k('return')} node.val;`],
      [null, `  }`],
      [null, ``],
      [null, `  put(key, value) {`],
      ['look', `    ${k('let')} node = this.nodes.get(key);`],
      [null, `    ${k('if')} (node) {`],
      ['update', `      node.val = value;`],
      [null, `      this.unlink(node);`],
      [null, `    } ${k('else')} {`],
      ['add', `      node = { key, val: value, prev: ${k('null')}, next: ${k('null')} };`],
      ['add', `      this.nodes.set(key, node);`],
      [null, `    }`],
      [null, `    this.toFront(node);`],
      ['full', `    ${k('if')} (this.nodes.size &gt; this.cap) {`],
      ['evict', `      ${k('const')} lru = this.tail.prev;`],
      [null, `      this.unlink(lru);`],
      ['evict', `      this.nodes.delete(lru.key);`],
      [null, `    }`],
      [null, `  }`],
      [null, `}`],
    ],
    go: [
      [null, `type node struct {`],
      [null, `    key, val   int`],
      [null, `    prev, next *node`],
      [null, `}`],
      [null, ``],
      [null, `type LRUCache struct {`],
      [null, `    cap        int`],
      [null, `    nodes      map[int]*node`],
      [null, `    head, tail *node ${c('// newest after head, oldest before tail')}`],
      [null, `}`],
      [null, ``],
      [null, `${k('func')} Constructor(capacity int) LRUCache {`],
      ['init', `    c := LRUCache{cap: capacity, nodes: map[int]*node{}, head: &amp;node{}, tail: &amp;node{}}`],
      ['init', `    c.head.next, c.tail.prev = c.tail, c.head`],
      [null, `    ${k('return')} c`],
      [null, `}`],
      [null, ``],
      [null, `${k('func')} (c *LRUCache) unlink(n *node) {`],
      ['unlink', `    n.prev.next, n.next.prev = n.next, n.prev`],
      [null, `}`],
      [null, ``],
      [null, `${k('func')} (c *LRUCache) toFront(n *node) {`],
      ['front', `    n.prev, n.next = c.head, c.head.next`],
      ['front', `    c.head.next.prev = n`],
      ['front', `    c.head.next = n`],
      [null, `}`],
      [null, ``],
      [null, `${k('func')} (c *LRUCache) Get(key int) int {`],
      ['look', `    n, ok := c.nodes[key]`],
      ['miss', `    ${k('if')} !ok {`],
      ['miss', `        ${k('return')} -1`],
      [null, `    }`],
      [null, `    c.unlink(n)`],
      [null, `    c.toFront(n)`],
      ['hit', `    ${k('return')} n.val`],
      [null, `}`],
      [null, ``],
      [null, `${k('func')} (c *LRUCache) Put(key int, value int) {`],
      ['look', `    n, ok := c.nodes[key]`],
      [null, `    ${k('if')} ok {`],
      ['update', `        n.val = value`],
      [null, `        c.unlink(n)`],
      [null, `    } ${k('else')} {`],
      ['add', `        n = &amp;node{key: key, val: value}`],
      ['add', `        c.nodes[key] = n`],
      [null, `    }`],
      [null, `    c.toFront(n)`],
      ['full', `    ${k('if')} len(c.nodes) &gt; c.cap {`],
      ['evict', `        lru := c.tail.prev`],
      [null, `        c.unlink(lru)`],
      ['evict', `        delete(c.nodes, lru.key)`],
      [null, `    }`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('use')} std::collections::HashMap;`],
      [null, ``],
      [null, `struct Node {`],
      [null, `    key: i32,`],
      [null, `    val: i32,`],
      [null, `    prev: usize,`],
      [null, `    next: usize,`],
      [null, `}`],
      [null, ``],
      [null, `struct LRUCache {`],
      [null, `    cap: usize,`],
      [null, `    nodes: HashMap&lt;i32, usize&gt;, ${c('// key → its index in list')}`],
      [null, `    list: Vec&lt;Node&gt;,            ${c('// list[0] is head, list[1] is tail; newest after head')}`],
      [null, `}`],
      [null, ``],
      [null, `${k('impl')} LRUCache {`],
      [null, `    ${k('fn')} new(capacity: i32) -&gt; ${k('Self')} {`],
      ['init', `        ${k('let')} nodes = HashMap::new();`],
      ['init', `        ${k('let')} list = vec![Node { key: 0, val: 0, prev: 0, next: 1 }, Node { key: 0, val: 0, prev: 0, next: 1 }];`],
      [null, `        LRUCache { cap: capacity as usize, nodes, list }`],
      [null, `    }`],
      [null, ``],
      [null, `    ${k('fn')} unlink(&amp;${k('mut')} self, i: usize) {`],
      ['unlink', `        ${k('let')} (p, n) = (self.list[i].prev, self.list[i].next);`],
      ['unlink', `        self.list[p].next = n;`],
      ['unlink', `        self.list[n].prev = p;`],
      [null, `    }`],
      [null, ``],
      [null, `    ${k('fn')} to_front(&amp;${k('mut')} self, i: usize) {`],
      ['front', `        ${k('let')} first = self.list[0].next;`],
      ['front', `        self.list[i].prev = 0;`],
      ['front', `        self.list[i].next = first;`],
      ['front', `        self.list[first].prev = i;`],
      ['front', `        self.list[0].next = i;`],
      [null, `    }`],
      [null, ``],
      [null, `    ${k('fn')} get(&amp;${k('mut')} self, key: i32) -&gt; i32 {`],
      ['look', `        ${k('match')} self.nodes.get(&amp;key).copied() {`],
      ['miss', `            ${k('None')} =&gt; -1,`],
      [null, `            ${k('Some')}(i) =&gt; {`],
      [null, `                self.unlink(i);`],
      [null, `                self.to_front(i);`],
      ['hit', `                self.list[i].val`],
      [null, `            }`],
      [null, `        }`],
      [null, `    }`],
      [null, ``],
      [null, `    ${k('fn')} put(&amp;${k('mut')} self, key: i32, value: i32) {`],
      ['look', `        ${k('let')} i = ${k('match')} self.nodes.get(&amp;key).copied() {`],
      [null, `            ${k('Some')}(i) =&gt; {`],
      ['update', `                self.list[i].val = value;`],
      [null, `                self.unlink(i);`],
      [null, `                i`],
      [null, `            }`],
      [null, `            ${k('None')} =&gt; {`],
      ['add', `                self.list.push(Node { key, val: value, prev: 0, next: 0 });`],
      ['add', `                self.nodes.insert(key, self.list.len() - 1);`],
      [null, `                self.list.len() - 1`],
      [null, `            }`],
      [null, `        };`],
      [null, `        self.to_front(i);`],
      ['full', `        ${k('if')} self.nodes.len() &gt; self.cap {`],
      ['evict', `            ${k('let')} lru = self.list[1].prev;`],
      [null, `            self.unlink(lru);`],
      ['evict', `            self.nodes.remove(&amp;self.list[lru].key);`],
      [null, `        }`],
      [null, `    }`],
      [null, `}`],
    ],
  },
};

/* ---------------- part 1: the "who goes next" widget ----------------
 *
 * "Least recently used" is not "added first": reading a key counts as using
 * it. Click keys to read them — a miss loads the key — and watch an LRU cache
 * and a first-in-first-out one side by side: the key each would drop next,
 * and how many reads each one answered from the cache. */

const QW_SETS = [
  { label: t('a hot key', 'အသုံးများ key'), cap: 3, seq: [1, 2, 3, 1, 4] },
  { label: t('a loop', 'ကွင်း'), cap: 3, seq: [1, 2, 3, 4, 1, 2, 3, 4] },
  { label: t('start empty', 'ဗလာမှ စ'), cap: 3, seq: [] },
];

function simulate(cap, seq) {
  const lru = [], fifo = [];
  let lruHits = 0, fifoHits = 0;
  for (const key of seq) {
    const i = lru.indexOf(key);
    if (i >= 0) { lruHits++; lru.splice(i, 1); } else if (lru.length === cap) lru.shift();
    lru.push(key);
    if (fifo.includes(key)) fifoHits++;
    else { if (fifo.length === cap) fifo.shift(); fifo.push(key); }
  }
  return { lru, fifo, lruHits, fifoHits };
}

function mountEvictWidget(host) {
  const state = { set: 0, seq: [...QW_SETS[0].seq] };
  host.innerHTML = `
    <div class="q-arr" data-keys></div>
    <div class="q-arr" data-lru></div>
    <div class="q-arr" data-fifo></div>
    <div class="q-slider"><span class="q-presets" data-presets></span></div>
    <p class="q-tie" data-line></p>
    <div class="ledger">
      <span class="expr" data-expr></span>
      <span class="total" data-total></span>
    </div>`;
  const q = (sel) => host.querySelector(sel);

  function render() {
    const { cap } = QW_SETS[state.set];
    const r = simulate(cap, state.seq);
    const row = (name, keys) => `<span class="q-row-label">${name}</span>${keys.length
      ? keys.map((key, i) => `<div class="cell ${i === 0 && keys.length === cap ? 'kept picked amber' : 'kept'}"><span>${key}</span><span class="idx">${i === 0 && keys.length === cap ? pick(t('next', 'နောက်')) : ''}</span></div>`).join('')
      : `<span class="q-empty">${pick(t('empty', 'ဗလာ'))}</span>`}`;
    q('[data-keys]').innerHTML = `<span class="q-row-label">${pick(t('read', 'ဖတ်'))}</span>${[1, 2, 3, 4, 5].map((key) =>
      `<div class="cell" role="button" tabindex="0" data-key="${key}" aria-label="read key ${key}"><span>${key}</span></div>`).join('')}`;
    q('[data-lru]').innerHTML = row('LRU', r.lru);
    q('[data-fifo]').innerHTML = row('FIFO', r.fifo);
    q('[data-presets]').innerHTML = presetChips(QW_SETS, state.set);
    widgetLabel(pick(t(`capacity ${cap} · click a key to read it`, `capacity ${cap} · key ကို နှိပ်၍ ဖတ်ပါ`)));
    const full = r.lru.length === cap;
    q('[data-line]').innerHTML = pick(!full
      ? t('Not full yet, so nothing has to go. Keep reading keys; a miss loads the key it asked for.', 'မပြည့်သေးသဖြင့် ဘာမှ ထွက်စရာ မလို။ key များကို ဆက်ဖတ်ပါ — miss တစ်ခုက မေးသော key ကို ထည့်သည်။')
      : r.lru[0] !== r.fifo[0]
        ? t(`Next miss: LRU drops ${r.lru[0]}, unused the longest; FIFO would drop ${r.fifo[0]}, added first — even though it was read since. A get counts as a use.`,
            `နောက် miss တွင် — LRU သည် အကြာဆုံး မသုံးသော ${r.lru[0]} ကို ဖယ်သည် — FIFO သည် ဖတ်ခဲ့ပြီးသော်လည်း အရင်ဆုံး ထည့်ခဲ့သော ${r.fifo[0]} ကို ဖယ်မည်။ get သည် အသုံးပြုခြင်း ဖြစ်သည်။`)
        : t(`Both would drop ${r.lru[0]} next. Read ${r.lru[0]} again and watch them part ways.`, `နှစ်ခုလုံး နောက်တွင် ${r.lru[0]} ကို ဖယ်မည်။ ${r.lru[0]} ကို ထပ်ဖတ်ပြီး ကွဲသွားပုံ ကြည့်ပါ။`));
    q('[data-expr]').innerHTML = `${pick(t('reads', 'ဖတ်'))}: ${state.seq.join(' ') || '—'} &nbsp;·&nbsp; FIFO ${r.fifoHits} ${pick(t('hits', 'hit'))}`;
    q('[data-total]').innerHTML = `${r.lruHits}<small>${pick(t('LRU hits', 'LRU hit'))}</small>`;
  }
  function read(el) {
    state.seq.push(Number(el.dataset.key));
    if (state.seq.length > 16) state.seq.shift();
    render();
    host.querySelector(`[data-key="${el.dataset.key}"]`)?.focus();
  }
  host.addEventListener('click', (ev) => {
    const chip = ev.target.closest('[data-set]');
    if (chip) { state.set = Number(chip.dataset.set); state.seq = [...QW_SETS[state.set].seq]; return render(); }
    const key = ev.target.closest('[data-key]');
    if (key) read(key);
  });
  host.addEventListener('keydown', (ev) => {
    const key = ev.target.closest('[data-key]');
    if (key && (ev.key === 'Enter' || ev.key === ' ')) { ev.preventDefault(); read(key); }
  });
  onLangChange(render);
  render();
}

/* ---------------- the approach, in brief ---------------- */

const APPROACH = {
  list: {
    idea: t('Keep the values in a hash map and the keys in a list ordered by last use. Every use moves its key to the end; the key to evict is always first.',
            'value များကို hash map ထဲ၊ key များကို နောက်ဆုံးသုံးချိန်အလိုက် list ထဲ ထားသည်။ အသုံးပြုတိုင်း ၎င်း၏ key ကို နောက်ဆုံးသို့ ရွှေ့သည် — ဖယ်ရမည့် key သည် အမြဲ ပထမ။'),
    steps: [
      t('<code>get</code>: missing → -1; otherwise <code>touch</code> the key and return its value.', '<code>get</code> — မရှိလျှင် -1 — ရှိလျှင် key ကို <code>touch</code> ပြီး value ပြန်သည်။'),
      t('<code>touch</code>: find the key in <code>order</code>, cut it out, append it.', '<code>touch</code> — <code>order</code> ထဲ key ကို ရှာ၊ ဖြတ်ထုတ်၊ နောက်ဆုံးတွင် ထည့်သည်။'),
      t('<code>put</code>: touch or append the key, set the value, and if <code>order</code> is over capacity drop its first key from both.',
        '<code>put</code> — key ကို touch သို့မဟုတ် ထည့်၊ value သတ်မှတ်၊ <code>order</code> capacity ကျော်လျှင် ပထမ key ကို နှစ်ခုလုံးမှ ဖယ်သည်။'),
    ],
    cost: t('Finding a key in the list, and removing the first one, both shift up to capacity entries: O(capacity) per call, which the statement rules out.',
            'list ထဲ key ရှာခြင်းနှင့် ပထမ key ဖယ်ခြင်း နှစ်ခုလုံး entry capacity အထိ ရွှေ့သည် — call တစ်ခုလျှင် O(capacity)၊ မေးခွန်းက ပယ်ထားသည်။'),
  },
  linked: {
    idea: t('Make the recency order a doubly linked list and let the hash map point at each key\'s node. Any node can then be cut out and put at the front in a few pointer writes, and the oldest is always the one before tail.',
            'recency အစီအစဉ်ကို doubly linked list ဖြစ်စေပြီး hash map က key တစ်ခုစီ၏ node ကို ညွှန်စေသည်။ ထို့နောက် မည်သည့် node ကိုမဆို pointer ရေးခြင်း အနည်းငယ်ဖြင့် ဖြတ်ထုတ်ပြီး ရှေ့ဆုံးတွင် ထားနိုင်ပြီး အဟောင်းဆုံးသည် အမြဲ tail ရှေ့ရှိ node ဖြစ်သည်။'),
    steps: [
      t('<code>get</code>: look the node up in <code>nodes</code>; missing → -1; otherwise <code>unlink</code> it, move it to the front, return its value.',
        '<code>get</code> — <code>nodes</code> ထဲ node ရှာ — မရှိလျှင် -1 — ရှိလျှင် <code>unlink</code>၊ ရှေ့ဆုံးသို့ ရွှေ့၊ value ပြန်သည်။'),
      t('<code>put</code>: an existing node gets the new value and is unlinked; a new key gets a new node. Either way it goes to the front.',
        '<code>put</code> — ရှိပြီးသား node သည် value အသစ် ရပြီး unlink ခံရသည် — key အသစ်သည် node အသစ် ရသည်။ မည်သို့ပင်ဖြစ်စေ ရှေ့ဆုံးသို့ သွားသည်။'),
      t('Over capacity: <code>lru = tail.prev</code>; unlink it and delete <code>lru.key</code> from <code>nodes</code>.',
        'capacity ကျော်လျှင် — <code>lru = tail.prev</code> — unlink ပြီး <code>nodes</code> မှ <code>lru.key</code> ကို ဖျက်သည်။'),
    ],
    cost: t('A hash lookup plus a fixed number of pointer writes per call: O(1). The sentinels mean no call ever checks for an empty list or a missing neighbour.',
            'call တစ်ခုလျှင် hash lookup တစ်ကြိမ်နှင့် pointer ရေးခြင်း အရေအတွက် ပုံသေ — O(1)။ sentinel များကြောင့် မည်သည့် call ကမျှ list ဗလာ သို့မဟုတ် အိမ်နီး မရှိခြင်းကို မစစ်ရ။'),
  },
};

/* ---------------- mount ---------------- */

const EX1 = [['put', 1, 1], ['put', 2, 2], ['get', 1], ['put', 3, 3], ['get', 2], ['put', 4, 4], ['get', 1], ['get', 3], ['get', 4]];

mountLesson({
  input: { capacity: 2, ops: EX1 },
  controls: [
    { key: 'capacity', label: 'capacity', type: 'number', min: 1, max: 4, parse: intValue({ lo: 1, hi: 4, why: 'so the stage stays readable' }) },
    { key: 'ops', label: t('calls', 'call များ'), parse: parseOps, format: fmtOps },
  ],
  presets: [
    { label: exampleTitle(1), input: { capacity: 2, ops: EX1 } },
    { label: t('an update saves a key', 'update က key ကို ကယ်'), input: { capacity: 2, ops: [['put', 1, 1], ['put', 2, 2], ['put', 1, 10], ['put', 3, 3], ['get', 1], ['get', 2]] } },
    { label: t('capacity 1', 'capacity 1'), input: { capacity: 1, ops: [['put', 1, 1], ['put', 2, 2], ['get', 1], ['get', 2]] } },
  ],
  examples: [
    { title: exampleTitle(1),
      inputHtml: '<code>["LRUCache","put","put","get","put","get","put","get","get","get"]<br>[[2],[1,1],[2,2],[1],[3,3],[2],[4,4],[1],[3],[4]]</code>',
      output: '[null,null,null,1,null,-1,null,-1,3,4]',
      why: [
        t('get(1) returns 1 and makes 1 the most recently used, so put(3, 3) evicts 2, not 1.', 'get(1) သည် 1 ပြန်ပြီး 1 ကို အသစ်ဆုံး အသုံးပြုထားသည် ဖြစ်စေသဖြင့် put(3, 3) သည် 1 မဟုတ်ဘဲ 2 ကို ဖယ်သည်။'),
        t('put(4, 4) then evicts 1, the least recently used of {1, 3}; 3 and 4 remain.', 'ထို့နောက် put(4, 4) သည် {1, 3} ထဲမှ အဟောင်းဆုံး အသုံးပြုထားသော 1 ကို ဖယ်သည် — 3 နှင့် 4 ကျန်သည်။'),
      ],
      load: { capacity: 2, ops: EX1 } },
  ],
  modes: [
    { id: 'list', name: 'Recency list',
      sub: t('not O(1)', 'O(1) မဟုတ်'),
      desc: t('A map for values and a list of keys in order of use.', 'value အတွက် map နှင့် အသုံးပြုသည့် အစီအစဉ်အလိုက် key list။'),
      cost: 'O(capacity) per call', build: buildList },
    { id: 'linked', name: 'Hash map + linked list',
      desc: t('The map finds a node; the list moves it in O(1).', 'map က node ကို ရှာ — list က O(1) ဖြင့် ရွှေ့သည်။'),
      cost: 'O(1) per call · O(capacity) space', build: buildLinked },
  ],
  languages: LANGUAGES,
  code: CODE,
  hover: { ruby: { '@vals': 'vals', '@order': 'order', '@nodes': 'nodes', '@cap': 'cap', '@head': 'head', '@tail': 'tail' } },
  solutions: {
    list: { approach: APPROACH.list,
      desc: t('Correct, and the clearest statement of what the cache must do — but every use pays a scan of the list, so it fails the O(1) requirement.',
              'မှန်ပြီး cache လုပ်ရမည့်အရာ၏ အရှင်းဆုံး ဖော်ပြချက် — သို့သော် အသုံးပြုတိုင်း list scan ပေးရသဖြင့် O(1) လိုအပ်ချက်ကို မအောင်။') },
    linked: { approach: APPROACH.linked,
      desc: t('The answer the statement asks for. Every language gets the same two helpers, <code>unlink</code> and to-front; Rust keeps the nodes in a Vec and links them by index.',
              'မေးခွန်း တောင်းသော အဖြေ။ ဘာသာစကားတိုင်းတွင် helper နှစ်ခု <code>unlink</code> နှင့် to-front တူတူ ရှိသည် — Rust သည် node များကို Vec ထဲ ထားပြီး index ဖြင့် ချိတ်သည်။') },
  },
  // How each language was actually checked, printed as the part 3 badges.
  // The corpus: the example, 6 edges, 15,000 random runs of up to 20 calls
  // over a handful of keys, 5,000 of up to 500 calls, and three of 2 × 10⁵
  // calls at capacity 3,000 and 1 — against an OrderedDict oracle. Go and
  // Rust ran in Docker (golang:1.23-alpine, rust:1-slim).
  verification: {
    ruby: 'ran here · 20,010 cases',
    python: 'ran here · 20,010 cases',
    javascript: 'ran here · 20,010 cases',
    go: 'ran here · 20,010 cases · Go 1.23',
    rust: 'ran here · 20,010 cases · rustc 1.98',
  },
  stripLabel: t('The calls, in order', 'call များ — အစီအစဉ်အတိုင်း'),
  strip,
  draw,
  answer,
  vars,
  widget: mountEvictWidget,
});
