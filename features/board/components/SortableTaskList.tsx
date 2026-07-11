"use client";

import { useOptimistic, useTransition } from "react";
import { GripVertical } from "lucide-react";
import type { Task } from "../types";
import { copyTaskToDateAction, reorderTasksAction } from "../actions";
import { TaskItem } from "./TaskItem";

const dragTaskType = "application/x-tracker-task";

type DraggedTask = Pick<
  Task,
  "id" | "title" | "keyword" | "date" | "note" | "templateId" | "comboId" | "comboTaskId"
>;

type OptimisticPayload =
  | { type: "move"; draggedId: string; targetId: string }
  | { type: "copy"; task: DraggedTask; date: string };

function moveTask(tasks: Task[], draggedId: string, targetId: string) {
  const draggedIndex = tasks.findIndex((task) => task.id === draggedId);
  const targetIndex = tasks.findIndex((task) => task.id === targetId);

  if (draggedIndex < 0 || targetIndex < 0 || draggedIndex === targetIndex) return tasks;

  const nextTasks = [...tasks];
  const [draggedTask] = nextTasks.splice(draggedIndex, 1);
  nextTasks.splice(targetIndex, 0, draggedTask);
  return nextTasks;
}

function createOptimisticCopy(task: DraggedTask, date: string): Task {
  const now = new Date().toISOString();

  return {
    id: `optimistic-${task.id}-${date}-${Date.now()}`,
    title: task.title,
    keyword: task.keyword,
    date,
    isDone: false,
    position: 9999,
    note: task.note,
    templateId: task.templateId,
    comboId: task.comboId,
    comboTaskId: task.comboTaskId,
    createdAt: now,
    updatedAt: now,
  };
}

function readDraggedTask(event: React.DragEvent) {
  const rawTask = event.dataTransfer.getData(dragTaskType);
  if (!rawTask) return null;

  try {
    return JSON.parse(rawTask) as DraggedTask;
  } catch {
    return null;
  }
}

export function SortableTaskList({ date, tasks }: { date: string; tasks: Task[] }) {
  const [isPending, startTransition] = useTransition();
  const [optimisticTasks, setOptimisticTasks] = useOptimistic(
    tasks,
    (currentTasks, payload: OptimisticPayload) => {
      if (payload.type === "move") {
        return moveTask(currentTasks, payload.draggedId, payload.targetId);
      }

      const alreadyCopied = currentTasks.some(
        (task) =>
          task.id === payload.task.id ||
          task.id.startsWith(`optimistic-${payload.task.id}-${payload.date}-`),
      );

      if (alreadyCopied) return currentTasks;
      return [...currentTasks, createOptimisticCopy(payload.task, payload.date)];
    },
  );

  function handleItemDrop(event: React.DragEvent, targetId: string) {
    event.preventDefault();
    event.stopPropagation();

    const draggedTask = readDraggedTask(event);
    if (!draggedTask) return;

    if (draggedTask.date !== date) {
      startTransition(async () => {
        setOptimisticTasks({ type: "copy", task: draggedTask, date });
        await copyTaskToDateAction(draggedTask.id, date);
      });
      return;
    }

    if (draggedTask.id === targetId) return;

    const nextTasks = moveTask(optimisticTasks, draggedTask.id, targetId);
    startTransition(async () => {
      setOptimisticTasks({ type: "move", draggedId: draggedTask.id, targetId });
      await reorderTasksAction(nextTasks.map((task) => task.id));
    });
  }

  function handleListDrop(event: React.DragEvent) {
    event.preventDefault();

    const draggedTask = readDraggedTask(event);
    if (!draggedTask || draggedTask.date === date) return;

    startTransition(async () => {
      setOptimisticTasks({ type: "copy", task: draggedTask, date });
      await copyTaskToDateAction(draggedTask.id, date);
    });
  }

  return (
    <div
      className={isPending ? "flex flex-1 flex-col gap-2 opacity-70" : "flex flex-1 flex-col gap-2"}
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
      }}
      onDrop={handleListDrop}
    >
      {optimisticTasks.map((task) => (
        <div
          key={task.id}
          draggable
          onDragStart={(event) => {
            const draggedTask: DraggedTask = {
              id: task.id,
              title: task.title,
              keyword: task.keyword,
              date: task.date,
              note: task.note,
              templateId: task.templateId,
              comboId: task.comboId,
              comboTaskId: task.comboTaskId,
            };

            event.dataTransfer.setData(dragTaskType, JSON.stringify(draggedTask));
            event.dataTransfer.setData("text/plain", task.id);
            event.dataTransfer.effectAllowed = "copyMove";
          }}
          onDragOver={(event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = task.date === date ? "move" : "copy";
          }}
          onDrop={(event) => handleItemDrop(event, task.id)}
          className="group flex cursor-grab items-start gap-2 rounded-md active:cursor-grabbing"
        >
          <div className="mt-3 text-zinc-700 transition group-hover:text-zinc-400">
            <GripVertical className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <TaskItem task={task} />
          </div>
        </div>
      ))}
    </div>
  );
}
