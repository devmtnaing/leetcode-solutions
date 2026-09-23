/* Move Zeroes — LeetCode 283.
 *
 * The contrast worth seeing: the copy builds the answer somewhere else and then
 * pastes it back, so the array is wrong right up until the final pass. The two
 * pointers keep one invariant true the whole way through — everything left of
 * `slow` is already where it belongs — so the array is partially correct at
 * every single step, and no second array is ever allocated.
 */
import { mountLesson } from '../../lib/stepper.js';
import { cells, panels, stagePanel } from '../../lib/stage.js';
import { pick, onLangChange } from '../../lib/i18n.js';

const t = (en, my) => ({ en, my });

/* ---------------- step generators ---------------- */

function buildCopy({ nums }) {
  const steps = [];
  const n = nums.length;
  const arr = nums.slice();
  const kept = [];

  steps.push({ line: 'init', arr: arr.slice(), kept: [], fast: null, write: null,
    note: t(
      `A second array to collect the non-zero values in the order they appear. That array is the <b>O(n)</b> of extra space this approach spends, and the reason it does not really answer the question asked.`,
      `သုညမဟုတ်သော တန်ဖိုးများကို ၎င်းတို့ ပေါ်လာသည့် အစီအစဉ်အတိုင်း စုဆောင်းရန် ဒုတိယ array တစ်ခု။ ထို array သည် ဤနည်းလမ်း သုံးစွဲသည့် <b>O(n)</b> extra space ဖြစ်ပြီး၊ မေးထားသည့် မေးခွန်းကို အမှန်တကယ် မဖြေနိုင်သည့် အကြောင်းရင်းလည်း ဖြစ်သည်။`),
  });

  for (let fast = 0; fast < n; fast++) {
    const value = arr[fast];
    steps.push({ line: 'loop', arr: arr.slice(), kept: kept.slice(), fast, tag: t('read', 'ဖတ်သည်'),
      note: fast === 0
        ? t(`Reading <b>nums[0] = ${value}</b>. Note that <code>nums</code> stays untouched through this whole pass — the answer is being assembled elsewhere.`,
            `<b>nums[0] = ${value}</b> ကို ဖတ်နေသည်။ ဤအကျော့တစ်ခုလုံးတွင် <code>nums</code> ကို လုံးဝ မထိရသေးကြောင်း သတိပြုပါ — အဖြေကို တခြားနေရာတွင် တည်ဆောက်နေခြင်း ဖြစ်သည်။`)
        : t(`Reading <b>nums[${fast}] = ${value}</b>.`,
            `<b>nums[${fast}] = ${value}</b> ကို ဖတ်နေသည်။`),
    });

    if (value !== 0) {
      kept.push(value);
      steps.push({ line: 'keep', arr: arr.slice(), kept: kept.slice(), fast, keepAt: kept.length - 1, tag: t('keep', 'သိမ်း'),
        note: kept.length === 1
          ? t(`Non-zero, so it is appended to <b>kept</b>. Appending in scan order is the only thing keeping the relative order intact.`,
              `သုည မဟုတ်သဖြင့် <b>kept</b> ထဲသို့ ထည့်လိုက်သည်။ ဖတ်သည့် အစီအစဉ်အတိုင်း ထည့်ခြင်းကသာ relative order ကို ထိန်းသိမ်းထားနိုင်သည်။`)
          : t(`Non-zero: <b>${value}</b> takes position ${kept.length - 1} in <b>kept</b>, behind everything found before it.`,
              `သုည မဟုတ် — <b>${value}</b> သည် <b>kept</b> ထဲတွင် နေရာ ${kept.length - 1} ကို ယူသည်။ ၎င်းမတိုင်မီ တွေ့ခဲ့သော အားလုံး၏ နောက်မှ ဖြစ်သည်။`),
      });
    } else {
      steps.push({ line: 'keep', arr: arr.slice(), kept: kept.slice(), fast, skip: true, tag: t('drop', 'ကျော်'),
        note: t(
          `A zero, so nothing is recorded. Zeroes are interchangeable, so there is no order to preserve among them — only a count, and the length of <b>kept</b> already implies it.`,
          `သုညဖြစ်သဖြင့် ဘာမှ မှတ်မထားပါ။ သုညများသည် တစ်ခုနှင့်တစ်ခု အပြန်အလှန် လဲနိုင်သဖြင့် ၎င်းတို့ကြားတွင် ထိန်းသိမ်းရမည့် အစီအစဉ် မရှိပါ — အရေအတွက်သာ လိုအပ်ပီး <b>kept</b> ၏ အရှည်က ထိုအချက်ကို သွယ်ဝိုက်၍ ဖော်ပြနေပြီးသား ဖြစ်သည်။`),
      });
    }
  }

  while (kept.length < n) {
    kept.push(0);
    steps.push({ line: 'pad', arr: arr.slice(), kept: kept.slice(), padAt: kept.length - 1, tag: t('pad', 'သုညထည့်'),
      note: t(
        `<b>kept</b> is ${n - kept.length + 1} short of the ${n} cells it has to fill, so pad the tail with a zero.`,
        `<b>kept</b> သည် ဖြည့်ရမည့် ${n} cells ထဲမှ ${n - kept.length + 1} လုံး လိုနေသေးသဖြင့် နောက်ဆုံးတွင် သုညထည့်သည်။`),
    });
  }

  for (let i = 0; i < n; i++) {
    arr[i] = kept[i];
    steps.push({ line: 'write', arr: arr.slice(), kept: kept.slice(), write: i, tag: t('write', 'ပြန်ရေး'),
      note: i === 0
        ? t(`<b>nums[0] = ${kept[0]}</b>. Writing back over the original is the only reason this counts as mutating the caller's array rather than handing back a new one.`,
            `<b>nums[0] = ${kept[0]}</b>။ မူရင်း array ပေါ်တွင် ပြန်ရေးခြင်းကြောင့်သာ array အသစ် ပြန်ပေးသည်ဟု မဆိုဘဲ caller ၏ array ကို mutate လုပ်သည်ဟု ဆိုနိုင်ခြင်း ဖြစ်သည်။`)
        : t(`<b>nums[${i}] = ${kept[i]}</b>.`,
            `<b>nums[${i}] = ${kept[i]}</b>။`),
    });
  }

  steps.push({ line: 'done', arr: arr.slice(), kept: kept.slice(), write: n, done: true,
    note: t(
      `Correct, at a cost of <b>${n} writes</b> into <code>nums</code> plus a whole second array — and <code>nums</code> was wrong until the last few steps.`,
      `<code>nums</code> ထဲသို့ ${n} ကြိမ် ရေးသွင်းရပြီး ဒုတိယ array တစ်ခုလုံး ဆောက်ခဲ့ရသည် — <code>nums</code> သည် နောက်ဆုံးအဆင့်များမတိုင်မီအထိ မှားနေခဲ့သည်။`),
  });
  return steps;
}

