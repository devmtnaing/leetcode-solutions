"""Reverse Nodes in k-Group — the corpus the page's badges describe.

The 2 examples, 6 edges (k = 1, k = n, one node, n one short of a multiple
of k, n one past a multiple, every value equal), 15,000 random lists of 1
to 12 nodes with every k from 1 to n equally likely, 5,000 of up to 300
nodes, and five at the limit of 5,000 nodes: k = 1 (5,000 groups — 5,000
calls deep for the recursive version), k = 2, k = 70, k = 4,999 and
k = 5,000.

A line is "k|values"; each driver builds a real linked list, calls the
listing and prints the values it gets back.

The oracle reverses whole chunks of k in a Python list and leaves a short
tail as it is.
"""
import random

_BUILD = {
    'ruby': r'''class ListNode
  attr_accessor :val, :next
  def initialize(val = 0, _next = nil); @val = val; @next = _next; end
end
{SOL}
def build(s); h = nil; s.split(',').map(&:to_i).reverse_each { |v| h = ListNode.new(v, h) }; h; end
STDIN.each_line do |l|
  k, vals = l.chomp.split('|', -1)
  r = reverse_k_group(build(vals), k.to_i); out = []; while r; out << r.val; r = r.next; end
  puts out.join(',')
end
''',
    'python': r'''class ListNode:
    def __init__(self, val=0, next=None): self.val = val; self.next = next
{SOL}
import sys
def build(s):
    h = None
    for v in reversed([int(x) for x in s.split(',') if x]): h = ListNode(v, h)
    return h
out = []
for l in sys.stdin.read().split('\n')[:-1]:
    k, vals = l.split('|')
    r = Solution().reverseKGroup(build(vals), int(k)); o = []
    while r: o.append(r.val); r = r.next
    out.append(','.join(map(str, o)))
print('\n'.join(out))
''',
    'javascript': r'''function ListNode(val, next) { this.val = val === undefined ? 0 : val; this.next = next === undefined ? null : next; }
{SOL}
const build = (s) => { let h = null; for (const v of s.split(',').filter(Boolean).map(Number).reverse()) h = new ListNode(v, h); return h; };
const L = require('fs').readFileSync(0,'utf8').split('\n'); L.pop();
console.log(L.map(l => { const [k, vals] = l.split('|');
  let r = reverseKGroup(build(vals), Number(k)); const o = []; while (r) { o.push(r.val); r = r.next; } return o.join(','); }).join('\n'));
''',
    'go': r'''package main
import ("bufio";"fmt";"os";"strings";"strconv")
type ListNode struct { Val int; Next *ListNode }
{SOL}
func build(s string) *ListNode { var h *ListNode; p:=strings.Split(s,","); for i:=len(p)-1;i>=0;i-- { if p[i]=="" {continue}; v,_:=strconv.Atoi(p[i]); h=&ListNode{v,h} }; return h }
func main(){ sc:=bufio.NewScanner(os.Stdin); sc.Buffer(make([]byte,1<<24),1<<24); w:=bufio.NewWriter(os.Stdout); defer w.Flush()
 for sc.Scan(){ kr:=strings.SplitN(sc.Text(),"|",2); k,_:=strconv.Atoi(kr[0])
  r:=reverseKGroup(build(kr[1]), k); s:=[]string{}; for r!=nil { s=append(s,strconv.Itoa(r.Val)); r=r.Next }; fmt.Fprintln(w, strings.Join(s,",")) } }
''',
    'rust': r'''#[derive(PartialEq, Eq, Clone, Debug)]
pub struct ListNode { pub val: i32, pub next: Option<Box<ListNode>> }
impl ListNode { #[inline] fn new(val: i32) -> Self { ListNode { next: None, val } } }
struct Solution;
{SOL}
use std::io::{BufRead,Write};
fn build(s: &str) -> Option<Box<ListNode>> { let mut h = None; for x in s.split(',').filter(|x| !x.is_empty()).collect::<Vec<_>>().into_iter().rev() { h = Some(Box::new(ListNode{ val: x.parse().unwrap(), next: h })); } h }
fn main(){ let o=std::io::stdout(); let mut w=std::io::BufWriter::new(o.lock());
 for l in std::io::stdin().lock().lines(){ let l=l.unwrap(); let (k, vals) = l.split_once('|').unwrap();
  let mut r = Solution::reverse_k_group(build(vals), k.parse().unwrap()); let mut s = vec![]; while let Some(n) = r { s.push(n.val.to_string()); r = n.next; }
  writeln!(w, "{}", s.join(",")).unwrap(); } }
''',
}
DRIVERS = _BUILD


def oracle(vals, k):
    out = []
    for i in range(0, len(vals), k):
        chunk = vals[i:i + k]
        out += chunk[::-1] if len(chunk) == k else chunk
    return out


def corpus():
    random.seed(25)
    cases = [([1, 2, 3, 4, 5], 2), ([1, 2, 3, 4, 5], 3),
             ([4, 7, 1], 1), ([4, 7, 1], 3), ([9], 1), (list(range(8)), 3), (list(range(10)), 3), ([5] * 6, 4)]
    for _ in range(15000):
        n = random.randint(1, 12)
        cases.append(([random.randint(0, 9) for _ in range(n)], random.randint(1, n)))
    for _ in range(5000):
        n = random.randint(1, 300)
        cases.append(([random.randint(0, 1000) for _ in range(n)], random.randint(1, n)))
    big = [random.randint(0, 1000) for _ in range(5000)]
    cases += [(big, 1), (big, 2), (big, 70), (big, 4999), (big, 5000)]
    return [(f"{k}|{','.join(map(str, v))}", ','.join(map(str, oracle(v, k)))) for v, k in cases]
