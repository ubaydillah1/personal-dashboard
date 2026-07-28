"use client";

import { useEffect, useRef, useState } from "react";
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  convertToPixelCrop,
  type Crop,
  type PixelCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { X, Crop as CropIcon } from "lucide-react";
import { removeBackground } from "@imgly/background-removal";

interface ImageCropperModalProps {
  file: File;
  onCropComplete: (croppedFile: File) => void;
  onClose: () => void;
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  );
}

function drawCroppedImage(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  completedCrop: PixelCrop,
  scale: number,
  bgColor: string,
  removeWhiteBg: boolean,
  whiteThreshold: number,
  canvasAspect: number | undefined,
) {
  if (!completedCrop.width || !completedCrop.height) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  const cropNaturalWidth = completedCrop.width * scaleX;
  const cropNaturalHeight = completedCrop.height * scaleY;

  let canvasWidth = cropNaturalWidth;
  let canvasHeight = cropNaturalHeight;

  if (canvasAspect !== undefined) {
    const cropAspect = cropNaturalWidth / cropNaturalHeight;
    if (cropAspect > canvasAspect) {
      canvasWidth = cropNaturalWidth;
      canvasHeight = cropNaturalWidth / canvasAspect;
    } else {
      canvasHeight = cropNaturalHeight;
      canvasWidth = cropNaturalHeight * canvasAspect;
    }
  }

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (bgColor !== "transparent") {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  const sx = completedCrop.x * scaleX;
  const sy = completedCrop.y * scaleY;
  const sw = completedCrop.width * scaleX;
  const sh = completedCrop.height * scaleY;

  const dw = cropNaturalWidth * scale;
  const dh = cropNaturalHeight * scale;

  const dx = (canvasWidth - dw) / 2;
  const dy = (canvasHeight - dh) / 2;

  if (removeWhiteBg) {
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext("2d");

    if (tempCtx) {
      tempCtx.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);

      const imgData = tempCtx.getImageData(
        0,
        0,
        tempCanvas.width,
        tempCanvas.height,
      );
      const data = imgData.data;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        if (
          a > 0 &&
          r >= whiteThreshold &&
          g >= whiteThreshold &&
          b >= whiteThreshold
        ) {
          data[i + 3] = 0;
        }
      }
      tempCtx.putImageData(imgData, 0, 0);
      ctx.drawImage(tempCanvas, 0, 0);
    }
  } else {
    ctx.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
  }
}

