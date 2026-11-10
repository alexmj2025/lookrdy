"use client";

import { useState } from "react";
import { isLookPhoto } from "@/lib/onboarding/library";

export function ShareLook({ imageUrl, title }: { imageUrl?: string; title: string }) {
  const [message, setMessage] = useState("");
  if (!isLookPhoto(imageUrl)) return null;
  const source = imageUrl;
  async function share() {
    try {
      const [header, content] = source.split(",");
      const mime = header.slice(5, header.indexOf(";"));
      const ext = mime === "image/jpeg" ? "jpg" : mime.slice(6);
      const file = new File([Uint8Array.from(atob(content), (char) => char.charCodeAt(0))], `lookrdy-outfit.${ext}`, { type: mime });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title });
      } else {
        const anchor = document.createElement("a");
        anchor.href = source;
        anchor.download = file.name;
        anchor.click();
        setMessage("Image downloaded. You can upload it to your social app.");
      }
    } catch (error) {
      if (!(error instanceof Error) || error.name !== "AbortError") setMessage("Couldn’t share this image. Please try again.");
    }
  }
  return <div>
    <button type="button" className="onb-btn onb-btn--ghost" onClick={() => void share()}>Share photo</button>
    {message && <p className="onb-help" role="status">{message}</p>}
  </div>;
}
