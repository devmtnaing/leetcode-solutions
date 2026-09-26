"""Trapping Rain Water — the corpus the page's badges describe.

The 2 examples, 6 edges (one bar, two bars, all equal, rising, falling, a
single deep well), 15,000 random landscapes of 1 to 12 bars from 0..5 —
plateaus and ties everywhere — 5,000 of up to 300 bars across the full
height range, and four at the limits: 2 × 10⁴ random bars, a valley between
two walls of 10⁵ (1,999,800,000 units of water — it fits a 32-bit int with
under 7% to spare), a sawtooth, and a single peak in the middle.

A line is the heights, comma-separated; each driver prints the water.

The oracle fills the water in horizontal layers with a stack of bars: each
time a taller bar arrives, the pool over the bar it covers is bounded by
the bar before that one — neither running maxima nor two pointers.
"""
import random

DRIVERS = {
    'ruby': "{SOL}\nSTDIN.each_line { |l| puts trap(l.chomp.split(',').map(&:to_i)) }\n",
    'python': "{SOL}\nimport sys\nprint('\\n'.join(str(Solution().trap([int(x) for x in l.split(',')])) for l in sys.stdin.read().split('\\n')[:-1]))\n",
    'javascript': "{SOL}\nconst L = require('fs').readFileSync(0, 'utf8').split('\\n'); L.pop();\nconsole.log(L.map((l) => String(trap(l.split(',').map(Number)))).join('\\n'));\n",
    'go': "package main\nimport (\"bufio\"; \"fmt\"; \"os\"; \"strconv\"; \"strings\")\n{SOL}\nfunc main() {\n  sc := bufio.NewScanner(os.Stdin); sc.Buffer(make([]byte, 1<<22), 1<<22)\n  w := bufio.NewWriter(os.Stdout); defer w.Flush()\n  for sc.Scan() { f := strings.Split(sc.Text(), \",\"); a := make([]int, len(f)); for i, x := range f { a[i], _ = strconv.Atoi(x) }; fmt.Fprintln(w, trap(a)) }\n}\n",
    'rust': "struct Solution;\n{SOL}\nuse std::io::{BufRead, Write};\nfn main() {\n  let o = std::io::stdout(); let mut w = std::io::BufWriter::new(o.lock());\n  for l in std::io::stdin().lock().lines() { let a: Vec<i32> = l.unwrap().split(',').map(|x| x.parse().unwrap()).collect(); writeln!(w, \"{}\", Solution::trap(a)).unwrap(); }\n}\n",
}


def oracle(h):
    stack, total = [], 0
    for i, x in enumerate(h):
        while stack and h[stack[-1]] < x:
            bottom = stack.pop()
            if not stack:
                break
            left = stack[-1]
            total += (i - left - 1) * (min(h[left], x) - h[bottom])
        stack.append(i)
    return total


def corpus():
    random.seed(42)
    cases = [[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1], [4, 2, 0, 3, 2, 5],
             [5], [3, 1], [2, 2, 2, 2], list(range(8)), list(range(8, 0, -1)), [9, 0, 0, 0, 9]]
    for _ in range(15000):
        cases.append([random.randint(0, 5) for _ in range(random.randint(1, 12))])
    for _ in range(5000):
        cases.append([random.randint(0, 10**5) for _ in range(random.randint(1, 300))])
    N = 2 * 10**4
    cases.append([random.randint(0, 10**5) for _ in range(N)])
    cases.append([10**5] + [0] * (N - 2) + [10**5])
    cases.append([(i % 7) * 10**4 for i in range(N)])
    cases.append([min(i, N - 1 - i) * 10 for i in range(N)])
    return [(','.join(map(str, h)), str(oracle(h))) for h in cases]
