/* Shapes the stage can draw.
 *
 * Fifteen easy problems turn out to need six pictures between them: a row of
 * cells, a key/value table, a stack, a linked list, a binary tree, and a bar
 * chart. Each function here takes plain data and returns an HTML string, so a
 * lesson's draw() is usually one or two calls and a wrapper div.
 *
 * Every one takes the same optional decorations:
 *   at    index (or key) to highlight as the element being looked at
 *   marks {index: 'label'} — pointer flags under a cell
 *   tone  {index: 'up'|'down'|'warn'|'done'} — per-cell colour
 */

import { esc } from './stepper.js';

const tones = (t) => (t ? ` t-${t}` : '');

/* A row of boxed values: arrays, strings, anything indexed. */
export function strip(items, o = {}) {
  const { at, marks = {}, tone = {}, index = true, label } = o;
  const cells = items
    .map((v, i) => {
      const on = at === i ? ' on' : '';
      const dim = o.dim && o.dim.includes(i) ? ' dim' : '';
      return `<div class="st-cell${on}${dim}${tones(tone[i])}">
        <span class="st-val">${esc(v)}</span>
        ${index ? `<span class="st-idx">${i}</span>` : ''}
        ${marks[i] ? `<span class="st-mark">${esc(marks[i])}</span>` : ''}
      </div>`;
    })
    .join('');
  return box(label, `<div class="st-strip">${cells || '<span class="st-empty">empty</span>'}</div>`);
}

/* The array strip, as .cell markup (styled by lesson.css). `tone` takes the
 * cell states every page uses:
 *   inwin    amber — the element(s) being looked at
 *   entering green — the element that just joined, or that matched
 *   leaving  red, dashed — the element that just dropped out, or failed
 *   done     faded — already settled, out of play
 * `marks` puts a pointer label (i, j, slow, fast…) under a cell. */
export function cells(items, o = {}) {
  const { tone = {}, marks = {}, index = true } = o;
  const hasMarks = Object.keys(marks).length > 0;
  const html = items.map((v, i) => `<div class="cell${tone[i] ? ` ${tone[i]}` : ''}">
      <span>${esc(v)}</span>${index ? `<span class="idx">${i}</span>` : ''}${
      marks[i] ? `<span class="ptr">${esc(marks[i])}</span>` : ''}</div>`).join('');
  return hasMarks ? `<div class="strip has-ptr">${html}</div>` : html;
}

/* The answer card's slots: filled ones hold a value, `just` marks the one
 * this step wrote. */
export function slots(values, o = {}) {
  const { total = values.length, just = -1 } = o;
  let html = '';
  for (let i = 0; i < total; i++) {
    const filled = i < values.length;
    html += `<span class="slot${filled ? ' filled' : ''}${i === just ? ' just' : ''}">${filled ? esc(values[i]) : '·'}</span>`;
  }
  return html;
}

/* A titled block inside the stage panel, in the page's panel-head style. */
export function stagePanel(title, note, inner) {
  return `<div class="panel-head"><h2>${esc(title)}</h2>${note ? `<span class="note">${esc(note)}</span>` : ''}</div>${inner}`;
}

/* A key/value table: hash maps, counters, memo tables. */
export function kv(pairs, o = {}) {
  const { at, tone = {}, label, keyName = 'key', valName = 'value' } = o;
  const entries = Object.entries(pairs);
  if (!entries.length) return box(label, `<div class="st-kv empty"><span class="st-empty">empty</span></div>`);
  const rows = entries
    .map(([k, v]) => `<div class="st-row${at === k ? ' on' : ''}${tones(tone[k])}">
        <span class="st-k">${esc(k)}</span><span class="st-v">${esc(v)}</span></div>`)
    .join('');
  return box(label, `<div class="st-kv">
      <div class="st-row head"><span class="st-k">${esc(keyName)}</span><span class="st-v">${esc(valName)}</span></div>
      ${rows}</div>`);
}

/* A stack, growing upward, top of stack first. */
export function stack(items, o = {}) {
  const { label, tone = {} } = o;
  if (!items.length) return box(label, `<div class="st-stack"><span class="st-empty">empty</span></div>`);
  const cells = items
    .map((v, i) => {
      const top = i === items.length - 1;
      return `<div class="st-slot${top ? ' on' : ''}${tones(tone[i])}">
        <span>${esc(v)}</span>${top ? '<span class="st-top">top</span>' : ''}</div>`;
    })
    .reverse()
    .join('');
  return box(label, `<div class="st-stack">${cells}</div>`);
}

/* A linked list. Pass nodes as [{id, value}] and `next` as {id: nextId}.
 * A node whose next points at an earlier node draws a back-edge, which is how
 * the cycle problems show their cycle. */
