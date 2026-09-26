"""Largest Rectangle in Histogram — the corpus the page's badges describe.

The 2 examples, 6 edges (one bar, a zero bar, all equal, rising, falling, a
zero splitting two tall blocks), 15,000 random histograms of 1 to 12 bars
from 0..5 — equal heights everywhere, the case the stack's >= decides —
5,000 of up to 300 bars across the full range, and five at the limit of 10⁵
bars: random, all 10⁴ (area 10⁹, inside a 32-bit int), rising, falling, and
alternating 0 and 10⁴.

A line is the heights, comma-separated; each driver prints the area.

Growing around each bar is O(n²) — 10¹⁰ steps on 10⁵ equal bars — so it
skips the five inputs at 10⁵.

The oracle finds, for each bar, the nearest lower bar on each side by
jumping along already-found neighbours (left[j] of a bar j that is not
lower), then takes height × width — no stack, no growing step by step.
"""
import random

DRIVERS = {
    'ruby': "{SOL}\nSTDIN.each_line { |l| puts largest_rectangle_area(l.chomp.split(',').map(&:to_i)) }\n",
    'python': "{SOL}\nimport sys\nprint('\\n'.join(str(Solution().largestRectangleArea([int(x) for x in l.split(',')])) for l in sys.stdin.read().split('\\n')[:-1]))\n",
    'javascript': "{SOL}\nconst L = require('fs').readFileSync(0, 'utf8').split('\\n'); L.pop();\nconsole.log(L.map((l) => String(largestRectangleArea(l.split(',').map(Number)))).join('\\n'));\n",
    'go': "package main\nimport (\"bufio\"; \"fmt\"; \"os\"; \"strconv\"; \"strings\")\n{SOL}\nfunc main() {\n  sc := bufio.NewScanner(os.Stdin); sc.Buffer(make([]byte, 1<<22), 1<<22)\n  w := bufio.NewWriter(os.Stdout); defer w.Flush()\n  for sc.Scan() { f := strings.Split(sc.Text(), \",\"); a := make([]int, len(f)); for i, x := range f { a[i], _ = strconv.Atoi(x) }; fmt.Fprintln(w, largestRectangleArea(a)) }\n}\n",
    'rust': "struct Solution;\n{SOL}\nuse std::io::{BufRead, Write};\nfn main() {\n  let o = std::io::stdout(); let mut w = std::io::BufWriter::new(o.lock());\n  for l in std::io::stdin().lock().lines() { let a: Vec<i32> = l.unwrap().split(',').map(|x| x.parse().unwrap()).collect(); writeln!(w, \"{}\", Solution::largest_rectangle_area(a)).unwrap(); }\n}\n",
}

SKIP = {'extend': lambda c: c.count(',') >= 99_999}


def oracle(h):
    n = len(h)
    left, right = [0] * n, [0] * n
    for i in range(n):
        j = i - 1
        while j >= 0 and h[j] >= h[i]:
            j = left[j]
        left[i] = j
    for i in range(n - 1, -1, -1):
        j = i + 1
        while j < n and h[j] >= h[i]:
            j = right[j]
        right[i] = j
    return max(h[i] * (right[i] - left[i] - 1) for i in range(n))


def corpus():
    random.seed(84)
    cases = [[2, 1, 5, 6, 2, 3], [2, 4], [7], [0], [3, 3, 3, 3], [1, 2, 3, 4, 5], [5, 4, 3, 2, 1], [6, 6, 0, 6, 6, 6]]
    for _ in range(15000):
        cases.append([random.randint(0, 5) for _ in range(random.randint(1, 12))])
    for _ in range(5000):
        cases.append([random.randint(0, 10**4) for _ in range(random.randint(1, 300))])
    N = 10**5
    cases += [[random.randint(0, 10**4) for _ in range(N)], [10**4] * N,
              [i // 10 for i in range(N)], [10**4 - i // 10 for i in range(N)], [0 if i % 2 else 10**4 for i in range(N)]]
    return [(','.join(map(str, h)), str(oracle(h))) for h in cases]
