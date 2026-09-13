import { getSupabaseServerClient } from "@/lib/supabase/server";

const BLOG_BUCKET = "blog-images";
// Grace period 7 hari: Gambar yang di-upload ke perpustakaan/library dalam 7 hari terakhir
// tidak akan pernah dihapus meskipun belum sempat di-attach ke artikel/note.
const SAFETY_GRACE_PERIOD_MS = 7 * 24 * 60 * 60 * 1000;

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

    // 2. Ambil seluruh data dari tabel note_blocks dan blogs
    const [noteBlocksRes, blogsRes] = await Promise.all([
      supabase.from("note_blocks").select("content, metadata"),
      supabase.from("blogs").select("cover_image, content, content_en, excerpt, excerpt_en"),
    ]);

    // Gabungkan seluruh isi konten database menjadi satu string pencarian besar
    let combinedDbCorpus = "";

    if (noteBlocksRes.data) {
      for (const block of noteBlocksRes.data) {
        if (block.content) combinedDbCorpus += ` ${block.content}`;
        if (block.metadata) combinedDbCorpus += ` ${JSON.stringify(block.metadata)}`;
      }
    }

    if (blogsRes.data) {
      for (const blog of blogsRes.data) {
        if (blog.cover_image) combinedDbCorpus += ` ${blog.cover_image}`;
        if (blog.content) combinedDbCorpus += ` ${JSON.stringify(blog.content)}`;
        if (blog.content_en) combinedDbCorpus += ` ${JSON.stringify(blog.content_en)}`;
        if (blog.excerpt) combinedDbCorpus += ` ${blog.excerpt}`;
        if (blog.excerpt_en) combinedDbCorpus += ` ${blog.excerpt_en}`;
      }
    }

    const now = Date.now();
    const toDelete: string[] = [];

    // 3. Scan setiap file di storage
    for (const file of files) {
      if (!file.name || file.name === ".emptyFolderPlaceholder") continue;

      const fileName = file.name;
      const encodedFileName = encodeURIComponent(fileName);

      // Cek apakah nama file (mentah maupun URL encoded) ada di database
      const isUsedInNotesOrBlog =
        combinedDbCorpus.includes(fileName) || combinedDbCorpus.includes(encodedFileName);

      if (isUsedInNotesOrBlog) {
        // Gambar sedang aktif dipakai di Blog atau Note -> AMAN, jangan hapus!
        continue;
      }

      // Pengaman Grace Period: Jika file baru dibuat dalam 7 hari terakhir, jangan dihapus
      // (misalnya user baru upload ke Image Library tapi belum sempat dipasang ke draft artikel)
      const createdAt = file.created_at ? new Date(file.created_at).getTime() : 0;
      if (createdAt > 0 && now - createdAt < SAFETY_GRACE_PERIOD_MS) {
        continue;
      }

      toDelete.push(fileName);
    }

    // 4. Hapus file yang benar-benar sampah (tidak dipakai di mana pun & sudah berusia > 7 hari)
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
