# Tip 4: Analyze Sentiment

**What it is:** Whether the AI's mention of the brand is positive, neutral, or negative in tone.

**How to measure it:**
- Extract the sentence or paragraph where the brand is mentioned
- Classify sentiment using an LLM prompt or a sentiment model
- Assign: positive / neutral / negative

**Example:**
> "Notion is widely regarded as the most versatile tool for team wikis." → **Positive**  
> "Some users report that Notion can be slow with large databases." → **Negative**  
> "Notion is a project management tool." → **Neutral**

**Why it matters:**
Being mentioned is not enough if the mention is negative or warns users away. Sentiment tracking reveals whether AI models are **helping or hurting** the brand's reputation.

**What your agent should do:**
- Tag each brand mention with a sentiment label
- Surface any negative mentions with the exact quote
- Recommend content that addresses negative perceptions (e.g. "Add a performance benchmarks page to counter the 'slow' narrative")
