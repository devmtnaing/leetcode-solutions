"""Merge Intervals — the corpus the page's badges describe.

The 3 examples, 7 edges (one interval, touching ends, a one-unit gap between
integers, nested, points, identical, reverse order), 15,000 random lists of
1 to 8 intervals inside 0..10, 5,000 of 1 to 40 inside 0..100, and five at
n = 10⁴ (random across 0..10⁴, all disjoint points, all nested in one, one
long chain of touching intervals, and all identical). A line is
"s,e;s,e;…". Merged intervals may come back in any order, so every driver
sorts them.

The oracle shares no code with the listings: it paints each interval onto a
doubled number line (so [1,2] and [3,4], which share no point, stay apart)
and reads the painted runs back off.
"""
import random

DRIVERS = {
    'ruby': "{SOL}\nSTDIN.each_line { |l| iv = l.chomp.split(';').map { |p| p.split(',').map(&:to_i) }; puts '[' + merge(iv).sort.map { |a, b| \"[#{a},#{b}]\" }.join(',') + ']' }\n",
    'python': "{SOL}\nimport sys\nsol = Solution()\nout = []\nfor l in sys.stdin.read().split('\\n')[:-1]:\n    iv = [[int(x) for x in p.split(',')] for p in l.split(';')]\n    out.append('[' + ','.join(f'[{a},{b}]' for a, b in sorted(sol.merge(iv))) + ']')\nprint('\\n'.join(out))\n",
    'javascript': "{SOL}\nconst L = require('fs').readFileSync(0, 'utf8').split('\\n'); L.pop();\nconsole.log(L.map((l) => '[' + merge(l.split(';').map((p) => p.split(',').map(Number))).sort((x, y) => x[0] - y[0] || x[1] - y[1]).map(([a, b]) => `[${a},${b}]`).join(',') + ']').join('\\n'));\n",
    'go': "package main\nimport (\"bufio\"; \"fmt\"; \"os\"; \"sort\"; \"strconv\"; \"strings\")\n{SOL}\nfunc main() {\n  sc := bufio.NewScanner(os.Stdin); sc.Buffer(make([]byte, 1<<24), 1<<24)\n  w := bufio.NewWriter(os.Stdout); defer w.Flush()\n  for sc.Scan() { ps := strings.Split(sc.Text(), \";\"); iv := make([][]int, len(ps)); for i, p := range ps { q := strings.Split(p, \",\"); a, _ := strconv.Atoi(q[0]); b, _ := strconv.Atoi(q[1]); iv[i] = []int{a, b} }\n    r := merge(iv); sort.Slice(r, func(x, y int) bool { if r[x][0] != r[y][0] { return r[x][0] < r[y][0] }; return r[x][1] < r[y][1] })\n    s := make([]string, len(r)); for i, t := range r { s[i] = fmt.Sprintf(\"[%d,%d]\", t[0], t[1]) }\n    fmt.Fprintln(w, \"[\"+strings.Join(s, \",\")+\"]\") }\n}\n",
    'rust': "struct Solution;\n{SOL}\nuse std::io::{BufRead, Write};\nfn main() {\n  let o = std::io::stdout(); let mut w = std::io::BufWriter::new(o.lock());\n  for l in std::io::stdin().lock().lines() { let l = l.unwrap(); let iv: Vec<Vec<i32>> = l.split(';').map(|p| p.split(',').map(|x| x.parse().unwrap()).collect()).collect();\n    let mut r = Solution::merge(iv); r.sort();\n    let s: Vec<String> = r.iter().map(|t| format!(\"[{},{}]\", t[0], t[1])).collect();\n    writeln!(w, \"[{}]\", s.join(\",\")).unwrap(); }\n}\n",
}

# the brute force checks each interval against every merged one: 5 × 10⁷ at n = 10⁴ when nothing merges
SKIP = {'brute': lambda c: c.count(';') >= 2000}


def oracle(ivs):
    top = max(e for _, e in ivs)
    paint = [0] * (2 * top + 2)
    for s, e in ivs:
        paint[2 * s] += 1
        paint[2 * e + 1] -= 1
    out, run, start = [], 0, None
    for x in range(len(paint)):
        before = run
        run += paint[x]
        if before == 0 and run > 0:
            start = x
        if before > 0 and run == 0:
            out.append([start // 2, (x - 1) // 2])
    return '[' + ','.join(f'[{a},{b}]' for a, b in out) + ']'


def rand_list(n, top):
    out = []
    for _ in range(n):
        a = random.randint(0, top)
        b = random.randint(a, min(top, a + random.randint(0, max(1, top // 3))))
        out.append([a, b])
    return out


def corpus():
    random.seed(56)
    cases = [[[1, 3], [2, 6], [8, 10], [15, 18]], [[1, 4], [4, 5]], [[4, 7], [1, 4]],
             [[5, 5]], [[1, 2], [2, 3], [3, 4]], [[1, 3], [4, 6]], [[1, 10], [2, 3], [4, 5]],
             [[0, 0], [0, 0], [1, 1]], [[2, 2], [2, 2]], [[9, 10], [6, 7], [3, 4], [0, 1]]]
    cases += [rand_list(random.randint(1, 8), 10) for _ in range(15000)]
    cases += [rand_list(random.randint(1, 40), 100) for _ in range(5000)]
    n = 10**4
    pts = list(range(n))
    random.shuffle(pts)
    cases += [rand_list(n, 10**4), [[p, p] for p in pts], [[i // 2, 10**4 - i // 2] for i in range(n)],
              [[i, i + 1] for i in range(n)], [[7, 70]] * n]
    return [(';'.join(f'{a},{b}' for a, b in c), oracle(c)) for c in cases]
