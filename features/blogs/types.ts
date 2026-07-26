export type BlogStatus = "draft" | "published";

export type BlogContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; level: 1 | 2 | 3 | 4; text: string }
  | { type: "image"; src: string; alt: string; caption?: string }
  | { type: "gallery"; items: Array<{ src: string; alt: string }> }
  | { type: "quote"; text: string }
  | { type: "code"; code: string }
  | { type: "list"; style: "ordered" | "unordered"; items: string[] }
  | { type: "callout"; title: string; text: string }
  | { type: "link"; href: string; label: string };

export type Blog = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string | null;
  status: BlogStatus;
  tags: string[];
  readingTime: string;
  content: BlogContentBlock[];
  titleEn: string | null;
  excerptEn: string | null;
  contentEn: BlogContentBlock[];
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PublicBlog = Omit<Blog, "status" | "createdAt"> & {
  coverImage: string;
  publishedAt: string;
};

export type BlogListResult = {
  data: PublicBlog[];
  pagination: {
    limit: number;
    nextCursor: string | null;
    hasMore: boolean;
  };
};

export type SaveBlogInput = {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage?: string | null;
  status: BlogStatus;
  tags: string[];
  readingTime: string;
  content: BlogContentBlock[];
  titleEn?: string | null;
  excerptEn?: string | null;
  contentEn?: BlogContentBlock[];
};

export type BlogImageAsset = {
  name: string;
  path: string;
  publicUrl: string;
  updatedAt: string | null;
};
