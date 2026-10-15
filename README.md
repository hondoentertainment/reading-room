# Kyle's Reading Room

A personal shelf for essays Kyle wants within reach. Each reading links out to the original publication and keeps a short, original context note. Notes, highlights, progress, ratings, and status stay in this browser.

The essays are copyrighted. This app does not store or reproduce them.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm test
npm run lint
npm run build
```

## What stays where

Seeded essays (title, author, link, tags, and a short context blurb) live in `src/lib/readings.ts`. Anything Kyle adds, plus notes, highlights, a progress slider, a rating, and status (`to-read`, `reading`, `done`), is saved in `localStorage` under `krr.shelf.v1`.

On the shelf, open **Shelf file** to export or import that JSON. Import replaces the on-device shelf. Seeded essays remain part of the app.

Appearance (light or dark) is stored separately under `krr-theme`.

## Deploy on Vercel

The app is a Next.js App Router project with no database and no environment variables.

1. Push the repository to GitHub.
2. In Vercel, import the project. The framework preset is Next.js.
3. Leave the build command as `npm run build` and the output as the Next.js default.
4. Deploy.

Notes never go to the server. They stay in each browser unless you export the shelf file.

## Seeded links

Joyas Voladoras is published by The American Scholar at `https://theamericanscholar.org/joyas-volardores/` (their live slug). Consider the Lobster links to the Gourmet archive. The New York Times piece is the August 20, 2006 Play Magazine essay; the Times may show a paywall or block some automated clients.
