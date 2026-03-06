# Tip 2: Track Mention Position

**What it is:** Where the brand appears within an AI-generated answer — 1st, 2nd, 3rd, or not listed at all.

**How to measure it:**
- Parse each model's response for brand mentions
- Assign a rank based on the order entities appear (1st mentioned = position 1)
- If the brand is not mentioned, mark as "absent"

**Example:**
> Query: "Best project management tools"  
> Response mentions: Notion (1st), Linear (2nd), Asana (3rd)  
> If your brand is Linear → position = **2nd**

**Why it matters:**
Being mentioned is good. Being mentioned **first** is better. Models often list the "best" or "most popular" option first, and users pay the most attention to early mentions.

**What your agent should do:**
- Extract ordered entity mentions from each response
- Report average position across queries
- Flag when the brand drops from 1st → 3rd or disappears entirely
