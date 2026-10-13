# MVP preview improvements

Create now asks the visitor to paint the clothing areas to replace. A portrait PNG and alpha mask are prepared in browser memory. Original proportions are preserved with padding, not stretching. The server validates the mask and uses high-fidelity image editing for GPT Image 1/1.5. After generation it restores source pixels everywhere outside the selection. An unpainted face, hair, hands and background are protected even if the model changes them. Body shape within the painted area and garment fit remain approximate. Painting over a face makes it editable; the UI explains what to exclude.

Product lists stream first, then three previews generate concurrently and update independently. This improves time to useful results; model latency is not guaranteed. Medium image quality is explicit, with a 180-second timeout and no automatic image retries. Failures show an unavailable preview rather than a demo image. Reloading interrupts the stream; unfinished stored cards display that clearly.

Photos and masks remain in memory on the server. Generated previews include source pixels and are stored in the browser's IndexedDB, as before. Do not describe generated images as never stored. They are replaced on the next generation; photos and previews are not saved to server disk or Supabase.

## What the owner needs to supply

- Permission covering public display AND sending product photos to the image provider.
- Approved photos for selected colour variants, accurate item URLs, prices, availability and current review dates. The bundled 50-item Simons pilot has no authorized imagery and is overdue for review. The 158-item legacy Supabase catalog is not used by this Create flow.
- Full-body JPG/PNG/WebP photos from consenting testers, covering different poses, body types and lighting. Evaluate identity, garment fit, product similarity and elapsed time on paid generations before making quality claims.

## Approved photo integration

After permission is obtained, put photos in `public/simons/products/` with simple filenames such as `SIM-001-blue.jpg`. Set the item's `media.product_image_url` to `/simons/products/SIM-001-blue.jpg`. Display requires `rights.public_display_allowed=true`, `media.image_display_authorized=true` and `rights.link_out_only=false`. Generation additionally requires `rights.image_use_authorized=true` and a confirmed variant (`variant.variant_selection_required=false`). Record the selected colour and variant-specific attributes. Do not mark inferred data as verified.

The generator reads only local files in that directory. It does not fetch arbitrary external URLs. Existing seed authorization remains false. The catalog validator accepts approved local assets only with explicit permission flags; it cannot verify the underlying license. Keep evidence of authorization separately.

## Deployment and checks

Keep Production Supabase settings, `OPENAI_API_KEY`, `MOCK_AI=0`, and `OPENAI_IMAGE_MODEL=gpt-image-1`. Deploy source and lockfile together. Generation requires the existing 300-second function budget and streaming support. Verify streaming on the actual hosting plan.

Run `npx tsc --noEmit`, `npx tsx --test src/lib/ai/protectedEdit.test.ts`, `node scripts/validate-simons-catalog.mjs`, and `npm run build`. Health now reports actual Simons pilot counts, photo coverage and unresolved variants separately from the legacy catalog.

The dependency installation also reported 20 audit findings, including 2 critical findings. They have not been remediated in this change; review the dependency audit before public MVP launch.

These changes do not establish exact product replication, current stock, a Simons license, or automatic deployment. Keep previews labelled approximate until acceptance tests support stronger claims. Automated clothing segmentation could remove the painting step later, but needs separate quality evaluation.
