"""Longest Increasing Path in a Matrix — the corpus the page's badges describe.

The 3 examples, 6 edges (one cell, a flat 3 × 3, one increasing row of 200,
one column of 200, a 2 × 2 of equal pairs, a valley), 15,000 random grids of
1 × 1 to 5 × 6 over 0..4 — small values, so ties between neighbours are
everywhere — 5,000 up to 30 × 30 over 0..50, and seven at 200 × 200: a snake
of 0..39,999 (one path through all 40,000 cells), the same snake reversed, a
walled snake (the path runs along every other row, with 0s between, so the
memoised DFS has no shortcut and recurses 20,099 deep — on the plain snake it
cuts through the rows and never goes past 399), r + c (answer 399), all equal,
a checkerboard of 0s and 1s, and random values up to 2³¹ − 1.

A line is the grid, rows split by ";" and values by ","; each driver prints
the length.

The oracle sorts the cells from largest to smallest and fills in each one's
best path from its already-finished larger neighbours — no recursion, no
layers.
"""
import random

BIG_STACK = True   # the memoised DFS goes 20,099 calls deep on the walled snake

_PARSE_PY = "[[int(x) for x in r.split(',')] for r in l.split(';')]"
DRIVERS = {
    'ruby': "{SOL}\nSTDIN.each_line { |l| puts longest_increasing_path(l.chomp.split(';').map { |r| r.split(',').map(&:to_i) }) }\n",
    'python': "import sys\n{SOL}\n_out = []\nfor l in sys.stdin.read().split('\\n')[:-1]:\n    _out.append(str(Solution().longestIncreasingPath(" + _PARSE_PY + ")))\nprint('\\n'.join(_out))\n",
    'javascript': "{SOL}\nconst L = require('fs').readFileSync(0, 'utf8').split('\\n'); L.pop();\nconsole.log(L.map((l) => String(longestIncreasingPath(l.split(';').map((r) => r.split(',').map(Number))))).join('\\n'));\n",
    'go': "package main\nimport (\"bufio\"; \"fmt\"; \"os\"; \"strconv\"; \"strings\")\n{SOL}\nfunc main() {\n  sc := bufio.NewScanner(os.Stdin); sc.Buffer(make([]byte, 1<<26), 1<<26)\n  w := bufio.NewWriter(os.Stdout); defer w.Flush()\n  for sc.Scan() { rs := strings.Split(sc.Text(), \";\"); g := make([][]int, len(rs))\n    for i, r := range rs { for _, x := range strings.Split(r, \",\") { v, _ := strconv.Atoi(x); g[i] = append(g[i], v) } }\n    fmt.Fprintln(w, longestIncreasingPath(g)) }\n}\n",
    'rust': "struct Solution;\n{SOL}\nuse std::io::{BufRead, Write};\nfn main() {\n  let o = std::io::stdout(); let mut w = std::io::BufWriter::new(o.lock());\n  for l in std::io::stdin().lock().lines() { let l = l.unwrap();\n    let g: Vec<Vec<i32>> = l.split(';').map(|r| r.split(',').map(|x| x.parse().unwrap()).collect()).collect();\n    writeln!(w, \"{}\", Solution::longest_increasing_path(g)).unwrap(); }\n}\n",
}


def oracle(g):
    m, n = len(g), len(g[0])
    cells = sorted(((g[r][c], r, c) for r in range(m) for c in range(n)), reverse=True)
    best = [[1] * n for _ in range(m)]
    for v, r, c in cells:
        for x, y in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            if 0 <= x < m and 0 <= y < n and g[x][y] > v:
                best[r][c] = max(best[r][c], best[x][y] + 1)
    return max(max(row) for row in best)


def rand(m, n, hi):
    return [[random.randint(0, hi) for _ in range(n)] for _ in range(m)]


def snake(k):
    g = [[0] * k for _ in range(k)]
    v = 0
    for r in range(k):
        for c in (range(k) if r % 2 == 0 else range(k - 1, -1, -1)):
            g[r][c] = v
            v += 1
    return g


def walled(k):
    g = [[0] * k for _ in range(k)]
    v = 1
    for r in range(0, k, 2):
        for c in (range(k) if r % 4 == 0 else range(k - 1, -1, -1)):
            g[r][c] = v
            v += 1
        if r + 2 < k:
            g[r + 1][k - 1 if r % 4 == 0 else 0] = v
            v += 1
    return g


def corpus():
    random.seed(329)
    cases = [[[9, 9, 4], [6, 6, 8], [2, 1, 1]], [[3, 4, 5], [3, 2, 6], [2, 2, 1]], [[1]],
             [[7]], [[5] * 3] * 3, [list(range(200))], [[x] for x in range(200)],
             [[1, 1], [2, 2]], [[5, 4, 5], [4, 0, 4], [5, 4, 5]]]
    for _ in range(15000):
        cases.append(rand(random.randint(1, 5), random.randint(1, 6), 4))
    for _ in range(5000):
        cases.append(rand(random.randint(1, 30), random.randint(1, 30), 50))
    k = 200
    s = snake(k)
    cases += [s, [[k * k - 1 - v for v in row] for row in s], walled(k), [[r + c for c in range(k)] for r in range(k)],
              [[3] * k for _ in range(k)], [[(r + c) % 2 for c in range(k)] for r in range(k)], rand(k, k, 2 ** 31 - 1)]
    return [(';'.join(','.join(map(str, row)) for row in g), str(oracle(g))) for g in cases]
