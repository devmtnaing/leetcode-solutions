/* Reverse Linked List — LeetCode 206.
 *
 * The contrast worth seeing: both approaches perform exactly the same n link
 * rewrites, and the only real question is where the "where I came from" pointer
 * is kept. The iterative version keeps it in a variable called `prev`. The
 * recursive version keeps it in the call stack — each frame still holds the
 * node it was called with, so on the way back up `head.next` is the tail of the
 * reversed run and the back-pointer is free. That is what the O(n) stack buys.
 *
 * The frame this lesson exists for is the one after `curr.next = prev`. At that
 * instant the list is two separate runs: a reversed prefix and an untouched
 * suffix, and the suffix is reachable only through the variable saved one line
 * earlier. Drawing it as one tidy list would hide the entire problem.
 */
import { t, plural, exampleTitle, LANGUAGES, k, c } from '../../lib/kit.js';
import { mountLesson } from '../../lib/stepper.js';
import { pick, onLangChange } from '../../lib/i18n.js';
import { cells, chain, stack, panels, slots, stagePanel } from '../../lib/stage.js';


const show = (v) => (v == null ? 'null' : String(v));

/* ---------------- step generators ---------------- */

/* Every snapshot carries its own copies of the two runs. The algorithm is
 * destructive by nature, so sharing one array between frames would make the
 * whole walkthrough render the finished list. */
