"""Maximum Depth of Binary Tree — the corpus the page's badges describe.

The 2 examples, 4 edge shapes, 15,000 random trees of up to 9 nodes, 5,000 of
up to 300, and four at the 10⁴-node constraint (all-left, all-right and zigzag
chains, one random tree) — against an iterative depth count with an explicit
stack, which shares nothing with either listing.
"""
import os, random, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '_lib'))
from trees import chain, drivers, from_level, level, random_tree

DRIVERS = drivers(ruby='max_depth', python='maxDepth', javascript='maxDepth', go='maxDepth', rust='max_depth')
BIG_STACK = True   # recursive Ruby and JS overflow their default stacks at 10⁴ deep


def depth(nodes):
    best, todo = 0, [(0, 1)] if nodes else []
    while todo:
        i, d = todo.pop()
        best = max(best, d)
        for side in 'lr':
            if nodes[i][side] is not None:
                todo.append((nodes[i][side], d + 1))
    return best


def corpus():
    random.seed(104)
    trees = [from_level([3, 9, 20, None, None, 15, 7]), from_level([1, None, 2]),
             [], from_level([0]), from_level([1, 2]), from_level([1, None, 2, None, 3])]
    trees += [random_tree(random.randint(1, 9), (-3, 3)) for _ in range(15000)]
    trees += [random_tree(random.randint(1, 300)) for _ in range(5000)]
    n = 10 ** 4
    trees += [chain(n), chain(n, lambda i: 'r'), chain(n, lambda i: 'lr'[i % 2]), random_tree(n)]
    return [(level(t), str(depth(t))) for t in trees]
