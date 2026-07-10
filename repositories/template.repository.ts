import type {
  NewTaskTemplate,
  TaskTemplate,
  TaskTemplateUpdate,
} from "@/features/templates/types";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type TemplateRow = {
  id: string;
  title: string;
  keyword: string;
  active_days: number[] | null;
  is_active: boolean;
  created_at: string;
};

function mapTemplate(row: TemplateRow): TaskTemplate {
  return {
    id: row.id,
    title: row.title,
    keyword: row.keyword,
    activeDays: row.active_days ?? [],
    isActive: row.is_active,
    createdAt: row.created_at,
  };
}

export const templateRepository = {
  async findAll(): Promise<TaskTemplate[]> {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("task_templates")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) throw new Error(`Failed to fetch templates: ${error.message}`);
    return (data ?? []).map((row) => mapTemplate(row as TemplateRow));
  },

  async findActive(): Promise<TaskTemplate[]> {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("task_templates")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: true });

    if (error) throw new Error(`Failed to fetch active templates: ${error.message}`);
    return (data ?? []).map((row) => mapTemplate(row as TemplateRow));
  },

  async create(template: NewTaskTemplate): Promise<TaskTemplate> {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("task_templates")
      .insert(template)
      .select("*")
      .single();

    if (error) throw new Error(`Failed to create template: ${error.message}`);
    return mapTemplate(data as TemplateRow);
  },

  async update(id: string, template: TaskTemplateUpdate): Promise<TaskTemplate> {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("task_templates")
      .update(template)
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw new Error(`Failed to update template: ${error.message}`);
    return mapTemplate(data as TemplateRow);
  },

  async delete(id: string): Promise<void> {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase.from("task_templates").delete().eq("id", id);

    if (error) throw new Error(`Failed to delete template: ${error.message}`);
  },
};
