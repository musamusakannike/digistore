# TODOS

## SERVER SIDE

Based on the codebase analysis of the /server directory, here are the missing features:

  1. Coupons & Discounts System

- Status: Missing
- Details: There is no logic in cart.controller.ts or order.controller.ts to apply discount codes. A Coupon model and validation logic (percentage vs. fixed, expiry, usage
     limits) are needed.

  1. Two-Factor Authentication (2FA)

- Status: Missing
- Details: auth.controller.ts handles standard email/password and token-based auth, but lacks TOTP (Google Authenticator) or SMS-based 2FA, which is important for security,
     especially for sellers and admins.

  1. Support/Ticket System

- Status: Missing
- Details: There is no way for users to report issues with orders or products directly within the platform (other than general reviews). A Ticket model and controller for
     handling disputes or help requests would be beneficial.

  1. Admin Audit Logs

- Status: Missing
- Details: While there is an admin.controller.ts, there is no system to track who performed sensitive actions (e.g., who approved a product, who suspended a user). An AuditLog
     model is standard for this.

  1. Manual Refund Workflow

- Status: Partial / Risky
- Details: payment.controller.ts contains a requestRefund function that appears to automatically process refunds via Flutterwave if the request is within 7 days. There is no
     intermediate step for admin/seller review to verify the claim before money is returned.

  1. Advanced Analytics & Reporting

- Status: Basic
- Details: analytics.controller.ts provides basic sales data. It lacks features like exporting reports (PDF/CSV), detailed user retention metrics, or category performance
     breakdowns.

  1. Content Moderation (Automated)

- Status: Missing
- Details: Product approvals are manual. There is no automated text analysis (for profanity/spam) on reviews or product descriptions.

  Summary of Existing Features (Confirmed)

- ✅ User Auth (Register, Login, Email Verify, Reset Password)
- ✅ Product Management (CRUD, Search, Filtering, Cloudinary Uploads)
- ✅ Order System (Cart, Direct Order, Tax Calculation)
- ✅ Payments (Flutterwave Integration, Webhooks)
- ✅ File Delivery (Secure downloads with purchase verification)
- ✅ Wishlist (Add/Remove/View)
- ✅ Notifications (In-app & Email)
- ✅ Reviews (Rating, Comment, Helpful votes)

## FRONTEND SIDE

✦ Based on the backend architecture and standard requirements for a digital marketplace, here is a comprehensive list of frontend pages and their key features for the UI/UX
  designer.

  1. Public & Discovery Pages

  1.1. Landing Page (Home)

- Goal: Immediately showcase value and drive exploration.
- Key Features:
  - Hero Section: High-impact banner with a "Shop Now" or "Start Selling" CTA.
  - Featured Categories: Grid or carousel of top categories (e.g., "Software", "E-books", "Templates").
  - Trending/Featured Products: Horizontal scroll of high-performing products.
  - New Arrivals: Grid of recently added items.
  - Value Proposition: Icons/Text explaining why to choose DigiStore (e.g., "Secure Payment", "Instant Download").
  - Footer: Links to legal (Terms, Privacy), Socials, and Support.

  1.2. Product Listing / Search Results

- Goal: Help users find specific items quickly.
- Key Features:
  - Sidebar Filters: Price range slider, Rating (4+ stars), Category, Seller.
  - Sort Options: Dropdown (Price Low-High, Newest, Best Selling).
  - View Toggle: Grid vs. List view.
  - Product Cards: Thumbnail, Title, Price, Discount badge, Star rating, "Add to Cart" button, "Wishlist" heart icon.
  - Pagination/Infinite Scroll: Loading mechanism for more results.
  - Empty State: Friendly illustration when no results match.

  1.3. Product Detail Page (PDP)

- Goal: Convert interest into a sale.
- Key Features:
  - Media Gallery: Main image with zoom functionality + thumbnail carousel.
  - Purchase Box (Sticky on Desktop): Price, Discount, "Buy Now" (Direct Checkout), "Add to Cart", "Add to Wishlist".
  - Product Info: Title, Short description, Seller profile summary (Avatar + Name).
  - Tabs:
    - Description: Rich text details about the product.
    - Files: List of included file types/sizes (e.g., "PDF - 5MB", "ZIP - 100MB").
    - Reviews: User ratings, text reviews, helpful upvotes, and seller responses.
  - Related Products: "You might also like" carousel at the bottom.

  1.4. Shopping Cart