function buildTwoPointer({ nums }) {
  const steps = [];
  const n = nums.length;
  const arr = nums.slice();
  let slow = 0;
  let swaps = 0;

  steps.push({ line: 'init', arr: arr.slice(), slow: 0, fast: null, swaps,
    note: t(
      `<b>slow = 0</b>. Read it as a boundary rather than an index: everything to the left of <b>slow</b> is finished and will not be touched again.`,
      `<b>slow = 0</b>။ ၎င်းကို index အဖြစ် မဟုတ်ဘဲ boundary (နယ်ခြားမျဉ်း) အဖြစ် ဖတ်ပါ — <b>slow</b> ၏ ဘယ်ဘက်ရှိ အားလုံးသည် ပြီးဆုံးသွားပြီး နောက်ထပ် ထိစရာ မလိုတော့ပါ။`),
  });

  for (let fast = 0; fast < n; fast++) {
    const value = arr[fast];
    steps.push({ line: 'loop', arr: arr.slice(), slow, fast, swaps, tag: t('read', 'ဖတ်သည်'),
      note: fast === 0
        ? t(`<b>fast = 0</b>, value ${value}. <b>fast</b> is the scan: it visits every cell exactly once and never goes back.`,
            `<b>fast = 0</b>၊ တန်ဖိုး ${value}။ <b>fast</b> သည် scan လုပ်သည့် pointer ဖြစ်သည် — cell တိုင်းကို တစ်ကြိမ်တည်း လည်ပတ်ပြီး ဘယ်တော့မှ နောက်ပြန် မသွားပါ။`)
        : t(`<b>fast = ${fast}</b>, value ${value}.`,
            `<b>fast = ${fast}</b>၊ တန်ဖိုး ${value}။`),
    });

    if (value === 0) {
      steps.push({ line: 'test', arr: arr.slice(), slow, fast, skip: true, swaps, tag: t('zero', 'သုည'),
        note: slow === fast
          ? t(`A zero, so the boundary stays at ${slow}. <b>fast</b> moves on alone, and from here the two pointers are apart — the gap between them is the zeroes seen so far.`,
              `သုညဖြစ်သဖြင့် boundary သည် ${slow} တွင် ဆက်ရှိနေသည်။ <b>fast</b> သည် တစ်ကိုယ်တည်း ရှေ့ဆက်သွားပြီး၊ ယခုမှစ၍ pointer နှစ်ခု ကွာသွားသည် — ၎င်းတို့ကြားက ကွာဟချက်သည် ယခုအထိ တွေ့ခဲ့သော သုညများ ဖြစ်သည်။`)
          : t(`A zero, so the boundary stays at ${slow} and the gap widens to ${fast - slow + 1} cells. Those cells are all zeroes, parked where the next non-zero can swap one away.`,
              `သုညဖြစ်သဖြင့် boundary သည် ${slow} တွင် ဆက်ရှိနေပြီး ကွာဟချက်မှာ ${fast - slow + 1} cells အထိ ကျယ်သွားသည်။ ထို cell များ အားလုံးသည် သုညများဖြစ်ပြီး၊ နောက် non-zero တစ်ခုက swap လုပ်၍ တစ်လုံးကို ဖယ်ရှားနိုင်မည့် နေရာတွင် ရပ်ထားခြင်း ဖြစ်သည်။`),
      });
      continue;
    }

    const target = slow;
    const displaced = arr[slow];
    [arr[slow], arr[fast]] = [arr[fast], arr[slow]];
    swaps++;
    steps.push({ line: 'swap', arr: arr.slice(), slow, fast, swapped: [target, fast], swaps, tag: t('swap', 'လဲလှယ်'),
      note: target === fast
        ? t(`${value} sits at the boundary itself, so the swap writes it over itself — no zeroes have been passed yet, so it is already home. The wasted write is what the follow-up asks about.`,
            `${value} သည် boundary ပေါ်တွင်ပင် ရှိနေသဖြင့် swap က ၎င်းကို ၎င်းပေါ်တွင်ပင် ရေးနေခြင်း ဖြစ်သည် — သုညတစ်လုံးမှ မဖြတ်ရသေးသဖြင့် ၎င်းသည် နေရာမှန်၌ပင် ရှိနေသည်။ အလဟဿ ရေးသွင်းခြင်းကို နောက်ဆက်တွဲ မေးခွန်းက မေးထားခြင်း ဖြစ်သည်။`)
        : t(`${value} belongs at index ${target}, so swap it with the ${displaced} sitting there. The displaced zero lands at index ${fast}, inside the gap, which is where zeroes are allowed to be.`,
            `${value} သည် index ${target} တွင် ရှိသင့်သဖြင့် ထိုနေရာတွင် ရှိနေသော ${displaced} သုညနှင့် လဲလှယ်လိုက်သည်။ ဖယ်ထုတ်ခံရသော သုညသည် index ${fast} သို့ ရောက်သွားသည် — ကွာဟချက်အတွင်း၊ သုညများ ရှိခွင့်ရှိသော နေရာ ဖြစ်သည်။`),
    });

    slow++;
    steps.push({ line: 'bump', arr: arr.slice(), slow, fast, justPlaced: target, swaps, tag: t('advance', 'ရွှေ့'),
      note: t(
        `<b>slow = ${slow}</b>. Index ${target} is settled, so the invariant holds again: <code>nums[0..${slow - 1}]</code> is the non-zero values in their original order, and nothing will touch them again.`,
        `<b>slow = ${slow}</b>။ Index ${target} သည် နေရာချပြီးသွားပြီ၊ ထို့ကြောင့် invariant သည် ပြန်မှန်သွားသည် — <code>nums[0..${slow - 1}]</code> သည် non-zero တန်ဖိုးများ ၎င်းတို့၏ မူရင်းအစီအစဉ်အတိုင်း ဖြစ်ပြီး ၎င်းတို့ကို နောက်ထပ် ထိတော့မည် မဟုတ်ပါ။`),
    });
  }

  steps.push({ line: 'done', arr: arr.slice(), slow, fast: n - 1, done: true, swaps,
    note: t(
      `<b>fast</b> ran off the end, so the settled prefix is the whole set of non-zero values and everything after <b>slow</b> is a zero. <b>${swaps}</b> swap${swaps === 1 ? '' : 's'}, no extra array.`,
      `<b>fast</b> သည် အဆုံးထိ ရောက်သွားပြီ၊ ထို့ကြောင့် နေရာချပြီးသော ရှေ့ပိုင်းသည် non-zero တန်ဖိုးများ အားလုံးဖြစ်ပြီး <b>slow</b> ၏ နောက်မှ အားလုံးသည် သုညများ ဖြစ်သည်။ <b>${swaps}</b> ကြိမ် လဲလှယ်ခဲ့ပြီး extra array မရှိပါ။`),
  });
  return steps;
}

