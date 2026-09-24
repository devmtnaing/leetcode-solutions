---
name: leetcode-solution-page
description: Add an interactive solution page for a LeetCode problem to this repo — the verbatim statement, a part 1 widget, a step-by-step walkthrough of each approach drawing the state the code really holds, and complete solutions in Ruby, Python, JavaScript, Go and Rust, every one run against an independent oracle before it ships. Use it when someone wants a page for a problem (number, title, URL or pasted statement), wants to fix or extend an existing page, or asks to do one "like two-sum" or "like x-sum".
---

# Adding a solution page

A reader returns to these pages to relearn a problem, watch the algorithm
move, and copy code that is known to work. Three things make a page worth
keeping: the walkthrough shows real algorithm state, every listing has been
run, and the page says only what is true.

**CONTRIBUTING.md is the procedure.** Read it first and follow it step by
step. This skill adds the judgement the procedure can't encode.

## Before writing anything

- Pick the problem's LeetCode slug. The folder is `src/lessons/<slug>/`.
- Fetch the statement with the GraphQL command in CONTRIBUTING.md. A plain
  `curl` of the problem page gets a Cloudflare 403; that means blocked, not
  missing.
- Check whether the problem has a harder twin (I/II with bigger constraints,
  like 3318/3321 on x-sum). If so the page should cover both: the approach
  that passes the easy one, and the approach the hard one needs.
- Open `src/lessons/two-sum/` (the kit example) and `src/lessons/x-sum/` (the
  reference design). Every page has x-sum's components, in x-sum's order.

## The order of work

1. **The brute force, first.** It's the oracle; confirm it on the examples.
2. **Every listing as a file**, with ` ⟦key⟧` markers on highlighted lines,
   then `python3 scripts/verify/code-table.py <dir> <modes>`. Generate, don't
   retype.
3. **`verify/<slug>/spec.py` and `adapter.mjs`, then `npm run verify --
   <slug>`** before any prose. Fix the code until everything passes. If Docker
   is down, say so and start it (`open -a OrbStack` or Docker Desktop). Never
   let a skipped language pass as verified.
4. **The step generators and the stage.** Decide what the stage draws using
   `references/visualization.md`: what the algorithm carries between steps, in
   the shape the code holds it.
5. **The widget**, for the one idea the statement hinges on.
6. **Prose in `page.js`.** Every trap's wrong output comes from running the
   wrong code. Every cost number is measured (name the machine) or labelled
   computed.
7. **`npm run check`**, `npm run verify -- <slug>` again, then the browser:
   every approach × language highlights a line on every step, the page opens on
   step 1, and nothing scrolls sideways at 400px in either language.

## Judgement calls

**A badge says exactly what happened.** `ran here · 20,009 cases`. If a
recursive listing is correct but overflows the default stack at the
constraint, badge that approach `ran here · stack overflows at 10⁴ deep` (a
badge can be per approach: `{ dfs: '…', bfs: '…' }`) and add a `caveats`
note with the measured limit. Measure stack limits cold, one deep input per
process: a JIT warmed up by small cases hides the overflow. Recursive lessons
set `BIG_STACK = True` in their spec to prove correctness with a larger stack.

**A measurement that contradicts the complexity is a warning.** When the
stopwatch and the analysis disagree, find out why the machine is flattering
you before publishing a number.

**One vocabulary.** Name approaches the same way in the mode card, the code
panel caption, part 3 and the cost table.

**Details wait to be asked for.** Statement, examples and stepper are visible.
Gotchas and proofs go in collapsed notes phrased as questions.

**Open on step 1.** An input change resets to step 1 too.

**Snapshots copy state.** A step that shares a mutable array with the next
draws the final state on every frame.

## Burmese

English-only is acceptable, because a missing Burmese side falls back to
English. When you translate, follow `references/bilingual.md`, and say plainly
that the translation needs a native reader. It is the one thing verification
can't check.

## Before handing it over

- `npm run check` passes (notes about missing Burmese are fine)
- `npm run verify -- <slug>` passes with Go and Rust actually run
- the page sits next to x-sum at the same width and has the same parts
- the checklist at the end of CONTRIBUTING.md
