/* Behaviour for the x-sum walkthrough, lifted verbatim from the standalone
   page. The translation table and the IIFE were two <script> blocks there;
   as one module the IIFE closes over the table instead of reading a global. */

var I18N_STATIC = {
 "LeetCode 3318 &nbsp;·&nbsp; and its hard twin 3321": "LeetCode 3318 &nbsp;·&nbsp; နှင့် Hard ဗားရှင်း 3321",
 "Every length-<code>k</code> window has an <em>x-sum</em>: keep only the <code>x</code> most frequent values, add up their occurrences. One solution recounts each window from scratch; the other carries a running total as the window slides.": "အရှည် <code>k</code> ရှိသော window တိုင်းမှာ <em>x-sum</em> တစ်ခုစီ ရှိသည် — အများဆုံးပေါ်သော တန်ဖိုး <code>x</code> ခုကိုသာ ထားပြီး ၎င်းတို့ပေါ်သည့် အကြိမ်များကို ပေါင်းလိုက်ခြင်းဖြစ်သည်။ ဖြေရှင်းနည်းတစ်ခုက window တိုင်းကို အစမှ ပြန်ရေတွက်သည်။ နောက်တစ်ခုကမူ window ရွေ့သွားသည်နှင့်အမျှ စုစုပေါင်းကို သယ်ဆောင်သွားသည်။",
 "<b>1</b> The question": "<b>1</b> မေးခွန်း",
 "<b>2</b> The answer": "<b>2</b> အဖြေ",
 "The question": "မေးခွန်း",
 "Read the statement, then drag <code>x</code> until the rule clicks.": "မေးခွန်းကို အရင်ဖတ်ပါ။ ပြီးလျှင် စည်းမျဉ်းကို သဘောပေါက်သည်အထိ <code>x</code> ကို ဆွဲကြည့်ပါ။",
 "The answer, step by step": "အဖြေ — အဆင့်ဆင့်",
 "Two algorithms, three walkthroughs &mdash; the sliding window appears twice, once per container. The stage shows the state; the panel shows the line running.": "algorithm 2 မျိုး၊ လမ်းညွှန် 3 ခု — sliding window ကို container တစ်မျိုးစီအတွက် နှစ်ကြိမ် ပြထားသည်။ ဘယ်ဘက်က အခြေအနေကို ပြပြီး၊ ညာဘက် panel က အလုပ်လုပ်နေသော code ကြောင်းကို ပြသည်။",
 "The problem": "ပုစ္ဆာ",
 "quoted from LeetCode": "LeetCode မှ ကူးယူဖော်ပြသည်",
 "You are given an array <code>nums</code> of <code>n</code> integers and two integers <code>k</code> and <code>x</code>.": "integer <code>n</code> လုံးပါသော array <code>nums</code> နှင့် integer နှစ်လုံးဖြစ်သည့် <code>k</code> နှင့် <code>x</code> ကို ပေးထားသည်။",
 "The <b>x-sum</b> of an array is calculated by the following procedure:": "array တစ်ခု၏ <b>x-sum</b> ကို အောက်ပါအဆင့်များဖြင့် တွက်ယူသည် —",
 "Count the occurrences of all elements in the array.": "array ထဲရှိ element အားလုံး ပေါ်သည့်အကြိမ်ရေကို ရေတွက်ပါ။",
 "Keep only the occurrences of the top <code>x</code> most frequent elements. If two elements have the same number of occurrences, the element with the <b>bigger value</b> is considered more frequent.": "အများဆုံးပေါ်သော element <code>x</code> ခု၏ အကြိမ်များကိုသာ ထားပါ။ element နှစ်ခု၏ အကြိမ်ရေ တူညီနေပါက <b>တန်ဖိုးပိုကြီးသော</b> element ကို ပိုများသည်ဟု သတ်မှတ်သည်။",
 "Calculate the sum of the resulting array.": "ကျန်ရစ်သော array ၏ စုစုပေါင်းကို တွက်ပါ။",
 "Note that if an array has less than <code>x</code> distinct elements, its x-sum is the sum of the array.": "မှတ်ချက် — array တစ်ခုတွင် ကွဲပြားသော element အရေအတွက်သည် <code>x</code> ထက်နည်းပါက ၎င်း၏ x-sum မှာ array တစ်ခုလုံး၏ ပေါင်းလဒ်ပင် ဖြစ်သည်။",
 "Return an integer array <code>answer</code> of length <code>n - k + 1</code> where <code>answer[i]</code> is the x-sum of the subarray <code>nums[i..i + k - 1]</code>.": "အရှည် <code>n - k + 1</code> ရှိသော integer array <code>answer</code> ကို ပြန်ပေးပါ။ <code>answer[i]</code> သည် subarray <code>nums[i..i + k - 1]</code> ၏ x-sum ဖြစ်သည်။",
 "Drag x, watch what survives": "x ကို ဆွဲကြည့်ပါ — ဘာကျန်မလဲ ကြည့်ပါ",
 "keep x =": "ထားမည့် x =",
 "Example 1": "ဥပမာ 1",
 "Example 2": "ဥပမာ 2",
 "<b>Input</b> <code>nums = [1,1,2,2,3,4,2,3]</code>, <code>k = 6</code>, <code>x = 2</code>": "<b>ထည့်သွင်းချက်</b> <code>nums = [1,1,2,2,3,4,2,3]</code>, <code>k = 6</code>, <code>x = 2</code>",
 "<b>Input</b> <code>nums = [3,8,7,8,7,5]</code>, <code>k = 2</code>, <code>x = 2</code>": "<b>ထည့်သွင်းချက်</b> <code>nums = [3,8,7,8,7,5]</code>, <code>k = 2</code>, <code>x = 2</code>",
 "<b>Output</b> <code class=\"out\">[6,10,12]</code>": "<b>ရလဒ်</b> <code class=\"out\">[6,10,12]</code>",
 "<b>Output</b> <code class=\"out\">[11,15,15,15,12]</code>": "<b>ရလဒ်</b> <code class=\"out\">[11,15,15,15,12]</code>",
 "<code>[1,1,2,2,3,4]</code> keeps 1 and 2 &rarr; 1+1+2+2 = <b>6</b>": "<code>[1,1,2,2,3,4]</code> တွင် 1 နှင့် 2 ကျန်သည် &rarr; 1+1+2+2 = <b>6</b>",
 "<code>[1,2,2,3,4,2]</code> keeps 2 and 4 &rarr; 2+2+2+4 = <b>10</b>. 4 survives because it beats 3 and 1, which occur the same number of times.": "<code>[1,2,2,3,4,2]</code> တွင် 2 နှင့် 4 ကျန်သည် &rarr; 2+2+2+4 = <b>10</b>။ 3 နှင့် 1 တို့သည် အကြိမ်ရေတူညီသောကြောင့် တန်ဖိုးပိုကြီးသည့် 4 က ကျန်ရစ်သည်။",
 "<code>[2,2,3,4,2,3]</code> keeps 2 and 3 &rarr; 2+2+2+3+3 = <b>12</b>": "<code>[2,2,3,4,2,3]</code> တွင် 2 နှင့် 3 ကျန်သည် &rarr; 2+2+2+3+3 = <b>12</b>",
 "Here <code>k == x</code>, so a window can never hold more than <code>x</code> distinct values and nothing is ever dropped.": "ဤတွင် <code>k == x</code> ဖြစ်သောကြောင့် window တစ်ခုတွင် ကွဲပြားသောတန်ဖိုး <code>x</code> ခုထက် ဘယ်တော့မှ မပိုနိုင်ဘဲ ဘာမှလည်း မဖယ်ရပါ။",
 "Every answer is just the sum of the window: 3+8, 8+7, 7+8, 8+7, 7+5.": "အဖြေတိုင်းသည် window ၏ ပေါင်းလဒ်သာ ဖြစ်သည် — 3+8, 8+7, 7+8, 8+7, 7+5။",
 "A good sanity check &mdash; if your code disagrees here, the \"fewer than x distinct\" rule is wrong.": "စစ်ဆေးရန် ကောင်းသော ဥပမာ — ဤနေရာတွင် သင့် code မကိုက်ပါက “x ထက်နည်းသော ကွဲပြားတန်ဖိုး” စည်းမျဉ်းကို မှားနေခြင်းဖြစ်သည်။",
 "Load into the stepper &darr;": "လမ်းညွှန်ထဲ ထည့်ကြည့်ရန် &darr;",
 "Three ways the statement bites &mdash; worth reading before you code": "မေးခွန်းက ထောင်ချောက်ဆင်ထားသည့် နည်း 3 မျိုး — code မရေးခင် ဖတ်သင့်သည်",
 "<b>\"More frequent\" means (count, then value).</b> Rank by count alone on Example 1 and you get <code>[6,<span class=\"bad\">7</span>,12]</code> &mdash; the first window still passes, so the bug hides until the second.": "<b>“ပိုများသည်” ဆိုသည်မှာ (count အရင်၊ ပြီးမှ value) ဖြစ်သည်။</b> ဥပမာ 1 တွင် count ချည်းသာ စီကြည့်လျှင် <code>[6,<span class=\"bad\">7</span>,12]</code> ရလိမ့်မည် — ပထမ window က မှန်နေသေးသဖြင့် bug က ဒုတိယအထိ ပုန်းနေသည်။",
 "<b>Fewer than <code>x</code> distinct values is not an error.</b> Nothing is dropped and the x-sum is the whole window, as in Example 2.": "<b>ကွဲပြားတန်ဖိုး <code>x</code> ထက်နည်းခြင်းသည် error မဟုတ်ပါ။</b> ဘာမှမဖယ်ဘဲ x-sum မှာ window တစ်ခုလုံး၏ ပေါင်းလဒ် ဖြစ်သည် — ဥပမာ 2 အတိုင်းပင်။",
 "<b>On 3321 the sums need 64 bits.</b> k &times; max value reaches 5&times;10<sup>13</sup>, well past a 32-bit int &mdash; this bites in C++, Java and Rust, though Go's <code>int</code> is already 64-bit.": "<b>3321 တွင် ပေါင်းလဒ်များအတွက် 64 bit လိုအပ်သည်။</b> k &times; အမြင့်ဆုံးတန်ဖိုး သည် 5&times;10<sup>13</sup> အထိ ရောက်သဖြင့် 32-bit int ကို ကျော်လွန်သည် — C++, Java နှင့် Rust တွင် ဤပြဿနာ တက်တတ်သည်။ Go ၏ <code>int</code> မှာမူ 64-bit ဖြစ်နှင့်ပြီးသား ဖြစ်သည်။",
 "nums": "nums",
 "k &mdash; window": "k &mdash; window အရွယ်",
 "x &mdash; keep": "x &mdash; ထားမည့်အရေအတွက်",
 "load an example": "ဥပမာ ထည့်ရန်",
 "Pick a walkthrough": "လမ်းညွှန်တစ်ခု ရွေးပါ",
 "Brute force": "Brute force",
 "Recount every window from scratch": "window တိုင်းကို အစမှ ပြန်ရေတွက်သည်",
 "Sliding window <span class=\"sub-name\">&middot; sorted arrays</span>": "Sliding window <span class=\"sub-name\">&middot; sorted array</span>",
 "Shelves kept in order. The clear version, fine for 3318.": "စင်များကို အစဉ်လိုက် စီထားသည်။ နားလည်ရလွယ်ပြီး 3318 အတွက် လုံလောက်သည်။",
 "Sliding window <span class=\"sub-name\">&middot; lazy heaps</span>": "Sliding window <span class=\"sub-name\">&middot; lazy heap</span>",
 "The version that passes 3321. Watch stale entries pile up.": "3321 ကို အောင်မြင်စေသော ပုံစံ။ stale entry များ စုပုံလာပုံကို ကြည့်ပါ။",
 "&lsaquo; Back": "&lsaquo; နောက်သို့",
 "Play": "စတင်ရန်",
 "Next &rsaquo;": "ရှေ့သို့ &rsaquo;",
 "The array": "array",
 "answer": "answer",
 "The code, live": "code — တိုက်ရိုက်",
 "If you are implementing it": "ကိုယ်တိုင် ရေးမည်ဆိုပါက",
 "Three questions the sliding window raises": "sliding window က ဖြစ်ပေါ်စေသော မေးခွန်း 3 ခု",
 "Why lift the card off the shelf <em>before</em> changing its count?": "count မပြောင်းခင် ကတ်ကို စင်ပေါ်က <em>အရင်</em> ဘာကြောင့် ဆွဲထုတ်ရသနည်း။",
 "A card's position on a shelf is its rank, and its rank <em>is</em> its count. Bump the count first and the card is filed under a key it no longer has &mdash; the binary search looks in the new spot, misses, and both shelves quietly rot.": "ကတ်တစ်ခု စင်ပေါ်မှာရှိသည့် နေရာက သူ့အဆင့်ဖြစ်ပြီး၊ အဆင့်ဆိုသည်မှာ သူ့ count ပင် ဖြစ်သည်။ count ကို အရင်ပြောင်းလိုက်လျှင် ကတ်သည် သူ့တွင်မရှိတော့သော key အောက်မှာ ရှိနေလိမ့်မည် — binary search က နေရာအသစ်မှာ ရှာပြီး မတွေ့သဖြင့် စင်နှစ်ခုလုံး တိတ်တဆိတ် ပျက်စီးသွားသည်။",
 "Why does the updated card always go back to REST?": "ပြင်ပြီးသား ကတ်ကို ဘာကြောင့် REST ထဲ အမြဲပြန်ထည့်ရသနည်း။",
 "Because then <code>rebalance</code> is the only function that knows the invariant, so it is the only place that can break it. No branching on whether the card outranks anything &mdash; drop it in the cheap place and let one function sort it out.": "ထိုသို့လုပ်ခြင်းဖြင့် invariant ကို သိသော function မှာ <code>rebalance</code> တစ်ခုတည်းသာ ဖြစ်သွားပြီး၊ ချိုးဖျက်နိုင်သည့် နေရာလည်း တစ်ခုတည်းသာ ရှိတော့သည်။ ကတ်က တခြားဟာတွေထက် သာမသာ စစ်စရာမလိုဘဲ — ကုန်ကျမှုအနည်းဆုံးနေရာမှာ ချလိုက်ပြီး function တစ်ခုတည်းကို ရှင်းခိုင်းလိုက်သည်။",
 "Can the swap loop ping-pong forever?": "swap loop သည် အဆုံးမရှိ အပြန်အလှန် လဲနေနိုင်သလား။",
 "No. It only runs when <code>up &gt; down</code>, and <code>up</code> is still sitting in REST after the demote, so the promoted card is never the one just dropped. Each swap strictly raises TOP's rank sum, so it terminates &mdash; in practice after one pass.": "မဖြစ်ပါ။ <code>up &gt; down</code> ဖြစ်မှသာ အလုပ်လုပ်ပြီး၊ demote လုပ်ပြီးချိန်တွင် <code>up</code> က REST ထဲမှာ ကျန်နေဆဲဖြစ်သဖြင့် အတင်ခံရသော ကတ်သည် ခုနချလိုက်သည့် ကတ် ဘယ်တော့မှ မဖြစ်နိုင်ပါ။ swap တစ်ကြိမ်တိုင်း TOP ၏ အဆင့်ပေါင်းလဒ်ကို တိုးစေသဖြင့် ရပ်သွားသည် — လက်တွေ့တွင် တစ်ကြိမ်တည်းနှင့် ပြီးလေ့ရှိသည်။",
 "Why bother": "ဘာကြောင့် ဒုက္ခခံရသနည်း",
 "The same answer, a different price": "အဖြေတူသော်လည်း ကုန်ကျစရိတ် ကွာသည်",
 "Approach": "နည်းလမ်း",
 "Work per window": "window တစ်ခုစီအတွက် အလုပ်",
 "n = 50 (this problem)": "n = 50 (ဤပုစ္ဆာ)",
 "n = 100k, k = 50k (3321)": "n = 100k, k = 50k (3321)",
 "instant": "ချက်ချင်း",
 "Copy": "ကူးယူရန်",
 "Tie storm": "သရေ များသော ဥပမာ",
 "Single keeper": "တစ်ခုတည်းသာ ထားမည်",
 "tally + sort, every window": "window တိုင်း tally + sort လုပ်သည်",
 "shelves as sorted arrays": "စင်များကို sorted array ဖြင့်",
 "same shelves as lazy heaps": "စင်အတူတူကို lazy heap ဖြင့်",
 "O(log k) compares<br><span style=\"color:var(--down)\">+ a splice of up to k</span>": "O(log k) နှိုင်းယှဉ်မှု<br><span style=\"color:var(--down)\">+ k အထိ splice</span>",
 "O(log n), pointers only": "O(log n)၊ pointer သက်သက်",
 "~5 × 10⁹ element visits": "~5 × 10⁹ element ကြည့်ရသည်",
 "0.60 s here, but ~50 GB<br>of memmove → TLE on the judge": "ဤစက်တွင် 0.60 s၊ သို့သော် memmove ~50 GB<br>→ judge တွင် TLE",
 "0.05 s — accepted": "0.05 s — အောင်မြင်သည်",
 "ran here &middot; 25k random cases": "ဤစက်တွင် စမ်းပြီး &middot; ကျပန်း 25k",
 "ran here &middot; 20k random cases": "ဤစက်တွင် စမ်းပြီး &middot; ကျပန်း 20k",
 "go vet + ran here &middot; 25k cases": "go vet + ဤစက်တွင် စမ်းပြီး &middot; 25k",
 "rustc -O + ran here &middot; 25k cases": "rustc -O + ဤစက်တွင် စမ်းပြီး &middot; 25k",
 "<kbd>&larr;</kbd> <kbd>&rarr;</kbd> step &middot; <kbd>space</kbd> play/pause. Edit <code>nums</code>, <code>k</code> or <code>x</code> above and all three walkthroughs rebuild against your input.": "<kbd>&larr;</kbd> <kbd>&rarr;</kbd> အဆင့်ရွှေ့ရန် &middot; <kbd>space</kbd> စတင်/ရပ်။ အထက်ရှိ <code>nums</code>, <code>k</code> သို့မဟုတ် <code>x</code> ကို ပြင်လိုက်ပါက လမ်းညွှန် 3 ခုလုံး သင့်ထည့်သွင်းချက်အတိုင်း ပြန်တည်ဆောက်သည်။",
 "The whole Easy answer. <code>max_by(x)</code> takes the top x directly, and returns everything when there are fewer than x distinct values.": "Easy အဆင့်၏ အဖြေ အပြည့်အစုံ။ <code>max_by(x)</code> က ထိပ်ဆုံး x ခုကို တိုက်ရိုက်ယူပြီး၊ ကွဲပြားတန်ဖိုး x ထက်နည်းပါက အားလုံးကို ပြန်ပေးသည်။",
 "The two shelves as sorted arrays — the version the stepper animates. Readable, and fast enough for n ≤ 50.": "စင်နှစ်ခုကို sorted array ဖြင့် — လမ်းညွှန်တွင် ပြသနေသည့် ပုံစံ။ ဖတ်ရလွယ်ပြီး n ≤ 50 အတွက် လုံလောက်စွာ မြန်သည်။",
 "<b>The submission that passes 3321.</b> Same invariants, no memmove. 0.05 s at n = 100,000 where the array version needs 0.60 s of cache-resident luck.": "<b>3321 ကို အောင်မြင်စေသော submission။</b> invariant အတူတူဖြစ်ပြီး memmove မလိုပါ။ n = 100,000 တွင် 0.05 s ကြာပြီး၊ array ပုံစံမှာမူ cache ထဲ ဝင်နေသည့်တိုင် 0.60 s ကြာသည်။",
 "<code>Counter</code> plus a sort keyed on <code>(count, value)</code> with <code>reverse=True</code>.": "<code>Counter</code> နှင့်အတူ <code>(count, value)</code> ကို key ထားပြီး <code>reverse=True</code> ဖြင့် စီသည်။",
 "<code>bisect.insort</code> keeps both shelves ordered; <code>bisect_left</code> finds the stale entry to lift out.": "<code>bisect.insort</code> က စင်နှစ်ခုလုံးကို အစဉ်လိုက် ထိန်းထားသည်။ ဆွဲထုတ်ရမည့် stale entry ကို <code>bisect_left</code> ဖြင့် ရှာသည်။",
 "<b>The submission that passes 3321.</b> <code>heapq</code> is a min-heap, so REST stores negated keys. 0.04 s at n = 100,000.": "<b>3321 ကို အောင်မြင်စေသော submission။</b> <code>heapq</code> သည် min-heap ဖြစ်သဖြင့် REST တွင် key များကို အနုတ်လက္ခဏာဖြင့် သိမ်းသည်။ n = 100,000 တွင် 0.04 s။",
 "A <code>Map</code> tally, then sort by count and break ties on value.": "<code>Map</code> ဖြင့် ရေတွက်ပြီး count ဖြင့် စီကာ သရေကျပါက value ဖြင့် ဖြတ်သည်။",
 "Binary search plus <code>splice</code> — JavaScript has no sorted container, so the shelves are plain arrays.": "binary search နှင့် <code>splice</code> — JavaScript တွင် sorted container မရှိသဖြင့် စင်များမှာ array သက်သက် ဖြစ်သည်။",
 "<b>The submission that passes 3321.</b> Includes a small binary heap — JS has none built in. Note the packing uses multiplication: <code>&lt;&lt;</code> is 32-bit and would overflow. 0.01 s at n = 100,000.": "<b>3321 ကို အောင်မြင်စေသော submission။</b> JS တွင် heap ပါမလာသဖြင့် binary heap လေးတစ်ခု ထည့်ထားသည်။ key ပေါင်းစည်းရာတွင် မြှောက်ခြင်းကို သုံးသည် — <code>&lt;&lt;</code> သည် 32-bit ဖြစ်၍ ကျော်လွန်သွားမည်။ n = 100,000 တွင် 0.01 s။",
 "<code>sort.Slice</code> with the two-level comparison written out.": "<code>sort.Slice</code> ဖြင့် နှစ်ဆင့် နှိုင်းယှဉ်မှုကို အပြည့်အစုံ ရေးထားသည်။",
 "<code>sort.Search</code> finds the slot, <code>copy</code> opens the gap. Returns <code>[]int</code> for 3318.": "<code>sort.Search</code> က နေရာကို ရှာပြီး <code>copy</code> က နေရာလွတ် ဖန်တီးပေးသည်။ 3318 အတွက် <code>[]int</code> ပြန်ပေးသည်။",
 "<b>The submission that passes 3321.</b> A hand-rolled <code>int64</code> min-heap rather than <code>container/heap</code>, to keep it parallel with the other languages and skip the interface boilerplate. 0.01 s at n = 100,000.": "<b>3321 ကို အောင်မြင်စေသော submission။</b> အခြားဘာသာစကားများနှင့် တစ်ပုံစံတည်း ဖြစ်စေရန်နှင့် interface boilerplate ကို ရှောင်ရန် <code>container/heap</code> အစား <code>int64</code> min-heap ကို ကိုယ်တိုင် ရေးထားသည်။ n = 100,000 တွင် 0.01 s။",
 "<code>windows(k)</code> plus tuple <code>Ord</code> — <code>(count, value)</code> sorted descending is the ranking rule with no comparator. Returns <code>Vec&lt;i32&gt;</code>, which is right for 3318's value range but would overflow on 3321's.": "<code>windows(k)</code> နှင့် tuple <code>Ord</code> — <code>(count, value)</code> ကို ကြီးစဉ်ငယ်လိုက် စီလိုက်ရုံဖြင့် comparator မလိုဘဲ အဆင့်သတ်မှတ်ချက် ရသည်။ <code>Vec&lt;i32&gt;</code> ပြန်ပေးပြီး၊ 3318 ၏ တန်ဖိုးအတိုင်းအတာအတွက် မှန်သော်လည်း 3321 တွင် ကျော်လွန်သွားမည်။",
 "<code>Vec::binary_search</code> returns <code>Err(at)</code> on a miss — exactly the insertion index.": "<code>Vec::binary_search</code> က မတွေ့ပါက <code>Err(at)</code> ပြန်ပေးသည် — ထည့်သွင်းရမည့် index အတိအကျပင်။",
 "<b>The submission that passes 3321.</b> <code>BinaryHeap</code> is a max-heap, so TOP wraps its keys in <code>Reverse</code> and REST stores them bare — no negation needed. 0.01 s at n = 100,000.": "<b>3321 ကို အောင်မြင်စေသော submission။</b> <code>BinaryHeap</code> သည် max-heap ဖြစ်သဖြင့် TOP က key များကို <code>Reverse</code> ဖြင့် ထုပ်ပြီး REST က အတိုင်းသိမ်းသည် — အနုတ်လက္ခဏာ မလိုပါ။ n = 100,000 တွင် 0.01 s။",
 "Timings are real runs on one machine (n = 100,000, k = 50,000, x = 100, values up to 10⁹), each verified against the brute force on tens of thousands of randomized cases; the 5 × 10⁹ figure is arithmetic, not a measurement — 50,001 windows × 50,000 elements each. <br><br><b>The middle row is the trap.</b> A sorted array keeps every update O(log k) to <em>find</em> the slot, then pays an <span class=\"mono\">Array#insert</span> that shifts everything after it. At k = 50,000 that is ~50 GB of memmove over a full run — but the array is only ~400 KB, so it lives in L2 cache and finishes in 0.6 s on an M-series laptop. The judge's memory is not that kind, which is why the identical code that looks fast locally times out on 3321. Heaps touch O(log n) scattered pointers instead and never shift anything, so the honest complexity and the measured time finally agree.": "အချိန်များသည် စက်တစ်လုံးတည်းတွင် အမှန်တကယ် တိုင်းတာထားခြင်းဖြစ်သည် (n = 100,000, k = 50,000, x = 100၊ တန်ဖိုး 10⁹ အထိ)။ တစ်ခုချင်းစီကို ကျပန်း case သောင်းနှင့်ချီ၍ brute force နှင့် တိုက်စစ်ပြီးဖြစ်သည်။ 5 × 10⁹ ဂဏန်းမှာမူ တိုင်းတာချက်မဟုတ်ဘဲ တွက်ချက်မှုသာဖြစ်သည် — window 50,001 ခု × element 50,000 စီ။ <br><br><b>အလယ်အတန်းသည် ထောင်ချောက်ဖြစ်သည်။</b> sorted array တွင် နေရာ<em>ရှာ</em>ရန် O(log k) သာကုန်သော်လည်း၊ ထို့နောက် နောက်ကပါသမျှကို ရွှေ့ပေးရသည့် <span class=\"mono\">Array#insert</span> ကို ပေးဆပ်ရသည်။ k = 50,000 တွင် တစ်ပတ်လုံးအတွက် memmove ~50 GB ရှိသည် — သို့သော် array မှာ ~400 KB သာရှိသဖြင့် L2 cache ထဲတွင် နေနိုင်ပြီး M-series laptop တွင် 0.6 s ဖြင့် ပြီးသည်။ judge ၏ memory မှာ ထိုမျှ သက်သာသည်မဟုတ်၍ ဤနေရာတွင် မြန်သည်ဟု ထင်ရသော code အတိအကျပင် 3321 တွင် TLE ဖြစ်သွားခြင်းဖြစ်သည်။ heap များမှာမူ O(log n) pointer များကိုသာ ထိပြီး ဘာမှ မရွှေ့ရသဖြင့် အမှန်တကယ့် complexity နှင့် တိုင်းတာချက် နောက်ဆုံးတွင် ကိုက်ညီသွားသည်။",
 "The whole solution": "solution အပြည့်အစုံ",
 "<b>3</b> The code": "<b>3</b> code",
 "Two algorithms, three implementations, in five languages. <b>Brute force</b> recounts each window. <b>Sliding window</b> appears twice &mdash; the same algorithm and the same two shelves, once with <b>sorted arrays</b> (clearer, fine for 3318) and once with <b>lazy heaps</b> (a faster container, what 3321 needs). Every block is a complete submission, compiled and run here against both examples plus 25,000 randomized cases.": "algorithm 2 မျိုး၊ implementation 3 ခု၊ ဘာသာစကား 5 မျိုး။ <b>Brute force</b> က window တိုင်းကို ပြန်ရေတွက်သည်။ <b>Sliding window</b> ကို နှစ်ကြိမ် ပြထားသည် — algorithm အတူတူ၊ စင်နှစ်ခု အတူတူဖြစ်ပြီး တစ်ခါ <b>sorted array</b> ဖြင့် (ပိုရှင်းသည်၊ 3318 အတွက် လုံလောက်သည်)၊ နောက်တစ်ခါ <b>lazy heap</b> ဖြင့် (ပိုမြန်သော container၊ 3321 အတွက် လိုအပ်သည်)။ block တိုင်းသည် ပြည့်စုံသော submission ဖြစ်ပြီး ဥပမာနှစ်ခုအပြင် ကျပန်း case 25,000 ဖြင့် ဤစက်တွင် စမ်းသပ်ပြီးဖြစ်သည်။"
};

