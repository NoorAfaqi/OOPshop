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
} from "@mui/material";
import { useRouter, useParams } from "next/navigation";
import { STORAGE_KEYS } from "@/lib/config/api.config";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [barcode, setBarcode] = useState("");
  const [form, setForm] = useState({
    name: "",
    price: "",
    brand: "",
    category: "",
    image_url: "",
    stock_quantity: "",
  });

  const token =
    typeof window !== "undefined"
      ? window.localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
      : null;

  useEffect(() => {
    const loadProduct = async () => {
      setLoadingProduct(true);
      try {
        const res = await fetch(`${API_BASE}/products/${productId}`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        if (!res.ok) {
          throw new Error("Failed to load product");
        }
        const data = await res.json();
        const product = Array.isArray(data) ? data[0] : data.data || data;
        setForm({
          name: product.name || "",
          price: product.price?.toString() || "",
          brand: product.brand || "",
          category: product.category || "",
          image_url: product.image_url || "",
          stock_quantity: product.stock_quantity?.toString() || "",
        });
        setBarcode(product.open_food_facts_barcode || "");
      } catch (err) {
        setError("Failed to load product data");
      } finally {
        setLoadingProduct(false);
      }
    };

    if (productId) {
      loadProduct();
    }
  }, [productId, token]);

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
        setForm((prev) => ({
          ...prev,
          ...data.suggested,
          price: data.suggested.price?.toString() || prev.price,
          stock_quantity: prev.stock_quantity, // Keep existing stock
        }));
      }
    } catch {
      // swallow errors, user can fill manually
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!form.name || !form.price) {
      setError("Name and price are required");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          stock_quantity: Number(form.stock_quantity) || 0,
          open_food_facts_barcode: barcode || undefined,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update product");
      }

      router.push(`/dashboard/products/${productId}`);
    } catch (err: any) {
      setError(err.message || "Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  if (loadingProduct) {
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
        Edit Product
      </Typography>

      <Card sx={{ p: 3, maxWidth: 800 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
            <TextField
              label="Barcode"
              size="small"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              fullWidth
            />
            <Button
              variant="outlined"
              startIcon={<QrCodeScannerIcon />}
              onClick={handleFetchFromBarcode}
              sx={{ mt: 0.5 }}
            >
              Refresh
            </Button>
          </Box>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Name"
                required
                fullWidth
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Brand"
                fullWidth
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Category"
                fullWidth
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value })
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Price"
                type="number"
                required
                fullWidth
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                inputProps={{ step: "0.01", min: "0" }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Stock Quantity"
                type="number"
                fullWidth
                value={form.stock_quantity}
                onChange={(e) =>
                  setForm({ ...form, stock_quantity: e.target.value })
                }
                inputProps={{ min: "0" }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Image URL"
                fullWidth
                value={form.image_url}
                onChange={(e) =>
                  setForm({ ...form, image_url: e.target.value })
                }
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
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

