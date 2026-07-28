"use client";

import React from "react";
import type { BlogContentBlock } from "../types";

export function renderTextWithLinks(text: string): React.ReactNode[] {
  if (!text) return [];

  // Match markdown links: [label](url)
  // Match plain URLs: https://... or http://...
  const regex = /(\[([^\]]+)\]\((https?:\/\/[^\s)]+)\))|(https?:\/\/[^\s)]+)/g;

  const parts = text.split(regex);
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < parts.length; i += 5) {
    // Add text before match
    if (parts[i]) {
      elements.push(parts[i]);
    }

    if (i + 1 < parts.length) {
      const markdownFull = parts[i + 1];
      const markdownLabel = parts[i + 2];
      const markdownUrl = parts[i + 3];
      const plainUrl = parts[i + 4];

      if (markdownFull && markdownLabel && markdownUrl) {
        elements.push(
          <a
            key={i}
            href={markdownUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-400 hover:text-sky-300 hover:underline font-medium"
          >
            {markdownLabel}
          </a>
        );
      } else if (plainUrl) {
        elements.push(
          <a
            key={i}
            href={plainUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-400 hover:text-sky-300 hover:underline font-medium break-all"
          >
            {plainUrl}
          </a>
        );
      }
    }
  }

  return elements;
}

export function BlogContentPreview({ content }: { content: BlogContentBlock[] }) {
  if (content.length === 0) {
    return <p className="text-sm text-zinc-500">No content blocks.</p>;
  }

  return (
    <article className="space-y-5 text-zinc-300">
      {content.map((block, index) => {
        if (block.type === "paragraph") {
          return (
            <p key={index} className="blog-body-font text-lg leading-8 text-zinc-300">
              {renderTextWithLinks(block.text)}
            </p>
          );
        }

        if (block.type === "heading") {
          const HeadingTag = `h${block.level}` as "h1" | "h2" | "h3" | "h4";
          return (
            <HeadingTag
              key={index}
              className={
                block.level === 1
                  ? "blog-heading-font pt-3 text-4xl font-semibold leading-tight text-zinc-50"
                  : "blog-heading-font pt-2 text-2xl font-semibold leading-tight text-zinc-50"
              }
            >
              {renderTextWithLinks(block.text)}
            </HeadingTag>
          );
        }

        if (block.type === "image") {
          return (
            <figure key={index} className="overflow-hidden rounded-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={block.src} alt={block.alt} className="mx-auto block h-auto max-h-[500px] max-w-full rounded-lg" />
              {block.caption ? <figcaption className="mt-2 text-center text-xs text-zinc-500 italic">{block.caption}</figcaption> : null}
            </figure>
          );
        }

        if (block.type === "gallery") {
          return (
            <div key={index} className="grid gap-2 sm:grid-cols-2">
              {block.items.map((item, itemIndex) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={`${item.src}-${itemIndex}`}
                  src={item.src}
                  alt={item.alt}
                  className="h-44 w-full rounded-lg border border-zinc-800 object-cover"
                />
              ))}
            </div>
          );
        }

        if (block.type === "quote") {
          return (
            <blockquote key={index} className="border-l-2 border-sky-400 pl-4 text-zinc-200">
              {renderTextWithLinks(block.text)}
            </blockquote>
          );
        }

        if (block.type === "code") {
          return (
            <pre key={index} className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-950 p-4 text-xs text-emerald-200">
              <code>{block.code}</code>
            </pre>
          );
        }

        if (block.type === "list") {
          const ListTag = block.style === "ordered" ? "ol" : "ul";
          return (
            <ListTag key={index} className={block.style === "ordered" ? "list-decimal pl-5 space-y-1" : "list-disc pl-5 space-y-1"}>
              {block.items.map((item, itemIndex) => (
                <li key={`${item}-${itemIndex}`}>{renderTextWithLinks(item)}</li>
              ))}
            </ListTag>
          );
        }

        if (block.type === "callout") {
          return (
            <div key={index} className="rounded-lg border border-amber-400/30 bg-amber-400/10 p-4">
              <p className="font-semibold text-amber-200">{block.title}</p>
              <p className="mt-1 text-amber-100/80">{renderTextWithLinks(block.text)}</p>
            </div>
          );
        }

        return (
          <a key={index} href={block.href} className="inline-flex text-sky-400 underline-offset-4 hover:underline font-medium">
            {block.label}
          </a>
        );
      })}
    </article>
  );
}
