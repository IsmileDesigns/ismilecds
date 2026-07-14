const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

const POSTS_DIR = path.join(__dirname, 'content/posts');
const PROJECTS_DIR = path.join(__dirname, 'content/projects');
const TEMPLATES_DIR = path.join(__dirname, 'templates');
const OUT_DIR = __dirname;
const POSTS_PER_PAGE = 6;

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

// Generate individual post pages
posts.forEach(post => {
  const dateStr = formatDate(post.date);
  const html = fill(postTemplate, {
    title: post.title,
    date: dateStr,
    category: post.category,
    read_time: post.read_time,
    image_gradient: post.image_gradient,
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

function featuredCardHTML(post) {
  const dateStr = formatDate(post.date);
  return `<a href="./${post.slug}.html" class="blog-featured">
    <div class="bf-img" style="background:${post.image_gradient};"></div>
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
      <div class="bc-img" style="background:${post.image_gradient};"></div>
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

  let html = fill(blogTemplate, {
    featured_post: page === 1 ? featuredCardHTML(featuredPost) : '',
    post_cards: pagePosts.map(postCardHTML).join('\n    '),
    pagination: paginationHTML(page, totalPages),
  });

  const outFile = page === 1 ? 'blog.html' : `blog-page-${page}.html`;
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
    category: project.category,
    cover_image: project.cover_image,
    body: project.body,
    hero_link: heroLink,
    link_cta: linkCta,
    gallery_html: galleryHtml,
  });
  fs.writeFileSync(path.join(OUT_DIR, `${project.slug}.html`), html);
  console.log(`  project → ${project.slug}.html`);
});

// Generate portfolio.html
const portfolioHTML = fill(portfolioTemplate, {
  project_items: projects.map(projectItemHTML).join('\n\n    '),
});
fs.writeFileSync(path.join(OUT_DIR, 'portfolio.html'), portfolioHTML);
console.log(`  portfolio → portfolio.html (${projects.length} projects)`);

console.log('\nBuild complete.');
