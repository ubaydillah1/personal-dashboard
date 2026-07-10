import { boardService } from "@/features/board/service";
import { ComboBuilder } from "@/features/combos/components/ComboBuilder";
import { ComboList } from "@/features/combos/components/ComboList";
import { comboService } from "@/features/combos/service";

export default async function TemplatesPage() {
  const [combos, tags] = await Promise.all([
    comboService.getCombos(),
    boardService.getKnownTags(),
  ]);

  return (
    <div className="grid gap-5">
      <div>
        <h1 className="text-2xl font-semibold leading-tight text-zinc-50">Combos</h1>
        <p className="mt-1 text-sm leading-6 text-zinc-400">Save reusable groups of tasks, then copy them into any day.</p>
      </div>
      <ComboBuilder tags={tags} />
      <ComboList combos={combos} />
    </div>
  );
}
