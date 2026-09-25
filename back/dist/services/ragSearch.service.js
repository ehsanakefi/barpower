"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RAGSearchService = void 0;
const client_1 = require("@prisma/client");
const textNormalizer_1 = require("../utils/textNormalizer");
const pythonSearch_service_1 = require("./pythonSearch.service");
const prisma = new client_1.PrismaClient();
/**
 * RAG (Retrieval-Augmented Generation) search service.
 * Uses rag chunks and delegates to Python GPU API for vector search.
 * Falls back to text search if API unavailable.
 */
class RAGSearchService {
    constructor() {
        this.pythonService = new pythonSearch_service_1.PythonSearchService();
    }
    async search(query) {
        const normalizedQuery = (0, textNormalizer_1.normalizePersian)(query);
        if (!normalizedQuery) {
            return [];
        }
        // Get RAG chunks
        const chunks = await prisma.chunk.findMany({
            where: {
                type: 'RAG',
            },
        });
        if (chunks.length === 0) {
            return [];
        }
        // Try Python API for vector search
        const pythonResult = await this.pythonService.searchWithFallback({
            query: normalizedQuery,
            mode: 'rag',
            // chunks: chunks.map(c => ({
            //   id: c.id,
            //   text: c.text,
            //   normalizedText: c.normalizedText,
            // })),
        });
        let rankedChunkIds;
        if (pythonResult) {
            // Use Python API results (vector search + embeddings)
            rankedChunkIds = pythonResult.results;
        }
        else {
            // Fallback to local text-based search
            console.warn('RAG search falling back to text search (Python API unavailable)');
            rankedChunkIds = this.localTextSearch(chunks, normalizedQuery);
        }
        // Map results to chunks
        const chunkMap = new Map(chunks.map(c => [c.id, c]));
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
        // Build final results
        const results = rankedChunkIds
            .map(({ chunkId, score }) => {
            const chunk = chunkMap.get(chunkId);
            if (!chunk)
                return null;
            const doc = docMap.get(chunk.documentId);
            return {
                chunkId: chunk.id,
                documentId: chunk.documentId,
                // fileName: doc?.title || chunk.metadata.fileName,
                text: chunk.text,
                score,
            };
        })
            .filter((r) => r !== null);
        return results;
    }
    /**
     * Local fallback text search when vector search unavailable.
     */
    localTextSearch(chunks, query) {
        const queryTerms = query.toLowerCase().split(/\s+/);
        const scored = chunks.map(chunk => {
            const text = chunk.normalizedText.toLowerCase();
            let score = 0;
            for (const queryTerm of queryTerms) {
                if (text.includes(queryTerm)) {
                    score += 10;
                }
            }
            return { chunkId: chunk.id, score };
        });
        return scored
            .filter(s => s.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 20);
    }
}
exports.RAGSearchService = RAGSearchService;
