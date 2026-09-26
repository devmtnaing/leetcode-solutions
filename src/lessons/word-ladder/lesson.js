/* Word Ladder — LeetCode 127.
 *
 * The words are the nodes of a graph, joined when they differ in one letter,
 * and the shortest ladder is a shortest path: a breadth-first search from
 * beginWord, counting words level by level. The two approaches differ only
 * in how a word finds its neighbours. Comparing it with every word not yet
 * reached costs O(n · L) per word — O(n² · L) in all. Changing each of its L
 * letters to each of 26 others and asking a hash set costs 26 · L lookups,
 * however long the list is.
 */
import { mountLesson } from '../../lib/stepper.js';
import { pick, onLangChange } from '../../lib/i18n.js';
import { cells, slots, stagePanel, readout } from '../../lib/stage.js';
import { t, exampleTitle, LANGUAGES, k, c, labelledRows, stageRow, stageGap, presetChips, widgetLabel } from '../../lib/kit.js';

const MAX_WORDS = 10, MAX_LEN = 5;

function parseWord(text) {
  const w = String(text).trim().replace(/^"|"$/g, '');
  if (!/^[a-z]+$/.test(w)) throw new Error('one lowercase word, like hit');
  if (w.length > MAX_LEN) throw new Error(`words up to ${MAX_LEN} letters here, so the stage stays readable`);
  return w;
}
function parseWords(text) {
  const ws = String(text).replace(/[[\]]/g, '').split(/[,\s]+/).map((w) => w.trim().replace(/^"|"$/g, '')).filter(Boolean);
  if (!ws.length || ws.some((w) => !/^[a-z]+$/.test(w))) throw new Error('lowercase words, like hot, dot, dog');
  if (ws.length > MAX_WORDS) throw new Error(`at most ${MAX_WORDS} words, so the stage stays readable`);
  if (new Set(ws).size !== ws.length) throw new Error('each word only once — the statement says they are unique');
  return ws;
}
const fmtWords = (ws) => ws.join(', ');

function check({ beginWord: b, endWord: e, wordList: ws }) {
  if (b === e) throw new Error('beginWord and endWord must differ');
  if (e.length !== b.length || ws.some((w) => w.length !== b.length)) throw new Error(`every word the same length as beginWord, ${b.length}`);
}

const diffs = (a, b) => [...a].reduce((n, ch, i) => n + (ch !== b[i]), 0);
const ALPHA = 'abcdefghijklmnopqrstuvwxyz';

/* ---------------- step generators ---------------- */

function start(input, view) {
  check(input);
  const { beginWord: b, endWord: e, wordList: ws } = input;
  const state = { queue: [[b, 1]], head: 0, reached: [], steps: [] };
  state.snap = (extra) => ({ view, queue: state.queue.slice(state.head).map((x) => [...x]), reached: [...state.reached],
    word: null, other: null, match: null, i: null, ...extra });
  if (!ws.includes(e)) {
    state.steps.push(state.snap({ line: 'check', finished: true, answer: 0, queue: [], tag: t('return 0', '0 ပြန်'),
      note: t(`"${e}" is not in wordList, and every word after beginWord must be. No ladder can end there: return <b>0</b> before searching.`,
              `"${e}" သည် wordList ထဲ မရှိ — beginWord နောက်မှ စကားလုံးတိုင်း ရှိရမည်။ ladder တစ်ခုမှ ထိုနေရာတွင် မဆုံးနိုင် — မရှာမီ <b>0</b> ကို ပြန်ပေးသည်။`) }));
    state.done = true;
  } else {
    state.steps.push(state.snap({ line: 'check', queue: [], tag: t('in the list', 'list ထဲ ရှိ'),
      note: t(`"${e}" is in wordList, so a ladder can end there. Search.`, `"${e}" သည် wordList ထဲ ရှိသဖြင့် ladder တစ်ခု ထိုနေရာတွင် ဆုံးနိုင်သည်။ ရှာမည်။`) }));
  }
  return state;
}

function popStep(S, e) {
  const [word, steps] = S.queue[S.head++];
  if (word === e) {
    S.steps.push(S.snap({ line: 'found', word, steps, finished: true, answer: steps, tag: t(`return ${steps}`, `${steps} ပြန်`),
      note: t(`"${word}" is endWord. It came off the queue at level ${steps}, and a breadth-first search takes every word in order of how many words its ladder needs — so none is shorter. Return <b>${steps}</b>.`,
              `"${word}" သည် endWord။ ၎င်းသည် level ${steps} တွင် queue မှ ထွက်လာပြီး breadth-first search သည် စကားလုံးတိုင်းကို ၎င်း၏ ladder လိုသော စကားလုံး အရေအတွက် အစဉ်အတိုင်း ယူသည် — ထို့ကြောင့် ပိုတိုသည် မရှိ။ <b>${steps}</b> ကို ပြန်ပေးသည်။`) }));
    return null;
  }
  S.steps.push(S.snap({ line: 'pop', word, steps, tag: t(`pop ${word}`, `${word} ထုတ်`),
    note: t(`Take "${word}" from the front: a ladder of ${steps} ${steps === 1 ? 'word' : 'words'} reaches it. Now find the words one letter away that nothing has reached yet.`,
            `ရှေ့ဆုံးမှ "${word}" ကို ယူသည် — စကားလုံး ${steps} ခု ladder က ၎င်းသို့ ရောက်သည်။ ယခု မည်သည့်အရာမှ မရောက်ရသေးသော စာလုံးတစ်လုံးသာ ကွာသည့် စကားလုံးများကို ရှာသည်။`) }));
  return [word, steps];
}

