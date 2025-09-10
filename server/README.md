# Digistore Backend

A comprehensive backend API for a digital marketplace where Nigerian students can buy and sell digital files.

## Features

- **User Authentication & Authorization** - JWT-based auth with role-based access control
- **File Management** - Upload, download, and manage digital files with AWS S3 integration
- **Payment Processing** - Flutterwave integration for secure payments
- **Commission System** - Automated commission calculation and tracking
- **Real-time Notifications** - Socket.IO for real-time updates
- **Push Notifications** - Expo SDK for mobile push notifications
- **Email Notifications** - Nodemailer for transactional emails
- **Admin Dashboard** - Comprehensive admin controls and analytics

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcryptjs
- **File Storage**: AWS S3
- **Payments**: Flutterwave v3
- **Real-time**: Socket.IO
- **Push Notifications**: Expo Server SDK
- **Email**: Nodemailer

## Installation

1. Clone the repository
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Copy environment variables:
   \`\`\`bash
   cp .env.example .env
   \`\`\`

4. Configure your environment variables in `.env`

5. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

## Environment Variables

See `.env.example` for all required environment variables.

## API Documentation

The API follows RESTful conventions with the following base URL structure:
\`\`\`
/api/v1/{resource}
\`\`\`

### Authentication Endpoints
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password

### User Endpoints
- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update user profile
- `GET /api/v1/users/earnings` - Get user earnings
- `POST /api/v1/users/withdraw` - Request withdrawal

### File Endpoints
- `POST /api/v1/files/upload` - Upload a file
- `GET /api/v1/files` - Get user's files
- `GET /api/v1/files/:id` - Get file details
- `PUT /api/v1/files/:id` - Update file
- `DELETE /api/v1/files/:id` - Delete file
- `POST /api/v1/files/:id/purchase` - Purchase a file

### Payment Endpoints
- `POST /api/v1/payments/initialize` - Initialize payment
- `POST /api/v1/payments/verify` - Verify payment
- `POST /api/v1/payments/webhook` - Flutterwave webhook

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run seed` - Seed database with sample data

## License

MIT
