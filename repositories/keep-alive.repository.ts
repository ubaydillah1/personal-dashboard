import { getSupabaseServerClient } from "@/lib/supabase/server";

export const keepAliveRepository = {
  async pingDatabase() {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase.from("tasks").select("id", {
      count: "exact",
      head: true,
    });

    if (error) throw new Error(`Failed to ping database: ${error.message}`);
  },
};