function finishNone(S) {
  S.steps.push(S.snap({ line: 'ret', finished: true, answer: 0, tag: t('return 0', '0 ပြန်'),
    note: t('The queue is empty and endWord was never reached: every word a ladder can get to has been tried. Return <b>0</b>.',
            'queue ဗလာ ဖြစ်ပြီး endWord ကို ဘယ်တော့မှ မရောက်ခဲ့ — ladder ရောက်နိုင်သော စကားလုံးတိုင်းကို စမ်းပြီးပြီ။ <b>0</b> ကို ပြန်ပေးသည်။') }));
}

function buildPairs(input) {
  const S = start(input, 'pairs');
  if (S.done) return S.steps;
  const { beginWord: b, endWord: e, wordList: ws } = input;
  let unseen = ws.filter((w) => w !== b);
  const old = S.snap;
  S.snap = (extra) => old({ unseen: [...unseen], ...extra });
  S.steps.push(S.snap({ line: 'init', tag: t(`queue ${b}`, `queue ${b}`),
    note: t(`Start the queue with "${b}" at 1 word; every other listed word is unreached.`,
            `queue ကို "${b}" (စကားလုံး 1 ခု) ဖြင့် စသည် — ကျန် စကားလုံးတိုင်း မရောက်ရသေး။`) }));
  while (S.head < S.queue.length) {
    const got = popStep(S, e);
    if (!got) return S.steps;
    const [word, steps] = got;
    const rest = [];
    for (const other of unseen) {
      const d = diffs(word, other);
      S.steps.push(S.snap({ line: 'scan', word, steps, other, match: d === 1, tag: d === 1 ? t('one apart', 'တစ်လုံး ကွာ') : t(`${d} apart`, `${d} လုံး ကွာ`),
        note: d === 1
          ? t(`"${word}" and "${other}" differ in exactly one letter: a step on the ladder.`, `"${word}" နှင့် "${other}" သည် စာလုံး တစ်လုံးတည်း ကွာသည် — ladder ပေါ်ရှိ တစ်ဆင့်။`)
          : t(`"${word}" and "${other}" differ in ${d} letters: not one step.`, `"${word}" နှင့် "${other}" သည် စာလုံး ${d} လုံး ကွာသည် — တစ်ဆင့် မဟုတ်။`) }));
      if (d === 1) {
        S.queue.push([other, steps + 1]);
        S.reached.push(other);
        S.steps.push(S.snap({ line: 'push', word, steps, other, match: true, tag: t(`queue ${other}`, `${other} queue`),
          note: t(`Queue "${other}" at ${steps + 1} words. It will not stay in the unreached list — no later, longer ladder can claim it.`,
                  `"${other}" ကို စကားလုံး ${steps + 1} ခုဖြင့် queue ထဲ ထည့်သည်။ ၎င်းသည် မရောက်ရသေးသော list ထဲ မနေတော့ — နောက်ပိုင်း ပိုရှည်သော ladder က မယူနိုင်။`) }));
      } else rest.push(other);
    }
    unseen = rest;
    S.steps.push(S.snap({ line: 'keep', word, steps, tag: t(`${unseen.length} unreached`, `မရောက်သေး ${unseen.length}`),
      note: t(`"${word}" was compared with every unreached word. ${unseen.length} ${unseen.length === 1 ? 'is' : 'are'} still unreached, and the next word compares with all of them again.`,
              `"${word}" ကို မရောက်ရသေးသော စကားလုံးတိုင်းနှင့် နှိုင်းယှဉ်ပြီးပြီ။ ${unseen.length} ခု မရောက်ရသေးဘဲ နောက်စကားလုံးက ၎င်းတို့အားလုံးနှင့် ထပ်နှိုင်းယှဉ်မည်။`) }));
  }
  finishNone(S);
  return S.steps;
}

function buildLetters(input) {
  const S = start(input, 'letters');
  if (S.done) return S.steps;
  const { beginWord: b, endWord: e, wordList: ws } = input;
  const unseen = new Set(ws.filter((w) => w !== b));
  const old = S.snap;
  S.snap = (extra) => old({ unseen: ws.filter((w) => unseen.has(w)), ...extra });
  S.steps.push(S.snap({ line: 'init', tag: t(`queue ${b}`, `queue ${b}`),
    note: t(`The list is in a hash set. Start the queue with "${b}" at 1 word.`,
            `list သည် hash set ထဲ ရှိသည်။ queue ကို "${b}" (စကားလုံး 1 ခု) ဖြင့် စသည်။`) }));
  while (S.head < S.queue.length) {
    const got = popStep(S, e);
    if (!got) return S.steps;
    const [word, steps] = got;
    for (let i = 0; i < word.length; i++) {
      const found = [...ALPHA].map((ch) => word.slice(0, i) + ch + word.slice(i + 1)).filter((w) => unseen.has(w));
      const pattern = `${word.slice(0, i)}?${word.slice(i + 1)}`;
      S.steps.push(S.snap({ line: 'try', word, steps, i, pattern, found, tag: t(`${pattern}: ${found.length} found`, `${pattern} — ${found.length} တွေ့`),
        note: found.length
          ? t(`Try all 26 letters at position ${i}: ${pattern} — 26 lookups in the set. Unreached: ${found.map((w) => `"${w}"`).join(', ')}.`,
              `နေရာ ${i} တွင် စာလုံး 26 လုံးစလုံး စမ်းသည် — ${pattern} — set ထဲ lookup 26 ကြိမ်။ မရောက်ရသေး — ${found.map((w) => `"${w}"`).join(', ')}။`)
          : t(`Try all 26 letters at position ${i}: ${pattern} — 26 lookups, and none is an unreached word.`,
              `နေရာ ${i} တွင် စာလုံး 26 လုံးစလုံး စမ်းသည် — ${pattern} — lookup 26 ကြိမ်၊ မရောက်ရသေးသော စကားလုံး မရှိ။`) }));
      for (const other of found) {
        unseen.delete(other);
        S.queue.push([other, steps + 1]);
        S.reached.push(other);
        S.steps.push(S.snap({ line: 'push', word, steps, i, pattern, found, other, match: true, tag: t(`queue ${other}`, `${other} queue`),
          note: t(`Take "${other}" out of the set and queue it at ${steps + 1} words.`, `"${other}" ကို set ထဲမှ ထုတ်ပြီး စကားလုံး ${steps + 1} ခုဖြင့် queue ထဲ ထည့်သည်။`) }));
      }
    }
  }
  finishNone(S);
  return S.steps;
}

