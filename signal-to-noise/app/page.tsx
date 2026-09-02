import Link from "next/link";
import { getFeeds, getArticles, getArticleById } from "@/lib/db";
import { markReadAction, markAllReadAction } from "@/app/actions";

// Pure server component. All "state" (which feed/article is open) lives
// in the URL, so the mobile column-switching below is done entirely with
// Tailwind responsive classes — no client JS required.
export default async function Home({
  searchParams,
}: {
  searchParams: { feed?: string; article?: string };
}) {
  const feedId = searchParams.feed ? Number(searchParams.feed) : undefined;
  const articleId = searchParams.article ? Number(searchParams.article) : undefined;

  const [feeds, articles, activeArticle] = await Promise.all([
    getFeeds(),
    getArticles(feedId),
    articleId ? getArticleById(articleId) : Promise.resolve(null),
  ]);

  // Visibility rules driving the mobile "one column at a time" behavior.
  // On md+ screens all three columns are always visible (md:flex).
  const showSidebar = !feedId; // default mobile view
  const showList = Boolean(feedId) && !articleId;
  const showReader = Boolean(articleId);

  return (
    <main className="flex h-screen w-full overflow-hidden">
      {/* LEFT: Feed sidebar */}
      <aside
        className={`${showSidebar ? "flex" : "hidden"} md:flex w-full md:w-64 shrink-0 flex-col border-r border-zinc-800 bg-zinc-950`}
      >
        <div className="border-b border-zinc-800 px-4 py-4">
          <h1 className="text-lg font-semibold text-white">Signal-to-Noise</h1>
          <p className="text-xs text-zinc-500">AI research digest</p>
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
          <Link
            href="/"
            className={`block px-4 py-2 text-sm ${
              !feedId ? "bg-zinc-900 text-white" : "text-zinc-300 hover:bg-zinc-900"
            }`}
          >
            All feeds
          </Link>
          {feeds.map((feed) => (
            <Link
              key={feed.id}
              href={`/?feed=${feed.id}`}
              className={`block px-4 py-2 text-sm ${
                feedId === feed.id
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-300 hover:bg-zinc-900"
              }`}
            >
              {feed.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* MIDDLE: Article list */}
      <section
        className={`${showList ? "flex" : "hidden"} md:flex w-full md:w-96 shrink-0 flex-col border-r border-zinc-800 bg-black`}
      >
        <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-4">
          {/* Mobile-only back link — the whole point of URL-driven nav */}
          <Link href="/" className="text-sm text-zinc-400 hover:text-white md:hidden">
            &larr; Feeds
          </Link>
          <h2 className="hidden text-sm font-medium text-white md:block">
            {feedId ? feeds.find((f) => f.id === feedId)?.name : "All Articles"}
          </h2>

          <form action={markAllReadAction}>
            {feedId && <input type="hidden" name="feedId" value={feedId} />}
            <button
              type="submit"
              className="rounded border border-zinc-800 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-900"
            >
              Mark all as read
            </button>
          </form>
        </div>

        <ul className="flex-1 overflow-y-auto">
          {articles.length === 0 && (
            <li className="px-4 py-6 text-sm text-zinc-500">No unread articles.</li>
          )}
          {articles.map((article) => (
            <li key={article.id} className="border-b border-zinc-900">
              <Link
                href={`/?${feedId ? `feed=${feedId}&` : ""}article=${article.id}`}
                className={`block px-4 py-3 hover:bg-zinc-900 ${
                  articleId === article.id ? "bg-zinc-900" : ""
                }`}
              >
                <p className="line-clamp-2 text-sm font-medium text-white">
                  {article.title}
                </p>
                {article.summary && (
                  <p className="mt-1 line-clamp-2 text-xs text-zinc-500">
                    {article.summary}
                  </p>
                )}
                <p className="mt-1 text-[11px] text-zinc-600">
                  {article.published_at
                    ? new Date(article.published_at).toLocaleString()
                    : ""}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* RIGHT: Reading pane */}
      <section
        className={`${showReader ? "flex" : "hidden"} md:flex flex-1 flex-col overflow-y-auto bg-black`}
      >
        {activeArticle ? (
          <div className="mx-auto w-full max-w-3xl px-6 py-8">
            <Link
              href={feedId ? `/?feed=${feedId}` : "/"}
              className="mb-6 inline-block text-sm text-zinc-400 hover:text-white md:hidden"
            >
              &larr; Back to list
            </Link>

            <div className="mb-6 flex items-start justify-between gap-4">
              <h1 className="text-2xl font-bold text-white">{activeArticle.title}</h1>
              <form action={markReadAction} className="shrink-0">
                <input type="hidden" name="id" value={activeArticle.id} />
                <button
                  type="submit"
                  className="rounded border border-zinc-800 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-900"
                >
                  Mark as read
                </button>
              </form>
            </div>

            {(activeArticle.summary || activeArticle.insights) && (
              <div className="mb-8 rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                {activeArticle.summary && (
                  <>
                    <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      Summary
                    </h3>
                    <p className="mb-4 text-sm text-zinc-300">{activeArticle.summary}</p>
                  </>
                )}
                {activeArticle.insights && (
                  <>
                    <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      Insights
                    </h3>
                    <p className="text-sm text-zinc-300">{activeArticle.insights}</p>
                  </>
                )}
              </div>
            )}

            <article className="prose prose-invert max-w-none">
              {(activeArticle.full_text || "No article text available.")
                .split("\n\n")
                .map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
            </article>

            <a
              href={activeArticle.link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-block text-sm text-zinc-500 hover:text-white"
            >
              View original source &rarr;
            </a>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-zinc-600">
            Select an article to start reading.
          </div>
        )}
      </section>
    </main>
  );
}
