import {
  PrismaClient,
  Prisma,
  DocumentStatus,
  ChunkType,
} from "@prisma/client";
import { prisma } from "../database/connection";
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export interface CreateChunkData {
  pageNumber?: number;
  chunkIndex: number;
  type?: ChunkType;
  text: string;
  normalizedText?: string;
  paragraphStart?: number;
  paragraphEnd?: number;
  charLength?: number;
  metadata?: Prisma.InputJsonValue;
  embedding?: {
    vector: Prisma.InputJsonValue;
    model: string;
  };
}

export interface CreateDocumentData {
  title: string;
  doc_code: string;
  issue_date?: string | Date;
  issue_date_jalali?: string;
  status?: DocumentStatus;
  file_url: string;
  file_size?: number;
  chunks?: CreateChunkData[];
}

export interface UpdateDocumentData {
  title?: string;
  doc_code?: string;
  issue_date?: string | Date | null;
  issue_date_jalali?: string | null;
  status?: DocumentStatus;
  file_url?: string;
  file_size?: number | null;
  chunks?: CreateChunkData[];
}

function parseDate(value?: string | Date | null): Date | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid issue_date");
  }

  return date;
}

function mapChunks(
  documentId: string,
  chunks: CreateChunkData[],
): Prisma.ChunkCreateWithoutVersionInput[] {
  return chunks.map((chunk) => ({
    document: {
      connect: { id: documentId },
    },
    pageNumber: chunk.pageNumber,
    chunkIndex: chunk.chunkIndex,
    type: chunk.type ?? ChunkType.PARAGRAPH,
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

export class DocumentService {
  async addDocument(data: CreateDocumentData) {
    try {
      const {
        file_url,
        file_size,
        chunks = [],
        issue_date,
        issue_date_jalali,
        ...documentData
      } = data;

      return await prisma.$transaction(async (tx) => {
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
            chunks:
              chunks.length > 0
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
              orderBy: { versionNumber: "desc" },
              include: {
                chunks: {
                  orderBy: { chunkIndex: "asc" },
                  include: {
                    embedding: true,
                  },
                },
              },
            },
          },
        });
      });
    } catch (error) {
      console.error("Error adding document:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to add document",
      );
    }
  }

  async getDocumentById(id: string) {
    try {
      return await prisma.document.findUnique({
        where: { id },
        include: {
          versions: {
            orderBy: { versionNumber: "desc" },
            include: {
              chunks: {
                orderBy: { chunkIndex: "asc" },
                include: {
                  embedding: true,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      console.error("Error fetching document:", error);
      throw new Error("Failed to fetch document");
    }
  }

  async getDocuments() {
    try {
      return await prisma.document.findMany({
        include: {
          versions: {
            orderBy: { versionNumber: "desc" },
          },
        },
        orderBy: {
          issue_date: "desc",
        },
      });
    } catch (error) {
      console.error("Error fetching documents:", error);
      throw new Error("Failed to fetch documents");
    }
  }

  async updateDocument(id: string, data: UpdateDocumentData) {
    try {
      return await prisma.$transaction(async (tx) => {
        const existingDocument = await tx.document.findUnique({
          where: { id },
          select: { id: true },
        });

        if (!existingDocument) {
          throw new Error("Document not found");
        }

        const {
          file_url,
          file_size,
          chunks,
          issue_date,
          issue_date_jalali,
          ...documentFields
        } = data;

        const updatePayload: Prisma.DocumentUpdateInput = {};

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

        const shouldCreateNewVersion =
          file_url !== undefined ||
          file_size !== undefined ||
          chunks !== undefined;

        if (shouldCreateNewVersion) {
          if (!file_url) {
            throw new Error("file_url is required to create a new version");
          }

          const latestVersion = await tx.documentVersion.findFirst({
            where: { documentId: id },
            orderBy: { versionNumber: "desc" },
            select: { versionNumber: true },
          });

          const nextVersionNumber = (latestVersion?.versionNumber ?? 0) + 1;

          await tx.documentVersion.create({
            data: {
              documentId: id,
              versionNumber: nextVersionNumber,
              file_url,
              file_size: file_size ?? undefined,
              chunks:
                chunks && chunks.length > 0
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
              orderBy: { versionNumber: "desc" },
              include: {
                chunks: {
                  orderBy: { chunkIndex: "asc" },
                  include: {
                    embedding: true,
                  },
                },
              },
            },
          },
        });
      });
    } catch (error) {
      console.error("Error updating document:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to update document",
      );
    }
  }

  async deleteDocument(id: string) {
    try {
      return await prisma.document.delete({
        where: { id },
      });
    } catch (error) {
      console.error("Error deleting document:", error);
      throw new Error("Failed to delete document");
    }
  }
}
