"use client";

import { useOptimistic, useTransition } from "react";
import { GripVertical } from "lucide-react";
import type { Task } from "../types";
import { reorderTasksAction } from "../actions";
import { TaskItem } from "./TaskItem";

function moveTask(tasks: Task[], draggedId: string, targetId: string) {
  const draggedIndex = tasks.findIndex((task) => task.id === draggedId);
  const targetIndex = tasks.findIndex((task) => task.id === targetId);

  if (draggedIndex < 0 || targetIndex < 0 || draggedIndex === targetIndex) return tasks;

  const nextTasks = [...tasks];
  const [draggedTask] = nextTasks.splice(draggedIndex, 1);
  nextTasks.splice(targetIndex, 0, draggedTask);
  return nextTasks;
}

export function SortableTaskList({ tasks }: { tasks: Task[] }) {
  const [isPending, startTransition] = useTransition();
  const [optimisticTasks, setOptimisticTasks] = useOptimistic(
    tasks,
    (currentTasks, payload: { draggedId: string; targetId: string }) =>
      moveTask(currentTasks, payload.draggedId, payload.targetId),
  );

  function handleDrop(targetId: string, draggedId: string) {
    if (!draggedId || draggedId === targetId) return;

    const nextTasks = moveTask(optimisticTasks, draggedId, targetId);
    startTransition(async () => {
      setOptimisticTasks({ draggedId, targetId });
      await reorderTasksAction(nextTasks.map((task) => task.id));
    });
  }

  return (
    <div className={isPending ? "flex flex-1 flex-col gap-2 opacity-70" : "flex flex-1 flex-col gap-2"}>
      {optimisticTasks.map((task) => (
        <div
          key={task.id}
          draggable
          onDragStart={(event) => {
            event.dataTransfer.setData("text/plain", task.id);
            event.dataTransfer.effectAllowed = "move";
          }}
          onDragOver={(event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = "move";
          }}
          onDrop={(event) => {
            event.preventDefault();
            handleDrop(task.id, event.dataTransfer.getData("text/plain"));
          }}
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
