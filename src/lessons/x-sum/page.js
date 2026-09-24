/* The prose of the X-Sum page: everything the reader sees that is not
 * interactive. Rendered by src/pages/leetcode/[slug].astro through the
 * Walkthrough layout; each value is a string or an { en, my } pair. */
export default {
  title: 'X-Sum, Two Ways',
  summary: 'LeetCode 3318 and its hard twin 3321. Brute force against a sliding window, in two containers — sorted arrays, then lazy heaps.',
  eyebrow: { en: 'LeetCode 3318 &nbsp;·&nbsp; and its hard twin 3321', my: 'LeetCode 3318 &nbsp;·&nbsp; နှင့် Hard ဗားရှင်း 3321' },
  lede: { en: 'Every length-<code>k</code> window has an <em>x-sum</em>: keep only the <code>x</code> most frequent values, add up their occurrences. One solution recounts each window from scratch; the other carries a running total as the window slides.', my: 'အရှည် <code>k</code> ရှိသော window တိုင်းမှာ <em>x-sum</em> တစ်ခုစီ ရှိသည် — အများဆုံးပေါ်သော တန်ဖိုး <code>x</code> ခုကိုသာ ထားပြီး ၎င်းတို့ပေါ်သည့် အကြိမ်များကို ပေါင်းလိုက်ခြင်းဖြစ်သည်။ ဖြေရှင်းနည်းတစ်ခုက window တိုင်းကို အစမှ ပြန်ရေတွက်သည်။ နောက်တစ်ခုကမူ window ရွေ့သွားသည်နှင့်အမျှ စုစုပေါင်းကို သယ်ဆောင်သွားသည်။' },
  links: [
    { id: 3318, title: 'Find X-Sum of All K-Long Subarrays I', slug: 'find-x-sum-of-all-k-long-subarrays-i', difficulty: 'Easy' },
    { id: 3321, title: 'Find X-Sum of All K-Long Subarrays II', slug: 'find-x-sum-of-all-k-long-subarrays-ii', difficulty: 'Hard' },
  ],
  constraints: { en: '<span><b>3318</b> n &le; 50 &middot; values &le; 50</span><span><b>3321</b> n &le; 10&#8309; &middot; values &le; 10&#8313;</span><span>1 &le; x &le; k &le; n</span>', my: '<span><b>3318</b> n &le; 50 &middot; တန်ဖိုး &le; 50</span><span><b>3321</b> n &le; 10&#8309; &middot; တန်ဖိုး &le; 10&#8313;</span><span>1 &le; x &le; k &le; n</span>' },
  part1Sub: { en: 'Read the statement, then drag <code>x</code> until the rule clicks.', my: 'မေးခွန်းကို အရင်ဖတ်ပါ။ ပြီးလျှင် စည်းမျဉ်းကို သဘောပေါက်သည်အထိ <code>x</code> ကို ဆွဲကြည့်ပါ။' },
  widgetTitle: { en: 'Drag x, watch what survives', my: 'x ကို ဆွဲကြည့်ပါ — ဘာကျန်မလဲ ကြည့်ပါ' },
  traps: {
    summary: { en: 'Three ways the statement bites &mdash; worth reading before you code', my: 'မေးခွန်းက ထောင်ချောက်ဆင်ထားသည့် နည်း 3 မျိုး — code မရေးခင် ဖတ်သင့်သည်' },
    items: [
      { en: '<b>"More frequent" means (count, then value).</b> Rank by count alone on Example 1 and you get <code>[6,<span class="bad">7</span>,12]</code> &mdash; the first window still passes, so the bug hides until the second.', my: '<b>“ပိုများသည်” ဆိုသည်မှာ (count အရင်၊ ပြီးမှ value) ဖြစ်သည်။</b> ဥပမာ 1 တွင် count ချည်းသာ စီကြည့်လျှင် <code>[6,<span class="bad">7</span>,12]</code> ရလိမ့်မည် — ပထမ window က မှန်နေသေးသဖြင့် bug က ဒုတိယအထိ ပုန်းနေသည်။' },
      { en: '<b>Fewer than <code>x</code> distinct values is not an error.</b> Nothing is dropped and the x-sum is the whole window, as in Example 2.', my: '<b>ကွဲပြားတန်ဖိုး <code>x</code> ထက်နည်းခြင်းသည် error မဟုတ်ပါ။</b> ဘာမှမဖယ်ဘဲ x-sum မှာ window တစ်ခုလုံး၏ ပေါင်းလဒ် ဖြစ်သည် — ဥပမာ 2 အတိုင်းပင်။' },
      { en: '<b>On 3321 the sums need 64 bits.</b> k &times; max value reaches 5&times;10<sup>13</sup>, well past a 32-bit int &mdash; this bites in C++, Java and Rust, though Go\'s <code>int</code> is already 64-bit.', my: '<b>3321 တွင် ပေါင်းလဒ်များအတွက် 64 bit လိုအပ်သည်။</b> k &times; အမြင့်ဆုံးတန်ဖိုး သည် 5&times;10<sup>13</sup> အထိ ရောက်သဖြင့် 32-bit int ကို ကျော်လွန်သည် — C++, Java နှင့် Rust တွင် ဤပြဿနာ တက်တတ်သည်။ Go ၏ <code>int</code> မှာမူ 64-bit ဖြစ်နှင့်ပြီးသား ဖြစ်သည်။' },
    ],
  },
  part2Sub: { en: 'Two algorithms, three walkthroughs &mdash; the sliding window appears twice, once per container. The stage shows the state; the panel shows the line running.', my: 'algorithm 2 မျိုး၊ လမ်းညွှန် 3 ခု — sliding window ကို container တစ်မျိုးစီအတွက် နှစ်ကြိမ် ပြထားသည်။ ဘယ်ဘက်က အခြေအနေကို ပြပြီး၊ ညာဘက် panel က အလုပ်လုပ်နေသော code ကြောင်းကို ပြသည်။' },
  notes: {
    eyebrow: { en: 'If you are implementing it', my: 'ကိုယ်တိုင် ရေးမည်ဆိုပါက' },
    title: { en: 'Three questions the sliding window raises', my: 'sliding window က ဖြစ်ပေါ်စေသော မေးခွန်း 3 ခု' },
    items: [
      { q: { en: 'Why lift the card off the shelf <em>before</em> changing its count?', my: 'count မပြောင်းခင် ကတ်ကို စင်ပေါ်က <em>အရင်</em> ဘာကြောင့် ဆွဲထုတ်ရသနည်း။' }, a: { en: 'A card\'s position on a shelf is its rank, and its rank <em>is</em> its count. Bump the count first and the card is filed under a key it no longer has &mdash; the binary search looks in the new spot, misses, and both shelves quietly rot.', my: 'ကတ်တစ်ခု စင်ပေါ်မှာရှိသည့် နေရာက သူ့အဆင့်ဖြစ်ပြီး၊ အဆင့်ဆိုသည်မှာ သူ့ count ပင် ဖြစ်သည်။ count ကို အရင်ပြောင်းလိုက်လျှင် ကတ်သည် သူ့တွင်မရှိတော့သော key အောက်မှာ ရှိနေလိမ့်မည် — binary search က နေရာအသစ်မှာ ရှာပြီး မတွေ့သဖြင့် စင်နှစ်ခုလုံး တိတ်တဆိတ် ပျက်စီးသွားသည်။' } },
      { q: { en: 'Why does the updated card always go back to REST?', my: 'ပြင်ပြီးသား ကတ်ကို ဘာကြောင့် REST ထဲ အမြဲပြန်ထည့်ရသနည်း။' }, a: { en: 'Because then <code>rebalance</code> is the only function that knows the invariant, so it is the only place that can break it. No branching on whether the card outranks anything &mdash; drop it in the cheap place and let one function sort it out.', my: 'ထိုသို့လုပ်ခြင်းဖြင့် invariant ကို သိသော function မှာ <code>rebalance</code> တစ်ခုတည်းသာ ဖြစ်သွားပြီး၊ ချိုးဖျက်နိုင်သည့် နေရာလည်း တစ်ခုတည်းသာ ရှိတော့သည်။ ကတ်က တခြားဟာတွေထက် သာမသာ စစ်စရာမလိုဘဲ — ကုန်ကျမှုအနည်းဆုံးနေရာမှာ ချလိုက်ပြီး function တစ်ခုတည်းကို ရှင်းခိုင်းလိုက်သည်။' } },
      { q: { en: 'Can the swap loop ping-pong forever?', my: 'swap loop သည် အဆုံးမရှိ အပြန်အလှန် လဲနေနိုင်သလား။' }, a: { en: 'No. It only runs when <code>up &gt; down</code>, and <code>up</code> is still sitting in REST after the demote, so the promoted card is never the one just dropped. Each swap strictly raises TOP\'s rank sum, so it terminates &mdash; in practice after one pass.', my: 'မဖြစ်ပါ။ <code>up &gt; down</code> ဖြစ်မှသာ အလုပ်လုပ်ပြီး၊ demote လုပ်ပြီးချိန်တွင် <code>up</code> က REST ထဲမှာ ကျန်နေဆဲဖြစ်သဖြင့် အတင်ခံရသော ကတ်သည် ခုနချလိုက်သည့် ကတ် ဘယ်တော့မှ မဖြစ်နိုင်ပါ။ swap တစ်ကြိမ်တိုင်း TOP ၏ အဆင့်ပေါင်းလဒ်ကို တိုးစေသဖြင့် ရပ်သွားသည် — လက်တွေ့တွင် တစ်ကြိမ်တည်းနှင့် ပြီးလေ့ရှိသည်။' } },
    ],
  },
  cost: {
    eyebrow: { en: 'Why bother', my: 'ဘာကြောင့် ဂရုစိုက်ရသလဲ' },
    title: { en: 'The same answer, a different price', my: 'အဖြေတူသော်လည်း ကုန်ကျစရိတ် ကွာသည်' },
    html: {
      en: `<table>
  <thead><tr><th>Approach</th><th>Work per window</th><th>n = 50 (3318)</th><th>n = 100k, k = 50k (3321)</th></tr></thead>
  <tbody>
    <tr><td><b>Brute force</b><br><span class="faint">tally + sort, every window</span></td>
        <td class="mono">O(k + d log d)</td><td class="tick">instant</td><td class="cross">~5 × 10⁹ element visits</td></tr>
    <tr><td><b>Sliding window</b><br><span class="faint">shelves as sorted arrays</span></td>
        <td class="mono">O(log k) compares<br>+ a shift of up to k</td><td class="tick">instant</td><td class="mid">0.22–1.86 s here, but ~50 GB<br>of memmove → TLE on the judge</td></tr>
    <tr><td><b>Sliding window</b><br><span class="faint">same shelves as lazy heaps</span></td>
        <td class="mono">O(log n), pointers only</td><td class="tick">instant</td><td class="tick">0.05–0.12 s here</td></tr>
  </tbody>
</table>
<figcaption>Timings are whole runs of the Ruby, Python and JavaScript listings on an Apple M5 Pro (n = 100,000, k = 50,000, x = 100, values up to 10⁹), startup included. The 5 × 10⁹ and 50 GB figures are arithmetic, not measurements — 50,001 windows × 50,000 elements, and up to k entries shifted on every update.
<br><br><b>The middle row is the trap.</b> A sorted array keeps every update O(log k) to <em>find</em> the slot, then pays an insert that shifts everything after it. The array is only a few hundred KB, so it stays in cache and a laptop finishes in well under two seconds — but the judge timed the identical code out on 3321. Heaps touch O(log n) scattered entries and never shift anything, so the honest complexity and the measured time finally agree.</figcaption>`,
      my: `<table>
  <thead><tr><th>နည်းလမ်း</th><th>window တစ်ခုစီအတွက် အလုပ်</th><th>n = 50 (3318)</th><th>n = 100k, k = 50k (3321)</th></tr></thead>
  <tbody>
    <tr><td><b>Brute force</b><br><span class="faint">window တိုင်း tally + sort လုပ်သည်</span></td>
        <td class="mono">O(k + d log d)</td><td class="tick">ချက်ချင်း</td><td class="cross">~5 × 10⁹ element ကြည့်ရသည်</td></tr>
    <tr><td><b>Sliding window</b><br><span class="faint">စင်များကို sorted array ဖြင့်</span></td>
        <td class="mono">O(log k) နှိုင်းယှဉ်မှု<br>+ k အထိ ရွှေ့ခြင်း</td><td class="tick">ချက်ချင်း</td><td class="mid">ဤစက်တွင် 0.22–1.86 s၊ သို့သော် memmove ~50 GB<br>→ judge တွင် TLE</td></tr>
    <tr><td><b>Sliding window</b><br><span class="faint">စင်အတူတူကို lazy heap ဖြင့်</span></td>
        <td class="mono">O(log n)၊ pointer သက်သက်</td><td class="tick">ချက်ချင်း</td><td class="tick">ဤစက်တွင် 0.05–0.12 s</td></tr>
  </tbody>
</table>
<figcaption>အချိန်များသည် Apple M5 Pro ပေါ်တွင် Ruby၊ Python နှင့် JavaScript listing များကို အစမှအဆုံး run ထားခြင်း ဖြစ်သည် (n = 100,000, k = 50,000, x = 100၊ တန်ဖိုး 10⁹ အထိ) — စတင်ချိန် ပါဝင်သည်။ 5 × 10⁹ နှင့် 50 GB ဂဏန်းများမှာ တိုင်းတာချက်မဟုတ်ဘဲ တွက်ချက်မှုသာ ဖြစ်သည် — window 50,001 ခု × element 50,000 စီ၊ update တိုင်း entry k ခုအထိ ရွှေ့ခြင်း။
<br><br><b>အလယ်အတန်းသည် ထောင်ချောက်ဖြစ်သည်။</b> sorted array တွင် နေရာ<em>ရှာ</em>ရန် O(log k) သာကုန်သော်လည်း ထို့နောက် နောက်ကပါသမျှကို ရွှေ့ပေးရသည့် insert ကို ပေးဆပ်ရသည်။ array မှာ KB ရာဂဏန်းသာရှိသဖြင့် cache ထဲတွင် နေနိုင်ပြီး laptop တွင် နှစ်စက္ကန့်အောက်ဖြင့် ပြီးသည် — သို့သော် judge က ထို code အတိအကျကို 3321 တွင် TLE ပေးခဲ့သည်။ heap များမှာမူ O(log n) entry များကိုသာ ထိပြီး ဘာမှ မရွှေ့ရသဖြင့် အမှန်တကယ့် complexity နှင့် တိုင်းတာချက် နောက်ဆုံးတွင် ကိုက်ညီသွားသည်။</figcaption>`,
    },
  },
  part3Sub: { en: 'Two algorithms, three implementations, in five languages. <b>Brute force</b> recounts each window. <b>Sliding window</b> appears twice &mdash; the same algorithm and the same two shelves, once with <b>sorted arrays</b> (clearer, fine for 3318) and once with <b>lazy heaps</b> (a faster container, what 3321 needs). Every block is a complete submission, run here against 20,006 cases at 3318\'s limits; the heap versions also against 3,002 more at 3321\'s scale.', my: 'algorithm 2 မျိုး၊ implementation 3 ခု၊ ဘာသာစကား 5 မျိုး။ <b>Brute force</b> က window တိုင်းကို ပြန်ရေတွက်သည်။ <b>Sliding window</b> ကို နှစ်ကြိမ် ပြထားသည် — algorithm အတူတူ၊ စင်နှစ်ခု အတူတူဖြစ်ပြီး တစ်ခါ <b>sorted array</b> ဖြင့် (ပိုရှင်းသည်၊ 3318 အတွက် လုံလောက်သည်)၊ နောက်တစ်ခါ <b>lazy heap</b> ဖြင့် (ပိုမြန်သော container၊ 3321 အတွက် လိုအပ်သည်)။ block တိုင်းသည် ပြည့်စုံသော submission ဖြစ်ပြီး 3318 ၏ ကန့်သတ်ချက်အတွင်း case 20,006 ခုဖြင့် run ထားသည် — heap ပုံစံများကို 3321 အရွယ်ရှိ case 3,002 ခုဖြင့်ပါ run ထားသည်။' },
  footer: { en: '<kbd>&larr;</kbd> <kbd>&rarr;</kbd> step &middot; <kbd>space</kbd> play/pause. Edit <code>nums</code>, <code>k</code> or <code>x</code> above — up to 12 values — and all three walkthroughs rebuild against your input.', my: '<kbd>&larr;</kbd> <kbd>&rarr;</kbd> အဆင့်ရွှေ့ရန် &middot; <kbd>space</kbd> စတင်/ရပ်။ အထက်ရှိ <code>nums</code>, <code>k</code> သို့မဟုတ် <code>x</code> ကို ပြင်လိုက်ပါက (တန်ဖိုး 12 ခုအထိ) လမ်းညွှန် 3 ခုလုံး သင့်ထည့်သွင်းချက်အတိုင်း ပြန်တည်ဆောက်သည်။' },
};
