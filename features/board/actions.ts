"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth/jwt";
import {
  createTaskSchema,
  taskIdSchema,
  toggleTaskSchema,
  updateTaskSchema,
} from "@/validators/task.schema";
import { boardService } from "./service";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function createTaskAction(formData: FormData) {
  await requireAuth();
  const parsed = createTaskSchema.safeParse({
    title: getString(formData, "title"),
    date: getString(formData, "date"),
    note: getString(formData, "note"),
    keyword: getString(formData, "keyword"),
  });

  if (!parsed.success) return;
  await boardService.addTask(parsed.data);
  revalidatePath("/board");
  revalidatePath("/report");
}

export async function updateTaskAction(formData: FormData) {
  await requireAuth();
  const parsed = updateTaskSchema.safeParse({
    id: getString(formData, "id"),
    title: getString(formData, "title"),
    note: getString(formData, "note"),
    keyword: getString(formData, "keyword"),
  });

  if (!parsed.success) return;
  await boardService.updateTask(parsed.data);
  revalidatePath("/board");
  revalidatePath("/report");
}

export async function toggleTaskAction(formData: FormData) {
  await requireAuth();
  const parsed = toggleTaskSchema.safeParse({
    id: getString(formData, "id"),
    isDone: getString(formData, "isDone"),
  });

  if (!parsed.success) return;
  await boardService.toggleTaskDone(parsed.data.id, parsed.data.isDone);
  revalidatePath("/board");
  revalidatePath("/report");
}

export async function deleteTaskAction(formData: FormData) {
  await requireAuth();
  const parsed = taskIdSchema.safeParse({
    id: getString(formData, "id"),
  });

  if (!parsed.success) return;
  await boardService.deleteTask(parsed.data.id);
  revalidatePath("/board");
  revalidatePath("/report");
}
