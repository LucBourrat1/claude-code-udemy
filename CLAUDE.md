# CLAUDE.md

On ocnstruit l'app décrite dans @SPEC.md. Lis ce fichier pour les tâches d'architecture générale ou double check les structures de databases, la stack tech et l'archi de l'application.

Réponds toujours de manière courte et concise avec les infos clef. Pas de blabla inutile, pas de long code snippets.

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun dev        # start dev server (localhost:3000)
bun build      # production build
bun start      # serve production build
bun lint       # run ESLint
```

Database migration (better-auth managed tables):

```bash
npx auth@latest migrate    # apply missing tables/columns
npx auth@latest generate   # generate SQL file to run manually
```

## What This App Is

A note-taking web app where authenticated users can create, edit, delete, and publicly share rich-text notes. Specified fully in [SPEC.MD](SPEC.MD) — read it for details before implementing any feature.

**Current state:** The app is a bare Next.js scaffold (`app/page.tsx` is a placeholder). The full feature set remains to be built per the spec.

## Architecture

- **Runtime:** Bun (not Node) — use Bun-native APIs where applicable (e.g. `Bun.sqlite` for SQLite)
- **Framework:** Next.js 16 App Router — server components for data fetching, client components for interactive UI, Route Handlers under `app/api/`
- **Database:** Single SQLite file (`data/app.db`) accessed via Bun's built-in SQLite client with raw SQL. No ORM. DB helpers live in `lib/db.ts`, note repository in `lib/notes.ts`
- **Auth:** better-auth — session checked server-side in every protected route/handler
- **Editor:** TipTap (StarterKit + Code + CodeBlock). Note content stored as `JSON.stringify(editor.getJSON())` in `content_json` column; parsed back on load. Never store raw HTML
- **Styling:** TailwindCSS v4 (PostCSS plugin, no `tailwind.config.ts`)

## Planned Route Structure

```
app/
  (auth)/login        # login page
  (auth)/register     # register page
  dashboard/          # authenticated note list
  notes/[id]/         # authenticated note editor
  p/[slug]/           # public read-only note
  api/notes/          # CRUD + sharing endpoints
  api/public-notes/   # public note endpoint (or resolved in server component)
```

## Key Conventions

- All note DB queries must include `user_id = ?` to scope to the authenticated user — no exceptions
- Public slugs must be generated with sufficient entropy (16+ chars, e.g. `nanoid()`) and are set to NULL when sharing is disabled
- TipTap content is stored as JSON string in DB; when rendering publicly use `EditorContent` with `editable: false`, never `dangerouslySetInnerHTML` with raw strings
- API handlers return 401 when unauthenticated, 404 when note not found or not owned by user
- `lib/db.ts` exports a singleton DB connection; `lib/notes.ts` exports typed repository functions (see SPEC.MD §6)
