import type { JSONContent } from "@tiptap/react";
import type { DraftBlock } from "./types";
import { findFirstLinkPreview } from "./link";

function textNode(text: string): JSONContent {
  return { type: "text", text };
}

function linkMentionNode(url: string, label: string): JSONContent {
  const preview = findFirstLinkPreview(url);

  return {
    type: "linkMention",
    attrs: {
      href: url,
      label,
      kind: preview?.kind ?? "link",
    },
  };
}

function inlineContentFromBlock(block: DraftBlock): JSONContent[] {
  const url = typeof block.metadata.url === "string" ? block.metadata.url : null;
  const label =
    typeof block.metadata.label === "string" ? block.metadata.label : block.content.trim();

  if (!url) return block.content ? [textNode(block.content)] : [];

  const suffix = block.content.startsWith(label) ? block.content.slice(label.length).trimStart() : "";
  return suffix ? [linkMentionNode(url, label), textNode(` ${suffix}`)] : [linkMentionNode(url, label)];
}

function paragraph(content: JSONContent[] = []): JSONContent {
  return { type: "paragraph", content };
}

function bullet(content: JSONContent[] = []): JSONContent {
  return {
    type: "bulletList",
    content: [{ type: "listItem", content: [paragraph(content)] }],
  };
}

export function draftBlocksToTiptapDoc(blocks: DraftBlock[]): JSONContent {
  const content = (blocks.length > 0 ? blocks : [{ content: "", type: "bullet", metadata: {} } as DraftBlock]).map(
    (block) => (block.type === "bullet" ? bullet(inlineContentFromBlock(block)) : paragraph(inlineContentFromBlock(block))),
  );

  return { type: "doc", content };
}

function serializeInline(nodes: JSONContent[] = []) {
  let content = "";
  let metadata: Record<string, unknown> = {};

  for (const node of nodes) {
    if (node.type === "text") {
      content += node.text ?? "";
      continue;
    }

    if (node.type === "linkMention") {
      const label = String(node.attrs?.label ?? node.attrs?.href ?? "");
      const href = String(node.attrs?.href ?? "");
      content += label;
      metadata = { ...metadata, url: href, label };
      continue;
    }
  }

  return { content, metadata };
}

function blockFromParagraph(node: JSONContent, position: number): DraftBlock {
  const serialized = serializeInline(node.content);
  return {
    id: crypto.randomUUID(),
    type: serialized.metadata.url ? "link" : "text",
    content: serialized.content,
    position,
    metadata: serialized.metadata,
  };
}

function blockFromListItem(item: JSONContent, position: number): DraftBlock {
  const paragraphNode = item.content?.find((node) => node.type === "paragraph");
  const serialized = serializeInline(paragraphNode?.content);
  return {
    id: crypto.randomUUID(),
    type: "bullet",
    content: serialized.content,
    position,
    metadata: serialized.metadata,
  };
}

export function tiptapDocToDraftBlocks(doc: JSONContent): DraftBlock[] {
  const blocks: DraftBlock[] = [];

  for (const node of doc.content ?? []) {
    if (node.type === "paragraph") {
      blocks.push(blockFromParagraph(node, blocks.length));
      continue;
    }

    if (node.type === "bulletList") {
      for (const item of node.content ?? []) {
        blocks.push(blockFromListItem(item, blocks.length));
      }
    }
  }

  return blocks.length > 0 ? blocks : [{ id: crypto.randomUUID(), type: "bullet", content: "", position: 0, metadata: {} }];
}
