# Interview problem list — senior track

45 problems, evenly split: 15 Easy, 15 Medium, 15 Hard. Metadata verified against
LeetCode's API on 22 September 2026 — IDs, titles and difficulties are theirs, not remembered.
None are Premium-locked.

## How this list was chosen

I pulled three of LeetCode's own curated interview lists — **Top Interview 150**,
**LeetCode 75** and **Top 100 Liked** (325 entries, 234 distinct problems) — and looked
at the overlap. 11 problems appear in all three; 69 appear in two. Those got first
claim on a slot, and the rest were filled to cover patterns that would otherwise be
missing, plus the design-flavoured problems that show up disproportionately at senior
level.

**On "2026 trending":** treat that phrase carefully. Per-company frequency data is
behind LeetCode Premium, and most "trending in <year>" lists online are recycled from
the same canonical sets. What is defensible is the above: these are the problems
LeetCode's own interview lists agree on as of today, filtered for pattern coverage.
The underlying set moves slowly — the patterns have barely changed in a decade.

## What actually separates a senior loop

The problems below are table stakes; clearing them is necessary and nowhere near
sufficient. At senior level interviewers are mostly listening for:

- **The trade-off, stated before you code.** "Heap is O(n log k) and streams; quickselect
  is O(n) average but mutates the input" is the answer. The code is the footnote.
- **Follow-ups**, which is where the signal is. Can you do it in O(1) space? What if the
  input does not fit in memory? What if it arrives as a stream?
- **Edge cases named before they are tested** — empty input, one element, all duplicates,
  negative values, integer width.
- **Code someone else could maintain.** Named helpers, honest variable names, no cleverness
  that needs a paragraph to defend.

Also: at most big-tech companies the senior bar is carried more by system design and
behavioural rounds than by the coding round. This list is for keeping the coding round
from being the thing that sinks you.

## Easy — the fundamentals, automatic

