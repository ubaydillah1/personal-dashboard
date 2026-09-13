"use client";

import { useCombos, useComboTags } from "../hooks";
import { ComboBuilder } from "./ComboBuilder";
import { ComboList } from "./ComboList";
import { CombosLoading } from "./CombosLoading";

export function CombosClientView() {
  const { data: combos = [], isLoading: isLoadingCombos } = useCombos();
  const { data: tags = [], isLoading: isLoadingTags } = useComboTags();

  // Pola isInitialLoading: Skeleton hanya muncul saat cache benar-benar kosong di awal
  const isInitialLoading =
    (isLoadingCombos || isLoadingTags) && combos.length === 0 && tags.length === 0;

  if (isInitialLoading) {
    return <CombosLoading />;
  }

  return (
    <div className="grid gap-5">
      <div>
        <h1 className="text-2xl font-semibold leading-tight text-zinc-50">Combos</h1>
        <p className="mt-1 text-sm leading-6 text-zinc-400">
          Save reusable groups of tasks, then copy them into any day.
        </p>
      </div>
      <ComboBuilder tags={tags} />
      <ComboList combos={combos} />
    </div>
  );
}
