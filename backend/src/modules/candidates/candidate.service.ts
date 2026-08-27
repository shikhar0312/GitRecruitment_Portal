import fs from 'fs'
import path from 'path'
import { prisma } from '../../config/prisma'
import { NotFoundError, ConflictError } from '../../shared/errors'
import { getPagination, getPaginationMeta } from '../../shared/utils/pagination'
import {
  CreateCandidateInput,
  UpdateCandidateInput,
  CandidateQuery,
  CreateSkillInput,
  CreateWorkHistoryInput,
  CreateEducationInput,
  CreateCertificationInput,
  CreateLanguageInput,
} from './candidate.schema'
import { getSorting } from '../../shared/utils/sorting'

const candidateChildInclude = {
  skills: true,
  work_history: { orderBy: { start_date: 'desc' as const } },
  education: { orderBy: { start_year: 'desc' as const } },
  certifications: { orderBy: { issue_date: 'desc' as const } },
  languages: true,
}

export async function listCandidates(query: CandidateQuery) {
  const { skip, take, page, limit } = getPagination(query)
  const orderBy = getSorting(
    query.sortBy,
    query.sortOrder,
    ['created_at', 'exp_years', 'availability_date'],
    'created_at'
  )

  const where = {
    ...(query.status && { status: query.status }),
    ...(query.availability_status && {
      availability_status: query.availability_status,
    }),
    ...(query.min_exp !== undefined && {
      exp_years: { gte: query.min_exp },
    }),
    ...(query.max_exp !== undefined && {
      exp_years: { lte: query.max_exp },
    }),
    ...(query.search && {
      OR: [
        { full_name: { contains: query.search, mode: 'insensitive' as const } },
        { email: { contains: query.search, mode: 'insensitive' as const } },
        { current_role: { contains: query.search, mode: 'insensitive' as const } },
      ],
    }),
  }

  const [data, total] = await Promise.all([
    prisma.candidates.findMany({
      where,
      skip,
      take,
      orderBy,
      select: {
        id: true,
        full_name: true,
        email: true,
        phone: true,
        current_location: true,
        exp_years: true,
        current_company: true,
        current_role: true,
        availability_status: true,
        status: true,
        currency: true,
        expected_ctc: true,
        expected_day_rate: true,
        created_at: true,
        skills: {
          where: { is_primary: true },
          select: { skill: true, proficiency: true },
        },
      },
    }),
    prisma.candidates.count({ where }),
  ])

  return {
    data,
    meta: getPaginationMeta(total, page, limit),
  }
}

export async function getCandidateById(id: string) {
  const candidate = await prisma.candidates.findUnique({
    where: { id },
    include: candidateChildInclude,
  })

  if (!candidate) throw new NotFoundError('Candidate not found')
  return candidate
}

// ─── Resume file storage ──────────────────────────────────
// The resume is attached to a candidate after creation: HR uploads it in
// the split-screen add flow, we save it to disk and store a candidate-scoped
// path in resume_url. Files are streamed back through an auth-protected
// route (see downloadCandidateResume) rather than a public static dir.
const RESUME_DIR = path.join(process.cwd(), 'uploads', 'resumes')

export async function attachCandidateResume(
  candidateId: string,
  fileBuffer: Buffer,
  originalFilename: string
) {
  const candidate = await prisma.candidates.findUnique({ where: { id: candidateId } })
  if (!candidate) throw new NotFoundError('Candidate not found')

  if (!fs.existsSync(RESUME_DIR)) {
    fs.mkdirSync(RESUME_DIR, { recursive: true })
  }

  const safeName = `${candidateId}-${Date.now()}-${originalFilename.replace(/[^a-z0-9.\-_]/gi, '_')}`
  const filePath = path.join(RESUME_DIR, safeName)
  fs.writeFileSync(filePath, fileBuffer)

  // resume_url stores the API path the frontend fetches, not the disk path.
  const resumeUrl = `/candidates/${candidateId}/resume`
  await prisma.candidates.update({
    where: { id: candidateId },
    data: { resume_url: resumeUrl },
  })

  // The disk location is derived from the stored file, so remember it via a
  // sidecar lookup: we re-scan the dir by prefix when serving (see below).
  return { resume_url: resumeUrl, stored_path: filePath }
}

export async function getCandidateResumePath(candidateId: string): Promise<string> {
  const candidate = await prisma.candidates.findUnique({
    where: { id: candidateId },
    select: { resume_url: true },
  })
  if (!candidate) throw new NotFoundError('Candidate not found')
  if (!candidate.resume_url) throw new NotFoundError('This candidate has no resume on file')

  // Files are named "<candidateId>-<timestamp>-<name>"; the newest match wins
  // if a resume was replaced.
  if (!fs.existsSync(RESUME_DIR)) throw new NotFoundError('Resume file not found')
  const matches = fs
    .readdirSync(RESUME_DIR)
    .filter((name) => name.startsWith(`${candidateId}-`))
    .sort()
  const latest = matches[matches.length - 1]
  if (!latest) throw new NotFoundError('Resume file not found')
  return path.join(RESUME_DIR, latest)
}

