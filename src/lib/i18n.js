/* English / မြန်မာ switching, shared by every lesson.
 *
 * The rule the page follows — settled while building the x-sum page — is that
 * only what reads naturally in Burmese gets translated. Problem titles,
 * algorithm names and terms of art (hash map, stack, XOR, sliding window) stay
 * in English, because the calque is worse than the loan word and a reader
 * searching for the term needs the English anyway.
 *
 * Two things need translating and they work differently:
 *
 *   Static chrome — headings, labels, button text. Marked `data-i18n` in the
 *   markup and swapped in place.
 *
 *   Generated text — step narration, built at run time with values spliced in.
 *   A lesson writes those as { en, my } and `pick()` chooses; a missing `my`
 *   falls back to English rather than showing a key or an empty frame.
 */

const KEY = 'learn-lang';
const subs = new Set();

export let lang = 'en';

// The first page stored the choice under its own key; readers who chose a
// language there still have it. Read either, write both.
const LEGACY_KEY = 'xsum-ui';
try {
  const saved = localStorage.getItem(KEY) ?? localStorage.getItem(LEGACY_KEY);
  if (saved === 'my' || saved === 'en') lang = saved;
} catch {}

/** Choose the right side of an { en, my } pair, or pass a plain string through. */
export function pick(value) {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  return value[lang] ?? value.en ?? '';
}

export function setLang(next) {
  if (next !== 'en' && next !== 'my') return;
  lang = next;
  document.documentElement.setAttribute('data-ui', next);
  try { localStorage.setItem(KEY, next); localStorage.setItem(LEGACY_KEY, next); } catch {}
  applyStatic();
  document.querySelectorAll('[data-lang-opt]').forEach((b) =>
    b.setAttribute('aria-pressed', String(b.dataset.langOpt === next)));
  subs.forEach((fn) => fn(next));
}

/** Re-render when the language changes. The stepper uses this. */
export function onLangChange(fn) { subs.add(fn); return () => subs.delete(fn); }

/* Static chrome. Each element keeps its English in `data-i18n-en` the first
   time it is seen, so switching back is lossless even after several swaps. */
function applyStatic() {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    if (!el.dataset.i18nEn) el.dataset.i18nEn = el.innerHTML;
    const my = el.dataset.i18n;
    el.innerHTML = lang === 'my' && my ? my : el.dataset.i18nEn;
  });
}

export function initLangSwitch() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-lang-opt]');
    if (btn) setLang(btn.dataset.langOpt);
  });
  setLang(lang);
}
