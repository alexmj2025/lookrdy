"use client";

import { useEffect, useRef, useState } from "react";
import { getPhoto, setClothingMask } from "@/lib/flowStore";

/** A deliberate selection is safer than guessing where a person's face ends. */
export function ClothingMaskEditor({ preview, onReady }: {
  preview: string; onReady: (ready: boolean) => void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const original = useRef<HTMLCanvasElement | null>(null);
  const selection = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const previous = useRef<{ x: number; y: number } | null>(null);
  const [brush, setBrush] = useState(24);
  const [painted, setPainted] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    onReady(false);
    setPainted(false); setSaved(false); setError("");
    const image = new Image();
    image.onload = () => {
      if (cancelled || !canvas.current) return;
      const scale = Math.min(768 / image.naturalWidth, 1152 / image.naturalHeight);
      const source = document.createElement("canvas");
      source.width = 768; source.height = 1152;
      const ctx = source.getContext("2d")!;
      ctx.fillStyle = "#eceae7"; ctx.fillRect(0, 0, source.width, source.height);
      const width = Math.round(image.naturalWidth * scale), height = Math.round(image.naturalHeight * scale);
      ctx.drawImage(image, (source.width - width) / 2, (source.height - height) / 2, width, height);
      original.current = source;
      const mask = document.createElement("canvas");
      mask.width = source.width; mask.height = source.height;
      selection.current = mask;
      canvas.current.width = source.width; canvas.current.height = source.height;
      canvas.current.getContext("2d")!.drawImage(source, 0, 0);
      const savedMask = getPhoto()?.mask;
      if (savedMask) {
        const maskImage = new Image();
        const maskUrl = URL.createObjectURL(savedMask);
        maskImage.onload = () => {
          URL.revokeObjectURL(maskUrl);
          if (cancelled) return;
          const maskContext = mask.getContext("2d")!;
          maskContext.drawImage(maskImage, 0, 0);
          const pixels = maskContext.getImageData(0, 0, mask.width, mask.height);
          for (let i = 0; i < pixels.data.length; i += 4) {
            pixels.data[i] = 50; pixels.data[i + 1] = 165; pixels.data[i + 2] = 255;
            pixels.data[i + 3] = 255 - pixels.data[i + 3];
          }
          maskContext.putImageData(pixels, 0, 0);
          render(); setPainted(true); setSaved(true); onReady(true);
        };
        maskImage.onerror = () => { URL.revokeObjectURL(maskUrl); setError("Please select your clothing areas again."); };
        maskImage.src = maskUrl;
      }
    };
    image.onerror = () => setError("Cannot read this photo. Please use JPG, PNG or WebP.");
    image.src = preview;
    return () => { cancelled = true; };
  }, [preview, onReady]);

  function render() {
    const ctx = canvas.current?.getContext("2d");
    if (!ctx || !original.current || !selection.current) return;
    ctx.clearRect(0, 0, canvas.current!.width, canvas.current!.height);
    ctx.drawImage(original.current, 0, 0);
    ctx.globalAlpha = 0.45;
    ctx.drawImage(selection.current, 0, 0);
    ctx.globalAlpha = 1;
  }

  function paint(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current || !selection.current) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const point = { x: (event.clientX - rect.left) * event.currentTarget.width / rect.width,
      y: (event.clientY - rect.top) * event.currentTarget.height / rect.height };
    const ctx = selection.current.getContext("2d")!;
    ctx.strokeStyle = "#32a5ff"; ctx.lineWidth = brush * event.currentTarget.width / rect.width;
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.beginPath(); ctx.moveTo(previous.current?.x ?? point.x, previous.current?.y ?? point.y);
    ctx.lineTo(point.x + 0.01, point.y + 0.01); ctx.stroke();
    previous.current = point;
    setPainted(true); setSaved(false); onReady(false); render();
  }

  async function save() {
    try {
      if (!original.current || !selection.current || !painted) return;
      const mask = document.createElement("canvas");
      mask.width = original.current.width; mask.height = original.current.height;
      const ctx = mask.getContext("2d")!;
      ctx.fillStyle = "black"; ctx.fillRect(0, 0, mask.width, mask.height);
      ctx.globalCompositeOperation = "destination-out";
      ctx.drawImage(selection.current, 0, 0);
      const blob = (c: HTMLCanvasElement) => new Promise<Blob>((resolve, reject) =>
        c.toBlob((b) => b ? resolve(b) : reject(new Error("Unable to prepare photo")), "image/png"));
      const [photo, maskBlob] = await Promise.all([blob(original.current), blob(mask)]);
      setClothingMask(new File([photo], "photo.png", { type: "image/png" }),
        new File([maskBlob], "clothing-mask.png", { type: "image/png" }));
      setSaved(true); onReady(true);
    } catch { setError("Unable to save your selection. Try again."); }
  }

  return <div className="onb-mask" style={{ marginTop: "1rem" }}>
    <h2 className="onb-aside__title">Select the clothes to change</h2>
    <p className="onb-help">Paint over your top, trousers and shoes. Leave your face, hair, hands and background unpainted. Only the painted area can change. Include a little room around the clothes for the new fit.</p>
    <canvas ref={canvas} aria-label="Paint the clothing areas to replace" role="img"
      style={{ display: "block", width: "100%", maxWidth: 360, height: "auto", touchAction: "none", cursor: "crosshair", borderRadius: 12 }}
      onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); drawing.current = true; previous.current = null; paint(e); }}
      onPointerMove={paint} onPointerUp={() => { drawing.current = false; previous.current = null; }}
      onPointerCancel={() => { drawing.current = false; previous.current = null; }} />
    <label className="onb-label" style={{ marginTop: 12 }}>Brush size
      <input type="range" min="6" max="60" value={brush} onChange={(e) => setBrush(Number(e.target.value))} />
    </label>
    <div className="onb-mask__actions">
      <button type="button" className="onb-btn onb-btn--ghost" onClick={() => {
        const mask = selection.current;
        mask?.getContext("2d")!.clearRect(0, 0, mask.width, mask.height);
        setPainted(false); setSaved(false); onReady(false); render();
      }}>Clear selection</button>
      <button type="button" className="onb-btn onb-btn--primary" disabled={!painted || saved} onClick={() => void save()}>
        {saved ? "Selection saved" : "Use this selection"}
      </button>
    </div>
    {error && <p className="onb-error">{error}</p>}
  </div>;
}
