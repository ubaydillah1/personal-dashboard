import { NextResponse } from "next/server";
import { blogsService } from "@/features/blogs/service";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  try {
    const blog = await blogsService.getPublishedBlog(slug);
    if (!blog) {
      return NextResponse.json({ error: "Blog not found." }, { status: 404 });
    }

    return NextResponse.json(blog);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch blog." },
      { status: 500 },
    );
  }
}
