import type { Combo, ComboTask, NewCombo } from "@/features/combos/types";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type ComboRow = {
  id: string;
  name: string;
  active_days: number[] | null;
  is_active: boolean;
  created_at: string;
};

type ComboTaskRow = {
  id: string;
  combo_id: string;
  title: string;
  keyword: string;
  note: string | null;
  position: number;
  created_at: string;
};

function mapComboTask(row: ComboTaskRow): ComboTask {
  return {
    id: row.id,
    comboId: row.combo_id,
    title: row.title,
    keyword: row.keyword,
    note: row.note,
    position: row.position,
    createdAt: row.created_at,
  };
}

function mapCombo(row: ComboRow, tasks: ComboTask[]): Combo {
  return {
    id: row.id,
    name: row.name,
    activeDays: row.active_days ?? [],
    isActive: row.is_active,
    createdAt: row.created_at,
    tasks,
  };
}

export const comboRepository = {
  async findAll(): Promise<Combo[]> {
    const supabase = getSupabaseServerClient();
    const { data: comboRows, error: comboError } = await supabase
      .from("combos")
      .select("*")
      .order("created_at", { ascending: true });

    if (comboError) throw new Error(`Failed to fetch combos: ${comboError.message}`);

    const { data: taskRows, error: taskError } = await supabase
      .from("combo_tasks")
      .select("*")
      .order("position", { ascending: true });

    if (taskError) throw new Error(`Failed to fetch combo tasks: ${taskError.message}`);

    const tasksByCombo = new Map<string, ComboTask[]>();
    for (const row of taskRows ?? []) {
      const task = mapComboTask(row as ComboTaskRow);
      tasksByCombo.set(task.comboId, [...(tasksByCombo.get(task.comboId) ?? []), task]);
    }

    return (comboRows ?? []).map((row) =>
      mapCombo(row as ComboRow, tasksByCombo.get(String(row.id)) ?? []),
    );
  },

  async findActive(): Promise<Combo[]> {
    const combos = await this.findAll();
    return combos.filter((combo) => combo.isActive);
  },

  async findById(id: string): Promise<Combo | null> {
    const combos = await this.findAll();
    return combos.find((combo) => combo.id === id) ?? null;
  },

  async create(input: NewCombo): Promise<Combo> {
    const supabase = getSupabaseServerClient();
    const { data: combo, error: comboError } = await supabase
      .from("combos")
      .insert({
        name: input.name,
        active_days: input.active_days,
        is_active: input.is_active ?? true,
      })
      .select("*")
      .single();

    if (comboError) throw new Error(`Failed to create combo: ${comboError.message}`);

    const comboTasks = input.tasks.map((task) => ({
      combo_id: String(combo.id),
      title: task.title,
      keyword: task.keyword,
      note: task.note ?? null,
      position: task.position,
    }));

    const { data: tasks, error: tasksError } = await supabase
      .from("combo_tasks")
      .insert(comboTasks)
      .select("*");

    if (tasksError) throw new Error(`Failed to create combo tasks: ${tasksError.message}`);

    return mapCombo(
      combo as ComboRow,
      (tasks ?? []).map((task) => mapComboTask(task as ComboTaskRow)),
    );
  },

  async delete(id: string): Promise<void> {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase.from("combos").delete().eq("id", id);
    if (error) throw new Error(`Failed to delete combo: ${error.message}`);
  },
};
