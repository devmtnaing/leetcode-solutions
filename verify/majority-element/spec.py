"""Majority Element — the corpus the page's badges describe.

The 2 examples, 4 edges, 15,000 random arrays of up to 9 values from -2..2,
5,000 of up to 500 across ±10⁹, and five at n = 5×10⁴ (random, few distinct
values, all equal, and two with the tightest majority, ⌊n/2⌋ + 1 copies).
Every array is built to have a majority; the oracle sorts and takes the
middle, and asserts the middle really is a majority.
"""
import random

DRIVERS = {
    'ruby': "{SOL}\nSTDIN.each_line { |l| puts majority_element(l.split(',').map(&:to_i)) }\n",
    'python': "{SOL}\nimport sys\nsol = Solution()\nprint('\\n'.join(str(sol.majorityElement([int(x) for x in l.split(',')])) for l in sys.stdin.read().split('\\n')[:-1]))\n",
    'javascript': "{SOL}\nconst L = require('fs').readFileSync(0, 'utf8').split('\\n'); L.pop();\nconsole.log(L.map((l) => String(majorityElement(l.split(',').map(Number)))).join('\\n'));\n",
    'go': "package main\nimport (\"bufio\"; \"fmt\"; \"os\"; \"strconv\"; \"strings\")\n{SOL}\nfunc main() {\n  sc := bufio.NewScanner(os.Stdin); sc.Buffer(make([]byte, 1<<24), 1<<24)\n  w := bufio.NewWriter(os.Stdout); defer w.Flush()\n  for sc.Scan() { p := strings.Split(sc.Text(), \",\"); a := make([]int, len(p)); for i, x := range p { a[i], _ = strconv.Atoi(x) }; fmt.Fprintln(w, majorityElement(a)) }\n}\n",
    'rust': "struct Solution;\n{SOL}\nuse std::io::{BufRead, Write};\nfn main() {\n  let o = std::io::stdout(); let mut w = std::io::BufWriter::new(o.lock());\n  for l in std::io::stdin().lock().lines() { let a: Vec<i32> = l.unwrap().split(',').map(|x| x.parse().unwrap()).collect(); writeln!(w, \"{}\", Solution::majority_element(a)).unwrap(); }\n}\n",
}


def make(n, lo, hi):
    m = random.randint(lo, hi)
    k = random.randint(n // 2 + 1, n)                 # strictly more than half
    rest = [random.randint(lo, hi) for _ in range(n - k)]
    rest = [x if x != m else (x + 1 if x < hi else x - 1) for x in rest]
    a = [m] * k + rest
    random.shuffle(a)
    return a


def oracle(a):
    m = sorted(a)[len(a) // 2]
    assert a.count(m) > len(a) // 2, a
    return m


def corpus():
    random.seed(169)
    cases = [[3, 2, 3], [2, 2, 1, 1, 1, 2, 2], [7], [1, 1], [-10**9], [10**9, -10**9, 10**9]]
    cases += [make(random.randint(1, 9), -2, 2) for _ in range(15000)]
    cases += [make(random.randint(1, 500), -10**9, 10**9) for _ in range(5000)]
    n = 5 * 10**4
    cases += [make(n, -10**9, 10**9), make(n, -3, 3), [5] * n,
              [-10**9] * (n // 2 - 1) + [10**9] * (n // 2 + 1),
              [1, 2] * (n // 2 - 1) + [1, 1]]
    return [(','.join(map(str, a)), str(oracle(a))) for a in cases]
