# cormacdineen.page

Personal website built with [Astro](https://astro.build) v5, [Tailwind CSS](https://tailwindcss.com) v4, and the [AstroPaper](https://astro-paper.pages.dev/) theme. Deployed on [Vercel](https://vercel.com) with PWA support.

## What's on the site

- **Blog** — research updates and writing
- **Photography** — gallery with EXIF data, tag filtering, and a lightbox
- **Cultural stew** — books, films, podcasts, sport, food, and more, rated on the Cormyscale
- **About** — biography and contact

## Project structure

```text
├── public/
│   ├── assets/img/          # Photography, recommendation covers, blog images
│   └── fonts/
├── src/
│   ├── components/          # Reusable UI components
│   ├── content/blog/        # Blog posts in Markdown (organised by year)
│   ├── data/                # JSON data (recommendations, photos)
│   ├── layouts/             # Page layouts
│   ├── pages/               # Routes
│   └── styles/              # Global styles
├── photos-source/           # Source photography + metadata.json
├── scripts/                 # Build helpers (EXIF extraction, etc.)
├── astro.config.mjs
└── package.json
```

## Commands

| Command | Action |
| :--- | :--- |
| `npm install` | Install dependencies |
| `npm run dev` | Start local dev server at `localhost:4321` |
| `npm run build` | Build production site to `./dist/` |
| `npm run preview` | Preview the build locally |
| `npm run photos:exif` | Regenerate `photos.json` from source images and `metadata.json` |

## Photo pipeline

1. Drop source images into `photos-source/`
2. Add tags and captions in `photos-source/metadata.json` (this is the source of truth)
3. Run `npm run photos:exif` to generate optimised WebP thumbnails, display images, and `src/data/photos.json`

## Adding recommendations

1. Edit `src/data/recommendations.json`
2. Add cover images (WebP, reasonably sized) to `public/assets/img/recommendations/`
3. Categories are hardcoded in `recommendations.astro`; tags auto-populate from the JSON

## Deployment

Vercel auto-deploys on push to `main`. Custom domain: [cormacdineen.page](https://cormacdineen.page).

## Licence

- **Content**: [CC BY 4.0](http://creativecommons.org/licenses/by/4.0/)
- **Code**: [MIT](LICENSE)

## Credits

Based on [AstroPaper](https://astro-paper.pages.dev/) by [Sat Naing](https://github.com/satnaing).
