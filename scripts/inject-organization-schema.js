const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const START = '<!-- organization-json-ld:start -->';
const END = '<!-- organization-json-ld:end -->';

const sharedAddress = {
  '@type': 'PostalAddress',
  addressLocality: 'Toronto',
  addressRegion: 'ON',
  postalCode: 'M5A',
  addressCountry: 'CA',
};

const sharedAreaServed = [
  { '@type': 'AdministrativeArea', name: 'Ontario, Canada' },
  { '@type': 'City', name: 'Toronto' },
  { '@type': 'City', name: 'GTA' },
  { '@type': 'Country', name: 'Canada' },
  { '@type': 'Country', name: 'United States' },
];

const sharedSameAs = [
  'https://www.instagram.com/ismilecds',
  'https://www.behance.net/IsmileDesigns',
  'https://www.linkedin.com/company/ismilecds',
  'https://g.page/r/CWTNDtsyFif3EAI',
];

const organization = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://www.byismile.com/#organization',
      name: 'ISMILE CDS',
      legalName: 'ISMILE Creative & Digital Studio',
      url: 'https://www.byismile.com/',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.byismile.com/logo.png',
      },
      email: 'hello@byismile.com',
      description: 'A Toronto, Ontario creative and digital studio specializing in brand strategy, web design, digital marketing, and business systems for service businesses and law firms across Canada and the U.S.',
      address: sharedAddress,
      areaServed: sharedAreaServed,
      knowsAbout: [
        'Brand Strategy',
        'Brand Identity Design',
        'Web Design',
        'Web Development',
        'Digital Marketing',
        'Law Firm Website Design',
        'Legal Marketing',
        'Business Systems Automation',
        'Creative Studio',
        'Small Business Marketing',
        'Ontario Service Businesses',
      ],
      sameAs: sharedSameAs,
    },
    {
      '@type': ['LocalBusiness', 'ProfessionalService'],
      '@id': 'https://www.byismile.com/#localbusiness',
      name: 'ISMILE CDS',
      legalName: 'ISMILE Creative & Digital Studio',
      url: 'https://www.byismile.com/',
      logo: 'https://www.byismile.com/logo.png',
      image: 'https://www.byismile.com/logo.png',
      email: 'hello@byismile.com',
      description: 'Toronto, Ontario creative and digital studio — brand strategy, web design, digital marketing, and law firm website design for service businesses across Canada and the GTA.',
      priceRange: '$$',
      address: sharedAddress,
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 43.6532,
        longitude: -79.3832,
      },
      areaServed: sharedAreaServed,
      sameAs: sharedSameAs,
      parentOrganization: { '@id': 'https://www.byismile.com/#organization' },
    },
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
  if (!/"@id"\s*:\s*"https:\/\/www\.byismile\.com\/#organization"/.test(html)) {
    html = html.replace('</head>', `${block}</head>`);
    changed += 1;
  }

  if (html !== original) {
    fs.writeFileSync(filePath, html);
    normalized += 1;
  }
}

console.log(`  schema → Organization added to ${changed} pages; shared location normalized in ${normalized} pages`);
