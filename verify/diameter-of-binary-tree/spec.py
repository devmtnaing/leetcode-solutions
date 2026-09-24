"""Diameter of Binary Tree — the corpus the page's badges describe.

The 2 examples, a single node, 15,000 random trees of up to 9 nodes, 5,000 of
up to 300, and six at the 10⁴-node constraint (all-left, all-right and zigzag
chains, a random tree, a complete tree, a deep chain that forks). The oracle
treats the tree as an undirected graph and finds the longest shortest path —
from every node when small, by double BFS when big — sharing nothing with the
height recursion both listings use.
"""
import collections, os, random, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '_lib'))
from trees import chain, complete, drivers, from_level, level, random_tree

DRIVERS = drivers(ruby='diameter_of_binary_tree', python='diameterOfBinaryTree',
                  javascript='diameterOfBinaryTree', go='diameterOfBinaryTree', rust='diameter_of_binary_tree')
BIG_STACK = True   # recursive Ruby and JS overflow their default stacks at 10⁴ deep


def bfs(adj, start):
    dist = [-1] * len(adj)
    dist[start] = 0
    q = collections.deque([start])
    while q:
        u = q.popleft()
        for w in adj[u]:
            if dist[w] < 0:
                dist[w] = dist[u] + 1
                q.append(w)
    return dist


def diameter(nodes):
    adj = [[] for _ in nodes]
    for i, node in enumerate(nodes):
        for side in 'lr':
            if node[side] is not None:
                adj[i].append(node[side])
                adj[node[side]].append(i)
    if len(nodes) <= 40:
        return max(max(bfs(adj, s)) for s in range(len(nodes)))
    d = bfs(adj, 0)
    return max(bfs(adj, d.index(max(d))))


def forked_chain():
    """5,000 nodes straight down, then two arms of 2,400 under the last one."""
    nodes = chain(5000)
    for side in 'lr':
        prev = None
        for _ in range(2400):
            nodes.append(dict(v=0, l=None, r=None))
            k = len(nodes) - 1
            if prev is None: nodes[4999][side] = k
            else: nodes[prev][side] = k
            prev = k
    return nodes


def corpus():
    random.seed(543)
    trees = [from_level([1, 2, 3, 4, 5]), from_level([1, 2]), from_level([1])]
    trees += [random_tree(random.randint(1, 9), (-3, 3)) for _ in range(15000)]
    trees += [random_tree(random.randint(1, 300)) for _ in range(5000)]
    n = 10 ** 4
    trees += [chain(n), chain(n, lambda i: 'r'), chain(n, lambda i: 'lr'[i % 2]),
              random_tree(n), complete(n), forked_chain()]
    return [(level(t), str(diameter(t))) for t in trees]
