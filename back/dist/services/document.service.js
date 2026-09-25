"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentService = exports.prisma = void 0;
const client_1 = require("@prisma/client");
const globalForPrisma = globalThis;
exports.prisma = globalForPrisma.prisma ?? new client_1.PrismaClient();
if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = exports.prisma;
}
function parseDate(value) {
    if (value === undefined)
        return undefined;
    if (value === null)
        return null;
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
        throw new Error('Invalid issue_date');
    }
    return date;
}
function mapChunks(documentId, chunks) {
    return chunks.map((chunk) => ({
        document: {
            connect: { id: documentId },
        },
        pageNumber: chunk.pageNumber,
        chunkIndex: chunk.chunkIndex,
        type: chunk.type ?? client_1.ChunkType.PARAGRAPH,
        text: chunk.text,
        normalizedText: chunk.normalizedText ?? chunk.text,
        paragraphStart: chunk.paragraphStart,
        paragraphEnd: chunk.paragraphEnd,
        charLength: chunk.charLength ?? chunk.text.length,
        metadata: chunk.metadata,
        embedding: chunk.embedding
            ? {
                create: {
                    vector: chunk.embedding.vector,
                    model: chunk.embedding.model,
                },
            }
            : undefined,
    }));
}
class DocumentService {
    async addDocument(data) {
        try {
            const { file_url, file_size, chunks = [], issue_date, issue_date_jalali, ...documentData } = data;
            return await exports.prisma.$transaction(async (tx) => {
                const document = await tx.document.create({
                    data: {
                        ...documentData,
                        issue_date: parseDate(issue_date),
                        issue_date_jalali,
                    },
                });
                await tx.documentVersion.create({
                    data: {
                        documentId: document.id,
                        versionNumber: 1,
                        file_url,
                        file_size,
                        chunks: chunks.length > 0
                            ? {
                                create: mapChunks(document.id, chunks),
                            }
                            : undefined,
                    },
                });
                return tx.document.findUnique({
                    where: { id: document.id },
                    include: {
                        versions: {
                            orderBy: { versionNumber: 'desc' },
                            include: {
                                chunks: {
                                    orderBy: { chunkIndex: 'asc' },
                                    include: {
                                        embedding: true,
                                    },
                                },
                            },
                        },
                    },
                });
            });
        }
        catch (error) {
            console.error('Error adding document:', error);
            throw new Error(error instanceof Error ? error.message : 'Failed to add document');
        }
    }
    async getDocumentById(id) {
        try {
            return await exports.prisma.document.findUnique({
                where: { id },
                include: {
                    versions: {
                        orderBy: { versionNumber: 'desc' },
                        include: {
                            chunks: {
                                orderBy: { chunkIndex: 'asc' },
                                include: {
                                    embedding: true,
                                },
                            },
                        },
                    },
                },
            });
        }
        catch (error) {
            console.error('Error fetching document:', error);
            throw new Error('Failed to fetch document');
        }
    }
    async getDocuments() {
        try {
            return await exports.prisma.document.findMany({
                include: {
                    versions: {
                        orderBy: { versionNumber: 'desc' },
                    },
                },
                orderBy: {
                    issue_date: 'desc',
                },
            });
        }
        catch (error) {
            console.error('Error fetching documents:', error);
            throw new Error('Failed to fetch documents');
        }
    }
    async updateDocument(id, data) {
        try {
            return await exports.prisma.$transaction(async (tx) => {
                const existingDocument = await tx.document.findUnique({
                    where: { id },
                    select: { id: true },
                });
                if (!existingDocument) {
                    throw new Error('Document not found');
                }
                const { file_url, file_size, chunks, issue_date, issue_date_jalali, ...documentFields } = data;
                const updatePayload = {};
                if (documentFields.title !== undefined) {
                    updatePayload.title = documentFields.title;
                }
                if (documentFields.doc_code !== undefined) {
                    updatePayload.doc_code = documentFields.doc_code;
                }
                if (documentFields.status !== undefined) {
                    updatePayload.status = documentFields.status;
                }
                if (issue_date !== undefined) {
                    updatePayload.issue_date = parseDate(issue_date);
                }
                if (issue_date_jalali !== undefined) {
                    updatePayload.issue_date_jalali = issue_date_jalali;
                }
                if (Object.keys(updatePayload).length > 0) {
                    await tx.document.update({
                        where: { id },
                        data: updatePayload,
                    });
                }
                const shouldCreateNewVersion = file_url !== undefined ||
                    file_size !== undefined ||
                    chunks !== undefined;
                if (shouldCreateNewVersion) {
                    if (!file_url) {
                        throw new Error('file_url is required to create a new version');
                    }
                    const latestVersion = await tx.documentVersion.findFirst({
                        where: { documentId: id },
                        orderBy: { versionNumber: 'desc' },
                        select: { versionNumber: true },
                    });
                    const nextVersionNumber = (latestVersion?.versionNumber ?? 0) + 1;
                    await tx.documentVersion.create({
                        data: {
                            documentId: id,
                            versionNumber: nextVersionNumber,
                            file_url,
                            file_size: file_size ?? undefined,
                            chunks: chunks && chunks.length > 0
                                ? {
                                    create: mapChunks(id, chunks),
                                }
                                : undefined,
                        },
                    });
                }
                return tx.document.findUnique({
                    where: { id },
                    include: {
                        versions: {
                            orderBy: { versionNumber: 'desc' },
                            include: {
                                chunks: {
                                    orderBy: { chunkIndex: 'asc' },
                                    include: {
                                        embedding: true,
                                    },
                                },
                            },
                        },
                    },
                });
            });
        }
        catch (error) {
            console.error('Error updating document:', error);
            throw new Error(error instanceof Error ? error.message : 'Failed to update document');
        }
    }
    async deleteDocument(id) {
        try {
            return await exports.prisma.document.delete({
                where: { id },
            });
        }
        catch (error) {
            console.error('Error deleting document:', error);
            throw new Error('Failed to delete document');
        }
    }
}
exports.DocumentService = DocumentService;
