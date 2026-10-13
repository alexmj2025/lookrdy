# Responsive review

Reviewed the local app at 320, 398, 768, 1024 and 1440 CSS pixels. Main page layout bounds were measured in the browser; intentionally scrolling landing photo rails stay within their own containers.

- Landing: mobile menu, menu CTA contrast, hero actions, photo rails, example shopping rows, footer and cookie settings.
- Create: uploaded sample photo, clothing selection, saved selection, occasion, budget, location and style; fixed action bar and form fields at 398px.
- Results: generated with local mock AI, no paid image calls. One-column cards on phones, two columns on tablets, three columns on desktop. Preview images use contain to avoid cropping the body.
- Product detail: actual seeded Simons item names, prices, variant warnings, optional layers and shopping links. Checked at all five widths.
- About and all five legal pages: checked at 398px, with long-link wrapping and contained tables.
- Simons pilot catalog: checked at 320px.
- Cookie dialog: inspected at 398px. Account and camera dialog sizing/safe-area rules reviewed in source; no account was created and no camera permission was requested.

Changes include a separate mobile row for onboarding progress, wrapping photo/mask actions, readable menu CTA text, 44px secondary action targets, 16px mobile text inputs, phone safe-area padding, and independently defined dialog colour tokens. The desktop menu closes when its breakpoint is crossed; Escape also closes the mobile menu.

These are browser viewport checks, not a physical iPhone/Android certification. Camera capture, real mobile keyboards, OS-specific safe-area behavior and native touch painting should still be checked on hardware before launch. Existing pending catalog/image permissions are described in MVP-READINESS.md.
