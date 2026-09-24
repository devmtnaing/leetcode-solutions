/* The walkthrough engine, rendering the x-sum page's format.
 *
 * x-sum (src/lessons/x-sum/) is the reference design. This file emits the
 * same markup it uses — mode cards, controls with preset chips, the array strip
 * card, transport, narration, the stage/code bench, example cards, and the
 * part 3 solution blocks — so lesson.css styles every lesson exactly as it
 * styles x-sum. Matching x-sum is structural, not a second stylesheet's guess.
 *
 * A lesson supplies data and nothing else:
 *
 *   mountLesson({
 *     input,                 the starting input
 *     controls,              [{ key, label, type, value, parse, format? }]
 *     presets,               [{ label, input }]          chips beside the fields
 *     examples,              [{ title, input, output, why, load }]  part 1 cards
 *     modes,                 [{ id, name, sub?, desc, cost, build(input) }]
 *     languages,             [{ id, name }]
 *     code,                  { [mode]: { [lang]: [[lineKey, html], ...] } }
 *     draw(step, input),     the stage — the state the algorithm carries
 *     strip?(step, input),   the array strip card, when the input is a row
 *     answer?(step, input),  { html, note } for the answer card
 *     vars(step, input),     [[name, value], ...] — also drives hover-to-inspect
 *     hover?,                { [lang]: { identifier: varName } } extra aliases
 *     solutions?,            { [mode]: { desc, tag?, approach? } } part 3 captions;
 *                            approach = { idea, steps: [..], cost } is the
 *                            short read above each listing
 *     verification,          { [lang]: how it was checked, or { [mode]: … } } → part 3 badges
 *     caveats?,              { [mode]: { [lang]: note } } → under the code
 *     widget?(host),         part 1's interactive, mounted into #q-widget
 *   })
 *
 * Any reader-facing value may be a plain string or an { en, my } pair.
 *
 * A step generator returns every snapshot up front, not lazily — that is what
 * makes the scrubber possible. Reserved snapshot keys: `line` (the code line to
 * highlight), `note` (narration), `tag` (the phase chip). Everything else is the
 * lesson's own state, handed back to draw / strip / answer / vars.
 */

import { pick, onLangChange } from './i18n.js';

const $ = (sel, el = document) => el.querySelector(sel);
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const nameOf = (k) => (typeof k === 'string' ? k : k?.en ?? '');

/* Chrome owned by the engine rather than by any one lesson. */
const UI = {
  pick:      { en: 'Pick a walkthrough', my: 'လမ်းညွှန်တစ်ခု ရွေးပါ' },
  loadEx:    { en: 'load an example', my: 'ဥပမာ ထည့်ရန်' },
  array:     { en: 'The array', my: 'Array' },
  ready:     { en: 'ready', my: 'အသင့်' },
  back:      { en: '‹ Back', my: '‹ နောက်' },
  next:      { en: 'Next ›', my: 'ရှေ့ ›' },
  play:      { en: 'Play', my: 'ဖွင့်' },
  pause:     { en: 'Pause', my: 'ရပ်' },
  scrub:     { en: 'Scrub through steps', my: 'အဆင့်များကို ဆွဲကြည့်ရန်' },
  step:      { en: 'step', my: 'အဆင့်' },
  answer:    { en: 'answer', my: 'answer' },
  codeLive:  { en: 'The code, live', my: 'အလုပ်လုပ်နေသော code' },
  input:     { en: 'Input', my: 'Input' },
  output:    { en: 'Output', my: 'Output' },
  idea:      { en: 'Idea', my: 'စိတ်ကူး' },
  steps:     { en: 'Steps', my: 'အဆင့်များ' },
  cost:      { en: 'Cost', my: 'ကုန်ကျမှု' },
  load:      { en: 'Load into the stepper ↓', my: 'Stepper ထဲ ထည့်ရန် ↓' },
  copy:      { en: 'Copy', my: 'Copy' },
  copied:    { en: 'Copied', my: 'ကူးပြီး' },
  unset:     { en: 'not set yet at this step', my: 'ဤအဆင့်တွင် မသတ်မှတ်ရသေး' },
  valueNow:  { en: 'value at this step', my: 'ဤအဆင့်ရှိ တန်ဖိုး' },
  badInput:  { en: 'That input does not work here', my: 'ဤ input ကို အသုံးမပြုနိုင်ပါ' },
};

