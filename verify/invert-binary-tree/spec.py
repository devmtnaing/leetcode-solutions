"""Invert Binary Tree — the corpus the page's badges describe.

The 3 examples, 4 edges, 15,000 random trees of up to 9 nodes over -3..3,
5,000 of up to 100 nodes over -100..100, and three 100-node chains (all-left,
all-right, zigzag) — against a reference that builds a new mirrored tree
rather than swapping in place. Answers are the inverted tree in level order.
"""
import os, random, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '_lib'))
from trees import chain, drivers, from_level, level, random_tree

DRIVERS = drivers(ruby='invert_tree', python='invertTree', javascript='invertTree', go='invertTree',
                  rust='invert_tree', returns_tree=True)


def mirrored(nodes):
    """A new tree: node i's copy takes its right child's copy on the left."""
    out = [dict(v=n['v'], l=n['r'], r=n['l']) for n in nodes]
    return out


def corpus():
    random.seed(226)
    trees = [from_level([4, 2, 7, 1, 3, 6, 9]), from_level([2, 1, 3]), []]
    trees += [from_level([1]), from_level([1, 2]), from_level([1, None, 2]), from_level([0, 0, 0])]
    trees += [random_tree(random.randint(1, 9), (-3, 3)) for _ in range(15000)]
    trees += [random_tree(random.randint(1, 100)) for _ in range(5000)]
    trees += [chain(100), chain(100, lambda i: 'r'), chain(100, lambda i: 'lr'[i % 2])]
    return [(level(t), level(mirrored(t))) for t in trees]
