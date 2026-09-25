"""Maximum Subarray — the corpus the page's badges describe.

The 3 examples, 5 edges (one value, all negative, one positive among
negatives, all zeros, extremes), 15,000 random arrays of 1 to 9 values from
-5..5, 5,000 of 1 to 60 values across ±10⁴, and five at n = 10⁵ (random
±10⁴, all -10⁴, all 10⁴ — the largest possible sum, 10⁹ — alternating, and
mostly negative with a few peaks).

The oracle takes the best difference of prefix sums, max(P[j] − min P[i<j]),
which shares no code with either listing.
"""
import random

DRIVERS = {
    'ruby': "{SOL}\nSTDIN.each_line { |l| puts max_sub_array(l.split(',').map(&:to_i)) }\n",
    'python': "{SOL}\nimport sys\nsol = Solution()\nprint('\\n'.join(str(sol.maxSubArray([int(x) for x in l.split(',')])) for l in sys.stdin.read().split('\\n')[:-1]))\n",
    'javascript': "{SOL}\nconst L = require('fs').readFileSync(0, 'utf8').split('\\n'); L.pop();\nconsole.log(L.map((l) => String(maxSubArray(l.split(',').map(Number)))).join('\\n'));\n",
    'go': "package main\nimport (\"bufio\"; \"fmt\"; \"os\"; \"strconv\"; \"strings\")\n{SOL}\nfunc main() {\n  sc := bufio.NewScanner(os.Stdin); sc.Buffer(make([]byte, 1<<24), 1<<24)\n  w := bufio.NewWriter(os.Stdout); defer w.Flush()\n  for sc.Scan() { p := strings.Split(sc.Text(), \",\"); a := make([]int, len(p)); for i, x := range p { a[i], _ = strconv.Atoi(x) }; fmt.Fprintln(w, maxSubArray(a)) }\n}\n",
    'rust': "struct Solution;\n{SOL}\nuse std::io::{BufRead, Write};\nfn main() {\n  let o = std::io::stdout(); let mut w = std::io::BufWriter::new(o.lock());\n  for l in std::io::stdin().lock().lines() { let a: Vec<i32> = l.unwrap().split(',').map(|x| x.parse().unwrap()).collect(); writeln!(w, \"{}\", Solution::max_sub_array(a)).unwrap(); }\n}\n",
}

# the brute force tries every start and end: 5 × 10⁹ additions at n = 10⁵
SKIP = {'brute': lambda c: c.count(',') >= 3000}


def oracle(a):
    best = None
    p = 0
    low = 0          # the smallest prefix sum before the current end (P[0] = 0)
    for x in a:
        p += x
        cand = p - low
        best = cand if best is None or cand > best else best
        low = min(low, p)
    return best


def corpus():
    random.seed(53)
    cases = [[-2, 1, -3, 4, -1, 2, 1, -5, 4], [1], [5, 4, -1, 7, 8],
             [-7], [-3, -1, -2], [-5, -5, 3, -5], [0, 0, 0], [10**4, -10**4, 10**4]]
    cases += [[random.randint(-5, 5) for _ in range(random.randint(1, 9))] for _ in range(15000)]
    cases += [[random.randint(-10**4, 10**4) for _ in range(random.randint(1, 60))] for _ in range(5000)]
    n = 10**5
    cases += [[random.randint(-10**4, 10**4) for _ in range(n)], [-10**4] * n, [10**4] * n,
              [10**4 if i % 2 else -10**4 + 1 for i in range(n)],
              [random.randint(-10**4, -1) if random.random() > 0.001 else 10**4 for _ in range(n)]]
    return [(','.join(map(str, a)), str(oracle(a))) for a in cases]
