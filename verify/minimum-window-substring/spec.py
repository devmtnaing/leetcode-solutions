"""Minimum Window Substring — the corpus the page's badges describe.

The 3 examples, 7 edges (t longer than s, t equal to s, upper and lower case
of one letter, a letter t needs twice, the answer at the very end, at the very
start, and t's letters absent from s), 15,000 random pairs with s of 1 to 12
letters from "ab", "abc" or "aAb" and t of 1 to 4, 5,000 with s up to 300
from ten letters of both cases and t up to 10, and five at the limits: s of
10⁵ letters with t of 1, 50 and 10⁵ letters, 10⁵ copies of one letter
ending in the one letter t also needs, and a t that s cannot cover.

The statement promises tests with a unique answer; random ones do not always
have one, so every listing here returns the leftmost of the shortest
windows, and so does the oracle.

A line is "s|t"; each driver prints the window, or nothing for "".

The brute force grows a window from every start: it skips the five cases
with 10⁵ letters, where that is up to 5 × 10⁹ steps.

The oracle binary-searches the answer's length — if a length fits, every
longer one does — checking each length with a fixed-size window slid across
s, so it neither grows from every start nor shrinks a window.
"""
import random
from collections import Counter

DRIVERS = {
    'ruby': "{SOL}\nSTDIN.each_line { |l| s, t = l.chomp.split('|', -1); puts min_window(s, t) }\n",
    'python': "{SOL}\nimport sys\n_out = []\nfor l in sys.stdin.read().split('\\n')[:-1]:\n    s, t = l.split('|')\n    _out.append(Solution().minWindow(s, t))\nprint('\\n'.join(_out))\n",
    'javascript': "{SOL}\nconst L = require('fs').readFileSync(0, 'utf8').split('\\n'); L.pop();\nconsole.log(L.map((l) => { const [s, t] = l.split('|'); return minWindow(s, t); }).join('\\n'));\n",
    'go': "package main\nimport (\"bufio\"; \"fmt\"; \"os\"; \"strings\")\n{SOL}\nfunc main() {\n  sc := bufio.NewScanner(os.Stdin); sc.Buffer(make([]byte, 1<<24), 1<<24)\n  w := bufio.NewWriter(os.Stdout); defer w.Flush()\n  for sc.Scan() { p := strings.SplitN(sc.Text(), \"|\", 2); fmt.Fprintln(w, minWindow(p[0], p[1])) }\n}\n",
    'rust': "struct Solution;\n{SOL}\nuse std::io::{BufRead, Write};\nfn main() {\n  let o = std::io::stdout(); let mut w = std::io::BufWriter::new(o.lock());\n  for l in std::io::stdin().lock().lines() { let l = l.unwrap(); let (s, t) = l.split_once('|').unwrap();\n    writeln!(w, \"{}\", Solution::min_window(s.to_string(), t.to_string())).unwrap(); }\n}\n",
}

SKIP = {'brute': lambda c: len(c) > 50_000}


def oracle(s, t):
    need = Counter(t)

    def first_fit(L):
        have = Counter(s[:L])
        short = sum(max(0, need[c] - have[c]) for c in need)
        if short == 0:
            return 0
        for i in range(L, len(s)):
            a, b = s[i], s[i - L]
            if have[a] < need[a]:
                short -= 1
            have[a] += 1
            have[b] -= 1
            if have[b] < need[b]:
                short += 1
            if short == 0:
                return i - L + 1
        return -1

    if len(t) > len(s) or first_fit(len(s)) < 0:
        return ''
    lo, hi = len(t), len(s)
    while lo < hi:
        mid = (lo + hi) // 2
        if first_fit(mid) >= 0:
            hi = mid
        else:
            lo = mid + 1
    at = first_fit(lo)
    return s[at:at + lo]


def rand(alpha, lo, hi):
    return ''.join(random.choice(alpha) for _ in range(random.randint(lo, hi)))


def corpus():
    random.seed(76)
    cases = [('ADOBECODEBANC', 'ABC'), ('a', 'a'), ('a', 'aa'),
             ('ab', 'abc'), ('abc', 'abc'), ('aA', 'A'), ('baab', 'aa'), ('xxxxyz', 'zy'), ('zyxxxx', 'yz'), ('abc', 'd')]
    for _ in range(15000):
        alpha = random.choice(['ab', 'abc', 'aAb'])
        cases.append((rand(alpha, 1, 12), rand(alpha, 1, 4)))
    for _ in range(5000):
        cases.append((rand('abcdeABCDE', 1, 300), rand('abcdeABCDE', 1, 10)))
    letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    big = rand(letters, 10**5, 10**5)
    cases += [(big, 'Q'), (big, rand(letters, 50, 50)), (big, big[::-1]), ('a' * 99999 + 'b', 'ab'), (big.replace('z', 'y'), 'zz')]
    return [(f'{s}|{t}', oracle(s, t)) for s, t in cases]
