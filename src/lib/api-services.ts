import api from "./api";
import {
  User,
  Seller,
  Admin,
  Product,
  Order,
  Coupon,
  Category,
  AdminAnalytics,
  SellerAnalytics,
  FeaturedProduct,
  ReorderProductsRequest,
  PaginatedResponse,
  CreateSellerRequest,
  UpdateSellerRequest,
  CreateUserRequest,
  UpdateUserRequest,
  CreateCouponRequest,
  UpdateCouponRequest,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  PopularBanner,
  CreatePopularBannerRequest,
  UpdatePopularBannerRequest,
  ReorderBannersRequest,
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

// Seller Services (formerly Vendor)
export const sellerService = {
  getAll: () => api.get<Seller[]>("/sellers"),
  getPublic: () => api.get<Seller[]>("/sellers/public"),
  getUnapproved: (page = 1, limit = 10) =>
    api
      .get<any>(`/sellers/unapproved?page=${page}&limit=${limit}`)
      .then((response) => ({
        ...response,
        data: {
          data: response.data.vendors,
          pagination: response.data.pagination,
        },
      })),
  getById: (id: string) => api.get<Seller>(`/sellers/${id}`),
  getProducts: (id: string, page = 1, limit = 10) =>
    api
      .get<any>(`/sellers/${id}/products?page=${page}&limit=${limit}`)
      .then((response) => ({
        ...response,
        data: {
          data: response.data.products,
          pagination: response.data.pagination,
        },
      })),
  create: (data: CreateSellerRequest) => api.post<Seller>("/sellers", data),
  update: (id: string, data: UpdateSellerRequest) =>
    api.patch<Seller>(`/sellers/${id}`, data),
  approve: (id: string) => api.put(`/sellers/${id}/approve`),
  reject: (id: string) => api.put(`/sellers/${id}/reject`),
  delete: (id: string) => api.delete(`/sellers/${id}`),
};

// Product Services
export const productService = {
  getAll: (
    page = 1,
    limit = 10,
    search?: string,
    categoryId?: string,
    sellerId?: string
  ) => {
    const offset = (page - 1) * limit;
    const params = new URLSearchParams({
      offset: offset.toString(),
      limit: limit.toString(),
      ...(search && { searchTerm: search }),
      ...(categoryId && { categoryId }),
      ...(sellerId && { sellerId }),
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
  getAll: (page = 1, limit = 10, status?: string, sellerId?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status }),
      ...(sellerId && { sellerId }),
    });
    return api.get<any>(`/orders?${params}`).then((response) => ({
      ...response,
      data: {
        data: response.data.orders,
        pagination: response.data.pagination,
      },
    }));
  },
  getById: (id: string) => api.get<Order>(`/orders/${id}`),
  updateStatus: (id: string, status: string) =>
    api.patch(`/orders/${id}/status`, { status }),
  cancel: (id: string, reason?: string) =>
    api.patch(`/orders/${id}/cancel`, { reason }),
};

// Coupon Services
export const couponService = {
  getAll: (page = 1, limit = 10, sellerId?: string) => {
    const params = new URLSearchParams({
      ...(sellerId && { sellerId }),
    });
    return api.get<Coupon[]>(`/coupons?${params}`).then((response) => {
      const allCoupons = response.data;
      const total = allCoupons.length;
      const totalPages = Math.ceil(total / limit);
      const offset = (page - 1) * limit;
      const paginatedCoupons = allCoupons.slice(offset, offset + limit);

      return {
        ...response,
        data: {
          data: paginatedCoupons,
          pagination: {
            total,
            page,
            limit,
            totalPages,
          },
        },
      };
    });
  },
  getById: (id: string) => api.get<Coupon>(`/coupons/${id}`),
  create: (data: CreateCouponRequest) => api.post<Coupon>("/coupons", data),
  update: (id: string, data: UpdateCouponRequest) =>
    api.patch<Coupon>(`/coupons/${id}`, data),
  delete: (id: string) => api.delete(`/coupons/${id}`),
  toggleStatus: (id: string) => api.put(`/coupons/${id}/toggle`),
  validate: (code: string) => api.post(`/coupons/validate`, { code }),
};

