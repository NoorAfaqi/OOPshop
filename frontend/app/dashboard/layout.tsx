"use client";

import { ReactNode, useEffect } from "react";
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Divider,
  alpha,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import InsightsIcon from "@mui/icons-material/Insights";
import PaymentIcon from "@mui/icons-material/Payment";
import UserProfileMenu from "@/components/shared/UserProfileMenu";
import StoreIcon from "@mui/icons-material/Store";
import { usePathname, useRouter } from "next/navigation";
import { STORAGE_KEYS } from "@/lib/config/api.config";

const drawerWidth = 260;

const navItems = [
  { label: "Overview", icon: DashboardIcon, href: "/dashboard" },
  { label: "Products", icon: Inventory2Icon, href: "/dashboard/products" },
  { label: "Users", icon: PeopleAltIcon, href: "/dashboard/users" },
  { label: "Invoices", icon: ReceiptLongIcon, href: "/dashboard/invoices" },
  { label: "Reports", icon: InsightsIcon, href: "/dashboard/reports" },
  { label: "Payments", icon: PaymentIcon, href: "/dashboard/payments" },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = window.localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (!token) {
      router.replace("/login");
    }
  }, [router]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      window.localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    }
    router.replace("/login");
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backdropFilter: "blur(20px)",
          backgroundColor: alpha("#ffffff", 0.8),
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Toolbar sx={{ minHeight: 70, px: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexGrow: 1 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: "primary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
              }}
            >
              <StoreIcon />
            </Box>
            <Box>
              <Typography variant="h6" color="text.primary" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                OOP Shop Manager
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>
                Management Portal
              </Typography>
            </Box>
          </Box>
          <UserProfileMenu />
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            borderRight: "1px solid",
            borderColor: "divider",
            backgroundColor: "#fafbfc",
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: "auto", px: 2, py: 2 }}>
          <List disablePadding>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isSelected = pathname === item.href;
              return (
                <ListItemButton
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  selected={isSelected}
                  sx={{
                    mb: 0.5,
                    borderRadius: 2,
                    py: 1.25,
                    px: 2,
                    "&.Mui-selected": {
                      bgcolor: "primary.main",
                      color: "white",
                      "&:hover": {
                        bgcolor: "primary.dark",
                      },
                      "& .MuiListItemIcon-root": {
                        color: "white",
                      },
                    },
                    "&:hover": {
                      bgcolor: alpha("#000", 0.04),
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 40,
                      color: isSelected ? "white" : "text.secondary",
                    }}
                  >
                    <Icon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontWeight: isSelected ? 600 : 500,
                      fontSize: "0.9375rem",
                    }}
                  />
                </ListItemButton>
              );
            })}
          </List>
        </Box>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 2,
          mt: 8.75,
          ml: `${10}px`,
          minHeight: "calc(100vh - 70px)",
          bgcolor: "#f8f9fa",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}


