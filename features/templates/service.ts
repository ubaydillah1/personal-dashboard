import { slugify } from "@/lib/utils";
import { templateRepository } from "@/repositories/template.repository";
import type { CreateTemplateInput, UpdateTemplateInput } from "@/validators/template.schema";

function getKeyword(title: string, keyword?: string) {
  return keyword?.trim() ? slugify(keyword) : slugify(title);
}

export const templateService = {
  async getTemplates() {
    return templateRepository.findAll();
  },

  async createTemplate(input: CreateTemplateInput) {
    return templateRepository.create({
      title: input.title,
      keyword: getKeyword(input.title, input.keyword),
      active_days: input.activeDays,
      is_active: true,
    });
  },

  async updateTemplate(input: UpdateTemplateInput) {
    return templateRepository.update(input.id, {
      title: input.title,
      keyword: getKeyword(input.title, input.keyword),
      active_days: input.activeDays,
      is_active: input.isActive,
    });
  },

  async deleteTemplate(id: string) {
    await templateRepository.delete(id);
  },
};