/* ---------------- drawing ----------------
 *
 * The strip card is the input: beginWord, then wordList, with the word being
 * expanded in amber, the word it is compared with (or just found) green or
 * red, and every word already reached solid. The stage is the BFS queue,
 * front first, each word with the ladder length that reached it, and what is
 * still unreached — a list to compare against, or a set to look up in. */

function strip(s, { beginWord: b, wordList: ws }) {
  const reached = new Set(s.reached);
  const tone = (w) => (w === s.word ? 'inwin' : w === s.other ? (s.match ? 'entering' : 'leaving') : reached.has(w) ? 'set' : null);
  const row = (list) => cells(list, { tone: Object.fromEntries(list.map((w, i) => [i, tone(w)]).filter(([, x]) => x)) });
  return `<div class="wl">${labelledRows([['begin', row([b])], ['list', row(ws)]])}</div>`;
}

function draw(s) {
  const q = s.queue.map(([w, n]) => `${w} ${n}`);
  const queue = stagePanel(pick(t('The queue, front first — word and ladder length', 'Queue — ရှေ့ဆုံးမှ — စကားလုံးနှင့် ladder အရှည်')),
    pick(t(`${s.queue.length} waiting`, `${s.queue.length} ခု စောင့်`)),
    `<div class="wl">${stageRow(cells(q, { index: false, tone: s.other && s.match ? Object.fromEntries(q.map((x, i) => [i, x.startsWith(`${s.other} `) ? 'entering' : null]).filter(([, v]) => v)) : {} }), pick(t('empty', 'ဗလာ')))}</div>`);
  const unseen = s.unseen ?? [];
  const un = cells(unseen, { index: false, tone: Object.fromEntries(unseen.map((w, i) => [i, w === s.other ? (s.match ? 'entering' : 'leaving') : null]).filter(([, v]) => v)) });
  const title = s.view === 'pairs'
    ? pick(t('unseen — a list, compared word by word', 'unseen — စကားလုံးတစ်ခုချင်း နှိုင်းယှဉ်သော list'))
    : pick(t('unseen — a hash set, looked up', 'unseen — lookup လုပ်သော hash set'));
  const pieces = [queue, stagePanel(title, pick(t(`${unseen.length} left`, `${unseen.length} ကျန်`)), `<div class="wl">${stageRow(un, pick(t('empty', 'ဗလာ')))}</div>`)];
  if (s.view === 'letters' && s.pattern) {
    pieces.push(stagePanel(pick(t('Position being changed', 'ပြောင်းနေသော နေရာ')), `${s.pattern} · 26 ${pick(t('lookups', 'lookup'))}`,
      `<div class="wl">${stageRow(cells(s.found, { index: false, tone: Object.fromEntries(s.found.map((w, i) => [i, 'entering'])) }), pick(t('no unreached word fits', 'ကိုက်ညီသော မရောက်ရသေးသည့် စကားလုံး မရှိ')))}</div>`));
  }
  return pieces.join(stageGap) + (s.word ? stageGap + readout({ word: s.word, steps: s.steps }) : '');
}

function answer(s) {
  return {
    html: slots(s.finished ? [s.answer] : [], { total: 1, just: s.finished ? 0 : -1 }),
    note: s.finished ? t('words in the shortest ladder', 'အတိုဆုံး ladder ရှိ စကားလုံး') : t('one number', 'ကိန်း တစ်ခု'),
  };
}

function vars(s) {
  const out = [];
  if (s.word) out.push(['word', `"${s.word}"`], ['steps', s.steps]);
  if (s.other) out.push(['other', `"${s.other}"`]);
  if (s.i != null) out.push(['i', s.i]);
  out.push(['unseen', `[${(s.unseen ?? []).map((w) => `"${w}"`).join(', ')}]`]);
  out.push(['queue', `[${s.queue.map(([w, n]) => `(${w}, ${n})`).join(', ')}]`]);
  return out;
}

/* ---------------- the code, one key per line ----------------
 *
 * Generated from the verified solution files, so the listing a reader copies
 * is byte-identical to the one that ran. */

