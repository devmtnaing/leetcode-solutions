"""Two Sum — the corpus the page's badges describe.

The 3 examples, 15,000 small arrays with exactly one answer, 5,000 over
±10⁹, and one at n = 10⁴. Every case is built so exactly one pair works (the
problem promises it), and the oracle finds that pair without either listing's
logic: all pairs for small arrays, a sorted two-pointer scan for big ones.
Answers are printed as the two indices, ascending.
"""
import random

DRIVERS = {
    'ruby': r'''{SOL}
STDIN.each_line { |l| a, t = l.chomp.split('|'); puts two_sum(a.split(',').map(&:to_i), t.to_i).sort.join(',') }
''',
    'python': r'''{SOL}
import sys
out=[]
for l in sys.stdin.read().split('\n')[:-1]:
    a,t=l.split('|'); out.append(','.join(map(str,sorted(Solution().twoSum([int(x) for x in a.split(',')], int(t))))))
print('\n'.join(out))
''',
    'javascript': r'''{SOL}
const L=require('fs').readFileSync(0,'utf8').split('\n');L.pop();console.log(L.map(l=>{const [a,t]=l.split('|');return twoSum(a.split(',').map(Number),Number(t)).sort((x,y)=>x-y).join(',')}).join('\n'));
''',
    'go': r'''package main
import ("bufio";"fmt";"os";"sort";"strings";"strconv")
{SOL}
func main(){ sc:=bufio.NewScanner(os.Stdin); sc.Buffer(make([]byte,1<<24),1<<24); w:=bufio.NewWriter(os.Stdout); defer w.Flush(); for sc.Scan(){ ab:=strings.Split(sc.Text(),"|"); p:=strings.Split(ab[0],","); a:=make([]int,len(p)); for i,x:=range p { a[i],_=strconv.Atoi(x) }; t,_:=strconv.Atoi(ab[1]); r:=twoSum(a,t); sort.Ints(r); s:=[]string{}; for _,v:=range r { s=append(s,strconv.Itoa(v)) }; fmt.Fprintln(w, strings.Join(s,",")) } }
''',
    'rust': r'''struct Solution;
{SOL}
use std::io::{BufRead,Write};
fn main(){ let o=std::io::stdout(); let mut w=std::io::BufWriter::new(o.lock()); for l in std::io::stdin().lock().lines(){ let l=l.unwrap(); let mut it=l.split('|'); let a:Vec<i32>=it.next().unwrap().split(',').map(|x| x.parse().unwrap()).collect(); let t:i32=it.next().unwrap().parse().unwrap(); let mut r=Solution::two_sum(a,t); r.sort(); writeln!(w, "{}", r.iter().map(|x| x.to_string()).collect::<Vec<_>>().join(",")).unwrap(); } }
''',
}


def pairs(a, target):
    """Every (i, j), i < j, with a[i] + a[j] == target."""
    if len(a) <= 60:
        return [(i, j) for i in range(len(a)) for j in range(i + 1, len(a)) if a[i] + a[j] == target]
    order = sorted(range(len(a)), key=lambda i: a[i])
    lo, hi, found = 0, len(a) - 1, []
    while lo < hi:
        s = a[order[lo]] + a[order[hi]]
        if s < target: lo += 1
        elif s > target: hi -= 1
        else:
            found.append(tuple(sorted((order[lo], order[hi]))))
            lo += 1                     # enough to tell one pair from several
            if len(found) > 1: break
    return found


def one_answer(n, lo, hi):
    while True:
        a = [random.randint(lo, hi) for _ in range(n)]
        i, j = random.sample(range(n), 2)
        target = a[i] + a[j]
        if -10**9 <= target <= 10**9 and len(pairs(a, target)) == 1:
            return a, target


def corpus():
    random.seed(1)
    cases = [([2, 7, 11, 15], 9), ([3, 2, 4], 6), ([3, 3], 6)]
    cases += [one_answer(random.randint(2, 12), -6, 6) for _ in range(15000)]
    cases += [one_answer(random.randint(2, 60), -10**9, 10**9) for _ in range(5000)]
    cases += [one_answer(10**4, -10**9, 10**9)]
    out = []
    for a, target in cases:
        (i, j), = pairs(a, target)
        out.append((','.join(map(str, a)) + f'|{target}', f'{i},{j}'))
    return out
