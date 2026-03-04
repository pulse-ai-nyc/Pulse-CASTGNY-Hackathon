# GEO Agent – Generative Engine Optimization for the AI Era

This repository is for building the **GEO Agent**, an AI-powered system that measures and improves a brand’s **Share of Model (SoM)** — the percentage of AI-generated answers in which a brand is mentioned.

The project is designed for a **live-fire hackathon challenge** with strict **live data** requirements.

---

## 1. The New Reality: From SEO to GEO

For 20+ years, brands have competed for Google’s 10 blue links (traditional SEO).

Today, users increasingly ask AI models directly:

- “What are the best international business programs?”
- “What’s the best CRM for startups?”
- “What consulting firm helps international students get U.S. jobs?”

LLMs like ChatGPT, Gemini, Perplexity, and Claude return **one synthesized answer**.  
If your brand is not in that answer, you effectively do not exist in that user’s consideration set.

This gives rise to a new metric:

- **Share of Model (SoM)**: The percentage of AI-generated answers in which your brand is mentioned.

Your mission: **Build the first version of a tool that measures and improves a brand’s SoM.**

---

## 2. Problem Statement

Today, brands generally:

- **Don’t know** whether AI models mention them
- **Don’t know** which competitors are being recommended
- **Don’t know** why those competitors rank
- **Don’t know** what content to create to fix it

We are building the **GEO Agent** — a live AI consultant that:

- Audits a brand’s **Share of Model**
- Explains **why** the brand and competitors rank as they do
- Recommends **concrete actions and content** to improve SoM

---

## 3. Hard Constraint: LIVE DATA ONLY

This is a **live-fire** challenge. The system **must**:

- **Make real API calls** (LLMs, search engines, scraping, etc.)
- **Fetch current web content**
- **Cite real URLs**
- **Show evidence of reasoning**

You **may NOT**:

- Hard‑code brand rankings
- Use prebuilt static datasets
- Fake responses
- Manually curate outputs

If the internet connection is cut, the system should **break**, not silently fall back to canned content.

---

## 4. Brand Scope – Choose ONE Real Brand

Pick **one** real company with an actual digital footprint:

- **Option A: Global Brand**
  - Examples: Nike, Coca‑Cola, Airbnb, Stripe, etc.
- **Option B: Tech Startup**
  - Examples: Linear, Notion, Retool, Webflow, Ramp, etc.
- **Option C: Education / Program Brand**
  - Examples: Semester at Sea, General Assembly, NYU Florence, etc.

No fictional companies.

---

## 5. GEO Agent MVP Requirements

The GEO Agent must convincingly answer **two core questions**:

1. **How well is my brand performing in AI searches?**
2. **How can we improve our positioning?**

### 5.1 How Well Is My Brand Performing in AI Searches?

The agent must:

- **Generate at least 5 high‑intent queries** relevant to the brand  
  - Example: “Best international business programs”  
  - Example: “Top tools for product teams”
- **Query at least 2 AI systems or search tools live**  
  (LLM APIs, Perplexity, web search + synthesis, etc.)

From these responses, the agent must extract:

- **Whether the brand is mentioned**
- **Which competitors are mentioned**
- **Position / order in the answer**
- **Sentiment** (positive, neutral, negative)

Compute a simple **Share of Model score**:

- **% of queries where the brand appears**
- **Relative frequency vs competitors**

And surface **evidence**, including:

- The actual **raw responses**
- **URLs** used
- **Citation references** (e.g., which sources supported which conclusions)

### 5.2 How Can We Improve Our Positioning?

The agent must:

- **Analyze why competitors are ranking**, e.g.:
  - Wikipedia presence?
  - Domain authority?
  - More backlinks?
  - Structured data / schema?
  - Press mentions?
- **Identify content gaps**, e.g.:
  - Missing comparison pages?
  - No listicle presence?
  - No third‑party validation?

Then **automatically generate**:

- A **draft Wikipedia‑style summary** (if appropriate)
- A **comparison page outline**
- A suggested **SEO / GEO content strategy**
- **Structured data** (schema) recommendations

Finally, **prioritize actions**, such as:

- **High impact / Low effort**
- **Medium impact / High effort**

This must be **programmatic**, not manually typed advice.

---

## 6. What Makes This an AGENT (Not Just a Script)

The GEO Agent should:

- Dynamically **generate queries**
- **Loop over tools** (LLM APIs, search APIs, scraping, etc.)
- Decide **next actions** based on intermediate results
- **Aggregate findings** across queries and systems
- Produce a **structured report**

Nice‑to‑have / bonus capabilities:

- Tool calling / tool orchestration
- Retry and fallback logic
- Model comparison (e.g., different LLMs / search engines)
- Autonomous research loops
- Monitoring / re‑runnable pipeline over time

---

## 7. Expected Demo Format

At demo time, you must show:

**Input:**

- Brand name
- Target customer segment (optional)
- A **live run** of the agent

**Output:**

- **Share of Model score**
- **Competitor comparison table**
- **Evidence citations** (links, quoted passages, raw responses)
- **Action plan** (prioritized recommendations)
- **Generated content example** (e.g., wiki summary, comparison page outline)
- **Architecture overview** (2–3 minutes)

---

## 8. Judging Criteria

You will be scored on:

### 8.1 Reliability (30%)

- Uses **live data** and real APIs
- Provides **proper citations**
- Produces **repeatable** results
- Shows **transparent reasoning** (how conclusions were reached)

### 8.2 Insight Quality (25%)

- Findings are **non‑obvious** and interesting
- Competitor analysis is **real**, not generic
- Strategy **logically follows** from evidence

### 8.3 Technical Robustness (25%)

- Quality of **tool orchestration**
- Level of **automation**
- **Error handling** strategy
- **Model usage sophistication** (e.g., multi‑step reasoning, multiple providers)

### 8.4 Clarity to the CEO (20%)

- Non‑technical execs can **understand the output**
- Report is **structured** and easy to scan
- Strategy is **concrete and actionable**

---

## 9. What Winning Teams Usually Do

Winning teams typically:

- Build a **query generator → evaluator → synthesizer** pipeline
- Compare **multiple LLMs / search providers**
- Extract **structured entities** (brands, competitors, rankings, sentiment) from responses
- Build a **scoring framework** for Share of Model
- Produce a polished, **“consultant‑style” report**

Teams that struggle often:

- Just ask a single LLM once
- Manually copy/paste results
- Skip **citations**
- Over‑focus on **UI** instead of reasoning and evidence

---

## 10. Optional Advanced Layer (If Time Allows)

If the core MVP is complete, consider:

- Tracking **Share of Model over time**
- Detecting **misinformation** (incorrect statements about the brand)
- Monitoring **new competitor emergence**
- Suggesting **PR placements** and outreach opportunities
- Building a lightweight **dashboard** for ongoing monitoring

---

## 11. Implementation Notes (For This Repo)

When implementing the GEO Agent in this repository, aim to:

- Use **live APIs** (LLMs, web search, scraping) with proper error handling
- Design a clear **agent loop** that:
  - Generates high‑intent queries
  - Calls multiple models / tools
  - Extracts structured data (entities, rankings, sentiment)
  - Aggregates into **scores, tables, and narratives**
- Output a **single, structured report** (CLI, notebook, or web UI) containing:
  - Share of Model metrics
  - Competitor comparison
  - Evidence and citations
  - Prioritized action plan
  - At least one auto‑generated **content artifact**

This README captures the hackathon challenge specification and serves as the reference for building and demoing the GEO Agent.

