import { Request, Response } from "express";
import {
  DocumentService,
  CreateDocumentData,
  UpdateDocumentData,
} from "../services/document.service";
import { DocumentIngestionService } from "../services/documentIngestion.service";
import { extractTextFromDocx } from "../utils/docxExtractor";
import multer, { FileFilterCallback } from "multer";
import fs from "fs";
import { readFile } from "fs/promises";
import path from "path";
import { saveFileToDisk } from "@/utils/savedisk";
import { PythonEmbeddingProvider } from "@/services/pythonEmbeddingProvider";

const embeddingProvider = new PythonEmbeddingProvider(
  process.env.PYTHON_API_URL || "http://localhost:8000",
  64,
);
const documentService = new DocumentService();
const ingestionService = new DocumentIngestionService(embeddingProvider);

// Configure multer for file uploads (memory storage)
// const upload = multer({
//   storage: multer.memoryStorage(),
//   limits: {
//     fileSize: 50 * 1024 * 1024, // 50MB limit
//   },
//   fileFilter: (
//     req: Express.Request,
//     file: Express.Multer.File,
//     cb: FileFilterCallback
//   ) => {
//     if (
//       file.mimetype ===
//         'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
//       file.originalname.toLowerCase().endsWith('.docx')
//     ) {
//       cb(null, true);
//     } else {
//       cb(new Error('Only .docx files are allowed'));
//     }
//   },
// });

const uploadDir = path.join(process.cwd(), "uploads", "documents");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export const addDocument = async (req: Request, res: Response) => {
  try {
    const {
      title,
      doc_code,
      issue_date,
      issue_date_jalali,
      file_url,
      file_size,
      status,
    }: CreateDocumentData = req.body;

    if (!title || !doc_code || !file_url) {
      return res.status(400).json({
        success: false,
        message: "Required fields: title, doc_code, file_url",
      });
    }

    const newDocument = await documentService.addDocument({
      title,
      doc_code,
      issue_date,
      issue_date_jalali,
      file_url,
      file_size,
      status,
    });

    return res.status(201).json({
      success: true,
      message: "Document added successfully",
      data: newDocument,
    });
  } catch (error) {
    console.error("Add document error:", error);

    return res.status(500).json({
      success: false,
      message: "Error adding document",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getDocuments = async (req: Request, res: Response) => {
  try {
    const documents = await documentService.getDocuments();

    return res.status(200).json({
      success: true,
      count: documents.length,
      data: documents,
    });
  } catch (error) {
    console.error("Get documents error:", error);

    return res.status(500).json({
      success: false,
      message: "Error retrieving documents",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getDocumentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid document ID",
      });
    }

    const document = await documentService.getDocumentById(id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: document,
    });
  } catch (error) {
    console.error("Get document by ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Error retrieving document",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const updateDocument = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData: UpdateDocumentData = req.body;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid document ID",
      });
    }

    const updatedDocument = await documentService.updateDocument(
      id,
      updateData,
    );

    return res.status(200).json({
      success: true,
      message: "Document updated successfully",
      data: updatedDocument,
    });
  } catch (error) {
    console.error("Update document error:", error);

    return res.status(500).json({
      success: false,
      message: "Error updating document",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Upload and process a .docx document with full ingestion pipeline.
 *
 * POST /api/documents/upload
 * Content-Type: multipart/form-data
 *
 * Fields:
 *  - file: .docx file
 *  - title: document title
 *  - doc_code: document code
 *  - issue_date: Gregorian date, optional
 *  - issue_date_jalali: Jalali date, optional
 */
export const uploadDocument = async (req: Request, res: Response) => {
  let savedFile: { filepath: string; url: string } | null = null;

  try {
    const file = req.file;
    const { title, doc_code, issue_date, issue_date_jalali } = req.body;
    console.log("validate file");
    // ---------- validate file ----------
    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }
    console.log("validate metadata");

    // ---------- validate metadata ----------
    if (!title || !doc_code) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: title, doc_code",
      });
    }
    console.log("validate issue_date");

    if (!issue_date && !issue_date_jalali) {
      return res.status(400).json({
        success: false,
        message: "One of issue_date or issue_date_jalali is required",
      });
    }
    console.log("validate issue_date if exists");

    // ---------- validate issue_date if exists ----------
    if (issue_date && Number.isNaN(Date.parse(issue_date))) {
      return res.status(400).json({
        success: false,
        message: "Invalid issue_date",
      });
    }
    console.log("extract text from DOCX");

    // ---------- extract text from DOCX ----------
    const rawText = await extractTextFromDocx(file.buffer);

    if (!rawText || rawText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "No text content found in document",
      });
    }
    console.log("save file to disk");

    // ---------- save file to disk ----------
    savedFile = await saveFileToDisk(file);
    console.log("create document record");

    // ---------- create document record ----------
    const document = await documentService.addDocument({
      title,
      doc_code,
      issue_date,
      issue_date_jalali,
      file_url: savedFile.url,
      file_size: file.size,
    });

    if (!document) {
      throw new Error("Failed to create document record");
    }

    const latestVersion = document.versions?.[0];

    if (!latestVersion) {
      throw new Error("Failed to create document version");
    }
    console.log("create document record");

    // ---------- ingestion pipeline ----------
    const ingestionResult = await ingestionService.ingestDocument({
      documentId: document.id,
      versionId: latestVersion.id,
      fileName: file.originalname,
      rawText,
    });

    return res.status(201).json({
      success: true,
      message: "Document uploaded and processed successfully",
      data: {
        document,
        ingestion: ingestionResult,
      },
    });
  } catch (error) {
    console.error("Upload document error:", error);

    // ---------- cleanup file if something failed ----------
    if (savedFile?.filepath) {
      try {
        await fs.promises.unlink(savedFile.filepath);
      } catch (cleanupError) {
        console.error("Failed to cleanup uploaded file:", cleanupError);
      }
    }

    return res.status(500).json({
      success: false,
      message: "Error uploading document",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const deleteDocument = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid document ID",
      });
    }

    await documentService.deleteDocument(id);

    return res.status(200).json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error("Delete document error:", error);

    return res.status(500).json({
      success: false,
      message: "Error deleting document",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
