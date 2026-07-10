import { taskRepository } from "@/repositories/task.repository";
import { comboRepository } from "@/repositories/combo.repository";
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
    const tasks = await taskRepository.findByDateRange(dates[0], dates[dates.length - 1]);
    return groupTasksByDate(tasks, dates);
  },

  async getActiveCombos() {
    return comboRepository.findActive();
  },

  async getKnownTags() {
    const [taskKeywords, combos] = await Promise.all([
      taskRepository.findKeywords(),
      comboRepository.findAll(),
    ]);

    return [
      ...new Set([
        ...taskKeywords,
        ...combos.flatMap((combo) => combo.tasks.map((task) => task.keyword)),
      ]),
    ].sort();
  },

  async addComboToDate(id: string, date: string) {
    const combo = await comboRepository.findById(id);
    if (!combo || !combo.isActive) return [];

    const existingTasks = await taskRepository.findComboInstances(date, date);
    const existingKeys = new Set(
      existingTasks.map((task) => `${task.comboTaskId ?? "manual"}:${task.date}`),
    );

    const tasksToCreate = combo.tasks
      .filter((task) => !existingKeys.has(`${task.id}:${date}`))
      .map((task) => ({
        title: task.title,
        keyword: task.keyword,
        note: task.note,
        date,
        is_done: false,
        position: task.position,
        combo_id: combo.id,
        combo_task_id: task.id,
      }));

    return taskRepository.createMany(tasksToCreate);
  },

  async addComboToCurrentWeek(id: string) {
    const dates = getWeekDates();
    const combo = await comboRepository.findById(id);
    if (!combo || !combo.isActive) return [];

    const existingTasks = await taskRepository.findComboInstances(dates[0], dates[dates.length - 1]);

    const existingKeys = new Set(
      existingTasks.map((task) => `${task.comboTaskId ?? "manual"}:${task.date}`),
    );

    const tasksToCreate = dates
      .filter((date) => shouldTemplateAppear(combo.activeDays, date))
      .flatMap((date) =>
        combo.tasks
          .filter((task) => !existingKeys.has(`${task.id}:${date}`))
          .map((task) => ({
            title: task.title,
            keyword: task.keyword,
            note: task.note,
            date,
            is_done: false,
            position: task.position,
            combo_id: combo.id,
            combo_task_id: task.id,
          })),
      );

    return taskRepository.createMany(tasksToCreate);
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

  async reorderTasks(tasks: { id: string; position: number }[]) {
    await taskRepository.updatePositions(tasks);
  },
};
