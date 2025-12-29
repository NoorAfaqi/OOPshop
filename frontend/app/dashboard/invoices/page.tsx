"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  IconButton,
  Chip,
  MenuItem,
  TablePagination,
  Skeleton,
  alpha,
  FormControl,
  Select,
  InputAdornment,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import SortIcon from "@mui/icons-material/Sort";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import { useRouter } from "next/navigation";
import { STORAGE_KEYS } from "@/lib/config/api.config";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Invoice {
  id: number;
  user_id: number;
  total_amount: number;
  status: "pending" | "paid" | "cancelled" | "shipped";
  created_at: string;
  first_name?: string;
  last_name?: string;
  email?: string;
}

export default function InvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");

  const token =
    typeof window !== "undefined"
      ? window.localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
      : null;

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/invoices`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Unknown error" }));
        console.error("Invoice API Error:", {
          status: res.status,
          statusText: res.statusText,
          error: errorData,
        });
        throw new Error(errorData.message || `Failed to load invoices: ${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      const invoicesList = Array.isArray(data) ? data : data.data || [];
      
      // Filter by search
      let filtered = invoicesList;
      if (search) {
        const searchLower = search.toLowerCase();
        filtered = invoicesList.filter(
          (inv: Invoice) =>
            inv.id.toString().includes(search) ||
            `${inv.first_name} ${inv.last_name}`.toLowerCase().includes(searchLower) ||
            inv.email?.toLowerCase().includes(searchLower)
        );
      }

      // Filter by status
      if (statusFilter !== "all") {
        filtered = filtered.filter((inv: Invoice) => inv.status === statusFilter);
      }

      // Sort
      filtered.sort((a: Invoice, b: Invoice) => {
        if (sortBy === "date") {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        } else {
          return b.total_amount - a.total_amount;
        }
      });

      setInvoices(filtered);
    } catch (err) {
      console.error("Error loading invoices:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter, sortBy]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this invoice?")) return;
    try {
      await fetch(`${API_BASE}/invoices/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      await loadInvoices();
    } catch (err) {
      console.error("Error deleting invoice:", err);
      alert("Failed to delete invoice");
    }
  };

  const handleStatusUpdate = async (id: number, newStatus: string) => {
    try {
      const res = await fetch(`${API_BASE}/invoices/${id}`, {
        method: "PUT",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Unknown error" }));
        throw new Error(errorData.message || "Failed to update invoice status");
      }
      await loadInvoices();
    } catch (err) {
      console.error("Error updating invoice status:", err);
      alert(err instanceof Error ? err.message : "Failed to update invoice status");
    }
  };

  const paginatedInvoices = invoices.slice(
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
              bgcolor: alpha("#4facfe", 0.1),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#4facfe",
            }}
          >
            <ReceiptLongIcon />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={600}>
              Invoices
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage sales records and customer invoices
            </Typography>
          </Box>
        </Box>
      </Box>

      <Card sx={{ mb: 2 }}>
        <Box sx={{ p: 2, display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
          <TextField
            size="small"
            placeholder="Search invoices..."
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
              <MenuItem value="paid">Paid</MenuItem>
              <MenuItem value="shipped">Shipped</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "date" | "amount")}
              startAdornment={<SortIcon sx={{ mr: 1, fontSize: 18 }} />}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="date">Sort by Date</MenuItem>
              <MenuItem value="amount">Sort by Amount</MenuItem>
            </Select>
          </FormControl>
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            onClick={() => router.push("/dashboard/invoices/create")}
            sx={{ borderRadius: 2 }}
          >
            Create Invoice
          </Button>
        </Box>
      </Card>

      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Invoice ID</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Total</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton width={100} /></TableCell>
                    <TableCell align="right"><Skeleton width={80} /></TableCell>
                    <TableCell><Skeleton width={80} /></TableCell>
                    <TableCell align="center"><Skeleton width={100} /></TableCell>
                  </TableRow>
                ))
              : paginatedInvoices.map((invoice) => (
                  <TableRow
                    key={invoice.id}
                    hover
                    sx={{
                      "&:hover": {
                        bgcolor: alpha("#667eea", 0.04),
                      },
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} color="primary.main">
                        #{invoice.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {invoice.first_name && invoice.last_name
                          ? `${invoice.first_name} ${invoice.last_name}`
                          : `User #${invoice.user_id}`}
                      </Typography>
                      {invoice.email && (
                        <Typography variant="caption" color="text.secondary">
                          {invoice.email}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(invoice.created_at).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={600}>
                        €{Number(invoice.total_amount).toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        size="small"
                        color={
                          invoice.status === "paid"
                            ? "success"
                            : invoice.status === "shipped"
                            ? "info"
                            : invoice.status === "pending"
                            ? "warning"
                            : "default"
                        }
                        sx={{ borderRadius: 1, fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}>
                        <IconButton
                          size="small"
                          onClick={() => router.push(`/dashboard/invoices/${invoice.id}`)}
                          sx={{
                            color: "primary.main",
                            "&:hover": { bgcolor: alpha("#667eea", 0.1) },
                          }}
                          title="View invoice"
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        {invoice.status === "paid" && (
                          <IconButton
                            size="small"
                            onClick={() => handleStatusUpdate(invoice.id, "shipped")}
                            sx={{
                              color: "info.main",
                              "&:hover": { bgcolor: alpha("#2196f3", 0.1) },
                            }}
                            title="Mark as shipped"
                          >
                            <LocalShippingIcon fontSize="small" />
                          </IconButton>
                        )}
                        <IconButton
                          size="small"
                          onClick={() => router.push(`/dashboard/invoices/${invoice.id}/edit`)}
                          sx={{
                            color: "text.secondary",
                            "&:hover": { bgcolor: alpha("#000", 0.05) },
                          }}
                          title="Edit invoice"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(invoice.id)}
                          sx={{
                            color: "error.main",
                            "&:hover": { bgcolor: alpha("#f5576c", 0.1) },
                          }}
                          title="Delete invoice"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
            {!loading && paginatedInvoices.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    {search || statusFilter !== "all"
                      ? "No invoices found matching your filters."
                      : "No invoices yet. Create your first invoice to get started."}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={invoices.length}
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

