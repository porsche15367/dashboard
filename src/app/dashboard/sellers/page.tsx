"use client";

import { useState, useEffect } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Search,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { sellerService } from "@/lib/api-services";
import { Seller } from "@/types";
import { useToast } from "@/hooks/use-toast";

export default function SellersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    businessName: "",
    businessDescription: "",
    address: "",
    taxId: "",
  });
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const {
    data: sellers,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["sellers"],
    queryFn: () => sellerService.getAll().then((res) => res.data),
  });

  const filteredSellers =
    sellers?.filter(
      (seller) =>
        seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seller.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seller.email.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const handleApprove = async (sellerId: string) => {
    try {
      setActionLoading(sellerId);
      await sellerService.approve(sellerId);
      toast({
        title: "Success",
        description: "Seller approved successfully",
      });
      refetch();
    } catch (error: unknown) {
      console.error("Failed to approve seller:", error);
      toast({
        title: "Error",
        description: "Failed to approve seller. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (sellerId: string) => {
    try {
      setActionLoading(sellerId);
      await sellerService.reject(sellerId);
      toast({
        title: "Success",
        description: "Seller rejected successfully",
      });
      refetch();
    } catch (error: unknown) {
      console.error("Failed to reject seller:", error);
      toast({
        title: "Error",
        description: "Failed to reject seller. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (sellerId: string) => {
    try {
      setActionLoading(sellerId);
      await sellerService.delete(sellerId);
      toast({
        title: "Success",
        description: "Seller deleted successfully",
      });
      refetch();
    } catch (error: unknown) {
      console.error("Failed to delete seller:", error);
      toast({
        title: "Error",
        description: "Failed to delete seller. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewSeller = (seller: Seller) => {
    setSelectedSeller(seller);
    setIsViewModalOpen(true);
  };

  const handleEditSeller = (seller: Seller) => {
    setSelectedSeller(seller);
    setEditFormData({
      name: seller.name,
      businessName: seller.businessName,
      businessDescription: seller.businessDescription || "",
      address: seller.address || "",
      taxId: seller.taxId || "",
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedSeller) return;

    try {
      setActionLoading(selectedSeller.id);
      await sellerService.update(selectedSeller.id, editFormData);
      toast({
        title: "Success",
        description: "Seller updated successfully",
      });
      setIsEditModalOpen(false);
      refetch();
    } catch (error: unknown) {
      console.error("Failed to update seller:", error);
      toast({
        title: "Error",
        description: "Failed to update seller. Please try again.",
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
          Failed to load sellers. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sellers</h1>
          <p className="text-muted-foreground">
            Manage sellers and their approval status
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sellers..."
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
            <CardTitle className="text-sm font-medium">Total Sellers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sellers?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sellers?.filter((v) => v.isApproved).length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sellers?.filter((v) => !v.isApproved).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sellers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Seller List</CardTitle>
          <CardDescription>
            A list of all sellers in the marketplace
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[160px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Seller</TableHead>
                  <TableHead>Business</TableHead>
                  <TableHead>Categories</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Sales</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSellers.map((seller) => (
                  <TableRow key={seller.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={seller.avatarUrl}
                            alt={seller.name}
                          />
                          <AvatarFallback>
                            {seller.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{seller.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {seller.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{seller.businessName}</div>
                        <div className="text-sm text-muted-foreground">
                          {seller.businessDescription}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {seller.categories?.map((cat) => (
                          <Badge key={cat.id} variant="outline">
                            {cat.name}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col space-y-1">
                        <Badge
                          variant={seller.isApproved ? "default" : "secondary"}
                        >
                          {seller.isApproved ? "Approved" : "Pending"}
                        </Badge>
                        {seller.isVerified && (
                          <Badge variant="outline" className="text-xs">
                            Verified
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span className="text-sm font-medium">
                          {seller.rating.toFixed(1)}
                        </span>
                        <span className="text-xs text-muted-foreground ml-1">
                          ⭐
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">
                        {seller.totalSales.toLocaleString()}
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
                            onClick={() => handleViewSeller(seller)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEditSeller(seller)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {!seller.isApproved ? (
                            <DropdownMenuItem
                              onClick={() => handleApprove(seller.id)}
                              disabled={actionLoading === seller.id}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Approve
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => handleReject(seller.id)}
                              disabled={actionLoading === seller.id}
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Reject
                            </DropdownMenuItem>
                          )}
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
                                  permanently delete the seller and remove all
                                  their data from our servers.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(seller.id)}
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

      {/* Seller View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Seller Details</DialogTitle>
            <DialogDescription>
              View detailed information about this seller
            </DialogDescription>
          </DialogHeader>

          {selectedSeller && (
            <div className="space-y-6">
              {/* Seller Avatar and Basic Info */}
              <div className="flex items-start space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={selectedSeller.avatarUrl} />
                  <AvatarFallback className="text-lg">
                    {selectedSeller.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">{selectedSeller.name}</h3>
                  <p className="text-lg text-muted-foreground">
                    {selectedSeller.businessName}
                  </p>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={
                        selectedSeller.isApproved ? "default" : "secondary"
                      }
                    >
                      {selectedSeller.isApproved
                        ? "Approved"
                        : "Pending Approval"}
                    </Badge>
                    <Badge
                      variant={
                        selectedSeller.isVerified ? "default" : "outline"
                      }
                    >
                      {selectedSeller.isVerified ? "Verified" : "Unverified"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Business Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Contact Information
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium">Email:</span>
                      <p className="text-muted-foreground">
                        {selectedSeller.email}
                      </p>
                    </div>
                    {selectedSeller.phone && (
                      <div>
                        <span className="font-medium">Phone:</span>
                        <p className="text-muted-foreground">
                          {selectedSeller.phone}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Business Details
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium">Business Name:</span>
                      <p className="text-muted-foreground">
                        {selectedSeller.businessName}
                      </p>
                    </div>
                    {selectedSeller.businessDescription && (
                      <div>
                        <span className="font-medium">Description:</span>
                        <p className="text-muted-foreground">
                          {selectedSeller.businessDescription}
                        </p>
                      </div>
                    )}
                    {selectedSeller.address && (
                      <div>
                        <span className="font-medium">Address:</span>
                        <p className="text-muted-foreground">
                          {selectedSeller.address}
                        </p>
                      </div>
                    )}
                    {selectedSeller.taxId && (
                      <div>
                        <span className="font-medium">Tax ID:</span>
                        <p className="text-muted-foreground">
                          {selectedSeller.taxId}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Performance Metrics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedSeller.rating.toFixed(1)}
                    </div>
                    <div className="text-sm text-muted-foreground">Rating</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {selectedSeller.totalSales}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Sales
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {selectedSeller.categories?.length || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Categories
                    </div>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Account Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium">Joined:</span>
                    <p className="text-muted-foreground">
                      {new Date(selectedSeller.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Last Updated:</span>
                    <p className="text-muted-foreground">
                      {new Date(selectedSeller.updatedAt).toLocaleString()}
                    </p>
                  </div>
                  {selectedSeller.lastLogin && (
                    <div>
                      <span className="font-medium">Last Login:</span>
                      <p className="text-muted-foreground">
                        {new Date(selectedSeller.lastLogin).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Seller Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Seller</DialogTitle>
            <DialogDescription>Update the seller information</DialogDescription>
          </DialogHeader>

          {selectedSeller && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Seller Name</Label>
                  <Input
                    id="edit-name"
                    value={editFormData.name}
                    onChange={(e) =>
                      setEditFormData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="Enter seller name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-business">Business Name</Label>
                  <Input
                    id="edit-business"
                    value={editFormData.businessName}
                    onChange={(e) =>
                      setEditFormData((prev) => ({
                        ...prev,
                        businessName: e.target.value,
                      }))
                    }
                    placeholder="Enter business name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Business Description</Label>
                <Textarea
                  id="edit-description"
                  value={editFormData.businessDescription}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      businessDescription: e.target.value,
                    }))
                  }
                  placeholder="Enter business description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-address">Address</Label>
                  <Input
                    id="edit-address"
                    value={editFormData.address}
                    onChange={(e) =>
                      setEditFormData((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                    placeholder="Enter business address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-tax">Tax ID</Label>
                  <Input
                    id="edit-tax"
                    value={editFormData.taxId}
                    onChange={(e) =>
                      setEditFormData((prev) => ({
                        ...prev,
                        taxId: e.target.value,
                      }))
                    }
                    placeholder="Enter tax ID"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={actionLoading === selectedSeller.id}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  disabled={actionLoading === selectedSeller.id}
                >
                  {actionLoading === selectedSeller.id
                    ? "Saving..."
                    : "Save Changes"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
