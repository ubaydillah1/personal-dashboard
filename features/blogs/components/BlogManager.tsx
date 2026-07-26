"use client";

import { useState, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileText, Plus, Save, Trash2, Eye, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Blog } from "../types";
import { deleteBlogAction, saveBlogAction } from "../actions";
import { BlogBlockEditor } from "./BlogBlockEditor";
import { BlogContentPreview } from "./BlogContentPreview";
import { BlogDetailsForm } from "./BlogDetailsForm";
import { BlogTagField } from "./BlogTagField";
import { AutoResizeTextarea } from "./AutoResizeTextarea";

type SaveBlogState = Awaited<ReturnType<typeof saveBlogAction>>;

function getTagsValue(blog: Blog | null) {
  return blog?.tags.join(", ") ?? "";
}

function getContentValue(blog: Blog | null) {
  return blog?.content ?? [];
}

export function BlogManager({
  blogs,
  initialSelectedBlogId,
  initialLanguage = "id",
}: {
  blogs: Blog[];
  initialSelectedBlogId?: string;
  initialLanguage?: "id" | "en";
}) {
  const router = useRouter();
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(
    blogs.find((blog) => blog.id === initialSelectedBlogId) ?? null,
  );
  const [state, formAction, isPending] = useActionState<SaveBlogState, FormData>(saveBlogAction, {
    success: false,
  });
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState<"id" | "en">(initialLanguage);

  useEffect(() => {
    setActiveLanguage(initialLanguage);
  }, [initialLanguage]);

  // Synchronize selectedBlog state if initialSelectedBlogId props changes or list updates
  useEffect(() => {
    setSelectedBlog(blogs.find((blog) => blog.id === initialSelectedBlogId) ?? null);
  }, [initialSelectedBlogId, blogs]);

  function selectBlog(blog: Blog | null) {
    setSelectedBlog(blog);
    setIsPreviewMode(false);
    setActiveLanguage("id");
    if (blog) {
      router.push(`/blog-admin?post=${blog.id}&lang=id`);
    } else {
      router.push(`/blog-admin`);
    }
  }

  function selectLanguage(lang: "id" | "en") {
    setActiveLanguage(lang);
    if (selectedBlog) {
      router.push(`/blog-admin?post=${selectedBlog.id}&lang=${lang}`);
    }
  }

  return (
    <div className="grid min-w-0 gap-4 xl:grid-cols-[300px_minmax(0,1fr)]">
      <aside className="rounded-lg border border-zinc-800 bg-zinc-900 p-3">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold text-zinc-50">Blog</h1>
            <p className="text-xs text-zinc-500">{blogs.length} posts</p>
          </div>
          <Button type="button" size="icon-sm" title="New blog" onClick={() => selectBlog(null)}>
            <Plus className="size-4" />
          </Button>
        </div>

        <div className="grid max-h-[calc(100vh-9rem)] min-w-0 gap-2 overflow-y-auto overflow-x-hidden pr-1 notes-scrollbar">
          {blogs.map((blog) => (
            <button
              key={blog.id}
              type="button"
              onClick={() => selectBlog(blog)}
              className={`min-w-0 rounded-lg border p-3 text-left transition ${
                selectedBlog?.id === blog.id
                  ? "border-sky-400 bg-sky-400/10"
                  : "border-zinc-800 bg-zinc-950 hover:border-zinc-700"
              }`}
            >
              <div className="flex min-w-0 items-start gap-2">
                <FileText className="mt-0.5 size-4 shrink-0 text-zinc-500" />
                <div className="min-w-0">
                  <p className="max-w-full truncate text-sm font-medium text-zinc-100">{blog.title}</p>
                  <p className="mt-1 max-w-full truncate text-xs text-zinc-500">/{blog.slug}</p>
                </div>
              </div>
              <span className="mt-3 inline-flex rounded bg-zinc-800 px-2 py-1 text-[11px] text-zinc-300">
                {blog.status}
              </span>
            </button>
          ))}
        </div>
      </aside>

      <div className="grid min-w-0 gap-4">
        <form key={selectedBlog?.id ?? "new"} action={formAction} className={selectedBlog ? "min-w-0" : "rounded-lg border border-zinc-800 bg-zinc-900 p-4"}>
          <input type="hidden" name="id" value={selectedBlog?.id ?? ""} />
          <div className={selectedBlog ? "fixed right-6 top-6 z-40 flex gap-2" : "mb-4 flex flex-wrap items-center justify-between gap-3"}>
            <div>
              {selectedBlog ? null : (
                <>
                  <h2 className="text-xl font-semibold text-zinc-50">New post details</h2>
                  <p className="text-xs text-zinc-500">Save this first, then edit the article canvas.</p>
                </>
              )}
            </div>
            <div className="flex gap-2">
              {selectedBlog ? (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsPreviewMode(!isPreviewMode)} 
                  className="gap-2 border-zinc-700 bg-zinc-800 text-zinc-100 hover:bg-zinc-700 hover:text-white"
                >
                  {isPreviewMode ? <Edit3 className="size-4" /> : <Eye className="size-4" />}
                  {isPreviewMode ? "Edit" : "Preview"}
                </Button>
              ) : null}
              <Button type="submit" disabled={isPending} className="gap-2">
                <Save className="size-4" />
                {isPending ? "Saving" : "Save"}
              </Button>
            </div>
          </div>

          {state.error ? (
            <p className="mb-3 rounded-md border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-200">
              {state.error}
            </p>
          ) : null}
          {state.success ? (
            <p className="mb-3 rounded-md border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-200">
              Saved.
            </p>
          ) : null}

          {!selectedBlog ? (
            <div className="grid gap-3 md:grid-cols-2">
              <input type="hidden" name="content" value="[]" />
              <input type="hidden" name="contentEn" value="[]" />
              <BlogDetailsForm blog={null} />
              <label className="grid gap-1 text-xs font-medium text-zinc-400 md:col-span-2">
                Excerpt
                <textarea
                  name="excerpt"
                  className="min-h-20 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-sky-400"
                  required
                />
              </label>
              <label className="grid gap-1 text-xs font-medium text-zinc-400 md:col-span-2">
                Cover URL
                <input
                  name="coverImage"
                  className="h-10 rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-sky-400"
                  placeholder="https://..."
                />
              </label>
              <label className="grid gap-1 text-xs font-medium text-zinc-400">
                Tags
                <BlogTagField />
              </label>
              <label className="grid gap-1 text-xs font-medium text-zinc-400">
                Reading Time
                <input
                  name="readingTime"
                  defaultValue="5 min read"
                  className="h-10 rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-sky-400"
                  required
                />
              </label>
              <label className="grid gap-1 text-xs font-medium text-zinc-400">
                Status
                <select
                  name="status"
                  defaultValue="draft"
                  className="h-10 rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-sky-400"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </label>
            </div>
          ) : null}

          {selectedBlog ? (
            <article className="min-h-screen bg-black px-4 pb-24 pt-10 text-zinc-100 md:px-8">
              <div className="mx-auto max-w-[890px]">
                <button
                  type="button"
                  className="mb-11 inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-zinc-200"
                  onClick={() => selectBlog(null)}
                >
                  <ArrowLeft className="size-4" />
                  Back to blog
                </button>

                {isPreviewMode ? (
                  <div className="mb-8 grid gap-5">
                    <div className="blog-heading-font flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
                      <span>
                        {selectedBlog.publishedAt 
                          ? new Date(selectedBlog.publishedAt).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) 
                          : new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}
                      </span>
                      <span>{selectedBlog.readingTime}</span>
                    </div>

                    <h1 className="blog-heading-font text-6xl font-semibold leading-tight text-zinc-100 max-md:text-4xl">
                      {selectedBlog.title}
                    </h1>

                    <p className="blog-body-font text-2xl leading-9 text-zinc-400">
                      {selectedBlog.excerpt}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {selectedBlog.tags.map((tag) => (
                        <span key={tag} className="inline-flex rounded-md bg-zinc-900 px-2.5 py-1 text-xs font-medium text-zinc-300">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mb-8 grid gap-5">
                    <div className="blog-heading-font flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
                      <span>{selectedBlog.publishedAt ? new Date(selectedBlog.publishedAt).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "Draft"}</span>
                      <input
                        name="readingTime"
                        defaultValue={selectedBlog.readingTime}
                        className="w-32 border border-transparent bg-transparent uppercase outline-none focus:border-zinc-800 focus:bg-zinc-950"
                        required
                      />
                      <select
                        name="status"
                        defaultValue={selectedBlog.status}
                        className="border border-zinc-800 bg-black px-2 py-1 text-[11px] text-zinc-400 outline-none mr-2"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => selectLanguage("id")}
                        className={`border px-2.5 py-0.5 text-[10px] uppercase font-bold outline-none transition ${
                          activeLanguage === "id"
                            ? "border-sky-400 bg-sky-400/10 text-sky-400"
                            : "border-zinc-800 bg-zinc-950 text-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        ID
                      </button>
                      <button
                        type="button"
                        onClick={() => selectLanguage("en")}
                        className={`border px-2.5 py-0.5 text-[10px] uppercase font-bold outline-none transition ${
                          activeLanguage === "en"
                            ? "border-sky-400 bg-sky-400/10 text-sky-400"
                            : "border-zinc-800 bg-zinc-950 text-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        EN
                      </button>
                    </div>

                    <div className={activeLanguage === "id" ? "grid gap-5" : "hidden"}>
                      <AutoResizeTextarea
                        name="title"
                        defaultValue={selectedBlog.title}
                        className="blog-heading-font min-h-28 w-full resize-none border border-transparent bg-transparent text-6xl font-semibold leading-tight text-zinc-100 outline-none focus:border-zinc-900 focus:bg-zinc-950 max-md:text-4xl"
                        required={activeLanguage === "id"}
                      />
                      <AutoResizeTextarea
                        name="excerpt"
                        defaultValue={selectedBlog.excerpt}
                        className="blog-body-font min-h-16 w-full resize-none border border-transparent bg-transparent text-2xl leading-9 text-zinc-400 outline-none focus:border-zinc-900 focus:bg-zinc-950"
                        required={activeLanguage === "id"}
                      />
                    </div>

                    <div className={activeLanguage === "en" ? "grid gap-5" : "hidden"}>
                      <AutoResizeTextarea
                        name="titleEn"
                        defaultValue={selectedBlog.titleEn ?? ""}
                        className="blog-heading-font min-h-28 w-full resize-none border border-transparent bg-transparent text-6xl font-semibold leading-tight text-zinc-100 outline-none focus:border-zinc-900 focus:bg-zinc-950 max-md:text-4xl"
                        placeholder="English Title (Optional)"
                      />
                      <AutoResizeTextarea
                        name="excerptEn"
                        defaultValue={selectedBlog.excerptEn ?? ""}
                        className="blog-body-font min-h-16 w-full resize-none border border-transparent bg-transparent text-2xl leading-9 text-zinc-400 outline-none focus:border-zinc-900 focus:bg-zinc-950"
                        placeholder="English Excerpt (Optional)"
                      />
                    </div>

                    <input type="hidden" name="slug" value={selectedBlog.slug} />

                    <BlogTagField defaultValue={getTagsValue(selectedBlog)} compact />

                    <input
                      name="coverImage"
                      defaultValue={selectedBlog.coverImage ?? ""}
                      className="h-10 w-full rounded-md border border-zinc-900 bg-zinc-950 px-3 text-sm text-zinc-400 outline-none focus:border-zinc-700"
                      placeholder="Cover image URL"
                    />
                  </div>
                )}

                {selectedBlog.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selectedBlog.coverImage}
                    alt=""
                    className="mb-14 h-[480px] w-full rounded-2xl object-cover"
                  />
                ) : null}

                {!isPreviewMode ? (
                  <>
                    <div className={activeLanguage === "id" ? "block" : "hidden"}>
                      <BlogBlockEditor key={`${selectedBlog.id}-id`} name="content" initialContent={getContentValue(selectedBlog)} />
                    </div>
                    <div className={activeLanguage === "en" ? "block" : "hidden"}>
                      <BlogBlockEditor key={`${selectedBlog.id}-en`} name="contentEn" initialContent={selectedBlog.contentEn ?? []} />
                    </div>
                  </>
                ) : (
                  <BlogContentPreview
                    content={
                      activeLanguage === "id"
                        ? getContentValue(selectedBlog)
                        : (selectedBlog.contentEn ?? [])
                    }
                  />
                )}
              </div>
            </article>
          ) : null}
        </form>
        {selectedBlog ? (
          <form action={deleteBlogAction} className="fixed right-6 top-16 z-40">
            <input type="hidden" name="id" value={selectedBlog.id} />
            <Button type="submit" variant="destructive" size="icon" title="Delete blog">
              <Trash2 className="size-4" />
            </Button>
          </form>
        ) : null}
      </div>
    </div>
  );
}
