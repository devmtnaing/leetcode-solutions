"""Move Zeroes — the corpus the page's badges describe.

5 edges, 15,000 short arrays heavy in zeros, 5,000 of up to 80 values over
the full 32-bit range, and two at the n = 10⁴ constraint — against
filter-and-append. The listings change the array in place; the drivers print
it afterwards.
"""
import random

DRIVERS = {
    'ruby': r'''{SOL}
STDIN.each_line { |l| a = l.chomp.split(',').map(&:to_i); move_zeroes(a); puts a.join(',') }
''',
    'python': r'''from typing import List
{SOL}
import sys
out=[]
for l in sys.stdin.read().split('\n')[:-1]:
    a=[int(x) for x in l.split(',')]; Solution().moveZeroes(a); out.append(','.join(map(str,a)))
print('\n'.join(out))
''',
    'javascript': r'''{SOL}
const L=require('fs').readFileSync(0,'utf8').split('\n');L.pop();console.log(L.map(l=>{const a=l.split(',').map(Number);moveZeroes(a);return a.join(',')}).join('\n'));
''',
    'go': r'''package main
import ("bufio";"fmt";"os";"strings";"strconv")
{SOL}
func main(){ sc:=bufio.NewScanner(os.Stdin); sc.Buffer(make([]byte,1<<24),1<<24); w:=bufio.NewWriter(os.Stdout); defer w.Flush(); for sc.Scan(){ p:=strings.Split(sc.Text(),","); a:=make([]int,len(p)); for i,x:=range p { a[i],_=strconv.Atoi(x) }; moveZeroes(a); s:=make([]string,len(a)); for i,v:=range a { s[i]=strconv.Itoa(v) }; fmt.Fprintln(w, strings.Join(s,",")) } }
''',
    'rust': r'''struct Solution;
{SOL}
use std::io::{BufRead,Write};
fn main(){ let o=std::io::stdout(); let mut w=std::io::BufWriter::new(o.lock()); for l in std::io::stdin().lock().lines(){ let mut a:Vec<i32>=l.unwrap().split(',').map(|x| x.parse().unwrap()).collect(); Solution::move_zeroes(&mut a); writeln!(w, "{}", a.iter().map(|x| x.to_string()).collect::<Vec<_>>().join(",")).unwrap(); } }
''',
}


def moved(a):
    return [x for x in a if x != 0] + [0] * a.count(0)


def corpus():
    random.seed(283)
    arrays = [[0, 1, 0, 3, 12], [0], [1], [0, 0, 0], [1, 2, 3]]
    arrays += [[random.choice([0, 0, 0, 1, 2, -3]) for _ in range(random.randint(1, 10))] for _ in range(15000)]
    arrays += [[random.choice([0, random.randint(-2**31, 2**31 - 1)]) for _ in range(random.randint(1, 80))]
               for _ in range(5000)]
    n = 10**4
    arrays += [[random.choice([0, random.randint(-2**31, 2**31 - 1)]) for _ in range(n)], [0] * (n - 1) + [7]]
    return [(','.join(map(str, a)), ','.join(map(str, moved(a)))) for a in arrays]