export function mountLesson(cfg) {
  // A lesson mounts itself on import. Setting this hook lets a checker collect
  // the config and skip everything that needs a DOM — scripts/check-lessons.mjs.
  if (globalThis.__LESSON_PROBE__) return globalThis.__LESSON_PROBE__(cfg);

  const root = cfg.root || document.getElementById('lesson');
  if (!root) throw new Error('mountLesson: no #lesson element');

  const langs = cfg.languages;
  const state = {
    mode: cfg.modes[0].id,
    lang: langs[0].id,
    i: 0,
    steps: [],
    playing: false,
    timer: null,
    input: structuredClone(cfg.input),
    varNames: [],
  };

  /* ---------------- building ---------------- */

  const mode = () => cfg.modes.find((m) => m.id === state.mode);

  function rebuild() {
    let steps;
    try {
      steps = mode().build(structuredClone(state.input)) || [];
      showWarn('');
    } catch (err) {
      steps = [];
      showWarn(`${pick(UI.badInput)}: ${err.message}`);
    }
    state.steps = steps.length ? steps : [{ line: null, note: '' }];
    state.i = 0;                               // input changes always reset to step 1
    // Every identifier any step of this mode reports, so the code panel marks
    // a stable set and the tooltip can say "not set yet" rather than vanish.
    const names = new Set();
    if (cfg.vars) for (const s of state.steps) for (const [k] of cfg.vars(s, state.input) || []) names.add(nameOf(k));
    state.varNames = [...names];
    render();
  }

  /* ---------------- markup ---------------- */

  function shell() {
    const modeCards = cfg.modes.map((m) => `
      <button class="mode-card" role="tab" data-mode="${m.id}" aria-selected="${m.id === state.mode}">
        <span class="mode-mark" aria-hidden="true"></span>
        <span class="mode-body">
          <span class="mode-name">${esc(pick(m.name))}${m.sub ? ` <span class="sub-name">&middot; ${esc(pick(m.sub))}</span>` : ''}</span>
          <span class="mode-desc">${esc(pick(m.desc ?? m.blurb ?? ''))}</span>
        </span>
      </button>`).join('');

    const fields = (cfg.controls || []).map((c) => `
      <div class="field">
        <label for="f-${c.key}">${esc(pick(c.label))}</label>
        <input type="${c.type || 'text'}" id="f-${c.key}" data-field="${c.key}"
               value="${esc(format(c, state.input[c.key]))}" spellcheck="false" autocomplete="off"
               ${c.min != null ? `min="${c.min}"` : ''} ${c.max != null ? `max="${c.max}"` : ''}>
      </div>`).join('');

    const presets = cfg.presets?.length ? `
      <div class="field">
        <label>${esc(pick(UI.loadEx))}</label>
        <div class="presets">${cfg.presets.map((p, i) =>
          `<button class="chip" data-preset="${i}">${esc(pick(p.label))}</button>`).join('')}</div>
      </div>` : '';

    const langBar = (cls) => `
      <div class="lang-bar${cls}" role="tablist">${langs.map((l) =>
        `<button class="lang" role="tab" data-lang="${l.id}" aria-selected="${l.id === state.lang}">${esc(l.name)}</button>`).join('')}
      </div>`;

    return `
      <div class="mode-pick">
        <span class="pick-label">${esc(pick(UI.pick))}</span>
        <div class="mode-cards" role="tablist" style="--modes:${cfg.modes.length}">${modeCards}</div>
      </div>

      <div class="controls">${fields}${presets}
        <p class="warn" data-warn hidden></p>
      </div>

      ${cfg.strip ? `
      <div class="strip-card">
        <div class="strip-head">
          <h2>${esc(pick(cfg.stripLabel ?? UI.array))}</h2>
          <span class="op mono" data-op>${esc(pick(UI.ready))}</span>
        </div>
        <div class="strip" data-strip></div>
      </div>` : ''}

      <div class="transport">
        <button class="btn" data-act="prev">${esc(pick(UI.back))}</button>
        <button class="btn primary" data-act="play">${esc(pick(UI.play))}</button>
        <button class="btn" data-act="next">${esc(pick(UI.next))}</button>
        <input type="range" data-scrub min="0" max="0" value="0" aria-label="${esc(pick(UI.scrub))}">
        <span class="counter" data-count>0 / 0</span>
      </div>

      <div class="narration">
        <span class="tag" data-tag>${esc(pick(UI.step))}</span>
        <p class="text" data-note></p>
      </div>

      <div class="bench">
        <div class="col">
          <div class="panel" data-stage></div>
          ${cfg.answer ? `
          <div class="strip-card answer-card">
            <div class="strip-head">
              <h2>${esc(pick(cfg.answerLabel ?? UI.answer))}</h2>
              <span class="note mono" data-ans-note></span>
            </div>
            <div class="answer-row" data-answer></div>
          </div>` : ''}
        </div>
        <div class="panel">
          <div class="panel-head">
            <h2>${esc(pick(UI.codeLive))}</h2>
            <span class="note" data-code-label></span>
          </div>
          ${langBar(' mini')}
          <div class="code" data-code></div>
          <p class="code-sub" data-code-sub hidden></p>
        </div>
      </div>`;
  }

  function format(c, v) {
    if (c.format) return c.format(v);
    return Array.isArray(v) ? v.join(', ') : String(v ?? '');
  }

  function paint() {
    root.innerHTML = shell();
    bindControls();
  }

  /* ---------------- drawing one step ---------------- */

  function render() {
    const s = state.steps[state.i];
    const m = mode();

    $('[data-stage]', root).innerHTML = cfg.draw(s, state.input) ?? '';
    if (cfg.strip) {
      $('[data-strip]', root).innerHTML = cfg.strip(s, state.input) ?? '';
      $('[data-op]', root).textContent = pick(s.tag) || pick(UI.ready);
    }
    if (cfg.answer) {
      const a = cfg.answer(s, state.input) || {};
      $('[data-answer]', root).innerHTML = a.html ?? '';
      $('[data-ans-note]', root).textContent = pick(a.note);
    }

    $('[data-tag]', root).textContent = pick(s.tag) || pick(UI.step);
    $('[data-note]', root).innerHTML = pick(s.note);

    renderCode(s, m);

    const scrub = $('[data-scrub]', root);
    scrub.max = String(state.steps.length - 1);
    scrub.value = String(state.i);
    $('[data-count]', root).textContent = `${state.i + 1} / ${state.steps.length}`;
  }

  function listing() {
    const byMode = cfg.code[state.mode] || {};
    return byMode[state.lang] || byMode[langs[0].id] || [];
  }

  function renderCode(s, m) {
    const box = $('[data-code]', root);
    const aliases = cfg.hover?.[state.lang] || {};
    box.innerHTML = listing().map(([key, html]) => {
      const hot = s.line != null && key === s.line ? ' hot' : '';
      return `<span class="ln${hot}">${markVars(html || ' ', state.varNames, aliases)}</span>`;
    }).join('');

    const hot = $('.ln.hot', box);
    if (hot) box.scrollTop = Math.max(0, hot.offsetTop - box.clientHeight / 2 + hot.offsetHeight / 2);

    const langName = langs.find((l) => l.id === state.lang)?.name ?? state.lang;
    $('[data-code-label]', root).textContent = m.cost ? `${langName} · ${pick(m.cost)}` : langName;

    const cav = pick((cfg.caveats?.[state.mode] ?? {})[state.lang]);
    const sub = $('[data-code-sub]', root);
    sub.innerHTML = cav;
    sub.hidden = !cav;
  }

  /* ---------------- transport ---------------- */

  function go(i) {
    state.i = Math.max(0, Math.min(state.steps.length - 1, i));
    render();
  }
  function stop() {
    state.playing = false;
    clearInterval(state.timer);
    const b = $('[data-act="play"]', root);
    if (b) b.textContent = pick(UI.play);
  }
  function play() {
    if (state.i >= state.steps.length - 1) state.i = 0;
    state.playing = true;
    $('[data-act="play"]', root).textContent = pick(UI.pause);
    state.timer = setInterval(() => {
      if (state.i >= state.steps.length - 1) return stop();
      go(state.i + 1);
    }, 700);
  }

  function setLangAll(id) {
    state.lang = id;
    document.querySelectorAll('[data-lang]').forEach((b) =>
      b.setAttribute('aria-selected', String(b.dataset.lang === id)));
    document.querySelectorAll('[data-pane]').forEach((p) => { p.hidden = p.dataset.pane !== id; });
    render();
  }

  function loadInput(input) {
    stop();
    state.input = structuredClone(input);
    (cfg.controls || []).forEach((c) => {
      const el = $(`[data-field="${c.key}"]`, root);
      if (el) { el.value = format(c, state.input[c.key]); el.classList.remove('bad'); }
    });
    rebuild();
  }

  function showWarn(msg) {
    const w = $('[data-warn]', root);
    if (!w) return;
    w.textContent = msg;
    w.hidden = !msg;
  }

  function bindControls() {
    root.querySelectorAll('[data-field]').forEach((el) => {
      el.addEventListener('input', () => {
        const spec = cfg.controls.find((c) => c.key === el.dataset.field);
        try {
          state.input[spec.key] = spec.parse ? spec.parse(el.value) : el.value;
          el.classList.remove('bad');
        } catch (err) {
          el.classList.add('bad');
          showWarn(err.message);
          return;
        }
        stop();
        rebuild();
      });
    });
    const scrub = $('[data-scrub]', root);
    scrub.addEventListener('input', () => { stop(); go(Number(scrub.value)); });
  }

  root.addEventListener('click', (e) => {
    const card = e.target.closest('[data-mode]');
    if (card) {
      stop();
      state.mode = card.dataset.mode;
      root.querySelectorAll('[data-mode]').forEach((b) =>
        b.setAttribute('aria-selected', String(b.dataset.mode === state.mode)));
      rebuild();
      return;
    }
    const langBtn = e.target.closest('[data-lang]');
    if (langBtn) return setLangAll(langBtn.dataset.lang);
    const chip = e.target.closest('[data-preset]');
    if (chip) return loadInput(cfg.presets[Number(chip.dataset.preset)].input);
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (!act) return;
    if (act === 'play') return state.playing ? stop() : play();
    stop();
    if (act === 'prev') go(state.i - 1);
    if (act === 'next') go(state.i + 1);
  });

  // Arrow keys and space — never while someone is typing, and only while the
  // walkthrough is on screen, so a widget elsewhere keeps its own keys.
  document.addEventListener('keydown', (e) => {
    if (e.target.closest('input,textarea,select,[contenteditable]')) return;
    if (e.target.closest('#q-widget')) return;
    const r = root.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); stop(); go(state.i + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); stop(); go(state.i - 1); }
    else if (e.key === ' ') { e.preventDefault(); state.playing ? stop() : play(); }
  });

  /* ---------------- hover to inspect ---------------- */

  const tip = document.createElement('div');
  tip.className = 'var-tip';
  tip.hidden = true;
  document.body.appendChild(tip);
  let pinned = null;

  function showTip(el) {
    const s = state.steps[state.i];
    const name = el.dataset.c;
    const pair = (cfg.vars ? cfg.vars(s, state.input) : []).find(([k]) => nameOf(k) === name);
    const value = pair ? String(pair[1]) : null;
    tip.innerHTML = `<span class="tip-name">${esc(el.textContent)}</span>`
      + `<span class="tip-label">${esc(pick(UI.valueNow))}</span>`
      + `<span class="tip-val">${value == null ? esc(pick(UI.unset)) : esc(value)}</span>`;
    tip.hidden = false;
    const r = el.getBoundingClientRect(), tr = tip.getBoundingClientRect();
    const left = Math.min(Math.max(8, r.left), innerWidth - tr.width - 8);
    let top = r.top - tr.height - 8;
    if (top < 4) top = r.bottom + 8;
    tip.style.left = `${Math.round(left + scrollX)}px`;
    tip.style.top = `${Math.round(top + scrollY)}px`;
  }
  const hideTip = () => { if (!pinned) tip.hidden = true; };

  root.addEventListener('mouseover', (e) => { const v = e.target.closest('.code .var'); if (v && !pinned) showTip(v); });
  root.addEventListener('mouseout', (e) => { if (e.target.closest('.code .var')) hideTip(); });
  root.addEventListener('click', (e) => {
    if (!e.target.closest('[data-code]')) return;
    const v = e.target.closest('.var');
    if (!v) { pinned = null; tip.hidden = true; return; }
    if (pinned === v) { pinned = null; tip.hidden = true; } else { pinned = null; showTip(v); pinned = v; }
  });
  document.addEventListener('scroll', () => { if (!pinned) tip.hidden = true; }, true);

  /* ---------------- part 1 and part 3 ---------------- */

  function paintAll() {
    paint();
    renderExamples(cfg, loadInput);
    renderSolutions(cfg, state.lang);
    rebuildKeepingPlace();
  }
  function rebuildKeepingPlace() {
    const at = state.i;
    rebuild();
    go(at);
  }

  paint();
  renderExamples(cfg, loadInput);
  renderSolutions(cfg, state.lang);
  if (cfg.widget) {
    const host = document.getElementById('q-widget');
    if (host) cfg.widget(host);
  }
  rebuild();

  // Narration is generated per step and the chrome is rendered by this file, so
  // a language change redraws both — holding the mode, the language tab, the
  // reader's input and their place in the walkthrough.
  onLangChange(() => { stop(); paintAll(); });

  return { rebuild, go, stop, state };
}

