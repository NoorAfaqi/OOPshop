"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  Container,
  Typography,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  AppBar,
  Toolbar,
  alpha,
} from "@mui/material";
import { useRouter, useParams } from "next/navigation";
import StoreIcon from "@mui/icons-material/Store";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface InvoiceItem {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  name?: string;
}

interface Invoice {
  id: number;
  user_id: number;
  total_amount: number;
  status: "pending" | "paid" | "cancelled";
  created_at: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  billing_street?: string;
  billing_zip?: string;
  billing_city?: string;
  billing_country?: string;
  items?: InvoiceItem[];
}

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  const token =
    typeof window !== "undefined"
      ? window.localStorage.getItem("auth_token")
      : null;

  useEffect(() => {
    const loadInvoice = async () => {
      setLoading(true);
      try {
        // Use account/orders/:id endpoint
        const res = await fetch(`${API_BASE}/account/orders/${orderId}`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        if (!res.ok) {
          throw new Error("Failed to load order");
        }
        const data = await res.json();
        setInvoice(data.data || data);
      } catch (err) {
        console.error("Error loading order:", err);
      } finally {
        setLoading(false);
      }
    };

    if (orderId && token) {
      loadInvoice();
    }
  }, [orderId, token]);

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (!invoice) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Typography>Order not found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#fafafa" }}>
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
        <Toolbar>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push("/account")}
            sx={{ color: "#1a1a1a", textTransform: "none" }}
          >
            Back to Account
          </Button>
          <StoreIcon sx={{ fontSize: 28, color: "#1a1a1a", ml: 2, mr: 1 }} />
          <Typography
            variant="h6"
            sx={{
              color: "#1a1a1a",
              fontWeight: 600,
              letterSpacing: "-0.5px",
            }}
          >
            Order Details
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography variant="h4" fontWeight={700} mb={4}>
          Order #{invoice.id}
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card
              elevation={0}
              sx={{
                p: 3,
                borderRadius: "16px",
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "white",
                mb: 3,
              }}
            >
              <Typography variant="h6" mb={2} fontWeight={600}>
                Order Information
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Order Date
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {new Date(invoice.created_at).toLocaleString()}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
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
                      mt: 0.5,
                    }}
                  />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Amount
                  </Typography>
                  <Typography variant="h5" color="primary" fontWeight={600}>
                    €{Number(invoice.total_amount).toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </Card>

            {(invoice.billing_street || invoice.billing_city) && (
              <Card
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: "16px",
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "white",
                }}
              >
                <Typography variant="h6" mb={2} fontWeight={600}>
                  Billing Address
                </Typography>
                <Typography variant="body1">
                  {invoice.first_name} {invoice.last_name}
                </Typography>
                {invoice.billing_street && (
                  <Typography variant="body1">{invoice.billing_street}</Typography>
                )}
                <Typography variant="body1">
                  {invoice.billing_zip} {invoice.billing_city}
                </Typography>
                {invoice.billing_country && (
                  <Typography variant="body1">{invoice.billing_country}</Typography>
                )}
              </Card>
            )}
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: "16px",
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "white",
              }}
            >
              <Typography variant="h6" mb={2} fontWeight={600}>
                Order Items
              </Typography>
              {invoice.items && invoice.items.length > 0 ? (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">Price</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {invoice.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.name || `Product #${item.product_id}`}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">
                          €{Number(item.unit_price).toFixed(2)}
                        </TableCell>
                        <TableCell align="right">
                          €{(Number(item.unit_price) * item.quantity).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={3} align="right">
                        <Typography variant="h6">Total:</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="h6">
                          €{Number(invoice.total_amount).toFixed(2)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No items found
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