function buildIterative({ nums }) {
  const a = nums;
  const n = a.length;
  const steps = [];

  // A snapshot is derived from one number: how many nodes have been rewired.
  // `left` is the reversed run, head-first from prev; `right` is everything
  // still linked the original way, head-first from curr.
  const snap = (i, extra) => ({
    rewired: i,
    left: a.slice(0, i).reverse(),
    right: a.slice(i),
    leftMarks: {},
    rightMarks: {},
    leftTone: {},
    rightTone: {},
    ...extra,
  });

  steps.push(snap(0, {
    line: 'prev0', prev: null, curr: null, next: null,
    note: t('<b>prev</b> is where the reversed part of the list collects. It starts as <b>null</b>, which is not a placeholder — null is exactly what the original head\'s <code>next</code> has to end up being.',
            '<b>prev</b> သည် list ၏ ပြောင်းပြန်ဖြစ်ပြီးသော အပိုင်း စုဝေးရာ ဖြစ်သည်။ <b>null</b> ဖြင့် စသည် — နေရာယူထားရုံ မဟုတ်ပါ၊ မူလ head ၏ <code>next</code> နောက်ဆုံးတွင် ဖြစ်ရမည့်အရာမှာ null အတိအကျ ဖြစ်သည်။'),
  }));

  steps.push(snap(0, {
    line: 'curr0', prev: null, curr: n ? a[0] : null, next: null,
    rightMarks: n ? { 0: 'curr' } : {},
    note: n
      ? t('<b>curr</b> walks the original list. Nothing has been rewired yet, so the whole list is still one forward run.',
          '<b>curr</b> သည် မူလ list ကို လျှောက်သည်။ ဘာမျှ ပြန်မချိတ်ရသေးသဖြင့် list တစ်ခုလုံး ရှေ့သို့ ညွှန်နေသော run တစ်ခုတည်း ဖြစ်နေဆဲ။')
      : t('The list is empty, so <b>curr</b> starts at null and the loop never runs.',
          'list ဗလာ ဖြစ်သဖြင့် <b>curr</b> သည် null ဖြင့် စပြီး loop လုံးဝ မပတ်ပါ။'),
  }));

  for (let i = 0; i < n; i++) {
    const v = a[i];
    const w = i + 1 < n ? a[i + 1] : null;
    const back = i > 0 ? a[i - 1] : null;

    steps.push(snap(i, {
      line: 'loop', prev: back, curr: v, next: null, tag: t('loop', 'loop'),
      leftMarks: i > 0 ? { 0: 'prev' } : {},
      rightMarks: { 0: 'curr' },
      note: i === 0
        ? t(`<b>curr</b> is node ${v} and the reversed run is still empty. One node per pass, and the pass has to end with the list in a state the next pass can start from.`,
            `<b>curr</b> သည် node ${v} ဖြစ်ပြီး ပြောင်းပြန် run မှာ ဗလာ ဖြစ်နေဆဲ။ တစ်ကြိမ်လျှင် node တစ်ခု၊ ထို့ပြင် တစ်ကြိမ်ပြီးတိုင်း list သည် နောက်တစ်ကြိမ် စနိုင်သော အခြေအနေတွင် ရှိရမည်။`)
        : t(`<b>curr</b> is node ${v}. The run on the left is already reversed and ends in null; the run on the right is untouched. ${plural(n - i, 'node')} left.`,
            `<b>curr</b> သည် node ${v} ဖြစ်သည်။ ဘယ်ဘက် run သည် ပြောင်းပြန် ဖြစ်ပြီးသားဖြစ်ပြီး null ဖြင့် ဆုံးသည်၊ ညာဘက် run ကို မထိရသေးပါ။ node ${n - i} ခု ကျန်သည်။`),
    }));

    steps.push(snap(i, {
      line: 'save', prev: back, curr: v, next: w, tag: t('save', 'သိမ်း'),
      leftMarks: i > 0 ? { 0: 'prev' } : {},
      rightMarks: w != null ? { 0: 'curr', 1: 'next' } : { 0: 'curr' },
      rightTone: w != null ? { 1: 'up' } : {},
      note: w != null
        ? t(`<b>next = ${w}</b>. This line looks like bookkeeping and is not: <code>curr.next</code> is about to be overwritten, and once it is, node ${w} and everything behind it has no other reference anywhere in the program.`,
            `<b>next = ${w}</b>။ ဤစာကြောင်းသည် မှတ်တမ်းတင်ရုံဟု ထင်ရသော်လည်း မဟုတ်ပါ — <code>curr.next</code> ကို ပြန်ရေးတော့မည်ဖြစ်ပြီး ရေးလိုက်သည်နှင့် node ${w} နှင့် ၎င်းနောက်ရှိ အားလုံးကို program ထဲ မည်သည့်နေရာမှမျှ ညွှန်မထားတော့ပါ။`)
        : t(`<b>next = null</b> — node ${v} is the tail, so there is nothing beyond it to save. The line still has to run, because the loop reads <b>next</b> unconditionally.`,
            `<b>next = null</b> — node ${v} သည် tail ဖြစ်သဖြင့် ၎င်းနောက်တွင် သိမ်းစရာ မရှိပါ။ loop က <b>next</b> ကို အမြဲ ဖတ်သဖြင့် ဤစာကြောင်း run ရဆဲ။`),
    }));

    // The frame this whole lesson is built around: one assignment moves node v
    // out of the forward run and into the reversed run, and the forward run is
    // now held up by `next` alone.
    steps.push(snap(i + 1, {
      line: 'rev', prev: back, curr: v, next: w, tag: t('rewire', 'ပြန်ချိတ်'),
      leftMarks: i > 0 ? { 0: 'curr', 1: 'prev' } : { 0: 'curr' },
      leftTone: { 0: 'warn' },
      rightMarks: w != null ? { 0: 'next' } : {},
      note: i === 0
        ? t(`<b>curr.next = prev</b>. Node ${v} was the head of the list and now points at null — it has become the tail of the reversed run. Node ${show(w)} is no longer reachable from the head of anything; the only thing holding it is <b>next</b>.`,
            `<b>curr.next = prev</b>။ node ${v} သည် list ၏ head ဖြစ်ခဲ့ပြီး ယခု null ကို ညွှန်နေသည် — ပြောင်းပြန် run ၏ tail ဖြစ်သွားပြီ။ node ${show(w)} ကို မည်သည့် head မှမျှ မရောက်နိုင်တော့ပါ — ၎င်းကို ကိုင်ထားသည်မှာ <b>next</b> တစ်ခုတည်း ဖြစ်သည်။`)
        : t(`<b>curr.next = prev</b>. Node ${v} just changed runs: it now points backwards at ${back}, so the left run grew by one and the right run lost its first node. ${w != null ? `Reaching node ${w} from ${v} is no longer possible — that link is gone.` : `There was nothing after ${v}, so nothing was stranded.`}`,
            `<b>curr.next = prev</b>။ node ${v} သည် run ပြောင်းသွားပြီ — ယခု ${back} ကို နောက်ပြန် ညွှန်သဖြင့် ဘယ်ဘက် run တစ်ခု တိုးပြီး ညာဘက် run ၏ ပထမ node လျော့သွားသည်။ ${w != null ? `${v} မှ node ${w} သို့ မရောက်နိုင်တော့ပါ — ထို link ပျောက်သွားပြီ။` : `${v} နောက်တွင် ဘာမျှ မရှိသဖြင့် ပျောက်သွားသည့်အရာ မရှိပါ။`}`),
    }));

    steps.push(snap(i + 1, {
      line: 'advp', prev: v, curr: v, next: w, tag: t('advance', 'ရှေ့တိုး'),
      leftMarks: { 0: 'prev · curr' },
      rightMarks: w != null ? { 0: 'next' } : {},
      note: t(`<b>prev = curr</b>. Both name node ${v} for one line. <b>prev</b> has to end up here because the next node rewired will have to point at ${v}.`,
              `<b>prev = curr</b>။ စာကြောင်း တစ်ကြောင်းစာ နှစ်ခုစလုံး node ${v} ကို ညွှန်သည်။ နောက် ပြန်ချိတ်မည့် node သည် ${v} ကို ညွှန်ရမည်ဖြစ်၍ <b>prev</b> ဤနေရာသို့ ရောက်ရမည်။`),
    }));

    steps.push(snap(i + 1, {
      line: 'advc', prev: v, curr: w, next: w, tag: t('advance', 'ရှေ့တိုး'),
      leftMarks: { 0: 'prev' },
      rightMarks: w != null ? { 0: 'curr · next' } : {},
      note: w != null
        ? t('<b>curr = next</b>, the step that spends the value saved two lines ago. The list is now in the same shape the pass started in, one node further along.',
            '<b>curr = next</b> — စာကြောင်းနှစ်ကြောင်းအလိုက သိမ်းခဲ့သော တန်ဖိုးကို သုံးသည့် အဆင့်။ list သည် ဤအကြိမ် စခဲ့သည့် ပုံစံအတိုင်း ပြန်ဖြစ်ပြီး node တစ်ခု ရှေ့ရောက်သွားသည်။')
        : t('<b>curr = next</b>, which is null. That ends the walk.',
            '<b>curr = next</b> — null ဖြစ်သည်။ လျှောက်ခြင်း ပြီးဆုံးသည်။'),
    }));
  }

  steps.push(snap(n, {
    line: 'loop', prev: n ? a[n - 1] : null, curr: null, next: null, tag: t('done', 'ပြီး'),
    leftMarks: n ? { 0: 'prev' } : {},
    note: n
      ? t('<b>curr</b> is null, so every node has been rewired exactly once. The right-hand run is empty because there is nothing left pointing the original way.',
          '<b>curr</b> သည် null ဖြစ်သဖြင့် node တိုင်းကို တစ်ကြိမ်စီ ပြန်ချိတ်ပြီးပြီ။ မူလ ဦးတည်ရာသို့ ညွှန်နေသည့်အရာ မကျန်တော့သဖြင့် ညာဘက် run ဗလာ ဖြစ်သည်။')
      : t('<b>curr</b> was null from the start, so the loop body never ran.',
          '<b>curr</b> သည် အစကတည်းက null ဖြစ်သဖြင့် loop ကိုယ်ထည် လုံးဝ မ run ခဲ့ပါ။'),
  }));

  steps.push(snap(n, {
    line: 'ret', prev: n ? a[n - 1] : null, curr: null, next: null, done: true, tag: t('return', 'return'),
    leftMarks: n ? { 0: 'prev' } : {},
    result: a.slice().reverse(),
    note: n
      ? t(`Return <b>prev</b>, not <b>curr</b>. <b>curr</b> ran off the end; <b>prev</b> is the last node that existed, which is the old tail and therefore the new head. ${n} link rewrites, three variables, nothing allocated.`,
          `<b>curr</b> မဟုတ်ဘဲ <b>prev</b> ကို ပြန်ပေးသည်။ <b>curr</b> သည် အဆုံးကို ကျော်သွားပြီ — <b>prev</b> သည် နောက်ဆုံး ရှိခဲ့သော node ဖြစ်ပြီး မူလ tail ဖြစ်သဖြင့် head အသစ် ဖြစ်သည်။ link ပြန်ရေးခြင်း ${n} ကြိမ်၊ variable သုံးခု၊ memory အသစ် မယူပါ။`)
      : t('Return <b>prev</b>, which is null — the correct answer for an empty list, and it falls out of the initialisation rather than needing a special case.',
          'null ဖြစ်သော <b>prev</b> ကို ပြန်ပေးသည် — list ဗလာအတွက် မှန်ကန်သော အဖြေ ဖြစ်ပြီး သီးခြား case မလိုဘဲ စတင်တန်ဖိုးမှ အလိုလို ထွက်လာသည်။'),
  }));

  return steps;
}

