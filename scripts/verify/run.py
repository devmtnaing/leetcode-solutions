#!/usr/bin/env python3
"""Run every code listing of a lesson, in all five languages, against its corpus.

    python3 scripts/verify/run.py <slug>              everything
    python3 scripts/verify/run.py <slug> --lang ruby  one language
    python3 scripts/verify/run.py <slug> --no-docker  skip Go and Rust

What it does, in order:

1. Loads verify/<slug>/spec.py, which defines
     DRIVERS   {lang: program text with {SOL} where the listing goes} — reads
               one case per line on stdin, prints one answer per line
     corpus()  -> [(case_line, expected_line), ...], built with an oracle that
               shares no code with the solutions
     SKIP      optional {mode: predicate(case_line)} for cases one approach is
               too slow for (say so on the page)
     BIG_STACK optional True: run Ruby and Node with a larger stack, for
               recursive listings the page already badges as overflowing the
               default one at the constraint
2. Writes the corpus to .verify-cache/<slug>/ and extracts the listings from the
   lesson's lesson.js — the text a reader copies, not a draft.
3. Runs each approach x language and compares line by line. Ruby, Python and
   JavaScript run locally; Go and Rust run in Docker (golang:1.23-alpine,
   rust:1-slim), so Docker must be running.
4. Runs the walkthrough check (steps.mjs) over the same corpus.

A language that could not run is reported as SKIPPED, never as passing.
"""
import argparse, importlib.util, os, shutil, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
EXT = {'ruby': 'rb', 'python': 'py', 'javascript': 'js', 'go': 'go', 'rust': 'rs'}


def command(lang, work, big_stack=False):
    if lang == 'ruby':
        return ['ruby', f'{work}/main.rb']
    if lang == 'python':
        return ['python3', f'{work}/main.py']
    if lang == 'javascript':
        return ['node'] + (['--stack-size=7800'] if big_stack else []) + [f'{work}/main.cjs']
    if lang == 'go':
        return ['docker', 'run', '--rm', '-i', '-v', f'{work}:/w', '-w', '/w', 'golang:1.23-alpine',
                'sh', '-c', 'go build -o m main.go && ./m']
    if lang == 'rust':
        return ['docker', 'run', '--rm', '-i', '-v', f'{work}:/w', '-w', '/w', 'rust:1-slim',
                'sh', '-c', 'rustc -O -o m main.rs 2>&1 >/dev/null | grep -E "^error" ; ./m']


def main():
    sys.stdout.reconfigure(line_buffering=True)   # keep our lines in order with the subprocesses'
    ap = argparse.ArgumentParser()
    ap.add_argument('slug')
    ap.add_argument('--lang', choices=list(EXT))
    ap.add_argument('--no-docker', action='store_true')
    args = ap.parse_args()

    spec_path = os.path.join(ROOT, 'verify', args.slug, 'spec.py')
    if not os.path.exists(spec_path):
        sys.exit(f'no verify/{args.slug}/spec.py — see CONTRIBUTING.md, "Verifying a lesson"')
    spec = importlib.util.spec_from_file_location('spec', spec_path)
    S = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(S)
    skip = getattr(S, 'SKIP', {})
    big_stack = getattr(S, 'BIG_STACK', False)

    cache = os.path.join(ROOT, '.verify-cache', args.slug)
    shutil.rmtree(cache, ignore_errors=True)
    os.makedirs(cache)
    corpus = S.corpus()
    with open(f'{cache}/cases.txt', 'w') as f:
        f.write(''.join(c + '\n' for c, _ in corpus))
    with open(f'{cache}/expected.txt', 'w') as f:
        f.write(''.join(e + '\n' for _, e in corpus))
    listings = f'{cache}/listings'
    modes = subprocess.run(['node', os.path.join(HERE, 'listings.mjs'), args.slug, listings],
                           check=True, capture_output=True, text=True).stdout.split()
    print(f'{args.slug}: {len(corpus)} cases, approaches: {" ".join(modes)}')
    if big_stack:
        print('Ruby and Node run with a larger stack (BIG_STACK) — the default one overflows, as the badges say')
    env = dict(os.environ, RUBY_THREAD_VM_STACK_SIZE='64000000') if big_stack else None

    docker = shutil.which('docker') and subprocess.run(['docker', 'info'], capture_output=True).returncode == 0
    failed = skipped = 0
    for mode in modes:
        todo = [(c, e) for c, e in corpus if not (mode in skip and skip[mode](c))]
        cases = ''.join(c + '\n' for c, _ in todo)
        for lang, ext in EXT.items():
            if args.lang and lang != args.lang:
                continue
            if lang in ('go', 'rust') and (args.no_docker or not docker):
                print(f'SKIPPED {mode}/{lang}: Docker is not running' if not args.no_docker else f'SKIPPED {mode}/{lang}')
                skipped += 1
                continue
            work = f'{cache}/run/{mode}-{lang}'
            os.makedirs(work)
            with open(f'{listings}/{mode}.{ext}') as f:
                solution = f.read()
            # .cjs: the repo's package.json says "type": "module", and drivers use require()
            main_name = 'main.cjs' if lang == 'javascript' else 'main.' + ext
            with open(f'{work}/{main_name}', 'w') as f:
                f.write(S.DRIVERS[lang].replace('{SOL}', solution))
            r = subprocess.run(command(lang, work, big_stack), input=cases, capture_output=True, text=True, env=env)
            got = r.stdout.split('\n')
            bad = [i for i, (_, e) in enumerate(todo) if i >= len(got) or got[i] != e]
            if bad:
                failed += 1
                i = bad[0]
                print(f'FAIL {mode}/{lang}: {len(bad)} of {len(todo)} wrong; first case #{i}: '
                      f'got {got[i] if i < len(got) else None!r}, want {todo[i][1]!r}')
                if r.stderr.strip():
                    print('   ' + r.stderr.strip()[-500:].replace('\n', '\n   '))
            else:
                print(f'ok   {mode}/{lang}: {len(todo)} cases')

    steps = subprocess.run(['node', os.path.join(HERE, 'steps.mjs'), args.slug,
                            f'{cache}/cases.txt', f'{cache}/expected.txt'])
    failed += steps.returncode != 0
    print(f'\n{"FAILED" if failed else "passed"}' + (f' ({skipped} skipped — not verified)' if skipped else ''))
    sys.exit(1 if failed else 0)


if __name__ == '__main__':
    main()
