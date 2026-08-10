"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/Wordmark";
import { CameraCapture } from "@/components/CameraCapture";
import { Checkbox } from "@/components/ui/checkbox";
import { track } from "@/lib/analytics/client";
import { clearPhoto, getPhoto, setPhoto } from "@/lib/flowStore";

export default function PhotoPage() {
  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(
    () => getPhoto()?.preview ?? null,
  );
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const uploadRef = useRef<HTMLInputElement>(null);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    if (!file.type.startsWith("image/")) {
      setError("That file isn't an image. Please choose a photo.");
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      setError("That photo is over 12 MB. Please choose a smaller one.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      setPreview(dataUrl);
      setPhoto(file, dataUrl);
      track("photo_uploaded", { bytes: file.size, source: "upload" });
    };
    reader.readAsDataURL(file);
  }

  function onCameraCapture(file: File, dataUrl: string) {
    setPreview(dataUrl);
    setPhoto(file, dataUrl);
    setCameraOpen(false);
    setError(null);
    track("photo_uploaded", { bytes: file.size, source: "camera" });
  }

  function remove() {
    clearPhoto();
    setPreview(null);
    if (uploadRef.current) uploadRef.current.value = "";
  }

  function proceed() {
    if (!consent) {
      setError("Please confirm you're happy for us to use your photo.");
      return;
    }
    router.push("/request");
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 pb-24 pt-10 md:px-10 md:pt-16">
        <p className="label">Step 1 of 3</p>
        <h1 className="display mt-3 text-4xl md:text-5xl">Add your photo.</h1>
        <p className="lede mt-5">
          A full-body photo gives the best result — standing, facing the camera,
          in good light, with your whole body from head to feet in frame.
        </p>

        {/* Example guidance */}
        <div className="mt-8 flex gap-5 border hairline p-5">
          <svg
            viewBox="0 0 80 140"
            className="h-32 w-auto shrink-0"
            aria-hidden="true"
          >
            <rect width="80" height="140" fill="#f4f3f1" />
            <g stroke="#0a0a0a" fill="none" strokeWidth="1.2">
              <circle cx="40" cy="24" r="9" />
              <path d="M40 33 L40 40" />
              <path d="M28 42 Q40 48 52 42 L58 46 L61 74 L54 76 L54 108 L26 108 L26 76 L19 74 L22 46 Z" />
              <path d="M27 108 L28 128 L34 128 L36 112 L44 112 L46 128 L52 128 L53 108" />
            </g>
          </svg>
          <div>
            <p className="label-ink">A good photo</p>
            <ul className="mt-3 space-y-1.5 text-[0.9375rem] leading-relaxed text-[var(--color-meta)]">
              <li>Whole body visible, head to shoes</li>
              <li>Standing straight, facing the camera</li>
              <li>Plain background, even lighting</li>
              <li>One person in frame</li>
            </ul>
          </div>
        </div>

        {/* Capture controls */}
        {preview ? (
          <div className="mt-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Your photo, ready to use"
              className="max-h-[26rem] w-auto border hairline object-contain"
            />
            <button type="button" onClick={remove} className="btn-text mt-4">
              Remove photo
            </button>
          </div>
        ) : (
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              className="btn-outline"
              onClick={() => uploadRef.current?.click()}
            >
              Upload a photo
            </button>
            <button
              type="button"
              className="btn-outline"
              onClick={() => setCameraOpen(true)}
            >
              Take a photo
            </button>
          </div>
        )}

        <input
          ref={uploadRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFile}
        />

        {cameraOpen && (
          <CameraCapture
            onCapture={onCameraCapture}
            onCancel={() => setCameraOpen(false)}
          />
        )}

        {/* Storage + consent */}
        <div className="mt-10 border-t hairline pt-8">
          <p className="label-ink">How your photo is handled</p>
          <p className="prose-measure mt-3 text-[0.9375rem] leading-relaxed text-[var(--color-meta)]">
            Your photo stays in this browser tab. It&rsquo;s sent to our server
            once, used only to generate your visualization, and is never saved
            to a database, written to disk, or shared. Remove it at any time
            with the button above, or close this tab and it&rsquo;s gone.
          </p>

          <label
            htmlFor="photo-consent"
            className="mt-6 flex cursor-pointer items-start gap-3"
          >
            <Checkbox
              id="photo-consent"
              checked={consent}
              onCheckedChange={(value) => {
                const next = value === true;
                setConsent(next);
                if (next) setError(null);
              }}
              className="mt-1 shrink-0 rounded-none border-[var(--color-ink)] data-[state=checked]:bg-[var(--color-ink)] data-[state=checked]:text-white"
            />
            <span className="text-[0.9375rem] leading-relaxed">
              I&rsquo;m happy for Lookrdy to use this photo to generate my
              outfit visualizations.
            </span>
          </label>
        </div>

        {error && (
          <p className="mt-6 border-l-2 border-[var(--color-ink)] pl-4 text-[0.9375rem]">
            {error}
          </p>
        )}

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
          <button
            type="button"
            className="btn w-full sm:w-auto"
            onClick={proceed}
            disabled={!consent}
          >
            Continue
          </button>
          <button
            type="button"
            className="btn-text"
            onClick={() => {
              clearPhoto();
              router.push("/request");
            }}
          >
            Skip — no photo
          </button>
        </div>
        <p className="mt-3 text-sm text-[var(--color-meta)]">
          Without a photo you still get all three outfits; the visualization
          uses a neutral figure instead of you.
        </p>
      </main>
    </>
  );
}
