/* Best Time to Buy and Sell Stock — LeetCode 121.
 *
 * The contrast worth seeing: the brute force asks "what would this pair of days
 * have earned?" once per pair, while the one-pass asks "if I sold today, what is
 * the most I could have paid?" once per day. The second question has an answer
 * you already hold — the cheapest price so far — so nothing to the left has to
 * be looked at again.
 */
import { mountLesson } from '../../lib/stepper.js';
import { bars } from '../../lib/stage.js';

/* ---------------- step generators ---------------- */

function buildBrute({ prices }) {
  const steps = [];
  const n = prices.length;
  let best = 0;
  let bestPair = null;

  steps.push({ line: 'init', buy: null, sell: null, best, bestPair,
    note: `Price out every buy/sell pair and keep the richest. With ${n} day${n === 1 ? '' : 's'}
      that is ${(n * (n - 1)) / 2} pair${(n * (n - 1)) / 2 === 1 ? '' : 's'}.` });

  for (let buy = 0; buy < n; buy++) {
    steps.push({ line: 'outer', buy, sell: null, best, bestPair, tag: 'buy',
      note: `Suppose the buy is day <b>${buy}</b> at <b>${prices[buy]}</b>. Only later days can be
        the sell, which is the only thing keeping this from being ${n * n} pairs.` });

    for (let sell = buy + 1; sell < n; sell++) {
      const gain = prices[sell] - prices[buy];
      const beats = gain > best;
      steps.push({ line: 'gain', buy, sell, gain, best, bestPair, miss: !beats,
        tag: beats ? 'sell' : 'no',
        note: beats
          ? `Sell on day ${sell} at ${prices[sell]}: <b>${prices[sell]} - ${prices[buy]} = ${gain}</b>.`
          : `Sell on day ${sell} at ${prices[sell]} and the trade is worth ${gain}${gain < 0 ? ', a loss' : ''}
             — no better than the ${best} already on record.` });

      if (beats) {
        best = gain;
        bestPair = [buy, sell];
        steps.push({ line: 'best', buy, sell, gain, best, bestPair, tag: 'best',
          note: `New leader: buy day ${buy}, sell day ${sell}, <b>${gain}</b> in profit. Nothing is
            settled — every remaining pair still has to be priced.` });
      }
    }
  }

  steps.push({ line: 'ret', buy: null, sell: null, best, bestPair, gain: null, tag: 'done',
    note: bestPair
      ? `Every pair priced. The best was buy day ${bestPair[0]}, sell day ${bestPair[1]}, for <b>${best}</b>.`
      : `Every pair priced and not one of them made money, so the answer is <b>0</b>: take no trade at all.` });
  return steps;
}

function buildOnePass({ prices }) {
  const steps = [];
  let best = 0;
  let cheapest = Infinity;
  let minIdx = null;
  let bestPair = null;

  steps.push({ line: 'init', day: null, cheapest, minIdx, best, bestPair,
    note: `Two numbers carry the whole walk: the cheapest price seen so far, and the best profit
      anything has made against it. Starting the cheapest at infinity means day 0 undercuts it
      without a special case.` });

  for (let day = 0; day < prices.length; day++) {
    const price = prices[day];
    steps.push({ line: 'loop', day, price, cheapest, minIdx, best, bestPair, tag: 'day',
      note: `Day ${day}, price <b>${price}</b>.` });

    const cheaper = price < cheapest;
    steps.push({ line: 'cheaper', day, price, cheapest, minIdx, best, bestPair, tag: 'cheaper?',
      note: minIdx === null
        ? `Nothing has been seen yet, so this is the cheapest day by default.`
        : cheaper
          ? `${price} undercuts the ${cheapest} from day ${minIdx}. Every future sale would rather
             have been bought here.`
          : `${price} is not below the ${cheapest} from day ${minIdx}, so the buy day stands. That
             makes today a day to consider selling on.` });

    if (cheaper) {
      cheapest = price;
      minIdx = day;
      steps.push({ line: 'setmin', day, price, cheapest, minIdx, best, bestPair, tag: 'buy',
        note: `Day ${day} becomes the buy day. Note what is <em>not</em> happening: the earlier,
          dearer days are never consulted again, because no later sale would prefer one of them.` });
    } else {
      const gain = price - cheapest;
      const beats = gain > best;
      steps.push({ line: 'gain', day, price, gain, cheapest, minIdx, best, bestPair, miss: !beats,
        tag: beats ? 'sell' : 'no',
        note: `Sell today against the day-${minIdx} low: <b>${price} - ${cheapest} = ${gain}</b>${beats ? '.' : `, which does not beat the ${best} already banked.`}` });
      if (beats) {
        best = gain;
        bestPair = [minIdx, day];
        steps.push({ line: 'best', day, price, gain, cheapest, minIdx, best, bestPair, tag: 'best',
          note: `<b>${gain}</b> is the new best. Buying at the cheapest price to date is the best
            any sale on day ${day} could have done, so this one number settles the whole day.` });
      }
    }
  }

  steps.push({ line: 'ret', day: null, price: null, gain: null, cheapest, minIdx, best, bestPair,
    tag: 'done',
    note: bestPair
      ? `One walk, ${prices.length} day${prices.length === 1 ? '' : 's'}, same answer as the ${(prices.length * (prices.length - 1)) / 2}-pair
         search: buy day ${bestPair[0]}, sell day ${bestPair[1]}, <b>${best}</b>.`
      : `The price never rose above a cheaper earlier day, so no trade was worth taking. Return <b>0</b>.` });
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
  if (s.buy != null) marks[s.buy] = 'buy';
  if (s.sell != null) marks[s.sell] = 'sell';
  if (s.day != null) marks[s.day] = s.minIdx === s.day ? 'min · today' : 'today';

  // A sale that loses money is worth showing as a loss, but never at the cost of
  // painting over one end of the winning trade.
  const here = s.sell != null ? s.sell : s.day;
  if (s.miss && s.gain < 0 && here != null && !(s.bestPair && s.bestPair.includes(here))) {
    tone[here] = 'down';
  }

  const at = s.sell != null ? s.sell : s.buy != null ? s.buy : s.day;
  return bars(prices, { at: at ?? null, marks, tone, label: 'prices' });
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

/* ---------------- the code, one key per line ---------------- */

const c = (t) => `<span class="c">${t}</span>`;
const k = (t) => `<span class="k">${t}</span>`;

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
    { key: 'prices', label: 'prices', size: 24, value: '7, 1, 5, 3, 6, 4',
      parse: (v) => {
        const a = v.split(',').map((x) => x.trim()).filter((x) => x !== '').map(Number);
        if (!a.length || a.some(Number.isNaN)) throw new Error('need at least one price');
        return a.slice(0, 12);
      } },
  ],
  modes: [
    { id: 'brute', name: 'Every pair', blurb: 'Price out all n(n-1)/2 trades',
      cost: 'O(n²) time · O(1) space', build: buildBrute },
    { id: 'onepass', name: 'One pass', blurb: 'Cheapest so far, best against it',
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
