"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PythonEmbeddingProvider = void 0;
const axios_1 = __importDefault(require("axios"));
class PythonEmbeddingProvider {
    constructor(apiUrl, batchSize = 64) {
        this.apiUrl = apiUrl;
        this.batchSize = batchSize;
    }
    async embedChunks(chunks) {
        const results = [];
        for (let i = 0; i < chunks.length; i += this.batchSize) {
            const batch = chunks.slice(i, i + this.batchSize);
            const texts = batch.map(c => c.normalizedText);
            console.log(`Sending batch of ${batch.length} chunks to embedding API at ${this.apiUrl}`);
            const response = await axios_1.default.post(`${this.apiUrl}/embed`, {
                texts
            });
            const vectors = response.data.vectors;
            const model = response.data.model;
            if (!vectors || vectors.length !== batch.length) {
                throw new Error("Embedding response size mismatch");
            }
            for (let j = 0; j < batch.length; j++) {
                results.push({
                    chunkId: batch[j].id,
                    vector: vectors[j],
                    modelName: model
                });
            }
        }
        return results;
    }
}
exports.PythonEmbeddingProvider = PythonEmbeddingProvider;
