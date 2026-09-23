# SEO Audit — Ismile Creative & Digital Solutions

Audit date: 2026-09-22  
Primary market: United States  
Secondary market: Canada, with selective Toronto/GTA intent

## Executive summary

The site is a hand-authored static HTML website with a Node-based content build for Markdown blog posts and two Markdown case studies. Pages are server-delivered HTML rather than a client-rendered application, so core copy, headings, links, canonicals, and structured data are crawlable without JavaScript. Routing is file-based (`page.html`). Shared visual behavior lives in `site-widgets.js`, `loader.js`, and page-level CSS/JavaScript; blog and generated project layouts live in `templates/`.

The audit found no verified site-wide indexing blocker. The most important gaps were sparse structured data, generic/duplicated titles, an incomplete manually maintained sitemap, indexable prototypes/demos, geography language that often stopped at Toronto/Canada, oversized images, and two meaningful orphan pages. Safe fixes were implemented without changing URLs, navigation structure, forms, booking integrations, visual identity, or the core conversion message.

Current automated result: 45 root HTML files checked; 38 canonical pages are indexable. Metadata, JSON-LD syntax, one-H1/one-main structure, local links and images, robots rules, and sitemap coverage pass `npm run seo:check`.

## CRITICAL

No critical crawl, rendering, canonical, or accidental site-wide `noindex` issue was verified.

## HIGH

| Problem | Why it matters | Affected file/page | Recommended fix | Fixed? | How to test |
|---|---|---|---|---|---|
| Structured data existed only on the home and legal-services pages; articles and case studies had none | Search and answer systems had weaker entity, authorship, service, page-type, and relationship signals | Home, five core service pages, legal services, About, Contact, Portfolio, all blog posts, and all case studies | Use one `@id` system rooted at `/#organization` and `/#website`; add accurate WebPage, Service, BlogPosting, CreativeWork, CollectionPage, AboutPage, ContactPage, and BreadcrumbList nodes | Yes | Run `npm run build && npm run seo:check`; then test deployed URLs with Schema.org Validator and Google Rich Results Test |
| Public prototypes and full demo sites had no indexing directive | Thin fragments and fictional demo businesses could be indexed, dilute site quality, or be mistaken for real entities | `ismile-*.html`, `professional-services-landing.html`, `Cafe/index.html`, `gym1/gym-index.html`, `The Ember Room/index.html`, `LeoLaw/leo-law-index.html` | Add `noindex, nofollow`; keep them out of the sitemap | Yes | View source and verify the robots meta; use URL Inspection after deployment |
| The manually maintained sitemap omitted at least one canonical article and could drift again | Missing URLs reduce discovery consistency; inaccurate lists send conflicting canonical signals | `sitemap.xml`, notably `branding-cost-canada-vs-us.html`; `build.js` | Generate the sitemap from explicit index/follow HTML and self-referencing canonicals during every build | Yes | Run `npm run build`; compare sitemap URLs to indexable canonicals with `npm run seo:check` |
| Multiple commercial titles were generic; both blog pagination pages shared the same title | Weak topical relevance and duplicate titles reduce clarity and click potential | Core service pages, About, Contact, Portfolio, `blog-page-2.html`, long article titles | Assign unique intent-led titles while preserving page copy and brand voice | Yes | `npm run seo:check`; inspect title output in built HTML and Search Console after recrawl |
| Several critical images were extremely large (two portfolio PNGs were about 4–5 MB each) | Large transfers can delay LCP, waste mobile bandwidth, and reduce conversion performance | `Forma-site.png`, `Leolawfirmsite-mockup.png`, service hero JPEGs, bunny assets | Compress source assets; use resized WebP derivatives for the largest rendered images; preserve originals as fallbacks/source assets | Yes | Verify WebP requests in browser Network panel; run Lighthouse on home, portfolio, web design, and service pages |
| Analytics uses the placeholder `G-XXXXXXXXXX` | Organic leads and landing-page performance cannot be measured reliably until a real property is connected | `site-widgets.js` | Create/verify GA4, replace the placeholder, preserve consent gating, and test events | No — external ID required | Use GA4 DebugView and Tag Assistant after configuration |

## MEDIUM