/* ---------------- drawing ---------------- */

function strip(s, { nums }) {
  const arr = s.arr;
  const tone = {};
  const marks = {};

  const boundary = s.slow != null ? s.slow : s.write != null ? s.write : 0;
  const head = s.fast != null ? s.fast : s.write != null ? s.write : null;

  for (let i = 0; i < arr.length; i++) {
    if (i < boundary) tone[i] = 'done';                              // settled, never touched again
    else if (head != null && i > head && !s.done) ;                   // default — not yet scanned
  }

  if (s.swapped) {
    tone[s.swapped[0]] = 'entering';
    tone[s.swapped[1]] = 'leaving';
  } else if (s.skip && s.fast != null) {
    tone[s.fast] = 'leaving';
  }

  if (s.slow != null) {
    marks[s.slow] = s.slow === s.fast ? 'slow·fast' : 'slow';
    if (s.fast != null && s.fast !== s.slow) marks[s.fast] = 'fast';
  } else if (s.write != null && s.write < arr.length) {
    marks[s.write] = 'write';
  } else if (s.fast != null) {
    marks[s.fast] = 'fast';
  }

  if (s.done) {
    // all settled cells up
    for (let i = 0; i < arr.length; i++) {
      if (s.slow != null && i < s.slow) tone[i] = 'entering';
      else if (s.kept !== undefined) tone[i] = 'entering';
    }
  }

  return cells(arr, { tone, marks });
}

