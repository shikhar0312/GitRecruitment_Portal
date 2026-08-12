import { z } from 'zod'

export const CreateRoleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  category: z.string().max(100).optional(),
  description: z.string().max(1000).optional(),
})

export const UpdateRoleSchema = CreateRoleSchema.partial()

export const RoleQuerySchema = z.object({
  search: z.string().max(100).optional(),
  category: z.string().max(100).optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().max(100).default(20),
})

export type CreateRoleInput = z.infer<typeof CreateRoleSchema>
export type UpdateRoleInput = z.infer<typeof UpdateRoleSchema>
export type RoleQuery = z.infer<typeof RoleQuerySchema>