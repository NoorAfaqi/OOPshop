"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Chip,
  MenuItem,
  TablePagination,
  Skeleton,
  alpha,
  FormControl,
  Select,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PaymentIcon from "@mui/icons-material/Payment";
import { STORAGE_KEYS } from "@/lib/config/api.config";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Payment {
  id: number;
  invoice_id: number;
  user_id: number;
  amount: number;
  method: "paypal" | "card" | "cash" | "other";
  status: "pending" | "completed" | "failed";
  paypal_transaction_id?: string;
  created_at: string;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const token =
    typeof window !== "undefined"
      ? window.localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
      : null;

  const loadPayments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/payments`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      if (!res.ok) {
        throw new Error("Failed to load payments");
      }
      const data = await res.json();
      const paymentsList = Array.isArray(data) ? data : data.data || [];

      // Filter by search
      let filtered = paymentsList;
      if (search) {
        filtered = paymentsList.filter(
          (p: Payment) =>
            p.id.toString().includes(search) ||
            p.invoice_id.toString().includes(search) ||
            p.user_id.toString().includes(search) ||
            p.paypal_transaction_id?.includes(search)
        );
      }

      // Filter by status
      if (statusFilter !== "all") {
        filtered = filtered.filter((p: Payment) => p.status === statusFilter);
      }

      // Filter by method
      if (methodFilter !== "all") {
        filtered = filtered.filter((p: Payment) => p.method === methodFilter);
      }

      // Sort by date (newest first)
      filtered.sort(
        (a: Payment, b: Payment) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setPayments(filtered);
    } catch (err) {
      console.error("Error loading payments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter, methodFilter]);

  const paginatedPayments = payments.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 0.5 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: alpha("#fa709a", 0.1),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fa709a",
            }}
          >
            <PaymentIcon />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={600}>
              Payments
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Track and manage payment transactions
            </Typography>
          </Box>
        </Box>
      </Box>

      <Card sx={{ mb: 2 }}>
        <Box sx={{ p: 2, display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
          <TextField
            size="small"
            placeholder="Search payments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flex: 1, minWidth: 250 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="all">All Methods</MenuItem>
              <MenuItem value="paypal">PayPal</MenuItem>
              <MenuItem value="card">Card</MenuItem>
              <MenuItem value="cash">Cash</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Card>

      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Payment ID</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Invoice ID</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>User ID</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Amount</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Method</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Transaction ID</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton width={100} /></TableCell>
                    <TableCell align="right"><Skeleton width={80} /></TableCell>
                    <TableCell><Skeleton width={80} /></TableCell>
                    <TableCell><Skeleton width={80} /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                  </TableRow>
                ))
              : paginatedPayments.map((payment) => (
                  <TableRow
                    key={payment.id}
                    hover
                    sx={{
                      "&:hover": {
                        bgcolor: alpha("#667eea", 0.04),
                      },
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} color="primary.main">
                        #{payment.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        #{payment.invoice_id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        #{payment.user_id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={600}>
                        €{Number(payment.amount).toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={payment.method.charAt(0).toUpperCase() + payment.method.slice(1)}
                        size="small"
                        sx={{ borderRadius: 1, fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        size="small"
                        color={
                          payment.status === "completed"
                            ? "success"
                            : payment.status === "pending"
                            ? "warning"
                            : "error"
                        }
                        sx={{ borderRadius: 1, fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary" sx={{ fontFamily: "monospace", fontSize: "0.75rem" }}>
                        {payment.paypal_transaction_id || "—"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
            {!loading && paginatedPayments.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    {search || statusFilter !== "all" || methodFilter !== "all"
                      ? "No payments found matching your filters."
                      : "No payments yet."}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={payments.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50]}
        />
      </Card>
    </Box>
  );
}

