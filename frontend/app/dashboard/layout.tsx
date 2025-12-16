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
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import InsightsIcon from "@mui/icons-material/Insights";
import LogoutIcon from "@mui/icons-material/Logout";
import { usePathname, useRouter } from "next/navigation";

const drawerWidth = 220;

const navItems = [
  { label: "Overview", icon: <DashboardIcon fontSize="small" />, href: "/dashboard" },
  { label: "Products", icon: <Inventory2Icon fontSize="small" />, href: "/dashboard/products" },
  { label: "Users", icon: <PeopleAltIcon fontSize="small" />, href: "/dashboard/users" },
  { label: "Invoices", icon: <ReceiptLongIcon fontSize="small" />, href: "/dashboard/invoices" },
  { label: "Reports", icon: <InsightsIcon fontSize="small" />, href: "/dashboard/reports" },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = window.localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
    }
  }, [router]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("token");
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
          backdropFilter: "blur(16px)",
          backgroundColor: "rgba(248,249,251,0.9)",
          borderBottom: "1px solid rgba(15,23,42,0.06)",
        }}
      >
        <Toolbar sx={{ minHeight: 64 }}>
          <Typography variant="h6" color="text.primary" sx={{ flexGrow: 1, fontWeight: 600 }}>
            OOP Shop Manager
          </Typography>
          <IconButton color="inherit" size="small" onClick={handleLogout}>
            <LogoutIcon fontSize="small" />
          </IconButton>
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
            borderRight: "1px solid rgba(15,23,42,0.06)",
            backgroundColor: "rgba(248,249,251,0.9)",
            backdropFilter: "blur(20px)",
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: "auto", mt: 1 }}>
          <List dense>
            {navItems.map((item) => (
              <ListItemButton
                key={item.href}
                onClick={() => router.push(item.href)}
                selected={pathname === item.href}
                sx={{
                  mx: 1.5,
                  mb: 0.5,
                  borderRadius: 999,
                }}
              >
                {item.icon}
                <ListItemText primary={item.label} sx={{ ml: 1 }} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          pl: 3,
          mt: 8,
          ml: `${drawerWidth}px`,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}


