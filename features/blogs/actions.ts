"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/jwt";
import { blogIdSchema, saveBlogSchema } from "@/validators/blog.schema";
import { blogsService } from "./service";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function getOptionalFile(formData: FormData, key: string) {
  const value = formData.get(key);
  return value instanceof File && value.size > 0 ? value : null;
}

function parseTags(value: string) {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function parseContent(value: string) {
  if (!value.trim()) return [];
  return JSON.parse(value);
}

export async function saveBlogAction(
  _state: { error?: string; success?: boolean },
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  await requireAuth();
  let savedBlogId: string;

  try {
    const parsed = saveBlogSchema.safeParse({
      id: getString(formData, "id") || undefined,
      slug: getString(formData, "slug"),
      title: getString(formData, "title"),
      excerpt: getString(formData, "excerpt"),
      coverImage: getString(formData, "coverImage"),
      status: getString(formData, "status"),
      tags: parseTags(getString(formData, "tags")),
      readingTime: getString(formData, "readingTime"),
      content: parseContent(getString(formData, "content")),
      titleEn: getString(formData, "titleEn") || undefined,
      excerptEn: getString(formData, "excerptEn") || undefined,
      contentEn: parseContent(getString(formData, "contentEn")),
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid blog payload." };
    }

    const blog = await blogsService.saveBlog(
      {
        ...parsed.data,
        coverImage: parsed.data.coverImage || null,
      },
      getOptionalFile(formData, "coverFile"),
    );
    savedBlogId = blog.id;

    revalidatePath("/blog-admin");
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save blog.",
    };
  }

  const activeLanguage = getString(formData, "activeLanguage") || "id";
  redirect(`/blog-admin?post=${savedBlogId}&lang=${activeLanguage}`);
}

export async function deleteBlogAction(formData: FormData) {
  await requireAuth();
  const parsed = blogIdSchema.safeParse({ id: getString(formData, "id") });

  if (!parsed.success) return;
  await blogsService.deleteBlog(parsed.data.id);
  revalidatePath("/blog-admin");
  redirect("/blog-admin");
}

export async function uploadBlogImageAction(
  _state: { error?: string; success?: boolean; publicUrl?: string } | null,
  formData: FormData,
): Promise<{ success: boolean; error?: string; publicUrl?: string }> {
  await requireAuth();

  try {
    const file = getOptionalFile(formData, "imageFile");
    if (!file) return { success: false, error: "Choose an image first." };

    const publicUrl = await blogsService.uploadBlogImage(file);
    revalidatePath("/blog-images");
    return { success: true, publicUrl };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to upload image.",
    };
  }
}

export async function deleteBlogImageAction(path: string) {
  await requireAuth();

  try {
    await blogsService.deleteBlogImage(path);
    revalidatePath("/blog-images");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete image.",
    };
  }
}
