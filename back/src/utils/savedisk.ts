import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';

const uploadDir = path.join(process.cwd(), 'uploads', 'documents');

export async function saveFileToDisk(file: Express.Multer.File) {
  await fs.mkdir(uploadDir, { recursive: true });

  const ext = path.extname(file.originalname).toLowerCase();
  const filename = `${Date.now()}-${crypto.randomUUID()}${ext}`;
  const filepath = path.join(uploadDir, filename);

  await fs.writeFile(filepath, file.buffer);

  return {
    filename,
    filepath,
    url: `/uploads/documents/${filename}`,
  };
}
