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

export async function getCombosAction() {
  await requireAuth();
  return comboService.getCombos();
}

export async function createComboAction(formData: FormData) {
  await requireAuth();
  const parsed = createComboSchema.safeParse({
    name: getString(formData, "name"),
    activeDays: [],
    tasks: getComboTasks(formData),
  });

  if (!parsed.success) return { success: false, error: "Validation failed" };
  const combo = await comboService.createCombo(parsed.data);
  revalidatePath("/templates");
  revalidatePath("/board");
  return { success: true, combo };
}

export async function deleteComboAction(idOrFormData: string | FormData) {
  await requireAuth();
  const id = typeof idOrFormData === "string" ? idOrFormData : getString(idOrFormData, "id");
  const parsed = comboIdSchema.safeParse({ id });

  if (!parsed.success) return { success: false, error: "Invalid id" };
  await comboService.deleteCombo(parsed.data.id);
  revalidatePath("/templates");
  revalidatePath("/board");
  return { success: true };
}

export async function addComboToDateFromListAction(idOrFormData: { id: string; date: string } | FormData) {
  await requireAuth();
  let id = "";
  let date = "";
  if (idOrFormData instanceof FormData) {
    id = getString(idOrFormData, "id");
    date = getString(idOrFormData, "date");
  } else {
    id = idOrFormData.id;
    date = idOrFormData.date;
  }
  const parsed = addComboToDateSchema.safeParse({ id, date });

  if (!parsed.success) return { success: false, error: "Invalid input" };
  await boardService.addComboToDate(parsed.data.id, parsed.data.date);
  revalidatePath("/board");
  revalidatePath("/report");
  return { success: true };
}
