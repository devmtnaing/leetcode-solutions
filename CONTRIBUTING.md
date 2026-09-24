# Contributing a solution page

The most useful contribution is a new solution page for a problem on the list
that doesn't have one yet: any row on the home page marked *Solution coming
soon*. Fixes to existing pages, including better Burmese, are just as welcome.

Before you start, open a page or two to see what one looks like:
[`/leetcode/two-sum`](src/lessons/two-sum/) is the simplest, and the one to
copy. Every page has the same parts in the same order — the layout comes from
the shared kit, so you write content, not markup.

## What a page promises

A reader comes back to these pages to relearn a problem, watch it run, and copy
code they can trust. So three rules are firm:

- **Every listing has been run.** Each language, each approach, against a
  corpus checked by an independent oracle. The badge under each block says
  exactly what happened: `ran here · 20,011 cases`, or `written here · not
  compiled` if that is the truth. Never claim more than you did.
- **Every number is measured or labelled.** A timing names the machine it was
  measured on; a count that was computed says "computed, not timed". A trap
  that says "returns 4 on example 1" was checked by running the wrong code.
- **The walkthrough shows real state.** The stage draws what the algorithm
  carries between steps, in the shape the code holds it: the map, the stack,
  the call stack. It isn't a cartoon of the idea.

## You will need

- Node 20+, Python 3.10+, Ruby 3
- Docker, for Go and Rust. The verifier runs them in `golang:1.23-alpine` and
  `rust:1-slim`, and reports them as *skipped*, not passed, when Docker isn't
  running.

## Building a page, step by step

A page is one folder, `src/lessons/<leetcode-slug>/`. The route finds it and
the home page links it automatically, so there is nothing else to register.

```
src/lessons/<slug>/statement.html   LeetCode's statement, verbatim
src/lessons/<slug>/lesson.js        approaches, step generators, drawing, listings
src/lessons/<slug>/page.js          the prose: lede, traps, notes, cost table
src/lessons/<slug>/style.css        optional, styles only this page uses
verify/<slug>/spec.py               the corpus, the oracle, the five drivers
verify/<slug>/adapter.mjs           how the walkthrough reads a corpus line
```

### 1. Get the problem exactly right

Quote the statement, don't paraphrase it: readers will submit against the real
one. LeetCode's GraphQL endpoint returns it without a key:

```sh
curl -s -X POST https://leetcode.com/graphql/ -H 'Content-Type: application/json' \
  --data '{"query":"query q($t:String!){question(titleSlug:$t){questionFrontendId title difficulty content}}","variables":{"t":"two-sum"}}'
```

`statement.html` holds the prose paragraphs only. Examples and constraints
have their own components in `lesson.js` and `page.js`.

### 2. Write the brute force first

It is the reference everything else is checked against, so write it first and
confirm it on the examples. Then write the better approach. Most pages show two
(the brute force and the one worth learning); some show three.

### 3. Write the listings as files, then generate the code table

Write each approach in each language as a plain file (`brute.rb`,
`brute.py`, `brute.js`, `brute.go`, `brute.rs`, `hash.rb`, …) and mark each
line a walkthrough step highlights with ` ⟦key⟧` at the end:

```ruby
counts[x] += 1 ⟦tally⟧
```

Every language of an approach needs the same keys. Then:

```sh
python3 scripts/verify/code-table.py path/to/files brute,hash > code.js
```

and paste the `CODE` block into `lesson.js`. Don't retype listings: the
verifier runs the text in `lesson.js`, and the generator strips the markers so
that text is exactly the file you wrote.

### 4. Write `lesson.js`

Copy `src/lessons/two-sum/lesson.js` and replace its parts. It ends with one
`mountLesson({...})` call. Keep that call last in the file, because it runs the
widget straight away.

- **`modes`**: one per approach, each with a `build(input)` that returns the
  steps. A step is a snapshot: `{ line, note, tag, ...state }`, where `line` is
  the key to highlight and `note` is the narration. **Copy mutable state into
  every snapshot**, or every frame draws the final state.
- **`strip`**, **`draw`**, **`answer`**, **`vars`**: the input as cells, the
  stage, the answer card, and the values shown when hovering a variable. Name
  each var after the identifier in the code; `vars()` is what makes it
  hoverable.
- **`widget`**: part 1's one interactive idea. Pick the part of the statement
  people misread and let them drag it (see `maximum-depth-of-binary-tree`:
  depth counts nodes, not edges).
