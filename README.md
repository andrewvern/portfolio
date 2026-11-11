# Portfolio

Personal site for Andrew Vernon, data and AI engineer. Built with [Astro](https://astro.build); output is fully static.

## Run

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # static output in dist/
```

## Deploy

Hosted on Cloudflare Pages, project `andrewvernon`: https://andrewvernon.pages.dev

Deploys are manual uploads of the build output; pushing to GitHub does not deploy.

```sh
npm run build
npx wrangler pages deploy dist --project-name andrewvernon --branch main
```

## Structure

- `src/pages/index.astro`: home page
- `src/pages/work/[slug].astro`: case-study template
- `src/content/work/*.md`: one Markdown file per project (frontmatter drives the cards, metrics and data flow)
- `src/data/site.ts`: name, contact links, resume path
- `src/components/Cover.astro`: generated cover art per project
- `src/styles/global.css`: all styles
- `public/`: resume PDF and favicon

## Add a project

Create `src/content/work/<slug>.md` with the same frontmatter as the existing files, then add a cover for that slug in `Cover.astro`.
