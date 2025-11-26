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
  Store,
} from "lucide-react";
import { sellerService } from "@/lib/api-services";
import { Seller } from "@/types";

export default function ApprovedSellersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const {
    data: sellers,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["sellers", "approved"],
    queryFn: () => sellerService.getAll().then((res) => res.data),
  });

  // Filter for approved sellers
  const approvedSellers = sellers?.filter((seller) => seller.status === 'APPROVED') || [];
  const filteredSellers = approvedSellers.filter(
    (seller) =>
      seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleReject = async (sellerId: string) => {
    try {
      setActionLoading(sellerId);
      await sellerService.reject(sellerId);
      refetch();
    } catch (error) {
      console.error("Failed to reject seller:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (sellerId: string) => {
    try {
      setActionLoading(sellerId);
      await sellerService.delete(sellerId);
      refetch();
    } catch (error) {
      console.error("Failed to delete seller:", error);
    } finally {
      setActionLoading(null);
    }
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load approved sellers. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Approved Sellers
          </h1>
          <p className="text-muted-foreground">
            Manage approved seller accounts
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search approved sellers..."
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
              Approved Sellers
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedSellers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sellers?.filter((v) => v.status !== 'APPROVED').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sellers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sellers?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Sellers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Approved Sellers List</CardTitle>
          <CardDescription>A list of all approved sellers</CardDescription>
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
                        <Badge variant="default">Approved</Badge>
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
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleReject(seller.id)}
                            disabled={actionLoading === seller.id}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
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
    </div>
  );
}
