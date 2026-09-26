/* Reverse Nodes in k-Group — LeetCode 25.
 *
 * Reverse the list k nodes at a time, leaving a short tail alone. Each group
 * is the Reverse Linked List loop run for exactly k nodes, with one twist:
 * the group's old first node must end up pointing at whatever comes after the
 * group. The recursive version gets that for free — it reverses the rest
 * first, then flips this group on top of it. The iterative version keeps a
 * pointer to the node just before each group and relinks both ends, in O(1)
 * extra space, which is the follow-up.
 */
import { mountLesson } from '../../lib/stepper.js';
import { pick, onLangChange } from '../../lib/i18n.js';
import { cells, chain, slots, stagePanel, stack, readout } from '../../lib/stage.js';
import { t, exampleTitle, LANGUAGES, k, c, labelledRows, stageGap, intList, intValue, listText, presetChips, widgetLabel } from '../../lib/kit.js';

const MAX_N = 10;

/* A real linked list: node objects with next pointers, so the walkthrough
 * relinks exactly what the code relinks. */
const makeList = (vals) => {
  const nodes = vals.map((v, id) => ({ id, val: v, next: null }));
  nodes.forEach((nd, i) => { nd.next = nodes[i + 1] ?? null; });
  return nodes;
};
const walk = (node, stop = null, limit = 40) => {
  const out = [];
  while (node && node !== stop && out.length < limit) { out.push(node); node = node.next; }
  return out;
};
const ids = (list) => list.map((nd) => nd.id);

function checkK({ values, k: kk }) {
  if (kk > values.length) throw new Error(`k is at most the length of the list, ${values.length}`);
}

/* ---------------- step generators ---------------- */

function buildRecurse(input) {
  checkK(input);
  const { values, k: kk } = input;
  const nodes = makeList(values);
  const calls = [];
  const steps = [];
  const snap = (extra) => ({ view: 'recurse', calls: calls.map((x) => x), prev: [], cur: [], ...extra });

  function rkg(head) {
    calls.push(head ? head.id : null);
    let node = head;
    for (let i = 0; i < kk; i++) {
      if (!node) {
        steps.push(snap({ line: 'short', head: head?.id ?? null, prev: head ? ids(walk(head)) : [],
          tag: t(`only ${i} left`, `${i} ခုသာ ကျန်`),
          note: t(`Only ${i} ${i === 1 ? 'node is' : 'nodes are'} left from ${head ? `node ${head.val}` : 'here'}, fewer than k = ${kk}: return them as they are.`,
                  `${head ? `node ${head.val}` : 'ဤနေရာ'} မှ node ${i} ခုသာ ကျန်ပြီး k = ${kk} ထက် နည်းသည် — ၎င်းတို့ကို ရှိသည့်အတိုင်း ပြန်ပေးသည်။`) }));
        calls.pop();
        return head;
      }
      node = node.next;
    }
    steps.push(snap({ line: 'count', head: head.id, group: ids(walk(head, node)),
      tag: t(`${kk} nodes ahead`, `node ${kk} ခု ရှိ`),
      note: t(`From node ${head.val} there are at least k = ${kk} nodes: a full group. First reverse everything after it${node ? `, starting at node ${node.val}` : ''}.`,
              `node ${head.val} မှ အနည်းဆုံး node k = ${kk} ခု ရှိသည် — အုပ်စု အပြည့်။ ၎င်းနောက်ရှိ အားလုံးကို အရင် ပြောင်းပြန်လုပ်သည်${node ? `၊ node ${node.val} မှ စ၍` : ''}။`) }));
    let prev = rkg(node);
    let cur = head;
    steps.push(snap({ line: 'rest', head: head.id, prev: ids(walk(prev)), cur: ids(walk(cur, node)),
      tag: t('rest done', 'ကျန်သည် ပြီး'),
      note: t(`The rest is done${prev ? `, starting at node ${prev.val}` : ''}. Now flip this group of ${kk} onto it: prev starts at the rest, cur at node ${head.val}.`,
              `ကျန်သည် ပြီးပြီ${prev ? `၊ node ${prev.val} မှ စ` : ''}။ ယခု ဤ ${kk} ခု အုပ်စုကို ၎င်းပေါ် လှန်သည် — prev သည် ကျန်သည်မှ၊ cur သည် node ${head.val} မှ စသည်။`) }));
    for (let i = 0; i < kk; i++) {
      const nxt = cur.next;
      cur.next = prev; prev = cur; cur = nxt;
      steps.push(snap({ line: 'flip', head: head.id, prev: ids(walk(prev)), cur: ids(walk(cur, node)), flipped: prev.id,
        tag: t(`flip ${prev.val}`, `${prev.val} လှန်`),
        note: t(`Node ${prev.val} now points back at ${prev.next ? `node ${prev.next.val}` : 'nothing'}; it is the new front. ${kk - i - 1} left to flip in this group.`,
                `node ${prev.val} သည် ယခု ${prev.next ? `node ${prev.next.val}` : 'ဘာမှမဟုတ်'} ကို နောက်ပြန် ညွှန်သည် — ရှေ့ဆုံး အသစ်။ ဤအုပ်စုတွင် လှန်ရန် ${kk - i - 1} ခု ကျန်။`) }));
    }
    steps.push(snap({ line: 'ret', head: head.id, prev: ids(walk(prev)), finished: calls.length === 1, result: calls.length === 1 ? ids(walk(prev)) : null,
      tag: t(`return ${prev.val}`, `${prev.val} ပြန်`),
      note: calls.length === 1
        ? t(`The first group is flipped onto everything after it: return node ${prev.val}, the head of the whole reversed list.`, `ပထမ အုပ်စုကို ၎င်းနောက်ရှိ အားလုံးပေါ် လှန်ပြီး — list တစ်ခုလုံး၏ ခေါင်း node ${prev.val} ကို ပြန်ပေးသည်။`)
        : t(`Return node ${prev.val}, the new front of this group, to the call before.`, `ဤအုပ်စု၏ ရှေ့ဆုံးအသစ် node ${prev.val} ကို ရှေ့ call သို့ ပြန်ပေးသည်။`) }));
    calls.pop();
    return prev;
  }
  const res = rkg(nodes[0]);
  if (!steps.at(-1).finished) steps[steps.length - 1] = { ...steps.at(-1), finished: true, result: ids(walk(res)) };
  return steps.map((s) => ({ ...s, vals: values }));
}

