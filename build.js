const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

const POSTS_DIR = path.join(__dirname, 'content/posts');
const PROJECTS_DIR = path.join(__dirname, 'content/projects');
const TEMPLATES_DIR = path.join(__dirname, 'templates');
const OUT_DIR = __dirname;
const POSTS_PER_PAGE = 6;
const SITE_URL = 'https://www.byismile.com';
const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

const POST_SEO_TITLES = {
  'ai-small-business': 'AI for Small Businesses: Practical Use Cases | Ismile',
  'automate-client-onboarding': 'How to Automate Client Onboarding | Ismile',
  'brand-storytelling': 'Brand Storytelling: A Practical Framework | Ismile',
  'branding-cost-canada-vs-us': 'Branding Costs in Canada vs. the U.S. (2026) | Ismile',
  'branding-vs-logo-design': 'Branding vs. Logo Design: Costs & Differences | Ismile',
  'freelancer-vs-creative-studio': 'Freelancer vs. Creative Studio: How to Choose | Ismile',
  'signs-your-website-is-losing-clients': '5 Signs Your Website Is Costing You Clients | Ismile',
  'the-ismile-approach': 'The Ismile Approach to Brand and Website Projects',
  'virtual-assistance-guide': 'Virtual Assistance Guide for Small Businesses | Ismile',
  'why-small-business-needs-a-website': 'Why Small Businesses Need a Website in 2026 | Ismile',
  'why-social-media-isnt-converting': "Why Social Media Isn't Converting | Ismile",
};

function absoluteUrl(value) {
  if (!value) return `${SITE_URL}/logo.png`;
  if (/^https?:\/\//i.test(value)) return value;
  return `${SITE_URL}/${value.replace(/^\.\//, '')}`;
}

function jsonLd(graph) {
  const json = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2)
    .replace(/</g, '\\u003c');
  return `<script type="application/ld+json">\n${json}\n  </script>`;
}

function breadcrumb(items, id) {
  return {
    '@type': 'BreadcrumbList',
    '@id': id,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

function articleSchema(post) {
  const pageUrl = `${SITE_URL}/${post.slug}.html`;
  const image = absoluteUrl(post.image);
  const crumbsId = `${pageUrl}#breadcrumb`;
  return jsonLd([
    {
      '@type': 'WebPage',
      '@id': `${pageUrl}#webpage`,
      url: pageUrl,
      name: post.title,
      description: post.description || post.excerpt,
      isPartOf: { '@id': WEBSITE_ID },
      breadcrumb: { '@id': crumbsId },
      primaryImageOfPage: { '@type': 'ImageObject', url: image },
    },
    {
      '@type': 'BlogPosting',
      '@id': `${pageUrl}#article`,
      headline: post.title,
      description: post.description || post.excerpt,
      image,
      datePublished: new Date(post.date).toISOString().slice(0, 10),
      dateModified: new Date(post.modified || post.date).toISOString().slice(0, 10),
      mainEntityOfPage: { '@id': `${pageUrl}#webpage` },
      author: { '@id': ORGANIZATION_ID },
      publisher: { '@id': ORGANIZATION_ID },
      about: post.category,
    },
    breadcrumb([
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Insights', url: `${SITE_URL}/blog.html` },
      { name: post.title, url: pageUrl },
    ], crumbsId),
  ]);
}

function projectSchema(project) {
  const pageUrl = `${SITE_URL}/${project.slug}.html`;
  const crumbsId = `${pageUrl}#breadcrumb`;
  return jsonLd([
    {
      '@type': 'WebPage',
      '@id': `${pageUrl}#webpage`,
      url: pageUrl,
      name: `${project.title} — ${project.category}`,
      description: project.description,
      isPartOf: { '@id': WEBSITE_ID },
      breadcrumb: { '@id': crumbsId },
      about: { '@id': `${pageUrl}#project` },
    },
    {
      '@type': 'CreativeWork',
      '@id': `${pageUrl}#project`,
      name: project.title,
      description: project.description,
      genre: project.category,
      image: absoluteUrl(project.cover_image),
      creator: { '@id': ORGANIZATION_ID },
      mainEntityOfPage: { '@id': `${pageUrl}#webpage` },
    },
    breadcrumb([
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Portfolio', url: `${SITE_URL}/portfolio.html` },
      { name: project.title, url: pageUrl },
    ], crumbsId),
  ]);
}

function blogSchema(page, pageUrl, pagePosts) {
  const name = page === 1 ? 'Small Business Branding, Web & Marketing Insights' : `Small Business Insights — Page ${page}`;
  const crumbsId = `${pageUrl}#breadcrumb`;
  return jsonLd([
    {
      '@type': 'CollectionPage',
      '@id': `${pageUrl}#webpage`,
      url: pageUrl,
      name,
      isPartOf: { '@id': WEBSITE_ID },
      breadcrumb: { '@id': crumbsId },
      hasPart: pagePosts.map(post => ({ '@id': `${SITE_URL}/${post.slug}.html#article` })),
    },
    breadcrumb([
      { name: 'Home', url: `${SITE_URL}/` },
      { name: page === 1 ? 'Insights' : `Insights — Page ${page}`, url: pageUrl },
    ], crumbsId),
  ]);
}

const postTemplate = fs.readFileSync(path.join(TEMPLATES_DIR, 'post-template.html'), 'utf8');
const blogTemplate = fs.readFileSync(path.join(TEMPLATES_DIR, 'blog-template.html'), 'utf8');
const projectTemplate = fs.readFileSync(path.join(TEMPLATES_DIR, 'project-template.html'), 'utf8');
const portfolioTemplate = fs.readFileSync(path.join(TEMPLATES_DIR, 'portfolio-template.html'), 'utf8');

// Read and parse all posts
const posts = fs.readdirSync(POSTS_DIR)
  .filter(f => f.endsWith('.md'))
  .map(filename => {
    const slug = filename.replace('.md', '');
    const raw = fs.readFileSync(path.join(POSTS_DIR, filename), 'utf8');
    const { data, content } = matter(raw);
    const body = marked.parse(content);
    return { slug, body, ...data };
  })
  .sort((a, b) => new Date(b.date) - new Date(a.date));

function formatDate(dateVal) {
  const d = new Date(dateVal);
  // Use UTC to avoid timezone shifts on date-only strings
  return new Date(d.getTime() + d.getTimezoneOffset() * 60000)
    .toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function fill(template, vars) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) =>
    vars[key] !== undefined ? vars[key] : ''
  );
}

