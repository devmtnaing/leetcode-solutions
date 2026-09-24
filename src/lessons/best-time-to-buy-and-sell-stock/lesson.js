/* Best Time to Buy and Sell Stock — LeetCode 121.
 *
 * The contrast worth seeing: the brute force asks "what would this pair of days
 * have earned?" once per pair, while the one-pass asks "if I sold today, what is
 * the most I could have paid?" once per day. The second question has an answer
 * you already hold — the cheapest price so far — so nothing to the left has to
 * be looked at again.
 *
 * Part 1's widget lets the reader drag a buy day and a sell day. It exists to
 * make one thing physical before the walkthrough starts — the sell has to come
 * after the buy, which is the whole reason the answer is not
 * max(prices) - min(prices).
 */
import { t, plural, exampleTitle, LANGUAGES, k, c } from '../../lib/kit.js';
import { mountLesson } from '../../lib/stepper.js';
import { bars, cells, slots, stagePanel } from '../../lib/stage.js';
import { pick, onLangChange } from '../../lib/i18n.js';

/* A bilingual string: the { en, my } pair pick() reads at render time. */

/* Labels that appear in more than one place, so they only get translated once. */
const L = {
  prices: t('prices', 'ဈေးနှုန်းများ'),
  buy: t('buy', 'ဝယ်'),
  sell: t('sell', 'ရောင်း'),
  today: t('today', 'ယနေ့'),
  day: t('day', 'နေ့'),
};

/* ---------------- step generators ---------------- */

function buildBrute({ prices }) {
  const steps = [];
  const n = prices.length;
  const pairs = (n * (n - 1)) / 2;
  const plural = n === 1 ? '' : 's';
  const pairPlural = pairs === 1 ? '' : 's';
  let best = 0;
  let bestPair = null;

  steps.push({ line: 'init', buy: null, sell: null, best, bestPair,
    note: t(
      `Price out every buy/sell pair and keep the richest. With ${n} day${plural}
       that is ${pairs} pair${pairPlural}.`,
      `ဝယ်/ရောင်း နေ့တွဲ အားလုံးကို တွက်ပြီး အမြတ်အများဆုံးကို မှတ်ထားမည်။ ${n} ရက်ဆိုလျှင်
       နေ့တွဲ ${pairs} တွဲ ရှိသည်।`) });

  for (let buy = 0; buy < n; buy++) {
    steps.push({ line: 'outer', buy, sell: null, best, bestPair, tag: L.buy,
      note: t(
        `Suppose the buy is day <b>${buy}</b> at <b>${prices[buy]}</b>. Only later days can be
         the sell, which is the only thing keeping this from being ${n * n} pairs.`,
        `နေ့ <b>${buy}</b> ၊ ဈေး <b>${prices[buy]}</b> မှာ ဝယ်သည် ဆိုပါစို့။ နောက်ကျသော နေ့များကိုသာ
         ရောင်းလို့ ရသည်။ ထိုကန့်သတ်ချက်ကြောင့်သာ နေ့တွဲ ${n * n} တွဲ မဖြစ်ဘဲ ရှိနေခြင်း ဖြစ်သည်။`) });

    for (let sell = buy + 1; sell < n; sell++) {
      const gain = prices[sell] - prices[buy];
      const beats = gain > best;
      steps.push({ line: 'gain', buy, sell, gain, best, bestPair, miss: !beats,
        tag: beats ? L.sell : t('no', 'မရ'),
        note: beats
          ? t(
              `Sell on day ${sell} at ${prices[sell]}: <b>${prices[sell]} - ${prices[buy]} = ${gain}</b>.`,
              `နေ့ ${sell} ၊ ဈေး ${prices[sell]} မှာ ရောင်း — <b>${prices[sell]} - ${prices[buy]} = ${gain}</b>။`)
          : t(
              `Sell on day ${sell} at ${prices[sell]} and the trade is worth ${gain}${gain < 0 ? ', a loss' : ''}
               — no better than the ${best} already on record.`,
              `နေ့ ${sell} ၊ ဈေး ${prices[sell]} မှာ ရောင်းလျှင် ${gain} ရမည်${gain < 0 ? ' — အရှုံးပါ' : ''}။
               လက်ရှိ မှတ်ထားပြီးသား ${best} ထက် မသာပါ။`) });

      if (beats) {
        best = gain;
        bestPair = [buy, sell];
        steps.push({ line: 'best', buy, sell, gain, best, bestPair, tag: t('best', 'အကောင်းဆုံး'),
          note: t(
            `New leader: buy day ${buy}, sell day ${sell}, <b>${gain}</b> in profit. Nothing is
             settled — every remaining pair still has to be priced.`,
            `ရှေ့ရောက်သွားပြီ — နေ့ ${buy} ဝယ်၊ နေ့ ${sell} ရောင်း၊ အမြတ် <b>${gain}</b>။ သေချာသွားသည်
             မဟုတ်သေး — ကျန်သော နေ့တွဲတိုင်းကို ဆက်တွက်ရဦးမည်။`) });
      }
    }
  }

  steps.push({ line: 'ret', buy: null, sell: null, best, bestPair, gain: null, tag: t('done', 'ပြီး'),
    note: bestPair
      ? t(
          `Every pair priced. The best was buy day ${bestPair[0]}, sell day ${bestPair[1]}, for <b>${best}</b>.`,
          `နေ့တွဲ အားလုံး တွက်ပြီးပြီ။ အကောင်းဆုံးမှာ နေ့ ${bestPair[0]} ဝယ်၊ နေ့ ${bestPair[1]} ရောင်း၊
           အမြတ် <b>${best}</b> ဖြစ်သည်။`)
      : t(
          `Every pair priced and not one of them made money, so the answer is <b>0</b>: take no trade at all.`,
          `နေ့တွဲ အားလုံး တွက်ပြီးပြီ၊ တစ်တွဲမှ အမြတ် မရပါ။ ထို့ကြောင့် အဖြေမှာ <b>0</b> —
           ဘာမှ မဝယ်၊ မရောင်းဘဲ နေလိုက်ခြင်းပင်။`) });
  return steps;
}

