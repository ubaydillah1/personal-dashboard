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

export function ImageCropperModal({
  file,
  onCropComplete,
  onClose,
}: ImageCropperModalProps) {
  const [imgSrc, setImgSrc] = useState<string>("");
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspect, setAspect] = useState<number | undefined>(undefined);

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

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    if (aspect) {
      setCrop(centerAspectCrop(width, height, aspect));
    } else {
      setCrop({
        unit: "%",
        width: 90,
        height: 80,
        x: 5,
        y: 10,
      });
    }
  }

  function handleAspectChange(ratio: number | undefined) {
    setAspect(ratio);
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
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      alert("Could not crop image: Browser Canvas Context is missing.");
      return;
    }

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height,
    );

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          alert("Cropping failed.");
          return;
        }

        const extension = file.name.split(".").pop() || "webp";
        const baseName = file.name.replace(/\.[^/.]+$/, "");
        const croppedFile = new File(
          [blob],
          `${baseName}-cropped.${extension}`,
          {
            type: blob.type || "image/webp",
          },
        );

        onCropComplete(croppedFile);
      },
      file.type || "image/webp",
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
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col gap-4 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-zinc-100 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CropIcon className="size-5 text-sky-400" />
            <h2 className="text-lg font-semibold">Crop Image</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-zinc-550 transition hover:bg-zinc-900 hover:text-zinc-350"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Aspect Ratio Presets */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={getBtnClass(aspect === undefined)}
            onClick={() => handleAspectChange(undefined)}
          >
            Free
          </button>
          <button
            type="button"
            className={getBtnClass(aspect === 1)}
            onClick={() => handleAspectChange(1)}
          >
            1:1 Square
          </button>
          <button
            type="button"
            className={getBtnClass(aspect === 16 / 9)}
            onClick={() => handleAspectChange(16 / 9)}
          >
            16:9 Landscape
          </button>
          <button
            type="button"
            className={getBtnClass(aspect === 4 / 3)}
            onClick={() => handleAspectChange(4 / 3)}
          >
            4:3 Standard
          </button>
        </div>

        {/* Crop Area */}
        <div className="relative flex flex-1 items-center justify-center overflow-auto rounded-lg border border-zinc-900 bg-zinc-900/20 p-4 min-h-60">
          {imgSrc && (
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspect}
            >
              <img
                ref={imgRef}
                src={imgSrc}
                alt="Crop preview"
                onLoad={onImageLoad}
                className="max-h-[50vh] max-w-full object-contain"
              />
            </ReactCrop>
          )}
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
