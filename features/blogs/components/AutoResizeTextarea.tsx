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

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "b") {
      event.preventDefault();
      
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;

      const selectedText = text.substring(start, end);
      const newText = text.substring(0, start) + `**${selectedText}**` + text.substring(end);

      // React controlled inputs value setter bypass
      const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(
        HTMLTextAreaElement.prototype,
        "value"
      )?.set;

      if (nativeTextAreaValueSetter) {
        nativeTextAreaValueSetter.call(textarea, newText);
        const inputEvent = new Event("input", { bubbles: true });
        textarea.dispatchEvent(inputEvent);
      } else {
        textarea.value = newText;
        if (onChange) {
          onChange({
            ...event,
            currentTarget: textarea,
            target: textarea,
          } as unknown as React.ChangeEvent<HTMLTextAreaElement>);
        }
      }

      // Restore selection inside the newly added asterisks
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + 2, end + 2);
      }, 0);
    }

    props.onKeyDown?.(event);
  };

  return (
    <textarea
      ref={textareaRef}
      value={value}
      defaultValue={defaultValue}
      onChange={(event) => {
        resize();
        onChange?.(event);
      }}
      onKeyDown={handleKeyDown}
      className={`${className ?? ""} overflow-hidden`}
      rows={1}
      {...props}
    />
  );
}
