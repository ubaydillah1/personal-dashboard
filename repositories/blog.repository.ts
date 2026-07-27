import type {
  Blog,
  BlogContentBlock,
  BlogImageAsset,
  BlogListResult,
  BlogStatus,
  PublicBlog,
  SaveBlogInput,
} from "@/features/blogs/types";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const BLOG_BUCKET = "blog-images";

type BlogRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  cover_image: string | null;
  status: BlogStatus;
  tags: string[] | null;
  reading_time: string | null;
  content: BlogContentBlock[] | null;
  title_en: string | null;
  excerpt_en: string | null;
  content_en: BlogContentBlock[] | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

function normalizeContent(content: BlogContentBlock[] | null) {
  return Array.isArray(content) ? content : [];
}

function mapBlog(row: BlogRow): Blog {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    coverImage: row.cover_image,
    status: row.status,
    tags: row.tags ?? [],
    readingTime: row.reading_time ?? "1 min read",
    content: normalizeContent(row.content),
    titleEn: row.title_en,
    excerptEn: row.excerpt_en,
    contentEn: normalizeContent(row.content_en),
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapPublicBlog(row: BlogRow, includeContent: boolean, lang?: string): PublicBlog {
  const isEn = lang === "en";
  const resolvedTitle = (isEn && row.title_en) ? row.title_en : row.title;
  const resolvedExcerpt = (isEn && row.excerpt_en) ? row.excerpt_en : row.excerpt;
  const rawContent = isEn ? (row.content_en ?? row.content) : row.content;

  return {
    id: row.id,
    slug: row.slug,
    title: resolvedTitle,
    excerpt: resolvedExcerpt,
    coverImage: row.cover_image ?? "",
    tags: row.tags ?? [],
    readingTime: row.reading_time ?? "1 min read",
    content: includeContent ? normalizeContent(rawContent) : [],
    titleEn: row.title_en,
    excerptEn: row.excerpt_en,
    contentEn: normalizeContent(row.content_en),
    publishedAt: row.published_at ?? row.updated_at,
    updatedAt: row.updated_at,
  };
}

function toRow(input: SaveBlogInput) {
  const now = new Date().toISOString();
  return {
    slug: input.slug,
    title: input.title,
    excerpt: input.excerpt,
    cover_image: input.coverImage || null,
    status: input.status,
    tags: input.tags,
    reading_time: input.readingTime,
    content: input.content,
    title_en: input.titleEn || null,
    excerpt_en: input.excerptEn || null,
    content_en: input.contentEn || [],
    published_at: input.status === "published" ? now : null,
  };
}

export const blogRepository = {
  async findAdminList(): Promise<Blog[]> {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("blogs")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) throw new Error(`Failed to fetch blogs: ${error.message}`);
    return (data ?? []).map((row) => mapBlog(row as BlogRow));
  },

  async findPublishedList(limit: number, cursor: number, search?: string, tag?: string, lang?: string): Promise<BlogListResult> {
    const supabase = getSupabaseServerClient();
    const safeLimit = Math.min(Math.max(limit, 1), 50);
    const safeCursor = Math.max(cursor, 0);

    let query = supabase
      .from("blogs")
      .select("id,slug,title,excerpt,cover_image,status,tags,reading_time,content,title_en,excerpt_en,content_en,published_at,created_at,updated_at")
      .eq("status", "published");

    if (search && search.trim()) {
      query = query.ilike("title", `%${search.trim()}%`);
    }

    if (tag && tag.trim()) {
      query = query.contains("tags", [tag.trim()]);
    }

    const { data, error } = await query
      .order("published_at", { ascending: false })
      .order("id", { ascending: false })
      .range(safeCursor, safeCursor + safeLimit);

    if (error) throw new Error(`Failed to fetch published blogs: ${error.message}`);

    const rows = (data ?? []) as BlogRow[];
    const pageRows = rows.slice(0, safeLimit);
    const hasMore = rows.length > safeLimit;

    return {
      data: pageRows.map((row) => mapPublicBlog(row, false, lang)),
      pagination: {
        limit: safeLimit,
        nextCursor: hasMore ? String(safeCursor + safeLimit) : null,
        hasMore,
      },
    };
  },

  async findPublishedBySlug(slug: string, lang?: string): Promise<PublicBlog | null> {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("blogs")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

    if (error) throw new Error(`Failed to fetch blog: ${error.message}`);
    return data ? mapPublicBlog(data as BlogRow, true, lang) : null;
  },

  async findPublishedTags(): Promise<string[]> {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("blogs")
      .select("tags")
      .eq("status", "published");

    if (error) throw new Error(`Failed to fetch published tags: ${error.message}`);

    const tagCounts: Record<string, number> = {};
    (data ?? []).forEach((row) => {
      if (Array.isArray(row.tags)) {
        row.tags.forEach((tag) => {
          if (tag) {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          }
        });
      }
    });

    const sortedTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([tag]) => tag);

    return sortedTags;
  },

  async create(input: SaveBlogInput): Promise<Blog> {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase.from("blogs").insert(toRow(input)).select("*").single();

    if (error) throw new Error(`Failed to create blog: ${error.message}`);
    return mapBlog(data as BlogRow);
  },

  async update(input: SaveBlogInput & { id: string }): Promise<Blog> {
    const supabase = getSupabaseServerClient();
    const row = toRow(input);
    const { data, error } = await supabase.from("blogs").update(row).eq("id", input.id).select("*").single();

    if (error) throw new Error(`Failed to update blog: ${error.message}`);
    return mapBlog(data as BlogRow);
  },

  async delete(id: string): Promise<void> {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase.from("blogs").delete().eq("id", id);

    if (error) throw new Error(`Failed to delete blog: ${error.message}`);
  },

  async uploadCover(blogId: string, file: File): Promise<string> {
    const supabase = getSupabaseServerClient();
    const extension = file.name.split(".").pop()?.toLowerCase() || "webp";
    const path = `${blogId}/cover-${Date.now()}.${extension}`;
    const bytes = await file.arrayBuffer();

    const { error } = await supabase.storage.from(BLOG_BUCKET).upload(path, bytes, {
      contentType: file.type || "image/webp",
      upsert: true,
    });

    if (error) throw new Error(`Failed to upload blog cover: ${error.message}`);

    const { data } = supabase.storage.from(BLOG_BUCKET).getPublicUrl(path);
    return data.publicUrl;
  },

  async setCoverImage(id: string, coverImage: string): Promise<Blog> {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase.from("blogs").update({ cover_image: coverImage }).eq("id", id).select("*").single();

    if (error) throw new Error(`Failed to update blog cover: ${error.message}`);
    return mapBlog(data as BlogRow);
  },

  async listImages(): Promise<BlogImageAsset[]> {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase.storage.from(BLOG_BUCKET).list("", {
      limit: 500,
      sortBy: { column: "updated_at", order: "desc" },
    });

    if (error) throw new Error(`Failed to fetch blog images: ${error.message}`);

    return (data ?? [])
      .filter((item) => item.name && !item.name.endsWith("/"))
      .map((item) => {
        const { data: publicData } = supabase.storage.from(BLOG_BUCKET).getPublicUrl(item.name);
        return {
          name: item.name,
          path: item.name,
          publicUrl: publicData.publicUrl,
          updatedAt: item.updated_at ?? item.created_at ?? null,
        };
      });
  },

  async uploadImage(file: File): Promise<string> {
    const supabase = getSupabaseServerClient();
    const extension = file.name.split(".").pop()?.toLowerCase() || "webp";
    const safeName = file.name
      .replace(/\.[^.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80);
    const path = `${Date.now()}-${safeName || "blog-image"}.${extension}`;
    const bytes = await file.arrayBuffer();

    const { error } = await supabase.storage.from(BLOG_BUCKET).upload(path, bytes, {
      contentType: file.type || "image/webp",
      upsert: false,
    });

    if (error) throw new Error(`Failed to upload blog image: ${error.message}`);

    const { data } = supabase.storage.from(BLOG_BUCKET).getPublicUrl(path);
    return data.publicUrl;
  },

  async deleteImage(path: string): Promise<void> {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase.storage.from(BLOG_BUCKET).remove([path]);
    if (error) throw new Error(`Failed to delete image: ${error.message}`);
  },
};
