import type { Metadata } from "next";
import { BlogImageLibrary } from "@/features/blogs/components/BlogImageLibrary";
import { blogsService } from "@/features/blogs/service";

export const metadata: Metadata = {
  title: "Blog Images",
  description: "Upload and copy public blog image URLs.",
};

export default async function BlogImagesPage() {
  const images = await blogsService.getBlogImages();
  return <BlogImageLibrary images={images} />;
}
