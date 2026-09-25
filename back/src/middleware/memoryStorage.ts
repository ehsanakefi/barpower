import multer, { FileFilterCallback } from "multer";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
  fileFilter: (
    req: Express.Request,
    file: Express.Multer.File,
    cb: FileFilterCallback,
  ) => {
    if (
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.originalname.toLowerCase().endsWith(".docx")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only .docx files are allowed"));
    }
  },
});

export const uploadMiddleware = upload.single("file");
