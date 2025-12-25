"use client";

import { ReactNode, useEffect, useState } from "react";
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  alpha,
  Avatar,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import ReceiptIcon from "@mui/icons-material/Receipt";
import SettingsIcon from "@mui/icons-material/Settings";
import StoreIcon from "@mui/icons-material/Store";
import { usePathname, useRouter } from "next/navigation";
import { STORAGE_KEYS } from "@/lib/config/api.config";
import UserProfileMenu from "@/components/shared/UserProfileMenu";
import AccountFooter from "@/components/shared/AccountFooter";

const drawerWidth = 260;

const navItems = [
  { label: "Overview", icon: PersonIcon, href: "/account" },
  { label: "Order History", icon: ReceiptIcon, href: "/account/orders" },
  { label: "Current Orders", icon: ShoppingBagIcon, href: "/account/orders/current" },
  { label: "Profile Settings", icon: SettingsIcon, href: "/account/settings" },
];

export default function AccountLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = window.localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (!token) {
      router.replace("/signin");
      return;
    }

    const userData = window.localStorage.getItem(STORAGE_KEYS.USER_DATA);
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error("Failed to parse user data", e);
      }
    }
  }, [router]);

  const getInitials = () => {
    if (!user) return "U";
    const first = user.first_name?.[0]?.toUpperCase() || "";
    const last = user.last_name?.[0]?.toUpperCase() || "";
    return first + last || user.email[0]?.toUpperCase() || "U";
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", bgcolor: "#fafafa" }}>
      <CssBaseline />
      <Box sx={{ display: "flex", flex: 1 }}>
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
        <Toolbar sx={{ minHeight: 70, px: 3, justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: "#667eea",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                cursor: "pointer",
              }}
              onClick={() => router.push("/")}
            >
              <StoreIcon />
            </Box>
            <Box>
              <Typography variant="h6" color="text.primary" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                My Account
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>
                Customer Portal
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <UserProfileMenu />
          </Box>
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
            bgcolor: "white",
            pt: 9,
          },
        }}
      >
        {/* User Profile Card in Sidebar */}
        {user && (
          <Box
            sx={{
              p: 3,
              borderBottom: "1px solid",
              borderColor: "divider",
              mb: 1,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  bgcolor: "#667eea",
                  color: "white",
                  fontSize: "1.25rem",
                  fontWeight: 600,
                }}
              >
                {getInitials()}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 600,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {user.first_name} {user.last_name}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    display: "block",
                  }}
                >
                  {user.email}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}

        {/* Navigation Items */}
        <List sx={{ px: 2, py: 1 }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            // Handle active state: exact match for overview, prefix match for others
            const isActive = 
              item.href === "/account" 
                ? pathname === "/account" 
                : pathname?.startsWith(item.href);
            return (
              <ListItemButton
                key={item.href}
                onClick={() => router.push(item.href)}
                selected={isActive}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  "&.Mui-selected": {
                    bgcolor: alpha("#667eea", 0.1),
                    color: "#667eea",
                    "&:hover": {
                      bgcolor: alpha("#667eea", 0.15),
                    },
                    "& .MuiListItemIcon-root": {
                      color: "#667eea",
                    },
                  },
                  "&:hover": {
                    bgcolor: alpha("#667eea", 0.05),
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: isActive ? "#667eea" : "text.secondary",
                  }}
                >
                  <Icon />
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 500,
                    fontSize: "0.9375rem",
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Drawer>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            p: 3,
            mt: 8.75,
            ml: `${10}px`,
            bgcolor: "#fafafa",
          }}
        >
          <Box sx={{ flex: 1 }}>
            {children}
          </Box>
          <AccountFooter />
        </Box>
      </Box>
    </Box>
  );
}