// Category Services (Consolidated)
export const categoryService = {
  getAll: () => {
    return api.get<Category[]>("/categories");
  },
  getById: (id: string) => api.get<Category>(`/categories/${id}`),
  create: (data: CreateCategoryRequest) =>
    api.post<Category>("/categories", data),
  update: (id: string, data: UpdateCategoryRequest) =>
    api.patch<Category>(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
  toggleStatus: (id: string) => api.put(`/categories/${id}/toggle`),
  uploadImage: (id: string, file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    return api.post<Category>(
      `/categories/${id}/image`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  },
  uploadCover: (id: string, file: File) => {
    const formData = new FormData();
    formData.append("cover", file);
    return api.post<Category>(
      `/categories/${id}/cover`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  },
  getProductsByCategory: (id: string, limit?: number, offset?: number) => {
    const params = new URLSearchParams({
      ...(limit && { limit: limit.toString() }),
      ...(offset && { offset: offset.toString() }),
    });
    return api.get<{
      category: Category;
      products: Product[];
      total: number;
      limit: number;
      offset: number;
    }>(`/categories/${id}/products?${params}`);
  },
  getSellersByCategory: (id: string) =>
    api.get<{ category: Category; sellers: Seller[] }>(
      `/categories/${id}/sellers`
    ),
  updateOrder: (categoryOrders: Array<{ id: string; order: number }>) =>
    api.put<Category[]>("/categories/order", categoryOrders),
};

// Analytics Services
export const analyticsService = {
  getAdminAnalytics: () =>
    api.get<any>("/admin-analytics/dashboard").then((response) => {
      const data = response.data;
      return {
        ...response,
        data: {
          ...data,
          sellers: data.vendors,
          topSellers: data.topVendors,
        } as AdminAnalytics,
      };
    }),
  getSellerAnalytics: (sellerId: string) =>
    api.get<SellerAnalytics>(
      `/seller-analytics/dashboard?sellerId=${sellerId}`
    ),
  getSellers: () => api.get("/admin-analytics/vendors"),
  getSellerById: (id: string) => api.get(`/admin-analytics/sellers/${id}`),
  getGlobalSales: () => api.get("/admin-analytics/global-sales"),
  getMostSoldProducts: () => api.get("/admin-analytics/most-sold-products"),
  getSalesByCategory: () => api.get("/admin-analytics/sales-by-category"),
  getSalesBySellerCategory: () =>
    api.get("/admin-analytics/sales-by-vendor-category"),
  getTopSellers: () => api.get("/admin-analytics/top-vendors"),
  getRecentOrders: () => api.get("/admin-analytics/recent-orders"),
};

// Featured Products Services
export const featuredProductsService = {
  getAll: () => api.get<FeaturedProduct[]>("/admin/featured-products"),
  getAvailable: (searchTerm?: string) => {
    const params = searchTerm
      ? `?searchTerm=${encodeURIComponent(searchTerm)}`
      : "";
    return api.get<Product[]>(`/admin/featured-products/available${params}`);
  },
  addToFeatured: (productId: string) =>
    api.post<FeaturedProduct>(`/admin/featured-products/${productId}/feature`),
  removeFromFeatured: (productId: string) =>
    api.delete(`/admin/featured-products/${productId}/feature`),
  reorder: (data: ReorderProductsRequest) =>
    api.put("/admin/featured-products/reorder", data),
  moveUp: (productId: string) =>
    api.put(`/admin/featured-products/${productId}/move-up`),
  moveDown: (productId: string) =>
    api.put(`/admin/featured-products/${productId}/move-down`),
};

// Popular Banners Services
export const popularBannersService = {
  getAll: () => api.get<PopularBanner[]>("/popular-banners"),
  getById: (id: string) => api.get<PopularBanner>(`/popular-banners/${id}`),
  create: (data: CreatePopularBannerRequest) =>
    api.post<PopularBanner>("/popular-banners", data),
  update: (id: string, data: UpdatePopularBannerRequest) =>
    api.put<PopularBanner>(`/popular-banners/${id}`, data),
  delete: (id: string) => api.delete(`/popular-banners/${id}`),
  reorder: (data: ReorderBannersRequest) =>
    api.put("/popular-banners/reorder", data),
  uploadImage: (id: string, file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    return api.post<PopularBanner>(`/popular-banners/${id}/image`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};
