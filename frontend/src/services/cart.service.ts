import ApiService from './api';

export interface CartItem {
  product: string;
  quantity: number;
}

/**
 * Cart service for handling cart-related API calls
 */
class CartService {
  /**
   * Get user cart
   * @returns Promise with cart data
   */
  static async getCart() {
    return ApiService.get('/cart');
  }

  /**
   * Add item to cart
   * @param productId - Product ID
   * @param quantity - Quantity
   * @returns Promise with updated cart
   */
  static async addToCart(productId: string, quantity: number = 1) {
    return ApiService.post('/cart', { product: productId, quantity });
  }

  /**
   * Update cart item quantity
   * @param productId - Product ID
   * @param quantity - New quantity
   * @returns Promise with updated cart
   */
  static async updateCartItem(productId: string, quantity: number) {
    return ApiService.put(`/cart/${productId}`, { quantity });
  }

  /**
   * Remove item from cart
   * @param productId - Product ID
   * @returns Promise with updated cart
   */
  static async removeFromCart(productId: string) {
    return ApiService.delete(`/cart/${productId}`);
  }

  /**
   * Clear cart
   * @returns Promise with empty cart
   */
  static async clearCart() {
    return ApiService.delete('/cart');
  }
}

export default CartService;