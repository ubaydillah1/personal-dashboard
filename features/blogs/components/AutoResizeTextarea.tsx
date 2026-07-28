"use client";

import { useEffect, useRef, useState } from "react";

interface AutoResizeTextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "onKeyDown" | "value"> {
  value?: string;
  onKeyDown?: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

function markdownToHtml(markdown: string): string {
  if (!markdown) return "";
  let html = markdown
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Convert **bold** to <strong>bold</strong>
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

  // Convert newlines to <br/>
  html = html.replace(/\n/g, "<br/>");
  return html;
}

function htmlToMarkdown(html: string): string {
  if (!html) return "";
  let temp = html;

  // Replace <br> and <br/> with newline
  temp = temp.replace(/<br\s*\/?>/gi, "\n");

  // Replace opening divs with newline (some browsers wrap text lines in divs)
  temp = temp.replace(/<div>/gi, "\n").replace(/<\/div>/gi, "");

  // Convert <strong>, <b>, and bold spans to **text**
  temp = temp
    .replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, "**$1**")
    .replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, "**$1**")
    .replace(
      /<span[^>]*style="[^"]*font-weight:\s*(?:bold|700)[^"]*"[^>]*>([\s\S]*?)<\/span>/gi,
      "**$1**",
    );

  // Strip other HTML tags
  temp = temp.replace(/<[^>]+>/g, "");

  // Decode HTML entities
  temp = temp
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ");

  return temp;
}

export function AutoResizeTextarea({
  value,
  defaultValue,
  onChange,
  className,
  placeholder,
  onKeyDown,
  name,
  required,
  ...props
}: AutoResizeTextareaProps) {
  const editableRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);

  // Track internal value for uncontrolled mode & placeholder visibility
  const [internalValue, setInternalValue] = useState(() => {
    return value !== undefined ? value : (defaultValue || "");
  });

  // Keep internalValue in sync with controlled value prop if it changes
  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    if (value !== undefined) {
      setInternalValue(value);
    }
  }

  // Initialize innerHTML once on mount, or when controlled value changes from outside
  useEffect(() => {
    const el = editableRef.current;
    if (!el) return;

    if (value !== undefined) {
      const targetHtml = markdownToHtml(value);
      if (htmlToMarkdown(el.innerHTML) !== value) {
        el.innerHTML = targetHtml;
      }
    } else if (!isInitialized.current) {
      el.innerHTML = markdownToHtml((defaultValue || "") as string);
      isInitialized.current = true;
    }
  }, [value, defaultValue]);

  const handleInput = () => {
    const el = editableRef.current;
    if (!el) return;

    const html = el.innerHTML;
    const markdown = htmlToMarkdown(html);

    setInternalValue(markdown);

    if (onChange) {
      onChange({
        target: { value: markdown, name },
        currentTarget: { value: markdown, name },
        type: "change",
      } as unknown as React.ChangeEvent<HTMLTextAreaElement>);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const isBKey =
      event.key.toLowerCase() === "b" ||
      event.keyCode === 66 ||
      event.which === 66;
    if ((event.ctrlKey || event.metaKey) && isBKey) {
      event.preventDefault();
      // Trigger native bold formatting in contentEditable
      document.execCommand("bold", false);
      handleInput();
      return;
    }

    if (onKeyDown) {
      // Cast the div keyboard event to textarea keyboard event for parent compatibility
      onKeyDown(event as unknown as React.KeyboardEvent<HTMLTextAreaElement>);
    }
  };

  const currentText = value !== undefined ? value : internalValue;
  const isEmpty = !currentText || currentText === "";

  // Extract classes to mirror the text style (font size, height, alignment) to the placeholder
  const placeholderClassName = className
    ? className
        .replace(/text-zinc-\d+/g, "")
        .replace(/text-zinc-50/g, "")
        .replace(/text-zinc-100/g, "")
        .replace(/text-zinc-200/g, "")
        .replace(/text-zinc-300/g, "")
        .replace(/text-zinc-400/g, "")
        .replace(/text-zinc-500/g, "")
        .replace(/text-zinc-600/g, "")
        .replace(/text-zinc-700/g, "") +
      " text-zinc-700 pointer-events-none absolute left-0 top-1"
    : "text-zinc-700 pointer-events-none absolute left-0 top-1";

  return (
    <div className="relative w-full">
      {isEmpty && <div className={placeholderClassName}>{placeholder}</div>}
      <div
        ref={editableRef}
        contentEditable
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        className={`${className ?? ""} outline-none min-h-[40px] whitespace-pre-wrap break-words`}
        {...(props as unknown as React.HTMLAttributes<HTMLDivElement>)}
      />
      {/* Hidden textarea to submit the value in standard HTML form submissions */}
      {name && (
        <textarea
          name={name}
          value={currentText}
          readOnly
          required={required}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
