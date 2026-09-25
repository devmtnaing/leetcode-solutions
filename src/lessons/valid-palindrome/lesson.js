/* Valid Palindrome — LeetCode 125.
 *
 * The contrast worth seeing: the clean-first version answers a yes/no question
 * by building two whole strings it then throws away. The two pointers answer the
 * same question by *skipping* the characters the filter would have removed —
 * same O(n) time, but the only state that survives a step is two integers.
 */
import { t, plural, exampleTitle, LANGUAGES, k, c, verdictAnswer, stageRow, presetChips, widgetLabel } from '../../lib/kit.js';
import { mountLesson } from '../../lib/stepper.js';
import { pick, onLangChange } from '../../lib/i18n.js';
import { cells, readout, stagePanel } from '../../lib/stage.js';


/* ---------------- shared helpers ---------------- */

const isAlnum = (ch) => /[a-z0-9]/i.test(ch);

/* A space in a cell reads as an empty cell, which is the one character this
 * problem most needs the reader to actually see. */
const show = (ch) => (ch === ' ' ? '␣' : ch);

/* Narration is HTML, and `s` comes from a text box the reader controls. */
const e = (x) => String(x).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

const named = (ch) => (ch === ' ' ? t('a space', 'space တစ်ခု') : t(`<b>'${e(ch)}'</b>`, `<b>'${e(ch)}'</b>`));

/* ---------------- step generators ---------------- */

/* Every snapshot carries its own copy of `cleaned`. One shared array would leave
 * all thirty frames showing the finished string, which is the one thing this
 * approach is here to make look expensive. */
function buildClean({ s }) {
  const chars = [...s];
  const n = chars.length;
  const steps = [];
  const cleaned = [];

  steps.push({ line: 'init', i: null, cleaned: [],
    note: t('An empty buffer to accumulate into. Everything that survives the filter is appended here, so by the end it holds one character per letter or digit in <code>s</code> — that is the <b>O(n)</b> of extra space this approach spends.',
            'စုဆောင်းရန် buffer အလွတ် တစ်ခု။ filter ကို ဖြတ်ကျော်နိုင်သမျှ ဤနေရာသို့ ထည့်သွားသဖြင့် နောက်ဆုံးတွင် <code>s</code> ထဲရှိ စာလုံး သို့မဟုတ် ဂဏန်း တစ်ခုစီအတွက် စာလုံးတစ်လုံးစီ ရှိလာမည် — ဤနည်းက သုံးစွဲသော အပို <b>O(n)</b> memory ပင် ဖြစ်သည်။') });

  for (let i = 0; i < n; i++) {
    const ch = chars[i];

    if (i === 0) {
      steps.push({ line: 'loop', i: 0, cleaned: [], tag: t('pass', 'pass'),
        note: t(`One left-to-right pass over all ${n} characters, deciding for each one whether it belongs in <b>cleaned</b>.`,
                `စာလုံး ${n} လုံးလုံးကို ဘယ်မှညာ တစ်ခေါက် ဖြတ်ပြီး တစ်လုံးချင်းစီ <b>cleaned</b> ထဲ ပါသင့်မသင့် ဆုံးဖြတ်သည်။`) });
    }

    if (!isAlnum(ch)) {
      const nm = named(ch);
      steps.push({ line: 'skip', i, cleaned: cleaned.slice(), tag: t('drop', 'ဖယ်'),
        note: t(`<b>s[${i}]</b> is ${nm.en} — neither a letter nor a digit, so nothing is appended and <b>cleaned</b> stays ${cleaned.length} long.`,
                `<b>s[${i}]</b> သည် ${nm.my} ဖြစ်သည် — စာလုံးလည်း မဟုတ်၊ ဂဏန်းလည်း မဟုတ်သဖြင့် ဘာမျှ မထည့်ဘဲ <b>cleaned</b> ၏ အရှည် ${cleaned.length} အတိုင်း ရှိနေသည်။`) });
      continue;
    }

    cleaned.push(ch.toLowerCase());
    const pos = cleaned.length - 1;
    steps.push({ line: 'keep', i, cleaned: cleaned.slice(), keepAt: pos, tag: t('keep', 'ထည့်'),
      note: pos === 0
        ? t(`<b>s[${i}] = '${e(ch)}'</b> is alphanumeric, so it is lowercased to <b>'${e(ch.toLowerCase())}'</b> and appended. Lowercasing here is what lets the comparison at the end be a plain equality.`,
            `<b>s[${i}] = '${e(ch)}'</b> သည် alphanumeric ဖြစ်သဖြင့် <b>'${e(ch.toLowerCase())}'</b> အဖြစ် အသေးပြောင်းပြီး ထည့်သည်။ ဤနေရာတွင် အသေးပြောင်းထားခြင်းကြောင့် နောက်ဆုံး နှိုင်းယှဉ်မှုကို ရိုးရိုး ညီမျှခြင်းဖြင့် လုပ်နိုင်သည်။`)
        : t(`<b>s[${i}] = '${e(ch)}'</b> survives, lowercased to <b>'${e(ch.toLowerCase())}'</b> at position ${pos} of <b>cleaned</b>.`,
            `<b>s[${i}] = '${e(ch)}'</b> ကျန်ရစ်သည် — <b>'${e(ch.toLowerCase())}'</b> အဖြစ် အသေးပြောင်းပြီး <b>cleaned</b> ၏ နေရာ ${pos} တွင် ထားသည်။`) });
  }

  const reversed = cleaned.slice().reverse();
  const len = cleaned.length;

  steps.push({ line: 'rev', i: null, cleaned: cleaned.slice(), reversed: reversed.slice(), tag: t('copy', 'copy'),
    note: len === 0
      ? t('Nothing survived the filter, so <b>reversed</b> is empty too. Two empty strings now exist where two integers would have done.',
          'filter ကို ဘာမျှ မကျော်နိုင်သဖြင့် <b>reversed</b> လည်း ဗလာ ဖြစ်သည်။ integer နှစ်ခုဖြင့် လုံလောက်မည့်နေရာတွင် string ဗလာ နှစ်ခု ရှိနေပြီ။')
      : t(`<b>reversed</b> is a second copy of the same ${len} characters in the opposite order. Two full strings are now in memory to settle a question whose answer is one bit.`,
          `<b>reversed</b> သည် တူညီသော စာလုံး ${len} လုံးကို ပြောင်းပြန် အစီအစဉ်ဖြင့် ကူးထားသော ဒုတိယ copy ဖြစ်သည်။ အဖြေမှာ bit တစ်ခုသာ ဖြစ်သော မေးခွန်းအတွက် string အပြည့် နှစ်ခု memory ထဲ ရှိနေပြီ။`) });

  let diff = -1;
  for (let k = 0; k < len; k++) {
    if (cleaned[k] !== reversed[k]) { diff = k; break; }
  }

  steps.push({ line: 'cmp', i: null, cleaned: cleaned.slice(), reversed: reversed.slice(), diff,
    verdict: diff === -1, done: true, tag: diff === -1 ? t('true', 'true') : t('false', 'false'),
    note: diff === -1
      ? (len === 0
        ? t('An empty string reads the same in either direction, so the answer is <b>true</b>.',
            'string ဗလာကို မည်သည့်ဘက်မှ ဖတ်ဖတ် အတူတူ ဖြစ်သဖြင့် အဖြေမှာ <b>true</b>။')
        : t(`Every position agrees, so the answer is <b>true</b>. Cost: ${n} characters read and ${2 * len} characters of scratch allocated.`,
            `နေရာတိုင်း ကိုက်ညီသဖြင့် အဖြေမှာ <b>true</b>။ ကုန်ကျမှု — စာလုံး ${n} လုံး ဖတ်ပြီး ယာယီ စာလုံး ${2 * len} လုံးစာ memory ယူခဲ့သည်။`))
      : t(`Position ${diff} differs — <b>'${e(cleaned[diff])}'</b> against <b>'${e(reversed[diff])}'</b> — so the answer is <b>false</b>. Both copies were built in full before a single comparison happened.`,
          `နေရာ ${diff} တွင် မတူပါ — <b>'${e(cleaned[diff])}'</b> နှင့် <b>'${e(reversed[diff])}'</b> — ထို့ကြောင့် အဖြေမှာ <b>false</b>။ နှိုင်းယှဉ်မှု တစ်ခုမျှ မလုပ်ရသေးမီ copy နှစ်ခုလုံးကို အပြည့် တည်ဆောက်ခဲ့ရသည်။`) });

  return steps;
}

