# SEO Changelog

Date: 2026-09-22

## North American agency positioning

- `index.html` — repositioned Ismile as a North American digital agency serving businesses across the U.S. and Canada in the title, description, social metadata, hero, FAQ, footer, and Organization/WebPage schema.
- `about.html` — made the North American service area the lead positioning while retaining Toronto as the agency's factual base and remote operating model.
- Shared footers and build templates — standardized the site-wide line to “North American digital agency serving businesses across the U.S. and Canada. Based in Toronto, working remotely.”
- `llms.txt` and `SEO-KEYWORD-MAP.md` — aligned machine-readable business facts and keyword strategy with the new positioning.

## USA commercial modifiers

- `web-design.html` — added natural support for `web design agency USA` and `small business web design USA` through the description, visible service copy, FAQ, and Service/WebPage schema without displacing Toronto as the local base.
- `digital-marketing.html` — added `digital marketing agency USA` and `SEO services USA` through the description, hero, SEO service copy, FAQ, and schema while retaining Toronto and Canada relevance.
- `systems-automations.html` — added `AI automation agency USA` and `business automation company USA` through service-area copy, an FAQ, metadata, and schema while preserving broader workflow-automation positioning.
- `SEO-KEYWORD-MAP.md` — recorded all six U.S. modifiers as secondary themes rather than forcing them into every page title.

## Toronto keyword refinement

- `web-design.html` — assigned `web design Toronto` as the primary local theme across the title, description, social metadata, visible hero copy, and Service/WebPage schema while preserving U.S. and Canada remote-delivery language.
- `digital-marketing.html` — assigned `digital marketing Toronto` as the primary local theme and `SEO Toronto` as a supporting theme across metadata, visible copy, and Service/WebPage schema while preserving cross-border delivery language.
- `SEO-KEYWORD-MAP.md` — documented page ownership for all three Toronto terms; kept `SEO Toronto` on the established digital-marketing page to prevent a thin, competing service page.

## Build, crawl, and automation

- `build.js` — added unique generated titles/descriptions, article/project/blog JSON-LD, shared entity IDs, and automatic sitemap generation from canonical indexable pages.
- `package.json` — made image enrichment part of the build and added `seo:check` and opt-in `indexnow` commands.
- `scripts/enrich-static-case-studies.js` — new idempotent build step that maintains descriptive metadata and connected CreativeWork/WebPage/Breadcrumb schema on seven hand-authored case studies.
- `scripts/optimize-html-images.js` — new build step that adds verified intrinsic image dimensions and async decoding where source metadata is available.
- `scripts/seo-check.js` — new automated audit for metadata, duplicate titles/canonicals, H1/main counts, JSON-LD syntax, local links/images, robots rules, and sitemap parity.
- `scripts/submit-indexnow.js` — new environment-driven, same-host-only IndexNow submission client; it is not run automatically.
- `robots.txt` — explicitly allows Googlebot, Bingbot, and OAI-SearchBot; preserves the existing GPTBot allow posture in a separate rule; retains the sitemap declaration.
- `sitemap.xml` — regenerated with all 38 canonical indexable pages, including the previously omitted branding-cost article, and source/file modification dates.
- `llms.txt` — added an optional machine-readable directory of canonical business facts, services, and primary pages; no ranking claim is made.

## Templates

- `templates/post-template.html` — added short SEO-title support, article hero images in social metadata, and generated BlogPosting/WebPage/Breadcrumb JSON-LD.
- `templates/blog-template.html` — added unique pagination metadata and CollectionPage/Breadcrumb JSON-LD.
- `templates/project-template.html` — added case-study titles and CreativeWork/WebPage/Breadcrumb JSON-LD.
- `templates/portfolio-template.html` — received the shared U.S./Canada footer wording and intrinsic image dimensions from the maintenance pass.

## Core pages

- `index.html` — replaced isolated ProfessionalService markup with a connected Organization/WebSite/WebPage graph using truthful Toronto base and U.S./Canada service areas; added image dimensions.
- `branding-and-design.html` — improved commercial metadata, added Service/WebPage/Breadcrumb schema, updated cross-border service language, switched hero background to optimized WebP, and added image dimensions.
- `web-design.html` — improved commercial metadata, added Service/WebPage/Breadcrumb schema, switched a 4 MB portfolio image to resized WebP, and added image dimensions.
- `digital-marketing.html` — improved commercial metadata, added Service/WebPage/Breadcrumb schema, updated service-area language, and added image dimensions.
- `systems-automations.html` — aligned metadata with business automation/AI intent, added Service/WebPage/Breadcrumb schema, switched hero background to WebP, and added image dimensions.
- `business-consulting.html` — improved commercial metadata, added Service/WebPage/Breadcrumb schema, explicitly stated remote U.S./Canada delivery, switched hero background to WebP, and added image dimensions.
- `legal-services.html` — removed Toronto from the title while preserving Ontario-specific intent, connected its schema to the site entity, and added page/breadcrumb nodes and available image dimensions.
- `about.html` — improved branded title, added AboutPage/Breadcrumb schema, reinforced remote U.S./Canada delivery in shared copy, and added image dimensions.
- `contact.html` — improved transaction-focused title, added ContactPage/Breadcrumb schema, and added image dimensions.
- `portfolio.html` — improved portfolio metadata, added CollectionPage/Breadcrumb schema, linked the orphaned Emekaholistics case study, switched oversized images to WebP, enabled lazy decoding, and added dimensions.

