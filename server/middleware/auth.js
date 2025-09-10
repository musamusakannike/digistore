const jwt = require("jsonwebtoken")
const User = require("../models/User")

// Protect routes - require authentication
const protect = async (req, res, next) => {
  let token

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1]

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      // Get user from token
      req.user = await User.findById(decoded.id).select("-password")

      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: "User not found",
        })
      }

      if (!req.user.isActive) {
        return res.status(401).json({
          success: false,
          error: "Account is deactivated",
        })
      }

      next()
    } catch (error) {
      console.error("Auth middleware error:", error)
      return res.status(401).json({
        success: false,
        error: "Not authorized to access this route",
      })
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Not authorized, no token",
    })
  }
}

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role ${req.user.role} is not authorized to access this route`,
      })
    }
    next()
  }
}

// Check if user owns the resource or is admin
const checkOwnership = (Model, paramName = "id") => {
  return async (req, res, next) => {
    try {
      const resource = await Model.findById(req.params[paramName])

      if (!resource) {
        return res.status(404).json({
          success: false,
          error: "Resource not found",
        })
      }

      // Allow if user is admin or owns the resource
      if (req.user.role === "admin" || resource.user.toString() === req.user._id.toString()) {
        req.resource = resource
        next()
      } else {
        return res.status(403).json({
          success: false,
          error: "Not authorized to access this resource",
        })
      }
    } catch (error) {
      next(error)
    }
  }
}

module.exports = {
  protect,
  authorize,
  checkOwnership,
}
