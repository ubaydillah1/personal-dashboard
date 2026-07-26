import { NextResponse } from "next/server";
import { blogsService } from "@/features/blogs/service";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = Number(url.searchParams.get("limit") ?? 10);
  const cursor = Number(url.searchParams.get("cursor") ?? 0);

  try {
    const result = await blogsService.getPublishedBlogs(limit, cursor);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch blogs." },
      { status: 500 },
    );
  }
}
