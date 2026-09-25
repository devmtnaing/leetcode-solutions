"""Kth Largest Element in an Array — the corpus the page's badges describe.

The 2 examples, 5 edges (one value, all equal, k = n, k = 1, negatives),
15,000 random arrays of 1 to 9 values from -3..3 (duplicates everywhere)
with any valid k, 5,000 of up to 300 values across ±10⁴, and five at
n = 10⁵ (random with k = 1, k = n and k = n / 2, all equal, and sorted
descending). A line is "nums|k".

The oracle counts each value and walks down from the largest, subtracting
counts until k is used up — no sort and no heap.
"""
import random
from collections import Counter

DRIVERS = {
    'ruby': "{SOL}\nSTDIN.each_line { |l| a, k = l.chomp.split('|'); puts find_kth_largest(a.split(',').map(&:to_i), k.to_i) }\n",
    'python': "{SOL}\nimport sys\nsol = Solution()\nout = []\nfor l in sys.stdin.read().split('\\n')[:-1]:\n    a, k = l.split('|')\n    out.append(str(sol.findKthLargest([int(x) for x in a.split(',')], int(k))))\nprint('\\n'.join(out))\n",
    'javascript': "{SOL}\nconst L = require('fs').readFileSync(0, 'utf8').split('\\n'); L.pop();\nconsole.log(L.map((l) => { const [a, k] = l.split('|'); return String(findKthLargest(a.split(',').map(Number), Number(k))); }).join('\\n'));\n",
    'go': "package main\nimport (\"bufio\"; \"container/heap\"; \"fmt\"; \"os\"; \"sort\"; \"strconv\"; \"strings\")\nvar _ = heap.Init\nvar _ = sort.Ints\n{SOL}\nfunc main() {\n  sc := bufio.NewScanner(os.Stdin); sc.Buffer(make([]byte, 1<<24), 1<<24)\n  w := bufio.NewWriter(os.Stdout); defer w.Flush()\n  for sc.Scan() { parts := strings.Split(sc.Text(), \"|\"); p := strings.Split(parts[0], \",\"); a := make([]int, len(p)); for i, x := range p { a[i], _ = strconv.Atoi(x) }; k, _ := strconv.Atoi(parts[1]); fmt.Fprintln(w, findKthLargest(a, k)) }\n}\n",
    'rust': "struct Solution;\n{SOL}\nuse std::io::{BufRead, Write};\nfn main() {\n  let o = std::io::stdout(); let mut w = std::io::BufWriter::new(o.lock());\n  for l in std::io::stdin().lock().lines() { let l = l.unwrap(); let (a, k) = l.split_once('|').unwrap(); let a: Vec<i32> = a.split(',').map(|x| x.parse().unwrap()).collect(); writeln!(w, \"{}\", Solution::find_kth_largest(a, k.parse().unwrap())).unwrap(); }\n}\n",
}


def oracle(a, k):
    count = Counter(a)
    for v in range(max(a), min(a) - 1, -1):
        k -= count.get(v, 0)
        if k <= 0:
            return v


def corpus():
    random.seed(215)
    cases = [([3, 2, 1, 5, 6, 4], 2), ([3, 2, 3, 1, 2, 4, 5, 5, 6], 4),
             ([7], 1), ([2, 2, 2], 2), ([5, 1, 4], 3), ([5, 1, 4], 1), ([-1, -10, -3], 2)]
    for _ in range(15000):
        a = [random.randint(-3, 3) for _ in range(random.randint(1, 9))]
        cases.append((a, random.randint(1, len(a))))
    for _ in range(5000):
        a = [random.randint(-10**4, 10**4) for _ in range(random.randint(1, 300))]
        cases.append((a, random.randint(1, len(a))))
    n = 10**5
    r = [random.randint(-10**4, 10**4) for _ in range(n)]
    cases += [(r, 1), (r, n), (r, n // 2), ([9] * n, 777), (sorted(r, reverse=True), 31337)]
    return [(','.join(map(str, a)) + '|' + str(k), str(oracle(a, k))) for a, k in cases]
