# DigiStore - Digital Products Marketplace Backend

A comprehensive, production-ready digital products marketplace API built with Node.js, Express, TypeScript, and MongoDB. Features secure authentication, Flutterwave payment integration, file management with Vercel Blob, reviews, notifications, and admin capabilities.

## Features

### For Sellers
- Create and manage digital products with multiple files
- Upload product images and downloadable files
- Track sales, earnings, and analytics
- View detailed sales insights and top products
- Manage product reviews and respond to customers
- Receive notifications for sales and reviews
- Secure bank account management for withdrawals

### For Buyers
- Browse and search products with advanced filters
- Secure payment processing via Flutterwave
- Instant access to purchased digital files
- Review and rate purchased products
- Order history with download links
- Wishlist functionality
- Real-time notifications for orders and updates

### For Admins
- Comprehensive dashboard with platform statistics
- User management (suspend, activate, delete)
- Product moderation (approve, reject, suspend)
- Transaction monitoring and refund management
- Category management
- Featured product curation
- Platform-wide analytics

## Tech Stack

- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (Access + Refresh tokens) with bcryptjs
- **Payment Gateway**: Flutterwave
- **File Storage**: Vercel Blob Storage
- **Email Service**: Nodemailer with SMTP
- **Push Notifications**: Expo Server SDK
- **Security**: Helmet, CORS, Express Rate Limit, XSS protection
- **Validation**: Express Validator
- **Development**: Nodemon, TS-Node

## Prerequisites

Before you begin, ensure you have:

- Node.js 18 or higher
- MongoDB 5.0 or higher (local or MongoDB Atlas)
- Vercel Blob Storage account
- Flutterwave account (test or production)
- SMTP server for emails (Gmail, SendGrid, etc.)

## Installation

### 1. Clone the Repository

\`\`\`bash
git clone https://github.com/yourusername/digistore-backend.git
cd digistore-backend
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Environment Configuration

Create a `.env` file in the root directory:

\`\`\`bash
cp .env.example .env
\`\`\`

Update the `.env` file with your configuration:

\`\`\`env
# Server Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/digistore

# JWT Secrets
JWT_ACCESS_SECRET=your-super-secret-access-key-change-this
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token

# Flutterwave
FLUTTERWAVE_PUBLIC_KEY=your-flutterwave-public-key
FLUTTERWAVE_SECRET_KEY=your-flutterwave-secret-key
FLUTTERWAVE_ENCRYPTION_KEY=your-flutterwave-encryption-key
FLUTTERWAVE_WEBHOOK_SECRET=your-webhook-secret

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@digistore.com

# Expo Push Notifications (Optional)
EXPO_ACCESS_TOKEN=your-expo-access-token
\`\`\`

### 4. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

The server will start at `http://localhost:5000`

### 5. Build for Production

\`\`\`bash
npm run build
npm start
\`\`\`

## Project Structure

\`\`\`
digistore-backend/
├── src/
│   ├── config/              # Configuration files
│   │   ├── database.ts      # MongoDB connection
│   │   └── cloudinary.ts    # File upload config
│   ├── controllers/         # Route controllers
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   ├── product.controller.ts
│   │   ├── order.controller.ts
│   │   ├── payment.controller.ts
│   │   ├── review.controller.ts
│   │   ├── notification.controller.ts
│   │   ├── admin.controller.ts
│   │   └── analytics.controller.ts
│   ├── middlewares/         # Custom middlewares
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── validate.middleware.ts
│   │   └── ratelimit.middleware.ts
│   ├── models/              # Mongoose models
│   │   ├── user.model.ts
│   │   ├── product.model.ts
│   │   ├── category.model.ts
│   │   ├── order.model.ts
│   │   ├── transaction.model.ts
│   │   ├── cart.model.ts
│   │   ├── review.model.ts
│   │   └── notification.model.ts
│   ├── routes/              # API routes
│   │   ├── auth.route.ts
│   │   ├── user.route.ts
│   │   ├── product.route.ts
│   │   ├── category.route.ts
│   │   ├── order.route.ts
│   │   ├── payment.route.ts
│   │   ├── cart.route.ts
│   │   ├── review.route.ts
│   │   ├── notification.route.ts
│   │   ├── admin.route.ts
│   │   ├── analytics.route.ts
│   │   └── upload.route.ts
│   ├── services/            # Business logic
│   │   ├── email.service.ts
│   │   ├── notification.service.ts
│   │   └── payment.service.ts
│   ├── utils/               # Utility functions
│   │   ├── asynchandler.util.ts
│   │   ├── error.util.ts
│   │   ├── response.util.ts
│   │   └── slugify.util.ts
│   ├── validators/          # Request validators
│   │   ├── auth.validator.ts
│   │   ├── product.validator.ts
│   │   ├── order.validator.ts
│   │   └── review.validator.ts
│   ├── types/               # TypeScript types
│   │   └── express.d.ts
│   └── server.ts            # Application entry point
├── .env.example             # Environment variables template
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
\`\`\`

## API Documentation

Base URL: `http://localhost:5000/api/v1`

