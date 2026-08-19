# lookrdy

An AI personal styling and shopping tool. You give it an occasion, a budget, a
location, and a photo; it finds **real products** that fit those constraints,
composes three complete outfits from them, and generates an image of you
wearing each one. Every garment in the image is tappable and links straight to
the retailer.

Next.js (App Router) · TypeScript · React · Tailwind · Supabase · OpenAI.

---

## Quick start

```bash
npm install
cp .env.local.example .env.local   # then fill it in — see below
npm run dev
```

Open http://localhost:3000.

**It runs with no credentials at all.** Without an OpenAI key it uses a
deterministic styling engine and a placeholder visualization; without Supabase
it reads the bundled JSON catalog and writes events to a local log file. Every
screen, including the hotspots, works in that mode.

---

## Environment variables

Copy `.env.local.example` → `.env.local`. Nothing except `NEXT_PUBLIC_*`
reaches the browser.

| Variable | Required | What it does |
|---|---|---|
| `OPENAI_API_KEY` | For live AI | Request parsing, outfit composition, and image generation. Server-side only. Get one at [platform.openai.com](https://platform.openai.com/api-keys). |
| `MOCK_AI` | No | `1` = no OpenAI calls at all; deterministic composition and a placeholder visualization. Set to `0` once your OpenAI account has credits. |
| `OPENAI_TEXT_MODEL` | No | Defaults to `gpt-4o`. |
| `OPENAI_IMAGE_MODEL` | No | Defaults to `gpt-image-1`. |
| `NEXT_PUBLIC_SUPABASE_URL` | For persistence | Supabase project URL (Project Settings → API). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | For persistence | Public anon key. |
| `SUPABASE_SERVICE_ROLE_KEY` | For persistence | Service-role key. **Server-side only** — it bypasses row-level security. |
| `FREE_GENERATION_LIMIT` | No | Free generations per session before the cap message. Defaults to `3`. |

### Current status of this checkout

Supabase is **live**: the schema is applied and all 158 products are seeded.
Catalog reads, funnel events, and generation counts all go to Postgres.

`MOCK_AI=1` is still set because the OpenAI account attached to the key in
`.env.local` returns `429 insufficient_quota`. Add billing at
platform.openai.com, set `MOCK_AI=0`, restart, and the live pipeline runs.

> **Rotate both secrets.** The `OPENAI_API_KEY` and the
> `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` were shared in a chat
> transcript. The service-role key in particular bypasses row-level security
> entirely — it is full read/write access to the database. Roll it at
> Supabase → Project Settings → API Keys once testing settles.

### Health check

`GET /api/health` reports which backends are actually live — the catalog
falls back to local JSON silently by design, so a misconfigured deploy
otherwise looks identical to a working one. Hit it right after deploying:

```jsonc
{
  "catalog": { "source": "supabase", "productCount": 158, "error": null },
  "supabase": { "configured": true, "tables": { "products": "ok", ... } },
  "ai": { "engine": "mock", "apiKeyPresent": true }
}
```

If `catalog.source` is `"local-json"`, the env vars didn't take or the seed
never ran. It reports whether keys are *present*, never their values.

---

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. Open the SQL editor and run [`supabase/schema.sql`](supabase/schema.sql).
   It creates `products`, `generations`, and `events`, enables RLS on all
   three, and adds a `funnel_summary` view.
3. Put the three Supabase variables in `.env.local`.
4. `npm run seed` — upserts the catalog into `products`. Idempotent, so
   re-run it any time you edit the catalog.

Without these steps the app falls back to `src/data/catalog.json` and appends
funnel events to `.lookrdy-events.log` at the project root.

To read the funnel once Supabase is live:

```sql
select * from funnel_summary order by total desc;
```

---

## How it works — the pipeline

The core architectural rule is that **real products are retrieved before
anything is composed, and nothing is visualized until it has been composed**.
The module boundaries enforce this rather than relying on convention:

| Step | Module | Input → output |
|---|---|---|
| 1. Parse | `src/lib/ai/parseRequest.ts` | Free text + form → structured constraints. Never sees the catalog. |
| 2. Retrieve | `src/lib/catalog/retrieve.ts` | Constraints → real products filtered by occasion, budget, location, and style. No LLM involved. |
| 3. Compose | `src/lib/ai/compose.ts` | Retrieved products **only** → three bundles + rationales. Every id is re-validated; every total is recomputed. |
| 4. Visualize | `src/lib/ai/visualize.ts` | A validated bundle + your photo → generated image. |

`visualize.ts` accepts an already-composed `Bundle` and imports nothing from
the catalog, so it is structurally incapable of running first. The orchestrator
is [`src/app/api/generate/route.ts`](src/app/api/generate/route.ts).

**Budget is a hard constraint on the outfit total, not a per-item filter.** It's
enforced in three places: retrieval discards items that can't fit in any
complete outfit, composition drops optional pieces and downgrades expensive
ones until the total fits, and any bundle still over budget is rejected outright.

---

## Editing the catalog

[`src/data/catalog.json`](src/data/catalog.json) holds 158 products. Edit it
directly — it's the source of truth. Fields:

```jsonc
{
  "id": "uniqlo-wool-blend-chesterfield-coat",
  "retailer": "Uniqlo",
  "name": "Wool-Blend Chesterfield Coat",
  "category": "jacket",        // jacket | top | trousers | shoes | bag | accessory
  "color": "charcoal",
  "styleTags": ["tailored", "classic", "monochrome"],
  "formality": 4,               // 1 = very casual … 5 = formal
  "price": 149.9,
  "currency": "CAD",
  "imageUrl": "/catalog/jacket.svg",
  "productUrl": "https://www.uniqlo.com/ca/en/men/outerwear",
  "countries": ["CA", "US"],   // where the retailer ships — drives the location filter
  "sizes": ["S", "M", "L", "XL"],
  "lastChecked": "2026-08-10",
  "tier": "value"               // value | mid | premium
}
```

To regenerate the whole file from compact per-retailer data, edit
`supabase/buildCatalog.ts` and run `npx tsx supabase/buildCatalog.ts`.

⚠️ **This is placeholder data.** Product names and prices are realistic but
invented, and `productUrl` points at each retailer's real *category* page
rather than a specific item. Replace with a real sourced list before shipping.

---

## Where to plug things in later

Three integration boundaries are marked with comments in the code:

| What | File | Notes |
|---|---|---|
| **Live product feed** | `src/lib/catalog/source.ts` | Replace `fetchAll()` with a Rakuten / Awin / Skimlinks loader that maps feed entries onto `Product`. Nothing downstream changes. |
| **Refined hotspot detection** | `src/lib/hotspots.ts` | Zones are currently declarative body regions. Swap `zonesFor()` for a segmentation model returning boxes in the same percentage format. |
| **Affiliate links + payment** | `src/lib/affiliate.ts` | `wrapOutboundUrl()` is the single choke point for every outbound link. Payment slots in where `/api/generate` returns `limit_reached`. |

Organic ranking (in `retrieve.ts`) must stay independent of affiliate
consideration — it scores on style fit, colour, and formality only. Keep
commission data out of it.

---

## Hotspots

The generated image has no coordinate data, so hotspots are **not** detected
from the image. Each garment category maps to an approximate body region
defined as percentages in `src/lib/hotspots.ts`:

```ts
trousers: { x: 34, y: 50, w: 32, h: 30 },
shoes:    { x: 33, y: 83, w: 34, h: 12 },
```

Percentages mean placement holds at every screen size. **Expect to tune these
numbers** once you've reviewed real generated images — that file is the only
place they're defined.

Interaction is tap-first: markers are 44px buttons, cards open on tap and
dismiss on tap-outside, Escape, or re-tap. Hover is an enhancement applied only
on devices that report real hover support. Cards anchor to the left, centre, or
right of the image depending on the zone, so they never overflow on a phone.
Below the image, the same items are listed in plain stacked form as a fallback.

---

## Privacy

Your photo stays in the browser tab (a module-level variable, not
`sessionStorage`). It is POSTed to `/api/generate` once, held in memory for the
generation call, and **never written to disk, Supabase, or logs**. Closing the
tab or pressing "Remove photo" discards it. Consent is an explicit checkbox
before the flow continues.

---

## Out of scope (deliberately)

Accounts/login, payment/checkout, wardrobe features, saved looks beyond the
session, social sharing, a native app, live retailer APIs, and exact fit
simulation.

---

## Deploying to Vercel

Push the repo, import it in Vercel, and add the same environment variables in
Project Settings → Environment Variables. `SUPABASE_SERVICE_ROLE_KEY` and
`OPENAI_API_KEY` must **not** be prefixed with `NEXT_PUBLIC_`.

## Landing page images

The landing page at `/` renders every photo through
`src/components/landing/Photo.tsx`, which falls back to a labelled placeholder
when a file is absent. The 24 photos live in `public/landing/` and are built
from the Figma exports in the repo root's `public/img/`:

```bash
node scripts/ingest-landing-photos.mjs
```

The script holds the source-to-slot mapping. The exports have meaningless
names (`image 29.png`, `Frame 1000004959.png`), so the mapping was made by
looking at each file, and the script's comments record what each one is.

Nothing is cropped — the comp's own proportions are kept (hero cards are tall
and narrow at 0.45, product tiles are landscape), and the `ratio` prop at each
`<Photo>` call site matches its source. Alpha is flattened onto each tile's own
background colour, sampled from its top-left pixel, so the rounded-corner
product tiles keep their tint. Output is progressive mozjpeg at q82, capped at
1400px on the long edge for portraits and 800px for product tiles: 32 MB of PNG
in, ~1.2 MB of JPG out.

Two notes for anyone swapping photography:

- `complete/hero.jpg` has the "Save look" chip and the "Look 01 · Modern
  neutral" caption baked into the pixels. `CompleteLook.tsx` therefore renders
  no overlays of its own. A replacement photo without those chips needs them
  added back in that component.
- Step 03 of "How it works" uses `steps/item-1..3.jpg`, which are a different
  set of products from the shopping list's `complete/item-1..4.jpg`.
