import { sql } from "@vercel/postgres";

// Thin typed wrappers around @vercel/postgres so route handlers and
// server components/actions all share the same query shapes.

export type Feed = {
  id: number;
  name: string;
  url: string;
};

export type Article = {
  id: number;
  feed_id: number;
  title: string;
  link: string;
  published_at: string | null;
  full_text: string | null;
  summary: string | null;
  insights: string | null;
  is_read: boolean;
  created_at: string;
};

export async function getFeeds(): Promise<Feed[]> {
  const { rows } = await sql<Feed>`SELECT id, name, url FROM feeds ORDER BY name ASC`;
  return rows;
}

// Articles for the middle column. Optionally scoped to one feed.
export async function getArticles(feedId?: number): Promise<Article[]> {
  if (feedId) {
    const { rows } = await sql<Article>`
      SELECT * FROM articles
      WHERE feed_id = ${feedId} AND is_read = false
      ORDER BY published_at DESC NULLS LAST, created_at DESC
      LIMIT 200
    `;
    return rows;
  }
  const { rows } = await sql<Article>`
    SELECT * FROM articles
    WHERE is_read = false
    ORDER BY published_at DESC NULLS LAST, created_at DESC
    LIMIT 200
  `;
  return rows;
}

export async function getArticleById(id: number): Promise<Article | null> {
  const { rows } = await sql<Article>`SELECT * FROM articles WHERE id = ${id}`;
  return rows[0] ?? null;
}

export async function markArticleRead(id: number): Promise<void> {
  await sql`UPDATE articles SET is_read = true WHERE id = ${id}`;
}

export async function markAllRead(feedId?: number): Promise<void> {
  if (feedId) {
    await sql`UPDATE articles SET is_read = true WHERE feed_id = ${feedId}`;
  } else {
    await sql`UPDATE articles SET is_read = true`;
  }
}

// Storage-saving sweep: permanently delete anything already marked read.
// Called at the start of every cron run, per the auto-delete requirement.
export async function deleteReadArticles(): Promise<number> {
  const { rowCount } = await sql`DELETE FROM articles WHERE is_read = true`;
  return rowCount ?? 0;
}

export async function articleExists(link: string): Promise<boolean> {
  const { rows } = await sql`SELECT 1 FROM articles WHERE link = ${link} LIMIT 1`;
  return rows.length > 0;
}

export async function insertArticle(article: {
  feed_id: number;
  title: string;
  link: string;
  published_at: string | null;
  full_text: string;
  summary: string;
  insights: string;
}): Promise<void> {
  await sql`
    INSERT INTO articles (feed_id, title, link, published_at, full_text, summary, insights)
    VALUES (
      ${article.feed_id},
      ${article.title},
      ${article.link},
      ${article.published_at},
      ${article.full_text},
      ${article.summary},
      ${article.insights}
    )
    ON CONFLICT (link) DO NOTHING
  `;
}
