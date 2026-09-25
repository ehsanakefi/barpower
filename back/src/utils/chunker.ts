import { randomUUID } from 'crypto';
import { Prisma, ChunkType } from '@prisma/client';
import { normalizePersian } from './textNormalizer';

export interface ChunkData {
  id: string;
  documentId: string;
  versionId: string;
  chunkIndex: number;
  type: ChunkType;
  text: string;
  normalizedText: string;
  paragraphStart: number;
  paragraphEnd: number;
  charLength: number;
  metadata: Prisma.InputJsonValue;
}

interface ChunkConfig {
  minSize: number;
  maxSize: number;
  overlap: number;
}

const RETRIEVAL_CONFIG: ChunkConfig = {
  minSize: 300,
  maxSize: 1500,
  overlap: 1,
};

const RAG_CONFIG: ChunkConfig = {
  minSize: 800,
  maxSize: 2500,
  overlap: 1,
};

function buildParagraphChunks(
  paragraphs: string[],
  documentId: string,
  fileName: string,
  uploadDate: string,
  versionId: string
): ChunkData[] {
  return paragraphs.map((text, index) => ({
    id: randomUUID(),
    documentId,
    versionId,
    chunkIndex: index,
    type: 'PARAGRAPH' as ChunkType,
    text,
    normalizedText: normalizePersian(text),
    paragraphStart: index,
    paragraphEnd: index,
    charLength: text.length,
    metadata: { fileName, uploadDate },
  }));
}

function buildWindowedChunks(
  paragraphs: string[],
  documentId: string,
  fileName: string,
  uploadDate: string,
  type: ChunkType,
  config: ChunkConfig,
  versionId: string
): ChunkData[] {
  const chunks: ChunkData[] = [];
  let chunkIndex = 0;
  let start = 0;

  while (start < paragraphs.length) {
    let end = start;
    let combinedText = paragraphs[start];

    while (end + 1 < paragraphs.length && combinedText.length < config.minSize) {
      end++;
      combinedText += '\n\n' + paragraphs[end];
    }

    while (
      end + 1 < paragraphs.length &&
      (combinedText + '\n\n' + paragraphs[end + 1]).length <= config.maxSize
    ) {
      end++;
      combinedText += '\n\n' + paragraphs[end];
    }

    chunks.push({
      id: randomUUID(),
      documentId,
      versionId,
      chunkIndex,
      type,
      text: combinedText,
      normalizedText: normalizePersian(combinedText),
      paragraphStart: start,
      paragraphEnd: end,
      charLength: combinedText.length,
      metadata: { fileName, uploadDate },
    });

    chunkIndex++;
    start = Math.max(start + 1, end + 1 - config.overlap);
  }

  return chunks;
}

export function createAllChunks(
  paragraphs: string[],
  documentId: string,
  fileName: string,
  uploadDate: string,
  versionId: string
): ChunkData[] {
  if (paragraphs.length === 0) return [];

  const paragraphChunks = buildParagraphChunks(
    paragraphs,
    documentId,
    fileName,
    uploadDate,
    versionId
  );

  const retrievalChunks = buildWindowedChunks(
    paragraphs,
    documentId,
    fileName,
    uploadDate,
    'RETRIEVAL',
    RETRIEVAL_CONFIG,
    versionId
  );

  const ragChunks = buildWindowedChunks(
    paragraphs,
    documentId,
    fileName,
    uploadDate,
    'RAG',
    RAG_CONFIG,
    versionId
  );

  return [...paragraphChunks, ...retrievalChunks, ...ragChunks];
}