/* The two-pointer pass mirrors the submitted code exactly, including the
 * redundant self-comparison when skipping lands both pointers on the same
 * character. A walkthrough that quietly tidies that up stops being a
 * walkthrough of the code on the right. */
function buildTwoPointer({ s }) {
  const chars = [...s];
  const n = chars.length;
  const steps = [];
  const cleared = [];
  const skipped = [];
  let left = 0;
  let right = n - 1;
  let compares = 0;
  let skipsL = 0;
  let skipsR = 0;
  const anyAlnum = chars.some(isAlnum);

  const snap = (extra) => ({ left, right, cleared: cleared.slice(), skipped: skipped.slice(), compares, ...extra });

  steps.push(snap({ line: 'init',
    note: t(`<b>left</b> at 0, <b>right</b> at ${n - 1}. No buffer and no copy — every answer this approach gives comes out of the original ${n} characters.`,
            `<b>left</b> ကို 0 တွင်၊ <b>right</b> ကို ${n - 1} တွင် ထားသည်။ buffer မရှိ၊ copy မရှိ — ဤနည်း၏ အဖြေတိုင်းသည် မူလ စာလုံး ${n} လုံးထဲမှသာ လာသည်။`) }));

  steps.push(snap({ line: 'loop', tag: t('loop', 'loop'),
    note: t('The loop runs while <b>left</b> is still short of <b>right</b>. Each turn either steps over a character that cannot matter or settles one pair.',
            '<b>left</b> သည် <b>right</b> ထက် ငယ်နေသရွေ့ loop ဆက်ပတ်သည်။ တစ်ကြိမ်စီတွင် အရေးမပါသော စာလုံးကို ကျော်သည်၊ သို့မဟုတ် အတွဲ တစ်တွဲကို ဖြေရှင်းသည်။') }));

  while (left < right) {
    while (left < right && !isAlnum(chars[left])) {
      const from = left;
      skipped.push(from);
      left += 1;
      skipsL += 1;
      const nm = named(chars[from]);
      steps.push(snap({ line: 'skipl', tag: t('skip', 'ကျော်'), skipAt: from,
        note: skipsL === 1
          ? t(`<b>s[${from}]</b> is ${nm.en}. The filter would have declined to copy it; here <b>left</b> just moves to ${left} and the character is behind us. Nothing was written anywhere.`,
              `<b>s[${from}]</b> သည် ${nm.my} ဖြစ်သည်။ filter ဆိုလျှင် ၎င်းကို ကူးမည် မဟုတ်ပါ — ဤနေရာတွင်မူ <b>left</b> ကို ${left} သို့ ရွှေ့လိုက်ရုံဖြင့် ထိုစာလုံး နောက်ရောက်သွားသည်။ မည်သည့်နေရာတွင်မျှ ဘာမျှ မရေးခဲ့ပါ။`)
          : t(`<b>s[${from}]</b> is ${nm.en}. <b>left</b> moves to ${left}.`,
              `<b>s[${from}]</b> သည် ${nm.my}။ <b>left</b> ကို ${left} သို့ ရွှေ့သည်။`) }));
    }

    while (left < right && !isAlnum(chars[right])) {
      const from = right;
      skipped.push(from);
      right -= 1;
      skipsR += 1;
      const nm = named(chars[from]);
      steps.push(snap({ line: 'skipr', tag: t('skip', 'ကျော်'), skipAt: from,
        note: skipsR === 1
          ? t(`<b>s[${from}]</b> is ${nm.en}, so <b>right</b> retreats to ${right}. The second skip loop is the first one pointed the other way.`,
              `<b>s[${from}]</b> သည် ${nm.my} ဖြစ်သဖြင့် <b>right</b> ကို ${right} သို့ ဆုတ်သည်။ ဒုတိယ skip loop မှာ ပထမ loop ကို ဆန့်ကျင်ဘက်သို့ လှည့်ထားခြင်းသာ ဖြစ်သည်။`)
          : t(`<b>s[${from}]</b> is ${nm.en}, so <b>right</b> retreats to ${right}.`,
              `<b>s[${from}]</b> သည် ${nm.my} ဖြစ်သဖြင့် <b>right</b> ကို ${right} သို့ ဆုတ်သည်။`) }));
    }

    const a = chars[left];
    const b = chars[right];
    const la = a.toLowerCase();
    const lb = b.toLowerCase();
    const match = la === lb;
    compares += 1;

    steps.push(snap({ line: 'check', tag: t('compare', 'နှိုင်းယှဉ်'), cmpL: left, cmpR: right, match,
      note: left === right
        ? t(`Skipping has left <b>left</b> and <b>right</b> on the same character, index ${left}. The code still runs the comparison, and it is trivially true.`,
            `ကျော်လိုက်ရာမှ <b>left</b> နှင့် <b>right</b> တို့ index ${left} ရှိ စာလုံးတစ်လုံးတည်းပေါ် ရောက်နေသည်။ code က နှိုင်းယှဉ်မှုကို လုပ်ဆဲဖြစ်ပြီး မှန်သည်မှာ သေချာသည်။`)
        : match
          ? t(`<b>s[${left}] = '${e(a)}'</b> against <b>s[${right}] = '${e(b)}'</b>. Lowercased both read <b>'${e(la)}'</b>, so this pair holds.`,
              `<b>s[${left}] = '${e(a)}'</b> နှင့် <b>s[${right}] = '${e(b)}'</b>။ အသေးပြောင်းလိုက်လျှင် နှစ်ခုလုံး <b>'${e(la)}'</b> ဖြစ်သဖြင့် ဤအတွဲ ကိုက်သည်။`)
          : t(`<b>s[${left}] = '${e(a)}'</b> against <b>s[${right}] = '${e(b)}'</b>. Lowercased that is <b>'${e(la)}'</b> against <b>'${e(lb)}'</b>.`,
              `<b>s[${left}] = '${e(a)}'</b> နှင့် <b>s[${right}] = '${e(b)}'</b>။ အသေးပြောင်းလိုက်လျှင် <b>'${e(la)}'</b> နှင့် <b>'${e(lb)}'</b> ဖြစ်သည်။`) }));

    if (!match) {
      const gap = right - left - 1;
      steps.push(snap({ line: 'no', tag: t('false', 'false'), cmpL: left, cmpR: right, match: false,
        verdict: false, done: true,
        note: t(`The pair disagrees, so no amount of further reading can make <code>s</code> a palindrome. Return <b>false</b> after ${plural(compares, 'comparison')}, with the ${plural(gap, 'character')} between the pointers never looked at.`,
                `အတွဲ မကိုက်သဖြင့် ဆက်ဖတ်၍ <code>s</code> ကို palindrome ဖြစ်အောင် မလုပ်နိုင်တော့ပါ။ နှိုင်းယှဉ်မှု ${compares} ကြိမ်အပြီးတွင် <b>false</b> ပြန်ပေးသည် — pointer နှစ်ခုကြားရှိ စာလုံး ${gap} လုံးကို လုံးဝ မကြည့်ခဲ့ရပါ။`) }));
      return steps;
    }

    const selfPair = left === right;
    cleared.push(left);
    if (!selfPair) cleared.push(right);
    left += 1;
    right -= 1;

    steps.push(snap({ line: 'step', tag: t('cleared', 'ပြီး'),
      note: selfPair
        ? t(`<b>left</b> moves to ${left} and <b>right</b> to ${right}, which crosses them and ends the loop.`,
            `<b>left</b> ကို ${left} သို့၊ <b>right</b> ကို ${right} သို့ ရွှေ့ရာ နှစ်ခု ဖြတ်ကျော်သွားပြီး loop ပြီးဆုံးသည်။`)
        : compares === 1
          ? t(`Pair settled, so both pointers step inward: <b>left</b> to ${left}, <b>right</b> to ${right}. The two characters fade out because nothing will read them again.`,
              `အတွဲ ပြီးပြီဖြစ်၍ pointer နှစ်ခုလုံး အတွင်းဘက်သို့ တစ်လှမ်း ရွှေ့သည် — <b>left</b> ကို ${left}၊ <b>right</b> ကို ${right}။ ထိုစာလုံးနှစ်လုံးကို ထပ်မဖတ်တော့သဖြင့် မှိန်သွားသည်။`)
          : t(`Pair settled. <b>left</b> to ${left}, <b>right</b> to ${right}.`,
              `အတွဲ ပြီးပြီ။ <b>left</b> ကို ${left}၊ <b>right</b> ကို ${right}။`) }));
  }

  steps.push(snap({ line: 'loop', tag: t('met', 'ဆုံ'),
    note: left === right
      ? t(`<b>left</b> and <b>right</b> have landed on index ${left} together. An odd-length palindrome has exactly one unpaired character in the middle, and a character is always its own mirror, so there is nothing left to do.`,
          `<b>left</b> နှင့် <b>right</b> တို့ index ${left} တွင် အတူ ရောက်နေသည်။ အရှည် မကိန်း palindrome တွင် အလယ်၌ အတွဲမရှိသော စာလုံး တစ်လုံး ရှိပြီး စာလုံးတစ်လုံးသည် သူ့ကိုယ်သူ အမြဲ ပုံရိပ်ဖြစ်သဖြင့် လုပ်စရာ မကျန်တော့ပါ။`)
      : !anyAlnum
        ? t('<b>left</b> has passed <b>right</b>. Not one character was alphanumeric, so there was never anything to compare — and a string with nothing in it reads the same in both directions.',
            '<b>left</b> သည် <b>right</b> ကို ကျော်သွားပြီ။ alphanumeric စာလုံး တစ်လုံးမျှ မရှိသဖြင့် နှိုင်းယှဉ်စရာ ဘယ်တုန်းကမှ မရှိခဲ့ပါ — ဘာမျှမပါသော string သည် နှစ်ဖက်စလုံးမှ အတူတူ ဖတ်ရသည်။')
        : t('<b>left</b> has passed <b>right</b>: every character that mattered has been paired off.',
            '<b>left</b> သည် <b>right</b> ကို ကျော်သွားပြီ — အရေးပါသော စာလုံးတိုင်းကို အတွဲလိုက် စစ်ပြီးပြီ။') }));

  const skips = skipped.length;
  steps.push(snap({ line: 'yes', tag: t('true', 'true'), verdict: true, done: true,
    note: t(`Return <b>true</b>. ${plural(compares, 'comparison')} and ${plural(skips, 'skip')} over ${n} characters — and the only state that ever outlived a step was <b>left</b> and <b>right</b>, which is what makes this <b>O(1)</b> space.`,
            `<b>true</b> ပြန်ပေးသည်။ စာလုံး ${n} လုံးအပေါ် နှိုင်းယှဉ်မှု ${compares} ကြိမ်နှင့် ကျော်ခြင်း ${skips} ကြိမ် — အဆင့်တစ်ခုထက် ကျော်၍ ကျန်ခဲ့သော state မှာ <b>left</b> နှင့် <b>right</b> သာ ဖြစ်ပြီး ထိုအချက်ကြောင့် <b>O(1)</b> space ဖြစ်သည်။`) }));

  return steps;
}

