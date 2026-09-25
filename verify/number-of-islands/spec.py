"""Number of Islands — the corpus the page's badges describe.

The 2 examples, 6 edges (1 × 1 land and water, all water, a ring round a
lake, a diagonal of lone cells, one 1 × 300 strip), 15,000 random grids of
1 × 1 to 6 × 8 at every density, 5,000 up to 40 × 40, and five at the
largest, 300 × 300: all land (one island, 90,000 cells deep for a recursive
flood fill), a checkerboard (45,000 islands), and three random densities.
A line is the grid, rows split by ";" and each row a string of 0s and 1s;
each driver hands the listing a grid of characters, as LeetCode does, and
prints the count.

The oracle is union-find over the land cells — no flood fill, no queue.
"""
import random

BIG_STACK = True

DRIVERS = {
    'ruby': "{SOL}\nSTDIN.each_line { |l| puts num_islands(l.chomp.split(';').map(&:chars)) }\n",
    'python': "{SOL}\n_out = []\nfor l in sys.stdin.read().split('\\n')[:-1]:\n    _out.append(str(Solution().numIslands([list(r) for r in l.split(';')])))\nprint('\\n'.join(_out))\n",
    'javascript': "{SOL}\nconst L = require('fs').readFileSync(0, 'utf8').split('\\n'); L.pop();\nconsole.log(L.map((l) => String(numIslands(l.split(';').map((r) => r.split(''))))).join('\\n'));\n",
    'go': "package main\nimport (\"bufio\"; \"fmt\"; \"os\"; \"strings\")\n{SOL}\nfunc main() {\n  sc := bufio.NewScanner(os.Stdin); sc.Buffer(make([]byte, 1<<24), 1<<24)\n  w := bufio.NewWriter(os.Stdout); defer w.Flush()\n  for sc.Scan() { rs := strings.Split(sc.Text(), \";\"); g := make([][]byte, len(rs)); for i, r := range rs { g[i] = []byte(r) }; fmt.Fprintln(w, numIslands(g)) }\n}\n",
    'rust': "struct Solution;\n{SOL}\nuse std::io::{BufRead, Write};\nfn main() {\n  let o = std::io::stdout(); let mut w = std::io::BufWriter::new(o.lock());\n  for l in std::io::stdin().lock().lines() { let l = l.unwrap(); let g: Vec<Vec<char>> = l.split(';').map(|r| r.chars().collect()).collect();\n    writeln!(w, \"{}\", Solution::num_islands(g)).unwrap(); }\n}\n",
}
# the Python driver needs sys whether or not the listing imports it
DRIVERS['python'] = 'import sys\n' + DRIVERS['python']


def oracle(g):
    m, n = len(g), len(g[0])
    parent = list(range(m * n))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    land = 0
    for r in range(m):
        for c in range(n):
            if g[r][c] != '1':
                continue
            land += 1
            for x, y in ((r - 1, c), (r, c - 1)):
                if x >= 0 and y >= 0 and g[x][y] == '1':
                    a, b = find(r * n + c), find(x * n + y)
                    if a != b:
                        parent[a] = b
                        land -= 1
    return land


def rand(m, n, p):
    return [''.join('1' if random.random() < p else '0' for _ in range(n)) for _ in range(m)]


def corpus():
    random.seed(200)
    cases = [['11110', '11010', '11000', '00000'], ['11000', '11000', '00100', '00011'],
             ['1'], ['0'], ['000', '000'], ['111', '101', '111'], ['1000', '0100', '0010', '0001'], ['1' * 300]]
    for _ in range(15000):
        cases.append(rand(random.randint(1, 6), random.randint(1, 8), random.random()))
    for _ in range(5000):
        cases.append(rand(random.randint(1, 40), random.randint(1, 40), random.random()))
    cases.append(['1' * 300] * 300)
    cases.append([''.join('1' if (r + c) % 2 == 0 else '0' for c in range(300)) for r in range(300)])
    for p in (0.3, 0.5, 0.7):
        cases.append(rand(300, 300, p))
    return [(';'.join(g), str(oracle(g))) for g in cases]
