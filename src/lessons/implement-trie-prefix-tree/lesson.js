/* Implement Trie (Prefix Tree) — LeetCode 208.
 *
 * A trie stores words letter by letter along paths from a root, so words that
 * share a beginning share nodes. Asking "does any word start with p?" is then
 * a walk of len(p) links from the root — no matter how many words are stored
 * — and "is w a word?" is the same walk plus one flag: did some insert end
 * here? The alternative, a set of whole words, answers search in one lookup
 * but has to look at every word for startsWith.
 */
import { mountLesson } from '../../lib/stepper.js';
import { pick, onLangChange } from '../../lib/i18n.js';
import { cells, slots, stagePanel, readout, trieOutline } from '../../lib/stage.js';
import { t, exampleTitle, LANGUAGES, k, c, stageRow, stageGap, presetChips, widgetLabel } from '../../lib/kit.js';

const MAX_OPS = 8, MAX_LEN = 6;
const NAMES = { insert: 'insert', search: 'search', startsWith: 'startsWith' };

function parseOps(text) {
  let rest = String(text).replace(/\s+/g, '');
  const ops = [];
  while (rest) {
    const m = rest.match(/^(insert|search|startsWith)\(["']?([a-z]+)["']?\)(?:,|$)/);
    if (!m) throw new Error('calls like insert(apple), search(app), startsWith(ap) — lowercase letters only');
    if (m[2].length > MAX_LEN) throw new Error(`words up to ${MAX_LEN} letters, so the trie stays readable`);
    ops.push([m[1], m[2]]);
    rest = rest.slice(m[0].length);
  }
  if (!ops.length) throw new Error('at least one call');
  if (ops.length > MAX_OPS) throw new Error(`at most ${MAX_OPS} calls, so the stage stays readable`);
  return ops;
}
const opText = ([kind, w]) => `${NAMES[kind]}("${w}")`;
const fmtOps = (ops) => ops.map(([kind, w]) => `${kind}(${w})`).join(', ');
const shown = (r) => (r === null ? 'null' : String(r));

/* ---------------- step generators ---------------- */

function buildSet({ ops }) {
  const words = [];                 // a set, kept in insertion order so the walkthrough is repeatable
  const results = [];
  const steps = [];
  const snap = (extra) => ({ view: 'set', words: [...words], results: [...results], op: null, cmp: null, match: null, checked: 0, just: -1, ...extra });
  steps.push(snap({ line: 'init', tag: t('empty set', 'set ဗလာ'),
    note: t('An empty set of words. insert and search are one hash each; startsWith is the question a set cannot answer directly.',
            'word set ဗလာ။ insert နှင့် search သည် hash တစ်ကြိမ်စီ — startsWith သည် set က တိုက်ရိုက် မဖြေနိုင်သော မေးခွန်း။') }));
  ops.forEach(([kind, w], j) => {
    if (kind === 'insert') {
      const had = words.includes(w);
      if (!had) words.push(w);
      results.push(null);
      steps.push(snap({ line: 'add', op: j, cmp: w, just: results.length - 1, tag: t(`add "${w}"`, `"${w}" ထည့်`),
        note: had ? t(`"${w}" is already in the set; a set keeps one copy.`, `"${w}" သည် set ထဲ ရှိပြီးသား — set သည် copy တစ်ခုသာ ထိန်းသည်။`)
                  : t(`Add "${w}" to the set: ${words.length} ${words.length === 1 ? 'word' : 'words'} now.`, `"${w}" ကို set ထဲ ထည့်သည် — ယခု word ${words.length} ခု။`) }));
    } else if (kind === 'search') {
      const yes = words.includes(w);
      results.push(yes);
      steps.push(snap({ line: 'find', op: j, cmp: w, match: yes, just: results.length - 1, tag: t(String(yes), String(yes)),
        note: t(`Is "${w}" in the set? One hash lookup: ${yes}.`, `"${w}" သည် set ထဲ ရှိသလား။ hash lookup တစ်ကြိမ် — ${yes}။`) }));
    } else {
      let found = false, checked = 0;
      for (const x of words) {
        checked++;
        const hit = x.startsWith(w);
        steps.push(snap({ line: hit ? 'yes' : 'scan', op: j, cmp: x, match: hit, checked, tag: t(hit ? 'true' : `word ${checked}`, hit ? 'true' : `word ${checked}`),
          note: hit
            ? t(`"${x}" starts with "${w}": return true, after checking ${checked} of ${words.length} words.`, `"${x}" သည် "${w}" ဖြင့် စသည် — word ${words.length} ခုအနက် ${checked} ခု စစ်ပြီးနောက် true ပြန်သည်။`)
            : t(`"${x}" does not start with "${w}". Next word.`, `"${x}" သည် "${w}" ဖြင့် မစပါ။ နောက် word။`) }));
        if (hit) { found = true; results.push(true); steps[steps.length - 1] = { ...steps.at(-1), results: [...results], just: results.length - 1 }; break; }
      }
      if (!found) {
        results.push(false);
        steps.push(snap({ line: 'no', op: j, checked, just: results.length - 1, tag: t('false', 'false'),
          note: t(`No word starts with "${w}" — and finding that out meant checking all ${words.length}.`, `"${w}" ဖြင့် စသော word မရှိ — ၎င်းကို သိရန် ${words.length} ခုလုံး စစ်ခဲ့ရသည်။`) }));
      }
    }
  });
  steps[steps.length - 1] = { ...steps.at(-1), finished: true };
  return steps;
}

function buildTrie({ ops }) {
  const nodes = new Set(['']);      // every node, named by the prefix that leads to it
  const ends = new Set();
  const results = [];
  const steps = [];
  const snap = (extra) => ({ view: 'trie', nodes: [...nodes], ends: [...ends], results: [...results], op: null, word: null, at: null, i: -1,
    made: null, miss: null, just: -1, ...extra });
  steps.push(snap({ line: 'init', at: '', tag: t('root', 'root'),
    note: t('A trie that is only its root: a node with no children, standing for the empty prefix.', 'root သာ ပါသော trie — child မရှိသော node တစ်ခု၊ prefix ဗလာကို ကိုယ်စားပြုသည်။') }));
  ops.forEach(([kind, w], j) => {
    steps.push(snap({ line: kind === 'insert' ? 'start' : 'walk', op: j, word: w, at: '', tag: t(opText([kind, w]), opText([kind, w])),
      note: t(`${opText([kind, w])}: start at the root.`, `${opText([kind, w])} — root မှ စသည်။`) }));
    if (kind === 'insert') {
      for (let i = 0; i < w.length; i++) {
        const p = w.slice(0, i + 1);
        if (!nodes.has(p)) {
          nodes.add(p);
          steps.push(snap({ line: 'grow', op: j, word: w, at: w.slice(0, i), i, made: p, tag: t(`new "${w[i]}"`, `"${w[i]}" အသစ်`),
            note: t(`No child '${w[i]}' here yet: make one. It stands for the prefix "${p}".`, `ဤနေရာတွင် child '${w[i]}' မရှိသေး — တစ်ခု လုပ်သည်။ ၎င်းသည် prefix "${p}" ကို ကိုယ်စားပြုသည်။`) }));
        }
        steps.push(snap({ line: 'step', op: j, word: w, at: p, i, tag: t(`→ ${w[i]}`, `→ ${w[i]}`),
          note: t(`Follow '${w[i]}' down to the node for "${p}".`, `'${w[i]}' ကို လိုက်၍ "${p}" ၏ node သို့ ဆင်းသည်။`) }));
      }
      ends.add(w);
      results.push(null);
      steps.push(snap({ line: 'end', op: j, word: w, at: w, i: w.length, just: results.length - 1, tag: t('end = true', 'end = true'),
        note: t(`Mark this node <code>end</code>: a word finishes here. Without the mark, "${w}" would only be a prefix of longer words.`,
                `ဤ node ကို <code>end</code> မှတ်သည် — word တစ်ခု ဤနေရာတွင် ဆုံးသည်။ အမှတ်မပါလျှင် "${w}" သည် ပိုရှည်သော word များ၏ prefix သာ ဖြစ်မည်။`) }));
      return;
    }
    let node = '';
    for (let i = 0; i < w.length; i++) {
      const p = w.slice(0, i + 1);
      if (!nodes.has(p)) {
        node = null;
        steps.push(snap({ line: 'miss', op: j, word: w, at: w.slice(0, i), i, miss: p, tag: t(`no '${w[i]}'`, `'${w[i]}' မရှိ`),
          note: t(`No child '${w[i]}' under "${w.slice(0, i)}": no stored word starts with "${p}". walk returns nothing.`,
                  `"${w.slice(0, i)}" အောက်တွင် child '${w[i]}' မရှိ — "${p}" ဖြင့် စသော word မသိမ်းထားပါ။ walk က ဘာမှ မပြန်ပါ။`) }));
        break;
      }
      node = p;
      steps.push(snap({ line: 'next', op: j, word: w, at: p, i, tag: t(`→ ${w[i]}`, `→ ${w[i]}`),
        note: t(`Follow '${w[i]}' down to the node for "${p}".`, `'${w[i]}' ကို လိုက်၍ "${p}" ၏ node သို့ ဆင်းသည်။`) }));
    }
    const ans = kind === 'search' ? node !== null && ends.has(w) : node !== null;
    results.push(ans);
    const note = node === null
      ? t(`The walk fell off the trie, so ${NAMES[kind]} is false.`, `walk သည် trie ပေါ်မှ ပြုတ်ကျသဖြင့် ${NAMES[kind]} သည် false။`)
      : kind === 'search'
        ? (ans ? t(`Every letter was there and this node is marked <code>end</code>: "${w}" was inserted. true.`, `စာလုံးတိုင်း ရှိပြီး ဤ node သည် <code>end</code> မှတ်ထားသည် — "${w}" ကို ထည့်ခဲ့သည်။ true။`)
               : t(`Every letter was there, but this node is not marked <code>end</code>: "${w}" is only the start of longer words. false.`, `စာလုံးတိုင်း ရှိသော်လည်း ဤ node သည် <code>end</code> မမှတ်ထားပါ — "${w}" သည် ပိုရှည်သော word များ၏ အစသာ။ false။`))
        : t(`Every letter was there: some stored word continues from this node. true — the end mark does not matter for a prefix.`, `စာလုံးတိုင်း ရှိသည် — သိမ်းထားသော word တစ်ခုခုသည် ဤ node မှ ဆက်သည်။ true — prefix အတွက် end အမှတ် အရေးမကြီး။`);
    steps.push(snap({ line: kind === 'search' ? 'hasword' : 'hasprefix', op: j, word: w, at: node, i: node === null ? -1 : w.length, just: results.length - 1, tag: t(String(ans), String(ans)), note }));
  });
  steps[steps.length - 1] = { ...steps.at(-1), finished: true };
  return steps;
}

/* ---------------- drawing ----------------
 *
 * The strip card is the sequence of calls. The stage is the structure: for
 * the set, its words, with the one being compared lit; for the trie, the
 * current word letter by letter, then the trie itself as an outline — one row
 * per node, indented by depth, spelling the prefix it stands for, with the
 * nodes where a word ends marked. */

function strip(s, { ops }) {
  return cells(ops.map(([kind, w]) => `${kind === 'startsWith' ? 'prefix' : kind} ${w}`), {
    tone: Object.fromEntries(ops.map((_, j) => [j, j === s.op ? 'inwin' : (s.op != null && j < s.op) || s.finished ? 'done' : null]).filter(([, x]) => x)),
  });
}

function draw(s) {
  if (s.view === 'set') {
    const tone = {};
    s.words.forEach((w, i) => { if (w === s.cmp) tone[i] = s.line === 'scan' ? 'leaving' : 'entering'; });
    return stagePanel(pick(t('words', 'words')), pick(t(`${s.words.length} stored`, `${s.words.length} ခု သိမ်း`)),
      stageRow(cells(s.words, { index: false, tone }), pick(t('empty', 'ဗလာ'))))
      + (s.checked ? stageGap + readout({ [pick(t('checked for this prefix', 'ဤ prefix အတွက် စစ်ပြီး'))]: s.checked }) : '');
  }
  const word = s.word ? stagePanel(pick(t('The word', 'Word')), '', stageRow(cells(s.word.split(''), {
    tone: Object.fromEntries(s.word.split('').map((_, i) => [i, s.miss && i === s.i ? 'leaving' : i === s.i ? 'inwin' : i < s.i || (s.i === -1 && s.at != null && s.line.startsWith('has')) ? 'entering' : null]).filter(([, x]) => x)),
  }), '')) + stageGap : '';
  return word + stagePanel(pick(t('The trie', 'Trie')), pick(t(`${s.nodes.length} nodes · ${s.ends.length} words`, `node ${s.nodes.length} · word ${s.ends.length}`)), trieOutline({ nodes: s.nodes, ends: s.ends, at: s.at, made: s.made, miss: s.miss }));
}

function answer(s, { ops }) {
  return {
    html: slots(s.results.map(shown), { total: ops.length, just: s.just }),
    note: t('what each call returns', 'call တစ်ခုစီ ပြန်ပေးသည့်အရာ'),
  };
}

function vars(s, { ops }) {
  const o = s.op != null ? ops[s.op] : null;
  const out = [];
  if (o) out.push([o[0] === 'startsWith' ? 'prefix' : 'word', `"${o[1]}"`], ['s', `"${o[1]}"`]);
  if (s.view === 'set') {
    out.push(['words', `{${s.words.map((w) => `"${w}"`).join(', ')}}`]);
    if (s.cmp != null && o && o[0] === 'startsWith') out.push(['w', `"${s.cmp}"`]);
  } else {
    out.push(['root', `node for "" · ${s.nodes.length - 1} below`]);
    if (s.at != null) out.push(['node', `node for "${s.at}"${s.ends.includes(s.at) ? ' · end' : ''}`]);
    else if (s.line === 'miss' || s.line === 'hasword' || s.line === 'hasprefix') out.push(['node', 'None / nil / null']);
    if (s.word && s.i >= 0 && s.i < s.word.length) out.push(['ch', `'${s.word[s.i]}'`]);
  }
  return out;
}

/* ---------------- the code, one key per line ----------------
 *
 * Generated from the verified solution files, so the listing a reader copies
 * is byte-identical to the one that ran. */

const CODE = {
  set: {
    ruby: [
      [null, `require 'set'`],
      [null, ``],
      [null, `class Trie`],
      [null, `  ${k('def')} initialize`],
      ['init', `    @words = Set.new`],
      [null, `  ${k('end')}`],
      [null, ``],
      [null, `  ${k('def')} insert(word)`],
      ['add', `    @words &lt;&lt; word`],
      [null, `  ${k('end')}`],
      [null, ``],
      [null, `  ${k('def')} search(word)`],
      ['find', `    @words.include?(word)`],
      [null, `  ${k('end')}`],
      [null, ``],
      [null, `  ${k('def')} starts_with(prefix)`],
      [null, `    @words.each ${k('do')} |w| ${c('# all of them, on every call')}`],
      ['scan', `      next ${k('unless')} w.start_with?(prefix)`],
      ['yes', `      ${k('return')} true`],
      [null, `    ${k('end')}`],
      ['no', `    false`],
      [null, `  ${k('end')}`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('class')} Trie:`],
      [null, `    ${k('def')} __init__(self):`],
      ['init', `        self.words = set()`],
      [null, ``],
      [null, `    ${k('def')} insert(self, word):`],
      ['add', `        self.words.add(word)`],
      [null, ``],
      [null, `    ${k('def')} search(self, word):`],
      ['find', `        ${k('return')} word ${k('in')} self.words`],
      [null, ``],
      [null, `    ${k('def')} startsWith(self, prefix):`],
      ['scan', `        ${k('for')} w ${k('in')} self.words:              ${c('# all of them, on every call')}`],
      ['scan', `            ${k('if')} w.startswith(prefix):`],
      ['yes', `                ${k('return')} True`],
      ['no', `        ${k('return')} False`],
    ],
    javascript: [
      [null, `class Trie {`],
      [null, `  constructor() {`],
      ['init', `    this.words = ${k('new')} Set();`],
      [null, `  }`],
      [null, ``],
      [null, `  insert(word) {`],
      ['add', `    this.words.add(word);`],
      [null, `  }`],
      [null, ``],
      [null, `  search(word) {`],
      ['find', `    ${k('return')} this.words.has(word);`],
      [null, `  }`],
      [null, ``],
      [null, `  startsWith(prefix) {`],
      ['scan', `    ${k('for')} (${k('const')} w ${k('of')} this.words) { ${c('// all of them, on every call')}`],
      ['scan', `      ${k('if')} (!w.startsWith(prefix)) continue;`],
      ['yes', `      ${k('return')} true;`],
      [null, `    }`],
      ['no', `    ${k('return')} false;`],
      [null, `  }`],
      [null, `}`],
    ],
    go: [
      [null, `type Trie struct {`],
      [null, `    words map[string]bool`],
      [null, `}`],
      [null, ``],
      [null, `${k('func')} Constructor() Trie {`],
      ['init', `    ${k('return')} Trie{words: map[string]bool{}}`],
      [null, `}`],
      [null, ``],
      [null, `${k('func')} (t *Trie) Insert(word string) {`],
      ['add', `    t.words[word] = true`],
      [null, `}`],
      [null, ``],
      [null, `${k('func')} (t *Trie) Search(word string) bool {`],
      ['find', `    ${k('return')} t.words[word]`],
      [null, `}`],
      [null, ``],
      [null, `${k('func')} (t *Trie) StartsWith(prefix string) bool {`],
      ['scan', `    ${k('for')} w := ${k('range')} t.words { ${c('// all of them, on every call')}`],
      ['scan', `        ${k('if')} strings.HasPrefix(w, prefix) {`],
      ['yes', `            ${k('return')} true`],
      [null, `        }`],
      [null, `    }`],
      ['no', `    ${k('return')} false`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('use')} std::collections::HashSet;`],
      [null, ``],
      [null, `struct Trie {`],
      [null, `    words: HashSet&lt;String&gt;,`],
      [null, `}`],
      [null, ``],
      [null, `${k('impl')} Trie {`],
      [null, `    ${k('fn')} new() -&gt; ${k('Self')} {`],
      ['init', `        Trie { words: HashSet::new() }`],
      [null, `    }`],
      [null, ``],
      [null, `    ${k('fn')} insert(&amp;${k('mut')} self, word: String) {`],
      ['add', `        self.words.insert(word);`],
      [null, `    }`],
      [null, ``],
      [null, `    ${k('fn')} search(&amp;self, word: String) -&gt; bool {`],
      ['find', `        self.words.contains(&amp;word)`],
      [null, `    }`],
      [null, ``],
      [null, `    ${k('fn')} starts_with(&amp;self, prefix: String) -&gt; bool {`],
      ['scan', `        ${k('for')} w ${k('in')} &amp;self.words { ${c('// all of them, on every call')}`],
      ['scan', `            ${k('if')} w.starts_with(&amp;prefix) {`],
      ['yes', `                ${k('return')} true;`],
      [null, `            }`],
      [null, `        }`],
      ['no', `        false`],
      [null, `    }`],
      [null, `}`],
    ],
  },
  trie: {
    ruby: [
      [null, `class Trie`],
      [null, `  Node = Struct.new(:children, :end)`],
      [null, ``],
      [null, `  ${k('def')} initialize`],
      ['init', `    @root = Node.new({}, false)`],
      [null, `  ${k('end')}`],
      [null, ``],
      [null, `  ${k('def')} insert(word)`],
      ['start', `    node = @root`],
      [null, `    word.each_char ${k('do')} |ch|`],
      ['grow', `      node.children[ch] ||= Node.new({}, false)`],
      ['step', `      node = node.children[ch]`],
      [null, `    ${k('end')}`],
      ['end', `    node.end = true`],
      [null, `  ${k('end')}`],
      [null, ``],
      [null, `  ${k('def')} search(word)`],
      [null, `    node = walk(word)`],
      ['hasword', `    !node.nil? &amp;&amp; node.end`],
      [null, `  ${k('end')}`],
      [null, ``],
      [null, `  ${k('def')} starts_with(prefix)`],
      ['hasprefix', `    !walk(prefix).nil?`],
      [null, `  ${k('end')}`],
      [null, ``],
      [null, `  private`],
      [null, ``],
      [null, `  ${k('def')} walk(s)`],
      ['walk', `    node = @root`],
      [null, `    s.each_char ${k('do')} |ch|`],
      ['next', `      node = node.children[ch]`],
      ['miss', `      ${k('return')} ${k('nil')} ${k('if')} node.nil?`],
      [null, `    ${k('end')}`],
      [null, `    node`],
      [null, `  ${k('end')}`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('class')} Node:`],
      [null, `    ${k('def')} __init__(self):`],
      [null, `        self.children = {}`],
      [null, `        self.end = False`],
      [null, ``],
      [null, ``],
      [null, `${k('class')} Trie:`],
      [null, `    ${k('def')} __init__(self):`],
      ['init', `        self.root = Node()`],
      [null, ``],
      [null, `    ${k('def')} insert(self, word):`],
      ['start', `        node = self.root`],
      [null, `        ${k('for')} ch ${k('in')} word:`],
      ['grow', `            ${k('if')} ch ${k('not')} ${k('in')} node.children:`],
      ['grow', `                node.children[ch] = Node()`],
      ['step', `            node = node.children[ch]`],
      ['end', `        node.end = True`],
      [null, ``],
      [null, `    ${k('def')} search(self, word):`],
      [null, `        node = self.walk(word)`],
      ['hasword', `        ${k('return')} node ${k('is')} ${k('not')} ${k('None')} and node.end`],
      [null, ``],
      [null, `    ${k('def')} startsWith(self, prefix):`],
      ['hasprefix', `        ${k('return')} self.walk(prefix) ${k('is')} ${k('not')} ${k('None')}`],
      [null, ``],
      [null, `    ${k('def')} walk(self, s):`],
      ['walk', `        node = self.root`],
      [null, `        ${k('for')} ch ${k('in')} s:`],
      ['next', `            node = node.children.get(ch)`],
      ['miss', `            ${k('if')} node ${k('is')} ${k('None')}:`],
      ['miss', `                ${k('return')} ${k('None')}`],
      [null, `        ${k('return')} node`],
    ],
    javascript: [
      [null, `class Trie {`],
      [null, `  constructor() {`],
      ['init', `    this.root = { children: {}, end: false };`],
      [null, `  }`],
      [null, ``],
      [null, `  insert(word) {`],
      ['start', `    ${k('let')} node = this.root;`],
      [null, `    ${k('for')} (${k('const')} ch ${k('of')} word) {`],
      ['grow', `      ${k('if')} (!node.children[ch]) node.children[ch] = { children: {}, end: false };`],
      ['step', `      node = node.children[ch];`],
      [null, `    }`],
      ['end', `    node.end = true;`],
      [null, `  }`],
      [null, ``],
      [null, `  search(word) {`],
      [null, `    ${k('const')} node = this.walk(word);`],
      ['hasword', `    ${k('return')} node !== ${k('null')} &amp;&amp; node.end;`],
      [null, `  }`],
      [null, ``],
      [null, `  startsWith(prefix) {`],
      ['hasprefix', `    ${k('return')} this.walk(prefix) !== ${k('null')};`],
      [null, `  }`],
      [null, ``],
      [null, `  walk(s) {`],
      ['walk', `    ${k('let')} node = this.root;`],
      [null, `    ${k('for')} (${k('const')} ch ${k('of')} s) {`],
      ['next', `      node = node.children[ch];`],
      ['miss', `      ${k('if')} (!node) ${k('return')} ${k('null')};`],
      [null, `    }`],
      [null, `    ${k('return')} node;`],
      [null, `  }`],
      [null, `}`],
    ],
    go: [
      [null, `type trieNode struct {`],
      [null, `    children [26]*trieNode`],
      [null, `    end      bool`],
      [null, `}`],
      [null, ``],
      [null, `type Trie struct {`],
      [null, `    root *trieNode`],
      [null, `}`],
      [null, ``],
      [null, `${k('func')} Constructor() Trie {`],
      ['init', `    ${k('return')} Trie{root: &amp;trieNode{}}`],
      [null, `}`],
      [null, ``],
      [null, `${k('func')} (t *Trie) Insert(word string) {`],
      ['start', `    node := t.root`],
      [null, `    ${k('for')} i := 0; i &lt; len(word); i++ {`],
      [null, `        c := word[i] - 'a'`],
      ['grow', `        ${k('if')} node.children[c] == ${k('nil')} {`],
      ['grow', `            node.children[c] = &amp;trieNode{}`],
      [null, `        }`],
      ['step', `        node = node.children[c]`],
      [null, `    }`],
      ['end', `    node.end = true`],
      [null, `}`],
      [null, ``],
      [null, `${k('func')} (t *Trie) Search(word string) bool {`],
      [null, `    node := t.walk(word)`],
      ['hasword', `    ${k('return')} node != ${k('nil')} &amp;&amp; node.end`],
      [null, `}`],
      [null, ``],
      [null, `${k('func')} (t *Trie) StartsWith(prefix string) bool {`],
      ['hasprefix', `    ${k('return')} t.walk(prefix) != ${k('nil')}`],
      [null, `}`],
      [null, ``],
      [null, `${k('func')} (t *Trie) walk(s string) *trieNode {`],
      ['walk', `    node := t.root`],
      [null, `    ${k('for')} i := 0; i &lt; len(s); i++ {`],
      ['next', `        node = node.children[s[i]-'a']`],
      ['miss', `        ${k('if')} node == ${k('nil')} {`],
      ['miss', `            ${k('return')} ${k('nil')}`],
      [null, `        }`],
      [null, `    }`],
      [null, `    ${k('return')} node`],
      [null, `}`],
    ],
    rust: [
      [null, `#[derive(Default)]`],
      [null, `struct Node {`],
      [null, `    children: [Option&lt;Box&lt;Node&gt;&gt;; 26],`],
      [null, `    end: bool,`],
      [null, `}`],
      [null, ``],
      [null, `struct Trie {`],
      [null, `    root: Node,`],
      [null, `}`],
      [null, ``],
      [null, `${k('impl')} Trie {`],
      [null, `    ${k('fn')} new() -&gt; ${k('Self')} {`],
      ['init', `        Trie { root: Node::default() }`],
      [null, `    }`],
      [null, ``],
      [null, `    ${k('fn')} insert(&amp;${k('mut')} self, word: String) {`],
      ['start', `        ${k('let')} ${k('mut')} node = &amp;${k('mut')} self.root;`],
      [null, `        ${k('for')} b ${k('in')} word.bytes() {`],
      [null, `            ${k('let')} slot = &amp;${k('mut')} node.children[(b - b'a') as usize];`],
      ['grow', `            ${k('if')} slot.is_none() {`],
      ['grow', `                *slot = ${k('Some')}(Box::default());`],
      [null, `            }`],
      ['step', `            node = slot.as_mut().unwrap();`],
      [null, `        }`],
      ['end', `        node.end = true;`],
      [null, `    }`],
      [null, ``],
      [null, `    ${k('fn')} search(&amp;self, word: String) -&gt; bool {`],
      ['hasword', `        self.walk(&amp;word).map_or(false, |node| node.end)`],
      [null, `    }`],
      [null, ``],
      [null, `    ${k('fn')} starts_with(&amp;self, prefix: String) -&gt; bool {`],
      ['hasprefix', `        self.walk(&amp;prefix).is_some()`],
      [null, `    }`],
      [null, ``],
      [null, `    ${k('fn')} walk(&amp;self, s: &amp;str) -&gt; Option&lt;&amp;Node&gt; {`],
      ['walk', `        ${k('let')} ${k('mut')} node = &amp;self.root;`],
      [null, `        ${k('for')} b ${k('in')} s.bytes() {`],
      ['next', `            ${k('match')} &amp;node.children[(b - b'a') as usize] {`],
      [null, `                ${k('Some')}(next) =&gt; node = next,`],
      ['miss', `                ${k('None')} =&gt; ${k('return')} ${k('None')},`],
      [null, `            }`],
      [null, `        }`],
      [null, `        ${k('Some')}(node)`],
      [null, `    }`],
      [null, `}`],
    ],
  },
};

/* ---------------- part 1: the "shared beginnings" widget ----------------
 *
 * The statement's point is the prefix. Type one: the words that start with it
 * light up, and the ledger compares the work — a set checks every word, the
 * trie follows one link per letter. The node count shows the sharing: words
 * with a common beginning store it once. */

const QW_SETS = [
  { label: t('car words', 'car word များ'), words: ['car', 'card', 'care', 'cart', 'cat', 'dog'] },
  { label: exampleTitle(1), words: ['apple', 'app'] },
  { label: t('nothing shared', 'မျှမသုံး'), words: ['ox', 'bee', 'cat', 'dog', 'emu'] },
];

function mountPrefixWidget(host) {
  const state = { set: 0, prefix: 'car' };
  host.innerHTML = `
    <div class="q-arr" data-words></div>
    <div class="q-slider">
      <label for="tw-prefix">prefix</label>
      <input id="tw-prefix" class="tw-input" type="text" maxlength="6" autocomplete="off" spellcheck="false" data-prefix>
      <span class="q-presets" data-presets></span>
    </div>
    <p class="q-tie" data-line></p>
    <div class="ledger">
      <span class="expr" data-expr></span>
      <span class="total" data-total></span>
    </div>`;
  const q = (sel) => host.querySelector(sel);
  const input = q('[data-prefix]');

  function render() {
    const { words } = QW_SETS[state.set];
    const p = state.prefix;
    const hits = words.filter((w) => w.startsWith(p));
    const nodes = new Set(words.flatMap((w) => [...w].map((_, i) => w.slice(0, i + 1))));
    const letters = words.reduce((a, w) => a + w.length, 0);
    const reach = [...p].findIndex((_, i) => !nodes.has(p.slice(0, i + 1)));
    const links = reach === -1 ? p.length : reach + 1;
    q('[data-words]').innerHTML = words.map((w) => `<div class="cell ${w.startsWith(p) ? 'kept' : 'cut'} tw-word"><span>${w}</span></div>`).join('');
    q('[data-presets]').innerHTML = presetChips(QW_SETS, state.set);
    if (input.value !== p) input.value = p;
    widgetLabel(pick(t('type a prefix', 'prefix ရိုက်ပါ')));
    q('[data-line]').innerHTML = pick(!p
      ? t('Every word starts with the empty prefix.', 'word တိုင်းသည် prefix ဗလာဖြင့် စသည်။')
      : hits.length
        ? t(`${hits.length} of ${words.length} words start with "${p}". The trie knows after following ${p.length} ${p.length === 1 ? 'link' : 'links'}, however many words there are; the set has to check words until it finds one.`,
            `word ${words.length} ခုအနက် ${hits.length} ခုသည် "${p}" ဖြင့် စသည်။ word မည်မျှပင် ရှိစေ trie သည် link ${p.length} ခု လိုက်ပြီးနောက် သိသည် — set သည် တစ်ခု တွေ့သည်အထိ word များကို စစ်ရသည်။`)
        : t(`No word starts with "${p}". The trie finds out after ${links} ${links === 1 ? 'link' : 'links'}, when the letter it needs is missing; the set only after checking all ${words.length} words.`,
            `"${p}" ဖြင့် စသော word မရှိ။ trie သည် လိုသော စာလုံး မရှိသည့်အခါ link ${links} ခုအပြီး သိသည် — set သည် word ${words.length} ခုလုံး စစ်ပြီးမှ သိသည်။`));
    q('[data-expr]').innerHTML = pick(t(`${letters} letters stored as words · ${nodes.size} trie nodes`, `word အဖြစ် စာလုံး ${letters} · trie node ${nodes.size}`));
    q('[data-total]').innerHTML = `${hits.length}<small>${pick(t('words match', 'word ကိုက်'))}</small>`;
  }
  input.addEventListener('input', () => { state.prefix = input.value.toLowerCase().replace(/[^a-z]/g, '').slice(0, 6); render(); });
  host.addEventListener('click', (ev) => {
    const chip = ev.target.closest('[data-set]');
    if (chip) { state.set = Number(chip.dataset.set); state.prefix = QW_SETS[state.set].words[0].slice(0, 2); render(); }
  });
  onLangChange(render);
  render();
}

/* ---------------- the approach, in brief ---------------- */

const APPROACH = {
  set: {
    idea: t('Store the whole words in a hash set. insert and search are single lookups; startsWith has no index to use, so it checks words one by one.',
            'word အပြည့်များကို hash set ထဲ သိမ်းသည်။ insert နှင့် search သည် lookup တစ်ကြိမ်စီ — startsWith သည် သုံးစရာ index မရှိသဖြင့် word များကို တစ်ခုချင်း စစ်သည်။'),
    steps: [
      t('<code>insert</code>: add the word to <code>words</code>.', '<code>insert</code> — word ကို <code>words</code> ထဲ ထည့်သည်။'),
      t('<code>search</code>: is it in <code>words</code>?', '<code>search</code> — <code>words</code> ထဲ ရှိသလား။'),
      t('<code>startsWith</code>: for each <code>w</code>, does it start with <code>prefix</code>? Stop at the first that does.', '<code>startsWith</code> — <code>w</code> တစ်ခုစီသည် <code>prefix</code> ဖြင့် စသလား။ ပထမဆုံး စသည်တွင် ရပ်သည်။'),
    ],
    cost: t('startsWith is O(number of words × prefix length) — every call, even when nothing matches.', 'startsWith သည် O(word အရေအတွက် × prefix အရှည်) — ဘာမှ မကိုက်သည့်အခါပင် call တိုင်း။'),
  },
  trie: {
    idea: t('Store words letter by letter along paths from a root, so shared beginnings share nodes. Every question becomes a walk of one link per letter; search also checks that a word ends where the walk stops.',
            'word များကို root မှ လမ်းကြောင်းများတစ်လျှောက် စာလုံးအလိုက် သိမ်းသဖြင့် တူသော အစများသည် node များကို မျှသုံးသည်။ မေးခွန်းတိုင်းသည် စာလုံးတစ်ခုလျှင် link တစ်ခု လျှောက်ခြင်း ဖြစ်လာသည် — search သည် walk ရပ်သည့်နေရာတွင် word ဆုံးသလားလည်း စစ်သည်။'),
    steps: [
      t('<code>insert</code>: from <code>root</code>, follow each letter, making a child where one is missing; mark the last node <code>end</code>.',
        '<code>insert</code> — <code>root</code> မှ စာလုံးတစ်ခုစီကို လိုက်၊ မရှိလျှင် child လုပ်၊ နောက်ဆုံး node ကို <code>end</code> မှတ်သည်။'),
      t('<code>walk(s)</code>: follow each letter of <code>s</code>; a missing child means no stored word starts with <code>s</code>.',
        '<code>walk(s)</code> — <code>s</code> ၏ စာလုံးတစ်ခုစီကို လိုက် — child မရှိလျှင် <code>s</code> ဖြင့် စသော word မသိမ်းထား။'),
      t('<code>search</code>: the walk succeeds and the node is <code>end</code>. <code>startsWith</code>: the walk succeeds.',
        '<code>search</code> — walk အောင်ပြီး node သည် <code>end</code>။ <code>startsWith</code> — walk အောင်သည်။'),
    ],
    cost: t('Every call is O(length of its word), independent of how many words are stored. The price is memory: a node per distinct prefix.',
            'call တိုင်းသည် O(၎င်း၏ word အရှည်) ဖြစ်ပြီး သိမ်းထားသော word အရေအတွက်နှင့် မသက်ဆိုင်။ ပေးရသည့် တန်ဖိုးမှာ memory — ကွဲပြားသော prefix တစ်ခုလျှင် node တစ်ခု။'),
  },
};

/* ---------------- mount ---------------- */

const EX1 = [['insert', 'apple'], ['search', 'apple'], ['search', 'app'], ['startsWith', 'app'], ['insert', 'app'], ['search', 'app']];

mountLesson({
  input: { ops: EX1 },
  controls: [
    { key: 'ops', label: t('calls', 'call များ'), value: fmtOps(EX1), parse: parseOps, format: fmtOps },
  ],
  presets: [
    { label: exampleTitle(1), input: { ops: EX1 } },
    { label: t('shared beginnings', 'တူသော အစ'), input: { ops: [['insert', 'car'], ['insert', 'cart'], ['insert', 'cat'], ['startsWith', 'ca'], ['search', 'ca'], ['startsWith', 'cab']] } },
    { label: t('a prefix nobody has', 'မည်သူမျှ မရှိသော prefix'), input: { ops: [['insert', 'ox'], ['insert', 'bee'], ['insert', 'dog'], ['insert', 'emu'], ['startsWith', 'z']] } },
  ],
  examples: [
    { title: exampleTitle(1),
      inputHtml: '<code>["Trie","insert","search","search","startsWith","insert","search"]<br>[[],["apple"],["apple"],["app"],["app"],["app"],["app"]]</code>',
      output: '[null,null,true,false,true,null,true]',
      why: [
        t('search("app") is false at first: "app" is only the start of "apple" until it is inserted itself.', 'search("app") သည် အစတွင် false — "app" ကိုယ်တိုင် မထည့်မချင်း "apple" ၏ အစသာ ဖြစ်သည်။'),
        t('startsWith("app") is true all along, because "apple" starts with it.', 'startsWith("app") သည် တစ်လျှောက်လုံး true — "apple" သည် ၎င်းဖြင့် စသောကြောင့်။'),
      ],
      load: { ops: EX1 } },
  ],
  modes: [
    { id: 'set', name: 'Word set',
      sub: t('no trie', 'trie မဟုတ်'),
      desc: t('Whole words in a hash set; startsWith checks every one.', 'word အပြည့်များ hash set ထဲ — startsWith သည် တစ်ခုချင်း စစ်သည်။'),
      cost: 'startsWith O(words · p)', build: buildSet },
    { id: 'trie', name: 'Trie',
      desc: t('Letters along paths from a root; every call walks its word.', 'root မှ လမ်းကြောင်းများတစ်လျှောက် စာလုံးများ — call တိုင်း ၎င်း၏ word ကို လျှောက်သည်။'),
      cost: 'O(length) per call', build: buildTrie },
  ],
  languages: LANGUAGES,
  code: CODE,
  hover: { ruby: { '@words': 'words', '@root': 'root' } },
  solutions: {
    set: { approach: APPROACH.set,
      desc: t('Correct, and fine for search — but startsWith scans the whole set, which is exactly the question a prefix tree exists to answer.',
              'မှန်ပြီး search အတွက် အဆင်ပြေသည် — သို့သော် startsWith သည် set တစ်ခုလုံးကို scan လုပ်သည်၊ ၎င်းသည် prefix tree ရှိရခြင်း၏ အကြောင်း ဖြစ်သော မေးခွန်း အတိအကျ။') },
    trie: { approach: APPROACH.trie,
      desc: t('The structure the problem is named after. Go and Rust give each node a fixed array of 26 children; the others use a map from letter to child.',
              'ပြဿနာ၏ အမည်ဖြစ်သော structure။ Go နှင့် Rust သည် node တစ်ခုစီကို child 26 ခု array ပုံသေ ပေးသည် — အခြားများသည် စာလုံးမှ child သို့ map ကို သုံးသည်။') },
  },
  // How each language was actually checked, printed as the part 3 badges.
  // The corpus: the example, 6 edges, 15,000 random runs of up to 20 calls
  // over two or three letters, 5,000 of up to 300 calls, and four of 3 × 10⁴
  // calls (2,000-letter words, random words, 20,000 prefix queries that miss
  // 10,000 words) — against a sorted-list oracle. Go and Rust ran in Docker
  // (golang:1.23-alpine, rust:1-slim).
  verification: {
    ruby: 'ran here · 20,011 cases',
    python: 'ran here · 20,011 cases',
    javascript: 'ran here · 20,011 cases',
    go: 'ran here · 20,011 cases · Go 1.23',
    rust: 'ran here · 20,011 cases · rustc 1.98',
  },
  stripLabel: t('The calls, in order', 'call များ — အစီအစဉ်အတိုင်း'),
  strip,
  draw,
  answer,
  vars,
  widget: mountPrefixWidget,
});