const CODE = {
  pairs: {
    ruby: [
      [null, `${k('def')} ladder_length(begin_word, end_word, word_list)`],
      ['check', `  ${k('return')} 0 ${k('unless')} word_list.include?(end_word)`],
      [null, `  unseen = word_list - [begin_word] ${c('# words no path has reached yet')}`],
      ['init', `  queue = [[begin_word, 1]]`],
      [null, `  ${k('until')} queue.empty?`],
      ['pop', `    word, steps = queue.shift`],
      ['found', `    ${k('return')} steps ${k('if')} word == end_word`],
      [null, `    rest = []`],
      [null, `    unseen.each ${k('do')} |other|`],
      ['scan', `      ${k('if')} one_apart?(word, other)`],
      ['push', `        queue &lt;&lt; [other, steps + 1]`],
      [null, `      ${k('else')}`],
      [null, `        rest &lt;&lt; other`],
      [null, `      ${k('end')}`],
      [null, `    ${k('end')}`],
      ['keep', `    unseen = rest`],
      [null, `  ${k('end')}`],
      ['ret', `  0`],
      [null, `${k('end')}`],
      [null, ``],
      [null, `${k('def')} one_apart?(a, b) ${c('# exactly one letter differs')}`],
      [null, `  diff = 0`],
      [null, `  a.length.times ${k('do')} |i|`],
      [null, `    next ${k('if')} a[i] == b[i]`],
      [null, `    diff += 1`],
      [null, `    ${k('return')} false ${k('if')} diff &gt; 1`],
      [null, `  ${k('end')}`],
      [null, `  diff == 1`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('from')} collections ${k('import')} deque`],
      [null, ``],
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} ladderLength(self, beginWord, endWord, wordList):`],
      ['check', `        ${k('if')} endWord ${k('not')} ${k('in')} wordList:`],
      ['check', `            ${k('return')} 0`],
      [null, `        unseen = [w ${k('for')} w ${k('in')} wordList ${k('if')} w != beginWord]    ${c('# words no path has reached yet')}`],
      ['init', `        queue = deque([(beginWord, 1)])`],
      [null, `        ${k('while')} queue:`],
      ['pop', `            word, steps = queue.popleft()`],
      ['found', `            ${k('if')} word == endWord:`],
      ['found', `                ${k('return')} steps`],
      [null, `            rest = []`],
      [null, `            ${k('for')} other ${k('in')} unseen:`],
      ['scan', `                ${k('if')} one_apart(word, other):`],
      ['push', `                    queue.append((other, steps + 1))`],
      [null, `                ${k('else')}:`],
      [null, `                    rest.append(other)`],
      ['keep', `            unseen = rest`],
      ['ret', `        ${k('return')} 0`],
      [null, ``],
      [null, ``],
      [null, `${k('def')} one_apart(a, b):                                        ${c('# exactly one letter differs')}`],
      [null, `    diff = 0`],
      [null, `    ${k('for')} x, y ${k('in')} zip(a, b):`],
      [null, `        ${k('if')} x != y:`],
      [null, `            diff += 1`],
      [null, `            ${k('if')} diff &gt; 1:`],
      [null, `                ${k('return')} False`],
      [null, `    ${k('return')} diff == 1`],
    ],
    javascript: [
      [null, `${k('var')} ladderLength = ${k('function')} (beginWord, endWord, wordList) {`],
      ['check', `  ${k('if')} (!wordList.includes(endWord)) ${k('return')} 0;`],
      [null, `  ${k('let')} unseen = wordList.filter((w) =&gt; w !== beginWord); ${c('// words no path has reached yet')}`],
      ['init', `  ${k('const')} queue = [[beginWord, 1]];`],
      [null, `  ${k('for')} (${k('let')} head = 0; head &lt; queue.length; head++) {`],
      ['pop', `    ${k('const')} [word, steps] = queue[head];`],
      ['found', `    ${k('if')} (word === endWord) ${k('return')} steps;`],
      [null, `    ${k('const')} rest = [];`],
      [null, `    ${k('for')} (${k('const')} other ${k('of')} unseen) {`],
      ['scan', `      ${k('if')} (!oneApart(word, other)) rest.push(other);`],
      ['push', `      ${k('else')} queue.push([other, steps + 1]);`],
      [null, `    }`],
      ['keep', `    unseen = rest;`],
      [null, `  }`],
      ['ret', `  ${k('return')} 0;`],
      [null, `};`],
      [null, ``],
      [null, `${k('const')} oneApart = (a, b) =&gt; { ${c('// exactly one letter differs')}`],
      [null, `  ${k('let')} diff = 0;`],
      [null, `  ${k('for')} (${k('let')} i = 0; i &lt; a.length; i++) {`],
      [null, `    ${k('if')} (a[i] !== b[i] &amp;&amp; ++diff &gt; 1) ${k('return')} false;`],
      [null, `  }`],
      [null, `  ${k('return')} diff === 1;`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} ladderLength(beginWord string, endWord string, wordList []string) int {`],
      [null, `    unseen := []string{}                     ${c('// words no path has reached yet')}`],
      [null, `    found := false`],
      [null, `    ${k('for')} _, w := ${k('range')} wordList {`],
      ['check', `        found = found || w == endWord`],
      [null, `        ${k('if')} w != beginWord {`],
      [null, `            unseen = append(unseen, w)`],
      [null, `        }`],
      [null, `    }`],
      ['check', `    ${k('if')} !found {`],
      ['check', `        ${k('return')} 0`],
      [null, `    }`],
      [null, `    type item struct {`],
      [null, `        word  string`],
      [null, `        steps int`],
      [null, `    }`],
      ['init', `    queue := []item{{beginWord, 1}}`],
      [null, `    ${k('for')} len(queue) &gt; 0 {`],
      ['pop', `        cur := queue[0]`],
      ['pop', `        queue = queue[1:]`],
      ['found', `        ${k('if')} cur.word == endWord {`],
      ['found', `            ${k('return')} cur.steps`],
      [null, `        }`],
      [null, `        rest := []string{}`],
      [null, `        ${k('for')} _, other := ${k('range')} unseen {`],
      ['scan', `            ${k('if')} oneApart(cur.word, other) {`],
      ['push', `                queue = append(queue, item{other, cur.steps + 1})`],
      [null, `            } ${k('else')} {`],
      [null, `                rest = append(rest, other)`],
      [null, `            }`],
      [null, `        }`],
      ['keep', `        unseen = rest`],
      [null, `    }`],
      ['ret', `    ${k('return')} 0`],
      [null, `}`],
      [null, ``],
      [null, `${k('func')} oneApart(a, b string) bool {           ${c('// exactly one letter differs')}`],
      [null, `    diff := 0`],
      [null, `    ${k('for')} i := 0; i &lt; len(a); i++ {`],
      [null, `        ${k('if')} a[i] != b[i] {`],
      [null, `            diff++`],
      [null, `            ${k('if')} diff &gt; 1 {`],
      [null, `                ${k('return')} false`],
      [null, `            }`],
      [null, `        }`],
      [null, `    }`],
      [null, `    ${k('return')} diff == 1`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('use')} std::collections::VecDeque;`],
      [null, ``],
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} ladder_length(begin_word: String, end_word: String, word_list: Vec&lt;String&gt;) -&gt; i32 {`],
      ['check', `        ${k('if')} !word_list.contains(&amp;end_word) {`],
      ['check', `            ${k('return')} 0;`],
      [null, `        }`],
      [null, `        ${c('// words no path has reached yet')}`],
      [null, `        ${k('let')} ${k('mut')} unseen: Vec&lt;String&gt; = word_list.into_iter().filter(|w| *w != begin_word).collect();`],
      ['init', `        ${k('let')} ${k('mut')} queue = VecDeque::from([(begin_word, 1)]);`],
      ['pop', `        ${k('while')} ${k('let')} ${k('Some')}((word, steps)) = queue.pop_front() {`],
      ['found', `            ${k('if')} word == end_word {`],
      ['found', `                ${k('return')} steps;`],
      [null, `            }`],
      [null, `            ${k('let')} ${k('mut')} rest = vec![];`],
      [null, `            ${k('for')} other ${k('in')} unseen {`],
      ['scan', `                ${k('if')} ${k('Self')}::one_apart(&amp;word, &amp;other) {`],
      ['push', `                    queue.push_back((other, steps + 1));`],
      [null, `                } ${k('else')} {`],
      [null, `                    rest.push(other);`],
      [null, `                }`],
      [null, `            }`],
      ['keep', `            unseen = rest;`],
      [null, `        }`],
      ['ret', `        0`],
      [null, `    }`],
      [null, ``],
      [null, `    ${c('// exactly one letter differs')}`],
      [null, `    ${k('fn')} one_apart(a: &amp;str, b: &amp;str) -&gt; bool {`],
      [null, `        a.bytes().zip(b.bytes()).filter(|(x, y)| x != y).take(2).count() == 1`],
      [null, `    }`],
      [null, `}`],
    ],
  },
  letters: {
    ruby: [
      [null, `require 'set'`],
      [null, ``],
      [null, `${k('def')} ladder_length(begin_word, end_word, word_list)`],
      [null, `  unseen = word_list.to_set ${c('# words no path has reached yet')}`],
      ['check', `  ${k('return')} 0 ${k('unless')} unseen.include?(end_word)`],
      [null, `  unseen.delete(begin_word)`],
      ['init', `  queue = [[begin_word, 1]]`],
      [null, `  ${k('until')} queue.empty?`],
      ['pop', `    word, steps = queue.shift`],
      ['found', `    ${k('return')} steps ${k('if')} word == end_word`],
      [null, `    word.length.times ${k('do')} |i|`],
      [null, `      ('a'..'z').each ${k('do')} |ch|`],
      ['try', `        other = word[0...i] + ch + word[i + 1..]`],
      ['try', `        next ${k('unless')} unseen.include?(other)`],
      ['push', `        unseen.delete(other)`],
      ['push', `        queue &lt;&lt; [other, steps + 1]`],
      [null, `      ${k('end')}`],
      [null, `    ${k('end')}`],
      [null, `  ${k('end')}`],
      ['ret', `  0`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('from')} collections ${k('import')} deque`],
      [null, ``],
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} ladderLength(self, beginWord, endWord, wordList):`],
      [null, `        unseen = set(wordList)                              ${c('# words no path has reached yet')}`],
      ['check', `        ${k('if')} endWord ${k('not')} ${k('in')} unseen:`],
      ['check', `            ${k('return')} 0`],
      [null, `        unseen.discard(beginWord)`],
      ['init', `        queue = deque([(beginWord, 1)])`],
      [null, `        ${k('while')} queue:`],
      ['pop', `            word, steps = queue.popleft()`],
      ['found', `            ${k('if')} word == endWord:`],
      ['found', `                ${k('return')} steps`],
      [null, `            ${k('for')} i ${k('in')} range(len(word)):`],
      [null, `                ${k('for')} ch ${k('in')} 'abcdefghijklmnopqrstuvwxyz':`],
      ['try', `                    other = word[:i] + ch + word[i + 1:]`],
      ['try', `                    ${k('if')} other ${k('in')} unseen:`],
      ['push', `                        unseen.remove(other)`],
      ['push', `                        queue.append((other, steps + 1))`],
      ['ret', `        ${k('return')} 0`],
    ],
    javascript: [
      [null, `${k('var')} ladderLength = ${k('function')} (beginWord, endWord, wordList) {`],
      [null, `  ${k('const')} unseen = ${k('new')} Set(wordList); ${c('// words no path has reached yet')}`],
      ['check', `  ${k('if')} (!unseen.has(endWord)) ${k('return')} 0;`],
      [null, `  unseen.delete(beginWord);`],
      ['init', `  ${k('const')} queue = [[beginWord, 1]];`],
      [null, `  ${k('for')} (${k('let')} head = 0; head &lt; queue.length; head++) {`],
      ['pop', `    ${k('const')} [word, steps] = queue[head];`],
      ['found', `    ${k('if')} (word === endWord) ${k('return')} steps;`],
      [null, `    ${k('for')} (${k('let')} i = 0; i &lt; word.length; i++) {`],
      [null, `      ${k('for')} (${k('let')} ch = 97; ch &lt;= 122; ch++) {`],
      ['try', `        ${k('const')} other = word.slice(0, i) + String.fromCharCode(ch) + word.slice(i + 1);`],
      ['try', `        ${k('if')} (!unseen.has(other)) continue;`],
      ['push', `        unseen.delete(other);`],
      ['push', `        queue.push([other, steps + 1]);`],
      [null, `      }`],
      [null, `    }`],
      [null, `  }`],
      ['ret', `  ${k('return')} 0;`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} ladderLength(beginWord string, endWord string, wordList []string) int {`],
      [null, `    unseen := map[string]bool{}              ${c('// words no path has reached yet')}`],
      [null, `    ${k('for')} _, w := ${k('range')} wordList {`],
      [null, `        unseen[w] = true`],
      [null, `    }`],
      ['check', `    ${k('if')} !unseen[endWord] {`],
      ['check', `        ${k('return')} 0`],
      [null, `    }`],
      [null, `    delete(unseen, beginWord)`],
      [null, `    type item struct {`],
      [null, `        word  string`],
      [null, `        steps int`],
      [null, `    }`],
      ['init', `    queue := []item{{beginWord, 1}}`],
      [null, `    ${k('for')} len(queue) &gt; 0 {`],
      ['pop', `        cur := queue[0]`],
      ['pop', `        queue = queue[1:]`],
      ['found', `        ${k('if')} cur.word == endWord {`],
      ['found', `            ${k('return')} cur.steps`],
      [null, `        }`],
      [null, `        b := []byte(cur.word)`],
      [null, `        ${k('for')} i := ${k('range')} b {`],
      [null, `            orig := b[i]`],
      [null, `            ${k('for')} ch := byte('a'); ch &lt;= 'z'; ch++ {`],
      ['try', `                b[i] = ch`],
      ['try', `                other := string(b)`],
      ['try', `                ${k('if')} unseen[other] {`],
      ['push', `                    delete(unseen, other)`],
      ['push', `                    queue = append(queue, item{other, cur.steps + 1})`],
      [null, `                }`],
      [null, `            }`],
      [null, `            b[i] = orig`],
      [null, `        }`],
      [null, `    }`],
      ['ret', `    ${k('return')} 0`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('use')} std::collections::{HashSet, VecDeque};`],
      [null, ``],
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} ladder_length(begin_word: String, end_word: String, word_list: Vec&lt;String&gt;) -&gt; i32 {`],
      [null, `        ${k('let')} ${k('mut')} unseen: HashSet&lt;String&gt; = word_list.into_iter().collect(); ${c('// words no path has reached yet')}`],
      ['check', `        ${k('if')} !unseen.contains(&amp;end_word) {`],
      ['check', `            ${k('return')} 0;`],
      [null, `        }`],
      [null, `        unseen.remove(&amp;begin_word);`],
      ['init', `        ${k('let')} ${k('mut')} queue = VecDeque::from([(begin_word, 1)]);`],
      ['pop', `        ${k('while')} ${k('let')} ${k('Some')}((word, steps)) = queue.pop_front() {`],
      ['found', `            ${k('if')} word == end_word {`],
      ['found', `                ${k('return')} steps;`],
      [null, `            }`],
      [null, `            ${k('let')} ${k('mut')} b = word.into_bytes();`],
      [null, `            ${k('for')} i ${k('in')} 0..b.len() {`],
      [null, `                ${k('let')} orig = b[i];`],
      [null, `                ${k('for')} ch ${k('in')} b'a'..=b'z' {`],
      ['try', `                    b[i] = ch;`],
      ['try', `                    ${k('let')} other = String::from_utf8(b.clone()).unwrap();`],
      ['try', `                    ${k('if')} unseen.remove(&amp;other) {`],
      ['push', `                        queue.push_back((other, steps + 1));`],
      [null, `                    }`],
      [null, `                }`],
      [null, `                b[i] = orig;`],
      [null, `            }`],
      [null, `        }`],
      ['ret', `        0`],
      [null, `    }`],
      [null, `}`],
    ],
  },
};


