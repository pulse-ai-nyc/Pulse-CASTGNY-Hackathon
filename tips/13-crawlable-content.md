# Tip 13: Ensure Content Is Crawlable

**What it is:** Whether a web crawler (or an AI's retrieval tool) can extract clean, readable text from the brand's key pages.

**How to measure it:**
- Fetch key pages (homepage, product, pricing, FAQ) with a scraping tool
- Check if the main content is available as plain text (not locked behind JavaScript rendering, login walls, or embedded in images)
- Compare to competitors: can their content be extracted cleanly?

**Example:**
> Your brand's homepage is a single-page app that loads all content via JavaScript  
> A basic scraper returns an empty page  
> → AI retrieval tools can't read your content, so they skip you

**Why it matters:**
If a model's retrieval system can't extract text from your site, your content doesn't exist to that model. This is the most fundamental technical requirement — everything else (schema, FAQ, backlinks) is useless if the content itself can't be read.

**What your agent should do:**
- Attempt to scrape key pages and report whether clean text is returned
- Flag pages that return empty or JS-only content
- Recommend server-side rendering, static HTML fallbacks, or a text-based sitemap
