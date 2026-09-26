"""Word Ladder — the corpus the page's badges describe.

The 2 examples, 7 edges (one-letter words, endWord one change away,
beginWord in the list, endWord unreachable though listed, a list of just
endWord, a detour forced by a missing middle word, words that share no
letters), 15,000 random cases of words 1 to 4 letters over "abc" with up to
12 words — a tiny alphabet, so most words are one change from several others
— 5,000 with 3 to 6 letters over "abcd" and up to 300 words, and six at the
constraint's 10 letters: all 1,024 words over "ab" plus 500 ending in "c",
then five of 5,000 words: random over "abc" with endWord as far away as any reachable word, and
with an endWord no word is one change from, 5,000 words in Gray
code order — each one change from the last, so a BFS reaches every word — the
same words with an endWord none of them can reach, and random words over the
full alphabet, too sparse for any ladder.

A line is "beginWord|endWord|w1,w2,…"; each driver prints the count.

The oracle groups the words by pattern — "h*t" holds hot, hit and hat — and
runs a BFS over those groups, which neither listing does.
"""
import random
from collections import defaultdict, deque

DRIVERS = {
    'ruby': "{SOL}\nSTDIN.each_line { |l| b, e, w = l.chomp.split('|', -1); puts ladder_length(b, e, w.split(',')) }\n",
    'python': "import sys\n{SOL}\n_out = []\nfor l in sys.stdin.read().split('\\n')[:-1]:\n    b, e, w = l.split('|')\n    _out.append(str(Solution().ladderLength(b, e, w.split(','))))\nprint('\\n'.join(_out))\n",
    'javascript': "{SOL}\nconst L = require('fs').readFileSync(0, 'utf8').split('\\n'); L.pop();\nconsole.log(L.map((l) => { const [b, e, w] = l.split('|'); return String(ladderLength(b, e, w.split(','))); }).join('\\n'));\n",
    'go': "package main\nimport (\"bufio\"; \"fmt\"; \"os\"; \"strings\")\n{SOL}\nfunc main() {\n  sc := bufio.NewScanner(os.Stdin); sc.Buffer(make([]byte, 1<<24), 1<<24)\n  w := bufio.NewWriter(os.Stdout); defer w.Flush()\n  for sc.Scan() { p := strings.Split(sc.Text(), \"|\"); fmt.Fprintln(w, ladderLength(p[0], p[1], strings.Split(p[2], \",\"))) }\n}\n",
    'rust': "struct Solution;\n{SOL}\nuse std::io::{BufRead, Write};\nfn main() {\n  let o = std::io::stdout(); let mut w = std::io::BufWriter::new(o.lock());\n  for l in std::io::stdin().lock().lines() { let l = l.unwrap(); let p: Vec<&str> = l.split('|').collect();\n    let words: Vec<String> = p[2].split(',').map(|s| s.to_string()).collect();\n    writeln!(w, \"{}\", Solution::ladder_length(p[0].to_string(), p[1].to_string(), words)).unwrap(); }\n}\n",
}


def distances(begin, words):
    groups = defaultdict(list)
    for w in set(words) | {begin}:
        for i in range(len(w)):
            groups[w[:i] + '*' + w[i + 1:]].append(w)
    dist = {begin: 1}
    todo = deque([begin])
    while todo:
        w = todo.popleft()
        for i in range(len(w)):
            for v in groups[w[:i] + '*' + w[i + 1:]]:
                if v not in dist:
                    dist[v] = dist[w] + 1
                    todo.append(v)
    return dist


def oracle(begin, end, words):
    return distances(begin, words).get(end, 0) if end in words else 0


def farthest(begin, words):
    """The reachable word the most changes away, for a long answer."""
    dist = distances(begin, words)
    return max(words, key=lambda w: dist.get(w, 0))


def S1(a, b):
    return sum(x != y for x, y in zip(a, b)) == 1


def rword(n, alpha):
    return ''.join(random.choice(alpha) for _ in range(n))


def rcase(n, k, alpha):
    pool = {}                                   # a dict, not a set: its order is reproducible
    while len(pool) < k + 1:
        pool[rword(n, alpha)] = True
        if len(pool) == len(alpha) ** n:
            break
    pool = list(pool)
    random.shuffle(pool)
    if len(pool) < 2:
        return None
    begin = pool.pop()
    words = pool[:max(1, k)]
    end = random.choice(words) if random.random() < 0.85 else rword(n, alpha)
    if end == begin:
        return None
    return begin, end, words


def gray(k, n):
    """The first k words of n letters in reflected base-26 Gray code order:
    each differs from the one before in exactly one place, so all k are
    connected, though letters that change in the same place also connect
    words further apart."""
    out = []
    for i in range(k):
        digits = []
        x = i
        for _ in range(n):
            digits.append(x % 26)
            x //= 26
        word, flip = [], 0
        for d in reversed(digits):
            v = 25 - d if flip % 2 else d
            word.append(chr(97 + v))
            flip = d                             # even base: reflect when the digit above is odd
        out.append(''.join(word))
    return out


def corpus():
    random.seed(127)
    cases = [('hit', 'cog', ['hot', 'dot', 'dog', 'lot', 'log', 'cog']), ('hit', 'cog', ['hot', 'dot', 'dog', 'lot', 'log']),
             ('a', 'c', ['a', 'b', 'c']), ('hot', 'dot', ['dot']), ('hot', 'dog', ['hot', 'dog']),
             ('abc', 'xyz', ['abd', 'xyz']), ('ab', 'cd', ['cd']), ('hit', 'cog', ['hot', 'hog', 'dot', 'dog', 'cog']),
             ('aaa', 'bbb', ['aab', 'abb', 'bbb', 'bba'])]
    while len(cases) < 9 + 15000:
        c = rcase(random.randint(1, 4), random.randint(1, 12), 'abc')
        if c:
            cases.append(c)
    while len(cases) < 9 + 20000:
        c = rcase(random.randint(3, 6), random.randint(1, 300), 'abcd')
        if c:
            cases.append(c)
    big = []
    ab = list(dict.fromkeys(rword(9, 'ab') + 'c' for _ in range(20000)))[:500]
    ab = list(dict.fromkeys(ab + [rword(10, 'ab') for _ in range(8000)]))[:5000]
    big.append((ab[0][:-1] + 'b', ab[-1], ab))
    abc = list(dict.fromkeys(rword(10, 'abc') for _ in range(6000)))[:5000]
    start = max(abc[:50], key=lambda w: max(distances(w, abc).values()))
    big.append((start, farthest(start, abc), [w for w in abc if w != start]))
    lone = next(w for w in (rword(10, 'abc') for _ in range(10 ** 6)) if not any(S1(w, v) for v in abc))
    big.append((start, lone, [w for w in abc if w != start][:-1] + [lone]))
    ch = gray(5001, 10)
    big.append((ch[0], ch[-1], ch[1:]))
    big.append((ch[0], 'zzzzzzzzzz', ch[1:-1] + ['zzzzzzzzzz']))
    az = list(dict.fromkeys(rword(10, 'abcdefghijklmnopqrstuvwxyz') for _ in range(5000)))
    big.append((rword(10, 'abcdefghijklmnopqrstuvwxyz'), az[0], az))
    cases += big
    return [(f"{b}|{e}|{','.join(w)}", str(oracle(b, e, w))) for b, e, w in cases]
