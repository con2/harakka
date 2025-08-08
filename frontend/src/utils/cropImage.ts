export const getCroppedImg = async (
  imageSrc: string,
  crop: { x: number; y: number },
  zoom: number,
  aspect: number,
  croppedAreaPixels: { width: number; height: number; x: number; y: number },
  rotation: number,
): Promise<Blob> => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("Failed to get canvas context");

  const radians = (rotation * Math.PI) / 180;
  const safeArea = Math.max(image.width, image.height) * 2; // make canvas bigger to fit rotation

  canvas.width = safeArea;
  canvas.height = safeArea;

  // rotation is in the middle of the picture
  ctx.translate(safeArea / 2, safeArea / 2);
  ctx.rotate(radians);
  ctx.translate(-safeArea / 2, -safeArea / 2);

  // ToDo: handle zoom doesn't work properly
  const scaledWidth = image.width * zoom;
  const scaledHeight = image.height * zoom;

  ctx.drawImage(
    image,
    (safeArea - scaledWidth) / 2,
    (safeArea - scaledHeight) / 2,
    scaledWidth,
    scaledHeight,
  );

  // crop the image
  const data = ctx.getImageData(
    (safeArea - scaledWidth) / 2 + croppedAreaPixels.x,
    (safeArea - scaledHeight) / 2 + croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
  );

  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = croppedAreaPixels.width;
  outputCanvas.height = croppedAreaPixels.height;
  const outputCtx = outputCanvas.getContext("2d");

  if (!outputCtx) throw new Error("Failed to get canvas context");

  outputCtx.putImageData(data, 0, 0);

  return new Promise((resolve, reject) => {
    outputCanvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Canvas is empty"));
    }, "image/jpeg");
  });
};

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.src = url;
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = (error) =>
      reject(
        new Error(typeof error === "string" ? error : "Image failed to load"),
      );
  });
