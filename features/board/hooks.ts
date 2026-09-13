"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addComboToDateAction,
  copyDayTasksAction,
  copyTaskToDateAction,
  createTaskAction,
  deleteTaskAction,
  getActiveCombosAction,
  getKnownTagsAction,
  getRangeBoardAction,
  reorderTasksAction,
  toggleTaskAction,
  updateTaskAction,
} from "./actions";
import type { DayBoard } from "./types";
import type { ComboGroupWithTemplates } from "@/features/combos/types";

export const BOARD_QUERY_KEYS = {
  all: ["board"] as const,
  range: (from: string, to: string) => ["board", "range", from, to] as const,
  combos: ["board", "combos"] as const,
  tags: ["board", "tags"] as const,
};

export function useBoardDays(from: string, to: string, initialData?: DayBoard[]) {
  return useQuery({
    queryKey: BOARD_QUERY_KEYS.range(from, to),
    queryFn: () => getRangeBoardAction(from, to),
    initialData,
  });
}

export function useBoardCombos(initialData?: ComboGroupWithTemplates[]) {
  return useQuery({
    queryKey: BOARD_QUERY_KEYS.combos,
    queryFn: () => getActiveCombosAction(),
    initialData,
  });
}

export function useBoardTags(initialData?: string[]) {
  return useQuery({
    queryKey: BOARD_QUERY_KEYS.tags,
    queryFn: () => getKnownTagsAction(),
    initialData,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => createTaskAction(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOARD_QUERY_KEYS.all });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => updateTaskAction(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOARD_QUERY_KEYS.all });
    },
  });
}

export function useToggleTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => toggleTaskAction(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOARD_QUERY_KEYS.all });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => deleteTaskAction(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOARD_QUERY_KEYS.all });
    },
  });
}

export function useCopyTaskToDate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, date }: { taskId: string; date: string }) =>
      copyTaskToDateAction(taskId, date),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOARD_QUERY_KEYS.all });
    },
  });
}

export function useCopyDayTasks() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => copyDayTasksAction(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOARD_QUERY_KEYS.all });
    },
  });
}

export function useAddComboToDate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => addComboToDateAction(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOARD_QUERY_KEYS.all });
    },
  });
}

export function useReorderTasks() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskIds: string[]) => reorderTasksAction(taskIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOARD_QUERY_KEYS.all });
    },
  });
}
