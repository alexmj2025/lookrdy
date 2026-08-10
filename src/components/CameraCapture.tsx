"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Live camera capture.
 *
 * A file input with `capture` only opens the camera on mobile — on desktop the
 * attribute is ignored and you get a file picker, which is what users were
 * hitting. This uses getUserMedia so "Take a photo" actually opens the camera
 * on both desktop and mobile, with a live preview and a shutter.
 *
 * Requirements and fallbacks:
 * - getUserMedia needs a secure context (https, or localhost in development).
 *   If it's unavailable we say so and fall back to the file picker.
 * - Permission denial, no camera present, and camera-in-use are handled
 *   separately so the message tells the user what to actually do.
 * - The stream is stopped on close, on unmount, and after capture, so the
 *   camera light never stays on.
 */

type Status = "idle" | "starting" | "live" | "error";

export function CameraCapture({
  onCapture,
  onCancel,
}: {
  onCapture: (file: File, dataUrl: string) => void;
  onCancel: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const start = useCallback(
    async (mode: "user" | "environment") => {
      setStatus("starting");
      setError(null);
      stop();

      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus("error");
        setError(
          window.isSecureContext === false
            ? "Your browser only allows camera access over a secure (https) connection. Upload a photo instead."
            : "This browser doesn't support camera capture. Upload a photo instead.",
        );
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: mode,
            width: { ideal: 1280 },
            height: { ideal: 1707 },
          },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        setStatus("live");

        // Offer a front/back toggle only when there's more than one camera.
        const devices = await navigator.mediaDevices.enumerateDevices();
        setHasMultipleCameras(
          devices.filter((d) => d.kind === "videoinput").length > 1,
        );
      } catch (err) {
        setStatus("error");
        const name = err instanceof DOMException ? err.name : "";
        if (name === "NotAllowedError" || name === "SecurityError") {
          setError(
            "Camera access was blocked. Allow it in your browser's address-bar permissions and try again, or upload a photo instead.",
          );
        } else if (name === "NotFoundError" || name === "OverconstrainedError") {
          setError(
            "We couldn't find a camera on this device. Upload a photo instead.",
          );
        } else if (name === "NotReadableError") {
          setError(
            "Your camera is already in use by another app. Close it and try again.",
          );
        } else {
          setError("We couldn't start the camera. Upload a photo instead.");
        }
      }
    },
    [stop],
  );

  useEffect(() => {
    void start(facingMode);
    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        stop();
        onCancel();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel, stop]);

  function flip() {
    const next = facingMode === "user" ? "environment" : "user";
    setFacingMode(next);
    void start(next);
  }

  function shoot() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Un-mirror the front camera so the saved photo matches reality — the
    // preview is mirrored because that's what people expect to see.
    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `lookrdy-photo-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        stop();
        onCapture(file, canvas.toDataURL("image/jpeg", 0.92));
      },
      "image/jpeg",
      0.92,
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Take a photo"
      className="fixed inset-0 z-50 flex flex-col bg-black"
    >
      <div className="flex items-center justify-between px-5 py-4">
        <span className="label" style={{ color: "#bdbbb6" }}>
          {status === "live" ? "Camera ready" : "Camera"}
        </span>
        <button
          type="button"
          onClick={() => {
            stop();
            onCancel();
          }}
          className="min-h-11 px-2 text-sm uppercase tracking-[0.16em] text-white"
        >
          Cancel
        </button>
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
        <video
          ref={videoRef}
          playsInline
          muted
          className={`max-h-full max-w-full object-contain ${
            facingMode === "user" ? "-scale-x-100" : ""
          } ${status === "live" ? "" : "opacity-0"}`}
        />

        {status !== "live" && (
          <div className="absolute inset-0 flex items-center justify-center px-8 text-center">
            {status === "error" ? (
              <p className="max-w-sm text-[0.9375rem] leading-relaxed text-white">
                {error}
              </p>
            ) : (
              <p className="pulsing text-sm uppercase tracking-[0.2em] text-white">
                Starting camera…
              </p>
            )}
          </div>
        )}

        {/* Full-body framing guide */}
        {status === "live" && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
          >
            <div className="h-[86%] w-[46%] max-w-sm border border-white/45" />
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-8 px-5 pb-10 pt-6">
        {status === "live" && hasMultipleCameras ? (
          <button
            type="button"
            onClick={flip}
            className="min-h-11 text-xs uppercase tracking-[0.16em] text-white"
          >
            Flip
          </button>
        ) : (
          <span className="w-12" />
        )}

        {status === "live" ? (
          <button
            type="button"
            onClick={shoot}
            aria-label="Take the photo"
            className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full border-4 border-white"
          >
            <span className="block h-14 w-14 rounded-full bg-white" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => void start(facingMode)}
            className="min-h-12 border border-white px-6 text-xs uppercase tracking-[0.16em] text-white"
          >
            Try again
          </button>
        )}

        <span className="w-12" />
      </div>

      <p
        className="px-8 pb-8 text-center text-[0.8125rem] leading-relaxed"
        style={{ color: "#bdbbb6" }}
      >
        Stand back so your whole body fits inside the frame.
      </p>
    </div>
  );
}