export async function createCandidate(
  data: CreateCandidateInput,
  createdBy: string
) {
  const existing = await prisma.candidates.findUnique({
    where: { email: data.email },
  })
  if (existing) throw new ConflictError('A candidate with this email already exists')

  return prisma.candidates.create({
    data: {
      ...data,
      date_of_birth: data.date_of_birth ? new Date(data.date_of_birth) : undefined,
      availability_date: data.availability_date
        ? new Date(data.availability_date)
        : undefined,
      security_clearance_expiry: data.security_clearance_expiry
        ? new Date(data.security_clearance_expiry)
        : undefined,
      created_by: createdBy,
    },
    include: candidateChildInclude,
  })
}

export async function updateCandidate(id: string, data: UpdateCandidateInput) {
  await getCandidateById(id)
  return prisma.candidates.update({
    where: { id },
    data: {
      ...data,
      date_of_birth: data.date_of_birth ? new Date(data.date_of_birth) : undefined,
      availability_date: data.availability_date
        ? new Date(data.availability_date)
        : undefined,
      security_clearance_expiry: data.security_clearance_expiry
        ? new Date(data.security_clearance_expiry)
        : undefined,
    },
    include: candidateChildInclude,
  })
}

// ─── Skills ────────────────────────────────────────────────

export async function addSkill(candidateId: string, data: CreateSkillInput) {
  await getCandidateById(candidateId)
  return prisma.candidate_skills.create({
    data: { ...data, candidate_id: candidateId },
  })
}

export async function deleteSkill(candidateId: string, skillId: string) {
  await getCandidateById(candidateId)
  const skill = await prisma.candidate_skills.findFirst({
    where: { id: skillId, candidate_id: candidateId },
  })
  if (!skill) throw new NotFoundError('Skill not found')
  return prisma.candidate_skills.delete({ where: { id: skillId } })
}

// ─── Work History ───────────────────────────────────────────

export async function addWorkHistory(
  candidateId: string,
  data: CreateWorkHistoryInput
) {
  await getCandidateById(candidateId)
  return prisma.candidate_work_history.create({
    data: {
      ...data,
      candidate_id: candidateId,
      start_date: new Date(data.start_date),
      end_date: data.end_date ? new Date(data.end_date) : undefined,
    },
  })
}

export async function deleteWorkHistory(candidateId: string, entryId: string) {
  await getCandidateById(candidateId)
  const entry = await prisma.candidate_work_history.findFirst({
    where: { id: entryId, candidate_id: candidateId },
  })
  if (!entry) throw new NotFoundError('Work history entry not found')
  return prisma.candidate_work_history.delete({ where: { id: entryId } })
}

// ─── Education ─────────────────────────────────────────────

export async function addEducation(
  candidateId: string,
  data: CreateEducationInput
) {
  await getCandidateById(candidateId)
  return prisma.candidate_education.create({
    data: { ...data, candidate_id: candidateId },
  })
}

export async function deleteEducation(candidateId: string, entryId: string) {
  await getCandidateById(candidateId)
  const entry = await prisma.candidate_education.findFirst({
    where: { id: entryId, candidate_id: candidateId },
  })
  if (!entry) throw new NotFoundError('Education entry not found')
  return prisma.candidate_education.delete({ where: { id: entryId } })
}

// ─── Certifications ────────────────────────────────────────

export async function addCertification(
  candidateId: string,
  data: CreateCertificationInput
) {
  await getCandidateById(candidateId)
  return prisma.candidate_certifications.create({
    data: {
      ...data,
      candidate_id: candidateId,
      issue_date: data.issue_date ? new Date(data.issue_date) : undefined,
      expiry_date: data.expiry_date ? new Date(data.expiry_date) : undefined,
    },
  })
}

export async function deleteCertification(candidateId: string, certId: string) {
  await getCandidateById(candidateId)
  return prisma.candidate_certifications.delete({ where: { id: certId } })
}

// ─── Languages ─────────────────────────────────────────────

export async function addLanguage(
  candidateId: string,
  data: CreateLanguageInput
) {
  await getCandidateById(candidateId)
  return prisma.candidate_languages.create({
    data: { ...data, candidate_id: candidateId },
  })
}

export async function deleteLanguage(candidateId: string, langId: string) {
  await getCandidateById(candidateId)
  return prisma.candidate_languages.delete({ where: { id: langId } })
}