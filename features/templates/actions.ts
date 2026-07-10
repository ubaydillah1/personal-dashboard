"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth/jwt";
import {
  createTemplateSchema,
  templateIdSchema,
  updateTemplateSchema,
} from "@/validators/template.schema";
import { boardService } from "@/features/board/service";
import { templateService } from "./service";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function getActiveDays(formData: FormData) {
  return formData.getAll("activeDays").map((value) => Number(value));
}

export async function createTemplateAction(formData: FormData) {
  await requireAuth();
  const parsed = createTemplateSchema.safeParse({
    title: getString(formData, "title"),
    keyword: getString(formData, "keyword"),
    activeDays: getActiveDays(formData),
  });

  if (!parsed.success) return;
  await templateService.createTemplate(parsed.data);
  revalidatePath("/templates");
  revalidatePath("/board");
}

export async function updateTemplateAction(formData: FormData) {
  await requireAuth();
  const parsed = updateTemplateSchema.safeParse({
    id: getString(formData, "id"),
    title: getString(formData, "title"),
    keyword: getString(formData, "keyword"),
    activeDays: getActiveDays(formData),
    isActive: getString(formData, "isActive"),
  });

  if (!parsed.success) return;
  await templateService.updateTemplate(parsed.data);
  revalidatePath("/templates");
  revalidatePath("/board");
}

export async function deleteTemplateAction(formData: FormData) {
  await requireAuth();
  const parsed = templateIdSchema.safeParse({
    id: getString(formData, "id"),
  });

  if (!parsed.success) return;
  await templateService.deleteTemplate(parsed.data.id);
  revalidatePath("/templates");
}

export async function addComboToWeekAction(formData: FormData) {
  await requireAuth();
  const parsed = templateIdSchema.safeParse({
    id: getString(formData, "id"),
  });

  if (!parsed.success) return;
  await boardService.addComboToCurrentWeek(parsed.data.id);
  revalidatePath("/board");
  revalidatePath("/report");
}