function buildOnePass({ prices }) {
  const steps = [];
  const n = prices.length;
  let best = 0;
  let cheapest = Infinity;
  let minIdx = null;
  let bestPair = null;

  steps.push({ line: 'init', day: null, cheapest, minIdx, best, bestPair,
    note: t(
      `Two numbers carry the whole walk: the cheapest price seen so far, and the best profit
       anything has made against it. Starting the cheapest at infinity means day 0 undercuts it
       without a special case.`,
      `ဂဏန်းနှစ်လုံးတည်းနှင့် အဆုံးထိ လျှောက်နိုင်သည် — ယခုအထိ တွေ့ခဲ့သော ဈေးအသက်သာဆုံး၊ နှင့်
       ၎င်းနှင့် တွဲ၍ ရခဲ့သော အမြတ်အများဆုံး။ ဈေးအသက်သာဆုံးကို infinity ဖြင့် စထားလျှင် နေ့ 0 က
       အလိုအလျောက် အောက်ရောက်သွားပြီး သီးသန့် စစ်ဆေးစရာ မလိုတော့ပါ။`) });

  for (let day = 0; day < n; day++) {
    const price = prices[day];
    steps.push({ line: 'loop', day, price, cheapest, minIdx, best, bestPair, tag: L.day,
      note: t(
        `Day ${day}, price <b>${price}</b>.`,
        `နေ့ ${day}၊ ဈေး <b>${price}</b>။`) });

    const cheaper = price < cheapest;
    steps.push({ line: 'cheaper', day, price, cheapest, minIdx, best, bestPair,
      tag: t('cheaper?', 'သက်သာလား?'),
      note: minIdx === null
        ? t(
            `Nothing has been seen yet, so this is the cheapest day by default.`,
            `ယခင်က ဘာမှ မတွေ့ရသေးသဖြင့် ဤနေ့သည် အလိုအလျောက် ဈေးအသက်သာဆုံး နေ့ ဖြစ်သည်။`)
        : cheaper
          ? t(
              `${price} undercuts the ${cheapest} from day ${minIdx}. Every future sale would rather
               have been bought here.`,
              `${price} သည် နေ့ ${minIdx} ၏ ${cheapest} ထက် သက်သာသည်။ နောင် ရောင်းမည့် အရောင်းတိုင်းအတွက်
               ဤနေ့မှာ ဝယ်ထားခြင်းက ပိုတန်သည်။`)
          : t(
              `${price} is not below the ${cheapest} from day ${minIdx}, so the buy day stands. That
               makes today a day to consider selling on.`,
              `${price} သည် နေ့ ${minIdx} ၏ ${cheapest} အောက် မရောက်သဖြင့် ဝယ်မည့်နေ့ အတူတူပင်။
               ထို့ကြောင့် ယနေ့သည် ရောင်းရန် စဉ်းစားထိုက်သည့် နေ့ ဖြစ်လာသည်။`) });

    if (cheaper) {
      cheapest = price;
      minIdx = day;
      steps.push({ line: 'setmin', day, price, cheapest, minIdx, best, bestPair, tag: L.buy,
        note: t(
          `Day ${day} becomes the buy day. Note what is <em>not</em> happening: the earlier,
           dearer days are never consulted again, because no later sale would prefer one of them.`,
          `နေ့ ${day} သည် ဝယ်မည့်နေ့ ဖြစ်သွားသည်။ <em>မလုပ်ဘဲ ကျန်ခဲ့သော</em> အရာကို သတိပြုပါ —
           ယခင် ဈေးကြီးသော နေ့များကို နောက်ထပ် ပြန်မကြည့်တော့ပါ။ နောင်လာမည့် အရောင်းတစ်ခုမှ
           ထိုနေ့များကို ရွေးမည် မဟုတ်သောကြောင့် ဖြစ်သည်။`) });
    } else {
      const gain = price - cheapest;
      const beats = gain > best;
      steps.push({ line: 'gain', day, price, gain, cheapest, minIdx, best, bestPair, miss: !beats,
        tag: beats ? L.sell : t('no', 'မရ'),
        note: t(
          `Sell today against the day-${minIdx} low: <b>${price} - ${cheapest} = ${gain}</b>${beats ? '.' : `, which does not beat the ${best} already banked.`}`,
          `နေ့ ${minIdx} ၏ ဈေးအနိမ့်ဆုံးနှင့် တွဲ၍ ယနေ့ ရောင်းကြည့်ပါ — <b>${price} - ${cheapest} = ${gain}</b>${beats ? '။' : ` — သိမ်းထားပြီးသား ${best} ကို မကျော်ပါ။`}`) });
      if (beats) {
        best = gain;
        bestPair = [minIdx, day];
        steps.push({ line: 'best', day, price, gain, cheapest, minIdx, best, bestPair,
          tag: t('best', 'အကောင်းဆုံး'),
          note: t(
            `<b>${gain}</b> is the new best. Buying at the cheapest price to date is the best
             any sale on day ${day} could have done, so this one number settles the whole day.`,
            `<b>${gain}</b> သည် အမြတ်အသစ် အများဆုံး ဖြစ်သည်။ ယခုအထိ ဈေးအသက်သာဆုံးမှာ ဝယ်ထားခြင်းသည်
             နေ့ ${day} တွင် ရောင်းသည့် အရောင်းအတွက် အကောင်းဆုံး ဖြစ်သဖြင့်၊ ဤဂဏန်းတစ်လုံးတည်းက
             တစ်နေ့လုံးအတွက် အဖြေ ဖြစ်သွားသည်။`) });
      }
    }
  }

  const pairs = (n * (n - 1)) / 2;
  steps.push({ line: 'ret', day: null, price: null, gain: null, cheapest, minIdx, best, bestPair,
    tag: t('done', 'ပြီး'),
    note: bestPair
      ? t(
          `One walk, ${n} day${n === 1 ? '' : 's'}, same answer as the ${pairs}-pair
           search: buy day ${bestPair[0]}, sell day ${bestPair[1]}, <b>${best}</b>.`,
          `တစ်ခေါက်တည်း လျှောက်၊ ${n} ရက်၊ နေ့တွဲ ${pairs} တွဲ ရှာသည့် နည်းနှင့် အဖြေ အတူတူ —
           နေ့ ${bestPair[0]} ဝယ်၊ နေ့ ${bestPair[1]} ရောင်း၊ <b>${best}</b>။`)
      : t(
          `The price never rose above a cheaper earlier day, so no trade was worth taking. Return <b>0</b>.`,
          `ဈေးသည် ယခင်က သက်သာခဲ့သော နေ့တစ်ခု၏ အထက်သို့ တစ်ခါမှ မတက်ခဲ့သဖြင့် ယူထိုက်သော
           အရောင်းအဝယ် မရှိပါ။ <b>0</b> ကို ပြန်ပေးသည်။`) });
  return steps;
}

