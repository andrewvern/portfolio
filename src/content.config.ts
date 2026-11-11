import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const work = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/work' }),
  schema: z.object({
    title: z.string(),
    order: z.number(),
    summary: z.string(),
    year: z.string(),
    status: z.string(),
    role: z.string(),
    stack: z.array(z.string()),
    links: z.array(z.object({ label: z.string(), href: z.string() })).default([]),
    metrics: z.array(z.object({ value: z.string(), label: z.string() })),
    pipeline: z.array(z.object({ label: z.string(), note: z.string().optional() })),
  }),
});

export const collections = { work };
