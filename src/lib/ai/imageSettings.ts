export const NANO_BANANA_MODEL = "fal-ai/nano-banana/edit";

export type ImageEngine = "openai" | "fal" | "mock";

export function imageSettings(env: Readonly<Record<string, string | undefined>> = process.env) {
  const provider = env.IMAGE_PROVIDER?.trim() || "openai";
  const fal = provider === "fal";
  const validProvider = fal || provider === "openai";
  const apiKeyPresent = validProvider && Boolean(
    (fal ? env.FAL_KEY : env.OPENAI_API_KEY)?.trim(),
  );
  const configurationError = !validProvider
    ? "IMAGE_PROVIDER must be openai or fal."
    : env.MOCK_AI !== "1" && !apiKeyPresent
      ? `Set ${fal ? "FAL_KEY" : "OPENAI_API_KEY"} to enable live previews.`
      : null;
  const engine: ImageEngine = env.MOCK_AI === "1" || !apiKeyPresent ? "mock" : fal ? "fal" : "openai";
  return {
    engine,
    provider,
    apiKeyPresent,
    configurationError,
    model: fal ? NANO_BANANA_MODEL : env.OPENAI_IMAGE_MODEL ?? "gpt-image-1",
  };
}
