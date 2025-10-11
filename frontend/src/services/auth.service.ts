import ApiService from './api';
import { setCookie, removeCookie } from '../utils/cookies';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  token: string;
}

/**
 * Authentication service
 */
class AuthService {
  /**
   * Login user
   * @param data - Login credentials
   * @returns Promise with user data and token
   */
  static async login(data: LoginData): Promise<AuthResponse> {
    const response = await ApiService.post('/auth/login', data);
    if (response.token) {
      setCookie('token', response.token);
    }
    return response;
  }

  /**
   * Register new user
   * @param data - Registration data
   * @returns Promise with user data and token
   */
  static async register(data: RegisterData): Promise<AuthResponse> {
    const response = await ApiService.post('/auth/register', data);
    if (response.token) {
      setCookie('token', response.token);
    }
    return response;
  }

  /**
   * Logout user
   */
  static logout(): void {
    removeCookie('token');
  }

  /**
   * Get current user profile
   * @returns Promise with user data
   */
  static async getCurrentUser() {
    return ApiService.get('/users/me');
  }
}

export default AuthService;