function heroImageHTML(post) {
  if (!post.image) return '';
  return `<img src="${post.image}" alt="${post.title}" class="post-hero-img" loading="eager"/><div class="post-hero-scrim"></div>`;
}

// Generate individual post pages
posts.forEach(post => {
  const dateStr = formatDate(post.date);
  const html = fill(postTemplate, {
    title: post.title,
    seo_title: POST_SEO_TITLES[post.slug] || `${post.title} | Ismile`,
    description: post.description || '',
    slug: post.slug,
    date: dateStr,
    category: post.category,
    read_time: post.read_time,
    image_gradient: post.image_gradient,
    hero_image: heroImageHTML(post),
    og_image: absoluteUrl(post.image),
    schema: articleSchema(post),
    lead: post.lead || '',
    body: post.body,
    cta_title: post.cta_title || '',
    cta_text: post.cta_text || '',
    cta_link: post.cta_link || '#',
    cta_button: post.cta_button || 'Book a Free Call',
  });
  const outPath = path.join(OUT_DIR, `${post.slug}.html`);
  fs.writeFileSync(outPath, html);
  console.log(`  post → ${post.slug}.html`);
});

// Determine featured post (explicit featured:true, otherwise most recent)
const featuredPost = posts.find(p => p.featured) || posts[0];
const regularPosts = posts.filter(p => p !== featuredPost);

function cardImageHTML(post) {
  if (!post.image) return '';
  return `<img src="${post.image}" alt="${post.title}" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block;"/>`;
}

function featuredCardHTML(post) {
  const dateStr = formatDate(post.date);
  return `<a href="./${post.slug}.html" class="blog-featured">
    <div class="bf-img" style="background:${post.image_gradient};">${cardImageHTML(post)}</div>
    <div class="bf-body">
      <p class="blog-cat">${post.category}</p>
      <h2 class="bf-title">${post.title.toUpperCase()}</h2>
      <p class="bf-excerpt">${post.excerpt}</p>
      <div class="blog-meta">${post.read_time} min read &nbsp;·&nbsp; ${dateStr}</div>
    </div>
  </a>`;
}

