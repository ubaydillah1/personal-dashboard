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
    const body = await _request.json().catch(() => null);
    const visitorId = typeof body?.visitorId === "string" ? body.visitorId.trim() : "";

    if (visitorId.length < 16 || visitorId.length > 256) {
      return NextResponse.json(
        { error: "visitorId is required and must be 16-256 characters." },
        { status: 400, headers: corsHeaders },
      );
    }

    const result = await blogsService.recordPublishedBlogView(slug, visitorId);
    if (!result) {
      return NextResponse.json({ error: "Blog not found." }, { status: 404, headers: corsHeaders });
    }

    return NextResponse.json({ slug, ...result }, { headers: corsHeaders });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to record blog view." },
      { status: 500, headers: corsHeaders },
    );
  }
}
