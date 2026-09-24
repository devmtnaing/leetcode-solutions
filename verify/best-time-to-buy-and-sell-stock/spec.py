"""Best Time to Buy and Sell Stock — the corpus the page's badges describe.

The 4 examples and edges, 15,000 short price lists over 0..6, 5,000 of up to
200 prices over the full 0..10⁴ range, and three of 3,000 — against an
all-pairs search. The one-pass versions also run four lists at the n = 10⁵
constraint, checked by a suffix-maximum scan; the brute force is O(n²) and
skips those.
"""
import random

DRIVERS = {
    'ruby': r'''{SOL}
STDIN.each_line { |l| puts max_profit(l.chomp.split(',').map(&:to_i)) }
''',
    'python': r'''{SOL}
import sys
print('\n'.join(str(Solution().maxProfit([int(x) for x in l.split(',')])) for l in sys.stdin.read().split('\n')[:-1]))
''',
    'javascript': r'''{SOL}
const L=require('fs').readFileSync(0,'utf8').split('\n');L.pop();console.log(L.map(l=>String(maxProfit(l.split(',').map(Number)))).join('\n'));
''',
    'go': r'''package main
import ("bufio";"fmt";"os";"strings";"strconv")
{SOL}
func main(){ sc:=bufio.NewScanner(os.Stdin); sc.Buffer(make([]byte,1<<24),1<<24); w:=bufio.NewWriter(os.Stdout); defer w.Flush(); for sc.Scan(){ p:=strings.Split(sc.Text(),","); a:=make([]int,len(p)); for i,x:=range p { a[i],_=strconv.Atoi(x) }; fmt.Fprintln(w, maxProfit(a)) } }
''',
    'rust': r'''struct Solution;
{SOL}
use std::io::{BufRead,Write};
fn main(){ let o=std::io::stdout(); let mut w=std::io::BufWriter::new(o.lock()); for l in std::io::stdin().lock().lines(){ let a:Vec<i32>=l.unwrap().split(',').map(|x| x.parse().unwrap()).collect(); writeln!(w, "{}", Solution::max_profit(a)).unwrap(); } }
''',
}

SKIP = {'brute': lambda case: case.count(',') >= 3000}


def all_pairs(p):
    return max([p[j] - p[i] for i in range(len(p)) for j in range(i + 1, len(p))] + [0])


def suffix_max(p):
    best, top = 0, 0
    for x in reversed(p):
        top = max(top, x)
        best = max(best, top - x)
    return best


def corpus():
    random.seed(121)
    lists = [[7, 1, 5, 3, 6, 4], [7, 6, 4, 3, 1], [1], [5]]
    lists += [[random.randint(0, 6) for _ in range(random.randint(1, 10))] for _ in range(15000)]
    lists += [[random.randint(0, 10**4) for _ in range(random.randint(1, 200))] for _ in range(5000)]
    lists += [[random.randint(0, 10**4) for _ in range(3000)] for _ in range(3)]
    out = [(','.join(map(str, p)), str(all_pairs(p))) for p in lists]
    n = 10**5
    big = [[random.randint(0, 10**4) for _ in range(n)], list(range(n, 0, -1)),
           [i % 10**4 for i in range(n)], [10**4] * (n - 1) + [0]]
    big = [[min(x, 10**4) for x in p] for p in big]
    return out + [(','.join(map(str, p)), str(suffix_max(p))) for p in big]