/* ---------------- drawing ---------------- */

function draw(s, input) {
  const { prices } = input;
  const marks = {};
  const tone = {};

  // The trade currently in the lead, drawn green on both ends.
  if (s.bestPair) {
    tone[s.bestPair[0]] = 'up';
    tone[s.bestPair[1]] = 'up';
    marks[s.bestPair[0]] = '★';
    marks[s.bestPair[1]] = '★';
  }

  if (s.minIdx != null) marks[s.minIdx] = 'min';
  if (s.buy != null) marks[s.buy] = pick(L.buy);
  if (s.sell != null) marks[s.sell] = pick(L.sell);
  if (s.day != null) marks[s.day] = s.minIdx === s.day ? `min · ${pick(L.today)}` : pick(L.today);

  // A sale that loses money is worth showing as a loss.
  const here = s.sell != null ? s.sell : s.day;
  if (s.miss && s.gain < 0 && here != null && !(s.bestPair && s.bestPair.includes(here))) {
    tone[here] = 'down';
  }

  const at = s.sell != null ? s.sell : s.buy != null ? s.buy : s.day;
  return bars(prices, { at: at ?? null, marks, tone, label: pick(L.prices) });
}

function vars(s) {
  if (s.cheapest !== undefined) {
    return [['day', s.day ?? '—'], ['price', s.price ?? '—'],
            ['cheapest', s.cheapest === Infinity ? '∞' : s.cheapest],
            ['gain', s.gain ?? '—'], ['best', s.best]];
  }
  return [['buy', s.buy ?? '—'], ['sell', s.sell ?? '—'], ['gain', s.gain ?? '—'],
          ['best', s.best], ['trade', s.bestPair ? `${s.bestPair[0]} → ${s.bestPair[1]}` : '—']];
}

