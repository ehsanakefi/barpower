"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAllChunks = createAllChunks;
const crypto_1 = require("crypto");
const textNormalizer_1 = require("./textNormalizer");
const RETRIEVAL_CONFIG = {
    minSize: 300,
    maxSize: 1500,
    overlap: 1,
};
const RAG_CONFIG = {
    minSize: 800,
    maxSize: 2500,
    overlap: 1,
};
function buildParagraphChunks(paragraphs, documentId, fileName, uploadDate, versionId) {
    return paragraphs.map((text, index) => ({
        id: (0, crypto_1.randomUUID)(),
        documentId,
        versionId,
        chunkIndex: index,
        type: 'PARAGRAPH',
        text,
        normalizedText: (0, textNormalizer_1.normalizePersian)(text),
        paragraphStart: index,
        paragraphEnd: index,
        charLength: text.length,
        metadata: { fileName, uploadDate },
    }));
}
function buildWindowedChunks(paragraphs, documentId, fileName, uploadDate, type, config, versionId) {
    const chunks = [];
    let chunkIndex = 0;
    let start = 0;
    while (start < paragraphs.length) {
        let end = start;
        let combinedText = paragraphs[start];
        while (end + 1 < paragraphs.length && combinedText.length < config.minSize) {
            end++;
            combinedText += '\n\n' + paragraphs[end];
        }
        while (end + 1 < paragraphs.length &&
            (combinedText + '\n\n' + paragraphs[end + 1]).length <= config.maxSize) {
            end++;
            combinedText += '\n\n' + paragraphs[end];
        }
        chunks.push({
            id: (0, crypto_1.randomUUID)(),
            documentId,
            versionId,
            chunkIndex,
            type,
            text: combinedText,
            normalizedText: (0, textNormalizer_1.normalizePersian)(combinedText),
            paragraphStart: start,
            paragraphEnd: end,
            charLength: combinedText.length,
            metadata: { fileName, uploadDate },
        });
        chunkIndex++;
        start = Math.max(start + 1, end + 1 - config.overlap);
    }
    return chunks;
}
function createAllChunks(paragraphs, documentId, fileName, uploadDate, versionId) {
    if (paragraphs.length === 0)
        return [];
    const paragraphChunks = buildParagraphChunks(paragraphs, documentId, fileName, uploadDate, versionId);
    const retrievalChunks = buildWindowedChunks(paragraphs, documentId, fileName, uploadDate, 'RETRIEVAL', RETRIEVAL_CONFIG, versionId);
    const ragChunks = buildWindowedChunks(paragraphs, documentId, fileName, uploadDate, 'RAG', RAG_CONFIG, versionId);
    return [...paragraphChunks, ...retrievalChunks, ...ragChunks];
}
