# Build progress — Easy track

Resume state for the interactive lesson build. Update the status column as each
lesson lands; everything needed to pick this up in a fresh session is here.

## Where we are

**Phase: 2 of 3 — lessons, three at a time.**

The x-sum page was written as one bespoke 4,000-line file. Fifteen more of
those would mean fifteen reimplementations of the same transport, code panel
and narration, all drifting apart. So the generic half gets built once as a kit
(`src/lib/`, `src/styles/kit.css`), Two Sum gets built on it as the worked
example, and only then do the rest fan out three at a time.

x-sum itself stays on its own code. It works, it is verified, and refactoring it
buys nothing.

| Phase | What | Status |
| --- | --- | --- |
| 1 | Shared lesson kit + Two Sum as the proof | **done** |
| 2 | Remaining 14 lessons, 3 at a time | in progress — 4 of 15 done |
| 3 | Cross-check pass: every page at 3 widths, both themes | not started |

## The plan per lesson

Each lesson shows a **brute force first, then the optimal solution** — the
brute force is also the oracle the optimal one is verified against. Solutions in
Ruby, Python, JavaScript, Go and Rust, every one compiled and run before it
ships, per `~/.claude/skills/leetcode-solution-page`.

| # | ID | Problem | Brute force | Optimal | Stage | Status |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | Two Sum | double loop O(n²) | hash map O(n) | strip + kv table | **done** |
| 2 | 20 | Valid Parentheses | strip pairs repeatedly O(n²) | stack O(n) | strip + stack | not started |
| 3 | 21 | Merge Two Sorted Lists | collect + sort | iterative dummy head / recursive | two chains → one | not started |
| 4 | 121 | Best Time to Buy and Sell Stock | every pair O(n²) | one pass, track min | bars + markers | **done** |
| 5 | 141 | Linked List Cycle | seen-set O(n) space | Floyd's two pointers O(1) | chain + 2 pointers | not started |
| 6 | 206 | Reverse Linked List | build new list | three-pointer in place / recursive | chain rewiring | not started |
| 7 | 226 | Invert Binary Tree | — | recursive DFS / iterative BFS | tree | not started |
| 8 | 104 | Maximum Depth of Binary Tree | — | recursive DFS / BFS levels | tree + counter | not started |
| 9 | 136 | Single Number | count map | XOR fold | strip + bit view | not started |
| 10 | 242 | Valid Anagram | sort both O(n log n) | count array O(n) | two strips + counts | **done** |
| 11 | 70 | Climbing Stairs | naive recursion O(2ⁿ) | memo → iterative O(1) space | recursion tree → DP row | not started |
| 12 | 169 | Majority Element | count map | Boyer–Moore vote | strip + candidate/count | not started |
| 13 | 283 | Move Zeroes | build new array | two pointers in place | strip + 2 pointers | **done** |
| 14 | 125 | Valid Palindrome | clean + reverse + compare | two pointers in place | strip + converging | not started |
| 15 | 543 | Diameter of Binary Tree | height at every node O(n²) | one DFS returning height O(n) | tree + per-node values | not started |

Where the brute force column says "—", the problem has no meaningful naive
version; the two columns are two honest approaches instead (recursive vs
iterative), which is the real teaching contrast there.

## Done already

- **x-sum** (3318 / 3321) — `/leetcode/x-sum`. Bespoke, not on the kit.

## To resume in a new session

1. Read this file and `~/.claude/skills/leetcode-solution-page/SKILL.md`
2. `node scripts/check-lessons.mjs` — structural check across every lesson
3. `npm run dev`, check the last lesson marked done still renders
4. Continue from the first row that is not done

## The kit

Lessons after x-sum are built on a shared framework, so a new one is a step
generator and a draw function rather than another 4,000-line page.

| File | What it holds |
| --- | --- |
| `src/lib/stepper.js` | transport, scrubber, keyboard, approach + language tabs, code panel, narration, variable row |
| `src/lib/stage.js` | `strip` `kv` `stack` `chain` `tree` `bars` `readout` `panels` |
| `src/styles/kit.css` | all of the above, in tokens |
| `src/layouts/Walkthrough.astro` | question / walkthrough / takeaway |

A lesson is three files and touches nothing shared:

```
src/lessons/<slug>/statement.html    the problem, quoted from LeetCode
src/lessons/<slug>/lesson.js         approaches, step generators, draw, CODE, mountLesson
src/pages/leetcode/<slug>.astro      wires them together, carries the takeaway
```

`src/lessons/two-sum/` is the worked example to copy from.

## Verification debt

Ruby, Python and JavaScript are verified by running, per lesson, against the
worked examples plus randomised cases.

**Go and Rust are written but not yet compiled** — neither toolchain is
installed locally and Docker is not running. Start OrbStack and this clears in
one sweep using `scripts/verify_solution.py` from the skill. Until then the
site's claim that every solution was compiled and run is true of three
languages out of five, and should not be repeated about the other two.

## Rules this build follows

- The brute force is the oracle. The optimal solution is verified against it,
  not against reasoning about it.
- Verify by running. `scripts/verify_solution.py` in the skill cross-checks all
  five languages; Go and Rust need Docker up.
- Every code block carries a badge saying exactly how it was verified.
- Extract code back out of the built page and run *that*, not the draft.
