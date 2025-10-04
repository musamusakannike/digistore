# API Usage Examples

This document provides practical examples of using the DigiStore API.

## Authentication Flow

### 1. Register a New User

\`\`\`javascript
const response = await fetch('https://api.digistore.com/api/v1/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'SecurePass123!',
  }),
})

const data = await response.json()
console.log(data)
// {
//   "success": true,
//   "message": "Registration successful. Please check your email to verify your account.",
//   "data": {
//     "user": { ... },
//     "accessToken": "eyJhbGc...",
//     "refreshToken": "eyJhbGc..."
//   }
// }
\`\`\`

### 2. Login

\`\`\`javascript
const response = await fetch('https://api.digistore.com/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'SecurePass123!',
  }),
})

const data = await response.json()
const { accessToken, refreshToken } = data.data

// Store tokens securely
localStorage.setItem('accessToken', accessToken)
localStorage.setItem('refreshToken', refreshToken)
\`\`\`

### 3. Refresh Access Token

\`\`\`javascript
const refreshToken = localStorage.getItem('refreshToken')

const response = await fetch('https://api.digistore.com/api/v1/auth/refresh', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ refreshToken }),
})

const data = await response.json()
localStorage.setItem('accessToken', data.data.accessToken)
\`\`\`

## Product Management

### 1. Create a Product (Seller)

\`\`\`javascript
const accessToken = localStorage.getItem('accessToken')

const response = await fetch('https://api.digistore.com/api/v1/products', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
  },
  body: JSON.stringify({
    title: 'Premium UI Kit',
    description: 'Complete UI kit for modern web applications',
    price: 49.99,
    category: '507f1f77bcf86cd799439011',
    tags: ['ui', 'design', 'figma'],
    features: [
      '100+ components',
      'Dark mode support',
      'Fully responsive',
      'Figma source files',
    ],
  }),
})

const data = await response.json()
const productId = data.data._id
\`\`\`

### 2. Upload Product Images

\`\`\`javascript
const formData = new FormData()
formData.append('images', imageFile1)
formData.append('images', imageFile2)

const response = await fetch(`https://api.digistore.com/api/v1/upload/${productId}/images`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
  body: formData,
})

const data = await response.json()
console.log(data.data.images) // Array of uploaded image URLs
\`\`\`

### 3. Upload Product Files

\`\`\`javascript
const formData = new FormData()
formData.append('files', zipFile)

const response = await fetch(`https://api.digistore.com/api/v1/upload/${productId}/files`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
  body: formData,
})

const data = await response.json()
console.log(data.data.files) // Array of uploaded files
\`\`\`

### 4. Submit Product for Review

\`\`\`javascript
const response = await fetch(`https://api.digistore.com/api/v1/products/${productId}/submit`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
})

const data = await response.json()
console.log(data.message) // "Product submitted for review"
\`\`\`

### 5. Get Products with Filters

\`\`\`javascript
const params = new URLSearchParams({
  page: '1',
  limit: '20',
  category: 'design',
  minPrice: '10',
  maxPrice: '100',
  search: 'ui kit',
  sort: '-createdAt',
})

const response = await fetch(`https://api.digistore.com/api/v1/products?${params}`)
const data = await response.json()

console.log(data.data.products) // Array of products
console.log(data.data.pagination) // Pagination info
\`\`\`

## Shopping Cart

### 1. Add to Cart

\`\`\`javascript
const response = await fetch('https://api.digistore.com/api/v1/cart/items', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
  },
  body: JSON.stringify({
    productId: '507f1f77bcf86cd799439011',
    quantity: 1,
  }),
})

const data = await response.json()
console.log(data.data.cart)
\`\`\`

### 2. Get Cart

\`\`\`javascript
const response = await fetch('https://api.digistore.com/api/v1/cart', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
})

const data = await response.json()
const cart = data.data

console.log(`Total items: ${cart.totalItems}`)
console.log(`Total price: $${cart.totalPrice}`)
\`\`\`

### 3. Update Cart Item

\`\`\`javascript
const response = await fetch(`https://api.digistore.com/api/v1/cart/items/${productId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
  },
  body: JSON.stringify({
    quantity: 2,
  }),
})
\`\`\`

### 4. Remove from Cart

\`\`\`javascript
const response = await fetch(`https://api.digistore.com/api/v1/cart/items/${productId}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
})
\`\`\`

## Order and Payment Flow

### 1. Create Order from Cart

\`\`\`javascript
const response = await fetch('https://api.digistore.com/api/v1/orders', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
  },
  body: JSON.stringify({
    paymentMethod: 'flutterwave',
  }),
})

const data = await response.json()
const orderId = data.data._id
\`\`\`

### 2. Initialize Payment

\`\`\`javascript
const response = await fetch('https://api.digistore.com/api/v1/payments/initialize', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
  },
  body: JSON.stringify({
    orderId: orderId,
  }),
})

const data = await response.json()
const paymentLink = data.data.paymentLink

// Redirect user to payment page
window.location.href = paymentLink
\`\`\`

### 3. Verify Payment (After Redirect)

\`\`\`javascript
// Get reference from URL query params
const urlParams = new URLSearchParams(window.location.search)
const reference = urlParams.get('tx_ref')

const response = await fetch(`https://api.digistore.com/api/v1/payments/verify/${reference}`, {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
})

const data = await response.json()

if (data.data.status === 'successful') {
  console.log('Payment successful!')
  console.log('Download links:', data.data.downloadLinks)
}
\`\`\`

### 4. Create Direct Order (Buy Now)

\`\`\`javascript
const response = await fetch('https://api.digistore.com/api/v1/orders/direct', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
  },
  body: JSON.stringify({
    productId: '507f1f77bcf86cd799439011',
    quantity: 1,
    paymentMethod: 'flutterwave',
  }),
})

const data = await response.json()
const orderId = data.data._id

// Then initialize payment as shown above
\`\`\`

## Reviews and Ratings

### 1. Check if Can Review

\`\`\`javascript
const response = await fetch(`https://api.digistore.com/api/v1/reviews/can-review/${productId}`, {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
})

