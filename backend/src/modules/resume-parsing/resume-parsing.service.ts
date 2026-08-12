import fs from 'fs'
import path from 'path'
import { prisma } from '../../config/prisma'
import { env } from '../../config/env'
import { logger } from '../../config/logger'
import { NotFoundError, ValidationError } from '../../shared/errors'
import { OpenAiOcrProvider } from './providers/openai-ocr.provider'
import { LocalOcrProvider } from './providers/local-ocr.provider'
import type { ResumeParsingProvider } from './providers/ocr-provider.interface'
import type { ConfirmResumeInput } from './resume-parsing.schema'

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'resumes')

function getProvider(): ResumeParsingProvider {
  if (env.OCR_PROVIDER === 'openai') return new OpenAiOcrProvider()
  return new LocalOcrProvider()
}

export async function uploadAndParseResume(
  fileBuffer: Buffer,
  filename: string,
  mimeType: string,
  uploadedBy: string
) {
  // Ensure upload directory exists
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true })
  }

  // Save file to disk
  const safeFilename = `${Date.now()}-${filename.replace(/[^a-z0-9.\-_]/gi, '_')}`
  const filePath = path.join(UPLOAD_DIR, safeFilename)
  fs.writeFileSync(filePath, fileBuffer)

  // Create upload record with pending status
  const upload = await prisma.resume_uploads.create({
    data: {
      original_filename: filename,
      file_path: filePath,
      file_type: mimeType,
      status: 'pending',
      uploaded_by: uploadedBy,
    },
  })

  logger.info({ uploadId: upload.id, filename }, 'Resume upload saved, starting parse')

  // Update to processing
  await prisma.resume_uploads.update({
    where: { id: upload.id },
    data: { status: 'processing' },
  })

  try {
    const provider = getProvider()
    const parsed = await provider.extractAndParse(filePath, mimeType)

    await prisma.resume_uploads.update({
      where: { id: upload.id },
      data: {
        status: 'parsed',
        raw_ocr_text: parsed.raw_ocr_text,
        parsed_data: parsed as any,
      },
    })

    logger.info({ uploadId: upload.id }, 'Resume parsed successfully')

    return { upload_id: upload.id, parsed_data: parsed }
  } catch (err: any) {
    await prisma.resume_uploads.update({
      where: { id: upload.id },
      data: {
        status: 'failed',
        error_message: err.message,
      },
    })

    logger.error({ uploadId: upload.id, error: err.message }, 'Resume parsing failed')
    throw err
  }
}

export async function getResumeUpload(uploadId: string) {
  const upload = await prisma.resume_uploads.findUnique({
    where: { id: uploadId },
  })

  if (!upload) throw new NotFoundError('Resume upload not found')
  return upload
}

export async function confirmAndSaveCandidate(
  uploadId: string,
  data: ConfirmResumeInput,
  createdBy: string
) {
  const upload = await getResumeUpload(uploadId)

  if (upload.status !== 'parsed') {
    throw new ValidationError(
      'Cannot confirm — resume must be in parsed status first'
    )
  }

  if (upload.candidate_id) {
    throw new ValidationError(
      'This resume has already been confirmed and saved as a candidate'
    )
  }

  const { skills, work_history, education, ...candidateData } = data

  const candidate = await prisma.$transaction(async (tx) => {
    // Check for duplicate email
    const existing = await tx.candidates.findUnique({
      where: { email: candidateData.email },
    })
    if (existing) {
      throw new ValidationError(
        `A candidate with email ${candidateData.email} already exists`
      )
    }

    // Create candidate
    const newCandidate = await tx.candidates.create({
      data: {
        ...candidateData,
        created_by: createdBy,
      },
    })

    // Create skills
    if (skills.length > 0) {
      await tx.candidate_skills.createMany({
        data: skills.map((s) => ({
          candidate_id: newCandidate.id,
          skill: s.skill,
          years_exp: s.years_exp,
          proficiency: s.proficiency as any,
          is_primary: s.is_primary,
        })),
      })
    }

    // Create work history
    if (work_history.length > 0) {
      await tx.candidate_work_history.createMany({
        data: work_history.map((w) => ({
          candidate_id: newCandidate.id,
          company_name: w.company_name,
          role_title: w.role_title,
          employment_type: w.employment_type as any,
          start_date: w.start_date ? new Date(w.start_date) : new Date('2020-01-01'),
          end_date: w.end_date ? new Date(w.end_date) : undefined,
          is_current: w.is_current,
          responsibilities: w.responsibilities,
          technologies_used: w.technologies_used,
        })),
      })
    }

    // Create education
    if (education.length > 0) {
      await tx.candidate_education.createMany({
        data: education.map((e) => ({
          candidate_id: newCandidate.id,
          institution: e.institution,
          degree: e.degree,
          field_of_study: e.field_of_study,
          start_year: e.start_year,
          end_year: e.end_year,
          is_current: e.is_current,
        })),
      })
    }

    // Link upload to candidate
    await tx.resume_uploads.update({
      where: { id: uploadId },
      data: { candidate_id: newCandidate.id },
    })

    return newCandidate
  })

  logger.info(
    { uploadId, candidateId: candidate.id },
    'Resume confirmed and candidate created'
  )

  return candidate
}