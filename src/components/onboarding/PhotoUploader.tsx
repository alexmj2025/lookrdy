"use client";

import { useCallback, useRef, useState } from "react";
import { CameraCapture } from "@/components/CameraCapture";
import { Camera, Lock, Upload } from "./icons";

const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/heic", "image/heif", "image/webp"];

export function PhotoUploader({
  preview,
  onSelect,
  onRemove,
}: {
  preview: string | null;
  onSelect: (file: File, preview: string) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);

  const accept = useCallback(
    (file: File | undefined) => {
      if (!file) return;

      // HEIC from iOS sometimes arrives with an empty type, so fall back to
      // the extension rather than rejecting a valid photo.
      const looksImage =
        ACCEPTED.includes(file.type) ||
        /\.(jpe?g|png|heic|heif|webp)$/i.test(file.name);

      if (!looksImage) {
        setError("That file type isn't supported. Use a JPG, PNG or HEIC.");
        return;
      }
      if (file.size > MAX_BYTES) {
        setError("That photo is over 10MB. Try a smaller one.");
        return;
      }

      setError(null);
      onSelect(file, URL.createObjectURL(file));
    },
    [onSelect],
  );

  if (preview) {
    return (
      <div>
        <div className="onb-preview">
          {/* Object URL of a local file — next/image would gain nothing and
              cannot optimise a blob: source. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="The photo you selected" />
          <div className="onb-preview__actions">
            <button
              type="button"
              className="onb-btn onb-btn--ghost"
              onClick={() => inputRef.current?.click()}
            >
              Replace
            </button>
            <button
              type="button"
              className="onb-btn onb-btn--ghost"
              onClick={() => setCameraOpen(true)}
            >
              <Camera size={15} /> Retake
            </button>
            <button type="button" className="onb-btn onb-btn--quiet" onClick={onRemove}>
              Remove
            </button>
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="onb-sr"
          onChange={(e) => accept(e.target.files?.[0])}
        />

        <p className="onb-privacy">
          <Lock />
          <span>Your photo stays private and can be deleted anytime.</span>
        </p>

        {cameraOpen && (
          <CameraCapture
            onCapture={(file, dataUrl) => {
              setCameraOpen(false);
              onSelect(file, dataUrl);
            }}
            onCancel={() => setCameraOpen(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div>
      <div
        className="onb-drop"
        data-dragging={dragging}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          accept(e.dataTransfer.files?.[0]);
        }}
      >
        <span className="onb-drop__icon">
          <Upload />
        </span>
        <p style={{ margin: 0, fontSize: "0.9375rem" }}>Drop your photo here</p>
        <p className="onb-drop__hint">or</p>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "center" }}>
          <button
            type="button"
            className="onb-btn onb-btn--primary"
            onClick={() => inputRef.current?.click()}
          >
            Choose photo
          </button>
          <button
            type="button"
            className="onb-btn onb-btn--ghost"
            onClick={() => setCameraOpen(true)}
          >
            <Camera size={15} /> Take a photo
          </button>
        </div>
        <p className="onb-drop__hint">JPG, PNG or HEIC · max 10MB</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="onb-sr"
        onChange={(e) => accept(e.target.files?.[0])}
      />

      {error && <p className="onb-error">{error}</p>}

      <p className="onb-privacy">
        <Lock />
        <span>Your photo stays private and can be deleted anytime.</span>
      </p>

      {cameraOpen && (
        <CameraCapture
          onCapture={(file, dataUrl) => {
            setCameraOpen(false);
            onSelect(file, dataUrl);
          }}
          onCancel={() => setCameraOpen(false)}
        />
      )}
    </div>
  );
}
