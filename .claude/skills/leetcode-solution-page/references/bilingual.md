# English / မြန်မာ

Pages are bilingual: a toggle top-right switches English and မြန်မာ, and the
choice persists across pages.

## What translates and what does not

**Never translates**: code, identifiers, comments, and every one of the code
blocks. They are what the reader pastes into LeetCode, and translating a
comment desyncs the block from the file you verified.

**Stays English inside Burmese prose** — this is how Burmese developers
actually write, not a shortcut:

- LeetCode's own labels: `Easy`, `Hard`, problem titles
- Set and structure names used in the code: `TOP`, `REST`, `root`, `heap`
- Terms with no settled Burmese equivalent: `window`, `array`, `count`,
  `value`, `stale`, `algorithm`, `container`, `invariant`, `comparator`,
  `cache`, `submission`, `case`, `live`
- Notation: `O(k + d log d)`, `Array#insert`, `X-SUM`
- Names and titles. The page's own h1 is a name — leave it.

**Translates**: the statement, examples, narration, labels, captions, notes,
disclosures, the cost table's prose, and Part 3's per-language explanations.

**Numerals stay Arabic** (`5`, not `၅`). The page is full of numeric data and
code; mixing numeral systems on one page reads worse than either alone.

## Do not translate idioms literally

The single biggest quality problem. A calque of an English figure of speech
reads worse than leaving the English in place. Phrases that had to be reverted
during development, and why:

| English | Bad literal Burmese | Why it failed |
|---|---|---|
| its hard twin | Hard အစ်ကို | "older brother" for "twin" |
| ping-pong (loop) | ပင်ပေါင်ထိုး | the table-tennis sport |
| live entries | သက်ရှိ | a living creature |
| test case | ကိစ္စ | an affair or matter |
| the cheap place | စျေးအပေါ | a low price, not a low cost |
| honest complexity | ရိုးသားသော | moral honesty |
| cache-resident luck | ကံကောင်းမှု | a joke that does not survive carrying over |

When a phrase resists translation, use the plain meaning or keep the English
term. Metaphors the page itself invents and explains (a shelf, a barrier, a
card) translate fine, because the reader learns them on the page.

## How the kit does it

The mechanics are handled for you. A string in `lesson.js` or `page.js` is
either plain English or `t(english, burmese)` from `src/lib/kit.js`; static
markup in `statement.html` carries its Burmese in a `data-i18n` attribute.
`src/lib/i18n.js` swaps them, and a missing Burmese side falls back to English.

Anything built at render time (narration, stage labels, widget lines) must be
a `t(...)` pair picked at render time with `pick()`. Don't call `pick()` inside
a step generator: steps are built once, and the language can change after.

## Typography

The site loads Noto Sans Myanmar. Write Unicode, never Zawgyi.

Burmese stacks taller than Latin and needs room: `line-height: 1.85` for body,
`1.95` for long prose, `1.5` for headings. Keep mono faces on code, cards,
counters and data so they never switch script.

**Burmese has no spaces between words**, so a sentence can look like one
unbreakable token. Two consequences:

- Give prose surfaces `overflow-wrap: break-word` under `[data-ui="my"]`
- Use `minmax(0, 1fr)` for grid tracks that stack, since `1fr`'s automatic
  min-content floor is what the unbreakable run inflates

Without both, the page scrolls sideways in Burmese while English looks fine.

## Honesty

Translation quality is the one thing you cannot verify by running it. Coverage,
rendering, round-tripping and layout are all checkable; whether the prose
*reads* well to a native speaker is not. Say so, and invite correction — the
useful pattern to ask them to look for is exactly the idiom problem above.
