import type { Metadata } from "next";
import { BlogManager } from "@/features/blogs/components/BlogManager";
import { blogsService } from "@/features/blogs/service";

export const metadata: Metadata = {
  title: "Blog Admin",
  description: "Create and publish blog content.",
};

export default async function BlogAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ post?: string; lang?: string }>;
}) {
  const { post, lang } = await searchParams;
  const blogs = await blogsService.getAdminBlogs();
  const initialLanguage = (lang === "en" || lang === "id") ? lang : "id";
  return <BlogManager blogs={blogs} initialSelectedBlogId={post} initialLanguage={initialLanguage} />;
}
