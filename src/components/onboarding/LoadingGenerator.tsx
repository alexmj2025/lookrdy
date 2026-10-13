"use client";

export function LoadingGenerator({ done }: { done: boolean }) {
  return <div className="onb-gen" role="status" aria-live="polite"><div>
    <h1 className="onb-h1">{done ? "Your outfits are ready" : "Finding your Simons outfits"}</h1>
    <p className="onb-lede">Your product lists will appear first. Preview images will follow as they finish.</p>
    <p className="onb-help">Keep this tab open while the previews generate.</p>
  </div></div>;
}
