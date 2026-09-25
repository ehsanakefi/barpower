"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentIngestionService = void 0;
const client_1 = require("@prisma/client");
const textNormalizer_1 = require("../utils/textNormalizer");
const chunker_1 = require("../utils/chunker");
const prisma = new client_1.PrismaClient();
class DocumentIngestionService {
    constructor(embeddingProvider) {
        this.embeddingProvider = embeddingProvider;
    }
    async ingestDocument(input, options = {}) {
        const { documentId, fileName, rawText, versionId } = input;
        const normalizedText = (0, textNormalizer_1.normalizePersian)(rawText);
        const paragraphs = (0, textNormalizer_1.splitParagraphs)(normalizedText);
        console.log(`Ingesting documentId=${documentId}, versionId=${versionId}, paragraphs=${paragraphs.length}`);
        if (paragraphs.length === 0) {
            throw new Error('No paragraphs found in document');
        }
        const uploadDate = new Date().toISOString();
        console.log(`Ingesting documentId=${documentId}, versionId=${versionId}, paragraphs=${paragraphs.length}`);
        const allChunks = (0, chunker_1.createAllChunks)(paragraphs, documentId, fileName, uploadDate, versionId);
        if (allChunks.length === 0) {
            throw new Error('No chunks were generated from document text');
        }
        console.log(`Generated ${allChunks.length} chunks for documentId=${documentId}, versionId=${versionId}`);
        const embedChunks = allChunks.filter((c) => c.type === 'RETRIEVAL' || c.type === 'RAG');
        const embeddings = this.embeddingProvider && embedChunks.length > 0
            ? await this.embeddingProvider.embedChunks(embedChunks)
            : [];
        const embeddingMap = new Map(embeddings.map((e) => [e.chunkId, e]));
        console.log(`Generated ${embeddings.length} embeddings for documentId=${documentId}, versionId=${versionId}`);
        console.log(embedChunks.length > 0, embeddings.length !== embedChunks.length);
        if (embedChunks.length > 0 && embeddings.length !== embedChunks.length) {
            throw new Error(`Embedding count mismatch. Expected ${embedChunks.length}, got ${embeddings.length}`);
        }
        await prisma.$transaction(async (tx) => {
            if (options.replaceExisting) {
                await this.deleteExistingVersionData(tx, documentId, versionId);
            }
            await tx.chunk.createMany({
                data: allChunks.map((chunk) => ({
                    id: chunk.id,
                    documentId: chunk.documentId,
                    versionId: chunk.versionId,
                    chunkIndex: chunk.chunkIndex,
                    type: chunk.type,
                    text: chunk.text,
                    normalizedText: chunk.normalizedText,
                    paragraphStart: chunk.paragraphStart,
                    paragraphEnd: chunk.paragraphEnd,
                    charLength: chunk.charLength,
                    metadata: chunk.metadata,
                })),
            });
            if (embeddings.length > 0) {
                console.log(`Creating ${embeddings.length} embeddings for documentId=${documentId}, versionId=${versionId}`);
                await tx.embedding.createMany({
                    data: embeddings.map((e) => {
                        const target = embeddingMap.get(e.chunkId);
                        if (!target) {
                            throw new Error(`Missing embedding target for chunkId=${e.chunkId}`);
                        }
                        return {
                            chunkId: e.chunkId,
                            vector: e.vector,
                            modelName: e.modelName,
                        };
                    }),
                });
            }
        });
        const chunksByType = allChunks.reduce((acc, chunk) => {
            if (chunk.type === 'PARAGRAPH')
                acc.paragraph += 1;
            else if (chunk.type === 'RETRIEVAL')
                acc.retrieval += 1;
            else if (chunk.type === 'RAG')
                acc.rag += 1;
            return acc;
        }, { paragraph: 0, retrieval: 0, rag: 0 });
        console.log(`Ingestion completed for documentId=${documentId}, versionId=${versionId}. Paragraphs: ${paragraphs.length}, Chunks: ${allChunks.length}, Chunks by type: ${JSON.stringify(chunksByType)}`);
        return {
            documentId,
            paragraphCount: paragraphs.length,
            chunkCount: allChunks.length,
            chunksByType,
        };
    }
    async deleteDocumentChunks(documentId, versionId) {
        await prisma.$transaction(async (tx) => {
            const chunks = await tx.chunk.findMany({
                where: {
                    documentId,
                    ...(versionId ? { versionId } : {}),
                },
                select: { id: true },
            });
            const chunkIds = chunks.map((c) => c.id);
            if (chunkIds.length > 0) {
                await tx.embedding.deleteMany({
                    where: { chunkId: { in: chunkIds } },
                });
            }
            await tx.chunk.deleteMany({
                where: {
                    documentId,
                    ...(versionId ? { versionId } : {}),
                },
            });
        });
    }
    async getDocumentChunkStats(documentId, versionId) {
        const grouped = await prisma.chunk.groupBy({
            by: ['type'],
            where: {
                documentId,
                ...(versionId ? { versionId } : {}),
            },
            _count: {
                _all: true,
            },
        });
        const stats = {
            paragraph: 0,
            retrieval: 0,
            rag: 0,
        };
        let total = 0;
        for (const row of grouped) {
            const count = row._count._all;
            total += count;
            if (row.type === 'PARAGRAPH')
                stats.paragraph = count;
            else if (row.type === 'RETRIEVAL')
                stats.retrieval = count;
            else if (row.type === 'RAG')
                stats.rag = count;
        }
        return {
            total,
            ...stats,
        };
    }
    async deleteExistingVersionData(tx, documentId, versionId) {
        const existingChunks = await tx.chunk.findMany({
            where: { documentId, versionId },
            select: { id: true },
        });
        const chunkIds = existingChunks.map((c) => c.id);
        if (chunkIds.length > 0) {
            await tx.embedding.deleteMany({
                where: { chunkId: { in: chunkIds } },
            });
        }
        await tx.chunk.deleteMany({
            where: { documentId, versionId },
        });
    }
}
exports.DocumentIngestionService = DocumentIngestionService;
