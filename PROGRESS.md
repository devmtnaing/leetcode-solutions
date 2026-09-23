# Build progress — Easy track

Resume state for the interactive lesson build. Update the status column as each
lesson lands; everything needed to pick this up in a fresh session is here.

## Where we are

**Phase: 2c — converting every lesson to the x-sum format.**

The first ten lessons were built on a kit with its own layout, not x-sum's, and
the three "retrofitted" ones only added a widget and Burmese to that wrong
layout. The kit now renders x-sum's own markup with x-sum's stylesheet, and the
checker fails any lesson that is missing an x-sum component.

**In x-sum format: all 10 built lessons.** Two Sum was the worked example;
Valid Parentheses, Valid Palindrome, Single Number, Reverse Linked List, Merge
Two Sorted Lists and Linked List Cycle were converted on 2026-09-23, and Best
Time, Move Zeroes and Valid Anagram in a parallel session. `check-lessons.mjs`
passes all ten.

| Phase | What | Status |
| --- | --- | --- |
| 1 | Shared lesson kit + Two Sum as the proof | **done** |
| 2 | Remaining 14 lessons, 3 at a time | in progress — 12 of 15 done |
| 2b | Retrofit the 10 built lessons to full spec | in progress — 3 of 10 |
| 3 | Cross-check pass: every page at 3 widths, both themes, both languages | not started |

## The plan per lesson

Each lesson shows a **brute force first, then the optimal solution** — the
brute force is also the oracle the optimal one is verified against. Solutions in
Ruby, Python, JavaScript, Go and Rust, every one compiled and run before it
ships, per `~/.claude/skills/leetcode-solution-page`.

| # | ID | Problem | Brute force | Optimal | Stage | Status |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | Two Sum | double loop O(n²) | hash map O(n) | strip + kv table | **done** |
| 2 | 20 | Valid Parentheses | strip pairs repeatedly O(n²) | stack O(n) | strip + stack | **done** |
| 3 | 21 | Merge Two Sorted Lists | collect + sort | iterative dummy head / recursive | two chains → one | **done** |
| 4 | 121 | Best Time to Buy and Sell Stock | every pair O(n²) | one pass, track min | bars + markers | **done** |
| 5 | 141 | Linked List Cycle | seen-set O(n) space | Floyd's two pointers O(1) | chain + 2 pointers | **done** |
| 6 | 206 | Reverse Linked List | build new list | three-pointer in place / recursive | chain rewiring | **done** |
| 7 | 226 | Invert Binary Tree | — | recursive DFS / iterative BFS | tree + call stack / queue | **done** |
| 8 | 104 | Maximum Depth of Binary Tree | — | recursive DFS / BFS levels | tree + call stack / level | **done** |
| 9 | 136 | Single Number | count map | XOR fold | strip + bit view | **done** |
| 10 | 242 | Valid Anagram | sort both O(n log n) | count array O(n) | two strips + counts | **done** |
| 11 | 70 | Climbing Stairs | naive recursion O(2ⁿ) | memo → iterative O(1) space | recursion tree → DP row | not started |
| 12 | 169 | Majority Element | count map | Boyer–Moore vote | strip + candidate/count | not started |
| 13 | 283 | Move Zeroes | build new array | two pointers in place | strip + 2 pointers | **done** |
| 14 | 125 | Valid Palindrome | clean + reverse + compare | two pointers in place | strip + converging | **done** |
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
generator and a draw function rather than another 4,000-line page. The layout,
the shared files and how to add a lesson are in the README, under "Adding an
interactive lesson". `src/lessons/two-sum/` is the worked example to copy from.

## Verification

All ten lessons: **every listing ran in all five languages** — about 20,000
cases per lesson against an independent reference, with cases at the full
constraint. Go and Rust run in Docker: `open -a OrbStack`, then golang:1.23-alpine
and rust:1-slim (rustc 1.98). The rendered part 3 code was hashed and matches
the files that ran, byte for byte.

Running them caught three real bugs in shipped code: recursive Python for
Reverse Linked List hit RecursionError at 5,000 nodes (now raises the limit);
the Linked List Cycle Rust listings lacked the `use` lines to compile; Valid
Anagram's Go sort listing used `sort` without importing it.

## Translation review — needs a native reader

Burmese coverage is complete (a scan of every page in မြန်မာ mode finds no
untranslated prose — only problem titles and notation, which stay English by
design) and the known calques in the skill's bilingual notes are absent. What no
check can establish is whether the prose reads naturally. A native reader should
look first at step narration, which was translated in bulk, and at any idiom
carried over from English.

## Rules this build follows

- The brute force is the oracle. The optimal solution is verified against it,
  not against reasoning about it.
- Verify by running. `scripts/verify_solution.py` in the skill cross-checks all
  five languages; Go and Rust need Docker up.
- Every code block carries a badge saying exactly how it was verified.
- Extract code back out of the built page and run *that*, not the draft.
