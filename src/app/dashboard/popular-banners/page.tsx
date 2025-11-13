"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { popularBannersService } from "@/lib/api-services";
import {
  PopularBanner,
  CreatePopularBannerRequest,
  UpdatePopularBannerRequest,
} from "@/types";
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Edit,
  Upload,
  X,
  AlertCircle,
  GripVertical,
} from "lucide-react";

export default function PopularBannersPage() {
  const [banners, setBanners] = useState<PopularBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<PopularBanner | null>(
    null
  );
  const [createFormData, setCreateFormData] =
    useState<CreatePopularBannerRequest>({
      imageUrl: "",
      title: "",
      subtitle: "",
      buttonText: "",
      linkUrl: "",
      isActive: true,
    });
  const [editFormData, setEditFormData] = useState<UpdatePopularBannerRequest>(
    {}
  );
  const [createImageFile, setCreateImageFile] = useState<File | null>(null);
  const [createImagePreview, setCreateImagePreview] = useState<string>("");
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string>("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const { toast } = useToast();

  // Load banners
  const loadBanners = async () => {
    try {
      setLoading(true);
      const response = await popularBannersService.getAll();
      setBanners(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load popular banners",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  // Handle image selection for create
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

  // Handle image selection for edit
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

  // Clear create image
  const clearCreateImage = () => {
    setCreateImageFile(null);
    setCreateImagePreview("");
  };

  // Clear edit image
  const clearEditImage = () => {
    setEditImageFile(null);
    setEditImagePreview("");
  };

  // Create banner
  const handleCreate = async () => {
    try {
      setActionLoading("create");

      // Check if we already have 4 active banners
      const activeBanners = banners.filter((b) => b.isActive);
      if (activeBanners.length >= 4 && createFormData.isActive !== false) {
        toast({
          title: "Error",
          description:
            "Maximum of 4 active banners allowed. Please deactivate an existing banner first.",
          variant: "destructive",
        });
        return;
      }

      // If image file is selected, create banner first, then upload image
      if (createImageFile) {
        setUploadingImage(true);
        // Create banner without imageUrl (service will use placeholder)
        const newBanner = await popularBannersService.create({
          title: createFormData.title || undefined,
          subtitle: createFormData.subtitle || undefined,
          buttonText: createFormData.buttonText || undefined,
          linkUrl: createFormData.linkUrl || undefined,
          isActive: createFormData.isActive,
        });

        // Upload image
        await popularBannersService.uploadImage(
          newBanner.data.id,
          createImageFile
        );

        setUploadingImage(false);
        toast({
          title: "Success",
          description: "Banner created successfully",
        });
        setIsCreateModalOpen(false);
        setCreateImageFile(null);
        setCreateImagePreview("");
        setCreateFormData({
          imageUrl: "",
          title: "",
          subtitle: "",
          buttonText: "",
          linkUrl: "",
          isActive: true,
        });
        await loadBanners();
      } else if (createFormData.imageUrl) {
        // Use provided URL
        await popularBannersService.create({
          imageUrl: createFormData.imageUrl,
          title: createFormData.title || undefined,
          subtitle: createFormData.subtitle || undefined,
          buttonText: createFormData.buttonText || undefined,
          linkUrl: createFormData.linkUrl || undefined,
          isActive: createFormData.isActive,
        });
        toast({
          title: "Success",
          description: "Banner created successfully",
        });
        setIsCreateModalOpen(false);
        setCreateFormData({
          imageUrl: "",
          title: "",
          subtitle: "",
          buttonText: "",
          linkUrl: "",
          isActive: true,
        });
        await loadBanners();
      } else {
        toast({
          title: "Error",
          description: "Please provide an image file or URL",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      setUploadingImage(false);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to create banner",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Edit banner
  const handleEdit = (banner: PopularBanner) => {
    setSelectedBanner(banner);
    setEditFormData({
      title: banner.title || "",
      subtitle: banner.subtitle || "",
      buttonText: banner.buttonText || "",
      linkUrl: banner.linkUrl || "",
      isActive: banner.isActive,
    });
    setEditImagePreview(banner.imageUrl);
    setIsEditModalOpen(true);
  };

  // Save edit
  const handleSaveEdit = async () => {
    if (!selectedBanner) return;

    try {
      setActionLoading(selectedBanner.id);

      // Check if activating would exceed limit
      if (
        editFormData.isActive === true &&
        !selectedBanner.isActive
      ) {
        const activeBanners = banners.filter(
          (b) => b.isActive && b.id !== selectedBanner.id
        );
        if (activeBanners.length >= 4) {
          toast({
            title: "Error",
            description:
              "Maximum of 4 active banners allowed. Please deactivate an existing banner first.",
            variant: "destructive",
          });
          return;
        }
      }

      // If new image file is selected, upload it
      if (editImageFile) {
        setUploadingImage(true);
        await popularBannersService.uploadImage(
          selectedBanner.id,
          editImageFile
        );
        setUploadingImage(false);
      }

      // Update banner data (exclude empty strings for optional fields)
      const updateData: UpdatePopularBannerRequest = {
        title: editFormData.title || undefined,
        subtitle: editFormData.subtitle || undefined,
        buttonText: editFormData.buttonText || undefined,
        linkUrl: editFormData.linkUrl || undefined,
        isActive: editFormData.isActive,
      };
      await popularBannersService.update(selectedBanner.id, updateData);

      toast({
        title: "Success",
        description: "Banner updated successfully",
      });
      setIsEditModalOpen(false);
      setEditImageFile(null);
      setEditImagePreview("");
      setSelectedBanner(null);
      await loadBanners();
    } catch (error: any) {
      setUploadingImage(false);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update banner",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Delete banner
  const handleDelete = async (id: string) => {
    try {
      setActionLoading(id);
      await popularBannersService.delete(id);
      toast({
        title: "Success",
        description: "Banner deleted successfully",
      });
      await loadBanners();
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to delete banner",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Toggle active status
  const handleToggleActive = async (banner: PopularBanner) => {
    try {
      setActionLoading(banner.id);

      // Check if activating would exceed limit
      if (!banner.isActive) {
        const activeBanners = banners.filter(
          (b) => b.isActive && b.id !== banner.id
        );
        if (activeBanners.length >= 4) {
          toast({
            title: "Error",
            description:
              "Maximum of 4 active banners allowed. Please deactivate an existing banner first.",
            variant: "destructive",
          });
          return;
        }
      }

      await popularBannersService.update(banner.id, {
        isActive: !banner.isActive,
      });
      toast({
        title: "Success",
        description: `Banner ${!banner.isActive ? "activated" : "deactivated"}`,
      });
      await loadBanners();
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update banner status",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Reorder banners
  const handleReorder = async (bannerIds: string[]) => {
    try {
      setActionLoading("reorder");
      await popularBannersService.reorder({ bannerIds });
      toast({
        title: "Success",
        description: "Banners reordered successfully",
      });
      await loadBanners();
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to reorder banners",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Move banner up
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newBanners = [...banners];
    [newBanners[index - 1], newBanners[index]] = [
      newBanners[index],
      newBanners[index - 1],
    ];
    const bannerIds = newBanners.map((b) => b.id);
    handleReorder(bannerIds);
  };

  // Move banner down
  const handleMoveDown = (index: number) => {
    if (index === banners.length - 1) return;
    const newBanners = [...banners];
    [newBanners[index], newBanners[index + 1]] = [
      newBanners[index + 1],
      newBanners[index],
    ];
    const bannerIds = newBanners.map((b) => b.id);
    handleReorder(bannerIds);
  };

  const activeBannersCount = banners.filter((b) => b.isActive).length;

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
            Popular Banners
          </h1>
          <p className="text-muted-foreground">
            Manage popular banners for the "Popular Now" section (max 4 active)
          </p>
        </div>
        <Button
          onClick={() => {
            if (activeBannersCount >= 4) {
              toast({
                title: "Error",
                description:
                  "Maximum of 4 active banners allowed. Please deactivate an existing banner first.",
                variant: "destructive",
              });
            } else {
              setIsCreateModalOpen(true);
            }
          }}
          disabled={activeBannersCount >= 4}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Banner
        </Button>
      </div>

      {/* Info Alert */}
      {activeBannersCount >= 4 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You have reached the maximum of 4 active banners. Deactivate a
            banner to add a new one.
          </AlertDescription>
        </Alert>
      )}

      {/* Banners List */}
      <Card>
        <CardHeader>
          <CardTitle>
            All Banners ({banners.length}) - Active: {activeBannersCount}/4
          </CardTitle>
        </CardHeader>
        <CardContent>
          {banners.length === 0 ? (
            <Alert>
              <AlertDescription>
                No banners found. Create your first banner to get started.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {banners.map((banner, index) => (
                <div
                  key={banner.id}
                  className="flex items-center gap-4 p-4 border rounded-lg"
                >
                  {/* Order Badge */}
                  <div className="flex flex-col items-center gap-1">
                    <Badge variant="secondary">#{banner.order}</Badge>
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMoveUp(index)}
                        disabled={
                          actionLoading === banner.id || index === 0
                        }
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMoveDown(index)}
                        disabled={
                          actionLoading === banner.id ||
                          index === banners.length - 1
                        }
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Banner Image */}
                  <div className="w-32 h-20 rounded-lg overflow-hidden border">
                    <img
                      src={banner.imageUrl}
                      alt={banner.title || "Banner"}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Banner Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">
                        {banner.title || "Untitled Banner"}
                      </h3>
                      <Badge
                        variant={banner.isActive ? "default" : "secondary"}
                      >
                        {banner.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    {banner.subtitle && (
                      <p className="text-sm text-muted-foreground">
                        {banner.subtitle}
                      </p>
                    )}
                    {banner.buttonText && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Button: {banner.buttonText}
                      </p>
                    )}
                    {banner.linkUrl && (
                      <p className="text-xs text-muted-foreground">
                        Link: {banner.linkUrl}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={banner.isActive}
                      onCheckedChange={() => handleToggleActive(banner)}
                      disabled={actionLoading === banner.id}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(banner)}
                      disabled={actionLoading === banner.id}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={actionLoading === banner.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Banner</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this banner? This
                            action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(banner.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Popular Banner</DialogTitle>
            <DialogDescription>
              Add a new banner for the "Popular Now" section. Maximum 4 active
              banners allowed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Banner Image *</Label>
              {createImagePreview ? (
                <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                  <img
                    src={createImagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={clearCreateImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <Label
                    htmlFor="create-image-upload"
                    className="cursor-pointer"
                  >
                    <Button variant="outline" asChild>
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Image
                      </span>
                    </Button>
                  </Label>
                  <input
                    id="create-image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCreateImageSelect}
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    Or enter an image URL below
                  </p>
                </div>
              )}
              {!createImagePreview && (
                <Input
                  placeholder="Or enter image URL"
                  value={createFormData.imageUrl}
                  onChange={(e) =>
                    setCreateFormData({
                      ...createFormData,
                      imageUrl: e.target.value,
                    })
                  }
                />
              )}
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="create-title">Title (optional)</Label>
              <Input
                id="create-title"
                placeholder="Banner title"
                value={createFormData.title}
                onChange={(e) =>
                  setCreateFormData({
                    ...createFormData,
                    title: e.target.value,
                  })
                }
              />
            </div>

            {/* Subtitle */}
            <div className="space-y-2">
              <Label htmlFor="create-subtitle">Subtitle (optional)</Label>
              <Textarea
                id="create-subtitle"
                placeholder="Banner subtitle"
                value={createFormData.subtitle}
                onChange={(e) =>
                  setCreateFormData({
                    ...createFormData,
                    subtitle: e.target.value,
                  })
                }
              />
            </div>

            {/* Button Text */}
            <div className="space-y-2">
              <Label htmlFor="create-button-text">Button Text (optional)</Label>
              <Input
                id="create-button-text"
                placeholder="e.g., Explore deals"
                value={createFormData.buttonText}
                onChange={(e) =>
                  setCreateFormData({
                    ...createFormData,
                    buttonText: e.target.value,
                  })
                }
              />
            </div>

            {/* Link URL */}
            <div className="space-y-2">
              <Label htmlFor="create-link-url">Link URL (optional)</Label>
              <Input
                id="create-link-url"
                placeholder="https://example.com"
                value={createFormData.linkUrl}
                onChange={(e) =>
                  setCreateFormData({
                    ...createFormData,
                    linkUrl: e.target.value,
                  })
                }
              />
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between">
              <Label htmlFor="create-active">Active</Label>
              <Switch
                id="create-active"
                checked={createFormData.isActive}
                onCheckedChange={(checked) =>
                  setCreateFormData({
                    ...createFormData,
                    isActive: checked,
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateModalOpen(false);
                setCreateFormData({
                  imageUrl: "",
                  title: "",
                  subtitle: "",
                  buttonText: "",
                  linkUrl: "",
                  isActive: true,
                });
                clearCreateImage();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={
                actionLoading === "create" ||
                uploadingImage ||
                (!createImageFile && !createFormData.imageUrl)
              }
            >
              {actionLoading === "create" || uploadingImage
                ? "Creating..."
                : "Create Banner"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Popular Banner</DialogTitle>
            <DialogDescription>
              Update banner details and image.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Banner Image</Label>
              {editImagePreview ? (
                <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                  <img
                    src={editImagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={clearEditImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <Label htmlFor="edit-image-upload" className="cursor-pointer">
                    <Button variant="outline" asChild>
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload New Image
                      </span>
                    </Button>
                  </Label>
                  <input
                    id="edit-image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleEditImageSelect}
                  />
                </div>
              )}
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title (optional)</Label>
              <Input
                id="edit-title"
                placeholder="Banner title"
                value={editFormData.title || ""}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    title: e.target.value,
                  })
                }
              />
            </div>

            {/* Subtitle */}
            <div className="space-y-2">
              <Label htmlFor="edit-subtitle">Subtitle (optional)</Label>
              <Textarea
                id="edit-subtitle"
                placeholder="Banner subtitle"
                value={editFormData.subtitle || ""}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    subtitle: e.target.value,
                  })
                }
              />
            </div>

            {/* Button Text */}
            <div className="space-y-2">
              <Label htmlFor="edit-button-text">Button Text (optional)</Label>
              <Input
                id="edit-button-text"
                placeholder="e.g., Explore deals"
                value={editFormData.buttonText || ""}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    buttonText: e.target.value,
                  })
                }
              />
            </div>

            {/* Link URL */}
            <div className="space-y-2">
              <Label htmlFor="edit-link-url">Link URL (optional)</Label>
              <Input
                id="edit-link-url"
                placeholder="https://example.com"
                value={editFormData.linkUrl || ""}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    linkUrl: e.target.value,
                  })
                }
              />
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between">
              <Label htmlFor="edit-active">Active</Label>
              <Switch
                id="edit-active"
                checked={editFormData.isActive ?? true}
                onCheckedChange={(checked) =>
                  setEditFormData({
                    ...editFormData,
                    isActive: checked,
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditModalOpen(false);
                setSelectedBanner(null);
                setEditFormData({});
                clearEditImage();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={
                actionLoading === selectedBanner?.id || uploadingImage
              }
            >
              {actionLoading === selectedBanner?.id || uploadingImage
                ? "Saving..."
                : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

