import { NextRequest, NextResponse } from "next/server";
import Parser from "rss-parser";
import {
  getFeeds,
  articleExists,
  insertArticle,
  deleteReadArticles,
} from "@/lib/db";
import { scrapeFullText } from "@/lib/scrape";
import { summarizeWithGemma } from "@/lib/gemma";

// Vercel Cron routes must run on Node (not edge) for rss-parser/cheerio,
// and need a longer timeout since we scrape + call Gemma per article.
export const runtime = "nodejs";
export const maxDuration = 300;

const parser = new Parser();

export async function GET(req: NextRequest) {
  // Verify this is the real Vercel Cron invocation, not a public hit.
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1. Auto-delete: purge everything already read before ingesting more,
  // keeping storage bounded on the free tier.
  const deletedCount = await deleteReadArticles();

  const feeds = await getFeeds();
  let insertedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  // 2. Walk every configured feed sequentially — keeps memory/CPU bounded
  // for the Hobby tier rather than blasting requests in parallel.
  for (const feed of feeds) {
    try {
      const parsed = await parser.parseURL(feed.url);

      for (const item of parsed.items) {
        const link = item.link;
        if (!link) continue;

        // Skip anything we've already stored (unique on link).
        if (await articleExists(link)) {
          skippedCount++;
          continue;
        }

        const title = item.title || "Untitled";
        const publishedAt = item.isoDate || item.pubDate || null;

        // Scrape full article text for offline/instant reading.
        const fullText = await scrapeFullText(link);
        const textForAi = fullText || item.contentSnippet || item.content || "";

        // Summarize + extract insights via Gemma. Fails soft to empty
        // strings if the API key is missing or the call errors.
        const { summary, insights } = await summarizeWithGemma(title, textForAi);

        await insertArticle({
          feed_id: feed.id,
          title,
          link,
          published_at: publishedAt,
          full_text: fullText || textForAi,
          summary,
          insights,
        });

        insertedCount++;
      }
    } catch (err) {
      console.error(`Failed to process feed ${feed.url}:`, err);
      errorCount++;
    }
  }

  return NextResponse.json({
    ok: true,
    deletedRead: deletedCount,
    inserted: insertedCount,
    skippedExisting: skippedCount,
    feedErrors: errorCount,
  });
}
