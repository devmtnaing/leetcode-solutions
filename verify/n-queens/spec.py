"""N-Queens — the corpus the page's badges describe.

The constraint allows n = 1 to 9, so the corpus is every one of them: nine
inputs, 1 to 352 solutions each (0 for n = 2 and 3), 724 boards in all.

A line is n. LeetCode accepts the boards in any order, so each driver sorts
them and prints how many there were, then every board with its rows joined
by "," and the boards by ";" — a missing, repeated or malformed board shows.

The oracle tries every permutation of the columns (one queen per row and
per column by construction) and keeps those where no two queens share a
diagonal — no backtracking at all.
"""
import itertools

DRIVERS = {
    'ruby': "{SOL}\nSTDIN.each_line { |l| r = solve_n_queens(l.to_i).sort; puts \"#{r.length}|#{r.map { |b| b.join(',') }.join(';')}\" }\n",
    'python': "{SOL}\nimport sys\n_out = []\nfor l in sys.stdin.read().split('\\n')[:-1]:\n    r = sorted(Solution().solveNQueens(int(l)))\n    _out.append(f\"{len(r)}|{';'.join(','.join(b) for b in r)}\")\nprint('\\n'.join(_out))\n",
    'javascript': "{SOL}\nconst L = require('fs').readFileSync(0, 'utf8').split('\\n'); L.pop();\nconsole.log(L.map((l) => { const r = solveNQueens(Number(l)).map((b) => b.join(',')).sort(); return `${r.length}|${r.join(';')}`; }).join('\\n'));\n",
    'go': "package main\nimport (\"bufio\"; \"fmt\"; \"os\"; \"sort\"; \"strconv\"; \"strings\")\n{SOL}\nfunc main() {\n  sc := bufio.NewScanner(os.Stdin); w := bufio.NewWriter(os.Stdout); defer w.Flush()\n  for sc.Scan() { n, _ := strconv.Atoi(sc.Text()); r := solveNQueens(n); s := make([]string, len(r)); for i, b := range r { s[i] = strings.Join(b, \",\") }; sort.Strings(s)\n    fmt.Fprintf(w, \"%d|%s\\n\", len(s), strings.Join(s, \";\")) }\n}\n",
    'rust': "struct Solution;\n{SOL}\nuse std::io::{BufRead, Write};\nfn main() {\n  let o = std::io::stdout(); let mut w = std::io::BufWriter::new(o.lock());\n  for l in std::io::stdin().lock().lines() { let n: i32 = l.unwrap().trim().parse().unwrap();\n    let mut s: Vec<String> = Solution::solve_n_queens(n).iter().map(|b| b.join(\",\")).collect(); s.sort();\n    writeln!(w, \"{}|{}\", s.len(), s.join(\";\")).unwrap(); }\n}\n",
}


def oracle(n):
    boards = []
    for p in itertools.permutations(range(n)):
        if len({r - c for r, c in enumerate(p)}) == n and len({r + c for r, c in enumerate(p)}) == n:
            boards.append(','.join('.' * c + 'Q' + '.' * (n - c - 1) for c in p))
    boards.sort()
    return f"{len(boards)}|{';'.join(boards)}"


def corpus():
    return [(str(n), oracle(n)) for n in range(1, 10)]
