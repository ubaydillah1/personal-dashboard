"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CopyImageUrlButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function copyUrl() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  return (
    <Button type="button" variant="secondary" size="sm" className="gap-2" onClick={copyUrl}>
      <Copy className="size-4" />
      {copied ? "Copied" : "Copy URL"}
    </Button>
  );
}
