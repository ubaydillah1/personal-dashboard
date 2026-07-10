"use client";

import { useId, useMemo, useState } from "react";

type TagInputProps = {
  tags: string[];
  name?: string;
  defaultValue?: string;
  placeholder?: string;
  className?: string;
  showHint?: boolean;
};

export function TagInput({
  tags,
  name = "keyword",
  defaultValue = "",
  placeholder = "tag",
  className,
  showHint = true,
}: TagInputProps) {
  const listId = useId();
  const [value, setValue] = useState(defaultValue);
  const normalizedTags = useMemo(() => new Set(tags.map((tag) => tag.toLowerCase())), [tags]);
  const normalizedValue = value.trim().toLowerCase();
  const isNewTag = normalizedValue.length > 0 && !normalizedTags.has(normalizedValue);

  return (
    <div className="min-w-0">
      <input
        name={name}
        list={listId}
        defaultValue={defaultValue}
        placeholder={placeholder}
        onChange={(event) => setValue(event.currentTarget.value)}
        className={className}
      />
      <datalist id={listId}>
        {tags.map((tag) => (
          <option key={tag} value={tag} />
        ))}
      </datalist>
      {showHint && isNewTag ? (
        <p className="mt-1 truncate text-[11px] leading-4 text-amber-300">New tag: {normalizedValue}</p>
      ) : null}
    </div>
  );
}