/* ---------------- drawing ----------------
 *
 * The strip card always shows s, with each character's fate on it. The stage
 * holds only what the approach carries between steps: for clean-then-reverse,
 * the two strings it builds; for two pointers, two integers and the pair they
 * point at — deliberately small, because that smallness is the lesson.
 */

function strip(st, input) {
  const chars = [...input.s];
  const tone = {};
  const marks = {};
  if (st.cleaned !== undefined) {
    const settled = st.reversed ? chars.length : (st.i ?? 0);
    for (let i = 0; i < settled; i++) tone[i] = isAlnum(chars[i]) ? 'done' : 'leaving';
    if (st.i != null) { tone[st.i] = isAlnum(chars[st.i]) ? 'entering' : 'leaving'; marks[st.i] = 'ch'; }
    return cells(chars.map(show), { tone, marks });
  }
  for (const i of st.cleared) tone[i] = 'done';
  for (const i of st.skipped) tone[i] = 'leaving';
  if (st.cmpL != null) {
    tone[st.cmpL] = tone[st.cmpR] = st.match ? 'entering' : 'leaving';
  }
  const inRange = (i) => i >= 0 && i < chars.length;
  if (st.left === st.right && inRange(st.left)) marks[st.left] = 'L R';
  else {
    if (inRange(st.left)) { marks[st.left] = 'left'; if (st.cmpL == null && tone[st.left] == null) tone[st.left] = 'inwin'; }
    if (inRange(st.right)) { marks[st.right] = 'right'; if (st.cmpR == null && tone[st.right] == null) tone[st.right] = 'inwin'; }
  }
  return cells(chars.map(show), { tone, marks });
}

