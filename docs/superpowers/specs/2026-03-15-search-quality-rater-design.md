# search_quality_rater Design

> **For agentic workers:** Follow brainstorming → spec review → implementation plan workflow. Implementation must use the agreed Node.js/TypeScript approach inside this monorepo.

**Goal:** Deterministic webpage quality rater that scores a URL against Page Purpose, E-E-A-T, Content Quality, Reputation, Transparency, UX, and Other signals, returning structured JSON, an API endpoint, and a CLI command.

**Architecture:** New package `packages/search-quality-rater` in TypeScript. Core analyzer functions operate on provided HTML/text or fetch the page. Uses jsdom + @mozilla/readability for main content, cheerio for meta/DOM parsing, deterministic heuristic scorers with fixed weights. Shared analyzer powers API handler and CLI.

**Tech Stack:** Node.js (existing pnpm workspace), TypeScript, cheerio, jsdom, @mozilla/readability, node-fetch (or native fetch), yargs (CLI), express (thin API example), deterministic scoring utilities.

---

## Scope & Deliverables

- Library package exporting required functions: `analyze_page`, `extract_main_content`, `classify_page_purpose`, `evaluate_eeat`, `evaluate_content_quality`, `evaluate_reputation`, `evaluate_transparency`, `evaluate_ux`, `generate_recommendations`.
- Deterministic scoring pipeline with fixed weights (Purpose 10, EEAT 25, Content 25, Reputation 10, Transparency 10, UX 10, Other 10).
- Structured JSON output with total score, rating bucket, breakdown, detected_entities, recommendations.
- API endpoint: POST `/analyze` accepting the input schema, returning JSON.
- CLI: `antigravity run search_quality_rater <url> [--html path|--content-text path] [--timeout ms] [--output json]`.
- Logging: structured reasoning steps embedded in result (not console noise).
- Error handling: stable failure modes (timeout, unreachable, empty content, parse failure) and partial scoring fallback.

## Input Schema

```json
{
  "url": "string",
  "html": "optional raw html",
  "content_text": "optional extracted text",
  "external_signals": {
    "backlinks": "optional number",
    "reviews": "optional number",
    "brand_mentions": "optional number"
  }
}
```

If `html` is missing, the analyzer fetches it (with timeout, redirects allowed). `content_text` can short-circuit extraction when provided.

## Output Schema

```json
{
  "url": "",
  "page_quality_score": 0,
  "quality_rating": "",
  "breakdown": {
    "page_purpose": 0,
    "eeat": 0,
    "content_quality": 0,
    "reputation": 0,
    "transparency": 0,
    "user_experience": 0,
    "other_signals": 0
  },
  "detected_entities": [],
  "recommendations": [
    {
      "message": "string",
      "category": "eeat|content|reputation|transparency|ux|purpose|other",
      "severity": "low|medium|high"
    }
  ],
  "trace": {
    "fetch": { "status": 0, "duration_ms": 0, "error": null, "final_url": "" },
    "extraction": {
      "ok": true,
      "method": "readability|fallback",
      "word_count": 0,
      "error": null
    },
    "scores": {
      "page_purpose": { "score": 0, "notes": "" },
      "eeat": { "score": 0, "notes": "" },
      "content_quality": { "score": 0, "notes": "" },
      "reputation": { "score": 0, "notes": "" },
      "transparency": { "score": 0, "notes": "" },
      "user_experience": { "score": 0, "notes": "" },
      "other_signals": { "score": 0, "notes": "" }
    }
  },
  "error": null
}
```

`error` is null on success; on failure it carries a stable code and message (see Error Handling). `quality_rating` buckets: 90–100 Highest Quality, 75–89 High, 60–74 Medium, 40–59 Low, 0–39 Lowest.

## Processing Pipeline

1. **Fetch (if needed):** fetch HTML with timeout, follow redirects. Capture final URL, status, headers.
2. **Extract main content:** jsdom + @mozilla/readability to get `page_content`, `page_title`, `meta_description`, `author`, `site_name`, cleaned text.
3. **Classify purpose:** heuristic classification into informational/transactional/service/news/product/affiliate/spam/deceptive; compute purpose validity score (0–10).
4. **Score blocks:**

- **E-E-A-T (0–25):** author/byline present (0/2), credentials keywords (0/3), about/contact presence (0/4), citations/external references count (0/6, scaled at 0/1–2/3–5/6+), disclaimer on YMYL (0/5), domain trust hints (0/5). YMYL detection: classify YMYL if medical/financial/legal/loan/investment/health keywords appear in title/meta/body; when YMYL and missing disclaimer/credentials, cap EEAT at 12.
- **Content Quality (0–25):**
  - Word count: <300=2, 300–800=6, 800–1500=10, 1500–3000=12, >3000=15.
  - Heading density (H1–H3 per 500 words): <1 =>0, 1–3 =>2, 4–8 =>3, >8 =>2 (avoid over-markup).
  - Repetition/duplication ratio (unique tokens / total tokens): <0.78 => -3 points, 0.78–0.86 => -1 point, else 0; cannot go below 0 for this sub-block.
  - Topical coverage (keyword/entity hits matching purpose intent): 0 hits=0, 1–2=1, 3–5=3, >5=4.
  - Readability proxy (avg sentence length in words): >28 =>0, 22–28 =>1, 15–22 =>2, <15 =>3.
  - Empty text caps overall content_quality at 3.
