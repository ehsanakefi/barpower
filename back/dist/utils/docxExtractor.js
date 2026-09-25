"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractTextFromDocx = extractTextFromDocx;
const mammoth_1 = __importDefault(require("mammoth"));
/**
 * Extract raw text from a .docx file buffer.
 * Uses mammoth library to convert .docx to plain text.
 */
async function extractTextFromDocx(buffer) {
    try {
        const result = await mammoth_1.default.extractRawText({ buffer });
        return result.value;
    }
    catch (error) {
        throw new Error(`Failed to extract text from .docx: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
