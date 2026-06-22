import { cloudinary } from '../config/cloudinary';
import { UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

interface UploadResult {
  public_id: string;
  secure_url: string;
}

const uploadToCloudinary = (
  file: Express.Multer.File,
  folder: string = 'products'
): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `bakong-ecommerce/${folder}`,
        resource_type: 'auto',
        transformation: [
          { width: 800, height: 800, crop: 'limit', quality: 'auto' },
        ],
      },
      (error, result: UploadApiResponse | undefined) => {
        if (error) return reject(error);
        if (!result) return reject(new Error('Upload failed'));
        resolve({
          public_id: result.public_id,
          secure_url: result.secure_url,
        });
      }
    );

    const bufferStream = new Readable();
    bufferStream.push(file.buffer);
    bufferStream.push(null);
    bufferStream.pipe(uploadStream);
  });
};

const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  await cloudinary.uploader.destroy(publicId);
};

const deleteMultipleFromCloudinary = async (
  publicIds: string[]
): Promise<void> => {
  for (const id of publicIds) {
    await deleteFromCloudinary(id);
  }
};

export { uploadToCloudinary, deleteFromCloudinary, deleteMultipleFromCloudinary };
