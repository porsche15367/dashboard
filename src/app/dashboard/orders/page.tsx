"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  AlertCircle,
  ShoppingCart,
  Package,
  Truck,
  CheckCircle,
  Activity,
} from "lucide-react";
import { orderService } from "@/lib/api-services";
import { Order, OrderStatus, PaymentStatus } from "@/types";

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PROCESSING: "bg-purple-100 text-purple-800",
  SHIPPED: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-green-100 text-green-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  REFUNDED: "bg-gray-100 text-gray-800",
};

const paymentStatusColors = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PROCESSING: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
  REFUNDED: "bg-gray-100 text-gray-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [vendorFilter, setVendorFilter] = useState<string>("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [goToPage, setGoToPage] = useState("");

  const {
    data: ordersData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["orders", page, statusFilter, vendorFilter],
    queryFn: () =>
      orderService
        .getAll(
          page,
          10,
          statusFilter === "all" ? undefined : statusFilter,
          vendorFilter === "all" ? undefined : vendorFilter
        )
        .then((res) => res.data),
  });

  const orders = (ordersData as any)?.orders || ordersData?.data || [];
  const pagination = ordersData?.pagination;

  // Get unique vendors for the filter dropdown
  const uniqueVendors = Array.from(
    new Map(
      orders.map((order: any) => [order.vendor.id, order.vendor])
    ).values()
  );

  // Apply search filter first
  const searchFilteredOrders = orders.filter(
    (order: any) =>
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.vendor.businessName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Apply status filter
  const statusFilteredOrders =
    statusFilter === "all"
      ? searchFilteredOrders
      : searchFilteredOrders.filter(
          (order: any) => order.status === statusFilter
        );

  // Apply vendor filter
  const filteredOrders =
    vendorFilter === "all"
      ? statusFilteredOrders
      : statusFilteredOrders.filter(
          (order: any) => order.vendor.id === vendorFilter
        );

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      setActionLoading(orderId);
      await orderService.updateStatus(orderId, newStatus);
      refetch();
    } catch (error) {
      console.error("Failed to update order status:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (orderId: string) => {
    try {
      setActionLoading(orderId);
      await orderService.cancel(orderId, "Cancelled by admin");
      refetch();
    } catch (error) {
      console.error("Failed to cancel order:", error);
    } finally {
      setActionLoading(null);
    }
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load orders. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">
            Manage orders and track their status
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <Activity className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters & Search</CardTitle>
          <CardDescription>
            Filter and search through orders to find what you're looking for
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Search Orders</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by order number, customer, or vendor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Order Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    All Status ({pagination?.total || 0})
                  </SelectItem>
                  <SelectItem value="PENDING">
                    Pending (
                    {
                      searchFilteredOrders.filter(
                        (o: any) => o.status === "PENDING"
                      ).length
                    }
                    )
                  </SelectItem>
                  <SelectItem value="CONFIRMED">
                    Confirmed (
                    {
                      searchFilteredOrders.filter(
                        (o: any) => o.status === "CONFIRMED"
                      ).length
                    }
                    )
                  </SelectItem>
                  <SelectItem value="PROCESSING">
                    Processing (
                    {
                      searchFilteredOrders.filter(
                        (o: any) => o.status === "PROCESSING"
                      ).length
                    }
                    )
                  </SelectItem>
                  <SelectItem value="SHIPPED">
                    Shipped (
                    {
                      searchFilteredOrders.filter(
                        (o: any) => o.status === "SHIPPED"
                      ).length
                    }
                    )
                  </SelectItem>
                  <SelectItem value="DELIVERED">
                    Delivered (
                    {
                      searchFilteredOrders.filter(
                        (o: any) => o.status === "DELIVERED"
                      ).length
                    }
                    )
                  </SelectItem>
                  <SelectItem value="COMPLETED">
                    Completed (
                    {
                      searchFilteredOrders.filter(
                        (o: any) => o.status === "COMPLETED"
                      ).length
                    }
                    )
                  </SelectItem>
                  <SelectItem value="CANCELLED">
                    Cancelled (
                    {
                      searchFilteredOrders.filter(
                        (o: any) => o.status === "CANCELLED"
                      ).length
                    }
                    )
                  </SelectItem>
                  <SelectItem value="REFUNDED">
                    Refunded (
                    {
                      searchFilteredOrders.filter(
                        (o: any) => o.status === "REFUNDED"
                      ).length
                    }
                    )
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Vendor Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Vendor</label>
              <Select value={vendorFilter} onValueChange={setVendorFilter}>
                <SelectTrigger>
                  <SelectValue
                    placeholder="Filter by vendor"
                    className={vendorFilter !== "all" ? "text-blue-600" : ""}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    All Vendors ({uniqueVendors.length})
                  </SelectItem>
                  {uniqueVendors.map((vendor: any) => (
                    <SelectItem key={vendor.id} value={vendor.id}>
                      {vendor.businessName} (
                      {
                        searchFilteredOrders.filter(
                          (o: any) => o.vendor.id === vendor.id
                        ).length
                      }
                      )
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Results Count */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Results</label>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  {filteredOrders.length} of {searchFilteredOrders.length}{" "}
                  orders
                </div>
                <div className="flex flex-wrap gap-1">
                  {statusFilter !== "all" && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                      Status: {statusFilter}
                    </span>
                  )}
                  {vendorFilter !== "all" && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      Vendor:{" "}
                      {(
                        uniqueVendors.find(
                          (v: any) => v.id === vendorFilter
                        ) as any
                      )?.businessName || "Unknown"}
                    </span>
                  )}
                </div>
                {searchTerm && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchTerm("")}
                    className="h-8"
                  >
                    Clear Search
                  </Button>
                )}
                {statusFilter !== "all" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setStatusFilter("all")}
                    className="h-8"
                  >
                    Clear Status
                  </Button>
                )}
                {vendorFilter !== "all" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setVendorFilter("all")}
                    className="h-8"
                  >
                    Clear Vendor
                  </Button>
                )}
                {(searchTerm ||
                  statusFilter !== "all" ||
                  vendorFilter !== "all") && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                      setVendorFilter("all");
                      setPage(1);
                    }}
                    className="h-8"
                  >
                    Clear All
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {searchFilteredOrders.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                searchFilteredOrders.filter((o: any) => o.status === "PENDING")
                  .length
              }
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                searchFilteredOrders.filter(
                  (o: any) => o.status === "PROCESSING"
                ).length
              }
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                searchFilteredOrders.filter(
                  (o: any) => o.status === "COMPLETED"
                ).length
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Order List</CardTitle>
          <CardDescription>
            A list of all orders in the marketplace
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[100px]" />
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <div className="flex flex-col items-center space-y-4">
                        <ShoppingCart className="h-12 w-12 text-muted-foreground" />
                        <div className="text-center">
                          <h3 className="text-lg font-medium text-muted-foreground">
                            {searchTerm ||
                            statusFilter !== "all" ||
                            vendorFilter !== "all"
                              ? "No orders match your criteria"
                              : "No orders found"}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-2">
                            {searchTerm
                              ? `No orders found for "${searchTerm}". Try adjusting your search terms.`
                              : statusFilter !== "all"
                              ? `No orders found with status "${statusFilter}". Try selecting a different status.`
                              : vendorFilter !== "all"
                              ? `No orders found for the selected vendor. Try selecting a different vendor.`
                              : "Orders will appear here once customers start placing orders."}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          {searchTerm && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSearchTerm("")}
                            >
                              Clear Search
                            </Button>
                          )}
                          {statusFilter !== "all" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setStatusFilter("all")}
                            >
                              Clear Status
                            </Button>
                          )}
                          {vendorFilter !== "all" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setVendorFilter("all")}
                            >
                              Clear Vendor
                            </Button>
                          )}
                          {(searchTerm ||
                            statusFilter !== "all" ||
                            vendorFilter !== "all") && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSearchTerm("");
                                setStatusFilter("all");
                                setVendorFilter("all");
                                setPage(1);
                              }}
                            >
                              Clear All
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => refetch()}
                          >
                            Refresh
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order: any) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            #{order.orderNumber}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {order.items.length} item
                            {order.items.length !== 1 ? "s" : ""}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.user.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {order.user.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {order.vendor.businessName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {order.vendor.name}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            ${order.finalAmount}
                          </div>
                          {order.discountAmount > 0 && (
                            <div className="text-sm text-green-600">
                              -${order.discountAmount} discount
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            statusColors[
                              order.status as keyof typeof statusColors
                            ]
                          }
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            paymentStatusColors[
                              order.paymentStatus as keyof typeof paymentStatusColors
                            ]
                          }
                        >
                          {order.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {order.status === "PENDING" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusUpdate(order.id, "CONFIRMED")
                                }
                                disabled={actionLoading === order.id}
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Confirm
                              </DropdownMenuItem>
                            )}
                            {order.status === "CONFIRMED" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusUpdate(order.id, "PROCESSING")
                                }
                                disabled={actionLoading === order.id}
                              >
                                <Package className="mr-2 h-4 w-4" />
                                Start Processing
                              </DropdownMenuItem>
                            )}
                            {order.status === "PROCESSING" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusUpdate(order.id, "SHIPPED")
                                }
                                disabled={actionLoading === order.id}
                              >
                                <Truck className="mr-2 h-4 w-4" />
                                Mark as Shipped
                              </DropdownMenuItem>
                            )}
                            {order.status === "SHIPPED" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusUpdate(order.id, "DELIVERED")
                                }
                                disabled={actionLoading === order.id}
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Mark as Delivered
                              </DropdownMenuItem>
                            )}
                            {(order.status === "PENDING" ||
                              order.status === "CONFIRMED") && (
                              <DropdownMenuItem
                                onClick={() => handleCancel(order.id)}
                                disabled={actionLoading === order.id}
                              >
                                <AlertCircle className="mr-2 h-4 w-4" />
                                Cancel Order
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                of {pagination.total} results
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(1)}
                  disabled={pagination.page === 1}
                >
                  First
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>

                {/* Page Numbers */}
                <div className="flex items-center space-x-1">
                  {Array.from(
                    { length: Math.min(5, pagination.totalPages) },
                    (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={
                            pagination.page === pageNum ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setPage(pageNum)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    }
                  )}
                  {pagination.totalPages > 5 &&
                    pagination.page < pagination.totalPages - 2 && (
                      <>
                        <span className="text-muted-foreground">...</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage(pagination.totalPages)}
                          className="w-8 h-8 p-0"
                        >
                          {pagination.totalPages}
                        </Button>
                      </>
                    )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPage((p) => Math.min(pagination.totalPages, p + 1))
                  }
                  disabled={pagination.page === pagination.totalPages}
                >
                  Next
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(pagination.totalPages)}
                  disabled={pagination.page === pagination.totalPages}
                >
                  Last
                </Button>
              </div>

              {/* Go to Page */}
              <div className="flex items-center space-x-2 ml-4">
                <span className="text-sm text-muted-foreground">Go to:</span>
                <Input
                  type="number"
                  min="1"
                  max={pagination.totalPages}
                  value={goToPage}
                  onChange={(e) => setGoToPage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      const pageNum = parseInt(goToPage);
                      if (pageNum >= 1 && pageNum <= pagination.totalPages) {
                        setPage(pageNum);
                        setGoToPage("");
                      }
                    }
                  }}
                  className="w-16 h-8 text-center"
                  placeholder="Page"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const pageNum = parseInt(goToPage);
                    if (pageNum >= 1 && pageNum <= pagination.totalPages) {
                      setPage(pageNum);
                      setGoToPage("");
                    }
                  }}
                  disabled={
                    !goToPage ||
                    isNaN(parseInt(goToPage)) ||
                    parseInt(goToPage) < 1 ||
                    parseInt(goToPage) > pagination.totalPages
                  }
                  className="h-8"
                >
                  Go
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