- **`solutions`**: per approach, a part 3 caption (`desc`) and an
  **`approach`**, `{ idea, steps, cost }`, shown in 2·1 under the approach's
  tab. `idea` is the intuition in a sentence or two; `steps` are three or four
  short steps named after the listing's own identifiers (`seen`, `want`,
  `i`); `cost` is the reason for the complexity the tab already shows, with a
  number only if it is measured or computed. Mention a trap in a step only in
  a clause — its explanation belongs in the notes. `npm run check` fails a
  mode without one.
- **`examples`**, **`presets`**, **`verification`** (the badges), and optional
  **`caveats`**.

Part 2 is laid out for you, in three sub-sections: **2·1 Pick an approach**
(a tab per mode showing its name, `desc` and `cost`, with the approach block
attached), **2·2 Watch it run** (one player card: inputs, strip, transport and
narration, then stage and answer beside the live code) and **2·3 Going deeper**
(`page.js`'s cost table, then its notes). You supply the content; don't add
boxes of your own inside the player.

Shapes for the stage are in `src/lib/stage.js` (`cells`, `kv`, `stack`,
`chain`, `tree`, `bars`, `readout`). Small helpers are in `src/lib/kit.js`,
and LeetCode binary trees in `src/lib/tree.js`. Use their classes, never a
`style="…"`; a class only your page needs goes in its own `style.css`.

Give a failed comparison its own frame. The branch that *doesn't* fire is often
the one worth seeing.

### 5. Write `page.js`

Every prop is required, and `npm run check` names any that are missing:
`title`, `summary`, `eyebrow`, `lede`, `links`, `constraints`, `part1Sub`,
`widgetTitle`, `traps`, `part2Sub`, `notes`, `cost`, `part3Sub`, `footer`.
`links` carries the LeetCode problem id, and that id is what puts the
*Interactive solution* link on the home page.

Traps are "ways the statement bites": each one names what the wrong code
returns, and you ran it to find out. Notes are questions a reader would ask
("Why check for the partner *before* storing?"), answered in a paragraph.

### 6. Verify

Write `verify/<slug>/spec.py`: `DRIVERS` (a program per language that reads
one case per line and prints one answer per line, with `{SOL}` where the
listing goes), and `corpus()`, which returns `(case, expected)` pairs from an
oracle that shares no code with your solutions. Mix thousands of tiny cases
(ties, duplicates, empty edges) with a few at the maximum constraints. Copy the
closest existing spec: `majority-element` for arrays, `diameter-of-binary-tree`
for trees (`verify/_lib/trees.py` has the tree helpers).

Then `verify/<slug>/adapter.mjs` turns a corpus line into the lesson's input.

```sh
npm run verify -- <slug>
```

This runs every listing, exactly as `lesson.js` publishes it, in all five
languages. It also runs every walkthrough over the corpus and checks that its
last frame gives the expected answer. If the animation and the answer disagree,
the animation is wrong.

Things that have bitten before:
- Recursion at 10⁴ deep overflows default stacks: Python stops at 1,000,
  Ruby 3.1 near 8,700 frames, and Node 24 near 7,800 run cold. Measure with
  one deep input per process, then say so on the badge and in a caveat.
- JavaScript bitwise operators are 32-bit.
- Rust's `i32` overflows silently in release builds.
- Go's `for range` over a map is randomly ordered.

### 7. Check the page

```sh
npm run check        # structure: every key highlighted, every part present
npm run dev          # then open your page next to /leetcode/two-sum
```

In the browser, check that every approach × language highlights a line on
every step, that the page opens on step 1, and that nothing scrolls sideways at
400px wide in either language.

## Burmese

Pages are bilingual, but **you don't need to write Burmese**. Any string can
be plain English, or `t(english, burmese)` from `kit.js`. A missing Burmese side
falls back to English, and `npm run check` lists it as a note, not a failure.

If you do translate: keep code, identifiers, problem titles and terms of art
(`array`, `hash map`, `stack`) in English; use Arabic numerals; and don't
translate idioms word for word. [docs/translation-review.md](docs/translation-review.md)
collects phrasings a native reader should check. Help there is very welcome.

## Pull request checklist

- [ ] `npm run check` passes
- [ ] `npm run verify -- <slug>` passes, with Go and Rust run (not skipped)
- [ ] every badge says what was actually run; every trap output was produced by running it
- [ ] opens on step 1; every approach × language highlights a line on every step
- [ ] no sideways scroll at 400px
- [ ] `npm run build` succeeds

## Using Claude Code

The repo ships a project skill, `.claude/skills/leetcode-solution-page/`. In
Claude Code, `/leetcode-solution-page <problem>` follows this guide end to end,
verification included. It holds a contribution to the same standard as a
hand-written one: the checklist above still applies.
