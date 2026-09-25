import mammoth from 'mammoth';

/**
 * Extract raw text from a .docx file buffer.
 * Uses mammoth library to convert .docx to plain text.
 */
export async function extractTextFromDocx(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    throw new Error(`Failed to extract text from .docx: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
