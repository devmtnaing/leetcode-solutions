"""Climbing Stairs — the corpus the page's badges describe.

The input is one n from 1 to 45, so the corpus is all of them. The oracle
counts arrangements of 1s and 2s with binomials, not with the recurrence the
listings use. The plain recursion makes 2·ways(n) − 1 calls, so it only runs
up to n = 35 here; the page reports its separately timed run at n = 45.
"""
from math import comb

DRIVERS = {
    'ruby': "{SOL}\nSTDIN.each_line { |l| puts climb_stairs(l.to_i) }\n",
    'python': "{SOL}\nimport sys\nsol = Solution()\nprint('\\n'.join(str(sol.climbStairs(int(l))) for l in sys.stdin.read().split('\\n')[:-1]))\n",
    'javascript': "{SOL}\nconst L = require('fs').readFileSync(0, 'utf8').split('\\n'); L.pop();\nconsole.log(L.map((l) => String(climbStairs(Number(l)))).join('\\n'));\n",
    'go': "package main\nimport (\"bufio\"; \"fmt\"; \"os\"; \"strconv\")\n{SOL}\nfunc main() {\n  sc := bufio.NewScanner(os.Stdin); w := bufio.NewWriter(os.Stdout); defer w.Flush()\n  for sc.Scan() { n, _ := strconv.Atoi(sc.Text()); fmt.Fprintln(w, climbStairs(n)) }\n}\n",
    'rust': "struct Solution;\n{SOL}\nuse std::io::{BufRead, Write};\nfn main() {\n  let o = std::io::stdout(); let mut w = std::io::BufWriter::new(o.lock());\n  for l in std::io::stdin().lock().lines() { let n: i32 = l.unwrap().trim().parse().unwrap(); writeln!(w, \"{}\", Solution::climb_stairs(n)).unwrap(); }\n}\n",
}
SKIP = {'naive': lambda case: int(case) > 35}


def ways(n):
    return sum(comb(n - twos, twos) for twos in range(n // 2 + 1))


def corpus():
    return [(str(n), str(ways(n))) for n in range(1, 46)]
