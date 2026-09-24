# Choosing what the stage draws

The stage is the difference between a page that teaches and a page that
decorates. Get this wrong and you have an animated list of numbers.

## The question to ask

**What does this algorithm carry between steps, and in what shape does the code
hold it?**

Draw that, in that shape. Not a prettier abstraction of it — the actual
structure, because the reader is about to write code that manipulates exactly
this.

The corollary: when two approaches differ only in their data structure, they
still need different stages. The container *is* the lesson. Drawing heaps as
sorted rows would hide the one idea heaps exist to teach.

## Patterns by algorithm family

**Sliding window with a running aggregate.** An array strip with the window
banded, plus whatever the window maintains. Mark the element entering and the
one leaving on the same frame — the reader needs to see the two-sided update.

**Two-set / partition problems** (top-k, median-of-stream, k-closest). Two
regions with a visible barrier between them, an invariant stated on the barrier
("every TOP card outranks every REST card"), and a running total that changes
only when something crosses. Steps: detach → re-enter → rebalance → record.

**Heaps.** Lay entries out by level with the root marked, because "only the
root is ever read" is the point. If the algorithm uses lazy deletion, stale
entries must be *visible* — greyed, struck through, tagged with the value that
made them stale — and their discard needs its own frame. Show the count of live
entries against total entries; that gap is the whole trick.

**Monotonic stack / queue.** A stack that visibly pops before it pushes, with
the popped elements shown leaving. The narration should say what invariant the
pop restores.

**DP tables.** A grid with the current cell lit and its dependencies
highlighted in a second colour. Fill order matters — animate it in the order
the loops actually run, since that is what people get wrong.

**Graph / BFS / DFS.** Nodes and edges with a frontier set drawn separately
from the visited set. The queue or stack contents deserve their own strip.

**Binary search.** The array with `lo`, `hi` and `mid` marked, and the half
being discarded dimmed rather than removed, so the reader sees what was ruled
out and why.

**Prefix sums / difference arrays.** Two rows — the original and the derived —
with the cell being computed linked to the cells it reads.

## Step granularity

Aim for one step per meaningful state change.

A good test: if a step's narration cannot say something specific about *this*
step — naming the values involved and what changed — it is too fine and should
merge with its neighbour. If a step's narration needs "and then", it is too
coarse and should split.

Err toward splitting when the split reveals a moment people get wrong. Detach
and re-insert as one step hides the exact hazard; as two steps it teaches it.

## Narration that earns its place

Write about *this* step, with its actual values. A line that reads the same on
every window is noise the reader learns to skip — and worse, it is often
subtly wrong somewhere.

Compare:

- Weak: "Sort by [count, value] descending. Ties fall the right way on their own."
- Strong: "Sort by [count, value] descending: `2×3` ranks first. **4** and **3**
  both appear 1 time, so 4 ranks higher for being the bigger value — which is
  what decides the cut here."

The second names the tie the window actually had, and says when it mattered.
The first repeated identically on every window, and its claim about comparators
was false in two of the five languages.

## A widget for the statement

Part 1 gets one small interactive piece, separate from the stepper, teaching
the single idea the problem hinges on. Not the algorithm — the *definition*.

Pick the one parameter whose meaning people miss and let them drag it:

- a top-k rule → a slider for `k`, showing which elements survive
- a constraint like "at most two distinct" → a toggle for the limit
- a tie-break rule → a control that produces ties, and a line naming which one won

Keep it to one window or one small input. It answers "what is being asked",
and the stepper answers "how do we compute it".

## Highlight vocabulary

Use a consistent, small set across every stage, so colour means the same thing
everywhere:

| State | Treatment |
|---|---|
| in the active window | amber band |
| entering / leaving | green outline / dashed clay |
| promoted / demoted | green fill / clay fill |
| freshly inserted | accent ring |
| being compared | amber outline on both |
| stale / doomed | dimmed, dashed, struck through, tagged |
| discarded this frame | clay fill, full opacity |

Semantic colours stay distinct from the accent, so "moved up" never reads as
"selected".