/* ---------------- strip & answer ---------------- */

function strip(s, { prices }) {
  const tone = {};
  const marks = {};
  if (s.bestPair) {
    tone[s.bestPair[0]] = 'up';
    tone[s.bestPair[1]] = 'up';
    marks[s.bestPair[0]] = '★';
    marks[s.bestPair[1]] = '★';
  }
  if (s.buy != null) { tone[s.buy] = 'inwin'; marks[s.buy] = pick(L.buy); }
  if (s.sell != null) { tone[s.sell] = s.miss && s.gain < 0 ? 'leaving' : 'inwin'; marks[s.sell] = pick(L.sell); }
  if (s.day != null) {
    const isMin = s.minIdx === s.day;
    tone[s.day] = 'inwin';
    marks[s.day] = isMin ? `min · ${pick(L.today)}` : pick(L.today);
  }
  return cells(prices, { tone, marks });
}

function answer(s) {
  if (s.bestPair) {
    return { html: slots(s.bestPair, { total: 2, just: 1 }),
      note: t(`best trade — day ${s.bestPair[0]} → day ${s.bestPair[1]}`, `အကောင်းဆုံး — နေ့ ${s.bestPair[0]} → နေ့ ${s.bestPair[1]}`) };
  }
  if (s.best === 0 && s.bestPair === null) {
    return { html: `<span class="answer-num muted">0</span>`,
      note: t('no profitable trade', 'အမြတ်ရသော အရောင်းအဝယ် မရှိ') };
  }
  return { html: `<span class="answer-num muted">${s.best}</span>`,
    note: t('best so far', 'ယခုအထိ အကောင်းဆုံး') };
}

/* ---------------- the code, one key per line ---------------- */


