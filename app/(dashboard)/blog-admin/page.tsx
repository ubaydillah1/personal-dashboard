import type { Metadata } from "next";
import { BlogAdminClientView } from "@/features/blogs/components/BlogAdminClientView";

export const metadata: Metadata = {
  title: "Blog Admin",
  description: "Create and publish blog content.",
};

export default function BlogAdminPage() {
  return <BlogAdminClientView />;
}
