# Tip 5: Check Citation Presence

**What it is:** Whether the AI model cites or links to the brand's own website (or any URL mentioning the brand) in its response.

**How to measure it:**
- From each API response, extract any cited URLs or sources
- Check if the brand's domain (e.g. `yourbrand.com`) appears in those citations
- Also check if third-party sources that mention the brand are cited

**Example:**
> Perplexity response cites: forbes.com, g2.com, competitor.com  
> Your brand's site is **not cited** → citation presence = **No**

**Why it matters:**
Citations are the bridge between AI answers and user trust. If a model cites your site, the user can click through. If it doesn't, you're invisible even when mentioned. Citation presence also signals that your content is seen as authoritative enough to reference.

**What your agent should do:**
- List all cited URLs per query
- Flag whether the brand's domain appears
- Recommend actions to become more "citable" (structured data, unique data/research, authoritative content)
