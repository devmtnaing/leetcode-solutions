"""Single Number — the corpus the page's badges describe.

The 3 examples, 4 edges, 15,000 arrays of up to 13 values drawn from -4..4,
5,000 of up to 41 values over the full ±3 × 10⁴ range, and three at
n = 29,999 — against Python's Counter. Every array has exactly one value that
appears once and every other value exactly twice.
"""
import random
from collections import Counter

DRIVERS = {
    'ruby': r'''{SOL}
STDIN.each_line { |l| puts single_number(l.split(',').map(&:to_i)) }
''',
    'python': r'''{SOL}
import sys
sol = Solution()
print('\n'.join(str(sol.singleNumber([int(x) for x in l.split(',')])) for l in sys.stdin.read().split('\n')[:-1]))
''',
    'javascript': r'''{SOL}
const L = require('fs').readFileSync(0,'utf8').split('\n'); L.pop(); console.log(L.map(l => String(singleNumber(l.split(',').map(Number)))).join('\n'));
''',
    'go': r'''package main
import ("bufio";"fmt";"os";"strings";"strconv")
{SOL}
func main(){ sc:=bufio.NewScanner(os.Stdin); sc.Buffer(make([]byte,1<<22),1<<22); w:=bufio.NewWriter(os.Stdout); defer w.Flush(); for sc.Scan(){ p:=strings.Split(sc.Text(),","); a:=make([]int,len(p)); for i,x:=range p { a[i],_=strconv.Atoi(x) }; fmt.Fprintln(w, singleNumber(a)) } }
''',
    'rust': r'''struct Solution;
{SOL}
use std::io::{BufRead,Write};
fn main(){ let o=std::io::stdout(); let mut w=std::io::BufWriter::new(o.lock()); for l in std::io::stdin().lock().lines(){ let a:Vec<i32>=l.unwrap().split(',').map(|x| x.parse().unwrap()).collect(); writeln!(w, "{}", Solution::single_number(a)).unwrap(); } }
''',
}


def make(n, lo, hi):
    """n odd: (n - 1) / 2 distinct pairs and one distinct single."""
    values = random.sample(range(lo, hi + 1), (n + 1) // 2)
    a = values[:1] + values[1:] * 2
    random.shuffle(a)
    return a


def corpus():
    random.seed(136)
    arrays = [[2, 2, 1], [4, 1, 2, 1, 2], [1]]
    arrays += [[-1], [0, 5, 5], [-30000, 30000, 30000], [7, 7, 0]]
    arrays += [make(random.randrange(1, 14, 2), -4, 4) for _ in range(15000)]
    arrays += [make(random.randrange(1, 42, 2), -3 * 10**4, 3 * 10**4) for _ in range(5000)]
    arrays += [make(29999, -3 * 10**4, 3 * 10**4) for _ in range(3)]
    return [(','.join(map(str, a)), str(next(v for v, c in Counter(a).items() if c == 1))) for a in arrays]
