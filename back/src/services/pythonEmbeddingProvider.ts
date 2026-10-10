import axios from "axios";
import { EmbeddingProvider, ChunkEmbedding } from "./dataset.service";
import { ChunkData } from "../utils/chunker";

export class PythonEmbeddingProvider implements EmbeddingProvider {
  constructor(
    private readonly apiUrl: string,
    private readonly batchSize = 64,
  ) {}

  async embedChunks(chunks: ChunkData[]): Promise<ChunkEmbedding[]> {
    const results: ChunkEmbedding[] = [];

    for (let i = 0; i < chunks.length; i += this.batchSize) {
      const batch = chunks.slice(i, i + this.batchSize);

      const texts = batch.map((c) => c.normalizedText);
      console.log(
        `Sending batch of ${batch.length} chunks to embedding API at ${this.apiUrl}`,
      );
      const response = await axios.post(`${this.apiUrl}/embed`, {
        texts,
      });

      const vectors: number[][] = response.data.vectors;
      const model: string = response.data.model;

      if (!vectors || vectors.length !== batch.length) {
        throw new Error("Embedding response size mismatch");
      }

      for (let j = 0; j < batch.length; j++) {
        results.push({
          chunkId: batch[j].id,
          vector: vectors[j],
          modelName: model,
        });
      }
    }

    return results;
  }
}
