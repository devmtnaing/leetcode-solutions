"""Find Median from Data Stream — the corpus the page's badges describe.

The example, 6 edges (one number, a negative stream, every number equal, the
two extremes ±10⁵, an ascending run, a descending run), 15,000 random runs of
up to 20 calls over -5..5 — duplicates and ties on both sides of the middle
everywhere — 5,000 of up to 500 calls over the full ±10⁵, and six of 5 × 10⁴
calls: 25,000 ascending adds each followed by a find, the same descending,
random, all equal, 49,999 adds and one find, and random values with a find
after every tenth add.

Every run starts with addNum, as the statement promises. A line is the calls,
"a num" or "f", joined by ";"; each driver builds a MedianFinder the way
LeetCode does and prints what every call returned — "null" for addNum, the
median to 5 decimal places for findMedian — comma-separated.

The oracle counts how often each value has been added in a Fenwick tree over
-10⁵..10⁵ and walks it to the middle one or two — no sorted list, no heaps.
"""
import random

LO, HI = -10 ** 5, 10 ** 5

DRIVERS = {
    'ruby': "{SOL}\nSTDIN.each_line { |l| m = MedianFinder.new\n  puts l.chomp.split(';').map { |o| o == 'f' ? format('%.5f', m.find_median) : (m.add_num(o[2..].to_i); 'null') }.join(',') }\n",
    'python': "{SOL}\nimport sys\n_out = []\nfor l in sys.stdin.read().split('\\n')[:-1]:\n    m = MedianFinder(); r = []\n    for o in l.split(';'):\n        if o == 'f':\n            r.append(f'{m.findMedian():.5f}')\n        else:\n            m.addNum(int(o[2:])); r.append('null')\n    _out.append(','.join(r))\nprint('\\n'.join(_out))\n",
    'javascript': "{SOL}\nconst L = require('fs').readFileSync(0, 'utf8').split('\\n'); L.pop();\nconsole.log(L.map((l) => { const m = new MedianFinder();\n  return l.split(';').map((o) => { if (o === 'f') return m.findMedian().toFixed(5); m.addNum(Number(o.slice(2))); return 'null'; }).join(','); }).join('\\n'));\n",
    'go': "package main\nimport (\"bufio\"; \"container/heap\"; \"fmt\"; \"os\"; \"sort\"; \"strconv\"; \"strings\")\nvar _ = heap.Init\nvar _ = sort.Ints\n{SOL}\nfunc main() {\n  sc := bufio.NewScanner(os.Stdin); sc.Buffer(make([]byte, 1<<24), 1<<24)\n  w := bufio.NewWriter(os.Stdout); defer w.Flush()\n  for sc.Scan() { m := Constructor(); ops := strings.Split(sc.Text(), \";\"); r := make([]string, len(ops))\n    for i, o := range ops { if o == \"f\" { r[i] = fmt.Sprintf(\"%.5f\", m.FindMedian()) } else { v, _ := strconv.Atoi(o[2:]); m.AddNum(v); r[i] = \"null\" } }\n    fmt.Fprintln(w, strings.Join(r, \",\")) }\n}\n",
    'rust': "{SOL}\nuse std::io::{BufRead, Write};\nfn main() {\n  let o = std::io::stdout(); let mut w = std::io::BufWriter::new(o.lock());\n  for l in std::io::stdin().lock().lines() { let l = l.unwrap(); let mut m = MedianFinder::new();\n    let r: Vec<String> = l.split(';').map(|o| if o == \"f\" { format!(\"{:.5}\", m.find_median()) } else { m.add_num(o[2..].parse().unwrap()); \"null\".to_string() }).collect();\n    writeln!(w, \"{}\", r.join(\",\")).unwrap(); }\n}\n",
}


class Fenwick:
    def __init__(self):
        self.n = HI - LO + 1
        self.t = [0] * (self.n + 1)
        self.size = 0
        self.top = 1 << self.n.bit_length()

    def add(self, v):
        self.size += 1
        i = v - LO + 1
        while i <= self.n:
            self.t[i] += 1
            i += i & -i

    def kth(self, k):
        """The k-th smallest value added, 1-based."""
        pos, step = 0, self.top
        while step:
            if pos + step <= self.n and self.t[pos + step] < k:
                pos += step
                k -= self.t[pos]
            step >>= 1
        return pos + LO


def oracle(ops):
    f, out = Fenwick(), []
    for o in ops:
        if o == 'f':
            n = f.size
            m = f.kth(n // 2 + 1) if n % 2 else (f.kth(n // 2) + f.kth(n // 2 + 1)) / 2
            out.append(f'{m:.5f}')
        else:
            f.add(o)
            out.append('null')
    return ','.join(out)


def run(n, vals):
    ops = [next(vals)]
    while len(ops) < n:
        ops.append('f' if random.random() < 0.4 else next(vals))
    return ops


def rand_vals(lo, hi):
    while True:
        yield random.randint(lo, hi)


def corpus():
    random.seed(295)
    cases = [[1, 2, 'f', 3, 'f'], [7, 'f'], [-1, -2, 'f', -3, 'f', -4, 'f'], [5, 5, 5, 'f', 5, 'f'],
             [-100000, 100000, 'f', -100000, 'f'], [1, 2, 3, 4, 5, 6, 'f', 7, 'f'], [9, 8, 7, 'f', 6, 'f', 5, 'f']]
    for _ in range(15000):
        cases.append(run(random.randint(1, 20), rand_vals(-5, 5)))
    for _ in range(5000):
        cases.append(run(random.randint(1, 500), rand_vals(LO, HI)))
    half = 25_000
    cases.append([x for v in range(half) for x in (v * 4 - 50_000, 'f')])
    cases.append([x for v in range(half) for x in (50_000 - v * 4, 'f')])
    cases.append([x for _ in range(half) for x in (random.randint(LO, HI), 'f')])
    cases.append([x for _ in range(half) for x in (42, 'f')])
    cases.append([random.randint(LO, HI) for _ in range(49_999)] + ['f'])
    cases.append([x for i in range(45_455) for x in ([random.randint(LO, HI)] + (['f'] if i % 10 == 9 else []))][:50_000])
    line = lambda ops: ';'.join('f' if o == 'f' else f'a {o}' for o in ops)
    return [(line(ops), oracle(ops)) for ops in cases]
