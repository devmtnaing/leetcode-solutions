"""Binary Tree Maximum Path Sum — the corpus the page's badges describe.

The 2 examples, 5 edges (one node, one negative node, every value negative,
a chain whose best path skips its ends, a V of two long arms), 15,000 random
trees of up to 9 nodes over -5..5 — negatives everywhere, the case where
leaving a side out matters — 5,000 of up to 300 over -1000..1000, and six at
the 3 × 10⁴-node constraint: left, right and zigzag chains (3 × 10⁴ calls
deep), a random tree, a complete tree, and a chain of -1000s.

The largest possible sum is 3 × 10⁴ × 1000 = 3 × 10⁷, well inside a 32-bit
int. A line is the tree in LeetCode's level order; each driver prints the
sum.

Trying every node as the top re-measures the paths below it each time: O(n²),
so it skips the six trees at 3 × 10⁴.

The oracle turns the tree into an undirected graph and, from every node,
walks every simple path by BFS over (node, came-from) pairs keeping the best
running sum — for big trees it switches to an iterative post-order pass with
an explicit stack. Neither recurses.
"""
import os, random, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '_lib'))
from trees import chain, complete, drivers, from_level, level, random_tree

DRIVERS = drivers(ruby='max_path_sum', python='maxPathSum', javascript='maxPathSum', go='maxPathSum', rust='max_path_sum')
BIG_STACK = True   # the recursive listings go 3 x 10^4 deep on a chain

SKIP = {'every': lambda c: c.count(',') >= 20_000}


def all_paths(nodes):
    adj = [[] for _ in nodes]
    for i, nd in enumerate(nodes):
        for side in 'lr':
            if nd[side] is not None:
                adj[i].append(nd[side]); adj[nd[side]].append(i)
    best = None
    for s in range(len(nodes)):
        stack = [(s, -1, nodes[s]['v'])]
        while stack:
            u, came, total = stack.pop()
            best = total if best is None else max(best, total)
            for w in adj[u]:
                if w != came:
                    stack.append((w, u, total + nodes[w]['v']))
    return best


def post_order(nodes):
    order, stack = [], [0]
    while stack:
        u = stack.pop()
        order.append(u)
        for side in 'lr':
            if nodes[u][side] is not None:
                stack.append(nodes[u][side])
    down, best = {}, None
    for u in reversed(order):
        l = max(0, down.get(nodes[u]['l'], 0)) if nodes[u]['l'] is not None else 0
        r = max(0, down.get(nodes[u]['r'], 0)) if nodes[u]['r'] is not None else 0
        v = nodes[u]['v']
        best = v + l + r if best is None else max(best, v + l + r)
        down[u] = v + max(l, r)
    return best


def oracle(nodes):
    return all_paths(nodes) if len(nodes) <= 60 else post_order(nodes)


def corpus():
    random.seed(124)
    trees = [from_level([1, 2, 3]), from_level([-10, 9, 20, None, None, 15, 7]),
             from_level([5]), from_level([-3]), from_level([-2, -1, -3]),
             from_level([-5, 4, None, -1, None, 8]), from_level([1, 2, 3, 4, None, None, 5, 6, None, None, 7])]
    trees += [random_tree(random.randint(1, 9), (-5, 5)) for _ in range(15000)]
    trees += [random_tree(random.randint(1, 300), (-1000, 1000)) for _ in range(5000)]
    n = 3 * 10 ** 4
    neg = chain(n)
    for nd in neg:
        nd['v'] = -1000
    trees += [chain(n), chain(n, lambda i: 'r'), chain(n, lambda i: 'lr'[i % 2]),
              random_tree(n, (-1000, 1000)), complete(n), neg]
    return [(level(t), str(oracle(t))) for t in trees]
