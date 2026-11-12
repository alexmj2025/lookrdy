export async function wardrobePhoto(source: string, maxSide = 640) {
  const image = new Image();
  image.src = source;
  await image.decode();
  const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const context = canvas.getContext("2d", { alpha: false, willReadFrequently: true });
  if (!context) throw new Error("The photo couldn’t be prepared.");
  context.fillStyle = "#f5f3f0";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  const x = Math.floor(canvas.width / 3);
  const y = Math.floor(canvas.height / 3);
  const { data } = context.getImageData(x, y, Math.max(1, x), Math.max(1, y));
  const rgb = [0, 0, 0];
  for (let i = 0; i < data.length; i += 4) {
    for (let channel = 0; channel < 3; channel++) rgb[channel] += data[i + channel];
  }
  const swatch = "#" + rgb.map((value) => Math.round(value / (data.length / 4)).toString(16).padStart(2, "0")).join("");
  return { image: canvas.toDataURL("image/jpeg", 0.82), swatch };
}