function buildRecursive({ nums }) {
  const a = nums;
  const n = a.length;
  const steps = [];
  const frames = [];

  const snap = (extra) => ({
    frames: frames.slice(),
    fwd: [],
    rev: [],
    fwdMarks: {},
    revMarks: {},
    fwdTone: {},
    revTone: {},
    fwdNull: true,
    cycleTo: null,
    newHead: null,
    ...extra,
  });

  if (n === 0) {
    frames.push('reverse_list(null)');
    steps.push(snap({
      line: 'base', head: null, headNext: null, tag: t('descend', 'ဆင်း'),
      note: t('One call, and <b>head</b> is null. The guard catches it before anything dereferences a null pointer.',
              'call တစ်ခု၊ <b>head</b> သည် null ဖြစ်သည်။ null pointer ကို မဖတ်မီ guard က ဖမ်းထားသည်။'),
    }));
    steps.push(snap({
      line: 'baseret', head: null, headNext: null, result: [], done: true, tag: t('return', 'return'),
      note: t('Return <b>head</b>, which is null. An empty list reversed is an empty list, and no frame ever had to do any work.',
              'null ဖြစ်သော <b>head</b> ကို ပြန်ပေးသည်။ list ဗလာကို ပြောင်းပြန်လှန်လည်း list ဗလာ ဖြစ်ပြီး မည်သည့် frame ကမျှ အလုပ် မလုပ်ရပါ။'),
    }));
    return steps;
  }

  /* ---- descent: nothing is modified, the stack just gets deeper ---- */
  for (let i = 0; i < n; i++) {
    frames.push(`reverse_list(${a[i]})`);
    const atTail = i === n - 1;

    steps.push(snap({
      line: 'base', head: a[i], headNext: atTail ? null : a[i + 1], at: i, tag: t('descend', 'ဆင်း'),
      fwd: a.slice(), fwdMarks: { [i]: 'head' },
      note: atTail
        ? t(`Depth ${i + 1}. Node ${a[i]} has no <code>next</code>, so this is the tail and the recursion stops here.`,
            `အနက် ${i + 1}။ node ${a[i]} တွင် <code>next</code> မရှိသဖြင့် ၎င်းသည် tail ဖြစ်ပြီး recursion ဤနေရာတွင် ရပ်သည်။`)
        : t(`Depth ${i + 1}. Node ${a[i]} still has a <code>next</code>, so this frame cannot answer anything yet.`,
            `အနက် ${i + 1}။ node ${a[i]} တွင် <code>next</code> ရှိနေဆဲဖြစ်၍ ဤ frame က ဘာမျှ မဖြေနိုင်သေးပါ။`),
    }));

    if (atTail) {
      // The tail is the first node of the reversed run, so from here on the
      // picture is two runs. With a one-node list those two runs are the same
      // single node, and this frame is already the answer.
      const lone = n === 1;
      steps.push(snap({
        line: 'baseret', head: a[i], headNext: null, newHead: a[i], at: i, tag: t('base case', 'base case'),
        fwd: lone ? a.slice() : a.slice(0, n - 1),
        fwdNull: lone,
        fwdMarks: lone ? { 0: 'head' } : {},
        rev: [a[n - 1]], revMarks: { 0: 'new_head · head' }, revTone: { 0: 'up' },
        result: lone ? a.slice() : undefined,
        done: lone,
        note: lone
          ? t(`The list has one node, so the guard fires on the first call and node ${a[0]} is returned as it is. A one-node list is already its own reversal, and no link is ever written.`,
              `list တွင် node တစ်ခုသာ ရှိသဖြင့် ပထမ call တွင်ပင် guard အလုပ်လုပ်ပြီး node ${a[0]} ကို ဒီအတိုင်း ပြန်ပေးသည်။ node တစ်ခုတည်းသော list သည် သူ့ကိုယ်သူ ပြောင်းပြန် ဖြစ်ပြီးသားဖြစ်၍ link တစ်ခုမျှ မရေးရပါ။`)
          : t(`Return node ${a[i]} unchanged. It is a reversed list of one, and it is <b>new_head</b> — every frame below will hand this same node back without touching it again.`,
              `node ${a[i]} ကို မပြောင်းဘဲ ပြန်ပေးသည်။ ၎င်းသည် node တစ်ခုပါ ပြောင်းပြန် list ဖြစ်ပြီး <b>new_head</b> ဖြစ်သည် — အောက်ရှိ frame တိုင်းက ဤ node ကိုပင် ထပ်မထိဘဲ ပြန်ပေးသွားမည်။`),
      }));
      break;
    }

    steps.push(snap({
      line: 'recurse', head: a[i], headNext: a[i + 1], at: i, tag: t('descend', 'ဆင်း'),
      fwd: a.slice(), fwdMarks: { [i]: 'head' },
      note: t(`Call into node ${a[i + 1]} and wait. The list is still completely untouched — head recursion does all of its work on the way back up, so the descent is ${plural(n - 1 - i, 'more call')} of pure stack.`,
              `node ${a[i + 1]} သို့ call လုပ်ပြီး စောင့်သည်။ list ကို လုံးဝ မထိရသေးပါ — head recursion သည် အလုပ်အားလုံးကို ပြန်တက်လာစဉ်မှ လုပ်သဖြင့် အဆင်းမှာ stack သက်သက်သာ ဖြစ်သော call ${n - 1 - i} ခု ထပ်ရှိသည်။`),
    }));
  }

  /* ---- unwind: each frame rewires one link, deepest first ---- */
  for (let i = n - 2; i >= 0; i--) {
    frames.pop();
    const v = a[i];
    const child = a[i + 1];
    const reversedSoFar = a.slice(i + 1).reverse();      // head-first from new_head
    const withV = [...reversedSoFar, v];

    steps.push(snap({
      line: 'recurse', head: v, headNext: child, newHead: a[n - 1], at: i, unwound: n - 1 - i, tag: t('returns', 'ပြန်တက်'),
      fwd: a.slice(0, i + 1), fwdMarks: { [i]: 'head' }, fwdNull: false,
      rev: reversedSoFar,
      revMarks: { 0: 'new_head', [reversedSoFar.length - 1]: 'tail' },
      revTone: { [reversedSoFar.length - 1]: 'up' },
      note: t(`The call returned ${a[n - 1]} and everything after node ${v} is now reversed. Nothing in that returned run points at node ${v}, but <b>head.next</b> is still node ${child} — and node ${child} is that run's <em>tail</em>. That coincidence is the whole algorithm.`,
              `call က ${a[n - 1]} ကို ပြန်ပေးပြီး node ${v} နောက်ရှိ အားလုံး ပြောင်းပြန် ဖြစ်သွားပြီ။ ပြန်ရလာသော run ထဲမှ ဘာကမျှ node ${v} ကို မညွှန်ပါ၊ သို့သော် <b>head.next</b> သည် node ${child} ဖြစ်နေဆဲ — node ${child} သည် ထို run ၏ <em>tail</em> ဖြစ်သည်။ ထိုတိုက်ဆိုင်မှုသည် algorithm တစ်ခုလုံး ဖြစ်သည်။`),
    }));

    steps.push(snap({
      line: 'point', head: v, headNext: child, newHead: a[n - 1], at: i, unwound: n - 1 - i, tag: t('rewire', 'ပြန်ချိတ်'),
      fwd: a.slice(0, i + 1), fwdMarks: { [i]: 'head' }, fwdTone: { [i]: 'warn' }, fwdNull: false,
      rev: withV, revMarks: { 0: 'new_head', [withV.length - 1]: 'head' },
      revTone: { [withV.length - 1]: 'warn' },
      cycleTo: withV.length - 2,
      note: t(`<b>head.next.next = head</b> — node ${child} now points at node ${v}. For this one instant the list is genuinely broken: ${v} still points at ${child} and ${child} now points back at ${v}, a two-node loop. Walking the result here would never terminate.`,
              `<b>head.next.next = head</b> — node ${child} သည် ယခု node ${v} ကို ညွှန်သည်။ ဤခဏတွင် list သည် တကယ် ပျက်နေသည် — ${v} သည် ${child} ကို ညွှန်ဆဲဖြစ်ပြီး ${child} က ${v} ကို ပြန်ညွှန်နေသဖြင့် node နှစ်ခု loop ဖြစ်နေသည်။ ဤအချိန်တွင် ရလဒ်ကို လျှောက်ကြည့်လျှင် ဘယ်တော့မှ မဆုံးပါ။`),
    }));

    steps.push(snap({
      line: 'cut', head: v, headNext: null, newHead: a[n - 1], at: i, unwound: n - i, tag: t('rewire', 'ပြန်ချိတ်'),
      fwd: a.slice(0, i + 1), fwdMarks: { [i]: 'head' }, fwdNull: true,
      rev: withV, revMarks: { 0: 'new_head', [withV.length - 1]: 'tail' },
      revTone: { [withV.length - 1]: 'up' },
      note: t(`<b>head.next = null</b> breaks the loop. Node ${v} is now the tail of the reversed run, exactly the state node ${child} was in when this frame started. ${i > 0 ? `Node ${a[i - 1]} still points forward at ${v}, which is what the frame below will use.` : `Nothing points at ${v} any more except the reversed run.`}`,
              `<b>head.next = null</b> က loop ကို ဖြတ်သည်။ node ${v} သည် ယခု ပြောင်းပြန် run ၏ tail ဖြစ်သည် — ဤ frame စစဉ်က node ${child} ရှိခဲ့သည့် အခြေအနေအတိုင်း အတိအကျ။ ${i > 0 ? `node ${a[i - 1]} သည် ${v} ကို ရှေ့သို့ ညွှန်နေဆဲဖြစ်ပြီး အောက်ရှိ frame က ၎င်းကို သုံးမည်။` : `ပြောင်းပြန် run မှလွဲ၍ ${v} ကို မည်သည့်အရာကမျှ မညွှန်တော့ပါ။`}`),
    }));

    steps.push(snap({
      line: 'ret', head: v, headNext: null, newHead: a[n - 1], at: i, unwound: n - i, tag: t('return', 'return'),
      fwd: a.slice(0, i + 1), fwdMarks: { [i]: 'head' }, fwdNull: true,
      rev: withV, revMarks: { 0: 'new_head', [withV.length - 1]: 'tail' },
      result: i === 0 ? a.slice().reverse() : undefined,
      done: i === 0,
      note: i === 0
        ? t(`Return <b>new_head</b> one last time. Node ${a[n - 1]} was decided at the deepest frame and passed back unchanged through all ${n} of them; every frame rewired exactly one link on its way out.`,
            `<b>new_head</b> ကို နောက်ဆုံးအကြိမ် ပြန်ပေးသည်။ node ${a[n - 1]} ကို အနက်ဆုံး frame တွင် ဆုံးဖြတ်ခဲ့ပြီး frame ${n} ခုလုံးကို မပြောင်းဘဲ ဖြတ်၍ ပြန်ပေးခဲ့သည် — frame တိုင်းက ထွက်ခါနီး link တစ်ခုစီ ပြန်ချိတ်ခဲ့သည်။`)
        : t(`Return <b>new_head</b> — still node ${a[n - 1]}, unchanged since the base case. Pop back to depth ${i}.`,
            `<b>new_head</b> ကို ပြန်ပေးသည် — base case ကတည်းက မပြောင်းသော node ${a[n - 1]} ဖြစ်နေဆဲ။ အနက် ${i} သို့ ပြန်ဆင်းသည်။`),
    }));
  }

  return steps;
}

