const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://www.byismile.com';
const htmlFiles = fs.readdirSync(ROOT).filter(file => file.endsWith('.html'));
const errors = [];
const warnings = [];
const titles = new Map();
const canonicals = new Map();
const indexable = new Set();

function textContent(value) {
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function attr(html, selector, name) {
  const match = html.match(selector);
  if (!match) return '';
  const value = match[0].match(new RegExp(`${name}="([^"]*)"`, 'i'));
  return value ? value[1] : '';
}

function localTarget(value) {
  if (!value || /^(?:https?:|mailto:|tel:|javascript:|data:)/i.test(value)) return null;
  const clean = decodeURIComponent(value.split('#')[0].split('?')[0]).replace(/^\.\//, '');
  return clean ? path.resolve(ROOT, clean) : null;
}

for (const file of htmlFiles) {
  const html = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const robots = attr(html, /<meta\b[^>]*name="robots"[^>]*>/i, 'content').toLowerCase();
  const isIndexable = robots.includes('index') && !robots.includes('noindex');
  if (isIndexable) indexable.add(file);

  if (isIndexable) {
    const title = textContent((html.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || '');
    const description = attr(html, /<meta\b[^>]*name="description"[^>]*>/i, 'content');
    const canonical = attr(html, /<link\b[^>]*rel="canonical"[^>]*>/i, 'href');
    const h1s = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)];
    const mains = [...html.matchAll(/<main\b/gi)];

    if (!title) errors.push(`${file}: missing title`);
    if (!description) errors.push(`${file}: missing meta description`);
    if (!canonical || !canonical.startsWith(`${SITE}/`)) errors.push(`${file}: missing or invalid canonical`);
    if (h1s.length !== 1) errors.push(`${file}: expected 1 H1, found ${h1s.length}`);
    if (mains.length !== 1) errors.push(`${file}: expected 1 main element, found ${mains.length}`);

    for (const [property, kind] of [
      ['og:title', 'property'], ['og:description', 'property'], ['og:image', 'property'],
      ['twitter:card', 'name'], ['twitter:title', 'name'], ['twitter:description', 'name'], ['twitter:image', 'name'],
    ]) {
      const re = new RegExp(`<meta\\b[^>]*${kind}="${property.replace(':', '\\:')}"[^>]*>`, 'i');
      if (!re.test(html)) errors.push(`${file}: missing ${property}`);
    }

    if (title) {
      const group = titles.get(title) || [];
      group.push(file);
      titles.set(title, group);
    }
    if (canonical) {
      const group = canonicals.get(canonical) || [];
      group.push(file);
      canonicals.set(canonical, group);
    }
  }

  for (const match of html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      JSON.parse(match[1]);
    } catch (error) {
      errors.push(`${file}: invalid JSON-LD (${error.message})`);
    }
  }

  for (const match of html.matchAll(/<(?:a|img)\b[^>]*(?:href|src)="([^"]+)"[^>]*>/gi)) {
    const target = localTarget(match[1]);
    if (target && !fs.existsSync(target)) errors.push(`${file}: broken local reference ${match[1]}`);
  }

  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    if (!/\salt="[^"]*"/i.test(match[0])) errors.push(`${file}: image missing alt attribute`);
    if (!/\swidth="?\d+/i.test(match[0]) || !/\sheight="?\d+/i.test(match[0])) {
      warnings.push(`${file}: image without intrinsic width and height`);
    }
  }
}

for (const [title, files] of titles) {
  if (files.length > 1) errors.push(`Duplicate title "${title}": ${files.join(', ')}`);
}
for (const [canonical, files] of canonicals) {
  if (files.length > 1) errors.push(`Duplicate canonical "${canonical}": ${files.join(', ')}`);
}

const sitemap = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
const sitemapUrls = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]));
for (const file of indexable) {
  const html = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const canonical = attr(html, /<link\b[^>]*rel="canonical"[^>]*>/i, 'href');
  if (!sitemapUrls.has(canonical)) errors.push(`${file}: indexable canonical missing from sitemap`);
}
for (const url of sitemapUrls) {
  const file = url === `${SITE}/` ? 'index.html' : url.replace(`${SITE}/`, '');
  if (!indexable.has(file)) errors.push(`sitemap.xml: non-indexable or missing URL ${url}`);
}

const robots = fs.readFileSync(path.join(ROOT, 'robots.txt'), 'utf8');
if (!/User-agent:\s*OAI-SearchBot[\s\S]*?Allow:\s*\//i.test(robots)) errors.push('robots.txt: OAI-SearchBot is not explicitly allowed');
if (!new RegExp(`Sitemap:\\s*${SITE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/sitemap\\.xml`, 'i').test(robots)) {
  errors.push('robots.txt: sitemap declaration missing or invalid');
}

console.log(`Checked ${htmlFiles.length} root HTML files; ${indexable.size} are indexable.`);
console.log(`JSON-LD, metadata, headings, local links, robots.txt, and sitemap were validated.`);
console.log(`Image dimension warnings: ${warnings.length}`);
if (warnings.length) console.log(warnings.slice(0, 12).map(item => `WARN  ${item}`).join('\n'));
if (warnings.length > 12) console.log(`WARN  ...and ${warnings.length - 12} more image dimension warnings`);

if (errors.length) {
  console.error(`\nSEO check failed with ${errors.length} error(s):`);
  console.error(errors.map(item => `ERROR ${item}`).join('\n'));
  process.exit(1);
}

console.log('SEO check passed.');
