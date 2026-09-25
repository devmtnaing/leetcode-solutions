"""Merge k Sorted Lists — the corpus the page's badges describe.

The 3 examples, 6 edges (one list, empty lists among full ones, every value
equal, one long list among empty ones, two lists whose ranges do not overlap,
k odd so one list sits a round out), 15,000 random inputs of 0 to 6 lists up
to 4 long over -3..3 — ties everywhere — 5,000 of up to 60 lists up to 20
long, and five at the limits, 10⁴ nodes each: 10⁴ one-node lists, 20 lists
of 500, 10⁴ lists of which all but 100 are empty, two lists of 5,000, and
10⁴ one-node lists in falling order.

A line is "k|list;list;…" with each list's values comma-separated (an empty
list is empty text); each driver builds real linked lists and prints the
merged values.

Merging one list at a time costs the length of everything merged so far per
list — up to k · N / 2 moves — so it skips the three inputs with 10⁴ lists,
where that is 5 × 10⁷ (computed).

The oracle concatenates every list's values and sorts them.
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
  k, rest = l.chomp.split('|', -1)
  lists = k.to_i.zero? ? [] : rest.split(';', -1).map { |x| build(x) }
  r = merge_k_lists(lists); out = []; while r; out << r.val; r = r.next; end
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
    k, rest = l.split('|')
    lists = [] if k == '0' else [build(x) for x in rest.split(';')]
    r = Solution().mergeKLists(lists); o = []
    while r: o.append(r.val); r = r.next
    out.append(','.join(map(str, o)))
print('\n'.join(out))
''',
    'javascript': r'''function ListNode(val, next) { this.val = val === undefined ? 0 : val; this.next = next === undefined ? null : next; }
{SOL}
const build = (s) => { let h = null; for (const v of s.split(',').filter(Boolean).map(Number).reverse()) h = new ListNode(v, h); return h; };
const L = require('fs').readFileSync(0,'utf8').split('\n'); L.pop();
console.log(L.map(l => { const [k, rest] = l.split('|'); const lists = k === '0' ? [] : rest.split(';').map(build);
  let r = mergeKLists(lists); const o = []; while (r) { o.push(r.val); r = r.next; } return o.join(','); }).join('\n'));
''',
    'go': r'''package main
import ("bufio";"fmt";"os";"strings";"strconv")
type ListNode struct { Val int; Next *ListNode }
{SOL}
func build(s string) *ListNode { var h *ListNode; p:=strings.Split(s,","); for i:=len(p)-1;i>=0;i-- { if p[i]=="" {continue}; v,_:=strconv.Atoi(p[i]); h=&ListNode{v,h} }; return h }
func main(){ sc:=bufio.NewScanner(os.Stdin); sc.Buffer(make([]byte,1<<24),1<<24); w:=bufio.NewWriter(os.Stdout); defer w.Flush()
 for sc.Scan(){ kr:=strings.SplitN(sc.Text(),"|",2); lists:=[]*ListNode{}; if kr[0]!="0" { for _, x := range strings.Split(kr[1],";") { lists=append(lists, build(x)) } }
  r:=mergeKLists(lists); s:=[]string{}; for r!=nil { s=append(s,strconv.Itoa(r.Val)); r=r.Next }; fmt.Fprintln(w, strings.Join(s,",")) } }
''',
    'rust': r'''#[derive(PartialEq, Eq, Clone, Debug)]
pub struct ListNode { pub val: i32, pub next: Option<Box<ListNode>> }
impl ListNode { #[inline] fn new(val: i32) -> Self { ListNode { next: None, val } } }
struct Solution;
{SOL}
use std::io::{BufRead,Write};
fn build(s: &str) -> Option<Box<ListNode>> { let mut h = None; for x in s.split(',').filter(|x| !x.is_empty()).collect::<Vec<_>>().into_iter().rev() { h = Some(Box::new(ListNode{ val: x.parse().unwrap(), next: h })); } h }
fn main(){ let o=std::io::stdout(); let mut w=std::io::BufWriter::new(o.lock());
 for l in std::io::stdin().lock().lines(){ let l=l.unwrap(); let (k, rest) = l.split_once('|').unwrap();
  let lists: Vec<Option<Box<ListNode>>> = if k == "0" { vec![] } else { rest.split(';').map(build).collect() };
  let mut r = Solution::merge_k_lists(lists); let mut s = vec![]; while let Some(n) = r { s.push(n.val.to_string()); r = n.next; }
  writeln!(w, "{}", s.join(",")).unwrap(); } }
''',
}
DRIVERS = _BUILD

SKIP = {'one': lambda c: int(c.split('|', 1)[0]) >= 1000}


def line(lists):
    return f"{len(lists)}|{';'.join(','.join(map(str, l)) for l in lists)}"


def corpus():
    random.seed(23)
    cases = [[[1, 4, 5], [1, 3, 4], [2, 6]], [], [[]],
             [[3, 7]], [[], [1, 2], [], [0]], [[2, 2], [2], [2, 2, 2]], [[], [], list(range(10)), []],
             [[1, 2, 3], [10, 11]], [[5], [4], [3], [2], [1]]]
    for _ in range(15000):
        cases.append([sorted(random.randint(-3, 3) for _ in range(random.randint(0, 4))) for _ in range(random.randint(0, 6))])
    for _ in range(5000):
        cases.append([sorted(random.randint(-10**4, 10**4) for _ in range(random.randint(0, 20))) for _ in range(random.randint(0, 60))])
    v = lambda: random.randint(-10**4, 10**4)
    cases.append([[v()] for _ in range(10**4)])
    cases.append([sorted(v() for _ in range(500)) for _ in range(20)])
    few = [[] for _ in range(10**4)]
    for i in random.sample(range(10**4), 100):
        few[i] = sorted(v() for _ in range(100))
    cases.append(few)
    cases.append([sorted(v() for _ in range(5000)) for _ in range(2)])
    cases.append([[x] for x in range(5000, -5000, -1)])
    return [(line(ls), ','.join(map(str, sorted(x for l in ls for x in l)))) for ls in cases]