/* ---------------- drawing ----------------
 *
 * The strip card is the input list as it was given, with the pointers on it.
 * The stage holds what the approach carries between steps: for the loop, the
 * two runs the list is split into; for the recursion, the same two runs plus
 * the call stack that is holding every back-pointer.
 */

function strip(s, { nums }) {
  const tone = {};
  const marks = {};
  if (s.frames) {
    if (s.at != null) {
      if (s.unwound) for (let j = nums.length - s.unwound; j < nums.length; j++) tone[j] = 'done';
      tone[s.at] = 'inwin';
      marks[s.at] = 'head';
    }
  } else {
    // Where prev / curr / next sit in the original order, read off the line
    // being run and how many nodes have been rewired so far.
    const r = s.rewired;
    let p = null, c = null, x = null;
    if (s.line === 'curr0') c = s.curr != null ? 0 : null;
    else if (s.curr == null) p = r ? r - 1 : null;                 // loop exit and return
    else if (s.line === 'loop' || s.line === 'save') { p = r - 1; c = r; x = r + 1; }
    else if (s.line === 'rev') { p = r - 2; c = r - 1; x = r; }
    else if (s.line === 'advp') { p = r - 1; c = r - 1; x = r; }
    else if (s.line === 'advc') { p = r - 1; c = r; }
    if (s.prev == null) p = null;
    if (s.next == null || s.line === 'loop') x = null;
    for (let j = 0; j < r; j++) tone[j] = 'done';
    const put = (j, name) => { if (j != null && j >= 0 && j < nums.length) marks[j] = marks[j] ? `${marks[j]}·${name}` : name; };
    put(p, 'prev'); put(c, 'curr'); put(x, 'next');
    if (c != null && c >= r) tone[c] = 'inwin';
    if (x != null) tone[x] = 'entering';
  }
  if (s.done) nums.forEach((_, j) => { tone[j] = 'done'; });
  return cells(nums, { tone, marks });
}

