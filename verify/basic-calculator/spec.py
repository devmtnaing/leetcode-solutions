"""Basic Calculator — the corpus the page's badges describe.

The 3 examples, 10 edges (a bare number, 2³¹ − 1, a leading unary minus, a
minus before a bracket, a minus inside a bracket after a minus, "1 - 1",
brackets round one number, four nested brackets, spaces everywhere, a
bracket that follows a number's minus), 15,000 random expressions of up to
185 characters over numbers 0..20, nesting up to 4 deep, with unary
minus where the statement allows it (at the start and just after "(") and
random spaces — 5,000 of up to 1,200 characters with numbers up to 10⁶, and six near the
3 × 10⁵-character constraint: 149,999 brackets nested round one number, the
same alternating with unary minus, a flat sum of 50,000 numbers, a random
expression, numbers near 2³¹ − 1 added and taken away, and 75,000 "(1)"
chained with minus.

Every running total stays within a signed 32-bit integer, as the statement
promises: the generator throws away any expression whose partial sums leave
it. A line is the expression itself; each driver prints its value.

The oracle never recurses and never keeps a (total, sign) pair: it keeps a
stack of the sign each open bracket multiplies by, and adds each number,
times the signs in force, straight into one total. Short expressions are
also checked against Python's eval while the corpus is built.
"""
import random

BIG_STACK = True   # the recursive listing goes 150,000 calls deep on nested brackets

DRIVERS = {
    'ruby': "{SOL}\nSTDIN.each_line { |l| puts calculate(l.chomp) }\n",
    'python': "import sys\n{SOL}\n_out = []\nfor l in sys.stdin.read().split('\\n')[:-1]:\n    _out.append(str(Solution().calculate(l)))\nprint('\\n'.join(_out))\n",
    # Node runs the listing in a worker with a 512 MB stack: its main thread
    # is capped by the OS (64 MB here), too little for 150,000 nested calls
    'javascript': "{SOL}\nconst { Worker, isMainThread } = require('worker_threads');\nif (isMainThread) new Worker(__filename, { resourceLimits: { stackSizeMb: 512 } });\nelse {\n  const L = require('fs').readFileSync(0, 'utf8').split('\\n'); L.pop();\n  process.stdout.write(L.map((l) => String(calculate(l))).join('\\n') + '\\n');\n}\n",
    'go': "package main\nimport (\"bufio\"; \"fmt\"; \"os\")\n{SOL}\nfunc main() {\n  sc := bufio.NewScanner(os.Stdin); sc.Buffer(make([]byte, 1<<24), 1<<24)\n  w := bufio.NewWriter(os.Stdout); defer w.Flush()\n  for sc.Scan() { fmt.Fprintln(w, calculate(sc.Text())) }\n}\n",
    # Rust runs on a 1 GB thread, as BIG_STACK does for Ruby and Node: the
    # recursive listing overflows the 8 MB main thread (the badge says where)
    'rust': "struct Solution;\n{SOL}\nuse std::io::{BufRead, Write};\nfn run() {\n  let o = std::io::stdout(); let mut w = std::io::BufWriter::new(o.lock());\n  for l in std::io::stdin().lock().lines() { writeln!(w, \"{}\", Solution::calculate(l.unwrap())).unwrap(); }\n}\nfn main() { std::thread::Builder::new().stack_size(1 << 30).spawn(run).unwrap().join().unwrap(); }\n",
}

LIM = 2 ** 31 - 1


def oracle(s):
    """Returns (value, fits). The value: every number times the signs of the
    brackets it sits in. fits: whether each bracket's running sum stays in 32
    bits, as the statement promises."""
    signs = [1]           # the sign each open bracket multiplies by, innermost last
    pending = 1           # the sign written before the next number or bracket
    total, fits, i = 0, True, 0
    sums, before = [0], []    # per bracket: its own running sum, and the sign written before it
    while i < len(s):
        ch = s[i]
        if ch.isdigit():
            j = i
            while j < len(s) and s[j].isdigit():
                j += 1
            v = int(s[i:j])
            total += signs[-1] * pending * v
            sums[-1] += pending * v
            fits &= v <= LIM and abs(sums[-1]) <= LIM
            i = j
            continue
        if ch in '+-':
            pending = 1 if ch == '+' else -1
        elif ch == '(':
            signs.append(signs[-1] * pending)
            sums.append(0)
            before.append(pending)
            pending = 1
        elif ch == ')':
            signs.pop()
            inner = sums.pop()
            sums[-1] += before.pop() * inner
            fits &= abs(sums[-1]) <= LIM
        i += 1
    return total, fits


def sp(p):
    return ' ' if random.random() < p else ''


def gen(depth, hi, n_terms, p_space):
    out = []
    if random.random() < 0.2:
        out.append('-' + sp(p_space))
    for t in range(n_terms):
        if t:
            out.append(sp(p_space) + random.choice('+-') + sp(p_space))
        if depth > 0 and random.random() < 0.3:
            out.append('(' + sp(p_space) + gen(depth - 1, hi, random.randint(1, 4), p_space) + sp(p_space) + ')')
        else:
            out.append(str(random.randint(0, hi)))
    return ''.join(out)


def keep(s):
    v, fits = oracle(s)
    if not fits:
        return False
    if len(s) < 200:
        assert eval(s) == v, s
    return True


def corpus():
    random.seed(224)
    cases = ['1 + 1', ' 2-1 + 2 ', '(1+(4+5+2)-3)+(6+8)',
             '7', '2147483647', '-1', '-(2+3)', '1-(-2)', '1 - 1', '(1)', '((((7))))', '  1 +  (  2 - 3 )  ', '10 - (5 + 5) - 1']
    while len(cases) < 13 + 15000:
        s = gen(random.randint(0, 4), 20, random.randint(1, 5), random.random() * 0.5)
        if keep(s):
            cases.append(s)
    while len(cases) < 13 + 20000:
        s = gen(random.randint(2, 8), random.choice([9, 1000, 10 ** 6]), random.randint(5, 20), random.random() * 0.3)
        if len(s) <= 1200 and keep(s):
            cases.append(s)
    d = 149_999
    big = ['(' * d + '1' + ')' * d,
           ''.join('(-' if k % 2 else '(' for k in range(d // 2)) + '5' + ')' * (d // 2),
           '+'.join(str(random.randint(0, 9999)) for _ in range(50_000)),
           ' - '.join(['2147483647', '2147483647']) + ' + 2147483647' * 1 + ' - 1000000000' + ' + 1' * 10_000,
           '-'.join(['(1)'] * 75_000)]
    parts = []
    while sum(map(len, parts)) < 250_000:
        chunk = '(' + gen(6, 10 ** 4, 8, 0.2) + ')'
        if keep(chunk):
            parts.append(chunk)
    big.insert(3, ' - '.join(parts))
    for s in big:
        assert len(s) <= 300_000 and keep(s), len(s)
    cases += big
    return [(s, str(oracle(s)[0])) for s in cases]