| # | Problem | Pattern | Why it's here |
|---|---------|---------|----------------|
| 1 | [Two Sum](https://leetcode.com/problems/two-sum/) | Hash map | The baseline everything else is measured against. Say the brute force, then the trade you make to beat it. |
| 20 | [Valid Parentheses](https://leetcode.com/problems/valid-parentheses/) | Stack | The smallest problem where a stack is obviously right. Watch the empty-stack and leftover cases. |
| 21 | [Merge Two Sorted Lists](https://leetcode.com/problems/merge-two-sorted-lists/) | Linked list merge | Rehearsal for Merge k Sorted Lists. Get the dummy-head idiom automatic. |
| 70 | [Climbing Stairs](https://leetcode.com/problems/climbing-stairs/) | 1-D DP | The smallest honest DP. Derive the recurrence out loud, then collapse the array to two variables. |
| 104 | [Maximum Depth of Binary Tree](https://leetcode.com/problems/maximum-depth-of-binary-tree/) | Tree depth | In all three canonical lists. The shape of every tree recursion you'll write. |
| 121 | [Best Time to Buy and Sell Stock](https://leetcode.com/problems/best-time-to-buy-and-sell-stock/) | Running minimum | A one-pass DP in disguise; the follow-ups (II, III, with cooldown) are a whole family. |
| 125 | [Valid Palindrome](https://leetcode.com/problems/valid-palindrome/) | Two pointers | Half the difficulty is the input parsing, which is exactly what interviewers watch. |
| 136 | [Single Number](https://leetcode.com/problems/single-number/) | XOR | In all three lists. Know why XOR works, and the variants where a number appears three times. |
| 141 | [Linked List Cycle](https://leetcode.com/problems/linked-list-cycle/) | Floyd's two pointers | The follow-up — return the cycle's start — is the part people fumble. |
| 169 | [Majority Element](https://leetcode.com/problems/majority-element/) | Boyer-Moore | Worth it for the follow-up: do it in O(1) space and explain why the vote works. |
| 206 | [Reverse Linked List](https://leetcode.com/problems/reverse-linked-list/) | Pointer surgery | Prerequisite for Reverse Nodes in k-Group. Do it iteratively and recursively. |
| 226 | [Invert Binary Tree](https://leetcode.com/problems/invert-binary-tree/) | Tree recursion | Trivial once seen, and still asked. Be ready to do it with an explicit stack. |
| 242 | [Valid Anagram](https://leetcode.com/problems/valid-anagram/) | Counting | The counting habit that Group Anagrams and Minimum Window Substring both need. |
| 283 | [Move Zeroes](https://leetcode.com/problems/move-zeroes/) | In-place two pointers | In-place array surgery without extra space — the habit that Remove Duplicates and Sort Colors reuse. |
| 543 | [Diameter of Binary Tree](https://leetcode.com/problems/diameter-of-binary-tree/) | Tree DP | The Easy rehearsal for Binary Tree Maximum Path Sum: return one thing, record another. |

## Medium — where the loop is actually decided

| # | Problem | Pattern | Why it's here |
|---|---------|---------|----------------|
| 3 | [Longest Substring Without Repeating Characters](https://leetcode.com/problems/longest-substring-without-repeating-characters/) | Sliding window | The template for every variable-width window. Know when to shrink and why. |
| 15 | [3Sum](https://leetcode.com/problems/3sum/) | Sort + two pointers | The deduplication is the interview. Most failures are duplicate triples, not the algorithm. |
| 33 | [Search in Rotated Sorted Array](https://leetcode.com/problems/search-in-rotated-sorted-array/) | Modified binary search | Binary search where the invariant is not sortedness. State your invariant before coding. |
| 46 | [Permutations](https://leetcode.com/problems/permutations/) | Backtracking | The backtracking skeleton — choose, recurse, undo — that Word Search II also uses. |
| 48 | [Rotate Image](https://leetcode.com/problems/rotate-image/) | Matrix in-place | Transpose-then-reverse. Expect the follow-up asking for it without extra space. |
| 53 | [Maximum Subarray](https://leetcode.com/problems/maximum-subarray/) | Kadane | Then the divide-and-conquer version, which is what the follow-up usually wants. |
| 56 | [Merge Intervals](https://leetcode.com/problems/merge-intervals/) | Intervals | The whole interval family — insert, erase, meeting rooms — starts here. |
| 146 | [LRU Cache](https://leetcode.com/problems/lru-cache/) | Design: hash + doubly linked list | The most-asked design question at this level. O(1) for both operations, and be ready for LFU. |
| 200 | [Number of Islands](https://leetcode.com/problems/number-of-islands/) | Grid traversal | BFS and DFS both work; the follow-up about very large grids is where senior answers separate. |
| 207 | [Course Schedule](https://leetcode.com/problems/course-schedule/) | Topological sort | Cycle detection framed as a real problem. Know Kahn's and the DFS-colouring version. |
| 208 | [Implement Trie (Prefix Tree)](https://leetcode.com/problems/implement-trie-prefix-tree/) | Design: trie | In all three lists, and the data structure Word Search II is built on. |
| 215 | [Kth Largest Element in an Array](https://leetcode.com/problems/kth-largest-element-in-an-array/) | Heap / quickselect | In all three lists. Heap is O(n log k), quickselect O(n) average — the trade-off is the answer. |
| 236 | [Lowest Common Ancestor of a Binary Tree](https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/) | Tree recursion | In all three lists. The version without parent pointers is the one asked. |
| 238 | [Product of Array Except Self](https://leetcode.com/problems/product-of-array-except-self/) | Prefix / suffix | In all three lists. The no-division, O(1)-extra-space constraint is the whole point. |
| 322 | [Coin Change](https://leetcode.com/problems/coin-change/) | Unbounded knapsack | The DP everyone should be able to derive from scratch, including why greedy fails. |

## Hard — pattern depth and composure

| # | Problem | Pattern | Why it's here |
|---|---------|---------|----------------|
| 4 | [Median of Two Sorted Arrays](https://leetcode.com/problems/median-of-two-sorted-arrays/) | Binary search on partition | Hard for the right reason: the invariant is subtle. Worth the time it takes. |
| 23 | [Merge k Sorted Lists](https://leetcode.com/problems/merge-k-sorted-lists/) | Heap / divide and conquer | Two good answers with different complexities — exactly the comparison seniors are asked to make. |
| 25 | [Reverse Nodes in k-Group](https://leetcode.com/problems/reverse-nodes-in-k-group/) | Pointer surgery | Everything Reverse Linked List taught, under a constraint that punishes sloppiness. |
| 42 | [Trapping Rain Water](https://leetcode.com/problems/trapping-rain-water/) | Two pointers / monotonic stack | Three legitimate solutions at different space costs. A perfect trade-off conversation. |
| 51 | [N-Queens](https://leetcode.com/problems/n-queens/) | Backtracking with pruning | Constraint propagation and clean state management under pressure. |
| 76 | [Minimum Window Substring](https://leetcode.com/problems/minimum-window-substring/) | Sliding window with counts | The hardest common window problem. The have/need bookkeeping is what trips people. |
| 84 | [Largest Rectangle in Histogram](https://leetcode.com/problems/largest-rectangle-in-histogram/) | Monotonic stack | The monotonic-stack archetype, and the engine behind Maximal Rectangle. |
| 124 | [Binary Tree Maximum Path Sum](https://leetcode.com/problems/binary-tree-maximum-path-sum/) | Tree DP | Return one value, record another — the pattern Diameter rehearses, plus negative handling. |
| 127 | [Word Ladder](https://leetcode.com/problems/word-ladder/) | BFS on an implicit graph | Recognising a graph that was never given to you as one. Bidirectional BFS is the follow-up. |
| 212 | [Word Search II](https://leetcode.com/problems/word-search-ii/) | Trie + backtracking | Two structures combined, which is what makes it senior-flavoured. |
| 224 | [Basic Calculator](https://leetcode.com/problems/basic-calculator/) | Parsing with a stack | Closest thing on this list to real engineering. Expect the follow-up adding * and /. |
| 239 | [Sliding Window Maximum](https://leetcode.com/problems/sliding-window-maximum/) | Monotonic deque | Why a heap is O(n log k) and the deque is O(n) — a clean complexity argument. |
| 295 | [Find Median from Data Stream](https://leetcode.com/problems/find-median-from-data-stream/) | Design: two heaps | A design question wearing an algorithm costume. Follow-ups bound the value range. |
| 297 | [Serialize and Deserialize Binary Tree](https://leetcode.com/problems/serialize-and-deserialize-binary-tree/) | Design: encoding | You choose the format, so you must defend it. Genuinely open-ended. |
| 329 | [Longest Increasing Path in a Matrix](https://leetcode.com/problems/longest-increasing-path-in-a-matrix/) | Memoised DFS | DP on a DAG you have to notice is a DAG. |

## Ladders worth walking in order

Several of these rehearse each other. Doing the pair back to back is worth more than
doing twice as many unrelated problems:

| Rehearsal | Real thing | Shared idea |
|-----------|------------|-------------|
| 543 Diameter of Binary Tree | 124 Binary Tree Maximum Path Sum | return one value, record another |
| 206 Reverse Linked List | 25 Reverse Nodes in k-Group | pointer surgery under a constraint |
| 21 Merge Two Sorted Lists | 23 Merge k Sorted Lists | merging, then the k-way trade-off |
| 242 Valid Anagram | 76 Minimum Window Substring | have/need counting |
| 3 Longest Substring Without Repeating | 239 Sliding Window Maximum | window bookkeeping, then monotonic deque |
| 208 Implement Trie | 212 Word Search II | trie, then trie + backtracking |
| 46 Permutations | 51 N-Queens | backtracking, then pruning |
| 200 Number of Islands | 127 Word Ladder | explicit graph, then implicit one |
| 70 Climbing Stairs | 322 Coin Change | 1-D DP, then unbounded knapsack |

## Suggested order

1. **All 15 Easy first**, quickly — they are calibration, not study. If any takes more
   than 15 minutes, that is the gap to close before moving on.
2. **Medium in pattern groups**, not in list order: windows, then binary search, then
   trees, then graphs, then DP, then design.
3. **Hard last, and slowly.** Two or three a week, each written up. Volume stops helping
   here; being able to re-derive the idea a month later is what counts.

## Tracking

Machine-readable copy of this list, with tags and acceptance rates, is in
`problem-list.json` next to this file — that is what the page-builder skill can iterate
over when you start making walkthroughs.
