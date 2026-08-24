"use client";

import { Dialog } from "@base-ui/react/dialog";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ALLOW_ALL,
  CATEGORY_COPY,
  DENY_ALL,
  type ConsentCategories,
  readConsent,
  resolveInitialState,
  writeConsent,
} from "./consent-store";
import "./consent.css";

/** Lets any part of the site reopen the settings dialog. */
export const OPEN_CONSENT_EVENT = "lookrdy:open-consent";

export function openConsentSettings() {
  window.dispatchEvent(new Event(OPEN_CONSENT_EVENT));
}

export function CookieConsent() {
  const [showBar, setShowBar] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draft, setDraft] = useState<ConsentCategories>(DENY_ALL);
  const [gpc, setGpc] = useState(false);

  useEffect(() => {
    const state = resolveInitialState();
    if (state.show) {
      setShowBar(true);
    } else {
      setDraft(state.record.categories);
      setGpc(state.record.viaGpc === true);
    }
  }, []);

  useEffect(() => {
    const open = () => {
      setDraft(readConsent()?.categories ?? DENY_ALL);
      setDialogOpen(true);
    };
    window.addEventListener(OPEN_CONSENT_EVENT, open);
    return () => window.removeEventListener(OPEN_CONSENT_EVENT, open);
  }, []);

  const decide = useCallback((categories: ConsentCategories) => {
    writeConsent(categories);
    setDraft(categories);
    setShowBar(false);
    setDialogOpen(false);
  }, []);

  const toggle = (id: keyof ConsentCategories) =>
    setDraft((d) => ({ ...d, [id]: !d[id] }));

  return (
    <>
      {showBar && !dialogOpen && (
        <div className="ck" role="region" aria-label="Cookie consent">
          <div className="ck__bar">
            <p className="ck__text">
              We use strictly necessary cookies to run Lookrdy. Optional
              analytics and affiliate-attribution cookies stay off unless you
              allow them. See our{" "}
              <Link href="/legal/cookie">Cookie Policy</Link>.
            </p>
            <div className="ck__actions">
              <button
                type="button"
                className="ck__btn ck__btn--quiet"
                onClick={() => {
                  setDraft(readConsent()?.categories ?? DENY_ALL);
                  setDialogOpen(true);
                }}
              >
                Manage
              </button>
              <button
                type="button"
                className="ck__btn ck__btn--outline"
                onClick={() => decide(DENY_ALL)}
              >
                Reject optional
              </button>
              <button
                type="button"
                className="ck__btn ck__btn--primary"
                onClick={() => decide(ALLOW_ALL)}
              >
                Accept all
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mounted only while open. Base UI otherwise holds the popup in the DOM
          waiting on an exit animation and, in this setup, never releases it —
          leaving a transparent fixed backdrop that swallows every click. */}
      {dialogOpen && (
      <Dialog.Root open onOpenChange={setDialogOpen}>
        <Dialog.Portal>
          <Dialog.Backdrop className="ck-backdrop" />
          <Dialog.Popup className="ck-dialog">
            <Dialog.Title className="ck-dialog__title">
              Cookie settings
            </Dialog.Title>
            <Dialog.Description className="ck-dialog__intro">
              Optional technologies stay disabled until you allow them, and you
              can change this at any time. Details are in our{" "}
              <Link href="/legal/cookie">Cookie Policy</Link>.
            </Dialog.Description>

            <div className="ck-row">
              <div className="ck-row__copy">
                <span className="ck-row__label">Strictly necessary</span>
                <p className="ck-row__desc">
                  Sign-in, session continuity, security, fraud prevention,
                  payment flow, and storing your privacy choices. The Service
                  cannot run without these.
                </p>
              </div>
              <span className="ck-row__locked">Always on</span>
            </div>

            {CATEGORY_COPY.map((cat) => (
              <div className="ck-row" key={cat.id}>
                <div className="ck-row__copy">
                  <span className="ck-row__label" id={`ck-${cat.id}`}>
                    {cat.label}
                  </span>
                  <p className="ck-row__desc">{cat.description}</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={draft[cat.id]}
                  aria-labelledby={`ck-${cat.id}`}
                  className="ck-switch"
                  onClick={() => toggle(cat.id)}
                />
              </div>
            ))}

            <div className="ck-dialog__foot">
              <button
                type="button"
                className="ck__btn ck__btn--outline"
                onClick={() => decide(DENY_ALL)}
              >
                Reject optional
              </button>
              <button
                type="button"
                className="ck__btn ck__btn--outline"
                onClick={() => decide(ALLOW_ALL)}
              >
                Accept all
              </button>
              <button
                type="button"
                className="ck__btn ck__btn--primary"
                onClick={() => decide(draft)}
              >
                Save choices
              </button>
            </div>

            {gpc && (
              <p className="ck-note">
                Your browser sent a Global Privacy Control signal, so optional
                technologies were switched off automatically. Changing a setting
                here overrides that for this browser.
              </p>
            )}
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
      )}
    </>
  );
}