For detailed API documentation with examples, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

### Quick Reference

#### Authentication Endpoints
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout user
- `GET /auth/verify-email/:token` - Verify email
- `POST /auth/resend-verification` - Resend verification email
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password/:token` - Reset password

#### User Endpoints
- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update profile
- `POST /users/avatar` - Upload avatar
- `PUT /users/password` - Change password
- `POST /users/become-seller` - Upgrade to seller
- `PUT /users/bank-details` - Update bank details
- `POST /users/wishlist/:productId` - Add to wishlist
- `DELETE /users/wishlist/:productId` - Remove from wishlist
- `GET /users/wishlist` - Get wishlist

#### Product Endpoints
- `GET /products` - Get all products (with filters)
- `GET /products/featured` - Get featured products
- `GET /products/:id` - Get single product
- `GET /products/slug/:slug` - Get product by slug
- `POST /products` - Create product (Seller)
- `PUT /products/:id` - Update product (Seller)
- `DELETE /products/:id` - Delete product (Seller)
- `POST /products/:id/submit` - Submit for review (Seller)
- `GET /products/seller/my-products` - Get seller's products

#### Category Endpoints
- `GET /categories` - Get all categories
- `GET /categories/:id` - Get single category
- `GET /categories/slug/:slug` - Get category by slug
- `POST /categories` - Create category (Admin)
- `PUT /categories/:id` - Update category (Admin)
- `DELETE /categories/:id` - Delete category (Admin)

#### Cart Endpoints
- `GET /cart` - Get user's cart
- `POST /cart/items` - Add item to cart
- `PUT /cart/items/:productId` - Update cart item
- `DELETE /cart/items/:productId` - Remove from cart
- `DELETE /cart` - Clear cart

#### Order Endpoints
- `POST /orders` - Create order from cart
- `POST /orders/direct` - Create direct order (buy now)
- `GET /orders` - Get user's orders
- `GET /orders/:id` - Get order details
- `GET /orders/stats` - Get order statistics
- `PUT /orders/:id/cancel` - Cancel order
- `GET /orders/seller/sales` - Get seller's sales (Seller)

#### Payment Endpoints
- `GET /payments/config` - Get payment configuration
- `POST /payments/initialize` - Initialize payment
- `GET /payments/verify/:reference` - Verify payment
- `GET /payments/status/:reference` - Get payment status
- `GET /payments/transactions` - Get user transactions
- `POST /payments/:transactionId/refund` - Request refund
- `POST /payments/webhook` - Flutterwave webhook

#### Review Endpoints
- `GET /reviews/product/:productId` - Get product reviews
- `POST /reviews` - Create review
- `PUT /reviews/:id` - Update review
- `DELETE /reviews/:id` - Delete review
- `POST /reviews/:id/helpful` - Mark review as helpful
- `DELETE /reviews/:id/helpful` - Remove helpful mark
- `POST /reviews/:id/respond` - Respond to review (Seller)
- `GET /reviews/user/my-reviews` - Get user's reviews
- `GET /reviews/can-review/:productId` - Check if can review

#### Notification Endpoints
- `GET /notifications` - Get notifications
- `GET /notifications/unread-count` - Get unread count
- `PUT /notifications/:id/read` - Mark as read
- `PUT /notifications/read-all` - Mark all as read
- `DELETE /notifications/:id` - Delete notification
- `DELETE /notifications/read/all` - Delete all read

#### Analytics Endpoints
- `GET /analytics/seller` - Get seller analytics
- `GET /analytics/buyer` - Get buyer analytics

#### Admin Endpoints
- `GET /admin/users` - Get all users
- `GET /admin/users/:id` - Get user details
- `PUT /admin/users/:id/status` - Update user status
- `DELETE /admin/users/:id` - Delete user
- `GET /admin/products` - Get all products
- `PUT /admin/products/:id/approve` - Approve product
- `PUT /admin/products/:id/reject` - Reject product
- `PUT /admin/products/:id/suspend` - Suspend product
- `PUT /admin/products/:id/featured` - Toggle featured
- `GET /admin/orders` - Get all orders
- `GET /admin/stats` - Get dashboard statistics

#### Upload Endpoints
- `POST /upload/:id/images` - Upload product images
- `POST /upload/:id/files` - Upload product files
- `DELETE /upload/:id/images` - Delete product image
- `DELETE /upload/:id/files/:fileId` - Delete product file
- `GET /upload/:id/download/:fileId` - Download product file

## Authentication

The API uses JWT (JSON Web Tokens) for authentication with two token types:

- **Access Token**: Short-lived (15 minutes), used for API requests
- **Refresh Token**: Long-lived (7 days), used to get new access tokens

### Using Authentication

1. Register or login to get tokens
2. Include access token in requests:
   \`\`\`
   Authorization: Bearer <access_token>
   \`\`\`
3. When access token expires, use refresh token to get a new one

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Authentication endpoints**: 5 requests per 15 minutes
- **Payment endpoints**: 10 requests per 15 minutes
- **General endpoints**: 100 requests per 15 minutes

## Error Handling

All errors follow this format:

\`\`\`json
{
  "success": false,
  "message": "Error message",
  "errors": [] // Optional validation errors
}
\`\`\`

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

## Testing

Run tests:

\`\`\`bash
npm test
\`\`\`

Run tests with coverage:

\`\`\`bash
npm run test:coverage
\`\`\`

## Deployment

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

Quick deployment options:
- Vercel
- Railway
- Render
- Heroku
- Docker

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment (development/production) | Yes |
| `PORT` | Server port | Yes |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_ACCESS_SECRET` | JWT access token secret | Yes |
| `JWT_REFRESH_SECRET` | JWT refresh token secret | Yes |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob storage token | Yes |
| `FLUTTERWAVE_PUBLIC_KEY` | Flutterwave public key | Yes |
| `FLUTTERWAVE_SECRET_KEY` | Flutterwave secret key | Yes |
| `FLUTTERWAVE_ENCRYPTION_KEY` | Flutterwave encryption key | Yes |
| `SMTP_HOST` | SMTP server host | Yes |
| `SMTP_PORT` | SMTP server port | Yes |
| `SMTP_USER` | SMTP username | Yes |
| `SMTP_PASS` | SMTP password | Yes |
| `EXPO_ACCESS_TOKEN` | Expo push notification token | No |

## Security Features

- JWT authentication with refresh tokens
- Password hashing with bcryptjs
- Rate limiting on sensitive endpoints
- CORS protection
- Helmet security headers
- XSS protection
- Input validation and sanitization
- SQL injection prevention (NoSQL)
- Secure file upload validation
- Email verification
- Password reset with tokens

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@digistore.com or open an issue on GitHub.

## Acknowledgments

- Express.js team for the excellent framework
- MongoDB team for the robust database
- Flutterwave for payment processing
- Vercel for blob storage
- All contributors and supporters

## Roadmap

- [ ] WebSocket support for real-time notifications
- [ ] Advanced analytics dashboard
- [ ] Multi-currency support
- [ ] Subscription-based products
- [ ] Affiliate program
- [ ] Product bundles
- [ ] Discount codes and promotions
- [ ] Advanced search with Elasticsearch
- [ ] GraphQL API
- [ ] Mobile app (React Native)

---

Built with ❤️ by the DigiStore Team
