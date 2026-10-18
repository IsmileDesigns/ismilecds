const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const START = '<!-- organization-json-ld:start -->';
const END = '<!-- organization-json-ld:end -->';

const organization = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': 'https://www.byismile.com/#organization',
  name: 'ISMILE CDS',
  url: 'https://www.byismile.com/',
  logo: {
    '@type': 'ImageObject',
    url: 'https://www.byismile.com/logo.png',
  },
  email: 'hello@byismile.com',
  description: 'A Toronto creative and digital studio providing branding, website design, digital marketing, business systems, and consulting for service businesses.',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Toronto',
    addressRegion: 'ON',
    addressCountry: 'CA',
  },
  areaServed: [
    { '@type': 'Country', name: 'Canada' },
    { '@type': 'Country', name: 'United States' },
  ],
  sameAs: [
    'https://www.instagram.com/ismilecds',
    'https://www.behance.net/IsmileDesigns',
    'https://g.page/r/CWTNDtsyFif3EAI',
  ],
};

const schema = JSON.stringify(organization, null, 2).replace(/</g, '\\u003c');
const block = `  ${START}\n  <script type="application/ld+json">\n${schema}\n  </script>\n  ${END}\n`;

let changed = 0;
let normalized = 0;

for (const file of fs.readdirSync(ROOT).filter(name => name.endsWith('.html'))) {
  const filePath = path.join(ROOT, file);
  let html = fs.readFileSync(filePath, 'utf8');

  if (!/<head\b/i.test(html) || !/<meta\s+name="robots"\s+content="index, follow"/i.test(html)) continue;

  const original = html;
  html = html
    .replace(/Toronto creative and digital studio serving service businesses across Canada and the U\.S\./g, 'Toronto, Ontario, Canada creative and digital studio serving service businesses across Canada and the U.S.')
    .replace(/All rights reserved\. Toronto, Canada\./g, 'All rights reserved. Toronto, Ontario, Canada.')
    .replace(/Toronto, Canada · Working remotely/g, 'Toronto, Ontario, Canada · Serving Canada and the U.S.');

  const existingBlock = new RegExp(`\\s*${START}[\\s\\S]*?${END}\\s*`, 'i');
  if (existingBlock.test(html)) html = html.replace(existingBlock, '\n');
  if (!/"@type"\s*:\s*"Organization"/.test(html)) {
    html = html.replace('</head>', `${block}</head>`);
    changed += 1;
  }

  if (html !== original) {
    fs.writeFileSync(filePath, html);
    normalized += 1;
  }
}

console.log(`  schema → Organization added to ${changed} pages; shared location normalized in ${normalized} pages`);