function draw(st, input) {
  if (st.cleaned !== undefined) {
    const cleanTone = {};
    const revTone = {};
    if (st.keepAt != null) cleanTone[st.keepAt] = 'entering';
    if (st.diff != null && st.diff >= 0) { cleanTone[st.diff] = revTone[st.diff] = 'leaving'; }
    else if (st.diff === -1) st.cleaned.forEach((_, k) => { cleanTone[k] = revTone[k] = 'entering'; });
    const held = st.cleaned.length + (st.reversed ? st.reversed.length : 0);
    const empty = pick(t('empty', 'ဗလာ'));
    return stagePanel(pick(t('cleaned', 'cleaned')), pick(t(`${held} chars held`, `စာလုံး ${held} လုံး ထားရှိ`)),
      stageRow(cells(st.cleaned.map(show), { tone: cleanTone }), empty))
      + (st.reversed
        ? stagePanel(pick(t('reversed — a second copy', 'reversed — ဒုတိယ copy')), '',
          stageRow(cells(st.reversed.map(show), { tone: revTone }), empty))
        : '');
  }
  const chars = [...input.s];
  const at = (i) => (i >= 0 && i < chars.length ? `'${show(chars[i])}'` : '—');
  return stagePanel(
    pick(t('Two integers — all this approach keeps', 'integer နှစ်ခု — ဤနည်း သိမ်းထားသမျှ')),
    pick(t(`${st.compares} compared`, `${st.compares} ကြိမ် နှိုင်းယှဉ်ပြီး`)),
    readout({ left: st.left, right: st.right })
      + readout(st.cmpL != null
        ? { 's[left]': at(st.cmpL), 's[right]': at(st.cmpR), lowercased: st.match ? '=' : '≠' }
        : { 's[left]': at(st.left), 's[right]': at(st.right) }),
  );
}

function answer(st) {
  return verdictAnswer(st.verdict, {
    yes: t('a palindrome', 'palindrome ဖြစ်သည်'),
    no: t('not a palindrome', 'palindrome မဟုတ်'),
    pending: t('true or false', 'true သို့မဟုတ် false'),
  });
}

function vars(st, input) {
  const chars = [...input.s];
  const q = (x) => `"${x.join('')}"`;
  if (st.cleaned !== undefined) {
    return [
      ['i', st.i ?? '—'],
      ['ch', st.i != null ? `'${chars[st.i]}'` : '—'],
      ['cleaned', q(st.cleaned)],
      ['reversed', st.reversed ? q(st.reversed) : '—'],
    ];
  }
  return [['left', st.left], ['right', st.right]];
}

/* ---------------- the code, one key per line ---------------- */


