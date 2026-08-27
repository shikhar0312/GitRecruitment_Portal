import * as XLSX from 'xlsx'
import { prisma } from '../../config/prisma'
import { CreateRequirementSchema, CreateRequirementInput } from './requirement.schema'

// ─── Template definition ──────────────────────────────────
// Human-friendly headers HR sees in the sheet, in column order. The
// importer maps these back to schema fields; Client and Role are matched
// by name (not UUID) against existing records.
export const IMPORT_COLUMNS = [
  'Client',
  'Role',
  'Billing Entity',
  'Hiring Type',
  'Status',
  'Priority',
  'Work Mode',
  'Location',
  'Min Exp (years)',
  'Max Exp (years)',
  'No. of Positions',
  'Budget Min',
  'Budget Max',
  'Currency',
  'Timeline (months)',
  'Min Contract (months)',
  'Notice Period Buyback',
  'Required Skills',
  'Nice-to-have Skills',
  'Visa Sponsorship Available',
  'Clearance Required',
  'Expected Start Date',
  'Closing Date',
  'Job Description',
] as const

// One filled example row, so HR sees the expected shape and accepted values.
const EXAMPLE_ROW: Record<string, string | number> = {
  Client: 'HSBC',
  Role: 'DevOps Engineer',
  'Billing Entity': 'UK Ltd',
  'Hiring Type': 'permanent',
  Status: 'open',
  Priority: 'high',
  'Work Mode': 'hybrid',
  Location: 'London',
  'Min Exp (years)': 3,
  'Max Exp (years)': 7,
  'No. of Positions': 2,
  'Budget Min': 70000,
  'Budget Max': 90000,
  Currency: 'GBP',
  'Timeline (months)': 6,
  'Min Contract (months)': '',
  'Notice Period Buyback': 'yes',
  'Required Skills': 'Kubernetes, Terraform, AWS',
  'Nice-to-have Skills': 'Helm, ArgoCD',
  'Visa Sponsorship Available': 'no',
  'Clearance Required': 'BPSS',
  'Expected Start Date': '2026-09-01',
  'Closing Date': '2026-08-15',
  'Job Description': 'DevOps engineer for a cloud migration programme.',
}

// Accepted human labels for the billing entity, mapped to the enum values.
const BILLING_ENTITY_ALIASES: Record<string, CreateRequirementInput['billing_entity']> = {
  'uk ltd': 'git_uk_ltd',
  'git uk ltd': 'git_uk_ltd',
  'git_uk_ltd': 'git_uk_ltd',
  uk: 'git_uk_ltd',
  'india llp': 'git_india_llp',
  'git india llp': 'git_india_llp',
  'git_india_llp': 'git_india_llp',
  india: 'git_india_llp',
  'uae fze': 'git_uae_fze',
  'git uae fze': 'git_uae_fze',
  'git_uae_fze': 'git_uae_fze',
  uae: 'git_uae_fze',
}

export interface ImportRowError {
  row: number
  reasons: string[]
}

export interface ImportPreview {
  valid: CreateRequirementInput[]
  errors: ImportRowError[]
  totalRows: number
}

// ─── Template generation ──────────────────────────────────
export function buildTemplateWorkbook(): Buffer {
  const rows = [EXAMPLE_ROW]
  const sheet = XLSX.utils.json_to_sheet(rows, { header: IMPORT_COLUMNS as unknown as string[] })
  const book = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(book, sheet, 'Requirements')
  return XLSX.write(book, { type: 'buffer', bookType: 'xlsx' }) as Buffer
}

// ─── Parsing helpers ──────────────────────────────────────
function toStr(v: unknown): string {
  return v == null ? '' : String(v).trim()
}

function toBool(v: unknown): boolean {
  const s = toStr(v).toLowerCase()
  return s === 'yes' || s === 'true' || s === 'y' || s === '1'
}

// Blank cells become undefined so optional fields fall through to schema
// defaults rather than failing a min()/type check on an empty string.
function toNum(v: unknown): number | undefined {
  const s = toStr(v)
  if (s === '') return undefined
  const n = Number(s)
  return Number.isNaN(n) ? undefined : n
}

