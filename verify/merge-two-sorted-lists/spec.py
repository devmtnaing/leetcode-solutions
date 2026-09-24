"""Merge Two Sorted Lists — the corpus the page's badges describe.

The 3 examples, 3 edges, 15,000 pairs of lists up to 6 long over -3..3 (so
ties are everywhere), 5,000 pairs up to the 50-node constraint over
-100..100, and two disjoint 50-node pairs — against concatenate-and-sort.
A case is "list1|list2".
"""
import random

DRIVERS = {
    'ruby': r'''class ListNode
  attr_accessor :val, :next
  def initialize(val = 0, _next = nil); @val = val; @next = _next; end
end
{SOL}
def build(s); h = nil; s.split(',').map(&:to_i).reverse_each { |v| h = ListNode.new(v, h) }; h; end
STDIN.each_line do |l|
  a, b = l.chomp.split('|', -1)
  r = merge_two_lists(build(a), build(b)); out = []; while r; out << r.val; r = r.next; end
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
    a, b = l.split('|')
    r = Solution().mergeTwoLists(build(a), build(b)); o = []
    while r: o.append(r.val); r = r.next
    out.append(','.join(map(str, o)))
print('\n'.join(out))
''',
    'javascript': r'''function ListNode(val, next) { this.val = val === undefined ? 0 : val; this.next = next === undefined ? null : next; }
{SOL}
const build = (s) => { let h = null; for (const v of s.split(',').filter(Boolean).map(Number).reverse()) h = new ListNode(v, h); return h; };
const L = require('fs').readFileSync(0,'utf8').split('\n'); L.pop();
console.log(L.map(l => { const [a, b] = l.split('|'); let r = mergeTwoLists(build(a), build(b)); const o = []; while (r) { o.push(r.val); r = r.next; } return o.join(','); }).join('\n'));
''',
    'go': r'''package main
import ("bufio";"fmt";"os";"strings";"strconv")
type ListNode struct { Val int; Next *ListNode }
{SOL}
func build(s string) *ListNode { var h *ListNode; p:=strings.Split(s,","); for i:=len(p)-1;i>=0;i-- { if p[i]=="" {continue}; v,_:=strconv.Atoi(p[i]); h=&ListNode{v,h} }; return h }
func main(){ sc:=bufio.NewScanner(os.Stdin); sc.Buffer(make([]byte,1<<22),1<<22); w:=bufio.NewWriter(os.Stdout); defer w.Flush()
 for sc.Scan(){ ab:=strings.SplitN(sc.Text(),"|",2); r:=mergeTwoLists(build(ab[0]),build(ab[1])); s:=[]string{}; for r!=nil { s=append(s,strconv.Itoa(r.Val)); r=r.Next }; fmt.Fprintln(w, strings.Join(s,",")) } }
''',
    'rust': r'''#[derive(PartialEq, Eq, Clone, Debug)]
pub struct ListNode { pub val: i32, pub next: Option<Box<ListNode>> }
impl ListNode { #[inline] fn new(val: i32) -> Self { ListNode { next: None, val } } }
struct Solution;
{SOL}
use std::io::{BufRead,Write};
fn build(s: &str) -> Option<Box<ListNode>> { let mut h = None; for x in s.split(',').filter(|x| !x.is_empty()).collect::<Vec<_>>().into_iter().rev() { h = Some(Box::new(ListNode{ val: x.parse().unwrap(), next: h })); } h }
fn main(){ let o=std::io::stdout(); let mut w=std::io::BufWriter::new(o.lock());
 for l in std::io::stdin().lock().lines(){ let l=l.unwrap(); let mut it=l.splitn(2,'|'); let a=it.next().unwrap(); let b=it.next().unwrap();
  let mut r = Solution::merge_two_lists(build(a), build(b)); let mut v: Vec<String> = vec![];
  while let Some(n) = r { v.push(n.val.to_string()); r = n.next; }
  writeln!(w, "{}", v.join(",")).unwrap(); } }
''',
}


def corpus():
    random.seed(21)
    sl = lambda n, lo, hi: sorted(random.randint(lo, hi) for _ in range(n))
    pairs = [([1, 2, 4], [1, 3, 4]), ([], []), ([], [0])]
    pairs += [([5], []), ([-100], [100]), ([2, 2, 2], [2, 2])]
    pairs += [(sl(random.randint(0, 6), -3, 3), sl(random.randint(0, 6), -3, 3)) for _ in range(15000)]
    pairs += [(sl(random.randint(0, 50), -100, 100), sl(random.randint(0, 50), -100, 100)) for _ in range(5000)]
    pairs += [(sl(50, -100, -1), sl(50, 0, 100)), (sl(50, 1, 100), sl(50, -100, 0))]
    j = lambda a: ','.join(map(str, a))
    return [(f'{j(a)}|{j(b)}', j(sorted(a + b))) for a, b in pairs]
