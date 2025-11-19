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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  AlertCircle,
  Package,
  Plus,
  ToggleLeft,
  ToggleRight,
  Upload,
  X,
} from "lucide-react";
import { productCategoryService, vendorService } from "@/lib/api-services";
import {
  ProductCategory,
  Vendor,
  CreateProductCategoryRequest,
  UpdateProductCategoryRequest,
} from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useClientAuth } from "@/lib/auth";

export default function ProductCategoriesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] =
    useState<ProductCategory | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [createFormData, setCreateFormData] =
    useState<CreateProductCategoryRequest>({
      name: "",
      description: "",
      icon: "",
      vendorId: "",
    });
  const [editFormData, setEditFormData] =
    useState<UpdateProductCategoryRequest>({
      name: "",
      description: "",
      icon: "",
      isActive: true,
    });
  const [createImageFile, setCreateImageFile] = useState<File | null>(null);
  const [createImagePreview, setCreateImagePreview] = useState<string>("");
  const [createCoverFile, setCreateCoverFile] = useState<File | null>(null);
  const [createCoverPreview, setCreateCoverPreview] = useState<string>("");
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string>("");
  const [editCoverFile, setEditCoverFile] = useState<File | null>(null);
  const [editCoverPreview, setEditCoverPreview] = useState<string>("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const { toast } = useToast();
  const { admin } = useClientAuth();

  // Fetch vendors for admin users
  const { data: vendors, isLoading: vendorsLoading } = useQuery({
    queryKey: ["vendors"],
    queryFn: () => vendorService.getAll().then((res) => res.data),
    enabled: admin?.role === "admin" || admin?.role === "superadmin",
  });

  // Fetch categories
  const {
    data: categories,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["product-categories"],
    queryFn: () => productCategoryService.getAll().then((res) => res.data),
  });

  const filteredCategories =
    categories?.filter(
      (category) =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (category.description &&
          category.description.toLowerCase().includes(searchTerm.toLowerCase()))
    ) || [];

  const handleToggleStatus = async (categoryId: string) => {
    try {
      setActionLoading(categoryId);
      await productCategoryService.toggleStatus(categoryId);
      toast({
        title: "Success",
        description: "Category status updated successfully",
      });
      refetch();
    } catch (error: unknown) {
      console.error("Failed to toggle category status:", error);
      toast({
        title: "Error",
        description: "Failed to update category status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (categoryId: string) => {
    try {
      setActionLoading(categoryId);
      await productCategoryService.delete(categoryId);
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
      refetch();
    } catch (error: unknown) {
      console.error("Failed to delete category:", error);
      toast({
        title: "Error",
        description: "Failed to delete category. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewCategory = (category: ProductCategory) => {
    setSelectedCategory(category);
    setIsViewModalOpen(true);
  };

  const handleCreateImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCreateImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCreateImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCreateCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCreateCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearCreateImage = () => {
    setCreateImageFile(null);
    setCreateImagePreview("");
  };

  const clearCreateCover = () => {
    setCreateCoverFile(null);
    setCreateCoverPreview("");
  };

  const handleEditImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearEditImage = () => {
    setEditImageFile(null);
    setEditImagePreview(selectedCategory?.imageUrl || "");
  };

  const clearEditCover = () => {
    setEditCoverFile(null);
    setEditCoverPreview(selectedCategory?.coverImageUrl || "");
  };

  const handleEditCategory = (category: ProductCategory) => {
    setSelectedCategory(category);
    setEditFormData({
      name: category.name,
      description: category.description || "",
      icon: category.icon || "",
      isActive: category.isActive,
    });
    setEditImagePreview(category.imageUrl || "");
    setEditCoverPreview(category.coverImageUrl || "");
    setEditImageFile(null);
    setEditCoverFile(null);
    setIsEditModalOpen(true);
  };

  const handleCreateCategory = () => {
    setCreateFormData({
      name: "",
      description: "",
      icon: "",
      vendorId: "",
    });
    setCreateImageFile(null);
    setCreateImagePreview("");
    setCreateCoverFile(null);
    setCreateCoverPreview("");
    setIsCreateModalOpen(true);
  };

  const handleSaveCreate = async () => {
    // Validate vendor selection for admins
    if (
      (admin?.role === "admin" || admin?.role === "superadmin") &&
      !createFormData.vendorId
    ) {
      toast({
        title: "Select Vendor",
        description: "Please select a vendor to create the category",
        variant: "destructive",
      });
      return;
    }

    try {
      setActionLoading("create");
      setUploadingImage(true);
      
      // Create category first to get the ID
      const newCategory = await productCategoryService.create({
        ...createFormData,
        imageUrl: "",
        coverImageUrl: "",
      });
      
      // Upload image if provided
      if (createImageFile) {
        await productCategoryService.uploadImage(
          newCategory.data.id,
          createImageFile
        );
      }
      
      // Upload cover if provided
      if (createCoverFile) {
        await productCategoryService.uploadCover(
          newCategory.data.id,
          createCoverFile
        );
      }
      
      setUploadingImage(false);
      toast({
        title: "Success",
        description: "Category created successfully",
      });
      setIsCreateModalOpen(false);
      setCreateImageFile(null);
      setCreateImagePreview("");
      setCreateCoverFile(null);
      setCreateCoverPreview("");
      refetch();
    } catch (error: unknown) {
      console.error("Failed to create category:", error);
      setUploadingImage(false);
      toast({
        title: "Error",
        description: "Failed to create category. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedCategory) return;

    try {
      setActionLoading(selectedCategory.id);
      setUploadingImage(true);
      
      // Upload image if provided
      if (editImageFile) {
        await productCategoryService.uploadImage(
          selectedCategory.id,
          editImageFile
        );
      }
      
      // Upload cover if provided
      if (editCoverFile) {
        await productCategoryService.uploadCover(
          selectedCategory.id,
          editCoverFile
        );
      }
      
      // Update other fields
      await productCategoryService.update(selectedCategory.id, editFormData);
      
      setUploadingImage(false);
      toast({
        title: "Success",
        description: "Category updated successfully",
      });
      setIsEditModalOpen(false);
      setEditImageFile(null);
      setEditImagePreview("");
      setEditCoverFile(null);
      setEditCoverPreview("");
      refetch();
    } catch (error: unknown) {
      console.error("Failed to update category:", error);
      setUploadingImage(false);
      toast({
        title: "Error",
        description: "Failed to update category. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load product categories. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Product Categories
          </h1>
          <p className="text-muted-foreground">
            Manage product categories for item classification
          </p>
        </div>
        <Button onClick={handleCreateCategory}>
          <Plus className="mr-2 h-4 w-4" />
          Create Category
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Categories
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {categories?.filter((c) => c.isActive).length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {categories?.filter((c) => !c.isActive).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle>Category List</CardTitle>
          <CardDescription>
            {admin?.role === "admin" || admin?.role === "superadmin"
              ? "All product categories"
              : "Your product categories"}
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
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Icon</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <div className="font-medium">{category.name}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {category.description || "No description"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-muted-foreground">
                        {category.icon || "No icon"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={category.isActive ? "default" : "secondary"}
                      >
                        {category.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(category.createdAt).toLocaleDateString()}
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
                          <DropdownMenuItem
                            onClick={() => handleViewCategory(category)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEditCategory(category)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleToggleStatus(category.id)}
                            disabled={actionLoading === category.id}
                          >
                            {category.isActive ? (
                              <>
                                <ToggleLeft className="mr-2 h-4 w-4" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <ToggleRight className="mr-2 h-4 w-4" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Are you sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will
                                  permanently delete the category and may affect
                                  products using this category.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(category.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Category Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Product Category</DialogTitle>
            <DialogDescription>
              Create a new product category for a vendor
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {(admin?.role === "admin" || admin?.role === "superadmin") && (
              <div className="space-y-2">
                <Label htmlFor="create-vendor">Vendor *</Label>
                <Select
                  value={createFormData.vendorId}
                  onValueChange={(value) =>
                    setCreateFormData((prev) => ({
                      ...prev,
                      vendorId: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendors?.map((vendor) => (
                      <SelectItem key={vendor.id} value={vendor.id}>
                        {vendor.businessName} ({vendor.name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="create-name">Name *</Label>
              <Input
                id="create-name"
                value={createFormData.name}
                onChange={(e) =>
                  setCreateFormData((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                placeholder="Enter category name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-description">Description</Label>
              <Textarea
                id="create-description"
                value={createFormData.description}
                onChange={(e) =>
                  setCreateFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Enter category description"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-icon">Icon</Label>
              <Input
                id="create-icon"
                value={createFormData.icon}
                onChange={(e) =>
                  setCreateFormData((prev) => ({
                    ...prev,
                    icon: e.target.value,
                  }))
                }
                placeholder="e.g., lucide:smartphone, lucide:laptop"
              />
              <p className="text-xs text-muted-foreground">
                Enter an icon name (e.g., lucide:smartphone) or leave empty
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-image">Category Image</Label>
              <input
                type="file"
                id="create-image"
                accept="image/*"
                onChange={handleCreateImageSelect}
                className="hidden"
              />
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    document.getElementById("create-image")?.click()
                  }
                  className="flex items-center space-x-2"
                  disabled={uploadingImage}
                >
                  <Upload className="h-4 w-4" />
                  <span>{createImageFile ? "Change Image" : "Select Image"}</span>
                </Button>
                {createImageFile && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearCreateImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {createImagePreview && (
                <div className="mt-2">
                  <img
                    src={createImagePreview}
                    alt="Preview"
                    className="h-32 w-32 object-cover rounded-md border"
                  />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-cover">Category Cover Image</Label>
              <input
                type="file"
                id="create-cover"
                accept="image/*"
                onChange={handleCreateCoverSelect}
                className="hidden"
              />
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    document.getElementById("create-cover")?.click()
                  }
                  className="flex items-center space-x-2"
                  disabled={uploadingImage}
                >
                  <Upload className="h-4 w-4" />
                  <span>{createCoverFile ? "Change Cover" : "Select Cover"}</span>
                </Button>
                {createCoverFile && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearCreateCover}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {createCoverPreview && (
                <div className="mt-2">
                  <img
                    src={createCoverPreview}
                    alt="Cover Preview"
                    className="h-32 w-32 object-cover rounded-md border"
                  />
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
              disabled={actionLoading === "create"}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveCreate}
              disabled={
                actionLoading === "create" ||
                uploadingImage ||
                !createFormData.name.trim() ||
                ((admin?.role === "admin" || admin?.role === "superadmin") &&
                  !createFormData.vendorId)
              }
            >
              {uploadingImage 
                ? "Uploading..." 
                : actionLoading === "create" 
                ? "Creating..." 
                : "Create Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Product Category</DialogTitle>
            <DialogDescription>
              Update the product category information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                value={editFormData.name}
                onChange={(e) =>
                  setEditFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Enter category name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editFormData.description}
                onChange={(e) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Enter category description"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-icon">Icon</Label>
              <Input
                id="edit-icon"
                value={editFormData.icon}
                onChange={(e) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    icon: e.target.value,
                  }))
                }
                placeholder="e.g., lucide:smartphone, lucide:laptop"
              />
              <p className="text-xs text-muted-foreground">
                Enter an icon name (e.g., lucide:smartphone) or leave empty
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-image">Category Image</Label>
              <input
                type="file"
                id="edit-image"
                accept="image/*"
                onChange={handleEditImageSelect}
                className="hidden"
              />
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    document.getElementById("edit-image")?.click()
                  }
                  className="flex items-center space-x-2"
                  disabled={uploadingImage}
                >
                  <Upload className="h-4 w-4" />
                  <span>{editImageFile ? "Change Image" : "Select Image"}</span>
                </Button>
                {editImageFile && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearEditImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {editImagePreview && (
                <div className="mt-2">
                  <img
                    src={editImagePreview}
                    alt="Preview"
                    className="h-32 w-32 object-cover rounded-md border"
                  />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-cover">Category Cover Image</Label>
              <input
                type="file"
                id="edit-cover"
                accept="image/*"
                onChange={handleEditCoverSelect}
                className="hidden"
              />
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    document.getElementById("edit-cover")?.click()
                  }
                  className="flex items-center space-x-2"
                  disabled={uploadingImage}
                >
                  <Upload className="h-4 w-4" />
                  <span>{editCoverFile ? "Change Cover" : "Select Cover"}</span>
                </Button>
                {editCoverFile && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearEditCover}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {editCoverPreview && (
                <div className="mt-2">
                  <img
                    src={editCoverPreview}
                    alt="Cover Preview"
                    className="h-32 w-32 object-cover rounded-md border"
                  />
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-active"
                checked={editFormData.isActive}
                onChange={(e) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    isActive: e.target.checked,
                  }))
                }
                className="rounded"
              />
              <Label htmlFor="edit-active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              disabled={actionLoading === selectedCategory?.id || uploadingImage}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={
                actionLoading === selectedCategory?.id ||
                uploadingImage ||
                !editFormData.name?.trim()
              }
            >
              {uploadingImage
                ? "Uploading..."
                : actionLoading === selectedCategory?.id
                ? "Saving..."
                : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Category Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Category Details</DialogTitle>
            <DialogDescription>
              View detailed information about this product category
            </DialogDescription>
          </DialogHeader>
          {selectedCategory && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Name</Label>
                <p className="text-sm text-muted-foreground">
                  {selectedCategory.name}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-sm text-muted-foreground">
                  {selectedCategory.description || "No description"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Icon</Label>
                <p className="text-sm text-muted-foreground">
                  {selectedCategory.icon || "No icon"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Status</Label>
                <Badge
                  variant={selectedCategory.isActive ? "default" : "secondary"}
                >
                  {selectedCategory.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div>
                <Label className="text-sm font-medium">Created</Label>
                <p className="text-sm text-muted-foreground">
                  {new Date(selectedCategory.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Updated</Label>
                <p className="text-sm text-muted-foreground">
                  {new Date(selectedCategory.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
