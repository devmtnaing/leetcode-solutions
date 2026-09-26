"""Serialize and Deserialize Binary Tree — the corpus the page's badges describe.

The 2 examples, 6 edges (one node, a negative root, a left chain and a right
chain of 5, a complete tree of 15, values at ±1000), 15,000 random trees of
up to 9 nodes over -3..3 — repeated values, so a codec cannot cheat by
matching values — 5,000 of up to 300 over -1000..1000, and six at the 10⁴-node
constraint: left, right and zigzag chains (10⁴ calls deep for a recursive
codec), a random tree, a complete tree, and a chain of -1000s.

A line is the tree in LeetCode's level order ("" for the empty tree). Each
driver builds it, serializes it with one codec object, deserializes the
string with a second, and prints the rebuilt tree in level order — which
must equal the line. The oracle is the line itself.
"""
import os, random, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '_lib'))
from trees import chain, complete, drivers, from_level, level, random_tree

BIG_STACK = True   # the preorder codec recurses 10^4 deep on a chain

_ROUNDTRIP = {
    'ruby': ('ser(X(build(l.chomp)))', 'ser(deserialize(serialize(build(l.chomp))))'),
    'python': ('ser(Solution().X(build(l)))', 'ser(Codec().deserialize(Codec().serialize(build(l))))'),
    'javascript': ('ser(X(build(l)))', 'ser(deserialize(serialize(build(l))))'),
    'go': ('ser(X(build(sc.Text())))', 'ser(func() *TreeNode { c, d := Constructor(), Constructor(); return d.deserialize(c.serialize(build(sc.Text()))) }())'),
    'rust': ('ser(Solution::X(build(&l)))', 'ser({ let (c, d) = (Codec::new(), Codec::new()); d.deserialize(c.serialize(build(&l))) })'),
}
DRIVERS = drivers(ruby='X', python='X', javascript='X', go='X', rust='X', returns_tree=True)
for _lang, (_old, _new) in _ROUNDTRIP.items():
    assert DRIVERS[_lang].count(_old) == 1, _lang
    DRIVERS[_lang] = DRIVERS[_lang].replace(_old, _new)


def corpus():
    random.seed(297)
    trees = [from_level([1, 2, 3, None, None, 4, 5]), [],
             from_level([7]), from_level([-5]), chain(5), chain(5, lambda i: 'r'), complete(15),
             from_level([1000, -1000, 1000, None, -1000])]
    trees += [random_tree(random.randint(1, 9), (-3, 3)) for _ in range(15000)]
    trees += [random_tree(random.randint(1, 300), (-1000, 1000)) for _ in range(5000)]
    n = 10 ** 4
    neg = chain(n)
    for nd in neg:
        nd['v'] = -1000
    trees += [chain(n), chain(n, lambda i: 'r'), chain(n, lambda i: 'lr'[i % 2]),
              random_tree(n, (-1000, 1000)), complete(n), neg]
    return [(level(t), level(t)) for t in trees]
