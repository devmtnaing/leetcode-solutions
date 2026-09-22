import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Every prose lesson is one .mdx file whose folder decides its track and whose
// frontmatter decides where it sits in the order. Adding a lesson is adding a
// file; nothing else in the site needs to know about it.
const lessons = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/lessons' }),
  schema: z.object({
    title: z.string(),
    track: z.enum(['ruby', 'rails', 'leetcode']),
    summary: z.string(),
    order: z.number(),
    minutes: z.number().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { lessons };