function toList(v: unknown): string[] {
  return toStr(v)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

// A date cell may arrive as an Excel serial, a JS Date, or a string. Normalise
// to an ISO datetime string (what the schema expects) or undefined if blank.
function toIsoDate(v: unknown): string | undefined {
  if (v == null || v === '') return undefined
  if (v instanceof Date) return v.toISOString()
  const s = toStr(v)
  if (s === '') return undefined
  const d = new Date(s)
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString()
}

// ─── Core: parse a file buffer into a validated preview ───
export async function parseRequirementsFile(buffer: Buffer): Promise<ImportPreview> {
  const book = XLSX.read(buffer, { type: 'buffer', cellDates: true })
  const firstSheetName = book.SheetNames[0]
  if (!firstSheetName) {
    return { valid: [], errors: [], totalRows: 0 }
  }
  const sheet = book.Sheets[firstSheetName]
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' })

  // Pre-load clients and roles once and index them by lower-cased name, so
  // matching every row is an in-memory lookup rather than a query per row.
  const [customers, roles] = await Promise.all([
    prisma.customers.findMany({ select: { id: true, name: true } }),
    prisma.roles.findMany({ select: { id: true, title: true } }),
  ])
  const customerByName = new Map(customers.map((c) => [c.name.trim().toLowerCase(), c.id]))
  const roleByName = new Map(roles.map((r) => [r.title.trim().toLowerCase(), r.id]))

  const valid: CreateRequirementInput[] = []
  const errors: ImportRowError[] = []

  rawRows.forEach((raw, index) => {
    // +2: sheet rows are 1-based and row 1 is the header, so the first data
    // row is sheet row 2 — this is the number HR sees in Excel.
    const rowNumber = index + 2
    const reasons: string[] = []

    // Skip fully-blank rows silently (trailing empty rows are common).
    const isBlank = IMPORT_COLUMNS.every((col) => toStr(raw[col]) === '')
    if (isBlank) return

    const clientName = toStr(raw['Client'])
    const roleName = toStr(raw['Role'])
    const customerId = customerByName.get(clientName.toLowerCase())
    const roleId = roleByName.get(roleName.toLowerCase())

    if (!clientName) reasons.push('Client is required')
    else if (!customerId) reasons.push(`Client "${clientName}" not found`)
    if (!roleName) reasons.push('Role is required')
    else if (!roleId) reasons.push(`Role "${roleName}" not found`)

    const entityRaw = toStr(raw['Billing Entity']).toLowerCase()
    const billingEntity = BILLING_ENTITY_ALIASES[entityRaw]
    if (!entityRaw) reasons.push('Billing Entity is required')
    else if (!billingEntity) reasons.push(`Billing Entity "${toStr(raw['Billing Entity'])}" is not valid`)

    const candidate = {
      customer_id: customerId,
      role_id: roleId,
      billing_entity: billingEntity,
      status: toStr(raw['Status']).toLowerCase() || undefined,
      priority: toStr(raw['Priority']).toLowerCase() || undefined,
      work_mode: toStr(raw['Work Mode']).toLowerCase(),
      hiring_type: toStr(raw['Hiring Type']).toLowerCase(),
      location: toStr(raw['Location']),
      min_exp_years: toNum(raw['Min Exp (years)']),
      max_exp_years: toNum(raw['Max Exp (years)']),
      no_of_positions: toNum(raw['No. of Positions']),
      budget_min: toNum(raw['Budget Min']),
      budget_max: toNum(raw['Budget Max']),
      budget_currency: toStr(raw['Currency']).toUpperCase() || undefined,
      ttl_months: toNum(raw['Timeline (months)']),
      min_contract_months: toNum(raw['Min Contract (months)']),
      notice_period_buyback: toBool(raw['Notice Period Buyback']),
      required_skills: toList(raw['Required Skills']),
      nice_to_have_skills: toList(raw['Nice-to-have Skills']),
      visa_sponsorship_available: toStr(raw['Visa Sponsorship Available'])
        ? toBool(raw['Visa Sponsorship Available'])
        : undefined,
      clearance_required: toStr(raw['Clearance Required']) || undefined,
      expected_start_date: toIsoDate(raw['Expected Start Date']),
      closing_date: toIsoDate(raw['Closing Date']),
      job_description: toStr(raw['Job Description']) || undefined,
    }

    // Run the same Zod schema the manual form uses, so import validation can
    // never drift from single-entry validation. Fields we already reported a
    // friendly name-lookup message for are suppressed here, so HR sees
    // "Client X not found" rather than a second raw "expected string" error.
    const alreadyReported = new Set<string>()
    if (!customerId) alreadyReported.add('customer_id')
    if (!roleId) alreadyReported.add('role_id')
    if (!billingEntity) alreadyReported.add('billing_entity')

    const parsed = CreateRequirementSchema.safeParse(candidate)
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path.join('.') || 'row'
        if (alreadyReported.has(field)) continue
        reasons.push(`${field}: ${issue.message}`)
      }
    }

    if (reasons.length > 0) {
      errors.push({ row: rowNumber, reasons })
    } else if (parsed.success) {
      valid.push(parsed.data)
    }
  })

  return { valid, errors, totalRows: valid.length + errors.length }
}

// ─── Commit: create the already-validated rows ────────────
// Re-validates each row (defence in depth — the client sends back the rows,
// so never trust them) and inserts the valid ones in a single transaction.
export async function commitRequirements(
  rows: unknown[],
  createdBy: string
): Promise<{ created: number; skipped: number }> {
  const toCreate: CreateRequirementInput[] = []
  for (const row of rows) {
    const parsed = CreateRequirementSchema.safeParse(row)
    if (parsed.success) toCreate.push(parsed.data)
  }

  if (toCreate.length === 0) {
    return { created: 0, skipped: rows.length }
  }

  await prisma.$transaction(
    toCreate.map((data) =>
      prisma.requirements.create({
        data: {
          ...data,
          expected_start_date: data.expected_start_date
            ? new Date(data.expected_start_date)
            : undefined,
          closing_date: data.closing_date ? new Date(data.closing_date) : undefined,
          created_by: createdBy,
        },
      })
    )
  )

  return { created: toCreate.length, skipped: rows.length - toCreate.length }
}
