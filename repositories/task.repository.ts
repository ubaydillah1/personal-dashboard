import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { NewTask, Task, TaskUpdate } from "@/features/board/types";

type TaskRow = {
  id: string;
  title: string;
  keyword: string;
  date: string;
  is_done: boolean;
  note: string | null;
  template_id: string | null;
  created_at: string;
  updated_at: string;
};

function mapTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    keyword: row.keyword,
    date: row.date,
    isDone: row.is_done,
    note: row.note,
    templateId: row.template_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const taskRepository = {
  async findByDateRange(start: string, end: string): Promise<Task[]> {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .gte("date", start)
      .lte("date", end)
      .order("date", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) throw new Error(`Failed to fetch tasks: ${error.message}`);
    return (data ?? []).map((row) => mapTask(row as TaskRow));
  },

  async findAll(): Promise<Task[]> {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("date", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) throw new Error(`Failed to fetch tasks: ${error.message}`);
    return (data ?? []).map((row) => mapTask(row as TaskRow));
  },

  async findTemplateInstances(start: string, end: string): Promise<Task[]> {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .not("template_id", "is", null)
      .gte("date", start)
      .lte("date", end);

    if (error) throw new Error(`Failed to fetch template tasks: ${error.message}`);
    return (data ?? []).map((row) => mapTask(row as TaskRow));
  },

  async create(task: NewTask): Promise<Task> {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase.from("tasks").insert(task).select("*").single();

    if (error) throw new Error(`Failed to create task: ${error.message}`);
    return mapTask(data as TaskRow);
  },

  async createMany(tasks: NewTask[]): Promise<Task[]> {
    if (tasks.length === 0) return [];

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase.from("tasks").insert(tasks).select("*");

    if (error) throw new Error(`Failed to create tasks: ${error.message}`);
    return (data ?? []).map((row) => mapTask(row as TaskRow));
  },

  async update(id: string, task: TaskUpdate): Promise<Task> {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("tasks")
      .update(task)
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw new Error(`Failed to update task: ${error.message}`);
    return mapTask(data as TaskRow);
  },

  async delete(id: string): Promise<void> {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase.from("tasks").delete().eq("id", id);

    if (error) throw new Error(`Failed to delete task: ${error.message}`);
  },
};
