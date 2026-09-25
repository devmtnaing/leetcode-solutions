"""Longest Substring Without Repeating Characters — the corpus the badges describe.

The 3 examples, 7 edges (the empty string, a space, "abba", "dvdf",
"tmmzuxt", all 95 printable characters, and 95 of them twice), 15,000 random
strings of up to 10 characters from "abc", 5,000 of up to 40 from a dozen
characters including a space, and five at n = 5 × 10⁴ (random printable
characters, one letter repeated, two letters, the 95 printable characters
cycled, and a random run of letters and spaces). A line is the string
itself, spaces included; an empty line is the empty string.

The oracle keeps a count per character and shrinks from the left while any
count is above 1 — a different mechanism from both listings.
"""
import random
import string

PRINTABLE = ''.join(chr(c) for c in range(32, 127))

DRIVERS = {
    'ruby': "{SOL}\nSTDIN.each_line { |l| puts length_of_longest_substring(l.chomp(\"\\n\")) }\n",
    'python': "{SOL}\nimport sys\nsol = Solution()\nprint('\\n'.join(str(sol.lengthOfLongestSubstring(l)) for l in sys.stdin.read().split('\\n')[:-1]))\n",
    'javascript': "{SOL}\nconst L = require('fs').readFileSync(0, 'utf8').split('\\n'); L.pop();\nconsole.log(L.map((l) => String(lengthOfLongestSubstring(l))).join('\\n'));\n",
    'go': "package main\nimport (\"bufio\"; \"fmt\"; \"os\")\n{SOL}\nfunc main() {\n  sc := bufio.NewScanner(os.Stdin); sc.Buffer(make([]byte, 1<<24), 1<<24)\n  w := bufio.NewWriter(os.Stdout); defer w.Flush()\n  for sc.Scan() { fmt.Fprintln(w, lengthOfLongestSubstring(sc.Text())) }\n}\n",
    'rust': "struct Solution;\n{SOL}\nuse std::io::{BufRead, Write};\nfn main() {\n  let o = std::io::stdout(); let mut w = std::io::BufWriter::new(o.lock());\n  for l in std::io::stdin().lock().lines() { writeln!(w, \"{}\", Solution::length_of_longest_substring(l.unwrap())).unwrap(); }\n}\n",
}


def oracle(s):
    count = {}
    best = lo = 0
    for hi, ch in enumerate(s):
        count[ch] = count.get(ch, 0) + 1
        while count[ch] > 1:
            count[s[lo]] -= 1
            lo += 1
        best = max(best, hi - lo + 1)
    return best


def corpus():
    random.seed(3)
    cases = ['abcabcbb', 'bbbbb', 'pwwkew', '', ' ', 'abba', 'dvdf', 'tmmzuxt', PRINTABLE, PRINTABLE * 2]
    cases += [''.join(random.choice('abc') for _ in range(random.randint(0, 10))) for _ in range(15000)]
    cases += [''.join(random.choice('abcdefgh xyz') for _ in range(random.randint(0, 40))) for _ in range(5000)]
    n = 5 * 10**4
    cases += [''.join(random.choice(PRINTABLE) for _ in range(n)), 'q' * n,
              ''.join(random.choice('ab') for _ in range(n)), (PRINTABLE * (n // 95 + 1))[:n],
              ''.join(random.choice(string.ascii_letters + ' ') for _ in range(n))]
    for c in cases:
        assert '\n' not in c
    return [(c, str(oracle(c))) for c in cases]
