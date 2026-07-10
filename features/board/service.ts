import { taskRepository } from "@/repositories/task.repository";
import { templateRepository } from "@/repositories/template.repository";
import { addDays, slugify, startOfWeekMonday, toDateKey } from "@/lib/utils";
import type { DayBoard, Task } from "./types";
import type { CreateTaskInput, UpdateTaskInput } from "@/validators/task.schema";

function getKeyword(title: string, keyword?: string) {
  return keyword?.trim() ? slugify(keyword) : slugify(title);
}

function getWeekDates(anchorDate = new Date()) {
  const start = startOfWeekMonday(anchorDate);
  return Array.from({ length: 7 }, (_, index) => toDateKey(addDays(start, index)));
}

function shouldTemplateAppear(activeDays: number[], dateKey: string) {
  if (activeDays.length === 0) return true;
  return activeDays.includes(new Date(`${dateKey}T00:00:00`).getDay());
}

function groupTasksByDate(tasks: Task[], dates: string[]): DayBoard[] {
  return dates.map((date) => ({
    date,
    tasks: tasks.filter((task) => task.date === date),
  }));
}

export const boardService = {
  async getWeekBoard(anchorDate?: Date): Promise<DayBoard[]> {
    const dates = getWeekDates(anchorDate);
    await this.ensureTemplateTasks(dates);
    const tasks = await taskRepository.findByDateRange(dates[0], dates[dates.length - 1]);
    return groupTasksByDate(tasks, dates);
  },

  async ensureTemplateTasks(dates: string[]) {
    const [templates, existingTasks] = await Promise.all([
      templateRepository.findActive(),
      taskRepository.findTemplateInstances(dates[0], dates[dates.length - 1]),
    ]);

    const existingKeys = new Set(
      existingTasks.map((task) => `${task.templateId ?? "manual"}:${task.date}`),
    );

    const tasksToCreate = dates.flatMap((date) =>
      templates
        .filter((template) => shouldTemplateAppear(template.activeDays, date))
        .filter((template) => !existingKeys.has(`${template.id}:${date}`))
        .map((template) => ({
          title: template.title,
          keyword: template.keyword,
          date,
          is_done: false,
          template_id: template.id,
        })),
    );

    await taskRepository.createMany(tasksToCreate);
  },

  async addTask(input: CreateTaskInput) {
    return taskRepository.create({
      title: input.title,
      keyword: getKeyword(input.title, input.keyword),
      date: input.date,
      note: input.note ?? null,
      is_done: false,
    });
  },

  async updateTask(input: UpdateTaskInput) {
    return taskRepository.update(input.id, {
      title: input.title,
      keyword: getKeyword(input.title, input.keyword),
      note: input.note ?? null,
    });
  },

  async toggleTaskDone(id: string, isDone: boolean) {
    return taskRepository.update(id, { is_done: isDone });
  },

  async deleteTask(id: string) {
    await taskRepository.delete(id);
  },
};