const CODE = {
  brute: {
    ruby: [
      [null, `${k('def')} max_profit(prices)`],
      ['init', `  best = 0`],
      ['outer', `  (0...prices.length).each ${k('do')} |buy|`],
      [null, `    (buy + 1...prices.length).each ${k('do')} |sell|`],
      ['gain', `      gain = prices[sell] - prices[buy]`],
      ['best', `      best = gain ${k('if')} gain &gt; best`],
      [null, `    ${k('end')}`],
      [null, `  ${k('end')}`],
      ['ret', `  best`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} maxProfit(self, prices):`],
      ['init', `        best = 0`],
      ['outer', `        ${k('for')} buy ${k('in')} range(len(prices)):`],
      [null, `            ${k('for')} sell ${k('in')} range(buy + 1, len(prices)):`],
      ['gain', `                gain = prices[sell] - prices[buy]`],
      ['best', `                ${k('if')} gain &gt; best:`],
      [null, `                    best = gain`],
      ['ret', `        ${k('return')} best`],
    ],
    javascript: [
      [null, `${k('const')} maxProfit = ${k('function')} (prices) {`],
      ['init', `  ${k('let')} best = 0;`],
      ['outer', `  ${k('for')} (${k('let')} buy = 0; buy &lt; prices.length; buy++) {`],
      [null, `    ${k('for')} (${k('let')} sell = buy + 1; sell &lt; prices.length; sell++) {`],
      ['gain', `      ${k('const')} gain = prices[sell] - prices[buy];`],
      ['best', `      ${k('if')} (gain &gt; best) best = gain;`],
      [null, `    }`],
      [null, `  }`],
      ['ret', `  ${k('return')} best;`],
      [null, `};`],
    ],
    go: [
      [null, `${k('func')} maxProfit(prices []${k('int')}) ${k('int')} {`],
      ['init', `    best := 0`],
      ['outer', `    ${k('for')} buy := 0; buy &lt; len(prices); buy++ {`],
      [null, `        ${k('for')} sell := buy + 1; sell &lt; len(prices); sell++ {`],
      ['gain', `            gain := prices[sell] - prices[buy]`],
      ['best', `            ${k('if')} gain &gt; best {`],
      [null, `                best = gain`],
      [null, `            }`],
      [null, `        }`],
      [null, `    }`],
      ['ret', `    ${k('return')} best`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} max_profit(prices: Vec&lt;i32&gt;) -&gt; i32 {`],
      ['init', `        ${k('let')} ${k('mut')} best = 0;`],
      ['outer', `        ${k('for')} buy ${k('in')} 0..prices.len() {`],
      [null, `            ${k('for')} sell ${k('in')} buy + 1..prices.len() {`],
      ['gain', `                ${k('let')} gain = prices[sell] - prices[buy];`],
      ['best', `                ${k('if')} gain &gt; best { best = gain; }`],
      [null, `            }`],
      [null, `        }`],
      ['ret', `        best`],
      [null, `    }`],
      [null, `}`],
    ],
  },
  onepass: {
    ruby: [
      [null, `${k('def')} max_profit(prices)`],
      ['init', `  best, cheapest = 0, Float::INFINITY   ${c('# profit so far, price so far')}`],
      ['loop', `  prices.each ${k('do')} |price|`],
      ['cheaper', `    ${k('if')} price &lt; cheapest`],
      ['setmin', `      cheapest = price`],
      ['gain', `    ${k('elsif')} price - cheapest &gt; best`],
      ['best', `      best = price - cheapest`],
      [null, `    ${k('end')}`],
      [null, `  ${k('end')}`],
      ['ret', `  best`],
      [null, `${k('end')}`],
    ],
    python: [
      [null, `${k('class')} Solution:`],
      [null, `    ${k('def')} maxProfit(self, prices):`],
      ['init', `        best, cheapest = 0, float(${c('"inf"')})    ${c('# profit so far, price so far')}`],
      ['loop', `        ${k('for')} price ${k('in')} prices:`],
      ['cheaper', `            ${k('if')} price &lt; cheapest:`],
      ['setmin', `                cheapest = price`],
      ['gain', `            ${k('elif')} price - cheapest &gt; best:`],
      ['best', `                best = price - cheapest`],
      ['ret', `        ${k('return')} best`],
    ],
    javascript: [
      [null, `${k('const')} maxProfit = ${k('function')} (prices) {`],
      ['init', `  ${k('let')} best = 0, cheapest = Infinity;   ${c('// profit so far, price so far')}`],
      ['loop', `  ${k('for')} (${k('const')} price ${k('of')} prices) {`],
      ['cheaper', `    ${k('if')} (price &lt; cheapest) {`],
      ['setmin', `      cheapest = price;`],
      ['gain', `    } ${k('else')} ${k('if')} (price - cheapest &gt; best) {`],
      ['best', `      best = price - cheapest;`],
      [null, `    }`],
      [null, `  }`],
      ['ret', `  ${k('return')} best;`],
      [null, `};`],
    ],
    go: [
      [null, `${k('import')} ${c('"math"')}`],
      [null, ``],
      [null, `${k('func')} maxProfit(prices []${k('int')}) ${k('int')} {`],
      ['init', `    best, cheapest := 0, math.MaxInt32   ${c('// profit so far, price so far')}`],
      ['loop', `    ${k('for')} _, price := ${k('range')} prices {`],
      ['cheaper', `        ${k('if')} price &lt; cheapest {`],
      ['setmin', `            cheapest = price`],
      ['gain', `        } ${k('else')} ${k('if')} price-cheapest &gt; best {`],
      ['best', `            best = price - cheapest`],
      [null, `        }`],
      [null, `    }`],
      ['ret', `    ${k('return')} best`],
      [null, `}`],
    ],
    rust: [
      [null, `${k('impl')} Solution {`],
      [null, `    ${k('pub')} ${k('fn')} max_profit(prices: Vec&lt;i32&gt;) -&gt; i32 {`],
      ['init', `        ${k('let')} (${k('mut')} best, ${k('mut')} cheapest) = (0, i32::MAX);`],
      ['loop', `        ${k('for')} &amp;price ${k('in')} prices.iter() {`],
      ['cheaper', `            ${k('if')} price &lt; cheapest {`],
      ['setmin', `                cheapest = price;`],
      ['gain', `            } ${k('else')} ${k('if')} price - cheapest &gt; best {`],
      ['best', `                best = price - cheapest;`],
      [null, `            }`],
      [null, `        }`],
      ['ret', `        best`],
      [null, `    }`],
      [null, `}`],
    ],
  },
};

