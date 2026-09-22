/* The generic half of a walkthrough.
 *
 * A lesson supplies three things and nothing else: the approaches it wants to
 * contrast, a step generator per approach, and a function that draws one step.
 * Everything a viewer touches — the transport, the scrubber, the keyboard, the
 * language tabs, the code panel, the narration — lives here, so fifteen lessons
 * behave identically instead of fifteen slightly different ways.
 *
 *   mountLesson({
 *     root, input, modes, languages, code, draw, vars
 *   })
 *
 * A step generator returns an array of snapshots. A snapshot is a plain object;
 * only two keys are reserved:
 *
 *   line  key of the code line to highlight in this step
 *   note  one sentence of narration, optionally prefixed by `tag`
 *
 * Everything else on it is the lesson's own state, passed straight to draw().
 * Generating every snapshot up front rather than stepping lazily is what makes
 * the scrubber possible: any frame is one array index away.
 */

const $ = (sel, el = document) => el.querySelector(sel);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function mountLesson(cfg) {
  // A lesson mounts itself on import, which is right in a browser and useless
  // in a test. Setting this hook lets a checker collect the config and skip
  // everything that needs a DOM — see scripts/check-lessons.mjs.
  if (globalThis.__LESSON_PROBE__) return globalThis.__LESSON_PROBE__(cfg);

  const root = cfg.root;
  if (!root) throw new Error('mountLesson: no root element');

  const state = {
    mode: cfg.modes[0].id,
    lang: (cfg.languages[0] || { id: 'ruby' }).id,
    i: 0,
    steps: [],
    playing: false,
    timer: null,
    input: structuredClone(cfg.input),
  };

  root.innerHTML = shell(cfg);

  const el = {
    stage: $('[data-stage]', root),
    code: $('[data-code]', root),
    note: $('[data-note]', root),
    vars: $('[data-vars]', root),
    scrub: $('[data-scrub]', root),
    count: $('[data-count]', root),
    play: $('[data-act="play"]', root),
    cost: $('[data-cost]', root),
    caveat: $('[data-caveat]', root),
    controls: $('[data-controls]', root),
  };

  /* ---------------- building ---------------- */

  function mode() {
    return cfg.modes.find((m) => m.id === state.mode);
  }

  function rebuild(keepIndex = false) {
    const m = mode();
    let steps;
    try {
      steps = m.build(state.input) || [];
    } catch (err) {
      steps = [{ line: null, note: `That input doesn't work here: ${err.message}` }];
    }
    state.steps = steps.length ? steps : [{ line: null, note: 'Nothing to step through.' }];
    state.i = keepIndex ? Math.min(state.i, state.steps.length - 1) : 0;
    el.cost.textContent = m.cost || '';
    renderCode();
    render();
  }

  /* ---------------- code panel ---------------- */

  function listing() {
    const byMode = cfg.code[state.mode] || {};
    return byMode[state.lang] || byMode[cfg.languages[0].id] || [];
  }

  function renderCode() {
    // Some languages cannot express the approach the narration describes —
    // safe Rust and linked lists being the recurring case. Saying so beside
    // the code beats letting the reader watch the highlight jump and wonder.
    const cav = (cfg.caveats?.[state.mode] ?? {})[state.lang];
    el.caveat.innerHTML = cav || '';
    el.caveat.hidden = !cav;

    el.code.innerHTML = listing()
      .map(([key, html]) => `<div class="kit-line" data-line="${key ?? ''}">${html}</div>`)
      .join('');
  }

  /* ---------------- drawing one step ---------------- */

  function render() {
    const s = state.steps[state.i];

    el.stage.innerHTML = cfg.draw(s, state.input) ?? '';

    // highlight the running line and keep it in view without yanking the page
    let active = null;
    el.code.querySelectorAll('.kit-line').forEach((line) => {
      const on = s.line != null && line.dataset.line === String(s.line);
      line.classList.toggle('on', on);
      if (on) active = line;
    });
    if (active) {
      const box = el.code.getBoundingClientRect();
      const row = active.getBoundingClientRect();
      if (row.top < box.top + 8 || row.bottom > box.bottom - 8) {
        el.code.scrollTop += row.top - box.top - box.height / 2 + row.height / 2;
      }
    }

    el.note.innerHTML = s.note
      ? `${s.tag ? `<span class="kit-tag">${esc(s.tag)}</span>` : ''}<span>${s.note}</span>`
      : '';

    const vars = cfg.vars ? cfg.vars(s, state.input) : null;
    el.vars.innerHTML = vars && vars.length
      ? vars.map(([k, v]) => `<span class="kit-var"><b>${esc(k)}</b>${esc(v)}</span>`).join('')
      : '';
    el.vars.hidden = !(vars && vars.length);

    el.scrub.max = String(state.steps.length - 1);
    el.scrub.value = String(state.i);
    el.count.textContent = `${state.i + 1} / ${state.steps.length}`;
  }

  /* ---------------- transport ---------------- */

  function go(i) {
    state.i = Math.max(0, Math.min(state.steps.length - 1, i));
    render();
  }

  function stop() {
    state.playing = false;
    clearInterval(state.timer);
    el.play.setAttribute('aria-label', 'Play');
    el.play.querySelector('[data-icon]').textContent = '▶';
  }

  function play() {
    if (state.i >= state.steps.length - 1) state.i = 0;
    state.playing = true;
    el.play.setAttribute('aria-label', 'Pause');
    el.play.querySelector('[data-icon]').textContent = '❚❚';
    state.timer = setInterval(() => {
      if (state.i >= state.steps.length - 1) return stop();
      go(state.i + 1);
    }, 650);
  }

  root.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-act],[data-mode],[data-lang]');
    if (!btn) return;

    if (btn.dataset.mode) {
      stop();
      state.mode = btn.dataset.mode;
      root.querySelectorAll('[data-mode]').forEach((b) =>
        b.setAttribute('aria-selected', String(b.dataset.mode === state.mode)));
      rebuild();
      return;
    }
    if (btn.dataset.lang) {
      state.lang = btn.dataset.lang;
      root.querySelectorAll('[data-lang]').forEach((b) =>
        b.setAttribute('aria-selected', String(b.dataset.lang === state.lang)));
      renderCode();
      render();
      return;
    }
    const act = btn.dataset.act;
    if (act === 'play') return state.playing ? stop() : play();
    stop();
    if (act === 'first') go(0);
    if (act === 'prev') go(state.i - 1);
    if (act === 'next') go(state.i + 1);
    if (act === 'last') go(state.steps.length - 1);
  });

  el.scrub.addEventListener('input', () => { stop(); go(Number(el.scrub.value)); });

  // Arrow keys and space, but never while someone is typing in the input row.
  document.addEventListener('keydown', (e) => {
    if (e.target.closest('input[type=text],input[type=number],textarea')) return;
    if (!isOnScreen(root)) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); stop(); go(state.i + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); stop(); go(state.i - 1); }
    else if (e.key === ' ') { e.preventDefault(); state.playing ? stop() : play(); }
  });

  /* ---------------- the input row ---------------- */

  if (cfg.controls) {
    el.controls.innerHTML = cfg.controls
      .map((c) => `<label class="kit-field"><span>${esc(c.label)}</span>
        <input type="${c.type || 'text'}" data-field="${c.key}" value="${esc(c.value)}"
               ${c.min != null ? `min="${c.min}"` : ''} ${c.max != null ? `max="${c.max}"` : ''}
               ${c.size ? `size="${c.size}"` : ''}></label>`)
      .join('');
    el.controls.addEventListener('input', (e) => {
      const f = e.target.dataset.field;
      if (!f) return;
      const spec = cfg.controls.find((c) => c.key === f);
      try {
        state.input[f] = spec.parse ? spec.parse(e.target.value) : e.target.value;
        e.target.classList.remove('bad');
      } catch {
        e.target.classList.add('bad');
        return;
      }
      stop();
      rebuild();
    });
  } else {
    el.controls.hidden = true;
  }

  rebuild();
  return { rebuild, go, stop, state };
}

