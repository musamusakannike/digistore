import { apiFetch } from './api';
import type { Paginated, Product, Cart, Order, Transaction, UserAuth, Review } from './types';
import type { User, Notification, Category } from './types';

// Auth
export async function authRegister(input: { firstName: string; lastName: string; email: string; password: string; role?: 'buyer' | 'seller' }) {
  return apiFetch<UserAuth>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function authLogin(input: { email: string; password: string }) {
  return apiFetch<UserAuth>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

// Products
export async function fetchProducts(params: Record<string, string | number | undefined> = {}) {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v).length) usp.set(k, String(v));
  });
  const qs = usp.toString();
  return apiFetch<{ products: Product[]; pagination: Paginated<Product>['pagination'] }>(`/products${qs ? `?${qs}` : ''}`);
}

export async function fetchProductBySlug(slug: string) {
  return apiFetch<Product>(`/products/slug/${slug}`);
}

export async function fetchProduct(id: string) {
  return apiFetch<Product>(`/products/${id}`);
}

export async function fetchRelatedProducts(id: string) {
  return apiFetch<{ products: Product[] }>(`/products/${id}/related`);
}

// Seller products
export async function getSellerProducts() {
  return apiFetch<Product[]>(`/products/seller/my-products`, { auth: true });
}
export async function createProductApi(input: {
  title: string;
  description: string;
  shortDescription: string;
  category: string; // category ID
  price: number;
  discountPrice?: number;
  tags?: string[];
}) {
  return apiFetch<Product>(`/products`, { method: 'POST', body: JSON.stringify(input), auth: true });
}
export async function updateProductApi(id: string, input: Partial<{
  title: string;
  description: string;
  shortDescription: string;
  category: string; // category ID
  price: number;
  discountPrice?: number;
  tags?: string[];
  isActive?: boolean;
}>) {
  return apiFetch<Product>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(input), auth: true });
}
export async function deleteProductApi(id: string) {
  return apiFetch<{ success: true }>(`/products/${id}`, { method: 'DELETE', auth: true });
}
export async function submitProductApi(id: string) {
  return apiFetch<{ success: true }>(`/products/${id}/submit`, { method: 'POST', auth: true });
}

// Cart
export async function getCart() {
  return apiFetch<Cart>('/cart', { auth: true });
}
export async function addToCart(input: { productId: string; quantity: number }) {
  return apiFetch<Cart>('/cart/items', { method: 'POST', body: JSON.stringify(input), auth: true });
}
export async function updateCartItem(productId: string, quantity: number) {
  return apiFetch<Cart>(`/cart/items/${productId}`, { method: 'PUT', body: JSON.stringify({ quantity }), auth: true });
}
export async function removeFromCart(productId: string) {
  return apiFetch<Cart>(`/cart/items/${productId}`, { method: 'DELETE', auth: true });
}
export async function clearCart() {
  return apiFetch<Cart>('/cart', { method: 'DELETE', auth: true });
}

// Orders & Payments
export async function createDirectOrder(input: { productId: string; quantity: number; paymentMethod: string }) {
  return apiFetch<Order>('/orders/direct', { method: 'POST', body: JSON.stringify(input), auth: true });
}
export async function createOrder(input: { paymentMethod: string }) {
  return apiFetch<Order>('/orders', { method: 'POST', body: JSON.stringify(input), auth: true });
}
export async function initializePayment(orderId: string) {
  return apiFetch<{ paymentLink: string }>('/payments/initialize', { method: 'POST', body: JSON.stringify({ orderId }), auth: true });
}
export async function verifyPayment(reference: string) {
  return apiFetch<{ status: string; downloadLinks?: string[] }>(`/payments/verify/${reference}`, { auth: true });
}

export async function getUserOrders() {
  return apiFetch<Order[]>('/orders', { auth: true });
}
export async function getUserTransactions() {
  return apiFetch<Transaction[]>('/payments/transactions', { auth: true });
}

// Reviews
export async function getProductReviews(productId: string, params?: { page?: number; limit?: number }) {
  const usp = new URLSearchParams();
  if (params?.page) usp.set('page', String(params.page));
  if (params?.limit) usp.set('limit', String(params.limit));
  const qs = usp.toString();
  return apiFetch<{ reviews: Review[]; pagination?: Paginated<Review>['pagination'] }>(`/reviews/product/${productId}${qs ? `?${qs}` : ''}`);
}
export async function canReview(productId: string) {
  return apiFetch<{ canReview: boolean }>(`/reviews/can-review/${productId}`, { auth: true });
}
export async function createReviewApi(input: { product: string; rating: number; comment?: string }) {
  return apiFetch<Review>('/reviews', { method: 'POST', body: JSON.stringify(input), auth: true });
}
export async function updateReviewApi(id: string, input: { rating: number; comment?: string }) {
  return apiFetch<Review>(`/reviews/${id}`, { method: 'PUT', body: JSON.stringify(input), auth: true });
}
export async function deleteReviewApi(id: string) {
  return apiFetch<{ success: true }>(`/reviews/${id}`, { method: 'DELETE', auth: true });
}
export async function markHelpfulApi(id: string) {
  return apiFetch<{ success: true }>(`/reviews/${id}/helpful`, { method: 'POST', auth: true });
}
export async function removeHelpfulApi(id: string) {
  return apiFetch<{ success: true }>(`/reviews/${id}/helpful`, { method: 'DELETE', auth: true });
}