function draw(s, input) {
  const arr = s.arr || input.nums;
  const n = arr.length;

  if (s.kept !== undefined) {
    // Copy mode: show the extra array in the stage so the reader can watch it grow,
    // which is the O(n) space the problem forbids made visible.
    const kept = s.kept;
    const ktone = {};
    if (s.keepAt != null) ktone[s.keepAt] = 'entering';
    if (s.padAt != null) ktone[s.padAt] = 'leaving';
    if (s.done) for (let i = 0; i < kept.length; i++) ktone[i] = 'entering';

    const label = s.done
      ? t('the answer was built here — now pasted back', 'အဖြေကို ဤနေရာတွင် တည်ဆောက်ခဲ့သည် — ယခု ပြန်ကူးထည့်ပြီး')
      : t('kept — the extra array', 'kept — extra array');

    const items = kept.map((v) => {
      const zer = v === 0;
      return zer ? `<span style="opacity:0.5">0</span>` : String(v);
    });

    // Use an inline cell strip (not the main `cells()` which expects real numbers) so
    // zeros visually fade and non-zeros stand out. We still use the same st-box wrapper.
    const cellsHtml = items.map((v, i) => {
      const T = ktone[i] || '';
      const cls = T ? ` t-${T}` : '';
      return `<div class="st-cell${cls}"><span class="st-val">${v}</span><span class="st-idx">${i}</span></div>`;
    }).join('');

    return stagePanel(
      pick(label),
      pick(t(`${kept.filter((v) => v !== 0).length} non-zero, ${kept.length} total`, `non-zero ${kept.filter((v) => v !== 0).length} လုံး၊ စုစုပေါင်း ${kept.length}`)),
      `<div class="st-box"><div class="st-strip">${cellsHtml || '<span class="st-empty">empty</span>'}</div></div>`,
    );
  }

  // Two-pointer: the three regions. The strip card already shows the array with
  // marks and tones; the stage shows the invariant as named regions — each a
  // mini-row of the cells that belong to it, with a label.
  const slow = s.slow ?? 0;
  const fast = s.fast ?? 0;

  const settled = arr.slice(0, slow);
  const gap = slow <= fast ? arr.slice(slow, fast) : [];
  const unseen = fast < n ? arr.slice(fast + 1) : [];

  const sTone = {};
  settled.forEach((_, i) => { sTone[i] = 'entering'; });
  const gTone = {};
  gap.forEach((_, i) => { gTone[i] = 'leaving'; });

  return panels(
    cells(settled, { tone: sTone, label: t('settled', 'နေရာချပြီး'), index: false }),
    cells(gap, { tone: gTone, label: gap.length ? t(`${gap.length} zero${gap.length === 1 ? '' : 's'}`, `${gap.length} လုံး သုည`) : t('no gap', 'ကွာဟချက် မရှိ'), index: false }),
    cells(unseen.length ? unseen : [], { label: unseen.length ? t(`${unseen.length} to go`, `${unseen.length} ကျန်`) : t('done', 'ပြီး'), index: false }),
  );
}

