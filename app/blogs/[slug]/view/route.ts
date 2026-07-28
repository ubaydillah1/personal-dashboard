import { NextResponse } from "next/server";
import { blogsService } from "@/features/blogs/service";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  try {
    const viewCount = await blogsService.recordPublishedBlogView(slug);
    if (viewCount === null) {
      return NextResponse.json({ error: "Blog not found." }, { status: 404, headers: corsHeaders });
    }

    return NextResponse.json({ slug, viewCount }, { headers: corsHeaders });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to record blog view." },
      { status: 500, headers: corsHeaders },
    );
  }
}
