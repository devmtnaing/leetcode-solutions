"""Binary trees for verification specs: random shapes, LeetCode's level order,
and the five drivers that parse a tree from a line and print one answer.

A tree here is a list of nodes, index 0 the root: {'v': value, 'l': index or
None, 'r': index or None}. level() turns it into LeetCode's text form,
"1,2,null,3" — one case per line in a corpus.
"""
import collections, random


def random_tree(n, vals=(-100, 100)):
    """A random shape: each new node takes a random free child slot."""
    nodes = [dict(v=random.randint(*vals), l=None, r=None)]
    free = [(0, 'l'), (0, 'r')]
    for i in range(1, n):
        p, side = free.pop(random.randrange(len(free)))
        nodes.append(dict(v=random.randint(*vals), l=None, r=None))
        nodes[p][side] = i
        free += [(i, 'l'), (i, 'r')]
    return nodes


def chain(n, side_of=lambda i: 'l'):
    """n nodes in a line; side_of(i) says which child node i+1 is."""
    nodes = [dict(v=random.randint(-100, 100), l=None, r=None) for _ in range(n)]
    for i in range(n - 1):
        nodes[i][side_of(i)] = i + 1
    return nodes


def complete(n):
    nodes = [dict(v=random.randint(-100, 100), l=None, r=None) for _ in range(n)]
    for i in range(n):
        if 2 * i + 1 < n: nodes[i]['l'] = 2 * i + 1
        if 2 * i + 2 < n: nodes[i]['r'] = 2 * i + 2
    return nodes


def from_level(values):
    """[3, 9, 20, None, None, 15, 7] -> nodes, the way LeetCode reads it."""
    if not values or values[0] is None:
        return []
    nodes = [dict(v=values[0], l=None, r=None)]
    q, i = collections.deque([0]), 1
    while q and i < len(values):
        p = q.popleft()
        for side in 'lr':
            if i >= len(values): break
            if values[i] is not None:
                nodes.append(dict(v=values[i], l=None, r=None))
                nodes[p][side] = len(nodes) - 1
                q.append(len(nodes) - 1)
            i += 1
    return nodes


def level(nodes):
    """nodes -> "1,2,null,3", trailing nulls trimmed; "" for an empty tree."""
    if not nodes:
        return ''
    out, q = [], collections.deque([0])
    while q:
        i = q.popleft()
        if i is None:
            out.append('null')
            continue
        out.append(str(nodes[i]['v']))
        q.append(nodes[i]['l'])
        q.append(nodes[i]['r'])
    while out and out[-1] == 'null':
        out.pop()
    return ','.join(out)


# Where each driver calls the solution, so the result can be serialized.
_CALLS = {
    'ruby': '{CALL}(build(l.chomp))',
    'python': 'Solution().{CALL}(build(l))',
    'javascript': '{CALL}(build(l))',
    'go': '{CALL}(build(sc.Text()))',
    'rust': 'Solution::{CALL}(build(&l))',
}


def drivers(ruby, python, javascript, go, rust, returns_tree=False):
    """DRIVERS for a function that takes a tree root. Pass the function name as
    each language spells it. By default the result is printed as is (a number,
    a bool); with returns_tree=True it is printed in level order, like the
    corpus."""
    names = dict(ruby=ruby, python=python, javascript=javascript, go=go, rust=rust)
    out = {}
    for lang, name in names.items():
        text = _DRIVERS[lang]
        if returns_tree:
            assert text.count(_CALLS[lang]) == 1, lang
            text = text.replace(_CALLS[lang], f'ser({_CALLS[lang]})')
        out[lang] = text.replace('{CALL}', name)
    return out


