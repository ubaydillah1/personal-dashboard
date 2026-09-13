import type { Metadata } from "next";
import { BlogImagesClientView } from "@/features/blogs/components/BlogImagesClientView";

export const metadata: Metadata = {
  title: "Blog Images",
  description: "Upload and copy public blog image URLs.",
};

export default function BlogImagesPage() {
  return <BlogImagesClientView />;
}
