"""Linked List Cycle — the corpus the page's badges describe.

The 3 examples, 4 edges (an empty list, repeated values, a self-loop), 15,000
lists of up to 8 nodes with every pos, 4,990 of up to 200 nodes over the full
±10⁵ range, and four at the 10⁴-node constraint. A case is "values|pos",
pos -1 for no cycle; the drivers link the tail back to node pos, so the
expected answer is simply whether pos >= 0.
"""
import random

DRIVERS = {
    'ruby': r'''class ListNode
  attr_accessor :val, :next
  def initialize(val); @val = val; @next = nil; end
end
{SOL}
STDIN.each_line do |l|
  vs, pos = l.chomp.split('|', -1); pos = pos.to_i
  nodes = vs.split(',').map { |v| ListNode.new(v.to_i) }
  nodes.each_cons(2) { |a, b| a.next = b }
  nodes[-1].next = nodes[pos] if pos >= 0 && !nodes.empty?
  puts hasCycle(nodes[0])
end
''',
    'python': r'''class ListNode:
    def __init__(self, x): self.val = x; self.next = None
{SOL}
import sys
out = []
for l in sys.stdin.read().split('\n')[:-1]:
    vs, pos = l.split('|'); pos = int(pos)
    nodes = [ListNode(int(v)) for v in vs.split(',') if v]
    for a, b in zip(nodes, nodes[1:]): a.next = b
    if pos >= 0 and nodes: nodes[-1].next = nodes[pos]
    out.append('true' if Solution().hasCycle(nodes[0] if nodes else None) else 'false')
print('\n'.join(out))
''',
    'javascript': r'''function ListNode(val) { this.val = val; this.next = null; }
{SOL}
const L = require('fs').readFileSync(0,'utf8').split('\n'); L.pop();
console.log(L.map(l => { const [vs, p] = l.split('|'); const pos = Number(p);
  const nodes = vs.split(',').filter(Boolean).map(v => new ListNode(Number(v)));
  for (let i = 0; i + 1 < nodes.length; i++) nodes[i].next = nodes[i + 1];
  if (pos >= 0 && nodes.length) nodes[nodes.length - 1].next = nodes[pos];
  return String(hasCycle(nodes.length ? nodes[0] : null)); }).join('\n'));
''',
    'go': r'''package main
import ("bufio";"fmt";"os";"strings";"strconv")
type ListNode struct { Val int; Next *ListNode }
{SOL}
func main(){ sc:=bufio.NewScanner(os.Stdin); sc.Buffer(make([]byte,1<<22),1<<22); w:=bufio.NewWriter(os.Stdout); defer w.Flush()
 for sc.Scan(){ ab:=strings.SplitN(sc.Text(),"|",2); pos,_:=strconv.Atoi(ab[1]); nodes:=[]*ListNode{}
  for _,x:=range strings.Split(ab[0],",") { if x=="" {continue}; v,_:=strconv.Atoi(x); nodes=append(nodes,&ListNode{Val:v}) }
  for i:=0;i+1<len(nodes);i++ { nodes[i].Next=nodes[i+1] }
  var head *ListNode; if len(nodes)>0 { head=nodes[0]; if pos>=0 { nodes[len(nodes)-1].Next=nodes[pos] } }
  fmt.Fprintln(w, hasCycle(head)) } }
''',
    'rust': r'''{SOL}
#[derive(Debug)]
pub struct ListNode { pub val: i32, pub next: Option<Rc<RefCell<ListNode>>> }
struct Solution;
use std::io::{BufRead,Write};
fn main(){ let o=std::io::stdout(); let mut w=std::io::BufWriter::new(o.lock());
 for l in std::io::stdin().lock().lines(){ let l=l.unwrap(); let mut it=l.splitn(2,'|'); let vs=it.next().unwrap(); let pos:i64=it.next().unwrap().parse().unwrap();
  let nodes: Vec<Rc<RefCell<ListNode>>> = vs.split(',').filter(|x| !x.is_empty()).map(|x| Rc::new(RefCell::new(ListNode{ val: x.parse().unwrap(), next: None }))).collect();
  for i in 0..nodes.len().saturating_sub(1) { nodes[i].borrow_mut().next = Some(nodes[i+1].clone()); }
  if pos >= 0 && !nodes.is_empty() { nodes[nodes.len()-1].borrow_mut().next = Some(nodes[pos as usize].clone()); }
  let head = nodes.first().cloned();
  writeln!(w, "{}", Solution::has_cycle(head)).unwrap(); } }
''',
}


def corpus():
    random.seed(141)
    cases = [([3, 2, 0, -4], 1), ([1, 2], 0), ([1], -1)]
    cases += [([], -1), ([5, 5, 5], 1), ([1], 0), ([1, 1], -1)]
    for _ in range(15000):
        n = random.randint(1, 8)
        cases.append(([random.randint(-3, 3) for _ in range(n)], random.randint(-1, n - 1)))
    for _ in range(4990):
        n = random.randint(1, 200)
        cases.append(([random.randint(-10**5, 10**5) for _ in range(n)], random.choice([-1, random.randrange(n)])))
    n = 10**4
    vals = [random.randint(-10**5, 10**5) for _ in range(n)]
    cases += [(vals, -1), (vals, 0), (vals, n - 1), (vals, n // 2)]
    return [(','.join(map(str, v)) + f'|{p}', 'true' if p >= 0 else 'false') for v, p in cases]