function postCardHTML(post) {
  const dateStr = formatDate(post.date);
  return `<a href="./${post.slug}.html" class="blog-card" data-r>
      <div class="bc-img" style="background:${post.image_gradient};">${cardImageHTML(post)}</div>
      <div class="bc-body">
        <p class="blog-cat">${post.category}</p>
        <h3 class="bc-title">${post.title.toUpperCase()}</h3>
        <p class="bc-excerpt">${post.excerpt}</p>
        <div class="blog-meta">${post.read_time} min read &nbsp;·&nbsp; ${dateStr}</div>
      </div>
    </a>`;
}

function paginationHTML(currentPage, totalPages) {
  if (totalPages <= 1) return '';
  const links = [];
  if (currentPage > 1) {
    const prev = currentPage === 2 ? './blog.html' : `./blog-page-${currentPage - 1}.html`;
    links.push(`<a href="${prev}" class="page-link">&#8592; Prev</a>`);
  }
  for (let i = 1; i <= totalPages; i++) {
    const href = i === 1 ? './blog.html' : `./blog-page-${i}.html`;
    links.push(`<a href="${href}" class="page-link${i === currentPage ? ' active' : ''}">${i}</a>`);
  }
  if (currentPage < totalPages) {
    links.push(`<a href="./blog-page-${currentPage + 1}.html" class="page-link">Next &#8594;</a>`);
  }
  return `<div class="blog-pagination">${links.join('')}</div>`;
}

// Generate paginated blog listing pages
const totalPages = Math.max(1, Math.ceil(regularPosts.length / POSTS_PER_PAGE));

for (let page = 1; page <= totalPages; page++) {
  const start = (page - 1) * POSTS_PER_PAGE;
  const pagePosts = regularPosts.slice(start, start + POSTS_PER_PAGE);

  const outFile = page === 1 ? 'blog.html' : `blog-page-${page}.html`;
  let html = fill(blogTemplate, {
    featured_post: page === 1 ? featuredCardHTML(featuredPost) : '',
    post_cards: pagePosts.map(postCardHTML).join('\n    '),
    pagination: paginationHTML(page, totalPages),
    canonical_url: `${SITE_URL}/${outFile}`,
    seo_title: page === 1
      ? 'Small Business Branding, Web & Marketing Insights | Ismile'
      : `Small Business Insights — Page ${page} | Ismile`,
    seo_description: page === 1
      ? 'Practical branding, website, marketing, automation, and business guidance for small and service-based businesses.'
      : `More practical branding, website, marketing, automation, and business guidance from Ismile. Browse insights page ${page}.`,
    schema: blogSchema(page, `${SITE_URL}/${outFile}`, page === 1 ? [featuredPost, ...pagePosts] : pagePosts),
  });
  fs.writeFileSync(path.join(OUT_DIR, outFile), html);
  console.log(`  blog → ${outFile} (page ${page}/${totalPages}, ${pagePosts.length} cards)`);
}

// ─── Portfolio ────────────────────────────────────────────────────────────────

const projects = fs.readdirSync(PROJECTS_DIR)
  .filter(f => f.endsWith('.md'))
  .map(filename => {
    const slug = filename.replace('.md', '');
    const raw = fs.readFileSync(path.join(PROJECTS_DIR, filename), 'utf8');
    const { data, content } = matter(raw);
    const body = marked.parse(content);
    return { slug, body, ...data };
  })
  .sort((a, b) => (a.order || 99) - (b.order || 99));

function projectItemHTML(project) {
  const ratio = project.image_aspect_ratio || 'auto';
  return `<a href="./${project.slug}.html" class="port-item" data-r>
      <div class="pi-img" style="aspect-ratio:${ratio};"><img src="${project.cover_image}" alt="${project.title}" style="width:100%;height:100%;object-fit:cover;display:block;"/><div class="pi-overlay"><span class="pi-overlay-label">View Case Study</span></div></div>
      <div class="pi-body">
        <p class="pi-cat">${project.category}</p>
        <h3 class="pi-title">${project.title.toUpperCase()}</h3>
        <p class="pi-desc">${project.description}</p>
      </div>
    </a>`;
}

