/* Small helpers every kit lesson uses.
 *
 * These used to be re-declared at the top of each lesson.js; they live here so
 * a lesson is only its own algorithm, drawing and prose. Anything that renders
 * markup returns an HTML string styled by kit.css — no inline styles.
 */

import { pick } from './i18n.js';

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

/* ---------- input parsers ----------
 * A control's parse() gets the field's text and returns the value, or throws
 * an Error whose message the stepper shows under the field. */

/**
 * A list of integers: "1, 2, 3", "[1,2,3]" or "1 2 3".
 *   min, max   how many values (max keeps the stage readable)
 *   lo, hi     the range each value must fall in
 *   distinct   no value twice
 *   check      (list) => void, for a lesson's own rule; throw to reject
 * Nothing is silently trimmed: too many values is an error, not a cut.
 */
export function intList({ min = 1, max = 12, lo = -Infinity, hi = Infinity, distinct = false, why = 'so the stage stays readable', check } = {}) {
  return (text) => {
    const s = String(text).trim().replace(/^\[|\]$/g, '').trim();
    const list = s ? s.split(/[\s,]+/).filter(Boolean).map((v) => {
      const n = Number(v);
      if (!Number.isInteger(n)) throw new Error('integers, separated by commas');
      if (n < lo || n > hi) throw new Error(hi === Infinity ? `values are at least ${lo}` : lo === -Infinity ? `values are at most ${hi}` : `values run from ${lo} to ${hi}`);
      return n;
    }) : [];
    if (list.length < min) throw new Error(min === 1 ? 'at least one value' : `at least ${min} values`);
    if (list.length > max) throw new Error(`at most ${max} values, ${why}`);
    if (distinct && new Set(list).size !== list.length) throw new Error('each value only once');
    check?.(list);
    return list;
  };
}

/** One integer, between lo and hi. `why` explains a cap the lesson imposes. */
export function intValue({ lo = -Infinity, hi = Infinity, why = '' } = {}) {
  return (text) => {
    const v = String(text).trim();
    const n = Number(v);
    if (v === '' || !Number.isInteger(n)) throw new Error('a whole number');
    if (n < lo) throw new Error(`at least ${lo}`);
    if (n > hi) throw new Error(`at most ${hi}${why ? `: ${why}` : ''}`);
    return n;
  };
}

/** A list as the text a control shows: [1, 2, 3] → "1, 2, 3". */
export const listText = (a) => a.join(', ');

/* ---------- part 1 widget pieces ---------- */

/** The widget's preset chips; `sets` are { label }, `active` the chosen index. */
export const presetChips = (sets, active) => sets.map((x, i) =>
  `<button class="chip" data-set="${i}"${i === active ? ' aria-pressed="true"' : ''}>${pick(x.label)}</button>`).join('');

/** The note at the right of the widget's heading. */
export function widgetLabel(text) {
  const el = document.getElementById('q-label');
  if (el) el.textContent = text;
}
