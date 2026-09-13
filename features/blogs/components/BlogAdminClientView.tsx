"use client";

import { useSearchParams } from "next/navigation";
import { useAdminBlogs } from "../hooks";
import { BlogManager } from "./BlogManager";
import { BlogAdminLoading } from "./BlogAdminLoading";

export function BlogAdminClientView() {
  const searchParams = useSearchParams();
  const post = searchParams.get("post") || undefined;
  const lang = searchParams.get("lang");
  const initialLanguage = lang === "en" || lang === "id" ? lang : "id";

  const { data: blogs = [], isLoading } = useAdminBlogs();

  // Pola isInitialLoading: Skeleton hanya muncul saat cache benar-benar kosong di awal
  const isInitialLoading = isLoading && blogs.length === 0;

  if (isInitialLoading) {
    return <BlogAdminLoading />;
  }

  return (
    <BlogManager
      blogs={blogs}
      initialSelectedBlogId={post}
      initialLanguage={initialLanguage}
    />
  );
}