const CODE = {
  clean: {
    ruby: [
      [null, `${k('def')} is_palindrome(s)`],
      ['init', `  cleaned = ''`],
      ['loop', `  s.each_char ${k('do')} |ch|`],
      ['skip', `    ${k('next')} ${k('unless')} ch =~ /[a-zA-Z0-9]/`],
      ['keep', `    cleaned &lt;&lt; ch.downcase`],
      [null, `  ${k('end')}`],
      ['rev', `  reversed = cleaned.reverse     ${c('# a second full copy')}`],
      ['cmp', `  cleaned == reversed`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} isPalindrome(self, s: str) -&gt; bool:`],
      ['init', `        cleaned = ''`],
      ['loop', `        ${k('for')} ch ${k('in')} s:`],
      ['skip', `            ${k('if')} ${k('not')} ch.isalnum():`],
      [null, `                ${k('continue')}`],
      ['keep', `            cleaned += ch.lower()`],
      ['rev', `        reversed_ = cleaned[::-1]   ${c('# a second full copy')}`],
      ['cmp', `        ${k('return')} cleaned == reversed_`],
    ],
    javascript: [
      [null, `${k('var')} isPalindrome = ${k('function')} (s) {`],
      ['init', `  ${k('let')} cleaned = '';`],
      ['loop', `  ${k('for')} (${k('const')} ch ${k('of')} s) {`],
      ['skip', `    ${k('if')} (!/[a-z0-9]/i.test(ch)) ${k('continue')};`],
      ['keep', `    cleaned += ch.toLowerCase();`],
      [null, `  }`],
      ['rev', `  ${k('const')} reversed = [...cleaned].reverse().join(''); ${c('// a second full copy')}`],
      ['cmp', `  ${k('return')} cleaned === reversed;`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} isPalindrome(s ${k('string')}) ${k('bool')} {`],
      ['init', `    cleaned := []${k('byte')}{}`],
      ['loop', `    ${k('for')} i := 0; i &lt; ${k('len')}(s); i++ {`],
      [null, `        c := s[i]`],
      ['skip', `        ${k('if')} !('a' &lt;= c &amp;&amp; c &lt;= 'z' || 'A' &lt;= c &amp;&amp; c &lt;= 'Z' || '0' &lt;= c &amp;&amp; c &lt;= '9') {`],
      [null, `            ${k('continue')}`],
      [null, `        }`],
      [null, `        ${k('if')} 'A' &lt;= c &amp;&amp; c &lt;= 'Z' {`],
      [null, `            c += 32`],
      [null, `        }`],
      ['keep', `        cleaned = ${k('append')}(cleaned, c)`],
      [null, `    }`],
      ['rev', `    reversed := ${k('make')}([]${k('byte')}, ${k('len')}(cleaned)) ${c('// a second full copy')}`],
      [null, `    ${k('for')} i := ${k('range')} cleaned {`],
      [null, `        reversed[i] = cleaned[${k('len')}(cleaned)-1-i]`],
      [null, `    }`],
      ['cmp', `    ${k('return')} ${k('string')}(cleaned) == ${k('string')}(reversed)`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} is_palindrome(s: String) -&gt; bool {`],
      ['init', `        ${k('let')} ${k('mut')} cleaned: Vec&lt;char&gt; = Vec::new();`],
      ['loop', `        ${k('for')} ch ${k('in')} s.chars() {`],
      ['skip', `            ${k('if')} !ch.is_ascii_alphanumeric() {`],
      [null, `                ${k('continue')};`],
      [null, `            }`],
      ['keep', `            cleaned.push(ch.to_ascii_lowercase());`],
      [null, `        }`],
      ['rev', `        ${k('let')} reversed: Vec&lt;char&gt; = cleaned.iter().rev().copied().collect();`],
      ['cmp', `        cleaned == reversed`],
      [null, `    }`],
      [null, `}`],
    ],
  },
  twopointer: {
    ruby: [
      [null, `${k('def')} is_palindrome(s)`],
      ['init', `  left, right = 0, s.length - 1`],
      ['loop', `  ${k('while')} left &lt; right`],
      ['skipl', `    left += 1 ${k('while')} left &lt; right &amp;&amp; s[left] !~ /[a-zA-Z0-9]/`],
      ['skipr', `    right -= 1 ${k('while')} left &lt; right &amp;&amp; s[right] !~ /[a-zA-Z0-9]/`],
      ['check', `    ${k('if')} s[left].downcase != s[right].downcase`],
      ['no', `      ${k('return')} ${k('false')}`],
      [null, `    ${k('end')}`],
      ['step', `    left += 1`],
      [null, `    right -= 1`],
      [null, `  ${k('end')}`],
      ['yes', `  ${k('true')}`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} isPalindrome(self, s: str) -&gt; bool:`],
      ['init', `        left, right = 0, len(s) - 1`],
      ['loop', `        ${k('while')} left &lt; right:`],
      ['skipl', `            ${k('while')} left &lt; right ${k('and')} ${k('not')} s[left].isalnum():`],
      [null, `                left += 1`],
      ['skipr', `            ${k('while')} left &lt; right ${k('and')} ${k('not')} s[right].isalnum():`],
      [null, `                right -= 1`],
      ['check', `            ${k('if')} s[left].lower() != s[right].lower():`],
      ['no', `                ${k('return')} ${k('False')}`],
      ['step', `            left += 1`],
      [null, `            right -= 1`],
      ['yes', `        ${k('return')} ${k('True')}`],
    ],
    javascript: [
      [null, `${k('var')} isPalindrome = ${k('function')} (s) {`],
      [null, `  ${k('const')} alnum = (c) =&gt; /[a-z0-9]/i.test(c);`],
      ['init', `  ${k('let')} left = 0, right = s.length - 1;`],
      ['loop', `  ${k('while')} (left &lt; right) {`],
      ['skipl', `    ${k('while')} (left &lt; right &amp;&amp; !alnum(s[left])) left++;`],
      ['skipr', `    ${k('while')} (left &lt; right &amp;&amp; !alnum(s[right])) right--;`],
      ['check', `    ${k('if')} (s[left].toLowerCase() !== s[right].toLowerCase()) {`],
      ['no', `      ${k('return')} ${k('false')};`],
      [null, `    }`],
      ['step', `    left++;`],
      [null, `    right--;`],
      [null, `  }`],
      ['yes', `  ${k('return')} ${k('true')};`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} isPalindrome(s ${k('string')}) ${k('bool')} {`],
      [null, `    alnum := ${k('func')}(c ${k('byte')}) ${k('bool')} {`],
      [null, `        ${k('return')} 'a' &lt;= c &amp;&amp; c &lt;= 'z' || 'A' &lt;= c &amp;&amp; c &lt;= 'Z' || '0' &lt;= c &amp;&amp; c &lt;= '9'`],
      [null, `    }`],
      [null, `    lower := ${k('func')}(c ${k('byte')}) ${k('byte')} {`],
      [null, `        ${k('if')} 'A' &lt;= c &amp;&amp; c &lt;= 'Z' {`],
      [null, `            ${k('return')} c + 32`],
      [null, `        }`],
      [null, `        ${k('return')} c`],
      [null, `    }`],
      ['init', `    left, right := 0, ${k('len')}(s)-1`],
      ['loop', `    ${k('for')} left &lt; right {`],
      ['skipl', `        ${k('for')} left &lt; right &amp;&amp; !alnum(s[left]) {`],
      [null, `            left++`],
      [null, `        }`],
      ['skipr', `        ${k('for')} left &lt; right &amp;&amp; !alnum(s[right]) {`],
      [null, `            right--`],
      [null, `        }`],
      ['check', `        ${k('if')} lower(s[left]) != lower(s[right]) {`],
      ['no', `            ${k('return')} ${k('false')}`],
      [null, `        }`],
      ['step', `        left++`],
      [null, `        right--`],
      [null, `    }`],
      ['yes', `    ${k('return')} ${k('true')}`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} is_palindrome(s: String) -&gt; bool {`],
      [null, `        ${k('let')} b = s.as_bytes();`],
      ['init', `        ${k('let')} (${k('mut')} left, ${k('mut')} right) = (0i64, b.len() ${k('as')} i64 - 1);`],
      ['loop', `        ${k('while')} left &lt; right {`],
      ['skipl', `            ${k('while')} left &lt; right &amp;&amp; !b[left ${k('as')} usize].is_ascii_alphanumeric() {`],
      [null, `                left += 1;`],
      [null, `            }`],
      ['skipr', `            ${k('while')} left &lt; right &amp;&amp; !b[right ${k('as')} usize].is_ascii_alphanumeric() {`],
      [null, `                right -= 1;`],
      [null, `            }`],
      ['check', `            ${k('if')} b[left ${k('as')} usize].to_ascii_lowercase() != b[right ${k('as')} usize].to_ascii_lowercase() {`],
      ['no', `                ${k('return')} ${k('false')};`],
      [null, `            }`],
      ['step', `            left += 1;`],
      [null, `            right -= 1;`],
      [null, `        }`],
      ['yes', `        ${k('true')}`],
      [null, `    }`],
      [null, `}`],
    ],
  },
};

