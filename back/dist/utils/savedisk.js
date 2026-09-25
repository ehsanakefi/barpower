"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveFileToDisk = saveFileToDisk;
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const crypto_1 = __importDefault(require("crypto"));
const uploadDir = path_1.default.join(process.cwd(), 'uploads', 'documents');
async function saveFileToDisk(file) {
    await promises_1.default.mkdir(uploadDir, { recursive: true });
    const ext = path_1.default.extname(file.originalname).toLowerCase();
    const filename = `${Date.now()}-${crypto_1.default.randomUUID()}${ext}`;
    const filepath = path_1.default.join(uploadDir, filename);
    await promises_1.default.writeFile(filepath, file.buffer);
    return {
        filename,
        filepath,
        url: `/uploads/documents/${filename}`,
    };
}
