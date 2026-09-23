# IndexNow Setup

## Status

The repository now includes an opt-in submission script at `scripts/submit-indexnow.js`. It is not run during the public build, no key is committed, and no URLs have been submitted from this workspace.

IndexNow is appropriate for this static site because blog posts, service pages, and case studies change independently and the deployment does not currently expose a CMS webhook. IndexNow notifies participating engines that a URL changed; it does not guarantee crawling, indexing, or rankings.

## One-time setup

1. Generate a URL-safe key containing 8–128 characters. A random hexadecimal value is suitable.
2. Create a UTF-8 text file named `<key>.txt` at the deployed site root. The file must contain only the same key. After deployment, confirm it loads at `https://www.byismile.com/<key>.txt`.
3. Keep the key out of repository history if your deployment process treats it as a credential. The IndexNow verification file is publicly reachable by design, but the script reads its value from an environment variable to avoid hard-coding it in source.
4. Configure `INDEXNOW_KEY` in the deployment environment. If the verification file is not at the root, also configure `INDEXNOW_KEY_LOCATION` with its full HTTPS URL.

## Submit URLs

Submit every canonical URL in `sitemap.xml`:

```bash
INDEXNOW_KEY='your-key' npm run indexnow
```

Submit only URLs changed in a deployment:

```bash
INDEXNOW_KEY='your-key' npm run indexnow -- \
  https://www.byismile.com/web-design.html \
  https://www.byismile.com/signs-your-website-is-losing-clients.html
```

The script rejects URLs outside `https://www.byismile.com`, sends one batch to `https://api.indexnow.org/indexnow`, and treats HTTP 200 or 202 as accepted.

## Deployment integration

Run IndexNow only after the new HTML and key file are publicly available. A practical CI sequence is:

1. `npm ci`
2. `npm run build`
3. `npm run seo:check`
4. deploy
5. run `npm run indexnow` with the changed canonical URLs

Do not submit every URL on every build unless all of those pages materially changed. Include deleted URLs once after they begin returning the correct 404 or 410 response.

## Verification

- Confirm the key URL returns HTTP 200 and the response body exactly matches the key.
- Confirm the submission command returns HTTP 200 or 202.
- Review IndexNow reporting in Bing Webmaster Tools.
- Continue submitting `sitemap.xml`; IndexNow complements rather than replaces the sitemap.

Protocol reference: <https://www.indexnow.org/documentation>
