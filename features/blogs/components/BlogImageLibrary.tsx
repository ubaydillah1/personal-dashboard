"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  Copy,
  Check,
  Trash2,
  Loader2,
  Search,
  X,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
} from "lucide-react";
import type { BlogImageAsset } from "../types";
import { uploadBlogImageAction, deleteBlogImageAction } from "../actions";

interface UploadItem {
  id: string;
  name: string;
  thumbnail: string;
  status: "uploading" | "success" | "error";
  error?: string;
}

export function BlogImageLibrary({ images }: { images: BlogImageAsset[] }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const [isDragging, setIsDragging] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadQueue, setUploadQueue] = useState<UploadItem[]>([]);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [deletingPath, setDeletingPath] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragOut = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith("image/"),
      );
      if (files.length > 0) {
        handleUploads(files);
      }
    }
  };

  const handleUploads = async (files: File[]) => {
    const newItems = files.map((file) => ({
      id: Math.random().toString(36).substring(7),
      name: file.name,
      thumbnail: URL.createObjectURL(file),
      status: "uploading" as const,
      file,
    }));

    // Add to queue in state
    setUploadQueue((prev) => [
      ...newItems.map(({ id, name, thumbnail, status }) => ({
        id,
        name,
        thumbnail,
        status,
      })),
      ...prev,
    ]);

    // Process uploads in parallel
    await Promise.all(
      newItems.map(async (item) => {
        const formData = new FormData();
        formData.append("imageFile", item.file);

        try {
          const result = await uploadBlogImageAction(null, formData);
          if (result.success) {
            setUploadQueue((prev) =>
              prev.map((u) =>
                u.id === item.id ? { ...u, status: "success" } : u,
              ),
            );
            // Auto clear successful uploads after 3s
            setTimeout(() => {
              setUploadQueue((prev) => prev.filter((u) => u.id !== item.id));
            }, 3000);
          } else {
            setUploadQueue((prev) =>
              prev.map((u) =>
                u.id === item.id
                  ? { ...u, status: "error", error: result.error }
                  : u,
              ),
            );
          }
        } catch (err) {
          setUploadQueue((prev) =>
            prev.map((u) =>
              u.id === item.id
                ? {
                    ...u,
                    status: "error",
                    error: err instanceof Error ? err.message : "Upload failed",
                  }
                : u,
            ),
          );
        }
      }),
    );

    router.refresh();
  };

  const onZoneClick = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleUploads(files);
      e.target.value = ""; // Reset input so same file can be uploaded again
    }
  };

  const copyUrl = async (url: string) => {
    await navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 1500);
  };

  const handleDelete = async (path: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;
    setDeletingPath(path);
    try {
      const res = await deleteBlogImageAction(path);
      if (res.success) {
        router.refresh();
      } else {
        alert(res.error ?? "Failed to delete image.");
      }
    } catch {
      alert("An error occurred while deleting the image.");
    } finally {
      setDeletingPath(null);
    }
  };

  const filteredImages = images.filter((image) =>
    image.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredImages.length / itemsPerPage);
  const activePage = Math.min(Math.max(1, currentPage), totalPages || 1);
  const paginatedImages = filteredImages.slice(
    (activePage - 1) * itemsPerPage,
    activePage * itemsPerPage,
  );

  const startItem = filteredImages.length === 0 ? 0 : (activePage - 1) * itemsPerPage + 1;
  const endItem = Math.min(activePage * itemsPerPage, filteredImages.length);

  const getPageNumbers = (current: number, total: number) => {
    const pages: (number | string)[] = [];
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      if (current <= 4) {
        pages.push(1, 2, 3, 4, 5, "...", total);
      } else if (current >= total - 3) {
        pages.push(1, "...", total - 4, total - 3, total - 2, total - 1, total);
      } else {
        pages.push(1, "...", current - 1, current, current + 1, "...", total);
      }
    }
    return pages;
  };

  return (
    <div className="grid gap-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-50">
            Blog Images
          </h1>
          <p className="text-sm text-zinc-400">
            Upload multiple images, drag and drop, copy public URLs, or manage
            assets.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full max-w-xs sm:w-72">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search images..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 pl-10 pr-4 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
          />
        </div>
      </div>

      {/* Dropbox (Drag & Drop Zone) */}
      <div
        onDragOver={handleDrag}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDrop={handleDrop}
        onClick={onZoneClick}
        className={`group relative flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition duration-200 ${
          isDragging
            ? "border-sky-400 bg-sky-950/20"
            : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={onFileChange}
        />

        <div className="flex flex-col items-center gap-3">
          <div
            className={`rounded-lg border p-3 transition duration-200 ${
              isDragging
                ? "border-sky-400/50 bg-sky-900/20 text-sky-400"
                : "border-zinc-800 bg-zinc-950 text-zinc-400 group-hover:border-zinc-700 group-hover:text-zinc-200"
            }`}
          >
            <UploadCloud className="size-8" />
          </div>
          <div>
            <p className="font-semibold text-zinc-200">
              Drag & drop your images here
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              or click to browse from your device
            </p>
          </div>
          <div className="rounded-full bg-zinc-950 px-3 py-1 text-[10px] text-zinc-500">
            Supports PNG, JPG, WEBP, GIF (Max 10MB)
          </div>
        </div>
      </div>

      {/* Upload Queue List */}
      {uploadQueue.length > 0 && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Upload Queue ({uploadQueue.length})
          </h2>
          <div className="grid gap-2">
            {uploadQueue.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-950 p-2 text-sm"
              >
                <div className="flex min-w-0 items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.thumbnail}
                    alt=""
                    className="size-10 rounded object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-zinc-200">
                      {item.name}
                    </p>
                    {item.status === "uploading" && (
                      <p className="text-xs text-zinc-500">Uploading...</p>
                    )}
                    {item.status === "success" && (
                      <p className="text-xs text-emerald-400">
                        Upload complete!
                      </p>
                    )}
                    {item.status === "error" && (
                      <p className="truncate text-xs text-red-400">
                        {item.error || "Upload failed"}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {item.status === "uploading" && (
                    <Loader2 className="size-4 animate-spin text-sky-400" />
                  )}
                  {item.status === "success" && (
                    <CheckCircle2 className="size-4 text-emerald-400" />
                  )}
                  {item.status === "error" && (
                    <AlertCircle className="size-4 text-red-400" />
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setUploadQueue((prev) =>
                        prev.filter((u) => u.id !== item.id),
                      );
                    }}
                    className="rounded p-1 text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image Grid */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Library ({filteredImages.length})
          </h2>
        </div>

        {filteredImages.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/20 py-16 text-center">
            <div className="rounded-full border border-zinc-800 bg-zinc-950 p-4 text-zinc-600">
              <ImageIcon className="size-8" />
            </div>
            <p className="mt-4 font-semibold text-zinc-400">No images found</p>
            <p className="mt-1 text-xs text-zinc-600">
              Upload images above or adjust your search query.
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {paginatedImages.map((image) => (
              <div
                key={image.path}
                className="group relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 transition duration-300 hover:-translate-y-0.5 hover:border-zinc-700 hover:shadow-lg hover:shadow-black/50"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video w-full overflow-hidden bg-zinc-950">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.publicUrl}
                    alt={image.name}
                    className="size-full object-cover transition duration-300 group-hover:scale-105"
                  />

                  {/* Quick Copy Badge */}
                  <div className="absolute left-2.5 top-2.5 z-10">
                    <button
                      onClick={() => copyUrl(image.publicUrl)}
                      className={`flex h-7 items-center gap-1.5 rounded-full px-2.5 text-[11px] font-medium transition duration-200 backdrop-blur-md ${
                        copiedUrl === image.publicUrl
                          ? "bg-emerald-500/90 text-white"
                          : "bg-black/60 text-zinc-300 opacity-0 hover:bg-black/80 hover:text-white group-hover:opacity-100"
                      }`}
                    >
                      {copiedUrl === image.publicUrl ? (
                        <>
                          <Check className="size-3" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="size-3" />
                          Copy URL
                        </>
                      )}
                    </button>
                  </div>

                  {/* Delete Button */}
                  <div className="absolute right-2.5 top-2.5 z-10">
                    <button
                      disabled={deletingPath === image.path}
                      onClick={() => handleDelete(image.path)}
                      className="flex size-7 items-center justify-center rounded-full bg-black/60 text-zinc-300 opacity-0 transition duration-200 hover:bg-red-500/90 hover:text-white group-hover:opacity-100 disabled:opacity-50"
                    >
                      {deletingPath === image.path ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : (
                        <Trash2 className="size-3" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Details */}
                <div className="p-3">
                  <p
                    className="truncate text-xs font-semibold text-zinc-200"
                    title={image.name}
                  >
                    {image.name}
                  </p>
                  <p
                    className="mt-1 truncate text-[10px] font-mono text-zinc-500"
                    title={image.publicUrl}
                  >
                    {image.publicUrl}
                  </p>
                  {image.updatedAt && (
                    <p className="mt-2 text-[9px] text-zinc-600">
                      Uploaded: {new Date(image.updatedAt).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-zinc-800/85 pt-4 sm:flex-row">
              {/* Items Range / Count */}
              <p className="text-xs text-zinc-400">
                Showing <span className="font-semibold text-zinc-200">{startItem}</span> to{" "}
                <span className="font-semibold text-zinc-200">{endItem}</span> of{" "}
                <span className="font-semibold text-zinc-200">{filteredImages.length}</span> images
              </p>

              {/* Page Selector & Buttons */}
              <div className="flex items-center gap-2">
                {/* Page Size Selector */}
                <div className="mr-4 flex items-center gap-1.5 text-xs text-zinc-500">
                  <span>Show:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="rounded border border-zinc-800 bg-zinc-950 px-2 py-1 text-zinc-300 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
                  >
                    {[12, 24, 48, 96].map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Prev Button */}
                <button
                  disabled={activePage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="flex size-8 items-center justify-center rounded border border-zinc-800 bg-zinc-950 text-zinc-400 transition hover:border-zinc-700 hover:text-zinc-200 disabled:opacity-30 disabled:hover:border-zinc-800 disabled:hover:text-zinc-400"
                >
                  <ChevronLeft className="size-4" />
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {getPageNumbers(activePage, totalPages).map((page, idx) => {
                    if (page === "...") {
                      return (
                        <span
                          key={`dots-${idx}`}
                          className="flex size-8 items-center justify-center text-xs text-zinc-650"
                        >
                          ...
                        </span>
                      );
                    }
                    return (
                      <button
                        key={`page-${page}`}
                        onClick={() => setCurrentPage(Number(page))}
                        className={`flex size-8 items-center justify-center rounded text-xs font-medium transition ${
                          activePage === page
                            ? "bg-sky-400/10 border border-sky-400/50 text-sky-400"
                            : "border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                {/* Next Button */}
                <button
                  disabled={activePage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="flex size-8 items-center justify-center rounded border border-zinc-800 bg-zinc-950 text-zinc-400 transition hover:border-zinc-700 hover:text-zinc-200 disabled:opacity-30 disabled:hover:border-zinc-800 disabled:hover:text-zinc-400"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          )}
          </>
        )}
      </div>
    </div>
  );
}
