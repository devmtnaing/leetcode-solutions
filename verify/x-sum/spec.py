"""X-Sum (3318 and its hard twin 3321) — the corpus the page's badges describe.

Two corpora in one. At 3318's limits (n ≤ 50, values ≤ 50): the 2 examples,
edges, and 20,000 random cases, run by every approach. Beyond them, at
3321's scale (values up to 10⁹, sums past 32 bits): 3,000 mid-size cases and
two at n = 10⁵, k = 5 × 10⁴ — run only by the lazy heaps, the approach 3321
needs (the brute-force and sorted-array listings return 32-bit results, as
3318's signature allows).

The oracle keeps its own counts and ranks each window by sorting (count,
value) — no shelves, no heaps.
"""
import random
from collections import Counter

DRIVERS = {
    'ruby': "{SOL}\nSTDIN.each_line { |l| a, k, x = l.chomp.split('|'); puts find_x_sum(a.split(',').map(&:to_i), k.to_i, x.to_i).join(',') }\n",
    'python': "{SOL}\nimport sys\nout = []\nfor l in sys.stdin.read().split('\\n')[:-1]:\n    a, k, x = l.split('|')\n    out.append(','.join(map(str, Solution().findXSum([int(v) for v in a.split(',')], int(k), int(x)))))\nprint('\\n'.join(out))\n",
    'javascript': "{SOL}\nconst L = require('fs').readFileSync(0, 'utf8').split('\\n'); L.pop();\nconsole.log(L.map((l) => { const [a, k, x] = l.split('|'); return findXSum(a.split(',').map(Number), Number(k), Number(x)).join(','); }).join('\\n'));\n",
    'go': "package main\nimport (\"bufio\"; \"fmt\"; \"os\"; \"strconv\"; \"strings\")\n{SOL}\nfunc main() {\n  sc := bufio.NewScanner(os.Stdin); sc.Buffer(make([]byte, 1<<24), 1<<24)\n  w := bufio.NewWriter(os.Stdout); defer w.Flush()\n  for sc.Scan() {\n    p := strings.Split(sc.Text(), \"|\"); f := strings.Split(p[0], \",\"); a := make([]int, len(f))\n    for i, s := range f { a[i], _ = strconv.Atoi(s) }\n    k, _ := strconv.Atoi(p[1]); x, _ := strconv.Atoi(p[2])\n    s := fmt.Sprint(findXSum(a, k, x))\n    fmt.Fprintln(w, strings.ReplaceAll(strings.Trim(s, \"[]\"), \" \", \",\"))\n  }\n}\n",
    'rust': "struct Solution;\n{SOL}\nuse std::io::{BufRead, Write};\nfn main() {\n  let o = std::io::stdout(); let mut w = std::io::BufWriter::new(o.lock());\n  for l in std::io::stdin().lock().lines() {\n    let l = l.unwrap(); let p: Vec<&str> = l.split('|').collect();\n    let a: Vec<i32> = p[0].split(',').map(|v| v.parse().unwrap()).collect();\n    let r = Solution::find_x_sum(a, p[1].parse().unwrap(), p[2].parse().unwrap());\n    writeln!(w, \"{}\", r.iter().map(|v| v.to_string()).collect::<Vec<_>>().join(\",\")).unwrap();\n  }\n}\n",
}

def beyond_3318(case):
    a = case.split('|')[0].split(',')
    return len(a) > 50 or any(int(v) > 50 for v in a)

# the brute force and sorted arrays are 3318 answers; the heaps are what 3321 needs
SKIP = {'brute': beyond_3318, 'sorted': beyond_3318}


def x_sums(a, k, x):
    """Every window's x-sum, counts kept incrementally, each window ranked by a sort."""
    counts = Counter(a[:k])
    out = []
    for i in range(len(a) - k + 1):
        if i:
            counts[a[i - 1]] -= 1
            if not counts[a[i - 1]]: del counts[a[i - 1]]
            counts[a[i + k - 1]] += 1
        ranked = sorted(counts.items(), key=lambda vc: (vc[1], vc[0]), reverse=True)
        out.append(sum(v * c for v, c in ranked[:x]))
    return out


def case(a, k, x):
    return (f"{','.join(map(str, a))}|{k}|{x}", ','.join(map(str, x_sums(a, k, x))))


def corpus():
    random.seed(3318)
    out = [case([1, 1, 2, 2, 3, 4, 2, 3], 6, 2), case([3, 8, 7, 8, 7, 5], 2, 2)]
    out += [case([7], 1, 1), case([50] * 50, 50, 1), case(list(range(1, 51)), 50, 50), case([5, 5, 4, 4, 3, 3, 5, 4, 3], 5, 2)]
    for _ in range(20000):
        n = random.randint(1, 12)
        a = [random.randint(1, random.choice([3, 6, 50])) for _ in range(n)]
        k = random.randint(1, n)
        out.append(case(a, k, random.randint(1, k)))
    for _ in range(3000):
        n = random.randint(51, 400)
        a = [random.choice([random.randint(1, 10**9), random.randint(1, 20)]) for _ in range(n)]
        k = random.randint(1, n)
        out.append(case(a, k, random.randint(1, k)))
    n, k = 10**5, 5 * 10**4
    pool = [random.randint(10**8, 10**9) for _ in range(40)]
    out.append(case([random.choice(pool) for _ in range(n)], k, 20))
    out.append(case([pool[i % 7] if i % 3 else 10**9 for i in range(n)], k, 3))
    return out