const data = await response.json()

if (data.data.canReview) {
  // Show review form
}
\`\`\`

### 2. Create Review

\`\`\`javascript
const response = await fetch('https://api.digistore.com/api/v1/reviews', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
  },
  body: JSON.stringify({
    product: productId,
    rating: 5,
    comment: 'Excellent product! Highly recommended.',
  }),
})

const data = await response.json()
\`\`\`

### 3. Get Product Reviews

\`\`\`javascript
const response = await fetch(`https://api.digistore.com/api/v1/reviews/product/${productId}?page=1&limit=10`)
const data = await response.json()

data.data.reviews.forEach(review => {
  console.log(`${review.user.name}: ${review.rating}/5`)
  console.log(review.comment)
})
\`\`\`

### 4. Mark Review as Helpful

\`\`\`javascript
const response = await fetch(`https://api.digistore.com/api/v1/reviews/${reviewId}/helpful`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
})
\`\`\`

### 5. Respond to Review (Seller)

\`\`\`javascript
const response = await fetch(`https://api.digistore.com/api/v1/reviews/${reviewId}/respond`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
  },
  body: JSON.stringify({
    response: 'Thank you for your feedback! We appreciate your support.',
  }),
})
\`\`\`

## Notifications

### 1. Get Notifications

\`\`\`javascript
const response = await fetch('https://api.digistore.com/api/v1/notifications?page=1&limit=20', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
})

const data = await response.json()

data.data.notifications.forEach(notification => {
  console.log(`[${notification.type}] ${notification.title}`)
  console.log(notification.message)
})
\`\`\`

### 2. Get Unread Count

\`\`\`javascript
const response = await fetch('https://api.digistore.com/api/v1/notifications/unread-count', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
})

const data = await response.json()
console.log(`Unread notifications: ${data.data.count}`)
\`\`\`

### 3. Mark as Read

\`\`\`javascript
const response = await fetch(`https://api.digistore.com/api/v1/notifications/${notificationId}/read`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
})
\`\`\`

### 4. Mark All as Read

\`\`\`javascript
const response = await fetch('https://api.digistore.com/api/v1/notifications/read-all', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
})
\`\`\`

## Analytics

### 1. Get Seller Analytics

\`\`\`javascript
const response = await fetch('https://api.digistore.com/api/v1/analytics/seller?period=30d', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
})

const data = await response.json()

console.log('Total Revenue:', data.data.stats.totalRevenue)
console.log('Total Sales:', data.data.stats.totalSales)
console.log('Order Count:', data.data.stats.orderCount)

// Sales over time
data.data.salesOverTime.forEach(day => {
  console.log(`${day._id}: ${day.sales} sales, $${day.revenue}`)
})

// Top products
data.data.topProducts.forEach(product => {
  console.log(`${product.title}: ${product.sales} sales, $${product.revenue}`)
})
\`\`\`

### 2. Get Buyer Analytics

\`\`\`javascript
const response = await fetch('https://api.digistore.com/api/v1/analytics/buyer', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
})

const data = await response.json()

console.log('Total Orders:', data.data.totalOrders)
console.log('Completed Orders:', data.data.completedOrders)
console.log('Total Spent:', data.data.totalSpent)
\`\`\`

## Admin Operations

### 1. Get Dashboard Stats

\`\`\`javascript
const response = await fetch('https://api.digistore.com/api/v1/admin/stats', {
  headers: {
    'Authorization': `Bearer ${adminToken}`,
  },
})

const data = await response.json()

console.log('Total Users:', data.data.totalUsers)
console.log('Total Products:', data.data.totalProducts)
console.log('Total Revenue:', data.data.totalRevenue)
console.log('Pending Products:', data.data.pendingProducts)
\`\`\`

### 2. Approve Product

\`\`\`javascript
const response = await fetch(`https://api.digistore.com/api/v1/admin/products/${productId}/approve`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${adminToken}`,
  },
})
\`\`\`

### 3. Suspend User

\`\`\`javascript
const response = await fetch(`https://api.digistore.com/api/v1/admin/users/${userId}/status`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`,
  },
  body: JSON.stringify({
    status: 'suspended',
    reason: 'Violation of terms of service',
  }),
})
\`\`\`

## Error Handling

\`\`\`javascript
async function apiCall(url, options) {
  try {
    const response = await fetch(url, options)
    const data = await response.json()

    if (!response.ok) {
      // Handle API errors
      if (response.status === 401) {
        // Token expired, refresh it
        await refreshAccessToken()
        // Retry the request
        return apiCall(url, options)
      }

      throw new Error(data.message || 'API request failed')
    }

    return data
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}
\`\`\`

## Rate Limit Handling

\`\`\`javascript
async function apiCallWithRetry(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options)

      if (response.status === 429) {
        // Rate limited, wait and retry
        const retryAfter = response.headers.get('Retry-After') || 60
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000))
        continue
      }

      return await response.json()
    } catch (error) {
      if (i === maxRetries - 1) throw error
    }
  }
}
\`\`\`

## WebSocket for Real-time Notifications (Future Enhancement)

\`\`\`javascript
const ws = new WebSocket('wss://api.digistore.com/ws')

ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'auth',
    token: accessToken,
  }))
}

ws.onmessage = (event) => {
  const notification = JSON.parse(event.data)
  console.log('New notification:', notification)
  // Update UI
}