/* Wrap known identifiers in a rendered listing, never inside a tag and never in
 * the middle of a longer identifier, so the reader can hover one and see its
 * value at the current step. */
function markVars(lineHtml, names, aliases) {
  const wanted = new Map(names.map((n) => [n, n]));
  for (const [ident, name] of Object.entries(aliases)) wanted.set(ident, name);
  const keys = [...wanted.keys()].filter(Boolean).sort((a, b) => b.length - a.length);
  if (!keys.length) return lineHtml;
  const pattern = new RegExp(`(${keys.map((k) => k.replace(/[.*+?^${}()|[\]\\@]/g, '\\$&')).join('|')})(?![A-Za-z0-9_])`, 'g');
  return lineHtml.split(/(<[^>]*>|&[a-z#0-9]+;)/i).map((part) => {
    if (part.startsWith('<') || part.startsWith('&')) return part;
    return part.replace(pattern, (tok, _m, offset) => {
      if (/[A-Za-z0-9_.@$]/.test(part.charAt(offset - 1))) return tok;
      return `<span class="var" data-c="${esc(wanted.get(tok))}">${tok}</span>`;
    });
  }).join('');
}

/* Part 1 — the worked examples, each loadable into the stepper. */
function renderExamples(cfg, loadInput) {
  const host = document.getElementById('examples');
  if (!host || !cfg.examples?.length) return;
  host.innerHTML = cfg.examples.map((ex, i) => `
    <div class="ex-card">
      <h3>${esc(pick(ex.title))}</h3>
      <p class="io"><b>${esc(pick(UI.input))}</b> ${pick(ex.inputHtml)}</p>
      <p class="io"><b>${esc(pick(UI.output))}</b> <code class="out">${esc(ex.output)}</code></p>
      ${ex.why ? `<ul class="why">${[].concat(ex.why).map((w) => `<li>${pick(w)}</li>`).join('')}</ul>` : ''}
      ${ex.load ? `<button class="btn ex-load" data-ex="${i}">${esc(pick(UI.load))}</button>` : ''}
    </div>`).join('');
  host.onclick = (e) => {
    const b = e.target.closest('[data-ex]');
    if (!b) return;
    loadInput(cfg.examples[Number(b.dataset.ex)].load);
    document.getElementById('part-2')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
}

/* Part 3 — the whole solution. Built from the same `code` the stepper
 * highlights, so the listing a reader copies cannot drift from the one they
 * watched run. */
/* The approach in brief, above its listing: the idea in a sentence or two,
 * the steps as the code takes them, and the cost with the reason for it. */
function approachBlock(a, cost) {
  if (!a) return '';
  return `<div class="approach">
    <p><span class="approach-label">${esc(pick(UI.idea))}</span>${pick(a.idea)}</p>
    <div><span class="approach-label">${esc(pick(UI.steps))}</span>
      <ol>${a.steps.map((s) => `<li>${pick(s)}</li>`).join('')}</ol></div>
    <p><span class="approach-label">${esc(pick(UI.cost))}</span><span class="mono">${esc(pick(cost))}</span> — ${pick(a.cost)}</p>
  </div>`;
}

function renderSolutions(cfg, activeLang) {
  const host = document.getElementById('solutions');
  if (!host) return;
  const langs = cfg.languages;

  // verification[lang] is one badge for every approach, or { [mode]: badge }
  // when one approach in that language behaves differently from the other.
  const badge = (lang, mode) => {
    const v = (cfg.verification || {})[lang];
    const how = pick(v && typeof v === 'object' && mode in v ? v[mode] : v);
    if (!how) return '';
    const unrun = /not compiled|not run|unverified|overflows/i.test(how);
    return `<span class="verify ${unrun ? 'warn' : 'ok'}">${esc(how)}</span>`;
  };

  host.innerHTML = `
    <div class="lang-bar" role="tablist">${langs.map((l) =>
      `<button class="lang" role="tab" data-lang="${l.id}" aria-selected="${l.id === activeLang}">${esc(l.name)}</button>`).join('')}
    </div>
    ${langs.map((l) => `
      <div class="lang-pane" data-pane="${l.id}" ${l.id === activeLang ? '' : 'hidden'}>
        ${cfg.modes.map((m) => {
          const meta = cfg.solutions?.[m.id] || {};
          const lines = (cfg.code[m.id]?.[l.id] || []).map(([, html]) => html).join('\n');
          return `
          <div class="src">
            <div class="src-head">
              <h2>${esc(pick(m.name))}${m.sub ? ` <span class="sub-name">&middot; ${esc(pick(m.sub))}</span>` : ''}${meta.tag ? `<span class="tagpill">${esc(meta.tag)}</span>` : ''}</h2>
              ${badge(l.id, m.id)}
              <button class="btn copy" data-copy>${esc(pick(UI.copy))}</button>
              ${meta.desc ? `<p class="sub">${pick(meta.desc)}</p>` : `<p class="sub mono">${esc(pick(m.cost))}</p>`}
            </div>
            ${approachBlock(meta.approach, m.cost)}
            <pre class="full" tabindex="0">${lines}</pre>
          </div>`;
        }).join('')}
      </div>`).join('')}`;

  host.onclick = (e) => {
    const langBtn = e.target.closest('[data-lang]');
    if (langBtn) {
      const id = langBtn.dataset.lang;
      host.querySelectorAll('[data-lang]').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.lang === id)));
      host.querySelectorAll('[data-pane]').forEach((p) => { p.hidden = p.dataset.pane !== id; });
      // keep the live code panel on the same language
      document.querySelector(`#lesson [data-lang="${id}"]`)?.click();
      return;
    }
    const copy = e.target.closest('[data-copy]');
    if (copy) {
      const text = copy.closest('.src').querySelector('pre.full').textContent;
      navigator.clipboard?.writeText(text).then(() => {
        copy.textContent = pick(UI.copied);
        copy.classList.add('done');
        setTimeout(() => { copy.textContent = pick(UI.copy); copy.classList.remove('done'); }, 1400);
      });
    }
  };
}

export { esc };
