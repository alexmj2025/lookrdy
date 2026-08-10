"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/Wordmark";
import { getPhoto, getRequest, setResult } from "@/lib/flowStore";
import type { GenerationResult } from "@/lib/types";

const STEPS = [
  "Finding real products",
  "Composing your looks",
  "Generating your visualization",
] as const;

export default function GeneratingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [failure, setFailure] = useState<{ title: string; message: string } | null>(
    null,
  );
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const request = getRequest();
    if (!request) {
      router.replace("/request");
      return;
    }

    // Advance the visible steps on a timer. The pipeline runs server-side in
    // one request; these markers reflect its real stages in order.
    const timers = [
      setTimeout(() => setStep(1), 2200),
      setTimeout(() => setStep(2), 6000),
    ];

    const form = new FormData();
    form.set("occasion", request.occasion);
    form.set("desiredLook", request.desiredLook);
    form.set("budget", String(request.budget));
    form.set("currency", request.currency);
    form.set("location", request.location);
    form.set("exclusions", request.exclusions);

    const photo = getPhoto();
    if (photo) form.set("photo", photo.file, photo.file.name || "photo.jpg");

    (async () => {
      try {
        const res = await fetch("/api/generate", { method: "POST", body: form });
        const data = await res.json();
        timers.forEach(clearTimeout);

        if ("error" in data) {
          const titles: Record<string, string> = {
            insufficient_catalog: "We couldn't fill this one",
            limit_reached: "That's all three free looks",
            invalid_request: "Something's missing",
            engine_failure: "That didn't work",
          };
          setFailure({
            title: titles[data.error] ?? "That didn't work",
            message: data.message,
          });
          return;
        }

        setResult(data as GenerationResult);
        router.replace("/results");
      } catch {
        timers.forEach(clearTimeout);
        setFailure({
          title: "That didn't work",
          message:
            "We lost the connection while building your looks. Please try again.",
        });
      }
    })();

    return () => timers.forEach(clearTimeout);
  }, [router]);

  if (failure) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto flex min-h-[70vh] max-w-2xl flex-col justify-center px-5 py-16 md:px-10">
          <p className="label">Lookrdy</p>
          <h1 className="display mt-3 text-3xl md:text-4xl">{failure.title}</h1>
          <p className="prose-measure mt-5 text-lg leading-relaxed text-[var(--color-muted)]">
            {failure.message}
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href="/request" className="btn w-full sm:w-auto">
              Adjust my brief
            </Link>
            <Link href="/" className="btn-outline w-full sm:w-auto">
              Start over
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex min-h-[70vh] max-w-2xl flex-col justify-center px-5 py-16 md:px-10">
        <p className="label">Step 3 of 3</p>
        <h1 className="display mt-3 text-4xl md:text-5xl">
          Building your looks.
        </h1>

        <ol className="mt-12 space-y-6">
          {STEPS.map((label, i) => {
            const state = i < step ? "done" : i === step ? "active" : "waiting";
            return (
              <li key={label} className="flex items-center gap-4">
                <span
                  aria-hidden="true"
                  className={`flex h-7 w-7 shrink-0 items-center justify-center border text-xs ${
                    state === "done"
                      ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-white"
                      : state === "active"
                        ? "border-[var(--color-ink)]"
                        : "hairline text-[var(--color-muted)]"
                  }`}
                >
                  {state === "done" ? "✓" : i + 1}
                </span>
                <span
                  className={`text-lg ${
                    state === "waiting"
                      ? "text-[var(--color-muted)]"
                      : state === "active"
                        ? "pulsing"
                        : ""
                  }`}
                >
                  {label}
                </span>
              </li>
            );
          })}
        </ol>

        <p className="mt-12 text-sm text-[var(--color-muted)]">
          We search real products first, compose the outfits from what we
          actually found, and only then generate the image. This usually takes
          under a minute.
        </p>
      </main>
    </>
  );
}
