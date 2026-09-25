"""Permutations — the corpus the page's badges describe.

The 3 examples, then every length from 1 to 6 drawn many times: 20,000
random lists of distinct values from -10..10, weighted toward length 6 (720
permutations each), plus the extremes -10 and 10 together. A line is the
list, comma-separated.

LeetCode accepts the permutations in any order, so each driver sorts the
listing's answer before printing it — lexicographically, one permutation per
";" — and prints how many there were first, so a duplicate or a missing one
shows even after sorting.

The oracle is itertools.permutations, sorted.
"""
import itertools, random

DRIVERS = {
    'ruby': "{SOL}\nSTDIN.each_line { |l| r = permute(l.chomp.split(',').map(&:to_i)).sort; puts \"#{r.length}|#{r.map { |p| p.join(',') }.join(';')}\" }\n",
    'python': "{SOL}\nimport sys\n_out = []\nfor l in sys.stdin.read().split('\\n')[:-1]:\n    r = sorted(Solution().permute([int(x) for x in l.split(',')]))\n    _out.append(f\"{len(r)}|{';'.join(','.join(map(str, p)) for p in r)}\")\nprint('\\n'.join(_out))\n",
    'javascript': "{SOL}\nconst L = require('fs').readFileSync(0, 'utf8').split('\\n'); L.pop();\nconst cmp = (a, b) => { for (let i = 0; i < Math.min(a.length, b.length); i++) if (a[i] !== b[i]) return a[i] - b[i]; return a.length - b.length; };\nconsole.log(L.map((l) => { const r = permute(l.split(',').map(Number)).sort(cmp); return `${r.length}|${r.map((p) => p.join(',')).join(';')}`; }).join('\\n'));\n",
    'go': "package main\nimport (\"bufio\"; \"fmt\"; \"os\"; \"sort\"; \"strconv\"; \"strings\")\n{SOL}\nfunc main() {\n  sc := bufio.NewScanner(os.Stdin); sc.Buffer(make([]byte, 1<<20), 1<<20)\n  w := bufio.NewWriter(os.Stdout); defer w.Flush()\n  for sc.Scan() { f := strings.Split(sc.Text(), \",\"); a := make([]int, len(f)); for i, x := range f { a[i], _ = strconv.Atoi(x) }\n    r := permute(a); sort.Slice(r, func(i, j int) bool { x, y := r[i], r[j]; for k := 0; k < len(x) && k < len(y); k++ { if x[k] != y[k] { return x[k] < y[k] } }; return len(x) < len(y) })\n    s := make([]string, len(r)); for i, p := range r { q := make([]string, len(p)); for j, v := range p { q[j] = strconv.Itoa(v) }; s[i] = strings.Join(q, \",\") }\n    fmt.Fprintf(w, \"%d|%s\\n\", len(r), strings.Join(s, \";\")) }\n}\n",
    'rust': "struct Solution;\n{SOL}\nuse std::io::{BufRead, Write};\nfn main() {\n  let o = std::io::stdout(); let mut w = std::io::BufWriter::new(o.lock());\n  for l in std::io::stdin().lock().lines() { let l = l.unwrap(); let a: Vec<i32> = l.split(',').map(|x| x.parse().unwrap()).collect();\n    let mut r = Solution::permute(a); r.sort();\n    let s: Vec<String> = r.iter().map(|p| p.iter().map(|v| v.to_string()).collect::<Vec<_>>().join(\",\")).collect();\n    writeln!(w, \"{}|{}\", r.len(), s.join(\";\")).unwrap(); }\n}\n",
}


def oracle(nums):
    r = sorted(itertools.permutations(nums))
    return f"{len(r)}|{';'.join(','.join(map(str, p)) for p in r)}"


def corpus():
    random.seed(46)
    cases = [[1, 2, 3], [0, 1], [1], [-10, 10], [10, -10, 0, 5, -5, 1]]
    for _ in range(20000):
        n = random.choice([1, 2, 3, 4, 5, 6, 6, 6])
        cases.append(random.sample(range(-10, 11), n))
    return [(','.join(map(str, c)), oracle(c)) for c in cases]
