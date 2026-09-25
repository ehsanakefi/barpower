"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMiddleware = void 0;
const multer_1 = __importDefault(require("multer"));
// const storage = multer.diskStorage({
//   destination: (
//     req: Express.Request,
//     file: Express.Multer.File,
//     cb
//   ) => {
//     cb(null, uploadDir);
//   },
//   filename: (
//     req: Express.Request,
//     file: Express.Multer.File,
//     cb
//   ) => {
//     const safeOriginalName = file.originalname.replace(/[^\w.-]/g, '_');
//     const uniqueName = `${Date.now()}-${safeOriginalName}`;
//     cb(null, uniqueName);
//   },
// });
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype ===
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            file.originalname.toLowerCase().endsWith('.docx')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only .docx files are allowed'));
        }
    },
});
exports.uploadMiddleware = upload.single('file');