function buildIterate(input) {
  checkK(input);
  const { values, k: kk } = input;
  const nodes = makeList(values);
  const dummy = { id: 'd', val: 'dummy', next: nodes[0] };
  let before = dummy;
  const steps = [];
  const snap = (extra) => ({ view: 'iterate', list: ids(walk(dummy.next)), before: before.id, ...extra });
  steps.push(snap({ line: 'init', tag: t('before = dummy', 'before = dummy'),
    note: t('A dummy node in front of the head, so the first group has a "node before it" like every other. before starts there.', 'ပထမ အုပ်စုတွင်လည်း အခြားအုပ်စုများကဲ့သို့ "၎င်းရှေ့ရှိ node" ရှိစေရန် head ရှေ့တွင် dummy node။ before သည် ထိုနေရာမှ စသည်။') }));
  while (true) {
    let end = before;
    let short = false;
    for (let i = 0; i < kk; i++) {
      end = end.next;
      if (!end) { short = true; break; }
    }
    if (short) {
      steps.push(snap({ line: 'short', finished: true, result: ids(walk(dummy.next)), tag: t('short tail', 'အမြီး တို'),
        note: t(`Fewer than k = ${kk} nodes after ${before === dummy ? 'the dummy' : `node ${before.val}`}: leave them and return dummy.next.`,
                `${before === dummy ? 'dummy' : `node ${before.val}`} နောက်တွင် node k = ${kk} ထက် နည်းသည် — ချန်ထားပြီး dummy.next ကို ပြန်ပေးသည်။`) }));
      return steps.map((s) => ({ ...s, vals: values }));
    }
    steps.push(snap({ line: 'count', end: end.id, tag: t(`end = ${end.val}`, `end = ${end.val}`),
      note: t(`Walk k = ${kk} nodes past before: end = node ${end.val}. A full group.`, `before ကို ကျော်၍ node k = ${kk} ခု လျှောက်သည် — end = node ${end.val}။ အုပ်စု အပြည့်။`) }));
    const first = before.next, after = end.next;
    steps.push(snap({ line: 'cut', end: end.id, first: first.id, after: after?.id ?? null, tag: t(`group ${first.val}..${end.val}`, `အုပ်စု ${first.val}..${end.val}`),
      note: t(`The group runs from first = node ${first.val} to end = node ${end.val}; after = ${after ? `node ${after.val}` : 'nothing'}. Reverse it with prev starting at after, so the group's old first node ends up pointing past the group.`,
              `အုပ်စုသည် first = node ${first.val} မှ end = node ${end.val} အထိ — after = ${after ? `node ${after.val}` : 'ဘာမှမရှိ'}။ prev ကို after မှ စ၍ ပြောင်းပြန်လုပ်သဖြင့် အုပ်စု၏ ပထမ node ဟောင်းသည် အုပ်စုကို ကျော်၍ ညွှန်မည်။`) }));
    let prev = after, cur = first;
    while (cur !== after) {
      const nxt = cur.next;
      cur.next = prev; prev = cur; cur = nxt;
      steps.push(snap({ line: 'flip', end: end.id, first: first.id, after: after?.id ?? null, flipped: prev.id, run: ids(walk(prev)), rest: ids(walk(cur, after)),
        tag: t(`flip ${prev.val}`, `${prev.val} လှန်`),
        note: t(`Node ${prev.val} now points at ${prev.next ? `node ${prev.next.val}` : 'nothing'}.`, `node ${prev.val} သည် ယခု ${prev.next ? `node ${prev.next.val}` : 'ဘာမှမဟုတ်'} ကို ညွှန်သည်။`) }));
    }
    before.next = end;
    const was = before;
    before = first;
    steps.push(snap({ line: 'link', end: end.id, first: first.id, tag: t(`before = ${first.val}`, `before = ${first.val}`),
      note: t(`${was === dummy ? 'The dummy' : `Node ${was.val}`} now points at node ${end.val}, the group's new front; and before moves to node ${first.val}, now the group's last node — just before the next group.`,
              `${was === dummy ? 'dummy' : `node ${was.val}`} သည် ယခု အုပ်စု၏ ရှေ့ဆုံးအသစ် node ${end.val} ကို ညွှန်သည် — before သည် ယခု အုပ်စု၏ နောက်ဆုံး node ${first.val} သို့ ရွှေ့သည် — နောက်အုပ်စု၏ ရှေ့။`) }));
  }
}

