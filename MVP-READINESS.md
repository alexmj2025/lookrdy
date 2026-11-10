# MVP preview improvements

Create has three steps: photo, occasion, and budget. The first try is available to guests; sign-in is required to continue after that. For Simons try-on, the server prepares the photo in memory, preserving its proportions with padding. The model is instructed to change only clothes and shoes and preserve the face, pose, and background. No drawing is required, and unchanged pixels are not guaranteed. The separate wardrobe board keeps the original photo untouched.

Product lists return without calling an image provider. A visitor can request one preview from the selected outfit's detail page, with the estimated cost shown for fal. Previews are never retried automatically. If a preview request fails or its connection is interrupted, the shopping list remains available and visitors are advised to check provider usage before requesting another image.

Original Simons try-on uploads remain in memory on the server. Generated previews are stored in the browser's IndexedDB and may appear in private account history or saved looks. Wardrobe boards may include the original selfie next to the suggested pieces. See [workspace setup](WORKSPACE-SETUP.md) for account storage configuration.

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

These changes do not establish exact product replication, current stock, a Simons license, or automatic deployment. Keep previews labelled approximate until acceptance tests support stronger claims.
