"use client";

import { useEffect, useState } from "react";
import { Box, Button, Container, Paper, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import StoreIcon from "@mui/icons-material/Store";
import { useRouter, useSearchParams } from "next/navigation";

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const invoiceId = searchParams.get("id");

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", display: "flex", alignItems: "center" }}>
      <Container maxWidth="sm">
        <Paper sx={{ p: 6, textAlign: "center" }}>
          <CheckCircleIcon sx={{ fontSize: 80, color: "success.main", mb: 2 }} />
          <Typography variant="h4" gutterBottom fontWeight={600}>
            Order Placed Successfully!
          </Typography>
          {invoiceId && (
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Invoice ID: {invoiceId}
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Thank you for your purchase. Your order has been processed.
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
            <Button
              variant="contained"
              onClick={() => router.push("/shop")}
              sx={{ borderRadius: 999 }}
            >
              Continue Shopping
            </Button>
            <Button
              variant="outlined"
              onClick={() => router.push("/")}
              sx={{ borderRadius: 999 }}
            >
              Back to Home
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

