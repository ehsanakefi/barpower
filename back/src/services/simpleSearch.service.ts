import { PrismaClient } from '@prisma/client'; 

import { normalizePersian } from '../utils/textNormalizer';

const prisma = new PrismaClient();

export interface SimpleSearchResult {
  chunkId: string;
  documentId: string;
  // fileName: string;
  documentTitle: string;
  text: string;
  snippet: string;
  score: number;
}

/**
 * Simple search service using paragraph chunks.
 * Performs regex/text search on normalized text.
 */
export class SimpleSearchService {
  async search(query: string): Promise<SimpleSearchResult[]> {
    const normalizedQuery = normalizePersian(query);
    
    if (!normalizedQuery) {
      return [];
    }

    // Search in paragraph chunks only
    const chunks = await prisma.chunk.findMany({
      where: {
        type: 'PARAGRAPH',
        normalizedText: {
          contains: normalizedQuery,
        },
      },
    });

    // Get associated documents
    const documentIds = [...new Set(chunks.map(c => c.documentId))];
    const documents = await prisma.document.findMany({
      where: {
        id: {
          in: documentIds,
        },
      },
    });

    const docMap = new Map(documents.map(d => [d.id, d]));

    // Build results with snippets
    const results: SimpleSearchResult[] = chunks.map(chunk => {
      const doc = docMap.get(chunk.documentId);
      const snippet = this.createSnippet(chunk.text, normalizedQuery);

      return {
        chunkId: chunk.id,
        documentId: chunk.documentId,
        // fileName: doc?.title || chunk.metadata.fileName,
         documentTitle: doc?.title ? doc.title : chunk.metadata&& chunk.metadata.fileName || "Unknown Document",
        text: chunk.text,
        snippet,
        score: this.calculateSimpleScore(chunk.normalizedText, normalizedQuery),
      };
    });

    // Sort by score descending
    return results.sort((a, b) => b.score - a.score);
  }

  /**
   * Create a snippet with the query highlighted.
   */
  private createSnippet(text: string, query: string, contextLength: number = 100): string {
    const normalizedText = normalizePersian(text);
    const index = normalizedText.toLowerCase().indexOf(query.toLowerCase());

    if (index === -1) {
      return text.substring(0, contextLength) + '...';
    }

    const start = Math.max(0, index - contextLength / 2);
    const end = Math.min(text.length, index + query.length + contextLength / 2);

    let snippet = text.substring(start, end);
    if (start > 0) snippet = '...' + snippet;
    if (end < text.length) snippet = snippet + '...';

    return snippet;
  }

  /**
   * Simple scoring based on exact match count and position.
   */
  private calculateSimpleScore(text: string, query: string): number {
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();

    // Count occurrences
    const matches = (lowerText.match(new RegExp(lowerQuery, 'g')) || []).length;
    
    // Higher score if query appears at the beginning
    const startsWithQuery = lowerText.startsWith(lowerQuery) ? 10 : 0;

    return matches * 10 + startsWithQuery;
  }
}
