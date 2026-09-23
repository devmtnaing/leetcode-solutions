/* Small helpers every kit lesson uses.
 *
 * These used to be re-declared at the top of each lesson.js; they live here so
 * a lesson is only its own algorithm, drawing and prose. Anything that renders
 * markup returns an HTML string styled by kit.css — no inline styles.
 */

/** A reader-facing sentence in both languages; `pick()` chooses the side. */
export const t = (en, my) => ({ en, my });

/** "1 node", "3 nodes". English only — Burmese needs no plural. */
export const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

/** The title of LeetCode's worked example n, for example cards and presets. */
export const exampleTitle = (n) => t(`Example ${n}`, `ဥပမာ ${n}`);

/** Every lesson ships the same five languages, in this order. */
export const LANGUAGES = [
  { id: 'ruby', name: 'Ruby' }, { id: 'python', name: 'Python' },
  { id: 'javascript', name: 'JavaScript' }, { id: 'go', name: 'Go' }, { id: 'rust', name: 'Rust' },
];

/* Code-listing tokens: a keyword and a comment. Listings are HTML strings, so
 * anything with < > & must already be escaped by the caller. */
export const k = (s) => `<span class="k">${s}</span>`;
export const c = (s) => `<span class="c">${s}</span>`;

/**
 * The answer card for a yes/no problem: an empty card with `pending` as its
 * note until a verdict exists, then a coloured true / false.
 */
export function verdictAnswer(verdict, { yes, no, pending }) {
  if (verdict == null) return { html: '', note: pending };
  return {
    html: verdict ? '<strong class="verdict yes">true</strong>' : '<strong class="verdict no">false</strong>',
    note: verdict ? yes : no,
  };
}

/**
 * A row of cells inside the stage. Unlike the strip card it wraps instead of
 * scrolling, and an empty row shows `empty` rather than nothing.
 */
export const stageRow = (html, empty) => (html
  ? (html.startsWith('<div class="strip') ? html : `<div class="strip wraps">${html}</div>`)
  : `<p class="note mono stage-empty">${empty}</p>`);

/** Vertical space between two blocks inside the stage. */
export const stageGap = '<div class="stage-gap"></div>';

/**
 * Several labelled rows in the strip card, for problems with more than one
 * input sequence (two strings, two lists). `rows` is [[label, html], ...].
 */
export const labelledRows = (rows) => `<div class="rows">${rows
  .map(([label, html]) => `<div class="row"><span class="row-label">${label}</span>${html}</div>`)
  .join('')}</div>`;
