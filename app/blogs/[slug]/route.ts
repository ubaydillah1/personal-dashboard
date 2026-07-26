import { NextResponse } from "next/server";
import { blogsService } from "@/features/blogs/service";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const url = new URL(request.url);
  const lang = url.searchParams.get("lang") ?? undefined;

  try {
    const blog = await blogsService.getPublishedBlog(slug, lang);
    if (!blog) {
      return NextResponse.json({ error: "Blog not found." }, { status: 404, headers: corsHeaders });
    }

    return NextResponse.json(blog, { headers: corsHeaders });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch blog." },
      { status: 500, headers: corsHeaders },
    );
  }
}
