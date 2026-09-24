"""Valid Parentheses — the corpus the page's badges describe.

The 5 examples, 9 hand-picked edges, 12,000 random bracket strings of length
1–10, 8,000 valid strings (half with one character flipped), and six at the
n = 10⁴ constraint — against a recursive-descent parser, which shares nothing
with the listings' strip-pairs and stack approaches.
"""
import random, sys

DRIVERS = {
    'ruby': r'''{SOL}
STDIN.each_line { |l| puts is_valid(l.chomp) }
''',
    'python': r'''{SOL}
import sys
sol = Solution()
out = [('true' if sol.isValid(l.rstrip('\n')) else 'false') for l in sys.stdin.read().split('\n')[:-1]]
print('\n'.join(out))
''',
    'javascript': r'''{SOL}
const L = require('fs').readFileSync(0,'utf8').split('\n'); L.pop(); console.log(L.map(l => String(isValid(l))).join('\n'));
''',
    'go': r'''package main
import ("bufio";"fmt";"os")
{SOL}
func main(){ sc:=bufio.NewScanner(os.Stdin); sc.Buffer(make([]byte,1<<20),1<<20); w:=bufio.NewWriter(os.Stdout); defer w.Flush(); for sc.Scan(){ fmt.Fprintln(w, isValid(sc.Text())) } }
''',
    'rust': r'''struct Solution;
{SOL}
use std::io::{BufRead,Write};
fn main(){ let o=std::io::stdout(); let mut w=std::io::BufWriter::new(o.lock()); for l in std::io::stdin().lock().lines(){ writeln!(w, "{}", Solution::is_valid(l.unwrap())).unwrap(); } }
''',
}

OPEN = {'(': ')', '[': ']', '{': '}'}


def parses(s):
    """Grammar: S -> (open S close)*. True if s is exactly one S."""
    sys.setrecursionlimit(max(10000, len(s) * 3))
    def seq(i):
        while i < len(s) and s[i] in OPEN:
            j = seq(i + 1)
            if j is None or j >= len(s) or s[j] != OPEN[s[i]]:
                return None
            i = j + 1
        return i
    return seq(0) == len(s)


def valid(n):
    """A random balanced string of length n (n even)."""
    if n == 0: return ''
    k = random.randrange(0, n - 1, 2)
    o = random.choice('([{')
    return o + valid(k) + OPEN[o] + valid(n - 2 - k)


def corpus():
    random.seed(20)
    strings = ['()', '()[]{}', '(]', '([])', '([)]']
    strings += [')', '(', '((', '))', '][', '{[]}', ']', '[', '(((())))']
    strings += [''.join(random.choice('()[]{}') for _ in range(random.randint(1, 10))) for _ in range(12000)]
    for k in range(8000):
        s = list(valid(random.randrange(2, 21, 2)))
        if k % 2:
            i = random.randrange(len(s)); s[i] = random.choice([c for c in '()[]{}' if c != s[i]])
        strings.append(''.join(s))
    n = 10**4
    deep = '(' * (n // 2) + ')' * (n // 2)
    strings += [deep, '([{' * (n // 6) + '}])' * (n // 6), deep[:-1] + ']', '(' * n, ')' * n,
                ''.join(random.choice('()[]{}') for _ in range(n))]
    return [(s, 'true' if parses(s) else 'false') for s in strings]
