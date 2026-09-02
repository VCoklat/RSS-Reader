import * as cheerio from "cheerio";

// Best-effort full-article scraper. Strips nav/script/style noise and
// concatenates paragraph text so we have offline-readable full_text
// instead of relying on (often truncated) RSS descriptions.
export async function scrapeFullText(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; SignalToNoiseBot/1.0)" },
      // Cron functions have a timeout budget; don't hang on slow sites.
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return "";

    const html = await res.text();
    const $ = cheerio.load(html);

    $("script, style, nav, header, footer, aside, noscript").remove();

    // Prefer <article> content when the site provides it, else fall back
    // to all paragraph tags on the page.
    const container = $("article").length ? $("article") : $("body");
    const paragraphs = container
      .find("p")
      .map((_, el) => $(el).text().trim())
      .get()
      .filter((t) => t.length > 40); // drop boilerplate one-liners

    return paragraphs.join("\n\n");
  } catch (err) {
    console.error(`Scrape failed for ${url}:`, err);
    return "";
  }
}
