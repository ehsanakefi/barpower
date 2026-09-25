// import { PrismaClient } from "@prisma/client";

// import { normalizePersian } from "../utils/textNormalizer";
// import { PythonSearchService } from "./pythonSearch.service";

// const prisma = new PrismaClient();

// export interface RAGSearchResult {
//   answer: string | null;
//   results: RAGSearchResult[];
//   sources?: Array<{
//     chunkId: string;
//     score: number;
//     text: string;
//   }>;
// }

// export class RAGSearchService {
//   private pythonService: PythonSearchService;

//   constructor() {
//     this.pythonService = new PythonSearchService();
//   }

//   async search(query: string): Promise<RAGSearchResult[]> {
//     const normalizedQuery = normalizePersian(query);

//     if (!normalizedQuery) {
//       return [];
//     }

//     // Get RAG chunks
//     const chunks = await prisma.chunk.findMany({
//       where: {
//         type: "RAG",
//       },
//     });

//     if (chunks.length === 0) {
//       return [];
//     }

//     // Try Python API for vector search
//     const pythonResult = await this.pythonService.searchWithFallback({
//       query: normalizedQuery,
//       mode: "rag",
//     });
//     console.log("Python API Result:", pythonResult);
//     let rankedChunkIds: Array<{ chunkId: string; score: number }>;

//     if (pythonResult) {
//       // Use Python API results (vector search + embeddings)
//       rankedChunkIds = pythonResult.results;
//     } else {
//       console.warn(
//         "RAG search falling back to text search (Python API unavailable)",
//       );
//       return {
//         text: "RAG search fallback not implemented yet",
//         chunkId: "",
//         documentId: "",
//         fileName: "",
//         score: 0,
//       } as any;
//     }

//     // Map results to chunks
//     const chunkMap = new Map(chunks.map((c) => [c.id, c]));

//     // Get associated documents
//     const documentIds = [...new Set(chunks.map((c) => c.documentId))];
//     const documents = await prisma.document.findMany({
//       where: {
//         id: {
//           in: documentIds,
//         },
//       },
//     });
//     const docMap = new Map(documents.map((d) => [d.id, d]));

//     // Build final results
//     const results: RAGSearchResult[] = rankedChunkIds
//       .map(({ chunkId, score }) => {
//         const chunk = chunkMap.get(chunkId);
//         if (!chunk) return null;

//         const doc = docMap.get(chunk.documentId);

//         return {
//           chunkId: chunk.id,
//           documentId: chunk.documentId,
//           // fileName: doc?.title || chunk.metadata.fileName,
//           text: chunk.text,
//           score,
//         };
//       })
//       .filter((r): r is RAGSearchResult => r !== null);

//     return results;
//   }
// }
import { PrismaClient } from "@prisma/client";

import { normalizePersian } from "../utils/textNormalizer";
import { PythonSearchService } from "./pythonSearch.service";

const prisma = new PrismaClient();

export interface RAGSearchResult {
  chunkId: string;
  documentId: string;
  fileName?: string | null;
  text: string;
  score: number;
}

export interface RAGSearchResponse {
  answer: string | null;
  results: RAGSearchResult[];
  sources: Array<{
    chunkId: string;
    score: number;
    text: string;
  }>;
}

export class RAGSearchService {
  private pythonService: PythonSearchService;

  constructor() {
    this.pythonService = new PythonSearchService();
  }

  async search(query: string): Promise<RAGSearchResponse> {
    const normalizedQuery = normalizePersian(query);

    if (!normalizedQuery) {
      return {
        answer: null,
        results: [],
        sources: [],
      };
    }

    const pythonResult = await this.pythonService.searchWithFallback({
      query: normalizedQuery,
      mode: "rag",
    });

    console.log("Python API Result:", pythonResult);

    if (!pythonResult) {
      console.warn(
        "RAG search falling back to text search because Python API is unavailable",
      );

      return {
        answer: "سرویس جستجوی برداری در دسترس نیست.",
        results: [],
        sources: [],
      };
    }

    const rankedChunkIds = pythonResult.results ?? [];

    if (rankedChunkIds.length === 0) {
      return {
        answer: pythonResult.answer ?? "متن مرتبطی پیدا نشد.",
        results: [],
        sources: pythonResult.sources ?? [],
      };
    }

    const ids = rankedChunkIds.map((r: any) => r.chunkId);

    const chunks = await prisma.chunk.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      include: {
        document: true,
      },
    });

    const chunkMap = new Map(chunks.map((c) => [String(c.id), c]));

    const results: RAGSearchResult[] = rankedChunkIds
      .map(({ chunkId, score }: { chunkId: string; score: number }) => {
        const chunk = chunkMap.get(String(chunkId));

        if (!chunk) {
          console.warn("Chunk not found in Prisma:", chunkId);
          return null;
        }

        return {
          chunkId: String(chunk.id),
          documentId: String(chunk.documentId),
          fileName: chunk.document?.title ?? null,
          text: chunk.text,
          score,
        };
      })
      .filter((r): r is RAGSearchResult => r !== null);

    return {
      answer: pythonResult.answer ?? null,
      results,
      sources: pythonResult.sources ?? [],
    };
  }
}
