// import { ChunkType } from '../utils/chunker';
import { ChunkType } from "@prisma/client";

export interface Chunk {
  id: string;
  documentId: string;
  chunkIndex: number;
  type: ChunkType;
  text: string;
  normalizedText: string;
  paragraphStart: number;
  paragraphEnd: number;
  charLength: number;
  metadata: {
    fileName: string;
    uploadDate: string;
  };
  embedding?: number[];
  createdAt?: Date;
}