/* ---------------- part 1: the "ladder by levels" widget ----------------
 *
 * The statement's two easy-to-miss rules: the answer counts words, not
 * changes, and every word after beginWord must be in the list. Lay the words
 * out by how many words a ladder needs to reach them; click a listed word to
 * take it out of the list, or put it back, and watch the ladder change. */

const QW_SETS = [
  { label: exampleTitle(1), b: 'hit', e: 'cog', ws: ['hot', 'dot', 'dog', 'lot', 'log', 'cog'] },
  { label: t('a detour', 'လမ်းလွှဲ'), b: 'cold', e: 'warm', ws: ['cord', 'card', 'ward', 'warm', 'wold', 'word', 'worm', 'corm'] },
  { label: t('one letter', 'စာလုံး တစ်လုံး'), b: 'a', e: 'c', ws: ['a', 'b', 'c'] },
];

function levels(b, ws) {
  const dist = new Map([[b, 1]]);
  const from = new Map();
  const todo = [b];
  for (let h = 0; h < todo.length; h++) {
    const w = todo[h];
    for (const v of ws) if (!dist.has(v) && diffs(w, v) === 1) { dist.set(v, dist.get(w) + 1); from.set(v, w); todo.push(v); }
  }
  return { dist, from };
}

function mountLadderWidget(host) {
  const state = { set: 0, off: new Set() };
  host.innerHTML = `
    <div class="wl-w" data-levels></div>
    <div class="q-slider"><span class="q-presets" data-presets></span></div>
    <div class="q-slider wl-list" data-list></div>
    <p class="q-tie" data-line></p>
    <div class="ledger">
      <span class="expr" data-expr></span>
      <span class="total" data-total></span>
    </div>`;
  const q = (sel) => host.querySelector(sel);

  function render() {
    const { b, e, ws } = QW_SETS[state.set];
    const on = ws.filter((w) => !state.off.has(w));
    const { dist, from } = levels(b, on);
    const ans = on.includes(e) ? dist.get(e) ?? 0 : 0;
    const path = new Set();
    if (ans) for (let w = e; w; w = from.get(w)) path.add(w);
    const byLevel = [];
    for (const [w, d] of dist) (byLevel[d - 1] ||= []).push(w);
    q('[data-levels]').innerHTML = byLevel.map((ws2, d) => `<div class="q-arr"><span class="wl-lv">${d + 1}</span>${ws2.map((w) =>
      `<div class="cell ${path.has(w) ? 'kept' : 'cut'}"><span>${w}</span></div>`).join('')}</div>`).join('');
    q('[data-presets]').innerHTML = presetChips(QW_SETS, state.set);
    q('[data-list]').innerHTML = `<span class="wl-lab">wordList</span>${ws.map((w) =>
      `<button class="chip" data-word="${w}"${state.off.has(w) ? '' : ' aria-pressed="true"'}>${w}</button>`).join('')}`;
    widgetLabel(pick(t('click a word to take it out of the list', 'list ထဲမှ ထုတ်ရန် စကားလုံးကို နှိပ်ပါ')));
    q('[data-line]').innerHTML = pick(!on.includes(e)
      ? t(`"${e}" is not in the list, so no ladder can end on it: the answer is 0, however close the other words come.`,
          `"${e}" သည် list ထဲ မရှိသဖြင့် ladder တစ်ခုမှ ၎င်းပေါ်တွင် မဆုံးနိုင် — အခြား စကားလုံးများ မည်မျှ နီးနီး အဖြေမှာ 0။`)
      : ans
        ? t(`The shortest ladder has ${ans} words — ${ans - 1} ${ans === 2 ? 'change' : 'changes'}. The answer counts the words, beginWord included.`,
            `အတိုဆုံး ladder တွင် စကားလုံး ${ans} ခု — ပြောင်းလဲမှု ${ans - 1} ခု။ အဖြေသည် beginWord အပါအဝင် စကားလုံးများကို ရေတွက်သည်။`)
        : t(`"${e}" is listed, but no chain of one-letter changes through the list reaches it: 0.`, `"${e}" သည် list ထဲ ရှိသော်လည်း list မှတစ်ဆင့် စာလုံးတစ်လုံးချင်း ပြောင်းသော ကွင်းဆက် တစ်ခုမှ မရောက် — 0။`));
    const chain = [];
    if (ans) for (let w = e; w; w = from.get(w)) chain.unshift(w);
    q('[data-expr]').innerHTML = ans ? chain.join(' → ') : `${b} → ⋯ ✗ ${e}`;
    q('[data-total]').innerHTML = `${ans}<small>${pick(t('words', 'စကားလုံး'))}</small>`;
  }
  host.addEventListener('click', (ev) => {
    const chip = ev.target.closest('[data-set]');
    if (chip) { state.set = Number(chip.dataset.set); state.off = new Set(); return render(); }
    const w = ev.target.closest('[data-word]');
    if (w) { const x = w.dataset.word; state.off.has(x) ? state.off.delete(x) : state.off.add(x); render(); }
  });
  onLangChange(render);
  render();
}