- Goal: Review selected items before checkout.
- Key Features:
  - Item List: Thumbnail, Title, Price, Remove button.
  - Order Summary: Subtotal, Tax calculation (placeholder for now), Total.
  - Coupon Input: Field to apply discount codes (UX should allow this even if backend isn't ready).
  - Checkout CTA: Prominent "Proceed to Checkout" button.

  ---

  1. Authentication & Onboarding

  2.1. Login / Register

- Goal: Secure entry for Buyers and Sellers.
- Key Features:
  - Toggle: Switch between "Sign In" and "Sign Up" easily.
  - Role Selection (Register): "I want to Buy" vs. "I want to Sell" (Radio buttons or Cards).
  - Social Login: "Continue with Google" (Standard practice, even if not yet in backend).
  - Form Fields: Email, Password, Name.
  - Forgot Password: Link to recovery flow.

  2.2. Password Recovery Flow

- Pages:
  - Request Reset: Enter email address.
  - Check Email: Success message instructing user to check inbox.
  - Reset Form: Enter new password (accessed via email link).

  ---

  1. Checkout & Payment

  3.1. Checkout Page

- Goal: Finalize the purchase securely.
- Key Features:
  - Order Review: Brief summary of items and total cost.
  - Payment Method: Flutterwave integration (Card, Transfer, etc.).
  - Contact Info: Confirm email for receipt/download link.
  - Payment Button: "Pay [Amount]" button.

  3.2. Payment Status

- Pages:
  - Success: "Thank you!" message, Order Reference ID, and immediate "Download Files" button.
  - Failure: "Payment Failed" message, retry button, and contact support link.

  ---

  1. Buyer Dashboard

  4.1. Dashboard Overview

- Goal: Quick access to recent activity.
- Key Features:
  - Stats: Total Orders, Total Spent.
  - Recent Orders: Simplified list of last 3-5 purchases.

  4.2. My Orders / Downloads

- Goal: Access purchased content (Critical for Digital Products).
- Key Features:
  - Order List: Date, ID, Status, Total.
  - Action Buttons: "View Details", "Download Invoice".
  - File Access: Prominent "Download" button next to each product in the order details. Note: Digital products don't need tracking numbers, they need instant access.

  4.3. Wishlist

- Key Features: Grid of saved products with "Move to Cart" and "Remove" options.

  4.4. Profile Settings

- Key Features: Edit Name/Email, Change Password, Manage Notifications preferences.

  ---

  1. Seller Dashboard

  5.1. Seller Overview

- Goal: Business health at a glance.
- Key Features:
  - KPI Cards: Total Revenue, Total Sales, Product Views.
  - Sales Chart: Line graph showing revenue over time (7d, 30d, etc.).
  - Recent Sales: Table of latest transactions.

  5.2. Product Management

- List View: Table of products with Status (Draft, Pending, Approved, Rejected), Price, and Sales count.
- Add/Edit Product Form:
  - Basic Info: Title, Description (Rich Text Editor), Category.
  - Pricing: Price, Discount Price.
  - Media: Image Uploader (Drag & drop), File Uploader (Secure digital asset upload).
  - Settings: Tags, SEO Meta data.

  5.3. Analytics

- Key Features: Deeper dive into Top Selling Products, Visitor demographics (if available), and Revenue breakdowns.

  5.4. Store Settings

- Key Features: Upload Brand Logo/Avatar, Edit "Business Name", Write "Seller Bio".

  ---

  1. Admin Dashboard (Internal)

  6.1. Overview

- Key Features: Platform-wide stats (Total Users, Total Revenue, Active Products).

  6.2. Moderation Queues

- Products: List of "Pending" products. Admin needs a view to Preview the product and buttons to Approve or Reject (with a reason input).
- Users: List of users with search, view details, and Ban/Suspend controls.

  6.3. Categories

- Key Features: CRUD interface for product categories (Add new, Edit name/icon).

  ---

  1. Shared Components (Design System)

- Navigation Bar: Logo, Search Bar, User Menu (Avatar), Cart Icon (with badge).
- Mobile Navigation: Bottom tab bar for easier mobile access.
- Toast/Notifications: Pop-ups for success/error messages (e.g., "Added to Cart").
- Modals: Confirmation dialogs (Delete, Ban), Quick View.
- Loaders: Skeleton screens for data loading states.
