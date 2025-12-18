"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  Container,
  Typography,
  AppBar,
  Toolbar,
  alpha,
  Grid,
  Paper,
  Chip,
  Divider,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import StoreIcon from "@mui/icons-material/Store";
import PersonIcon from "@mui/icons-material/Person";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import LogoutIcon from "@mui/icons-material/Logout";
import { useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: string;
}

interface Invoice {
  id: number;
  total_amount: number;
  status: string;
  created_at: string;
  items?: string;
}

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Check if authenticated
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("auth_token")
            : null;

        if (!token) {
          router.push("/signin");
          return;
        }

        // Load user data from localStorage
        const userData =
          typeof window !== "undefined"
            ? localStorage.getItem("user_data")
            : null;

        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);

          // Load user's invoices
          const res = await fetch(
            `${API_BASE}/users/${parsedUser.id}/invoices`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (res.ok) {
            const data = await res.json();
            setInvoices(data.data || data);
          }
        } else {
          router.push("/signin");
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [router]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_data");
    }
    router.push("/");
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress sx={{ color: "#667eea" }} />
      </Box>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#fafafa" }}>
      {/* Navigation */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: alpha("#ffffff", 0.8),
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              cursor: "pointer",
            }}
            onClick={() => router.push("/")}
          >
            <StoreIcon sx={{ fontSize: 28, color: "#1a1a1a" }} />
            <Typography
              variant="h6"
              sx={{
                color: "#1a1a1a",
                fontWeight: 600,
                letterSpacing: "-0.5px",
              }}
            >
              OOPshop
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              onClick={() => router.push("/shop")}
              sx={{
                color: "#1a1a1a",
                textTransform: "none",
                fontSize: "15px",
                fontWeight: 500,
                px: 2,
                "&:hover": { bgcolor: alpha("#000", 0.05) },
              }}
            >
              Shop
            </Button>
            <Button
              onClick={handleLogout}
              startIcon={<LogoutIcon />}
              sx={{
                color: "#1a1a1a",
                textTransform: "none",
                fontSize: "15px",
                fontWeight: 500,
                px: 2,
                "&:hover": { bgcolor: alpha("#000", 0.05) },
              }}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Profile Header */}
        <Card
          elevation={0}
          sx={{
            p: 4,
            mb: 4,
            borderRadius: "16px",
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "white",
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: "20px",
                  bgcolor: alpha("#667eea", 0.1),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <PersonIcon sx={{ fontSize: 40, color: "#667eea" }} />
              </Box>
            </Grid>
            <Grid item xs>
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, mb: 0.5, letterSpacing: "-1px" }}
              >
                {user.first_name} {user.last_name}
              </Typography>
              <Typography variant="body1" sx={{ color: "text.secondary" }}>
                {user.email}
              </Typography>
              {user.phone && (
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {user.phone}
                </Typography>
              )}
            </Grid>
            <Grid item>
              <Chip
                label={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                sx={{
                  bgcolor: alpha("#667eea", 0.1),
                  color: "#667eea",
                  fontWeight: 600,
                  borderRadius: "8px",
                }}
              />
            </Grid>
          </Grid>
        </Card>

        {/* Orders Section */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: "16px",
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "white",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 3,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <ShoppingBagIcon sx={{ fontSize: 28, color: "#667eea" }} />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Your Orders
              </Typography>
            </Box>
            <Button
              variant="contained"
              onClick={() => router.push("/shop")}
              sx={{
                bgcolor: "#667eea",
                textTransform: "none",
                borderRadius: "10px",
                px: 3,
                "&:hover": {
                  bgcolor: "#5568d3",
                },
              }}
            >
              Continue Shopping
            </Button>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {invoices.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <ShoppingBagIcon
                sx={{ fontSize: 60, color: "#d0d0d0", mb: 2 }}
              />
              <Typography
                variant="h6"
                sx={{ color: "text.secondary", mb: 1 }}
              >
                No orders yet
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Start shopping to see your orders here
              </Typography>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Order ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Items</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Total</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>#{invoice.id}</TableCell>
                    <TableCell>
                      {new Date(invoice.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {invoice.items || "Multiple items"}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      €{Number(invoice.total_amount).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={invoice.status.toUpperCase()}
                        size="small"
                        sx={{
                          bgcolor:
                            invoice.status === "paid"
                              ? alpha("#4caf50", 0.1)
                              : invoice.status === "pending"
                              ? alpha("#ff9800", 0.1)
                              : alpha("#f44336", 0.1),
                          color:
                            invoice.status === "paid"
                              ? "#4caf50"
                              : invoice.status === "pending"
                              ? "#ff9800"
                              : "#f44336",
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
