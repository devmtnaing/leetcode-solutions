# Burmese phrasings to review

Translation quality is the one thing that cannot be verified by running it.
Everything below was flagged by whoever wrote it as a judgement call — a place
where the Burmese is defensible but a native speaker might pick differently.

Nothing here is a bug. The pages work and the meaning is carried; these are
register and word-choice calls.

**The rule being followed:** translate what reads naturally; leave problem
titles, algorithm names and terms of art in English. *hash map*, *sort*,
*brute force*, *index*, *array*, *target*, *anagram*, *Unicode* all stay as
loan words on purpose.

## How to use this

Each row names where the string lives. Edit it in place and the page picks it
up — no rebuild needed in dev. If a whole column of choices is wrong (register,
say), tell me and I will sweep every lesson rather than fixing them one at a
time.

## Two Sum — `src/lessons/two-sum/`

| Burmese | English | The call being made |
| --- | --- | --- |
| `ဉာဏ်သုံးစရာ မလိုပါ` | "Nothing clever here" | Idiomatic rather than a calque; may read blunt |
| `i ကို ချုပ်ကိုင်` | `fix i` (tag) | "ချုပ်ကိုင်" = hold fixed, chosen over the plainer "သတ်မှတ်" |
| `want ရှာ` | `want` (tag) | Keeps the identifier so the chip still points at the variable in the code |
| `element တိုင်းတွင် လိုချင်သည့် ကိန်း တစ်ခုတည်းသာ ရှိသည်` | widget title | Fairly literary — check it does not read stiff |
| `အချိန်ကုန် မတိုးဘဲ (constant time)` | "in constant time" | English term kept in parentheses rather than calqued |
| `မေးထားသည့် index များပါ ရွှေ့ကုန်မည်` | "throws away the indices" | A rewrite, not a literal translation — does it carry the same warning? |

## Best Time to Buy and Sell Stock — `src/lessons/best-time-to-buy-and-sell-stock/`

| Burmese | English | The call being made |
| --- | --- | --- |
| `တစ်ခေါက်တည်း လျှောက်` | "One pass" (mode name) | May read better simply left in English |
| `ကိုယ်စားလှယ်` | "candidate" | This is the *political* sense of the word; the algorithmic sense may want a loan word |
| `ရှေ့ရောက်သွားပြီ` | "New leader" | Idiomatic gamble |
| `ဈေးအသက်သာဆုံး` | "cheapest" | Used very heavily; `ဈေးအနည်းဆုံး` may read better |
| `နေ့တွဲ` | "pair of days" | A coinage — check it reads naturally |
| `အစက ပြန်စ` | "Start over" | Short UI string, register easy to get slightly wrong |
| `သက်သာလား?` | `cheaper?` (tag) | Same |

**Register drift:** aimed for formal `-သည်` throughout, but a few narration
sentences drift toward colloquial `-တာ` / `-ဘူး`. Worth a consistency pass.

## Valid Anagram — `src/lessons/valid-anagram/`

| Burmese | English | The call being made |
| --- | --- | --- |
| `ဇယား` | "the count table" | Used as table/tally rather than borrowing *table*; `count` and `hash map` stay English |
| `sort လုပ်`, `s ထဲ`, `t ထဲ`, `ကွဲသွား`, `အရှည်` | tag chips | Terse by design, read as fragments — may want fuller phrases |
| `ပထမ အကျော့` / `ဒုတိယ အကျော့` | "first pass" / "second pass" | `အကျော့` for *pass* |
| `ပစ္စည်းများကို ရေတွက်ရသည့် ပြဿနာ` | "count the things" problems | A rephrase, not a calque — second opinion on register |

## Fixed, not needing review

The verdict chip used to render as `ANAGRAM ဖြစ်သည်` because the kit uppercased
chip text, which shouts the Latin half and does nothing to the Burmese. The
transform is now off whenever the page is in Burmese.
