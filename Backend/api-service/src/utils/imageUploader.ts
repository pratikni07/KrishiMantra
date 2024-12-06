import { v2 as cloudinary } from 'cloudinary';

interface UploadOptions {
  folder: string;
  height?: number;
  quality?: string | number;
}

export const uploadImageToCloudinary = async (
  file: { tempFilePath: string },
  folder: string,
  height?: number,
  quality?: string | number
): Promise<any> => {
  const options: UploadOptions = { folder };

  if (height) {
    options.height = height;
  }
  if (quality) {
    options.quality = quality;
  }
  return await cloudinary.uploader.upload(file.tempFilePath, options);
};
