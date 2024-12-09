const cloudinary = require('cloudinary').v2;

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Utility function for uploading media
const uploadToCloudinary = async (file, folder = 'feeds', resourceType = 'auto') => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder,
      resource_type: resourceType,
      transformation: [
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });
    return {
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      resource_type: result.resource_type
    };
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    throw new Error('Media upload failed');
  }
};

// Utility function for deleting media from Cloudinary
const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    await cloudinary.uploader.destroy(publicId, { 
      resource_type: resourceType 
    });
  } catch (error) {
    console.error('Cloudinary Delete Error:', error);
  }
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary
};