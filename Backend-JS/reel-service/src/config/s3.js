const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const s3 = new AWS.S3();

const uploadToS3 = (file) => {
  return new Promise((resolve, reject) => {
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `reels/${uuidv4()}-${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read'
    };

    s3.upload(params, (err, data) => {
      if (err) reject(err);
      resolve(data.Location);
    });
  });
};

const generatePresignedUrl = (key) => {
  return s3.getSignedUrl('getObject', {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
    Expires: 60 * 5 // 5 minutes
  });
};

module.exports = { 
  uploadToS3, 
  generatePresignedUrl 
};
