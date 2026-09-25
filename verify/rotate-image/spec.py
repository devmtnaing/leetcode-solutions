"""Rotate Image — the corpus the page's badges describe.

The 2 examples, 3 edges (1 × 1, 2 × 2, all equal values), 15,000 random
matrices of 1 × 1 to 5 × 5 with values from -9..9, and 5,000 up to the
largest, 20 × 20, across ±1000. A line is the matrix, rows split by ";" and
values by ","; each driver calls rotate, which returns nothing, and prints
the matrix it was given.

The oracle reads the rotation off directly: row j of the answer is column j
of the input, read bottom to top.
"""
import random

DRIVERS = {
    'ruby': "{SOL}\nSTDIN.each_line { |l| m = l.chomp.split(';').map { |r| r.split(',').map(&:to_i) }; rotate(m); puts m.map { |r| r.join(',') }.join(';') }\n",
    'python': "{SOL}\nimport sys\nsol = Solution()\nout = []\nfor l in sys.stdin.read().split('\\n')[:-1]:\n    m = [[int(x) for x in r.split(',')] for r in l.split(';')]\n    sol.rotate(m)\n    out.append(';'.join(','.join(map(str, r)) for r in m))\nprint('\\n'.join(out))\n",
    'javascript': "{SOL}\nconst L = require('fs').readFileSync(0, 'utf8').split('\\n'); L.pop();\nconsole.log(L.map((l) => { const m = l.split(';').map((r) => r.split(',').map(Number)); rotate(m); return m.map((r) => r.join(',')).join(';'); }).join('\\n'));\n",
    'go': "package main\nimport (\"bufio\"; \"fmt\"; \"os\"; \"strconv\"; \"strings\")\n{SOL}\nfunc main() {\n  sc := bufio.NewScanner(os.Stdin); sc.Buffer(make([]byte, 1<<24), 1<<24)\n  w := bufio.NewWriter(os.Stdout); defer w.Flush()\n  for sc.Scan() { rs := strings.Split(sc.Text(), \";\"); m := make([][]int, len(rs)); for i, r := range rs { p := strings.Split(r, \",\"); m[i] = make([]int, len(p)); for j, x := range p { m[i][j], _ = strconv.Atoi(x) } }\n    rotate(m); s := make([]string, len(m)); for i, r := range m { q := make([]string, len(r)); for j, v := range r { q[j] = strconv.Itoa(v) }; s[i] = strings.Join(q, \",\") }; fmt.Fprintln(w, strings.Join(s, \";\")) }\n}\n",
    'rust': "struct Solution;\n{SOL}\nuse std::io::{BufRead, Write};\nfn main() {\n  let o = std::io::stdout(); let mut w = std::io::BufWriter::new(o.lock());\n  for l in std::io::stdin().lock().lines() { let l = l.unwrap(); let mut m: Vec<Vec<i32>> = l.split(';').map(|r| r.split(',').map(|x| x.parse().unwrap()).collect()).collect();\n    Solution::rotate(&mut m); let s: Vec<String> = m.iter().map(|r| r.iter().map(|v| v.to_string()).collect::<Vec<_>>().join(\",\")).collect(); writeln!(w, \"{}\", s.join(\";\")).unwrap(); }\n}\n",
}


def oracle(m):
    n = len(m)
    return [[m[n - 1 - i][j] for i in range(n)] for j in range(n)]


def fmt(m):
    return ';'.join(','.join(map(str, r)) for r in m)


def corpus():
    random.seed(48)
    cases = [[[1, 2, 3], [4, 5, 6], [7, 8, 9]], [[5, 1, 9, 11], [2, 4, 8, 10], [13, 3, 6, 7], [15, 14, 12, 16]],
             [[7]], [[1, 2], [3, 4]], [[4] * 3 for _ in range(3)]]
    for _ in range(15000):
        n = random.randint(1, 5)
        cases.append([[random.randint(-9, 9) for _ in range(n)] for _ in range(n)])
    for _ in range(5000):
        n = random.randint(1, 20)
        cases.append([[random.randint(-1000, 1000) for _ in range(n)] for _ in range(n)])
    return [(fmt(m), fmt(oracle(m))) for m in cases]
