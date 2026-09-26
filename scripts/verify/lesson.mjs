// Load a lesson's mountLesson() config in Node, without a browser.
//
// lesson.js calls mountLesson() at import time; with a stub DOM in place,
// stepper.js hands the config to globalThis.__LESSON_PROBE__ instead of
// mounting anything. The verifier and scripts/check-lessons.mjs both load
// lessons through here.
import { existsSync, readdirSync } from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
export const LESSONS = resolve(ROOT, 'src/lessons');

/** Every folder under src/lessons/ that holds a lesson.js. */
export const lessonSlugs = () => readdirSync(LESSONS, { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(resolve(LESSONS, d.name, 'lesson.js')))
  .map((d) => d.name);

export async function loadLesson(slug) {
  // Enough of a DOM for a lesson to reach its mountLesson call, and for
  // i18n's setLang() to run.
  globalThis.document ??= {
    getElementById: () => null, addEventListener() {}, querySelector: () => null, querySelectorAll: () => [],
    documentElement: { setAttribute() {} },
  };
  globalThis.window ??= globalThis;
  let cfg = null;
  globalThis.__LESSON_PROBE__ = (c) => { cfg = c; };
  await import(pathToFileURL(resolve(LESSONS, slug, 'lesson.js')).href);
  if (!cfg) throw new Error(`${slug}: lesson.js never called mountLesson`);
  return cfg;
}
