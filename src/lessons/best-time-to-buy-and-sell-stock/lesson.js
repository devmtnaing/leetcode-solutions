/* Best Time to Buy and Sell Stock — LeetCode 121.
 *
 * The contrast worth seeing: the brute force asks "what would this pair of days
 * have earned?" once per pair, while the one-pass asks "if I sold today, what is
 * the most I could have paid?" once per day. The second question has an answer
 * you already hold — the cheapest price so far — so nothing to the left has to
 * be looked at again.
 *
 * Part 1 carries a small widget of its own: pick a buy day and a sell day on the
 * chart. It exists to make one thing physical before the walkthrough starts —
 * the sell has to come after the buy, which is the whole reason the answer is
 * not max(prices) - min(prices).
 */
import { mountLesson } from '../../lib/stepper.js';
import { bars } from '../../lib/stage.js';
import { pick, onLangChange } from '../../lib/i18n.js';

/* A bilingual string: the { en, my } pair pick() reads at render time. */
const t = (en, my) => ({ en, my });

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
        နေ့တွဲ ${pairs} တွဲ ရှိသည်။`) });

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

  // The trade currently in the lead, drawn green on both ends. Laid down first so
  // the markers for where the algorithm actually is can overwrite the star.
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

  // A sale that loses money is worth showing as a loss, but never at the cost of
  // painting over one end of the winning trade.
  const here = s.sell != null ? s.sell : s.day;
  if (s.miss && s.gain < 0 && here != null && !(s.bestPair && s.bestPair.includes(here))) {
    tone[here] = 'down';
  }

  const at = s.sell != null ? s.sell : s.buy != null ? s.buy : s.day;
  return bars(prices, { at: at ?? null, marks, tone, label: pick(L.prices) });
}

function vars(s) {
  // Variable names stay in English in both languages: they name identifiers the
  // reader is looking at in the code panel a few centimetres to the right.
  if (s.cheapest !== undefined) {
    return [['day', s.day ?? '—'], ['price', s.price ?? '—'],
            ['cheapest', s.cheapest === Infinity ? '∞' : s.cheapest],
            ['gain', s.gain ?? '—'], ['best', s.best]];
  }
  return [['buy', s.buy ?? '—'], ['sell', s.sell ?? '—'], ['gain', s.gain ?? '—'],
          ['best', s.best], ['trade', s.bestPair ? `${s.bestPair[0]} → ${s.bestPair[1]}` : '—']];
}

/* ---------------- the code, one key per line ---------------- */

const c = (t_) => `<span class="c">${t_}</span>`;
const k = (t_) => `<span class="k">${t_}</span>`;

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

/* ---------------- mount ---------------- */

mountLesson({
  root: document.getElementById('lesson'),
  input: { prices: [7, 1, 5, 3, 6, 4] },
  controls: [
    { key: 'prices', label: L.prices, size: 24, value: '7, 1, 5, 3, 6, 4',
      parse: (v) => {
        const a = v.split(',').map((x) => x.trim()).filter((x) => x !== '').map(Number);
        if (!a.length || a.some(Number.isNaN)) throw new Error('need at least one price');
        return a.slice(0, 12);
      } },
  ],
  modes: [
    { id: 'brute',
      name: t('Every pair', 'နေ့တွဲတိုင်း'),
      blurb: t('Price out all n(n-1)/2 trades', 'အရောင်းအဝယ် n(n-1)/2 ခုလုံးကို တွက်သည်'),
      cost: 'O(n²) time · O(1) space', build: buildBrute },
    { id: 'onepass',
      name: t('One pass', 'တစ်ခေါက်တည်း လျှောက်'),
      blurb: t('Cheapest so far, best against it', 'ယခုအထိ ဈေးအသက်သာဆုံး၊ ၎င်းနှင့် တွဲ၍ အမြတ်အများဆုံး'),
      cost: 'O(n) time · O(1) space', build: buildOnePass },
  ],
  languages: [
    { id: 'ruby', name: 'Ruby' }, { id: 'python', name: 'Python' },
    { id: 'javascript', name: 'JavaScript' }, { id: 'go', name: 'Go' }, { id: 'rust', name: 'Rust' },
  ],
  code: CODE,
  // How each language was actually checked. Printed as a badge on every
  // listing in part 3, so a language nothing ran says so on the page.
  verification: {
    ruby: 'run here · 10,011-case shared corpus, identical checksum',
    python: 'run here · 10,011-case shared corpus, identical checksum',
    javascript: 'run here · 10,011-case shared corpus, identical checksum',
    go: 'not compiled — no Go/Rust toolchain, Docker down',
    rust: 'not compiled — no Go/Rust toolchain, Docker down',
  },
  draw,
  vars,
});

/* ================= part 1: the question widget =================
 *
 * The statement hinges on one clause — "a different day in the future" — and it
 * is the clause people read past. Someone who misses it computes
 * max(prices) - min(prices) and answers 6 on [7,6,4,3,1] instead of 0.
 *
 * So the widget makes the ordering physical: click a bar to set the buy day,
 * click another to set the sell day. A sell that lands at or before the buy is
 * refused out loud rather than quietly returning a negative, and a standing
 * note under the chart prints what max - min would have claimed next to what
 * the answer actually is. Two clicks and the clause is no longer skippable.
 */

const WIDGET_EXAMPLES = [
  { prices: [7, 1, 5, 3, 6, 4], label: t('Example 1', 'ဥပမာ ၁') },
  { prices: [7, 6, 4, 3, 1], label: t('Example 2', 'ဥပမာ ၂') },
];

const WIDGET_CSS = `
#question-widget{margin-top:22px}
.qw{background:var(--surface);border:1px solid var(--line);border-radius:var(--radius);
  padding:15px 16px 14px;display:flex;flex-direction:column;gap:12px}
