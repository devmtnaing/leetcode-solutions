"""Median of Two Sorted Arrays — the corpus the page's badges describe.

The 2 examples, 8 edges (one array empty, either one; one value each; every
value equal; every value of nums1 below every value of nums2 and the other
way round; interleaved; the extremes ±10⁶), 15,000 random pairs of 0 to 6
values from -5..5 — duplicates across the cut, the case the ≤ and the ±inf
ends decide — 5,000 of up to 1,000 each across the full range, and four at
the limits: 1,000 and 1,000, 1,000 and none, one and 1,000, and 1,000 equal
values against 1,000 others.

A line is "nums1|nums2", values comma-separated; each driver prints the
median to five decimals, as LeetCode shows it. Every median is a whole
number or a half, exact in floating point, so the five languages agree.

The oracle sorts the two arrays together and reads off the middle.
"""
import random

DRIVERS = {
    'ruby': "{SOL}\nSTDIN.each_line { |l| a, b = l.chomp.split('|', -1).map { |s| s.split(',').map(&:to_i) }; puts format('%.5f', find_median_sorted_arrays(a, b)) }\n",
    'python': "{SOL}\nimport sys\n_out = []\nfor l in sys.stdin.read().split('\\n')[:-1]:\n    a, b = ([int(x) for x in s.split(',') if x] for s in l.split('|'))\n    _out.append(f'{Solution().findMedianSortedArrays(a, b):.5f}')\nprint('\\n'.join(_out))\n",
    'javascript': "{SOL}\nconst L = require('fs').readFileSync(0, 'utf8').split('\\n'); L.pop();\nconsole.log(L.map((l) => { const [a, b] = l.split('|').map((s) => (s ? s.split(',').map(Number) : [])); return findMedianSortedArrays(a, b).toFixed(5); }).join('\\n'));\n",
    'go': "package main\nimport (\"bufio\"; \"fmt\"; \"os\"; \"strconv\"; \"strings\")\n{SOL}\nfunc parse(s string) []int { r := []int{}; if s == \"\" { return r }; for _, x := range strings.Split(s, \",\") { v, _ := strconv.Atoi(x); r = append(r, v) }; return r }\nfunc main() {\n  sc := bufio.NewScanner(os.Stdin); sc.Buffer(make([]byte, 1<<22), 1<<22)\n  w := bufio.NewWriter(os.Stdout); defer w.Flush()\n  for sc.Scan() { p := strings.SplitN(sc.Text(), \"|\", 2); fmt.Fprintf(w, \"%.5f\\n\", findMedianSortedArrays(parse(p[0]), parse(p[1]))) }\n}\n",
    'rust': "struct Solution;\n{SOL}\nuse std::io::{BufRead, Write};\nfn parse(s: &str) -> Vec<i32> { if s.is_empty() { vec![] } else { s.split(',').map(|x| x.parse().unwrap()).collect() } }\nfn main() {\n  let o = std::io::stdout(); let mut w = std::io::BufWriter::new(o.lock());\n  for l in std::io::stdin().lock().lines() { let l = l.unwrap(); let (a, b) = l.split_once('|').unwrap();\n    writeln!(w, \"{:.5}\", Solution::find_median_sorted_arrays(parse(a), parse(b))).unwrap(); }\n}\n",
}


def oracle(a, b):
    s = sorted(a + b)
    n = len(s)
    m = s[n // 2] if n % 2 else (s[n // 2 - 1] + s[n // 2]) / 2
    return f'{m:.5f}'


def rand(k, lo, hi):
    return sorted(random.randint(lo, hi) for _ in range(k))


def corpus():
    random.seed(4)
    cases = [([1, 3], [2]), ([1, 2], [3, 4]),
             ([], [1]), ([2], []), ([1], [2]), ([5, 5], [5, 5, 5]), ([1, 2, 3], [7, 8]), ([7, 8, 9], [1, 2]),
             ([1, 3, 5, 7], [2, 4, 6, 8]), ([-10**6], [10**6])]
    while len(cases) < 15010:
        m, n = random.randint(0, 6), random.randint(0, 6)
        if m + n:
            cases.append((rand(m, -5, 5), rand(n, -5, 5)))
    for _ in range(5000):
        m, n = random.randint(0, 1000), random.randint(1, 1000)
        pair = (rand(m, -10**6, 10**6), rand(n, -10**6, 10**6))
        cases.append(pair if random.random() < 0.5 else pair[::-1])
    cases += [(rand(1000, -10**6, 10**6), rand(1000, -10**6, 10**6)), (rand(1000, -10**6, 10**6), []),
              ([0], rand(1000, -10**6, 10**6)), ([7] * 1000, rand(1000, -10**6, 10**6))]
    return [(f"{','.join(map(str, a))}|{','.join(map(str, b))}", oracle(a, b)) for a, b in cases]
