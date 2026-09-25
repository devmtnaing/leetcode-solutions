"""Lowest Common Ancestor of a Binary Tree — the corpus the page's badges describe.

The 3 examples, 4 edges (p is q's parent, p is the root, two leaves of a
chain, a two-node tree), 15,000 random trees of 2 to 12 nodes, 5,000 of up
to 400, and six at scale: a random tree and a complete tree of 10⁵ nodes,
left and zigzag chains of 10⁴, and left and right chains of 10⁵ with p and q
near the bottom. Values are unique, as the statement promises; p and q are
two different values in the tree. A line is "tree|p|q"; each driver finds
the two nodes by value, calls the listing, and prints the answer's value.

The oracle walks from the root to each of p and q, keeping the paths, and
returns the last node the two paths share.
"""
import os, random, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '_lib'))
import trees
from trees import chain, complete, from_level, level, random_tree

_MAIN = {
    'ruby': ("STDIN.each_line { |l| puts {CALL}(build(l.chomp)) }\n",
             "def find(r, v); st = [r]; until st.empty?; n = st.pop; next unless n; return n if n.val == v; st << n.left << n.right; end; end\n"
             "STDIN.each_line { |l| t, a, b = l.chomp.split('|'); r = build(t); puts lowest_common_ancestor(r, find(r, a.to_i), find(r, b.to_i)).val }\n"),
    'python': ("print('\\n'.join(str(Solution().{CALL}(build(l))) for l in sys.stdin.read().split('\\n')[:-1]))\n",
               "def find(r, v):\n    st = [r]\n    while st:\n        n = st.pop()\n        if n is None: continue\n        if n.val == v: return n\n        st.append(n.left); st.append(n.right)\n"
               "_out = []\nfor l in sys.stdin.read().split('\\n')[:-1]:\n    t, a, b = l.split('|'); r = build(t)\n    _out.append(str(Solution().lowestCommonAncestor(r, find(r, int(a)), find(r, int(b))).val))\nprint('\\n'.join(_out))\n"),
    'javascript': ("console.log(L.map((l) => String({CALL}(build(l)))).join('\\n'));\n",
                   "function find(r, v) { const st = [r]; while (st.length) { const n = st.pop(); if (!n) continue; if (n.val === v) return n; st.push(n.left, n.right); } }\n"
                   "console.log(L.map((l) => { const [t, a, b] = l.split('|'); const r = build(t); return String(lowestCommonAncestor(r, find(r, Number(a)), find(r, Number(b))).val); }).join('\\n'));\n"),
    'go': ("func main(){ sc:=bufio.NewScanner(os.Stdin); sc.Buffer(make([]byte,1<<22),1<<22); w:=bufio.NewWriter(os.Stdout); defer w.Flush(); for sc.Scan(){ fmt.Fprintln(w, {CALL}(build(sc.Text()))) } }\n",
           "func find(r *TreeNode, v int) *TreeNode { st := []*TreeNode{r}; for len(st) > 0 { n := st[len(st)-1]; st = st[:len(st)-1]; if n == nil { continue }; if n.Val == v { return n }; st = append(st, n.Left, n.Right) }; return nil }\n"
           "func main(){ sc:=bufio.NewScanner(os.Stdin); sc.Buffer(make([]byte,1<<24),1<<24); w:=bufio.NewWriter(os.Stdout); defer w.Flush(); for sc.Scan(){ p := strings.Split(sc.Text(), \"|\"); r := build(p[0]); a, _ := strconv.Atoi(p[1]); b, _ := strconv.Atoi(p[2]); fmt.Fprintln(w, lowestCommonAncestor(r, find(r, a), find(r, b)).Val) } }\n"),
    'rust': ("fn main(){ let o=std::io::stdout(); let mut w=std::io::BufWriter::new(o.lock()); for l in std::io::stdin().lock().lines(){ let l=l.unwrap(); writeln!(w, \"{}\", Solution::{CALL}(build(&l))).unwrap(); } }\n",
             "fn find(r: &T, v: i32) -> T { let mut st = vec![r.clone()]; while let Some(n) = st.pop() { if let Some(n) = n { if n.borrow().val == v { return Some(n); } st.push(n.borrow().left.clone()); st.push(n.borrow().right.clone()); } } None }\n"
             "fn main(){ let o=std::io::stdout(); let mut w=std::io::BufWriter::new(o.lock()); for l in std::io::stdin().lock().lines(){ let l=l.unwrap(); let p: Vec<&str> = l.split('|').collect(); let r = build(p[0]); let a = find(&r, p[1].parse().unwrap()); let b = find(&r, p[2].parse().unwrap()); writeln!(w, \"{}\", Solution::lowest_common_ancestor(r, a, b).unwrap().borrow().val).unwrap(); } }\n"),
}

DRIVERS = {}
for _lang, (_old, _new) in _MAIN.items():
    _text = trees._DRIVERS[_lang]
    assert _text.count(_old) == 1, _lang
    DRIVERS[_lang] = _text.replace(_old, _new)
# Go: the tree builder's buffer is too small for a 10⁵-node line; the new main sizes its own.

BIG_STACK = True   # the recursive Ruby and JavaScript listings overflow their default stacks on deep trees
# The recursion is not run on the two 10⁵-deep chains: see the badges.
_DEEP = set()   # the two 10⁵-deep chains, filled in by corpus()
SKIP = {'recurse': lambda c: c in _DEEP}


def relabel(nodes):
    vals = random.sample(range(-10**9, 10**9 + 1), len(nodes))
    for node, v in zip(nodes, vals):
        node['v'] = v
    return nodes


def oracle(nodes, a, b):
    def path(target):
        parent = {0: None}
        stack = [0]
        while stack:
            i = stack.pop()
            if nodes[i]['v'] == target:
                out = []
                while i is not None:
                    out.append(i)
                    i = parent[i]
                return out[::-1]
            for side in 'lr':
                if nodes[i][side] is not None:
                    parent[nodes[i][side]] = i
                    stack.append(nodes[i][side])
    pa, pb = path(a), path(b)
    last = 0
    for x, y in zip(pa, pb):
        if x != y:
            break
        last = x
    return nodes[last]['v']


def case(nodes, a=None, b=None):
    if a is None:
        a, b = (nodes[i]['v'] for i in random.sample(range(len(nodes)), 2))
    return (f'{level(nodes)}|{a}|{b}', str(oracle(nodes, a, b)))


def corpus():
    random.seed(236)
    ex = from_level([3, 5, 1, 6, 2, 0, 8, None, None, 7, 4])
    out = [case(ex, 5, 1), case(ex, 5, 4), case(from_level([1, 2]), 1, 2),
           case(ex, 5, 6), case(ex, 3, 8), case(from_level([1, 2, None, 3, None, 4]), 4, 3), case(from_level([2, 1]), 2, 1)]
    out += [case(relabel(random_tree(random.randint(2, 12)))) for _ in range(15000)]
    out += [case(relabel(random_tree(random.randint(2, 400)))) for _ in range(5000)]
    for nodes in [relabel(random_tree(10**5)), relabel(complete(10**5)), relabel(chain(10**4)),
                  relabel(chain(10**4, lambda i: 'lr'[i % 2]))]:
        out.append(case(nodes))
    for side in 'lr':
        nodes = relabel(chain(10**5, lambda i, s=side: s))
        out.append(case(nodes, nodes[-1]['v'], nodes[-3]['v']))
        _DEEP.add(out[-1][0])
    return out
