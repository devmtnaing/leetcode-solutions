"""LRU Cache — the corpus the page's badges describe.

The example, 6 edges (capacity 1, the same key put over and over, gets on an
empty cache, an update that saves a key from eviction, a get that saves one,
every key evicted in turn), 15,000 random runs of up to 20 calls with
capacity 1 to 4 over keys 0..5 — small, so hits, misses, updates and
evictions all happen constantly — 5,000 of up to 500 calls with capacity up
to 50 over keys 0..100, and three at the limits: 2 × 10⁵ calls at capacity
3,000 over keys up to 10⁴, the same at capacity 1, and a full 3,000-key
cache asked 197,000 times for its two newest keys — the worst case for a
recency list scanned from the oldest end.

A line is "capacity|call;call;…", a call being "p key value" or "g key";
each driver builds the cache the way LeetCode does and prints what every call
returned, "null" for a put, comma-separated.

The oracle is Python's OrderedDict with move_to_end and popitem(last=False)
— neither a list scan nor a hand-built linked list.
"""
import random
from collections import OrderedDict

DRIVERS = {
    'ruby': "{SOL}\nSTDIN.each_line { |l| cap, ops = l.chomp.split('|', -1); c = LRUCache.new(cap.to_i)\n  puts ops.split(';').map { |o| a = o.split(' '); a[0] == 'p' ? (c.put(a[1].to_i, a[2].to_i); 'null') : c.get(a[1].to_i).to_s }.join(',') }\n",
    'python': "{SOL}\nimport sys\n_out = []\nfor l in sys.stdin.read().split('\\n')[:-1]:\n    cap, ops = l.split('|')\n    c = LRUCache(int(cap)); r = []\n    for o in ops.split(';'):\n        a = o.split(' ')\n        if a[0] == 'p':\n            c.put(int(a[1]), int(a[2])); r.append('null')\n        else:\n            r.append(str(c.get(int(a[1]))))\n    _out.append(','.join(r))\nprint('\\n'.join(_out))\n",
    'javascript': "{SOL}\nconst L = require('fs').readFileSync(0, 'utf8').split('\\n'); L.pop();\nconsole.log(L.map((l) => { const [cap, ops] = l.split('|'); const c = new LRUCache(Number(cap));\n  return ops.split(';').map((o) => { const a = o.split(' '); if (a[0] === 'p') { c.put(Number(a[1]), Number(a[2])); return 'null'; } return String(c.get(Number(a[1]))); }).join(','); }).join('\\n'));\n",
    'go': "package main\nimport (\"bufio\"; \"fmt\"; \"os\"; \"strconv\"; \"strings\")\n{SOL}\nfunc main() {\n  sc := bufio.NewScanner(os.Stdin); sc.Buffer(make([]byte, 1<<24), 1<<24)\n  w := bufio.NewWriter(os.Stdout); defer w.Flush()\n  for sc.Scan() { parts := strings.Split(sc.Text(), \"|\"); cp, _ := strconv.Atoi(parts[0]); c := Constructor(cp); ops := strings.Split(parts[1], \";\"); r := make([]string, len(ops))\n    for i, o := range ops { a := strings.Split(o, \" \"); k, _ := strconv.Atoi(a[1]); if a[0] == \"p\" { v, _ := strconv.Atoi(a[2]); c.Put(k, v); r[i] = \"null\" } else { r[i] = strconv.Itoa(c.Get(k)) } }\n    fmt.Fprintln(w, strings.Join(r, \",\")) }\n}\n",
    'rust': "{SOL}\nuse std::io::{BufRead, Write};\nfn main() {\n  let o = std::io::stdout(); let mut w = std::io::BufWriter::new(o.lock());\n  for l in std::io::stdin().lock().lines() { let l = l.unwrap(); let (cap, ops) = l.split_once('|').unwrap(); let mut c = LRUCache::new(cap.parse().unwrap());\n    let r: Vec<String> = ops.split(';').map(|o| { let a: Vec<&str> = o.split(' ').collect(); let k: i32 = a[1].parse().unwrap(); if a[0] == \"p\" { c.put(k, a[2].parse().unwrap()); \"null\".to_string() } else { c.get(k).to_string() } }).collect();\n    writeln!(w, \"{}\", r.join(\",\")).unwrap(); }\n}\n",
}


def oracle(cap, ops):
    d = OrderedDict()
    out = []
    for op in ops:
        if op[0] == 'p':
            _, k, v = op
            if k in d:
                d.move_to_end(k)
            d[k] = v
            if len(d) > cap:
                d.popitem(last=False)
            out.append('null')
        else:
            k = op[1]
            if k in d:
                d.move_to_end(k)
                out.append(str(d[k]))
            else:
                out.append('-1')
    return ','.join(out)


def rand_ops(n, keys, vals, p_put=0.5):
    return [('p', random.randint(0, keys), random.randint(0, vals)) if random.random() < p_put else ('g', random.randint(0, keys))
            for _ in range(n)]


def line(cap, ops):
    return f"{cap}|{';'.join(' '.join(map(str, o)) for o in ops)}"


def corpus():
    random.seed(146)
    cases = [(2, [('p', 1, 1), ('p', 2, 2), ('g', 1), ('p', 3, 3), ('g', 2), ('p', 4, 4), ('g', 1), ('g', 3), ('g', 4)]),
             (1, [('p', 1, 1), ('p', 2, 2), ('g', 1), ('g', 2)]),
             (2, [('p', 5, i) for i in range(6)] + [('g', 5)]),
             (3, [('g', 0), ('g', 1)]),
             (2, [('p', 1, 1), ('p', 2, 2), ('p', 1, 10), ('p', 3, 3), ('g', 1), ('g', 2)]),
             (2, [('p', 1, 1), ('p', 2, 2), ('g', 1), ('p', 3, 3), ('g', 1), ('g', 2), ('g', 3)]),
             (3, [('p', k, k) for k in range(10)] + [('g', k) for k in range(10)])]
    for _ in range(15000):
        cases.append((random.randint(1, 4), rand_ops(random.randint(1, 20), 5, 9, random.choice([0.3, 0.5, 0.7]))))
    for _ in range(5000):
        cases.append((random.randint(1, 50), rand_ops(random.randint(1, 500), 100, 10**5)))
    cases.append((3000, rand_ops(200000, 10**4, 10**5)))
    cases.append((1, rand_ops(200000, 10**4, 10**5)))
    busy = [('p', k, k) for k in range(3000)]
    for i in range(197000):                      # the two newest keys, at the far end of a scan
        busy.append(('g', 2999 - i % 2))
    cases.append((3000, busy))
    return [(line(c, o), oracle(c, o)) for c, o in cases]
