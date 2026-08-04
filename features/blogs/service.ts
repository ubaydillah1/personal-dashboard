import { blogRepository } from "@/repositories/blog.repository";
import type { SaveBlogInput } from "./types";

export const blogsService = {
  async getAdminBlogs() {
    return blogRepository.findAdminList();
  },

  async getPublishedBlogs(limit: number, cursor: number, search?: string, tag?: string, lang?: string) {
    return blogRepository.findPublishedList(limit, cursor, search, tag, lang);
  },

  async getPublishedBlog(slug: string, lang?: string) {
    return blogRepository.findPublishedBySlug(slug, lang);
  },

  async recordPublishedBlogView(slug: string, visitorId: string) {
    return blogRepository.incrementPublishedView(slug, visitorId);
  },

  async getPublishedTags() {
    return blogRepository.findPublishedTags();
  },

  async saveBlog(input: SaveBlogInput, coverFile?: File | null) {
    const blog = input.id
      ? await blogRepository.update({ ...input, id: input.id })
      : await blogRepository.create(input);

    if (!coverFile || coverFile.size === 0) return blog;

    const coverImage = await blogRepository.uploadCover(blog.id, coverFile);
    return blogRepository.setCoverImage(blog.id, coverImage);
  },

  async deleteBlog(id: string) {
    await blogRepository.delete(id);
  },

  async getBlogImages() {
    return blogRepository.listImages();
  },

  async uploadBlogImage(file: File) {
    return blogRepository.uploadImage(file);
  },

  async deleteBlogImage(path: string) {
    return blogRepository.deleteImage(path);
  },
};