/* ---------------- the approach, in brief ---------------- */

const APPROACH = {
  pairs: {
    idea: t('Breadth-first search from beginWord, level by level. To find a word\'s neighbours, compare it letter by letter with every word not yet reached.',
            'beginWord မှ level အလိုက် breadth-first search။ စကားလုံးတစ်ခု၏ အိမ်နီးများကို ရှာရန် မရောက်ရသေးသော စကားလုံးတိုင်းနှင့် စာလုံးအလိုက် နှိုင်းယှဉ်သည်။'),
    steps: [
      t('If endWord is not in the list, return 0.', 'endWord သည် list ထဲ မရှိလျှင် 0 ပြန်။'),
      t('Queue <code>(beginWord, 1)</code>. Pop a word; if it is endWord, return its count.', '<code>(beginWord, 1)</code> ကို queue ထဲ ထည့်။ စကားလုံးတစ်ခု ထုတ် — endWord ဖြစ်လျှင် ၎င်း၏ အရေအတွက်ကို ပြန်။'),
      t('Every unreached word one letter away goes on the queue at count + 1 and leaves the unreached list.', 'စာလုံး တစ်လုံး ကွာသော မရောက်ရသေးသည့် စကားလုံးတိုင်း count + 1 ဖြင့် queue ထဲ ဝင်ပြီး မရောက်ရသေးသော list မှ ထွက်သည်။'),
    ],
    cost: t('Each word popped is compared with up to n others, L letters each: O(n² · L) — 1.22 s in Python here on 5,000 words of 10 letters.',
             'ထုတ်သော စကားလုံးတစ်ခုစီကို အခြား n ခုအထိ၊ တစ်ခုစီ စာလုံး L လုံးဖြင့် နှိုင်းယှဉ်သည် — O(n² · L) — ဤနေရာတွင် 10 လုံးပါ စကားလုံး 5,000 ပေါ်တွင် Python ဖြင့် 1.22 စက္ကန့်။'),
  },
  letters: {
    idea: t('The same BFS, but a word finds its neighbours by changing each letter to each of 26 and asking a hash set — work that does not grow with the list.',
            'BFS အတူတူ၊ သို့သော် စကားလုံးတစ်ခုသည် စာလုံးတစ်လုံးစီကို 26 လုံးစီသို့ ပြောင်းပြီး hash set ကို မေးခြင်းဖြင့် အိမ်နီးများကို ရှာသည် — list နှင့်အတူ မကြီးထွားသော အလုပ်။'),
    steps: [
      t('Put the list in a set; if endWord is not in it, return 0.', 'list ကို set ထဲ ထည့် — endWord မပါလျှင် 0 ပြန်။'),
      t('Queue <code>(beginWord, 1)</code>. Pop a word; if it is endWord, return its count.', '<code>(beginWord, 1)</code> ကို queue ထဲ ထည့်။ စကားလုံးတစ်ခု ထုတ် — endWord ဖြစ်လျှင် ၎င်း၏ အရေအတွက်ကို ပြန်။'),
      t('For each position and each letter, build the new word; if the set has it, remove it and queue it at count + 1.', 'နေရာတစ်ခုစီနှင့် စာလုံးတစ်ခုစီအတွက် စကားလုံးအသစ် တည်ဆောက် — set တွင် ရှိလျှင် ဖယ်ပြီး count + 1 ဖြင့် queue ထဲ ထည့်။'),
    ],
    cost: t('Each word popped makes 26 · L candidates of L letters: O(n · 26 · L²) — 0.054 s in Python here on the same 5,000 words.',
            'ထုတ်သော စကားလုံးတစ်ခုစီက စာလုံး L လုံးပါ candidate 26 · L ခု ပြုလုပ်သည် — O(n · 26 · L²) — ဤနေရာတွင် တူညီသော စကားလုံး 5,000 ပေါ်တွင် Python ဖြင့် 0.054 စက္ကန့်။'),
  },
};