/* ---------------- drawing ----------------
 *
 * The strip card is the values as given, grouped by k. The stage is the
 * nodes as the code has linked them: for the recursive version the call
 * stack and the two chains being joined — prev, already reversed, and cur,
 * the rest of this group — for the iterative one the whole list from the
 * dummy, with before, first, end and after marked. */

function strip(s, { values, k: kk }) {
  return cells(values, {
    tone: Object.fromEntries(values.map((_, i) => {
      const inFull = Math.floor(i / kk) < Math.floor(values.length / kk);
      return [i, s.flipped === i ? 'inwin' : inFull ? (Math.floor(i / kk) % 2 ? null : 'entering') : 'done'];
    }).filter(([, x]) => x)),
  });
}

const chainOf = (idList, vals, o = {}) => chain(idList.map((id) => ({ value: vals[id] })), { nullTail: o.nullTail ?? true, ...o });

function draw(s) {
  const vals = s.vals;
  if (s.view === 'recurse') {
    const frames = s.calls.map((id) => `reverseKGroup(${id == null ? 'null' : vals[id]})`);
    return stagePanel(pick(t('The call stack', 'Call stack')), pick(t(`${s.calls.length} deep`, `${s.calls.length} ဆင့်`)), stack(frames))
      + stageGap + stagePanel('prev', pick(t('reversed so far, joined to the rest', 'ယခုထိ ပြောင်းပြန်၊ ကျန်သည်နှင့် ဆက်')), chainOf(s.prev, vals, { tone: s.flipped != null ? { 0: 'up' } : {} }))
      + (s.cur.length ? stageGap + stagePanel('cur', pick(t('still to flip in this group', 'ဤအုပ်စုတွင် လှန်ရန် ကျန်')), chainOf(s.cur, vals, { nullTail: false })) : '');
  }
  const marks = {};
  const pos = (id) => s.list.indexOf(id);
  const mark = (id, name) => { if (id == null) return; const p = pos(id); if (p >= 0) marks[p] = marks[p] ? `${marks[p]}, ${name}` : name; };
  if (s.before !== 'd') mark(s.before, 'before');
  mark(s.first, 'first'); mark(s.end, 'end'); mark(s.after, 'after');
  let body = stagePanel(pick(t('The list, from dummy.next', 'List — dummy.next မှ')), s.before === 'd' ? pick(t('before = dummy', 'before = dummy')) : '', chainOf(s.list, vals, { marks }));
  if (s.run) {
    body += stageGap + stagePanel('prev', pick(t('the group, reversed so far', 'အုပ်စု — ယခုထိ ပြောင်းပြန်')), chainOf(s.run, vals, { tone: { 0: 'up' } }))
      + (s.rest.length ? stageGap + stagePanel('cur', pick(t('still to flip', 'လှန်ရန် ကျန်')), chainOf(s.rest, vals, { nullTail: false })) : '');
  }
  return body;
}

function answer(s) {
  const done = s.finished ? s.result.map((id) => s.vals[id]) : [];
  return { html: slots(done, { total: s.vals.length }), note: t('the list, head to tail', 'list — head မှ tail') };
}

function vars(s, { values, k: kk }) {
  const out = [['k', kk], ['head', `[${listText(values)}]`]];
  if (s.view === 'recurse') {
    if (s.prev.length) out.push(['prev', `[${s.prev.map((id) => values[id]).join(' → ')}]`]);
    if (s.cur.length) out.push(['cur', `node ${values[s.cur[0]]}`]);
  } else {
    out.push(['before', s.before === 'd' ? 'dummy' : `node ${values[s.before]}`], ['dummy', `→ ${s.list.length ? values[s.list[0]] : 'null'}`]);
    if (s.end != null) out.push(['end', `node ${values[s.end]}`]);
    if (s.first != null) out.push(['first', `node ${values[s.first]}`], ['after', s.after == null ? 'null' : `node ${values[s.after]}`]);
  }
  return out;
}