## Generated blog pages

The following files were rebuilt from Markdown to add shorter unique titles, article-specific Open Graph images, BlogPosting/WebPage/Breadcrumb JSON-LD, cross-border footer language, and intrinsic image dimensions:

- `ai-small-business.html`
- `automate-client-onboarding.html`
- `brand-storytelling.html`
- `branding-cost-canada-vs-us.html`
- `branding-vs-logo-design.html`
- `freelancer-vs-creative-studio.html`
- `signs-your-website-is-losing-clients.html`
- `the-ismile-approach.html`
- `virtual-assistance-guide.html`
- `why-small-business-needs-a-website.html`
- `why-social-media-isnt-converting.html`
- `blog.html` — also received a unique hub title and CollectionPage schema.
- `blog-page-2.html` — also received a page-specific title/description to remove duplication.

## Portfolio case-study pages

- `emekaholistics.html` — rebuilt with CreativeWork/WebPage/Breadcrumb schema, case-study metadata, cross-border footer language, and image dimensions.
- `theresa-alexander-inman.html` — rebuilt with CreativeWork/WebPage/Breadcrumb schema, case-study metadata, cross-border footer language, and image dimensions.
- `leo-law.html` — added descriptive case-study metadata, connected CreativeWork schema, a contextual link to legal services, cross-border footer language, and available image dimensions.
- `ember-room.html`, `ethos-men.html`, `forma-pilates.html`, `ora-collections.html`, `sidamo-cafe.html`, `vibe-and-fly.html` — added descriptive case-study metadata and connected CreativeWork schema, updated shared service-area language, and added intrinsic image dimensions; Forma now uses the optimized WebP gallery asset.

## Policy, utility, prototype, and demo pages

- `404.html` — replaced a nonexistent social image with `logo.png` and added image dimensions; remains `noindex, follow`.
- `accessibility-statement.html`, `cookie-policy.html`, `data-request.html`, `do-not-sell-my-info.html`, `privacy-policy.html` — replaced the nonexistent `og-image.jpg`, updated shared geography wording, and added image dimensions.
- `terms-and-conditions.html` — updated shared geography wording and added image dimensions.
- `ismile-brand-board.html`, `ismile-portfolio-gallery.html`, `ismile-services-accordion.html`, `ismile-services-redesign.html`, `ismile-why-choose-us.html` — added `noindex, nofollow` to prevent component/prototype indexing; also received shared wording/dimension maintenance where applicable.
- `professional-services-landing.html` — added `noindex, nofollow` because it is an orphaned, incomplete landing-page draft without canonical/navigation integration.
- `Cafe/index.html`, `gym1/gym-index.html`, `The Ember Room/index.html`, `LeoLaw/leo-law-index.html` — added `noindex, nofollow` so full fictional/portfolio demos cannot compete with real business pages.

## Image assets

The existing compression script losslessly/re-encoded the following oversized source assets to reduce transfer/storage size while preserving filenames and dimensions:

- `Development.jpg`
- `Ember-room-logo.png`
- `Ethos-posts-mockup.png`
- `Foodsitemockup.png`
- `Forma-site.png`
- `Homepage-Ismile.png`
- `Ismile-bunny-branding.png`
- `Ismile-bunny-web-design.png`
- `Ismile_CREATIVE_DIGITAL_SOLUTIONS_Bunny2.png`
- `Ismile_bunny_consulting.png`
- `Ismile_bunny_digital_marketing.png`
- `Ismile_bunny_systems_automations.png`
- `Leo-law-logo.png`
- `Leolawfirmsite-mockup.png`
- `NSLogo-t.png`
- `NathanPS.png`
- `Ora-Collections-email-campaign-mockup.png`
- `Ora-collections-email-marketing.png`
- `Screenshot 2026-04-26 at 6.14.01 AM.png`
- `blog-images/scheduling-meeting-calendar-app-phone.jpg`
- `branding.jpg`
- `cafe-Site-mockup.png`
- `consulting.jpg`
- `ember-room-Site-mockup.png`
- `emeka-Site-mockup.png`
- `forma-logo.png`
- `forma-site2.png`
- `forma-tote.png`
- `systems.jpg`
- `vibefly-Site-mockup-copy.png`

New resized modern-format delivery assets:

- `Forma-site.webp`
- `Leolawfirmsite-mockup.webp`
- `branding.webp`
- `consulting.webp`
- `systems.webp`

The two 4–5 MB portfolio PNG downloads were replaced in live page references with roughly 60 KB WebP files. The three service hero images now use WebP derivatives between roughly 24 KB and 259 KB.

## Documentation

- `SEO-AUDIT.md` — findings by severity, remediation status, testing method, and remaining risks.
- `SEO-KEYWORD-MAP.md` — per-page topic, intent, keyword, metadata, link, and supporting-content assignments.
- `CONTENT-SEO-PLAN.md` — BOFU/MOFU/TOFU roadmap plus original AI-citation resource opportunities.
- `INDEXNOW-SETUP.md` — key hosting, environment, deployment, submission, and verification instructions.
- `SEO-CHANGELOG.md` — this file; records all files changed by the SEO implementation.
