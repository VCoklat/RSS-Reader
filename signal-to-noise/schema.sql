-- Signal-to-Noise database schema (Postgres / Vercel Postgres)

-- Feed sources the cron job pulls from.
CREATE TABLE IF NOT EXISTS feeds (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  url         TEXT NOT NULL UNIQUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Individual articles. full_text is scraped for offline reading,
-- summary/insights are produced by Gemma via the Gemini API.
CREATE TABLE IF NOT EXISTS articles (
  id            SERIAL PRIMARY KEY,
  feed_id       INTEGER NOT NULL REFERENCES feeds(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  link          TEXT NOT NULL UNIQUE,
  published_at  TIMESTAMPTZ,
  full_text     TEXT,
  summary       TEXT,
  insights      TEXT,
  is_read       BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Speeds up the middle-column feed filter and the auto-delete sweep.
CREATE INDEX IF NOT EXISTS idx_articles_feed_id ON articles(feed_id);
CREATE INDEX IF NOT EXISTS idx_articles_is_read ON articles(is_read);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC);

-- Seed a couple of example feeds (edit/remove as needed).
INSERT INTO feeds (name, url) VALUES
  ('Hacker News', 'https://hnrss.org/frontpage'),
  ('ArXiv AI', 'https://export.arxiv.org/rss/cs.AI')
ON CONFLICT (url) DO NOTHING;