export function ImageCropperModal({
  file,
  onCropComplete,
  onClose,
}: ImageCropperModalProps) {
  const [imgSrc, setImgSrc] = useState<string>("");
  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [cropAspect, setCropAspect] = useState<number | undefined>(undefined);
  const [canvasAspect, setCanvasAspect] = useState<number | undefined>(
    undefined,
  );
  const [bgColor, setBgColor] = useState<string>("transparent");
  const [scale, setScale] = useState<number>(1.0);
  const [removeWhite, setRemoveWhite] = useState<boolean>(false);
  const [threshold, setThreshold] = useState<number>(240);
  const [isAiRemoving, setIsAiRemoving] = useState<boolean>(false);
  const [isAiRemoved, setIsAiRemoved] = useState<boolean>(false);
  const isFirstLoad = useRef(true);

  // Load the file as a data URL
  useEffect(() => {
    let active = true;
    const reader = new FileReader();
    reader.onload = () => {
      if (active) {
        setImgSrc((reader.result as string) || "");
      }
    };
    reader.readAsDataURL(file);
    return () => {
      active = false;
    };
  }, [file]);

  // Update live preview canvas
  useEffect(() => {
    if (!completedCrop || !imgRef.current || !previewCanvasRef.current) {
      return;
    }

    const canvas = previewCanvasRef.current;
    const image = imgRef.current;

    drawCroppedImage(
      canvas,
      image,
      completedCrop,
      scale,
      bgColor,
      removeWhite,
      threshold,
      canvasAspect,
    );
  }, [completedCrop, scale, bgColor, removeWhite, threshold, canvasAspect]);

  const handleAiRemoveBackground = async () => {
    if (isAiRemoving) return;
    setIsAiRemoving(true);
    try {
      const processedBlob = await removeBackground(file);
      const transparentUrl = URL.createObjectURL(processedBlob);
      setImgSrc(transparentUrl);
      setIsAiRemoved(true);
    } catch (error) {
      console.error("AI Background Removal failed:", error);
      alert("AI Background Removal failed. Please try again.");
    } finally {
      setIsAiRemoving(false);
    }
  };

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;

    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      if (cropAspect) {
        const newCrop = centerAspectCrop(width, height, cropAspect);
        setCrop(newCrop);
        setCompletedCrop(convertToPixelCrop(newCrop, width, height));
      } else {
        const newCrop: Crop = {
          unit: "%",
          width: 90,
          height: 80,
          x: 5,
          y: 10,
        };
        setCrop(newCrop);
        setCompletedCrop(convertToPixelCrop(newCrop, width, height));
      }
    } else {
      if (crop) {
        setCompletedCrop(convertToPixelCrop(crop, width, height));
      }
    }
  }

  function handleCropAspectChange(ratio: number | undefined) {
    setCropAspect(ratio);
    if (imgRef.current) {
      const { width, height } = imgRef.current;
      if (ratio) {
        const newCrop = centerAspectCrop(width, height, ratio);
        setCrop(newCrop);
        setCompletedCrop(convertToPixelCrop(newCrop, width, height));
      } else {
        const newCrop: Crop = {
          unit: "%",
          width: 90,
          height: 80,
          x: 5,
          y: 10,
        };
        setCrop(newCrop);
        setCompletedCrop(convertToPixelCrop(newCrop, width, height));
      }
    }
  }

  const handleCropSave = async () => {
    if (!imgRef.current || !completedCrop) return;

    const image = imgRef.current;
    const canvas = document.createElement("canvas");

    drawCroppedImage(
      canvas,
      image,
      completedCrop,
      scale,
      bgColor,
      removeWhite,
      threshold,
      canvasAspect,
    );

    const shouldOutputPng =
      bgColor === "transparent" || removeWhite || isAiRemoved;
    const outputType = shouldOutputPng ? "image/png" : "image/jpeg";
    const extension = shouldOutputPng ? "png" : "jpg";

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          alert("Cropping failed.");
          return;
        }

        const baseName = file.name.replace(/\.[^/.]+$/, "");
        const croppedFile = new File(
          [blob],
          `${baseName}-cropped.${extension}`,
          {
            type: blob.type || outputType,
          },
        );

        onCropComplete(croppedFile);
      },
      outputType,
      0.95,
    );
  };

  const getBtnClass = (active: boolean) =>
    `h-8 px-3 rounded-md text-xs font-semibold border transition duration-150 ${
      active
        ? "bg-sky-500 border-sky-600 text-white hover:bg-sky-600"
        : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-150"
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="flex max-h-[95vh] w-full max-w-4xl flex-col gap-4 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-zinc-100 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CropIcon className="size-5 text-sky-400" />
            <h2 className="text-lg font-semibold">Advanced Image Crop</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-zinc-550 transition hover:bg-zinc-900 hover:text-zinc-350"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content Body (Split layout) */}
        <div className="flex flex-col md:flex-row gap-6 overflow-hidden flex-1 min-h-0">
          {/* Left Column: Crop Workspace */}
          <div className="relative flex flex-1 items-center justify-center overflow-auto rounded-lg border border-zinc-900 bg-zinc-900/20 p-4 min-h-[350px]">
            {isAiRemoving && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm rounded-lg">
                <div className="flex flex-col items-center gap-3">
                  <div className="size-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm font-semibold text-zinc-250">
                    AI is removing background...
                  </p>
                  <p className="text-[10px] text-zinc-450">
                    First run takes a few seconds to load the AI model
                  </p>
                </div>
              </div>
            )}
            {imgSrc && (
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={cropAspect}
              >
                <img
                  ref={imgRef}
                  src={imgSrc}
                  alt="Crop preview"
                  onLoad={onImageLoad}
                  className="max-h-[60vh] max-w-full object-contain"
                />
              </ReactCrop>
            )}
          </div>

          {/* Right Column: Settings & Live Preview */}
          <div className="w-full md:w-72 flex flex-col gap-5 overflow-y-auto pr-1">
            {/* Crop Aspect Ratio (Selection) */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Crop Selection
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className={getBtnClass(cropAspect === undefined)}
                  onClick={() => handleCropAspectChange(undefined)}
                >
                  Free
                </button>
                <button
                  type="button"
                  className={getBtnClass(cropAspect === 1)}
                  onClick={() => handleCropAspectChange(1)}
                >
                  1:1 Square
                </button>
                <button
                  type="button"
                  className={getBtnClass(cropAspect === 16 / 9)}
                  onClick={() => handleCropAspectChange(16 / 9)}
                >
                  16:9 Landscape
                </button>
                <button
                  type="button"
                  className={getBtnClass(cropAspect === 4 / 3)}
                  onClick={() => handleCropAspectChange(4 / 3)}
                >
                  4:3 Standard
                </button>
              </div>
            </div>

            {/* Output Canvas aspect Ratio */}
            <div className="flex flex-col gap-2 border-t border-zinc-900 pt-4">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Output Canvas Frame
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className={getBtnClass(canvasAspect === undefined)}
                  onClick={() => setCanvasAspect(undefined)}
                >
                  Match Selection
                </button>
                <button
                  type="button"
                  className={getBtnClass(canvasAspect === 1)}
                  onClick={() => setCanvasAspect(1)}
                >
                  1:1 Square
                </button>
                <button
                  type="button"
                  className={getBtnClass(canvasAspect === 16 / 9)}
                  onClick={() => setCanvasAspect(16 / 9)}
                >
                  16:9 Landscape
                </button>
                <button
                  type="button"
                  className={getBtnClass(canvasAspect === 4 / 3)}
                  onClick={() => setCanvasAspect(4 / 3)}
                >
                  4:3 Standard
                </button>
              </div>
            </div>

            {/* Background Color Settings */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Background Color
              </label>
              <div className="flex gap-2 items-center">
                {/* Transparent Preset */}
                <button
                  type="button"
                  onClick={() => setBgColor("transparent")}
                  className={`size-8 rounded-full border bg-zinc-950 bg-[linear-gradient(45deg,#27272a_25%,transparent_25%),linear-gradient(-45deg,#27272a_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#27272a_75%),linear-gradient(-45deg,transparent_75%,#27272a_75%)] bg-[size:8px_8px] bg-[position:0_0,0_4px,4px_-4px,-4px_0] ${
                    bgColor === "transparent"
                      ? "border-sky-500 ring-2 ring-sky-500/20"
                      : "border-zinc-800 hover:border-zinc-700"
                  }`}
                  title="Transparent"
                />
                {/* White Preset */}
                <button
                  type="button"
                  onClick={() => setBgColor("#ffffff")}
                  className={`size-8 rounded-full border bg-white ${
                    bgColor === "#ffffff"
                      ? "border-sky-500 ring-2 ring-sky-500/20"
                      : "border-zinc-800 hover:border-zinc-700"
                  }`}
                  title="White"
                />
                {/* Black Preset */}
                <button
                  type="button"
                  onClick={() => setBgColor("#000000")}
                  className={`size-8 rounded-full border bg-black ${
                    bgColor === "#000000"
                      ? "border-sky-500 ring-2 ring-sky-500/20"
                      : "border-zinc-800 hover:border-zinc-700"
                  }`}
                  title="Black"
                />
                {/* Custom Color Picker */}
                <div
                  className={`relative size-8 rounded-full border overflow-hidden ${
                    bgColor !== "transparent" &&
                    bgColor !== "#ffffff" &&
                    bgColor !== "#000000"
                      ? "border-sky-500 ring-2 ring-sky-500/20"
                      : "border-zinc-800 hover:border-zinc-700"
                  }`}
                  title="Custom Color"
                >
                  <input
                    type="color"
                    value={bgColor.startsWith("#") ? bgColor : "#3b82f6"}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="absolute inset-0 size-full p-0 border-0 scale-150 cursor-pointer"
                  />
                </div>
                {bgColor.startsWith("#") &&
                  bgColor !== "#ffffff" &&
                  bgColor !== "#000000" && (
                    <span className="text-xs font-mono text-zinc-400">
                      {bgColor.toUpperCase()}
                    </span>
                  )}
              </div>
            </div>

            {/* Scale Slider */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Image Zoom / Fit
                </label>
                <span className="text-xs font-mono font-semibold text-sky-400 bg-sky-950/40 px-1.5 py-0.5 rounded">
                  {Math.round(scale * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.2"
                max="1.0"
                step="0.05"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
              <span className="text-[10px] text-zinc-550">
                Drag to scale the image down and center it inside the crop
                frame.
              </span>
            </div>

            {/* AI Background Removal */}
            <div className="flex flex-col gap-2 border-t border-zinc-900 pt-4">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                AI Tools
              </label>
              <button
                type="button"
                disabled={isAiRemoving || isAiRemoved}
                onClick={handleAiRemoveBackground}
                className={`w-full h-9 rounded-md text-xs font-semibold flex items-center justify-center gap-2 transition duration-150 ${
                  isAiRemoved
                    ? "bg-emerald-950/40 border border-emerald-900 text-emerald-400 cursor-not-allowed"
                    : "bg-sky-500/10 border border-sky-500/20 text-sky-400 hover:bg-sky-500 hover:text-white"
                }`}
              >
                {isAiRemoving ? (
                  <>
                    <div className="size-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : isAiRemoved ? (
                  "✓ Background Removed by AI"
                ) : (
                  "AI Auto-Remove Background"
                )}
              </button>
              <span className="text-[10px] text-zinc-550 leading-normal">
                Uses on-device AI to isolate the foreground object and remove
                the background.
              </span>
            </div>

            {/* Remove White Background Filter */}
            <div className="flex flex-col gap-2 border-t border-zinc-900 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Remove White BG
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={removeWhite}
                    onChange={(e) => setRemoveWhite(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-350 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500 peer-checked:after:bg-white peer-checked:after:border-sky-500"></div>
                </label>
              </div>

              {removeWhite && (
                <div className="flex flex-col gap-1.5 mt-1">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-zinc-450">Tolerance</span>
                    <span className="text-zinc-300 font-mono">
                      {256 - threshold}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="155"
                    max="255"
                    step="5"
                    value={threshold}
                    onChange={(e) => setThreshold(parseInt(e.target.value))}
                    className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                  />
                  <span className="text-[9px] text-zinc-550 leading-normal">
                    Higher values remove more off-white shades. Low values
                    remove only pure white.
                  </span>
                </div>
              )}
            </div>

            {/* Live Preview */}
            <div className="flex flex-col gap-2 mt-auto">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Live Preview
              </label>
              <div className="relative aspect-video w-full rounded-lg border border-zinc-900 bg-zinc-950 overflow-hidden flex items-center justify-center bg-[linear-gradient(45deg,#18181b_25%,transparent_25%),linear-gradient(-45deg,#18181b_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#18181b_75%),linear-gradient(-45deg,transparent_75%,#18181b_75%)] bg-[size:12px_12px] bg-[position:0_0,0_6px,6px_-6px,-6px_0]">
                {completedCrop ? (
                  <canvas
                    ref={previewCanvasRef}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <span className="text-xs text-zinc-550">
                    Make a selection to preview
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 border-t border-zinc-900 pt-4">
          <button
            type="button"
            className="h-8 px-4 rounded-md text-xs font-semibold bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-150 transition"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCropSave}
            className="h-8 px-4 rounded-md text-xs font-semibold bg-sky-500 border border-sky-600 text-white hover:bg-sky-600 flex items-center gap-1.5 transition"
          >
            <CropIcon className="size-4" />
            Apply & Upload
          </button>
        </div>
      </div>
    </div>
  );
}