/* ---------------- mount ---------------- */

const EX1 = { beginWord: 'hit', endWord: 'cog', wordList: ['hot', 'dot', 'dog', 'lot', 'log', 'cog'] };
const EX2 = { beginWord: 'hit', endWord: 'cog', wordList: ['hot', 'dot', 'dog', 'lot', 'log'] };
const exHtml = (x) => `<code>beginWord = "${x.beginWord}", endWord = "${x.endWord}",<br>wordList = [${x.wordList.map((w) => `"${w}"`).join(',')}]</code>`;

mountLesson({
  input: EX1,
  controls: [
    { key: 'beginWord', label: 'beginWord', value: EX1.beginWord, parse: parseWord },
    { key: 'endWord', label: 'endWord', value: EX1.endWord, parse: parseWord },
    { key: 'wordList', label: 'wordList', value: fmtWords(EX1.wordList), parse: parseWords, format: fmtWords },
  ],
  presets: [
    { label: exampleTitle(1), input: EX1 },
    { label: exampleTitle(2), input: EX2 },
    { label: t('one letter', 'စာလုံး တစ်လုံး'), input: { beginWord: 'a', endWord: 'c', wordList: ['a', 'b', 'c'] } },
    { label: t('no way through', 'ဖြတ်သွားစရာ မရှိ'), input: { beginWord: 'hit', endWord: 'cog', wordList: ['hot', 'dot', 'cog'] } },
  ],
  examples: [
    { title: exampleTitle(1), inputHtml: exHtml(EX1), output: '5',
      why: [t('One shortest transformation sequence is "hit" -> "hot" -> "dot" -> "dog" -> "cog", which is 5 words long.', 'အတိုဆုံး ပြောင်းလဲမှု sequence တစ်ခုမှာ "hit" -> "hot" -> "dot" -> "dog" -> "cog" ဖြစ်ပြီး စကားလုံး 5 ခု ရှည်သည်။')], load: EX1 },
    { title: exampleTitle(2), inputHtml: exHtml(EX2), output: '0',
      why: [t('The endWord "cog" is not in wordList, therefore there is no valid transformation sequence.', 'endWord "cog" သည် wordList ထဲ မရှိသဖြင့် မှန်ကန်သော ပြောင်းလဲမှု sequence မရှိ။')], load: EX2 },
  ],
  modes: [
    { id: 'pairs', name: 'BFS, comparing every word',
      sub: t('a list', 'list'),
      desc: t('Find each word\'s neighbours by comparing it with every unreached word.', 'စကားလုံးတစ်ခုစီ၏ အိမ်နီးများကို မရောက်ရသေးသော စကားလုံးတိုင်းနှင့် နှိုင်းယှဉ်၍ ရှာသည်။'),
      cost: 'O(n² · L) time · O(n) space', build: buildPairs },
    { id: 'letters', name: 'BFS, changing each letter',
      sub: t('a hash set', 'hash set'),
      desc: t('Find each word\'s neighbours by trying 26 letters in each place against a set.', 'နေရာတိုင်းတွင် စာလုံး 26 လုံးကို set နှင့် စမ်း၍ စကားလုံးတစ်ခုစီ၏ အိမ်နီးများကို ရှာသည်။'),
      cost: 'O(n · 26 · L²) time · O(n · L) space', build: buildLetters },
  ],
  languages: LANGUAGES,
  code: CODE,
  solutions: {
    pairs: { approach: APPROACH.pairs,
      desc: t('Correct, and the natural first version: the graph is never built, just discovered. It pays for that with a pass over the unreached words for every word it pops.',
              'မှန်ပြီး သဘာဝကျသော ပထမ version — graph ကို ဘယ်တော့မှ မတည်ဆောက်ဘဲ ရှာဖွေရုံသာ။ ထုတ်သော စကားလုံးတိုင်းအတွက် မရောက်ရသေးသော စကားလုံးများကို တစ်ပတ် လျှောက်ရခြင်းဖြင့် ပေးဆပ်သည်။') },
    letters: { approach: APPROACH.letters,
      desc: t('The answer to write: the same search, but the list is only ever asked, never walked. With 26 letters and words of 10, it beats scanning once the list passes a few hundred words.',
              'ရေးသင့်သည့် အဖြေ — ရှာပုံ အတူတူ၊ သို့သော် list ကို မေးရုံသာ၊ ဘယ်တော့မှ မလျှောက်။ စာလုံး 26 လုံးနှင့် 10 လုံးပါ စကားလုံးများဖြင့် list သည် စကားလုံး ရာဂဏန်း အနည်းငယ် ကျော်သည်နှင့် scan လုပ်ခြင်းကို နိုင်သည်။') },
  },
  // How each language was actually checked, printed as the part 3 badges.
  // The corpus: the 2 examples, 7 edges, 15,000 random cases of 1- to
  // 4-letter words over "abc", 5,000 of 3 to 6 letters over "abcd" with up to
  // 300 words, and six with 10-letter words, five of them 5,000 words long —
  // against an oracle that groups words by pattern ("h*t"). Go and Rust ran
  // in Docker (golang:1.23-alpine, rust:1-slim).
  verification: {
    ruby: 'ran here · 20,015 cases',
    python: 'ran here · 20,015 cases',
    javascript: 'ran here · 20,015 cases',
    go: 'ran here · 20,015 cases · Go 1.23',
    rust: 'ran here · 20,015 cases · rustc 1.98',
  },
  stripLabel: t('beginWord and wordList', 'beginWord နှင့် wordList'),
  strip,
  draw,
  answer,
  vars,
  widget: mountLadderWidget,
});
