const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl }    = require('@aws-sdk/s3-request-presigner');
const { v4: uuidv4 }      = require('uuid');
const { s3, S3_BUCKET }   = require('../config/s3');

const VALID_FOLDERS = ['videos', 'thumbnails', 'avatars', 'course-files', 'channel-assets'];

// POST /upload/presigned-url  🔒 instructor
const getPresignedUrl = async (req, res) => {
  const { fileName, fileType, folder } = req.body;

  if (!fileName || !fileType || !folder) {
    return res.status(400).json({ message: 'fileName, fileType and folder are required' });
  }
  if (!VALID_FOLDERS.includes(folder)) {
    return res.status(400).json({ message: `Invalid folder. Must be one of: ${VALID_FOLDERS.join(', ')}` });
  }

  const ext = fileName.split('.').pop();
  const key = `${folder}/${uuidv4()}.${ext}`;

  const command   = new PutObjectCommand({ Bucket: S3_BUCKET, Key: key, ContentType: fileType });
  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

  res.json({ uploadUrl, key, expiresIn: 3600 });
};

module.exports = { getPresignedUrl };
