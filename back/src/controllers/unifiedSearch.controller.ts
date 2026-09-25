import { Request, Response } from 'express';
import { SimpleSearchService } from '../services/simpleSearch.service';
import { IRSearchService } from '../services/irSearch.service';
import { RAGSearchService } from '../services/ragSearch.service';

const simpleSearchService = new SimpleSearchService();
const irSearchService = new IRSearchService();
const ragSearchService = new RAGSearchService();

export type SearchMode = 'simple' | 'ir' | 'rag';

/**
 * Unified search controller supporting multiple search modes.
 * 
 * GET /api/search?q=QUERY&mode=MODE
 * 
 * Modes:
 *  - simple: exact/regex text search on paragraph chunks
 *  - ir: classical IR (BM25/TF-IDF) via Python API or local fallback
 *  - rag: vector search via Python API or local text fallback
 */
export const unifiedSearchController = async (req: Request, res: Response) => {
  try {
    const { q, mode } = req.query;

    // Validate query
    if (!q || typeof q !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Query parameter "q" is required',
      });
    }

    // Validate mode
    const searchMode = (mode as string) || 'simple';
    if (!['simple', 'ir', 'rag'].includes(searchMode)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid search mode. Valid modes: simple, ir, rag',
      });
    }

    // Execute search based on mode
    let results: any[];
    let searchType: string;

    switch (searchMode) {
      case 'simple':
        results = await simpleSearchService.search(q);
        searchType = 'Simple Text Search';
        break;

      case 'ir':
        results = await irSearchService.search(q);
        searchType = 'Information Retrieval (BM25/TF-IDF)';
        break;

      case 'rag':
        results = await ragSearchService.search(q);
        searchType = 'RAG Vector Search';
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Unknown search mode',
        });
    }

    return res.status(200).json({
      success: true,
      searchType,
      mode: searchMode,
      query: q,
      count: results.length,
      results,
    });
  } catch (error) {
    console.error('Unified search error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during search',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
