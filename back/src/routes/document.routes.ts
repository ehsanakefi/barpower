import { Router } from "express";
import {
  addDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  uploadDocument,
} from "../controllers/document.controller";
import { uploadMiddleware } from "@/middleware/memoryStorage";
import { validateUploadDocument } from "@/middleware/validation.middleware";

const router = Router();

// Admin routes for document management
router.post("/", addDocument); // POST /api/admin/documents
router.post(
  "/upload",
  uploadMiddleware,
  validateUploadDocument,
  uploadDocument,
); // POST /api/documents/upload
router.get("/", getDocuments); // GET /api/documents
router.get("/:id", getDocumentById); // GET /api/documents/:id
router.put("/:id", updateDocument); // PUT /api/documents/:id
router.delete("/:id", deleteDocument); // DELETE /api/documents/:id

export default router;
