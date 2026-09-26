# Building a lesson on the site

A lesson is not a standalone page. The framework is a shared kit, and a lesson
supplies data: prose, a step generator per approach, a stage drawing, and
listings. Everything a page looks like comes from the kit, so every page has
the same parts in the same order without anyone copying markup.

## The layout is the kit's

`src/layouts/Walkthrough.astro` is the skeleton, `src/lib/stepper.js` renders
every interactive part into it, `src/styles/lesson.css` styles the page and
`src/styles/kit.css` the stage shapes. A lesson never writes page structure.

Why that matters: the first version of the kit had its own layout — tabs
instead of mode cards, no example cards, no widget, a "What to take away"
section where part 3 should be — and its own stylesheet that redefined
`.part`, `.statement` and `.lang-switch`. Ten lessons were built on it before
anyone compared them with the page they were meant to match. Now there is one
layout and nothing to drift from; if a lesson needs something the layout lacks,
change the kit for every page, not the lesson.

**The worked example to copy is `src/lessons/two-sum/`** — the smallest page.
For trees copy `diameter-of-binary-tree`; for a three-approach page with a
bespoke stage, `x-sum`.

## What the page has, top to bottom

`node scripts/check-lessons.mjs` fails a lesson that is missing any part
marked ✓.

**Header** — eyebrow (`LeetCode 1 · Easy`), title, lede, the three jump chips
and a "View on LeetCode ↗" chip per problem in `links`, English/မြန်မာ switch
top right.

**1 · The question**
- Statement card: LeetCode's prose verbatim (`statement.html`), constraints as
  `.constraints` spans, problem link(s) with difficulty. Examples and
  constraints are *not* inside the statement HTML — they have their own
  components.