/* ---------------- the code, one key per line ----------------
 *
 * Generated from the verified solution files, so the listing a reader copies
 * is byte-identical to the one that ran. */

const CODE = {
  recurse: {
    ruby: [
      [null, `${k('def')} reverse_k_group(head, k)`],
      [null, `  node = head`],
      [null, `  k.times ${k('do')} ${c('# are there k nodes left?')}`],
      ['short', `    ${k('return')} head ${k('unless')} node`],
      ['count', `    node = node.next`],
      [null, `  ${k('end')}`],
      ['rest', `  prev, cur = reverse_k_group(node, k), head ${c('# the rest, already done')}`],
      [null, `  k.times ${k('do')}`],
      ['flip', `    cur.next, prev, cur = prev, cur, cur.next`],
      [null, `  ${k('end')}`],
      ['ret', `  prev`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('import')} sys`],
      [null, `sys.setrecursionlimit(10_000)            ${c('# k = 1 on 5,000 nodes is 5,000 calls deep')}`],
      [null, ``],
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} reverseKGroup(self, head, k):`],
      [null, `        node = head`],
      [null, `        ${k('for')} _ ${k('in')} range(k):                    ${c('# are there k nodes left?')}`],
      ['short', `            ${k('if')} ${k('not')} node:`],
      ['short', `                ${k('return')} head`],
      ['count', `            node = node.next`],
      ['rest', `        prev, cur = self.reverseKGroup(node, k), head   ${c('# the rest, already done')}`],
      [null, `        ${k('for')} _ ${k('in')} range(k):`],
      ['flip', `            cur.next, prev, cur = prev, cur, cur.next`],
      ['ret', `        ${k('return')} prev`],
    ],
    javascript: [
      [null, `${k('const')} reverseKGroup = ${k('function')} (head, k) {`],
      [null, `  ${k('let')} node = head;`],
      [null, `  ${k('for')} (${k('let')} i = 0; i &lt; k; i++) { ${c('// are there k nodes left?')}`],
      ['short', `    ${k('if')} (!node) ${k('return')} head;`],
      ['count', `    node = node.next;`],
      [null, `  }`],
      ['rest', `  ${k('let')} prev = reverseKGroup(node, k), cur = head; ${c('// the rest, already done')}`],
      [null, `  ${k('for')} (${k('let')} i = 0; i &lt; k; i++) {`],
      ['flip', `    [cur.next, prev, cur] = [prev, cur, cur.next];`],
      [null, `  }`],
      ['ret', `  ${k('return')} prev;`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} reverseKGroup(head *ListNode, k int) *ListNode {`],
      [null, `    node := head`],
      [null, `    ${k('for')} i := 0; i &lt; k; i++ { ${c('// are there k nodes left?')}`],
      ['short', `        ${k('if')} node == ${k('nil')} {`],
      ['short', `            ${k('return')} head`],
      [null, `        }`],
      ['count', `        node = node.Next`],
      [null, `    }`],
      ['rest', `    prev, cur := reverseKGroup(node, k), head ${c('// the rest, already done')}`],
      [null, `    ${k('for')} i := 0; i &lt; k; i++ {`],
      ['flip', `        cur.Next, prev, cur = prev, cur, cur.Next`],
      [null, `    }`],
      ['ret', `    ${k('return')} prev`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} reverse_k_group(${k('mut')} head: Option&lt;Box&lt;ListNode&gt;&gt;, k: i32) -&gt; Option&lt;Box&lt;ListNode&gt;&gt; {`],
      [null, `        ${k('let')} ${k('mut')} node = head.as_mut();`],
      [null, `        ${k('for')} i ${k('in')} 0..k { ${c('// are there k nodes left?')}`],
      [null, `            ${k('match')} node {`],
      ['short', `                ${k('None')} =&gt; ${k('return')} head,`],
      ['count', `                ${k('Some')}(n) ${k('if')} i == k - 1 =&gt; {`],
      [null, `                    ${k('let')} rest = n.next.take(); ${c('// cut after the k-th node')}`],
      ['rest', `                    ${k('let')} ${k('mut')} prev = ${k('Self')}::reverse_k_group(rest, k); ${c('// the rest, already done')}`],
      [null, `                    ${k('let')} ${k('mut')} cur = head;`],
      [null, `                    ${k('for')} _ ${k('in')} 0..k {`],
      ['flip', `                        ${k('let')} ${k('mut')} n = cur.unwrap();`],
      ['flip', `                        cur = n.next.take();`],
      ['flip', `                        n.next = prev;`],
      ['flip', `                        prev = ${k('Some')}(n);`],
      [null, `                    }`],
      ['ret', `                    ${k('return')} prev;`],
      [null, `                }`],
      ['count', `                ${k('Some')}(n) =&gt; node = n.next.as_mut(),`],
      [null, `            }`],
      [null, `        }`],
      [null, `        head`],
      [null, `    }`],
      [null, `}`],
    ],
  },
  iterate: {
    ruby: [
      [null, `${k('def')} reverse_k_group(head, k)`],
      [null, `  dummy = ListNode.new(0, head)`],
      ['init', `  before = dummy ${c('# the node just before the next group')}`],
      [null, `  loop ${k('do')}`],
      [null, `    last = before`],
      [null, `    k.times ${k('do')}`],
      ['count', `      last = last.next`],
      ['short', `      ${k('return')} dummy.next ${k('unless')} last`],
      [null, `    ${k('end')}`],
      ['cut', `    first, after = before.next, last.next`],
      [null, `    prev, cur = after, first`],
      [null, `    ${k('until')} cur.equal?(after)`],
      ['flip', `      cur.next, prev, cur = prev, cur, cur.next`],
      [null, `    ${k('end')}`],
      ['link', `    before.next = last`],
      ['link', `    before = first`],
      [null, `  ${k('end')}`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} reverseKGroup(self, head, k):`],
      [null, `        dummy = ListNode(0, head)`],
      ['init', `        before = dummy                        ${c('# the node just before the next group')}`],
      [null, `        ${k('while')} True:`],
      [null, `            end = before`],
      [null, `            ${k('for')} _ ${k('in')} range(k):`],
      ['count', `                end = end.next`],
      ['short', `                ${k('if')} ${k('not')} end:`],
      ['short', `                    ${k('return')} dummy.next`],
      ['cut', `            first, after = before.next, end.next`],
      [null, `            prev, cur = after, first`],
      [null, `            ${k('while')} cur ${k('is')} ${k('not')} after:`],
      ['flip', `                cur.next, prev, cur = prev, cur, cur.next`],
      ['link', `            before.next = end`],
      ['link', `            before = first`],
    ],
    javascript: [
      [null, `${k('const')} reverseKGroup = ${k('function')} (head, k) {`],
      [null, `  ${k('const')} dummy = ${k('new')} ListNode(0, head);`],
      ['init', `  ${k('let')} before = dummy; ${c('// the node just before the next group')}`],
      [null, `  ${k('while')} (true) {`],
      [null, `    ${k('let')} end = before;`],
      [null, `    ${k('for')} (${k('let')} i = 0; i &lt; k; i++) {`],
      ['count', `      end = end.next;`],
      ['short', `      ${k('if')} (!end) ${k('return')} dummy.next;`],
      [null, `    }`],
      ['cut', `    ${k('const')} first = before.next, after = end.next;`],
      [null, `    ${k('let')} prev = after, cur = first;`],
      [null, `    ${k('while')} (cur !== after) {`],
      ['flip', `      [cur.next, prev, cur] = [prev, cur, cur.next];`],
      [null, `    }`],
      ['link', `    before.next = end;`],
      ['link', `    before = first;`],
      [null, `  }`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} reverseKGroup(head *ListNode, k int) *ListNode {`],
      [null, `    dummy := &amp;ListNode{Next: head}`],
      ['init', `    before := dummy ${c('// the node just before the next group')}`],
      [null, `    ${k('for')} {`],
      [null, `        end := before`],
      [null, `        ${k('for')} i := 0; i &lt; k; i++ {`],
      ['count', `            end = end.Next`],
      ['short', `            ${k('if')} end == ${k('nil')} {`],
      ['short', `                ${k('return')} dummy.Next`],
      [null, `            }`],
      [null, `        }`],
      ['cut', `        first, after := before.Next, end.Next`],
      [null, `        prev, cur := after, first`],
      [null, `        ${k('for')} cur != after {`],
      ['flip', `            cur.Next, prev, cur = prev, cur, cur.Next`],
      [null, `        }`],
      ['link', `        before.Next = end`],
      ['link', `        before = first`],
      [null, `    }`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} reverse_k_group(head: Option&lt;Box&lt;ListNode&gt;&gt;, k: i32) -&gt; Option&lt;Box&lt;ListNode&gt;&gt; {`],
      [null, `        ${k('let')} ${k('mut')} dummy = Box::new(ListNode { val: 0, next: head });`],
      ['init', `        ${k('let')} ${k('mut')} before = &amp;${k('mut')} dummy; ${c('// the node just before the next group')}`],
      [null, `        loop {`],
      [null, `            ${k('let')} (${k('mut')} count, ${k('mut')} probe) = (0, before.next.as_ref());`],
      [null, `            ${k('while')} count &lt; k &amp;&amp; probe.is_some() {`],
      ['count', `                probe = probe.unwrap().next.as_ref();`],
      ['count', `                count += 1;`],
      [null, `            }`],
      ['short', `            ${k('if')} count &lt; k {`],
      ['short', `                ${k('return')} dummy.next;`],
      [null, `            }`],
      ['cut', `            ${k('let')} ${k('mut')} cur = before.next.take(); ${c('// the group, and the rest behind it')}`],
      [null, `            ${k('let')} ${k('mut')} prev = ${k('None')};`],
      [null, `            ${k('for')} _ ${k('in')} 0..k {`],
      ['flip', `                ${k('let')} ${k('mut')} n = cur.unwrap();`],
      ['flip', `                cur = n.next.take();`],
      ['flip', `                n.next = prev;`],
      ['flip', `                prev = ${k('Some')}(n);`],
      [null, `            }`],
      ['link', `            before.next = prev;`],
      [null, `            ${k('for')} _ ${k('in')} 0..k {`],
      ['link', `                before = before.next.as_mut().unwrap();`],
      [null, `            }`],
      ['link', `            before.next = cur;`],
      [null, `        }`],
      [null, `    }`],
      [null, `}`],
    ],
  },
};

/* ---------------- part 1: the "groups of k" widget ----------------
 *
 * Drag k and see the list cut into groups: every full group turns around,
 * a short tail stays as it is. */

const QW_SETS = [
  { label: t('1 … 5', '1 … 5'), vals: [1, 2, 3, 4, 5] },
  { label: t('1 … 8', '1 … 8'), vals: [1, 2, 3, 4, 5, 6, 7, 8] },
];

function mountGroupWidget(host) {
  const state = { set: 1, k: 3 };
  host.innerHTML = `
    <div data-rows></div>
    <div class="q-slider"><label for="rkg-k">k</label><input id="rkg-k" type="range" min="1" data-k><output data-out></output>
      <span class="q-presets" data-presets></span></div>
    <p class="q-tie" data-line></p>
    <div class="ledger">
      <span class="expr" data-expr></span>
      <span class="total" data-total></span>
    </div>`;
  const q = (sel) => host.querySelector(sel);

  function render() {
    const { vals } = QW_SETS[state.set];
    const n = vals.length, kk = Math.min(state.k, n);
    const full = Math.floor(n / kk);
    const after = [];
    for (let i = 0; i < n; i += kk) { const ch = vals.slice(i, i + kk); after.push(...(ch.length === kk ? ch.reverse() : ch)); }
    const row = (arr, name) => `<div class="q-arr"><span class="q-row-label">${name}</span>${arr.map((v, i) => {
      const g = Math.floor(i / kk), inFull = g < full;
      return `<div class="cell ${inFull ? (g % 2 ? 'kept' : 'kept picked') : 'cut'}"><span>${v}</span><span class="idx">${inFull ? `g${g + 1}` : 'tail'}</span></div>`;
    }).join('')}</div>`;
    q('[data-rows]').innerHTML = row(vals, pick(t('before', 'မတိုင်မီ'))) + row(after, pick(t('after', 'ပြီးနောက်')));
    const el = q('[data-k]'); el.max = String(n); el.value = String(kk);
    q('[data-out]').textContent = String(kk);
    q('[data-presets]').innerHTML = presetChips(QW_SETS, state.set);
    widgetLabel(pick(t('drag k', 'k ကို ဆွဲပါ')));
    const tail = n - full * kk;
    q('[data-line]').innerHTML = pick(t(`${full} full ${full === 1 ? 'group' : 'groups'} of ${kk} turn around${tail ? `; the last ${tail} ${tail === 1 ? 'node is' : 'nodes are'} fewer than k and stay as ${tail === 1 ? 'it is' : 'they are'}` : ', and nothing is left over'}. The nodes move — the values inside them never change.`,
      `${kk} ခုစီ အုပ်စု အပြည့် ${full} ခု လှည့်သည်${tail ? `၊ နောက်ဆုံး node ${tail} ခုသည် k ထက် နည်းသဖြင့် ရှိသည့်အတိုင်း ကျန်သည်` : '၊ ဘာမှ မကျန်'}။ node များ ရွေ့သည် — ၎င်းတို့အတွင်းရှိ value များ ဘယ်တော့မှ မပြောင်း။`));
    q('[data-expr]').innerHTML = `${n} = ${kk} × ${full}${tail ? ` + ${tail}` : ''}`;
    q('[data-total]').innerHTML = `${full}<small>${pick(t('groups reversed', 'ပြောင်းပြန် အုပ်စု'))}</small>`;
  }
  q('[data-k]').addEventListener('input', (ev) => { state.k = Number(ev.target.value); render(); });
  host.addEventListener('click', (ev) => {
    const chip = ev.target.closest('[data-set]');
    if (chip) { state.set = Number(chip.dataset.set); render(); }
  });
  onLangChange(render);
  render();
}

/* ---------------- the approach, in brief ---------------- */

const APPROACH = {
  recurse: {
    idea: t('Reverse everything after the first k nodes first, then flip those k nodes onto it: the group\'s old first node lands pointing at the reversed rest with no extra bookkeeping.',
            'ပထမ node k ခုနောက်ရှိ အားလုံးကို အရင် ပြောင်းပြန်လုပ်ပြီးမှ ထို k ခုကို ၎င်းပေါ် လှန်သည် — အုပ်စု၏ ပထမ node ဟောင်းသည် အပို စာရင်းကိုင်ခြင်း မလိုဘဲ ပြောင်းပြန်ပြီး ကျန်သည်ကို ညွှန်မည်။'),
    steps: [
      t('Walk k nodes from <code>head</code>; running out means a short tail — return <code>head</code> as it is.', '<code>head</code> မှ node k ခု လျှောက် — ကုန်သွားလျှင် အမြီးတို — <code>head</code> ကို ရှိသည့်အတိုင်း ပြန်ပေး။'),
      t('<code>prev</code> = the reversed rest, from the recursive call; <code>cur = head</code>.', '<code>prev</code> = recursive call မှ ပြောင်းပြန်ပြီး ကျန်သည် — <code>cur = head</code>။'),
      t('k times: point <code>cur</code> back at <code>prev</code> and step both on. Return <code>prev</code>.', 'k ကြိမ် — <code>cur</code> ကို <code>prev</code> သို့ နောက်ပြန် ညွှန်ပြီး နှစ်ခုလုံး ရှေ့တိုး။ <code>prev</code> ကို ပြန်ပေး။'),
    ],
    cost: t('Each node is counted once and flipped once: O(n) time, but n/k calls on the stack — 5,000 at k = 1.', 'node တစ်ခုစီကို တစ်ကြိမ် ရေတွက်ပြီး တစ်ကြိမ် လှန်သည် — O(n) အချိန်၊ သို့သော် stack ပေါ်တွင် call n/k — k = 1 တွင် 5,000။'),
  },
  iterate: {
    idea: t('Keep a pointer to the node just before the next group. Reverse the group with prev starting at the node after it, then point the node before at the group\'s new front and move on.',
            'နောက်အုပ်စု၏ ရှေ့ရှိ node ကို pointer တစ်ခုဖြင့် ထိန်းသည်။ prev ကို ၎င်းနောက်ရှိ node မှ စ၍ အုပ်စုကို ပြောင်းပြန်လုပ်ပြီး ရှေ့ node ကို အုပ်စု၏ ရှေ့ဆုံးအသစ်သို့ ညွှန်ကာ ဆက်သွားသည်။'),
    steps: [
      t('A <code>dummy</code> before the head; <code>before = dummy</code>.', 'head ရှေ့တွင် <code>dummy</code> — <code>before = dummy</code>။'),
      t('Walk k nodes to <code>end</code>; if the list runs out, return <code>dummy.next</code>.', 'node k ခု လျှောက်၍ <code>end</code> သို့ — list ကုန်လျှင် <code>dummy.next</code> ပြန်ပေး။'),
      t('Reverse <code>first</code>..<code>end</code> with <code>prev = after</code>; then <code>before.next = end</code>, <code>before = first</code>.', '<code>prev = after</code> ဖြင့် <code>first</code>..<code>end</code> ကို ပြောင်းပြန် — ပြီးမှ <code>before.next = end</code>၊ <code>before = first</code>။'),
    ],
    cost: t('Each node is walked twice — once to count, once to flip: O(n) time and O(1) extra, the follow-up.', 'node တစ်ခုစီကို နှစ်ကြိမ် လျှောက်သည် — ရေတွက်ရန်တစ်ကြိမ်၊ လှန်ရန်တစ်ကြိမ် — O(n) အချိန်နှင့် O(1) အပို၊ follow-up။'),
  },
};

/* ---------------- mount ---------------- */

mountLesson({
  input: { values: [1, 2, 3, 4, 5], k: 2 },
  controls: [
    { key: 'values', label: 'head', value: listText([1, 2, 3, 4, 5]), parse: intList({ max: MAX_N, lo: 0, hi: 1000 }), format: listText },
    { key: 'k', label: 'k', type: 'number', min: 1, max: MAX_N, value: 2, parse: intValue({ lo: 1, hi: MAX_N }) },
  ],
  presets: [
    { label: exampleTitle(1), input: { values: [1, 2, 3, 4, 5], k: 2 } },
    { label: exampleTitle(2), input: { values: [1, 2, 3, 4, 5], k: 3 } },
    { label: t('k = n', 'k = n'), input: { values: [1, 2, 3, 4], k: 4 } },
    { label: t('k = 1', 'k = 1'), input: { values: [1, 2, 3], k: 1 } },
  ],
  examples: [
    { title: exampleTitle(1), inputHtml: '<code>head = [1,2,3,4,5], k = 2</code>', output: '[2,1,4,3,5]',
      why: [t('Groups [1,2] and [3,4] turn around; 5 is a group of one, fewer than k, and stays.', 'အုပ်စု [1,2] နှင့် [3,4] လှည့်သည် — 5 သည် k ထက် နည်းသော တစ်ခုတည်း အုပ်စု ဖြစ်ပြီး ကျန်သည်။')],
      load: { values: [1, 2, 3, 4, 5], k: 2 } },
    { title: exampleTitle(2), inputHtml: '<code>head = [1,2,3,4,5], k = 3</code>', output: '[3,2,1,4,5]',
      why: [t('[1,2,3] turns around; [4,5] is short and stays.', '[1,2,3] လှည့်သည် — [4,5] တိုပြီး ကျန်သည်။')], load: { values: [1, 2, 3, 4, 5], k: 3 } },
  ],
  modes: [
    { id: 'recurse', name: 'Recursive',
      desc: t('Reverse the rest first, then flip this group onto it.', 'ကျန်သည်ကို အရင် ပြောင်းပြန်၊ ပြီးမှ ဤအုပ်စုကို ၎င်းပေါ် လှန်။'),
      cost: 'O(n) time · O(n/k) stack', build: buildRecurse },
    { id: 'iterate', name: 'In place',
      sub: t('O(1) extra', 'O(1) အပို'),
      desc: t('A pointer before each group; relink both ends.', 'အုပ်စုတိုင်းရှေ့တွင် pointer — အစွန်နှစ်ဖက်ကို ပြန်ချိတ်။'),
      cost: 'O(n) time · O(1) extra', build: buildIterate },
  ],
  languages: LANGUAGES,
  code: CODE,
  hover: { ruby: { last: 'end' } },
  solutions: {
    recurse: { approach: APPROACH.recurse,
      desc: t('Short and hard to get wrong: the rest comes back already reversed, so the group\'s old head simply points at it. Python needs its recursion limit raised for k = 1 on 5,000 nodes.',
              'တိုပြီး မှားရခက်သည် — ကျန်သည်သည် ပြောင်းပြန်ပြီးသား ပြန်လာသဖြင့် အုပ်စု၏ ခေါင်းဟောင်းသည် ၎င်းကို ရိုးရိုး ညွှန်သည်။ node 5,000 ပေါ်ရှိ k = 1 အတွက် Python ၏ recursion ကန့်သတ်ချက်ကို မြှင့်ရမည်။') },
    iterate: { approach: APPROACH.iterate,
      desc: t('The follow-up\'s answer: no recursion, O(1) extra. Starting prev at the node after the group is what joins each reversed group to the rest.',
              'follow-up ၏ အဖြေ — recursion မပါ၊ O(1) အပို။ prev ကို အုပ်စုနောက်ရှိ node မှ စခြင်းက ပြောင်းပြန်ပြီး အုပ်စုတိုင်းကို ကျန်သည်နှင့် ဆက်ပေးသည်။') },
  },
  // How each language was actually checked, printed as the part 3 badges.
  // The corpus: the 2 examples, 6 edges, 15,000 random lists of up to 12
  // nodes with every k, 5,000 of up to 300, and five of 5,000 nodes with k =
  // 1, 2, 70, 4,999 and 5,000 — against chunk-and-reverse in a Python list.
  // Every language ran on its default stack. Go and Rust ran in Docker
  // (golang:1.23-alpine, rust:1-slim).
  verification: {
    ruby: 'ran here · 20,013 cases',
    python: 'ran here · 20,013 cases',
    javascript: 'ran here · 20,013 cases',
    go: 'ran here · 20,013 cases · Go 1.23',
    rust: 'ran here · 20,013 cases · rustc 1.98',
  },
  caveats: {
    recurse: {
      python: t('The <code>setrecursionlimit</code> line is part of the answer: at Python\'s default of 1,000, k = 1 on a list of 1,000 nodes already fails with <code>RecursionError</code> (checked here), and the constraint allows 5,000.',
                '<code>setrecursionlimit</code> စာကြောင်းသည် အဖြေ၏ အစိတ်အပိုင်း — Python ၏ default 1,000 တွင် node 1,000 list ပေါ်ရှိ k = 1 ပင် <code>RecursionError</code> ဖြင့် ကျရှုံးသည် (ဤနေရာတွင် စစ်ထားသည်)၊ ကန့်သတ်ချက်က 5,000 ကို ခွင့်ပြုသည်။'),
    },
  },
  stripLabel: t('The values, in groups of k', 'value များ — k ခုစီ အုပ်စု'),
  strip,
  draw,
  answer,
  vars,
  widget: mountGroupWidget,
});
