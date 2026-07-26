"use client";

import { useState } from "react";
import { X } from "lucide-react";

function normalizeTag(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function parseTags(value: string) {
  return value
    .split(",")
    .map(normalizeTag)
    .filter(Boolean);
}

export function BlogTagField({ defaultValue = "", compact = false }: { defaultValue?: string; compact?: boolean }) {
  const [tags, setTags] = useState(() => parseTags(defaultValue));
  const [draft, setDraft] = useState("");

  function addTag(value: string) {
    const tag = normalizeTag(value);
    if (!tag) return;
    setTags((currentTags) => (currentTags.some((currentTag) => currentTag.toLowerCase() === tag.toLowerCase()) ? currentTags : [...currentTags, tag]));
    setDraft("");
  }

  function removeTag(tag: string) {
    setTags((currentTags) => currentTags.filter((currentTag) => currentTag !== tag));
  }

  return (
    <div className="grid gap-2">
      <input type="hidden" name="tags" value={tags.join(", ")} />
      <div className={compact ? "flex flex-wrap gap-2" : "flex min-h-10 flex-wrap items-center gap-2 rounded-md border border-zinc-800 bg-zinc-950 px-2 py-1"}>
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex h-7 items-center gap-2 rounded-full border border-zinc-800 bg-black px-3 text-xs text-zinc-300"
          >
            {tag}
            <button type="button" className="text-zinc-600 transition hover:text-zinc-100" onClick={() => removeTag(tag)} title={`Remove ${tag}`}>
              <X className="size-3" />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(event) => setDraft(event.currentTarget.value)}
          onKeyDown={(event) => {
            if (event.key !== "Enter" && event.key !== ",") return;
            event.preventDefault();
            addTag(draft);
          }}
          onBlur={() => addTag(draft)}
          className={compact ? "h-7 min-w-24 flex-1 bg-transparent text-xs text-zinc-300 outline-none placeholder:text-zinc-700" : "h-7 min-w-28 flex-1 bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-700"}
          placeholder={tags.length ? "Add tag" : "Backend, Product, API"}
        />
      </div>
    </div>
  );
}
