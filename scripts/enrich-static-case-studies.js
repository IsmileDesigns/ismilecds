const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://www.byismile.com';
const ORG = `${SITE}/#organization`;
const WEBSITE = `${SITE}/#website`;

const cases = {
  'ember-room.html': {
    name: 'Ember Room',
    title: 'Ember Room Brand & Web Design Case Study | Ismile',
    category: 'Brand Identity and Web Design',
    description: 'A restaurant brand identity and website concept built around warmth, fire, atmosphere, and a clear reservation path.',
    image: 'ember-room-Site-mockup.png',
  },
  'ethos-men.html': {
    name: 'Ethos Men',
    title: 'Ethos Men Digital Marketing Case Study | Ismile',
    category: 'Social Media and Email Marketing',
    description: "Social media and email campaign design for Ethos Men, a premium men's grooming brand focused on confidence and craft.",
    image: 'Ethos-posts-mockup.png',
  },
  'forma-pilates.html': {
    name: 'Forma Pilates Studio',
    title: 'Forma Pilates Brand & Web Design Case Study | Ismile',
    category: 'Brand Identity and Web Design',
    description: 'Brand identity and website design for Forma Pilates Studio, with an elevated editorial look and a clear class-booking path.',
    image: 'Forma-site.webp',
  },
  'leo-law.html': {
    name: 'Leo Law',
    title: 'Leo Law Brand & Web Design Concept | Ismile',
    category: 'Brand Identity and Web Design Concept',
    description: 'A clearly labeled law-firm brand identity and website concept focused on trust, practice-area clarity, and consultation paths.',
    image: 'Leolawfirmsite-mockup.webp',
  },
  'ora-collections.html': {
    name: 'Ora Collections',
    title: 'Ora Collections Digital Marketing Case Study | Ismile',
    category: 'Digital Marketing and Email Design',
    description: 'Email and social campaign design for Ora Collections, a natural skincare brand with a clean, editorial ecommerce presence.',
    image: 'Ora-Collections-email-campaign-mockup.png',
  },
  'sidamo-cafe.html': {
    name: 'Sidamo Cafe',
    title: 'Sidamo Cafe Brand & Web Design Case Study | Ismile',
    category: 'Brand Identity and Web Design',
    description: 'Brand identity and website design for Sidamo Cafe, a specialty coffee concept rooted in Ethiopian heritage.',
    image: 'cafe-Site-mockup.png',
  },
  'vibe-and-fly.html': {
    name: 'Vibe and Fly Foods',
    title: 'Vibe and Fly Foods Web Design Case Study | Ismile',
    category: 'Web Design',
    description: 'Website design for Vibe and Fly Foods, a Caribbean catering and pop-up business focused on pre-orders and inquiries.',
    image: 'vibefly-Site-mockup-copy.png',
  },
};

function escapeHtml(value) {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function replaceMeta(html, selector, value) {
  return html.replace(selector, tag => tag.replace(/content="[^"]*"/i, `content="${escapeHtml(value)}"`));
}

for (const [file, project] of Object.entries(cases)) {
  const pageUrl = `${SITE}/${file}`;
  const filePath = path.join(ROOT, file);
  let html = fs.readFileSync(filePath, 'utf8');
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(project.title)}</title>`);
  html = replaceMeta(html, /<meta\b[^>]*name="description"[^>]*>/i, project.description);
  html = replaceMeta(html, /<meta\b[^>]*property="og:title"[^>]*>/i, project.title);
  html = replaceMeta(html, /<meta\b[^>]*property="og:description"[^>]*>/i, project.description);
  html = replaceMeta(html, /<meta\b[^>]*name="twitter:title"[^>]*>/i, project.title);
  html = replaceMeta(html, /<meta\b[^>]*name="twitter:description"[^>]*>/i, project.description);

  html = html.replace(/\n?\s*<!-- case-study-json-ld:start -->[\s\S]*?<!-- case-study-json-ld:end -->/i, '');
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: project.title.replace(/ \| Ismile$/, ''),
        description: project.description,
        isPartOf: { '@id': WEBSITE },
        about: { '@id': `${pageUrl}#project` },
        breadcrumb: { '@id': `${pageUrl}#breadcrumb` },
      },
      {
        '@type': 'CreativeWork',
        '@id': `${pageUrl}#project`,
        name: project.name,
        description: project.description,
        genre: project.category,
        image: `${SITE}/${project.image}`,
        creator: { '@id': ORG },
        mainEntityOfPage: { '@id': `${pageUrl}#webpage` },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${pageUrl}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
          { '@type': 'ListItem', position: 2, name: 'Portfolio', item: `${SITE}/portfolio.html` },
          { '@type': 'ListItem', position: 3, name: project.name, item: pageUrl },
        ],
      },
    ],
  };
  const schema = JSON.stringify(graph, null, 2).replace(/</g, '\\u003c');
  html = html.replace('</head>', `  <!-- case-study-json-ld:start -->\n  <script type="application/ld+json">\n${schema}\n  </script>\n  <!-- case-study-json-ld:end -->\n</head>`);
  fs.writeFileSync(filePath, html);
}

console.log(`  case studies → enriched metadata and JSON-LD (${Object.keys(cases).length} static pages)`);