export function chain(nodes, o = {}) {
  const { at, marks = {}, tone = {}, label, cycleTo = null, nullTail = true } = o;
  const cells = nodes
    .map((n, i) => {
      const on = at === i ? ' on' : '';
      const arrow = i < nodes.length - 1 ? '<span class="st-arrow">→</span>' : '';
      return `<div class="st-node${on}${tones(tone[i])}">
          <span class="st-val">${esc(n.value ?? n)}</span>
          ${marks[i] ? `<span class="st-mark">${esc(marks[i])}</span>` : ''}
        </div>${arrow}`;
    })
    .join('');
  const tail = cycleTo != null
    ? `<span class="st-arrow cyc">↩ back to index ${cycleTo}</span>`
    : nullTail ? '<span class="st-arrow">→</span><span class="st-null">null</span>' : '';
  return box(label, `<div class="st-chain">${cells || '<span class="st-empty">empty</span>'}${tail}</div>`);
}

/* A binary tree, laid out by depth and in-order position so edges never cross.
 * Pass a plain {value, left, right} structure; `at` takes a node id produced by
 * walking in the same order, which lesson code gets from treeNodes(). */
export function tree(root, o = {}) {
  const { at, badges = {}, tone = {}, label } = o;
  const nodes = treeNodes(root);
  if (!nodes.length) return box(label, `<div class="st-tree"><span class="st-empty">empty tree</span></div>`);

  const depth = Math.max(...nodes.map((n) => n.depth)) + 1;
  const cols = Math.max(...nodes.map((n) => n.col)) + 1;
  const W = Math.max(280, cols * 62);
  const H = depth * 74;
  const x = (n) => ((n.col + 0.5) / cols) * W;
  const y = (n) => n.depth * 74 + 26;

  const edges = nodes
    .filter((n) => n.parent != null)
    .map((n) => {
      const p = nodes[n.parent];
      return `<line x1="${x(p)}" y1="${y(p) + 17}" x2="${x(n)}" y2="${y(n) - 17}"
              stroke="var(--line-2)" stroke-width="1.5" />`;
    })
    .join('');

  const circles = nodes
    .map((n) => {
      const on = at === n.id;
      const t = tone[n.id];
      // done: settled (green) · warn: being changed right now (amber)
      const fill = on ? 'var(--accent)' : t === 'done' ? 'var(--up-soft)' : t === 'warn' ? 'var(--amber-soft)' : 'var(--surface)';
      const stroke = on ? 'var(--accent)' : t === 'done' ? 'var(--up)' : t === 'warn' ? 'var(--amber)' : 'var(--line-2)';
      const ink = on ? 'var(--surface)' : 'var(--ink)';
      return `<g>
        <circle cx="${x(n)}" cy="${y(n)}" r="17" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
        <text x="${x(n)}" y="${y(n) + 4.5}" text-anchor="middle" fill="${ink}"
              font-family="IBM Plex Mono, monospace" font-size="13">${esc(n.value)}</text>
        ${badges[n.id] != null
          ? `<text x="${x(n) + 23}" y="${y(n) - 10}" fill="var(--accent)"
                  font-family="IBM Plex Mono, monospace" font-size="11">${esc(badges[n.id])}</text>`
          : ''}
      </g>`;
    })
    .join('');

  return box(label, `<div class="st-tree"><svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"
      role="img" aria-label="binary tree">${edges}${circles}</svg></div>`);
}

/* Flatten a tree into positioned nodes. Column comes from an in-order walk,
 * which is what keeps edges from crossing at any shape. */
export function treeNodes(root) {
  const out = [];
  let col = 0;
  (function walk(n, depth, parent) {
    if (!n) return -1;
    const id = out.length;
    out.push({ id, value: n.value ?? n.val, depth, parent, col: 0 });
    const L = walk(n.left, depth + 1, id);
    out[id].col = col++;
    const R = walk(n.right, depth + 1, id);
    void L; void R;
    return id;
  })(root, 0, null);
  return out;
}

/* A bar chart: prices, heights, anything where magnitude is the point. */
export function bars(values, o = {}) {
  const { at, marks = {}, tone = {}, label, height = 120 } = o;
  const max = Math.max(1, ...values.map(Math.abs));
  const cells = values
    .map((v, i) => {
      const h = Math.round((Math.abs(v) / max) * (height - 26)) + 4;
      return `<div class="st-bar${at === i ? ' on' : ''}${tones(tone[i])}">
        <span class="st-barval">${esc(v)}</span>
        <span class="st-fill" style="height:${h}px"></span>
        <span class="st-idx">${i}</span>
        ${marks[i] ? `<span class="st-mark">${esc(marks[i])}</span>` : ''}
      </div>`;
    })
    .join('');
  return box(label, `<div class="st-bars" style="--bar-h:${height}px">${cells}</div>`);
}

/* A scalar readout for the values that aren't part of a structure. */
export function readout(pairs, o = {}) {
  const items = Object.entries(pairs)
    .map(([k, v]) => `<span class="st-read"><b>${esc(k)}</b>${esc(v)}</span>`)
    .join('');
  return box(o.label, `<div class="st-reads">${items}</div>`);
}

/* Lay several shapes side by side, wrapping when there isn't room. */
export function panels(...parts) {
  return `<div class="st-panels">${parts.filter(Boolean).join('')}</div>`;
}

function box(label, inner) {
  return `<div class="st-box">${label ? `<span class="st-label">${esc(label)}</span>` : ''}${inner}</div>`;
}
