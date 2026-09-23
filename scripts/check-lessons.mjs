/* Structural check across every lesson built on the kit.
 *
 * Catches the mistakes that a build will happily compile and a reader will
 * immediately notice: a step highlighting a line key no language actually has,
 * a listing that is missing in one of the five languages, a draw() that throws
 * on some frame, a narration that renders as "undefined".
 *
 *   node scripts/check-lessons.mjs            all lessons
 *   node scripts/check-lessons.mjs two-sum    just one
 *
 * Exits non-zero if anything fails, so it can gate a commit.
 */
import { readdirSync, existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const LESSONS = resolve('src/lessons');
const only = process.argv[2];
const slugs = readdirSync(LESSONS, { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(resolve(LESSONS, d.name, 'lesson.js')))
  .map((d) => d.name)
  .filter((s) => !only || s === only);

// Enough of a DOM for a lesson to reach its mountLesson call and stop there.
globalThis.document = { getElementById: () => null, addEventListener() {}, querySelector: () => null };
globalThis.window = globalThis;

let failures = 0;
const fail = (slug, msg) => { failures++; console.log(`  FAIL  ${slug}: ${msg}`); };

for (const slug of slugs) {
  let cfg = null;
  globalThis.__LESSON_PROBE__ = (c) => { cfg = c; };
  try {
    await import(pathToFileURL(resolve(LESSONS, slug, 'lesson.js')).href);
  } catch (err) {
    fail(slug, `import threw — ${err.message}`);
    continue;
  }
  if (!cfg) { fail(slug, 'never called mountLesson'); continue; }

  const langs = cfg.languages.map((l) => l.id);
  const notes = [];

  for (const mode of cfg.modes) {
    const listings = cfg.code[mode.id];
    if (!listings) { fail(slug, `no CODE for mode "${mode.id}"`); continue; }

    // every language present, and every language offering the same line keys
    const keysByLang = {};
    for (const lang of langs) {
      if (!listings[lang]) { fail(slug, `mode "${mode.id}" has no ${lang} listing`); continue; }
      keysByLang[lang] = new Set(listings[lang].map(([k]) => k).filter(Boolean));
    }
    const base = keysByLang[langs[0]];
    for (const lang of langs.slice(1)) {
      if (!keysByLang[lang]) continue;
      const missing = [...base].filter((k) => !keysByLang[lang].has(k));
      const extra = [...keysByLang[lang]].filter((k) => !base.has(k));
      if (missing.length) fail(slug, `${mode.id}/${lang} is missing line keys: ${missing.join(', ')}`);
      if (extra.length) fail(slug, `${mode.id}/${lang} has line keys no other language has: ${extra.join(', ')}`);
    }

    // run the generator and check every frame
    let steps;
    try {
      steps = mode.build(structuredClone(cfg.input));
    } catch (err) {
      fail(slug, `${mode.id}.build threw — ${err.message}`);
      continue;
    }
    if (!steps?.length) { fail(slug, `${mode.id} produced no steps`); continue; }

    const used = new Set(steps.map((s) => s.line).filter(Boolean));
    const unknown = [...used].filter((k) => !base.has(k));
    if (unknown.length) fail(slug, `${mode.id} steps highlight keys no listing has: ${unknown.join(', ')}`);
    const unused = [...base].filter((k) => !used.has(k));

    for (const [i, s] of steps.entries()) {
      // A note may be a plain string or an { en, my } pair; check both sides.
      const sides = s.note == null ? []
        : typeof s.note === 'string' ? [s.note]
        : [s.note.en, s.note.my].filter(Boolean);
      if (!sides.length) { fail(slug, `${mode.id} step ${i} has no narration`); break; }
      const bad = sides.find((x) => /undefined|NaN|\[object Object\]/.test(x));
      if (bad) { fail(slug, `${mode.id} step ${i} narration reads "${bad.slice(0, 60)}"`); break; }
      if (typeof s.note === 'object' && !s.note.en) {
        fail(slug, `${mode.id} step ${i} has a Burmese note with no English side`); break;
      }
      let html;
      try { html = cfg.draw(s, cfg.input); }
      catch (err) { fail(slug, `${mode.id} draw threw on step ${i} — ${err.message}`); break; }
      if (!html) { fail(slug, `${mode.id} draw returned nothing on step ${i}`); break; }
      if (/undefined|NaN|\[object Object\]/.test(html)) {
        fail(slug, `${mode.id} draw output contains undefined/NaN on step ${i}`); break;
      }
      if (cfg.vars) {
        try { cfg.vars(s, cfg.input); }
        catch (err) { fail(slug, `${mode.id} vars threw on step ${i} — ${err.message}`); break; }
      }
    }
    notes.push(`${mode.id} ${steps.length} steps${unused.length ? `, ${unused.length} line(s) never highlighted` : ''}`);
  }

  if (!existsSync(resolve(LESSONS, slug, 'statement.html'))) fail(slug, 'no statement.html');
  if (!existsSync(resolve(`src/pages/leetcode/${slug}.astro`))) fail(slug, `no page at src/pages/leetcode/${slug}.astro`);

  console.log(`${failures ? ' ' : '  ok'}  ${slug.padEnd(34)} ${notes.join(' · ')}`);
}

console.log(`\n${slugs.length} lesson(s), ${failures} failure(s)`);
process.exit(failures ? 1 : 0);
