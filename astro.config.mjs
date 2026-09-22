// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

// The site is fully static: every page is prerendered at build time and served
// from a CDN. Nothing here runs per-request, which is why there is no adapter.
export default defineConfig({
  site: 'https://learn.example.com',
  integrations: [mdx()],
  markdown: { shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' } } },
});
