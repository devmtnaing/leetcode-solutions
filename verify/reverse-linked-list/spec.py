"""Reverse Linked List — the corpus the page's badges describe.

The 3 examples, 2 edges, 15,000 lists of up to 8 nodes over -3..3, 4,990 of
up to 60 over the full ±5,000 range, and three long ones (5,000, 5,000 and
999 nodes) — against Python's list reversal. The 5,000-node lists are what
forced the recursion limit into the recursive Python listing.
"""
import random

DRIVERS = {
    'ruby': r'''class ListNode
  attr_accessor :val, :next
  def initialize(val = 0, _next = nil); @val = val; @next = _next; end
end
{SOL}
STDIN.each_line do |l|
  h = nil; l.chomp.split(',').map(&:to_i).reverse_each { |v| h = ListNode.new(v, h) }
  r = reverse_list(h); out = []; while r; out << r.val; r = r.next; end
  puts out.join(',')
end
''',
    'python': r'''class ListNode:
    def __init__(self, val=0, next=None): self.val = val; self.next = next
{SOL}
import sys
out = []
for l in sys.stdin.read().split('\n')[:-1]:
    h = None
    for v in reversed([int(x) for x in l.split(',') if x]): h = ListNode(v, h)
    r = Solution().reverseList(h); a = []
    while r: a.append(r.val); r = r.next
    out.append(','.join(map(str, a)))
print('\n'.join(out))
''',
    'javascript': r'''function ListNode(val, next) { this.val = val === undefined ? 0 : val; this.next = next === undefined ? null : next; }
{SOL}
const L = require('fs').readFileSync(0,'utf8').split('\n'); L.pop();
console.log(L.map(l => { let h = null; for (const v of l.split(',').filter(Boolean).map(Number).reverse()) h = new ListNode(v, h);
  let r = reverseList(h); const a = []; while (r) { a.push(r.val); r = r.next; } return a.join(','); }).join('\n'));
''',
    'go': r'''package main
import ("bufio";"fmt";"os";"strings";"strconv")
type ListNode struct { Val int; Next *ListNode }
{SOL}
func main(){ sc:=bufio.NewScanner(os.Stdin); sc.Buffer(make([]byte,1<<22),1<<22); w:=bufio.NewWriter(os.Stdout); defer w.Flush()
 for sc.Scan(){ var h *ListNode; p:=strings.Split(sc.Text(),","); for i:=len(p)-1;i>=0;i-- { if p[i]=="" {continue}; v,_:=strconv.Atoi(p[i]); h=&ListNode{v,h} }
  r:=reverseList(h); s:=[]string{}; for r!=nil { s=append(s,strconv.Itoa(r.Val)); r=r.Next }; fmt.Fprintln(w, strings.Join(s,",")) } }
''',
    'rust': r'''#[derive(PartialEq, Eq, Clone, Debug)]
pub struct ListNode { pub val: i32, pub next: Option<Box<ListNode>> }
struct Solution;
{SOL}
use std::io::{BufRead,Write};
fn main(){ let o=std::io::stdout(); let mut w=std::io::BufWriter::new(o.lock());
 for l in std::io::stdin().lock().lines(){ let l=l.unwrap(); let mut h: Option<Box<ListNode>> = None;
  for x in l.split(',').filter(|x| !x.is_empty()).collect::<Vec<_>>().into_iter().rev() { h = Some(Box::new(ListNode{ val: x.parse().unwrap(), next: h })); }
  let mut r = Solution::reverse_list(h); let mut a: Vec<String> = vec![];
  while let Some(n) = r { a.push(n.val.to_string()); r = n.next; }
  writeln!(w, "{}", a.join(",")).unwrap(); } }
''',
}


def corpus():
    random.seed(206)
    lists = [[1, 2, 3, 4, 5], [1, 2], []]
    lists += [[7], [-5000, 5000]]
    lists += [[random.randint(-3, 3) for _ in range(random.randint(0, 8))] for _ in range(15000)]
    lists += [[random.randint(-5000, 5000) for _ in range(random.randint(0, 60))] for _ in range(4990)]
    lists += [[random.randint(-5000, 5000) for _ in range(5000)], list(range(5000)),
              [random.randint(-5000, 5000) for _ in range(999)]]
    return [(','.join(map(str, a)), ','.join(map(str, a[::-1]))) for a in lists]
