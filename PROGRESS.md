# Build progress — Easy track

Resume state for the interactive lesson build. Update the status column as each
lesson lands; everything needed to pick this up in a fresh session is here.

## Where we are

**Phase: 1 of 3 — building the shared lesson kit.**

The x-sum page was written as one bespoke 4,000-line file. Fifteen more of
those would mean fifteen reimplementations of the same transport, code panel
and narration, all drifting apart. So the generic half gets built once as a kit
(`src/lib/`, `src/styles/kit.css`), Two Sum gets built on it as the worked
example, and only then do the rest fan out three at a time.

x-sum itself stays on its own code. It works, it is verified, and refactoring it
buys nothing.

| Phase | What | Status |
| --- | --- | --- |
| 1 | Shared lesson kit + Two Sum as the proof | in progress |
| 2 | Remaining 14 lessons, 3 at a time | not started |
| 3 | Cross-check pass: every page at 3 widths, both themes | not started |

## The plan per lesson

Each lesson shows a **brute force first, then the optimal solution** — the
brute force is also the oracle the optimal one is verified against. Solutions in
Ruby, Python, JavaScript, Go and Rust, every one compiled and run before it
ships, per `~/.claude/skills/leetcode-solution-page`.

| # | ID | Problem | Brute force | Optimal | Stage | Status |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | Two Sum | double loop O(n²) | hash map O(n) | strip + kv table | not started |
| 2 | 20 | Valid Parentheses | strip pairs repeatedly O(n²) | stack O(n) | strip + stack | not started |
| 3 | 21 | Merge Two Sorted Lists | collect + sort | iterative dummy head / recursive | two chains → one | not started |
| 4 | 121 | Best Time to Buy and Sell Stock | every pair O(n²) | one pass, track min | bars + markers | not started |
| 5 | 141 | Linked List Cycle | seen-set O(n) space | Floyd's two pointers O(1) | chain + 2 pointers | not started |
| 6 | 206 | Reverse Linked List | build new list | three-pointer in place / recursive | chain rewiring | not started |
| 7 | 226 | Invert Binary Tree | — | recursive DFS / iterative BFS | tree | not started |
| 8 | 104 | Maximum Depth of Binary Tree | — | recursive DFS / BFS levels | tree + counter | not started |
| 9 | 136 | Single Number | count map | XOR fold | strip + bit view | not started |
| 10 | 242 | Valid Anagram | sort both O(n log n) | count array O(n) | two strips + counts | not started |
| 11 | 70 | Climbing Stairs | naive recursion O(2ⁿ) | memo → iterative O(1) space | recursion tree → DP row | not started |
| 12 | 169 | Majority Element | count map | Boyer–Moore vote | strip + candidate/count | not started |
| 13 | 283 | Move Zeroes | build new array | two pointers in place | strip + 2 pointers | not started |
| 14 | 125 | Valid Palindrome | clean + reverse + compare | two pointers in place | strip + converging | not started |
| 15 | 543 | Diameter of Binary Tree | height at every node O(n²) | one DFS returning height O(n) | tree + per-node values | not started |

Where the brute force column says "—", the problem has no meaningful naive
version; the two columns are two honest approaches instead (recursive vs
iterative), which is the real teaching contrast there.

## Done already

- **x-sum** (3318 / 3321) — `/leetcode/x-sum`. Bespoke, not on the kit.

## To resume in a new session

1. Read this file and `~/.claude/skills/leetcode-solution-page/SKILL.md`
2. `npm run dev`, check the last lesson marked done still renders
3. Continue from the first row that is not done

## Rules this build follows

- The brute force is the oracle. The optimal solution is verified against it,
  not against reasoning about it.
- Verify by running. `scripts/verify_solution.py` in the skill cross-checks all
  five languages; Go and Rust need Docker up.
- Every code block carries a badge saying exactly how it was verified.
- Extract code back out of the built page and run *that*, not the draft.
