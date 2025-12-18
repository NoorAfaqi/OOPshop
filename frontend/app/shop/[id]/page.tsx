"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  Chip,
  Container,
  Grid,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Badge,
  Paper,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import StoreIcon from "@mui/icons-material/Store";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface Product {
  id: number;
  name: string;
  price: number;
  brand: string | null;
  image_url: string | null;
  category: string | null;
  stock_quantity: number;
  nutritional_info: any;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("cart");
      if (saved) {
        try {
          setCart(JSON.parse(saved));
        } catch {}
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart]);

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/products/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
        }
      } finally {
        setLoading(false);
      }
    };
    if (params.id) {
      loadProduct();
    }
  }, [params.id]);

  const addToCart = () => {
    if (!product) return;
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    router.push("/cart");
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (!product) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Typography>Product not found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(15,23,42,0.06)",
        }}
      >
        <Toolbar>
          <IconButton onClick={() => router.push("/shop")} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <StoreIcon sx={{ mr: 1, color: "primary.main" }} />
          <Typography
            variant="h6"
            sx={{ flexGrow: 1, color: "text.primary", fontWeight: 600 }}
          >
            OOP Shop
          </Typography>
          <IconButton onClick={() => router.push("/cart")}>
            <Badge badgeContent={cartCount} color="primary">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                p: 2,
                borderRadius: 3,
                bgcolor: "grey.50",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 400,
              }}
            >
              {product.image_url ? (
                <Box sx={{ position: "relative", width: "100%", height: 400 }}>
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    style={{ objectFit: "contain" }}
                  />
                </Box>
              ) : (
                <StoreIcon sx={{ fontSize: 120, color: "grey.400" }} />
              )}
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
                {product.name}
              </Typography>
              {product.brand && (
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {product.brand}
                </Typography>
              )}
              {product.category && (
                <Chip
                  label={product.category}
                  sx={{ mb: 3, borderRadius: 999 }}
                />
              )}
              <Typography variant="h3" color="primary.main" sx={{ mb: 3, fontWeight: 600 }}>
                €{Number(product.price).toFixed(2)}
              </Typography>
              <Typography variant="body1" paragraph>
                {product.stock_quantity > 0
                  ? `In stock: ${product.stock_quantity} units`
                  : "Out of stock"}
              </Typography>
              {product.nutritional_info && (
                <Paper sx={{ p: 2, mt: 3, bgcolor: "grey.50" }}>
                  <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                    Nutritional Information
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {JSON.stringify(product.nutritional_info, null, 2)}
                  </Typography>
                </Paper>
              )}
              <Box sx={{ mt: 4, display: "flex", gap: 2, alignItems: "center" }}>
                <Button
                  variant="outlined"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </Button>
                <Typography variant="h6">{quantity}</Typography>
                <Button
                  variant="outlined"
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={quantity >= product.stock_quantity}
                >
                  +
                </Button>
                <Button
                  variant="contained"
                  size="large"
                  onClick={addToCart}
                  disabled={product.stock_quantity === 0}
                  sx={{ flexGrow: 1, borderRadius: 999 }}
                >
                  Add to Cart
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

