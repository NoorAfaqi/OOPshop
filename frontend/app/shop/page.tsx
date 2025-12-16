"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
  Container,
  TextField,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Badge,
  Alert,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import StoreIcon from "@mui/icons-material/Store";
import { useRouter } from "next/navigation";
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
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function ShopPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [error, setError] = useState<string | null>(null);

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

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.set("q", search);
      params.set("available", "true");
      const res = await fetch(`${API_BASE}/products?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch products: ${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      setProducts(data);
    } catch (error: any) {
      console.error("Error loading products:", error);
      setError(error.message || "Failed to load products. Please ensure the backend server is running.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

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
          <StoreIcon sx={{ mr: 1, color: "primary.main" }} />
          <Typography
            variant="h6"
            sx={{ flexGrow: 1, color: "text.primary", fontWeight: 600 }}
          >
            OOP Shop
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={() => router.push("/login")}
            sx={{ mr: 2, borderRadius: 999 }}
          >
            Manager Login
          </Button>
          <IconButton onClick={() => router.push("/cart")}>
            <Badge badgeContent={cartCount} color="primary">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
            Shop Products
          </Typography>
          <TextField
            fullWidth
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />,
            }}
            sx={{ maxWidth: 500 }}
          />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        {loading ? (
          <Typography>Loading...</Typography>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
                lg: "repeat(4, 1fr)",
              },
              gap: 3,
            }}
          >
            {products.map((product) => (
              <Box key={product.id}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 3,
                    overflow: "hidden",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: 4,
                    },
                  }}
                >
                  <CardActionArea
                    onClick={() => router.push(`/shop/${product.id}`)}
                    sx={{ flexGrow: 1, display: "flex", flexDirection: "column", alignItems: "stretch" }}
                  >
                    <Box
                      sx={{
                        width: "100%",
                        height: 200,
                        position: "relative",
                        bgcolor: "grey.100",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          fill
                          style={{ objectFit: "cover" }}
                        />
                      ) : (
                        <StoreIcon sx={{ fontSize: 64, color: "grey.400" }} />
                      )}
                    </Box>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" component="h3" gutterBottom noWrap>
                        {product.name}
                      </Typography>
                      {product.brand && (
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {product.brand}
                        </Typography>
                      )}
                      {product.category && (
                        <Chip
                          label={product.category}
                          size="small"
                          sx={{ mb: 1, borderRadius: 999 }}
                        />
                      )}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mt: 2,
                        }}
                      >
                        <Typography variant="h6" color="primary.main" fontWeight={600}>
                          €{Number(product.price).toFixed(2)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {product.stock_quantity > 0
                            ? `${product.stock_quantity} in stock`
                            : "Out of stock"}
                        </Typography>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                  <Box sx={{ p: 2, pt: 0 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product);
                      }}
                      disabled={product.stock_quantity === 0}
                      sx={{ borderRadius: 999 }}
                    >
                      Add to Cart
                    </Button>
                  </Box>
                </Card>
              </Box>
            ))}
            {!loading && products.length === 0 && (
              <Box sx={{ textAlign: "center", py: 8, gridColumn: "1 / -1" }}>
                <Typography variant="h6" color="text.secondary">
                  No products found
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Container>
    </Box>
  );
}

