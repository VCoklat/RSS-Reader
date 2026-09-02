# Signal-to-Noise

Minimalist AI-curated RSS reader. Next.js App Router, Server Components only
(no client JS), Vercel Postgres, Gemma via the Gemini API.

## Setup

1. `npm install`
2. Create a Vercel Postgres (or Supabase Postgres) database and run `schema.sql` against it.
3. Copy `.env.example` to `.env.local` and fill in:
   - `POSTGRES_URL` / `POSTGRES_URL_NON_POOLING` (from your DB provider)
   - `GEMINI_API_KEY` (Google AI Studio)
   - `CRON_SECRET` (any random string — also set it in Vercel project env vars; Vercel Cron sends it automatically as a Bearer token)
4. `npm run dev`

## Deploy

Push to Vercel. `vercel.json` registers the hourly cron hitting
`/api/cron/fetch`, which:
1. Deletes all rows where `is_read = true`.
2. Parses each feed in `feeds`, skips already-stored links.
3. Scrapes full article text, summarizes with Gemma, stores everything.

## Notes

- All UI state (`?feed=`, `?article=`) lives in the URL — mobile column
  switching is pure Tailwind responsive classes, no JS.
- "Mark as read" / "Mark all as read" are Server Actions using native
  `<form action={...}>`.
