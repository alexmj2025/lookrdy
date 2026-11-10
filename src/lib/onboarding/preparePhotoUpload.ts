/** Keep large phone photos below the server's upload size without cropping. */
export async function preparePhotoUpload(file: File, preview: string): Promise<File> {
  if (file.size <= 3 * 1024 * 1024) return file;

  const image = new Image();
  image.src = preview;
  await image.decode();
  const scale = Math.min(1, 1600 / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const context = canvas.getContext("2d", { alpha: false });
  if (!context) throw new Error("Could not prepare photo.");
  context.fillStyle = "#eceae7";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
  if (!blob || blob.size > 3 * 1024 * 1024) throw new Error("Could not prepare photo.");
  return new File([blob], "photo.jpg", { type: "image/jpeg" });
}
