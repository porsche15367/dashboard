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
    Building2,
    Plus,
    ToggleLeft,
    ToggleRight,
    Upload,
    X,
    ArrowUp,
    ArrowDown,
} from "lucide-react";
import { categoryService } from "@/lib/api-services";
import {
    Category,
    CreateCategoryRequest,
    UpdateCategoryRequest,
} from "@/types";
import { useToast } from "@/hooks/use-toast";

export default function CategoriesPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [showInactive, setShowInactive] = useState(false);
    const [selectedCategory, setSelectedCategory] =
        useState<Category | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [createFormData, setCreateFormData] =
        useState<CreateCategoryRequest>({
            name: "",
            description: "",
            imageUrl: "",
            coverImageUrl: "",
        });
    const [editFormData, setEditFormData] = useState<UpdateCategoryRequest>(
        {
            name: "",
            description: "",
            imageUrl: "",
            coverImageUrl: "",
            isActive: true,
        }
    );
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

    const {
        data: categories,
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: ["categories", showInactive],
        queryFn: () => categoryService.getAll().then((res) => res.data),
    });

    // Sort categories by order, then by name
    const sortedCategories = categories
        ? [...categories].sort((a, b) => {
            const orderA = a.order ?? 0;
            const orderB = b.order ?? 0;
            if (orderA !== orderB) {
                return orderA - orderB;
            }
            return a.name.localeCompare(b.name);
        })
        : [];

    const filteredCategories =
        sortedCategories.filter(
            (category) =>
                category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (category.description &&
                    category.description.toLowerCase().includes(searchTerm.toLowerCase()))
        ) || [];

    const handleMoveUp = async (categoryId: string) => {
        if (!categories) return;
        
        // Sort categories first
        const sorted = [...categories].sort((a, b) => {
            const orderA = a.order ?? 0;
            const orderB = b.order ?? 0;
            if (orderA !== orderB) {
                return orderA - orderB;
            }
            return a.name.localeCompare(b.name);
        });
        
        const currentIndex = sorted.findIndex(c => c.id === categoryId);
        if (currentIndex === 0) return; // Already at top
        
        // Swap items in array
        const newSorted = [...sorted];
        [newSorted[currentIndex], newSorted[currentIndex - 1]] = 
            [newSorted[currentIndex - 1], newSorted[currentIndex]];
        
        // Assign sequential orders based on new positions
        const newOrders = newSorted.map((c, idx) => ({
            id: c.id,
            order: idx,
        }));
        
        setActionLoading(categoryId);
        try {
            await categoryService.updateOrder(newOrders);
            await refetch();
            toast({
                title: "Success",
                description: "Category order updated",
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to update category order",
                variant: "destructive",
            });
        } finally {
            setActionLoading(null);
        }
    };

    const handleMoveDown = async (categoryId: string) => {
        if (!categories) return;
        
        // Sort categories first
        const sorted = [...categories].sort((a, b) => {
            const orderA = a.order ?? 0;
            const orderB = b.order ?? 0;
            if (orderA !== orderB) {
                return orderA - orderB;
            }
            return a.name.localeCompare(b.name);
        });
        
        const currentIndex = sorted.findIndex(c => c.id === categoryId);
        if (currentIndex === sorted.length - 1) return; // Already at bottom
        
        // Swap items in array
        const newSorted = [...sorted];
        [newSorted[currentIndex], newSorted[currentIndex + 1]] = 
            [newSorted[currentIndex + 1], newSorted[currentIndex]];
        
        // Assign sequential orders based on new positions
        const newOrders = newSorted.map((c, idx) => ({
            id: c.id,
            order: idx,
        }));
        
        setActionLoading(categoryId);
        try {
            await categoryService.updateOrder(newOrders);
            await refetch();
            toast({
                title: "Success",
                description: "Category order updated",
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to update category order",
                variant: "destructive",
            });
        } finally {
            setActionLoading(null);
        }
    };

    const handleToggleStatus = async (categoryId: string) => {
        try {
            setActionLoading(categoryId);
            await categoryService.toggleStatus(categoryId);
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
            await categoryService.delete(categoryId);
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

    const handleViewCategory = (category: Category) => {
        setSelectedCategory(category);
        setIsViewModalOpen(true);
    };

    const handleEditCategory = (category: Category) => {
        setSelectedCategory(category);
        setEditFormData({
            name: category.name,
            description: category.description || "",
            imageUrl: category.imageUrl || "",
            coverImageUrl: category.coverImageUrl || "",
            isActive: category.isActive,
        });
        setEditImageFile(null);
        setEditImagePreview(category.imageUrl || "");
        setEditCoverFile(null);
        setEditCoverPreview(category.coverImageUrl || "");
        setIsEditModalOpen(true);
    };

    const handleCreateCategory = () => {
        setCreateFormData({
            name: "",
            description: "",
            imageUrl: "",
            coverImageUrl: "",
        });
        setCreateImageFile(null);
        setCreateImagePreview("");
        setCreateCoverFile(null);
        setCreateCoverPreview("");
        setIsCreateModalOpen(true);
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

    const clearCreateImage = () => {
        setCreateImageFile(null);
        setCreateImagePreview("");
    };

    const clearCreateCover = () => {
        setCreateCoverFile(null);
        setCreateCoverPreview("");
    };

    const clearEditImage = () => {
        setEditImageFile(null);
        setEditImagePreview(editFormData.imageUrl || "");
    };

    const clearEditCover = () => {
        setEditCoverFile(null);
        setEditCoverPreview(editFormData.coverImageUrl || "");
    };

    const handleSaveCreate = async () => {
        try {
            setActionLoading("create");

            // Create category first to get the ID
            const newCategory = await categoryService.create({
                ...createFormData,
                imageUrl: "", // Will be set after upload if file selected
                coverImageUrl: "", // Will be set after upload if file selected
            });

            setUploadingImage(true);

            // Upload image if file selected
            if (createImageFile) {
                await categoryService.uploadImage(
                    newCategory.data.id,
                    createImageFile
                );
            }

            // Upload cover image if file selected
            if (createCoverFile) {
                await categoryService.uploadCover(
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

            // Update other fields first
            await categoryService.update(selectedCategory.id, editFormData);

            // Upload image if file selected
            if (editImageFile) {
                await categoryService.uploadImage(
                    selectedCategory.id,
                    editImageFile
                );
            }

            // Upload cover image if file selected
            if (editCoverFile) {
                await categoryService.uploadCover(
                    selectedCategory.id,
                    editCoverFile
                );
            }

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
                    Failed to load categories. Please try again.
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Categories
                    </h1>
                    <p className="text-muted-foreground">
                        Manage marketplace categories
                    </p>
                </div>
                <Button onClick={handleCreateCategory}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Category
                </Button>
            </div>

            {/* Search and Filters */}
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
                <Button
                    variant={showInactive ? "default" : "outline"}
                    onClick={() => setShowInactive(!showInactive)}
                >
                    {showInactive ? "Hide Inactive" : "Show Inactive"}
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Categories
                        </CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
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
                        A list of all categories in the marketplace
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
                                    <TableHead className="w-12">Order</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Image</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCategories.map((category, index) => (
                                    <TableRow key={category.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-7 w-7 p-0"
                                                    onClick={() => handleMoveUp(category.id)}
                                                    disabled={actionLoading === category.id || index === 0}
                                                >
                                                    <ArrowUp className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-7 w-7 p-0"
                                                    onClick={() => handleMoveDown(category.id)}
                                                    disabled={actionLoading === category.id || index === filteredCategories.length - 1}
                                                >
                                                    <ArrowDown className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{category.name}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm text-muted-foreground">
                                                {category.description || "No description"}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {category.imageUrl ? (
                                                <img
                                                    src={category.imageUrl}
                                                    alt={category.name}
                                                    className="h-12 w-12 object-cover rounded-md"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                        (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                                    }}
                                                />
                                            ) : (
                                                <div className="h-12 w-12 bg-gray-100 rounded-md flex items-center justify-center text-xs text-muted-foreground">
                                                    No image
                                                </div>
                                            )}
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
                                                                    permanently delete the category.
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
                        <DialogTitle>Create Category</DialogTitle>
                        <DialogDescription>
                            Create a new category for the marketplace
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
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
                            <Label htmlFor="create-image">Category Image</Label>
                            <div className="space-y-2">
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
                            <p className="text-xs text-muted-foreground">
                                Or enter an image URL manually:
                            </p>
                            <Input
                                id="create-imageUrl"
                                type="url"
                                value={createFormData.imageUrl}
                                onChange={(e) =>
                                    setCreateFormData((prev) => ({
                                        ...prev,
                                        imageUrl: e.target.value,
                                    }))
                                }
                                placeholder="https://example.com/image.jpg"
                                disabled={!!createImageFile}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="create-cover">Category Cover Image</Label>
                            <div className="space-y-2">
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
                            <p className="text-xs text-muted-foreground">
                                Or enter a cover image URL manually:
                            </p>
                            <Input
                                id="create-coverImageUrl"
                                type="url"
                                value={createFormData.coverImageUrl}
                                onChange={(e) =>
                                    setCreateFormData((prev) => ({
                                        ...prev,
                                        coverImageUrl: e.target.value,
                                    }))
                                }
                                placeholder="https://example.com/cover.jpg"
                                disabled={!!createCoverFile}
                            />
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
                                !createFormData.name.trim()
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
                        <DialogTitle>Edit Category</DialogTitle>
                        <DialogDescription>
                            Update category information
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Name *</Label>
                            <Input
                                id="edit-name"
                                value={editFormData.name}
                                onChange={(e) =>
                                    setEditFormData((prev) => ({
                                        ...prev,
                                        name: e.target.value,
                                    }))
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
                            <Label htmlFor="edit-image">Category Image</Label>
                            <div className="space-y-2">
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
                            <p className="text-xs text-muted-foreground">
                                Or enter an image URL manually:
                            </p>
                            <Input
                                id="edit-imageUrl"
                                type="url"
                                value={editFormData.imageUrl}
                                onChange={(e) =>
                                    setEditFormData((prev) => ({
                                        ...prev,
                                        imageUrl: e.target.value,
                                    }))
                                }
                                placeholder="https://example.com/image.jpg"
                                disabled={!!editImageFile}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-cover">Category Cover Image</Label>
                            <div className="space-y-2">
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
                            <p className="text-xs text-muted-foreground">
                                Or enter a cover image URL manually:
                            </p>
                            <Input
                                id="edit-coverImageUrl"
                                type="url"
                                value={editFormData.coverImageUrl}
                                onChange={(e) =>
                                    setEditFormData((prev) => ({
                                        ...prev,
                                        coverImageUrl: e.target.value,
                                    }))
                                }
                                placeholder="https://example.com/cover.jpg"
                                disabled={!!editCoverFile}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsEditModalOpen(false)}
                            disabled={actionLoading === selectedCategory?.id}
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
                    </DialogHeader>
                    {selectedCategory && (
                        <div className="space-y-4">
                            <div className="flex justify-center">
                                {selectedCategory.imageUrl ? (
                                    <img
                                        src={selectedCategory.imageUrl}
                                        alt={selectedCategory.name}
                                        className="h-32 w-32 object-cover rounded-full border-2 border-gray-100"
                                    />
                                ) : (
                                    <div className="h-32 w-32 bg-gray-100 rounded-full flex items-center justify-center">
                                        <Building2 className="h-12 w-12 text-gray-400" />
                                    </div>
                                )}
                            </div>

                            {selectedCategory.coverImageUrl && (
                                <div className="mt-4">
                                    <Label>Cover Image</Label>
                                    <img
                                        src={selectedCategory.coverImageUrl}
                                        alt="Cover"
                                        className="w-full h-32 object-cover rounded-md mt-2"
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-muted-foreground">Name</Label>
                                    <div className="font-medium">{selectedCategory.name}</div>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Status</Label>
                                    <div>
                                        <Badge
                                            variant={selectedCategory.isActive ? "default" : "secondary"}
                                        >
                                            {selectedCategory.isActive ? "Active" : "Inactive"}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <Label className="text-muted-foreground">Description</Label>
                                    <div className="text-sm">
                                        {selectedCategory.description || "No description provided"}
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <Label className="text-muted-foreground">Created At</Label>
                                    <div className="text-sm">
                                        {new Date(selectedCategory.createdAt).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button onClick={() => setIsViewModalOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
