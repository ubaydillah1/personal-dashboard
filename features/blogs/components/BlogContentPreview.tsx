"use client";

import React from "react";
import type { BlogContentBlock } from "../types";

function renderTextWithBold(text: string): React.ReactNode[] {
  if (!text) return [];

  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      const boldText = part.slice(2, -2);
      return (
        <strong key={index} className="font-bold text-zinc-50">
          {boldText}
        </strong>
      );
    }
    return part;
  });
}

export function renderTextWithLinks(text: string): React.ReactNode[] {
  if (!text) return [];

  const regex = /(\[([^\]]+)\]\((https?:\/\/[^\s)]+)\))|(https?:\/\/[^\s)]+)/g;

  const parts = text.split(regex);
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < parts.length; i += 5) {
    if (parts[i]) {
      elements.push(...renderTextWithBold(parts[i]));
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
            {renderTextWithBold(markdownLabel)}
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
            <p key={index} className="blog-body-font text-[23px] leading-9 text-zinc-300 whitespace-pre-line">
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
                  ? "blog-heading-font pt-3 text-5xl font-semibold leading-tight text-zinc-50"
                  : "blog-heading-font pt-2 text-3xl font-semibold leading-tight text-zinc-50"
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
            <blockquote key={index} className="border-l-2 border-sky-400 pl-4 text-2xl italic leading-9 text-zinc-200 whitespace-pre-line">
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
                <li key={`${item}-${itemIndex}`} className="blog-body-font text-[18px] leading-7 text-zinc-300">
                  {renderTextWithLinks(item)}
                </li>
              ))}
            </ListTag>
          );
        }

        if (block.type === "callout") {
          return (
            <div key={index} className="rounded-lg border border-amber-400/30 bg-amber-400/10 p-4">
              <p className="font-semibold text-amber-200">{block.title}</p>
              <p className="mt-1 text-amber-100/80 whitespace-pre-line">{renderTextWithLinks(block.text)}</p>
            </div>
          );
        }

        if (block.type === "diagram") {
          const isHorizontal = block.orientation === "horizontal";
          const lines = (block.text || "")
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => {
              if (!line) return false;
              // Filter out pure arrow lines/symbols
              return !/^[↓→➔➔➔\->\=>\s]+$/.test(line);
            });

          if (lines.length === 0) return null;

          return (
            <div key={index} className="my-6 rounded-2xl border border-zinc-800/80 bg-gradient-to-br from-zinc-900/60 to-zinc-950 p-6 font-mono text-[15px] leading-8 text-zinc-300 select-none shadow-xl flex flex-col items-center justify-center text-center">
              <div className={`flex ${isHorizontal ? "flex-row flex-wrap items-center justify-center gap-x-4 gap-y-3" : "flex-col items-center gap-y-3"} w-full select-none cursor-default`}>
                {lines.map((line, idx) => (
                  <React.Fragment key={idx}>
                    {idx > 0 && (
                      <div className={`text-zinc-500 font-bold flex items-center justify-center select-none ${isHorizontal ? "text-xl px-1 animate-pulse" : "text-lg my-0.5 animate-pulse"}`}>
                        {isHorizontal ? "→" : "↓"}
                      </div>
                    )}
                    <div className="px-5 py-2.5 rounded-xl bg-zinc-900/30 border border-zinc-800/50 shadow-sm max-w-full break-words text-zinc-200 hover:border-zinc-700/80 transition duration-300">
                      {renderTextWithLinks(line)}
                    </div>
                  </React.Fragment>
                ))}
              </div>
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
