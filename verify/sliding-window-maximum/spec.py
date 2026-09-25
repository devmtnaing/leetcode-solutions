"""Sliding Window Maximum — the corpus the page's badges describe.

The 2 examples, 6 edges (k = 1, k = n, all equal, strictly rising, strictly
falling, the maximum leaving as the next value arrives), 15,000 random arrays
of 1 to 12 values from -3..3 — ties everywhere, the case a deque most often
gets wrong — 5,000 of up to 300 values across the full range, and five at
n = 10⁵: k = 1, k = 50,000, k = 10⁵, a falling array with k = 50,000 (the
deque holds a whole window) and a random one with k = 1,000.

A line is "k|nums"; each driver prints the maxima, comma-separated.

The brute force looks at every value of every window, n · k comparisons: it
skips the five arrays of 10⁵ values, where that reaches 2.5 × 10⁹.

The oracle splits the array into blocks of k and uses each block's prefix and
suffix maxima — a window covers the end of one block and the start of the
next — so it shares nothing with either listing.
"""
import random

DRIVERS = {
    'ruby': "{SOL}\nSTDIN.each_line { |l| k, a = l.chomp.split('|'); puts max_sliding_window(a.split(',').map(&:to_i), k.to_i).join(',') }\n",
    'python': "{SOL}\nimport sys\n_out = []\nfor l in sys.stdin.read().split('\\n')[:-1]:\n    k, a = l.split('|')\n    _out.append(','.join(map(str, Solution().maxSlidingWindow([int(x) for x in a.split(',')], int(k)))))\nprint('\\n'.join(_out))\n",
    'javascript': "{SOL}\nconst L = require('fs').readFileSync(0, 'utf8').split('\\n'); L.pop();\nconsole.log(L.map((l) => { const [k, a] = l.split('|'); return maxSlidingWindow(a.split(',').map(Number), Number(k)).join(','); }).join('\\n'));\n",
    'go': "package main\nimport (\"bufio\"; \"fmt\"; \"os\"; \"strconv\"; \"strings\")\n{SOL}\nfunc main() {\n  sc := bufio.NewScanner(os.Stdin); sc.Buffer(make([]byte, 1<<24), 1<<24)\n  w := bufio.NewWriter(os.Stdout); defer w.Flush()\n  for sc.Scan() { p := strings.Split(sc.Text(), \"|\"); k, _ := strconv.Atoi(p[0]); f := strings.Split(p[1], \",\"); a := make([]int, len(f)); for i, x := range f { a[i], _ = strconv.Atoi(x) }\n    r := maxSlidingWindow(a, k); s := make([]string, len(r)); for i, v := range r { s[i] = strconv.Itoa(v) }; fmt.Fprintln(w, strings.Join(s, \",\")) }\n}\n",
    'rust': "struct Solution;\n{SOL}\nuse std::io::{BufRead, Write};\nfn main() {\n  let o = std::io::stdout(); let mut w = std::io::BufWriter::new(o.lock());\n  for l in std::io::stdin().lock().lines() { let l = l.unwrap(); let (k, a) = l.split_once('|').unwrap(); let a: Vec<i32> = a.split(',').map(|x| x.parse().unwrap()).collect();\n    let r = Solution::max_sliding_window(a, k.parse().unwrap()); let s: Vec<String> = r.iter().map(|v| v.to_string()).collect(); writeln!(w, \"{}\", s.join(\",\")).unwrap(); }\n}\n",
}

SKIP = {'brute': lambda c: c.count(',') >= 99_999}


def oracle(a, k):
    n = len(a)
    pre, suf = a[:], a[:]
    for i in range(1, n):
        if i % k:
            pre[i] = max(pre[i - 1], a[i])
    for i in range(n - 2, -1, -1):
        if (i + 1) % k:
            suf[i] = max(suf[i + 1], a[i])
    return [max(suf[i], pre[i + k - 1]) for i in range(n - k + 1)]


def corpus():
    random.seed(239)
    cases = [([1, 3, -1, -3, 5, 3, 6, 7], 3), ([1], 1),
             ([4, 2, 12, 3], 1), ([4, 2, 12, 3], 4), ([5] * 7, 3), (list(range(10)), 4),
             (list(range(10, 0, -1)), 4), ([9, 1, 1, 1, 8, 1], 3)]
    for _ in range(15000):
        n = random.randint(1, 12)
        cases.append(([random.randint(-3, 3) for _ in range(n)], random.randint(1, n)))
    for _ in range(5000):
        n = random.randint(1, 300)
        cases.append(([random.randint(-10**4, 10**4) for _ in range(n)], random.randint(1, n)))
    N = 10**5
    big = [random.randint(-10**4, 10**4) for _ in range(N)]
    cases += [(big, 1), (big, N // 2), (big, N), (sorted(big, reverse=True), N // 2), (big, 1000)]
    return [(f"{k}|{','.join(map(str, a))}", ','.join(map(str, oracle(a, k)))) for a, k in cases]
