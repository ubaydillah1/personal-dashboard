"use client";

import { useLayoutEffect, useRef } from "react";

type AutoResizeTextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export function AutoResizeTextarea({ value, defaultValue, onChange, className, ...props }: AutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function resize() {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }

  useLayoutEffect(() => {
    resize();
  }, [value, defaultValue]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      defaultValue={defaultValue}
      onChange={(event) => {
        resize();
        onChange?.(event);
      }}
      className={`${className ?? ""} overflow-hidden`}
      rows={1}
      {...props}
    />
  );
}
