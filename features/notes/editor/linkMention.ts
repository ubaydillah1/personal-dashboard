import { mergeAttributes, Node } from "@tiptap/core";

export const LinkMention = Node.create({
  name: "linkMention",
  group: "inline",
  inline: true,
  atom: true,

  addAttributes() {
    return {
      href: { default: "" },
      label: { default: "" },
      kind: { default: "link" },
    };
  },

  parseHTML() {
    return [{ tag: "a[data-link-mention]" }];
  },

  renderHTML({ HTMLAttributes }) {
    const isYoutube = HTMLAttributes.kind === "youtube";
    const label = HTMLAttributes.label || HTMLAttributes.href;

    return [
      "a",
      mergeAttributes(HTMLAttributes, {
        "data-link-mention": "true",
        href: HTMLAttributes.href,
        target: "_blank",
        rel: "noreferrer",
        class:
          "inline-flex items-center rounded-md border border-zinc-700 bg-zinc-900 px-2 py-0.5 font-semibold text-zinc-100 no-underline hover:bg-zinc-800",
      }),
      [
        "span",
        {
          class: isYoutube
            ? "mr-1.5 inline-flex size-5 items-center justify-center rounded bg-red-600 text-white"
            : "mr-1.5 inline-flex size-5 items-center justify-center rounded bg-zinc-800 text-emerald-300",
        },
        isYoutube ? ["span", { class: "ml-0.5 h-0 w-0 border-y-[4px] border-l-[7px] border-y-transparent border-l-white" }] : "L",
      ],
      ["span", {}, label],
    ];
  },
});
