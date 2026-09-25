"""Word Search II — the corpus the page's badges describe.

The 2 examples, 6 edges (a 1 × 1 board, a word longer than the board has
cells, a word that would need a cell twice, a word that is a prefix of
another with both on the board, a word found along a snake, one letter
everywhere), 15,000 random boards of 1 × 1 to 4 × 4 over "ab" or "abc" with
up to 8 words of 1 to 6 letters — most of them on the board somewhere —
5,000 boards up to 8 × 8 over four to six letters with up to 60 words of up
to 10 letters, and five at the limits: a 12 × 12 board of random letters
with 3 × 10⁴ random words, the same board with every word cut from a real
path on it, a 12 × 12 board of one letter with every string of that letter
up to 10 long plus ten that end in a letter the board lacks (the classic
worst case for the search), the same board with the 25 words of nine a's and
one other letter — every one found nowhere, each only after trying every
path of nine a's — and the 26 words that share a 9-letter start.

A line is "board|words", the board's rows split by ";" and the words by
","; each driver prints the words it found, sorted (LeetCode accepts any
order), comma-separated.

Searching for each word separately repeats the whole board search per word:
it skips the two inputs with thousands of words.

The oracle checks each word on its own with a search that tracks the cells
used as a bitmask and caches nothing — no trie, no marking of the board.
"""
import random

DRIVERS = {
    'ruby': "{SOL}\nSTDIN.each_line { |l| b, w = l.chomp.split('|', -1); puts find_words(b.split(';').map(&:chars), w.split(',')).sort.join(',') }\n",
    'python': "{SOL}\nimport sys\n_out = []\nfor l in sys.stdin.read().split('\\n')[:-1]:\n    b, w = l.split('|')\n    _out.append(','.join(sorted(Solution().findWords([list(r) for r in b.split(';')], w.split(',')))))\nprint('\\n'.join(_out))\n",
    'javascript': "{SOL}\nconst L = require('fs').readFileSync(0, 'utf8').split('\\n'); L.pop();\nconsole.log(L.map((l) => { const [b, w] = l.split('|'); return findWords(b.split(';').map((r) => r.split('')), w.split(',')).sort().join(','); }).join('\\n'));\n",
    'go': "package main\nimport (\"bufio\"; \"fmt\"; \"os\"; \"sort\"; \"strings\")\n{SOL}\nfunc main() {\n  sc := bufio.NewScanner(os.Stdin); sc.Buffer(make([]byte, 1<<24), 1<<24)\n  w := bufio.NewWriter(os.Stdout); defer w.Flush()\n  for sc.Scan() { p := strings.SplitN(sc.Text(), \"|\", 2); rs := strings.Split(p[0], \";\"); b := make([][]byte, len(rs)); for i, r := range rs { b[i] = []byte(r) }\n    r := findWords(b, strings.Split(p[1], \",\")); sort.Strings(r); fmt.Fprintln(w, strings.Join(r, \",\")) }\n}\n",
    'rust': "struct Solution;\n{SOL}\nuse std::io::{BufRead, Write};\nfn main() {\n  let o = std::io::stdout(); let mut w = std::io::BufWriter::new(o.lock());\n  for l in std::io::stdin().lock().lines() { let l = l.unwrap(); let (b, ws) = l.split_once('|').unwrap();\n    let board: Vec<Vec<char>> = b.split(';').map(|r| r.chars().collect()).collect(); let words: Vec<String> = ws.split(',').map(|s| s.to_string()).collect();\n    let mut r = Solution::find_words(board, words); r.sort(); writeln!(w, \"{}\", r.join(\",\")).unwrap(); }\n}\n",
}

SKIP = {'each': lambda c: c.count(';') >= 11 and c.count(',') >= 1000}


def on_board(board, word):
    m, n = len(board), len(board[0])
    if len(word) > m * n:
        return False

    def go(r, c, k, used):
        if board[r][c] != word[k]:
            return False
        if k == len(word) - 1:
            return True
        used |= 1 << (r * n + c)
        for x, y in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            if 0 <= x < m and 0 <= y < n and not used >> (x * n + y) & 1 and go(x, y, k + 1, used):
                return True
        return False

    return any(go(r, c, 0, 0) for r in range(m) for c in range(n))


def oracle(board, words):
    return ','.join(sorted(w for w in words if on_board(board, w)))


def rand_board(m, n, alpha):
    return [''.join(random.choice(alpha) for _ in range(n)) for _ in range(m)]


def path_word(board, length):
    m, n = len(board), len(board[0])
    r, c = random.randrange(m), random.randrange(n)
    seen, out = {(r, c)}, [board[r][c]]
    while len(out) < length:
        nxt = [(x, y) for x, y in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)) if 0 <= x < m and 0 <= y < n and (x, y) not in seen]
        if not nxt:
            break
        r, c = random.choice(nxt)
        seen.add((r, c))
        out.append(board[r][c])
    return ''.join(out)


def uniq(words):
    return list(dict.fromkeys(words))


def corpus():
    random.seed(212)
    ex1 = ['oaan', 'etae', 'ihkr', 'iflv']
    cases = [(ex1, ['oath', 'pea', 'eat', 'rain']), (['ab', 'cd'], ['abcb']),
             (['a'], ['a', 'b']), (['ab'], ['aba', 'abab']), (['aba'], ['aba', 'abab', 'aa']),
             (['ab', 'cd'], ['ab', 'abd', 'abdc', 'abdca']), (['abc', 'fed', 'ghi'], ['abcdefghi', 'adg', 'ihg']),
             (['aaa', 'aaa'], ['a', 'aa', 'aaaaaa', 'aaaaaaa'])]
    for _ in range(15000):
        alpha = random.choice(['ab', 'abc'])
        b = rand_board(random.randint(1, 4), random.randint(1, 4), alpha)
        ws = [path_word(b, random.randint(1, 6)) if random.random() < 0.6 else ''.join(random.choice(alpha) for _ in range(random.randint(1, 6)))
              for _ in range(random.randint(1, 8))]
        cases.append((b, uniq(ws)))
    for _ in range(5000):
        alpha = 'abcdef'[:random.randint(4, 6)]
        b = rand_board(random.randint(1, 8), random.randint(1, 8), alpha)
        ws = [path_word(b, random.randint(1, 10)) if random.random() < 0.5 else ''.join(random.choice(alpha) for _ in range(random.randint(1, 10)))
              for _ in range(random.randint(1, 60))]
        cases.append((b, uniq(ws)))
    abc = 'abcdefghijklmnopqrstuvwxyz'
    big = rand_board(12, 12, abc)
    cases.append((big, uniq(''.join(random.choice(abc) for _ in range(random.randint(1, 10))) for _ in range(30000))))
    cases.append((big, uniq(path_word(big, random.randint(1, 10)) for _ in range(30000))))
    cases.append((['a' * 12] * 12, ['a' * k for k in range(1, 11)] + ['a' * k + 'b' for k in range(0, 10)]))
    cases.append((['a' * 12] * 12, ['a' * 9 + x for x in abc[1:]]))
    stem = 'abcdefghi'
    cases.append((big, uniq(stem + random.choice(abc) for _ in range(30000))))
    return [(f"{';'.join(b)}|{','.join(ws)}", oracle(b, ws)) for b, ws in cases]
