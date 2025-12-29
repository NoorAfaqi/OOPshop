"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  Typography,
  alpha,
  Paper,
  Chip,
  Divider,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Avatar,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import { useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: string;
  profile_picture_url?: string;
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

        // Fetch user data from account/me endpoint
        const userRes = await fetch(`${API_BASE}/account/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (userRes.ok) {
          const userData = await userRes.json();
          const user = userData.data || userData;
          setUser(user);
          
          // Update localStorage with fresh data
          if (typeof window !== "undefined") {
            localStorage.setItem("user_data", JSON.stringify(user));
          }
        } else {
          // Fallback to localStorage if API fails
          const userData =
            typeof window !== "undefined"
              ? localStorage.getItem("user_data")
              : null;

          if (userData) {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
          } else {
            router.push("/signin");
            return;
          }
        }

        // Load user's orders using account endpoint
        const res = await fetch(
          `${API_BASE}/account/orders`,
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
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [router]);


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
    <Box>
        {/* Profile Header */}
        <Card
          elevation={0}
          sx={{
            p: 3,
            mb: 2,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "white",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "flex-start", sm: "center" },
              gap: 3,
            }}
          >
            {user.profile_picture_url ? (
              <Avatar
                src={user.profile_picture_url}
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: "20px",
                  flexShrink: 0,
                }}
              />
            ) : (
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: "20px",
                  bgcolor: alpha("#667eea", 0.1),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <PersonIcon sx={{ fontSize: 40, color: "#667eea" }} />
              </Box>
            )}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="h5"
                sx={{ fontWeight: 600, mb: 0.5 }}
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
            </Box>
            <Box sx={{ flexShrink: 0 }}>
              <Chip
                label={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                sx={{
                  bgcolor: alpha("#667eea", 0.1),
                  color: "#667eea",
                  fontWeight: 600,
                  borderRadius: "8px",
                }}
              />
            </Box>
          </Box>
        </Card>

        {/* Orders Section */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 2,
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
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
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
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
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
                              : invoice.status === "shipped"
                              ? alpha("#2196f3", 0.1)
                              : invoice.status === "pending"
                              ? alpha("#ff9800", 0.1)
                              : alpha("#f44336", 0.1),
                          color:
                            invoice.status === "paid"
                              ? "#4caf50"
                              : invoice.status === "shipped"
                              ? "#2196f3"
                              : invoice.status === "pending"
                              ? "#ff9800"
                              : "#f44336",
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        onClick={() => router.push(`/account/orders/${invoice.id}`)}
                        sx={{ textTransform: "none" }}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Paper>
    </Box>
  );
}