/* ---------------- part 1: the "pick a trade" widget ----------------
 *
 * The statement hides two rules in one sentence: the sell has to come on a
 * later day than the buy, and "no transaction" is allowed, so the answer is
 * never negative. Drag the buy day and the sell day: an illegal pair, a loss
 * and the best trade each get their own line. At the answer, the line also
 * names the tempting shortcut, max − min, when the cheapest day comes after
 * the dearest one and the shortcut is wrong.
 *
 * Built from x-sum's widget vocabulary: .q-arr cells (kept / cut), the
 * .q-slider, the amber .q-tie line and the .ledger.
 */

const QW_SETS = [
  { label: exampleTitle(1), prices: [7, 1, 5, 3, 6, 4] },
  { label: exampleTitle(2), prices: [7, 6, 4, 3, 1] },
  { label: t('a late low', 'နောက်ကျ အနိမ့်'), prices: [3, 8, 2, 5, 1] },
];

function bestTrade(prices) {
  let best = 0, cheapest = Infinity, minIdx = 0, pair = null;
  for (let i = 0; i < prices.length; i++) {
    if (prices[i] < cheapest) { cheapest = prices[i]; minIdx = i; }
    else if (prices[i] - cheapest > best) { best = prices[i] - cheapest; pair = [minIdx, i]; }
  }
  return { best, pair };
}

