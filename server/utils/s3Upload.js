const { s3 } = require("../config/aws")
const { v4: uuidv4 } = require("uuid")
const path = require("path")

// Upload file to S3
const uploadToS3 = async (file, folder = "files") => {
  try {
    const fileExtension = path.extname(file.originalname)
    const fileName = `${folder}/${uuidv4()}${fileExtension}`

    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: "private", // Files are private by default
      Metadata: {
        originalName: file.originalname,
        uploadedAt: new Date().toISOString(),
      },
    }

    const result = await s3.upload(uploadParams).promise()

    return {
      key: result.Key,
      location: result.Location,
      bucket: result.Bucket,
      etag: result.ETag,
    }
  } catch (error) {
    console.error("S3 upload error:", error)
    throw new Error("File upload failed")
  }
}

// Generate signed URL for file download
const generateSignedUrl = async (key, expiresIn = 3600) => {
  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Expires: expiresIn, // URL expires in 1 hour by default
    }

    const url = await s3.getSignedUrlPromise("getObject", params)
    return url
  } catch (error) {
    console.error("S3 signed URL error:", error)
    throw new Error("Failed to generate download URL")
  }
}

// Delete file from S3
const deleteFromS3 = async (key) => {
  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
    }

    await s3.deleteObject(params).promise()
    return true
  } catch (error) {
    console.error("S3 delete error:", error)
    throw new Error("File deletion failed")
  }
}

// Get file metadata from S3
const getFileMetadata = async (key) => {
  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
    }

    const result = await s3.headObject(params).promise()
    return {
      size: result.ContentLength,
      lastModified: result.LastModified,
      contentType: result.ContentType,
      metadata: result.Metadata,
    }
  } catch (error) {
    console.error("S3 metadata error:", error)
    throw new Error("Failed to get file metadata")
  }
}

// Upload thumbnail to S3
const uploadThumbnail = async (thumbnailBuffer, originalFileName) => {
  try {
    const fileName = `thumbnails/${uuidv4()}-${originalFileName}.jpg`

    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: fileName,
      Body: thumbnailBuffer,
      ContentType: "image/jpeg",
      ACL: "public-read", // Thumbnails can be public
    }

    const result = await s3.upload(uploadParams).promise()
    return result.Location
  } catch (error) {
    console.error("Thumbnail upload error:", error)
    return null // Don't fail the entire upload if thumbnail fails
  }
}

module.exports = {
  uploadToS3,
  generateSignedUrl,
  deleteFromS3,
  getFileMetadata,
  uploadThumbnail,
}
