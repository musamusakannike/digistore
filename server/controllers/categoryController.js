const Category = require("../models/Category")
const File = require("../models/File")
const { validationResult } = require("express-validator")

// @desc    Get all categories
// @route   GET /api/v1/categories
// @access  Public
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true, parentCategory: null })
      .populate("subcategories")
      .populate("filesCount")
      .sort({ order: 1, name: 1 })

    res.status(200).json({
      success: true,
      data: {
        categories,
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get single category
// @route   GET /api/v1/categories/:id
// @access  Public
const getCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id).populate("subcategories").populate("filesCount")

    if (!category) {
      return res.status(404).json({
        success: false,
        error: "Category not found",
      })
    }

    res.status(200).json({
      success: true,
      data: {
        category,
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Create category
// @route   POST /api/v1/categories
// @access  Private (Admin only)
const createCategory = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: errors.array(),
      })
    }

    const category = await Category.create(req.body)

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: {
        category,
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Update category
// @route   PUT /api/v1/categories/:id
// @access  Private (Admin only)
const updateCategory = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: errors.array(),
      })
    }

    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })

    if (!category) {
      return res.status(404).json({
        success: false,
        error: "Category not found",
      })
    }

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: {
        category,
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Delete category
// @route   DELETE /api/v1/categories/:id
// @access  Private (Admin only)
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id)

    if (!category) {
      return res.status(404).json({
        success: false,
        error: "Category not found",
      })
    }

    // Check if category has files
    const fileCount = await File.countDocuments({ category: category._id })
    if (fileCount > 0) {
      return res.status(400).json({
        success: false,
        error: "Cannot delete category that contains files",
      })
    }

    // Check if category has subcategories
    const subcategoryCount = await Category.countDocuments({ parentCategory: category._id })
    if (subcategoryCount > 0) {
      return res.status(400).json({
        success: false,
        error: "Cannot delete category that has subcategories",
      })
    }

    await category.deleteOne()

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
}