| Problem | Why it matters | Affected file/page | Recommended fix | Fixed? | How to test |
|---|---|---|---|---|---|
| Site-wide descriptions often presented the agency as Toronto-based without consistently stating the U.S./Canada service area | The business could appear Toronto-only despite serving clients across North America | Homepage, About page, shared footers, business consulting copy, homepage schema | Lead with “North American digital agency serving businesses across the U.S. and Canada”; retain Toronto as the factual base and explain the remote delivery model | Yes | Search built HTML for geography terms; review U.S. and Canada impressions in Search Console |
| `emekaholistics.html` and `legal-services.html` had no crawlable incoming link from another root page | Orphan pages are harder for users and crawlers to discover and receive no internal authority | Portfolio and Leo Law case study | Add Emekaholistics to the portfolio and a contextual legal-services link from the relevant law-firm project | Yes | Run an internal-link crawl; the repository graph should show incoming links |
| Most images omitted intrinsic dimensions | Missing aspect-ratio information can contribute to CLS | Nearly all root HTML and templates | Add build-time image dimension enrichment using local metadata and dimensions encoded in Wix URLs | Mostly — 267 warnings reduced to 3 | Run `npm run build && npm run seo:check`; remaining warnings are external Unsplash hero images in fixed-size containers |
| Six policy/utility pages referenced a nonexistent `og-image.jpg` | Shared links could render without a preview image | 404, accessibility, cookies, data request, do-not-sell, privacy | Point OG and X image tags to an existing absolute image | Yes | Use an Open Graph debugger or request the declared image URL |
| Crawler policy did not explicitly distinguish ChatGPT search crawling from training crawling | OAI-SearchBot and GPTBot serve different purposes; an implicit rule hides the business decision | `robots.txt` | Explicitly allow OAI-SearchBot and preserve the pre-existing allow posture for GPTBot in a separate block | Yes | Fetch `/robots.txt`; test with the relevant user agents and review CDN/WAF logs |
| No safe IndexNow submission workflow existed | Updated articles and service pages may be discovered more slowly by participating engines | Repository/deployment workflow | Add an environment-driven script, host verification key after user setup, and submit only after deployment | Code ready; external setup pending | Follow `INDEXNOW-SETUP.md`; verify HTTP 200/202 and Bing Webmaster reporting |
| Important commercial H1s are persuasive slogans rather than literal service labels | The adjacent eyebrow and body clarify the topic, but a descriptive H1 may improve extraction and topical clarity | Five primary service pages and homepage | Keep current conversion copy for now; A/B test a descriptive H1 plus the current line as supporting display copy | No — intentionally protected conversion copy | Compare organic CTR, engagement, and booked consultations before changing |
| Several articles contain statistics and market/pricing statements without visible source citations | Unsupported or time-sensitive facts weaken trust and AI citation readiness | Especially `branding-cost-canada-vs-us.md`, `why-small-business-needs-a-website.md`, `automate-client-onboarding.md`, `virtual-assistance-guide.md` | Editorially verify each figure, link to a primary source, date the claim, or remove it; do not refresh figures automatically | No — requires editorial fact-check | Maintain a claim/source sheet and manually review each article before its next publish date |
| Third-party fonts, animation libraries, remote images, booking, and form endpoints create availability and performance dependencies | CDN latency or blocking can affect UX even though HTML remains crawlable | Most public pages | Self-host or bundle only after performance testing; keep graceful fallbacks; consider `defer` for scripts that do not require immediate execution | Partial | Test with third-party requests blocked and run Lighthouse/WebPageTest on representative pages |
| HTTP redirect and status behavior is not defined in the repository | Canonical host/protocol redirects and a true 404 status must be handled by hosting | Hosting/CDN configuration | Enforce HTTPS + `www`, map `/index.html` to `/`, return HTTP 404 for missing routes, and define redirects before any future URL change | No — hosting access required | Use `curl -I` against HTTP/non-www/index and a nonexistent URL after deployment |

## LOW

| Problem | Why it matters | Affected file/page | Recommended fix | Fixed? | How to test |
|---|---|---|---|---|---|
| No optional machine-readable site guide existed | It can make key resources easier for some agents to discover, but is not an established ranking factor | Site root | Add a conservative `llms.txt` that points only to canonical facts and pages | Yes | Request `/llms.txt`; confirm all linked URLs are canonical and public |
| Sitemap maintenance depended on hand-entered dates and included legacy priority/changefreq values | Those values are easy to stale and are not needed for this site | `sitemap.xml` | Generate canonical URLs and actual file/source modification dates; omit unsupported guesses | Yes | Inspect output after `npm run build` |
| `loader.js` intentionally blocks briefly to avoid a flash while injecting the loader | It adds main-thread work and delays full content display, though content remains in HTML | Most pages | Retain because it is part of the current experience; measure before changing and keep reduced-motion bypass | Not changed | Profile main thread and LCP with and without the loader in a staging experiment |
| Three remote hero images cannot receive verified intrinsic dimensions from local metadata | The audit retains warnings even though CSS fixes their containers | `legal-services.html`, `leo-law.html` | Download approved local copies or document verified source dimensions before adding attributes | No | `npm run seo:check`; visually test if images are localized later |

