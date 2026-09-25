import { Request, Response, NextFunction } from "express";
import { uploadDocumentSchema } from "../validation/document.schema";

export function validateUploadDocument(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const result = uploadDocumentSchema.safeParse(req.body);
  console.log("Validation result:", result);
  console.log("Body received:", req.body);
  console.log("File received:", req.file);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      errors: result.error.flatten(),
    });
  }
  console.log("Validation passed for body:", req.body);
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: "فایل ارسال نشده است",
    });
  }
  console.log("File received:", req.file.originalname, "Size:", req.file.size);
  if (
    req.file.mimetype !==
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return res.status(400).json({
      success: false,
      error: "فقط فایل DOCX مجاز است",
    });
  }
  const MAX_SIZE = 50 * 1024 * 1024;

  if (req.file.size > MAX_SIZE) {
    return res.status(400).json({
      success: false,
      error: "حجم فایل بیش از حد مجاز است",
    });
  }
  console.log("Validation passed for file:", req.file.originalname);
  next();
}
