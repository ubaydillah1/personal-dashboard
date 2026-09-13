"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteBlogAction,
  deleteBlogImageAction,
  getAdminBlogsAction,
  getBlogImagesAction,
} from "./actions";
import type { Blog, BlogImageAsset } from "./types";

export const BLOGS_QUERY_KEYS = {
  all: ["blogs"] as const,
  adminList: ["blogs", "adminList"] as const,
  images: ["blogs", "images"] as const,
};

export function useAdminBlogs(initialData?: Blog[]) {
  return useQuery({
    queryKey: BLOGS_QUERY_KEYS.adminList,
    queryFn: () => getAdminBlogsAction(),
    initialData,
  });
}

export function useBlogImages(initialData?: BlogImageAsset[]) {
  return useQuery({
    queryKey: BLOGS_QUERY_KEYS.images,
    queryFn: () => getBlogImagesAction(),
    initialData,
  });
}

export function useDeleteBlog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteBlogAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BLOGS_QUERY_KEYS.adminList });
    },
  });
}

export function useDeleteBlogImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (path: string) => deleteBlogImageAction(path),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BLOGS_QUERY_KEYS.images });
    },
  });
}
