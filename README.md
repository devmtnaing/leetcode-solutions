# learn

A static course site: Ruby, Rails, and algorithms. Three tracks under one shell,
served as prerendered HTML from a CDN.

```
npm install
npm run dev      # http://localhost:4321
npm run build    # → dist/
npm run preview  # serve dist/ exactly as it will be served in production
```

## Why there's no backend

Nothing on this site changes per visitor or per request, so every page is built
once and served as a file. That makes traffic a non-problem — a CDN absorbs it —
and it means the only thing that limits the site is how fast lessons get written.
The architecture is arranged around that: shared chrome, shared styles, and a
lesson format with as little boilerplate as possible.

A backend becomes worth adding the day the site needs accounts, cross-device
progress, comments, or paid content. Astro renders on the server for individual
routes, so that is an addition rather than a rewrite.

## Adding a prose lesson

Drop a file in `src/content/lessons/<track>/`:

```mdx
---
title: What happens between the URL and your controller
track: rails          # ruby | rails | leetcode
order: 1              # position within the track
minutes: 10           # optional
summary: One sentence, shown in the track index.
---

Markdown body.
```

It appears in the track index and gets its own page at `/<track>/<filename>` on
the next build. Nothing else needs wiring up. Set `draft: true` to keep it out of
the build.

## Adding an interactive lesson

Every LeetCode lesson is one folder under `src/lessons/<slug>/`. A lesson built
on the shared kit is four files, and `src/pages/leetcode/[slug].astro` renders
every folder it finds — nothing else needs wiring up:

```
src/lessons/<slug>/page.js          the prose: title, lede, traps, notes, cost table…
src/lessons/<slug>/statement.html   LeetCode's statement, data-i18n on each element
src/lessons/<slug>/lesson.js        approaches, step generators, drawing, code, mountLesson
src/lessons/<slug>/style.css        optional — styles only this lesson uses
```

Each lesson's script is its own chunk, and a page loads only its own.
There is no index to edit: `/leetcode` lists only the problems, and a problem
gets its "Interactive solution" link from whichever lesson's `page.js` names it in `links`.
`src/lessons/two-sum/` is the worked example to copy.

The shared pieces:

| File | Holds |
| --- | --- |
| `src/layouts/Walkthrough.astro` | the page skeleton, in x-sum's markup |
| `src/lib/stepper.js` | `mountLesson` — transport, narration, code panel, example cards, part 3 |
| `src/lib/stage.js` | stage shapes: `cells` `slots` `kv` `stack` `chain` `tree` `bars` `readout` `panels` |
| `src/lib/kit.js` | helpers every lesson uses: `t` `plural` `exampleTitle` `LANGUAGES` `k` `c` `verdictAnswer` `stageRow` `stageGap` `labelledRows` |
| `src/lib/tree.js` | LeetCode binary trees: parse level order, build, serialize, draw with `stage.tree()` |
| `src/lib/i18n.js` | English / မြန်မာ switching |

A part 3 badge is one string per language, or `{ [mode]: badge }` when one
approach behaves differently in that language — recursive Ruby overflowing
where its BFS does not, say.

`node scripts/check-lessons.mjs` checks every lesson's structure.

x-sum (`src/lessons/x-sum/`) is the reference design, built by hand before the
kit existed: `body.html` holds its markup and `lesson.js` its behaviour, and it
has its own page, `src/pages/leetcode/x-sum.astro`. The markup is a plain `.html`
file because its Ruby, Go and Rust listings are full of braces and angle
brackets that `.astro` would read as expressions; `?raw` + `set:html` sidesteps
that.

The `leetcode-solution-page` skill builds these lessons.

## Styles

| File | Loaded on | Holds |
| --- | --- | --- |
| `tokens.css` | every page | the palette, in all three theme states |
| `base.css` | every page | reset, body type, headings |
| `site.css` | every page | masthead, indexes, prose, pager |
| `lesson.css` | walkthroughs only | x-sum's page structure — every lesson uses it |
| `kit.css` | walkthroughs only | stage shapes and the shared lesson pieces from `kit.js` |

Lessons carry no inline styles: anything a lesson draws uses a class from these
files, or from its own `style.css`.

Colour is only ever read through a token, so the shell and the walkthrough inside
it stay the same design. Theme has three states: unset (follow the OS), and the
two explicit choices the toggle writes.

## Deploying

Build command `npm run build`, output directory `dist`, no environment variables.
On Cloudflare Pages or Netlify, connect the repo and point `learn.<domain>.com` at
it with a CNAME. `public/_headers` sets the cache policy: hashed assets forever,
HTML always revalidated.

Set the real domain in `astro.config.mjs` (`site:`) so canonical URLs are right.

## Archive

`archive/xsum.standalone.html` is the original single-file page the site was built
from, kept because it still opens from the filesystem with no build step.