function draw(s) {
  if (s.frames) {
    const forward = chain(s.fwd, {
      label: pick(t('from the original head', 'မူလ head မှ')),
      marks: s.fwdMarks, tone: s.fwdTone, nullTail: s.fwdNull && s.fwd.length > 0,
    });
    const reversed = s.rev.length
      ? chain(s.rev, {
          label: pick(t('reversed · new_head', 'ပြောင်းပြန် · new_head')),
          marks: s.revMarks, tone: s.revTone, cycleTo: s.cycleTo, nullTail: true,
        })
      : '';
    return stagePanel(pick(t('The two runs, and the call stack', 'run နှစ်ခုနှင့် call stack')),
      pick(t(`depth ${s.frames.length}`, `အနက် ${s.frames.length}`)),
      panels(forward, reversed, stack(s.frames, { label: 'call stack' })));
  }
  const reversed = chain(s.left, {
    label: pick(t('reversed · from prev', 'ပြောင်းပြန် · prev မှ')),
    marks: s.leftMarks, tone: s.leftTone, nullTail: s.left.length > 0,
  });
  const rest = chain(s.right, {
    label: pick(t('still pointing forward · from curr', 'ရှေ့သို့ ညွှန်နေဆဲ · curr မှ')),
    marks: s.rightMarks, tone: s.rightTone, nullTail: s.right.length > 0,
  });
  return stagePanel(pick(t('The list, as two runs', 'run နှစ်ခုအဖြစ် list')),
    pick(t(`${s.rewired} rewired`, `${s.rewired} ခု ပြန်ချိတ်ပြီး`)),
    panels(reversed, rest));
}

function answer(s, { nums }) {
  const r = s.result;
  return {
    html: r && r.length ? slots(r, { total: r.length }) : r ? '<span class="note mono">[]</span>' : slots([], { total: Math.max(nums.length, 1) }),
    note: r ? t('the reversed list', 'ပြောင်းပြန် list') : t('head of the reversed list', 'ပြောင်းပြန် list ၏ head'),
  };
}

function vars(s) {
  if (s.frames) {
    return [['head', show(s.head)], ['new_head', show(s.newHead)]];
  }
  return [['prev', show(s.prev)], ['curr', show(s.curr)], ['next', show(s.next)]];
}

/* ---------------- the code, one key per line ---------------- */


