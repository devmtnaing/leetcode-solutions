#!/usr/bin/env python3
"""Run every code listing of a lesson, in all five languages, against its corpus.

    python3 scripts/verify/run.py <slug>              everything
    python3 scripts/verify/run.py <slug> --lang ruby  one language
    python3 scripts/verify/run.py <slug> --no-docker  skip Go and Rust
    python3 scripts/verify/run.py <slug> --strict     a skipped language fails the run (CI)
    python3 scripts/verify/run.py <slug> --from DIR   run listing files (brute.rb, …)
                                                      before they are in lesson.js;
                                                      their ⟦key⟧ markers are stripped

What it does, in order:

1. Loads verify/<slug>/spec.py, which defines
     DRIVERS   {lang: program text with {SOL} where the listing goes} — reads
               one case per line on stdin, prints one answer per line
     corpus()  -> [(case_line, expected_line), ...], built with an oracle that
               shares no code with the solutions
     SKIP      optional {mode: predicate(case_line)} for cases one approach is
               too slow for (say so on the page)
     BIG_STACK optional True: run Ruby and Node with a larger stack (and a
               64 MB OS stack limit), for
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
import argparse, importlib.util, os, re, shutil, subprocess, sys
from concurrent.futures import ThreadPoolExecutor

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
EXT = {'ruby': 'rb', 'python': 'py', 'javascript': 'js', 'go': 'go', 'rust': 'rs'}


def command(lang, work, big_stack=False):
    if lang == 'ruby':
        return ['ruby', f'{work}/main.rb']
    if lang == 'python':
        return ['python3', f'{work}/main.py']
    if lang == 'javascript':
        return ['node'] + (['--stack-size=16000'] if big_stack else []) + [f'{work}/main.cjs']
    if lang == 'go':   # the build cache outlives the container, so the standard library compiles once
        return ['docker', 'run', '--rm', '-i', '-v', f'{work}:/w', '-v', 'leetcode-go-build:/root/.cache/go-build',
                '-w', '/w', 'golang:1.23-alpine',
                'sh', '-c', 'go build -o m main.go && ./m']
    if lang == 'rust':
        return ['docker', 'run', '--rm', '-i', '-v', f'{work}:/w', '-w', '/w', 'rust:1-slim',
                'sh', '-c', 'rustc -O -o m main.rs 2>&1 >/dev/null | grep -E "^error" ; ./m']


def raise_stack():
    """For BIG_STACK: let the child's main thread grow to 64 MB. Node's
    --stack-size only moves V8's own limit; past the OS limit (8 MB by default)
    the process segfaults with no output instead of throwing."""
    import resource
    soft, hard = resource.getrlimit(resource.RLIMIT_STACK)
    want = 64 << 20 if hard == resource.RLIM_INFINITY else min(hard, 64 << 20)
    if soft != resource.RLIM_INFINITY and soft < want:
        resource.setrlimit(resource.RLIMIT_STACK, (want, hard))


def main():
    sys.stdout.reconfigure(line_buffering=True)   # keep our lines in order with the subprocesses'
    ap = argparse.ArgumentParser()
    ap.add_argument('slug')
    ap.add_argument('--lang', choices=list(EXT))
    ap.add_argument('--no-docker', action='store_true')
    ap.add_argument('--strict', action='store_true', help='fail if any language could not run')
    ap.add_argument('--from', dest='source', help='a folder of <mode>.<ext> listings to run instead of lesson.js')
    args = ap.parse_args()

    spec_path = os.path.join(ROOT, 'verify', args.slug, 'spec.py')
    if not os.path.exists(spec_path):
        sys.exit(f'no verify/{args.slug}/spec.py — see CONTRIBUTING.md, "6. Verify"')
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
    if args.source:
        listings = os.path.abspath(args.source)
        modes = sorted({f.rsplit('.', 1)[0] for f in os.listdir(listings) if f.rsplit('.', 1)[-1] in EXT.values()})
    else:
        listings = f'{cache}/listings'
        modes = subprocess.run(['node', os.path.join(HERE, 'listings.mjs'), args.slug, listings],
                               check=True, capture_output=True, text=True).stdout.split()
    print(f'{args.slug}: {len(corpus)} cases, approaches: {" ".join(modes)}')
    if big_stack:
        print('Ruby and Node run with a larger stack (BIG_STACK) — the default one overflows, as the badges say')
    env = dict(os.environ, RUBY_THREAD_VM_STACK_SIZE='64000000') if big_stack else None

    wants_docker = not args.no_docker and args.lang in (None, 'go', 'rust')
    docker = wants_docker and shutil.which('docker') and subprocess.run(['docker', 'info'], capture_output=True).returncode == 0

    # Each approach x language is its own process with its own folder, so they
    # run side by side; results print in the same order as one at a time.
    # preexec_fn is not thread-safe, so a BIG_STACK lesson runs them in turn.
    def run_one(mode, lang, todo, cases):
        ext = EXT[lang]
        work = f'{cache}/run/{mode}-{lang}'
        os.makedirs(work)
        with open(f'{listings}/{mode}.{ext}') as f:
            solution = f.read()
        if args.source:   # listing files still carry their ⟦key⟧ markers
            solution = re.sub(r' ⟦\w+⟧$', '', solution, flags=re.M)
        # .cjs: the repo's package.json says "type": "module", and drivers use require()
        main_name = 'main.cjs' if lang == 'javascript' else 'main.' + ext
        with open(f'{work}/{main_name}', 'w') as f:
            f.write(S.DRIVERS[lang].replace('{SOL}', solution))
        r = subprocess.run(command(lang, work, big_stack), input=cases, capture_output=True, text=True, env=env,
                           preexec_fn=raise_stack if big_stack and lang in ('ruby', 'javascript') else None)
        got = r.stdout.split('\n')
        bad = [i for i, (_, e) in enumerate(todo) if i >= len(got) or got[i] != e]
        if not bad:
            return False, f'ok   {mode}/{lang}: {len(todo)} cases'
        i = bad[0]
        msg = (f'FAIL {mode}/{lang}: {len(bad)} of {len(todo)} wrong; first case #{i}: '
               f'got {got[i] if i < len(got) else None!r}, want {todo[i][1]!r}')
        if r.stderr.strip():
            msg += '\n   ' + r.stderr.strip()[-500:].replace('\n', '\n   ')
        return True, msg

    failed = skipped = 0
    jobs = []   # in print order: a finished message, or a future
    with ThreadPoolExecutor(max_workers=1 if big_stack else os.cpu_count() or 4) as pool:
        for mode in modes:
            todo = [(c, e) for c, e in corpus if not (mode in skip and skip[mode](c))]
            cases = ''.join(c + '\n' for c, _ in todo)
            for lang in EXT:
                if args.lang and lang != args.lang:
                    continue
                if lang in ('go', 'rust') and (args.no_docker or not docker):
                    jobs.append(f'SKIPPED {mode}/{lang}: Docker is not running' if not args.no_docker else f'SKIPPED {mode}/{lang}')
                    skipped += 1
                    continue
                jobs.append(pool.submit(run_one, mode, lang, todo, cases))
        # the walkthrough lives in lesson.js, which --from bypasses
        steps = None if args.source else subprocess.Popen(
            ['node', os.path.join(HERE, 'steps.mjs'), args.slug, f'{cache}/cases.txt', f'{cache}/expected.txt'],
            stdout=subprocess.PIPE, text=True)
        for job in jobs:
            if isinstance(job, str):
                print(job)
                continue
            bad, msg = job.result()
            failed += bad
            print(msg)
    if steps:
        print(steps.communicate()[0], end='')
        failed += steps.returncode != 0
    if args.strict and skipped:
        failed += 1
        print(f'\n{skipped} language run(s) skipped, and --strict counts a skip as a failure')
    print(f'\n{"FAILED" if failed else "passed"}' + (f' ({skipped} skipped — not verified)' if skipped else ''))
    sys.exit(1 if failed else 0)


if __name__ == '__main__':
    main()
