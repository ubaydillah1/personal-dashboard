"use client";

import { useBlogImages } from "../hooks";
import { BlogImageLibrary } from "./BlogImageLibrary";
import { BlogImagesLoading } from "./BlogImagesLoading";

export function BlogImagesClientView() {
  const { data: images = [], isLoading } = useBlogImages();

  // Pola isInitialLoading: Skeleton hanya muncul saat cache benar-benar kosong di awal
  const isInitialLoading = isLoading && images.length === 0;

  if (isInitialLoading) {
    return <BlogImagesLoading />;
  }

  return <BlogImageLibrary images={images} />;
}
