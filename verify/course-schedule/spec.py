"""Course Schedule — the corpus the page's badges describe.

The 2 examples, 8 edges (one course, no prerequisites, a self-loop, a
two-course cycle, a cycle hanging off an acyclic part, a diamond, a course
needed by everything, a long cycle), 15,000 random graphs of 1 to 8 courses
with up to 12 distinct pairs, 5,000 of up to 60 courses and 150 pairs, and
six at the constraint: a chain of 2,000 courses (2,000 calls deep for the
recursive DFS), the same chain closed into a cycle, a random DAG and a random
graph of 2,000 courses with 5,000 pairs, a 2,000-course cycle, and course 0
needed by all 1,999 others. Pairs are unique, as the statement promises;
self-loops are allowed, since the constraints do not rule them out.

A line is "numCourses|a,b;a,b;…"; each driver prints true or false.

The oracle repeatedly deletes courses with nothing left to wait for; the
schedule works when every course gets deleted. It is written as a fixpoint
over the edge list, not as a queue or a DFS.
"""
import random

DRIVERS = {
    'ruby': "{SOL}\nSTDIN.each_line { |l| n, e = l.chomp.split('|', -1); ps = e.to_s.split(';').map { |p| p.split(',').map(&:to_i) }; puts can_finish(n.to_i, ps) }\n",
    'python': "{SOL}\nimport sys\n_out = []\nfor l in sys.stdin.read().split('\\n')[:-1]:\n    n, e = l.split('|')\n    ps = [[int(x) for x in p.split(',')] for p in e.split(';')] if e else []\n    _out.append('true' if Solution().canFinish(int(n), ps) else 'false')\nprint('\\n'.join(_out))\n",
    'javascript': "{SOL}\nconst L = require('fs').readFileSync(0, 'utf8').split('\\n'); L.pop();\nconsole.log(L.map((l) => { const [n, e] = l.split('|'); const ps = e ? e.split(';').map((p) => p.split(',').map(Number)) : []; return String(canFinish(Number(n), ps)); }).join('\\n'));\n",
    'go': "package main\nimport (\"bufio\"; \"fmt\"; \"os\"; \"strconv\"; \"strings\")\n{SOL}\nfunc main() {\n  sc := bufio.NewScanner(os.Stdin); sc.Buffer(make([]byte, 1<<24), 1<<24)\n  w := bufio.NewWriter(os.Stdout); defer w.Flush()\n  for sc.Scan() { parts := strings.Split(sc.Text(), \"|\"); n, _ := strconv.Atoi(parts[0]); ps := [][]int{}\n    if parts[1] != \"\" { for _, p := range strings.Split(parts[1], \";\") { q := strings.Split(p, \",\"); a, _ := strconv.Atoi(q[0]); b, _ := strconv.Atoi(q[1]); ps = append(ps, []int{a, b}) } }\n    fmt.Fprintln(w, canFinish(n, ps)) }\n}\n",
    'rust': "struct Solution;\n{SOL}\nuse std::io::{BufRead, Write};\nfn main() {\n  let o = std::io::stdout(); let mut w = std::io::BufWriter::new(o.lock());\n  for l in std::io::stdin().lock().lines() { let l = l.unwrap(); let (n, e) = l.split_once('|').unwrap();\n    let ps: Vec<Vec<i32>> = if e.is_empty() { vec![] } else { e.split(';').map(|p| p.split(',').map(|x| x.parse().unwrap()).collect()).collect() };\n    writeln!(w, \"{}\", Solution::can_finish(n.parse().unwrap(), ps)).unwrap(); }\n}\n",
}


def oracle(n, pairs):
    alive = set(range(n))
    edges = set(map(tuple, pairs))
    while True:
        waiting = {a for a, b in edges}           # courses that still need something
        free = alive - waiting
        if not free:
            break
        alive -= free
        edges = {(a, b) for a, b in edges if b not in free}
    return not alive


def rand_pairs(n, k, dag):
    order = list(range(n)); random.shuffle(order)
    rank = {u: i for i, u in enumerate(order)}
    out = set()
    tries = 0
    while len(out) < k and tries < k * 20:
        tries += 1
        a, b = random.randrange(n), random.randrange(n)
        if dag and not rank[b] < rank[a]:
            continue
        if not dag and a == b and random.random() < 0.9:
            continue
        out.add((a, b))
    return sorted(out, key=lambda _: random.random())


def line(n, pairs):
    return f"{n}|{';'.join(f'{a},{b}' for a, b in pairs)}"


def corpus():
    random.seed(207)
    cases = [(2, [(1, 0)]), (2, [(1, 0), (0, 1)]),
             (1, []), (4, []), (3, [(1, 1)]), (3, [(0, 1), (1, 0)]),
             (5, [(1, 0), (2, 1), (3, 4), (4, 3)]), (4, [(1, 0), (2, 0), (3, 1), (3, 2)]),
             (5, [(1, 0), (2, 0), (3, 0), (4, 0)]), (6, [(1, 0), (2, 1), (3, 2), (4, 3), (5, 4), (0, 5)])]
    for _ in range(15000):
        n = random.randint(1, 8)
        cases.append((n, rand_pairs(n, random.randint(0, min(12, n * n)), random.random() < 0.5)))
    for _ in range(5000):
        n = random.randint(1, 60)
        cases.append((n, rand_pairs(n, random.randint(0, min(150, n * n)), random.random() < 0.5)))
    N = 2000
    chain = [(i + 1, i) for i in range(N - 1)]
    cases.append((N, chain))
    cases.append((N, chain + [(0, N - 1)]))
    cases.append((N, rand_pairs(N, 5000, True)))
    cases.append((N, rand_pairs(N, 5000, False)))
    cases.append((N, [((i + 1) % N, i) for i in range(N)]))
    cases.append((N, [(i, 0) for i in range(1, N)]))
    return [(line(n, p), 'true' if oracle(n, p) else 'false') for n, p in cases]
