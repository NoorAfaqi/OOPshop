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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Autocomplete,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { STORAGE_KEYS } from "@/lib/config/api.config";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Product {
  id: number;
  name: string;
  price: number;
  stock_quantity: number;
}

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email?: string;
}

interface InvoiceItem {
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
}

export default function CreateInvoicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState("1");

  const token =
    typeof window !== "undefined"
      ? window.localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
      : null;

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load users
        const usersRes = await fetch(`${API_BASE}/users`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUsers(Array.isArray(usersData) ? usersData : usersData.data || []);
        }

        // Load products
        const productsRes = await fetch(`${API_BASE}/products`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        if (productsRes.ok) {
          const productsData = await productsRes.json();
          setProducts(Array.isArray(productsData) ? productsData : productsData.data || []);
        }
      } catch (err) {
        console.error("Error loading data:", err);
      }
    };

    loadData();
  }, [token]);

  const addItem = () => {
    if (!selectedProduct || !quantity || Number(quantity) <= 0) {
      setError("Please select a product and enter a valid quantity");
      return;
    }

    if (selectedProduct.stock_quantity < Number(quantity)) {
      setError(`Insufficient stock. Available: ${selectedProduct.stock_quantity}`);
      return;
    }

    const existingIndex = items.findIndex(
      (item) => item.product_id === selectedProduct.id
    );

    if (existingIndex >= 0) {
      const updated = [...items];
      updated[existingIndex].quantity += Number(quantity);
      setItems(updated);
    } else {
      setItems([
        ...items,
        {
          product_id: selectedProduct.id,
          product_name: selectedProduct.name,
          quantity: Number(quantity),
          unit_price: Number(selectedProduct.price),
        },
      ]);
    }

    setSelectedProduct(null);
    setQuantity("1");
    setError(null);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const total = items.reduce(
    (sum, item) => sum + Number(item.unit_price) * Number(item.quantity),
    0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!selectedUserId) {
      setError("Please select a customer");
      setLoading(false);
      return;
    }

    if (items.length === 0) {
      setError("Please add at least one product");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/invoices`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          user_id: selectedUserId,
          items: items.map((item) => ({
            product_id: item.product_id,
            quantity: item.quantity,
          })),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create invoice");
      }

      router.push("/dashboard/invoices");
    } catch (err: any) {
      setError(err.message || "Failed to create invoice");
    } finally {
      setLoading(false);
    }
  };

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
        Create New Invoice
      </Typography>

      <Card sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Autocomplete
                options={users}
                getOptionLabel={(option) =>
                  `${option.first_name} ${option.last_name}${option.email ? ` (${option.email})` : ""}`
                }
                value={users.find((u) => u.id === selectedUserId) || null}
                onChange={(_, newValue) =>
                  setSelectedUserId(newValue ? newValue.id : null)
                }
                renderInput={(params) => (
                  <TextField {...params} label="Customer" required />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                Add Products
              </Typography>
              <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                <Autocomplete
                  options={products.filter(
                    (p) => p.stock_quantity > 0 && !items.find((i) => i.product_id === p.id)
                  )}
                  getOptionLabel={(option) => `${option.name} - €${Number(option.price).toFixed(2)}`}
                  value={selectedProduct}
                  onChange={(_, newValue) => setSelectedProduct(newValue)}
                  sx={{ flex: 1 }}
                  renderInput={(params) => (
                    <TextField {...params} label="Product" />
                  )}
                />
                <TextField
                  label="Quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  inputProps={{ min: 1 }}
                  sx={{ width: 120 }}
                />
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={addItem}
                  disabled={!selectedProduct}
                >
                  Add
                </Button>
              </Box>
            </Grid>

            {items.length > 0 && (
              <Grid size={{ xs: 12 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">Unit Price</TableCell>
                      <TableCell align="right">Total</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.product_name}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">
                          €{Number(item.unit_price).toFixed(2)}
                        </TableCell>
                        <TableCell align="right">
                          €{(Number(item.unit_price) * Number(item.quantity)).toFixed(2)}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={() => removeItem(index)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={3} align="right">
                        <Typography variant="h6">Total:</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="h6">
                          €{total.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  </TableBody>
                </Table>
              </Grid>
            )}

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
                  {loading ? "Creating..." : "Create Invoice"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Card>
    </Box>
  );
}

