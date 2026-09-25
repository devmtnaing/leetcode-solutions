"""Product of Array Except Self — the corpus the page's badges describe.

The 2 examples, 6 edges, 15,000 random arrays of up to 8 values from -3..3
(zeros and signs everywhere), 5,000 of up to 12 values from -30..30, and five
at n = 10⁵ (±1 with a few larger factors, one zero, two zeros, all ones, and
the largest product the constraint allows). Every array is kept only if each
prefix and suffix product fits in 32 bits, as the statement guarantees. One
edge is [2, 0, 30 × 15, 0]: every prefix and suffix is 0 or 2, but the product
of the middle stretch overflows even 64 bits — a brute force that multiplies
the right side left to right would overflow there.

The oracle multiplies Python's unbounded integers directly.
"""
import random

DRIVERS = {
    'ruby': "{SOL}\nSTDIN.each_line { |l| puts product_except_self(l.split(',').map(&:to_i)).join(',') }\n",
    'python': "{SOL}\nimport sys\nsol = Solution()\nprint('\\n'.join(','.join(map(str, sol.productExceptSelf([int(x) for x in l.split(',')]))) for l in sys.stdin.read().split('\\n')[:-1]))\n",
    'javascript': "{SOL}\nconst L = require('fs').readFileSync(0, 'utf8').split('\\n'); L.pop();\nconsole.log(L.map((l) => productExceptSelf(l.split(',').map(Number)).join(',')).join('\\n'));\n",
    'go': "package main\nimport (\"bufio\"; \"fmt\"; \"os\"; \"strconv\"; \"strings\")\n{SOL}\nfunc main() {\n  sc := bufio.NewScanner(os.Stdin); sc.Buffer(make([]byte, 1<<24), 1<<24)\n  w := bufio.NewWriter(os.Stdout); defer w.Flush()\n  for sc.Scan() { p := strings.Split(sc.Text(), \",\"); a := make([]int, len(p)); for i, x := range p { a[i], _ = strconv.Atoi(x) }; r := productExceptSelf(a); s := make([]string, len(r)); for i, v := range r { s[i] = strconv.Itoa(v) }; fmt.Fprintln(w, strings.Join(s, \",\")) }\n}\n",
    'rust': "struct Solution;\n{SOL}\nuse std::io::{BufRead, Write};\nfn main() {\n  let o = std::io::stdout(); let mut w = std::io::BufWriter::new(o.lock());\n  for l in std::io::stdin().lock().lines() { let a: Vec<i32> = l.unwrap().split(',').map(|x| x.parse().unwrap()).collect(); let r: Vec<String> = Solution::product_except_self(a).iter().map(|v| v.to_string()).collect(); writeln!(w, \"{}\", r.join(\",\")).unwrap(); }\n}\n",
}

# the brute force is quadratic: 10¹⁰ multiplications at n = 10⁵
SKIP = {'brute': lambda c: c.count(',') >= 3000}

LO, HI = -2**31, 2**31 - 1


def valid(a):
    for seq in (a, a[::-1]):
        p = 1
        for x in seq:
            p *= x
            if not LO <= p <= HI:
                return False
    return all(LO <= v <= HI for v in oracle(a))


def oracle(a):
    out = []
    for i in range(len(a)):
        p = 1
        for j, x in enumerate(a):
            if j != i:
                p *= x
        out.append(p)
    return out


def oracle_fast(a):
    # the same products for the big arrays, counted by zeros so it stays linear
    zeros = a.count(0)
    whole = 1
    for x in a:
        if x:
            whole *= x
    if zeros > 1:
        return [0] * len(a)
    if zeros == 1:
        return [whole if x == 0 else 0 for x in a]
    return [whole // x for x in a]


def small(n, lo, hi):
    # draw, then shrink random elements to -2..2 until every product fits
    a = [random.randint(lo, hi) for _ in range(n)]
    while not valid(a):
        a[random.randrange(n)] = random.randint(-2, 2)
    return a


def big(n, factors, zeros=0):
    a = [random.choice((1, -1)) for _ in range(n)]
    for f in factors:
        a[random.randrange(n)] = f
    for _ in range(zeros):
        a[random.randrange(n)] = 0
    return a


def corpus():
    random.seed(238)
    cases = [[1, 2, 3, 4], [-1, 1, 0, -3, 3], [0, 0], [5, 0], [-30, 30], [1, -1],
             [2, 0] + [30] * 15 + [0], [2, 3, 0, 4, 5]]
    for c in cases:
        assert valid(c), c
    cases += [small(random.randint(2, 8), -3, 3) for _ in range(15000)]
    cases += [small(random.randint(2, 12), -30, 30) for _ in range(5000)]
    n = 10**5
    bigs = [big(n, [2, 3, 5, -7, 11]), big(n, [30, -30, 29], zeros=1), big(n, [2, 2, 3], zeros=2),
            [1] * n, big(n, [2] * 30)]
    out = [(','.join(map(str, a)), ','.join(map(str, oracle(a)))) for a in cases]
    for a in bigs:
        r = oracle_fast(a)
        assert all(LO <= v <= HI for v in r)
        out.append((','.join(map(str, a)), ','.join(map(str, r))))
    return out
