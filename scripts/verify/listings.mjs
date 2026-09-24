// node scripts/verify/listings.mjs <slug> <outdir>
//
// Writes every code listing of a lesson to <outdir>/<mode>.<ext>, exactly as a
// reader would copy it from part 3 — decoded from the CODE table in the
// lesson's own lesson.js, so what gets run is what gets published.
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadLesson } from './lesson.mjs';

const [slug, out] = process.argv.slice(2);
if (!slug || !out) { console.error('usage: listings.mjs <slug> <outdir>'); process.exit(2); }
const cfg = await loadLesson(slug);
const ext = { ruby: 'rb', python: 'py', javascript: 'js', go: 'go', rust: 'rs' };
const decode = (s) => s.replace(/<[^>]*>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
mkdirSync(out, { recursive: true });
for (const [mode, byLang] of Object.entries(cfg.code))
  for (const [lang, lines] of Object.entries(byLang))
    writeFileSync(resolve(out, `${mode}.${ext[lang]}`), lines.map(([, h]) => decode(h)).join('\n') + '\n');
console.log(Object.keys(cfg.code).join(' '));