.qw > div{display:flex;flex-direction:column;gap:12px}
.qw-head{display:flex;flex-wrap:wrap;gap:8px 14px;align-items:baseline;justify-content:space-between}
.qw-title{margin:0;font-size:13.5px;font-weight:600;color:var(--ink);line-height:1.5}
.qw-tabs{display:flex;gap:4px;flex-wrap:wrap}
.qw-tab{background:transparent;border:1px solid var(--line);border-radius:7px;padding:3px 9px;
  font:inherit;font-size:12px;color:var(--ink-2);cursor:pointer}
.qw-tab:hover{background:var(--sunk)}
.qw-tab[aria-pressed="true"]{background:var(--accent-soft);border-color:var(--accent);
  color:var(--accent);font-weight:600}
.qw-chart{padding-top:2px}
.qw .st-bar{min-width:40px;border-radius:6px;padding:3px 3px 0}
.qw .st-bar.t-warn .st-fill{background:var(--amber)}
.qw-pick{cursor:pointer;outline-offset:2px}
.qw-pick:hover{background:var(--sunk)}
.qw-pick:focus-visible{outline:2px solid var(--accent)}
.qw-say{font-size:13px;line-height:1.6;color:var(--ink-2);background:var(--sunk);
  border-left:3px solid var(--line-2);border-radius:0 7px 7px 0;padding:9px 12px}
.qw-say.good{border-left-color:var(--up);background:var(--up-soft);color:var(--ink)}
.qw-say.bad{border-left-color:var(--down);background:var(--down-soft);color:var(--ink)}
.qw-say.meh{border-left-color:var(--amber);background:var(--amber-soft);color:var(--ink)}
.qw-point{font-size:12.5px;line-height:1.65;color:var(--ink-2);
  border-top:1px dashed var(--line);padding-top:11px;margin:0}
.qw-point code{background:var(--sunk);border:1px solid var(--line);padding:1px 5px;
  border-radius:4px;font-size:.92em;font-family:"IBM Plex Mono",ui-monospace,monospace}
