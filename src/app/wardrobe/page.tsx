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

const LIMIT = 12;
const imageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export default function WardrobePage() {
  const { user } = useAuth();
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
  const URLs = useRef(new Set<string>());

  useEffect(() => {
    let mounted = true;
    setPortrait(getPhoto()?.preview ?? null);
    void getWardrobeDraft().then((draft) => { if (mounted) setThread(draft); });
    const urls = URLs.current;
    return () => { mounted = false; urls.forEach((url) => URL.revokeObjectURL(url)); };
  }, []);

  function add(file?: File) {
    if (!file || items.length >= LIMIT) return;
    if ((!imageTypes.has(file.type) && !/\.(jpe?g|png|webp)$/i.test(file.name)) || file.size > 10 * 1024 * 1024) {
      setError("Choose a JPG, PNG or WebP clothing photo under 10 MB.");
      return;
    }
    const image = URL.createObjectURL(file);
    URLs.current.add(image);
    const label = wardrobeSlots.find(([value]) => value === slot)?.[1] ?? "Clothing";
    setItems((previous) => [...previous, { id: crypto.randomUUID(), name: name.trim() || `${label} ${previous.filter((item) => item.slot === slot).length + 1}`, slot, image }]);
    setName(""); setError("");
  }

  async function ask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!portrait || busy || !brief.trim()) return;
    const picks = styleWardrobe(items, brief);
    if (!picks.length) {
      setError("Add a top and a bottom, or a dress or jumpsuit. If you excluded an item, try another option.");
      return;
    }
    setBusy(true); setError(""); setNeedsAccount(false);
    try {
      const boards = await Promise.all(picks.map(async (pick) => ({
        key: `wardrobe:${crypto.randomUUID()}`,
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
      } else setNeedsAccount(true);
    } catch (err) { setError(err instanceof Error ? err.message : "Couldn’t build an outfit from those photos."); }
    finally { setBusy(false); }
  }

  return <WorkspacePage>
    <p className="onb-eyebrow">Style what you already own</p>
    <h1 className="onb-h1">My wardrobe</h1>
    <p className="onb-lede">Add a full-body photo and the clothes you want to work with. Ask for an outfit, then see your original photo alongside the suggested pieces.</p>
    <div className="onb-wardrobe-grid">
      <section className="onb-aside">
        <h2 className="onb-aside__title">1. Add your photo</h2>
        <PhotoUploader preview={portrait} onSelect={(file, url) => { setPhoto(file, url); setPortrait(url); }}
          onRemove={() => { clearPhoto(); setPortrait(null); }} />
      </section>
      <section className="onb-aside">
        <h2 className="onb-aside__title">2. Add clothes from home</h2>
        <p className="onb-help">Take a clear photo of one piece at a time. Label each item so your stylist can use it.</p>
        <div className="onb-work-form">
          <div><label htmlFor="wardrobe-slot" className="onb-label">Clothing type</label>
            <select id="wardrobe-slot" className="onb-field" value={slot} onChange={(e) => setSlot(e.target.value as WardrobeSlot)}>
              {wardrobeSlots.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
            </select></div>
          <div><label htmlFor="wardrobe-name" className="onb-label">Name or colour (optional)</label>
            <input id="wardrobe-name" className="onb-field" value={name} maxLength={60} onChange={(e) => setName(e.target.value)} placeholder="e.g. Blue straight-leg jeans" /></div>
          <div className="onb-work-actions">
            <label className="onb-btn onb-btn--ghost" htmlFor="wardrobe-upload">Upload clothing photo</label>
            <input id="wardrobe-upload" className="onb-sr" type="file" accept="image/jpeg,image/png,image/webp" disabled={items.length >= LIMIT || busy}
              onChange={(e) => { add(e.currentTarget.files?.[0]); e.currentTarget.value = ""; }} />
            <button className="onb-btn onb-btn--ghost" type="button" disabled={items.length >= LIMIT || busy} onClick={() => setCamera(true)}>Take clothing photo</button>
          </div>
        </div>
        <ul className="onb-wardrobe-items">
          {items.map((item) => <li key={item.id}><img src={item.image} alt="" /><span>{item.name}</span>
            <button className="onb-mini" type="button" aria-label={`Remove ${item.name}`} disabled={busy}
              onClick={() => { URL.revokeObjectURL(item.image); URLs.current.delete(item.image); setItems((all) => all.filter((value) => value.id !== item.id)); }}>Remove</button>
          </li>)}
        </ul>
        <p className="onb-help">{items.length} / {LIMIT} pieces. Add a top and a bottom, or a dress or jumpsuit.</p>
      </section>
    </div>
    <section className="onb-work-section">
      <h2 className="onb-aside__title">3. Ask for an outfit</h2>
      <p className="onb-help">Suggestions use your labeled pieces. Your face and body stay unchanged in the original photo. Signed-in outfit boards go to your private history.</p>
      <form className="onb-work-form" onSubmit={ask}>
        <label className="onb-label" htmlFor="wardrobe-brief">What are you dressing for?</label>
        <textarea id="wardrobe-brief" className="onb-field" value={brief} onChange={(e) => setBrief(e.target.value)} maxLength={300}
          placeholder="Put together a polished dinner outfit with what I have." required />
        <div><button className="onb-btn onb-btn--primary" type="submit" disabled={!portrait || busy || !brief.trim()}>
          {busy ? "Styling your wardrobe…" : "Ask Lookrdy"}
        </button></div>
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
            <LookActions entryKey={board.key} source="wardrobe" snapshot={board.snapshot} returnTo="/wardrobe" />
          </div>
        </article>)}</div>
      </div>)}
    </section>
    {camera && <CameraCapture onCapture={(file) => { setCamera(false); add(file); }} onCancel={() => setCamera(false)} />}
  </WorkspacePage>;
}
