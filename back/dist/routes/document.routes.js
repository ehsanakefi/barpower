"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const document_controller_1 = require("../controllers/document.controller");
const memoryStorage_1 = require("@/middleware/memoryStorage");
const router = (0, express_1.Router)();
// Admin routes for document management
router.post('/', document_controller_1.addDocument); // POST /api/admin/documents
router.post('/upload', memoryStorage_1.uploadMiddleware, document_controller_1.uploadDocument); // POST /api/documents/upload
router.get('/', document_controller_1.getDocuments); // GET /api/documents
router.get('/:id', document_controller_1.getDocumentById); // GET /api/documents/:id
router.put('/:id', document_controller_1.updateDocument); // PUT /api/documents/:id
router.delete('/:id', document_controller_1.deleteDocument); // DELETE /api/documents/:id
exports.default = router;
