#!/usr/bin/env python3
"""Turn solution files into a lesson's CODE table, so listings are generated, not retyped.

    python3 scripts/verify/code-table.py <dir> <mode,mode,...>  >  code.js

<dir> holds one file per approach and language — brute.rb, brute.py, brute.js,
brute.go, brute.rs, hash.rb, ... Mark the line a walkthrough step highlights
by ending it with a space and ⟦key⟧:

    counts[x] += 1 ⟦tally⟧

The same keys must appear in every language of an approach (check-lessons
enforces it). The output is a `const CODE = {...}` block to paste into
lesson.js: each line becomes [key or null, html], keywords wrapped in k() and
a trailing comment in c(). The markers are stripped, so the listing a reader
copies is the file you ran, byte for byte — run.py re-extracts it from
lesson.js to prove that.

Comments are found by the first '#' (Ruby, Python) or '//' (JS, Go, Rust) on a
line, so a line with one inside a string literal needs a hand fix.
"""
import json, pathlib, re, sys

LANG = {'rb': 'ruby', 'py': 'python', 'js': 'javascript', 'go': 'go', 'rs': 'rust'}
COMMENT = {'rb': '#', 'py': '#', 'js': '//', 'go': '//', 'rs': '//'}
KEYWORDS = {
    'rb': 'def end return if unless until while nil do else'.split(),
    'py': 'class def return if is None while from import not for in nonlocal else'.split(),
    'js': 'var const let function return if for null else while of new'.split(),
    'go': 'func return if for nil var range else'.split(),
    'rs': 'use impl pub fn let mut match return if while Some None Self for in else'.split(),
}
ORDER = ['ruby', 'python', 'javascript', 'go', 'rust']


def escape(s):
    return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('`', '\\`').replace('${', '\\${')


def highlight(line, ext):
    code, comment = line, ''
    i = line.find(COMMENT[ext])
    if i >= 0:
        code, comment = line[:i], line[i:]
    code = re.sub(r'(?<![\w.:])(' + '|'.join(map(re.escape, KEYWORDS[ext])) + r')(?![\w?])',
                  r"${k('\1')}", escape(code))
    return code + (f"${{c('{escape(comment)}')}}" if comment else '')


def main():
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    root, modes = pathlib.Path(sys.argv[1]), sys.argv[2].split(',')
    code = {}
    for f in sorted(root.glob('*.*')):
        if f.suffix[1:] not in LANG:
            continue
        rows = []
        for line in f.read_text().rstrip('\n').split('\n'):
            m = re.search(r' ⟦(\w+)⟧$', line)
            rows.append((m.group(1) if m else None, highlight(line[:m.start()] if m else line, f.suffix[1:])))
        code.setdefault(f.stem, {})[LANG[f.suffix[1:]]] = rows
    out = ['const CODE = {']
    for mode in modes:
        if mode not in code:
            sys.exit(f'no files for approach "{mode}" in {root}')
        out.append(f'  {mode}: {{')
        for lang in ORDER:
            if lang not in code[mode]:
                sys.exit(f'approach "{mode}" has no {lang} file')
            out.append(f'    {lang}: [')
            for key, html in code[mode][lang]:
                out.append(f"      [{json.dumps(key).replace(chr(34), chr(39)) if key else 'null'}, `{html}`],")
            out.append('    ],')
        out.append('  },')
    out.append('};')
    print('\n'.join(out))


if __name__ == '__main__':
    main()
