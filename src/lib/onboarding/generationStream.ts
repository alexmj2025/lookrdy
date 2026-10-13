"use client";

import { setResult } from "@/lib/flowStore";
import type { GenerationResult, Look } from "@/lib/types";

type Event = { type: "result"; result: GenerationResult } | { type: "look"; look: Look }
  | { type: "done" } | { type: "error"; message: string };
let activeRun = 0;

/** Keep consuming after navigation so each preview updates the open results page. */
export async function consumeGeneration(response: Response, onResult: (result: GenerationResult) => void) {
  const run = ++activeRun;
  const reader = response.body?.getReader();
  if (!reader) throw new Error("No generation response");
  const decoder = new TextDecoder();
  let buffer = "";
  let result: GenerationResult | null = null;
  let finished = false;
  try {
    while (true) {
      const { value, done } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.trim()) continue;
        if (run !== activeRun) continue;
        const event = JSON.parse(line) as Event;
        if (event.type === "result") {
          result = event.result;
          await setResult(result);
          onResult(result);
        } else if (event.type === "look" && result) {
          const current: GenerationResult = result;
          result = { ...current, looks: current.looks.map((look: Look) => look.id === event.look.id ? event.look : look) };
          await setResult(result);
        } else if (event.type === "done") finished = true;
        else if (event.type === "error") throw new Error(event.message);
      }
      if (done) break;
    }
    if (!result || !finished) throw new Error("Generation connection ended early");
  } catch (error) {
    if (run !== activeRun) return;
    if (!result) throw error;
    await setResult({ ...result, looks: result.looks.map((look) => look.previewStatus === "pending"
      ? { ...look, previewStatus: "unavailable", previewNotice: "Preview connection interrupted. Your product list is still available." } : look) });
  } finally { reader.releaseLock(); }
}
