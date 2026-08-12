import { z } from 'zod';

export const roleFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  category: z.string().max(100).optional(),
  description: z.string().max(1000).optional(),
});

export type RoleFormValues = z.infer<typeof roleFormSchema>;

export const roleFormDefaults: RoleFormValues = {
  title: '',
  category: '',
  description: '',
};

export function toRolePayload(values: RoleFormValues) {
  const parsed = roleFormSchema.parse(values);
  const payload: Record<string, unknown> = { title: parsed.title };
  if (parsed.category?.trim()) payload.category = parsed.category.trim();
  if (parsed.description?.trim()) payload.description = parsed.description.trim();
  return payload;
}
