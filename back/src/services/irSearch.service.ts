 import { PrismaClient } from '@prisma/client'; 

import { normalizePersian } from '../utils/textNormalizer';
import { PythonSearchService } from './pythonSearch.service';

const prisma = new PrismaClient();

export interface IRSearchResult {
  chunkId: string;
  documentId: string;
  fileName: string;
  documentTitle: string;
  text: string;
  snippet: string;
  score: number;
}

/**
 * IR (Information Retrieval) search service.
 * Uses retrieval chunks and delegates to Python GPU API for BM25/TF-IDF.
 * Falls back to local search if API unavailable.
 */
export class IRSearchService {
  private pythonService: PythonSearchService;

  constructor() {
    this.pythonService = new PythonSearchService();
  }
async search(query: string): Promise<IRSearchResult[]> {

  const normalizedQuery = normalizePersian(query);

  if (!normalizedQuery) return [];

  const pythonResult = await this.pythonService.search({
    query: normalizedQuery,
    mode: 'ir'
  });

  if (!pythonResult) {
    throw new Error("Python search service unavailable");
  }

  const rankedChunkIds = pythonResult.results;

  if (rankedChunkIds.length === 0) return [];

  const chunkIds = rankedChunkIds.map(r => r.chunkId);

  const chunks = await prisma.chunk.findMany({
    where: {
      id: { in: chunkIds }
    },
    select: {
      id: true,
      documentId: true,
      text: true,
      metadata: true
    }
  });

  const chunkMap = new Map(chunks.map(c => [c.id, c]));

  const documentIds = [...new Set(chunks.map(c => c.documentId))];

  const documents = await prisma.document.findMany({
    where: { id: { in: documentIds } },
    select: {
      id: true,
      title: true
    }
  });

  const docMap = new Map(documents.map(d => [d.id, d]));

  return rankedChunkIds
    .map(({ chunkId, score }) => {

      const chunk = chunkMap.get(chunkId);
      if (!chunk) return null;

      const doc = docMap.get(chunk.documentId);

      return {
        chunkId: chunk.id,
        documentId: chunk.documentId,
        documentTitle: doc?.title ?? "Unknown",
        text: chunk.text,
        snippet: "this.createSnippet(chunk.text, normalizedQuery)",
        score
      };
    })
    .filter((r): r is IRSearchResult => r !== null);
}
}