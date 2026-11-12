"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import "../onboarding.css";
import { WorkspacePage } from "@/components/onboarding/WorkspacePage";
import { ShareLook } from "@/components/onboarding/ShareLook";
import { useAuth, signOut } from "@/lib/onboarding/auth";
import { deleteLibraryLook, isLookPhoto, readLibrary, updateLibraryFavorite, type LibraryEntry } from "@/lib/onboarding/library";

export default function SavedPage() {
  const { user, loading } = useAuth();
  const [entries, setEntries] = useState<LibraryEntry[] | null>(null);
  const [filter, setFilter] = useState<"saved" | "history">("saved");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  useEffect(() => {
    let ignore = false;
    setEntries(null); setError("");
    if (user) void readLibrary().then((looks) => { if (!ignore) setEntries(looks); })
      .catch((err: Error) => { if (!ignore) setError(err.message); });
    return () => { ignore = true; };
  }, [user?.id]); // Session refreshes don't replace an open library view.

  async function change(entry: LibraryEntry, remove = false) {
    setBusy(entry.entry_key); setError("");
    try {
      if (remove) {
        if (!window.confirm("Delete this outfit and its image from your account?")) return;
        await deleteLibraryLook(entry.entry_key);
        setEntries((all) => all?.filter((row) => row.entry_key !== entry.entry_key) ?? []);
      } else {
        await updateLibraryFavorite(entry.entry_key, !entry.saved);
        setEntries((all) => all?.map((row) => row.entry_key === entry.entry_key ? { ...row, saved: !row.saved } : row) ?? []);
      }
    } catch (err) { setError(err instanceof Error ? err.message : "Couldn’t update this look."); }
    finally { setBusy(""); }
  }

  const visible = entries?.filter((entry) => filter === "history" || entry.saved) ?? [];
  return <WorkspacePage>
    <p className="onb-eyebrow">Private outfit library</p>
    <h1 className="onb-h1">My looks</h1>
    <p className="onb-lede">Find the outfits you saved and return to previews you created while signed in.</p>
    {loading ? <p role="status">Checking your account…</p> : !user ? (
      <div className="onb-work-actions"><Link className="onb-btn onb-btn--primary" href="/account?next=/saved">Create account or sign in</Link></div>
    ) : <>
      <div className="onb-work-actions">
        <button type="button" className={`onb-btn onb-btn--${filter === "saved" ? "primary" : "ghost"}`} aria-pressed={filter === "saved"} onClick={() => setFilter("saved")}>Saved looks</button>
        <button type="button" className={`onb-btn onb-btn--${filter === "history" ? "primary" : "ghost"}`} aria-pressed={filter === "history"} onClick={() => setFilter("history")}>History</button>
        <Link href="/collections" className="onb-btn onb-btn--ghost">Organize collections</Link>
        <button type="button" className="onb-btn onb-btn--quiet" onClick={() => void signOut()}>Sign out</button>
      </div>
      {!entries && !error && <p role="status">Loading looks…</p>}
      {entries && !visible.length && <p className="onb-help">{filter === "saved" ? "No saved outfits yet. Choose Save look on any outfit." : "No looks in your history yet. Create a preview or a wardrobe outfit to get started."}</p>}
      <div className="onb-work-grid">
        {visible.map((entry) => <article className="onb-work-card" key={entry.entry_key}>
          {isLookPhoto(entry.snapshot.imageUrl) && <img className="onb-library-img" src={entry.snapshot.imageUrl} alt={entry.snapshot.title} loading="lazy" />}
          <div className="onb-work-card-body">
            <p className="onb-eyebrow">{entry.source === "simons" ? "Simons" : "My wardrobe"}</p>
            <h2 className="onb-aside__title">{entry.snapshot.title}</h2>
            <p className="onb-help">{entry.snapshot.description}</p>
            <ul className="onb-work-items">{entry.snapshot.items.map((item, index) => <li key={index}>
              {item.url && /^https:\/\/(www|m)\.simons\.ca\//.test(item.url) ? <a href={item.url} target="_blank" rel="noreferrer">{item.name}</a> : item.name}
            </li>)}</ul>
            <div className="onb-work-actions">
              <button className="onb-btn onb-btn--ghost" type="button" disabled={!!busy} onClick={() => void change(entry)}>{entry.saved ? "Unsave" : "Save look"}</button>
              <ShareLook title={entry.snapshot.title} imageUrl={entry.snapshot.imageUrl} />
              <button className="onb-btn onb-btn--quiet" type="button" disabled={!!busy} onClick={() => void change(entry, true)}>Delete</button>
            </div>
          </div>
        </article>)}
      </div>
    </>}
    {error && <p className="onb-error" role="alert">{error}</p>}
  </WorkspacePage>;
}
