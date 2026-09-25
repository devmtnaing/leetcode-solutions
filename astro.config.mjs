// @ts-check
import { defineConfig } from 'astro/config';

// The site is fully static: every page is prerendered at build time and served
// from a CDN. Nothing here runs per-request, which is why there is no adapter.
export default defineConfig({
  site: 'https://learn.devmtnaing.com',
  // Pages build as /leetcode/two-sum.html and are linked without a slash, so
  // Cloudflare serves /leetcode/two-sum directly instead of redirecting to
  // /leetcode/two-sum/ on every click.
  build: { format: 'file' },
  trailingSlash: 'never',
  // The problem list used to live here, before it became the home page.
  redirects: { '/leetcode': '/' },
});