/* ---------------- part 1: the "what counts" widget ----------------
 *
 * The statement hinges on one sentence: the palindrome test runs on the string
 * *after* lowercasing and dropping everything that is not a letter or digit.
 * The widget shows that filtered string living inside the original — kept
 * cells lit, dropped cells dashed — and lets the reader drag through the
 * mirrored pairs of what is left.
 *
 * Built from x-sum's widget vocabulary: .q-arr cells (kept / cut), the
 * .q-slider, the amber .q-tie line and the .ledger.
 */

const QW_SETS = [
  { label: t('example 1', 'ဥပမာ 1'), s: 'A man, a plan, a canal: Panama' },
  { label: t('example 2', 'ဥပမာ 2'), s: 'race a car' },
  { label: t('example 3', 'ဥပမာ 3'), s: ' ' },
  { label: t('digits count', 'ဂဏန်းလည်း ပါ'), s: '0P' },
  { label: t('case only', 'အကြီးအသေးသာ'), s: 'No lemon, no melon' },
];

function mountFilterWidget(host) {
  const state = { set: 0, pair: 1 };
  const str = () => [...QW_SETS[state.set].s];

  host.innerHTML = `
    <div class="q-arr" data-arr></div>
    <div class="q-slider">
      <label for="qw-pair" data-lbl></label>
      <input type="range" id="qw-pair" min="1" max="1" value="1">
      <output data-out>1</output>
      <span class="q-presets" data-presets></span>
    </div>
    <p class="q-tie" data-line></p>
    <div class="ledger">
      <span class="expr" data-expr></span>
      <span class="total" data-total></span>
    </div>`;

  const q = (sel) => host.querySelector(sel);

  function render() {
    const s = str();
    const kept = s.map((ch, i) => i).filter((i) => isAlnum(s[i]));
    const m = kept.length;
    const pairs = Math.floor(m / 2);
    const k = Math.min(Math.max(state.pair, 1), Math.max(pairs, 1));
    const a = kept[k - 1];
    const b = kept[m - k];
    const good = kept.slice(0, pairs).filter((i, j) => s[i].toLowerCase() === s[kept[m - 1 - j]].toLowerCase()).length;

    q('[data-lbl]').textContent = pick(t('pair', 'အတွဲ'));
    const slider = q('#qw-pair');
    slider.max = String(Math.max(pairs, 1));
    slider.value = String(k);
    slider.disabled = pairs === 0;
    q('[data-out]').textContent = pairs ? String(k) : '—';
    q('[data-presets]').innerHTML = presetChips(QW_SETS, state.set);

    q('[data-arr]').innerHTML = s.map((ch, i) => {
      const on = pairs && (i === a || i === b);
      return `<div class="cell ${isAlnum(ch) ? 'kept' : 'cut'}${on ? ' picked amber' : ''}"><span>${e(show(ch))}</span><span class="idx">${i}</span></div>`;
    }).join('');

    widgetLabel(pick(t(`${s.length} characters, ${m} count`, `စာလုံး ${s.length} လုံး၊ ${m} လုံး အရေးပါ`)));

    let line;
    if (m === 0) {
      line = t('Nothing here is a letter or a digit, so the filtered string is empty — and an empty string reads the same both ways. true.',
               'ဤနေရာတွင် စာလုံး သို့မဟုတ် ဂဏန်း တစ်ခုမျှ မရှိသဖြင့် filter လုပ်ပြီးသော string ဗလာ ဖြစ်သည် — string ဗလာသည် နှစ်ဖက်စလုံးမှ အတူတူ ဖတ်ရသည်။ true။');
    } else if (pairs === 0) {
      line = t('One character survives the filter, and one character is always its own mirror. true.',
               'filter ကို စာလုံး တစ်လုံးသာ ကျော်နိုင်ပြီး စာလုံး တစ်လုံးသည် သူ့ကိုယ်သူ အမြဲ ပုံရိပ် ဖြစ်သည်။ true။');
    } else {
      const x = s[a], y = s[b], eq = x.toLowerCase() === y.toLowerCase();
      line = eq
        ? t(`Pair ${k}: s[${a}] = '${e(x)}' and s[${b}] = '${e(y)}'. ${x === y ? 'Equal.' : 'Equal once both are lowercased.'} Everything between them that is not lit was never part of the question.`,
            `အတွဲ ${k} — s[${a}] = '${e(x)}' နှင့် s[${b}] = '${e(y)}'။ ${x === y ? 'တူသည်။' : 'နှစ်ခုလုံး အသေးပြောင်းလိုက်လျှင် တူသည်။'} ကြားရှိ မလင်းသော စာလုံးများသည် မေးခွန်း၏ အစိတ်အပိုင်း မဟုတ်ခဲ့ပါ။`)
        : t(`Pair ${k}: s[${a}] = '${e(x)}' against s[${b}] = '${e(y)}'. Different even after lowercasing — that one pair makes the answer false.`,
            `အတွဲ ${k} — s[${a}] = '${e(x)}' နှင့် s[${b}] = '${e(y)}'။ အသေးပြောင်းပြီးသည့်တိုင် မတူပါ — ထိုအတွဲ တစ်ခုတည်းကြောင့် အဖြေ false ဖြစ်သည်။`);
    }
    q('[data-line]').innerHTML = pick(line);

    // the ledger is a formula, as on x-sum: the string the question is really about
    const filtered = kept.map((i) => s[i].toLowerCase()).join('');
    q('[data-expr]').innerHTML = `"${e(filtered)}" ${filtered === [...filtered].reverse().join('') ? '=' : '≠'} "${e([...filtered].reverse().join(''))}"`;
    q('[data-total]').innerHTML = `${good}/${pairs}<small>${pick(t('pairs match', 'အတွဲ ကိုက်'))}</small>`;
  }

  host.addEventListener('input', (ev) => {
    if (ev.target.id !== 'qw-pair') return;
    state.pair = Number(ev.target.value); render();
  });
  host.addEventListener('click', (ev) => {
    const chip = ev.target.closest('[data-set]');
    if (!chip) return;
    state.set = Number(chip.dataset.set);
    state.pair = 1;
    render();
  });
  onLangChange(render);
  render();
}

