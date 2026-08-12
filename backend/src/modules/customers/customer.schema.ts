import { z } from 'zod'

export const CreateCustomerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  industry: z.string().max(100).optional(),
  website: z.string().url().max(255).optional(),
  country: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  account_manager_id: z.string().uuid().optional(),
  status: z.enum(['active', 'inactive', 'prospect']).default('prospect'),
  notes: z.string().max(5000).optional(),
})

export const UpdateCustomerSchema = CreateCustomerSchema.partial()

export const CustomerQuerySchema = z.object({
  status: z.enum(['active', 'inactive', 'prospect']).optional(),
  search: z.string().max(100).optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().max(100).default(20),
})

const contactLabelEnum = z.enum([
  'primary',
  'secondary',
  'hr',
  'procurement',
  'finance',
  'other',
])

export const CreateCustomerContactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email().max(255).optional(),
  phone: z.string().max(20).optional(),
  label: contactLabelEnum,
  is_primary: z.boolean().default(false),
  notes: z.string().max(2000).optional(),
})

export const UpdateCustomerContactSchema = CreateCustomerContactSchema.partial()

export type CreateCustomerInput = z.infer<typeof CreateCustomerSchema>
export type UpdateCustomerInput = z.infer<typeof UpdateCustomerSchema>
export type CustomerQuery = z.infer<typeof CustomerQuerySchema>
export type CreateCustomerContactInput = z.infer<typeof CreateCustomerContactSchema>
export type UpdateCustomerContactInput = z.infer<typeof UpdateCustomerContactSchema>
