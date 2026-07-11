import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { NewTask, Task, TaskUpdate } from "@/features/board/types";

type TaskRow = {
  id: string;
  title: string;
  keyword: string;
  date: string;
  is_done: boolean;
  position: number | null;
  note: string | null;
  template_id: string | null;
  combo_id: string | null;
  combo_task_id: string | null;
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
    position: row.position ?? 0,
    note: row.note,
    templateId: row.template_id,
    comboId: row.combo_id,
    comboTaskId: row.combo_task_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const taskRepository = {
  async findById(id: string): Promise<Task | null> {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase.from("tasks").select("*").eq("id", id).maybeSingle();

    if (error) throw new Error(`Failed to fetch task: ${error.message}`);
    return data ? mapTask(data as TaskRow) : null;
  },

  async findByDateRange(start: string, end: string): Promise<Task[]> {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .gte("date", start)
      .lte("date", end)
      .order("date", { ascending: true })
      .order("position", { ascending: true })
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
      .order("position", { ascending: true })
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

    if (error) throw new Error(`Failed to fetch combo tasks: ${error.message}`);
    return (data ?? []).map((row) => mapTask(row as TaskRow));
  },

  async findComboInstances(start: string, end: string): Promise<Task[]> {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .not("combo_id", "is", null)
      .gte("date", start)
      .lte("date", end);

    if (error) throw new Error(`Failed to fetch copied combo tasks: ${error.message}`);
    return (data ?? []).map((row) => mapTask(row as TaskRow));
  },

  async findKeywords(): Promise<string[]> {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("tasks")
      .select("keyword")
      .order("keyword", { ascending: true });

    if (error) throw new Error(`Failed to fetch tags: ${error.message}`);
    return [...new Set((data ?? []).map((row) => String(row.keyword)).filter(Boolean))];
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

  async updatePositions(tasks: { id: string; position: number }[]): Promise<void> {
    const supabase = getSupabaseServerClient();

    for (const task of tasks) {
      const { error } = await supabase
        .from("tasks")
        .update({ position: task.position })
        .eq("id", task.id);

      if (error) throw new Error(`Failed to update task order: ${error.message}`);
    }
  },

  async delete(id: string): Promise<void> {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase.from("tasks").delete().eq("id", id);

    if (error) throw new Error(`Failed to delete task: ${error.message}`);
  },
};