/* ---------------- the approach, in brief ----------------
 *
 * Shown in part 2 under the approach tabs: the idea, the steps as the code
 * takes them (named after its identifiers), and the cost with its reason. */

const APPROACH = {
  clean: {
    idea: t("Do what the statement says, literally: keep only letters and digits, lowercase them, and compare the result with its reverse.",
        "မေးခွန်းပြောသည့်အတိုင်း တိုက်ရိုက် လုပ်သည် — စာလုံးနှင့် ဂဏန်းများကိုသာ ထား၊ အသေးပြောင်း၊ ပြီးလျှင် ရလဒ်ကို ၎င်း၏ ပြောင်းပြန်နှင့် နှိုင်းယှဉ်သည်။"),
    steps: [
      t("Walk <code>s</code>, appending each letter or digit, lowercased, to <code>cleaned</code>.",
        "<code>s</code> ကို လျှောက်ပြီး စာလုံး သို့မဟုတ် ဂဏန်း တစ်ခုစီကို အသေးပြောင်း၍ <code>cleaned</code> နောက်တွင် ဆက်သည်။"),
      t("Make <code>reversed</code>, a reversed copy of <code>cleaned</code>.",
        "<code>cleaned</code> ၏ ပြောင်းပြန် copy <code>reversed</code> ကို ပြုလုပ်သည်။"),
      t("Return whether they are equal.",
        "နှစ်ခု တူမတူကို ပြန်ပေးသည်။"),
    ],
    cost: t("one pass, but two new strings as long as the input — up to 2 × 10⁵ characters each.",
        "တစ်ကြိမ် ဖြတ်သော်လည်း input အရှည်ရှိ string အသစ် နှစ်ခု — တစ်ခုလျှင် စာလုံး 2 × 10⁵ အထိ။"),
  },
  twopointer: {
    idea: t("Compare from both ends inward, skipping anything that is not a letter or digit where it stands, so nothing is copied.",
        "အစွန်းနှစ်ဖက်မှ အတွင်းသို့ နှိုင်းယှဉ်ပြီး စာလုံး သို့မဟုတ် ဂဏန်း မဟုတ်သည့်အရာကို ရှိရာနေရာတွင်ပင် ကျော်သဖြင့် ဘာမျှ မကူးရပါ။"),
    steps: [
      t("Start with <code>left</code> at 0 and <code>right</code> at the last index.",
        "<code>left</code> ကို 0 တွင်၊ <code>right</code> ကို နောက်ဆုံး index တွင် ထား၍ စသည်။"),
      t("Move <code>left</code> forward past non-alphanumerics, and <code>right</code> backward, each guarded by <code>left &lt; right</code>.",
        "<code>left</code> ကို ရှေ့သို့၊ <code>right</code> ကို နောက်သို့ alphanumeric မဟုတ်သည့်အရာများ ကျော်အောင် ရွှေ့သည် — တစ်ခုစီကို <code>left &lt; right</code> ဖြင့် ကာထားသည်။"),
      t("If the two characters differ, ignoring case, return <code>false</code>.",
        "စာလုံးအကြီးအသေး မခွဲဘဲ စာလုံးနှစ်လုံး မတူလျှင် <code>false</code> ကို ပြန်ပေးသည်။"),
      t("Otherwise step both inward; when they meet, return <code>true</code>.",
        "တူလျှင် နှစ်ခုလုံးကို အတွင်းသို့ တစ်ဆင့် ရွှေ့သည် — ဆုံသည့်အခါ <code>true</code> ကို ပြန်ပေးသည်။"),
    ],
    cost: t("each character is visited at most once, by one pointer or the other, and two indices are kept.",
        "စာလုံးတစ်ခုစီကို pointer တစ်ခုခုက အများဆုံး တစ်ကြိမ်သာ ရောက်ပြီး index နှစ်ခုသာ သိမ်းသည်။"),
  },
};

/* ---------------- mount ----------------
 *
 * Last in the file on purpose: mountLesson runs the widget immediately, so
 * every const the widget reads must already be initialised. */

