import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { NoteImageView } from "../components/NoteImageView";

export interface NoteImageOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    noteImage: {
      setNoteImage: (options: {
        src: string;
        alt?: string;
        width?: string;
        align?: "left" | "center" | "right";
        isLoading?: boolean;
      }) => ReturnType;
    };
  }
}

export const NoteImage = Node.create<NoteImageOptions>({
  name: "noteImage",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      src: {
        default: "",
        parseHTML: (element) => element.getAttribute("src") ?? "",
        renderHTML: (attributes) => ({ src: attributes.src }),
      },
      alt: {
        default: "",
        parseHTML: (element) => element.getAttribute("alt") ?? "",
        renderHTML: (attributes) => ({ alt: attributes.alt }),
      },
      width: {
        default: "65%",
        parseHTML: (element) => element.getAttribute("data-width") ?? "65%",
        renderHTML: (attributes) => ({ "data-width": attributes.width }),
      },
      align: {
        default: "center",
        parseHTML: (element) => element.getAttribute("data-align") ?? "center",
        renderHTML: (attributes) => ({ "data-align": attributes.align }),
      },
      isLoading: {
        default: false,
      },
    };
  },

  parseHTML() {
    return [
      { tag: "div[data-type='note-image']" },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { "data-type": "note-image" })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(NoteImageView);
  },

  addCommands() {
    return {
      setNoteImage:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },
});