const CODE = {
  iterative: {
    ruby: [
      [null, `${k('def')} reverse_list(head)`],
      ['prev0', `  prev = ${k('nil')}`],
      ['curr0', `  curr = head`],
      ['loop', `  ${k('while')} curr`],
      ['save', `    nxt = curr.next           ${c('# save the way forward')}`],
      ['rev', `    curr.next = prev          ${c('# the destructive step')}`],
      ['advp', `    prev = curr`],
      ['advc', `    curr = nxt`],
      [null, `  ${k('end')}`],
      ['ret', `  prev`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} reverseList(self, head):`],
      ['prev0', `        prev = ${k('None')}`],
      ['curr0', `        curr = head`],
      ['loop', `        ${k('while')} curr:`],
      ['save', `            nxt = curr.next       ${c('# save the way forward')}`],
      ['rev', `            curr.next = prev      ${c('# the destructive step')}`],
      ['advp', `            prev = curr`],
      ['advc', `            curr = nxt`],
      ['ret', `        ${k('return')} prev`],
    ],
    javascript: [
      [null, `${k('var')} reverseList = ${k('function')} (head) {`],
      ['prev0', `  ${k('let')} prev = ${k('null')};`],
      ['curr0', `  ${k('let')} curr = head;`],
      ['loop', `  ${k('while')} (curr !== ${k('null')}) {`],
      ['save', `    ${k('const')} next = curr.next;     ${c('// save the way forward')}`],
      ['rev', `    curr.next = prev;           ${c('// the destructive step')}`],
      ['advp', `    prev = curr;`],
      ['advc', `    curr = next;`],
      [null, `  }`],
      ['ret', `  ${k('return')} prev;`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} reverseList(head *ListNode) *ListNode {`],
      ['prev0', `    ${k('var')} prev *ListNode`],
      ['curr0', `    curr := head`],
      ['loop', `    ${k('for')} curr != ${k('nil')} {`],
      ['save', `        next := curr.Next       ${c('// save the way forward')}`],
      ['rev', `        curr.Next = prev        ${c('// the destructive step')}`],
      ['advp', `        prev = curr`],
      ['advc', `        curr = next`],
      [null, `    }`],
      ['ret', `    ${k('return')} prev`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} reverse_list(head: Option&lt;Box&lt;ListNode&gt;&gt;) -&gt; Option&lt;Box&lt;ListNode&gt;&gt; {`],
      ['prev0', `        ${k('let')} ${k('mut')} prev: Option&lt;Box&lt;ListNode&gt;&gt; = ${k('None')};`],
      ['curr0', `        ${k('let')} ${k('mut')} curr = head;`],
      ['loop', `        ${k('while')} ${k('let')} Some(${k('mut')} node) = curr {`],
      ['save', `            ${k('let')} next = node.next.take();   ${c('// save the way forward')}`],
      ['rev', `            node.next = prev;              ${c('// the destructive step')}`],
      ['advp', `            prev = Some(node);`],
      ['advc', `            curr = next;`],
      [null, `        }`],
      ['ret', `        prev`],
      [null, `    }`],
      [null, `}`],
    ],
  },
  recursive: {
    ruby: [
      [null, `${k('def')} reverse_list(head)`],
      ['base', `  ${k('if')} head.${k('nil?')} || head.next.${k('nil?')}`],
      ['baseret', `    ${k('return')} head`],
      [null, `  ${k('end')}`],
      ['recurse', `  new_head = reverse_list(head.next)`],
      ['point', `  head.next.next = head`],
      ['cut', `  head.next = ${k('nil')}`],
      ['ret', `  new_head`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('import')} sys`],
      [null, `sys.setrecursionlimit(10_000)   ${c('# 5,000 nodes deep; the default is 1,000')}`],
      [null, ``],
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} reverseList(self, head):`],
      ['base', `        ${k('if')} head ${k('is')} ${k('None')} ${k('or')} head.next ${k('is')} ${k('None')}:`],
      ['baseret', `            ${k('return')} head`],
      ['recurse', `        new_head = self.reverseList(head.next)`],
      ['point', `        head.next.next = head`],
      ['cut', `        head.next = ${k('None')}`],
      ['ret', `        ${k('return')} new_head`],
    ],
    javascript: [
      [null, `${k('var')} reverseList = ${k('function')} (head) {`],
      ['base', `  ${k('if')} (head === ${k('null')} || head.next === ${k('null')}) {`],
      ['baseret', `    ${k('return')} head;`],
      [null, `  }`],
      ['recurse', `  ${k('const')} newHead = reverseList(head.next);`],
      ['point', `  head.next.next = head;`],
      ['cut', `  head.next = ${k('null')};`],
      ['ret', `  ${k('return')} newHead;`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} reverseList(head *ListNode) *ListNode {`],
      ['base', `    ${k('if')} head == ${k('nil')} || head.Next == ${k('nil')} {`],
      ['baseret', `        ${k('return')} head`],
      [null, `    }`],
      ['recurse', `    newHead := reverseList(head.Next)`],
      ['point', `    head.Next.Next = head`],
      ['cut', `    head.Next = ${k('nil')}`],
      ['ret', `    ${k('return')} newHead`],
      [null, `}`],
    ],
    // Safe Rust owns each node through its predecessor's Box, so a frame cannot
    // keep a usable back-pointer into a list it has already handed downward.
    // The recursion carries `prev` as an argument instead; the rewiring happens
    // on the way down, and the base case returns the finished list.
    rust: [
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} reverse_list(head: Option&lt;Box&lt;ListNode&gt;&gt;) -&gt; Option&lt;Box&lt;ListNode&gt;&gt; {`],
      ['ret', `        Self::rev(head, ${k('None')})`],
      [null, `    }`],
      [null, ``],
      [null, `    ${k('fn')} rev(curr: Option&lt;Box&lt;ListNode&gt;&gt;, prev: Option&lt;Box&lt;ListNode&gt;&gt;) -&gt; Option&lt;Box&lt;ListNode&gt;&gt; {`],
      ['base', `        ${k('let')} ${k('mut')} node = ${k('match')} curr {`],
      ['baseret', `            ${k('None')} =&gt; ${k('return')} prev,`],
      [null, `            Some(n) =&gt; n,`],
      [null, `        };`],
      ['cut', `        ${k('let')} next = node.next.take();`],
      ['point', `        node.next = prev;`],
      ['recurse', `        Self::rev(next, Some(node))`],
      [null, `    }`],
      [null, `}`],
    ],
  },
};

/* ---------------- part 1: the "save next first" widget ----------------
 *
 * Reversing a singly linked list hinges on one fact the statement never says:
 * a node's `next` is the only way to reach the rest of the list, so the moment
 * you point it backwards, everything after it is gone — unless you saved it
 * first. Drag to reverse links one at a time; switch off "save next" and watch
 * the tail become unreachable on the very first rewrite.
 *
 * Built from x-sum's widget vocabulary: .q-arr cells (kept / cut), the
 * .q-slider, the amber .q-tie line and the .ledger.
 */

const QW_SETS = [
  { label: t('example 1', 'ဥပမာ 1'), nums: [1, 2, 3, 4, 5], save: true },
  { label: t('example 2', 'ဥပမာ 2'), nums: [1, 2], save: true },
  { label: t('forget to save next', 'next ကို မသိမ်းမိ'), nums: [1, 2, 3, 4, 5], save: false },
];

function mountRewireWidget(host) {
  const state = { set: 0, k: 0 };

  host.innerHTML = `
    <div class="q-arr" data-arr></div>
    <div class="q-slider">
      <label for="qw-k" data-lbl></label>
      <input type="range" id="qw-k" min="0" max="5" value="0">
      <output data-out>0</output>
      <span class="q-presets" data-presets></span>
    </div>
    <p class="q-tie" data-line></p>
    <div class="ledger">
      <span class="expr" data-expr></span>
      <span class="total" data-total></span>
    </div>`;

  const q = (sel) => host.querySelector(sel);

  function render() {
    const { nums: a, save } = QW_SETS[state.set];
    const n = a.length;
    // Without `next`, the loop can rewire the first node and then has nothing
    // to step to: curr.next is already prev.
    const k = Math.min(state.k, save ? n : 1);
    const lost = !save && k >= 1 ? n - 1 : 0;

    q('[data-lbl]').textContent = pick(t('rewired', 'ပြန်ချိတ်ပြီး'));
    const slider = q('#qw-k');
    slider.max = String(save ? n : 1);
    slider.value = String(k);
    q('[data-out]').textContent = String(k);
    q('[data-presets]').innerHTML = QW_SETS.map((x, i) =>
      `<button class="chip" data-set="${i}"${i === state.set ? ' aria-pressed="true"' : ''}>${pick(x.label)}</button>`).join('');

    // kept = already reversed · plain = still forward, reachable · cut = lost
    q('[data-arr]').innerHTML = a.map((v, j) => {
      const cls = j < k ? 'kept' : lost ? 'cut' : '';
      const arrow = j < k ? (j === 0 ? '∅←' : '←') : lost ? '✗' : '→';
      return `<div class="cell ${cls}"><span>${v}</span><span class="idx">${arrow}</span></div>`;
    }).join('');

    const label = document.getElementById('q-label');
    if (label) label.textContent = pick(save ? t('prev · curr · next', 'prev · curr · next') : t('prev · curr only', 'prev · curr သာ'));

    const reached = k + (lost ? 0 : n - k);
    let line;
    if (k === 0) {
      line = save
        ? t('Nothing rewired yet. Drag right: each step points one node backwards.', 'ဘာမျှ ပြန်မချိတ်ရသေးပါ။ ညာဘက်သို့ ဆွဲပါ — တစ်လှမ်းစီ node တစ်ခုကို နောက်ပြန် ညွှန်စေသည်။')
        : t('Same loop, but without the line <code>next = curr.next</code>. Drag right once.', 'loop အတူတူ၊ သို့သော် <code>next = curr.next</code> စာကြောင်း မပါ။ ညာဘက်သို့ တစ်ကြိမ် ဆွဲပါ။');
    } else if (lost) {
      line = t(`curr.next = prev pointed node ${a[0]} at null — and that was the only link to ${a[1]}. Nodes ${a.slice(1).join(', ')} are still in memory, but nothing in the program can reach them.`,
               `curr.next = prev က node ${a[0]} ကို null သို့ ညွှန်စေလိုက်သည် — ၎င်းမှာ ${a[1]} သို့ သွားရာ တစ်ခုတည်းသော link ဖြစ်ခဲ့သည်။ node ${a.slice(1).join(', ')} တို့ memory ထဲ ရှိနေဆဲဖြစ်သော်လည်း program ထဲမှ ဘာကမျှ မရောက်နိုင်တော့ပါ။`);
    } else if (k === n) {
      line = t(`Every link reversed, and every node still reachable — from ${a[n - 1]}, the new head.`,
               `link တိုင်း ပြောင်းပြန် ဖြစ်ပြီ၊ node တိုင်းကို head အသစ် ${a[n - 1]} မှ ရောက်နိုင်ဆဲ။`);
    } else {
      line = t(`${a[k - 1]} now points back at ${k > 1 ? a[k - 2] : 'null'}. ${a[k]} is reachable only because next was saved one line earlier.`,
               `${a[k - 1]} သည် ယခု ${k > 1 ? a[k - 2] : 'null'} ကို နောက်ပြန် ညွှန်သည်။ ${a[k]} ကို ရောက်နိုင်သေးသည်မှာ စာကြောင်းတစ်ကြောင်းအလိုက next ကို သိမ်းထားခဲ့၍သာ ဖြစ်သည်။`);
    }
    q('[data-line]').innerHTML = pick(line);

    // the ledger is a formula, as on x-sum: the two runs, written as links
    const left = a.slice(0, k).reverse().join(' → ');
    const right = lost ? '✗' : a.slice(k).join(' → ');
    q('[data-expr]').innerHTML = `prev: ${left ? `${left} → null` : 'null'} &nbsp;·&nbsp; next: ${right ? (lost ? right : `${right} → null`) : 'null'}`;
    q('[data-total]').innerHTML = `${reached}/${n}<small>${pick(t('reachable', 'ရောက်နိုင်'))}</small>`;
  }

  host.addEventListener('input', (ev) => {
    if (ev.target.id !== 'qw-k') return;
    state.k = Number(ev.target.value); render();
  });
  host.addEventListener('click', (ev) => {
    const chip = ev.target.closest('[data-set]');
    if (!chip) return;
    state.set = Number(chip.dataset.set);
    state.k = 0;
    render();
  });
  onLangChange(render);
  render();
}

/* ---------------- mount ----------------
 *
 * Last in the file on purpose: mountLesson runs the widget immediately, so
 * every const the widget reads must already be initialised. */

mountLesson({
  input: { nums: [1, 2, 3, 4, 5] },
  controls: [
    { key: 'nums', label: 'head', value: '1, 2, 3, 4, 5',
      parse: (v) => {
        const s = v.trim().replace(/^\[|\]$/g, '');
        if (!s.trim()) return [];
        // Number('') is 0, so a blank segment would quietly become a node.
        const parts = s.split(',').map((x) => x.trim());
        if (parts.some((x) => x === '')) throw new Error('numbers separated by commas');
        const a = parts.map(Number);
        if (a.some((x) => !Number.isFinite(x))) throw new Error('numbers separated by commas');
        return a.slice(0, 12);
      } },
  ],
  presets: [
    { label: exampleTitle(1), input: { nums: [1, 2, 3, 4, 5] } },
    { label: exampleTitle(2), input: { nums: [1, 2] } },
    { label: exampleTitle(3), input: { nums: [] } },
    { label: t('One node', 'node တစ်ခု'), input: { nums: [7] } },
  ],
  examples: [
    { title: exampleTitle(1), inputHtml: '<code>head = [1,2,3,4,5]</code>', output: '[5,4,3,2,1]',
      why: [t('Every one of the four links flips direction, and node 1 — the old head — ends up pointing at <code>null</code>.',
              'link လေးခုလုံး ဦးတည်ရာ ပြောင်းပြီး မူလ head ဖြစ်သော node 1 သည် နောက်ဆုံးတွင် <code>null</code> ကို ညွှန်သွားသည်။')],
      load: { nums: [1, 2, 3, 4, 5] } },
    { title: exampleTitle(2), inputHtml: '<code>head = [1,2]</code>', output: '[2,1]',
      why: [t('One link to flip. The recursive version shows its brief two-node loop most clearly here.',
              'ပြောင်းရန် link တစ်ခု။ recursive ပုံစံ၏ ခဏတာ node နှစ်ခု loop ကို ဤနေရာတွင် အရှင်းဆုံး မြင်ရသည်။')],
      load: { nums: [1, 2] } },
    { title: exampleTitle(3), inputHtml: '<code>head = []</code>', output: '[]',
      why: [t('No nodes. Both versions must return <code>null</code> without dereferencing it — the loop never runs, the recursion hits its guard.',
              'node မရှိပါ။ နှစ်မျိုးစလုံး null ကို မဖတ်ဘဲ <code>null</code> ပြန်ပေးရမည် — loop မပတ်ပါ၊ recursion က guard တွင် ရပ်သည်။')],
      load: { nums: [] } },
  ],
  modes: [
    { id: 'iterative', name: 'Iterative',
      desc: t('Three pointers, one link rewritten per step.', 'pointer သုံးခု၊ တစ်လှမ်းလျှင် link တစ်ခု ပြန်ရေးသည်။'),
      cost: 'O(n) time · O(1) space', build: buildIterative },
    { id: 'recursive', name: 'Recursive',
      desc: t('Descend to the tail, rewire on the way back up.', 'tail အထိ ဆင်းပြီး ပြန်တက်လာရင်း ပြန်ချိတ်သည်။'),
      cost: 'O(n) time · O(n) stack', build: buildRecursive },
  ],
  languages: LANGUAGES,
  code: CODE,
  hover: {
    ruby: { nxt: 'next' }, python: { nxt: 'next' },
    javascript: { newHead: 'new_head' }, go: { newHead: 'new_head' },
  },
  solutions: {
    iterative: { desc: t('The submission worth writing. Save <code>next</code> before overwriting <code>curr.next</code>, and return <code>prev</code> — <code>curr</code> has run off the end.',
                         'ရေးသင့်သည့် submission ဖြစ်သည်။ <code>curr.next</code> ကို မရေးမီ <code>next</code> ကို သိမ်းပါ၊ <code>prev</code> ကို ပြန်ပေးပါ — <code>curr</code> သည် အဆုံးကို ကျော်သွားပြီ။') },
    recursive: { desc: t('The follow-up. Same n rewrites, with the back-pointers held by the call stack — which is why it costs <code>O(n)</code> stack, and why Python needs its recursion limit raised for 5,000 nodes.',
                         'follow-up အတွက်။ ပြန်ရေးခြင်း n ကြိမ် အတူတူ၊ နောက်ပြန် pointer များကို call stack က ကိုင်ထားသည် — ထို့ကြောင့် <code>O(n)</code> stack ကုန်ပြီး node 5,000 အတွက် Python ၏ recursion limit ကို မြှင့်ရသည်။') },
  },
  // How each language was actually checked. Printed as a badge on every
  // listing in part 3. The corpus: the 3 examples, 2 edges, 15,000 lists of
  // up to 8 nodes over -3..3, 4,990 of up to 60 over the full range, and three
  // long ones (5,000, 5,000 and 999 nodes) — checked against Python's list
  // reversal. The 5,000-node cases are what forced the recursion limit into the
  // recursive Python listing: without it, it raises RecursionError. Go and Rust
  // ran in Docker (golang:1.23-alpine, rust:1-slim).
  verification: {
    ruby: 'ran here · 19,998 cases up to n = 5,000',
    python: 'ran here · 19,998 cases up to n = 5,000',
    javascript: 'ran here · 19,998 cases up to n = 5,000',
    go: 'ran here · 19,998 cases · Go 1.23',
    rust: 'ran here · 19,998 cases · rustc 1.98',
  },
  caveats: {
    recursive: {
      rust: t('Safe Rust owns each node through its predecessor&rsquo;s <code>Box</code>, so a frame cannot hold a usable back-pointer into a list it has already handed to the recursive call. The relink-on-the-way-up form the narration describes is not expressible in safe Rust, so this listing carries <code>prev</code> down as an argument instead. It is a correct reversal, but its lines run in a different order than the steps describe.',
              'safe Rust တွင် node တစ်ခုစီကို ၎င်း၏ ရှေ့ node ၏ <code>Box</code> က ပိုင်ဆိုင်သဖြင့် recursive call သို့ လွှဲပေးပြီးသော list ထဲသို့ frame တစ်ခုက အသုံးပြုနိုင်သော နောက်ပြန် pointer ကို ကိုင်မထားနိုင်ပါ။ narration ဖော်ပြသည့် ပြန်တက်ရင်း ပြန်ချိတ်သော ပုံစံကို safe Rust ဖြင့် မရေးနိုင်သဖြင့် ဤ listing က <code>prev</code> ကို argument အဖြစ် အောက်သို့ သယ်သွားသည်။ မှန်ကန်စွာ ပြောင်းပြန်လှန်သော်လည်း ၎င်း၏ စာကြောင်းများ run သည့် အစီအစဉ်မှာ အဆင့်များ ဖော်ပြသည်နှင့် မတူပါ။'),
    },
  },
  strip,
  stripLabel: t('The list', 'List'),
  draw,
  answer,
  vars,
  widget: mountRewireWidget,
});
