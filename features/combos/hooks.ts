"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getKnownTagsAction } from "@/features/board/actions";
import { BOARD_QUERY_KEYS } from "@/features/board/hooks";
import {
  addComboToDateFromListAction,
  createComboAction,
  deleteComboAction,
  getCombosAction,
} from "./actions";
import type { Combo } from "./types";

export const COMBOS_QUERY_KEYS = {
  all: ["combos"] as const,
  list: ["combos", "list"] as const,
  tags: ["combos", "tags"] as const,
};

export function useCombos(initialData?: Combo[]) {
  return useQuery({
    queryKey: COMBOS_QUERY_KEYS.list,
    queryFn: () => getCombosAction(),
    initialData,
  });
}

export function useComboTags(initialData?: string[]) {
  return useQuery({
    queryKey: COMBOS_QUERY_KEYS.tags,
    queryFn: () => getKnownTagsAction(),
    initialData,
  });
}

export function useCreateCombo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => createComboAction(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMBOS_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: BOARD_QUERY_KEYS.combos });
    },
  });
}

export function useDeleteCombo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteComboAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMBOS_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: BOARD_QUERY_KEYS.combos });
    },
  });
}

export function useAddComboToDate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, date }: { id: string; date: string }) =>
      addComboToDateFromListAction({ id, date }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOARD_QUERY_KEYS.all });
    },
  });
}
