"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  TextField,
  Typography,
  Alert,
  Grid,
  MenuItem,
} from "@mui/material";
import { useRouter, useParams } from "next/navigation";
import { STORAGE_KEYS } from "@/lib/config/api.config";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function EditInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [loadingInvoice, setLoadingInvoice] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"pending" | "paid" | "cancelled">("pending");

  const token =
    typeof window !== "undefined"
      ? window.localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
      : null;

  useEffect(() => {
    const loadInvoice = async () => {
      setLoadingInvoice(true);
      try {
        const res = await fetch(`${API_BASE}/invoices/${invoiceId}`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        if (!res.ok) {
          throw new Error("Failed to load invoice");
        }
        const data = await res.json();
        const invoice = Array.isArray(data) ? data[0] : data.data || data;
        setStatus(invoice.status || "pending");
      } catch (err) {
        setError("Failed to load invoice data");
      } finally {
        setLoadingInvoice(false);
      }
    };

    if (invoiceId) {
      loadInvoice();
    }
  }, [invoiceId, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/invoices/${invoiceId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update invoice");
      }

      router.push(`/dashboard/invoices/${invoiceId}`);
    } catch (err: any) {
      setError(err.message || "Failed to update invoice");
    } finally {
      setLoading(false);
    }
  };

  if (loadingInvoice) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.back()}
        sx={{ mb: 2 }}
      >
        Back
      </Button>

      <Typography variant="h5" fontWeight={600} mb={3}>
        Edit Invoice
      </Typography>

      <Card sx={{ p: 3, maxWidth: 600 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Status"
                select
                fullWidth
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as "pending" | "paid" | "cancelled")
                }
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="contained" disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Card>
    </Box>
  );
}

