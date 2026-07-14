# Ismile Blog System

Static markdown-based blog. No build step on Cloudflare — run `node build.js` locally before pushing.

## Adding a new post

1. Create `content/posts/your-post-slug.md` with this frontmatter:

```yaml
---
title: Your Post Title
slug: your-post-slug
date: 2026-05-01
category: Branding
excerpt: One-sentence summary shown on blog cards.
read_time: 8
image_gradient: "linear-gradient(135deg,#1e1510,#2e2018)"
featured: false
lead: "Opening paragraph shown in large text at the top of the article."
cta_title: "Your CTA Heading"
cta_text: "CTA body text."
cta_link: "https://koalendar.com/e/meet-with-yazmine-ismile"
cta_button: "Book a Free Call"
---

Your article body in markdown...
```

2. Run `node build.js` — this generates the post HTML and regenerates `blog.html`.

3. Commit and push. Cloudflare serves the static files.

## Marking a featured post

Set `featured: true` on exactly one post. That post appears in the large featured card at the top of the blog. If no post is marked featured, the most recent post is used.

## Pagination

The blog shows 6 cards per page (not counting the featured card). With more than 6 non-featured posts, `build.js` automatically creates `blog-page-2.html`, `blog-page-3.html`, etc. with prev/next pagination links.

## File structure

```
content/posts/        ← markdown source files
templates/
  post-template.html  ← template for individual post pages
  blog-template.html  ← template for blog listing pages
build.js              ← build script (run locally before push)
package.json
```

## Setup (first time)

```bash
npm install
node build.js
```
