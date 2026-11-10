# Lookrdy workspace setup

The first outfit search or wardrobe request is available to guests. A Simons guest search includes the option to request one separate image; browsing examples and shopping lists never calls fal. After the trial, an account is required for further styling. The trial is per browser cookie, not a global quota or a fraud-prevention system.

## Enable private saved looks and history

1. Open the Lookrdy Supabase project SQL editor and run [the look-library migration](supabase/migrations/202611090001_look_library.sql). The table is scoped to the authenticated owner with row-level security. No public reads or writes are allowed.
2. In Supabase Auth URL configuration, allow the local and production confirmation URLs under `/auth/confirm` (including the `next` return parameter) and enable email/password sign-in. Use the same browser when confirming a new account. Check that production email delivery and the Site URL are configured.
3. For a deployment without the existing server-only Supabase service-role key, configure a stable server-only `LOOKRDY_TRIAL_SECRET` across all instances.

Saving a look stores its shopping list and generated image, if one exists. Signed-in wardrobe boards and completed Simons previews also go into History. A wardrobe board includes the unchanged original photo beside the selected clothes, not a synthetic try-on. Raw garment uploads and standalone selfies stay in the tab; account history stores the finished board. Users can delete an entry or share/download its image themselves.

## Refresh the Simons catalog

Edit [src/data/simons/products.json](src/data/simons/products.json). For each item:

- Use the exact Simons product URL and update the current CAD price, availability, and date fields after checking the listing.
- Specify the exact colour variant if verified. Leave unknown variants flagged.
- Keep media and rights disabled until you have permission. For authorized product photos, use a file under `public/simons/products/`, put the matching `/simons/products/<file>` URL in `media.product_image_url`, and set only the rights flags covered by the approval. Display and sending the photo to the image provider are separate permissions.
- Run `node scripts/validate-simons-catalog.mjs` before deploying.

The three dinner examples use real catalog product links. They display approved photos when supplied, and labeled illustrations otherwise. Prices in the bundled catalog are estimates until checked on Simons.ca. A storefront URL does not provide an authorized image feed.