// Generate individual project case study pages
projects.forEach(project => {
  const heroLink = project.link_url
    ? `<div class="project-hero-actions"><a href="${project.link_url}" class="btn-o" target="_blank" rel="noopener">${project.link_label || 'View Live'} <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 14 14"><path d="M2 7h10M7 2l5 5-5 5"/></svg></a></div>`
    : '';
  const linkCta = project.link_url
    ? `<div class="project-cta-box" data-r><p>Want to see the full project?</p><a href="${project.link_url}" class="btn-a" target="_blank" rel="noopener">${project.link_label || 'View Live'} <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 14 14"><path d="M2 7h10M7 2l5 5-5 5"/></svg></a></div>`
    : '';
  const galleryImages = (project.images && project.images.length > 0)
    ? project.images
    : [project.cover_image];
  const galleryHtml = galleryImages
    .map(url => `<img class="project-gallery-img" src="${url}" alt="${project.title}" loading="lazy" />`)
    .join('\n      ');
  const html = fill(projectTemplate, {
    title: project.title,
    seo_title: `${project.title} ${project.category} Case Study | Ismile`,
    description: project.description || '',
    slug: project.slug,
    category: project.category,
    cover_image: project.cover_image,
    body: project.body,
    hero_link: heroLink,
    link_cta: linkCta,
    gallery_html: galleryHtml,
    schema: projectSchema(project),
  });
  fs.writeFileSync(path.join(OUT_DIR, `${project.slug}.html`), html);
  console.log(`  project → ${project.slug}.html`);
});

// Generate portfolio.html
// portfolio.html is hand-curated with project cards beyond content/projects/ (see git log).
// Refuse to overwrite it with fewer cards than it already has.
const portfolioOutPath = path.join(OUT_DIR, 'portfolio.html');
const existingPortfolio = fs.existsSync(portfolioOutPath) ? fs.readFileSync(portfolioOutPath, 'utf8') : '';
const existingCardCount = (existingPortfolio.match(/class="port-item/g) || []).length;
if (projects.length < existingCardCount) {
  console.log(`  portfolio → SKIPPED (content/projects/ has ${projects.length} projects, portfolio.html already has ${existingCardCount} hand-curated cards; not overwriting)`);
} else {
  const portfolioHTML = fill(portfolioTemplate, {
    project_items: projects.map(projectItemHTML).join('\n\n    '),
  });
  fs.writeFileSync(portfolioOutPath, portfolioHTML);
  console.log(`  portfolio → portfolio.html (${projects.length} projects)`);
}

function xmlEscape(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function sitemapSource(file) {
  const slug = file.replace(/\.html$/, '');
  const postSource = path.join(POSTS_DIR, `${slug}.md`);
  const projectSource = path.join(PROJECTS_DIR, `${slug}.md`);
  if (fs.existsSync(postSource)) return postSource;
  if (fs.existsSync(projectSource)) return projectSource;
  if (/^blog(?:-page-\d+)?\.html$/.test(file)) return POSTS_DIR;
  return path.join(OUT_DIR, file);
}

function lastModified(file) {
  const source = sitemapSource(file);
  let modified = fs.statSync(source).mtime;
  if (fs.statSync(source).isDirectory()) {
    const dates = fs.readdirSync(source)
      .filter(name => name.endsWith('.md'))
      .map(name => fs.statSync(path.join(source, name)).mtime.getTime());
    modified = new Date(Math.max(...dates));
  }
  return modified.toISOString().slice(0, 10);
}

function generateSitemap() {
  const urls = fs.readdirSync(OUT_DIR)
    .filter(file => file.endsWith('.html'))
    .map(file => ({ file, html: fs.readFileSync(path.join(OUT_DIR, file), 'utf8') }))
    .filter(({ html }) => /<meta\s+name="robots"\s+content="index, follow"/i.test(html))
    .map(({ file, html }) => {
      const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i);
      return canonical ? { file, url: canonical[1] } : null;
    })
    .filter(Boolean)
    .sort((a, b) => {
      if (a.url === `${SITE_URL}/`) return -1;
      if (b.url === `${SITE_URL}/`) return 1;
      return a.url.localeCompare(b.url);
    });

  const body = urls.map(({ file, url }) => [
    '  <url>',
    `    <loc>${xmlEscape(url)}</loc>`,
    `    <lastmod>${lastModified(file)}</lastmod>`,
    '  </url>',
  ].join('\n')).join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
  fs.writeFileSync(path.join(OUT_DIR, 'sitemap.xml'), sitemap);
  console.log(`  sitemap → sitemap.xml (${urls.length} canonical URLs)`);
}

generateSitemap();

console.log('\nBuild complete.');