## Architecture and crawl review

- Framework/rendering: static HTML with Node/Markdown generation; no SPA or hydration dependency.
- Routing: file-based `.html` routes. No routing manifest or server redirect file is present.
- Reuse: build templates for articles/blog/two projects; shared JavaScript widgets; most layout CSS and navigation remain duplicated across HTML pages.
- Crawlability: meaningful content, links, CTAs, headings, and metadata are present in source HTML. Animation does not create the content.
- Headings: all 38 indexable root pages have exactly one H1 and one `<main>` after the build.
- Canonicals: all 38 indexable pages have unique self-referencing canonicals.
- Robots: no accidental `noindex` is present on sitemap URLs. Prototype/demo pages are explicitly excluded through page-level meta directives.
- Broken local references: none detected in the root public pages after URL decoding.
- Mobile: responsive breakpoints exist throughout; custom cursor is disabled and navigation collapses on mobile. Browser/device QA is still required after deployment.
- Accessibility affecting SEO: skip links and focus-visible styles already exist on primary templates/pages; all checked images have alt attributes. Alt quality still requires ongoing human review.
- Duplicate/thin content: prototypes are now noindex. Separate U.S. copies and mass city pages were not created because no distinct content justified them.
- Local SEO: Toronto remains the truthful base; no street address, U.S. office, rating, or review schema was invented. Organization schema uses Toronto plus U.S./Canada service areas.

## Validation references

- Google Search Central: <https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap>
- Google canonical guidance: <https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls>
- Google organization structured data: <https://developers.google.com/search/docs/appearance/structured-data/organization>
- OpenAI crawler documentation: <https://developers.openai.com/api/docs/bots>
- IndexNow protocol: <https://www.indexnow.org/documentation>

## External setup checklist

Nothing below was claimed as configured because the repository does not provide account or hosting-console access.

### Google Search Console

- Verify the Domain property for `byismile.com` through DNS.
- Submit `https://www.byismile.com/sitemap.xml`.
- Inspect the homepage, each core service, legal services, portfolio, and one article after deployment.
- Monitor indexing exclusions, duplicate/canonical selection, Core Web Vitals, queries by country, and booked-call landing pages.
- Request recrawling only for the most important changed pages; sitemap discovery should handle the rest.

### Google Business Profile

- Confirm the exact public business name is “Ismile Creative & Digital Solutions”; do not add keywords to the name.
- Use the truthful Toronto base and configure service-area/hide-address settings according to the real operating model.
- Add only services actually offered, use the canonical website URL, maintain current hours/contact details, and request/respond to genuine reviews.
- Link GBP to GA4/Search Console reporting where the account supports it and tag the website URL consistently.

### Bing Webmaster Tools

- Verify the site (or import from Search Console), submit the sitemap, and review Site Scan/index coverage.
- After the key file is deployed, test the repository’s IndexNow command and monitor submitted URLs.

### Bing Places

- Claim or verify the real Toronto listing if eligible.
- Keep the name, phone, URL, category, and service-area facts consistent with the website and Google Business Profile.
- Do not create U.S. listings or addresses unless real staffed locations exist.

### IndexNow

- Follow `INDEXNOW-SETUP.md`: deploy the key file, set environment variables, submit after deployment, and review Bing reporting.

### Google Analytics 4

- Replace `G-XXXXXXXXXX` in `site-widgets.js` with the real Measurement ID.
- Preserve consent gating and test in DebugView.
- Configure events for successful form submission, calendar-booking outbound clicks, email clicks, and primary CTA clicks. Mark only the real lead/booking events as key events.
- Exclude internal traffic and document cross-domain behavior if the booking flow needs attribution across `calendar.app.google`.

### Microsoft Clarity

- Create the project only if session recording is appropriate for the privacy policy and target jurisdictions.
- Load Clarity only after the relevant consent choice, mask form fields and sensitive content, and test the mobile sticky CTA/form experience.

### Hosting, CDN, and WAF

- Enforce permanent HTTP → HTTPS, non-`www` → `www`, and `/index.html` → `/` redirects without chains.
- Ensure missing routes return HTTP 404 while serving the custom 404 body.
- Confirm Googlebot, Bingbot, and OAI-SearchBot are not blocked by bot protection; validate OpenAI traffic against its published IP ranges rather than trusting the user-agent alone.
- Enable Brotli/Gzip, long immutable caching for versioned/static images and scripts, and suitable shorter caching for HTML, robots, sitemap, and `llms.txt`.
