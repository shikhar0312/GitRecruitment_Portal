import { z } from 'zod';

export const customerStatusSchema = z.enum(['active', 'inactive', 'prospect']);

export const createCustomerFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  industry: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  status: customerStatusSchema.default('active'),
});

export type CreateCustomerFormValues = z.infer<typeof createCustomerFormSchema>;

export const createCustomerFormDefaults: CreateCustomerFormValues = {
  name: '',
  industry: '',
  country: '',
  city: '',
  status: 'active',
};

export function toCreateCustomerPayload(values: CreateCustomerFormValues) {
  const parsed = createCustomerFormSchema.parse(values);
  const payload: Record<string, unknown> = {
    name: parsed.name,
    status: parsed.status,
    industry: parsed.industry,
    country: parsed.country,
    city: parsed.city,
  };

  return payload;
}

export const toUpdateCustomerPayload = toCreateCustomerPayload;

// ─── Customer Contacts ──────────────────────────────────────

export const contactLabelSchema = z.enum([
  'primary',
  'secondary',
  'hr',
  'procurement',
  'finance',
  'other',
]);

export const CONTACT_LABEL_OPTIONS: { value: z.infer<typeof contactLabelSchema>; label: string }[] = [
  { value: 'primary', label: 'Primary' },
  { value: 'secondary', label: 'Secondary' },
  { value: 'hr', label: 'HR' },
  { value: 'procurement', label: 'Procurement' },
  { value: 'finance', label: 'Finance' },
  { value: 'other', label: 'Other' },
];

export const customerContactFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z
    .union([z.literal(''), z.string().email('Invalid email address').max(255)])
    .optional(),
  phone: z.string().max(20).optional(),
  label: contactLabelSchema,
  is_primary: z.boolean().default(false),
  notes: z.string().max(2000).optional(),
});

export type CustomerContactFormValues = z.infer<typeof customerContactFormSchema>;

export const customerContactFormDefaults: CustomerContactFormValues = {
  name: '',
  email: '',
  phone: '',
  label: 'secondary',
  is_primary: false,
  notes: '',
};

export function toCustomerContactPayload(values: CustomerContactFormValues) {
  const parsed = customerContactFormSchema.parse(values);
  const payload: Record<string, unknown> = {
    name: parsed.name,
    label: parsed.label,
    is_primary: parsed.is_primary,
  };
  if (parsed.email) payload.email = parsed.email;
  if (parsed.phone) payload.phone = parsed.phone;
  if (parsed.notes) payload.notes = parsed.notes;
  return payload;
}
