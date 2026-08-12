import fs from 'fs'
import OpenAI from 'openai'
import { env } from '../../../config/env'
import { logger } from '../../../config/logger'
import { AppError } from '../../../shared/errors'
import type { ResumeParsingProvider, ParsedResumeData } from './ocr-provider.interface'

const SYSTEM_PROMPT = `You are a resume parser. Extract structured data from 
the resume image and return ONLY a valid JSON object with no markdown, no 
backticks, no explanation — just raw JSON.

The JSON must follow this exact structure:
{
  "full_name": "string or null",
  "email": "string or null",
  "phone": "string or null",
  "current_location": "string or null",
  "exp_years": "number or null (total years of experience)",
  "current_company": "string or null",
  "current_role": "string or null",
  "highest_qualification": "string or null",
  "skills": [
    {
      "skill": "string",
      "years_exp": "number or null",
      "proficiency": "beginner | intermediate | advanced | expert or null",
      "is_primary": "boolean (true if clearly a core skill)"
    }
  ],
  "work_history": [
    {
      "company_name": "string",
      "role_title": "string",
      "start_date": "YYYY-MM-DD or null",
      "end_date": "YYYY-MM-DD or null",
      "is_current": "boolean",
      "responsibilities": "string or null (brief summary)",
      "technologies_used": ["string"]
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "field_of_study": "string or null",
      "start_year": "number or null",
      "end_year": "number or null"
    }
  ],
  "raw_ocr_text": "full plain text content of the resume as a single string"
}`

export class OpenAiOcrProvider implements ResumeParsingProvider {
  private client: OpenAI

  constructor() {
    this.client = new OpenAI({ apiKey: env.OPENAI_API_KEY })
  }

  async extractAndParse(filePath: string, mimeType: string): Promise<ParsedResumeData> {
    logger.info({ filePath }, 'OpenAI OCR provider: starting parse')

    const fileBuffer = fs.readFileSync(filePath)
    const base64 = fileBuffer.toString('base64')
    const dataUrl = `data:${mimeType};base64,${base64}`

    let rawResponse: string

    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: dataUrl,
                  detail: 'high',
                },
              },
              {
                type: 'text',
                text: 'Parse this resume and return the JSON.',
              },
            ],
          },
        ],
        max_tokens: 4096,
        temperature: 0,
      })

      rawResponse = response.choices[0]?.message?.content ?? ''

      logger.info({ filePath }, 'OpenAI OCR provider: response received')
    } catch (err: any) {
      logger.error({ filePath, error: err.message }, 'OpenAI OCR provider: API call failed')
      throw new AppError(
        `OpenAI API call failed: ${err.message}`,
        502,
        'OCR_PROVIDER_ERROR'
      )
    }

    try {
      const cleaned = rawResponse
        .replace(/```json\n?/gi, '')
        .replace(/```\n?/gi, '')
        .trim()

      const parsed = JSON.parse(cleaned) as ParsedResumeData
      parsed.raw_ocr_text = parsed.raw_ocr_text ?? rawResponse

      return parsed
    } catch {
      logger.error(
        { filePath, rawResponse },
        'OpenAI OCR provider: failed to parse JSON response'
      )
      throw new AppError(
        'Failed to parse structured data from resume. The model returned invalid JSON.',
        422,
        'OCR_PARSE_ERROR'
      )
    }
  }
}