function answer(s) {
  if (s.done) {
    const arr = s.arr;
    const nz = arr.filter((v) => v !== 0).length;
    return {
      html: `<strong style="color:var(--up);font-size:15px">${nz} non-zeros in front, ${arr.length - nz} zeros at the end</strong>`,
      note: t('done', 'ပြီး'),
    };
  }
  if (s.kept !== undefined) {
    const kept = s.kept;
    const nz = kept.filter((v) => v !== 0).length;
    return {
      html: `<span style="font-size:16px;font-weight:600">${nz} / ${s.arr.length}</span>`,
      note: t('non-zeros collected in extra array', 'extra array ထဲတွင် non-zero များ စုဆောင်းပီး'),
    };
  }
  return {
    html: `<span style="font-size:16px;font-weight:600">${s.slow} / ${s.arr.length}</span>`,
    note: t('non-zero values settled', 'non-zero များ နေရာချပြီး'),
  };
}

function vars(s) {
  if (s.kept !== undefined) {
    return [['fast', s.fast ?? '—'], ['write', s.write != null && s.write < (s.arr || []).length ? s.write : '—'],
            ['kept', `[${s.kept}]`], ['extra cells', s.kept.length]];
  }
  const n = (s.arr || []).length;
  return [['slow', s.slow ?? '—'], ['fast', s.fast ?? '—'],
          ['settled', s.slow != null ? `nums[0..${Math.max(0, s.slow - 1)}]` : '—'],
          ['swaps', s.swaps ?? 0], ['n', n]];
}

/* ---------------- the code, one key per line ---------------- */

const c = (t) => `<span class="c">${t}</span>`;
const k = (t) => `<span class="k">${t}</span>`;

const CODE = {
  copy: {
    ruby: [
      [null, `${k('def')} move_zeroes(nums)`],
      ['init', `  kept = []                          ${c('# the extra O(n)')}`],
      ['loop', `  nums.each ${k('do')} |value|`],
      ['keep', `    kept &lt;&lt; value ${k('unless')} value.zero?`],
      [null, `  ${k('end')}`],
      ['pad', `  kept &lt;&lt; 0 ${k('while')} kept.length &lt; nums.length`],
      ['write', `  nums.each_index { |i| nums[i] = kept[i] }`],
      ['done', `  ${k('nil')}                               ${c('# mutated in place, returns nothing')}`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} moveZeroes(self, nums: List[int]) -&gt; ${k('None')}:`],
      ['init', `        kept = []                      ${c('# the extra O(n)')}`],
      ['loop', `        ${k('for')} value ${k('in')} nums:`],
      ['keep', `            ${k('if')} value != 0: kept.append(value)`],
      ['pad', `        ${k('while')} len(kept) &lt; len(nums): kept.append(0)`],
      ['write', `        ${k('for')} i ${k('in')} range(len(nums)): nums[i] = kept[i]`],
      ['done', `        ${k('return')}                       ${c('# mutated in place')}`],
    ],
    javascript: [
      [null, `${k('const')} moveZeroes = ${k('function')} (nums) {`],
      ['init', `  ${k('const')} kept = [];                     ${c('// the extra O(n)')}`],
      ['loop', `  ${k('for')} (${k('const')} value ${k('of')} nums) {`],
      ['keep', `    ${k('if')} (value !== 0) kept.push(value);`],
      [null, `  }`],
      ['pad', `  ${k('while')} (kept.length &lt; nums.length) kept.push(0);`],
      ['write', `  ${k('for')} (${k('let')} i = 0; i &lt; nums.length; i++) nums[i] = kept[i];`],
      ['done', `  ${k('return')};                            ${c('// mutated in place')}`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} moveZeroes(nums []${k('int')}) {`],
      ['init', `    kept := []${k('int')}{}                     ${c('// the extra O(n)')}`],
      ['loop', `    ${k('for')} _, value := ${k('range')} nums {`],
      ['keep', `        ${k('if')} value != 0 { kept = ${k('append')}(kept, value) }`],
      [null, `    }`],
      ['pad', `    ${k('for')} ${k('len')}(kept) &lt; ${k('len')}(nums) { kept = ${k('append')}(kept, 0) }`],
      ['write', `    ${k('for')} i := ${k('range')} nums { nums[i] = kept[i] }`],
      ['done', `    ${k('return')}                            ${c('// the slice header is shared, so this sticks')}`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} move_zeroes(nums: &amp;${k('mut')} Vec&lt;i32&gt;) {`],
      ['init', `        ${k('let')} ${k('mut')} kept: Vec&lt;i32&gt; = Vec::new();  ${c('// the extra O(n)')}`],
      ['loop', `        ${k('for')} &amp;value ${k('in')} nums.iter() {`],
      ['keep', `            ${k('if')} value != 0 { kept.push(value); }`],
      [null, `        }`],
      ['pad', `        ${k('while')} kept.len() &lt; nums.len() { kept.push(0); }`],
      ['write', `        ${k('for')} i ${k('in')} 0..nums.len() { nums[i] = kept[i]; }`],
      ['done', `    }                                  ${c('// mutated through the &amp;mut')}`],
      [null, `}`],
    ],
  },
  twopointer: {
    ruby: [
      [null, `${k('def')} move_zeroes(nums)`],
      ['init', `  slow = 0                           ${c('# nums[0...slow] is finished')}`],
      ['loop', `  (0...nums.length).each ${k('do')} |fast|`],
      ['test', `    ${k('next')} ${k('if')} nums[fast].zero?`],
      ['swap', `    nums[slow], nums[fast] = nums[fast], nums[slow]`],
      ['bump', `    slow += 1`],
      [null, `  ${k('end')}`],
      ['done', `  ${k('nil')}`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} moveZeroes(self, nums: List[int]) -&gt; ${k('None')}:`],
      ['init', `        slow = 0                       ${c('# nums[:slow] is finished')}`],
      ['loop', `        ${k('for')} fast ${k('in')} range(len(nums)):`],
      ['test', `            ${k('if')} nums[fast] == 0: ${k('continue')}`],
      ['swap', `            nums[slow], nums[fast] = nums[fast], nums[slow]`],
      ['bump', `            slow += 1`],
      ['done', `        ${k('return')}`],
    ],
    javascript: [
      [null, `${k('const')} moveZeroes = ${k('function')} (nums) {`],
      ['init', `  ${k('let')} slow = 0;                       ${c('// nums[0..slow-1] is finished')}`],
      ['loop', `  ${k('for')} (${k('let')} fast = 0; fast &lt; nums.length; fast++) {`],
      ['test', `    ${k('if')} (nums[fast] === 0) ${k('continue')};`],
      ['swap', `    [nums[slow], nums[fast]] = [nums[fast], nums[slow]];`],
      ['bump', `    slow++;`],
      [null, `  }`],
      ['done', `  ${k('return')};`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} moveZeroes(nums []${k('int')}) {`],
      ['init', `    slow := 0                          ${c('// nums[:slow] is finished')}`],
      ['loop', `    ${k('for')} fast := 0; fast &lt; ${k('len')}(nums); fast++ {`],
      ['test', `        ${k('if')} nums[fast] == 0 { ${k('continue')} }`],
      ['swap', `        nums[slow], nums[fast] = nums[fast], nums[slow]`],
      ['bump', `        slow++`],
      [null, `    }`],
      ['done', `    ${k('return')}`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} move_zeroes(nums: &amp;${k('mut')} Vec&lt;i32&gt;) {`],
      ['init', `        ${k('let')} ${k('mut')} slow = 0;               ${c('// nums[..slow] is finished')}`],
      ['loop', `        ${k('for')} fast ${k('in')} 0..nums.len() {`],
      ['test', `            ${k('if')} nums[fast] == 0 { ${k('continue')}; }`],
      ['swap', `            nums.swap(slow, fast);`],
      ['bump', `            slow += 1;`],
      [null, `        }`],
      ['done', `    }`],
      [null, `}`],
    ],
  },
};

