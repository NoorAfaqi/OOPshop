"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Card,
  InputAdornment,
  Chip,
  Skeleton,
  alpha,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import InventoryIcon from "@mui/icons-material/Inventory";
import { useRouter } from "next/navigation";
import { STORAGE_KEYS } from "@/lib/config/api.config";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Product {
  id: number;
  name: string;
  price: number;
  brand: string | null;
  image_url: string | null;
  category: string | null;
  stock_quantity: number;
  open_food_facts_barcode?: string | null;
}

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [barcode, setBarcode] = useState("");
  const [form, setForm] = useState<Partial<Product>>({});
  const [saving, setSaving] = useState(false);

  const token =
    typeof window !== "undefined"
      ? window.localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
      : null;

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("q", search);
      const res = await fetch(`${API_BASE}/products?${params.toString()}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      const data = await res.json();
      setProducts(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreateDialog = () => {
    setForm({});
    setBarcode("");
    setDialogOpen(true);
  };

  const handleFetchFromBarcode = async () => {
    if (!barcode) return;
    try {
      const res = await fetch(`${API_BASE}/products/from-barcode`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ barcode }),
      });
      const data = await res.json();
      if (data.suggested) {
        setForm((prev) => ({ ...prev, ...data.suggested }));
      }
    } catch {
      // swallow small errors, user can fill manually
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          ...form,
          price: Number(form.price || 0),
          stock_quantity: Number(form.stock_quantity || 0),
        }),
      });
      if (res.ok) {
        setDialogOpen(false);
        await loadProducts();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this product?")) return;
    await fetch(`${API_BASE}/products/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
    await loadProducts();
  };

  const filteredProducts = products.filter((p) =>
    search
      ? p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.brand?.toLowerCase().includes(search.toLowerCase()) ||
        p.category?.toLowerCase().includes(search.toLowerCase())
      : true
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
              bgcolor: alpha("#667eea", 0.1),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "primary.main",
            }}
          >
            <InventoryIcon />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={600}>
              Products
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage your product inventory
            </Typography>
          </Box>
        </Box>
      </Box>

      <Card sx={{ mb: 2 }}>
        <Box sx={{ p: 2, display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
          <TextField
            size="small"
            placeholder="Search products..."
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
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            onClick={openCreateDialog}
            sx={{ borderRadius: 2 }}
          >
            Add Product
          </Button>
        </Box>
      </Card>

      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Brand</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Price</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Stock</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell align="right"><Skeleton /></TableCell>
                    <TableCell align="right"><Skeleton /></TableCell>
                    <TableCell align="center"><Skeleton width={100} /></TableCell>
                  </TableRow>
                ))
              : filteredProducts.map((p) => (
                  <TableRow
                    key={p.id}
                    hover
                    sx={{
                      "&:hover": {
                        bgcolor: alpha("#667eea", 0.04),
                      },
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {p.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {p.brand ? (
                        <Typography variant="body2" color="text.secondary">
                          {p.brand}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.disabled">
                          —
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {p.category ? (
                        <Chip label={p.category} size="small" sx={{ borderRadius: 1 }} />
                      ) : (
                        <Typography variant="body2" color="text.disabled">
                          —
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={600}>
                        €{Number(p.price).toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        label={p.stock_quantity}
                        size="small"
                        color={p.stock_quantity < 10 ? "error" : p.stock_quantity < 50 ? "warning" : "default"}
                        sx={{ borderRadius: 1, fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}>
                        <IconButton
                          size="small"
                          onClick={() => router.push(`/dashboard/products/${p.id}`)}
                          sx={{
                            color: "primary.main",
                            "&:hover": { bgcolor: alpha("#667eea", 0.1) },
                          }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => router.push(`/dashboard/products/${p.id}/edit`)}
                          sx={{
                            color: "text.secondary",
                            "&:hover": { bgcolor: alpha("#000", 0.05) },
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(p.id)}
                          sx={{
                            color: "error.main",
                            "&:hover": { bgcolor: alpha("#f5576c", 0.1) },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
            {!loading && filteredProducts.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    {search ? "No products found matching your search." : "No products yet. Add your first product to get started."}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: { borderRadius: 3 },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight={700}>
            Add New Product
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create a new product or fetch from barcode
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ display: "grid", gap: 2.5, mt: 1 }}>
          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              label="Barcode"
              size="small"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              fullWidth
            />
            <IconButton
              color="primary"
              onClick={handleFetchFromBarcode}
              sx={{ mt: 0.5 }}
            >
              <QrCodeScannerIcon />
            </IconButton>
          </Box>
          <TextField
            label="Name"
            size="small"
            value={form.name || ""}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            fullWidth
          />
          <TextField
            label="Brand"
            size="small"
            value={form.brand || ""}
            onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))}
            fullWidth
          />
          <TextField
            label="Category"
            size="small"
            value={form.category || ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, category: e.target.value }))
            }
            fullWidth
          />
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Price"
              type="number"
              size="small"
              value={form.price ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, price: Number(e.target.value) }))
              }
              fullWidth
            />
            <TextField
              label="Stock"
              type="number"
              size="small"
              value={form.stock_quantity ?? ""}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  stock_quantity: Number(e.target.value),
                }))
              }
              fullWidth
            />
          </Box>
          <TextField
            label="Image URL"
            size="small"
            value={form.image_url || ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, image_url: e.target.value }))
            }
            fullWidth
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            onClick={() => setDialogOpen(false)}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={saving}
            sx={{ borderRadius: 2 }}
          >
            {saving ? "Saving..." : "Create Product"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}


