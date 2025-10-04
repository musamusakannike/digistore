import { body } from "express-validator"

export const updateProfileValidator = [
  body("firstName").optional().trim().isLength({ max: 50 }).withMessage("First name cannot exceed 50 characters"),
  body("lastName").optional().trim().isLength({ max: 50 }).withMessage("Last name cannot exceed 50 characters"),
  body("phone").optional().trim().isMobilePhone("any").withMessage("Please provide a valid phone number"),
  body("bio").optional().trim().isLength({ max: 500 }).withMessage("Bio cannot exceed 500 characters"),
  body("businessName")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Business name cannot exceed 100 characters"),
  body("businessDescription")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Business description cannot exceed 1000 characters"),
]

export const changePasswordValidator = [
  body("currentPassword").trim().notEmpty().withMessage("Current password is required"),
  body("newPassword")
    .trim()
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    ),
]

export const becomeSellerValidator = [
  body("businessName")
    .trim()
    .notEmpty()
    .withMessage("Business name is required")
    .isLength({ max: 100 })
    .withMessage("Business name cannot exceed 100 characters"),
  body("businessDescription")
    .trim()
    .notEmpty()
    .withMessage("Business description is required")
    .isLength({ max: 1000 })
    .withMessage("Business description cannot exceed 1000 characters"),
  body("bankDetails.bankName").trim().notEmpty().withMessage("Bank name is required"),
  body("bankDetails.accountNumber")
    .trim()
    .notEmpty()
    .withMessage("Account number is required")
    .isNumeric()
    .withMessage("Account number must be numeric"),
  body("bankDetails.accountName").trim().notEmpty().withMessage("Account name is required"),
]

export const updateBankDetailsValidator = [
  body("bankName").trim().notEmpty().withMessage("Bank name is required"),
  body("accountNumber")
    .trim()
    .notEmpty()
    .withMessage("Account number is required")
    .isNumeric()
    .withMessage("Account number must be numeric"),
  body("accountName").trim().notEmpty().withMessage("Account name is required"),
]
