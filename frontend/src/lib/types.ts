export type Product = {
  _id: string;
  title: string;
  description?: string;
  shortDescription?: string;
  price: number;
  discountPrice?: number;
  slug?: string;
  images?: string[];
  thumbnail?: string;
  files?: ProductFile[];
  seller?: {
    _id: string;
    name?: string;
    firstName?: string;
    lastName?: string;
  };
  rating?: number;
  reviewsCount?: number;
  category?: string | { _id: string; name: string; slug?: string };
  tags?: string[];
  isActive?: boolean;
  status?: "draft" | "pending_review" | "approved" | "rejected";
};

export type Paginated<T> = {
  products?: T[];
  items?: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

// Auth & User
export type User = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: "buyer" | "seller" | "admin";
  verified?: boolean;
  isEmailVerified?: boolean;
  isActive?: boolean;
  isSuspended?: boolean;
  avatar?: string;
};

export type UserAuth = {
  user: User;
  accessToken: string;
  refreshToken: string;
};

// Cart
export type CartItem = {
  product: Product | string;
  quantity: number;
  price: number;
};

export type Cart = {
  cart: {
    items: CartItem[];
    totalItems: number;
    totalPrice: number;
  };
  summary: {
    itemCount: number;
    subtotal: number;
    tax: number;
    total: number;
  };
};

// Orders & Payments
export type Order = {
  _id: string;
  items: CartItem[];
  status: "pending" | "processing" | "completed" | "cancelled" | "refunded";
  totalAmount: number;
  createdAt?: string;
};

export type Transaction = {
  _id: string;
  reference: string;
  status: "pending" | "successful" | "failed" | "refunded";
  amount: number;
  createdAt?: string;
};

export type Review = {
  _id: string;
  product: string | Product;
  user:
    | { _id: string; firstName?: string; lastName?: string; name?: string }
    | string;
  rating: number;
  comment?: string;
  helpfulCount?: number;
  createdAt?: string;
};

export type Notification = {
  _id: string;
  type: "order" | "payment" | "product" | "review" | "system" | "promotion";
  title: string;
  message: string;
  read: boolean;
  createdAt?: string;
};

// Catalog
export type Category = {
  _id: string;
  name: string;
  slug: string;
};

export type ProductFile = {
  _id: string;
  name: string;
  size: number;
  url: string;
};
