import type { Model } from "mongoose"

export const generateSlug = async (text: string, model: Model<any>): Promise<string> => {
  let slug = text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")

  // Check if slug exists
  let slugExists = await model.findOne({ slug })
  let counter = 1

  while (slugExists) {
    slug = `${slug}-${counter}`
    slugExists = await model.findOne({ slug })
    counter++
  }

  return slug
}
