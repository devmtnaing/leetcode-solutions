// node scripts/verify/steps.mjs <slug> <cases.txt> <expected.txt>
//
// Runs every approach's step generator — the walkthrough itself — over the
// corpus, draws every frame, and checks the last frame's answer against the
// expected output. If the animation and the answer disagree, the animation is
// lying to the reader. verify/<slug>/adapter.mjs turns a corpus line into the
// lesson's input (or null to skip inputs too big for the stage) and a final
// step into an answer string in the corpus's format.
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { loadLesson, ROOT } from './lesson.mjs';

const [slug, casesPath, expectedPath] = process.argv.slice(2);
const cfg = await loadLesson(slug);
const A = await import(pathToFileURL(resolve(ROOT, 'verify', slug, 'adapter.mjs')).href);
const cases = readFileSync(casesPath, 'utf8').split('\n').slice(0, -1);
const expected = readFileSync(expectedPath, 'utf8').split('\n');

let bad = 0;
for (const mode of cfg.modes) {
  let n = 0, fails = 0, frames = 0;
  for (const [i, line] of cases.entries()) {
    const input = A.input(line);
    if (!input) continue;
    const steps = mode.build(structuredClone(input));
    frames += steps.length; n++;
    for (const s of steps) { cfg.draw(s, input); cfg.strip?.(s, input); cfg.answer?.(s, input); cfg.vars?.(s, input); }
    const got = A.answer(steps.at(-1), input);
    if (got !== expected[i] && fails++ < 3) console.log(`  ${mode.id} case ${i}: got ${got}, want ${expected[i]}`);
  }
  bad += fails;
  console.log(`${fails ? 'FAIL' : 'ok  '} walkthrough ${mode.id}: ${n} inputs, ${frames} frames drawn, ${fails} disagree`);
}
process.exit(bad ? 1 : 0);
