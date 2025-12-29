"use client";

import { useEffect, useState, Suspense } from "react";
import { Box, Button, Container, Paper, Typography, AppBar, Toolbar, alpha, Card, Grid } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import StoreIcon from "@mui/icons-material/Store";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import { useRouter, useSearchParams } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function CheckoutSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const invoiceId = searchParams.get("id");
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (invoiceId) {
      const loadInvoice = async () => {
        setLoading(true);
        try {
          const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
          const res = await fetch(`${API_BASE}/invoices/${invoiceId}`, {
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
            },
          });
          if (res.ok) {
            const data = await res.json();
            setInvoice(Array.isArray(data) ? data[0] : data.data || data);
          }
        } catch (err) {
          console.error("Error loading invoice:", err);
        } finally {
          setLoading(false);
        }
      };
      loadInvoice();
    }
  }, [invoiceId]);

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
          <StoreIcon sx={{ fontSize: 28, color: "#1a1a1a", mr: 1 }} />
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
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: "center",
            borderRadius: "16px",
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "white",
          }}
        >
          <Box
            sx={{
              width: 100,
              height: 100,
              borderRadius: "50%",
              bgcolor: alpha("#4caf50", 0.1),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 3,
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 60, color: "#4caf50" }} />
          </Box>
          <Typography variant="h4" gutterBottom fontWeight={700} sx={{ mb: 2 }}>
            Order Placed Successfully!
          </Typography>
          {invoiceId && (
            <Typography variant="h6" color="text.secondary" gutterBottom sx={{ mb: 1 }}>
              Order #{invoiceId}
            </Typography>
          )}
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Thank you for your purchase. Your order has been processed and you will receive a confirmation email shortly.
          </Typography>

          {invoice && (
            <Card
              elevation={0}
              sx={{
                p: 3,
                mb: 4,
                bgcolor: alpha("#667eea", 0.05),
                borderRadius: "12px",
                textAlign: "left",
              }}
            >
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Total Amount
                  </Typography>
                  <Typography variant="h5" color="primary" fontWeight={600}>
                    €{Number(invoice.total_amount).toFixed(2)}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Order Date
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {new Date(invoice.created_at).toLocaleDateString()}
                  </Typography>
                </Grid>
              </Grid>
            </Card>
          )}

          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <Button
              variant="contained"
              startIcon={<ShoppingBagIcon />}
              onClick={() => router.push("/shop")}
              sx={{
                bgcolor: "#667eea",
                borderRadius: "10px",
                textTransform: "none",
                px: 4,
                py: 1.2,
                "&:hover": {
                  bgcolor: "#5568d3",
                },
              }}
            >
              Continue Shopping
            </Button>
            <Button
              variant="outlined"
              onClick={() => router.push("/account")}
              sx={{
                borderRadius: "10px",
                textTransform: "none",
                px: 4,
                py: 1.2,
              }}
            >
              View Orders
            </Button>
            <Button
              variant="text"
              onClick={() => router.push("/")}
              sx={{
                textTransform: "none",
              }}
            >
              Back to Home
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Typography>Loading...</Typography>
      </Box>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  );
}

