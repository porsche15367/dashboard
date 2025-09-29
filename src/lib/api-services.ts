import api from "./api";
import {
  User,
  Vendor,
  Admin,
  Product,
  Order,
  Coupon,
  VendorCategory,
  ProductCategory,
  AdminAnalytics,
  VendorAnalytics,
  PaginatedResponse,
  CreateVendorRequest,
  UpdateVendorRequest,
  CreateUserRequest,
  UpdateUserRequest,
  CreateCouponRequest,
  UpdateCouponRequest,
  CreateVendorCategoryRequest,
  UpdateVendorCategoryRequest,
  CreateProductCategoryRequest,
  UpdateProductCategoryRequest,
} from "@/types";

// Auth Services
export const authService = {
  login: (credentials: { email: string; password: string; type: "admin" }) =>
    api.post("/auth/login", credentials),
  refresh: (refreshToken: string) =>
    api.post("/auth/refresh", { refreshToken }),
  logout: () => api.post("/auth/logout"),
};

// User Services
export const userService = {
  getAll: (page = 1, limit = 10) =>
    api.get<PaginatedResponse<User>>(
      `/users/admin/all?page=${page}&limit=${limit}`
    ),
  getById: (id: string) => api.get<User>(`/users/admin/${id}`),
  create: (data: CreateUserRequest) => api.post<User>("/users", data),
  update: (id: string, data: UpdateUserRequest) =>
    api.patch<User>(`/users/${id}`, data),
  suspend: (id: string, reason: string, duration?: string) =>
    api.put(`/users/admin/${id}/suspend`, { reason, duration }),
  unsuspend: (id: string) => api.put(`/users/admin/${id}/unsuspend`),
  block: (id: string, reason: string) =>
    api.put(`/users/admin/${id}/block`, { reason }),
  unblock: (id: string) => api.put(`/users/admin/${id}/unblock`),
  checkSuspensions: () => api.post("/users/admin/check-suspensions"),
};

// Vendor Services
export const vendorService = {
  getAll: () => api.get<Vendor[]>("/vendors"),
  getPublic: () => api.get<Vendor[]>("/vendors/public"),
  getUnapproved: (page = 1, limit = 10) =>
    api.get<PaginatedResponse<Vendor>>(
      `/vendors/unapproved?page=${page}&limit=${limit}`
    ),
  getById: (id: string) => api.get<Vendor>(`/vendors/${id}`),
  getProducts: (id: string, page = 1, limit = 10) =>
    api.get<PaginatedResponse<Product>>(
      `/vendors/${id}/products?page=${page}&limit=${limit}`
    ),
  create: (data: CreateVendorRequest) => api.post<Vendor>("/vendors", data),
  update: (id: string, data: UpdateVendorRequest) =>
    api.patch<Vendor>(`/vendors/${id}`, data),
  approve: (id: string) => api.put(`/vendors/${id}/approve`),
  reject: (id: string) => api.put(`/vendors/${id}/reject`),
  delete: (id: string) => api.delete(`/vendors/${id}`),
};

// Product Services
export const productService = {
  getAll: (
    page = 1,
    limit = 10,
    search?: string,
    category?: string,
    vendor?: string
  ) => {
    const offset = (page - 1) * limit;
    const params = new URLSearchParams({
      offset: offset.toString(),
      limit: limit.toString(),
      ...(search && { searchTerm: search }),
      ...(category && { categoryId: category }),
      ...(vendor && { vendorId: vendor }),
    });
    return api.get(`/products?${params}`).then((response) => {
      const backendData = response.data;
      const totalPages = Math.ceil(backendData.total / limit);

      const transformedData = {
        data: backendData.products || [],
        pagination: {
          page,
          limit: backendData.limit || limit,
          total: backendData.total || 0,
          totalPages,
        },
      };

      return {
        ...response,
        data: transformedData,
      };
    });
  },
  getById: (id: string) => api.get<Product>(`/products/${id}`),
  update: (id: string, data: Partial<Product>) =>
    api.patch<Product>(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
  toggleStatus: (id: string) => api.put(`/products/${id}/toggle`),
};

// Order Services
export const orderService = {
  getAll: (page = 1, limit = 10, status?: string, vendor?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status }),
      ...(vendor && { vendor }),
    });
    return api.get<PaginatedResponse<Order>>(`/orders?${params}`);
  },
  getById: (id: string) => api.get<Order>(`/orders/${id}`),
  updateStatus: (id: string, status: string) =>
    api.patch(`/orders/${id}/status`, { status }),
  cancel: (id: string, reason?: string) =>
    api.patch(`/orders/${id}/cancel`, { reason }),
};

