const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs').promises;
const path = require('path');

const processVideo = async (file) => {
  const tempInputPath = path.join('/tmp', `input-${Date.now()}.mp4`);
  const tempOutputPath = path.join('/tmp', `output-${Date.now()}.mp4`);

  // Write buffer to temp file
  await fs.writeFile(tempInputPath, file.buffer);

  return new Promise((resolve, reject) => {
    ffmpeg(tempInputPath)
      .videoCodec('libx264')
      .audioCodec('aac')
      .size('640x?') // Maintain aspect ratio
      .videoBitrate('1000k')
      .outputOptions([
        '-crf 23', // Constant Rate Factor for quality
        '-preset medium' // Encoding speed/compression balance
      ])
      .toFormat('mp4')
      .on('end', async () => {
        const processedBuffer = await fs.readFile(tempOutputPath);
        
        // Clean up temp files
        await fs.unlink(tempInputPath);
        await fs.unlink(tempOutputPath);

        resolve({
          ...file,
          buffer: processedBuffer,
          originalname: `processed-${file.originalname}`
        });
      })
      .on('error', (err) => reject(err))
      .save(tempOutputPath);
  });
};

module.exports = { processVideo };