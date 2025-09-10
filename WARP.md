# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Digistore is a comprehensive backend API for a digital marketplace where Nigerian students can buy and sell digital files. The project is built with Node.js/Express.js, MongoDB, and integrates with AWS S3, Flutterwave payments, and Socket.IO for real-time features.

## Development Commands

### Core Commands
```bash
# Install dependencies
npm install

# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Run tests
npm test

# Set up environment
cp server/.env.example server/.env
```

### Working Directory
All development work should be done in the `server/` directory. The project root contains only the server implementation.

## Architecture Overview

### MVC Structure
The codebase follows a clean MVC architecture:

- **Models** (`/models/`): Mongoose schemas for User, File, Transaction, etc.
- **Controllers** (`/controllers/`): Business logic handlers for each entity
- **Routes** (`/routes/`): Express route definitions with middleware
- **Middleware** (`/middleware/`): Authentication, error handling, validation
- **Utils** (`/utils/`): Reusable utility functions for payments, file handling, etc.

### Key Architectural Patterns

**Authentication Flow**: JWT-based auth with refresh tokens. All protected routes use the `auth.js` middleware.

**File Management**: Files uploaded to AWS S3 with private access. Download URLs are generated via signed URLs with 1-hour expiration.

**Payment Integration**: Flutterwave v3 API with webhook verification. Commission system automatically calculates platform fees.

**Real-time Features**: Socket.IO with JWT authentication. Users join personal rooms for notifications.

### Database Schema Design

**User Model**: Comprehensive user profile with earnings tracking, bank details, notification preferences, and role-based access.

**File Model**: Rich metadata including S3 storage details, approval workflow, analytics tracking, and SEO fields.

**Relationship Patterns**: 
- Files reference Users (seller)
- Transactions link Files and Users (buyer/seller)  
- Reviews connect Users to Files they purchased

## API Structure

Base URL: `/api/v1`

**Route Organization**:
- `/auth` - Authentication endpoints
- `/users` - User profile management
- `/files` - File upload/management/download
- `/payments` - Flutterwave payment processing
- `/admin` - Administrative functions
- `/notifications` - Real-time notifications

**Response Format**: All APIs return standardized JSON with `success`, `message`, `data`, and `errors` fields.

## Environment Configuration

Copy `server/.env.example` to `server/.env` and configure:

**Required Services**:
- MongoDB connection string
- AWS S3 credentials and bucket
- Flutterwave API keys
- JWT secrets
- Email SMTP settings

**Key Settings**:
- `PLATFORM_COMMISSION_RATE`: Commission percentage (default 5%)
- `MAX_FILE_SIZE`: File upload limit (default 100MB)
- `ALLOWED_FILE_TYPES`: Comma-separated allowed extensions

## File Upload System

**Supported Formats**: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, ZIP, RAR, images, audio, video

**Upload Flow**:
1. File validation (type, size, name)
2. Upload to S3 with private ACL
3. Generate thumbnail for supported formats
4. Store metadata in MongoDB
5. Admin approval workflow

**Security**: Files are stored privately in S3. Downloads require authentication and generate temporary signed URLs.

## Payment Integration

**Flutterwave Integration**:
- Initialize payments with user/file metadata
- Webhook verification for payment completion
- Commission calculation and earnings tracking
- Bank transfer support for withdrawals

**Commission System**: Platform takes configurable percentage. Seller earnings are tracked with pending/available/withdrawn states.

## Real-time Features

**Socket.IO Implementation**:
- JWT-based socket authentication
- User-specific notification rooms
- Admin broadcast capabilities
- Online status tracking
- File upload progress (future enhancement)

**Notification System**: Push notifications via Expo SDK, email notifications via Nodemailer, and real-time web notifications.

## Testing Approach

**Test Structure**: Uses Jest with Supertest for API testing. Tests should follow the pattern in existing test files.

**Running Tests**: `npm test` from the server directory.

## Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: Express-validator for all endpoints
- **File Security**: Private S3 storage with signed URL access
- **Authentication**: JWT with refresh token rotation
- **CORS**: Configured for specific frontend origins
- **Helmet**: Security headers middleware

## Development Patterns

**Error Handling**: Centralized error middleware with standardized error responses.

**Validation**: Use express-validator for input validation in route files.

**Database Operations**: Use Mongoose with proper indexing and virtual fields.

**File Operations**: Always use utility functions in `/utils/s3Upload.js` for S3 operations.

**Payment Processing**: Use `/utils/flutterwave.js` utilities for all payment operations.

## Common Development Tasks

**Adding New Routes**:
1. Create controller in `/controllers/`
2. Add route definition in `/routes/`
3. Apply appropriate middleware (auth, validation)
4. Update API documentation

**File Upload Features**:
- Use multer middleware for file handling
- Validate files with `/utils/fileValidation.js`
- Upload to S3 with `/utils/s3Upload.js`
- Generate thumbnails for supported formats

**Payment Features**:
- Initialize payments with proper metadata
- Handle webhooks for completion
- Update user earnings and transaction records
- Send appropriate notifications

**Real-time Features**:
- Emit events to user-specific rooms
- Use helper functions on io instance
- Handle socket authentication properly

## Database Indexes

Critical indexes are defined in models:
- User: email, university/faculty/department combinations
- File: seller, category, status, search text indexes  
- Transaction: buyer, file, payment status