// Users
export async function getProfile() {
  const response = await apiFetch<{ user: User }>(`/users/profile`, { auth: true });
  return response.user;
}
export async function updateProfile(input: { firstName?: string; lastName?: string; phone?: string; bio?: string; businessName?: string; businessDescription?: string }) {
  return apiFetch<User>('/users/profile', { method: 'PUT', body: JSON.stringify(input), auth: true });
}
export async function uploadAvatarFile(file: File) {
  const fd = new FormData();
  fd.append('avatar', file);
  return apiFetch<User>('/users/avatar', { method: 'POST', body: fd, auth: true });
}
export async function changePasswordApi(input: { currentPassword: string; newPassword: string }) {
  return apiFetch<{ success: true }>(
    '/users/password',
    { method: 'PUT', body: JSON.stringify({ currentPassword: input.currentPassword, password: input.newPassword }), auth: true }
  );
}

// Notifications
export async function getNotifications(params?: { page?: number; limit?: number }) {
  const usp = new URLSearchParams();
  if (params?.page) usp.set('page', String(params.page));
  if (params?.limit) usp.set('limit', String(params.limit));
  const qs = usp.toString();
  return apiFetch<{ notifications: Notification[]; pagination?: Paginated<Notification>['pagination'] }>(`/notifications${qs ? `?${qs}` : ''}`, { auth: true });
}
export async function getUnreadCount() {
  return apiFetch<{ count: number }>(`/notifications/unread-count`, { auth: true });
}
export async function markNotificationRead(id: string) {
  return apiFetch<{ success: true }>(`/notifications/${id}/read`, { method: 'PUT', auth: true });
}
export async function markAllNotificationsRead() {
  return apiFetch<{ success: true }>(`/notifications/read-all`, { method: 'PUT', auth: true });
}
export async function deleteNotificationApi(id: string) {
  return apiFetch<{ success: true }>(`/notifications/${id}`, { method: 'DELETE', auth: true });
}
export async function deleteAllReadNotifications() {
  return apiFetch<{ success: true }>(`/notifications/read/all`, { method: 'DELETE', auth: true });
}

// Categories
export async function fetchCategories() {
  return apiFetch<{ categories: Category[] }>(`/categories`);
}

// Uploads
export async function uploadThumbnailApi(productId: string, file: File) {
  const fd = new FormData();
  fd.append('thumbnail', file);
  return apiFetch<Product>(`/upload/${productId}/thumbnail`, { method: 'POST', body: fd, auth: true });
}
export async function uploadImagesApi(productId: string, files: File[]) {
  const fd = new FormData();
  files.forEach(f => fd.append('images', f));
  return apiFetch<Product>(`/upload/${productId}/images`, { method: 'POST', body: fd, auth: true });
}
export async function deleteImageApi(productId: string, url: string) {
  // Assuming API accepts image url as query parameter
  const q = new URLSearchParams({ url }).toString();
  return apiFetch<Product>(`/upload/${productId}/images?${q}`, { method: 'DELETE', auth: true });
}
export async function uploadProductFilesApi(productId: string, files: File[]) {
  const fd = new FormData();
  files.forEach(f => fd.append('files', f));
  return apiFetch<Product>(`/upload/${productId}/files`, { method: 'POST', body: fd, auth: true });
}
export async function deleteProductFileApi(productId: string, fileId: string) {
  return apiFetch<Product>(`/upload/${productId}/files/${fileId}`, { method: 'DELETE', auth: true });
}

// Become Seller & Bank Details
export async function becomeSeller(input: {
  businessName: string;
  businessDescription: string;
  bankDetails: { bankName: string; accountNumber: string; accountName: string };
}) {
  return apiFetch<User>('/users/become-seller', { method: 'POST', body: JSON.stringify(input), auth: true });
}
export async function updateBankDetails(input: { bankName: string; accountNumber: string; accountName: string }) {
  return apiFetch<User>('/users/bank-details', { method: 'PUT', body: JSON.stringify(input), auth: true });
}

// Email verification
export async function verifyEmailToken(token: string) {
  return apiFetch<{ success: boolean; message?: string }>(`/auth/verify-email/${encodeURIComponent(token)}`);
}
export async function resendVerification() {
  return apiFetch<{ success: boolean }>(`/auth/resend-verification`, { method: 'POST', auth: true });
}

// Analytics
export type SellerAnalytics = {
  totalOrders?: number;
  totalRevenue?: number;
  totalProducts?: number;
  topProducts?: Array<{ product: Product; sales?: number; revenue?: number }>;
  recentOrders?: Array<{ id: string; amount: number; createdAt?: string }>;
};
export async function getSellerAnalytics() {
  return apiFetch<SellerAnalytics>(`/analytics/seller`, { auth: true });
}
