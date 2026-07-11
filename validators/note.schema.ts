import { z } from "zod";

export const noteBlockTypeSchema = z.enum(["bullet", "text", "todo", "link"]);

export const saveNoteSchema = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(1, "Note title is required.").max(160),
  blocks: z
    .array(
      z.object({
        id: z.string().uuid().optional(),
        type: noteBlockTypeSchema,
        content: z.string().max(5000),
        position: z.number().int().min(0),
        metadata: z.record(z.string(), z.unknown()).default({}),
      }),
    )
    .min(1),
});

export const noteIdSchema = z.object({
  id: z.string().uuid(),
});

export type SaveNoteSchemaInput = z.infer<typeof saveNoteSchema>;
