import type { ResumeParsingProvider, ParsedResumeData } from './ocr-provider.interface'

export class LocalOcrProvider implements ResumeParsingProvider {
  async extractAndParse(_filePath: string, _mimeType: string): Promise<ParsedResumeData> {
    throw new Error('Local OCR provider not yet implemented. Set OCR_PROVIDER=openai to use OpenAI.')
  }
}