// Coupon Services
export const couponService = {
  getAll: (page = 1, limit = 10, vendor?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(vendor && { vendor }),
    });
    return api.get<PaginatedResponse<Coupon>>(`/coupons?${params}`);
  },
  getById: (id: string) => api.get<Coupon>(`/coupons/${id}`),
  create: (data: CreateCouponRequest) => api.post<Coupon>("/coupons", data),
  update: (id: string, data: UpdateCouponRequest) =>
    api.patch<Coupon>(`/coupons/${id}`, data),
  delete: (id: string) => api.delete(`/coupons/${id}`),
  toggleStatus: (id: string) => api.put(`/coupons/${id}/toggle`),
  validate: (code: string) => api.post(`/coupons/validate`, { code }),
};

// Vendor Category Services
export const vendorCategoryService = {
  getAll: () => api.get<VendorCategory[]>("/vendor-categories"),
  getById: (id: string) => api.get<VendorCategory>(`/vendor-categories/${id}`),
  getByName: (name: string) =>
    api.get<VendorCategory>(`/vendor-categories/name/${name}`),
  getVendors: (id: string) =>
    api.get<Vendor[]>(`/vendor-categories/${id}/vendors`),
  create: (data: CreateVendorCategoryRequest) =>
    api.post<VendorCategory>("/vendor-categories", data),
  update: (id: string, data: UpdateVendorCategoryRequest) =>
    api.patch<VendorCategory>(`/vendor-categories/${id}`, data),
  delete: (id: string) => api.delete(`/vendor-categories/${id}`),
  toggleStatus: (id: string) => api.put(`/vendor-categories/${id}/toggle`),
};

// Product Category Services
export const productCategoryService = {
  getAll: (vendorId?: string) => {
    const params = vendorId ? `?vendorId=${vendorId}` : "";
    return api.get<ProductCategory[]>(`/categories${params}`);
  },
  getById: (id: string) => api.get<ProductCategory>(`/categories/${id}`),
  create: (data: CreateProductCategoryRequest) =>
    api.post<ProductCategory>("/categories", data),
  update: (id: string, data: UpdateProductCategoryRequest) =>
    api.patch<ProductCategory>(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
  toggleStatus: (id: string) => api.put(`/categories/${id}/toggle`),
};

// Analytics Services
export const analyticsService = {
  getAdminAnalytics: () =>
    api.get<AdminAnalytics>("/admin-analytics/dashboard"),
  getVendorAnalytics: (vendorId: string) =>
    api.get<VendorAnalytics>(
      `/vendor-analytics/dashboard?vendorId=${vendorId}`
    ),
  getVendors: () => api.get("/admin-analytics/vendors"),
  getVendorById: (id: string) => api.get(`/admin-analytics/vendors/${id}`),
  getGlobalSales: () => api.get("/admin-analytics/global-sales"),
  getMostSoldProducts: () => api.get("/admin-analytics/most-sold-products"),
  getSalesByCategory: () => api.get("/admin-analytics/sales-by-category"),
  getSalesByVendorCategory: () =>
    api.get("/admin-analytics/sales-by-vendor-category"),
  getTopVendors: () => api.get("/admin-analytics/top-vendors"),
  getRecentOrders: () => api.get("/admin-analytics/recent-orders"),
};