mountLesson({
  input: { s: 'A man, a plan, a canal: Panama' },
  controls: [
    { key: 's', label: 's', value: 'A man, a plan, a canal: Panama',
      // Capped only so the strip stays readable; the algorithms have no such limit.
      parse: (v) => {
        if (!v.length) throw new Error('needs at least one character');
        return v.slice(0, 48);
      } },
  ],
  presets: [
    { label: exampleTitle(1), input: { s: 'A man, a plan, a canal: Panama' } },
    { label: exampleTitle(2), input: { s: 'race a car' } },
    { label: exampleTitle(3), input: { s: ' ' } },
    { label: t('Digit vs letter', 'ဂဏန်းနှင့် စာလုံး'), input: { s: '0P' } },
    { label: t('Pointers meet', 'pointer ဆုံ'), input: { s: 'ab_a' } },
  ],
  examples: [
    { title: exampleTitle(1), inputHtml: '<code>s = "A man, a plan, a canal: Panama"</code>', output: 'true',
      why: [t('<code>"amanaplanacanalpanama"</code> is a palindrome.',
              '<code>"amanaplanacanalpanama"</code> သည် palindrome ဖြစ်သည်။'),
            t('The spaces, commas and colon are dropped and <code>A</code> / <code>P</code> are lowercased <em>before</em> the comparison — they never get a vote.',
              'space များ၊ comma များနှင့် colon ကို ဖယ်ပြီး <code>A</code> / <code>P</code> ကို နှိုင်းယှဉ်ခြင်း<em>မပြုမီ</em> အသေးပြောင်းသည် — ၎င်းတို့ အဖြေကို မထိခိုက်ပါ။')],
      load: { s: 'A man, a plan, a canal: Panama' } },
    { title: exampleTitle(2), inputHtml: '<code>s = "race a car"</code>', output: 'false',
      why: [t('<code>"raceacar"</code> is not a palindrome.', '<code>"raceacar"</code> သည် palindrome မဟုတ်ပါ။'),
            t('The first pair to disagree is <code>e</code> against <code>a</code>, the fourth pair in from each end — the middle two letters.',
              'ပထမဆုံး မကိုက်သော အတွဲမှာ အစွန်းတစ်ဖက်စီမှ စတုတ္ထ အတွဲ — အလယ်ရှိ စာလုံးနှစ်လုံး — ဖြစ်သော <code>e</code> နှင့် <code>a</code> ဖြစ်သည်။')],
      load: { s: 'race a car' } },
    { title: exampleTitle(3), inputHtml: '<code>s = " "</code>', output: 'true',
      why: [t('<code>s</code> is an empty string <code>""</code> after removing non-alphanumeric characters. Since an empty string reads the same forward and backward, it is a palindrome.',
              'alphanumeric မဟုတ်သော စာလုံးများကို ဖယ်ပြီးနောက် <code>s</code> သည် string ဗလာ <code>""</code> ဖြစ်သွားသည်။ string ဗလာသည် ရှေ့နောက် အတူတူ ဖတ်ရသဖြင့် palindrome ဖြစ်သည်။')],
      load: { s: ' ' } },
  ],
  modes: [
    { id: 'clean', name: 'Clean, then reverse',
      desc: t('Build the filtered string, copy it reversed, compare.', 'filter လုပ်ထားသော string ကို တည်ဆောက်၊ ပြောင်းပြန် ကူးပြီး နှိုင်းယှဉ်သည်။'),
      cost: 'O(n) time · O(n) space', build: buildClean },
    { id: 'twopointer', name: 'Two pointers',
      desc: t('Walk in from both ends, skipping what does not count.', 'အစွန်းနှစ်ဖက်မှ အတွင်းသို့ လျှောက်ပြီး အရေးမပါသည်ကို ကျော်သည်။'),
      cost: 'O(n) time · O(1) space', build: buildTwoPointer },
  ],
  languages: LANGUAGES,
  code: CODE,
  hover: { python: { reversed_: 'reversed' }, go: { c: 'ch' } },
  solutions: {
    clean: { approach: APPROACH.clean, desc: t('The statement, transcribed: filter, lowercase, compare with the reverse. Correct and linear — it just allocates two copies of the input to produce one bit.',
                     'မေးခွန်းကို တိုက်ရိုက် ကူးရေးထားခြင်း — filter လုပ်၊ အသေးပြောင်း၊ ပြောင်းပြန်နှင့် နှိုင်းယှဉ်။ မှန်ပြီး linear ဖြစ်သည် — bit တစ်ခု ထုတ်ရန် input ၏ copy နှစ်ခု ယူရုံသာ။') },
    twopointer: { approach: APPROACH.twopointer, desc: t('The submission worth writing. Skip instead of filter, and give each skip loop its own <code>left &lt; right</code> guard so a string of pure punctuation cannot run a pointer off the end.',
                          'ရေးသင့်သည့် submission ဖြစ်သည်။ filter မလုပ်ဘဲ ကျော်ပါ၊ သင်္ကေတချည်းသာ ပါသော string တွင် pointer အပြင်ထွက်မသွားစေရန် skip loop တစ်ခုစီတွင် <code>left &lt; right</code> စစ်ချက် ထည့်ပါ။') },
  },
  // How each language was actually checked. Printed as a badge on every
  // listing in part 3. The corpus: the 3 examples, 10 hand-picked edges,
  // 12,000 short strings over "aAbB01 .,:!_`", 6,000 noisy palindromes (half
  // perturbed), 2,000 random printable-ASCII strings, and three at 2 × 10⁵ —
  // checked against a separate pointer-peeling reference. Go and Rust ran in
  // Docker (golang:1.23-alpine, rust:1-slim).
  verification: {
    ruby: 'ran here · 20,016 cases vs a reference',
    python: 'ran here · 20,016 cases vs a reference',
    javascript: 'ran here · 20,016 cases vs a reference',
    go: 'ran here · 20,016 cases · Go 1.23',
    rust: 'ran here · 20,016 cases · rustc 1.98',
  },
  strip,
  stripLabel: t('The string s', 'String s'),
  draw,
  answer,
  vars,
  widget: mountFilterWidget,
});
