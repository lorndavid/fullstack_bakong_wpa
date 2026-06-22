import fs from 'fs';
import path from 'path';

const UPLOADS_DIR = path.join(__dirname, '../../uploads');
const PRODUCTS_DIR = path.join(UPLOADS_DIR, 'products');

// Ensure upload directories exist on module load
function ensureDirectories(): void {
  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  if (!fs.existsSync(PRODUCTS_DIR)) fs.mkdirSync(PRODUCTS_DIR, { recursive: true });
}

ensureDirectories();

interface LocalUploadResult {
  public_id: string;
  secure_url: string;
}

/**
 * Save an uploaded file to the local filesystem.
 * Returns a URL path that can be served via Express static middleware.
 */
function saveFileLocally(file: Express.Multer.File): LocalUploadResult {
  ensureDirectories();

  const ext = path.extname(file.originalname) || '.jpg';
  const filename = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`;
  const filePath = path.join(PRODUCTS_DIR, filename);

  fs.writeFileSync(filePath, file.buffer);

  console.log(`[FileStorage] ✅ Saved locally: uploads/products/${filename}`);

  return {
    public_id: `local_${filename}`,
    secure_url: `/uploads/products/${filename}`,
  };
}

/**
 * Delete a locally saved file by its public_id.
 */
function deleteLocalFile(publicId: string): void {
  if (!publicId.startsWith('local_')) return;

  const filename = publicId.replace('local_', '');
  const filePath = path.join(PRODUCTS_DIR, filename);

  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`[FileStorage] 🗑️ Deleted local file: ${filename}`);
    }
  } catch (error: any) {
    console.warn(`[FileStorage] Failed to delete ${filename}: ${error.message}`);
  }
}

export { saveFileLocally, deleteLocalFile, UPLOADS_DIR };