_DRIVERS = {
    'ruby': r'''class TreeNode
  attr_accessor :val, :left, :right
  def initialize(val = 0, left = nil, right = nil); @val = val; @left = left; @right = right; end
end
{SOL}
def build(s)
  t = s.split(',').map { |x| x == 'null' ? nil : TreeNode.new(x.to_i) }
  return nil if t.empty? || t[0].nil?
  q = [t[0]]; i = 1
  until q.empty? || i >= t.length
    n = q.shift
    n.left = t[i]; i += 1; q << n.left if n.left
    break if i >= t.length
    n.right = t[i]; i += 1; q << n.right if n.right
  end
  t[0]
end
def ser(r)
  out = []; q = [r]
  until q.empty?
    n = q.shift
    if n then out << n.val.to_s; q << n.left << n.right else out << 'null' end
  end
  out.pop while out.last == 'null'
  out.join(',')
end
STDIN.each_line { |l| puts {CALL}(build(l.chomp)) }
''',
    'python': r'''class TreeNode:
    def __init__(self, val=0, left=None, right=None): self.val, self.left, self.right = val, left, right
{SOL}
import sys
from collections import deque as _dq
def build(s):
    t = [None if x == 'null' else TreeNode(int(x)) for x in s.split(',') if x]
    if not t or t[0] is None: return None
    q = _dq([t[0]]); i = 1
    while q and i < len(t):
        n = q.popleft()
        n.left = t[i]; i += 1
        if n.left: q.append(n.left)
        if i >= len(t): break
        n.right = t[i]; i += 1
        if n.right: q.append(n.right)
    return t[0]
def ser(r):
    out = []; q = _dq([r])
    while q:
        n = q.popleft()
        if n: out.append(str(n.val)); q.append(n.left); q.append(n.right)
        else: out.append('null')
    while out and out[-1] == 'null': out.pop()
    return ','.join(out)
print('\n'.join(str(Solution().{CALL}(build(l))) for l in sys.stdin.read().split('\n')[:-1]))
''',
    'javascript': r'''function TreeNode(val, left, right) { this.val = val === undefined ? 0 : val; this.left = left === undefined ? null : left; this.right = right === undefined ? null : right; }
{SOL}
function build(s) {
  const t = s.split(',').filter(Boolean).map((x) => (x === 'null' ? null : new TreeNode(Number(x))));
  if (!t.length || t[0] === null) return null;
  const q = [t[0]]; let h = 0, i = 1;
  while (h < q.length && i < t.length) {
    const n = q[h++];
    n.left = t[i++]; if (n.left) q.push(n.left);
    if (i >= t.length) break;
    n.right = t[i++]; if (n.right) q.push(n.right);
  }
  return t[0];
}
function ser(r) {
  const out = []; const q = [r]; let h = 0;
  while (h < q.length) { const n = q[h++]; if (n) { out.push(String(n.val)); q.push(n.left, n.right); } else out.push('null'); }
  while (out.length && out[out.length - 1] === 'null') out.pop();
  return out.join(',');
}
const L = require('fs').readFileSync(0, 'utf8').split('\n'); L.pop();
console.log(L.map((l) => String({CALL}(build(l)))).join('\n'));
''',
    'go': r'''package main
import ("bufio";"fmt";"os";"strings";"strconv")
type TreeNode struct { Val int; Left *TreeNode; Right *TreeNode }
{SOL}
func build(s string) *TreeNode {
  if s == "" { return nil }
  p := strings.Split(s, ","); t := make([]*TreeNode, len(p))
  for i, x := range p { if x != "null" { v, _ := strconv.Atoi(x); t[i] = &TreeNode{Val: v} } }
  if t[0] == nil { return nil }
  q := []*TreeNode{t[0]}; i := 1
  for len(q) > 0 && i < len(t) {
    n := q[0]; q = q[1:]
    n.Left = t[i]; i++; if n.Left != nil { q = append(q, n.Left) }
    if i >= len(t) { break }
    n.Right = t[i]; i++; if n.Right != nil { q = append(q, n.Right) }
  }
  return t[0]
}
func ser(r *TreeNode) string {
  out := []string{}; q := []*TreeNode{r}
  for len(q) > 0 { n := q[0]; q = q[1:]; if n != nil { out = append(out, strconv.Itoa(n.Val)); q = append(q, n.Left, n.Right) } else { out = append(out, "null") } }
  for len(out) > 0 && out[len(out)-1] == "null" { out = out[:len(out)-1] }
  return strings.Join(out, ",")
}
func main(){ sc:=bufio.NewScanner(os.Stdin); sc.Buffer(make([]byte,1<<22),1<<22); w:=bufio.NewWriter(os.Stdout); defer w.Flush(); for sc.Scan(){ fmt.Fprintln(w, {CALL}(build(sc.Text()))) } }
''',
    'rust': r'''{SOL}
#[derive(Debug, PartialEq, Eq)]
pub struct TreeNode { pub val: i32, pub left: Option<Rc<RefCell<TreeNode>>>, pub right: Option<Rc<RefCell<TreeNode>>> }
impl TreeNode { #[inline] pub fn new(val: i32) -> Self { TreeNode { val, left: None, right: None } } }
struct Solution;
use std::io::{BufRead, Write};
type T = Option<Rc<RefCell<TreeNode>>>;
fn build(s: &str) -> T {
  if s.is_empty() { return None; }
  let t: Vec<T> = s.split(',').map(|x| if x == "null" { None } else { Some(Rc::new(RefCell::new(TreeNode::new(x.parse().unwrap())))) }).collect();
  let root = t[0].clone()?;
  let mut q = std::collections::VecDeque::from(vec![root.clone()]); let mut i = 1;
  while let Some(n) = q.pop_front() {
    if i >= t.len() { break; }
    n.borrow_mut().left = t[i].clone(); if let Some(c) = &t[i] { q.push_back(c.clone()); } i += 1;
    if i >= t.len() { break; }
    n.borrow_mut().right = t[i].clone(); if let Some(c) = &t[i] { q.push_back(c.clone()); } i += 1;
  }
  Some(root)
}
fn ser(r: T) -> String {
  let mut out: Vec<String> = vec![]; let mut q = std::collections::VecDeque::from(vec![r]);
  while let Some(n) = q.pop_front() { match n { Some(n) => { let b = n.borrow(); out.push(b.val.to_string()); q.push_back(b.left.clone()); q.push_back(b.right.clone()); } None => out.push("null".into()) } }
  while out.last().map(|x| x == "null").unwrap_or(false) { out.pop(); }
  out.join(",")
}
fn main(){ let o=std::io::stdout(); let mut w=std::io::BufWriter::new(o.lock()); for l in std::io::stdin().lock().lines(){ let l=l.unwrap(); writeln!(w, "{}", Solution::{CALL}(build(&l))).unwrap(); } }
''',
}