function mountTradeWidget(host) {
  const state = { set: 0, buy: 1, sell: 4 };

  host.innerHTML = `
    <div class="q-arr" data-arr></div>
    <div class="q-slider">
      <label for="qw-buy" data-lbl-buy></label>
      <input type="range" id="qw-buy" min="0" max="1" value="0">
      <output data-out-buy>0</output>
    </div>
    <div class="q-slider">
      <label for="qw-sell" data-lbl-sell></label>
      <input type="range" id="qw-sell" min="0" max="1" value="0">
      <output data-out-sell>0</output>
      <span class="q-presets" data-presets></span>
    </div>
    <p class="q-tie" data-line></p>
    <div class="ledger">
      <span class="expr" data-expr></span>
      <span class="total" data-total></span>
    </div>`;

  const q = (sel) => host.querySelector(sel);

  function verdict(p, buy, sell, best) {
    if (sell < buy) {
      return t(`Not allowed: that sells on day ${sell} a stock you only buy on day ${buy}. The sell has to come <b>after</b> the buy.`,
               `ခွင့်မပြုပါ — နေ့ ${buy} ကျမှ ဝယ်မည့် stock ကို နေ့ ${sell} တွင် ရောင်းနေသည်။ ရောင်းသည့်နေ့က ဝယ်သည့်နေ့ <b>နောက်မှ</b> ဖြစ်ရမည်။`);
    }
    if (sell === buy) {
      return t(`Not allowed: buying and selling on day ${buy} is not a trade. The statement asks for a <b>different day in the future</b>.`,
               `ခွင့်မပြုပါ — နေ့ ${buy} တစ်နေ့တည်းမှာ ဝယ်ပြီး ရောင်းတာ အရောင်းအဝယ် မဟုတ်ပါ။ မေးခွန်းက <b>နောက်ပိုင်းက အခြားနေ့တစ်ရက်</b> ကို တောင်းထားသည်။`);
    }
    const gain = p[sell] - p[buy];
    if (gain < 0) {
      return t(`A loss of ${-gain}, so you would not trade at all: it counts as <b>0</b>, never a negative number.`,
               `${-gain} ရှုံးသဖြင့် ဘာမှ မလုပ်ဘဲ နေလိုက်မည် — <b>0</b> အဖြစ် ရေတွက်ပြီး အနုတ်ကိန်း ဘယ်တော့မှ မဖြစ်ပါ။`);
    }
    if (gain === best && gain > 0) {
      return t('That is the most this list allows.', 'ဤစာရင်းတွင် ရနိုင်သည့် အများဆုံးပင် ဖြစ်သည်။');
    }
    return t(`Legal, but the most this list allows is ${best}.`, `တရားဝင် ဖြစ်သည်၊ သို့သော် ဤစာရင်းတွင် ရနိုင်သည့် အများဆုံးမှာ ${best} ဖြစ်သည်။`);
  }

  function shortcut(p, best) {
    const hi = Math.max(...p);
    const lo = Math.min(...p);
    if (hi - lo === best) return null;
    const hiAt = p.indexOf(hi);
    const loAt = p.lastIndexOf(lo);
    return t(` Beware <code>max − min</code> = ${hi} − ${lo} = ${hi - lo}: the cheapest day (${loAt}) comes after the dearest (${hiAt}).`,
             ` <code>max − min</code> = ${hi} − ${lo} = ${hi - lo} ကို သတိထားပါ — ဈေးအသက်သာဆုံးနေ့ (${loAt}) သည် ဈေးအကြီးဆုံးနေ့ (${hiAt}) ၏ နောက်မှ ကျသည်။`);
  }

  function render() {
    const p = QW_SETS[state.set].prices;
    const { buy, sell } = state;
    const { best } = bestTrade(p);
    const legal = sell > buy;

    q('[data-lbl-buy]').textContent = pick(L.buy);
    q('[data-lbl-sell]').textContent = pick(L.sell);
    for (const [id, v] of [['#qw-buy', buy], ['#qw-sell', sell]]) {
      const el = q(id);
      el.max = String(p.length - 1);
      el.value = String(v);
    }
    q('[data-out-buy]').textContent = String(buy);
    q('[data-out-sell]').textContent = String(sell);
    q('[data-presets]').innerHTML = QW_SETS.map((x, i) =>
      `<button class="chip" data-set="${i}"${i === state.set ? ' aria-pressed="true"' : ''}>${pick(x.label)}</button>`).join('');

    // kept = the days you hold the stock, a legal trade · cut = an illegal pair
    q('[data-arr]').innerHTML = p.map((v, i) => {
      const held = legal && i >= buy && i <= sell;
      const cls = (i === buy || i === sell) ? (legal ? ' kept picked' : ' cut picked amber') : held ? ' kept' : '';
      return `<div class="cell${cls}"><span>${v}</span><span class="idx">${i}</span></div>`;
    }).join('');

    const label = document.getElementById('q-label');
    if (label) label.textContent = pick(t(`${p.length} days, best ${best}`, `${p.length} ရက်၊ အကောင်းဆုံး ${best}`));

    const line = verdict(p, buy, sell, best);
    // The max − min shortcut is worth naming once the reader is looking at
    // the real answer: the best trade, or a list where no trade pays.
    const atAnswer = best === 0 || (legal && p[sell] - p[buy] === best);
    const warn = atAnswer ? shortcut(p, best) : null;
    q('[data-line]').innerHTML = pick(line) + (warn ? pick(warn) : '');

    // the ledger is a formula, as on x-sum
    q('[data-expr]').innerHTML = legal
      ? `prices[${sell}] − prices[${buy}] = ${p[sell]} − ${p[buy]} = ${p[sell] - p[buy]}`
      : `sell ${sell} ≤ buy ${buy} · no trade`;
    q('[data-total]').innerHTML = `${best}<small>${pick(t('max profit', 'အများဆုံး အမြတ်'))}</small>`;
  }

  host.addEventListener('input', (ev) => {
    if (ev.target.id === 'qw-buy') state.buy = Number(ev.target.value);
    else if (ev.target.id === 'qw-sell') state.sell = Number(ev.target.value);
    else return;
    render();
  });
  host.addEventListener('click', (ev) => {
    const chip = ev.target.closest('[data-set]');
    if (!chip) return;
    state.set = Number(chip.dataset.set);
    const { pair } = bestTrade(QW_SETS[state.set].prices);
    [state.buy, state.sell] = pair ?? [0, 1];
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
  input: { prices: [7, 1, 5, 3, 6, 4] },
  controls: [
    { key: 'prices', label: L.prices, value: '7, 1, 5, 3, 6, 4',
      parse: (v) => {
        const a = v.split(',').map((x) => x.trim()).filter((x) => x !== '').map(Number);
        if (!a.length || a.some(Number.isNaN)) throw new Error('need at least one price');
        return a.slice(0, 12);
      } },
  ],
  presets: [
    { label: exampleTitle(1), input: { prices: [7, 1, 5, 3, 6, 4] } },
    { label: exampleTitle(2), input: { prices: [7, 6, 4, 3, 1] } },
    { label: t('Single day', 'တစ်ရက်တည်း'), input: { prices: [5] } },
    { label: t('All same', 'ဈေးတူ'), input: { prices: [3, 3, 3, 3] } },
  ],
  examples: [
    { title: exampleTitle(1),
      inputHtml: '<code>prices = [7,1,5,3,6,4]</code>', output: '5',
      why: [t(
        'Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6 - 1 = 5. Note that buying on day 2 and selling on day 1 is not allowed because you must buy before you sell.',
        'နေ့ 2 (ဈေး = 1) မှာ ဝယ်ပြီး နေ့ 5 (ဈေး = 6) မှာ ရောင်းပါ၊ အမြတ် = 6 - 1 = 5။ နေ့ 2 မှာ ဝယ်ပြီး နေ့ 1 မှာ ရောင်းတာ မရပါ — ရောင်းမည့်နေ့ မတိုင်မီ ဝယ်ထားရမည် ဖြစ်သောကြောင့် ဖြစ်သည်။')],
      load: { prices: [7, 1, 5, 3, 6, 4] } },
    { title: exampleTitle(2),
      inputHtml: '<code>prices = [7,6,4,3,1]</code>', output: '0',
      why: [t(
        'Prices only go down — any later sell after buying on day 0 loses money. <code>max - min = 6</code> is wrong because the cheapest day (day 4) comes after the dearest (day 0). Not taking a trade is the best move: return <code>0</code>.',
        'ဈေးက တစ်ရှိန်ထိုး ကျဆင်းနေသည် — နေ့ 0 မှာ 7 နှင့် ဝယ်လျှင် နောက်ပိုင်း ရောင်းတိုင်း အရှုံးသာ ရသည်။ <code>max - min = 6</code> ဟု တွက်မိလျှင် မှားသည် — ဈေးအသက်သာဆုံးနေ့ (နေ့ 4) သည် ဈေးအကြီးဆုံးနေ့ (နေ့ 0) ၏ နောက်မှ ကျရောက်နေသောကြောင့် ဖြစ်သည်။ ဘာမှ မဝယ်၊ မရောင်းဘဲ <code>0</code> ပြန်ပေးခြင်းက အကောင်းဆုံး ဖြစ်သည်။')],
      load: { prices: [7, 6, 4, 3, 1] } },
  ],
  modes: [
    { id: 'brute',
      name: t('Every pair', 'နေ့တွဲတိုင်း'),
      desc: t('Price out all n(n-1)/2 trades, keep the richest.',
               'အရောင်းအဝယ် n(n-1)/2 ခုလုံးကို တွက်ပြီး အမြတ်အများဆုံးကို မှတ်ထားသည်။'),
      cost: 'O(n²) time · O(1) space', build: buildBrute },
    { id: 'onepass',
      name: t('One pass', 'တစ်ခေါက်တည်း'),
      desc: t('Cheapest price so far, best profit against it — one walk, two numbers.',
               'ယခုအထိ ဈေးအသက်သာဆုံးနှင့် ၎င်းနှင့် တွဲ၍ အမြတ်အများဆုံး — တစ်ခေါက်၊ ဂဏန်း နှစ်လုံး။'),
      cost: 'O(n) time · O(1) space', build: buildOnePass },
  ],
  solutions: {
    brute: { desc: t(
      'Two nested loops, <code>sell</code> always after <code>buy</code> so no element pairs with itself. Correct, and quadratic.',
      'Loop နှစ်ထပ်၊ element တစ်ခု သူ့ကိုယ်သူ မတွဲမိစေရန် <code>sell</code> ကို <code>buy</code> ၏ နောက်မှသာ စသည်။ မှန်သည်၊ သို့သော် quadratic ဖြစ်သည်။') },
    onepass: { desc: t(
      'The submission worth writing. One walk, two variables — <code>cheapest</code> starts at ∞ so day 0 needs no special case.',
      'ရေးသင့်သည့် submission ဖြစ်သည်။ တစ်ခေါက်တည်း၊ variable နှစ်လုံး — <code>cheapest</code> ကို ∞ ဖြင့် စတင်သဖြင့် နေ့ 0 အတွက် သီးသန့် စစ်ဆေးစရာ မလိုပါ။') },
  },
  languages: LANGUAGES,
  code: CODE,
  // How each language was actually checked, printed as the part 3 badges.
  // The corpus: 4 examples, 15,000 short price lists over 0..6, 5,000 up to 10⁴, three of 3,000 — against all-pairs search; the one-pass versions also ran four at n = 10⁵.
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
  widget: mountTradeWidget,
});