function isOnScreen(el) {
  const r = el.getBoundingClientRect();
  return r.bottom > 0 && r.top < innerHeight;
}

/* ---------------- markup ---------------- */

function shell(cfg) {
  const modeTabs = cfg.modes
    .map((m, i) => `<button class="kit-tab" role="tab" data-mode="${m.id}"
        aria-selected="${i === 0}"><b>${esc(m.name)}</b>${m.blurb ? `<span>${esc(m.blurb)}</span>` : ''}</button>`)
    .join('');

  const langTabs = cfg.languages
    .map((l, i) => `<button class="kit-lang" role="tab" data-lang="${l.id}" aria-selected="${i === 0}">${esc(l.name)}</button>`)
    .join('');

  return `
  <div class="kit">
    <div class="kit-modes" role="tablist" aria-label="Approach">${modeTabs}</div>
    <div class="kit-controls" data-controls></div>
    <div class="kit-body">
      <div class="kit-left">
        <div class="kit-stage" data-stage></div>
        <p class="kit-note" data-note></p>
        <div class="kit-vars" data-vars hidden></div>
      </div>
      <div class="kit-right">
        <div class="kit-langs" role="tablist" aria-label="Language">${langTabs}<span class="kit-cost" data-cost></span></div>
        <p class="kit-caveat" data-caveat hidden></p>
        <pre class="kit-code" data-code></pre>
      </div>
    </div>
    <div class="kit-transport">
      <button class="kit-btn" data-act="first" aria-label="First step">⏮</button>
      <button class="kit-btn" data-act="prev" aria-label="Previous step">◀</button>
      <button class="kit-btn primary" data-act="play" aria-label="Play"><span data-icon>▶</span></button>
      <button class="kit-btn" data-act="next" aria-label="Next step">▶</button>
      <button class="kit-btn" data-act="last" aria-label="Last step">⏭</button>
      <input class="kit-scrub" type="range" min="0" max="0" value="0" data-scrub aria-label="Step">
      <span class="kit-count mono" data-count></span>
    </div>
    <p class="kit-hint"><kbd>←</kbd> <kbd>→</kbd> step · <kbd>space</kbd> play/pause</p>
  </div>`;
}

export { esc };
