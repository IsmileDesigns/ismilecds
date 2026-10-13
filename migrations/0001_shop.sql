CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  eyebrow TEXT NOT NULL DEFAULT 'Digital resource',
  description TEXT NOT NULL DEFAULT '',
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
  compare_at_cents INTEGER NOT NULL DEFAULT 0 CHECK (compare_at_cents >= 0),
  category TEXT NOT NULL DEFAULT 'Resources',
  image_url TEXT NOT NULL DEFAULT '',
  image_alt TEXT NOT NULL DEFAULT '',
  asset_key TEXT NOT NULL DEFAULT '',
  asset_name TEXT NOT NULL DEFAULT '',
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  featured INTEGER NOT NULL DEFAULT 0 CHECK (featured IN (0, 1)),
  archived INTEGER NOT NULL DEFAULT 0 CHECK (archived IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_products_public ON products(active, archived, featured, created_at);

INSERT OR IGNORE INTO products (id, slug, name, eyebrow, description, price_cents, compare_at_cents, category, image_url, image_alt, asset_key, asset_name, active, featured, created_at, updated_at) VALUES
('brand-foundation-workbook', 'brand-foundation-workbook', 'Brand Foundation Workbook', 'Strategy tool', 'A focused workbook for defining your audience, position, brand promise, voice, and next best moves.', 3900, 0, 'Brand', '/branding.webp', 'Ismile brand strategy workbook preview', '', 'Ismile Brand Foundation Workbook.pdf', 1, 1, '2026-10-01T00:00:00.000Z', '2026-10-01T00:00:00.000Z'),
('client-onboarding-os', 'client-onboarding-os', 'Client Onboarding OS', 'Systems kit', 'A clean client journey with intake prompts, kickoff checklists, handoff templates, and automation maps.', 5900, 0, 'Systems', '/systems.webp', 'Client onboarding system template preview', '', 'Ismile Client Onboarding OS.zip', 1, 1, '2026-10-02T00:00:00.000Z', '2026-10-02T00:00:00.000Z'),
('website-copy-prompt-deck', 'website-copy-prompt-deck', 'Website Copy Prompt Deck', 'Copy resource', 'Sharp prompts and page-by-page guidance for writing a website that sounds human and moves people to act.', 2900, 0, 'Web', '/WebDesign.png', 'Website copy prompt deck on a laptop', '', 'Ismile Website Copy Prompt Deck.pdf', 1, 0, '2026-10-03T00:00:00.000Z', '2026-10-03T00:00:00.000Z'),
('content-planning-system', 'content-planning-system', 'No-Fluff Content Planner', 'Marketing template', 'A practical content system for turning one strong idea into a month of useful, on-brand marketing.', 2400, 0, 'Marketing', '/digitalmarketing.png', 'Digital content planning template preview', '', 'Ismile No-Fluff Content Planner.zip', 1, 0, '2026-10-04T00:00:00.000Z', '2026-10-04T00:00:00.000Z');