.qw-clear{align-self:flex-start;background:transparent;border:1px solid var(--line);
  border-radius:7px;padding:3px 10px;font:inherit;font-size:12px;color:var(--ink-3);cursor:pointer}
.qw-clear:hover{background:var(--sunk);color:var(--ink-2)}
@keyframes qw-nope{0%,100%{transform:translateX(0)}25%{transform:translateX(-5px)}
  75%{transform:translateX(5px)}}
.qw-say.bad{animation:qw-nope .26s ease-in-out}
@media (prefers-reduced-motion:reduce){.qw-say.bad{animation:none}}
`;

/* The answer the problem actually wants, plus the trade that earns it. */
function bestTrade(prices) {
  let best = 0;
  let cheapest = Infinity;
  let minIdx = 0;
  let pair = null;
  for (let i = 0; i < prices.length; i++) {
    if (prices[i] < cheapest) { cheapest = prices[i]; minIdx = i; }
    else if (prices[i] - cheapest > best) { best = prices[i] - cheapest; pair = [minIdx, i]; }
  }
  return { best, pair };
}

function mountQuestionWidget(host) {
  const state = { ex: 0, buy: null, sell: null };

  // Three regions, built once. The verdict has to keep its identity across
  // renders or a screen reader never hears it change — replacing a live region
  // wholesale is the reliable way to make it silent.
  host.innerHTML = `<style>${WIDGET_CSS}</style>
    <div class="qw" data-qw>
      <div data-qw-top></div>
      <p class="qw-say" role="status" aria-live="polite" data-qw-say></p>
      <div data-qw-bottom></div>
    </div>`;
  const box = host.querySelector('[data-qw]');
  const topEl = box.querySelector('[data-qw-top]');
  const sayEl = box.querySelector('[data-qw-say]');
  const bottomEl = box.querySelector('[data-qw-bottom]');

  const prices = () => WIDGET_EXAMPLES[state.ex].prices;

  /* What to say about the current selection, and how to colour it. */
  function verdict() {
    const p = prices();
    const { buy, sell } = state;
    const { best } = bestTrade(p);

    if (buy === null) {
      return { kind: '', say: t(
        `Click a bar to choose the day you <b>buy</b>.`,
        `<b>ဝယ်</b>မည့်နေ့ကို ရွေးရန် bar တစ်ခုကို နှိပ်ပါ။`) };
    }
    if (sell === null) {
      return { kind: '', say: t(
        `Bought on day ${buy} at ${p[buy]}. Now click the day you <b>sell</b> —
          try one before day ${buy} and see what happens.`,
        `နေ့ ${buy} တွင် ${p[buy]} နှင့် ဝယ်ပြီးပြီ။ ယခု <b>ရောင်း</b>မည့်နေ့ကို နှိပ်ပါ —
          နေ့ ${buy} ထက် စောသော နေ့တစ်ခုကို ရွေးကြည့်ပြီး ဘာဖြစ်သွားသလဲ ကြည့်ပါ။`) };
    }
    if (sell < buy) {
      return { kind: 'bad', say: t(
        `Not allowed. That sells on day ${sell} a stock you do not own until day ${buy} —
          the sell has to come <b>after</b> the buy. No profit, not even a negative one.`,
        `ခွင့်မပြုပါ။ နေ့ ${buy} ကျမှ ပိုင်မည့် stock ကို နေ့ ${sell} တွင် ရောင်းနေခြင်း ဖြစ်သည် —
          ရောင်းသည့်နေ့က ဝယ်သည့်နေ့ <b>နောက်မှ</b> ဖြစ်ရမည်။ အမြတ်လည်း မရ၊ အနုတ်တောင် မဟုတ်ပါ။`) };
    }
    if (sell === buy) {
      return { kind: 'bad', say: t(
        `Not allowed. Buying and selling on day ${buy} is not a trade at all — the statement
          asks for a <b>different day in the future</b>.`,
        `ခွင့်မပြုပါ။ နေ့ ${buy} တစ်နေ့တည်းမှာ ဝယ်ပြီး ရောင်းတာ အရောင်းအဝယ် မဟုတ်ပါ —
          မေးခွန်းက <b>နောက်ပိုင်းက အခြားနေ့တစ်ရက်</b> ကို တောင်းထားသည်။`) };
    }

    const gain = p[sell] - p[buy];
    const head = t(
      `Buy day ${buy} at ${p[buy]}, sell day ${sell} at ${p[sell]}:
        <b>${p[sell]} &minus; ${p[buy]} = ${gain}</b>.`,
      `နေ့ ${buy} တွင် ${p[buy]} နှင့် ဝယ်၊ နေ့ ${sell} တွင် ${p[sell]} နှင့် ရောင်း —
        <b>${p[sell]} &minus; ${p[buy]} = ${gain}</b>။`);

    if (gain > 0) {
      const tail = gain === best
        ? t(` That is the most this list allows.`, ` ဤစာရင်းတွင် ရနိုင်သည့် အများဆုံးပင် ဖြစ်သည်။`)
        : t(` Legal, but the most this list allows is ${best}.`,
             ` တရားဝင် ဖြစ်သည်၊ သို့သော် ဤစာရင်းတွင် ရနိုင်သည့် အများဆုံးမှာ ${best} ဖြစ်သည်။`);
      return { kind: 'good', say: t(head.en + tail.en, head.my + tail.my) };
    }
    if (gain === 0) {
      const tail = t(` Legal, and worth exactly as much as not trading at all.`,
                     ` တရားဝင် ဖြစ်ပြီး ဘာမှ မလုပ်ဘဲ နေလိုက်တာနှင့် တန်ဖိုး အတူတူပင်။`);
      return { kind: 'meh', say: t(head.en + tail.en, head.my + tail.my) };
    }
    const tail = t(
      ` Legal, but a loss — so you would take no trade, and it contributes <b>0</b>, never a
        negative number.`,
      ` တရားဝင် ဖြစ်သော်လည်း အရှုံး — ထို့ကြောင့် ဘာမှ မလုပ်ဘဲ နေလိုက်မည်။ ရလဒ်သည် အနုတ် မဟုတ်၊
        <b>0</b> ဖြစ်သည်။`);
    return { kind: 'meh', say: t(head.en + tail.en, head.my + tail.my) };
  }

  /* The standing punchline: what max - min claims, and what the answer is. */
  function point() {
    const p = prices();
    const { best } = bestTrade(p);
    const hi = Math.max(...p);
    const lo = Math.min(...p);
    const hiAt = p.indexOf(hi);
    const loAt = p.indexOf(lo);
    const naive = hi - lo;
    if (naive > best) {
      return t(
        `<code>max &minus; min</code> here is <code>${hi} &minus; ${lo} = ${naive}</code>. But the
          cheapest day (day ${loAt}) falls <b>after</b> the dearest (day ${hiAt}), so that trade
          cannot be made in this direction. The answer is <b>${best}</b>.`,
        `ဤနေရာတွင် <code>max &minus; min</code> က <code>${hi} &minus; ${lo} = ${naive}</code>
          ဖြစ်သည်။ သို့သော် ဈေးအသက်သာဆုံးနေ့ (နေ့ ${loAt}) သည် ဈေးအကြီးဆုံးနေ့ (နေ့ ${hiAt})
          ၏ <b>နောက်မှ</b> ကျရောက်နေသဖြင့် ထိုအရောင်းအဝယ်ကို ဤအစီအစဉ်အတိုင်း လုပ်၍ မရပါ။
          အဖြေမှာ <b>${best}</b> ဖြစ်သည်။`);
    }
    return t(
      `<code>max &minus; min</code> happens to give the right answer here, <b>${best}</b> — only
        because a cheapest day sits before a dearest one. Swap to the other example and it stops
        being true.`,
      `ဤနေရာတွင် <code>max &minus; min</code> က အဖြေမှန် <b>${best}</b> ကို ပေးနေသည် —
        ဈေးအသက်သာဆုံးနေ့က ဈေးအကြီးဆုံးနေ့၏ ရှေ့မှာ ရှိနေလို့သာ ဖြစ်သည်။ နောက်ဥပမာကို
        ပြောင်းကြည့်လိုက်ပါ၊ မမှန်တော့ပါ။`);
  }

  function render() {
    const p = prices();
    const { buy, sell } = state;
    const v = verdict();

    const marks = {};
    const tone = {};
    if (buy !== null) marks[buy] = pick(L.buy);
    if (sell !== null) {
      marks[sell] = buy === sell ? `${pick(L.buy)} · ${pick(L.sell)}` : pick(L.sell);
      if (v.kind === 'bad') { tone[buy] = 'down'; tone[sell] = 'down'; }
      else if (v.kind === 'good') { tone[buy] = 'up'; tone[sell] = 'up'; }
      else { tone[buy] = 'warn'; tone[sell] = 'warn'; }
    }

    topEl.innerHTML = `
      <div class="qw-head">
        <p class="qw-title">${pick(t(
          'Pick a day to buy, then a day to sell.',
          'ဝယ်မည့်နေ့ တစ်ရက်၊ ပြီးလျှင် ရောင်းမည့်နေ့ တစ်ရက် ရွေးကြည့်ပါ။'))}</p>
        <div class="qw-tabs">
          ${WIDGET_EXAMPLES.map((e, i) => `<button class="qw-tab" type="button" data-ex="${i}"
              aria-pressed="${i === state.ex}">${pick(e.label)} · [${e.prices.join(',')}]</button>`).join('')}
        </div>
      </div>
      <div class="qw-chart">${bars(p, { marks, tone, label: pick(L.prices) })}</div>`;

    // Re-tripping the reject animation needs the class to actually leave and
    // come back, with a reflow in between.
    sayEl.className = 'qw-say';
    void sayEl.offsetWidth;
    sayEl.className = `qw-say ${v.kind}`;
    sayEl.innerHTML = pick(v.say);

    bottomEl.innerHTML = `
      <button class="qw-clear" type="button" data-clear>${pick(t('Start over', 'အစက ပြန်စ'))}</button>
      <p class="qw-point">${pick(point())}</p>`;

    topEl.querySelectorAll('.st-bar').forEach((el, i) => {
      el.classList.add('qw-pick');
      el.tabIndex = 0;
      el.setAttribute('role', 'button');
      el.dataset.day = String(i);
      el.setAttribute('aria-label', `${pick(L.day)} ${i}, ${pick(L.prices)} ${p[i]}`);
    });
  }

  function choose(day) {
    if (state.buy === null) { state.buy = day; state.sell = null; }
    else if (state.sell === null) { state.sell = day; }
    else { state.buy = day; state.sell = null; }
    // The chart is rebuilt, so the bar that was just activated is a new node.
    // Put focus back on it or a keyboard reader is dropped to the top of the page.
    const hadFocus = document.activeElement && document.activeElement.dataset?.day === String(day);
    render();
    if (hadFocus) topEl.querySelector(`[data-day="${day}"]`)?.focus();
  }

  box.addEventListener('click', (e) => {
    const tab = e.target.closest('[data-ex]');
    if (tab) { state.ex = Number(tab.dataset.ex); state.buy = state.sell = null; return render(); }
    if (e.target.closest('[data-clear]')) { state.buy = state.sell = null; return render(); }
    const bar = e.target.closest('[data-day]');
    if (bar) choose(Number(bar.dataset.day));
  });

  box.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const bar = e.target.closest('[data-day]');
    if (!bar) return;
    e.preventDefault();
    choose(Number(bar.dataset.day));
  });

  onLangChange(render);
  render();
}

const widgetHost = document.getElementById('question-widget');
if (widgetHost) mountQuestionWidget(widgetHost);
