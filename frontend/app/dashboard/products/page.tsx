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
  Toolbar,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import DeleteIcon from "@mui/icons-material/Delete";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

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
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [barcode, setBarcode] = useState("");
  const [form, setForm] = useState<Partial<Product>>({});
  const [saving, setSaving] = useState(false);

  const token =
    typeof window !== "undefined"
      ? window.localStorage.getItem("token")
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

  return (
    <Box>
      <Toolbar disableGutters sx={{ mb: 2, justifyContent: "space-between" }}>
        <Typography variant="h5" fontWeight={600}>
          Products
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField
            size="small"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1 }} />,
            }}
          />
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            onClick={openCreateDialog}
          >
            New
          </Button>
        </Box>
      </Toolbar>
      <Paper>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Brand</TableCell>
              <TableCell>Category</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell align="right">Stock</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id} hover>
                <TableCell>{p.name}</TableCell>
                <TableCell>{p.brand}</TableCell>
                <TableCell>{p.category}</TableCell>
                <TableCell align="right">
                  €{Number(p.price).toFixed(2)}
                </TableCell>
                <TableCell align="right">{p.stock_quantity}</TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(p.id)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {!loading && products.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="text.secondary">
                    No products yet.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>New product</DialogTitle>
        <DialogContent sx={{ display: "grid", gap: 2, mt: 1 }}>
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
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}


