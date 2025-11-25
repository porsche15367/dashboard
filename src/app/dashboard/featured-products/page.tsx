"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { featuredProductsService } from "@/lib/api-services";
import { FeaturedProduct, Product } from "@/types";
import {
  Search,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Star,
  Package,
  ShoppingCart,
  DollarSign,
  Calendar,
} from "lucide-react";

export default function FeaturedProductsPage() {
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>(
    []
  );
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  // Load featured products
  const loadFeaturedProducts = async () => {
    try {
      const response = await featuredProductsService.getAll();
      setFeaturedProducts(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load featured products",
        variant: "destructive",
      });
    }
  };

  // Load available products
  const loadAvailableProducts = async (search?: string) => {
    try {
      const response = await featuredProductsService.getAvailable(search);
      setAvailableProducts(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load available products",
        variant: "destructive",
      });
    }
  };

  // Add product to featured
  const addToFeatured = async (productId: string) => {
    setActionLoading(productId);
    try {
      await featuredProductsService.addToFeatured(productId);
      await loadFeaturedProducts();
      await loadAvailableProducts(searchTerm);
      toast({
        title: "Success",
        description: "Product added to featured list",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to add product to featured",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Remove product from featured
  const removeFromFeatured = async (productId: string) => {
    setActionLoading(productId);
    try {
      await featuredProductsService.removeFromFeatured(productId);
      await loadFeaturedProducts();
      await loadAvailableProducts(searchTerm);
      toast({
        title: "Success",
        description: "Product removed from featured list",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          "Failed to remove product from featured",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Move product up
  const moveUp = async (productId: string) => {
    setActionLoading(productId);
    try {
      await featuredProductsService.moveUp(productId);
      await loadFeaturedProducts();
      toast({
        title: "Success",
        description: "Product moved up",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to move product up",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Move product down
  const moveDown = async (productId: string) => {
    setActionLoading(productId);
    try {
      await featuredProductsService.moveDown(productId);
      await loadFeaturedProducts();
      toast({
        title: "Success",
        description: "Product moved down",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to move product down",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    loadAvailableProducts(value);
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadFeaturedProducts(), loadAvailableProducts()]);
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Featured Products
          </h1>
          <p className="text-muted-foreground">
            Manage products featured on the homepage
          </p>
        </div>
      </div>

      {/* Featured Products Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Currently Featured ({featuredProducts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {featuredProducts.length === 0 ? (
            <Alert>
              <AlertDescription>
                No products are currently featured. Add some products below to
                get started.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {featuredProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        #{product.featuredOrder}
                      </Badge>
                      {product.images.length > 0 && (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        by {product.seller.businessName} • ${product.price}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => moveUp(product.id)}
                      disabled={actionLoading === product.id || index === 0}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => moveDown(product.id)}
                      disabled={
                        actionLoading === product.id ||
                        index === featuredProducts.length - 1
                      }
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeFromFeatured(product.id)}
                      disabled={actionLoading === product.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Products Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Available Products
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {availableProducts.length === 0 ? (
            <Alert>
              <AlertDescription>
                {searchTerm
                  ? "No products found matching your search."
                  : "No available products to feature."}
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {availableProducts.map((product) => (
                <div
                  key={product.id}
                  className="border rounded-lg p-4 space-y-3"
                >
                  {product.images.length > 0 && (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-32 object-cover rounded"
                    />
                  )}
                  <div>
                    <h3 className="font-medium">{product.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>by {product.seller.businessName}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {product.price}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => addToFeatured(product.id)}
                        disabled={actionLoading === product.id}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Feature
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
