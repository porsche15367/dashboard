"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  LayoutDashboard,
  Users,
  Store,
  Package,
  ShoppingCart,
  Tag,
  BarChart3,
  Settings,
  Menu,
  X,
  UserCheck,
  Building2,
  ShoppingBag,
  FileText,
  Percent,
  FolderOpen,
  TrendingUp,
  Star,
  Image as ImageIcon,
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    name: "Users",
    href: "/dashboard/users",
    icon: Users,
    children: [
      { name: "All Users", href: "/dashboard/users" },
      { name: "Suspended", href: "/dashboard/users/suspended" },
      { name: "Blocked", href: "/dashboard/users/blocked" },
    ],
  },
  {
    name: "Sellers",
    href: "/dashboard/sellers",
    icon: Store,
    children: [
      { name: "All Sellers", href: "/dashboard/sellers" },
      { name: "Pending Approval", href: "/dashboard/sellers/pending" },
      { name: "Approved", href: "/dashboard/sellers/approved" },
    ],
  },
  {
    name: "Products",
    href: "/dashboard/products",
    icon: Package,
  },
  {
    name: "Featured Products",
    href: "/dashboard/featured-products",
    icon: Star,
  },
  {
    name: "Popular Banners",
    href: "/dashboard/popular-banners",
    icon: ImageIcon,
  },
  {
    name: "Orders",
    href: "/dashboard/orders",
    icon: ShoppingCart,
  },
  {
    name: "Coupons",
    href: "/dashboard/coupons",
    icon: Percent,
  },
  {
    name: "Categories",
    href: "/dashboard/categories",
    icon: FolderOpen,
  },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (itemName: string) => {
    setOpenItems((prev) =>
      prev.includes(itemName)
        ? prev.filter((item) => item !== itemName)
        : [...prev, itemName]
    );
  };

  return (
    <div className={cn("flex h-full flex-col", className)}>
      <div className="flex-1 space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            {navigation.map((item) => (
              <div key={item.name}>
                {item.children ? (
                  <div>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      onClick={() => toggleItem(item.name)}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      <span className="font-medium">{item.name}</span>
                    </Button>
                    {openItems.includes(item.name) && (
                      <div className="ml-6 space-y-1">
                        {item.children.map((child) => (
                          <Button
                            key={child.name}
                            variant="ghost"
                            className="w-full justify-start text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                            asChild
                          >
                            <Link
                              href={child.href}
                              className={cn(
                                "w-full text-left",
                                pathname === child.href
                                  ? "bg-blue-50 text-blue-700 font-medium"
                                  : "text-gray-600 hover:text-gray-900"
                              )}
                            >
                              {child.name}
                            </Link>
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    asChild
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        "w-full flex items-center",
                        pathname === item.href
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "text-gray-700 hover:text-gray-900"
                      )}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (itemName: string) => {
    setOpenItems((prev) =>
      prev.includes(itemName)
        ? prev.filter((item) => item !== itemName)
        : [...prev, itemName]
    );
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="shrink-0 lg:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col w-64">
        <SheetHeader className="sr-only">
          <SheetTitle>Navigation Menu</SheetTitle>
        </SheetHeader>
        <div className="flex items-center gap-2 px-4 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <ShoppingCart className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              Marketplace Admin
            </h1>
            <p className="text-xs text-gray-500">Management Dashboard</p>
          </div>
        </div>
        <ScrollArea className="flex-1 -mx-2">
          <div className="space-y-1 px-2">
            {navigation.map((item) => (
              <div key={item.name}>
                {item.children ? (
                  <div>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      onClick={() => toggleItem(item.name)}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      <span className="font-medium">{item.name}</span>
                    </Button>
                    {openItems.includes(item.name) && (
                      <div className="ml-6 space-y-1">
                        {item.children.map((child) => (
                          <Button
                            key={child.name}
                            variant="ghost"
                            className="w-full justify-start text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                            asChild
                          >
                            <Link
                              href={child.href}
                              className={cn(
                                "w-full text-left",
                                pathname === child.href
                                  ? "bg-blue-50 text-blue-700 font-medium"
                                  : "text-gray-600 hover:text-gray-900"
                              )}
                              onClick={() => setOpen(false)}
                            >
                              {child.name}
                            </Link>
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    asChild
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        "w-full flex items-center",
                        pathname === item.href
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "text-gray-700 hover:text-gray-900"
                      )}
                      onClick={() => setOpen(false)}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  </Button>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
