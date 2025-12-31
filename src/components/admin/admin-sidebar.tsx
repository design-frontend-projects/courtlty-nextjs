"use client";

import {
  CreditCard,
  LayoutDashboard,
  PlusCircle,
  Trophy,
  User,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";

// Menu items.
const items = [
  {
    title: "Bookings",
    url: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Create Booking",
    url: "/admin/bookings/new",
    icon: PlusCircle,
  },
  {
    title: "Courts",
    url: "/admin/courts",
    icon: Trophy,
  },
  {
    title: "Payments",
    url: "/admin/payments",
    icon: CreditCard,
  },
];

const accountItems = [
  {
    title: "Profile",
    url: "/admin/profile",
    icon: User,
  },
  {
    title: "Settings",
    url: "/admin/settings",
    icon: Settings,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b">
        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-600">
          Courtly Admin
        </h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
