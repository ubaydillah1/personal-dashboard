import { getSupabaseServerClient } from "@/lib/supabase/server";

const BLOG_BUCKET = "blog-images";
const SAFETY_GRACE_PERIOD_MS = 24 * 60 * 60 * 1000; // 24 jam (jangan hapus gambar yang baru di-upload < 24 jam)

export const storageCleanerRepository = {
  async cleanupOrphanedImages(): Promise<{
    scannedFiles: number;
    deletedFiles: string[];
  }> {
    const supabase = getSupabaseServerClient();

    // 1. Ambil seluruh daftar file di bucket
    const { data: files, error: listError } = await supabase.storage
      .from(BLOG_BUCKET)
      .list("", { limit: 1000 });

    if (listError || !files || files.length === 0) {
      return { scannedFiles: 0, deletedFiles: [] };
    }

    // 2. Ambil seluruh referensi gambar dari database
    // a. Dari tabel note_blocks
    const { data: noteBlocks } = await supabase
      .from("note_blocks")
      .select("content, metadata");

    // b. Dari tabel blogs
    const { data: blogs } = await supabase
      .from("blogs")
      .select("cover_image, content, content_en");

    // 3. Bangun Set nama file yang sedang aktif digunakan
    const usedFilenames = new Set<string>();

    const extractFilenamesFromText = (text: string | null | undefined) => {
      if (!text) return;
      // Match pola blog-images/filename.ext
      const matches = text.match(/blog-images\/([^"'\s?#\)]+)/g);
      if (matches) {
        for (const m of matches) {
          const name = m.replace(/^blog-images\//, "").split("?")[0];
          if (name) usedFilenames.add(decodeURIComponent(name));
        }
      }
    };

    if (noteBlocks) {
      for (const block of noteBlocks) {
        extractFilenamesFromText(block.content);
        if (block.metadata) {
          extractFilenamesFromText(JSON.stringify(block.metadata));
        }
      }
    }

    if (blogs) {
      for (const blog of blogs) {
        extractFilenamesFromText(blog.cover_image);
        if (blog.content) {
          extractFilenamesFromText(JSON.stringify(blog.content));
        }
        if (blog.content_en) {
          extractFilenamesFromText(JSON.stringify(blog.content_en));
        }
      }
    }

    // 4. Identifikasi file sampah (yang tidak tercatat di DB & sudah berusia > 24 jam)
    const now = Date.now();
    const toDelete: string[] = [];

    for (const file of files) {
      if (!file.name || file.name === ".emptyFolderPlaceholder") continue;

      // Jika file sedang aktif dipakai di DB, lewati
      if (usedFilenames.has(file.name)) continue;

      // Pengaman (Grace Period): Jangan hapus file yang baru saja diupload dalam 24 jam terakhir
      const createdAt = file.created_at ? new Date(file.created_at).getTime() : 0;
      if (createdAt > 0 && now - createdAt < SAFETY_GRACE_PERIOD_MS) {
        continue;
      }

      toDelete.push(file.name);
    }

    // 5. Hapus file sampah dari Supabase Storage
    if (toDelete.length > 0) {
      const { error: removeError } = await supabase.storage
        .from(BLOG_BUCKET)
        .remove(toDelete);

      if (removeError) {
        console.error("Failed to delete orphaned images:", removeError.message);
      }
    }

    return {
      scannedFiles: files.length,
      deletedFiles: toDelete,
    };
  },
};
