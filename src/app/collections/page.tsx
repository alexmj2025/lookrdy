"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import "../onboarding.css";
import { WorkspacePage } from "@/components/onboarding/WorkspacePage";
import { ShareLook } from "@/components/onboarding/ShareLook";
import { useAuth } from "@/lib/onboarding/auth";
import { isLookPhoto, readLibrary, type LibraryEntry } from "@/lib/onboarding/library";
import { createCollection, readCollections, setCollectionLook, type Collection, type CollectionLook } from "@/lib/onboarding/workspaceLibrary";

export default function CollectionsPage() {
  const { user, loading } = useAuth();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [memberships, setMemberships] = useState<CollectionLook[]>([]);
  const [looks, setLooks] = useState<LibraryEntry[]>([]);
  const [selected, setSelected] = useState("");
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState("");
  const [pending, setPending] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setCollections([]); setMemberships([]); setLooks([]); setSelected(""); setPhoto(""); setError(""); setPending(true);
    if (user) void Promise.all([readCollections(), readLibrary()])
      .then(([groups, entries]) => {
        if (!active) return;
        setCollections(groups.collections);
        setMemberships(groups.memberships);
        setSelected(groups.collections[0]?.id ?? "");
        setLooks(entries.filter((entry) => isLookPhoto(entry.snapshot.imageUrl)));
      })
      .catch((err: Error) => { if (active) setError(err.message); })
      .finally(() => { if (active) setPending(false); });
    return () => { active = false; };
  }, [user?.id]);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || !name.trim()) return;
    setBusy(true); setError("");
    try {
      const group = await createCollection(name.trim());
      setCollections((all) => [group, ...all]); setSelected(group.id); setName(""); setPhoto("");
    } catch (err) { setError(err instanceof Error ? err.message : "Couldn’t create the collection."); }
    finally { setBusy(false); }
  }

  async function change(entryKey: string, add: boolean) {
    if (!selected || !entryKey || busy) return;
    setBusy(true); setError("");
    try {
      await setCollectionLook(selected, entryKey, add);
      setMemberships((all) => add
        ? [...all, { collection_id: selected, entry_key: entryKey }]
        : all.filter((row) => row.collection_id !== selected || row.entry_key !== entryKey));
      setPhoto("");
    } catch (err) { setError(err instanceof Error ? err.message : "Couldn’t update the collection."); }
    finally { setBusy(false); }
  }

  const selectedKeys = new Set(memberships.filter((entry) => entry.collection_id === selected).map((entry) => entry.entry_key));
  const visible = looks.filter((look) => selectedKeys.has(look.entry_key));
  const available = looks.filter((look) => !selectedKeys.has(look.entry_key));
  return <WorkspacePage>
    <h1 className="onb-h1">My collections</h1>
    <p className="onb-lede">Group outfit photos by occasion, season, or anything you’re planning.</p>
    {loading ? <p role="status">Checking your account…</p> : !user ? (
      <Link className="onb-btn onb-btn--primary" href="/account?next=/collections">Sign in to manage collections</Link>
    ) : pending ? <p role="status">Loading collections…</p> : <>
      <form className="onb-work-form onb-collection-create" onSubmit={create}>
        <label className="onb-label" htmlFor="collection-name">New collection</label>
        <input className="onb-field" id="collection-name" value={name} onChange={(event) => setName(event.target.value)} maxLength={60} placeholder="e.g. Weekend outfits" required />
        <div><button className="onb-btn onb-btn--primary" disabled={busy}>Create collection</button></div>
      </form>
      {collections.length > 0 && <section className="onb-work-section">
        <div className="onb-work-actions" aria-label="Collections">
          {collections.map((group) => <button type="button" className={`onb-btn onb-btn--${selected === group.id ? "primary" : "ghost"}`} key={group.id}
            aria-pressed={selected === group.id} disabled={busy} onClick={() => { setSelected(group.id); setPhoto(""); }}>{group.name}</button>)}
        </div>
        {available.length > 0 ? <form className="onb-work-form onb-collection-create" onSubmit={(event) => { event.preventDefault(); void change(photo, true); }}>
          <label className="onb-label" htmlFor="collection-photo">Add a photo from My looks</label>
          <select className="onb-field" id="collection-photo" value={photo} onChange={(event) => setPhoto(event.target.value)} required>
            <option value="">Choose a photo</option>
            {available.map((look) => <option value={look.entry_key} key={look.entry_key}>{look.snapshot.title}</option>)}
          </select>
          <div><button className="onb-btn onb-btn--ghost" disabled={!photo || busy}>Add to collection</button></div>
        </form> : !looks.length && <p className="onb-help">Create a try-on and save it to start your collection. <Link href="/wardrobe">Open My wardrobe</Link></p>}
        {visible.length > 0 && <div className="onb-work-grid">
          {visible.map((look) => <article className="onb-work-card" key={look.entry_key}>
            <img className="onb-library-img" src={look.snapshot.imageUrl} alt={look.snapshot.title} loading="lazy" />
            <div className="onb-work-card-body">
              <h2 className="onb-aside__title">{look.snapshot.title}</h2>
              <div className="onb-work-actions">
                <ShareLook title={look.snapshot.title} imageUrl={look.snapshot.imageUrl} />
                <button className="onb-btn onb-btn--quiet" type="button" disabled={busy} onClick={() => void change(look.entry_key, false)}>Remove from collection</button>
              </div>
            </div>
          </article>)}
        </div>}
      </section>}
    </>}
    {error && <p className="onb-error" role="alert">{error}</p>}
  </WorkspacePage>;
}
