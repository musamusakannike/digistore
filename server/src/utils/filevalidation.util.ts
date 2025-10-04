export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]

export const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
]

export const ALLOWED_ARCHIVE_TYPES = [
  "application/zip",
  "application/x-zip-compressed",
  "application/x-rar-compressed",
  "application/x-7z-compressed",
]

export const ALLOWED_MEDIA_TYPES = [
  "video/mp4",
  "video/mpeg",
  "video/quicktime",
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
]

export const ALLOWED_EBOOK_TYPES = ["application/epub+zip", "application/x-mobipocket-ebook"]

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
export const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB

export const isValidImageType = (mimetype: string): boolean => {
  return ALLOWED_IMAGE_TYPES.includes(mimetype)
}

export const isValidFileType = (mimetype: string): boolean => {
  return [
    ...ALLOWED_IMAGE_TYPES,
    ...ALLOWED_DOCUMENT_TYPES,
    ...ALLOWED_ARCHIVE_TYPES,
    ...ALLOWED_MEDIA_TYPES,
    ...ALLOWED_EBOOK_TYPES,
  ].includes(mimetype)
}

export const isValidFileSize = (size: number, maxSize: number): boolean => {
  return size <= maxSize
}
