// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  isVerified: boolean;
  isBlocked: boolean;
  isSuspended: boolean;
  suspendedUntil?: string;
  suspensionReason?: string;
  blockedAt?: string;
  blockedBy?: string;
  blockReason?: string;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

// Seller Types (formerly Vendor)
export interface Seller {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  coverImageUrl?: string;
  isVerified: boolean;
  status?: 'ONBOARDING_INCOMPLETE' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  businessName: string;
  businessDescription?: string;
  address?: string;
  taxId?: string;
  rating: number;
  totalSales: number;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  categories: Category[];
  coupons?: Coupon[];
}

// Admin Types
export interface Admin {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

// Category Types (Consolidated)
export interface Category {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  coverImageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  images: string[];
  isActive: boolean;
  isOnSale: boolean;
  salePrice?: number;
  saleStartDate?: string;
  saleEndDate?: string;
  deliveryTime?: number;
  salesCount: number;
  isFeatured?: boolean;
  featuredOrder?: number;
  featuredBy?: string;
  featuredAt?: string;
  createdAt: string;
  updatedAt: string;
  sellerId: string;
  categories: Array<{
    category: Category;
  }>;
  seller: {
    id: string;
    name: string;
    businessName: string;
  };
}

// Featured Product Types
export interface FeaturedProduct extends Product {
  isFeatured: true;
  featuredOrder: number;
  featuredBy: string;
  featuredAt: string;
}

export interface ReorderProductsRequest {
  productIds: string[];
}

// Order Types
export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  sellerId: string;
  status: OrderStatus;
  totalAmount: number;
  shippingCost: number;
  taxAmount: number;
  discountAmount: number;
  finalAmount: number;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod?: string;
  paymentStatus: PaymentStatus;
  paymentId?: string;
  notes?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  seller: {
    id: string;
    name: string;
    businessName: string;
  };
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productSnapshot: {
    name: string;
    price: number;
    image?: string;
  };
  product: Product;
}

export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  PROCESSING = "PROCESSING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  REFUNDED = "REFUNDED",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
  CANCELLED = "CANCELLED",
}

// Coupon Types
export interface Coupon {
  id: string;
  code: string;
  percentage: number;
  isActive: boolean;
  createdAt: string;
  expiresAt?: string;
  sellerId: string;
  seller: {
    id: string;
    name: string;
    businessName: string;
  };
}

// Analytics Types
export interface SellerAnalytics {
  products: Array<{
    id: string;
    name: string;
    salesCount: number;
    revenue: number;
  }>;
  categories: Array<{
    id: string;
    name: string;
    productCount: number;
  }>;
  orders: {
    today: number;
    thisMonth: number;
    total: number;
  };
  revenue: {
    today: number;
    thisMonth: number;
    total: number;
  };
  bestSellers: Array<{
    id: string;
    name: string;
    salesCount: number;
    revenue: number;
  }>;
}

export interface AdminAnalytics {
  sellers: Array<{
    id: string;
    name: string;
    businessName: string;
    totalSales: number;
    totalRevenue: number;
    productCount: number;
    orderCount: number;
  }>;
  globalSales: {
    today: number;
    thisMonth: number;
    total: number;
  };
  mostSoldProducts: Array<{
    id: string;
    name: string;
    salesCount: number;
    revenue: number;
    seller: {
      id: string;
      name: string;
      businessName: string;
    };
  }>;
  salesByCategory: Array<{
    category: string;
    sales: number;
    revenue: number;
  }>;
  salesBySellerCategory: Array<{
    category: string;
    sales: number;
    revenue: number;
  }>;
  topSellers: Array<{
    id: string;
    name: string;
    businessName: string;
    totalSales: number;
    totalRevenue: number;
  }>;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    totalAmount: number;
    status: OrderStatus;
    createdAt: string;
    user: {
      name: string;
    };
    seller: {
      name: string;
      businessName: string;
    };
  }>;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
  type: "admin";
}

export interface LoginResponse {
  user: Admin;
  access_token: string;
  refresh_token: string;
}

// Form Types
export interface CreateSellerRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  coverImageUrl?: string;
  businessName: string;
  businessDescription?: string;
  address?: string;
  taxId?: string;
  categoryIds: string[];
}

export interface UpdateSellerRequest {
  name?: string;
  email?: string;
  phone?: string;
  coverImageUrl?: string;
  businessName?: string;
  businessDescription?: string;
  address?: string;
  taxId?: string;
  categoryIds?: string[];
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  coverImageUrl?: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  phone?: string;
}

export interface CreateCouponRequest {
  code: string;
  percentage: number;
  expiresAt?: string;
  sellerId: string;
}

export interface UpdateCouponRequest {
  code?: string;
  percentage?: number;
  isActive?: boolean;
  expiresAt?: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  imageUrl?: string;
  coverImageUrl?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  imageUrl?: string;
  coverImageUrl?: string;
  isActive?: boolean;
}

// Popular Banner Types
export interface PopularBanner {
  id: string;
  imageUrl: string;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  linkUrl?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  admin?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CreatePopularBannerRequest {
  imageUrl?: string;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  linkUrl?: string;
  order?: number;
  isActive?: boolean;
}

export interface UpdatePopularBannerRequest {
  imageUrl?: string;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  linkUrl?: string;
  order?: number;
  isActive?: boolean;
}

export interface ReorderBannersRequest {
  bannerIds: string[];
}
