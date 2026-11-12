"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import "../onboarding.css";
import { CameraCapture } from "@/components/CameraCapture";
import { WorkspacePage } from "@/components/onboarding/WorkspacePage";
import { PhotoUploader } from "@/components/onboarding/PhotoUploader";
import { LookActions } from "@/components/onboarding/LookActions";
import { useAuth } from "@/lib/onboarding/auth";
import { storeLibraryLook } from "@/lib/onboarding/library";
import { clearPhoto, getPhoto, getWardrobeDraft, setPhoto, setWardrobeDraft, type WardrobeExchange } from "@/lib/flowStore";
import { styleWardrobe, wardrobeSlots, type WardrobeItem, type WardrobeSlot } from "@/lib/onboarding/wardrobe";
import { buildWardrobeBoard } from "@/lib/onboarding/wardrobeBoard";
import { changeWardrobeItem, readWardrobe, saveWardrobe } from "@/lib/onboarding/workspaceLibrary";
import { wardrobePhoto } from "@/lib/onboarding/wardrobePhoto";

const LIMIT = 60;
const imageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export default function WardrobePage() {
  const { user, loading } = useAuth();
  const [portrait, setPortrait] = useState<string | null>(null);
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [slot, setSlot] = useState<WardrobeSlot>("top");
  const [name, setName] = useState("");
  const [brief, setBrief] = useState("");
  const [thread, setThread] = useState<WardrobeExchange[]>([]);
  const [camera, setCamera] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [needsAccount, setNeedsAccount] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [previewing, setPreviewing] = useState("");
  const [previewError, setPreviewError] = useState<{ key: string; message: string } | null>(null);
  const [editing, setEditing] = useState<WardrobeItem | null>(null);
  const owner = useRef<string | undefined>(undefined);
  const garmentInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let mounted = true;
    setPortrait(getPhoto()?.preview ?? null);
    void getWardrobeDraft().then((draft) => { if (mounted) setThread(draft); });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (loading) return;
    let active = true;
    const previousOwner = owner.current;
    owner.current = user?.id;
    if (previousOwner && previousOwner !== user?.id) { setItems([]); setThread([]); setPortrait(null); }
    if (!user) { setLoadingItems(false); return; }
    setLoadingItems(true);
    void readWardrobe().then((saved) => {
      if (active) setItems((current) => [...saved, ...current.filter((item) => !saved.some(({ id }) => id === item.id))].slice(0, LIMIT));
    }).catch((err: Error) => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoadingItems(false); });
    return () => { active = false; };
  }, [loading, user?.id]);

  async function add(files: File[]) {
    if (busy || loading || loadingItems || !files.length || items.length >= LIMIT) return;
    const selected = files.slice(0, LIMIT - items.length);
    if (selected.some((file) => (!imageTypes.has(file.type) && !/\.(jpe?g|png|webp)$/i.test(file.name)) || file.size > 10 * 1024 * 1024)) {
      setError("Choose JPG, PNG or WebP clothing photos under 10 MB each.");
      return;
    }
    setBusy(true);
    setError("");
    const accountId = user?.id;
    try {
      const label = wardrobeSlots.find(([value]) => value === slot)?.[1] ?? "Clothing";
      const start = items.filter((item) => item.slot === slot).length + 1;
      const added: WardrobeItem[] = [];
      for (const [index, file] of selected.entries()) {
        const url = URL.createObjectURL(file);
        try {
          const photo = await wardrobePhoto(url);
          added.push({ id: crypto.randomUUID(), name: (selected.length === 1 ? name.trim() : "") || `${label} ${start + index}`, slot, ...photo });
        } finally {
          URL.revokeObjectURL(url);
        }
      }
      if (owner.current !== accountId) return;
      if (accountId) await saveWardrobe(added);
      if (owner.current === accountId) setItems((previous) => [...previous, ...added]);
      setName("");
    } catch (err) { setError(err instanceof Error ? err.message : "The photos couldn’t be added."); }
    finally { setBusy(false); }
  }

  async function updateItem(item: WardrobeItem, remove = false) {
    if (busy) return;
    setBusy(true); setError("");
    try {
      if (user) await changeWardrobeItem(item.id, remove ? undefined : { name: item.name.trim(), slot: item.slot });
      setItems((current) => remove ? current.filter(({ id }) => id !== item.id) : current.map((value) => value.id === item.id ? { ...item, name: item.name.trim() } : value));
      setEditing(null);
    } catch (err) { setError(err instanceof Error ? err.message : "The item couldn’t be updated."); }
    finally { setBusy(false); }
  }

  async function ask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || previewing || !brief.trim()) return;
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const renderFirst = submitter?.value === "try-on" && Boolean(user && portrait);
    const picks = styleWardrobe(items, brief);
    if (!picks.length) {
      setError("Add a top and a bottom, or a dress or jumpsuit. If you excluded an item, try another option.");
      return;
    }
    setBusy(true); setError(""); setNeedsAccount(false);
    try {
      const boards = await Promise.all(picks.map(async (pick) => ({
        key: `wardrobe:${crypto.randomUUID()}`,
        garmentIds: pick.items.map((item) => item.id),
        snapshot: { title: pick.title, description: pick.description, imageUrl: await buildWardrobeBoard(portrait, pick), items: pick.items.map((item) => ({ name: item.name })) },
      })));
      const response = await fetch("/api/wardrobe-trial", { method: "POST" });
      if (response.status === 403) { setNeedsAccount(true); return; }
      if (!response.ok) throw new Error("Couldn’t start this outfit. Please try again.");
      const updated = [...thread, { prompt: brief.trim(), boards }].slice(-4);
      setThread(updated);
      setBrief("");
      void setWardrobeDraft(updated);
      if (user) {
        const writes = await Promise.allSettled(boards.map((board) => storeLibraryLook(board.key, "wardrobe", board.snapshot)));
        if (writes.some((write) => write.status === "rejected")) setError("Your outfit boards are ready here, but some couldn’t be added to account history.");
        if (renderFirst) await tryOn(updated[updated.length - 1], boards[0], updated);
      } else setNeedsAccount(true);
    } catch (err) { setError(err instanceof Error ? err.message : "Couldn’t build an outfit from those photos."); }
    finally { setBusy(false); }
  }

  async function tryOn(exchange: WardrobeExchange, board: WardrobeExchange["boards"][number], history = thread) {
    if (previewing || !portrait || !user) return;
    const chosen = board.garmentIds?.map((id) => items.find((item) => item.id === id));
    if (!chosen?.length || chosen.some((item) => !item)) {
      setPreviewError({ key: board.key, message: "Some clothes are missing. Ask for a new outfit using your current wardrobe." });
      return;
    }
    setPreviewing(board.key); setPreviewError(null);
    const accountId = user.id;
    try {
      const form = new FormData();
      const portraitImage = await wardrobePhoto(portrait, 1200);
      form.set("portrait", await (await fetch(portraitImage.image)).blob(), "portrait.jpg");
      form.set("brief", exchange.prompt);
      for (const item of chosen) {
        if (!item) continue;
        form.append("label", item.name);
        form.append("garment", await (await fetch(item.image)).blob(), "garment.jpg");
      }
      if (owner.current !== accountId) return;
      const response = await fetch("/api/wardrobe-preview", { method: "POST", body: form });
      const result = await response.json() as { imageUrl?: string; message?: string };
      if (!response.ok || !result.imageUrl) throw new Error(result.message ?? "The try-on didn’t finish. Please try again.");
      if (owner.current !== accountId) return;
      const snapshot = { ...board.snapshot, imageUrl: result.imageUrl };
      const updated = history.map((entry) => ({ ...entry, boards: entry.boards.map((look) =>
        look.key === board.key ? { ...look, snapshot, rendered: true } : look) }));
      setThread(updated);
      void setWardrobeDraft(updated);
      try { await storeLibraryLook(board.key, "wardrobe", snapshot); }
      catch { setPreviewError({ key: board.key, message: "Your preview is ready. Use Save look to retry saving it." }); }
    } catch (err) {
      if (owner.current === accountId) setPreviewError({ key: board.key, message: err instanceof Error ? err.message : "The try-on didn’t finish." });
    } finally { setPreviewing(""); }
  }

  return <WorkspacePage>
    <p className="onb-eyebrow">Style what you already own</p>
    <h1 className="onb-h1">My wardrobe</h1>
    <p className="onb-lede">Build outfits from your own clothes, compare colors, and see a suggested look on your photo.</p>
    <div className="onb-wardrobe-grid">
      <section className="onb-aside">
        <h2 className="onb-aside__title">Your full-body photo</h2>
        <PhotoUploader preview={portrait} onSelect={(file, url) => { setPhoto(file, url); setPortrait(url); }}
          onRemove={() => { clearPhoto(); setPortrait(null); }} />
      </section>
      <section className="onb-aside">
        <h2 className="onb-aside__title">Clothes you own</h2>
        <p className="onb-help">Use one garment per photo. You can upload multiple pieces of the selected type and edit their labels afterward.</p>
        <div className="onb-work-form">
          <div><label htmlFor="wardrobe-slot" className="onb-label">Clothing type</label>
            <select id="wardrobe-slot" className="onb-field" value={slot} onChange={(e) => setSlot(e.target.value as WardrobeSlot)}>
              {wardrobeSlots.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
            </select></div>
          <div><label htmlFor="wardrobe-name" className="onb-label">Name or colour (optional)</label>
            <input id="wardrobe-name" className="onb-field" value={name} maxLength={60} onChange={(e) => setName(e.target.value)} placeholder="e.g. Blue straight-leg jeans" /></div>
          <div className="onb-work-actions">
            <button className="onb-btn onb-btn--ghost" type="button" disabled={items.length >= LIMIT || busy || loading || loadingItems}
              onClick={() => garmentInput.current?.click()}>Upload clothing photos</button>
            <input ref={garmentInput} id="wardrobe-upload" className="onb-sr" type="file" accept="image/jpeg,image/png,image/webp" multiple
              aria-label="Upload clothing photos" disabled={items.length >= LIMIT || busy || loading || loadingItems}
              onChange={(e) => { void add(Array.from(e.currentTarget.files ?? [])); e.currentTarget.value = ""; }} />
            <button className="onb-btn onb-btn--ghost" type="button" disabled={items.length >= LIMIT || busy || loading || loadingItems} onClick={() => setCamera(true)}>Take clothing photo</button>
          </div>
        </div>
        <ul className="onb-wardrobe-items">
          {items.map((item) => <li key={item.id}><img src={item.image} alt="" /><span>{item.name}</span>
            <button className="onb-mini" type="button" aria-label={`Edit ${item.name}`} disabled={busy}
              onClick={() => setEditing(item)}>Edit</button>
            <button className="onb-mini" type="button" aria-label={`Remove ${item.name}`} disabled={busy || !!previewing}
              onClick={() => void updateItem(item, true)}>Remove</button>
          </li>)}
        </ul>
        {editing && <form className="onb-work-form" onSubmit={(event) => { event.preventDefault(); if (editing.name.trim()) void updateItem(editing); }}>
          <label htmlFor="edit-garment-name" className="onb-label">Edit garment name</label>
          <input id="edit-garment-name" className="onb-field" value={editing.name} required maxLength={60}
            onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
          <label htmlFor="edit-garment-slot" className="onb-label">Clothing type</label>
          <select id="edit-garment-slot" className="onb-field" value={editing.slot} onChange={(e) => setEditing({ ...editing, slot: e.target.value as WardrobeSlot })}>
            {wardrobeSlots.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
          </select>
          <div className="onb-work-actions"><button className="onb-btn onb-btn--primary" disabled={busy}>Save item</button>
            <button className="onb-btn onb-btn--ghost" type="button" onClick={() => setEditing(null)}>Cancel</button></div>
        </form>}
        {loadingItems && <p role="status">Loading your clothes…</p>}
        <p className="onb-help">{items.length} / {LIMIT} pieces. Add a top and a bottom, or a dress or jumpsuit.</p>
      </section>
    </div>
    <section className="onb-work-section">
      <h2 className="onb-aside__title">Ask your stylist</h2>
      <div className="onb-work-actions">
        <button className="onb-btn onb-btn--ghost" type="button" onClick={() => setBrief("Put together a polished dinner outfit from my wardrobe.")}>Style me for dinner</button>
        <button className="onb-btn onb-btn--ghost" type="button" onClick={() => setBrief("Which colors from my wardrobe work together? Suggest a matching outfit and palette.")}>Find matching colors</button>
      </div>
      <form className="onb-work-form" onSubmit={ask}>
        <label className="onb-label" htmlFor="wardrobe-brief">What are you dressing for?</label>
        <textarea id="wardrobe-brief" className="onb-field" value={brief} onChange={(e) => setBrief(e.target.value)} maxLength={300}
          placeholder="Put together a polished dinner outfit with what I have." required />
        <div className="onb-work-actions">
          <button className={`onb-btn onb-btn--${user && portrait ? "ghost" : "primary"}`} type="submit" value="ideas" disabled={busy || !!previewing || !brief.trim()}>
            {busy && !previewing ? "Styling your wardrobe…" : "Get outfit ideas"}
          </button>
          {user && portrait && <button className="onb-btn onb-btn--primary" type="submit" value="try-on" disabled={busy || !!previewing || !brief.trim()}>
            {previewing ? "Creating your try-on…" : "Generate try-on"}
          </button>}
        </div>
      </form>
      {error && <p className="onb-error" role="alert">{error}</p>}
      {needsAccount && !user && <div className="onb-work-actions">
        <p>Your first try is complete. Sign in to keep styling and save your outfits.</p>
        <Link className="onb-btn onb-btn--primary" href="/account?next=/wardrobe">Create account or sign in</Link>
      </div>}
      {thread.map((exchange, index) => <div className="onb-work-section" key={exchange.boards[0]?.key ?? index}>
        <p className="onb-chat-message"><strong>You:</strong> {exchange.prompt}</p>
        <h3 className="onb-aside__title">Lookrdy’s outfit ideas</h3>
        <div className="onb-work-grid">{exchange.boards.map((board) => <article className="onb-work-card" key={board.key}>
          <img className="onb-library-img" src={board.snapshot.imageUrl} alt={board.snapshot.title} />
          <div className="onb-work-card-body">
            <h4 className="onb-aside__title">{board.snapshot.title}</h4>
            <p className="onb-help">{board.snapshot.description}</p>
            <div className="onb-palette" aria-label="Approximate outfit colors">
              {board.garmentIds?.map((id) => items.find((item) => item.id === id)).map((item) => item?.swatch && (
                <span key={item.id} title={item.name} aria-label={item.name} style={{ backgroundColor: item.swatch }} />
              ))}
            </div>
            {board.rendered ? <p className="onb-help">AI try-on. Fit, facial details, and colors may vary.</p> : <>
              <p className="onb-help">Outfit board</p>
              {board.garmentIds && (user ? <button type="button" className="onb-btn onb-btn--ghost" disabled={busy || !!previewing || !portrait}
                onClick={() => void tryOn(exchange, board)}>{previewing === board.key ? "Creating your try-on…" : "Try on this outfit"}</button>
                : <Link className="onb-btn onb-btn--ghost" href="/account?next=/wardrobe">Sign in to try on</Link>)}
            </>}
            {previewError?.key === board.key && <p className="onb-error" role="alert">{previewError.message}</p>}
            <LookActions key={board.rendered ? "preview" : "board"} entryKey={board.key} source="wardrobe" snapshot={board.snapshot} returnTo="/wardrobe" />
          </div>
        </article>)}</div>
      </div>)}
    </section>
    {camera && <CameraCapture onCapture={(file) => { setCamera(false); void add([file]); }} onCancel={() => setCamera(false)} />}
  </WorkspacePage>;
}
