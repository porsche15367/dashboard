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

// Vendor Types
export interface Vendor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  coverImageUrl?: string;
  isVerified: boolean;
  isApproved: boolean;
  businessName: string;
  businessDescription?: string;
  address?: string;
  taxId?: string;
  rating: number;
  totalSales: number;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  vendorCategory: VendorCategory;
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

// Category Types
export interface VendorCategory {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  coverImageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  imageUrl?: string;
  coverImageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  vendorId: string;
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
  vendorId: string;
  categoryId: string;
  vendor: {
    id: string;
    name: string;
    businessName: string;
  };
  category: {
    id: string;
    name: string;
    description?: string;
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
  vendorId: string;
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
  vendor: {
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
  vendorId: string;
  vendor: {
    id: string;
    name: string;
    businessName: string;
  };
}

// Analytics Types
export interface VendorAnalytics {
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
  vendors: Array<{
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
    vendor: {
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
  salesByVendorCategory: Array<{
    category: string;
    sales: number;
    revenue: number;
  }>;
  topVendors: Array<{
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
    vendor: {
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
export interface CreateVendorRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  coverImageUrl?: string;
  businessName: string;
  businessDescription?: string;
  address?: string;
  taxId?: string;
  vendorCategoryId: string;
}

export interface UpdateVendorRequest {
  name?: string;
  email?: string;
  phone?: string;
  coverImageUrl?: string;
  businessName?: string;
  businessDescription?: string;
  address?: string;
  taxId?: string;
  vendorCategoryId?: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
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
  vendorId: string;
}

export interface UpdateCouponRequest {
  code?: string;
  percentage?: number;
  isActive?: boolean;
  expiresAt?: string;
}

export interface CreateVendorCategoryRequest {
  name: string;
  description?: string;
  imageUrl?: string;
  coverImageUrl?: string;
}

export interface UpdateVendorCategoryRequest {
  name?: string;
  description?: string;
  imageUrl?: string;
  coverImageUrl?: string;
  isActive?: boolean;
}

export interface CreateProductCategoryRequest {
  name: string;
  description?: string;
  icon?: string;
  imageUrl?: string;
  coverImageUrl?: string;
  vendorId: string;
}

export interface UpdateProductCategoryRequest {
  name?: string;
  description?: string;
  icon?: string;
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
