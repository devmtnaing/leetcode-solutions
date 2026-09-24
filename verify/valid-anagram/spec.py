"""Valid Anagram — the corpus the page's badges describe.

6 edges, 15,000 pairs of short strings over "abc", 5,000 permutations (half
with one letter changed), and three pairs at the 5 × 10⁴ constraint — against
Python's Counter. A case is "s|t".
"""
import random, string
from collections import Counter

DRIVERS = {
    'ruby': r'''{SOL}
STDIN.each_line { |l| s, t = l.chomp.split('|', -1); puts is_anagram(s, t) }
''',
    'python': r'''{SOL}
import sys
out=[]
for l in sys.stdin.read().split('\n')[:-1]:
    s,t=l.split('|'); out.append('true' if Solution().isAnagram(s,t) else 'false')
print('\n'.join(out))
''',
    'javascript': r'''{SOL}
const L=require('fs').readFileSync(0,'utf8').split('\n');L.pop();console.log(L.map(l=>{const [s,t]=l.split('|');return String(isAnagram(s,t))}).join('\n'));
''',
    'go': r'''package main
import ("bufio";"fmt";"os";"strings")
{SOL}
func main(){ sc:=bufio.NewScanner(os.Stdin); sc.Buffer(make([]byte,1<<24),1<<24); w:=bufio.NewWriter(os.Stdout); defer w.Flush(); for sc.Scan(){ ab:=strings.SplitN(sc.Text(),"|",2); fmt.Fprintln(w, isAnagram(ab[0],ab[1])) } }
''',
    'rust': r'''struct Solution;
{SOL}
use std::io::{BufRead,Write};
fn main(){ let o=std::io::stdout(); let mut w=std::io::BufWriter::new(o.lock()); for l in std::io::stdin().lock().lines(){ let l=l.unwrap(); let mut it=l.splitn(2,'|'); let s=it.next().unwrap().to_string(); let t=it.next().unwrap().to_string(); writeln!(w, "{}", Solution::is_anagram(s,t)).unwrap(); } }
''',
}


def corpus():
    random.seed(242)
    pairs = [('anagram', 'nagaram'), ('rat', 'car'), ('a', 'a'), ('a', 'b'), ('ab', 'a'), ('aa', 'bb')]
    word = lambda n, al: ''.join(random.choice(al) for _ in range(n))
    pairs += [(word(random.randint(1, 6), 'abc'), word(random.randint(1, 6), 'abc')) for _ in range(15000)]
    for k in range(5000):
        s = word(random.randint(1, 30), string.ascii_lowercase)
        t = list(s); random.shuffle(t)
        if k % 2:
            i = random.randrange(len(t)); t[i] = random.choice([c for c in string.ascii_lowercase if c != t[i]])
        pairs.append((s, ''.join(t)))
    n = 5 * 10**4
    s = word(n, string.ascii_lowercase); t = list(s); random.shuffle(t); t = ''.join(t)
    pairs += [(s, t), (s, t[:-1] + ('a' if t[-1] != 'a' else 'b')), (s, s[:-1])]
    return [(f'{s}|{t}', 'true' if Counter(s) == Counter(t) else 'false') for s, t in pairs]
