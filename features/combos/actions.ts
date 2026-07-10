"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth/jwt";
import { boardService } from "@/features/board/service";
import { addComboToDateSchema, comboIdSchema, createComboSchema } from "@/validators/combo.schema";
import { comboService } from "./service";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function getComboTasks(formData: FormData) {
  const titles = formData.getAll("taskTitle");
  const keywords = formData.getAll("taskKeyword");
  const notes = formData.getAll("taskNote");

  return titles
    .map((title, index) => ({
      title: String(title),
      keyword: String(keywords[index] ?? ""),
      note: String(notes[index] ?? ""),
    }))
    .filter((task) => task.title.trim().length > 0);
}

export async function createComboAction(formData: FormData) {
  await requireAuth();
  const parsed = createComboSchema.safeParse({
    name: getString(formData, "name"),
    activeDays: [],
    tasks: getComboTasks(formData),
  });

  if (!parsed.success) return;
  await comboService.createCombo(parsed.data);
  revalidatePath("/templates");
  revalidatePath("/board");
}

export async function deleteComboAction(formData: FormData) {
  await requireAuth();
  const parsed = comboIdSchema.safeParse({
    id: getString(formData, "id"),
  });

  if (!parsed.success) return;
  await comboService.deleteCombo(parsed.data.id);
  revalidatePath("/templates");
  revalidatePath("/board");
}

export async function addComboToDateFromListAction(formData: FormData) {
  await requireAuth();
  const parsed = addComboToDateSchema.safeParse({
    id: getString(formData, "id"),
    date: getString(formData, "date"),
  });

  if (!parsed.success) return;
  await boardService.addComboToDate(parsed.data.id, parsed.data.date);
  revalidatePath("/board");
  revalidatePath("/report");
}
