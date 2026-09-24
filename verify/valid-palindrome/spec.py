"""Valid Palindrome — the corpus the page's badges describe.

The 3 examples, 10 hand-picked edges, 12,000 short strings over "aAbB01 .,:!_`",
6,000 noisy palindromes (half perturbed), 2,000 random printable-ASCII
strings, and three at the 2 × 10⁵ constraint — against a reference that peels
alphanumerics off both ends of a deque, not the listings' clean-and-reverse or
two-pointer code.
"""
import random, string
from collections import deque

DRIVERS = {
    'ruby': r'''{SOL}
STDIN.each_line { |l| puts is_palindrome(l.chomp("\n")) }
''',
    'python': r'''{SOL}
import sys
sol = Solution()
out = [('true' if sol.isPalindrome(l) else 'false') for l in sys.stdin.read().split('\n')[:-1]]
print('\n'.join(out))
''',
    'javascript': r'''{SOL}
const L = require('fs').readFileSync(0,'utf8').split('\n'); L.pop(); console.log(L.map(l => String(isPalindrome(l))).join('\n'));
''',
    'go': r'''package main
import ("bufio";"fmt";"os")
{SOL}
func main(){ sc:=bufio.NewScanner(os.Stdin); sc.Buffer(make([]byte,1<<20),1<<20); w:=bufio.NewWriter(os.Stdout); defer w.Flush(); for sc.Scan(){ fmt.Fprintln(w, isPalindrome(sc.Text())) } }
''',
    'rust': r'''struct Solution;
{SOL}
use std::io::{BufRead,Write};
fn main(){ let o=std::io::stdout(); let mut w=std::io::BufWriter::new(o.lock()); for l in std::io::stdin().lock().lines(){ writeln!(w, "{}", Solution::is_palindrome(l.unwrap())).unwrap(); } }
''',
}

ALNUM = set(string.ascii_letters + string.digits)
PRINTABLE = [chr(c) for c in range(32, 127)]


def reference(s):
    d = deque(c.lower() for c in s if c in ALNUM)
    while len(d) > 1:
        if d.popleft() != d.pop():
            return False
    return True


def noisy_palindrome(perturb):
    core = [random.choice('abc01') for _ in range(random.randint(0, 8))]
    core = core + core[::-1][random.randint(0, 1):]
    s = ''.join(c + random.choice(['', ' ', ',', '.', ':']) for c in core)
    s = ''.join(c.upper() if random.random() < 0.3 else c for c in s)
    if perturb and core:
        i = random.randrange(len(s)); s = s[:i] + random.choice('xyz9') + s[i + 1:]
    return s or ' '


def corpus():
    random.seed(125)
    strings = ['A man, a plan, a canal: Panama', 'race a car', ' ']
    strings += ['0P', 'a', '.,', 'ab_a', 'Aa', '0a0', 'a.b,.b a', '`l;`` 1o1 ??;l`', '9,8', 'Zz']
    strings += [''.join(random.choice('aAbB01 .,:!_`') for _ in range(random.randint(1, 12))) for _ in range(12000)]
    strings += [noisy_palindrome(k % 2 == 1) for k in range(6000)]
    strings += [''.join(random.choice(PRINTABLE) for _ in range(random.randint(1, 40))) for _ in range(2000)]
    n = 2 * 10**5
    half = ''.join(random.choice(string.ascii_letters + ' ,.') for _ in range(n // 2))
    strings += [half + half[::-1], half + 'x' + half[::-1][1:], ''.join(random.choice(PRINTABLE) for _ in range(n))]
    return [(s, 'true' if reference(s) else 'false') for s in strings]
