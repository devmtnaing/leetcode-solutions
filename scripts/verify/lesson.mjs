// Load a lesson's mountLesson() config in Node, without a browser.
//
// lesson.js calls mountLesson() at import time; with a stub DOM in place,
// stepper.js hands the config to globalThis.__LESSON_PROBE__ instead of
// mounting anything. scripts/check-lessons.mjs uses the same trick.
import { pathToFileURL } from 'node:url';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

export async function loadLesson(slug) {
  globalThis.document ??= { getElementById: () => null, addEventListener() {}, querySelector: () => null };
  globalThis.window ??= globalThis;
  let cfg = null;
  globalThis.__LESSON_PROBE__ = (c) => { cfg = c; };
  await import(pathToFileURL(resolve(ROOT, 'src/lessons', slug, 'lesson.js')).href);
  if (!cfg) throw new Error(`${slug}: lesson.js never called mountLesson`);
  return cfg;
}