- ✓ The widget panel beside it, titled as an instruction ("Drag x, watch what
  survives"). One small interactive thing that teaches the single idea the
  statement hinges on, in the shared widget vocabulary: `.q-arr` cells (`kept` /
  `cut`; `role="button"` cells are clickable), `.q-slider` with a `<label>`,
  `<input type=range>` and `<output>`, `.q-presets` chips, an amber `.q-tie`
  line for the sentence, and a `.ledger` whose `.expr` holds a **formula** (it
  renders mono) and whose `.total` holds one big number with a `<small>`
  label. Set the panel's right-hand note via `#q-label`.
- ✓ Example cards: input, output, a `why` list explaining the answer, and a
  "Load into the stepper" button.
- The traps disclosure, phrased as "N ways the statement bites".

**2 · The answer, step by step** — three sub-sections, laid out by the kit:
- **2·1 Pick an approach.** ✓ A tab per mode (name, optional `sub`, one-line
  `desc`, `cost`) with ✓ the approach block attached under the chosen one:
  `solutions[mode].approach = { idea, steps, cost }` — the intuition in a
  sentence or two, three or four steps named after the listing's identifiers,
  and the reason for the complexity. A trap gets at most a clause here; the
  notes explain it.
- **2·2 Watch it run.** One player card: input fields and ✓ preset chips, ✓ the
  array strip (`cfg.strip`; `noStrip: true` only when the input is genuinely
  not a row), transport with the narration under it, then the stage and ✓ the
  answer beside "The code, live" with hoverable variables and any `caveats`
  note under it. Don't add boxes inside the player. ✓ Under the player, the
  `playHint` line from `page.js`: the keys (`←` `→` step · `space`
  play/pause), what the reader can edit "above" and any limits ("up to 12
  values"), and what rebuilds. The layout renders it after `#lesson` and the
  stepper moves it to the foot of 2·2, so a lesson never places it.
- **2·3 Going deeper.** The cost table ("Why bother"), then the implementation
  notes: question-phrased disclosures ("Why check for the partner *before*
  storing?"). A takeaway goes in the notes — never as a part of its own.
  Label anything computed rather than measured.

**3 · The whole solution** — language tabs, then one block per approach with a
✓ caption (`solutions[mode].desc`, optional `tag` such as `3321`), a
verification badge and a Copy button.

## The folder a lesson writes

Everything for a lesson is one folder; `src/pages/leetcode/[slug].astro`
renders every folder that has a `page.js`, and the home page lists problems
only: a problem whose id is in some lesson's `links` gets its title linked
(the whole row opens the page), the rest say "Solution coming soon", and every
row has a "View on LeetCode ↗" link. Problems are grouped by the `category`
each has in `src/data/problems.json`; a problem added there needs one of the
categories listed in `src/pages/index.astro`. There is no page file and no index entry to add.

```
src/lessons/<slug>/page.js           the static prose, as Walkthrough props
src/lessons/<slug>/statement.html    LeetCode's prose only, data-i18n on each element
src/lessons/<slug>/lesson.js         everything interactive
src/lessons/<slug>/style.css         optional — styles only this lesson uses
verify/<slug>/spec.py                corpus, oracle, five drivers (DRIVERS, corpus(), SKIP?, BIG_STACK?)
verify/<slug>/adapter.mjs            a corpus line → the lesson's input; a last step → an answer
```

**Use the shared helpers, and no inline styles.** `src/lib/kit.js` has what
every lesson needs — `t(en, my)`, `plural`, `exampleTitle(n)`, `LANGUAGES`, the
code-token helpers `k` / `c`, `verdictAnswer` for a true/false answer card,
`stageRow` / `stageGap` inside the stage, `stageEmpty(text)` where a structure
is empty ("root = null"), `labelledRows` for a strip card with two inputs
(`labelledRows(rows, { grid: true })` for a board or matrix, its columns
lined up; the widget's board is a `.q-grid` of `.q-arr` rows). Controls parse with `intList({ min, max, lo, hi, distinct, check })`
and `intValue({ lo, hi })` — they reject rather than trim, and `check` takes
the lesson's own rule (sorted, a majority exists). A control shows a list back
as `1, 2, 3` by itself; give it a `format` only for another shape. The part 1 widget uses `presetChips(sets, active)` for its chips
(the active one is `aria-pressed`, which lesson.css draws as selected; a
widget's own toggle chips should set it too) and `widgetLabel(text)` for the
note beside its heading. Anything a lesson draws uses a class from `lesson.css`, `kit.css`
or its own `style.css`; never a `style="…"` string (a width that varies can be
a class per step, as x-sum's tally bars are). In `page.js`'s cost table, the
gloss under an approach's name is `<span class="sub">`. A class a second lesson would
want belongs in `kit.css`, next to the helper that emits it.

### `lesson.js`

```js
mountLesson({
  input, controls, presets, examples,
  modes: [{ id, name, sub?, desc, cost, build }],
  languages, code, solutions, verification, caveats?,
  strip, draw, answer, vars, hover?,
  widget,                     // (host) => void, mounted into #q-widget
});
```

- **The strip card carries the array; the stage carries what the approach
  holds between steps.** For Two Sum the stage is the `seen` map, because the
  map *is* the idea. Don't redraw the array inside the stage.
- **A step is `{ line, note, tag, ...state }`.** `line` is the key to
  highlight (several lines may share a key; all light up), `note` the
  narration, `tag` the chip. Copy mutable state into every snapshot.
- **Build steps without `pick()`.** Steps are built once and shown in either
  language: every reader-facing string in a step is a `t(en, my)` pair, and
  `pick()` belongs in `draw` / `strip` / `vars` / the widget. The checker
  builds each mode in both languages and fails if the steps differ.
- `vars()` also drives hover-to-inspect: any identifier in the listing that
  matches a name `vars()` reports becomes hoverable. So name the vars after the
  identifiers in the code (`want`, not `partner needed`). Use `hover` to alias
  identifiers that differ by language (`{ ruby: { '@sum': 'sum' } }`). Words inside a comment are never
  marked, so a comment can say "every word" beside a variable named `word`.
- Listings are the `CODE` table, generated from solution files by
  `scripts/verify/code-table.py` — each file's highlighted lines end in
  ` ⟦key⟧`. The full solution is the listing: the live panel scrolls to the
  highlighted line, and part 3 shows the same text.
- Verification badges start with `ran here · …` or `written here · not
  compiled …`. A badge can differ by approach — `verification.ruby = { dfs:
  '…', bfs: '…' }` — when one approach fails where the other does not
  (recursion overflowing a language's default stack at the constraint). Say so
  in a `caveats` note too.
- Trees: `src/lib/tree.js` parses LeetCode's level order and draws through
  `stage.tree()`; the strip card can show the tree back in level order.
  `tree()`'s `at`, `tone` and `badges` take node keys, the same keys the
  lesson's steps hold. `heapNested(h)` draws an array heap, keyed by index.
- **Put `mountLesson(...)` last in the file.** It calls the widget immediately,
  so any `const` the widget reads must already be initialised; a `const`
  declared below the call is in its temporal dead zone and throws.

### `page.js`

`export default { ... }` with every prose prop: `title`, `summary`, `eyebrow`,
`lede`, `links`, `constraints`, `part1Sub`, `widgetTitle`, `traps`, `part2Sub`,
`notes`, `cost`, `part3Sub`, `playHint`. Each takes a string or `{ en, my }`. The
statement is not a prop here — the route reads `statement.html`. The checker
fails a lesson whose `page.js` leaves one out.

## Stage primitives — `src/lib/stage.js`

| Function | Draws |
| --- | --- |
| `cells(items, o)` | the strip's cells — for `cfg.strip` |
| `slots(values, o)` | the answer card's slots — for `cfg.answer` |
| `stagePanel(title, note, inner)` | a titled block inside the stage |
| `kv` `stack` `chain` `tree` `bars` `readout` `strip` `panels` | the auxiliary shapes |
| `trieOutline({ nodes, ends, at, made, miss })` | a trie, one row per node named by its prefix |

`cells` tones: `inwin` (amber, looking at it), `entering` (green, joined or
matched), `leaving` (red dashed, dropped or failed), `done` (faded, settled).
`cells(items, { wide: true })` sizes each cell to its text, for words and calls
("put 1,1", "[15,18]"); in a widget, give the cell the class `wide`.

A stage the primitives can't draw (x-sum's shelves and heaps) is the lesson's
own markup, styled by its `style.css` or, if another lesson would use it, by
`kit.css`.

## Traps

**Sharing a mutable reference across snapshots.** Copy per frame, or every
frame renders the final state.

**Line keys drifting between languages.** The checker enforces this.

**Showing only the branch that fires.** Give a failed comparison its own frame.

**A `pick()` inside a step generator.** Freezes that text in one language; the
checker catches it.

**Page structure in a lesson.** Don't. If the layout needs something, change the
kit for every page.

## Checking

```sh
node scripts/check-lessons.mjs            # every lesson — structure and format
node scripts/check-lessons.mjs two-sum    # one
python3 scripts/verify/run.py <slug>      # every listing × 5 languages, then every walkthrough
python3 scripts/verify/run.py <slug> --from DIR   # listing files, before they are in lesson.js
npm run build && npm run audit -- <slug>  # in a browser: a lit line on every step, presets, errors, 400px
```

`npm run audit` needs Chromium once: `npx playwright install chromium`.
Then open the lesson beside any other in a browser at the same width. The
checker and the audit prove the parts exist and behave; only looking proves
they read well.
