import cloudinary from "../config/cloudinary.config"
import type { UploadApiOptions, UploadApiResponse } from "cloudinary"
import { Readable } from "stream"

export const uploadToCloudinary = async (
  buffer: Buffer,
  options: UploadApiOptions = {},
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) {
        reject(error)
      } else {
        resolve(result as UploadApiResponse)
      }
    })

    const readableStream = new Readable()
    readableStream.push(buffer)
    readableStream.push(null)
    readableStream.pipe(uploadStream)
  })
}

export const deleteFromCloudinary = async (publicId: string, resourceType = "image"): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType })
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error)
    throw new Error("Failed to delete file from storage")
  }
}

export const deleteMultipleFromCloudinary = async (publicIds: string[], resourceType = "image"): Promise<void> => {
  try {
    await cloudinary.api.delete_resources(publicIds, { resource_type: resourceType })
  } catch (error) {
    console.error("Error deleting multiple files from Cloudinary:", error)
    throw new Error("Failed to delete files from storage")
  }
}
