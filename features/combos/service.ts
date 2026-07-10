import { slugify } from "@/lib/utils";
import { comboRepository } from "@/repositories/combo.repository";
import type { CreateComboInput } from "@/validators/combo.schema";

function getKeyword(title: string, keyword?: string) {
  return keyword?.trim() ? slugify(keyword) : slugify(title);
}

export const comboService = {
  async getCombos() {
    return comboRepository.findAll();
  },

  async getActiveCombos() {
    return comboRepository.findActive();
  },

  async createCombo(input: CreateComboInput) {
    return comboRepository.create({
      name: input.name,
      active_days: input.activeDays,
      is_active: true,
      tasks: input.tasks.map((task, index) => ({
        title: task.title,
        keyword: getKeyword(task.title, task.keyword),
        note: task.note ?? null,
        position: index,
      })),
    });
  },

  async deleteCombo(id: string) {
    await comboRepository.delete(id);
  },
};
