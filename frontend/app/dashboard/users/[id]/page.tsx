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
  Divider,
} from "@mui/material";
import { useRouter, useParams } from "next/navigation";
import { STORAGE_KEYS } from "@/lib/config/api.config";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface User {
  id: number;
  email?: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: string;
  is_active: boolean;
  billing_street?: string;
  billing_zip?: string;
  billing_city?: string;
  billing_country?: string;
  created_at: string;
}

interface Invoice {
  id: number;
  total_amount: number;
  status: string;
  created_at: string;
  items?: string;
}

interface Payment {
  id: number;
  amount: number;
  method: string;
  status: string;
  created_at: string;
}

export default function UserDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const token =
    typeof window !== "undefined"
      ? window.localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
      : null;

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load user
        const userRes = await fetch(`${API_BASE}/users/${userId}`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(Array.isArray(userData) ? userData[0] : userData.data || userData);
        }

        // Load invoices
        const invoicesRes = await fetch(`${API_BASE}/users/${userId}/invoices`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        if (invoicesRes.ok) {
          const invoicesData = await invoicesRes.json();
          setInvoices(Array.isArray(invoicesData) ? invoicesData : invoicesData.data || []);
        }

        // Load payments
        const paymentsRes = await fetch(`${API_BASE}/users/${userId}/payments`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        if (paymentsRes.ok) {
          const paymentsData = await paymentsRes.json();
          setPayments(Array.isArray(paymentsData) ? paymentsData : paymentsData.data || []);
        }
      } catch (err) {
        console.error("Error loading user data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadData();
    }
  }, [userId, token]);

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (!user) {
    return <Typography>User not found</Typography>;
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
          onClick={() => router.push(`/dashboard/users/${userId}/edit`)}
        >
          Edit User
        </Button>
      </Box>

      <Typography variant="h5" fontWeight={600} mb={3}>
        User Details
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" mb={2}>
              Profile Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  First Name
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {user.first_name}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Last Name
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {user.last_name}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {user.email || "—"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Phone
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {user.phone || "—"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Role
                </Typography>
                <Chip
                  label={user.role}
                  size="small"
                  color={
                    user.role === "admin"
                      ? "error"
                      : user.role === "manager"
                      ? "primary"
                      : "default"
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
                <Chip
                  label={user.is_active ? "Active" : "Inactive"}
                  size="small"
                  color={user.is_active ? "success" : "default"}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Created
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {new Date(user.created_at).toLocaleString()}
                </Typography>
              </Grid>
            </Grid>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" mb={2}>
              Billing Address
            </Typography>
            {user.billing_street || user.billing_city ? (
              <Box>
                <Typography variant="body1">
                  {user.billing_street || ""}
                </Typography>
                <Typography variant="body1">
                  {user.billing_zip} {user.billing_city}
                </Typography>
                <Typography variant="body1">{user.billing_country}</Typography>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No billing address on file
              </Typography>
            )}
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" mb={2}>
              Purchase History
            </Typography>
            {invoices.length > 0 ? (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Invoice ID</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Items</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>#{invoice.id}</TableCell>
                      <TableCell>
                        {new Date(invoice.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{invoice.items || "Multiple items"}</TableCell>
                      <TableCell align="right">
                        €{Number(invoice.total_amount).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={invoice.status}
                          size="small"
                          color={
                            invoice.status === "paid"
                              ? "success"
                              : invoice.status === "pending"
                              ? "warning"
                              : "default"
                          }
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          onClick={() =>
                            router.push(`/dashboard/invoices/${invoice.id}`)
                          }
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No purchase history
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" mb={2}>
              Payment History
            </Typography>
            {payments.length > 0 ? (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Payment ID</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Method</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>#{payment.id}</TableCell>
                      <TableCell>
                        {new Date(payment.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{payment.method}</TableCell>
                      <TableCell align="right">
                        €{Number(payment.amount).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={payment.status}
                          size="small"
                          color={
                            payment.status === "completed"
                              ? "success"
                              : payment.status === "pending"
                              ? "warning"
                              : "error"
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No payment history
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

