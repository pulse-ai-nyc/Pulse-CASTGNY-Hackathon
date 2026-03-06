# Tip 6: Add Structured Data (Schema.org)

**What it is:** Schema.org markup on the brand's website that tells search engines and AI models **what this entity is** and what it offers — in a machine-readable format.

**How to measure it:**
- Scrape or fetch the brand's key pages (homepage, product, FAQ)
- Check for JSON-LD or Microdata schema: Organization, Product, FAQ, Article, Review, etc.
- Compare against competitors' schema coverage

**Example:**
> Competitor has: Organization, Product, FAQ, and Review schema on their homepage  
> Your brand has: none  
> → **Gap identified**

**Why it matters:**
Structured data makes it trivially easy for models and search engines to extract facts like "What does this company do?", "What are their products?", "What do reviews say?" Without it, the model has to guess — and it may guess wrong or skip you entirely.

**What your agent should do:**
- Scan the brand's site for existing schema
- Report what's missing vs what competitors have
- Recommend specific schema types to add (e.g. "Add FAQ schema for your top 5 questions")
