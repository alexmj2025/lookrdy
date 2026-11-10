"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/lib/onboarding/auth";
import { storeLibraryLook, type LookSnapshot, type LookSource } from "@/lib/onboarding/library";
import { ShareLook } from "./ShareLook";

export function LookActions({ entryKey, source, snapshot, returnTo }: {
  entryKey: string; source: LookSource; snapshot: LookSnapshot; returnTo: string;
}) {
  const { user, loading } = useAuth();
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");
  async function save() {
    setStatus("saving");
    try {
      await storeLibraryLook(entryKey, source, snapshot, true);
      setStatus("saved");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Couldn’t save this look.");
      setStatus("error");
    }
  }
  return <div className="onb-work-actions">
    {!loading && (user ? (
      <button className="onb-btn onb-btn--primary" type="button" disabled={status === "saving" || status === "saved"} onClick={() => void save()}>
        {status === "saving" ? "Saving…" : status === "saved" ? "Saved to your looks" : "Save look"}
      </button>
    ) : (
      <Link href={`/account?next=${encodeURIComponent(returnTo)}`} className="onb-btn onb-btn--primary">Create account to save</Link>
    ))}
    <ShareLook imageUrl={snapshot.imageUrl} title={snapshot.title} />
    {status === "error" && <p className="onb-error" role="alert">{message}</p>}
  </div>;
}
