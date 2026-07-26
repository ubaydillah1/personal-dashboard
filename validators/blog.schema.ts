import { z } from "zod";

const absoluteUrlSchema = z.string().trim().url();

export const blogContentBlockSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("paragraph"),
    text: z.string().trim().min(1),
  }),
  z.object({
    type: z.literal("heading"),
    level: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
    text: z.string().trim().min(1),
  }),
  z.object({
    type: z.literal("image"),
    src: absoluteUrlSchema,
    alt: z.string().trim().min(1),
    caption: z.string().trim().optional(),
  }),
  z.object({
    type: z.literal("gallery"),
    items: z.array(z.object({ src: absoluteUrlSchema, alt: z.string().trim().min(1) })).min(1),
  }),
  z.object({
    type: z.literal("quote"),
    text: z.string().trim().min(1),
  }),
  z.object({
    type: z.literal("code"),
    code: z.string().min(1),
  }),
  z.object({
    type: z.literal("list"),
    style: z.enum(["ordered", "unordered"]),
    items: z.array(z.string().trim().min(1)).min(1),
  }),
  z.object({
    type: z.literal("callout"),
    title: z.string().trim().min(1),
    text: z.string().trim().min(1),
  }),
  z.object({
    type: z.literal("link"),
    href: absoluteUrlSchema,
    label: z.string().trim().min(1),
  }),
]);

export const saveBlogSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must use lowercase letters, numbers, and hyphens.")
    .max(180),
  title: z.string().trim().min(1).max(220),
  excerpt: z.string().trim().min(1).max(500),
  coverImage: z.string().trim().url().optional().or(z.literal("")),
  status: z.enum(["draft", "published"]),
  tags: z.array(z.string().trim().min(1).max(40)).default([]),
  readingTime: z.string().trim().min(1).max(40),
  content: z.array(blogContentBlockSchema).default([]),
  titleEn: z.string().trim().min(1).max(220).nullable().optional(),
  excerptEn: z.string().trim().min(1).max(500).nullable().optional(),
  contentEn: z.array(blogContentBlockSchema).default([]),
});

export const blogIdSchema = z.object({
  id: z.string().uuid(),
});

export type SaveBlogSchemaInput = z.infer<typeof saveBlogSchema>;
