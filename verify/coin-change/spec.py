"""Coin Change — the corpus the page's badges describe.

The 3 examples, 6 edges (greedy traps like [1,3,4] → 6, an impossible odd
amount, a coin larger than the amount, the largest coin 2³¹ − 1, a single
coin equal to the amount), 15,000 random cases of 1 to 4 coins from 1..10
with amounts 0..12, 5,000 of up to 12 coins from 1..60 with amounts up to
500, and five at amount = 10⁴ (common coins, coprime pair, one coin that
cannot divide it, twelve large coins, and 2³¹ − 1 among them). A line is
"coins|amount".

The oracle is a breadth-first search from 0 over the amounts one coin away
— the fewest coins is the shortest path — which shares no code with the
recursion or the table. The plain recursion is exponential, so it runs only
on the cases with amount ≤ 12.
"""
import random
from collections import deque

DRIVERS = {
    'ruby': "{SOL}\nSTDIN.each_line { |l| c, a = l.chomp.split('|'); puts coin_change(c.split(',').map(&:to_i), a.to_i) }\n",
    'python': "{SOL}\nimport sys\nsol = Solution()\nout = []\nfor l in sys.stdin.read().split('\\n')[:-1]:\n    c, a = l.split('|')\n    out.append(str(sol.coinChange([int(x) for x in c.split(',')], int(a))))\nprint('\\n'.join(out))\n",
    'javascript': "{SOL}\nconst L = require('fs').readFileSync(0, 'utf8').split('\\n'); L.pop();\nconsole.log(L.map((l) => { const [c, a] = l.split('|'); return String(coinChange(c.split(',').map(Number), Number(a))); }).join('\\n'));\n",
    'go': "package main\nimport (\"bufio\"; \"fmt\"; \"os\"; \"strconv\"; \"strings\")\n{SOL}\nfunc main() {\n  sc := bufio.NewScanner(os.Stdin); sc.Buffer(make([]byte, 1<<24), 1<<24)\n  w := bufio.NewWriter(os.Stdout); defer w.Flush()\n  for sc.Scan() { parts := strings.Split(sc.Text(), \"|\"); p := strings.Split(parts[0], \",\"); c := make([]int, len(p)); for i, x := range p { c[i], _ = strconv.Atoi(x) }; a, _ := strconv.Atoi(parts[1]); fmt.Fprintln(w, coinChange(c, a)) }\n}\n",
    'rust': "struct Solution;\n{SOL}\nuse std::io::{BufRead, Write};\nfn main() {\n  let o = std::io::stdout(); let mut w = std::io::BufWriter::new(o.lock());\n  for l in std::io::stdin().lock().lines() { let l = l.unwrap(); let (c, a) = l.split_once('|').unwrap(); let c: Vec<i32> = c.split(',').map(|x| x.parse().unwrap()).collect(); writeln!(w, \"{}\", Solution::coin_change(c, a.parse().unwrap())).unwrap(); }\n}\n",
}

# plain recursion is exponential in the amount
SKIP = {'recurse': lambda c: int(c.split('|')[1]) > 12}

BIG = 2**31 - 1


def oracle(coins, amount):
    dist = {0: 0}
    todo = deque([0])
    while todo:
        x = todo.popleft()
        if x == amount:
            return dist[x]
        for c in coins:
            y = x + c
            if y <= amount and y not in dist:
                dist[y] = dist[x] + 1
                todo.append(y)
    return -1


def corpus():
    random.seed(322)
    cases = [([1, 2, 5], 11), ([2], 3), ([1], 0),
             ([1, 3, 4], 6), ([2, 4], 7), ([5], 3), ([BIG], 10), ([1, BIG], 12), ([7], 7)]
    cases += [(random.sample(range(1, 11), random.randint(1, 4)), random.randint(0, 12)) for _ in range(15000)]
    cases += [(random.sample(range(1, 61), random.randint(1, 12)), random.randint(0, 500)) for _ in range(5000)]
    cases += [([1, 2, 5, 10, 20, 50], 10**4), ([7, 11], 10**4), ([3], 10**4),
              (random.sample(range(1000, 5000), 12), 10**4), ([BIG, 3, 7], 10**4)]
    return [(','.join(map(str, c)) + '|' + str(a), str(oracle(c, a))) for c, a in cases]
