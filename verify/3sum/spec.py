"""3Sum — the corpus the page's badges describe.

The 3 examples, 5 edges, 15,000 random arrays of 3 to 9 values from -3..3
(duplicates everywhere), 5,000 of 3 to 30 values from -10..10, and five at
n = 3000 (values across ±10⁵, values in -3..3, all zeros, values in -50..50
with thousands of triplets, and all positive). Triplets may come back in any
order, so every driver sorts each triplet and then the list.

The oracle shares no code with the solutions: it counts each distinct value
and checks every pair of distinct values a ≤ b for c = −(a + b) ≥ b, with
enough copies.
"""
import random
from collections import Counter

DRIVERS = {
    'ruby': "{SOL}\nSTDIN.each_line { |l| r = three_sum(l.split(',').map(&:to_i)).map(&:sort).sort; puts '[' + r.map { |t| '[' + t.join(',') + ']' }.join(',') + ']' }\n",
    'python': "{SOL}\nimport sys\nsol = Solution()\nout = []\nfor l in sys.stdin.read().split('\\n')[:-1]:\n    r = sorted(sorted(t) for t in sol.threeSum([int(x) for x in l.split(',')]))\n    out.append('[' + ','.join('[' + ','.join(map(str, t)) + ']' for t in r) + ']')\nprint('\\n'.join(out))\n",
    'javascript': "{SOL}\nconst L = require('fs').readFileSync(0, 'utf8').split('\\n'); L.pop();\nconst cmp = (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];\nconsole.log(L.map((l) => '[' + threeSum(l.split(',').map(Number)).map((t) => [...t].sort((a, b) => a - b)).sort(cmp).map((t) => '[' + t.join(',') + ']').join(',') + ']').join('\\n'));\n",
    'go': "package main\nimport (\"bufio\"; \"fmt\"; \"os\"; \"sort\"; \"strconv\"; \"strings\")\n{SOL}\nfunc main() {\n  sc := bufio.NewScanner(os.Stdin); sc.Buffer(make([]byte, 1<<24), 1<<24)\n  w := bufio.NewWriter(os.Stdout); defer w.Flush()\n  for sc.Scan() { p := strings.Split(sc.Text(), \",\"); a := make([]int, len(p)); for i, x := range p { a[i], _ = strconv.Atoi(x) }\n    r := threeSum(a); for _, t := range r { sort.Ints(t) }\n    sort.Slice(r, func(x, y int) bool { for k := 0; k < 3; k++ { if r[x][k] != r[y][k] { return r[x][k] < r[y][k] } }; return false })\n    s := make([]string, len(r)); for i, t := range r { s[i] = fmt.Sprintf(\"[%d,%d,%d]\", t[0], t[1], t[2]) }\n    fmt.Fprintln(w, \"[\"+strings.Join(s, \",\")+\"]\") }\n}\n",
    'rust': "struct Solution;\n{SOL}\nuse std::io::{BufRead, Write};\nfn main() {\n  let o = std::io::stdout(); let mut w = std::io::BufWriter::new(o.lock());\n  for l in std::io::stdin().lock().lines() { let a: Vec<i32> = l.unwrap().split(',').map(|x| x.parse().unwrap()).collect();\n    let mut r = Solution::three_sum(a); for t in r.iter_mut() { t.sort(); } r.sort();\n    let s: Vec<String> = r.iter().map(|t| format!(\"[{},{},{}]\", t[0], t[1], t[2])).collect();\n    writeln!(w, \"[{}]\", s.join(\",\")).unwrap(); }\n}\n",
}

# the brute force tries every triple: about 4.5 × 10⁹ at n = 3000
SKIP = {'brute': lambda c: c.count(',') >= 100}


def oracle(a):
    cnt = Counter(a)
    vals = sorted(cnt)
    out = []
    for x in range(len(vals)):
        for y in range(x, len(vals)):
            p, q = vals[x], vals[y]
            r = -(p + q)
            if r < q:
                break
            need = Counter((p, q, r))
            if all(cnt[v] >= m for v, m in need.items()):
                out.append((p, q, r))
    return '[' + ','.join(f'[{p},{q},{r}]' for p, q, r in sorted(out)) + ']'


def corpus():
    random.seed(15)
    cases = [[-1, 0, 1, 2, -1, -4], [0, 1, 1], [0, 0, 0],
             [0, 0, 0, 0], [-2, 0, 1, 1, 2], [1, 2, 3], [-100000, 50000, 50000], [3, 0, -2, -1, 1, 2]]
    cases += [[random.randint(-3, 3) for _ in range(random.randint(3, 9))] for _ in range(15000)]
    cases += [[random.randint(-10, 10) for _ in range(random.randint(3, 30))] for _ in range(5000)]
    n = 3000
    cases += [[random.randint(-10**5, 10**5) for _ in range(n)], [random.randint(-3, 3) for _ in range(n)],
              [0] * n, [random.randint(-50, 50) for _ in range(n)], [random.randint(1, 10**5) for _ in range(n)]]
    return [(','.join(map(str, a)), oracle(a)) for a in cases]
