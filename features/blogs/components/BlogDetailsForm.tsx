"use client";

import { useEffect, useState } from "react";
import type { Blog } from "../types";

function createSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 180);
}

export function BlogDetailsForm({ blog }: { blog: Blog | null }) {
  const [title, setTitle] = useState(blog?.title ?? "");
  const [slug, setSlug] = useState(blog?.slug ?? "");
  const [isSlugManual, setIsSlugManual] = useState(Boolean(blog?.slug));

  useEffect(() => {
    if (isSlugManual) return;

    const timeoutId = window.setTimeout(() => {
      setSlug(createSlug(title));
    }, 500);

    return () => window.clearTimeout(timeoutId);
  }, [isSlugManual, title]);

  return (
    <>
      <label className="grid gap-1 text-xs font-medium text-zinc-400">
        Title
        <input
          name="title"
          value={title}
          onChange={(event) => setTitle(event.currentTarget.value)}
          className="h-10 rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-sky-400"
          required
        />
      </label>
      <label className="grid gap-1 text-xs font-medium text-zinc-400">
        Slug
        <input
          name="slug"
          value={slug}
          onChange={(event) => {
            setIsSlugManual(true);
            setSlug(createSlug(event.currentTarget.value));
          }}
          className="h-10 rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-sky-400"
          placeholder="building-fast-portfolio"
          required
        />
      </label>
      <label className="grid gap-1 text-xs font-medium text-zinc-400">
        English Title (Optional)
        <input
          name="titleEn"
          defaultValue={blog?.titleEn ?? ""}
          className="h-10 rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-sky-400"
        />
      </label>
      <label className="grid gap-1 text-xs font-medium text-zinc-400">
        English Excerpt (Optional)
        <input
          name="excerptEn"
          defaultValue={blog?.excerptEn ?? ""}
          className="h-10 rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-sky-400"
        />
      </label>
    </>
  );
}
