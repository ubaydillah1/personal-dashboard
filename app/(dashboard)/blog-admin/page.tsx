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
  searchParams: Promise<{ post?: string }>;
}) {
  const { post } = await searchParams;
  const blogs = await blogsService.getAdminBlogs();
  return <BlogManager blogs={blogs} initialSelectedBlogId={post} />;
}
