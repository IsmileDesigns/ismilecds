# Ismile Digital Shop setup

The storefront and admin are implemented in the existing Cloudflare Pages architecture. Product records live in D1, product images and customer files live in R2, and payments use Stripe Checkout.

## 1. Create the Cloudflare storage

In the Cloudflare dashboard:

1. Create a D1 database named `ismile-shop`.
2. Open its console and run `migrations/0001_shop.sql`, followed by later numbered migrations in order. This creates the product table and four editable starter products.
3. Create an R2 bucket named `ismile-shop-assets`.
4. In the Pages project, add a D1 binding named exactly `SHOP_DB` and select `ismile-shop`.
5. Add an R2 binding named exactly `SHOP_ASSETS` and select `ismile-shop-assets`.

For a Wrangler-based workflow, the migration can instead be applied with:

```bash
npx wrangler d1 execute ismile-shop --remote --file=migrations/0001_shop.sql
npx wrangler d1 execute ismile-shop --remote --file=migrations/0002_shop_artwork.sql
```

## 2. Create the admin sign-in secrets

Generate a password hash and a random session-signing secret without placing the password in source code or a command argument:

```bash
read -s SHOP_PASSWORD
printf '%s' "$SHOP_PASSWORD" | node scripts/setup-shop-secrets.mjs
unset SHOP_PASSWORD
```

In **Cloudflare Pages → Settings → Variables and Secrets**, add the two generated values as encrypted secrets, plus your admin email:

- `ADMIN_EMAIL` — the email used to sign in
- `ADMIN_PASSWORD_HASH` — the generated PBKDF2 value
- `ADMIN_SESSION_SECRET` — the generated random value

Do not put these values in Git or browser JavaScript. The admin cookie is HTTP-only, secure, same-site, signed, and expires after eight hours.

## 3. Connect Stripe

1. In Stripe, copy the Secret key for the mode you want to use (start with a test key).
2. Add it to Cloudflare Pages as the encrypted secret `STRIPE_SECRET_KEY`.
3. Redeploy the Pages project so its Functions receive the new bindings and secrets.
4. Place a test order using a Stripe test card before switching to a live key.

Prices are created dynamically from the current D1 product record at checkout, so adding a product does not require creating a Stripe Price manually. Checkout is in Canadian dollars.

Configure your applicable Canadian tax registrations and Stripe Tax settings before accepting live orders. The starter checkout does not assume a tax rate on your behalf.

## 4. Use the shop

- Storefront: `/shop.html`
- Admin sign-in: `/shop-admin.html`
- Add or edit a product in the admin, upload its image, and attach the customer download file.
- Set **Live in shop** to publish it. Draft products remain visible only in the admin.
- Archiving removes a product from the shop and admin list while preserving past customer downloads.
- Checkout is blocked for products without an attached customer download, which prevents accepting payment for an incomplete listing.
- Customers receive secure download links after Stripe confirms payment. Download files are never exposed through the public image route.

## Deployment checklist

- Apply the D1 migration before the first shop deployment.
- Confirm all four bindings/secrets are present in both Preview and Production if you use preview deployments.
- Test admin sign-in, product creation, image upload, Stripe checkout, and download delivery.
- Add a Cloudflare WAF rate-limit rule for repeated POST requests to `/api/shop/auth/login` before launch.
- Replace or update the four starter products and attach their real downloadable files before accepting live payments.
