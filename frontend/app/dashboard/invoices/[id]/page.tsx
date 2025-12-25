"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  Typography,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import { useRouter, useParams } from "next/navigation";
import { STORAGE_KEYS } from "@/lib/config/api.config";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";

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

export default function InvoiceDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  const token =
    typeof window !== "undefined"
      ? window.localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
      : null;

  useEffect(() => {
    const loadInvoice = async () => {
      setLoading(true);
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
        setInvoice(Array.isArray(data) ? data[0] : data.data || data);
      } catch (err) {
        console.error("Error loading invoice:", err);
      } finally {
        setLoading(false);
      }
    };

    if (invoiceId) {
      loadInvoice();
    }
  }, [invoiceId, token]);

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (!invoice) {
    return <Typography>Invoice not found</Typography>;
  }

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.back()}
        >
          Back
        </Button>
        <Button
          startIcon={<EditIcon />}
          variant="contained"
          onClick={() => router.push(`/dashboard/invoices/${invoiceId}/edit`)}
        >
          Edit Invoice
        </Button>
      </Box>

      <Typography variant="h5" fontWeight={600} mb={3}>
        Invoice #{invoice.id}
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" mb={2}>
              Customer Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Name
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {invoice.first_name && invoice.last_name
                    ? `${invoice.first_name} ${invoice.last_name}`
                    : `User #${invoice.user_id}`}
                </Typography>
              </Grid>
              {invoice.email && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {invoice.email}
                  </Typography>
                </Grid>
              )}
              {invoice.phone && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Phone
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {invoice.phone}
                  </Typography>
                </Grid>
              )}
              {(invoice.billing_street || invoice.billing_city) && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Billing Address
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {invoice.billing_street}
                    <br />
                    {invoice.billing_zip} {invoice.billing_city}
                    <br />
                    {invoice.billing_country}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" mb={2}>
              Invoice Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Invoice ID
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  #{invoice.id}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Date
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {new Date(invoice.created_at).toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
                <Chip
                  label={invoice.status.toUpperCase()}
                  size="small"
                  color={
                    invoice.status === "paid"
                      ? "success"
                      : invoice.status === "pending"
                      ? "warning"
                      : "default"
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Total Amount
                </Typography>
                <Typography variant="h5" color="primary" fontWeight={600}>
                  €{Number(invoice.total_amount).toFixed(2)}
                </Typography>
              </Grid>
            </Grid>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" mb={2}>
              Items
            </Typography>
            {invoice.items && invoice.items.length > 0 ? (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">Unit Price</TableCell>
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
    </Box>
  );
}

