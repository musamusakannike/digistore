# Digistore API Documentation

## Base URL
\`\`\`
http://localhost:5000/api/v1
\`\`\`

## Authentication
All protected routes require a Bearer token in the Authorization header:
\`\`\`
Authorization: Bearer <your_jwt_token>
\`\`\`

## API Endpoints

### Authentication Routes (`/auth`)
- `POST /register` - Register a new user
- `POST /login` - Login user
- `POST /logout` - Logout user
- `POST /forgot-password` - Send password reset email
- `POST /reset-password/:token` - Reset password
- `POST /verify-email/:token` - Verify email address
- `POST /refresh-token` - Refresh access token

### User Routes (`/users`)
- `GET /profile` - Get user profile (Protected)
- `PUT /profile` - Update user profile (Protected)
- `PUT /change-password` - Change password (Protected)
- `POST /upload-avatar` - Upload profile picture (Protected)
- `PUT /bank-details` - Update bank details (Protected)
- `POST /push-token` - Register push notification token (Protected)

### File Routes (`/files`)
- `GET /` - Get all files (Public)
- `GET /search` - Search files (Public)
- `GET /:id` - Get single file (Public)
- `POST /upload` - Upload file (Protected)
- `PUT /:id` - Update file (Protected)
- `DELETE /:id` - Delete file (Protected)
- `GET /my-files` - Get user's files (Protected)
- `GET /:id/download` - Download file (Protected)
- `POST /:id/view` - Track file view (Public)

### Category Routes (`/categories`)
- `GET /` - Get all categories (Public)
- `POST /` - Create category (Admin)
- `PUT /:id` - Update category (Admin)
- `DELETE /:id` - Delete category (Admin)

### Review Routes (`/reviews`)
- `POST /` - Create review (Protected)
- `GET /file/:fileId` - Get file reviews (Public)
- `GET /my-reviews` - Get user reviews (Protected)
- `PUT /:id` - Update review (Protected)
- `DELETE /:id` - Delete review (Protected)

### Payment Routes (`/payments`)
- `POST /initialize` - Initialize payment (Protected)
- `POST /verify` - Verify payment (Protected)
- `POST /webhook` - Flutterwave webhook (Public)
- `GET /transactions` - Get user transactions (Protected)

### Analytics Routes (`/analytics`)
- `GET /platform` - Get platform analytics (Admin)
- `GET /seller` - Get seller analytics (Protected)

### Notification Routes (`/notifications`)
- `GET /` - Get user notifications (Protected)
- `PUT /:id/read` - Mark notification as read (Protected)
- `PUT /mark-all-read` - Mark all notifications as read (Protected)
- `PUT /preferences` - Update notification preferences (Protected)
- `POST /send-bulk` - Send bulk notifications (Admin)

### Admin Routes (`/admin`)
- `GET /dashboard` - Get admin dashboard (Admin)
- `GET /users` - Get all users (Admin)
- `PUT /users/:id/status` - Update user status (Admin)
- `GET /files/pending` - Get pending files (Admin)
- `PUT /files/:id/approve` - Approve file (Admin)
- `PUT /files/:id/reject` - Reject file (Admin)
- `GET /withdrawals` - Get withdrawal requests (Admin)
- `PUT /withdrawals/:id/approve` - Approve withdrawal (Admin)
- `PUT /withdrawals/:id/reject` - Reject withdrawal (Admin)

## Response Format
All API responses follow this format:
\`\`\`json
{
  "success": true|false,
  "message": "Response message",
  "data": {}, // Response data (if applicable)
  "errors": [] // Validation errors (if applicable)
}
\`\`\`

## Error Codes
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

## File Upload
Files are uploaded to AWS S3. Maximum file size: 100MB
Supported formats: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, ZIP, RAR, MP4, MP3, JPG, PNG

## Payment Integration
Uses Flutterwave v3 for payment processing. All amounts are in Nigerian Naira (NGN).

## Real-time Features
Socket.IO is used for real-time notifications and updates.

## Rate Limiting
API requests are limited to 100 requests per 15 minutes per IP address.
