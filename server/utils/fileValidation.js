const path = require("path")

// Allowed file types and their MIME types
const ALLOWED_FILE_TYPES = {
  // Documents
  pdf: ["application/pdf"],
  doc: ["application/msword"],
  docx: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  ppt: ["application/vnd.ms-powerpoint"],
  pptx: ["application/vnd.openxmlformats-officedocument.presentationml.presentation"],
  xls: ["application/vnd.ms-excel"],
  xlsx: ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
  txt: ["text/plain"],
  rtf: ["application/rtf"],

  // Archives
  zip: ["application/zip", "application/x-zip-compressed"],
  rar: ["application/x-rar-compressed", "application/vnd.rar"],
  "7z": ["application/x-7z-compressed"],

  // Images
  jpg: ["image/jpeg"],
  jpeg: ["image/jpeg"],
  png: ["image/png"],
  gif: ["image/gif"],
  bmp: ["image/bmp"],
  webp: ["image/webp"],

  // Audio
  mp3: ["audio/mpeg"],
  wav: ["audio/wav"],
  m4a: ["audio/mp4"],

  // Video
  mp4: ["video/mp4"],
  avi: ["video/x-msvideo"],
  mov: ["video/quicktime"],
  wmv: ["video/x-ms-wmv"],
}

// Get allowed extensions from environment or use defaults
const getAllowedExtensions = () => {
  const envTypes = process.env.ALLOWED_FILE_TYPES
  if (envTypes) {
    return envTypes.split(",").map((type) => type.trim().toLowerCase())
  }
  return Object.keys(ALLOWED_FILE_TYPES)
}

// Validate file type
const validateFileType = (file) => {
  const fileExtension = path.extname(file.originalname).toLowerCase().slice(1)
  const allowedExtensions = getAllowedExtensions()

  if (!allowedExtensions.includes(fileExtension)) {
    return {
      isValid: false,
      error: `File type .${fileExtension} is not allowed. Allowed types: ${allowedExtensions.join(", ")}`,
    }
  }

  const allowedMimeTypes = ALLOWED_FILE_TYPES[fileExtension]
  if (allowedMimeTypes && !allowedMimeTypes.includes(file.mimetype)) {
    return {
      isValid: false,
      error: `Invalid MIME type for .${fileExtension} file`,
    }
  }

  return { isValid: true }
}

// Validate file size
const validateFileSize = (file) => {
  const maxSize = Number.parseInt(process.env.MAX_FILE_SIZE) || 100 * 1024 * 1024 // 100MB default

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size exceeds maximum allowed size of ${(maxSize / (1024 * 1024)).toFixed(0)}MB`,
    }
  }

  return { isValid: true }
}

// Validate file name
const validateFileName = (fileName) => {
  // Check for dangerous characters
  const dangerousChars = /[<>:"/\\|?*\x00-\x1f]/
  if (dangerousChars.test(fileName)) {
    return {
      isValid: false,
      error: "File name contains invalid characters",
    }
  }

  // Check length
  if (fileName.length > 255) {
    return {
      isValid: false,
      error: "File name is too long (maximum 255 characters)",
    }
  }

  return { isValid: true }
}

// Comprehensive file validation
const validateFile = (file) => {
  const validations = [validateFileName(file.originalname), validateFileType(file), validateFileSize(file)]

  for (const validation of validations) {
    if (!validation.isValid) {
      return validation
    }
  }

  return { isValid: true }
}

// Get file category based on extension
const getFileCategory = (fileName) => {
  const extension = path.extname(fileName).toLowerCase().slice(1)

  if (["pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx", "txt", "rtf"].includes(extension)) {
    return "document"
  }
  if (["zip", "rar", "7z"].includes(extension)) {
    return "archive"
  }
  if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(extension)) {
    return "image"
  }
  if (["mp3", "wav", "m4a"].includes(extension)) {
    return "audio"
  }
  if (["mp4", "avi", "mov", "wmv"].includes(extension)) {
    return "video"
  }

  return "other"
}

// Check if file type supports thumbnail generation
const supportsThumbnail = (fileName) => {
  const extension = path.extname(fileName).toLowerCase().slice(1)
  return ["jpg", "jpeg", "png", "gif", "bmp", "webp", "pdf"].includes(extension)
}

module.exports = {
  validateFile,
  validateFileType,
  validateFileSize,
  validateFileName,
  getFileCategory,
  supportsThumbnail,
  getAllowedExtensions,
  ALLOWED_FILE_TYPES,
}
