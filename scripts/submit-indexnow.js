const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://www.byismile.com';
const key = process.env.INDEXNOW_KEY;

if (!key) {
  console.error('INDEXNOW_KEY is required. See INDEXNOW-SETUP.md.');
  process.exit(1);
}

if (!/^[A-Za-z0-9_-]{8,128}$/.test(key)) {
  console.error('INDEXNOW_KEY must be 8–128 URL-safe characters.');
  process.exit(1);
}

const supplied = process.argv.slice(2);
const sitemap = fs.readFileSync(path.resolve(__dirname, '..', 'sitemap.xml'), 'utf8');
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
const urlList = supplied.length ? supplied : sitemapUrls;

for (const value of urlList) {
  const url = new URL(value);
  if (url.origin !== SITE_URL) {
    console.error(`Refusing URL outside ${SITE_URL}: ${value}`);
    process.exit(1);
  }
}

const keyLocation = process.env.INDEXNOW_KEY_LOCATION || `${SITE_URL}/${key}.txt`;
const payload = {
  host: 'www.byismile.com',
  key,
  keyLocation,
  urlList,
};

(async () => {
  const response = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
  });

  if (![200, 202].includes(response.status)) {
    const body = await response.text();
    throw new Error(`IndexNow returned ${response.status}${body ? `: ${body}` : ''}`);
  }

  console.log(`IndexNow accepted ${urlList.length} URL(s) with HTTP ${response.status}.`);
})().catch(error => {
  console.error(error.message);
  process.exit(1);
});
