"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Card,
  Typography,
  Paper,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  alpha,
} from "@mui/material";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import { useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Invoice {
  id: number;
  total_amount: number;
  status: string;
  created_at: string;
  items?: string;
}

export default function CurrentOrdersPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCurrentOrders = async () => {
      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("auth_token")
            : null;

        if (!token) {
          router.push("/signin");
          return;
        }

        // Use account/orders/current endpoint
        const res = await fetch(
          `${API_BASE}/account/orders/current`,
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
        console.error("Error loading current orders:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCurrentOrders();
  }, [router]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "400px",
        }}
      >
        <CircularProgress sx={{ color: "#667eea" }} />
      </Box>
    );
  }

  return (
    <Box>
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
          <ShoppingBagIcon sx={{ fontSize: 28, color: "#667eea" }} />
          <Typography variant="h5" fontWeight={600}>
            Current Orders
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Track your active and pending orders
        </Typography>
      </Card>

      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "white",
          overflow: "hidden",
        }}
      >
        {invoices.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <ShoppingBagIcon sx={{ fontSize: 60, color: "#d0d0d0", mb: 2 }} />
            <Typography variant="h6" sx={{ color: "text.secondary", mb: 1 }}>
              No active orders
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              You don't have any pending or processing orders at the moment
            </Typography>
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha("#667eea", 0.05) }}>
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
                <TableRow key={invoice.id} hover>
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
                        bgcolor: alpha("#ff9800", 0.1),
                        color: "#ff9800",
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

