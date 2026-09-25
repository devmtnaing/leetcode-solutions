"""Implement Trie (Prefix Tree) — the corpus the page's badges describe.

The example, 6 edges (a word that is only a prefix of another, the empty
trie, the same word inserted twice, one-letter words, a prefix longer than
every word, a word inserted after its extensions), 15,000 random runs of up
to 20 calls over the alphabets "ab" and "abc" with words of 1 to 5 letters —
so words share prefixes constantly — 5,000 of up to 300 calls over 3 or 26
letters and up to 12 letters, and four at the limits of 3 × 10⁴ calls: words
of 2,000 letters that share a 1,999-letter prefix, random words up to 20
letters, and 10,000 short words followed by 20,000 prefix queries that
match none of them — the worst case for scanning every word.

A line is a list of calls "i word", "s word" or "w prefix", split by ";";
each driver makes a Trie and prints what every call returned, "null" for an
insert, comma-separated.

The oracle keeps the words in a sorted list and answers startsWith with a
binary search for the first word not below the prefix — no trie, no scan.
"""
import bisect, random

DRIVERS = {
    'ruby': "{SOL}\nSTDIN.each_line { |l| t = Trie.new\n  puts l.chomp.split(';').map { |o| op, w = o.split(' '); case op when 'i' then t.insert(w); 'null' when 's' then t.search(w).to_s else t.starts_with(w).to_s end }.join(',') }\n",
    'python': "{SOL}\nimport sys\n_out = []\nfor l in sys.stdin.read().split('\\n')[:-1]:\n    t = Trie(); r = []\n    for o in l.split(';'):\n        op, w = o.split(' ')\n        if op == 'i':\n            t.insert(w); r.append('null')\n        else:\n            r.append('true' if (t.search(w) if op == 's' else t.startsWith(w)) else 'false')\n    _out.append(','.join(r))\nprint('\\n'.join(_out))\n",
    'javascript': "{SOL}\nconst L = require('fs').readFileSync(0, 'utf8').split('\\n'); L.pop();\nconsole.log(L.map((l) => { const t = new Trie();\n  return l.split(';').map((o) => { const [op, w] = o.split(' '); if (op === 'i') { t.insert(w); return 'null'; } return String(op === 's' ? t.search(w) : t.startsWith(w)); }).join(','); }).join('\\n'));\n",
    'go': "package main\nimport (\"bufio\"; \"fmt\"; \"os\"; \"strings\")\n{SOL}\nfunc main() {\n  sc := bufio.NewScanner(os.Stdin); sc.Buffer(make([]byte, 1<<26), 1<<26)\n  w := bufio.NewWriter(os.Stdout); defer w.Flush()\n  for sc.Scan() { t := Constructor(); ops := strings.Split(sc.Text(), \";\"); r := make([]string, len(ops))\n    for i, o := range ops { a := strings.SplitN(o, \" \", 2); switch a[0] { case \"i\": t.Insert(a[1]); r[i] = \"null\"; case \"s\": r[i] = fmt.Sprint(t.Search(a[1])); default: r[i] = fmt.Sprint(t.StartsWith(a[1])) } }\n    fmt.Fprintln(w, strings.Join(r, \",\")) }\n}\n",
    'rust': "{SOL}\nuse std::io::{BufRead, Write};\nfn main() {\n  let o = std::io::stdout(); let mut w = std::io::BufWriter::new(o.lock());\n  for l in std::io::stdin().lock().lines() { let l = l.unwrap(); let mut t = Trie::new();\n    let r: Vec<String> = l.split(';').map(|o| { let (op, x) = o.split_once(' ').unwrap(); match op { \"i\" => { t.insert(x.to_string()); \"null\".to_string() } \"s\" => t.search(x.to_string()).to_string(), _ => t.starts_with(x.to_string()).to_string() } }).collect();\n    writeln!(w, \"{}\", r.join(\",\")).unwrap(); }\n}\n",
}


def oracle(ops):
    words, out = [], []
    for op, w in ops:
        if op == 'i':
            i = bisect.bisect_left(words, w)
            if i == len(words) or words[i] != w:
                words.insert(i, w)
            out.append('null')
        elif op == 's':
            i = bisect.bisect_left(words, w)
            out.append('true' if i < len(words) and words[i] == w else 'false')
        else:
            i = bisect.bisect_left(words, w)
            out.append('true' if i < len(words) and words[i][:len(w)] == w else 'false')
    return ','.join(out)


def word(alpha, lo, hi):
    return ''.join(random.choice(alpha) for _ in range(random.randint(lo, hi)))


def rand_ops(n, alpha, lo, hi):
    return [(random.choice('iisw'), word(alpha, lo, hi)) for _ in range(n)]


def corpus():
    random.seed(208)
    cases = [[('i', 'apple'), ('s', 'apple'), ('s', 'app'), ('w', 'app'), ('i', 'app'), ('s', 'app')],
             [('i', 'apple'), ('s', 'app'), ('w', 'appl'), ('w', 'apples')],
             [('s', 'a'), ('w', 'a')],
             [('i', 'dog'), ('i', 'dog'), ('s', 'dog'), ('w', 'do')],
             [('i', 'a'), ('i', 'b'), ('s', 'a'), ('s', 'c'), ('w', 'b')],
             [('i', 'ab'), ('w', 'abc'), ('s', 'abc')],
             [('i', 'cart'), ('i', 'card'), ('s', 'car'), ('i', 'car'), ('s', 'car'), ('w', 'ca')]]
    for _ in range(15000):
        cases.append(rand_ops(random.randint(1, 20), random.choice(['ab', 'abc']), 1, 5))
    for _ in range(5000):
        cases.append(rand_ops(random.randint(1, 300), random.choice(['abc', 'abcdefghijklmnopqrstuvwxyz']), 1, 12))
    stem = 'a' * 1999
    cases.append([(random.choice('iisw'), stem + random.choice('abcdefghijklmnopqrstuvwxyz')) for _ in range(30000)])
    cases.append([(random.choice('iisw'), random.choice([stem[:random.randint(1, 1999)], stem + 'z'])) for _ in range(30000)])
    cases.append(rand_ops(30000, 'abcdefghijklmnopqrstuvwxyz', 1, 20))
    abc = 'abcdefghijklmnopqrstuvwxyz'
    many = []
    while len(many) < 10000:                     # short words, none starting "zz"
        w = word(abc, 3, 8)
        if not w.startswith('zz'):
            many.append(('i', w))
    cases.append(many + [('w', 'zz' + word(abc, 1, 2)) for _ in range(20000)])
    return [(';'.join(f'{op} {w}' for op, w in c), oracle(c)) for c in cases]
