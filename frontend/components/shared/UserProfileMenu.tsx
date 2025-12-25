"use client";

import { useState, useEffect } from "react";
import {
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Divider,
  alpha,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useRouter } from "next/navigation";
import { STORAGE_KEYS } from "@/lib/config/api.config";

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
}

export default function UserProfileMenu() {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const loadUser = () => {
      if (typeof window !== "undefined") {
        const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
        if (userData) {
          try {
            setUser(JSON.parse(userData));
          } catch (e) {
            console.error("Failed to parse user data", e);
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
    };
    loadUser();

    // Listen for storage changes (e.g., when user signs in/out in another tab)
    window.addEventListener("storage", loadUser);
    // Also listen for custom events for same-tab updates
    const handleAuthChange = () => loadUser();
    window.addEventListener("authChanged", handleAuthChange);
    
    return () => {
      window.removeEventListener("storage", loadUser);
      window.removeEventListener("authChanged", handleAuthChange);
    };
  }, []);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      localStorage.removeItem(STORAGE_KEYS.CART);
      // Dispatch event to update auth state in other components
      window.dispatchEvent(new Event("authChanged"));
    }
    handleClose();
    router.push("/");
  };

  const handleDashboard = () => {
    handleClose();
    router.push("/dashboard");
  };

  const handleAccount = () => {
    handleClose();
    router.push("/account");
  };

  if (!mounted || !user) {
    return null;
  }

  const getInitials = () => {
    const first = user.first_name?.[0]?.toUpperCase() || "";
    const last = user.last_name?.[0]?.toUpperCase() || "";
    return first + last || user.email[0]?.toUpperCase() || "U";
  };

  const isManager = user.role === "admin" || user.role === "manager";

  return (
    <>
      <IconButton
        onClick={handleClick}
        sx={{
          p: 0.5,
          "&:hover": {
            bgcolor: alpha("#667eea", 0.1),
          },
        }}
      >
        <Avatar
          sx={{
            width: 36,
            height: 36,
            bgcolor: "#667eea",
            color: "white",
            fontSize: "0.875rem",
            fontWeight: 600,
          }}
        >
          {getInitials()}
        </Avatar>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 200,
            borderRadius: 2,
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
            {user.first_name} {user.last_name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {user.email}
          </Typography>
        </Box>
        <Divider />
        {isManager && (
          <MenuItem
            onClick={handleDashboard}
            sx={{
              py: 1.5,
              "&:hover": {
                bgcolor: alpha("#667eea", 0.08),
              },
            }}
          >
            <DashboardIcon sx={{ mr: 1.5, fontSize: 20, color: "text.secondary" }} />
            <Typography variant="body2">Dashboard</Typography>
          </MenuItem>
        )}
        {!isManager && (
          <MenuItem
            onClick={handleAccount}
            sx={{
              py: 1.5,
              "&:hover": {
                bgcolor: alpha("#667eea", 0.08),
              },
            }}
          >
            <AccountCircleIcon sx={{ mr: 1.5, fontSize: 20, color: "text.secondary" }} />
            <Typography variant="body2">My Account</Typography>
          </MenuItem>
        )}
        <Divider />
        <MenuItem
          onClick={handleLogout}
          sx={{
            py: 1.5,
            color: "error.main",
            "&:hover": {
              bgcolor: alpha("#d32f2f", 0.08),
            },
          }}
        >
          <LogoutIcon sx={{ mr: 1.5, fontSize: 20 }} />
          <Typography variant="body2">Sign Out</Typography>
        </MenuItem>
      </Menu>
    </>
  );
}

