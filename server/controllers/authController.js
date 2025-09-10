const crypto = require("crypto")
const User = require("../models/User")
const sendEmail = require("../utils/sendEmail")
const { generateToken, generateRefreshToken, verifyRefreshToken } = require("../utils/generateToken")
const { validationResult } = require("express-validator")

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
const register = async (req, res, next) => {
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

    const { firstName, lastName, email, password, university, faculty, department, level, phoneNumber } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "User already exists with this email",
      })
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      university,
      faculty,
      department,
      level,
      phoneNumber,
    })

    // Generate email verification token
    const verificationToken = user.getEmailVerificationToken()
    await user.save({ validateBeforeSave: false })

    // Create verification URL
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`

    // Email message
    const message = `
      <h1>Welcome to Digistore!</h1>
      <p>Hello ${user.firstName},</p>
      <p>Thank you for registering with us. Please verify your email address by clicking the link below:</p>
      <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
      <p>This link will expire in 24 hours.</p>
      <p>If you didn't create this account, please ignore this email.</p>
      <br>
      <p>Best regards,<br>Digistore Team</p>
    `

    try {
      await sendEmail({
        email: user.email,
        subject: "Email Verification - Digistore",
        html: message,
      })

      res.status(201).json({
        success: true,
        message: "User registered successfully. Please check your email for verification link.",
        data: {
          user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            university: user.university,
            faculty: user.faculty,
            department: user.department,
            level: user.level,
            isEmailVerified: user.isEmailVerified,
          },
        },
      })
    } catch (err) {
      console.error("Email sending failed:", err)
      user.emailVerificationToken = undefined
      user.emailVerificationExpire = undefined
      await user.save({ validateBeforeSave: false })

      return res.status(500).json({
        success: false,
        error: "User registered but email could not be sent. Please request verification email again.",
      })
    }
  } catch (error) {
    next(error)
  }
}

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
const login = async (req, res, next) => {
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

    const { email, password } = req.body

    // Check for user
    const user = await User.findOne({ email }).select("+password")

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      })
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        error: "Account temporarily locked due to too many failed login attempts. Please try again later.",
      })
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: "Account is deactivated. Please contact support.",
      })
    }

    // Check password
    const isMatch = await user.matchPassword(password)

    if (!isMatch) {
      // Increment login attempts
      await user.incLoginAttempts()
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      })
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      await user.resetLoginAttempts()
    }

    // Update last login
    user.lastLogin = new Date()
    await user.save({ validateBeforeSave: false })

    // Generate tokens
    const token = generateToken(user._id)
    const refreshToken = generateRefreshToken(user._id)

    // Save refresh token
    user.refreshTokens.push({
      token: refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    })
    await user.save({ validateBeforeSave: false })

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          university: user.university,
          faculty: user.faculty,
          department: user.department,
          level: user.level,
          isEmailVerified: user.isEmailVerified,
          isPhoneVerified: user.isPhoneVerified,
          avatar: user.avatar,
          earnings: user.earnings,
        },
        tokens: {
          accessToken: token,
          refreshToken: refreshToken,
        },
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Refresh access token
// @route   POST /api/v1/auth/refresh
// @access  Public
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: "Refresh token is required",
      })
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken)
    const user = await User.findById(decoded.id)

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid refresh token",
      })
    }

    // Check if refresh token exists in user's tokens
    const tokenExists = user.refreshTokens.some((token) => token.token === refreshToken && token.expiresAt > new Date())

    if (!tokenExists) {
      return res.status(401).json({
        success: false,
        error: "Invalid or expired refresh token",
      })
    }

    // Generate new access token
    const newAccessToken = generateToken(user._id)

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      data: {
        accessToken: newAccessToken,
      },
    })
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: "Invalid refresh token",
    })
  }
}

// @desc    Logout user
// @route   POST /api/v1/auth/logout
// @access  Private
const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body

    if (refreshToken) {
      // Remove refresh token from user's tokens
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { refreshTokens: { token: refreshToken } },
      })
    }

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Verify email
// @route   GET /api/v1/auth/verify-email/:token
// @access  Public
const verifyEmail = async (req, res, next) => {
  try {
    // Get hashed token
    const emailVerificationToken = crypto.createHash("sha256").update(req.params.token).digest("hex")

    const user = await User.findOne({
      emailVerificationToken,
      emailVerificationExpire: { $gt: Date.now() },
    })

    if (!user) {
      return res.status(400).json({
        success: false,
        error: "Invalid or expired verification token",
      })
    }

    // Verify email
    user.isEmailVerified = true
    user.emailVerificationToken = undefined
    user.emailVerificationExpire = undefined
    await user.save()

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Resend email verification
// @route   POST /api/v1/auth/resend-verification
// @access  Public
const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body

    const user = await User.findOne({ email })

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      })
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        error: "Email is already verified",
      })
    }

    // Generate new verification token
    const verificationToken = user.getEmailVerificationToken()
    await user.save({ validateBeforeSave: false })

    // Create verification URL
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`

    // Email message
    const message = `
      <h1>Email Verification</h1>
      <p>Hello ${user.firstName},</p>
      <p>Please verify your email address by clicking the link below:</p>
      <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
      <p>This link will expire in 24 hours.</p>
      <br>
      <p>Best regards,<br>Digistore Team</p>
    `

    await sendEmail({
      email: user.email,
      subject: "Email Verification - Digistore",
      html: message,
    })

    res.status(200).json({
      success: true,
      message: "Verification email sent successfully",
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Forgot password
// @route   POST /api/v1/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body

    const user = await User.findOne({ email })

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      })
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken()
    await user.save({ validateBeforeSave: false })

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`

    // Email message
    const message = `
      <h1>Password Reset Request</h1>
      <p>Hello ${user.firstName},</p>
      <p>You have requested a password reset. Please click the link below to reset your password:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #dc3545; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
      <p>This link will expire in 10 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <br>
      <p>Best regards,<br>Digistore Team</p>
    `

    try {
      await sendEmail({
        email: user.email,
        subject: "Password Reset - Digistore",
        html: message,
      })

      res.status(200).json({
        success: true,
        message: "Password reset email sent",
      })
    } catch (err) {
      console.error("Password reset email failed:", err)
      user.passwordResetToken = undefined
      user.passwordResetExpire = undefined
      await user.save({ validateBeforeSave: false })

      return res.status(500).json({
        success: false,
        error: "Email could not be sent",
      })
    }
  } catch (error) {
    next(error)
  }
}

// @desc    Reset password
// @route   PUT /api/v1/auth/reset-password/:resettoken
// @access  Public
const resetPassword = async (req, res, next) => {
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

    // Get hashed token
    const passwordResetToken = crypto.createHash("sha256").update(req.params.resettoken).digest("hex")

    const user = await User.findOne({
      passwordResetToken,
      passwordResetExpire: { $gt: Date.now() },
    })

    if (!user) {
      return res.status(400).json({
        success: false,
        error: "Invalid or expired reset token",
      })
    }

    // Set new password
    user.password = req.body.password
    user.passwordResetToken = undefined
    user.passwordResetExpire = undefined
    await user.save()

    // Generate token
    const token = generateToken(user._id)

    res.status(200).json({
      success: true,
      message: "Password reset successful",
      data: {
        token,
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate("filesUploaded filesPurchased")

    res.status(200).json({
      success: true,
      data: {
        user,
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Update user details
// @route   PUT /api/v1/auth/update-details
// @access  Private
const updateDetails = async (req, res, next) => {
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

    const fieldsToUpdate = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      university: req.body.university,
      faculty: req.body.faculty,
      department: req.body.department,
      level: req.body.level,
      phoneNumber: req.body.phoneNumber,
    }

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach((key) => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key])

    const user = await User.findByIdAndUpdate(req.user._id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    })

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user,
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Update password
// @route   PUT /api/v1/auth/update-password
// @access  Private
const updatePassword = async (req, res, next) => {
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

    const user = await User.findById(req.user._id).select("+password")

    // Check current password
    if (!(await user.matchPassword(req.body.currentPassword))) {
      return res.status(401).json({
        success: false,
        error: "Current password is incorrect",
      })
    }

    user.password = req.body.newPassword
    await user.save()

    const token = generateToken(user._id)

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
      data: {
        token,
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Update bank details
// @route   PUT /api/v1/auth/update-bank-details
// @access  Private
const updateBankDetails = async (req, res, next) => {
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

    const { bankName, accountNumber, accountName, bankCode } = req.body

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        bankDetails: {
          bankName,
          accountNumber,
          accountName,
          bankCode,
        },
      },
      {
        new: true,
        runValidators: true,
      },
    )

    res.status(200).json({
      success: true,
      message: "Bank details updated successfully",
      data: {
        bankDetails: user.bankDetails,
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Add push notification token
// @route   POST /api/v1/auth/push-token
// @access  Private
const addPushToken = async (req, res, next) => {
  try {
    const { token, platform } = req.body

    if (!token || !platform) {
      return res.status(400).json({
        success: false,
        error: "Token and platform are required",
      })
    }

    const user = await User.findById(req.user._id)

    // Remove existing token if it exists
    user.pushTokens = user.pushTokens.filter((t) => t.token !== token)

    // Add new token
    user.pushTokens.push({ token, platform })

    // Keep only the latest 5 tokens per user
    if (user.pushTokens.length > 5) {
      user.pushTokens = user.pushTokens.slice(-5)
    }

    await user.save()

    res.status(200).json({
      success: true,
      message: "Push token added successfully",
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Remove push notification token
// @route   DELETE /api/v1/auth/push-token
// @access  Private
const removePushToken = async (req, res, next) => {
  try {
    const { token } = req.body

    if (!token) {
      return res.status(400).json({
        success: false,
        error: "Token is required",
      })
    }

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { pushTokens: { token } },
    })

    res.status(200).json({
      success: true,
      message: "Push token removed successfully",
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  getMe,
  updateDetails,
  updatePassword,
  updateBankDetails,
  addPushToken,
  removePushToken,
}
