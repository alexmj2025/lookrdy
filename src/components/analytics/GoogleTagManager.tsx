"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { isAllowed, subscribe } from "@/components/consent/consent-store";

/**
 * Google Tag Manager, gated on analytics consent.
 *
 * GTM's own install instructions say to drop the loader unconditionally into
 * <head>. We deliberately don't: the cookie banner tells visitors "optional
 * analytics and affiliate-attribution cookies stay off unless you allow them",
 * the Cookie Policy repeats that commitment, and consent-store honours Global
 * Privacy Control. Loading GTM before a decision would contradict all three —
 * and GTM sets its own cookies and can fire third-party tags, so it is exactly
 * the kind of technology those promises cover.
 *
 * So the container loads only once `analytics` is allowed. This matches
 * lib/analytics/client.ts, which already refuses to emit funnel events without
 * the same consent.
 *
 * Because loading is conditional, this uses `afterInteractive` rather than
 * `beforeInteractive` — the latter is only valid unconditionally in the root
 * layout. Practically that costs nothing here: the container can't load before
 * the user has decided anyway.
 *
 * The <noscript> iframe from GTM's instructions is intentionally absent. With
 * JavaScript disabled the banner cannot run and no consent can be recorded, so
 * under a deny-by-default policy that iframe would track precisely the people
 * who never had the chance to agree.
 */

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID ?? "GTM-WHP846PK";

export function GoogleTagManager() {
  const [allowed, setAllowed] = useState(false);
  const everLoaded = useRef(false);

  useEffect(() => {
    // Read after mount: consent lives in localStorage, so the server render
    // and the first client render must both assume "not allowed".
    setAllowed(isAllowed("analytics"));

    const unsubscribe = subscribe(() => {
      const next = isAllowed("analytics");
      // Unmounting the tag can't unload a container that already ran. A
      // reload is the only way to actually honour a withdrawal, and the
      // Cookie Policy promises consent is withdrawable at any time.
      if (everLoaded.current && !next) {
        window.location.reload();
        return;
      }
      setAllowed(next);
    });
    // subscribe() returns Set.delete, which yields a boolean; React requires
    // a cleanup that returns nothing.
    return () => {
      unsubscribe();
    };
  }, []);

  if (!allowed) return null;
  everLoaded.current = true;

  return (
    <Script id="gtm-loader" strategy="afterInteractive">
      {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
    </Script>
  );
}
