"""Search in Rotated Sorted Array — the corpus the page's badges describe.

The 3 examples, 6 edges (one value, two values each way round, the target at
each end, a rotation by n − 1), 15,000 random arrays of 1 to 9 distinct
values from -9..9 rotated by any k (including none), each with a target
drawn from -10..10 so it is often absent, 5,000 of up to 200 across ±10⁴,
and five at n = 5000 (every rotation style, targets present and absent). A
line is "nums|target".

The oracle is a dictionary from value to index — no search at all.
"""
import random

DRIVERS = {
    'ruby': "{SOL}\nSTDIN.each_line { |l| a, t = l.chomp.split('|'); puts search(a.split(',').map(&:to_i), t.to_i) }\n",
    'python': "{SOL}\nimport sys\nsol = Solution()\nout = []\nfor l in sys.stdin.read().split('\\n')[:-1]:\n    a, t = l.split('|')\n    out.append(str(sol.search([int(x) for x in a.split(',')], int(t))))\nprint('\\n'.join(out))\n",
    'javascript': "{SOL}\nconst L = require('fs').readFileSync(0, 'utf8').split('\\n'); L.pop();\nconsole.log(L.map((l) => { const [a, t] = l.split('|'); return String(search(a.split(',').map(Number), Number(t))); }).join('\\n'));\n",
    'go': "package main\nimport (\"bufio\"; \"fmt\"; \"os\"; \"strconv\"; \"strings\")\n{SOL}\nfunc main() {\n  sc := bufio.NewScanner(os.Stdin); sc.Buffer(make([]byte, 1<<24), 1<<24)\n  w := bufio.NewWriter(os.Stdout); defer w.Flush()\n  for sc.Scan() { parts := strings.Split(sc.Text(), \"|\"); p := strings.Split(parts[0], \",\"); a := make([]int, len(p)); for i, x := range p { a[i], _ = strconv.Atoi(x) }; t, _ := strconv.Atoi(parts[1]); fmt.Fprintln(w, search(a, t)) }\n}\n",
    'rust': "struct Solution;\n{SOL}\nuse std::io::{BufRead, Write};\nfn main() {\n  let o = std::io::stdout(); let mut w = std::io::BufWriter::new(o.lock());\n  for l in std::io::stdin().lock().lines() { let l = l.unwrap(); let (a, t) = l.split_once('|').unwrap(); let a: Vec<i32> = a.split(',').map(|x| x.parse().unwrap()).collect(); writeln!(w, \"{}\", Solution::search(a, t.parse().unwrap())).unwrap(); }\n}\n",
}


def rotated(values, k):
    s = sorted(values)
    return s[k:] + s[:k]


def oracle(a, t):
    where = {v: i for i, v in enumerate(a)}
    return where.get(t, -1)


def corpus():
    random.seed(33)
    cases = [([4, 5, 6, 7, 0, 1, 2], 0), ([4, 5, 6, 7, 0, 1, 2], 3), ([1], 0),
             ([1], 1), ([1, 3], 3), ([3, 1], 1), ([3, 1], 3), ([5, 1, 3], 5), ([2, 3, 4, 5, 1], 1)]
    for _ in range(15000):
        n = random.randint(1, 9)
        vals = random.sample(range(-9, 10), n)
        cases.append((rotated(vals, random.randrange(n)), random.randint(-10, 10)))
    for _ in range(5000):
        n = random.randint(1, 200)
        vals = random.sample(range(-10**4, 10**4 + 1), n)
        a = rotated(vals, random.randrange(n))
        cases.append((a, random.choice(a) if random.random() < 0.7 else random.randint(-10**4, 10**4)))
    n = 5000
    for k, present in [(0, True), (1, True), (n - 1, True), (n // 2, False), (1234, True)]:
        vals = random.sample(range(-10**4, 10**4 + 1), n)
        a = rotated(vals, k)
        missing = next(v for v in range(-10**4, 10**4 + 1) if v not in set(a))
        cases.append((a, random.choice(a) if present else missing))
    out = []
    for a, t in cases:
        out.append((','.join(map(str, a)) + '|' + str(t), str(oracle(a, t))))
    return out