/* ---------------- part 1: the sweep widget ----------------
 *
 * The statement hinges on one fact: non-zero elements must keep their relative
 * order, while zeroes are interchangeable and can pile anywhere at the end.
 *
 * Built from x-sum's widget vocabulary: the .q-arr cells (kept / cut), the
 * .q-slider, the amber .q-tie line and the .ledger — so it reads as the same
 * kind of object as x-sum's "Drag x, watch what survives".
 */

const Q_SETS = [
  { label: t('Example 1', 'ဥပမာ ၁'), nums: [0, 1, 0, 3, 12] },
  { label: t('Example 2', 'ဥပမာ ၂'), nums: [0] },
  { label: t('All zeros', 'သုညချည်း'), nums: [0, 0, 0, 0, 0] },
  { label: t('No zeros', 'သုည မရှိ'), nums: [1, 2, 3, 4, 5] },
];

function mountWidget(host) {
  const state = { set: 0, pos: 0 };
  const nums = () => Q_SETS[state.set].nums;

  host.innerHTML = `
    <div class="q-arr" data-arr></div>
    <div class="q-slider">
      <label for="mw-sweep">position</label>
      <input type="range" id="mw-sweep" min="0" max="${nums().length - 1}" value="0">
      <output data-out>0</output>
      <span class="q-presets" data-presets></span>
    </div>
    <p class="q-tie" data-line></p>
    <div class="ledger">
      <span class="expr" data-expr></span>
      <span class="total" data-total></span>
    </div>`;

  const qw = (s) => host.querySelector(s);

  function render() {
    const a = nums();
    const p = Math.min(state.pos, a.length - 1);
    qw('#mw-sweep').max = String(a.length - 1);
    qw('#mw-sweep').value = String(p);
    qw('[data-out]').textContent = String(p);
    qw('[data-presets]').innerHTML = Q_SETS.map((s, i) =>
      `<button class="chip" data-set="${i}"${i === state.set ? ' aria-pressed="true"' : ''}>${pick(s.label)}</button>`).join('');

    // cells: non-zero left of or at position → kept; zero left of or at position → cut; right of position → default
    qw('[data-arr]').innerHTML = a.map((v, i) => {
      let cls = '';
      if (i <= p) cls = v !== 0 ? 'kept' : 'cut';
      if (i === p) cls += ' inwin';
      return `<div class="cell ${cls}" role="button" tabindex="0" aria-pressed="${i === p}"
                   data-i="${i}"${i === p ? ' style="outline:2px solid var(--accent);outline-offset:2px"' : ''}>
        <span>${v}</span><span class="idx">${i}</span></div>`;
    }).join('');

    const label = document.getElementById('q-label');
    if (label) label.textContent = pick(t(`${a.length} values`, `တန်ဖိုး ${a.length} ခု`));

    const v = a[p];
    const kept = a.filter((x, i) => x !== 0 && i <= p);
    const zeroCount = a.filter((x, i) => x === 0 && i <= p).length;

    qw('[data-line]').innerHTML = pick(v !== 0
      ? t(`nums[${p}] = ${v} — a non-zero. It keeps its place among the ${kept.length} values that survive, in the exact order they first appeared.`,
          `nums[${p}] = ${v} — သုည မဟုတ်။ ၎င်းသည် ${kept.length} လုံးသော ကျန်ရစ်သည့် တန်ဖိုးများကြားတွင် ၎င်းတို့ ပေါ်လာခဲ့သည့် အစီအစဉ်အတိုင်း နေရာယူသည်။`)
      : t(`nums[${p}] = 0 — a zero. It is interchangeable with every other zero, so there is no order to preserve. These ${zeroCount} zero${zeroCount === 1 ? '' : 's'} will park at the end.`,
          `nums[${p}] = 0 — သုည။ အခြားသော သုညများနှင့် ဘယ်လိုမဆို လဲလှယ်နိုင်သဖြင့် ထိန်းသိမ်းရမည့် အစီအစဉ် မရှိပါ။ ဤသုည ${zeroCount} လုံးသည် အဆုံးတွင် ရပ်ပါလိမ့်မည်။`));

    qw('[data-expr]').innerHTML = kept.length
      ? kept.join(' &nbsp;·&nbsp; ')
      : pick(t('(no non-zeros yet)', '((non-zero) မရှိသေး)'));
    qw('[data-total]').innerHTML = `${kept.length}<small>${pick(t('kept — in order', 'အစီအစဉ်အတိုင်း ကျန်ရစ်'))}</small>`;
  }

  host.addEventListener('input', (e) => {
    if (e.target.id !== 'mw-sweep') return;
    state.pos = Number(e.target.value);
    render();
  });
  host.addEventListener('click', (e) => {
    const chip = e.target.closest('[data-set]');
    if (chip) {
      state.set = Number(chip.dataset.set);
      state.pos = 0;
      return render();
    }
    const cell = e.target.closest('[data-i]');
    if (cell) {
      state.pos = Number(cell.dataset.i);
      qw('#mw-sweep').value = String(state.pos);
      qw('[data-out]').textContent = String(state.pos);
      render();
    }
  });
  host.addEventListener('keydown', (e) => {
    const cell = e.target.closest('[data-i]');
    if (cell && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      state.pos = Number(cell.dataset.i);
      qw('#mw-sweep').value = String(state.pos);
      qw('[data-out]').textContent = String(state.pos);
      render();
    }
  });
  onLangChange(render);
  render();
}

