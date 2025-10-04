import type { Request, Response, NextFunction } from "express"
import Category from "../models/category.model"
import Product from "../models/product.model"
import { asyncHandler } from "../utils/asynchandler.util"
import { sendSuccess, sendError } from "../utils/response.util"
import { generateSlug } from "../utils/slug.util"

// @desc    Get all categories
// @route   GET /api/v1/categories
// @access  Public
export const getCategories = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { isActive } = req.query

  const query: any = {}
  if (isActive !== undefined) query.isActive = isActive === "true"

  const categories = await Category.find(query).sort({ name: 1 })

  sendSuccess(res, 200, "Categories retrieved successfully", { categories })
})

// @desc    Get single category
// @route   GET /api/v1/categories/:id
// @access  Public
export const getCategory = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const category = await Category.findById(req.params.id)

  if (!category) {
    return sendError(res, 404, "Category not found")
  }

  sendSuccess(res, 200, "Category retrieved successfully", { category })
})

// @desc    Get category by slug
// @route   GET /api/v1/categories/slug/:slug
// @access  Public
export const getCategoryBySlug = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const category = await Category.findOne({ slug: req.params.slug })

  if (!category) {
    return sendError(res, 404, "Category not found")
  }

  sendSuccess(res, 200, "Category retrieved successfully", { category })
})

// @desc    Create category
// @route   POST /api/v1/categories
// @access  Private (Admin)
export const createCategory = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { name, description, icon } = req.body

  const slug = await generateSlug(name, Category)

  const category = await Category.create({
    name,
    slug,
    description,
    icon,
  })

  sendSuccess(res, 201, "Category created successfully", { category })
})

// @desc    Update category
// @route   PUT /api/v1/categories/:id
// @access  Private (Admin)
export const updateCategory = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const category = await Category.findById(req.params.id)

  if (!category) {
    return sendError(res, 404, "Category not found")
  }

  const { name, description, icon, isActive } = req.body

  if (name && name !== category.name) {
    category.name = name
    category.slug = await generateSlug(name, Category)
  }
  if (description !== undefined) category.description = description
  if (icon !== undefined) category.icon = icon
  if (isActive !== undefined) category.isActive = isActive

  await category.save()

  sendSuccess(res, 200, "Category updated successfully", { category })
})

// @desc    Delete category
// @route   DELETE /api/v1/categories/:id
// @access  Private (Admin)
export const deleteCategory = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const category = await Category.findById(req.params.id)

  if (!category) {
    return sendError(res, 404, "Category not found")
  }

  // Check if category has products
  const productCount = await Product.countDocuments({ category: category._id })
  if (productCount > 0) {
    return sendError(res, 400, "Cannot delete category with existing products")
  }

  await category.deleteOne()

  sendSuccess(res, 200, "Category deleted successfully")
})

// @desc    Update category product count
// @route   POST /api/v1/categories/:id/update-count
// @access  Private (Admin)
export const updateCategoryProductCount = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const category = await Category.findById(req.params.id)

  if (!category) {
    return sendError(res, 404, "Category not found")
  }

  const productCount = await Product.countDocuments({
    category: category._id,
    status: "approved",
    isActive: true,
  })

  category.productCount = productCount
  await category.save()

  sendSuccess(res, 200, "Category product count updated", { category })
})