- **Reputation (0–10):** external_signals numbers mapped: backlinks count (0 =>0, 1–10 =>2, 11–100 =>4, >100 =>6), reviews count (0 =>0, 1–10 =>2, >10 =>4), brand_mentions count (0 =>0, 1–5 =>1, >5 =>2). On-page trust badges/references add up to 2. Missing signals default to count=0. Cap at 10. Units: counts (integers); non-numeric inputs treated as 0.
- **Transparency (0–10):** about link (0/3), contact link (0/3), privacy policy (0/2), editorial/author profile (0/2).
- **UX (0–10):**
  - Viewport meta present: 0/2.
  - Heading hierarchy valid (one H1, non-skipping H levels): 0/2.
  - Ads/scripts/iframes ratio by node count: >35% =>0, 20–35% =>1, 10–20% =>2, <10% =>3.
  - Interstitial markers (fullscreen overlay keywords/modals): present => -2 else 0.
  - Link density per 500 words: >120 =>0, 60–120 =>1, 20–60 =>2, <20 =>1.
  - Image density per 500 words: >50 =>0, 10–50 =>2, 1–10 =>3, 0 =>1.
  - Floor at 0 after sum.
- **Other Signals (0–10):** sitemap.xml link in `<link rel="sitemap">` or robots.txt link in header => +1; structured data `script[type*="ld+json"]` present => +1 (max +2 combined). Excessive inline scripts/styles: inline `<script>` count >50 => -3, 25–50 => -2, 10–25 => -1, else 0. Blocked fetch => -5 and cap at 0. Empty content => -5 and cap at 0. Score floor 0, cap 10.

5. **Aggregate:** sum weighted scores to 100, derive `quality_rating` bucket.
6. **Recommendations:** rule-based suggestions keyed off low sub-scores; each recommendation includes message, category, severity (see Output Schema).

## Error Handling

- Stable errors with `error.code` (e.g., `FETCH_TIMEOUT`, `FETCH_FAILED`, `EMPTY_CONTENT`, `PARSE_FAILED`) and `error.message`.
- Timeouts/unreachable: set error, zero most scores, apply `other_signals` penalty (0–3) and add recommendation to check availability.
- Empty/low-content pages: lower content_quality and other_signals; recommendation to add substantive content.
- Parse failure: fallback to raw text split; mark extraction error in trace.
- Always return deterministic structure even on errors; `quality_rating` may default to Lowest when fatal.

## Determinism & Logging

- No randomness; fixed weights/constants; stable defaults when signals are missing.
- Normalize fetch headers (UA string), enforce charset decoding via jsdom, strip tracking params when hashing for duplication checks.
- Structured trace object with per-step notes (fetch status, extraction success, classifier decision, score components) per the Output Schema.

## API Endpoint (example)

- Location: lightweight handler (e.g., `packages/search-quality-rater/api/handler.ts`).
- POST `/analyze` body: input schema. Response: output schema. Headers: `content-type: application/json`.
- Status codes: 200 on success (even with partial signals), 400 on invalid input, 502 on fetch failures, 500 on unexpected errors (still include `error` in body).
- Timeout: default 8s fetch timeout, 10s overall handler timeout.
- Minimal dependencies (express). No auth/opinionated middleware by default.

## CLI

- Entrypoint `packages/search-quality-rater/bin/search-quality-rater.ts`.
- Command: `antigravity run search_quality_rater <url>` with flags `--html`, `--content-text`, `--timeout`, `--output json`, `--output-file path`.
- Default output: pretty JSON to stdout; exit code 0 on success, non-zero on fetch/parse/input errors.

## File Plan (package)

- `packages/search-quality-rater/src/index.ts` (exports functions)
- `packages/search-quality-rater/src/fetch.ts`
- `packages/search-quality-rater/src/extract.ts`
- `packages/search-quality-rater/src/classify.ts`
- `packages/search-quality-rater/src/score-eeat.ts`
- `packages/search-quality-rater/src/score-content.ts`
- `packages/search-quality-rater/src/score-reputation.ts`
- `packages/search-quality-rater/src/score-transparency.ts`
- `packages/search-quality-rater/src/score-ux.ts`
- `packages/search-quality-rater/src/score-other.ts`
- `packages/search-quality-rater/src/recommendations.ts`
- `packages/search-quality-rater/src/types.ts`
- `packages/search-quality-rater/src/weights.ts`
- `packages/search-quality-rater/bin/search-quality-rater.ts` (CLI)
- `packages/search-quality-rater/api/handler.ts` (sample endpoint)

## Testing

- Unit tests per scorer and extractor (jest) in `packages/search-quality-rater/__tests__/*`.
- Fixture HTML samples (good content, spammy page, affiliate-heavy, product page, empty page).
- Deterministic snapshot of breakdown/recommendations for fixture inputs.

## Open Questions / Assumptions

- Using express vs fastify: default to express unless repo prefers otherwise.
- Use native fetch if Node version supports; otherwise node-fetch. (We’ll detect environment.)
- Entity extraction kept heuristic (no heavy NLP) to stay deterministic and lightweight; detected_entities are simple keyword/entity hits from main content.