/* ---------------- mount ----------------
 *
 * Last in the file on purpose: mountLesson runs the widget immediately, so
 * every const the widget reads must already be initialised. */

const parseNums = (v) => {
  const a = v.split(',').map((x) => Number(x.trim()));
  if (!a.length || a.some(Number.isNaN)) throw new Error('need at least one number');
  return a.slice(0, 12);
};

mountLesson({
  input: { nums: [0, 1, 0, 3, 12] },
  controls: [
    { key: 'nums', label: 'nums', value: '0, 1, 0, 3, 12', parse: parseNums },
  ],
  presets: [
    { label: t('Example 1', 'ဥပမာ ၁'), input: { nums: [0, 1, 0, 3, 12] } },
    { label: t('Example 2', 'ဥပမာ ၂'), input: { nums: [0] } },
    { label: t('All zeros', 'သုညချည်း'), input: { nums: [0, 0, 0, 0, 0] } },
    { label: t('No zeros', 'သုည မရှိ'), input: { nums: [1, 2, 3, 4, 5] } },
  ],
  examples: [
    { title: t('Example 1', 'ဥပမာ ၁'),
      inputHtml: '<code>nums = [0,1,0,3,12]</code>', output: '[1,3,12,0,0]',
      why: [t(
        'All non-zeros — 1, 3, and 12 — keep their relative order in the front. The zeros fill in afterwards, any way they like.',
        'Non-zero အားလုံး — 1, 3, နှင့် 12 — တို့သည် ၎င်းတို့၏ မူရင်း အစီအစဉ်အတိုင်း ရှေ့တွင် ရှိနေသည်။ သုညများက နောက်မှ လိုက်လာပြီး ၎င်းတို့အချင်းချင်း မည်သည့် အစီအစဉ်ဖြင့်မဆို ရှိနိုင်သည်။')],
      load: { nums: [0, 1, 0, 3, 12] } },
    { title: t('Example 2', 'ဥပမာ ၂'),
      inputHtml: '<code>nums = [0]</code>', output: '[0]',
      why: [t(
        'A single zero — nothing to move, nothing to preserve. The array is already the answer.',
        'သုညတစ်လုံးတည်း — ရွှေ့စရာ မရှိ၊ ထိန်းသိမ်းစရာ မရှိ။ Array သည် မူလအတိုင်းပင် အဖြေ ဖြစ်သည်။')],
      load: { nums: [0] } },
  ],
  modes: [
    { id: 'copy',
      name: t('Copy out and back', 'ကူးထုတ်၍ ပြန်ထည့်'),
      desc: t('Collect non-zeros, pad, write back — right answer from the wrong array.',
               'Non-zero များကို စုဆောင်း၊ သုညများ ဖြည့်၊ ပြန်ရေး — မှားသော array မှ မှန်သော အဖြေ။'),
      cost: 'O(n) time · O(n) space', build: buildCopy },
    { id: 'twopointer',
      name: t('Two pointers', 'Pointer နှစ်ခု'),
      desc: t('One boundary, one scanner — swap across it and the invariant holds after every step.',
               'နယ်ခြားမျဉ်း တစ်ခုနှင့် scanner တစ်ခု — လဲလှယ်လိုက်တိုင်း invariant က မှန်နေသည်။'),
      cost: 'O(n) time · O(1) space', build: buildTwoPointer },
  ],
  languages: [
    { id: 'ruby', name: 'Ruby' }, { id: 'python', name: 'Python' },
    { id: 'javascript', name: 'JavaScript' }, { id: 'go', name: 'Go' }, { id: 'rust', name: 'Rust' },
  ],
  code: CODE,
  solutions: {
    copy: { desc: t(
      'Collect every non-zero value in a second array, pad with zeros, then write it back. Returns the right answer but spends the <code>O(n)</code> memory the problem asked you not to.',
      'Non-zero တန်ဖိုးတိုင်းကို ဒုတိယ array တစ်ခုထဲ စုဆောင်း၊ သုညများ ဖြည့်၊ ပြီးမှ ပြန်ရေးသည်။ အဖြေ မှန်သော်လည်း မေးခွန်းက မသုံးရန် တောင်းဆိုထားသည့် <code>O(n)</code> memory ကို သုံးထားသည်။') },
    twopointer: { desc: t(
      'The submission worth writing. <code>slow</code> is a boundary, not an index — everything to its left is correct and never touched again. Swap a non-zero value down to <code>slow</code> and advance both pointers.',
      'ရေးသင့်သည့် submission ဖြစ်သည်။ <code>slow</code> သည် index မဟုတ်ဘဲ boundary ဖြစ်သည် — ၎င်း၏ ဘယ်ဘက်ရှိ အားလုံးသည် မှန်ကန်ပြီး နောက်ထပ် ထိတော့မည် မဟုတ်။ Non-zero တစ်လုံးကို <code>slow</code> သို့ swap ချပြီး pointer နှစ်ခုလုံး ရှေ့သို့ တိုးသည်။') },
  },
  // How each language was actually checked, printed as the part 3 badges.
  // The corpus: 5 edges, 15,000 short arrays heavy in zeros, 5,000 up to 80 values over the full 32-bit range, two at n = 10⁴ — against filter-and-append.
  // Go and Rust ran in Docker (golang:1.23-alpine, rust:1-slim).
  verification: {
    ruby: 'ran here · 20,007 cases',
    python: 'ran here · 20,007 cases',
    javascript: 'ran here · 20,007 cases',
    go: 'ran here · 20,007 cases · Go 1.23',
    rust: 'ran here · 20,007 cases · rustc 1.98',
  },
  strip,
  draw,
  answer,
  vars,
  widget: mountWidget,
});