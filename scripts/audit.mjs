// npm run audit [-- <slug> ...]
//
// Drives every built solution page in a real browser and checks what only a
// browser can see. Run it after `npm run build`; it serves dist/ itself.
//
//   · every approach × language × step highlights a line of code
//   · every preset loads without a warning
//   · every input field accepts the text it shows, and rejects junk
//   · no page errors
//   · nothing wider than the screen at 400px, in both page languages, for
//     every approach and code language
//   · a toned row in a key/value table is actually coloured (a later CSS
//     rule once turned every highlighted row grey)
//   · the home page loads, lists every lesson, and fits at 400px
//   · axe-core finds no WCAG 2 A/AA violation (contrast, labels, keyboard
//     access) on any page, in the light and the dark theme, at the first
//     step and partway through
//
// Exits 1 on any finding. Needs Chromium: `npx playwright install chromium`.
import { createServer } from 'node:http';
import { readdirSync, existsSync, readFileSync, statSync } from 'node:fs';
import { resolve, dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = resolve(ROOT, 'dist');
const AXE = readFileSync(resolve(ROOT, 'node_modules/axe-core/axe.min.js'), 'utf8');

/* WCAG 2 A and AA problems on the page as it stands, one line per rule. */
async function accessibility(page, where) {
  await page.addScriptTag({ content: AXE });
  const found = await page.evaluate(async () => (await window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa'] }))
    .violations.map((v) => `${v.id}: ${v.help} — ${v.nodes.length}× e.g. ${v.nodes[0].target.join(' ')}`));
  return found.map((x) => `a11y (${where}) ${x}`);
}

async function scrubTo(page, fraction) {
  await page.evaluate((f) => {
    const s = document.querySelector('#lesson [data-scrub]');
    s.value = String(Math.floor(Number(s.max) * f));
    s.dispatchEvent(new Event('input', { bubbles: true }));
  }, fraction);
}

const all = readdirSync(resolve(ROOT, 'src/lessons')).filter((d) => existsSync(resolve(ROOT, 'src/lessons', d, 'page.js'))).sort();
const only = process.argv.slice(2);
const slugs = only.length ? all.filter((s) => only.includes(s)) : all;
if (!existsSync(resolve(ROOT, 'dist/index.html'))) {
  console.error('no dist/ — run `npm run build` first');
  process.exit(1);
}

/* dist/ served as a static site: /x resolves to /x.html or /x/index.html. Its own
 * server rather than `astro preview`, which runs one instance per project. */
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml',
  '.json': 'application/json', '.png': 'image/png', '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.xml': 'application/xml' };
function serve() {
  const server = createServer((req, res) => {
    let file = join(DIST, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (!file.startsWith(DIST)) { res.writeHead(403).end(); return; }
    if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
    else if (!existsSync(file) && existsSync(`${file}.html`)) file = `${file}.html`;   // build.format 'file'
    if (!existsSync(file)) { res.writeHead(404).end('not found'); return; }
    res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
    res.end(readFileSync(file));
  });
  return new Promise((ok) => server.listen(0, '127.0.0.1', () => ok(server)));
}

/* Runs inside the page: step every frame of every approach × code language. */
async function stepEverything() {
  const wait = () => new Promise((r) => setTimeout(r, 0));
  const out = { frames: 0, noHot: [], presets: [], greyTone: [], fields: [] };
  const toneless = (el) => ![...el.classList].some((c) => c.startsWith('t-'));
  const plainRowBg = () => {
    const plain = [...document.querySelectorAll('#lesson .st-row:not(.head):not(.on)')].find(toneless);
    return plain ? getComputedStyle(plain).backgroundColor : null;
  };
  for (const mode of [...document.querySelectorAll('#lesson .atab')].map((b) => b.dataset.mode)) {
    document.querySelector(`#lesson .atab[data-mode="${mode}"]`).click(); await wait();
    for (const lang of [...document.querySelectorAll('#lesson .lang-bar.mini .lang')].map((b) => b.dataset.lang)) {
      document.querySelector(`#lesson .lang-bar.mini .lang[data-lang="${lang}"]`).click(); await wait();
      const scrub = document.querySelector('#lesson [data-scrub]');
      for (let i = 0; i <= Number(scrub.max); i++) {
        scrub.value = String(i); scrub.dispatchEvent(new Event('input', { bubbles: true })); await wait();
        out.frames++;
        if (!document.querySelector('#lesson .code .ln.hot')) out.noHot.push(`${mode}/${lang}/step ${i}`);
        const toned = document.querySelector('#lesson .st-row.t-up, #lesson .st-row.t-warn');
        const plain = plainRowBg();
        if (toned && plain && getComputedStyle(toned).backgroundColor === plain) out.greyTone.push(`${mode}/step ${i}`);
      }
    }
    // each field re-reads its own text without complaint, and flags garbage
    for (const el of document.querySelectorAll('#lesson [data-field]')) {
      const good = el.value;
      el.value = good; el.dispatchEvent(new Event('input', { bubbles: true })); await wait();
      const warn = document.querySelector('#lesson [data-warn]');
      if (el.classList.contains('bad')) out.fields.push(`${mode}: field ${el.dataset.field} rejects its own value "${good}": ${warn?.textContent}`);
      if (el.type !== 'number' && /^[-\d\s,\[\]null]*$/.test(good)) {   // number lists only: "@@" is a fine string
        el.value = '@@'; el.dispatchEvent(new Event('input', { bubbles: true })); await wait();
        if (!el.classList.contains('bad')) out.fields.push(`${mode}: field ${el.dataset.field} accepts "@@"`);
      }
      el.value = good; el.dispatchEvent(new Event('input', { bubbles: true })); await wait();
    }
    for (const chip of document.querySelectorAll('#lesson [data-preset]')) {
      chip.click(); await wait();
      const warn = document.querySelector('#lesson [data-warn]');
      if (warn && !warn.hidden) out.presets.push(`${mode}: "${chip.textContent.trim()}" → ${warn.textContent.trim()}`);
    }
  }
  return out;
}

/* Runs inside the page at 400px: the widest the page gets, anywhere. */
async function widestAt400() {
  const wait = () => new Promise((r) => setTimeout(r, 15));
  const found = [];
  for (const mode of [...document.querySelectorAll('#lesson .atab')].map((b) => b.dataset.mode)) {
    document.querySelector(`#lesson .atab[data-mode="${mode}"]`).click(); await wait();
    const scrub = document.querySelector('#lesson [data-scrub]');
    for (const lang of [...document.querySelectorAll('#lesson .lang-bar.mini .lang')].map((b) => b.dataset.lang)) {
      document.querySelector(`#lesson .lang-bar.mini .lang[data-lang="${lang}"]`).click(); await wait();
      for (const ui of ['en', 'my']) {
        document.querySelector(`[data-lang-opt="${ui}"]`).click(); await wait();
        for (const i of [0, Math.floor(Number(scrub.max) / 2), Number(scrub.max)]) {
          scrub.value = String(i); scrub.dispatchEvent(new Event('input', { bubbles: true })); await wait();
          const over = document.documentElement.scrollWidth - window.innerWidth;
          if (over > 0) found.push(`${mode}/${lang}/${ui}/step ${i}: ${over}px too wide`);
        }
      }
    }
  }
  document.querySelector('[data-lang-opt="en"]').click();
  return found;
}

async function main() {
  const server = await serve();
  const BASE = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch();
  const page = await browser.newPage();
  // Every page starts in English, whatever the last one switched to.
  await page.addInitScript(() => { try { localStorage.setItem('learn-lang', 'en'); } catch {} });
  let failures = 0;
  const report = (slug, problems) => {
    if (!problems.length) { console.log(`ok   ${slug}`); return; }
    failures += problems.length;
    console.log(`FAIL ${slug}`);
    for (const p of problems.slice(0, 8)) console.log(`       ${p}`);
    if (problems.length > 8) console.log(`       … and ${problems.length - 8} more`);
  };

  for (const slug of slugs) {
    const errors = [];
    const onError = (e) => errors.push(`page error: ${e.message}`);
    page.on('pageerror', onError);
    await page.setViewportSize({ width: 1300, height: 900 });
    await page.goto(`${BASE}/leetcode/${slug}`);
    await page.waitForSelector('#lesson .atab');
    const r = await page.evaluate(stepEverything);
    const a11y = [];
    for (const scheme of ['light', 'dark']) {
      await page.emulateMedia({ colorScheme: scheme });
      await page.goto(`${BASE}/leetcode/${slug}`);
      await page.waitForSelector('#lesson .atab');
      for (const f of [0, 0.35, 0.7, 1]) {
        await scrubTo(page, f);
        a11y.push(...await accessibility(page, `${scheme}, ${f === 0 ? 'first step' : f === 1 ? 'last step' : `${f * 100}% in`}`));
      }
    }
    await page.emulateMedia({ colorScheme: 'light' });
    await page.setViewportSize({ width: 400, height: 850 });
    await page.waitForTimeout(100);
    const wide = await page.evaluate(widestAt400);
    page.off('pageerror', onError);
    report(`${slug} (${r.frames} frames)`, [
      ...errors,
      ...r.noHot.map((x) => `no highlighted line: ${x}`),
      ...r.presets.map((x) => `preset warns: ${x}`),
      ...r.fields,
      ...r.greyTone.map((x) => `toned table row renders grey: ${x}`),
      ...wide,
      ...new Set(a11y),
    ]);
  }

  if (!only.length) {
    const errors = [];
    page.on('pageerror', (e) => errors.push(`page error: ${e.message}`));
    await page.setViewportSize({ width: 400, height: 850 });
    await page.goto(BASE);
    const home = await page.evaluate(() => ({
      over: document.documentElement.scrollWidth - window.innerWidth,
      links: [...document.querySelectorAll('a.ptitle')].map((a) => a.getAttribute('href')),
    }));
    const missing = slugs.filter((s) => !home.links.includes(`/leetcode/${s}`));
    const a11y = [];
    for (const scheme of ['light', 'dark']) {
      await page.setViewportSize({ width: 1300, height: 900 });
      await page.emulateMedia({ colorScheme: scheme });
      await page.goto(BASE);
      a11y.push(...await accessibility(page, scheme));
    }
    report('home page', [
      ...errors,
      ...(home.over > 0 ? [`${home.over}px too wide at 400px`] : []),
      ...missing.map((s) => `no link to /leetcode/${s}`),
      ...a11y,
    ]);
  }

  await browser.close();
  server.close();
  console.log(failures ? `\nFAILED — ${failures} finding(s)` : `\npassed — ${slugs.length} page(s)`);
  process.exit(failures ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
