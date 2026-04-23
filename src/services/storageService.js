/**
 * Storage Service for handling image uploads.
 * In a production environment, this would integrate with Cloudinary, AWS S3, or similar.
 * For this hackathon, we simulate cloud storage with local persistence and public URLs.
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class StorageService {
  constructor() {
    this.uploadDir = path.join(__dirname, '../../public/uploads');
    this.ensureUploadDir();
  }

  ensureUploadDir() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Simulates uploading a file to a cloud provider.
   * returns a secure URL and public ID.
   */
  async uploadImage(file, folder = 'evidence') {
    return new Promise((resolve, reject) => {
      // Simulate network delay
      setTimeout(() => {
        try {
          const fileExtension = path.extname(file.originalname).toLowerCase();
          const fileName = `${folder}_${uuidv4()}${fileExtension}`;
          const filePath = path.join(this.uploadDir, fileName);

          // In a real scenario, we'd use cloudinary.uploader.upload_stream
          // Here we move the file from multer's temp storage to our public uploads
          fs.renameSync(file.path, filePath);

          const publicUrl = `/uploads/${fileName}`;
          
          resolve({
            secure_url: publicUrl,
            public_id: fileName,
            format: fileExtension.replace('.', ''),
            created_at: new Date().toISOString()
          });
        } catch (error) {
          reject(new Error(`Storage Upload Failed: ${error.message}`));
        }
      }, 800);
    });
  }
}

module.exports = new StorageService();
