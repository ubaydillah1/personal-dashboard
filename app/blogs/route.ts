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

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = Number(url.searchParams.get("limit") ?? 10);
  const cursor = Number(url.searchParams.get("cursor") ?? 0);
  const search = url.searchParams.get("search") ?? undefined;
  const tag = url.searchParams.get("tag") ?? undefined;
  const lang = url.searchParams.get("lang") ?? undefined;

  try {
    const result = await blogsService.getPublishedBlogs(limit, cursor, search, tag, lang);
    return NextResponse.json(result, { headers: corsHeaders });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch blogs." },
      { status: 500, headers: corsHeaders },
    );
  }
}