(function(){
  "use strict";

  /* ---------------- ranking: [count, value] ascending ---------------- */
  var cmp = function(a,b){ return (a.c-b.c) || (a.v-b.v); };
  var lower = function(arr,e){
    var lo=0, hi=arr.length;
    while(lo<hi){ var m=(lo+hi)>>1; if(cmp(arr[m],e)<0) lo=m+1; else hi=m; }
    return lo;
  };
  var insert = function(arr,e){ arr.splice(lower(arr,e),0,e); };
  var remove = function(arr,e){
    var i=lower(arr,e);
    if(i<arr.length && arr[i].v===e.v && arr[i].c===e.c){ arr.splice(i,1); return true; }
    return false;
  };
  var face = function(e){ return e.v+"×"+e.c; };


  /* ---------------- messages, per language ----------------
     Code identifiers, TOP/REST, and the terms Burmese developers write in
     English (window, heap, array, count, value, stale, root) stay in Latin. */
  var MSG = {
    en: {
      empty: "empty",
      tipUnset: "not set at this step",
      shelves: "Two shelves", heaps: "Two heaps",
      rankedBy: "ranked by [count, value]",
      topNote: function(x,n){ return "the "+x+" that count · "+n+"/"+x; },
      restNote: "in the window, out of the sum",
      barrier: "barrier · every TOP card outranks every REST card",
      barrierBroken: "barrier broken — swap incoming",
      nothingKept: "nothing kept yet",
      sumIs: "@sum &nbsp;=&nbsp; ",
      rootsOnly: "only the roots are ever read",
      topHeapNote: function(live,total,size,x){ return "root = weakest kept · "+live+" of "+total+" entries live · set is "+size+"/"+x; },
      restHeapNote: function(live,total){ return "root = strongest dropped · "+live+" of "+total+" entries live"; },
      stale: function(now){ return now ? "stale · now "+now : "stale · gone"; },
      heapLedger: "@sum tracks the TOP set, not the heap contents",
      windowFromScratch: function(i){ return "Window "+i+" from scratch"; },
      tallyHead: function(k){ return "tally — one pass over all "+k+" elements"; },
      notCounted: "not counted yet",
      rankHead: function(n){ return "rank by [count, value], keep "+n; },
      notRanked: "not ranked yet",
      sumHead: "sum the survivors",
      cutKeep: function(n){ return "cut · keep "+n; },
      windowsDone: function(n,total){ return n+" of "+total+" windows"; },
      valuesDistinct: function(n,d){ return n+" values, "+d+" distinct"; },
      qNothing: "nothing kept",
      qTie: function(a,b,c,decides){
        return "Tie: "+a+" and "+b+" both appear "+c+(c===1?" time":" times")
             + ", so "+a+" ranks higher for being the bigger value"
             + (decides ? " — and that is exactly what decides which one survives here." : "."); },
      qPreset: ["example 1, window 0","example 1, window 1","example 2","every value ties","one value dominates"],

      bfWindow: function(i,win){ return "Window "+i+" = ["+win+"]. Everything learned about the last window is thrown away — this one starts from nothing."; },
      bfTally: function(k,list){ return "<code>tally</code> walks all "+k+" elements and counts them: "+list+"."; },
      bfRankHead: function(first){ return "Sort by <code>[count, value]</code> descending"+(first?": <code>"+first+"</code> ranks first.":"."); },
      bfTie: function(a,b,c,cut){ return " <b>"+a+"</b> and <b>"+b+"</b> both appear "+c+(c===1?" time":" times")
             + ", so "+a+" ranks higher for being the bigger value"
             + (cut ? " — which is what decides the cut here." : "."); },
      bfNoTie: " Nothing ties in this window, so the counts alone settle the order.",
      bfSum: function(keep,expr,sum){ return "Keep the top "+keep+": "+expr+" = <code>"+sum+"</code>. Then drop it all and do it again."; },

      swDetach: function(v,face,inTop,gain){ return v+" is already on the board as <code>"+face+"</code>. Lift that card off <b>before</b> the count changes — its rank is its count."
             + (inTop ? " It was in TOP, so the running sum gives back "+gain+"." : ""); },
      swGone: function(v){ return "<code>count["+v+"] = 0</code> — "+v+" is out of the window entirely, so the card is gone."; },
      swInsert: function(v,c){ return "<code>count["+v+"] = "+c+"</code>. Re-enter at the bottom of REST — no thinking about where it belongs, <code>rebalance</code> decides."; },
      swFill: function(n,x,face,add,sum){ return "TOP still has room ("+n+"/"+x+") — promote <code>"+face+"</code>. sum += "+add+" → <code>"+sum+"</code>."; },
      swViolation: function(up,down,uc,uv,dc,dv){ return "Barrier broken. REST's best <code>"+up+"</code> outranks TOP's weakest <code>"+down+"</code> — <code>["+uc+", "+uv+"] &gt; ["+dc+", "+dv+"]</code>. They trade places."; },
      swDemote: function(face,sub,sum){ return "Demote <code>"+face+"</code>. sum −= "+sub+" → <code>"+sum+"</code>."; },
      swPromote: function(face,add,sum){ return "Promote <code>"+face+"</code>. sum += "+add+" → <code>"+sum+"</code>."; },
      swRecord: function(win,sum){ return "Window ["+win+"] is complete → x-sum <code>"+sum+"</code>. Nothing was recounted; the total has been correct the whole way."; },

      hpDetachTop: function(v,gain,face){ return v+" leaves the TOP set, so the sum gives back "+gain+". Its heap entry <code>"+face+"</code> is <b>left where it is</b> — removing from the middle of a heap is expensive, so it just goes stale."; },
      hpDetachRest: function(v,face){ return v+" is in REST as <code>"+face+"</code>. Nothing is removed — that entry simply becomes stale the moment the count changes."; },
      hpGone: function(v){ return "<code>count["+v+"] = 0</code> — "+v+" is out of the window. Every entry for it is now stale."; },
      hpPush: function(v,c,face){ return "<code>count["+v+"] = "+c+"</code>. Push a fresh <code>"+face+"</code> into the REST heap."; },
      hpDiscardRest: function(face,v,now){ return "REST's root <code>"+face+"</code> is stale — "+v+" "
             + (now ? "now has "+now+" occurrence"+(now===1?"":"s") : "is gone from the window")
             + ". Throw the entry away and look at the new root."; },
      hpDiscardTop: function(face){ return "TOP's root <code>"+face+"</code> is stale — discard it and look again."; },
      hpPromote: function(face,add,sum){ return "Promote <code>"+face+"</code> into TOP. sum += "+add+" → <code>"+sum+"</code>."; },
      hpDemote: function(face,sub,sum){ return "Demote <code>"+face+"</code> into REST. sum −= "+sub+" → <code>"+sum+"</code>."; },
      hpViolation: function(best,weakest){ return "REST's live root <code>"+best+"</code> outranks TOP's live root <code>"+weakest+"</code>. Swap them."; },
      hpRecord: function(win,sum){ return "Window ["+win+"] → x-sum <code>"+sum+"</code>. Stale entries are still sitting in the heaps — they cost nothing until they reach a root."; }
    },

    my: {
      empty: "ဘာမှမရှိ",
      tipUnset: "ဤအဆင့်တွင် မသတ်မှတ်ရသေး",
      shelves: "စင်နှစ်ခု", heaps: "heap နှစ်ခု",
      rankedBy: "[count, value] ဖြင့် အဆင့်သတ်မှတ်သည်",
      topNote: function(x,n){ return "အရေးပါသော "+x+" ခု · "+n+"/"+x; },
      restNote: "window ထဲရှိသော်လည်း ပေါင်းလဒ်ထဲ မပါ",
      barrier: "အကန့် · TOP ကတ်တိုင်းသည် REST ကတ်တိုင်းထက် အဆင့်မြင့်သည်",
      barrierBroken: "အကန့် ကျိုးသွားပြီ — နေရာလဲရတော့မည်",
      nothingKept: "ဘာမှ မကျန်သေး",
      sumIs: "@sum &nbsp;=&nbsp; ",
      rootsOnly: "root များကိုသာ ဖတ်သည်",
      topHeapNote: function(live,total,size,x){ return "root = ထားထားသည့်အထဲ အားအနည်းဆုံး · entry "+total+" ခုအနက် "+live+" ခု live · အစု "+size+"/"+x; },
      restHeapNote: function(live,total){ return "root = ဖယ်ထားသည့်အထဲ အကောင်းဆုံး · entry "+total+" ခုအနက် "+live+" ခု live"; },
      stale: function(now){ return now ? "stale · ယခု "+now : "stale · ထွက်သွားပြီ"; },
      heapLedger: "@sum က heap ထဲရှိအရာများကို မဟုတ်ဘဲ TOP အစုကိုသာ မှတ်သည်",
      windowFromScratch: function(i){ return "Window "+i+" ကို အစမှ ပြန်စသည်"; },
      tallyHead: function(k){ return "tally — element "+k+" ခုလုံးကို တစ်ခေါက် လျှောက်သည်"; },
      notCounted: "မရေတွက်ရသေး",
      rankHead: function(n){ return "[count, value] ဖြင့် အဆင့်ခွဲပြီး "+n+" ခု ထားသည်"; },
      notRanked: "အဆင့် မခွဲရသေး",
      sumHead: "ကျန်ရစ်သူများကို ပေါင်းသည်",
      cutKeep: function(n){ return "ဖြတ်မျဉ်း · "+n+" ခု ထားသည်"; },
      windowsDone: function(n,total){ return "window "+total+" ခုအနက် "+n+" ခု"; },
      valuesDistinct: function(n,d){ return "တန်ဖိုး "+n+" ခု၊ ကွဲပြားမှု "+d+" မျိုး"; },
      qNothing: "ဘာမှ မကျန်",
      qTie: function(a,b,c,decides){
        return "သရေ — "+a+" နှင့် "+b+" နှစ်ခုလုံး "+c+" ကြိမ်စီ ပေါ်သည်။ ထို့ကြောင့် တန်ဖိုးပိုကြီးသော "+a+" က အဆင့်ပိုမြင့်သည်"
             + (decides ? " — ဤနေရာတွင် ဘယ်ဟာကျန်မည်ကို ဆုံးဖြတ်ပေးသည်မှာ ဤအချက်ပင်။" : "။"); },
      qPreset: ["ဥပမာ 1၊ window 0","ဥပမာ 1၊ window 1","ဥပမာ 2","တန်ဖိုးအားလုံး သရေကျ","တစ်ခုတည်းက လွှမ်းမိုး"],

      bfWindow: function(i,win){ return "Window "+i+" = ["+win+"]။ ယခင် window မှ သိထားသမျှကို အကုန်စွန့်ပြီး ဤတစ်ခုကို အစမှ ပြန်စသည်။"; },
      bfTally: function(k,list){ return "<code>tally</code> သည် element "+k+" ခုလုံးကို လျှောက်ပြီး ရေတွက်သည် — "+list+"။"; },
      bfRankHead: function(first){ return "<code>[count, value]</code> ကို ကြီးစဉ်ငယ်လိုက် စီလိုက်သည်"+(first?" — <code>"+first+"</code> က ထိပ်ဆုံးရောက်သည်။":"။"); },
      bfTie: function(a,b,c,cut){ return " <b>"+a+"</b> နှင့် <b>"+b+"</b> နှစ်ခုလုံး "+c+" ကြိမ်စီ ပေါ်သည်။ ထို့ကြောင့် တန်ဖိုးပိုကြီးသော "+a+" က အဆင့်ပိုမြင့်သည်"
             + (cut ? " — ဤနေရာတွင် ဖြတ်မျဉ်းကို ဆုံးဖြတ်ပေးသည်မှာ ဤအချက်ပင်။" : "။"); },
      bfNoTie: " ဤ window တွင် သရေမရှိသဖြင့် အရေအတွက်ချည်းဖြင့်ပင် အစီအစဉ် ကျသည်။",
      bfSum: function(keep,expr,sum){ return "ထိပ်ဆုံး "+keep+" ခုကို ထားလိုက်သည် — "+expr+" = <code>"+sum+"</code>။ ပြီးလျှင် အားလုံးကို စွန့်ပြီး နောက် window တွင် ပြန်လုပ်သည်။"; },

      swDetach: function(v,face,inTop,gain){ return v+" သည် <code>"+face+"</code> အဖြစ် ရှိနှင့်ပြီးသား ဖြစ်သည်။ count မပြောင်းမီ ထိုကတ်ကို <b>အရင်ဆွဲထုတ်</b>ပါ — အဆင့်ဆိုသည်မှာ count ပင်ဖြစ်သည်။"
             + (inTop ? " TOP ထဲတွင် ရှိခဲ့သဖြင့် စုစုပေါင်းမှ "+gain+" ကို ပြန်နုတ်သည်။" : ""); },
      swGone: function(v){ return "<code>count["+v+"] = 0</code> — "+v+" သည် window ထဲမှ လုံးဝထွက်သွားသဖြင့် ကတ်လည်း ပျောက်သွားသည်။"; },
      swInsert: function(v,c){ return "<code>count["+v+"] = "+c+"</code>။ REST ၏ အောက်ဆုံးမှ ပြန်ထည့်လိုက်သည် — မည်သည့်နေရာသို့ သွားသင့်သည်ကို မစဉ်းစားဘဲ <code>rebalance</code> ကို ဆုံးဖြတ်စေသည်။"; },
      swFill: function(n,x,face,add,sum){ return "TOP တွင် နေရာလွတ် ကျန်သေးသည် ("+n+"/"+x+") — <code>"+face+"</code> ကို တင်လိုက်သည်။ sum += "+add+" → <code>"+sum+"</code>။"; },
      swViolation: function(up,down,uc,uv,dc,dv){ return "အကန့် ကျိုးသွားပြီ။ REST ၏ အကောင်းဆုံး <code>"+up+"</code> သည် TOP ၏ အားအနည်းဆုံး <code>"+down+"</code> ထက် အဆင့်မြင့်သည် — <code>["+uc+", "+uv+"] &gt; ["+dc+", "+dv+"]</code>။ နေရာချင်း လဲလိုက်သည်။"; },
      swDemote: function(face,sub,sum){ return "<code>"+face+"</code> ကို အောက်ချလိုက်သည်။ sum −= "+sub+" → <code>"+sum+"</code>။"; },
      swPromote: function(face,add,sum){ return "<code>"+face+"</code> ကို အပေါ်တင်လိုက်သည်။ sum += "+add+" → <code>"+sum+"</code>။"; },
      swRecord: function(win,sum){ return "Window ["+win+"] ပြီးပါပြီ → x-sum <code>"+sum+"</code>။ ဘာမှ ပြန်မရေတွက်ခဲ့ရဘဲ စုစုပေါင်းသည် အစကတည်းက မှန်နေခဲ့သည်။"; },

      hpDetachTop: function(v,gain,face){ return v+" သည် TOP အစုမှ ထွက်သွားသဖြင့် စုစုပေါင်းမှ "+gain+" ကို ပြန်နုတ်သည်။ သူ၏ heap entry <code>"+face+"</code> ကိုမူ <b>မဖယ်ဘဲ ထားလိုက်သည်</b> — heap အလယ်မှ ဖယ်ထုတ်ရန် ကုန်ကျစရိတ်များသဖြင့် stale ဖြစ်သွားအောင် ပစ်ထားလိုက်ခြင်းဖြစ်သည်။"; },
      hpDetachRest: function(v,face){ return v+" သည် REST ထဲတွင် <code>"+face+"</code> အဖြစ် ရှိသည်။ ဘာမှ မဖယ်ထုတ်ပါ — count ပြောင်းသည်နှင့် ထို entry သည် stale ဖြစ်သွားရုံသာ ဖြစ်သည်။"; },
      hpGone: function(v){ return "<code>count["+v+"] = 0</code> — "+v+" သည် window ထဲမှ ထွက်သွားပြီ။ သူနှင့်သက်ဆိုင်သော entry အားလုံး stale ဖြစ်ကုန်ပြီ။"; },
      hpPush: function(v,c,face){ return "<code>count["+v+"] = "+c+"</code>။ အသစ်ဖြစ်သော <code>"+face+"</code> ကို REST heap ထဲသို့ ထည့်လိုက်သည်။"; },
      hpDiscardRest: function(face,v,now){ return "REST ၏ root <code>"+face+"</code> သည် stale ဖြစ်နေပြီ — "+v+" သည် "
             + (now ? "ယခု "+now+" ကြိမ် ရှိသည်" : "window ထဲမှ ထွက်သွားပြီ")
             + "။ ထို entry ကို ပစ်လိုက်ပြီး root အသစ်ကို ကြည့်သည်။"; },
      hpDiscardTop: function(face){ return "TOP ၏ root <code>"+face+"</code> သည် stale ဖြစ်နေပြီ — ပစ်လိုက်ပြီး ပြန်ကြည့်သည်။"; },
      hpPromote: function(face,add,sum){ return "<code>"+face+"</code> ကို TOP ထဲသို့ တင်လိုက်သည်။ sum += "+add+" → <code>"+sum+"</code>။"; },
      hpDemote: function(face,sub,sum){ return "<code>"+face+"</code> ကို REST ထဲသို့ ချလိုက်သည်။ sum −= "+sub+" → <code>"+sum+"</code>။"; },
      hpViolation: function(best,weakest){ return "REST ၏ live root <code>"+best+"</code> သည် TOP ၏ live root <code>"+weakest+"</code> ထက် အဆင့်မြင့်သည်။ နေရာချင်း လဲလိုက်သည်။"; },
      hpRecord: function(win,sum){ return "Window ["+win+"] → x-sum <code>"+sum+"</code>။ stale entry များ heap ထဲတွင် ကျန်နေသေးသည် — root အထိ မရောက်မချင်း ကုန်ကျမှု မရှိပါ။"; }
    }
  };

  function t(key){
    var table = (MSG[ui] && MSG[ui][key] !== undefined) ? MSG[ui] : MSG.en;
    var entry = table[key];
    if(typeof entry !== "function") return entry;
    return entry.apply(null, Array.prototype.slice.call(arguments, 1));
  }

  /* ---------------- brute force: rebuild every window ---------------- */
  function buildBrute(nums,k,x){
    var steps=[], answer=[];
    for(var i=0; i+k<=nums.length; i++){
      var win = nums.slice(i,i+k);
      var counts = new Map();
      win.forEach(function(v){ counts.set(v,(counts.get(v)||0)+1); });
      var ranked = Array.from(counts, function(p){ return {v:p[0], c:p[1]}; })
                        .sort(function(a,b){ return cmp(b,a); });        // strongest first
      var kept = ranked.slice(0,x);
      var sum  = kept.reduce(function(s,e){ return s+e.v*e.c; },0);
      var base = {mode:"bf", lo:i, hi:i+k-1, win:win, ranked:ranked, keep:kept.length,
                  sum:sum, answer:answer.slice(), op:"window "+i,
                  vars:{ i:i, k:k, x:x, nums:nums, window:win,
                         counts:ranked.slice().sort(function(a,b){ return a.v-b.v; }),
                         ranked:ranked, kept:kept, sum:sum, answer:answer.slice() }};
      steps.push(Object.assign({},base,{stage:0,phase:"window",line:"bf-window",
        msg:t("bfWindow", i, win.join(", "))}));
      steps.push(Object.assign({},base,{stage:1,phase:"tally",line:"bf-tally",
        msg:t("bfTally", k, ranked.map(face).join(", "))}));
      var keep = Math.min(x, ranked.length), tie = "";
      for(var ti=1;ti<ranked.length;ti++){
        if(ranked[ti].c === ranked[ti-1].c){
          tie = t("bfTie", ranked[ti-1].v, ranked[ti].v, ranked[ti].c, ti===keep);
          break;
        }
      }
      if(!tie) tie = t("bfNoTie");
      steps.push(Object.assign({},base,{stage:2,phase:"rank",line:"bf-rank",
        msg:t("bfRankHead", ranked.length>1 ? face(ranked[0]) : "")+tie}));
      answer.push(sum);
      steps.push(Object.assign({},base,{stage:3,phase:"sum",line:"bf-sum",answer:answer.slice(),
        msg:t("bfSum", Math.min(x,ranked.length), kept.map(function(e){return e.v+"×"+e.c;}).join(" + "), sum)}));
    }
    return steps;
  }

  /* ---------------- sliding window: two shelves, running sum ---------------- */
  function buildSlide(nums,k,x){
    var steps=[], answer=[], count=new Map();
    var top=[], rest=[], sum=0;
    var ctx={lo:0, hi:-1, op:"", enter:-1, leave:-1};
    var cur={};
    var clone=function(a){ return a.map(function(e){ return {v:e.v,c:e.c}; }); };

    function snap(msg,phase,line,hl){
      steps.push({mode:"sw", msg:msg, phase:phase, line:line, hl:hl||{},
        top:clone(top), rest:clone(rest), sum:sum, keep:x,
        lo:ctx.lo, hi:ctx.hi, op:ctx.op, enter:ctx.enter, leave:ctx.leave,
        answer:answer.slice(),
        vars:{ counts:Array.from(count, function(e){ return {v:e[0], c:e[1]}; }),
               top:clone(top), rest:clone(rest), sum:sum, x:x, k:k,
               nums:nums, answer:answer.slice(),
               value:cur.value, delta:cur.delta, count:cur.count, entry:cur.entry }});
    }

    function adjust(v, delta){
      var c0 = count.get(v)||0;
      cur.value=v; cur.delta=delta; cur.count=c0; cur.entry=c0>0?{v:v,c:c0}:null;
      if(c0>0){
        var stale={v:v,c:c0};
        var inTop = remove(top,stale);
        if(inTop) sum -= v*c0; else remove(rest,stale);
        snap(t("swDetach", v, face(stale), inTop, v*c0),
             "detach","detach",{ghost:stale, fromTop:inTop});
      }
      var c1 = c0+delta;
      cur.count=c1;
      if(c1===0){
        count.delete(v);
        snap(t("swGone", v),"tally","insert",{});
      } else {
        count.set(v,c1);
        insert(rest,{v:v,c:c1});
        snap(t("swInsert", v, c1),"tally","insert",{fresh:{v:v,c:c1}});
      }
      while(top.length<x && rest.length){
        var e=rest.pop(); insert(top,e); sum += e.v*e.c;
        snap(t("swFill", top.length, x, face(e), e.v*e.c, sum),"promote","fill",{up:e});
      }
      while(rest.length && top.length && cmp(rest[rest.length-1], top[0])>0){
        var up=rest[rest.length-1], down=top[0];
        snap(t("swViolation", face(up), face(down), up.c, up.v, down.c, down.v),"swap","violation",{cmpUp:up, cmpDown:down});
        var d=top.shift(); insert(rest,d); sum -= d.v*d.c;
        snap(t("swDemote", face(d), d.v*d.c, sum),"demote","demote",{down:d});
        var u=rest.pop(); insert(top,u); sum += u.v*u.c;
        snap(t("swPromote", face(u), u.v*u.c, sum),"promote","promote",{up:u});
      }
    }

    nums.forEach(function(v,i){
      ctx.hi=i; ctx.lo=Math.max(0,i-k); ctx.op="add "+v; ctx.enter=i; ctx.leave=-1;
      if(i<k) ctx.lo=0;
      adjust(v,+1);
      if(i>=k){
        ctx.op="del "+nums[i-k]; ctx.enter=-1; ctx.leave=i-k;
        adjust(nums[i-k],-1);
        ctx.leave=-1;
      }
      ctx.lo=Math.max(0,i-k+1); ctx.enter=-1; ctx.leave=-1;
      if(i>=k-1){
        answer.push(sum);
        snap(t("swRecord", nums.slice(ctx.lo,i+1).join(", "), sum),"record","record",{done:true});
      }
    });
    return steps;
  }


  /* ---------------- sliding window, lazy heaps ---------------- */
  function buildHeaps(nums,k,x){
    var steps=[], answer=[];
    var count=new Map(), inTop=new Set(), topSize=0, sum=0;
    var top=[], rest=[];                       // binary heaps of {v,c}
    var ctx={lo:0,hi:-1,op:"",enter:-1,leave:-1};
    var cur={};
    var minAtRoot=function(a,b){ return cmp(a,b); };   // TOP: weakest kept on top
    var maxAtRoot=function(a,b){ return cmp(b,a); };   // REST: strongest dropped on top

    function push(h,e,order){
      h.push(e);
      var i=h.length-1;
      while(i>0){
        var parent=(i-1)>>1;
        if(order(h[parent],h[i])<=0) break;
        var t=h[parent]; h[parent]=h[i]; h[i]=t; i=parent;
      }
    }
    function pop(h,order){
      var root=h[0], last=h.pop();
      if(h.length){
        h[0]=last;
        var i=0, n=h.length;
        for(;;){
          var child=2*i+1;
          if(child>=n) break;
          if(child+1<n && order(h[child+1],h[child])<0) child++;
          if(order(h[child],h[i])>=0) break;
          var t=h[child]; h[child]=h[i]; h[i]=t; i=child;
        }
      }
      return root;
    }
    var liveTop=function(e){ return inTop.has(e.v) && count.get(e.v)===e.c; };
    var liveRest=function(e){ return !inTop.has(e.v) && count.get(e.v)===e.c; };

    function snap(msg,phase,line,hl){
      steps.push({mode:"hp", msg:msg, phase:phase, line:line, hl:hl||{},
        vars:{ counts:Array.from(count, function(e){ return {v:e[0], c:e[1]}; }),
               top:top.map(function(e){ return {v:e.v,c:e.c}; }),
               rest:rest.map(function(e){ return {v:e.v,c:e.c}; }),
               sum:sum, x:x, k:k, nums:nums, answer:answer.slice(),
               inTop:Array.from(inTop), topSize:topSize,
               value:cur.value, delta:cur.delta, count:cur.count, entry:cur.entry },
        top:top.map(function(e){ return {v:e.v,c:e.c,live:liveTop(e),now:count.get(e.v)||0}; }),
        rest:rest.map(function(e){ return {v:e.v,c:e.c,live:liveRest(e),now:count.get(e.v)||0}; }),
        sum:sum, topSize:topSize, keep:x,
        lo:ctx.lo, hi:ctx.hi, op:ctx.op, enter:ctx.enter, leave:ctx.leave,
        answer:answer.slice()});
    }

    function restPeek(){
      while(rest.length){
        var e=rest[0];
        if(liveRest(e)) return e;
        snap(t("hpDiscardRest", face(e), e.v, count.get(e.v)||0),
             "discard","discard",{discarded:{v:e.v,c:e.c}});
        pop(rest,maxAtRoot);
      }
      return null;
    }
    function topPeek(){
      while(top.length){
        var e=top[0];
        if(liveTop(e)) return e;
        snap(t("hpDiscardTop", face(e)),
             "discard","discard",{discarded:{v:e.v,c:e.c}});
        pop(top,minAtRoot);
      }
      return null;
    }
    function promote(e){
      inTop.add(e.v); topSize++; sum += e.v*e.c; push(top,e,minAtRoot);
      snap(t("hpPromote", face(e), e.v*e.c, sum),"promote","promote",{up:e});
    }
    function demote(e){
      inTop["delete"](e.v); topSize--; sum -= e.v*e.c; push(rest,e,maxAtRoot);
      snap(t("hpDemote", face(e), e.v*e.c, sum),"demote","demote",{down:e});
    }

    function adjust(v,delta){
      var c0=count.get(v)||0;
      cur.value=v; cur.delta=delta; cur.count=c0; cur.entry=c0>0?{v:v,c:c0}:null;
      if(c0>0 && inTop.has(v)){
        sum -= c0*v; inTop["delete"](v); topSize--;
        snap(t("hpDetachTop", v, c0*v, face({v:v,c:c0})),
             "detach","detach",{stale:{v:v,c:c0}});
      } else if(c0>0){
        snap(t("hpDetachRest", v, face({v:v,c:c0})),
             "detach","detach",{stale:{v:v,c:c0}});
      }
      var c1=c0+delta;
      cur.count=c1;
      if(c1===0){
        count["delete"](v);
        snap(t("hpGone", v),"tally","insert",{});
      } else {
        count.set(v,c1);
        push(rest,{v:v,c:c1},maxAtRoot);
        snap(t("hpPush", v, c1, face({v:v,c:c1})),"tally","insert",{fresh:{v:v,c:c1}});
      }
      while(topSize<x){
        var best=restPeek();
        if(!best) break;
        promote(pop(rest,maxAtRoot));
      }
      for(;;){
        var best=restPeek();
        if(!best) break;
        var weakest=topPeek();
        if(!weakest) break;
        if(cmp(best,weakest)<=0) break;
        snap(t("hpViolation", face(best), face(weakest)),"swap","violation",{cmpUp:best,cmpDown:weakest});
        demote(pop(top,minAtRoot));
        promote(pop(rest,maxAtRoot));
      }
    }

    nums.forEach(function(v,i){
      ctx.hi=i; ctx.lo=Math.max(0,i-k); ctx.op="add "+v; ctx.enter=i; ctx.leave=-1;
      if(i<k) ctx.lo=0;
      adjust(v,+1);
      if(i>=k){
        ctx.op="del "+nums[i-k]; ctx.enter=-1; ctx.leave=i-k;
        adjust(nums[i-k],-1);
        ctx.leave=-1;
      }
      ctx.lo=Math.max(0,i-k+1); ctx.enter=-1; ctx.leave=-1;
      if(i>=k-1){
        answer.push(sum);
        snap(t("hpRecord", nums.slice(ctx.lo,i+1).join(", "), sum),"record","record",{done:true});
      }
    });
    return steps;
  }

  /* ---------------- code panels ---------------- */
  var CODE = {
    ruby: {
      hp: [
        ["",          'def adjust(value, delta)'],
        ["detach",    '  count = @count[value]'],
        ["detach",    '  if count > 0 &amp;&amp; @in_top[value]'],
        ["detach",    '    @sum -= count * value'],
        ["detach",    '    @in_top.delete(value) <span class="cm"># entry stays, now stale</span>'],
        ["detach",    '    @top_size -= 1'],
        ["detach",    '  end'],
        ["insert",    '  count += delta'],
        ["insert",    '  @count[value] = count'],
        ["insert",    '  hpush(@rest, -((count &lt;&lt; SHIFT) | value))'],
        ["fill",      '  rebalance'],
        ["",          'end'],
        ["",          ''],
        ["discard",   'def rest_peek        <span class="cm"># drop stale roots</span>'],
        ["discard",   '  while (neg = @rest[0])'],
        ["discard",   '    key = -neg; v = key &amp; MASK'],
        ["discard",   '    return key if !@in_top[v] &amp;&amp;'],
        ["discard",   '      @count[v] == key &gt;&gt; SHIFT'],
        ["discard",   '    hpop(@rest)        <span class="cm"># stale: bin it</span>'],
        ["discard",   '  end'],
        ["",          'end'],
        ["",          ''],
        ["fill",      'promote while @top_size &lt; @x &amp;&amp; rest_peek'],
        ["violation", 'while (r = rest_peek) &amp;&amp; (t = top_peek) &amp;&amp; r &gt; t'],
        ["demote",    '  hpop(@top); demote(t)'],
        ["promote",   '  hpop(@rest); promote(r)'],
        ["",          'end'],
        ["",          ''],
        ["record",    'answer &lt;&lt; window.sum if i &gt;= k - 1']
      ],
      bf: [
        ["", 'def find_x_sum(nums, k, x)'],
        ["bf-window", '  nums.each_cons(k).map do |window|'],
        ["bf-tally",  '    window.tally'],
        ["bf-rank",   '          .max_by(x) { |val, count| [count, val] }'],
        ["bf-sum",    '          .sum { |val, count| val * count }'],
        ["", '  end'],
        ["", 'end']
      ],
      sw: [
        ["", 'def adjust(value, delta)  <span class="cm"># +1 add / -1 del</span>'],
        ["detach", '  count = @count[value]'],
        ["detach", '  detach([count, value]) if count > 0'],
        ["insert", '  count += delta'],
        ["insert", '  @count[value] = count   <span class="cm"># 0 &rArr; delete</span>'],
        ["insert", '  insert(@rest, [count, value]) if count > 0'],
        ["fill",   '  rebalance'],
        ["", 'end'],
        ["", ''],
        ["fill",      'promote while @top.size &lt; @x &amp;&amp; @rest.any?'],
        ["violation", 'while (@rest.last &lt;=&gt; @top.first) &gt; 0'],
        ["demote",    '  demote'],
        ["promote",   '  promote'],
        ["", 'end'],
        ["", ''],
        ["promote", 'def promote        <span class="cm"># REST.best &rarr; TOP</span>'],
        ["promote", '  e = @rest.pop'],
        ["promote", '  insert(@top, e); @sum += e[0] * e[1]'],
        ["", 'end'],
        ["", ''],
        ["demote", 'def demote         <span class="cm"># TOP.weakest &rarr; REST</span>'],
        ["demote", '  e = @top.shift'],
        ["demote", '  insert(@rest, e); @sum -= e[0] * e[1]'],
        ["", 'end'],
        ["", ''],
        ["record", 'answer &lt;&lt; window.sum if i &gt;= k - 1']
      ]
    },

    python: {
      hp: [
        ["",          'def _adjust(self, value, delta):'],
        ["detach",    '    count = self.count.get(value, 0)'],
        ["detach",    '    if count and value in self.in_top:'],
        ["detach",    '        self.total -= count * value'],
        ["detach",    '        self.in_top.discard(value) <span class="cm"># entry stays</span>'],
        ["detach",    '        self.top_size -= 1'],
        ["insert",    '    count += delta'],
        ["insert",    '    self.count[value] = count'],
        ["insert",    '    heappush(self.rest,'],
        ["insert",    '             -((count &lt;&lt; SHIFT) | value))'],
        ["fill",      '    self._rebalance()'],
        ["",          ''],
        ["discard",   'def _rest_peek(self):   <span class="cm"># drop stale roots</span>'],
        ["discard",   '    while self.rest:'],
        ["discard",   '        key = -self.rest[0]'],
        ["discard",   '        v = key &amp; MASK'],
        ["discard",   '        if v not in self.in_top and \\'],
        ["discard",   '           self.count.get(v, 0) == key &gt;&gt; SHIFT:'],
        ["discard",   '            return key'],
        ["discard",   '        heappop(self.rest) <span class="cm"># stale: bin it</span>'],
        ["",          ''],
        ["fill",      'while self.top_size &lt; self.x:'],
        ["fill",      '    self._promote(best)'],
        ["violation", 'while best &gt; weakest:'],
        ["demote",    '    self._demote(weakest)'],
        ["promote",   '    self._promote(best)'],
        ["",          ''],
        ["record",    'answer.append(window.total)']
      ],
      sw: [
        ["",          'def _adjust(self, value, delta):'],
        ["detach",    '    count = self.count.get(value, 0)'],
        ["detach",    '    if count:'],
        ["detach",    '        self._detach((count, value))'],
        ["insert",    '    count += delta'],
        ["insert",    '    self.count[value] = count <span class="cm"># 0 &rArr; pop</span>'],
        ["insert",    '    insort(self.rest, (count, value))'],
        ["fill",      '    self._rebalance()'],
        ["",          ''],
        ["fill",      'while len(self.top) &lt; self.x and self.rest:'],
        ["fill",      '    self._promote()'],
        ["violation", 'while self.rest[-1] &gt; self.top[0]:'],
        ["demote",    '    self._demote()'],
        ["promote",   '    self._promote()'],
        ["",          ''],
        ["promote",   'def _promote(self):   <span class="cm"># REST.best &rarr; TOP</span>'],
        ["promote",   '    entry = self.rest.pop()'],
        ["promote",   '    insort(self.top, entry)'],
        ["promote",   '    self.total += entry[0] * entry[1]'],
        ["",          ''],
        ["demote",    'def _demote(self):    <span class="cm"># TOP.weakest &rarr; REST</span>'],
        ["demote",    '    entry = self.top.pop(0)'],
        ["demote",    '    insort(self.rest, entry)'],
        ["demote",    '    self.total -= entry[0] * entry[1]'],
        ["",          ''],
        ["record",    'answer.append(window.total)']
      ],
      bf: [
        ["bf-window", 'for i in range(len(nums) - k + 1):'],
        ["bf-tally",  '    counts = Counter(nums[i:i + k])'],
        ["bf-rank",   '    kept = sorted(counts.items(),'],
        ["bf-rank",   '                  key=lambda p: (p[1], p[0]),'],
        ["bf-rank",   '                  reverse=True)[:x]'],
        ["bf-sum",    '    answer.append('],
        ["bf-sum",    '        sum(v * c for v, c in kept))']
      ],
    },

    javascript: {
      hp: [
        ["",          'adjust(value, delta) {'],
        ["detach",    '  let count = this.count.get(value) || 0;'],
        ["detach",    '  if (count &gt; 0 &amp;&amp; this.inTop.has(value)) {'],
        ["detach",    '    this.sum -= count * value;'],
        ["detach",    '    this.inTop.delete(value); <span class="cm">// entry stays</span>'],
        ["detach",    '    this.topSize--;'],
        ["detach",    '  }'],
        ["insert",    '  count += delta;'],
        ["insert",    '  this.count.set(value, count);'],
        ["insert",    '  this.rest.push(-(count * SCALE + value));'],
        ["fill",      '  this.rebalance();'],
        ["",          '}'],
        ["",          ''],
        ["discard",   'restPeek() {              <span class="cm">// drop stale roots</span>'],
        ["discard",   '  for (;;) {'],
        ["discard",   '    const key = -this.rest.peek();'],
        ["discard",   '    const v = key % SCALE;'],
        ["discard",   '    if (!this.inTop.has(v) &amp;&amp;'],
        ["discard",   '        this.count.get(v) === Math.floor(key / SCALE))'],
        ["discard",   '      return key;'],
        ["discard",   '    this.rest.pop();      <span class="cm">// stale: bin it</span>'],
        ["discard",   '  }'],
        ["",          '}'],
        ["",          ''],
        ["fill",      'while (this.topSize &lt; this.x)'],
        ["fill",      '  this.promote(best);'],
        ["violation", 'while (best &gt; weakest) {'],
        ["demote",    '  this.demote(weakest);'],
        ["promote",   '  this.promote(best);'],
        ["",          '}'],
        ["",          ''],
        ["record",    'answer.push(window.sum);']
      ],
      sw: [
        ["",          'adjust(value, delta) {'],
        ["detach",    '  let count = this.count.get(value) || 0;'],
        ["detach",    '  if (count &gt; 0) this.detach([count, value]);'],
        ["insert",    '  count += delta;'],
        ["insert",    '  this.count.set(value, count);'],
        ["insert",    '  insert(this.rest, [count, value]);'],
        ["fill",      '  this.rebalance();'],
        ["",          '}'],
        ["",          ''],
        ["fill",      'while (this.top.length &lt; this.x &amp;&amp; this.rest.length)'],
        ["fill",      '  this.promote();'],
        ["violation", 'while (rank(last(this.rest), this.top[0]) &gt; 0) {'],
        ["demote",    '  this.demote();'],
        ["promote",   '  this.promote();'],
        ["",          '}'],
        ["",          ''],
        ["promote",   'promote() {            <span class="cm">// REST.best &rarr; TOP</span>'],
        ["promote",   '  const entry = this.rest.pop();'],
        ["promote",   '  insert(this.top, entry);'],
        ["promote",   '  this.sum += entry[0] * entry[1];'],
        ["",          '}'],
        ["",          ''],
        ["demote",    'demote() {             <span class="cm">// TOP.weakest &rarr; REST</span>'],
        ["demote",    '  const entry = this.top.shift();'],
        ["demote",    '  insert(this.rest, entry);'],
        ["demote",    '  this.sum -= entry[0] * entry[1];'],
        ["",          '}'],
        ["",          ''],
        ["record",    'answer.push(window.sum);']
      ],
      bf: [
        ["bf-window", 'for (let i = 0; i + k &lt;= nums.length; i++) {'],
        ["bf-tally",  '  const counts = new Map();'],
        ["bf-tally",  '  for (let j = i; j &lt; i + k; j++)'],
        ["bf-tally",  '    counts.set(nums[j],'],
        ["bf-tally",  '      (counts.get(nums[j]) || 0) + 1);'],
        ["bf-rank",   '  const ranked = [...counts].sort('],
        ["bf-rank",   '    (a, b) =&gt; b[1] - a[1] || b[0] - a[0]);'],
        ["bf-sum",    '  let sum = 0;'],
        ["bf-sum",    '  for (const [v, c] of ranked.slice(0, x))'],
        ["bf-sum",    '    sum += v * c;'],
        ["bf-sum",    '  answer.push(sum);'],
        ["", '}']
      ],
    },

    go: {
      hp: [
        ["",          'func (w *xSumWindow) adjust(value, delta int64) {'],
        ["detach",    '    count := w.count[value]'],
        ["detach",    '    if count &gt; 0 &amp;&amp; w.inTop[value] {'],
        ["detach",    '        w.sum -= count * value'],
        ["detach",    '        delete(w.inTop, value) <span class="cm">// entry stays</span>'],
        ["detach",    '        w.topSize--'],
        ["detach",    '    }'],
        ["insert",    '    count += delta'],
        ["insert",    '    w.count[value] = count'],
        ["insert",    '    w.rest.push(-((count &lt;&lt; shift) | value))'],
        ["fill",      '    w.rebalance()'],
        ["",          '}'],
        ["",          ''],
        ["discard",   'func (w *xSumWindow) restPeek() (int64, bool) {'],
        ["discard",   '    for w.rest.len() &gt; 0 {'],
        ["discard",   '        key := -w.rest.a[0]'],
        ["discard",   '        value := key &amp; mask'],
        ["discard",   '        if !w.inTop[value] &amp;&amp;'],
        ["discard",   '            w.count[value] == key&gt;&gt;shift {'],
        ["discard",   '            return key, true'],
        ["discard",   '        }'],
        ["discard",   '        w.rest.pop()       <span class="cm">// stale: bin it</span>'],
        ["discard",   '    }'],
        ["discard",   '    return 0, false'],
        ["",          '}'],
        ["",          ''],
        ["fill",      'for w.topSize &lt; w.x {'],
        ["fill",      '    w.promote(best)'],
        ["",          '}'],
        ["violation", 'for best &gt; weakest {'],
        ["demote",    '    w.demote(weakest)'],
        ["promote",   '    w.promote(best)'],
        ["",          '}'],
        ["",          ''],
        ["record",    'answer = append(answer, window.sum)']
      ],
      sw: [
        ["",          'func (w *xSumWindow) adjust(value, delta int) {'],
        ["detach",    '    count := w.count[value]'],
        ["detach",    '    if count &gt; 0 {'],
        ["detach",    '        w.detach(entry{count, value})'],
        ["detach",    '    }'],
        ["insert",    '    count += delta'],
        ["insert",    '    w.count[value] = count'],
        ["insert",    '    w.rest = insert(w.rest, entry{count, value})'],
        ["fill",      '    w.rebalance()'],
        ["",          '}'],
        ["",          ''],
        ["fill",      'for len(w.top) &lt; w.x &amp;&amp; len(w.rest) &gt; 0 {'],
        ["fill",      '    w.promote()'],
        ["",          '}'],
        ["violation", 'for less(w.top[0], w.rest[len(w.rest)-1]) {'],
        ["demote",    '    w.demote()'],
        ["promote",   '    w.promote()'],
        ["",          '}'],
        ["",          ''],
        ["promote",   'func (w *xSumWindow) promote() {'],
        ["promote",   '    e := w.rest[len(w.rest)-1]'],
        ["promote",   '    w.rest = w.rest[:len(w.rest)-1]'],
        ["promote",   '    w.top = insert(w.top, e)'],
        ["promote",   '    w.sum += e.count * e.value'],
        ["",          '}'],
        ["",          ''],
        ["demote",    'func (w *xSumWindow) demote() {'],
        ["demote",    '    e := w.top[0]'],
        ["demote",    '    w.top = w.top[1:]'],
        ["demote",    '    w.rest = insert(w.rest, e)'],
        ["demote",    '    w.sum -= e.count * e.value'],
        ["",          '}'],
        ["",          ''],
        ["record",    'answer = append(answer, window.sum)']
      ],
      bf: [
        ["bf-window", 'for i := 0; i+k &lt;= len(nums); i++ {'],
        ["bf-tally",  '    counts := make(map[int]int)'],
        ["bf-tally",  '    for _, v := range nums[i : i+k] {'],
        ["bf-tally",  '        counts[v]++'],
        ["bf-tally",  '    }'],
        ["bf-rank",   '    sort.Slice(ranked, func(a, b int) bool {'],
        ["bf-rank",   '        if ranked[a].count != ranked[b].count {'],
        ["bf-rank",   '            return ranked[a].count &gt; ranked[b].count'],
        ["bf-rank",   '        }'],
        ["bf-rank",   '        return ranked[a].value &gt; ranked[b].value'],
        ["bf-rank",   '    })'],
        ["bf-sum",    '    for r := 0; r &lt; x &amp;&amp; r &lt; len(ranked); r++ {'],
        ["bf-sum",    '        sum += ranked[r].value * ranked[r].count'],
        ["bf-sum",    '    }'],
        ["", '}']
      ],
    },

    rust: {
      hp: [
        ["",          'fn adjust(&amp;mut self, value: i64, delta: i64) {'],
        ["detach",    '    let mut count = self.count.get(&amp;value)'],
        ["detach",    '        .copied().unwrap_or(0);'],
        ["detach",    '    if count &gt; 0 &amp;&amp; self.in_top.contains(&amp;value) {'],
        ["detach",    '        self.sum -= count * value;'],
        ["detach",    '        self.in_top.remove(&amp;value); <span class="cm">// entry stays</span>'],
        ["detach",    '        self.top_size -= 1;'],
        ["detach",    '    }'],
        ["insert",    '    count += delta;'],
        ["insert",    '    self.count.insert(value, count);'],
        ["insert",    '    self.rest.push((count &lt;&lt; SHIFT) | value);'],
        ["fill",      '    self.rebalance();'],
        ["",          '}'],
        ["",          ''],
        ["discard",   'fn rest_peek(&amp;mut self) -&gt; Option&lt;i64&gt; {'],
        ["discard",   '    while let Some(&amp;key) = self.rest.peek() {'],
        ["discard",   '        let value = key &amp; MASK;'],
        ["discard",   '        if !self.in_top.contains(&amp;value)'],
        ["discard",   '            &amp;&amp; self.count.get(&amp;value).copied()'],
        ["discard",   '               == Some(key &gt;&gt; SHIFT) {'],
        ["discard",   '            return Some(key);'],
        ["discard",   '        }'],
        ["discard",   '        self.rest.pop();    <span class="cm">// stale: bin it</span>'],
        ["discard",   '    }'],
        ["discard",   '    None'],
        ["",          '}'],
        ["",          ''],
        ["fill",      'while self.top_size &lt; self.x {'],
        ["fill",      '    self.promote(best);'],
        ["",          '}'],
        ["violation", 'while best &gt; weakest {'],
        ["demote",    '    self.demote(weakest);'],
        ["promote",   '    self.promote(best);'],
        ["",          '}'],
        ["",          ''],
        ["record",    'answer.push(window.sum);']
      ],
      sw: [
        ["",          'fn adjust(&amp;mut self, value: i32, delta: i32) {'],
        ["detach",    '    let mut count = self.count.get(&amp;value)'],
        ["detach",    '        .copied().unwrap_or(0);'],
        ["detach",    '    if count &gt; 0 {'],
        ["detach",    '        self.detach((count, value));'],
        ["detach",    '    }'],
        ["insert",    '    count += delta;'],
        ["insert",    '    self.count.insert(value, count);'],
        ["insert",    '    insert(&amp;mut self.rest, (count, value));'],
        ["fill",      '    self.rebalance();'],
        ["",          '}'],
        ["",          ''],
        ["fill",      'while self.top.len() &lt; self.x &amp;&amp; !self.rest.is_empty() {'],
        ["fill",      '    self.promote();'],
        ["",          '}'],
        ["violation", 'while *self.rest.last().unwrap() &gt; self.top[0] {'],
        ["demote",    '    self.demote();'],
        ["promote",   '    self.promote();'],
        ["",          '}'],
        ["",          ''],
        ["promote",   'fn promote(&amp;mut self) {'],
        ["promote",   '    let entry = self.rest.pop().unwrap();'],
        ["promote",   '    insert(&amp;mut self.top, entry);'],
        ["promote",   '    self.sum += entry.0 * entry.1;'],
        ["",          '}'],
        ["",          ''],
        ["demote",    'fn demote(&amp;mut self) {'],
        ["demote",    '    let entry = self.top.remove(0);'],
        ["demote",    '    insert(&amp;mut self.rest, entry);'],
        ["demote",    '    self.sum -= entry.0 * entry.1;'],
        ["",          '}'],
        ["",          ''],
        ["record",    'answer.push(window.sum);']
      ],
      bf: [
        ["bf-window", 'nums.windows(k).map(|window| {'],
        ["bf-tally",  '    let mut counts: HashMap&lt;i32, i32&gt; ='],
        ["bf-tally",  '        HashMap::new();'],
        ["bf-tally",  '    for &amp;value in window {'],
        ["bf-tally",  '        *counts.entry(value).or_insert(0) += 1;'],
        ["bf-tally",  '    }'],
        ["bf-rank",   '    let mut ranked: Vec&lt;(i32, i32)&gt; = counts'],
        ["bf-rank",   '        .into_iter()'],
        ["bf-rank",   '        .map(|(value, count)| (count, value))'],
        ["bf-rank",   '        .collect();'],
        ["bf-rank",   '    ranked.sort_unstable_by(|a, b| b.cmp(a));'],
        ["bf-sum",    '    ranked.iter().take(x)'],
        ["bf-sum",    '        .map(|&amp;(count, value)| count * value)'],
        ["bf-sum",    '        .sum()'],
        ["", '}).collect()']
      ],
    }
  };

  var TIE_NOTE = {
    ruby: '<code>Array#&lt;=&gt;</code> compares <code>[count, value]</code> element by element, so the tiebreak costs no code.',
    python: 'The tuple key <code>(count, value)</code> carries the tiebreak &mdash; no comparator.',
    javascript: 'JavaScript has no tuple ordering (and <code>sort</code> would compare as strings), so the two-level comparator is written out.',
    go: 'Go has no tuple ordering for structs, so the two-level comparison is written out in the <code>sort.Slice</code> closure.',
    rust: 'Tuple <code>Ord</code> is lexicographic, so <code>b.cmp(a)</code> is the whole rule.'
  };
  var CODE_SUB_MY = {
    bf: 'solution အပြည့်အစုံ — window တိုင်းသည် tally အလွတ်ဖြင့် ပြန်စသည်။ <a href="#part-3">ကူးယူရန် &darr;</a>',
    sw: 'sorted array — ပုံထဲက စင်နှစ်ခု အတိအကျ။ အတိုချုံ့ထားသည် — <a href="#part-3">အပြည့်အစုံ &darr;</a>',
    hp: '<b>3321 ၏ အဖြေ။</b> update လုပ်စဉ် ဘာမှ မဖယ်ရှားဘဲ stale entry များကို root သို့ရောက်မှ ပစ်သည်။ အတိုချုံ့ထားသည် — <a href="#part-3">အပြည့်အစုံ &darr;</a>'
  };
  var TIE_NOTE_MY = {
    ruby: '<code>Array#&lt;=&gt;</code> သည် <code>[count, value]</code> ကို တစ်ခုချင်း နှိုင်းယှဉ်သဖြင့် သရေဖြေရှင်းရန် code ပိုမလိုပါ။',
    python: 'tuple key <code>(count, value)</code> ကိုယ်တိုင်က သရေကို ဖြေရှင်းပေးသည် — comparator မလိုပါ။',
    javascript: 'JavaScript တွင် tuple ordering မရှိသဖြင့် (<code>sort</code> က string အဖြစ် နှိုင်းယှဉ်မည်) နှစ်ဆင့် comparator ကို ကိုယ်တိုင် ရေးရသည်။',
    go: 'Go တွင် struct အတွက် tuple ordering မရှိသဖြင့် <code>sort.Slice</code> ထဲတွင် နှစ်ဆင့် နှိုင်းယှဉ်မှုကို ရေးထားရသည်။',
    rust: 'tuple <code>Ord</code> သည် lexicographic ဖြစ်သဖြင့် <code>b.cmp(a)</code> တစ်ခုတည်းနှင့် ပြီးသည်။'
  };
  var CODE_SUB = {
    bf: 'The whole solution &mdash; every window re-enters with an empty tally. <a href="#part-3">Copy it &darr;</a>',
    sw: 'Sorted arrays: the two shelves exactly as drawn. Abbreviated &mdash; <a href="#part-3">full source &darr;</a>',
    hp: '<b>The 3321 answer.</b> Nothing is removed on update; stale entries are dropped when they reach a root. Abbreviated &mdash; <a href="#part-3">full source &darr;</a>'
  };

  /* ---------------- state ---------------- */
  var ui = "en";
  var nums=[1,1,2,2,3,4,2,3], k=6, x=2;
  var runs={bf:[], sw:[], hp:[]};
  var at={bf:0, sw:0, hp:0};
  var mode="sw";
  var lang="ruby";
  var timer=null;

  var $=function(id){ return document.getElementById(id); };
  var esc=function(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;"); };

  function rebuild(){
    runs.bf = buildBrute(nums,k,x);
    runs.sw = buildSlide(nums,k,x);
    runs.hp = buildHeaps(nums,k,x);
    at.bf = 0; at.sw = 0; at.hp = 0;   // always open on step 1
    render();
  }

  /* ---------------- rendering ---------------- */
  function cardHTML(e, cls){
    return '<div class="kard '+(cls||"")+'"><span class="face">'+e.v+'<span class="x">×</span>'+e.c+'</span>'
         + '<span class="key">['+e.c+', '+e.v+']</span></div>';
  }

  function renderStrip(s){
    var html="";
    for(var i=0;i<nums.length;i++){
      var cls="cell";
      if(i>=s.lo && i<=s.hi) cls+=" inwin";
      if(s.enter===i) cls+=" entering";
      if(s.leave===i) cls+=" leaving";
      html += '<div class="'+cls+'"><span>'+nums[i]+'</span><span class="idx">'+i+'</span></div>';
    }
    $("strip").innerHTML = html;
    $("op").textContent = s.op || "";
  }

  function renderShelves(s){
    var top=s.top.slice().reverse(), rest=s.rest.slice().reverse();  // strongest first
    var hl=s.hl||{};
    var mark=function(e){
      if(hl.up && hl.up.v===e.v && hl.up.c===e.c) return "hl-up";
      if(hl.down && hl.down.v===e.v && hl.down.c===e.c) return "hl-down";
      if(hl.fresh && hl.fresh.v===e.v && hl.fresh.c===e.c) return "hl-new";
      if(hl.cmpUp && hl.cmpUp.v===e.v && hl.cmpUp.c===e.c) return "hl-cmp";
      if(hl.cmpDown && hl.cmpDown.v===e.v && hl.cmpDown.c===e.c) return "hl-cmp";
      return "";
    };
    var cards=function(list){
      return list.length ? list.map(function(e){ return cardHTML(e, mark(e)); }).join("")
                         : '<span class="empty">'+t("empty")+'</span>';
    };
    var broken = !!hl.cmpUp;
    var expr = s.top.length
      ? s.top.slice().reverse().map(function(e){ return e.v+"×"+e.c; }).join("  +  ")
      : t("nothingKept");

    $("stage").innerHTML =
      '<div class="panel-head"><h2>'+t("shelves")+'</h2><span class="note">'+t("rankedBy")+'</span></div>'
      + '<div class="shelf shelf-top"><div class="shelf-head"><span class="shelf-name">TOP</span>'
      + '<span class="shelf-note">'+t("topNote", x, s.top.length)+'</span></div>'
      + '<div class="cards">'+cards(top)+'</div></div>'
      + '<div class="barrier'+(broken?" broken":"")+'">'
      + (broken ? t("barrierBroken") : t("barrier"))
      + '</div>'
      + '<div class="shelf shelf-rest"><div class="shelf-head"><span class="shelf-name">REST</span>'
      + '<span class="shelf-note">'+t("restNote")+'</span></div>'
      + '<div class="cards">'+cards(rest)+'</div></div>'
      + '<div class="ledger"><span class="expr">'+t("sumIs")+expr+'</span>'
      + '<span class="total">'+s.sum+'<small>X-SUM</small></span></div>';
  }

  function renderBrute(s){
    var max = s.ranked.length ? s.ranked[0].c : 1;
    var bars = s.ranked.slice().sort(function(a,b){ return a.v-b.v; }).map(function(e){
      return '<div class="bar-row"><span>'+e.v+'</span><span class="bar-track">'
           + '<span class="bar-fill" style="width:'+Math.round(e.c/max*100)+'%"></span></span><span>'+e.c+'</span></div>';
    }).join("");
    var rankHTML = s.ranked.map(function(e,i){
      var out = "";
      if(i===s.keep && i>0) out += '<span class="cutline">'+t("cutKeep", s.keep)+'</span>';
      return out + cardHTML(e, i<s.keep ? "" : "dropped");
    }).join("");
    var kept = s.ranked.slice(0,s.keep);

    $("stage").innerHTML =
      '<div class="panel-head"><h2>'+t("windowFromScratch", s.lo)+'</h2><span class="note">['+s.win.join(", ")+']</span></div>'
      + '<div class="bf-steps">'
      + '<div class="bf-step '+(s.stage===1?"active":s.stage<1?"pending":"")+'">'
      +   '<h3><span class="n">1</span>'+t("tallyHead", k)+'</h3>'
      +   '<div class="bars">'+(s.stage>=1?bars:'<span class="empty">'+t("notCounted")+'</span>')+'</div></div>'
      + '<div class="bf-step '+(s.stage===2?"active":s.stage<2?"pending":"")+'">'
      +   '<h3><span class="n">2</span>'+t("rankHead", s.keep)+'</h3>'
      +   '<div class="rank">'+(s.stage>=2?rankHTML:'<span class="empty">'+t("notRanked")+'</span>')+'</div></div>'
      + '<div class="bf-step '+(s.stage===3?"active":s.stage<3?"pending":"")+'">'
      +   '<h3><span class="n">3</span>'+t("sumHead")+'</h3>'
      +   '<div class="ledger" style="margin:0;padding:0;border:0"><span class="expr">'
      +   (s.stage>=3 ? kept.map(function(e){ return e.v+"×"+e.c; }).join("  +  ") : "—")
      +   '</span><span class="total">'+(s.stage>=3?s.sum:"·")+'<small>X-SUM</small></span></div></div>'
      + '</div>';
  }


  function renderHeaps(s){
    var hl=s.hl||{};
    var mark=function(e){
      if(hl.discarded && hl.discarded.v===e.v && hl.discarded.c===e.c) return " is-going";
      if(hl.up && hl.up.v===e.v && hl.up.c===e.c) return " hl-up";
      if(hl.down && hl.down.v===e.v && hl.down.c===e.c) return " hl-down";
      if(hl.fresh && hl.fresh.v===e.v && hl.fresh.c===e.c) return " hl-new";
      if(hl.stale && hl.stale.v===e.v && hl.stale.c===e.c) return " hl-cmp";
      if(hl.cmpUp && hl.cmpUp.v===e.v && hl.cmpUp.c===e.c) return " hl-cmp";
      if(hl.cmpDown && hl.cmpDown.v===e.v && hl.cmpDown.c===e.c) return " hl-cmp";
      return "";
    };
    var card=function(e,index){
      var tag = e.live ? "" : '<span class="tag">'+t("stale", e.now)+'</span>';
      return '<div class="hcard'+(e.live?"":" is-stale")+(index===0?" is-root":"")+mark(e)+'">'
           + '<span class="face">'+e.v+'<span class="x">×</span>'+e.c+'</span>'
           + '<span class="key">['+e.c+', '+e.v+']</span>' + tag + '</div>';
    };
    var levels=function(list){
      var rows="", i=0, width=1;
      while(i<list.length){
        var slice=list.slice(i,i+width);
        rows += '<div class="heap-row">' + slice.map(function(e,j){ return card(e,i+j); }).join("") + '</div>';
        i+=width; width*=2;
      }
      return rows || '<span class="empty">'+t("empty")+'</span>';
    };
    var liveCount=function(list){ return list.filter(function(e){ return e.live; }).length; };

    $("stage").innerHTML =
      '<div class="panel-head"><h2>'+t("heaps")+'</h2><span class="note">'+t("rootsOnly")+'</span></div>'
      + '<div class="heap-block is-top"><div class="shelf-head">'
      +   '<span class="shelf-name">TOP heap</span>'
      +   '<span class="shelf-note">'+t("topHeapNote", s.topSize, s.top.length, s.topSize, s.keep)+'</span>'
      + '</div><div class="heap-rows">'+levels(s.top)+'</div></div>'
      + '<div class="heap-block is-rest"><div class="shelf-head">'
      +   '<span class="shelf-name">REST heap</span>'
      +   '<span class="shelf-note">'+t("restHeapNote", liveCount(s.rest), s.rest.length)+'</span>'
      + '</div><div class="heap-rows">'+levels(s.rest)+'</div></div>'
      + '<div class="ledger"><span class="expr">'+t("heapLedger")+'</span>'
      + '<span class="total">'+s.sum+'<small>X-SUM</small></span></div>';
  }


  /* ---------------- hoverable variables ---------------- */
  /* each language's spelling of the same handful of things */
  var VAR_MAP = {
    ruby: {"@count":"counts","@top":"top","@rest":"rest","@sum":"sum","@x":"x","@top_size":"topSize",
           "@in_top":"inTop","value":"value","delta":"delta","count":"count","answer":"answer",
           "nums":"nums","k":"k","x":"x","window":"window","e":"entry","key":"entry"},
    python: {"self.count":"counts","self.top":"top","self.rest":"rest","self.total":"sum","self.sum":"sum",
             "self.x":"x","self.top_size":"topSize","self.in_top":"inTop","value":"value","delta":"delta",
             "count":"count","answer":"answer","nums":"nums","k":"k","x":"x","counts":"counts",
             "kept":"kept","key":"entry","best":"best","weakest":"weakest","entry":"entry"},
    javascript: {"this.count":"counts","this.top":"top","this.rest":"rest","this.sum":"sum","this.x":"x",
                 "this.topSize":"topSize","this.inTop":"inTop","value":"value","delta":"delta","count":"count",
                 "answer":"answer","nums":"nums","k":"k","x":"x","counts":"counts","ranked":"ranked",
                 "key":"entry","best":"best","weakest":"weakest","entry":"entry","sum":"sum"},
    go: {"w.count":"counts","w.top":"top","w.rest":"rest","w.sum":"sum","w.x":"x","w.topSize":"topSize",
         "w.inTop":"inTop","value":"value","delta":"delta","count":"count","answer":"answer","nums":"nums",
         "k":"k","x":"x","counts":"counts","ranked":"ranked","key":"entry","best":"best","weakest":"weakest",
         "e":"entry","sum":"sum"},
    rust: {"self.count":"counts","self.top":"top","self.rest":"rest","self.sum":"sum","self.x":"x",
           "self.top_size":"topSize","self.in_top":"inTop","value":"value","delta":"delta","count":"count",
           "answer":"answer","nums":"nums","k":"k","x":"x","counts":"counts","ranked":"ranked",
           "key":"entry","best":"best","weakest":"weakest","entry":"entry","window":"window"}
  };
  var VAR_LABEL_MY = {
    counts:"ရေတွက်ထားချက်", top:"TOP", rest:"REST", sum:"စုစုပေါင်း", x:"x", k:"k",
    topSize:"TOP ထဲရှိ အရေအတွက်", inTop:"TOP ထဲရှိ တန်ဖိုးများ", value:"value", delta:"delta",
    count:"count", answer:"answer", nums:"nums", window:"window", entry:"entry",
    ranked:"အဆင့်စီထားချက်", kept:"ထားလိုက်သည့်အရာများ", best:"REST ၏ အကောင်းဆုံး",
    weakest:"TOP ၏ အားအနည်းဆုံး", i:"i"
  };
  var VAR_LABEL = {
    counts:"the tally", top:"TOP", rest:"REST", sum:"the running total", x:"x", k:"k",
    topSize:"entries in TOP", inTop:"values currently in TOP", value:"value", delta:"delta",
    count:"count", answer:"answer", nums:"nums", window:"window", entry:"entry",
    ranked:"ranked", kept:"kept", best:"REST's best", weakest:"TOP's weakest", i:"i"
  };

  /* format a value the way the selected language would print it */
  function fmtPairs(list, lang){
    if(!list || !list.length) return lang==="go" ? "[]" : "[]";
    var inner = list.map(function(e){
      return lang==="go" ? "{"+e.c+" "+e.v+"}" : "["+e.c+", "+e.v+"]";
    }).join(", ");
    return "["+inner+"]";
  }
  function fmtCounts(list, lang){
    if(!list || !list.length) return lang==="go" ? "map[]" : "{}";
    var body = list.map(function(e){
      if(lang==="ruby") return e.v+"=>"+e.c;
      if(lang==="javascript") return e.v+" => "+e.c;
      if(lang==="go") return e.v+":"+e.c;
      return e.v+": "+e.c;
    }).join(lang==="go" ? " " : ", ");
    if(lang==="go") return "map["+body+"]";
    if(lang==="javascript") return "Map {"+body+"}";
    return "{"+body+"}";
  }
  function varValue(concept, s, lang){
    var v = s.vars || {};
    switch(concept){
      case "counts": return fmtCounts(v.counts, lang);
      case "top":    return fmtPairs(v.top, lang);
      case "rest":   return fmtPairs(v.rest, lang);
      case "ranked": return fmtPairs(v.ranked, lang);
      case "kept":   return fmtPairs(v.kept, lang);
      case "sum":    return String(v.sum);
      case "x":      return String(v.x);
      case "k":      return String(v.k);
      case "i":      return String(v.i);
      case "topSize":return String(v.topSize);
      case "inTop":  return v.inTop ? "{"+v.inTop.join(", ")+"}" : null;
      case "nums":   return v.nums ? "["+v.nums.join(", ")+"]" : null;
      case "window": return v.window ? "["+v.window.join(", ")+"]" : null;
      case "answer": return v.answer ? "["+v.answer.join(", ")+"]" : null;
      case "value":  return v.value === undefined ? null : String(v.value);
      case "delta":  return v.delta === undefined ? null : (v.delta>0?"+":"")+v.delta;
      case "count":  return v.count === undefined ? null : String(v.count);
      case "entry":  return v.entry ? "["+v.entry.c+", "+v.entry.v+"]" : null;
      case "best":   return (s.hl && s.hl.cmpUp) ? "["+s.hl.cmpUp.c+", "+s.hl.cmpUp.v+"]" : null;
      case "weakest":return (s.hl && s.hl.cmpDown) ? "["+s.hl.cmpDown.c+", "+s.hl.cmpDown.v+"]" : null;
      default: return null;
    }
  }

  /* wrap known identifiers in the rendered listing, never inside a tag */
  var BF_ONLY = {window:1, ranked:1, kept:1, i:1};
  var WINDOW_ONLY = {top:1, rest:1, topSize:1, inTop:1, entry:1, delta:1, value:1, count:1, best:1, weakest:1};
  function markVars(lineHtml, lang, mode){
    var map = VAR_MAP[lang] || {};
    var names = Object.keys(map).sort(function(a,b){ return b.length - a.length; });
    var pattern = new RegExp("(" + names.map(function(n){
      return n.replace(/[.@$]/g, "\\$&");
    }).join("|") + ")(?![A-Za-z0-9_])", "g");
    return lineHtml.split(/(<[^>]*>)/).map(function(part){
      if(part.charAt(0) === "<") return part;
      return part.replace(pattern, function(tok, _m, offset){
        var before = part.charAt(offset - 1);
        if(/[A-Za-z0-9_.@]/.test(before)) return tok;       // mid-identifier
        var concept = map[tok];
        if(mode === "bf" ? WINDOW_ONLY[concept] : BF_ONLY[concept]) return tok;
        return '<span class="var" data-c="'+concept+'">'+tok+'</span>';
      });
    }).join("");
  }

  function renderCode(s){
    var box = $("code");
    box.innerHTML = CODE[lang][mode].map(function(row){
      var hot = row[0] && row[0]===s.line ? " hot" : "";
      return '<span class="ln'+hot+'">'+markVars(row[1]||" ", lang, mode)+'</span>';
    }).join("");
    var hotLine = box.querySelector(".ln.hot");
    if(hotLine){
      box.scrollTop = Math.max(0, hotLine.offsetTop - box.clientHeight/2 + hotLine.offsetHeight/2);
    }
    $("code-sub").innerHTML = (ui==="my" ? CODE_SUB_MY[mode] + " " + TIE_NOTE_MY[lang]
                                         : CODE_SUB[mode] + " " + TIE_NOTE[lang]);
  }

  function renderAnswer(s){
    var total = Math.max(0, nums.length-k+1);
    var html="";
    for(var i=0;i<total;i++){
      var filled = i < s.answer.length;
      var just = filled && i===s.answer.length-1 && (s.phase==="record"||s.phase==="sum");
      html += '<span class="slot'+(filled?" filled":"")+(just?" just":"")+'">'+(filled?s.answer[i]:"·")+'</span>';
    }
    $("answer").innerHTML = html;
    $("ans-note").textContent = t("windowsDone", s.answer.length, total);
  }

  function render(){
    var steps=runs[mode], i=Math.min(at[mode], steps.length-1);
    if(!steps.length) return;
    var s=steps[i];
    renderStrip(s);
    if(mode==="sw") renderShelves(s); else if(mode==="hp") renderHeaps(s); else renderBrute(s);
    renderCode(s);
    renderAnswer(s);
    $("msg").innerHTML = s.msg;
    $("phase").textContent = s.phase;
    $("counter").textContent = (i+1)+" / "+steps.length;
    var sc=$("scrub"); sc.max=steps.length-1; sc.value=i;
    $("prev").disabled = i===0;
    $("next").disabled = i===steps.length-1;
    $("tab-bf").setAttribute("aria-selected", mode==="bf");
    $("tab-sw").setAttribute("aria-selected", mode==="sw");
    $("tab-hp").setAttribute("aria-selected", mode==="hp");
    $("code-label").textContent = (mode==="bf" ? "brute force" : mode==="sw" ? "sorted arrays" : "lazy heaps") + " \u00b7 " + lang;
  }

  /* ---------------- transport ---------------- */
  function go(d){
    var steps=runs[mode];
    at[mode]=Math.max(0, Math.min(steps.length-1, at[mode]+d));
    render();
    if(at[mode]===steps.length-1) stop();
  }
  function stop(){ if(timer){ clearInterval(timer); timer=null; $("play").textContent="Play"; } }
  function play(){
    if(timer){ stop(); return; }
    if(at[mode]===runs[mode].length-1) at[mode]=0;
    $("play").textContent="Pause";
    timer=setInterval(function(){ go(1); }, 950);
    render();
  }

  $("next").addEventListener("click", function(){ stop(); go(1); });
  $("prev").addEventListener("click", function(){ stop(); go(-1); });
  $("play").addEventListener("click", play);
  $("scrub").addEventListener("input", function(e){ stop(); at[mode]=+e.target.value; render(); });
  $("tab-bf").addEventListener("click", function(){ stop(); mode="bf"; render(); });
  $("tab-sw").addEventListener("click", function(){ stop(); mode="sw"; render(); });
  $("tab-hp").addEventListener("click", function(){ stop(); mode="hp"; render(); });

  document.addEventListener("keydown", function(e){
    if(/^(INPUT|TEXTAREA)$/.test(e.target.tagName)) return;
    if(e.key==="ArrowRight"){ stop(); go(1); e.preventDefault(); }
    else if(e.key==="ArrowLeft"){ stop(); go(-1); e.preventDefault(); }
    else if(e.key===" "){ play(); e.preventDefault(); }
  });

  /* ---------------- inputs ---------------- */
  function readInputs(){
    var raw = $("nums").value.split(/[,\s]+/).filter(function(t){ return t.length; }).map(Number);
    var parsed = raw.filter(function(n){ return Number.isFinite(n); });
    var warn=[];
    if(!parsed.length){ parsed=[1]; warn.push("nums needs at least one number — falling back to [1]."); }
    var nk = parseInt($("k").value,10), nx = parseInt($("x").value,10);
    if(!Number.isFinite(nk) || nk<1) nk=1;
    if(nk>parsed.length){ nk=parsed.length; warn.push("k can't exceed n — clamped to "+nk+"."); }
    if(!Number.isFinite(nx) || nx<1) nx=1;
    if(nx>nk){ nx=nk; warn.push("x can't exceed k — clamped to "+nx+"."); }
    nums=parsed; k=nk; x=nx;
    $("k").max=parsed.length; $("x").max=nk;
    var w=$("warn");
    if(warn.length){ w.textContent=warn.join(" "); w.hidden=false; } else { w.hidden=true; }
    stop();
    rebuild();
  }
  ["nums","k","x"].forEach(function(id){
    $(id).addEventListener("change", readInputs);
    $(id).addEventListener("input", function(){ if(id!=="nums") readInputs(); });
  });
  Array.prototype.forEach.call(document.querySelectorAll(".chip"), function(b){
    b.addEventListener("click", function(){
      $("nums").value=b.dataset.nums; $("k").value=b.dataset.k; $("x").value=b.dataset.x;
      readInputs();
    });
  });

  /* ---------------- full source blocks ---------------- */
  function paint(src){
    return src.replace(/&/g,"&amp;").replace(/</g,"&lt;")
              .replace(/(#[^\n]*)/g,'<span class="cm">$1</span>');
  }
  Array.prototype.forEach.call(document.querySelectorAll(".copy"), function(btn){
    var raw = document.getElementById(btn.dataset.src).textContent.replace(/^\n+/,"").replace(/\s+$/,"");
    var out = document.getElementById(btn.dataset.out);
    out.innerHTML = paint(raw);

    function flash(label){
      btn.textContent = label; btn.classList.add("done");
      setTimeout(function(){ btn.textContent="Copy"; btn.classList.remove("done"); }, 2000);
    }
    function selectIt(){
      var r=document.createRange(); r.selectNodeContents(out);
      var s=window.getSelection(); s.removeAllRanges(); s.addRange(r);
      flash("Selected — press ⌘C");
    }
    btn.addEventListener("click", function(){
      try{
        navigator.clipboard.writeText(raw).then(function(){ flash("Copied"); }, selectIt);
      }catch(e){ selectIt(); }
    });
  });


  /* ---------------- "what is an x-sum" player ---------------- */
  var Q = { win: [1,1,2,2,3,4], x: 2 };
  var Q_PRESETS = [
    { label: "example 1, window 0", win: [1,1,2,2,3,4] },
    { label: "example 1, window 1", win: [1,2,2,3,4,2] },
    { label: "example 2", win: [3,8] },
    { label: "every value ties", win: [5,5,4,4,3,3] },
    { label: "one value dominates", win: [9,9,9,9,2,7] }
  ];

  function qRender(){
    var counts = new Map();
    Q.win.forEach(function(v){ counts.set(v, (counts.get(v)||0)+1); });
    var ranked = Array.from(counts, function(p){ return {v:p[0], c:p[1]}; })
                      .sort(function(a,b){ return cmp(b,a); });
    var keep = Math.min(Q.x, ranked.length);
    var kept = ranked.slice(0, keep);
    var keptValues = new Set(kept.map(function(e){ return e.v; }));
    var sum = kept.reduce(function(s,e){ return s + e.v*e.c; }, 0);

    $("q-arr").innerHTML = Q.win.map(function(v){
      return '<div class="cell '+(keptValues.has(v) ? "kept" : "cut")+'"><span>'+v+'</span></div>';
    }).join("");

    $("q-rank").innerHTML = ranked.map(function(e,i){
      var cut = (i === keep && i > 0) ? '<span class="cutline">'+t("cutKeep", keep)+'</span>' : "";
      return cut + cardHTML(e, i < keep ? "" : "dropped");
    }).join("");

    // name the first tie the ranking had to settle
    var tie = "";
    for(var i=1;i<ranked.length;i++){
      if(ranked[i].c === ranked[i-1].c){
        tie = t("qTie", ranked[i-1].v, ranked[i].v, ranked[i].c, i === keep);
        break;
      }
    }
    $("q-tie").innerHTML = tie;
    $("q-expr").innerHTML = kept.length
      ? kept.map(function(e){ return e.v+"\u00d7"+e.c; }).join("  +  ")
      : t("qNothing");
    $("q-total").innerHTML = sum + "<small>X-SUM</small>";
    $("q-xout").textContent = Q.x;
    $("q-label").textContent = t("valuesDistinct", Q.win.length, counts.size);
    var slider = $("q-x");
    slider.max = Math.max(1, counts.size);
    slider.value = Q.x;
  }

  function qLoad(preset){
    Q.win = preset.win.slice();
    var distinct = new Set(Q.win).size;
    Q.x = Math.min(2, distinct);
    qRender();
  }

  function qPresets(){
    $("q-presets").innerHTML = Q_PRESETS.map(function(p,i){
      return '<button class="chip" data-q="'+i+'">'+t("qPreset")[i]+'</button>';
    }).join("");
    Array.prototype.forEach.call(document.querySelectorAll("[data-q]"), function(b){
      b.addEventListener("click", function(){ qLoad(Q_PRESETS[+b.dataset.q]); });
    });
  }
  qPresets();
  $("q-x").addEventListener("input", function(e){ Q.x = +e.target.value; qRender(); });
  qRender();

  /* ---------------- language tabs ---------------- */
  function setLang(next){
    lang = next;
    Array.prototype.forEach.call(document.querySelectorAll(".lang"), function(btn){
      btn.setAttribute("aria-selected", String(btn.dataset.lang === lang));
    });
    Array.prototype.forEach.call(document.querySelectorAll(".lang-pane"), function(pane){
      pane.hidden = pane.dataset.pane !== lang;
    });
    render();
  }
  Array.prototype.forEach.call(document.querySelectorAll(".lang"), function(btn){
    btn.addEventListener("click", function(){ setLang(btn.dataset.lang); });
  });


  /* ---------------- worked examples -> the stepper ---------------- */
  Array.prototype.forEach.call(document.querySelectorAll(".ex-load"), function(btn){
    btn.addEventListener("click", function(){
      $("nums").value = btn.dataset.nums;
      $("k").value = btn.dataset.k;
      $("x").value = btn.dataset.x;
      readInputs();
      mode = "sw";
      render();
      var smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      document.querySelector(".strip-card").scrollIntoView({
        behavior: smooth ? "smooth" : "auto", block: "start"
      });
    });
  });


  /* ---------------- language ---------------- */
  var I18N_SEL = "h1,h2,h3,p,li,summary,span,button,label,td,th,figcaption,output,a,footer";
  var norm = function(s){ return s.replace(/\s+/g," ").trim(); };

  var I18N_LOOKUP = null;
  function i18nLookup(){
    if(I18N_LOOKUP) return I18N_LOOKUP;
    I18N_LOOKUP = {};
    var probe = document.createElement("div");
    Object.keys(I18N_STATIC).forEach(function(k){
      probe.innerHTML = k;                       // &mdash; -> the literal character
      I18N_LOOKUP[norm(probe.innerHTML)] = I18N_STATIC[k];
    });
    return I18N_LOOKUP;
  }

  function applyLang(next){
    ui = next;
    var root = document.documentElement;
    root.setAttribute("data-ui", next);
    root.setAttribute("lang", next === "my" ? "my" : "en");
    var nodes = document.querySelectorAll(I18N_SEL);
    for(var i=0;i<nodes.length;i++){
      var el = nodes[i];
      if(el.closest("pre, .code, .lang-switch, .lang-bar, .tagpill")) continue;
      if(!el.getAttribute("data-i18n")){
        var key = norm(el.innerHTML);
        if(!i18nLookup()[key]) continue;
        el.setAttribute("data-i18n", key);
      }
      var src = el.getAttribute("data-i18n");
      el.innerHTML = next === "my" ? i18nLookup()[src] : src;
    }
    Array.prototype.forEach.call(document.querySelectorAll(".lang-opt"), function(b){
      b.setAttribute("aria-pressed", String(b.dataset.ui === next));
    });
    try { localStorage.setItem("xsum-ui", next); } catch(e){}
    var keep = {bf:at.bf, sw:at.sw, hp:at.hp};
    rebuild();                       // narration is built per language
    at.bf = Math.min(keep.bf, runs.bf.length-1);
    at.sw = Math.min(keep.sw, runs.sw.length-1);
    at.hp = Math.min(keep.hp, runs.hp.length-1);
    qPresets();
    qRender();
    render();
  }

  Array.prototype.forEach.call(document.querySelectorAll(".lang-opt"), function(btn){
    btn.addEventListener("click", function(){ stop(); applyLang(btn.dataset.ui); });
  });

  // what the dictionary has not covered yet (dev aid, callable from the console)
  window.__i18nUnused = function(){
    var lookup = i18nLookup(), seen = {};
    Array.prototype.forEach.call(document.querySelectorAll(I18N_SEL), function(el){
      seen[norm(el.innerHTML)] = 1;
      var k = el.getAttribute("data-i18n"); if(k) seen[k] = 1;
    });
    return Object.keys(lookup).filter(function(k){ return !seen[k]; });
  };

  window.__i18nAudit = function(){
    var missing = [];
    Array.prototype.forEach.call(document.querySelectorAll(I18N_SEL), function(el){
      if(el.closest("pre, .code, .lang-switch, .lang-bar")) return;
      if(el.querySelector(I18N_SEL)) return;                 // leaf elements only
      var key = norm(el.innerHTML);
      if(!key || !/[A-Za-z]{3}/.test(key)) return;
      if(I18N_STATIC[key] || el.getAttribute("data-i18n")) return;
      if(/^[\x00-\x7F]*$/.test(key) === false) return;
      missing.push(key);
    });
    return Array.from(new Set(missing));
  };


  /* ---------------- value tooltip ---------------- */
  var tip = document.createElement("div");
  tip.className = "var-tip";
  tip.hidden = true;
  document.body.appendChild(tip);
  var pinned = null;

  function showTip(el){
    var steps = runs[mode];
    var s = steps[Math.min(at[mode], steps.length-1)];
    var concept = el.getAttribute("data-c");
    var value = varValue(concept, s, lang);
    var label = (ui==="my" ? VAR_LABEL_MY[concept] : VAR_LABEL[concept]) || concept;
    tip.innerHTML = '<span class="tip-name">'+el.textContent+'</span>'
                  + '<span class="tip-label">'+label+'</span>'
                  + '<span class="tip-val">'+(value === null ? t("tipUnset") : value)+'</span>';
    tip.hidden = false;
    var r = el.getBoundingClientRect(), tr = tip.getBoundingClientRect();
    var left = Math.min(Math.max(8, r.left), window.innerWidth - tr.width - 8);
    var top = r.top - tr.height - 8;
    if(top < 4) top = r.bottom + 8;
    tip.style.left = Math.round(left + window.scrollX) + "px";
    tip.style.top  = Math.round(top + window.scrollY) + "px";
  }
  function hideTip(){ if(!pinned){ tip.hidden = true; } }

  $("code").addEventListener("mouseover", function(e){
    var el = e.target.closest(".var");
    if(el && !pinned) showTip(el);
  });
  $("code").addEventListener("mouseout", function(e){
    if(e.target.closest(".var")) hideTip();
  });
  $("code").addEventListener("click", function(e){
    var el = e.target.closest(".var");
    if(!el){ pinned = null; tip.hidden = true; return; }
    if(pinned === el){ pinned = null; tip.hidden = true; }
    else { pinned = null; showTip(el); pinned = el; }
  });
  document.addEventListener("scroll", function(){ if(!pinned) tip.hidden = true; }, true);

  rebuild();
  try { var saved = localStorage.getItem("xsum-ui"); if(saved === "my") applyLang("my"); } catch(e){}
})();
