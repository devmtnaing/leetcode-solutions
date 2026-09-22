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

A walkthrough ships markup and a script of its own, so it gets a page file rather
than a collection entry — a shared route would bundle every lesson's script into
every lesson. See `src/pages/leetcode/x-sum.astro` for the pattern:

```
src/interactive/<name>/body.html    markup for the stage, panels and listings
src/interactive/<name>/lesson.js    the step generators and wiring
src/pages/<track>/<name>.astro      imports both, adds lesson.css
```

The markup lives in a plain `.html` file because it contains Ruby, Go and Rust
listings full of braces and angle brackets, which `.astro` and `.mdx` would try
to read as expressions. `?raw` + `set:html` sidesteps that entirely.

The `leetcode-solution-page` skill builds these; it produces the standalone page,
and the split above is the last step.

## Styles

| File | Loaded on | Holds |
| --- | --- | --- |
| `tokens.css` | every page | the palette, in all three theme states |
| `base.css` | every page | reset, body type, headings |
| `site.css` | every page | masthead, indexes, prose, pager |
| `lesson.css` | walkthroughs only | stage, transport, code panel, tooltips |

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
