import ApiService from './api';

export interface ProductFilter {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sort?: string;
}

/**
 * Product service for handling product-related API calls
 */
class ProductService {
  /**
   * Get all products with optional filtering
   * @param filters - Product filters
   * @returns Promise with products data
   */
  static async getProducts(filters: ProductFilter = {}) {
    return ApiService.get('/products', filters);
  }

  /**
   * Get product by ID
   * @param id - Product ID
   * @returns Promise with product data
   */
  static async getProductById(id: string) {
    return ApiService.get(`/products/${id}`);
  }

  /**
   * Get products by category
   * @param categoryId - Category ID
   * @param filters - Additional filters
   * @returns Promise with products data
   */
  static async getProductsByCategory(categoryId: string, filters: Omit<ProductFilter, 'category'> = {}) {
    return ApiService.get('/products', { ...filters, category: categoryId });
  }

  /**
   * Search products
   * @param query - Search query
   * @param filters - Additional filters
   * @returns Promise with products data
   */
  static async searchProducts(query: string, filters: Omit<ProductFilter, 'search'> = {}) {
    return ApiService.get('/products', { ...filters, search: query });
  }
}

export default ProductService;